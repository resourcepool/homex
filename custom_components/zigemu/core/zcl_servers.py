"""Server-side ZCL cluster behaviour, per the ZCL specification.

A device gets a server for each of its input clusters that has one here
(OnOff, LevelControl, Identify, Groups, Scenes, and the electricity meter
pair ElectricalMeasurement + Metering). Servers provide default attributes,
handle cluster commands (with the spec's responses and statuses), and react
to physical inputs (a local button, a load change, a power cycle).

Profiles override attribute values and pass options in an endpoint's
`serverOptions`, keyed by cluster name.
"""

from __future__ import annotations

import asyncio
import random
import struct
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from . import zcl

if TYPE_CHECKING:
    from .device import SimDevice

SUCCESS = 0x00
FAILURE = 0x01
INVALID_FIELD = 0x85
UNSUP_CLUSTER_COMMAND = 0x81
INSUFFICIENT_SPACE = 0x89
DUPLICATE_EXISTS = 0x8A
NOT_FOUND = 0x8B
INVALID_VALUE = 0x87


@dataclass
class Result:
    """Outcome of a cluster command.

    `response` is a cluster-specific response (command id, payload); when it
    is None the device sends a Default Response carrying `status` (unless the
    request disabled it and the status is SUCCESS).
    """

    status: int = SUCCESS
    response: tuple[int, bytes] | None = None


def _loop() -> asyncio.AbstractEventLoop | None:
    try:
        return asyncio.get_running_loop()
    except RuntimeError:
        return None


class ClusterServer:
    cluster = -1
    name = ""

    def __init__(self, device: SimDevice, ep: int, options: dict[str, Any]) -> None:
        self.device = device
        self.ep = ep
        self.options = options

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        """Default attributes: id -> (type, value, writable)."""
        return {}

    def handle(self, cmd: int, payload: bytes) -> Result:
        return Result(UNSUP_CLUSTER_COMMAND)

    def local(self, command: str, **kw: Any) -> None:
        """Physical input acting on this cluster (button, dial…)."""
        raise ValueError(f"{self.name}: unknown local command {command!r}")

    def power_up(self) -> None:
        """Called when mains power comes back (device reboots)."""

    def power_down(self) -> None:
        """Called when power is cut: stop timers."""

    def start(self) -> None:
        """Runtime start (event loop running, device powered): start timers/models."""

    def persist(self) -> dict[str, Any]:
        return {}

    def restore(self, data: dict[str, Any]) -> None:
        pass

    # helpers
    def get(self, aid: int) -> Any:
        a = self.device.get_attr(self.ep, self.cluster, aid)
        return a.value if a else None

    def set(self, aid: int, value: Any) -> None:
        self.device.set_attr(self.ep, self.cluster, aid, value)


# ---------------------------------------------------------------- Identify
class IdentifyServer(ClusterServer):
    cluster = 0x0003
    name = "genIdentify"
    IDENTIFY_TIME = 0x0000

    def __init__(self, *a: Any) -> None:
        super().__init__(*a)
        self._tick: asyncio.TimerHandle | None = None

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        return {self.IDENTIFY_TIME: ("uint16", 0, True)}

    def _start(self, seconds: int) -> None:
        self.set(self.IDENTIFY_TIME, seconds)
        self._schedule()

    def _schedule(self) -> None:
        if self._tick:
            self._tick.cancel()
            self._tick = None
        loop = _loop()
        if loop and (self.get(self.IDENTIFY_TIME) or 0) > 0:
            self._tick = loop.call_later(1, self._countdown)

    def _countdown(self) -> None:
        self._tick = None
        left = max(0, (self.get(self.IDENTIFY_TIME) or 0) - 1)
        self.set(self.IDENTIFY_TIME, left)
        self._schedule()

    def on_write(self) -> None:
        self._schedule()

    def handle(self, cmd: int, payload: bytes) -> Result:
        if cmd == 0x00:  # Identify(identifyTime)
            self._start(struct.unpack_from("<H", payload)[0])
            return Result()
        if cmd == 0x01:  # IdentifyQuery
            t = self.get(self.IDENTIFY_TIME) or 0
            if t:
                return Result(response=(0x00, struct.pack("<H", t)))  # IdentifyQueryResponse
            return Result()  # not identifying: no response (default rsp only)
        if cmd == 0x40:  # TriggerEffect(effectId, effectVariant)
            effect = payload[0] if payload else 0
            self._start(0 if effect in (0xFE, 0xFF) else 3)  # finish/stop effect, else blink a bit
            return Result()
        return Result(UNSUP_CLUSTER_COMMAND)

    def power_down(self) -> None:
        if self._tick:
            self._tick.cancel()
            self._tick = None

    def power_up(self) -> None:
        self.set(self.IDENTIFY_TIME, 0)


