"""Heating zones: sets of rooms that each run their own heating mode.

A zone groups rooms (a room belongs to one zone at most; the built-in
"default" zone holds every other room) and has an active heating mode. The
mode is changed through dedicated commands:

- a ``select.homex_heating_<zone>`` entity (options = heating mode names);
- triggers per mode (like room triggers: device buttons, states, ...);
- Switch Manager actions (``heating_mode`` / ``heating_mode_next``), resolved
  to the zone of the button's room.

Heating demand is exposed as binary sensors: ``binary_sensor.homex_heating_needed``
(any room) and ``binary_sensor.homex_heating_needed_<zone>`` (the zone's rooms),
on as soon as one radiator valve of their rooms heats (hvac_action "heating").

Zones live in the heating Store document (see heating.py) under "zones".
"""

from __future__ import annotations

import logging

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Context, Event, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.trigger import (
    async_initialize_triggers,
    async_validate_trigger_config,
)

from .const import (
    CONF_HEATING,
    CONF_MODULES,
    CONF_ROOM_ID,
    DOMAIN,
    MODULE_HEATING,
    hx_name,
)
from .heating import (
    ENFORCER,
    STORE_DATA,
    TOLERANCE_MODES,
    _clean_id,
    _doc,
    _param_entity,
    _save,
    tolerance_mode,
)

_LOGGER = logging.getLogger(__name__)

HEATING_ZONES = "_heating_zones"
TOLERANCE_PREFIX = "homex_climate_tolerance_mode_zone_"
DEFAULT_ZONE = "default"
DEFAULT_MODE = "normal"


def ensure_zones(doc: dict) -> list[dict]:
    """The document's zones, with the built-in default zone first."""
    zones = doc.setdefault("zones", [])
    if not any(z.get("id") == DEFAULT_ZONE for z in zones):
        zones.insert(
            0,
            {
                "id": DEFAULT_ZONE,
                "name": "Défaut",
                "rooms": [],
                "mode": DEFAULT_MODE,
                "triggers": {},
                "builtin": True,
            },
        )
    return zones


def zone_name(hass: HomeAssistant, zone_id: str | None) -> str:
    """A zone's display name ("Global" for None), for entity names."""
    if zone_id is None:
        return "Global"
    doc = hass.data.get(DOMAIN, {}).get(STORE_DATA) or {}
    zone = next((z for z in doc.get("zones", []) if z["id"] == zone_id), None)
    return zone["name"] if zone else zone_id


def zones_manager(hass: HomeAssistant) -> "HeatingZones":
    data = hass.data.setdefault(DOMAIN, {})
    manager = data.get(HEATING_ZONES)
    if manager is None:
        manager = data[HEATING_ZONES] = HeatingZones(hass)
    return manager


