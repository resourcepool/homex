import type { HomeAssistant } from "../types";

/** The Home Assistant area of an entity: its own, else its device's. */
export function entityArea(hass: HomeAssistant, entityId: string): string | undefined {
  const ent = hass.entities?.[entityId];
  return ent?.area_id || (ent?.device_id && hass.devices?.[ent.device_id]?.area_id) || undefined;
}

/** The Home Assistant area of a device. */
export function deviceArea(hass: HomeAssistant, deviceId: string): string | undefined {
  return hass.devices?.[deviceId]?.area_id || undefined;
}

/** Split items into those of the given areas (first) and the others. */
export function splitByArea<T>(
  items: T[],
  areaOf: (item: T) => string | undefined,
  areaIds: (string | null | undefined)[]
): { inArea: T[]; others: T[] } {
  const areas = new Set(areaIds.filter(Boolean));
  const inArea = areas.size ? items.filter((i) => areas.has(areaOf(i) ?? "")) : [];
  return { inArea, others: items.filter((i) => !inArea.includes(i)) };
}

/** Readable name of areas ("Chambre", "Salon, Cuisine"). */
export function areaNames(hass: HomeAssistant, areaIds: (string | null | undefined)[]): string {
  return [...new Set(areaIds.filter(Boolean) as string[])]
    .map((id) => hass.areas?.[id]?.name ?? id)
    .join(", ");
}
