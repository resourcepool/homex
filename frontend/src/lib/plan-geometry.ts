/** 3D Builder geometry: snapping, areas, hit tests. Units: centimetres. */
import type { PlanPoint } from "../types";

export const GRID = 50; // cm

export type SnapKind = "vertex" | "edge" | "align" | "grid" | "free";

export interface SnapResult {
  p: PlanPoint;
  kind: SnapKind;
  /** Alignment guides: vertical line at x, horizontal line at y. */
  guideX?: number;
  guideY?: number;
}

export interface SnapContext {
  /** Vertices to snap to (current level, draft, level shown underneath). */
  vertices: PlanPoint[];
  /** Segments to snap onto. */
  edges: [PlanPoint, PlanPoint][];
  /** Corners the point is joined to (previous corner while drawing, the
   * neighbours of a dragged corner): near-horizontal / vertical walls from
   * them lock straight. */
  anchors?: PlanPoint[];
  /** Snap distance, in cm (derived from pixels and zoom). */
  tolerance: number;
  grid?: number;
}

const dist = (a: PlanPoint, b: PlanPoint) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export const roundTo = (v: number, step: number) => Math.round(v / step) * step;

/** Closest point of segment ab to p. */
export function projectOnSegment(p: PlanPoint, a: PlanPoint, b: PlanPoint): PlanPoint {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (!len2) return a;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return [a[0] + t * dx, a[1] + t * dy];
}

/**
 * Magnetic snap, by priority: an existing vertex, an existing edge (then the
 * grid along it when the edge is horizontal / vertical), the x / y of an
 * existing vertex (alignment guides), the grid.
 */
export function snapPoint(raw: PlanPoint, ctx: SnapContext): SnapResult {
  const tol = ctx.tolerance;
  const grid = ctx.grid ?? GRID;

  let best: PlanPoint | null = null;
  let bestD = tol;
  for (const v of ctx.vertices) {
    const d = dist(raw, v);
    if (d <= bestD) {
      best = v;
      bestD = d;
    }
  }
  if (best) return { p: [best[0], best[1]], kind: "vertex" };

  let edgeP: PlanPoint | null = null;
  let edgeD = tol * 0.75;
  let edge: [PlanPoint, PlanPoint] | null = null;
  for (const e of ctx.edges) {
    const q = projectOnSegment(raw, e[0], e[1]);
    const d = dist(raw, q);
    if (d <= edgeD) {
      edgeP = q;
      edgeD = d;
      edge = e;
    }
  }
  if (edgeP && edge) {
    // Along an axis-aligned wall, keep the grid in the other direction.
    if (edge[0][0] === edge[1][0]) {
      const y = roundTo(edgeP[1], grid);
      const [lo, hi] = [Math.min(edge[0][1], edge[1][1]), Math.max(edge[0][1], edge[1][1])];
      return { p: [edge[0][0], Math.max(lo, Math.min(hi, y))], kind: "edge" };
    }
    if (edge[0][1] === edge[1][1]) {
      const x = roundTo(edgeP[0], grid);
      const [lo, hi] = [Math.min(edge[0][0], edge[1][0]), Math.max(edge[0][0], edge[1][0])];
      return { p: [Math.max(lo, Math.min(hi, x)), edge[0][1]], kind: "edge" };
    }
    return { p: edgeP, kind: "edge" };
  }

  let x = roundTo(raw[0], grid);
  let y = roundTo(raw[1], grid);
  let guideX: number | undefined;
  let guideY: number | undefined;
  let dx = tol;
  let dy = tol;
  // Straight walls: within ~8° of horizontal / vertical from an anchor.
  const SLOPE = Math.tan((8 * Math.PI) / 180);
  for (const a of ctx.anchors ?? []) {
    const ax = Math.abs(raw[0] - a[0]);
    const ay = Math.abs(raw[1] - a[1]);
    if (ay <= Math.max(tol, ax * SLOPE) && ay < dy + tol) {
      y = a[1];
      guideY = a[1];
      dy = 0;
    }
    if (ax <= Math.max(tol, ay * SLOPE) && ax < dx + tol) {
      x = a[0];
      guideX = a[0];
      dx = 0;
    }
  }
  for (const v of ctx.vertices) {
    const ddx = Math.abs(raw[0] - v[0]);
    if (ddx <= dx) {
      dx = ddx;
      x = v[0];
      guideX = v[0];
    }
    const ddy = Math.abs(raw[1] - v[1]);
    if (ddy <= dy) {
      dy = ddy;
      y = v[1];
      guideY = v[1];
    }
  }
  const kind: SnapKind = guideX !== undefined || guideY !== undefined ? "align" : "grid";
  return { p: [x, y], kind, guideX, guideY };
}

/** Polygon area (m²) from points in cm. */
export function areaM2(points: PlanPoint[]): number {
  let s = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    s += x1 * y2 - x2 * y1;
  }
  return Math.abs(s) / 2 / 10000;
}

/** Visual centre used for the label (centroid, falls back to the mean). */
export function centroid(points: PlanPoint[]): PlanPoint {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    const f = x1 * y2 - x2 * y1;
    a += f;
    cx += (x1 + x2) * f;
    cy += (y1 + y2) * f;
  }
  if (Math.abs(a) < 1e-6) {
    const n = points.length || 1;
    return [points.reduce((s, p) => s + p[0], 0) / n, points.reduce((s, p) => s + p[1], 0) / n];
  }
  return [cx / (3 * a), cy / (3 * a)];
}

export function pointInPolygon(p: PlanPoint, points: PlanPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export function edgesOf(points: PlanPoint[]): [PlanPoint, PlanPoint][] {
  return points.map((p, i) => [p, points[(i + 1) % points.length]] as [PlanPoint, PlanPoint]);
}

export function bounds(points: PlanPoint[]): { minX: number; minY: number; maxX: number; maxY: number } | null {
  if (!points.length) return null;
  return {
    minX: Math.min(...points.map((p) => p[0])),
    minY: Math.min(...points.map((p) => p[1])),
    maxX: Math.max(...points.map((p) => p[0])),
    maxY: Math.max(...points.map((p) => p[1])),
  };
}

/** "3,5 m" style length. */
export function formatLength(cm: number, locale?: string): string {
  return `${(cm / 100).toLocaleString(locale, { maximumFractionDigits: 2 })} m`;
}

export const segLength = (a: PlanPoint, b: PlanPoint) => dist(a, b);

export const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
