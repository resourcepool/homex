"""Sensor, security and HVAC servers, per the ZCL specification.

- IAS Zone (0x0500): enrollment with the CIE (write iasCieAddr -> Zone Enroll
  Request; Zone Enroll Response from the host, auto-enroll or request-driven),
  zone status changes sent as Zone Status Change Notifications.
- Occupancy (0x0406), Illuminance (0x0400), Temperature (0x0402),
  Relative humidity (0x0405), Flow (0x0404): measured values driven by the
  device's physical `inputs`.
- Poll Control (0x0020): periodic Check-in, Check-in Response / fast poll.
- Thermostat (0x0201): setpoints with limits, system mode, running state,
  setpoint raise/lower, weekly schedule (stored and applied in auto mode), and
  a simple room heat model so temperatures move like a real room.

Server options come from the endpoint's `serverOptions[<cluster name>]`.
"""

from __future__ import annotations

import asyncio
import datetime as dt
import math
import struct
from typing import Any

from .zcl_servers import INVALID_FIELD, NOT_FOUND, UNSUP_CLUSTER_COMMAND, ClusterServer, Result


def _loop() -> asyncio.AbstractEventLoop | None:
    try:
        return asyncio.get_running_loop()
    except RuntimeError:
        return None


class _Ticker:
    def __init__(self) -> None:
        self.task: asyncio.Task | None = None

    def start(self, period: float, fn: Any) -> None:
        self.stop()
        loop = _loop()
        if loop is None:
            return

        async def run() -> None:
            while True:
                await asyncio.sleep(period)
                fn()

        self.task = loop.create_task(run())

    def stop(self) -> None:
        if self.task:
            self.task.cancel()
            self.task = None


# ------------------------------------------------------------------ IAS Zone
class IasZoneServer(ClusterServer):
    """Options: zoneType (e.g. 0x0015 contact switch, 0x000D motion), autoEnrollRequest (default True)."""

    cluster = 0x0500
    name = "ssIasZone"
    ZONE_STATE, ZONE_TYPE, ZONE_STATUS, CIE_ADDR, ZONE_ID = 0x0000, 0x0001, 0x0002, 0x0010, 0x0011
    ALARM1, ALARM2, TAMPER, BATTERY, SUPERVISION, RESTORE, TROUBLE, AC = 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        return {
            self.ZONE_STATE: ("enum8", 0, False),
            self.ZONE_TYPE: ("enum16", int(self.options.get("zoneType", 0x0015)), False),
            self.ZONE_STATUS: ("bitmap16", 0, False),
            self.CIE_ADDR: ("ieee", "0000000000000000", True),
            self.ZONE_ID: ("uint8", 0xFF, False),
        }

    def on_write(self) -> None:
        # CIE address written: ask to enroll (trip-to-pair devices wait for a trigger instead)
        if self.options.get("autoEnrollRequest", True) and self.get(self.ZONE_STATE) == 0:
            self._send_enroll_request()

    def _send_enroll_request(self) -> None:
        mfr = int(self.device.node.get("manufacturerCode", 0))
        payload = struct.pack("<HH", int(self.get(self.ZONE_TYPE) or 0), mfr)
        self.device.send_zcl(self.ep, self.cluster, 0x01, payload, cluster_specific=True, server_to_client=True,
                             disable_default_rsp=False, summary="zoneEnrollRequest")  # fmt: skip

    def handle(self, cmd: int, payload: bytes) -> Result:
        if cmd == 0x00:  # ZoneEnrollResponse(code, zoneId)
            code, zone_id = payload[0], payload[1]
            if code == 0x00:  # success
                self.set(self.ZONE_ID, zone_id)
                self.set(self.ZONE_STATE, 1)
            return Result()
        if cmd in (0x01, 0x02):  # InitiateNormalOperationMode / InitiateTestMode
            return Result()
        return Result(UNSUP_CLUSTER_COMMAND)

    def set_status_bits(self, bits: int, on: bool) -> None:
        old = int(self.get(self.ZONE_STATUS) or 0)
        new = (old | bits) if on else (old & ~bits)
        if new == old:
            return
        self.set(self.ZONE_STATUS, new)
        zone_id = self.get(self.ZONE_ID)
        payload = struct.pack("<HBBH", new, 0, 0xFF if zone_id is None else zone_id, 0)
        self.device.send_zcl(self.ep, self.cluster, 0x00, payload, cluster_specific=True, server_to_client=True,
                             summary=f"zoneStatusChangeNotification 0x{new:04x}")  # fmt: skip

    def local(self, command: str, **kw: Any) -> None:
        bits = {"alarm1": self.ALARM1, "alarm2": self.ALARM2, "tamper": self.TAMPER, "battery_low": self.BATTERY}
        if command in bits:
            self.set_status_bits(bits[command], bool(kw.get("on", True)))
        elif command == "enroll_request":
            self._send_enroll_request()
        else:
            super().local(command)


