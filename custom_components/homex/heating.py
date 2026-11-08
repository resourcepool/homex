"""Heating Manager: Heating Modes (presets), Setpoints (heating groups:
setpoints per room set) and Device Presets.

Stored in a dedicated Store, outside the config entries, like the switches
module: editing them never reloads the integration. One document holds
{"presets": [...], "groups": [...]}.

- A preset is a heating mode. The built-in ones, Normal and Unheated, can be
  renamed but not deleted. A room's effective mode is its zone's mode, or
  Unheated when the room's own heating is disabled. Unheated keeps the room's
  valves off, unless its setpoint group gives Unheated a temperature.
- A heating group gives a temperature setpoint per preset to a set of rooms;
  every radiator of a Climate room gets the setpoint of its room's effective
  mode (climate.set_temperature, re-checked every 10 minutes).
  The built-in "default" group applies to every room not in another group;
  a room belongs to at most one group.
- A device preset fixes settings (tolerance, mode, lock, sensor) on every
  device of a thermostat model. When it sets an external temperature sensor,
  its "external_input" (a number entity) receives the temperature of the
  sensor each radiator of a room is given (see RadiatorEnforcer). Each setting targets one of the device's
  entities by domain + suffix (entity object id minus the device slug), so it
  applies to every device of the model.
"""

from __future__ import annotations

import logging
import re
from datetime import timedelta

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_time_interval,
)
from homeassistant.helpers.storage import Store

from .const import (
    CONF_HEATING,
    CONF_MODULES,
    CONF_ROOM_ID,
    DOMAIN,
    HUB_DATA,
    MODULE_HEATING,
)
from .i18n import tr
from .shutter import condition_entity

_LOGGER = logging.getLogger(__name__)

# User-facing strings (see i18n.py).
_STRINGS = {
    "en": {
        "preset_normal": "Normal",
        "preset_unheated": "Unheated",
        "group_default": "Default",
        "temp_out_of_range": "Temperature out of range ({min}–{max} °C)",
        "name_id_required": "Name and id required (a-z, 0-9, _)",
        "preset_exists": "A mode with the id “{id}” already exists.",
        "preset_builtin": "Default mode: cannot be deleted",
        "group_exists": "A setpoint with the id “{id}” already exists.",
        "group_builtin": "Default setpoint: cannot be deleted",
        "unsupported_domain": "Unsupported domain: {domain}",
        "entity_not_found": "entity not found",
        "unknown_model": "unknown model",
        "domain_not_allowed": "{key}: domain {domain} not allowed",
        "device_preset_required": "Name, id and model required",
        "device_preset_exists": "A device preset with the id “{id}” already exists.",
        "device_preset_unknown": "Unknown device preset",
        "unknown_room": "Unknown room",
    },
    "fr": {
        "preset_normal": "Normal",
        "preset_unheated": "Non chauffé",
        "group_default": "Défaut",
        "temp_out_of_range": "Température hors plage ({min}–{max} °C)",
        "name_id_required": "Nom et id requis (a-z, 0-9, _)",
        "preset_exists": "Un mode avec l'id « {id} » existe déjà.",
        "preset_builtin": "Mode par défaut : non supprimable",
        "group_exists": "Un setpoint avec l'id « {id} » existe déjà.",
        "group_builtin": "Setpoint par défaut : non supprimable",
        "unsupported_domain": "Domaine non géré : {domain}",
        "entity_not_found": "entité introuvable",
        "unknown_model": "modèle inconnu",
        "domain_not_allowed": "{key} : domaine {domain} non autorisé",
        "device_preset_required": "Nom, id et modèle requis",
        "device_preset_exists": "Un device preset avec l'id « {id} » existe déjà.",
        "device_preset_unknown": "Device preset inconnu",
        "unknown_room": "Pièce inconnue",
    },
}

# Built-in item id -> its default-name key: a built-in still carrying the
# default name of any language is shown in the active language.
_BUILTIN_PRESET_NAMES = {"normal": "preset_normal", "unheated": "preset_unheated"}


def _localized(hass: HomeAssistant, key: str, name: str | None) -> str:
    if not name or name in {_STRINGS[lang][key] for lang in _STRINGS}:
        return tr(hass, _STRINGS, key)
    return name


def preset_name(hass: HomeAssistant, preset: dict) -> str:
    """A heating mode's display name (built-in default names translated)."""
    key = _BUILTIN_PRESET_NAMES.get(preset.get("id"))
    name = preset.get("name") or preset.get("id") or ""
    return _localized(hass, key, name) if key else name


def group_name(hass: HomeAssistant, group: dict) -> str:
    """A setpoint group's display name (the default group's translated)."""
    if group.get("id") == DEFAULT_GROUP:
        return _localized(hass, "group_default", group.get("name"))
    return group.get("name") or group.get("id") or ""

STORE_KEY = "homex_heating"
STORE_HANDLE = "_heating_store"
STORE_DATA = "_heating_store_data"

ID_RE = re.compile(r"^[a-z0-9_]+$")

DEFAULT_GROUP = "default"
TEMP_MIN = 5.0
TEMP_MAX = 30.0
TEMP_STEP = 0.5

