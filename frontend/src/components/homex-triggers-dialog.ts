import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, Room, TriggerSpec } from "../types";
import { fireChanged } from "../types";
import { errorMessage, updateRoom } from "../api";
import { sharedStyles } from "../lib/styles";
import "./homex-dialog";
import "./homex-trigger-selector";

/** Modal to configure a room's toggle and scene-switching triggers. */
@customElement("homex-triggers-dialog")
export class HomexTriggersDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) room!: Room;

  @state() private _toggle: TriggerSpec[] = [];
  @state() private _scene: TriggerSpec[] = [];
  @state() private _dimUp: TriggerSpec[] = [];
  @state() private _dimDown: TriggerSpec[] = [];
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
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("open") && this.open) {
      this._toggle = (this.room?.triggers ?? []).map((t) => ({ ...t }));
      this._scene = (this.room?.scene_triggers ?? []).map((t) => ({ ...t }));
      this._dimUp = (this.room?.dim_up_triggers ?? []).map((t) => ({ ...t }));
      this._dimDown = (this.room?.dim_down_triggers ?? []).map((t) => ({ ...t }));
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
        dim_up_triggers: this._dimUp,
        dim_down_triggers: this._dimDown,
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
            Chaque déclenchement permute l'état on/off de la pièce.
          </p>
          <homex-trigger-selector
            .hass=${this.hass}
            .value=${this._toggle}
            @value-changed=${(e: CustomEvent) => (this._toggle = e.detail.value)}
          ></homex-trigger-selector>
        </div>

        <div class="group">
          <div class="section">Triggers scene switching</div>
          <p class="hint">Chaque déclenchement passe à la scène suivante (cycle).</p>
          <homex-trigger-selector
            .hass=${this.hass}
            .value=${this._scene}
            @value-changed=${(e: CustomEvent) => (this._scene = e.detail.value)}
          ></homex-trigger-selector>
          <p class="hint">
            La stratégie (repart de zéro / dernière utilisée) se règle dans
            « Modifier la pièce ».
          </p>
        </div>

        <div class="group">
          <div class="section">Dimmer + (monter la luminosité)</div>
          <p class="hint">
            Chaque déclenchement ajoute 20 à la luminosité des lumières de la pièce.
          </p>
          <homex-trigger-selector
            .hass=${this.hass}
            .value=${this._dimUp}
            @value-changed=${(e: CustomEvent) => (this._dimUp = e.detail.value)}
          ></homex-trigger-selector>
        </div>

        <div class="group">
          <div class="section">Dimmer − (baisser la luminosité)</div>
          <p class="hint">
            Chaque déclenchement retire 20 à la luminosité des lumières de la pièce.
          </p>
          <homex-trigger-selector
            .hass=${this.hass}
            .value=${this._dimDown}
            @value-changed=${(e: CustomEvent) => (this._dimDown = e.detail.value)}
          ></homex-trigger-selector>
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
