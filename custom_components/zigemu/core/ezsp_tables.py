"""NCP tables and housekeeping commands: address table, key table, multicast
table, extended timeouts, lookups, echo/nop, energy scan, device removal.

These mirror what EmberZNet firmware keeps on the NCP; host drivers (bellows
for ZHA, zigbee-herdsman for Zigbee2MQTT) read and write them, notably when
creating or restoring network backups.
"""

from __future__ import annotations

import random
import struct
from typing import TYPE_CHECKING

from .ezsp import SL_OK, u32

if TYPE_CHECKING:
    from .ezsp import EzspNcp

NOP = 0x0005
SCAN_COMPLETE_HANDLER = 0x001C
START_SCAN = 0x001A
JOIN_NETWORK = 0x001F
SEND_REPLY = 0x0039
ENERGY_SCAN_RESULT_HANDLER = 0x0048
ADDRESS_TABLE_ENTRY_IS_ACTIVE = 0x005B
SET_ADDRESS_TABLE_INFO = 0x005C
GET_ADDRESS_TABLE_INFO = 0x005E
LOOKUP_NODE_ID_BY_EUI64 = 0x0060
LOOKUP_EUI64_BY_NODE_ID = 0x0061
GET_MULTICAST_TABLE_ENTRY = 0x0063
FIND_KEY_TABLE_ENTRY = 0x0075
ERASE_KEY_TABLE_ENTRY = 0x0076
SET_EXTENDED_TIMEOUT = 0x007E
GET_EXTENDED_TIMEOUT = 0x007F
ECHO = 0x0081
GET_BOOTLOADER_VERSION_PLAT_MICRO_PHY = 0x0091
REMOVE_DEVICE = 0x00A8
IMPORT_LINK_KEY = 0x010E
SEND_RAW_MESSAGE = 0x0051
BROADCAST_NEXT_NETWORK_KEY = 0x0073
BROADCAST_NETWORK_KEY_SWITCH = 0x0074
SET_RADIO_IEEE802154_CCA_MODE = 0x0095
RESET_NODE = 0x0104
GET_NEIGHBOR = 0x0079
NEIGHBOR_COUNT = 0x007A

SL_NOT_FOUND = 0x000E
SL_INVALID_INDEX = 0x0027
SL_INVALID_STATE = 0x0002
SL_TABLE_FULL = 0x0B05  # SL_STATUS_TABLE_FULL (EmberZNet)
NULL_NODE_ID = 0xFFFF
NULL_INDEX = 0xFF
SCAN_ENERGY = 0
SCAN_ACTIVE = 1

CONFIG_ADDRESS_TABLE_SIZE = 0x05
CONFIG_KEY_TABLE_SIZE = 0x1E


