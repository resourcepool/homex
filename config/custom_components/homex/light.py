"""light.room_lights_{slug}_group - the devices of the room or a group."""

from __future__ import annotations

from homeassistant.components.light import ColorMode, LightEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event

from .const import DOMAIN
from .room import RoomController, Unit


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    controller: RoomController = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([RoomLightGroup(unit) for unit in controller.units])


class RoomLightGroup(LightEntity):
    """A light that aggregates the devices of a unit (room or group)."""

    _attr_color_mode = ColorMode.ONOFF
    _attr_supported_color_modes = {ColorMode.ONOFF}
    _attr_icon = "mdi:lightbulb-multiple"
    _attr_should_poll = False

    def __init__(self, unit: Unit) -> None:
        self._unit = unit
        self._members = unit.devices
        self._attr_unique_id = unit.light_unique_id
        self._attr_name = f"{unit.name} group"
        self.entity_id = unit.light_entity_id
        self._attr_is_on = False

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        if self._members:
            self.async_on_remove(
                async_track_state_change_event(
                    self.hass, self._members, self._member_changed
                )
            )
        self._recompute()

    @callback
    def _member_changed(self, event: Event) -> None:
        self._recompute()
        self.async_write_ha_state()

    @callback
    def _recompute(self) -> None:
        states = [self.hass.states.get(e) for e in self._members]
        self._attr_is_on = any(s is not None and s.state == "on" for s in states)

    async def async_turn_on(self, **kwargs) -> None:
        if self._members:
            await self.hass.services.async_call(
                "homeassistant", "turn_on", {"entity_id": self._members}, blocking=True
            )

    async def async_turn_off(self, **kwargs) -> None:
        if self._members:
            await self.hass.services.async_call(
                "homeassistant", "turn_off", {"entity_id": self._members}, blocking=True
            )
