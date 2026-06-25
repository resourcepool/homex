"""Homex sidebar panel: a custom panel + WebSocket API to read & edit rooms."""

from __future__ import annotations

import logging
import os
import re
import unicodedata

import voluptuous as vol
from homeassistant.components import panel_custom, websocket_api
from homeassistant.components.device_automation import (
    DeviceAutomationType,
    async_get_device_automations,
)
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry, ConfigSubentry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.setup import async_setup_component
from homeassistant.util.yaml import load_yaml, save_yaml

from .const import (
    CONF_AREA_ID,
    CONF_DEVICES,
    CONF_DIM_DOWN_TRIGGERS,
    CONF_DIM_UP_TRIGGERS,
    CONF_GROUP_ID,
    CONF_GROUP_NAME,
    CONF_GROUPS,
    CONF_ROOM_ID,
    CONF_ROOM_NAME,
    CONF_SCENE_STRATEGY,
    CONF_SCENE_TRIGGERS,
    CONF_SCENES,
    CONF_TRIGGERS,
    DOMAIN,
    HUB_DATA,
    SCENES_FILE,
    SCENES_LOCK,
    STRATEGY_RECALL_FIRST,
    STRATEGY_RECALL_LAST,
)
from .room import (
    RoomController,
    device_action_label,
    normalize_trigger_specs,
    remove_scene_entities,
)

_LOGGER = logging.getLogger(__name__)

PANEL_URL_PATH = "homex"
STATIC_URL = "/homex_static"
PANEL_VERSION = "54"
PANEL_REGISTERED = "_panel_registered"

ID_RE = re.compile(r"^[a-z0-9_]+$")


def _slugify(value: str) -> str:
    """Normalize a label into a valid id (mirrors the frontend slugify)."""
    text = unicodedata.normalize("NFD", value or "")
    text = "".join(c for c in text if not unicodedata.combining(c)).lower()
    return re.sub(r"[^a-z0-9]+", "_", text).strip("_")


