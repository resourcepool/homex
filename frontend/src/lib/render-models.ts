/**
 * 3D Builder rendering: detailed models of what the plan places, built from
 * three.js primitives (no external assets): windows (frame, sashes, glass,
 * handles, sills), radiators (ribbed panels, columns, valve and pipes),
 * stairs (treads with nosing, risers, stringers, handrail and balusters) and
 * light fixtures (canopies, cords, lathe-turned shades, lamps, projectors).
 *
 * Plan points are in cm (x, y); the scene is in metres with the plan's y as z.
 */
import * as THREE from "three";
import type { PlanPoint } from "../types";

export const m = (cm: number) => cm / 100;

/** A box lying along plan segment a→b (cm), from height y0 to y1 (m), `thick` m deep. */
export function box(a: PlanPoint, b: PlanPoint, y0: number, y1: number, thick: number, mat: THREE.Material): THREE.Mesh {
  const dx = m(b[0] - a[0]);
  const dz = m(b[1] - a[1]);
  const len = Math.max(Math.hypot(dx, dz), 0.001);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(len, Math.max(y1 - y0, 0.001), thick), mat);
  mesh.position.set(m(a[0] + b[0]) / 2, (y0 + y1) / 2, m(a[1] + b[1]) / 2);
  mesh.rotation.y = -Math.atan2(dz, dx);
  return mesh;
}

/** A round rod between two scene points (m). */
export function rod(p: THREE.Vector3, q: THREE.Vector3, r: number, mat: THREE.Material, seg = 10): THREE.Mesh {
  const d = new THREE.Vector3().subVectors(q, p);
  const len = Math.max(d.length(), 0.001);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  mesh.position.copy(p).addScaledVector(d, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return mesh;
}

/** A turned (lathe) shape from a [radius, height] profile (m), round or square. */
export function lathe(profile: [number, number][], mat: THREE.Material, square = false): THREE.Mesh {
  const geo = new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    square ? 4 : 32
  );
  const mesh = new THREE.Mesh(geo, mat);
  if (square) mesh.rotation.y = Math.PI / 4;
  return mesh;
}

/** Plan point (cm) and height (m) as a scene point. */
export const v3 = (p: PlanPoint, y: number) => new THREE.Vector3(m(p[0]), y, m(p[1]));

const add = (p: PlanPoint, d: PlanPoint, k: number): PlanPoint => [p[0] + d[0] * k, p[1] + d[1] * k];

// -- Walls ----------------------------------------------------------------------

/** An interior partition piece: opaque at the floor, fading out toward the
 * ceiling (vertex alpha, linear from 1 at y = 0 to 0 at y = wallH). */
export function gradientWall(
  a: PlanPoint,
  b: PlanPoint,
  y0: number,
  y1: number,
  thick: number,
  mat: THREE.Material,
  wallH: number
): THREE.Mesh {
  const mesh = box(a, b, y0, y1, thick, mat);
  const pos = mesh.geometry.attributes.position;
  const cy = (y0 + y1) / 2;
  const col = new Float32Array(pos.count * 4);
  for (let i = 0; i < pos.count; i++) {
    const y = cy + pos.getY(i);
    col.set([1, 1, 1, Math.max(0, Math.min(1, 1 - y / wallH))], i * 4);
  }
  mesh.geometry.setAttribute("color", new THREE.BufferAttribute(col, 4));
  mesh.renderOrder = 1; // after the opaque scene
  return mesh;
}

