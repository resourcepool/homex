import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, Room, ShutterGroup, TriggerSpec } from "../types";
import { fireChanged } from "../types";
import {
  addShutterGroup,
  deleteShutterGroup,
  errorMessage,
  updateShutterGroup,
} from "../api";
import { sharedStyles } from "../lib/styles";
import { textField } from "../lib/fields";
import "./homex-dialog";
import "./homex-entity-picker";
import "./homex-trigger-selector";

/** Create / edit / delete a shutter group (volets) of a room, incl. its
 * covers and its 4 triggers (permuter / ouvrir / fermer / stop). */
@customElement("homex-shutter-group-dialog")
export class HomexShutterGroupDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) room!: Room;
  @property({ attribute: false }) group: ShutterGroup | null = null;

  @state() private _name = "";
  @state() private _devices: string[] = [];
  @state() private _toggle: TriggerSpec[] = [];
  @state() private _openT: TriggerSpec[] = [];
  @state() private _close: TriggerSpec[] = [];
  @state() private _stop: TriggerSpec[] = [];
  @state() private _busy = false;

  static styles = [
    sharedStyles,
    css`
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 0 0 8px;
      }
      .group {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        padding: 12px 14px;
        margin-bottom: 12px;
      }
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("open") && this.open) {
      const g = this.group;
      this._name = g?.name ?? "";
      this._devices = [...(g?.devices ?? [])];
      this._toggle = (g?.toggle_triggers ?? []).map((t) => ({ ...t }));
      this._openT = (g?.open_triggers ?? []).map((t) => ({ ...t }));
      this._close = (g?.close_triggers ?? []).map((t) => ({ ...t }));
      this._stop = (g?.stop_triggers ?? []).map((t) => ({ ...t }));
      this._busy = false;
    }
  }

  private _close_() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }

  private async _save() {
    const name = this._name.trim();
    if (!name) {
      alert("Nom du groupe requis.");
      return;
    }
    this._busy = true;
    try {
      let groupId = this.group?.id;
      if (!groupId) {
        const res: any = await addShutterGroup(
          this.hass,
          this.room.entry_id,
          name
        );
        groupId = res?.group_id;
      }
      await updateShutterGroup(this.hass, {
        entry_id: this.room.entry_id,
        group_id: groupId,
        name,
        devices: this._devices,
        toggle_triggers: this._toggle,
        open_triggers: this._openT,
        close_triggers: this._close,
        stop_triggers: this._stop,
      });
      fireChanged(this);
      this._close_();
    } catch (err) {
      this._busy = false;
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  private async _delete() {
    if (!this.group) return;
    if (!confirm(`Supprimer le groupe de volets "${this.group.name}" ?`)) return;
    this._busy = true;
    try {
      await deleteShutterGroup(this.hass, this.room.entry_id, this.group.id);
      fireChanged(this);
      this._close_();
    } catch (err) {
      this._busy = false;
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  private _trigGroup(
    title: string,
    value: TriggerSpec[],
    onChange: (v: TriggerSpec[]) => void
  ) {
    return html`<div class="group">
      <div class="section">${title}</div>
      <homex-trigger-selector
        .hass=${this.hass}
        .value=${value}
        @value-changed=${(e: CustomEvent) => onChange(e.detail.value)}
      ></homex-trigger-selector>
    </div>`;
  }

  render() {
    const editing = !!this.group;
    const canDelete = editing && this.group!.removable;
    return html`
      <homex-dialog
        .open=${this.open}
        heading=${editing ? "Modifier le groupe de volets" : "Nouveau groupe de volets"}
        @dialog-closed=${this._close_}
      >
        ${textField("Nom", this._name, (v) => (this._name = v), "Salon")}
        <div class="section">Volets (entités cover)</div>
        <homex-entity-picker
          .hass=${this.hass}
          .includeDomains=${["cover"]}
          .value=${this._devices}
          @value-changed=${(e: CustomEvent) => (this._devices = e.detail.value)}
        ></homex-entity-picker>

        <div class="section">Déclencheurs du groupe</div>
        <p class="hint">
          Chaque déclencheur pilote les volets de ce groupe.
        </p>
        ${this._trigGroup("Permuter (ouvrir / fermer)", this._toggle, (v) => (this._toggle = v))}
        ${this._trigGroup("Ouvrir", this._openT, (v) => (this._openT = v))}
        ${this._trigGroup("Fermer", this._close, (v) => (this._close = v))}
        ${this._trigGroup("Stop", this._stop, (v) => (this._stop = v))}

        <span slot="actions">
          ${canDelete
            ? html`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
                Supprimer
              </button>`
            : ""}
          <button @click=${this._close_}>Annuler</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            ${editing ? "Enregistrer" : "Créer le groupe"}
          </button>
        </span>
      </homex-dialog>
    `;
  }
}
