"""Dashboard REST + WebSocket API (plain aiohttp handlers).

Used both by the standalone server and wrapped in Home Assistant views.
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import TYPE_CHECKING, Any, Awaitable, Callable

from aiohttp import WSMsgType, web

if TYPE_CHECKING:
    from .emulator import Emulator
    from .manager import CoordinatorManager

_LOGGER = logging.getLogger(__name__)


def _err(msg: str, status: int = 400) -> web.Response:
    return web.json_response({"error": msg}, status=status)


async def _json(request: web.Request) -> dict[str, Any] | None:
    try:
        body = await request.json()
    except json.JSONDecodeError:
        return None
    return body if isinstance(body, dict) else None


class Api:
    """Routes:
    - global: coordinators (list / create / update / delete), profiles, settings, ws
    - per coordinator: {prefix}/c/{cid}/state, devices, routines, …
    """

    def __init__(
        self,
        get_manager: Callable[[], CoordinatorManager],
        authenticate: Callable[[str], Awaitable[bool]] | None = None,
    ) -> None:
        # A getter, because HA views outlive config-entry reloads.
        self._get_manager = get_manager
        # Browsers can't set headers on WebSockets: when set, the first message
        # must be {"type": "auth", "access_token": ...} and pass this check.
        self._authenticate = authenticate

    @property
    def manager(self) -> CoordinatorManager:
        return self._get_manager()

    def _sim(self, request: web.Request) -> Emulator:
        return self.manager.get(request.match_info["cid"])

    # ------------------------------------------------------------ coordinators
    async def coordinators(self, request: web.Request) -> web.Response:
        m = self.manager
        return web.json_response({"coordinators": m.summary(), "nextPort": m.next_port(), "defaultHost": m.default_host})

    async def create_coordinator(self, request: web.Request) -> web.Response:
        from .manager import CoordinatorError

        body = await _json(request)
        if body is None:
            return _err("invalid JSON")
        try:
            return web.json_response(
                await self.manager.create(body.get("name"), body.get("port"), body.get("host"), body.get("kind"), body.get("upstream"))
            )
        except CoordinatorError as exc:
            return _err(str(exc), 409)

    async def update_coordinator(self, request: web.Request) -> web.Response:
        from .manager import CoordinatorError

        body = await _json(request)
        if body is None:
            return _err("invalid JSON")
        try:
            return web.json_response(await self.manager.update(request.match_info["cid"], body))
        except KeyError:
            return _err("no such coordinator", 404)
        except CoordinatorError as exc:
            return _err(str(exc), 409)

    async def delete_coordinator(self, request: web.Request) -> web.Response:
        try:
            await self.manager.delete(request.match_info["cid"])
        except KeyError:
            return _err("no such coordinator", 404)
        return web.json_response({"ok": True})

    # ------------------------------------------------------------ per coordinator
    async def state(self, request: web.Request) -> web.Response:
        return web.json_response(self._sim(request).snapshot(include_profiles=True))

    async def profiles(self, request: web.Request) -> web.Response:
        return web.json_response([p.data for p in self.manager.profiles.values()])

    async def update_settings(self, request: web.Request) -> web.Response:
        try:
            body = await request.json()
        except json.JSONDecodeError:
            return _err("invalid JSON")
        if not isinstance(body, dict):
            return _err("settings must be an object")
        try:
            settings = self.manager.update_settings(body)
        except ValueError as exc:
            return _err(str(exc))
        return web.json_response(settings)

    async def device_draft(self, request: web.Request) -> web.Response:
        """Proxy coordinators: a profile draft from a real device's captured descriptors."""
        sim = self._sim(request)
        if getattr(sim, "kind", "emulated") != "proxy":
            return _err("profile drafts come from proxy coordinators", 404)
        try:
            return web.json_response(sim.draft(request.match_info["ieee"]))
        except (KeyError, ValueError):
            return _err("no such device", 404)

    async def add_device(self, request: web.Request) -> web.Response:
        if getattr(self._sim(request), "kind", "emulated") == "proxy":
            return _err("a proxy coordinator shows the real devices of its stick; add virtual devices on an emulated coordinator", 409)
        body = await request.json()
        try:
            dev = self._sim(request).add_device(body["profile"], body.get("name"), body.get("tags"))
        except KeyError as exc:
            return _err(f"unknown profile {exc}")
        except ValueError as exc:
            return _err(str(exc))
        return web.json_response(dev.to_dict())

    async def device_action(self, request: web.Request) -> web.Response:
        ieee = request.match_info["ieee"]
        action = request.match_info["action"]
        if getattr(self._sim(request), "kind", "emulated") == "proxy" and action not in ("tags", "rename"):
            return _err(f"'{action}' is not available on a proxy coordinator (real devices are driven by their host)", 409)
        try:
            if action == "join":
                await self._sim(request).join_device(ieee)
            elif action == "leave":
                await self._sim(request).leave_device(ieee)
            elif action == "recording":
                return await self.recording(request)
            elif action == "tags":
                body = await request.json()
                self._sim(request).set_tags(ieee, body.get("tags") or [])
            elif action == "rename":
                body = await request.json()
                self._sim(request).rename_device(ieee, body.get("name"))
            elif action == "mode":
                body = await request.json()
                self._sim(request).set_mode(ieee, body.get("mode"))
            elif action == "pairing":
                body = await request.json()
                await self._sim(request).set_pairing(ieee, bool(body.get("enabled", True)), int(body.get("duration", 180)))
            elif action == "reset":
                body = await request.json() if request.can_read_body else {}
                await self._sim(request).reset_device(ieee, pair=bool(body.get("pair", True)))
            elif action == "control":
                body = await request.json()
                ctrl = body.pop("control")
                act = body.pop("action")
                await self._sim(request).get_device(ieee).control(ctrl, act, **body)
            else:
                return _err("unknown action", 404)
        except KeyError as exc:
            return _err(f"not found: {exc}", 404)
        except (RuntimeError, ValueError) as exc:
            return _err(str(exc), 409)
        return web.json_response({"ok": True})

    async def put_routines(self, request: web.Request) -> web.Response:
        if getattr(self._sim(request), "kind", "emulated") == "proxy":
            return _err("routines are not available on a proxy coordinator", 409)
        try:
            body = await request.json()
            self._sim(request).set_routines(request.match_info["ieee"], body.get("routines", []))
        except KeyError as exc:
            return _err(f"not found: {exc}", 404)
        except ValueError as exc:
            return _err(str(exc), 422)
        return web.json_response(self._sim(request).get_device(request.match_info["ieee"]).to_dict())

    async def preview_routine(self, request: web.Request) -> web.Response:
        """Validate a routine draft and describe it in plain words (editor live preview)."""
        if getattr(self._sim(request), "kind", "emulated") == "proxy":
            return _err("routines are not available on a proxy coordinator", 409)
        from .routines import describe, normalize

        try:
            dev = self._sim(request).get_device(request.match_info["ieee"])
            body = await request.json()
            routine = normalize(body.get("routine", {}), dev.capabilities)
        except KeyError as exc:
            return _err(f"not found: {exc}", 404)
        except ValueError as exc:
            return _err(str(exc), 422)
        return web.json_response({"routine": routine, "description": describe(routine, dev.capabilities)})

    async def recording(self, request: web.Request) -> web.Response:
        """Start / stop recording manual activity; stop returns a routine draft (not saved)."""
        ieee = request.match_info["ieee"]
        try:
            body = await request.json()
            if body.get("action") == "start":
                self._sim(request).start_recording(ieee)
                return web.json_response({"ok": True})
            if body.get("action") == "stop":
                from .routines import describe

                draft = self._sim(request).stop_recording(ieee)
                dev = self._sim(request).get_device(ieee)
                return web.json_response({"routine": draft, "description": describe(draft, dev.capabilities)})
            return _err("action must be 'start' or 'stop'")
        except KeyError as exc:
            return _err(f"not found: {exc}", 404)
        except (RuntimeError, ValueError) as exc:
            return _err(str(exc), 409)

    async def delete_device(self, request: web.Request) -> web.Response:
        try:
            await self._sim(request).remove_device(request.match_info["ieee"])
        except KeyError as exc:
            return _err(f"not found: {exc}", 404)
        return web.json_response({"ok": True})

    async def websocket(self, request: web.Request) -> web.WebSocketResponse:
        ws = web.WebSocketResponse(heartbeat=30)
        await ws.prepare(request)
        if self._authenticate is not None:
            try:
                msg = await ws.receive_json(timeout=10)
                ok = msg.get("type") == "auth" and await self._authenticate(str(msg.get("access_token", "")))
            except Exception:  # noqa: BLE001 - malformed / timeout
                ok = False
            if not ok:
                await ws.send_str(json.dumps({"type": "auth_invalid"}))
                await ws.close(code=4001, message=b"unauthorized")
                return ws
            await ws.send_str(json.dumps({"type": "auth_ok"}))
        queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=1000)
        unsub = self.manager.subscribe(queue)
        await ws.send_str(json.dumps({"type": "coordinators", "coordinators": self.manager.summary()}))
        for cid, emu in list(self.manager.emulators.items()):
            await ws.send_str(json.dumps({"type": "state", "cid": cid, **emu.snapshot()}))

        async def pump() -> None:
            while True:
                ev = await queue.get()
                await ws.send_str(json.dumps(ev))

        task = asyncio.create_task(pump())
        try:
            async for msg in ws:
                if msg.type == WSMsgType.ERROR:
                    break
        finally:
            task.cancel()
            unsub()
        return ws

    def _scoped(self, handler: Callable[[web.Request], Awaitable[web.StreamResponse]]) -> Callable[[web.Request], Awaitable[web.StreamResponse]]:
        """Per-coordinator handlers: unknown coordinator -> 404, not running -> 409."""
        from .manager import CoordinatorError

        async def wrapped(request: web.Request) -> web.StreamResponse:
            try:
                self._sim(request)
            except CoordinatorError as exc:
                return _err(str(exc), 409)
            except KeyError:
                return _err("no such coordinator", 404)
            return await handler(request)

        return wrapped

    def routes(self, prefix: str = "/api/zigemu") -> list[tuple[str, str, Any]]:
        c = f"{prefix}/c/{{cid}}"
        scoped = self._scoped
        return [
            ("GET", f"{prefix}/coordinators", self.coordinators),
            ("POST", f"{prefix}/coordinators", self.create_coordinator),
            ("POST", f"{prefix}/coordinators/{{cid}}/update", self.update_coordinator),
            ("DELETE", f"{prefix}/coordinators/{{cid}}", self.delete_coordinator),
            ("GET", f"{prefix}/profiles", self.profiles),
            ("POST", f"{prefix}/settings", self.update_settings),
            ("GET", f"{prefix}/ws", self.websocket),
            ("GET", f"{c}/state", scoped(self.state)),
            ("POST", f"{c}/devices", scoped(self.add_device)),
            ("POST", f"{c}/devices/{{ieee}}/{{action}}", scoped(self.device_action)),
            ("DELETE", f"{c}/devices/{{ieee}}", scoped(self.delete_device)),
            ("PUT", f"{c}/devices/{{ieee}}/routines", scoped(self.put_routines)),
            ("GET", f"{c}/devices/{{ieee}}/draft", scoped(self.device_draft)),
            ("POST", f"{c}/devices/{{ieee}}/routines/preview", scoped(self.preview_routine)),
        ]
