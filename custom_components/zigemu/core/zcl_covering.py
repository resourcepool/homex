"""Window Covering (0x0102) server, per the ZCL specification, with a motor model.

The cover moves at a constant speed (full travel in `travelSeconds`) towards
its target; currentPositionLiftPercentage follows the motor and is reported per
the host's reporting configuration, plus a final report when the motor stops
(real roller-shutter modules do the same).

Options (serverOptions.closuresWindowCovering):
- travelSeconds (default 20): full travel time.
- invert (default False): the attribute holds the *open* percentage (100 = open)
  instead of the ZCL closed percentage. Tuya TS130F modules do this (Zigbee2MQTT
  `coverInverted`, zhaquirks TuyaCoveringCluster).
- tuya (default False): Tuya attributes 0xF000 moving state (0 up, 1 stop, 2
  down), 0xF001 calibration, 0xF002 motor reversal, 0xF003 calibration time
  (0.1 s, used as the travel time when set), 0x8000 switch type.
- ewelinkMotorStatus (default False): mirror the motor on SONOFF's
  customClusterEwelink motorRunStatus (0x5013: 0 stop, 1 forward/opening,
  2 reverse/closing); the profile declares that attribute.
- openPercent (default 100): initial position.

The device's `inputs` get `cover_open_pct` and `cover_motion` (opening /
closing / stopped) for the dashboard; the physical buttons are local commands
`open`, `close`, `stop`, `toggle` and `set` (position=open %).
"""

from __future__ import annotations

import asyncio
import struct
from typing import Any

from .zcl_servers import UNSUP_CLUSTER_COMMAND, ClusterServer, Result

TICK_S = 0.5


