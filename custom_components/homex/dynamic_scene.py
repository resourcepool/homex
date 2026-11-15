"""Dynamic (animated) room scenes.

A dynamic scene is still a native HA scene (scenes.yaml) — so it is cycled,
recalled, triggered and shown exactly like a normal one — but its content is
owned by Homex: the scene sets the animation's starting state, and once it has
been applied Homex runs the animation.

Animation modes:
  * ``fade_out``: each chosen light starts at its own colour + brightness,
    then all fade progressively to off over ``duration`` seconds.
  * ``fade_in``: each chosen light starts barely on (1 %) in its own colour,
    then all rise progressively to their own brightness over ``duration``
    seconds, and stay on.
  * ``pixel`` (animated pixel): each light is mapped on a zone of a video;
    the browser samples the video every ``interval`` seconds and averages each
    zone into a colour + brightness; Homex plays those samples on the lights at
    ``fps`` samples per second (default 1 / interval: real time; higher plays
    the video faster, lower slower — the animation lasts frame_count / fps),
    looping (``repeat``), back and forth (``reverse``) or ``once`` — then the
    lights take the end state (``lights``, like the other modes).

Config: ``{mode, duration, lights: [{entity_id, color: [r,g,b], brightness: %,
kelvin?}]}`` — ``kelvin`` set: the light starts at that white temperature
(``color`` then only previews it).
(Older configs with bare entity ids and a shared colour/brightness are read
as that colour/brightness for every light.)

The fade is stepped (one ``light.turn_on`` with a matching transition every few
seconds) rather than one long transition: long transitions are capped or
ignored by many lights and groups (Zigbee level transitions top out at ~109
minutes, some firmwares ignore them entirely).
"""

from __future__ import annotations

import logging
import re
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
MODE_FADE_IN = "fade_in"
MODE_PIXEL = "pixel"
MODES = (MODE_FADE_OUT, MODE_FADE_IN, MODE_PIXEL)
LOOP_REPEAT = "repeat"
LOOP_REVERSE = "reverse"
LOOP_ONCE = "once"
LOOPS = (LOOP_REPEAT, LOOP_REVERSE, LOOP_ONCE)
MIN_INTERVAL_S = 0.1
MAX_INTERVAL_S = 60.0
MIN_FPS = 1 / 60
MAX_FPS = 10.0
# A sample this dark (brightness 0-255) turns the light off.
PIXEL_OFF_BELOW = 3

# Zigbee can't take a flood of commands: past a few per second the
# coordinator / Zigbee2MQTT queue them (the lights lag further and further, a
# stop only lands after the backlog) or even restart. Animations share one
# command budget for the whole house, and each light gets at most one command
# per LIGHT_MIN_GAP_S: in between, frames are skipped (never queued).
COMMANDS_PER_S = 6.0
LIGHT_MIN_GAP_S = 0.8
# Changes smaller than this aren't worth a command (brightness / colour, 0-255).
MIN_BRIGHTNESS_DELTA = 4
MIN_COLOR_DELTA = 12
BUDGET_KEY = "homex_animation_budget"


class CommandBudget:
    """Token bucket shared by every running animation (see COMMANDS_PER_S)."""

    def __init__(self, rate: float = COMMANDS_PER_S) -> None:
        self.rate = rate
        self._tokens = rate
        self._at = time.monotonic()

    def take(self) -> bool:
        now = time.monotonic()
        self._tokens = min(self.rate, self._tokens + (now - self._at) * self.rate)
        self._at = now
        if self._tokens < 1:
            return False
        self._tokens -= 1
        return True


def command_budget(hass) -> CommandBudget:
    budget = hass.data.get(BUDGET_KEY)
    if budget is None:
        budget = hass.data[BUDGET_KEY] = CommandBudget()
    return budget


def _worth_sending(previous: tuple | None, sample: tuple) -> bool:
    """A visible change from what the light was last told."""
    if previous is None or len(previous) != len(sample):
        return True  # first command, or on ↔ off
    if len(sample) == 1:
        return False  # off → off
    if abs(previous[3] - sample[3]) >= MIN_BRIGHTNESS_DELTA:
        return True
    return max(abs(a - b) for a, b in zip(previous[:3], sample[:3])) >= MIN_COLOR_DELTA

