import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  HeatingDevicePreset,
  HomeAssistant,
  MetricKey,
  Room,
} from "../types";
import { fireChanged } from "../types";
import { errorMessage, fetchHeating, updateRoom } from "../api";
import { radiatorClimate, valveStuck } from "../lib/climate";
import { navigate } from "../lib/router";
import { sharedStyles } from "../lib/styles";
import { t } from "../lib/i18n";
import "./homex-radiator-dialog";

// Labels are catalog keys (roomClimate.metric_<key>), resolved at render.
const METRICS: { key: MetricKey; icon: string }[] = [
  { key: "temperature", icon: "🌡" },
  { key: "humidity", icon: "💧" },
  { key: "pm25", icon: "🌫" },
  { key: "pm10", icon: "🌫" },
  { key: "co2", icon: "🫧" },
];
const RULES = ["mean", "max", "min"];
const ruleLabel = (rule: string) => (RULES.includes(rule) ? t(`roomClimate.rule_${rule}`) : rule);
// hvac_action when the valve reports it, else its HVAC mode.
const ACTIONS = ["heating", "idle", "off", "preheating", "heat", "auto"];
const actionLabel = (action: string) =>
  ACTIONS.includes(action) ? t(`roomClimate.action_${action}`) : action;

/** The Climate tab of a room card: its Metrics (reference values and
 * sensors), then Heating (zone and radiators with their live state). */
