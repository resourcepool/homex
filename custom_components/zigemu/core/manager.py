"""Several emulated coordinators side by side.

Each coordinator is an independent Emulator (its own NCP TCP port, network,
keys and devices) that a Zigbee host (Zigbee2MQTT, ZHA) connects to. The
dashboard's settings (offered profiles, wishlist, tags, saved views) are
shared by all of them.

Stored document:
    {"settings": {...},
     "coordinators": [{"id", "name", "host", "port", "state": {<Emulator.persist()>}}]}
"""

from __future__ import annotations

import asyncio
import logging
import re
from pathlib import Path
from typing import Any, Awaitable, Callable

from . import settings as settings_mod
from .emulator import Emulator
from .proxy import ProxyCoordinator, parse_upstream
from .profile import load_profiles

_LOGGER = logging.getLogger(__name__)

MAX_COORDINATORS = 32
DEFAULT_PORT = 6638


class SharedSettings:
    def __init__(self) -> None:
        self.settings: dict[str, Any] = {"disabledProfiles": [], "wishlist": [], "tags": [], "views": []}


class CoordinatorError(ValueError):
    """Invalid coordinator request (shown to the user)."""


def _slug(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:24]
    return s or "coordinator"


def migrate_legacy(old: dict[str, Any] | None, host: str, port: int) -> dict[str, Any] | None:
    """A single-coordinator state (ZigSim, or a standalone state file) -> manager document."""
    if not old or "coordinators" in old:
        return old
    state = {k: v for k, v in old.items() if k != "settings"}
    return {
        "settings": old.get("settings", {}),
        "coordinators": [{"id": "main", "name": "Coordinator 1", "host": host, "port": port, "state": state}],
    }


