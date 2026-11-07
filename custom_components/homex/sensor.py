"""sensor.homex_{room}_{metric} - a room's reference climate metrics.

Each metric of a room with the Climate module combines its sensors with the
room's rule: weighted mean, max or min of the available values.
"""

from __future__ import annotations

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event

from .const import CONF_METRICS, DOMAIN, HUB_DATA, METRICS, MODULE_HEATING
from .room import HomexHub, RoomController


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    hub: HomexHub = hass.data[DOMAIN][HUB_DATA]
    for room_id, controller in hub.controllers.items():
        if MODULE_HEATING not in controller.modules:
            continue
        metrics = controller._cfg(CONF_METRICS) or {}
        entities = [
            RoomMetricSensor(controller, metric, cfg)
            for metric, cfg in metrics.items()
            if metric in METRICS and (cfg or {}).get("sensors")
        ]
        if entities:
            async_add_entities(entities, config_subentry_id=hub.subentry_id(room_id))


def combine(values: list[tuple[float, float]], rule: str) -> float | None:
    """Combine (value, weight) pairs with a rule: mean (weighted), max, min."""
    if not values:
        return None
    if rule == "max":
        return max(v for v, _ in values)
    if rule == "min":
        return min(v for v, _ in values)
    total = sum(w for _, w in values)
    if total <= 0:
        return sum(v for v, _ in values) / len(values)
    return sum(v * w for v, w in values) / total


class RoomMetricSensor(SensorEntity):
    """A room's reference value of one metric, from its sensors."""

    _attr_should_poll = False
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, controller: RoomController, metric: str, cfg: dict) -> None:
        self._metric = metric
        self._rule = cfg.get("rule") or "mean"
        self._sensors = [
            (s["entity_id"], float(s.get("weight") or 1))
            for s in cfg.get("sensors", [])
            if s.get("entity_id")
        ]
        device_class, label = METRICS[metric]
        self._attr_device_class = SensorDeviceClass(device_class)
        self._attr_name = f"{controller.room_name} {label}"
        self._attr_unique_id = f"homex_{controller.room_id}_{metric}"
        self.entity_id = f"sensor.homex_{controller.room_id}_{metric}"
        self._used = 0

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            async_track_state_change_event(
                self.hass, [e for e, _ in self._sensors], self._on_change
            )
        )
        self._recompute()

    @callback
    def _on_change(self, event: Event) -> None:
        self._recompute()
        self.async_write_ha_state()

    @callback
    def _recompute(self) -> None:
        values = []
        unit = None
        for entity_id, weight in self._sensors:
            st = self.hass.states.get(entity_id)
            if st is None:
                continue
            try:
                values.append((float(st.state), weight))
            except (TypeError, ValueError):
                continue  # unknown / unavailable
            unit = unit or st.attributes.get("unit_of_measurement")
        self._used = len(values)
        value = combine(values, self._rule)
        self._attr_native_value = None if value is None else round(value, 1)
        if unit:
            self._attr_native_unit_of_measurement = unit

    @property
    def available(self) -> bool:
        return self._used > 0

    @property
    def extra_state_attributes(self) -> dict:
        return {
            "rule": self._rule,
            "sensors": [e for e, _ in self._sensors],
            "sensors_used": self._used,
        }
