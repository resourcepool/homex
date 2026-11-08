"""Device profile loading.

A device profile is a JSON document describing how to emulate one real device:
its identity (node descriptor, Basic cluster attributes), its ZDO descriptors,
its ZCL attribute values, and the dashboard *controls* that make it emit
frames (buttons, dials, sliders). See profiles/README.md for the format.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .components import expand

BUILTIN_DIR = Path(__file__).resolve().parent.parent / "profiles"


@dataclass
class Profile:
    data: dict[str, Any]
    _controls: list[dict[str, Any]] | None = field(default=None, repr=False)

    @property
    def id(self) -> str:
        return self.data["id"]

    @property
    def name(self) -> str:
        return self.data.get("name", self.id)

    @property
    def controls(self) -> list[dict[str, Any]]:
        """Controls with standard components expanded (see components.py)."""
        if self._controls is None:
            self._controls = [expand(c) for c in self.data.get("controls", [])]
        return self._controls

    @property
    def ieee_prefix(self) -> str:
        return self.data.get("node", {}).get("ieeePrefix", "")

    def summary(self) -> dict[str, Any]:
        model_ids = sorted(
            {
                str(ep.get("attributes", {}).get("genBasic", {}).get("modelId"))
                for ep in self.data.get("endpoints", [])
                if ep.get("attributes", {}).get("genBasic", {}).get("modelId")
            }
        )
        return {"id": self.id, "name": self.name, "info": self.data.get("device", {}), "modelIds": model_ids}


def validate(data: dict[str, Any]) -> None:
    for key in ("id", "endpoints"):
        if key not in data:
            raise ValueError(f"profile is missing {key!r}")
    if not data["endpoints"]:
        raise ValueError("profile needs at least one endpoint")
    image = data.get("device", {}).get("image")
    if image is not None and not (isinstance(image, str) and (image.startswith("https://") or not ":" in image)):
        raise ValueError("device.image must be an https:// URL or a relative path")
    controls = [expand(c) for c in data.get("controls", [])]
    ids = [c.get("id") for c in controls]
    if len(ids) != len(set(ids)):
        raise ValueError("control ids must be unique")
    for c in controls:
        if c.get("type") == "toggle" and (len(c.get("states", [])) != 2 or "value" not in c):
            raise ValueError(f"toggle control {c.get('id')!r} needs two states and a value template")
        if c.get("type") not in ("button", "dial", "range", "action", "indicator", "preset", "toggle", "stepper"):
            raise ValueError(f"control {c.get('id')!r} has unknown type {c.get('type')!r}")
        if c.get("type") == "preset":
            opts = c.get("options") or []
            if not opts or any("id" not in o or ("value" not in o and "range" not in o) for o in opts):
                raise ValueError(f"preset control {c.get('id')!r} needs options with an id and a value or range")
            if "default" in c and c["default"] not in [o["id"] for o in opts]:
                raise ValueError(f"preset control {c.get('id')!r}: default {c['default']!r} is not an option")


def load_profiles(*dirs: Path) -> dict[str, Profile]:
    profiles: dict[str, Profile] = {}
    for d in (BUILTIN_DIR, *dirs):
        if not d.is_dir():
            continue
        for path in sorted(d.glob("*.json")):
            data = json.loads(path.read_text())
            validate(data)
            profiles[data["id"]] = Profile(data)
    return profiles
