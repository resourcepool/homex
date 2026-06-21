import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Group, HomeAssistant, Room } from "../types";
import { sharedStyles } from "../lib/styles";
import "./homex-unit-controls";
import "./homex-group-dialog";

/** A single group: live controls + a button opening its config modal. */
@customElement("homex-group-row")
export class HomexGroupRow extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) room!: Room;
  @property({ attribute: false }) group!: Group;

  @state() private _open = false;

  static styles = [
    sharedStyles,
    css`
      .row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      homex-unit-controls {
        flex: 1;
      }
    `,
  ];

  render() {
    return html`
      <div class="row">
        <homex-unit-controls .hass=${this.hass} .unit=${this.group}></homex-unit-controls>
        <button title="Configurer le groupe" @click=${() => (this._open = true)}>
          ⚙︎
        </button>
      </div>
      <homex-group-dialog
        .hass=${this.hass}
        .room=${this.room}
        .group=${this.group}
        .open=${this._open}
        @dialog-closed=${() => (this._open = false)}
      ></homex-group-dialog>
    `;
  }
}
