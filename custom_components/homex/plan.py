"""3D Builder: the house plan, level by level (rooms drawn as polygons).

Stored as one document in the ``homex_plan`` store::

    {"levels": [  # by level number
        {"id": "l_...", "name": "Ground floor", "level": 0,
         "floor_id": "ground_floor" | None,
         "rooms": [{"id": "s_...", "room_id": "<homex room id>" | None,
                    "name": "...", "points": [[x, y], ...]}],  # cm
         "openings": [{"id", "type": "door" | "sliding_door" | "window" | "glass_door",
                       "shape", "edge", "t", "width", "flip", "out",
                       "style", "color", "cover", "cover_type", "cover_color"}],
         "stairs": [{"id", "x", "y", "w", "h", "dir": "up" | ..., "goes": "up" | "down",
                     "shape": "straight" | "l" | "u" | "spiral", "turn", "color"}],
         # Fixtures: shutters are the openings' "cover" (entity id).
         "radiators": [{"id", "device_id", "x", "y", "angle", "length",
                         "kind": "panel" | "tall"}],
         "lights": [{"id", "entity_id", "kind": "point" | "linear",
                     "mount": "ceiling" | "floor" | "wall",
                     "points": [[x, y]], "lines": [[[x, y], [x, y]]],
                     "type", "shape", "shade", "color"}]},
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

_COLOR = vol.Any(None, vol.All(str, vol.Length(max=32)))
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
_OPENING = vol.Schema(
    {
        vol.Required("id"): str,
        vol.Required("type"): vol.In(["door", "sliding_door", "window", "glass_door"]),
        vol.Required("shape"): str,
        vol.Required("edge"): vol.All(vol.Coerce(int), vol.Range(min=0)),
        vol.Required("t"): vol.All(vol.Coerce(float), vol.Range(min=0, max=1)),
        vol.Required("width"): vol.All(vol.Coerce(float), vol.Range(min=1)),
        vol.Optional("flip"): bool,
        vol.Optional("out"): bool,
        vol.Optional("cover"): vol.Any(None, str),
        vol.Optional("style"): vol.Any(None, str),
        vol.Optional("color"): _COLOR,
        vol.Optional("cover_type"): vol.In(["roller", "hinged"]),
        vol.Optional("cover_color"): _COLOR,
    },
    extra=vol.ALLOW_EXTRA,
)
_STAIR = vol.Schema(
    {
        vol.Required("id"): str,
        vol.Required("x"): vol.Coerce(float),
        vol.Required("y"): vol.Coerce(float),
        vol.Required("w"): vol.All(vol.Coerce(float), vol.Range(min=1)),
        vol.Required("h"): vol.All(vol.Coerce(float), vol.Range(min=1)),
        vol.Required("dir"): vol.In(["up", "down", "left", "right"]),
        vol.Optional("goes", default="up"): vol.In(["up", "down"]),
        vol.Optional("shape"): vol.In(["straight", "l", "u", "spiral"]),
        vol.Optional("turn"): vol.In(["left", "right"]),
        vol.Optional("color"): _COLOR,
    },
    extra=vol.ALLOW_EXTRA,
)
_RADIATOR = vol.Schema(
    {
        vol.Required("id"): str,
        vol.Required("device_id"): str,
        vol.Required("x"): vol.Coerce(float),
        vol.Required("y"): vol.Coerce(float),
        vol.Optional("angle", default=0): vol.Coerce(float),
        vol.Optional("length", default=80): vol.All(vol.Coerce(float), vol.Range(min=10)),
        # panel: a normal, low radiator (under a window); tall: full height
        vol.Optional("kind", default="panel"): vol.In(["panel", "tall"]),
    },
    extra=vol.ALLOW_EXTRA,
)
_LIGHT = vol.Schema(
    {
        vol.Required("id"): str,
        vol.Required("entity_id"): str,
        vol.Required("kind"): vol.In(["point", "linear"]),
        # "furniture" was renamed "floor".
        vol.Required("mount"): vol.All(
            vol.In(["ceiling", "floor", "furniture", "wall"]),
            lambda v: "floor" if v == "furniture" else v,
        ),
        vol.Optional("points", default=list): [_POINT],
        vol.Optional("lines", default=list): [vol.All([_POINT], vol.Length(min=2, max=2))],
        vol.Optional("type"): vol.In(
            ["ceiling_light", "pendant", "spot", "sconce", "floor_lamp", "table_lamp", "led_strip"]
        ),
        vol.Optional("shape"): vol.In(["round", "square"]),
        vol.Optional("shade"): bool,
        vol.Optional("color"): _COLOR,
    },
    extra=vol.ALLOW_EXTRA,
)
_LEVEL = vol.Schema(
    {
        vol.Required("id"): str,
        vol.Optional("name", default=""): str,
        vol.Optional("level", default=0): vol.Coerce(int),
        vol.Optional("floor_id"): vol.Any(None, str),
        vol.Optional("rooms", default=list): [_SHAPE],
        vol.Optional("openings", default=list): [_OPENING],
        vol.Optional("stairs", default=list): [_STAIR],
        vol.Optional("radiators", default=list): [_RADIATOR],
        vol.Optional("lights", default=list): [_LIGHT],
    },
    extra=vol.ALLOW_EXTRA,
)
PLAN_SCHEMA = vol.Schema(
    {
        vol.Required("levels"): [_LEVEL],
        # published from the 3D view: the dashboard shows the house in its own tab
        vol.Optional("published", default=False): bool,
    },
    extra=vol.ALLOW_EXTRA,
)


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
