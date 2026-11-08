"""Simulated Zigbee device driven by a device profile."""

from __future__ import annotations

import asyncio
import logging
import random
import time
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any, Callable

from . import zcl
from .clusters import attribute, cluster_id, cluster_name
from .expr import render
from .presets import Generator, option as preset_option
from .recorder import Recording, build_routine
from .reporting import ANALOG, ReportingEngine
from .routines import RoutineRunner, capabilities, describe, normalize
from .servers import OPTION_KEYS, SERVERS, ClusterServer, Result

if TYPE_CHECKING:
    from .profile import Profile

_LOGGER = logging.getLogger(__name__)

PROFILE_ZDO = 0x0000
PROFILE_HA = 0x0104
PROFILE_ZLL = 0xC05E
CLUSTER_TOUCHLINK = 0x1000


def _json_value(value: Any) -> Any:
    """Attribute values are stored as JSON: octet strings / blobs as {"hex": ...}."""
    if isinstance(value, (bytes, bytearray)):
        return {"hex": bytes(value).hex()}
    if isinstance(value, (list, tuple)):
        return [_json_value(v) for v in value]
    return value


def _from_json_value(value: Any) -> Any:
    if isinstance(value, dict) and set(value) == {"hex"}:
        return bytes.fromhex(value["hex"])
    if isinstance(value, list):
        return [_from_json_value(v) for v in value]
    return value


def _frame_profile(profile_id: int, cluster: int) -> int:
    """ZLL endpoints describe themselves with the ZLL profile but send ZCL frames
    with the Home Automation profile (ZLL spec): only touchlink keeps 0xC05E."""
    return PROFILE_HA if profile_id == PROFILE_ZLL and cluster != CLUSTER_TOUCHLINK else profile_id
COORDINATOR_NWK = 0x0000

# ZDO cluster ids
ZDO_NWK_ADDR_REQ = 0x0000
ZDO_IEEE_ADDR_REQ = 0x0001
ZDO_NODE_DESC_REQ = 0x0002
ZDO_POWER_DESC_REQ = 0x0003
ZDO_SIMPLE_DESC_REQ = 0x0004
ZDO_ACTIVE_EP_REQ = 0x0005
ZDO_MATCH_DESC_REQ = 0x0006
ZDO_DEVICE_ANNCE = 0x0013
ZDO_BIND_REQ = 0x0021
ZDO_UNBIND_REQ = 0x0022
ZDO_MGMT_LQI_REQ = 0x0031
ZDO_MGMT_RTG_REQ = 0x0032
ZDO_MGMT_LEAVE_REQ = 0x0034
ZDO_SUCCESS = 0x00
ZDO_NOT_SUPPORTED = 0x84


def _try_id(cid: int, ref: str | int) -> int | None:
    try:
        return attribute(cid, ref, "uint8")[0]
    except (ValueError, KeyError):
        return None


@dataclass
class OutgoingMessage:
    """A message from an emulated device towards the coordinator."""

    profile_id: int
    cluster_id: int
    src_endpoint: int
    dst_endpoint: int
    payload: bytes
    broadcast: bool = False


@dataclass
class Endpoint:
    id: int
    profile_id: int
    device_id: int
    in_clusters: list[int]
    out_clusters: list[int]
    clusters: dict[int, zcl.ClusterState] = field(default_factory=dict)


