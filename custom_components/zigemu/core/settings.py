"""User settings: which profiles are offered, and the wishlist of devices to support.

The wishlist is built in the dashboard from a Zigbee2MQTT state export (or
database.db): one entry per device model, which can be downloaded and turned
into new device profiles.
"""

from __future__ import annotations

from typing import Any

MAX_WISHLIST = 2000
MAX_TAGS = 100
MAX_VIEWS = 50
COLORS = ("slate", "red", "orange", "amber", "green", "teal", "blue", "violet", "pink")
FILTER_KEYS = ("tags", "types", "vendors", "status", "modes")
STATUS_VALUES = ("joined", "pairing", "unpaired", "unpowered")
MODE_VALUES = ("manual", "auto")
_TEXT_FIELDS = ("vendor", "model", "description", "zigbeeModel", "manufacturer", "logicalType", "source", "added")
_URL_FIELDS = ("image", "url")


def _text(value: Any, limit: int = 200) -> str | None:
    if value is None:
        return None
    return str(value)[:limit]


def _url(value: Any) -> str | None:
    return value[:500] if isinstance(value, str) and value.startswith("https://") else None


def clean_wish(item: Any) -> dict[str, Any] | None:
    if not isinstance(item, dict):
        return None
    out: dict[str, Any] = {}
    for key in _TEXT_FIELDS:
        v = _text(item.get(key))
        if v:
            out[key] = v
    for key in _URL_FIELDS:
        v = _url(item.get(key))
        if v:
            out[key] = v
    try:
        out["count"] = max(1, min(10000, int(item.get("count", 1))))
    except (TypeError, ValueError):
        out["count"] = 1
    if not out.get("model") and not out.get("zigbeeModel"):
        return None
    return out


def wish_key(item: dict[str, Any]) -> str:
    return f"{(item.get('vendor') or '').lower()}|{(item.get('model') or item.get('zigbeeModel') or '').lower()}"


def _id(value: Any) -> str:
    v = str(value or "").strip()[:40]
    if not v or not all(c.isalnum() or c in "-_" for c in v):
        raise ValueError(f"invalid id {value!r}")
    return v


def clean_tags(items: Any) -> list[dict[str, Any]]:
    if not isinstance(items, list):
        raise ValueError("tags must be a list")
    if len(items) > MAX_TAGS:
        raise ValueError(f"at most {MAX_TAGS} tags")
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    names: set[str] = set()
    for item in items:
        if not isinstance(item, dict):
            raise ValueError("a tag must be an object")
        tid = _id(item.get("id"))
        name = (_text(item.get("name"), 40) or "").strip()
        if not name:
            raise ValueError("a tag needs a name")
        if tid in seen:
            raise ValueError(f"duplicate tag id {tid!r}")
        if name.lower() in names:
            raise ValueError(f"a tag named {name!r} already exists")
        seen.add(tid)
        names.add(name.lower())
        color = item.get("color") if item.get("color") in COLORS else "slate"
        out.append({"id": tid, "name": name, "color": color})
    return out


def new_tag(name: str, existing: list[dict[str, Any]]) -> dict[str, Any]:
    """A tag created on the fly: a readable unique id and the next unused color."""
    import re

    base = "t-" + (re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:24] or "tag")
    ids = {t["id"] for t in existing}
    tid, n = base, 2
    while tid in ids:
        tid, n = f"{base}-{n}", n + 1
    used = {t["color"] for t in existing}
    color = next((c for c in COLORS[1:] if c not in used), COLORS[1 + len(existing) % (len(COLORS) - 1)])
    return {"id": tid, "name": name.strip()[:40], "color": color}


def clean_filters(data: Any) -> dict[str, Any]:
    data = dict(data) if isinstance(data, dict) else {}
    if "categories" in data and "tags" not in data:  # views saved before tags
        data["tags"] = [v for v in data.pop("categories") or [] if v != "none"]
    out: dict[str, Any] = {"q": (_text(data.get("q"), 100) or "").strip()}
    for key in FILTER_KEYS:
        values = data.get(key) or []
        if not isinstance(values, list):
            raise ValueError(f"filter {key} must be a list")
        cleaned = [str(v)[:60] for v in values if v is not None][:100]
        if key == "status" and any(v not in STATUS_VALUES for v in cleaned):
            raise ValueError(f"status filter values: {', '.join(STATUS_VALUES)}")
        if key == "modes" and any(v not in MODE_VALUES for v in cleaned):
            raise ValueError(f"mode filter values: {', '.join(MODE_VALUES)}")
        out[key] = cleaned
    return out


def clean_views(items: Any) -> list[dict[str, Any]]:
    if not isinstance(items, list):
        raise ValueError("views must be a list")
    if len(items) > MAX_VIEWS:
        raise ValueError(f"at most {MAX_VIEWS} saved views")
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for item in items:
        if not isinstance(item, dict):
            raise ValueError("a view must be an object")
        vid = _id(item.get("id"))
        name = (_text(item.get("name"), 40) or "").strip()
        if not name:
            raise ValueError("a view needs a name")
        if vid in seen:
            raise ValueError(f"duplicate view id {vid!r}")
        seen.add(vid)
        out.append({"id": vid, "name": name, "filters": clean_filters(item.get("filters")), "group": bool(item.get("group", False))})
    return out


def clean(data: Any, profile_ids: set[str]) -> dict[str, Any]:
    """Validate settings coming from the dashboard (or the store)."""
    data = data if isinstance(data, dict) else {}
    disabled = data.get("disabledProfiles", [])
    if not isinstance(disabled, list):
        raise ValueError("disabledProfiles must be a list of profile ids")
    unknown = [p for p in disabled if p not in profile_ids]
    if unknown:
        raise ValueError(f"unknown profiles: {', '.join(map(str, unknown))}")
    wishlist_in = data.get("wishlist", [])
    if not isinstance(wishlist_in, list):
        raise ValueError("wishlist must be a list")
    if len(wishlist_in) > MAX_WISHLIST:
        raise ValueError(f"wishlist is limited to {MAX_WISHLIST} devices")
    wishlist: dict[str, dict[str, Any]] = {}
    for raw in wishlist_in:
        item = clean_wish(raw)
        if item is not None:
            wishlist.setdefault(wish_key(item), item)
    return {
        "disabledProfiles": sorted(set(disabled)),
        "wishlist": list(wishlist.values()),
        # "categories" (one per device) became "tags" (several per device)
        "tags": clean_tags(data.get("tags", data.get("categories", []))),
        "views": clean_views(data.get("views", [])),
    }
