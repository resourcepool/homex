/** Lovelace cards shipped by Homex, loaded on every dashboard (the
 * integration registers this module as an extra frontend JS URL).
 *
 * custom:homex-room-tile — a full-width room tile: its switch (lights toggle
 * by default, or e.g. switch.homex_<room>_heating), tapped to toggle; status
 * icons (heating demand / not heated, shutters open / partly / closed), its
 * air quality (CO₂, PM2.5, PM10) when available, and its Homex temperature
 * and humidity stacked on the right.
 *
 *   type: custom:homex-room-tile
 *   room: salon                    # Homex room id
 *   entity: switch.homex_salon_heating   # optional
 *   name: Salon                    # optional
 *   icon: mdi:sofa                 # optional
 */
import { LitElement, css, html, nothing, svg } from "lit";
import { property, state } from "lit/decorators.js";
import {
  mdiFire,
  mdiFireOff,
  mdiRadiatorOff,
  mdiWindowShutter,
  mdiWindowShutterOpen,
} from "@mdi/js";
import type { HomeAssistant, Room } from "./types";

// A shutter half-way: frame + slats on the top half only.
const SHUTTER_HALF =
  "M3 4H21V6H20V20H18V6H6V20H4V6H3V4M7 7H17V9H7V7M7 10H17V12H7V10M7 13H17V14H7V13Z";

/** The Homex rooms (radiators, shutters, heating switch), fetched once per
 * page load and shared by every tile. */
let roomsPromise: Promise<Room[]> | undefined;
function homexRooms(hass: HomeAssistant): Promise<Room[]> {
  roomsPromise ??= hass.connection
    .sendMessagePromise({ type: "homex/rooms" })
    .then((r: { rooms: Room[] }) => r.rooms)
    .catch((err: unknown) => {
      roomsPromise = undefined; // retry on the next render
      throw err;
    });
  return roomsPromise!;
}

interface RoomTileConfig {
  type: string;
  room: string;
  entity?: string;
  name?: string;
  icon?: string;
}

const AIR = [
  ["co2", "CO₂"],
  ["pm25", "PM2.5"],
  ["pm10", "PM10"],
] as const;

const fmt = (hass: HomeAssistant, value: number, digits = 1) =>
  value.toLocaleString(hass.locale?.language || undefined, {
    maximumFractionDigits: digits,
  });

