/** 3D Builder: doors, windows, glass doors (set in walls) and stairs. */
import type {
  LightMount,
  LightType,
  OpeningType,
  PlanLevel,
  PlanLight,
  PlanOpening,
  PlanPoint,
  PlanStair,
  StairShape,
} from "../types";
import { projectOnSegment, roundTo, segLength } from "./plan-geometry";

export const OPENING_WIDTH: Record<OpeningType, number> = {
  door: 90,
  sliding_door: 90,
  window: 120,
  glass_door: 240,
};

export interface WallSpot {
  shape: string;
  edge: number;
  /** Centre position along the wall, as a ratio. */
  t: number;
  len: number;
  dist: number;
}

export interface OpeningGeometry {
  a: PlanPoint; // start of the opening (hinge side by default)
  b: PlanPoint;
  c: PlanPoint;
  u: PlanPoint; // unit vector along the wall
  n: PlanPoint; // unit normal (towards the room's inside for a CCW/CW-agnostic guess)
}

const wall = (level: PlanLevel, shapeId: string, edge: number): [PlanPoint, PlanPoint] | null => {
  const shape = level.rooms.find((s) => s.id === shapeId);
  if (!shape || edge < 0 || edge >= shape.points.length) return null;
  return [shape.points[edge], shape.points[(edge + 1) % shape.points.length]];
};

export function openingGeometry(level: PlanLevel, o: PlanOpening): OpeningGeometry | null {
  const w = wall(level, o.shape, o.edge);
  if (!w) return null;
  const [p, q] = w;
  const len = segLength(p, q);
  if (!len) return null;
  const u: PlanPoint = [(q[0] - p[0]) / len, (q[1] - p[1]) / len];
  const c: PlanPoint = [p[0] + (q[0] - p[0]) * o.t, p[1] + (q[1] - p[1]) * o.t];
  const half = Math.min(o.width, len) / 2;
  const a: PlanPoint = [c[0] - u[0] * half, c[1] - u[1] * half];
  const b: PlanPoint = [c[0] + u[0] * half, c[1] + u[1] * half];
  // Normal pointing into the room: test a point slightly off the wall.
  const shape = level.rooms.find((s) => s.id === o.shape)!;
  let n: PlanPoint = [-u[1], u[0]];
  if (!inside([c[0] + n[0] * 5, c[1] + n[1] * 5], shape.points)) n = [u[1], -u[0]];
  return { a, b, c, u, n };
}

function inside(p: PlanPoint, pts: PlanPoint[]): boolean {
  let r = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) r = !r;
  }
  return r;
}

/** The wall nearest to p (within tol cm), with the opening centred on the
 * 10 cm step and kept inside the wall. */
export function nearestWall(level: PlanLevel, p: PlanPoint, tol: number, width: number): WallSpot | null {
  let best: WallSpot | null = null;
  for (const s of level.rooms) {
    s.points.forEach((a, i) => {
      const b = s.points[(i + 1) % s.points.length];
      const q = projectOnSegment(p, a, b);
      const d = segLength(p, q);
      const len = segLength(a, b);
      if (d > tol || !len || (best && d >= best.dist)) return;
      let along = roundTo(segLength(a, q), 10);
      const half = Math.min(width, len) / 2;
      along = Math.max(half, Math.min(len - half, along));
      best = { shape: s.id, edge: i, t: along / len, len, dist: d };
    });
  }
  return best;
}

/** Keep openings on their wall when a corner is inserted in edge `edge` at
 * ratio `r` (the edge becomes edges edge and edge + 1). */
export function remapInsert(level: PlanLevel, shapeId: string, edge: number, r: number) {
  for (const o of level.openings ?? []) {
    if (o.shape !== shapeId) continue;
    if (o.edge > edge) o.edge += 1;
    else if (o.edge === edge) {
      if (o.t < r) o.t = o.t / r;
      else {
        o.edge += 1;
        o.t = (o.t - r) / (1 - r);
      }
    }
  }
}

/** Keep openings on their wall when corner `v` of an n-corner outline is
 * removed: its two walls (lengths l1 before it, l2 after it) merge. */
