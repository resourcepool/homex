"""Config & options flow for Homex (the three panels)."""

from __future__ import annotations

import re

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    BooleanSelector,
    EntitySelector,
    EntitySelectorConfig,
)

from .const import (
    CONF_AREA_ID,
    CONF_DEVICES,
    CONF_GROUP_ID,
    CONF_GROUP_NAME,
    CONF_GROUPS,
    CONF_ROOM_ID,
    CONF_ROOM_NAME,
    CONF_SCENE_STRATEGY,
    CONF_TRIGGERS,
    DEVICE_DOMAINS,
    DOMAIN,
    STRATEGY_RECALL_FIRST,
    TRIGGER_DOMAINS,
)

ROOM_ID_RE = re.compile(r"^[a-z0-9_]+$")


def _device_selector() -> EntitySelector:
    return EntitySelector(EntitySelectorConfig(domain=DEVICE_DOMAINS, multiple=True))


def _trigger_selector() -> EntitySelector:
    return EntitySelector(EntitySelectorConfig(domain=TRIGGER_DOMAINS, multiple=True))


def _subset_selector(entities: list[str]) -> EntitySelector:
    """Selector restricted to the entities already present in the room."""
    return EntitySelector(
        EntitySelectorConfig(include_entities=entities, multiple=True)
    )


