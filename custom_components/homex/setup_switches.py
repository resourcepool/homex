"""Setup wizard: suggest a switch layout and device preset for a model.

From a device's button triggers — Zigbee2MQTT "action" events such as
``single_left``, ``on_press``, ``brightness_move_up``, ``arrow_left_click``, or
ZHA / deCONZ style ``remote_button_short_press`` + ``button_1`` — guess its
physical buttons and their press types, then build:

- a layout (the switch's shape: buttons placed on a grid), in the format the
  layout editor saves (center-origin coordinates, cells, zones);
- a device preset binding each button and press type to the device action.

Pure functions (no Home Assistant import) so they are easy to test.
"""

from __future__ import annotations

import math
import re

# Press types Homex knows: single, double, long.
_TAP_WORDS = {
    "single": "single", "press": "single", "click": "single", "short": "single",
    "double": "double",
    "hold": "long", "long": "long",
}
# Actions that are not a press of their own (end of a hold, combos...).
_IGNORED = re.compile(
    r"(release|stop|triple|quadruple|many|both|shake|rotate|slide|flip|tap$|wakeup)", re.I
)
# IKEA style: a hold of the top / bottom button is a brightness move.
_ALIASES = {
    "brightness_move_up": ("on", "long"),
    "brightness_move_down": ("off", "long"),
    "brightness_up": ("on", "long"),
    "brightness_down": ("off", "long"),
}
# Reading order of well-known button names (top to bottom, left to right).
_ORDER = ["on", "up", "top", "left", "main", "button", "right", "down", "bottom", "off"]

_SQUARE = {"x": -5.0, "y": -5.0, "w": 10.0, "h": 10.0}
_VRECT = {"x": -2.5, "y": -10.0, "w": 5.0, "h": 20.0}


# ZHA / deCONZ trigger types: the button is the subtype.
_REMOTE_TYPES = {
    "remote_button_short_press": "single",
    "remote_button_double_press": "double",
    "remote_button_long_press": "long",
}
# Trigger types that are a button event (ZHA, deCONZ, Hue...), besides the
# Zigbee2MQTT "action" type.
_BUTTON_TYPE = re.compile(r"(remote_button|press|click|release)", re.I)


def is_button_trigger(trigger: dict) -> bool:
    """Whether a device trigger is a button event (the device is a switch)."""
    ttype = str(trigger.get("type") or "")
    if ttype == "action":
        return True
    return bool(_BUTTON_TYPE.search(ttype)) and bool(trigger.get("subtype"))


def trigger_key(trigger: dict) -> str:
    return f"{trigger.get('type') or ''}|{trigger.get('subtype') or ''}"


def parse_trigger(trigger: dict) -> tuple[str, str] | None:
    """(button, press type) of a device trigger, None when not a press."""
    ttype = str(trigger.get("type") or "")
    if ttype == "action":
        return parse_action(str(trigger.get("subtype") or ""))
    tap = _REMOTE_TYPES.get(ttype)
    button = str(trigger.get("subtype") or "").strip().lower()
    return (button, tap) if tap and button else None


def parse_action(subtype: str) -> tuple[str, str] | None:
    """(button, press type) of an action name, None when not a press."""
    name = str(subtype or "").strip().lower()
    if not name:
        return None
    if name in _ALIASES:
        return _ALIASES[name]
    if _IGNORED.search(name):
        return None
    tokens = name.split("_")
    if tokens[0] in _TAP_WORDS:  # single_left, hold, double
        return ("_".join(tokens[1:]) or "main", _TAP_WORDS[tokens[0]])
    if tokens[-1] in _TAP_WORDS:  # on_press, up_hold, arrow_left_click
        return ("_".join(tokens[:-1]) or "main", _TAP_WORDS[tokens[-1]])
    if len(tokens) == 1:  # on, off, toggle: a single press of that button
        return (name, "single")
    return None


def _rank(button: str) -> tuple:
    for i, word in enumerate(_ORDER):
        if button == word or button.endswith("_" + word) or button.startswith(word + "_"):
            return (i, button)
    return (len(_ORDER), button)


