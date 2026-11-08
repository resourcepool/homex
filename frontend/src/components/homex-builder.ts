import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  HomeAssistant,
  OpeningType,
  Plan,
  PlanLevel,
  PlanOpening,
  PlanPoint,
  PlanRadiator,
  RadiatorKind,
  PlanLight,
  LightMount,
  LightType,
  ShutterType,
  StairShape,
  PlanShape,
  PlanStair,
  Room,
} from "../types";
import { RADIATOR_LENGTH } from "../types";
import { errorMessage, fetchPlan, fetchRooms, savePlan } from "../api";
import { sharedStyles } from "../lib/styles";
import { t, locale } from "../lib/i18n";
import { joinPath, navigate } from "../lib/router";
import "./homex-builder-level-dialog";
import {
  NEXT_DIR,
  OPENING_WIDTH,
  OPPOSITE_DIR,
  PREV_DIR,
  rotateDoor,
  radiatorPoints,
  snapRadiator,
  nearestWall,
  openingGeometry,
  remapInsert,
  remapRemove,
  LIGHT_TYPES,
  OPENING_STYLES,
  SHADED,
  STAIR_SHAPES,
  lightKindOf,
  lightType,
  openingStyle,
  stairDrawing,
  type WallSpot,
} from "../lib/plan-items";
import type { HaFloor } from "./homex-builder-level-dialog";
import {
  GRID,
  areaM2,
  bounds,
  centroid,
  edgesOf,
  formatLength,
  pointInPolygon,
  projectOnSegment,
  roundTo,
  segLength,
  snapPoint,
  uid,
  type SnapContext,
  type SnapResult,
} from "../lib/plan-geometry";

type Orient =
  | "left"
  | "right"
  | "up"
  | "down"
  | "wider"
  | "narrower"
  | "rotate"
  | "mirror"
  | "goes-up"
  | "goes-down";

type Tool = "select" | "draw" | "rect" | OpeningType | "stairs";
const OPENING_TOOLS: Tool[] = ["door", "sliding_door", "window", "glass_door"];
/** Openings with a direction (rotate / mirror). */
const directed = (type: OpeningType) => type === "door" || type === "sliding_door";
const isOpeningTool = (tool: Tool): tool is OpeningType => OPENING_TOOLS.includes(tool);

interface View {
  tx: number; // screen offset of the world origin, px
  ty: number;
  k: number; // px per cm
}

type Drag =
  | { mode: "pan"; sx: number; sy: number; tx: number; ty: number }
  | { mode: "vertex"; shape: PlanShape; index: number }
  | { mode: "move"; shape: PlanShape; start: PlanPoint; orig: PlanPoint[] }
  | { mode: "rect"; start: PlanPoint }
  | { mode: "opening"; o: PlanOpening }
  | { mode: "stair"; st: PlanStair; start: PlanPoint; ox: number; oy: number }
  | { mode: "radiator"; r: PlanRadiator }
  | { mode: "light-pt"; l: PlanLight; index: number }
  | { mode: "light-end"; l: PlanLight; index: number; end: 0 | 1 }
  | { mode: "light-line"; l: PlanLight; index: number; start: PlanPoint; orig: [PlanPoint, PlanPoint] };

const SNAP_PX = 12;
const ARROW: Record<PlanStair["dir"], string> = { up: "↑", down: "↓", left: "←", right: "→" };
const OPENING_SNAP_PX = 24;
const RADIATOR_SNAP_PX = 40;
const GLAZED: OpeningType[] = ["window", "glass_door", "sliding_door"];
const MIN_K = 0.05;
const MAX_K = 4;
const UNDO_MAX = 60;
/** Colour presets (frames / doors, stairs, light fixtures). */
const FRAME_COLORS = ["#f4f4f4", "#9e9e9e", "#3c4045", "#1d1d1d", "#b8864e", "#6b4423"];
const STAIR_COLORS = ["#d9b98a", "#b8864e", "#6b4423", "#f4f4f4", "#9e9e9e", "#1d1d1d"];
const LIGHT_COLORS = ["#f4f4f4", "#1d1d1d", "#c9a227", "#b87333", "#b8864e", "#9e9e9e"];

type OpeningOpts = { width: number; flip: boolean; out: boolean; style?: string; color?: string };

/**
 * 3D Builder (2D first): draw each level's rooms on a 50 cm grid, with
 * magnetic snapping, and map them to Homex rooms by drag and drop. The level
 * below (or above, for the lowest level) shows through to trace over.
 */
