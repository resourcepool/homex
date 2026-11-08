"""Passive EZSP decoding of a host <-> NCP byte stream (proxy mode).

Nothing here talks: bytes are forwarded untouched by the proxy, and a copy is
fed to two AshSniffer instances (one per direction) that recover the EZSP
frames, then to EzspDecoder which turns the interesting ones into events:

- from the NCP: incomingMessageHandler (a device sent something),
  trustCenterJoinHandler (joined / rejoined / left), stackStatusHandler,
  VERSION response (protocol version), getNetworkParameters response;
- from the host: sendUnicast (something sent to a device), permitJoining.

ZCL / ZDO payloads of incoming messages are further decoded for what a
profile needs: device announce, node / active endpoints / simple descriptors,
and Basic cluster attributes (read responses and reports).
"""

from __future__ import annotations

import struct
from dataclasses import dataclass
from typing import Any, Callable

from . import zcl
from .ash import CANCEL, CTRL_RST, CTRL_RSTACK, FLAG, crc16, randomize, unstuff
from .clusters import cluster_name

# EZSP frame ids
VERSION = 0x0000
PERMIT_JOINING = 0x0022
GET_NETWORK_PARAMETERS = 0x0028
SEND_UNICAST = 0x0034
TRUST_CENTER_JOIN_HANDLER = 0x0024
CHILD_JOIN_HANDLER = 0x0023
INCOMING_MESSAGE_HANDLER = 0x0045
STACK_STATUS_HANDLER = 0x0019

NETWORK_UP, NETWORK_DOWN = 0x90, 0x91
JOIN_STATUS = {0: "secured rejoin", 1: "joined", 2: "left", 3: "rejoined"}

ZDO_NAMES = {
    0x0000: "nwkAddrReq", 0x8000: "nwkAddrRsp", 0x0001: "ieeeAddrReq", 0x8001: "ieeeAddrRsp",
    0x0002: "nodeDescReq", 0x8002: "nodeDescRsp", 0x0004: "simpleDescReq", 0x8004: "simpleDescRsp",
    0x0005: "activeEpReq", 0x8005: "activeEpRsp", 0x0013: "deviceAnnce", 0x0021: "bindReq", 0x8021: "bindRsp",
    0x0022: "unbindReq", 0x8022: "unbindRsp", 0x0031: "mgmtLqiReq", 0x8031: "mgmtLqiRsp", 0x0034: "mgmtLeaveReq",
    0x8034: "mgmtLeaveRsp", 0x0036: "mgmtPermitJoinReq", 0x8036: "mgmtPermitJoinRsp", 0x0038: "mgmtNwkUpdateReq",
}
ZCL_GLOBAL = {
    0x00: "read", 0x01: "readRsp", 0x02: "write", 0x04: "writeRsp", 0x06: "configReport", 0x07: "configReportRsp",
    0x0A: "report", 0x0B: "defaultRsp", 0x0C: "discover", 0x0D: "discoverRsp",
}
BASIC_ATTRS = {
    0x0000: "zclVersion", 0x0001: "appVersion", 0x0002: "stackVersion", 0x0003: "hwVersion",
    0x0004: "manufacturerName", 0x0005: "modelId", 0x0006: "dateCode", 0x0007: "powerSource", 0x4000: "swBuildId",
}


class AshSniffer:
    """Recover EZSP frames from one direction of an ASH link, without answering."""

    def __init__(self, on_frame: Callable[[bytes], None], on_reset: Callable[[], None] | None = None) -> None:
        self._on_frame = on_frame
        self._on_reset = on_reset or (lambda: None)
        self._buf = bytearray()
        self._last_frm: int | None = None
        self.frames = 0
        self.errors = 0

    def feed(self, data: bytes) -> None:
        self._buf += data
        while True:
            idx = self._buf.find(bytes([FLAG]))
            if idx < 0:
                if len(self._buf) > 4096:  # not ASH (or garbage): don't grow forever
                    del self._buf[:-256]
                return
            raw = bytes(self._buf[:idx])
            del self._buf[: idx + 1]
            c = raw.rfind(bytes([CANCEL]))
            if c >= 0:
                raw = raw[c + 1 :]
            raw = raw.lstrip(b"\xff")
            if raw:
                self._frame(raw)

    def _frame(self, raw: bytes) -> None:
        frame = unstuff(raw)
        if frame is None or len(frame) < 3:
            self.errors += 1
            return
        body, crc = frame[:-2], frame[-2:]
        if crc16(body) != (crc[0] << 8 | crc[1]):
            self.errors += 1
            return
        ctrl = body[0]
        if ctrl in (CTRL_RST, CTRL_RSTACK):
            self._last_frm = None
            self._on_reset()
            return
        if ctrl & 0x80:
            return  # ACK / NAK / ERROR
        frm, retx = (ctrl >> 4) & 0x07, bool(ctrl & 0x08)
        if retx and frm == self._last_frm:
            return  # retransmission of a frame already seen
        self._last_frm = frm
        self.frames += 1
        self._on_frame(randomize(body[1:]))


