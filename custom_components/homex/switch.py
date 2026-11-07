"""switch.homex_{slug}_lights_toggle - on/off state of the room and each group;
switch.homex_heating - the global heating switch (Climate module);
switch.homex_{slug}_heating - a room's own heating (off = Unheated), for each
room with radiators.
Room switches carry the room's Homex temperature / humidity as attributes."""

from __future__ import annotations

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.restore_state import RestoreEntity

from homeassistant.helpers import entity_registry as er

from .const import CONF_HEATING, DOMAIN, HUB_DATA, hx_name
from .heating import HEATING_SWITCH, STORE_DATA, _doc, async_set_heating_enabled
from .room import HomexHub, Unit
from functools import partial

from .heating_systems import systems_manager


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    hub: HomexHub = hass.data[DOMAIN][HUB_DATA]
    await _doc(hass)  # the heating switch reads the heating document
    heating = hass.data[DOMAIN][HEATING_SWITCH] = HeatingEnabledSwitch()
    async_add_entities([heating])

    @callback
    def _forget_switch() -> None:
        # Must return None: HA schedules any returned value as a coroutine.
        hass.data[DOMAIN].pop(HEATING_SWITCH, None)

    entry.async_on_unload(_forget_switch)

    systems = systems_manager(hass)
    await systems.async_setup_platform("switch", async_add_entities)
    entry.async_on_unload(partial(systems.unload_platform, "switch"))
    # A room's own heating switch, for rooms with radiators.
    heated = {
        room_id
        for room_id, controller in hub.controllers.items()
        if (controller._cfg(CONF_HEATING) or {}).get("radiators")
    }
    ent_reg = er.async_get(hass)
    for reg in list(ent_reg.entities.values()):
        if (
            reg.platform == DOMAIN
            and reg.domain == "switch"
            and reg.unique_id.startswith(ROOM_HEATING_PREFIX)
            and reg.unique_id.removeprefix(ROOM_HEATING_PREFIX) not in heated
        ):
            ent_reg.async_remove(reg.entity_id)
    for room_id in heated:
        async_add_entities(
            [RoomHeatingSwitch(hub, hub.controllers[room_id])],
            config_subentry_id=hub.subentry_id(room_id),
        )
    for room_id, controller in hub.controllers.items():
        if not controller.lights_enabled:
            continue
        async_add_entities(
            [RoomSwitch(unit) for unit in controller.units],
            config_subentry_id=hub.subentry_id(room_id),
        )


ROOM_HEATING_PREFIX = "homex_room_heating_"
# The room's Homex climate readings, shown on its switches (e.g. in a tile's
# state content): attribute -> metric sensor key.
CLIMATE_ATTRS = {"temperature": "temperature", "humidity": "humidity"}


def _metric_entity(room_id: str, metric: str) -> str:
    return f"sensor.homex_{room_id}_{metric}"


def _climate_attrs(hass: HomeAssistant, room_id: str) -> dict:
    """The room's temperature / humidity (sensor.homex_<room>_<metric>), when
    the room has them."""
    attrs = {}
    for attr, metric in CLIMATE_ATTRS.items():
        st = hass.states.get(_metric_entity(room_id, metric))
        if st is None:
            continue
        try:
            attrs[attr] = float(st.state)
        except (TypeError, ValueError):
            attrs[attr] = None  # unknown / unavailable
    return attrs


def _track_climate(entity, room_id: str) -> None:
    """Re-write the switch's state when the room's readings change."""

    @callback
    def _changed(event: Event) -> None:
        entity.async_write_ha_state()

    entity.async_on_remove(
        async_track_state_change_event(
            entity.hass,
            [_metric_entity(room_id, m) for m in CLIMATE_ATTRS.values()],
            _changed,
        )
    )


class RoomHeatingSwitch(SwitchEntity):
    """switch.homex_<room>_heating: the room's own heating — the Climate
    page's per-room toggle. Off = Unheated, whatever its zone's mode."""

    _attr_should_poll = False
    _attr_icon = "mdi:radiator"

    def __init__(self, hub: HomexHub, controller) -> None:
        self._hub = hub
        self._room_id = controller.room_id
        self._heating = dict(controller._cfg(CONF_HEATING) or {})
        self._attr_unique_id = f"{ROOM_HEATING_PREFIX}{self._room_id}"
        self.entity_id = f"switch.homex_{self._room_id}_heating"
        self._attr_name = hx_name("Climate", controller.room_name, "Chauffage")

    @property
    def is_on(self) -> bool:
        return self._heating.get("enabled", True) is not False

    @property
    def extra_state_attributes(self) -> dict:
        return _climate_attrs(self.hass, self._room_id)

    async def async_added_to_hass(self) -> None:
        _track_climate(self, self._room_id)

    async def _async_set(self, on: bool) -> None:
        entry = self._hub.entry
        sub = entry.subentries.get(self._hub.subentry_id(self._room_id) or "")
        if sub is None:
            return
        data = dict(sub.data)
        heating = dict(data.get(CONF_HEATING) or {})
        heating["enabled"] = on
        data[CONF_HEATING] = heating
        self._heating = heating
        self.async_write_ha_state()
        # Same as the panel: saving the room reloads Homex, which re-applies
        # the room's valves (Unheated / its zone's mode).
        self.hass.config_entries.async_update_subentry(entry, sub, data=data)

    async def async_turn_on(self, **kwargs) -> None:
        await self._async_set(True)

    async def async_turn_off(self, **kwargs) -> None:
        await self._async_set(False)


