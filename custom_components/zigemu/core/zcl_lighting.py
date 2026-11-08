"""Lighting servers: LevelControl (0x0008) and ColorControl (0x0300), per ZCL ch. 3 / 5.

Implements timed transitions (100 ms ticks, `remainingTime`), continuous
move/stop, the Options/ExecuteIfOff rule (commands that don't switch the light
on are ignored while it is off unless executeIfOff is set in the Options
attribute or overridden in the command), start-up attributes, and color mode
tracking for xy, hue/saturation (normal and enhanced) and color temperature.
"""

from __future__ import annotations

import asyncio
import colorsys
import math
import struct
from typing import Any, Callable

from .zcl_servers import UNSUP_CLUSTER_COMMAND, ClusterServer, OnOffServer, Result

TICK = 0.1  # seconds; transition times are in 1/10 s


def _loop() -> asyncio.AbstractEventLoop | None:
    try:
        return asyncio.get_running_loop()
    except RuntimeError:
        return None


class _Animator:
    """Runs value animations (transitions or continuous moves) on one server."""

    def __init__(self) -> None:
        self._task: asyncio.Task | None = None

    def stop(self) -> None:
        if self._task:
            self._task.cancel()
            self._task = None

    def run(self, step: Callable[[float], bool], on_done: Callable[[], None] | None = None) -> bool:
        """step(dt) -> continue? ; returns False when no loop (applies nothing)."""
        self.stop()
        loop = _loop()
        if loop is None:
            return False

        async def go() -> None:
            try:
                while step(TICK):
                    await asyncio.sleep(TICK)
            finally:
                if on_done:
                    on_done()

        self._task = loop.create_task(go())
        return True


def _execute_if_off(server: ClusterServer, options_attr: int, payload: bytes, offset: int) -> bool:
    """ZCL Options rule: may this command run while the light is off?"""
    onoff = server.device.get_attr(server.ep, OnOffServer.cluster, OnOffServer.ON_OFF)
    if onoff is None or onoff.value:
        return True
    options = server.get(options_attr) or 0
    if len(payload) >= offset + 2:  # optionsMask, optionsOverride present
        mask, override = payload[offset], payload[offset + 1]
        if mask & 0x01:
            options = (options & ~0x01) | (override & 0x01)
    return bool(options & 0x01)


