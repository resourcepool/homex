"""Dynamic (animated) room scenes.

A dynamic scene is still a native HA scene (scenes.yaml) — so it is cycled,
recalled, triggered and shown exactly like a normal one — but its content is
owned by Homex: the scene sets the animation's starting state, and once it has
been applied Homex runs the animation.

Animation modes:
  * ``fade_out``: chosen lights start at a colour + brightness, then fade
    progressively to off over ``duration`` seconds.

The fade is stepped (one ``light.turn_on`` with a matching transition every few
seconds) rather than one long transition: long transitions are capped or
ignored by many lights and groups (Zigbee level transitions top out at ~109
minutes, some firmwares ignore them entirely).
"""

from __future__ import annotations

import logging
import time
from typing import TYPE_CHECKING

from homeassistant.core import Event, callback
from homeassistant.helpers.event import async_call_later, async_track_state_change_event

if TYPE_CHECKING:
    from .room import RoomController

_LOGGER = logging.getLogger(__name__)

KIND_NORMAL = "normal"
KIND_DYNAMIC = "dynamic"
MODE_FADE_OUT = "fade_out"
MODES = (MODE_FADE_OUT,)

DEFAULT_DURATION_S = 600  # 10 min
DEFAULT_BRIGHTNESS_PCT = 100
DEFAULT_COLOR = [255, 180, 107]  # warm white
MIN_DURATION_S = 10
MAX_DURATION_S = 6 * 3600

# Delay after the scene entity is activated before fading: lets the starting
# state land first (lights apply one by one).
START_DELAY_S = 2.0
# Step interval bounds: ~100 steps over the duration, kept between these.
MIN_STEP_S = 2.0
MAX_STEP_S = 30.0


def normalize_animation(raw) -> dict:
    """A sanitized animation config (missing/invalid fields get defaults)."""
    raw = raw if isinstance(raw, dict) else {}
    mode = raw.get("mode") if raw.get("mode") in MODES else MODE_FADE_OUT
    lights = [
        e for e in (raw.get("lights") or []) if isinstance(e, str) and e.startswith("light.")
    ]
    color = raw.get("color")
    if not (
        isinstance(color, (list, tuple))
        and len(color) == 3
        and all(isinstance(c, (int, float)) for c in color)
    ):
        color = list(DEFAULT_COLOR)
    color = [max(0, min(255, int(c))) for c in color]
    try:
        brightness = int(raw.get("brightness", DEFAULT_BRIGHTNESS_PCT))
    except (TypeError, ValueError):
        brightness = DEFAULT_BRIGHTNESS_PCT
    try:
        duration = int(raw.get("duration", DEFAULT_DURATION_S))
    except (TypeError, ValueError):
        duration = DEFAULT_DURATION_S
    return {
        "mode": mode,
        "lights": lights,
        "color": color,
        "brightness": max(1, min(100, brightness)),
        "duration": max(MIN_DURATION_S, min(MAX_DURATION_S, duration)),
    }


def scene_entities(animation: dict, room_devices: list[str]) -> dict:
    """scenes.yaml ``entities`` block for a dynamic scene: the starting state.

    Fade out: the chosen lights on at the start colour/brightness; every other
    member of the room off (the animation ends in darkness).
    """
    anim = normalize_animation(animation)
    entities: dict = {}
    for entity_id in room_devices:
        if entity_id not in anim["lights"]:
            entities[entity_id] = {"state": "off"}
    for entity_id in anim["lights"]:
        entities[entity_id] = {
            "state": "on",
            "brightness": round(anim["brightness"] * 255 / 100),
            "rgb_color": list(anim["color"]),
        }
    return entities


class FadeOut:
    """One running fade-out. Cancelled on another scene, room off, or (per
    light) when someone else changes the light meanwhile."""

    def __init__(self, controller: RoomController, key: str, animation: dict) -> None:
        self._controller = controller
        self.hass = controller.hass
        self.key = key
        anim = normalize_animation(animation)
        self._lights: list[str] = list(anim["lights"])
        self._start = anim["brightness"] * 255 / 100
        self._duration = float(anim["duration"])
        self._step = max(MIN_STEP_S, min(MAX_STEP_S, self._duration / 100))
        self._t0 = 0.0
        self._timer = None
        self._unsub_lights = None
        self.running = False

    @property
    def ends_at(self) -> float:
        """Wall-clock end (epoch seconds), for display."""
        return time.time() + max(0.0, self._duration - (time.monotonic() - self._t0))

    def start(self) -> None:
        if not self._lights:
            return
        self.running = True
        # The fade starts after the delay; count the end from then.
        self._t0 = time.monotonic() + START_DELAY_S
        self._timer = async_call_later(self.hass, START_DELAY_S, self._begin)

    @callback
    def _begin(self, _now=None) -> None:
        self._timer = None
        if not self.running:
            return
        self._t0 = time.monotonic()
        self._unsub_lights = async_track_state_change_event(
            self.hass, self._lights, self._on_light_changed
        )
        _LOGGER.debug(
            "[%s] fade out '%s': %d light(s) over %ss (step %ss)",
            self._controller.room_id, self.key, len(self._lights),
            self._duration, self._step,
        )
        self._tick()

    @callback
    def _on_light_changed(self, event: Event) -> None:
        """Someone else touched a fading light: leave it alone from now on."""
        if self._controller.is_self_context(event.context):
            return
        entity_id = event.data.get("entity_id")
        if entity_id in self._lights:
            self._lights.remove(entity_id)
            _LOGGER.debug(
                "[%s] fade out '%s': %s changed externally, released",
                self._controller.room_id, self.key, entity_id,
            )
        if not self._lights:
            self.cancel()

    @callback
    def _tick(self, _now=None) -> None:
        self._timer = None
        if not self.running or not self._lights:
            self.cancel()
            return
        elapsed = time.monotonic() - self._t0
        remaining = self._duration - elapsed
        if remaining <= self._step:
            # Last step: fade the rest of the way to off.
            self._call(
                "turn_off",
                {"transition": max(0, round(remaining))} if remaining > 1 else {},
            )
            self._finish()
            return
        target = max(1, round(self._start * (remaining - self._step) / self._duration))
        self._call("turn_on", {"brightness": target, "transition": self._step})
        self._timer = async_call_later(self.hass, self._step, self._tick)

    def _call(self, service: str, data: dict) -> None:
        self.hass.async_create_task(
            self.hass.services.async_call(
                "light",
                service,
                {"entity_id": list(self._lights), **data},
                blocking=False,
                context=self._controller.new_context(),
            )
        )

    def _finish(self) -> None:
        self.running = False
        self._teardown()
        self._controller.on_animation_ended(self)

    @callback
    def cancel(self) -> None:
        if not self.running:
            return
        self.running = False
        self._teardown()
        _LOGGER.debug("[%s] fade out '%s' cancelled", self._controller.room_id, self.key)
        self._controller.on_animation_ended(self)

    def _teardown(self) -> None:
        if self._timer is not None:
            self._timer()
            self._timer = None
        if self._unsub_lights is not None:
            self._unsub_lights()
            self._unsub_lights = None


def build_animation(controller: RoomController, key: str, animation: dict):
    """The runner for an animation config (only fade_out for now)."""
    anim = normalize_animation(animation)
    if anim["mode"] == MODE_FADE_OUT:
        return FadeOut(controller, key, anim)
    return None
