import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { mdiFire, mdiFireOff } from "@mdi/js";
import type { HeatingZone, HomeAssistant, Room } from "../types";
import { errorMessage, fetchHeating, setHeatingEnabled } from "../api";
import { sharedStyles } from "../lib/styles";
import "./homex-select";

// Which tolerance the device presets enforce (normal / agressive): the global
// one sets every zone's (TOLERANCE_ENTITY_<zone>).
const TOLERANCE_ENTITY = "select.homex_climate_tolerance_mode";

/** Dashboard Climate tab: the global heating context (on / off, demand,
 * tolerance mode) and, per heating zone, its active mode and demand. */
@customElement("homex-climate-dashboard")
export class HomexClimateDashboard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) rooms: Room[] = [];

  @state() private _zones: HeatingZone[] = [];
  @state() private _enabled = true;
  @state() private _loaded = false;
  @state() private _busy = false;

  static styles = [
    sharedStyles,
    css`
      .card {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        background: var(--card-background-color, #1c1c1c);
        padding: 14px 16px;
        margin-bottom: 16px;
      }
      .card-title {
        font-size: 13px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--secondary-text-color);
        margin-bottom: 10px;
      }
      .global {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px 16px;
      }
      .global .state {
        flex: 1;
        font-size: 18px;
        font-weight: 500;
      }
      .global .state.on {
        color: var(--state-climate-heat-color, #ff8100);
      }
      .pills {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 10px 3px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
      }
      .pill svg {
        width: 14px;
        height: 14px;
        fill: currentColor;
      }
      .pill.heating {
        color: var(--state-climate-heat-color, #ff8100);
        background: color-mix(in srgb, var(--state-climate-heat-color, #ff8100) 16%, transparent);
      }
      .zone {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 14px;
        padding: 10px 0;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }
      .zone:first-of-type {
        border-top: none;
      }
      .zone .info {
        flex: 1;
        min-width: 160px;
      }
      .zone .name {
        font-weight: 500;
      }
      .muted {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .options {
        margin-top: 12px;
      }
      .field-select {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .btn-group {
        display: inline-flex;
        align-self: flex-start;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        overflow: hidden;
      }
      .btn-group button {
        min-height: 0;
        padding: 6px 14px;
        border-radius: 0;
        background: transparent;
        color: var(--primary-text-color);
      }
      .btn-group button + button {
        border-left: 1px solid var(--divider-color, #ccc);
      }
      .btn-group button.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        cursor: default;
      }
      .zone-mode {
        width: 200px;
      }
      @media (max-width: 600px) {
        .zone-mode {
          width: 100%;
        }
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._load();
  }

  private async _load() {
    try {
      const heating = await fetchHeating(this.hass);
      this._zones = heating.zones ?? [];
      this._enabled = heating.enabled ?? true;
    } catch {
      this._zones = [];
    }
    this._loaded = true;
  }

  private async _toggle() {
    this._busy = true;
    try {
      await setHeatingEnabled(this.hass, !this._enabled);
      this._enabled = !this._enabled;
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
    } finally {
      this._busy = false;
    }
  }

  private _demandPill(entityId: string) {
    const on = this.hass.states[entityId]?.state === "on";
    return html`<span class="pill ${on ? "heating" : ""}" title=${entityId}>
      <svg viewBox="0 0 24 24"><path d=${on ? mdiFire : mdiFireOff}></path></svg>
      ${on ? "Heating" : "Idle"}
    </span>`;
  }

  /** Rooms of a zone (the default zone: every room no other zone lists). */
  private _zoneRooms(zone: HeatingZone): string {
    const listed = new Set(this._zones.flatMap((z) => z.rooms));
    const ids =
      zone.id === "default"
        ? this.rooms.map((r) => r.room_id).filter((id) => !listed.has(id))
        : zone.rooms;
    const names = ids.map((id) => this.rooms.find((r) => r.room_id === id)?.name ?? id);
    return names.length ? names.join(", ") : "Aucune pièce";
  }

  private _renderZone(zone: HeatingZone) {
    // The zone's select entity: live mode, changed through HA.
    const select = `select.homex_heating_${zone.id}`;
    const st = this.hass.states[select];
    const options: string[] = st?.attributes?.options ?? [];
    return html`<div class="zone">
      <div class="info">
        <div class="name">${zone.name}</div>
        <div class="muted">${this._zoneRooms(zone)}</div>
      </div>
      ${this._demandPill(`binary_sensor.homex_heating_needed_${zone.id}`)}
      <homex-select
        class="zone-mode"
        title="Mode de la zone"
        .value=${st?.state ?? ""}
        ?disabled=${!st}
        .options=${options.map((o) => ({ value: o, label: o }))}
        @value-changed=${(e: CustomEvent) =>
          this.hass.callService("select", "select_option", {
            entity_id: select,
            option: e.detail.value,
          })}
      ></homex-select>
      ${this.hass.states[`${TOLERANCE_ENTITY}_${zone.id}`]
        ? html`<span class="zone-tol" title="Tolérance de la zone">
            ${this._btnGroup(`${TOLERANCE_ENTITY}_${zone.id}`)}
          </span>`
        : ""}
    </div>`;
  }

  /** A segmented button group for a select entity, its option highlighted. */
  private _btnGroup(entityId: string) {
    const st = this.hass.states[entityId];
    return html`<div class="btn-group" role="radiogroup" title=${entityId}>
      ${(st?.attributes?.options ?? []).map(
        (o: string) => html`<button
          role="radio"
          aria-checked=${o === st.state ? "true" : "false"}
          class=${o === st.state ? "active" : ""}
          @click=${() =>
            o !== st.state &&
            this.hass.callService("select", "select_option", { entity_id: entityId, option: o })}
        >
          ${o}
        </button>`
      )}
    </div>`;
  }

  render() {
    if (!this._loaded) return html`<div class="muted">Chargement…</div>`;
    const tolerance = this.hass.states[TOLERANCE_ENTITY];
    return html`
      <div class="card">
        <div class="card-title">Chauffage</div>
        <div class="global">
          <span class="state ${this._enabled ? "on" : ""}">
            ${this._enabled ? "Activé" : "Désactivé"}
          </span>
          <div class="pills">
            ${this._demandPill("binary_sensor.homex_heating_needed")}
          </div>
          <button ?disabled=${this._busy} @click=${this._toggle}>
            ${this._enabled ? "Désactiver" : "Activer"}
          </button>
        </div>
        <div class="options">
          ${tolerance
            ? html`<div class="field-select" title=${TOLERANCE_ENTITY}>
                <span>Tolérance</span>
                ${this._btnGroup(TOLERANCE_ENTITY)}
              </div>`
            : ""}
        </div>
      </div>
      <div class="card">
        <div class="card-title">Zones</div>
        ${this._zones.map((z) => this._renderZone(z))}
      </div>
    `;
  }
}