# ----------------------------------------------------- measurement servers
class _MeasurementServer(ClusterServer):
    """measuredValue driven by an input. Options: input (name), and the min/max measured values."""

    MEASURED, MIN, MAX = 0x0000, 0x0001, 0x0002
    TYPE = "int16"
    DEFAULT_INPUT = ""
    DEFAULT_MIN: int = 0
    DEFAULT_MAX: int = 0xFFFF

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        return {
            self.MEASURED: (self.TYPE, self.convert(self._input()), False),
            self.MIN: (self.TYPE, int(self.options.get("min", self.DEFAULT_MIN)), False),
            self.MAX: (self.TYPE, int(self.options.get("max", self.DEFAULT_MAX)), False),
        }

    def _input(self) -> float:
        return float(self.device.inputs.get(self.options.get("input", self.DEFAULT_INPUT), 0))

    def convert(self, value: float) -> int:
        raise NotImplementedError

    def on_inputs(self) -> None:
        self.set(self.MEASURED, self.convert(self._input()))

    def power_up(self) -> None:
        self.on_inputs()


class TemperatureServer(_MeasurementServer):
    cluster, name, TYPE, DEFAULT_INPUT, DEFAULT_MIN, DEFAULT_MAX = 0x0402, "msTemperatureMeasurement", "int16", "temperature_c", -4000, 12500

    def convert(self, value: float) -> int:
        return round(value * 100)


class HumidityServer(_MeasurementServer):
    cluster, name, TYPE, DEFAULT_INPUT, DEFAULT_MIN, DEFAULT_MAX = 0x0405, "msRelativeHumidity", "uint16", "humidity_pct", 0, 10000

    def convert(self, value: float) -> int:
        return max(0, min(10000, round(value * 100)))


class IlluminanceServer(_MeasurementServer):
    cluster, name, TYPE, DEFAULT_INPUT, DEFAULT_MIN, DEFAULT_MAX = 0x0400, "msIlluminanceMeasurement", "uint16", "illuminance_lux", 1, 0xFFFE

    def convert(self, value: float) -> int:
        return 0 if value <= 0 else max(1, min(0xFFFE, round(10000 * math.log10(value) + 1)))


class FlowServer(_MeasurementServer):
    """Flow in m³/h (input), measuredValue in 0.1 m³/h."""

    cluster, name, TYPE, DEFAULT_INPUT, DEFAULT_MIN, DEFAULT_MAX = 0x0404, "msFlowMeasurement", "uint16", "flow_m3h", 0, 0xFFFE

    def convert(self, value: float) -> int:
        return max(0, min(0xFFFE, round(value * 10)))


class OccupancyServer(ClusterServer):
    """occupancy bit 0 follows the `occupied` input. Options: sensorType (0 PIR, 1 ultrasonic, 2 PIR+US, 3 physical contact)."""

    cluster, name = 0x0406, "msOccupancySensing"
    OCCUPANCY, SENSOR_TYPE, SENSOR_TYPE_BITMAP = 0x0000, 0x0001, 0x0002

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        st = int(self.options.get("sensorType", 0))
        return {
            self.OCCUPANCY: ("bitmap8", 1 if self.device.inputs.get("occupied") else 0, False),
            self.SENSOR_TYPE: ("enum8", st, False),
            self.SENSOR_TYPE_BITMAP: ("bitmap8", {0: 1, 1: 2, 2: 3, 3: 4}.get(st, 1), False),
        }

    def on_inputs(self) -> None:
        self.set(self.OCCUPANCY, 1 if self.device.inputs.get("occupied") else 0)