# ------------------------------------------------------------ LevelControl
class LevelServer(ClusterServer):
    cluster = 0x0008
    name = "genLevelCtrl"
    CURRENT_LEVEL, REMAINING_TIME, MIN_LEVEL, MAX_LEVEL = 0x0000, 0x0001, 0x0002, 0x0003
    OPTIONS, ON_OFF_TRANSITION, ON_LEVEL, ON_TRANSITION, OFF_TRANSITION, START_UP_LEVEL = 0x000F, 0x0010, 0x0011, 0x0012, 0x0013, 0x4000

    def __init__(self, *a: Any) -> None:
        super().__init__(*a)
        self.anim = _Animator()

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        return {
            self.CURRENT_LEVEL: ("uint8", 254, False),
            self.REMAINING_TIME: ("uint16", 0, False),
            self.MIN_LEVEL: ("uint8", 1, False),
            self.MAX_LEVEL: ("uint8", 254, False),
            self.OPTIONS: ("bitmap8", 0, True),
            self.ON_OFF_TRANSITION: ("uint16", 0, True),
            self.ON_LEVEL: ("uint8", 0xFF, True),
            self.START_UP_LEVEL: ("uint8", 0xFF, True),
        }

    def _bounds(self) -> tuple[int, int]:
        return int(self.get(self.MIN_LEVEL) or 1), int(self.get(self.MAX_LEVEL) or 254)

    def _onoff(self) -> OnOffServer | None:
        srv = self.device.server(self.ep, OnOffServer.cluster)
        return srv if isinstance(srv, OnOffServer) else None

    def _transition_to(self, target: int, tenths: int, with_onoff: bool) -> None:
        lo, hi = self._bounds()
        target = max(lo, min(hi, target))
        onoff = self._onoff()
        if with_onoff and onoff and target > lo:
            onoff._set_on(True)
        start = float(self.get(self.CURRENT_LEVEL) or lo)
        total = max(0.0, tenths / 10)
        if total == 0 or not self.anim.run(self._make_step(start, target, total), lambda: self._finish(target, with_onoff)):
            self.set(self.CURRENT_LEVEL, target)
            self._finish(target, with_onoff)

    def _make_step(self, start: float, target: int, total: float) -> Callable[[float], bool]:
        elapsed = [0.0]

        def step(dt: float) -> bool:
            elapsed[0] += dt
            frac = min(1.0, elapsed[0] / total)
            self.device.set_attr(self.ep, self.cluster, self.REMAINING_TIME, max(0, round((total - elapsed[0]) * 10)), report=False)
            self.set(self.CURRENT_LEVEL, round(start + (target - start) * frac))
            return frac < 1.0

        return step

    def _finish(self, target: int, with_onoff: bool) -> None:
        self.device.set_attr(self.ep, self.cluster, self.REMAINING_TIME, 0, report=False)
        lo, _ = self._bounds()
        onoff = self._onoff()
        if with_onoff and onoff and target <= lo:
            onoff._set_on(False)

    def _move(self, up: bool, rate: int, with_onoff: bool) -> None:
        lo, hi = self._bounds()
        onoff = self._onoff()
        if with_onoff and onoff and up:
            onoff._set_on(True)
        if rate in (0, 0xFF):
            rate = 50  # default move rate (units/s) when unspecified
        level = [float(self.get(self.CURRENT_LEVEL) or lo)]

        def step(dt: float) -> bool:
            level[0] = min(hi, level[0] + rate * dt) if up else max(lo, level[0] - rate * dt)
            self.set(self.CURRENT_LEVEL, round(level[0]))
            return lo < level[0] < hi

        if not self.anim.run(step, lambda: self._finish(round(level[0]), with_onoff)):
            self.set(self.CURRENT_LEVEL, hi if up else lo)

    def handle(self, cmd: int, payload: bytes) -> Result:
        with_onoff = cmd >= 0x04
        base = cmd - 0x04 if with_onoff else cmd
        opt_offset = {0x00: 3, 0x01: 2, 0x02: 4, 0x03: 0}.get(base, 0)
        if base not in (0x00, 0x01, 0x02, 0x03):
            return Result(UNSUP_CLUSTER_COMMAND)
        if not with_onoff and not _execute_if_off(self, self.OPTIONS, payload, opt_offset):
            return Result()  # ignored while off (still SUCCESS)
        cur = int(self.get(self.CURRENT_LEVEL) or 0)
        if base == 0x00:  # MoveToLevel(level u8, transition u16)
            level, tt = struct.unpack_from("<BH", payload)
            if tt == 0xFFFF:
                tt = int(self.get(self.ON_OFF_TRANSITION) or 0)
            self._transition_to(level, tt, with_onoff)
        elif base == 0x01:  # Move(mode u8, rate u8)
            self._move(payload[0] == 0, payload[1] if len(payload) > 1 else 0xFF, with_onoff)
        elif base == 0x02:  # Step(mode u8, size u8, transition u16)
            mode, size, tt = struct.unpack_from("<BBH", payload)
            self._transition_to(cur + size if mode == 0 else cur - size, 0 if tt == 0xFFFF else tt, with_onoff)
        elif base == 0x03:  # Stop
            self.anim.stop()
            self.device.set_attr(self.ep, self.cluster, self.REMAINING_TIME, 0, report=False)
        return Result()

    def local(self, command: str, **kw: Any) -> None:
        if command == "set":
            self.anim.stop()
            lo, hi = self._bounds()
            self.set(self.CURRENT_LEVEL, max(lo, min(hi, int(kw["value"]))))
        else:
            super().local(command)

    def power_down(self) -> None:
        self.anim.stop()

    def power_up(self) -> None:
        start = self.get(self.START_UP_LEVEL)
        lo, hi = self._bounds()
        if start == 0x00:
            self.set(self.CURRENT_LEVEL, lo)
        elif start not in (None, 0xFF):
            self.set(self.CURRENT_LEVEL, max(lo, min(hi, start)))
        self.device.set_attr(self.ep, self.cluster, self.REMAINING_TIME, 0, report=False)


# ------------------------------------------------------------ ColorControl
MODE_HS, MODE_XY, MODE_CT = 0, 1, 2
CAP_HS, CAP_EHUE, CAP_LOOP, CAP_XY, CAP_CT = 0x01, 0x02, 0x04, 0x08, 0x10


