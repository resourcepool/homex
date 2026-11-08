"""Set up a fresh Home Assistant dev instance for Homex.

Runs inside the Home Assistant container (it ships aiohttp):

    docker exec -i -e HX_USER=... -e HX_PASSWORD=... homex-ha python3 - < dev/setup_ha.py

1. Onboarding: the owner account, English, metric, Europe/Paris.
2. Floors and areas of the mock house (dev/mock/house.py, passed as HX_HOUSE).
3. The MQTT integration on the mosquitto container (the Zigbee2MQTT
   simulator's devices then land in their areas via suggested_area).
4. The Homex integration, with nothing configured.

Idempotent enough to re-run: existing floors / areas / entries are kept.
"""

import asyncio
import json
import os

import aiohttp

URL = "http://localhost:8123"
CLIENT_ID = "http://localhost:8124/"
USER = os.environ["HX_USER"]
PASSWORD = os.environ["HX_PASSWORD"]
HOUSE = json.loads(os.environ["HX_HOUSE"])  # {"floors": {...}, "areas": {...}}


async def wait_up(s):
    for _ in range(120):
        try:
            async with s.get(f"{URL}/api/onboarding") as r:
                if r.status in (200, 401, 404):
                    return
        except aiohttp.ClientError:
            pass
        await asyncio.sleep(2)
    raise SystemExit("Home Assistant did not start")


async def token_from_code(s, code):
    async with s.post(f"{URL}/auth/token", data={
        "grant_type": "authorization_code", "code": code, "client_id": CLIENT_ID}) as r:
        return (await r.json())["access_token"]


async def login(s):
    """Log in with the dev account (when onboarding is already done)."""
    async with s.post(f"{URL}/auth/login_flow", json={
        "client_id": CLIENT_ID, "handler": ["homeassistant", None], "redirect_uri": CLIENT_ID}) as r:
        flow = await r.json()
    async with s.post(f"{URL}/auth/login_flow/{flow['flow_id']}", json={
        "client_id": CLIENT_ID, "username": USER, "password": PASSWORD}) as r:
        res = await r.json()
    return await token_from_code(s, res["result"])


async def onboard(s):
    async with s.get(f"{URL}/api/onboarding") as r:
        steps = {st["step"]: st["done"] for st in await r.json()} if r.status == 200 else {}
    if not steps or steps.get("user"):
        print("onboarding: already done")
        return await login(s)
    async with s.post(f"{URL}/api/onboarding/users", json={
        "client_id": CLIENT_ID, "name": "Homex Dev", "username": USER,
        "password": PASSWORD, "language": "en"}) as r:
        r.raise_for_status()
        code = (await r.json())["auth_code"]
    token = await token_from_code(s, code)
    h = {"Authorization": f"Bearer {token}"}
    for step, body in (("core_config", {}), ("analytics", {}),
                       ("integration", {"client_id": CLIENT_ID, "redirect_uri": CLIENT_ID})):
        async with s.post(f"{URL}/api/onboarding/{step}", json=body, headers=h) as r:
            print(f"onboarding {step}: {r.status}")
    return token


class WS:
    def __init__(self, ws):
        self.ws, self.n = ws, 0

    async def call(self, **msg):
        self.n += 1
        await self.ws.send_json({"id": self.n, **msg})
        while True:
            res = await self.ws.receive_json()
            if res.get("id") == self.n:
                if not res.get("success"):
                    raise RuntimeError(f"{msg['type']}: {res.get('error')}")
                return res.get("result")


async def flow(s, h, handler, steps):
    """Run a config flow: `steps` are the user inputs of successive forms."""
    async with s.get(f"{URL}/api/config/config_entries/entry", headers=h) as r:
        if any(e["domain"] == handler for e in await r.json()):
            print(f"{handler}: already set up")
            return
    async with s.post(f"{URL}/api/config/config_entries/flow", json={"handler": handler}, headers=h) as r:
        res = await r.json()
    for user_input in steps:
        if res.get("type") != "form":
            break
        async with s.post(f"{URL}/api/config/config_entries/flow/{res['flow_id']}",
                          json=user_input, headers=h) as r:
            res = await r.json()
    print(f"{handler}: {res.get('type')} {res.get('title') or res.get('errors') or res.get('reason') or ''}")


async def main():
    async with aiohttp.ClientSession() as s:
        await wait_up(s)
        token = await onboard(s)
        h = {"Authorization": f"Bearer {token}"}
        async with s.ws_connect(f"{URL}/api/websocket") as raw:
            await raw.receive_json()
            await raw.send_json({"type": "auth", "access_token": token})
            assert (await raw.receive_json())["type"] == "auth_ok"
            ws = WS(raw)
            await ws.call(type="config/core/update", location_name="Homex Dev House",
                          latitude=48.8414, longitude=2.2989, elevation=35,
                          unit_system="metric", currency="EUR", time_zone="Europe/Paris",
                          country="FR", language="en")
            floors = {f["name"]: f["floor_id"] for f in await ws.call(type="config/floor_registry/list")}
            for fid, (name, level, icon) in HOUSE["floors"].items():
                if name not in floors:
                    floors[name] = (await ws.call(type="config/floor_registry/create",
                                                  name=name, level=level, icon=icon))["floor_id"]
            floor_by_key = {fid: floors[name] for fid, (name, _l, _i) in HOUSE["floors"].items()}
            areas = {a["name"] for a in await ws.call(type="config/area_registry/list")}
            for name, (floor, icon) in HOUSE["areas"].items():
                if name not in areas:
                    extra = {"floor_id": floor_by_key[floor]} if floor else {}
                    await ws.call(type="config/area_registry/create", name=name, icon=icon, **extra)
            print(f"{len(HOUSE['floors'])} floors, {len(HOUSE['areas'])} areas")
        await flow(s, h, "mqtt", [{
            "broker": "mosquitto", "port": 1883, "protocol": "5",
            "other_settings": {"keepalive": 60, "set_client_cert": False, "set_ca_cert": "off",
                               "transport": "tcp"}}])
        await flow(s, h, "homex", [{}])


asyncio.run(main())
