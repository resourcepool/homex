import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiDelete,
  mdiDrag,
  mdiOpenInNew,
  mdiPencil,
  mdiPin,
  mdiThemeLightDark,
} from "@mdi/js";
import type { HomeAssistant, Room, Scene } from "../types";
import { fireChanged } from "../types";
import {
  deleteRoom,
  deleteScene,
  errorMessage,
  reorderScenes,
  sceneNext,
} from "../api";
import { sharedStyles } from "../lib/styles";
import "./homex-unit-controls";
import "./homex-group-row";
import "./homex-room-dialog";
import "./homex-triggers-dialog";
import "./homex-group-dialog";
import "./homex-scene-dialog";

type DialogKind = "" | "room" | "triggers" | "addgroup" | "addscene";

/** One room as an ha-card: status, drag-orderable scenes, groups, menu. */
@customElement("homex-room-card")
export class HomexRoomCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) room!: Room;
  @property({ type: Boolean }) expanded = false;

  @state() private _dialog: DialogKind = "";
  @state() private _menuOpen = false;
  @state() private _renameScene: Scene | null = null;

  static styles = [
    sharedStyles,
    css`
      ha-card {
        position: relative;
        padding: 16px;
        margin-bottom: 16px;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }
      .chevron {
        flex: 0 0 auto;
        width: 24px;
        height: 24px;
        fill: var(--secondary-text-color);
      }
      homex-unit-controls {
        flex: 1;
      }
      .head-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .round {
        width: 42px;
        height: 42px;
        min-height: 0;
        padding: 0;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--secondary-background-color, #f0f0f0);
        color: var(--secondary-text-color);
      }
      .round svg {
        width: 22px;
        height: 22px;
        fill: currentColor;
      }
      .kebab {
        min-height: 0;
        padding: 6px 10px;
        font-size: 20px;
        line-height: 1;
        border-radius: 50%;
        background: transparent;
      }
      .menu-backdrop {
        position: fixed;
        inset: 0;
        z-index: 30;
      }
      .menu {
        position: absolute;
        top: 52px;
        right: 12px;
        z-index: 31;
        min-width: 230px;
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
        min-height: 0;
        padding: 10px 12px;
        font-weight: 400;
      }
      .menu button:hover {
        background: var(--secondary-background-color, #f0f0f0);
      }
      .menu .danger-item {
        color: var(--error-color, #db4437);
      }
      .sep {
        height: 1px;
        background: var(--divider-color, #e0e0e0);
        margin: 6px 4px;
      }
      .stats {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 12px 0 4px;
      }
      .stat {
        font-size: 13px;
        background: var(--secondary-background-color, #f0f0f0);
        border-radius: 14px;
        padding: 4px 12px;
      }
      .section-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 16px;
      }
      .scene-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-top: 1px solid var(--divider-color, #ececec);
      }
      .handle {
        display: flex;
        cursor: grab;
        color: var(--secondary-text-color);
      }
      .handle:active {
        cursor: grabbing;
      }
      .pin {
        display: flex;
        color: var(--secondary-text-color);
      }
      .handle svg,
      .pin svg {
        width: 22px;
        height: 22px;
        fill: currentColor;
      }
      .scene-name {
        flex: 1;
        font-size: 15px;
      }
      .active-tag {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-primary-color, #fff);
        background: var(--state-active-color, #ffc107);
        border-radius: 6px;
        padding: 2px 7px;
      }
      .btn-group {
        display: inline-flex;
        border: 1px solid var(--divider-color, #d0d0d0);
        border-radius: 8px;
        overflow: hidden;
      }
      .btn-group .icon-btn {
        min-height: 0;
        border: none;
        border-left: 1px solid var(--divider-color, #d0d0d0);
        border-radius: 0;
        background: transparent;
        padding: 6px 12px;
      }
      .btn-group .icon-btn:first-child {
        border-left: none;
      }
      .btn-group .icon-btn:hover:not(:disabled) {
        background: var(--secondary-background-color, #f0f0f0);
      }
      .btn-group .icon-btn:disabled {
        opacity: 0.3;
        cursor: default;
      }
      .icon-btn svg {
        display: block;
        width: 20px;
        height: 20px;
        fill: currentColor;
      }
      .groups {
        margin-top: 14px;
      }
      .groups homex-group-row {
        display: block;
        border-top: 1px solid var(--divider-color, #e0e0e0);
        margin-top: 8px;
        padding-top: 6px;
      }
    `,
  ];

  private _close = () => (this._dialog = "");

  private _pick(kind: DialogKind) {
    this._menuOpen = false;
    this._dialog = kind;
  }

  private _isOn() {
    return this.hass.states[this.room.switch]?.state === "on";
  }

  private async _delete() {
    this._menuOpen = false;
    const r = this.room;
    if (
      !confirm(
        `Supprimer la pièce "${r.name}" ?\nSes scènes et entités seront supprimées.`
      )
    )
      return;
    try {
      await deleteRoom(this.hass, r.entry_id);
      fireChanged(this);
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  private _openHa(scene: Scene) {
    window.open(`/config/scene/edit/${scene.config_id}`, "_blank", "noopener");
  }

  private _sceneNext = async (e?: Event) => {
    e?.stopPropagation();
    try {
      await sceneNext(this.hass, this.room.entry_id);
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
    }
  };

  private _toggleExpand = () => {
    this.dispatchEvent(
      new CustomEvent("homex-toggle-expand", {
        detail: { entry_id: this.room.entry_id },
        bubbles: true,
        composed: true,
      })
    );
  };

  private async _deleteScene(scene: Scene) {
    if (!confirm(`Supprimer la scène "${scene.name}" ?`)) return;
    try {
      await deleteScene(this.hass, this.room.entry_id, scene.key);
      fireChanged(this);
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  private async _sceneMoved(e: CustomEvent) {
    const { oldIndex, newIndex } = e.detail;
    const keys = this.room.scenes.filter((s) => s.orderable).map((s) => s.key);
    const [moved] = keys.splice(oldIndex, 1);
    keys.splice(newIndex, 0, moved);
    try {
      await reorderScenes(this.hass, this.room.entry_id, keys);
      fireChanged(this);
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  private _iconBtn(
    path: string,
    label: string,
    onClick: () => void,
    disabled = false
  ) {
    return html`<button
      class="icon-btn"
      title=${label}
      aria-label=${label}
      ?disabled=${disabled}
      @click=${onClick}
    >
      <svg viewBox="0 0 24 24"><path d=${path}></path></svg>
    </button>`;
  }

  private _sceneRow(sc: Scene, activeKey: string | null) {
    return html`
      <div class="scene-row">
        ${sc.orderable
          ? html`<span class="handle" title="Glisser pour réordonner">
              <svg viewBox="0 0 24 24"><path d=${mdiDrag}></path></svg>
            </span>`
          : html`<span class="pin" title="Toujours en dernier">
              <svg viewBox="0 0 24 24"><path d=${mdiPin}></path></svg>
            </span>`}
        <span class="scene-name">${sc.name}</span>
        ${sc.key === activeKey
          ? html`<span class="active-tag">active</span>`
          : ""}
        <span class="btn-group">
          ${this._iconBtn(mdiOpenInNew, "Voir dans Home Assistant", () =>
            this._openHa(sc)
          )}
          ${this._iconBtn(mdiPencil, "Renommer", () => (this._renameScene = sc))}
          ${this._iconBtn(
            mdiDelete,
            sc.removable ? "Supprimer" : "Scène par défaut",
            () => this._deleteScene(sc),
            !sc.removable
          )}
        </span>
      </div>
    `;
  }

  render() {
    const r = this.room;
    const on = this._isOn();
    const activeKey = on
      ? this.hass.states[r.switch]?.attributes?.active_scene ?? null
      : null;
    const activeScene = activeKey
      ? r.scenes.find((s) => s.key === activeKey)?.name
      : undefined;
    const area = r.area_id ? this.hass.areas?.[r.area_id] : null;
    const areaIcon = area?.icon || undefined;
    const floor = area?.floor_id ? this.hass.floors?.[area.floor_id] : null;
    const floorName = floor?.name || undefined;
    const orderable = r.scenes.filter((s) => s.orderable);
    const pinned = r.scenes.filter((s) => !s.orderable);
    return html`
      <ha-card>
        <div class="head" @click=${this._toggleExpand} title="Plier / déplier">
          <svg class="chevron" viewBox="0 0 24 24">
            <path d=${this.expanded ? mdiChevronUp : mdiChevronDown}></path>
          </svg>
          <homex-unit-controls
            .hass=${this.hass}
            .unit=${r}
            .areaIcon=${areaIcon}
            .floorName=${floorName}
            .activeScene=${activeScene}
          ></homex-unit-controls>
          <div class="head-actions">
            <button
              class="round"
              title="Changer de scène"
              @click=${(e: Event) => this._sceneNext(e)}
            >
              <svg viewBox="0 0 24 24"><path d=${mdiThemeLightDark}></path></svg>
            </button>
            <button
              class="kebab"
              title="Actions"
              @click=${(e: Event) => {
                e.stopPropagation();
                this._menuOpen = true;
              }}
            >
              ⋮
            </button>
          </div>
        </div>

        ${this._menuOpen
          ? html`
              <div class="menu-backdrop" @click=${() => (this._menuOpen = false)}></div>
              <div class="menu">
                <button @click=${() => this._pick("room")}>✏️ Modifier la pièce</button>
                <button @click=${() => this._pick("triggers")}>
                  ⚡ Déclencheurs (${r.triggers.length + r.scene_triggers.length})
                </button>
                <button @click=${() => this._pick("addgroup")}>
                  ＋ Ajouter un groupe
                </button>
                <div class="sep"></div>
                <button class="danger-item" @click=${this._delete}>
                  🗑 Supprimer la pièce
                </button>
              </div>
            `
          : ""}

        <div class="stats">
          <span class="stat">🔌 ${r.devices.length} appareil(s)</span>
          <span class="stat">🎬 ${r.scenes.length} scène(s)</span>
          ${r.groups.length
            ? html`<span class="stat">📦 ${r.groups.length} groupe(s)</span>`
            : ""}
        </div>
        ${this.expanded ? this._renderBody(r, activeKey, orderable, pinned) : ""}
      </ha-card>

      ${this._renderDialogs(r)}
    `;
  }

  private _renderBody(
    r: Room,
    activeKey: string | null,
    orderable: Scene[],
    pinned: Scene[]
  ) {
    return html`
        <div class="section-row">
          <span class="section">Scènes</span>
          <button @click=${() => this._pick("addscene")}>＋ Scène</button>
        </div>
        <ha-sortable handle-selector=".handle" @item-moved=${this._sceneMoved}>
          <div>${orderable.map((sc) => this._sceneRow(sc, activeKey))}</div>
        </ha-sortable>
        ${pinned.map((sc) => this._sceneRow(sc, activeKey))}

        ${r.groups.length
          ? html`
              <div class="section-row">
                <span class="section">Groupes</span>
                <button @click=${() => this._pick("addgroup")}>＋ Groupe</button>
              </div>
              <div class="groups">
                ${r.groups.map(
                  (g) => html`<homex-group-row
                    .hass=${this.hass}
                    .room=${r}
                    .group=${g}
                  ></homex-group-row>`
                )}
              </div>
            `
          : ""}
    `;
  }

  private _renderDialogs(r: Room) {
    return html`
      <homex-room-dialog
        .hass=${this.hass}
        .room=${r}
        .open=${this._dialog === "room"}
        @dialog-closed=${this._close}
      ></homex-room-dialog>
      <homex-triggers-dialog
        .hass=${this.hass}
        .room=${r}
        .open=${this._dialog === "triggers"}
        @dialog-closed=${this._close}
      ></homex-triggers-dialog>
      <homex-group-dialog
        .hass=${this.hass}
        .room=${r}
        .group=${null}
        .open=${this._dialog === "addgroup"}
        @dialog-closed=${this._close}
      ></homex-group-dialog>
      <homex-scene-dialog
        .hass=${this.hass}
        .room=${r}
        .scene=${null}
        .open=${this._dialog === "addscene"}
        @dialog-closed=${this._close}
      ></homex-scene-dialog>
      <homex-scene-dialog
        .hass=${this.hass}
        .room=${r}
        .scene=${this._renameScene}
        .open=${this._renameScene !== null}
        @dialog-closed=${() => (this._renameScene = null)}
      ></homex-scene-dialog>
    `;
  }
}