class SimDevice:
    """A virtual device. Transport-agnostic: emits OutgoingMessage via `send`."""

    def __init__(
        self,
        profile: Profile,
        ieee: int,
        nwk: int,
        send: Callable[[SimDevice, OutgoingMessage], None],
        name: str | None = None,
        events: Callable[[dict[str, Any]], None] | None = None,
        net_info: Callable[[], dict[str, Any]] | None = None,
    ) -> None:
        self.profile = profile
        self.ieee = ieee
        self.nwk = nwk
        self.name = name or profile.name
        self._send = send
        self._emit_event = events or (lambda _e: None)
        self._tsn = random.randint(0, 255)
        self._zdo_seq = random.randint(0, 255)
        self.joined = False
        self.bindings: list[dict[str, Any]] = []
        self.endpoints: dict[int, Endpoint] = {}
        self.control_state: dict[str, Any] = {}
        self._hold_tasks: dict[str, asyncio.Task] = {}
        self._dial_last: dict[str, float] = {}
        # auto mode
        self.mode = "manual"
        self.tags: list[str] = []  # user organisation (settings.tags ids)
        self.routines: list[dict[str, Any]] = []
        self.runner = RoutineRunner(self, lambda: self._emit_event({"type": "routines", "ieee": self.ieee_str}))
        # pairing mode (transient): monotonic deadline, or None
        self.pairing_until: float | None = None
        # network facts the device learnt when joining (coordinator, extended PAN id)
        self._net_info = net_info or (lambda: {})
        # physical world
        self.powered = True
        self.inputs: dict[str, Any] = {}
        for ctrl in profile.controls:  # inputs some standard components rely on
            self.inputs.update(ctrl.get("inputs", {}))
        self.inputs.update(profile.data.get("inputs", {}))
        # ZCL server state
        self.servers: dict[tuple[int, int], ClusterServer] = {}
        self.meters: dict[int, Any] = {}
        self.groups: dict[int, dict[int, str]] = {}
        self.scenes: dict[int, dict[str, dict[str, Any]]] = {}
        self.reporting = ReportingEngine(self)
        self._scheduled: dict[str, asyncio.TimerHandle] = {}
        self._generators: dict[str, Generator] = {}
        self.control_values: dict[str, Any] = {}  # last value produced by each preset control
        self.recording: Recording | None = None
        self._build_endpoints()

    # ------------------------------------------------------------------ setup
    def _build_endpoints(self) -> None:
        self.endpoints = {}
        self.control_state = {}
        self.servers = {}
        self.meters = {}
        for ep_def in self.profile.data["endpoints"]:
            ep = Endpoint(
                id=ep_def["id"],
                profile_id=ep_def.get("profileId", PROFILE_HA),
                device_id=ep_def.get("deviceId", 0),
                in_clusters=[cluster_id(c) for c in ep_def.get("inClusters", [])],
                out_clusters=[cluster_id(c) for c in ep_def.get("outClusters", [])],
            )
            options = ep_def.get("serverOptions", {})
            for cid in ep.in_clusters:
                state = ep.clusters[cid] = zcl.ClusterState(cid)
                server_cls = SERVERS.get(cid)
                if server_cls is not None:
                    srv = server_cls(self, ep.id, options.get(OPTION_KEYS.get(cid, server_cls.name), {}))
                    self.servers[(ep.id, cid)] = srv
                    for aid, (atype, value, writable) in srv.defaults().items():
                        state.attributes[aid] = zcl.Attribute(aid, atype, value, writable)
            for cref, attrs in ep_def.get("attributes", {}).items():
                cid = cluster_id(cref)
                state = ep.clusters.setdefault(cid, zcl.ClusterState(cid))
                for aref, spec in attrs.items():
                    if isinstance(spec, dict):
                        aid, atype = attribute(cid, aref, spec.get("type"))
                        state.attributes[aid] = zcl.Attribute(aid, atype, spec["value"], spec.get("writable", False))
                    else:
                        known = _try_id(cid, aref)
                        if known is not None and known in state.attributes:
                            state.attributes[known].value = spec  # keep the server's type / writability
                        else:
                            aid, atype = attribute(cid, aref)
                            state.attributes[aid] = zcl.Attribute(aid, atype, spec)
            self.endpoints[ep.id] = ep
        for ctrl in self.profile.controls:
            if "default" in ctrl:
                self.control_state[ctrl["id"]] = ctrl["default"]

    @property
    def ieee_str(self) -> str:
        return f"0x{self.ieee:016x}"

    @property
    def node(self) -> dict[str, Any]:
        return self.profile.data.get("node", {})

    @property
    def mac_capabilities(self) -> int:
        return int(self.node.get("macCapabilities", 0x80))

    def next_tsn(self) -> int:
        self._tsn = (self._tsn + 1) & 0xFF
        return self._tsn

    def next_zdo_seq(self) -> int:
        self._zdo_seq = (self._zdo_seq + 1) & 0xFF
        return self._zdo_seq

    @property
    def capabilities(self) -> list[dict[str, Any]]:
        return capabilities(self.profile.controls)

    @property
    def pairing(self) -> bool:
        return self.pairing_until is not None and self.pairing_until > time.monotonic()

    def to_dict(self) -> dict[str, Any]:
        caps = self.capabilities
        return {
            "ieee": self.ieee_str,
            "nwk": f"0x{self.nwk:04x}",
            "name": self.name,
            "profile": self.profile.id,
            "joined": self.joined,
            "pairing": self.pairing,
            "pairingRemaining": max(0, round(self.pairing_until - time.monotonic())) if self.pairing else 0,
            "mode": self.mode,
            "tags": self.tags,
            "controls": self.profile.controls,
            "controlState": self.control_state,
            "capabilities": caps,
            "routines": [{**r, "description": describe(r, caps)} for r in self.routines],
            "routineStatus": self.runner.status,
            "routineTemplates": self.routine_templates(),
            "powered": self.powered,
            "controlValues": {**self.control_values, **self.toggle_states()},
            "recording": {"active": True, "elapsed": round(self.recording.elapsed), "events": len(self.recording.events)}
            if self.recording
            else {"active": False},
            "indicators": self.indicators(),
            "groups": {str(ep): sorted(g) for ep, g in self.groups.items() if g},
            "info": self.profile.data.get("device", {}),
        }

    def indicators(self) -> dict[str, Any]:
        out: dict[str, Any] = {}
        env = self.expr_env()
        for ctrl in self.profile.controls:
            if ctrl["type"] != "indicator":
                continue
            try:
                local = {**env, "ep": ctrl.get("endpoint")}
                out[ctrl["id"]] = {
                    "text": str(render(ctrl.get("value", ""), local)),
                    "on": bool(render(ctrl["on"], local)) if "on" in ctrl else None,
                    "swatch": str(render(ctrl["swatch"], local)) if "swatch" in ctrl else None,
                }
                if ctrl.get("widget") in ("brightness", "color"):
                    out[ctrl["id"]]["light"] = self.light_view(ctrl.get("endpoint") or 1)
            except Exception as exc:  # noqa: BLE001
                out[ctrl["id"]] = {"text": f"error: {exc}", "on": None}
        return out

    def toggle_state(self, ctrl: dict[str, Any]) -> str:
        try:
            state = str(render(ctrl["value"], self.expr_env()))
        except Exception:  # noqa: BLE001
            return ctrl["states"][0]
        return state if state in ctrl["states"] else ctrl["states"][0]

    def toggle_states(self) -> dict[str, str]:
        """Current state of every stateful control: toggles, and push buttons with a `state` template."""
        out = {c["id"]: self.toggle_state(c) for c in self.profile.controls if c["type"] == "toggle"}
        for c in self.profile.controls:
            if c["type"] == "button" and "state" in c:
                try:
                    out[c["id"]] = "on" if render(c["state"], {**self.expr_env(), "ep": c.get("endpoint")}) else "off"
                except Exception:  # noqa: BLE001
                    out[c["id"]] = "off"
        return out

    def routine_templates(self) -> list[dict[str, Any]]:
        caps = self.capabilities
        out = []
        for t in self.profile.data.get("routineTemplates", []):
            try:
                r = normalize(t, caps)
            except ValueError as exc:
                _LOGGER.warning("profile %s: invalid routine template %r: %s", self.profile.id, t.get("name"), exc)
                continue
            out.append({**r, "description": describe(r, caps)})
        return out

    # ------------------------------------------------------------ auto mode
    def set_mode(self, mode: str) -> None:
        if mode not in ("manual", "auto"):
            raise ValueError("mode must be 'manual' or 'auto'")
        self.mode = mode
        if mode == "manual":
            self.runner.stop()
        self.release_all()
        self.runner.sync()

    def set_routines(self, routines: list[dict[str, Any]]) -> None:
        caps = self.capabilities
        normalized = [normalize(r, caps) for r in routines]
        ids = [r["id"] for r in normalized]
        if len(ids) != len(set(ids)):
            raise ValueError("routine ids must be unique")
        self.routines = normalized
        self.runner.sync()

    def release_all(self) -> None:
        """Release held buttons (e.g. when a routine is interrupted)."""
        for cid in list(self._hold_tasks):
            try:
                self._button_up(self._control(cid))
            except KeyError:
                pass

    def factory_reset(self) -> None:
        """Back to factory state: attribute defaults, no bindings, manual mode.

        Routines are user configuration, not device state, so they are kept.
        """
        self.runner.stop()
        self.cancel_tasks()
        self.mode = "manual"
        self.bindings = []
        self.joined = False
        self._dial_last.clear()
        for srv in self.servers.values():
            srv.power_down()
        self.reporting.clear()
        self.groups = {}
        self.scenes = {}
        self.inputs = dict(self.profile.data.get("inputs", {}))
        for key in list(self._scheduled):
            self.cancel_scheduled(key)
        self._build_endpoints()
        if self.powered:
            for srv in self.servers.values():
                srv.start()

    def persist(self) -> dict[str, Any]:
        return {
            "ieee": self.ieee,
            "nwk": self.nwk,
            "name": self.name,
            "profile": self.profile.id,
            "joined": self.joined,
            "mode": self.mode,
            "tags": self.tags,
            "routines": self.routines,
            "powered": self.powered,
            "inputs": self.inputs,
            "groups": {str(ep): {str(g): n for g, n in gs.items()} for ep, gs in self.groups.items()},
            "scenes": {str(ep): sc for ep, sc in self.scenes.items()},
            "reporting": self.reporting.persist(),
            "servers": {f"{ep}:{cid}": d for (ep, cid), srv in self.servers.items() if (d := srv.persist())},
            "bindings": self.bindings,
            "controlState": self.control_state,
            "attributes": {
                str(ep.id): {
                    str(cid): {str(aid): _json_value(a.value) for aid, a in cs.attributes.items()}
                    for cid, cs in ep.clusters.items()
                }
                for ep in self.endpoints.values()
            },
        }

    def restore(self, data: dict[str, Any]) -> None:
        self.joined = data.get("joined", False)
        self.mode = data.get("mode", "manual")
        self.tags = list(data.get("tags") or ([data["category"]] if data.get("category") else []))
        self.powered = data.get("powered", True)
        self.inputs.update(data.get("inputs", {}))
        self.groups = {int(ep): {int(g): n for g, n in gs.items()} for ep, gs in data.get("groups", {}).items()}
        self.scenes = {int(ep): sc for ep, sc in data.get("scenes", {}).items()}
        self.reporting.restore(data.get("reporting", []))
        for key, sdata in data.get("servers", {}).items():
            ep, cid = (int(x) for x in key.split(":"))
            srv = self.servers.get((ep, cid))
            if srv is not None:
                srv.restore(sdata)
        try:
            self.routines = [normalize(r, self.capabilities) for r in data.get("routines", [])]
        except ValueError as exc:
            _LOGGER.warning("%s: dropping stored routines that no longer match the profile: %s", self.ieee_str, exc)
            self.routines = []
        self.bindings = data.get("bindings", [])
        self.control_state.update(data.get("controlState", {}))
        for ep_id, clusters in data.get("attributes", {}).items():
            ep = self.endpoints.get(int(ep_id))
            if not ep:
                continue
            for cid, attrs in clusters.items():
                cs = ep.clusters.get(int(cid))
                if not cs:
                    continue
                for aid, value in attrs.items():
                    if int(aid) in cs.attributes:
                        cs.attributes[int(aid)].value = _from_json_value(value)

    # ------------------------------------------------------------ attributes
    def get_attr(self, ep: int, cid: int, aid: int) -> zcl.Attribute | None:
        endpoint = self.endpoints.get(ep)
        if endpoint is None:
            return None
        state = endpoint.clusters.get(cid)
        return state.attributes.get(aid) if state else None

    def attr_value(self, cluster: str | int, ref: str | int, ep: int | None = None) -> Any:
        """Attribute value by name, for profile expressions: attr('genOnOff', 'onOff')."""
        cid = cluster_id(cluster)
        eps = [ep] if ep is not None else sorted(self.endpoints)
        for e in eps:
            if e not in self.endpoints:  # still being built
                continue
            state = self.endpoints[e].clusters.get(cid)
            if state is None:
                continue
            aid = _try_id(cid, ref)
            if aid is not None and aid in state.attributes:
                return state.attributes[aid].value
        return None

    def set_attr(self, ep: int, cid: int, ref: str | int, value: Any, report: bool = True) -> None:
        """Change an attribute as the device itself does (server-side change)."""
        aid = ref if isinstance(ref, int) else attribute(cid, ref)[0]
        attr = self.get_attr(ep, cid, aid)
        if attr is None:
            atype = attribute(cid, aid)[1]
            attr = self.endpoints[ep].clusters.setdefault(cid, zcl.ClusterState(cid)).attributes.setdefault(
                aid, zcl.Attribute(aid, atype, value)
            )
        if attr.value == value:
            return
        attr.value = value
        if report:
            self.reporting.on_change(ep, cid, aid)
        if cid == 0x0006 and aid == 0x0000:  # relay change: meters react immediately
            meter = self.meters.get(ep)
            if meter is not None:
                meter.update()
        self.run_profile_event(f"attr:{cluster_name(cid)}:0x{aid:04x}", {"value": value, "endpoint": ep})
        self.state_changed()

    def light_css(self, ep: int = 1) -> str:
        """Approximate visible light color (CSS) of an endpoint: off/brightness/color."""
        onoff = self.get_attr(ep, 0x0006, 0x0000)
        if not self.powered or (onoff is not None and not onoff.value):
            return "#222222"
        level = self.get_attr(ep, 0x0008, 0x0000)
        color_srv = self.server(ep, 0x0300)
        base = color_srv.css_color() if color_srv is not None and hasattr(color_srv, "css_color") else "#ffd27a"
        k = (level.value / 254) if level is not None else 1.0
        r, g, b = (int(base[i : i + 2], 16) for i in (1, 3, 5))
        return "#{:02x}{:02x}{:02x}".format(*(round(c * (0.25 + 0.75 * k)) for c in (r, g, b)))

    def light_view(self, ep: int = 1) -> dict[str, Any]:
        """Light state for the dashboard's brightness / color components."""
        onoff = self.get_attr(ep, 0x0006, 0x0000)
        level = self.get_attr(ep, 0x0008, 0x0000)
        ident = self.get_attr(ep, 0x0003, 0x0000)
        lit = self.powered and (onoff is None or bool(onoff.value))
        view: dict[str, Any] = {
            "powered": self.powered,
            "on": lit,
            "blinking": bool(self.powered and ident is not None and ident.value),
            "level": round((level.value if level is not None else 254) * 100 / 254),
            "css": self.light_css(ep),
        }
        color_srv = self.server(ep, 0x0300)
        if color_srv is not None and hasattr(color_srv, "view"):
            view["color"] = color_srv.view()
        return view

    def _accepts(self, ep: int, cid: int, cmd: int) -> bool:
        """Manufacturer commands a real device accepts without us modelling them (profile acceptCommands)."""
        for ep_def in self.profile.data["endpoints"]:
            if ep_def["id"] != ep:
                continue
            for cref, cmds in ep_def.get("acceptCommands", {}).items():
                if cluster_id(cref) == cid and (cmds == "*" or cmd in cmds):
                    return True
        return False

    def run_profile_event(self, name: str, env: dict[str, Any] | None = None) -> None:
        """Profile lifecycle hooks: "events": {"joined": [...], "powerUp": [...], "command:<cluster>:<id>": [...]}."""
        actions = self.profile.data.get("events", {}).get(name)
        if actions:
            self.run_actions(actions, env or {})

    def server(self, ep: int, cid: int) -> ClusterServer | None:
        return self.servers.get((ep, cid))

    def state_changed(self) -> None:
        self._emit_event({"type": "device_state", "ieee": self.ieee_str})

    @property
    def can_transmit(self) -> bool:
        return self.joined and self.powered

    # --------------------------------------------------------- physical world
    def start(self) -> None:
        """Runtime start (event loop available): meters tick, periodic reports resume."""
        if self.powered:
            for srv in self.servers.values():
                srv.start()
        self.reporting.resume()
        # physical world keeps going: restart fluctuating presets (constants are already applied)
        for ctrl in self.profile.controls:
            if ctrl["type"] == "preset" and ctrl["id"] in self.control_state:
                try:
                    opt = preset_option(ctrl, self.control_state[ctrl["id"]])
                except ValueError:
                    continue
                if "range" in opt:
                    self._generator(ctrl).select(opt)

    def _generator(self, ctrl: dict[str, Any]) -> Generator:
        gen = self._generators.get(ctrl["id"])
        if gen is None:

            def emit(value: Any, ctrl: dict[str, Any] = ctrl) -> None:
                self.control_values[ctrl["id"]] = value
                self._fire(ctrl, "change", {"value": value, "option": self.control_state.get(ctrl["id"])})
                self.state_changed()

            gen = self._generators[ctrl["id"]] = Generator(ctrl, emit, seed=self.ieee ^ hash(ctrl["id"]))
        return gen

    # -------------------------------------------------------------- recording
    def start_recording(self) -> None:
        if self.mode != "manual":
            raise RuntimeError("switch to manual mode to record")
        self.recording = Recording()
        self.state_changed()

    def stop_recording(self) -> dict[str, Any]:
        if self.recording is None:
            raise RuntimeError("not recording")
        rec, self.recording = self.recording, None
        self.state_changed()
        routine = build_routine(rec, self.profile.controls, f"Recorded {time.strftime('%H:%M')}")
        if not any(st["kind"] == "gesture" for st in routine["steps"]):
            raise ValueError("nothing was recorded: use the manual controls while recording")
        return normalize(routine, self.capabilities)

    def stop(self) -> None:
        for gen in self._generators.values():
            gen.stop()
        for srv in self.servers.values():
            srv.power_down()
        self.reporting.stop()
        self.cancel_tasks()

    def power_cut(self) -> None:
        if not self.powered:
            return
        self.powered = False
        self.release_all()
        for srv in self.servers.values():
            srv.power_down()
        self.reporting.stop()
        if self.node.get("volatileReporting"):
            self.reporting.clear()  # e.g. IKEA bulbs forget their reporting configuration on power loss
        self.state_changed()

    def power_restore(self) -> None:
        """Mains back: the device reboots, applies power-on behaviour and re-announces."""
        if self.powered:
            return
        self.powered = True
        for srv in self.servers.values():
            srv.power_up()
        for srv in self.servers.values():
            srv.start()
        self.reporting.resume()
        if self.joined:
            self.announce()
            self.run_profile_event("powerUp")
        self.state_changed()

    def local_command(self, ep: int, cluster: str | int, command: str, **kw: Any) -> None:
        srv = self.server(ep, cluster_id(cluster))
        if srv is None:
            raise ValueError(f"no {cluster} server on endpoint {ep}")
        srv.local(command, **kw)

    def set_inputs(self, values: dict[str, Any]) -> None:
        self.inputs.update(values)
        for meter in self.meters.values():
            meter.update()
        for srv in self.servers.values():
            hook = getattr(srv, "on_inputs", None)
            if hook is not None:
                hook()
        self.state_changed()

    def schedule(self, key: str, delay_s: float, actions: list[dict[str, Any]], env: dict[str, Any]) -> None:
        """Run actions later (named: rescheduling the same key replaces it)."""
        self.cancel_scheduled(key)
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            return

        def fire() -> None:
            self._scheduled.pop(key, None)
            if self.powered:
                self.run_actions(actions, {})  # evaluate against the state at fire time

        self._scheduled[key] = loop.call_later(max(0.0, delay_s), fire)

    def cancel_scheduled(self, key: str) -> None:
        handle = self._scheduled.pop(key, None)
        if handle is not None:
            handle.cancel()

    def send_report(self, ep: int, cid: int, attrs: list[zcl.Attribute]) -> None:
        payload = b"".join(
            a.id.to_bytes(2, "little") + bytes([zcl.DATA_TYPES[a.type][0]]) + zcl.encode_value(a.type, a.value) for a in attrs
        )
        mfr = self._manufacturer_code_for(cid)
        self.send_zcl(
            ep,
            cid,
            zcl.CMD_REPORT_ATTR,
            payload,
            cluster_specific=False,
            server_to_client=True,
            manufacturer_code=mfr,
            summary=f"report {cluster_name(cid)} " + ", ".join(f"0x{a.id:04x}={a.value}" for a in attrs),
        )

    def _manufacturer_code_for(self, cid: int) -> int | None:
        """Manufacturer-specific clusters (0xFC00-0xFFFF) report with the node's manufacturer code."""
        overrides = self.node.get("reportManufacturerCode", {})
        for ref, code in overrides.items():
            if cluster_id(ref) == cid:
                return code
        if cid >= 0xFC00:
            return int(self.node.get("manufacturerCode", 0)) or None
        return None

    # --------------------------------------------------------------- outgoing
    def _out(self, msg: OutgoingMessage, log: str | None = None) -> None:
        self._emit_event(
            {
                "type": "tx",
                "ieee": self.ieee_str,
                "cluster": cluster_name(msg.cluster_id) if msg.profile_id else f"zdo:0x{msg.cluster_id:04x}",
                "endpoint": msg.src_endpoint,
                "payload": msg.payload.hex(),
                "summary": log,
            }
        )
        self._send(self, msg)

    def announce(self) -> None:
        """Send ZDO Device_annce (broadcast)."""
        payload = (
            bytes([self.next_zdo_seq()])
            + self.nwk.to_bytes(2, "little")
            + self.ieee.to_bytes(8, "little")
            + bytes([self.mac_capabilities])
        )
        self._out(OutgoingMessage(PROFILE_ZDO, ZDO_DEVICE_ANNCE, 0, 0, payload, broadcast=True), "Device_annce")

    def send_zcl(
        self,
        endpoint: int,
        cluster: int,
        command: int,
        payload: bytes,
        *,
        cluster_specific: bool,
        server_to_client: bool,
        manufacturer_code: int | None = None,
        disable_default_rsp: bool = True,
        tsn: int | None = None,
        dst_endpoint: int = 1,
        summary: str | None = None,
    ) -> None:
        fc = 0
        if cluster_specific:
            fc |= zcl.FC_CLUSTER_SPECIFIC
        if server_to_client:
            fc |= zcl.FC_SERVER_TO_CLIENT
        if disable_default_rsp:
            fc |= zcl.FC_DISABLE_DEFAULT_RSP
        frame = zcl.ZclFrame(fc, self.next_tsn() if tsn is None else tsn, command, payload, manufacturer_code)
        ep = self.endpoints.get(endpoint)
        prof = _frame_profile(ep.profile_id, cluster) if ep else PROFILE_HA
        self._out(OutgoingMessage(prof, cluster, endpoint, dst_endpoint, frame.encode()), summary)

    def report_attributes(self, endpoint: int, cluster: int, values: dict[str | int, Any]) -> None:
        ep = self.endpoints[endpoint]
        state = ep.clusters.setdefault(cluster, zcl.ClusterState(cluster))
        payload = bytearray()
        names = []
        for ref, value in values.items():
            aid, atype = attribute(cluster, ref)
            attr = state.attributes.get(aid)
            if attr is None:
                attr = state.attributes[aid] = zcl.Attribute(aid, atype, value)
            attr.value = value
            payload += aid.to_bytes(2, "little") + bytes([zcl.DATA_TYPES[atype][0]]) + zcl.encode_value(atype, value)
            names.append(f"{ref}={value}")
        self.send_zcl(
            endpoint,
            cluster,
            zcl.CMD_REPORT_ATTR,
            bytes(payload),
            cluster_specific=False,
            server_to_client=True,
            summary=f"report {cluster_name(cluster)} " + ", ".join(names),
        )

    # --------------------------------------------------------------- controls
    def expr_env(self, extra: dict[str, Any] | None = None) -> dict[str, Any]:
        """Variables and functions available to profile templates."""
        env: dict[str, Any] = dict(self.inputs)
        env["attr"] = self.attr_value
        env["light_css"] = self.light_css
        env["powered"] = self.powered
        env["joined"] = self.joined
        if extra:
            env.update(extra)
        return env

    def run_actions(self, actions: list[dict[str, Any]], env: dict[str, Any]) -> None:
        env = self.expr_env(env)
        for action in actions:
            local = dict(env)
            local.update(action.get("vars", {}))
            if "if" in action and not render(action["if"], local):
                continue
            if "macro" in action:
                macro = self.profile.data["macros"][action["macro"]]
                if "actions" in macro:  # multi-action macro
                    self.run_actions(macro["actions"], {**env, **action.get("vars", {})})
                    continue
                merged = {k: v for k, v in macro.items() if k != "description"}
                merged["vars"] = action.get("vars", {})
                if "if" in action:
                    merged["if"] = action["if"]
                self.run_actions([merged], env)
                continue
            if "send" in action:
                spec = action["send"]
                payload = bytearray()
                for item in spec.get("payload", []):
                    typ, val = item
                    payload += zcl.encode_value(typ, render(val, local))
                cid = cluster_id(spec["cluster"])
                self.send_zcl(
                    int(spec.get("endpoint", 1)),
                    cid,
                    int(spec["command"]),
                    bytes(payload),
                    cluster_specific=spec.get("clusterSpecific", True),
                    server_to_client=spec.get("direction", "server_to_client") == "server_to_client",
                    manufacturer_code=spec.get("manufacturerCode"),
                    disable_default_rsp=spec.get("disableDefaultResponse", True),
                    dst_endpoint=int(spec.get("dstEndpoint", 1)),
                    summary=f"cmd 0x{int(spec['command']):02x}",
                )
            elif "report" in action:
                spec = action["report"]
                values = {k: render(v, local) for k, v in spec["attributes"].items()}
                self.report_attributes(int(spec.get("endpoint", 1)), cluster_id(spec["cluster"]), values)
            elif "command" in action:  # physical input acting on one of our own cluster servers
                spec = action["command"]
                self.local_command(
                    int(spec.get("endpoint", 1)), spec["cluster"], render(spec["name"], local), **render(spec.get("args", {}), local)
                )
            elif "setAttribute" in action:  # device-side attribute change (reported per host config)
                spec = action["setAttribute"]
                cid = cluster_id(spec["cluster"])
                for ref, val in spec["attributes"].items():
                    self.set_attr(int(spec.get("endpoint", 1)), cid, ref, render(val, local))
            elif "setInput" in action:  # physical quantities: load, mains voltage...
                self.set_inputs({k: render(v, local) for k, v in action["setInput"].items()})
            elif "schedule" in action:  # {"schedule": {"id", "after" (ms), "do": [...]}}
                spec = action["schedule"]
                self.schedule(str(render(spec["id"], local)), float(render(spec["after"], local)) / 1000, spec["do"], local)
            elif "cancel" in action:
                self.cancel_scheduled(str(render(action["cancel"], local)))
            elif "power" in action:
                (self.power_restore if render(action["power"], local) == "on" else self.power_cut)()

    def _control(self, control_id: str) -> dict[str, Any]:
        for ctrl in self.profile.controls:
            if ctrl["id"] == control_id:
                return ctrl
        raise KeyError(control_id)

    def _fire(self, ctrl: dict[str, Any], event: str, env: dict[str, Any]) -> None:
        actions = ctrl.get("on", {}).get(event)
        if actions:
            full = dict(ctrl.get("vars", {}))
            full.update(env)
            self.run_actions(actions, full)

    async def control(self, control_id: str, action: str, source: str = "manual", **params: Any) -> None:
        """Handle an input from the dashboard (source=manual) or a routine."""
        if source == "manual" and self.mode == "auto":
            raise RuntimeError("device is in auto mode: switch to manual to use the controls")
        ctrl_def = self._control(control_id)
        power_control = ctrl_def.get("power", False)  # e.g. the mains switch works without power
        offline_ok = power_control or ctrl_def.get("offline", False)  # physical-world inputs (load, voltage)
        if not self.powered and not offline_ok and action != "up":
            raise RuntimeError("device has no power")
        if not self.joined and action != "up" and not ctrl_def.get("offline", power_control):
            raise RuntimeError("device is not joined to the network")
        ctrl = self._control(control_id)
        ctype = ctrl["type"]
        if self.recording is not None and source == "manual":
            self.recording.add(control_id, action, params)
        if ctype == "toggle":
            states = ctrl["states"]
            if action == "toggle":
                target = states[1] if self.toggle_state(ctrl) == states[0] else states[0]
            elif action == "set":
                target = str(params["state"])
            else:
                target = action
            if target not in states:
                raise ValueError(f"toggle {control_id!r} has no state {target!r} (states: {states})")
            if self.recording is not None and source == "manual" and action in ("toggle", "set"):
                self.recording.events[-1] = (self.recording.events[-1][0], control_id, target, {})
            self._fire(ctrl, target, {})
            self.state_changed()
            return
        if ctype == "stepper":
            if action not in ("up", "down"):
                raise ValueError(f"stepper {control_id!r}: action must be 'up' or 'down'")
            self._fire(ctrl, action, {})
            return
        if ctype == "preset" and action == "select":
            opt = preset_option(ctrl, str(params["option"]))
            self.control_state[control_id] = opt["id"]
            self._generator(ctrl).select(opt)
            return
        if ctype == "preset" and action == "set":  # exact value (API / tests): stops the generator
            gen = self._generator(ctrl)
            gen.stop()
            self.control_state[control_id] = "custom"
            self.control_values[control_id] = params["value"]
            self._fire(ctrl, "change", {"value": params["value"], "option": "custom"})
            self.state_changed()
            return
        if ctype == "button":
            if action == "down":
                self._button_down(ctrl)
            elif action == "up":
                self._button_up(ctrl)
            elif action == "click":
                self._fire(ctrl, "press", {"held_ms": 0})
                self._fire(ctrl, "press_release", {"held_ms": 0})
        elif ctype == "dial" and action == "rotate":
            steps = int(params["steps"])
            now = time.monotonic()
            first = now - self._dial_last.get(control_id, 0) > ctrl.get("sequenceTimeout", 1000) / 1000
            self._dial_last[control_id] = now
            self._fire(ctrl, "rotate", {"steps": steps, "first": first})
        elif ctype == "range" and action == "set":
            value = params["value"]
            self.control_state[control_id] = value
            self._fire(ctrl, "change", {"value": value})
        elif action in ctrl.get("on", {}):
            self._fire(ctrl, action, dict(params))
        else:
            raise ValueError(f"unsupported action {action!r} for control {control_id!r}")

    def _button_down(self, ctrl: dict[str, Any]) -> None:
        cid = ctrl["id"]
        if cid in self._hold_tasks:
            return
        started = time.monotonic()
        self._fire(ctrl, "press", {"held_ms": 0, "hold_count": 0})

        async def hold_loop() -> None:
            await asyncio.sleep(ctrl.get("holdDelay", 800) / 1000)
            count = 0
            while True:
                count += 1
                self.control_state[cid] = "held"
                self._fire(ctrl, "hold", {"held_ms": int((time.monotonic() - started) * 1000), "hold_count": count})
                await asyncio.sleep(ctrl.get("holdInterval", 800) / 1000)

        task = asyncio.get_running_loop().create_task(hold_loop())
        task.started = started  # type: ignore[attr-defined]
        self._hold_tasks[cid] = task

    def _button_up(self, ctrl: dict[str, Any]) -> None:
        cid = ctrl["id"]
        task = self._hold_tasks.pop(cid, None)
        if task is None:
            return
        task.cancel()
        held_ms = int((time.monotonic() - task.started) * 1000)  # type: ignore[attr-defined]
        held = self.control_state.pop(cid, None) == "held"
        self._fire(ctrl, "hold_release" if held else "press_release", {"held_ms": held_ms})

    def cancel_tasks(self) -> None:
        for task in self._hold_tasks.values():
            task.cancel()
        self._hold_tasks.clear()

    # --------------------------------------------------------------- incoming
    def handle_message(
        self, profile_id: int, cluster: int, src_ep: int, dst_ep: int, payload: bytes, broadcast: bool = False
    ) -> None:
        """Handle a message sent by the coordinator to this device."""
        if not self.powered:
            return
        if profile_id == PROFILE_ZDO and dst_ep == 0:
            self._handle_zdo(cluster, payload)
        elif dst_ep == 0xFF:  # all endpoints carrying the cluster
            for ep in self.endpoints.values():
                if cluster in ep.in_clusters or cluster in ep.out_clusters:
                    self._handle_zcl(cluster, src_ep, ep.id, payload, broadcast=True)
        else:
            self._handle_zcl(cluster, src_ep, dst_ep, payload, broadcast)

    def _zdo_reply(self, cluster: int, body: bytes, seq: int) -> None:
        self._out(OutgoingMessage(PROFILE_ZDO, cluster | 0x8000, 0, 0, bytes([seq]) + body), f"ZDO rsp 0x{cluster | 0x8000:04x}")

    def _handle_zdo(self, cluster: int, payload: bytes) -> None:
        seq = payload[0] if payload else 0
        body = payload[1:]
        self._emit_event({"type": "rx", "ieee": self.ieee_str, "cluster": f"zdo:0x{cluster:04x}", "payload": payload.hex()})
        nwk_le = self.nwk.to_bytes(2, "little")
        if cluster == ZDO_NODE_DESC_REQ:
            logical = {"coordinator": 0, "router": 1, "end_device": 2}[self.node.get("logicalType", "end_device")]
            desc = bytes(
                [
                    logical & 0x07,  # logical type, no complex/user desc
                    0x40,  # APS flags 0, frequency band 2.4GHz (bit 3 of byte -> 0x40 in high nibble)
                    self.mac_capabilities,
                ]
            )
            desc += int(self.node.get("manufacturerCode", 0)).to_bytes(2, "little")
            desc += bytes([0x52])  # max buffer size
            desc += (0x0052).to_bytes(2, "little")  # max incoming transfer
            desc += (0x2C00).to_bytes(2, "little")  # server mask (stack compliance rev 22)
            desc += (0x0052).to_bytes(2, "little")  # max outgoing transfer
            desc += bytes([0x00])  # descriptor capability
            self._zdo_reply(cluster, bytes([ZDO_SUCCESS]) + nwk_le + desc, seq)
        elif cluster == ZDO_ACTIVE_EP_REQ:
            eps = sorted(self.endpoints)
            self._zdo_reply(cluster, bytes([ZDO_SUCCESS]) + nwk_le + bytes([len(eps)] + eps), seq)
        elif cluster == ZDO_SIMPLE_DESC_REQ:
            ep_id = body[2] if len(body) > 2 else 0
            ep = self.endpoints.get(ep_id)
            if ep is None:
                self._zdo_reply(cluster, bytes([0x82]) + nwk_le + b"\x00", seq)  # INVALID_EP
                return
            sd = bytes([ep.id]) + ep.profile_id.to_bytes(2, "little") + ep.device_id.to_bytes(2, "little") + b"\x01"
            sd += bytes([len(ep.in_clusters)]) + b"".join(c.to_bytes(2, "little") for c in ep.in_clusters)
            sd += bytes([len(ep.out_clusters)]) + b"".join(c.to_bytes(2, "little") for c in ep.out_clusters)
            self._zdo_reply(cluster, bytes([ZDO_SUCCESS]) + nwk_le + bytes([len(sd)]) + sd, seq)
        elif cluster == ZDO_IEEE_ADDR_REQ:
            self._zdo_reply(cluster, bytes([ZDO_SUCCESS]) + self.ieee.to_bytes(8, "little") + nwk_le, seq)
        elif cluster == ZDO_NWK_ADDR_REQ:
            self._zdo_reply(cluster, bytes([ZDO_SUCCESS]) + self.ieee.to_bytes(8, "little") + nwk_le, seq)
        elif cluster == ZDO_POWER_DESC_REQ:
            # current mode: rx on periodically, available: rechargeable/disposable, source disposable, level 100%
            if self.node.get("rxOnWhenIdle", True) is False:
                pd = bytes([0x41, 0xC4])  # periodic rx, disposable battery available; on battery, 100%
            else:
                pd = bytes([0x10, 0xC1])  # rx on when idle, mains available; on mains, 100%
            self._zdo_reply(cluster, bytes([ZDO_SUCCESS]) + nwk_le + pd, seq)
        elif cluster in (ZDO_BIND_REQ, ZDO_UNBIND_REQ):
            entry = {"raw": body.hex()}
            if len(body) >= 12:
                entry = {
                    "srcEndpoint": body[8],
                    "cluster": int.from_bytes(body[9:11], "little"),
                    "dstAddrMode": body[11],
                    "dst": body[12:].hex(),
                }
            if cluster == ZDO_BIND_REQ:
                if entry not in self.bindings:
                    self.bindings.append(entry)
            elif entry in self.bindings:
                self.bindings.remove(entry)
            self._zdo_reply(cluster, bytes([ZDO_SUCCESS]), seq)
        elif cluster == ZDO_MGMT_LEAVE_REQ:
            self._zdo_reply(cluster, bytes([ZDO_SUCCESS]), seq)
            self.joined = False
            self._emit_event({"type": "left", "ieee": self.ieee_str})
        elif cluster == ZDO_MGMT_LQI_REQ:
            if self.node.get("logicalType") == "router":
                # our neighbor: the coordinator (parent)
                info = self._net_info()
                ext = bytes.fromhex(info.get("extendedPanId", "00" * 8))
                entry = ext + int(info.get("coordinatorEui64", 0)).to_bytes(8, "little") + b"\x00\x00"
                entry += bytes([0x00 | (1 << 2) | (0 << 4), 0x02, 0, 220])  # coordinator, rx on, parent; pj unknown; depth 0; lqi
                self._zdo_reply(cluster, bytes([ZDO_SUCCESS, 1, 0, 1]) + entry, seq)
            else:
                self._zdo_reply(cluster, bytes([ZDO_SUCCESS, 0, 0, 0]), seq)
        elif cluster == ZDO_MGMT_RTG_REQ:
            self._zdo_reply(cluster, bytes([ZDO_SUCCESS, 0, 0, 0]), seq)
        elif cluster & 0x8000:
            pass  # a response, ignore
        else:
            self._zdo_reply(cluster, bytes([ZDO_NOT_SUPPORTED]), seq)

    def _handle_zcl(self, cluster: int, src_ep: int, dst_ep: int, payload: bytes, broadcast: bool = False) -> None:
        try:
            frame = zcl.ZclFrame.decode(payload)
        except IndexError:
            return
        self._emit_event(
            {"type": "rx", "ieee": self.ieee_str, "cluster": cluster_name(cluster), "endpoint": dst_ep, "payload": payload.hex()}
        )
        ep = self.endpoints.get(dst_ep)
        if ep is None:
            return
        state = ep.clusters.get(cluster)

        def reply(cmd: int, body: bytes, cluster_specific: bool = False) -> None:
            fc = zcl.FC_DISABLE_DEFAULT_RSP | (0 if frame.server_to_client else zcl.FC_SERVER_TO_CLIENT)
            if cluster_specific:
                fc |= zcl.FC_CLUSTER_SPECIFIC
            out = zcl.ZclFrame(fc, frame.tsn, cmd, body, frame.manufacturer_code)
            self._out(OutgoingMessage(_frame_profile(ep.profile_id, cluster), cluster, dst_ep, src_ep, out.encode()), f"{cluster_name(cluster)} rsp 0x{cmd:02x}")

        def default_rsp(cmd: int, status: int) -> None:
            # ZCL 2.5.12.2: never for broadcasts/groups; on success only if not disabled
            if broadcast or (status == zcl.STATUS_SUCCESS and frame.disable_default_rsp):
                return
            reply(zcl.CMD_DEFAULT_RSP, bytes([cmd, status]))

        if frame.cluster_specific:
            srv = self.server(dst_ep, cluster)
            if srv is None and not frame.server_to_client and self._accepts(dst_ep, cluster, frame.command_id):
                self._emit_event({"type": "sys", "ieee": self.ieee_str, "summary": f"accepted {cluster_name(cluster)} cmd 0x{frame.command_id:02x}"})
                self.run_profile_event(f"command:{cluster_name(cluster)}:{frame.command_id}", {"payload": frame.payload.hex()})
                default_rsp(frame.command_id, zcl.STATUS_SUCCESS)
                return
            if srv is None or frame.server_to_client:
                default_rsp(frame.command_id, zcl.STATUS_UNSUP_CLUSTER_COMMAND)
                return
            try:
                result = srv.handle(frame.command_id, frame.payload)
            except (IndexError, ValueError) as exc:  # struct.error is a ValueError
                _LOGGER.debug("%s: malformed %s command: %s", self.ieee_str, cluster_name(cluster), exc)
                result = Result(0x80)  # MALFORMED_COMMAND
            if result.response is not None:
                if not broadcast:
                    reply(result.response[0], result.response[1], cluster_specific=True)
            else:
                default_rsp(frame.command_id, result.status)
            return

        cmd = frame.command_id
        data = frame.payload
        if cmd == zcl.CMD_READ_ATTR:
            body = bytearray()
            for i in range(0, len(data) - 1, 2):
                aid = int.from_bytes(data[i : i + 2], "little")
                attr = state.attributes.get(aid) if state else None
                body += aid.to_bytes(2, "little")
                if attr is None:
                    body.append(zcl.STATUS_UNSUPPORTED_ATTRIBUTE)
                else:
                    body += bytes([zcl.STATUS_SUCCESS, zcl.DATA_TYPES[attr.type][0]]) + zcl.encode_value(attr.type, attr.value)
            reply(zcl.CMD_READ_ATTR_RSP, bytes(body))
        elif cmd in (zcl.CMD_WRITE_ATTR, zcl.CMD_WRITE_ATTR_UNDIV, zcl.CMD_WRITE_ATTR_NORSP):
            off = 0
            records = []
            failures = bytearray()
            while off + 3 <= len(data):
                aid = int.from_bytes(data[off : off + 2], "little")
                tid = data[off + 2]
                off += 3
                size = zcl.type_size(tid, data, off)
                value, _ = zcl.decode_value(zcl.TYPE_BY_ID[tid], data, off)
                off += size
                attr = state.attributes.get(aid) if state else None
                if attr is None:
                    status = zcl.STATUS_UNSUPPORTED_ATTRIBUTE
                elif not attr.writable:
                    status = zcl.STATUS_READ_ONLY
                elif zcl.DATA_TYPES[attr.type][0] != tid:
                    status = 0x8D  # INVALID_DATA_TYPE
                else:
                    status = zcl.STATUS_SUCCESS
                    records.append((aid, value))
                if status != zcl.STATUS_SUCCESS:
                    failures += bytes([status]) + aid.to_bytes(2, "little")
            if not (cmd == zcl.CMD_WRITE_ATTR_UNDIV and failures):
                for aid, value in records:
                    self.set_attr(dst_ep, cluster, aid, value)
                    srv = self.server(dst_ep, cluster)
                    if srv is not None and hasattr(srv, "on_write"):
                        srv.on_write()
            if cmd != zcl.CMD_WRITE_ATTR_NORSP:
                reply(zcl.CMD_WRITE_ATTR_RSP, bytes(failures) or bytes([zcl.STATUS_SUCCESS]))
        elif cmd == zcl.CMD_CONFIG_REPORT:
            off = 0
            failures = bytearray()
            while off + 3 <= len(data):
                direction = data[off]
                aid = int.from_bytes(data[off + 1 : off + 3], "little")
                off += 3
                if direction == 0x01:  # timeout period for received reports: accept
                    off += 2
                    continue
                tid = data[off]
                min_s, max_s = int.from_bytes(data[off + 1 : off + 3], "little"), int.from_bytes(data[off + 3 : off + 5], "little")
                off += 5
                change = None
                tname = zcl.TYPE_BY_ID.get(tid)
                if tname in ANALOG:
                    change, _ = zcl.decode_value(tname, data, off)
                    off += zcl.DATA_TYPES[tname][1] or 0
                status = self.reporting.configure(dst_ep, cluster, aid, tid, min_s, max_s, change)
                if status != zcl.STATUS_SUCCESS:
                    failures += bytes([status, direction]) + aid.to_bytes(2, "little")
            reply(zcl.CMD_CONFIG_REPORT_RSP, bytes(failures) or bytes([zcl.STATUS_SUCCESS]))
        elif cmd == zcl.CMD_READ_REPORT_CFG:
            body = bytearray()
            for i in range(0, len(data) - 2, 3):
                direction = data[i]
                aid = int.from_bytes(data[i + 1 : i + 3], "little")
                attr = state.attributes.get(aid) if state else None
                cfg = self.reporting.read_config(dst_ep, cluster, aid)
                if attr is None:
                    body += bytes([zcl.STATUS_UNSUPPORTED_ATTRIBUTE, direction]) + aid.to_bytes(2, "little")
                elif cfg is None or direction != 0:
                    body += bytes([0x8B, direction]) + aid.to_bytes(2, "little")  # NOT_FOUND
                else:
                    body += bytes([zcl.STATUS_SUCCESS, 0]) + aid.to_bytes(2, "little") + bytes([zcl.DATA_TYPES[attr.type][0]])
                    body += cfg.min_s.to_bytes(2, "little") + cfg.max_s.to_bytes(2, "little")
                    if attr.type in ANALOG:
                        body += zcl.encode_value(attr.type, cfg.change or 0)
            reply(zcl.CMD_READ_REPORT_CFG_RSP, bytes(body))
        elif cmd == zcl.CMD_DISCOVER_ATTR:
            start_id = int.from_bytes(data[0:2], "little") if len(data) >= 2 else 0
            max_n = data[2] if len(data) >= 3 else 0xFF
            items = [(aid, a) for aid, a in sorted((state.attributes if state else {}).items()) if aid >= start_id]
            body = bytearray([1 if len(items) <= max_n else 0])
            for aid, attr in items[:max_n]:
                body += aid.to_bytes(2, "little") + bytes([zcl.DATA_TYPES[attr.type][0]])
            reply(zcl.CMD_DISCOVER_ATTR_RSP, bytes(body))
        elif cmd in (zcl.CMD_DEFAULT_RSP, zcl.CMD_REPORT_ATTR, zcl.CMD_READ_ATTR_RSP, zcl.CMD_WRITE_ATTR_RSP):
            pass
        else:
            default_rsp(cmd, 0x82)  # UNSUP_GENERAL_COMMAND
