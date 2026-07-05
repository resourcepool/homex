import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, ShutterPreset } from "../types";
import { fetchShutterPresets } from "../api";
import { sharedStyles } from "../lib/styles";
import "./homex-shutter-preset-editor";

/** Shutter Manager page: manage Shutter Device Presets (per shutter model). */
@customElement("homex-shutter-manager")
export class HomexShutterManager extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;

  @state() private _presets: ShutterPreset[] = [];
  @state() private _loaded = false;
  @state() private _editing = false;
  @state() private _edit: ShutterPreset | null = null;

  static styles = [
    sharedStyles,
    css`
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .head h2 {
        flex: 1;
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
      button {
        cursor: pointer;
        border: none;
        border-radius: 8px;
        padding: 8px 12px;
        background: var(--secondary-background-color, #f0f0f0);
        color: var(--primary-text-color);
      }
      button.primary {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 12px;
      }
      .card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        cursor: pointer;
        background: var(--card-background-color, #1c1c1c);
      }
      .card:hover {
        border-color: var(--primary-color);
      }
      .icon {
        flex: 0 0 auto;
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
      }
      .name {
        font-size: 15px;
        font-weight: 500;
      }
      .meta {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .msg {
        padding: 24px 4px;
        color: var(--secondary-text-color);
      }
      .editor {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        padding: 16px;
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._load();
  }
  private async _load() {
    try {
      this._presets = await fetchShutterPresets(this.hass);
    } catch {
      this._presets = [];
    }
    this._loaded = true;
  }

  private _back() {
    this.dispatchEvent(new CustomEvent("close"));
  }
  private _onClosed() {
    this._editing = false;
    this._load();
  }

  render() {
    if (this._editing) {
      return html`
        <div class="head">
          <button @click=${this._onClosed}>← Presets</button>
          <h2>${this._edit ? "Modifier le preset" : "Nouveau shutter device preset"}</h2>
        </div>
        <div class="editor">
          <homex-shutter-preset-editor
            .hass=${this.hass}
            .preset=${this._edit}
            @shutter-preset-closed=${this._onClosed}
          ></homex-shutter-preset-editor>
        </div>
      `;
    }
    return html`
      <div class="head">
        <button @click=${this._back}>← Homex</button>
        <h2>Shutter Manager</h2>
        <button
          class="primary"
          @click=${() => {
            this._edit = null;
            this._editing = true;
          }}
        >
          ＋ Preset
        </button>
      </div>
      ${!this._loaded
        ? html`<div class="msg">Chargement…</div>`
        : !this._presets.length
          ? html`<div class="msg">
              Aucun shutter device preset. Clique sur « ＋ Preset » pour définir
              le pilotage d'un modèle de volet.
            </div>`
          : html`<div class="grid">
              ${this._presets.map(
                (p) => html`<div
                  class="card"
                  @click=${() => {
                    this._edit = p;
                    this._editing = true;
                  }}
                >
                  <div class="icon">🪟</div>
                  <div class="info">
                    <div class="name">${p.name}</div>
                    <div class="meta">
                      ${p.model_label}${p.smart_toggle ? " · permutation intelligente" : ""}
                    </div>
                  </div>
                </div>`
              )}
            </div>`}
    `;
  }
}