class WindowCoveringServer(ClusterServer):
    cluster = 0x0102
    name = "closuresWindowCovering"
    TYPE, CONFIG_STATUS, LIFT_PCT, OP_STATUS, MODE = 0x0000, 0x0007, 0x0008, 0x000A, 0x0017
    TUYA_MOVING, TUYA_CALIBRATION, TUYA_REVERSAL, MOES_CALIBRATION_TIME, TUYA_SWITCH_TYPE = 0xF000, 0xF001, 0xF002, 0xF003, 0x8000
    EWELINK, EWELINK_MOTOR_RUN = 0xFC11, 0x5013

    def __init__(self, *a: Any) -> None:
        super().__init__(*a)
        self.open_pct = float(self.options.get("openPercent", 100))
        self.target: float | None = None
        self._task: asyncio.Task | None = None
        self._last_dir = "closing"
        self._publish_inputs("stopped")

    # ------------------------------------------------------------ attributes
    def _attr_value(self) -> int:
        pct = round(self.open_pct)
        return pct if self.options.get("invert") else 100 - pct

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        attrs: dict[int, tuple[str, Any, bool]] = {
            self.TYPE: ("enum8", int(self.options.get("coveringType", 0)), False),  # rollershade
            self.CONFIG_STATUS: ("bitmap8", 0x03, False),  # operational, online
            self.LIFT_PCT: ("uint8", self._attr_value(), False),
            self.OP_STATUS: ("bitmap8", 0, False),
            self.MODE: ("bitmap8", 0, True),
        }
        if self.options.get("tuya"):
            attrs.update(
                {
                    self.TUYA_MOVING: ("enum8", 1, True),
                    self.TUYA_CALIBRATION: ("enum8", 1, True),  # 1 = calibration off
                    self.TUYA_REVERSAL: ("enum8", 0, True),
                    self.MOES_CALIBRATION_TIME: ("uint16", round(float(self.options.get("travelSeconds", 20)) * 10), True),
                    self.TUYA_SWITCH_TYPE: ("enum8", 1, True),
                }
            )
        return attrs

    def _travel_s(self) -> float:
        if self.options.get("tuya"):
            tenths = self.get(self.MOES_CALIBRATION_TIME)
            if tenths:
                return max(1.0, tenths / 10)
        return max(1.0, float(self.options.get("travelSeconds", 20)))

    def _publish_inputs(self, motion: str) -> None:
        self.device.inputs["cover_open_pct"] = round(self.open_pct)
        self.device.inputs["cover_motion"] = motion

    # ------------------------------------------------------------- commands
    def handle(self, cmd: int, payload: bytes) -> Result:
        if cmd == 0x00:  # UpOpen
            self.move_to(100)
        elif cmd == 0x01:  # DownClose
            self.move_to(0)
        elif cmd == 0x02:  # Stop
            self.stop_motor()
        elif cmd == 0x05:  # GoToLiftPercentage(percentage u8)
            (pct,) = struct.unpack_from("<B", payload)
            if pct > 100:
                return Result(0x87)  # INVALID_VALUE
            self.move_to(pct if self.options.get("invert") else 100 - pct)
        else:
            return Result(UNSUP_CLUSTER_COMMAND)
        return Result()

    def local(self, command: str, **kw: Any) -> None:
        if command == "open":
            self.move_to(100)
        elif command == "close":
            self.move_to(0)
        elif command == "stop":
            self.stop_motor()
        elif command == "toggle":  # single-button wall switch: stop, or go the other way
            if self._task is not None:
                self.stop_motor()
            else:
                self.move_to(100 if self._last_dir == "closing" else 0)
        elif command == "set":
            self.move_to(float(kw.get("position", 100)))
        else:
            super().local(command, **kw)

    # ---------------------------------------------------------------- motor
    def move_to(self, open_pct: float) -> None:
        open_pct = max(0.0, min(100.0, float(open_pct)))
        if abs(open_pct - self.open_pct) < 0.5:
            self.stop_motor()
            return
        self.target = open_pct
        direction = "opening" if open_pct > self.open_pct else "closing"
        self._last_dir = direction
        if self._task is None:
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:  # no loop (tests): jump there
                self.open_pct = open_pct
                self._finish()
                return
            self._task = loop.create_task(self._run())
        self._motion(direction)

    async def _run(self) -> None:
        try:
            while self.target is not None:
                await asyncio.sleep(TICK_S)
                step = 100.0 / self._travel_s() * TICK_S
                delta = self.target - self.open_pct
                if abs(delta) <= step:
                    self.open_pct = self.target
                    self.set(self.LIFT_PCT, self._attr_value())
                    break
                self.open_pct += step if delta > 0 else -step
                self.set(self.LIFT_PCT, self._attr_value())
                self._publish_inputs("opening" if delta > 0 else "closing")
        except asyncio.CancelledError:
            return
        self._task = None
        self._finish()

    def stop_motor(self) -> None:
        if self._task is not None:
            self._task.cancel()
            self._task = None
        self._finish()

    def _finish(self) -> None:
        self.target = None
        self.set(self.LIFT_PCT, self._attr_value())
        self._motion("stopped")
        self._report(self.cluster, self.LIFT_PCT)  # final position, like real modules when the motor stops

    def _motion(self, motion: str) -> None:
        bits = {"opening": 0b0101, "closing": 0b1010, "stopped": 0}[motion]
        self.set(self.OP_STATUS, bits)
        self._publish_inputs(motion)
        if self.options.get("tuya"):
            moving = {"opening": 0, "stopped": 1, "closing": 2}[motion]
            changed = self.get(self.TUYA_MOVING) != moving
            self.set(self.TUYA_MOVING, moving)
            if changed:
                self._report(self.cluster, self.TUYA_MOVING)
        if self.options.get("ewelinkMotorStatus"):
            run = {"opening": 1, "closing": 2, "stopped": 0}[motion]
            attr = self.device.get_attr(self.ep, self.EWELINK, self.EWELINK_MOTOR_RUN)
            if attr is not None and attr.value != run:
                self.device.set_attr(self.ep, self.EWELINK, self.EWELINK_MOTOR_RUN, run)
                self._report(self.EWELINK, self.EWELINK_MOTOR_RUN)
        self.device.state_changed()

    def _report(self, cid: int, aid: int) -> None:
        attr = self.device.get_attr(self.ep, cid, aid)
        if attr is not None and self.device.can_transmit:
            self.device.send_report(self.ep, cid, [attr])

    def power_down(self) -> None:
        if self._task is not None:
            self._task.cancel()
            self._task = None
        self.target = None
        self._publish_inputs("stopped")

    def persist(self) -> dict[str, Any]:
        return {"openPercent": round(self.open_pct, 1)}

    def restore(self, data: dict[str, Any]) -> None:
        self.open_pct = float(data.get("openPercent", self.open_pct))
        self._publish_inputs("stopped")
        if self.device.get_attr(self.ep, self.cluster, self.LIFT_PCT) is not None:
            self.set(self.LIFT_PCT, self._attr_value())


COVERING_SERVERS = (WindowCoveringServer,)
