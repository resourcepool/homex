import { LitElement, css, html, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, LayoutShape, SwitchLayout } from "../types";
import { deleteLayout, errorMessage, saveLayout } from "../api";
import { sharedStyles } from "../lib/styles";
import { textField } from "../lib/fields";
import { slugify } from "../lib/slug";

const GRID = 20; // 20x20 magnetic grid
const SNAP = 0.5;

type Bounds = { x: number; y: number; w: number; h: number };
type Cell = {
  i: number;
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
};
type Drag =
  // fromCell = the source cell index, or -1 when dragged from the invisible tray
  | { kind: "num"; fromCell: number; button: number }
  | { kind: "col"; index: number }
  | { kind: "row"; index: number }
  | { kind: "tl" }
  | { kind: "br" }
  | null;

/** Visual editor for a switch layout. A button is assigned to a cell (the zone
 * delimited by the separators); dragging a number magnetizes it to a whole
 * cell, swapping with whatever is already there. */
@customElement("homex-layout-editor")
export class HomexLayoutEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) layout: SwitchLayout | null = null;

  @state() private _name = "";
  @state() private _id = "";
  @state() private _buttons = 2;
  @state() private _shape: LayoutShape = "round";
  @state() private _bounds: Bounds = { x: 5, y: 5, w: 10, h: 10 };
  @state() private _columns = 2;
  @state() private _rows = 1;
  @state() private _colLines: number[] = [];
  @state() private _rowLines: number[] = [];
  @state() private _assignments: number[] = [];
  @state() private _busy = false;
  @state() private _dragClient: { x: number; y: number } | null = null;
  @state() private _hoverCell = -1;
  @state() private _overTray = false;
  private _idEdited = false;
  private _drag: Drag = null;

  static styles = [
    sharedStyles,
    css`
      .cols {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
      }
      .form {
        flex: 1 1 260px;
        min-width: 240px;
      }
      .fields {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .field {
        flex: 1 1 90px;
      }
      .field label {
        display: block;
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }
      input.num {
        width: 100%;
        box-sizing: border-box;
        padding: 10px 12px;
        font-size: 15px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      .shapes {
        display: flex;
        gap: 8px;
        margin: 6px 0 14px;
      }
      .shape-btn {
        flex: 1;
        cursor: pointer;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        padding: 8px;
        font-size: 13px;
      }
      .shape-btn.on {
        border-color: var(--primary-color);
        color: var(--primary-color);
        box-shadow: inset 0 0 0 1px var(--primary-color);
      }
      .center-btn {
        margin: 6px 0 0;
        padding: 8px 12px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        cursor: pointer;
      }
      .center-btn:hover {
        border-color: var(--primary-color);
      }
      svg.canvas {
        width: 380px;
        max-width: 78vw;
        height: auto;
        aspect-ratio: 1;
        background: var(--card-background-color, #111);
        border: 1px solid var(--divider-color, #444);
        border-radius: 8px;
        touch-action: none;
      }
      .grid-line {
        stroke: var(--divider-color, rgba(255, 255, 255, 0.08));
        stroke-width: 0.03;
      }
      .shape {
        fill: color-mix(in srgb, var(--primary-color) 12%, transparent);
        stroke: var(--primary-color);
        stroke-width: 0.15;
      }
      .zone {
        fill: color-mix(in srgb, var(--primary-color) 6%, transparent);
        stroke: color-mix(in srgb, var(--primary-color) 40%, transparent);
        stroke-width: 0.06;
      }
      .cell-hi {
        fill: color-mix(in srgb, var(--primary-color) 22%, transparent);
        pointer-events: none;
      }
      .divider {
        stroke: var(--secondary-text-color);
        stroke-width: 0.1;
        stroke-dasharray: 0.4 0.3;
      }
      .divider-hit {
        stroke: transparent;
        stroke-width: 1.2;
        cursor: grab;
      }
      .handle {
        fill: var(--primary-color);
        cursor: nwse-resize;
      }
      .num-badge {
        fill: var(--primary-color);
        cursor: grab;
      }
      .num-text {
        fill: #fff;
        font-size: 1.6px;
        font-weight: 700;
        text-anchor: middle;
        dominant-baseline: central;
        pointer-events: none;
        user-select: none;
      }
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 8px 0;
      }
      .warn {
        font-size: 13px;
        color: var(--error-color, #db4437);
        margin: 8px 0;
      }
      .tray {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
        padding: 10px 12px;
        min-height: 44px;
        border: 1px dashed var(--divider-color, #666);
        border-radius: 8px;
        width: 380px;
        max-width: 78vw;
        box-sizing: border-box;
      }
      .tray.over {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      }
      .tray-label {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--secondary-text-color);
        margin-right: 4px;
      }
      .tray-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--primary-color);
        color: #fff;
        font-weight: 700;
        font-size: 14px;
        cursor: grab;
        touch-action: none;
        user-select: none;
      }
      .tray-empty {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .floating {
        position: fixed;
        z-index: 1000;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--primary-color);
        color: #fff;
        font-weight: 700;
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-50%, -50%);
        pointer-events: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
      }
      button.primary:disabled {
        opacity: 0.5;
        cursor: default;
      }
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("layout")) {
      const l = this.layout;
      this._name = l?.name ?? "";
      this._id = l?.id ?? "";
      this._buttons = l?.buttons ?? 2;
      this._shape = l?.shape ?? "round";
      // Stored coords are center-origin (-10..10); the editor works top-left
      // 0..20, so shift by +10 when loading an existing layout.
      const O = 10;
      this._bounds = l?.bounds
        ? { x: l.bounds.x + O, y: l.bounds.y + O, w: l.bounds.w, h: l.bounds.h }
        : this._defaultBounds(this._shape);
      this._columns = l?.columns ?? 2;
      this._rows = l?.rows ?? 1;
      this._idEdited = !!l;
      this._busy = false;
      this._dragClient = null;
      this._hoverCell = -1;
      this._overTray = false;
      if (l && (l.colLines?.length || l.rowLines?.length)) {
        this._colLines = (l.colLines ?? []).map((x) => x + O);
        this._rowLines = (l.rowLines ?? []).map((y) => y + O);
      } else {
        this._resetDividers();
      }
      this._assignments = l?.assignments ? [...l.assignments] : [];
      this._reconcile();
    }
  }

  private _defaultBounds(shape: LayoutShape): Bounds {
    if (shape === "vrect") return { x: 7.5, y: 0, w: 5, h: 20 };
    return { x: 5, y: 5, w: 10, h: 10 };
  }
  private _snap(v: number): number {
    return Math.min(GRID, Math.max(0, Math.round(v / SNAP) * SNAP));
  }

  private _resetDividers() {
    const b = this._bounds;
    const cols = Math.max(1, this._columns);
    const rows = Math.max(1, this._rows);
    this._colLines = Array.from(
      { length: cols - 1 },
      (_, i) => b.x + (b.w * (i + 1)) / cols
    );
    this._rowLines = Array.from(
      { length: rows - 1 },
      (_, i) => b.y + (b.h * (i + 1)) / rows
    );
  }
  private _clampDividers() {
    const b = this._bounds;
    this._colLines = this._colLines.map((x) => Math.min(Math.max(x, b.x), b.x + b.w));
    this._rowLines = this._rowLines.map((y) => Math.min(Math.max(y, b.y), b.y + b.h));
  }

  /** Fit the per-cell assignments to the current button count and grid: keep
   * placements that still fit, then place any not-yet-placed button in a free
   * cell. Buttons that don't fit remain unassigned (save is blocked). */
  private _reconcile() {
    const zones = Math.max(1, this._columns) * Math.max(1, this._rows);
    const old = this._assignments;
    const next = new Array(zones).fill(0);
    const present = new Set<number>();
    for (let i = 0; i < Math.min(old.length, zones); i++) {
      const bn = old[i];
      if (bn >= 1 && bn <= this._buttons && !present.has(bn)) {
        next[i] = bn;
        present.add(bn);
      }
    }
    for (let bn = 1; bn <= this._buttons; bn++) {
      if (!present.has(bn)) {
        const idx = next.indexOf(0);
        if (idx >= 0) {
          next[idx] = bn;
          present.add(bn);
        }
      }
    }
    this._assignments = next;
  }

  private _cells(): Cell[] {
    const b = this._bounds;
    const cols = Math.max(1, this._columns);
    const rows = Math.max(1, this._rows);
    const xs = [b.x, ...[...this._colLines].sort((a, c) => a - c), b.x + b.w];
    const ys = [b.y, ...[...this._rowLines].sort((a, c) => a - c), b.y + b.h];
    const out: Cell[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = xs[c] ?? b.x;
        const x2 = xs[c + 1] ?? b.x + b.w;
        const y = ys[r] ?? b.y;
        const y2 = ys[r + 1] ?? b.y + b.h;
        out.push({
          i: r * cols + c,
          x,
          y,
          w: x2 - x,
          h: y2 - y,
          cx: (x + x2) / 2,
          cy: (y + y2) / 2,
        });
      }
    }
    return out;
  }
  private _cellAt(x: number, y: number): number {
    for (const c of this._cells()) {
      if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) return c.i;
    }
    return -1;
  }
  private _unassigned(): number[] {
    const present = new Set(this._assignments.filter((n) => n > 0));
    const out: number[] = [];
    for (let n = 1; n <= this._buttons; n++) if (!present.has(n)) out.push(n);
    return out;
  }

  private _setShape(shape: LayoutShape) {
    this._shape = shape;
    this._bounds = this._defaultBounds(shape);
    this._resetDividers();
    this._reconcile();
  }
  private _setButtons(v: number) {
    this._buttons = isNaN(v) || v < 1 ? 1 : Math.floor(v);
    this._reconcile();
  }
  private _setColumns(v: number) {
    this._columns = isNaN(v) || v < 1 ? 1 : Math.floor(v);
    this._resetDividers();
    this._reconcile();
  }
  private _setRows(v: number) {
    this._rows = isNaN(v) || v < 1 ? 1 : Math.floor(v);
    this._resetDividers();
    this._reconcile();
  }
  private _onName(v: string) {
    this._name = v;
    if (!this._idEdited) this._id = slugify(v);
  }

  // -- Dragging -----------------------------------------------------------

  private _svgPoint(e: PointerEvent, snap = true) {
    const svgEl = this.renderRoot.querySelector("svg") as SVGSVGElement;
    const rect = svgEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * GRID;
    const y = ((e.clientY - rect.top) / rect.height) * GRID;
    return snap ? { x: this._snap(x), y: this._snap(y) } : { x, y };
  }
  private _start(drag: Drag, e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    this._drag = drag;
    if (drag?.kind === "num") {
      this._dragClient = { x: e.clientX, y: e.clientY };
      this._hitTest(e.clientX, e.clientY);
    }
    window.addEventListener("pointermove", this._onMove);
    window.addEventListener("pointerup", this._onUp);
  }
  /** Update _hoverCell / _overTray for a client point (num drag targets). */
  private _hitTest(clientX: number, clientY: number) {
    const svgEl = this.renderRoot.querySelector("svg") as SVGSVGElement;
    const sr = svgEl.getBoundingClientRect();
    if (
      clientX >= sr.left &&
      clientX <= sr.right &&
      clientY >= sr.top &&
      clientY <= sr.bottom
    ) {
      const x = ((clientX - sr.left) / sr.width) * GRID;
      const y = ((clientY - sr.top) / sr.height) * GRID;
      this._hoverCell = this._cellAt(x, y);
      this._overTray = false;
      return;
    }
    const tray = this.renderRoot.querySelector(".tray") as HTMLElement | null;
    const tr = tray?.getBoundingClientRect();
    this._overTray = !!(
      tr &&
      clientX >= tr.left &&
      clientX <= tr.right &&
      clientY >= tr.top &&
      clientY <= tr.bottom
    );
    this._hoverCell = -1;
  }
  private _onUp = () => {
    const d = this._drag;
    if (d?.kind === "num") {
      const a = [...this._assignments];
      if (this._hoverCell >= 0) {
        if (d.fromCell >= 0) {
          [a[d.fromCell], a[this._hoverCell]] = [a[this._hoverCell], a[d.fromCell]];
        } else {
          a[this._hoverCell] = d.button; // from tray: displaces the occupant
        }
        this._assignments = a;
      } else if (this._overTray && d.fromCell >= 0) {
        a[d.fromCell] = 0; // send back to the invisible tray
        this._assignments = a;
      }
    }
    this._drag = null;
    this._dragClient = null;
    this._hoverCell = -1;
    this._overTray = false;
    window.removeEventListener("pointermove", this._onMove);
    window.removeEventListener("pointerup", this._onUp);
  };
  private _onMove = (e: PointerEvent) => {
    const d = this._drag;
    if (!d) return;
    if (d.kind === "num") {
      this._dragClient = { x: e.clientX, y: e.clientY };
      this._hitTest(e.clientX, e.clientY);
      return;
    }
    const { x, y } = this._svgPoint(e);
    const b = this._bounds;
    if (d.kind === "col") {
      const c = [...this._colLines];
      c[d.index] = Math.min(Math.max(x, b.x), b.x + b.w);
      this._colLines = c;
    } else if (d.kind === "row") {
      const r = [...this._rowLines];
      r[d.index] = Math.min(Math.max(y, b.y), b.y + b.h);
      this._rowLines = r;
    } else if (d.kind === "br") {
      let w = Math.max(2, x - b.x);
      let h = Math.max(2, y - b.y);
      if (this._shape === "round") w = h = Math.max(w, h);
      this._bounds = { ...b, w, h };
      this._clampDividers();
    } else if (d.kind === "tl") {
      const right = b.x + b.w;
      const bottom = b.y + b.h;
      let nx = Math.min(x, right - 2);
      let ny = Math.min(y, bottom - 2);
      let w = right - nx;
      let h = bottom - ny;
      if (this._shape === "round") {
        const s = Math.max(w, h);
        nx = right - s;
        ny = bottom - s;
        w = h = s;
      }
      this._bounds = { x: nx, y: ny, w, h };
      this._clampDividers();
    }
  };

  // -- Persistence --------------------------------------------------------

  private _close() {
    this.dispatchEvent(new CustomEvent("layout-closed"));
  }

  /** Translate everything so the shape is centered on the canvas (10,10). */
  private _recenterShape() {
    const b = this._bounds;
    const dx = 10 - (b.x + b.w / 2);
    const dy = 10 - (b.y + b.h / 2);
    this._bounds = { x: b.x + dx, y: b.y + dy, w: b.w, h: b.h };
    this._colLines = this._colLines.map((x) => x + dx);
    this._rowLines = this._rowLines.map((y) => y + dy);
  }

  private async _save() {
    const name = this._name.trim();
    const id = this._id.trim();
    if (!name || !id) {
      alert("Nom et id du layout requis.");
      return;
    }
    // Auto-center the shape, then emit everything in center-origin coords.
    this._recenterShape();
    const O = 10;
    const cells = this._cells();
    const assigned = cells.filter((c) => this._assignments[c.i] > 0);
    const positions = assigned.map((c) => ({
      n: this._assignments[c.i],
      x: c.cx - O,
      y: c.cy - O,
    }));
    const zones = assigned.map((c) => ({
      n: this._assignments[c.i],
      x: c.x - O,
      y: c.y - O,
      w: c.w,
      h: c.h,
    }));
    const b = this._bounds;
    const layout: SwitchLayout = {
      id,
      name,
      buttons: this._buttons,
      shape: this._shape,
      bounds: { x: b.x - O, y: b.y - O, w: b.w, h: b.h },
      columns: this._columns,
      rows: this._rows,
      colLines: this._colLines.map((x) => x - O),
      rowLines: this._rowLines.map((y) => y - O),
      assignments: this._assignments,
      positions,
      zones,
    };
    this._busy = true;
    try {
      await saveLayout(this.hass, layout);
      this._close();
    } catch (err) {
      this._busy = false;
      alert("Erreur Homex : " + errorMessage(err));
    }
  }
  private async _delete() {
    if (!this.layout) return;
    if (!confirm(`Supprimer le layout "${this.layout.name}" ?`)) return;
    this._busy = true;
    try {
      await deleteLayout(this.hass, this.layout.id);
      this._close();
    } catch (err) {
      this._busy = false;
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  // -- Render -------------------------------------------------------------

  private _renderShape() {
    const b = this._bounds;
    if (this._shape === "round") {
      return svg`<ellipse class="shape" cx=${b.x + b.w / 2} cy=${b.y + b.h / 2}
        rx=${b.w / 2} ry=${b.h / 2}></ellipse>`;
    }
    return svg`<rect class="shape" x=${b.x} y=${b.y} width=${b.w} height=${b.h}
      rx="0.4"></rect>`;
  }
  /** The contour geometry (no styling) used as the clip mask, so zones don't
   * spill outside a round shape. */
  private _shapeClip() {
    const b = this._bounds;
    if (this._shape === "round") {
      return svg`<ellipse cx=${b.x + b.w / 2} cy=${b.y + b.h / 2}
        rx=${b.w / 2} ry=${b.h / 2}></ellipse>`;
    }
    return svg`<rect x=${b.x} y=${b.y} width=${b.w} height=${b.h} rx="0.4"></rect>`;
  }

  render() {
    const b = this._bounds;
    const gridLines = Array.from({ length: GRID + 1 }, (_, i) => i);
    const cells = this._cells();
    const invisible = this._unassigned();
    const dragNum = this._drag?.kind === "num" ? this._drag : null;
    const dragCell = dragNum ? dragNum.fromCell : -1; // hide source cell badge
    const hoverCell = dragNum ? this._hoverCell : -1;
    return html`
      <div class="cols">
        <div class="form">
          ${textField("Nom", this._name, (v) => this._onName(v), "Rond 2 boutons")}
          <div class="section">Forme principale</div>
          <div class="shapes">
            <button class="shape-btn ${this._shape === "round" ? "on" : ""}"
              @click=${() => this._setShape("round")}>● Rond</button>
            <button class="shape-btn ${this._shape === "square" ? "on" : ""}"
              @click=${() => this._setShape("square")}>■ Carré</button>
            <button class="shape-btn ${this._shape === "vrect" ? "on" : ""}"
              @click=${() => this._setShape("vrect")}>▮ Rect. vertical</button>
          </div>
          <div class="fields">
            <div class="field">
              <label>Boutons</label>
              <input class="num" type="number" min="1" .value=${String(this._buttons)}
                @change=${(e: Event) =>
                  this._setButtons(Number((e.target as HTMLInputElement).value))} />
            </div>
            <div class="field">
              <label>Colonnes</label>
              <input class="num" type="number" min="1" .value=${String(this._columns)}
                @change=${(e: Event) =>
                  this._setColumns(Number((e.target as HTMLInputElement).value))} />
            </div>
            <div class="field">
              <label>Lignes</label>
              <input class="num" type="number" min="1" .value=${String(this._rows)}
                @change=${(e: Event) =>
                  this._setRows(Number((e.target as HTMLInputElement).value))} />
            </div>
          </div>
          <button class="center-btn" @click=${() => this._recenterShape()}>
            ⊕ Centrer la forme
          </button>
          <p class="hint">
            Grille aimantée 20×20. Un bouton occupe une zone (cadran) délimitée par
            les séparateurs. Glisse un chiffre pour l'assigner à un cadran (il
            s'échange avec l'occupant) ou vers la zone « Invisible » pour le
            retirer du visuel. La forme est recentrée à la sauvegarde.
          </p>
        </div>

        <div>
          <svg class="canvas" viewBox="0 0 20 20">
            <defs>
              <clipPath id="shapeclip">${this._shapeClip()}</clipPath>
            </defs>
            ${gridLines.map(
              (i) => svg`
                <line class="grid-line" x1=${i} y1="0" x2=${i} y2="20"></line>
                <line class="grid-line" x1="0" y1=${i} x2="20" y2=${i}></line>`
            )}
            ${this._renderShape()}
            ${cells.map((c) =>
              this._assignments[c.i] > 0
                ? svg`<rect class="zone" x=${c.x} y=${c.y} width=${c.w} height=${c.h}
                    clip-path="url(#shapeclip)"></rect>`
                : ""
            )}
            ${hoverCell >= 0 && hoverCell !== dragCell
              ? (() => {
                  const c = cells[hoverCell];
                  return svg`<rect class="cell-hi" x=${c.x} y=${c.y}
                    width=${c.w} height=${c.h} clip-path="url(#shapeclip)"></rect>`;
                })()
              : ""}
            ${this._colLines.map(
              (x, i) => svg`
                <line class="divider" x1=${x} y1=${b.y} x2=${x} y2=${b.y + b.h}
                  clip-path="url(#shapeclip)"></line>
                <line class="divider-hit" x1=${x} y1=${b.y} x2=${x} y2=${b.y + b.h}
                  @pointerdown=${(e: PointerEvent) => this._start({ kind: "col", index: i }, e)}></line>`
            )}
            ${this._rowLines.map(
              (y, i) => svg`
                <line class="divider" x1=${b.x} y1=${y} x2=${b.x + b.w} y2=${y}
                  clip-path="url(#shapeclip)"></line>
                <line class="divider-hit" x1=${b.x} y1=${y} x2=${b.x + b.w} y2=${y}
                  @pointerdown=${(e: PointerEvent) => this._start({ kind: "row", index: i }, e)}></line>`
            )}
            ${cells.map((c) => {
              const n = this._assignments[c.i];
              if (!n || c.i === dragCell) return "";
              return svg`
                <circle class="num-badge" cx=${c.cx} cy=${c.cy} r="1.1"
                  @pointerdown=${(e: PointerEvent) =>
                    this._start({ kind: "num", fromCell: c.i, button: n }, e)}></circle>
                <text class="num-text" x=${c.cx} y=${c.cy}>${n}</text>`;
            })}
            <rect class="handle" x=${b.x - 0.35} y=${b.y - 0.35} width="0.7" height="0.7"
              @pointerdown=${(e: PointerEvent) => this._start({ kind: "tl" }, e)}></rect>
            <rect class="handle" x=${b.x + b.w - 0.35} y=${b.y + b.h - 0.35} width="0.7" height="0.7"
              @pointerdown=${(e: PointerEvent) => this._start({ kind: "br" }, e)}></rect>
          </svg>

          <div class="tray ${dragNum && this._overTray ? "over" : ""}">
            <span class="tray-label">Invisible</span>
            ${invisible.length
              ? invisible.map(
                  (n) => html`<span
                    class="tray-badge"
                    @pointerdown=${(e: PointerEvent) =>
                      this._start({ kind: "num", fromCell: -1, button: n }, e)}
                    >${n}</span
                  >`
                )
              : html`<span class="tray-empty">
                  Glisse un bouton ici pour le rendre invisible
                </span>`}
          </div>
        </div>
      </div>

      ${dragNum && this._dragClient
        ? html`<div
            class="floating"
            style="left:${this._dragClient.x}px; top:${this._dragClient.y}px"
          >
            ${dragNum.button}
          </div>`
        : ""}

      <div class="actions">
        ${this.layout
          ? html`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>`
          : ""}
        <button @click=${this._close}>Annuler</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._save}>
          ${this.layout ? "Enregistrer" : "Créer le layout"}
        </button>
      </div>
    `;
  }
}
