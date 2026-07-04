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
  dim?: boolean; // dimming enabled for this group
  dim_up_triggers?: TriggerSpec[];
  dim_down_triggers?: TriggerSpec[];
}

export interface Scene {
  key: string;
  name: string;
  config_id: string; // id in scenes.yaml, used for the HA editor link
  removable: boolean;
  orderable: boolean; // all scenes except the pinned "off" scene
  triggers: TriggerSpec[]; // triggers that activate this scene
}

export type SceneStrategy = "recall_first" | "recall_last";

// A trigger is a raw Home Assistant trigger config — exactly what the
// automation editor produces (e.g. {trigger:"state",...}, {trigger:"device",...}).
export type TriggerSpec = Record<string, any>;

/** A global switch layout template (edited in the Switch Manager). Coordinates
 * are grid units on a 20x20 grid whose ORIGIN IS THE CENTER (range -10..10);
 * the shape is auto-centered on save. */
export type LayoutShape = "round" | "square" | "vrect";
export interface LayoutZone {
  n: number; // button number
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface SwitchLayout {
  id: string;
  name: string;
  buttons: number;
  shape: LayoutShape;
  bounds: { x: number; y: number; w: number; h: number };
  columns: number;
  rows: number;
  colLines: number[]; // internal vertical dividers (x), length columns-1
  rowLines: number[]; // internal horizontal dividers (y), length rows-1
  // Per-cell button assignment (row-major, length columns*rows): the button
  // number in each cell, or 0 for an empty cell.
  assignments: number[];
  positions: { n: number; x: number; y: number }[]; // derived, for previews
  // Clickable zone rect per assigned button (to be clipped by the contour when
  // rendered, so round shapes don't click in the void). Center-origin coords.
  zones: LayoutZone[];
}

export type TapMode = "single" | "double" | "long";

/** A unique switch/remote device model (interrupteur). */
export interface SwitchModel {
  model: string; // model key (manufacturer|model)
  label: string;
  device_id: string; // a sample device of this model (to resolve its actions)
  count: number;
}

/** An individual switch/remote device (interrupteur). */
export interface SwitchDevice {
  device_id: string;
  name: string;
  model: string; // model key
  model_label: string;
}

/** A device preset: the standard mapping (layout + tap modes + action bindings)
 * for a particular device model. Reused by every switch of that model. */
export interface DevicePreset {
  id: string;
  name: string;
  model: string; // device model key this preset applies to
  model_label: string;
  device_id: string; // a sample device (to resolve the model's actions)
  layout_id: string;
  taps: Record<string, TapMode[]>; // button -> enabled tap modes
  bindings: Record<string, Record<string, string[]>>; // tapMode -> button -> actions
}

/** A Homex action a switch button can trigger, within a room's context. */
export type HomexAction =
  | { kind: "toggle" }
  | { kind: "scene_next" }
  | { kind: "dim_up" }
  | { kind: "dim_down" }
  | { kind: "group"; group_id: string }
  | { kind: "scene"; scene_key: string }
  | { kind: "shutter_toggle"; group_id: string }
  | { kind: "shutter_open"; group_id: string }
  | { kind: "shutter_close"; group_id: string }
  | { kind: "shutter_stop"; group_id: string };

/** A global switch (Switch Management): a name, a device, and assigned rooms.
 * Its layout/taps/actions come from the Device Preset of the device's model. */
export interface SwitchButtonAction {
  room: string; // the room this action targets
  action: HomexAction;
}
export interface GlobalSwitch {
  id: string;
  name: string;
  device_id: string;
  rooms: string[]; // assigned Homex room ids (0..n)
  // Button→action mapping: tapMode → button → { room, action }. A button does
  // one thing; the action names which of the switch's rooms it targets.
  mappings?: Record<string, Record<string, SwitchButtonAction>>;
}

/** A physical controller (interrupteur) declared on a room (switches module). */
export interface HomexSwitch {
  id: string;
  name: string;
  buttons: number; // number of buttons
  dim: boolean; // has a dimmer function
  // Visual layout: a columns x rows grid; layout is a flat list of button keys
  // ("button_1"...) or "" for an empty cell, in reading order.
  columns: number;
  rows: number;
  layout: string[];
  rooms: string[]; // associated Homex room ids (0..n)
  // Slot ("button_1".."button_N", "dim_up", "dim_down") -> its triggers.
  triggers: Record<string, TriggerSpec[]>;
}

/** Read-only triggers a room receives from switch buttons (Switches module),
 * grouped by target. Displayed alongside the editable Lights-module triggers. */
export interface SwitchTriggers {
  toggle: string[];
  scene_next: string[];
  dim_up: string[];
  dim_down: string[];
  scenes: Record<string, string[]>; // scene_key -> labels
  groups: Record<string, string[]>; // group_id -> labels
}

export interface Room extends Unit {
  entry_id: string;
  room_id: string;
  area_id: string | null;
  modules: string[];
  triggers: TriggerSpec[];
  scene_triggers: TriggerSpec[];
  dim_up_triggers: TriggerSpec[];
  dim_down_triggers: TriggerSpec[];
  scene_strategy: SceneStrategy;
  scenes: Scene[];
  switches: HomexSwitch[];
  switch_triggers?: SwitchTriggers;
  groups: Group[];
  shutter_groups?: ShutterGroup[];
}

/** A group of roller shutters (covers) in a room, with its own triggers. */
export interface ShutterGroup {
  id: string;
  name: string;
  devices: string[]; // cover entity ids
  toggle_triggers: TriggerSpec[];
  open_triggers: TriggerSpec[];
  close_triggers: TriggerSpec[];
  stop_triggers: TriggerSpec[];
  removable: boolean; // false for the default "Général" group
}

// Bubbled by editing components after a successful mutation so the panel reloads.
export const HOMEX_CHANGED = "homex-changed";

export const fireChanged = (el: HTMLElement) =>
  el.dispatchEvent(new CustomEvent(HOMEX_CHANGED, { bubbles: true, composed: true }));
