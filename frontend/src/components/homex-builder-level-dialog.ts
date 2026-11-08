import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { PlanLevel } from "../types";
import { sharedStyles } from "../lib/styles";
import { t } from "../lib/i18n";
import "./homex-dialog";

export interface HaFloor {
  floor_id: string;
  name: string;
  level: number | null;
}

/**
 * Create or edit a 3D Builder floor: its Home Assistant floor (those already
 * used are left out) and its level number.
 */
@customElement("homex-builder-level-dialog")
export class HomexBuilderLevelDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  /** The floor being edited, null to create one. */
  @property({ attribute: false }) level: PlanLevel | null = null;
  /** Home Assistant floors, by level. */
  @property({ attribute: false }) floors: HaFloor[] = [];
  /** HA floors other Builder floors already use. */
  @property({ attribute: false }) usedFloors: string[] = [];
  /** Level numbers other Builder floors already use. */
  @property({ attribute: false }) usedLevels: number[] = [];
  /** Level number suggested for a new floor. */
  @property({ type: Number }) suggestedLevel = 0;

  @state() private _floorId = "";
  @state() private _level = 0;

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("open") && this.open) {
      this._level = this.level?.level ?? this.suggestedLevel;
      const free = this._available();
      this._floorId =
        this.level?.floor_id ??
        (free.find((f) => f.level === this._level) ?? free[0])?.floor_id ??
        "";
    }
  }

  private _available(): HaFloor[] {
    return this.floors.filter(
      (f) => f.floor_id === this.level?.floor_id || !this.usedFloors.includes(f.floor_id)
    );
  }

  private get _levelTaken(): boolean {
    return this.usedLevels.includes(this._level);
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }

  private _save() {
    const floor = this.floors.find((f) => f.floor_id === this._floorId);
    if (!floor || this._levelTaken) return;
    this.dispatchEvent(
      new CustomEvent("level-saved", {
        detail: { floor_id: floor.floor_id, name: floor.name, level: this._level },
      })
    );
  }

  private _delete() {
    if (!this.level) return;
    if (this.level.rooms.length && !confirm(t("builder.level_delete_confirm", { name: this.level.name }))) return;
    this.dispatchEvent(new CustomEvent("level-deleted"));
  }

  render() {
    const floors = this._available();
    const editing = !!this.level;
    return html`<homex-dialog
      compact
      .open=${this.open}
      heading=${editing ? t("builder.level_edit") : t("builder.level_new")}
      @dialog-closed=${this._close}
    >
      ${floors.length
        ? html`
            <p class="hint">${t("builder.level_dialog_intro")}</p>
            <label class="field">
              <span>${t("builder.level_floor")}</span>
              <select @change=${(e: Event) => (this._floorId = (e.target as HTMLSelectElement).value)}>
                ${floors.map(
                  (f) => html`<option value=${f.floor_id} ?selected=${f.floor_id === this._floorId}>${f.name}</option>`
                )}
              </select>
            </label>
            <label class="field">
              <span>${t("builder.level_number")}</span>
              <input
                type="number"
                step="1"
                .value=${String(this._level)}
                @input=${(e: Event) => (this._level = Math.round(Number((e.target as HTMLInputElement).value) || 0))}
              />
              <span class="hint">${t("builder.level_number_hint")}</span>
            </label>
            ${this._levelTaken ? html`<p class="err">${t("builder.level_taken", { level: this._level })}</p>` : nothing}
          `
        : html`<p class="hint">${t("builder.no_floor_left")}</p>`}
      ${editing
        ? html`<button slot="actions" class="danger-link" @click=${this._delete}>${t("builder.level_delete")}</button>`
        : nothing}
      <button slot="actions" @click=${this._close}>${t("common.cancel")}</button>
      <button
        slot="actions"
        class="primary"
        ?disabled=${!floors.length || !this._floorId || this._levelTaken}
        @click=${this._save}
      >
        ${editing ? t("common.save") : t("builder.level_create")}
      </button>
    </homex-dialog>`;
  }

  static styles = [
    sharedStyles,
    css`
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin: 14px 0 0;
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .field select,
      .field input {
        font: inherit;
        font-size: 15px;
        padding: 9px 10px;
        border-radius: 8px;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
        background: var(--secondary-background-color, transparent);
        color: var(--primary-text-color);
      }
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 0;
        line-height: 1.5;
      }
      .err {
        color: var(--error-color, #db4437);
        font-size: 13px;
        margin: 10px 0 0;
      }
      button.danger-link {
        background: transparent;
        color: var(--error-color, #db4437);
        margin-right: auto;
      }
    `,
  ];
}
