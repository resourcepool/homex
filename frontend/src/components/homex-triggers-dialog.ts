import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, Room, TriggerSpec } from "../types";
import { fireChanged } from "../types";
import { errorMessage, updateRoom } from "../api";
import { sharedStyles } from "../lib/styles";
import "./homex-dialog";
import "./homex-trigger-list";

/** Modal to configure a room's toggle and scene-switching triggers. */
@customElement("homex-triggers-dialog")
export class HomexTriggersDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) room!: Room;

  @state() private _toggle: TriggerSpec[] = [];
  @state() private _scene: TriggerSpec[] = [];
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
        margin-bottom: 14px;
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
      this._toggle = this.room?.triggers ?? [];
      this._scene = this.room?.scene_triggers ?? [];
      this._busy = false;
    }
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }

  private async _save() {
    this._busy = true;
    try {
      await updateRoom(this.hass, {
        entry_id: this.room.entry_id,
        triggers: this._toggle,
        scene_triggers: this._scene,
      });
      fireChanged(this);
      this._close();
    } catch (err) {
      this._busy = false;
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  render() {
    return html`
      <homex-dialog
        .open=${this.open}
        heading="Déclencheurs de la pièce"
        @dialog-closed=${this._close}
      >
        <div class="group">
          <div class="section">Triggers toggle (allumer / éteindre)</div>
          <p class="hint">
            Entité (changement d'état) ou appareil (action). Chaque déclenchement
            permute l'état on/off de la pièce.
          </p>
          <homex-trigger-list
            .hass=${this.hass}
            .value=${this._toggle}
            @value-changed=${(e: CustomEvent) => (this._toggle = e.detail.value)}
          ></homex-trigger-list>
        </div>

        <div class="group">
          <div class="section">Triggers scene switching</div>
          <p class="hint">Chaque déclenchement passe à la scène suivante (cycle).</p>
          <homex-trigger-list
            .hass=${this.hass}
            .value=${this._scene}
            @value-changed=${(e: CustomEvent) => (this._scene = e.detail.value)}
          ></homex-trigger-list>
          <p class="hint">
            La stratégie (repart de zéro / dernière utilisée) se règle dans
            « Modifier la pièce ».
          </p>
        </div>

        <span slot="actions">
          <button @click=${this._close}>Annuler</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            Enregistrer
          </button>
        </span>
      </homex-dialog>
    `;
  }
}
