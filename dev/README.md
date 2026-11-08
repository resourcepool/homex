# Homex dev environment

A local Home Assistant with a realistic mock house, all over MQTT.

| Container | Role |
| --- | --- |
| `homex-ha` | Home Assistant on http://localhost:8124, Homex mounted from `custom_components/` |
| `homex-mosquitto` | MQTT broker (host port 1884) |
| `homex-z2m-sim` | Zigbee2MQTT simulator: the devices of `mock/house.py` |

The owner account of the dev instance is in `dev.env` (test only).

## Start from scratch

```sh
./dev/reset.sh
```

Moves the current dev state to `../homex-dev-backup-<date>`, starts the
containers, onboards Home Assistant (English, metric, Europe/Paris), creates
the floors and areas, adds the MQTT and Homex integrations. Homex itself is
left unconfigured (no rooms).

## The mock house

`mock/house.py` declares 4 floors (Basement, Ground Floor, First Floor, Attic),
19 areas (2 outdoor, without floor) and ~130 Zigbee devices with real models:

- lights (Philips Hue, IKEA TRADFRI, Innr),
- wall switches and remotes (Aqara double rocker and mini switch, Hue dimmer,
  IKEA STYRBAR and ON/OFF), exposed as device triggers of type `action`,
- roller shutters (Tuya TS130F, Legrand) that travel over ~20 s,
- radiator valves (SONOFF TRVZB, Danfoss Ally, Aqara E1) that heat their room
  while the setpoint is above the temperature,
- temperature / humidity / CO₂ / PM sensors, motion, door contacts,
- plugs with power metering, a boiler dry contact and buffer tank probes.

The simulator publishes everything like Zigbee2MQTT 2.x: discovery under
`homeassistant/`, retained JSON state on `zigbee2mqtt/<friendly name>`,
`zigbee2mqtt/bridge/devices`, and answers `/set` and `/get`. Devices land in
their area through `suggested_area`.

Edit `mock/house.py`, then `docker compose up -d --build z2m-sim` (new
devices appear; removed ones need `./dev/reset.sh`).

## Press a button

```sh
docker exec homex-mosquitto mosquitto_pub -t "zigbee2mqtt/Living Room Switch/action" -m single_left
```

Actions per model are listed in `mock/house.py` (`MODELS[...]["actions"]`).