# ------------------------------------------------------------------ OnOff
class OnOffServer(ClusterServer):
    cluster = 0x0006
    name = "genOnOff"
    ON_OFF, GLOBAL_SCENE_CONTROL, ON_TIME, OFF_WAIT_TIME, START_UP_ON_OFF = 0x0000, 0x4000, 0x4001, 0x4002, 0x4003

    def __init__(self, *a: Any) -> None:
        super().__init__(*a)
        self._timer: asyncio.TimerHandle | None = None

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        return {
            self.ON_OFF: ("bool", 0, False),
            self.GLOBAL_SCENE_CONTROL: ("bool", 1, False),
            self.ON_TIME: ("uint16", 0, True),
            self.OFF_WAIT_TIME: ("uint16", 0, True),
            self.START_UP_ON_OFF: ("enum8", 0xFF, True),
        }

    @property
    def is_on(self) -> bool:
        return bool(self.get(self.ON_OFF))

    def _set_on(self, on: bool) -> None:
        if on:
            self.set(self.GLOBAL_SCENE_CONTROL, 1)
        else:
            self.set(self.ON_TIME, 0)
            self._cancel_timer()
        self.set(self.ON_OFF, 1 if on else 0)

    def _cancel_timer(self) -> None:
        if self._timer:
            self._timer.cancel()
            self._timer = None

    def _timed_tick(self) -> None:
        """OnWithTimedOff state machine, 1/10 s resolution (ticks of 0.1 s)."""
        self._timer = None
        on_time = self.get(self.ON_TIME) or 0
        wait = self.get(self.OFF_WAIT_TIME) or 0
        if self.is_on and on_time > 0:
            on_time -= 1
            self.device.set_attr(self.ep, self.cluster, self.ON_TIME, on_time, report=False)
            if on_time == 0:
                self.set(self.ON_OFF, 0)
        elif not self.is_on and wait > 0:
            self.device.set_attr(self.ep, self.cluster, self.OFF_WAIT_TIME, wait - 1, report=False)
        if (self.is_on and (self.get(self.ON_TIME) or 0) > 0) or (not self.is_on and (self.get(self.OFF_WAIT_TIME) or 0) > 0):
            loop = _loop()
            if loop:
                self._timer = loop.call_later(0.1, self._timed_tick)

    def handle(self, cmd: int, payload: bytes) -> Result:
        if cmd == 0x00:  # Off
            self._set_on(False)
        elif cmd == 0x01:  # On
            self._set_on(True)
        elif cmd == 0x02:  # Toggle
            self._set_on(not self.is_on)
        elif cmd == 0x40:  # OffWithEffect(effectId, variant)
            self.set(self.GLOBAL_SCENE_CONTROL, 0)
            self._set_on(False)
        elif cmd == 0x41:  # OnWithRecallGlobalScene
            self._set_on(True)
        elif cmd == 0x42:  # OnWithTimedOff(onOffControl, onTime, offWaitTime)
            if len(payload) < 5:
                return Result(INVALID_FIELD)
            control, on_time, off_wait = struct.unpack_from("<BHH", payload)
            if control & 0x01 and not self.is_on:  # accept only when on
                return Result()
            if (self.get(self.OFF_WAIT_TIME) or 0) > 0 and not self.is_on:
                self.set(self.OFF_WAIT_TIME, min(self.get(self.OFF_WAIT_TIME), off_wait))
                return Result()
            self.set(self.ON_TIME, max(self.get(self.ON_TIME) or 0, on_time))
            self.set(self.OFF_WAIT_TIME, off_wait)
            self.set(self.ON_OFF, 1)
            self._cancel_timer()
            loop = _loop()
            if loop:
                self._timer = loop.call_later(0.1, self._timed_tick)
        else:
            return Result(UNSUP_CLUSTER_COMMAND)
        return Result()

    def local(self, command: str, **kw: Any) -> None:
        cmds = {"off": 0x00, "on": 0x01, "toggle": 0x02}
        if command not in cmds:
            super().local(command)
        self.handle(cmds[command], b"")

    def power_down(self) -> None:
        self._cancel_timer()

    def power_up(self) -> None:
        startup = self.get(self.START_UP_ON_OFF)
        previous = bool(self.get(self.ON_OFF))
        on = {0x00: False, 0x01: True, 0x02: not previous}.get(startup, previous)  # 0xFF: previous
        self.set(self.ON_TIME, 0)
        self.set(self.OFF_WAIT_TIME, 0)
        self.set(self.ON_OFF, 1 if on else 0)