export function remapRemove(level: PlanLevel, shapeId: string, v: number, n: number, l1: number, l2: number) {
  const prev = (v + n - 1) % n;
  const merged = v === 0 ? n - 2 : v - 1;
  for (const o of level.openings ?? []) {
    if (o.shape !== shapeId) continue;
    if (o.edge === prev) {
      o.t = (o.t * l1) / (l1 + l2);
      o.edge = merged;
    } else if (o.edge === v) {
      o.t = (l1 + o.t * l2) / (l1 + l2);
      o.edge = merged;
    } else if (v === 0 || o.edge > v) {
      o.edge -= 1;
    }
  }
}

export function stairPoints(s: PlanStair): PlanPoint[] {
  return [
    [s.x, s.y],
    [s.x + s.w, s.y],
    [s.x + s.w, s.y + s.h],
    [s.x, s.y + s.h],
  ];
}

/** Tread lines across the climb, every ~25 cm. */
export function stairTreads(s: PlanStair): [PlanPoint, PlanPoint][] {
  const vertical = s.dir === "up" || s.dir === "down";
  const length = vertical ? s.h : s.w;
  const count = Math.max(2, Math.round(length / 25));
  const out: [PlanPoint, PlanPoint][] = [];
  for (let i = 1; i < count; i++) {
    const f = i / count;
    out.push(
      vertical
        ? [
            [s.x, s.y + s.h * f],
            [s.x + s.w, s.y + s.h * f],
          ]
        : [
            [s.x + s.w * f, s.y],
            [s.x + s.w * f, s.y + s.h],
          ]
    );
  }
  return out;
}

/** Arrow along the climb: from the bottom step to the top. */
export function stairArrow(s: PlanStair): [PlanPoint, PlanPoint] {
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  const m = 0.12;
  switch (s.dir) {
    case "up":
      return [[cx, s.y + s.h * (1 - m)], [cx, s.y + s.h * m]];
    case "down":
      return [[cx, s.y + s.h * m], [cx, s.y + s.h * (1 - m)]];
    case "left":
      return [[s.x + s.w * (1 - m), cy], [s.x + s.w * m, cy]];
    default:
      return [[s.x + s.w * m, cy], [s.x + s.w * (1 - m), cy]];
  }
}

export const NEXT_DIR: Record<PlanStair["dir"], PlanStair["dir"]> = {
  up: "right",
  right: "down",
  down: "left",
  left: "up",
};

/** Door orientations in rotation order: hinge side × opening side. */
const DOOR_TURNS: [boolean, boolean][] = [
  [false, false],
  [true, false],
  [true, true],
  [false, true],
];

export function rotateDoor(o: { flip?: boolean; out?: boolean }, step: 1 | -1) {
  const i = DOOR_TURNS.findIndex(([f, out]) => f === !!o.flip && out === !!o.out);
  const [flip, out] = DOOR_TURNS[(i + step + 4) % 4];
  o.flip = flip;
  o.out = out;
}

export const PREV_DIR: Record<PlanStair["dir"], PlanStair["dir"]> = {
  up: "left",
  left: "down",
  down: "right",
  right: "up",
};

export const OPPOSITE_DIR: Record<PlanStair["dir"], PlanStair["dir"]> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export const RADIATOR_DEPTH = 10; // cm

/** Where a radiator dropped at p goes: along the nearest wall (within tol),
 * inside its room, centred on a 10 cm step; null when no wall is near. */
export function snapRadiator(
  level: PlanLevel,
  p: PlanPoint,
  tol: number,
  length: number
): { x: number; y: number; angle: number } | null {
  let best: { x: number; y: number; angle: number; d: number } | null = null;
  for (const s of level.rooms) {
    s.points.forEach((a, i) => {
      const b = s.points[(i + 1) % s.points.length];
      const len = segLength(a, b);
      if (!len) return;
      const q = projectOnSegment(p, a, b);
      const d = segLength(p, q);
      if (d > tol || (best && d >= best.d)) return;
      const u: PlanPoint = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
      const half = Math.min(length, len) / 2;
      const along = Math.max(half, Math.min(len - half, roundTo(segLength(a, q), 10)));
      const c: PlanPoint = [a[0] + u[0] * along, a[1] + u[1] * along];
      let n: PlanPoint = [-u[1], u[0]];
      if (!inside([c[0] + n[0] * 5, c[1] + n[1] * 5], s.points)) n = [u[1], -u[0]];
      const off = RADIATOR_DEPTH / 2 + 4;
      best = {
        x: c[0] + n[0] * off,
        y: c[1] + n[1] * off,
        angle: (Math.atan2(u[1], u[0]) * 180) / Math.PI,
        d,
      };
    });
  }
  if (!best) return null;
  const { x, y, angle } = best;
  return { x, y, angle };
}

