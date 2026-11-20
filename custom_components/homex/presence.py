"""Presence simulator: lights and shutters driven as if someone were home.

Enabled with switch.homex_presence_simulator (or the toggle of the Presence
page), configured from the panel. The configuration is one Store document
(``homex_presence``)::

    {
      "enabled": bool,
      "jitter": int,          # minutes: every time is moved by ±jitter, daily
      "routines": {
        "<routine>": {"enabled": bool, "actions": [action, ...]},
        ...                   # morning, lunch, afternoon, evening, night
      }
    }

Actions (every one has an "id" and a "kind"; times are "HH:MM"):

- ``light``: room ``room_id`` on at ``start``, off at ``end`` (an end before
  the start is the next day);
- ``blink``: room ``room_id`` turned on and off ``count`` times within
  ``duration`` minutes from ``start``;
- ``off``: room ``room_id`` turned off at ``start``;
- ``shutter``: shutter group ``group_id`` of room ``room_id`` opened or
  closed (``action``: "open" / "close") at ``start``.

Each day gets its own plan: every time moved by a random offset within
±jitter, stable for that day (seeded by the date and the action), so a
restart does not reshuffle it. A room is turned on through its Homex room
switch (its scene strategy applies). A room is not turned off while another
"light" / "blink" of the simulator still holds it on, except by an ``off``
action. Disabling the simulator turns off the rooms it lit.

After a start (Home Assistant restart, integration reload, enable), the
rooms whose "light" span is running are turned on right away; past events
are not replayed.
"""

from __future__ import annotations

import logging
import random
import re
from dataclasses import dataclass, field
from datetime import date, datetime, time, timedelta

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN, HUB_DATA

_LOGGER = logging.getLogger(__name__)

STORE_KEY = "homex_presence"
STORE_HANDLE = "_presence_store"
STORE_DATA = "_presence_store_data"
SIMULATOR = "_presence_simulator"
PRESENCE_SWITCH = "_presence_switch"

ROUTINES = ("morning", "lunch", "afternoon", "evening", "night")
KINDS = ("light", "blink", "off", "shutter")
TICK = timedelta(seconds=20)
MAX_JITTER = 60
MAX_BLINKS = 20
_TIME_RE = re.compile(r"^([01]?\d|2[0-3]):([0-5]\d)$")


# -- Store ------------------------------------------------------------------


def _store(hass: HomeAssistant) -> Store:
    data = hass.data.setdefault(DOMAIN, {})
    store = data.get(STORE_HANDLE)
    if store is None:
        store = data[STORE_HANDLE] = Store(hass, 1, STORE_KEY)
    return store


def _normalize(raw: dict | None) -> dict:
    raw = raw or {}
    routines = raw.get("routines") or {}
    return {
        "enabled": bool(raw.get("enabled", False)),
        "jitter": int(raw.get("jitter", 10) or 0),
        "routines": {
            key: {
                "enabled": (routines.get(key) or {}).get("enabled", True) is not False,
                "actions": list((routines.get(key) or {}).get("actions") or []),
            }
            for key in ROUTINES
        },
    }


async def async_doc(hass: HomeAssistant) -> dict:
    data = hass.data.setdefault(DOMAIN, {})
    if STORE_DATA not in data:
        data[STORE_DATA] = _normalize(await _store(hass).async_load())
    return data[STORE_DATA]


async def _save(hass: HomeAssistant) -> None:
    await _store(hass).async_save(await async_doc(hass))


def is_enabled(hass: HomeAssistant) -> bool:
    return bool((hass.data.get(DOMAIN, {}).get(STORE_DATA) or {}).get("enabled"))


# -- Validation -------------------------------------------------------------


def _time(value) -> str:
    match = _TIME_RE.match(str(value or "").strip())
    if not match:
        raise vol.Invalid(f"invalid time: {value!r}")
    return f"{int(match[1]):02d}:{match[2]}"


