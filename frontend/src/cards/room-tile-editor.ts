/** Visual editor of custom:homex-room-tile: the room, its switch, the name,
 * and which scenes to show. */
import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant, Room } from "../types";
import { homexRooms } from "./shared";
import { tileColor, type RoomTileConfig } from "./room-tile";

/** HA theme colours offered in the editor (var(--<name>-color)). */
const COLORS: [string, string][] = [
  ["red", "Rouge"], ["pink", "Rose"], ["purple", "Violet"], ["deep-purple", "Violet foncé"],
  ["indigo", "Indigo"], ["blue", "Bleu"], ["light-blue", "Bleu clair"], ["cyan", "Cyan"],
  ["teal", "Sarcelle"], ["green", "Vert"], ["light-green", "Vert clair"], ["lime", "Citron vert"],
  ["yellow", "Jaune"], ["amber", "Ambre"], ["orange", "Orange"], ["deep-orange", "Orange foncé"],
  ["brown", "Marron"], ["grey", "Gris"], ["blue-grey", "Gris bleu"],
];

export class HomexRoomTileEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config?: RoomTileConfig;
  @state() private _rooms: Room[] = [];

  setConfig(config: RoomTileConfig) {
    this._config = config;
  }

  firstUpdated() {
    homexRooms(this.hass)
      .then((rooms) => (this._rooms = [...rooms].sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => undefined);
  }

  private _set(patch: Partial<RoomTileConfig>) {
    const config: Record<string, unknown> = { ...this._config, ...patch };
    for (const [k, v] of Object.entries(config)) if (v === undefined || v === "") delete config[k];
    this._config = config as unknown as RoomTileConfig;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }

  /** Include / exclude a scene; every scene included: no filter (new scenes
   * show up too). */
  private _include(keys: string[], key: string, on: boolean) {
    const cur = this._config!.scenes ?? keys;
    const next = on ? [...cur, key] : cur.filter((k) => k !== key);
    const all = keys.every((k) => next.includes(k));
    this._set({ scenes: all ? undefined : keys.filter((k) => next.includes(k)) });
  }

  private _rename(key: string, label: string) {
    const names = { ...(this._config!.scene_names ?? {}) };
    if (label.trim()) names[key] = label.trim();
    else delete names[key];
    this._set({ scene_names: Object.keys(names).length ? names : undefined });
  }

  render() {
    if (!this._config) return nothing;
    const room = this._rooms.find((r) => r.room_id === this._config!.room);
    const id = this._config.room;
    const switches = id
      ? [
          [`switch.homex_${id}_lights_toggle`, "Lumières"],
          [`switch.homex_${id}_heating`, "Chauffage"],
        ].filter(([e]) => this.hass.states[e])
      : [];
    const entity = this._config.entity || `switch.homex_${id}_lights_toggle`;
    const scenes = (room?.scenes ?? []).filter((s) => s.key !== "turn_off");
    const shown = this._config.scenes;
    const climate = this._config.mode === "climate";
    const color = this._config.color;
    const named = !!color && COLORS.some(([v]) => v === color);
    return html`
      <label>
        Pièce Homex
        <select @change=${(e: Event) => this._set({ room: (e.target as HTMLSelectElement).value, scenes: undefined, entity: undefined })}>
          <option value="" ?selected=${!id}>—</option>
          ${this._rooms.map((r) => html`<option value=${r.room_id} ?selected=${r.room_id === id}>${r.name}</option>`)}
        </select>
      </label>
      <label>
        Variante
        <select
          @change=${(e: Event) => {
            const v = (e.target as HTMLSelectElement).value;
            // Climate: the heating switch; its own scenes / switch settings drop.
            this._set(
              v === "climate"
                ? { mode: "climate", entity: undefined, show_scenes: undefined, scenes: undefined, scene_names: undefined }
                : { mode: undefined, entity: undefined }
            );
          }}
        >
          <option value="default" ?selected=${!climate}>Défaut — lumières, qualité de l'air, volets, scènes</option>
          <option value="climate" ?selected=${climate}>Climat — chauffage et consigne</option>
        </select>
      </label>
      ${!climate && switches.length > 1
        ? html`<label>
            Interrupteur de la tuile
            <select
              @change=${(e: Event) => {
                const v = (e.target as HTMLSelectElement).value;
                this._set({ entity: v.endsWith("_lights_toggle") ? undefined : v });
              }}
            >
              ${switches.map(([e, l]) => html`<option value=${e} ?selected=${e === entity}>${l}</option>`)}
            </select>
          </label>`
        : nothing}
      <label>
        Nom (optionnel)
        <input
          .value=${this._config.name ?? ""}
          placeholder=${room?.name ?? ""}
          @change=${(e: Event) => this._set({ name: (e.target as HTMLInputElement).value })}
        />
      </label>
      <div class="color-row">
        <label>
          Couleur active
          <select
            @change=${(e: Event) => {
              const v = (e.target as HTMLSelectElement).value;
              this._set({ color: v === "custom" ? (this._config!.color?.startsWith("#") ? this._config!.color : "#ff8100") : v || undefined });
            }}
          >
            <option value="" ?selected=${!color}>Défaut (${climate ? "orange chauffage" : "ambre lumières"})</option>
            ${COLORS.map(([v, l]) => html`<option value=${v} ?selected=${color === v}>${l}</option>`)}
            <option value="custom" ?selected=${!!color && !named}>Personnalisée…</option>
          </select>
        </label>
        ${color && !named
          ? html`<input
              type="color"
              .value=${/^#[0-9a-f]{6}$/i.test(color) ? color : "#ff8100"}
              @change=${(e: Event) => this._set({ color: (e.target as HTMLInputElement).value })}
            />`
          : html`<span class="swatch" style="background: ${color ? tileColor(color) : climate ? "var(--state-climate-heat-color, #ff8100)" : "var(--state-light-active-color, var(--amber-color, #ffc107))"}"></span>`}
      </div>
      <div class="toggle-row">
        <span>${climate ? "Activer / désactiver le chauffage au clic" : "Allumer / éteindre au clic"}</span>
        <label class="switch">
          <input
            type="checkbox"
            .checked=${this._config.toggle !== false}
            @change=${(e: Event) => this._set({ toggle: (e.target as HTMLInputElement).checked ? undefined : false })}
          />
          <span></span>
        </label>
      </div>
      ${!climate && scenes.length > 1
        ? html`<div class="toggle-row">
              <span>Afficher les scènes</span>
              <label class="switch">
                <input
                  type="checkbox"
                  .checked=${this._config.show_scenes === true}
                  @change=${(e: Event) =>
                    this._set({ show_scenes: (e.target as HTMLInputElement).checked ? true : undefined })}
                />
                <span></span>
              </label>
            </div>
            ${this._config.show_scenes === true
              ? html`<div class="scene-list">
                  <div class="hint">Scènes du widget — décocher pour masquer, libellé facultatif</div>
                  ${scenes.map((s) => {
                    const included = !shown || shown.includes(s.key);
                    return html`<div class="scene-row ${included ? "" : "excluded"}">
                      <input
                        type="checkbox"
                        title=${included ? "Retirer du widget" : "Ajouter au widget"}
                        .checked=${included}
                        @change=${(e: Event) => this._include(scenes.map((x) => x.key), s.key, (e.target as HTMLInputElement).checked)}
                      />
                      <input
                        class="label"
                        .value=${this._config!.scene_names?.[s.key] ?? ""}
                        placeholder=${s.name}
                        ?disabled=${!included}
                        @change=${(e: Event) => this._rename(s.key, (e.target as HTMLInputElement).value)}
                      />
                    </div>`;
                  })}
                </div>`
              : nothing}`
        : nothing}
    `;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 14px;
      color: var(--primary-text-color);
    }
    label.check {
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }
    select,
    input:not([type]) {
      font: inherit;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #888);
      background: var(--card-background-color, transparent);
      color: var(--primary-text-color);
    }
    .color-row {
      display: flex;
      align-items: flex-end;
      gap: 10px;
    }
    .color-row label {
      flex: 1;
    }
    .color-row input[type="color"],
    .swatch {
      width: 38px;
      height: 38px;
      flex: none;
      box-sizing: border-box;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #888);
      padding: 2px;
      background: none;
    }
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      color: var(--primary-text-color);
    }
    .switch {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 22px;
      flex: none;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .switch span {
      position: absolute;
      inset: 0;
      border-radius: 11px;
      background: rgba(127, 127, 127, 0.4);
      cursor: pointer;
      transition: background 0.2s;
    }
    .switch span::before {
      content: "";
      position: absolute;
      width: 18px;
      height: 18px;
      left: 2px;
      top: 2px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.2s;
    }
    .switch input:checked + span {
      background: var(--primary-color, #03a9f4);
    }
    .switch input:checked + span::before {
      transform: translateX(18px);
    }
    .scene-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
      border-radius: 8px;
      padding: 10px;
    }
    .hint {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .scene-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .scene-row input[type="checkbox"] {
      width: 18px;
      height: 18px;
      flex: none;
      accent-color: var(--primary-color);
    }
    .scene-row .label {
      flex: 1;
      min-width: 0;
    }
    .scene-row.excluded .label {
      opacity: 0.5;
    }
  `;
}

if (!customElements.get("homex-room-tile-editor")) {
  customElements.define("homex-room-tile-editor", HomexRoomTileEditor);
}
