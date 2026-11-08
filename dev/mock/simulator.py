"""Zigbee2MQTT simulator for the Homex dev instance.

Publishes the devices of house.py exactly like Zigbee2MQTT 2.x does (Home
Assistant MQTT discovery, JSON state on ``zigbee2mqtt/<friendly name>``,
device triggers for button actions, ``zigbee2mqtt/bridge/devices``) and
simulates them: lights and plugs follow their commands, shutters travel,
radiator valves heat their room, sensors drift slowly.

Press a button from the host:

    docker exec homex-mosquitto mosquitto_pub -t "zigbee2mqtt/Living Room Switch/action" -m single_left
"""

from __future__ import annotations

import hashlib
import json
import os
import random
import re
import threading
import time

import paho.mqtt.client as mqtt

from house import AREAS, DEVICES, MODELS

BASE = "zigbee2mqtt"
DISCOVERY = "homeassistant"
BROKER = os.environ.get("MQTT_HOST", "mosquitto")
BRIDGE_ID = "zigbee2mqtt_bridge_0x00124b0029aabbcc"
ORIGIN = {"name": "Zigbee2MQTT", "sw": "2.6.0", "url": "https://www.zigbee2mqtt.io"}

lock = threading.RLock()
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="homex-z2m-sim")


def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


def ieee(name: str) -> str:
    return "0x" + hashlib.sha1(name.encode()).hexdigest()[:16]


