"""Homex sidebar panel: a custom panel + WebSocket API to read & edit rooms."""

from __future__ import annotations

import asyncio
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
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.storage import Store
from homeassistant.setup import async_setup_component
from homeassistant.util.yaml import load_yaml, save_yaml

from .i18n import CONF_LANGUAGE, LANGUAGE_AUTO, LANGUAGES, language, language_setting, tr
from .const import (
    CONF_HEATING,
    CONF_METRICS,
    METRIC_RULES,
    METRICS,
    CONF_AREA_ID,
    CONF_DEVICES,
    CONF_DIM,
    CONF_DIM_DOWN_TRIGGERS,
    CONF_DIM_UP_TRIGGERS,
    CONF_GROUP_ID,
    CONF_GROUP_NAME,
    CONF_GROUPS,
    CONF_MODULES,
    CONF_ROOM_ID,
    CONF_ROOM_NAME,
    CONF_SCENE_STRATEGY,
    CONF_SCENE_TRIGGERS,
    CONF_SCENES,
    CONF_SHUTTER_GROUPS,
    CONF_SWITCHES,
    CONF_TRIGGERS,
    DEFAULT_MODULES,
    DEFAULT_SHUTTER_GROUP,
    DEFAULT_SHUTTER_GROUP_NAME,
    DOMAIN,
    HOLD_RELOAD,
    HUB_DATA,
    MODULE_HEATING,
    MODULE_LIGHTS,
    MODULE_SHUTTERS,
    MODULE_SWITCHES,
    SCENES_FILE,
    SCENES_LOCK,
    STRATEGY_RECALL_FIRST,
    STRATEGY_RECALL_LAST,
    Z2M_BRIDGE,
)
from .heating import WS_COMMANDS as HEATING_WS_COMMANDS
from .heating import async_forget_room as async_forget_heating_room
from .heating import async_rename_room as async_rename_heating_room
from .heating_systems import WS_COMMANDS as HEATING_SYSTEM_WS_COMMANDS
from .heating_zones import WS_COMMANDS as HEATING_ZONE_WS_COMMANDS
from .room import (
    RoomController,
    default_name,
    device_action_label,
    is_default_name,
    normalize_trigger_specs,
    remove_scene_entities,
)

# User-facing strings (see i18n.py).
_STRINGS = {
    "en": {
        "not_installed": "Homex is not installed",
        "unknown_room": "Unknown room",
        "invalid_room_id": "Invalid room id",
        "room_exists": "A room with this id exists",
        "invalid_group_id": "Invalid group id",
        "group_exists": "Group id already exists",
        "unknown_group": "Unknown group",
        "default_group_not_removable": "The default group cannot be deleted.",
        "invalid_layout_id": "Invalid layout id",
        "invalid_preset_id": "Invalid preset id",
        "invalid_switch_id": "Invalid switch id",
        "gswitch_exists": "A switch with the id “{id}” already exists.",
        "switch_exists": "Switch id already exists",
        "unknown_switch": "Unknown switch",
        "invalid_scene_name": "Invalid scene name",
        "scene_exists": "Scene already exists",
        "scene_not_found": "Scene not found",
        "default_scene": "Default scene",
        "order_mismatch": "Order keys mismatch",
        "name_required": "Name required",
        "unknown_scene": "Unknown scene",
        "unknown_model": "unknown model",
        "tap_single": "Single",
        "tap_double": "Double",
        "tap_long": "Long",
        "switch_button": "{switch} · Button {button} ({tap}){suffix}",
    },
    "fr": {
        "not_installed": "Homex n'est pas installé",
        "unknown_room": "Pièce inconnue",
        "invalid_room_id": "Id de pièce invalide",
        "room_exists": "Une pièce avec cet id existe déjà",
        "invalid_group_id": "Id de groupe invalide",
        "group_exists": "Cet id de groupe existe déjà",
        "unknown_group": "Groupe inconnu",
        "default_group_not_removable": "Le groupe par défaut ne peut pas être supprimé.",
        "invalid_layout_id": "Id de disposition invalide",
        "invalid_preset_id": "Id de preset invalide",
        "invalid_switch_id": "Id d'interrupteur invalide",
        "gswitch_exists": "Un interrupteur avec l'id « {id} » existe déjà.",
        "switch_exists": "Cet id d'interrupteur existe déjà",
        "unknown_switch": "Interrupteur inconnu",
        "invalid_scene_name": "Nom de scène invalide",
        "scene_exists": "Cette scène existe déjà",
        "scene_not_found": "Scène introuvable",
        "default_scene": "Scène par défaut",
        "order_mismatch": "L'ordre ne correspond pas aux scènes",
        "name_required": "Nom requis",
        "unknown_scene": "Scène inconnue",
        "unknown_model": "modèle inconnu",
        "tap_single": "Simple",
        "tap_double": "Double",
        "tap_long": "Long",
        "switch_button": "{switch} · Bouton {button} ({tap}){suffix}",
    },
}

_LOGGER = logging.getLogger(__name__)

PANEL_URL_PATH = "homex"
STATIC_URL = "/homex_static"
PANEL_VERSION = "210"
PANEL_REGISTERED = "_panel_registered"

ID_RE = re.compile(r"^[a-z0-9_]+$")

# Global switch layouts + global switches (switches module) — stored outside the
# config entries in a dedicated Store, so editing them never reloads the
# integration. One store document holds {"layouts": [...], "switches": [...]}.
STORE_KEY = "homex_layouts"
STORE_HANDLE = "_switch_store"
STORE_DATA = "_switch_store_data"


def _switch_store(hass: HomeAssistant) -> Store:
    data = hass.data.setdefault(DOMAIN, {})
    store = data.get(STORE_HANDLE)
    if store is None:
        store = Store(hass, 1, STORE_KEY)
        data[STORE_HANDLE] = store
    return store


async def _store_doc(hass: HomeAssistant) -> dict:
    data = hass.data.setdefault(DOMAIN, {})
    if STORE_DATA not in data:
        loaded = await _switch_store(hass).async_load() or {}
        data[STORE_DATA] = {
            "layouts": list(loaded.get("layouts", [])),
            "switches": list(loaded.get("switches", [])),
            "presets": list(loaded.get("presets", [])),
            "shutter_presets": list(loaded.get("shutter_presets", [])),
        }
    return data[STORE_DATA]


async def _get_layouts(hass: HomeAssistant) -> list[dict]:
    return (await _store_doc(hass))["layouts"]


async def _set_layouts(hass: HomeAssistant, layouts: list[dict]) -> None:
    doc = await _store_doc(hass)
    doc["layouts"] = layouts
    await _switch_store(hass).async_save(doc)