def analyze(triggers: list[dict]) -> list[dict]:
    """Physical buttons, in reading order:
    [{name, taps, actions{tap: trigger_key}}]."""
    buttons: dict[str, dict] = {}
    for trigger in triggers:
        parsed = parse_trigger(trigger)
        if parsed is None:
            continue
        name, tap = parsed
        btn = buttons.setdefault(name, {"name": name, "taps": [], "actions": {}})
        if tap not in btn["actions"]:
            btn["actions"][tap] = trigger_key(trigger)
            btn["taps"].append(tap)
    out = sorted(buttons.values(), key=lambda b: _rank(b["name"]))
    for btn in out:
        btn["taps"].sort(key=["single", "double", "long"].index)
    return out


def _grid(names: list[str]) -> tuple[str, int, int, list[int]]:
    """(shape, columns, rows, cell -> button number) for these buttons."""
    n = len(names)
    pos = {name: i + 1 for i, name in enumerate(names)}
    has = set(names)
    if n == 4 and {"on", "off"} <= has and any("left" in x for x in has) and any("right" in x for x in has):
        # A cross (IKEA STYRBAR): on top, left / right, off at the bottom.
        left = next(x for x in names if "left" in x)
        right = next(x for x in names if "right" in x)
        cells = [0, pos["on"], 0, pos[left], 0, pos[right], 0, pos["off"], 0]
        return "round", 3, 3, cells
    if n == 1:
        return "square", 1, 1, [1]
    if n == 2 and has & {"left", "right"}:
        return "square", 2, 1, [1, 2]
    if n == 2:
        return "square", 1, 2, [1, 2]  # on above off
    if n <= 4 and has & {"on", "up", "down", "off"}:
        return "vrect", 1, n, list(range(1, n + 1))  # a column (Hue dimmer)
    cols = 2
    rows = math.ceil(n / cols)
    return "square", cols, rows, [i + 1 if i < n else 0 for i in range(cols * rows)]


def build_layout(layout_id: str, name: str, buttons: list[dict]) -> dict:
    """A layout in the layout editor's saved format."""
    shape, cols, rows, cells = _grid([b["name"] for b in buttons])
    b = dict(_VRECT if shape == "vrect" else _SQUARE)
    col_lines = [b["x"] + b["w"] * (i + 1) / cols for i in range(cols - 1)]
    row_lines = [b["y"] + b["h"] * (i + 1) / rows for i in range(rows - 1)]
    xs = [b["x"], *col_lines, b["x"] + b["w"]]
    ys = [b["y"], *row_lines, b["y"] + b["h"]]
    positions, zones = [], []
    for r in range(rows):
        for c in range(cols):
            n = cells[r * cols + c]
            if not n:
                continue
            x, x2, y, y2 = xs[c], xs[c + 1], ys[r], ys[r + 1]
            positions.append({"n": n, "x": (x + x2) / 2, "y": (y + y2) / 2})
            zones.append({"n": n, "x": x, "y": y, "w": x2 - x, "h": y2 - y})
    return {
        "id": layout_id,
        "name": name,
        "buttons": len(buttons),
        "shape": shape,
        "bounds": b,
        "columns": cols,
        "rows": rows,
        "colLines": col_lines,
        "rowLines": row_lines,
        "assignments": cells,
        "positions": positions,
        "zones": zones,
    }


def build_preset(
    preset_id: str, name: str, model: str, device_id: str, layout_id: str,
    buttons: list[dict], label_of: dict[str, str],
) -> dict:
    """A device preset: each button's press types bound to the device action
    (by its readable trigger label, as the preset editor stores it)."""
    taps: dict[str, list[str]] = {}
    bindings: dict[str, dict[str, list[str]]] = {}
    for i, btn in enumerate(buttons, start=1):
        taps[str(i)] = list(btn["taps"])
        for tap, key in btn["actions"].items():
            label = label_of.get(key)
            if label:
                bindings.setdefault(tap, {})[str(i)] = [label]
    return {
        "id": preset_id,
        "name": name,
        "model": model,
        "model_label": name,
        "device_id": device_id,
        "layout_id": layout_id,
        "taps": taps,
        "bindings": bindings,
    }
