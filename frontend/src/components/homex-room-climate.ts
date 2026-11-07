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
import { radiatorClimate } from "../lib/climate";
import { navigate } from "../lib/router";
import { sharedStyles } from "../lib/styles";
import "./homex-radiator-dialog";

const METRICS: { key: MetricKey; icon: string; label: string }[] = [
  { key: "temperature", icon: "🌡", label: "Température" },
  { key: "humidity", icon: "💧", label: "Humidité" },
  { key: "pm25", icon: "🌫", label: "PM2.5" },
  { key: "pm10", icon: "🌫", label: "PM10" },
  { key: "co2", icon: "🫧", label: "CO₂" },
];
const RULE_LABELS: Record<string, string> = {
  mean: "moyenne pondérée",
  max: "max",
  min: "min",
};
// hvac_action when the valve reports it, else its HVAC mode.
const ACTION_LABELS: Record<string, string> = {
  heating: "🔥 Chauffe",
  idle: "En veille",
  off: "Éteint",
  preheating: "Préchauffe",
  heat: "Mode chauffage",
  auto: "Mode auto",
};

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
        <span class="section">Metrics</span>
        <button @click=${() => navigate(`/homex/climate/metrics/${r.room_id}`)}>
          Configurer
        </button>
      </div>
      ${set.length
        ? html`<div class="metrics">
            ${set.map((m) => {
              const cfg = r.metrics![m.key]!;
              return html`<div class="metric">
                <div class="muted">${m.icon} ${m.label}</div>
                <div class="v">${this._state(`sensor.homex_${r.room_id}_${m.key}`)}</div>
                <div class="muted">
                  ${cfg.sensors.length} capteur(s) · ${RULE_LABELS[cfg.rule] ?? cfg.rule}
                </div>
              </div>`;
            })}
          </div>`
        : html`<div class="empty">Aucun capteur : « Configurer » pour en ajouter.</div>`}
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
      alert("Erreur Homex : " + errorMessage(err));
    } finally {
      this._switching = false;
    }
  }

  private async _remove(index: number) {
    const radiators = [...(this.room.heating?.radiators ?? [])];
    const name = this.hass.devices?.[radiators[index]?.device_id]?.name ?? "ce radiateur";
    if (!confirm(`Retirer ${name} de la pièce ?`)) return;
    radiators.splice(index, 1);
    try {
      await updateRoom(this.hass, { entry_id: this.room.entry_id, heating: { ...this.room.heating, radiators } });
      fireChanged(this);
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
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
    const fmt = (t: unknown) => (t == null ? "—" : `${t} ${unit}`);
    const preset = this._devicePresets.find((p) => p.id === rad.preset_id);
    const ext = rad.external_sensor
      ? this.hass.states[rad.external_sensor]?.attributes?.friendly_name || rad.external_sensor
      : "";
    return html`<div class="row">
      <div class="info">
        <div class="name">${dev?.name_by_user || dev?.name || rad.device_id}</div>
        <div class="muted">
          ${preset ? `Preset : ${preset.name}` : "Aucun preset"}
          ${ext ? html` · Capteur : ${ext}` : ""}
        </div>
      </div>
      <span class=${action === "heating" ? "heating" : "muted"}>
        ${!st || st.state === "unavailable" ? "Indisponible" : ACTION_LABELS[action] ?? action}
      </span>
      <div class="temps">
        <span title="Température de consigne">🎯 ${fmt(a.temperature)}</span>
        <span title="Température actuelle">🌡 ${fmt(a.current_temperature)}</span>
      </div>
      <button title="Modifier" @click=${() => (this._dialogIndex = index)}>✏️</button>
      <button title="Retirer" @click=${() => this._remove(index)}>✕</button>
    </div>`;
  }

  private _renderHeating() {
    const radiators = this.room.heating?.radiators ?? [];
    return html`
      <div class="section-row">
        <span class="section">Heating</span>
        ${radiators.length
          ? html`<label
              class="room-switch ${this._roomOn ? "on" : ""}"
              title=${this._roomOn
                ? "Désactiver : la pièce passe en Unheated, ses vannes sur off"
                : "Activer : la pièce reprend le mode de sa zone"}
            >
              ${this._roomOn ? "Chauffage activé" : "Chauffage désactivé"}
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
        <button @click=${() => (this._dialogIndex = -1)}>＋ Radiateur</button>
      </div>
      ${radiators.length
        ? radiators.map((_, i) => this._renderRadiator(i))
        : html`<div class="empty">Aucun radiateur.</div>`}
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