class RoomSwitch(SwitchEntity, RestoreEntity):
    """Represents whether a unit's lights should be on."""

    _attr_icon = "mdi:lightbulb-group"
    _attr_should_poll = False

    def __init__(self, unit: Unit) -> None:
        self._unit = unit
        self._attr_unique_id = unit.switch_unique_id
        self._attr_name = unit.switch_name
        self.entity_id = unit.switch_entity_id
        self._attr_is_on = False
        self._active_scene: str | None = None

    @property
    def extra_state_attributes(self) -> dict:
        # The active scene (key) while the room is on; None when off.
        attrs = {"active_scene": self._active_scene}
        if self._unit.is_room:
            # Last used scene, persisted (RestoreEntity) so recall_last
            # survives a Home Assistant restart.
            attrs["last_scene"] = self._unit._controller.last_scene_key
            attrs.update(_climate_attrs(self.hass, self._unit._controller.room_id))
        return attrs

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last_state = await self.async_get_last_state()
        if last_state is not None:
            self._attr_is_on = last_state.state == "on"
        if self._unit.is_room:
            self._unit._controller.bind_room_switch(self)
            _track_climate(self, self._unit._controller.room_id)
            # A room is "on" as soon as any of its parts is on — its own member
            # devices or any of its groups. Track them and reflect that state
            # WITHOUT applying a room scene (the passive on must not trigger one).
            watched = [
                *self._unit.devices,
                *self._unit._controller.group_switch_ids,
            ]
            if watched:
                self.async_on_remove(
                    async_track_state_change_event(
                        self.hass, watched, self._on_part_changed
                    )
                )
            self._recompute_room_on()
            if last_state is not None:
                attrs = last_state.attributes
                active = attrs.get("active_scene")
                self._unit._controller.restore_scene_memory(
                    attrs.get("last_scene") or active,
                    # Only still "active" if the room actually came back on.
                    active if self._attr_is_on else None,
                )

    def _any_part_on(self) -> bool:
        ids = [*self._unit.devices, *self._unit._controller.group_switch_ids]
        for entity_id in ids:
            state = self.hass.states.get(entity_id)
            if state is not None and state.state == "on":
                return True
        return False

    @callback
    def _on_part_changed(self, event: Event) -> None:
        self._recompute_room_on()

    @callback
    def _recompute_room_on(self) -> None:
        """Derive on/off from the room's parts (no scene side effect)."""
        on = self._any_part_on()
        if on == self._attr_is_on:
            return
        self._attr_is_on = on
        if not on:
            self._active_scene = None  # nothing on → no active scene
        self.async_write_ha_state()

    @callback
    def set_is_on(self, value: bool) -> None:
        """Reflect on/off state without applying a scene (used by scene switching)."""
        self._attr_is_on = value
        self.async_write_ha_state()

    @callback
    def set_active_scene(self, key: str | None) -> None:
        self._active_scene = key
        self.async_write_ha_state()

    @callback
    def set_on_scene(self, key: str | None) -> None:
        """On with this active scene, in one state write."""
        self._attr_is_on = True
        self._active_scene = key
        self.async_write_ha_state()

    async def async_turn_on(self, **kwargs) -> None:
        self._attr_is_on = True
        self.async_write_ha_state()
        if self._unit.is_room:
            # Apply the scene chosen by the room's recall strategy.
            await self._unit._controller.async_room_on()
        else:
            await self._unit.apply_on()

    async def async_turn_off(self, **kwargs) -> None:
        self._attr_is_on = False
        self.async_write_ha_state()
        if self._unit.is_room:
            self._unit._controller.on_toggled_off()
        await self._unit.apply_off()
        # Turning off a room also turns off all its sub-groups.
        await self._unit.turn_off_children()


class HeatingEnabledSwitch(SwitchEntity):
    """switch.homex_heating: heating on / off globally — the Heating page's
    "Chauffage activé" toggle. Off turns every room valve off."""

    _attr_should_poll = False
    _attr_icon = "mdi:radiator"
    _attr_unique_id = "homex_heating_enabled"

    def __init__(self) -> None:
        self.entity_id = "switch.homex_heating"
        self._attr_name = hx_name("Climate", "Global", "Chauffage")

    @property
    def is_on(self) -> bool:
        return self.hass.data[DOMAIN][STORE_DATA].get("enabled", True)

    async def async_turn_on(self, **kwargs) -> None:
        await async_set_heating_enabled(self.hass, True)

    async def async_turn_off(self, **kwargs) -> None:
        await async_set_heating_enabled(self.hass, False)
