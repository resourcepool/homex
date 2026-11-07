import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  mdiLightbulbAlertOutline,
  mdiLightbulbOnOutline,
  mdiLightbulbOutline,
} from "@mdi/js";
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
  // Hide the on/off bulb (e.g. a room whose lights module is disabled).
  @property({ type: Boolean }) hideToggle = false;
  // Hide the id line under the name (the dashboard's room cards).
  @property({ type: Boolean }) hideId = false;
  // Short live readings shown right of the name, stacked (e.g. 21.5 °C, 48 %).
  @property({ attribute: false }) info: string[] = [];

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        min-width: 0;
      }
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
        flex: 0 0 auto;
        --mdc-icon-size: 22px;
        color: var(--secondary-text-color);
      }
      .title {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .info {
        display: flex;
        flex-direction: column;
        flex: none;
        font-size: 11px;
        line-height: 1.3;
        color: var(--secondary-text-color);
        white-space: nowrap;
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
        flex-wrap: wrap;
        gap: 4px 8px;
      }
      strong {
        font-size: 17px;
        overflow-wrap: anywhere;
      }
      .group strong {
        font-size: 15px;
        font-weight: 500;
      }
      .rid {
        font-size: 12px;
        color: var(--secondary-text-color);
        overflow-wrap: anywhere;
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
  /** Lit (a Homex scene applies) vs. stray (should be off, yet some light is
   * on — turned on outside Homex). A room's switch turns on with any of its
   * parts, so for a room "should be off" means no active scene. */
  private _lightState(on: boolean): "lit" | "stray" | "off" {
    const u = this.unit;
    if (!u.group_id && on) {
      const active = this.hass.states[u.switch]?.attributes?.active_scene;
      return active != null ? "lit" : "stray";
    }
    if (on) return "lit";
    const anyOn = (u.devices ?? []).some((id) => this._isOn(id)) || this._isOn(u.light);
    return anyOn ? "stray" : "off";
  }
  private _toggle(e: Event) {
    e.stopPropagation(); // don't trigger card expand/collapse
    const u = this.unit;
    if (u.group_id) {
      this.hass.callService("switch", "toggle", { entity_id: u.switch });
      return;
    }
    // A room shows "on" as soon as one of its groups is on. Pressing it should
    // turn the room ON (apply its scene) — never toggle a running group off.
    // Only turn off when a room scene is actually active.
    const sceneActive =
      this.hass.states[u.switch]?.attributes?.active_scene != null;
    this.hass.callService("switch", sceneActive ? "turn_off" : "turn_on", {
      entity_id: u.switch,
    });
  }

  render() {
    const u = this.unit;
    const on = this._isOn(u.switch);
    // The bulb's icon alone tells the state: a Homex scene is lit, lights are
    // on outside of one (stray), or all off.
    const light = this._lightState(on);
    const title =
      light === "lit"
        ? `Allumée${this.activeScene ? ` · ${this.activeScene}` : ""} — éteindre`
        : light === "stray"
          ? "Éteinte, mais au moins une lumière est allumée — allumer"
          : "Allumer";
    return html`
      <div class="controls">
        ${this.hideToggle
          ? ""
          : html`<button
              class="bulb ${on ? "on" : ""}"
              title=${title}
              @click=${this._toggle}
            >
              <svg viewBox="0 0 24 24">
                <path
                  d=${light === "lit"
                    ? mdiLightbulbOnOutline
                    : light === "stray"
                      ? mdiLightbulbAlertOutline
                      : mdiLightbulbOutline}
                ></path>
              </svg>
            </button>`}
        ${this.areaIcon
          ? html`<ha-icon class="area-icon" .icon=${this.areaIcon}></ha-icon>`
          : ""}
        <div class="title">
          <div class="line1">
            <strong>${u.name}</strong>
          </div>
          ${this.hideId && !this.floorName
            ? ""
            : html`<div class="line2">
                ${this.hideId ? "" : html`<span class="rid">${u.group_id || u.room_id}</span>`}
                ${this.floorName
                  ? html`<span class="floor">${this.floorName}</span>`
                  : ""}
              </div>`}
        </div>
        ${this.info.length
          ? html`<div class="info">${this.info.map((v) => html`<span>${v}</span>`)}</div>`
          : ""}
      </div>
    `;
  }
}