@dataclass
class EzspFrame:
    seq: int
    frame_id: int
    params: bytes
    callback: bool


def split_ezsp(frame: bytes, extended: bool) -> EzspFrame | None:
    if len(frame) < 3:
        return None
    seq, fc = frame[0], frame[1]
    if extended and len(frame) >= 5 and (frame[2] & 0x03) == 0x01:
        return EzspFrame(seq, frame[3] | (frame[4] << 8), frame[5:], bool(fc & 0x10))
    return EzspFrame(seq, frame[2], frame[3:], bool(fc & 0x10))


def _aps(p: bytes, off: int) -> dict[str, int]:
    profile, cluster, src_ep, dst_ep, options, group, seq = struct.unpack_from("<HHBBHHB", p, off)
    return {"profile": profile, "cluster": cluster, "srcEp": src_ep, "dstEp": dst_ep, "options": options, "group": group, "seq": seq}


def _zcl_value(type_id: int, data: bytes, off: int) -> tuple[Any, int]:
    name = zcl.TYPE_BY_ID.get(type_id)
    if name is None:
        raise ValueError(f"type 0x{type_id:02x}")
    return zcl.decode_value(name, data, off)


def decode_zcl(cluster: int, payload: bytes) -> dict[str, Any]:
    """Summary + Basic attributes from a ZCL frame (best effort)."""
    try:
        f = zcl.ZclFrame.decode(payload)
    except (IndexError, ValueError):
        return {"summary": "malformed ZCL"}
    out: dict[str, Any] = {}
    manuf = f" (manuf 0x{f.manufacturer_code:04x})" if f.manufacturer_code is not None else ""
    if f.cluster_specific:
        out["summary"] = f"cmd 0x{f.command_id:02x}{manuf}"
        return out
    name = ZCL_GLOBAL.get(f.command_id, f"global 0x{f.command_id:02x}")
    attrs: dict[int, Any] = {}
    try:
        p, off = f.payload, 0
        if f.command_id in (0x01, 0x0A):  # read response / report: id, [status], type, value
            while off + 3 <= len(p):
                aid = p[off] | p[off + 1] << 8
                off += 2
                if f.command_id == 0x01:
                    status = p[off]
                    off += 1
                    if status != 0:
                        continue
                value, off = _zcl_value(p[off], p, off + 1)
                attrs[aid] = value
    except (IndexError, ValueError, AssertionError):
        pass
    if attrs:
        shown = ", ".join(
            f"{BASIC_ATTRS.get(a, f'0x{a:04x}') if cluster == 0 else f'0x{a:04x}'}={v}" for a, v in list(attrs.items())[:6]
        )
        out["summary"] = f"{name} {shown}{manuf}"
    else:
        out["summary"] = f"{name}{manuf}"
    if cluster == 0x0000 and attrs:
        out["basic"] = {BASIC_ATTRS[a]: v for a, v in attrs.items() if a in BASIC_ATTRS}
    return out


def decode_zdo(cluster: int, payload: bytes) -> dict[str, Any]:
    out: dict[str, Any] = {"summary": ZDO_NAMES.get(cluster, f"zdo 0x{cluster:04x}")}
    p = payload
    try:
        if cluster == 0x0013 and len(p) >= 12:  # device announce: tsn, nwk, ieee, capability
            out["announce"] = {"nwk": p[1] | p[2] << 8, "ieee": int.from_bytes(p[3:11], "little"), "capability": p[11]}
        elif cluster == 0x8002 and len(p) >= 17 and p[1] == 0:  # node descriptor response
            d = p[4:]
            out["nodeDesc"] = {
                "logicalType": {0: "coordinator", 1: "router", 2: "end_device"}.get(d[0] & 0x07, "unknown"),
                "macCapabilities": d[2],
                "manufacturerCode": d[3] | d[4] << 8,
            }
        elif cluster == 0x8005 and len(p) >= 5 and p[1] == 0:  # active endpoints response
            out["activeEps"] = list(p[5 : 5 + p[4]])
        elif cluster == 0x8004 and len(p) >= 12 and p[1] == 0:  # simple descriptor response
            d = p[5:]
            ep = d[0]
            profile, device_id = struct.unpack_from("<HH", d, 1)
            n_in = d[6]
            ins = list(struct.unpack_from(f"<{n_in}H", d, 7))
            o = 7 + 2 * n_in
            n_out = d[o]
            outs = list(struct.unpack_from(f"<{n_out}H", d, o + 1))
            out["simpleDesc"] = {"id": ep, "profileId": profile, "deviceId": device_id, "version": d[5] & 0x0F, "inClusters": ins, "outClusters": outs}
    except (IndexError, struct.error):
        pass
    return out