DEFAULT_DURATION_S = 600  # 10 min
DEFAULT_BRIGHTNESS_PCT = 100
DEFAULT_COLOR = [255, 180, 107]  # warm white
MIN_KELVIN = 2000
MAX_KELVIN = 6500
MIN_DURATION_S = 10
MAX_DURATION_S = 6 * 3600

# Delay after the scene entity is activated before fading: lets the starting
# state land first (lights apply one by one).
START_DELAY_S = 2.0
# Step interval bounds: ~100 steps over the duration, kept between these.
MIN_STEP_S = 2.0
MAX_STEP_S = 30.0


def _color(value, default) -> list[int]:
    if not (
        isinstance(value, (list, tuple))
        and len(value) == 3
        and all(isinstance(c, (int, float)) for c in value)
    ):
        value = default
    return [max(0, min(255, int(c))) for c in value]


def _pct(value, default: int) -> int:
    try:
        return max(1, min(100, int(value)))
    except (TypeError, ValueError):
        return default


def normalize_animation(raw) -> dict:
    """A sanitized animation config (missing/invalid fields get defaults)."""
    raw = raw if isinstance(raw, dict) else {}
    mode = raw.get("mode") if raw.get("mode") in MODES else MODE_FADE_OUT
    # Legacy shared settings: the default of every light.
    color = _color(raw.get("color"), DEFAULT_COLOR)
    brightness = _pct(raw.get("brightness"), DEFAULT_BRIGHTNESS_PCT)
    lights: list[dict] = []
    seen: set[str] = set()
    for item in raw.get("lights") or []:
        if isinstance(item, str):
            item = {"entity_id": item}
        if not isinstance(item, dict):
            continue
        entity_id = item.get("entity_id")
        if not (isinstance(entity_id, str) and entity_id.startswith("light.")):
            continue
        if entity_id in seen:
            continue
        seen.add(entity_id)
        light = {
            "entity_id": entity_id,
            "color": _color(item.get("color"), color),
            "brightness": _pct(item.get("brightness"), brightness),
        }
        try:
            kelvin = int(item["kelvin"]) if item.get("kelvin") else None
        except (TypeError, ValueError):
            kelvin = None
        if kelvin:
            light["kelvin"] = max(MIN_KELVIN, min(MAX_KELVIN, kelvin))
        lights.append(light)
    if mode == MODE_PIXEL:
        return {"mode": mode, "lights": lights, **_normalize_pixel(raw)}
    try:
        duration = int(raw.get("duration", DEFAULT_DURATION_S))
    except (TypeError, ValueError):
        duration = DEFAULT_DURATION_S
    return {
        "mode": mode,
        "lights": lights,
        "duration": max(MIN_DURATION_S, min(MAX_DURATION_S, duration)),
    }


def _hex_id(value) -> str:
    return value if isinstance(value, str) and re.fullmatch(r"[0-9a-f]{32}", value) else ""


def _normalize_pixel(raw: dict) -> dict:
    """The pixel-specific fields: video, sampling, loop, zones, frames."""
    try:
        interval = float(raw.get("interval", 1.0))
    except (TypeError, ValueError):
        interval = 1.0
    interval = round(max(MIN_INTERVAL_S, min(MAX_INTERVAL_S, interval)), 3)
    try:
        fps = float(raw.get("fps") or 1 / interval)
    except (TypeError, ValueError):
        fps = 1 / interval
    fps = round(max(MIN_FPS, min(MAX_FPS, fps)), 4)
    zones: dict[str, list[float]] = {}
    for entity_id, rect in (raw.get("zones") or {}).items():
        if not (isinstance(entity_id, str) and entity_id.startswith("light.")):
            continue
        try:
            x, y, w, h = (max(0.0, min(1.0, float(v))) for v in rect)
        except (TypeError, ValueError):
            continue
        if w > 0 and h > 0:
            zones[entity_id] = [round(x, 4), round(y, 4), round(w, 4), round(h, 4)]
    first: dict[str, list[int]] = {}
    for entity_id, sample in (raw.get("first") or {}).items():
        if entity_id in zones and isinstance(sample, (list, tuple)) and len(sample) == 4:
            try:
                first[entity_id] = [max(0, min(255, int(v))) for v in sample]
            except (TypeError, ValueError):
                continue
    try:
        count = max(0, int(raw.get("frame_count") or 0))
    except (TypeError, ValueError):
        count = 0
    name = raw.get("video_name")
    return {
        "video_id": _hex_id(raw.get("video_id")),
        "video_name": name[:120] if isinstance(name, str) else "",
        "interval": interval,
        "fps": fps,
        "loop": raw.get("loop") if raw.get("loop") in LOOPS else LOOP_REPEAT,
        "zones": zones,
        "frames_id": _hex_id(raw.get("frames_id")),
        "frame_count": count,
        "first": first,
        "duration": round(count / fps, 1),
    }


