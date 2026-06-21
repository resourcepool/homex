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
from homeassistant.config_entries import SOURCE_IMPORT, ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import entity_registry as er
from homeassistant.setup import async_setup_component
from homeassistant.util.yaml import load_yaml, save_yaml

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
    CONF_SCENES,
    CONF_TRIGGERS,
    DOMAIN,
    SCENES_FILE,
    SCENES_LOCK,
    STRATEGY_RECALL_FIRST,
    STRATEGY_RECALL_LAST,
)
from .room import RoomController, device_action_label, normalize_trigger_specs

_LOGGER = logging.getLogger(__name__)

PANEL_URL_PATH = "homex"
STATIC_URL = "/homex_static"
PANEL_VERSION = "29"
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
        ws_device_actions,
        ws_room_create,
        ws_room_update,
        ws_room_delete,
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


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/device_actions",
        vol.Required("device_id"): str,
    }
)
@websocket_api.async_response
async def ws_device_actions(hass: HomeAssistant, connection, msg) -> None:
    """List the action triggers a device exposes (for autocomplete)."""
    actions: list[str] = []
    try:
        triggers = await async_get_device_automations(
            hass, DeviceAutomationType.TRIGGER, [msg["device_id"]]
        )
    except Exception:  # noqa: BLE001 - unknown device / integration
        triggers = []
    seen: set[str] = set()
    for trigger in triggers:
        label = device_action_label(trigger)
        if label and label not in seen:
            seen.add(label)
            actions.append(label)
    connection.send_result(msg["id"], {"actions": sorted(actions)})


@websocket_api.websocket_command({vol.Required("type"): "homex/rooms"})
@callback
def ws_list_rooms(hass: HomeAssistant, connection, msg) -> None:
    """Return every Homex room with its groups and editable config."""
    rooms = []
    for entry in hass.config_entries.async_entries(DOMAIN):
        controller = RoomController(hass, entry)
        units = controller.units
        rooms.append(
            {
                "entry_id": entry.entry_id,
                "room_id": controller.room_id,
                "area_id": controller.area_id,
                **_serialize_unit(units[0]),
                "triggers": controller.trigger_specs,
                "scene_triggers": controller.scene_trigger_specs,
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


def _entry(hass: HomeAssistant, entry_id: str) -> ConfigEntry | None:
    entry = hass.config_entries.async_get_entry(entry_id)
    if entry is None or entry.domain != DOMAIN:
        return None
    return entry


def _merged(entry: ConfigEntry) -> dict:
    return {**entry.data, **entry.options}


def _options_with(entry: ConfigEntry, **overrides) -> dict:
    data = _merged(entry)
    options = {
        CONF_DEVICES: data.get(CONF_DEVICES, []),
        CONF_TRIGGERS: data.get(CONF_TRIGGERS, []),
        CONF_SCENE_TRIGGERS: data.get(CONF_SCENE_TRIGGERS, []),
        CONF_SCENE_STRATEGY: data.get(CONF_SCENE_STRATEGY, STRATEGY_RECALL_FIRST),
        CONF_GROUPS: data.get(CONF_GROUPS, []),
        CONF_SCENES: data.get(CONF_SCENES, []),
    }
    options.update(overrides)
    return options


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
                }
            )
    scenes.append(
        {
            "key": "turn_off",
            "name": controller.off_name,
            "config_id": f"homex_{slug}_turn_off",
            "removable": False,
            "orderable": False,
        }
    )
    return scenes


