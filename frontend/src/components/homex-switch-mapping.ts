import { LitElement, css, html, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  GlobalSwitch,
  HomeAssistant,
  HomexAction,
  Room,
  SwitchButtonAction,
  SwitchLayout,
  TapMode,
} from "../types";
import { errorMessage, fetchRooms, saveGlobalSwitch } from "../api";
import { sharedStyles } from "../lib/styles";
import "./homex-dialog";

interface ActionItem {
  id: string; // `${room_id}::${actionKey}`
  room_id: string;
  room_name: string;
  module: string; // Homex module this action belongs to (e.g. "lights")
  label: string; // full label (left list)
  clabel: string; // short label (canvas button)
  short: string;
  action: HomexAction;
}

// Homex modules that expose assignable actions (extensible).
const MODULE_LABELS: Record<string, string> = { lights: "💡 Lights" };

const TAP_LABELS: Record<TapMode, string> = {
  single: "Simple",
  double: "Double",
  long: "Long",
};

function actionKey(a: HomexAction): string {
  if (a.kind === "group") return `group:${a.group_id}`;
  if (a.kind === "scene") return `scene:${a.scene_key}`;
  return a.kind;
}

/** Drag-and-drop editor mapping a switch's buttons (per tap mode) to Homex
 * actions. Actions come from every room the switch is associated with. */
