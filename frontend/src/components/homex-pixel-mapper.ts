import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { mdiPause, mdiPlay } from "@mdi/js";
import type { HomeAssistant, PixelSample, PixelZone } from "../types";
import { sharedStyles } from "../lib/styles";
import { toggleSwitch } from "../lib/fields";
import { t } from "../lib/i18n";

// ---- sampling (shared with the dialog) --------------------------------------

/** Width of the canvas the video is scaled down to before averaging. */
const SAMPLE_W = 96;

/** Average colour of each zone on the frame drawn in `ctx`, as a light
 * sample: colour at full value + brightness (the brightest channel). */
function zoneSamples(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  zones: Record<string, PixelZone>
): Record<string, PixelSample> {
  const data = ctx.getImageData(0, 0, w, h).data;
  const out: Record<string, PixelSample> = {};
  for (const [id, [zx, zy, zw, zh]] of Object.entries(zones)) {
    const x0 = Math.floor(zx * w);
    const y0 = Math.floor(zy * h);
    const x1 = Math.max(x0 + 1, Math.min(w, Math.ceil((zx + zw) * w)));
    const y1 = Math.max(y0 + 1, Math.min(h, Math.ceil((zy + zh) * h)));
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * w + x) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        n++;
      }
    }
    if (!n) n = 1;
    r /= n;
    g /= n;
    b /= n;
    const v = Math.max(r, g, b);
    out[id] = v
      ? [Math.round((r * 255) / v), Math.round((g * 255) / v), Math.round((b * 255) / v), Math.round(v)]
      : [0, 0, 0, 0];
  }
  return out;
}

function canvasFor(video: HTMLVideoElement) {
  const w = SAMPLE_W;
  const h = Math.max(1, Math.round((SAMPLE_W * (video.videoHeight || 9)) / (video.videoWidth || 16)));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  return { ctx, w, h };
}

/** Most samples an animation may hold (keeps the saved frames small). */
export const MAX_SAMPLES = 6000;

/**
 * Samples a video of `duration` seconds gives at `interval`: one at 0,
 * interval, 2×interval… while still inside the video. Each sample is shown for
 * `interval` seconds, so the animation lasts `count × interval` — the video's
 * length (rounded up to the next whole interval).
 */
export const sampleCount = (duration: number, interval: number) =>
  duration > 0 && interval > 0 ? Math.max(1, Math.ceil(duration / interval - 1e-6)) : 0;

/** Seek and wait for the frame (with a safety timeout: some browsers don't
 * fire `seeked` when the position doesn't change). */
function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      video.removeEventListener("seeked", done);
      resolve();
    };
    const timer = setTimeout(done, 3000);
    video.addEventListener("seeked", done);
    video.currentTime = time;
  });
}

/**
 * The real duration of a video. Some files (often WebM from a recorder)
 * report an infinite duration until the end has been reached: seek far to make
 * the browser find it, then come back.
 */
export async function videoDuration(video: HTMLVideoElement): Promise<number> {
  if (Number.isFinite(video.duration) && video.duration > 0) return video.duration;
  const back = video.currentTime;
  await seekTo(video, 1e7);
  const duration = Number.isFinite(video.duration) ? video.duration : video.currentTime;
  await seekTo(video, back);
  return duration > 0 ? duration : 0;
}

/**
 * Sample the video every `interval` seconds: one sample per zone per step.
 * Runs on a separate (hidden) video element so the preview isn't disturbed.
 */
export async function sampleVideo(
  url: string,
  zones: Record<string, PixelZone>,
  interval: number,
  onProgress?: (fraction: number) => void
): Promise<Record<string, PixelSample[]>> {
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;
  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error(t("pixel.unreadable")));
  });
  const duration = await videoDuration(video);
  const count = Math.min(MAX_SAMPLES, sampleCount(duration, interval));
  const { ctx, w, h } = canvasFor(video);
  const frames: Record<string, PixelSample[]> = {};
  for (const id of Object.keys(zones)) frames[id] = [];
  for (let i = 0; i < count; i++) {
    await seekTo(video, Math.min(i * interval, Math.max(0, duration - 0.01)));
    ctx.drawImage(video, 0, 0, w, h);
    const samples = zoneSamples(ctx, w, h, zones);
    for (const id of Object.keys(zones)) frames[id].push(samples[id]);
    onProgress?.((i + 1) / count);
  }
  video.removeAttribute("src");
  video.load();
  return frames;
}

