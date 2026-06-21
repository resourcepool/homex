import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, Room, SceneStrategy } from "../types";
import { fireChanged } from "../types";
import { createRoom, errorMessage, updateRoom } from "../api";
import { sharedStyles } from "../lib/styles";
import { textField } from "../lib/fields";
import { slugify } from "../lib/slug";
import { DEVICE_DOMAINS } from "../lib/domains";
import "./homex-dialog";
import "./homex-entity-picker";

/** Modal to create a room (room = null) or edit its base info. */
@customElement("homex-room-dialog")
export class HomexRoomDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) room: Room | null = null;

  @state() private _name = "";
  @state() private _id = "";
  @state() private _areaId = "";
  @state() private _devices: string[] = [];
  @state() private _strategy: SceneStrategy = "recall_first";
  @state() private _busy = false;
  // Once the user edits the id by hand, stop deriving it from the name.
  private _idEdited = false;

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
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("open") && this.open) {
      this._name = this.room?.name ?? "";
      this._id = this.room?.room_id ?? "";
      this._areaId = this.room?.area_id ?? "";
      this._devices = this.room?.devices ?? [];
      this._strategy = this.room?.scene_strategy ?? "recall_first";
      this._busy = false;
      this._idEdited = !!this.room; // editing: keep existing id untouched
    }
  }

  private get _areas(): { area_id: string; name: string }[] {
    return Object.values(this.hass.areas || {})
      .map((a: any) => ({ area_id: a.area_id, name: a.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
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
    const room_id = this._id.trim();
    if (!name || !room_id) {
      alert("Nom et id requis.");
      return;
    }
    this._busy = true;
    try {
      const area_id = this._areaId || null;
      if (this.room) {
        await updateRoom(this.hass, {
          entry_id: this.room.entry_id,
          name,
          room_id,
          area_id,
          devices: this._devices,
          scene_strategy: this._strategy,
        });
      } else {
        await createRoom(this.hass, {
          name,
          room_id,
          area_id,
          devices: this._devices,
          scene_strategy: this._strategy,
        });
      }
      fireChanged(this);
      this._close();
    } catch (err) {
      this._busy = false;
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  render() {
    const editing = !!this.room;
    return html`
      <homex-dialog
        .open=${this.open}
        heading=${editing ? "Modifier la pièce" : "Nouvelle pièce"}
        @dialog-closed=${this._close}
      >
        ${textField("Nom", this._name, (v) => this._onName(v), "Chambre")}
        ${textField("Id", this._id, (v) => this._onId(v), "bedroom")}
        <div class="section">Pièce Home Assistant (optionnel)</div>
        <select
          .value=${this._areaId}
          @change=${(e: Event) =>
            (this._areaId = (e.target as HTMLSelectElement).value)}
        >
          <option value="">— Aucune —</option>
          ${this._areas.map(
            (a) => html`<option value=${a.area_id}>${a.name}</option>`
          )}
        </select>
        <div class="section">Appareils de la pièce</div>
        <homex-entity-picker
          .hass=${this.hass}
          .includeDomains=${DEVICE_DOMAINS}
          .value=${this._devices}
          @value-changed=${(e: CustomEvent) => (this._devices = e.detail.value)}
        ></homex-entity-picker>

        <div class="section">Scene switching strategy</div>
        <select
          .value=${this._strategy}
          @change=${(e: Event) =>
            (this._strategy = (e.target as HTMLSelectElement).value as SceneStrategy)}
        >
          <option value="recall_first">Repart de zéro</option>
          <option value="recall_last">Dernière utilisée</option>
        </select>
        <p class="hint">
          Quand un trigger scene-switching change de scène et que la pièce était
          éteinte : repartir de la première scène, ou reprendre la dernière utilisée.
        </p>

        <span slot="actions">
          <button @click=${this._close}>Annuler</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            ${editing ? "Enregistrer" : "Créer la pièce"}
          </button>
        </span>
      </homex-dialog>
    `;
  }
}
