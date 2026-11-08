"""Backup and restore of Homex's whole configuration and data.

A backup is one JSON document:

- ``options``: the hub options (language...);
- ``rooms``: every room subentry (title, unique id, full data);
- ``stores``: Homex's storage documents (``homex_layouts``: layouts, switch
  and shutter presets, switches; ``homex_heating``: zones, systems, heating
  presets and groups, applied setpoints; ``homex_plan``: the 3D Builder
  plan);
- ``scenes``: Homex's native scenes from scenes.yaml (ids ``homex_*``), with
  their content as edited in the scene editor.

Restoring replaces all of it (other scenes are kept) after writing a safety
backup of the current state to ``<config>/homex_backups/``, then reloads
Homex once.
"""

from __future__ import annotations

import asyncio
import json
import os
from datetime import datetime

from homeassistant.config_entries import ConfigEntry, ConfigSubentry
from homeassistant.const import __version__ as HA_VERSION
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.loader import async_get_integration
from homeassistant.util import dt as dt_util
from homeassistant.util.yaml import load_yaml, save_yaml

from .const import DOMAIN, HOLD_RELOAD, SCENES_FILE, SCENES_LOCK

FORMAT = "homex-backup"
VERSION = 1
BACKUP_DIR = "homex_backups"
SCENE_PREFIX = "homex_"

# Storage documents: key -> hass.data[DOMAIN] cache key of their loaded doc.
STORES = {
    "homex_layouts": "_switch_store_data",
    "homex_heating": "_heating_store_data",
    "homex_plan": "_plan_store_data",
}


def _homex_scenes(path: str) -> list[dict]:
    if not os.path.exists(path):
        return []
    scenes = load_yaml(path)
    return [
        s
        for s in (scenes if isinstance(scenes, list) else [])
        if isinstance(s, dict) and str(s.get("id", "")).startswith(SCENE_PREFIX)
    ]


def _replace_homex_scenes(path: str, scenes: list[dict]) -> None:
    """Keep the other scenes, replace Homex's by these."""
    current = load_yaml(path) if os.path.exists(path) else []
    kept = [
        s
        for s in (current if isinstance(current, list) else [])
        if not (isinstance(s, dict) and str(s.get("id", "")).startswith(SCENE_PREFIX))
    ]
    save_yaml(path, kept + list(scenes))


async def async_create_backup(hass: HomeAssistant, hub: ConfigEntry) -> dict:
    """The whole Homex configuration and data as one JSON-able document."""
    integration = await async_get_integration(hass, DOMAIN)
    stores = {}
    for key, cache in STORES.items():
        cached = hass.data.get(DOMAIN, {}).get(cache)
        stores[key] = cached if cached is not None else await Store(hass, 1, key).async_load()
    scenes = await hass.async_add_executor_job(_homex_scenes, hass.config.path(SCENES_FILE))
    rooms = [
        {"title": sub.title, "unique_id": sub.unique_id, "data": dict(sub.data)}
        for sub in hub.subentries.values()
        if sub.subentry_type == "room"
    ]
    # Round-trip through JSON: plain types only (no mappingproxy, datetimes...).
    return json.loads(
        json.dumps(
            {
                "format": FORMAT,
                "version": VERSION,
                "homex_version": str(integration.version),
                "ha_version": HA_VERSION,
                "created_at": dt_util.now().isoformat(),
                "options": dict(hub.options),
                "rooms": rooms,
                "stores": stores,
                "scenes": scenes,
            },
            default=str,
        )
    )


def summarize(backup: dict) -> dict:
    """What a backup holds (shown before restoring it)."""
    layouts = (backup.get("stores") or {}).get("homex_layouts") or {}
    heating = (backup.get("stores") or {}).get("homex_heating") or {}
    return {
        "created_at": backup.get("created_at"),
        "homex_version": backup.get("homex_version"),
        "rooms": len(backup.get("rooms") or []),
        "switches": len(layouts.get("switches") or []),
        "switch_presets": len(layouts.get("presets") or []),
        "shutter_presets": len(layouts.get("shutter_presets") or []),
        "layouts": len(layouts.get("layouts") or []),
        "zones": len(heating.get("zones") or []),
        "heating_systems": len(heating.get("systems") or []),
        "scenes": len(backup.get("scenes") or []),
        "plan_levels": len(((backup.get("stores") or {}).get("homex_plan") or {}).get("levels") or []),
    }


def validate(backup) -> str | None:
    """Why a document is not a Homex backup this version can restore."""
    if not isinstance(backup, dict) or backup.get("format") != FORMAT:
        return "not_a_backup"
    if not isinstance(backup.get("version"), int) or backup["version"] > VERSION:
        return "unsupported_version"
    rooms = backup.get("rooms")
    if not isinstance(rooms, list) or not all(
        isinstance(r, dict) and isinstance(r.get("data"), dict) and r.get("unique_id")
        for r in rooms
    ):
        return "invalid_rooms"
    if not isinstance(backup.get("stores", {}), dict) or not isinstance(backup.get("scenes", []), list):
        return "invalid_content"
    return None


def _write_file(path: str, backup: dict) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(backup, f, ensure_ascii=False, indent=2)


async def async_restore_backup(hass: HomeAssistant, hub: ConfigEntry, backup: dict) -> str:
    """Replace Homex's configuration and data by the backup's. Returns the
    path of the safety backup of the state it replaced."""
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    safety = hass.config.path(BACKUP_DIR, f"before-restore-{stamp}.json")
    await hass.async_add_executor_job(
        _write_file, safety, await async_create_backup(hass, hub)
    )

    domain_data = hass.data.setdefault(DOMAIN, {})
    domain_data[HOLD_RELOAD] = True
    try:
        # Storage documents first (Homex reads them when it reloads).
        for key, cache in STORES.items():
            doc = (backup.get("stores") or {}).get(key)
            store = Store(hass, 1, key)
            if doc is None:
                await store.async_remove()
            else:
                await store.async_save(doc)
            domain_data.pop(cache, None)

        # Rooms: drop the current ones, add the backup's.
        for sub in [s for s in hub.subentries.values() if s.subentry_type == "room"]:
            hass.config_entries.async_remove_subentry(hub, sub.subentry_id)
        for room in backup.get("rooms") or []:
            hass.config_entries.async_add_subentry(
                hub,
                ConfigSubentry(
                    data=room["data"],
                    subentry_type="room",
                    title=room.get("title") or room["unique_id"],
                    unique_id=room["unique_id"],
                ),
            )
        hass.config_entries.async_update_entry(hub, options=dict(backup.get("options") or {}))

        # Homex's scenes in scenes.yaml.
        async with domain_data[SCENES_LOCK]:
            await hass.async_add_executor_job(
                _replace_homex_scenes, hass.config.path(SCENES_FILE), backup.get("scenes") or []
            )
        await hass.services.async_call("scene", "reload", blocking=True)

        # The update listeners run as tasks: let them see the hold first.
        await asyncio.sleep(0.5)
        await hass.config_entries.async_reload(hub.entry_id)
    finally:
        domain_data[HOLD_RELOAD] = False
    return safety
