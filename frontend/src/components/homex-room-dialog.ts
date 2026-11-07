import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HeatingZone, HomeAssistant, Room, SceneStrategy } from "../types";
import { fireChanged } from "../types";
import {
  createRoom,
  errorMessage,
  fetchHeating,
  setRoomHeatingZone,
  updateRoom,
} from "../api";
import { sharedStyles } from "../lib/styles";
import "./homex-select";
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
  @state() private _modules: string[] = ["lights"];
  @state() private _devices: string[] = [];
  @state() private _strategy: SceneStrategy = "recall_first";
  @state() private _busy = false;
  // Climate module: the room's heating zone.
  @state() private _zones: HeatingZone[] = [];
  @state() private _zoneId = "default";
  private _initialZone = "default";
  // Once the user edits the id by hand, stop deriving it from the name.
  private _idEdited = false;

  static styles = [
    sharedStyles,
    css`
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 0 0 8px;
      }
      .module {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        margin: 6px 0;
        cursor: pointer;
      }
      .module-name {
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
      .tab {
        display: inline-block;
        margin: 14px 0 2px;
        padding: 6px 14px;
        border-radius: 8px 8px 0 0;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
        border-bottom: 2px solid var(--primary-color);
        font-size: 14px;
        font-weight: 600;
      }
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("open") && this.open) {
      this._name = this.room?.name ?? "";
      this._id = this.room?.room_id ?? "";
      this._areaId = this.room?.area_id ?? "";
      this._modules = [...(this.room?.modules ?? ["lights"])];
      this._devices = this.room?.devices ?? [];
      this._strategy = this.room?.scene_strategy ?? "recall_first";
      this._busy = false;
      this._idEdited = !!this.room; // editing: keep existing id untouched
      this._loadZones();
    }
  }

  private async _loadZones() {
    try {
      this._zones = (await fetchHeating(this.hass)).zones ?? [];
    } catch {
      this._zones = [];
    }
    const roomId = this.room?.room_id;
    this._initialZone =
      (roomId && this._zones.find((z) => z.rooms.includes(roomId))?.id) || "default";
    this._zoneId = this._initialZone;
  }

  private get _areas(): { area_id: string; name: string }[] {
    return Object.values(this.hass.areas || {})
      .map((a: any) => ({ area_id: a.area_id, name: a.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private _hasModule(key: string): boolean {
    return this._modules.includes(key);
  }
  private _setModule(key: string, on: boolean) {
    this._modules = on
      ? [...new Set([...this._modules, key])]
      : this._modules.filter((m) => m !== key);
  }

  private _moduleRow(key: string, emoji: string, label: string, hint: string) {
    const on = this._hasModule(key);
    return html`
      <label class="module">
        <span class="module-name">${emoji} ${label}</span>
        <span class="toggle ${on ? "on" : ""}">
          <input
            type="checkbox"
            .checked=${on}
            @change=${(e: Event) =>
              this._setModule(key, (e.target as HTMLInputElement).checked)}
          />
          <span class="knob"></span>
        </span>
      </label>
      <p class="hint">${hint}</p>
    `;
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
          modules: this._modules,
          devices: this._devices,
          scene_strategy: this._strategy,
        });
      } else {
        await createRoom(this.hass, {
          name,
          room_id,
          area_id,
          modules: this._modules,
          devices: this._devices,
          scene_strategy: this._strategy,
        });
      }
      if (this._hasModule("heating") && this._zoneId !== this._initialZone) {
        await setRoomHeatingZone(this.hass, room_id, this._zoneId);
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
        <homex-select
          placeholder="Aucune"
          .value=${this._areaId}
          .options=${this._areas.map((a) => ({ value: a.area_id, label: a.name }))}
          @value-changed=${(e: CustomEvent) => (this._areaId = e.detail.value)}
        ></homex-select>

        <div class="section">Modules</div>
        ${this._moduleRow(
          "lights",
          "💡",
          "Lights",
          "Le module Lights gère l'allumage, les scènes et les groupes de la pièce."
        )}
        ${this._moduleRow(
          "switches",
          "🎛",
          "Switches",
          "Le module Switches gère les interrupteurs physiques de la pièce."
        )}
        ${this._moduleRow(
          "shutters",
          "🪟",
          "Shutters",
          "Le module Shutters gère les volets roulants de la pièce."
        )}
        ${this._moduleRow(
          "heating",
          "🔥",
          "Climate",
          "Le module Climate gère les capteurs et les radiateurs de la pièce (onglet Climate)."
        )}

        ${this._hasModule("lights")
          ? html`
              <div class="tab">Lights</div>
              <div class="section">Luminaires de la pièce</div>
              <homex-entity-picker
                .hass=${this.hass}
                .includeDomains=${DEVICE_DOMAINS}
                .value=${this._devices}
                @value-changed=${(e: CustomEvent) =>
                  (this._devices = e.detail.value)}
              ></homex-entity-picker>

              <div class="section">Scene switching strategy</div>
              <homex-select
                .value=${this._strategy}
                .options=${[
                  { value: "recall_first", label: "Repart de zéro", secondary: "Première scène" },
                  { value: "recall_last", label: "Dernière utilisée", secondary: "Reprend la dernière scène" },
                ]}
                @value-changed=${(e: CustomEvent) =>
                  (this._strategy = e.detail.value as SceneStrategy)}
              ></homex-select>
              <p class="hint">
                Quand un trigger scene-switching change de scène et que la pièce
                était éteinte : repartir de la première scène, ou reprendre la
                dernière utilisée.
              </p>
            `
          : ""}

        ${this._hasModule("heating")
          ? html`
              <div class="tab">Climate</div>
              <div class="section">Zone de chauffage</div>
              <homex-select
                .value=${this._zoneId}
                .options=${this._zones.map((z) => ({
                  value: z.id,
                  label: z.name,
                  secondary: z.id === "default" ? "Toutes les autres pièces" : undefined,
                }))}
                @value-changed=${(e: CustomEvent) => (this._zoneId = e.detail.value)}
              ></homex-select>
              <p class="hint">
                Capteurs et radiateurs se configurent dans l'onglet Climate de la pièce.
              </p>
            `
          : ""}

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
