import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  HomeAssistant,
  ShutterCondition,
  ShutterModel,
  ShutterPreset,
} from "../types";
import {
  deleteShutterPreset,
  errorMessage,
  fetchShutterModels,
  saveShutterPreset,
} from "../api";
import { sharedStyles } from "../lib/styles";
import { textField } from "../lib/fields";
import { slugify } from "../lib/slug";

/** Editor for a shutter device preset: model + reference device + optional
 * smart-toggle (up / down / stopped motion detection). */
@customElement("homex-shutter-preset-editor")
export class HomexShutterPresetEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) preset: ShutterPreset | null = null;

  @state() private _name = "";
  @state() private _id = "";
  @state() private _models: ShutterModel[] = [];
  @state() private _modelKey = "";
  @state() private _deviceId = "";
  @state() private _smart = false;
  @state() private _up: ShutterCondition = { entity_id: "", state: "" };
  @state() private _down: ShutterCondition = { entity_id: "", state: "" };
  @state() private _stopped: ShutterCondition = { entity_id: "", state: "" };
  @state() private _busy = false;
  private _idEdited = false;

  private static _cond(v: unknown): ShutterCondition {
    // Accept a single condition or (legacy) an array; default empty.
    const c: any = Array.isArray(v) ? v[0] : v;
    return { entity_id: c?.entity_id ?? "", state: c?.state ?? "" };
  }

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
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        margin: 14px 0 4px;
        cursor: pointer;
      }
      .toggle {
        position: relative;
        flex: 0 0 auto;
        width: 42px;
        height: 24px;
        border-radius: 12px;
        background: var(--switch-unchecked-track-color, #bdbdbd);
        transition: background 0.2s;
      }
      .toggle.on {
        background: var(--switch-checked-track-color, var(--primary-color));
      }
      .toggle input {
        position: absolute;
        inset: 0;
        margin: 0;
        opacity: 0;
        cursor: pointer;
      }
      .toggle .knob {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        transition: transform 0.2s;
      }
      .toggle.on .knob {
        transform: translateX(18px);
      }
      .cond {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        padding: 10px 12px;
        margin-bottom: 12px;
      }
      .cond-row {
        display: flex;
        gap: 8px;
        align-items: center;
        margin: 6px 0;
      }
      .cond-row select {
        flex: 2;
        margin: 0;
      }
      .cond-row input {
        flex: 1;
        box-sizing: border-box;
        padding: 12px 14px;
        font-size: 15px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      .x {
        flex: 0 0 auto;
        cursor: pointer;
        border: none;
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 18px;
      }
      .add {
        font-size: 13px;
        padding: 6px 10px;
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
  }
  private async _loadModels() {
    try {
      this._models = await fetchShutterModels(this.hass);
    } catch {
      this._models = [];
    }
  }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("preset")) {
      const p = this.preset;
      this._name = p?.name ?? "";
      this._id = p?.id ?? "";
      this._modelKey = p?.model ?? "";
      this._deviceId = p?.device_id ?? "";
      this._smart = p?.smart_toggle ?? false;
      this._up = HomexShutterPresetEditor._cond(p?.moving_up);
      this._down = HomexShutterPresetEditor._cond(p?.moving_down);
      this._stopped = HomexShutterPresetEditor._cond(p?.stopped);
      this._idEdited = !!p;
      this._busy = false;
    }
  }

  private _model(): ShutterModel | undefined {
    return this._models.find((m) => m.model === this._modelKey);
  }
  private _onModel(key: string) {
    this._modelKey = key;
    const m = this._model();
    this._deviceId = m?.devices[0]?.device_id ?? "";
    this._up = { entity_id: "", state: "" };
    this._down = { entity_id: "", state: "" };
    this._stopped = { entity_id: "", state: "" };
    if (m && !this._idEdited) {
      this._name = m.label;
      this._id = slugify(m.label);
    }
  }
  private _onName(v: string) {
    this._name = v;
    if (!this._idEdited) this._id = slugify(v);
  }

  /** Sensors of the reference device (to build motion-state conditions from). */
  private _refEntities(): { entity_id: string; name: string }[] {
    const reg = this.hass.entities || {};
    const CAPTEURS = new Set(["sensor", "binary_sensor"]);
    return Object.values(reg)
      .filter(
        (e: any) =>
          e.device_id === this._deviceId &&
          CAPTEURS.has(String(e.entity_id).split(".")[0])
      )
      .map((e: any) => ({
        entity_id: e.entity_id,
        name:
          this.hass.states[e.entity_id]?.attributes?.friendly_name ||
          e.entity_id,
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  /** Suggested values for a sensor: its enum options + its current state. */
  private _sensorValues(entityId: string): string[] {
    const st = this.hass.states[entityId];
    if (!st) return [];
    const out = new Set<string>();
    const opts = st.attributes?.options;
    if (Array.isArray(opts)) opts.forEach((o: unknown) => out.add(String(o)));
    if (st.state && !["unknown", "unavailable"].includes(st.state))
      out.add(st.state);
    return [...out];
  }

  /** One entry (Montée / Descente / Arrêt) = a single sensor with a value. */
  private _condEditor(
    key: string,
    title: string,
    hint: string,
    cond: ShutterCondition,
    onChange: (v: ShutterCondition) => void
  ) {
    const listId = `dl-${key}`;
    const suggestions = this._sensorValues(cond.entity_id);
    return html`<div class="cond">
      <div class="section">${title}</div>
      <p class="hint">${hint}</p>
      <div class="cond-row">
        <select
          .value=${cond.entity_id}
          @change=${(e: Event) =>
            onChange({
              ...cond,
              entity_id: (e.target as HTMLSelectElement).value,
            })}
        >
          <option value="">— Capteur —</option>
          ${this._refEntities().map(
            (ent) => html`<option value=${ent.entity_id} ?selected=${ent.entity_id === cond.entity_id}>
              ${ent.name}
            </option>`
          )}
        </select>
        <input
          placeholder="valeur"
          list=${listId}
          .value=${cond.state}
          @change=${(e: Event) =>
            onChange({ ...cond, state: (e.target as HTMLInputElement).value })}
        />
        <datalist id=${listId}>
          ${suggestions.map((v) => html`<option value=${v}></option>`)}
        </datalist>
      </div>
    </div>`;
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("shutter-preset-closed"));
  }

  private async _save() {
    const name = this._name.trim();
    const id = this._id.trim();
    if (!name || !id) {
      alert("Nom et id du preset requis.");
      return;
    }
    if (!this._modelKey || !this._deviceId) {
      alert("Choisis un modèle et un device de référence.");
      return;
    }
    const empty = { entity_id: "", state: "" };
    this._busy = true;
    try {
      await saveShutterPreset(this.hass, {
        id,
        name,
        model: this._modelKey,
        model_label: this._model()?.label ?? this._modelKey,
        device_id: this._deviceId,
        smart_toggle: this._smart,
        moving_up: this._smart ? this._up : empty,
        moving_down: this._smart ? this._down : empty,
        stopped: this._smart ? this._stopped : empty,
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
      await deleteShutterPreset(this.hass, this.preset.id);
      this._close();
    } catch (err) {
      this._busy = false;
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  render() {
    const editing = !!this.preset;
    const model = this._model();
    return html`
      ${textField("Nom du preset", this._name, (v) => this._onName(v), "Volet salon")}
      ${editing ? html`<div class="section">Id : ${this.preset!.id}</div>` : ""}

      <div class="section">Modèle de volet</div>
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
        : html`<p class="hint">Aucun volet (device avec entité cover) détecté.</p>`}

      ${model
        ? html`
            <div class="section">Device de référence</div>
            <p class="hint">Les capteurs/actions sont tirés de ce device.</p>
            <select
              .value=${this._deviceId}
              @change=${(e: Event) => {
                this._deviceId = (e.target as HTMLSelectElement).value;
                this._up = { entity_id: "", state: "" };
                this._down = { entity_id: "", state: "" };
                this._stopped = { entity_id: "", state: "" };
              }}
            >
              ${model.devices.map(
                (d) => html`<option value=${d.device_id} ?selected=${d.device_id === this._deviceId}>
                  ${d.name}
                </option>`
              )}
            </select>

            <label class="toggle-row">
              <span>Implémenter la permutation intelligente</span>
              <span class="toggle ${this._smart ? "on" : ""}">
                <input
                  type="checkbox"
                  .checked=${this._smart}
                  @change=${(e: Event) =>
                    (this._smart = (e.target as HTMLInputElement).checked)}
                />
                <span class="knob"></span>
              </span>
            </label>
            <p class="hint">
              Si activée, indique comment détecter l'état du volet (souvent un ou
              plusieurs capteurs avec une valeur précise).
            </p>
            ${this._smart
              ? html`
                  ${this._condEditor(
                    "up",
                    "Montée (volet en mouvement vers le haut)",
                    "Le volet est en train de monter quand ce capteur vaut :",
                    this._up,
                    (v) => (this._up = v)
                  )}
                  ${this._condEditor(
                    "down",
                    "Descente (volet en mouvement vers le bas)",
                    "Le volet est en train de descendre quand ce capteur vaut :",
                    this._down,
                    (v) => (this._down = v)
                  )}
                  ${this._condEditor(
                    "stopped",
                    "Arrêt (volet à l'arrêt)",
                    "Le volet est à l'arrêt quand ce capteur vaut :",
                    this._stopped,
                    (v) => (this._stopped = v)
                  )}
                `
              : ""}
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
