"""Read Zigbee2MQTT device state straight from MQTT.

Some useful fields of a Z2M device (e.g. a roller shutter's
``motor_run_status``) are published in the device's JSON state but never
exposed to Home Assistant as an entity or attribute. This bridge maps a HA
device to its Z2M topic and caches the last JSON state it published, so Homex
can both list those fields in the UI and evaluate conditions on them.

- A Z2M device is recognised by its MQTT identifier ``zigbee2mqtt_<ieee>``.
- ``<base>/bridge/devices`` (retained, published by Z2M) maps the IEEE address
  to the friendly name, i.e. the state topic ``<base>/<friendly_name>``.
- Device states are not retained: on first watch we ask Z2M to republish it
  (``<topic>/get``), which answers with the full cached state.
"""

from __future__ import annotations

import asyncio
import json
import logging
from collections.abc import Callable
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr

_LOGGER = logging.getLogger(__name__)

Z2M_ID_PREFIX = "zigbee2mqtt_"
# Single-level wildcard: matches the default base topic ("zigbee2mqtt") and any
# other one-level base topic, e.g. several Z2M instances.
BRIDGE_DEVICES_TOPIC = "+/bridge/devices"

StateListener = Callable[[dict], None]


def _ieee(hass: HomeAssistant, device_id: str) -> str | None:
    """IEEE address of a Zigbee2MQTT device, from its MQTT identifier."""
    dev = dr.async_get(hass).async_get(device_id)
    if dev is None:
        return None
    for domain, ident in dev.identifiers:
        if domain == "mqtt" and str(ident).startswith(Z2M_ID_PREFIX):
            return str(ident)[len(Z2M_ID_PREFIX) :]
    return None


def get_field(state: dict | None, path: str) -> Any:
    """A (possibly nested, dot-separated) field of a Z2M state payload."""
    value: Any = state
    for part in (path or "").split("."):
        if not isinstance(value, dict) or part not in value:
            return None
        value = value[part]
    return value


def flatten_fields(state: dict, prefix: str = "") -> dict[str, Any]:
    """Scalar fields of a state payload keyed by dot path (``a.b``)."""
    out: dict[str, Any] = {}
    for key, value in (state or {}).items():
        path = f"{prefix}{key}"
        if isinstance(value, dict):
            out.update(flatten_fields(value, path + "."))
        elif not isinstance(value, list):
            out[path] = value
    return out


# Z2M expose "access" bit meaning the property can be read with /get.
ACCESS_GET = 0b100


def _gettable_property(exposes) -> str | None:
    """First property of a Z2M device definition that supports /get."""
    for expose in exposes or []:
        if not isinstance(expose, dict):
            continue
        prop = expose.get("property")
        if prop and int(expose.get("access") or 0) & ACCESS_GET:
            return prop
        nested = _gettable_property(expose.get("features"))
        if nested:
            return nested
    return None


