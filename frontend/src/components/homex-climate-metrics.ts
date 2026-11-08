import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  HomeAssistant,
  MetricConfig,
  MetricKey,
  MetricRule,
  Room,
  RoomMetrics,
} from "../types";
import { errorMessage, fetchRooms, updateRoom } from "../api";
import { goBack, joinPath, navigate, segments } from "../lib/router";
import { sharedStyles } from "../lib/styles";
import { t } from "../lib/i18n";
import { entityArea } from "../lib/area";
import "./homex-select";

const CLIMATE_MODULE = "heating"; // the Climate module's key

interface MetricDef {
  key: MetricKey;
  label: () => string;
  icon: string;
  deviceClass: string;
  section: () => string;
}

const METRIC_DEFS: MetricDef[] = [
  {
    key: "temperature",
    label: () => t("climateMetrics.temperature"),
    icon: "🌡",
    deviceClass: "temperature",
    section: () => t("climateMetrics.temperature"),
  },
  {
    key: "humidity",
    label: () => t("climateMetrics.humidity"),
    icon: "💧",
    deviceClass: "humidity",
    section: () => t("climateMetrics.humidity"),
  },
  { key: "pm25", label: () => "PM2.5", icon: "🌫", deviceClass: "pm25", section: () => t("climateMetrics.air_quality") },
  { key: "pm10", label: () => "PM10", icon: "🌫", deviceClass: "pm10", section: () => t("climateMetrics.air_quality") },
  { key: "co2", label: () => "CO₂", icon: "🫧", deviceClass: "carbon_dioxide", section: () => "CO₂" },
];

const RULES: [MetricRule, () => string][] = [
  ["mean", () => t("climateMetrics.rule_mean")],
  ["max", () => t("climateMetrics.rule_max")],
  ["min", () => t("climateMetrics.rule_min")],
];

/** Combine (value, weight) pairs like the backend (sensor.py). */
function combine(values: [number, number][], rule: MetricRule): number | null {
  if (!values.length) return null;
  if (rule === "max") return Math.max(...values.map(([v]) => v));
  if (rule === "min") return Math.min(...values.map(([v]) => v));
  const total = values.reduce((n, [, w]) => n + w, 0);
  if (total <= 0) return values.reduce((n, [v]) => n + v, 0) / values.length;
  return values.reduce((n, [v, w]) => n + v * w, 0) / total;
}

/** Climate Manager → Metrics: the connected sensors of each Homex room and
 * how they combine into the room's reference temperature, humidity, ... */
