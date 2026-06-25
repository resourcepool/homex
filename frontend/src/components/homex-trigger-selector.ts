import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { mdiPlus, mdiClose, mdiShape, mdiDevices } from "@mdi/js";
import type { HomeAssistant, TriggerSpec } from "../types";
import type { DeviceTrigger } from "../api";
import { fetchDeviceTriggers } from "../api";
import { TRIGGER_DOMAINS } from "../lib/domains";
import "./homex-device-field";

/**
 * Trigger list styled after Home Assistant's automation editor: an
 * "Ajouter un déclencheur" pill that opens a type menu (Entité / Appareil),
 * each trigger shown as an ha-card with its native editor. Configs are stored
 * as raw HA trigger configs (validated server-side).
 */
@customElement("homex-trigger-selector")
export class HomexTriggerSelector extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) value: TriggerSpec[] = [];
  @state() private _menuOpen = false;
  @state() private _devTriggers: Record<string, DeviceTrigger[]> = {};

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .card {
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      border-radius: 12px;
      margin-bottom: 12px;
      /* No overflow:hidden — it would clip the device search dropdown. */
      position: relative;
    }
    .head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 8px 12px 16px;
      border-bottom: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
    }
    .head svg {
      width: 22px;
      height: 22px;
      fill: var(--secondary-text-color);
      flex: 0 0 auto;
    }
    .head .title {
      flex: 1;
      font-size: 15px;
      font-weight: 500;
    }
    .icon-btn {
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 6px;
      border-radius: 50%;
      display: inline-flex;
      color: var(--secondary-text-color);
    }
    .icon-btn:hover {
      background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
    }
    .icon-btn svg {
      width: 22px;
      height: 22px;
      fill: currentColor;
    }
    .body {
      padding: 12px 16px 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    label.field {
      display: block;
    }
    label.field > span {
      display: block;
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-bottom: 6px;
    }
    ha-entity-picker,
    ha-device-picker {
      display: block;
      width: 100%;
    }
    select.native,
    input.native {
      width: 100%;
      box-sizing: border-box;
      padding: 14px 12px;
      font-size: 15px;
      border: none;
      border-radius: 4px 4px 0 0;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      background: var(--input-fill-color, rgba(225, 225, 225, 0.06));
      color: var(--primary-text-color);
    }
    input.native:focus,
    select.native:focus {
      outline: none;
      border-bottom: 2px solid var(--primary-color, #009ac7);
    }
    .dur-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dur-row input {
      width: 64px;
      box-sizing: border-box;
      padding: 12px 8px;
      font-size: 15px;
      text-align: center;
      border: none;
      border-radius: 4px 4px 0 0;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      background: var(--input-fill-color, rgba(225, 225, 225, 0.06));
      color: var(--primary-text-color);
    }
    .dur-row span {
      color: var(--secondary-text-color);
    }
    .add-wrap {
      position: relative;
      display: inline-block;
    }
    .add-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      border: none;
      border-radius: 24px;
      padding: 9px 20px 9px 14px;
      font-size: 14px;
      font-weight: 500;
      background: var(--primary-color, #009ac7);
      color: var(--text-primary-color, #fff);
    }
    .add-btn svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
    .menu {
      position: absolute;
      z-index: 30;
      top: 46px;
      left: 0;
      min-width: 220px;
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      border-radius: 10px;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
      padding: 6px;
    }
    .menu button {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      text-align: left;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 12px 12px;
      border-radius: 8px;
      font-size: 15px;
      color: var(--primary-text-color);
    }
    .menu button:hover {
      background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
    }
    .menu button svg {
      width: 22px;
      height: 22px;
      fill: var(--secondary-text-color);
    }
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 29;
    }
  `;

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("value")) {
      for (const c of this.value) if (c?.device_id) this._ensure(c.device_id);
    }
  }

  private async _ensure(deviceId: string) {
    if (deviceId in this._devTriggers) return;
    this._devTriggers = { ...this._devTriggers, [deviceId]: [] };
    try {
      const list = await fetchDeviceTriggers(this.hass, deviceId);
      this._devTriggers = { ...this._devTriggers, [deviceId]: list };
    } catch {
      /* leave empty */
    }
  }

  private _emit(value: TriggerSpec[]) {
    this.value = value;
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value } }));
  }
  private _update(i: number, cfg: TriggerSpec) {
    this._emit(this.value.map((c, j) => (j === i ? cfg : c)));
  }
  private _remove(i: number) {
    this._emit(this.value.filter((_, j) => j !== i));
  }
  private _add(type: "entity" | "device") {
    this._menuOpen = false;
    // Tag device cards with platform:"device" so an empty (not-yet-picked)
    // device trigger still renders as a device, not an entity.
    this._emit([
      ...this.value,
      type === "device" ? { platform: "device", device_id: "" } : { platform: "state" },
    ]);
  }

  private _entityOf(cfg: TriggerSpec): string {
    const e = cfg?.entity_id;
    return Array.isArray(e) ? e[0] || "" : e || "";
  }
  private _deviceTriggerIndex(cfg: TriggerSpec): number {
    const list = this._devTriggers[cfg.device_id] || [];
    return list.findIndex(
      (d) =>
        d.trigger.type === cfg.type &&
        d.trigger.subtype === cfg.subtype &&
        d.trigger.domain === cfg.domain
    );
  }
  private _deviceName(id: string): string {
    const d = this.hass?.devices?.[id];
    return d?.name_by_user || d?.name || id;
  }

  // -- Entity (state / numeric_state) trigger, like the automation editor ---

  private _entityType(cfg: TriggerSpec): "state" | "numeric" {
    return cfg?.platform === "numeric_state" ? "numeric" : "state";
  }

  private _entityStates(id: string): string[] {
    const domain = id.split(".")[0];
    const toggle = [
      "light", "switch", "input_boolean", "binary_sensor", "fan",
      "cover", "lock", "automation", "script", "group", "media_player",
    ];
    const states = new Set<string>(toggle.includes(domain) ? ["on", "off"] : []);
    const cur = this.hass.states[id]?.state;
    if (cur && !["unavailable", "unknown", ""].includes(cur)) states.add(cur);
    return [...states];
  }

  private _setKey(i: number, cfg: TriggerSpec, key: string, val: any) {
    const next: TriggerSpec = { ...cfg };
    if (val === "" || val === null || val === undefined) delete next[key];
    else next[key] = val;
    this._update(i, next);
  }

  private _setEntity(i: number, cfg: TriggerSpec, id: string) {
    // Changing the entity keeps the sub-type but drops its specific fields.
    const platform = cfg?.platform === "numeric_state" ? "numeric_state" : "state";
    this._update(i, id ? { platform, entity_id: id } : { platform });
  }

  private _setEntityType(i: number, cfg: TriggerSpec, type: "state" | "numeric") {
    const next: TriggerSpec = {
      platform: type === "numeric" ? "numeric_state" : "state",
      entity_id: this._entityOf(cfg),
    };
    if (cfg.attribute) next.attribute = cfg.attribute;
    if (cfg.for) next.for = cfg.for;
    this._update(i, next);
  }

  private _entityField(cfg: TriggerSpec, i: number) {
    const value = this._entityOf(cfg);
    const onChange = (id: string) => this._setEntity(i, cfg, id);
    if (customElements.get("ha-entity-picker")) {
      return html`<ha-entity-picker
        .hass=${this.hass}
        .value=${value}
        .includeDomains=${TRIGGER_DOMAINS}
        allow-custom-entity
        @value-changed=${(e: CustomEvent) => {
          e.stopPropagation();
          onChange(e.detail.value || "");
        }}
      ></ha-entity-picker>`;
    }
    const ids = Object.keys(this.hass.states)
      .filter((id) => TRIGGER_DOMAINS.includes(id.split(".")[0]))
      .sort();
    return html`<select class="native" @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value)}>
      <option value="">Sélectionnez une entité</option>
      ${ids.map(
        (id) => html`<option value=${id} ?selected=${id === value}>
          ${this.hass.states[id]?.attributes?.friendly_name || id}
        </option>`
      )}
    </select>`;
  }

  private _entityTypeField(cfg: TriggerSpec, i: number) {
    const t = this._entityType(cfg);
    return html`<label class="field"><span>Type</span>
      <select
        class="native"
        @change=${(e: Event) =>
          this._setEntityType(i, cfg, (e.target as HTMLSelectElement).value as "state" | "numeric")}
      >
        <option value="state" ?selected=${t === "state"}>État</option>
        <option value="numeric" ?selected=${t === "numeric"}>État numérique</option>
      </select>
    </label>`;
  }

  private _attrField(cfg: TriggerSpec, i: number) {
    const id = this._entityOf(cfg);
    const attrs = Object.keys(this.hass.states[id]?.attributes || {});
    const cur = cfg.attribute || "";
    return html`<label class="field"><span>Attribut (facultatif)</span>
      <select
        class="native"
        @change=${(e: Event) =>
          this._setKey(i, cfg, "attribute", (e.target as HTMLSelectElement).value)}
      >
        <option value="" ?selected=${!cur}>(état de l'entité)</option>
        ${attrs.map((a) => html`<option value=${a} ?selected=${a === cur}>${a}</option>`)}
      </select>
    </label>`;
  }

  private _stateValueField(
    cfg: TriggerSpec, i: number, key: "from" | "to", label: string
  ) {
    const id = this._entityOf(cfg);
    const cur = cfg[key] != null ? String(cfg[key]) : "";
    const listId = `st-${i}-${key}`;
    return html`<label class="field"><span>${label}</span>
      <input
        class="native"
        list=${listId}
        .value=${cur}
        @change=${(e: Event) =>
          this._setKey(i, cfg, key, (e.target as HTMLInputElement).value)}
      />
      <datalist id=${listId}>
        ${this._entityStates(id).map((s) => html`<option value=${s}></option>`)}
      </datalist>
    </label>`;
  }

  private _numField(
    cfg: TriggerSpec, i: number, key: "above" | "below", label: string
  ) {
    const cur = cfg[key] != null ? String(cfg[key]) : "";
    return html`<label class="field"><span>${label}</span>
      <input
        class="native"
        type="number"
        .value=${cur}
        @change=${(e: Event) => {
          const v = (e.target as HTMLInputElement).value;
          this._setKey(i, cfg, key, v === "" ? "" : Number(v));
        }}
      />
    </label>`;
  }

  private _forParts(cfg: TriggerSpec): { h: number; m: number; s: number } {
    const f = cfg.for;
    if (f && typeof f === "object")
      return { h: f.hours || 0, m: f.minutes || 0, s: f.seconds || 0 };
    if (typeof f === "string") {
      const p = f.split(":").map(Number);
      return { h: p[0] || 0, m: p[1] || 0, s: p[2] || 0 };
    }
    if (typeof f === "number") return { h: 0, m: 0, s: f };
    return { h: 0, m: 0, s: 0 };
  }

  private _setForPart(cfg: TriggerSpec, i: number, part: "h" | "m" | "s", val: number) {
    const p = this._forParts(cfg);
    p[part] = isNaN(val) || val < 0 ? 0 : Math.floor(val);
    const total = p.h + p.m + p.s;
    this._setKey(
      i, cfg, "for",
      total ? { hours: p.h, minutes: p.m, seconds: p.s } : ""
    );
  }

  private _forField(cfg: TriggerSpec, i: number) {
    const p = this._forParts(cfg);
    const inp = (part: "h" | "m" | "s", v: number, ph: string) => html`<input
      type="number"
      min="0"
      placeholder=${ph}
      .value=${v ? String(v) : ""}
      @change=${(e: Event) =>
        this._setForPart(cfg, i, part, Number((e.target as HTMLInputElement).value))}
    />`;
    return html`<label class="field"><span>Pendant (facultatif)</span>
      <div class="dur-row">
        ${inp("h", p.h, "hh")}<span>:</span>${inp("m", p.m, "mm")}<span>:</span>${inp("s", p.s, "ss")}
      </div>
    </label>`;
  }

  private _entityBody(cfg: TriggerSpec, i: number) {
    if (!this._entityOf(cfg)) return "";
    const numeric = this._entityType(cfg) === "numeric";
    return html`
      ${this._entityTypeField(cfg, i)}
      ${this._attrField(cfg, i)}
      ${numeric
        ? html`${this._numField(cfg, i, "above", "Au-dessus de (facultatif)")}
            ${this._numField(cfg, i, "below", "En-dessous de (facultatif)")}`
        : html`${this._stateValueField(cfg, i, "from", "De (facultatif)")}
            ${this._stateValueField(cfg, i, "to", "À (facultatif)")}`}
      ${this._forField(cfg, i)}
    `;
  }

  private _deviceField(cfg: TriggerSpec, i: number) {
    return html`<homex-device-field
      .hass=${this.hass}
      .value=${cfg.device_id || ""}
      @value-changed=${(e: CustomEvent) => {
        e.stopPropagation();
        const id = e.detail.value || "";
        if (id) this._ensure(id);
        // Keep the device marker so clearing the device doesn't flip the card
        // to an entity, and the action dropdown stays the device's.
        this._update(i, { platform: "device", device_id: id });
      }}
    ></homex-device-field>`;
  }

  private _actionField(cfg: TriggerSpec, i: number) {
    const list = this._devTriggers[cfg.device_id] || [];
    const current = this._deviceTriggerIndex(cfg);
    return html`<select
      class="native"
      @change=${(e: Event) => {
        const idx = Number((e.target as HTMLSelectElement).value);
        const chosen = (this._devTriggers[cfg.device_id] || [])[idx];
        if (chosen) this._update(i, { ...chosen.trigger });
      }}
    >
      <option value="-1" ?selected=${current < 0}>Sélectionnez une action</option>
      ${list.map(
        (d, idx) => html`<option value=${idx} ?selected=${idx === current}>${d.label}</option>`
      )}
    </select>`;
  }

  private _card(cfg: TriggerSpec, i: number) {
    const isDevice = !!cfg?.device_id || cfg?.platform === "device";
    return html`<div class="card">
      <div class="head">
        <svg viewBox="0 0 24 24"><path d=${isDevice ? mdiDevices : mdiShape}></path></svg>
        <span class="title">${isDevice ? "Appareil" : "Entité"}</span>
        <button class="icon-btn" title="Supprimer" @click=${() => this._remove(i)}>
          <svg viewBox="0 0 24 24"><path d=${mdiClose}></path></svg>
        </button>
      </div>
      <div class="body">
        ${isDevice
          ? html`<label class="field"><span>Appareil</span>${this._deviceField(cfg, i)}</label>
              ${cfg.device_id
                ? html`<label class="field"><span>Action</span>${this._actionField(cfg, i)}</label>`
                : ""}`
          : html`<label class="field"><span>Entité</span>${this._entityField(cfg, i)}</label>
              ${this._entityBody(cfg, i)}`}
      </div>
    </div>`;
  }

  render() {
    return html`
      ${this.value.map((cfg, i) => this._card(cfg, i))}
      <div class="add-wrap">
        <button class="add-btn" @click=${() => (this._menuOpen = !this._menuOpen)}>
          <svg viewBox="0 0 24 24"><path d=${mdiPlus}></path></svg>
          Ajouter un déclencheur
        </button>
        ${this._menuOpen
          ? html`
              <div class="backdrop" @click=${() => (this._menuOpen = false)}></div>
              <div class="menu">
                <button @click=${() => this._add("entity")}>
                  <svg viewBox="0 0 24 24"><path d=${mdiShape}></path></svg> Entité
                </button>
                <button @click=${() => this._add("device")}>
                  <svg viewBox="0 0 24 24"><path d=${mdiDevices}></path></svg> Appareil
                </button>
              </div>
            `
          : ""}
      </div>
    `;
  }
}
