"""Auto-mode routines: scripted sequences of gestures on a device's controls.

A routine is an ordered list of steps, optionally looped:

    {"id": "r1", "name": "Demo", "enabled": true, "loop": true, "steps": [
        {"kind": "gesture", "control": "button_1", "gesture": "tap",
         "repeat": {"every": 5000, "for": 15000}},
        {"kind": "gesture", "control": "dial", "gesture": "rotate",
         "params": {"direction": "+", "step": 2}, "repeat": {"every": 250, "for": 10000}},
        {"kind": "wait", "ms": 1000}
    ]}

Which gestures (and parameters) exist is derived from the profile's controls,
see `capabilities()`. The same structure drives validation, the editor UI and
the human-readable descriptions.
"""

from __future__ import annotations

import asyncio
import copy
import logging
import uuid
from typing import TYPE_CHECKING, Any, Callable

if TYPE_CHECKING:
    from .device import SimDevice

_LOGGER = logging.getLogger(__name__)

TAP_PRESS_MS = 120
DOUBLE_TAP_GAP_MS = 200
MAX_STEPS = 200
MIN_EVERY_MS = 50


# ---------------------------------------------------------------- capabilities
def capabilities(controls: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Describe, for each control, the gestures a routine may perform."""
    caps = []
    for c in controls:
        label = c.get("label", c["id"])
        if c["type"] == "button":
            hold_min = int(c.get("holdDelay", 800)) + 50
            gestures = {
                "tap": {"label": "Tap", "params": {}},
                "double_tap": {"label": "Double tap", "params": {}},
                "hold": {
                    "label": "Hold",
                    "params": {"holdMs": {"type": "int", "label": "Hold for", "unit": "ms", "min": hold_min, "max": 60000, "default": 2000}},
                },
            }
            name = f"Button {label}"
            default_every = 1000
        elif c["type"] == "dial":
            default_step = (c.get("presets") or [{"steps": 10}])[0]["steps"]
            gestures = {
                "rotate": {
                    "label": "Rotate",
                    "params": {
                        "direction": {"type": "enum", "label": "Direction", "options": ["+", "-"], "default": "+"},
                        "step": {"type": "int", "label": "Step", "min": 1, "max": 127, "default": default_step},
                    },
                }
            }
            name = label
            default_every = 250
        elif c["type"] == "range":
            lo, hi = c.get("min", 0), c.get("max", 100)
            default = c.get("default", lo)
            gestures = {
                "set": {"label": "Set", "params": {"value": {"type": "int", "label": "Value", "min": lo, "max": hi, "default": default}}},
                "ramp": {
                    "label": "Ramp",
                    "params": {
                        "from": {"type": "int", "label": "From", "min": lo, "max": hi, "default": hi},
                        "to": {"type": "int", "label": "To", "min": lo, "max": hi, "default": lo},
                    },
                    "needsRepeat": True,
                },
            }
            name = label
            default_every = 1000
        elif c["type"] == "preset":
            opts = [o["id"] for o in c.get("options", [])]
            gestures = {
                "select": {
                    "label": "Select",
                    "params": {
                        "option": {
                            "type": "enum",
                            "label": "Value",
                            "options": opts,
                            "labels": {o["id"]: o.get("label", o["id"]) for o in c["options"]},
                            "default": c.get("default", opts[0]),
                        }
                    },
                }
            }
            name = label
            default_every = 1000
        elif c["type"] == "toggle":
            labels = c.get("stateLabels", {})
            gestures = {s: {"label": labels.get(s, s), "params": {}} for s in c["states"]}
            name = label
            default_every = 1000
        elif c["type"] == "stepper":
            gestures = {"down": {"label": "Down", "params": {}}, "up": {"label": "Up", "params": {}}}
            name = label
            default_every = 500
        elif c["type"] == "action":
            gestures = {ev: {"label": ev, "params": {}} for ev in c.get("on", {})}
            name = label
            default_every = 1000
        else:
            continue
        caps.append({"control": c["id"], "label": name, "type": c["type"], "gestures": gestures, "defaultEvery": default_every})
    return caps


# ------------------------------------------------------------------ validation
class RoutineError(ValueError):
    pass


def _int(v: Any, what: str, lo: int | None = None, hi: int | None = None) -> int:
    try:
        n = int(v)
    except (TypeError, ValueError):
        raise RoutineError(f"{what} must be a number") from None
    if lo is not None and n < lo:
        raise RoutineError(f"{what} must be ≥ {lo}")
    if hi is not None and n > hi:
        raise RoutineError(f"{what} must be ≤ {hi}")
    return n


def normalize(routine: dict[str, Any], caps: list[dict[str, Any]]) -> dict[str, Any]:
    """Validate a routine against the device capabilities, fill defaults."""
    by_control = {c["control"]: c for c in caps}
    name = str(routine.get("name") or "Untitled routine").strip()[:80]
    steps_in = routine.get("steps") or []
    if not isinstance(steps_in, list) or not steps_in:
        raise RoutineError("a routine needs at least one step")
    if len(steps_in) > MAX_STEPS:
        raise RoutineError(f"a routine can have at most {MAX_STEPS} steps")
    steps = []
    for i, s in enumerate(steps_in, 1):
        where = f"step {i}"
        kind = s.get("kind", "gesture")
        if kind == "wait":
            steps.append({"kind": "wait", "ms": _int(s.get("ms"), f"{where}: wait", 0, 24 * 3600 * 1000)})
            continue
        if kind != "gesture":
            raise RoutineError(f"{where}: unknown kind {kind!r}")
        cap = by_control.get(s.get("control"))
        if cap is None:
            raise RoutineError(f"{where}: this device has no control {s.get('control')!r}")
        g = cap["gestures"].get(s.get("gesture"))
        if g is None:
            raise RoutineError(f"{where}: {cap['label']} cannot {s.get('gesture')!r}")
        params = {}
        for pname, spec in g["params"].items():
            raw = (s.get("params") or {}).get(pname, spec["default"])
            if spec["type"] == "enum":
                if raw not in spec["options"]:
                    raise RoutineError(f"{where}: {spec['label']} must be one of {spec['options']}")
                params[pname] = raw
            else:
                params[pname] = _int(raw, f"{where}: {spec['label']}", spec.get("min"), spec.get("max"))
        step: dict[str, Any] = {"kind": "gesture", "control": cap["control"], "gesture": s["gesture"], "params": params}
        rep = s.get("repeat")
        if rep:
            every = _int(rep.get("every"), f"{where}: interval", MIN_EVERY_MS, 3600 * 1000)
            r: dict[str, Any] = {"every": every}
            if rep.get("times") not in (None, ""):
                r["times"] = _int(rep["times"], f"{where}: repetitions", 1, 100000)
            elif rep.get("for") not in (None, ""):
                r["for"] = _int(rep["for"], f"{where}: duration", every, 24 * 3600 * 1000)
            else:
                raise RoutineError(f"{where}: a repeat needs a duration or a number of times")
            step["repeat"] = r
        elif g.get("needsRepeat"):
            raise RoutineError(f"{where}: {g['label']} needs a repeat (how long the ramp takes)")
        steps.append(step)
    return {
        "id": str(routine.get("id") or uuid.uuid4().hex[:8]),
        "name": name,
        "enabled": bool(routine.get("enabled", True)),
        "loop": bool(routine.get("loop", True)),
        "steps": steps,
    }


# ----------------------------------------------------------------- description
def _dur(ms: int) -> str:
    if ms % 60000 == 0 and ms >= 60000:
        return f"{ms // 60000} min"
    if ms % 1000 == 0:
        return f"{ms // 1000} s"
    if ms >= 1000:
        return f"{ms / 1000:g} s"
    return f"{ms} ms"


def describe_step(step: dict[str, Any], caps: list[dict[str, Any]]) -> str:
    if step["kind"] == "wait":
        return f"wait {_dur(step['ms'])}"
    cap = next(c for c in caps if c["control"] == step["control"])
    g, p = step["gesture"], step["params"]
    if g == "tap":
        text = f"tap {cap['label']}"
    elif g == "double_tap":
        text = f"double-tap {cap['label']}"
    elif g == "hold":
        text = f"hold {cap['label']} for {_dur(p['holdMs'])}"
    elif g == "rotate":
        text = f"turn {cap['label']} {p['direction']}{p['step']}"
    elif g == "select":
        labels = cap["gestures"]["select"]["params"]["option"].get("labels", {})
        text = f"set {cap['label']} to {labels.get(p['option'], p['option'])}"
    elif g == "set":
        text = f"set {cap['label']} to {p['value']}"
    elif g == "ramp":
        text = f"ramp {cap['label']} from {p['from']} to {p['to']}"
    elif cap["type"] == "toggle":
        text = f"turn {cap['label']} {cap['gestures'][g]['label'].lower()}"
    elif cap["type"] == "stepper":
        text = f"turn {cap['label']} {g}"
    else:
        text = f"{cap['label']}: {g}"
    rep = step.get("repeat")
    if rep:
        if g == "ramp":
            span = rep.get("for") or rep["every"] * rep.get("times", 1)
            text += f" over {_dur(span)} (every {_dur(rep['every'])})"
        elif "times" in rep:
            text += f" {rep['times']}× every {_dur(rep['every'])}"
        else:
            text += f" every {_dur(rep['every'])} for {_dur(rep['for'])}"
    return text


def describe(routine: dict[str, Any], caps: list[dict[str, Any]]) -> str:
    parts = [describe_step(s, caps) for s in routine["steps"]]
    text = ", then ".join(parts)
    text = text[0].upper() + text[1:]
    return text + (". Repeat forever." if routine["loop"] else ". Run once.")


# ---------------------------------------------------------------------- runner
class RoutineRunner:
    """Runs the enabled routines of one device while it is in auto mode."""

    def __init__(self, device: SimDevice, on_status: Callable[[], None]) -> None:
        self.device = device
        self._on_status = on_status
        self._tasks: dict[str, asyncio.Task] = {}
        self.status: dict[str, dict[str, Any]] = {}

    @property
    def running(self) -> bool:
        return bool(self._tasks)

    def sync(self) -> None:
        """Start/stop tasks so that exactly the enabled routines run (in auto mode)."""
        wanted = {r["id"]: r for r in self.device.routines if r["enabled"]} if self.device.mode == "auto" else {}
        for rid in list(self._tasks):
            if rid not in wanted:
                self._tasks.pop(rid).cancel()
                self.status.pop(rid, None)
        for rid, routine in wanted.items():
            task = self._tasks.get(rid)
            if task is None or task.done() or getattr(task, "routine", None) != routine:
                if task:
                    task.cancel()
                t = asyncio.get_running_loop().create_task(self._run(copy.deepcopy(routine)))
                t.routine = copy.deepcopy(routine)  # type: ignore[attr-defined]
                self._tasks[rid] = t
        self._on_status()

    def stop(self) -> None:
        for t in self._tasks.values():
            t.cancel()
        self._tasks.clear()
        self.status.clear()

    def _set(self, rid: str, **kw: Any) -> None:
        self.status.setdefault(rid, {}).update(kw)
        self._on_status()

    async def _wait_joined(self, rid: str) -> None:
        if self.device.joined:
            return
        self._set(rid, state="waiting", detail="waiting for the device to join")
        while not self.device.joined:
            await asyncio.sleep(0.5)

    async def _run(self, routine: dict[str, Any]) -> None:
        rid = routine["id"]
        loop_n = 0
        try:
            while True:
                loop_n += 1
                for idx, step in enumerate(routine["steps"]):
                    await self._wait_joined(rid)
                    self._set(rid, state="running", step=idx, loop=loop_n, detail=None)
                    await self._run_step(step)
                if not routine["loop"]:
                    break
            self._set(rid, state="finished", step=None)
        except asyncio.CancelledError:
            self.device.release_all()
            raise
        except Exception as exc:  # noqa: BLE001
            _LOGGER.exception("routine %s failed", rid)
            self._set(rid, state="error", detail=str(exc))

    async def _run_step(self, step: dict[str, Any]) -> None:
        if step["kind"] == "wait":
            await asyncio.sleep(step["ms"] / 1000)
            return
        rep = step.get("repeat")
        if not rep:
            await self._gesture(step, 0, 1)
            return
        every = rep["every"] / 1000
        times = rep.get("times") or max(1, rep["for"] // rep["every"])
        loop = asyncio.get_running_loop()
        start = loop.time()
        for i in range(times):
            await self._wait_joined_quiet()
            await self._gesture(step, i, times)
            # keep a steady cadence regardless of how long the gesture took
            delay = start + (i + 1) * every - loop.time()
            if delay > 0:
                await asyncio.sleep(delay)

    async def _wait_joined_quiet(self) -> None:
        while not self.device.joined:
            await asyncio.sleep(0.5)

    async def _gesture(self, step: dict[str, Any], i: int, n: int) -> None:
        try:
            await self._do_gesture(step, i, n)
        except RuntimeError as exc:  # e.g. device left mid-gesture: skip, keep the routine alive
            _LOGGER.debug("routine gesture skipped: %s", exc)

    async def _do_gesture(self, step: dict[str, Any], i: int, n: int) -> None:
        dev, ctrl, g, p = self.device, step["control"], step["gesture"], step["params"]
        if g in ("tap", "double_tap"):
            for k in range(2 if g == "double_tap" else 1):
                if k:
                    await asyncio.sleep(DOUBLE_TAP_GAP_MS / 1000)
                await dev.control(ctrl, "down", source="routine")
                await asyncio.sleep(TAP_PRESS_MS / 1000)
                await dev.control(ctrl, "up", source="routine")
        elif g == "hold":
            await dev.control(ctrl, "down", source="routine")
            try:
                await asyncio.sleep(p["holdMs"] / 1000)
            finally:
                await dev.control(ctrl, "up", source="routine")
        elif g == "rotate":
            steps = p["step"] if p["direction"] == "+" else -p["step"]
            await dev.control(ctrl, "rotate", source="routine", steps=steps)
        elif g == "select":
            await dev.control(ctrl, "select", source="routine", option=p["option"])
        elif g == "set":
            await dev.control(ctrl, "set", source="routine", value=p["value"])
        elif g == "ramp":
            value = p["from"] + round((p["to"] - p["from"]) * (i / max(1, n - 1)))
            await dev.control(ctrl, "set", source="routine", value=value)
        else:  # action control event
            await dev.control(ctrl, g, source="routine")
