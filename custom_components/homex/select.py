"""select.homex_heating_{zone} - the active heating mode of each heating zone;
select.homex_climate_tolerance_mode - which tolerance the Climate module's
device presets enforce."""

from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, hx_name
from .heating import TOLERANCE_MODES, _doc, tolerance_mode
from .heating_zones import zones_manager
from .i18n import tr

# User-facing strings (see i18n.py).
_STRINGS = {
    "en": {"global": "Global", "tolerance": "Tolerance"},
    "fr": {"global": "Global", "tolerance": "Tolérance"},
}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    await _doc(hass)  # the entities read the heating document synchronously
    manager = zones_manager(hass)
    # Renamed from select.homex_tolerance_mode (unique id homex_tolerance_mode).
    ent_reg = er.async_get(hass)
    if old := ent_reg.async_get_entity_id("select", DOMAIN, "homex_tolerance_mode"):
        ent_reg.async_remove(old)
    await manager.async_setup_platform(async_add_entities)
    manager.tolerance_global = ToleranceModeSelect()
    async_add_entities([manager.tolerance_global])
    entry.async_on_unload(manager.unload_platform)


class ToleranceModeSelect(SelectEntity):
    """The global tolerance mode: setting it sets every zone's tolerance mode
    (select.homex_climate_tolerance_mode_<zone>), then re-applies the presets."""

    _attr_should_poll = False
    _attr_icon = "mdi:thermometer-lines"
    _attr_unique_id = "homex_climate_tolerance_mode"
    _attr_options = list(TOLERANCE_MODES)

    def __init__(self) -> None:
        self.entity_id = "select.homex_climate_tolerance_mode"

    @property
    def name(self) -> str:
        return hx_name(
            "Climate",
            tr(self.hass, _STRINGS, "global"),
            tr(self.hass, _STRINGS, "tolerance"),
        )

    @property
    def current_option(self) -> str:
        return tolerance_mode(self.hass)

    async def async_select_option(self, option: str) -> None:
        await zones_manager(self.hass).async_set_tolerance(option)
