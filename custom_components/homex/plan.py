"""3D Builder: the house plan, level by level (rooms drawn as polygons).

Stored as one document in the ``homex_plan`` store::

    {"levels": [  # bottom to top
        {"id": "l_...", "name": "Ground floor", "floor_id": "ground_floor" | None,
         "rooms": [{"id": "s_...", "room_id": "<homex room id>" | None,
                    "name": "...", "points": [[x, y], ...]}]},  # cm
    ]}
"""

from __future__ import annotations

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN

STORE_KEY = "homex_plan"
STORE_DATA = "_plan_store_data"

_POINT = vol.All([vol.Coerce(float)], vol.Length(min=2, max=2))
_SHAPE = vol.Schema(
    {
        vol.Required("id"): str,
        vol.Optional("room_id"): vol.Any(None, str),
        vol.Optional("name", default=""): str,
        vol.Required("points"): vol.All([_POINT], vol.Length(min=3)),
    },
    extra=vol.ALLOW_EXTRA,
)
_LEVEL = vol.Schema(
    {
        vol.Required("id"): str,
        vol.Optional("name", default=""): str,
        vol.Optional("floor_id"): vol.Any(None, str),
        vol.Optional("rooms", default=list): [_SHAPE],
    },
    extra=vol.ALLOW_EXTRA,
)
PLAN_SCHEMA = vol.Schema({vol.Required("levels"): [_LEVEL]}, extra=vol.ALLOW_EXTRA)


def _store(hass: HomeAssistant) -> Store:
    return Store(hass, 1, STORE_KEY)


async def async_get_plan(hass: HomeAssistant) -> dict:
    data = hass.data.setdefault(DOMAIN, {})
    if data.get(STORE_DATA) is None:
        data[STORE_DATA] = await _store(hass).async_load() or {"levels": []}
    return data[STORE_DATA]


@websocket_api.websocket_command({vol.Required("type"): "homex/plan/get"})
@websocket_api.async_response
async def ws_plan_get(hass: HomeAssistant, connection, msg) -> None:
    connection.send_result(msg["id"], {"plan": await async_get_plan(hass)})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "homex/plan/save", vol.Required("plan"): dict}
)
@websocket_api.async_response
async def ws_plan_save(hass: HomeAssistant, connection, msg) -> None:
    try:
        plan = PLAN_SCHEMA(msg["plan"])
    except vol.Invalid as err:
        connection.send_error(msg["id"], "invalid_format", str(err))
        return
    hass.data.setdefault(DOMAIN, {})[STORE_DATA] = plan
    await _store(hass).async_save(plan)
    connection.send_result(msg["id"], {"ok": True})


PLAN_WS_COMMANDS = (ws_plan_get, ws_plan_save)
