"""Heating systems: the boilers / heat pumps behind the heating zones.

A system serves the global heating or some zones. A boiler drives a dry
contact (a switch entity): on as soon as its scope needs heat (the
binary_sensor.homex_heating_needed[_<zone>] logic), off otherwise and while
heating is disabled globally. With its
"agressive mode" enabled, the tolerance mode of its scope (global: every
zone; else its zones) switches to agressive while the contact is on, and back
to normal when it turns off.

A buffer tank drives a circulator (a switch entity) from temperature
sensors (setpoint, tank, flow, return) and circulation rules. Each rule
compares a gap between two temperatures with its delta and tolerance:
- "setpoint_tank": gap = setpoint - tank;
- "flow_return": gap = flow - return.
It asks for circulation once gap >= delta and stops asking once
gap < tolerance (hysteresis in between). The circulator runs while any rule
asks for it AND the heating demands heat (the system's scope needs heat,
heating enabled globally). An optional manual force entity (switch /
input_boolean) runs it whatever the rules and the demand, while heating is
enabled globally. Once started it runs at least min_runtime minutes,
whatever stops it.

A buffer tank has a scope (global or zones: whose heat demand counts) and an
agressive mode too: the tolerance of its scope is agressive while the
circulator runs.

Every boiler and buffer tank exposes entities (binary_sensor / sensor /
switch homex_system_<id>_<key>): its demand, its drive decision, its rules
and gaps, the minimal runtime left, and a switch for its agressive mode.

Heat pumps (legacy) have no behaviour. Systems live in the heating Store
document (see heating.py) under "systems".
"""

from __future__ import annotations

import logging
import time

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.const import EVENT_STATE_CHANGED
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from datetime import timedelta

from .const import DOMAIN
from .heating import STORE_DATA, _clean_id, _doc, _save, tolerance_mode
from .heating_zones import zones_manager

_LOGGER = logging.getLogger(__name__)

HEATING_SYSTEMS = "_heating_systems"
SYSTEM_TYPES = ("boiler", "heat_pump", "buffer_tank")
CONTACT_DOMAINS = ("switch", "input_boolean")
SETPOINT_DOMAINS = ("sensor", "input_number", "number")
TANK_SENSORS = ("setpoint_sensor", "tank_sensor", "flow_sensor", "return_sensor")
# Rule type -> (minuend, subtrahend) sensors of its gap.
RULE_GAPS = {
    "setpoint_tank": ("setpoint_sensor", "tank_sensor"),
    "flow_return": ("flow_sensor", "return_sensor"),
}
LEGACY_RULES = {"delta": "setpoint_tank"}
GLOBAL = "global"
NEEDED_PREFIX = "binary_sensor.homex_heating_needed"
DRIVEN_TYPES = ("boiler", "buffer_tank")
ENTITY_PREFIX = "homex_system_"
RULE_LABELS = {"setpoint_tank": "consigne / ballon", "flow_return": "départ / retour"}
GAP_LABELS = {"setpoint_tank": "consigne - ballon", "flow_return": "départ - retour"}


