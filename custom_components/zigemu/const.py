"""Constants for ZigEmu."""

DOMAIN = "zigemu"
CONF_PORT = "port"
CONF_HOST = "host"
DEFAULT_PORT = 6638
DEFAULT_HOST = "0.0.0.0"
STORAGE_KEY = "zigemu.state"
# ZigEmu was called ZigSim: its single-coordinator state is imported on first start
LEGACY_STORAGE_KEY = "zigsim.state"
STORAGE_VERSION = 1
STATIC_URL = "/zigemu_static"
API_PREFIX = "/api/zigemu"