@customElement("homex-room-climate")
export class HomexRoomClimate extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) room!: Room;

  @state() private _devicePresets: HeatingDevicePreset[] = [];
  @state() private _dialogIndex: number | null = null; // -1 = add
  @state() private _switching = false;

  static styles = [
    sharedStyles,
    css`
      .section-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin: 16px 0 8px;
      }
      .section-row .section {
        margin: 0;
      }
      .section-row button,
      .row button {
        min-height: 0;
        padding: 6px 12px;
      }
      .section-row .room-switch {
        margin-left: auto;
      }
      .room-switch {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .room-switch.on {
        color: var(--state-climate-heat-color, #ff8100);
      }
      .toggle {
        position: relative;
        width: 36px;
        height: 20px;
        border-radius: 10px;
        background: var(--disabled-color, #888);
        transition: background 0.2s;
      }
      .toggle.on {
        background: var(--state-climate-heat-color, #ff8100);
      }
      .toggle input {
        position: absolute;
        inset: 0;
        opacity: 0;
        margin: 0;
        cursor: pointer;
      }
      .knob {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #fff;
        transition: transform 0.2s;
        pointer-events: none;
      }
      .toggle.on .knob {
        transform: translateX(16px);
      }
      .metrics {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .metric {
        padding: 8px 12px;
        border-radius: 10px;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
      }
      .metric .v {
        font-size: 16px;
        font-weight: 500;
      }
      .muted {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }
      .row .info {
        flex: 1;
        min-width: 0;
      }
      .row .name {
        font-weight: 500;
      }
      .temps {
        display: flex;
        gap: 12px;
        font-size: 14px;
        white-space: nowrap;
      }
      .warning {
        color: var(--warning-color, #ffa600);
        cursor: help;
      }
      .heating {
        color: var(--state-climate-heat-color, #ff8100);
        font-weight: 500;
      }
      .empty {
        font-size: 14px;
        color: var(--secondary-text-color);
        padding: 8px 0;
      }
      @media (max-width: 600px) {
        .row {
          flex-wrap: wrap;
          row-gap: 6px;
        }
        /* Name + preset on their own line; state, temperatures, actions below. */
        .row .info {
          flex-basis: 100%;
        }
        .row .temps {
          margin-left: auto;
        }
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._load();
  }

  private async _load() {
    try {
      this._devicePresets = (await fetchHeating(this.hass)).device_presets ?? [];
    } catch {
      this._devicePresets = [];
    }
  }

  private _state(id: string) {
    const st = this.hass.states[id];
    if (!st || st.state === "unknown" || st.state === "unavailable") return "—";
    const unit = st.attributes?.unit_of_measurement;
    return unit ? `${st.state} ${unit}` : st.state;
  }

  // --- Metrics -------------------------------------------------------------

  private _renderMetrics() {
    const r = this.room;
    const set = METRICS.filter((m) => r.metrics?.[m.key]?.sensors?.length);
    return html`
      <div class="section-row">
        <span class="section">${t("roomClimate.metrics")}</span>
        <button @click=${() => navigate(`/homex/climate/metrics/${r.room_id}`)}>
          ${t("roomClimate.configure")}
        </button>
      </div>
      ${set.length
        ? html`<div class="metrics">
            ${set.map((m) => {
              const cfg = r.metrics![m.key]!;
              return html`<div class="metric">
                <div class="muted">${m.icon} ${t(`roomClimate.metric_${m.key}`)}</div>
                <div class="v">${this._state(`sensor.homex_${r.room_id}_${m.key}`)}</div>
                <div class="muted">
                  ${t("roomClimate.sensor_count", { count: cfg.sensors.length })} · ${ruleLabel(cfg.rule)}
                </div>
              </div>`;
            })}
          </div>`
        : html`<div class="empty">${t("roomClimate.no_sensors")}</div>`}
    `;
  }

  // --- Heating -------------------------------------------------------------

  private get _roomOn(): boolean {
    return this.room.heating?.enabled !== false;
  }

  /** The room's own heating: off = Unheated (valves off), on = zone mode. */
  private async _setRoomHeating(enabled: boolean) {
    this._switching = true;
    try {
      await updateRoom(this.hass, {
        entry_id: this.room.entry_id,
        heating: { radiators: this.room.heating?.radiators ?? [], enabled },
      });
      fireChanged(this);
    } catch (err) {
      alert(t("common.error", { message: errorMessage(err) }));
    } finally {
      this._switching = false;
    }
  }

  private async _remove(index: number) {
    const radiators = [...(this.room.heating?.radiators ?? [])];
    const name = this.hass.devices?.[radiators[index]?.device_id]?.name ?? t("roomClimate.this_radiator");
    if (!confirm(t("roomClimate.confirm_remove", { name }))) return;
    radiators.splice(index, 1);
    try {
      await updateRoom(this.hass, { entry_id: this.room.entry_id, heating: { ...this.room.heating, radiators } });
      fireChanged(this);
    } catch (err) {
      alert(t("common.error", { message: errorMessage(err) }));
    }
  }

  private _renderRadiator(index: number) {
    const rad = this.room.heating!.radiators[index];
    const dev = this.hass.devices?.[rad.device_id];
    const climate = radiatorClimate(this.hass, rad.device_id);
    const st = climate ? this.hass.states[climate] : undefined;
    const a = st?.attributes ?? {};
    const action = a.hvac_action ?? st?.state;
    const unit = this.hass.config?.unit_system?.temperature ?? "°C";
    const fmt = (v: unknown) => (v == null ? "—" : `${v} ${unit}`);
    const preset = this._devicePresets.find((p) => p.id === rad.preset_id);
    const ext = rad.external_sensor
      ? this.hass.states[rad.external_sensor]?.attributes?.friendly_name || rad.external_sensor
      : "";
    return html`<div class="row">
      <div class="info">
        <div class="name">${dev?.name_by_user || dev?.name || rad.device_id}</div>
        <div class="muted">
          ${preset ? t("roomClimate.preset", { name: preset.name }) : t("roomClimate.no_preset")}
          ${ext ? html` · ${t("roomClimate.sensor", { name: ext })}` : ""}
        </div>
      </div>
      <span class=${action === "heating" ? "heating" : "muted"}>
        ${!st || st.state === "unavailable" ? t("roomClimate.unavailable") : actionLabel(action)}
        ${valveStuck(st)
          ? html`<span
              class="warning"
              title=${t("roomClimate.valve_stuck")}
              >⚠</span
            >`
          : ""}
      </span>
      <div class="temps">
        <span title=${t("roomClimate.target_temp")}>🎯 ${fmt(a.temperature)}</span>
        <span title=${t("roomClimate.current_temp")}>🌡 ${fmt(a.current_temperature)}</span>
      </div>
      <button title=${t("common.edit")} @click=${() => (this._dialogIndex = index)}>✏️</button>
      <button title=${t("roomClimate.remove")} @click=${() => this._remove(index)}>✕</button>
    </div>`;
  }

  private _renderHeating() {
    const radiators = this.room.heating?.radiators ?? [];
    return html`
      <div class="section-row">
        <span class="section">${t("roomClimate.heating")}</span>
        ${radiators.length
          ? html`<label
              class="room-switch ${this._roomOn ? "on" : ""}"
              title=${this._roomOn
                ? t("roomClimate.disable_hint")
                : t("roomClimate.enable_hint")}
            >
              ${this._roomOn ? t("roomClimate.heating_on") : t("roomClimate.heating_off")}
              <span class="toggle ${this._roomOn ? "on" : ""}">
                <input
                  type="checkbox"
                  .checked=${this._roomOn}
                  ?disabled=${this._switching}
                  @change=${(e: Event) =>
                    this._setRoomHeating((e.target as HTMLInputElement).checked)}
                />
                <span class="knob"></span>
              </span>
            </label>`
          : ""}
        <button @click=${() => (this._dialogIndex = -1)}>＋ ${t("roomClimate.add_radiator")}</button>
      </div>
      ${radiators.length
        ? radiators.map((_, i) => this._renderRadiator(i))
        : html`<div class="empty">${t("roomClimate.no_radiators")}</div>`}
    `;
  }

  render() {
    return html`
      ${this._renderMetrics()} ${this._renderHeating()}
      <homex-radiator-dialog
        .hass=${this.hass}
        .room=${this.room}
        .index=${this._dialogIndex ?? -1}
        .open=${this._dialogIndex !== null}
        @dialog-closed=${() => (this._dialogIndex = null)}
      ></homex-radiator-dialog>
    `;
  }
}
