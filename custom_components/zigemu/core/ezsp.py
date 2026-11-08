"""EZSP (EmberZNet Serial Protocol) NCP-side command handling.

Targets the host behaviour of zigbee-herdsman's `ember` adapter, protocol
version 0x0D..0x13 (we speak 0x0D+ with uint32 SLStatus when >= 0x0E).
"""

from __future__ import annotations

import logging
import struct
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Callable

if TYPE_CHECKING:
    from .emulator import Emulator as Network

_LOGGER = logging.getLogger(__name__)

EZSP_PROTOCOL_VERSION = 0x0D + 6  # 0x13
STACK_TYPE_MESH = 0x02
STACK_VERSION = 0x7420  # "7.4.2.0"

FC_RESPONSE = 0x80
FC_ASYNC_CALLBACK = 0x10
FC_HB_FORMAT = 0x01

# SLStatus values
SL_OK = 0x0000
SL_FAIL = 0x0001
SL_INVALID_PARAMETER = 0x0021
SL_NOT_FOUND = 0x000E
SL_NETWORK_UP = 0x0015
SL_NETWORK_DOWN = 0x0016
SL_NOT_JOINED = 0x0017

# Frame ids (EzspFrameID)
VERSION = 0x0000
ADD_ENDPOINT = 0x0002
GET_EXTENDED_VALUE = 0x0003
SET_CONCENTRATOR = 0x0010
SET_MANUFACTURER_CODE = 0x0015
NETWORK_INIT = 0x0017
STACK_STATUS_HANDLER = 0x0019
FORM_NETWORK = 0x001E
LEAVE_NETWORK = 0x0020
PERMIT_JOINING = 0x0022
GET_EUI64 = 0x0026
GET_NODE_ID = 0x0027
GET_NETWORK_PARAMETERS = 0x0028
SET_CONFIGURATION_VALUE = 0x0053
GET_CONFIGURATION_VALUE = 0x0052
SET_POLICY = 0x0055
GET_POLICY = 0x0056
SET_SOURCE_ROUTE_DISCOVERY_MODE = 0x005A
SET_MULTICAST_TABLE_ENTRY = 0x0064
SET_INITIAL_SECURITY_STATE = 0x0068
SET_RADIO_POWER = 0x0099
GET_VALUE = 0x00AA
SET_VALUE = 0x00AB
CLEAR_KEY_TABLE = 0x00B1
EXPORT_KEY = 0x0114

VALUE_VERSION_INFO = 0x11
INVALID_COMMAND = 0x0058
EZSP_ERROR_INVALID_ID = 0x37


def u32(v: int) -> bytes:
    return struct.pack("<I", v)


def status(v: int = SL_OK) -> bytes:
    return u32(v)


@dataclass
class EzspSession:
    """Volatile per-connection NCP state (cleared by ASH reset)."""

    version: int = EZSP_PROTOCOL_VERSION
    # Frames are in the legacy format (seq, fc, id) until a VERSION command
    # negotiates protocol >= 8; from then on the host uses the extended format.
    extended: bool = False
    network_up: bool = False
    endpoints: dict[int, bytes] = field(default_factory=dict)
    config: dict[int, int] = field(default_factory=dict)
    policies: dict[int, int] = field(default_factory=dict)
    values: dict[int, bytes] = field(default_factory=dict)
    pending_security: dict | None = None
    multicast: dict[int, bytes] = field(default_factory=dict)  # RAM table, cleared on reset
    extended_timeouts: set[int] = field(default_factory=set)


Handler = Callable[[bytes], bytes | None]


