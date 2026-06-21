import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, TriggerSpec } from "../types";
import { fetchDeviceActions } from "../api";
import { TRIGGER_DOMAINS } from "../lib/domains";

interface Candidate {
  kind: "entity" | "device";
  id: string;
  name: string;
}

/**
 * Unified trigger editor: a single field to add an entity (state) or a device
 * (action). Device rows expose a free-text action input with autocomplete of
 * the device's available actions. Emits `value-changed` with TriggerSpec[].
 */
@customElement("homex-trigger-list")
export class HomexTriggerList extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Array }) value: TriggerSpec[] = [];

  @state() private _query = "";
  @state() private _open = false;
  @state() private _actions: Record<string, string[]> = {};

  static styles = css`
    :host {
      display: block;
      position: relative;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
    }
    .tag {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color);
      background: var(--secondary-background-color, #eee);
      border-radius: 6px;
      padding: 2px 6px;
    }
    .name {
      font-size: 14px;
    }
    .device-row {
      flex-wrap: wrap;
    }
    .action {
      flex: 1;
      min-width: 160px;
      box-sizing: border-box;
      padding: 9px 11px;
      font-size: 14px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
    }
    .rm {
      margin-left: auto;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--error-color, #db4437);
      font-size: 18px;
      line-height: 1;
    }
    .device-row .rm {
      margin-left: 0;
    }
    input.add {
      width: 100%;
      box-sizing: border-box;
      margin-top: 6px;
      padding: 13px 14px;
      font-size: 16px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
    }
    .suggestions {
      position: absolute;
      z-index: 20;
      left: 0;
      right: 0;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 6px;
      max-height: 260px;
      overflow: auto;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
    }
    .sugg {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      cursor: pointer;
      font-size: 14px;
    }
    .sugg:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }
    .sugg .sid {
      margin-left: auto;
      color: var(--secondary-text-color);
      font-size: 11px;
    }
  `;

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("value")) {
      for (const spec of this.value) {
        if (spec.device_id) this._ensureActions(spec.device_id);
      }
    }
  }

  private async _ensureActions(deviceId: string) {
    if (deviceId in this._actions) return;
    this._actions = { ...this._actions, [deviceId]: [] }; // mark pending
    try {
      const actions = await fetchDeviceActions(this.hass, deviceId);
      this._actions = { ...this._actions, [deviceId]: actions };
    } catch {
      /* keep empty */
    }
  }

  private _entityName(id: string): string {
    return this.hass.states[id]?.attributes?.friendly_name || id;
  }
  private _deviceName(id: string): string {
    const dev = this.hass.devices?.[id];
    return (dev && (dev.name_by_user || dev.name)) || id;
  }

  private get _candidates(): Candidate[] {
    const usedEntities = new Set(
      this.value.filter((s) => s.entity_id).map((s) => s.entity_id)
    );
    const entities: Candidate[] = Object.keys(this.hass.states)
      .filter((id) => TRIGGER_DOMAINS.includes(id.split(".")[0]))
      .filter((id) => !usedEntities.has(id))
      .map((id) => ({ kind: "entity", id, name: this._entityName(id) }));
    const devices: Candidate[] = Object.keys(this.hass.devices || {}).map(
      (id) => ({ kind: "device", id, name: this._deviceName(id) })
    );
    return [...entities, ...devices].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  private get _filtered(): Candidate[] {
    const q = this._query.trim().toLowerCase();
    return this._candidates
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
      .slice(0, 12);
  }

  private _emit(next: TriggerSpec[]) {
    this.value = next;
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: next } }));
  }

  private _add(candidate: Candidate) {
    const spec: TriggerSpec =
      candidate.kind === "entity"
        ? { entity_id: candidate.id }
        : { device_id: candidate.id, action: "" };
    if (candidate.kind === "device") this._ensureActions(candidate.id);
    this._emit([...this.value, spec]);
    this._query = "";
    this._open = false;
  }

  private _remove(index: number) {
    this._emit(this.value.filter((_, i) => i !== index));
  }

  private _setAction(index: number, action: string) {
    this._emit(this.value.map((s, i) => (i === index ? { ...s, action } : s)));
  }

  private _renderRow(spec: TriggerSpec, index: number) {
    if (spec.entity_id) {
      return html`<div class="row">
        <span class="tag">entité</span>
        <span class="name">${this._entityName(spec.entity_id)}</span>
        <button class="rm" title="Retirer" @click=${() => this._remove(index)}>×</button>
      </div>`;
    }
    const deviceId = spec.device_id!;
    const listId = `acts-${index}`;
    const actions = this._actions[deviceId] || [];
    return html`<div class="row device-row">
      <span class="tag">appareil</span>
      <span class="name">${this._deviceName(deviceId)}</span>
      <button class="rm" title="Retirer" @click=${() => this._remove(index)}>×</button>
      <input
        class="action"
        list=${listId}
        placeholder="Action (ex. press, turn_on…)"
        .value=${spec.action || ""}
        @input=${(e: Event) =>
          this._setAction(index, (e.target as HTMLInputElement).value)}
      />
      <datalist id=${listId}>
        ${actions.map((a) => html`<option value=${a}></option>`)}
      </datalist>
    </div>`;
  }

  render() {
    return html`
      ${this.value.map((spec, i) => this._renderRow(spec, i))}
      <input
        class="add"
        .value=${this._query}
        placeholder="Ajouter une entité ou un appareil…"
        autocomplete="off"
        @focus=${() => (this._open = true)}
        @input=${(e: Event) => {
          this._query = (e.target as HTMLInputElement).value;
          this._open = true;
        }}
        @blur=${() => setTimeout(() => (this._open = false), 200)}
      />
      ${this._open
        ? html`<div class="suggestions">
            ${this._filtered.map(
              (c) => html`<div class="sugg" @mousedown=${() => this._add(c)}>
                <span class="tag">${c.kind === "entity" ? "entité" : "appareil"}</span>
                <span>${c.name}</span><span class="sid">${c.id}</span>
              </div>`
            )}
          </div>`
        : ""}
    `;
  }
}