class EzspDecoder:
    """Decode host commands and NCP responses / callbacks into proxy events."""

    def __init__(self, emit: Callable[[dict[str, Any]], None]) -> None:
        self._emit = emit
        self.version = 0
        self.extended = False
        self.network: dict[str, Any] = {"up": None, "channel": None, "panId": None, "permitJoin": False}

    def reset(self) -> None:
        self.extended = False

    # ------------------------------------------------------------- host -> NCP
    def from_host(self, frame: bytes) -> None:
        f = split_ezsp(frame, self.extended)
        if f is None:
            return
        p = f.params
        try:
            if f.frame_id == SEND_UNICAST and len(p) >= 16:
                dest = p[1] | p[2] << 8
                aps = _aps(p, 3)
                off = 14 + (2 if self.version >= 0x0E else 1)
                length = p[off]
                payload = bytes(p[off + 1 : off + 1 + length])
                self._emit({"kind": "toDevice", "nwk": dest, "aps": aps, "payload": payload})
            elif f.frame_id == PERMIT_JOINING and p:
                self.network["permitJoin"] = p[0] > 0
                self._emit({"kind": "network"})
        except (IndexError, struct.error):
            pass

    # ------------------------------------------------------------- NCP -> host
    def from_ncp(self, frame: bytes) -> None:
        f = split_ezsp(frame, self.extended)
        if f is None:
            return
        p = f.params
        try:
            if f.frame_id == VERSION and not f.callback and len(p) >= 4 and not self.extended:
                self.version = p[0]
                self.extended = self.version >= 8
                self._emit({"kind": "version", "version": self.version, "stack": struct.unpack_from("<H", p, 2)[0]})
            elif f.frame_id == INCOMING_MESSAGE_HANDLER:
                self._incoming(p)
            elif f.frame_id == TRUST_CENTER_JOIN_HANDLER and len(p) >= 12:
                self._emit(
                    {
                        "kind": "join",
                        "nwk": p[0] | p[1] << 8,
                        "ieee": int.from_bytes(p[2:10], "little"),
                        "status": JOIN_STATUS.get(p[10], f"status {p[10]}"),
                    }
                )
            elif f.frame_id == STACK_STATUS_HANDLER and p:
                if p[0] in (NETWORK_UP, NETWORK_DOWN):
                    self.network["up"] = p[0] == NETWORK_UP
                    self._emit({"kind": "network"})
            elif f.frame_id == GET_NETWORK_PARAMETERS and not f.callback:
                off = 4 if self.version >= 0x0E else 1  # status (sl_Status / EmberStatus)
                off += 1  # node type
                # EmberNetworkParameters: extPanId(8) panId(2) txPower(1) channel(1) ...
                pan = struct.unpack_from("<H", p, off + 8)[0]
                self.network.update(panId=pan, channel=p[off + 11])
                self._emit({"kind": "network"})
        except (IndexError, struct.error):
            pass

    def _incoming(self, p: bytes) -> None:
        aps = _aps(p, 1)
        off = 12
        if self.version >= 0x0E:  # EmberRxPacketInfo
            sender = p[off] | p[off + 1] << 8
            eui = int.from_bytes(p[off + 2 : off + 10], "little")
            lqi = p[off + 12]
            rssi = struct.unpack_from("<b", p, off + 13)[0]
            off += 18
        else:
            lqi = p[off]
            rssi = struct.unpack_from("<b", p, off + 1)[0]
            sender = p[off + 2] | p[off + 3] << 8
            eui = 0
            off += 6
        length = p[off]
        payload = bytes(p[off + 1 : off + 1 + length])
        self._emit({"kind": "fromDevice", "nwk": sender, "ieee": eui if eui not in (0, 0xFFFFFFFFFFFFFFFF) else None, "aps": aps, "lqi": lqi, "rssi": rssi, "payload": payload})


def describe(aps: dict[str, int], payload: bytes) -> dict[str, Any]:
    """Decode an application payload (ZDO or ZCL) carried in an APS frame."""
    if aps["profile"] == 0x0000:
        d = decode_zdo(aps["cluster"], payload)
        cid = aps["cluster"]
        d["cluster"] = "zdo:" + ZDO_NAMES.get(cid, f"0x{cid:04x}")
        return d
    d = decode_zcl(aps["cluster"], payload)
    d["cluster"] = cluster_name(aps["cluster"])
    return d
