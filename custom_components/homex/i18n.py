"""Homex translations for user-facing backend strings.

Entity names, default scene names, notifications and the error messages the
panel shows. (Log messages stay in English; config / options flow strings use
Home Assistant's own translations/ files.)

Language: the hub's "language" option ("auto" / "en" / "fr", set in Settings →
Devices & services → Homex → Configure, or from the panel menu), "auto"
following Home Assistant's language; English when unsupported.

Each module keeps its own catalog next to its code:

    _STRINGS = {"en": {"key": "Text {param}"}, "fr": {"key": "Texte {param}"}}
    tr(hass, _STRINGS, "key", param=...)

Every key must exist in English (the fallback).
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from .const import DOMAIN

LANGUAGES = ("en", "fr")
CONF_LANGUAGE = "language"
LANGUAGE_AUTO = "auto"


def language_setting(hass: HomeAssistant) -> str:
    """The hub's language option ("auto" when unset)."""
    for entry in hass.config_entries.async_entries(DOMAIN):
        value = entry.options.get(CONF_LANGUAGE)
        if value in LANGUAGES:
            return value
    return LANGUAGE_AUTO


def language(hass: HomeAssistant) -> str:
    """The active language: the option, else HA's language, else English."""
    value = language_setting(hass)
    if value in LANGUAGES:
        return value
    base = (hass.config.language or "en").lower().replace("_", "-").split("-")[0]
    return base if base in LANGUAGES else "en"


def tr(hass: HomeAssistant, strings: dict[str, dict[str, str]], key: str, **params: Any) -> str:
    """Translate `key` from a module catalog, filling `{param}` placeholders."""
    text = strings.get(language(hass), {}).get(key) or strings["en"].get(key, key)
    return text.format(**params) if params else text
