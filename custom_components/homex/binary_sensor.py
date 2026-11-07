"""binary_sensor.homex_heating_needed[_{zone}] - heating demand, global and per
heating zone: on as soon as one radiator valve of their rooms heats."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .heating_zones import zones_manager


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    manager = zones_manager(hass)
    await manager.async_setup_needed(async_add_entities, entry)
    entry.async_on_unload(manager.unload_needed)
