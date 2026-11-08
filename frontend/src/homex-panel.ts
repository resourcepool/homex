import { LitElement, css, html } from "lit";
import { mdiDownload, mdiMenu, mdiRefresh } from "@mdi/js";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, Room } from "./types";
import { HOMEX_CHANGED } from "./types";
import { errorMessage, fetchRooms } from "./api";
import { loadHaComponents } from "./lib/ha-elements";
import { goBack, joinPath, navigate, segments, type PanelRoute } from "./lib/router";
import "./components/homex-room-card";
import "./components/homex-room-dialog";
import "./components/homex-export-dialog";
import "./components/homex-switch-manager";
import "./components/homex-shutter-manager";
import "./components/homex-climate-manager";
import "./components/homex-climate-dashboard";

// Bump together with PANEL_VERSION in panel.py. Shown in the header so you can
// confirm a full page reload picked up the latest build.
const BUILD = "203";

/** Homex sidebar panel: lists rooms and orchestrates loading / reloading. */
@customElement("homex-panel")
export class HomexPanel extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) narrow = false;
  @property({ attribute: false }) route?: PanelRoute;
  @property({ attribute: false }) panel: any;

  @state() private _rooms: Room[] | null = null;
  @state() private _error: string | null = null;
  @state() private _createOpen = false;
  @state() private _exportOpen = false;
  @state() private _menuOpen = false;
  // Dashboard tab (General: rooms; Climate: heating context), remembered.
  @state() private _dashTab: "general" | "climate" =
    localStorage.getItem("homex_dash_tab") === "climate" ? "climate" : "general";
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
      flex-wrap: wrap;
      gap: 8px 12px;
      margin-bottom: 16px;
    }
    .title {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1 1 auto;
    }
    /* HA hides its sidebar on narrow screens: panels must offer the toggle. */
    .menu-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      margin-left: -8px;
      border-radius: 50%;
      background: transparent;
    }
    .menu-btn svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
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
      margin-left: auto;
    }
    .header-actions button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }
    .ico {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }
    @media (max-width: 600px) {
      .wrap {
        padding: 12px;
      }
      /* Icon-only secondary actions to fit a phone width. */
      .lbl {
        display: none;
      }
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
    button:disabled {
      opacity: 0.5;
      cursor: default;
    }
    .menu-wrap {
      position: relative;
    }
    .kebab {
      padding: 8px 12px;
      font-size: 18px;
      line-height: 1;
    }
    .menu-backdrop {
      position: fixed;
      inset: 0;
      z-index: 30;
    }
    .menu {
      position: absolute;
      top: 44px;
      right: 0;
      z-index: 31;
      min-width: 200px;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.22);
      padding: 6px;
      display: flex;
      flex-direction: column;
    }
    .menu button {
      text-align: left;
      background: transparent;
      border-radius: 8px;
    }
    .menu button:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }
    .menu button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .menu-sep {
      height: 1px;
      margin: 4px 6px;
      background: var(--divider-color, #e0e0e0);
    }
    .dash-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }
    .dash-tab {
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .dash-tab.active {
      color: var(--primary-color);
      border-bottom: 2px solid var(--primary-color);
      margin-bottom: -1px;
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

  /** Sub-page path segments: [] (rooms), ["switches", ...], ["shutters", ...]. */
  private get _segs(): string[] {
    return segments(this.route?.path);
  }
  private get _view(): "rooms" | "switches" | "shutters" | "climate" {
    const first = this._segs[0];
    return first === "switches" || first === "shutters" || first === "climate"
      ? first
      : "rooms";
  }
  private get _prefix(): string {
    return this.route?.prefix || "/homex";
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has("hass") && this.hass && !this._loaded) {
      this._loaded = true;
      // Pull HA's native form elements into the registry, then load data.
      loadHaComponents().then(() => this.requestUpdate());
      this._reload();
    }
    // Former Heating Manager URLs (/heating/...) now live under /climate.
    if (this._segs[0] === "heating") {
      navigate(joinPath(this._prefix, "climate", ...this._segs), true);
      return;
    }
    // Back from a manager: switches/presets changed there feed the room cards
    // (switch action counts), so reload the rooms.
    const prev = changed.get("route") as PanelRoute | undefined;
    if (
      prev &&
      this._loaded &&
      this._view === "rooms" &&
      segments(prev.path).length
    ) {
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

  private _backToRooms = () => goBack(this._prefix);

  /** General (rooms) and, once a room has the Climate module, Climate tabs. */
  private _renderDashboard(general: unknown) {
    const climate = (this._rooms ?? []).some((r) => (r.modules ?? []).includes("heating"));
    if (!climate) return general;
    const tab = this._dashTab;
    const pick = (t: "general" | "climate") => {
      this._dashTab = t;
      try {
        localStorage.setItem("homex_dash_tab", t);
      } catch {
        /* private mode: not remembered */
      }
    };
    return html`
      <div class="dash-tabs">
        <span class="dash-tab ${tab === "general" ? "active" : ""}" @click=${() => pick("general")}
          >General</span
        >
        <span class="dash-tab ${tab === "climate" ? "active" : ""}" @click=${() => pick("climate")}
          >Climate</span
        >
      </div>
      ${tab === "climate"
        ? html`<homex-climate-dashboard
            .hass=${this.hass}
            .rooms=${this._rooms ?? []}
          ></homex-climate-dashboard>`
        : general}
    `;
  }

  private _toggleSidebar() {
    this.dispatchEvent(
      new Event("hass-toggle-menu", { bubbles: true, composed: true })
    );
  }

  private _onOpenSwitchAdd = (e: CustomEvent) => {
    const room = e.detail?.room_id;
    navigate(
      joinPath(this._prefix, "switches", "switches", "new") +
        (room ? `?room=${encodeURIComponent(room)}` : "")
    );
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
    if (this._view === "switches") {
      return html`
        <div class="wrap">
          <homex-switch-manager
            .hass=${this.hass}
            .base=${joinPath(this._prefix, "switches")}
            .subpath=${this._segs.slice(1).join("/")}
            @close=${this._backToRooms}
          ></homex-switch-manager>
        </div>
      `;
    }
    if (this._view === "climate") {
      return html`
        <div class="wrap">
          <homex-climate-manager
            .hass=${this.hass}
            .base=${joinPath(this._prefix, "climate")}
            .subpath=${this._segs.slice(1).join("/")}
            @close=${this._backToRooms}
          ></homex-climate-manager>
        </div>
      `;
    }
    if (this._view === "shutters") {
      return html`
        <div class="wrap">
          <homex-shutter-manager
            .hass=${this.hass}
            .base=${joinPath(this._prefix, "shutters")}
            .subpath=${this._segs.slice(1).join("/")}
            @close=${this._backToRooms}
          ></homex-shutter-manager>
        </div>
      `;
    }
    return html`
      <div class="wrap" @open-switch-add=${this._onOpenSwitchAdd}>
        <header>
          <div class="title">
            ${this.narrow
              ? html`<button
                  class="menu-btn"
                  title="Menu"
                  @click=${this._toggleSidebar}
                >
                  <svg viewBox="0 0 24 24"><path d=${mdiMenu}></path></svg>
                </button>`
              : ""}
            <h1>Homex <span class="ver">v${BUILD}</span></h1>
          </div>
          <div class="header-actions">
            <button class="primary" @click=${() => (this._createOpen = true)}>
              ＋ Nouvelle pièce
            </button>
            <div class="menu-wrap">
              <button
                class="kebab"
                title="Menu"
                @click=${() => (this._menuOpen = !this._menuOpen)}
              >
                ⋮
              </button>
              ${this._menuOpen
                ? html`
                    <div
                      class="menu-backdrop"
                      @click=${() => (this._menuOpen = false)}
                    ></div>
                    <div class="menu">
                      <button
                        @click=${() => {
                          this._menuOpen = false;
                          this._reload();
                        }}
                      >
                        <svg class="ico" viewBox="0 0 24 24"><path d=${mdiRefresh}></path></svg>
                        Rafraîchir
                      </button>
                      <button
                        ?disabled=${!this._rooms?.length}
                        @click=${() => {
                          this._menuOpen = false;
                          this._exportOpen = true;
                        }}
                      >
                        <svg class="ico" viewBox="0 0 24 24"><path d=${mdiDownload}></path></svg>
                        Exporter
                      </button>
                      <div class="menu-sep"></div>
                      <button
                        @click=${() => {
                          this._menuOpen = false;
                          navigate(joinPath(this._prefix, "switches"));
                        }}
                      >
                        🎛 Switch Manager
                      </button>
                      <button
                        @click=${() => {
                          this._menuOpen = false;
                          navigate(joinPath(this._prefix, "shutters"));
                        }}
                      >
                        🪟 Shutter Manager
                      </button>
                      <button
                        @click=${() => {
                          this._menuOpen = false;
                          navigate(joinPath(this._prefix, "climate"));
                        }}
                      >
                        🌡 Climate Manager
                      </button>
                    </div>
                  `
                : ""}
            </div>
          </div>
        </header>
        ${this._renderDashboard(body)}
      </div>
      <homex-room-dialog
        .hass=${this.hass}
        .room=${null}
        .open=${this._createOpen}
        @dialog-closed=${() => (this._createOpen = false)}
      ></homex-room-dialog>
      <homex-export-dialog
        .rooms=${this._rooms || []}
        .open=${this._exportOpen}
        @dialog-closed=${() => (this._exportOpen = false)}
      ></homex-export-dialog>
    `;
  }
}
