import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, Room } from "./types";
import { HOMEX_CHANGED } from "./types";
import { errorMessage, fetchRooms } from "./api";
import { loadHaComponents } from "./lib/ha-elements";
import "./components/homex-room-card";
import "./components/homex-room-dialog";

// Bump together with PANEL_VERSION in panel.py. Shown in the header so you can
// confirm a full page reload picked up the latest build.
const BUILD = "35";

/** Homex sidebar panel: lists rooms and orchestrates loading / reloading. */
@customElement("homex-panel")
export class HomexPanel extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) narrow = false;
  @property({ attribute: false }) route: any;
  @property({ attribute: false }) panel: any;

  @state() private _rooms: Room[] | null = null;
  @state() private _error: string | null = null;
  @state() private _createOpen = false;
  // entry_id of the single expanded room (accordion), persisted in localStorage.
  @state() private _expanded: string | null =
    localStorage.getItem("homex_expanded") || null;

  private _loaded = false;

  static styles = css`
    .wrap {
      max-width: 1000px;
      margin: 0 auto;
      padding: 16px;
      color: var(--primary-text-color);
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 22px;
      font-weight: 500;
      margin: 0;
    }
    .ver {
      font-size: 12px;
      font-weight: 400;
      color: var(--secondary-text-color);
      vertical-align: middle;
    }
    .header-actions {
      display: flex;
      gap: 8px;
    }
    button {
      cursor: pointer;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      background: var(--secondary-background-color, #f0f0f0);
      color: var(--primary-text-color);
    }
    button.primary {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .floor-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 22px 0 10px;
      padding-bottom: 6px;
      border-bottom: 2px solid var(--divider-color, #e0e0e0);
      font-size: 16px;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .floor-header ha-icon {
      color: var(--secondary-text-color);
    }
    .msg {
      padding: 24px;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .msg.err {
      color: var(--error-color, #db4437);
    }
    a {
      color: var(--primary-color);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(HOMEX_CHANGED, this._reload);
    this.addEventListener("homex-toggle-expand", this._onToggleExpand);
  }
  disconnectedCallback() {
    this.removeEventListener(HOMEX_CHANGED, this._reload);
    this.removeEventListener("homex-toggle-expand", this._onToggleExpand);
    super.disconnectedCallback();
  }

  private _onToggleExpand = (e: Event) => {
    const id = (e as CustomEvent).detail.entry_id as string;
    this._expanded = this._expanded === id ? null : id;
    if (this._expanded) localStorage.setItem("homex_expanded", this._expanded);
    else localStorage.removeItem("homex_expanded");
  };

  updated(changed: Map<string, unknown>) {
    if (changed.has("hass") && this.hass && !this._loaded) {
      this._loaded = true;
      // Pull HA's native form elements into the registry, then load data.
      loadHaComponents().then(() => this.requestUpdate());
      this._reload();
    }
  }

  private _reload = async () => {
    try {
      this._rooms = await fetchRooms(this.hass);
      this._error = null;
    } catch (err) {
      this._error = errorMessage(err);
    }
  };

  private _roomCard(room: Room) {
    return html`<homex-room-card
      .hass=${this.hass}
      .room=${room}
      .expanded=${room.entry_id === this._expanded}
    ></homex-room-card>`;
  }

  // Split rooms: unlinked/no-floor first, then one group per floor (by level).
  private _grouped() {
    const ungrouped: Room[] = [];
    const byFloor = new Map<string, Room[]>();
    for (const room of this._rooms || []) {
      const area = room.area_id ? this.hass.areas?.[room.area_id] : null;
      const floorId = area?.floor_id;
      if (floorId && this.hass.floors?.[floorId]) {
        (byFloor.get(floorId) ?? byFloor.set(floorId, []).get(floorId)!).push(room);
      } else {
        ungrouped.push(room);
      }
    }
    const floors = [...byFloor.keys()]
      .map((id) => this.hass.floors[id])
      .sort(
        (a, b) => (a.level ?? 0) - (b.level ?? 0) || a.name.localeCompare(b.name)
      );
    return { ungrouped, floors, byFloor };
  }

  render() {
    let body;
    if (this._error) {
      body = html`<div class="msg err">Erreur : ${this._error}</div>`;
    } else if (!this._rooms) {
      body = html`<div class="msg">Chargement…</div>`;
    } else if (!this._rooms.length) {
      body = html`<div class="msg">
        Aucune pièce. Clique sur <strong>＋ Nouvelle pièce</strong> en haut à
        droite pour en créer une.
      </div>`;
    } else {
      const { ungrouped, floors, byFloor } = this._grouped();
      body = html`
        ${ungrouped.map((room) => this._roomCard(room))}
        ${floors.map(
          (floor) => html`
            <div class="floor-header">
              ${floor.icon
                ? html`<ha-icon .icon=${floor.icon}></ha-icon>`
                : ""}
              <span>${floor.name}</span>
            </div>
            ${(byFloor.get(floor.floor_id) || []).map((room) =>
              this._roomCard(room)
            )}
          `
        )}
      `;
    }
    return html`
      <div class="wrap">
        <header>
          <h1>Homex <span class="ver">v${BUILD}</span></h1>
          <div class="header-actions">
            <button @click=${this._reload}>Rafraîchir</button>
            <button class="primary" @click=${() => (this._createOpen = true)}>
              ＋ Nouvelle pièce
            </button>
          </div>
        </header>
        ${body}
      </div>
      <homex-room-dialog
        .hass=${this.hass}
        .room=${null}
        .open=${this._createOpen}
        @dialog-closed=${() => (this._createOpen = false)}
      ></homex-room-dialog>
    `;
  }
}