async def async_register_homex_panel(hass: HomeAssistant) -> None:
    """Register the WebSocket commands and the sidebar panel (once)."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if domain_data.get(PANEL_REGISTERED):
        return

    for command in (
        ws_list_rooms,
        ws_device_triggers,
        ws_room_create,
        ws_room_update,
        ws_room_delete,
        ws_room_sync_labels,
        ws_room_dim,
        ws_group_add,
        ws_group_update,
        ws_group_delete,
        ws_scene_add,
        ws_scene_delete,
        ws_scene_reorder,
        ws_scene_rename,
        ws_scene_next,
    ):
        websocket_api.async_register_command(hass, command)

    if "panel_custom" not in hass.config.components:
        await async_setup_component(hass, "panel_custom", {})

    panel_dir = os.path.join(os.path.dirname(__file__), "panel")
    # The bundle must ship with the integration. If it is missing (e.g. a HACS
    # download that didn't include panel/), the sidebar page would be blank —
    # log a clear, actionable error instead of failing silently.
    if not await hass.async_add_executor_job(
        os.path.isfile, os.path.join(panel_dir, "homex-panel.js")
    ):
        _LOGGER.error(
            "Homex panel bundle not found at %s/homex-panel.js — the Homex page "
            "will be blank. Ensure panel/homex-panel.js is shipped (committed "
            "and included in the HACS download).",
            panel_dir,
        )
    await hass.http.async_register_static_paths(
        [StaticPathConfig(STATIC_URL, panel_dir, False)]
    )
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name="homex-panel",
        module_url=f"{STATIC_URL}/homex-panel.js?v={PANEL_VERSION}",
        sidebar_title="Homex",
        sidebar_icon="mdi:home-lightbulb",
        require_admin=False,
    )

    domain_data[PANEL_REGISTERED] = True
    _LOGGER.info("Homex sidebar panel registered at /%s", PANEL_URL_PATH)


# -- Read ------------------------------------------------------------------


def _serialize_unit(unit) -> dict:
    return {
        "name": unit.name,
        "devices": unit.devices,
        "triggers": normalize_trigger_specs(unit.triggers),
        "switch": unit.switch_entity_id,
        "light": unit.light_entity_id,
        "scene_on": unit.scene_on_entity_id,
        "scene_off": unit.scene_off_entity_id,
    }


def _device_trigger_label(trigger: dict) -> str:
    """Readable label for a device trigger (mirrors the automation editor)."""
    subtype = trigger.get("subtype")
    ttype = trigger.get("type")
    parts = [str(p).replace("_", " ") for p in (subtype, ttype) if p]
    return " — ".join(parts) or "déclencheur"


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/device_triggers",
        vol.Required("device_id"): str,
    }
)
@websocket_api.async_response
async def ws_device_triggers(hass: HomeAssistant, connection, msg) -> None:
    """List a device's native triggers, each with its full HA trigger config.

    Same source as the automation editor's device-trigger dropdown
    (async_get_device_automations); we return the config to store verbatim.
    """
    device_id = msg["device_id"]
    try:
        automations = await async_get_device_automations(
            hass, DeviceAutomationType.TRIGGER, [device_id]
        )
        triggers = automations.get(device_id, [])
    except Exception:  # noqa: BLE001 - unknown device / integration
        triggers = []
    out = [
        {
            "label": _device_trigger_label(t),
            "trigger": {k: v for k, v in t.items() if k != "metadata"},
        }
        for t in triggers
    ]
    connection.send_result(msg["id"], {"triggers": out})


@websocket_api.websocket_command({vol.Required("type"): "homex/rooms"})
@callback
def ws_list_rooms(hass: HomeAssistant, connection, msg) -> None:
    """Return every Homex room with its groups and editable config."""
    rooms = []
    hub = _hub_entry(hass)
    for subentry in (hub.subentries.values() if hub else []):
        room = dict(subentry.data)
        if not room.get(CONF_ROOM_ID):
            continue
        controller = RoomController(hass, hub, room)
        units = controller.units
        rooms.append(
            {
                # The frontend keys rooms by "entry_id"; with a single hub entry
                # we expose the room id there so the existing UI keeps working.
                "entry_id": controller.room_id,
                "room_id": controller.room_id,
                "area_id": controller.area_id,
                **_serialize_unit(units[0]),
                "triggers": controller.trigger_specs,
                "scene_triggers": controller.scene_trigger_specs,
                "dim_up_triggers": controller.dim_up_trigger_specs,
                "dim_down_triggers": controller.dim_down_trigger_specs,
                "scene_strategy": controller.scene_strategy,
                "scenes": _room_scenes(controller),
                "groups": [
                    {"group_id": unit.key, **_serialize_unit(unit)}
                    for unit in units[1:]
                ],
            }
        )
    connection.send_result(msg["id"], {"rooms": rooms})


# -- Helpers for mutations -------------------------------------------------


def _hub_entry(hass: HomeAssistant) -> ConfigEntry | None:
    """The single Homex hub config entry (or None if not installed)."""
    entries = hass.config_entries.async_entries(DOMAIN)
    return entries[0] if entries else None


def _find_subentry(hub: ConfigEntry, room_id: str):
    """The room subentry whose data carries this room_id (or None)."""
    return next(
        (
            se
            for se in hub.subentries.values()
            if se.data.get(CONF_ROOM_ID) == room_id
        ),
        None,
    )


def _controller(hass: HomeAssistant, hub: ConfigEntry, room: dict) -> RoomController:
    return RoomController(hass, hub, room)


def _save_room(hass: HomeAssistant, hub: ConfigEntry, subentry, data: dict) -> None:
    """Persist a room subentry; the update listener reloads entities/scenes."""
    hass.config_entries.async_update_subentry(
        hub,
        subentry,
        data=data,
        title=data.get(CONF_ROOM_NAME) or data.get(CONF_ROOM_ID),
        unique_id=data.get(CONF_ROOM_ID),
    )


def _room_scenes(controller: RoomController) -> list[dict]:
    """Room scenes for the panel: ordered (turn_on + extras), then off pinned."""
    slug = controller.room_id
    scenes = []
    for scene in controller.scene_order:  # turn_on + extras, in order
        key = scene["key"]
        if key == "turn_on":
            scenes.append(
                {
                    "key": "turn_on",
                    "name": scene.get("name", "Allumé"),
                    "config_id": f"homex_{slug}_turn_on",
                    "removable": False,
                    "orderable": True,
                    "triggers": controller.scene_trigger_specs_for("turn_on"),
                }
            )
        else:
            scenes.append(
                {
                    "key": key,
                    "name": scene.get("name", key),
                    "config_id": controller.extra_scene_id(key),
                    "removable": True,
                    "orderable": True,
                    "triggers": controller.scene_trigger_specs_for(key),
                }
            )
    scenes.append(
        {
            "key": "turn_off",
            "name": controller.off_name,
            "config_id": f"homex_{slug}_turn_off",
            "removable": False,
            "orderable": False,
            "triggers": controller.scene_trigger_specs_for("turn_off"),
        }
    )
    return scenes


def _scenes_value(
    controller: RoomController,
    ordered: list[dict],
    off_name: str | None = None,
    off_triggers: list | None = None,
) -> list[dict]:
    """Build the stored scenes list: ordered non-off + the (renamable) off.

    The off scene is persisted when it has a custom name OR its own triggers
    (otherwise it stays implicit with the default 'Éteint' label).
    """
    off = controller.off_name if off_name is None else off_name
    if off_triggers is None:
        off_triggers = controller.scene_trigger_specs_for("turn_off")
    scenes = [dict(s) for s in ordered]
    if (off and off != "Éteint") or off_triggers:
        scenes.append(
            {"key": "turn_off", "name": off, "triggers": list(off_triggers or [])}
        )
    return scenes


async def _rename_room(
    hass: HomeAssistant, old_id: str, new_id: str, entry_id: str
) -> None:
    """Rename scenes (scenes.yaml) and entity_ids when a room id changes."""
    path = hass.config.path(SCENES_FILE)
    lock = hass.data[DOMAIN][SCENES_LOCK]
    async with lock:
        changed = await hass.async_add_executor_job(
            _rename_scene_prefixes, path, old_id, new_id
        )
        if changed:
            await hass.services.async_call("scene", "reload", blocking=True)

    registry = er.async_get(hass)
    token = f"homex_{old_id}"
    for entity in er.async_entries_for_config_entry(registry, entry_id):
        if token in entity.entity_id:
            new_eid = entity.entity_id.replace(token, f"homex_{new_id}", 1)
            if new_eid != entity.entity_id and registry.async_get(new_eid) is None:
                registry.async_update_entity(entity.entity_id, new_entity_id=new_eid)


def _rename_scene_prefixes(path: str, old_id: str, new_id: str) -> bool:
    if not os.path.exists(path):
        return False
    scenes = load_yaml(path)
    if not isinstance(scenes, list):
        return False
    changed = False
    for scene in scenes:
        if not isinstance(scene, dict):
            continue
        sid = scene.get("id", "")
        if sid == f"homex_{old_id}" or sid.startswith(f"homex_{old_id}_"):
            scene["id"] = sid.replace(f"homex_{old_id}", f"homex_{new_id}", 1)
            changed = True
        name = scene.get("name", "")
        if name.startswith(f"homex_{old_id}"):
            scene["name"] = name.replace(
                f"homex_{old_id}", f"homex_{new_id}", 1
            )
            changed = True
    if changed:
        save_yaml(path, scenes)
    return changed


async def _remove_scene_ids(hass: HomeAssistant, scene_ids: set[str]) -> None:
    path = hass.config.path(SCENES_FILE)
    lock = hass.data[DOMAIN][SCENES_LOCK]
    async with lock:
        changed = await hass.async_add_executor_job(
            RoomController._remove_scenes, path, scene_ids
        )
        if changed:
            await hass.services.async_call("scene", "reload", blocking=True)
    # Drop the scene entities too, so they don't linger as restored entities.
    remove_scene_entities(hass, scene_ids)


def _set_scene_name_in_yaml(path: str, scene_id: str, name: str) -> bool:
    """Update a scene's display name. Runs in the executor."""
    if not os.path.exists(path):
        return False
    scenes = load_yaml(path)
    if not isinstance(scenes, list):
        return False
    for scene in scenes:
        if isinstance(scene, dict) and scene.get("id") == scene_id:
            if scene.get("name") == name:
                return False
            scene["name"] = name
            save_yaml(path, scenes)
            return True
    return False


