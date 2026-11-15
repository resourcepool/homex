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

type Mode = "new" | "attach";

const DEFAULT_ANIMATION: SceneAnimation = {
  mode: "fade_out",
  lights: [],
  color: [255, 180, 107],
  brightness: 100,
  duration: 600,
};

const toHex = (c: number[]) =>
  "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const fromHex = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

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
  @state() private _anim: SceneAnimation = { ...DEFAULT_ANIMATION };
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
      .lights {
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-height: 220px;
        overflow: auto;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        padding: 6px 10px;
      }
      .lights label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        padding: 3px 0;
        cursor: pointer;
      }
      .lights .eid {
        color: var(--secondary-text-color);
        font-size: 11px;
        margin-left: auto;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 10px 0;
        flex-wrap: wrap;
      }
      .row > span {
        font-size: 13px;
        color: var(--secondary-text-color);
        min-width: 130px;
      }
      .row input[type="range"] {
        flex: 1;
        min-width: 120px;
      }
      .row input[type="color"] {
        width: 52px;
        height: 34px;
        padding: 0;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 6px;
        background: none;
        cursor: pointer;
      }
      .row input[type="number"] {
        width: 80px;
        padding: 8px;
        font-size: 15px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      .row select {
        padding: 8px;
        font-size: 15px;
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
        ? { ...anim, lights: [...anim.lights], color: [...anim.color] as [number, number, number] }
        : { ...DEFAULT_ANIMATION, lights: this._roomLights() };
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

  private _toggleLight(entityId: string, on: boolean) {
    const lights = this._anim.lights.filter((e) => e !== entityId);
    if (on) lights.push(entityId);
    this._setAnim({ lights });
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
    const lights = this._roomLights();
    // Keep lights already chosen even if no longer in the room (to untick).
    const all = [...lights, ...a.lights.filter((e) => !lights.includes(e))];
    const minutes = Math.round((a.duration / 60) * 10) / 10;
    return html`
      <div class="hint">${t("sceneDialog.dynamic_hint")}</div>
      <div class="row">
        <span>${t("sceneDialog.animation")}</span>
        <select
          .value=${a.mode}
          @change=${(e: Event) =>
            this._setAnim({ mode: (e.target as HTMLSelectElement).value as SceneAnimation["mode"] })}
        >
          <option value="fade_out">${t("sceneDialog.mode_fade_out")}</option>
        </select>
      </div>
      <div class="hint">${t("sceneDialog.fade_out_hint")}</div>
      <div class="section">${t("sceneDialog.lights")}</div>
      ${all.length
        ? html`<div class="lights">
            ${all.map(
              (id) => html`<label>
                <input
                  type="checkbox"
                  .checked=${a.lights.includes(id)}
                  @change=${(e: Event) =>
                    this._toggleLight(id, (e.target as HTMLInputElement).checked)}
                />
                ${this.hass.states[id]?.attributes?.friendly_name ?? id}
                <span class="eid">${id}</span>
              </label>`
            )}
          </div>`
        : html`<div class="err">${t("sceneDialog.no_lights")}</div>`}
      ${all.length && !a.lights.length
        ? html`<div class="err">${t("sceneDialog.pick_lights")}</div>`
        : ""}
      <div class="row">
        <span>${t("sceneDialog.start_color")}</span>
        <input
          type="color"
          .value=${toHex(a.color)}
          @input=${(e: Event) =>
            this._setAnim({ color: fromHex((e.target as HTMLInputElement).value) })}
        />
      </div>
      <div class="row">
        <span>${t("sceneDialog.start_brightness")}</span>
        <input
          type="range"
          min="1"
          max="100"
          .value=${String(a.brightness)}
          @input=${(e: Event) =>
            this._setAnim({ brightness: Number((e.target as HTMLInputElement).value) })}
        />
        <b>${a.brightness} %</b>
      </div>
      <div class="row">
        <span>${t("sceneDialog.duration")}</span>
        <input
          type="number"
          min="0.5"
          max="360"
          step="0.5"
          .value=${String(minutes)}
          @change=${(e: Event) => {
            const v = Number((e.target as HTMLInputElement).value);
            if (v > 0) this._setAnim({ duration: Math.round(Math.min(360, Math.max(0.5, v)) * 60) });
          }}
        />
        <span>${t("sceneDialog.minutes")}</span>
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
