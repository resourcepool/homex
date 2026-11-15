import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  mdiBrightness6,
  mdiChevronRight,
  mdiClose,
  mdiContentCopy,
  mdiLightbulb,
  mdiLightbulbOff,
  mdiPalette,
  mdiThermometer,
} from "@mdi/js";
import type { AnimatedLight, HomeAssistant } from "../types";
import { sharedStyles } from "../lib/styles";
import { toggleSwitch } from "../lib/fields";
import { t } from "../lib/i18n";

type Rgb = [number, number, number];
type Caps = "color" | "white" | "dim";
type View = "brightness" | "color" | "temp";

export const DEFAULT_LIGHT_COLOR: Rgb = [255, 180, 107];
const MIN_K = 2000;
const MAX_K = 6500;
const COLOR_MODES = ["hs", "xy", "rgb", "rgbw", "rgbww"];

// ---- colour maths ---------------------------------------------------------

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const toHex = (c: number[]) =>
  "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const rgba = (c: number[], a: number) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

/** Hue (0-360) + saturation (0-1) at full value → rgb. */
function hsToRgb(h: number, s: number): Rgb {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return 1 - s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
}

/** rgb → [hue 0-360, saturation 0-1] (value ignored). */
function rgbToHs(c: number[]): [number, number] {
  const [r, g, b] = c.map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  h = (h * 60 + 360) % 360;
  return [h, max ? d / max : 0];
}

/** Approximate rgb of a white temperature (Tanner Helland). */
function kelvinToRgb(k: number): Rgb {
  const t = k / 100;
  const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  const g =
    t <= 66
      ? 99.4708025861 * Math.log(t) - 161.1195681661
      : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return [r, g, b].map((v) => Math.round(clamp(v, 0, 255))) as Rgb;
}

const COLOR_FAVS: Rgb[] = [
  [255, 70, 40],
  [255, 120, 30],
  [255, 200, 40],
  [50, 210, 120],
  [60, 120, 255],
  [150, 80, 255],
  [255, 80, 160],
];
const WHITE_FAVS = [2200, 2700, 3500, 4500, 6000];

// ---- vertical pill slider (like HA's more-info light control) -------------

/**
 * A tall rounded vertical slider: the fill rises from the bottom. `track`
 * sets the background (a gradient for temperature), `fill` the filled part
 * (none: a thumb line only). Fires `value-changed` while dragging.
 */
@customElement("homex-pill-slider")
export class HomexPillSlider extends LitElement {
  @property({ type: Number }) value = 50;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 100;
  @property() track = "var(--secondary-background-color, rgba(127,127,127,0.2))";
  @property() fill = "";
  @property() label = "";

  static styles = css`
    :host {
      display: block;
      width: 112px;
      height: 300px;
      touch-action: none;
      user-select: none;
    }
    .pill {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 28px;
      overflow: hidden;
      cursor: pointer;
      outline: none;
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
    }
    .pill:focus-visible {
      box-shadow: 0 0 0 2px var(--primary-color);
    }
    .fill {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
    }
    .thumb {
      position: absolute;
      left: 50%;
      width: 36px;
      height: 5px;
      margin-left: -18px;
      border-radius: 3px;
      background: #fff;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15), 0 1px 4px rgba(0, 0, 0, 0.3);
      transform: translateY(50%);
    }
    .fill-mode .thumb {
      transform: translateY(14px);
      background: rgba(255, 255, 255, 0.85);
      box-shadow: none;
    }
  `;

  private _frac() {
    return clamp((this.value - this.min) / (this.max - this.min), 0, 1);
  }

  private _set(e: PointerEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const frac = clamp(1 - (e.clientY - rect.top) / rect.height, 0, 1);
    this.value = Math.round(this.min + frac * (this.max - this.min));
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: this.value } }));
  }

  private _key(e: KeyboardEvent) {
    const step = (this.max - this.min) / 50;
    const delta =
      e.key === "ArrowUp" || e.key === "ArrowRight"
        ? step
        : e.key === "ArrowDown" || e.key === "ArrowLeft"
          ? -step
          : 0;
    if (!delta) return;
    e.preventDefault();
    this.value = Math.round(clamp(this.value + delta, this.min, this.max));
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: this.value } }));
  }

  render() {
    const pct = this._frac() * 100;
    return html`<div
      class="pill ${this.fill ? "fill-mode" : ""}"
      style="background: ${this.track}"
      role="slider"
      tabindex="0"
      aria-label=${this.label}
      aria-valuemin=${this.min}
      aria-valuemax=${this.max}
      aria-valuenow=${this.value}
      @keydown=${this._key}
      @pointerdown=${(e: PointerEvent) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        this._set(e);
      }}
      @pointermove=${(e: PointerEvent) => {
        if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) this._set(e);
      }}
    >
      ${this.fill
        ? html`<div class="fill" style="height: ${pct}%; background: ${this.fill}">
            <div class="thumb" style="top: 0"></div>
          </div>`
        : html`<div class="thumb" style="bottom: ${pct}%"></div>`}
    </div>`;
  }
}

