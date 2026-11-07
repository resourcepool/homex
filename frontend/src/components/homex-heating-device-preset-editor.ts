import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  HeatingApplyResult,
  HeatingDevicePreset,
  HeatingModel,
  HeatingParam,
  HeatingParamKey,
  HomeAssistant,
} from "../types";
import {
  applyHeatingDevicePreset,
  deleteHeatingDevicePreset,
  errorMessage,
  fetchHeatingModels,
  saveHeatingDevicePreset,
} from "../api";
import { sharedStyles } from "../lib/styles";
import "./homex-select";
import { textField, toggleSwitch } from "../lib/fields";
import { slugify } from "../lib/slug";

interface ParamDef {
  key: HeatingParamKey;
  label: string;
  domains: string[];
  /** Suffix pattern used to suggest the entity on a model change. */
  guess: RegExp;
}

// Settings a device preset can fix, with the entity domains each may target
// (mirrors DEVICE_PARAMS in heating.py).
const PARAMS: ParamDef[] = [
  {
    key: "tolerance",
    label: "Tolérance / précision",
    domains: ["number"],
    guess: /accuracy|precision|hysteresis|tolerance/,
  },
  { key: "mode", label: "Mode", domains: ["climate", "select"], guess: /.*/ },
  {
    key: "lock",
    label: "Verrouillage",
    domains: ["switch", "lock"],
    guess: /child_lock|securite_enfants|verrou|lock/,
  },
  {
    key: "sensor",
    label: "Capteur (interne / externe)",
    domains: ["select", "switch"],
    guess: /sensor_select|temperature_sensor|capteur_de_temperature_externe|external.*sensor/,
  },
];

interface RefEntity {
  domain: string;
  suffix: string;
  key: string; // "domain|suffix"
  entity_id: string;
}

interface ParamDraft {
  enabled: boolean;
  entity: string; // "domain|suffix"
  value: string; // tolerance: the "normal" tolerance mode value
  valueAgressive?: string; // tolerance: the "agressive" tolerance mode value
}

const SWITCH_VALUES = [
  ["on", "Activé"],
  ["off", "Désactivé"],
];
const LOCK_VALUES = [
  ["locked", "Verrouillé"],
  ["unlocked", "Déverrouillé"],
];
const PARAM_LABEL: Record<HeatingParamKey, string> = Object.fromEntries(
  PARAMS.map((p) => [p.key, p.label])
) as Record<HeatingParamKey, string>;

/** Editor of a heating device preset: a thermostat model and the settings
 * (tolerance, mode, lock, sensor) to fix on all its devices. */
