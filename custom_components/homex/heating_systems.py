"""Heating systems: the boilers / heat pumps behind the heating zones.

A system serves the global heating or some zones. A boiler drives a dry
contact (a switch entity): on as soon as its scope needs heat (the
binary_sensor.homex_heating_needed[_<zone>] logic), off otherwise and while
heating is disabled globally. With its
"agressive mode" enabled, the tolerance mode of its scope (global: every
zone; else its zones) switches to agressive while the contact is on, and back
to normal when it turns off.

Heat pumps can be declared; they have no behaviour yet. Systems live in the
heating Store document (see heating.py) under "systems".
"""

from __future__ import annotations

import logging

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.const import EVENT_STATE_CHANGED
from homeassistant.core import Event, HomeAssistant, callback

from .const import DOMAIN
from .heating import STORE_DATA, _clean_id, _doc, _save, tolerance_mode
from .heating_zones import zones_manager

_LOGGER = logging.getLogger(__name__)

HEATING_SYSTEMS = "_heating_systems"
SYSTEM_TYPES = ("boiler", "heat_pump")
CONTACT_DOMAINS = ("switch", "input_boolean")
GLOBAL = "global"
NEEDED_PREFIX = "binary_sensor.homex_heating_needed"


def systems_manager(hass: HomeAssistant) -> "HeatingSystems":
    data = hass.data.setdefault(DOMAIN, {})
    manager = data.get(HEATING_SYSTEMS)
    if manager is None:
        manager = data[HEATING_SYSTEMS] = HeatingSystems(hass)
    return manager


class HeatingSystems:
    """Drives each boiler's dry contact from its scope's heating demand."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._unsub = None

    def _systems(self) -> list[dict]:
        return (self.hass.data.get(DOMAIN, {}).get(STORE_DATA) or {}).get("systems", [])

    @callback
    def start(self) -> None:
        # Demand changes surface as heating_needed binary sensor changes; a
        # dry contact switched by hand is put back in line too.
        self._unsub = self.hass.bus.async_listen(EVENT_STATE_CHANGED, self._on_state)

    @callback
    def stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None

    @callback
    def _on_state(self, event: Event) -> None:
        entity_id = event.data.get("entity_id", "")
        contacts = {s.get("contact") for s in self._systems()}
        if entity_id.startswith(NEEDED_PREFIX) or entity_id in contacts:
            self.hass.async_create_task(self.async_update())

    def demand(self, system: dict) -> bool:
        """Whether the system's scope (global, or any of its zones) needs heat;
        never while heating is disabled globally."""
        doc = self.hass.data.get(DOMAIN, {}).get(STORE_DATA) or {}
        if not doc.get("enabled", True):
            return False
        zones = zones_manager(self.hass)
        scope = system.get("zones") or [GLOBAL]
        return any(
            zones.heating_needed(None if z == GLOBAL else z)[0] for z in scope
        )

    async def async_update(self) -> None:
        """Bring every boiler's dry contact (and tolerance) in line."""
        await _doc(self.hass)
        for system in self._systems():
            if system.get("type") != "boiler" or not system.get("contact"):
                continue
            try:
                await self._async_drive(system)
            except Exception:  # noqa: BLE001 - one system must not block others
                _LOGGER.exception("Homex heating: system %s failed", system.get("id"))

    async def _async_drive(self, system: dict) -> None:
        contact = system["contact"]
        st = self.hass.states.get(contact)
        if st is None or st.state in ("unknown", "unavailable"):
            return
        want = self.demand(system)
        if (st.state == "on") != want:
            domain = contact.split(".", 1)[0]
            await self.hass.services.async_call(
                domain, "turn_on" if want else "turn_off", {"entity_id": contact}, blocking=True
            )
            _LOGGER.info(
                "Homex heating: %s %s → %s", system.get("name"), contact, "on" if want else "off"
            )
        if system.get("aggressive"):
            await self._async_tolerance(system, "agressive" if want else "normal")

    async def _async_tolerance(self, system: dict, mode: str) -> None:
        """Set the tolerance mode of the system's scope: the global one (which
        sets every zone's), or each of its zones'."""
        zones = zones_manager(self.hass)
        scope = system.get("zones") or [GLOBAL]
        if GLOBAL in scope:
            if tolerance_mode(self.hass) != mode or any(
                tolerance_mode(self.hass, z["id"]) != mode for z in await zones.zones()
            ):
                await zones.async_set_tolerance(mode)
            return
        for zone_id in scope:
            if tolerance_mode(self.hass, zone_id) != mode:
                await zones.async_set_tolerance(mode, zone_id)


def _clean_system(raw: dict) -> dict:
    sid = _clean_id(raw.get("id"))
    name = str(raw.get("name") or "").strip()
    stype = raw.get("type")
    if not sid or not name or stype not in SYSTEM_TYPES:
        raise vol.Invalid("Nom, id et type requis")
    contact = str(raw.get("contact") or "")
    if contact and contact.split(".", 1)[0] not in CONTACT_DOMAINS:
        raise vol.Invalid("Le contact sec doit être un switch ou un input_boolean")
    zones = [str(z) for z in (raw.get("zones") or []) if z]
    return {
        "id": sid,
        "name": name,
        "type": stype,
        "contact": contact,
        # Empty / ["global"]: the global heating; else the zones served.
        "zones": [GLOBAL] if not zones or GLOBAL in zones else list(dict.fromkeys(zones)),
        "aggressive": bool(raw.get("aggressive")),
    }


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/heating/system/save",
        vol.Required("system"): dict,
        vol.Optional("create", default=False): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_heating_system_save(hass: HomeAssistant, connection, msg) -> None:
    """Create or update a heating system (upsert by id), then drive it."""
    try:
        system = _clean_system(msg["system"])
    except vol.Invalid as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    doc = await _doc(hass)
    systems = doc.setdefault("systems", [])
    if msg["create"] and any(s.get("id") == system["id"] for s in systems):
        connection.send_error(
            msg["id"], "id_exists", f"Un système avec l'id « {system['id']} » existe déjà."
        )
        return
    doc["systems"] = [s for s in systems if s.get("id") != system["id"]] + [system]
    await _save(hass)
    await systems_manager(hass).async_update()
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/heating/system/delete",
        vol.Required("system_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_heating_system_delete(hass: HomeAssistant, connection, msg) -> None:
    doc = await _doc(hass)
    doc["systems"] = [s for s in doc.get("systems", []) if s.get("id") != msg["system_id"]]
    await _save(hass)
    connection.send_result(msg["id"], {"ok": True})


WS_COMMANDS = (ws_heating_system_save, ws_heating_system_delete)