class HomexRoomTile extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config?: RoomTileConfig;
  @state() private _room?: Room;

  updated() {
    if (this.hass && this._config && !this._room) {
      homexRooms(this.hass)
        .then((rooms) => {
          this._room = rooms.find((r) => r.room_id === this._config!.room);
        })
        .catch(() => undefined);
    }
  }

  /** The room's radiator valves (climate entities of its radiator devices). */
  private _valves(): string[] {
    const devices = new Set((this._room?.heating?.radiators ?? []).map((r) => r.device_id));
    if (!devices.size) return [];
    return Object.values(this.hass.entities ?? {})
      .filter((e: any) => e.entity_id.startsWith("climate.") && devices.has(e.device_id))
      .map((e: any) => e.entity_id);
  }

  private _covers(): string[] {
    return [...new Set((this._room?.shutter_groups ?? []).flatMap((g) => g.devices))];
  }

  private _heatingStatus() {
    if (!this._room?.heating?.radiators?.length) return nothing;
    if (this._room.heating.enabled === false)
      return this._status(mdiRadiatorOff, "off", "Pièce non chauffée");
    const demand = this._valves().some(
      (v) => this.hass.states[v]?.attributes.hvac_action === "heating"
    );
    return demand
      ? this._status(mdiFire, "heat", "Demande de chauffe")
      : this._status(mdiFireOff, "", "Pas de demande de chauffe");
  }

  private _shutterStatus() {
    const covers = this._covers()
      .map((c) => this.hass.states[c])
      .filter((st) => st && st.state !== "unavailable" && st.state !== "unknown");
    if (!covers.length) return nothing;
    // 0 = closed .. 100 = open, per cover.
    const pos = covers.map((st) => {
      const p = st.attributes.current_position;
      if (typeof p === "number") return p;
      return st.state === "closed" ? 0 : 100;
    });
    const avg = Math.round(pos.reduce((a, b) => a + b, 0) / pos.length);
    if (pos.every((p) => p === 0)) return this._status(mdiWindowShutter, "", "Volets fermés");
    if (pos.every((p) => p === 100))
      return this._status(mdiWindowShutterOpen, "", "Volets ouverts");
    return this._status(SHUTTER_HALF, "", `Volets ouverts à ${avg} %`);
  }

  private _status(path: string, cls: string, title: string) {
    return html`<span class="status ${cls}" title=${title}
      ><svg viewBox="0 0 24 24">${svg`<path d=${path}></path>`}</svg></span
    >`;
  }

  static getStubConfig() {
    return { room: "salon" };
  }

  setConfig(config: RoomTileConfig) {
    if (!config?.room) throw new Error("homex-room-tile: « room » (id de pièce Homex) requis");
    this._config = config;
  }

  private get _entity() {
    return this._config!.entity || `switch.homex_${this._config!.room}_lights_toggle`;
  }

  private _metric(key: string) {
    const st = this.hass?.states[`sensor.homex_${this._config!.room}_${key}`];
    const value = st ? parseFloat(st.state) : NaN;
    return Number.isNaN(value) ? undefined : { value, unit: st!.attributes.unit_of_measurement as string | undefined };
  }

  private _air() {
    return AIR.map(([key, label]) => ({ label, m: this._metric(key) })).filter((a) => a.m);
  }

  getCardSize() {
    return this._air().length ? 2 : 1;
  }

  getGridOptions() {
    return { columns: "full", rows: "auto", min_columns: 6 };
  }

  private _name() {
    if (this._config!.name) return this._config!.name;
    // Homex names: "HX - {module} - {room} - {name}".
    const fn = this.hass.states[this._entity]?.attributes.friendly_name as string | undefined;
    return fn?.split(" - ")[2] ?? this._config!.room;
  }

  private _toggle() {
    const st = this.hass.states[this._entity];
    if (!st) return;
    this.hass.callService("switch", st.state === "on" ? "turn_off" : "turn_on", {
      entity_id: this._entity,
    });
  }

  private _moreInfo(ev: Event) {
    ev.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: this._entity },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    const st = this.hass.states[this._entity];
    const on = st?.state === "on";
    const heating = this._entity.endsWith("_heating");
    const icon =
      this._config.icon || (heating ? "mdi:radiator" : on ? "mdi:lightbulb-group" : "mdi:lightbulb-group-off");
    const stateLabel = !st
      ? "Introuvable"
      : st.state === "unavailable"
        ? "Indisponible"
        : this.hass.formatEntityState?.(st) ?? st.state;
    const t = this._metric("temperature");
    const h = this._metric("humidity");
    const air = this._air();
    return html`<ha-card
      class=${on ? "on" : ""}
      style=${heating ? "--tile-color: var(--state-climate-heat-color, #ff8100)" : ""}
      @click=${this._toggle}
    >
      <div class="icon" @click=${this._moreInfo} title="Détails">
        <ha-icon .icon=${icon}></ha-icon>
      </div>
      <div class="info">
        <div class="name">${this._name()}</div>
        <div class="sub">${stateLabel}</div>
        ${air.length
          ? html`<div class="sub air">
              ${air
                .map(({ label, m }) => `${label} ${fmt(this.hass, m!.value, 0)}${m!.unit ? " " + m!.unit : ""}`)
                .join(" · ")}
            </div>`
          : nothing}
      </div>
      <div class="statuses">${this._heatingStatus()}${this._shutterStatus()}</div>
      ${t || h
        ? html`<div class="readings">
            ${t ? html`<div class="temp">${fmt(this.hass, t.value)} ${t.unit ?? "°C"}</div>` : nothing}
            ${h ? html`<div class="hum">${fmt(this.hass, h.value, 0)} %</div>` : nothing}
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
      padding: 10px 14px 10px 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .statuses {
      flex: none;
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
      flex: none;
      text-align: right;
      min-width: 56px;
    }
    .temp {
      font-size: 16px;
      font-weight: 500;
      line-height: 20px;
      color: var(--primary-text-color);
    }
    .hum {
      font-size: 12px;
      line-height: 16px;
      color: var(--secondary-text-color);
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
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .air {
      color: var(--secondary-text-color);
    }
  `;
}

if (!customElements.get("homex-room-tile")) {
  customElements.define("homex-room-tile", HomexRoomTile);
  const w = window as unknown as { customCards?: unknown[] };
  w.customCards = w.customCards || [];
  w.customCards.push({
    type: "homex-room-tile",
    name: "Homex – Pièce",
    description: "Switch de la pièce, température / humidité et qualité de l'air Homex.",
  });
}
