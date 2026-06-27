"""Per-room controller and units (the room + its groups).

A RoomController is the runtime "brain" behind one config entry. It exposes a
list of *units*: the room itself plus one unit per group. Every unit behaves the
same way:

  * a ``switch.homex_{slug}_lights_toggle`` holding its on/off state,
  * a ``light.homex_{slug}_lights`` aggregating its devices,
  * two native scenes ``room_lights_{slug}_turn_on`` / ``_turn_off`` seeded in
    ``scenes.yaml`` (and edited by the user in the HA scene editor),
  * a small automation: when one of the unit's triggers fires, the matching
    scene is applied depending on the unit's switch state.

For the room, ``slug`` is the room id; for a group it is ``{room_id}_{group_id}``.

The switch/light platforms read the controller from ``hass.data`` and build one
entity per unit.
"""

from __future__ import annotations

import asyncio
import logging
import os
from collections import deque

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Context, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.trigger import (
    async_initialize_triggers,
    async_validate_trigger_config,
)
from homeassistant.util.yaml import load_yaml, save_yaml


def normalize_trigger_specs(raw) -> list[dict]:
    """Return the stored triggers as a list of raw HA trigger config dicts.

    Triggers are now exactly what the automation editor produces (e.g.
    ``{"trigger": "state", ...}``). Non-dict entries are dropped.
    """
    return [dict(item) for item in (raw or []) if isinstance(item, dict)]


def device_action_label(trigger) -> str:
    """Human label for a device-automation trigger (its 'action')."""
    if not isinstance(trigger, dict):
        return ""
    return str(trigger.get("subtype") or trigger.get("type") or "")


def remove_scene_entities(hass: HomeAssistant, scene_ids) -> None:
    """Remove native scene entities (resolved by scene id) from the registry.

    Native scenes use the ``homeassistant`` platform with the scene id as their
    unique id. Dropping them from scenes.yaml only makes the entity unavailable;
    it must be removed from the registry too, or it lingers as a restored entity.
    """
    registry = er.async_get(hass)
    for scene_id in scene_ids:
        entity_id = registry.async_get_entity_id("scene", "homeassistant", scene_id)
        if entity_id and registry.async_get(entity_id):
            registry.async_remove(entity_id)

from .const import (
    CONF_AREA_ID,
    CONF_DEVICES,
    CONF_GROUP_ID,
    CONF_GROUP_NAME,
    CONF_GROUPS,
    CONF_ROOM_ID,
    CONF_ROOM_NAME,
    CONF_SCENE_STRATEGY,
    CONF_SCENE_TRIGGERS,
    CONF_DIM_DOWN_TRIGGERS,
    CONF_DIM_UP_TRIGGERS,
    CONF_SCENES,
    CONF_TRIGGERS,
    DIM_STEP,
    DOMAIN,
    HOMEX_LABEL,
    SCENES_FILE,
    SCENES_LOCK,
    STRATEGY_RECALL_FIRST,
    STRATEGY_RECALL_LAST,
)

_LOGGER = logging.getLogger(__name__)

ROOM_KEY = "room"


