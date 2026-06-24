import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "../types";

/**
 * Single-device picker. Uses Home Assistant's native `ha-device-picker` when it
 * is loaded; otherwise a searchable input + suggestions fallback (the native
 * device picker isn't preloaded in custom panels, unlike ha-entity-picker).
 *
 * Emits `value-changed` with `{ value: string }` (device id, "" when cleared).
 */
@customElement("homex-device-field")
export class HomexDeviceField extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property() value = "";
  @state() private _query = "";
  @state() private _open = false;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      position: relative;
    }
    .selected {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 13px 12px;
      border-radius: 4px 4px 0 0;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      background: var(--input-fill-color, rgba(225, 225, 225, 0.06));
      font-size: 15px;
    }
    .selected .name {
      flex: 1;
    }
    .clear {
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--secondary-text-color);
      font-size: 18px;
      line-height: 1;
      padding: 0 4px;
    }
    input {
      width: 100%;
      box-sizing: border-box;
      padding: 13px 12px;
      font-size: 15px;
      border: none;
      border-radius: 4px 4px 0 0;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      background: var(--input-fill-color, rgba(225, 225, 225, 0.06));
      color: var(--primary-text-color);
    }
    input:focus {
      outline: none;
      border-bottom: 2px solid var(--primary-color, #009ac7);
    }
    .suggestions {
      position: absolute;
      z-index: 40;
      left: 0;
      right: 0;
      margin-top: 2px;
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      border-radius: 6px;
      max-height: 260px;
      overflow: auto;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
    }
    .sugg {
      padding: 11px 14px;
      cursor: pointer;
      font-size: 15px;
    }
    .sugg:hover {
      background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
    }
  `;

  private _name(id: string): string {
    const d = this.hass?.devices?.[id];
    return d?.name_by_user || d?.name || id;
  }

  private _emit(value: string) {
    this.value = value;
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value } }));
  }

  private get _filtered(): string[] {
    const q = this._query.trim().toLowerCase();
    return Object.keys(this.hass.devices || {})
      .filter((id) => !q || this._name(id).toLowerCase().includes(q))
      .sort((a, b) => this._name(a).localeCompare(this._name(b)))
      .slice(0, 12);
  }

  render() {
    if (customElements.get("ha-device-picker")) {
      return html`<ha-device-picker
        .hass=${this.hass}
        .value=${this.value}
        @value-changed=${(e: CustomEvent) => {
          e.stopPropagation();
          this._emit(e.detail.value || "");
        }}
      ></ha-device-picker>`;
    }
    if (this.value) {
      return html`<div class="selected">
        <span class="name">${this._name(this.value)}</span>
        <button class="clear" title="Effacer" @click=${() => this._emit("")}>×</button>
      </div>`;
    }
    return html`
      <input
        .value=${this._query}
        placeholder="Rechercher un appareil…"
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
            ${this._filtered.length
              ? this._filtered.map(
                  (id) =>
                    html`<div
                      class="sugg"
                      @mousedown=${() => {
                        this._query = "";
                        this._open = false;
                        this._emit(id);
                      }}
                    >
                      ${this._name(id)}
                    </div>`
                )
              : html`<div class="sugg">Aucun appareil</div>`}
          </div>`
        : ""}
    `;
  }
}