BUILTIN_PRESETS = [
    {"id": "normal", "name": "Normal", "builtin": True},
    # Heating cut (valves kept off), unless a setpoint group gives it a temperature.
    {"id": "unheated", "name": "Unheated", "builtin": True, "unheated": True},
]
UNHEATED = "unheated"
DEFAULT_SETPOINTS = {"normal": 20.0}
# Former built-in modes: kept on existing installs, as ordinary modes.
FORMER_BUILTINS = ("night", "absent", "away")

# Tolerance modes (select.homex_climate_tolerance_mode): a device preset's tolerance
# has a value per mode ("value" = normal, "value_agressive" = agressive).
TOLERANCE_MODES = ("normal", "agressive")

# Device preset settings and the entity domains each one may target.
DEVICE_PARAMS = {
    "tolerance": ("number",),
    "mode": ("climate", "select"),
    "lock": ("switch", "lock"),
    "sensor": ("select", "switch"),
}


def _store(hass: HomeAssistant) -> Store:
    data = hass.data.setdefault(DOMAIN, {})
    store = data.get(STORE_HANDLE)
    if store is None:
        store = Store(hass, 1, STORE_KEY)
        data[STORE_HANDLE] = store
    return store


async def _doc(hass: HomeAssistant) -> dict:
    """The heating document, with the built-in presets / default group ensured."""
    data = hass.data.setdefault(DOMAIN, {})
    if STORE_DATA not in data:
        loaded = await _store(hass).async_load() or {}
        presets = list(loaded.get("presets", []))
        for p in presets:
            if p.get("id") in FORMER_BUILTINS:
                p["builtin"] = False
            if p.get("id") == UNHEATED and p.get("name") == "Non chauffé":
                p["name"] = "Unheated"  # former default name
        # Every built-in exists (renamed ones keep their stored name); a
        # missing one goes after the last built-in already there.
        for builtin in BUILTIN_PRESETS:
            if any(p.get("id") == builtin["id"] for p in presets):
                continue
            last = max(
                (i for i, p in enumerate(presets) if p.get("builtin")), default=-1
            )
            presets.insert(last + 1, dict(builtin))
        groups = list(loaded.get("groups", []))
        if not any(g.get("id") == DEFAULT_GROUP for g in groups):
            groups.insert(
                0,
                {
                    "id": DEFAULT_GROUP,
                    "name": "Défaut",
                    "rooms": [],
                    "setpoints": dict(DEFAULT_SETPOINTS),
                    "builtin": True,
                },
            )
        data[STORE_DATA] = {
            "presets": presets,
            "groups": groups,
            "device_presets": list(loaded.get("device_presets", [])),
            "zones": list(loaded.get("zones", [])),
            # Global heating switch: off = every valve off, enforcement paused.
            "enabled": loaded.get("enabled", True),
            "tolerance_mode": loaded.get("tolerance_mode", "normal"),
            "systems": list(loaded.get("systems", [])),
            # Per radiator device: the {"mode", "setpoint"} last applied, so
            # a setpoint is only re-applied when its mode / value changes (a
            # manual setpoint holds until then, across restarts too).
            "applied_setpoints": dict(loaded.get("applied_setpoints", {})),
        }
    return data[STORE_DATA]


async def _save(hass: HomeAssistant) -> None:
    await _store(hass).async_save(await _doc(hass))


def _temp(hass: HomeAssistant, value) -> float:
    """A setpoint rounded to the 0.5 °C step, within the allowed range."""
    temp = round(float(value) / TEMP_STEP) * TEMP_STEP
    if not TEMP_MIN <= temp <= TEMP_MAX:
        raise vol.Invalid(
            tr(hass, _STRINGS, "temp_out_of_range", min=TEMP_MIN, max=TEMP_MAX)
        )
    return temp


def _clean_id(value) -> str | None:
    vid = str(value or "").strip().lower()
    return vid if ID_RE.match(vid) else None


