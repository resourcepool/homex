"""Tuya MCU datapoint protocol on cluster 0xEF00 (manuSpecificTuya).

Tuya "TS0601" devices hide their whole function behind datapoints (DPs)
carried by cluster-specific commands, as zigbee-herdsman (lib/tuya.js) and
zhaquirks (tuya/mcu) implement them:

- gateway -> device: dataRequest 0x00 / sendData 0x04 (seq u16, DPs),
  dataQuery 0x03 (report everything), mcuVersionRequest 0x10 (seq),
  mcuSyncTime 0x24 (time reply), mcuGatewayConnectionStatus 0x25;
- device -> gateway: dataResponse 0x01 (answer), dataReport 0x02
  (spontaneous), mcuVersionResponse 0x11 (seq, version u8).

A DP is `dp u8, type u8, length u16 BE, data`: raw 0x00, bool 0x01,
value 0x02 (u32 BE), string 0x03, enum 0x04 (u8), bitmap 0x05.

Options (serverOptions.manuSpecificTuya):
- datapoints: list of {dp, type ("bool"|"value"|"enum"|"string"|"raw"|"bitmap"),
  input (device input it reflects), scale (input * scale = DP value),
  int16 (value DPs: negative numbers on 16 bits, as Tuya sensors send them),
  value (constant), writable (host may set it: stored, echoed, and written
  back to the input)}. Reported when their input changes and on dataQuery.
- cover: {control, target, position, workState, travelSeconds, closed (DP
  values are the closed percentage, default True), openPercent} — a curtain
  motor: control enum 0 open / 1 stop / 2 close, target and position in %.
- reportInterval: seconds between periodic reports of every DP (0 = off).
- oneDpPerFrame (default True): one DP per message, as most TS0601 MCUs send
  (Zigbee2MQTT's legacy converters only read the first DP of a message).
- mcuVersion: version byte of mcuVersionResponse (default 0x40 = 1.0.0).

The cover publishes `cover_open_pct` / `cover_motion` in the device inputs.
"""

from __future__ import annotations

import asyncio
import struct
from typing import Any

from .zcl_servers import UNSUP_CLUSTER_COMMAND, ClusterServer, Result

DP_RAW, DP_BOOL, DP_VALUE, DP_STRING, DP_ENUM, DP_BITMAP = 0x00, 0x01, 0x02, 0x03, 0x04, 0x05
DP_TYPES = {"raw": DP_RAW, "bool": DP_BOOL, "value": DP_VALUE, "string": DP_STRING, "enum": DP_ENUM, "bitmap": DP_BITMAP}

CMD_DATA_REQUEST, CMD_DATA_RESPONSE, CMD_DATA_REPORT, CMD_DATA_QUERY, CMD_SEND_DATA = 0x00, 0x01, 0x02, 0x03, 0x04
CMD_MCU_VERSION_REQ, CMD_MCU_VERSION_RSP, CMD_MCU_SYNC_TIME, CMD_GATEWAY_STATUS = 0x10, 0x11, 0x24, 0x25
TICK_S = 0.5


def encode_dp(dp: int, dtype: int, value: Any, int16: bool = False) -> bytes:
    if dtype == DP_BOOL:
        data = bytes([1 if value else 0])
    elif dtype == DP_VALUE:
        v = round(value)
        data = ((v & 0xFFFF) if (int16 and v < 0) else (v & 0xFFFFFFFF)).to_bytes(4, "big")
    elif dtype == DP_ENUM:
        data = bytes([int(value) & 0xFF])
    elif dtype == DP_BITMAP:
        data = bytes([int(value) & 0xFF])
    elif dtype == DP_STRING:
        data = str(value).encode()
    else:
        data = bytes.fromhex(value) if isinstance(value, str) else bytes(value)
    return struct.pack(">BBH", dp, dtype, len(data)) + data


def decode_dps(data: bytes) -> list[tuple[int, int, Any]]:
    """(dp, type, value) from the DP list of a dataRequest / dataReport."""
    out = []
    off = 0
    while off + 4 <= len(data):
        dp, dtype, length = struct.unpack_from(">BBH", data, off)
        off += 4
        raw = data[off : off + length]
        off += length
        if dtype in (DP_VALUE, DP_ENUM, DP_BITMAP):
            value: Any = int.from_bytes(raw, "big")
        elif dtype == DP_BOOL:
            value = bool(raw and raw[0])
        elif dtype == DP_STRING:
            value = raw.decode(errors="replace")
        else:
            value = raw.hex()
        out.append((dp, dtype, value))
    return out


