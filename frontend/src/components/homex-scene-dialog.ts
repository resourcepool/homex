import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, Room, Scene, TriggerSpec } from "../types";
import { fireChanged } from "../types";
import { addScene, errorMessage, renameScene } from "../api";
import { sharedStyles } from "../lib/styles";
import { textField } from "../lib/fields";
import { slugify } from "../lib/slug";
import "./homex-dialog";
import "./homex-trigger-selector";

type Mode = "new" | "attach";

interface SceneOption {
  config_id: string;
  name: string;
}

/** Modal to add a room scene (new or by adopting an existing one) or rename. */
@customElement("homex-scene-dialog")
export class HomexSceneDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) room!: Room;
  @property({ attribute: false }) scene: Scene | null = null;

  @state() private _name = "";
  @state() private _mode: Mode = "new";
  @state() private _attachId = "";
  @state() private _triggers: TriggerSpec[] = [];
  @state() private _busy = false;

  static styles = [
    sharedStyles,
    css`
      .modes {
        display: flex;
        gap: 8px;
        margin: 8px 0;
      }
      .modes button {
        flex: 1;
      }
      .modes button.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .err {
        color: var(--error-color, #db4437);
        font-size: 12px;
        margin: -4px 0 8px;
      }
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
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("open") && this.open) {
      this._name = this.scene?.name ?? "";
      this._mode = "new";
      this._attachId = "";
      this._triggers = (this.scene?.triggers ?? []).map((t) => ({ ...t }));
      this._busy = false;
    }
  }

  // Existing HA scenes that are not already Homex-managed.
  private get _availableScenes(): SceneOption[] {
    return Object.keys(this.hass.states)
      .filter((id) => id.startsWith("scene."))
      .map((id) => {
        const attrs = this.hass.states[id].attributes || {};
        return {
          config_id: attrs.id ? String(attrs.id) : "",
          name: attrs.friendly_name || id,
        };
      })
      .filter((s) => s.config_id && !s.config_id.startsWith("homex_"))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // The proposed name must not collide with another scene of the room.
  private get _nameTaken(): boolean {
    const name = this._name.trim();
    if (!name) return false;
    const key = slugify(name);
    return this.room.scenes.some((s) => {
      if (this.scene && s.key === this.scene.key) return false; // self (rename)
      return s.name.toLowerCase() === name.toLowerCase() || s.key === key;
    });
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }

  private _onPickScene(configId: string) {
    this._attachId = configId;
    if (!this._name.trim()) {
      const found = this._availableScenes.find((s) => s.config_id === configId);
      if (found) this._name = found.name;
    }
  }

  private async _save() {
    const name = this._name.trim();
    if (!name || this._nameTaken) return;
    if (!this.scene && this._mode === "attach" && !this._attachId) {
      alert("Choisis une scène existante à rattacher.");
      return;
    }
    this._busy = true;
    try {
      if (this.scene) {
        await renameScene(
          this.hass, this.room.entry_id, this.scene.key, name, this._triggers
        );
      } else if (this._mode === "attach") {
        await addScene(
          this.hass, this.room.entry_id, name, this._attachId, this._triggers
        );
      } else {
        await addScene(
          this.hass, this.room.entry_id, name, undefined, this._triggers
        );
      }
      fireChanged(this);
      this._close();
    } catch (err) {
      this._busy = false;
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  render() {
    const editing = !!this.scene;
    const taken = this._nameTaken;
    const valid = !!this._name.trim() && !taken;
    return html`
      <homex-dialog
        .open=${this.open}
        heading=${editing ? "Renommer la scène" : "Nouvelle scène"}
        @dialog-closed=${this._close}
      >
        ${textField("Nom de la scène", this._name, (v) => (this._name = v), "Nuit")}
        ${taken ? html`<div class="err">Ce nom de scène existe déjà.</div>` : ""}
        ${editing ? "" : this._renderModePicker()}
        <div class="section">Déclencheurs (activent cette scène)</div>
        <homex-trigger-selector
          .hass=${this.hass}
          .value=${this._triggers}
          @value-changed=${(e: CustomEvent) => (this._triggers = e.detail.value)}
        ></homex-trigger-selector>
        <span slot="actions">
          <button @click=${this._close}>Annuler</button>
          <button class="primary" ?disabled=${this._busy || !valid} @click=${this._save}>
            ${editing
              ? "Renommer"
              : this._mode === "attach"
                ? "Rattacher"
                : "Créer la scène"}
          </button>
        </span>
      </homex-dialog>
    `;
  }

  private _renderModePicker() {
    return html`
      <div class="modes">
        <button
          class=${this._mode === "new" ? "active" : ""}
          @click=${() => (this._mode = "new")}
        >
          Nouvelle
        </button>
        <button
          class=${this._mode === "attach" ? "active" : ""}
          @click=${() => (this._mode = "attach")}
        >
          Rattacher une existante
        </button>
      </div>
      ${this._mode === "new"
        ? html`<div class="section">
            La scène est créée « tout éteint » ; édite-la ensuite dans Home Assistant.
          </div>`
        : html`
            <div class="section">
              Scène existante à adopter (elle sera renommée, son contenu conservé)
            </div>
            <select
              .value=${this._attachId}
              @change=${(e: Event) =>
                this._onPickScene((e.target as HTMLSelectElement).value)}
            >
              <option value="">— Choisir une scène —</option>
              ${this._availableScenes.map(
                (s) => html`<option value=${s.config_id}>${s.name}</option>`
              )}
            </select>
          `}
    `;
  }
}
