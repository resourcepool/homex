"""Constants for the Homex integration."""

DOMAIN = "homex"

# Config / options keys
CONF_ROOM_NAME = "name"
CONF_ROOM_ID = "room_id"
CONF_AREA_ID = "area_id"  # optional link to a native HA area
CONF_DEVICES = "devices"
CONF_TRIGGERS = "triggers"

# Groups inside a room.
CONF_GROUPS = "groups"
CONF_GROUP_ID = "group_id"
CONF_GROUP_NAME = "group_name"

# Extra (user-added) scenes for a room, beyond the default turn_on/turn_off.
# Stored as a list of {"key": <slug>, "name": <label>}.
CONF_SCENES = "scenes"

# Room triggers. CONF_TRIGGERS holds the "toggle" (on/off) triggers; scene
# switching triggers and their strategy are separate.
CONF_SCENE_TRIGGERS = "scene_triggers"
CONF_SCENE_STRATEGY = "scene_strategy"
STRATEGY_RECALL_FIRST = "recall_first"
STRATEGY_RECALL_LAST = "recall_last"

# Triggers can also be devices (any state change of the device's entities).
CONF_TRIGGER_DEVICES = "trigger_devices"
CONF_SCENE_TRIGGER_DEVICES = "scene_trigger_devices"

# Name of the file holding the native, user-editable scenes.
SCENES_FILE = "scenes.yaml"

# hass.data[DOMAIN] key for the shared scenes.yaml write lock.
SCENES_LOCK = "_scenes_lock"

# Domains accepted for the room devices and for the triggers.
DEVICE_DOMAINS = ["light", "switch", "input_boolean"]
TRIGGER_DOMAINS = [
    "binary_sensor",
    "switch",
    "input_boolean",
    "person",
    "device_tracker",
    "sensor",
]

PLATFORMS = ["switch", "light"]
