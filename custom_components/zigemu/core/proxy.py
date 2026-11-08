"""Proxy coordinator: forward a Zigbee host to a real network-attached Ember stick.

The host (Zigbee2MQTT, ZHA) connects to ZigEmu's port instead of the stick
(SLZB-06, ser2net, …). Every byte is forwarded unchanged in both directions —
the host and the stick keep talking ASH/EZSP to each other — and a copy is
decoded passively (sniffer.py) to show the real devices: joins, traffic,
link quality, and what a ZigEmu profile needs (node / simple descriptors and
Basic attributes), from which a profile draft can be downloaded.
"""

from __future__ import annotations

import asyncio
import logging
import re
import time
from pathlib import Path
from typing import Any, Awaitable, Callable

from . import settings as settings_mod
from .clusters import cluster_name
from .sniffer import AshSniffer, EzspDecoder, describe

_LOGGER = logging.getLogger(__name__)

UNKNOWN_IEEE_BASE = 0xFFFFFFFFFFFF0000  # placeholder key until a device's IEEE is seen
BROADCAST_MIN = 0xFFF8

TYPE_BY_CLUSTERS = [
    ({0x0300}, "Light"),
    ({0x0201}, "Thermostat"),
    ({0x0102}, "Cover"),
    ({0x0500}, "Contact sensor"),
    ({0x0406}, "Presence sensor"),
    ({0x0B04}, "Smart plug"),
    ({0x0702}, "Smart plug"),
    ({0x0008}, "Light"),
    ({0x0402}, "Temperature sensor"),
    ({0x0006}, "Switch"),
]


def parse_upstream(value: Any) -> tuple[str, int]:
    """'host:port' or 'tcp://host:port' -> (host, port)."""
    text = str(value or "").strip().removeprefix("tcp://").removeprefix("socket://")
    m = re.fullmatch(r"\[?([0-9A-Za-z.\-:]+?)\]?:(\d{1,5})", text)
    if not m or not 1 <= int(m.group(2)) <= 65535:
        raise ValueError("upstream must be host:port, e.g. slzb-06.local:6638")
    return m.group(1), int(m.group(2))


class ProxiedDevice:
    def __init__(self, ieee: int) -> None:
        self.ieee = ieee
        self.nwk: int | None = None
        self.name: str | None = None
        self.tags: list[str] = []
        self.first_seen = time.time()
        self.last_seen: float | None = None
        self.lqi: int | None = None
        self.rssi: int | None = None
        self.from_device = 0
        self.to_device = 0
        self.left = False
        self.capability: int | None = None
        self.node: dict[str, Any] = {}
        self.active_eps: list[int] = []
        self.endpoints: dict[int, dict[str, Any]] = {}
        self.basic: dict[str, Any] = {}

    @property
    def known_ieee(self) -> bool:
        return self.ieee < UNKNOWN_IEEE_BASE

    @property
    def ieee_str(self) -> str:
        return f"0x{self.ieee:016x}"

    def persist(self) -> dict[str, Any]:
        return {
            "ieee": self.ieee,
            "nwk": self.nwk,
            "name": self.name,
            "tags": self.tags,
            "firstSeen": self.first_seen,
            "lastSeen": self.last_seen,
            "lqi": self.lqi,
            "rssi": self.rssi,
            "left": self.left,
            "capability": self.capability,
            "node": self.node,
            "activeEps": self.active_eps,
            "endpoints": {str(k): v for k, v in self.endpoints.items()},
            "basic": self.basic,
        }

    @classmethod
    def restore(cls, d: dict[str, Any]) -> ProxiedDevice:
        dev = cls(int(d["ieee"]))
        dev.nwk = d.get("nwk")
        dev.name = d.get("name")
        dev.tags = list(d.get("tags") or [])
        dev.first_seen = d.get("firstSeen") or time.time()
        dev.last_seen = d.get("lastSeen")
        dev.lqi, dev.rssi = d.get("lqi"), d.get("rssi")
        dev.left = bool(d.get("left"))
        dev.capability = d.get("capability")
        dev.node = dict(d.get("node") or {})
        dev.active_eps = list(d.get("activeEps") or [])
        dev.endpoints = {int(k): v for k, v in (d.get("endpoints") or {}).items()}
        dev.basic = dict(d.get("basic") or {})
        return dev

    def merge(self, other: ProxiedDevice) -> None:
        """Fold a placeholder (seen by NWK only) into the device once its IEEE is known."""
        self.nwk = self.nwk if self.nwk is not None else other.nwk
        self.last_seen = max(filter(None, [self.last_seen, other.last_seen]), default=None)
        self.lqi = self.lqi if self.lqi is not None else other.lqi
        self.rssi = self.rssi if self.rssi is not None else other.rssi
        self.from_device += other.from_device
        self.to_device += other.to_device
        self.node = self.node or other.node
        self.active_eps = self.active_eps or other.active_eps
        self.endpoints = {**other.endpoints, **self.endpoints}
        self.basic = {**other.basic, **self.basic}
        self.tags = self.tags or other.tags
        self.name = self.name or other.name

    def clusters(self) -> set[int]:
        out: set[int] = set()
        for ep in self.endpoints.values():
            out.update(ep.get("inClusters", []))
        return out

    def guessed_type(self) -> str | None:
        clusters = self.clusters()
        for needed, label in TYPE_BY_CLUSTERS:
            if needed <= clusters:
                return label
        if self.endpoints and 0x0006 in {c for ep in self.endpoints.values() for c in ep.get("outClusters", [])}:
            return "Remote"
        return None