class ColorServer(ClusterServer):
    """Options (serverOptions.lightingColorCtrl): capabilities ("hs","xy","ct","ehue"),
    ctMin / ctMax (mireds)."""

    cluster = 0x0300
    name = "lightingColorCtrl"
    HUE, SAT, REMAINING, X, Y, CT, MODE, OPTIONS = 0x0000, 0x0001, 0x0002, 0x0003, 0x0004, 0x0007, 0x0008, 0x000F
    EHUE, EMODE, LOOP_ACTIVE, CAPS, CT_MIN, CT_MAX, CT_COUPLE_MIN, CT_STARTUP = 0x4000, 0x4001, 0x4002, 0x400A, 0x400B, 0x400C, 0x400D, 0x4010

    def __init__(self, *a: Any) -> None:
        super().__init__(*a)
        self.anim = _Animator()
        caps = self.options.get("capabilities", ["ct"])
        self.caps = (
            (CAP_HS if "hs" in caps else 0)
            | (CAP_EHUE if "ehue" in caps else 0)
            | (CAP_LOOP if "loop" in caps else 0)
            | (CAP_XY if "xy" in caps else 0)
            | (CAP_CT if "ct" in caps else 0)
        )
        self.ct_min = int(self.options.get("ctMin", 153))
        self.ct_max = int(self.options.get("ctMax", 454))

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        attrs: dict[int, tuple[str, Any, bool]] = {
            self.REMAINING: ("uint16", 0, False),
            self.MODE: ("enum8", MODE_CT if self.caps & CAP_CT else MODE_XY, False),
            self.OPTIONS: ("bitmap8", 0, True),
            self.EMODE: ("enum8", MODE_CT if self.caps & CAP_CT else MODE_XY, False),
            self.CAPS: ("bitmap16", self.caps, False),
        }
        if self.caps & (CAP_HS | CAP_EHUE):
            attrs[self.HUE] = ("uint8", 0, False)
            attrs[self.SAT] = ("uint8", 0, False)
        if self.caps & CAP_EHUE:
            attrs[self.EHUE] = ("uint16", 0, False)
        if self.caps & CAP_LOOP:
            attrs[self.LOOP_ACTIVE] = ("uint8", 0, False)
        # currentX / currentY are mandatory
        attrs[self.X] = ("uint16", 0x616B, False)
        attrs[self.Y] = ("uint16", 0x607D, False)
        if self.caps & CAP_CT:
            mid = (self.ct_min + self.ct_max) // 2
            attrs[self.CT] = ("uint16", mid, False)
            attrs[self.CT_MIN] = ("uint16", self.ct_min, False)
            attrs[self.CT_MAX] = ("uint16", self.ct_max, False)
            attrs[self.CT_COUPLE_MIN] = ("uint16", self.ct_min, False)
            attrs[self.CT_STARTUP] = ("uint16", 0xFFFF, True)
        return attrs

    def _mode(self, mode: int) -> None:
        self.set(self.MODE, mode)
        self.set(self.EMODE, mode)

    def _animate(self, targets: dict[int, float], tenths: int) -> None:
        """Interpolate several attributes together over a transition."""
        starts = {aid: float(self.get(aid) or 0) for aid in targets}
        total = max(0.0, tenths / 10)

        def apply(frac: float) -> None:
            for aid, tgt in targets.items():
                self.set(aid, round(starts[aid] + (tgt - starts[aid]) * frac))

        if total == 0:
            self.anim.stop()
            apply(1.0)
            return
        elapsed = [0.0]

        def step(dt: float) -> bool:
            elapsed[0] += dt
            frac = min(1.0, elapsed[0] / total)
            self.device.set_attr(self.ep, self.cluster, self.REMAINING, max(0, round((total - elapsed[0]) * 10)), report=False)
            apply(frac)
            return frac < 1.0

        if not self.anim.run(step, lambda: self.device.set_attr(self.ep, self.cluster, self.REMAINING, 0, report=False)):
            apply(1.0)

    def _move(self, aid: int, rate: float, lo: float, hi: float) -> None:
        val = [float(self.get(aid) or 0)]

        def step(dt: float) -> bool:
            val[0] = max(lo, min(hi, val[0] + rate * dt))
            self.set(aid, round(val[0]))
            return lo < val[0] < hi

        if not self.anim.run(step):
            self.set(aid, round(hi if rate > 0 else lo))

    def _ct_bounds(self, lo: int = 0, hi: int = 0) -> tuple[int, int]:
        return max(self.ct_min, lo or self.ct_min), min(self.ct_max, hi or self.ct_max)

    def handle(self, cmd: int, payload: bytes) -> Result:
        supported = {
            0x00: CAP_HS, 0x01: CAP_HS, 0x02: CAP_HS, 0x03: CAP_HS, 0x04: CAP_HS, 0x05: CAP_HS, 0x06: CAP_HS,
            0x07: CAP_XY, 0x08: CAP_XY, 0x09: CAP_XY, 0x0A: CAP_CT,
            0x40: CAP_EHUE, 0x41: CAP_EHUE, 0x42: CAP_EHUE, 0x43: CAP_EHUE,
            0x44: CAP_LOOP, 0x47: 0, 0x4B: CAP_CT, 0x4C: CAP_CT,
        }  # fmt: skip
        need = supported.get(cmd)
        if need is None or (need and not self.caps & need):
            return Result(UNSUP_CLUSTER_COMMAND)
        opt_off = {0x00: 4, 0x01: 2, 0x02: 4, 0x03: 3, 0x04: 2, 0x05: 4, 0x06: 4, 0x07: 6, 0x08: 4, 0x09: 6,
                   0x0A: 4, 0x40: 5, 0x41: 3, 0x42: 5, 0x43: 5, 0x44: 7, 0x47: 0, 0x4B: 7, 0x4C: 9}.get(cmd, 0)  # fmt: skip
        if not _execute_if_off(self, self.OPTIONS, payload, opt_off):
            return Result()
        if cmd == 0x0A:  # MoveToColorTemperature(ct, tt)
            ct, tt = struct.unpack_from("<HH", payload)
            lo, hi = self._ct_bounds()
            self._mode(MODE_CT)
            self._animate({self.CT: max(lo, min(hi, ct))}, tt)
        elif cmd == 0x4B:  # MoveColorTemperature(mode, rate, min, max)
            mode, rate, mn, mx = struct.unpack_from("<BHHH", payload)
            lo, hi = self._ct_bounds(mn, mx)
            self._mode(MODE_CT)
            if mode == 0:
                self.anim.stop()
            else:
                self._move(self.CT, rate if mode == 1 else -rate, lo, hi)
        elif cmd == 0x4C:  # StepColorTemperature(mode, step, tt, min, max)
            mode, stepsize, tt, mn, mx = struct.unpack_from("<BHHHH", payload)
            lo, hi = self._ct_bounds(mn, mx)
            cur = int(self.get(self.CT) or lo)
            self._mode(MODE_CT)
            self._animate({self.CT: max(lo, min(hi, cur + stepsize if mode == 1 else cur - stepsize))}, tt)
        elif cmd == 0x07:  # MoveToColor(x, y, tt)
            x, y, tt = struct.unpack_from("<HHH", payload)
            self._mode(MODE_XY)
            self._animate({self.X: min(x, 0xFEFF), self.Y: min(y, 0xFEFF)}, tt)
        elif cmd == 0x08:  # MoveColor(rateX, rateY)
            rx, ry = struct.unpack_from("<hh", payload)
            self._mode(MODE_XY)
            if rx == 0 and ry == 0:
                self.anim.stop()
            else:
                self._move(self.X if rx else self.Y, rx or ry, 0, 0xFEFF)
        elif cmd == 0x09:  # StepColor(stepX, stepY, tt)
            sx, sy, tt = struct.unpack_from("<hhH", payload)
            self._mode(MODE_XY)
            x, y = int(self.get(self.X) or 0), int(self.get(self.Y) or 0)
            self._animate({self.X: max(0, min(0xFEFF, x + sx)), self.Y: max(0, min(0xFEFF, y + sy))}, tt)
        elif cmd == 0x00:  # MoveToHue(hue, direction, tt)
            hue, _direction, tt = struct.unpack_from("<BBH", payload)
            self._mode(MODE_HS)
            self._animate({self.HUE: min(hue, 254)}, tt)
        elif cmd == 0x03:  # MoveToSaturation(sat, tt)
            sat, tt = struct.unpack_from("<BH", payload)
            self._mode(MODE_HS)
            self._animate({self.SAT: min(sat, 254)}, tt)
        elif cmd == 0x06:  # MoveToHueAndSaturation(hue, sat, tt)
            hue, sat, tt = struct.unpack_from("<BBH", payload)
            self._mode(MODE_HS)
            self._animate({self.HUE: min(hue, 254), self.SAT: min(sat, 254)}, tt)
        elif cmd in (0x01, 0x04):  # MoveHue / MoveSaturation(mode, rate)
            mode, rate = payload[0], payload[1]
            aid = self.HUE if cmd == 0x01 else self.SAT
            self._mode(MODE_HS)
            if mode == 0:
                self.anim.stop()
            else:
                self._move(aid, rate if mode == 1 else -rate, 0, 254)
        elif cmd in (0x02, 0x05):  # StepHue / StepSaturation(mode, step, tt u8)
            mode, stepsize, tt = struct.unpack_from("<BBB", payload)
            aid = self.HUE if cmd == 0x02 else self.SAT
            cur = int(self.get(aid) or 0)
            self._mode(MODE_HS)
            self._animate({aid: max(0, min(254, cur + stepsize if mode == 1 else cur - stepsize))}, tt)
        elif cmd == 0x40:  # EnhancedMoveToHue(ehue, direction, tt)
            ehue, _d, tt = struct.unpack_from("<HBH", payload)
            self._mode(MODE_HS)
            self._animate({self.EHUE: ehue, self.HUE: ehue >> 8}, tt)
        elif cmd == 0x43:  # EnhancedMoveToHueAndSaturation(ehue, sat, tt)
            ehue, sat, tt = struct.unpack_from("<HBH", payload)
            self._mode(MODE_HS)
            self._animate({self.EHUE: ehue, self.HUE: ehue >> 8, self.SAT: min(sat, 254)}, tt)
        elif cmd in (0x41, 0x42):  # EnhancedMoveHue / EnhancedStepHue
            self._mode(MODE_HS)
            if cmd == 0x41:
                mode, rate = struct.unpack_from("<BH", payload)
                if mode == 0:
                    self.anim.stop()
                else:
                    self._move(self.EHUE, rate if mode == 1 else -rate, 0, 0xFFFF)
            else:
                mode, stepsize, tt = struct.unpack_from("<BHH", payload)
                cur = int(self.get(self.EHUE) or 0)
                self._animate({self.EHUE: (cur + (stepsize if mode == 1 else -stepsize)) % 0x10000}, tt)
        elif cmd == 0x44:  # ColorLoopSet(updateFlags, action, direction, time, startHue)
            flags, action, direction, period, start_hue = struct.unpack_from("<BBBHH", payload)
            if action == 0:  # deactivate
                self.anim.stop()
                self.set(self.LOOP_ACTIVE, 0)
            elif flags & 0x01:  # update action: activate
                if action == 1:
                    self.set(self.EHUE, start_hue)
                self.set(self.LOOP_ACTIVE, 1)
                self._mode(MODE_HS)
                self.device.set_attr(self.ep, self.cluster, self.EMODE, 3)  # enhanced hue
                rate = 65535 / max(1, period or 25) * (1 if direction else -1)
                hue = [float(self.get(self.EHUE) or 0)]

                def step(dt: float) -> bool:
                    hue[0] = (hue[0] + rate * dt) % 65536
                    self.set(self.EHUE, int(hue[0]))
                    self.set(self.HUE, int(hue[0]) >> 8)
                    return True

                self.anim.run(step)
        elif cmd == 0x47:  # StopMoveStep
            self.anim.stop()
            self.device.set_attr(self.ep, self.cluster, self.REMAINING, 0, report=False)
        return Result()

    def power_down(self) -> None:
        self.anim.stop()

    def power_up(self) -> None:
        if self.caps & CAP_CT:
            start = self.get(self.CT_STARTUP)
            if start not in (None, 0xFFFF):
                self._mode(MODE_CT)
                self.set(self.CT, max(self.ct_min, min(self.ct_max, start)))
        self.device.set_attr(self.ep, self.cluster, self.REMAINING, 0, report=False)

    # -------------------------------------------------------- display color
    def view(self) -> dict[str, Any]:
        """Current color for the dashboard's color strip.

        `scale` is "ct" (warm → cool, `pos` 0..1 across the bulb's own range) or
        "hue" (rainbow, `pos` = hue / 360); xy colors are placed by their hue.
        """
        css = self.css_color()
        mode = self.get(self.MODE)
        if mode == MODE_CT and self.caps & CAP_CT:
            ct = int(self.get(self.CT) or self.ct_min)
            span = max(1, self.ct_max - self.ct_min)
            return {
                "scale": "ct",
                "kelvin": round(1e6 / max(1, ct)),
                "pos": round((ct - self.ct_min) / span, 3),  # 0 = coolest (min mireds)
                "minK": round(1e6 / self.ct_max),
                "maxK": round(1e6 / self.ct_min),
                "css": css,
            }
        r, g, b = (int(css[i : i + 2], 16) / 255 for i in (1, 3, 5))
        h, s, _ = colorsys.rgb_to_hsv(r, g, b)
        if mode == MODE_HS:
            s = (self.get(self.SAT) or 0) / 254
        return {"scale": "hue", "hue": round(h * 360), "sat": round(s * 100), "pos": round(h, 3), "css": css, "mode": "hs" if mode == MODE_HS else "xy"}

    def css_color(self) -> str:
        """Approximate sRGB of the current color (for the dashboard)."""
        mode = self.get(self.MODE)
        if mode == MODE_CT and self.caps & CAP_CT:
            return _rgb_hex(*_ct_to_rgb(1e6 / max(1, int(self.get(self.CT) or 370))))
        if mode == MODE_HS:
            h = (self.get(self.EHUE) or 0) / 65535 if self.get(self.EMODE) == 3 else (self.get(self.HUE) or 0) / 254
            r, g, b = colorsys.hsv_to_rgb(h, (self.get(self.SAT) or 0) / 254, 1)
            return _rgb_hex(r * 255, g * 255, b * 255)
        x, y = (self.get(self.X) or 0) / 65536, (self.get(self.Y) or 0) / 65536
        return _rgb_hex(*_xy_to_rgb(x, y))


