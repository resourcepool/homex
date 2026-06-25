import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { mdiLightbulbOn, mdiLightbulbOffOutline } from "@mdi/js";
import type { Group, HomeAssistant, Room } from "../types";
import { sharedStyles } from "../lib/styles";
import "./homex-unit-controls";
import "./homex-group-dialog";

/** A single group: live controls, scene-edit links, and its config modal. */
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
        gap: 4px;
      }
      homex-unit-controls {
        flex: 1;
      }
      .scene-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        color: var(--secondary-text-color);
        text-decoration: none;
      }
      .scene-link:hover {
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
        color: var(--primary-text-color);
      }
      .scene-link svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
      }
    `,
  ];

  private get _slug(): string {
    return `${this.room.room_id}_${this.group.group_id}`;
  }

  render() {
    const slug = this._slug;
    return html`
      <div class="row">
        <homex-unit-controls .hass=${this.hass} .unit=${this.group}></homex-unit-controls>
        <a
          class="scene-link"
          href="/config/scene/edit/homex_${slug}_turn_on"
          target="_blank"
          rel="noopener"
          title="Éditer la scène « allumé » du groupe"
        >
          <svg viewBox="0 0 24 24"><path d=${mdiLightbulbOn}></path></svg>
        </a>
        <a
          class="scene-link"
          href="/config/scene/edit/homex_${slug}_turn_off"
          target="_blank"
          rel="noopener"
          title="Éditer la scène « éteint » du groupe"
        >
          <svg viewBox="0 0 24 24"><path d=${mdiLightbulbOffOutline}></path></svg>
        </a>
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
