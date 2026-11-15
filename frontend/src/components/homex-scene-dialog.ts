import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  HomeAssistant,
  Room,
  Scene,
  SceneAnimation,
  SceneKind,
  TriggerSpec,
} from "../types";
import { fireChanged } from "../types";
import {
  addScene,
  errorMessage,
  fetchPixelVideo,
  renameScene,
  uploadPixelVideo,
} from "../api";
import { sharedStyles } from "../lib/styles";
import { t } from "../lib/i18n";
import "./homex-select";
import { textField } from "../lib/fields";
import { slugify } from "../lib/slug";
import "./homex-dialog";
import "./homex-trigger-selector";
import "./homex-managed-triggers";
import "./homex-light-start-picker";
import { DEFAULT_LIGHT_COLOR } from "./homex-light-start-picker";
import "./homex-pixel-mapper";
import { MAX_SAMPLES, sampleCount, sampleVideo } from "./homex-pixel-mapper";

type Mode = "new" | "attach";

const DEFAULT_DURATION = 600; // 10 min
const DURATION_PRESETS = [5, 10, 15, 30, 60]; // minutes
const INTERVAL_PRESETS = [0.1, 0.5, 1, 2, 5]; // seconds between two video samples
const FPS_PRESETS = [0.5, 1, 2, 5, 10]; // samples played per second on the lights
const MAX_FPS = 10;
const MAX_VIDEO_MB = 200;

interface SceneOption {
  config_id: string;
  name: string;
}

/** Modal to add a room scene (new or by adopting an existing one) or rename.
 * A scene is "normal" (a plain HA scene) or "dynamic" (animated by Homex). */
