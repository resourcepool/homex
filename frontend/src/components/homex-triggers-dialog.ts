import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, Room, TriggerSpec } from "../types";
import { fireChanged } from "../types";
import { errorMessage, updateRoom } from "../api";
import { sharedStyles } from "../lib/styles";
import { TRIGGER_DOMAINS } from "../lib/domains";
import "./homex-dialog";
import "./homex-entity-picker";
import "./homex-device-triggers";

const entityIds = (specs: TriggerSpec[] = []) =>
  specs.map((t) => t.entity_id).filter((id): id is string => !!id);
const deviceSpecs = (specs: TriggerSpec[] = []): TriggerSpec[] =>
  specs
    .filter((t) => t.device_id)
    .map((t) => (t.action ? { device_id: t.device_id, action: t.action } : { device_id: t.device_id }));
const toSpecs = (entities: string[], devices: TriggerSpec[]): TriggerSpec[] => [
  ...entities.map((entity_id) => ({ entity_id })),
  ...devices,
];

/** Modal to configure a room's toggle and scene-switching triggers. */
@customElement("homex-triggers-dialog")
export class HomexTriggersDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) room!: Room;

  @state() private _toggleEnt: string[] = [];
  @state() private _toggleDev: TriggerSpec[] = [];
  @state() private _sceneEnt: string[] = [];
  @state() private _sceneDev: TriggerSpec[] = [];
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
      .label {
        font-size: 13px;
        font-weight: 500;
        margin: 10px 0 4px;
      }
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("open") && this.open) {
      this._toggleEnt = entityIds(this.room?.triggers);
      this._toggleDev = deviceSpecs(this.room?.triggers);
      this._sceneEnt = entityIds(this.room?.scene_triggers);
      this._sceneDev = deviceSpecs(this.room?.scene_triggers);
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
        triggers: toSpecs(this._toggleEnt, this._toggleDev),
        scene_triggers: toSpecs(this._sceneEnt, this._sceneDev),
      });
      fireChanged(this);
      this._close();
    } catch (err) {
      this._busy = false;
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  private _pickers(
    entities: string[],
    devices: TriggerSpec[],
    onEnt: (v: string[]) => void,
    onDev: (v: TriggerSpec[]) => void
  ) {
    return html`
      <div class="label">Entités (changement d'état)</div>
      <homex-entity-picker
        .hass=${this.hass}
        .includeDomains=${TRIGGER_DOMAINS}
        .value=${entities}
        @value-changed=${(e: CustomEvent) => onEnt(e.detail.value)}
      ></homex-entity-picker>
      <div class="label">Appareils (action — « toutes » ou une précise)</div>
      <homex-device-triggers
        .hass=${this.hass}
        .value=${devices}
        @value-changed=${(e: CustomEvent) => onDev(e.detail.value)}
      ></homex-device-triggers>
    `;
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
          ${this._pickers(
            this._toggleEnt,
            this._toggleDev,
            (v) => (this._toggleEnt = v),
            (v) => (this._toggleDev = v)
          )}
        </div>

        <div class="group">
          <div class="section">Triggers scene switching</div>
          <p class="hint">Chaque déclenchement passe à la scène suivante (cycle).</p>
          ${this._pickers(
            this._sceneEnt,
            this._sceneDev,
            (v) => (this._sceneEnt = v),
            (v) => (this._sceneDev = v)
          )}
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
