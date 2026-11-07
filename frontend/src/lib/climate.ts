import type { HomeAssistant, Room } from "../types";

/** A radiator device's climate entity (its main one: shortest id). */
export function radiatorClimate(hass: HomeAssistant, deviceId: string): string | undefined {
  return Object.values(hass.entities || {})
    .filter((e: any) => e.device_id === deviceId && e.entity_id.startsWith("climate."))
    .map((e: any) => e.entity_id as string)
    .sort((a, b) => a.length - b.length)[0];
}

/** A room heats as soon as one of its valves does. */
export function roomIsHeating(hass: HomeAssistant, room: Room): boolean {
  return (room.heating?.radiators ?? []).some((rad) => {
    const climate = radiatorClimate(hass, rad.device_id);
    return !!climate && hass.states[climate]?.attributes?.hvac_action === "heating";
  });
}

/** The room's heating zone and its effective mode, read live from the
 * zones' select.homex_heating_<zone> entities (the default zone holds every
 * room no other zone lists). A room whose own heating is off is Unheated,
 * whatever its zone's mode (`own` = true). */
export function roomZoneMode(
  hass: HomeAssistant,
  room: Room
): { zone: string; mode: string; own: boolean } | undefined {
  const selects = Object.values(hass.states || {}).filter((st: any) =>
    st.entity_id.startsWith("select.homex_heating_")
  ) as any[];
  const st =
    selects.find((s) => (s.attributes?.rooms ?? []).includes(room.room_id)) ??
    selects.find((s) => s.attributes?.zone_id === "default");
  if (!st || st.state === "unavailable" || st.state === "unknown") return undefined;
  const zone = String(st.attributes?.friendly_name ?? "").replace(/^Chauffage /, "");
  if (room.heating?.enabled === false) {
    return { zone, mode: st.attributes?.modes?.unheated ?? "Unheated", own: true };
  }
  return { zone, mode: st.state, own: false };
}
