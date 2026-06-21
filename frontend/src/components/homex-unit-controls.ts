import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { mdiLightbulb, mdiLightbulbOutline } from "@mdi/js";
import type { HomeAssistant, Unit } from "../types";
import { sharedStyles } from "../lib/styles";

/** Round lightbulb on/off toggle + title (name, id, active scene) for a unit. */
@customElement("homex-unit-controls")
export class HomexUnitControls extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) unit!: Unit & {
    room_id?: string;
    group_id?: string;
  };
  @property({ attribute: false }) areaIcon?: string;
  @property({ attribute: false }) floorName?: string;
  @property({ attribute: false }) activeScene?: string;

  static styles = [
    sharedStyles,
    css`
      .controls {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .bulb {
        flex: 0 0 auto;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        cursor: pointer;
        background: var(--secondary-background-color, #f0f0f0);
        color: var(--secondary-text-color);
      }
      .bulb:hover {
        filter: brightness(0.95);
      }
      .bulb.on {
        background: var(--state-active-color, #ffc107);
        color: #222;
      }
      .bulb svg {
        width: 24px;
        height: 24px;
        fill: currentColor;
      }
      .area-icon {
        --mdc-icon-size: 22px;
        color: var(--secondary-text-color);
      }
      .title {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .line1 {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .line2 {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      strong {
        font-size: 17px;
      }
      .group strong {
        font-size: 15px;
        font-weight: 500;
      }
      .active-scene {
        font-size: 12px;
        font-weight: 500;
        color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 14%, transparent);
        border-radius: 12px;
        padding: 2px 10px;
      }
      .rid {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .floor {
        font-size: 12px;
        color: var(--secondary-text-color);
        background: var(--secondary-background-color, #f0f0f0);
        border-radius: 6px;
        padding: 1px 8px;
      }
    `,
  ];

  private _isOn(entityId: string): boolean {
    return this.hass.states[entityId]?.state === "on";
  }
  private _toggle(e: Event) {
    e.stopPropagation(); // don't trigger card expand/collapse
    this.hass.callService("switch", "toggle", { entity_id: this.unit.switch });
  }

  render() {
    const u = this.unit;
    const on = this._isOn(u.switch);
    return html`
      <div class="controls">
        <button
          class="bulb ${on ? "on" : ""}"
          title=${on ? "Éteindre" : "Allumer"}
          @click=${this._toggle}
        >
          <svg viewBox="0 0 24 24">
            <path d=${on ? mdiLightbulb : mdiLightbulbOutline}></path>
          </svg>
        </button>
        ${this.areaIcon
          ? html`<ha-icon class="area-icon" .icon=${this.areaIcon}></ha-icon>`
          : ""}
        <div class="title">
          <div class="line1">
            <strong>${u.name}</strong>
            ${on && this.activeScene
              ? html`<span class="active-scene">${this.activeScene}</span>`
              : ""}
          </div>
          <div class="line2">
            <span class="rid">${u.group_id || u.room_id}</span>
            ${this.floorName
              ? html`<span class="floor">${this.floorName}</span>`
              : ""}
          </div>
        </div>
      </div>
    `;
  }
}
