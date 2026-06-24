// Thin client over the Homex WebSocket API.
import type { HomeAssistant, Room, TriggerSpec } from "./types";

export const fetchRooms = async (hass: HomeAssistant): Promise<Room[]> =>
  (await hass.callWS({ type: "homex/rooms" })).rooms || [];

export interface RoomCreate {
  name: string;
  room_id: string;
  area_id?: string | null;
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
  devices?: string[];
  // Triggers: {entity_id} (state change) or {device_id} (device action).
  triggers?: TriggerSpec[];
  scene_triggers?: TriggerSpec[];
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

export interface GroupPayload {
  entry_id: string;
  group_id: string;
  name?: string;
  devices?: string[];
  triggers?: TriggerSpec[];
}
export const addGroup = (hass: HomeAssistant, payload: GroupPayload) =>
  hass.callWS({ type: "homex/group/add", ...payload });

export const updateGroup = (hass: HomeAssistant, payload: GroupPayload) =>
  hass.callWS({ type: "homex/group/update", ...payload });

export const deleteGroup = (hass: HomeAssistant, entry_id: string, group_id: string) =>
  hass.callWS({ type: "homex/group/delete", entry_id, group_id });

export const addScene = (
  hass: HomeAssistant,
  entry_id: string,
  name: string,
  attach?: string
) =>
  hass.callWS({
    type: "homex/scene/add",
    entry_id,
    name,
    ...(attach ? { attach } : {}),
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
  name: string
) => hass.callWS({ type: "homex/scene/rename", entry_id, key, name });

export const errorMessage = (err: any): string =>
  (err && (err.message || err.code)) || String(err);