def _rgb_hex(r: float, g: float, b: float) -> str:
    return "#{:02x}{:02x}{:02x}".format(*(max(0, min(255, round(v))) for v in (r, g, b)))


def _ct_to_rgb(kelvin: float) -> tuple[float, float, float]:
    t = kelvin / 100
    r = 255 if t <= 66 else 329.698727446 * ((t - 60) ** -0.1332047592)
    g = 99.4708025861 * math.log(t) - 161.1195681661 if t <= 66 else 288.1221695283 * ((t - 60) ** -0.0755148492)
    b = 255 if t >= 66 else (0 if t <= 19 else 138.5177312231 * math.log(t - 10) - 305.0447927307)
    return r, g, b


def _xy_to_rgb(x: float, y: float) -> tuple[float, float, float]:
    if y <= 0:
        return 0, 0, 0
    big_y = 1.0
    big_x, big_z = big_y / y * x, big_y / y * (1 - x - y)
    r = big_x * 1.656492 - big_y * 0.354851 - big_z * 0.255038
    g = -big_x * 0.707196 + big_y * 1.655397 + big_z * 0.036152
    b = big_x * 0.051713 - big_y * 0.121364 + big_z * 1.011530
    m = max(r, g, b, 1e-9)
    r, g, b = (max(0.0, c / m) for c in (r, g, b))
    gamma = lambda c: 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055  # noqa: E731
    return gamma(r) * 255, gamma(g) * 255, gamma(b) * 255


