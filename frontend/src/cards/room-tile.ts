/** custom:homex-room-tile — a full-width room tile:
 *
 * - its switch (lights toggle by default, or e.g. switch.homex_<room>_heating),
 *   tapped to toggle, with the Homex dashboard's bulb icons (lit scene /
 *   lights on outside a scene / off);
 * - air quality pills (CO₂, worst of PM2.5 / PM10) under the name;
 * - on the right, past a separator: status icons (flame: heating / no demand
 *   / not heated; shutters open / partly / closed) and temperature over
 *   humidity — tapped, they open the room detail modal;
 * - optionally, the room's scenes below as a button group (the active one
 *   selected; none when off), when it has 2+ scenes.
 *
 *   type: custom:homex-room-tile
 *   room: salon                          # Homex room id
 *   entity: switch.homex_salon_heating   # optional
 *   name: Salon                          # optional
 *   icon: mdi:sofa                       # optional
 *   show_scenes: true                    # optional (default false; rooms
 *                                        # with 2+ scenes only)
 *   scenes: [turn_on, film]              # optional: scene keys shown
 */
import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import {
  mdiChartBubble,
  mdiCloud,
  mdiFire,
  mdiFireOff,
  mdiLightbulbAlertOutline,
  mdiLightbulbOnOutline,
  mdiLightbulbOutline,
  mdiPalette,
  mdiWindowShutter,
  mdiWindowShutterOpen,
} from "@mdi/js";
import type { HomeAssistant, Room } from "../types";
import {
  airLevel,
  coverPosition,
  fmt,
  homexRooms,
  icon,
  roomCovers,
  roomMetric,
  roomValves,
  type AirKey,
} from "./shared";
import "./room-detail";
import type { HomexRoomDetail } from "./room-detail";

export interface RoomTileConfig {
  type: string;
  room: string;
  entity?: string;
  name?: string;
  icon?: string;
  show_scenes?: boolean;
  scenes?: string[];
}

// A shutter half-way: frame + slats on the top half only.
const SHUTTER_HALF =
  "M3 4H21V6H20V20H18V6H6V20H4V6H3V4M7 7H17V9H7V7M7 10H17V12H7V10M7 13H17V14H7V13Z";

