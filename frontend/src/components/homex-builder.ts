import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, Plan, PlanLevel, PlanPoint, PlanShape, Room } from "../types";
import { errorMessage, fetchPlan, fetchRooms, savePlan } from "../api";
import { sharedStyles } from "../lib/styles";
import { t, locale } from "../lib/i18n";
import {
  GRID,
  areaM2,
  bounds,
  centroid,
  edgesOf,
  formatLength,
  pointInPolygon,
  roundTo,
  segLength,
  snapPoint,
  uid,
  type SnapContext,
  type SnapResult,
} from "../lib/plan-geometry";

type Tool = "select" | "draw" | "rect";

interface View {
  tx: number; // screen offset of the world origin, px
  ty: number;
  k: number; // px per cm
}

type Drag =
  | { mode: "pan"; sx: number; sy: number; tx: number; ty: number }
  | { mode: "vertex"; shape: PlanShape; index: number }
  | { mode: "move"; shape: PlanShape; start: PlanPoint; orig: PlanPoint[] }
  | { mode: "rect"; start: PlanPoint };

const SNAP_PX = 12;
const MIN_K = 0.05;
const MAX_K = 4;
const UNDO_MAX = 60;

/**
 * 3D Builder (2D first): draw each level's rooms on a 50 cm grid, with
 * magnetic snapping, and map them to Homex rooms by drag and drop. The level
 * below (or above, for the lowest level) shows through to trace over.
 */