class Z2MBridge:
    """Caches Zigbee2MQTT device states per HA device (lazily subscribed)."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._topics: dict[str, str] = {}  # ieee -> "<base>/<friendly_name>"
        self._gettable: dict[str, str] = {}  # ieee -> a property Z2M can /get
        self._states: dict[str, dict] = {}  # device_id -> last JSON state
        self._subs: dict[str, Callable[[], None]] = {}  # device_id -> unsub
        self._listeners: dict[str, list[StateListener]] = {}
        self._waiters: dict[str, list[asyncio.Future]] = {}
        self._unsub_bridge: Callable[[], None] | None = None
        self._ready = asyncio.Event()

    @property
    def mqtt_available(self) -> bool:
        return "mqtt" in self.hass.config.components

    async def async_start(self) -> None:
        """Subscribe to the Z2M device list (no-op without MQTT)."""
        if self._unsub_bridge is not None or not self.mqtt_available:
            return
        from homeassistant.components import mqtt

        try:
            if not await mqtt.async_wait_for_mqtt_client(self.hass):
                return
            self._unsub_bridge = await mqtt.async_subscribe(
                self.hass, BRIDGE_DEVICES_TOPIC, self._on_bridge_devices
            )
        except Exception:  # noqa: BLE001 - MQTT misconfigured: feature disabled
            _LOGGER.debug("Zigbee2MQTT bridge subscription failed", exc_info=True)

    @callback
    def async_stop(self) -> None:
        for unsub in [self._unsub_bridge, *self._subs.values()]:
            if unsub:
                unsub()
        self._unsub_bridge = None
        self._subs.clear()
        self._listeners.clear()

    @callback
    def _on_bridge_devices(self, msg) -> None:
        base = msg.topic.split("/bridge/devices")[0]
        try:
            devices = json.loads(msg.payload)
        except (TypeError, ValueError):
            return
        for device in devices or []:
            ieee = device.get("ieee_address")
            name = device.get("friendly_name")
            if ieee and name:
                self._topics[ieee] = f"{base}/{name}"
                prop = _gettable_property((device.get("definition") or {}).get("exposes"))
                if prop:
                    self._gettable[ieee] = prop
        self._ready.set()

    async def async_topic(self, device_id: str) -> str | None:
        """State topic of a Z2M device, or None (not a Z2M device / no MQTT)."""
        ieee = _ieee(self.hass, device_id)
        if not ieee or not self.mqtt_available:
            return None
        await self.async_start()
        if ieee not in self._topics:
            # The retained device list arrives right after subscribing.
            try:
                await asyncio.wait_for(self._ready.wait(), 5)
            except TimeoutError:
                return None
        return self._topics.get(ieee)

    def state(self, device_id: str) -> dict | None:
        """Last known JSON state of a device (None until watched and received)."""
        return self._states.get(device_id)

    async def async_watch(
        self, device_id: str, listener: StateListener | None = None
    ) -> Callable[[], None]:
        """Keep the device's state cached (and notify ``listener`` on updates).

        Returns a function removing the listener.
        """
        if listener is not None:
            self._listeners.setdefault(device_id, []).append(listener)

        def remove() -> None:
            if listener is not None and listener in self._listeners.get(device_id, []):
                self._listeners[device_id].remove(listener)

        if device_id in self._subs:
            return remove
        topic = await self.async_topic(device_id)
        if topic is None or device_id in self._subs:
            return remove
        from homeassistant.components import mqtt

        @callback
        def on_state(msg) -> None:
            try:
                payload = json.loads(msg.payload)
            except (TypeError, ValueError):
                return
            if not isinstance(payload, dict):
                return
            self._states[device_id] = payload
            for fut in self._waiters.pop(device_id, []):
                if not fut.done():
                    fut.set_result(payload)
            for cb in list(self._listeners.get(device_id, [])):
                try:
                    cb(payload)
                except Exception:  # noqa: BLE001
                    _LOGGER.exception("Z2M state listener failed")

        self._subs[device_id] = await mqtt.async_subscribe(self.hass, topic, on_state)
        # States aren't retained: ask Z2M to republish this one now.
        await self._async_request(device_id, topic)
        return remove

    async def _async_request(self, device_id: str, topic: str) -> None:
        """Ask Z2M to republish the device's state (answered with the full
        cached state). Only properties the device can read are accepted."""
        from homeassistant.components import mqtt

        ieee = _ieee(self.hass, device_id) or ""
        prop = self._gettable.get(ieee, "state")
        await mqtt.async_publish(self.hass, f"{topic}/get", json.dumps({prop: ""}))

    async def async_fetch(self, device_id: str, timeout: float = 3) -> dict | None:
        """The device's state, waiting briefly for Z2M's answer if not cached."""
        already_watched = device_id in self._subs
        await self.async_watch(device_id)
        if device_id in self._states:
            return self._states[device_id]
        if device_id not in self._subs:
            return None
        fut = self.hass.loop.create_future()
        self._waiters.setdefault(device_id, []).append(fut)
        if already_watched:  # nothing received yet: ask again
            topic = await self.async_topic(device_id)
            if topic:
                await self._async_request(device_id, topic)
        try:
            return await asyncio.wait_for(fut, timeout)
        except TimeoutError:
            return None
