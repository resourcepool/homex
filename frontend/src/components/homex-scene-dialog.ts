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
import { addScene, errorMessage, renameScene } from "../api";
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

type Mode = "new" | "attach";

const DEFAULT_DURATION = 600; // 10 min
const DURATION_PRESETS = [5, 10, 15, 30, 60]; // minutes

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
    }
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
    const animation = this._dynamic ? this._anim : undefined;
    if (animation && !animation.lights.length) return;
    this._busy = true;
    try {
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
      alert(t("common.error", { message: errorMessage(err) }));
    }
  }

  render() {
    const editing = !!this.scene;
    const taken = this._nameTaken;
    const valid =
      !!this._name.trim() && !taken && (!this._dynamic || this._anim.lights.length > 0);
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
            ${editing
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
    const minutes = Math.round((a.duration / 60) * 10) / 10;
    const preset = DURATION_PRESETS.includes(minutes);
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
        ]}
        @value-changed=${(e: CustomEvent) => this._setAnim({ mode: e.detail.value })}
      ></homex-select>
      <div class="section">${t("sceneDialog.lights")}</div>
      <homex-light-start-picker
        .hass=${this.hass}
        .lights=${this._roomLights()}
        .value=${a.lights}
        @value-changed=${(e: CustomEvent) => this._setAnim({ lights: e.detail.value })}
      ></homex-light-start-picker>
      ${this._roomLights().length && !a.lights.length
        ? html`<div class="err">${t("sceneDialog.pick_lights")}</div>`
        : ""}
      <div class="section">${t("sceneDialog.duration")}</div>
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