class Unit:
    """The room or one of its groups: a switch + light group + two scenes."""

    def __init__(
        self,
        controller: "RoomController",
        key: str,
        name: str,
        devices: list[str],
        triggers: list[str],
    ) -> None:
        self._controller = controller
        self.hass = controller.hass
        self.room_id = controller.room_id
        self.key = key  # "room" or the group_id
        self.is_room = key == ROOM_KEY
        self.name = name
        self.devices = list(devices or [])
        self.triggers = list(triggers or [])
        self._unsubs: list = []

    # -- Identity -----------------------------------------------------------

    @property
    def slug(self) -> str:
        return self.room_id if self.is_room else f"{self.room_id}_{self.key}"

    @property
    def switch_entity_id(self) -> str:
        return f"switch.homex_{self.slug}_lights_toggle"

    @property
    def switch_name(self) -> str:
        """Friendly name: HX - {room} - toggle lights [- via the group name]."""
        room = self._controller.room_name
        if self.is_room:
            return f"HX - {room} - toggle lights"
        return f"HX - {room} - {self.name} - toggle lights"

    @property
    def light_entity_id(self) -> str:
        return f"light.homex_{self.slug}_lights"

    @property
    def light_name(self) -> str:
        """Friendly name: HX - {room} - lights [- via the group name]."""
        room = self._controller.room_name
        if self.is_room:
            return f"HX - {room} - lights"
        return f"HX - {room} - {self.name} - lights"

    @property
    def scene_on_entity_id(self) -> str:
        # Resolved from the stable scene id: the scene's name (hence entity_id)
        # may be a pretty label, so we never hardcode the entity_id.
        return self._controller.scene_entity_id(f"homex_{self.slug}_turn_on")

    @property
    def scene_off_entity_id(self) -> str:
        return self._controller.scene_entity_id(f"homex_{self.slug}_turn_off")

    @property
    def switch_unique_id(self) -> str:
        # Based on the slug (room_id [+ group_id]) so it is unique per room even
        # though every room now shares the single Homex hub config entry.
        return f"homex_{self.slug}_lights_toggle"

    @property
    def light_unique_id(self) -> str:
        return f"homex_{self.slug}_lights"

    def scene_seeds(self) -> list[tuple[str, str, str]]:
        """(scene_id, scene_name, default_state) for each of the two scenes."""
        return [
            (f"homex_{self.slug}_turn_on", f"homex_{self.slug}_turn_on", "on"),
            (f"homex_{self.slug}_turn_off", f"homex_{self.slug}_turn_off", "off"),
        ]

    # -- Scenes -------------------------------------------------------------

    def _is_on(self) -> bool:
        state = self.hass.states.get(self.switch_entity_id)
        return state is not None and state.state == "on"

    async def _activate(self, scene_entity_id: str) -> None:
        await self.hass.services.async_call(
            "scene",
            "turn_on",
            {"entity_id": scene_entity_id},
            blocking=False,
            context=self._controller.new_context(),
        )

    async def apply_on(self) -> None:
        _LOGGER.debug("[%s] activating %s", self.slug, self.scene_on_entity_id)
        await self._activate(self.scene_on_entity_id)

    async def apply_off(self) -> None:
        _LOGGER.debug("[%s] activating %s", self.slug, self.scene_off_entity_id)
        await self._activate(self.scene_off_entity_id)

    @property
    def child_switch_ids(self) -> list[str]:
        """Group switches under this unit (only the room has children)."""
        if not self.is_room:
            return []
        return [
            u.switch_entity_id for u in self._controller.units if not u.is_room
        ]

    async def turn_off_children(self) -> None:
        """Turn off every sub-group switch (each applies its turn_off scene)."""
        children = self.child_switch_ids
        if children:
            await self.hass.services.async_call(
                "switch",
                "turn_off",
                {"entity_id": children},
                blocking=False,
                context=self._controller.new_context(),
            )

    # -- Automation ---------------------------------------------------------

    @property
    def trigger_specs(self) -> list[dict]:
        """Group triggers as normalized specs (entity or device-action)."""
        return normalize_trigger_specs(self.triggers)

    @callback
    def _on_trigger(self, run_variables=None, context: Context | None = None) -> None:
        """A trigger fired: TOGGLE the group via its switch.

        The group's switch (a RestoreEntity) persists its on/off state, so
        toggling flips it and applies the opposite scene — instead of just
        re-applying the current state.
        """
        # Ignore triggers caused by Homex's own scene/switch actions.
        if self._controller.is_self_context(context):
            return
        self.hass.async_create_task(
            self.hass.services.async_call(
                "switch",
                "toggle",
                {"entity_id": self.switch_entity_id},
                context=self._controller.new_context(),
            )
        )

    async def async_start(self) -> None:
        """Wire the group's triggers (entity state + device action) natively."""
        self.stop()
        configs = await self._controller.build_trigger_configs(self.trigger_specs)
        if configs:
            unsub = await async_initialize_triggers(
                self.hass,
                configs,
                self._on_trigger,
                DOMAIN,
                f"homex {self.slug}",
                _LOGGER.log,
            )
            if unsub:
                self._unsubs.append(unsub)

    def stop(self) -> None:
        while self._unsubs:
            self._unsubs.pop()()


