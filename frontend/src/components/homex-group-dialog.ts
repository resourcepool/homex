import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Group, HomeAssistant, Room, TriggerSpec } from "../types";
import { fireChanged } from "../types";
import { addGroup, deleteGroup, errorMessage, updateGroup } from "../api";
import { sharedStyles } from "../lib/styles";
import { textField } from "../lib/fields";
import { slugify } from "../lib/slug";
import "./homex-dialog";
import "./homex-entity-picker";
import "./homex-trigger-selector";
import "./homex-managed-triggers";

/** Modal to create a group (group = null) or edit/delete an existing one. */
@customElement("homex-group-dialog")
export class HomexGroupDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) room!: Room;
  @property({ attribute: false }) group: Group | null = null;

  @state() private _name = "";
  @state() private _id = "";
  @state() private _devices: string[] = [];
  @state() private _triggers: TriggerSpec[] = [];
  @state() private _dim = false;
  @state() private _dimUp: TriggerSpec[] = [];
  @state() private _dimDown: TriggerSpec[] = [];
  @state() private _busy = false;
  private _idEdited = false;

  static styles = [
    sharedStyles,
    css`
      .dim-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        margin: 12px 0 4px;
        cursor: pointer;
      }
      .dim-name {
        font-size: 15px;
        font-weight: 500;
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
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 0 0 8px;
      }
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("open") && this.open) {
      this._name = this.group?.name ?? "";
      this._id = this.group?.group_id ?? "";
      this._devices = this.group?.devices ?? [];
      this._triggers = (this.group?.triggers ?? []).map((t) => ({ ...t }));
      this._dim = this.group?.dim ?? false;
      this._dimUp = (this.group?.dim_up_triggers ?? []).map((t) => ({ ...t }));
      this._dimDown = (this.group?.dim_down_triggers ?? []).map((t) => ({ ...t }));
      this._busy = false;
      this._idEdited = !!this.group;
    }
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
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }

  private async _save() {
    const name = this._name.trim();
    const group_id = this._id.trim();
    if (!name || !group_id) {
      alert("Nom et id du groupe requis.");
      return;
    }
    const triggers: TriggerSpec[] = this._triggers;
    const dimFields = {
      dim: this._dim,
      dim_up_triggers: this._dim ? this._dimUp : [],
      dim_down_triggers: this._dim ? this._dimDown : [],
    };
    this._busy = true;
    try {
      if (this.group) {
        await updateGroup(this.hass, {
          entry_id: this.room.entry_id,
          group_id: this.group.group_id,
          name,
          devices: this._devices,
          triggers,
          ...dimFields,
        });
      } else {
        await addGroup(this.hass, {
          entry_id: this.room.entry_id,
          group_id,
          name,
          devices: this._devices,
          triggers,
          ...dimFields,
        });
      }
      fireChanged(this);
      this._close();
    } catch (err) {
      this._busy = false;
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  private async _delete() {
    if (!this.group) return;
    if (!confirm(`Supprimer le groupe "${this.group.group_id}" ?`)) return;
    this._busy = true;
    try {
      await deleteGroup(this.hass, this.room.entry_id, this.group.group_id);
      fireChanged(this);
      this._close();
    } catch (err) {
      this._busy = false;
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  render() {
    const editing = !!this.group;
    return html`
      <homex-dialog
        .open=${this.open}
        heading=${editing ? "Modifier le groupe" : "Nouveau groupe"}
        @dialog-closed=${this._close}
      >
        ${textField("Nom", this._name, (v) => this._onName(v), "Table de chevet L")}
        ${editing
          ? html`<div class="section">Id : ${this.group!.group_id}</div>`
          : textField("Id", this._id, (v) => this._onId(v), "bedside_l")}
        <div class="section">Appareils (parmi la pièce)</div>
        <homex-entity-picker
          .hass=${this.hass}
          .includeEntities=${this.room.devices}
          .value=${this._devices}
          @value-changed=${(e: CustomEvent) => (this._devices = e.detail.value)}
        ></homex-entity-picker>
        <label class="dim-toggle">
          <span class="dim-name">Activer le dimming du groupe</span>
          <span class="toggle ${this._dim ? "on" : ""}">
            <input
              type="checkbox"
              .checked=${this._dim}
              @change=${(e: Event) =>
        (this._dim = (e.target as HTMLInputElement).checked)}
            />
            <span class="knob"></span>
          </span>
        </label>
        <div class="section">Déclencheurs</div>
        <homex-trigger-selector
          .hass=${this.hass}
          .value=${this._triggers}
          @value-changed=${(e: CustomEvent) => (this._triggers = e.detail.value)}
        ></homex-trigger-selector>
        ${editing
          ? html`<homex-managed-triggers
              .triggers=${this.room?.switch_triggers?.groups?.[
                this.group!.group_id
              ] ?? []}
            ></homex-managed-triggers>`
          : ""}

        
        ${this._dim
          ? html`
              <div class="section">Dimmer + (monter la luminosité)</div>
              <p class="hint">
                Chaque déclenchement ajoute 20 à la luminosité des lumières du
                groupe.
              </p>
              <homex-trigger-selector
                .hass=${this.hass}
                .value=${this._dimUp}
                @value-changed=${(e: CustomEvent) => (this._dimUp = e.detail.value)}
              ></homex-trigger-selector>
              <div class="section">Dimmer − (baisser la luminosité)</div>
              <p class="hint">
                Chaque déclenchement retire 20 à la luminosité des lumières du
                groupe.
              </p>
              <homex-trigger-selector
                .hass=${this.hass}
                .value=${this._dimDown}
                @value-changed=${(e: CustomEvent) =>
                  (this._dimDown = e.detail.value)}
              ></homex-trigger-selector>
            `
          : ""}

        <span slot="actions">
          ${editing
            ? html`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
                Supprimer
              </button>`
            : ""}
          <button @click=${this._close}>Annuler</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            ${editing ? "Enregistrer" : "Créer le groupe"}
          </button>
        </span>
      </homex-dialog>
    `;
  }
}
