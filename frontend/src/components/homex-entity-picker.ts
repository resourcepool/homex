import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "../types";
import { haComponentsLoaded } from "../lib/ha-elements";

/**
 * Multi-entity selector. Uses Home Assistant's native `ha-entities-picker`
 * (add entity by entity, native autocomplete) when it is available, and falls
 * back to a self-contained chips + autocomplete widget otherwise.
 *
 * Emits `value-changed` with `{ value: string[] }`.
 */
@customElement("homex-entity-picker")
export class HomexEntityPicker extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Array }) value: string[] = [];
  @property({ attribute: false }) includeDomains?: string[];
  @property({ attribute: false }) includeEntities?: string[];

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
      align-items: center;
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
    ha-entity-picker {
      display: block;
      width: 100%;
      margin-bottom: 8px;
    }
  `;

  private _friendly(id: string): string {
    return this.hass?.states?.[id]?.attributes?.friendly_name || id;
  }

  private _emit(value: string[]) {
    this.value = value;
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value } }));
  }

  private _setAt(i: number, id: string) {
    const next = id
      ? this.value.map((v, j) => (j === i ? id : v))
      : this.value.filter((_, j) => j !== i);
    this._emit([...new Set(next)]);
  }
  private _addNew(id: string) {
    if (id && !this.value.includes(id)) this._emit([...this.value, id]);
  }

  private _nativePicker(value: string, onChange: (id: string) => void) {
    return html`<ha-entity-picker
      .hass=${this.hass}
      .value=${value}
      .includeDomains=${this.includeDomains}
      .includeEntities=${this.includeEntities}
      @value-changed=${(e: CustomEvent) => {
        e.stopPropagation();
        onChange(e.detail.value || "");
      }}
    ></ha-entity-picker>`;
  }

  render() {
    // Build a multi-entity picker from the native single ha-entity-picker
    // (which IS preloaded in panels, unlike ha-entities-picker): one row per
    // selected entity + a trailing empty row to add another.
    if (customElements.get("ha-entity-picker")) {
      return html`
        ${this.value.map((id, i) => this._nativePicker(id, (v) => this._setAt(i, v)))}
        ${this._nativePicker("", (v) => this._addNew(v))}
      `;
    }
    return this._renderFallback();
  }

  // --- fallback widget ---------------------------------------------------

  private get _candidates(): string[] {
    if (this.includeEntities) return [...this.includeEntities].sort();
    const domains = this.includeDomains || [];
    return Object.keys(this.hass.states)
      .filter((id) => domains.includes(id.split(".")[0]))
      .sort();
  }

  private get _filtered(): string[] {
    const selected = new Set(this.value);
    const q = this._query.trim().toLowerCase();
    return this._candidates
      .filter((id) => !selected.has(id))
      .filter(
        (id) =>
          !q ||
          id.toLowerCase().includes(q) ||
          this._friendly(id).toLowerCase().includes(q)
      )
      .slice(0, 10);
  }

  private _add(id: string) {
    if (!this.value.includes(id)) this._emit([...this.value, id]);
    this._query = "";
    this._open = false;
  }
  private _remove(id: string) {
    this._emit(this.value.filter((v) => v !== id));
  }

  private _renderFallback() {
    return html`
      <div class="chips">
        ${this.value.map(
          (id) =>
            html`<span class="chip"
              >${this._friendly(id)}<button
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
        placeholder="Rechercher une entité…"
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
                    <span>${this._friendly(id)}</span><span class="sid">${id}</span>
                  </div>`
                )
              : html`<div class="sugg empty">Aucune entité</div>`}
          </div>`
        : ""}
    `;
  }
}
