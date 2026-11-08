import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { mdiArrowDown, mdiArrowUp, mdiStop } from "@mdi/js";
import type { HomeAssistant, Room, ShutterGroup } from "../types";
import { errorMessage, roomShutter, type ShutterService } from "../api";
import { coverPosition, defaultShutterGroup, shutterSummary } from "../lib/shutter";
import { sharedStyles } from "../lib/styles";
import { t } from "../lib/i18n";
import "./homex-dialog";

/** Quick control of a room's shutters: live state, open / stop / close. */
@customElement("homex-shutter-control-dialog")
export class HomexShutterControlDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) room!: Room;

  @state() private _groupId = "";
  @state() private _busy = false;

  static styles = [
    sharedStyles,
    css`
      .groups {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 16px;
      }
      .chip {
        min-height: 32px;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 13px;
      }
      .chip.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .summary {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 16px;
      }
      .summary svg {
        width: 48px;
        height: 48px;
        fill: var(--primary-color);
        flex: none;
      }
      .summary .state {
        font-size: 18px;
        font-weight: 500;
      }
      .summary .pos {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .controls {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 16px;
      }
      .controls button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 12px 8px;
      }
      .controls svg {
        width: 28px;
        height: 28px;
        fill: currentColor;
      }
      .cover {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-top: 1px solid var(--divider-color, #e0e0e0);
        font-size: 14px;
      }
      .cover svg {
        width: 22px;
        height: 22px;
        fill: var(--secondary-text-color);
        flex: none;
      }
      .cover .name {
        flex: 1;
        overflow-wrap: anywhere;
      }
      .cover .val {
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    // Each opening starts on the room's default shutter group.
    if (changed.has("open") && this.open) {
      this._groupId = defaultShutterGroup(this.room)?.id ?? "";
    }
  }

  private get _groups(): ShutterGroup[] {
    return (this.room.shutter_groups ?? []).filter((g) => g.devices?.length);
  }

  private async _run(service: ShutterService) {
    this._busy = true;
    try {
      await roomShutter(this.hass, this.room.entry_id, this._groupId, service);
    } catch (err) {
      alert(t("common.error", { message: errorMessage(err) }));
    } finally {
      this._busy = false;
    }
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }

  render() {
    if (!this.open) return html``;
    const groups = this._groups;
    const group = groups.find((g) => g.id === this._groupId) ?? groups[0];
    const covers = group?.devices ?? [];
    const sum = shutterSummary(this.hass, covers);
    return html`
      <homex-dialog
        compact
        .open=${this.open}
        .heading=${t("shutterControlDialog.heading", { room: this.room.name })}
        @dialog-closed=${this._close}
      >
        ${groups.length > 1
          ? html`<div class="groups">
              ${groups.map(
                (g) => html`<button
                  class="chip ${g.id === group?.id ? "active" : ""}"
                  @click=${() => (this._groupId = g.id)}
                >
                  ${g.name}
                </button>`
              )}
            </div>`
          : ""}
        <div class="summary">
          <svg viewBox="0 0 24 24"><path d=${sum.icon}></path></svg>
          <div>
            <div class="state">${sum.label}</div>
            <div class="pos">
              ${sum.position !== null ? t("shutterControlDialog.avg_position", { position: sum.position }) : ""}
            </div>
          </div>
        </div>
        <div class="controls">
          <button ?disabled=${this._busy || !group} @click=${() => this._run("open_cover")}>
            <svg viewBox="0 0 24 24"><path d=${mdiArrowUp}></path></svg>${t("shutterControlDialog.open")}
          </button>
          <button ?disabled=${this._busy || !group} @click=${() => this._run("stop_cover")}>
            <svg viewBox="0 0 24 24"><path d=${mdiStop}></path></svg>${t("shutterControlDialog.stop")}
          </button>
          <button ?disabled=${this._busy || !group} @click=${() => this._run("close_cover")}>
            <svg viewBox="0 0 24 24"><path d=${mdiArrowDown}></path></svg>${t("shutterControlDialog.close")}
          </button>
        </div>
        ${covers.map((id) => {
          const one = shutterSummary(this.hass, [id]);
          const pos = coverPosition(this.hass, id);
          return html`<div class="cover">
            <svg viewBox="0 0 24 24"><path d=${one.icon}></path></svg>
            <span class="name">
              ${this.hass.states[id]?.attributes?.friendly_name || id}
            </span>
            <span class="val">${one.label}${pos !== null ? ` · ${pos} %` : ""}</span>
          </div>`;
        })}
        <button slot="actions" @click=${this._close}>${t("shutterControlDialog.done")}</button>
      </homex-dialog>
    `;
  }
}
