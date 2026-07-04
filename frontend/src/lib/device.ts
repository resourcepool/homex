import type { HomeAssistant } from "../types";

/** A stable key identifying a device's model (manufacturer + model). */
export function deviceModelKey(hass: HomeAssistant, deviceId: string): string {
  const d = (hass.devices || {})[deviceId];
  if (!d) return "";
  return `${d.manufacturer || ""}|${d.model || d.model_id || ""}`;
}

/** Human label for a device's model. */
export function deviceModelLabel(hass: HomeAssistant, deviceId: string): string {
  const d = (hass.devices || {})[deviceId];
  if (!d) return "";
  return (
    [d.manufacturer, d.model || d.model_id].filter(Boolean).join(" ") ||
    "modèle inconnu"
  );
}
