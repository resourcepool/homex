"""ZCL cluster/attribute name registry.

Profiles may reference clusters and attributes either by name or by
numeric id. Only the clusters commonly needed by emulated devices are listed;
extend as new device profiles require.
"""

from __future__ import annotations

# cluster name -> (id, {attribute name: (attr id, type)})
CLUSTERS: dict[str, tuple[int, dict[str, tuple[int, str]]]] = {
    "genBasic": (
        0x0000,
        {
            "zclVersion": (0x0000, "uint8"),
            "appVersion": (0x0001, "uint8"),
            "stackVersion": (0x0002, "uint8"),
            "hwVersion": (0x0003, "uint8"),
            "manufacturerName": (0x0004, "charstr"),
            "modelId": (0x0005, "charstr"),
            "dateCode": (0x0006, "charstr"),
            "powerSource": (0x0007, "enum8"),
            "swBuildId": (0x4000, "charstr"),
        },
    ),
    "genPowerCfg": (
        0x0001,
        {
            "batteryVoltage": (0x0020, "uint8"),
            "batteryPercentageRemaining": (0x0021, "uint8"),
            "batterySize": (0x0031, "enum8"),
            "batteryQuantity": (0x0033, "uint8"),
            "batteryAlarmState": (0x003E, "bitmap32"),
        },
    ),
    "genIdentify": (0x0003, {"identifyTime": (0x0000, "uint16")}),
    "genGroups": (0x0004, {"nameSupport": (0x0000, "bitmap8")}),
    "genScenes": (
        0x0005,
        {
            "count": (0x0000, "uint8"),
            "currentScene": (0x0001, "uint8"),
            "currentGroup": (0x0002, "uint16"),
            "sceneValid": (0x0003, "bool"),
            "nameSupport": (0x0004, "bitmap8"),
        },
    ),
    "genOnOff": (
        0x0006,
        {
            "onOff": (0x0000, "bool"),
            "globalSceneCtrl": (0x4000, "bool"),
            "onTime": (0x4001, "uint16"),
            "offWaitTime": (0x4002, "uint16"),
            "startUpOnOff": (0x4003, "enum8"),
        },
    ),
    "genLevelCtrl": (
        0x0008,
        {
            "currentLevel": (0x0000, "uint8"),
            "options": (0x000F, "bitmap8"),
            "onOffTransitionTime": (0x0010, "uint16"),
            "onLevel": (0x0011, "uint8"),
            "startUpCurrentLevel": (0x4000, "uint8"),
        },
    ),
    "genPollCtrl": (
        0x0020,
        {
            "checkinInterval": (0x0000, "uint32"),
            "longPollInterval": (0x0001, "uint32"),
            "shortPollInterval": (0x0002, "uint16"),
            "fastPollTimeout": (0x0003, "uint16"),
        },
    ),
    "genOnOffSwitchCfg": (0x0007, {"switchType": (0x0000, "enum8"), "switchActions": (0x0010, "enum8")}),
    "genTime": (0x000A, {"time": (0x0000, "uint32"), "timeStatus": (0x0001, "bitmap8")}),
    "haDiagnostic": (0x0B05, {"lastMessageLqi": (0x011C, "uint8"), "lastMessageRssi": (0x011D, "int8")}),
    "hvacThermostat": (
        0x0201,
        {
            "localTemp": (0x0000, "int16"),
            "absMinHeatSetpointLimit": (0x0003, "int16"),
            "absMaxHeatSetpointLimit": (0x0004, "int16"),
            "pIHeatingDemand": (0x0008, "uint8"),
            "localTemperatureCalibration": (0x0010, "int8"),
            "occupiedHeatingSetpoint": (0x0012, "int16"),
            "unoccupiedHeatingSetpoint": (0x0014, "int16"),
            "minHeatSetpointLimit": (0x0015, "int16"),
            "maxHeatSetpointLimit": (0x0016, "int16"),
            "ctrlSeqeOfOper": (0x001B, "enum8"),
            "systemMode": (0x001C, "enum8"),
            "runningMode": (0x001E, "enum8"),
            "runningState": (0x0029, "bitmap16"),
        },
    ),
    "msFlowMeasurement": (0x0404, {"measuredValue": (0x0000, "uint16")}),
    "genOta": (0x0019, {}),
    "lightingColorCtrl": (
        0x0300,
        {
            "currentHue": (0x0000, "uint8"),
            "currentSaturation": (0x0001, "uint8"),
            "remainingTime": (0x0002, "uint16"),
            "currentX": (0x0003, "uint16"),
            "currentY": (0x0004, "uint16"),
            "colorTemperature": (0x0007, "uint16"),
            "colorMode": (0x0008, "enum8"),
            "options": (0x000F, "bitmap8"),
            "enhancedCurrentHue": (0x4000, "uint16"),
            "enhancedColorMode": (0x4001, "enum8"),
            "colorCapabilities": (0x400A, "bitmap16"),
            "colorTempPhysicalMin": (0x400B, "uint16"),
            "colorTempPhysicalMax": (0x400C, "uint16"),
            "startUpColorTemperature": (0x4010, "uint16"),
        },
    ),
    "touchlink": (0x1000, {}),
    "msIlluminanceMeasurement": (0x0400, {"measuredValue": (0x0000, "uint16")}),
    "msTemperatureMeasurement": (0x0402, {"measuredValue": (0x0000, "int16")}),
    "msRelativeHumidity": (0x0405, {"measuredValue": (0x0000, "uint16")}),
    "msOccupancySensing": (
        0x0406,
        {
            "occupancy": (0x0000, "bitmap8"),
            "occupancySensorType": (0x0001, "enum8"),
            "ultrasonicOToUDelay": (0x0020, "uint16"),
            "ultrasonicUToODelay": (0x0021, "uint16"),
            "ultrasonicUToOThreshold": (0x0022, "uint8"),
        },
    ),
    "ssIasZone": (
        0x0500,
        {
            "zoneState": (0x0000, "enum8"),
            "zoneType": (0x0001, "enum16"),
            "zoneStatus": (0x0002, "bitmap16"),
            "iasCieAddr": (0x0010, "ieee"),
            "zoneId": (0x0011, "uint8"),
        },
    ),
    "greenPower": (0x0021, {}),
    "seMetering": (
        0x0702,
        {
            "currentSummDelivered": (0x0000, "uint48"),
            "status": (0x0200, "bitmap8"),
            "unitOfMeasure": (0x0300, "enum8"),
            "multiplier": (0x0301, "uint24"),
            "divisor": (0x0302, "uint24"),
            "summaFormatting": (0x0303, "bitmap8"),
            "meteringDeviceType": (0x0306, "bitmap8"),
        },
    ),
    "haElectricalMeasurement": (
        0x0B04,
        {
            "measurementType": (0x0000, "bitmap32"),
            "rmsVoltage": (0x0505, "uint16"),
            "rmsCurrent": (0x0508, "uint16"),
            "activePower": (0x050B, "int16"),
            "acVoltageMultiplier": (0x0600, "uint16"),
            "acVoltageDivisor": (0x0601, "uint16"),
            "acCurrentMultiplier": (0x0602, "uint16"),
            "acCurrentDivisor": (0x0603, "uint16"),
            "acPowerMultiplier": (0x0604, "uint16"),
            "acPowerDivisor": (0x0605, "uint16"),
        },
    ),
    "manuSpecificPhilips": (0xFC00, {"config": (0x0031, "bitmap16")}),
    "manuSpecificIkeaUnknown": (0xFC7C, {}),
    "manuSpecificPhilips2": (0xFC03, {"state": (0x0002, "octstr")}),
    "manuSpecificPhilips3": (0xFC02, {}),
    "manuSpecificAmazonWWAH": (0xFC57, {}),
    # covers / Tuya MCU / Aqara (covers & sensors wishlist)
    "closuresWindowCovering": (
        0x0102,
        {
            "windowCoveringType": (0x0000, "enum8"),
            "configStatus": (0x0007, "bitmap8"),
            "currentPositionLiftPercentage": (0x0008, "uint8"),
            "operationalStatus": (0x000A, "bitmap8"),
            "windowCoveringMode": (0x0017, "bitmap8"),
            "tuyaMovingState": (0xF000, "enum8"),
            "tuyaCalibration": (0xF001, "enum8"),
            "tuyaMotorReversal": (0xF002, "enum8"),
            "moesCalibrationTime": (0xF003, "uint16"),
        },
    ),
    "manuSpecificTuya": (0xEF00, {}),
    "manuSpecificLumi": (
        0xFCC0,
        {
            "buzzerManualMute": (0x0126, "uint8"),
            "selfTest": (0x0127, "bool"),
            "smoke": (0x013A, "uint8"),
            "smokeDensity": (0x013B, "uint8"),
            "heartbeatIndicator": (0x013C, "uint8"),
            "buzzerManualAlarm": (0x013D, "uint8"),
            "buzzer": (0x013E, "uint32"),
            "linkageAlarm": (0x014B, "uint8"),
            "linkageAlarmState": (0x014C, "uint8"),
        },
    ),
    "customClusterEwelink": (
        0xFC11,
        {
            "childLock": (0x0000, "bool"),
            "externalTriggerMode": (0x0016, "uint8"),
            "tamper": (0x2000, "uint8"),
            "illumination": (0x2001, "uint8"),
            "realTimeIrrigationDuration": (0x5006, "uint32"),
            "realTimeIrrigationVolume": (0x5007, "uint32"),
            "valveAbnormalState": (0x500C, "uint8"),
            "rainDelayEndDatetime": (0x5014, "uint32"),
            "hourIrrigationVolume": (0x501B, "uint32"),
            "hourIrrigationDuration": (0x501C, "uint32"),
            "manualDefaultSettings": (0x501D, "array"),
            "seasonalWateringAdjustment": (0x501E, "array"),
            "irrigationScheduleStatus": (0x501F, "array"),
            "valveAlarmSettings": (0x5020, "array"),
            "unitOfWaterFlow": (0x5021, "uint8"),
            "openWindow": (0x6000, "bool"),
            "frostProtectionTemperature": (0x6002, "int16"),
            "idleSteps": (0x6003, "uint16"),
            "closingSteps": (0x6004, "uint16"),
            "valveOpeningLimitVoltage": (0x6005, "uint16"),
            "valveClosingLimitVoltage": (0x6006, "uint16"),
            "valveMotorRunningVoltage": (0x6007, "uint16"),
            "valveOpeningDegree": (0x600B, "uint8"),
            "valveClosingDegree": (0x600C, "uint8"),
            "externalTemperatureInput": (0x600D, "int16"),
            "temperatureSensorSelect": (0x600E, "uint8"),
            "tempAccuracy": (0x6011, "int16"),
            "temporaryMode": (0x6014, "uint8"),
            "temporaryModeTime": (0x6015, "uint32"),
            "temporaryModeTemp": (0x6016, "int16"),
            "smartTempControl": (0x6017, "bitmap8"),
        },
    ),
    "manuSpecificIkeaSmartPlug": (0xFC85, {"childLock": (0x0000, "bool"), "ledEnable": (0x0001, "bool")}),
}

CLUSTER_NAME_BY_ID = {cid: name for name, (cid, _) in CLUSTERS.items()}


def cluster_id(ref: str | int) -> int:
    if isinstance(ref, int):
        return ref
    if ref in CLUSTERS:
        return CLUSTERS[ref][0]
    return int(ref, 0)


def cluster_name(cid: int) -> str:
    return CLUSTER_NAME_BY_ID.get(cid, f"0x{cid:04x}")


def attribute(cluster: str | int, ref: str | int, type_hint: str | None = None) -> tuple[int, str]:
    """Resolve attribute reference to (id, type)."""
    cid = cluster_id(cluster)
    attrs = CLUSTERS.get(cluster_name(cid), (cid, {}))[1]
    if isinstance(ref, str) and ref in attrs:
        aid, atype = attrs[ref]
        return aid, type_hint or atype
    aid = ref if isinstance(ref, int) else int(ref, 0)
    for _name, (known_id, atype) in attrs.items():
        if known_id == aid:
            return aid, type_hint or atype
    if type_hint is None:
        raise ValueError(f"attribute {ref!r} of cluster {cluster!r} needs an explicit type")
    return aid, type_hint