@websocket_api.websocket_command({vol.Required("type"): "homex/heating"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_heating(hass: HomeAssistant, connection, msg) -> None:
    """Heating presets and heating groups."""
    from .heating_zones import ensure_zones, zone_label  # lazy: imports us

    doc = await _doc(hass)
    connection.send_result(
        msg["id"],
        {
            "presets": [
                {**p, "name": preset_name(hass, p)} for p in doc["presets"]
            ],
            "groups": [{**g, "name": group_name(hass, g)} for g in doc["groups"]],
            "device_presets": doc["device_presets"],
            "zones": [
                {**z, "name": zone_label(hass, z)} for z in ensure_zones(doc)
            ],
            "enabled": doc.get("enabled", True),
            "systems": doc.get("systems", []),
        },
    )


async def _modes_changed(hass: HomeAssistant) -> None:
    """Heating modes changed: let the zones refresh (select options, ...)."""
    from .heating_zones import zones_manager  # lazy: heating_zones imports us

    await zones_manager(hass).async_modes_changed()


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/heating/preset/save",
        vol.Required("preset"): dict,
        vol.Optional("create", default=False): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_heating_preset_save(hass: HomeAssistant, connection, msg) -> None:
    """Create or rename a heating preset (upsert by id)."""
    pid = _clean_id(msg["preset"].get("id"))
    name = str(msg["preset"].get("name") or "").strip()
    if not pid or not name:
        connection.send_error(msg["id"], "invalid", tr(hass, _STRINGS, "name_id_required"))
        return
    doc = await _doc(hass)
    existing = next((p for p in doc["presets"] if p.get("id") == pid), None)
    if existing is not None and msg["create"]:
        connection.send_error(
            msg["id"], "id_exists", tr(hass, _STRINGS, "preset_exists", id=pid)
        )
        return
    if existing is not None:
        existing["name"] = name
    else:
        doc["presets"].append({"id": pid, "name": name, "builtin": False})
    await _save(hass)
    await _modes_changed(hass)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/heating/preset/delete",
        vol.Required("preset_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_heating_preset_delete(hass: HomeAssistant, connection, msg) -> None:
    """Delete a custom preset, and its setpoint in every heating group."""
    doc = await _doc(hass)
    pid = msg["preset_id"]
    preset = next((p for p in doc["presets"] if p.get("id") == pid), None)
    if preset is not None and preset.get("builtin"):
        connection.send_error(msg["id"], "builtin", tr(hass, _STRINGS, "preset_builtin"))
        return
    doc["presets"] = [p for p in doc["presets"] if p.get("id") != pid]
    for group in doc["groups"]:
        group.get("setpoints", {}).pop(pid, None)
    await _save(hass)
    await _modes_changed(hass)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/heating/group/save",
        vol.Required("group"): dict,
        vol.Optional("create", default=False): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_heating_group_save(hass: HomeAssistant, connection, msg) -> None:
    """Create or update a heating group (upsert by id).

    Its rooms leave any other group (a room belongs to one group at most).
    """
    raw = msg["group"]
    gid = _clean_id(raw.get("id"))
    name = str(raw.get("name") or "").strip()
    if not gid or not name:
        connection.send_error(msg["id"], "invalid", tr(hass, _STRINGS, "name_id_required"))
        return
    doc = await _doc(hass)
    existing = next((g for g in doc["groups"] if g.get("id") == gid), None)
    if existing is not None and msg["create"]:
        connection.send_error(
            msg["id"], "id_exists", tr(hass, _STRINGS, "group_exists", id=gid)
        )
        return
    preset_ids = {p["id"] for p in doc["presets"]}
    try:
        setpoints = {
            pid: _temp(hass, value)
            for pid, value in (raw.get("setpoints") or {}).items()
            if pid in preset_ids and value is not None
        }
    except (vol.Invalid, TypeError, ValueError) as err:
        connection.send_error(msg["id"], "invalid_temp", str(err))
        return
    # The default group covers every room left over: it holds none itself.
    rooms = [] if gid == DEFAULT_GROUP else list(dict.fromkeys(raw.get("rooms") or []))
    group = {
        "id": gid,
        "name": name,
        "rooms": rooms,
        "setpoints": setpoints,
        "builtin": gid == DEFAULT_GROUP,
    }
    groups = []
    for other in doc["groups"]:
        if other.get("id") == gid:
            groups.append(group)
            continue
        other["rooms"] = [r for r in other.get("rooms", []) if r not in rooms]
        groups.append(other)
    if existing is None:
        groups.append(group)
    doc["groups"] = groups
    await _save(hass)
    # Unheated may have switched between "cut" and a temperature.
    enforcer: RadiatorEnforcer | None = hass.data.get(DOMAIN, {}).get(ENFORCER)
    if enforcer is not None:
        await enforcer.async_enforce_all()
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/heating/group/delete",
        vol.Required("group_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_heating_group_delete(hass: HomeAssistant, connection, msg) -> None:
    """Delete a heating group; its rooms fall back to the default group."""
    if msg["group_id"] == DEFAULT_GROUP:
        connection.send_error(msg["id"], "builtin", tr(hass, _STRINGS, "group_builtin"))
        return
    doc = await _doc(hass)
    doc["groups"] = [g for g in doc["groups"] if g.get("id") != msg["group_id"]]
    await _save(hass)
    connection.send_result(msg["id"], {"ok": True})


# --- Device presets -----------------------------------------------------------


def _model_key(dev: dr.DeviceEntry) -> str:
    return f"{dev.manufacturer or ''}|{dev.model or ''}"


def _model_devices(hass: HomeAssistant, model: str) -> list[dr.DeviceEntry]:
    """Devices of a model that own a climate entity (the thermostats)."""
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    out: dict[str, dr.DeviceEntry] = {}
    for entity in ent_reg.entities.values():
        if entity.domain != "climate" or not entity.device_id:
            continue
        dev = dev_reg.async_get(entity.device_id)
        if dev is not None and _model_key(dev) == model:
            out[dev.id] = dev
    return list(out.values())


def _param_entity(hass: HomeAssistant, device_id: str, param: dict) -> str | None:
    """The device's entity a setting targets. An empty suffix is the entity
    named after the device itself (e.g. its climate entity), so: the device's
    entity of that domain with the shortest object id."""
    if param.get("suffix"):
        return condition_entity(hass, device_id, param)
    entries = [
        e
        for e in er.async_entries_for_device(er.async_get(hass), device_id)
        if e.domain == param.get("domain")
    ]
    if not entries:
        return None
    return min(entries, key=lambda e: len(e.entity_id)).entity_id


async def _apply_param(hass: HomeAssistant, entity_id: str, value) -> None:
    """Set one entity to a preset value, with its domain's service."""
    domain = entity_id.split(".", 1)[0]
    data = {"entity_id": entity_id}
    if domain == "number":
        service, data["value"] = "set_value", float(value)
    elif domain == "select":
        service, data["option"] = "select_option", str(value)
    elif domain == "climate":
        service, data["hvac_mode"] = "set_hvac_mode", str(value)
    elif domain == "switch":
        service = "turn_on" if str(value) == "on" else "turn_off"
    elif domain == "lock":
        service = "lock" if str(value) == "locked" else "unlock"
    else:
        raise ValueError(tr(hass, _STRINGS, "unsupported_domain", domain=domain))
    await hass.services.async_call(domain, service, data, blocking=True)


def room_mode(hass: HomeAssistant, room_id: str, heating: dict | None) -> str:
    """A room's effective heating mode: Unheated when its own heating is
    disabled, else its zone's mode (the default zone's when in no zone)."""
    if (heating or {}).get("enabled", True) is False:
        return UNHEATED
    zones = (hass.data.get(DOMAIN, {}).get(STORE_DATA) or {}).get("zones", [])
    zone = next((z for z in zones if room_id in z.get("rooms", [])), None) or next(
        (z for z in zones if z.get("id") == "default"), None
    )
    return (zone or {}).get("mode") or "normal"


def room_setpoint(hass: HomeAssistant, room_id: str, mode: str) -> float | None:
    """The temperature a room gets in a heating mode: from its setpoint group
    (the one listing the room, else the default one); None when unset."""
    groups = (hass.data.get(DOMAIN, {}).get(STORE_DATA) or {}).get("groups", [])
    group = next((g for g in groups if room_id in g.get("rooms", [])), None) or next(
        (g for g in groups if g.get("id") == DEFAULT_GROUP), None
    )
    value = (group or {}).get("setpoints", {}).get(mode)
    return None if value is None else float(value)


def unheated_cuts(hass: HomeAssistant, room_id: str) -> bool:
    """Whether Unheated cuts the room's heating: unless the room's setpoint
    group gives Unheated a temperature (e.g. frost protection)."""
    return room_setpoint(hass, room_id, UNHEATED) is None


def tolerance_mode(hass: HomeAssistant, zone_id: str | None = None) -> str:
    """The tolerance mode: a zone's own (set per zone, or by the global one),
    or the global one (zone_id None, or a zone that never got one)."""
    doc = hass.data.get(DOMAIN, {}).get(STORE_DATA) or {}
    mode = doc.get("tolerance_mode", "normal")
    if zone_id is not None:
        zone = next((z for z in doc.get("zones", []) if z.get("id") == zone_id), None)
        mode = (zone or {}).get("tolerance_mode") or mode
    return mode if mode in TOLERANCE_MODES else "normal"


def device_zone(hass: HomeAssistant, device_id: str) -> str | None:
    """The heating zone of the Climate room holding a radiator device."""
    zones = (hass.data.get(DOMAIN, {}).get(STORE_DATA) or {}).get("zones", [])
    for entry in hass.config_entries.async_entries(DOMAIN):
        for sub in entry.subentries.values():
            room = sub.data
            if MODULE_HEATING not in (room.get(CONF_MODULES) or []):
                continue
            radiators = (room.get(CONF_HEATING) or {}).get("radiators", [])
            if not any(r.get("device_id") == device_id for r in radiators):
                continue
            room_id = room.get(CONF_ROOM_ID, "")
            zone = next((z for z in zones if room_id in z.get("rooms", [])), None)
            return (zone or {}).get("id") or "default"
    return None


def _effective_params(hass: HomeAssistant, preset: dict, device_id: str | None = None) -> dict:
    """A preset's settings with the tolerance of the device's tolerance mode
    (its room's zone's; the global one for devices in no room)."""
    params = dict(preset.get("params") or {})
    tol = params.get("tolerance")
    mode = tolerance_mode(hass, device_zone(hass, device_id) if device_id else None)
    if tol and mode == "agressive" and tol.get("value_agressive") not in (None, ""):
        params["tolerance"] = {**tol, "value": tol["value_agressive"]}
    return params


async def async_apply_device_preset(hass: HomeAssistant, preset: dict) -> list[dict]:
    """Apply a device preset to every device of its model.

    Returns, per device, the settings applied and those that failed (entity
    missing on that device, or the service call raised).
    """
    results = []
    for dev in _model_devices(hass, preset.get("model", "")):
        params = _effective_params(hass, preset, dev.id)
        applied, failed = [], []
        for key, param in params.items():
            if not param or param.get("value") in (None, ""):
                continue
            entity_id = _param_entity(hass, dev.id, param)
            if entity_id is None:
                failed.append({"param": key, "error": tr(hass, _STRINGS, "entity_not_found")})
                continue
            try:
                await _apply_param(hass, entity_id, param["value"])
                applied.append(key)
            except Exception as err:  # noqa: BLE001 - report, keep going
                _LOGGER.warning("Homex heating: %s on %s failed: %s", key, entity_id, err)
                failed.append({"param": key, "error": str(err)})
        results.append(
            {
                "device_id": dev.id,
                "name": dev.name_by_user or dev.name or dev.id,
                "applied": applied,
                "failed": failed,
            }
        )
    return results


def _param_matches(hass: HomeAssistant, entity_id: str, value) -> bool | None:
    """Whether an entity already holds a preset value (None: unknown state)."""
    st = hass.states.get(entity_id)
    if st is None or st.state in ("unknown", "unavailable"):
        return None
    if entity_id.split(".", 1)[0] == "number":
        try:
            return abs(float(st.state) - float(value)) < 1e-6
        except (TypeError, ValueError):
            return False
    return st.state == str(value)


async def async_enforce_device(
    hass: HomeAssistant, device_id: str, preset: dict
) -> tuple[list[str], list[dict]]:
    """Re-apply a device preset's settings that drifted on one device.

    Returns (settings re-applied, failures). Settings already right, or whose
    entity state is unknown (device offline), are left alone.
    """
    fixed, failed = [], []
    for key, param in _effective_params(hass, preset, device_id).items():
        if not param or param.get("value") in (None, ""):
            continue
        entity_id = _param_entity(hass, device_id, param)
        if entity_id is None:
            failed.append({"param": key, "error": tr(hass, _STRINGS, "entity_not_found")})
            continue
        if _param_matches(hass, entity_id, param["value"]) is not False:
            continue
        try:
            await _apply_param(hass, entity_id, param["value"])
            fixed.append(key)
        except Exception as err:  # noqa: BLE001 - report, keep going
            failed.append({"param": key, "error": str(err)})
    return fixed, failed


ENFORCER = "_radiator_enforcer"
ENFORCE_INTERVAL = timedelta(minutes=10)
ENFORCE_FIRST_DELAY = 30  # s after load: let MQTT entities come up first


async def async_write_external_temperature(
    hass: HomeAssistant, device_id: str, preset: dict, source: str
) -> str | None:
    """Write a sensor's temperature to a valve's external temperature input,
    within the input's range and step. Returns the input entity written."""
    ext = preset.get("external_input")
    st = hass.states.get(source)
    if not ext or st is None:
        return None
    try:
        value = float(st.state)
    except (TypeError, ValueError):
        return None  # source unknown / unavailable
    target = _param_entity(hass, device_id, ext)
    target_st = hass.states.get(target) if target else None
    if target_st is None:
        return None
    attrs = target_st.attributes
    step = float(attrs.get("step") or 0.1)
    value = round(round(value / step) * step, 2)
    if attrs.get("min") is not None:
        value = max(float(attrs["min"]), value)
    if attrs.get("max") is not None:
        value = min(float(attrs["max"]), value)
    await hass.services.async_call(
        "number", "set_value", {"entity_id": target, "value": value}, blocking=True
    )
    return target


class RadiatorEnforcer:
    """Keeps every heating room's radiators on their device preset: checked
    shortly after load, then every 10 minutes; drifted settings re-applied.

    Radiators whose preset uses an external sensor also get their source
    sensor's temperature written to the valve on every change of it (and on
    every tick, so the valve does not fall back to its internal sensor).
    """

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self._unsubs: list = []

    @callback
    def start(self) -> None:
        self._unsubs.append(
            async_track_time_interval(self.hass, self._tick, ENFORCE_INTERVAL)
        )
        # At boot, let MQTT entities come up first; on a reload (room saved)
        # they are there: apply right away.
        delay = 2 if self.hass.is_running else ENFORCE_FIRST_DELAY
        self._unsubs.append(async_call_later(self.hass, delay, self._tick))
        self.hass.async_create_task(self._async_track_sources())

    async def _async_track_sources(self) -> None:
        """Follow each external source sensor: write it to its radiators."""
        presets = {p["id"]: p for p in (await _doc(self.hass))["device_presets"]}
        by_source: dict[str, list[tuple[str, dict]]] = {}
        for room_id, radiator in self._radiators():
            preset = presets.get(radiator.get("preset_id") or "")
            source = radiator.get("external_sensor")
            if preset and preset.get("external_input") and source:
                by_source.setdefault(source, []).append((radiator["device_id"], preset))
        if not by_source:
            return

        @callback
        def _on_change(event) -> None:
            unheated = {
                rad["device_id"] for _, rad in self._radiators() if rad["off"]
            }
            for device_id, preset in by_source.get(event.data["entity_id"], []):
                if device_id in unheated:
                    continue  # an Unheated room's valve stays off
                self.hass.async_create_task(
                    self._async_write(device_id, preset, event.data["entity_id"])
                )

        self._unsubs.append(
            async_track_state_change_event(self.hass, list(by_source), _on_change)
        )

    async def _async_write(self, device_id: str, preset: dict, source: str) -> None:
        if not (await _doc(self.hass)).get("enabled", True):
            return  # heating off: valves stay off
        try:
            target = await async_write_external_temperature(
                self.hass, device_id, preset, source
            )
            if target:
                _LOGGER.debug("Homex heating: %s → %s", source, target)
        except Exception:  # noqa: BLE001 - one valve must not break others
            _LOGGER.exception("Homex heating: external temperature to %s failed", device_id)

    @callback
    def stop(self) -> None:
        while self._unsubs:
            self._unsubs.pop()()

    async def _tick(self, _now=None) -> None:
        try:
            await self.async_enforce_all()
        except Exception:  # noqa: BLE001 - never kill the timer
            _LOGGER.exception("Homex heating: radiator enforcement failed")

    def _radiators(self) -> list[tuple[str, dict]]:
        """(room_id, radiator) of every room with the Climate module; each
        radiator carries its room's effective mode as "mode", "off" when that
        mode cuts the heating (Unheated without a setpoint), else "setpoint":
        the mode's temperature for the room (None when unset)."""
        out = []
        for sub in self.entry.subentries.values():
            room = sub.data
            if MODULE_HEATING not in (room.get(CONF_MODULES) or []):
                continue
            room_id = room.get(CONF_ROOM_ID, "")
            heating = room.get(CONF_HEATING) or {}
            mode = room_mode(self.hass, room_id, heating)
            # Unheated with no setpoint = heating cut: valves kept off.
            off = mode == UNHEATED and unheated_cuts(self.hass, room_id)
            setpoint = None if off else room_setpoint(self.hass, room_id, mode)
            for radiator in heating.get("radiators", []):
                out.append(
                    (room_id, {**radiator, "mode": mode, "off": off, "setpoint": setpoint})
                )
        return out

    async def _async_keep_off(self, room_id: str, radiator: dict) -> None:
        """An Unheated room: its valve stays off."""
        entity_id = _param_entity(
            self.hass, radiator.get("device_id", ""), {"domain": "climate", "suffix": ""}
        )
        if entity_id is None or _param_matches(self.hass, entity_id, "off") is not False:
            return
        try:
            await _apply_param(self.hass, entity_id, "off")
            _LOGGER.info("Homex heating: [%s] %s off (unheated)", room_id, entity_id)
        except Exception as err:  # noqa: BLE001 - keep going with the others
            _LOGGER.warning("Homex heating: [%s] %s off failed: %s", room_id, entity_id, err)

    async def _async_setpoint(self, room_id: str, radiator: dict) -> bool:
        """Bring a valve to its room's setpoint: heating on (a cut / manual off
        valve is turned back to heat) and its target temperature set. False
        when it could not (offline, failure): retried at the next pass."""
        entity_id = _param_entity(
            self.hass, radiator.get("device_id", ""), {"domain": "climate", "suffix": ""}
        )
        st = self.hass.states.get(entity_id) if entity_id else None
        if st is None or st.state in ("unknown", "unavailable"):
            return False  # offline: retried at the next pass
        target = radiator["setpoint"]
        attrs = st.attributes
        try:
            if st.state == "off" and "heat" in (attrs.get("hvac_modes") or []):
                await _apply_param(self.hass, entity_id, "heat")
                _LOGGER.info("Homex heating: [%s] %s back to heat", room_id, entity_id)
            if attrs.get("min_temp") is not None:
                target = max(float(attrs["min_temp"]), target)
            if attrs.get("max_temp") is not None:
                target = min(float(attrs["max_temp"]), target)
            current = attrs.get("temperature")
            if current is not None and abs(float(current) - target) < 0.05:
                return True
            await self.hass.services.async_call(
                "climate",
                "set_temperature",
                {"entity_id": entity_id, "temperature": target},
                blocking=True,
            )
            _LOGGER.info(
                "Homex heating: [%s] %s setpoint %s → %s (%s)",
                room_id,
                entity_id,
                current,
                target,
                radiator["mode"],
            )
        except Exception as err:  # noqa: BLE001 - keep going with the others
            _LOGGER.warning("Homex heating: [%s] %s setpoint failed: %s", room_id, entity_id, err)
            return False
        return True

    async def async_all_off(self) -> None:
        """Heating disabled: turn every room radiator's valve off (their
        setpoints are re-applied when it is enabled again)."""
        doc = await _doc(self.hass)
        if doc.get("applied_setpoints"):
            doc["applied_setpoints"] = {}
            await _save(self.hass)
        for room_id, radiator in self._radiators():
            entity_id = _param_entity(
                self.hass, radiator.get("device_id", ""), {"domain": "climate", "suffix": ""}
            )
            if entity_id is None:
                continue
            try:
                await _apply_param(self.hass, entity_id, "off")
            except Exception as err:  # noqa: BLE001 - keep turning the others off
                _LOGGER.warning("Homex heating: [%s] %s off failed: %s", room_id, entity_id, err)

    async def async_enforce_all(self) -> None:
        """Every pass (load, every 10 min, mode / settings changes): device
        presets re-applied where they drifted, Unheated valves kept off, and
        each valve's setpoint applied only when its room's mode or setpoint
        changed since it was last applied — a setpoint set by hand on the
        valve holds until the next mode change."""
        doc = await _doc(self.hass)
        if not doc.get("enabled", True):
            return  # heating off: no preset (nor mode) re-applied
        presets = {p["id"]: p for p in doc["device_presets"]}
        applied = doc.setdefault("applied_setpoints", {})
        changed = False
        for room_id, radiator in self._radiators():
            device_id = radiator.get("device_id") or ""
            if radiator["off"]:
                await self._async_keep_off(room_id, radiator)
                # Heated again later: its setpoint is applied then.
                changed |= applied.pop(device_id, None) is not None
                continue
            preset = presets.get(radiator.get("preset_id") or "")
            if preset is not None and device_id:
                await self._async_enforce_preset(room_id, radiator, preset)
            # The setpoint last: the preset may have just set the valve's mode.
            if radiator["setpoint"] is None:
                continue
            wanted = {"mode": radiator["mode"], "setpoint": radiator["setpoint"]}
            if applied.get(device_id) == wanted:
                continue  # already applied for this mode: manual changes hold
            if await self._async_setpoint(room_id, radiator):
                applied[device_id] = wanted
                changed = True
        if changed:
            await _save(self.hass)

    async def _async_enforce_preset(self, room_id: str, radiator: dict, preset: dict) -> None:
        """Re-apply a radiator's device preset settings that drifted."""
        fixed, failed = await async_enforce_device(
            self.hass, radiator["device_id"], preset
        )
        if preset.get("external_input") and radiator.get("external_sensor"):
            await self._async_write(
                radiator["device_id"], preset, radiator["external_sensor"]
            )
        if fixed:
            _LOGGER.info(
                "Homex heating: [%s] %s re-applied %s",
                room_id,
                radiator["device_id"],
                ", ".join(fixed),
            )
        for fail in failed:
            _LOGGER.warning(
                "Homex heating: [%s] %s %s: %s",
                room_id,
                radiator["device_id"],
                fail["param"],
                fail["error"],
            )


async def async_forget_room(hass: HomeAssistant, room_id: str) -> None:
    """A room was deleted: drop it from setpoints and zones."""
    doc = await _doc(hass)
    for item in [*doc["groups"], *doc.get("zones", [])]:
        item["rooms"] = [r for r in item.get("rooms", []) if r != room_id]
    await _save(hass)


async def async_rename_room(hass: HomeAssistant, old_id: str, new_id: str) -> None:
    """A room id changed: follow it in setpoints and zones."""
    doc = await _doc(hass)
    for item in [*doc["groups"], *doc.get("zones", [])]:
        item["rooms"] = [new_id if r == old_id else r for r in item.get("rooms", [])]
    await _save(hass)


@websocket_api.websocket_command({vol.Required("type"): "homex/heating/models"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_heating_models(hass: HomeAssistant, connection, msg) -> None:
    """Unique thermostat models (devices owning a climate entity), with their
    devices so a device preset can pick a reference device."""
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    by_model: dict[str, dict] = {}
    seen: set[str] = set()
    for entity in ent_reg.entities.values():
        if entity.domain != "climate" or not entity.device_id:
            continue
        if entity.device_id in seen:
            continue
        dev = dev_reg.async_get(entity.device_id)
        if dev is None:
            continue
        seen.add(dev.id)
        key = _model_key(dev)
        model = by_model.setdefault(
            key,
            {
                "model": key,
                "label": " ".join(p for p in (dev.manufacturer, dev.model) if p)
                or tr(hass, _STRINGS, "unknown_model"),
                "devices": [],
            },
        )
        model["devices"].append(
            {"device_id": dev.id, "name": dev.name_by_user or dev.name or dev.id}
        )
    for model in by_model.values():
        model["devices"].sort(key=lambda d: d["name"].lower())
        model["count"] = len(model["devices"])
    connection.send_result(
        msg["id"],
        {"models": sorted(by_model.values(), key=lambda m: m["label"].lower())},
    )


def _clean_params(hass: HomeAssistant, raw: dict) -> dict:
    params = {}
    for key, domains in DEVICE_PARAMS.items():
        param = (raw or {}).get(key)
        if not param or param.get("value") in (None, ""):
            continue
        if param.get("domain") not in domains:
            raise vol.Invalid(
                tr(
                    hass, _STRINGS, "domain_not_allowed", key=key, domain=param.get("domain")
                )
            )
        value = param["value"]
        if param["domain"] == "number":
            value = float(value)
        params[key] = {
            "domain": param["domain"],
            "suffix": str(param.get("suffix") or ""),
            "value": value,
        }
        if key == "tolerance" and param.get("value_agressive") not in (None, ""):
            params[key]["value_agressive"] = float(param["value_agressive"])
    return params


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/heating/device_preset/save",
        vol.Required("preset"): dict,
        vol.Optional("create", default=False): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_heating_device_preset_save(hass: HomeAssistant, connection, msg) -> None:
    """Create or update a device preset (upsert by id), then apply it."""
    raw = msg["preset"]
    pid = _clean_id(raw.get("id"))
    name = str(raw.get("name") or "").strip()
    model = str(raw.get("model") or "")
    if not pid or not name or not model:
        connection.send_error(msg["id"], "invalid", tr(hass, _STRINGS, "device_preset_required"))
        return
    doc = await _doc(hass)
    existing = next((p for p in doc["device_presets"] if p.get("id") == pid), None)
    if existing is not None and msg["create"]:
        connection.send_error(
            msg["id"], "id_exists", tr(hass, _STRINGS, "device_preset_exists", id=pid)
        )
        return
    try:
        params = _clean_params(hass, raw.get("params"))
    except (vol.Invalid, TypeError, ValueError) as err:
        connection.send_error(msg["id"], "invalid_param", str(err))
        return
    ext = raw.get("external_input") or {}
    preset = {
        "id": pid,
        "name": name,
        "model": model,
        "device_id": str(raw.get("device_id") or ""),
        "params": params,
        # The device's number entity receiving an external temperature: set
        # when the preset makes the valve use an external sensor.
        "external_input": (
            {"domain": "number", "suffix": str(ext.get("suffix") or "")}
            if ext.get("domain") == "number" and "suffix" in ext
            else None
        ),
    }
    doc["device_presets"] = [
        p for p in doc["device_presets"] if p.get("id") != pid
    ] + [preset]
    await _save(hass)
    results = await async_apply_device_preset(hass, preset)
    connection.send_result(msg["id"], {"ok": True, "results": results})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/heating/device_preset/delete",
        vol.Required("preset_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_heating_device_preset_delete(hass: HomeAssistant, connection, msg) -> None:
    doc = await _doc(hass)
    doc["device_presets"] = [
        p for p in doc["device_presets"] if p.get("id") != msg["preset_id"]
    ]
    await _save(hass)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/heating/device_preset/apply",
        vol.Required("preset_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_heating_device_preset_apply(hass: HomeAssistant, connection, msg) -> None:
    """Apply a stored device preset to every device of its model now."""
    doc = await _doc(hass)
    preset = next(
        (p for p in doc["device_presets"] if p.get("id") == msg["preset_id"]), None
    )
    if preset is None:
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "device_preset_unknown"))
        return
    results = await async_apply_device_preset(hass, preset)
    connection.send_result(msg["id"], {"ok": True, "results": results})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/heating/enabled",
        vol.Required("enabled"): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_heating_enabled(hass: HomeAssistant, connection, msg) -> None:
    await async_set_heating_enabled(hass, msg["enabled"])
    connection.send_result(msg["id"], {"ok": True})


HEATING_SWITCH = "_heating_switch"


async def async_set_heating_enabled(hass: HomeAssistant, enabled: bool) -> None:
    """Switch heating on / off globally (panel toggle and switch.homex_heating).

    Off: every room valve is turned off and the periodic enforcement pauses;
    on: an enforcement pass runs now.
    """
    doc = await _doc(hass)
    doc["enabled"] = enabled
    await _save(hass)
    entity = hass.data.get(DOMAIN, {}).get(HEATING_SWITCH)
    if entity is not None and entity.hass is not None:
        entity.async_write_ha_state()
    enforcer: RadiatorEnforcer | None = hass.data.get(DOMAIN, {}).get(ENFORCER)
    if enforcer is not None:
        if enabled:
            await enforcer.async_enforce_all()
        else:
            await enforcer.async_all_off()
    # Boilers' dry contacts: off while heating is disabled, else per demand.
    from .heating_systems import systems_manager  # lazy: it imports us

    await systems_manager(hass).async_update()
    _LOGGER.info("Homex heating: %s", "enabled" if enabled else "disabled")


def _room_heating_cfg(hass: HomeAssistant, room_id: str) -> dict | None:
    """A room's Heating module config (None: unknown room)."""
    from .room import HomexHub  # lazy: room imports heating

    hub: HomexHub | None = hass.data.get(DOMAIN, {}).get(HUB_DATA)
    controller = hub.controllers.get(room_id) if hub else None
    if controller is None:
        return None
    return controller._cfg(CONF_HEATING) or {}


@websocket_api.websocket_command(
    {vol.Required("type"): "homex/heating/room_status", vol.Required("room_id"): str}
)
@websocket_api.async_response
async def ws_heating_room_status(hass: HomeAssistant, connection, msg) -> None:
    """A room's heating state for dashboards: its effective mode (and its
    setpoint from the room's setpoint group)."""
    doc = await _doc(hass)
    room_id = msg["room_id"]
    heating = _room_heating_cfg(hass, room_id)
    if heating is None:
        connection.send_error(msg["id"], "not_found", tr(hass, _STRINGS, "unknown_room"))
        return
    mode = room_mode(hass, room_id, heating)
    name = next((preset_name(hass, p) for p in doc["presets"] if p["id"] == mode), mode)
    off = mode == UNHEATED and unheated_cuts(hass, room_id)
    connection.send_result(
        msg["id"],
        {
            "enabled": doc.get("enabled", True),
            "room_enabled": heating.get("enabled", True) is not False,
            "mode": mode,
            "mode_name": name,
            "off": off,
            "setpoint": None if off else room_setpoint(hass, room_id, mode),
        },
    )


WS_COMMANDS = (
    ws_heating_room_status,
    ws_heating_enabled,
    ws_heating_models,
    ws_heating_device_preset_save,
    ws_heating_device_preset_delete,
    ws_heating_device_preset_apply,
    ws_heating,
    ws_heating_preset_save,
    ws_heating_preset_delete,
    ws_heating_group_save,
    ws_heating_group_delete,
)
