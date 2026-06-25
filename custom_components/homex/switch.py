"""switch.homex_{slug}_lights_toggle - on/off state of the room and each group."""

from __future__ import annotations

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.restore_state import RestoreEntity

from .const import DOMAIN, HUB_DATA
from .room import HomexHub, Unit


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    hub: HomexHub = hass.data[DOMAIN][HUB_DATA]
    for room_id, controller in hub.controllers.items():
        async_add_entities(
            [RoomSwitch(unit) for unit in controller.units],
            config_subentry_id=hub.subentry_id(room_id),
        )


class RoomSwitch(SwitchEntity, RestoreEntity):
    """Represents whether a unit's lights should be on."""

    _attr_icon = "mdi:lightbulb-group"
    _attr_should_poll = False

    def __init__(self, unit: Unit) -> None:
        self._unit = unit
        self._attr_unique_id = unit.switch_unique_id
        self._attr_name = unit.switch_name
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
            # A room is "on" as soon as any of its parts is on — its own member
            # devices or any of its groups. Track them and reflect that state
            # WITHOUT applying a room scene (the passive on must not trigger one).
            watched = [
                *self._unit.devices,
                *self._unit._controller.group_switch_ids,
            ]
            if watched:
                self.async_on_remove(
                    async_track_state_change_event(
                        self.hass, watched, self._on_part_changed
                    )
                )
            self._recompute_room_on()

    def _any_part_on(self) -> bool:
        ids = [*self._unit.devices, *self._unit._controller.group_switch_ids]
        for entity_id in ids:
            state = self.hass.states.get(entity_id)
            if state is not None and state.state == "on":
                return True
        return False

    @callback
    def _on_part_changed(self, event: Event) -> None:
        self._recompute_room_on()

    @callback
    def _recompute_room_on(self) -> None:
        """Derive on/off from the room's parts (no scene side effect)."""
        on = self._any_part_on()
        if on == self._attr_is_on:
            return
        self._attr_is_on = on
        if not on:
            self._active_scene = None  # nothing on → no active scene
        self.async_write_ha_state()

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