// ---- colour wheel ---------------------------------------------------------

/** Hue/saturation disc (hue clockwise from the top, white at the centre). */
@customElement("homex-color-wheel")
export class HomexColorWheel extends LitElement {
  @property({ attribute: false }) value: Rgb = [255, 0, 0];

  static styles = css`
    :host {
      display: block;
      width: 260px;
      height: 260px;
      touch-action: none;
      user-select: none;
    }
    .wheel {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      cursor: crosshair;
      background: radial-gradient(circle closest-side, #fff, rgba(255, 255, 255, 0)),
        conic-gradient(red, yellow, lime, cyan, blue, magenta, red);
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
    }
    .marker {
      position: absolute;
      width: 30px;
      height: 30px;
      margin: -15px 0 0 -15px;
      border-radius: 50%;
      border: 3px solid #fff;
      box-sizing: border-box;
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.4);
      pointer-events: none;
    }
  `;

  private _set(e: PointerEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const r = rect.width / 2;
    const dx = e.clientX - rect.left - r;
    const dy = e.clientY - rect.top - r;
    const hue = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
    const sat = clamp(Math.hypot(dx, dy) / r, 0, 1);
    this.value = hsToRgb(hue, sat);
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: this.value } }));
  }

  render() {
    const [h, s] = rgbToHs(this.value);
    const a = (h * Math.PI) / 180;
    const x = 50 + 50 * s * Math.sin(a);
    const y = 50 - 50 * s * Math.cos(a);
    return html`<div
      class="wheel"
      @pointerdown=${(e: PointerEvent) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        this._set(e);
      }}
      @pointermove=${(e: PointerEvent) => {
        if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) this._set(e);
      }}
    >
      <div
        class="marker"
        style="left: ${x}%; top: ${y}%; background: ${toHex(hsToRgb(h, s))}"
      ></div>
    </div>`;
  }
}

// ---- the picker -----------------------------------------------------------

/**
 * Per-light starting state of an animation, in the spirit of Home Assistant's
 * scene editor: a compact list of the room's lights (include toggle, colour,
 * brightness); tapping a light opens its sheet — a big vertical brightness
 * slider, a colour wheel or a white-temperature slider (depending on what the
 * light supports) and favourite colours. Fires `value-changed`.
 */
