"""ZCL attribute reporting (ZCL spec 2.5.7 / 2.5.11), device side.

The host configures reporting per attribute (Configure Reporting): a minimum
interval, a maximum interval and, for analog types, a reportable change.

- An attribute is reported when it changes (discrete types) or changes by at
  least the reportable change since the last report (analog types), but never
  more often than the minimum interval: a change inside the window is held
  back and reported when the window closes.
- It is also reported every maximum interval, changed or not (0 = no periodic
  report). A maximum interval of 0xFFFF disables reporting for the attribute.

Reporting configuration is non-volatile (survives power cycles).
"""

from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

from . import zcl

if TYPE_CHECKING:
    from .device import SimDevice

_LOGGER = logging.getLogger(__name__)

ANALOG = {
    "uint8", "uint16", "uint24", "uint32", "uint48",
    "int8", "int16", "int24", "int32", "single",
}  # fmt: skip
STATUS_UNREPORTABLE_ATTRIBUTE = 0x8C
STATUS_INVALID_DATA_TYPE = 0x8D
STATUS_UNSUPPORTED_ATTRIBUTE = 0x86
DISABLE = 0xFFFF

Key = tuple[int, int, int]  # endpoint, cluster, attribute


@dataclass
class ReportConfig:
    min_s: int
    max_s: int
    change: Any  # reportable change (analog only)
    last_value: Any = None
    last_time: float = 0.0
    pending: asyncio.TimerHandle | None = field(default=None, repr=False)
    periodic: asyncio.TimerHandle | None = field(default=None, repr=False)


class ReportingEngine:
    def __init__(self, device: SimDevice) -> None:
        self.device = device
        self.configs: dict[Key, ReportConfig] = {}

    # ----------------------------------------------------------- configure
    def configure(self, ep: int, cid: int, aid: int, type_id: int, min_s: int, max_s: int, change: Any) -> int:
        attr = self.device.get_attr(ep, cid, aid)
        if attr is None:
            return STATUS_UNSUPPORTED_ATTRIBUTE
        if zcl.DATA_TYPES[attr.type][0] != type_id:
            return STATUS_INVALID_DATA_TYPE
        key = (ep, cid, aid)
        self._cancel(key)
        if max_s == DISABLE:
            self.configs.pop(key, None)
            return zcl.STATUS_SUCCESS
        cfg = ReportConfig(min_s, max_s, change if attr.type in ANALOG else None, attr.value, time.monotonic())
        self.configs[key] = cfg
        self._schedule_periodic(key)
        return zcl.STATUS_SUCCESS

    def read_config(self, ep: int, cid: int, aid: int) -> ReportConfig | None:
        return self.configs.get((ep, cid, aid))

    # -------------------------------------------------------------- events
    def on_change(self, ep: int, cid: int, aid: int) -> None:
        key = (ep, cid, aid)
        cfg = self.configs.get(key)
        if cfg is None or cfg.pending is not None:
            return
        attr = self.device.get_attr(ep, cid, aid)
        if attr is None or not self._significant(attr.type, cfg, attr.value):
            return
        wait = cfg.min_s - (time.monotonic() - cfg.last_time)
        loop = _loop()
        if loop is None:
            return
        if wait <= 0:
            self._report(key)
        else:
            cfg.pending = loop.call_later(wait, self._report_pending, key)

    def _significant(self, atype: str, cfg: ReportConfig, value: Any) -> bool:
        if cfg.last_value is None:
            return True
        if atype in ANALOG:
            change = cfg.change or 0
            try:
                return abs(value - cfg.last_value) >= max(change, 1e-9) if change else value != cfg.last_value
            except TypeError:
                return value != cfg.last_value
        return value != cfg.last_value

    def _report_pending(self, key: Key) -> None:
        cfg = self.configs.get(key)
        if cfg is None:
            return
        cfg.pending = None
        attr = self.device.get_attr(*key)
        # re-check: the value may have gone back within the window
        if attr is not None and self._significant(attr.type, cfg, attr.value):
            self._report(key)

    def _report(self, key: Key) -> None:
        cfg = self.configs.get(key)
        if cfg is None:
            return
        ep, cid, aid = key
        if self.device.can_transmit:
            attr = self.device.get_attr(ep, cid, aid)
            if attr is not None:
                self.device.send_report(ep, cid, [attr])
                cfg.last_value = attr.value
        cfg.last_time = time.monotonic()
        self._schedule_periodic(key)

    def _schedule_periodic(self, key: Key) -> None:
        cfg = self.configs.get(key)
        if cfg is None:
            return
        if cfg.periodic is not None:
            cfg.periodic.cancel()
            cfg.periodic = None
        loop = _loop()
        if cfg.max_s and loop is not None:
            cfg.periodic = loop.call_later(cfg.max_s, self._report, key)

    def _cancel(self, key: Key) -> None:
        cfg = self.configs.get(key)
        if cfg is None:
            return
        for h in (cfg.pending, cfg.periodic):
            if h is not None:
                h.cancel()
        cfg.pending = cfg.periodic = None

    def stop(self) -> None:
        for key in list(self.configs):
            self._cancel(key)

    def resume(self) -> None:
        """(Re)start periodic reports, e.g. after power-up or a restart."""
        for key in self.configs:
            self._schedule_periodic(key)

    def clear(self) -> None:
        self.stop()
        self.configs.clear()

    # ---------------------------------------------------------- persistence
    def persist(self) -> list[dict[str, Any]]:
        return [
            {"ep": k[0], "cluster": k[1], "attr": k[2], "min": c.min_s, "max": c.max_s, "change": c.change}
            for k, c in self.configs.items()
        ]

    def restore(self, data: list[dict[str, Any]]) -> None:
        for r in data:
            self.configs[(r["ep"], r["cluster"], r["attr"])] = ReportConfig(r["min"], r["max"], r["change"])


def _loop() -> asyncio.AbstractEventLoop | None:
    try:
        return asyncio.get_running_loop()
    except RuntimeError:
        return None