# ------------------------------------------------------- Hue 0xFC03 (state blob)
# Hue Bluetooth-generation lights expose their whole light state as one
# manufacturer attribute (manuSpecificPhilips2 / 0xFC03, attribute 0x0002,
# octet string) and accept the same encoding as command 0x00 ("multiColor").
# Layout (zigbee-herdsman-converters lib/philips.js HUE_DATA_TYPES): uint16 flags,
# then, in this order, the fields whose flag is set:
#   0x01 on/off u8 · 0x02 brightness u8 · 0x04 color temperature (mired) u16 ·
#   0x08 color xy (2 × u16, /65535) · 0x10 fade speed u16 (1/10 s) · 0x20 effect u8 ·
#   0x100 gradient colors (len-prefixed) · 0x80 effect speed u8 · 0x40 gradient params (2 × u8)
HUE_ON_OFF, HUE_BRIGHTNESS, HUE_MIREK, HUE_XY, HUE_FADE, HUE_EFFECT = 0x01, 0x02, 0x04, 0x08, 0x10, 0x20
HUE_GRADIENT_PARAMS, HUE_EFFECT_SPEED, HUE_GRADIENT_COLORS = 0x40, 0x80, 0x100


class _LiveHueState:
    """Attribute 0x0002 computed from the light's current state on every read."""

    def __init__(self, server: HueStateServer) -> None:
        self.id = HueStateServer.STATE
        self.type = "octstr"
        self.writable = True
        self._server = server

    @property
    def value(self) -> bytes:
        return self._server.encode()

    @value.setter
    def value(self, blob: bytes) -> None:  # a host writing the attribute sets the state
        self._server.apply(bytes(blob))


