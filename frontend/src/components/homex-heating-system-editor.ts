import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { CirculationRule, HeatingSystem, HeatingZone, HomeAssistant } from "../types";
import { deleteHeatingSystem, errorMessage, saveHeatingSystem } from "../api";
import { sharedStyles } from "../lib/styles";
import { t } from "../lib/i18n";
import { textField, toggleSwitch } from "../lib/fields";
import { slugify } from "../lib/slug";
import "./homex-select";
import type { SelectGroup } from "./homex-select";

const GLOBAL = "global";
const CONTACT_DOMAINS = ["switch", "input_boolean"];
const SETPOINT_DOMAINS = ["input_number", "number"];
type TankKey = "setpoint_sensor" | "tank_sensor" | "flow_sensor" | "return_sensor";
type RuleType = CirculationRule["type"];
interface RuleDraft {
  type: RuleType;
  delta: string;
  tolerance: string;
}
const TANK_SENSORS: [TankKey, () => string][] = [
  ["setpoint_sensor", () => t("heatingSystemEditor.sensor_setpoint")],
  ["tank_sensor", () => t("heatingSystemEditor.sensor_tank")],
  ["flow_sensor", () => t("heatingSystemEditor.sensor_flow")],
  ["return_sensor", () => t("heatingSystemEditor.sensor_return")],
];
/** Per rule type: label, the gap's sensors (a - b) and their short names. */
const RULES: Record<
  RuleType,
  { label: () => string; add: () => string; gap: [TankKey, TankKey]; a: () => string; b: () => string; init: [string, string] }
> = {
  setpoint_tank: {
    label: () => t("heatingSystemEditor.rule_setpoint_tank"),
    add: () => t("heatingSystemEditor.add_rule_setpoint_tank"),
    gap: ["setpoint_sensor", "tank_sensor"],
    a: () => t("heatingSystemEditor.short_setpoint"),
    b: () => t("heatingSystemEditor.short_tank"),
    init: ["6", "3"],
  },
  flow_return: {
    label: () => t("heatingSystemEditor.rule_flow_return"),
    add: () => t("heatingSystemEditor.add_rule_flow_return"),
    gap: ["flow_sensor", "return_sensor"],
    a: () => t("heatingSystemEditor.short_flow"),
    b: () => t("heatingSystemEditor.short_return"),
    init: ["10", "5"],
  },
};
const LEGACY_RULES: Record<string, RuleType> = { delta: "setpoint_tank" };
// Heat pumps are no longer offered (legacy documents still load).
const TYPES: [HeatingSystem["type"], () => string][] = [
  ["boiler", () => t("heatingSystemEditor.type_boiler")],
  ["buffer_tank", () => t("heatingSystemEditor.type_buffer_tank")],
];

/** Editor of a heating system: a boiler (dry contact) or a buffer tank
 * (sensors, circulator, circulation rules); both have a scope and an
 * agressive mode. */
