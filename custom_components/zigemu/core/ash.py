"""ASH (Asynchronous Serial Host) protocol, NCP side.

Implements what EZSP host drivers (bellows for ZHA, zigbee-herdsman's `ember`
adapter for Zigbee2MQTT) need over a reliable TCP stream: framing, byte stuffing, CRC, data randomization, RST /
RSTACK handshake, DATA sequencing and ACKs. Retransmission is not needed on
TCP, so it is not implemented (a NAK from the host is logged).
"""

from __future__ import annotations

import logging
from typing import Callable

_LOGGER = logging.getLogger(__name__)

FLAG = 0x7E
ESCAPE = 0x7D
XON = 0x11
XOFF = 0x13
SUBSTITUTE = 0x18
CANCEL = 0x1A
FLIP = 0x20
RESERVED = {FLAG, ESCAPE, XON, XOFF, SUBSTITUTE, CANCEL}

CTRL_RST = 0xC0
CTRL_RSTACK = 0xC1
CTRL_ERROR = 0xC2
ASH_VERSION = 0x02
RESET_SOFTWARE = 0x0B  # reset cause reported in RSTACK (software reset)

LFSR_SEED = 0x42
LFSR_POLY = 0xB8


def crc16(data: bytes) -> int:
    """CRC-16/CCITT-FALSE."""
    crc = 0xFFFF
    for b in data:
        crc ^= b << 8
        for _ in range(8):
            crc = ((crc << 1) ^ 0x1021) & 0xFFFF if crc & 0x8000 else (crc << 1) & 0xFFFF
    return crc


def randomize(data: bytes) -> bytes:
    out = bytearray(data)
    seed = LFSR_SEED
    for i in range(len(out)):
        out[i] ^= seed
        seed = (seed >> 1) ^ LFSR_POLY if seed & 1 else seed >> 1
    return bytes(out)


def stuff(data: bytes) -> bytes:
    out = bytearray()
    for b in data:
        if b in RESERVED:
            out += bytes([ESCAPE, b ^ FLIP])
        else:
            out.append(b)
    return bytes(out)


def unstuff(data: bytes) -> bytes | None:
    """Unstuff a frame body (without FLAG). None if it contained SUBSTITUTE."""
    out = bytearray()
    flip = 0
    for b in data:
        if b == ESCAPE:
            flip = FLIP
        elif b == SUBSTITUTE:
            return None
        elif b in (XON, XOFF):
            continue
        else:
            out.append(b ^ flip)
            flip = 0
    return bytes(out)


def build_frame(body: bytes) -> bytes:
    crc = crc16(body)
    return stuff(body + bytes([crc >> 8, crc & 0xFF])) + bytes([FLAG])


class AshNcp:
    """NCP-side ASH state machine.

    `write` sends raw bytes to the host; `on_data` receives each EZSP frame
    (derandomized) from the host; `on_reset` is called when the host resets
    the link.
    """

    def __init__(
        self,
        write: Callable[[bytes], None],
        on_data: Callable[[bytes], None],
        on_reset: Callable[[], None] | None = None,
    ) -> None:
        self._write = write
        self._on_data = on_data
        self._on_reset = on_reset or (lambda: None)
        self._buf = bytearray()
        self._reset_state()
        self.connected = False

    def _reset_state(self) -> None:
        self._tx_seq = 0  # next frmNum we send
        self._rx_ack = 0  # next frmNum expected from host
        self._rejecting = False

    # ------------------------------------------------------------- receiving
    def feed(self, data: bytes) -> None:
        self._buf += data
        while True:
            idx = self._buf.find(bytes([FLAG]))
            if idx < 0:
                # CANCEL with no flag yet: drop everything before it
                c = self._buf.rfind(bytes([CANCEL]))
                if c >= 0:
                    del self._buf[: c + 1]
                return
            raw = bytes(self._buf[:idx])
            del self._buf[: idx + 1]
            c = raw.rfind(bytes([CANCEL]))
            if c >= 0:
                raw = raw[c + 1 :]
            raw = raw.lstrip(b"\xff")
            if raw:
                self._handle_raw(raw)

    def _handle_raw(self, raw: bytes) -> None:
        frame = unstuff(raw)
        if frame is None or len(frame) < 3:
            _LOGGER.debug("ASH: dropping invalid frame %s", raw.hex())
            return
        body, crc = frame[:-2], frame[-2:]
        if crc16(body) != (crc[0] << 8 | crc[1]):
            _LOGGER.debug("ASH: bad CRC %s", frame.hex())
            if body and not body[0] & 0x80:
                self._send_nak()
            return
        ctrl = body[0]
        if ctrl == CTRL_RST:
            _LOGGER.debug("ASH: RST received")
            self._reset_state()
            self.connected = True
            self._write(build_frame(bytes([CTRL_RSTACK, ASH_VERSION, RESET_SOFTWARE])))
            self._on_reset()
        elif ctrl & 0x80 == 0:
            self._handle_data(ctrl, body[1:])
        elif ctrl & 0xE0 == 0x80:
            pass  # ACK: nothing to retransmit on TCP
        elif ctrl & 0xE0 == 0xA0:
            _LOGGER.warning("ASH: NAK from host (ackNum=%d)", ctrl & 0x07)
        else:
            _LOGGER.debug("ASH: unexpected control 0x%02x", ctrl)

    def _handle_data(self, ctrl: int, payload: bytes) -> None:
        frm = (ctrl >> 4) & 0x07
        retx = bool(ctrl & 0x08)
        if frm == self._rx_ack:
            self._rx_ack = (self._rx_ack + 1) & 0x07
            self._rejecting = False
            self._send_ack()
            self._on_data(randomize(payload))
        elif retx and frm == (self._rx_ack - 1) & 0x07:
            self._send_ack()  # duplicate, already processed
        elif not self._rejecting:
            self._rejecting = True
            self._send_nak()

    def _send_ack(self) -> None:
        self._write(build_frame(bytes([0x80 | self._rx_ack])))

    def _send_nak(self) -> None:
        self._write(build_frame(bytes([0xA0 | self._rx_ack])))

    def announce_reset(self) -> None:
        """Unsolicited RSTACK, as sent by the NCP after it rebooted."""
        self._reset_state()
        self._write(build_frame(bytes([CTRL_RSTACK, ASH_VERSION, RESET_SOFTWARE])))

    # --------------------------------------------------------------- sending
    def send(self, ezsp_frame: bytes) -> None:
        if not self.connected:
            return
        ctrl = (self._tx_seq << 4) | self._rx_ack
        self._tx_seq = (self._tx_seq + 1) & 0x07
        self._write(build_frame(bytes([ctrl]) + randomize(ezsp_frame)))