def scene_entities(animation: dict, room_devices: list[str]) -> dict:
    """scenes.yaml ``entities`` block for a dynamic scene: the starting state.

    Fade out: the chosen lights on at the start colour/brightness; every other
    member of the room off (the animation ends in darkness).
    """
    anim = normalize_animation(animation)
    if anim["mode"] == MODE_PIXEL:
        return _pixel_scene_entities(anim, room_devices)
    chosen = {light["entity_id"] for light in anim["lights"]}
    entities: dict = {}
    for entity_id in room_devices:
        if entity_id not in chosen:
            entities[entity_id] = {"state": "off"}
    for light in anim["lights"]:
        level = 1 if anim["mode"] == MODE_FADE_IN else round(light["brightness"] * 255 / 100)
        start = {"state": "on", "brightness": level}
        if light.get("kelvin"):
            start["color_temp_kelvin"] = light["kelvin"]
        else:
            start["rgb_color"] = list(light["color"])
        entities[light["entity_id"]] = start
    return entities


def _pixel_scene_entities(anim: dict, room_devices: list[str]) -> dict:
    """Pixel: the mapped lights at the video's first sample, the rest off."""
    entities: dict = {e: {"state": "off"} for e in room_devices if e not in anim["zones"]}
    for entity_id in anim["zones"]:
        r, g, b, bri = anim["first"].get(entity_id, [0, 0, 0, 0])
        if bri < PIXEL_OFF_BELOW:
            entities[entity_id] = {"state": "off"}
        else:
            entities[entity_id] = {"state": "on", "brightness": bri, "rgb_color": [r, g, b]}
    return entities


