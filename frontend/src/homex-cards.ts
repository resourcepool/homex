/** Lovelace cards shipped by Homex, loaded on every dashboard (the
 * integration registers this module as an extra frontend JS URL).
 *
 * custom:homex-room-tile — a room tile: its switch (lights toggle by default,
 * or e.g. switch.homex_<room>_heating), tapped to toggle; the room's Homex
 * temperature / humidity on the second line, and its air quality (CO₂, PM2.5,
 * PM10) on a third line when the room has those readings.
 *
 *   type: custom:homex-room-tile
 *   room: salon                    # Homex room id
 *   entity: switch.homex_salon_heating   # optional
 *   name: Salon                    # optional
 *   icon: mdi:sofa                 # optional
 */
import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant } from "./types";

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
    return { columns: 6, rows: "auto", min_columns: 3 };
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
    const line2 = [
      stateLabel,
      t ? `${fmt(this.hass, t.value)} ${t.unit ?? "°C"}` : null,
      h ? `${fmt(this.hass, h.value, 0)} %` : null,
    ].filter(Boolean);
    const air = this._air();
    return html`<ha-card
      class=${on ? "on" : ""}
      style=${heating ? "--tile-color: var(--state-climate-heat-color, #ff8100)" : ""}
      @click=${this._toggle}
    >
      <div class="row">
        <div class="icon" @click=${this._moreInfo} title="Détails">
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        <div class="info">
          <div class="name">${this._name()}</div>
          <div class="sub">${line2.join(" · ")}</div>
          ${air.length
            ? html`<div class="sub air">
                ${air
                  .map(({ label, m }) => `${label} ${fmt(this.hass, m!.value, 0)}${m!.unit ? " " + m!.unit : ""}`)
                  .join(" · ")}
              </div>`
            : nothing}
        </div>
      </div>
    </ha-card>`;
  }

  static styles = css`
    :host {
      --tile-color: var(--state-light-active-color, var(--amber-color, #ffc107));
    }
    ha-card {
      height: 100%;
      box-sizing: border-box;
      padding: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      width: 100%;
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
