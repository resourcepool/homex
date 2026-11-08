import { LitElement, css, html, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  DevicePreset,
  GlobalSwitch,
  HomeAssistant,
  SwitchLayout,
} from "../types";
import { fetchGlobalSwitches, fetchLayouts, fetchPresets } from "../api";
import { resolveSwitchPreset } from "../lib/device";
import { goBack, joinPath, navigate, segments } from "../lib/router";
import { sharedStyles } from "../lib/styles";
import { t } from "../lib/i18n";
import "./homex-layout-editor";
import "./homex-preset-editor";
import "./homex-gswitch-editor";

type Section = "layouts" | "presets" | "switches";
const SECTIONS: Section[] = ["switches", "presets", "layouts"];

/** Switch Manager: Switch Layouts, Device Presets and Switch Management. */
@customElement("homex-switch-manager")
export class HomexSwitchManager extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  /** URL of the manager (the Switches tab). */
  @property({ attribute: false }) base = "";
  /** Sub-page below `base`: "<section>[/new | /edit/<id>]". */
  @property({ attribute: false }) subpath = "";

  @state() private _addRooms: string[] = [];
  @state() private _layouts: SwitchLayout[] = [];
  @state() private _presets: DevicePreset[] = [];
  @state() private _gswitches: GlobalSwitch[] = [];
  @state() private _loaded = false;

  @state() private _prefillDevice = "";
  // Switch editor URL left to create a preset, returned to when it closes.
  private _switchFlowFrom: string | null = null;
  // Switch form left to create a preset, restored when the preset closes.
  @state() private _switchDraft: Partial<GlobalSwitch> | null = null;

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

  private get _route(): { section: Section; editing: boolean; id?: string } {
    const [section, mode, id] = segments(this.subpath);
    return {
      section: SECTIONS.includes(section as Section) ? (section as Section) : "switches",
      editing: mode === "new" || (mode === "edit" && !!id),
      id: mode === "edit" ? id : undefined,
    };
  }
  private get _section(): Section {
    return this._route.section;
  }

  /** URL of a section list, or of its editor ("new" / "edit", id). */
  private _url(section: Section, ...rest: string[]): string {
    return section === "switches" && !rest.length
      ? this.base
      : joinPath(this.base, section, ...rest);
  }
  private _openEditor(section: Section, id?: string) {
    navigate(this._url(section, ...(id ? ["edit", id] : ["new"])));
  }

  willUpdate(changed: Map<string, unknown>) {
    if (!changed.has("subpath")) return;
    const { section, editing, id } = this._route;
    if (!editing) {
      // Back on a list: the switch → preset round trip is over.
      this._switchDraft = null;
      this._switchFlowFrom = null;
    } else if (section === "switches" && !id && !this._switchDraft) {
      // A room card's "＋ Interrupteur" links here with ?room=<room_id> to
      // pre-associate the originating room.
      const room = new URLSearchParams(location.search).get("room");
      this._addRooms = room ? [room] : [];
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
    this._load();
    goBack(this._url("layouts"));
  }
  private _onPresetClosed(e?: CustomEvent) {
    this._prefillDevice = "";
    this._load();
    const from = this._switchFlowFrom;
    if (from) {
      // Back to the switch being edited, on the preset just created (if any).
      const savedId = e?.detail?.preset_id;
      if (savedId && this._switchDraft) {
        this._switchDraft = { ...this._switchDraft, preset_id: savedId };
      }
      this._switchFlowFrom = null;
      goBack(from);
    } else {
      goBack(this._url("presets"));
    }
  }
  private _onSwitchClosed() {
    this._switchDraft = null;
    this._load();
    goBack(this._url("switches"));
  }
  private _onCreatePreset(e: CustomEvent) {
    // From the switch editor: no preset for the device model — create one.
    this._switchDraft = e.detail.draft ?? null;
    this._prefillDevice = e.detail.device_id || "";
    this._switchFlowFrom = location.pathname;
    this._openEditor("presets");
  }

  private _add() {
    this._prefillDevice = "";
    this._switchDraft = null;
    this._addRooms = [];
    this._openEditor(this._section);
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

  /** The item an "edit/<id>" sub-page points to, or a placeholder page while
   * loading / when the id is unknown (deep link to a deleted item). */
  private _editTarget<T extends { id: string }>(
    items: T[],
    back: () => void,
    backLabel: string
  ): { item: T | null } | { page: unknown } {
    const id = this._route.id;
    if (!id) return { item: null };
    const item = items.find((x) => x.id === id);
    if (item) return { item };
    return {
      page: html`
        <div class="head">
          <button @click=${back}>← ${backLabel}</button>
          <h2></h2>
        </div>
        <div class="msg">
          ${this._loaded ? t("switchManager.not_found", { id }) : t("common.loading")}
        </div>
      `,
    };
  }

  render() {
    const { section, editing } = this._route;
    if (editing && section === "layouts") {
      const back = () => this._onLayoutClosed();
      const target = this._editTarget(this._layouts, back, t("switchManager.layouts"));
      if ("page" in target) return target.page;
      return html`
        <div class="head">
          <button @click=${back}>← ${t("switchManager.layouts")}</button>
          <h2>${target.item ? t("switchManager.edit_layout") : t("switchManager.new_layout")}</h2>
        </div>
        <homex-layout-editor
          .hass=${this.hass}
          .layout=${target.item}
          @layout-closed=${this._onLayoutClosed}
        ></homex-layout-editor>
      `;
    }
    if (editing && section === "presets") {
      const back = () => this._onPresetClosed();
      const target = this._editTarget(this._presets, back, t("switchManager.presets"));
      if ("page" in target) return target.page;
      return html`
        <div class="head">
          <button @click=${back}>← ${t("switchManager.presets")}</button>
          <h2>${target.item ? t("switchManager.edit_preset") : t("switchManager.new_preset")}</h2>
        </div>
        <div class="editor">
          <homex-preset-editor
            .hass=${this.hass}
            .preset=${target.item}
            .layouts=${this._layouts}
            .prefillDevice=${this._prefillDevice}
            @preset-closed=${this._onPresetClosed}
          ></homex-preset-editor>
        </div>
      `;
    }
    if (editing) {
      const back = () => this._onSwitchClosed();
      const target = this._editTarget(this._gswitches, back, t("switchManager.switches"));
      if ("page" in target) return target.page;
      return html`
        <div class="head">
          <button @click=${back}>← ${t("switchManager.switches")}</button>
          <h2>${target.item ? t("switchManager.edit_switch") : t("switchManager.new_switch")}</h2>
        </div>
        <div class="editor">
          <homex-gswitch-editor
            .hass=${this.hass}
            .sw=${target.item}
            .presets=${this._presets}
            .initialRooms=${this._addRooms}
            .draft=${this._switchDraft}
            @switch-closed=${this._onSwitchClosed}
            @create-preset=${this._onCreatePreset}
          ></homex-gswitch-editor>
        </div>
      `;
    }

    const addLabel =
      this._section === "layouts"
        ? t("switchManager.add_layout")
        : this._section === "presets"
          ? t("switchManager.add_preset")
          : t("switchManager.add_switch");
    return html`
      <div class="head">
        <button @click=${this._back}>← Homex</button>
        <h2>${t("switchManager.title")}</h2>
        <button class="primary" @click=${this._add}>${addLabel}</button>
      </div>
      <div class="tabs">
        ${(
          [
            ["switches", t("switchManager.switches")],
            ["presets", t("switchManager.presets")],
            ["layouts", t("switchManager.layouts")],
          ] as [Section, string][]
        ).map(
          ([key, label]) => html`<span
            class="tab ${this._section === key ? "active" : ""}"
            @click=${() => {
              if (key !== this._section) navigate(this._url(key), true);
            }}
            >${label}</span
          >`
        )}
      </div>
      ${!this._loaded
        ? html`<div class="msg">${t("common.loading")}</div>`
        : this._section === "layouts"
          ? this._renderLayouts()
          : this._section === "presets"
            ? this._renderPresets()
            : this._renderSwitches()}
    `;
  }

  private _renderLayouts() {
    if (!this._layouts.length) {
      return html`<div class="msg">${t("switchManager.no_layouts")}</div>`;
    }
    return html`<div class="grid">
      ${this._layouts.map(
        (l) => html`<div
          class="card"
          @click=${() => this._openEditor("layouts", l.id)}
        >
          ${this._preview(l)}
          <div class="info">
            <div class="name">${l.name}</div>
            <div class="meta">${t("switchManager.layout_meta", { count: l.buttons, shape: t(`switchManager.shape_${l.shape}`) })}</div>
          </div>
        </div>`
      )}
    </div>`;
  }

  private _renderPresets() {
    if (!this._presets.length) {
      return html`<div class="msg">${t("switchManager.no_presets")}</div>`;
    }
    return html`<div class="grid">
      ${this._presets.map((p) => {
        const layout = this._layouts.find((l) => l.id === p.layout_id);
        return html`<div
          class="card"
          @click=${() => {
            this._prefillDevice = "";
            this._openEditor("presets", p.id);
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
      return html`<div class="msg">${t("switchManager.no_switches")}</div>`;
    }
    return html`<div class="grid">
      ${this._gswitches.map((s) => {
        const preset = resolveSwitchPreset(this.hass, this._presets, s);
        const layout = preset
          ? this._layouts.find((l) => l.id === preset.layout_id)
          : undefined;
        return html`<div
          class="card"
          @click=${() => this._openEditor("switches", s.id)}
        >
          ${layout ? this._preview(layout) : html`<div class="icon">🎛</div>`}
          <div class="info">
            <div class="name">${s.name}</div>
            <div class="meta">
              ${preset ? preset.name : t("switchManager.no_preset")} ·
              ${t("switchManager.rooms_count", { count: (s.rooms || []).length })}
            </div>
          </div>
        </div>`;
      })}
    </div>`;
  }
}