@customElement("homex-builder")
export class HomexBuilder extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  /** Pages: <base>/structure, <base>/fixtures, <base>/render (the tabs). */
  @property({ attribute: false }) base = "/homex/builder";
  @property({ attribute: false }) subpath = "";

  @state() private _plan: Plan | null = null;
  @state() private _rooms: Room[] = [];
  @state() private _error = "";
  @state() private _levelId: string | null = null;
  @state() private _dialog: { mode: "new" | "edit"; suggested: number } | null = null;
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
  /** Opening tools: where the opening would go. */
  @state() private _wallHover: WallSpot | null = null;
  /** Settings of the next door / window / glass door / stairs placed. */
  @state() private _openingOpts: Record<OpeningType, OpeningOpts> = {
    door: { width: OPENING_WIDTH.door, flip: false, out: false },
    window: { width: OPENING_WIDTH.window, flip: false, out: false },
    glass_door: { width: OPENING_WIDTH.glass_door, flip: false, out: false },
    sliding_door: { width: OPENING_WIDTH.sliding_door, flip: false, out: false },
  };
  @state() private _stairDir: PlanStair["dir"] = "up";
  /** Next stairs go up to the floor above, or down to the one below. */
  @state() private _stairGoes: "up" | "down" = "up";
  /** Shape, turn and colour of the next stairs. */
  @state() private _stairStyle: { shape: StairShape; turn: "left" | "right"; color?: string } = {
    shape: "straight",
    turn: "right",
  };
  /** Structure (rooms, openings, stairs) or fixtures (shutters, radiators). */
  @state() private _mode: "structure" | "fixtures" | "render" = "structure";
  /** Light being drawn: clicks add its spots / strips. */
  @state() private _placing: string | null = null;
  /** Linear light: the first end of the strip being drawn. */
  @state() private _lineStart: PlanPoint | null = null;
  /** Fixture and mount of the next light placed. */
  @state() private _lightType: LightType = "ceiling_light";
  @state() private _lightMount: LightMount = "ceiling";

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
      // Plans from before level numbers: number them bottom to top.
      plan.levels.forEach((l, i) => {
        if (typeof l.level !== "number") l.level = i;
      });
      plan.levels.sort((a, b) => a.level - b.level);
      // Lights "on furniture" became "on the floor".
      for (const l of plan.levels.flatMap((x) => x.lights ?? []))
        if ((l.mount as string) === "furniture") l.mount = "floor";
      this._plan = plan;
      this._rooms = rooms;
      if (!this._level) this._levelId = this._defaultLevel()?.id ?? null;
      if (!plan.levels.length) this._openLevelDialog("new", 0);
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

  /** Levels, by level number. */
  private get _levels(): PlanLevel[] {
    return this._plan?.levels ?? [];
  }

  private get _level(): PlanLevel | null {
    return this._levels.find((l) => l.id === this._levelId) ?? null;
  }

  /** Ground floor if any, else the lowest above it, else the highest. */
  private _defaultLevel(): PlanLevel | undefined {
    const levels = this._levels;
    return levels.find((l) => l.level >= 0) ?? levels[levels.length - 1];
  }

  /** The level that shows through: the one below, else the one above. */
  private get _ghost(): PlanLevel | null {
    const levels = this._levels;
    const i = levels.findIndex((l) => l.id === this._levelId);
    if (i < 0) return null;
    return levels[i - 1] ?? levels[i + 1] ?? null;
  }

  private get _ghostIsAbove(): boolean {
    const g = this._ghost;
    return !!g && !!this._level && g.level > this._level.level;
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
    if (!this._level) this._levelId = this._defaultLevel()?.id ?? null;
    if (this._selected && !this._selItem()) this._selected = null;
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

  private _floors(): HaFloor[] {
    return Object.values((this.hass.floors ?? {}) as Record<string, any>)
      .map((f) => ({ floor_id: f.floor_id, name: f.name, level: f.level ?? null }))
      .sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
  }

  private _openLevelDialog(mode: "new" | "edit", suggested = 0) {
    this._dialog = { mode, suggested };
  }

  /** "+" above the highest / below the lowest floor. */
  private _addLevelAt(where: "above" | "below") {
    const nums = this._levels.map((l) => l.level);
    const suggested = !nums.length ? 0 : where === "above" ? Math.max(...nums) + 1 : Math.min(...nums) - 1;
    this._openLevelDialog("new", suggested);
  }

  private _onLevelSaved(e: CustomEvent<{ floor_id: string; name: string; level: number }>) {
    const { floor_id, name, level } = e.detail;
    const editing = this._dialog?.mode === "edit" ? this._level : null;
    if (!this._plan) this._plan = { levels: [] };
    let id = editing?.id;
    this._commit((plan) => {
      if (editing) {
        Object.assign(editing, { floor_id, name, level });
      } else {
        id = uid("l");
        plan.levels.push({ id, name, level, floor_id, rooms: [] });
      }
      plan.levels.sort((a, b) => a.level - b.level);
    });
    this._dialog = null;
    if (!editing) this._goLevel(id!);
  }

  private _onLevelDeleted() {
    const level = this._level;
    this._dialog = null;
    if (!level) return;
    const next = this._ghost; // the neighbour shown through
    this._commit((plan) => {
      plan.levels = plan.levels.filter((l) => l.id !== level.id);
    });
    this._levelId = next?.id ?? this._defaultLevel()?.id ?? null;
    this._selected = null;
    if (!this._levels.length) this._openLevelDialog("new", 0);
  }

  private _goLevel(id: string) {
    if (this._placing) this._stopPlacing();
    this._levelId = id;
    this._selected = null;
    this._draft = [];
    this._rect = null;
    this._hover = null;
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
    if (isOpeningTool(this._tool)) {
      const type = this._tool;
      const opts = this._openingOpts[type];
      const spot = nearestWall(this._level, raw, OPENING_SNAP_PX / this._view.k, opts.width);
      if (!spot) return;
      const o: PlanOpening = {
        id: uid("o"),
        type,
        shape: spot.shape,
        edge: spot.edge,
        t: spot.t,
        width: opts.width,
        ...(directed(type) ? { flip: opts.flip, out: opts.out } : {}),
        ...(opts.style ? { style: opts.style } : {}),
        ...(opts.color ? { color: opts.color } : {}),
      };
      const level = this._level;
      this._commit(() => (level.openings = [...(level.openings ?? []), o]));
      return;
    }
    if (this._tool === "rect" || this._tool === "stairs") {
      const s = this._snap(raw);
      this._drag = { mode: "rect", start: s.p };
      this._rect = [s.p, s.p];
      svgEl.setPointerCapture(e.pointerId);
      return;
    }

    // Select tool.
    const el = target.closest("[data-kind]") as SVGElement | null;
    const kind = el?.dataset.kind;
    if (this._mode === "fixtures") {
      // Drawing a light: each click adds a spot, or a strip end.
      const placing = this._placingLight();
      if (placing) {
        const s = this._snapLight(raw, placing.mount, this._lineStart ?? undefined);
        if (!s) return;
        if (placing.kind === "point") {
          this._commit(() => placing.points.push(s.p));
        } else if (!this._lineStart) {
          this._lineStart = s.p;
        } else {
          const a = this._lineStart;
          this._lineStart = null;
          if (Math.hypot(s.p[0] - a[0], s.p[1] - a[1]) >= 5) this._commit(() => placing.lines.push([a, s.p]));
        }
        return;
      }
      const light = kind?.startsWith("light") ? this._level.lights?.find((x) => x.id === el!.dataset.id) : undefined;
      if (light) {
        this._selected = light.id;
        const index = Number(el!.dataset.index);
        this._snapshot();
        if (kind === "light-pt") this._drag = { mode: "light-pt", l: light, index };
        else if (kind === "light-end") this._drag = { mode: "light-end", l: light, index, end: Number(el!.dataset.end) as 0 | 1 };
        else
          this._drag = {
            mode: "light-line",
            l: light,
            index,
            start: raw,
            orig: light.lines[index].map((p) => [...p]) as [PlanPoint, PlanPoint],
          };
        svgEl.setPointerCapture(e.pointerId);
        return;
      }
      // The structure is locked: pick an opening (to fit its shutter) or a
      // radiator (to move it).
      if (kind === "opening") {
        this._selected = el!.dataset.id ?? null;
        return;
      }
      const r = kind === "radiator" ? this._level.radiators?.find((x) => x.id === el!.dataset.id) : undefined;
      if (r) {
        this._selected = r.id;
        this._snapshot();
        this._drag = { mode: "radiator", r };
        svgEl.setPointerCapture(e.pointerId);
        return;
      }
      this._selected = null;
      startPan();
      return;
    }
    if (kind === "opening") {
      const o = this._level.openings?.find((x) => x.id === el!.dataset.id);
      if (o) {
        this._selected = o.id;
        this._snapshot();
        this._drag = { mode: "opening", o };
        svgEl.setPointerCapture(e.pointerId);
        return;
      }
    }
    if (kind === "stair") {
      const st = this._level.stairs?.find((x) => x.id === el!.dataset.id);
      if (st) {
        this._selected = st.id;
        this._snapshot();
        this._drag = { mode: "stair", st, start: raw, ox: st.x, oy: st.y };
        svgEl.setPointerCapture(e.pointerId);
        return;
      }
    }
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
      remapInsert(this._level, shape.id, index - 1, 0.5);
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
    if (!d && this._placingLight()) {
      this._hover = this._snapLight(raw, this._placingLight()!.mount, this._lineStart ?? undefined);
      return;
    }
    if (d?.mode === "light-pt" || d?.mode === "light-end") {
      const s = this._snapLight(raw, d.l.mount, undefined, d.mode === "light-pt" ? d.l.points[d.index] : d.l.lines[d.index][d.end]);
      if (s) {
        this._hover = s;
        if (d.mode === "light-pt") d.l.points[d.index] = s.p;
        else d.l.lines[d.index][d.end] = s.p;
        this.requestUpdate();
      }
      return;
    }
    if (d?.mode === "light-line") {
      const s = this._snapLight([d.orig[0][0] + raw[0] - d.start[0], d.orig[0][1] + raw[1] - d.start[1]], d.l.mount);
      if (s) {
        const dx = s.p[0] - d.orig[0][0];
        const dy = s.p[1] - d.orig[0][1];
        d.l.lines[d.index] = [
          [d.orig[0][0] + dx, d.orig[0][1] + dy],
          [d.orig[1][0] + dx, d.orig[1][1] + dy],
        ];
        this.requestUpdate();
      }
      return;
    }
    if (!d) {
      if (isOpeningTool(this._tool)) {
        this._hover = null;
        this._wallHover = nearestWall(this._level, raw, OPENING_SNAP_PX / this._view.k, this._openingOpts[this._tool].width);
        return;
      }
      this._hover = this._tool === "select" ? null : this._snap(raw);
      return;
    }
    if (d.mode === "opening") {
      const spot = nearestWall(this._level, raw, (OPENING_SNAP_PX * 3) / this._view.k, d.o.width);
      if (spot) Object.assign(d.o, { shape: spot.shape, edge: spot.edge, t: spot.t });
      this.requestUpdate();
      return;
    }
    if (d.mode === "radiator") {
      const spot = this._alt ? null : snapRadiator(this._level, raw, RADIATOR_SNAP_PX / this._view.k, d.r.length);
      if (spot) Object.assign(d.r, spot);
      else Object.assign(d.r, { x: roundTo(raw[0], 5), y: roundTo(raw[1], 5) });
      this.requestUpdate();
      return;
    }
    if (d.mode === "stair") {
      const corner: PlanPoint = [d.ox + raw[0] - d.start[0], d.oy + raw[1] - d.start[1]];
      const s = this._snap(corner);
      this._hover = s;
      d.st.x = s.p[0];
      d.st.y = s.p[1];
      this.requestUpdate();
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
      if (this._tool === "stairs") {
        const w = Math.abs(x2 - x1);
        const h = Math.abs(y2 - y1);
        if (w >= 40 && h >= 40) this._addStair({ x: Math.min(x1, x2), y: Math.min(y1, y2), w, h });
        return;
      }
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
    if (
      d.mode === "vertex" ||
      d.mode === "move" ||
      d.mode === "opening" ||
      d.mode === "stair" ||
      d.mode === "radiator" ||
      d.mode.startsWith("light")
    ) {
      this._hover = null;
      if (d.mode === "vertex") this._dedupe(d.shape);
      this._changed();
    }
  };

  private _onDblClick = (e: MouseEvent) => {
    if (this._mode === "fixtures") {
      if (this._placing) return;
      const el = (e.target as Element).closest("[data-kind^='light']") as SVGElement | null;
      const l = el ? this._level?.lights?.find((x) => x.id === el.dataset.id) : undefined;
      if (!l || !el) return;
      const i = Number(el.dataset.index);
      this._commit(() => {
        if (el.dataset.kind === "light-pt") l.points.splice(i, 1);
        else l.lines.splice(i, 1);
      });
      if (!l.points.length && !l.lines.length) this._removeLight(l.id);
      return;
    }
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
      const v = Number(el.dataset.index);
      const n = shape.points.length;
      const l1 = segLength(shape.points[(v + n - 1) % n], shape.points[v]);
      const l2 = segLength(shape.points[v], shape.points[(v + 1) % n]);
      this._commit(() => {
        remapRemove(this._level!, shape.id, v, n, l1, l2);
        shape.points.splice(v, 1);
      });
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
      level.openings = (level.openings ?? []).filter((o) => o.shape !== id);
    });
    if (this._selected === id) this._selected = null;
  }

  private _addStair(r: { x: number; y: number; w: number; h: number }) {
    const level = this._level!;
    const { shape, turn, color } = this._stairStyle;
    const st: PlanStair = {
      id: uid("st"),
      ...r,
      dir: this._stairDir,
      goes: this._stairGoes,
      ...(shape !== "straight" ? { shape, turn } : {}),
      ...(color ? { color } : {}),
    };
    this._commit(() => (level.stairs = [...(level.stairs ?? []), st]));
  }

  /** The selected room outline, opening or stairs. */
  private _selItem():
    | { kind: "shape"; item: PlanShape }
    | { kind: "opening"; item: PlanOpening }
    | { kind: "stair"; item: PlanStair }
    | { kind: "radiator"; item: PlanRadiator }
    | { kind: "light"; item: PlanLight }
    | null {
    const id = this._selected;
    const level = this._level;
    if (!id || !level) return null;
    const shape = level.rooms.find((s) => s.id === id);
    if (shape) return { kind: "shape", item: shape };
    const o = level.openings?.find((x) => x.id === id);
    if (o) return { kind: "opening", item: o };
    const st = level.stairs?.find((x) => x.id === id);
    if (st) return { kind: "stair", item: st };
    const r = level.radiators?.find((x) => x.id === id);
    if (r) return { kind: "radiator", item: r };
    const l = level.lights?.find((x) => x.id === id);
    if (l) return { kind: "light", item: l };
    return null;
  }

  private _deleteSelected() {
    const sel = this._selItem();
    const level = this._level;
    if (!sel || !level) return;
    if (this._mode === "fixtures") {
      // Fixtures mode: Delete removes the fixture, never the structure.
      if (sel.kind === "light") return this._removeLight(sel.item.id);
      if (sel.kind === "radiator")
        this._commit(() => (level.radiators = (level.radiators ?? []).filter((x) => x.id !== sel.item.id)));
      else if (sel.kind === "opening" && sel.item.cover) this._commit(() => ((sel.item as PlanOpening).cover = null));
      this._selected = null;
      return;
    }
    if (sel.kind === "radiator") return;
    if (sel.kind === "shape") return this._deleteShape(sel.item.id);
    this._commit(() => {
      if (sel.kind === "opening") level.openings = (level.openings ?? []).filter((o) => o.id !== sel.item.id);
      else level.stairs = (level.stairs ?? []).filter((x) => x.id !== sel.item.id);
    });
    this._selected = null;
  }

  // -- Drag & drop of Homex rooms --------------------------------------------------------

  private _shapeAt(p: PlanPoint): PlanShape | undefined {
    return [...(this._level?.rooms ?? [])].reverse().find((s) => pointInPolygon(p, s.points));
  }

  /** The window / glass door / sliding door nearest to p (within tol cm). */
  private _glazedNear(p: PlanPoint, tol: number): PlanOpening | undefined {
    const level = this._level;
    if (!level) return undefined;
    let best: PlanOpening | undefined;
    let bestD = tol;
    for (const o of level.openings ?? []) {
      if (!GLAZED.includes(o.type)) continue;
      const g = openingGeometry(level, o);
      if (!g) continue;
      const q = projectOnSegment(p, g.a, g.b);
      const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
      if (d <= bestD) {
        bestD = d;
        best = o;
      }
    }
    return best;
  }

  private _onDragOver = (e: DragEvent) => {
    const types = e.dataTransfer?.types ?? [];
    const p = this._toWorld(e);
    if (types.includes("text/homex-room")) {
      this._dropTarget = this._shapeAt(p)?.id ?? null;
    } else if (types.includes("text/homex-cover")) {
      this._dropTarget = this._glazedNear(p, (OPENING_SNAP_PX * 2) / this._view.k)?.id ?? null;
    } else if (types.includes("text/homex-radiator") || types.includes("text/homex-light")) {
      this._dropTarget = null;
    } else return;
    e.preventDefault();
    e.dataTransfer!.dropEffect = "link";
    this._dragOver = true;
  };

  private _onDragLeave = () => {
    this._dragOver = false;
    this._dropTarget = null;
  };

  private _onDrop = (e: DragEvent) => {
    const roomId = e.dataTransfer?.getData("text/homex-room");
    const cover = e.dataTransfer?.getData("text/homex-cover");
    const radiator = e.dataTransfer?.getData("text/homex-radiator");
    const light = e.dataTransfer?.getData("text/homex-light");
    this._dragOver = false;
    this._dropTarget = null;
    if (!this._level) return;
    if (cover) {
      e.preventDefault();
      const o = this._glazedNear(this._toWorld(e), (OPENING_SNAP_PX * 2) / this._view.k);
      if (o) this._fitCover(o, cover);
      return;
    }
    if (radiator) {
      e.preventDefault();
      this._placeRadiator(radiator, this._toWorld(e));
      return;
    }
    if (light) {
      e.preventDefault();
      if (this._placing) this._stopPlacing();
      this._startLight(light, this._toWorld(e));
      return;
    }
    if (!roomId) return;
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

  // -- Fixtures -------------------------------------------------------------------------

  /** A tab is a page: switching tabs navigates; the page sets the mode. */
  private _goMode(mode: "structure" | "fixtures" | "render") {
    if (mode !== this._mode) navigate(joinPath(this.base, mode));
  }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("subpath")) {
      const seg = this.subpath.split("/")[0];
      const mode = seg === "fixtures" || seg === "render" ? seg : "structure";
      if (mode !== this._mode) this._setMode(mode);
    }
  }

  private _setMode(mode: "structure" | "fixtures" | "render") {
    // three.js loads with the Rendering tab only.
    if (mode === "render") import("./homex-builder-render");
    if (this._placing) this._stopPlacing();
    this._setTool("select");
    this._mode = mode;
    this._selected = null;
  }

  /** Homex rooms drawn on the current floor. */
  private _levelRooms(): Room[] {
    const ids = new Set((this._level?.rooms ?? []).map((s) => s.room_id).filter(Boolean));
    return this._rooms.filter((r) => ids.has(r.room_id));
  }

  private _placedCovers(): Set<string> {
    return new Set(this._levels.flatMap((l) => (l.openings ?? []).map((o) => o.cover)).filter(Boolean) as string[]);
  }

  private _placedRadiators(): Set<string> {
    return new Set(this._levels.flatMap((l) => (l.radiators ?? []).map((r) => r.device_id)));
  }

  private _roomCovers(r: Room): string[] {
    return [...new Set((r.shutter_groups ?? []).flatMap((g) => g.devices ?? []))];
  }

  private _roomRadiators(r: Room): string[] {
    return (r.heating?.radiators ?? []).map((x) => x.device_id);
  }

  private _coverName(entityId: string): string {
    return (this.hass.states[entityId]?.attributes.friendly_name as string) || entityId;
  }

  private _deviceName(deviceId: string): string {
    const d = this.hass.devices?.[deviceId];
    return d?.name_by_user || d?.name || deviceId;
  }

  private _climateOf(deviceId: string): string | undefined {
    return Object.values((this.hass.entities ?? {}) as Record<string, any>).find(
      (e) => e.device_id === deviceId && e.entity_id.startsWith("climate.")
    )?.entity_id;
  }

  /** Fit a shutter on an opening (one opening per shutter). */
  private _fitCover(o: PlanOpening, cover: string | null) {
    this._commit((plan) => {
      if (cover) for (const l of plan.levels) for (const x of l.openings ?? []) if (x.cover === cover) x.cover = null;
      o.cover = cover;
    });
    this._selected = o.id;
  }

  private _placeRadiator(deviceId: string, p: PlanPoint) {
    const level = this._level!;
    const length = 80;
    const spot = snapRadiator(level, p, (RADIATOR_SNAP_PX * 2) / this._view.k, length) ?? {
      x: roundTo(p[0], 5),
      y: roundTo(p[1], 5),
      angle: 0,
    };
    const r: PlanRadiator = { id: uid("rad"), device_id: deviceId, length, ...spot };
    this._commit((plan) => {
      for (const l of plan.levels) l.radiators = (l.radiators ?? []).filter((x) => x.device_id !== deviceId);
      level.radiators = [...(level.radiators ?? []), r];
    });
    this._selected = r.id;
  }

  private _roomLights(r: Room): string[] {
    return (r.devices ?? []).filter((e) => !e.startsWith("light.homex_"));
  }

  private _placedLights(): Set<string> {
    return new Set(this._levels.flatMap((l) => (l.lights ?? []).map((x) => x.entity_id)));
  }

  private _placingLight(): PlanLight | undefined {
    return this._placing ? this._level?.lights?.find((x) => x.id === this._placing) : undefined;
  }

  /** Start drawing a light (new, or adding to a placed one). */
  private _startLight(entityId: string, at?: PlanPoint) {
    const level = this._level!;
    let l = level.lights?.find((x) => x.entity_id === entityId);
    if (!l) {
      const type = LIGHT_TYPES[this._lightMount].includes(this._lightType) ? this._lightType : LIGHT_TYPES[this._lightMount][0];
      l = { id: uid("li"), entity_id: entityId, kind: lightKindOf(type), mount: this._lightMount, type, points: [], lines: [] };
      const nl = l;
      this._commit((plan) => {
        for (const x of plan.levels) x.lights = (x.lights ?? []).filter((y) => y.entity_id !== entityId);
        level.lights = [...(level.lights ?? []), nl];
      });
    }
    this._selected = l.id;
    this._placing = l.id;
    this._lineStart = null;
    if (at && l.kind === "point") {
      const s = this._snapLight(at, l.mount);
      if (s) {
        const nl = l;
        this._commit(() => nl.points.push(s.p));
      }
    } else if (at) {
      this._lineStart = this._snapLight(at, l.mount)?.p ?? null;
    }
  }

  private _stopPlacing() {
    const l = this._placingLight();
    this._placing = null;
    this._lineStart = null;
    this._hover = null;
    if (l && !l.points.length && !l.lines.length) this._removeLight(l.id);
  }

  private _undoLightPart() {
    const l = this._placingLight();
    if (!l) return;
    if (this._lineStart) {
      this._lineStart = null;
      return;
    }
    if (l.kind === "point" && l.points.length) this._commit(() => l.points.pop());
    else if (l.kind === "linear" && l.lines.length) this._commit(() => l.lines.pop());
  }

  private _removeLight(id: string) {
    const level = this._level;
    if (!level) return;
    this._commit(() => (level.lights = (level.lights ?? []).filter((x) => x.id !== id)));
    if (this._selected === id) this._selected = null;
    if (this._placing === id) {
      this._placing = null;
      this._lineStart = null;
    }
  }

  /** Light snapping: wall lights onto a wall; others on a 10 cm grid, lined
   * up with the other lights and the room corners. Null: no wall near. */
  private _snapLight(raw: PlanPoint, mount: LightMount, anchor?: PlanPoint, exclude?: PlanPoint): SnapResult | null {
    const level = this._level;
    if (!level) return null;
    if (this._alt) return { p: [Math.round(raw[0]), Math.round(raw[1])], kind: "free" };
    const tol = SNAP_PX / this._view.k;
    if (mount === "wall") {
      let best: SnapResult | null = null;
      let bestD = (OPENING_SNAP_PX * 1.5) / this._view.k;
      for (const s of level.rooms)
        for (const [a, b] of edgesOf(s.points)) {
          const q = projectOnSegment(raw, a, b);
          const d = Math.hypot(raw[0] - q[0], raw[1] - q[1]);
          if (d <= bestD) {
            bestD = d;
            best = { p: [roundTo(q[0], 1), roundTo(q[1], 1)], kind: "edge" };
          }
        }
      return best;
    }
    const vertices: PlanPoint[] = level.rooms.flatMap((s) => s.points);
    for (const l of level.lights ?? []) {
      for (const p of l.points) if (p !== exclude) vertices.push(p);
      for (const [a, b] of l.lines) {
        if (a !== exclude) vertices.push(a);
        if (b !== exclude) vertices.push(b);
      }
    }
    return snapPoint(raw, { vertices, edges: [], anchors: anchor ? [anchor] : [], tolerance: tol, grid: 10 });
  }

  /** Mount or fixture of the selected light (and of the next ones): the
   * fixture fits the mount, a LED strip is drawn as strips, the rest as spots. */
  private _setLightOpt(key: "type" | "mount", value: string) {
    const sel = this._selItem();
    const l = sel?.kind === "light" ? sel.item : undefined;
    const mount = (key === "mount" ? value : (l?.mount ?? this._lightMount)) as LightMount;
    let type = (key === "type" ? value : l ? lightType(l) : this._lightType) as LightType;
    if (!LIGHT_TYPES[mount].includes(type)) type = type === "led_strip" ? "led_strip" : LIGHT_TYPES[mount][0];
    const kind = lightKindOf(type);
    this._lightMount = mount;
    this._lightType = type;
    if (!l) return;
    this._commit(() => {
      if (l.kind !== kind) {
        // Spots become 60 cm strips and back (their centre / start).
        if (kind === "linear") {
          l.lines = l.points.map((p) => [[p[0] - 30, p[1]], [p[0] + 30, p[1]]] as [PlanPoint, PlanPoint]);
          l.points = [];
        } else {
          l.points = l.lines.map(([a, b]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as PlanPoint);
          l.lines = [];
        }
        l.kind = kind;
      }
      l.mount = mount;
      l.type = type;
      if (!SHADED.includes(type)) delete l.shade;
    });
    this._lineStart = null;
  }

  /** Style fields of an item (undefined / false / "" clears one). */
  private _setStyle<T extends object>(item: T, patch: Partial<T>) {
    this._commit(() => {
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined || v === false || v === "") delete (item as Record<string, unknown>)[k];
        else (item as Record<string, unknown>)[k] = v;
      }
    });
  }

  // -- Keyboard -----------------------------------------------------------------------

  private _onKey = (e: KeyboardEvent) => {
    const tag = (e.composedPath()[0] as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (this._mode === "render") return;
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
    const orient: Record<string, Orient> = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down",
      "+": "wider",
      "=": "wider",
      "-": "narrower",
      PageUp: "goes-up",
      PageDown: "goes-down",
    };
    if (orient[e.key] && this._orientTarget()) {
      e.preventDefault();
      this._orient(orient[e.key]);
      return;
    }
    switch (e.key) {
      case " ":
        this._space = true;
        e.preventDefault();
        break;
      case "Escape":
        if (this._placing) this._stopPlacing();
        else if (this._draft.length) this._draft = [];
        else if (this._tool !== "select") this._setTool("select");
        else this._selected = null;
        break;
      case "Enter":
        if (this._placing) this._stopPlacing();
        else if (this._draft.length) this._closeDraft();
        break;
      case "Backspace":
      case "Delete":
        if (this._placing) this._undoLightPart();
        else if (this._draft.length) this._draft = this._draft.slice(0, -1);
        else if (this._selected) this._deleteSelected();
        e.preventDefault();
        break;
      case "v":
        this._setTool("select");
        break;
      default:
        break;
    }
    if (this._mode === "fixtures") return;
    switch (e.key) {
      case "d":
      case "p":
        this._setTool("draw");
        break;
      case "r":
        this._setTool("rect");
        break;
      case "o":
        this._setTool("door");
        break;
      case "w":
        this._setTool("window");
        break;
      case "g":
        this._setTool("glass_door");
        break;
      case "c":
        this._setTool("sliding_door");
        break;
      case "s":
        this._setTool("stairs");
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
    this._wallHover = null;
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
              ${(ghost.stairs ?? []).filter((st) => !this._arrivals().some((a) => a.st === st)).map((st) => this._stair(st, "ghost"))}
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
        <g class="stairs">
          ${this._arrivals().map((a) => this._stair(a.st, "arrival", a.from))}
          ${(level.stairs ?? []).map((st) => this._stair(st))}
        </g>
        <g class="radiators ${this._mode === "fixtures" ? "" : "locked"}">
          ${(level.radiators ?? []).map((r) => this._radiator(r))}
        </g>
        <g class="lights ${this._mode === "fixtures" && !this._placing ? "" : "locked"}">
          ${(level.lights ?? []).map((l) => this._light(l))}
          ${this._lightPreview()}
        </g>
        <g class="openings">
          ${(level.openings ?? []).map((o) => this._opening(level, o))}
          ${this._wallHover && isOpeningTool(this._tool)
            ? this._opening(
                level,
                {
                  id: "preview",
                  type: this._tool,
                  shape: this._wallHover.shape,
                  edge: this._wallHover.edge,
                  t: this._wallHover.t,
                  ...this._openingOpts[this._tool],
                },
                true
              )
            : nothing}
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
        ${this._rect && this._tool === "stairs"
          ? this._stair({
              id: "preview",
              x: Math.min(this._rect[0][0], this._rect[1][0]),
              y: Math.min(this._rect[0][1], this._rect[1][1]),
              w: Math.abs(this._rect[1][0] - this._rect[0][0]),
              h: Math.abs(this._rect[1][1] - this._rect[0][1]),
              dir: this._stairDir,
              goes: this._stairGoes,
            })
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
        ${hover && (this._tool !== "select" || this._drag || this._placing)
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

  /** A door (leaf + swing arc), window or glass door drawn in its wall. */
  private _opening(level: PlanLevel, o: PlanOpening, preview = false) {
    const g = openingGeometry(level, o);
    if (!g) return nothing;
    const { a, b, c, n, u } = g;
    const sel = o.id === this._selected;
    const fixtures = this._mode === "fixtures";
    const glazed = GLAZED.includes(o.type);
    const cls = `op ${o.type} ${sel ? "selected" : ""} ${preview ? "preview" : ""} ${
      fixtures && glazed && !o.cover ? "needs-cover" : ""
    } ${o.id === this._dropTarget ? "drop" : ""} ${fixtures && !glazed ? "locked" : ""}`;
    const off = (p: PlanPoint, d: number): PlanPoint => [p[0] + n[0] * d, p[1] + n[1] * d];
    const shift = (p: PlanPoint, d: number): PlanPoint => [p[0] + u[0] * d, p[1] + u[1] * d];
    const line = (p: PlanPoint, q: PlanPoint, c2 = "") =>
      svg`<line class=${c2} x1=${p[0]} y1=${p[1]} x2=${q[0]} y2=${q[1]}></line>`;
    const poly = (pts: PlanPoint[], c2: string, style = "") =>
      svg`<polygon class=${c2} style=${style} points=${pts.map((x) => x.join(",")).join(" ")}></polygon>`;
    /** Swing arc of a leaf hinged at h, from its closed tip to its open one. */
    const swing = (h: PlanPoint, closed: PlanPoint, open: PlanPoint) => {
      const r = Math.hypot(closed[0] - h[0], closed[1] - h[1]);
      const cross = (closed[0] - h[0]) * (open[1] - h[1]) - (closed[1] - h[1]) * (open[0] - h[0]);
      return svg`<path class="swing" d="M ${closed[0]} ${closed[1]} A ${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${open[0]} ${open[1]}"></path>`;
    };
    const style = openingStyle(o);
    const w = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let body;
    if (o.type === "door") {
      const hinge = o.flip ? b : a;
      const other = o.flip ? a : b;
      const side = o.out ? -1 : 1;
      const leaf: PlanPoint = [hinge[0] + n[0] * side * w, hinge[1] + n[1] * side * w];
      // Panel / glazed doors: a 4 cm thick leaf.
      const d: PlanPoint = [(other[0] - hinge[0]) / w, (other[1] - hinge[1]) / w];
      const thick = (p: PlanPoint): PlanPoint => [p[0] + d[0] * 4, p[1] + d[1] * 4];
      body = svg`${style === "plain"
          ? line(hinge, leaf, "leaf")
          : poly([hinge, leaf, thick(leaf), thick(hinge)], `leaf-body ${style}`)}
        ${style === "glazed" ? line(thick([(hinge[0] * 3 + leaf[0]) / 4, (hinge[1] * 3 + leaf[1]) / 4]), thick([(hinge[0] + leaf[0] * 3) / 4, (hinge[1] + leaf[1] * 3) / 4]), "pane") : nothing}
        ${swing(hinge, other, leaf)}`;
    } else if (o.type === "sliding_door") {
      // Leaf along the wall on one side, its open position dashed (inside
      // the wall for a pocket door), an arrow the way it slides.
      const side = o.out ? -1 : 1;
      const dir = o.flip ? -1 : 1;
      const leaf = (p: PlanPoint, q: PlanPoint, d0: number, d1: number) => [off(p, d0), off(q, d0), off(q, d1), off(p, d1)];
      const from = off(c, side * 18);
      const to = shift(from, dir * w * 0.45);
      const hs = 7 / this._view.k;
      const head = [to, off(shift(to, -dir * hs), hs * 0.6), off(shift(to, -dir * hs), -hs * 0.6)];
      const pocket = style === "pocket";
      body = svg`${poly(leaf(a, b, side * 3, side * 8), `slide-leaf ${style}`)}
        ${poly(pocket ? leaf(shift(a, dir * w), shift(b, dir * w), -3, 3) : leaf(shift(a, dir * w), shift(b, dir * w), side * 3, side * 8), "slide-open")}
        ${line(from, to, "slide-arrow")}
        ${poly(head, "slide-head")}`;
    } else {
      const t = 6;
      const frame = poly([off(a, t), off(b, t), off(b, -t), off(a, -t)], "frame");
      let panes;
      if (style === "sliding") {
        // Two leaves sliding past each other.
        panes = svg`${line(off(a, -2), off(shift(a, w * 0.55), -2), "pane")}${line(off(b, 2), off(shift(b, -w * 0.55), 2), "pane")}`;
      } else {
        const mullion = o.type === "glass_door" || (style !== "fixed" && w > 70);
        panes = svg`${line(a, b, "pane")}${mullion ? line(off(c, -t), off(c, t), "pane") : nothing}`;
        if (style === "casement" || style === "tilt") {
          // Leaves opening inwards: one when narrow, else two.
          const leaves: [PlanPoint, PlanPoint][] = w > 70 ? [[a, c], [b, c]] : [[a, b]];
          panes = svg`${panes}${leaves.map(([h, tip]) => {
            const lw = Math.hypot(tip[0] - h[0], tip[1] - h[1]);
            return swing(h, tip, off(h, lw));
          })}`;
          if (style === "tilt") panes = svg`${panes}<path class="swing tilt" d="M ${a[0]} ${a[1]} L ${off(c, Math.min(30, w / 3))[0]} ${off(c, Math.min(30, w / 3))[1]} L ${b[0]} ${b[1]}"></path>`;
        }
      }
      body = svg`${frame}${panes}`;
    }
    let shutter: unknown = nothing;
    if (o.cover && glazed) {
      // Shutter on the outside face, shaded by how closed it is: a roller
      // box, or two hinged leaves (folded against the wall when open).
      const st = this.hass.states[o.cover];
      const pos = st?.attributes.current_position as number | undefined;
      const closed = pos !== undefined ? 1 - pos / 100 : st?.state === "closed" ? 1 : 0;
      const k = this._view.k;
      const lp = off(c, -26);
      const col = o.cover_color ? `--cc:${o.cover_color};` : "";
      const leaves =
        o.cover_type === "hinged"
          ? closed >= 0.5
            ? svg`${poly([off(a, -9), off(c, -9), off(c, -13), off(a, -13)], "shutter hinged", col)}${poly([off(c, -9), off(b, -9), off(b, -13), off(c, -13)], "shutter hinged", col)}`
            : svg`${poly([off(a, -9), off(shift(a, -w / 2), -9), off(shift(a, -w / 2), -13), off(a, -13)], "shutter hinged", col)}${poly([off(b, -9), off(shift(b, w / 2), -9), off(shift(b, w / 2), -13), off(b, -13)], "shutter hinged", col)}`
          : poly([off(a, -9), off(b, -9), off(b, -15), off(a, -15)], "shutter", `${col}fill-opacity:${0.25 + closed * 0.65}`);
      shutter = svg`${leaves}
        ${fixtures || sel
          ? svg`<text class="fx-tag" x=${lp[0]} y=${lp[1]} font-size=${10 / k} text-anchor="middle" dominant-baseline="middle">${
              pos !== undefined ? `${pos} %` : st?.state ?? "?"
            }</text>`
          : nothing}`;
    }
    return svg`<g class=${cls} style=${o.color ? `--oc:${o.color}` : ""}>
      ${line(a, b, "gap")}
      ${body}
      ${shutter}
      ${preview ? nothing : svg`<line data-kind="opening" data-id=${o.id} class="hit" x1=${a[0]} y1=${a[1]} x2=${b[0]} y2=${b[1]}></line>`}
    </g>`;
  }

  /** Stairs of the neighbouring floors that arrive on this one: going up
   * from the floor below, or down from the floor above. */
  private _arrivals(): { st: PlanStair; from: PlanLevel }[] {
    const levels = this._levels;
    const i = levels.findIndex((l) => l.id === this._levelId);
    if (i < 0) return [];
    const below = levels[i - 1];
    const above = levels[i + 1];
    return [
      ...(below?.stairs ?? []).filter((st) => (st.goes ?? "up") === "up").map((st) => ({ st, from: below! })),
      ...(above?.stairs ?? []).filter((st) => st.goes === "down").map((st) => ({ st, from: above! })),
    ];
  }

  /** Where stairs of the current floor lead. */
  private _stairTarget(st: { goes?: "up" | "down" }): PlanLevel | undefined {
    const levels = this._levels;
    const i = levels.findIndex((l) => l.id === this._levelId);
    return (st.goes ?? "up") === "up" ? levels[i + 1] : levels[i - 1];
  }

  /** Stairs: own (editable), ghost (neighbour floor) or arrival (stairs of
   * the neighbouring floor that lead here, in their own colour). */
  /** Live colour of a light: its RGB when on, grey when off. */
  private _lightColor(entityId: string): { on: boolean; color: string } {
    const st = this.hass.states[entityId];
    const on = st?.state === "on";
    const rgb = st?.attributes.rgb_color as number[] | undefined;
    return { on, color: on ? (rgb ? `rgb(${rgb.join(",")})` : "#ffd54f") : "#9e9e9e" };
  }

  private _light(l: PlanLight) {
    const k = this._view.k;
    const { on, color } = this._lightColor(l.entity_id);
    const sel = l.id === this._selected;
    const r = 7 / k;
    const type = lightType(l);
    const square = l.shape === "square";
    const body = (p: PlanPoint, rr: number) =>
      square
        ? svg`<rect class="lp" x=${p[0] - rr} y=${p[1] - rr} width=${rr * 2} height=${rr * 2} rx=${rr * 0.2}></rect>`
        : svg`<circle class="lp" cx=${p[0]} cy=${p[1]} r=${rr}></circle>`;
    const dot = (p: PlanPoint, rr: number) => svg`<circle class="lp-dot" cx=${p[0]} cy=${p[1]} r=${rr}></circle>`;
    const x = (p: PlanPoint, rr: number, plus = false) =>
      plus
        ? svg`<line class="lp-x" x1=${p[0] - rr} y1=${p[1]} x2=${p[0] + rr} y2=${p[1]}></line>
            <line class="lp-x" x1=${p[0]} y1=${p[1] - rr} x2=${p[0]} y2=${p[1] + rr}></line>`
        : svg`<line class="lp-x" x1=${p[0] - rr * 0.7} y1=${p[1] - rr * 0.7} x2=${p[0] + rr * 0.7} y2=${p[1] + rr * 0.7}></line>
            <line class="lp-x" x1=${p[0] - rr * 0.7} y1=${p[1] + rr * 0.7} x2=${p[0] + rr * 0.7} y2=${p[1] - rr * 0.7}></line>`;
    const marker = (p: PlanPoint, i: number) => {
      const hit = svg`<circle class="light-hit" data-kind="light-pt" data-id=${l.id} data-index=${i} cx=${p[0]} cy=${p[1]} r=${r * 1.8}></circle>`;
      const shade =
        l.shade && SHADED.includes(type)
          ? square
            ? svg`<rect class="lp-shade" x=${p[0] - r * 1.5} y=${p[1] - r * 1.5} width=${r * 3} height=${r * 3}></rect>`
            : svg`<circle class="lp-shade" cx=${p[0]} cy=${p[1]} r=${r * 1.5}></circle>`
          : nothing;
      let mark;
      switch (type) {
        case "pendant": // a body hanging from its rose
          mark = svg`${body(p, r)}<circle class="lp-in" cx=${p[0]} cy=${p[1]} r=${r * 0.45}></circle>`;
          break;
        case "spot":
          mark = svg`${body(p, r * 0.6)}${dot(p, r * 0.25)}`;
          break;
        case "sconce":
          mark = svg`${body(p, r)}${dot(p, r * 0.35)}`;
          break;
        case "floor_lamp":
          mark = svg`${body(p, r)}${x(p, r * 0.7, true)}`;
          break;
        case "table_lamp":
          mark = svg`${body(p, r * 0.75)}${dot(p, r * 0.3)}`;
          break;
        default: // ceiling light
          mark = svg`${body(p, r)}${x(p, r)}`;
      }
      return svg`${shade}${mark}${hit}`;
    };
    const label = l.points[0] ?? l.lines[0]?.[0];
    return svg`<g class="light ${on ? "on" : ""} ${sel ? "selected" : ""} m-${l.mount} t-${type}" style="--lc:${color};${l.color ? `--fc:${l.color}` : ""}">
      ${on ? l.points.map((p) => svg`<circle class="glow" cx=${p[0]} cy=${p[1]} r=${r * 3}></circle>`) : nothing}
      ${l.lines.map(
        ([a, b], i) => svg`${on ? svg`<line class="glow-line" x1=${a[0]} y1=${a[1]} x2=${b[0]} y2=${b[1]}></line>` : nothing}
          <line class="ll" x1=${a[0]} y1=${a[1]} x2=${b[0]} y2=${b[1]}></line>
          <line class="light-hit" data-kind="light-line" data-id=${l.id} data-index=${i} x1=${a[0]} y1=${a[1]} x2=${b[0]} y2=${b[1]}></line>
          ${sel && !this._placing
            ? svg`<circle class="le" data-kind="light-end" data-id=${l.id} data-index=${i} data-end="0" cx=${a[0]} cy=${a[1]} r=${5 / k}></circle>
                <circle class="le" data-kind="light-end" data-id=${l.id} data-index=${i} data-end="1" cx=${b[0]} cy=${b[1]} r=${5 / k}></circle>`
            : nothing}`
      )}
      ${l.points.map(marker)}
      ${label && (sel || this._mode === "fixtures")
        ? svg`<text class="fx-tag" x=${label[0]} y=${label[1] - 14 / k} font-size=${10 / k} text-anchor="middle">${this._lightName(l.entity_id)}</text>`
        : nothing}
    </g>`;
  }

  /** While drawing a light: the next spot, or the strip being drawn. */
  private _lightPreview() {
    const l = this._placingLight();
    const h = this._hover;
    if (!l || !h) return nothing;
    const k = this._view.k;
    if (l.kind === "linear" && this._lineStart) {
      const a = this._lineStart;
      return svg`<g class="light-preview">
        <line class="ll" x1=${a[0]} y1=${a[1]} x2=${h.p[0]} y2=${h.p[1]}></line>
        <text class="dim" x=${(a[0] + h.p[0]) / 2} y=${(a[1] + h.p[1]) / 2 - 6 / k} font-size=${11 / k} text-anchor="middle">${this._len(segLength(a, h.p))}</text>
      </g>`;
    }
    return svg`<g class="light-preview"><circle cx=${h.p[0]} cy=${h.p[1]} r=${7 / k}></circle></g>`;
  }

  private _lightName(entityId: string): string {
    return (this.hass.states[entityId]?.attributes.friendly_name as string) || entityId;
  }

  private _radiator(r: PlanRadiator) {
    const k = this._view.k;
    const pts = radiatorPoints(r);
    const climate = this._climateOf(r.device_id);
    const heating = climate ? this.hass.states[climate]?.attributes.hvac_action === "heating" : false;
    const sel = r.id === this._selected;
    const a = (r.angle * Math.PI) / 180;
    const u: PlanPoint = [Math.cos(a), Math.sin(a)];
    const tall = r.kind === "tall";
    const pitch = tall ? 5 : 10; // a tall one: tight vertical columns
    const fins = [];
    for (let d = -r.length / 2 + pitch; d < r.length / 2 - pitch / 2 + 1; d += pitch) {
      const c: PlanPoint = [r.x + u[0] * d, r.y + u[1] * d];
      fins.push(svg`<line class="fin" x1=${c[0] - u[1] * 4} y1=${c[1] + u[0] * 4} x2=${c[0] + u[1] * 4} y2=${c[1] - u[0] * 4}></line>`);
    }
    return svg`<g class="radiator ${tall ? "tall" : ""} ${heating ? "heating" : ""} ${sel ? "selected" : ""}">
      <polygon data-kind="radiator" data-id=${r.id} points=${pts.map((p) => p.join(",")).join(" ")}></polygon>
      ${fins}
      ${this._mode === "fixtures" || sel
        ? svg`<text class="fx-tag" x=${r.x} y=${r.y - 14 / k} font-size=${10 / k} text-anchor="middle">${this._deviceName(r.device_id)}</text>`
        : nothing}
    </g>`;
  }

  private _stair(st: PlanStair, mode: "own" | "ghost" | "arrival" = "own", from?: PlanLevel) {
    const d = stairDrawing(st);
    const pts = d.outline.map((p) => p.join(",")).join(" ");
    // The arrow is the way of travel (dir), up or down alike.
    const to = d.path[d.path.length - 1];
    const before = d.path[d.path.length - 2];
    const down = (st.goes ?? "up") === "down";
    const k = this._view.k;
    const ang = Math.atan2(to[1] - before[1], to[0] - before[0]);
    const hs = 9 / k;
    const head = [
      to,
      [to[0] - hs * Math.cos(ang - 0.45), to[1] - hs * Math.sin(ang - 0.45)],
      [to[0] - hs * Math.cos(ang + 0.45), to[1] - hs * Math.sin(ang + 0.45)],
    ]
      .map((p) => p.join(","))
      .join(" ");
    const label =
      mode === "arrival"
        ? t(down ? "builder.stairs_arrival_down" : "builder.stairs_arrival_up", { name: from?.name ?? "" })
        : mode === "own"
          ? t(down ? "builder.stairs_tag_down" : "builder.stairs_tag_up")
          : "";
    // Label: on the first flight, the centre for a spiral.
    const [lx, ly] =
      st.shape === "spiral" || !st.shape || st.shape === "straight"
        ? [st.x + st.w / 2, st.y + st.h / 2]
        : [(d.path[0][0] + d.path[1][0]) / 2, (d.path[0][1] + d.path[1][1]) / 2];
    const cls = `stair ${mode === "ghost" ? "ghost-stair" : ""} ${mode === "arrival" ? "arrival" : ""} ${down ? "down" : ""} ${
      st.id === this._selected && mode === "own" ? "selected" : ""
    } ${st.color ? "styled" : ""}`;
    return svg`<g class=${cls} style=${st.color ? `--sc:${st.color}` : ""}>
      <polygon class="stair-bg" data-kind=${mode === "own" ? "stair" : ""} data-id=${st.id} points=${pts}></polygon>
      ${d.treads.map(([p, q]) => svg`<line class="tread" x1=${p[0]} y1=${p[1]} x2=${q[0]} y2=${q[1]}></line>`)}
      ${d.edges.map(([p, q]) => svg`<line class="tread edge" x1=${p[0]} y1=${p[1]} x2=${q[0]} y2=${q[1]}></line>`)}
      <polyline class="arrow" points=${d.path.map((p) => p.join(",")).join(" ")}></polyline>
      <polygon class="arrow-head" points=${head}></polygon>
      ${label
        ? svg`<text class="stair-tag" x=${lx} y=${ly} font-size=${10 / k} text-anchor="middle" dominant-baseline="middle">${label}</text>`
        : nothing}
    </g>`;
  }

  private _toolbar() {
    const tool = (id: Tool, icon: string, key: string) => html`<button
      class="tool ${this._tool === id ? "active" : ""}"
      title="${t(`builder.tool_${id}`)} (${key})"
      @click=${() => this._setTool(id)}
    >
      ${icon} <span>${t(`builder.tool_${id}`)}</span>
    </button>`;
    const structure = this._mode === "structure";
    return html`<div class="toolbar">
      ${structure
        ? html`${tool("select", "🖐", "V")} ${tool("draw", "✏️", "D")} ${tool("rect", "▭", "R")}
            <span class="sep"></span>
            ${tool("door", "🚪", "O")} ${tool("sliding_door", "⇿", "C")} ${tool("window", "🪟", "W")}
            ${tool("glass_door", "◫", "G")} ${tool("stairs", "🪜", "S")}
            <span class="sep"></span>`
        : nothing}
      <button title=${t("builder.undo")} ?disabled=${!this._undo.length} @click=${() => this._undoAction()}>↶</button>
      <button title=${t("builder.redo")} ?disabled=${!this._redo.length} @click=${() => this._redoAction()}>↷</button>
      <span class="sep"></span>
      <button title=${t("builder.zoom_out")} @click=${() => this._zoom(1 / 1.25)}>−</button>
      <button title=${t("builder.zoom_in")} @click=${() => this._zoom(1.25)}>＋</button>
      <button title=${t("builder.fit")} @click=${() => this._fit()}>⤢</button>
    </div>`;
  }

  private _hint() {
    if (this._mode === "fixtures") {
      const sel = this._selItem();
      if (this._placing) return t("builder.hint_fx_light_placing");
      if (sel?.kind === "light") return t("builder.hint_fx_light");
      if (sel?.kind === "radiator") return t("builder.hint_fx_radiator");
      if (sel?.kind === "opening") return t("builder.hint_fx_opening");
      return t("builder.hint_fixtures");
    }
    if (this._tool === "draw")
      return this._draft.length >= 3 ? t("builder.hint_draw_close") : t("builder.hint_draw");
    if (this._tool === "rect") return t("builder.hint_rect");
    if (this._tool === "stairs") return t("builder.hint_stairs");
    if (isOpeningTool(this._tool))
      return this._level?.rooms.length ? t("builder.hint_opening") : t("builder.hint_opening_no_wall");
    const sel = this._selItem();
    if (sel?.kind === "opening") return t("builder.hint_opening_selected");
    if (sel?.kind === "stair") return t("builder.hint_stair_selected");
    if (sel) return t("builder.hint_selected");
    return this._level?.rooms.length ? t("builder.hint_select") : t("builder.hint_empty");
  }

  /** Google Maps style floor switcher: + above, the floors, + below. */
  private _floorSwitcher() {
    const levels = [...this._levels].reverse();
    return html`<div class="floors">
      <button class="floor-add" title=${t("builder.add_above")} @click=${() => this._addLevelAt("above")}>＋</button>
      ${levels.map(
        (l) => html`<button
          class="floor ${l.id === this._levelId ? "active" : ""}"
          title=${l.name}
          @click=${() => (l.id === this._levelId ? this._openLevelDialog("edit") : this._goLevel(l.id))}
        >
          <span class="num">${l.level}</span>
          <span class="fname">${l.name}</span>
          ${l.id === this._levelId ? html`<span class="edit" title=${t("builder.level_edit")}>✎</span>` : nothing}
        </button>`
      )}
      <button class="floor-add" title=${t("builder.add_below")} @click=${() => this._addLevelAt("below")}>＋</button>
    </div>`;
  }

  private _floorOf(r: Room): string | null {
    return (r.area_id ? this.hass.areas?.[r.area_id]?.floor_id : null) ?? null;
  }

  /** Homex rooms not placed on any floor yet, that fit this floor (its HA
   * floor, or no floor at all). */
  private _assignable(): Room[] {
    const level = this._level;
    if (!level) return [];
    const placed = new Set(this._levels.flatMap((l) => l.rooms.map((s) => s.room_id)).filter(Boolean));
    return this._rooms
      .filter((r) => !placed.has(r.room_id))
      .filter((r) => {
        const f = this._floorOf(r);
        return !f || !level.floor_id || f === level.floor_id;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private _roomsPanel() {
    const rooms = this._assignable();
    const sel = this._level?.rooms.find((s) => s.id === this._selected);
    return html`<aside>
      <h3>${t("builder.rooms")}</h3>
      <p class="hint">${sel ? t("builder.rooms_hint_selected") : t("builder.rooms_hint")}</p>
      <div class="chips">
        ${rooms.map(
          (r) => html`<div
            class="chip ${sel ? "clickable" : ""}"
            draggable="true"
            @dragstart=${(e: DragEvent) => {
              e.dataTransfer?.setData("text/homex-room", r.room_id);
              e.dataTransfer!.effectAllowed = "link";
            }}
            @click=${() => sel && this._mapShape(sel, r.room_id)}
          >
            <span>${r.name}</span>
            ${this._floorOf(r) ? nothing : html`<span class="nofloor">${t("builder.no_floor")}</span>`}
          </div>`
        )}
        ${rooms.length ? nothing : html`<p class="hint">${t("builder.all_placed")}</p>`}
      </div>
    </aside>`;
  }

  private _selectionPanel() {
    const sel = this._selItem();
    if (!sel) return nothing;
    if (sel.kind === "radiator") return this._radiatorPanel(sel.item);
    if (sel.kind === "light") return this._lightPanel(sel.item);
    if (this._mode === "fixtures") return sel.kind === "opening" ? this._coverPanel(sel.item) : nothing;
    if (sel.kind === "opening") return this._openingPanel(sel.item);
    if (sel.kind === "stair") return this._stairPanel(sel.item);
    const shape = sel.item;
    const perimeter = edgesOf(shape.points).reduce((s, [a, b]) => s + segLength(a, b), 0);
    const current = shape.room_id ? this._rooms.find((r) => r.room_id === shape.room_id) : undefined;
    const options = [...(current ? [current] : []), ...this._assignable()];
    return html`<div class="selection">
      <div class="sel-head">
        <strong>${t("builder.selection")}</strong>
        <button class="icon" title=${t("common.close")} @click=${() => (this._selected = null)}>✕</button>
      </div>
      <label class="field">
        <span>${t("builder.mapped_room")}</span>
        <select @change=${(e: Event) => this._mapShape(shape, (e.target as HTMLSelectElement).value || null)}>
          <option value="" ?selected=${!shape.room_id}>${t("builder.unmapped")}</option>
          ${options.map(
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
    </div>`;
  }

  private _toolClose() {
    return html`<button class="icon" title=${t("common.close")} @click=${() => this._setTool("select")}>✕</button>`;
  }

  private _panelHead(title: string) {
    return html`<div class="sel-head">
      <strong>${title}</strong>
      <button class="icon" title=${t("common.close")} @click=${() => (this._selected = null)}>✕</button>
    </div>`;
  }

  private _cmInput(label: string, value: number, set: (v: number) => void, min = 20) {
    return html`<label class="field">
      <span>${label}</span>
      <input
        type="number"
        min=${min}
        step="10"
        .value=${String(Math.round(value))}
        @change=${(e: Event) => {
          const v = Math.round(Number((e.target as HTMLInputElement).value));
          if (v >= min) this._commit(() => set(v));
        }}
      />
    </label>`;
  }

  /** What the orientation controls act on: the active tool's next item,
   * else the selected door / window / stairs. */
  private _orientTarget():
    | { kind: "tool-opening"; type: OpeningType }
    | { kind: "tool-stairs" }
    | { kind: "opening"; item: PlanOpening }
    | { kind: "stair"; item: PlanStair }
    | { kind: "radiator"; item: PlanRadiator }
    | null {
    if (this._mode === "fixtures") {
      const sel = this._selItem();
      return sel?.kind === "radiator" ? { kind: "radiator", item: sel.item } : null;
    }
    if (isOpeningTool(this._tool)) return { kind: "tool-opening", type: this._tool };
    if (this._tool === "stairs") return { kind: "tool-stairs" };
    const sel = this._selItem();
    if (sel?.kind === "opening") return { kind: "opening", item: sel.item };
    if (sel?.kind === "stair") return { kind: "stair", item: sel.item };
    return null;
  }

  /** Rotate / mirror / resize the next item or the selected one. Arrows:
   * ← → rotate, ↑ ↓ mirror (doors); stairs climb towards the arrow. */
  private _orient(action: Orient) {
    const target = this._orientTarget();
    if (!target) return;
    const step = action === "wider" ? 10 : action === "narrower" ? -10 : 0;
    const door = (o: { flip?: boolean; out?: boolean }) => {
      if (action === "right" || action === "rotate") rotateDoor(o, 1);
      else if (action === "left") rotateDoor(o, -1);
      else if (action === "up" || action === "down" || action === "mirror") o.flip = !o.flip;
    };
    const dir = (d: PlanStair["dir"]): PlanStair["dir"] => {
      if (action === "rotate") return NEXT_DIR[d];
      if (action === "mirror") return OPPOSITE_DIR[d];
      if (action === "left" || action === "right" || action === "up" || action === "down") return action;
      return d;
    };
    switch (target.kind) {
      case "tool-opening": {
        const opts = { ...this._openingOpts[target.type] };
        if (step) opts.width = Math.max(30, opts.width + step);
        else if (directed(target.type)) door(opts);
        this._openingOpts = { ...this._openingOpts, [target.type]: opts };
        break;
      }
      case "tool-stairs":
        if (action === "goes-up" || action === "goes-down") this._stairGoes = action === "goes-up" ? "up" : "down";
        else this._stairDir = dir(this._stairDir);
        break;
      case "opening": {
        const o = target.item;
        if (step) this._commit(() => (o.width = Math.max(30, o.width + step)));
        else if (directed(o.type)) this._commit(() => door(o));
        break;
      }
      case "radiator": {
        const r = target.item;
        if (step) this._commit(() => (r.length = Math.max(20, r.length + step)));
        else if (action === "left" || action === "rotate") this._commit(() => (r.angle = (r.angle + 270) % 360));
        else if (action === "right") this._commit(() => (r.angle = (r.angle + 90) % 360));
        else if (action === "up" || action === "down" || action === "mirror") this._commit(() => (r.angle = (r.angle + 180) % 360));
        break;
      }
      case "stair": {
        const st = target.item;
        if (action === "goes-up" || action === "goes-down") this._commit(() => (st.goes = action === "goes-up" ? "up" : "down"));
        else if (!step) this._commit(() => (st.dir = dir(st.dir)));
        break;
      }
    }
  }

  /** Segmented choice; labels from builder.<prefix>_<value>. */
  private _choice(label: string, values: string[], current: string, prefix: string, set: (v: string) => void) {
    return html`<div class="field">
      <span>${label}</span>
      <div class="seg wrap">
        ${values.map(
          (v) => html`<button class=${v === current ? "on" : ""} @click=${() => v !== current && set(v)}>
            ${t(`builder.${prefix}_${v}`)}
          </button>`
        )}
      </div>
    </div>`;
  }

  /** Colour: presets, a picker, or the default (unset). */
  private _colorControl(value: string | undefined, presets: string[], set: (v: string | undefined) => void, label = t("builder.style_color")) {
    return html`<div class="field">
      <span>${label}</span>
      <div class="swatches">
        <button class="swatch none ${value ? "" : "on"}" title=${t("builder.style_color_default")} @click=${() => set(undefined)}></button>
        ${presets.map(
          (c) => html`<button class="swatch ${value === c ? "on" : ""}" style="--sw:${c}" title=${c} @click=${() => set(c)}></button>`
        )}
        <label class="swatch picker ${value && !presets.includes(value) ? "on" : ""}" title=${t("builder.style_color_custom")} style=${value && !presets.includes(value) ? `--sw:${value}` : ""}>
          <input type="color" .value=${value ?? "#888888"} @change=${(e: Event) => set((e.target as HTMLInputElement).value)} />
        </label>
      </div>
    </div>`;
  }

  /** Style and colour of a door / window (the next one, or one placed). */
  private _openingStyleControls(type: OpeningType, item: { style?: string; color?: string }, set: (patch: { style?: string; color?: string }) => void) {
    return html`${this._choice(t("builder.style"), OPENING_STYLES[type], openingStyle({ type, style: item.style }), `style_${type}`, (v) =>
        set({ style: v })
      )}
      ${this._colorControl(item.color, FRAME_COLORS, (v) => set({ color: v }))}`;
  }

  /** Shape, turn and colour of stairs. */
  private _stairStyleControls(item: { shape?: StairShape; turn?: "left" | "right"; color?: string }, set: (patch: { shape?: StairShape; turn?: "left" | "right"; color?: string }) => void) {
    const shape = item.shape ?? "straight";
    return html`${this._choice(t("builder.stairs_shape"), STAIR_SHAPES, shape, "stairs_shape", (v) =>
        set({ shape: v as StairShape, turn: v === "straight" ? undefined : (item.turn ?? "right") })
      )}
      ${shape === "straight"
        ? nothing
        : this._choice(t("builder.stairs_side"), ["left", "right"], item.turn ?? "right", "stairs_side", (v) => set({ turn: v as "left" | "right" }))}
      ${this._colorControl(item.color, STAIR_COLORS, (v) => set({ color: v }))}`;
  }

  private _widthControl(width: number, set: (v: number) => void) {
    return html`<div class="field">
      <span>${t("builder.width_cm")}</span>
      <div class="stepper">
        <button title="−10 cm (−)" @click=${() => this._orient("narrower")}>−</button>
        <input
          type="number"
          min="30"
          step="10"
          .value=${String(Math.round(width))}
          @change=${(e: Event) => {
            const v = Math.round(Number((e.target as HTMLInputElement).value));
            if (v >= 30) set(v);
          }}
        />
        <button title="+10 cm (+)" @click=${() => this._orient("wider")}>＋</button>
      </div>
    </div>`;
  }

  private _orientButtons(stairs: boolean) {
    return html`<div class="row">
      <button title=${stairs ? "← ↑ → ↓" : "← →"} @click=${() => this._orient("rotate")}>↻ ${t("builder.rotate")}</button>
      <button title=${stairs ? "" : "↑ ↓"} @click=${() => this._orient("mirror")}>⇋ ${t("builder.mirror")}</button>
    </div>`;
  }

  /** Settings of the next item, shown while its tool is active. */
  private _toolPanel() {
    const target = this._orientTarget();
    if (target?.kind === "tool-opening") {
      const opts = this._openingOpts[target.type];
      return html`<div class="selection">
        <div class="sel-head"><strong>${t(`builder.tool_${target.type}`)}</strong>${this._toolClose()}</div>
        ${this._widthControl(opts.width, (v) =>
          (this._openingOpts = { ...this._openingOpts, [target.type]: { ...opts, width: v } })
        )}
        ${directed(target.type) ? this._orientButtons(false) : nothing}
        ${this._openingStyleControls(target.type, opts, (patch) => {
          const next = { ...this._openingOpts[target.type], ...patch };
          if (next.style === OPENING_STYLES[target.type][0]) delete next.style;
          this._openingOpts = { ...this._openingOpts, [target.type]: next };
        })}
        <p class="keys">${directed(target.type) ? t("builder.keys_door") : t("builder.keys_width")}</p>
      </div>`;
    }
    if (target?.kind === "tool-stairs") {
      return html`<div class="selection">
        <div class="sel-head"><strong>${t("builder.tool_stairs")}</strong>${this._toolClose()}</div>
        ${this._goesControl(this._stairGoes)}
        <p class="stats">${t("builder.stairs_climb")} <strong class="dir">${ARROW[this._stairDir]}</strong></p>
        ${this._orientButtons(true)}
        ${this._stairStyleControls(this._stairStyle, (patch) => {
          this._stairStyle = { ...this._stairStyle, ...patch, turn: patch.turn ?? this._stairStyle.turn };
        })}
        <p class="keys">${t("builder.keys_stairs")}</p>
      </div>`;
    }
    return nothing;
  }

  /** Left panel in fixtures mode: shutters and radiators of the floor's
   * rooms still to place. */
  private _fixturesPanel() {
    const rooms = this._levelRooms();
    const placedC = this._placedCovers();
    const placedR = this._placedRadiators();
    const sel = this._selItem();
    const opening = sel?.kind === "opening" && GLAZED.includes(sel.item.type) ? sel.item : null;
    const covers = rooms
      .map((r) => ({ room: r, items: this._roomCovers(r).filter((c) => !placedC.has(c)) }))
      .filter((g) => g.items.length);
    const radiators = rooms
      .map((r) => ({ room: r, items: this._roomRadiators(r).filter((d) => !placedR.has(d)) }))
      .filter((g) => g.items.length);
    const placedL = this._placedLights();
    const lights = rooms
      .map((r) => ({ room: r, items: this._roomLights(r).filter((en) => !placedL.has(en)) }))
      .filter((g) => g.items.length);
    return html`<aside>
      <h3>🪟 ${t("builder.fx_shutters")}</h3>
      <p class="hint">${opening ? t("builder.fx_shutters_hint_selected") : t("builder.fx_shutters_hint")}</p>
      ${covers.map(
        (g) => html`<div class="fx-room">${g.room.name}</div>
          <div class="chips">
            ${g.items.map(
              (c) => html`<div
                class="chip ${opening ? "clickable" : ""}"
                draggable="true"
                @dragstart=${(e: DragEvent) => {
                  e.dataTransfer?.setData("text/homex-cover", c);
                  e.dataTransfer!.effectAllowed = "link";
                }}
                @click=${() => opening && this._fitCover(opening, c)}
              >
                <span>${this._coverName(c)}</span>
              </div>`
            )}
          </div>`
      )}
      ${covers.length ? nothing : html`<p class="hint">${t("builder.fx_no_shutters")}</p>`}
      <h3 class="fx-h">♨️ ${t("builder.fx_radiators")}</h3>
      <p class="hint">${t("builder.fx_radiators_hint")}</p>
      ${radiators.map(
        (g) => html`<div class="fx-room">${g.room.name}</div>
          <div class="chips">
            ${g.items.map(
              (d) => html`<div
                class="chip"
                draggable="true"
                @dragstart=${(e: DragEvent) => {
                  e.dataTransfer?.setData("text/homex-radiator", d);
                  e.dataTransfer!.effectAllowed = "link";
                }}
              >
                <span>${this._deviceName(d)}</span>
              </div>`
            )}
          </div>`
      )}
      ${radiators.length ? nothing : html`<p class="hint">${t("builder.fx_no_radiators")}</p>`}
      <h3 class="fx-h">💡 ${t("builder.fx_lights")}</h3>
      <p class="hint">${t("builder.fx_lights_hint")}</p>
      ${lights.map(
        (g) => html`<div class="fx-room">${g.room.name}</div>
          <div class="chips">
            ${g.items.map(
              (en) => html`<div
                class="chip clickable"
                draggable="true"
                @dragstart=${(e: DragEvent) => {
                  e.dataTransfer?.setData("text/homex-light", en);
                  e.dataTransfer!.effectAllowed = "link";
                }}
                @click=${() => {
                  if (this._placing) this._stopPlacing();
                  this._startLight(en);
                }}
              >
                <span>${this._lightName(en)}</span>
              </div>`
            )}
          </div>`
      )}
      ${lights.length ? nothing : html`<p class="hint">${t("builder.fx_no_lights")}</p>`}
    </aside>`;
  }

  private _coverPanel(o: PlanOpening) {
    if (!GLAZED.includes(o.type)) return nothing;
    const placed = this._placedCovers();
    const options = this._levelRooms().flatMap((r) => this._roomCovers(r)).filter((c) => c === o.cover || !placed.has(c));
    const st = o.cover ? this.hass.states[o.cover] : undefined;
    return html`<div class="selection">
      ${this._panelHead(t(`builder.tool_${o.type}`))}
      <label class="field">
        <span>${t("builder.fx_shutter")}</span>
        <select @change=${(e: Event) => this._fitCover(o, (e.target as HTMLSelectElement).value || null)}>
          <option value="" ?selected=${!o.cover}>${t("builder.fx_no_shutter")}</option>
          ${options.map((c) => html`<option value=${c} ?selected=${c === o.cover}>${this._coverName(c)}</option>`)}
        </select>
      </label>
      ${st
        ? html`<p class="stats">
            ${t("builder.fx_state")}
            <strong>${st.attributes.current_position !== undefined ? `${st.attributes.current_position} %` : st.state}</strong>
          </p>`
        : nothing}
      ${o.cover
        ? html`${this._choice(t("builder.shutter_type"), ["roller", "hinged"], o.cover_type ?? "roller", "shutter_type", (v) =>
              this._setStyle(o, { cover_type: v === "roller" ? undefined : (v as ShutterType) })
            )}
            ${this._colorControl(o.cover_color, FRAME_COLORS, (v) => this._setStyle(o, { cover_color: v }))}`
        : nothing}
    </div>`;
  }

  private _lightPanel(l: PlanLight) {
    const placing = this._placing === l.id;
    const { on } = this._lightColor(l.entity_id);
    const type = lightType(l);
    const parts = l.kind === "point" ? l.points.length : l.lines.length;
    return html`<div class="selection">
      ${this._panelHead(this._lightName(l.entity_id))}
      <p class="stats">${on ? t("builder.fx_on") : t("builder.fx_off")}</p>
      ${this._choice(t("builder.light_mount"), ["ceiling", "floor", "wall"], l.mount, "light_mount", (v) => this._setLightOpt("mount", v))}
      ${this._choice(t("builder.light_type"), LIGHT_TYPES[l.mount], type, "light_type", (v) => this._setLightOpt("type", v))}
      ${type === "led_strip"
        ? nothing
        : this._choice(t("builder.light_shape"), ["round", "square"], l.shape ?? "round", "light_shape", (v) =>
            this._setStyle(l, { shape: v === "round" ? undefined : (v as "square") })
          )}
      ${SHADED.includes(type)
        ? this._choice(t("builder.light_shade"), ["no", "yes"], l.shade ? "yes" : "no", "light_shade", (v) =>
            this._setStyle(l, { shade: v === "yes" })
          )
        : nothing}
      ${this._colorControl(l.color, LIGHT_COLORS, (v) => this._setStyle(l, { color: v }), t("builder.light_color"))}
      <p class="stats">
        ${t(l.kind === "point" ? "builder.light_points" : "builder.light_lines", { count: parts })}
      </p>
      ${placing
        ? html`<p class="hint">
              ${l.kind === "point"
                ? t("builder.light_hint_point")
                : this._lineStart
                  ? t("builder.light_hint_line_end")
                  : t("builder.light_hint_line_start")}
              ${l.mount === "wall" ? t("builder.light_hint_wall") : ""}
            </p>
            <div class="row">
              <button class="primary" @click=${() => this._stopPlacing()}>✓ ${t("builder.light_done")}</button>
            </div>`
        : html`<div class="row">
            <button @click=${() => this._startLight(l.entity_id)}>＋ ${t(l.kind === "point" ? "builder.light_add_points" : "builder.light_add_lines")}</button>
          </div>`}
      <p class="keys">${placing ? t("builder.keys_light_placing") : t("builder.keys_light")}</p>
      <button class="danger-link" @click=${() => this._removeLight(l.id)}>${t("builder.fx_remove")}</button>
    </div>`;
  }

  private _radiatorPanel(r: PlanRadiator) {
    const climate = this._climateOf(r.device_id);
    const st = climate ? this.hass.states[climate] : undefined;
    return html`<div class="selection">
      ${this._panelHead(this._deviceName(r.device_id))}
      <div class="field">
        <span>${t("builder.radiator_type")}</span>
        <div class="seg kinds">
          ${(["panel", "tall"] as RadiatorKind[]).map(
            (kind) => html`<button
              class=${(r.kind ?? "panel") === kind ? "on" : ""}
              @click=${() =>
                (r.kind ?? "panel") !== kind &&
                this._commit(() => {
                  r.kind = kind;
                  r.length = RADIATOR_LENGTH[kind];
                })}
            >
              ${kind === "tall" ? "▮" : "▬"} ${t(`builder.radiator_${kind}`)}
            </button>`
          )}
        </div>
      </div>
      ${st
        ? html`<p class="stats">
            ${st.attributes.hvac_action === "heating" ? t("builder.fx_heating") : t("builder.fx_idle")}
            ${st.attributes.current_temperature !== undefined ? html` · <strong>${st.attributes.current_temperature} °C</strong>` : nothing}
            ${st.attributes.temperature !== undefined ? html` → ${st.attributes.temperature} °C` : nothing}
          </p>`
        : nothing}
      <div class="field">
        <span>${t("builder.length_cm")}</span>
        <div class="stepper">
          <button @click=${() => this._orient("narrower")}>−</button>
          <input
            type="number"
            min="20"
            step="10"
            .value=${String(Math.round(r.length))}
            @change=${(e: Event) => {
              const v = Math.round(Number((e.target as HTMLInputElement).value));
              if (v >= 20) this._commit(() => (r.length = v));
            }}
          />
          <button @click=${() => this._orient("wider")}>＋</button>
        </div>
      </div>
      ${this._orientButtons(false)}
      <p class="keys">${t("builder.keys_radiator")}</p>
      <button class="danger-link" @click=${() => this._deleteSelected()}>${t("builder.fx_remove")}</button>
    </div>`;
  }

  /** Up / down toggle, with the floor the stairs lead to. */
  private _goesControl(goes: "up" | "down") {
    const target = this._stairTarget({ goes });
    return html`<div class="seg">
        <button class=${goes === "up" ? "on" : ""} title="PgUp" @click=${() => this._orient("goes-up")}>
          ↑ ${t("builder.stairs_go_up")}
        </button>
        <button class=${goes === "down" ? "on" : ""} title="PgDn" @click=${() => this._orient("goes-down")}>
          ↓ ${t("builder.stairs_go_down")}
        </button>
      </div>
      <p class="stats">
        ${target
          ? t(goes === "up" ? "builder.stairs_to" : "builder.stairs_to_down", { name: target.name })
          : t(goes === "up" ? "builder.stairs_no_above" : "builder.stairs_no_below")}
      </p>`;
  }

  private _openingPanel(o: PlanOpening) {
    return html`<div class="selection">
      ${this._panelHead(t(`builder.tool_${o.type}`))}
      ${this._widthControl(o.width, (v) => this._commit(() => (o.width = v)))}
      ${directed(o.type) ? this._orientButtons(false) : nothing}
      ${this._openingStyleControls(o.type, o, (patch) =>
        this._setStyle(o, { ...patch, ...(patch.style === OPENING_STYLES[o.type][0] ? { style: undefined } : {}) })
      )}
      <p class="keys">${directed(o.type) ? t("builder.keys_door") : t("builder.keys_width")}</p>
      <button class="danger-link" @click=${() => this._deleteSelected()}>${t("builder.item_delete")}</button>
    </div>`;
  }

  private _stairPanel(st: PlanStair) {
    return html`<div class="selection">
      ${this._panelHead(t("builder.tool_stairs"))}
      ${this._goesControl(st.goes ?? "up")}
      ${this._cmInput(t("builder.width_cm"), st.w, (v) => (st.w = v), 40)}
      ${this._cmInput(t("builder.length_cm"), st.h, (v) => (st.h = v), 40)}
      <p class="stats">${t("builder.stairs_climb")} <strong class="dir">${ARROW[st.dir]}</strong></p>
      ${this._orientButtons(true)}
      ${this._stairStyleControls(st, (patch) =>
        this._setStyle(st, { ...patch, ...(patch.shape === "straight" ? { shape: undefined, turn: undefined } : {}) })
      )}
      <p class="keys">${t("builder.keys_stairs")}</p>
      <button class="danger-link" @click=${() => this._deleteSelected()}>${t("builder.item_delete")}</button>
    </div>`;
  }

  private _levelDialog() {
    const editing = this._dialog?.mode === "edit" ? this._level : null;
    const others = this._levels.filter((l) => l !== editing);
    return html`<homex-builder-level-dialog
      .open=${!!this._dialog}
      .level=${editing}
      .floors=${this._floors()}
      .usedFloors=${others.map((l) => l.floor_id).filter(Boolean)}
      .usedLevels=${others.map((l) => l.level)}
      .suggestedLevel=${this._dialog?.suggested ?? 0}
      @level-saved=${this._onLevelSaved}
      @level-deleted=${this._onLevelDeleted}
      @dialog-closed=${() => (this._dialog = null)}
    ></homex-builder-level-dialog>`;
  }

  /** Left column: the active tool's settings or the selection, in place of
   * the rooms / fixtures list (back to the list once closed). */
  private _sidePanel() {
    const tool = this._toolPanel();
    const panel = tool !== nothing ? tool : this._selectionPanel();
    if (panel !== nothing) return html`<aside class="side">${panel}</aside>`;
    return this._mode === "fixtures" ? this._fixturesPanel() : this._roomsPanel();
  }

  render() {
    const saving = {
      idle: "",
      saving: t("builder.saving"),
      saved: t("builder.saved"),
      error: t("builder.save_error"),
    }[this._saving];
    const level = this._level;
    return html`
      ${this._error ? html`<p class="err">${this._error}</p>` : nothing}
      <div class="main">
      ${this._nav(level, saving)}
      ${!this._plan
        ? html`<p class="hint">${t("common.loading")}</p>`
        : !level
          ? html`<div class="empty">
              <div class="empty-icon">🏠</div>
              <h3>${t("builder.empty_title")}</h3>
              <p>${t("builder.empty_text")}</p>
              <button class="primary" @click=${() => this._openLevelDialog("new", 0)}>${t("builder.create_first")}</button>
            </div>`
          : this._mode === "render"
            ? html`<homex-builder-render
                .hass=${this.hass}
                .plan=${this._plan}
                .levelId=${this._levelId}
                .names=${Object.fromEntries(this._rooms.map((r) => [r.room_id, r.name]))}
                .rooms=${this._rooms}
              ></homex-builder-render>`
            : html`<div class="body">
              ${this._sidePanel()}
              <div
                class="stage ${this._dragOver ? "dragover" : ""}"
                @dragover=${this._onDragOver}
                @dragleave=${this._onDragLeave}
                @drop=${this._onDrop}
              >
                ${this._canvas()} ${this._toolbar()}
                ${this._ghost
                  ? html`<div class="ghost-tag">${this._ghostIsAbove ? "↑" : "↓"} ${this._ghost.name}</div>`
                  : nothing}
                <div class="hint-bar">${this._hint()} · ${t("builder.grid", { size: "50 cm" })}</div>
                ${this._floorSwitcher()}
              </div>
            </div>`}
      </div>
      ${this._levelDialog()}
    `;
  }

  /** The builder's only bar, floating top right: back, the three tabs, the
   * save status and — on the 3D view — Publish (the dashboard's 3D tab). */
  private _nav(level: PlanLevel | undefined, saving: string) {
    const published = !!this._plan?.published;
    return html`<div class="nav">
      <button class="back" title=${t("builder.back")} @click=${this._close}>←</button>
      ${level
        ? html`<div class="seg mode">
            <button class=${this._mode === "structure" ? "on" : ""} @click=${() => this._goMode("structure")}>
              🧱 ${t("builder.mode_structure")}
            </button>
            <button class=${this._mode === "fixtures" ? "on" : ""} @click=${() => this._goMode("fixtures")}>
              🔌 ${t("builder.mode_fixtures")}
            </button>
            <button class=${this._mode === "render" ? "on" : ""} @click=${() => this._goMode("render")}>
              🏠 ${t("builder.mode_render")}
            </button>
          </div>`
        : nothing}
      ${saving ? html`<span class="status ${this._saving}">${saving}</span>` : nothing}
      ${level && this._mode === "render"
        ? html`<button
            class="publish ${published ? "on" : ""}"
            title=${published ? t("builder.unpublish_hint") : t("builder.publish_hint")}
            @click=${() => this._setPublished(!published)}
          >
            ${published ? html`✓ ${t("builder.published")}` : html`🚀 ${t("builder.publish")}`}
          </button>`
        : nothing}
    </div>`;
  }

  /** Publish (or withdraw) the 3D house: the Homex dashboard shows it in its own tab. */
  private _setPublished(on: boolean) {
    if (!this._plan) return;
    this._plan.published = on;
    this._changed();
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 32px);
      }
      .main {
        position: relative;
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }
      .nav {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 6;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px;
        background: color-mix(in srgb, var(--card-background-color, #1c1c1c) 92%, transparent);
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
      }
      .nav .seg.mode {
        margin: 0;
      }
      .nav .publish {
        font-weight: 600;
        white-space: nowrap;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .nav .publish.on {
        background: color-mix(in srgb, #4caf7a 20%, transparent);
        color: #4caf7a;
        box-shadow: inset 0 0 0 1px #4caf7a;
      }
      .status {
        /* under the bar: it never shifts the buttons */
        position: absolute;
        top: calc(100% + 4px);
        right: 6px;
        font-size: 11.5px;
        white-space: nowrap;
        color: var(--secondary-text-color);
        pointer-events: none;
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
        line-height: 1.45;
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
        flex: 1 1 auto;
        min-height: 0;
        display: grid;
        grid-template-columns: 250px minmax(0, 1fr);
        gap: 12px;
      }
      aside {
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
        border-radius: 12px;
        background: var(--card-background-color);
      }
      aside h3 {
        margin: 0 0 4px;
        font-size: 14px;
        font-weight: 600;
      }
      .chips {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 8px;
      }
      .chip {
        padding: 8px 10px;
        border-radius: 8px;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
        cursor: grab;
        font-size: 13px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
        user-select: none;
        background: var(--card-background-color);
      }
      .chip:hover,
      .chip.clickable {
        border-color: var(--primary-color);
      }
      .chip.clickable {
        cursor: pointer;
      }
      .nofloor {
        font-size: 11px;
        color: var(--secondary-text-color);
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
        margin-top: 8px;
        background: transparent;
        padding: 4px 0;
        color: var(--error-color, #db4437);
      }
      .stats {
        font-size: 13px;
        margin: 10px 0 0;
      }
      .stage {
        position: relative;
        min-height: 360px;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
        background: var(--card-background-color, #1c1c1c);
      }
      .stage.dragover {
        border-color: var(--primary-color);
      }
      /* Floating UI over the editor. */
      .toolbar,
      .floors,
      .ghost-tag,
      .hint-bar {
        position: absolute;
        background: color-mix(in srgb, var(--card-background-color, #1c1c1c) 92%, transparent);
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
      }
      .toolbar {
        top: 10px;
        left: 10px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        padding: 4px;
        max-width: calc(100% - 400px); /* the nav floats top right */
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
      aside.side .selection {
        padding: 0;
      }
      .sel-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
      }
      button.icon {
        background: transparent;
        padding: 2px 6px;
      }
      .ghost-tag {
        top: 58px;
        left: 10px;
        font-size: 12px;
        padding: 3px 8px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .hint-bar {
        bottom: 10px;
        left: 10px;
        right: 90px;
        width: fit-content;
        max-width: calc(100% - 110px);
        font-size: 12px;
        padding: 5px 10px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .floors {
        right: 10px;
        bottom: 10px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        max-height: calc(100% - 20px);
        overflow-y: auto;
      }
      .floors button {
        border-radius: 0;
        background: transparent;
        min-width: 56px;
        padding: 8px 10px;
      }
      .floors button + button {
        border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
      }
      .floor-add {
        color: var(--primary-color);
        font-size: 18px;
        line-height: 1;
      }
      .floor {
        display: flex;
        align-items: center;
        gap: 8px;
        text-align: left;
      }
      .floor .num {
        font-weight: 700;
        min-width: 20px;
        text-align: center;
      }
      .floor .fname {
        display: none;
        font-size: 12px;
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .floor.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .floor.active .fname,
      .floors:hover .fname {
        display: inline;
      }
      .floor .edit {
        opacity: 0.8;
      }
      svg.canvas {
        position: absolute;
        inset: 0;
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
      .stepper {
        display: flex;
        gap: 4px;
      }
      .stepper input {
        flex: 1;
        min-width: 0;
        text-align: center;
      }
      .keys {
        font-size: 11px;
        color: var(--secondary-text-color);
        margin: 8px 0 0;
      }
      strong.dir {
        font-size: 16px;
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 10px;
      }
      .op line,
      .op path,
      .op polygon {
        vector-effect: non-scaling-stroke;
        fill: none;
      }
      .op .gap {
        stroke: var(--card-background-color, #1c1c1c);
        stroke-width: 5;
      }
      .op .leaf {
        stroke: var(--oc, var(--primary-text-color));
        stroke-width: 2;
      }
      .op .leaf-body {
        stroke: var(--oc, var(--primary-text-color));
        stroke-width: 1.5;
        fill: color-mix(in srgb, var(--oc, #9e9e9e) 60%, transparent);
      }
      .op .leaf-body.glazed {
        fill: color-mix(in srgb, #4fc3f7 30%, transparent);
      }
      .op .swing.tilt {
        stroke-dasharray: 2 3;
      }
      .op .swing {
        stroke: var(--secondary-text-color);
        stroke-width: 1;
        stroke-dasharray: 4 3;
      }
      .op .frame {
        stroke: var(--oc, #4fc3f7);
        stroke-width: 1.5;
      }
      .op.glass_door .frame {
        fill: rgba(79, 195, 247, 0.18);
      }
      .op .pane {
        stroke: #4fc3f7;
        stroke-width: 1.5;
      }
      .op .slide-leaf {
        stroke: var(--oc, var(--primary-text-color));
        stroke-width: 1.5;
        fill: color-mix(in srgb, var(--oc, #7f7f7f) 45%, transparent);
      }
      .op .slide-leaf.glazed {
        fill: color-mix(in srgb, #4fc3f7 30%, transparent);
      }
      .op .slide-open {
        stroke: var(--secondary-text-color);
        stroke-width: 1;
        stroke-dasharray: 4 3;
      }
      .op .slide-arrow {
        stroke: var(--secondary-text-color);
        stroke-width: 1.5;
      }
      .op .slide-head {
        fill: var(--secondary-text-color);
        stroke: none;
      }
      .op.selected .slide-leaf {
        stroke: var(--accent-color, #ff9800);
      }
      .op .hit {
        stroke: transparent;
        stroke-width: 16;
        cursor: pointer;
      }
      .op.selected .leaf,
      .op.selected .frame,
      .op.selected .pane {
        stroke: var(--accent-color, #ff9800);
      }
      .op.preview {
        opacity: 0.6;
        pointer-events: none;
      }
      .stair-bg {
        fill: rgba(127, 127, 127, 0.22);
        stroke: var(--primary-text-color);
        stroke-width: 1.5;
        vector-effect: non-scaling-stroke;
        cursor: move;
      }
      .stair .tread {
        stroke: var(--primary-text-color);
        stroke-opacity: 0.55;
        stroke-width: 1;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .stair .arrow {
        stroke: var(--primary-text-color);
        stroke-width: 1.5;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .stair .arrow-head {
        fill: var(--primary-text-color);
        pointer-events: none;
      }
      .stair.styled .stair-bg {
        fill: color-mix(in srgb, var(--sc) 50%, transparent);
      }
      .stair .tread.edge {
        stroke-opacity: 0.9;
      }
      .stair .arrow {
        fill: none;
      }
      .stair.selected .stair-bg {
        stroke: var(--accent-color, #ff9800);
        stroke-width: 3;
      }
      .seg.mode {
        margin: 0 0 0 8px;
        flex: none;
      }
      .seg.mode button {
        flex: none;
        padding: 6px 12px;
        white-space: nowrap; /* icon and label on one line */
      }
      .fx-room {
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-text-color);
        margin: 10px 0 4px;
      }
      aside h3.fx-h {
        margin-top: 18px;
      }
      .op .shutter {
        fill: var(--cc, #7e57c2);
        stroke: var(--cc, #7e57c2);
        stroke-width: 1;
        vector-effect: non-scaling-stroke;
      }
      .op.needs-cover .frame {
        stroke: var(--accent-color, #ff9800);
        stroke-dasharray: 4 3;
      }
      .op.drop .frame {
        fill: color-mix(in srgb, var(--accent-color, #ff9800) 45%, transparent);
      }
      .op.locked .hit {
        pointer-events: none;
      }
      .fx-tag {
        fill: var(--primary-text-color);
        font-weight: 600;
        paint-order: stroke;
        stroke: var(--card-background-color, #1c1c1c);
        stroke-width: 3px;
        pointer-events: none;
      }
      .radiator polygon {
        fill: rgba(158, 158, 158, 0.55);
        stroke: var(--primary-text-color);
        stroke-width: 1.2;
        vector-effect: non-scaling-stroke;
        cursor: move;
      }
      .radiator .fin {
        stroke: var(--primary-text-color);
        stroke-opacity: 0.6;
        stroke-width: 1;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .seg.kinds button {
        flex: 1;
        white-space: nowrap;
        padding-left: 6px;
        padding-right: 6px;
      }
      .radiator.tall polygon {
        fill: rgba(158, 158, 158, 0.8);
        stroke-width: 2;
      }
      .radiator.heating polygon {
        fill: rgba(255, 112, 67, 0.85);
        stroke: #ff7043;
      }
      .radiator.selected polygon {
        stroke: var(--accent-color, #ff9800);
        stroke-width: 3;
      }
      .light .lp {
        fill: var(--fc, var(--card-background-color, #1c1c1c));
        stroke: var(--lc);
        stroke-width: 2;
        vector-effect: non-scaling-stroke;
      }
      .light.on .lp {
        fill: var(--lc);
        stroke: var(--primary-text-color);
      }
      .light .lp-x {
        stroke: var(--lc);
        stroke-width: 1.5;
        vector-effect: non-scaling-stroke;
      }
      .light.on .lp-x {
        stroke: var(--card-background-color, #1c1c1c);
      }
      .light .lp-dot {
        fill: var(--lc);
      }
      .light .lp-in {
        fill: none;
        stroke: var(--lc);
        stroke-width: 1.5;
        vector-effect: non-scaling-stroke;
      }
      .light.on .lp-in {
        stroke: var(--card-background-color, #1c1c1c);
      }
      .light .lp-shade {
        fill: none;
        stroke: var(--fc, var(--secondary-text-color));
        stroke-width: 1.5;
        stroke-dasharray: 3 2;
        vector-effect: non-scaling-stroke;
      }
      .light.on .lp-dot {
        fill: var(--card-background-color, #1c1c1c);
      }
      .light .ll {
        stroke: var(--lc);
        stroke-width: 4;
        stroke-linecap: round;
        vector-effect: non-scaling-stroke;
      }
      .light:not(.on) .ll {
        stroke: var(--fc, var(--lc));
      }
      .light.m-floor .ll {
        stroke-dasharray: 8 4;
      }
      .light.m-wall .ll {
        stroke-width: 6;
        stroke-linecap: butt;
      }
      .light .glow {
        fill: var(--lc);
        opacity: 0.18;
        pointer-events: none;
      }
      .light .glow-line {
        stroke: var(--lc);
        stroke-width: 16;
        stroke-linecap: round;
        opacity: 0.18;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .light .light-hit {
        fill: transparent;
        stroke: transparent;
        stroke-width: 14;
        vector-effect: non-scaling-stroke;
        cursor: move;
      }
      .light.selected .lp,
      .light.selected .ll {
        stroke: var(--accent-color, #ff9800);
      }
      .light .le {
        fill: var(--card-background-color, #fff);
        stroke: var(--accent-color, #ff9800);
        stroke-width: 2;
        vector-effect: non-scaling-stroke;
        cursor: grab;
      }
      .lights.locked {
        pointer-events: none;
      }
      .light-preview circle {
        fill: none;
        stroke: var(--accent-color, #ff9800);
        stroke-width: 2;
        stroke-dasharray: 3 2;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .light-preview .ll {
        stroke: var(--accent-color, #ff9800);
        stroke-width: 4;
        stroke-linecap: round;
        opacity: 0.7;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .radiators.locked {
        pointer-events: none;
      }
      .seg {
        display: flex;
        margin-top: 8px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      }
      .seg button {
        flex: 1;
        border-radius: 0;
        background: transparent;
      }
      .seg.wrap {
        flex-wrap: wrap;
      }
      .seg.wrap button {
        flex: 1 1 auto;
        font-size: 12px;
        padding: 6px 8px;
      }
      .swatches {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 6px;
        align-items: center;
      }
      .swatch {
        flex: 0 0 24px;
        width: 24px;
        height: 24px;
        min-width: 0;
        min-height: 0;
        max-height: 24px;
        line-height: 0;
        font-size: 0;
        padding: 0;
        margin: 0;
        border-radius: 50%;
        border: 2px solid var(--divider-color, rgba(127, 127, 127, 0.5));
        background: var(--sw, transparent);
        cursor: pointer;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      }
      .swatch.on {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 40%, transparent);
      }
      .swatch.none {
        background: linear-gradient(135deg, transparent 45%, var(--error-color, #db4437) 45% 55%, transparent 55%);
      }
      .swatch.picker {
        background: var(--sw, conic-gradient(red, yellow, lime, cyan, blue, magenta, red));
      }
      .swatch.picker input {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
        width: 100%;
        height: 100%;
      }
      .seg button.on {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .stair-tag {
        fill: var(--primary-text-color);
        font-weight: 700;
        paint-order: stroke;
        stroke: var(--card-background-color, #1c1c1c);
        stroke-width: 3px;
        pointer-events: none;
      }
      /* Stairs arriving from the neighbouring floor. */
      .arrival {
        pointer-events: none;
      }
      .arrival .stair-bg {
        fill: rgba(171, 71, 188, 0.22);
        stroke: #ab47bc;
        stroke-width: 2;
        cursor: default;
      }
      .arrival .tread,
      .arrival .arrow {
        stroke: #ab47bc;
      }
      .arrival .arrow-head {
        fill: #ab47bc;
      }
      .arrival .stair-tag {
        fill: #ce93d8;
      }
      .ghost-stair {
        opacity: 0.4;
        pointer-events: none;
      }
      .ghost-stair .stair-bg {
        stroke-dasharray: 6 4;
      }
      svg.tool-door,
      svg.tool-window,
      svg.tool-glass_door,
      svg.tool-stairs {
        cursor: crosshair;
      }
      @media (max-width: 800px) {
        :host {
          height: auto;
        }
        .body {
          grid-template-columns: 1fr;
        }
        aside {
          max-height: 30vh;
        }
        .stage {
          height: 65vh;
        }
        .tool span,
        .hint-bar {
          display: none;
        }
      }
    `,
  ];
}