class RoomController:
    """Runtime logic for a single Homex room and its groups."""

    def __init__(
        self, hass: HomeAssistant, entry: ConfigEntry, cfg: dict
    ) -> None:
        self.hass = hass
        self.entry = entry  # the single Homex hub entry (for the scenes lock)
        self._cfg_dict = dict(cfg or {})
        self._units: list[Unit] | None = None
        # Room-level trigger handling (toggle + scene switching).
        self._room_unsubs: list = []
        self._room_switch = None  # bound RoomSwitch entity
        self._last_scene_key: str | None = None  # memorized scene (persists off)
        self._active_scene_key: str | None = None  # current scene while on
        # Contexts of our own service calls, so triggers fired by the state
        # changes WE cause are ignored (otherwise scene->device->trigger loops).
        self._ctx_ids: set[str] = set()
        self._ctx_order: deque[str] = deque(maxlen=256)

    # -- Self-action context tracking (loop prevention) ---------------------

    def new_context(self) -> Context:
        """A fresh context tagged as Homex-originated (remembered)."""
        context = Context()
        if len(self._ctx_order) == self._ctx_order.maxlen and self._ctx_order:
            self._ctx_ids.discard(self._ctx_order[0])
        self._ctx_order.append(context.id)
        self._ctx_ids.add(context.id)
        return context

    def is_self_context(self, context: Context | None) -> bool:
        """True if this context (or its parent) came from a Homex action."""
        if context is None:
            return False
        return context.id in self._ctx_ids or context.parent_id in self._ctx_ids

    # -- Config accessors (read from this room's config dict) ---------------

    def _cfg(self, key, default=None):
        return self._cfg_dict.get(key, default)

    @property
    def room_id(self) -> str:
        return self._cfg(CONF_ROOM_ID)

    @property
    def room_name(self) -> str:
        return self._cfg(CONF_ROOM_NAME)

    @property
    def area_id(self) -> str | None:
        return self._cfg(CONF_AREA_ID) or None

    @property
    def devices(self) -> list[str]:
        return list(self._cfg(CONF_DEVICES, []) or [])

    @property
    def triggers(self) -> list:
        """Raw toggle trigger list (entity ids and/or {device_id, action})."""
        return list(self._cfg(CONF_TRIGGERS, []) or [])

    @property
    def scene_triggers(self) -> list:
        return list(self._cfg(CONF_SCENE_TRIGGERS, []) or [])

    @property
    def trigger_specs(self) -> list[dict]:
        """Toggle triggers as normalized specs (entity or device-action)."""
        return normalize_trigger_specs(self._cfg(CONF_TRIGGERS, []))

    @property
    def scene_trigger_specs(self) -> list[dict]:
        return normalize_trigger_specs(self._cfg(CONF_SCENE_TRIGGERS, []))

    @property
    def dim_up_trigger_specs(self) -> list[dict]:
        return normalize_trigger_specs(self._cfg(CONF_DIM_UP_TRIGGERS, []))

    @property
    def dim_down_trigger_specs(self) -> list[dict]:
        return normalize_trigger_specs(self._cfg(CONF_DIM_DOWN_TRIGGERS, []))

    async def build_trigger_configs(self, specs: list[dict]) -> list[dict]:
        """Validate raw HA trigger configs (as produced by the automation editor).

        Triggers are stored exactly like automation triggers, so we just run
        them through HA's own validator before wiring them.
        """
        if not specs:
            return []
        try:
            return await async_validate_trigger_config(self.hass, list(specs))
        except Exception as err:  # noqa: BLE001 - bad/incomplete trigger config
            _LOGGER.error(
                "[%s] invalid trigger configuration, ignoring: %s",
                self.room_id,
                err,
            )
            return []

    @property
    def scene_strategy(self) -> str:
        value = self._cfg(CONF_SCENE_STRATEGY, STRATEGY_RECALL_FIRST)
        return value if value in (STRATEGY_RECALL_FIRST, STRATEGY_RECALL_LAST) else STRATEGY_RECALL_FIRST

    @property
    def room_switch_entity_id(self) -> str:
        return f"switch.homex_{self.room_id}_lights_toggle"

    @property
    def group_switch_ids(self) -> list[str]:
        """Switch entity ids of the room's groups."""
        return [u.switch_entity_id for u in self.units if not u.is_room]

    @property
    def groups(self) -> list[dict]:
        return list(self._cfg(CONF_GROUPS, []) or [])

    @property
    def scene_order(self) -> list[dict]:
        """Ordered non-off scenes [{key, name}] — turn_on plus the extras.

        turn_on is guaranteed present (prepended if missing). turn_off is never
        part of the order (it is pinned and handled separately).
        """
        stored = [
            s
            for s in (self._cfg(CONF_SCENES, []) or [])
            if s.get("key") != "turn_off"
        ]
        if not any(s.get("key") == "turn_on" for s in stored):
            stored = [{"key": "turn_on", "name": "Allumé"}, *stored]
        return stored

    @property
    def extra_scenes(self) -> list[dict]:
        """User-added room scenes (everything ordered except turn_on)."""
        return [s for s in self.scene_order if s.get("key") != "turn_on"]

    @property
    def off_name(self) -> str:
        """Display label of the pinned off scene (renamable, default 'Éteint')."""
        for scene in self._cfg(CONF_SCENES, []) or []:
            if scene.get("key") == "turn_off":
                return scene.get("name", "Éteint")
        return "Éteint"

    def extra_scene_id(self, key: str) -> str:
        return f"homex_{self.room_id}_turn_on_{key}"

    def scene_trigger_specs_for(self, key: str) -> list[dict]:
        """Per-scene triggers (raw HA trigger configs) for a scene key."""
        for scene in self._cfg(CONF_SCENES, []) or []:
            if isinstance(scene, dict) and scene.get("key") == key:
                return normalize_trigger_specs(scene.get("triggers"))
        return []

    @property
    def units(self) -> list[Unit]:
        if self._units is None:
            units = [
                Unit(self, ROOM_KEY, self.room_name, self.devices, self.triggers)
            ]
            for group in self.groups:
                units.append(
                    Unit(
                        self,
                        group[CONF_GROUP_ID],
                        group.get(CONF_GROUP_NAME, group[CONF_GROUP_ID]),
                        group.get(CONF_DEVICES, []),
                        group.get(CONF_TRIGGERS, []),
                    )
                )
            self._units = units
        return self._units

    # -- Lifecycle ----------------------------------------------------------

    async def async_start(self) -> None:
        """Seed the scenes and activate the automations."""
        await self.async_stop()
        await self.async_ensure_scenes()
        # Groups keep their own (on/off) trigger automation.
        for unit in self.units:
            if not unit.is_room:
                await unit.async_start()
        # Room triggers: toggle + scene-switching, each a mix of entity (state)
        # and device (action) triggers, wired via HA's native trigger helper.
        toggle_configs = await self.build_trigger_configs(self.trigger_specs)
        if toggle_configs:
            unsub = await async_initialize_triggers(
                self.hass,
                toggle_configs,
                self._toggle_action,
                DOMAIN,
                f"homex {self.room_id} toggle",
                _LOGGER.log,
            )
            if unsub:
                self._room_unsubs.append(unsub)
        scene_configs = await self.build_trigger_configs(self.scene_trigger_specs)
        if scene_configs:
            unsub = await async_initialize_triggers(
                self.hass,
                scene_configs,
                self._scene_action,
                DOMAIN,
                f"homex {self.room_id} scene",
                _LOGGER.log,
            )
            if unsub:
                self._room_unsubs.append(unsub)
        # Per-scene triggers: a trigger wired to a specific scene activates it.
        await self._start_scene_triggers()
        # Dimmer triggers: brighten / dim the room's member lights.
        await self._start_dim_triggers()
        # Keep entities tied to the room's HA area + labels (re-applied on every
        # reload, so changing the area or its labels propagates automatically).
        try:
            self.async_sync_labels()
        except Exception:  # noqa: BLE001 - label/area registry issues must not abort
            _LOGGER.exception("[%s] failed to sync area/labels", self.room_id)
        _LOGGER.info(
            "Homex room '%s' active: %d device(s), %d toggle/%d scene trigger(s), "
            "%d group(s), strategy=%s",
            self.room_id,
            len(self.devices),
            len(self.trigger_specs),
            len(self.scene_trigger_specs),
            len(self.groups),
            self.scene_strategy,
        )

    async def async_stop(self) -> None:
        while self._room_unsubs:
            self._room_unsubs.pop()()
        for unit in self._units or []:
            unit.stop()

    # -- Room trigger automations -------------------------------------------

    def bind_room_switch(self, entity) -> None:
        self._room_switch = entity

    def _update_active(self, key: str | None) -> None:
        """Record the active scene and expose it on the room switch."""
        self._active_scene_key = key
        if self._room_switch is not None:
            self._room_switch.set_active_scene(key)

    async def async_room_on(self) -> None:
        """Room turned on → apply the scene chosen by the strategy.

        recall_first → first scene (turn_on); recall_last → the last used scene
        (if it still exists), else the first.
        """
        keys = [scene["key"] for scene in self.scene_order]
        entities = self.scene_entities()
        if not keys or not entities:
            return
        if (
            self.scene_strategy == STRATEGY_RECALL_LAST
            and self._last_scene_key in keys
        ):
            index = keys.index(self._last_scene_key)
        else:
            index = 0  # recall_first, or no valid memorized scene
        self._last_scene_key = keys[index]
        self._update_active(keys[index])
        await self.hass.services.async_call(
            "scene",
            "turn_on",
            {"entity_id": entities[index]},
            blocking=False,
            context=self.new_context(),
        )

    def on_toggled_off(self) -> None:
        self._update_active(None)

    def _room_is_on(self) -> bool:
        state = self.hass.states.get(self.room_switch_entity_id)
        return state is not None and state.state == "on"

    def scene_entity_id(self, config_id: str) -> str:
        """Resolve a scene's entity_id from its stable config id via the registry."""
        registry = er.async_get(self.hass)
        return (
            registry.async_get_entity_id("scene", "homeassistant", config_id)
            or f"scene.{config_id}"
        )

    def _pretty_name(self, key: str, display: str | None = None) -> str:
        """HA scene display name: HX - {room} - on/off [- {scene name}]."""
        room = self.room_name
        if key == "turn_on":
            return f"HX - {room} - on"
        if key == "turn_off":
            return f"HX - {room} - off"
        return f"HX - {room} - on - {display or key}"

    def scene_entities(self) -> list[str]:
        """Ordered, switchable scene entity ids (turn_on + extras; off excluded)."""
        ids: list[str] = []
        for scene in self.scene_order:
            key = scene["key"]
            config_id = (
                f"homex_{self.room_id}_turn_on"
                if key == "turn_on"
                else self.extra_scene_id(key)
            )
            ids.append(self.scene_entity_id(config_id))
        return ids

    # -- Area & labels ------------------------------------------------------

    def managed_entity_ids(self) -> list[str]:
        """Every entity Homex owns or groups for this room: the generated
        switch/light controls, the scene entities, and the member devices
        (room + groups). De-duplicated, order preserved."""
        ids: list[str] = []
        for unit in self.units:
            ids.append(unit.switch_entity_id)
            ids.append(unit.light_entity_id)
            ids.append(unit.scene_on_entity_id)
            ids.append(unit.scene_off_entity_id)
            ids.extend(unit.devices)
        for scene in self.extra_scenes:
            ids.append(self.scene_entity_id(self.extra_scene_id(scene["key"])))
        seen: set[str] = set()
        out: list[str] = []
        for entity_id in ids:
            if entity_id and entity_id not in seen:
                seen.add(entity_id)
                out.append(entity_id)
        return out

    @callback
    def async_sync_labels(self) -> int:
        """Assign every managed entity to the room's HA area and reset its
        labels to exactly {Homex} ∪ the area's labels.

        Labels are fully replaced (the old set is dropped and reapplied), so a
        changed area or changed area labels propagate cleanly. The area id is
        set to the room's area (``None`` clears the entity-level override).
        Returns the number of entities updated.
        """
        from homeassistant.helpers import area_registry as ar
        from homeassistant.helpers import label_registry as lr

        ent_reg = er.async_get(self.hass)
        label_reg = lr.async_get(self.hass)

        homex_label = label_reg.async_get_label_by_name(HOMEX_LABEL)
        if homex_label is None:
            homex_label = label_reg.async_create(name=HOMEX_LABEL)
        labels = {homex_label.label_id}

        area_id = self.area_id
        if area_id:
            area = ar.async_get(self.hass).async_get_area(area_id)
            if area is not None:
                labels |= set(area.labels)

        updated = 0
        for entity_id in self.managed_entity_ids():
            if ent_reg.async_get(entity_id) is None:
                continue
            ent_reg.async_update_entity(entity_id, area_id=area_id, labels=labels)
            updated += 1
        _LOGGER.debug(
            "[%s] synced %d entities to area=%s with %d label(s)",
            self.room_id, updated, area_id, len(labels),
        )
        return updated

    @callback
    def _toggle_action(self, run_variables=None, context: Context | None = None) -> None:
        # Ignore toggles caused by Homex's own scene/switch actions.
        if self.is_self_context(context):
            return
        # The room is "on" as soon as a group is on, but the toggle acts on the
        # room's own scene: turn off only when a room scene is active, otherwise
        # turn on (apply the scene) — never toggle a running group off.
        service = "turn_off" if self._active_scene_key is not None else "turn_on"
        self.hass.async_create_task(
            self.hass.services.async_call(
                "switch",
                service,
                {"entity_id": self.room_switch_entity_id},
                context=self.new_context(),
            )
        )

    @callback
    def _scene_action(self, run_variables=None, context: Context | None = None) -> None:
        if self.is_self_context(context):
            return
        self.hass.async_create_task(self.async_scene_switch())

    async def async_scene_switch(self) -> None:
        """Activate the next scene (cyclic). Decided from the internal active
        key (updated synchronously) so rapid presses keep advancing — the HA
        switch state lags and must not drive the cycle.

        - A scene is active: advance to the next one (wraps to first).
        - No active scene (room off) + recall_last: recall the last scene; if it
          no longer exists, fall back to the first.
        - No active scene + recall_first: always start at the first scene.
        """
        scenes = self.scene_entities()
        keys = [scene["key"] for scene in self.scene_order]
        if not scenes or not keys:
            return
        count = len(keys)

        if self._active_scene_key in keys:
            index = (keys.index(self._active_scene_key) + 1) % count  # cyclic
        elif (
            self.scene_strategy == STRATEGY_RECALL_LAST
            and self._last_scene_key in keys
        ):
            index = keys.index(self._last_scene_key)
        else:  # recall_first, or the active/recalled scene no longer exists
            index = 0

        self._last_scene_key = keys[index]
        # Reflect "on" on the room switch without re-applying the on scene.
        if self._room_switch is not None:
            self._room_switch.set_is_on(True)
        self._update_active(keys[index])
        _LOGGER.debug("[%s] scene switch -> %s", self.room_id, scenes[index])
        await self.hass.services.async_call(
            "scene",
            "turn_on",
            {"entity_id": scenes[index]},
            blocking=False,
            context=self.new_context(),
        )

    # -- Per-scene triggers (a trigger that activates one specific scene) ----

    def _make_scene_activator(self, key: str):
        """A trigger callback that activates the scene identified by ``key``."""

        @callback
        def handler(run_variables=None, context: Context | None = None) -> None:
            if self.is_self_context(context):
                return
            self.hass.async_create_task(self.async_activate_scene_key(key))

        return handler

    async def async_activate_scene_key(self, key: str) -> None:
        """Activate a specific scene by key (turn_on / turn_off / an extra).

        turn_off behaves like turning the room off (via its switch). Any other
        scene turns the room on and applies that scene, updating the active /
        last-used memory just like a manual scene switch.
        """
        if key == "turn_off":
            await self.hass.services.async_call(
                "switch",
                "turn_off",
                {"entity_id": self.room_switch_entity_id},
                blocking=False,
                context=self.new_context(),
            )
            return
        keys = [scene["key"] for scene in self.scene_order]
        if key not in keys:
            return
        entity_id = self.scene_entities()[keys.index(key)]
        self._last_scene_key = key
        if self._room_switch is not None:
            self._room_switch.set_is_on(True)
        self._update_active(key)
        _LOGGER.debug("[%s] scene trigger -> %s", self.room_id, entity_id)
        await self.hass.services.async_call(
            "scene",
            "turn_on",
            {"entity_id": entity_id},
            blocking=False,
            context=self.new_context(),
        )

    async def _start_scene_triggers(self) -> None:
        """Wire each scene's own triggers: firing one activates that scene."""
        for scene in self._cfg(CONF_SCENES, []) or []:
            if not isinstance(scene, dict):
                continue
            specs = normalize_trigger_specs(scene.get("triggers"))
            configs = await self.build_trigger_configs(specs)
            if not configs:
                continue
            unsub = await async_initialize_triggers(
                self.hass,
                configs,
                self._make_scene_activator(scene["key"]),
                DOMAIN,
                f"homex {self.room_id} scene:{scene['key']}",
                _LOGGER.log,
            )
            if unsub:
                self._room_unsubs.append(unsub)

    # -- Dimmer (brighten / dim the room's member lights) -------------------

    @property
    def dim_light_ids(self) -> list[str]:
        """The room's real member lights (excludes Homex's own ONOFF groups)."""
        return [
            e
            for e in self.devices
            if e.startswith("light.") and not e.startswith("light.homex_")
        ]

    async def async_dim(self, delta: int) -> None:
        """Step the brightness of the room's member lights by ``delta`` (0-255)."""
        lights = self.dim_light_ids
        if not lights:
            return
        await self.hass.services.async_call(
            "light",
            "turn_on",
            {"entity_id": lights, "brightness_step": delta},
            blocking=False,
            context=self.new_context(),
        )

    def _make_dim_handler(self, delta: int):
        @callback
        def handler(run_variables=None, context: Context | None = None) -> None:
            if self.is_self_context(context):
                return
            self.hass.async_create_task(self.async_dim(delta))

        return handler

    async def _start_dim_triggers(self) -> None:
        """Wire the dim+ / dim- triggers to brighten / dim the member lights."""
        for specs, delta in (
            (self.dim_up_trigger_specs, DIM_STEP),
            (self.dim_down_trigger_specs, -DIM_STEP),
        ):
            configs = await self.build_trigger_configs(specs)
            if not configs:
                continue
            unsub = await async_initialize_triggers(
                self.hass,
                configs,
                self._make_dim_handler(delta),
                DOMAIN,
                f"homex {self.room_id} dim:{'up' if delta > 0 else 'down'}",
                _LOGGER.log,
            )
            if unsub:
                self._room_unsubs.append(unsub)

    # -- Scenes (native, stored in scenes.yaml) -----------------------------

    async def async_ensure_scenes(self) -> None:
        """Seed scenes (technical id+name) then give them pretty display names.

        Two steps so the entity_id stays technical (derived from the technical
        name at first registration) while the friendly name becomes pretty:
          1. create with id == name == technical id, reload (entity_id fixed),
          2. rename to the pretty label, reload (entity_id is sticky).
        Existing scenes are never re-created; their name is only prettified while
        still equal to the technical id (i.e. not yet customized).
        """
        path = self.hass.config.path(SCENES_FILE)
        lock = self.hass.data[DOMAIN][SCENES_LOCK]
        async with lock:
            changed = await self.hass.async_add_executor_job(self._seed_scenes, path)
            if changed:
                await self.hass.services.async_call("scene", "reload", blocking=True)
            renamed = await self.hass.async_add_executor_job(
                self._prettify_scenes, path, self._pretty_targets()
            )
            if renamed:
                await self.hass.services.async_call("scene", "reload", blocking=True)

    async def async_rename_scenes_to_convention(self) -> int:
        """Force every Homex scene name (room + groups) to its convention name.

        Unlike the startup prettify (which only renames scenes still named like
        their technical id), this overwrites the display name even if it was
        customized — it is the explicit "normalize names" action behind the
        sync button. Returns the number of scenes renamed.
        """
        path = self.hass.config.path(SCENES_FILE)
        lock = self.hass.data[DOMAIN][SCENES_LOCK]
        targets = self._pretty_targets()
        async with lock:
            renamed = await self.hass.async_add_executor_job(
                self._force_prettify_scenes, path, targets
            )
            if renamed:
                await self.hass.services.async_call("scene", "reload", blocking=True)
        return renamed

    @staticmethod
    def _force_prettify_scenes(path: str, pretty: dict[str, str]) -> int:
        """Set the convention name for each known scene, even if customized."""
        if not os.path.exists(path):
            return 0
        scenes = load_yaml(path)
        if not isinstance(scenes, list):
            return 0
        renamed = 0
        for scene in scenes:
            if not isinstance(scene, dict):
                continue
            scene_id = scene.get("id")
            if scene_id in pretty and scene.get("name") != pretty[scene_id]:
                scene["name"] = pretty[scene_id]
                renamed += 1
        if renamed:
            save_yaml(path, scenes)
        return renamed

    def _seed_scenes(self, path: str) -> bool:
        """Append missing scenes with technical id == name. Runs in executor."""
        scenes: list = []
        if os.path.exists(path):
            loaded = load_yaml(path)
            if isinstance(loaded, list):
                scenes = loaded

        existing_ids = {s.get("id") for s in scenes if isinstance(s, dict)}
        changed = False

        def add(scene_id: str, state: str, devices: list[str]) -> None:
            nonlocal changed
            if scene_id in existing_ids:
                return
            scenes.append(
                {
                    "id": scene_id,
                    "name": scene_id,  # technical name → technical entity_id
                    "entities": {e: {"state": state} for e in devices},
                }
            )
            changed = True

        for unit in self.units:
            if unit.is_room:
                continue
            for scene_id, _name, state in unit.scene_seeds():
                add(scene_id, state, unit.devices)
        for key, state in (("turn_on", "on"), ("turn_off", "off")):
            add(f"homex_{self.room_id}_{key}", state, self.devices)
        for scene in self.extra_scenes:
            add(self.extra_scene_id(scene["key"]), "off", self.devices)

        if changed:
            save_yaml(path, scenes)
        return changed

    def _pretty_targets(self) -> dict[str, str]:
        """Scene id -> pretty display name (room + group scenes)."""
        targets = {
            f"homex_{self.room_id}_turn_on": self._pretty_name("turn_on"),
            f"homex_{self.room_id}_turn_off": self._pretty_name("turn_off"),
        }
        for scene in self.extra_scenes:
            targets[self.extra_scene_id(scene["key"])] = self._pretty_name(
                scene["key"], scene.get("name")
            )
        # Group scenes: HX - {room} - {group} - on / - off.
        for unit in self.units:
            if unit.is_room:
                continue
            targets[f"homex_{unit.slug}_turn_on"] = (
                f"HX - {self.room_name} - {unit.name} - on"
            )
            targets[f"homex_{unit.slug}_turn_off"] = (
                f"HX - {self.room_name} - {unit.name} - off"
            )
        return targets

    @staticmethod
    def _prettify_scenes(path: str, pretty: dict[str, str]) -> bool:
        """Set pretty names for scenes still named like their id. In executor."""
        if not os.path.exists(path):
            return False
        scenes = load_yaml(path)
        if not isinstance(scenes, list):
            return False
        changed = False
        for scene in scenes:
            if not isinstance(scene, dict):
                continue
            scene_id = scene.get("id")
            if scene_id in pretty and scene.get("name") == scene_id:
                scene["name"] = pretty[scene_id]
                changed = True
        if changed:
            save_yaml(path, scenes)
        return changed

    async def async_remove_scenes(self) -> None:
        """Remove this room's scenes (room + groups) from scenes.yaml.

        Called when the config entry (the room) is deleted.
        """
        scene_ids = {
            scene_id
            for unit in self.units
            for scene_id, _, _ in unit.scene_seeds()
        }
        scene_ids |= {self.extra_scene_id(s["key"]) for s in self.extra_scenes}
        path = self.hass.config.path(SCENES_FILE)
        lock = self.hass.data.get(DOMAIN, {}).get(SCENES_LOCK) or asyncio.Lock()
        async with lock:
            changed = await self.hass.async_add_executor_job(
                self._remove_scenes, path, scene_ids
            )
            if changed:
                await self.hass.services.async_call("scene", "reload", blocking=True)
        # Also drop the scene entities from the registry, otherwise they linger
        # in HA as unavailable "restored" entities after the reload.
        remove_scene_entities(self.hass, scene_ids)

    @staticmethod
    def _remove_scenes(path: str, scene_ids: set[str]) -> bool:
        """Drop the given scene ids from scenes.yaml. Runs in the executor."""
        if not os.path.exists(path):
            return False
        loaded = load_yaml(path)
        if not isinstance(loaded, list):
            return False
        kept = [
            s
            for s in loaded
            if not (isinstance(s, dict) and s.get("id") in scene_ids)
        ]
        if len(kept) == len(loaded):
            return False
        save_yaml(path, kept)
        return True