# --------------------------------------------------------------- PollControl
class PollControlServer(ClusterServer):
    """Sends Check-in every checkinInterval (quarter-seconds) while joined."""

    cluster, name = 0x0020, "genPollCtrl"
    CHECKIN, LONG_POLL, SHORT_POLL, FAST_TIMEOUT = 0x0000, 0x0001, 0x0002, 0x0003

    def __init__(self, *a: Any) -> None:
        super().__init__(*a)
        self._timer: asyncio.TimerHandle | None = None
        self.fast_polling_until = 0.0

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        return {
            self.CHECKIN: ("uint32", int(self.options.get("checkinInterval", 14400)), True),
            self.LONG_POLL: ("uint32", int(self.options.get("longPollInterval", 20)), False),
            self.SHORT_POLL: ("uint16", int(self.options.get("shortPollInterval", 2)), False),
            self.FAST_TIMEOUT: ("uint16", int(self.options.get("fastPollTimeout", 40)), True),
        }

    def start(self) -> None:
        self._schedule()

    def on_write(self) -> None:
        self._schedule()

    def _schedule(self) -> None:
        if self._timer:
            self._timer.cancel()
            self._timer = None
        loop = _loop()
        interval = int(self.get(self.CHECKIN) or 0)
        if loop and interval:
            self._timer = loop.call_later(interval / 4, self._checkin)

    def _checkin(self) -> None:
        self._timer = None
        if self.device.can_transmit:
            self.device.send_zcl(self.ep, self.cluster, 0x00, b"", cluster_specific=True, server_to_client=True,
                                 disable_default_rsp=False, summary="checkin")  # fmt: skip
        self._schedule()

    def handle(self, cmd: int, payload: bytes) -> Result:
        loop = _loop()
        now = loop.time() if loop else 0
        if cmd == 0x00:  # CheckinResponse(startFastPolling, fastPollTimeout)
            start, timeout = struct.unpack_from("<BH", payload)
            if start:
                self.fast_polling_until = now + (timeout or int(self.get(self.FAST_TIMEOUT) or 0)) / 4
            return Result()
        if cmd == 0x01:  # FastPollStop
            self.fast_polling_until = 0
            return Result()
        if cmd == 0x02:  # SetLongPollInterval(u32)
            self.device.set_attr(self.ep, self.cluster, self.LONG_POLL, struct.unpack_from("<I", payload)[0])
            return Result()
        if cmd == 0x03:  # SetShortPollInterval(u16)
            self.device.set_attr(self.ep, self.cluster, self.SHORT_POLL, struct.unpack_from("<H", payload)[0])
            return Result()
        return Result(UNSUP_CLUSTER_COMMAND)

    def power_down(self) -> None:
        if self._timer:
            self._timer.cancel()
            self._timer = None