class Device:
    def __init__(self, name: str, model_key: str, area: str, overrides: dict):
        self.name = name
        self.model = MODELS[model_key]
        self.kind = self.model["kind"]
        self.area = area
        self.ieee = ieee(name)
        self.topic = f"{BASE}/{name}"
        self.state: dict = {"linkquality": random.randint(60, 200)}
        k = self.kind
        if k == "light":
            self.state.update(state="OFF", brightness=254)
            if self.model.get("ct"):
                self.state.update(color_temp=370, color_mode="color_temp")
        elif k in ("plug", "relay"):
            self.state.update(state="OFF")
            if self.model.get("power"):
                self.state.update(power=0, energy=round(random.uniform(5, 300), 2))
        elif k == "cover":
            self.state.update(position=100, state="OPEN", moving="STOP", motor_state="stopped")
            self.target = None
        elif k == "trv":
            self.state.update(local_temperature=19.0, occupied_heating_setpoint=20.0,
                              system_mode="heat", running_state="idle", battery=random.randint(60, 100))
        elif k == "climate_sensor":
            self.state.update(battery=random.randint(50, 100))
        elif k == "motion":
            self.state.update(occupancy=False, illuminance=random.randint(5, 300), battery=random.randint(50, 100))
        elif k == "contact":
            self.state.update(contact=True, battery=random.randint(50, 100))
        elif k == "switch":
            self.state.update(battery=random.randint(40, 100))
        self.state.update(overrides)
        if k == "cover":
            self.state["state"] = "CLOSE" if self.state["position"] == 0 else "OPEN"

    # -- Zigbee2MQTT device description ------------------------------------
    @property
    def device_info(self) -> dict:
        return {
            "identifiers": [f"zigbee2mqtt_{self.ieee}"],
            "name": self.name,
            "manufacturer": self.model["vendor"],
            "model": self.model["description"],
            "model_id": self.model["model"],
            "suggested_area": self.area,
            "sw_version": "1.0.0",
            "via_device": BRIDGE_ID,
        }

    def bridge_entry(self) -> dict:
        exposes = []
        if self.kind == "cover":
            exposes = [
                {"type": "cover", "features": [
                    {"name": "state", "property": "state", "access": 7, "type": "enum"},
                    {"name": "position", "property": "position", "access": 7, "type": "numeric"}]},
            ]
            if self.model.get("motion_exposes", True):
                exposes += [
                    {"type": "enum", "name": "moving", "property": "moving", "access": 1,
                     "values": ["UP", "DOWN", "STOP"]},
                    {"type": "enum", "name": "motor_state", "property": "motor_state", "access": 5,
                     "values": ["opening", "closing", "stopped"]},
                ]
        elif self.kind == "switch":
            exposes = [{"type": "enum", "name": "action", "property": "action", "access": 1,
                        "values": self.model["actions"]}]
        return {
            "ieee_address": self.ieee,
            "friendly_name": self.name,
            "type": "Router" if self.kind in ("light", "plug", "relay", "cover") else "EndDevice",
            "supported": True,
            "interview_completed": True,
            "definition": {
                "model": self.model["model"],
                "vendor": self.model["vendor"],
                "description": self.model["description"],
                "exposes": exposes,
            },
        }

    def _cfg(self, component: str, key: str, cfg: dict) -> tuple[str, dict]:
        cfg = {
            "unique_id": f"{self.ieee}_{key}_{BASE}",
            # Z2M names entities after the device: light.kitchen_ceiling_light,
            # sensor.kitchen_air_quality_co2...
            "default_entity_id": f"{component}." + (slug(self.name) if key == component else f"{slug(self.name)}_{key}"),
            "availability": [{"topic": f"{BASE}/bridge/state", "value_template": "{{ value_json.state }}"}],
            "device": self.device_info,
            "origin": ORIGIN,
            **cfg,
        }
        return f"{DISCOVERY}/{component}/{self.ieee}/{key}/config", cfg

    def _sensor(self, key: str, name: str, unit: str | None, dc: str | None, diag: bool = False):
        cfg = {"name": name, "state_topic": self.topic, "value_template": f"{{{{ value_json.{key} }}}}",
               "state_class": "measurement"}
        if unit:
            cfg["unit_of_measurement"] = unit
        if dc:
            cfg["device_class"] = dc
        if diag:
            cfg["entity_category"] = "diagnostic"
        return self._cfg("sensor", key, cfg)

    def discovery(self) -> list[tuple[str, dict]]:
        k, t, out = self.kind, self.topic, []
        if k == "light":
            modes = ["xy", "color_temp"] if self.model.get("color") else (
                ["color_temp"] if self.model.get("ct") else ["brightness"])
            cfg = {"name": None, "schema": "json", "command_topic": f"{t}/set", "state_topic": t,
                   "brightness": True, "brightness_scale": 254, "supported_color_modes": modes}
            if "color_temp" in modes:
                cfg.update(min_mireds=153, max_mireds=500)
            out.append(self._cfg("light", "light", cfg))
        elif k in ("plug", "relay"):
            out.append(self._cfg("switch", "switch", {
                "name": None, "command_topic": f"{t}/set", "state_topic": t,
                "value_template": "{{ value_json.state }}", "payload_on": "ON", "payload_off": "OFF"}))
            if self.model.get("power"):
                out.append(self._sensor("power", "Power", "W", "power"))
                out.append(self._sensor("energy", "Energy", "kWh", "energy"))
        elif k == "cover":
            out.append(self._cfg("cover", "cover", {
                "name": None, "device_class": self.model.get("device_class", "shutter"),
                "command_topic": f"{t}/set",
                "state_topic": t,
                "value_template": "{% if 'moving' in value_json and value_json.moving %}"
                                  " {{ value_json.moving }} {% else %} STOP {% endif %}",
                "state_opening": "UP", "state_closing": "DOWN", "state_stopped": "STOP",
                "payload_open": "OPEN", "payload_close": "CLOSE", "payload_stop": "STOP",
                "position_topic": t, "position_template": "{{ value_json.position }}",
                "set_position_topic": f"{t}/set",
                "set_position_template": '{ "position": {{ position }} }'}))
        elif k == "trv":
            out.append(self._cfg("climate", "climate", {
                "name": None, "temperature_unit": "C", "min_temp": "5", "max_temp": "35", "precision": 0.5,
                "temp_step": 0.5, "modes": ["off", "heat"],
                "action_topic": t,
                "action_template": "{% set values = {None:None,'idle':'idle','heat':'heating'} %}"
                                   "{{ values[value_json.running_state] }}",
                "current_temperature_topic": t,
                "current_temperature_template": "{{ value_json.local_temperature }}",
                "mode_command_topic": f"{t}/set/system_mode", "mode_state_topic": t,
                "mode_state_template": "{{ value_json.system_mode }}",
                "temperature_command_topic": f"{t}/set/occupied_heating_setpoint",
                "temperature_state_topic": t,
                "temperature_state_template": "{{ value_json.occupied_heating_setpoint }}"}))
            out.append(self._sensor("battery", "Battery", "%", "battery", diag=True))
        elif k == "climate_sensor":
            units = {"temperature": ("Temperature", "°C", "temperature"),
                     "humidity": ("Humidity", "%", "humidity"),
                     "pressure": ("Pressure", "hPa", "atmospheric_pressure"),
                     "co2": ("CO2", "ppm", "carbon_dioxide"),
                     "pm25": ("PM2.5", "µg/m³", "pm25"),
                     "pm10": ("PM10", "µg/m³", "pm10"),
                     "voc": ("VOC", "ppb", "volatile_organic_compounds_parts"),
                     "voc_index": ("VOC index", None, None)}
            for f in self.model["fields"]:
                name, unit, dc = units[f]
                out.append(self._sensor(f, name, unit, dc))
            if self.model["model"] != "TS0201":
                out.append(self._sensor("battery", "Battery", "%", "battery", diag=True))
        elif k == "motion":
            out.append(self._cfg("binary_sensor", "occupancy", {
                "name": "Occupancy", "device_class": "occupancy", "state_topic": t,
                "value_template": "{{ value_json.occupancy }}", "payload_on": True, "payload_off": False}))
            out.append(self._sensor("illuminance", "Illuminance", "lx", "illuminance"))
            out.append(self._sensor("battery", "Battery", "%", "battery", diag=True))
        elif k == "contact":
            out.append(self._cfg("binary_sensor", "contact", {
                "name": "Door", "device_class": "door", "state_topic": t,
                "value_template": "{{ value_json.contact }}", "payload_on": False, "payload_off": True}))
            out.append(self._sensor("battery", "Battery", "%", "battery", diag=True))
        elif k == "switch":
            for action in self.model["actions"]:
                out.append((f"{DISCOVERY}/device_automation/{self.ieee}/action_{action}/config", {
                    "automation_type": "trigger", "type": "action", "subtype": action,
                    "payload": action, "topic": f"{t}/action",
                    "device": self.device_info, "origin": ORIGIN}))
            out.append(self._sensor("battery", "Battery", "%", "battery", diag=True))
        out.append(self._sensor("linkquality", "Linkquality", "lqi", None, diag=True))
        return out

    # -- Simulation ------------------------------------------------------------
    def publish(self):
        # Retained (a Z2M per-device option) so a freshly set up Home
        # Assistant gets every state right away.
        client.publish(self.topic, json.dumps(self.state), retain=True)

    def command(self, payload, attr: str | None = None):
        with lock:
            if attr:  # zigbee2mqtt/<name>/set/<attribute> with a raw value
                try:
                    payload = {attr: json.loads(payload)}
                except ValueError:
                    payload = {attr: payload}
            elif isinstance(payload, str):
                payload = {"state": payload}
            k, s = self.kind, self.state
            if k in ("light", "plug", "relay"):
                st = str(payload.get("state", s["state"])).upper()
                if st == "TOGGLE":
                    st = "OFF" if s["state"] == "ON" else "ON"
                if "brightness" in payload and "state" not in payload:
                    st = "ON"
                s["state"] = st
                for key in ("brightness", "color_temp", "color"):
                    if key in payload:
                        s[key] = payload[key]
                        if k == "light" and key in ("color_temp", "color"):
                            s["color_mode"] = "color_temp" if key == "color_temp" else "xy"
                if "power" in s:
                    s["power"] = round(random.uniform(40, 1800), 1) if st == "ON" else 0
            elif k == "cover":
                if "position" in payload:
                    self.target = max(0, min(100, int(payload["position"])))
                elif "state" in payload:
                    cmd = str(payload["state"]).upper()
                    self.target = {"OPEN": 100, "CLOSE": 0}.get(cmd)
                    if cmd == "STOP":
                        s.update(moving="STOP", motor_state="stopped")
                if self.target is not None and self.target != s["position"]:
                    up = self.target > s["position"]
                    s.update(moving="UP" if up else "DOWN", motor_state="opening" if up else "closing")
            elif k == "trv":
                if "occupied_heating_setpoint" in payload:
                    s["occupied_heating_setpoint"] = float(payload["occupied_heating_setpoint"])
                if "system_mode" in payload:
                    s["system_mode"] = str(payload["system_mode"])
                self._trv_action()
            self.publish()

    def _trv_action(self):
        s = self.state
        heat = s["system_mode"] == "heat" and s["occupied_heating_setpoint"] > s["local_temperature"] + 0.2
        s["running_state"] = "heat" if heat else "idle"

    def tick_fast(self):
        """Every second: shutters travel."""
        if self.kind != "cover" or self.target is None:
            return
        with lock:
            s = self.state
            if s["moving"] == "STOP":
                self.target = None
                self.publish()
                return
            step = max(1, round(100 / self.model["travel_s"]))
            pos = s["position"] + (step if self.target > s["position"] else -step)
            if (self.target - pos) * (self.target - s["position"]) <= 0:
                pos = self.target
            s["position"] = pos
            self.publish()
            if pos == self.target:
                # Stop in a second message: Home Assistant derives open /
                # closed from the position it already knows.
                self.target = None
                s.update(moving="STOP", motor_state="stopped", state="CLOSE" if pos == 0 else "OPEN")
                self.publish()

    def tick_slow(self):
        """Every 20 s: valves heat, sensors drift."""
        with lock:
            s = self.state
            if self.kind == "trv":
                if s["running_state"] == "heat":
                    s["local_temperature"] = round(s["local_temperature"] + 0.1, 1)
                elif s["local_temperature"] > 16.5:
                    s["local_temperature"] = round(s["local_temperature"] - 0.05, 2)
                s["local_temperature"] = round(s["local_temperature"], 1)
                self._trv_action()
            elif self.kind == "climate_sensor":
                drift = {"temperature": 0.1, "humidity": 0.5, "pressure": 0.3, "co2": 25,
                         "pm25": 1, "pm10": 1.5, "voc": 8, "voc_index": 4}
                for key, d in drift.items():
                    if key in s:
                        v = s[key] + random.uniform(-d, d)
                        s[key] = round(max(0, v), 1) if key in ("temperature", "pressure") else round(max(0, v))
            elif self.kind == "motion" and random.random() < 0.08:
                s["occupancy"] = not s["occupancy"]
            elif self.kind == "plug" and s.get("state") == "ON" and "power" in s:
                s["power"] = round(max(0.5, s["power"] * random.uniform(0.9, 1.1)), 1)
            else:
                return
            self.publish()