async def _set_scene_name(hass: HomeAssistant, scene_id: str, name: str) -> None:
    path = hass.config.path(SCENES_FILE)
    lock = hass.data[DOMAIN][SCENES_LOCK]
    async with lock:
        changed = await hass.async_add_executor_job(
            _set_scene_name_in_yaml, path, scene_id, name
        )
        if changed:
            await hass.services.async_call("scene", "reload", blocking=True)


def _rename_scene_id_in_yaml(path: str, old_id: str, new_id: str) -> bool:
    """Rename a scene's id+name (content preserved). Runs in the executor."""
    if not os.path.exists(path):
        return False
    scenes = load_yaml(path)
    if not isinstance(scenes, list):
        return False
    for scene in scenes:
        if isinstance(scene, dict) and scene.get("id") == old_id:
            scene["id"] = new_id
            scene["name"] = new_id
            save_yaml(path, scenes)
            return True
    return False


async def _attach_existing_scene(
    hass: HomeAssistant, old_id: str, new_id: str
) -> bool:
    """Adopt an existing scene: rename it to the Homex id, keep its content."""
    path = hass.config.path(SCENES_FILE)
    lock = hass.data[DOMAIN][SCENES_LOCK]
    registry = er.async_get(hass)
    old_entity_id = registry.async_get_entity_id("scene", "homeassistant", old_id)
    async with lock:
        found = await hass.async_add_executor_job(
            _rename_scene_id_in_yaml, path, old_id, new_id
        )
        if not found:
            return False
        # Free the old scene's entity_id so the renamed one gets a clean id.
        if old_entity_id and registry.async_get(old_entity_id):
            registry.async_remove(old_entity_id)
        await hass.services.async_call("scene", "reload", blocking=True)
    return True