@customElement("homex-climate-metrics")
export class HomexClimateMetrics extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  /** URL of the Metrics page (the rooms list). */
  @property({ attribute: false }) base = "";
  /** "" (rooms list) or "<room_id>" (that room's sensors). */
  @property({ attribute: false }) subpath = "";

  @state() private _rooms: Room[] = [];
  @state() private _loaded = false;
  @state() private _draft: RoomMetrics = {};
  @state() private _busy = false;
  private _draftFor: string | null = null;

  static styles = [
    sharedStyles,
    css`
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      .head h2 {
        flex: 1;
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
      .head button {
        min-height: 0;
        padding: 8px 12px;
        border-radius: 8px;
      }
      .list {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        overflow: hidden;
        background: var(--card-background-color, #1c1c1c);
      }
      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        cursor: pointer;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }
      .row:first-child {
        border-top: none;
      }
      .row:hover {
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.06));
      }
      .row.off {
        opacity: 0.45;
      }
      .row .info {
        flex: 1;
        min-width: 0;
      }
      .row .values {
        justify-content: flex-end;
      }
      .chevron {
        color: var(--secondary-text-color);
        font-size: 18px;
      }
      @media (max-width: 600px) {
        .row {
          flex-wrap: wrap;
        }
        .row .values {
          justify-content: flex-start;
          width: 100%;
        }
      }
      .name {
        font-size: 15px;
        font-weight: 500;
      }
      .meta {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .values {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .value {
        font-size: 13px;
        padding: 3px 9px;
        border-radius: 10px;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
      }
      .msg {
        padding: 24px 4px;
        color: var(--secondary-text-color);
      }
      .metric {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        padding: 12px 14px;
        margin-bottom: 12px;
      }
      .metric .rule {
        max-width: 320px;
        margin: 10px 0 4px;
      }
      .metric-head {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .metric-head .title {
        flex: 1;
        font-weight: 500;
      }
      .ref {
        font-size: 18px;
        font-weight: 500;
        color: var(--primary-color);
      }
      input {
        box-sizing: border-box;
        padding: 8px 10px;
        font-size: 14px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      .sensor {
        display: grid;
        grid-template-columns: 1fr auto auto auto;
        gap: 8px;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        font-size: 14px;
      }
      .sensor .cur {
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .sensor input {
        width: 72px;
      }
      .sensor button {
        min-height: 0;
        padding: 6px 10px;
      }
      .add {
        width: 100%;
        margin-top: 8px;
      }
      .section-title {
        font-size: 13px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--secondary-text-color);
        margin: 18px 0 8px;
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._load();
  }

  private async _load() {
    try {
      this._rooms = await fetchRooms(this.hass);
    } catch {
      this._rooms = [];
    }
    this._loaded = true;
  }

  private get _roomId(): string | null {
    return segments(this.subpath)[0] ?? null;
  }

  willUpdate() {
    const room = this._roomId ? this._rooms.find((r) => r.room_id === this._roomId) : null;
    if (!room) {
      this._draftFor = null;
      return;
    }
    if (this._draftFor !== room.room_id) {
      this._draftFor = room.room_id;
      this._draft = JSON.parse(JSON.stringify(room.metrics ?? {}));
      this._busy = false;
    }
  }

  private _hasClimate(room: Room): boolean {
    return (room.modules ?? []).includes(CLIMATE_MODULE);
  }

  private async _openRoom(room: Room) {
    if (!this._hasClimate(room)) {
      if (!confirm(t("climateMetrics.enable_module", { room: room.name }))) return;
      try {
        await updateRoom(this.hass, {
          entry_id: room.entry_id,
          modules: [...(room.modules ?? []), CLIMATE_MODULE],
        });
        await this._load();
      } catch (err) {
        alert(t("common.error", { message: errorMessage(err) }));
        return;
      }
    }
    navigate(joinPath(this.base, room.room_id));
  }

  // --- Sensors --------------------------------------------------------------

  private _friendly(entityId: string): string {
    return this.hass.states[entityId]?.attributes?.friendly_name || entityId;
  }
  private _current(entityId: string): string {
    const st = this.hass.states[entityId];
    if (!st || st.state === "unknown" || st.state === "unavailable") return "—";
    const unit = st.attributes?.unit_of_measurement;
    return unit ? `${st.state} ${unit}` : st.state;
  }

  /** Sensors of a metric's device class: the room area's first, then others
   * (alphabetical); Homex's own reference sensors excluded. */
  private _candidates(def: MetricDef, room: Room): { area: string[]; others: string[] } {
    const byName = (a: string, b: string) => this._friendly(a).localeCompare(this._friendly(b));
    const all = Object.keys(this.hass.states).filter(
      (id) =>
        id.startsWith("sensor.") &&
        !id.startsWith("sensor.homex_") &&
        this.hass.states[id]?.attributes?.device_class === def.deviceClass
    );
    const inArea = room.area_id
      ? all.filter((id) => entityArea(this.hass, id) === room.area_id).sort(byName)
      : [];
    const others = all.filter((id) => !inArea.includes(id)).sort(byName);
    return { area: inArea, others };
  }

  private _cfg(key: MetricKey): MetricConfig {
    return this._draft[key] ?? { sensors: [], rule: "mean" };
  }
  private _setCfg(key: MetricKey, cfg: MetricConfig) {
    this._draft = { ...this._draft, [key]: cfg };
  }
  private _addSensor(key: MetricKey, entityId: string) {
    if (!entityId) return;
    const cfg = this._cfg(key);
    if (cfg.sensors.some((s) => s.entity_id === entityId)) return;
    this._setCfg(key, { ...cfg, sensors: [...cfg.sensors, { entity_id: entityId, weight: 1 }] });
  }

  /** The reference value of a metric with the draft config (live preview). */
  private _reference(key: MetricKey): string {
    const cfg = this._cfg(key);
    const values: [number, number][] = [];
    let unit = "";
    for (const s of cfg.sensors) {
      const st = this.hass.states[s.entity_id];
      const v = parseFloat(st?.state);
      if (Number.isNaN(v)) continue;
      values.push([v, s.weight]);
      unit = unit || st.attributes?.unit_of_measurement || "";
    }
    const ref = combine(values, cfg.rule);
    return ref == null ? "—" : `${Math.round(ref * 10) / 10}${unit ? " " + unit : ""}`;
  }

  private async _save(room: Room) {
    this._busy = true;
    try {
      await updateRoom(this.hass, { entry_id: room.entry_id, metrics: this._draft });
      // The room reloads with its new reference sensors.
      this._draftFor = null;
      await this._load();
      goBack(this.base);
    } catch (err) {
      alert(t("common.error", { message: errorMessage(err) }));
      this._busy = false;
    }
  }

  private _renderMetric(def: MetricDef, room: Room) {
    const cfg = this._cfg(def.key);
    const { area, others } = this._candidates(def, room);
    const used = new Set(cfg.sensors.map((s) => s.entity_id));
    const areaName = room.area_id ? this.hass.areas?.[room.area_id]?.name : undefined;
    const sensorOpt = (id: string) => ({
      value: id,
      label: this._friendly(id),
      secondary: id,
      tertiary: this._current(id),
      disabled: used.has(id),
    });
    return html`<div class="metric">
      <div class="metric-head">
        <span class="title">${def.icon} ${def.label()}</span>
        ${cfg.sensors.length
          ? html`<span class="ref">${this._reference(def.key)}</span>`
          : ""}
      </div>
      ${cfg.sensors.length > 1
        ? html`<homex-select
            class="rule"
            label=${t("climateMetrics.rule_label")}
            .value=${cfg.rule}
            .options=${RULES.map(([v, l]) => ({ value: v, label: l() }))}
            @value-changed=${(e: CustomEvent) =>
              this._setCfg(def.key, { ...cfg, rule: e.detail.value as MetricRule })}
          ></homex-select>`
        : ""}
      ${cfg.sensors.map(
        (s, i) => html`<div class="sensor">
          <span>${this._friendly(s.entity_id)}</span>
          <span class="cur">${this._current(s.entity_id)}</span>
          ${cfg.rule === "mean" && cfg.sensors.length > 1
            ? html`<input
                type="number"
                min="0"
                step="0.1"
                title=${t("climateMetrics.weight")}
                .value=${String(s.weight)}
                @change=${(e: Event) => {
                  const w = Math.max(0, parseFloat((e.target as HTMLInputElement).value) || 0);
                  this._setCfg(def.key, {
                    ...cfg,
                    sensors: cfg.sensors.map((x, j) => (j === i ? { ...x, weight: w } : x)),
                  });
                }}
              />`
            : html`<span></span>`}
          <button
            title=${t("climateMetrics.remove")}
            @click=${() =>
              this._setCfg(def.key, {
                ...cfg,
                sensors: cfg.sensors.filter((_, j) => j !== i),
              })}
          >
            ✕
          </button>
        </div>`
      )}
      <homex-select
        class="add"
        placeholder=${t("climateMetrics.add_sensor")}
        value=""
        .groups=${[
          ...(area.length
            ? [{ label: t("climateMetrics.area", { area: areaName ?? room.area_id ?? "" }), options: area.map((id) => sensorOpt(id)) }]
            : []),
          { label: t("climateMetrics.others"), options: others.map((id) => sensorOpt(id)) },
        ]}
        @value-changed=${(e: CustomEvent) => {
          this._addSensor(def.key, e.detail.value);
          (e.target as HTMLElement & { value: string }).value = ""; // an action, not a value
        }}
      ></homex-select>
    </div>`;
  }

  private _renderRoom(room: Room) {
    let lastSection = "";
    return html`
      <div class="head">
        <button @click=${() => goBack(this.base)}>${t("climateMetrics.back_metrics")}</button>
        <h2>${room.name}</h2>
        <button class="primary" ?disabled=${this._busy} @click=${() => this._save(room)}>
          ${t("common.save")}
        </button>
      </div>
      ${METRIC_DEFS.map((def) => {
        const section = def.section();
        const title = section !== lastSection ? section : "";
        lastSection = section;
        return html`${title ? html`<div class="section-title">${title}</div>` : ""}
          ${this._renderMetric(def, room)}`;
      })}
    `;
  }

  /** The room's reference values (its sensor.homex_<room>_<metric> entities). */
  private _roomValues(room: Room) {
    const set = METRIC_DEFS.filter((d) => room.metrics?.[d.key]?.sensors?.length);
    if (!set.length) return html`<span class="meta">${t("climateMetrics.no_sensor")}</span>`;
    return html`<div class="values">
      ${set.map(
        (d) => html`<span class="value">
          ${d.icon} ${this._current(`sensor.homex_${room.room_id}_${d.key}`)}
        </span>`
      )}
    </div>`;
  }

  render() {
    if (!this._loaded) return html`<div class="msg">${t("common.loading")}</div>`;
    const roomId = this._roomId;
    if (roomId) {
      const room = this._rooms.find((r) => r.room_id === roomId);
      if (!room || !this._hasClimate(room)) {
        return html`<div class="head">
            <button @click=${() => goBack(this.base)}>${t("climateMetrics.back_metrics")}</button>
            <h2></h2>
          </div>
          <div class="msg">
            ${room ? t("climateMetrics.module_not_enabled") : t("climateMetrics.room_not_found", { room: roomId })}
          </div>`;
      }
      return this._renderRoom(room);
    }
    return html`
      <div class="head">
        <button @click=${() => this.dispatchEvent(new CustomEvent("close"))}>${t("climateMetrics.back_climate")}</button>
        <h2>${t("climateMetrics.title")}</h2>
      </div>
      <div class="list">
        ${this._rooms.map((room) => {
          const on = this._hasClimate(room);
          const area = room.area_id ? this.hass.areas?.[room.area_id]?.name : undefined;
          return html`<div class="row ${on ? "" : "off"}" @click=${() => this._openRoom(room)}>
            <div class="info">
              <div class="name">${room.name}</div>
              <div class="meta">${area ?? t("climateMetrics.no_ha_area")}</div>
            </div>
            ${on ? this._roomValues(room) : html`<span class="meta">${t("climateMetrics.module_disabled")}</span>`}
            <span class="chevron">›</span>
          </div>`;
        })}
      </div>
    `;
  }
}
