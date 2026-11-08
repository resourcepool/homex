import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { HomeAssistant } from "../types";
import { goBack, joinPath, navigate, segments } from "../lib/router";
import { sharedStyles } from "../lib/styles";
import { t } from "../lib/i18n";
import "./homex-heating-manager";
import "./homex-climate-metrics";

type Page = "metrics" | "heating" | "ac";

const PAGES: { key: Page; icon: string; label: () => string; desc: () => string }[] = [
  {
    key: "metrics",
    icon: "📈",
    label: () => t("climateManager.metrics"),
    desc: () => t("climateManager.metrics_desc"),
  },
  {
    key: "heating",
    icon: "🔥",
    label: () => t("climateManager.heating"),
    desc: () => t("climateManager.heating_desc"),
  },
  {
    key: "ac",
    icon: "❄️",
    label: () => t("climateManager.ac"),
    desc: () => t("climateManager.ac_desc"),
  },
];

/** Climate Manager (the Climate module): a landing page leading to its three
 * sections, each on its own page — Metrics, Heating, Air Conditioning. */
@customElement("homex-climate-manager")
export class HomexClimateManager extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  /** URL of the manager (the landing page). */
  @property({ attribute: false }) base = "";
  /** Sub-page below `base`: "" | "metrics" | "heating/..." | "ac". */
  @property({ attribute: false }) subpath = "";

  static styles = [
    sharedStyles,
    css`
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      .head h2 {
        flex: 1;
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
      .head button {
        min-height: 0;
        padding: 8px 12px;
        border-radius: 8px;
      }
      .pages {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 12px;
      }
      .page {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        cursor: pointer;
        background: var(--card-background-color, #1c1c1c);
      }
      .page:hover {
        border-color: var(--primary-color);
      }
      .page.soon {
        opacity: 0.6;
      }
      .icon {
        flex: none;
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
      }
      .name {
        font-size: 16px;
        font-weight: 500;
      }
      .desc {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .msg {
        padding: 24px 4px;
        color: var(--secondary-text-color);
      }
    `,
  ];

  private get _page(): Page | null {
    const first = segments(this.subpath)[0];
    return PAGES.some((p) => p.key === first) ? (first as Page) : null;
  }

  /** Back to the landing page (one history step when we came from it). */
  private _toLanding = () => goBack(this.base);

  private _placeholder(title: string, text: string) {
    return html`
      <div class="head">
        <button @click=${this._toLanding}>${t("climateManager.back_climate")}</button>
        <h2>${title}</h2>
      </div>
      <div class="msg">${text}</div>
    `;
  }

  render() {
    const page = this._page;
    if (page === "heating") {
      return html`<homex-heating-manager
        .hass=${this.hass}
        .base=${joinPath(this.base, "heating")}
        .subpath=${segments(this.subpath).slice(1).join("/")}
        @close=${this._toLanding}
      ></homex-heating-manager>`;
    }
    if (page === "metrics") {
      return html`<homex-climate-metrics
        .hass=${this.hass}
        .base=${joinPath(this.base, "metrics")}
        .subpath=${segments(this.subpath).slice(1).join("/")}
        @close=${this._toLanding}
      ></homex-climate-metrics>`;
    }
    if (page === "ac") {
      return this._placeholder(t("climateManager.ac"), t("climateManager.ac_unavailable"));
    }
    return html`
      <div class="head">
        <button @click=${() => this.dispatchEvent(new CustomEvent("close"))}>← Homex</button>
        <h2>${t("climateManager.title")}</h2>
      </div>
      <div class="pages">
        ${PAGES.map(
          (p) => html`<div
            class="page ${p.key === "ac" ? "soon" : ""}"
            @click=${() => navigate(joinPath(this.base, p.key))}
          >
            <div class="icon">${p.icon}</div>
            <div>
              <div class="name">${p.label()}</div>
              <div class="desc">${p.desc()}</div>
            </div>
          </div>`
        )}
      </div>
    `;
  }
}
