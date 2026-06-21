import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "../types";

/**
 * Multi-device selector (chips + autocomplete), self-contained — reads the
 * device registry from `hass.devices`. Emits `value-changed` with the
 * selected device ids.
 */
@customElement("homex-device-picker")
export class HomexDevicePicker extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Array }) value: string[] = [];

  @state() private _query = "";
  @state() private _open = false;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      position: relative;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      background: var(--secondary-background-color, #eee);
      border-radius: 16px;
      padding: 6px 6px 6px 14px;
    }
    .chipx {
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      padding: 0 6px;
      border-radius: 50%;
      color: var(--secondary-text-color);
    }
    input {
      width: 100%;
      box-sizing: border-box;
      padding: 13px 14px;
      font-size: 16px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
    }
    input:focus {
      outline: none;
      border-color: var(--primary-color, #03a9f4);
      box-shadow: 0 0 0 1px var(--primary-color, #03a9f4);
    }
    .suggestions {
      position: absolute;
      z-index: 20;
      left: 0;
      right: 0;
      margin-top: 2px;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 6px;
      max-height: 240px;
      overflow: auto;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
    }
    .sugg {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      padding: 11px 14px;
      cursor: pointer;
      font-size: 15px;
    }
    .sugg:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }
    .sid {
      color: var(--secondary-text-color);
      font-size: 11px;
    }
    .empty {
      cursor: default;
      color: var(--secondary-text-color);
    }
  `;

  private _name(deviceId: string): string {
    const dev = this.hass?.devices?.[deviceId];
    return (dev && (dev.name_by_user || dev.name)) || deviceId;
  }

  private get _candidates(): string[] {
    const devices = this.hass?.devices || {};
    return Object.keys(devices).sort((a, b) =>
      this._name(a).localeCompare(this._name(b))
    );
  }

  private get _filtered(): string[] {
    const selected = new Set(this.value);
    const q = this._query.trim().toLowerCase();
    return this._candidates
      .filter((id) => !selected.has(id))
      .filter((id) => !q || this._name(id).toLowerCase().includes(q))
      .slice(0, 10);
  }

  private _emit(value: string[]) {
    this.value = value;
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value } }));
  }

  private _add(id: string) {
    if (!this.value.includes(id)) this._emit([...this.value, id]);
    this._query = "";
    this._open = false;
  }
  private _remove(id: string) {
    this._emit(this.value.filter((v) => v !== id));
  }

  render() {
    return html`
      <div class="chips">
        ${this.value.map(
          (id) =>
            html`<span class="chip"
              >${this._name(id)}<button
                class="chipx"
                title="Retirer"
                @click=${() => this._remove(id)}
              >
                ×</button
              ></span
            >`
        )}
      </div>
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
                  (id) => html`<div class="sugg" @mousedown=${() => this._add(id)}>
                    <span>${this._name(id)}</span><span class="sid">${id}</span>
                  </div>`
                )
              : html`<div class="sugg empty">Aucun appareil</div>`}
          </div>`
        : ""}
    `;
  }
}
