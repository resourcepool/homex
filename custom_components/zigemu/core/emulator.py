"""Emulator: the emulated NCP (TCP server) + the virtual Zigbee network."""

from __future__ import annotations

import asyncio
import logging
import random
import time
from collections.abc import Awaitable, Callable
from pathlib import Path
from typing import Any

from . import ezsp_runtime as rt
from . import settings as settings_mod
from .ash import AshNcp
from .device import OutgoingMessage, SimDevice
from .ezsp import SL_NETWORK_DOWN, SL_NETWORK_UP, EzspNcp
from .ezsp_runtime import ApsFrame
from .profile import Profile, load_profiles

_LOGGER = logging.getLogger(__name__)

SL_ZIGBEE_NETWORK_OPENED = 0x0C18
SL_ZIGBEE_NETWORK_CLOSED = 0x0C19
DEVICE_LEFT = 2
NODE_TYPE = {"router": 2, "end_device": 3, "sleepy_end_device": 4}
# delay between a host command response and the device's reply / callbacks
DEVICE_REPLY_DELAY = 0.02
NETWORK_UP_DELAY = 0.2
ANNOUNCE_DELAY = 0.5
PAIRING_DEFAULT_S = 180
PAIRING_MAX_S = 3600


class _HostProtocol(asyncio.Protocol):
    def __init__(self, sim: Emulator) -> None:
        self.sim = sim
        self.transport: asyncio.Transport | None = None

    def connection_made(self, transport: asyncio.BaseTransport) -> None:
        self.transport = transport  # type: ignore[assignment]
        self.sim._host_connected(self)

    def data_received(self, data: bytes) -> None:
        self.sim._ash.feed(data)

    def connection_lost(self, exc: Exception | None) -> None:
        self.sim._host_disconnected(self)


