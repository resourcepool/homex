import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Group, HomeAssistant, Room, TriggerSpec } from "../types";
import { fireChanged } from "../types";
import { addGroup, deleteGroup, errorMessage, updateGroup } from "../api";
import { sharedStyles } from "../lib/styles";
import { textField } from "../lib/fields";
import { slugify } from "../lib/slug";
import { TRIGGER_DOMAINS } from "../lib/domains";
import "./homex-dialog";
import "./homex-entity-picker";
import "./homex-device-triggers";

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
  @state() private _trigEnt: string[] = [];
  @state() private _trigDev: TriggerSpec[] = [];
  @state() private _busy = false;
  private _idEdited = false;

  static styles = sharedStyles;

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("open") && this.open) {
      this._name = this.group?.name ?? "";
      this._id = this.group?.group_id ?? "";
      this._devices = this.group?.devices ?? [];
      const trig = this.group?.triggers ?? [];
      this._trigEnt = trig
        .map((t) => t.entity_id)
        .filter((id): id is string => !!id);
      this._trigDev = trig
        .filter((t) => t.device_id)
        .map((t) =>
          t.action ? { device_id: t.device_id, action: t.action } : { device_id: t.device_id }
        );
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
    const triggers: TriggerSpec[] = [
      ...this._trigEnt.map((entity_id) => ({ entity_id })),
      ...this._trigDev,
    ];
    this._busy = true;
    try {
      if (this.group) {
        await updateGroup(this.hass, {
          entry_id: this.room.entry_id,
          group_id: this.group.group_id,
          name,
          devices: this._devices,
          triggers,
        });
      } else {
        await addGroup(this.hass, {
          entry_id: this.room.entry_id,
          group_id,
          name,
          devices: this._devices,
          triggers,
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
        <div class="section">Déclencheurs — entités</div>
        <homex-entity-picker
          .hass=${this.hass}
          .includeDomains=${TRIGGER_DOMAINS}
          .value=${this._trigEnt}
          @value-changed=${(e: CustomEvent) => (this._trigEnt = e.detail.value)}
        ></homex-entity-picker>
        <div class="section">Déclencheurs — appareils</div>
        <homex-device-triggers
          .hass=${this.hass}
          .value=${this._trigDev}
          @value-changed=${(e: CustomEvent) => (this._trigDev = e.detail.value)}
        ></homex-device-triggers>

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