# --------------------------------------------- LevelControl (constants only)
class LevelServer(ClusterServer):
    """Constants used by Scenes; the full server lives in zcl_lighting."""

    cluster = 0x0008
    name = "genLevelCtrl"
    CURRENT_LEVEL, ON_OFF_TRANSITION, ON_LEVEL, START_UP_LEVEL = 0x0000, 0x0010, 0x0011, 0x4000

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        return {
            self.CURRENT_LEVEL: ("uint8", 254, False),
            self.ON_OFF_TRANSITION: ("uint16", 0, True),
            self.ON_LEVEL: ("uint8", 0xFF, True),
            self.START_UP_LEVEL: ("uint8", 0xFF, True),
        }

    def _onoff(self) -> OnOffServer | None:
        srv = self.device.server(self.ep, OnOffServer.cluster)
        return srv if isinstance(srv, OnOffServer) else None

    def _level(self, level: int, with_onoff: bool) -> None:
        level = max(1, min(254, level))
        self.set(self.CURRENT_LEVEL, level)
        onoff = self._onoff()
        if with_onoff and onoff:
            onoff._set_on(level > 1)

    def handle(self, cmd: int, payload: bytes) -> Result:
        base, with_onoff = cmd & 0x03, cmd >= 0x04
        cur = self.get(self.CURRENT_LEVEL) or 0
        if cmd in (0x00, 0x04):  # MoveToLevel(level, transition)
            self._level(payload[0], with_onoff)
        elif cmd in (0x01, 0x05):  # Move(mode, rate): jump to the end (no transitions simulated)
            self._level(254 if payload[0] == 0 else 1, with_onoff)
        elif cmd in (0x02, 0x06):  # Step(mode, size, transition)
            step = payload[1] if len(payload) > 1 else 0
            self._level(cur + step if payload[0] == 0 else cur - step, with_onoff)
        elif cmd in (0x03, 0x07):  # Stop
            pass
        else:
            return Result(UNSUP_CLUSTER_COMMAND)
        del base
        return Result()

    def power_up(self) -> None:
        start = self.get(self.START_UP_LEVEL)
        if start not in (None, 0xFF):
            self.set(self.CURRENT_LEVEL, max(1, min(254, start)))


