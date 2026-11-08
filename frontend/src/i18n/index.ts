/** All translation catalogs, by namespace (see lib/i18n.ts). Each catalog
 * file exports `{ en: {...}, fr: {...} }` with the same keys. */
import common from "./common";
import panel from "./panel";
import climateDashboard from "./climateDashboard";
import climateManager from "./climateManager";
import climateMetrics from "./climateMetrics";
import deviceField from "./deviceField";
import dialog from "./dialog";
import entityPicker from "./entityPicker";
import exportDialog from "./exportDialog";
import groupDialog from "./groupDialog";
import groupRow from "./groupRow";
import gswitchEditor from "./gswitchEditor";
import heatingDevicePresetEditor from "./heatingDevicePresetEditor";
import heatingGroupEditor from "./heatingGroupEditor";
import heatingManager from "./heatingManager";
import heatingSystemEditor from "./heatingSystemEditor";
import heatingSystemsCard from "./heatingSystemsCard";
import heatingZoneEditor from "./heatingZoneEditor";
import layoutEditor from "./layoutEditor";
import managedTriggers from "./managedTriggers";
import presetEditor from "./presetEditor";
import radiatorDialog from "./radiatorDialog";
import roomCard from "./roomCard";
import roomClimate from "./roomClimate";
import roomDialog from "./roomDialog";
import sceneDialog from "./sceneDialog";
import select from "./select";
import shutterControlDialog from "./shutterControlDialog";
import shutterGroupDialog from "./shutterGroupDialog";
import shutterManager from "./shutterManager";
import shutterPresetEditor from "./shutterPresetEditor";
import switchManager from "./switchManager";
import switchMapping from "./switchMapping";
import triggerSelector from "./triggerSelector";
import triggersDialog from "./triggersDialog";
import unitControls from "./unitControls";
import cardRoomTile from "./cardRoomTile";
import cardRoomDetail from "./cardRoomDetail";
import cardRoomTileEditor from "./cardRoomTileEditor";
import lib from "./lib";

export const CATALOGS: Record<string, { en: Record<string, string>; fr: Record<string, string> }> = {
  common,
  panel,
  climateDashboard,
  climateManager,
  climateMetrics,
  deviceField,
  dialog,
  entityPicker,
  exportDialog,
  groupDialog,
  groupRow,
  gswitchEditor,
  heatingDevicePresetEditor,
  heatingGroupEditor,
  heatingManager,
  heatingSystemEditor,
  heatingSystemsCard,
  heatingZoneEditor,
  layoutEditor,
  managedTriggers,
  presetEditor,
  radiatorDialog,
  roomCard,
  roomClimate,
  roomDialog,
  sceneDialog,
  select,
  shutterControlDialog,
  shutterGroupDialog,
  shutterManager,
  shutterPresetEditor,
  switchManager,
  switchMapping,
  triggerSelector,
  triggersDialog,
  unitControls,
  cardRoomTile,
  cardRoomDetail,
  cardRoomTileEditor,
  lib,
};
