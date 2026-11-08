"""Standard components: reusable physical features shared by device profiles.

A profile control can say `{"use": "<component>", ...}`. The component supplies
the type, icon, label, widget, states/options and default behaviour; anything
the profile sets on top overrides it (event handlers are merged per event,
the profile's version of an event replacing the component's). This keeps the
same feature looking and behaving the same on every device: a ⚡ Power switch,
a 🔋 Battery Low/Middle/Full group, a plug Load None/Mid/High group, …

Control types used by components:
- `toggle`: two named states shown as a switch. `states` is [off-state, on-state];
  `value` is a template giving the current state from the device's real state.
  Setting a state fires the `on.<state>` event.
- `preset`: a button group of constant or fluctuating values (see presets.py).
- `stepper`: −/+ buttons firing `on.down` / `on.up`.
- `action` with an `icon`: a row of named buttons (`actionLabels`), one per `on.<event>`.
- `button` with a `state` template: a physical push button showing the state it drives.
- `outline: true` (on/off and open/closed actuators: power, supply, relay and
  valve buttons; not the wall rocker, whose position doesn't say whether the relay is on): the row gets a green (on/open) or red (off/closed) outline.
- `indicator` with a `widget` ("brightness" / "color"): a read-only visual of a
  light endpoint (`endpoint`, default 1).
"""

from __future__ import annotations

import copy
from typing import Any

BATTERY_OPTIONS = [
    {"id": "low", "label": "Low", "value": 8},
    {"id": "middle", "label": "Middle", "value": 50},
    {"id": "full", "label": "Full", "value": 100},
]