class HeatingZones:
    """Runtime of the heating zones: active modes, select entities, triggers."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._entities: dict[str, ZoneModeSelect] = {}
        # Tolerance mode selects: per zone, and the global one (see select.py).
        self._tol_entities: dict[str, ZoneToleranceSelect] = {}
        self.tolerance_global: SelectEntity | None = None
        self._add_entities: AddEntitiesCallback | None = None
        self._unsubs: list = []
        # Heating demand binary sensors: zone id -> entity (None = global).
        self._needed: dict[str | None, HeatingNeededSensor] = {}
        self._add_needed: AddEntitiesCallback | None = None
        self._entry: ConfigEntry | None = None
        self._needed_unsub = None

    # -- Data ---------------------------------------------------------------

    async def zones(self) -> list[dict]:
        return ensure_zones(await _doc(self.hass))

    async def modes(self) -> list[dict]:
        return (await _doc(self.hass))["presets"]

    async def zone_for_room(self, room_id: str) -> dict | None:
        zones = await self.zones()
        for zone in zones:
            if room_id in zone.get("rooms", []):
                return zone
        return next((z for z in zones if z["id"] == DEFAULT_ZONE), None)

    async def async_set_mode(self, zone_id: str, mode_id: str) -> None:
        zone = next((z for z in await self.zones() if z["id"] == zone_id), None)
        if zone is None or not any(m["id"] == mode_id for m in await self.modes()):
            raise vol.Invalid(f"Zone ou mode inconnu : {zone_id} / {mode_id}")
        if zone.get("mode") == mode_id:
            return
        zone["mode"] = mode_id
        await _save(self.hass)
        _LOGGER.info("Homex heating: zone '%s' → mode '%s'", zone_id, mode_id)
        entity = self._entities.get(zone_id)
        if entity is not None:
            entity.async_write_ha_state()
        # The zone's rooms follow: Unheated turns their valves off, another
        # mode re-applies their presets.
        enforcer = self.hass.data.get(DOMAIN, {}).get(ENFORCER)
        if enforcer is not None:
            await enforcer.async_enforce_all()

    async def async_next_mode(self, zone_id: str) -> None:
        """Cycle the zone to the next heating mode (in the modes' order)."""
        zone = next((z for z in await self.zones() if z["id"] == zone_id), None)
        modes = [m["id"] for m in await self.modes()]
        if zone is None or not modes:
            return
        idx = modes.index(zone["mode"]) if zone.get("mode") in modes else -1
        await self.async_set_mode(zone_id, modes[(idx + 1) % len(modes)])

    async def async_modes_changed(self) -> None:
        """Modes added / renamed / deleted: fix zones whose mode vanished, drop
        the deleted modes' triggers, refresh the select entities."""
        mode_ids = {m["id"] for m in await self.modes()}
        changed = False
        for zone in await self.zones():
            if zone.get("mode") not in mode_ids:
                zone["mode"] = DEFAULT_MODE
                changed = True
            stale = [m for m in zone.get("triggers", {}) if m not in mode_ids]
            for mode_id in stale:
                zone["triggers"].pop(mode_id)
                changed = True
        if changed:
            await _save(self.hass)
        for entity in self._entities.values():
            entity.async_write_ha_state()
        await self.async_wire_triggers()

    # -- Entities -----------------------------------------------------------

    async def async_setup_platform(self, add_entities: AddEntitiesCallback) -> None:
        self._add_entities = add_entities
        self._entities = {}
        # Drop registry entries of zones that no longer exist.
        zone_ids = {z["id"] for z in await self.zones()}
        ent_reg = er.async_get(self.hass)
        for entry in list(ent_reg.entities.values()):
            for prefix in ("homex_heating_zone_", TOLERANCE_PREFIX):
                if (
                    entry.platform == DOMAIN
                    and entry.domain == "select"
                    and entry.unique_id.startswith(prefix)
                    and entry.unique_id.removeprefix(prefix) not in zone_ids
                ):
                    ent_reg.async_remove(entry.entity_id)
        await self.async_sync_entities()

    @callback
    def unload_platform(self) -> None:
        self._add_entities = None
        self._entities = {}
        self._tol_entities = {}
        self.tolerance_global = None

    async def async_set_tolerance(self, mode: str, zone_id: str | None = None) -> None:
        """Set a zone's tolerance mode, or the global one, which sets every
        zone's too; then re-apply the presets with it."""
        if mode not in TOLERANCE_MODES:
            return
        doc = await _doc(self.hass)
        zones = ensure_zones(doc)
        if zone_id is None:
            doc["tolerance_mode"] = mode
            for zone in zones:
                zone["tolerance_mode"] = mode
        else:
            zone = next((z for z in zones if z["id"] == zone_id), None)
            if zone is None:
                return
            zone["tolerance_mode"] = mode
        await _save(self.hass)
        for entity in [self.tolerance_global, *self._tol_entities.values()]:
            if entity is not None and entity.hass is not None:
                entity.async_write_ha_state()
        enforcer = self.hass.data.get(DOMAIN, {}).get(ENFORCER)
        if enforcer is not None:
            await enforcer.async_enforce_all()

    async def async_sync_entities(self) -> None:
        """One select entity per zone: add new zones', remove deleted ones'."""
        if self._add_entities is None:
            return
        zone_ids = {z["id"] for z in await self.zones()}
        for zone_id in [z for z in self._entities if z not in zone_ids]:
            entity = self._entities.pop(zone_id)
            ent_reg = er.async_get(self.hass)
            if entity.entity_id and ent_reg.async_get(entity.entity_id):
                ent_reg.async_remove(entity.entity_id)
            else:
                await entity.async_remove()
        for zone_id in [z for z in self._tol_entities if z not in zone_ids]:
            entity = self._tol_entities.pop(zone_id)
            ent_reg = er.async_get(self.hass)
            if entity.entity_id and ent_reg.async_get(entity.entity_id):
                ent_reg.async_remove(entity.entity_id)
        new = [ZoneModeSelect(self, zid) for zid in zone_ids if zid not in self._entities]
        for entity in new:
            self._entities[entity.zone_id] = entity
        new_tol = [
            ZoneToleranceSelect(self, zid) for zid in zone_ids if zid not in self._tol_entities
        ]
        for entity in new_tol:
            self._tol_entities[entity.zone_id] = entity
        if new or new_tol:
            self._add_entities([*new, *new_tol])
        for entity in [*self._entities.values(), *self._tol_entities.values()]:
            if entity.hass is not None:
                entity.async_write_ha_state()
        self._sync_needed(zone_ids)

    # -- Heating demand -----------------------------------------------------

    async def async_setup_needed(
        self, add_entities: AddEntitiesCallback, entry: ConfigEntry
    ) -> None:
        """binary_sensor platform: global + per-zone heating demand sensors,
        following the valves of every Climate room's radiators."""
        self._add_needed = add_entities
        self._entry = entry
        self._needed = {}
        zone_ids = {z["id"] for z in await self.zones()}
        ent_reg = er.async_get(self.hass)
        prefix = "homex_heating_needed_zone_"
        for reg in list(ent_reg.entities.values()):
            if (
                reg.platform == DOMAIN
                and reg.domain == "binary_sensor"
                and reg.unique_id.startswith(prefix)
                and reg.unique_id.removeprefix(prefix) not in zone_ids
            ):
                ent_reg.async_remove(reg.entity_id)
        self._sync_needed(zone_ids)
        valves = [v for _, v in self._room_valves()]
        if valves:
            self._needed_unsub = async_track_state_change_event(
                self.hass, valves, self._on_valve
            )

    @callback
    def unload_needed(self) -> None:
        if self._needed_unsub:
            self._needed_unsub()
            self._needed_unsub = None
        self._add_needed = None
        self._needed = {}

    @callback
    def _sync_needed(self, zone_ids: set[str]) -> None:
        if self._add_needed is None:
            return
        for zone_id in [z for z in self._needed if z is not None and z not in zone_ids]:
            entity = self._needed.pop(zone_id)
            ent_reg = er.async_get(self.hass)
            if entity.entity_id and ent_reg.async_get(entity.entity_id):
                ent_reg.async_remove(entity.entity_id)
        wanted = [None, *sorted(zone_ids)]
        new = [HeatingNeededSensor(self, z) for z in wanted if z not in self._needed]
        for entity in new:
            self._needed[entity.zone_id] = entity
        if new:
            self._add_needed(new)
        self._write_needed()

    @callback
    def _write_needed(self) -> None:
        for entity in self._needed.values():
            if entity.hass is not None:
                entity.async_write_ha_state()

    @callback
    def _on_valve(self, event: Event) -> None:
        self._write_needed()

    def _room_valves(self) -> list[tuple[str, str]]:
        """(room_id, climate entity) of every Climate room's radiators."""
        out = []
        for sub in (self._entry.subentries.values() if self._entry else []):
            room = sub.data
            if MODULE_HEATING not in (room.get(CONF_MODULES) or []):
                continue
            for rad in (room.get(CONF_HEATING) or {}).get("radiators", []):
                valve = _param_entity(
                    self.hass, rad.get("device_id", ""), {"domain": "climate", "suffix": ""}
                )
                if valve:
                    out.append((room.get(CONF_ROOM_ID, ""), valve))
        return out

    def heating_needed(self, zone_id: str | None) -> tuple[bool, list[str]]:
        """Whether a radiator valve heats in the zone (None: anywhere), and
        the rooms where one does."""
        doc = self.hass.data[DOMAIN][STORE_DATA]
        zones = doc.get("zones", [])
        listed = {r for z in zones for r in z.get("rooms", [])}
        zone = next((z for z in zones if z["id"] == zone_id), None)

        def in_zone(room_id: str) -> bool:
            if zone_id is None:
                return True
            if zone_id == DEFAULT_ZONE:
                return room_id not in listed
            return zone is not None and room_id in zone.get("rooms", [])

        heating = sorted(
            {
                room_id
                for room_id, valve in self._room_valves()
                if in_zone(room_id)
                and (st := self.hass.states.get(valve)) is not None
                and st.attributes.get("hvac_action") == "heating"
            }
        )
        return bool(heating), heating

    # -- Triggers -----------------------------------------------------------

    def _teardown(self) -> None:
        while self._unsubs:
            self._unsubs.pop()()

    async def async_stop(self) -> None:
        self._teardown()

    async def async_wire_triggers(self) -> None:
        """(Re)attach every zone's per-mode triggers."""
        self._teardown()
        for zone in await self.zones():
            for mode_id, specs in (zone.get("triggers") or {}).items():
                if not specs:
                    continue
                try:
                    configs = await async_validate_trigger_config(self.hass, list(specs))
                    unsub = await async_initialize_triggers(
                        self.hass,
                        configs,
                        self._make_handler(zone["id"], mode_id),
                        DOMAIN,
                        f"homex heating zone {zone['id']} {mode_id}",
                        _LOGGER.log,
                    )
                except Exception:  # noqa: BLE001 - one bad trigger must not break all
                    _LOGGER.exception(
                        "Homex heating: invalid triggers for zone %s mode %s",
                        zone["id"],
                        mode_id,
                    )
                    continue
                if unsub:
                    self._unsubs.append(unsub)

    def _make_handler(self, zone_id: str, mode_id: str):
        @callback
        def handler(run_variables=None, context: Context | None = None) -> None:
            self.hass.async_create_task(self.async_set_mode(zone_id, mode_id))

        return handler


class ZoneModeSelect(SelectEntity):
    """select.homex_heating_<zone>: the zone's active heating mode."""

    _attr_should_poll = False
    _attr_icon = "mdi:home-thermometer"

    def __init__(self, manager: HeatingZones, zone_id: str) -> None:
        self._manager = manager
        self.zone_id = zone_id
        self._attr_unique_id = f"homex_heating_zone_{zone_id}"
        self.entity_id = f"select.homex_heating_{zone_id}"

    def _data(self) -> tuple[dict | None, list[dict]]:
        doc = self.hass.data[DOMAIN][STORE_DATA]
        zone = next((z for z in doc.get("zones", []) if z["id"] == self.zone_id), None)
        return zone, doc["presets"]

    @property
    def name(self) -> str:
        return hx_name("Climate", zone_name(self.hass, self.zone_id), "Mode")

    @property
    def options(self) -> list[str]:
        return [m["name"] for m in self._data()[1]]

    @property
    def current_option(self) -> str | None:
        zone, modes = self._data()
        mode = next((m for m in modes if zone and m["id"] == zone.get("mode")), None)
        return mode["name"] if mode else None

    @property
    def extra_state_attributes(self) -> dict:
        zone, _ = self._data()
        return {
            "zone_id": self.zone_id,
            "zone_name": zone_name(self.hass, self.zone_id),
            "mode_id": zone.get("mode") if zone else None,
            # Mode names by id (e.g. the Unheated mode's current name).
            "modes": {m["id"]: m["name"] for m in self._data()[1]},
            "rooms": list(zone.get("rooms", [])) if zone else [],
        }

    async def async_select_option(self, option: str) -> None:
        _, modes = self._data()
        mode = next((m for m in modes if m["name"] == option), None)
        if mode is not None:
            await self._manager.async_set_mode(self.zone_id, mode["id"])


class ZoneToleranceSelect(SelectEntity):
    """select.homex_climate_tolerance_mode_<zone>: the tolerance its rooms'
    radiators get (normal / agressive); set by the global one too."""

    _attr_should_poll = False
    _attr_icon = "mdi:thermometer-lines"
    _attr_options = list(TOLERANCE_MODES)

    def __init__(self, manager: HeatingZones, zone_id: str) -> None:
        self._manager = manager
        self.zone_id = zone_id
        self._attr_unique_id = f"{TOLERANCE_PREFIX}{zone_id}"
        self.entity_id = f"select.homex_climate_tolerance_mode_{zone_id}"

    @property
    def name(self) -> str:
        return hx_name("Climate", zone_name(self.hass, self.zone_id), "Tolérance")

    @property
    def current_option(self) -> str:
        return tolerance_mode(self.hass, self.zone_id)

    async def async_select_option(self, option: str) -> None:
        await self._manager.async_set_tolerance(option, self.zone_id)


class HeatingNeededSensor(BinarySensorEntity):
    """binary_sensor.homex_heating_needed[_<zone>]: a valve heats in the zone
    (or anywhere, for the global one)."""

    _attr_should_poll = False
    _attr_device_class = BinarySensorDeviceClass.HEAT

    def __init__(self, manager: HeatingZones, zone_id: str | None) -> None:
        self._manager = manager
        self.zone_id = zone_id
        if zone_id is None:
            self._attr_unique_id = "homex_heating_needed"
            self.entity_id = "binary_sensor.homex_heating_needed"
        else:
            self._attr_unique_id = f"homex_heating_needed_zone_{zone_id}"
            self.entity_id = f"binary_sensor.homex_heating_needed_{zone_id}"

    @property
    def name(self) -> str:
        return hx_name("Climate", zone_name(self.hass, self.zone_id), "Chauffage nécessaire")

    @property
    def is_on(self) -> bool:
        return self._manager.heating_needed(self.zone_id)[0]

    @property
    def extra_state_attributes(self) -> dict:
        return {
            "zone_id": self.zone_id,
            "heating_rooms": self._manager.heating_needed(self.zone_id)[1],
        }


# -- WebSocket API ------------------------------------------------------------


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/heating/zone/save",
        vol.Required("zone"): dict,
        vol.Optional("create", default=False): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_heating_zone_save(hass: HomeAssistant, connection, msg) -> None:
    """Create or update a zone (upsert by id). Its rooms leave any other zone;
    its active mode is kept (set through homex/heating/zone/set_mode)."""
    raw = msg["zone"]
    zid = _clean_id(raw.get("id"))
    name = str(raw.get("name") or "").strip()
    if not zid or not name:
        connection.send_error(msg["id"], "invalid", "Nom et id requis (a-z, 0-9, _)")
        return
    manager = zones_manager(hass)
    zones = await manager.zones()
    existing = next((z for z in zones if z["id"] == zid), None)
    if existing is not None and msg["create"]:
        connection.send_error(
            msg["id"], "id_exists", f"Une zone avec l'id « {zid} » existe déjà."
        )
        return
    mode_ids = {m["id"] for m in await manager.modes()}
    triggers = {
        mode_id: list(specs)
        for mode_id, specs in (raw.get("triggers") or {}).items()
        if mode_id in mode_ids and specs
    }
    try:
        for specs in triggers.values():
            await async_validate_trigger_config(hass, specs)
    except Exception as err:  # noqa: BLE001 - surfaced to the editor
        connection.send_error(msg["id"], "invalid_trigger", str(err))
        return
    rooms = [] if zid == DEFAULT_ZONE else list(dict.fromkeys(raw.get("rooms") or []))
    zone = {
        "id": zid,
        "name": name,
        "rooms": rooms,
        "mode": (existing or {}).get("mode") or DEFAULT_MODE,
        "triggers": triggers,
        "builtin": zid == DEFAULT_ZONE,
    }
    for other in zones:
        if other["id"] != zid:
            other["rooms"] = [r for r in other.get("rooms", []) if r not in rooms]
    if existing is not None:
        zones[zones.index(existing)] = zone
    else:
        zones.append(zone)
    await _save(hass)
    await manager.async_sync_entities()
    await manager.async_wire_triggers()
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/heating/zone/delete",
        vol.Required("zone_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_heating_zone_delete(hass: HomeAssistant, connection, msg) -> None:
    """Delete a zone; its rooms fall back to the default zone."""
    if msg["zone_id"] == DEFAULT_ZONE:
        connection.send_error(msg["id"], "builtin", "Zone par défaut : non supprimable")
        return
    manager = zones_manager(hass)
    doc = await _doc(hass)
    doc["zones"] = [z for z in await manager.zones() if z["id"] != msg["zone_id"]]
    await _save(hass)
    await manager.async_sync_entities()
    await manager.async_wire_triggers()
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/heating/zone/set_mode",
        vol.Required("zone_id"): str,
        vol.Required("mode_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_heating_zone_set_mode(hass: HomeAssistant, connection, msg) -> None:
    try:
        await zones_manager(hass).async_set_mode(msg["zone_id"], msg["mode_id"])
    except vol.Invalid as err:
        connection.send_error(msg["id"], "not_found", str(err))
        return
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/heating/room_zone",
        vol.Required("room_id"): str,
        vol.Required("zone_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_heating_room_zone(hass: HomeAssistant, connection, msg) -> None:
    """Put a room in a heating zone (the default zone = in no specific zone)."""
    manager = zones_manager(hass)
    zones = await manager.zones()
    if not any(z["id"] == msg["zone_id"] for z in zones):
        connection.send_error(msg["id"], "not_found", "Zone inconnue")
        return
    room_id = msg["room_id"]
    for zone in zones:
        rooms = [r for r in zone.get("rooms", []) if r != room_id]
        if zone["id"] == msg["zone_id"] and zone["id"] != DEFAULT_ZONE:
            rooms.append(room_id)
        zone["rooms"] = rooms
    await _save(hass)
    await manager.async_sync_entities()
    connection.send_result(msg["id"], {"ok": True})


WS_COMMANDS = (
    ws_heating_zone_save,
    ws_heating_zone_delete,
    ws_heating_zone_set_mode,
    ws_heating_room_zone,
)