/** Corners of a radiator's body. */
export function radiatorPoints(r: { x: number; y: number; angle: number; length: number }): PlanPoint[] {
  const a = (r.angle * Math.PI) / 180;
  const u: PlanPoint = [Math.cos(a), Math.sin(a)];
  const n: PlanPoint = [-u[1], u[0]];
  const hl = r.length / 2;
  const hd = RADIATOR_DEPTH / 2;
  return [
    [r.x - u[0] * hl - n[0] * hd, r.y - u[1] * hl - n[1] * hd],
    [r.x + u[0] * hl - n[0] * hd, r.y + u[1] * hl - n[1] * hd],
    [r.x + u[0] * hl + n[0] * hd, r.y + u[1] * hl + n[1] * hd],
    [r.x - u[0] * hl + n[0] * hd, r.y - u[1] * hl + n[1] * hd],
  ];
}

// -- Styles -------------------------------------------------------------------

/** Looks of each opening; the first is the default. */
export const OPENING_STYLES: Record<OpeningType, string[]> = {
  door: ["plain", "panel", "glazed"],
  sliding_door: ["plain", "glazed", "pocket"],
  window: ["casement", "tilt", "fixed", "sliding"],
  glass_door: ["casement", "sliding", "fixed"],
};

export const openingStyle = (o: { type: OpeningType; style?: string }) =>
  o.style && OPENING_STYLES[o.type].includes(o.style) ? o.style : OPENING_STYLES[o.type][0];

export const STAIR_SHAPES: StairShape[] = ["straight", "l", "u", "spiral"];

/** Light fixtures by mount; the first is the default. */
export const LIGHT_TYPES: Record<LightMount, LightType[]> = {
  ceiling: ["ceiling_light", "pendant", "spot", "led_strip"],
  wall: ["sconce", "led_strip"],
  floor: ["floor_lamp", "table_lamp", "led_strip"],
};

/** Fixtures that can have a lampshade. */
export const SHADED: LightType[] = ["pendant", "sconce", "floor_lamp", "table_lamp"];

export const lightType = (l: Pick<PlanLight, "type" | "kind" | "mount">): LightType =>
  l.type && LIGHT_TYPES[l.mount]?.includes(l.type)
    ? l.type
    : l.kind === "linear"
      ? "led_strip"
      : LIGHT_TYPES[l.mount]?.[0] ?? "ceiling_light";

export const lightKindOf = (type: LightType) => (type === "led_strip" ? "linear" : "point");

// -- Stairs drawing -------------------------------------------------------------

export interface StairDrawing {
  /** Footprint (a polygon; the spiral's circle as 36 corners). */
  outline: PlanPoint[];
  treads: [PlanPoint, PlanPoint][];
  /** Flight dividers, landing and winder lines. */
  edges: [PlanPoint, PlanPoint][];
  /** Walking line, bottom to top. */
  path: PlanPoint[];
}

/** The stairs in their own frame: s along the climb (0..L), c across it
 * (0..B, to the right of the climb), mapped onto the rectangle. */
function stairFrame(st: PlanStair) {
  const { x, y, w, h } = st;
  const f: Record<PlanStair["dir"], { o: PlanPoint; s: PlanPoint; c: PlanPoint; L: number; B: number }> = {
    up: { o: [x, y + h], s: [0, -1], c: [1, 0], L: h, B: w },
    down: { o: [x + w, y], s: [0, 1], c: [-1, 0], L: h, B: w },
    right: { o: [x, y], s: [1, 0], c: [0, 1], L: w, B: h },
    left: { o: [x + w, y + h], s: [-1, 0], c: [0, -1], L: w, B: h },
  };
  const { o, s, c, L, B } = f[st.dir];
  const left = st.turn === "left";
  const at = (a: number, b: number): PlanPoint => {
    const cc = left ? B - b : b;
    return [o[0] + s[0] * a + c[0] * cc, o[1] + s[1] * a + c[1] * cc];
  };
  return { at, L, B };
}