@customElement("homex-light-start-picker")
export class HomexLightStartPicker extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  /** The lights offered (room lights). */
  @property({ attribute: false }) lights: string[] = [];
  @property({ attribute: false }) value: AnimatedLight[] = [];

  @state() private _editing: string | null = null;
  @state() private _view: View = "brightness";

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin: 0 2px 8px;
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .head button {
        min-height: 0;
        padding: 5px 12px;
        font-size: 12px;
        border-radius: 999px;
      }
      .list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 8px;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
        padding: 10px 12px;
        border-radius: 14px;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
        background: var(--card-background-color, #fff);
        transition: border-color 0.15s, background 0.15s;
      }
      .row.on {
        border-color: var(--light-accent);
        background: linear-gradient(
          100deg,
          var(--light-tint) 0%,
          var(--card-background-color, #fff) 70%
        );
      }
      .main {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0;
        min-height: 0;
        background: none;
        text-align: left;
        font: inherit;
        color: inherit;
        border-radius: 10px;
      }
      .main:disabled {
        opacity: 1;
        cursor: default;
      }
      .main:hover {
        filter: none;
      }
      .bulb {
        flex: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
        color: var(--secondary-text-color);
      }
      .on .bulb {
        background: var(--light-color);
        box-shadow: 0 0 16px var(--light-glow);
        color: rgba(0, 0, 0, 0.55);
      }
      .bulb svg,
      .chev svg {
        width: 22px;
        height: 22px;
        fill: currentColor;
      }
      .names {
        flex: 1;
        min-width: 0;
      }
      .name {
        font-size: 15px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .sub {
        font-size: 12px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .chev {
        flex: none;
        color: var(--secondary-text-color);
        display: flex;
      }
      .empty {
        font-size: 13px;
        color: var(--secondary-text-color);
        padding: 8px 2px;
      }

      /* ---- sheet (centred card; bottom sheet on phones) ---- */
      .scrim {
        position: fixed;
        inset: 0;
        z-index: 1100;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        box-sizing: border-box;
      }
      .sheet {
        width: 100%;
        max-width: 440px;
        max-height: 100%;
        overflow: auto;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        border-radius: 24px;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.35);
        padding: 12px 20px 20px;
        box-sizing: border-box;
      }
      .sheet-head {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .sheet-head .title {
        flex: 1;
        min-width: 0;
        font-size: 17px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .icon-btn {
        flex: none;
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        min-width: 0;
        min-height: 0;
        padding: 0;
        border-radius: 50%;
        background: transparent;
        color: var(--secondary-text-color);
      }
      .icon-btn svg {
        width: 22px;
        height: 22px;
        fill: currentColor;
      }
      .big {
        text-align: center;
        margin: 6px 0 14px;
      }
      .big .pct {
        font-size: 40px;
        font-weight: 400;
        line-height: 1.1;
      }
      .big .what {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .control {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 300px;
      }
      .views {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin: 18px 0 6px;
      }
      .views button {
        display: grid;
        place-items: center;
        width: 52px;
        height: 52px;
        min-width: 0;
        min-height: 0;
        padding: 0;
        border-radius: 16px;
      }
      .views button.active {
        background: var(--light-soft);
        color: var(--primary-text-color);
        box-shadow: inset 0 0 0 2px var(--light-accent);
      }
      .views svg {
        width: 24px;
        height: 24px;
        fill: currentColor;
      }
      .favs {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        margin: 14px 0 4px;
      }
      .fav {
        width: 40px;
        height: 40px;
        min-width: 0;
        min-height: 0;
        padding: 0;
        border-radius: 50%;
        border: 3px solid transparent;
        box-sizing: border-box;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
      }
      .fav.sel {
        border-color: var(--primary-text-color);
      }
      .copy {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        margin-top: 16px;
      }
      .copy svg {
        width: 18px;
        height: 18px;
        fill: currentColor;
      }
      @media (max-width: 600px) {
        .list {
          grid-template-columns: 1fr;
        }
        .scrim {
          align-items: flex-end;
          padding: 0;
        }
        .sheet {
          max-width: none;
          max-height: 92vh;
          border-radius: 24px 24px 0 0;
          padding: 8px 16px calc(16px + env(safe-area-inset-bottom));
        }
        .big .pct {
          font-size: 34px;
        }
        .control {
          min-height: 250px;
        }
        homex-pill-slider {
          height: 250px;
          width: 100px;
        }
        homex-color-wheel {
          width: 230px;
          height: 230px;
        }
      }
      @media (max-height: 640px) {
        .control {
          min-height: 200px;
        }
        homex-pill-slider {
          height: 200px;
        }
        homex-color-wheel {
          width: 200px;
          height: 200px;
        }
      }
    `,
  ];

  // ---- data ---------------------------------------------------------------

  private _caps(id: string): Caps {
    const modes: string[] = this.hass.states[id]?.attributes?.supported_color_modes ?? [];
    if (modes.some((m) => COLOR_MODES.includes(m))) return "color";
    if (modes.includes("color_temp")) return "white";
    return "dim";
  }

  private _name(id: string): string {
    return this.hass.states[id]?.attributes?.friendly_name ?? id;
  }

  private _emit(value: AnimatedLight[]) {
    this.value = value;
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value } }));
  }

  /** A newly included light: the last edited light's settings, else a warm white. */
  private _fresh(id: string, from: AnimatedLight[] = this.value): AnimatedLight {
    const ref = from[from.length - 1];
    if (ref) {
      const next: AnimatedLight = { ...ref, entity_id: id, color: [...ref.color] as Rgb };
      if (this._caps(id) === "color" || ref.kelvin) return next;
      // A white-only light can't take a colour: keep its brightness, warm white.
      return { entity_id: id, brightness: ref.brightness, kelvin: 2700, color: kelvinToRgb(2700) };
    }
    return this._caps(id) === "dim"
      ? { entity_id: id, color: [...DEFAULT_LIGHT_COLOR] as Rgb, brightness: 100 }
      : { entity_id: id, color: kelvinToRgb(2700), brightness: 100, kelvin: 2700 };
  }

  private _toggle(id: string, on: boolean) {
    const rest = this.value.filter((l) => l.entity_id !== id);
    this._emit(on ? [...rest, this._fresh(id)] : rest);
  }

  private _patch(id: string, patch: Partial<AnimatedLight>) {
    this._emit(
      this.value.map((l) => {
        if (l.entity_id !== id) return l;
        const next = { ...l, ...patch };
        if ("kelvin" in patch && patch.kelvin === undefined) delete next.kelvin;
        return next;
      })
    );
  }

  private _setAll(on: boolean) {
    if (!on) return this._emit([]);
    const value = [...this.value];
    for (const id of this.lights) {
      if (!value.some((l) => l.entity_id === id)) value.push(this._fresh(id, value));
    }
    this._emit(value);
  }

  private _copyToAll(src: AnimatedLight) {
    this._emit(
      this.value.map((l) => {
        if (l.entity_id === src.entity_id) return l;
        const caps = this._caps(l.entity_id);
        // Colours only go to colour lights; white-only lights keep their white.
        if (!src.kelvin && caps !== "color") return { ...l, brightness: src.brightness };
        const next: AnimatedLight = { ...l, color: [...src.color] as Rgb, brightness: src.brightness };
        if (src.kelvin) next.kelvin = src.kelvin;
        else delete next.kelvin;
        return next;
      })
    );
  }

  private _summary(l: AnimatedLight): string {
    const caps = this._caps(l.entity_id);
    const tone = caps === "dim" ? "" : l.kelvin ? `${l.kelvin} K` : t("lightStart.colored");
    return [tone, `${l.brightness} %`].filter(Boolean).join(" · ");
  }

  private _vars(color: number[], level: number): string {
    return [
      `--light-color: ${toHex(color)}`,
      `--light-accent: ${rgba(color, 0.9)}`,
      `--light-soft: ${rgba(color, 0.18)}`,
      `--light-tint: ${rgba(color, 0.1 + 0.18 * level)}`,
      `--light-glow: ${rgba(color, 0.25 + 0.55 * level)}`,
    ].join(";");
  }

  // ---- list ---------------------------------------------------------------

  render() {
    const chosen = this.value.map((l) => l.entity_id);
    // Keep chosen lights even if no longer in the room (so they can be removed).
    const all = [...this.lights, ...chosen.filter((id) => !this.lights.includes(id))];
    if (!all.length) return html`<div class="empty">${t("lightStart.no_lights")}</div>`;
    const allOn = all.every((id) => chosen.includes(id));
    return html`
      <div class="head">
        <span>${t("lightStart.count", { n: chosen.length, total: all.length })}</span>
        <button @click=${() => this._setAll(!allOn)}>
          ${allOn ? t("lightStart.none") : t("lightStart.all")}
        </button>
      </div>
      <div class="list">${all.map((id) => this._row(id))}</div>
      ${this._editing ? this._sheet() : nothing}
    `;
  }

  private _row(id: string) {
    const light = this.value.find((l) => l.entity_id === id);
    const color = light?.color ?? DEFAULT_LIGHT_COLOR;
    return html`
      <div
        class="row ${light ? "on" : ""}"
        style=${this._vars(color, (light?.brightness ?? 100) / 100)}
      >
        <button
          class="main"
          ?disabled=${!light}
          title=${light ? t("lightStart.adjust") : ""}
          @click=${() => {
            this._view = "brightness";
            this._editing = id;
          }}
        >
          <span class="bulb">
            <svg viewBox="0 0 24 24"><path d=${light ? mdiLightbulb : mdiLightbulbOff}></path></svg>
          </span>
          <span class="names">
            <div class="name">${this._name(id)}</div>
            <div class="sub">${light ? this._summary(light) : t("lightStart.not_animated")}</div>
          </span>
          ${light
            ? html`<span class="chev"><svg viewBox="0 0 24 24"><path d=${mdiChevronRight}></path></svg></span>`
            : nothing}
        </button>
        ${toggleSwitch(!!light, (v) => this._toggle(id, v))}
      </div>
    `;
  }

  // ---- sheet --------------------------------------------------------------

  private _close() {
    this._editing = null;
  }

  private _sheet() {
    const light = this.value.find((l) => l.entity_id === this._editing);
    if (!light) return nothing;
    const id = light.entity_id;
    const caps = this._caps(id);
    const view: View =
      (this._view === "color" && caps !== "color") || (this._view === "temp" && caps === "dim")
        ? "brightness"
        : this._view;
    const kelvin = light.kelvin ?? 2700;
    return html`
      <div
        class="scrim"
        @click=${(e: Event) => {
          if (e.target === e.currentTarget) this._close();
        }}
        @keydown=${(e: KeyboardEvent) => e.key === "Escape" && this._close()}
      >
        <div
          class="sheet"
          role="dialog"
          aria-label=${this._name(id)}
          style=${this._vars(light.color, light.brightness / 100)}
        >
          <div class="sheet-head">
            <span class="title">${this._name(id)}</span>
            <button class="icon-btn" title=${t("common.close")} @click=${this._close}>
              <svg viewBox="0 0 24 24"><path d=${mdiClose}></path></svg>
            </button>
          </div>
          <div class="big">
            ${view === "temp"
              ? html`<div class="pct">${kelvin} K</div>
                  <div class="what">${t("lightStart.temperature")}</div>`
              : view === "color"
                ? html`<div class="pct">${toHex(light.color).toUpperCase()}</div>
                    <div class="what">${t("lightStart.color")}</div>`
                : html`<div class="pct">${light.brightness} %</div>
                    <div class="what">${t("lightStart.brightness")}</div>`}
          </div>
          <div class="control">
            ${view === "brightness"
              ? html`<homex-pill-slider
                  min="1"
                  max="100"
                  .value=${light.brightness}
                  .fill=${toHex(light.color)}
                  label=${t("lightStart.brightness")}
                  @value-changed=${(e: CustomEvent) => this._patch(id, { brightness: e.detail.value })}
                ></homex-pill-slider>`
              : view === "temp"
                ? html`<homex-pill-slider
                    .min=${MIN_K}
                    .max=${MAX_K}
                    .value=${kelvin}
                    track="linear-gradient(to top, ${toHex(kelvinToRgb(MIN_K))}, ${toHex(kelvinToRgb(4000))}, ${toHex(kelvinToRgb(MAX_K))})"
                    label=${t("lightStart.temperature")}
                    @value-changed=${(e: CustomEvent) => {
                      const k = Math.round(e.detail.value / 50) * 50;
                      this._patch(id, { kelvin: k, color: kelvinToRgb(k) });
                    }}
                  ></homex-pill-slider>`
                : html`<homex-color-wheel
                    .value=${light.color}
                    @value-changed=${(e: CustomEvent) =>
                      this._patch(id, { color: e.detail.value, kelvin: undefined })}
                  ></homex-color-wheel>`}
          </div>
          ${caps !== "dim"
            ? html`<div class="views">
                ${this._viewBtn(view, "brightness", mdiBrightness6, t("lightStart.brightness"))}
                ${caps === "color"
                  ? this._viewBtn(view, "color", mdiPalette, t("lightStart.color"))
                  : nothing}
                ${this._viewBtn(view, "temp", mdiThermometer, t("lightStart.temperature"))}
              </div>
              ${this._favs(light, caps)}`
            : html`<div class="big"><div class="what">${t("lightStart.dim_only")}</div></div>`}
          ${this.value.length > 1
            ? html`<button class="copy" @click=${() => this._copyToAll(light)}>
                <svg viewBox="0 0 24 24"><path d=${mdiContentCopy}></path></svg>
                ${t("lightStart.copy_all")}
              </button>`
            : nothing}
        </div>
      </div>
    `;
  }

  private _viewBtn(current: View, view: View, icon: string, label: string) {
    return html`<button
      class=${current === view ? "active" : ""}
      title=${label}
      aria-label=${label}
      @click=${() => (this._view = view)}
    >
      <svg viewBox="0 0 24 24"><path d=${icon}></path></svg>
    </button>`;
  }

  private _favs(light: AnimatedLight, caps: Caps) {
    const id = light.entity_id;
    return html`<div class="favs">
      ${WHITE_FAVS.map((k) => {
        const rgb = kelvinToRgb(k);
        return html`<button
          class="fav ${light.kelvin === k ? "sel" : ""}"
          style="background: ${toHex(rgb)}"
          title="${k} K"
          @click=${() => this._patch(id, { kelvin: k, color: rgb })}
        ></button>`;
      })}
      ${caps === "color"
        ? COLOR_FAVS.map(
            (rgb) => html`<button
              class="fav ${!light.kelvin && toHex(rgb) === toHex(light.color) ? "sel" : ""}"
              style="background: ${toHex(rgb)}"
              title=${toHex(rgb).toUpperCase()}
              @click=${() => this._patch(id, { color: [...rgb] as Rgb, kelvin: undefined })}
            ></button>`
          )
        : nothing}
    </div>`;
  }
}
