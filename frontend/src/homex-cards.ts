/** Lovelace cards shipped by Homex, loaded on every dashboard (the
 * integration registers this module as an extra frontend JS URL).
 *
 * - custom:homex-room-tile (cards/room-tile.ts), its room detail modal
 *   (cards/room-detail.ts) and visual editor (cards/room-tile-editor.ts).
 */
import "./cards/room-tile";
import "./cards/room-tile-editor";

const w = window as unknown as { customCards?: { type: string }[] };
w.customCards = w.customCards || [];
if (!w.customCards.some((c) => c.type === "homex-room-tile")) {
  w.customCards.push({
    type: "homex-room-tile",
    name: "Homex – Pièce",
    description:
      "Lumières de la pièce et ses scènes, climat, chauffage et volets Homex (détail au clic sur la partie droite).",
    preview: true,
  } as { type: string });
}
