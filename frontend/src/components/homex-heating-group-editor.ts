import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { mdiMinus, mdiPlus } from "@mdi/js";
import type { HeatingGroup, HeatingPreset, HomeAssistant, Room } from "../types";
import { deleteHeatingGroup, errorMessage, saveHeatingGroup } from "../api";
import { sharedStyles } from "../lib/styles";
import { textField, toggleSwitch } from "../lib/fields";
import { slugify } from "../lib/slug";

export const DEFAULT_HEATING_GROUP = "default";
const TEMP_MIN = 5;
const TEMP_MAX = 30;
const TEMP_STEP = 0.5;
const UNHEATED_DEFAULT = 12; // °C, when Unheated gets a setpoint

const clampTemp = (t: number) =>
  Math.min(TEMP_MAX, Math.max(TEMP_MIN, Math.round(t / TEMP_STEP) * TEMP_STEP));

/** Editor of a Setpoints entry (heating group): name, rooms, one setpoint per
 * heating mode. */
@customElement("homex-heating-group-editor")
export class HomexHeatingGroupEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) group: HeatingGroup | null = null;
  @property({ attribute: false }) groups: HeatingGroup[] = [];
  @property({ attribute: false }) presets: HeatingPreset[] = [];
  @property({ attribute: false }) rooms: Room[] = [];

  @state() private _name = "";
  @state() private _id = "";
  @state() private _rooms: string[] = [];
  @state() private _setpoints: Record<string, number> = {};
  @state() private _busy = false;
  private _idEdited = false;

  static styles = [
    sharedStyles,
    css`
      .hint {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin: 4px 0 8px;
      }
      .setpoint {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 0;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .setpoint .label {
        flex: 1;
        font-size: 14px;
      }
      .stepper {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .stepper button {
        width: 36px;
        height: 36px;
        min-height: 0;
        padding: 0;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .stepper svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
      }
      .stepper input {
        width: 72px;
        box-sizing: border-box;
        padding: 8px;
        font-size: 16px;
        text-align: center;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      .cut {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .unit {
        font-size: 14px;
        color: var(--secondary-text-color);
      }
      .rooms {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 4px 12px;
      }
      .rooms label {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 0;
        font-size: 14px;
        cursor: pointer;
      }
      .other {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    // A new group's form waits for the groups (its setpoints come from the
    // default group), which may load after the editor opened.
    const newFormReady =
      !this.group && changed.has("groups") && !Object.keys(this._setpoints).length;
    if (changed.has("group") || newFormReady) {
      const g = this.group;
      // A new group starts from the default group's setpoints.
      const base =
        g?.setpoints ??
        this.groups.find((x) => x.id === DEFAULT_HEATING_GROUP)?.setpoints ??
        {};
      this._name = g?.name ?? "";
      this._id = g?.id ?? "";
      this._rooms = [...(g?.rooms ?? [])];
      this._setpoints = { ...base };
      this._idEdited = !!g;
      this._busy = false;
    }
  }

  private get _isDefault(): boolean {
    return this.group?.id === DEFAULT_HEATING_GROUP;
  }

  private _onName(v: string) {
    this._name = v;
    if (!this._idEdited) this._id = slugify(v);
  }
  private _setTemp(presetId: string, value: number) {
    if (Number.isNaN(value)) return;
    this._setpoints = { ...this._setpoints, [presetId]: clampTemp(value) };
  }
  private _toggleRoom(roomId: string) {
    this._rooms = this._rooms.includes(roomId)
      ? this._rooms.filter((r) => r !== roomId)
      : [...this._rooms, roomId];
  }
  /** The other group a room currently belongs to, if any. */
  private _otherGroup(roomId: string): HeatingGroup | undefined {
    return this.groups.find(
      (g) => g.id !== this.group?.id && g.rooms.includes(roomId)
    );
  }

  /** −/+ stepper (0.5 °C) for one heating mode's setpoint. */
  private _stepper(presetId: string, t: number | undefined) {
    return html`<div class="stepper">
      <button
        title="−0,5 °C"
        @click=${() => this._setTemp(presetId, (t ?? 20) - TEMP_STEP)}
      >
        <svg viewBox="0 0 24 24"><path d=${mdiMinus}></path></svg>
      </button>
      <input
        type="number"
        inputmode="decimal"
        min=${TEMP_MIN}
        max=${TEMP_MAX}
        step=${TEMP_STEP}
        .value=${t != null ? String(t) : ""}
        placeholder="—"
        @change=${(e: Event) =>
          this._setTemp(presetId, parseFloat((e.target as HTMLInputElement).value))}
      />
      <button
        title="+0,5 °C"
        @click=${() => this._setTemp(presetId, (t ?? 20) + TEMP_STEP)}
      >
        <svg viewBox="0 0 24 24"><path d=${mdiPlus}></path></svg>
      </button>
      <span class="unit">°C</span>
    </div>`;
  }

  private _setUnheatedCut(presetId: string, cut: boolean) {
    const { [presetId]: _drop, ...rest } = this._setpoints;
    // Uncut: start from a frost-protection-like temperature.
    this._setpoints = cut ? rest : { ...rest, [presetId]: UNHEATED_DEFAULT };
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("heating-group-closed"));
  }

  private async _save() {
    this._busy = true;
    try {
      await saveHeatingGroup(
        this.hass,
        {
          id: this._id,
          name: this._name.trim(),
          rooms: this._isDefault ? [] : this._rooms,
          setpoints: this._setpoints,
        },
        !this.group
      );
      this._close();
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
      this._busy = false;
    }
  }

  private async _delete() {
    if (!this.group) return;
    if (!confirm(`Supprimer le setpoint « ${this.group.name} » ? Ses pièces repassent dans le setpoint par défaut.`)) {
      return;
    }
    this._busy = true;
    try {
      await deleteHeatingGroup(this.hass, this.group.id);
      this._close();
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
      this._busy = false;
    }
  }

  render() {
    const editing = !!this.group;
    return html`
      ${textField("Nom", this._name, (v) => this._onName(v), "Chambres")}
      ${editing
        ? html`<div class="section">Id : ${this.group!.id}</div>`
        : textField("Id", this._id, (v) => {
            this._idEdited = true;
            this._id = slugify(v);
          })}

      <div class="section">Consignes de température</div>
      ${this.presets.map((p) => {
        const t = this._setpoints[p.id];
        if (p.unheated) {
          // Unheated: heating cut (no setpoint), or a temperature (frost guard…).
          const cut = t == null;
          return html`<div class="setpoint">
            <span class="label">${p.name}</span>
            <label class="cut">
              ${toggleSwitch(cut, (on) => this._setUnheatedCut(p.id, on))}
              Chauffage coupé
            </label>
            ${cut ? "" : this._stepper(p.id, t)}
          </div>`;
        }
        return html`<div class="setpoint">
          <span class="label">${p.name}</span>
          ${this._stepper(p.id, t)}
        </div>`;
      })}

      <div class="section">Pièces</div>
      ${this._isDefault
        ? html`<p class="hint">
            S'applique à toutes les pièces qui ne sont dans aucun autre setpoint.
          </p>`
        : html`<p class="hint">
              Une pièce n'appartient qu'à un setpoint : la cocher la retire de son
              setpoint actuel.
            </p>
            <div class="rooms">
              ${this.rooms.map((r) => {
                const other = this._otherGroup(r.room_id);
                return html`<label>
                  ${toggleSwitch(this._rooms.includes(r.room_id), () =>
                    this._toggleRoom(r.room_id)
                  )}
                  <span>
                    ${r.name}
                    ${other && !this._rooms.includes(r.room_id)
                      ? html`<span class="other">· ${other.name}</span>`
                      : ""}
                  </span>
                </label>`;
              })}
            </div>`}

      <div class="actions">
        <button
          class="primary"
          ?disabled=${this._busy || !this._name.trim() || !this._id}
          @click=${this._save}
        >
          Enregistrer
        </button>
        <button ?disabled=${this._busy} @click=${this._close}>Annuler</button>
        ${editing && !this.group!.builtin
          ? html`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>`
          : ""}
      </div>
    `;
  }
}