@customElement("homex-builder")
export class HomexBuilder extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;

  @state() private _plan: Plan | null = null;
  @state() private _rooms: Room[] = [];
  @state() private _error = "";
  @state() private _levelIdx = 0;
  @state() private _tool: Tool = "select";
  @state() private _selected: string | null = null;
  @state() private _draft: PlanPoint[] = [];
  @state() private _hover: SnapResult | null = null;
  @state() private _rect: [PlanPoint, PlanPoint] | null = null;
  @state() private _view: View = { tx: 0, ty: 0, k: 0.5 };
  @state() private _size = { w: 800, h: 600 };
  @state() private _saving: "idle" | "saving" | "saved" | "error" = "idle";
  @state() private _dropTarget: string | null = null;
  @state() private _dragOver = false;

  private _undo: string[] = [];
  private _redo: string[] = [];
  private _drag: Drag | null = null;
  private _saveTimer?: number;
  private _ro?: ResizeObserver;
  private _fitted = false;
  private _space = false;
  private _alt = false;

  // -- Lifecycle ----------------------------------------------------------------

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
    window.addEventListener("keyup", this._onKeyUp);
    this._load();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
    window.removeEventListener("keyup", this._onKeyUp);
    this._ro?.disconnect();
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._save();
    }
  }

  private async _load() {
    try {
      const [plan, rooms] = await Promise.all([fetchPlan(this.hass), fetchRooms(this.hass)]);
      this._plan = plan;
      this._rooms = rooms;
      this._levelIdx = Math.min(this._levelIdx, Math.max(0, plan.levels.length - 1));
    } catch (err) {
      this._error = errorMessage(err);
    }
  }

  updated() {
    const stage = this.renderRoot.querySelector(".stage") as HTMLElement | null;
    if (stage && !this._ro) {
      this._ro = new ResizeObserver(() => {
        const r = stage.getBoundingClientRect();
        this._size = { w: r.width, h: r.height };
        if (!this._fitted) {
          this._fitted = true;
          this._fit();
        }
      });
      this._ro.observe(stage);
    }
    if (!stage && this._ro) {
      this._ro.disconnect();
      this._ro = undefined;
      this._fitted = false;
    }
  }

  // -- Plan state -----------------------------------------------------------------

  private get _level(): PlanLevel | null {
    return this._plan?.levels[this._levelIdx] ?? null;
  }

  /** The level that shows through: below, else above. */
  private get _ghost(): PlanLevel | null {
    const levels = this._plan?.levels ?? [];
    return levels[this._levelIdx - 1] ?? levels[this._levelIdx + 1] ?? null;
  }

  private get _ghostIsAbove(): boolean {
    return !this._plan?.levels[this._levelIdx - 1] && !!this._plan?.levels[this._levelIdx + 1];
  }

  private _snapshot() {
    if (!this._plan) return;
    this._undo.push(JSON.stringify(this._plan));
    if (this._undo.length > UNDO_MAX) this._undo.shift();
    this._redo = [];
  }

  /** Apply a change: undoable, saved shortly after. */
  private _commit(change: (plan: Plan) => void) {
    if (!this._plan) return;
    this._snapshot();
    change(this._plan);
    this._changed();
  }

  private _changed() {
    this._plan = { ...this._plan! };
    this._scheduleSave();
  }

  private _undoAction() {
    const prev = this._undo.pop();
    if (!prev || !this._plan) return;
    this._redo.push(JSON.stringify(this._plan));
    this._plan = JSON.parse(prev);
    this._afterHistory();
  }

  private _redoAction() {
    const next = this._redo.pop();
    if (!next || !this._plan) return;
    this._undo.push(JSON.stringify(this._plan));
    this._plan = JSON.parse(next);
    this._afterHistory();
  }

  private _afterHistory() {
    this._levelIdx = Math.min(this._levelIdx, Math.max(0, this._plan!.levels.length - 1));
    if (this._selected && !this._level?.rooms.some((s) => s.id === this._selected)) this._selected = null;
    this._scheduleSave();
  }

  private _scheduleSave() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saving = "saving";
    this._saveTimer = window.setTimeout(() => this._save(), 700);
  }

  private async _save() {
    this._saveTimer = undefined;
    if (!this._plan) return;
    try {
      await savePlan(this.hass, this._plan);
      this._saving = "saved";
    } catch (err) {
      this._saving = "error";
      this._error = errorMessage(err);
    }
  }

  // -- Levels -------------------------------------------------------------------------

  private _floors(): { floor_id: string; name: string; level: number | null }[] {
    return Object.values((this.hass.floors ?? {}) as Record<string, any>)
      .map((f) => ({ floor_id: f.floor_id, name: f.name, level: f.level ?? null }))
      .sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
  }

  /** The HA floor a new level probably is: next one up / down, unused. */
  private _guessFloor(where: "above" | "below" | "base") {
    const floors = this._floors();
    const used = new Set((this._plan?.levels ?? []).map((l) => l.floor_id).filter(Boolean));
    const free = floors.filter((f) => !used.has(f.floor_id));
    if (where === "base") return free.find((f) => f.level === 0) ?? free[0] ?? null;
    const levels = this._plan?.levels ?? [];
    const edge = where === "above" ? levels[levels.length - 1] : levels[0];
    const ref = floors.find((f) => f.floor_id === edge?.floor_id)?.level;
    if (ref === null || ref === undefined) return null;
    return where === "above"
      ? free.find((f) => (f.level ?? 0) > ref) ?? null
      : [...free].reverse().find((f) => (f.level ?? 0) < ref) ?? null;
  }

  private _addLevel(where: "above" | "below" | "base") {
    const floor = this._guessFloor(where);
    const levels = this._plan?.levels ?? [];
    const level: PlanLevel = {
      id: uid("l"),
      name:
        floor?.name ??
        (where === "base"
          ? t("builder.level_base")
          : t("builder.level_n", { n: where === "above" ? levels.length : -1 })),
      floor_id: floor?.floor_id ?? null,
      rooms: [],
    };
    if (!this._plan) this._plan = { levels: [] };
    this._commit((plan) => {
      if (where === "below") plan.levels.unshift(level);
      else plan.levels.push(level);
    });
    this._levelIdx = where === "below" ? 0 : this._plan!.levels.length - 1;
    this._selected = null;
    this._draft = [];
    this._tool = "draw";
  }

  private _goLevel(idx: number) {
    this._levelIdx = idx;
    this._selected = null;
    this._draft = [];
    this._rect = null;
  }

  private _deleteLevel() {
    const level = this._level;
    if (!level) return;
    if (level.rooms.length && !confirm(t("builder.level_delete_confirm", { name: level.name }))) return;
    this._commit((plan) => plan.levels.splice(this._levelIdx, 1));
    this._levelIdx = Math.max(0, this._levelIdx - 1);
    this._selected = null;
  }

  // -- Coordinates & snapping ---------------------------------------------------------

  private _svgRect(): DOMRect {
    return (this.renderRoot.querySelector("svg.canvas") as SVGSVGElement).getBoundingClientRect();
  }

  private _toWorld(e: { clientX: number; clientY: number }): PlanPoint {
    const r = this._svgRect();
    const { tx, ty, k } = this._view;
    return [(e.clientX - r.left - tx) / k, (e.clientY - r.top - ty) / k];
  }

  private _snapCtx(exclude?: { shape: string; index?: number }): SnapContext {
    const vertices: PlanPoint[] = [];
    const edges: [PlanPoint, PlanPoint][] = [];
    for (const s of this._level?.rooms ?? []) {
      if (exclude && s.id === exclude.shape && exclude.index === undefined) continue;
      s.points.forEach((p, i) => {
        if (exclude && s.id === exclude.shape && i === exclude.index) return;
        vertices.push(p);
      });
      const pts =
        exclude && s.id === exclude.shape && exclude.index !== undefined
          ? s.points.filter((_, i) => i !== exclude.index)
          : s.points;
      if (!(exclude && s.id === exclude.shape)) edges.push(...edgesOf(pts));
    }
    for (const s of this._ghost?.rooms ?? []) {
      vertices.push(...s.points);
      edges.push(...edgesOf(s.points));
    }
    vertices.push(...this._draft);
    for (let i = 1; i < this._draft.length; i++) edges.push([this._draft[i - 1], this._draft[i]]);
    const anchors: PlanPoint[] = [];
    if (this._draft.length) {
      anchors.push(this._draft[this._draft.length - 1]);
      // Closing wall: straight back to the first corner too.
      if (this._draft.length >= 2) anchors.push(this._draft[0]);
    } else if (exclude?.index !== undefined) {
      const shape = this._level?.rooms.find((s) => s.id === exclude.shape);
      if (shape) {
        const n = shape.points.length;
        anchors.push(shape.points[(exclude.index + n - 1) % n], shape.points[(exclude.index + 1) % n]);
      }
    }
    return { vertices, edges, anchors, tolerance: SNAP_PX / this._view.k };
  }

  private _snap(raw: PlanPoint, exclude?: { shape: string; index?: number }): SnapResult {
    if (this._alt) return { p: [Math.round(raw[0]), Math.round(raw[1])], kind: "free" };
    return snapPoint(raw, this._snapCtx(exclude));
  }

  // -- View ---------------------------------------------------------------------------

  private _fit() {
    const pts = [...(this._level?.rooms ?? []), ...(this._ghost?.rooms ?? [])].flatMap((s) => s.points);
    const b = bounds(pts);
    const { w, h } = this._size;
    if (!b) {
      const k = 0.5;
      this._view = { k, tx: w / 2, ty: h / 2 };
      return;
    }
    const pad = 60;
    const k = Math.max(
      MIN_K,
      Math.min(MAX_K, Math.min((w - 2 * pad) / Math.max(b.maxX - b.minX, 200), (h - 2 * pad) / Math.max(b.maxY - b.minY, 200)))
    );
    this._view = {
      k,
      tx: w / 2 - ((b.minX + b.maxX) / 2) * k,
      ty: h / 2 - ((b.minY + b.maxY) / 2) * k,
    };
  }

  private _zoom(factor: number, cx = this._size.w / 2, cy = this._size.h / 2) {
    const { tx, ty, k } = this._view;
    const nk = Math.max(MIN_K, Math.min(MAX_K, k * factor));
    this._view = { k: nk, tx: cx - ((cx - tx) * nk) / k, ty: cy - ((cy - ty) * nk) / k };
  }

  private _onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const r = this._svgRect();
    if (e.ctrlKey || Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
      this._zoom(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX - r.left, e.clientY - r.top);
    } else {
      this._view = { ...this._view, tx: this._view.tx - e.deltaX, ty: this._view.ty - e.deltaY };
    }
  };

  // -- Pointer interactions -------------------------------------------------------------

  private _onPointerDown = (e: PointerEvent) => {
    if (!this._level) return;
    const target = e.target as Element;
    const svgEl = e.currentTarget as SVGSVGElement;
    const raw = this._toWorld(e);
    const startPan = () => {
      this._drag = { mode: "pan", sx: e.clientX, sy: e.clientY, tx: this._view.tx, ty: this._view.ty };
      svgEl.setPointerCapture(e.pointerId);
    };
    if (e.button === 1 || e.button === 2 || this._space) {
      e.preventDefault();
      startPan();
      return;
    }
    if (e.button !== 0) return;

    if (this._tool === "draw") {
      const s = this._snap(raw);
      const first = this._draft[0];
      if (this._draft.length >= 3 && first && s.p[0] === first[0] && s.p[1] === first[1]) {
        this._closeDraft();
        return;
      }
      const last = this._draft[this._draft.length - 1];
      if (!last || last[0] !== s.p[0] || last[1] !== s.p[1]) this._draft = [...this._draft, s.p];
      return;
    }
    if (this._tool === "rect") {
      const s = this._snap(raw);
      this._drag = { mode: "rect", start: s.p };
      this._rect = [s.p, s.p];
      svgEl.setPointerCapture(e.pointerId);
      return;
    }

    // Select tool.
    const el = target.closest("[data-kind]") as SVGElement | null;
    const kind = el?.dataset.kind;
    const shape = this._level.rooms.find((s) => s.id === el?.dataset.shape);
    if (kind === "vertex" && shape) {
      this._snapshot();
      this._drag = { mode: "vertex", shape, index: Number(el!.dataset.index) };
      svgEl.setPointerCapture(e.pointerId);
      return;
    }
    if (kind === "mid" && shape) {
      this._snapshot();
      const index = Number(el!.dataset.index) + 1;
      const a = shape.points[index - 1];
      const b = shape.points[index % shape.points.length];
      shape.points.splice(index, 0, [roundTo((a[0] + b[0]) / 2, 1), roundTo((a[1] + b[1]) / 2, 1)]);
      this._drag = { mode: "vertex", shape, index };
      svgEl.setPointerCapture(e.pointerId);
      this.requestUpdate();
      return;
    }
    if (kind === "shape" && shape) {
      this._selected = shape.id;
      this._snapshot();
      this._drag = { mode: "move", shape, start: raw, orig: shape.points.map((p) => [...p] as PlanPoint) };
      svgEl.setPointerCapture(e.pointerId);
      return;
    }
    this._selected = null;
    startPan();
  };

  private _onPointerMove = (e: PointerEvent) => {
    if (!this._level) return;
    this._alt = e.altKey;
    const raw = this._toWorld(e);
    const d = this._drag;
    if (!d) {
      this._hover = this._tool === "select" ? null : this._snap(raw);
      return;
    }
    if (d.mode === "pan") {
      this._view = { ...this._view, tx: d.tx + e.clientX - d.sx, ty: d.ty + e.clientY - d.sy };
      return;
    }
    if (d.mode === "rect") {
      const s = this._snap(raw);
      this._hover = s;
      this._rect = [d.start, s.p];
      return;
    }
    if (d.mode === "vertex") {
      const s = this._snap(raw, { shape: d.shape.id, index: d.index });
      this._hover = s;
      d.shape.points[d.index] = s.p;
      this.requestUpdate();
      return;
    }
    if (d.mode === "move") {
      let dx = raw[0] - d.start[0];
      let dy = raw[1] - d.start[1];
      if (!this._alt) {
        // Magnet: a vertex of the moved room onto another room's vertex,
        // else keep the room on the grid.
        const ctx = this._snapCtx({ shape: d.shape.id });
        let best: [number, number] | null = null;
        let bestD = ctx.tolerance;
        for (const p of d.orig) {
          const q: PlanPoint = [p[0] + dx, p[1] + dy];
          for (const v of ctx.vertices) {
            const dist = Math.hypot(q[0] - v[0], q[1] - v[1]);
            if (dist <= bestD) {
              bestD = dist;
              best = [v[0] - p[0], v[1] - p[1]];
            }
          }
        }
        if (best) [dx, dy] = best;
        else {
          const o = d.orig[0];
          dx = roundTo(o[0] + dx, GRID) - o[0];
          dy = roundTo(o[1] + dy, GRID) - o[1];
        }
      }
      d.shape.points = d.orig.map((p) => [p[0] + dx, p[1] + dy] as PlanPoint);
      this.requestUpdate();
    }
  };

  private _onPointerUp = () => {
    const d = this._drag;
    this._drag = null;
    if (!d) return;
    if (d.mode === "rect" && this._rect) {
      const [[x1, y1], [x2, y2]] = this._rect;
      this._rect = null;
      if (Math.abs(x2 - x1) >= GRID / 2 && Math.abs(y2 - y1) >= GRID / 2) {
        this._addShape([
          [x1, y1],
          [x2, y1],
          [x2, y2],
          [x1, y2],
        ]);
      }
      return;
    }
    if (d.mode === "vertex" || d.mode === "move") {
      this._hover = null;
      if (d.mode === "vertex") this._dedupe(d.shape);
      this._changed();
    }
  };

  private _onDblClick = (e: MouseEvent) => {
    if (this._tool === "draw") {
      // Only a double-click on the last corner closes (two quick clicks on
      // different spots are two corners).
      const last = this._draft[this._draft.length - 1];
      const p = this._snap(this._toWorld(e)).p;
      if (last && Math.hypot(p[0] - last[0], p[1] - last[1]) < 1) this._closeDraft();
      return;
    }
    const el = (e.target as Element).closest("[data-kind='vertex']") as SVGElement | null;
    const shape = this._level?.rooms.find((s) => s.id === el?.dataset.shape);
    if (el && shape && shape.points.length > 3) {
      this._commit(() => shape.points.splice(Number(el.dataset.index), 1));
    }
  };

  /** Drop consecutive duplicate vertices (a vertex dragged onto its neighbour). */
  private _dedupe(shape: PlanShape) {
    const pts = shape.points.filter((p, i, a) => {
      const n = a[(i + 1) % a.length];
      return a.length <= 3 || p[0] !== n[0] || p[1] !== n[1];
    });
    if (pts.length >= 3) shape.points = pts;
  }

  private _closeDraft() {
    const pts = this._draft;
    this._draft = [];
    this._hover = null;
    if (pts.length >= 3 && areaM2(pts) > 0) this._addShape(pts);
  }

  private _addShape(points: PlanPoint[], roomId: string | null = null): PlanShape {
    const level = this._level!;
    const n = level.rooms.filter((s) => !s.room_id).length + 1;
    const room = roomId ? this._rooms.find((r) => r.room_id === roomId) : undefined;
    const shape: PlanShape = {
      id: uid("s"),
      room_id: roomId,
      name: room?.name ?? t("builder.room_n", { n }),
      points,
    };
    this._commit(() => {
      if (roomId) this._unmapElsewhere(level, roomId);
      level.rooms.push(shape);
    });
    this._selected = shape.id;
    return shape;
  }

  /** A Homex room maps to one outline per level. */
  private _unmapElsewhere(level: PlanLevel, roomId: string, keep?: string) {
    for (const s of level.rooms) if (s.room_id === roomId && s.id !== keep) s.room_id = null;
  }

  private _mapShape(shape: PlanShape, roomId: string | null) {
    const room = roomId ? this._rooms.find((r) => r.room_id === roomId) : undefined;
    this._commit(() => {
      if (roomId) this._unmapElsewhere(this._level!, roomId, shape.id);
      shape.room_id = roomId;
      if (room) shape.name = room.name;
    });
  }

  private _deleteShape(id: string) {
    const level = this._level;
    if (!level) return;
    this._commit(() => {
      level.rooms = level.rooms.filter((s) => s.id !== id);
    });
    if (this._selected === id) this._selected = null;
  }

  // -- Drag & drop of Homex rooms --------------------------------------------------------

  private _shapeAt(p: PlanPoint): PlanShape | undefined {
    return [...(this._level?.rooms ?? [])].reverse().find((s) => pointInPolygon(p, s.points));
  }

  private _onDragOver = (e: DragEvent) => {
    if (!e.dataTransfer?.types.includes("text/homex-room")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "link";
    this._dragOver = true;
    this._dropTarget = this._shapeAt(this._toWorld(e))?.id ?? null;
  };

  private _onDragLeave = () => {
    this._dragOver = false;
    this._dropTarget = null;
  };

  private _onDrop = (e: DragEvent) => {
    const roomId = e.dataTransfer?.getData("text/homex-room");
    this._dragOver = false;
    this._dropTarget = null;
    if (!roomId || !this._level) return;
    e.preventDefault();
    const p = this._toWorld(e);
    const shape = this._shapeAt(p);
    if (shape) {
      this._mapShape(shape, roomId);
      this._selected = shape.id;
    } else {
      // Empty spot: a 4 × 3 m room to reshape.
      const c: PlanPoint = [roundTo(p[0], GRID), roundTo(p[1], GRID)];
      this._addShape(
        [
          [c[0] - 200, c[1] - 150],
          [c[0] + 200, c[1] - 150],
          [c[0] + 200, c[1] + 150],
          [c[0] - 200, c[1] + 150],
        ],
        roomId
      );
    }
    this._tool = "select";
  };

  // -- Keyboard -----------------------------------------------------------------------

  private _onKey = (e: KeyboardEvent) => {
    const tag = (e.composedPath()[0] as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (!this._level && !(e.key === "z" && (e.metaKey || e.ctrlKey))) return;
    this._alt = e.altKey;
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) this._redoAction();
      else this._undoAction();
      return;
    }
    if (mod && e.key.toLowerCase() === "y") {
      e.preventDefault();
      this._redoAction();
      return;
    }
    if (mod) return;
    switch (e.key) {
      case " ":
        this._space = true;
        e.preventDefault();
        break;
      case "Escape":
        if (this._draft.length) this._draft = [];
        else if (this._tool !== "select") this._setTool("select");
        else this._selected = null;
        break;
      case "Enter":
        if (this._draft.length) this._closeDraft();
        break;
      case "Backspace":
      case "Delete":
        if (this._draft.length) this._draft = this._draft.slice(0, -1);
        else if (this._selected) this._deleteShape(this._selected);
        e.preventDefault();
        break;
      case "v":
        this._setTool("select");
        break;
      case "d":
      case "p":
        this._setTool("draw");
        break;
      case "r":
        this._setTool("rect");
        break;
    }
  };

  private _onKeyUp = (e: KeyboardEvent) => {
    if (e.key === " ") this._space = false;
    this._alt = e.altKey;
  };

  private _setTool(tool: Tool) {
    this._tool = tool;
    this._draft = [];
    this._rect = null;
    this._hover = null;
    if (tool !== "select") this._selected = null;
  }

  // -- Rendering ----------------------------------------------------------------------

  private _close() {
    this.dispatchEvent(new CustomEvent("close"));
  }

  private _len(cm: number) {
    return formatLength(cm, locale());
  }

  private _areaText(points: PlanPoint[]) {
    return `${areaM2(points).toLocaleString(locale(), { maximumFractionDigits: 1 })} m²`;
  }

  private _grid() {
    const { tx, ty, k } = this._view;
    const { w, h } = this._size;
    const x0 = -tx / k;
    const y0 = -ty / k;
    const x1 = (w - tx) / k;
    const y1 = (h - ty) / k;
    const minor = GRID * k >= 8 ? GRID : GRID * 2 * k >= 8 ? GRID * 2 : null;
    const major = 500;
    const lines = [];
    const step = minor ?? major;
    for (let x = Math.floor(x0 / step) * step; x <= x1; x += step) {
      lines.push(svg`<line class=${x % major === 0 ? "major" : "minor"} x1=${x} y1=${y0} x2=${x} y2=${y1}></line>`);
    }
    for (let y = Math.floor(y0 / step) * step; y <= y1; y += step) {
      lines.push(svg`<line class=${y % major === 0 ? "major" : "minor"} x1=${x0} y1=${y} x2=${x1} y2=${y}></line>`);
    }
    lines.push(svg`<circle class="origin" cx="0" cy="0" r=${3 / k}></circle>`);
    return lines;
  }

  private _label(shape: PlanShape, cls: string) {
    const [cx, cy] = centroid(shape.points);
    const k = this._view.k;
    const name = shape.room_id
      ? this._rooms.find((r) => r.room_id === shape.room_id)?.name ?? shape.name
      : shape.name;
    return svg`<g class=${cls} pointer-events="none">
      <text x=${cx} y=${cy - 3 / k} font-size=${13 / k} text-anchor="middle">${name}</text>
      <text class="sub" x=${cx} y=${cy + 13 / k} font-size=${11 / k} text-anchor="middle">${this._areaText(shape.points)}</text>
    </g>`;
  }

  private _edgeLabels(points: PlanPoint[], closed = true) {
    const k = this._view.k;
    const out = [];
    const n = closed ? points.length : points.length - 1;
    for (let i = 0; i < n; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      const len = segLength(a, b);
      if (len * k < 40) continue;
      out.push(
        svg`<text class="dim" x=${(a[0] + b[0]) / 2} y=${(a[1] + b[1]) / 2 - 5 / k} font-size=${11 / k} text-anchor="middle">${this._len(len)}</text>`
      );
    }
    return out;
  }

  private _canvas() {
    const level = this._level!;
    const ghost = this._ghost;
    const { tx, ty, k } = this._view;
    const sel = level.rooms.find((s) => s.id === this._selected);
    const pts = (p: PlanPoint[]) => p.map((q) => q.join(",")).join(" ");
    const hover = this._hover;
    const { w, h } = this._size;
    const draftLast = this._draft[this._draft.length - 1];
    return html`<svg
      class="canvas tool-${this._tool} ${this._drag?.mode === "pan" ? "panning" : ""}"
      @pointerdown=${this._onPointerDown}
      @pointermove=${this._onPointerMove}
      @pointerup=${this._onPointerUp}
      @pointercancel=${this._onPointerUp}
      @pointerleave=${() => !this._drag && (this._hover = null)}
      @dblclick=${this._onDblClick}
      @wheel=${this._onWheel}
      @contextmenu=${(e: Event) => e.preventDefault()}
    >
      <g transform="translate(${tx} ${ty}) scale(${k})">
        <g class="grid">${this._grid()}</g>
        ${ghost
          ? svg`<g class="ghost">
              ${ghost.rooms.map(
                (s) => svg`<polygon points=${pts(s.points)}></polygon>${this._label(s, "ghost-label")}`
              )}
            </g>`
          : nothing}
        <g class="shapes">
          ${level.rooms.map(
            (s) => svg`<polygon
              data-kind="shape"
              data-shape=${s.id}
              class="shape ${s.room_id ? "mapped" : "unmapped"} ${s.id === this._selected ? "selected" : ""} ${s.id === this._dropTarget ? "drop" : ""}"
              points=${pts(s.points)}
            ></polygon>`
          )}
          ${level.rooms.map((s) => this._label(s, "label"))}
        </g>
        ${sel && this._tool === "select"
          ? svg`<g class="handles">
              ${this._edgeLabels(sel.points)}
              ${edgesOf(sel.points).map(
                ([a, b], i) => svg`<rect data-kind="mid" data-shape=${sel.id} data-index=${i} class="mid"
                  x=${(a[0] + b[0]) / 2 - 4 / k} y=${(a[1] + b[1]) / 2 - 4 / k} width=${8 / k} height=${8 / k}></rect>`
              )}
              ${sel.points.map(
                (p, i) => svg`<circle data-kind="vertex" data-shape=${sel.id} data-index=${i} class="vertex"
                  cx=${p[0]} cy=${p[1]} r=${6 / k}></circle>`
              )}
            </g>`
          : nothing}
        ${this._draft.length
          ? svg`<g class="draft">
              <polyline points=${pts(hover && this._tool === "draw" ? [...this._draft, hover.p] : this._draft)}></polyline>
              ${this._edgeLabels(hover ? [...this._draft, hover.p] : this._draft, false)}
              ${this._draft.map((p, i) => svg`<circle class=${i === 0 ? "first" : ""} cx=${p[0]} cy=${p[1]} r=${(i === 0 ? 6 : 4) / k}></circle>`)}
            </g>`
          : nothing}
        ${this._rect
          ? svg`<g class="draft">
              <polygon points=${pts([
                this._rect[0],
                [this._rect[1][0], this._rect[0][1]],
                this._rect[1],
                [this._rect[0][0], this._rect[1][1]],
              ])}></polygon>
              ${this._edgeLabels(
                [this._rect[0], [this._rect[1][0], this._rect[0][1]], this._rect[1]],
                false
              )}
            </g>`
          : nothing}
        ${hover && (this._tool !== "select" || this._drag)
          ? svg`<g class="snap">
              ${hover.guideX !== undefined
                ? svg`<line class="guide" x1=${hover.guideX} y1=${-ty / k} x2=${hover.guideX} y2=${(h - ty) / k}></line>`
                : nothing}
              ${hover.guideY !== undefined
                ? svg`<line class="guide" x1=${-tx / k} y1=${hover.guideY} x2=${(w - tx) / k} y2=${hover.guideY}></line>`
                : nothing}
              <circle class="snap-${hover.kind}" cx=${hover.p[0]} cy=${hover.p[1]} r=${5 / k}></circle>
            </g>`
          : nothing}
        ${draftLast && hover && this._tool === "draw"
          ? svg`<text class="dim live" x=${hover.p[0] + 10 / k} y=${hover.p[1] - 10 / k} font-size=${12 / k}>${this._len(
              segLength(draftLast, hover.p)
            )}</text>`
          : nothing}
      </g>
    </svg>`;
  }

  private _toolbar() {
    const tool = (id: Tool, icon: string, key: string) => html`<button
      class="tool ${this._tool === id ? "active" : ""}"
      title="${t(`builder.tool_${id}`)} (${key})"
      @click=${() => this._setTool(id)}
    >
      ${icon} <span>${t(`builder.tool_${id}`)}</span>
    </button>`;
    const levels = this._plan!.levels;
    const top = this._levelIdx === levels.length - 1;
    return html`<div class="toolbar">
      ${tool("select", "🖐", "V")} ${tool("draw", "✏️", "D")} ${tool("rect", "▭", "R")}
      <span class="sep"></span>
      <button title=${t("builder.undo")} ?disabled=${!this._undo.length} @click=${() => this._undoAction()}>↶</button>
      <button title=${t("builder.redo")} ?disabled=${!this._redo.length} @click=${() => this._redoAction()}>↷</button>
      <span class="sep"></span>
      <button title=${t("builder.zoom_out")} @click=${() => this._zoom(1 / 1.25)}>−</button>
      <button title=${t("builder.zoom_in")} @click=${() => this._zoom(1.25)}>＋</button>
      <button title=${t("builder.fit")} @click=${() => this._fit()}>⤢</button>
      <span class="grow"></span>
      <button
        class="next"
        @click=${() => (top ? this._addLevel("above") : this._goLevel(this._levelIdx + 1))}
      >
        ${top ? t("builder.next_level_new") : t("builder.next_level")} ↑
      </button>
    </div>`;
  }

  private _hint() {
    if (this._tool === "draw")
      return this._draft.length >= 3 ? t("builder.hint_draw_close") : t("builder.hint_draw");
    if (this._tool === "rect") return t("builder.hint_rect");
    if (this._selected) return t("builder.hint_selected");
    return this._level?.rooms.length ? t("builder.hint_select") : t("builder.hint_empty");
  }

  private _levelsPanel() {
    const levels = this._plan!.levels;
    const level = this._level!;
    const floors = this._floors();
    return html`<section>
      <h3>${t("builder.levels")}</h3>
      <button class="add" @click=${() => this._addLevel("above")}>＋ ${t("builder.add_above")}</button>
      <div class="levels">
        ${[...levels.keys()].reverse().map(
          (i) => html`<button class="level ${i === this._levelIdx ? "active" : ""}" @click=${() => this._goLevel(i)}>
            <span>${levels[i].name || t("builder.level_unnamed")}</span>
            <span class="count">${levels[i].rooms.length}</span>
          </button>`
        )}
      </div>
      <button class="add" @click=${() => this._addLevel("below")}>＋ ${t("builder.add_below")}</button>
      <label class="field">
        <span>${t("builder.level_name")}</span>
        <input
          .value=${level.name}
          @change=${(e: Event) => this._commit(() => (level.name = (e.target as HTMLInputElement).value))}
        />
      </label>
      <label class="field">
        <span>${t("builder.level_floor")}</span>
        <select
          @change=${(e: Event) =>
            this._commit(() => (level.floor_id = (e.target as HTMLSelectElement).value || null))}
        >
          <option value="" ?selected=${!level.floor_id}>${t("builder.level_floor_none")}</option>
          ${floors.map(
            (f) => html`<option value=${f.floor_id} ?selected=${f.floor_id === level.floor_id}>${f.name}</option>`
          )}
        </select>
      </label>
      <button class="danger-link" @click=${() => this._deleteLevel()}>${t("builder.level_delete")}</button>
    </section>`;
  }

  private _roomsPanel() {
    const level = this._level!;
    const levels = this._plan!.levels;
    const floorOf = (r: Room) => (r.area_id ? this.hass.areas?.[r.area_id]?.floor_id : null) ?? null;
    const placedOn = (r: Room) => levels.filter((l) => l.rooms.some((s) => s.room_id === r.room_id));
    const rooms = [...this._rooms].sort((a, b) => {
      const fa = level.floor_id && floorOf(a) === level.floor_id ? 0 : 1;
      const fb = level.floor_id && floorOf(b) === level.floor_id ? 0 : 1;
      return fa - fb || a.name.localeCompare(b.name);
    });
    return html`<section>
      <h3>${t("builder.rooms")}</h3>
      <p class="hint">${t("builder.rooms_hint")}</p>
      <div class="chips">
        ${rooms.map((r) => {
          const on = placedOn(r);
          const here = on.includes(level);
          const other = on.filter((l) => l !== level).map((l) => l.name);
          return html`<div
            class="chip ${here ? "placed" : ""} ${level.floor_id && floorOf(r) === level.floor_id ? "floor" : ""}"
            draggable="true"
            title=${other.length ? t("builder.room_on", { levels: other.join(", ") }) : ""}
            @dragstart=${(e: DragEvent) => {
              e.dataTransfer?.setData("text/homex-room", r.room_id);
              e.dataTransfer!.effectAllowed = "link";
            }}
          >
            <span>${here ? "✓ " : ""}${r.name}</span>
            ${other.length ? html`<span class="on">${other.join(", ")}</span>` : nothing}
          </div>`;
        })}
        ${rooms.length ? nothing : html`<p class="hint">${t("builder.no_rooms")}</p>`}
      </div>
    </section>`;
  }

  private _selectionPanel() {
    const shape = this._level?.rooms.find((s) => s.id === this._selected);
    if (!shape) return nothing;
    const perimeter = edgesOf(shape.points).reduce((s, [a, b]) => s + segLength(a, b), 0);
    return html`<section class="selection">
      <h3>${t("builder.selection")}</h3>
      <label class="field">
        <span>${t("builder.mapped_room")}</span>
        <select @change=${(e: Event) => this._mapShape(shape, (e.target as HTMLSelectElement).value || null)}>
          <option value="" ?selected=${!shape.room_id}>${t("builder.unmapped")}</option>
          ${this._rooms.map(
            (r) => html`<option value=${r.room_id} ?selected=${r.room_id === shape.room_id}>${r.name}</option>`
          )}
        </select>
      </label>
      ${shape.room_id
        ? nothing
        : html`<label class="field">
            <span>${t("builder.shape_name")}</span>
            <input
              .value=${shape.name}
              @change=${(e: Event) => this._commit(() => (shape.name = (e.target as HTMLInputElement).value))}
            />
          </label>`}
      <p class="stats">
        ${t("builder.area")} <strong>${this._areaText(shape.points)}</strong> · ${t("builder.perimeter")}
        <strong>${this._len(perimeter)}</strong>
      </p>
      <button class="danger-link" @click=${() => this._deleteShape(shape.id)}>${t("builder.shape_delete")}</button>
    </section>`;
  }

  render() {
    const saving = {
      idle: "",
      saving: t("builder.saving"),
      saved: t("builder.saved"),
      error: t("builder.save_error"),
    }[this._saving];
    return html`
      <div class="head">
        <button class="back" title=${t("builder.back")} @click=${this._close}>←</button>
        <h2>3D Builder</h2>
        <span class="status ${this._saving}">${saving}</span>
      </div>
      ${this._error ? html`<p class="err">${this._error}</p>` : nothing}
      ${!this._plan
        ? html`<p class="hint">${t("common.loading")}</p>`
        : !this._plan.levels.length
          ? html`<div class="empty">
              <div class="empty-icon">🏠</div>
              <h3>${t("builder.empty_title")}</h3>
              <p>${t("builder.empty_text")}</p>
              <button class="primary" @click=${() => this._addLevel("base")}>${t("builder.create_base")}</button>
            </div>`
          : html`<div class="body">
              <aside>${this._levelsPanel()} ${this._selectionPanel()} ${this._roomsPanel()}</aside>
              <div class="main">
                ${this._toolbar()}
                <div
                  class="stage ${this._dragOver ? "dragover" : ""}"
                  @dragover=${this._onDragOver}
                  @dragleave=${this._onDragLeave}
                  @drop=${this._onDrop}
                >
                  ${this._canvas()}
                  ${this._ghost
                    ? html`<div class="ghost-tag">
                        ${this._ghostIsAbove ? "↑" : "↓"} ${this._ghost.name}
                      </div>`
                    : nothing}
                  <div class="scale">${t("builder.grid", { size: "50 cm" })}</div>
                </div>
                <p class="hint">${this._hint()}</p>
              </div>
            </div>`}
    `;
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .head h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
      .status {
        margin-left: auto;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .status.error {
        color: var(--error-color, #db4437);
      }
      button {
        cursor: pointer;
        border: none;
        border-radius: 8px;
        padding: 7px 11px;
        background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
        color: var(--primary-text-color);
        font: inherit;
        font-size: 13px;
      }
      button:disabled {
        opacity: 0.4;
        cursor: default;
      }
      button.primary {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .err {
        color: var(--error-color, #db4437);
      }
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 6px 0;
      }
      .empty {
        text-align: center;
        padding: 48px 16px;
        border: 1px dashed var(--divider-color, rgba(127, 127, 127, 0.4));
        border-radius: 16px;
      }
      .empty-icon {
        font-size: 44px;
      }
      .empty p {
        max-width: 520px;
        margin: 8px auto 18px;
        color: var(--secondary-text-color);
        line-height: 1.5;
      }
      .body {
        display: grid;
        grid-template-columns: 250px minmax(0, 1fr);
        gap: 14px;
        align-items: start;
      }
      aside {
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-height: calc(100vh - 130px);
        overflow: auto;
      }
      section {
        padding: 12px;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
        border-radius: 12px;
        background: var(--card-background-color);
      }
      section h3 {
        margin: 0 0 8px;
        font-size: 14px;
        font-weight: 600;
      }
      .levels {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin: 6px 0;
      }
      .level {
        display: flex;
        justify-content: space-between;
        text-align: left;
        background: transparent;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      }
      .level.active {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 14%, transparent);
        font-weight: 600;
      }
      .count {
        color: var(--secondary-text-color);
        font-weight: 400;
      }
      button.add {
        width: 100%;
        background: transparent;
        color: var(--primary-color);
        text-align: left;
        padding: 5px 4px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 10px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .field input,
      .field select {
        font: inherit;
        font-size: 14px;
        padding: 7px 8px;
        border-radius: 8px;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
        background: var(--secondary-background-color, transparent);
        color: var(--primary-text-color);
      }
      button.danger-link {
        margin-top: 10px;
        background: transparent;
        padding: 4px 0;
        color: var(--error-color, #db4437);
      }
      .stats {
        font-size: 13px;
        margin: 10px 0 0;
      }
      .chips {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .chip {
        padding: 7px 10px;
        border-radius: 8px;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
        cursor: grab;
        font-size: 13px;
        display: flex;
        justify-content: space-between;
        gap: 6px;
        user-select: none;
      }
      .chip.floor {
        border-color: color-mix(in srgb, var(--primary-color) 60%, transparent);
      }
      .chip.placed {
        opacity: 0.55;
      }
      .chip .on {
        font-size: 11px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .main {
        min-width: 0;
      }
      .toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
      }
      .tool.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .sep {
        width: 1px;
        height: 22px;
        background: var(--divider-color, rgba(127, 127, 127, 0.4));
        margin: 0 2px;
      }
      .grow {
        flex: 1;
      }
      button.next {
        border: 1px solid var(--primary-color);
        background: transparent;
        color: var(--primary-color);
      }
      .stage {
        position: relative;
        height: calc(100vh - 210px);
        min-height: 360px;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
        background: var(--card-background-color, #1c1c1c);
      }
      .stage.dragover {
        border-color: var(--primary-color);
      }
      svg.canvas {
        width: 100%;
        height: 100%;
        display: block;
        touch-action: none;
        user-select: none;
      }
      svg.tool-draw,
      svg.tool-rect {
        cursor: crosshair;
      }
      svg.panning {
        cursor: grabbing;
      }
      .grid line {
        stroke: var(--secondary-text-color);
        vector-effect: non-scaling-stroke;
      }
      .grid .minor {
        stroke-opacity: 0.12;
        stroke-width: 1;
      }
      .grid .major {
        stroke-opacity: 0.3;
        stroke-width: 1;
      }
      .grid .origin {
        fill: var(--secondary-text-color);
        opacity: 0.5;
      }
      .ghost polygon {
        fill: var(--secondary-text-color);
        fill-opacity: 0.06;
        stroke: var(--secondary-text-color);
        stroke-opacity: 0.55;
        stroke-width: 1.5;
        stroke-dasharray: 6 4;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .ghost-label text {
        fill: var(--secondary-text-color);
        opacity: 0.5;
      }
      .shape {
        stroke-width: 2;
        vector-effect: non-scaling-stroke;
        cursor: move;
      }
      .shape.mapped {
        fill: color-mix(in srgb, var(--primary-color) 22%, transparent);
        stroke: var(--primary-color);
      }
      .shape.unmapped {
        fill: rgba(127, 127, 127, 0.18);
        stroke: var(--secondary-text-color);
        stroke-dasharray: 5 3;
      }
      .shape.selected {
        stroke: var(--accent-color, #ff9800);
        stroke-width: 3;
      }
      .shape.drop {
        fill: color-mix(in srgb, var(--accent-color, #ff9800) 35%, transparent);
      }
      .label text {
        fill: var(--primary-text-color);
        font-weight: 600;
      }
      text.sub {
        font-weight: 400 !important;
        fill: var(--secondary-text-color) !important;
      }
      text.dim {
        fill: var(--primary-text-color);
        paint-order: stroke;
        stroke: var(--card-background-color, #1c1c1c);
        stroke-width: 3px;
        pointer-events: none;
      }
      .vertex {
        fill: var(--card-background-color, #fff);
        stroke: var(--accent-color, #ff9800);
        stroke-width: 2;
        vector-effect: non-scaling-stroke;
        cursor: grab;
      }
      .mid {
        fill: var(--accent-color, #ff9800);
        opacity: 0.7;
        cursor: copy;
      }
      .draft polyline,
      .draft polygon {
        fill: color-mix(in srgb, var(--accent-color, #ff9800) 12%, transparent);
        stroke: var(--accent-color, #ff9800);
        stroke-width: 2;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .draft polyline {
        fill: none;
      }
      .draft circle {
        fill: var(--accent-color, #ff9800);
        pointer-events: none;
      }
      .draft circle.first {
        fill: none;
        stroke: var(--accent-color, #ff9800);
        stroke-width: 2;
        vector-effect: non-scaling-stroke;
      }
      .snap {
        pointer-events: none;
      }
      .guide {
        stroke: #e040fb;
        stroke-width: 1;
        stroke-dasharray: 4 4;
        vector-effect: non-scaling-stroke;
      }
      .snap circle {
        fill: none;
        stroke-width: 2;
        vector-effect: non-scaling-stroke;
        stroke: var(--secondary-text-color);
      }
      .snap .snap-vertex {
        stroke: #00c853;
      }
      .snap .snap-edge {
        stroke: #2196f3;
      }
      .snap .snap-align {
        stroke: #e040fb;
      }
      .ghost-tag,
      .scale {
        position: absolute;
        font-size: 12px;
        padding: 3px 8px;
        border-radius: 6px;
        background: color-mix(in srgb, var(--card-background-color, #1c1c1c) 85%, transparent);
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .ghost-tag {
        top: 8px;
        left: 8px;
      }
      .scale {
        bottom: 8px;
        right: 8px;
      }
      @media (max-width: 800px) {
        .body {
          grid-template-columns: 1fr;
        }
        aside {
          max-height: none;
        }
        .stage {
          height: 60vh;
        }
        .tool span {
          display: none;
        }
      }
    `,
  ];
}