@customElement("homex-heating-device-preset-editor")
export class HomexHeatingDevicePresetEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) preset: HeatingDevicePreset | null = null;

  @state() private _models: HeatingModel[] = [];
  @state() private _name = "";
  @state() private _id = "";
  @state() private _modelKey = "";
  @state() private _deviceId = "";
  @state() private _params: Record<HeatingParamKey, ParamDraft> = this._emptyParams();
  @state() private _busy = false;
  @state() private _results: HeatingApplyResult[] | null = null;
  private _idEdited = false;
  private _nameTyped = false;
  // External temperature input ("number|suffix", "" = none): the valve then
  // takes its temperature from a sensor chosen per radiator in each room.
  @state() private _extInput = "";
  // A new preset saved once: later saves update it.
  private _created = false;

  static styles = [
    sharedStyles,
    css`
      .value input {
        width: 100%;
        box-sizing: border-box;
        padding: 12px 14px;
        font-size: 15px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      .hint {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin: 4px 0 8px;
      }
      .param {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        padding: 10px 12px;
        margin: 10px 0;
      }
      .param-head {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        cursor: pointer;
      }
      .param-body {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 10px;
        margin-top: 10px;
      }
      /* Grid / flex children may shrink below their content (long entity ids). */
      .param-body > *,
      .tolerances > * {
        min-width: 0;
      }
      @media (max-width: 600px) {
        .param-body {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .param-body label {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .tolerances {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        align-content: start;
      }
      .tolerances label {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .tolerances .current {
        grid-column: 1 / -1;
      }
      .param-body label.wide {
        grid-column: 1 / -1;
      }
      .param-body label.wide > span:first-child {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--primary-text-color);
        cursor: pointer;
      }
      .current {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .results {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        padding: 10px 12px;
        margin-top: 12px;
        font-size: 14px;
      }
      .results .dev {
        padding: 4px 0;
      }
      .ok {
        color: var(--success-color, #43a047);
      }
      .ko {
        color: var(--error-color, #db4437);
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._loadModels();
  }
  private async _loadModels() {
    try {
      this._models = await fetchHeatingModels(this.hass);
    } catch {
      this._models = [];
    }
  }

  private _emptyParams(): Record<HeatingParamKey, ParamDraft> {
    return Object.fromEntries(
      PARAMS.map((p) => [p.key, { enabled: false, entity: "", value: "" }])
    ) as Record<HeatingParamKey, ParamDraft>;
  }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("preset")) {
      const p = this.preset;
      this._name = p?.name ?? "";
      this._nameTyped = !!p;
      this._id = p?.id ?? "";
      this._idEdited = !!p;
      this._modelKey = p?.model ?? "";
      this._deviceId = p?.device_id ?? "";
      const params = this._emptyParams();
      for (const def of PARAMS) {
        const stored: HeatingParam | undefined = p?.params?.[def.key];
        if (stored) {
          params[def.key] = {
            enabled: true,
            entity: `${stored.domain}|${stored.suffix}`,
            value: String(stored.value),
            valueAgressive:
              stored.value_agressive != null ? String(stored.value_agressive) : "",
          };
        }
      }
      this._params = params;
      this._extInput = p?.external_input ? `number|${p.external_input.suffix}` : "";
      this._results = null;
      this._busy = false;
      this._created = false;
    }
  }

  private _model(): HeatingModel | undefined {
    return this._models.find((m) => m.model === this._modelKey);
  }

  /** Entity-id prefix (slug) of the reference device. */
  private _deviceSlug(): string {
    const dev = this.hass.devices?.[this._deviceId];
    return slugify(dev?.name_by_user || dev?.name || "");
  }

  /** Controllable entities of the reference device, as domain + suffix. */
  private _refEntities(domains: string[]): RefEntity[] {
    const slug = this._deviceSlug();
    return Object.values(this.hass.entities || {})
      .filter(
        (e: any) =>
          e.device_id === this._deviceId &&
          domains.includes(String(e.entity_id).split(".")[0])
      )
      .map((e: any) => {
        const [domain, objectId = ""] = String(e.entity_id).split(".");
        // The entity named after the device itself (its climate) gets an
        // empty suffix: "the device's main entity of that domain".
        const suffix =
          objectId === slug
            ? ""
            : slug && objectId.startsWith(slug + "_")
              ? objectId.slice(slug.length + 1)
              : objectId;
        return { domain, suffix, key: `${domain}|${suffix}`, entity_id: e.entity_id };
      })
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  private _entityOf(key: string): RefEntity | undefined {
    const domain = key.split("|")[0];
    return this._refEntities([domain]).find((e) => e.key === key);
  }

  /** Allowed values of an entity: [value, label] pairs, or null for a number. */
  private _choices(ref: RefEntity | undefined): string[][] | null {
    if (!ref) return [];
    const attrs = this.hass.states[ref.entity_id]?.attributes ?? {};
    switch (ref.domain) {
      case "number":
        return null;
      case "select":
        return (attrs.options ?? []).map((o: string) => [o, o]);
      case "climate":
        return (attrs.hvac_modes ?? []).map((o: string) => [o, o]);
      case "switch":
        return SWITCH_VALUES;
      case "lock":
        return LOCK_VALUES;
      default:
        return [];
    }
  }

  /** The reference entity's current value, as a preset value. */
  private _currentValue(ref: RefEntity | undefined): string {
    const st = ref ? this.hass.states[ref.entity_id] : undefined;
    if (!st || st.state === "unknown" || st.state === "unavailable") return "";
    return String(st.state);
  }

  private _onModel(key: string) {
    this._modelKey = key;
    const m = this._model();
    this._deviceId = m?.devices[0]?.device_id ?? "";
    if (m && (!this._name.trim() || !this._nameTyped)) {
      this._name = m.label;
      if (!this._idEdited) this._id = slugify(m.label);
    }
    this._suggestParams();
  }
  private _onDevice(deviceId: string) {
    this._deviceId = deviceId;
    this._suggestParams();
  }

  /** Pre-select each setting's likely entity on the reference device (off by
   * default: the user enables the ones to fix). */
  private _suggestParams() {
    const params = this._emptyParams();
    for (const def of PARAMS) {
      const ents = this._refEntities(def.domains);
      const ref = ents.find((e) => def.guess.test(e.suffix));
      if (ref) {
        params[def.key] = { enabled: false, entity: ref.key, value: this._currentValue(ref) };
      }
    }
    this._params = params;
    this._extInput = "";
  }

  /** Likely external temperature input of the reference device. */
  private _guessExtInput(): string {
    return (
      this._refEntities(["number"]).find((e) =>
        /external_temperature_input|capteur_de_temperature_externe|external.*temp/.test(e.suffix)
      )?.key ?? ""
    );
  }

  private _setParam(key: HeatingParamKey, patch: Partial<ParamDraft>) {
    this._params = { ...this._params, [key]: { ...this._params[key], ...patch } };
  }
  private _onParamEntity(key: HeatingParamKey, entityKey: string) {
    const ref = this._entityOf(entityKey);
    this._setParam(key, { entity: entityKey, value: this._currentValue(ref) });
  }

  private _buildPreset(): HeatingDevicePreset {
    const params: HeatingDevicePreset["params"] = {};
    for (const def of PARAMS) {
      const p = this._params[def.key];
      if (!p.enabled || !p.entity || p.value === "") continue;
      const [domain, suffix] = p.entity.split("|");
      params[def.key] = {
        domain,
        suffix,
        value: domain === "number" ? parseFloat(p.value) : p.value,
      };
      if (def.key === "tolerance" && p.valueAgressive) {
        params[def.key]!.value_agressive = parseFloat(p.valueAgressive);
      }
    }
    return {
      id: this._id,
      name: this._name.trim(),
      model: this._modelKey,
      device_id: this._deviceId,
      params,
      external_input:
        params.sensor && this._extInput
          ? { domain: "number", suffix: this._extInput.split("|")[1] }
          : null,
    };
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("heating-device-preset-closed"));
  }

  private async _save() {
    this._busy = true;
    try {
      this._results = await saveHeatingDevicePreset(
        this.hass,
        this._buildPreset(),
        !this.preset && !this._created
      );
      this._created = true;
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
    } finally {
      this._busy = false;
    }
  }

  private async _apply() {
    if (!this.preset) return;
    this._busy = true;
    try {
      this._results = await applyHeatingDevicePreset(this.hass, this.preset.id);
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
    } finally {
      this._busy = false;
    }
  }

  private async _delete() {
    if (!this.preset) return;
    if (!confirm(`Supprimer le device preset « ${this.preset.name} » ?`)) return;
    this._busy = true;
    try {
      await deleteHeatingDevicePreset(this.hass, this.preset.id);
      this._close();
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
      this._busy = false;
    }
  }

  private _renderValue(key: HeatingParamKey, draft: ParamDraft) {
    const ref = this._entityOf(draft.entity);
    const choices = this._choices(ref);
    if (choices === null) {
      const a = (ref && this.hass.states[ref.entity_id]?.attributes) || {};
      return html`<span class="value"
        ><input
          type="number"
          inputmode="decimal"
          min=${a.min ?? ""}
          max=${a.max ?? ""}
          step=${a.step ?? "any"}
          .value=${draft.value}
          @change=${(e: Event) =>
            this._setParam(key, { value: (e.target as HTMLInputElement).value })}
      /></span>`;
    }
    return html`<homex-select
      placeholder="Choisir…"
      .value=${draft.value}
      .options=${choices.map(([v, label]) => ({ value: v, label }))}
      @value-changed=${(e: CustomEvent) => this._setParam(key, { value: e.detail.value })}
    ></homex-select>`;
  }

  private _renderParam(def: ParamDef) {
    const draft = this._params[def.key];
    const ents = this._refEntities(def.domains);
    const ref = this._entityOf(draft.entity);
    const current = this._currentValue(ref);
    return html`<div class="param">
      <label class="param-head">
        ${toggleSwitch(draft.enabled, (on) => this._setParam(def.key, { enabled: on }))}
        ${def.label}
      </label>
      ${draft.enabled
        ? html`<div class="param-body">
            <label>
              Entité (${def.domains.join(" / ")})
              <homex-select
                placeholder="Choisir…"
                .value=${draft.entity}
                .options=${ents.map((e) => ({
                  value: e.key,
                  label: e.suffix || "(entité principale)",
                  secondary: e.entity_id,
                  tertiary: e.domain,
                }))}
                @value-changed=${(e: CustomEvent) => this._onParamEntity(def.key, e.detail.value)}
              ></homex-select>
            </label>
            ${def.key === "tolerance"
              ? this._renderToleranceValues(draft, ref, current)
              : html`<label>
                  Valeur à fixer
                  ${this._renderValue(def.key, draft)}
                  ${ref ? html`<span class="current">Actuel : ${current || "—"}</span>` : ""}
                </label>`}
            ${def.key === "sensor" ? this._renderExtInput() : ""}
          </div>`
        : ""}
    </div>`;
  }

  /** Tolerance: one value per tolerance mode (select.homex_climate_tolerance_mode). */
  private _renderToleranceValues(draft: ParamDraft, ref: RefEntity | undefined, current: string) {
    const a = (ref && this.hass.states[ref.entity_id]?.attributes) || {};
    const input = (value: string, onChange: (v: string) => void) => html`<span class="value"
      ><input
        type="number"
        inputmode="decimal"
        min=${a.min ?? ""}
        max=${a.max ?? ""}
        step=${a.step ?? "any"}
        .value=${value}
        @change=${(e: Event) => onChange((e.target as HTMLInputElement).value)}
    /></span>`;
    return html`<div class="tolerances">
      <label>
        Mode normal
        ${input(draft.value, (v) => this._setParam("tolerance", { value: v }))}
      </label>
      <label>
        Mode agressive
        ${input(draft.valueAgressive ?? "", (v) =>
          this._setParam("tolerance", { valueAgressive: v })
        )}
      </label>
      ${ref
        ? html`<span class="current">
            Actuel : ${current || "—"} · appliqué selon select.homex_climate_tolerance_mode
          </span>`
        : ""}
    </div>`;
  }

  /** Where the valve reads an external temperature (sensor setting only). */
  private _renderExtInput() {
    const numbers = this._refEntities(["number"]);
    return html`<label class="wide">
      <span>
        ${toggleSwitch(!!this._extInput, (on) =>
          (this._extInput = on ? this._guessExtInput() || numbers[0]?.key || "" : "")
        )}
        Capteur externe : la valeur choisie fait lire à la vanne une température externe
      </span>
      ${this._extInput
        ? html`<homex-select
              .value=${this._extInput}
              .options=${numbers.map((n) => ({
                value: n.key,
                label: n.suffix,
                secondary: n.entity_id,
              }))}
              @value-changed=${(e: CustomEvent) => (this._extInput = e.detail.value)}
            ></homex-select>
            <span class="current">
              Entrée de température externe : le capteur choisi pour chaque radiateur
              (dans la pièce) y est recopié à chaque mise à jour.
            </span>`
        : ""}
    </label>`;
  }

  private _renderResults() {
    const res = this._results!;
    if (!res.length) {
      return html`<div class="results">Aucun appareil de ce modèle trouvé.</div>`;
    }
    return html`<div class="results">
      <strong>Appliqué sur ${res.length} appareil(s)</strong>
      ${res.map(
        (r) => html`<div class="dev">
          ${r.failed.length ? html`<span class="ko">✗</span>` : html`<span class="ok">✓</span>`}
          ${r.name}
          ${r.applied.length
            ? html` · ${r.applied.map((k) => PARAM_LABEL[k]).join(", ")}`
            : ""}
          ${r.failed.map(
            (f) => html`<div class="ko">${PARAM_LABEL[f.param]} : ${f.error}</div>`
          )}
        </div>`
      )}
    </div>`;
  }

  render() {
    const editing = !!this.preset;
    const model = this._model();
    const anyParam = PARAMS.some((d) => {
      const p = this._params[d.key];
      return p.enabled && p.entity && p.value !== "";
    });
    return html`
      ${textField("Nom", this._name, (v) => {
        this._name = v;
        this._nameTyped = true;
        if (!this._idEdited) this._id = slugify(v);
      }, "Vanne thermostatique")}
      ${editing || this._created
        ? html`<div class="section">Id : ${this._id}</div>`
        : textField("Id", this._id, (v) => {
            this._idEdited = true;
            this._id = slugify(v);
          })}

      <div class="section">Modèle de thermostat</div>
      <homex-select
        placeholder="Choisir un modèle…"
        .value=${this._modelKey}
        .options=${this._models.map((m) => ({
          value: m.model,
          label: m.label,
          tertiary: `${m.count} appareil(s)`,
        }))}
        @value-changed=${(e: CustomEvent) => this._onModel(e.detail.value)}
      ></homex-select>

      ${model
        ? html`
            <div class="section">Appareil de référence</div>
            <p class="hint">
              Ses entités servent à choisir les réglages ; ils s'appliquent ensuite
              aux ${model.count} appareil(s) du modèle.
            </p>
            <homex-select
              .value=${this._deviceId}
              .options=${model.devices.map((d) => ({ value: d.device_id, label: d.name }))}
              @value-changed=${(e: CustomEvent) => this._onDevice(e.detail.value)}
            ></homex-select>

            <div class="section">Réglages à fixer</div>
            ${PARAMS.map((def) => this._renderParam(def))}
          `
        : this._modelKey
          ? html`<p class="hint">Modèle introuvable (plus aucun appareil ?).</p>`
          : ""}

      ${this._results ? this._renderResults() : ""}

      <div class="actions">
        <button
          class="primary"
          ?disabled=${this._busy || !this._name.trim() || !this._id || !model || !anyParam}
          @click=${this._save}
        >
          ${this._busy ? "Application…" : "Enregistrer et appliquer"}
        </button>
        ${editing
          ? html`<button ?disabled=${this._busy} @click=${this._apply}>
              Appliquer maintenant
            </button>`
          : ""}
        <button ?disabled=${this._busy} @click=${this._close}>
          ${this._results ? "Terminé" : "Annuler"}
        </button>
        ${editing
          ? html`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>`
          : ""}
      </div>
    `;
  }
}