def register_tables(ncp: EzspNcp) -> None:
    h = ncp.handler
    net = ncp.net
    st = ncp.status_width

    def addr_table_size() -> int:
        return ncp.session.config.get(CONFIG_ADDRESS_TABLE_SIZE, 16)

    def key_table_size() -> int:
        return ncp.session.config.get(CONFIG_KEY_TABLE_SIZE, 12)

    # ------------------------------------------------------------- basics
    @h(NOP)
    def _nop(_p: bytes) -> bytes:
        return b""

    @h(ECHO)
    def _echo(p: bytes) -> bytes:
        return bytes([p[0]]) + p[1 : 1 + p[0]]

    @h(GET_BOOTLOADER_VERSION_PLAT_MICRO_PHY)
    def _bootloader(_p: bytes) -> bytes:
        # 0xFFFF: no standalone bootloader; EM3xx/EFR32-ish platform ids
        return struct.pack("<HBBB", 0xFFFF, 4, 3, 0)

    @h(JOIN_NETWORK)
    def _join(_p: bytes) -> bytes:
        return st(SL_INVALID_STATE)  # this NCP runs as coordinator only

    # ------------------------------------------------------- address table
    @h(GET_ADDRESS_TABLE_INFO)
    def _get_addr(p: bytes) -> bytes:
        idx = p[0]
        if idx >= addr_table_size():
            return st(SL_INVALID_INDEX) + struct.pack("<H", NULL_NODE_ID) + bytes(8)
        eui64, nwk = net.address_table.get(idx, (0, NULL_NODE_ID))
        return st(SL_OK) + struct.pack("<H", nwk) + eui64.to_bytes(8, "little")

    @h(SET_ADDRESS_TABLE_INFO)
    def _set_addr(p: bytes) -> bytes:
        idx = p[0]
        if idx >= addr_table_size():
            return st(SL_INVALID_INDEX)
        eui64 = int.from_bytes(p[1:9], "little")
        nwk = struct.unpack_from("<H", p, 9)[0]
        if eui64 in (0, 0xFFFFFFFFFFFFFFFF):
            net.address_table.pop(idx, None)
        else:
            net.address_table[idx] = (eui64, nwk)
        return st(SL_OK)

    @h(ADDRESS_TABLE_ENTRY_IS_ACTIVE)
    def _addr_active(p: bytes) -> bytes:
        return bytes([1 if p[0] in net.address_table else 0])

    @h(LOOKUP_NODE_ID_BY_EUI64)
    def _lookup_nwk(p: bytes) -> bytes:
        nwk = net.lookup_nwk(int.from_bytes(p[0:8], "little"))
        if nwk is None:
            return st(SL_NOT_FOUND) + struct.pack("<H", NULL_NODE_ID)
        return st(SL_OK) + struct.pack("<H", nwk)

    @h(LOOKUP_EUI64_BY_NODE_ID)
    def _lookup_eui(p: bytes) -> bytes:
        eui64 = net.lookup_eui64(struct.unpack_from("<H", p, 0)[0])
        if eui64 is None:
            return st(SL_NOT_FOUND) + bytes(8)
        return st(SL_OK) + eui64.to_bytes(8, "little")

    @h(SET_EXTENDED_TIMEOUT)
    def _set_ext_timeout(p: bytes) -> bytes:
        eui64 = int.from_bytes(p[0:8], "little")
        if p[8]:
            ncp.session.extended_timeouts.add(eui64)
        else:
            ncp.session.extended_timeouts.discard(eui64)
        return st(SL_OK)

    @h(GET_EXTENDED_TIMEOUT)
    def _get_ext_timeout(p: bytes) -> bytes:
        eui64 = int.from_bytes(p[0:8], "little")
        return st(SL_OK if eui64 in ncp.session.extended_timeouts else SL_NOT_FOUND)

    # ----------------------------------------------------- multicast table
    @h(GET_MULTICAST_TABLE_ENTRY)
    def _get_mcast(p: bytes) -> bytes:
        entry = ncp.session.multicast.get(p[0])
        if entry is None:
            return st(SL_OK) + struct.pack("<HBB", 0, 0, 0)  # unused entry: endpoint 0
        return st(SL_OK) + entry

    # ----------------------------------------------------------- key table
    @h(IMPORT_LINK_KEY)
    def _import_link_key(p: bytes) -> bytes:
        idx = p[0]
        eui64 = int.from_bytes(p[1:9], "little")
        key = p[9:25].hex()
        if idx >= key_table_size():
            return u32(SL_INVALID_INDEX)
        net.key_table[idx] = (eui64, key)
        net.save_soon()
        return u32(SL_OK)

    @h(FIND_KEY_TABLE_ENTRY)
    def _find_key(p: bytes) -> bytes:
        eui64 = int.from_bytes(p[0:8], "little")
        for idx, (e, _k) in net.key_table.items():
            if e == eui64:
                return bytes([idx])
        return bytes([NULL_INDEX])

    @h(ERASE_KEY_TABLE_ENTRY)
    def _erase_key(p: bytes) -> bytes:
        if p[0] >= key_table_size():
            return u32(SL_INVALID_INDEX)
        net.key_table.pop(p[0], None)
        net.save_soon()
        return u32(SL_OK)

    # ---------------------------------------------------------- messaging
    @h(SEND_REPLY)
    def _send_reply(p: bytes) -> bytes:
        from .ezsp_runtime import ApsFrame

        sender = struct.unpack_from("<H", p, 0)[0]
        aps = ApsFrame.decode(p, 2)
        length = p[13]
        net.host_send(sender, aps, bytes(p[14 : 14 + length]), broadcast=False)
        return st(SL_OK)

    @h(REMOVE_DEVICE)
    def _remove_device(p: bytes) -> bytes:
        target = int.from_bytes(p[10:18], "little")
        return st(SL_OK if net.remove_device_request(target) else SL_NOT_FOUND)

    @h(SEND_RAW_MESSAGE)
    def _raw(_p: bytes) -> bytes:
        return st(SL_OK)  # sent on air (inter-PAN, e.g. Touchlink); no virtual device listens

    @h(SET_RADIO_IEEE802154_CCA_MODE)
    def _cca(_p: bytes) -> bytes:
        return st(SL_OK)

    # ---------------------------------------------------- network key update
    @h(BROADCAST_NEXT_NETWORK_KEY)
    def _next_key(p: bytes) -> bytes:
        key = bytes(p[0:16])
        if key == bytes(16):  # all zero: let the stack pick a random key
            key = random.randbytes(16)
        net.alternate_network_key = key.hex()
        return st(SL_OK)

    @h(BROADCAST_NETWORK_KEY_SWITCH)
    def _key_switch(_p: bytes) -> bytes:
        if not net.alternate_network_key:
            return st(SL_INVALID_STATE)
        net.network_key = net.alternate_network_key
        net.alternate_network_key = None
        net.network_key_seq = (net.network_key_seq + 1) & 0xFF
        net.save_soon()
        return st(SL_OK)

    @h(RESET_NODE)
    def _reset_node(_p: bytes) -> bytes:
        net.later(net.reboot_ncp, 0.05)
        return b""

    # ------------------------------------------------------- neighbor table
    @h(NEIGHBOR_COUNT)
    def _neighbor_count(_p: bytes) -> bytes:
        return bytes([len(net.neighbors())])

    @h(GET_NEIGHBOR)
    def _get_neighbor(p: bytes) -> bytes:
        # EmberNeighborTableEntry: shortId u16, averageLqi u8, inCost u8, outCost u8, age u8, longId eui64
        neighbors = net.neighbors()
        if p[0] >= len(neighbors):
            return st(SL_NOT_FOUND) + struct.pack("<HBBBB", NULL_NODE_ID, 0, 0, 0, 0) + bytes(8)
        d = neighbors[p[0]]
        return st(SL_OK) + struct.pack("<HBBBB", d.nwk, 220, 1, 1, 3) + d.ieee.to_bytes(8, "little")

    # ---------------------------------------------------------------- scans
    @h(START_SCAN)
    def _start_scan(p: bytes) -> bytes:
        scan_type = p[0]
        mask = struct.unpack_from("<I", p, 1)[0]
        channels = [c for c in range(11, 27) if mask & (1 << c)]

        def run() -> None:
            if scan_type == SCAN_ENERGY:
                rng = random.Random(net.coordinator_eui64)
                for ch in channels:
                    rssi = rng.randint(-95, -70)
                    if ch == net.params.get("radioChannel"):
                        rssi = -60  # our own network's traffic
                    ncp.callback(ENERGY_SCAN_RESULT_HANDLER, bytes([ch]) + struct.pack("<b", rssi))
            # active scan: no other networks are on the air
            ncp.callback(SCAN_COMPLETE_HANDLER, bytes([channels[-1] if channels else 0]) + st(SL_OK))

        net.later(run, 0.3)
        return st(SL_OK)