/** Shared material of the interior partitions (needs vertex alpha). */
export function gradientWallMaterial(color: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.9,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// -- Windows --------------------------------------------------------------------

export interface WindowSpec {
  a: PlanPoint;
  b: PlanPoint;
  /** Unit vector along the wall, and the normal toward the room (inside). */
  u: PlanPoint;
  n: PlanPoint;
  sill: number;
  top: number;
  style: string; // casement | tilt | fixed | sliding
  door: boolean; // a glass door: no sill, a kick rail
  frame: THREE.Material;
  glass: THREE.Material;
  metal: THREE.Material;
  stone: THREE.Material;
}

/** A window or glass door: frame, one or two sashes with glazing bars and
 * handles, an outside sill and an inside ledge. */
export function windowModel(s: WindowSpec): THREE.Group {
  const g = new THREE.Group();
  const { a, b, u, n, sill, top, frame, glass } = s;
  const w = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const F = 6; // frame profile, cm
  const D = 0.07; // frame depth, m
  const along = (t: number, d = 0): PlanPoint => add(add(a, u, t), n, d);
  // frame (dormant)
  g.add(box(along(0), along(F), sill, top, D, frame));
  g.add(box(along(w - F), along(w), sill, top, D, frame));
  g.add(box(along(0), along(w), top - m(F), top, D, frame));
  g.add(box(along(0), along(w), sill, sill + (s.door ? 0.02 : m(F)), D, frame));
  const y0 = sill + (s.door ? 0.02 : m(F));
  const y1 = top - m(F);
  // sashes: [from, to] along the wall (cm), depth offset (cm)
  const inner = w - 2 * F;
  let sashes: [number, number, number][];
  if (s.style === "sliding") sashes = [[F, F + inner * 0.55, 1.5], [F + inner * 0.45, w - F, -1.5]];
  else if (s.style === "fixed") sashes = [[F, w - F, 0]];
  else sashes = w > 70 ? [[F, F + inner / 2, 0], [F + inner / 2, w - F, 0]] : [[F, w - F, 0]];
  const S = 5; // sash profile, cm
  sashes.forEach(([t0, t1, dd], i) => {
    const p0 = along(t0, dd);
    const p1 = along(t1, dd);
    const bottom = s.door ? 0.12 : m(S);
    g.add(box(p0, along(t0 + S, dd), y0, y1, 0.055, frame));
    g.add(box(along(t1 - S, dd), p1, y0, y1, 0.055, frame));
    g.add(box(p0, p1, y1 - m(S), y1, 0.055, frame));
    g.add(box(p0, p1, y0, y0 + bottom, 0.055, frame));
    g.add(box(along(t0 + S, dd), along(t1 - S, dd), y0 + bottom, y1 - m(S), 0.012, glass));
    if (s.style === "fixed") return;
    // handle on the inside, on the meeting stile (or the free side of a single sash)
    const hx = sashes.length === 2 ? (i === 0 ? t1 - S / 2 : t0 + S / 2) : t1 - S / 2;
    const hy = s.door ? 1.05 : Math.min(y0 + (y1 - y0) * 0.5, sill + 1.1);
    const base = along(hx, dd + 3.5);
    g.add(box(add(base, u, -1), add(base, u, 1), hy - 0.04, hy + 0.04, 0.015, s.metal));
    g.add(box(add(base, n, 0.5), add(base, n, 1.5), hy - 0.11, hy + 0.0, 0.016, s.metal));
  });
  if (!s.door) {
    // outside sill (stone, sloped look), inside ledge
    g.add(box(along(-4, -9), along(w + 4, -9), sill - 0.05, sill - 0.01, 0.16, s.stone));
    g.add(box(along(-2, 9), along(w + 2, 9), sill - 0.03, sill, 0.14, frame));
  }
  return g;
}

// -- Doors ----------------------------------------------------------------------

/** Door casing (jambs and head) and a lever handle on each face of a leaf. */
export function doorCasing(a: PlanPoint, b: PlanPoint, u: PlanPoint, top: number, wallT: number, mat: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const w = Math.hypot(b[0] - a[0], b[1] - a[1]);
  g.add(box(a, add(a, u, 4), 0, top, wallT + 0.03, mat));
  g.add(box(add(a, u, w - 4), b, 0, top, wallT + 0.03, mat));
  g.add(box(add(a, u, -3), add(b, u, 3), top - 0.02, top + 0.06, wallT + 0.03, mat));
  return g;
}

/** A lever handle pair on a leaf running hinge→tip (cm), at 1.05 m. */
export function doorHandles(hinge: PlanPoint, tip: PlanPoint, metal: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const len = Math.hypot(tip[0] - hinge[0], tip[1] - hinge[1]) || 1;
  const d: PlanPoint = [(tip[0] - hinge[0]) / len, (tip[1] - hinge[1]) / len];
  const nrm: PlanPoint = [-d[1], d[0]];
  const at = add(hinge, d, len - 7);
  for (const side of [1, -1]) {
    const rose = add(at, nrm, side * 2.6);
    g.add(rod(v3(add(at, nrm, side * 1.8), 1.05), v3(rose, 1.05), 0.022, metal, 16));
    g.add(rod(v3(rose, 1.05), v3(add(rose, d, -12), 1.05), 0.009, metal));
  }
  return g;
}

// -- Radiators ------------------------------------------------------------------

/** A radiator against a wall: p→q along it (cm, its front centre line), `nIn`
 * pointing into the room. Panel: low steel panel with vertical channels, a
 * grille on top, brackets, a thermostatic valve and its pipes. Tall: round
 * columns between two collectors. `paint` is the material that glows with heat. */
export function radiatorModel(
  p: PlanPoint,
  q: PlanPoint,
  nIn: PlanPoint,
  tall: boolean,
  paint: THREE.Material,
  metal: THREE.Material,
  valve: THREE.Material
): { group: THREE.Group; top: number } {
  const g = new THREE.Group();
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
  const u: PlanPoint = [(q[0] - p[0]) / len, (q[1] - p[1]) / len];
  const along = (t: number, d = 0): PlanPoint => add(add(p, u, t), nIn, d);
  const top = tall ? 1.9 : 0.72;
  const bottom = tall ? 0.12 : 0.16;
  if (tall) {
    // collectors and round columns, two rows deep
    const cols = Math.max(4, Math.round(len / 4.5));
    for (let i = 0; i < cols; i++) {
      const t = (len * (i + 0.5)) / cols;
      for (const d of [-1.6, 1.6]) g.add(rod(v3(along(t, d), bottom + 0.04), v3(along(t, d), top - 0.04), 0.012, paint, 10));
    }
    g.add(box(along(0), along(len), bottom, bottom + 0.05, 0.06, paint));
    g.add(box(along(0), along(len), top - 0.05, top, 0.06, paint));
  } else {
    // back panel, ribbed front, side caps, top grille
    g.add(box(along(0, -2.5), along(len, -2.5), bottom, top, 0.02, paint));
    const ribs = Math.max(6, Math.round(len / 5));
    for (let i = 0; i < ribs; i++) {
      const t0 = (len * i) / ribs + 0.35;
      const t1 = (len * (i + 1)) / ribs - 0.35;
      g.add(box(along(t0, 1.6), along(t1, 1.6), bottom, top, 0.022, paint));
    }
    g.add(box(along(-0.5, 0), along(0.5, 0), bottom, top, 0.07, paint));
    g.add(box(along(len - 0.5, 0), along(len + 0.5, 0), bottom, top, 0.07, paint));
    const grille = Math.round(len / 2.5);
    for (let i = 0; i <= grille; i++) {
      const t = (len * i) / grille;
      g.add(box(along(t, -2.6), along(t, 2.6), top - 0.006, top, 0.004, paint));
    }
  }
  // wall brackets
  for (const t of [len * 0.15, len * 0.85]) g.add(box(along(t - 1.5, -4.5), along(t + 1.5, -4.5), top - 0.12, top - 0.06, 0.03, metal));
  // thermostatic valve on the left end, its pipe down to the floor; return on the right
  const vIn = along(-5, 0);
  g.add(rod(v3(along(0, 0), bottom + 0.04), v3(vIn, bottom + 0.04), 0.009, metal));
  g.add(rod(v3(vIn, bottom + 0.04), v3(vIn, 0), 0.009, metal));
  const head = lathe(
    [
      [0, 0],
      [0.022, 0],
      [0.026, 0.02],
      [0.026, 0.07],
      [0.02, 0.085],
      [0, 0.088],
    ],
    valve
  );
  head.position.copy(v3(vIn, bottom + 0.06));
  g.add(head);
  const vOut = along(len + 5, 0);
  g.add(rod(v3(along(len, 0), bottom + 0.04), v3(vOut, bottom + 0.04), 0.009, metal));
  g.add(rod(v3(vOut, bottom + 0.04), v3(vOut, 0), 0.009, metal));
  return { group: g, top };
}

// -- Stairs ---------------------------------------------------------------------

export interface StairStep {
  /** Walking-line point and unit direction of the climb at the step (cm). */
  p: PlanPoint;
  u: PlanPoint;
  /** Height of the step's top (m), relative to the level. */
  y: number;
}

/** Stairs from their steps: treads with a nosing, risers, notched stringers
 * on both sides, a handrail with balusters on the open side; a centre pole
 * for a spiral (`pole`, cm). */
export function stairModel(
  steps: StairStep[],
  lane: number,
  depth: number,
  rise: number,
  down: boolean,
  wood: THREE.Material,
  riser: THREE.Material,
  rail: THREE.Material,
  railSide: (a: PlanPoint, b: PlanPoint) => PlanPoint,
  pole?: { at: PlanPoint; from: number; to: number }
): THREE.Group {
  const g = new THREE.Group();
  const top: THREE.Vector3[] = [];
  for (const { p, u, y } of steps) {
    const n: PlanPoint = [-u[1], u[0]];
    const a = add(p, n, -lane / 2);
    const b = add(p, n, lane / 2);
    // tread, a little deeper than the going (nosing)
    g.add(box(a, b, y - 0.04, y, m(depth) * 1.12, wood));
    // riser under the front edge of the tread (the side you come from)
    const back = down ? 1 : -1;
    const front = (q: PlanPoint) => add(q, u, back * depth * 0.45);
    g.add(box(front(a), front(b), y - rise, y - 0.04, 0.02, riser));
    // stringers: a notched board along both sides
    for (const side of [a, b]) {
      const s = add(side, n, side === a ? -1.5 : 1.5);
      g.add(box(add(s, u, -depth / 2), add(s, u, depth / 2), y - rise - 0.18, y + 0.03, 0.035, wood));
    }
    const open = railSide(a, b);
    top.push(v3(add(open, n, open === a ? 2 : -2), y + 0.9));
    // a baluster per step
    g.add(rod(v3(add(open, n, open === a ? 2 : -2), y), top[top.length - 1], 0.008, rail, 6));
  }
  // handrail through the baluster tops, and newel posts at both ends
  for (let i = 1; i < top.length; i++) g.add(rod(top[i - 1], top[i], 0.022, wood, 12));
  for (const end of [0, top.length - 1]) {
    if (!top[end]) continue;
    const t = top[end];
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.0, 0.07), wood);
    post.position.set(t.x, t.y - 0.45, t.z);
    g.add(post);
  }
  if (pole) g.add(rod(v3(pole.at, pole.from), v3(pole.at, pole.to), 0.045, rail, 16));
  return g;
}