def system_entity_keys(system: dict) -> dict[str, list[tuple[str, str]]]:
    """Per platform, the (key, label) of the entities a system exposes."""
    stype = system.get("type")
    if stype not in DRIVEN_TYPES:
        return {}
    binary = [("demand", "Demande")]
    sensors: list[tuple[str, str]] = []
    if stype == "boiler":
        binary.append(("contact", "Contact sec"))
    else:
        binary += [("circulation", "Circulation"), ("forced", "Forçage")]
        for rule in system.get("rules") or []:
            rtype = LEGACY_RULES.get(rule.get("type"), rule.get("type"))
            if rtype in RULE_GAPS:
                binary.append((f"rule_{rtype}", f"Règle {RULE_LABELS[rtype]}"))
                sensors.append((f"gap_{rtype}", f"Delta {GAP_LABELS[rtype]}"))
        sensors.append(("min_runtime_left", "Temps minimal restant"))
        sensors.append(("runtime_today", "Durée d'activité aujourd'hui"))
    return {
        "binary_sensor": binary,
        "sensor": sensors,
        "switch": [("aggressive", "Mode agressif")],
    }


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
        # Buffer tanks: per system, each rule's hysteresis state, when the
        # circulator was started by us, and the pending min-runtime re-check.
        self._rules_on: dict[str, list[bool]] = {}
        self._started: dict[str, float] = {}
        self._timers: dict[str, object] = {}
        # Last computed status per system (read by the entities).
        self.status: dict[str, dict] = {}
        # Exposed entities: per platform, its add callback and its entities
        # by (system id, key).
        self._add: dict[str, AddEntitiesCallback] = {}
        self._entities: dict[str, dict[tuple[str, str], object]] = {}
        self._tick_unsub = None

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
        for cancel in self._timers.values():
            cancel()
        self._timers.clear()
        if self._tick_unsub:
            self._tick_unsub()
            self._tick_unsub = None

    # -- Exposed entities ----------------------------------------------------

    def system(self, sid: str) -> dict | None:
        return next((s for s in self._systems() if s.get("id") == sid), None)

    async def async_setup_platform(
        self, domain: str, add_entities: AddEntitiesCallback
    ) -> None:
        """A platform (binary_sensor / sensor / switch) is ready: drop the
        registry entries of removed systems, add the current ones."""
        await _doc(self.hass)
        self._add[domain] = add_entities
        self._entities[domain] = {}
        wanted = {
            f"{ENTITY_PREFIX}{s['id']}_{key}"
            for s in self._systems()
            for key, _ in system_entity_keys(s).get(domain, [])
        }
        ent_reg = er.async_get(self.hass)
        for reg in list(ent_reg.entities.values()):
            if (
                reg.platform == DOMAIN
                and reg.domain == domain
                and reg.unique_id.startswith(ENTITY_PREFIX)
                and reg.unique_id not in wanted
            ):
                ent_reg.async_remove(reg.entity_id)
        self.sync_entities()
        if self._tick_unsub is None:
            # The minimal runtime left counts down between state changes.
            self._tick_unsub = async_track_time_interval(
                self.hass, self._tick, timedelta(seconds=10)
            )

    @callback
    def unload_platform(self, domain: str) -> None:
        self._add.pop(domain, None)
        self._entities.pop(domain, None)
        if not self._add and self._tick_unsub:
            self._tick_unsub()
            self._tick_unsub = None

    @callback
    def sync_entities(self) -> None:
        """Add the entities of new systems / rules, remove stale ones."""
        from .system_entities import ENTITY_CLASSES  # platform classes

        ent_reg = er.async_get(self.hass)
        for domain, add in self._add.items():
            current = self._entities.setdefault(domain, {})
            wanted = {
                (s["id"], key): label
                for s in self._systems()
                for key, label in system_entity_keys(s).get(domain, [])
            }
            for ref in [r for r in current if r not in wanted]:
                entity = current.pop(ref)
                if entity.entity_id and ent_reg.async_get(entity.entity_id):
                    ent_reg.async_remove(entity.entity_id)
                elif entity.hass is not None:
                    self.hass.async_create_task(entity.async_remove())
            new = [
                ENTITY_CLASSES[domain](self, sid, key, label)
                for (sid, key), label in wanted.items()
                if (sid, key) not in current
            ]
            for entity in new:
                current[(entity.system_id, entity.key)] = entity
            if new:
                add(new)
        self.write_entities()

    @callback
    def write_entities(self) -> None:
        for entities in self._entities.values():
            for entity in entities.values():
                if entity.hass is not None:
                    entity.async_write_ha_state()

    @callback
    def _tick(self, _now) -> None:
        for (sid, key), entity in (self._entities.get("sensor") or {}).items():
            if key in ("min_runtime_left", "runtime_today") and entity.hass is not None:
                entity.async_write_ha_state()

    def min_runtime_left(self, sid: str) -> float:
        system = self.system(sid)
        if not system or sid not in self._started:
            return 0
        circ = self.hass.states.get(system.get("circulator") or "")
        if circ is None or circ.state != "on":
            return 0
        min_s = float(system.get("min_runtime") or 0) * 60
        return max(0.0, round(min_s - (time.monotonic() - self._started[sid])))

    async def async_set_aggressive(self, sid: str, on: bool) -> None:
        """The system's agressive mode switch: persist it, then re-drive (off:
        its scope goes back to the normal tolerance)."""
        doc = await _doc(self.hass)
        system = next((s for s in doc.get("systems", []) if s.get("id") == sid), None)
        if system is None:
            return
        system["aggressive"] = bool(on)
        await _save(self.hass)
        if not on:
            await self._async_tolerance(system, "normal")
        await self.async_update()

    @callback
    def _on_state(self, event: Event) -> None:
        entity_id = event.data.get("entity_id", "")
        watched = set()
        for s in self._systems():
            watched.add(s.get("contact"))
            watched.add(s.get("circulator"))
            watched.add(s.get("force"))
            watched.update(s.get(key) for key in TANK_SENSORS)
        watched.discard(None)
        watched.discard("")
        if entity_id.startswith(NEEDED_PREFIX) or entity_id in watched:
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
            try:
                if system.get("type") == "buffer_tank" and system.get("circulator"):
                    await self._async_drive_tank(system)
                    continue
                if system.get("type") != "boiler":
                    continue
                want = self.demand(system)
                self.status[system["id"]] = {"demand": want, "want": want}
                if system.get("contact"):
                    await self._async_drive(system)
            except Exception:  # noqa: BLE001 - one system must not block others
                _LOGGER.exception("Homex heating: system %s failed", system.get("id"))
        try:
            await self._async_apply_tolerances()
        except Exception:  # noqa: BLE001
            _LOGGER.exception("Homex heating: tolerance update failed")
        self.write_entities()

    def _active(self, system: dict) -> bool:
        """Whether the system currently runs: the boiler's dry contact or the
        tank's circulator is on (min runtime included)."""
        entity = system.get("contact") if system.get("type") == "boiler" else system.get("circulator")
        st = self.hass.states.get(entity or "")
        return st is not None and st.state == "on"

    async def _async_apply_tolerances(self) -> None:
        """Agressive mode of every system at once, so systems sharing a scope
        don't undo each other: a zone is agressive while any agressive
        system covering it runs, normal when all of them are idle. Zones no
        agressive system covers are left alone."""
        systems = [
            s for s in self._systems()
            if s.get("aggressive") and s.get("type") in ("boiler", "buffer_tank")
        ]
        if not systems:
            return
        zone_ids = [z["id"] for z in await zones_manager(self.hass).zones()]
        global_mode = None
        zone_modes: dict[str, str] = {}
        for system in systems:
            mode = "agressive" if self._active(system) else "normal"
            scope = system.get("zones") or [GLOBAL]
            covered = zone_ids if GLOBAL in scope else [z for z in scope if z in zone_ids]
            if GLOBAL in scope and global_mode != "agressive":
                global_mode = mode
            for zid in covered:
                if zone_modes.get(zid) != "agressive":
                    zone_modes[zid] = mode
        await zones_manager(self.hass).async_apply_tolerances(global_mode, zone_modes)

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

    def _temp(self, entity_id: str | None) -> float | None:
        st = self.hass.states.get(entity_id) if entity_id else None
        try:
            return float(st.state) if st else None
        except (TypeError, ValueError):
            return None

    def tank_status(self, system: dict) -> dict:
        """The buffer tank's readings and, per rule, whether it asks for
        circulation (hysteresis: keeps its last state between thresholds)."""
        sid = system["id"]
        circ = self.hass.states.get(system.get("circulator") or "")
        running = circ is not None and circ.state == "on"
        temps = {key: self._temp(system.get(key)) for key in TANK_SENSORS}
        rules = system.get("rules") or []
        prev = self._rules_on.get(sid)
        if prev is None or len(prev) != len(rules):
            prev = [running] * len(rules)
        states = []
        gaps: dict[str, float | None] = {}
        by_type: dict[str, bool] = {}
        for rule, was_on in zip(rules, prev):
            on = was_on
            rtype = LEGACY_RULES.get(rule.get("type"), rule.get("type"))
            sensors = RULE_GAPS.get(rtype)
            if sensors:
                a, b = (temps[k] for k in sensors)
                gaps[rtype] = None
                if a is not None and b is not None:
                    gap = gaps[rtype] = round(a - b, 2)
                    if gap >= float(rule.get("delta", 0)):
                        on = True
                    elif gap < float(rule.get("tolerance", 0)):
                        on = False
            states.append(on)
            if rtype:
                by_type[rtype] = on
        self._rules_on[sid] = states
        return {
            "running": running,
            "setpoint": temps["setpoint_sensor"],
            "tank": temps["tank_sensor"],
            "flow": temps["flow_sensor"],
            "return": temps["return_sensor"],
            "rules": states,
            "rule_by_type": by_type,
            "gaps": gaps,
            "demand": self.demand(system),
            "forced": self._forced(system),
        }

    def _forced(self, system: dict) -> bool:
        """Manual force on, while heating is enabled globally."""
        force = self.hass.states.get(system.get("force") or "")
        doc = self.hass.data.get(DOMAIN, {}).get(STORE_DATA) or {}
        return force is not None and force.state == "on" and doc.get("enabled", True)

    async def _async_drive_tank(self, system: dict) -> None:
        sid = system["id"]
        circulator = system["circulator"]
        st = self.hass.states.get(circulator)
        if st is None or st.state in ("unknown", "unavailable"):
            return
        status = self.tank_status(system)
        # demand(): heating enabled globally and its scope needs heat.
        want = status["forced"] or (status["demand"] and any(status["rules"]))
        status["want"] = want
        self.status[sid] = status
        running = st.state == "on"
        await self._async_drive_circulator(system, status, want, running)

    async def _async_drive_circulator(
        self, system: dict, status: dict, want: bool, running: bool
    ) -> None:
        sid = system["id"]
        circulator = system["circulator"]
        if running and sid not in self._started:
            # Started outside Homex (or before a restart): count from now.
            self._started[sid] = time.monotonic()
        if not running:
            self._started.pop(sid, None)
        if running == want:
            return
        if running and not want:
            # Every stop waits for the minimal runtime, whatever asks for it
            # (rules satisfied, no heat demand, heating disabled).
            min_s = float(system.get("min_runtime") or 0) * 60
            left = min_s - (time.monotonic() - self._started.get(sid, 0))
            if left > 0:
                self._schedule(sid, left)
                return
        domain = circulator.split(".", 1)[0]
        await self.hass.services.async_call(
            domain, "turn_on" if want else "turn_off", {"entity_id": circulator}, blocking=True
        )
        if want:
            self._started[sid] = time.monotonic()
        else:
            self._started.pop(sid, None)
        _LOGGER.info(
            "Homex heating: %s circulator %s → %s (forced %s, rules %s, demand %s, "
            "setpoint %s, tank %s, flow %s, return %s)",
            system.get("name"), circulator, "on" if want else "off", status["forced"],
            status["rules"],
            status["demand"], status["setpoint"], status["tank"], status["flow"],
            status["return"],
        )

    @callback
    def _schedule(self, sid: str, delay: float) -> None:
        """Re-check once the circulator's minimal runtime has elapsed."""
        if sid in self._timers:
            return

        @callback
        def _fire(_now) -> None:
            self._timers.pop(sid, None)
            self.hass.async_create_task(self.async_update())

        self._timers[sid] = async_call_later(self.hass, delay + 1, _fire)

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
    if stype == "buffer_tank":
        return _clean_tank(sid, name, raw)
    return {
        "id": sid,
        "name": name,
        "type": stype,
        "contact": contact,
        "zones": _clean_zones(raw),
        "aggressive": bool(raw.get("aggressive")),
    }