def _clean_action(raw: dict) -> dict:
    kind = raw.get("kind")
    if kind not in KINDS:
        raise vol.Invalid(f"unknown action kind: {kind!r}")
    room_id = str(raw.get("room_id") or "").strip()
    if not room_id:
        raise vol.Invalid("room required")
    action = {
        "id": str(raw.get("id") or "").strip() or f"a{random.getrandbits(32):08x}",
        "kind": kind,
        "room_id": room_id,
        "start": _time(raw.get("start")),
    }
    if kind == "light":
        action["end"] = _time(raw.get("end"))
        if action["end"] == action["start"]:
            raise vol.Invalid("start and end must differ")
    elif kind == "blink":
        action["count"] = max(1, min(MAX_BLINKS, int(raw.get("count") or 1)))
        action["duration"] = max(1, min(240, int(raw.get("duration") or 10)))
    elif kind == "shutter":
        action["group_id"] = str(raw.get("group_id") or "").strip()
        if not action["group_id"]:
            raise vol.Invalid("shutter group required")
        action["action"] = "close" if raw.get("action") == "close" else "open"
    return action


def clean_config(raw: dict) -> dict:
    """A configuration from the panel, validated (raises vol.Invalid)."""
    routines = raw.get("routines") or {}
    return {
        "jitter": max(0, min(MAX_JITTER, int(raw.get("jitter", 10) or 0))),
        "routines": {
            key: {
                "enabled": (routines.get(key) or {}).get("enabled", True) is not False,
                "actions": [
                    _clean_action(a)
                    for a in (routines.get(key) or {}).get("actions") or []
                    if isinstance(a, dict)
                ],
            }
            for key in ROUTINES
        },
    }


# -- Plan -------------------------------------------------------------------


@dataclass
class Event:
    at: datetime
    kind: str  # "on" | "off" | "force_off" | "open" | "close"
    room_id: str
    action_id: str
    routine: str
    group_id: str | None = None
    # "on" / "off" of a light / blink: the interval it belongs to.
    span: tuple[datetime, datetime] | None = None
    done: bool = False


@dataclass
class Plan:
    day: date
    events: list[Event] = field(default_factory=list)


def _at(day: date, hhmm: str, offset: float) -> datetime:
    hour, minute = (int(x) for x in hhmm.split(":"))
    base = datetime.combine(day, time(hour, minute), tzinfo=dt_util.get_default_time_zone())
    return base + timedelta(minutes=offset)


def build_plan(doc: dict, day: date) -> Plan:
    """The day's events: every action of the enabled routines, each time
    moved within ±jitter (stable for the day and action)."""
    jitter = int(doc.get("jitter") or 0)
    plan = Plan(day)
    for routine in ROUTINES:
        cfg = doc["routines"].get(routine) or {}
        if not cfg.get("enabled", True):
            continue
        for action in cfg.get("actions") or []:
            rng = random.Random(f"{day.isoformat()}|{action.get('id')}")

            def off(rng=rng) -> float:
                return rng.uniform(-jitter, jitter) if jitter else 0.0

            kind, room = action["kind"], action["room_id"]
            common = {"room_id": room, "action_id": action["id"], "routine": routine}
            start = _at(day, action["start"], off())
            if kind == "light":
                end = _at(day, action["end"], off())
                if action["end"] < action["start"]:
                    end += timedelta(days=1)
                if end <= start:
                    end = start + timedelta(minutes=5)
                span = (start, end)
                plan.events.append(Event(start, "on", span=span, **common))
                plan.events.append(Event(end, "off", span=span, **common))
            elif kind == "blink":
                count = int(action.get("count") or 1)
                step = timedelta(minutes=float(action.get("duration") or 10)) / (2 * count)
                for i in range(count):
                    on_at = start + step * (2 * i)
                    # Not a metronome: each on lasts 60-140 % of its share.
                    off_at = on_at + step * rng.uniform(0.6, 1.4)
                    span = (on_at, off_at)
                    plan.events.append(Event(on_at, "on", span=span, **common))
                    plan.events.append(Event(off_at, "off", span=span, **common))
            elif kind == "off":
                plan.events.append(Event(start, "force_off", **common))
            elif kind == "shutter":
                plan.events.append(
                    Event(start, action.get("action", "open"), group_id=action["group_id"], **common)
                )
    plan.events.sort(key=lambda e: e.at)
    return plan


