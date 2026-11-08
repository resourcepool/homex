"""Config flow for ZigEmu.

Coordinators (one emulated NCP port each) are created from the ZigEmu panel;
the integration itself only needs the default bind address for them.
"""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import CONF_HOST, DEFAULT_HOST, DOMAIN


class ZigEmuConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        if user_input is not None:
            return self.async_create_entry(title="ZigEmu", data=user_input)
        schema = vol.Schema({vol.Required(CONF_HOST, default=DEFAULT_HOST): str})
        return self.async_show_form(step_id="user", data_schema=schema)
