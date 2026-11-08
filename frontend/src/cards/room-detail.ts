/** The room detail modal of homex-room-tile: climate readings with their
 * sensors, heating (room switch, setpoint override, valves) and shutters,
 * per what the room has. Appended to document.body (outside dashboards'
 * stacking contexts). */
import { LitElement, css, html, nothing, type PropertyValues } from "lit";
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
  airLevel,
  coverPosition,
  fmt,
  icon,
  levelName,
  roomCovers,
  roomMetric,
  roomValves,
  type AirKey,
} from "./shared";
import { loadLanguageSetting, onLanguageChange, syncHass, t } from "../lib/i18n";

interface HeatingStatus {
  enabled: boolean;
  room_enabled: boolean;
  mode: string;
  mode_name: string;
}

/** `label`: a translation key, or for air metrics the label itself (symbols). */
const METRICS: { key: string; label: string; path: string; air?: AirKey; digits: number }[] = [
  { key: "temperature", label: "cardRoomDetail.temperature", path: mdiThermometer, digits: 1 },
  { key: "humidity", label: "cardRoomDetail.humidity", path: mdiWaterPercent, digits: 0 },
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
  private _unlisten?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this._keydown = this._keydown.bind(this);
    window.addEventListener("keydown", this._keydown);
    this._unlisten = onLanguageChange(() => this.requestUpdate());
    this._loadHeating();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._keydown);
    this._unlisten?.();
    this._unlisten = undefined;
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

  willUpdate(changed: PropertyValues) {
    if (changed.has("hass") && this.hass) {
      syncHass(this.hass);
      loadLanguageSetting(this.hass);
    }
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

  /** The radiators' target temperature, set directly on the valves (not
   * Homex's setpoint settings). */
  private async _setpoint(valves: string[], value: number) {
    this._busy = true;
    try {
      await this.hass.callService("climate", "set_temperature", { entity_id: valves, temperature: value });
    } finally {
      this._busy = false;
    }
  }

  private _cover(service: string, entity_id: string | string[], data: object = {}) {
    this.hass.callService("cover", service, { entity_id, ...data });
  }

  // -- Sections ---------------------------------------------------------------

  /** The room's climate on 3 lines at most: temperature · humidity, CO₂,
   * PM2.5 · PM10 — values and air levels only. */
  private _climate() {
    const room = this.room.room_id;
    const v = (key: string) => roomMetric(this.hass, room, key);
    const item = (key: string) => {
      const m = METRICS.find((x) => x.key === key)!;
      const val = v(key);
      if (!val) return undefined;
      const unit = key === "humidity" ? "%" : (val.unit ?? "");
      const lvl = m.air ? airLevel(m.air, val.value).level : undefined;
      const label = m.air ? m.label : t(m.label);
      return html`<span class="item" title=${label}>
        <span class="micon">${icon(m.path)}</span>
        ${m.air === "pm25" || m.air === "pm10" ? html`<span class="tag">${m.label.slice(2)}</span>` : nothing}
        <span class="mvalue">${fmt(this.hass, val.value, m.digits, key === "temperature" ? 1 : 0)} ${unit}</span>
        ${lvl !== undefined ? html`<span class="pill l${lvl}">${levelName(lvl)}</span>` : nothing}
      </span>`;
    };
    const lines = [
      [item("temperature"), item("humidity")],
      [item("co2")],
      [item("pm25"), item("pm10")],
    ]
      .map((l) => l.filter((x) => x))
      .filter((l) => l.length);
    if (!lines.length) return nothing;
    return html`<section>
      <h3>${t("cardRoomDetail.climate")}</h3>
      ${lines.map((l) => html`<div class="mline">${l}</div>`)}
    </section>`;
  }

  private _heatingSection() {
    if (!this.room.heating?.radiators?.length) return nothing;
    const sw = this.hass.states[this._heatingSwitch];
    const h = this._heating;
    const valves = roomValves(this.hass, this.room).filter((v) => this.hass.states[v]);
    const demand = valves.some((v) => this.hass.states[v]?.attributes.hvac_action === "heating");
    const roomOn = sw ? sw.state === "on" : h?.room_enabled !== false;
    // The radiators' target (the first valve's; they share the room's).
    const a = valves.length ? this.hass.states[valves[0]].attributes : undefined;
    const target = typeof a?.temperature === "number" ? (a.temperature as number) : undefined;
    const step = (a?.target_temp_step as number) || 0.5;
    const min = (a?.min_temp as number) ?? 5;
    const max = (a?.max_temp as number) ?? 30;
    const status = !roomOn
      ? { cls: "off", path: mdiFireOff, text: t("cardRoomDetail.off") }
      : demand
        ? { cls: "heat", path: mdiFire, text: t("cardRoomDetail.heating") }
        : { cls: "", path: mdiFire, text: t("cardRoomDetail.idle") };
    return html`<section class="heating">
      <div class="head">
        <h3>${t("cardRoomDetail.section_heating")}</h3>
        ${sw
          ? html`<label class="switch" title=${roomOn ? t("cardRoomDetail.stop_heating_room") : t("cardRoomDetail.heat_room")}>
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
      <div class="hbody">
      <div class="hstatus">
        <span class="status big-icon ${status.cls}">${icon(status.path)}</span>
        <span class="htext">
          <span class="hstate">${roomOn ? t("cardRoomDetail.room_heated") : t("cardRoomDetail.room_unheated")}</span>
          <span class="secondary">${status.text}</span>
        </span>
      </div>
      ${target !== undefined
        ? html`<div
            class="setpoint ${roomOn ? "" : "inactive"}"
            title=${roomOn ? t("cardRoomDetail.setpoint_kept") : t("cardRoomDetail.room_unheated")}
          >
            <span class="muted">${t("cardRoomDetail.setpoint")}</span>
            <button
              class="round"
              title=${t("cardRoomDetail.raise")}
              ?disabled=${!roomOn || this._busy || target + step > max}
              @click=${() => this._setpoint(valves, target + step)}
            >
              ${icon(mdiPlus)}
            </button>
            <span class="big">${fmt(this.hass, target, 1, 1)} °C</span>
            <button
              class="round"
              title=${t("cardRoomDetail.lower")}
              ?disabled=${!roomOn || this._busy || target - step < min}
              @click=${() => this._setpoint(valves, target - step)}
            >
              ${icon(mdiMinus)}
            </button>
          </div>`
        : nothing}
      ${h
        ? html`<div class="hmode muted">
            ${roomOn ? `${t("cardRoomDetail.mode", { name: h.mode_name })}${h.enabled ? "" : t("cardRoomDetail.global_off")}` : "—"}
          </div>`
        : nothing}
      </div>
    </section>`;
  }

  private _shutters() {
    const covers = roomCovers(this.room).filter((c) => this.hass.states[c]);
    if (!covers.length) return nothing;
    const label = (st: any) => {
      if (st.state === "opening") return t("cardRoomDetail.opening");
      if (st.state === "closing") return t("cardRoomDetail.closing");
      const pos = coverPosition(st);
      return pos === 0
        ? t("cardRoomDetail.closed")
        : pos === 100
          ? t("cardRoomDetail.open")
          : t("cardRoomDetail.partial", { pos });
    };
    const columns = [
      ...(covers.length > 1 ? [{ title: t("cardRoomDetail.all"), state: "", entity: covers as string | string[] }] : []),
      ...covers.map((c, i) => ({
        title: covers.length > 1 ? t("cardRoomDetail.shutter_n", { n: i + 1 }) : "",
        state: label(this.hass.states[c]),
        entity: c as string | string[],
      })),
    ];
    return html`<section>
      <h3>${t("cardRoomDetail.shutters")}</h3>
      <div class="covers">
        ${columns.map(
          (col) => html`<div class="cover ${col.state ? "" : "all"}">
            ${col.title ? html`<div class="ctitle">${col.title}</div>` : nothing}
            <div class="cstate">${col.state || "\u00a0"}</div>
            <button class="big-btn" title=${t("cardRoomDetail.open_action")} @click=${() => this._cover("open_cover", col.entity)}>
              ${icon(mdiArrowCollapseUp)}
            </button>
            <button class="big-btn" title=${t("cardRoomDetail.stop_action")} @click=${() => this._cover("stop_cover", col.entity)}>
              ${icon(mdiStop)}
            </button>
            <button class="big-btn" title=${t("cardRoomDetail.close_action")} @click=${() => this._cover("close_cover", col.entity)}>
              ${icon(mdiArrowCollapseDown)}
            </button>
          </div>`
        )}
      </div>
    </section>`;
  }

  render() {
    if (!this.hass || !this.room) return nothing;
    const climate = this._climate();
    // Shutters and heating side by side (stacked on narrow screens).
    const cols = [this._shutters(), this._heatingSection()].filter((s) => s !== nothing);
    const body = [
      ...(climate !== nothing ? [climate] : []),
      ...(cols.length ? [html`<div class="cols ${cols.length > 1 ? "two" : ""}">${cols}</div>`] : []),
    ];
    return html`<div class="backdrop" @click=${this.close}></div>
      <div class="dialog ${cols.length > 1 ? "wide" : ""}" role="dialog" aria-modal="true" aria-label=${this.heading}>
        <header>
          <h2>${this.heading}</h2>
          <button class="round" title=${t("common.close")} @click=${this.close}>${icon(mdiClose)}</button>
        </header>
        <div class="body">${body.length ? body : html`<p class="muted">${t("cardRoomDetail.no_data")}</p>`}</div>
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
    .dialog.wide {
      width: min(680px, calc(100vw - 32px));
    }
    .cols {
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
    }
    .body > .cols:first-child {
      border-top: none;
    }
    .cols.two {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
    .cols.two > section + section {
      border-top: none;
      border-left: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
      padding-left: 20px;
      margin-left: 20px;
    }
    /* Both columns: title on top, content vertically centred below. */
    .cols.two > section {
      display: flex;
      flex-direction: column;
    }
    .cols.two .covers,
    .cols.two .hbody {
      flex: 1;
    }
    .cols.two .covers {
      align-content: center;
      align-items: center;
    }
    .hbody {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-top: 10px;
    }
    .heating .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .hstatus {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
    }
    .big-icon svg {
      width: 36px;
      height: 36px;
    }
    .htext {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .secondary {
      color: var(--secondary-text-color);
    }
    .setpoint.inactive .big {
      color: var(--disabled-text-color, #6f6f6f);
    }
    .hmode {
      margin-top: 12px;
      text-align: center;
    }
    .hstate {
      font-weight: 500;
      font-size: 14px;
    }
    .setpoint {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      margin-top: 14px;
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
    .body > section + .cols,
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
    .mline {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px 20px;
      min-height: 32px;
    }
    .item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .tag {
      font-size: 10px;
      color: var(--secondary-text-color);
      margin-left: -4px;
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
      --pill: var(--secondary-text-color, #9e9e9e);
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
    .covers {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
    }
    .cover {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-width: 84px;
    }
    .cover.all {
      padding-right: 12px;
      border-right: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
    }
    .ctitle {
      font-weight: 500;
      font-size: 13px;
    }
    .cstate {
      font-size: 12px;
      color: var(--secondary-text-color);
      min-height: 16px;
    }
    .big-btn {
      width: 64px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(127, 127, 127, 0.15);
    }
    .big-btn:hover {
      background: rgba(127, 127, 127, 0.25);
    }
    .big-btn svg {
      width: 26px;
      height: 26px;
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
    /* Phones: shutters and heating stay side by side, everything smaller. */
    @media (max-width: 600px) {
      .body {
        padding: 0 14px 14px;
      }
      header {
        padding: 12px 12px 4px 16px;
      }
      h3 {
        font-size: 11px;
        margin: 10px 0 6px;
      }
      .cols.two > section + section {
        padding-left: 10px;
        margin-left: 10px;
      }
      .covers {
        gap: 6px;
      }
      .cover {
        min-width: 0;
        gap: 5px;
      }
      .cover.all {
        padding-right: 6px;
      }
      .ctitle {
        font-size: 11px;
      }
      .cstate {
        font-size: 10px;
      }
      .big-btn {
        width: 40px;
        height: 38px;
        border-radius: 10px;
      }
      .big-btn svg {
        width: 20px;
        height: 20px;
      }
      .switch {
        transform: scale(0.85);
        transform-origin: right center;
      }
      .hstatus {
        gap: 8px;
        font-size: 11px;
      }
      .big-icon svg {
        width: 26px;
        height: 26px;
      }
      .hstate {
        font-size: 12px;
      }
      .muted {
        font-size: 11px;
      }
      .setpoint {
        margin-top: 10px;
        gap: 4px;
      }
      .big {
        font-size: 17px;
        min-width: 0;
      }
      .round {
        width: 32px;
        height: 32px;
      }
      .mvalue {
        font-size: 14px;
      }
    }
  `;
}

if (!customElements.get("homex-room-detail")) {
  customElements.define("homex-room-detail", HomexRoomDetail);
}