class HomexConfigFlow(ConfigFlow, domain=DOMAIN):
    """Three-panel setup: room -> devices -> triggers."""

    VERSION = 1

    def __init__(self) -> None:
        self._data: dict = {}

    # -- Panel 1: the room --------------------------------------------------

    async def async_step_user(self, user_input=None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            room_id = user_input[CONF_ROOM_ID].strip().lower()
            if not ROOM_ID_RE.match(room_id):
                errors[CONF_ROOM_ID] = "invalid_id"
            else:
                await self.async_set_unique_id(room_id)
                self._abort_if_unique_id_configured()
                self._data[CONF_ROOM_NAME] = user_input[CONF_ROOM_NAME]
                self._data[CONF_ROOM_ID] = room_id
                return await self.async_step_devices()

        schema = vol.Schema(
            {
                vol.Required(CONF_ROOM_NAME): str,
                vol.Required(CONF_ROOM_ID): str,
            }
        )
        return self.async_show_form(
            step_id="user", data_schema=schema, errors=errors
        )

    # -- Panel 2: the devices -----------------------------------------------

    async def async_step_devices(self, user_input=None) -> ConfigFlowResult:
        if user_input is not None:
            self._data[CONF_DEVICES] = user_input[CONF_DEVICES]
            return await self.async_step_triggers()

        schema = vol.Schema({vol.Required(CONF_DEVICES): _device_selector()})
        return self.async_show_form(step_id="devices", data_schema=schema)

    # -- Panel 3: the triggers ----------------------------------------------

    async def async_step_triggers(self, user_input=None) -> ConfigFlowResult:
        if user_input is not None:
            self._data[CONF_TRIGGERS] = user_input.get(CONF_TRIGGERS, [])
            return self.async_create_entry(
                title=self._data[CONF_ROOM_NAME], data=self._data
            )

        schema = vol.Schema(
            {vol.Optional(CONF_TRIGGERS, default=[]): _trigger_selector()}
        )
        return self.async_show_form(step_id="triggers", data_schema=schema)

    async def async_step_import(self, import_data: dict) -> ConfigFlowResult:
        """Create a room in one shot (used by the panel's 'new room' modal)."""
        room_id = str(import_data.get(CONF_ROOM_ID, "")).strip().lower()
        if not ROOM_ID_RE.match(room_id):
            return self.async_abort(reason="invalid_id")
        await self.async_set_unique_id(room_id)
        self._abort_if_unique_id_configured()
        name = import_data.get(CONF_ROOM_NAME) or room_id
        return self.async_create_entry(
            title=name,
            data={
                CONF_ROOM_NAME: name,
                CONF_ROOM_ID: room_id,
                CONF_AREA_ID: import_data.get(CONF_AREA_ID) or None,
                CONF_DEVICES: import_data.get(CONF_DEVICES, []),
                CONF_TRIGGERS: [],
                CONF_SCENE_STRATEGY: import_data.get(CONF_SCENE_STRATEGY)
                or STRATEGY_RECALL_FIRST,
            },
        )

    @staticmethod
    @callback
    def async_get_options_flow(entry: ConfigEntry) -> "HomexOptionsFlow":
        return HomexOptionsFlow(entry)


class HomexOptionsFlow(OptionsFlow):
    """Reconfigure a room and manage its groups after initial setup.

    Scenes are native (scenes.yaml) and edited in the HA scene editor, so their
    content is intentionally not managed here.
    """

    def __init__(self, entry: ConfigEntry) -> None:
        self._entry = entry
        self._editing: str | None = None

    @property
    def _data(self) -> dict:
        return {**self._entry.data, **self._entry.options}

    def _groups(self) -> list[dict]:
        return [dict(g) for g in (self._data.get(CONF_GROUPS) or [])]

    def _save(
        self,
        *,
        devices: list | None = None,
        triggers: list | None = None,
        groups: list | None = None,
    ) -> ConfigFlowResult:
        data = self._data
        # Preserve panel-managed keys (scenes, scene triggers, strategy) that
        # this flow does not edit, so they are never dropped.
        options = {k: v for k, v in self._entry.options.items()}
        options.update(
            {
                CONF_DEVICES: data.get(CONF_DEVICES, [])
                if devices is None
                else devices,
                CONF_TRIGGERS: data.get(CONF_TRIGGERS, [])
                if triggers is None
                else triggers,
                CONF_GROUPS: self._groups() if groups is None else groups,
            }
        )
        return self.async_create_entry(title="", data=options)

    # -- Menu ---------------------------------------------------------------

    async def async_step_init(self, user_input=None) -> ConfigFlowResult:
        menu = ["room", "add_group"]
        if self._groups():
            menu.append("manage_groups")
        return self.async_show_menu(step_id="init", menu_options=menu)

    # -- Room devices & triggers --------------------------------------------

    async def async_step_room(self, user_input=None) -> ConfigFlowResult:
        data = self._data
        if user_input is not None:
            return self._save(
                devices=user_input[CONF_DEVICES],
                triggers=user_input.get(CONF_TRIGGERS, []),
            )
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_DEVICES, default=data.get(CONF_DEVICES, [])
                ): _device_selector(),
                vol.Optional(
                    CONF_TRIGGERS, default=data.get(CONF_TRIGGERS, [])
                ): _trigger_selector(),
            }
        )
        return self.async_show_form(step_id="room", data_schema=schema)

    # -- Add a group --------------------------------------------------------

    async def async_step_add_group(self, user_input=None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        room_devices = self._data.get(CONF_DEVICES, [])
        if user_input is not None:
            group_id = user_input[CONF_GROUP_ID].strip().lower()
            existing = {g[CONF_GROUP_ID] for g in self._groups()}
            if not ROOM_ID_RE.match(group_id):
                errors[CONF_GROUP_ID] = "invalid_id"
            elif group_id in existing:
                errors[CONF_GROUP_ID] = "group_exists"
            else:
                groups = self._groups()
                groups.append(
                    {
                        CONF_GROUP_ID: group_id,
                        CONF_GROUP_NAME: user_input[CONF_GROUP_NAME],
                        CONF_DEVICES: user_input[CONF_DEVICES],
                        CONF_TRIGGERS: user_input.get(CONF_TRIGGERS, []),
                    }
                )
                return self._save(groups=groups)

        schema = vol.Schema(
            {
                vol.Required(CONF_GROUP_NAME): str,
                vol.Required(CONF_GROUP_ID): str,
                vol.Required(CONF_DEVICES): _subset_selector(room_devices),
                vol.Optional(CONF_TRIGGERS, default=[]): _trigger_selector(),
            }
        )
        return self.async_show_form(
            step_id="add_group", data_schema=schema, errors=errors
        )

    # -- Edit / delete a group ----------------------------------------------

    async def async_step_manage_groups(self, user_input=None) -> ConfigFlowResult:
        groups = self._groups()
        if user_input is not None:
            self._editing = user_input["group"]
            return await self.async_step_edit_group()

        choices = {g[CONF_GROUP_ID]: g[CONF_GROUP_NAME] for g in groups}
        schema = vol.Schema({vol.Required("group"): vol.In(choices)})
        return self.async_show_form(step_id="manage_groups", data_schema=schema)

    async def async_step_edit_group(self, user_input=None) -> ConfigFlowResult:
        groups = self._groups()
        group = next(
            (g for g in groups if g[CONF_GROUP_ID] == self._editing), None
        )
        if group is None:
            return self.async_abort(reason="unknown_group")

        room_devices = self._data.get(CONF_DEVICES, [])
        if user_input is not None:
            if user_input.get("delete"):
                groups = [
                    g for g in groups if g[CONF_GROUP_ID] != self._editing
                ]
            else:
                group[CONF_GROUP_NAME] = user_input[CONF_GROUP_NAME]
                group[CONF_DEVICES] = user_input[CONF_DEVICES]
                group[CONF_TRIGGERS] = user_input.get(CONF_TRIGGERS, [])
            return self._save(groups=groups)

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_GROUP_NAME, default=group[CONF_GROUP_NAME]
                ): str,
                vol.Required(
                    CONF_DEVICES, default=group.get(CONF_DEVICES, [])
                ): _subset_selector(room_devices),
                vol.Optional(
                    CONF_TRIGGERS, default=group.get(CONF_TRIGGERS, [])
                ): _trigger_selector(),
                vol.Optional("delete", default=False): BooleanSelector(),
            }
        )
        return self.async_show_form(step_id="edit_group", data_schema=schema)