async def _get_gswitches(hass: HomeAssistant) -> list[dict]:
    return (await _store_doc(hass))["switches"]


async def _set_gswitches(hass: HomeAssistant, switches: list[dict]) -> None:
    doc = await _store_doc(hass)
    doc["switches"] = switches
    await _switch_store(hass).async_save(doc)


async def _get_presets(hass: HomeAssistant) -> list[dict]:
    return (await _store_doc(hass))["presets"]


async def _set_presets(hass: HomeAssistant, presets: list[dict]) -> None:
    doc = await _store_doc(hass)
    doc["presets"] = presets
    await _switch_store(hass).async_save(doc)


async def _get_shutter_presets(hass: HomeAssistant) -> list[dict]:
    return (await _store_doc(hass))["shutter_presets"]


async def _set_shutter_presets(hass: HomeAssistant, presets: list[dict]) -> None:
    doc = await _store_doc(hass)
    doc["shutter_presets"] = presets
    await _switch_store(hass).async_save(doc)


async def _rewire_switches(hass: HomeAssistant) -> None:
    """Re-attach switch button triggers after the switch/preset store changes."""
    hub = hass.data.get(DOMAIN, {}).get(HUB_DATA)
    if hub is not None:
        await hub.async_rewire_switches()


async def _resync_shutters(hass: HomeAssistant) -> None:
    """Re-watch shutter motion after the shutter preset store changes."""
    hub = hass.data.get(DOMAIN, {}).get(HUB_DATA)
    if hub is not None:
        await hub.async_sync_shutters()


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
        ws_rooms_import,
        ws_setup_shutter_plan,
        ws_room_update,
        ws_room_delete,
        ws_room_sync_labels,
        ws_room_dim,
        ws_room_shutter,
        ws_group_add,
        ws_group_update,
        ws_group_delete,
        ws_shutter_group_add,
        ws_shutter_group_update,
        ws_shutter_group_delete,
        ws_switch_add,
        ws_switch_update,
        ws_switch_delete,
        ws_layouts,
        ws_layout_save,
        ws_layout_delete,
        ws_gswitches,
        ws_gswitch_save,
        ws_gswitch_delete,
        ws_presets,
        ws_preset_save,
        ws_preset_delete,
        ws_switch_models,
        ws_switch_devices,
        ws_shutter_presets,
        ws_shutter_preset_save,
        ws_shutter_preset_delete,
        ws_shutter_models,
        ws_z2m_state,
        ws_scene_add,
        ws_scene_delete,
        ws_scene_reorder,
        ws_scene_rename,
        ws_scene_next,
        ws_scene_activate,
        ws_settings_get,
        ws_settings_set,
        *HEATING_WS_COMMANDS,
        *HEATING_ZONE_WS_COMMANDS,
        *HEATING_SYSTEM_WS_COMMANDS,
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
        sidebar_icon="homex:logo",
        require_admin=False,
    )
    # Lovelace cards (custom:homex-room-tile), loaded on every dashboard.
    from homeassistant.components.frontend import add_extra_js_url

    add_extra_js_url(hass, f"{STATIC_URL}/homex-cards.js?v={PANEL_VERSION}")

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


def _serialize_shutter_group(g: dict) -> dict:
    """A shutter group for the panel (normalized triggers + removable flag)."""
    gid = g.get("id")
    return {
        "id": gid,
        "name": g.get("name") or gid,
        "devices": list(g.get("devices", []) or []),
        "toggle_triggers": normalize_trigger_specs(g.get("toggle_triggers")),
        "open_triggers": normalize_trigger_specs(g.get("open_triggers")),
        "close_triggers": normalize_trigger_specs(g.get("close_triggers")),
        "stop_triggers": normalize_trigger_specs(g.get("stop_triggers")),
        "removable": gid != DEFAULT_SHUTTER_GROUP,
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


_TAP_LABELS = {"single": "tap_single", "double": "tap_double", "long": "tap_long"}


async def _switch_triggers_for_room(hass: HomeAssistant, room_id: str) -> dict:
    """Read-only triggers a room's actions receive from global switch buttons.

    Grouped by target so each Lights-module trigger UI can show the extra,
    Switches-managed triggers next to the editable ones.
    """
    out: dict = {
        "toggle": [],
        "scene_next": [],
        "dim_up": [],
        "dim_down": [],
        "scenes": {},
        "groups": {},
    }
    switches = await _get_gswitches(hass)
    if not switches:
        return out
    presets = await _get_presets(hass)
    dev_reg = dr.async_get(hass)

    def _preset(sw):
        device_id = sw.get("device_id")
        dev = dev_reg.async_get(device_id) if device_id else None
        if dev is None:
            return None
        key = f"{dev.manufacturer or ''}|{dev.model or ''}"
        of_model = [p for p in presets if p.get("model") == key]
        preset_id = sw.get("preset_id")
        if preset_id:
            chosen = next((p for p in of_model if p.get("id") == preset_id), None)
            if chosen:
                return chosen
        return of_model[0] if of_model else None

    for sw in switches:
        preset = _preset(sw)
        bindings = (preset or {}).get("bindings") or {}
        for tap_mode, by_btn in (sw.get("mappings") or {}).items():
            if not isinstance(by_btn, dict):
                continue
            for btn, entry in by_btn.items():
                if not isinstance(entry, dict) or entry.get("room") != room_id:
                    continue
                action = entry.get("action") or {}
                kind = action.get("kind")
                tap = (
                    tr(hass, _STRINGS, _TAP_LABELS[tap_mode])
                    if tap_mode in _TAP_LABELS
                    else tap_mode
                )
                dev_actions = (bindings.get(tap_mode) or {}).get(btn) or []
                suffix = f" → {', '.join(dev_actions)}" if dev_actions else ""
                label = tr(
                    hass,
                    _STRINGS,
                    "switch_button",
                    switch=sw.get("name", "?"),
                    button=btn,
                    tap=tap,
                    suffix=suffix,
                )
                if kind in ("toggle", "scene_next", "dim_up", "dim_down"):
                    out[kind].append(label)
                elif kind == "scene":
                    out["scenes"].setdefault(
                        action.get("scene_key", ""), []
                    ).append(label)
                elif kind == "group":
                    out["groups"].setdefault(
                        action.get("group_id", ""), []
                    ).append(label)
    return out


@websocket_api.websocket_command({vol.Required("type"): "homex/rooms"})
@websocket_api.async_response
async def ws_list_rooms(hass: HomeAssistant, connection, msg) -> None:
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
                "modules": controller.modules,
                "heating": _clean_heating(room.get(CONF_HEATING)),
                "metrics": _clean_metrics(room.get(CONF_METRICS)),
                **_serialize_unit(units[0]),
                "triggers": controller.trigger_specs,
                "scene_triggers": controller.scene_trigger_specs,
                "dim_up_triggers": controller.dim_up_trigger_specs,
                "dim_down_triggers": controller.dim_down_trigger_specs,
                "scene_strategy": controller.scene_strategy,
                "scenes": _room_scenes(controller),
                "switches": controller.switches,
                "shutter_groups": [
                    _serialize_shutter_group(g) for g in controller.shutter_groups
                ],
                "switch_triggers": await _switch_triggers_for_room(
                    hass, controller.room_id
                ),
                "groups": [
                    {
                        "group_id": unit.key,
                        **_serialize_unit(unit),
                        "dim": unit.dim_enabled,
                        "dim_up_triggers": unit.dim_up_specs,
                        "dim_down_triggers": unit.dim_down_specs,
                    }
                    for unit in units[1:]
                ],
            }
        )
    connection.send_result(msg["id"], {"rooms": rooms})


