import {
  mdiArrowDownBox,
  mdiArrowUpBox,
  mdiRollerShade,
  mdiWindowShutter,
  mdiWindowShutterAlert,
  mdiWindowShutterOpen,
} from "@mdi/js";
import type { HomeAssistant, Room, ShutterGroup } from "../types";

export type ShutterState =
  | "open"
  | "closed"
  | "partial"
  | "opening"
  | "closing"
  | "unavailable";

export interface ShutterSummary {
  state: ShutterState;
  /** Average position (0 = closed, 100 = open), null when unknown. */
  position: number | null;
  icon: string;
  label: string;
}

const ICONS: Record<ShutterState, string> = {
  open: mdiWindowShutterOpen,
  closed: mdiWindowShutter,
  partial: mdiRollerShade,
  opening: mdiArrowUpBox,
  closing: mdiArrowDownBox,
  unavailable: mdiWindowShutterAlert,
};

const LABELS: Record<ShutterState, string> = {
  open: "Ouvert",
  closed: "Fermé",
  partial: "Entrouvert",
  opening: "Ouverture…",
  closing: "Fermeture…",
  unavailable: "Indisponible",
};

/** Position of one cover entity (0..100), from its attribute or its state. */
export function coverPosition(hass: HomeAssistant, entityId: string): number | null {
  const st = hass.states[entityId];
  if (!st) return null;
  const pos = st.attributes?.current_position;
  if (typeof pos === "number") return pos;
  if (st.state === "open") return 100;
  if (st.state === "closed") return 0;
  return null;
}

/** Aggregate state of a set of covers: moving wins, then open / closed /
 * partial from their positions. */
export function shutterSummary(hass: HomeAssistant, covers: string[]): ShutterSummary {
  const live = covers
    .map((id) => hass.states[id])
    .filter((st) => st && st.state !== "unavailable" && st.state !== "unknown");
  const positions = live
    .map((st) => coverPosition(hass, st.entity_id))
    .filter((p): p is number => p !== null);
  const position = positions.length
    ? Math.round(positions.reduce((a, b) => a + b, 0) / positions.length)
    : null;
  const state: ShutterState = !live.length
    ? "unavailable"
    : live.some((st) => st.state === "opening")
      ? "opening"
      : live.some((st) => st.state === "closing")
        ? "closing"
        : positions.every((p) => p === 0)
          ? "closed"
          : positions.every((p) => p === 100)
            ? "open"
            : "partial";
  return { state, position, icon: ICONS[state], label: LABELS[state] };
}

/** The shutter group the room's quick button drives: the default group
 * ("Général"), or the first group with covers when the default one is empty. */
export function defaultShutterGroup(room: Room): ShutterGroup | undefined {
  const groups = (room.shutter_groups ?? []).filter((g) => g.devices?.length);
  return groups.find((g) => !g.removable) ?? groups[0];
}
