/** Lovelace cards shipped by Homex, loaded on every dashboard (the
 * integration registers this module as an extra frontend JS URL).
 *
 * - custom:homex-room-tile (cards/room-tile.ts), its room detail modal
 *   (cards/room-detail.ts) and visual editor (cards/room-tile-editor.ts).
 */
import "./cards/room-tile";
import { registerIconset } from "./lib/logo";
import { t } from "./lib/i18n";
import "./cards/room-tile-editor";

// The "homex" icon set (homex:logo, the sidebar icon) on every page.
registerIconset();

const w = window as unknown as { customCards?: { type: string }[] };
w.customCards = w.customCards || [];
if (!w.customCards.some((c) => c.type === "homex-room-tile")) {
  w.customCards.push({
    type: "homex-room-tile",
    // Getters: resolved when the card picker renders (in the active language).
    get name() {
      return t("cardRoomTile.card_name");
    },
    get description() {
      return t("cardRoomTile.card_description");
    },
    preview: true,
  } as { type: string });
}