export class HomexRoomTile extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config?: RoomTileConfig;
  @state() private _room?: Room;
  private _detail?: HomexRoomDetail;

  static getStubConfig() {
    return { room: "" };
  }

  static getConfigElement() {
    return document.createElement("homex-room-tile-editor");
  }

  setConfig(config: RoomTileConfig) {
    if (!config) throw new Error("homex-room-tile: configuration requise");
    if (config.room !== this._config?.room) this._room = undefined;
    this._config = config;
  }

  updated() {
    if (this.hass && this._config?.room && !this._room) {
      homexRooms(this.hass)
        .then((rooms) => {
          this._room = rooms.find((r) => r.room_id === this._config!.room);
        })
        .catch(() => undefined);
    }
    if (this._detail) this._detail.hass = this.hass;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._detail?.close();
  }

  getCardSize() {
    return 1 + (this._air().length ? 1 : 0) + (this._scenes().length ? 1 : 0);
  }

  getGridOptions() {
    return { columns: "full", rows: "auto", min_columns: 6 };
  }

  private get _entity() {
    return this._config!.entity || `switch.homex_${this._config!.room}_lights_toggle`;
  }

  private get _isLights() {
    return this._entity.endsWith("_lights_toggle");
  }

  /** As on the Homex dashboard: lit (a Homex scene applies), stray (some
   * light is on outside of a scene) or off. A room's switch is on as soon as
   * one of its parts is. */
  private _lightState(): "lit" | "stray" | "off" {
    const st = this.hass.states[`switch.homex_${this._config!.room}_lights_toggle`];
    if (st?.state !== "on") return "off";
    return st.attributes.active_scene != null ? "lit" : "stray";
  }

  private _name() {
    if (this._config!.name) return this._config!.name;
    if (this._room?.name) return this._room.name;
    // Homex names: "HX - {module} - {room} - {name}".
    const fn = this.hass.states[this._entity]?.attributes.friendly_name as string | undefined;
    return fn?.split(" - ")[2] ?? this._config!.room;
  }

  // -- Actions ------------------------------------------------------------------

  private _toggle() {
    const st = this.hass.states[this._entity];
    if (!st) return;
    // Lights, as on the Homex dashboard: turn the room on (apply its scene)
    // unless a room scene is active — never turn stray lights' parts off.
    const off = this._isLights ? this._lightState() === "lit" : st.state === "on";
    this.hass.callService("switch", off ? "turn_off" : "turn_on", { entity_id: this._entity });
  }

  private _openDetail(ev: Event) {
    ev.stopPropagation();
    if (!this._room) return;
    this._detail?.close();
    const detail = document.createElement("homex-room-detail") as HomexRoomDetail;
    detail.hass = this.hass;
    detail.room = this._room;
    detail.heading = this._name();
    document.body.appendChild(detail);
    this._detail = detail;
    const forget = () => {
      if (this._detail === detail) this._detail = undefined;
    };
    new MutationObserver((_, obs) => {
      if (!detail.isConnected) {
        forget();
        obs.disconnect();
      }
    }).observe(document.body, { childList: true });
  }

  private _activateScene(ev: Event, key: string, active: boolean) {
    ev.stopPropagation();
    this.hass.connection.sendMessagePromise({
      type: "homex/scene/activate",
      room_id: this._config!.room,
      key: active ? "turn_off" : key, // the active scene again: turn off
    });
  }

  // -- Parts ----------------------------------------------------------------

  /** Air quality pills: CO₂, and the worst of PM2.5 / PM10 (vs. its
   * guideline). */
  private _air() {
    if (!this.hass || !this._config) return [];
    const pill = (key: AirKey, label: string, path: string, tag = "") => {
      const m = roomMetric(this.hass, this._config!.room, key);
      return m && { key, label, path, tag, ...m, ...airLevel(key, m.value) };
    };
    const pm = [pill("pm25", "PM2.5", mdiChartBubble, "2.5"), pill("pm10", "PM10", mdiChartBubble, "10")]
      .filter((p) => !!p)
      .sort((a, b) => b!.ratio - a!.ratio)[0];
    return [pill("co2", "CO₂", mdiCloud), pm].filter((p) => !!p);
  }

  private _scenes() {
    if (!this._room || this._config?.show_scenes !== true) return [];
    if (!this._room.modules?.includes("lights")) return [];
    const all = (this._room.scenes ?? []).filter((s) => s.key !== "turn_off");
    if (all.length < 2) return []; // a single scene: the toggle is enough
    const shown = this._config?.scenes;
    return all.filter((s) => !shown || shown.includes(s.key));
  }

  private _heatingStatus() {
    if (!this._room?.heating?.radiators?.length) return nothing;
    // The room heating switch is live; the fetched room config may be stale.
    const sw = this.hass.states[`switch.homex_${this._config!.room}_heating`];
    const enabled = sw ? sw.state !== "off" : this._room.heating.enabled !== false;
    if (!enabled) return this._status(mdiFireOff, "off", "Pièce non chauffée");
    const demand = roomValves(this.hass, this._room).some(
      (v) => this.hass.states[v]?.attributes.hvac_action === "heating"
    );
    return demand
      ? this._status(mdiFire, "heat", "En chauffe")
      : this._status(mdiFire, "", "Pas de demande de chauffe");
  }

  private _shutterStatus() {
    const covers = roomCovers(this._room)
      .map((c) => this.hass.states[c])
      .filter((st) => st && st.state !== "unavailable" && st.state !== "unknown");
    if (!covers.length) return nothing;
    const pos = covers.map(coverPosition);
    const avg = Math.round(pos.reduce((a, b) => a + b, 0) / pos.length);
    if (pos.every((p) => p === 0)) return this._status(mdiWindowShutter, "", "Volets fermés");
    if (pos.every((p) => p === 100)) return this._status(mdiWindowShutterOpen, "", "Volets ouverts");
    return this._status(SHUTTER_HALF, "", `Volets ouverts à ${avg} %`);
  }

  private _status(path: string, cls: string, title: string) {
    return html`<span class="status ${cls}" title=${title}>${icon(path)}</span>`;
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    if (!this._config.room) return html`<ha-card class="empty">Choisir une pièce Homex</ha-card>`;
    const st = this.hass.states[this._entity];
    const on = st?.state === "on";
    const heating = this._entity.endsWith("_heating");
    const light = this._isLights ? this._lightState() : undefined;
    const path =
      light === "lit"
        ? mdiLightbulbOnOutline
        : light === "stray"
          ? mdiLightbulbAlertOutline
          : light === "off"
            ? mdiLightbulbOutline
            : undefined;
    const title = !st
      ? "Introuvable"
      : st.state === "unavailable"
        ? "Indisponible"
        : light === "lit"
          ? "Allumée — éteindre"
          : light === "stray"
            ? "Éteinte, mais au moins une lumière est allumée — allumer"
            : light === "off"
              ? "Éteinte — allumer"
              : (this.hass.formatEntityState?.(st) ?? st.state);
    const missing = !st || st.state === "unavailable";
    const t = roomMetric(this.hass, this._config.room, "temperature");
    const h = roomMetric(this.hass, this._config.room, "humidity");
    const air = this._air();
    const scenes = this._scenes();
    const active =
      this._lightState() === "lit"
        ? this.hass.states[`switch.homex_${this._config.room}_lights_toggle`]?.attributes.active_scene
        : undefined;
    const heatingS = this._heatingStatus();
    const shutterS = this._shutterStatus();
    const hasRight = t || h || heatingS !== nothing || shutterS !== nothing;
    return html`<ha-card
      class=${on ? "on" : ""}
      style=${heating ? "--tile-color: var(--state-climate-heat-color, #ff8100)" : ""}
      title=${title}
      @click=${this._toggle}
    >
      <div class="main">
        <div class="icon">
          ${path && !this._config.icon ? icon(path) : html`<ha-icon .icon=${this._config.icon || "mdi:radiator"}></ha-icon>`}
        </div>
        <div class="info">
          <div class="name">${this._name()}</div>
          ${missing ? html`<div class="sub">${title}</div>` : nothing}
          ${air.length
            ? html`<div class="pills">
                ${air.map(
                  (p) =>
                    html`<span class="pill l${p!.level}" title=${`${p!.label} : ${fmt(this.hass, p!.value, 1)} ${p!.unit ?? ""}`}
                      ><span class="picto">${icon(p!.path)}${p!.tag ? html`<small>${p!.tag}</small>` : nothing}</span
                      ><span class="pval">${fmt(this.hass, p!.value, 0)}</span></span
                    >`
                )}
              </div>`
            : nothing}
        </div>
        ${hasRight
          ? html`<button class="right" title="État de la pièce" @click=${this._openDetail}>
              <span class="statuses">${heatingS}${shutterS}</span>
              ${t || h
                ? html`<span class="readings">
                    ${t ? html`<span class="temp">${fmt(this.hass, t.value, 1, 1)} ${t.unit ?? "°C"}</span>` : nothing}
                    ${h ? html`<span class="hum">${fmt(this.hass, h.value, 0)} %</span>` : nothing}
                  </span>`
                : nothing}
            </button>`
          : nothing}
      </div>
      ${scenes.length
        ? html`<div class="scenes">
            <span class="scenes-icon" title="Scènes">${icon(mdiPalette)}</span>
            <div class="group">
            ${scenes.map(
              (s) =>
                html`<button
                  class="scene ${s.key === active ? "active" : ""}"
                  title=${s.key === active ? `${s.name} — éteindre` : s.name}
                  @click=${(e: Event) => this._activateScene(e, s.key, s.key === active)}
                >
                  ${s.name}
                </button>`
            )}
            </div>
          </div>`
        : nothing}
    </ha-card>`;
  }

  static styles = css`
    :host {
      --tile-color: var(--state-light-active-color, var(--amber-color, #ffc107));
    }
    ha-card {
      height: 100%;
      box-sizing: border-box;
      padding: 10px 6px 10px 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 8px;
    }
    ha-card.empty {
      padding: 16px;
      color: var(--secondary-text-color);
    }
    .main {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .icon {
      flex: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(127, 127, 127, 0.15);
      color: var(--state-inactive-color, var(--secondary-text-color));
      --mdc-icon-size: 22px;
    }
    .icon svg {
      width: 22px;
      height: 22px;
      fill: currentColor;
    }
    .on .icon {
      color: var(--tile-color);
      background: color-mix(in srgb, var(--tile-color) 20%, transparent);
    }
    .info {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sub {
      font-size: 12px;
      line-height: 16px;
      color: var(--secondary-text-color);
    }
    .pills {
      display: flex;
      gap: 4px;
      margin-top: 3px;
    }
    .pill {
      --pill: var(--success-color, #43a047);
      font-size: 10px;
      font-weight: 500;
      line-height: 14px;
      border-radius: 7px;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      color: var(--pill);
      background: color-mix(in srgb, var(--pill) 18%, transparent);
    }
    .picto {
      display: inline-flex;
      align-items: center;
      gap: 1px;
      padding: 0 4px 0 5px;
    }
    .pval {
      padding: 0 6px 0 4px;
      border-left: 1px solid color-mix(in srgb, var(--pill) 45%, transparent);
    }
    .pill svg {
      width: 11px;
      height: 11px;
      fill: currentColor;
    }
    .pill small {
      font-size: 8px;
      opacity: 0.85;
    }
    .pill.l1 {
      --pill: var(--warning-color, #ffa600);
    }
    .pill.l2 {
      --pill: var(--error-color, #db4437);
    }
    .right {
      flex: none;
      display: flex;
      align-items: center;
      gap: 10px;
      align-self: stretch;
      margin: -4px 0;
      padding: 0 8px 0 12px;
      border: none;
      border-left: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 0 10px 10px 0;
      background: none;
      font: inherit;
      color: inherit;
      cursor: pointer;
    }
    .right:hover {
      background: rgba(127, 127, 127, 0.08);
    }
    .statuses {
      display: flex;
      gap: 6px;
    }
    .status {
      display: flex;
      color: var(--secondary-text-color);
      opacity: 0.8;
    }
    .status svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
    .status.heat {
      color: var(--state-climate-heat-color, #ff8100);
      opacity: 1;
    }
    .status.off {
      color: var(--error-color, #db4437);
      opacity: 1;
    }
    .readings {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      min-width: 56px;
    }
    .temp {
      font-size: 12px;
      font-weight: 600;
      line-height: 16px;
      color: var(--primary-text-color);
    }
    .hum {
      font-size: 12px;
      font-weight: 600;
      line-height: 16px;
      color: var(--secondary-text-color);
    }
    .scenes {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .scenes-icon {
      flex: none;
      width: 36px;
      display: flex;
      justify-content: center;
      color: var(--secondary-text-color);
    }
    .scenes-icon svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
    .group {
      flex: 1;
      min-width: 0;
      display: flex;
      margin-right: 4px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
      border-radius: 10px;
      overflow: hidden;
    }
    .scene {
      flex: 1 1 0;
      min-width: 0;
      min-height: 38px;
      padding: 4px 6px;
      font: inherit;
      font-size: 13px;
      line-height: 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border: none;
      border-left: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
      background: none;
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .scene:first-child {
      border-left: none;
    }
    .scene:hover {
      background: rgba(127, 127, 127, 0.1);
    }
    .scene.active {
      background: color-mix(in srgb, var(--tile-color) 28%, transparent);
      font-weight: 600;
    }
  `;
}

if (!customElements.get("homex-room-tile")) {
  customElements.define("homex-room-tile", HomexRoomTile);
}