class TuyaMcuServer(ClusterServer):
    cluster = 0xEF00
    name = "manuSpecificTuya"

    def __init__(self, *a: Any) -> None:
        super().__init__(*a)
        self._seq = 0
        self.dps: dict[int, dict[str, Any]] = {int(d["dp"]): dict(d) for d in self.options.get("datapoints", [])}
        self.values: dict[int, Any] = {}  # host-written values of writable DPs
        self._sent: dict[int, Any] = {}  # last value reported per DP
        self._periodic: asyncio.Task | None = None
        cover = self.options.get("cover")
        self.cover = dict(cover) if cover else None
        self._motor: asyncio.Task | None = None
        self.target: float | None = None
        self.open_pct = float(self.cover.get("openPercent", 100)) if self.cover else 0.0
        if self.cover:
            self._publish_cover("stopped")

    # ------------------------------------------------------------- values
    def dp_value(self, dp: int) -> Any:
        spec = self.dps.get(dp, {})
        if self.cover and dp == self.cover.get("target") and self.target is not None:
            return self._cover_dp_value(self.target)  # echo where the motor is going
        if self.cover and dp in (self.cover.get("position"), self.cover.get("target")):
            return self._cover_dp_value()
        if self.cover and dp == self.cover.get("workState"):
            return 0  # standby
        if dp in self.values:
            return self.values[dp]
        if "input" in spec:
            raw = self.device.inputs.get(spec["input"], 0)
            if isinstance(raw, bool) or spec.get("type") in ("bool", "string", "raw"):
                return raw
            return round(float(raw) * float(spec.get("scale", 1)))
        return spec.get("value", 0)

    def _dp_type(self, dp: int) -> int:
        return DP_TYPES[self.dps.get(dp, {}).get("type", "value")]

    def _all_dps(self) -> list[int]:
        dps = list(self.dps)
        if self.cover:
            for key in ("control", "position", "target", "workState"):
                dp = self.cover.get(key)
                if dp is not None and dp not in dps and key != "control":
                    dps.append(int(dp))
        return dps

    # ---------------------------------------------------------- outgoing
    def _next_seq(self) -> int:
        self._seq = (self._seq + 1) & 0xFFFF
        return self._seq

    def send_dps(self, dps: list[int], command: int = CMD_DATA_REPORT, seq: int | None = None) -> None:
        if not self.device.can_transmit or not dps:
            return
        groups = [[dp] for dp in dps] if self.options.get("oneDpPerFrame", True) else [dps]
        for group in groups:
            body = b"".join(
                encode_dp(dp, self._dp_type(dp), self.dp_value(dp), bool(self.dps.get(dp, {}).get("int16"))) for dp in group
            )
            for dp in group:
                self._sent[dp] = self.dp_value(dp)
            names = ", ".join(f"dp{dp}={self.dp_value(dp)}" for dp in group)
            self.device.send_zcl(
                self.ep, self.cluster, command,
                struct.pack(">H", self._next_seq() if seq is None else seq) + body,
                cluster_specific=True, server_to_client=True,
                summary=f"{'dataResponse' if command == CMD_DATA_RESPONSE else 'dataReport'} {names}",
            )  # fmt: skip

    # ---------------------------------------------------------- incoming
    def handle(self, cmd: int, payload: bytes) -> Result:
        if cmd in (CMD_DATA_REQUEST, CMD_SEND_DATA):
            seq = struct.unpack_from(">H", payload)[0]
            answered: list[int] = []
            for dp, _dtype, value in decode_dps(payload[2:]):
                answered += self._set_dp(dp, value)
            if answered:
                self.send_dps(answered, CMD_DATA_RESPONSE, seq)
            return Result()
        if cmd == CMD_DATA_QUERY:
            self.send_dps(self._all_dps(), CMD_DATA_RESPONSE)
            return Result()
        if cmd == CMD_MCU_VERSION_REQ:  # answered by mcuVersionResponse (+ the Default Response)
            seq = payload[:2] if len(payload) >= 2 else b"\x00\x00"
            version = int(self.options.get("mcuVersion", 0x40))
            self.device.send_zcl(self.ep, self.cluster, CMD_MCU_VERSION_RSP, bytes(seq) + bytes([version]),
                                 cluster_specific=True, server_to_client=True, summary=f"mcuVersionResponse 0x{version:02x}")  # fmt: skip
            return Result()
        if cmd in (CMD_MCU_SYNC_TIME, CMD_GATEWAY_STATUS):
            return Result()  # time / connection status from the gateway: accepted
        return Result(UNSUP_CLUSTER_COMMAND)

    def _set_dp(self, dp: int, value: Any) -> list[int]:
        """Apply a DP written by the host; returns the DPs to answer with."""
        c = self.cover
        if c and dp == c.get("control"):
            action = int(value)
            if action == 0:
                self.move_to(100)
            elif action == 2:
                self.move_to(0)
            elif action == 1:
                self.stop_motor()
            self.values[dp] = action
            return [dp]
        if c and dp == c.get("target"):
            pct = max(0, min(100, int(value)))
            self.move_to(100 - pct if c.get("closed", True) else pct)
            return [dp]
        spec = self.dps.get(dp)
        if spec is None or not spec.get("writable"):
            return []
        self.values[dp] = value
        if "input" in spec:
            scale = float(spec.get("scale", 1))
            self.device.inputs[spec["input"]] = value / scale if isinstance(value, int) and scale != 1 else value
            self.device.state_changed()
        return [dp]

    # ------------------------------------------------------ physical world
    def on_inputs(self) -> None:
        changed = [dp for dp, spec in self.dps.items() if "input" in spec and self._sent.get(dp) != self.dp_value(dp)]
        self.send_dps(changed)

    def start(self) -> None:
        interval = float(self.options.get("reportInterval", 0))
        if interval > 0 and self._periodic is None:
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                return

            async def periodic() -> None:
                while True:
                    await asyncio.sleep(interval)
                    self.send_dps([dp for dp, spec in self.dps.items() if "input" in spec or "value" in spec])

            self._periodic = loop.create_task(periodic())

    def power_down(self) -> None:
        if self._periodic is not None:
            self._periodic.cancel()
            self._periodic = None
        if self._motor is not None:
            self._motor.cancel()
            self._motor = None
        self.target = None
        if self.cover:
            self._publish_cover("stopped")

    def local(self, command: str, **kw: Any) -> None:
        if self.cover and command in ("open", "close", "stop", "set"):
            if command == "open":
                self.move_to(100)
            elif command == "close":
                self.move_to(0)
            elif command == "stop":
                self.stop_motor()
            else:
                self.move_to(float(kw.get("position", 100)))
        elif command == "report":  # e.g. a button press making the MCU report everything
            self.send_dps(self._all_dps())
        else:
            super().local(command, **kw)

    # --------------------------------------------------------------- cover
    def _cover_dp_value(self, open_pct: float | None = None) -> int:
        pct = round(self.open_pct if open_pct is None else open_pct)
        return 100 - pct if self.cover.get("closed", True) else pct

    def _publish_cover(self, motion: str) -> None:
        self.device.inputs["cover_open_pct"] = round(self.open_pct)
        self.device.inputs["cover_motion"] = motion

    def move_to(self, open_pct: float) -> None:
        open_pct = max(0.0, min(100.0, float(open_pct)))
        if abs(open_pct - self.open_pct) < 0.5:
            self.stop_motor()
            return
        self.target = open_pct
        motion = "opening" if open_pct > self.open_pct else "closing"
        self._publish_cover(motion)
        self.device.state_changed()
        if self._motor is None:
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                self.open_pct = open_pct
                self._cover_stopped()
                return
            self._motor = loop.create_task(self._run())

    async def _run(self) -> None:
        travel = max(1.0, float(self.cover.get("travelSeconds", 20)))
        last_report = 0.0
        elapsed = 0.0
        try:
            while self.target is not None:
                await asyncio.sleep(TICK_S)
                elapsed += TICK_S
                step = 100.0 / travel * TICK_S
                delta = self.target - self.open_pct
                if abs(delta) <= step:
                    self.open_pct = self.target
                    break
                self.open_pct += step if delta > 0 else -step
                self._publish_cover("opening" if delta > 0 else "closing")
                self.device.state_changed()
                if elapsed - last_report >= 2.0 and self.cover.get("position") is not None:
                    last_report = elapsed
                    self.send_dps([int(self.cover["position"])])
        except asyncio.CancelledError:
            return
        self._motor = None
        self._cover_stopped()

    def stop_motor(self) -> None:
        if self._motor is not None:
            self._motor.cancel()
            self._motor = None
        self._cover_stopped()

    def _cover_stopped(self) -> None:
        self.target = None
        self._publish_cover("stopped")
        self.device.state_changed()
        if self.cover.get("position") is not None:
            self.send_dps([int(self.cover["position"])])

    def persist(self) -> dict[str, Any]:
        data: dict[str, Any] = {"values": {str(k): v for k, v in self.values.items()}}
        if self.cover:
            data["openPercent"] = round(self.open_pct, 1)
        return data

    def restore(self, data: dict[str, Any]) -> None:
        self.values = {int(k): v for k, v in data.get("values", {}).items()}
        if self.cover:
            self.open_pct = float(data.get("openPercent", self.open_pct))
            self._publish_cover("stopped")


TUYA_SERVERS = (TuyaMcuServer,)
