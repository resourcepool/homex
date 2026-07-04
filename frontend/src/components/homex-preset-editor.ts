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

  private static readonly TAP_MODES: { mode: TapMode; label: string }[] = [
    { mode: "single", label: "Simple" },
    { mode: "double", label: "Double" },
    { mode: "long", label: "Long" },
  ];

  static styles = [
    sharedStyles,
    css`
      select {
        width: 100%;
        box-sizing: border-box;
        padding: 12px 14px;
        font-size: 15px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        margin: 6px 0;
      }
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

  updated() {
    // A <select>'s .value binding is applied before its (tab-dependent)
    // <option>s render, so Lit alone loses the selection when switching tap-mode
    // tabs. Reconcile each select with the state after the options exist.
    this.renderRoot
      .querySelectorAll<HTMLSelectElement>(".bind-select")
      .forEach((s) => {
        const mode = s.dataset.mode ?? "";
        const btn = Number(s.dataset.btn);
        const want = this._bindings[mode]?.[btn]?.[0] ?? "";
        if (s.value !== want) s.value = want;
      });
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
      if (!this._idEdited) {
        this._name = model.label;
        this._id = slugify(model.label);
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
    return HomexPresetEditor.TAP_MODES.map((t) => t.mode).filter((m) =>
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
    if (!this._idEdited) this._id = slugify(v);
  }
  private _onId(v: string) {
    this._id = v;
    this._idEdited = true;
  }
  private _close() {
    this.dispatchEvent(new CustomEvent("preset-closed"));
  }

  private async _save() {
    const name = this._name.trim();
    const id = this._id.trim();
    if (!name || !id) {
      alert("Nom et id du preset requis.");
      return;
    }
    if (!this._deviceId) {
      alert("Choisis un appareil (modèle).");
      return;
    }
    if (!this._layoutId) {
      alert("Sélectionne un layout.");
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
      this._close();
    } catch (err) {
      this._busy = false;
      alert("Erreur Homex : " + errorMessage(err));
    }
  }
  private async _delete() {
    if (!this.preset) return;
    if (!confirm(`Supprimer le preset "${this.preset.name}" ?`)) return;
    this._busy = true;
    try {
      await deletePreset(this.hass, this.preset.id);
      this._close();
    } catch (err) {
      this._busy = false;
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  private _renderActions() {
    if (!this._deviceId) return "";
    if (!this._actions.length) {
      return html`<p class="hint">Aucune action disponible pour cet appareil.</p>`;
    }
    const modes = this._enabledModes();
    if (!modes.length) return "";
    const active = modes.includes(this._actionTab) ? this._actionTab : modes[0];
    const label = (m: TapMode) =>
      HomexPresetEditor.TAP_MODES.find((t) => t.mode === m)?.label ?? m;
    return html`
      <div class="section">Actions par bouton</div>
      <p class="hint">
        Pour chaque tap mode, associe chaque bouton aux actions standard du modèle.
      </p>
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
          <div class="btn-lbl">Bouton ${btn}</div>
          <select
            class="bind-select"
            data-mode=${active}
            data-btn=${btn}
            @change=${(e: Event) =>
              this._setBind(active, btn, (e.target as HTMLSelectElement).value)}
          >
            <option value="">— aucune action —</option>
            ${this._actions
              .filter((a) => !used.has(a.label) || a.label === current)
              .map((a) => html`<option value=${a.label}>${a.label}</option>`)}
          </select>
        </div>`;
      })}
    `;
  }

  render() {
    const editing = !!this.preset;
    return html`
      ${textField("Nom du preset", this._name, (v) => this._onName(v), "Modèle X")}
      ${editing
        ? html`<div class="section">Id : ${this.preset!.id}</div>`
        : ""}

      <div class="section">Modèle d'interrupteur</div>
      ${this._models.length
        ? html`<select
            .value=${this._modelKey}
            @change=${(e: Event) =>
              this._onModel((e.target as HTMLSelectElement).value)}
          >
            <option value="">— Choisir un modèle —</option>
            ${this._models.map(
              (m) => html`<option value=${m.model} ?selected=${m.model === this._modelKey}>
                ${m.label} (${m.count})
              </option>`
            )}
          </select>`
        : html`<p class="hint">
            Aucun interrupteur détecté (appareil exposant des actions).
          </p>`}

      ${this._modelKey
        ? html`<div class="section">Appareil de référence</div>
            <p class="hint">
              Appareil du modèle duquel les actions sont récupérées. Un même
              modèle peut exposer des actions différentes selon l'appareil.
            </p>
            ${this._devicesForModel().length
              ? html`<select
                  .value=${this._deviceId}
                  @change=${(e: Event) =>
                    this._onRefDevice((e.target as HTMLSelectElement).value)}
                >
                  <option value="">— Choisir un appareil —</option>
                  ${this._devicesForModel().map(
                    (d) => html`<option
                      value=${d.device_id}
                      ?selected=${d.device_id === this._deviceId}
                    >
                      ${d.name}
                    </option>`
                  )}
                </select>`
              : html`<p class="hint">
                  Aucun appareil détecté pour ce modèle.
                </p>`}`
        : ""}

      <div class="section">Layout</div>
      ${this.layouts.length
        ? html`<select
            .value=${this._layoutId}
            @change=${(e: Event) =>
              this._onLayout((e.target as HTMLSelectElement).value)}
          >
            <option value="">— Choisir un layout —</option>
            ${this.layouts.map(
              (l) => html`<option value=${l.id} ?selected=${l.id === this._layoutId}>
                ${l.name} (${l.buttons} bouton(s))
              </option>`
            )}
          </select>`
        : html`<p class="hint">Aucun layout. Crée-en un dans « Switch Layouts ».</p>`}

      ${this._selectedLayout()
        ? html`
            <div class="section">Tap modes par bouton</div>
            <p class="hint">Simple activé par défaut ; ajoute Double / Long au besoin.</p>
            ${Array.from(
              { length: this._selectedLayout()!.buttons },
              (_, i) => i + 1
            ).map(
              (btn) => html`<div class="btn-row">
                <span class="btn-lbl">Bouton ${btn}</span>
                <div class="chips">
                  ${HomexPresetEditor.TAP_MODES.map(
                    (t) => html`<span
                      class="tap ${(this._taps[btn] ?? []).includes(t.mode)
                        ? "on"
                        : ""}"
                      @click=${() => this._toggleTap(btn, t.mode)}
                      >${t.label}</span
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
              Supprimer
            </button>`
          : ""}
        <button @click=${this._close}>Annuler</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._save}>
          ${editing ? "Enregistrer" : "Créer le preset"}
        </button>
      </div>
    `;
  }
}
