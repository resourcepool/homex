"""Smart toggle for roller shutters (Shutter Device Presets).

A shutter preset (per device model) can describe how to detect the motor's
motion — moving up, moving down, stopped — each as one condition:

- ``{"source": "entity", "domain", "suffix", "state"}``: a HA sensor of the
  cover's device (entity id = ``<domain>.<device slug>_<suffix>``);
- ``{"source": "z2m", "field", "state"}``: a field of the device's
  Zigbee2MQTT JSON state (e.g. ``motor_run_status``), see :mod:`.z2m`.

Values are compared case-insensitively. With smart toggle enabled, "toggle"
becomes: moving → stop; stopped → move the opposite way of the last motion
(an end position wins: fully open → close, fully closed → open).
"""

from __future__ import annotations

import logging
from collections.abc import Callable

from homeassistant.core import Context, Event, HomeAssistant, callback
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.event import async_track_state_change_event

from .z2m import Z2MBridge, get_field

_LOGGER = logging.getLogger(__name__)

UP, DOWN, STOPPED = "up", "down", "stopped"
MOTIONS = ((UP, "moving_up"), (DOWN, "moving_down"), (STOPPED, "stopped"))


def model_key(hass: HomeAssistant, device_id: str | None) -> str:
    dev = dr.async_get(hass).async_get(device_id) if device_id else None
    if dev is None:
        return ""
    return f"{dev.manufacturer or ''}|{dev.model or ''}"


def cover_device(hass: HomeAssistant, cover: str) -> str | None:
    entry = er.async_get(hass).async_get(cover)
    return entry.device_id if entry else None


def preset_conditions(preset: dict) -> list[tuple[str, dict]]:
    """(motion, condition) pairs of a preset, normalized.

    Older presets stored a list of conditions, or ``{entity_id, state}``.
    """
    out = []
    for motion, key in MOTIONS:
        cond = preset.get(key)
        if isinstance(cond, list):
            cond = cond[0] if cond else None
        out.append((motion, dict(cond) if isinstance(cond, dict) else {}))
    return out


def _source(cond: dict) -> str:
    return (cond or {}).get("source") or "entity"


def _configured(cond: dict) -> bool:
    if not cond or not str(cond.get("state", "")).strip():
        return False
    if _source(cond) == "z2m":
        return bool(cond.get("field"))
    return bool(cond.get("entity_id") or (cond.get("domain") and cond.get("suffix")))


def condition_entity(hass: HomeAssistant, device_id: str, cond: dict) -> str | None:
    """The device's entity a sensor condition refers to (by domain + suffix)."""
    if cond.get("entity_id"):  # legacy: a fixed entity id
        return cond["entity_id"]
    domain, suffix = cond.get("domain"), cond.get("suffix")
    if not domain or not suffix:
        return None
    best = None
    for entry in er.async_entries_for_device(er.async_get(hass), device_id):
        if entry.domain != domain:
            continue
        object_id = entry.entity_id.split(".", 1)[1]
        if object_id == suffix:
            return entry.entity_id
        if object_id.endswith("_" + suffix):
            best = best or entry.entity_id
    return best