// ---- the mapper ---------------------------------------------------------------

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const MIN_SIZE = 0.03;
const PALETTE = ["#03a9f4", "#ff9800", "#e91e63", "#4caf50", "#9c27b0", "#ffc107", "#00bcd4", "#f44336"];

type Drag = {
  id: string;
  kind: "move" | "resize" | "draw";
  x: number;
  y: number;
  start: PixelZone;
};

/**
 * Map each light on a zone of a video. The video plays (or is scrubbed) under
 * the zones; each light shows the colour it would take at the current time.
 * Select a light, then drag on the video to draw its zone; drag a zone to move
 * it, its corner to resize it. Fires `value-changed` with the zones.
 */
@customElement("homex-pixel-mapper")
export class HomexPixelMapper extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) lights: string[] = [];
  @property() src = "";
  @property({ attribute: false }) value: Record<string, PixelZone> = {};

  @state() private _selected = "";
  @state() private _time = 0;
  @state() private _duration = 0;
  @state() private _playing = false;
  @state() private _ratio = 16 / 9;
  @state() private _live: Record<string, PixelSample> = {};

  @query("video") private _video!: HTMLVideoElement;
  @query(".overlay") private _overlay!: HTMLElement;

  private _drag: Drag | null = null;
  private _canvas: ReturnType<typeof canvasFor> | null = null;
  private _raf = 0;

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .stage {
        position: relative;
        width: 100%;
        max-width: calc(52vh * var(--ratio));
        aspect-ratio: var(--ratio);
        margin: 0 auto;
        background: #000;
        border-radius: 12px;
        overflow: hidden;
        touch-action: none;
        user-select: none;
      }
      video {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: fill;
      }
      .overlay {
        position: absolute;
        inset: 0;
        cursor: crosshair;
      }
      .zone {
        position: absolute;
        box-sizing: border-box;
        border: 2px solid var(--c);
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.06);
        cursor: move;
      }
      .zone.sel {
        border-width: 3px;
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.45), 0 0 14px var(--c);
        z-index: 2;
      }
      .zone .tag {
        position: absolute;
        left: -2px;
        top: -2px;
        max-width: calc(100% + 4px);
        padding: 1px 6px;
        border-radius: 6px 0 6px 0;
        background: var(--c);
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }
      .zone .grip {
        position: absolute;
        right: -7px;
        bottom: -7px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #fff;
        border: 3px solid var(--c);
        box-sizing: border-box;
        cursor: nwse-resize;
      }
      .transport {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 10px 0 4px;
      }
      .transport button {
        flex: none;
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        min-height: 0;
        padding: 0;
        border-radius: 50%;
      }
      .transport svg {
        width: 22px;
        height: 22px;
        fill: currentColor;
      }
      .transport input {
        flex: 1;
        min-width: 0;
      }
      .transport .time {
        flex: none;
        font-size: 12px;
        font-variant-numeric: tabular-nums;
        color: var(--secondary-text-color);
      }
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 6px 0 8px;
      }
      .list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
        gap: 8px;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        padding: 8px 10px;
        border-radius: 12px;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
        cursor: pointer;
      }
      .row.sel {
        border-color: var(--c);
        box-shadow: inset 0 0 0 1px var(--c);
      }
      .row.off {
        cursor: default;
      }
      .dot {
        flex: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--c);
      }
      .row.off .dot {
        background: var(--divider-color, #ccc);
      }
      .live {
        flex: none;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
      }
      .name {
        flex: 1;
        min-width: 0;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .name small {
        display: block;
        font-size: 11px;
        color: var(--secondary-text-color);
      }
      @media (max-width: 600px) {
        .list {
          grid-template-columns: 1fr;
        }
        .stage {
          max-width: 100%;
        }
      }
    `,
  ];

  disconnectedCallback() {
    super.disconnectedCallback();
    cancelAnimationFrame(this._raf);
  }

  private _color(id: string): string {
    const index = this.lights.indexOf(id);
    return PALETTE[(index < 0 ? this.lights.length : index) % PALETTE.length];
  }

  private _name(id: string): string {
    return this.hass.states[id]?.attributes?.friendly_name ?? id;
  }

  private _emit(value: Record<string, PixelZone>) {
    this.value = value;
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value } }));
    this._sampleNow();
  }

  // ---- video ------------------------------------------------------------------

  private async _onLoaded() {
    const v = this._video;
    this._duration = await videoDuration(v);
    if (v.videoWidth && v.videoHeight) this._ratio = v.videoWidth / v.videoHeight;
    this._canvas = canvasFor(v);
    this.dispatchEvent(
      new CustomEvent("video-info", { detail: { duration: this._duration, ratio: this._ratio } })
    );
    this._sampleNow();
  }

  /** Colours of every zone at the current frame (live preview). */
  private _sampleNow() {
    const v = this._video;
    if (!v || !this._canvas || v.readyState < 2) return;
    const { ctx, w, h } = this._canvas;
    try {
      ctx.drawImage(v, 0, 0, w, h);
      this._live = zoneSamples(ctx, w, h, this.value);
    } catch {
      /* frame not ready */
    }
  }

  private _loop = () => {
    this._time = this._video.currentTime;
    this._sampleNow();
    if (this._playing) this._raf = requestAnimationFrame(this._loop);
  };

  private _togglePlay() {
    const v = this._video;
    if (v.paused) {
      v.play();
      this._playing = true;
      this._raf = requestAnimationFrame(this._loop);
    } else {
      v.pause();
      this._playing = false;
    }
  }

  private _seek(time: number) {
    this._video.currentTime = time;
    this._time = time;
  }

  // ---- zones ------------------------------------------------------------------

  private _point(e: PointerEvent): [number, number] {
    const r = this._overlay.getBoundingClientRect();
    return [clamp((e.clientX - r.left) / r.width, 0, 1), clamp((e.clientY - r.top) / r.height, 0, 1)];
  }

  private _defaultZone(): PixelZone {
    // Spread new zones over the frame instead of stacking them.
    const n = Object.keys(this.value).length;
    const cols = 3;
    return [0.06 + (n % cols) * 0.31, 0.1 + (Math.floor(n / cols) % 3) * 0.28, 0.26, 0.24];
  }

  private _setMapped(id: string, on: boolean) {
    const next = { ...this.value };
    if (on) {
      next[id] = this._defaultZone();
      this._selected = id;
    } else {
      delete next[id];
      if (this._selected === id) this._selected = "";
    }
    this._emit(next);
  }

  private _down(e: PointerEvent, id: string | null, kind: Drag["kind"]) {
    e.stopPropagation();
    const target = id ?? this._selected;
    if (!target) return;
    this._overlay.setPointerCapture(e.pointerId);
    const [x, y] = this._point(e);
    this._selected = target;
    this._drag = { id: target, kind, x, y, start: this.value[target] ?? [x, y, 0, 0] };
    if (kind === "draw") this.value = { ...this.value, [target]: [x, y, MIN_SIZE, MIN_SIZE] };
  }

  private _move(e: PointerEvent) {
    const d = this._drag;
    if (!d) return;
    const [x, y] = this._point(e);
    const [sx, sy, sw, sh] = d.start;
    let zone: PixelZone;
    if (d.kind === "move") {
      zone = [clamp(sx + x - d.x, 0, 1 - sw), clamp(sy + y - d.y, 0, 1 - sh), sw, sh];
    } else if (d.kind === "resize") {
      zone = [sx, sy, clamp(x - sx, MIN_SIZE, 1 - sx), clamp(y - sy, MIN_SIZE, 1 - sy)];
    } else {
      const x0 = Math.min(d.x, x);
      const y0 = Math.min(d.y, y);
      zone = [x0, y0, Math.max(MIN_SIZE, Math.abs(x - d.x)), Math.max(MIN_SIZE, Math.abs(y - d.y))];
    }
    this.value = { ...this.value, [d.id]: zone.map((v) => Math.round(v * 1000) / 1000) as PixelZone };
    this._sampleNow();
  }

  private _up() {
    if (!this._drag) return;
    this._drag = null;
    this._emit({ ...this.value });
  }

  // ---- render -----------------------------------------------------------------

  render() {
    const fmt = (s: number) =>
      `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    return html`
      <div class="stage" style="--ratio: ${this._ratio}">
        <video
          .src=${this.src}
          muted
          playsinline
          loop
          preload="auto"
          @loadeddata=${this._onLoaded}
          @seeked=${() => this._sampleNow()}
          @pause=${() => (this._playing = false)}
        ></video>
        <div
          class="overlay"
          @pointerdown=${(e: PointerEvent) => this._down(e, null, "draw")}
          @pointermove=${this._move}
          @pointerup=${this._up}
          @pointercancel=${this._up}
        >
          ${Object.entries(this.value).map(([id, [x, y, w, h]]) => {
            const c = this._color(id);
            return html`<div
              class="zone ${this._selected === id ? "sel" : ""}"
              style="--c: ${c}; left: ${x * 100}%; top: ${y * 100}%; width: ${w * 100}%; height: ${h * 100}%"
              @pointerdown=${(e: PointerEvent) => this._down(e, id, "move")}
            >
              <span class="tag">${this._name(id)}</span>
              <span
                class="grip"
                @pointerdown=${(e: PointerEvent) => this._down(e, id, "resize")}
              ></span>
            </div>`;
          })}
        </div>
      </div>
      <div class="transport">
        <button
          title=${this._playing ? t("pixel.pause") : t("pixel.play")}
          aria-label=${this._playing ? t("pixel.pause") : t("pixel.play")}
          @click=${this._togglePlay}
        >
          <svg viewBox="0 0 24 24"><path d=${this._playing ? mdiPause : mdiPlay}></path></svg>
        </button>
        <input
          type="range"
          min="0"
          max=${this._duration || 0}
          step="0.01"
          .value=${String(this._time)}
          @input=${(e: Event) => this._seek(Number((e.target as HTMLInputElement).value))}
        />
        <span class="time">${fmt(this._time)} / ${fmt(this._duration)}</span>
      </div>
      <div class="hint">${t("pixel.map_hint")}</div>
      <div class="list">${this.lights.map((id) => this._row(id))}</div>
    `;
  }

  private _row(id: string) {
    const mapped = !!this.value[id];
    const live = this._live[id];
    const swatch = live
      ? live[3] < 3
        ? "#000"
        : `rgb(${live.slice(0, 3).map((v) => Math.round((v * live[3]) / 255)).join(",")})`
      : "transparent";
    return html`<div
      class="row ${mapped ? "" : "off"} ${this._selected === id ? "sel" : ""}"
      style="--c: ${this._color(id)}"
      @click=${(e: Event) => {
        if ((e.target as HTMLElement).closest(".toggle")) return;
        if (mapped) this._selected = id;
      }}
    >
      <span class="dot"></span>
      <span class="name"
        >${this._name(id)}
        <small>${mapped ? (live ? `${Math.round((live[3] / 255) * 100)} %` : "") : t("pixel.not_mapped")}</small>
      </span>
      ${mapped ? html`<span class="live" style="background: ${swatch}"></span>` : nothing}
      ${toggleSwitch(mapped, (v) => this._setMapped(id, v))}
    </div>`;
  }
}