def _persist_scenes(
    hass: HomeAssistant,
    entry: ConfigEntry,
    ordered: list[dict],
    off_name: str | None = None,
) -> None:
    """Store the ordered non-off scenes, keeping the (renamable) off name."""
    controller = RoomController(hass, entry)
    off = controller.off_name if off_name is None else off_name
    scenes = [dict(s) for s in ordered]
    if off and off != "Éteint":
        scenes.append({"key": "turn_off", "name": off})
    hass.config_entries.async_update_entry(
        entry, options=_options_with(entry, **{CONF_SCENES: scenes})
    )


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
    if any(e.unique_id == room_id for e in hass.config_entries.async_entries(DOMAIN)):
        connection.send_error(msg["id"], "id_exists", "A room with this id exists")
        return

    result = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={"source": SOURCE_IMPORT},
        data={
            CONF_ROOM_NAME: msg["name"],
            CONF_ROOM_ID: room_id,
            CONF_AREA_ID: msg.get("area_id") or None,
            CONF_DEVICES: msg.get("devices", []),
            CONF_SCENE_STRATEGY: msg.get("scene_strategy", STRATEGY_RECALL_FIRST),
        },
    )
    if result["type"] != FlowResultType.CREATE_ENTRY:
        connection.send_error(
            msg["id"], result.get("reason", "error"), "Could not create room"
        )
        return
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/room/delete",
        vol.Required("entry_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_room_delete(hass: HomeAssistant, connection, msg) -> None:
    """Delete a room: removes the config entry (which also drops its scenes)."""
    entry = _entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return
    await hass.config_entries.async_remove(entry.entry_id)
    connection.send_result(msg["id"], {"ok": True})


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
        vol.Optional("scene_strategy"): vol.In(
            [STRATEGY_RECALL_FIRST, STRATEGY_RECALL_LAST]
        ),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_room_update(hass: HomeAssistant, connection, msg) -> None:
    entry = _entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return

    data = dict(entry.data)
    old_id = data.get(CONF_ROOM_ID)
    new_id = msg.get("room_id", old_id).strip().lower()
    if not ID_RE.match(new_id):
        connection.send_error(msg["id"], "invalid_id", "Invalid room id")
        return
    if new_id != old_id and any(
        e.unique_id == new_id for e in hass.config_entries.async_entries(DOMAIN)
    ):
        connection.send_error(msg["id"], "id_exists", "A room with this id exists")
        return

    if new_id != old_id:
        await _rename_room(hass, old_id, new_id, entry.entry_id)

    data[CONF_ROOM_ID] = new_id
    if "name" in msg:
        data[CONF_ROOM_NAME] = msg["name"]
    if "area_id" in msg:
        data[CONF_AREA_ID] = msg["area_id"] or None

    overrides = {}
    if "devices" in msg:
        overrides[CONF_DEVICES] = msg["devices"]
    if "triggers" in msg:
        overrides[CONF_TRIGGERS] = msg["triggers"]
    if "scene_triggers" in msg:
        overrides[CONF_SCENE_TRIGGERS] = msg["scene_triggers"]
    if "scene_strategy" in msg:
        overrides[CONF_SCENE_STRATEGY] = msg["scene_strategy"]

    hass.config_entries.async_update_entry(
        entry,
        data=data,
        options=_options_with(entry, **overrides),
        unique_id=new_id,
        title=data.get(CONF_ROOM_NAME, new_id),
    )
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
    entry = _entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return

    group_id = msg["group_id"].strip().lower()
    if not ID_RE.match(group_id):
        connection.send_error(msg["id"], "invalid_id", "Invalid group id")
        return

    groups = [dict(g) for g in _merged(entry).get(CONF_GROUPS, [])]
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
    hass.config_entries.async_update_entry(
        entry, options=_options_with(entry, **{CONF_GROUPS: groups})
    )
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
    entry = _entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return

    groups = [dict(g) for g in _merged(entry).get(CONF_GROUPS, [])]
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

    hass.config_entries.async_update_entry(
        entry, options=_options_with(entry, **{CONF_GROUPS: groups})
    )
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
    entry = _entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return

    room_id = _merged(entry).get(CONF_ROOM_ID)
    group_id = msg["group_id"]
    slug = f"{room_id}_{group_id}"

    # Remove the group's scenes and its switch/light entities.
    await _remove_scene_ids(
        hass, {f"homex_{slug}_turn_on", f"homex_{slug}_turn_off"}
    )
    registry = er.async_get(hass)
    for prefix in (f"switch.homex_{slug}", f"light.homex_{slug}"):
        for entity in list(
            er.async_entries_for_config_entry(registry, entry.entry_id)
        ):
            if entity.entity_id == prefix or entity.entity_id.startswith(prefix + "_"):
                registry.async_remove(entity.entity_id)

    groups = [
        g
        for g in _merged(entry).get(CONF_GROUPS, [])
        if g[CONF_GROUP_ID] != group_id
    ]
    hass.config_entries.async_update_entry(
        entry, options=_options_with(entry, **{CONF_GROUPS: groups})
    )
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/scene/add",
        vol.Required("entry_id"): str,
        vol.Required("name"): str,
        vol.Optional("attach"): str,  # config id of an existing scene to adopt
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_scene_add(hass: HomeAssistant, connection, msg) -> None:
    entry = _entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return

    name = msg["name"].strip()
    key = _slugify(name)
    if not name or not key or key in ("turn_on", "turn_off"):
        connection.send_error(msg["id"], "invalid_id", "Invalid scene name")
        return

    controller = RoomController(hass, entry)
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

    order.append({"key": key, "name": name})
    _persist_scenes(hass, entry, order)
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
    entry = _entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return

    key = msg["key"]
    if key in ("turn_on", "turn_off"):
        connection.send_error(msg["id"], "not_removable", "Default scene")
        return
    scene_id = RoomController(hass, entry).extra_scene_id(key)

    await _remove_scene_ids(hass, {scene_id})
    registry = er.async_get(hass)
    entity_id = f"scene.{scene_id}"
    if registry.async_get(entity_id):
        registry.async_remove(entity_id)

    order = [
        s for s in RoomController(hass, entry).scene_order if s.get("key") != key
    ]
    _persist_scenes(hass, entry, order)
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
    entry = _entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return

    by_key = {s["key"]: s for s in RoomController(hass, entry).scene_order}
    new_keys = msg["order"]
    if set(new_keys) != set(by_key):
        connection.send_error(msg["id"], "invalid_order", "Order keys mismatch")
        return

    order = [by_key[k] for k in new_keys]
    _persist_scenes(hass, entry, order)
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
    entry = _entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return
    controller = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if controller is None:
        controller = RoomController(hass, entry)
    await controller.async_scene_switch()
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/scene/rename",
        vol.Required("entry_id"): str,
        vol.Required("key"): str,
        vol.Required("name"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_scene_rename(hass: HomeAssistant, connection, msg) -> None:
    entry = _entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Unknown room")
        return

    key = msg["key"]
    name = msg["name"].strip()
    if not name:
        connection.send_error(msg["id"], "invalid_name", "Name required")
        return

    controller = RoomController(hass, entry)
    if key == "turn_off":
        _persist_scenes(hass, entry, controller.scene_order, off_name=name)
        connection.send_result(msg["id"], {"ok": True})
        return

    order = [dict(s) for s in controller.scene_order]
    if not any(s["key"] == key for s in order):
        connection.send_error(msg["id"], "not_found", "Unknown scene")
        return
    for scene in order:
        if scene["key"] == key:
            scene["name"] = name
    _persist_scenes(hass, entry, order)
    # turn_on keeps the fixed "HX - room - on" label; extras embed their name.
    if key != "turn_on":
        room_name = _merged(entry).get(CONF_ROOM_NAME) or controller.room_id
        await _set_scene_name(
            hass, controller.extra_scene_id(key), f"HX - {room_name} - on - {name}"
        )
    connection.send_result(msg["id"], {"ok": True})