class ShutterMotion:
    """Tracks shutters' motion and performs the smart toggle."""

    def __init__(self, hass: HomeAssistant, bridge: Z2MBridge) -> None:
        self.hass = hass
        self.bridge = bridge
        self._last_dir: dict[str, str] = {}  # cover entity_id -> UP / DOWN
        self._unsubs: list[Callable[[], None]] = []

    # -- Presets ------------------------------------------------------------

    async def _presets(self) -> list[dict]:
        from .panel import _get_shutter_presets  # lazy: panel imports room

        return await _get_shutter_presets(self.hass)

    async def preset_for(self, cover: str) -> tuple[str | None, dict | None]:
        """(device_id, smart preset) for a cover; preset None if not smart."""
        device_id = cover_device(self.hass, cover)
        key = model_key(self.hass, device_id)
        if not key:
            return device_id, None
        preset = next(
            (
                p
                for p in await self._presets()
                if p.get("model") == key and p.get("smart_toggle")
            ),
            None,
        )
        return device_id, preset

    # -- Motion detection ---------------------------------------------------

    def _value(self, device_id: str, cond: dict):
        if _source(cond) == "z2m":
            return get_field(self.bridge.state(device_id), cond.get("field", ""))
        entity_id = condition_entity(self.hass, device_id, cond)
        state = self.hass.states.get(entity_id) if entity_id else None
        return state.state if state else None

    def _matches(self, device_id: str, cond: dict) -> bool:
        if not _configured(cond):
            return False
        value = self._value(device_id, cond)
        return value is not None and str(value).strip().lower() == str(
            cond["state"]
        ).strip().lower()

    def motion(self, device_id: str, preset: dict) -> str | None:
        """UP / DOWN / STOPPED from the preset's conditions, None if unknown."""
        for motion, cond in preset_conditions(preset):
            if self._matches(device_id, cond):
                return motion
        return None

    # -- Watching (to remember the last direction) --------------------------

    async def async_sync(self, covers: list[str]) -> None:
        """(Re)watch the motion conditions of these covers' smart presets."""
        self.async_stop()
        for cover in dict.fromkeys(covers):
            device_id, preset = await self.preset_for(cover)
            if not device_id or not preset:
                continue
            conds = [c for _, c in preset_conditions(preset) if _configured(c)]
            if any(_source(c) == "z2m" for c in conds):
                self._unsubs.append(
                    await self.bridge.async_watch(
                        device_id, self._on_change(cover, device_id, preset)
                    )
                )
            entities = [
                e
                for c in conds
                if _source(c) == "entity"
                and (e := condition_entity(self.hass, device_id, c))
            ]
            if entities:
                handler = self._on_change(cover, device_id, preset)
                self._unsubs.append(
                    async_track_state_change_event(
                        self.hass, entities, lambda _e, h=handler: h(None)
                    )
                )

    def _on_change(self, cover: str, device_id: str, preset: dict):
        @callback
        def handler(_payload) -> None:
            motion = self.motion(device_id, preset)
            if motion in (UP, DOWN):
                self._last_dir[cover] = motion

        return handler

    @callback
    def async_stop(self) -> None:
        while self._unsubs:
            self._unsubs.pop()()

    # -- Commands -----------------------------------------------------------

    def remember(self, covers: list[str], service: str) -> None:
        """Record the direction of an explicit open / close."""
        motion = {"open_cover": UP, "close_cover": DOWN}.get(service)
        if motion:
            for cover in covers:
                self._last_dir[cover] = motion

    async def async_toggle(self, covers: list[str], context: Context) -> None:
        """Toggle covers, smartly for those whose preset enables it."""
        plain: list[str] = []
        by_service: dict[str, list[str]] = {}
        for cover in covers:
            device_id, preset = await self.preset_for(cover)
            if not device_id or not preset:
                plain.append(cover)
                continue
            service = await self._smart_service(cover, device_id, preset)
            by_service.setdefault(service, []).append(cover)
        if plain:
            by_service.setdefault("toggle", []).extend(plain)
        for service, targets in by_service.items():
            self.remember(targets, service)
            _LOGGER.debug("shutter %s -> %s", targets, service)
            await self.hass.services.async_call(
                "cover",
                service,
                {"entity_id": targets},
                blocking=False,
                context=context,
            )

    async def _smart_service(self, cover: str, device_id: str, preset: dict) -> str:
        conds = [c for _, c in preset_conditions(preset) if _configured(c)]
        if any(_source(c) == "z2m" for c in conds):
            if self.bridge.state(device_id) is None:
                await self.bridge.async_fetch(device_id)
        motion = self.motion(device_id, preset)
        if motion in (UP, DOWN):
            return "stop_cover"
        state = self.hass.states.get(cover)
        position = state.attributes.get("current_position") if state else None
        if position == 100:
            return "close_cover"
        if position == 0 or (state and state.state == "closed"):
            return "open_cover"
        last = self._last_dir.get(cover)
        if last == UP:
            return "close_cover"
        if last == DOWN:
            return "open_cover"
        return "toggle"  # direction unknown: let the cover decide