class EzspNcp:
    """Decodes EZSP command frames and produces responses/callbacks."""

    def __init__(self, network: Network, send_frame: Callable[[bytes], None]) -> None:
        self.net = network
        self._send_frame = send_frame
        self.session = EzspSession()
        self._cb_seq = 0
        self._handlers: dict[int, Handler] = {}
        self._register_handlers()

    # ---------------------------------------------------------------- frames
    def reset(self) -> None:
        self.session = EzspSession()

    def handle_frame(self, frame: bytes) -> None:
        if len(frame) < 3:
            _LOGGER.warning("EZSP: dropping short frame %s", frame.hex())
            return
        seq = frame[0]
        # Extended frames carry frame-control high byte = format version 1.
        legacy = not self.session.extended or (frame[2] & 0x03) != 0x01 or len(frame) < 5
        if legacy:
            frame_id = frame[2]
            params = frame[3:]
        else:
            frame_id = frame[3] | (frame[4] << 8)
            params = frame[5:]
        handler = self._handlers.get(frame_id)
        if handler is None:
            # Real firmware answers unknown commands with an invalidCommand frame.
            _LOGGER.warning("EZSP: unsupported command 0x%04x params=%s (replying invalidCommand)", frame_id, params.hex())
            if legacy:
                self._send_frame(bytes([seq, FC_RESPONSE, INVALID_COMMAND, EZSP_ERROR_INVALID_ID]))
            else:
                # EzspStatus; sent 32-bit from v14 (bellows reads sl_Status, herdsman reads the first byte)
                self._send_frame(
                    bytes([seq, FC_RESPONSE, FC_HB_FORMAT]) + struct.pack("<H", INVALID_COMMAND) + self.status_width(EZSP_ERROR_INVALID_ID)
                )
            return
        else:
            try:
                rsp = handler(params)
            except Exception:  # noqa: BLE001
                _LOGGER.exception("EZSP: handler for 0x%04x failed", frame_id)
                rsp = status(SL_FAIL)
            _LOGGER.debug("EZSP 0x%04x %s -> %s", frame_id, params.hex(), rsp.hex() if rsp else "")
        if legacy:
            self._send_frame(bytes([seq, FC_RESPONSE, frame_id]) + (rsp or b""))
        else:
            self._send_frame(bytes([seq, FC_RESPONSE, FC_HB_FORMAT]) + struct.pack("<H", frame_id) + (rsp or b""))
        self.net.after_command(frame_id)

    def callback(self, frame_id: int, params: bytes) -> None:
        self._cb_seq = (self._cb_seq + 1) & 0xFF
        self._send_frame(
            bytes([self._cb_seq, FC_RESPONSE | FC_ASYNC_CALLBACK, FC_HB_FORMAT]) + struct.pack("<H", frame_id) + params
        )

    def _live_value(self, vid: int) -> bytes | None:
        """Values the stack computes itself (not previously set by the host)."""
        net = self.net
        if vid == 0x03:  # FREE_BUFFERS
            return bytes([0xF0])
        if vid in (0x05, 0x06):  # MAXIMUM_INCOMING / OUTGOING_TRANSFER_SIZE
            return struct.pack("<H", 0x52)
        if vid == 0x07:  # STACK_TOKEN_WRITING
            return b"\x01"
        if vid == 0x08:  # STACK_IS_PERFORMING_REJOIN
            return b"\x00"
        if vid in (0x12, 0x13):  # NEXT_HOST / LAST rejoin reason
            return b"\x00"
        if vid == 0x23:  # NWK_FRAME_COUNTER
            return struct.pack("<I", net.nwk_frame_counter)
        if vid == 0x24:  # APS_FRAME_COUNTER
            return struct.pack("<I", net.tc_frame_counter)
        if vid == 0x0F:  # ENDPOINT_FLAGS (needs an endpoint; report none)
            return None
        return None

    def status_width(self, value: int) -> bytes:
        return u32(value) if self.session.version >= 0x0E else bytes([value & 0xFF])

    # -------------------------------------------------------------- handlers
    def handler(self, frame_id: int) -> Callable[[Handler], Handler]:
        def deco(fn: Handler) -> Handler:
            self._handlers[frame_id] = fn
            return fn

        return deco

    def _register_handlers(self) -> None:
        s = self.session  # noqa: F841 - handlers read self.session lazily
        h = self.handler
        net = self.net

        @h(VERSION)
        def _version(p: bytes) -> bytes:
            desired = p[0] if p else EZSP_PROTOCOL_VERSION
            ver = desired if 0x0D <= desired <= EZSP_PROTOCOL_VERSION else EZSP_PROTOCOL_VERSION
            self.session.version = ver
            self.session.extended = True  # we only speak >= 8: extended frames from now on
            return bytes([ver, STACK_TYPE_MESH]) + struct.pack("<H", STACK_VERSION)

        @h(GET_VALUE)
        def _get_value(p: bytes) -> bytes:
            vid = p[0]
            if vid == VALUE_VERSION_INFO:
                # build, major, minor, patch, special, type(GA=0xAA)
                val = struct.pack("<HBBBBB", 0, 7, 4, 2, 0, 0xAA)
                return status() + bytes([len(val)]) + val
            val = self.session.values.get(vid)
            if val is None:
                val = self._live_value(vid)
            if val is None:
                return status(SL_INVALID_PARAMETER) + b"\x00"
            return status() + bytes([len(val)]) + val

        @h(SET_VALUE)
        def _set_value(p: bytes) -> bytes:
            vid, length = p[0], p[1]
            data = bytes(p[2 : 2 + length])
            if vid == 0x23 and length == 4:  # NWK_FRAME_COUNTER (backup restore)
                net.nwk_frame_counter = struct.unpack("<I", data)[0]
                net.save_soon()
            elif vid == 0x24 and length == 4:  # APS_FRAME_COUNTER
                net.tc_frame_counter = struct.unpack("<I", data)[0]
                net.save_soon()
            else:
                self.session.values[vid] = data
            return status()

        @h(GET_EXTENDED_VALUE)
        def _get_ext_value(p: bytes) -> bytes:
            vid = p[0]
            char = struct.unpack_from("<I", p, 1)[0]
            if vid == 0x00:  # ENDPOINT_FLAGS
                if char in self.session.endpoints:
                    return status() + b"\x02\x01\x00"
                return status(SL_NOT_FOUND) + b"\x02\x00\x00"
            return status(SL_INVALID_PARAMETER) + b"\x02\x00\x00"

        @h(SET_CONFIGURATION_VALUE)
        def _set_cfg(p: bytes) -> bytes:
            self.session.config[p[0]] = struct.unpack_from("<H", p, 1)[0]
            return status()

        @h(GET_CONFIGURATION_VALUE)
        def _get_cfg(p: bytes) -> bytes:
            defaults = {0x0C: 2, 0x0D: 5, 0x10: 30, 0x11: 32, 0x0E: 4}  # KEY_TABLE_SIZE etc.
            val = self.session.config.get(p[0], defaults.get(p[0], 0))
            return status() + struct.pack("<H", val)

        @h(SET_POLICY)
        def _set_policy(p: bytes) -> bytes:
            self.session.policies[p[0]] = p[1]
            return status()

        @h(GET_POLICY)
        def _get_policy(p: bytes) -> bytes:
            return status() + bytes([self.session.policies.get(p[0], 0)])

        @h(SET_MANUFACTURER_CODE)
        def _set_manuf(_p: bytes) -> bytes:
            return b""

        @h(ADD_ENDPOINT)
        def _add_ep(p: bytes) -> bytes:
            self.session.endpoints[p[0]] = bytes(p)
            return status()

        @h(SET_MULTICAST_TABLE_ENTRY)
        def _mcast(p: bytes) -> bytes:
            self.session.multicast[p[0]] = bytes(p[1:5])
            return status()

        @h(NETWORK_INIT)
        def _network_init(_p: bytes) -> bytes:
            if net.formed:
                net.schedule_network_up()
                return status()
            return status(SL_NOT_JOINED)

        @h(SET_INITIAL_SECURITY_STATE)
        def _init_sec(p: bytes) -> bytes:
            self.session.pending_security = {
                "bitmask": struct.unpack_from("<H", p, 0)[0],
                "tc_link_key": p[2:18].hex(),
                "network_key": p[18:34].hex(),
                "key_seq": p[34],
            }
            return status()

        @h(CLEAR_KEY_TABLE)
        def _clear_keys(_p: bytes) -> bytes:
            net.key_table.clear()
            net.save_soon()
            return status()

        @h(FORM_NETWORK)
        def _form(p: bytes) -> bytes:
            params = decode_network_params(p)
            sec = self.session.pending_security or {}
            net.form(params, sec)
            net.schedule_network_up()
            return status()

        @h(LEAVE_NETWORK)
        def _leave(_p: bytes) -> bytes:
            net.leave()
            return status()

        @h(GET_NETWORK_PARAMETERS)
        def _get_params(_p: bytes) -> bytes:
            if not net.formed:
                return status(SL_NOT_JOINED) + b"\x00" + bytes(20)
            return status() + b"\x01" + encode_network_params(net.params)

        @h(EXPORT_KEY)
        def _export_key(p: bytes) -> bytes:
            ctx = bytes(p[:18])
            key_type = p[0]
            if key_type == 1:  # NETWORK
                key = bytes.fromhex(net.network_key)
            elif key_type == 2:  # TC link key
                key = bytes.fromhex(net.tc_link_key)
            else:
                key = bytes(16)
            if self.session.version >= 0x0E:
                return status() + key + ctx
            return key + status()

        @h(SET_CONCENTRATOR)
        def _concentrator(_p: bytes) -> bytes:
            return status()

        @h(SET_SOURCE_ROUTE_DISCOVERY_MODE)
        def _srd(_p: bytes) -> bytes:
            return u32(0)

        @h(SET_RADIO_POWER)
        def _radio_power(p: bytes) -> bytes:
            net.params["radioTxPower"] = struct.unpack("<b", p[:1])[0]
            return status()

        @h(GET_EUI64)
        def _eui64(_p: bytes) -> bytes:
            return net.coordinator_eui64.to_bytes(8, "little")

        @h(GET_NODE_ID)
        def _node_id(_p: bytes) -> bytes:
            return b"\x00\x00"

        @h(PERMIT_JOINING)
        def _permit(p: bytes) -> bytes:
            net.set_permit_join(p[0])
            return status()

        # runtime commands are registered by ezsp_runtime
        from .ezsp_runtime import register_runtime
        from .ezsp_tables import register_tables

        register_runtime(self)
        register_tables(self)


def decode_network_params(p: bytes) -> dict:
    return {
        "extendedPanId": p[0:8].hex(),
        "panId": struct.unpack_from("<H", p, 8)[0],
        "radioTxPower": struct.unpack_from("<b", p, 10)[0],
        "radioChannel": p[11],
        "joinMethod": p[12],
        "nwkManagerId": struct.unpack_from("<H", p, 13)[0],
        "nwkUpdateId": p[15],
        "channels": struct.unpack_from("<I", p, 16)[0],
    }


def encode_network_params(n: dict) -> bytes:
    return (
        bytes.fromhex(n["extendedPanId"])
        + struct.pack("<HbBBHBI", n["panId"], n["radioTxPower"], n["radioChannel"], n["joinMethod"], n["nwkManagerId"], n["nwkUpdateId"], n["channels"])
    )
