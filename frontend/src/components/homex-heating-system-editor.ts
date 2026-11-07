import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HeatingSystem, HeatingZone, HomeAssistant } from "../types";
import { deleteHeatingSystem, errorMessage, saveHeatingSystem } from "../api";
import { sharedStyles } from "../lib/styles";
import { textField, toggleSwitch } from "../lib/fields";
import { slugify } from "../lib/slug";
import "./homex-select";

const GLOBAL = "global";
const CONTACT_DOMAINS = ["switch", "input_boolean"];

/** Editor of a heating system: a boiler (dry contact, scope, agressive mode)
 * or a heat pump (no settings yet). */
@customElement("homex-heating-system-editor")
export class HomexHeatingSystemEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) system: HeatingSystem | null = null;
  @property({ attribute: false }) zones: HeatingZone[] = [];

  @state() private _name = "";
  @state() private _id = "";
  @state() private _type: HeatingSystem["type"] = "boiler";
  @state() private _contact = "";
  @state() private _zones: string[] = [GLOBAL];
  @state() private _aggressive = false;
  @state() private _busy = false;
  private _idEdited = false;

  static styles = [
    sharedStyles,
    css`
      .hint {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin: 4px 0 8px;
      }
      .btn-group {
        display: inline-flex;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        overflow: hidden;
      }
      .btn-group button {
        min-height: 0;
        padding: 8px 16px;
        border-radius: 0;
        background: transparent;
      }
      .btn-group button + button {
        border-left: 1px solid var(--divider-color, #ccc);
      }
      .btn-group button.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .checks label {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 0;
        font-size: 14px;
        cursor: pointer;
      }
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("system")) {
      const s = this.system;
      this._name = s?.name ?? "";
      this._id = s?.id ?? "";
      this._type = s?.type ?? "boiler";
      this._contact = s?.contact ?? "";
      this._zones = [...(s?.zones?.length ? s.zones : [GLOBAL])];
      this._aggressive = s?.aggressive ?? false;
      this._idEdited = !!s;
      this._busy = false;
    }
  }

  private get _contacts(): string[] {
    const name = (id: string) => this.hass.states[id]?.attributes?.friendly_name || id;
    return Object.keys(this.hass.states)
      .filter((id) => CONTACT_DOMAINS.includes(id.split(".")[0]))
      .sort((a, b) => name(a).localeCompare(name(b)));
  }

  private _toggleZone(id: string) {
    const rest = this._zones.filter((z) => z !== GLOBAL);
    const next = rest.includes(id) ? rest.filter((z) => z !== id) : [...rest, id];
    this._zones = next.length ? next : [GLOBAL];
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("heating-system-closed"));
  }

  private async _save() {
    this._busy = true;
    try {
      await saveHeatingSystem(
        this.hass,
        {
          id: this._id,
          name: this._name.trim(),
          type: this._type,
          contact: this._type === "boiler" ? this._contact : "",
          zones: this._zones,
          aggressive: this._type === "boiler" && this._aggressive,
        },
        !this.system
      );
      this._close();
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
      this._busy = false;
    }
  }

  private async _delete() {
    if (!this.system) return;
    if (!confirm(`Supprimer le système « ${this.system.name} » ?`)) return;
    this._busy = true;
    try {
      await deleteHeatingSystem(this.hass, this.system.id);
      this._close();
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
      this._busy = false;
    }
  }

  private _renderBoiler() {
    const name = (id: string) => this.hass.states[id]?.attributes?.friendly_name || id;
    const isGlobal = this._zones.includes(GLOBAL);
    return html`
      <div class="section">Contact sec</div>
      <p class="hint">
        L'interrupteur commandé de la chaudière : activé dès que sa portée a besoin
        d'être chauffée, désactivé sinon.
      </p>
      <homex-select
        placeholder="Choisir un interrupteur…"
        .value=${this._contact}
        .options=${this._contacts.map((id) => ({
          value: id,
          label: name(id),
          secondary: id,
        }))}
        @value-changed=${(e: CustomEvent) => (this._contact = e.detail.value)}
      ></homex-select>

      <div class="section">Portée</div>
      <div class="checks">
        <label>
          ${toggleSwitch(isGlobal, () => (this._zones = [GLOBAL]))}
          Système global (toutes les zones)
        </label>
        ${this.zones.map(
          (z) => html`<label>
            ${toggleSwitch(!isGlobal && this._zones.includes(z.id), () =>
              this._toggleZone(z.id)
            )}
            Zone ${z.name}
          </label>`
        )}
      </div>

      <div class="section">Mode agressif</div>
      <div class="checks">
        <label>
          ${toggleSwitch(this._aggressive, (on) => (this._aggressive = on))}
          Enable agressive mode : tolérance « agressive » tant que le contact sec est actif
        </label>
      </div>
    `;
  }

  render() {
    const editing = !!this.system;
    return html`
      ${textField("Nom", this._name, (v) => {
        this._name = v;
        if (!this._idEdited) this._id = slugify(v);
      }, "Chaudière")}
      ${editing
        ? html`<div class="section">Id : ${this.system!.id}</div>`
        : textField("Id", this._id, (v) => {
            this._idEdited = true;
            this._id = slugify(v);
          })}

      <div class="section">Type</div>
      <div class="btn-group">
        ${(
          [
            ["boiler", "Boiler"],
            ["heat_pump", "Heat Pump"],
          ] as [HeatingSystem["type"], string][]
        ).map(
          ([v, l]) => html`<button
            class=${this._type === v ? "active" : ""}
            @click=${() => (this._type = v)}
          >
            ${l}
          </button>`
        )}
      </div>

      ${this._type === "boiler"
        ? this._renderBoiler()
        : html`<p class="hint">Le pilotage des pompes à chaleur arrive bientôt.</p>`}

      <div class="actions">
        <button
          class="primary"
          ?disabled=${this._busy || !this._name.trim() || !this._id}
          @click=${this._save}
        >
          Enregistrer
        </button>
        <button ?disabled=${this._busy} @click=${this._close}>Annuler</button>
        ${editing
          ? html`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>`
          : ""}
      </div>
    `;
  }
}
