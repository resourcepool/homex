// Shared types for the Homex panel.

// The Home Assistant frontend object passed to panels (kept loose on purpose).
export type HomeAssistant = any;

export interface Unit {
  name: string;
  devices: string[];
  switch: string;
  light: string;
  scene_on: string;
  scene_off: string;
}

export interface Group extends Unit {
  group_id: string;
  triggers: TriggerSpec[];
}

export interface Scene {
  key: string;
  name: string;
  config_id: string; // id in scenes.yaml, used for the HA editor link
  removable: boolean;
  orderable: boolean; // all scenes except the pinned "off" scene
}

export type SceneStrategy = "recall_first" | "recall_last";

// A trigger is either an entity (state change) or a device action.
export interface TriggerSpec {
  entity_id?: string;
  device_id?: string;
  action?: string;
}

export interface Room extends Unit {
  entry_id: string;
  room_id: string;
  area_id: string | null;
  triggers: TriggerSpec[];
  scene_triggers: TriggerSpec[];
  scene_strategy: SceneStrategy;
  scenes: Scene[];
  groups: Group[];
}

// Bubbled by editing components after a successful mutation so the panel reloads.
export const HOMEX_CHANGED = "homex-changed";

export const fireChanged = (el: HTMLElement) =>
  el.dispatchEvent(new CustomEvent(HOMEX_CHANGED, { bubbles: true, composed: true }));