# ------------------------------------------------------------------ Groups
class GroupsServer(ClusterServer):
    cluster = 0x0004
    name = "genGroups"
    CAPACITY = 16

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        return {0x0000: ("bitmap8", 0x00, False)}  # nameSupport: names not supported

    @property
    def groups(self) -> dict[int, str]:
        return self.device.groups.setdefault(self.ep, {})

    def handle(self, cmd: int, payload: bytes) -> Result:
        if cmd == 0x00:  # AddGroup(groupId, name)
            gid = struct.unpack_from("<H", payload)[0]
            status = self._add(gid)
            return Result(response=(0x00, bytes([status]) + struct.pack("<H", gid)))
        if cmd == 0x01:  # ViewGroup(groupId)
            gid = struct.unpack_from("<H", payload)[0]
            status = SUCCESS if gid in self.groups else NOT_FOUND
            return Result(response=(0x01, bytes([status]) + struct.pack("<H", gid) + b"\x00"))
        if cmd == 0x02:  # GetGroupMembership(count, list)
            count = payload[0] if payload else 0
            asked = [struct.unpack_from("<H", payload, 1 + 2 * i)[0] for i in range(count)]
            mine = sorted(self.groups) if not asked else [g for g in asked if g in self.groups]
            capacity = max(0, self.CAPACITY - len(self.groups))
            body = bytes([capacity, len(mine)]) + b"".join(struct.pack("<H", g) for g in mine)
            return Result(response=(0x02, body))
        if cmd == 0x03:  # RemoveGroup(groupId)
            gid = struct.unpack_from("<H", payload)[0]
            status = SUCCESS if self.groups.pop(gid, None) is not None else NOT_FOUND
            if status == SUCCESS:
                self._remove_scenes(gid)
            return Result(response=(0x03, bytes([status]) + struct.pack("<H", gid)))
        if cmd == 0x04:  # RemoveAllGroups
            for gid in list(self.groups):
                self._remove_scenes(gid)
            self.groups.clear()
            self.device.state_changed()
            return Result()
        if cmd == 0x05:  # AddGroupIfIdentifying(groupId, name)
            ident = self.device.server(self.ep, IdentifyServer.cluster)
            if ident and (ident.get(IdentifyServer.IDENTIFY_TIME) or 0) > 0:
                self._add(struct.unpack_from("<H", payload)[0])
            return Result()
        return Result(UNSUP_CLUSTER_COMMAND)

    def _add(self, gid: int) -> int:
        if gid == 0x0000 or gid > 0xFFF7:
            return INVALID_VALUE
        if gid in self.groups:
            return DUPLICATE_EXISTS
        if len(self.groups) >= self.CAPACITY:
            return INSUFFICIENT_SPACE
        self.groups[gid] = ""
        self.device.state_changed()
        return SUCCESS

    def _remove_scenes(self, gid: int) -> None:
        scenes = self.device.server(self.ep, ScenesServer.cluster)
        if isinstance(scenes, ScenesServer):
            scenes.remove_group(gid)


