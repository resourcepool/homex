"""Entities exposed by each heating system (boiler, buffer tank).

binary_sensor.homex_system_<id>_<key>: demand, contact (boiler),
circulation / forced / rule_<type> (buffer tank);
sensor.homex_system_<id>_<key>: gap_<type> (°C), min_runtime_left (s),
runtime_today (min: circulator on-time since midnight, restored on restart);
switch.homex_system_<id>_aggressive: the system's agressive mode.

They read the systems manager's last computed status (heating_systems.py),
which writes them after every drive pass.
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.components.switch import SwitchEntity
from homeassistant.const import EVENT_STATE_CHANGED, UnitOfTemperature, UnitOfTime
from homeassistant.core import Event, callback
from homeassistant.helpers.event import async_track_time_change
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.util import dt as dt_util

from .const import hx_name

if TYPE_CHECKING:
    from .heating_systems import HeatingSystems

ICONS = {
    "demand": "mdi:fire-alert",
    "contact": "mdi:electric-switch",
    "circulation": "mdi:pump",
    "forced": "mdi:hand-back-right",
    "aggressive": "mdi:speedometer",
    "min_runtime_left": "mdi:timer-sand",
    "runtime_today": "mdi:timer-outline",
}


class _SystemEntity:
    _attr_should_poll = False

    def __init__(self, manager: HeatingSystems, system_id: str, key: str, label: str) -> None:
        self._manager = manager
        self.system_id = system_id
        self.key = key
        self._label = label
        self._attr_unique_id = f"homex_system_{system_id}_{key}"
        self.entity_id = f"{self._domain}.homex_system_{system_id}_{key}"
        self._attr_icon = ICONS.get(key.split("_")[0] if key.startswith("rule_") else key)
        if key.startswith("rule_"):
            self._attr_icon = "mdi:format-list-checks"
        elif key.startswith("gap_"):
            self._attr_icon = "mdi:thermometer-chevron-up"

    @property
    def _system(self) -> dict:
        return self._manager.system(self.system_id) or {}

    @property
    def _status(self) -> dict:
        return self._manager.status.get(self.system_id) or {}

    @property
    def name(self) -> str:
        return hx_name("Climate", self._system.get("name", self.system_id), self._label)

    @property
    def extra_state_attributes(self) -> dict:
        return {"system_id": self.system_id, "system_type": self._system.get("type")}


class SystemBinarySensor(_SystemEntity, BinarySensorEntity):
    _domain = "binary_sensor"

    def __init__(self, *args) -> None:
        super().__init__(*args)
        if self.key == "demand":
            self._attr_device_class = BinarySensorDeviceClass.HEAT
        elif self.key in ("contact", "circulation"):
            self._attr_device_class = BinarySensorDeviceClass.RUNNING

    @property
    def available(self) -> bool:
        return bool(self._status)

    @property
    def is_on(self) -> bool | None:
        status = self._status
        if self.key == "demand":
            return status.get("demand")
        if self.key in ("contact", "circulation"):
            return status.get("want")
        if self.key == "forced":
            return status.get("forced")
        if self.key.startswith("rule_"):
            return (status.get("rule_by_type") or {}).get(self.key.removeprefix("rule_"))
        return None


class SystemSensor(_SystemEntity, SensorEntity):
    _domain = "sensor"
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, *args) -> None:
        super().__init__(*args)
        if self.key.startswith("gap_"):
            self._attr_device_class = SensorDeviceClass.TEMPERATURE
            self._attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS
        else:
            self._attr_device_class = SensorDeviceClass.DURATION
            self._attr_native_unit_of_measurement = UnitOfTime.SECONDS

    @property
    def native_value(self):
        if self.key == "min_runtime_left":
            return self._manager.min_runtime_left(self.system_id)
        return (self._status.get("gaps") or {}).get(self.key.removeprefix("gap_"))


class SystemRuntimeSensor(_SystemEntity, SensorEntity, RestoreEntity):
    """How long the tank's circulator has run today (minutes), reset at
    midnight. Counts every "on" period, Homex-driven or not; survives a
    restart (the time Home Assistant was down is not counted)."""

    _domain = "sensor"
    _attr_device_class = SensorDeviceClass.DURATION
    _attr_native_unit_of_measurement = UnitOfTime.MINUTES
    _attr_state_class = SensorStateClass.TOTAL_INCREASING
    _attr_suggested_display_precision = 0

    def __init__(self, *args) -> None:
        super().__init__(*args)
        self._acc = 0.0  # seconds run today, finished periods
        self._on_since: datetime | None = None
        self._day = dt_util.now().date()
        self._unsubs: list = []

    def _circulator_on(self) -> bool:
        st = self.hass.states.get(self._system.get("circulator") or "")
        return st is not None and st.state == "on"

    async def async_added_to_hass(self) -> None:
        last = await self.async_get_last_state()
        if last is not None and last.attributes.get("day") == self._day.isoformat():
            try:
                self._acc = float(last.attributes.get("seconds", 0))
            except (TypeError, ValueError):
                self._acc = 0.0
        if self._circulator_on():
            self._on_since = dt_util.utcnow()
        self._unsubs.append(self.hass.bus.async_listen(EVENT_STATE_CHANGED, self._on_state))
        self._unsubs.append(
            async_track_time_change(self.hass, self._midnight, hour=0, minute=0, second=0)
        )

    async def async_will_remove_from_hass(self) -> None:
        while self._unsubs:
            self._unsubs.pop()()

    @callback
    def _on_state(self, event: Event) -> None:
        if event.data.get("entity_id") != self._system.get("circulator"):
            return
        now = dt_util.utcnow()
        on = (event.data.get("new_state") is not None
              and event.data["new_state"].state == "on")
        if on and self._on_since is None:
            self._on_since = now
        elif not on and self._on_since is not None:
            self._acc += (now - self._on_since).total_seconds()
            self._on_since = None
        self.async_write_ha_state()

    @callback
    def _midnight(self, _now) -> None:
        self._acc = 0.0
        self._day = dt_util.now().date()
        if self._on_since is not None:
            self._on_since = dt_util.utcnow()
        self.async_write_ha_state()

    def _seconds(self) -> float:
        running = (
            (dt_util.utcnow() - self._on_since).total_seconds() if self._on_since else 0.0
        )
        return self._acc + running

    @property
    def available(self) -> bool:
        return True

    @property
    def native_value(self) -> float:
        return round(self._seconds() / 60, 1)

    @property
    def extra_state_attributes(self) -> dict:
        return {
            **super().extra_state_attributes,
            "day": self._day.isoformat(),
            "seconds": round(self._seconds()),
            "running": self._on_since is not None,
        }


def _sensor(manager, system_id: str, key: str, label: str):
    cls = SystemRuntimeSensor if key == "runtime_today" else SystemSensor
    return cls(manager, system_id, key, label)


class SystemAggressiveSwitch(_SystemEntity, SwitchEntity):
    _domain = "switch"

    @property
    def is_on(self) -> bool:
        return bool(self._system.get("aggressive"))

    async def async_turn_on(self, **kwargs) -> None:
        await self._manager.async_set_aggressive(self.system_id, True)
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs) -> None:
        await self._manager.async_set_aggressive(self.system_id, False)
        self.async_write_ha_state()


ENTITY_CLASSES = {
    "binary_sensor": SystemBinarySensor,
    "sensor": _sensor,
    "switch": SystemAggressiveSwitch,
}
