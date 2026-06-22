"""The Homex integration: room lighting automations made easy."""

from __future__ import annotations

import asyncio
import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import HomeAssistant

from .const import DOMAIN, HUB_DATA, PLATFORMS, SCENES_LOCK
from .room import HomexHub

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Register the Homex sidebar panel (deferred so it never blocks boot)."""

    async def _register(_event=None) -> None:
        try:
            from .panel import async_register_homex_panel

            await async_register_homex_panel(hass)
        except Exception:  # noqa: BLE001
            _LOGGER.exception("Failed to register the Homex panel")

    if hass.is_running:
        hass.async_create_task(_register())
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _register)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up the single Homex hub entry that owns every room."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    # Shared lock so concurrent scene writes don't clobber scenes.yaml.
    domain_data.setdefault(SCENES_LOCK, asyncio.Lock())

    hub = HomexHub(hass, entry)
    hub.build()
    domain_data[HUB_DATA] = hub

    # Create the switch / light group entities for every room and group.
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Seed scenes and wire each room's trigger automations.
    await hub.async_start()

    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload the Homex hub."""
    hub: HomexHub | None = hass.data[DOMAIN].get(HUB_DATA)
    if hub is not None:
        await hub.async_stop()

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(HUB_DATA, None)
    return unload_ok


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload everything when the room list (options) changes."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Delete Homex: also remove every room/group scene from scenes.yaml."""
    hub = HomexHub(hass, entry)
    hub.build()
    await hub.async_remove_all_scenes()
