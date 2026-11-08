// Thin client over the Homex WebSocket API.
import type {
  HeatingApplyResult,
  HeatingDevicePreset,
  HeatingGroup,
  HeatingModel,
  HeatingPreset,
  HeatingSystem,
  TankStatus,
  HeatingZone,
  HomeAssistant,
  Room,
  RoomHeating,
  RoomMetrics,
  SwitchLayout,
  TriggerSpec,
} from "./types";

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

export const fetchShutterModels = async (
  hass: HomeAssistant
): Promise<import("./types").ShutterModel[]> =>
  (await hass.callWS({ type: "homex/shutter_models" })).models || [];
export const fetchZ2MState = (
  hass: HomeAssistant,
  device_id: string
): Promise<import("./types").Z2MState> =>
  hass.callWS({ type: "homex/z2m/state", device_id });
export const fetchShutterPresets = async (
  hass: HomeAssistant
): Promise<import("./types").ShutterPreset[]> =>
  (await hass.callWS({ type: "homex/shutter_presets" })).presets || [];
export const saveShutterPreset = (
  hass: HomeAssistant,
  preset: import("./types").ShutterPreset
) => hass.callWS({ type: "homex/shutter_preset/save", preset });
export const deleteShutterPreset = (hass: HomeAssistant, preset_id: string) =>
  hass.callWS({ type: "homex/shutter_preset/delete", preset_id });

export const fetchRooms = async (hass: HomeAssistant): Promise<Room[]> =>
  (await hass.callWS({ type: "homex/rooms" })).rooms || [];

export interface RoomCreate {
  name: string;
  room_id: string;
  area_id?: string | null;
  modules?: string[];
  heating?: RoomHeating;
  metrics?: RoomMetrics;
  devices?: string[];
  scene_strategy?: "recall_first" | "recall_last";
}
export const createRoom = (hass: HomeAssistant, payload: RoomCreate) =>
  hass.callWS({ type: "homex/room/create", ...payload });

/** Create several rooms at once (setup wizard import); Homex reloads once. */
export const importRooms = (
  hass: HomeAssistant,
  rooms: {
    name: string;
    room_id: string;
    area_id?: string | null;
    modules?: string[];
    devices?: string[];
  }[]
): Promise<{ created: string[] }> => hass.callWS({ type: "homex/rooms/import", rooms });

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
  heating?: RoomHeating;
  metrics?: RoomMetrics;
  devices?: string[];
  // Triggers: {entity_id} (state change) or {device_id} (device action).
  triggers?: TriggerSpec[];
  scene_triggers?: TriggerSpec[];
  dim_up_triggers?: TriggerSpec[];
  dim_down_triggers?: TriggerSpec[];
  scene_strategy?: "recall_first" | "recall_last";
}

export interface ShutterGroupPayload {
  entry_id: string;
  group_id?: string;
  name?: string;
  devices?: string[];
  toggle_triggers?: TriggerSpec[];
  open_triggers?: TriggerSpec[];
  close_triggers?: TriggerSpec[];
  stop_triggers?: TriggerSpec[];
}
export const addShutterGroup = (
  hass: HomeAssistant,
  entry_id: string,
  name: string
) => hass.callWS({ type: "homex/shutter_group/add", entry_id, name });
export const updateShutterGroup = (
  hass: HomeAssistant,
  payload: ShutterGroupPayload
) => hass.callWS({ type: "homex/shutter_group/update", ...payload });
export const deleteShutterGroup = (
  hass: HomeAssistant,
  entry_id: string,
  group_id: string
) => hass.callWS({ type: "homex/shutter_group/delete", entry_id, group_id });

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

export type ShutterService = "open_cover" | "close_cover" | "stop_cover";
export const roomShutter = (
  hass: HomeAssistant,
  entry_id: string,
  group_id: string,
  service: ShutterService
) => hass.callWS({ type: "homex/room/shutter", entry_id, group_id, service });

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

export const fetchHeating = async (
  hass: HomeAssistant
): Promise<{
  presets: HeatingPreset[];
  groups: HeatingGroup[];
  device_presets: HeatingDevicePreset[];
  zones: HeatingZone[];
  enabled: boolean; // global heating switch
  systems: HeatingSystem[];
}> =>
  hass.callWS({ type: "homex/heating" });
export const saveHeatingPreset = (
  hass: HomeAssistant,
  preset: Pick<HeatingPreset, "id" | "name">,
  create: boolean
) => hass.callWS({ type: "homex/heating/preset/save", preset, create });
export const deleteHeatingPreset = (hass: HomeAssistant, preset_id: string) =>
  hass.callWS({ type: "homex/heating/preset/delete", preset_id });
export const saveHeatingGroup = (
  hass: HomeAssistant,
  group: Omit<HeatingGroup, "builtin">,
  create: boolean
) => hass.callWS({ type: "homex/heating/group/save", group, create });
export const deleteHeatingGroup = (hass: HomeAssistant, group_id: string) =>
  hass.callWS({ type: "homex/heating/group/delete", group_id });
export const fetchHeatingModels = async (
  hass: HomeAssistant
): Promise<HeatingModel[]> =>
  (await hass.callWS({ type: "homex/heating/models" })).models || [];
export const saveHeatingDevicePreset = async (
  hass: HomeAssistant,
  preset: HeatingDevicePreset,
  create: boolean
): Promise<HeatingApplyResult[]> =>
  (await hass.callWS({ type: "homex/heating/device_preset/save", preset, create }))
    .results || [];
export const deleteHeatingDevicePreset = (hass: HomeAssistant, preset_id: string) =>
  hass.callWS({ type: "homex/heating/device_preset/delete", preset_id });
export const applyHeatingDevicePreset = async (
  hass: HomeAssistant,
  preset_id: string
): Promise<HeatingApplyResult[]> =>
  (await hass.callWS({ type: "homex/heating/device_preset/apply", preset_id }))
    .results || [];
export const saveHeatingZone = (
  hass: HomeAssistant,
  zone: Pick<HeatingZone, "id" | "name" | "rooms" | "triggers">,
  create: boolean
) => hass.callWS({ type: "homex/heating/zone/save", zone, create });
export const deleteHeatingZone = (hass: HomeAssistant, zone_id: string) =>
  hass.callWS({ type: "homex/heating/zone/delete", zone_id });
export const setHeatingZoneMode = (
  hass: HomeAssistant,
  zone_id: string,
  mode_id: string
) => hass.callWS({ type: "homex/heating/zone/set_mode", zone_id, mode_id });
export const setRoomHeatingZone = (
  hass: HomeAssistant,
  room_id: string,
  zone_id: string
) => hass.callWS({ type: "homex/heating/room_zone", room_id, zone_id });
export const setHeatingEnabled = (hass: HomeAssistant, enabled: boolean) =>
  hass.callWS({ type: "homex/heating/enabled", enabled });
export const saveHeatingSystem = (
  hass: HomeAssistant,
  system: HeatingSystem,
  create: boolean
) => hass.callWS({ type: "homex/heating/system/save", system, create });
export const heatingSystemStatus = (
  hass: HomeAssistant,
  system_id: string
): Promise<TankStatus> => hass.callWS({ type: "homex/heating/system/status", system_id });
export const deleteHeatingSystem = (hass: HomeAssistant, system_id: string) =>
  hass.callWS({ type: "homex/heating/system/delete", system_id });