LIBRARY: dict[str, dict[str, Any]] = {
    # ------------------------------------------------------------ power
    "power": {
        "outline": True,
        "type": "toggle",
        "icon": "power",
        "label": "Power",
        "states": ["off", "on"],
        "stateLabels": {"off": "Off", "on": "On"},
        "value": "{{ 'on' if powered else 'off' }}",
        "power": True,
        "description": "Mains power. Off: the device goes dark and stops answering. On: it reboots, applies its power-on behaviour and re-announces.",
        "on": {"off": [{"power": "off"}], "on": [{"power": "on"}]},
    },
    "battery": {
        "type": "preset",
        "icon": "battery",
        "label": "Battery",
        "unit": "%",
        "options": BATTERY_OPTIONS,
        "default": "full",
        "offline": True,
        "description": "Battery level. Reported per the host's reporting configuration.",
        "on": {
            "change": [
                {
                    "setAttribute": {
                        "cluster": "genPowerCfg",
                        "attributes": {
                            "batteryPercentageRemaining": "{{ value * 2 }}",
                            "batteryVoltage": "{{ 22 + value * 8 // 100 }}",
                        },
                    }
                }
            ]
        },
    },
    "load": {
        "type": "preset",
        "icon": "plug",
        "label": "Load",
        "unit": "W",
        "options": [
            {"id": "none", "label": "None", "value": 0},
            {"id": "mid", "label": "Mid", "range": [150, 180], "every": 2000},
            {"id": "high", "label": "High", "range": [2000, 2200], "every": 2000},
        ],
        "default": "none",
        "offline": True,
        "description": "What is plugged in. Mid and High fluctuate.",
        "on": {"change": [{"setInput": {"load_w": "{{ value }}"}}]},
    },
    "mains_voltage": {
        "type": "preset",
        "icon": "voltage",
        "label": "Voltage",
        "unit": "V",
        "options": [{"id": "110", "label": "110 V", "value": 110}, {"id": "220", "label": "220 V", "value": 220}],
        "default": "220",
        "offline": True,
        "description": "Mains voltage.",
        "on": {"change": [{"setInput": {"mains_v": "{{ value }}"}}]},
    },
    # ---------------------------------------------------- environment
    "room_temperature": {
        "type": "preset",
        "icon": "thermometer",
        "label": "Room",
        "unit": "°C",
        "options": [
            {"id": "cold", "label": "Cold", "value": 14},
            {"id": "cool", "label": "Cool", "value": 17},
            {"id": "comfort", "label": "Comfort", "value": 20},
            {"id": "warm", "label": "Warm", "value": 24},
        ],
        "default": "cool",
        "offline": True,
        "description": "Sets the room temperature now; the room model takes over from there.",
        "on": {"change": [{"setInput": {"temperature_c": "{{ value }}"}}]},
    },
    "outside_temperature": {
        "type": "preset",
        "icon": "cloud",
        "label": "Outside",
        "unit": "°C",
        "options": [
            {"id": "freezing", "label": "Freezing", "range": [-4, 0], "every": 30000, "step": 0.5},
            {"id": "cold", "label": "Cold", "range": [3, 8], "every": 30000, "step": 0.5},
            {"id": "mild", "label": "Mild", "range": [10, 15], "every": 30000, "step": 0.5},
            {"id": "warm", "label": "Warm", "range": [20, 25], "every": 30000, "step": 0.5},
        ],
        "default": "mild",
        "offline": True,
        "description": "Outside temperature (fluctuating): the room cools towards it.",
        "on": {"change": [{"setInput": {"ambient_c": "{{ value }}"}}]},
    },
    "water_flow": {
        "type": "preset",
        "icon": "waves",
        "label": "Flow",
        "unit": "L/min",
        "options": [
            {"id": "none", "label": "None", "value": 0},
            {"id": "low", "label": "Low", "range": [4, 6], "every": 3000, "step": 0.5},
            {"id": "high", "label": "High", "range": [18, 22], "every": 3000, "step": 0.5},
        ],
        "default": "high",
        "offline": True,
        "description": "Water flow through the valve when open (fluctuating).",
        "on": {"change": [{"setInput": {"flow_lpm": "{{ value }}"}}]},
    },
    "ambient_light": {
        "type": "toggle",
        "inputs": {"bright": False},
        "icon": "sun",
        "label": "Daylight",
        "states": ["dim", "bright"],
        "stateLabels": {"dim": "Dim", "bright": "Bright"},
        "value": "{{ 'bright' if bright else 'dim' }}",
        "offline": True,
        "on": {"dim": [{"setInput": {"bright": False}}], "bright": [{"setInput": {"bright": True}}]},
    },
    # ------------------------------------------------- physical sensing
    "contact": {
        "type": "toggle",
        "icon": "door",
        "label": "Door",
        "states": ["closed", "open"],
        "stateLabels": {"closed": "Closed", "open": "Open"},
        "value": "{{ 'open' if attr('ssIasZone', 'zoneStatus') & 1 else 'closed' }}",
        "description": "Magnet away = open: sets IAS zone status alarm1 and sends a Zone Status Change Notification.",
        "on": {
            "open": [{"command": {"cluster": "ssIasZone", "name": "alarm1", "args": {"on": True}}}],
            "closed": [{"command": {"cluster": "ssIasZone", "name": "alarm1", "args": {"on": False}}}],
        },
    },
    "presence": {
        "type": "toggle",
        "inputs": {"person_present": False},
        "icon": "person",
        "label": "Person",
        "states": ["away", "present"],
        "stateLabels": {"away": "Away", "present": "Present"},
        "value": "{{ 'present' if person_present else 'away' }}",
        "description": "Someone in the detection area.",
        "on": {"away": [{"setInput": {"person_present": False}}], "present": [{"setInput": {"person_present": True}}]},
    },
    "tamper": {
        "type": "toggle",
        "inputs": {"tampered": False},
        "icon": "shield",
        "label": "Cover",
        "states": ["closed", "removed"],
        "stateLabels": {"closed": "Closed", "removed": "Removed"},
        "value": "{{ 'removed' if tampered else 'closed' }}",
        "description": "Back cover / tamper switch.",
        "on": {"closed": [{"setInput": {"tampered": False}}], "removed": [{"setInput": {"tampered": True}}]},
    },
    "water_supply": {
        "outline": True,
        "type": "toggle",
        "inputs": {"supply_ok": True},
        "icon": "droplet",
        "label": "Supply",
        "states": ["off", "on"],
        "stateLabels": {"off": "Off", "on": "On"},
        "value": "{{ 'on' if supply_ok else 'off' }}",
        "offline": True,
        "description": "Water supply to the valve.",
        "on": {"off": [{"setInput": {"supply_ok": False}}], "on": [{"setInput": {"supply_ok": True}}]},
    },
    # ------------------------------------------------- light (read-only)
    "brightness": {
        "type": "indicator",
        "widget": "brightness",
        "icon": "bulb",
        "label": "Brightness",
        "value": "{{ 'no power' if not powered else ('blinking' if attr('genIdentify', 'identifyTime', ep) else ('off' if not attr('genOnOff', 'onOff', ep) else 'on · ' + str(round(attr('genLevelCtrl', 'currentLevel', ep) * 100 / 254)) + ' %')) }}",
        "endpoint": 1,
        "description": "What the bulb emits: on/off and level, tinted with its current color.",
    },
    "color": {
        "type": "indicator",
        "widget": "color",
        "icon": "palette",
        "label": "Color",
        "endpoint": 1,
        "value": "{{ (str(round(1000000 / attr('lightingColorCtrl', 'colorTemperature', ep))) + ' K') if attr('lightingColorCtrl', 'colorMode', ep) == 2 else ('xy ' + str(round(attr('lightingColorCtrl', 'currentX', ep) / 65536, 3)) + ', ' + str(round(attr('lightingColorCtrl', 'currentY', ep) / 65536, 3)) if attr('lightingColorCtrl', 'colorMode', ep) == 1 else 'hue ' + str(attr('lightingColorCtrl', 'currentHue', ep)) + ' sat ' + str(attr('lightingColorCtrl', 'currentSaturation', ep))) }}",
        "description": "Current color: color temperature on a warm → cool strip, or hue/xy on a rainbow strip.",
    },
    # ---------------------------------------- physical on/off push buttons
    "relay_button": {
        "outline": True,
        "type": "button",
        "icon": "push",
        "label": "Button",
        "state": "{{ powered and attr('genOnOff', 'onOff', ep) }}",
        "stateLabels": {"off": "Off", "on": "On"},
        "holdDelay": 3000,
        "holdInterval": 60000,
        "description": "The device's own push button: each press toggles the relay.",
        "on": {"press": [{"command": {"cluster": "genOnOff", "name": "toggle"}}]},
    },
    "valve_button": {
        "outline": True,
        "type": "button",
        "icon": "valve",
        "label": "Valve",
        "state": "{{ powered and attr('genOnOff', 'onOff', ep) }}",
        "stateLabels": {"off": "Closed", "on": "Open"},
        "holdDelay": 3000,
        "holdInterval": 60000,
        "description": "The valve's own push button: each press opens / closes it.",
        "on": {"press": [{"command": {"cluster": "genOnOff", "name": "toggle"}}]},
    },
    # ------------------------------------------------------ covers
    "cover": {
        "type": "action",
        "icon": "cover",
        "label": "Cover",
        "actionLabels": {"open": "Open", "stop": "Stop", "close": "Close", "half": "50 %"},
        "description": "The cover's wall buttons / remote: open, stop, close, or half-way.",
        "on": {
            "open": [{"command": {"cluster": "closuresWindowCovering", "name": "open"}}],
            "stop": [{"command": {"cluster": "closuresWindowCovering", "name": "stop"}}],
            "close": [{"command": {"cluster": "closuresWindowCovering", "name": "close"}}],
            "half": [{"command": {"cluster": "closuresWindowCovering", "name": "set", "args": {"position": 50}}}],
        },
    },
    # ------------------------------------------------ air & safety
    "humidity": {
        "type": "preset",
        "icon": "droplet",
        "label": "Humidity",
        "unit": "%",
        "options": [
            {"id": "dry", "label": "Dry", "range": [28, 32], "every": 60000, "step": 0.5},
            {"id": "normal", "label": "Normal", "range": [45, 50], "every": 60000, "step": 0.5},
            {"id": "humid", "label": "Humid", "range": [68, 72], "every": 60000, "step": 0.5},
            {"id": "wet", "label": "Shower", "range": [88, 92], "every": 30000, "step": 0.5},
        ],
        "default": "normal",
        "offline": True,
        "description": "Relative humidity around the sensor (fluctuating).",
        "on": {"change": [{"setInput": {"humidity_pct": "{{ value }}"}}]},
    },
    "air_quality": {
        "type": "preset",
        "icon": "cloud",
        "label": "Air",
        "options": [
            {"id": "fresh", "label": "Fresh", "value": 0},
            {"id": "stuffy", "label": "Stuffy", "value": 1},
            {"id": "polluted", "label": "Polluted", "value": 2},
        ],
        "default": "fresh",
        "offline": True,
        "description": "Air in the room. Fresh: CO2 450 ppm. Stuffy: 1100 ppm, more VOC. Polluted: 1900 ppm, VOC, formaldehyde and PM2.5 high.",
        "on": {
            "change": [
                {
                    "setInput": {
                        "co2_ppm": "{{ (450, 1100, 1900)[value] }}",
                        "voc_ppb": "{{ (90, 450, 1200)[value] }}",
                        "hcho_ugm3": "{{ (6, 30, 120)[value] }}",
                        "pm25_ugm3": "{{ (8, 22, 85)[value] }}",
                    }
                }
            ]
        },
    },
    "smoke": {
        "type": "toggle",
        "inputs": {"smoke": False},
        "icon": "flame",
        "label": "Smoke",
        "states": ["clear", "smoke"],
        "stateLabels": {"clear": "Clear", "smoke": "Smoke"},
        "value": "{{ 'smoke' if smoke else 'clear' }}",
        "description": "Smoke in the detector's chamber.",
        "on": {"clear": [{"setInput": {"smoke": False}}], "smoke": [{"setInput": {"smoke": True}}]},
    },
    # ------------------------------------------------------ user inputs
    "wall_switch": {
        "type": "toggle",
        "inputs": {"wall_switch": False},
        "icon": "switch",
        "label": "Wall switch",
        "states": ["down", "up"],
        "stateLabels": {"down": "Down", "up": "Up"},
        "value": "{{ 'up' if wall_switch else 'down' }}",
        "description": "Rocker wall switch wired to the device input: every flip toggles the relay.",
        "on": {
            "down": [{"setInput": {"wall_switch": False}}, {"command": {"cluster": "genOnOff", "name": "toggle"}}],
            "up": [{"setInput": {"wall_switch": True}}, {"command": {"cluster": "genOnOff", "name": "toggle"}}],
        },
    },
    "knob": {
        "type": "stepper",
        "icon": "dial",
        "label": "Knob",
        "description": "Turning the knob down / up.",
        "on": {},
    },
}


def expand(control: dict[str, Any]) -> dict[str, Any]:
    """Merge a control with the standard component it uses (if any)."""
    name = control.get("use")
    if not name:
        return control
    if name not in LIBRARY:
        raise ValueError(f"control {control.get('id')!r} uses unknown component {name!r} (known: {', '.join(sorted(LIBRARY))})")
    merged = copy.deepcopy(LIBRARY[name])
    for key, value in control.items():
        if key == "on":
            merged["on"] = {**merged.get("on", {}), **value}
        elif key == "also":  # extra actions appended to the component's own
            for event, actions in value.items():
                merged.setdefault("on", {}).setdefault(event, []).extend(actions)
        else:
            merged[key] = value
    return merged
