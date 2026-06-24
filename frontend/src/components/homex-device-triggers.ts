import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, TriggerSpec } from "../types";
import { fetchDeviceActions } from "../api";
import { haComponentsLoaded } from "../lib/ha-elements";

/**
 * Editor for device-action triggers: a list of rows, each = one device
 * (native `ha-device-picker`) + the specific action to listen for (a dropdown
 * of that device's native trigger actions, or "all actions"). A trailing empty
 * row lets you add another device.
 *
 * Value/emit: `TriggerSpec[]` restricted to `{ device_id, action? }`.
 */
@customElement("homex-device-triggers")
export class HomexDeviceTriggers extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) value: TriggerSpec[] = [];
  // device_id -> available action labels ([] while loading / none).
  @state() private _actions: Record<string, string[]> = {};

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .dev {
      flex: 1 1 auto;
      min-width: 0;
    }
    select {
      flex: 1 1 40%;
      box-sizing: border-box;
      padding: 12px 12px;
      font-size: 14px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
    }
    .x {
      flex: 0 0 auto;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      color: var(--secondary-text-color);
      border-radius: 50%;
      padding: 4px 8px;
    }
    .x:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }
  `;

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("value")) {
      for (const s of this.value) if (s.device_id) this._ensure(s.device_id);
    }
  }

  private async _ensure(deviceId: string) {
    if (deviceId in this._actions) return;
    this._actions = { ...this._actions, [deviceId]: [] };
    try {
      const acts = await fetchDeviceActions(this.hass, deviceId);
      this._actions = { ...this._actions, [deviceId]: acts };
    } catch {
      /* leave empty */
    }
  }

  private _name(id: string): string {
    const d = this.hass?.devices?.[id];
    return d?.name_by_user || d?.name || id;
  }

  private _emit(value: TriggerSpec[]) {
    this.value = value;
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value } }));
  }

  private _setDevice(index: number, deviceId: string) {
    if (index < 0) {
      if (deviceId) {
        this._ensure(deviceId);
        this._emit([...this.value, { device_id: deviceId }]);
      }
      return;
    }
    if (!deviceId) {
      this._remove(index);
      return;
    }
    this._ensure(deviceId);
    this._emit(this.value.map((s, i) => (i === index ? { device_id: deviceId } : s)));
  }

  private _setAction(index: number, action: string) {
    this._emit(
      this.value.map((s, i) =>
        i === index
          ? action
            ? { device_id: s.device_id, action }
            : { device_id: s.device_id }
          : s
      )
    );
  }

  private _remove(index: number) {
    this._emit(this.value.filter((_, i) => i !== index));
  }

  private _devicePicker(deviceId: string, onChange: (id: string) => void) {
    if (haComponentsLoaded()) {
      return html`<ha-device-picker
        class="dev"
        .hass=${this.hass}
        .value=${deviceId}
        @value-changed=${(e: CustomEvent) => onChange(e.detail.value || "")}
      ></ha-device-picker>`;
    }
    const devices = Object.keys(this.hass.devices || {}).sort((a, b) =>
      this._name(a).localeCompare(this._name(b))
    );
    return html`<select
      class="dev"
      @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value)}
    >
      <option value="">— Appareil —</option>
      ${devices.map(
        (id) =>
          html`<option value=${id} ?selected=${id === deviceId}>
            ${this._name(id)}
          </option>`
      )}
    </select>`;
  }

  private _row(spec: TriggerSpec, index: number) {
    const device = spec.device_id || "";
    const actions = device ? this._actions[device] || [] : [];
    return html`<div class="row">
      ${this._devicePicker(device, (id) => this._setDevice(index, id))}
      ${device
        ? html`<select
            @change=${(e: Event) =>
              this._setAction(index, (e.target as HTMLSelectElement).value)}
          >
            <option value="" ?selected=${!spec.action}>Toutes les actions</option>
            ${actions.map(
              (a) =>
                html`<option value=${a} ?selected=${spec.action === a}>${a}</option>`
            )}
          </select>`
        : ""}
      ${index >= 0
        ? html`<button class="x" title="Retirer" @click=${() => this._remove(index)}>
            ×
          </button>`
        : ""}
    </div>`;
  }

  render() {
    return html`
      ${this.value.map((s, i) => this._row(s, i))}
      ${this._row({ device_id: "" }, -1)}
    `;
  }
}