devices: list[Device] = [
    Device(name, model, area, overrides)
    for area, items in DEVICES.items()
    for name, model, overrides in items
]
by_name = {d.name: d for d in devices}
assert set(DEVICES) <= set(AREAS), "every device area must be declared in AREAS"


def on_connect(cl, userdata, flags, reason, properties):
    print(f"connected to {BROKER}: {reason}", flush=True)
    cl.subscribe(f"{BASE}/+/set")
    cl.subscribe(f"{BASE}/+/set/+")
    cl.subscribe(f"{BASE}/+/get")
    cl.subscribe(f"{BASE}/+/action")
    # Bridge, then every device's discovery (retained) and state.
    cl.publish(f"{BASE}/bridge/state", json.dumps({"state": "online"}), retain=True)
    cl.publish(f"{BASE}/bridge/info", json.dumps({"version": ORIGIN["sw"], "coordinator": {"type": "zStack3x0"}}),
               retain=True)
    cl.publish(f"{DISCOVERY}/sensor/{BRIDGE_ID}/version/config", json.dumps({
        "name": "Version", "unique_id": f"{BRIDGE_ID}_version", "default_entity_id": "sensor.zigbee2mqtt_bridge_version",
        "state_topic": f"{BASE}/bridge/info", "value_template": "{{ value_json.version }}",
        "entity_category": "diagnostic",
        "device": {"identifiers": [BRIDGE_ID], "name": "Zigbee2MQTT Bridge", "manufacturer": "Zigbee2MQTT",
                   "model": "Bridge", "sw_version": ORIGIN["sw"]},
        "origin": ORIGIN}), retain=True)
    cl.publish(f"{BASE}/bridge/devices", json.dumps([d.bridge_entry() for d in devices]), retain=True)
    n = 0
    for d in devices:
        for topic, cfg in d.discovery():
            cl.publish(topic, json.dumps(cfg), retain=True)
            n += 1
    time.sleep(2)  # let Home Assistant create the entities before the states
    for d in devices:
        d.publish()
    print(f"published {len(devices)} devices, {n} discovery configs", flush=True)


def on_message(cl, userdata, msg):
    parts = msg.topic.split("/")
    dev = by_name.get(parts[1]) if len(parts) >= 3 else None
    if dev is None:
        return
    payload = msg.payload.decode()
    if parts[2] == "get":
        dev.publish()
    elif parts[2] == "set":
        try:
            body = json.loads(payload) if len(parts) == 3 else payload
        except ValueError:
            body = payload
        dev.command(body, parts[3] if len(parts) == 4 else None)
    elif parts[2] == "action":
        print(f"{dev.name}: {payload}", flush=True)


def main():
    client.on_connect = on_connect
    client.on_message = on_message
    client.will_set(f"{BASE}/bridge/state", json.dumps({"state": "offline"}), retain=True)
    while True:
        try:
            client.connect(BROKER, 1883, 60)
            break
        except OSError:
            print("broker not reachable yet, retrying", flush=True)
            time.sleep(2)
    client.loop_start()
    n = 0
    while True:
        time.sleep(1)
        n += 1
        for d in devices:
            d.tick_fast()
        if n % 20 == 0:
            for d in devices:
                d.tick_slow()


if __name__ == "__main__":
    main()