# ---------------------------------------------------------------- Thermostat
class ThermostatServer(ClusterServer):
    """Heating thermostat (TRV) with a room model.

    Options: minSetpoint / maxSetpoint (0.01 °C), heatRate (°C/min at a fully
    open valve), lossRate (1/min towards ambient), timeScale (simulated
    minutes per real minute), tick (s), hysteresis (°C), roomInput (input name
    holding the room temperature, default "temperature_c"), ambientInput
    ("ambient_c").
    """

    cluster, name = 0x0201, "hvacThermostat"
    LOCAL_TEMP, OCCUPANCY, ABS_MIN, ABS_MAX, PI_HEAT = 0x0000, 0x0002, 0x0003, 0x0004, 0x0008
    CALIBRATION, OCC_HEAT_SP, UNOCC_HEAT_SP, MIN_HEAT_SP, MAX_HEAT_SP = 0x0010, 0x0012, 0x0014, 0x0015, 0x0016
    CONTROL_SEQ, SYSTEM_MODE, RUNNING_MODE, RUNNING_STATE = 0x001B, 0x001C, 0x001E, 0x0029
    START_OF_WEEK, NUM_WEEKLY, NUM_DAILY = 0x0020, 0x0021, 0x0022
    MODE_OFF, MODE_AUTO, MODE_HEAT = 0x00, 0x01, 0x04

    def __init__(self, *a: Any) -> None:
        super().__init__(*a)
        self.ticker = _Ticker()
        self.valve = 0.0  # 0..1
        # weekly schedule: day bit -> [(minutes, heat setpoint)]
        self.schedule: dict[int, list[tuple[int, int]]] = {}

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        lo, hi = int(self.options.get("minSetpoint", 400)), int(self.options.get("maxSetpoint", 3500))
        return {
            self.LOCAL_TEMP: ("int16", self._local_temp(), False),
            self.ABS_MIN: ("int16", lo, False),
            self.ABS_MAX: ("int16", hi, False),
            self.PI_HEAT: ("uint8", 0, False),
            self.CALIBRATION: ("int8", 0, True),
            self.OCC_HEAT_SP: ("int16", int(self.options.get("defaultSetpoint", 2000)), True),
            self.MIN_HEAT_SP: ("int16", lo, True),
            self.MAX_HEAT_SP: ("int16", hi, True),
            self.CONTROL_SEQ: ("enum8", 0x02, True),  # heating only
            self.SYSTEM_MODE: ("enum8", self.MODE_HEAT, True),
            self.RUNNING_MODE: ("enum8", self.MODE_HEAT, False),
            self.RUNNING_STATE: ("bitmap16", 0, False),
            self.START_OF_WEEK: ("enum8", 1, False),  # Monday
            self.NUM_WEEKLY: ("uint8", 10, False),
            self.NUM_DAILY: ("uint8", 6, False),
        }

    # -------------------------------------------------------------- model
    def _room(self) -> float:
        return float(self.device.inputs.get(self.options.get("roomInput", "temperature_c"), 20.0))

    def _opt_attr(self, key: str) -> Any:
        """Value of a device attribute referenced by an option: ["cluster", "attribute"]."""
        ref = self.options.get(key)
        return self.device.attr_value(ref[0], ref[1], self.ep) if ref else None

    def _local_temp(self) -> int:
        # external sensor selected (e.g. Sonoff temperatureSensorSelect = 1): use the host-written value
        if self._opt_attr("externalSensorSelect") and self._opt_attr("externalSensorValue") is not None:
            return int(self._opt_attr("externalSensorValue"))
        cal = self.device.get_attr(self.ep, self.cluster, self.CALIBRATION)
        offset = (cal.value if cal else 0) / 10
        return round((self._room() + offset) * 100)

    def start(self) -> None:
        self.update()
        self.ticker.start(float(self.options.get("tick", 5)), self._tick)

    def power_down(self) -> None:
        self.ticker.stop()

    def on_write(self) -> None:
        self._clamp_setpoint()
        self.update()

    def on_inputs(self) -> None:
        self.update()

    def _clamp_setpoint(self) -> None:
        sp = int(self.get(self.OCC_HEAT_SP) or 0)
        lo, hi = int(self.get(self.MIN_HEAT_SP) or 0), int(self.get(self.MAX_HEAT_SP) or 0x7FFF)
        if not lo <= sp <= hi:
            self.set(self.OCC_HEAT_SP, max(lo, min(hi, sp)))

    def _tick(self) -> None:
        tick = float(self.options.get("tick", 5))
        minutes = tick / 60 * float(self.options.get("timeScale", 1))
        room = self._room()
        ambient = float(self.device.inputs.get(self.options.get("ambientInput", "ambient_c"), 16.0))
        room += float(self.options.get("heatRate", 0.15)) * self.valve * minutes
        room -= float(self.options.get("lossRate", 0.01)) * (room - ambient) * minutes
        self.device.inputs[self.options.get("roomInput", "temperature_c")] = round(room, 3)
        if self.get(self.SYSTEM_MODE) == self.MODE_AUTO:
            self._apply_schedule()
        self.update()

    def update(self) -> None:
        """Recompute local temperature, valve demand and running state."""
        self.set(self.LOCAL_TEMP, self._local_temp())
        mode = self.get(self.SYSTEM_MODE)
        target = None
        if mode in (self.MODE_HEAT, self.MODE_AUTO):
            target = int(self.get(self.OCC_HEAT_SP) or 0)
        elif self._opt_attr("frostProtection") is not None:
            target = int(self._opt_attr("frostProtection"))  # off mode still protects against frost
        if target is not None:
            error = (target - int(self.get(self.LOCAL_TEMP) or 0)) / 100
            hyst = float(self.options.get("hysteresis", 0.3))
            self.valve = max(0.0, min(1.0, error / 1.5)) if error > -hyst / 2 else 0.0
        else:
            self.valve = 0.0
        limit = self._opt_attr("valveOpeningLimit")
        if limit is not None:
            self.valve = min(self.valve, max(0, int(limit)) / 100)
        self.set(self.PI_HEAT, round(self.valve * 100))
        self.set(self.RUNNING_STATE, 0x0001 if self.valve > 0 else 0x0000)
        self.set(self.RUNNING_MODE, self.MODE_HEAT if mode in (self.MODE_HEAT, self.MODE_AUTO) else self.MODE_OFF)
        hook = getattr(self.device, "on_thermostat_update", None)
        if hook:
            hook(self)

    def _apply_schedule(self) -> None:
        now = dt.datetime.now()
        day_bit = 1 << ((now.weekday() + 1) % 7)  # ZCL: bit0 Sunday .. bit6 Saturday
        transitions = self.schedule.get(day_bit) or []
        minutes = now.hour * 60 + now.minute
        current = [sp for t, sp in sorted(transitions) if t <= minutes]
        if current and current[-1] != self.get(self.OCC_HEAT_SP):
            self.set(self.OCC_HEAT_SP, current[-1])

    # ----------------------------------------------------------- commands
    def handle(self, cmd: int, payload: bytes) -> Result:
        if cmd == 0x00:  # SetpointRaiseLower(mode, amount in 0.1 °C)
            mode, amount = struct.unpack_from("<Bb", payload)
            if mode in (0, 2):
                self.set(self.OCC_HEAT_SP, int(self.get(self.OCC_HEAT_SP) or 0) + amount * 10)
                self._clamp_setpoint()
                self.update()
            return Result()
        if cmd == 0x01:  # SetWeeklySchedule(n, days, mode, transitions...)
            n, days, mode = payload[0], payload[1], payload[2]
            if not mode & 0x01:
                return Result(INVALID_FIELD)
            size = 4 + (2 if mode & 0x02 else 0)
            trans = []
            for i in range(n):
                t, heat = struct.unpack_from("<Hh", payload, 3 + i * size)
                trans.append((t, heat))
            for bit in range(8):
                if days & (1 << bit):
                    self.schedule[1 << bit] = trans
            self.device.state_changed()
            return Result()
        if cmd == 0x02:  # GetWeeklySchedule(days, mode) -> GetWeeklyScheduleResponse per day
            days, _mode = payload[0], payload[1]
            found = False
            for bit in range(7):
                if days & (1 << bit) and (1 << bit) in self.schedule:
                    found = True
                    trans = self.schedule[1 << bit]
                    body = bytes([len(trans), 1 << bit, 0x01]) + b"".join(struct.pack("<Hh", t, sp) for t, sp in trans)
                    self.device.send_zcl(self.ep, self.cluster, 0x00, body, cluster_specific=True, server_to_client=True,
                                         summary="getWeeklyScheduleRsp")  # fmt: skip
            return Result() if found else Result(NOT_FOUND)
        if cmd == 0x03:  # ClearWeeklySchedule
            self.schedule.clear()
            return Result()
        return Result(UNSUP_CLUSTER_COMMAND)

    def local(self, command: str, **kw: Any) -> None:
        if command in ("raise", "lower"):
            step = int(kw.get("step", 50))
            self.set(self.OCC_HEAT_SP, int(self.get(self.OCC_HEAT_SP) or 0) + (step if command == "raise" else -step))
            self._clamp_setpoint()
            self.update()
        else:
            super().local(command)

    def persist(self) -> dict[str, Any]:
        return {"schedule": {str(k): v for k, v in self.schedule.items()}}

    def restore(self, data: dict[str, Any]) -> None:
        self.schedule = {int(k): [tuple(x) for x in v] for k, v in data.get("schedule", {}).items()}


SENSOR_SERVERS = (
    IasZoneServer, TemperatureServer, HumidityServer, IlluminanceServer, FlowServer,
    OccupancyServer, PollControlServer, ThermostatServer,
)  # fmt: skip
