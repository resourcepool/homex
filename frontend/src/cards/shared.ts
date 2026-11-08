/** Shared helpers of the Homex Lovelace cards. */
import { html, svg } from "lit";
import type { HomeAssistant, Room } from "../types";
import { t } from "../lib/i18n";

/** The Homex rooms (radiators, shutters, scenes, metrics), fetched once per
 * page load and shared by every card. */
let roomsPromise: Promise<Room[]> | undefined;
export function homexRooms(hass: HomeAssistant): Promise<Room[]> {
  roomsPromise ??= hass.connection
    .sendMessagePromise({ type: "homex/rooms" })
    .then((r: { rooms: Room[] }) => r.rooms)
    .catch((err: unknown) => {
      roomsPromise = undefined; // retry on the next call
      throw err;
    });
  return roomsPromise!;
}

export const fmt = (hass: HomeAssistant, value: number, digits = 1, min = 0) =>
  value.toLocaleString(hass.locale?.language || undefined, {
    minimumFractionDigits: min,
    maximumFractionDigits: digits,
  });

export const icon = (path: string) =>
  html`<svg viewBox="0 0 24 24" aria-hidden="true">${svg`<path d=${path}></path>`}</svg>`;

/** Air quality levels: [good up to, fair up to] — above is poor. CO₂ in ppm;
 * PM in µg/m³ (WHO 24 h guidelines: PM2.5 15, PM10 45). */
export const AIR_LEVELS = {
  co2: [800, 1200],
  pm25: [15, 35],
  pm10: [45, 100],
} as const;
export type AirKey = keyof typeof AIR_LEVELS;
/** The name of an air quality level (0 good, 1 fair, 2 poor). */
export const levelName = (level: number) =>
  t(`cardRoomTile.level_${["good", "fair", "poor"][level]}`);

/** 0 = good, 1 = fair, 2 = poor, and a severity ratio to compare metrics. */
export const airLevel = (key: AirKey, value: number) => {
  const [good, fair] = AIR_LEVELS[key];
  return { level: value <= good ? 0 : value <= fair ? 1 : 2, ratio: value / good };
};

export interface Metric {
  value: number;
  unit?: string;
}

/** A room's Homex metric (sensor.homex_<room>_<key>), when it has a value. */
export function roomMetric(hass: HomeAssistant, room: string, key: string): Metric | undefined {
  const st = hass.states[`sensor.homex_${room}_${key}`];
  const value = st ? parseFloat(st.state) : NaN;
  return Number.isNaN(value)
    ? undefined
    : { value, unit: st!.attributes.unit_of_measurement as string | undefined };
}

/** The room's radiator valves (climate entities of its radiator devices). */
export function roomValves(hass: HomeAssistant, room?: Room): string[] {
  const devices = new Set((room?.heating?.radiators ?? []).map((r) => r.device_id));
  if (!devices.size) return [];
  return Object.values(hass.entities ?? {})
    .filter((e: any) => e.entity_id.startsWith("climate.") && devices.has(e.device_id))
    .map((e: any) => e.entity_id);
}

export function roomCovers(room?: Room): string[] {
  return [...new Set((room?.shutter_groups ?? []).flatMap((g) => g.devices))];
}

/** A cover's opening, 0 (closed) .. 100 (open). */
export function coverPosition(st: any): number {
  const p = st?.attributes.current_position;
  if (typeof p === "number") return p;
  return st?.state === "closed" ? 0 : 100;
}

export const friendly = (hass: HomeAssistant, entityId: string) =>
  (hass.states[entityId]?.attributes.friendly_name as string | undefined) ?? entityId;