# -- Settings ------------------------------------------------------------------


@websocket_api.websocket_command({vol.Required("type"): "homex/settings/get"})
@callback
def ws_settings_get(hass: HomeAssistant, connection, msg) -> None:
    """Homex settings the panel and cards need (any user: cards read it)."""
    connection.send_result(
        msg["id"], {"language": language_setting(hass), "active_language": language(hass)}
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/settings/set",
        vol.Required("language"): vol.In([LANGUAGE_AUTO, *LANGUAGES]),
    }
)
@websocket_api.async_response
async def ws_settings_set(hass: HomeAssistant, connection, msg) -> None:
    """Set the Homex language ("auto" follows Home Assistant). Reloads Homex
    so entity and scene names follow."""
    hub = _hub_entry(hass)
    if hub is None:
        connection.send_error(msg["id"], "not_installed", tr(hass, _STRINGS, "not_installed"))
        return
    hass.config_entries.async_update_entry(
        hub, options={**hub.options, CONF_LANGUAGE: msg["language"]}
    )
    connection.send_result(msg["id"], {"language": msg["language"]})


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


def _clean_metrics(raw) -> dict:
    """Climate metrics config: per known metric, sensors (unique, weight > 0)
    and a rule; metrics without sensors are dropped."""
    out = {}
    for metric in METRICS:
        cfg = (raw or {}).get(metric) or {}
        sensors, seen = [], set()
        for sensor in cfg.get("sensors", []) or []:
            entity_id = str((sensor or {}).get("entity_id") or "")
            if not entity_id or entity_id in seen:
                continue
            seen.add(entity_id)
            try:
                weight = float(sensor.get("weight") or 1)
            except (TypeError, ValueError):
                weight = 1.0
            sensors.append({"entity_id": entity_id, "weight": max(weight, 0.0)})
        if sensors:
            rule = cfg.get("rule") if cfg.get("rule") in METRIC_RULES else "mean"
            out[metric] = {"sensors": sensors, "rule": rule}
    return out


