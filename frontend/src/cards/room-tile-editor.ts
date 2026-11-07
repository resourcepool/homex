/** Visual editor of custom:homex-room-tile: the room, its switch, the name,
 * and which scenes to show. */
import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant, Room } from "../types";
import { homexRooms } from "./shared";
import type { RoomTileConfig } from "./room-tile";

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
    return html`
      <label>
        Pièce Homex
        <select @change=${(e: Event) => this._set({ room: (e.target as HTMLSelectElement).value, scenes: undefined, entity: undefined })}>
          <option value="" ?selected=${!id}>—</option>
          ${this._rooms.map((r) => html`<option value=${r.room_id} ?selected=${r.room_id === id}>${r.name}</option>`)}
        </select>
      </label>
      ${switches.length > 1
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
      ${scenes.length
        ? html`<label class="check">
              <input
                type="checkbox"
                .checked=${this._config.show_scenes !== false}
                @change=${(e: Event) =>
                  this._set({ show_scenes: (e.target as HTMLInputElement).checked ? undefined : false })}
              />
              Afficher les scènes
            </label>
            ${this._config.show_scenes !== false
              ? html`<div class="scenes">
                  ${scenes.map(
                    (s) => html`<label class="check">
                      <input
                        type="checkbox"
                        .checked=${!shown || shown.includes(s.key)}
                        @change=${(e: Event) => {
                          const on = (e.target as HTMLInputElement).checked;
                          const cur = shown ?? scenes.map((x) => x.key);
                          const next = on ? [...cur, s.key] : cur.filter((k) => k !== s.key);
                          // Every scene shown: no filter (new scenes show up too).
                          const all = scenes.every((x) => next.includes(x.key));
                          this._set({ scenes: all ? undefined : scenes.map((x) => x.key).filter((k) => next.includes(k)) });
                        }}
                      />
                      ${s.name}
                    </label>`
                  )}
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
    .scenes {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding-left: 26px;
    }
  `;
}

if (!customElements.get("homex-room-tile-editor")) {
  customElements.define("homex-room-tile-editor", HomexRoomTileEditor);
}
