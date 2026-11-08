"""Value generators for physical quantities (preset controls).

A `preset` control is a button group. Each option is either a constant
(`"value": 220`) or a fluctuating range (`"range": [150, 180]`), which wanders
inside the range as a bounded random walk, updated every `every` ms
(default 2000) and rounded to `step` (default 1). Each new value fires the
control's `change` event with `value` and `option` variables.

    {"id": "load", "type": "preset", "label": "Load", "default": "none",
     "options": [{"id": "none", "label": "None", "value": 0},
                 {"id": "mid", "label": "Mid", "range": [150, 180], "every": 2000},
                 {"id": "high", "label": "High", "range": [2000, 2200]}],
     "on": {"change": [{"setInput": {"load_w": "{{ value }}"}}]}}
"""

from __future__ import annotations

import asyncio
import random
from typing import Any, Callable


def option(ctrl: dict[str, Any], option_id: str) -> dict[str, Any]:
    for opt in ctrl.get("options", []):
        if opt["id"] == option_id:
            return opt
    raise ValueError(f"control {ctrl['id']!r} has no option {option_id!r}")


def describe_option(opt: dict[str, Any], unit: str = "") -> str:
    if "range" in opt:
        lo, hi = opt["range"]
        return f"{lo}–{hi}{unit} (fluctuating)"
    return f"{opt.get('value')}{unit}"


class Generator:
    """Drives one preset control: constant once, or a random walk on a timer."""

    def __init__(self, ctrl: dict[str, Any], emit: Callable[[Any], None], seed: int) -> None:
        self.ctrl = ctrl
        self._emit = emit
        self._task: asyncio.Task | None = None
        self._rng = random.Random(seed)
        self.value: Any = None

    def select(self, opt: dict[str, Any]) -> None:
        self.stop()
        if "range" not in opt:
            self.value = opt.get("value")
            self._emit(self.value)
            return
        lo, hi = (float(x) for x in opt["range"])
        step = float(opt.get("step", self.ctrl.get("step", 1)))
        every = float(opt.get("every", self.ctrl.get("every", 2000))) / 1000
        current = [self._rng.uniform(lo + (hi - lo) * 0.3, hi - (hi - lo) * 0.3)]

        def quantize(v: float) -> float | int:
            q = round(round(v / step) * step, 6)
            return int(q) if step >= 1 and float(q).is_integer() else q

        self.value = quantize(current[0])
        self._emit(self.value)
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            return

        async def walk() -> None:
            while True:
                await asyncio.sleep(every)
                span = hi - lo
                current[0] = min(hi, max(lo, current[0] + self._rng.uniform(-0.2, 0.2) * span))
                value = quantize(current[0])
                if value != self.value:
                    self.value = value
                    self._emit(value)

        self._task = loop.create_task(walk())

    def stop(self) -> None:
        if self._task is not None:
            self._task.cancel()
            self._task = None
