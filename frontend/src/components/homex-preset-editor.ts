import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  DevicePreset,
  HomeAssistant,
  SwitchDevice,
  SwitchLayout,
  SwitchModel,
  TapMode,
} from "../types";
import type { DeviceTrigger } from "../api";
import {
  deletePreset,
  errorMessage,
  fetchDeviceTriggers,
  fetchSwitchDevices,
  fetchSwitchModels,
  savePreset,
} from "../api";
import { deviceModelKey, deviceModelLabel } from "../lib/device";
import { sharedStyles } from "../lib/styles";
import { t } from "../lib/i18n";
import "./homex-select";
import { textField } from "../lib/fields";
import { slugify } from "../lib/slug";

/** Editor for a device preset: model + layout + tap modes + action bindings. */
@customElement("homex-preset-editor")
export class HomexPresetEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) preset: DevicePreset | null = null;
  @property({ attribute: false }) layouts: SwitchLayout[] = [];
  @property({ attribute: false }) prefillDevice = "";

  @state() private _name = "";
  private _nameTyped = false; // name typed by the user (not a model default)
  @state() private _id = "";
  @state() private _deviceId = ""; // reference device the actions are pulled from
  @state() private _modelKey = "";
  @state() private _models: SwitchModel[] = [];
  @state() private _devices: SwitchDevice[] = []; // all switch-like devices
  @state() private _layoutId = "";
  @state() private _taps: Record<string, TapMode[]> = {};
  @state() private _bindings: Record<string, Record<string, string[]>> = {};
  @state() private _actions: DeviceTrigger[] = [];
  @state() private _actionTab: TapMode = "single";
  @state() private _busy = false;
  private _idEdited = false;

  private static readonly TAP_MODES: { mode: TapMode }[] = [
    { mode: "single" },
    { mode: "double" },
    { mode: "long" },
  ];
  private static _tapLabel(mode: TapMode): string {
    return t(`presetEditor.tap_${mode}`);
  }

  static styles = [
    sharedStyles,
    css`
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 0 0 8px;
      }
      .model {
        font-size: 13px;
        margin: 4px 0 8px;
      }
      .btn-row,
      .bind-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 8px 0;
      }
      .bind-row {
        align-items: center;
        border-top: 1px solid var(--divider-color, #ececec);
      }
      .bind-select {
        flex: 1;
        margin: 0;
      }
      .btn-lbl {
        min-width: 84px;
        font-size: 14px;
        font-weight: 500;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .tap {
        padding: 5px 12px;
        border-radius: 14px;
        border: 1px solid var(--divider-color, #ccc);
        cursor: pointer;
        font-size: 13px;
        user-select: none;
      }
      .tap.on {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-color: var(--primary-color);
      }
      .tabs {
        display: flex;
        gap: 4px;
        margin: 8px 0 12px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .atab {
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .atab.active {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
        margin-bottom: -1px;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._loadModels();
    this._loadDevices();
  }
  private async _loadModels() {
    try {
      this._models = await fetchSwitchModels(this.hass);
    } catch {
      this._models = [];
    }
  }
  private async _loadDevices() {
    try {
      this._devices = await fetchSwitchDevices(this.hass);
    } catch {
      this._devices = [];
    }
  }
  /** Individual devices of the currently selected model, name-sorted. */
  private _devicesForModel(): SwitchDevice[] {
    if (!this._modelKey) return [];
    return this._devices.filter((d) => d.model === this._modelKey);
  }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("preset")) {
      const p = this.preset;
      this._name = p?.name ?? "";
      this._nameTyped = !!p;
      this._id = p?.id ?? "";
      this._deviceId = p?.device_id ?? this.prefillDevice ?? "";
      this._modelKey =
        p?.model ??
        (this._deviceId ? deviceModelKey(this.hass, this._deviceId) : "");
      this._layoutId = p?.layout_id ?? "";
      this._taps = JSON.parse(JSON.stringify(p?.taps ?? {}));
      this._bindings = JSON.parse(JSON.stringify(p?.bindings ?? {}));
      this._actions = [];
      this._idEdited = !!p;
      this._busy = false;
      if (!p && this._deviceId && !this._name) {
        this._name = deviceModelLabel(this.hass, this._deviceId);
        this._id = slugify(this._name);
      }
      this._ensureTaps();
      if (this._deviceId) this._loadActions();
    }
  }

  private _selectedLayout(): SwitchLayout | undefined {
    return this.layouts.find((l) => l.id === this._layoutId);
  }
  private _ensureTaps() {
    const n = this._selectedLayout()?.buttons ?? 0;
    const taps: Record<string, TapMode[]> = {};
    for (let i = 1; i <= n; i++) taps[i] = this._taps[i] ?? ["single"];
    this._taps = taps;
  }
  private _toggleTap(btn: number, mode: TapMode) {
    const cur = this._taps[btn] ?? [];
    this._taps = {
      ...this._taps,
      [btn]: cur.includes(mode) ? cur.filter((m) => m !== mode) : [...cur, mode],
    };
  }
  private _onLayout(id: string) {
    this._layoutId = id;
    this._ensureTaps();
  }
  private async _loadActions() {
    try {
      this._actions = await fetchDeviceTriggers(this.hass, this._deviceId);
    } catch {
      this._actions = [];
    }
  }
  private _onModel(key: string) {
    this._modelKey = key;
    const model = this._models.find((m) => m.model === key);
    // Default the reference device to the model's sample; the user may pick a
    // different one below (same model can expose different actions per device).
    this._deviceId = model?.device_id ?? "";
    this._actions = [];
    // Changing model invalidates action bindings (different action set).
    this._bindings = {};
    if (model) {
      // Default the name to the model label unless the user typed one.
      if (!this._name.trim() || !this._nameTyped) {
        this._name = model.label;
        if (!this._idEdited) this._id = slugify(model.label);
      }
      this._loadActions();
    }
  }
  private _onRefDevice(deviceId: string) {
    this._deviceId = deviceId;
    this._actions = [];
    // A different reference device may expose a different action set.
    this._bindings = {};
    if (deviceId) this._loadActions();
  }
  private _enabledModes(): TapMode[] {
    const set = new Set<TapMode>();
    Object.values(this._taps).forEach((ms) => ms.forEach((m) => set.add(m)));
    return HomexPresetEditor.TAP_MODES.map((tm) => tm.mode).filter((m) =>
      set.has(m)
    );
  }
  private _buttonsFor(mode: TapMode): number[] {
    return Object.entries(this._taps)
      .filter(([, ms]) => ms.includes(mode))
      .map(([b]) => Number(b))
      .sort((a, b) => a - b);
  }
  /** Set the single action bound to (mode, btn); "" clears it. */
  private _setBind(mode: string, btn: number, value: string) {
    this._bindings = {
      ...this._bindings,
      [mode]: {
        ...(this._bindings[mode] ?? {}),
        [btn]: value ? [value] : [],
      },
    };
  }
  /** Action labels already used by any other (mode, button) — one use each. */
  private _usedActions(exceptMode: string, exceptBtn: number): Set<string> {
    const used = new Set<string>();
    for (const [mode, byBtn] of Object.entries(this._bindings)) {
      for (const [btn, labels] of Object.entries(byBtn)) {
        if (mode === exceptMode && Number(btn) === exceptBtn) continue;
        (labels ?? []).forEach((l) => used.add(l));
      }
    }
    return used;
  }
  private _onName(v: string) {
    this._name = v;
    this._nameTyped = true;
    if (!this._idEdited) this._id = slugify(v);
  }
  private _onId(v: string) {
    this._id = v;
    this._idEdited = true;
  }
  /** ``savedId``: the preset just saved, so a caller can select it. */
  private _close(savedId = "") {
    this.dispatchEvent(
      new CustomEvent("preset-closed", { detail: { preset_id: savedId } })
    );
  }

  private async _save() {
    const name = this._name.trim();
    const id = this._id.trim();
    if (!name || !id) {
      alert(t("presetEditor.name_id_required"));
      return;
    }
    if (!this._deviceId) {
      alert(t("presetEditor.choose_device_model"));
      return;
    }
    if (!this._layoutId) {
      alert(t("presetEditor.select_layout"));
      return;
    }
    this._busy = true;
    try {
      await savePreset(this.hass, {
        id,
        name,
        model: deviceModelKey(this.hass, this._deviceId),
        model_label: deviceModelLabel(this.hass, this._deviceId),
        device_id: this._deviceId,
        layout_id: this._layoutId,
        taps: this._taps,
        bindings: this._bindings,
      });
      this._close(id);
    } catch (err) {
      this._busy = false;
      alert(t("common.error", { message: errorMessage(err) }));
    }
  }
  private async _delete() {
    if (!this.preset) return;
    if (!confirm(t("presetEditor.confirm_delete", { name: this.preset.name }))) return;
    this._busy = true;
    try {
      await deletePreset(this.hass, this.preset.id);
      this._close();
    } catch (err) {
      this._busy = false;
      alert(t("common.error", { message: errorMessage(err) }));
    }
  }

  private _renderActions() {
    if (!this._deviceId) return "";
    if (!this._actions.length) {
      return html`<p class="hint">${t("presetEditor.no_actions")}</p>`;
    }
    const modes = this._enabledModes();
    if (!modes.length) return "";
    const active = modes.includes(this._actionTab) ? this._actionTab : modes[0];
    const label = (m: TapMode) => HomexPresetEditor._tapLabel(m);
    return html`
      <div class="section">${t("presetEditor.actions_per_button")}</div>
      <p class="hint">${t("presetEditor.actions_hint")}</p>
      <div class="tabs">
        ${modes.map(
          (m) => html`<span
            class="atab ${m === active ? "active" : ""}"
            @click=${() => (this._actionTab = m)}
            >${label(m)}</span
          >`
        )}
      </div>
      ${this._buttonsFor(active).map((btn) => {
        const current = this._bindings[active]?.[btn]?.[0] ?? "";
        const used = this._usedActions(active, btn);
        return html`<div class="bind-row">
          <div class="btn-lbl">${t("presetEditor.button", { n: btn })}</div>
          <homex-select
            class="bind-select"
            placeholder=${t("presetEditor.no_action")}
            .value=${current}
            .options=${this._actions
              .filter((a) => !used.has(a.label) || a.label === current)
              .map((a) => ({ value: a.label, label: a.label }))}
            @value-changed=${(e: CustomEvent) => this._setBind(active, btn, e.detail.value)}
          ></homex-select>
        </div>`;
      })}
    `;
  }

  render() {
    const editing = !!this.preset;
    return html`
      ${textField(t("presetEditor.name"), this._name, (v) => this._onName(v), t("presetEditor.name_placeholder"))}
      ${editing
        ? html`<div class="section">${t("presetEditor.id", { id: this.preset!.id })}</div>`
        : ""}

      <div class="section">${t("presetEditor.switch_model")}</div>
      ${this._models.length
        ? html`<homex-select
            placeholder=${t("presetEditor.choose_model")}
            .value=${this._modelKey}
            .options=${this._models.map((m) => ({
              value: m.model,
              label: m.label,
              tertiary: t("presetEditor.devices_count", { count: m.count }),
            }))}
            @value-changed=${(e: CustomEvent) => this._onModel(e.detail.value)}
          ></homex-select>`
        : html`<p class="hint">${t("presetEditor.no_switches")}</p>`}

      ${this._modelKey
        ? html`<div class="section">${t("presetEditor.ref_device")}</div>
            <p class="hint">${t("presetEditor.ref_device_hint")}</p>
            ${this._devicesForModel().length
              ? html`<homex-select
                  placeholder=${t("presetEditor.choose_device")}
                  .value=${this._deviceId}
                  .options=${this._devicesForModel().map((d) => ({
                    value: d.device_id,
                    label: d.name,
                  }))}
                  @value-changed=${(e: CustomEvent) => this._onRefDevice(e.detail.value)}
                ></homex-select>`
              : html`<p class="hint">${t("presetEditor.no_devices_for_model")}</p>`}`
        : ""}

      <div class="section">${t("presetEditor.layout")}</div>
      ${this.layouts.length
        ? html`<homex-select
            placeholder=${t("presetEditor.choose_layout")}
            .value=${this._layoutId}
            .options=${this.layouts.map((l) => ({
              value: l.id,
              label: l.name,
              tertiary: t("presetEditor.buttons_count", { count: l.buttons }),
            }))}
            @value-changed=${(e: CustomEvent) => this._onLayout(e.detail.value)}
          ></homex-select>`
        : html`<p class="hint">${t("presetEditor.no_layouts")}</p>`}

      ${this._selectedLayout()
        ? html`
            <div class="section">${t("presetEditor.tap_modes")}</div>
            <p class="hint">${t("presetEditor.tap_modes_hint")}</p>
            ${Array.from(
              { length: this._selectedLayout()!.buttons },
              (_, i) => i + 1
            ).map(
              (btn) => html`<div class="btn-row">
                <span class="btn-lbl">${t("presetEditor.button", { n: btn })}</span>
                <div class="chips">
                  ${HomexPresetEditor.TAP_MODES.map(
                    (tm) => html`<span
                      class="tap ${(this._taps[btn] ?? []).includes(tm.mode)
                        ? "on"
                        : ""}"
                      @click=${() => this._toggleTap(btn, tm.mode)}
                      >${HomexPresetEditor._tapLabel(tm.mode)}</span
                    >`
                  )}
                </div>
              </div>`
            )}
            ${this._renderActions()}
          `
        : ""}

      <div class="actions">
        ${editing
          ? html`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              ${t("common.delete")}
            </button>`
          : ""}
        <button @click=${this._close}>${t("common.cancel")}</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._save}>
          ${editing ? t("common.save") : t("presetEditor.create_preset")}
        </button>
      </div>
    `;
  }
}
