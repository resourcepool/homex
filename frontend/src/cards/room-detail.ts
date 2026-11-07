/** The room detail modal of homex-room-tile: climate readings with their
 * sensors, heating (room switch, setpoint override, valves) and shutters,
 * per what the room has. Appended to document.body (outside dashboards'
 * stacking contexts). */
import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import {
  mdiArrowCollapseDown,
  mdiArrowCollapseUp,
  mdiChartBubble,
  mdiClose,
  mdiCloud,
  mdiFire,
  mdiFireOff,
  mdiMinus,
  mdiPlus,
  mdiStop,
  mdiThermometer,
  mdiWaterPercent,
} from "@mdi/js";
import type { HomeAssistant, Room } from "../types";
import {
  LEVEL_NAMES,
  airLevel,
  coverPosition,
  fmt,
  friendly,
  icon,
  roomCovers,
  roomMetric,
  roomValves,
  type AirKey,
} from "./shared";

interface HeatingStatus {
  enabled: boolean;
  room_enabled: boolean;
  mode: string;
  mode_name: string;
  off: boolean;
  setpoint: number | null;
  group_setpoint: number | null;
  override: number | null;
  min: number;
  max: number;
  step: number;
}

const METRICS: { key: string; label: string; path: string; air?: AirKey; digits: number }[] = [
  { key: "temperature", label: "Température", path: mdiThermometer, digits: 1 },
  { key: "humidity", label: "Humidité", path: mdiWaterPercent, digits: 0 },
  { key: "co2", label: "CO₂", path: mdiCloud, air: "co2", digits: 0 },
  { key: "pm25", label: "PM2.5", path: mdiChartBubble, air: "pm25", digits: 1 },
  { key: "pm10", label: "PM10", path: mdiChartBubble, air: "pm10", digits: 1 },
];

