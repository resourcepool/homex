"""Config flow: install Homex in one click; rooms are its subentries.

Homex is a single hub entry with no setup fields. Each room is a config
*subentry* of the hub (so rooms appear nested under Homex in Settings →
Devices & services). Rooms are normally created/edited from the Homex panel;
this flow also offers a minimal native "add room" form.
"""

from __future__ import annotations

import re

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigFlow,
    ConfigFlowResult,
    ConfigSubentryFlow,
    SubentryFlowResult,
)
from homeassistant.core import callback

from .const import (
    CONF_AREA_ID,
    CONF_DEVICES,
    CONF_GROUPS,
    CONF_HUB,
    CONF_ROOM_ID,
    CONF_ROOM_NAME,
    CONF_SCENE_STRATEGY,
    CONF_SCENE_TRIGGERS,
    CONF_SCENES,
    CONF_TRIGGERS,
    DOMAIN,
    HUB_UNIQUE_ID,
    STRATEGY_RECALL_FIRST,
)

ROOM_ID_RE = re.compile(r"^[a-z0-9_]+$")


class HomexConfigFlow(ConfigFlow, domain=DOMAIN):
    """Create the single Homex hub entry — no fields, single instance."""

    VERSION = 1

    async def async_step_user(self, user_input=None) -> ConfigFlowResult:
        await self.async_set_unique_id(HUB_UNIQUE_ID)
        self._abort_if_unique_id_configured()
        return self.async_create_entry(title="Homex", data={CONF_HUB: True})

    @classmethod
    @callback
    def async_get_supported_subentry_types(
        cls, config_entry
    ) -> dict[str, type[ConfigSubentryFlow]]:
        return {"room": RoomSubentryFlow}


class RoomSubentryFlow(ConfigSubentryFlow):
    """Add a room as a subentry of the Homex hub (name + id)."""

    async def async_step_user(self, user_input=None) -> SubentryFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            room_id = user_input[CONF_ROOM_ID].strip().lower()
            name = user_input[CONF_ROOM_NAME].strip()
            if not ROOM_ID_RE.match(room_id):
                errors[CONF_ROOM_ID] = "invalid_id"
            else:
                return self.async_create_entry(
                    title=name or room_id,
                    unique_id=room_id,
                    data={
                        CONF_ROOM_ID: room_id,
                        CONF_ROOM_NAME: name or room_id,
                        CONF_AREA_ID: None,
                        CONF_DEVICES: [],
                        CONF_TRIGGERS: [],
                        CONF_SCENE_TRIGGERS: [],
                        CONF_SCENE_STRATEGY: STRATEGY_RECALL_FIRST,
                        CONF_GROUPS: [],
                        CONF_SCENES: [],
                    },
                )

        schema = vol.Schema(
            {
                vol.Required(CONF_ROOM_NAME): str,
                vol.Required(CONF_ROOM_ID): str,
            }
        )
        return self.async_show_form(
            step_id="user", data_schema=schema, errors=errors
        )