def _clean_tank(sid: str, name: str, raw: dict) -> dict:
    sensors = {}
    for key in TANK_SENSORS:
        entity = str(raw.get(key) or "")
        domains = SETPOINT_DOMAINS if key == "setpoint_sensor" else ("sensor",)
        if entity and entity.split(".", 1)[0] not in domains:
            raise vol.Invalid(f"Capteur invalide : {entity}")
        sensors[key] = entity
    circulator = str(raw.get("circulator") or "")
    if not circulator or circulator.split(".", 1)[0] not in CONTACT_DOMAINS:
        raise vol.Invalid("Le circulateur doit être un switch ou un input_boolean")
    force = str(raw.get("force") or "")
    if force and force.split(".", 1)[0] not in CONTACT_DOMAINS:
        raise vol.Invalid("Le forçage doit être un switch ou un input_boolean")
    if force and force == circulator:
        raise vol.Invalid("Le forçage doit être différent du circulateur")
    try:
        min_runtime = max(0.0, float(raw.get("min_runtime") or 0))
    except (TypeError, ValueError) as err:
        raise vol.Invalid("Temps d'exécution minimal invalide") from err
    rules = []
    labels = {
        "setpoint_sensor": "consigne",
        "tank_sensor": "ballon",
        "flow_sensor": "départ",
        "return_sensor": "retour",
    }
    for rule in raw.get("rules") or []:
        rtype = LEGACY_RULES.get(rule.get("type"), rule.get("type"))
        if rtype not in RULE_GAPS:
            raise vol.Invalid("Type de règle inconnu")
        if any(r["type"] == rtype for r in rules):
            raise vol.Invalid("Chaque type de règle ne peut être ajouté qu'une fois")
        missing = [labels[k] for k in RULE_GAPS[rtype] if not sensors[k]]
        if missing:
            raise vol.Invalid("Capteur requis par la règle : " + ", ".join(missing))
        try:
            delta = float(rule.get("delta"))
            tolerance = float(rule.get("tolerance"))
        except (TypeError, ValueError) as err:
            raise vol.Invalid("Delta et tolérance requis") from err
        if delta <= 0 or tolerance < 0 or tolerance >= delta:
            raise vol.Invalid("Il faut delta > tolérance ≥ 0")
        rules.append({"type": rtype, "delta": delta, "tolerance": tolerance})
    return {
        "id": sid,
        "name": name,
        "type": "buffer_tank",
        **sensors,
        "circulator": circulator,
        "force": force,
        "min_runtime": min_runtime,
        "rules": rules,
        "zones": _clean_zones(raw),
        "aggressive": bool(raw.get("aggressive")),
    }


