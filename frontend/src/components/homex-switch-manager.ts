import { LitElement, css, html, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  DevicePreset,
  GlobalSwitch,
  HomeAssistant,
  SwitchLayout,
} from "../types";
import { fetchGlobalSwitches, fetchLayouts, fetchPresets } from "../api";
import { deviceModelKey } from "../lib/device";
import { sharedStyles } from "../lib/styles";
import "./homex-layout-editor";
import "./homex-preset-editor";
import "./homex-gswitch-editor";

type Section = "layouts" | "presets" | "switches";

/** Switch Manager: Switch Layouts, Device Presets and Switch Management. */
@customElement("homex-switch-manager")
export class HomexSwitchManager extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) startAdd = false;
  @property({ attribute: false }) startAddRoom: string | null = null;

  @state() private _section: Section = "switches";
  @state() private _addRooms: string[] = [];
  private _startAddHandled = false;
  @state() private _layouts: SwitchLayout[] = [];
  @state() private _presets: DevicePreset[] = [];
  @state() private _gswitches: GlobalSwitch[] = [];
  @state() private _loaded = false;

  @state() private _editingLayout = false;
  @state() private _editLayout: SwitchLayout | null = null;
  @state() private _editingPreset = false;
  @state() private _editPreset: DevicePreset | null = null;
  @state() private _prefillDevice = "";
  @state() private _editingSwitch = false;
  @state() private _editSwitch: GlobalSwitch | null = null;
  private _fromSwitchFlow = false;

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
      .tabs {
        display: flex;
        gap: 4px;
        margin: 0 0 16px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .tab {
        padding: 10px 18px;
        font-size: 15px;
        font-weight: 500;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .tab.active {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
        margin-bottom: -1px;
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
      .info {
        min-width: 0;
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
      svg.preview {
        width: 56px;
        height: 56px;
        flex: 0 0 auto;
        background: var(--code-editor-background-color, #111);
        border-radius: 6px;
      }
      .preview .sh {
        fill: none;
        stroke: var(--primary-color);
        stroke-width: 0.2;
      }
      .preview .zn {
        fill: color-mix(in srgb, var(--primary-color) 20%, transparent);
        stroke: color-mix(in srgb, var(--primary-color) 45%, transparent);
        stroke-width: 0.12;
      }
      .preview text {
        fill: #fff;
        font-size: 2px;
        font-weight: 700;
        text-anchor: middle;
        dominant-baseline: central;
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

  willUpdate() {
    // Opened from a room card's "＋ Interrupteur": jump straight to adding a
    // switch, pre-associating the originating room.
    if (this.startAdd && !this._startAddHandled) {
      this._startAddHandled = true;
      this._section = "switches";
      this._editSwitch = null;
      this._addRooms = this.startAddRoom ? [this.startAddRoom] : [];
      this._editingSwitch = true;
    }
  }

  private async _load() {
    try {
      [this._layouts, this._presets, this._gswitches] = await Promise.all([
        fetchLayouts(this.hass),
        fetchPresets(this.hass),
        fetchGlobalSwitches(this.hass),
      ]);
    } catch {
      this._layouts = [];
      this._presets = [];
      this._gswitches = [];
    }
    this._loaded = true;
  }

  private _back() {
    this.dispatchEvent(new CustomEvent("close"));
  }
  private _onLayoutClosed() {
    this._editingLayout = false;
    this._load();
  }
  private _onPresetClosed() {
    this._editingPreset = false;
    this._prefillDevice = "";
    this._load();
    if (this._fromSwitchFlow) {
      this._fromSwitchFlow = false;
      this._section = "switches";
    }
  }
  private _onSwitchClosed() {
    this._editingSwitch = false;
    this._load();
  }
  private _onCreatePreset(e: CustomEvent) {
    // From the switch editor: no preset for the device model — create one.
    this._editingSwitch = false;
    this._prefillDevice = e.detail.device_id || "";
    this._editPreset = null;
    this._editingPreset = true;
    this._fromSwitchFlow = true;
    this._section = "presets";
  }

  private _add() {
    if (this._section === "layouts") {
      this._editLayout = null;
      this._editingLayout = true;
    } else if (this._section === "presets") {
      this._editPreset = null;
      this._prefillDevice = "";
      this._editingPreset = true;
    } else {
      this._editSwitch = null;
      this._addRooms = [];
      this._editingSwitch = true;
    }
  }

  private _preview(l: SwitchLayout) {
    const b = l.bounds;
    const clipId = `clip-${l.id}`;
    const round = l.shape === "round";
    const clipShape = round
      ? svg`<ellipse cx=${b.x + b.w / 2} cy=${b.y + b.h / 2} rx=${b.w / 2} ry=${b.h / 2}></ellipse>`
      : svg`<rect x=${b.x} y=${b.y} width=${b.w} height=${b.h} rx="0.4"></rect>`;
    const outline = round
      ? svg`<ellipse class="sh" cx=${b.x + b.w / 2} cy=${b.y + b.h / 2} rx=${b.w / 2} ry=${b.h / 2}></ellipse>`
      : svg`<rect class="sh" x=${b.x} y=${b.y} width=${b.w} height=${b.h} rx="0.4"></rect>`;
    return html`<svg class="preview" viewBox="-10 -10 20 20">
      <defs><clipPath id=${clipId}>${clipShape}</clipPath></defs>
      ${(l.zones || []).map(
        (z) => svg`<rect class="zn" x=${z.x} y=${z.y} width=${z.w} height=${z.h}
          clip-path="url(#${clipId})"></rect>`
      )}
      ${outline}
      ${(l.positions || []).map(
        (p) => svg`<circle class="zn" cx=${p.x} cy=${p.y} r="1.3"></circle>
          <text x=${p.x} y=${p.y}>${p.n}</text>`
      )}
    </svg>`;
  }

  render() {
    if (this._editingLayout) {
      return html`
        <div class="head">
          <button @click=${this._onLayoutClosed}>← Layouts</button>
          <h2>${this._editLayout ? "Modifier le layout" : "Nouveau layout"}</h2>
        </div>
        <homex-layout-editor
          .hass=${this.hass}
          .layout=${this._editLayout}
          @layout-closed=${this._onLayoutClosed}
        ></homex-layout-editor>
      `;
    }
    if (this._editingPreset) {
      return html`
        <div class="head">
          <button @click=${this._onPresetClosed}>← Presets</button>
          <h2>${this._editPreset ? "Modifier le preset" : "Nouveau device preset"}</h2>
        </div>
        <div class="editor">
          <homex-preset-editor
            .hass=${this.hass}
            .preset=${this._editPreset}
            .layouts=${this._layouts}
            .prefillDevice=${this._prefillDevice}
            @preset-closed=${this._onPresetClosed}
          ></homex-preset-editor>
        </div>
      `;
    }
    if (this._editingSwitch) {
      return html`
        <div class="head">
          <button @click=${this._onSwitchClosed}>← Switches</button>
          <h2>${this._editSwitch ? "Modifier le switch" : "Nouveau switch"}</h2>
        </div>
        <div class="editor">
          <homex-gswitch-editor
            .hass=${this.hass}
            .sw=${this._editSwitch}
            .presets=${this._presets}
            .initialRooms=${this._addRooms}
            @switch-closed=${this._onSwitchClosed}
            @create-preset=${this._onCreatePreset}
          ></homex-gswitch-editor>
        </div>
      `;
    }

    const addLabel =
      this._section === "layouts"
        ? "＋ Layout"
        : this._section === "presets"
          ? "＋ Preset"
          : "＋ Switch";
    return html`
      <div class="head">
        <button @click=${this._back}>← Homex</button>
        <h2>Switch Manager</h2>
        <button class="primary" @click=${this._add}>${addLabel}</button>
      </div>
      <div class="tabs">
        ${(
          [
            ["switches", "Switches"],
            ["presets", "Presets"],
            ["layouts", "Layouts"],
          ] as [Section, string][]
        ).map(
          ([key, label]) => html`<span
            class="tab ${this._section === key ? "active" : ""}"
            @click=${() => (this._section = key)}
            >${label}</span
          >`
        )}
      </div>
      ${!this._loaded
        ? html`<div class="msg">Chargement…</div>`
        : this._section === "layouts"
          ? this._renderLayouts()
          : this._section === "presets"
            ? this._renderPresets()
            : this._renderSwitches()}
    `;
  }

  private _renderLayouts() {
    if (!this._layouts.length) {
      return html`<div class="msg">Aucun layout. Clique sur « ＋ Layout ».</div>`;
    }
    return html`<div class="grid">
      ${this._layouts.map(
        (l) => html`<div
          class="card"
          @click=${() => {
            this._editLayout = l;
            this._editingLayout = true;
          }}
        >
          ${this._preview(l)}
          <div class="info">
            <div class="name">${l.name}</div>
            <div class="meta">${l.buttons} bouton(s) · ${l.shape}</div>
          </div>
        </div>`
      )}
    </div>`;
  }

  private _renderPresets() {
    if (!this._presets.length) {
      return html`<div class="msg">
        Aucun preset. Clique sur « ＋ Preset » pour définir le mapping standard
        d'un modèle d'appareil.
      </div>`;
    }
    return html`<div class="grid">
      ${this._presets.map((p) => {
        const layout = this._layouts.find((l) => l.id === p.layout_id);
        return html`<div
          class="card"
          @click=${() => {
            this._editPreset = p;
            this._editingPreset = true;
          }}
        >
          ${layout ? this._preview(layout) : html`<div class="icon">🎚</div>`}
          <div class="info">
            <div class="name">${p.name}</div>
            <div class="meta">${p.model_label}</div>
          </div>
        </div>`;
      })}
    </div>`;
  }

  private _renderSwitches() {
    if (!this._gswitches.length) {
      return html`<div class="msg">Aucun switch. Clique sur « ＋ Switch ».</div>`;
    }
    return html`<div class="grid">
      ${this._gswitches.map((s) => {
        const key = deviceModelKey(this.hass, s.device_id);
        const preset = this._presets.find((p) => p.model === key);
        const layout = preset
          ? this._layouts.find((l) => l.id === preset.layout_id)
          : undefined;
        return html`<div
          class="card"
          @click=${() => {
            this._editSwitch = s;
            this._editingSwitch = true;
          }}
        >
          ${layout ? this._preview(layout) : html`<div class="icon">🎛</div>`}
          <div class="info">
            <div class="name">${s.name}</div>
            <div class="meta">
              ${preset ? preset.name : "aucun preset"} ·
              ${(s.rooms || []).length} pièce(s)
            </div>
          </div>
        </div>`;
      })}
    </div>`;
  }
}
