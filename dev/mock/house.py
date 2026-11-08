"""The mock house: floors, areas and their Zigbee2MQTT devices.

Every device is published like Zigbee2MQTT does it (discovery under
``homeassistant/``, state on ``zigbee2mqtt/<friendly name>``, device triggers
for button actions, ``zigbee2mqtt/bridge/devices``), so Homex sees real-looking
models: wall switches, remotes, roller shutters, radiator valves, sensors.
"""

# Floors (HA floor registry): id -> (name, level, icon)
FLOORS = {
    "basement": ("Basement", -1, "mdi:home-floor-negative-1"),
    "ground_floor": ("Ground Floor", 0, "mdi:home-floor-0"),
    "first_floor": ("First Floor", 1, "mdi:home-floor-1"),
    "attic": ("Attic", 2, "mdi:home-roof"),
}

# Areas: name -> (floor id or None, icon)
AREAS = {
    "Garage": ("basement", "mdi:garage"),
    "Laundry Room": ("basement", "mdi:washing-machine"),
    "Boiler Room": ("basement", "mdi:water-boiler"),
    "Entrance Hall": ("ground_floor", "mdi:door"),
    "Living Room": ("ground_floor", "mdi:sofa"),
    "Dining Room": ("ground_floor", "mdi:silverware-fork-knife"),
    "Kitchen": ("ground_floor", "mdi:stove"),
    "Office": ("ground_floor", "mdi:desk"),
    "Guest Toilet": ("ground_floor", "mdi:toilet"),
    "Landing": ("first_floor", "mdi:stairs"),
    "Master Bedroom": ("first_floor", "mdi:bed-king"),
    "Master Bathroom": ("first_floor", "mdi:shower"),
    "Kids Bedroom": ("first_floor", "mdi:teddy-bear"),
    "Guest Bedroom": ("first_floor", "mdi:bed"),
    "Bathroom": ("first_floor", "mdi:bathtub"),
    "Playroom": ("attic", "mdi:puzzle"),
    "Attic Storage": ("attic", "mdi:archive"),
    "Garden": (None, "mdi:flower"),
    "Terrace": (None, "mdi:table-chair"),
}

