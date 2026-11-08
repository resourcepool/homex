#!/usr/bin/env bash
# Rebuild the Home Assistant dev instance from scratch: backs up the current
# runtime state, wipes it, starts HA + mosquitto + the Zigbee2MQTT simulator,
# then onboards HA and creates the floors / areas / MQTT / Homex entries.
set -euo pipefail
cd "$(dirname "$0")/.."
source dev/dev.env

backup="../homex-dev-backup-$(date +%Y%m%d-%H%M%S)"
docker compose down
if [ -d config/.storage ]; then
  mkdir -p "$backup"
  for f in config/.storage config/.cloud config/.cache config/deps config/tts config/blueprints \
           config/home-assistant_v2.db* config/home-assistant.log* config/scenes.yaml \
           config/.HA_VERSION config/.ha_run.lock config/.uuid; do
    [ -e "$f" ] && mv "$f" "$backup/"
  done
  echo "Previous dev state moved to $backup"
fi
: > config/scenes.yaml
# Drop the retained MQTT messages of the previous run (persistence is off:
# restarting the broker is enough).
docker compose up -d --build
until curl -s -o /dev/null -w '%{http_code}' localhost:8124/ | grep -qE '^(200|302)$'; do sleep 3; done

house=$(docker exec homex-z2m-sim python -c '
import json, house
print(json.dumps({"floors": house.FLOORS, "areas": house.AREAS}))')
docker exec -i -e HX_USER="$HX_USER" -e HX_PASSWORD="$HX_PASSWORD" -e HX_HOUSE="$house" \
  homex-ha python3 - < dev/setup_ha.py
# The simulator published its retained discovery before MQTT was set up: HA
# reads it on subscribe. Restart it anyway so states land after the areas.
docker restart homex-z2m-sim >/dev/null
echo "Ready: http://localhost:8124 (account in dev/dev.env)"
