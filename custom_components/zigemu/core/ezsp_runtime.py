"""Runtime EZSP: outgoing sends from the host, and NCP -> host callbacks."""

from __future__ import annotations

import struct
from dataclasses import dataclass
from typing import TYPE_CHECKING

from .ezsp import SL_NOT_JOINED as SL_FAIL_NOT_JOINED, SL_OK, status, u32

if TYPE_CHECKING:
    from .ezsp import EzspNcp

CALLBACK = 0x0006
NETWORK_STATE = 0x0018
SEND_UNICAST = 0x0034
SEND_BROADCAST = 0x0036
SEND_MULTICAST = 0x0038
CLEAR_TRANSIENT_LINK_KEYS = 0x006B
IMPORT_TRANSIENT_KEY = 0x0111
GET_NETWORK_KEY_INFO = 0x0116
GET_APS_KEY_INFO = 0x010C
SET_LOGICAL_AND_RADIO_CHANNEL = 0x00B9
CUSTOM_FRAME = 0x0047
GET_MFG_TOKEN = 0x000B
GP_CLEAR_PROXY_TABLE = 0x005F
GET_CURRENT_SECURITY_STATE = 0x0069
TOKEN_FACTORY_RESET = 0x0077
GP_SINK_TABLE_CLEAR_ALL = 0x00E2
READ_COUNTERS = 0x00F1
READ_AND_CLEAR_COUNTERS = 0x0065
GET_TOKEN_DATA = 0x0102
EXPORT_LINK_KEY_BY_INDEX = 0x010F
GET_CHILD_DATA = 0x004A
SET_CHILD_DATA = 0x00AC
EXPORT_LINK_KEY_BY_EUI = 0x010D
SET_TOKEN_DATA = 0x0103
SL_NOT_SUPPORTED = 0x000F
SL_NOT_FOUND = 0x000E
COUNTER_TYPE_COUNT = 41

# NVM3 token holding the EUI64 a host restored onto this NCP (applied on next reset)
NV3_CREATOR_STACK_RESTORED_EUI64 = 0xE12A
# Manufacturing token sizes (unprogrammed tokens read back as 0xFF)
MFG_TOKEN_SIZES = {0: 2, 1: 16, 2: 16, 3: 2, 4: 2, 5: 16, 6: 40, 7: 8, 8: 2, 9: 92, 10: 20, 11: 2, 12: 8, 13: 2}
MFG_STRING = 1
MFG_BOARD_NAME = 2
MFG_MANUF_ID = 3

# callbacks
CHILD_JOIN_HANDLER = 0x0023
TRUST_CENTER_JOIN_HANDLER = 0x0024
MESSAGE_SENT_HANDLER = 0x003F
INCOMING_MESSAGE_HANDLER = 0x0045
STACK_STATUS_HANDLER = 0x0019

# EmberIncomingMessageType
IN_UNICAST = 0
IN_BROADCAST = 4
# EmberOutgoingMessageType
OUT_DIRECT = 0
OUT_MULTICAST = 3
OUT_BROADCAST = 4

APS_OPTIONS_DEFAULT = 0x0140
POLICY_MESSAGE_CONTENTS_IN_CALLBACK = 0x04
DECISION_TAG_AND_CONTENTS = 0x41
NETWORK_STATUS_JOINED = 0x02


@dataclass
class ApsFrame:
    profile_id: int
    cluster_id: int
    src_ep: int
    dst_ep: int
    options: int = APS_OPTIONS_DEFAULT
    group_id: int = 0
    sequence: int = 0

    def encode(self) -> bytes:
        return struct.pack(
            "<HHBBHHB", self.profile_id, self.cluster_id, self.src_ep, self.dst_ep, self.options, self.group_id, self.sequence
        )

    @classmethod
    def decode(cls, data: bytes, off: int = 0) -> ApsFrame:
        return cls(*struct.unpack_from("<HHBBHHB", data, off))