# ------------------------------------------------------------------ Scenes
class ScenesServer(ClusterServer):
    """Scenes with OnOff / LevelControl extension fields."""

    cluster = 0x0005
    name = "genScenes"
    CAPACITY = 16
    SCENE_COUNT, CURRENT_SCENE, CURRENT_GROUP, SCENE_VALID, NAME_SUPPORT = 0x0000, 0x0001, 0x0002, 0x0003, 0x0004

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        return {
            self.SCENE_COUNT: ("uint8", 0, False),
            self.CURRENT_SCENE: ("uint8", 0, False),
            self.CURRENT_GROUP: ("uint16", 0, False),
            self.SCENE_VALID: ("bool", 0, False),
            self.NAME_SUPPORT: ("bitmap8", 0x00, False),
        }

    @property
    def scenes(self) -> dict[str, dict[str, Any]]:
        # key "gid:sid" -> {"transition": int, "onOff": int|None, "level": int|None}
        return self.device.scenes.setdefault(self.ep, {})

    def _group_ok(self, gid: int) -> bool:
        return gid == 0 or gid in self.device.groups.get(self.ep, {})

    def _count(self) -> None:
        self.set(self.SCENE_COUNT, len(self.scenes))

    def remove_group(self, gid: int) -> None:
        for k in [k for k in self.scenes if k.startswith(f"{gid}:")]:
            del self.scenes[k]
        self._count()

    def handle(self, cmd: int, payload: bytes) -> Result:
        if cmd in (0x00, 0x40):  # AddScene / EnhancedAddScene
            gid, sid, trans = struct.unpack_from("<HBH", payload)
            name_len = payload[5] if len(payload) > 5 else 0
            off = 6 + name_len
            scene: dict[str, Any] = {"transition": trans, "onOff": None, "level": None}
            while off + 3 <= len(payload):
                ext_cluster, ext_len = struct.unpack_from("<HB", payload, off)
                data = payload[off + 3 : off + 3 + ext_len]
                if ext_cluster == OnOffServer.cluster and data:
                    scene["onOff"] = data[0]
                elif ext_cluster == LevelServer.cluster and data:
                    scene["level"] = data[0]
                off += 3 + ext_len
            status = self._store(gid, sid, scene)
            return Result(response=(cmd, bytes([status]) + struct.pack("<HB", gid, sid)))
        if cmd in (0x01, 0x41):  # ViewScene
            gid, sid = struct.unpack_from("<HB", payload)
            if not self._group_ok(gid):
                return Result(response=(cmd, bytes([INVALID_FIELD]) + struct.pack("<HB", gid, sid)))
            scene = self.scenes.get(f"{gid}:{sid}")
            if scene is None:
                return Result(response=(cmd, bytes([NOT_FOUND]) + struct.pack("<HB", gid, sid)))
            ext = b""
            if scene.get("onOff") is not None:
                ext += struct.pack("<HBB", OnOffServer.cluster, 1, scene["onOff"])
            if scene.get("level") is not None:
                ext += struct.pack("<HBB", LevelServer.cluster, 1, scene["level"])
            body = bytes([SUCCESS]) + struct.pack("<HBH", gid, sid, scene["transition"]) + b"\x00" + ext
            return Result(response=(cmd, body))
        if cmd == 0x02:  # RemoveScene
            gid, sid = struct.unpack_from("<HB", payload)
            if not self._group_ok(gid):
                status = INVALID_FIELD
            else:
                status = SUCCESS if self.scenes.pop(f"{gid}:{sid}", None) is not None else NOT_FOUND
            self._count()
            return Result(response=(0x02, bytes([status]) + struct.pack("<HB", gid, sid)))
        if cmd == 0x03:  # RemoveAllScenes
            gid = struct.unpack_from("<H", payload)[0]
            status = SUCCESS if self._group_ok(gid) else INVALID_FIELD
            if status == SUCCESS:
                self.remove_group(gid)
            return Result(response=(0x03, bytes([status]) + struct.pack("<H", gid)))
        if cmd == 0x04:  # StoreScene: capture current state
            gid, sid = struct.unpack_from("<HB", payload)
            onoff = self.device.get_attr(self.ep, OnOffServer.cluster, OnOffServer.ON_OFF)
            level = self.device.get_attr(self.ep, LevelServer.cluster, LevelServer.CURRENT_LEVEL)
            old = self.scenes.get(f"{gid}:{sid}", {})
            scene = {
                "transition": old.get("transition", 0),
                "onOff": onoff.value if onoff else None,
                "level": level.value if level else None,
            }
            status = self._store(gid, sid, scene)
            if status == SUCCESS:
                self._mark_current(gid, sid)
            return Result(response=(0x04, bytes([status]) + struct.pack("<HB", gid, sid)))
        if cmd == 0x05:  # RecallScene
            gid, sid = struct.unpack_from("<HB", payload)
            scene = self.scenes.get(f"{gid}:{sid}")
            if scene is None or not self._group_ok(gid):
                return Result(NOT_FOUND)
            if scene.get("level") is not None and self.device.server(self.ep, LevelServer.cluster):
                self.device.set_attr(self.ep, LevelServer.cluster, LevelServer.CURRENT_LEVEL, scene["level"])
            onoff = self.device.server(self.ep, OnOffServer.cluster)
            if scene.get("onOff") is not None and isinstance(onoff, OnOffServer):
                onoff._set_on(bool(scene["onOff"]))
            self._mark_current(gid, sid)
            return Result()
        if cmd == 0x06:  # GetSceneMembership(groupId)
            gid = struct.unpack_from("<H", payload)[0]
            capacity = max(0, self.CAPACITY - len(self.scenes))
            if not self._group_ok(gid):
                return Result(response=(0x06, bytes([INVALID_FIELD, capacity]) + struct.pack("<H", gid)))
            sids = sorted(int(k.split(":")[1]) for k in self.scenes if k.startswith(f"{gid}:"))
            body = bytes([SUCCESS, capacity]) + struct.pack("<H", gid) + bytes([len(sids)] + sids)
            return Result(response=(0x06, body))
        return Result(UNSUP_CLUSTER_COMMAND)

    def _store(self, gid: int, sid: int, scene: dict[str, Any]) -> int:
        if not self._group_ok(gid):
            return INVALID_FIELD
        key = f"{gid}:{sid}"
        if key not in self.scenes and len(self.scenes) >= self.CAPACITY:
            return INSUFFICIENT_SPACE
        self.scenes[key] = scene
        self._count()
        self.device.state_changed()
        return SUCCESS

    def _mark_current(self, gid: int, sid: int) -> None:
        self.set(self.CURRENT_GROUP, gid)
        self.set(self.CURRENT_SCENE, sid)
        self.set(self.SCENE_VALID, 1)


