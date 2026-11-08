"""Registry of server-side cluster implementations."""

from __future__ import annotations

from .zcl_lighting import ColorServer, LevelServer
from .zcl_sensors import SENSOR_SERVERS
from .zcl_servers import BASE_SERVERS, OPTION_KEYS, ClusterServer, Result

SERVERS: dict[int, type[ClusterServer]] = {s.cluster: s for s in (*BASE_SERVERS, LevelServer, ColorServer, *SENSOR_SERVERS)}

# lights: Level, Color and the Hue state cluster (0xFC03)
from .zcl_lighting import LIGHTING_SERVERS  # noqa: E402

SERVERS.update({s.cluster: s for s in LIGHTING_SERVERS})

# covers (0x0102) and the Tuya MCU datapoint cluster (0xEF00)
from .zcl_covering import COVERING_SERVERS  # noqa: E402
from .zcl_tuya import TUYA_SERVERS  # noqa: E402

SERVERS.update({s.cluster: s for s in (*COVERING_SERVERS, *TUYA_SERVERS)})

__all__ = ["OPTION_KEYS", "SERVERS", "ClusterServer", "Result"]