export function stairDrawing(st: PlanStair): StairDrawing {
  const shape = st.shape ?? "straight";
  const { at, L, B } = stairFrame(st);
  const STEP = 25;
  const treads: [PlanPoint, PlanPoint][] = [];
  const edges: [PlanPoint, PlanPoint][] = [];
  // Treads across a flight from s0 to s1 in lane c0..c1 (or along c when across).
  const flight = (s0: number, s1: number, c0: number, c1: number) => {
    const n = Math.max(2, Math.round(Math.abs(s1 - s0) / STEP));
    for (let i = 1; i < n; i++) {
      const v = s0 + ((s1 - s0) * i) / n;
      treads.push([at(v, c0), at(v, c1)]);
    }
  };
  if (shape === "spiral") {
    const cx = st.x + st.w / 2;
    const cy = st.y + st.h / 2;
    const R = Math.min(st.w, st.h) / 2;
    const r0 = R * 0.16;
    const outline: PlanPoint[] = [];
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * 2 * Math.PI;
      outline.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
    }
    // Enter on the side the climb comes from, then turn ~300°.
    const back = at(0, B / 2);
    const a0 = Math.atan2(back[1] - cy, back[0] - cx);
    const sign = st.turn === "left" ? -1 : 1;
    const N = 12;
    for (let i = 0; i <= N; i++) {
      const a = a0 + sign * (i / N) * (2 * Math.PI) * (300 / 360);
      treads.push([
        [cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)],
        [cx + R * Math.cos(a), cy + R * Math.sin(a)],
      ]);
    }
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * 2 * Math.PI;
      const b = ((i + 1) / 16) * 2 * Math.PI;
      edges.push([
        [cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)],
        [cx + r0 * Math.cos(b), cy + r0 * Math.sin(b)],
      ]);
    }
    const path: PlanPoint[] = [];
    const rp = (R + r0) / 2 + R * 0.1;
    for (let i = 0; i <= 20; i++) {
      const a = a0 + sign * (0.04 + (i / 20) * 0.76) * 2 * Math.PI;
      path.push([cx + rp * Math.cos(a), cy + rp * Math.sin(a)]);
    }
    return { outline, treads, edges, path };
  }
  const m = Math.min(L, B) * 0.08;
  if (shape === "l" && L > 40 && B > 40) {
    const f = Math.min(B, L) / 2;
    flight(0, L - f, 0, f);
    // Second flight: across, towards c = B.
    const n = Math.max(2, Math.round((B - f) / STEP));
    for (let i = 1; i < n; i++) {
      const v = f + ((B - f) * i) / n;
      treads.push([at(L - f, v), at(L, v)]);
    }
    edges.push([at(L - f, f), at(L, 0)]); // winder
    edges.push([at(L - f, 0), at(L - f, f)]);
    edges.push([at(L - f, f), at(L, f)]);
    return {
      outline: [at(0, 0), at(L, 0), at(L, B), at(L - f, B), at(L - f, f), at(0, f)],
      treads,
      edges,
      path: [at(m, f / 2), at(L - f / 2, f / 2), at(L - f / 2, B - m)],
    };
  }
  if (shape === "u" && L > 40 && B > 40) {
    const f = B / 2;
    const land = Math.min(f, L / 2);
    flight(0, L - land, 0, f);
    flight(0, L - land, f, B);
    edges.push([at(0, f), at(L - land, f)]); // between the flights
    edges.push([at(L - land, 0), at(L - land, B)]); // landing
    return {
      outline: [at(0, 0), at(L, 0), at(L, B), at(0, B)],
      treads,
      edges,
      path: [at(m, f / 2), at(L - land / 2, f / 2), at(L - land / 2, B - f / 2), at(m, B - f / 2)],
    };
  }
  return {
    outline: stairPoints(st),
    treads: stairTreads(st),
    edges,
    path: stairArrow(st),
  };
}