class CoordinatorManager:
    def __init__(
        self,
        load: Callable[[], Awaitable[dict[str, Any] | None]],
        save: Callable[[dict[str, Any]], Awaitable[None]],
        profile_dirs: list[Path] | None = None,
        default_host: str = "0.0.0.0",
    ) -> None:
        self._load = load
        self._save = save
        self._profile_dirs = list(profile_dirs or [])
        self.default_host = default_host
        self.shared = SharedSettings()
        self.entries: list[dict[str, Any]] = []  # stored coordinator entries, in display order
        self.emulators: dict[str, Emulator] = {}
        self.errors: dict[str, str] = {}
        self._subscribers: list[asyncio.Queue] = []
        self._profile_ids: set[str] = set()
        self.profiles: dict[str, Any] = {}
        self._save_lock = asyncio.Lock()

    # ------------------------------------------------------------ lifecycle
    async def start(self) -> None:
        loop = asyncio.get_running_loop()
        self.profiles = await loop.run_in_executor(None, load_profiles, *self._profile_dirs)
        self._profile_ids = set(self.profiles)
        doc = await self._load() or {}
        try:
            stored = dict(doc.get("settings") or {})
            stored["disabledProfiles"] = [p for p in stored.get("disabledProfiles", []) if p in self._profile_ids]
            self.shared.settings = settings_mod.clean(stored, self._profile_ids)
        except ValueError as exc:
            _LOGGER.warning("ignoring stored settings: %s", exc)
        self.entries = [dict(e) for e in doc.get("coordinators", []) if e.get("id")]
        for entry in self.entries:
            try:
                await self._run(entry)
            except CoordinatorError:
                pass  # listed with its error; fix its port from the dashboard
        await self.save()

    async def stop(self) -> None:
        for emu in list(self.emulators.values()):
            await emu.stop()
        await self.save()

    async def save(self) -> None:
        async with self._save_lock:
            await self._save(self.persist())

    def persist(self) -> dict[str, Any]:
        return {"settings": self.shared.settings, "coordinators": self.entries}

    async def _run(self, entry: dict[str, Any]) -> Emulator:
        cid = entry["id"]

        async def load() -> dict[str, Any] | None:
            return entry.get("state")

        async def save(data: dict[str, Any]) -> None:
            entry["state"] = data
            await self.save()

        if entry.get("kind") == "proxy":
            emu = ProxyCoordinator(
                host=entry.get("host") or self.default_host,
                port=int(entry["port"]),
                upstream=entry["upstream"],
                load=load,
                save=save,
                profile_dirs=self._profile_dirs,
                shared=self.shared,
                cid=cid,
            )
            emu.profiles = self.profiles
        else:
            emu = Emulator(
                host=entry.get("host") or self.default_host,
                port=int(entry["port"]),
                load=load,
                save=save,
                profile_dirs=self._profile_dirs,
                shared=self.shared,
                cid=cid,
            )
        emu.name = entry["name"]
        emu.tag_usage_provider = self.tag_usage
        for q in self._subscribers:
            emu.subscribe(q)
        try:
            await emu.start()
        except OSError as exc:
            msg = f"cannot listen on {emu.host}:{emu.port}: {exc.strerror or exc}"
            self.errors[cid] = msg
            _LOGGER.error("coordinator %s: %s", cid, msg)
            try:
                await emu.stop()
            except Exception:  # noqa: BLE001 - half-started
                _LOGGER.debug("stopping half-started coordinator %s", cid, exc_info=True)
            raise CoordinatorError(msg) from exc
        self.errors.pop(cid, None)
        self.emulators[cid] = emu
        return emu

    # ------------------------------------------------------------ queries
    def get(self, cid: str) -> Emulator:
        try:
            return self.emulators[cid]
        except KeyError:
            if any(e["id"] == cid for e in self.entries):
                raise CoordinatorError(f"coordinator {cid!r} is not running: {self.errors.get(cid, 'stopped')}") from None
            raise

    def summary(self) -> list[dict[str, Any]]:
        out = []
        for e in self.entries:
            emu = self.emulators.get(e["id"])
            snap = emu.snapshot()["coordinator"] if emu else {}
            out.append(
                {
                    "id": e["id"],
                    "name": e["name"],
                    "host": e.get("host") or self.default_host,
                    "port": e["port"],
                    "running": emu is not None,
                    "error": self.errors.get(e["id"]),
                    "kind": e.get("kind", "emulated"),
                    "upstream": e.get("upstream"),
                    "upstreamConnected": snap.get("upstreamConnected", False),
                    "hostConnected": snap.get("hostConnected", False),
                    "networkUp": snap.get("networkUp", False),
                    "devices": len(emu.devices) if emu else len((e.get("state") or {}).get("devices", [])),
                }
            )
        return out

    def tag_usage(self) -> dict[str, int]:
        counts: dict[str, int] = {}
        for emu in self.emulators.values():
            for dev in emu.devices.values():
                for t in dev.tags:
                    counts[t] = counts.get(t, 0) + 1
        # coordinators that are not running still hold tagged devices
        for e in self.entries:
            if e["id"] not in self.emulators:
                for d in (e.get("state") or {}).get("devices", []):
                    for t in d.get("tags") or ([d["category"]] if d.get("category") else []):
                        counts[t] = counts.get(t, 0) + 1
        return counts

    # ------------------------------------------------------------ changes
    def _check(self, name: Any, host: Any, port: Any, cid: str | None = None) -> tuple[str, str, int]:
        name = str(name or "").strip()[:40]
        if not name:
            raise CoordinatorError("a coordinator needs a name")
        host = str(host or self.default_host).strip()[:64]
        if not re.fullmatch(r"[0-9A-Za-z.:\-\[\]]+", host):
            raise CoordinatorError("invalid bind address")
        try:
            port = int(port)
        except (TypeError, ValueError):
            raise CoordinatorError("the port must be a number") from None
        if not 1024 <= port <= 65535:
            raise CoordinatorError("the port must be between 1024 and 65535")
        for e in self.entries:
            if e["id"] != cid and int(e["port"]) == port:
                raise CoordinatorError(f"port {port} is already used by {e['name']}")
        return name, host, port

    def next_port(self) -> int:
        used = {int(e["port"]) for e in self.entries}
        port = DEFAULT_PORT
        while port in used:
            port += 1
        return port

    @staticmethod
    def _check_kind(kind: Any, upstream: Any) -> tuple[str, str | None]:
        kind = str(kind or "emulated")
        if kind not in ("emulated", "proxy"):
            raise CoordinatorError("kind must be 'emulated' or 'proxy'")
        if kind == "emulated":
            return kind, None
        try:
            h, p = parse_upstream(upstream)
        except ValueError as exc:
            raise CoordinatorError(str(exc)) from None
        return kind, f"{h}:{p}"

    async def create(self, name: Any, port: Any = None, host: Any = None, kind: Any = None, upstream: Any = None) -> dict[str, Any]:
        if len(self.entries) >= MAX_COORDINATORS:
            raise CoordinatorError(f"at most {MAX_COORDINATORS} coordinators")
        kind, upstream = self._check_kind(kind, upstream)
        name, host, port = self._check(name, host, port if port not in (None, "") else self.next_port())
        base = _slug(name)
        cid, n = base, 2
        while any(e["id"] == cid for e in self.entries):
            cid, n = f"{base}-{n}", n + 1
        entry = {"id": cid, "name": name, "host": host, "port": port, "state": None}
        if kind == "proxy":
            entry.update(kind="proxy", upstream=upstream)
        self.entries.append(entry)
        try:
            await self._run(entry)
        except CoordinatorError:
            self.entries.remove(entry)
            raise
        await self.save()
        self._publish_list()
        return next(c for c in self.summary() if c["id"] == cid)

    async def update(self, cid: str, data: dict[str, Any]) -> dict[str, Any]:
        entry = next((e for e in self.entries if e["id"] == cid), None)
        if entry is None:
            raise KeyError(cid)
        name, host, port = self._check(data.get("name", entry["name"]), data.get("host", entry.get("host")), data.get("port", entry["port"]), cid)
        upstream = entry.get("upstream")
        if entry.get("kind") == "proxy" and "upstream" in data:
            _, upstream = self._check_kind("proxy", data["upstream"])
        restart = (
            host != (entry.get("host") or self.default_host)
            or port != int(entry["port"])
            or upstream != entry.get("upstream")
            or cid not in self.emulators
        )
        if upstream != entry.get("upstream"):
            entry["upstream"] = upstream
        entry["name"] = name
        if cid in self.emulators:
            self.emulators[cid].name = name
        if restart:
            old = (entry.get("host"), entry["port"])
            emu = self.emulators.pop(cid, None)
            if emu is not None:
                await emu.stop()  # saves its state into the entry
            entry["host"], entry["port"] = host, port
            try:
                await self._run(entry)
            except CoordinatorError:
                entry["host"], entry["port"] = old
                try:
                    await self._run(entry)
                except CoordinatorError:
                    pass
                await self.save()
                self._publish_list()
                raise
        await self.save()
        self._publish_list()
        if cid in self.emulators:
            self.emulators[cid]._publish_state()
        return next(c for c in self.summary() if c["id"] == cid)

    async def delete(self, cid: str) -> None:
        entry = next((e for e in self.entries if e["id"] == cid), None)
        if entry is None:
            raise KeyError(cid)
        emu = self.emulators.pop(cid, None)
        if emu is not None:
            await emu.stop()
        self.entries.remove(entry)
        self.errors.pop(cid, None)
        await self.save()
        self._publish_list()

    def update_settings(self, data: dict[str, Any]) -> dict[str, Any]:
        keys = ("disabledProfiles", "wishlist", "tags", "views")
        merged = {**self.shared.settings, **{k: v for k, v in data.items() if k in keys}}
        self.shared.settings = settings_mod.clean(merged, self._profile_ids)
        for emu in self.emulators.values():
            emu.forget_unknown_tags()
            emu.save_now()
            emu._publish_state()
        asyncio.get_running_loop().create_task(self.save())
        return self.shared.settings

    # ------------------------------------------------------------ events
    def subscribe(self, queue: asyncio.Queue) -> Callable[[], None]:
        self._subscribers.append(queue)
        for emu in self.emulators.values():
            emu.subscribe(queue)

        def unsubscribe() -> None:
            if queue in self._subscribers:
                self._subscribers.remove(queue)
            for emu in self.emulators.values():
                if queue in emu._subscribers:
                    emu._subscribers.remove(queue)

        return unsubscribe

    def _publish_list(self) -> None:
        ev = {"type": "coordinators", "coordinators": self.summary()}
        for q in list(self._subscribers):
            try:
                q.put_nowait(ev)
            except asyncio.QueueFull:
                pass