def _clean_zones(raw: dict) -> list[str]:
    # Empty / ["global"]: the global heating; else the zones served.
    zones = [str(z) for z in (raw.get("zones") or []) if z]
    return [GLOBAL] if not zones or GLOBAL in zones else list(dict.fromkeys(zones))


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
    previous = next((s for s in systems if s.get("id") == system["id"]), None)
    doc["systems"] = [s for s in systems if s.get("id") != system["id"]] + [system]
    await _save(hass)
    manager = systems_manager(hass)
    if previous and previous.get("aggressive") and not system.get("aggressive"):
        await manager._async_tolerance(previous, "normal")
    manager.sync_entities()
    await manager.async_update()
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
    systems_manager(hass).sync_entities()
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "homex/heating/system/status",
        vol.Required("system_id"): str,
    }
)
@websocket_api.async_response
async def ws_heating_system_status(hass: HomeAssistant, connection, msg) -> None:
    """A buffer tank's live readings and each rule's circulation demand."""
    await _doc(hass)
    manager = systems_manager(hass)
    system = next((s for s in manager._systems() if s.get("id") == msg["system_id"]), None)
    if system is None or system.get("type") != "buffer_tank":
        connection.send_error(msg["id"], "not_found", "Système introuvable")
        return
    connection.send_result(msg["id"], manager.tank_status(system))


WS_COMMANDS = (ws_heating_system_save, ws_heating_system_delete, ws_heating_system_status)