# -- Mutations -------------------------------------------------------------


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/room/create",
        vol.Required("name"): str,
        vol.Required("room_id"): str,
        vol.Optional("devices"): [str],
        vol.Optional("area_id"): vol.Any(str, None),
        vol.Optional("scene_strategy"): vol.In(
            [STRATEGY_RECALL_FIRST, STRATEGY_RECALL_LAST]
        ),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_room_create(hass: HomeAssistant, connection, msg) -> None:
    room_id = msg["room_id"].strip().lower()
    if not ID_RE.match(room_id):
        connection.send_error(msg["id"], "invalid_id", "Invalid room id")
        return
    hub = _hub_entry(hass)
    if hub is None:
        connection.send_error(msg["id"], "not_installed", "Homex is not installed")
        return
    if _find_subentry(hub, room_id):
        connection.send_error(msg["id"], "id_exists", "A room with this id exists")
        return

    data = {
        CONF_ROOM_ID: room_id,
        CONF_ROOM_NAME: msg["name"],
        CONF_AREA_ID: msg.get("area_id") or None,
        CONF_DEVICES: msg.get("devices", []),
        CONF_TRIGGERS: [],
        CONF_SCENE_TRIGGERS: [],
        CONF_SCENE_STRATEGY: msg.get("scene_strategy", STRATEGY_RECALL_FIRST),
        CONF_GROUPS: [],
        CONF_SCENES: [],
    }
    hass.config_entries.async_add_subentry(
        hub,
        ConfigSubentry(
            data=data,
            subentry_type="room",
            title=msg["name"] or room_id,
            unique_id=room_id,
        ),
    )
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/room/delete",
        vol.Required("entry_id"): str,
        vol.Optional("delete_scenes", default=True): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_room_delete(hass: HomeAssistant, connection, msg) -> None:
    """Delete a room from the hub: drop its entities and subentry.

    Its scenes are removed from scenes.yaml only when ``delete_scenes`` is set
    (the panel offers a toggle, on by default); otherwise they are left in
    place as plain HA scenes.
    """
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return

    controller = _controller(hass, hub, dict(sub.data))
    if msg["delete_scenes"]:
        await controller.async_remove_scenes()
    _remove_room_entities(hass, controller)

    hass.config_entries.async_remove_subentry(hub, sub.subentry_id)
    connection.send_result(msg["id"], {"ok": True})