class HomexHub:
    """Owns every room of the single Homex config entry.

    Each room is a *config subentry* of the hub: ``subentry.data`` holds the
    room config dict. The hub builds one :class:`RoomController` per subentry,
    so rooms appear nested under Homex in Settings → Devices & services and
    their entities are linked to the room subentry.
    """

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self.controllers: dict[str, RoomController] = {}
        self._subentry_by_room: dict[str, str] = {}

    @property
    def rooms(self) -> list[dict]:
        return [dict(se.data) for se in self.entry.subentries.values()]

    def build(self) -> None:
        """(Re)build the per-room controllers from the hub subentries."""
        self.controllers = {}
        self._subentry_by_room = {}
        for sub_id, subentry in self.entry.subentries.items():
            cfg = dict(subentry.data)
            room_id = cfg.get(CONF_ROOM_ID)
            if room_id:
                self.controllers[room_id] = RoomController(
                    self.hass, self.entry, cfg
                )
                self._subentry_by_room[room_id] = sub_id

    def subentry_id(self, room_id: str) -> str | None:
        return self._subentry_by_room.get(room_id)

    async def async_start(self) -> None:
        # Isolate failures: one room's bad trigger must not abort the whole hub.
        for room_id, controller in self.controllers.items():
            try:
                await controller.async_start()
            except Exception:  # noqa: BLE001
                _LOGGER.exception("Homex: failed to start room '%s'", room_id)

    async def async_stop(self) -> None:
        for controller in self.controllers.values():
            await controller.async_stop()

    async def async_remove_all_scenes(self) -> None:
        for controller in self.controllers.values():
            await controller.async_remove_scenes()
