"""switch.room_lights_{slug} - on/off state of the room and each group."""

from __future__ import annotations

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import DOMAIN
from .room import RoomController, Unit


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    controller: RoomController = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([RoomSwitch(unit) for unit in controller.units])


class RoomSwitch(SwitchEntity, RestoreEntity):
    """Represents whether a unit's lights should be on."""

    _attr_icon = "mdi:lightbulb-group"
    _attr_should_poll = False

    def __init__(self, unit: Unit) -> None:
        self._unit = unit
        self._attr_unique_id = unit.switch_unique_id
        self._attr_name = f"{unit.name} lights"
        self.entity_id = unit.switch_entity_id
        self._attr_is_on = False
        self._active_scene: str | None = None

    @property
    def extra_state_attributes(self) -> dict:
        # The active scene (key) while the room is on; None when off.
        return {"active_scene": self._active_scene}

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last_state = await self.async_get_last_state()
        if last_state is not None:
            self._attr_is_on = last_state.state == "on"
        if self._unit.is_room:
            self._unit._controller.bind_room_switch(self)

    @callback
    def set_is_on(self, value: bool) -> None:
        """Reflect on/off state without applying a scene (used by scene switching)."""
        self._attr_is_on = value
        self.async_write_ha_state()

    @callback
    def set_active_scene(self, key: str | None) -> None:
        self._active_scene = key
        self.async_write_ha_state()

    async def async_turn_on(self, **kwargs) -> None:
        self._attr_is_on = True
        self.async_write_ha_state()
        if self._unit.is_room:
            # Apply the scene chosen by the room's recall strategy.
            await self._unit._controller.async_room_on()
        else:
            await self._unit.apply_on()

    async def async_turn_off(self, **kwargs) -> None:
        self._attr_is_on = False
        self.async_write_ha_state()
        if self._unit.is_room:
            self._unit._controller.on_toggled_off()
        await self._unit.apply_off()
        # Turning off a room also turns off all its sub-groups.
        await self._unit.turn_off_children()