def _remove_room_entities(hass: HomeAssistant, controller: RoomController) -> None:
    """Remove the switch/light entities of a room and its groups."""
    registry = er.async_get(hass)
    for unit in controller.units:
        for entity_id in (unit.switch_entity_id, unit.light_entity_id):
            if registry.async_get(entity_id):
                registry.async_remove(entity_id)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/room/update",
        vol.Required("entry_id"): str,
        vol.Optional("name"): str,
        vol.Optional("room_id"): str,
        vol.Optional("area_id"): vol.Any(str, None),
        vol.Optional("devices"): [str],
        vol.Optional("triggers"): list,
        vol.Optional("scene_triggers"): list,
        vol.Optional("dim_up_triggers"): list,
        vol.Optional("dim_down_triggers"): list,
        vol.Optional("scene_strategy"): vol.In(
            [STRATEGY_RECALL_FIRST, STRATEGY_RECALL_LAST]
        ),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_room_update(hass: HomeAssistant, connection, msg) -> None:
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return

    room = dict(sub.data)
    old_id = room.get(CONF_ROOM_ID)
    new_id = msg.get("room_id", old_id).strip().lower()
    if not ID_RE.match(new_id):
        connection.send_error(msg["id"], "invalid_id", "Invalid room id")
        return
    if new_id != old_id and _find_subentry(hub, new_id):
        connection.send_error(msg["id"], "id_exists", "A room with this id exists")
        return

    if new_id != old_id:
        await _rename_room(hass, old_id, new_id, hub.entry_id)

    room[CONF_ROOM_ID] = new_id
    if "name" in msg:
        room[CONF_ROOM_NAME] = msg["name"]
    if "area_id" in msg:
        room[CONF_AREA_ID] = msg["area_id"] or None
    if "devices" in msg:
        room[CONF_DEVICES] = msg["devices"]
    if "triggers" in msg:
        room[CONF_TRIGGERS] = msg["triggers"]
    if "scene_triggers" in msg:
        room[CONF_SCENE_TRIGGERS] = msg["scene_triggers"]
    if "dim_up_triggers" in msg:
        room[CONF_DIM_UP_TRIGGERS] = msg["dim_up_triggers"]
    if "dim_down_triggers" in msg:
        room[CONF_DIM_DOWN_TRIGGERS] = msg["dim_down_triggers"]
    if "scene_strategy" in msg:
        room[CONF_SCENE_STRATEGY] = msg["scene_strategy"]

    _save_room(hass, hub, sub, room)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/room/sync_labels",
        vol.Required("entry_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_room_sync_labels(hass: HomeAssistant, connection, msg) -> None:
    """Re-assign the room's entities to its HA area and reset their labels
    ({Homex} ∪ the area's labels). Uses the live controller when available."""
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return
    live = hass.data.get(DOMAIN, {}).get(HUB_DATA)
    controller = (
        live.controllers.get(msg["entry_id"]) if live else None
    ) or _controller(hass, hub, dict(sub.data))
    updated = controller.async_sync_labels()
    renamed = await controller.async_rename_scenes_to_convention()
    connection.send_result(
        msg["id"], {"ok": True, "updated": updated, "scenes_renamed": renamed}
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/room/dim",
        vol.Required("entry_id"): str,
        vol.Required("delta"): int,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_room_dim(hass: HomeAssistant, connection, msg) -> None:
    """Step the brightness of the room's member lights by ``delta`` (0-255)."""
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return
    live = hass.data.get(DOMAIN, {}).get(HUB_DATA)
    controller = (
        live.controllers.get(msg["entry_id"]) if live else None
    ) or _controller(hass, hub, dict(sub.data))
    await controller.async_dim(msg["delta"])
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/group/add",
        vol.Required("entry_id"): str,
        vol.Required("group_id"): str,
        vol.Required("name"): str,
        vol.Required("devices"): [str],
        vol.Optional("triggers"): list,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_group_add(hass: HomeAssistant, connection, msg) -> None:
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return
    room = dict(sub.data)

    group_id = msg["group_id"].strip().lower()
    if not ID_RE.match(group_id):
        connection.send_error(msg["id"], "invalid_id", "Invalid group id")
        return

    groups = [dict(g) for g in room.get(CONF_GROUPS, [])]
    if any(g[CONF_GROUP_ID] == group_id for g in groups):
        connection.send_error(msg["id"], "group_exists", "Group id already exists")
        return

    groups.append(
        {
            CONF_GROUP_ID: group_id,
            CONF_GROUP_NAME: msg["name"],
            CONF_DEVICES: msg["devices"],
            CONF_TRIGGERS: msg.get("triggers", []),
        }
    )
    room[CONF_GROUPS] = groups
    _save_room(hass, hub, sub, room)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/group/update",
        vol.Required("entry_id"): str,
        vol.Required("group_id"): str,
        vol.Optional("name"): str,
        vol.Optional("devices"): [str],
        vol.Optional("triggers"): list,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_group_update(hass: HomeAssistant, connection, msg) -> None:
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return
    room = dict(sub.data)

    groups = [dict(g) for g in room.get(CONF_GROUPS, [])]
    group = next((g for g in groups if g[CONF_GROUP_ID] == msg["group_id"]), None)
    if group is None:
        connection.send_error(msg["id"], "not_found", "Unknown group")
        return

    if "name" in msg:
        group[CONF_GROUP_NAME] = msg["name"]
    if "devices" in msg:
        group[CONF_DEVICES] = msg["devices"]
    if "triggers" in msg:
        group[CONF_TRIGGERS] = msg["triggers"]

    room[CONF_GROUPS] = groups
    _save_room(hass, hub, sub, room)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/group/delete",
        vol.Required("entry_id"): str,
        vol.Required("group_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_group_delete(hass: HomeAssistant, connection, msg) -> None:
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return
    room = dict(sub.data)

    room_id = room.get(CONF_ROOM_ID)
    group_id = msg["group_id"]
    slug = f"{room_id}_{group_id}"

    # Remove the group's scenes and its switch/light entities.
    await _remove_scene_ids(
        hass, {f"homex_{slug}_turn_on", f"homex_{slug}_turn_off"}
    )
    registry = er.async_get(hass)
    for entity_id in (
        f"switch.homex_{slug}_lights_toggle",
        f"light.homex_{slug}_lights",
    ):
        if registry.async_get(entity_id):
            registry.async_remove(entity_id)

    room[CONF_GROUPS] = [
        g for g in room.get(CONF_GROUPS, []) if g[CONF_GROUP_ID] != group_id
    ]
    _save_room(hass, hub, sub, room)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/scene/add",
        vol.Required("entry_id"): str,
        vol.Required("name"): str,
        vol.Optional("attach"): str,  # config id of an existing scene to adopt
        vol.Optional("triggers"): list,  # per-scene triggers that activate it
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_scene_add(hass: HomeAssistant, connection, msg) -> None:
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return
    room = dict(sub.data)

    name = msg["name"].strip()
    key = _slugify(name)
    if not name or not key or key in ("turn_on", "turn_off"):
        connection.send_error(msg["id"], "invalid_id", "Invalid scene name")
        return

    controller = _controller(hass, hub, room)
    # scene_order already includes turn_on, so persisting it keeps the order.
    order = [dict(s) for s in controller.scene_order]
    if any(s["key"] == key for s in order):
        connection.send_error(msg["id"], "scene_exists", "Scene already exists")
        return

    attach = msg.get("attach")
    if attach:
        # Adopt the existing scene by renaming it to the Homex id (content kept).
        if not await _attach_existing_scene(
            hass, attach, controller.extra_scene_id(key)
        ):
            connection.send_error(msg["id"], "scene_not_found", "Scene not found")
            return

    order.append({"key": key, "name": name, "triggers": msg.get("triggers", [])})
    room[CONF_SCENES] = _scenes_value(controller, order)
    _save_room(hass, hub, sub, room)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/scene/delete",
        vol.Required("entry_id"): str,
        vol.Required("key"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_scene_delete(hass: HomeAssistant, connection, msg) -> None:
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return
    room = dict(sub.data)

    key = msg["key"]
    if key in ("turn_on", "turn_off"):
        connection.send_error(msg["id"], "not_removable", "Default scene")
        return
    controller = _controller(hass, hub, room)
    scene_id = controller.extra_scene_id(key)

    await _remove_scene_ids(hass, {scene_id})  # drops yaml + the scene entity

    order = [s for s in controller.scene_order if s.get("key") != key]
    room[CONF_SCENES] = _scenes_value(controller, order)
    _save_room(hass, hub, sub, room)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/scene/reorder",
        vol.Required("entry_id"): str,
        vol.Required("order"): [str],
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_scene_reorder(hass: HomeAssistant, connection, msg) -> None:
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return
    room = dict(sub.data)

    controller = _controller(hass, hub, room)
    by_key = {s["key"]: s for s in controller.scene_order}
    new_keys = msg["order"]
    if set(new_keys) != set(by_key):
        connection.send_error(msg["id"], "invalid_order", "Order keys mismatch")
        return

    order = [by_key[k] for k in new_keys]
    room[CONF_SCENES] = _scenes_value(controller, order)
    _save_room(hass, hub, sub, room)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/scene/next",
        vol.Required("entry_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_scene_next(hass: HomeAssistant, connection, msg) -> None:
    """Switch to the next scene (uses the live controller for cycle memory)."""
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return
    room = dict(sub.data)
    live = hass.data.get(DOMAIN, {}).get(HUB_DATA)
    controller = (
        live.controllers.get(room[CONF_ROOM_ID]) if live else None
    ) or _controller(hass, hub, room)
    await controller.async_scene_switch()
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/scene/rename",
        vol.Required("entry_id"): str,
        vol.Required("key"): str,
        vol.Required("name"): str,
        vol.Optional("triggers"): list,  # per-scene triggers (when editing)
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_scene_rename(hass: HomeAssistant, connection, msg) -> None:
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return
    room = dict(sub.data)

    key = msg["key"]
    name = msg["name"].strip()
    if not name:
        connection.send_error(msg["id"], "invalid_name", "Name required")
        return

    triggers = msg.get("triggers")  # None = leave unchanged
    controller = _controller(hass, hub, room)
    if key == "turn_off":
        room[CONF_SCENES] = _scenes_value(
            controller, controller.scene_order, name, triggers
        )
        _save_room(hass, hub, sub, room)
        connection.send_result(msg["id"], {"ok": True})
        return

    order = [dict(s) for s in controller.scene_order]
    if not any(s["key"] == key for s in order):
        connection.send_error(msg["id"], "not_found", "Unknown scene")
        return
    for scene in order:
        if scene["key"] == key:
            scene["name"] = name
            if triggers is not None:
                scene["triggers"] = triggers
    room[CONF_SCENES] = _scenes_value(controller, order)
    _save_room(hass, hub, sub, room)
    # turn_on keeps the fixed "HX - room - on" label; extras embed their name.
    if key != "turn_on":
        room_name = room.get(CONF_ROOM_NAME) or controller.room_id
        await _set_scene_name(
            hass, controller.extra_scene_id(key), f"HX - {room_name} - on - {name}"
        )
    connection.send_result(msg["id"], {"ok": True})