def register_runtime(ncp: EzspNcp) -> None:
    h = ncp.handler
    net = ncp.net
    v14 = lambda: ncp.session.version >= 0x0E  # noqa: E731

    def send_status(v: int, aps_seq: int) -> bytes:
        return ncp.status_width(v) + bytes([aps_seq])

    @h(SEND_UNICAST)
    def _unicast(p: bytes) -> bytes:
        msg_type = p[0]
        dest = struct.unpack_from("<H", p, 1)[0]
        aps = ApsFrame.decode(p, 3)
        off = 14
        if v14():
            tag = struct.unpack_from("<H", p, off)[0]
            off += 2
        else:
            tag = p[off]
            off += 1
        length = p[off]
        payload = bytes(p[off + 1 : off + 1 + length])
        aps.sequence = net.next_aps_seq()
        ok = net.host_send(dest, aps, payload, broadcast=False)
        net.later(lambda: message_sent(ncp, SL_OK if ok else 0x0C02, msg_type, dest, aps, tag, payload))
        return send_status(SL_OK, aps.sequence)

    @h(SEND_BROADCAST)
    def _broadcast(p: bytes) -> bytes:
        if v14():
            _alias, dest, _nwk_seq = struct.unpack_from("<HHB", p, 0)
            aps = ApsFrame.decode(p, 5)
            off = 16
            _radius = p[off]
            tag = struct.unpack_from("<H", p, off + 1)[0]
            off += 3
        else:
            dest = struct.unpack_from("<H", p, 0)[0]
            aps = ApsFrame.decode(p, 2)
            off = 13
            tag = p[off + 1]
            off += 2
        length = p[off]
        payload = bytes(p[off + 1 : off + 1 + length])
        aps.sequence = net.next_aps_seq()
        net.host_send(dest, aps, payload, broadcast=True)
        net.later(lambda: message_sent(ncp, SL_OK, OUT_BROADCAST, dest, aps, tag, payload))
        return send_status(SL_OK, aps.sequence)

    @h(SEND_MULTICAST)
    def _multicast(p: bytes) -> bytes:
        aps = ApsFrame.decode(p, 0)
        if v14():
            off = 11 + 1 + 2 + 2 + 1
            tag = struct.unpack_from("<H", p, off)[0]
            off += 2
        else:
            off = 11 + 2
            tag = p[off]
            off += 1
        length = p[off]
        payload = bytes(p[off + 1 : off + 1 + length])
        aps.sequence = net.next_aps_seq()
        net.host_send(0xFFFD, aps, payload, broadcast=True, group=aps.group_id)
        net.later(lambda: message_sent(ncp, SL_OK, OUT_MULTICAST, aps.group_id, aps, tag, payload))
        return send_status(SL_OK, aps.sequence)

    @h(CLEAR_TRANSIENT_LINK_KEYS)
    def _clear_transient(_p: bytes) -> bytes:
        return b""

    @h(IMPORT_TRANSIENT_KEY)
    def _import_transient(_p: bytes) -> bytes:
        return u32(SL_OK)

    @h(NETWORK_STATE)
    def _network_state(_p: bytes) -> bytes:
        return bytes([NETWORK_STATUS_JOINED if ncp.session.network_up else 0x00])

    @h(CALLBACK)
    def _callback(_p: bytes) -> bytes | None:
        return b""

    @h(GET_NETWORK_KEY_INFO)
    def _nwk_key_info(_p: bytes) -> bytes:
        # status, sl_zb_sec_man_network_key_info_t:
        # networkKeySet bool, alternateNetworkKeySet bool, networkKeySequenceNumber u8,
        # altNetworkKeySequenceNumber u8, networkKeyFrameCounter u32
        return status() + bytes([1, 0, net.network_key_seq, 0]) + u32(net.next_nwk_frame_counter())

    @h(GET_APS_KEY_INFO)
    def _aps_key_info(p: bytes) -> bytes:
        # status, eui64, sl_zb_sec_man_aps_key_metadata_t:
        # bitmask u16, outgoingFrameCounter u32, incomingFrameCounter u32, ttlInSeconds u16
        return status() + bytes(8) + struct.pack("<HIIH", 0, net.tc_frame_counter, 0, 0)

    @h(CUSTOM_FRAME)
    def _custom_frame(_p: bytes) -> bytes:
        # Stock NCP firmware: no custom (XNCP) frame handler.
        return ncp.status_width(SL_NOT_SUPPORTED) + b"\x00"

    @h(GET_MFG_TOKEN)
    def _mfg_token(p: bytes) -> bytes:
        tid = p[0]
        size = MFG_TOKEN_SIZES.get(tid, 0)
        if tid == MFG_STRING:
            val = b"ZigEmu".ljust(size, b"\x00")
        elif tid == MFG_BOARD_NAME:
            val = b"ZigEmu NCP".ljust(size, b"\x00")
        elif tid == MFG_MANUF_ID:
            val = (0x1049).to_bytes(2, "little")
        else:
            val = b"\xff" * size
        return bytes([len(val)]) + val

    @h(GET_TOKEN_DATA)
    def _get_token(p: bytes) -> bytes:
        token, _index = struct.unpack_from("<II", p, 0)
        if token == NV3_CREATOR_STACK_RESTORED_EUI64:
            val = net.restored_eui64.to_bytes(8, "little")
            return u32(SL_OK) + u32(len(val)) + val
        return u32(SL_NOT_FOUND) + u32(0)

    @h(SET_TOKEN_DATA)
    def _set_token(p: bytes) -> bytes:
        token, _index, length = struct.unpack_from("<III", p, 0)
        data = p[12 : 12 + length]
        if token == NV3_CREATOR_STACK_RESTORED_EUI64 and length == 8:
            net.set_restored_eui64(int.from_bytes(data, "little"))
            return u32(SL_OK)
        return u32(SL_NOT_FOUND)

    @h(GET_CHILD_DATA)
    def _get_child_data(p: bytes) -> bytes:
        # EmberChildData: eui64, type u8, id u16, phy u8, power u8, timeout u8, timeoutRemaining u32
        child = net.child_at(p[0])
        if child is None:
            return ncp.status_width(SL_FAIL_NOT_JOINED) + bytes(8 + 1 + 2 + 3 + 4)
        eui64, node_type, nwk = child
        return (
            ncp.status_width(SL_OK)
            + eui64.to_bytes(8, "little")
            + bytes([node_type])
            + struct.pack("<HBBBI", nwk, 0, 0, 8, 0)
        )

    @h(SET_CHILD_DATA)
    def _set_child_data(_p: bytes) -> bytes:
        # Hosts restoring a backup write the child table; children re-announce on their own.
        return ncp.status_width(SL_OK)

    def _no_link_key(ctx: bytes) -> bytes:
        # status, sec-man context (18), plaintext key (16), APS key metadata (12)
        return u32(SL_NOT_FOUND) + ctx.ljust(18, b"\x00")[:18] + bytes(16) + bytes(12)

    def _link_key(idx: int, eui64: int, key_hex: str) -> bytes:
        # context: APP_LINK key type (3), index, derived NONE, eui64, net 0, flags, psa perm
        ctx = struct.pack("<BBH", 3, idx, 0) + eui64.to_bytes(8, "little") + struct.pack("<BBI", 0, 0, 0)
        # metadata: bitmask (KEY_HAS_... ) u16, outgoing FC u32, incoming FC u32, ttl u16
        meta = struct.pack("<HIIH", 0x0003, 0, 0, 0)
        return u32(SL_OK) + ctx + bytes.fromhex(key_hex) + meta

    @h(EXPORT_LINK_KEY_BY_INDEX)
    def _export_link_key_by_index(p: bytes) -> bytes:
        entry = net.key_table.get(p[0])
        if entry is None:
            # empty slot: devices joined with the global trust-center link key
            return _no_link_key(b"")
        return _link_key(p[0], *entry)

    @h(EXPORT_LINK_KEY_BY_EUI)
    def _export_link_key_by_eui(p: bytes) -> bytes:
        eui64 = int.from_bytes(p[0:8], "little")
        for idx, (e, k) in net.key_table.items():
            if e == eui64:
                return _link_key(idx, e, k)
        return _no_link_key(b"")

    @h(TOKEN_FACTORY_RESET)
    def _token_factory_reset(_p: bytes) -> bytes:
        net.token_factory_reset()
        return b""

    @h(GET_CURRENT_SECURITY_STATE)
    def _security_state(_p: bytes) -> bytes:
        if not net.formed:
            return ncp.status_width(SL_FAIL_NOT_JOINED) + b"\x00\x00" + bytes(8)
        # GLOBAL_LINK_KEY | HAVE_TRUST_CENTER_LINK_KEY | TRUST_CENTER_USES_HASHED_LINK_KEY
        bitmask = 0x0004 | 0x0010 | 0x0084
        return ncp.status_width(SL_OK) + struct.pack("<H", bitmask) + net.coordinator_eui64.to_bytes(8, "little")

    @h(READ_COUNTERS)
    def _read_counters(_p: bytes) -> bytes:
        return net.counters_bytes(COUNTER_TYPE_COUNT, clear=False)

    @h(READ_AND_CLEAR_COUNTERS)
    def _read_clear_counters(_p: bytes) -> bytes:
        return net.counters_bytes(COUNTER_TYPE_COUNT, clear=True)

    @h(GP_CLEAR_PROXY_TABLE)
    def _gp_clear_proxy(_p: bytes) -> bytes:
        return b""

    @h(GP_SINK_TABLE_CLEAR_ALL)
    def _gp_clear_sink(_p: bytes) -> bytes:
        return b""

    @h(SET_LOGICAL_AND_RADIO_CHANNEL)
    def _set_channel(p: bytes) -> bytes:
        net.params["radioChannel"] = p[0]
        net.save_soon()
        return status()


