# Device profiles

A profile describes how to emulate one real Zigbee device. Built-in
profiles live here; in Home Assistant you can add your own as `*.json` in
`<config>/zigemu_profiles/` (same `id` overrides a built-in one).

A profile has to reproduce the **real** device, not what one host expects.
Gather facts from captures of the real device, not guesses:

1. **Descriptors and identity**: node descriptor (logical type, manufacturer
   code, MAC capabilities), each endpoint's simple descriptor (profile,
   **device type**, in/out clusters), and the Basic cluster attributes. ZHA
   quirks carry a captured simple descriptor in their `signature`
   ([zha-device-handlers](https://github.com/zigpy/zha-device-handlers)), and
   they match on *all* of it, device type included. Zigbee2MQTT definitions
   ([zigbee-herdsman-converters](https://github.com/Koenkk/zigbee-herdsman-converters/tree/master/src/devices))
   usually match on `modelId` only. Real device logs (Z2M debug logs, ZHA
   device signatures in issues) are the best source.
2. **What the device does on configure**: hosts bind clusters, write
   attributes and set up reporting. Every attribute they write must exist,
   and every bind/report config must get a success reply.
3. **The frames each physical gesture produces**: cluster, command,
   manufacturer code, payload layout, and side effects such as extra commands
   sent to bindings. Host decoders (Z2M `fromZigbee`, ZHA quirk clusters) and
   their comments document what real devices send.

## Format

```jsonc
{
  "id": "philips_rdm002",               // unique id
  "name": "Philips Hue Tap dial switch",
  "device": { "vendor": "Philips", "model": "8719514440937/8719514440999", "description": "Hue Tap dial switch",
              "type": "Remote",                  // device type: a filter chip and search term in "Add device"
              "image": "https://www.zigbee2mqtt.io/images/devices/8719514440937-8719514440999.png",  // https URL or relative path; falls back to a type icon
              "links": [{ "label": "Zigbee2MQTT", "url": "..." }, { "label": "ZHA quirk", "url": "..." }] },  // shown in the dashboard

  "node": {
    "logicalType": "end_device",        // end_device | router
    "rxOnWhenIdle": false,              // false => sleepy end device
    "manufacturerCode": 4107,           // node descriptor manufacturer code
    "macCapabilities": 128,             // 0x80 sleepy ED, 0x8C/0x8E mains router
    "ieeePrefix": "001788010"           // hex prefix for generated IEEE addresses (OUI)
  },

  "endpoints": [{
    "id": 1, "profileId": 260, "deviceId": 2080,
    "inClusters":  ["genBasic", "genPowerCfg", "0xfc00"],   // herdsman names or ids
    "outClusters": ["genOnOff", "genLevelCtrl"],
    "attributes": {
      "genBasic": {
        "modelId": "RDM002", "powerSource": 3,
        "0x0031": { "type": "bitmap16", "value": 0, "writable": true }  // unregistered attr: give a type
      }
    }
  }],

  "macros": { "name": { "send": { ... } } },  // reusable actions

  "controls": [ ... ]                   // what the dashboard shows
}
```

Server-side clusters (`inClusters`) answer Read/Write/Configure Reporting and
Discover Attributes using the `attributes` values. ZDO descriptors (node,
active endpoints, simple descriptor) come from `node` and `endpoints`.

### Cluster servers, inputs and reporting

Input clusters with a built-in server get spec behaviour and default attributes
automatically. Profile `attributes` override the values, and an endpoint's
`serverOptions` configures the servers:

| Cluster | Behaviour |
|---|---|
| `genOnOff` | off/on/toggle, offWithEffect, onWithRecallGlobalScene, onWithTimedOff; `startUpOnOff` on power-up |
| `genLevelCtrl` | moveToLevel/move/step/stop (+ with on/off), `startUpCurrentLevel` |
| `genIdentify` | identify (countdown), identifyQuery, triggerEffect |
| `genGroups` / `genScenes` | full membership/scene tables (OnOff/Level extension fields) |
| `lightingColorCtrl` | `serverOptions.lightingColorCtrl`: `capabilities` (`hs`, `ehue`, `loop`, `xy`, `ct`), `ctMin`/`ctMax` (mireds); moves, steps, transitions, color loop, start-up color temperature |
| `ssIasZone` | `serverOptions.ssIasZone.zoneType`; enroll request on CIE write, enroll response, status change notifications; local commands `alarm1`, `alarm2`, `tamper`, `battery_low` (`args: {"on": bool}`) |
| `msOccupancySensing` | occupancy follows the `occupied` input (`serverOptions.msOccupancySensing.sensorType`) |
| `msTemperatureMeasurement` / `msRelativeHumidity` / `msIlluminanceMeasurement` / `msFlowMeasurement` | measured value from an input (`temperature_c`, `humidity_pct`, `illuminance_lux`, `flow_m3h`, or `serverOptions.<cluster>.input`) |
| `genPollCtrl` | check-in every `checkinInterval` (quarter seconds, `serverOptions.genPollCtrl`) |
| `hvacThermostat` | setpoints/limits, modes, running state, raise/lower, weekly schedule, room model (`heatRate`, `lossRate`, `timeScale`, `tick`), attribute links `valveOpeningLimit`, `externalSensorSelect`, `externalSensorValue`, `frostProtection` (each `["cluster", "attribute"]`); local commands `raise`/`lower` |
| `haElectricalMeasurement` + `seMetering` | `serverOptions.electricityMeter`: `voltageDivisor`, `currentDivisor`, `energyDivisor`, `powerDivisor` (int or `{"below", "above", "threshold"}`), `voltageNoise`, `tick` |

Reporting is handled for you: the host's Configure Reporting decides what the
device reports and when. Attributes changed by servers or by `setAttribute`
actions go through it.

`inputs` declares physical quantities (e.g. `{"load_w": 0, "mains_v": 230}`)
that controls change and servers read. The meter uses `load_w` and `mains_v`.

### Node options

- `volatileReporting: true`: the device forgets the host's reporting configuration on power loss.
- `reportManufacturerCode: {"<cluster>": null | code}`: manufacturer code used when reporting that cluster (default: the node's code for clusters ≥ 0xFC00).

### Endpoint options

- `acceptCommands: {"<cluster>": "*" | [ids]}`: manufacturer commands the real device accepts that are not modelled (e.g. Hue effects on 0xFC03).

### Events

`"events"` runs actions on lifecycle hooks: `joined` (after the announce),
`powerUp` (after a power restore), `attr:<cluster>:<0xid>` (attribute changed;
`value` is available), and `command:<cluster>:<id>` (accepted manufacturer
command; `payload` hex). Macros can be a list: `"macros": {"tick": {"actions": [...]}}`.

### Standard components

Common physical features come from a shared library, so they look and behave
the same on every device. Use one with `"use"` and override only what is
device-specific (`label`, `description`, `on` events replace the component's,
`also` appends actions to its events):

```jsonc
{ "id": "mains", "use": "power" }                       // ⚡ Power switch: cut / restore mains
{ "id": "battery", "use": "battery" }                   // 🔋 Low / Middle / Full -> genPowerCfg
{ "id": "battery", "use": "battery", "on": { "change": [ ... ] } }   // custom battery behaviour
{ "id": "tamper", "use": "tamper", "also": { "removed": [ { "report": ... } ] } }
```

| Component | Widget | States / options | Default behaviour |
|---|---|---|---|
| `power` | switch, outlined | off / on | mains cut / restore (reboot, power-on behaviour, re-announce) |
| `battery` | buttons | Low 8 % / Middle 50 % / Full 100 % | sets genPowerCfg percentage and voltage |
| `load` | buttons | None 0 W / Mid 150–180 W / High 2000–2200 W | input `load_w` |
| `mains_voltage` | buttons | 110 V / 220 V | input `mains_v` |
| `room_temperature` | buttons | Cold / Cool / Comfort / Warm | input `temperature_c` |
| `outside_temperature` | buttons | Freezing / Cold / Mild / Warm (fluctuating) | input `ambient_c` |
| `water_flow` | buttons | None / Low / High (fluctuating) | input `flow_lpm` |
| `contact` | switch | closed / open | IAS zone alarm1 |
| `presence` | switch | away / present | input `person_present` |
| `ambient_light` | switch | dim / bright | input `bright` |
| `tamper` | switch | closed / removed | input `tampered` |
| `water_supply` | switch, outlined | off / on | input `supply_ok` |
| `wall_switch` | switch | down / up | input `wall_switch`, toggles the relay on every flip |
| `knob` | − / + | down / up | (device-specific `on.up` / `on.down`) |
| `cover` | Open / Stop / Close / 50 % buttons | actions | Window Covering open / stop / close / go to 50 % (override `on` for Tuya 0xEF00 covers) |
| `humidity` | buttons | Dry / Normal / Humid / Shower (fluctuating) | input `humidity_pct` |
| `air_quality` | buttons | Fresh / Stuffy / Polluted | inputs `co2_ppm`, `voc_ppb`, `hcho_ugm3`, `pm25_ugm3` |
| `smoke` | switch | clear / smoke | input `smoke` (the Aqara profile overrides it with its 0xFCC0 macro) |
| `relay_button` | round push button, outlined | Off / On (from `genOnOff`) | press toggles the relay; hold 3 s |
| `valve_button` | round push button, outlined | Closed / Open (from `genOnOff`) | press opens / closes the valve; hold 3 s |
| `brightness` | brightness bar (read-only) | off / level %, tinted with the light's color | indicator of `endpoint` (default 1) |
| `color` | color strip (read-only) | warm → cool for color temperature, rainbow for hue / xy | indicator of `endpoint` (default 1) |

**Outlines:** components with `"outline": true` (on/off or open/closed
actuators) get a green outline when on/open and a red one when off/closed.
Sensors (door, person, cover, daylight) and the wall rocker are not outlined:
their position is not an on/off state of the device.

**Light displays** are read-only and stay visible in auto mode:
`{ "id": "light", "use": "brightness", "endpoint": 11 }`. Their `text` (the
indicator value used by tests and the info modal) is unchanged:
`on · 50 %`, `3333 K`, `xy 0.305, 0.31`, `hue … sat …`.

The underlying control types are reusable directly too:
- `toggle`: `states` [off, on], `stateLabels`, and a `value` template that
  derives the current state from the device.
- `stepper`: `on.down` / `on.up`.
- `button` with a `state` template (truthy = on) and `stateLabels`: a push
  button that shows the state it drives.
- `indicator` with `widget`: `brightness` / `color`, and `endpoint`.

### Controls

| type     | dashboard input           | events fired (`on.<event>`)                          | variables                    |
|----------|---------------------------|------------------------------------------------------|------------------------------|
| `button` | press / hold a button     | `press`, `hold` (repeats), `press_release`, `hold_release` | `held_ms`, `hold_count` + control `vars` |
| `dial`   | drag a knob or use presets | `rotate`                                             | `steps` (signed), `first`    |
| `range`  | slider (`min/max/step/default`) | `change`                                       | `value`                      |
| `action` | one button per event name | any key in `on`                                      | —                            |
| `preset` | button group of options: a constant (`"value"`) or a fluctuating range (`"range": [lo, hi]`, `"every"` ms, `"step"`) | `change` on each generated value | `value`, `option` |
| `toggle` | a switch between two named `states` | `on.<state>` | — |
| `stepper` | − / + buttons | `on.down`, `on.up` | — |
| `indicator` | read-only live value (`value` template, optional `on` for a status dot) | — | — |

Control flags: `offline: true` keeps the control usable while unpaired or
unpowered (physical quantities). `power: true` marks the mains switch.

`button` options: `holdDelay` and `holdInterval` (ms). `dial` options:
`presets` ([{label, steps}]) and `sequenceTimeout` (ms; `first` is true when the
previous rotation is older than this).

### Actions

Each event is a list of actions:

```jsonc
{ "send": {                              // a ZCL frame from the device to the coordinator
    "endpoint": 1, "dstEndpoint": 1,
    "cluster": "genLevelCtrl", "command": 2,
    "clusterSpecific": true,             // false => global (profile-wide) command
    "direction": "client_to_server",     // or server_to_client
    "manufacturerCode": 4107,            // optional => manufacturer-specific frame
    "disableDefaultResponse": true,
    "payload": [["enum8", "{{ 0 if steps >= 0 else 1 }}"], ["uint8", 10], ["uint16", 2]]
  },
  "if": "{{ hold_count == 1 }}",         // optional condition (template)
  "comment": "why the real device sends this"
}
{ "report": { "endpoint": 1, "cluster": "genPowerCfg",
              "attributes": { "batteryPercentageRemaining": "{{ value * 2 }}" } } }
{ "macro": "hue_button", "vars": { "type": 0 } }
{ "command": { "endpoint": 1, "cluster": "genOnOff", "name": "toggle" } }      // physical input on our own server
{ "setAttribute": { "cluster": "genPowerCfg", "attributes": { "batteryPercentageRemaining": "{{ value * 2 }}" } } }
{ "setInput": { "load_w": "{{ value }}" } }                                    // physical world
{ "power": "off" }                                                              // mains cut / "on" restores (reboot)
{ "command": { "cluster": "ssIasZone", "name": "alarm1", "args": { "on": true } } }
{ "schedule": { "id": "clear", "after": "{{ attr('msOccupancySensing', 'ultrasonicOToUDelay') * 1000 }}", "do": [...] } }
{ "cancel": "clear" }
```

Indicators can show a color dot: `"swatch": "{{ light_css(1) }}"`.
Template helpers include `str`, `bswap16`/`bswap32` (big-endian numbers in LE
attributes) and `arr(value, i)` (element i of a ZCL uint8 array attribute,
type `array`). Expressions can also index lists, e.g. `['low', 'high'][i]`.

`report` sends an attribute report immediately, whatever the host
configured (for devices that report on their own). `setAttribute` changes the
value and lets the reporting configuration decide.

Templates can read live attribute values with `attr('genOnOff', 'onOff')`,
plus the `inputs` and the `powered` / `joined` flags.

Payload types: `uint8/16/24/32/48`, `int8/16/24/32`, `enum8/16`, `bitmap8/16/24/32`,
`bool`, `single`, `charstr`, `octstr`, `ieee`, `data8/16`.

Values can be templates: `"{{ expr }}"` gives a typed value, and
`"text {{ expr }}"` gives a string. Expressions support arithmetic, bitwise
operators, comparisons, `in`, `x if c else y`, tuples, and `abs min max round int float`.

### Routine templates

`routineTemplates` is a list of routines offered in the dashboard's
"From template…" menu (see the main README for the step format). They are
validated against the profile's controls when the profile loads; an invalid
template is skipped with a warning.

```jsonc
"routineTemplates": [{
  "name": "Tap then sweep the dial", "loop": true,
  "steps": [
    { "kind": "gesture", "control": "button_1", "gesture": "tap", "repeat": { "every": 5000, "times": 3 } },
    { "kind": "gesture", "control": "dial", "gesture": "rotate", "params": { "direction": "+", "step": 2 },
      "repeat": { "every": 250, "for": 10000 } },
    { "kind": "wait", "ms": 1000 }
  ]
}]
```

Gestures per control type (indicators have none): `preset` → `select {option}`; `button` → `tap`, `double_tap`, `hold {holdMs}`;
`dial` → `rotate {direction: "+"|"-", step}`; `range` → `set {value}`,
`ramp {from, to}` (needs a repeat); `action` → any of its event names.


### Covers, Tuya datapoints and click patterns

- **Window Covering (`closuresWindowCovering`)**: open / close / stop / go to lift %,
  with a travel-time motor model, operational status and a final position report.
  `serverOptions.closuresWindowCovering`: `travelSeconds`, `invert` (the attribute is
  the open % — Moes TS130F), `tuya` (Tuya attributes 0xF000–0xF003 / 0x8000; the
  calibration time drives the travel time), `ewelinkMotorStatus` (mirrors the motor on
  0xFC11/0x5013). It publishes the inputs `cover_open_pct` and `cover_motion`.
- **Tuya MCU datapoints (`manuSpecificTuya`, 0xEF00)**: dataRequest / sendData /
  dataQuery / mcuVersion / time sync from the gateway; dataResponse / dataReport from
  the device. `serverOptions.manuSpecificTuya`: `datapoints` (DP id → input, type,
  scale), `cover` (curtain motor model), `reportInterval`, `oneDpPerFrame`.
- **Click patterns** (Tuya scene buttons, SNZB-01P): single / double / hold are built
  from `schedule` / `cancel` / `setInput` with one input per button; a second press
  within 0.4 s is a double, a 1.5 s hold sends hold once.
- **Unsolicited reports**: relays that are only bound (not configured for reporting)
  report through `events["attr:genOnOff:0x0000"]`.
- **ZLL endpoints** (`profileId` 0xC05E) send their ZCL frames with the Home Automation
  profile, as the ZLL spec requires; only touchlink keeps 0xC05E.
