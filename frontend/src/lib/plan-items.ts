/** 3D Builder: doors, windows, glass doors (set in walls) and stairs. */
import type { OpeningType, PlanLevel, PlanOpening, PlanPoint, PlanStair } from "../types";
import { projectOnSegment, roundTo, segLength } from "./plan-geometry";

export const OPENING_WIDTH: Record<OpeningType, number> = {
  door: 90,
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