def _clean_heating(raw) -> dict:
    """The Heating module config: radiators {device_id, preset_id} (unique)."""
    radiators, seen = [], set()
    for rad in (raw or {}).get("radiators", []) or []:
        device_id = str((rad or {}).get("device_id") or "")
        if not device_id or device_id in seen:
            continue
        seen.add(device_id)
        radiators.append(
            {
                "device_id": device_id,
                "preset_id": str(rad.get("preset_id") or ""),
                # Temperature sensor fed to the valve (external-sensor presets).
                "external_sensor": str(rad.get("external_sensor") or ""),
            }
        )
    # The room's own heating switch: off = Unheated, whatever its zone's mode.
    return {"radiators": radiators, "enabled": (raw or {}).get("enabled", True) is not False}


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
                    "name": scene.get("name")
                    or default_name(controller.hass, "scene_on_default"),
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
    (otherwise it stays implicit with the default 'Éteint' / 'Off' label).
    """
    off = controller.off_name if off_name is None else off_name
    if off_triggers is None:
        off_triggers = controller.scene_trigger_specs_for("turn_off")
    scenes = [dict(s) for s in ordered]
    if (off and not is_default_name("scene_off_default", off)) or off_triggers:
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
        vol.Optional("modules"): [str],
        vol.Optional("heating"): dict,
        vol.Optional("metrics"): dict,
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
        connection.send_error(msg["id"], "invalid_id", tr(hass, _STRINGS, "invalid_room_id"))
        return
    hub = _hub_entry(hass)
    if hub is None:
        connection.send_error(msg["id"], "not_installed", tr(hass, _STRINGS, "not_installed"))
        return
    if _find_subentry(hub, room_id):
        connection.send_error(msg["id"], "id_exists", tr(hass, _STRINGS, "room_exists"))
        return

    data = {
        CONF_ROOM_ID: room_id,
        CONF_ROOM_NAME: msg["name"],
        CONF_AREA_ID: msg.get("area_id") or None,
        CONF_MODULES: msg.get("modules", list(DEFAULT_MODULES)),
        CONF_HEATING: _clean_heating(msg.get("heating")),
        CONF_METRICS: _clean_metrics(msg.get("metrics")),
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


def _new_room_data(
    room_id: str,
    name: str,
    area_id: str | None,
    modules: list[str] | None = None,
    devices: list[str] | None = None,
) -> dict:
    """Stored data of a new room: the given modules (none by default) and
    lights, nothing else wired."""
    return {
        CONF_ROOM_ID: room_id,
        CONF_ROOM_NAME: name,
        CONF_AREA_ID: area_id or None,
        CONF_MODULES: list(modules or []),
        CONF_HEATING: _clean_heating(None),
        CONF_METRICS: _clean_metrics(None),
        CONF_DEVICES: list(devices or []),
        CONF_TRIGGERS: [],
        CONF_SCENE_TRIGGERS: [],
        CONF_SCENE_STRATEGY: STRATEGY_RECALL_FIRST,
        CONF_GROUPS: [],
        CONF_SCENES: [],
    }


# Zigbee2MQTT motion fields worth a smart toggle, by preference, and the
# patterns of their up / down / stopped values.
_Z2M_MOTION_FIELDS = ("moving", "motor_state", "motor_run_status", "running_state")
_MOTION_PATTERNS = {
    "moving_up": re.compile(r"^(up|open|opening|rising)$", re.I),
    "moving_down": re.compile(r"^(down|close|closing|falling)$", re.I),
    "stopped": re.compile(r"^(stop|stopped|idle|pause|paused|stopping)$", re.I),
}


def _z2m_motion(fields: dict[str, list[str]] | None) -> dict | None:
    """Smart-toggle conditions from a Z2M device's enum exposes, when one of
    them tells up / down / stopped apart."""
    candidates = [f for f in _Z2M_MOTION_FIELDS if f in (fields or {})]
    candidates += [f for f in (fields or {}) if f not in candidates]
    for field in candidates:
        values = fields[field]
        conds = {}
        for motion, pattern in _MOTION_PATTERNS.items():
            value = next((v for v in values if pattern.match(v)), None)
            if value is None:
                break
            conds[motion] = {"source": "z2m", "field": field, "state": value}
        else:
            return conds
    return None


# Smart toggle from the cover entity's own state: works with any integration.
_COVER_MOTION = {
    "moving_up": {"source": "cover", "state": "opening"},
    "moving_down": {"source": "cover", "state": "closing"},
    "stopped": {"source": "cover", "state": "open|closed"},
}


@websocket_api.websocket_command(
    {vol.Required("type"): "homex/setup/shutter_plan", vol.Required("covers"): [str]}
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_setup_shutter_plan(hass: HomeAssistant, connection, msg) -> None:
    """Setup wizard: the models of these covers, each with its existing
    shutter preset or a suggested one (smart toggle from a Zigbee2MQTT motion
    field when the model exposes one, else from the cover's own state)."""
    from .shutter import cover_device, model_key

    dev_reg = dr.async_get(hass)
    bridge = hass.data[DOMAIN][Z2M_BRIDGE]
    presets = await _get_shutter_presets(hass)
    models: dict[str, dict] = {}
    for cover in dict.fromkeys(msg["covers"]):
        device_id = cover_device(hass, cover)
        key = model_key(hass, device_id)
        dev = dev_reg.async_get(device_id) if device_id else None
        if not key or dev is None:
            continue
        model = models.get(key)
        if model is None:
            label = " ".join(p for p in (dev.manufacturer, dev.model) if p) or tr(
                hass, _STRINGS, "unknown_model"
            )
            existing = next(
                (p for p in presets if p.get("model") == key and p.get("smart_toggle")),
                None,
            ) or next((p for p in presets if p.get("model") == key), None)
            model = models[key] = {
                "model": key,
                "label": label,
                "device_id": device_id,
                "covers": [],
                "existing": (
                    {"id": existing["id"], "name": existing.get("name"),
                     "smart_toggle": bool(existing.get("smart_toggle"))}
                    if existing
                    else None
                ),
                "suggested": None,
            }
            if existing is None:
                conds = _z2m_motion(await bridge.async_enum_fields(device_id))
                source = "z2m" if conds else "cover"
                base = _slugify(label) or "shutter"
                taken = {p.get("id") for p in presets} | {
                    m["suggested"]["id"] for m in models.values() if m["suggested"]
                }
                pid, i = base, 2
                while pid in taken:
                    pid, i = f"{base}_{i}", i + 1
                model["suggested"] = {
                    "id": pid,
                    "name": label,
                    "model": key,
                    "model_label": label,
                    "device_id": device_id,
                    "smart_toggle": True,
                    **(conds or _COVER_MOTION),
                }
                model["detection"] = (
                    {"source": "z2m", "field": conds["moving_up"]["field"]}
                    if conds
                    else {"source": source}
                )
        model["covers"].append(cover)
    connection.send_result(
        msg["id"], {"models": sorted(models.values(), key=lambda m: m["label"].lower())}
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/rooms/import",
        vol.Required("rooms"): [
            {
                vol.Required("name"): str,
                vol.Required("room_id"): str,
                vol.Optional("area_id"): vol.Any(str, None),
                # Modules to enable (none by default) and the lights module's
                # devices (light entity ids).
                # Covers of the shutters module's default group.
                vol.Optional("shutters"): [str],
                vol.Optional("modules"): [
                    vol.In([MODULE_LIGHTS, MODULE_SWITCHES, MODULE_SHUTTERS, MODULE_HEATING])
                ],
                vol.Optional("devices"): [str],
            }
        ],
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_rooms_import(hass: HomeAssistant, connection, msg) -> None:
    """Create several rooms at once (setup wizard: import the HA areas).

    Every room is validated first (nothing is created when one is invalid),
    then added with Homex's reload held, and Homex reloads once."""
    hub = _hub_entry(hass)
    if hub is None:
        connection.send_error(msg["id"], "not_installed", tr(hass, _STRINGS, "not_installed"))
        return
    seen: set[str] = set()
    rooms = []
    for room in msg["rooms"]:
        room_id = room["room_id"].strip().lower()
        if not ID_RE.match(room_id):
            connection.send_error(msg["id"], "invalid_id", tr(hass, _STRINGS, "invalid_room_id"))
            return
        if room_id in seen or _find_subentry(hub, room_id):
            connection.send_error(msg["id"], "id_exists", tr(hass, _STRINGS, "room_exists"))
            return
        seen.add(room_id)
        rooms.append(
            (
                room_id,
                room["name"].strip() or room_id,
                room.get("area_id"),
                room.get("modules", []),
                room.get("devices", []),
                room.get("shutters", []),
            )
        )
    if not rooms:
        connection.send_result(msg["id"], {"created": []})
        return
    domain_data = hass.data.setdefault(DOMAIN, {})
    domain_data[HOLD_RELOAD] = True
    try:
        for room_id, name, area_id, modules, devices, shutters in rooms:
            data = _new_room_data(room_id, name, area_id, modules, devices)
            if shutters:
                if MODULE_SHUTTERS not in data[CONF_MODULES]:
                    data[CONF_MODULES].append(MODULE_SHUTTERS)
                data[CONF_SHUTTER_GROUPS] = [
                    {
                        "id": DEFAULT_SHUTTER_GROUP,
                        "name": DEFAULT_SHUTTER_GROUP_NAME,
                        "devices": list(dict.fromkeys(shutters)),
                        "toggle_triggers": [],
                        "open_triggers": [],
                        "close_triggers": [],
                        "stop_triggers": [],
                    }
                ]
            hass.config_entries.async_add_subentry(
                hub,
                ConfigSubentry(
                    data=data,
                    subentry_type="room",
                    title=name,
                    unique_id=room_id,
                ),
            )
        # The update listeners run as tasks: let them see the hold first.
        await asyncio.sleep(0.5)
        await hass.config_entries.async_reload(hub.entry_id)
    finally:
        domain_data[HOLD_RELOAD] = False
    connection.send_result(msg["id"], {"created": [r[0] for r in rooms]})


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
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
        return

    controller = _controller(hass, hub, dict(sub.data))
    if msg["delete_scenes"]:
        await controller.async_remove_scenes()
    _remove_room_entities(hass, controller)

    hass.config_entries.async_remove_subentry(hub, sub.subentry_id)
    await async_forget_heating_room(hass, sub.data.get(CONF_ROOM_ID, ""))
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
        vol.Optional("modules"): [str],
        vol.Optional("heating"): dict,
        vol.Optional("metrics"): dict,
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
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
        return

    room = dict(sub.data)
    old_id = room.get(CONF_ROOM_ID)
    new_id = msg.get("room_id", old_id).strip().lower()
    if not ID_RE.match(new_id):
        connection.send_error(msg["id"], "invalid_id", tr(hass, _STRINGS, "invalid_room_id"))
        return
    if new_id != old_id and _find_subentry(hub, new_id):
        connection.send_error(msg["id"], "id_exists", tr(hass, _STRINGS, "room_exists"))
        return

    if new_id != old_id:
        await _rename_room(hass, old_id, new_id, hub.entry_id)
        await async_rename_heating_room(hass, old_id, new_id)

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
    if "heating" in msg:
        room[CONF_HEATING] = _clean_heating(msg["heating"])
    if "metrics" in msg:
        room[CONF_METRICS] = _clean_metrics(msg["metrics"])

    # Modules: when the lights module is turned off, tear down its entities and
    # scenes (they are recreated if it is turned back on).
    if "modules" in msg:
        old_modules = sub.data.get(CONF_MODULES)
        old_lights = MODULE_LIGHTS in (
            list(DEFAULT_MODULES) if old_modules is None else old_modules
        )
        new_lights = MODULE_LIGHTS in msg["modules"]
        room[CONF_MODULES] = msg["modules"]
        if old_lights and not new_lights:
            old_controller = _controller(hass, hub, dict(sub.data))
            await old_controller.async_remove_scenes()
            _remove_room_entities(hass, old_controller)

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
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
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
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
        return
    live = hass.data.get(DOMAIN, {}).get(HUB_DATA)
    controller = (
        live.controllers.get(msg["entry_id"]) if live else None
    ) or _controller(hass, hub, dict(sub.data))
    await controller.async_dim(msg["delta"])
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/room/shutter",
        vol.Required("entry_id"): str,
        vol.Required("group_id"): str,
        vol.Required("service"): vol.In(["open_cover", "close_cover", "stop_cover"]),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_room_shutter(hass: HomeAssistant, connection, msg) -> None:
    """Open / close / stop one shutter group of the room, like a switch would
    (so the smart toggle remembers the direction)."""
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
        return
    live = hass.data.get(DOMAIN, {}).get(HUB_DATA)
    controller = (
        live.controllers.get(msg["entry_id"]) if live else None
    ) or _controller(hass, hub, dict(sub.data))
    await controller.async_shutter(msg["group_id"], msg["service"])
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/group/add",
        vol.Required("entry_id"): str,
        vol.Required("group_id"): str,
        vol.Required("name"): str,
        vol.Required("devices"): [str],
        vol.Optional("triggers"): list,
        vol.Optional("dim"): bool,
        vol.Optional("dim_up_triggers"): list,
        vol.Optional("dim_down_triggers"): list,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_group_add(hass: HomeAssistant, connection, msg) -> None:
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
        return
    room = dict(sub.data)

    group_id = msg["group_id"].strip().lower()
    if not ID_RE.match(group_id):
        connection.send_error(msg["id"], "invalid_id", tr(hass, _STRINGS, "invalid_group_id"))
        return

    groups = [dict(g) for g in room.get(CONF_GROUPS, [])]
    if any(g[CONF_GROUP_ID] == group_id for g in groups):
        connection.send_error(msg["id"], "group_exists", tr(hass, _STRINGS, "group_exists"))
        return

    groups.append(
        {
            CONF_GROUP_ID: group_id,
            CONF_GROUP_NAME: msg["name"],
            CONF_DEVICES: msg["devices"],
            CONF_TRIGGERS: msg.get("triggers", []),
            CONF_DIM: msg.get("dim", False),
            CONF_DIM_UP_TRIGGERS: msg.get("dim_up_triggers", []),
            CONF_DIM_DOWN_TRIGGERS: msg.get("dim_down_triggers", []),
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
        vol.Optional("dim"): bool,
        vol.Optional("dim_up_triggers"): list,
        vol.Optional("dim_down_triggers"): list,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_group_update(hass: HomeAssistant, connection, msg) -> None:
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
        return
    room = dict(sub.data)

    groups = [dict(g) for g in room.get(CONF_GROUPS, [])]
    group = next((g for g in groups if g[CONF_GROUP_ID] == msg["group_id"]), None)
    if group is None:
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_group"))
        return

    if "name" in msg:
        group[CONF_GROUP_NAME] = msg["name"]
    if "devices" in msg:
        group[CONF_DEVICES] = msg["devices"]
    if "triggers" in msg:
        group[CONF_TRIGGERS] = msg["triggers"]
    if "dim" in msg:
        group[CONF_DIM] = msg["dim"]
    if "dim_up_triggers" in msg:
        group[CONF_DIM_UP_TRIGGERS] = msg["dim_up_triggers"]
    if "dim_down_triggers" in msg:
        group[CONF_DIM_DOWN_TRIGGERS] = msg["dim_down_triggers"]

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
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
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


# -- Shutter groups (Shutters module) --------------------------------------


def _room_for_msg(hass, connection, msg):
    """(hub, subentry, room-dict) for a room WS message, or (None, None, None)."""
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
        return None, None, None
    return hub, sub, dict(sub.data)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/shutter_group/add",
        vol.Required("entry_id"): str,
        vol.Required("name"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_shutter_group_add(hass: HomeAssistant, connection, msg) -> None:
    hub, sub, room = _room_for_msg(hass, connection, msg)
    if hub is None:
        return
    groups = [dict(g) for g in room.get(CONF_SHUTTER_GROUPS, [])]
    taken = {g.get("id") for g in groups} | {DEFAULT_SHUTTER_GROUP}
    base = _slugify(msg["name"]) or "group"
    gid, i = base, 2
    while gid in taken:
        gid, i = f"{base}_{i}", i + 1
    groups.append(
        {
            "id": gid,
            "name": msg["name"],
            "devices": [],
            "toggle_triggers": [],
            "open_triggers": [],
            "close_triggers": [],
            "stop_triggers": [],
        }
    )
    room[CONF_SHUTTER_GROUPS] = groups
    _save_room(hass, hub, sub, room)
    connection.send_result(msg["id"], {"ok": True, "group_id": gid})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/shutter_group/update",
        vol.Required("entry_id"): str,
        vol.Required("group_id"): str,
        vol.Optional("name"): str,
        vol.Optional("devices"): [str],
        vol.Optional("toggle_triggers"): list,
        vol.Optional("open_triggers"): list,
        vol.Optional("close_triggers"): list,
        vol.Optional("stop_triggers"): list,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_shutter_group_update(hass: HomeAssistant, connection, msg) -> None:
    hub, sub, room = _room_for_msg(hass, connection, msg)
    if hub is None:
        return
    gid = msg["group_id"]
    groups = [dict(g) for g in room.get(CONF_SHUTTER_GROUPS, [])]
    group = next((g for g in groups if g.get("id") == gid), None)
    if group is None:
        # Upsert (e.g. first edit of the synthesized default 'Général' group).
        group = {
            "id": gid,
            "name": (
                default_name(hass, "shutter_group_default")
                if gid == DEFAULT_SHUTTER_GROUP
                else gid
            ),
            "devices": [],
        }
        groups.append(group)
    if "name" in msg:
        group["name"] = msg["name"]
    if "devices" in msg:
        group["devices"] = msg["devices"]
    for field in (
        "toggle_triggers",
        "open_triggers",
        "close_triggers",
        "stop_triggers",
    ):
        if field in msg:
            group[field] = msg[field]
    room[CONF_SHUTTER_GROUPS] = groups
    _save_room(hass, hub, sub, room)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/shutter_group/delete",
        vol.Required("entry_id"): str,
        vol.Required("group_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_shutter_group_delete(hass: HomeAssistant, connection, msg) -> None:
    hub, sub, room = _room_for_msg(hass, connection, msg)
    if hub is None:
        return
    if msg["group_id"] == DEFAULT_SHUTTER_GROUP:
        connection.send_error(
            msg["id"], "not_removable", tr(hass, _STRINGS, "default_group_not_removable")
        )
        return
    room[CONF_SHUTTER_GROUPS] = [
        g
        for g in room.get(CONF_SHUTTER_GROUPS, [])
        if g.get("id") != msg["group_id"]
    ]
    _save_room(hass, hub, sub, room)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command({vol.Required("type"): "homex/layouts"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_layouts(hass: HomeAssistant, connection, msg) -> None:
    """Return every global switch layout."""
    connection.send_result(msg["id"], {"layouts": await _get_layouts(hass)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/layout/save",
        vol.Required("layout"): dict,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_layout_save(hass: HomeAssistant, connection, msg) -> None:
    """Create or update a switch layout (upsert by its id)."""
    layout = dict(msg["layout"])
    layout_id = str(layout.get("id") or "").strip().lower()
    if not ID_RE.match(layout_id):
        connection.send_error(msg["id"], "invalid_id", tr(hass, _STRINGS, "invalid_layout_id"))
        return
    layout["id"] = layout_id
    layouts = [l for l in await _get_layouts(hass) if l.get("id") != layout_id]
    layouts.append(layout)
    await _set_layouts(hass, layouts)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/layout/delete",
        vol.Required("layout_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_layout_delete(hass: HomeAssistant, connection, msg) -> None:
    layouts = [
        l for l in await _get_layouts(hass) if l.get("id") != msg["layout_id"]
    ]
    await _set_layouts(hass, layouts)
    connection.send_result(msg["id"], {"ok": True})


async def _action_device_ids(hass: HomeAssistant) -> dict[str, list]:
    """Device triggers for every device that exposes an "action" trigger."""
    dev_reg = dr.async_get(hass)

    def with_action(autos: dict) -> dict[str, list]:
        return {
            dev_id: triggers
            for dev_id, triggers in autos.items()
            if any(t.get("type") == "action" for t in triggers)
        }

    # device_ids=None: HA lists every device itself. Passing list(dev_reg.devices)
    # broke in HA 2026.9 (iterating the registry now yields DeviceEntry objects,
    # not ids → DeviceNotFound), and None also skips devices whose integration
    # raises InvalidDeviceAutomationConfig instead of failing the whole call.
    try:
        return with_action(
            await async_get_device_automations(hass, DeviceAutomationType.TRIGGER)
        )
    except Exception:  # noqa: BLE001
        _LOGGER.debug("Bulk device trigger listing failed", exc_info=True)
    # Still failing: query device by device so the others still show up.
    autos: dict[str, list] = {}
    # Iterating the registry yields device ids before HA 2026.9, entries since.
    for dev_id in [getattr(d, "id", d) for d in dev_reg.devices]:
        try:
            autos.update(
                await async_get_device_automations(
                    hass, DeviceAutomationType.TRIGGER, [dev_id]
                )
            )
        except Exception:  # noqa: BLE001
            _LOGGER.debug("Device triggers failed for %s", dev_id, exc_info=True)
    return with_action(autos)


@websocket_api.websocket_command({vol.Required("type"): "homex/switch_devices"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_switch_devices(hass: HomeAssistant, connection, msg) -> None:
    """List individual switch-like devices (interrupteurs) for a switch."""
    dev_reg = dr.async_get(hass)
    out = []
    for dev_id in await _action_device_ids(hass):
        dev = dev_reg.async_get(dev_id)
        if dev is None:
            continue
        out.append(
            {
                "device_id": dev_id,
                "name": dev.name_by_user or dev.name or dev_id,
                "model": f"{dev.manufacturer or ''}|{dev.model or ''}",
                "model_label": " ".join(
                    p for p in (dev.manufacturer, dev.model) if p
                )
                or tr(hass, _STRINGS, "unknown_model"),
            }
        )
    connection.send_result(
        msg["id"],
        {"devices": sorted(out, key=lambda d: d["name"].lower())},
    )


@websocket_api.websocket_command({vol.Required("type"): "homex/switch_models"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_switch_models(hass: HomeAssistant, connection, msg) -> None:
    """List unique models of switch-like devices (interrupteurs).

    A device is treated as a switch/remote when it exposes at least one device
    trigger of type "action" (Zigbee2MQTT button events). Grouped by model so
    a Device Preset targets a model, not an individual device.
    """
    dev_reg = dr.async_get(hass)
    models: dict[str, dict] = {}
    for dev_id in await _action_device_ids(hass):
        dev = dev_reg.async_get(dev_id)
        if dev is None:
            continue
        key = f"{dev.manufacturer or ''}|{dev.model or ''}"
        entry = models.get(key)
        if entry is None:
            models[key] = {
                "model": key,
                "label": " ".join(
                    p for p in (dev.manufacturer, dev.model) if p
                )
                or tr(hass, _STRINGS, "unknown_model"),
                "device_id": dev_id,  # a sample device to resolve the actions
                "count": 1,
            }
        else:
            entry["count"] += 1
    connection.send_result(
        msg["id"],
        {"models": sorted(models.values(), key=lambda m: m["label"].lower())},
    )


@websocket_api.websocket_command({vol.Required("type"): "homex/shutter_models"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_shutter_models(hass: HomeAssistant, connection, msg) -> None:
    """Unique models of shutter devices (devices that own a cover entity).

    Each model lists its devices so a Shutter Device Preset can pick a reference
    device to derive its actions/sensors from.
    """
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    by_model: dict[str, dict] = {}
    seen: set[str] = set()
    for entity in ent_reg.entities.values():
        if entity.domain != "cover" or not entity.device_id:
            continue
        dev = dev_reg.async_get(entity.device_id)
        if dev is None:
            continue
        key = f"{dev.manufacturer or ''}|{dev.model or ''}"
        model = by_model.setdefault(
            key,
            {
                "model": key,
                "label": " ".join(
                    p for p in (dev.manufacturer, dev.model) if p
                )
                or tr(hass, _STRINGS, "unknown_model"),
                "device_id": entity.device_id,
                "devices": [],
            },
        )
        if entity.device_id not in seen:
            seen.add(entity.device_id)
            model["devices"].append(
                {
                    "device_id": entity.device_id,
                    "name": dev.name_by_user or dev.name or entity.device_id,
                }
            )
    for model in by_model.values():
        model["count"] = len(model["devices"])
    connection.send_result(
        msg["id"],
        {"models": sorted(by_model.values(), key=lambda m: m["label"].lower())},
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/z2m/state",
        vol.Required("device_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_z2m_state(hass: HomeAssistant, connection, msg) -> None:
    """A device's Zigbee2MQTT JSON state, flattened (for condition fields).

    ``available`` is False when the device is not a Z2M device or MQTT is not
    set up; ``fields`` is then empty.
    """
    from .z2m import Z2MBridge, flatten_fields

    bridge = hass.data.setdefault(DOMAIN, {}).setdefault(Z2M_BRIDGE, Z2MBridge(hass))
    topic = await bridge.async_topic(msg["device_id"])
    state = await bridge.async_fetch(msg["device_id"]) if topic else None
    fields = [
        {"field": k, "value": v}
        for k, v in sorted(flatten_fields(state or {}).items())
    ]
    connection.send_result(
        msg["id"], {"available": bool(topic), "topic": topic, "fields": fields}
    )


@websocket_api.websocket_command({vol.Required("type"): "homex/shutter_presets"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_shutter_presets(hass: HomeAssistant, connection, msg) -> None:
    """Return every shutter device preset (per shutter model)."""
    connection.send_result(
        msg["id"], {"presets": await _get_shutter_presets(hass)}
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/shutter_preset/save",
        vol.Required("preset"): dict,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_shutter_preset_save(hass: HomeAssistant, connection, msg) -> None:
    """Create or update a shutter device preset (upsert by id)."""
    preset = dict(msg["preset"])
    pid = str(preset.get("id") or "").strip().lower()
    if not ID_RE.match(pid):
        connection.send_error(msg["id"], "invalid_id", tr(hass, _STRINGS, "invalid_preset_id"))
        return
    preset["id"] = pid
    presets = [p for p in await _get_shutter_presets(hass) if p.get("id") != pid]
    presets.append(preset)
    await _set_shutter_presets(hass, presets)
    await _resync_shutters(hass)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/shutter_preset/delete",
        vol.Required("preset_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_shutter_preset_delete(hass: HomeAssistant, connection, msg) -> None:
    presets = [
        p
        for p in await _get_shutter_presets(hass)
        if p.get("id") != msg["preset_id"]
    ]
    await _set_shutter_presets(hass, presets)
    await _resync_shutters(hass)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command({vol.Required("type"): "homex/presets"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_presets(hass: HomeAssistant, connection, msg) -> None:
    """Return every device preset (standard mapping per device model)."""
    connection.send_result(msg["id"], {"presets": await _get_presets(hass)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/preset/save",
        vol.Required("preset"): dict,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_preset_save(hass: HomeAssistant, connection, msg) -> None:
    """Create or update a device preset (upsert by its id)."""
    preset = dict(msg["preset"])
    pid = str(preset.get("id") or "").strip().lower()
    if not ID_RE.match(pid):
        connection.send_error(msg["id"], "invalid_id", tr(hass, _STRINGS, "invalid_preset_id"))
        return
    preset["id"] = pid
    presets = [p for p in await _get_presets(hass) if p.get("id") != pid]
    presets.append(preset)
    await _set_presets(hass, presets)
    await _rewire_switches(hass)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/preset/delete",
        vol.Required("preset_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_preset_delete(hass: HomeAssistant, connection, msg) -> None:
    presets = [
        p for p in await _get_presets(hass) if p.get("id") != msg["preset_id"]
    ]
    await _set_presets(hass, presets)
    await _rewire_switches(hass)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command({vol.Required("type"): "homex/switches"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_gswitches(hass: HomeAssistant, connection, msg) -> None:
    """Return every global switch (Switch Management)."""
    connection.send_result(msg["id"], {"switches": await _get_gswitches(hass)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/switch/save",
        vol.Required("switch"): dict,
        vol.Optional("create", default=False): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_gswitch_save(hass: HomeAssistant, connection, msg) -> None:
    """Create or update a global switch (upsert by its id).

    When `create` is set, a colliding id is rejected instead of overwriting the
    existing switch.
    """
    sw = dict(msg["switch"])
    sw_id = str(sw.get("id") or "").strip().lower()
    if not ID_RE.match(sw_id):
        connection.send_error(msg["id"], "invalid_id", tr(hass, _STRINGS, "invalid_switch_id"))
        return
    sw["id"] = sw_id
    existing = await _get_gswitches(hass)
    if msg["create"] and any(s.get("id") == sw_id for s in existing):
        connection.send_error(
            msg["id"], "id_exists", tr(hass, _STRINGS, "gswitch_exists", id=sw_id)
        )
        return
    switches = [s for s in existing if s.get("id") != sw_id]
    switches.append(sw)
    await _set_gswitches(hass, switches)
    await _rewire_switches(hass)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/switch/remove",
        vol.Required("switch_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_gswitch_delete(hass: HomeAssistant, connection, msg) -> None:
    switches = [
        s for s in await _get_gswitches(hass) if s.get("id") != msg["switch_id"]
    ]
    await _set_gswitches(hass, switches)
    await _rewire_switches(hass)
    connection.send_result(msg["id"], {"ok": True})


def _switch_fields(msg: dict) -> dict:
    """The stored representation of a switch from a WS message."""
    return {
        "id": msg["switch_id"],
        "name": msg["name"],
        "buttons": int(msg.get("buttons", 1)),
        "dim": bool(msg.get("dim", False)),
        # Visual layout: a columns x rows grid; layout is a flat list of button
        # keys ("button_1"...) or "" for an empty cell, in reading order.
        "columns": int(msg.get("columns", 1)),
        "rows": int(msg.get("rows", 1)),
        "layout": list(msg.get("layout", [])),
        "rooms": list(msg.get("rooms", [])),
        "triggers": dict(msg.get("triggers", {})),
    }


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/switch/add",
        vol.Required("entry_id"): str,
        vol.Required("switch_id"): str,
        vol.Required("name"): str,
        vol.Optional("buttons"): int,
        vol.Optional("dim"): bool,
        vol.Optional("columns"): int,
        vol.Optional("rows"): int,
        vol.Optional("layout"): [str],
        vol.Optional("rooms"): [str],
        vol.Optional("triggers"): dict,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_switch_add(hass: HomeAssistant, connection, msg) -> None:
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
        return
    room = dict(sub.data)

    switch_id = msg["switch_id"].strip().lower()
    if not ID_RE.match(switch_id):
        connection.send_error(msg["id"], "invalid_id", tr(hass, _STRINGS, "invalid_switch_id"))
        return
    switches = [dict(s) for s in room.get(CONF_SWITCHES, [])]
    if any(s.get("id") == switch_id for s in switches):
        connection.send_error(msg["id"], "switch_exists", tr(hass, _STRINGS, "switch_exists"))
        return

    switches.append({**_switch_fields(msg), "id": switch_id})
    room[CONF_SWITCHES] = switches
    _save_room(hass, hub, sub, room)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/switch/update",
        vol.Required("entry_id"): str,
        vol.Required("switch_id"): str,
        vol.Optional("name"): str,
        vol.Optional("buttons"): int,
        vol.Optional("dim"): bool,
        vol.Optional("columns"): int,
        vol.Optional("rows"): int,
        vol.Optional("layout"): [str],
        vol.Optional("rooms"): [str],
        vol.Optional("triggers"): dict,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_switch_update(hass: HomeAssistant, connection, msg) -> None:
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
        return
    room = dict(sub.data)

    switches = [dict(s) for s in room.get(CONF_SWITCHES, [])]
    target = next(
        (s for s in switches if s.get("id") == msg["switch_id"]), None
    )
    if target is None:
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_switch"))
        return
    for key in (
        "name", "buttons", "dim", "columns", "rows", "layout", "rooms", "triggers"
    ):
        if key in msg:
            target[key] = msg[key]
    room[CONF_SWITCHES] = switches
    _save_room(hass, hub, sub, room)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/switch/delete",
        vol.Required("entry_id"): str,
        vol.Required("switch_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_switch_delete(hass: HomeAssistant, connection, msg) -> None:
    hub = _hub_entry(hass)
    sub = _find_subentry(hub, msg["entry_id"]) if hub else None
    if hub is None or sub is None:
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
        return
    room = dict(sub.data)
    room[CONF_SWITCHES] = [
        s for s in room.get(CONF_SWITCHES, []) if s.get("id") != msg["switch_id"]
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
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
        return
    room = dict(sub.data)

    name = msg["name"].strip()
    key = _slugify(name)
    if not name or not key or key in ("turn_on", "turn_off"):
        connection.send_error(msg["id"], "invalid_id", tr(hass, _STRINGS, "invalid_scene_name"))
        return

    controller = _controller(hass, hub, room)
    # scene_order already includes turn_on, so persisting it keeps the order.
    order = [dict(s) for s in controller.scene_order]
    if any(s["key"] == key for s in order):
        connection.send_error(msg["id"], "scene_exists", tr(hass, _STRINGS, "scene_exists"))
        return

    attach = msg.get("attach")
    if attach:
        # Adopt the existing scene by renaming it to the Homex id (content kept).
        if not await _attach_existing_scene(
            hass, attach, controller.extra_scene_id(key)
        ):
            connection.send_error(msg["id"], "scene_not_found", tr(hass, _STRINGS, "scene_not_found"))
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
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
        return
    room = dict(sub.data)

    key = msg["key"]
    if key in ("turn_on", "turn_off"):
        connection.send_error(msg["id"], "not_removable", tr(hass, _STRINGS, "default_scene"))
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
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
        return
    room = dict(sub.data)

    controller = _controller(hass, hub, room)
    by_key = {s["key"]: s for s in controller.scene_order}
    new_keys = msg["order"]
    if set(new_keys) != set(by_key):
        connection.send_error(msg["id"], "invalid_order", tr(hass, _STRINGS, "order_mismatch"))
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
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
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
        vol.Required("type"): "homex/scene/activate",
        vol.Required("room_id"): str,
        vol.Required("key"): str,
    }
)
@websocket_api.async_response
async def ws_scene_activate(hass: HomeAssistant, connection, msg) -> None:
    """Activate one of a room's scenes (dashboards): like a scene trigger."""
    live = hass.data.get(DOMAIN, {}).get(HUB_DATA)
    controller = live.controllers.get(msg["room_id"]) if live else None
    if controller is None:
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
        return
    await controller.async_activate_scene_key(msg["key"])
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
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
        return
    room = dict(sub.data)

    key = msg["key"]
    name = msg["name"].strip()
    if not name:
        connection.send_error(msg["id"], "invalid_name", tr(hass, _STRINGS, "name_required"))
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
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_scene"))
        return
    for scene in order:
        if scene["key"] == key:
            scene["name"] = name
            if triggers is not None:
                scene["triggers"] = triggers
    room[CONF_SCENES] = _scenes_value(controller, order)
    _save_room(hass, hub, sub, room)
    # turn_on keeps its fixed label; extras embed their name.
    if key != "turn_on":
        await _set_scene_name(
            hass, controller.extra_scene_id(key), controller._pretty_name(key, name)
        )
    connection.send_result(msg["id"], {"ok": True})