# ---------------------------------------------------- Electricity metering
class ElectricityMeter:
    """Physical model shared by ElectricalMeasurement (0x0B04) and Metering (0x0702).

    Inputs: the device's `load_w` (resistive load plugged in) and `mains_v`.
    Power flows only while the endpoint's OnOff relay is on. Energy integrates.

    Options (serverOptions.electricityMeter):
      voltageDivisor, currentDivisor, energyDivisor (Wh per unit = 1000/divisor)
      powerDivisor: int, or {"below": 10, "above": 1, "threshold": 1000}
        for firmware that rescales activePower above a threshold (IKEA).
      voltageNoise: +/- volts of random jitter (default 0.5)
      tick: seconds between updates (default 1)
    """

    MEAS, METER = 0x0B04, 0x0702
    # ElectricalMeasurement
    MEASUREMENT_TYPE, RMS_VOLTAGE, RMS_CURRENT, ACTIVE_POWER = 0x0000, 0x0505, 0x0508, 0x050B
    V_MUL, V_DIV, I_MUL, I_DIV, P_MUL, P_DIV = 0x0600, 0x0601, 0x0602, 0x0603, 0x0604, 0x0605
    # Metering
    SUMM_DELIVERED, STATUS, UNIT, MULTIPLIER, DIVISOR, FORMATTING, DEVICE_TYPE = 0x0000, 0x0200, 0x0300, 0x0301, 0x0302, 0x0303, 0x0306

    def __init__(self, device: SimDevice, ep: int, options: dict[str, Any]) -> None:
        self.device = device
        self.ep = ep
        self.opt = options
        self._task: asyncio.Task | None = None
        self._energy_wh = 0.0
        self._rng = random.Random(device.ieee)

    def meas_defaults(self) -> dict[int, tuple[str, Any, bool]]:
        pd = self.opt.get("powerDivisor", 10)
        pd = pd["below"] if isinstance(pd, dict) else pd
        return {
            self.MEASUREMENT_TYPE: ("bitmap32", 0x00000009, False),  # active measurement (AC), phase A
            self.RMS_VOLTAGE: ("uint16", 0, False),
            self.RMS_CURRENT: ("uint16", 0, False),
            self.ACTIVE_POWER: ("int16", 0, False),
            self.V_MUL: ("uint16", 1, False),
            self.V_DIV: ("uint16", self.opt.get("voltageDivisor", 10), False),
            self.I_MUL: ("uint16", 1, False),
            self.I_DIV: ("uint16", self.opt.get("currentDivisor", 1000), False),
            self.P_MUL: ("uint16", 1, False),
            self.P_DIV: ("uint16", pd, False),
        }

    def meter_defaults(self) -> dict[int, tuple[str, Any, bool]]:
        return {
            self.SUMM_DELIVERED: ("uint48", 0, False),
            self.STATUS: ("bitmap8", 0x00, False),
            self.UNIT: ("enum8", 0x00, False),  # kWh
            self.MULTIPLIER: ("uint24", 1, False),
            self.DIVISOR: ("uint24", self.opt.get("energyDivisor", 1000), False),
            self.FORMATTING: ("bitmap8", 0x2B, False),
            self.DEVICE_TYPE: ("bitmap8", 0x00, False),  # electric metering
        }

    def start(self) -> None:
        loop = _loop()
        if loop and (self._task is None or self._task.done()):
            self._energy_wh = (self._get(self.METER, self.SUMM_DELIVERED) or 0) * 1000 / self.opt.get("energyDivisor", 1000)
            self.update()
            self._task = loop.create_task(self._run())

    def stop(self) -> None:
        if self._task:
            self._task.cancel()
            self._task = None

    async def _run(self) -> None:
        tick = float(self.opt.get("tick", 1))
        while True:
            await asyncio.sleep(tick)
            power = self._power_w()
            self._energy_wh += power * tick / 3600
            self.update()

    def _get(self, cid: int, aid: int) -> Any:
        a = self.device.get_attr(self.ep, cid, aid)
        return a.value if a else None

    def _relay_on(self) -> bool:
        a = self.device.get_attr(self.ep, OnOffServer.cluster, OnOffServer.ON_OFF)
        return bool(a.value) if a else True

    def _power_w(self) -> float:
        return float(self.device.inputs.get("load_w", 0)) if self._relay_on() else 0.0

    def update(self) -> None:
        """Recompute measurement attributes from the physical inputs."""
        d, ep = self.device, self.ep
        noise = float(self.opt.get("voltageNoise", 0.5))
        volts = float(d.inputs.get("mains_v", 230)) + self._rng.uniform(-noise, noise)
        power = self._power_w()
        amps = power / volts if volts else 0.0
        vdiv = self._get(self.MEAS, self.V_DIV) or 1
        idiv = self._get(self.MEAS, self.I_DIV) or 1
        pd = self.opt.get("powerDivisor", 10)
        if isinstance(pd, dict):
            pdiv = pd["above"] if power >= pd.get("threshold", 1000) else pd["below"]
            if self._get(self.MEAS, self.P_DIV) != pdiv:
                d.set_attr(ep, self.MEAS, self.P_DIV, pdiv)
        else:
            pdiv = self._get(self.MEAS, self.P_DIV) or 1
        d.set_attr(ep, self.MEAS, self.RMS_VOLTAGE, max(0, min(0xFFFF, round(volts * vdiv))))
        d.set_attr(ep, self.MEAS, self.RMS_CURRENT, max(0, min(0xFFFF, round(amps * idiv))))
        d.set_attr(ep, self.MEAS, self.ACTIVE_POWER, max(-0x8000, min(0x7FFF, round(power * pdiv))))
        ediv = self._get(self.METER, self.DIVISOR) or 1000
        d.set_attr(ep, self.METER, self.SUMM_DELIVERED, int(self._energy_wh * ediv / 1000))

    def reset_energy(self) -> None:
        self._energy_wh = 0.0
        self.update()


class _MeterCluster(ClusterServer):
    """Thin cluster server facades over the shared ElectricityMeter."""

    def __init__(self, device: SimDevice, ep: int, options: dict[str, Any]) -> None:
        super().__init__(device, ep, options)
        meters = device.meters
        if ep not in meters:
            meters[ep] = ElectricityMeter(device, ep, options)
        self.meter = meters[ep]

    def start(self) -> None:
        self.meter.start()

    def power_down(self) -> None:
        self.meter.stop()


class ElectricalMeasurementServer(_MeterCluster):
    cluster = 0x0B04
    name = "haElectricalMeasurement"

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        return self.meter.meas_defaults()


class MeteringServer(_MeterCluster):
    cluster = 0x0702
    name = "seMetering"

    def defaults(self) -> dict[int, tuple[str, Any, bool]]:
        return self.meter.meter_defaults()


BASE_SERVERS = (IdentifyServer, OnOffServer, GroupsServer, ScenesServer, ElectricalMeasurementServer, MeteringServer)
OPTION_KEYS = {
    ElectricalMeasurementServer.cluster: "electricityMeter",
    MeteringServer.cluster: "electricityMeter",
}
