import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  DevicePreset,
  GlobalSwitch,
  HomeAssistant,
  SwitchDevice,
} from "../types";
import {
  deleteGlobalSwitch,
  errorMessage,
  fetchRooms,
  fetchSwitchDevices,
  saveGlobalSwitch,
} from "../api";
import { deviceModelKey, deviceModelLabel } from "../lib/device";
import { sharedStyles } from "../lib/styles";
import { textField } from "../lib/fields";
import { slugify } from "../lib/slug";

/** Editor for a global switch: name + device + rooms. The layout/actions come
 * from the Device Preset matching the device's model. */
@customElement("homex-gswitch-editor")
export class HomexGswitchEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) sw: GlobalSwitch | null = null;
  @property({ attribute: false }) presets: DevicePreset[] = [];
  @property({ attribute: false }) initialRooms: string[] = [];

  @state() private _name = "";
  @state() private _id = "";
  @state() private _deviceId = "";
  @state() private _devices: SwitchDevice[] = [];
  @state() private _rooms: string[] = [];
  @state() private _allRooms: { room_id: string; name: string }[] = [];
  @state() private _busy = false;
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
      .rooms {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 4px 0 8px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        border-radius: 16px;
        border: 1px solid var(--divider-color, #ccc);
        cursor: pointer;
        font-size: 14px;
        user-select: none;
      }
      .chip.on {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-color: var(--primary-color);
      }
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 0 0 8px;
      }
      .preset-box {
        margin: 8px 0;
        padding: 12px 14px;
        border-radius: 10px;
        border: 1px solid var(--divider-color, #e0e0e0);
        font-size: 14px;
      }
      .preset-box.ok {
        border-color: var(--primary-color);
      }
      .preset-box .row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .preset-box .row span {
        flex: 1;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
      }
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("sw")) {
      this._name = this.sw?.name ?? "";
      this._id = this.sw?.id ?? "";
      this._deviceId = this.sw?.device_id ?? "";
      this._rooms = [...(this.sw?.rooms ?? this.initialRooms ?? [])];
      this._idEdited = !!this.sw;
      this._busy = false;
      this._loadRooms();
    }
  }

  private async _loadRooms() {
    try {
      const rooms = await fetchRooms(this.hass);
      // Only rooms with the Switches module enabled can host a switch.
      this._allRooms = rooms
        .filter((r) => (r.modules ?? []).includes("switches"))
        .map((r) => ({ room_id: r.room_id, name: r.name }));
    } catch {
      this._allRooms = [];
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadDevices();
  }
  private async _loadDevices() {
    try {
      this._devices = await fetchSwitchDevices(this.hass);
    } catch {
      this._devices = [];
    }
  }

  private _preset(): DevicePreset | undefined {
    if (!this._deviceId) return undefined;
    const key = deviceModelKey(this.hass, this._deviceId);
    return this.presets.find((p) => p.model === key);
  }

  private _onName(v: string) {
    this._name = v;
    if (!this._idEdited) this._id = slugify(v);
  }
  private _toggleRoom(roomId: string) {
    this._rooms = this._rooms.includes(roomId)
      ? this._rooms.filter((r) => r !== roomId)
      : [...this._rooms, roomId];
  }
  private _close() {
    this.dispatchEvent(new CustomEvent("switch-closed"));
  }
  private _createPreset() {
    // Ask the manager to open the Device Preset editor for this model.
    this.dispatchEvent(
      new CustomEvent("create-preset", { detail: { device_id: this._deviceId } })
    );
  }

  private async _save() {
    const name = this._name.trim();
    const id = this._id.trim();
    if (!name || !id) {
      alert("Nom et id du switch requis.");
      return;
    }
    if (!this._deviceId) {
      alert("Choisis un appareil.");
      return;
    }
    this._busy = true;
    try {
      await saveGlobalSwitch(
        this.hass,
        { id, name, device_id: this._deviceId, rooms: this._rooms },
        !this.sw // creating: reject a colliding id instead of overwriting
      );
      this._close();
    } catch (err) {
      this._busy = false;
      alert("Erreur Homex : " + errorMessage(err));
    }
  }
  private async _delete() {
    if (!this.sw) return;
    if (!confirm(`Supprimer le switch "${this.sw.name}" ?`)) return;
    this._busy = true;
    try {
      await deleteGlobalSwitch(this.hass, this.sw.id);
      this._close();
    } catch (err) {
      this._busy = false;
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  render() {
    const editing = !!this.sw;
    const preset = this._preset();
    return html`
      ${textField("Nom", this._name, (v) => this._onName(v), "Interrupteur chevet")}
      ${editing ? html`<div class="section">Id : ${this.sw!.id}</div>` : ""}

      <div class="section">Interrupteur (appareil)</div>
      ${this._devices.length
        ? html`<select
            .value=${this._deviceId}
            @change=${(e: Event) =>
              (this._deviceId = (e.target as HTMLSelectElement).value)}
          >
            <option value="">— Choisir un interrupteur —</option>
            ${this._devices.map(
              (d) => html`<option value=${d.device_id} ?selected=${d.device_id === this._deviceId}>
                ${d.name} · ${d.model_label}
              </option>`
            )}
          </select>`
        : html`<p class="hint">
            Aucun interrupteur détecté (appareil exposant des actions).
          </p>`}

      ${this._deviceId
        ? preset
          ? html`<div class="preset-box ok">
              ✅ Preset utilisé :
              <b>${preset.name}</b>
              <div class="hint">Modèle : ${deviceModelLabel(this.hass, this._deviceId)}</div>
            </div>`
          : html`<div class="preset-box">
              <div class="row">
                <span>
                  Aucun preset pour le modèle
                  <b>${deviceModelLabel(this.hass, this._deviceId)}</b>.
                </span>
                <button class="primary" @click=${this._createPreset}>
                  ＋ Créer un preset
                </button>
              </div>
            </div>`
        : ""}

      <div class="section">Pièces Homex assignées (0..n)</div>
      <div class="rooms">
        ${this._allRooms.length
          ? this._allRooms.map(
              (r) => html`<span
                class="chip ${this._rooms.includes(r.room_id) ? "on" : ""}"
                @click=${() => this._toggleRoom(r.room_id)}
                >${r.name}</span
              >`
            )
          : html`<span class="hint">Aucune pièce.</span>`}
      </div>

      <div class="actions">
        ${editing
          ? html`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>`
          : ""}
        <button @click=${this._close}>Annuler</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._save}>
          ${editing ? "Enregistrer" : "Créer le switch"}
        </button>
      </div>
    `;
  }
}
