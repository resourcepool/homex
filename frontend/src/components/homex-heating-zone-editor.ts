import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  HeatingPreset,
  HeatingZone,
  HomeAssistant,
  Room,
  TriggerSpec,
} from "../types";
import { deleteHeatingZone, errorMessage, saveHeatingZone } from "../api";
import { sharedStyles } from "../lib/styles";
import { textField, toggleSwitch } from "../lib/fields";
import { slugify } from "../lib/slug";
import "./homex-trigger-selector";

export const DEFAULT_HEATING_ZONE = "default";

/** Editor of a heating zone: name, rooms, and the triggers of each heating
 * mode (the active mode itself is switched from the Zones list). */
@customElement("homex-heating-zone-editor")
export class HomexHeatingZoneEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) zone: HeatingZone | null = null;
  @property({ attribute: false }) zones: HeatingZone[] = [];
  @property({ attribute: false }) modes: HeatingPreset[] = [];
  @property({ attribute: false }) rooms: Room[] = [];

  @state() private _name = "";
  @state() private _id = "";
  @state() private _rooms: string[] = [];
  @state() private _triggers: Record<string, TriggerSpec[]> = {};
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
      .rooms {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 4px 12px;
      }
      .rooms label {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 0;
        font-size: 14px;
        cursor: pointer;
      }
      .other {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      details.mode {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        padding: 8px 12px;
        margin: 8px 0;
      }
      details.mode summary {
        cursor: pointer;
        font-weight: 500;
        padding: 4px 0;
      }
      .count {
        font-weight: 400;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("zone")) {
      const z = this.zone;
      this._name = z?.name ?? "";
      this._id = z?.id ?? "";
      this._rooms = [...(z?.rooms ?? [])];
      this._triggers = { ...(z?.triggers ?? {}) };
      this._idEdited = !!z;
      this._busy = false;
    }
  }

  private get _isDefault(): boolean {
    return this.zone?.id === DEFAULT_HEATING_ZONE;
  }

  private _toggleRoom(roomId: string) {
    this._rooms = this._rooms.includes(roomId)
      ? this._rooms.filter((r) => r !== roomId)
      : [...this._rooms, roomId];
  }
  private _otherZone(roomId: string): HeatingZone | undefined {
    return this.zones.find((z) => z.id !== this.zone?.id && z.rooms.includes(roomId));
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("heating-zone-closed"));
  }

  private async _save() {
    this._busy = true;
    try {
      await saveHeatingZone(
        this.hass,
        {
          id: this._id,
          name: this._name.trim(),
          rooms: this._isDefault ? [] : this._rooms,
          triggers: this._triggers,
        },
        !this.zone
      );
      this._close();
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
      this._busy = false;
    }
  }

  private async _delete() {
    if (!this.zone) return;
    if (!confirm(`Supprimer la zone « ${this.zone.name} » ? Ses pièces repassent dans la zone par défaut.`)) {
      return;
    }
    this._busy = true;
    try {
      await deleteHeatingZone(this.hass, this.zone.id);
      this._close();
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
      this._busy = false;
    }
  }

  render() {
    const editing = !!this.zone;
    return html`
      ${textField("Nom", this._name, (v) => {
        this._name = v;
        if (!this._idEdited) this._id = slugify(v);
      }, "Studio")}
      ${editing
        ? html`<div class="section">Id : ${this.zone!.id}</div>`
        : textField("Id", this._id, (v) => {
            this._idEdited = true;
            this._id = slugify(v);
          })}
      ${this._id
        ? html`<p class="hint">
            Entité de commande : <code>select.homex_heating_${this._id}</code>
          </p>`
        : ""}

      <div class="section">Pièces</div>
      ${this._isDefault
        ? html`<p class="hint">
            Contient toutes les pièces qui ne sont dans aucune autre zone.
          </p>`
        : html`<p class="hint">
              Une pièce n'appartient qu'à une zone : la cocher la retire de sa zone
              actuelle.
            </p>
            <div class="rooms">
              ${this.rooms.map((r) => {
                const other = this._otherZone(r.room_id);
                return html`<label>
                  ${toggleSwitch(this._rooms.includes(r.room_id), () =>
                    this._toggleRoom(r.room_id)
                  )}
                  <span>
                    ${r.name}
                    ${other && !this._rooms.includes(r.room_id)
                      ? html`<span class="other">· ${other.name}</span>`
                      : ""}
                  </span>
                </label>`;
              })}
            </div>`}

      <div class="section">Déclencheurs par mode</div>
      <p class="hint">
        Chaque déclencheur passe la zone dans le mode correspondant. Les boutons
        d'interrupteurs se configurent aussi dans le Switch Manager (module 🔥 Climate).
      </p>
      ${this.modes.map((m) => {
        const specs = this._triggers[m.id] ?? [];
        return html`<details class="mode" ?open=${specs.length > 0}>
          <summary>
            ${m.name}
            <span class="count">· ${specs.length} déclencheur(s)</span>
          </summary>
          <homex-trigger-selector
            .hass=${this.hass}
            .value=${specs}
            @value-changed=${(e: CustomEvent) =>
              (this._triggers = { ...this._triggers, [m.id]: e.detail.value })}
          ></homex-trigger-selector>
        </details>`;
      })}

      <div class="actions">
        <button
          class="primary"
          ?disabled=${this._busy || !this._name.trim() || !this._id}
          @click=${this._save}
        >
          Enregistrer
        </button>
        <button ?disabled=${this._busy} @click=${this._close}>Annuler</button>
        ${editing && !this.zone!.builtin
          ? html`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>`
          : ""}
      </div>
    `;
  }
}