class Emulator:
    def __init__(
        self,
        host: str,
        port: int,
        load: Callable[[], Awaitable[dict[str, Any] | None]],
        save: Callable[[dict[str, Any]], Awaitable[None]],
        profile_dirs: list[Path] | None = None,
        shared: Any = None,
        cid: str | None = None,
    ) -> None:
        self.host = host
        self.port = port
        self.cid = cid  # coordinator id when run by a CoordinatorManager
        self.name: str | None = None
        # tags are shared by all coordinators: the manager counts their use across all of them
        self.tag_usage_provider: Callable[[], dict[str, int]] | None = None
        self._shared = shared  # SharedSettings when several coordinators share settings
        self._load = load
        self._save = save
        self._profile_dirs = list(profile_dirs or [])
        self.profiles: dict[str, Profile] = {}
        self.devices: dict[int, SimDevice] = {}
        self._own_settings: dict[str, Any] = {"disabledProfiles": [], "wishlist": [], "tags": [], "views": []}
        self._subscribers: list[asyncio.Queue] = []
        self._server: asyncio.base_events.Server | None = None
        self._protocol: _HostProtocol | None = None
        self._ash = AshNcp(self._write, self._on_ezsp_frame, self._on_ash_reset)
        self._ezsp = EzspNcp(self, self._ash.send)
        self._loop: asyncio.AbstractEventLoop | None = None
        self._permit_handle: asyncio.TimerHandle | None = None
        self._save_handle: asyncio.TimerHandle | None = None
        self._outbox: asyncio.Queue[Callable[[], None]] = asyncio.Queue()
        self._outbox_task: asyncio.Task | None = None
        self._pairing_task: asyncio.Task | None = None
        self._stopped = False
        self._aps_seq = random.randint(0, 255)
        # persistent network state ("NCP tokens")
        self.coordinator_eui64 = 0
        self.formed = False
        self.params: dict[str, Any] = {}
        self.network_key = "00" * 16
        self.tc_link_key = "00" * 16
        self.network_key_seq = 0
        self.nwk_frame_counter = 0
        self.tc_frame_counter = 0
        self.permit_join = False
        self.restored_eui64 = 0xFFFFFFFFFFFFFFFF  # NVM3 CREATOR_STACK_RESTORED_EUI64
        self.key_table: dict[int, tuple[int, str]] = {}  # persistent (token) APS link keys
        self.address_table: dict[int, tuple[int, int]] = {}  # RAM, cleared on NCP reset
        self.alternate_network_key: str | None = None
        self._counters = [0] * 64

    @property
    def settings(self) -> dict[str, Any]:
        return self._shared.settings if self._shared is not None else self._own_settings

    @settings.setter
    def settings(self, value: dict[str, Any]) -> None:
        if self._shared is not None:
            self._shared.settings = value
        else:
            self._own_settings = value

    # ------------------------------------------------------------ lifecycle
    async def start(self) -> None:
        self._loop = asyncio.get_running_loop()
        # file I/O off the event loop (Home Assistant flags blocking calls)
        self.profiles = await self._loop.run_in_executor(None, load_profiles, *self._profile_dirs)
        data = await self._load() or {}
        self.coordinator_eui64 = data.get("coordinatorEui64") or int.from_bytes(
            bytes.fromhex("00124b00") + random.randbytes(4), "big"
        )
        self.restored_eui64 = data.get("restoredEui64", 0xFFFFFFFFFFFFFFFF)
        self.key_table = {int(k): (v[0], v[1]) for k, v in data.get("keyTable", {}).items()}
        nwk = data.get("network") or {}
        self.formed = nwk.get("formed", False)
        self.params = nwk.get("params", {})
        self.network_key = nwk.get("networkKey", self.network_key)
        self.tc_link_key = nwk.get("tcLinkKey", self.tc_link_key)
        self.network_key_seq = nwk.get("networkKeySeq", 0)
        # jump frame counters on restart, like real firmware does
        self.nwk_frame_counter = nwk.get("nwkFrameCounter", 0) + 0x1000
        self.tc_frame_counter = nwk.get("tcFrameCounter", 0) + 0x1000
        if self._shared is None:  # settings live with the manager otherwise
            try:
                stored = dict(data.get("settings") or {})
                stored["disabledProfiles"] = [p for p in stored.get("disabledProfiles", []) if p in self.profiles]
                self.settings = settings_mod.clean(stored, set(self.profiles))
            except ValueError as exc:
                _LOGGER.warning("ignoring stored settings: %s", exc)
        for d in data.get("devices", []):
            prof = self.profiles.get(d["profile"])
            if prof is None:
                _LOGGER.warning("dropping device %s: profile %s not found", d.get("ieee"), d["profile"])
                continue
            dev = self._make_device(prof, d["ieee"], d["nwk"], d.get("name"))
            dev.restore(d)
            self.devices[dev.ieee] = dev
        self._outbox_task = asyncio.create_task(self._drain_outbox())
        self._pairing_task = asyncio.create_task(self._pairing_loop())
        for dev in self.devices.values():
            dev.start()
            dev.runner.sync()
        self._server = await asyncio.get_running_loop().create_server(lambda: _HostProtocol(self), self.host, self.port)
        _LOGGER.info("ZigEmu NCP listening on %s:%d (coordinator %016x)", self.host, self.port, self.coordinator_eui64)
        await self.save()

    async def stop(self) -> None:
        if self._stopped:
            return
        self._stopped = True
        if self._save_handle:
            self._save_handle.cancel()
        for dev in self.devices.values():
            dev.runner.stop()
            dev.stop()
        if self._pairing_task:
            self._pairing_task.cancel()
        if self._server:
            self._server.close()
            await self._server.wait_closed()
        if self._protocol and self._protocol.transport:
            self._protocol.transport.close()
        if self._outbox_task:
            self._outbox_task.cancel()
        await self.save()

    def persist(self) -> dict[str, Any]:
        return {
            "coordinatorEui64": self.coordinator_eui64,
            "restoredEui64": self.restored_eui64,
            "keyTable": {str(k): list(v) for k, v in self.key_table.items()},
            "network": {
                "formed": self.formed,
                "params": self.params,
                "networkKey": self.network_key,
                "tcLinkKey": self.tc_link_key,
                "networkKeySeq": self.network_key_seq,
                "nwkFrameCounter": self.nwk_frame_counter,
                "tcFrameCounter": self.tc_frame_counter,
            },
            "devices": [d.persist() for d in self.devices.values()],
            **({"settings": self.settings} if self._shared is None else {}),
        }

    def update_settings(self, data: dict[str, Any]) -> dict[str, Any]:
        """Replace the settings (validated); unspecified keys are kept."""
        keys = ("disabledProfiles", "wishlist", "tags", "views")
        merged = {**self.settings, **{k: v for k, v in data.items() if k in keys}}
        self.settings = settings_mod.clean(merged, set(self.profiles))
        self.forget_unknown_tags()
        self.save_now()
        self._publish_state()
        return self.settings

    def tag_usage(self) -> dict[str, int]:
        """Number of devices using each tag (on every coordinator when managed)."""
        if self.tag_usage_provider is not None:
            return self.tag_usage_provider()
        counts: dict[str, int] = {}
        for dev in self.devices.values():
            for t in dev.tags:
                counts[t] = counts.get(t, 0) + 1
        return counts

    def forget_unknown_tags(self) -> None:
        """A deleted tag is removed from the devices that had it."""
        known = {t["id"] for t in self.settings["tags"]}
        for dev in self.devices.values():
            dev.tags = [t for t in dev.tags if t in known]

    def resolve_tags(self, tags: Any) -> list[str]:
        """Tag ids for a device, from ids or names; unknown names become new tags."""
        if tags is None:
            return []
        if not isinstance(tags, list) or len(tags) > 20:
            raise ValueError("tags must be a list (at most 20)")
        current = list(self.settings["tags"])
        by_id = {t["id"]: t for t in current}
        by_name = {t["name"].lower(): t for t in current}
        out: list[str] = []
        created = False
        for raw in tags:
            ref = str(raw.get("id") or raw.get("name") or "") if isinstance(raw, dict) else str(raw or "")
            ref = ref.strip()
            if not ref:
                continue
            tag = by_id.get(ref) or by_name.get(ref.lower())
            if tag is None:
                tag = settings_mod.new_tag(ref, current)
                current.append(tag)
                by_id[tag["id"]] = tag
                by_name[tag["name"].lower()] = tag
                created = True
            if tag["id"] not in out:
                out.append(tag["id"])
        if created:
            self.settings = settings_mod.clean({**self.settings, "tags": current}, set(self.profiles))
        return out

    def set_tags(self, ieee: str, tags: Any) -> None:
        dev = self.get_device(ieee)
        dev.tags = self.resolve_tags(tags)
        self.save_now()
        self._publish_state()

    def rename_device(self, ieee: str, name: Any) -> None:
        name = str(name or "").strip()[:60]
        if not name:
            raise ValueError("a device needs a name")
        self.get_device(ieee).name = name
        self.save_now()
        self._publish_state()

    async def save(self) -> None:
        await self._save(self.persist())

    def save_now(self) -> None:
        """Persist configuration changes immediately (don't rely on a clean shutdown)."""
        if self._save_handle:
            self._save_handle.cancel()
            self._save_handle = None
        if self._loop is not None:
            self._loop.create_task(self.save())

    def save_soon(self) -> None:
        if self._loop is None:
            return
        if self._save_handle:
            self._save_handle.cancel()
        self._save_handle = self._loop.call_later(1.0, lambda: asyncio.ensure_future(self.save()))

    # ------------------------------------------------------- host transport
    def _host_connected(self, proto: _HostProtocol) -> None:
        if self._protocol and self._protocol.transport:
            _LOGGER.warning("new host connection replaces the previous one")
            self._protocol.transport.close()
        self._protocol = proto
        self._ash.connected = False
        _LOGGER.info("host connected")
        self._publish_state()

    def _host_disconnected(self, proto: _HostProtocol) -> None:
        if self._protocol is proto:
            self._protocol = None
            self._ash.connected = False
            self._ezsp.reset()
            self._set_permit(0)
            _LOGGER.info("host disconnected")
            self._publish_state()

    def _write(self, data: bytes) -> None:
        if self._protocol and self._protocol.transport:
            self._protocol.transport.write(data)

    def _on_ash_reset(self) -> None:
        # Like real firmware, a restored EUI64 written by the host takes effect on reset.
        if self.restored_eui64 != 0xFFFFFFFFFFFFFFFF and self.restored_eui64 != self.coordinator_eui64:
            _LOGGER.info("applying restored EUI64 %016x", self.restored_eui64)
            self.coordinator_eui64 = self.restored_eui64
            self.save_soon()
        self.address_table.clear()
        self._ezsp.reset()
        self._set_permit(0)
        self._publish_state()

    def _on_ezsp_frame(self, frame: bytes) -> None:
        self._ezsp.handle_frame(frame)

    def later(self, fn: Callable[[], None], delay: float = 0.0) -> None:
        assert self._loop is not None
        if delay:
            self._loop.call_later(delay, fn)
        else:
            self._loop.call_soon(fn)

    async def _drain_outbox(self) -> None:
        """Deliver device->host traffic in order, slightly after the command that caused it."""
        while True:
            fn = await self._outbox.get()
            await asyncio.sleep(DEVICE_REPLY_DELAY)
            try:
                fn()
            except Exception:  # noqa: BLE001
                _LOGGER.exception("outbox delivery failed")

    # ----------------------------------------------- interface used by EZSP
    def after_command(self, frame_id: int) -> None:
        pass

    def reboot_ncp(self) -> None:
        """NCP reboot (resetNode): volatile state is lost and the NCP announces RSTACK."""
        _LOGGER.info("NCP reboot requested by the host")
        self._on_ash_reset()
        self._ash.announce_reset()

    def lookup_nwk(self, eui64: int) -> int | None:
        if eui64 == self.coordinator_eui64:
            return 0x0000
        for d in self.devices.values():
            if d.joined and d.ieee == eui64:
                return d.nwk
        for e, nwk in self.address_table.values():
            if e == eui64:
                return nwk
        return None

    def lookup_eui64(self, nwk: int) -> int | None:
        if nwk == 0x0000:
            return self.coordinator_eui64
        for d in self.devices.values():
            if d.joined and d.nwk == nwk:
                return d.ieee
        for e, n in self.address_table.values():
            if n == nwk:
                return e
        return None

    def remove_device_request(self, target_eui64: int) -> bool:
        """Host asked the trust center to remove a device (APS remove-device): it leaves."""
        dev = self.devices.get(target_eui64)
        if dev is None or not dev.joined:
            return False
        dev.release_all()
        dev.joined = False
        self.later(lambda: self._announce_leave(dev), 0.1)
        self._publish({"type": "sys", "ieee": dev.ieee_str, "summary": "removed by the trust center"})
        return True

    def neighbors(self) -> list[SimDevice]:
        """Neighbor table: routers in radio range (every joined, powered router)."""
        return [d for d in self.devices.values() if d.joined and d.powered and d.node.get("logicalType") == "router"]

    def child_at(self, index: int) -> tuple[int, int, int] | None:
        """Child table slot: (eui64, EmberNodeType, nwk) of a joined end device."""
        children = [d for d in self.devices.values() if d.joined and d.node.get("logicalType", "end_device") == "end_device"]
        if index >= len(children):
            return None
        d = children[index]
        return d.ieee, self._node_type(d), d.nwk

    def set_restored_eui64(self, eui64: int) -> None:
        self.restored_eui64 = eui64
        self.save_soon()

    def token_factory_reset(self) -> None:
        """Wipe network tokens (stack keys, node data), like the firmware does."""
        _LOGGER.info("token factory reset: forgetting the network")
        self.formed = False
        self.params = {}
        self._ezsp.session.network_up = False
        for dev in self.devices.values():
            dev.joined = False
        self.save_soon()
        self._publish_state()

    def counters_bytes(self, count: int, clear: bool) -> bytes:
        out = b"".join(min(v, 0xFFFF).to_bytes(2, "little") for v in self._counters[:count])
        if clear:
            self._counters = [0] * len(self._counters)
        return out

    def next_aps_seq(self) -> int:
        self._aps_seq = (self._aps_seq + 1) & 0xFF
        return self._aps_seq

    def next_nwk_frame_counter(self) -> int:
        self.nwk_frame_counter += 1
        self.save_soon()
        return self.nwk_frame_counter

    def form(self, params: dict[str, Any], security: dict[str, Any]) -> None:
        self.params = params
        self.network_key = security.get("network_key", self.network_key)
        self.tc_link_key = security.get("tc_link_key", self.tc_link_key)
        self.network_key_seq = security.get("key_seq", 0)
        self.formed = True
        # a freshly formed network knows no devices
        for dev in self.devices.values():
            dev.joined = False
        _LOGGER.info("network formed: channel %s pan 0x%04x", params["radioChannel"], params["panId"])
        self.save_soon()

    def leave(self) -> None:
        self.formed = False
        self._ezsp.session.network_up = False
        self.later(lambda: rt.stack_status(self._ezsp, SL_NETWORK_DOWN), NETWORK_UP_DELAY)
        self.save_soon()
        self._publish_state()

    def schedule_network_up(self) -> None:
        def up() -> None:
            self._ezsp.session.network_up = True
            rt.stack_status(self._ezsp, SL_NETWORK_UP)
            self._publish_state()

        self.later(up, NETWORK_UP_DELAY)

    def set_permit_join(self, duration: int) -> None:
        self.later(lambda: self._set_permit(duration))

    def _set_permit(self, duration: int) -> None:
        if self._permit_handle:
            self._permit_handle.cancel()
            self._permit_handle = None
        was = self.permit_join
        self.permit_join = duration > 0
        if self.permit_join and duration != 0xFF and self._loop:
            self._permit_handle = self._loop.call_later(duration, lambda: self._set_permit(0))
        if self.permit_join:
            for dev in self.devices.values():
                self._try_pair(dev)
        if was != self.permit_join:
            if self._ash.connected and self._ezsp.session.network_up:
                rt.stack_status(self._ezsp, SL_ZIGBEE_NETWORK_OPENED if self.permit_join else SL_ZIGBEE_NETWORK_CLOSED)
            self._publish_state()

    def host_send(self, dest: int, aps: ApsFrame, payload: bytes, *, broadcast: bool, group: int | None = None) -> bool:
        """A frame sent by the host through the NCP. Returns False if undeliverable."""
        deliveries: list[tuple[SimDevice, int]] = []
        if group is not None:
            # multicast: only members of the group, on each member endpoint
            for d in self.devices.values():
                if d.joined and d.powered:
                    deliveries += [(d, ep) for ep, gs in d.groups.items() if group in gs]
        elif broadcast:
            if aps.profile_id == 0:
                return True  # ZDO broadcasts (e.g. Mgmt_Permit_Join) need no device reply
            # 0xFFFD rx-on-when-idle / 0xFFFC routers: sleepy end devices do not get it
            for d in self.devices.values():
                if d.joined and d.powered and (dest == 0xFFFF or d.node.get("rxOnWhenIdle", True)):
                    if dest == 0xFFFC and d.node.get("logicalType") != "router":
                        continue
                    deliveries.append((d, aps.dst_ep))
        elif dest == 0x0000:
            if aps.profile_id == 0:
                self._outbox.put_nowait(lambda: self._coordinator_zdo(aps.cluster_id, payload))
            return True
        else:
            target = next((d for d in self.devices.values() if d.joined and d.nwk == dest), None)
            if target is None or not target.powered:
                return False  # no APS ack: delivery failure
            deliveries.append((target, aps.dst_ep))
        multi = broadcast or group is not None
        for dev, ep in deliveries:
            self._outbox.put_nowait(
                lambda dev=dev, ep=ep: dev.handle_message(aps.profile_id, aps.cluster_id, aps.src_ep, ep, payload, broadcast=multi)
            )
        return True

    def _coordinator_zdo(self, cluster: int, payload: bytes) -> None:
        """Answer ZDO requests the host addresses to the coordinator itself."""
        seq = payload[0] if payload else 0
        body = payload[1:]
        nwk = b"\x00\x00"
        eps = self._ezsp.session.endpoints
        rsp: bytes | None = None
        if cluster == 0x0002:  # Node_Desc
            # coordinator, 2.4GHz, mac caps 0x8F, Silicon Labs manuf code
            rsp = b"\x00" + nwk + bytes([0x00, 0x40, 0x8F]) + (0x1049).to_bytes(2, "little") + bytes([0x52])
            rsp += (0x0080).to_bytes(2, "little") + (0x2C41).to_bytes(2, "little") + (0x0080).to_bytes(2, "little") + b"\x00"
        elif cluster == 0x0005:  # Active_EP
            ids = sorted(eps)
            rsp = b"\x00" + nwk + bytes([len(ids)] + ids)
        elif cluster == 0x0004:  # Simple_Desc
            ep = body[2] if len(body) > 2 else 0
            raw = eps.get(ep)
            if raw is None:
                rsp = b"\x82" + nwk + b"\x00"
            else:
                ep_id, prof, dev_id, ver, n_in, n_out = raw[0], raw[1:3], raw[3:5], raw[5], raw[6], raw[7]
                ins = raw[8 : 8 + 2 * n_in]
                outs = raw[8 + 2 * n_in : 8 + 2 * n_in + 2 * n_out]
                sd = bytes([ep_id]) + prof + dev_id + bytes([ver, n_in]) + ins + bytes([n_out]) + outs
                rsp = b"\x00" + nwk + bytes([len(sd)]) + sd
        elif cluster in (0x0001, 0x0000):  # IEEE_addr / NWK_addr
            rsp = b"\x00" + self.coordinator_eui64.to_bytes(8, "little") + nwk
        elif cluster == 0x0031:  # Mgmt_Lqi: report joined routers/end devices
            joined = [d for d in self.devices.values() if d.joined]
            rsp = bytes([0x00, len(joined), 0, len(joined)])
            for d in joined:
                ext = bytes.fromhex(self.params.get("extendedPanId", "00" * 8))
                dtype = 1 if d.node.get("logicalType") == "router" else 2
                rel = 1  # child
                rx = 1 if d.node.get("rxOnWhenIdle", True) else 0
                rsp += ext + d.ieee.to_bytes(8, "little") + d.nwk.to_bytes(2, "little")
                rsp += bytes([dtype | (rx << 2) | (rel << 4), 0x02, 1, 220])
        elif cluster == 0x0032:  # Mgmt_Rtg
            rsp = bytes([0x00, 0, 0, 0])
        elif cluster & 0x8000:
            return
        else:
            rsp = b"\x84"  # NOT_SUPPORTED
        aps = ApsFrame(0x0000, cluster | 0x8000, 0, 0, sequence=self.next_aps_seq())
        if self._ash.connected:
            rt.incoming_message(self._ezsp, rt.IN_UNICAST, aps, 0x0000, self.coordinator_eui64, bytes([seq]) + rsp)

    # ------------------------------------------------------------- devices
    def _make_device(self, prof: Profile, ieee: int, nwk: int, name: str | None) -> SimDevice:
        return SimDevice(prof, ieee, nwk, self._device_send, name=name, events=self._device_event, net_info=self._net_info)

    def _net_info(self) -> dict[str, Any]:
        return {"extendedPanId": self.params.get("extendedPanId", "00" * 8), "coordinatorEui64": self.coordinator_eui64}

    def _device_send(self, dev: SimDevice, msg: OutgoingMessage) -> None:
        aps = ApsFrame(msg.profile_id, msg.cluster_id, msg.src_endpoint, msg.dst_endpoint, sequence=dev.next_tsn())
        msg_type = rt.IN_BROADCAST if msg.broadcast else rt.IN_UNICAST

        def deliver() -> None:
            if self._ash.connected and self._ezsp.session.network_up:
                rt.incoming_message(self._ezsp, msg_type, aps, dev.nwk, dev.ieee, msg.payload)

        self._outbox.put_nowait(deliver)

    def _device_event(self, ev: dict[str, Any]) -> None:
        if ev.get("type") in ("routines", "device_state"):
            self._publish_state_soon()
            if ev.get("type") == "device_state":
                self.save_soon()
            return
        if ev.get("type") == "left":
            dev = self.devices.get(int(ev["ieee"], 16))
            if dev:
                self._outbox.put_nowait(lambda: self._announce_leave(dev))
        self._publish(ev)

    def _announce_leave(self, dev: SimDevice) -> None:
        if self._ash.connected and self._ezsp.session.network_up:
            if dev.node.get("logicalType", "end_device") == "end_device":
                rt.child_join(self._ezsp, 0, False, dev.nwk, dev.ieee, self._node_type(dev))
            rt.trust_center_join(self._ezsp, dev.nwk, dev.ieee, DEVICE_LEFT, 0, 0x0000)
        self.save_soon()
        self._publish_state()

    def _node_type(self, dev: SimDevice) -> int:
        logical = dev.node.get("logicalType", "end_device")
        if logical == "end_device" and dev.node.get("rxOnWhenIdle") is False:
            logical = "sleepy_end_device"
        return NODE_TYPE.get(logical, 3)

    def _random_ieee(self, prefix: str) -> int:
        while True:
            hexstr = (prefix + random.randbytes(8).hex())[:16]
            ieee = int(hexstr, 16)
            if ieee not in self.devices:
                return ieee

    def _random_nwk(self) -> int:
        used = {d.nwk for d in self.devices.values()}
        while True:
            nwk = random.randint(0x0001, 0xFFF7)
            if nwk not in used:
                return nwk

    def add_device(self, profile_id: str, name: str | None = None, tags: Any = None) -> SimDevice:
        prof = self.profiles[profile_id]
        tag_ids = self.resolve_tags(tags)
        name = (str(name).strip()[:60] or None) if name else None
        dev = self._make_device(prof, self._random_ieee(prof.ieee_prefix), self._random_nwk(), name)
        dev.tags = tag_ids
        self.devices[dev.ieee] = dev
        dev.start()
        self.save_now()
        self._publish_state()
        return dev

    def get_device(self, ieee: str) -> SimDevice:
        return self.devices[int(ieee, 16)]

    async def join_device(self, ieee: str) -> None:
        dev = self.get_device(ieee)
        if not (self._ash.connected and self._ezsp.session.network_up):
            raise RuntimeError("no Zigbee host driver connected, or its network is not up")
        if not dev.joined and not self.permit_join:
            raise RuntimeError("joining is not permitted: open permit join from your Zigbee host (Zigbee2MQTT, ZHA…)")
        # A fresh join needs permit-join; an already-joined device performs an
        # unsecured rejoin (allowed by the TC policy even when joining is closed),
        # which also lets a host that lost its database rediscover the device.
        rejoin = dev.joined
        dev.joined = True
        if dev.node.get("logicalType", "end_device") == "end_device":
            rt.child_join(self._ezsp, 0, True, dev.nwk, dev.ieee, self._node_type(dev))
        rt.trust_center_join(self._ezsp, dev.nwk, dev.ieee, 3 if rejoin else 1, 0, 0x0000)
        self._publish({"type": "sys", "ieee": dev.ieee_str, "summary": "rejoined network" if rejoin else "joined network"})
        def announced() -> None:
            dev.announce()
            self.later(lambda: dev.run_profile_event("joined"), 1.0)

        self.later(announced, ANNOUNCE_DELAY)
        self.save_now()
        self._publish_state()

    # ------------------------------------------------- pairing / reset / auto
    def network_open(self) -> bool:
        return self._ash.connected and self._ezsp.session.network_up and self.permit_join

    async def set_pairing(self, ieee: str, enabled: bool, duration: int = PAIRING_DEFAULT_S) -> None:
        """Put the device in (or out of) pairing mode.

        Like a real device after a factory reset or a long press on its setup
        button, it keeps looking for a network that permits joining until it
        joins or the pairing window expires.
        """
        dev = self.get_device(ieee)
        if enabled:
            if dev.joined:
                raise RuntimeError("device is already joined: reset it to pair it again")
            duration = max(10, min(int(duration), PAIRING_MAX_S))
            dev.pairing_until = time.monotonic() + duration
            self._publish({"type": "sys", "ieee": dev.ieee_str, "summary": f"pairing mode for {duration} s"})
            self._try_pair(dev)
        else:
            dev.pairing_until = None
            self._publish({"type": "sys", "ieee": dev.ieee_str, "summary": "pairing mode off"})
        self._publish_state()

    def _try_pair(self, dev: SimDevice) -> None:
        if dev.pairing and not dev.joined and self.network_open():
            dev.pairing_until = None
            asyncio.ensure_future(self.join_device(dev.ieee_str))

    async def _pairing_loop(self) -> None:
        while True:
            await asyncio.sleep(1)
            for dev in list(self.devices.values()):
                if dev.pairing_until is None:
                    continue
                if not dev.pairing:
                    dev.pairing_until = None
                    self._publish({"type": "sys", "ieee": dev.ieee_str, "summary": "pairing window expired"})
                    self._publish_state()
                else:
                    self._try_pair(dev)

    async def reset_device(self, ieee: str, pair: bool = True) -> None:
        """Factory reset: leave the network, forget state, optionally start pairing."""
        dev = self.get_device(ieee)
        if dev.joined:
            self._announce_leave(dev)
        dev.factory_reset()
        # A factory-new device associates from scratch: its parent hands out a new NWK address.
        dev.nwk = self._random_nwk()
        self._publish({"type": "sys", "ieee": dev.ieee_str, "summary": "factory reset"})
        if pair:
            await self.set_pairing(ieee, True)
        self.save_now()
        self._publish_state()

    def start_recording(self, ieee: str) -> None:
        self.get_device(ieee).start_recording()
        self._publish_state()

    def stop_recording(self, ieee: str) -> dict[str, Any]:
        draft = self.get_device(ieee).stop_recording()
        self._publish_state()
        return draft

    def set_mode(self, ieee: str, mode: str) -> None:
        self.get_device(ieee).set_mode(mode)
        self.save_now()
        self._publish_state()

    def set_routines(self, ieee: str, routines: list[dict[str, Any]]) -> None:
        self.get_device(ieee).set_routines(routines)
        self.save_now()
        self._publish_state()

    async def leave_device(self, ieee: str) -> None:
        dev = self.get_device(ieee)
        if not dev.joined:
            return
        dev.release_all()
        dev.joined = False
        self._announce_leave(dev)
        self._publish({"type": "sys", "ieee": dev.ieee_str, "summary": "left network"})

    async def remove_device(self, ieee: str) -> None:
        dev = self.get_device(ieee)
        await self.leave_device(ieee)
        dev.runner.stop()
        dev.stop()
        del self.devices[dev.ieee]
        self.save_now()
        self._publish_state()

    # --------------------------------------------------------------- events
    def subscribe(self, queue: asyncio.Queue) -> Callable[[], None]:
        self._subscribers.append(queue)
        return lambda: self._subscribers.remove(queue)

    def _publish(self, ev: dict[str, Any]) -> None:
        if self.cid is not None:
            ev = {**ev, "cid": self.cid}
        for q in list(self._subscribers):
            try:
                q.put_nowait(ev)
            except asyncio.QueueFull:
                pass

    def _publish_state_soon(self) -> None:
        """Coalesce frequent device state changes (meters tick every second)."""
        if self._loop is None or getattr(self, "_state_handle", None) is not None:
            return

        def fire() -> None:
            self._state_handle = None
            self._publish_state()

        self._state_handle = self._loop.call_later(0.25, fire)

    def _publish_state(self) -> None:
        self._publish({"type": "state", **self.snapshot()})

    def snapshot(self, include_profiles: bool = False) -> dict[str, Any]:
        data: dict[str, Any] = {
            "coordinator": {
                "id": self.cid,
                "name": self.name,
                "host": self.host,
                "port": self.port,
                "ieee": f"0x{self.coordinator_eui64:016x}",
                "hostConnected": self._ash.connected,
                "networkUp": self._ezsp.session.network_up,
                "channel": self.params.get("radioChannel"),
                "panId": self.params.get("panId"),
                "permitJoin": self.permit_join,
            },
            "devices": [d.to_dict() for d in self.devices.values()],
            # keeps every open dashboard in sync (tags created on the fly); the wishlist only on full reads
            "settings": {k: v for k, v in self.settings.items() if k != "wishlist"},
            "tagUsage": self.tag_usage(),
        }
        if include_profiles:
            disabled = set(self.settings["disabledProfiles"])
            data["profiles"] = [{**p.summary(), "enabled": p.id not in disabled} for p in self.profiles.values()]
            data["settings"] = self.settings
        return data