# Device models (Zigbee2MQTT definitions: vendor, model id, description).
# kind drives the entities and the simulation.
MODELS = {
    # Lights
    "hue_gu10": dict(kind="light", vendor="Philips", model="929001953101",
                     description="Hue White and Color Ambiance GU10", color=True, ct=True),
    "hue_e27_white": dict(kind="light", vendor="Philips", model="8718696449691",
                          description="Hue White Single bulb E27", color=False, ct=False),
    "tradfri_e27_ws": dict(kind="light", vendor="IKEA", model="LED1545G12",
                           description="TRADFRI bulb E27 white spectrum 980 lm", color=False, ct=True),
    "tradfri_e14": dict(kind="light", vendor="IKEA", model="LED2101G4",
                        description="TRADFRI bulb E14 white spectrum 470 lm", color=False, ct=True),
    "hue_lightstrip": dict(kind="light", vendor="Philips", model="929002994901",
                           description="Hue Lightstrip Plus V4", color=True, ct=True),
    "innr_outdoor": dict(kind="light", vendor="Innr", model="OSL 130 C",
                         description="Outdoor smart spot colour", color=True, ct=True),
    # Wall switches and remotes (device triggers of type "action")
    "aqara_double": dict(kind="switch", vendor="Aqara", model="WXKG02LM_rev1",
                         description="Wireless remote switch (double rocker), 2016 model",
                         actions=["single_left", "single_right", "single_both",
                                  "double_left", "double_right", "double_both",
                                  "hold_left", "hold_right", "hold_both"]),
    "aqara_single": dict(kind="switch", vendor="Aqara", model="WXKG01LM",
                         description="Wireless mini switch",
                         actions=["single", "double", "triple", "quadruple", "hold", "release"]),
    "hue_dimmer": dict(kind="switch", vendor="Philips", model="324131092621",
                       description="Hue dimmer switch",
                       actions=["on_press", "on_press_release", "on_hold", "on_hold_release",
                                "up_press", "up_press_release", "up_hold", "up_hold_release",
                                "down_press", "down_press_release", "down_hold", "down_hold_release",
                                "off_press", "off_press_release", "off_hold", "off_hold_release"]),
    "styrbar": dict(kind="switch", vendor="IKEA", model="E2001/E2002",
                    description="STYRBAR remote control",
                    actions=["on", "off", "brightness_move_up", "brightness_move_down",
                             "brightness_stop", "arrow_left_click", "arrow_right_click",
                             "arrow_left_hold", "arrow_right_hold", "arrow_left_release",
                             "arrow_right_release"]),
    "tradfri_onoff": dict(kind="switch", vendor="IKEA", model="E1743",
                          description="TRADFRI ON/OFF switch",
                          actions=["on", "off", "brightness_move_up", "brightness_move_down",
                                   "brightness_stop"]),
    # Roller shutters
    "ts130f": dict(kind="cover", vendor="Tuya", model="TS130F",
                   description="Curtain/blind switch", travel_s=18),
    "legrand_shutter": dict(kind="cover", vendor="Legrand", model="067776",
                            description="Netatmo wired shutter switch", travel_s=24,
                            # No motion field in its Z2M definition: Homex falls
                            # back on the cover state (opening / closing).
                            motion_exposes=False),
    "garage_opener": dict(kind="cover", vendor="Tuya", model="TS0601_garage_door_opener",
                          description="Garage door opener", travel_s=15, device_class="garage",
                          motion_exposes=False),
    # Radiator valves
    "trvzb": dict(kind="trv", vendor="SONOFF", model="TRVZB",
                  description="Zigbee thermostatic radiator valve"),
    "danfoss_ally": dict(kind="trv", vendor="Danfoss", model="014G2461",
                         description="Ally thermostat"),
    "aqara_trv": dict(kind="trv", vendor="Aqara", model="SRTS-A01",
                      description="Smart radiator thermostat E1"),
    # Sensors
    "aqara_th": dict(kind="climate_sensor", vendor="Aqara", model="WSDCGQ11LM",
                     description="Temperature, humidity and pressure sensor",
                     fields=["temperature", "humidity", "pressure"]),
    "snzb02d": dict(kind="climate_sensor", vendor="SONOFF", model="SNZB-02D",
                    description="Temperature and humidity sensor with screen",
                    fields=["temperature", "humidity"]),
    "vindstyrka": dict(kind="climate_sensor", vendor="IKEA", model="E2112",
                       description="VINDSTYRKA air quality and humidity sensor",
                       fields=["temperature", "humidity", "pm25", "voc_index"]),
    "co2_sensor": dict(kind="climate_sensor", vendor="Tuya", model="TS0601_air_quality_sensor",
                       description="Air quality sensor",
                       fields=["temperature", "humidity", "co2", "pm25", "pm10", "voc"]),
    "aqara_motion": dict(kind="motion", vendor="Aqara", model="RTCGQ11LM",
                         description="Motion sensor"),
    "hue_motion": dict(kind="motion", vendor="Philips", model="9290012607",
                       description="Hue motion sensor"),
    "aqara_contact": dict(kind="contact", vendor="Aqara", model="MCCGQ11LM",
                          description="Door and window sensor"),
    "probe": dict(kind="climate_sensor", vendor="Tuya", model="TS0201",
                  description="Temperature probe", fields=["temperature"]),
    # Plugs and relays
    "tradfri_outlet": dict(kind="plug", vendor="IKEA", model="E1603/E1702/E1708",
                           description="TRADFRI control outlet", power=False),
    "nous_plug": dict(kind="plug", vendor="Tuya", model="TS011F_plug_1",
                      description="Smart plug (with power monitoring)", power=True),
    "zbminir2": dict(kind="relay", vendor="SONOFF", model="ZBMINIR2",
                     description="Zigbee smart switch (dry contact)"),
}

