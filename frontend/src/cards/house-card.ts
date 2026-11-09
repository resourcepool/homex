/**
 * custom:homex-house-card — the 3D house published from the 3D Builder, full
 * size: the commands pane on the left (view, floors, the picked room's
 * lights, shutters and climate) and the doll's house on the right, live.
 *
 * Made for a panel view: Publish in the 3D Builder creates a Home Assistant
 * dashboard holding this card alone. three.js loads with the card only.
 *
 *   type: custom:homex-house-card
 *   title: House          # optional, the pane's title
 *   level: 0              # optional, the floor shown first
 */
import { LitElement, css, html, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant, Plan, Room } from "../types";
import { fetchPlan, fetchRooms } from "../api";
import { loadLanguageSetting, onLanguageChange, syncHass, t } from "../lib/i18n";

interface HouseCardConfig {
  type: string;
  title?: string;
  level?: number;
}

class HomexHouseCard extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _config?: HouseCardConfig;
  @state() private _plan: Plan | null = null;
  @state() private _rooms: Room[] = [];
  @state() private _error: string | null = null;
  @state() private _ready = false;
  private _loading = false;
  private _unlisten?: () => void;

  setConfig(config: HouseCardConfig) {
    this._config = config;
  }

  static getStubConfig() {
    return { type: "custom:homex-house-card" };
  }

  getCardSize() {
    return 12;
  }

  getGridOptions() {
    return { columns: "full", rows: 8, min_rows: 6 };
  }

  connectedCallback() {
    super.connectedCallback();
    this._unlisten = onLanguageChange(() => this.requestUpdate());
    import("../components/homex-builder-render").then(() => (this._ready = true));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unlisten?.();
  }

  willUpdate(changed: PropertyValues) {
    if (changed.has("hass") && this.hass) {
      syncHass(this.hass);
      loadLanguageSetting(this.hass);
      if (!this._plan && !this._loading) this._load();
    }
  }

  private async _load() {
    if (!this.hass) return;
    this._loading = true;
    try {
      const [plan, rooms] = await Promise.all([fetchPlan(this.hass), fetchRooms(this.hass)]);
      this._plan = plan;
      this._rooms = rooms;
      this._error = null;
    } catch (err) {
      this._error = (err as Error)?.message ?? String(err);
    } finally {
      this._loading = false;
    }
  }

  render() {
    if (this._error) return html`<ha-card><p class="msg">${this._error}</p></ha-card>`;
    const plan = this._plan;
    if (!plan || !this._ready || !this.hass) return html`<ha-card><p class="msg">${t("common.loading")}</p></ha-card>`;
    if (!plan.published || !plan.levels.length) return html`<ha-card><p class="msg">${t("builder.house_card_unpublished")}</p></ha-card>`;
    const wanted = this._config?.level ?? 0;
    const level = plan.levels.find((l) => l.level === wanted) ?? plan.levels[0];
    return html`<ha-card>
      <homex-builder-render
        .hass=${this.hass}
        .plan=${plan}
        .levelId=${level?.id ?? null}
        .names=${Object.fromEntries(this._rooms.map((r) => [r.room_id, r.name]))}
        .rooms=${this._rooms}
        .heading=${this._config?.title ?? ""}
      ></homex-builder-render>
    </ha-card>`;
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }
    ha-card {
      height: 100%;
      min-height: calc(100vh - var(--header-height, 56px) - 16px);
      display: flex;
      overflow: hidden;
    }
    homex-builder-render {
      flex: 1 1 auto;
      border: 0;
      border-radius: inherit;
    }
    .msg {
      margin: auto;
      padding: 24px;
      color: var(--secondary-text-color);
      text-align: center;
    }
  `;
}

if (!customElements.get("homex-house-card")) customElements.define("homex-house-card", HomexHouseCard);