class ProxyCoordinator:
    kind = "proxy"

    def __init__(
        self,
        host: str,
        port: int,
        upstream: str,
        load: Callable[[], Awaitable[dict[str, Any] | None]],
        save: Callable[[dict[str, Any]], Awaitable[None]],
        profile_dirs: list[Path] | None = None,
        shared: Any = None,
        cid: str | None = None,
    ) -> None:
        self.host = host
        self.port = port
        self.upstream = upstream
        self.upstream_addr = parse_upstream(upstream)
        self.cid = cid
        self.name: str | None = None
        self._load = load
        self._save = save
        self._profile_dirs = list(profile_dirs or [])
        self._shared = shared
        self._own_settings: dict[str, Any] = {"disabledProfiles": [], "wishlist": [], "tags": [], "views": []}
        self.profiles: dict[str, Any] = {}
        self.tag_usage_provider: Callable[[], dict[str, int]] | None = None
        self.devices: dict[int, ProxiedDevice] = {}
        self._by_nwk: dict[int, int] = {}
        self._subscribers: list[asyncio.Queue] = []
        self._server: asyncio.base_events.Server | None = None
        self._host: asyncio.Transport | None = None
        self._up_writer: asyncio.StreamWriter | None = None
        self._up_task: asyncio.Task | None = None
        self._pending: bytearray = bytearray()
        self._loop: asyncio.AbstractEventLoop | None = None
        self._publish_handle: asyncio.TimerHandle | None = None
        self._save_handle: asyncio.TimerHandle | None = None
        self.upstream_error: str | None = None
        self.decoder = EzspDecoder(self._on_event)
        self._sniff_host = AshSniffer(self.decoder.from_host, self.decoder.reset)
        self._sniff_ncp = AshSniffer(self.decoder.from_ncp, self.decoder.reset)
        self._stopped = False

    # ------------------------------------------------------------ settings (shared with emulators)
    @property
    def settings(self) -> dict[str, Any]:
        return self._shared.settings if self._shared is not None else self._own_settings

    @settings.setter
    def settings(self, value: dict[str, Any]) -> None:
        if self._shared is not None:
            self._shared.settings = value
        else:
            self._own_settings = value

    def tag_usage(self) -> dict[str, int]:
        if self.tag_usage_provider is not None:
            return self.tag_usage_provider()
        counts: dict[str, int] = {}
        for dev in self.devices.values():
            for t in dev.tags:
                counts[t] = counts.get(t, 0) + 1
        return counts

    def forget_unknown_tags(self) -> None:
        known = {t["id"] for t in self.settings["tags"]}
        for dev in self.devices.values():
            dev.tags = [t for t in dev.tags if t in known]

    def resolve_tags(self, tags: Any) -> list[str]:
        from .emulator import Emulator

        return Emulator.resolve_tags(self, tags)  # same rules: ids or names, new names become tags

    # ------------------------------------------------------------ lifecycle
    async def start(self) -> None:
        self._loop = asyncio.get_running_loop()
        if not self.profiles:
            from .profile import load_profiles

            self.profiles = await self._loop.run_in_executor(None, load_profiles, *self._profile_dirs)
        data = await self._load() or {}
        for d in data.get("devices", []):
            try:
                dev = ProxiedDevice.restore(d)
            except (KeyError, TypeError, ValueError):
                continue
            self.devices[dev.ieee] = dev
            if dev.nwk is not None:
                self._by_nwk[dev.nwk] = dev.ieee
        self._server = await self._loop.create_server(lambda: _HostSide(self), self.host, self.port)
        _LOGGER.info("ZigEmu proxy listening on %s:%d -> %s", self.host, self.port, self.upstream)

    async def stop(self) -> None:
        if self._stopped:
            return
        self._stopped = True
        for h in (self._publish_handle, self._save_handle):
            if h:
                h.cancel()
        if self._host is not None:
            self._host.close()
        self._close_upstream()
        if self._server is not None:
            self._server.close()
            await self._server.wait_closed()
        await self.save()

    def persist(self) -> dict[str, Any]:
        return {"devices": [d.persist() for d in self.devices.values()]}

    async def save(self) -> None:
        await self._save(self.persist())

    def save_now(self) -> None:
        if self._save_handle:
            self._save_handle.cancel()
            self._save_handle = None
        if self._loop is not None:
            self._loop.create_task(self.save())

    def save_soon(self) -> None:
        if self._loop is None or self._save_handle is not None:
            return

        def run() -> None:
            self._save_handle = None
            asyncio.ensure_future(self.save())

        self._save_handle = self._loop.call_later(5.0, run)

    # ------------------------------------------------------------ host side
    def _host_connected(self, transport: asyncio.Transport) -> None:
        if self._host is not None:
            _LOGGER.warning("proxy %s: a new host connection replaces the previous one", self.cid)
            self._host.close()
            self._close_upstream()
        self._host = transport
        self._pending = bytearray()
        self.upstream_error = None
        self._sniff_host = AshSniffer(self.decoder.from_host, self.decoder.reset)
        self._sniff_ncp = AshSniffer(self.decoder.from_ncp, self.decoder.reset)
        self.decoder.reset()
        self._sys("host connected; connecting to the stick at " + self.upstream)
        self._up_task = asyncio.ensure_future(self._upstream(transport))
        self._publish_state()

    def _host_data(self, transport: asyncio.Transport, data: bytes) -> None:
        if transport is not self._host:
            return
        if self._up_writer is not None:
            self._up_writer.write(data)
        else:
            self._pending += data
        self._sniff_host.feed(data)

    def _host_lost(self, transport: asyncio.Transport) -> None:
        if transport is not self._host:
            return
        self._host = None
        self._close_upstream()
        self._sys("host disconnected")
        self._publish_state()

    def _close_upstream(self) -> None:
        if self._up_task is not None and not self._up_task.done():
            self._up_task.cancel()
        self._up_task = None
        if self._up_writer is not None:
            self._up_writer.close()
        self._up_writer = None

    async def _upstream(self, host: asyncio.Transport) -> None:
        h, p = self.upstream_addr
        try:
            reader, writer = await asyncio.wait_for(asyncio.open_connection(h, p), 8)
        except (OSError, asyncio.TimeoutError) as exc:
            self.upstream_error = f"cannot reach {self.upstream}: {getattr(exc, 'strerror', None) or exc or 'timeout'}"
            self._sys(self.upstream_error)
            _LOGGER.warning("proxy %s: %s", self.cid, self.upstream_error)
            host.close()
            self._publish_state()
            return
        if host is not self._host:
            writer.close()
            return
        self._up_writer = writer
        if self._pending:
            writer.write(bytes(self._pending))
            self._pending = bytearray()
        self._publish_state()
        try:
            while True:
                data = await reader.read(4096)
                if not data:
                    break
                if host is self._host:
                    host.write(data)
                self._sniff_ncp.feed(data)
        except (OSError, asyncio.CancelledError):
            pass
        finally:
            if self._up_writer is writer:
                self._up_writer = None
                self._sys("the stick closed the connection")
                if self._host is host:
                    host.close()
                self._publish_state()

    # ------------------------------------------------------------ decoded traffic
    def _device_for(self, nwk: int | None, ieee: int | None, create: bool = True) -> ProxiedDevice | None:
        if ieee is not None:
            dev = self.devices.get(ieee)
            if dev is None and create:
                dev = self.devices[ieee] = ProxiedDevice(ieee)
            if dev is not None and nwk is not None:
                placeholder = UNKNOWN_IEEE_BASE | nwk
                if placeholder in self.devices and placeholder != ieee:
                    dev.merge(self.devices.pop(placeholder))
                old = self._by_nwk.get(nwk)
                if old is not None and old != ieee and old in self.devices and self.devices[old].nwk == nwk:
                    self.devices[old].nwk = None  # NWK reused by another device
                dev.nwk = nwk
                self._by_nwk[nwk] = ieee
            return dev
        if nwk is None or nwk == 0x0000 or nwk >= BROADCAST_MIN:
            return None
        key = self._by_nwk.get(nwk)
        if key is not None and key in self.devices:
            return self.devices[key]
        if not create:
            return None
        key = UNKNOWN_IEEE_BASE | nwk
        dev = self.devices.setdefault(key, ProxiedDevice(key))
        dev.nwk = nwk
        self._by_nwk[nwk] = key
        return dev

    def _on_event(self, ev: dict[str, Any]) -> None:
        kind = ev["kind"]
        if kind in ("network", "version"):
            self._publish_state_soon()
            return
        if kind == "join":
            dev = self._device_for(ev["nwk"], ev["ieee"])
            if dev is None:
                return
            dev.left = ev["status"] == "left"
            dev.last_seen = time.time()
            self._emit({"type": "sys", "ieee": dev.ieee_str, "summary": f"{ev['status']} (nwk 0x{ev['nwk']:04x})"})
            self.save_soon()
            self._publish_state_soon()
            return
        aps, payload = ev["aps"], ev["payload"]
        info = describe(aps, payload)
        if kind == "fromDevice":
            if ev["nwk"] == 0x0000:
                return  # the stick answering the host's own ZDO requests: not a device
            dev = self._device_for(ev["nwk"], ev.get("ieee"))
            ann = info.get("announce")
            if ann:
                dev = self._device_for(ann["nwk"], ann["ieee"])
                dev.capability = ann["capability"]
                dev.left = False
            if dev is None:
                return
            dev.last_seen = time.time()
            dev.lqi, dev.rssi = ev["lqi"], ev["rssi"]
            dev.from_device += 1
            if "nodeDesc" in info:
                dev.node = info["nodeDesc"]
            if "activeEps" in info:
                dev.active_eps = info["activeEps"]
            if "simpleDesc" in info:
                sd = info["simpleDesc"]
                dev.endpoints[sd["id"]] = sd
            if "basic" in info:
                dev.basic.update(info["basic"])
            if any(k in info for k in ("nodeDesc", "activeEps", "simpleDesc", "basic", "announce")):
                self.save_soon()
            self._emit(
                {"type": "tx", "ieee": dev.ieee_str, "cluster": info["cluster"], "endpoint": aps["srcEp"], "payload": payload.hex(), "summary": info["summary"]}
            )
        else:  # toDevice
            dev = self._device_for(ev["nwk"], None)
            if dev is None:
                return
            dev.to_device += 1
            self._emit(
                {"type": "rx", "ieee": dev.ieee_str, "cluster": info["cluster"], "endpoint": aps["dstEp"], "payload": payload.hex(), "summary": info["summary"]}
            )
        self._publish_state_soon()

    def _sys(self, summary: str) -> None:
        self._emit({"type": "sys", "summary": f"proxy: {summary}"})

    # ------------------------------------------------------------ events
    def subscribe(self, queue: asyncio.Queue) -> Callable[[], None]:
        self._subscribers.append(queue)
        return lambda: self._subscribers.remove(queue)

    def _emit(self, ev: dict[str, Any]) -> None:
        if self.cid is not None:
            ev = {**ev, "cid": self.cid}
        for q in list(self._subscribers):
            try:
                q.put_nowait(ev)
            except asyncio.QueueFull:
                pass

    _publish = _emit

    def _publish_state_soon(self) -> None:
        if self._loop is None or self._publish_handle is not None:
            return

        def run() -> None:
            self._publish_handle = None
            self._publish_state()

        self._publish_handle = self._loop.call_later(0.3, run)

    def _publish_state(self) -> None:
        self._emit({"type": "state", **self.snapshot()})

    # ------------------------------------------------------------ dashboard
    def _profile_for(self, dev: ProxiedDevice) -> Any:
        model = dev.basic.get("modelId")
        if not model:
            return None
        for p in self.profiles.values():
            if model in p.summary().get("modelIds", []):
                return p
        return None

    def device_dict(self, dev: ProxiedDevice) -> dict[str, Any]:
        prof = self._profile_for(dev)
        pinfo = prof.data.get("device", {}) if prof else {}
        model = dev.basic.get("modelId")
        vendor = dev.basic.get("manufacturerName")
        seen = time.strftime("%H:%M:%S", time.localtime(dev.last_seen)) if dev.last_seen else "—"
        controls = [
            {"id": "seen", "type": "indicator", "label": "Seen", "icon": "timer", "comment": "Last message from the device (local time)."},
            {"id": "lqi", "type": "indicator", "label": "LQI", "icon": "waves", "comment": "Link quality / RSSI of its last message."},
            {"id": "traffic", "type": "indicator", "label": "Msgs", "icon": "link", "comment": "Messages from / to the device since ZigEmu started proxying."},
            {"id": "emulated", "type": "indicator", "label": "ZigEmu", "icon": "dial", "comment": "Whether a ZigEmu profile emulates this model."},
        ]
        indicators = {
            "seen": {"text": seen, "on": None, "swatch": None},
            "lqi": {"text": f"{dev.lqi} · {dev.rssi} dBm" if dev.lqi is not None else "—", "on": None, "swatch": None},
            "traffic": {"text": f"↑{dev.from_device} ↓{dev.to_device}", "on": None, "swatch": None},
            "emulated": {"text": prof.id if prof else "no profile", "on": bool(prof), "swatch": None},
        }
        display = dev.name or model or (f"Device 0x{dev.nwk:04x}" if dev.nwk is not None else dev.ieee_str)
        return {
            "ieee": dev.ieee_str,
            "nwk": f"0x{dev.nwk:04x}" if dev.nwk is not None else "—",
            "name": display,
            "profile": prof.id if prof else None,
            "proxied": True,
            "knownIeee": dev.known_ieee,
            "joined": not dev.left,
            "pairing": False,
            "pairingRemaining": 0,
            "mode": "manual",
            "tags": dev.tags,
            "controls": controls,
            "controlState": {},
            "controlValues": {},
            "capabilities": {},
            "routines": [],
            "routineStatus": {},
            "routineTemplates": [],
            "powered": True,
            "recording": {"active": False},
            "indicators": indicators,
            "groups": {},
            "info": {
                "vendor": vendor or pinfo.get("vendor"),
                "model": model or pinfo.get("model"),
                "description": pinfo.get("description") or "Real device, seen through the proxy",
                "type": pinfo.get("type") or dev.guessed_type(),
                "image": pinfo.get("image"),
                "links": pinfo.get("links", []),
            },
            "capture": {
                "node": dev.node,
                "capability": dev.capability,
                "activeEps": dev.active_eps,
                "endpoints": [
                    {
                        **ep,
                        "inClusters": [cluster_name(c) for c in ep.get("inClusters", [])],
                        "outClusters": [cluster_name(c) for c in ep.get("outClusters", [])],
                    }
                    for _, ep in sorted(dev.endpoints.items())
                ],
                "basic": dev.basic,
                "firstSeen": dev.first_seen,
                "complete": bool(dev.endpoints) and bool(dev.basic.get("modelId")),
            },
        }

    def snapshot(self, include_profiles: bool = False) -> dict[str, Any]:
        net = self.decoder.network
        data: dict[str, Any] = {
            "coordinator": {
                "id": self.cid,
                "name": self.name,
                "kind": "proxy",
                "host": self.host,
                "port": self.port,
                "upstream": self.upstream,
                "hostConnected": self._host is not None,
                "upstreamConnected": self._up_writer is not None,
                "upstreamError": self.upstream_error,
                "networkUp": bool(net.get("up")),
                "channel": net.get("channel"),
                "panId": net.get("panId"),
                "permitJoin": bool(net.get("permitJoin")),
                "ezspVersion": self.decoder.version or None,
            },
            "devices": [self.device_dict(d) for d in sorted(self.devices.values(), key=lambda d: d.first_seen)],
            "settings": {k: v for k, v in self.settings.items() if k != "wishlist"},
            "tagUsage": self.tag_usage(),
        }
        if include_profiles:
            disabled = set(self.settings["disabledProfiles"])
            data["profiles"] = [{**p.summary(), "enabled": p.id not in disabled} for p in self.profiles.values()]
            data["settings"] = self.settings
        return data

    # ------------------------------------------------------------ device operations
    def get_device(self, ieee: str) -> ProxiedDevice:
        return self.devices[int(ieee, 16)]

    def set_tags(self, ieee: str, tags: Any) -> None:
        self.get_device(ieee).tags = self.resolve_tags(tags)
        self.save_now()
        self._publish_state()

    def rename_device(self, ieee: str, name: Any) -> None:
        name = str(name or "").strip()[:60]
        if not name:
            raise ValueError("a device needs a name")
        self.get_device(ieee).name = name
        self.save_now()
        self._publish_state()

    async def remove_device(self, ieee: str) -> None:
        """Forget a captured device (it reappears if it talks again)."""
        dev = self.devices.pop(int(ieee, 16))
        if dev.nwk is not None and self._by_nwk.get(dev.nwk) == dev.ieee:
            del self._by_nwk[dev.nwk]
        self.save_now()
        self._publish_state()

    def update_settings(self, data: dict[str, Any]) -> dict[str, Any]:
        keys = ("disabledProfiles", "wishlist", "tags", "views")
        merged = {**self.settings, **{k: v for k, v in data.items() if k in keys}}
        self.settings = settings_mod.clean(merged, set(self.profiles))
        self.forget_unknown_tags()
        self.save_now()
        self._publish_state()
        return self.settings

    def draft(self, ieee: str) -> dict[str, Any]:
        """A ZigEmu profile draft from what was captured (descriptors + Basic)."""
        dev = self.get_device(ieee)
        vendor = dev.basic.get("manufacturerName") or "Unknown"
        model = dev.basic.get("modelId") or f"device-{dev.ieee_str}"
        pid = re.sub(r"[^a-z0-9]+", "_", f"{vendor}_{model}".lower()).strip("_")[:60]
        node = dev.node or {}
        caps = dev.capability if dev.capability is not None else node.get("macCapabilities")
        logical = node.get("logicalType") or ("router" if caps and caps & 0x02 else "end_device")
        endpoints = []
        for ep_id, ep in sorted(dev.endpoints.items()):
            entry: dict[str, Any] = {
                "id": ep_id,
                "profileId": ep.get("profileId", 260),
                "deviceId": ep.get("deviceId", 0),
                "inClusters": [cluster_name(c) for c in ep.get("inClusters", [])],
                "outClusters": [cluster_name(c) for c in ep.get("outClusters", [])],
            }
            if 0x0000 in ep.get("inClusters", []) and dev.basic:
                entry["attributes"] = {"genBasic": dict(dev.basic)}
            endpoints.append(entry)
        if not endpoints:
            endpoints = [{"id": 1, "profileId": 260, "deviceId": 0, "inClusters": ["genBasic"], "outClusters": []}]
        missing = [x for x, ok in (("simple descriptors", bool(dev.endpoints)), ("Basic attributes", bool(dev.basic)), ("node descriptor", bool(dev.node))) if not ok]
        return {
            "id": pid,
            "name": f"{vendor} {model}",
            "device": {
                "vendor": vendor,
                "model": model,
                "description": f"{vendor} {model} (captured)",
                "type": dev.guessed_type(),
                "links": [],
            },
            "_sources": (
                f"Captured by the ZigEmu proxy from a real device (IEEE {dev.ieee_str}) on "
                f"{time.strftime('%Y-%m-%d', time.localtime(dev.first_seen))}: node / simple descriptors and Basic "
                "attributes as seen on the wire."
                + (f" Missing: {', '.join(missing)} (re-interview the device in Zigbee2MQTT / ZHA to capture them)." if missing else "")
                + " Controls and behaviour still need to be written."
            ),
            "node": {
                "logicalType": logical,
                "rxOnWhenIdle": bool(caps & 0x08) if caps is not None else logical == "router",
                "manufacturerCode": node.get("manufacturerCode", 0),
                "macCapabilities": caps if caps is not None else (0x8E if logical == "router" else 0x80),
                "ieeePrefix": f"{dev.ieee:016x}"[:6] if dev.known_ieee else "00124b",
            },
            "endpoints": endpoints,
            "controls": [],
        }


class _HostSide(asyncio.Protocol):
    def __init__(self, proxy: ProxyCoordinator) -> None:
        self.proxy = proxy
        self.transport: asyncio.Transport | None = None

    def connection_made(self, transport: asyncio.BaseTransport) -> None:
        self.transport = transport  # type: ignore[assignment]
        self.proxy._host_connected(self.transport)

    def data_received(self, data: bytes) -> None:
        if self.transport is not None:
            self.proxy._host_data(self.transport, data)

    def connection_lost(self, exc: Exception | None) -> None:
        if self.transport is not None:
            self.proxy._host_lost(self.transport)