class HueStateServer(ClusterServer):
    cluster = 0xFC03
    name = "manuSpecificPhilips2"
    STATE = 0x0002

    def __init__(self, *a: Any) -> None:
        super().__init__(*a)
        self.effect = 0

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        return {self.STATE: ("octstr", b"", True)}

    def _install(self) -> None:
        ep = self.device.endpoints.get(self.ep)
        state = ep.clusters.get(self.cluster) if ep else None
        if state is not None and not isinstance(state.attributes.get(self.STATE), _LiveHueState):
            state.attributes[self.STATE] = _LiveHueState(self)  # type: ignore[assignment]

    def start(self) -> None:
        self._install()

    def power_up(self) -> None:
        self._install()

    def _attr(self, cid: int, aid: int) -> Any:
        a = self.device.get_attr(self.ep, cid, aid)
        return a.value if a else None

    def encode(self) -> bytes:
        flags = HUE_ON_OFF | HUE_BRIGHTNESS
        body = bytes([1 if self._attr(0x0006, 0x0000) else 0, max(1, min(254, int(self._attr(0x0008, 0x0000) or 254)))])
        mode = self._attr(0x0300, ColorServer.MODE)
        if mode == MODE_CT and self._attr(0x0300, ColorServer.CT) is not None:
            flags |= HUE_MIREK
            body += struct.pack("<H", int(self._attr(0x0300, ColorServer.CT)))
        elif mode is not None and self._attr(0x0300, ColorServer.X) is not None:
            flags |= HUE_XY
            body += struct.pack("<HH", int(self._attr(0x0300, ColorServer.X)), int(self._attr(0x0300, ColorServer.Y)))
        if self.effect:
            flags |= HUE_EFFECT
            body += bytes([self.effect])
        return struct.pack("<H", flags) + body

    def apply(self, blob: bytes) -> None:
        if len(blob) < 2:
            raise ValueError("short Hue state")
        flags = struct.unpack_from("<H", blob)[0]
        p = 2
        fields: dict[str, Any] = {}

        def take(fmt: str) -> tuple[Any, ...]:
            nonlocal p
            vals = struct.unpack_from(fmt, blob, p)
            p += struct.calcsize(fmt)
            return vals

        if flags & HUE_ON_OFF:
            fields["on"] = bool(take("<B")[0])
        if flags & HUE_BRIGHTNESS:
            fields["level"] = take("<B")[0]
        if flags & HUE_MIREK:
            fields["mirek"] = take("<H")[0]
        if flags & HUE_XY:
            fields["xy"] = take("<HH")
        if flags & HUE_FADE:
            take("<H")  # transition: applied instantly
        if flags & HUE_EFFECT:
            self.effect = take("<B")[0]
        dev, ep = self.device, self.ep
        if "level" in fields:
            dev.set_attr(ep, 0x0008, 0x0000, max(1, min(254, fields["level"])))
        color = dev.server(ep, 0x0300)
        if color is not None:
            if "mirek" in fields and color.caps & CAP_CT:
                lo, hi = color.ct_min, color.ct_max
                color.set(ColorServer.CT, max(lo, min(hi, fields["mirek"])))
                color._mode(MODE_CT)
            elif "xy" in fields:
                color.set(ColorServer.X, fields["xy"][0])
                color.set(ColorServer.Y, fields["xy"][1])
                color._mode(MODE_XY)
        if "on" in fields:
            dev.set_attr(ep, 0x0006, 0x0000, 1 if fields["on"] else 0)

    def handle(self, cmd: int, payload: bytes) -> Result:
        if cmd != 0x00:  # multiColor
            return Result(UNSUP_CLUSTER_COMMAND)
        self.apply(payload)  # raw blob (zigbee-herdsman BUFFER parameter: no length prefix)
        return Result()


LIGHTING_SERVERS = (LevelServer, ColorServer, HueStateServer)