@customElement("homex-switch-mapping")
export class HomexSwitchMapping extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) sw!: GlobalSwitch;
  @property({ attribute: false }) layout: SwitchLayout | null = null;
  @property({ attribute: false }) taps: Record<string, TapMode[]> = {};

  @state() private _rooms: Room[] = []; // the switch's associated rooms
  // tapMode -> button -> { room, action }
  @state() private _mappings: Record<string, Record<string, SwitchButtonAction>> = {};
  @state() private _tapTab: TapMode = "single";
  @state() private _dragId = "";
  @state() private _dropBtn: number | null = null; // button highlighted under a drag
  @state() private _busy = false;

  static styles = [
    sharedStyles,
    css`
      .cols {
        display: flex;
        gap: 20px;
        align-items: flex-start;
      }
      .left {
        flex: 0 0 280px;
        max-height: 70vh;
        overflow: auto;
      }
      .right {
        flex: 1;
        min-width: 0;
      }
      .section {
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        color: var(--secondary-text-color);
        margin: 0 0 8px;
      }
      .room-head {
        font-size: 13px;
        font-weight: 700;
        margin: 12px 0 6px;
        padding-bottom: 2px;
        border-bottom: 1px solid var(--divider-color, #444);
      }
      .mod-head {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        color: var(--secondary-text-color);
        margin: 8px 0 4px;
      }
      .act {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 12px;
        margin-bottom: 6px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 9px;
        cursor: grab;
        font-size: 14px;
        background: var(--card-background-color, #1c1c1c);
        user-select: none;
      }
      .act:active {
        cursor: grabbing;
      }
      /* Assigned somewhere on the switch — greyed but still draggable. */
      .act.used {
        opacity: 0.45;
      }
      .act .badge {
        flex: 0 0 auto;
        width: 26px;
        height: 26px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        background: var(--primary-color);
        color: #fff;
      }
      .tabs {
        display: flex;
        gap: 4px;
        margin: 0 0 12px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .tab {
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .tab.active {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
        margin-bottom: -1px;
      }
      svg.canvas {
        width: 100%;
        max-width: 480px;
        aspect-ratio: 1;
        background: var(--code-editor-background-color, #111);
        border-radius: 10px;
        display: block;
      }
      .sh {
        fill: none;
        stroke: var(--primary-color);
        stroke-width: 0.2;
      }
      .zone {
        fill: color-mix(in srgb, var(--primary-color) 10%, transparent);
        stroke: color-mix(in srgb, var(--primary-color) 40%, transparent);
        stroke-width: 0.12;
      }
      .zone.assigned {
        fill: color-mix(in srgb, var(--primary-color) 32%, transparent);
      }
      .zone.disabled {
        fill: rgba(128, 128, 128, 0.12);
        stroke: rgba(128, 128, 128, 0.25);
      }
      /* Highlight the zone currently under a drag, so the target is obvious. */
      .zone.drop {
        fill: color-mix(in srgb, var(--primary-color) 60%, transparent);
        stroke: var(--primary-color);
        stroke-width: 0.25;
      }
      /* Labels must not swallow drop/click events — let them reach the rect. */
      .bn,
      .ic,
      .lb,
      .rm {
        pointer-events: none;
        text-anchor: middle;
        dominant-baseline: central;
      }
      .bn {
        fill: #fff;
        font-size: 1px;
        font-weight: 700;
      }
      .ic {
        font-size: 1px;
      }
      .lb {
        fill: #fff;
        font-size: 0.7px;
        font-weight: 600;
      }
      .rm {
        fill: var(--primary-color);
        font-size: 0.63px;
      }
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 8px 0 0;
      }
      .tray {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
        max-width: 480px;
      }
      .tray-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-text-color);
        margin-right: 4px;
      }
      .ichip {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border: 1px dashed var(--divider-color, #666);
        border-radius: 8px;
        font-size: 13px;
        min-height: 20px;
      }
      .ichip.assigned {
        border-style: solid;
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 14%, transparent);
        cursor: pointer;
      }
      .ichip.drop {
        border-style: solid;
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 45%, transparent);
      }
      .ichip * {
        pointer-events: none;
      }
      .ichip-n {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--secondary-background-color, #333);
        font-weight: 700;
        font-size: 12px;
      }
      .ichip-a {
        color: var(--primary-text-color);
      }
      button {
        cursor: pointer;
        border: none;
        border-radius: 8px;
        padding: 8px 14px;
        background: var(--secondary-background-color, #f0f0f0);
        color: var(--primary-text-color);
      }
      button.primary {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("open") && this.open) {
      this._mappings = JSON.parse(JSON.stringify(this.sw?.mappings ?? {}));
      this._tapTab = this._enabledModes()[0] ?? "single";
      this._busy = false;
      this._dragId = "";
      this._loadRooms();
    }
  }

  private async _loadRooms() {
    try {
      const all = await fetchRooms(this.hass);
      const ids = new Set(this.sw?.rooms ?? []);
      this._rooms = all.filter((r) => ids.has(r.room_id));
    } catch {
      this._rooms = [];
    }
  }

  private get _multi(): boolean {
    return this._rooms.length > 1;
  }

  /** Homex actions for one room (mirrors the Déclencheurs menu). */
  private _actionsForRoom(room: Room): ActionItem[] {
    const mk = (
      module: string,
      label: string,
      clabel: string,
      short: string,
      action: HomexAction
    ): ActionItem => ({
      id: `${room.room_id}::${actionKey(action)}`,
      room_id: room.room_id,
      room_name: room.name,
      module,
      label,
      clabel,
      short,
      action,
    });
    const list: ActionItem[] = [];
    // Lights-module actions — only when the room actually has that module, else
    // none of these (toggle/scene/dim/group/scene) apply. Future modules append
    // their own actions here and get their own group in the UI.
    if ((room.modules ?? []).includes("lights")) {
      list.push(
        mk("lights", "Toggle pièce (on / off)", "Toggle", "⏻", { kind: "toggle" }),
        mk("lights", "Changement de scène", "Scène →", "🎬", { kind: "scene_next" }),
        mk("lights", "Dimmer +", "Dim +", "🔆", { kind: "dim_up" }),
        mk("lights", "Dimmer −", "Dim −", "🔅", { kind: "dim_down" })
      );
      for (const g of room.groups ?? [])
        list.push(
          mk("lights", `Groupe : ${g.name}`, g.name, "◧", {
            kind: "group",
            group_id: g.group_id,
          })
        );
      for (const s of room.scenes ?? [])
        list.push(
          mk("lights", `Scène : ${s.name}`, s.name, "★", {
            kind: "scene",
            scene_key: s.key,
          })
        );
    }
    return list;
  }
  /** A room's actions grouped by module, in module display order. */
  private _actionsByModule(room: Room): [string, ActionItem[]][] {
    const groups = new Map<string, ActionItem[]>();
    for (const it of this._actionsForRoom(room)) {
      const g = groups.get(it.module) ?? [];
      g.push(it);
      groups.set(it.module, g);
    }
    return [...groups.entries()];
  }
  private _allActions(): ActionItem[] {
    return this._rooms.flatMap((r) => this._actionsForRoom(r));
  }
  private _itemById(id: string): ActionItem | undefined {
    return this._allActions().find((a) => a.id === id);
  }
  private _itemForValue(v: SwitchButtonAction): ActionItem | undefined {
    return this._itemById(`${v.room}::${actionKey(v.action)}`);
  }
  /** Action ids already assigned to any button/tap mode on this switch. */
  private _usedIds(): Set<string> {
    const s = new Set<string>();
    for (const byBtn of Object.values(this._mappings))
      for (const v of Object.values(byBtn))
        s.add(`${v.room}::${actionKey(v.action)}`);
    return s;
  }

  private _enabledModes(): TapMode[] {
    const set = new Set<TapMode>();
    Object.values(this.taps).forEach((ms) => ms.forEach((m) => set.add(m)));
    return (["single", "double", "long"] as TapMode[]).filter((m) => set.has(m));
  }
  private _buttonsFor(mode: TapMode): number[] {
    return Object.entries(this.taps)
      .filter(([, ms]) => ms.includes(mode))
      .map(([b]) => Number(b))
      .sort((a, b) => a - b);
  }
  /** Buttons of this tap mode that have no zone on the canvas (invisible). */
  private _invisibleButtons(mode: TapMode): number[] {
    const shown = new Set((this.layout?.zones || []).map((z) => z.n));
    return this._buttonsFor(mode).filter((n) => !shown.has(n));
  }

  private _assign(mode: string, btn: number) {
    const item = this._itemById(this._dragId);
    if (!item) return;
    this._mappings = {
      ...this._mappings,
      [mode]: {
        ...(this._mappings[mode] ?? {}),
        [btn]: { room: item.room_id, action: item.action },
      },
    };
    this._dragId = "";
  }
  private _clear(mode: string, btn: number) {
    const byBtn = { ...(this._mappings[mode] ?? {}) };
    delete byBtn[btn];
    this._mappings = { ...this._mappings, [mode]: byBtn };
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  private async _save() {
    this._busy = true;
    try {
      await saveGlobalSwitch(this.hass, { ...this.sw, mappings: this._mappings });
      this._close();
    } catch (err) {
      this._busy = false;
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  private _trunc(s: string, n: number): string {
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }

  private _actionRow(a: ActionItem, used: Set<string>) {
    return html`<div
      class="act ${used.has(a.id) ? "used" : ""}"
      draggable="true"
      @dragstart=${() => (this._dragId = a.id)}
      @dragend=${() => {
        this._dragId = "";
        this._dropBtn = null;
      }}
    >
      <span class="badge">${a.short}</span>
      <span>${a.label}</span>
    </div>`;
  }

  private _canvas(active: TapMode) {
    const l = this.layout;
    if (!l) return html`<p class="hint">Layout introuvable pour ce modèle.</p>`;
    const b = l.bounds;
    const round = l.shape === "round";
    const clipId = `mapclip-${l.id}`;
    const clip = round
      ? svg`<ellipse cx=${b.x + b.w / 2} cy=${b.y + b.h / 2} rx=${b.w / 2} ry=${b.h / 2}></ellipse>`
      : svg`<rect x=${b.x} y=${b.y} width=${b.w} height=${b.h} rx="0.4"></rect>`;
    const outline = round
      ? svg`<ellipse class="sh" cx=${b.x + b.w / 2} cy=${b.y + b.h / 2} rx=${b.w / 2} ry=${b.h / 2}></ellipse>`
      : svg`<rect class="sh" x=${b.x} y=${b.y} width=${b.w} height=${b.h} rx="0.4"></rect>`;
    const enabledBtns = new Set(this._buttonsFor(active));
    const posOf = (n: number) => (l.positions || []).find((p) => p.n === n);
    const scx = b.x + b.w / 2;
    const scy = b.y + b.h / 2;
    // For a round contour a cell's *visible* (clipped) area is pulled toward the
    // centre, so nudge the label anchor inward to sit in that visible region.
    const anchor = (x: number, y: number): [number, number] =>
      round ? [scx + (x - scx) * 0.82, scy + (y - scy) * 0.82] : [x, y];
    return html`<svg class="canvas" viewBox="-10 -10 20 20">
      <defs><clipPath id=${clipId}>${clip}</clipPath></defs>
      ${outline}
      ${(l.zones || []).map((z) => {
        const on = enabledBtns.has(z.n);
        const v = this._mappings[active]?.[z.n];
        const item = v ? this._itemForValue(v) : undefined;
        const cls =
          (!on ? "zone disabled" : v ? "zone assigned" : "zone") +
          (on && this._dropBtn === z.n ? " drop" : "");
        const p = posOf(z.n);
        const [cx, cy] = anchor(
          p ? p.x : z.x + z.w / 2,
          p ? p.y : z.y + z.h / 2
        );
        const rect = svg`<rect class=${cls} x=${z.x} y=${z.y} width=${z.w} height=${z.h}
          clip-path="url(#${clipId})"
          @dragover=${(e: DragEvent) => {
            if (on) {
              e.preventDefault();
              this._dropBtn = z.n;
            }
          }}
          @dragleave=${() => {
            if (this._dropBtn === z.n) this._dropBtn = null;
          }}
          @drop=${() => {
            if (on) this._assign(active, z.n);
            this._dropBtn = null;
          }}
          @click=${() => on && v && this._clear(active, z.n)}></rect>`;
        if (!v || !item) {
          return svg`${rect}<text class="bn" x=${cx} y=${cy}>${z.n}</text>`;
        }
        // Assigned: show icon + label (+ room if several rooms), no number.
        const yIcon = this._multi ? cy - 1.2 : cy - 0.8;
        const yLabel = this._multi ? cy - 0.1 : cy + 0.4;
        return svg`${rect}
          <text class="ic" x=${cx} y=${yIcon}>${item.short}</text>
          <text class="lb" x=${cx} y=${yLabel}>${this._trunc(item.clabel, 12)}</text>
          ${this._multi
            ? svg`<text class="rm" x=${cx} y=${cy + 0.9}>${this._trunc(item.room_name, 12)}</text>`
            : ""}`;
      })}
    </svg>`;
  }

  private _invisibleTray(active: TapMode) {
    const invisible = this._invisibleButtons(active);
    if (!invisible.length) return "";
    return html`<div class="tray">
      <span class="tray-label">Boutons invisibles</span>
      ${invisible.map((n) => {
        const v = this._mappings[active]?.[n];
        const item = v ? this._itemForValue(v) : undefined;
        return html`<div
          class="ichip ${v ? "assigned" : ""} ${this._dropBtn === n ? "drop" : ""}"
          @dragover=${(e: DragEvent) => {
            e.preventDefault();
            this._dropBtn = n;
          }}
          @dragleave=${() => {
            if (this._dropBtn === n) this._dropBtn = null;
          }}
          @drop=${() => {
            this._assign(active, n);
            this._dropBtn = null;
          }}
          @click=${() => v && this._clear(active, n)}
        >
          <span class="ichip-n">${n}</span>
          ${item
            ? html`<span class="ichip-a"
                >${item.short} ${this._trunc(item.clabel, 12)}${this._multi
                  ? ` · ${item.room_name}`
                  : ""}</span
              >`
            : ""}
        </div>`;
      })}
    </div>`;
  }

  render() {
    const modes = this._enabledModes();
    const active = modes.includes(this._tapTab) ? this._tapTab : modes[0];
    const used = this._usedIds();
    return html`
      <homex-dialog
        .open=${this.open}
        heading=${`Assignations — ${this.sw?.name ?? ""}`}
        @dialog-closed=${this._close}
      >
        <div class="cols">
          <div class="left">
            <p class="section">Actions Homex</p>
            ${this._rooms.length === 0
              ? html`<p class="hint">Aucune pièce associée à cet interrupteur.</p>`
              : this._rooms.every((r) => !this._actionsByModule(r).length)
                ? html`<p class="hint">
                    Aucune action disponible : les pièces associées n'ont aucun
                    module actif (ex. Lights).
                  </p>`
                : this._rooms
                    .map((room) => [room, this._actionsByModule(room)] as const)
                    .filter(([, mods]) => mods.length > 0)
                    .map(
                      ([room, mods]) => html`
                        ${this._multi
                          ? html`<p class="room-head">🏠 ${room.name}</p>`
                          : ""}
                        ${mods.map(
                          ([mod, items]) => html`
                            <p class="mod-head">${MODULE_LABELS[mod] ?? mod}</p>
                            ${items.map((a) => this._actionRow(a, used))}
                          `
                        )}
                      `
                    )}
            <p class="hint">
              Glisse une action sur un bouton du canvas. Clique un bouton assigné
              pour le vider.
            </p>
          </div>
          <div class="right">
            ${modes.length
              ? html`<div class="tabs">
                    ${modes.map(
                      (m) => html`<span
                        class="tab ${m === active ? "active" : ""}"
                        @click=${() => (this._tapTab = m)}
                        >${TAP_LABELS[m]}</span
                      >`
                    )}
                  </div>
                  ${this._canvas(active)} ${this._invisibleTray(active)}`
              : html`<p class="hint">Aucun tap mode configuré sur ce preset.</p>`}
          </div>
        </div>
        <div slot="actions">
          <button @click=${this._close}>Annuler</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            Enregistrer
          </button>
        </div>
      </homex-dialog>
    `;
  }
}
