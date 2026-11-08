"""ZigEmu: emulated Ember Zigbee coordinator with a device dashboard.

Each coordinator is an emulated NCP that a Zigbee host connects to like to a
network-attached Ember stick: ZHA with `socket://<ha-host>:<port>`, Zigbee2MQTT
with `adapter: ember` and `port: tcp://<ha-host>:<port>`. Coordinators are
created from the dashboard (one NCP port each). The dashboard (sidebar panel "ZigEmu") creates
virtual devices from device profiles, pairs them, and drives their inputs.
"""

from __future__ import annotations

import hashlib
import logging
import re
from pathlib import Path
from typing import Any

from aiohttp import web

from homeassistant.components import frontend
from homeassistant.components.http import KEY_HASS_USER, HomeAssistantView, StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import Event, HomeAssistant
from homeassistant.exceptions import Unauthorized
from homeassistant.helpers.storage import Store

from .const import (
    CONF_HOST,
    CONF_PORT,
    DEFAULT_HOST,
    DEFAULT_PORT,
    DOMAIN,
    LEGACY_STORAGE_KEY,
    STATIC_URL,
    STORAGE_KEY,
    STORAGE_VERSION,
)
from .core.api import Api
from .core.manager import CoordinatorManager, migrate_legacy

_LOGGER = logging.getLogger(__name__)
FRONTEND_DIR = Path(__file__).parent / "frontend"


def _frontend_hash() -> str:
    h = hashlib.sha256()
    for f in sorted(FRONTEND_DIR.iterdir()):
        if f.is_file():
            h.update(f.name.encode() + f.read_bytes())
    return h.hexdigest()[:12]


def _panel_html(version: str) -> str:
    html = (FRONTEND_DIR / "index.html").read_text()
    html = html.replace("<head>", f'<head>\n  <base href="{STATIC_URL}/">', 1)
    return re.sub(r'((?:href|src)="[\w./-]+\.(?:css|js))(\?v=[^"]*)?"', rf'\1?v={version}"', html)


class ZigEmuPanelView(HomeAssistantView):
    """The panel page, never cached, with asset URLs stamped by content hash."""

    url = "/api/zigemu/panel"
    name = "api:zigemu:panel"
    requires_auth = False

    def __init__(self, html: str) -> None:
        self._html = html

    async def get(self, request: web.Request) -> web.Response:
        return web.Response(text=self._html, content_type="text/html", headers={"Cache-Control": "no-cache"})


def _make_view(method: str, url: str, handler: Any, websocket: bool = False) -> HomeAssistantView:
    """Wrap an API handler in a Home Assistant view.

    HTTP endpoints require HA authentication (the panel sends the logged-in
    user's bearer token) and an administrator, like the panel itself. The
    WebSocket endpoint authenticates its first message instead (browsers
    cannot set headers on WebSockets), see Api(authenticate=...).
    """

    async def _handle(self: HomeAssistantView, request: web.Request, **_kw: Any) -> web.StreamResponse:
        if not websocket:
            user = request.get(KEY_HASS_USER)
            if user is None or not user.is_admin:
                raise Unauthorized()
        return await handler(request)

    view_cls = type(
        f"ZigEmuView_{abs(hash((method, url)))}",
        (HomeAssistantView,),
        {
            "url": url,
            "name": f"api:zigemu:{method.lower()}:{url}",
            "requires_auth": not websocket,
            method.lower(): _handle,
        },
    )
    return view_cls()


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
    default_host = entry.data.get(CONF_HOST, DEFAULT_HOST)

    async def load() -> dict[str, Any] | None:
        data = await store.async_load()
        if data is None:
            # first start: import the single coordinator of a ZigSim install, if any
            legacy = await Store(hass, STORAGE_VERSION, LEGACY_STORAGE_KEY).async_load()
            data = migrate_legacy(legacy, default_host, entry.data.get(CONF_PORT, DEFAULT_PORT))
            if data is not None:
                _LOGGER.info("imported the ZigSim state as coordinator 'Coordinator 1'")
        return migrate_legacy(data, default_host, entry.data.get(CONF_PORT, DEFAULT_PORT))

    manager = CoordinatorManager(
        load=load,
        save=store.async_save,
        profile_dirs=[Path(hass.config.path("zigemu_profiles"))],
        default_host=default_host,
    )
    await manager.start()
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = manager

    async def _on_stop(_event: Event) -> None:
        # HA does not unload config entries on shutdown: flush state and close the NCP sockets here.
        await manager.stop()

    entry.async_on_unload(hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, _on_stop))

    if not hass.data[DOMAIN].get("_http_registered"):
        async def authenticate(token: str) -> bool:
            refresh_token = hass.auth.async_validate_access_token(token)
            if refresh_token is None:
                return False
            user = refresh_token.user
            return user.is_active and user.is_admin

        api = Api(lambda: next(m for m in hass.data[DOMAIN].values() if isinstance(m, CoordinatorManager)), authenticate)
        for method, url, handler in api.routes():
            hass.http.register_view(_make_view(method, url, handler, websocket=url.endswith("/ws")))
        await hass.http.async_register_static_paths([StaticPathConfig(STATIC_URL, str(FRONTEND_DIR), False)])
        version = await hass.async_add_executor_job(_frontend_hash)
        html = await hass.async_add_executor_job(_panel_html, version)
        hass.http.register_view(ZigEmuPanelView(html))
        hass.data[DOMAIN]["_http_registered"] = True
        hass.data[DOMAIN]["_frontend_version"] = version

    frontend.async_register_built_in_panel(
        hass,
        "iframe",
        sidebar_title="ZigEmu",
        sidebar_icon="mdi:zigbee",
        frontend_url_path=DOMAIN,
        config={"url": f"/api/zigemu/panel?v={hass.data[DOMAIN]['_frontend_version']}"},
        require_admin=True,
    )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    manager: CoordinatorManager = hass.data[DOMAIN].pop(entry.entry_id)
    await manager.stop()
    frontend.async_remove_panel(hass, DOMAIN)
    return True
