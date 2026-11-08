"""Record manual activity on a device and turn it into a routine draft.

Recorded inputs are converted to routine steps with their real timing:
- button down/up: a `tap` (short) or a `hold` with the measured duration;
- dial turns: `rotate` steps; a run of same-direction turns at a steady pace
  becomes one step repeated `times` at the measured interval;
- preset choices: `select`; range values: `set`; action events: the event;
- the pauses in between: `wait` steps.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Any

MIN_WAIT_MS = 150  # shorter gaps are not worth a step
MERGE_GAP_MS = 1500  # dial turns closer than this belong to the same movement


@dataclass
class Recording:
    started: float = field(default_factory=time.monotonic)
    events: list[tuple[float, str, str, dict[str, Any]]] = field(default_factory=list)

    def add(self, control: str, action: str, params: dict[str, Any]) -> None:
        self.events.append((time.monotonic(), control, action, dict(params)))

    @property
    def elapsed(self) -> float:
        return time.monotonic() - self.started


def build_routine(rec: Recording, controls: list[dict[str, Any]], name: str) -> dict[str, Any]:
    by_id = {c["id"]: c for c in controls}
    gestures: list[tuple[float, float, dict[str, Any]]] = []  # (start s, duration s, step)
    downs: dict[str, float] = {}
    for t, control, action, params in rec.events:
        ctrl = by_id.get(control)
        if ctrl is None:
            continue
        ctype = ctrl["type"]
        if ctype == "button":
            if action == "down":
                downs[control] = t
            elif action == "up" and control in downs:
                t0 = downs.pop(control)
                held_ms = round((t - t0) * 1000)
                if held_ms >= int(ctrl.get("holdDelay", 800)):
                    gestures.append((t0, t - t0, {"control": control, "gesture": "hold", "params": {"holdMs": held_ms}}))
                else:
                    gestures.append((t0, 0.12, {"control": control, "gesture": "tap"}))
            elif action == "click":
                gestures.append((t, 0.12, {"control": control, "gesture": "tap"}))
        elif ctype == "dial" and action == "rotate":
            steps = int(params.get("steps", 0))
            if steps:
                step = {"control": control, "gesture": "rotate", "params": {"direction": "+" if steps > 0 else "-", "step": min(127, abs(steps))}}
                gestures.append((t, 0.0, step))
        elif ctype == "preset" and action == "select":
            gestures.append((t, 0.0, {"control": control, "gesture": "select", "params": {"option": params.get("option")}}))
        elif ctype == "range" and action == "set":
            gestures.append((t, 0.0, {"control": control, "gesture": "set", "params": {"value": params.get("value")}}))
        elif ctype == "toggle" and action in ctrl.get("states", []):
            gestures.append((t, 0.0, {"control": control, "gesture": action}))
        elif ctype == "stepper" and action in ("up", "down"):
            gestures.append((t, 0.0, {"control": control, "gesture": action}))
        elif ctype == "action" and action in ctrl.get("on", {}):
            gestures.append((t, 0.0, {"control": control, "gesture": action}))
    gestures.sort(key=lambda g: g[0])
    gestures = _merge_rotations(gestures)

    steps: list[dict[str, Any]] = []
    cursor = None
    for start, duration, step in gestures:
        if cursor is not None:
            gap_ms = round((start - cursor) * 1000)
            if gap_ms >= MIN_WAIT_MS:
                steps.append({"kind": "wait", "ms": gap_ms})
        steps.append({"kind": "gesture", **step})
        cursor = start + duration
    return {"name": name, "loop": False, "enabled": True, "steps": steps}


def _merge_rotations(gestures: list[tuple[float, float, dict[str, Any]]]) -> list[tuple[float, float, dict[str, Any]]]:
    """Collapse a run of same-direction dial turns into one repeated step."""
    out: list[tuple[float, float, dict[str, Any]]] = []
    i = 0
    while i < len(gestures):
        start, dur, step = gestures[i]
        if step.get("gesture") != "rotate":
            out.append(gestures[i])
            i += 1
            continue
        run = [gestures[i]]
        j = i + 1
        while (
            j < len(gestures)
            and gestures[j][2].get("gesture") == "rotate"
            and gestures[j][2]["control"] == step["control"]
            and gestures[j][2]["params"]["direction"] == step["params"]["direction"]
            and (gestures[j][0] - run[-1][0]) * 1000 <= MERGE_GAP_MS
        ):
            run.append(gestures[j])
            j += 1
        if len(run) == 1:
            out.append(gestures[i])
        else:
            every_ms = max(50, round((run[-1][0] - run[0][0]) * 1000 / (len(run) - 1)))
            mean_step = max(1, round(sum(g[2]["params"]["step"] for g in run) / len(run)))
            merged = {
                "control": step["control"],
                "gesture": "rotate",
                "params": {"direction": step["params"]["direction"], "step": mean_step},
                "repeat": {"every": every_ms, "times": len(run)},
            }
            out.append((start, (run[-1][0] - start) + every_ms / 1000, merged))
        i = j
    return out
