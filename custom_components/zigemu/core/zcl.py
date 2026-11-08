"""Minimal ZCL (Zigbee Cluster Library) codec used by emulated devices."""

from __future__ import annotations

import struct
from dataclasses import dataclass, field
from typing import Any

# --- Data types -----------------------------------------------------------

# name -> (type id, fixed size or None for variable)
DATA_TYPES: dict[str, tuple[int, int | None]] = {
    "nodata": (0x00, 0),
    "data8": (0x08, 1),
    "data16": (0x09, 2),
    "bool": (0x10, 1),
    "bitmap8": (0x18, 1),
    "bitmap16": (0x19, 2),
    "bitmap24": (0x1A, 3),
    "bitmap32": (0x1B, 4),
    "uint8": (0x20, 1),
    "uint16": (0x21, 2),
    "uint24": (0x22, 3),
    "uint32": (0x23, 4),
    "uint48": (0x25, 6),
    "uint56": (0x26, 7),
    "uint64": (0x27, 8),
    "int48": (0x2D, 6),
    "int8": (0x28, 1),
    "int16": (0x29, 2),
    "int24": (0x2A, 3),
    "int32": (0x2B, 4),
    "enum8": (0x30, 1),
    "enum16": (0x31, 2),
    "single": (0x39, 4),
    "octstr": (0x41, None),
    "charstr": (0x42, None),
    "ieee": (0xF0, 8),
    "array": (0x48, None),  # value: hex of elementType u8 + count u16 + elements
}
TYPE_BY_ID = {v[0]: k for k, v in DATA_TYPES.items()}
SIGNED = {"int8", "int16", "int24", "int32", "int48"}

STATUS_SUCCESS = 0x00
STATUS_UNSUP_CLUSTER_COMMAND = 0x81
STATUS_UNSUPPORTED_ATTRIBUTE = 0x86
STATUS_READ_ONLY = 0x88


def encode_value(type_name: str, value: Any) -> bytes:
    if type_name == "nodata":
        return b""
    if type_name == "charstr":
        raw = str(value).encode()
        return bytes([len(raw)]) + raw
    if type_name == "array":
        return bytes.fromhex(value) if isinstance(value, str) else bytes(value)
    if type_name == "octstr":
        raw = bytes(value) if not isinstance(value, str) else bytes.fromhex(value)
        return bytes([len(raw)]) + raw
    if type_name == "single":
        return struct.pack("<f", float(value))
    if type_name == "ieee":
        if isinstance(value, str):
            return bytes.fromhex(value.replace(":", "").removeprefix("0x"))[::-1]
        return int(value).to_bytes(8, "little")
    if type_name == "bool":
        return bytes([1 if value else 0])
    size = DATA_TYPES[type_name][1]
    assert size is not None
    return int(value).to_bytes(size, "little", signed=type_name in SIGNED)


def decode_value(type_name: str, data: bytes, offset: int = 0) -> tuple[Any, int]:
    """Return (value, new_offset)."""
    if type_name == "array":
        size = _array_size(data, offset)
        return data[offset : offset + size].hex(), offset + size
    if type_name in ("charstr", "octstr"):
        length = data[offset]
        raw = data[offset + 1 : offset + 1 + length]
        val: Any = raw.decode(errors="replace") if type_name == "charstr" else raw.hex()
        return val, offset + 1 + length
    if type_name == "single":
        return struct.unpack_from("<f", data, offset)[0], offset + 4
    size = DATA_TYPES[type_name][1]
    assert size is not None
    raw = data[offset : offset + size]
    if type_name == "ieee":
        return raw[::-1].hex(), offset + size
    return int.from_bytes(raw, "little", signed=type_name in SIGNED), offset + size


def type_size(type_id: int, data: bytes, offset: int) -> int:
    name = TYPE_BY_ID.get(type_id)
    if name is None:
        raise ValueError(f"unknown ZCL type 0x{type_id:02x}")
    size = DATA_TYPES[name][1]
    if name == "array":
        return _array_size(data, offset)
    if size is None:
        return 1 + data[offset]
    return size


def _array_size(data: bytes, offset: int) -> int:
    """ZCL array: element type u8, element count u16, then elements."""
    elem = TYPE_BY_ID.get(data[offset])
    count = int.from_bytes(data[offset + 1 : offset + 3], "little")
    if count == 0xFFFF:  # invalid/empty
        return 3
    off = offset + 3
    for _ in range(count):
        off += type_size(data[offset], data, off) if elem else 1
    return off - offset


# --- Frame ----------------------------------------------------------------

FC_CLUSTER_SPECIFIC = 0x01
FC_MANUF_SPECIFIC = 0x04
FC_SERVER_TO_CLIENT = 0x08
FC_DISABLE_DEFAULT_RSP = 0x10

# Global (profile-wide) command ids
CMD_READ_ATTR = 0x00
CMD_READ_ATTR_RSP = 0x01
CMD_WRITE_ATTR = 0x02
CMD_WRITE_ATTR_UNDIV = 0x03
CMD_WRITE_ATTR_RSP = 0x04
CMD_WRITE_ATTR_NORSP = 0x05
CMD_CONFIG_REPORT = 0x06
CMD_CONFIG_REPORT_RSP = 0x07
CMD_READ_REPORT_CFG = 0x08
CMD_READ_REPORT_CFG_RSP = 0x09
CMD_REPORT_ATTR = 0x0A
CMD_DEFAULT_RSP = 0x0B
CMD_DISCOVER_ATTR = 0x0C
CMD_DISCOVER_ATTR_RSP = 0x0D


@dataclass
class ZclFrame:
    frame_control: int
    tsn: int
    command_id: int
    payload: bytes = b""
    manufacturer_code: int | None = None

    @property
    def cluster_specific(self) -> bool:
        return bool(self.frame_control & FC_CLUSTER_SPECIFIC)

    @property
    def server_to_client(self) -> bool:
        return bool(self.frame_control & FC_SERVER_TO_CLIENT)

    @property
    def disable_default_rsp(self) -> bool:
        return bool(self.frame_control & FC_DISABLE_DEFAULT_RSP)

    def encode(self) -> bytes:
        fc = self.frame_control & ~FC_MANUF_SPECIFIC
        out = bytearray()
        if self.manufacturer_code is not None:
            fc |= FC_MANUF_SPECIFIC
            out += bytes([fc]) + self.manufacturer_code.to_bytes(2, "little")
        else:
            out.append(fc)
        out += bytes([self.tsn & 0xFF, self.command_id])
        out += self.payload
        return bytes(out)

    @classmethod
    def decode(cls, data: bytes) -> ZclFrame:
        fc = data[0]
        off = 1
        manuf = None
        if fc & FC_MANUF_SPECIFIC:
            manuf = int.from_bytes(data[1:3], "little")
            off = 3
        return cls(fc, data[off], data[off + 1], bytes(data[off + 2 :]), manuf)


@dataclass
class Attribute:
    id: int
    type: str
    value: Any
    writable: bool = False


@dataclass
class ClusterState:
    id: int
    attributes: dict[int, Attribute] = field(default_factory=dict)