class Fade:
    """One running fade (out: to off; in: up to each light's brightness).
    Cancelled on another scene, room off, or (per
    light) when someone else changes the light meanwhile."""

    def __init__(self, controller: RoomController, key: str, animation: dict) -> None:
        self._controller = controller
        self.hass = controller.hass
        self.key = key
        anim = normalize_animation(animation)
        self.mode = anim["mode"]
        self._rising = anim["mode"] == MODE_FADE_IN
        # entity_id -> starting (out) / target (in) brightness (0-255).
        self._start: dict[str, float] = {
            light["entity_id"]: light["brightness"] * 255 / 100 for light in anim["lights"]
        }
        self._lights: list[str] = list(self._start)
        self._duration = float(anim["duration"])
        self._step = max(MIN_STEP_S, min(MAX_STEP_S, self._duration / 100))
        self._t0 = 0.0
        self._timer = None
        self._unsub_lights = None
        self._released: set[str] = set()
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
            "[%s] %s '%s': %d light(s) over %ss (step %ss)",
            self._controller.room_id, self.mode, self.key, len(self._lights),
            self._duration, self._step,
        )
        self._tick()

    @callback
    def _on_light_changed(self, event: Event) -> None:
        """Someone else touched a fading light: leave it alone from now on.

        A light gone unavailable (e.g. Zigbee2MQTT restarting) is released
        whatever the context: HA stamps state writes with the context of the
        last service call for a few seconds, so it would otherwise pass for one
        of our own changes — and the animation would resume on its own when the
        light comes back.
        """
        new = event.data.get("new_state")
        gone = new is None or new.state in ("unavailable", "unknown")
        if not gone and self._controller.is_self_context(event.context):
            return
        entity_id = event.data.get("entity_id")
        if entity_id in self._lights:
            self._lights.remove(entity_id)
            self._released.add(entity_id)
            _LOGGER.debug(
                "[%s] %s '%s': %s changed externally, released",
                self._controller.room_id, self.mode, self.key, entity_id,
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
        transition = {"transition": max(0, round(remaining))} if remaining > 1 else {}
        if remaining <= self._step:
            # Last step: the rest of the way (to off, or to full level).
            if self._rising:
                self._set_levels(1.0, transition)
            else:
                self._call("turn_off", transition)
            self._finish()
            return
        done = (elapsed + self._step) / self._duration
        self._set_levels(done if self._rising else 1 - done, {"transition": self._step})
        self._timer = async_call_later(self.hass, self._step, self._tick)

    def _set_levels(self, ratio: float, extra: dict) -> None:
        """Every light to ``ratio`` of its own level (at least 1)."""
        # Lights sharing a target level go in one call.
        by_level: dict[int, list[str]] = {}
        for entity_id in self._lights:
            level = max(1, round(self._start[entity_id] * ratio))
            by_level.setdefault(level, []).append(entity_id)
        for level, ids in by_level.items():
            self._call("turn_on", {"brightness": level, **extra}, ids)

    def _call(self, service: str, data: dict, ids: list[str] | None = None) -> None:
        self.hass.async_create_task(
            self.hass.services.async_call(
                "light",
                service,
                {"entity_id": list(ids if ids is not None else self._lights), **data},
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
        _LOGGER.debug("[%s] %s '%s' cancelled", self._controller.room_id, self.mode, self.key)
        self._controller.on_animation_ended(self)

    def _teardown(self) -> None:
        if self._timer is not None:
            self._timer()
            self._timer = None
        if self._unsub_lights is not None:
            self._unsub_lights()
            self._unsub_lights = None


COLOR_MODES = {"hs", "xy", "rgb", "rgbw", "rgbww", "color_temp"}


class PixelPlayer(Fade):
    """Plays a video's sampled frames on the mapped lights (see module doc).

    Reuses the fade's life cycle (start delay, per-light release when someone
    else changes a light, cancel); frames are read from disk on start.
    """

    def __init__(self, controller: RoomController, key: str, animation: dict) -> None:
        super().__init__(controller, key, {**animation, "lights": []})
        anim = normalize_animation(animation)
        self.mode = MODE_PIXEL
        self.loop = anim["loop"]
        # Seconds each sample stays on the lights (the scene's frame time).
        self._interval = round(1 / anim["fps"], 3)
        self._frames_id = anim["frames_id"]
        self._end: list[dict] = anim["lights"]
        self._frames: dict[str, list[list[int]]] = {}
        self._lights = list(anim["zones"])
        self._count = 0
        self._k = 0
        self._sent: dict[str, tuple] = {}  # last command per light
        self._sent_at: dict[str, float] = {}  # when (monotonic)
        self._skipped = 0  # commands dropped for lack of budget
        self._color: set[str] = set()

    @property
    def ends_at(self) -> float | None:
        if self.loop != LOOP_ONCE or not self._count:
            return None
        return time.time() + max(0.0, self._count * self._interval - (time.monotonic() - self._t0))

    def start(self) -> None:
        if not self._lights or not self._frames_id:
            return
        self.running = True
        self._t0 = time.monotonic() + START_DELAY_S
        self.hass.async_create_task(self._async_load())

    async def _async_load(self) -> None:
        from .pixel_media import load_frames  # lazy: keeps this module light

        frames = await self.hass.async_add_executor_job(load_frames, self.hass, self._frames_id)
        if not self.running:
            return
        self._frames = {e: f for e, f in frames.items() if e in self._lights}
        self._lights = [e for e in self._lights if e in self._frames]
        self._count = min((len(f) for f in self._frames.values()), default=0)
        if not self._lights or not self._count:
            _LOGGER.warning(
                "[%s] pixel '%s': no frames to play", self._controller.room_id, self.key
            )
            self.cancel()
            return
        for entity_id in self._lights:
            state = self.hass.states.get(entity_id)
            modes = set((state.attributes.get("supported_color_modes") or []) if state else [])
            if modes & COLOR_MODES:
                self._color.add(entity_id)
        self._timer = async_call_later(
            self.hass, max(0.0, self._t0 - time.monotonic()), self._begin
        )

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
            "[%s] pixel '%s': %d light(s), %d frame(s), one every %ss, loop=%s",
            self._controller.room_id, self.key, len(self._lights),
            self._count, self._interval, self.loop,
        )
        # The end time is known now (frames loaded): publish it.
        self._controller._write_switch_state()
        self._tick()

    def _index(self) -> int | None:
        """Frame to show at step k (None: a `once` animation is over)."""
        n, k = self._count, self._k
        if self.loop == LOOP_ONCE:
            return k if k < n else None
        if self.loop == LOOP_REVERSE and n > 1:
            period = 2 * n - 2
            j = k % period
            return j if j < n else period - j
        return k % n

    @callback
    def _tick(self, _now=None) -> None:
        self._timer = None
        if not self.running or not self._lights:
            self.cancel()
            return
        index = self._index()
        if index is None:
            self._apply_end()
            self._finish()
            return
        self._send_frame(index)
        self._k += 1
        # Scheduled against the start time, so the timing doesn't drift.
        delay = self._t0 + self._k * self._interval - time.monotonic()
        self._timer = async_call_later(self.hass, max(0.05, delay), self._tick)

    def _send_frame(self, index: int) -> None:
        """Bring the lights towards this frame, within the command budget.

        Lights whose target changed visibly and whose last command is at least
        LIGHT_MIN_GAP_S old are candidates; the longest-waiting go first, as
        long as the shared budget allows. The others simply skip this frame.
        Each command's transition spans the gap until the light's next one, so
        the light glides instead of stepping.
        """
        now = time.monotonic()
        budget = command_budget(self.hass)
        gap = max(LIGHT_MIN_GAP_S, self._interval)
        candidates = []
        for entity_id in self._lights:
            r, g, b, bri = self._frames[entity_id][index]
            sample = (r, g, b, bri) if bri >= PIXEL_OFF_BELOW else ("off",)
            if not _worth_sending(self._sent.get(entity_id), sample):
                continue
            last = self._sent_at.get(entity_id, 0.0)
            if now - last < LIGHT_MIN_GAP_S:
                continue
            candidates.append((last, entity_id, sample))
        candidates.sort()
        for _last, entity_id, sample in candidates:
            if not budget.take():
                self._skipped += 1
                continue
            self._sent[entity_id] = sample
            self._sent_at[entity_id] = now
            if len(sample) == 1:
                self._call("turn_off", {"transition": min(gap, 1.0)}, [entity_id])
                continue
            r, g, b, bri = sample
            data = {"brightness": bri, "transition": gap}
            if entity_id in self._color:
                data["rgb_color"] = [r, g, b]
            self._call("turn_on", data, [entity_id])

    def _apply_end(self) -> None:
        """`once` is over: the end state (chosen lights on, the rest off)."""
        transition = {"transition": self._interval}
        ending = {light["entity_id"]: light for light in self._end}
        for entity_id in self._lights:
            if entity_id not in ending:
                self._call("turn_off", transition, [entity_id])
        for entity_id, light in ending.items():
            if entity_id in self._released:
                continue
            data = {"brightness": round(light["brightness"] * 255 / 100), **transition}
            if light.get("kelvin"):
                data["color_temp_kelvin"] = light["kelvin"]
            else:
                data["rgb_color"] = list(light["color"])
            self._call("turn_on", data, [entity_id])


def build_animation(controller: RoomController, key: str, animation: dict):
    """The runner for an animation config (fade out / fade in / pixel)."""
    anim = normalize_animation(animation)
    if anim["mode"] == MODE_PIXEL:
        return PixelPlayer(controller, key, anim)
    if anim["mode"] in MODES:
        return Fade(controller, key, anim)
    return None
