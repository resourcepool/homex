// Thin client over the Homex WebSocket API.
import type { HomeAssistant, Room, SwitchLayout, TriggerSpec } from "./types";

export const fetchLayouts = async (
  hass: HomeAssistant
): Promise<SwitchLayout[]> =>
  (await hass.callWS({ type: "homex/layouts" })).layouts || [];

export const saveLayout = (hass: HomeAssistant, layout: SwitchLayout) =>
  hass.callWS({ type: "homex/layout/save", layout });

export const deleteLayout = (hass: HomeAssistant, layout_id: string) =>
  hass.callWS({ type: "homex/layout/delete", layout_id });

export const fetchGlobalSwitches = async (
  hass: HomeAssistant
): Promise<import("./types").GlobalSwitch[]> =>
  (await hass.callWS({ type: "homex/switches" })).switches || [];
export const saveGlobalSwitch = (
  hass: HomeAssistant,
  sw: import("./types").GlobalSwitch,
  create = false
) => hass.callWS({ type: "homex/switch/save", switch: sw, create });
export const deleteGlobalSwitch = (hass: HomeAssistant, switch_id: string) =>
  hass.callWS({ type: "homex/switch/remove", switch_id });

export const fetchPresets = async (
  hass: HomeAssistant
): Promise<import("./types").DevicePreset[]> =>
  (await hass.callWS({ type: "homex/presets" })).presets || [];
export const savePreset = (
  hass: HomeAssistant,
  preset: import("./types").DevicePreset
) => hass.callWS({ type: "homex/preset/save", preset });
export const deletePreset = (hass: HomeAssistant, preset_id: string) =>
  hass.callWS({ type: "homex/preset/delete", preset_id });

export const fetchSwitchModels = async (
  hass: HomeAssistant
): Promise<import("./types").SwitchModel[]> =>
  (await hass.callWS({ type: "homex/switch_models" })).models || [];

export const fetchSwitchDevices = async (
  hass: HomeAssistant
): Promise<import("./types").SwitchDevice[]> =>
  (await hass.callWS({ type: "homex/switch_devices" })).devices || [];

export const fetchRooms = async (hass: HomeAssistant): Promise<Room[]> =>
  (await hass.callWS({ type: "homex/rooms" })).rooms || [];

export interface RoomCreate {
  name: string;
  room_id: string;
  area_id?: string | null;
  modules?: string[];
  devices?: string[];
  scene_strategy?: "recall_first" | "recall_last";
}
export const createRoom = (hass: HomeAssistant, payload: RoomCreate) =>
  hass.callWS({ type: "homex/room/create", ...payload });

export const deleteRoom = (
  hass: HomeAssistant,
  entry_id: string,
  delete_scenes = true
) => hass.callWS({ type: "homex/room/delete", entry_id, delete_scenes });

export interface RoomUpdate {
  entry_id: string;
  name?: string;
  room_id?: string;
  area_id?: string | null;
  modules?: string[];
  devices?: string[];
  // Triggers: {entity_id} (state change) or {device_id} (device action).
  triggers?: TriggerSpec[];
  scene_triggers?: TriggerSpec[];
  dim_up_triggers?: TriggerSpec[];
  dim_down_triggers?: TriggerSpec[];
  scene_strategy?: "recall_first" | "recall_last";
}

export interface DeviceTrigger {
  label: string;
  trigger: TriggerSpec; // full HA device-trigger config, stored verbatim
}
export const fetchDeviceTriggers = async (
  hass: HomeAssistant,
  device_id: string
): Promise<DeviceTrigger[]> =>
  (await hass.callWS({ type: "homex/device_triggers", device_id })).triggers || [];
export const updateRoom = (hass: HomeAssistant, payload: RoomUpdate) =>
  hass.callWS({ type: "homex/room/update", ...payload });

export const syncLabels = (
  hass: HomeAssistant,
  entry_id: string
): Promise<{ ok: boolean; updated: number; scenes_renamed: number }> =>
  hass.callWS({ type: "homex/room/sync_labels", entry_id });

export const dimRoom = (hass: HomeAssistant, entry_id: string, delta: number) =>
  hass.callWS({ type: "homex/room/dim", entry_id, delta });

export interface GroupPayload {
  entry_id: string;
  group_id: string;
  name?: string;
  devices?: string[];
  triggers?: TriggerSpec[];
  dim?: boolean;
  dim_up_triggers?: TriggerSpec[];
  dim_down_triggers?: TriggerSpec[];
}
export const addGroup = (hass: HomeAssistant, payload: GroupPayload) =>
  hass.callWS({ type: "homex/group/add", ...payload });

export const updateGroup = (hass: HomeAssistant, payload: GroupPayload) =>
  hass.callWS({ type: "homex/group/update", ...payload });

export const deleteGroup = (hass: HomeAssistant, entry_id: string, group_id: string) =>
  hass.callWS({ type: "homex/group/delete", entry_id, group_id });

export interface SwitchPayload {
  entry_id: string;
  switch_id: string; // "id" is reserved by the WS protocol (message id)
  name?: string;
  buttons?: number;
  dim?: boolean;
  columns?: number;
  rows?: number;
  layout?: string[];
  rooms?: string[];
  triggers?: Record<string, TriggerSpec[]>;
}
export const addSwitch = (hass: HomeAssistant, payload: SwitchPayload) =>
  hass.callWS({ type: "homex/switch/add", ...payload });
export const updateSwitch = (hass: HomeAssistant, payload: SwitchPayload) =>
  hass.callWS({ type: "homex/switch/update", ...payload });
export const deleteSwitch = (
  hass: HomeAssistant,
  entry_id: string,
  switch_id: string
) => hass.callWS({ type: "homex/switch/delete", entry_id, switch_id });

export const addScene = (
  hass: HomeAssistant,
  entry_id: string,
  name: string,
  attach?: string,
  triggers?: TriggerSpec[]
) =>
  hass.callWS({
    type: "homex/scene/add",
    entry_id,
    name,
    ...(attach ? { attach } : {}),
    ...(triggers ? { triggers } : {}),
  });

export const deleteScene = (hass: HomeAssistant, entry_id: string, key: string) =>
  hass.callWS({ type: "homex/scene/delete", entry_id, key });

export const reorderScenes = (hass: HomeAssistant, entry_id: string, order: string[]) =>
  hass.callWS({ type: "homex/scene/reorder", entry_id, order });

export const sceneNext = (hass: HomeAssistant, entry_id: string) =>
  hass.callWS({ type: "homex/scene/next", entry_id });

export const renameScene = (
  hass: HomeAssistant,
  entry_id: string,
  key: string,
  name: string,
  triggers?: TriggerSpec[]
) =>
  hass.callWS({
    type: "homex/scene/rename",
    entry_id,
    key,
    name,
    ...(triggers ? { triggers } : {}),
  });

export const errorMessage = (err: any): string =>
  (err && (err.message || err.code)) || String(err);