# Devices per area: (friendly name, model key, initial state overrides)
DEVICES = {
    "Entrance Hall": [
        ("Entrance Ceiling Light", "hue_e27_white", {}),
        ("Entrance Wall Light", "tradfri_e14", {}),
        ("Entrance Switch", "aqara_double", {}),
        ("Entrance Motion", "hue_motion", {}),
        ("Front Door", "aqara_contact", {}),
        ("Entrance Radiator", "trvzb", {"local_temperature": 18.6}),
        ("Entrance Climate", "snzb02d", {"temperature": 18.8, "humidity": 51}),
    ],
    "Living Room": [
        ("Living Room Ceiling Spot 1", "hue_gu10", {"state": "ON", "brightness": 200}),
        ("Living Room Ceiling Spot 2", "hue_gu10", {"state": "ON", "brightness": 200}),
        ("Living Room Ceiling Spot 3", "hue_gu10", {"state": "ON", "brightness": 200}),
        ("Living Room Ceiling Spot 4", "hue_gu10", {"state": "ON", "brightness": 200}),
        ("Living Room Floor Lamp", "tradfri_e27_ws", {"state": "ON", "brightness": 140}),
        ("Living Room Reading Lamp", "tradfri_e14", {}),
        ("TV Backlight", "hue_lightstrip", {}),
        ("Living Room Switch", "aqara_double", {}),
        ("Living Room Remote", "styrbar", {}),
        ("Living Room Shutter Left", "ts130f", {"position": 100}),
        ("Living Room Shutter Right", "ts130f", {"position": 100}),
        ("Living Room Bay Shutter", "legrand_shutter", {"position": 60}),
        ("Living Room Radiator Window", "danfoss_ally", {"local_temperature": 20.4}),
        ("Living Room Radiator Wall", "danfoss_ally", {"local_temperature": 20.6}),
        ("Living Room Air Quality", "co2_sensor",
         {"temperature": 20.7, "humidity": 47, "co2": 780, "pm25": 9, "pm10": 16, "voc": 120}),
        ("Living Room Motion", "aqara_motion", {}),
        ("TV Plug", "nous_plug", {"state": "ON", "power": 96}),
    ],
    "Dining Room": [
        ("Dining Table Pendant 1", "tradfri_e27_ws", {}),
        ("Dining Table Pendant 2", "tradfri_e27_ws", {}),
        ("Dining Table Pendant 3", "tradfri_e27_ws", {}),
        ("Dining Room Sideboard Lamp", "tradfri_e14", {}),
        ("Dining Room Switch", "hue_dimmer", {}),
        ("Dining Room Shutter", "ts130f", {"position": 100}),
        ("Dining Room Radiator", "trvzb", {"local_temperature": 19.8}),
        ("Dining Room Climate", "aqara_th", {"temperature": 19.9, "humidity": 50, "pressure": 1013}),
    ],
    "Kitchen": [
        ("Kitchen Ceiling Light", "hue_e27_white", {"state": "ON", "brightness": 254}),
        ("Kitchen Under Cabinet Strip", "hue_lightstrip", {}),
        ("Kitchen Island Pendant 1", "hue_gu10", {}),
        ("Kitchen Island Pendant 2", "hue_gu10", {}),
        ("Kitchen Switch", "aqara_double", {}),
        ("Kitchen Shutter", "ts130f", {"position": 100}),
        ("Kitchen Radiator", "aqara_trv", {"local_temperature": 20.9}),
        ("Kitchen Air Quality", "vindstyrka", {"temperature": 21.2, "humidity": 58, "pm25": 18, "voc_index": 140}),
        ("Kitchen Motion", "aqara_motion", {}),
        ("Coffee Machine Plug", "nous_plug", {"state": "OFF", "power": 0}),
    ],
    "Office": [
        ("Office Ceiling Light", "hue_e27_white", {}),
        ("Office Desk Lamp", "tradfri_e14", {"state": "ON", "brightness": 180}),
        ("Office Shelf Strip", "hue_lightstrip", {}),
        ("Office Switch", "aqara_single", {}),
        ("Office Shutter", "legrand_shutter", {"position": 40}),
        ("Office Radiator", "trvzb", {"local_temperature": 19.4}),
        ("Office Air Quality", "co2_sensor",
         {"temperature": 19.6, "humidity": 44, "co2": 1180, "pm25": 6, "pm10": 11, "voc": 210}),
        ("Office Window", "aqara_contact", {}),
        ("Desk Plug", "nous_plug", {"state": "ON", "power": 142}),
    ],
    "Guest Toilet": [
        ("Guest Toilet Light", "hue_e27_white", {}),
        ("Guest Toilet Switch", "aqara_single", {}),
        ("Guest Toilet Motion", "hue_motion", {}),
    ],
    "Landing": [
        ("Landing Ceiling Light", "hue_e27_white", {}),
        ("Stairs Light", "tradfri_e14", {}),
        ("Landing Switch", "aqara_double", {}),
        ("Landing Motion", "hue_motion", {}),
    ],
    "Master Bedroom": [
        ("Master Bedroom Ceiling Light", "hue_gu10", {}),
        ("Bedside Lamp Left", "tradfri_e14", {}),
        ("Bedside Lamp Right", "tradfri_e14", {}),
        ("Wardrobe Strip", "hue_lightstrip", {}),
        ("Master Bedroom Switch", "aqara_double", {}),
        ("Bedside Remote Left", "tradfri_onoff", {}),
        ("Bedside Remote Right", "tradfri_onoff", {}),
        ("Master Bedroom Shutter", "legrand_shutter", {"position": 0}),
        ("Master Bedroom Balcony Shutter", "legrand_shutter", {"position": 0}),
        ("Master Bedroom Radiator", "danfoss_ally", {"local_temperature": 18.2}),
        ("Master Bedroom Air Quality", "co2_sensor",
         {"temperature": 18.4, "humidity": 52, "co2": 950, "pm25": 4, "pm10": 8, "voc": 90}),
    ],
    "Master Bathroom": [
        ("Master Bathroom Ceiling Spots", "hue_gu10", {}),
        ("Master Bathroom Mirror Light", "hue_e27_white", {}),
        ("Master Bathroom Switch", "aqara_double", {}),
        ("Master Bathroom Towel Radiator", "aqara_trv", {"local_temperature": 21.5}),
        ("Master Bathroom Climate", "snzb02d", {"temperature": 21.8, "humidity": 68}),
    ],
    "Kids Bedroom": [
        ("Kids Bedroom Ceiling Light", "tradfri_e27_ws", {}),
        ("Kids Night Light", "hue_gu10", {}),
        ("Kids Bedroom Switch", "aqara_single", {}),
        ("Kids Bedroom Remote", "styrbar", {}),
        ("Kids Bedroom Shutter", "ts130f", {"position": 0}),
        ("Kids Bedroom Radiator", "trvzb", {"local_temperature": 19.1}),
        ("Kids Bedroom Air Quality", "vindstyrka", {"temperature": 19.3, "humidity": 49, "pm25": 5, "voc_index": 100}),
    ],
    "Guest Bedroom": [
        ("Guest Bedroom Ceiling Light", "hue_e27_white", {}),
        ("Guest Bedside Lamp", "tradfri_e14", {}),
        ("Guest Bedroom Switch", "tradfri_onoff", {}),
        ("Guest Bedroom Shutter", "ts130f", {"position": 0}),
        ("Guest Bedroom Radiator", "trvzb", {"local_temperature": 16.9, "occupied_heating_setpoint": 16}),
        ("Guest Bedroom Climate", "aqara_th", {"temperature": 17.0, "humidity": 55, "pressure": 1013}),
    ],
    "Bathroom": [
        ("Bathroom Ceiling Light", "hue_gu10", {}),
        ("Bathroom Mirror Light", "tradfri_e14", {}),
        ("Bathroom Switch", "aqara_double", {}),
        ("Bathroom Radiator", "aqara_trv", {"local_temperature": 21.0}),
        ("Bathroom Climate", "snzb02d", {"temperature": 21.1, "humidity": 64}),
    ],
    "Playroom": [
        ("Playroom Ceiling Light", "tradfri_e27_ws", {}),
        ("Playroom Fairy Lights", "tradfri_outlet", {}),
        ("Playroom Switch", "aqara_double", {}),
        ("Playroom Skylight Shutter", "ts130f", {"position": 50}),
        ("Playroom Radiator", "trvzb", {"local_temperature": 18.0}),
        ("Playroom Climate", "aqara_th", {"temperature": 18.1, "humidity": 53, "pressure": 1012}),
    ],
    "Attic Storage": [
        ("Attic Storage Light", "hue_e27_white", {}),
        ("Attic Storage Motion", "aqara_motion", {}),
    ],
    "Garage": [
        ("Garage Ceiling Light", "hue_e27_white", {}),
        ("Garage Workbench Light", "tradfri_e27_ws", {}),
        ("Garage Switch", "aqara_single", {}),
        ("Garage Door", "aqara_contact", {}),
        ("Garage Door Opener", "garage_opener", {"position": 0}),
        ("Garage Motion", "aqara_motion", {}),
    ],
    "Laundry Room": [
        ("Laundry Room Light", "hue_e27_white", {}),
        ("Laundry Room Switch", "aqara_single", {}),
        ("Washing Machine Plug", "nous_plug", {"state": "ON", "power": 3}),
        ("Dryer Plug", "nous_plug", {"state": "OFF", "power": 0}),
        ("Laundry Room Climate", "snzb02d", {"temperature": 16.5, "humidity": 70}),
    ],
    "Boiler Room": [
        ("Boiler Room Light", "hue_e27_white", {}),
        ("Boiler Dry Contact", "zbminir2", {"state": "OFF"}),
        ("Circulator Pump", "zbminir2", {"state": "OFF"}),
        ("Buffer Tank Top", "probe", {"temperature": 58.0}),
        ("Buffer Tank Bottom", "probe", {"temperature": 41.0}),
        ("Heating Flow", "probe", {"temperature": 45.0}),
        ("Heating Return", "probe", {"temperature": 37.0}),
    ],
    "Garden": [
        ("Garden Spot 1", "innr_outdoor", {}),
        ("Garden Spot 2", "innr_outdoor", {}),
        ("Garden Spot 3", "innr_outdoor", {}),
        ("Garden Gate", "aqara_contact", {}),
        ("Garden Motion", "hue_motion", {}),
        ("Outdoor Climate", "aqara_th", {"temperature": 9.4, "humidity": 82, "pressure": 1012}),
    ],
    "Terrace": [
        ("Terrace Wall Light", "innr_outdoor", {}),
        ("Terrace String Lights", "tradfri_outlet", {}),
        ("Terrace Switch", "aqara_single", {}),
        ("Terrace Shutter", "legrand_shutter", {"position": 100}),
    ],
}

# Climate control: every heated room has two radiator valves (a second one where
# it has one, two where it has none), for the Heating module and the 3D view.
_TRV_MODELS = ["trvzb", "danfoss_ally", "aqara_trv"]
_UNHEATED = ("Garage", "Boiler Room")
for _i, (_area, _devices) in enumerate(DEVICES.items()):
    if AREAS[_area][0] is None or _area in _UNHEATED:
        continue
    _trvs = [d for d in _devices if MODELS[d[1]]["kind"] == "trv"]
    for _n in range(len(_trvs), 2):
        _name = f"{_area} Radiator {_n + 1}" if _trvs or _n else f"{_area} Radiator 1"
        _devices.append((_name, _TRV_MODELS[(_i + _n) % 3], {"local_temperature": round(18.6 + (_i % 5) * 0.4, 1)}))
