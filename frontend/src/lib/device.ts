import type { DevicePreset, GlobalSwitch, HomeAssistant } from "../types";

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

/** The presets applicable to a switch: those matching the device's model. */
export function presetsForSwitch(
  hass: HomeAssistant,
  presets: DevicePreset[],
  deviceId: string
): DevicePreset[] {
  const key = deviceModelKey(hass, deviceId);
  return key ? presets.filter((p) => p.model === key) : [];
}

/** The Device Preset a switch uses: its chosen `preset_id` when set, else the
 * first preset of the device's model (legacy switches without a chosen id). */
export function resolveSwitchPreset(
  hass: HomeAssistant,
  presets: DevicePreset[],
  sw: Pick<GlobalSwitch, "device_id" | "preset_id">
): DevicePreset | undefined {
  const ofModel = presetsForSwitch(hass, presets, sw.device_id);
  if (sw.preset_id) {
    const chosen = ofModel.find((p) => p.id === sw.preset_id);
    if (chosen) return chosen;
  }
  return ofModel[0];
}
