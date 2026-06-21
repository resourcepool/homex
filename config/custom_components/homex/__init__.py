"""The Homex integration: room lighting automations made easy."""

from __future__ import annotations

import asyncio
import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PLATFORMS, SCENES_LOCK
from .room import RoomController

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
    """Set up a Homex room from a config entry."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    # Shared lock so concurrent room setups don't clobber scenes.yaml.
    domain_data.setdefault(SCENES_LOCK, asyncio.Lock())
    controller = RoomController(hass, entry)
    hass.data[DOMAIN][entry.entry_id] = controller

    # Create the switch / light group / scene entities for this room.
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Activate the room_lights_switcher_{id} automation.
    await controller.async_start()

    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a Homex room."""
    controller: RoomController | None = hass.data[DOMAIN].get(entry.entry_id)
    if controller is not None:
        await controller.async_stop()

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)
    return unload_ok


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the room when its options change."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Delete the room: also remove its scenes (room + groups) from scenes.yaml."""
    await RoomController(hass, entry).async_remove_scenes()