export class HomexRoomDetail extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) room!: Room;
  @property() heading = "";
  @state() private _heating?: HeatingStatus;
  @state() private _busy = false;
  private _lastHeatingSwitch?: string;

  connectedCallback() {
    super.connectedCallback();
    this._keydown = this._keydown.bind(this);
    window.addEventListener("keydown", this._keydown);
    this._loadHeating();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._keydown);
  }

  private _keydown(ev: KeyboardEvent) {
    if (ev.key === "Escape") this.close();
  }

  close() {
    this.remove();
  }

  private get _heatingSwitch() {
    return `switch.homex_${this.room.room_id}_heating`;
  }

  willUpdate() {
    // The room heating switch flipped (here or elsewhere): refresh the status.
    const st = this.hass?.states[this._heatingSwitch]?.state;
    if (this._lastHeatingSwitch !== undefined && st !== this._lastHeatingSwitch) {
      setTimeout(() => this._loadHeating(), 1500); // the room reloads first
    }
    this._lastHeatingSwitch = st;
  }

  private async _loadHeating() {
    if (!this.room?.heating?.radiators?.length) return;
    try {
      this._heating = await this.hass.connection.sendMessagePromise({
        type: "homex/heating/room_status",
        room_id: this.room.room_id,
      });
    } catch {
      this._heating = undefined;
    }
  }

  private async _setpoint(value: number | null) {
    this._busy = true;
    try {
      await this.hass.connection.sendMessagePromise({
        type: "homex/heating/room_setpoint",
        room_id: this.room.room_id,
        setpoint: value,
      });
      await this._loadHeating();
    } finally {
      this._busy = false;
    }
  }

  private _cover(service: string, entity_id: string | string[], data: object = {}) {
    this.hass.callService("cover", service, { entity_id, ...data });
  }

  // -- Sections ---------------------------------------------------------------

  private _climate() {
    const rows = METRICS.map((m) => ({ ...m, v: roomMetric(this.hass, this.room.room_id, m.key) })).filter(
      (m) => m.v
    );
    if (!rows.length) return nothing;
    return html`<section>
      <h3>Climat</h3>
      ${rows.map((m) => {
        const lvl = m.air ? airLevel(m.air, m.v!.value).level : undefined;
        const unit = m.key === "humidity" ? "%" : (m.v!.unit ?? "");
        const sensors =
          (this.hass.states[`sensor.homex_${this.room.room_id}_${m.key}`]?.attributes.sensors as string[]) ?? [];
        const rule = this.hass.states[`sensor.homex_${this.room.room_id}_${m.key}`]?.attributes.rule as string;
        return html`<div class="metric">
          <div class="mrow">
            <span class="micon">${icon(m.path)}</span>
            <span class="mlabel">${m.label}</span>
            ${lvl !== undefined ? html`<span class="pill l${lvl}">${LEVEL_NAMES[lvl]}</span>` : nothing}
            <span class="mvalue">${fmt(this.hass, m.v!.value, m.digits, m.key === "temperature" ? 1 : 0)} ${unit}</span>
          </div>
          ${sensors.length > 1 || (sensors.length === 1 && rule !== "mean")
            ? html`<div class="sources">
                ${sensors.map((s) => {
                  const st = this.hass.states[s];
                  const v = st ? parseFloat(st.state) : NaN;
                  return html`<div class="source">
                    <span>${friendly(this.hass, s)}</span>
                    <span>${Number.isNaN(v) ? (st?.state ?? "—") : `${fmt(this.hass, v, m.digits)} ${st!.attributes.unit_of_measurement ?? ""}`}</span>
                  </div>`;
                })}
                <div class="source muted">Règle : ${rule === "max" ? "maximum" : rule === "min" ? "minimum" : "moyenne"}</div>
              </div>`
            : sensors.length === 1
              ? html`<div class="sources"><div class="source muted"><span>${friendly(this.hass, sensors[0])}</span></div></div>`
              : nothing}
        </div>`;
      })}
    </section>`;
  }

  private _heatingSection() {
    if (!this.room.heating?.radiators?.length) return nothing;
    const sw = this.hass.states[this._heatingSwitch];
    const h = this._heating;
    const valves = roomValves(this.hass, this.room);
    const demand = valves.some((v) => this.hass.states[v]?.attributes.hvac_action === "heating");
    const roomOn = sw ? sw.state === "on" : h?.room_enabled !== false;
    return html`<section>
      <h3>Chauffage</h3>
      <div class="line">
        <span class="status ${!roomOn ? "off" : demand ? "heat" : ""}"
          >${icon(!roomOn ? mdiFireOff : mdiFire)}</span
        >
        <span class="grow">
          ${!roomOn
            ? "Pièce non chauffée"
            : demand
              ? "En chauffe"
              : "Pas de demande de chauffe"}
          ${h ? html`<span class="muted"> · mode ${h.mode_name}${h.enabled ? "" : " · chauffage global coupé"}</span>` : nothing}
        </span>
        ${sw
          ? html`<label class="switch" title="Chauffage de la pièce">
              <input
                type="checkbox"
                .checked=${roomOn}
                @change=${(e: Event) =>
                  this.hass.callService("switch", (e.target as HTMLInputElement).checked ? "turn_on" : "turn_off", {
                    entity_id: this._heatingSwitch,
                  })}
              />
              <span></span>
            </label>`
          : nothing}
      </div>
      ${h && !h.off && h.setpoint != null
        ? html`<div class="line setpoint">
            <span class="grow">
              Consigne
              ${h.override != null
                ? html`<span class="muted"> · surchargée (mode : ${h.group_setpoint ?? "—"} °C)</span>`
                : html`<span class="muted"> · du mode ${h.mode_name}</span>`}
            </span>
            <button class="round" ?disabled=${this._busy || h.setpoint <= h.min} @click=${() => this._setpoint(h.setpoint! - h.step)}>
              ${icon(mdiMinus)}
            </button>
            <span class="big">${fmt(this.hass, h.setpoint, 1, 1)} °C</span>
            <button class="round" ?disabled=${this._busy || h.setpoint >= h.max} @click=${() => this._setpoint(h.setpoint! + h.step)}>
              ${icon(mdiPlus)}
            </button>
          </div>
          ${h.override != null
            ? html`<div class="line">
                <span class="grow muted">La surcharge tombe au prochain changement de mode.</span>
                <button class="text" ?disabled=${this._busy} @click=${() => this._setpoint(null)}>Revenir au mode</button>
              </div>`
            : nothing}`
        : nothing}
      ${valves.length
        ? html`<div class="sources">
            ${valves.map((v) => {
              const st = this.hass.states[v];
              const a = st?.attributes ?? {};
              return html`<div class="source">
                <span>${friendly(this.hass, v)}</span>
                <span>
                  ${a.current_temperature != null ? `${fmt(this.hass, a.current_temperature)} °C` : ""}
                  ${a.temperature != null ? ` → ${fmt(this.hass, a.temperature)} °C` : ""}
                  · ${a.hvac_action === "heating" ? "chauffe" : st?.state === "off" ? "coupé" : (a.hvac_action ?? st?.state ?? "—")}
                </span>
              </div>`;
            })}
          </div>`
        : nothing}
    </section>`;
  }

  private _shutters() {
    const covers = roomCovers(this.room).filter((c) => this.hass.states[c]);
    if (!covers.length) return nothing;
    return html`<section>
      <h3>Volets</h3>
      ${covers.length > 1
        ? html`<div class="line">
            <span class="grow">Tous les volets</span>
            ${this._coverButtons(covers)}
          </div>`
        : nothing}
      ${covers.map((c) => {
        const st = this.hass.states[c];
        const pos = coverPosition(st);
        const positionable = typeof st.attributes.current_position === "number";
        return html`<div class="cover">
          <div class="line">
            <span class="grow">${friendly(this.hass, c)}</span>
            <span class="muted">${st.state === "opening" ? "s'ouvre" : st.state === "closing" ? "se ferme" : `${pos} %`}</span>
            ${this._coverButtons(c)}
          </div>
          ${positionable
            ? html`<input
                type="range"
                min="0"
                max="100"
                step="5"
                .value=${String(pos)}
                @change=${(e: Event) =>
                  this._cover("set_cover_position", c, { position: Number((e.target as HTMLInputElement).value) })}
              />`
            : nothing}
        </div>`;
      })}
    </section>`;
  }

  private _coverButtons(entity: string | string[]) {
    return html`<span class="buttons">
      <button class="round" title="Ouvrir" @click=${() => this._cover("open_cover", entity)}>${icon(mdiArrowCollapseUp)}</button>
      <button class="round" title="Stop" @click=${() => this._cover("stop_cover", entity)}>${icon(mdiStop)}</button>
      <button class="round" title="Fermer" @click=${() => this._cover("close_cover", entity)}>${icon(mdiArrowCollapseDown)}</button>
    </span>`;
  }

  render() {
    if (!this.hass || !this.room) return nothing;
    const body = [this._climate(), this._heatingSection(), this._shutters()].filter((s) => s !== nothing);
    return html`<div class="backdrop" @click=${this.close}></div>
      <div class="dialog" role="dialog" aria-modal="true" aria-label=${this.heading}>
        <header>
          <h2>${this.heading}</h2>
          <button class="round" title="Fermer" @click=${this.close}>${icon(mdiClose)}</button>
        </header>
        <div class="body">${body.length ? body : html`<p class="muted">Aucune donnée de climat, de chauffage ni de volet pour cette pièce.</p>`}</div>
      </div>`;
  }

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--ha-font-family-body, Roboto, sans-serif);
      color: var(--primary-text-color);
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
    }
    .dialog {
      position: relative;
      width: min(480px, calc(100vw - 32px));
      max-height: calc(100vh - 48px);
      display: flex;
      flex-direction: column;
      background: var(--ha-card-background, var(--card-background-color, #1c1c1c));
      border-radius: var(--ha-dialog-border-radius, 24px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      overflow: hidden;
    }
    header {
      display: flex;
      align-items: center;
      padding: 16px 16px 8px 24px;
    }
    h2 {
      flex: 1;
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    .body {
      overflow-y: auto;
      padding: 0 24px 20px;
    }
    section + section {
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
    }
    h3 {
      margin: 14px 0 8px;
      font-size: 13px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--secondary-text-color);
    }
    section {
      padding-bottom: 10px;
    }
    svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
    .metric {
      padding: 4px 0;
    }
    .mrow,
    .line {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 36px;
    }
    .micon {
      display: flex;
      color: var(--secondary-text-color);
    }
    .mlabel,
    .grow {
      flex: 1;
      min-width: 0;
    }
    .mvalue {
      font-weight: 500;
      font-size: 16px;
    }
    .big {
      font-weight: 500;
      font-size: 20px;
      min-width: 74px;
      text-align: center;
    }
    .sources {
      margin: 0 0 4px 28px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .source {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 2px 0;
    }
    .muted {
      color: var(--secondary-text-color);
      font-size: 12px;
    }
    .pill {
      --pill: var(--success-color, #43a047);
      font-size: 11px;
      font-weight: 500;
      padding: 1px 8px;
      border-radius: 9px;
      color: var(--pill);
      background: color-mix(in srgb, var(--pill) 18%, transparent);
    }
    .pill.l1 {
      --pill: var(--warning-color, #ffa600);
    }
    .pill.l2 {
      --pill: var(--error-color, #db4437);
    }
    .status {
      display: flex;
      color: var(--secondary-text-color);
    }
    .status.heat {
      color: var(--state-climate-heat-color, #ff8100);
    }
    .status.off {
      color: var(--error-color, #db4437);
    }
    button {
      font: inherit;
      color: inherit;
      cursor: pointer;
      border: none;
      background: none;
    }
    button:disabled {
      opacity: 0.4;
      cursor: default;
    }
    .round {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(127, 127, 127, 0.15);
      flex: none;
    }
    .text {
      color: var(--primary-color);
      font-weight: 500;
      padding: 6px 8px;
    }
    .buttons {
      display: inline-flex;
      gap: 4px;
    }
    .cover input[type="range"] {
      width: 100%;
      accent-color: var(--primary-color);
      margin: 0 0 6px;
    }
    .switch {
      position: relative;
      width: 40px;
      height: 22px;
      flex: none;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .switch span {
      position: absolute;
      inset: 0;
      border-radius: 11px;
      background: rgba(127, 127, 127, 0.4);
      cursor: pointer;
      transition: background 0.2s;
    }
    .switch span::before {
      content: "";
      position: absolute;
      width: 18px;
      height: 18px;
      left: 2px;
      top: 2px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.2s;
    }
    .switch input:checked + span {
      background: var(--state-climate-heat-color, #ff8100);
    }
    .switch input:checked + span::before {
      transform: translateX(18px);
    }
  `;
}

if (!customElements.get("homex-room-detail")) {
  customElements.define("homex-room-detail", HomexRoomDetail);
}