# ------------------------------------------------------------------ callbacks
def message_sent(ncp: EzspNcp, sl_status: int, msg_type: int, dest: int, aps: ApsFrame, tag: int, payload: bytes = b"") -> None:
    # Message contents are echoed only if the host asked for them
    # (MESSAGE_CONTENTS_IN_CALLBACK_POLICY = MESSAGE_TAG_AND_CONTENTS_IN_CALLBACK).
    contents = payload if ncp.session.policies.get(POLICY_MESSAGE_CONTENTS_IN_CALLBACK) == DECISION_TAG_AND_CONTENTS else b""
    lv = bytes([len(contents)]) + contents
    if ncp.session.version >= 0x0E:
        params = u32(sl_status) + bytes([msg_type]) + struct.pack("<H", dest) + aps.encode() + struct.pack("<H", tag) + lv
    else:
        params = (
            bytes([msg_type]) + struct.pack("<H", dest) + aps.encode() + bytes([tag & 0xFF, 0 if sl_status == SL_OK else 0x66]) + lv
        )
    ncp.callback(MESSAGE_SENT_HANDLER, params)


def incoming_message(
    ncp: EzspNcp,
    msg_type: int,
    aps: ApsFrame,
    sender: int,
    sender_eui64: int,
    payload: bytes,
    lqi: int = 220,
    rssi: int = -50,
) -> None:
    if ncp.session.version >= 0x0E:
        info = (
            struct.pack("<H", sender)
            + sender_eui64.to_bytes(8, "little")
            + bytes([0xFF, 0xFF, lqi])
            + struct.pack("<bI", rssi, 0)
        )
        params = bytes([msg_type]) + aps.encode() + info + bytes([len(payload)]) + payload
    else:
        params = (
            bytes([msg_type])
            + aps.encode()
            + bytes([lqi])
            + struct.pack("<bH", rssi, sender)
            + bytes([0xFF, 0xFF, len(payload)])
            + payload
        )
    ncp.callback(INCOMING_MESSAGE_HANDLER, params)


def trust_center_join(ncp: EzspNcp, nwk: int, eui64: int, device_status: int = 1, decision: int = 0, parent: int = 0) -> None:
    params = struct.pack("<H", nwk) + eui64.to_bytes(8, "little") + bytes([device_status, decision]) + struct.pack("<H", parent)
    ncp.callback(TRUST_CENTER_JOIN_HANDLER, params)


def child_join(ncp: EzspNcp, index: int, joining: bool, nwk: int, eui64: int, node_type: int) -> None:
    params = bytes([index, 1 if joining else 0]) + struct.pack("<H", nwk) + eui64.to_bytes(8, "little") + bytes([node_type])
    ncp.callback(CHILD_JOIN_HANDLER, params)


def stack_status(ncp: EzspNcp, value: int) -> None:
    ncp.callback(STACK_STATUS_HANDLER, ncp.status_width(value))
