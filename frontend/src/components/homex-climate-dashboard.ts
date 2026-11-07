import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { mdiFire, mdiFireOff } from "@mdi/js";
import type { HeatingZone, HomeAssistant, Room } from "../types";
import { fireChanged } from "../types";
import { errorMessage, fetchHeating, setHeatingEnabled, updateRoom } from "../api";
import { radiatorClimate, roomIsHeating, roomZoneMode } from "../lib/climate";
import { toggleSwitch } from "../lib/fields";
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
  @state() private _enabledLocal = true;
  /** Global heating: switch.homex_heating (live), else the last loaded value. */
  private get _enabled(): boolean {
    const st = this.hass?.states["switch.homex_heating"];
    return st ? st.state === "on" : this._enabledLocal;
  }
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
      .room {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 14px;
        padding: 10px 0;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }
      .card-title + .room {
        border-top: none;
      }
      .room.off .info,
      .room.off .temps {
        opacity: 0.55;
      }
      .room .info {
        flex: 1;
        min-width: 140px;
      }
      .room .name {
        font-weight: 500;
      }
      .room .temps {
        display: flex;
        gap: 12px;
        font-size: 14px;
        white-space: nowrap;
      }
      .room-switch {
        display: flex;
        cursor: pointer;
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
      this._enabledLocal = heating.enabled ?? true;
    } catch {
      this._zones = [];
    }
    this._loaded = true;
  }

  private async _toggle() {
    this._busy = true;
    try {
      const target = !this._enabled;
      await setHeatingEnabled(this.hass, target);
      this._enabledLocal = target;
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
      ${this._renderRooms()}
    `;
  }

  // --- Rooms ---------------------------------------------------------------

  /** Rooms with the Climate module: heating switch, mode, setpoint, current
   * temperature, radiators and heating demand. */
  private _renderRooms() {
    const rooms = this.rooms.filter((r) => (r.modules ?? []).includes("heating"));
    if (!rooms.length) return "";
    return html`<div class="card">
      <div class="card-title">Pièces</div>
      ${rooms.map((r) => this._renderRoom(r))}
    </div>`;
  }

  private _fmt(values: number[]): string {
    if (!values.length) return "—";
    const min = Math.min(...values);
    const max = Math.max(...values);
    const f = (v: number) => `${Math.round(v * 10) / 10}`;
    return min === max ? `${f(min)} °C` : `${f(min)}–${f(max)} °C`;
  }

  private _renderRoom(r: Room) {
    const radiators = r.heating?.radiators ?? [];
    const on = r.heating?.enabled !== false;
    const valves = radiators
      .map((rad) => radiatorClimate(this.hass, rad.device_id))
      .map((id) => (id ? this.hass.states[id] : undefined))
      .filter((st) => st && !["unknown", "unavailable"].includes(st.state));
    const num = (v: unknown) => (typeof v === "number" ? [v] : []);
    // Setpoint: the valves' targets (off valves have none).
    const targets = valves.filter((st) => st.state !== "off").flatMap((st) => num(st.attributes.temperature));
    // Current temperature: the room's reference sensor, else the valves'.
    const ref = this.hass.states[`sensor.homex_${r.room_id}_temperature`];
    const refValue = parseFloat(ref?.state);
    const current = Number.isNaN(refValue)
      ? this._fmt(valves.flatMap((st) => num(st.attributes.current_temperature)))
      : `${refValue} °C`;
    const zm = roomZoneMode(this.hass, r);
    const heating = roomIsHeating(this.hass, r);
    const busy = this._roomBusy.has(r.room_id);
    return html`<div class="room ${on ? "" : "off"}">
      <label class="room-switch" title=${radiators.length ? "Chauffage de la pièce" : "Aucun radiateur"}>
        ${toggleSwitch(on, (v) => this._setRoomHeating(r, v), busy || !radiators.length)}
      </label>
      <div class="info">
        <div class="name">${r.name}</div>
        <div class="muted">
          ${radiators.length} radiateur(s)${zm ? html` · ${zm.mode}` : ""}
        </div>
      </div>
      <div class="temps">
        <span title="Consigne">🎯 ${on && targets.length ? this._fmt(targets) : on ? "—" : "coupé"}</span>
        <span title="Température actuelle">🌡 ${current}</span>
      </div>
      ${radiators.length
        ? html`<span class="pill ${heating ? "heating" : ""}">
            <svg viewBox="0 0 24 24"><path d=${heating ? mdiFire : mdiFireOff}></path></svg>
            ${heating ? "Heating" : "Idle"}
          </span>`
        : ""}
    </div>`;
  }

  @state() private _roomBusy = new Set<string>();

  /** The room's own heating: off = Unheated, on = its zone's mode. */
  private async _setRoomHeating(r: Room, enabled: boolean) {
    this._roomBusy = new Set([...this._roomBusy, r.room_id]);
    try {
      await updateRoom(this.hass, {
        entry_id: r.entry_id,
        heating: { radiators: r.heating?.radiators ?? [], enabled },
      });
      fireChanged(this); // the panel reloads the rooms
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
    } finally {
      const next = new Set(this._roomBusy);
      next.delete(r.room_id);
      this._roomBusy = next;
    }
  }
}