# -- Simulator --------------------------------------------------------------


class PresenceSimulator:
    """Runs the plans of yesterday (spans crossing midnight) and today while
    enabled; checked every 20 s."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._plans: dict[date, Plan] = {}
        self._lit: set[str] = set()  # rooms the simulator turned on
        self._unsub = None

    # Lifecycle

    async def async_start(self) -> None:
        self.stop()
        await async_doc(self.hass)
        self._unsub = async_track_time_interval(self.hass, self._tick, TICK)
        if is_enabled(self.hass):
            await self._async_resume()

    @callback
    def stop(self) -> None:
        if self._unsub is not None:
            self._unsub()
            self._unsub = None

    async def async_set_enabled(self, enabled: bool) -> None:
        doc = await async_doc(self.hass)
        if doc["enabled"] == enabled:
            return
        doc["enabled"] = enabled
        await _save(self.hass)
        self._write_switch()
        if enabled:
            _LOGGER.info("Homex presence simulator: enabled")
            await self._async_resume()
        else:
            _LOGGER.info("Homex presence simulator: disabled")
            self._plans = {}
            lit, self._lit = self._lit, set()
            for room_id in lit:
                await self._async_room(room_id, False)

    async def async_config_changed(self) -> None:
        """New configuration: replan, keeping what already ran today."""
        if is_enabled(self.hass):
            await self._async_resume()

    def _write_switch(self) -> None:
        entity = self.hass.data.get(DOMAIN, {}).get(PRESENCE_SWITCH)
        if entity is not None and entity.hass is not None:
            entity.async_write_ha_state()

    async def _async_resume(self) -> None:
        """Plan yesterday and today, drop the past events, and turn on the
        rooms whose span is running now."""
        doc = await async_doc(self.hass)
        now = dt_util.now()
        today = now.date()
        self._plans = {}
        running: set[str] = set()
        for day in (today - timedelta(days=1), today):
            plan = build_plan(doc, day)
            for ev in plan.events:
                if ev.at <= now:
                    ev.done = True
                    if ev.kind == "on" and ev.span and ev.span[1] > now:
                        running.add(ev.room_id)
            self._plans[day] = plan
        for room_id in running:
            await self._async_room(room_id, True)

    # Running

    def _holding(self, room_id: str, now: datetime, ignore: Event) -> bool:
        """Whether another light / blink span of the room covers now."""
        for plan in self._plans.values():
            for ev in plan.events:
                if (
                    ev is not ignore
                    and ev.kind == "off"
                    and ev.room_id == room_id
                    and ev.span
                    and ev.span[0] <= now < ev.span[1]
                ):
                    return True
        return False

    async def _tick(self, _now=None) -> None:
        if not is_enabled(self.hass):
            return
        try:
            now = dt_util.now()
            today = now.date()
            if today not in self._plans:
                self._plans[today] = build_plan(await async_doc(self.hass), today)
            for day in [d for d in self._plans if d < today - timedelta(days=1)]:
                del self._plans[day]
            due = [
                ev
                for plan in self._plans.values()
                for ev in plan.events
                if not ev.done and ev.at <= now
            ]
            due.sort(key=lambda e: e.at)
            for ev in due:
                ev.done = True
                await self._async_run(ev, now)
        except Exception:  # noqa: BLE001 - never kill the timer
            _LOGGER.exception("Homex presence simulator: tick failed")

    async def _async_run(self, ev: Event, now: datetime) -> None:
        if ev.kind == "on":
            await self._async_room(ev.room_id, True)
        elif ev.kind == "off":
            if not self._holding(ev.room_id, now, ev):
                await self._async_room(ev.room_id, False)
        elif ev.kind == "force_off":
            await self._async_room(ev.room_id, False)
        elif ev.kind in ("open", "close"):
            controller = self._controller(ev.room_id)
            if controller is None:
                return
            _LOGGER.info(
                "Homex presence simulator: [%s] shutters %s %s",
                ev.room_id,
                ev.group_id,
                ev.kind,
            )
            await controller.async_shutter(
                ev.group_id or "", "open_cover" if ev.kind == "open" else "close_cover"
            )

    def _controller(self, room_id: str):
        hub = self.hass.data.get(DOMAIN, {}).get(HUB_DATA)
        return hub.controllers.get(room_id) if hub else None

    async def _async_room(self, room_id: str, on: bool) -> None:
        controller = self._controller(room_id)
        if controller is None or not controller.lights_enabled:
            return
        entity_id = controller.room_switch_entity_id
        _LOGGER.info("Homex presence simulator: [%s] %s", room_id, "on" if on else "off")
        try:
            await self.hass.services.async_call(
                "switch",
                "turn_on" if on else "turn_off",
                {"entity_id": entity_id},
                blocking=True,
            )
        except Exception as err:  # noqa: BLE001 - keep going with the others
            _LOGGER.warning("Homex presence simulator: [%s] failed: %s", room_id, err)
            return
        if on:
            self._lit.add(room_id)
        else:
            self._lit.discard(room_id)

    # Status

    def schedule(self) -> list[dict]:
        """The events of yesterday's plan still to come and today's."""
        out = []
        for day in sorted(self._plans):
            for ev in self._plans[day].events:
                if day != dt_util.now().date() and ev.done:
                    continue
                out.append(
                    {
                        "at": ev.at.isoformat(),
                        "kind": ev.kind,
                        "room_id": ev.room_id,
                        "group_id": ev.group_id,
                        "routine": ev.routine,
                        "action_id": ev.action_id,
                        "done": ev.done,
                    }
                )
        return out


def simulator(hass: HomeAssistant) -> PresenceSimulator:
    data = hass.data.setdefault(DOMAIN, {})
    sim = data.get(SIMULATOR)
    if sim is None:
        sim = data[SIMULATOR] = PresenceSimulator(hass)
    return sim


async def async_set_presence_enabled(hass: HomeAssistant, enabled: bool) -> None:
    await simulator(hass).async_set_enabled(enabled)


# -- Websocket --------------------------------------------------------------


async def _state(hass: HomeAssistant) -> dict:
    doc = await async_doc(hass)
    return {
        "enabled": doc["enabled"],
        "jitter": doc["jitter"],
        "routines": doc["routines"],
        "schedule": simulator(hass).schedule() if doc["enabled"] else [],
    }


@websocket_api.websocket_command({vol.Required("type"): "homex/presence"})
@websocket_api.async_response
async def ws_presence(hass: HomeAssistant, connection, msg) -> None:
    connection.send_result(msg["id"], await _state(hass))


@websocket_api.websocket_command(
    {vol.Required("type"): "homex/presence/save", vol.Required("config"): dict}
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_presence_save(hass: HomeAssistant, connection, msg) -> None:
    try:
        cleaned = clean_config(msg["config"])
    except (vol.Invalid, TypeError, ValueError) as err:
        connection.send_error(msg["id"], "invalid_config", str(err))
        return
    doc = await async_doc(hass)
    doc.update(cleaned)
    await _save(hass)
    await simulator(hass).async_config_changed()
    connection.send_result(msg["id"], await _state(hass))


@websocket_api.websocket_command(
    {vol.Required("type"): "homex/presence/enabled", vol.Required("enabled"): bool}
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_presence_enabled(hass: HomeAssistant, connection, msg) -> None:
    await async_set_presence_enabled(hass, msg["enabled"])
    connection.send_result(msg["id"], await _state(hass))


WS_COMMANDS = (ws_presence, ws_presence_save, ws_presence_enabled)