// -- Lights ---------------------------------------------------------------------

export interface FixtureParts {
  /** Meshes (positioned in the level's frame). */
  group: THREE.Group;
  /** Where the light comes from, and for a projector where it points. */
  source: THREE.Vector3;
  aim?: THREE.Vector3;
}

export interface FixtureSpec {
  type: string;
  /** Plan point (cm), already moved off the wall for wall / floor fixtures. */
  at: PlanPoint;
  /** Unit normal from the nearest wall into the room (wall fixtures). */
  wallN: PlanPoint;
  /** Centre of the room (cm): where a projector aims. */
  roomCentre: PlanPoint;
  ceiling: number; // m
  square: boolean;
  shade: boolean;
  body: THREE.Material; // the fixture's colour
  metal: THREE.Material;
  glow: THREE.Material; // lit parts (bulbs, diffusers)
  shadeMat: THREE.Material; // lampshades (glow when on)
  wood: THREE.Material;
}

/** A light fixture, detailed by type. */
export function fixtureModel(s: FixtureSpec): FixtureParts {
  const g = new THREE.Group();
  const { at, ceiling: H, square, body, metal, glow, shadeMat } = s;
  const P = (y: number) => v3(at, y);
  const put = (mesh: THREE.Mesh, y: number, p: PlanPoint = at) => {
    mesh.position.add(v3(p, y));
    g.add(mesh);
    return mesh;
  };
  let source = P(H - 0.3);
  let aim: THREE.Vector3 | undefined;
  switch (s.type) {
    case "pendant": {
      put(lathe([[0, 0], [0.055, 0], [0.055, -0.02], [0, -0.025]], body), H);
      g.add(rod(P(H - 0.02), P(H - 0.6), 0.003, metal, 6));
      put(lathe([[0, 0], [0.018, 0], [0.018, -0.05], [0, -0.05]], metal), H - 0.58);
      put(new THREE.Mesh(new THREE.SphereGeometry(s.shade ? 0.045 : 0.075, 20, 14), glow), H - (s.shade ? 0.67 : 0.7));
      if (s.shade)
        put(
          lathe(
            [
              [0.03, 0],
              [0.07, -0.02],
              [0.14, -0.09],
              [0.2, -0.19],
              [0.21, -0.2],
            ],
            shadeMat,
            square
          ),
          H - 0.58
        );
      source = P(H - 0.72);
      break;
    }
    case "spot": {
      // recessed downlight: trim ring and glowing lens
      put(lathe([[0.03, 0], [0.048, 0], [0.048, -0.008], [0.03, -0.012]], body, square), H);
      put(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.006, square ? 4 : 24), glow), H - 0.01);
      source = P(H - 0.15);
      break;
    }
    case "projector": {
      // one adjustable head on a yoke, aimed at the room
      const wall = s.wallN[0] !== 0 || s.wallN[1] !== 0;
      const mountP = wall ? v3(at, 2.1) : P(H);
      const target = wall
        ? v3(add(at, s.wallN, 220), 0.6)
        : (() => {
            const d = Math.hypot(s.roomCentre[0] - at[0], s.roomCentre[1] - at[1]);
            return d < 40 ? P(0) : v3(add(at, [(s.roomCentre[0] - at[0]) / d, (s.roomCentre[1] - at[1]) / d], Math.min(d, 160)), 0);
          })();
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.015, 24), body);
      const arm = wall ? v3(add(at, s.wallN, 9), 2.1) : P(H - 0.09);
      if (wall) plate.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(s.wallN[0], 0, s.wallN[1]));
      plate.position.copy(mountP);
      g.add(plate);
      g.add(rod(mountP, arm, 0.008, body, 8));
      const dir = new THREE.Vector3().subVectors(target, arm).normalize();
      // the head: a can, open toward the target, its lens glowing
      const head = new THREE.Group();
      head.add(lathe([[0, -0.06], [0.03, -0.06], [0.038, -0.03], [0.038, 0.07], [0.034, 0.072]], body));
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.032, 24), glow);
      lens.rotation.x = -Math.PI / 2;
      lens.position.y = 0.071;
      head.add(lens);
      head.position.copy(arm);
      head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      g.add(head);
      // yoke around the head
      const side = new THREE.Vector3(-dir.z, 0, dir.x).normalize().multiplyScalar(0.045);
      g.add(rod(arm.clone().add(side), arm.clone().sub(side), 0.005, body, 6));
      source = arm.clone().addScaledVector(dir, 0.08);
      aim = target;
      break;
    }
    case "sconce": {
      // wall plate, a short arm, a globe or an up-open shade
      const y = 1.8;
      const wallP = add(at, s.wallN, -9);
      const plate = box(add(wallP, [s.wallN[1], -s.wallN[0]], -5), add(wallP, [s.wallN[1], -s.wallN[0]], 5), y - 0.08, y + 0.08, 0.015, body);
      g.add(plate);
      g.add(rod(v3(wallP, y), P(y), 0.008, metal, 8));
      put(new THREE.Mesh(square ? new THREE.BoxGeometry(0.1, 0.1, 0.1) : new THREE.SphereGeometry(s.shade ? 0.04 : 0.075, 20, 14), glow), y + 0.02);
      if (s.shade)
        put(
          lathe(
            [
              [0.06, -0.06],
              [0.1, 0.04],
              [0.13, 0.12],
            ],
            shadeMat,
            square
          ),
          y
        );
      source = P(y + 0.02);
      break;
    }
    case "floor_lamp": {
      put(lathe([[0, 0], [0.15, 0], [0.15, 0.015], [0.11, 0.03], [0.02, 0.035], [0, 0.035]], metal), 0);
      g.add(rod(P(0.03), P(1.5), 0.011, metal, 10));
      put(new THREE.Mesh(new THREE.SphereGeometry(s.shade ? 0.045 : 0.1, 20, 14), glow), s.shade ? 1.5 : 1.58);
      if (s.shade)
        put(
          lathe(
            [
              [0.2, 0],
              [0.2, 0.04],
              [0.15, 0.3],
            ],
            shadeMat,
            square
          ),
          1.38
        );
      source = P(1.5);
      break;
    }
    case "table_lamp": {
      // a side table (top and four legs), a turned ceramic base, a shade
      const tw = 22; // half-size, cm
      for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) g.add(rod(v3([at[0] + dx * (tw - 3), at[1] + dz * (tw - 3)], 0), v3([at[0] + dx * (tw - 3), at[1] + dz * (tw - 3)], 0.52), 0.015, s.wood, 8));
      const top = new THREE.Mesh(new THREE.BoxGeometry(m(tw * 2), 0.03, m(tw * 2)), s.wood);
      put(top, 0.535);
      put(lathe([[0, 0], [0.06, 0], [0.085, 0.07], [0.07, 0.17], [0.025, 0.21], [0.02, 0.26], [0, 0.26]], body), 0.55);
      put(new THREE.Mesh(new THREE.SphereGeometry(s.shade ? 0.04 : 0.07, 16, 12), glow), s.shade ? 0.86 : 0.88);
      if (s.shade)
        put(
          lathe(
            [
              [0.15, 0],
              [0.15, 0.02],
              [0.1, 0.2],
            ],
            shadeMat,
            square
          ),
          0.76
        );
      source = P(0.88);
      break;
    }
    default: {
      // ceiling light: a flat dome (round) or a slim panel (square) on a base
      if (square) {
        put(new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.4), body), H - 0.015);
        put(new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.02, 0.36), glow), H - 0.035);
      } else {
        put(lathe([[0.2, 0], [0.21, 0], [0.21, -0.02], [0.2, -0.025]], body), H);
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.19, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), glow);
        dome.scale.y = 0.35;
        put(dome, H - 0.02);
      }
      source = P(H - 0.2);
    }
  }
  return { group: g, source, aim };
}

/** An LED strip in its aluminium profile, from p to q (cm) at height y (m). */
export function stripModel(p: PlanPoint, q: PlanPoint, y: number, under: boolean, metal: THREE.Material, glow: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  g.add(box(p, q, y - 0.008, y + 0.008, 0.024, metal));
  g.add(box(p, q, under ? y - 0.012 : y + 0.008, under ? y - 0.008 : y + 0.012, 0.016, glow));
  return g;
}
