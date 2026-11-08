import type { HomeAssistant } from "../types";

/**
 * Home Assistant lights by area (entity area, else its device's area),
 * sorted. Leaves out Homex's own lights and hidden / config entities.
 */
export function lightsByArea(hass: HomeAssistant): Map<string, string[]> {
  const devices = (hass.devices ?? {}) as Record<string, any>;
  const out = new Map<string, string[]>();
  for (const e of Object.values((hass.entities ?? {}) as Record<string, any>)) {
    if (!e.entity_id.startsWith("light.") || e.entity_id.startsWith("light.homex_")) continue;
    if (e.hidden || e.entity_category) continue;
    const area = e.area_id || (e.device_id && devices[e.device_id]?.area_id);
    if (!area) continue;
    (out.get(area) ?? out.set(area, []).get(area)!).push(e.entity_id);
  }
  for (const list of out.values()) list.sort();
  return out;
}

/** The lights Home Assistant places in this area. */
export function areaLights(hass: HomeAssistant, areaId: string): string[] {
  return lightsByArea(hass).get(areaId) ?? [];
}