@customElement("homex-heating-system-editor")
export class HomexHeatingSystemEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) system: HeatingSystem | null = null;
  @property({ attribute: false }) zones: HeatingZone[] = [];

  @state() private _sysName = "";
  @state() private _id = "";
  @state() private _type: HeatingSystem["type"] = "boiler";
  @state() private _contact = "";
  @state() private _zones: string[] = [GLOBAL];
  @state() private _aggressive = false;
  @state() private _tank: Record<TankKey, string> = {
    setpoint_sensor: "",
    tank_sensor: "",
    flow_sensor: "",
    return_sensor: "",
  };
  @state() private _circulator = "";
  @state() private _minRuntime = "5";
  @state() private _rules: RuleDraft[] = [];
  @state() private _busy = false;
  private _idEdited = false;

  static styles = [
    sharedStyles,
    css`
      .hint {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin: 4px 0 8px;
      }
      .btn-group {
        display: inline-flex;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        overflow: hidden;
      }
      .btn-group button {
        min-height: 0;
        padding: 8px 16px;
        border-radius: 0;
        background: transparent;
      }
      .btn-group button + button {
        border-left: 1px solid var(--divider-color, #ccc);
      }
      .btn-group button.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .tank-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      @media (max-width: 600px) {
        .tank-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .num {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .num input {
        box-sizing: border-box;
        width: 100%;
        min-height: 44px;
        padding: 8px 12px;
        font: inherit;
        font-size: 15px;
        color: var(--primary-text-color);
        background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
        border: 1px solid transparent;
        border-radius: 12px;
      }
      .num input:focus {
        outline: none;
        border-color: var(--primary-color);
      }
      .rule {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
        align-items: end;
        gap: 12px;
        padding: 12px;
        margin-bottom: 8px;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
        border-radius: 12px;
      }
      .rule .title {
        grid-column: 1 / -1;
        font-weight: 500;
      }
      .rule .explain {
        grid-column: 1 / -1;
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .rule .explain.err {
        color: var(--error-color, #db4437);
      }
      .rule-add {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .checks label {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 0;
        font-size: 14px;
        cursor: pointer;
      }
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("system")) {
      const s = this.system;
      this._sysName = s?.name ?? "";
      this._id = s?.id ?? "";
      this._type = s?.type ?? "boiler";
      this._contact = s?.contact ?? "";
      this._zones = [...(s?.zones?.length ? s.zones : [GLOBAL])];
      this._aggressive = s?.aggressive ?? false;
      this._tank = {
        setpoint_sensor: s?.setpoint_sensor ?? "",
        tank_sensor: s?.tank_sensor ?? "",
        flow_sensor: s?.flow_sensor ?? "",
        return_sensor: s?.return_sensor ?? "",
      };
      this._circulator = s?.circulator ?? "";
      this._minRuntime = String(s?.min_runtime ?? 5);
      this._rules = (s?.rules ?? []).map((r) => ({
        type: LEGACY_RULES[r.type] ?? r.type,
        delta: String(r.delta),
        tolerance: String(r.tolerance),
      }));
      this._idEdited = !!s;
      this._busy = false;
    }
  }

  private get _contacts(): string[] {
    const name = (id: string) => this.hass.states[id]?.attributes?.friendly_name || id;
    return Object.keys(this.hass.states)
      .filter((id) => CONTACT_DOMAINS.includes(id.split(".")[0]))
      .sort((a, b) => name(a).localeCompare(name(b)));
  }

  private _name(id: string): string {
    return this.hass.states[id]?.attributes?.friendly_name || id;
  }

  /** Entities as select groups by Home Assistant area (named areas first). */
  private _grouped(ids: string[]): SelectGroup[] {
    const byArea = new Map<string, string[]>();
    for (const id of ids) {
      const ent = this.hass.entities?.[id] as any;
      const area = ent?.area_id || (ent?.device_id && this.hass.devices?.[ent.device_id]?.area_id) || "";
      byArea.set(area, [...(byArea.get(area) ?? []), id]);
    }
    const label = (a: string) => (a ? this.hass.areas?.[a]?.name ?? a : t("heatingSystemEditor.no_area"));
    return [...byArea.entries()]
      .sort(([a], [b]) => (!a ? 1 : !b ? -1 : label(a).localeCompare(label(b))))
      .map(([a, list]) => ({
        label: label(a),
        options: list
          .sort((x, y) => this._name(x).localeCompare(this._name(y)))
          .map((id) => {
            const st = this.hass.states[id];
            const unit = st?.attributes?.unit_of_measurement ?? "";
            return {
              value: id,
              label: this._name(id),
              secondary: id,
              tertiary: st ? `${st.state}${unit ? " " + unit : ""}` : undefined,
            };
          }),
      }));
  }

  /** Temperature sensors (and, for the setpoint, input/number entities). */
  private _tempSensors(setpoint: boolean): string[] {
    return Object.keys(this.hass.states).filter((id) => {
      const domain = id.split(".")[0];
      const a = this.hass.states[id].attributes ?? {};
      if (setpoint && SETPOINT_DOMAINS.includes(domain)) return true;
      return (
        domain === "sensor" &&
        (a.device_class === "temperature" || ["°C", "°F"].includes(a.unit_of_measurement))
      );
    });
  }

  private _value(id: string): number | null {
    const v = parseFloat(this.hass.states[id]?.state ?? "");
    return Number.isNaN(v) ? null : v;
  }

  private _ruleError(r: { delta: string; tolerance: string }): string {
    const delta = parseFloat(r.delta);
    const tol = parseFloat(r.tolerance);
    if (Number.isNaN(delta) || Number.isNaN(tol)) return t("heatingSystemEditor.rule_required");
    if (delta <= 0 || tol < 0 || tol >= delta) return t("heatingSystemEditor.rule_invalid");
    return "";
  }

  /** Sensors the configured rules need. */
  private get _required(): Set<TankKey> {
    return new Set(this._rules.flatMap((r) => RULES[r.type].gap));
  }

  private get _tankValid(): boolean {
    return (
      [...this._required].every((k) => !!this._tank[k]) &&
      !!this._circulator &&
      !Number.isNaN(parseFloat(this._minRuntime)) &&
      this._rules.every((r) => !this._ruleError(r))
    );
  }

  private _toggleZone(id: string) {
    const rest = this._zones.filter((z) => z !== GLOBAL);
    const next = rest.includes(id) ? rest.filter((z) => z !== id) : [...rest, id];
    this._zones = next.length ? next : [GLOBAL];
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("heating-system-closed"));
  }

  private async _save() {
    this._busy = true;
    const base = { id: this._id, name: this._sysName.trim(), type: this._type };
    const system: HeatingSystem =
      this._type === "buffer_tank"
        ? {
            ...base,
            ...this._tank,
            circulator: this._circulator,
            min_runtime: parseFloat(this._minRuntime) || 0,
            zones: this._zones,
            aggressive: this._aggressive,
            rules: this._rules.map(
              (r): CirculationRule => ({
                type: r.type,
                delta: parseFloat(r.delta),
                tolerance: parseFloat(r.tolerance),
              })
            ),
          }
        : {
            ...base,
            contact: this._type === "boiler" ? this._contact : "",
            zones: this._zones,
            aggressive: this._type === "boiler" && this._aggressive,
          };
    try {
      await saveHeatingSystem(this.hass, system, !this.system);
      this._close();
    } catch (err) {
      alert(t("common.error", { message: errorMessage(err) }));
      this._busy = false;
    }
  }

  private async _delete() {
    if (!this.system) return;
    if (!confirm(t("heatingSystemEditor.delete_confirm", { name: this.system.name }))) return;
    this._busy = true;
    try {
      await deleteHeatingSystem(this.hass, this.system.id);
      this._close();
    } catch (err) {
      alert(t("common.error", { message: errorMessage(err) }));
      this._busy = false;
    }
  }

  private _renderBoiler() {
    const name = (id: string) => this._name(id);
    return html`
      <div class="section">${t("heatingSystemEditor.dry_contact")}</div>
      <p class="hint">${t("heatingSystemEditor.dry_contact_hint")}</p>
      <homex-select
        placeholder=${t("heatingSystemEditor.choose_switch")}
        .value=${this._contact}
        .options=${this._contacts.map((id) => ({
          value: id,
          label: name(id),
          secondary: id,
        }))}
        @value-changed=${(e: CustomEvent) => (this._contact = e.detail.value)}
      ></homex-select>

      ${this._renderScope(t("heatingSystemEditor.driven_contact"))}
    `;
  }

  /** Scope (global or zones) and agressive mode, shared by both types. */
  private _renderScope(driven: string) {
    const isGlobal = this._zones.includes(GLOBAL);
    return html`
      <div class="section">${t("heatingSystemEditor.scope")}</div>
      <p class="hint">${t("heatingSystemEditor.scope_hint")}</p>
      <div class="checks">
        <label>
          ${toggleSwitch(isGlobal, () => (this._zones = [GLOBAL]))}
          ${t("heatingSystemEditor.global_system")}
        </label>
        ${this.zones.map(
          (z) => html`<label>
            ${toggleSwitch(!isGlobal && this._zones.includes(z.id), () =>
              this._toggleZone(z.id)
            )}
            ${t("heatingSystemEditor.zone", { name: z.name })}
          </label>`
        )}
      </div>

      <div class="section">${t("heatingSystemEditor.aggressive_mode")}</div>
      <div class="checks">
        <label>
          ${toggleSwitch(this._aggressive, (on) => (this._aggressive = on))}
          ${t("heatingSystemEditor.aggressive_hint", { driven })}
        </label>
      </div>
    `;
  }

  private _num(
    label: string,
    value: string,
    onInput: (v: string) => void,
    step = "0.5"
  ) {
    return html`<label class="num">
      ${label}
      <input
        type="number"
        inputmode="decimal"
        step=${step}
        min="0"
        .value=${value}
        @input=${(e: Event) => onInput((e.target as HTMLInputElement).value)}
      />
    </label>`;
  }

  private _setRule(i: number, patch: Partial<RuleDraft>) {
    this._rules = this._rules.map((r, j) => (j === i ? { ...r, ...patch } : r));
  }

  private _addRule(type: RuleType) {
    if (this._rules.some((r) => r.type === type)) return; // one rule per type
    const [delta, tolerance] = RULES[type].init;
    this._rules = [...this._rules, { type, delta, tolerance }];
  }

  private _renderRule(r: RuleDraft, i: number) {
    const def = RULES[r.type];
    const err = this._ruleError(r);
    const fmt = (v: number) => `${Math.round(v * 10) / 10} °C`;
    const [ka, kb] = def.gap;
    const a = this._value(this._tank[ka]);
    const b = this._value(this._tank[kb]);
    let explain = err;
    if (!err && r.type === "setpoint_tank") {
      const delta = parseFloat(r.delta);
      const tol = parseFloat(r.tolerance);
      explain =
        a == null
          ? t("heatingSystemEditor.explain_setpoint_tank", { delta: r.delta, tolerance: r.tolerance })
          : t("heatingSystemEditor.explain_setpoint_tank_live", {
              setpoint: fmt(a),
              start: fmt(a - delta),
              stop: fmt(a - tol),
            });
    } else if (!err) {
      explain = t("heatingSystemEditor.explain_flow_return", { delta: r.delta, tolerance: r.tolerance });
    }
    const now =
      !err && a != null && b != null
        ? t("heatingSystemEditor.currently", { a: def.a(), b: def.b(), value: fmt(Math.max(0, a - b)) })
        : "";
    return html`<div class="rule">
      <div class="title">${t("heatingSystemEditor.rule_title", { n: i + 1, label: def.label() })}</div>
      ${this._num(t("heatingSystemEditor.delta"), r.delta, (v) => this._setRule(i, { delta: v }))}
      ${this._num(t("heatingSystemEditor.tolerance"), r.tolerance, (v) => this._setRule(i, { tolerance: v }))}
      <button
        title=${t("heatingSystemEditor.delete_rule")}
        @click=${() => (this._rules = this._rules.filter((_, j) => j !== i))}
      >
        ✕
      </button>
      <div class="explain ${err ? "err" : ""}">${explain}${now}</div>
    </div>`;
  }

  /** The manual force: the Homex switch entity of an existing tank. */
  private _renderForce() {
    const entity = this.system ? `switch.homex_system_${this.system.id}_force` : "";
    const st = entity ? this.hass.states[entity] : undefined;
    return html`<div class="checks">
        <label>
          ${toggleSwitch(st?.state === "on", (on) =>
            this.hass.callService("switch", on ? "turn_on" : "turn_off", { entity_id: entity }),
            !st
          )}
          ${t("heatingSystemEditor.manual_override")}
        </label>
      </div>
      <p class="hint">
        ${t("heatingSystemEditor.force_hint")}
        ${st
          ? html`${t("heatingSystemEditor.force_entity")} <code>${entity}</code> ${t("heatingSystemEditor.force_entity_suffix")}`
          : t("heatingSystemEditor.force_unavailable")}
      </p>`;
  }

  private _renderTank() {
    const sensors = this._grouped(this._tempSensors(false));
    const setpoints = this._grouped(this._tempSensors(true));
    const contacts = this._grouped(this._contacts);
    return html`
      <div class="section">${t("heatingSystemEditor.sensors")}</div>
      <div class="tank-grid">
        ${TANK_SENSORS.map(
          ([key, label]) => html`<homex-select
            label=${this._required.has(key) ? t("heatingSystemEditor.required", { label: label() }) : label()}
            placeholder=${t("heatingSystemEditor.choose_sensor")}
            .value=${this._tank[key]}
            .groups=${key === "setpoint_sensor" ? setpoints : sensors}
            @value-changed=${(e: CustomEvent) =>
              (this._tank = { ...this._tank, [key]: e.detail.value })}
          ></homex-select>`
        )}
      </div>

      <div class="section">${t("heatingSystemEditor.circulator")}</div>
      <div class="tank-grid">
        <homex-select
          label=${t("heatingSystemEditor.controlled_switch")}
          placeholder=${t("heatingSystemEditor.choose_switch")}
          .value=${this._circulator}
          .groups=${contacts}
          @value-changed=${(e: CustomEvent) => (this._circulator = e.detail.value)}
        ></homex-select>
        ${this._num(
          t("heatingSystemEditor.min_runtime"),
          this._minRuntime,
          (v) => (this._minRuntime = v),
          "1"
        )}
      </div>
      ${this._renderForce()}

      <div class="section">${t("heatingSystemEditor.rules")}</div>
      <p class="hint">${t("heatingSystemEditor.rules_hint")}</p>
      ${this._rules.map((r, i) => this._renderRule(r, i))}
      <div class="rule-add">
        ${(Object.keys(RULES) as RuleType[])
          .filter((type) => !this._rules.some((r) => r.type === type))
          .map(
          (type) => html`<button @click=${() => this._addRule(type)}>${RULES[type].add()}</button>`
        )}
      </div>
    `;
  }

  render() {
    const editing = !!this.system;
    return html`
      ${textField(t("heatingSystemEditor.name"), this._sysName, (v) => {
        this._sysName = v;
        if (!this._idEdited) this._id = slugify(v);
      }, t("heatingSystemEditor.name_placeholder"))}
      ${editing
        ? html`<div class="section">${t("heatingSystemEditor.id_label", { id: this.system!.id })}</div>`
        : textField(t("heatingSystemEditor.id"), this._id, (v) => {
            this._idEdited = true;
            this._id = slugify(v);
          })}

      <div class="section">${t("heatingSystemEditor.type")}</div>
      <div class="btn-group">
        ${TYPES.map(
          ([v, l]) => html`<button
            class=${this._type === v ? "active" : ""}
            @click=${() => (this._type = v)}
          >
            ${l()}
          </button>`
        )}
      </div>

      ${this._type === "boiler"
        ? this._renderBoiler()
        : this._type === "buffer_tank"
          ? html`${this._renderTank()}${this._renderScope(t("heatingSystemEditor.driven_circulator"))}`
          : html`<p class="hint">${t("heatingSystemEditor.heat_pump_unavailable")}</p>`}

      <div class="actions">
        <button
          class="primary"
          ?disabled=${this._busy ||
            !this._sysName.trim() ||
            !this._id ||
            (this._type === "buffer_tank" && !this._tankValid)}
          @click=${this._save}
        >
          ${t("common.save")}
        </button>
        <button ?disabled=${this._busy} @click=${this._close}>${t("common.cancel")}</button>
        ${editing
          ? html`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              ${t("common.delete")}
            </button>`
          : ""}
      </div>
    `;
  }
}