@customElement("homex-scene-dialog")
export class HomexSceneDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) room!: Room;
  @property({ attribute: false }) scene: Scene | null = null;

  @state() private _name = "";
  @state() private _mode: Mode = "new";
  @state() private _attachId = "";
  @state() private _triggers: TriggerSpec[] = [];
  @state() private _kind: SceneKind = "normal";
  @state() private _anim: SceneAnimation = { mode: "fade_out", lights: [], duration: DEFAULT_DURATION };
  @state() private _busy = false;
  // ---- animated pixel ----
  @state() private _videoUrl = ""; // object URL of the video shown/sampled
  @state() private _videoFile: File | null = null; // picked, not uploaded yet
  @state() private _videoDuration = 0;
  @state() private _videoError = "";
  @state() private _pixelDirty = false; // zones/interval/video changed → resample
  @state() private _progress: number | null = null; // sampling progress 0-1

  static styles = [
    sharedStyles,
    css`
      .modes {
        display: flex;
        gap: 8px;
        margin: 8px 0;
      }
      .modes button {
        flex: 1;
      }
      .modes button.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .video-pick {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }
      .file-btn {
        position: relative;
        display: inline-flex;
        align-items: center;
        padding: 10px 18px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        cursor: pointer;
      }
      .file-btn input {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
      }
      .video-name {
        min-width: 0;
        font-size: 13px;
        color: var(--secondary-text-color);
        overflow-wrap: anywhere;
      }
      .summary {
        font-size: 13px;
        margin: 8px 0 4px;
      }
      .summary .speed {
        display: inline-block;
        margin-left: 4px;
        padding: 1px 8px;
        border-radius: 999px;
        font-size: 12px;
        background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
        color: var(--secondary-text-color);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        margin: 6px 0 4px;
      }
      .chips button {
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 13px;
      }
      .chips button.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .chips .custom {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-left: 4px;
      }
      .chips input[type="number"] {
        width: 70px;
        padding: 6px 8px;
        font-size: 14px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 4px 0 8px;
      }
      .err {
        color: var(--error-color, #db4437);
        font-size: 12px;
        margin: -4px 0 8px;
      }
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("open") && this.open) {
      this._name = this.scene?.name ?? "";
      this._mode = "new";
      this._attachId = "";
      this._triggers = (this.scene?.triggers ?? []).map((t) => ({ ...t }));
      this._kind = this.scene?.kind ?? "normal";
      const anim = this.scene?.animation;
      this._anim = anim
        ? {
            ...anim,
            lights: anim.lights.map((l) => ({ ...l, color: [...l.color] as [number, number, number] })),
          }
        : {
            mode: "fade_out",
            duration: DEFAULT_DURATION,
            // Warm white at full brightness (a white temperature where the
            // light has one; brightness-only lights just dim).
            lights: this._roomLights().map((entity_id) => {
              const modes: string[] =
                this.hass.states[entity_id]?.attributes?.supported_color_modes ?? [];
              const dimOnly = modes.every((m) => m === "brightness" || m === "onoff");
              return {
                entity_id,
                color: [...DEFAULT_LIGHT_COLOR] as [number, number, number],
                brightness: 100,
                ...(dimOnly ? {} : { kelvin: 2700 }),
              };
            }),
          };
      this._busy = false;
      this._resetVideo();
      if (anim?.mode === "pixel" && anim.video_id) this._loadVideo(anim.video_id);
    }
    if (changed.has("open") && !this.open) this._resetVideo();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._resetVideo();
  }

  private _resetVideo() {
    if (this._videoUrl) URL.revokeObjectURL(this._videoUrl);
    this._videoUrl = "";
    this._videoFile = null;
    this._videoDuration = 0;
    this._videoError = "";
    this._pixelDirty = false;
    this._progress = null;
  }

  private async _loadVideo(videoId: string) {
    try {
      this._videoUrl = await fetchPixelVideo(this.hass, videoId);
    } catch (err) {
      this._videoError = t("pixel.video_missing", { message: errorMessage(err) });
    }
  }

  private _pickVideo(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      this._videoError = t("pixel.too_big", { max: MAX_VIDEO_MB });
      return;
    }
    if (this._videoUrl) URL.revokeObjectURL(this._videoUrl);
    this._videoError = "";
    this._videoFile = file;
    this._videoUrl = URL.createObjectURL(file);
    this._pixelDirty = true;
    this._setAnim({ video_name: file.name });
  }

  private get _pixelValid(): boolean {
    const a = this._anim;
    return (
      (!!a.video_id || !!this._videoFile) &&
      !!this._videoUrl &&
      Object.keys(a.zones ?? {}).length > 0 &&
      (!this._videoDuration || sampleCount(this._videoDuration, a.interval ?? 1) <= MAX_SAMPLES)
    );
  }

  /** The pixel animation to save: uploads a new video, resamples if needed. */
  private async _pixelAnimation(): Promise<SceneAnimation> {
    let anim: SceneAnimation = { ...this._anim };
    if (this._videoFile) {
      anim.video_id = await uploadPixelVideo(this.hass, this._videoFile);
      this._videoFile = null;
      this._setAnim({ video_id: anim.video_id });
    }
    if (this._pixelDirty || !anim.frames_id) {
      this._progress = 0;
      const frames = await sampleVideo(
        this._videoUrl,
        anim.zones ?? {},
        anim.interval ?? 1,
        (f) => (this._progress = f)
      );
      const { frames_id, first, frame_count, ...rest } = anim;
      anim = { ...rest, frames };
    }
    return anim;
  }

  // Existing HA scenes that are not already Homex-managed.
  private get _availableScenes(): SceneOption[] {
    return Object.keys(this.hass.states)
      .filter((id) => id.startsWith("scene."))
      .map((id) => {
        const attrs = this.hass.states[id].attributes || {};
        return {
          config_id: attrs.id ? String(attrs.id) : "",
          name: attrs.friendly_name || id,
        };
      })
      .filter((s) => s.config_id && !s.config_id.startsWith("homex_"))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // The room's real lights (Homex's own light groups excluded).
  private _roomLights(): string[] {
    return (this.room?.devices ?? []).filter(
      (e) => e.startsWith("light.") && !e.startsWith("light.homex_")
    );
  }

  private get _dynamic(): boolean {
    return this._kind === "dynamic" && (!!this.scene || this._mode === "new");
  }

  private _setAnim(patch: Partial<SceneAnimation>) {
    this._anim = { ...this._anim, ...patch };
  }

  // The proposed name must not collide with another scene of the room.
  private get _nameTaken(): boolean {
    const name = this._name.trim();
    if (!name) return false;
    const key = slugify(name);
    return this.room.scenes.some((s) => {
      if (this.scene && s.key === this.scene.key) return false; // self (rename)
      return s.name.toLowerCase() === name.toLowerCase() || s.key === key;
    });
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }

  private _onPickScene(configId: string) {
    this._attachId = configId;
    if (!this._name.trim()) {
      const found = this._availableScenes.find((s) => s.config_id === configId);
      if (found) this._name = found.name;
    }
  }

  private async _save() {
    const name = this._name.trim();
    if (!name || this._nameTaken) return;
    if (!this.scene && this._mode === "attach" && !this._attachId) {
      alert(t("sceneDialog.pick_scene_required"));
      return;
    }
    const pixel = this._dynamic && this._anim.mode === "pixel";
    if (pixel ? !this._pixelValid : this._dynamic && !this._anim.lights.length) return;
    this._busy = true;
    try {
      const animation = !this._dynamic
        ? undefined
        : pixel
          ? await this._pixelAnimation()
          : this._anim;
      if (this.scene) {
        await renameScene(
          this.hass, this.room.entry_id, this.scene.key, name, this._triggers, animation
        );
      } else if (this._mode === "attach") {
        await addScene(
          this.hass, this.room.entry_id, name, this._attachId, this._triggers
        );
      } else {
        await addScene(
          this.hass, this.room.entry_id, name, undefined, this._triggers, animation
        );
      }
      fireChanged(this);
      this._close();
    } catch (err) {
      this._busy = false;
      this._progress = null;
      alert(t("common.error", { message: errorMessage(err) }));
    }
  }

  render() {
    const editing = !!this.scene;
    const taken = this._nameTaken;
    const valid =
      !!this._name.trim() &&
      !taken &&
      (!this._dynamic ||
        (this._anim.mode === "pixel" ? this._pixelValid : this._anim.lights.length > 0));
    return html`
      <homex-dialog
        .open=${this.open}
        heading=${editing
          ? this._kind === "dynamic"
            ? t("sceneDialog.heading_edit")
            : t("sceneDialog.heading_rename")
          : t("sceneDialog.heading_new")}
        @dialog-closed=${this._close}
      >
        ${textField(t("sceneDialog.name"), this._name, (v) => (this._name = v), t("sceneDialog.name_placeholder"))}
        ${taken ? html`<div class="err">${t("sceneDialog.name_taken")}</div>` : ""}
        ${editing ? "" : this._renderKindPicker()}
        ${editing || this._kind === "dynamic" ? "" : this._renderModePicker()}
        ${this._dynamic ? this._renderAnimation() : ""}
        <div class="section">${t("sceneDialog.triggers")}</div>
        <homex-trigger-selector
          .hass=${this.hass}
          .value=${this._triggers}
          @value-changed=${(e: CustomEvent) => (this._triggers = e.detail.value)}
        ></homex-trigger-selector>
        ${editing
          ? html`<homex-managed-triggers
              .triggers=${this.room?.switch_triggers?.scenes?.[
                this.scene!.key
              ] ?? []}
            ></homex-managed-triggers>`
          : ""}
        <span slot="actions">
          <button @click=${this._close}>${t("common.cancel")}</button>
          <button class="primary" ?disabled=${this._busy || !valid} @click=${this._save}>
            ${this._progress !== null
              ? t("pixel.sampling", { pct: Math.round(this._progress * 100) })
              : editing
              ? this._kind === "dynamic"
                ? t("common.save")
                : t("common.rename")
              : this._mode === "attach" && this._kind === "normal"
                ? t("sceneDialog.attach")
                : t("sceneDialog.create")}
          </button>
        </span>
      </homex-dialog>
    `;
  }

  private _renderKindPicker() {
    return html`
      <div class="section">${t("sceneDialog.kind")}</div>
      <div class="modes">
        <button
          class=${this._kind === "normal" ? "active" : ""}
          @click=${() => (this._kind = "normal")}
        >
          ${t("sceneDialog.kind_normal")}
        </button>
        <button
          class=${this._kind === "dynamic" ? "active" : ""}
          @click=${() => (this._kind = "dynamic")}
        >
          ${t("sceneDialog.kind_dynamic")}
        </button>
      </div>
    `;
  }

  private _renderAnimation() {
    const a = this._anim;
    return html`
      <div class="hint">${t("sceneDialog.dynamic_hint")}</div>
      <homex-select
        label=${t("sceneDialog.animation")}
        .value=${a.mode}
        .options=${[
          {
            value: "fade_out",
            label: t("sceneDialog.mode_fade_out"),
            secondary: t("sceneDialog.fade_out_hint"),
          },
          {
            value: "fade_in",
            label: t("sceneDialog.mode_fade_in"),
            secondary: t("sceneDialog.fade_in_hint"),
          },
          {
            value: "pixel",
            label: t("pixel.mode"),
            secondary: t("pixel.mode_hint"),
          },
        ]}
        @value-changed=${(e: CustomEvent) => this._setMode(e.detail.value)}
      ></homex-select>
      ${a.mode === "pixel" ? this._renderPixel() : this._renderFade()}
    `;
  }

  private _setMode(mode: SceneAnimation["mode"]) {
    if (mode === "pixel") {
      this._setAnim({
        mode,
        interval: this._anim.interval ?? 1,
        fps: this._anim.fps ?? 1 / (this._anim.interval ?? 1),
        loop: this._anim.loop ?? "repeat",
        zones: this._anim.zones ?? {},
      });
    } else {
      this._setAnim({ mode });
    }
  }

  private _renderPixel() {
    const a = this._anim;
    const interval = a.interval ?? 1;
    const count = this._videoDuration
      ? sampleCount(this._videoDuration, interval)
      : a.frame_count ?? 0;
    // Scene frame rate: by default the video's own pace (one sample per
    // interval = real time); faster speeds the video up, slower slows it down.
    const fps = a.fps ?? 1 / interval;
    const realtime = Math.abs(fps * interval - 1) < 1e-3;
    const speed = fps * interval; // ×speed of the video
    const seconds = count / fps;
    const num = (v: number) => (Math.round(v * 10) / 10).toLocaleString(this.hass.locale?.language);
    const fmt = (total: number) => {
      const s = Math.round(total * 10) / 10;
      if (s < 60) return `${num(s)} s`;
      const m = Math.floor(s / 60);
      const rest = Math.round((s - m * 60) * 10) / 10;
      return rest ? `${m} min ${num(rest)} s` : `${m} min`;
    };
    const loop = a.loop ?? "repeat";
    return html`
      <div class="section">${t("pixel.video")}</div>
      <div class="video-pick">
        <label class="file-btn">
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/ogg"
            @change=${(e: Event) => this._pickVideo((e.target as HTMLInputElement).files?.[0])}
          />
          ${this._videoUrl || a.video_id ? t("pixel.replace_video") : t("pixel.pick_video")}
        </label>
        <span class="video-name">${a.video_name ?? ""}</span>
      </div>
      ${this._videoError ? html`<div class="err">${this._videoError}</div>` : ""}
      ${!this._videoUrl && a.video_id && !this._videoError
        ? html`<div class="hint">${t("pixel.loading_video")}</div>`
        : ""}
      ${this._videoUrl
        ? html`<homex-pixel-mapper
            .hass=${this.hass}
            .lights=${this._roomLights()}
            .src=${this._videoUrl}
            .value=${a.zones ?? {}}
            @video-info=${(e: CustomEvent) => (this._videoDuration = e.detail.duration)}
            @value-changed=${(e: CustomEvent) => {
              this._pixelDirty = true;
              this._setAnim({ zones: e.detail.value });
            }}
          ></homex-pixel-mapper>`
        : ""}

      <div class="section">${t("pixel.sampling_every")}</div>
      <div class="chips">
        ${INTERVAL_PRESETS.map(
          (v) => html`<button
            class=${interval === v ? "active" : ""}
            @click=${() => this._setInterval(v, realtime)}
          >
            ${num(v)} s
          </button>`
        )}
        <span class="custom">
          ${t("sceneDialog.custom_duration")}
          <input
            type="number"
            min="0.1"
            max="60"
            step="0.1"
            .value=${INTERVAL_PRESETS.includes(interval) ? "" : String(interval)}
            placeholder="—"
            @change=${(e: Event) => {
              const v = Number((e.target as HTMLInputElement).value);
              if (v > 0) this._setInterval(Math.round(Math.min(60, Math.max(0.1, v)) * 10) / 10, realtime);
            }}
          />
          s
        </span>
      </div>
      ${count > MAX_SAMPLES
        ? html`<div class="err">${t("pixel.too_many", { count, max: MAX_SAMPLES })}</div>`
        : ""}

      <div class="section">${t("pixel.fps")}</div>
      <div class="chips">
        <button
          class=${realtime ? "active" : ""}
          title=${t("pixel.realtime_hint", { fps: num(1 / interval) })}
          @click=${() => this._setAnim({ fps: Math.min(MAX_FPS, 1 / interval) })}
        >
          ${t("pixel.realtime")}
        </button>
        ${FPS_PRESETS.map(
          (v) => html`<button
            class=${!realtime && Math.abs(fps - v) < 1e-3 ? "active" : ""}
            @click=${() => this._setAnim({ fps: v })}
          >
            ${num(v)} ${t("pixel.fps_unit")}
          </button>`
        )}
        <span class="custom">
          ${t("sceneDialog.custom_duration")}
          <input
            type="number"
            min="0.1"
            max=${MAX_FPS}
            step="0.1"
            .value=${realtime || FPS_PRESETS.some((v) => Math.abs(fps - v) < 1e-3) ? "" : String(Math.round(fps * 100) / 100)}
            placeholder="—"
            @change=${(e: Event) => {
              const v = Number((e.target as HTMLInputElement).value);
              if (v > 0) this._setAnim({ fps: Math.min(MAX_FPS, Math.max(0.1, v)) });
            }}
          />
          ${t("pixel.fps_unit")}
        </span>
      </div>
      ${count
        ? html`<div class="summary">
            ${t("pixel.summary", { count, fps: num(fps), duration: fmt(seconds) })}
            <span class="speed">
              ${realtime
                ? t("pixel.speed_realtime")
                : speed > 1
                  ? t("pixel.speed_fast", { x: num(speed) })
                  : t("pixel.speed_slow", { x: num(speed) })}
            </span>
            ${loop === "reverse"
              ? html` · ${t("pixel.cycle", { duration: fmt(Math.max(1, 2 * count - 2) / fps) })}`
              : ""}
          </div>`
        : ""}
      ${fps > 2 ? html`<div class="hint">${t("pixel.fast_hint")}</div>` : ""}

      <div class="section">${t("pixel.loop")}</div>
      <homex-select
        .value=${loop}
        .options=${[
          { value: "repeat", label: t("pixel.loop_repeat"), secondary: t("pixel.loop_repeat_hint") },
          { value: "reverse", label: t("pixel.loop_reverse"), secondary: t("pixel.loop_reverse_hint") },
          { value: "once", label: t("pixel.loop_once"), secondary: t("pixel.loop_once_hint") },
        ]}
        @value-changed=${(e: CustomEvent) => this._setAnim({ loop: e.detail.value })}
      ></homex-select>
      ${loop === "once"
        ? html`<div class="section">${t("pixel.end_state")}</div>
            <homex-light-start-picker
              .hass=${this.hass}
              .lights=${this._roomLights()}
              .value=${a.lights}
              @value-changed=${(e: CustomEvent) => this._setAnim({ lights: e.detail.value })}
            ></homex-light-start-picker>`
        : ""}
    `;
  }

  /** Sampling interval; a scene playing in real time keeps playing in real time. */
  private _setInterval(interval: number, realtime: boolean) {
    this._pixelDirty = true;
    this._setAnim(realtime ? { interval, fps: Math.min(MAX_FPS, 1 / interval) } : { interval });
  }

  private _renderFade() {
    const a = this._anim;
    const minutes = Math.round((a.duration / 60) * 10) / 10;
    const preset = DURATION_PRESETS.includes(minutes);
    return html`
      <div class="section">
        ${a.mode === "fade_in" ? t("sceneDialog.lights_end") : t("sceneDialog.lights")}
      </div>
      <homex-light-start-picker
        .hass=${this.hass}
        .lights=${this._roomLights()}
        .value=${a.lights}
        @value-changed=${(e: CustomEvent) => this._setAnim({ lights: e.detail.value })}
      ></homex-light-start-picker>
      ${this._roomLights().length && !a.lights.length
        ? html`<div class="err">${t("sceneDialog.pick_lights")}</div>`
        : ""}
      <div class="section">
        ${a.mode === "fade_in" ? t("sceneDialog.duration_in") : t("sceneDialog.duration")}
      </div>
      <div class="chips">
        ${DURATION_PRESETS.map(
          (m) => html`<button
            class=${minutes === m ? "active" : ""}
            @click=${() => this._setAnim({ duration: m * 60 })}
          >
            ${m} ${t("sceneDialog.minutes")}
          </button>`
        )}
        <span class="custom">
          ${t("sceneDialog.custom_duration")}
          <input
            type="number"
            min="0.5"
            max="360"
            step="0.5"
            .value=${preset ? "" : String(minutes)}
            placeholder="—"
            @change=${(e: Event) => {
              const v = Number((e.target as HTMLInputElement).value);
              if (v > 0)
                this._setAnim({ duration: Math.round(Math.min(360, Math.max(0.5, v)) * 60) });
            }}
          />
          ${t("sceneDialog.minutes")}
        </span>
      </div>
    `;
  }

  private _renderModePicker() {
    return html`
      <div class="modes">
        <button
          class=${this._mode === "new" ? "active" : ""}
          @click=${() => (this._mode = "new")}
        >
          ${t("sceneDialog.mode_new")}
        </button>
        <button
          class=${this._mode === "attach" ? "active" : ""}
          @click=${() => (this._mode = "attach")}
        >
          ${t("sceneDialog.mode_attach")}
        </button>
      </div>
      ${this._mode === "new"
        ? html`<div class="section">${t("sceneDialog.new_hint")}</div>`
        : html`
            <div class="section">${t("sceneDialog.attach_hint")}</div>
            <homex-select
              placeholder=${t("sceneDialog.pick_scene")}
              .value=${this._attachId}
              .options=${this._availableScenes.map((s) => ({
                value: s.config_id,
                label: s.name,
                secondary: s.config_id,
              }))}
              @value-changed=${(e: CustomEvent) => this._onPickScene(e.detail.value)}
            ></homex-select>
          `}
    `;
  }
}
