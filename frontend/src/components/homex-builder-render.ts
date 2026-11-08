/**
 * 3D Builder "Rendering" tab: the house as a doll's house (no ceilings), built
 * from the plan: walls with their openings, floors, stairs, radiators, the
 * lights on and the shutters half open. View only: orbit, pan, zoom, floors.
 * The facades turned toward the camera (whole exterior walls, with their
 * windows and doors) turn see-through as the view turns; stairs cut an opening in the floor they lead to. Rooms of the active
 * floor light up on hover; a click selects one and opens its controls (lights,
 * scenes, shutters, air quality, heating) in a floating window. The scene
 * follows Home Assistant live: lights on / off in their colour, shutters
 * sliding / swinging to their position, radiators glowing orange with heat
 * rising while they heat; actions from the window show at once.
 * Loaded on demand (three.js is a separate chunk).
 */
import { LitElement, css, html, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { HomeAssistant, Plan, PlanLevel, PlanLight, PlanOpening, PlanPoint, PlanShape, PlanStair, Room } from "../types";
import { centroid, pointInPolygon, projectOnSegment } from "../lib/plan-geometry";
import { lightType, openingGeometry, openingStyle, stairDrawing } from "../lib/plan-items";
import { t } from "../lib/i18n";
import { airLevel, coverPosition, levelName, roomMetric, roomValves, type AirKey } from "../cards/shared";

const FLOOR_H = 2.8; // m, level to level
const WALL_H = 2.5;
const WALL_T = 0.1;
const SLAB = 0.12;
const MAX_LIGHTS = 40;
const WARM = "#ffcf87";
/** See-through facades: opacity, and how square to the view a facade must be. */
const FADE_OPACITY = 0.12;
const FADE_FACING = 0.2;

/** A piece of exterior wall (or what is set in it): it fades, whole, when its
 * outer face is turned toward the camera. */
interface Fadeable {
  mesh: THREE.Mesh;
  /** Outward normal of the facade (unit, plan x / z). */
  nx: number;
  nz: number;
  solid: THREE.Material | THREE.Material[];
}

/** A light fixture (all its glowing parts and point lights) bound to its entity. */
interface LightRig {
  entity: string;
  glow: THREE.MeshBasicMaterial;
  lights: { pl: THREE.PointLight; base: number }[];
}

/** A shutter bound to its cover entity: a roller (slides) or two hinged leaves (swing). */
type ShutterRig =
  | { entity: string; kind: "roller"; mesh: THREE.Mesh; sill: number; top: number }
  | { entity: string; kind: "hinged"; leaves: { mesh: THREE.Mesh; hinge: PlanPoint; side: 1 | -1 }[]; u: PlanPoint; n: PlanPoint; len: number };

/** A radiator bound to its device: orange with heat rising while its valve heats. */
interface RadiatorRig {
  device: string;
  mat: THREE.MeshStandardMaterial;
  smoke: THREE.Group;
  puffs: { sprite: THREE.Sprite; phase: number; dx: number; dz: number }[];
  rise: number; // m the heat climbs (under the ceiling)
  heating: boolean;
}

const OVERRIDE_TTL = 4000; // ms an optimistic light / shutter state waits for HA
const ICON_TEMP = svg`<path d="M10 13.5V5a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0Z"></path><path d="M12 9v7"></path>`;
const ICON_HUMIDITY = svg`<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11Z"></path>`;
const ICON_CO2 = svg`<path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9Z"></path>`;
const ICON_AIR = svg`<path d="M3 8h11a3 3 0 1 0-3-3"></path><path d="M3 12h16a3 3 0 1 1-3 3"></path><path d="M3 16h7"></path>`;
const SHUTTER_SPEED = 18; // % per second, as seen in the scene
const LIGHT_OFF = "#2a2a28";
const HEAT = "#ff7a2f";

/** Opening heights (m above the floor): sill and top. */
const HEIGHTS: Record<PlanOpening["type"], [number, number]> = {
  door: [0, 2.1],
  sliding_door: [0, 2.1],
  glass_door: [0, 2.15],
  window: [0.95, 2.15],
};

const m = (cm: number) => cm / 100;

@customElement("homex-builder-render")
export class HomexBuilderRender extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) plan: Plan | null = null;
  /** Floor to show first (and everything below it). */
  @property({ attribute: false }) levelId: string | null = null;
  /** Homex room names, by room id. */
  @property({ attribute: false }) names: Record<string, string> = {};
  /** Homex rooms (lights, shutters, heating, metrics of the hovered room). */
  @property({ attribute: false }) rooms: Room[] = [];

  /** Room under the pointer, and the selected room (its controls window). */
  @state() private _hover: { shape: PlanShape; level: PlanLevel } | null = null;
  @state() private _selected: { shape: PlanShape; level: PlanLevel } | null = null;
  /** Where the controls window opens (px in the view). */
  private _floors: THREE.Mesh[] = [];
  private _hoverMesh: THREE.Mesh | null = null;
  private _selMesh: THREE.Mesh | null = null;
  private _down: { x: number; y: number } | null = null;
  // live state of the scene
  private _lightRigs: LightRig[] = [];
  private _shutterRigs: ShutterRig[] = [];
  private _radRigs: RadiatorRig[] = [];
  /** Shutter openings as drawn (cur) and where they head (target), by cover entity. */
  private _shutterPos = new Map<string, { cur: number; target: number }>();
  /** Actions from the window, shown at once until the entity's state changes. */
  private _overrides = new Map<string, { on?: boolean; target?: number; stamp: string; at: number }>();
  private _clock = new THREE.Clock();
  private _raycaster = new THREE.Raycaster();
  private _pointer: { x: number; y: number } | null = null;
  private _pickQueued = false;

  /** Highest level shown, null: all. */
  @state() private _upTo: number | null = null;

  private _renderer?: THREE.WebGLRenderer;
  private _scene?: THREE.Scene;
  private _camera?: THREE.PerspectiveCamera;
  private _controls?: OrbitControls;
  private _ro?: ResizeObserver;
  private _levels = new Map<number, THREE.Group>();
  private _built: Plan | null = null;
  private _fadeables: Fadeable[] = [];
  /** See-through clone of each material, shared by the meshes using it. */
  private _faded = new Map<THREE.Material, THREE.Material>();
  private _fadeKey = "";

  private _onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this._selected) this._select(null);
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
    this._ro?.disconnect();
    this._ro = undefined;
    this._renderer?.setAnimationLoop(null);
    this._controls?.dispose();
    this._disposeScene();
    this._renderer?.dispose();
    this._renderer = undefined;
    this._built = null;
  }

  firstUpdated() {
    const host = this.renderRoot.querySelector(".view") as HTMLElement;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    host.appendChild(renderer.domElement);
    this._renderer = renderer;
    const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 500);
    this._camera = camera;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI * 0.49;
    this._controls = controls;
    const el = renderer.domElement;
    el.addEventListener("pointermove", (e) => {
      if (e.buttons) {
        // orbiting / panning: no hover changes under the drag
        return;
      }
      const r = el.getBoundingClientRect();
      this._pointer = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 };
      if (!this._pickQueued) {
        this._pickQueued = true;
        requestAnimationFrame(() => {
          this._pickQueued = false;
          this._pick();
        });
      }
    });
    el.addEventListener("pointerleave", () => {
      this._pointer = null;
      this._setHover(null);
    });
    // A click (not a drag) selects the room under it, or clears the selection.
    el.addEventListener("pointerdown", (e) => (this._down = e.button === 0 ? { x: e.clientX, y: e.clientY } : null));
    el.addEventListener("pointerup", (e) => {
      const d = this._down;
      this._down = null;
      if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) return;
      const r = el.getBoundingClientRect();
      this._select(this._floorAt((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1));
    });
    window.addEventListener("keydown", this._onKey);
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(host);
    this._resize();
    renderer.setAnimationLoop(() => {
      controls.update();
      this._updateFade();
      this._animate(Math.min(this._clock.getDelta(), 0.1));
      if (this._scene) renderer.render(this._scene, camera);
    });
  }

  updated(changed: Map<string, unknown>) {
    if (this._renderer && this.plan && this.hass && this.plan !== this._built) {
      const first = !this._built;
      this._build();
      if (first) {
        const lvl = this.plan.levels.find((l) => l.id === this.levelId);
        this._upTo = lvl ? lvl.level : null;
        this._frame();
      }
      this._applyVisibility();
      this._applyStates();
    } else {
      if (changed.has("_upTo")) this._applyVisibility();
      if (changed.has("hass")) this._applyStates();
    }
  }

  private _resize() {
    const host = this.renderRoot.querySelector(".view") as HTMLElement | null;
    if (!host || !this._renderer || !this._camera) return;
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    this._renderer.setSize(width, height);
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
  }

  private _disposeScene() {
    this._scene?.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      for (const x of Array.isArray(mat) ? mat : mat ? [mat] : []) {
        (x as THREE.MeshBasicMaterial).map?.dispose();
        x.dispose();
      }
    });
    for (const mat of this._faded.values()) mat.dispose(); // clones not in the scene right now
    this._faded.clear();
    this._fadeables = [];
    this._fadeKey = "";
    this._floors = [];
    this._lightRigs = [];
    this._shutterRigs = [];
    this._radRigs = [];
    this._hoverMesh = null;
    this._selMesh = null;
    this._hover = null;
    this._selected = null;
    this._scene = undefined;
    this._levels.clear();
  }

  // -- Scene ----------------------------------------------------------------

  private _build() {
    this._disposeScene();
    const plan = this.plan!;
    this._built = plan;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#14161a");
    scene.add(new THREE.HemisphereLight("#b9c6d8", "#3a3026", 0.85));
    const moon = new THREE.DirectionalLight("#9fb4d6", 0.35);
    moon.position.set(-8, 14, 6);
    scene.add(moon);
    let lights = 0;
    // Stairs open the floor they arrive on: up -> the level above, down -> their own.
    const holes = new Map<number, PlanPoint[][]>();
    for (const level of plan.levels) {
      for (const st of level.stairs ?? []) {
        const target = (st.goes ?? "up") === "down" ? level.level : level.level + 1;
        if (!holes.has(target)) holes.set(target, []);
        holes.get(target)!.push(stairDrawing(st).outline);
      }
    }
    for (const level of plan.levels) {
      const g = new THREE.Group();
      g.position.y = level.level * FLOOR_H;
      this._buildLevel(g, level, holes.get(level.level) ?? []);
      lights = this._buildLights(g, level, lights);
      scene.add(g);
      this._levels.set(level.level, g);
    }
    this._scene = scene;
  }

  private _buildLevel(g: THREE.Group, level: PlanLevel, holes: PlanPoint[][]) {
    const wallMat = new THREE.MeshStandardMaterial({ color: "#ecebe6", roughness: 0.9 });
    const floorMat = new THREE.MeshStandardMaterial({ color: "#c9b79c", roughness: 0.8 });
    const slabMat = new THREE.MeshStandardMaterial({ color: "#8d8a84", roughness: 1 });
    const walls = new Set<string>();
    const obstacles = labelObstacles(level, holes);
    for (const room of level.rooms) {
      // Floor: the outline extruded down by the slab.
      const shape = new THREE.Shape(room.points.map(([x, y]) => new THREE.Vector2(m(x), -m(y))));
      for (const outline of holes) {
        const hole = stairHole(outline, room.points);
        if (hole) shape.holes.push(new THREE.Path(hole.map(([x, y]) => new THREE.Vector2(m(x), -m(y)))));
      }
      const geo = new THREE.ExtrudeGeometry(shape, { depth: SLAB, bevelEnabled: false });
      geo.rotateX(-Math.PI / 2);
      geo.translate(0, -SLAB, 0);
      // Its own floor material: it glows when the room is hovered.
      const floor = new THREE.Mesh(geo, [floorMat.clone(), slabMat]);
      floor.userData.room = { shape: room, level };
      this._floors.push(floor);
      g.add(floor);
      // Walls, cut around the openings on them (a wall shared by two rooms once).
      room.points.forEach((p, i) => {
        const q = room.points[(i + 1) % room.points.length];
        for (const [s0, s1, y0, y1] of this._wallPieces(level, p, q)) {
          const a: PlanPoint = lerp(p, q, s0);
          const b: PlanPoint = lerp(p, q, s1);
          if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.5) continue;
          const key = wallKey(a, b, y0, y1);
          if (walls.has(key)) continue;
          walls.add(key);
          const wall = box(a, b, y0, y1, WALL_T, wallMat);
          g.add(wall);
          this._fadeable(wall, level, a, b);
        }
      });
      // Room name on the floor.
      const name = (room.room_id && this.names[room.room_id]) || room.name;
      if (name) placeLabel(g, name, room.points, obstacles);
    }
    for (const o of level.openings ?? []) this._buildOpening(g, level, o);
    for (const st of level.stairs ?? []) this._buildStairs(g, st);
    for (const r of level.radiators ?? []) {
      const a = (r.angle * Math.PI) / 180;
      const u: PlanPoint = [Math.cos(a), Math.sin(a)];
      const [cx, cy] = inward(level, [r.x, r.y], 0.06); // against the wall, not in it
      const p: PlanPoint = [cx - (u[0] * r.length) / 2, cy - (u[1] * r.length) / 2];
      const q: PlanPoint = [cx + (u[0] * r.length) / 2, cy + (u[1] * r.length) / 2];
      const mat = new THREE.MeshStandardMaterial({ color: "#f2f2f2", roughness: 0.5 });
      const tall = r.kind === "tall";
      const top = tall ? 1.9 : 0.75;
      if (tall) {
        // full height: vertical columns between two collectors
        const n = Math.max(3, Math.round(r.length / 5));
        for (let i = 0; i < n; i++) {
          const t0 = i / n + 0.12 / n;
          const t1 = (i + 1) / n - 0.12 / n;
          const at = (t: number): PlanPoint => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
          g.add(box(at(t0), at(t1), 0.14, top, 0.07, mat));
        }
        g.add(box(p, q, 0.1, 0.16, 0.05, mat));
        g.add(box(p, q, top - 0.04, top + 0.02, 0.05, mat));
      } else g.add(box(p, q, 0.15, top, 0.08, mat));
      // heat rising above it, shown while the valve heats
      const smoke = new THREE.Group();
      smoke.position.set(m(cx), top + 0.05, m(cy));
      smoke.visible = false;
      const puffs: RadiatorRig["puffs"] = [];
      for (let i = 0; i < 7; i++) {
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTexture(), color: "#ffc49a", transparent: true, depthWrite: false, opacity: 0 }));
        const along = (i / 6 - 0.5) * m(r.length) * 0.8;
        smoke.add(sprite);
        puffs.push({ sprite, phase: i / 7, dx: u[0] * along, dz: u[1] * along });
      }
      g.add(smoke);
      if (r.device_id) this._radRigs.push({ device: r.device_id, mat, smoke, puffs, heating: false, rise: Math.min(0.9, WALL_H - top - 0.15) });
    }
  }

  /** Solid pieces of wall p→q, as [from, to] (ratios) × [bottom, top] (m):
   * full height between openings, sill and lintel around them. Openings of
   * any room lying on this wall count (shared walls are drawn twice). */
  private _wallPieces(level: PlanLevel, p: PlanPoint, q: PlanPoint): [number, number, number, number][] {
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (!len) return [];
    const along = (x: PlanPoint) => ((x[0] - p[0]) * (q[0] - p[0]) + (x[1] - p[1]) * (q[1] - p[1])) / (len * len);
    const off = (x: PlanPoint) => Math.abs((x[0] - p[0]) * (q[1] - p[1]) - (x[1] - p[1]) * (q[0] - p[0])) / len;
    const holes: [number, number, number, number][] = [];
    for (const o of level.openings ?? []) {
      const geo = openingGeometry(level, o);
      if (!geo || off(geo.a) > 3 || off(geo.b) > 3) continue;
      const t0 = Math.max(0, Math.min(along(geo.a), along(geo.b)));
      const t1 = Math.min(1, Math.max(along(geo.a), along(geo.b)));
      if ((t1 - t0) * len < 1) continue;
      holes.push([t0, t1, ...HEIGHTS[o.type]]);
    }
    holes.sort((x, y) => x[0] - y[0]);
    const out: [number, number, number, number][] = [];
    let at = 0;
    for (const [t0, t1, sill, top] of holes) {
      if (t0 > at) out.push([at, t0, 0, WALL_H]);
      if (sill > 0) out.push([t0, t1, 0, sill]);
      out.push([t0, t1, top, WALL_H]);
      at = Math.max(at, t1);
    }
    if (at < 1) out.push([at, 1, 0, WALL_H]);
    return out;
  }

  private _buildOpening(level_g: THREE.Group, level: PlanLevel, o: PlanOpening) {
    const geo = openingGeometry(level, o);
    if (!geo) return;
    // Everything of the opening (frame, glass, leaf, shutters) fades with its wall.
    const g = new THREE.Group();
    level_g.add(g);
    const { a, b, c, n, u } = geo;
    const w = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const [sill, top] = HEIGHTS[o.type];
    const style = openingStyle(o);
    const off = (x: PlanPoint, d: number): PlanPoint => [x[0] + n[0] * d, x[1] + n[1] * d];
    const shift = (x: PlanPoint, d: number): PlanPoint => [x[0] + u[0] * d, x[1] + u[1] * d];
    const frameMat = new THREE.MeshStandardMaterial({ color: o.color ?? "#f4f4f4", roughness: 0.6 });
    const woodMat = new THREE.MeshStandardMaterial({ color: o.color ?? "#b98d5f", roughness: 0.7 });
    const glass = new THREE.MeshStandardMaterial({
      color: "#a9d8f2",
      transparent: true,
      opacity: 0.28,
      roughness: 0.1,
      metalness: 0.1,
      depthWrite: false,
    });
    if (o.type === "door") {
      // Leaf open at 90°, as on the plan.
      const hinge = o.flip ? b : a;
      const side = o.out ? -1 : 1;
      const end = off(hinge, side * w);
      g.add(box(hinge, end, 0, 2.05, 0.04, style === "glazed" ? glass : woodMat));
      if (style === "glazed") {
        g.add(box(hinge, end, 0, 0.06, 0.045, woodMat));
        g.add(box(hinge, end, 1.99, 2.05, 0.045, woodMat));
      }
      g.add(box(a, b, 2.05, top, WALL_T + 0.02, frameMat));
    } else if (o.type === "sliding_door") {
      // Leaf half open, along the wall.
      const side = o.out ? -1 : 1;
      const dir = o.flip ? -1 : 1;
      const d = style === "pocket" ? 0 : side * 6;
      g.add(box(off(shift(a, dir * w * 0.5), d), off(shift(b, dir * w * 0.5), d), 0, 2.05, 0.04, style === "glazed" ? glass : woodMat));
    } else {
      // Glass, frame, mullion.
      g.add(box(a, b, sill, top, 0.02, glass));
      g.add(box(a, b, sill, sill + 0.05, 0.08, frameMat));
      g.add(box(a, b, top - 0.05, top, 0.08, frameMat));
      g.add(box(a, shift(a, 5), sill, top, 0.08, frameMat));
      g.add(box(shift(b, -5), b, sill, top, 0.08, frameMat));
      if (style !== "fixed" && style !== "sliding" && (o.type === "glass_door" || w > 70))
        g.add(box(shift(c, -2.5), shift(c, 2.5), sill, top, 0.08, frameMat));
    }
    if (o.cover && o.type !== "door") {
      // Shutters on the outside (-n), moved to their cover's position (_applyStates).
      const mat = new THREE.MeshStandardMaterial({ color: o.cover_color ?? "#cfcfcf", roughness: 0.7 });
      if (o.cover_type === "hinged") {
        const ha = off(a, -7);
        const hb = off(b, -7);
        const la = box(ha, shift(ha, w / 2), sill, top, 0.03, mat);
        const lb = box(hb, shift(hb, -w / 2), sill, top, 0.03, mat);
        g.add(la, lb);
        this._shutterRigs.push({
          entity: o.cover,
          kind: "hinged",
          leaves: [
            { mesh: la, hinge: ha, side: 1 },
            { mesh: lb, hinge: hb, side: -1 },
          ],
          u,
          n,
          len: w / 2,
        });
      } else {
        // unit-high slat curtain, scaled to the opening below the box
        const curtain = box(off(a, -8), off(b, -8), 0, 1, 0.03, mat);
        g.add(curtain);
        g.add(box(off(a, -11), off(b, -11), top, top + 0.2, 0.22, mat));
        this._shutterRigs.push({ entity: o.cover, kind: "roller", mesh: curtain, sill, top });
      }
    }
    for (const child of g.children) this._fadeable(child as THREE.Mesh, level, geo.a, geo.b);
  }

  private _buildStairs(g: THREE.Group, st: PlanStair) {
    const d = stairDrawing(st);
    const shape = st.shape ?? "straight";
    const vertical = st.dir === "up" || st.dir === "down";
    const B = vertical ? st.w : st.h;
    const L = vertical ? st.h : st.w;
    const lane =
      shape === "spiral"
        ? (Math.min(st.w, st.h) / 2) * 0.84
        : shape === "l"
          ? Math.min(B, L) / 2
          : shape === "u"
            ? B / 2
            : B;
    // Treads along the walking line, rising to the next floor (or down).
    const path = d.path;
    const segs = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
    const total = segs.reduce((s, x) => s + x, 0);
    const steps = Math.round(FLOOR_H / 0.18);
    const rise = FLOOR_H / steps;
    const down = (st.goes ?? "up") === "down";
    const mat = new THREE.MeshStandardMaterial({ color: st.color ?? "#b8864e", roughness: 0.7 });
    const at = (dist: number): { p: PlanPoint; u: PlanPoint } => {
      let rest = Math.max(0, Math.min(total, dist));
      for (let i = 0; i < segs.length; i++) {
        if (rest <= segs[i] || i === segs.length - 1) {
          const f = segs[i] ? rest / segs[i] : 0;
          const p0 = path[i];
          const p1 = path[i + 1];
          return {
            p: [p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f],
            u: [(p1[0] - p0[0]) / (segs[i] || 1), (p1[1] - p0[1]) / (segs[i] || 1)],
          };
        }
        rest -= segs[i];
      }
      return { p: path[0], u: [1, 0] };
    };
    const depth = total / steps;
    for (let i = 0; i < steps; i++) {
      const { p, u } = at(depth * (i + 0.5));
      const n: PlanPoint = [-u[1], u[0]];
      const h = down ? -rise * (i + 1) : rise * (i + 1);
      const y = down ? h + rise : h;
      const a: PlanPoint = [p[0] - (n[0] * lane) / 2, p[1] - (n[1] * lane) / 2];
      const b: PlanPoint = [p[0] + (n[0] * lane) / 2, p[1] + (n[1] * lane) / 2];
      g.add(box(a, b, y - 0.05, y, m(depth) * 1.05, mat));
    }
  }

  /** Lights, all on: a glowing fixture and a point light per spot / strip. */
  private _buildLights(g: THREE.Group, level: PlanLevel, count: number): number {
    for (const l of level.lights ?? []) {
      const color = this._lightColor(l);
      const glow = new THREE.MeshBasicMaterial({ color });
      const rig: LightRig = { entity: l.entity_id, glow, lights: [] };
      this._lightRigs.push(rig);
      const body = new THREE.MeshStandardMaterial({ color: l.color ?? "#e8e8e8", roughness: 0.5, side: THREE.DoubleSide });
      const type = lightType(l);
      const addLight = (x: number, y: number, z: number, intensity: number) => {
        if (count >= MAX_LIGHTS) return;
        const pl = new THREE.PointLight(color, intensity, 7, 2);
        pl.position.set(x, y, z);
        g.add(pl);
        rig.lights.push({ pl, base: intensity });
        count++;
      };
      // Wall and floor fixtures stand in the room, clear of the wall they are drawn on.
      const depth = type === "sconce" ? 0.13 : type === "floor_lamp" ? 0.21 : type === "table_lamp" ? 0.24 : 0;
      for (const point of l.points) {
        const [px, py] = depth ? inward(level, point, depth) : point;
        const x = m(px);
        const z = m(py);
        const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, y: number) => {
          const me = new THREE.Mesh(geo, mat);
          me.position.set(x, y, z);
          g.add(me);
        };
        const square = l.shape === "square";
        switch (type) {
          case "pendant":
            mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.6), body, WALL_H - 0.3);
            mesh(new THREE.SphereGeometry(0.09, 16, 12), glow, WALL_H - 0.66);
            if (l.shade) mesh(new THREE.CylinderGeometry(0.08, square ? 0.22 : 0.2, 0.22, square ? 4 : 24, 1, true), body, WALL_H - 0.62);
            addLight(x, WALL_H - 0.75, z, 3);
            break;
          case "spot":
            mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16), glow, WALL_H - 0.01);
            addLight(x, WALL_H - 0.15, z, 1.5);
            break;
          case "sconce":
            mesh(square ? new THREE.BoxGeometry(0.14, 0.14, 0.14) : new THREE.SphereGeometry(0.08, 16, 12), glow, 1.8);
            if (l.shade) mesh(new THREE.CylinderGeometry(0.07, 0.12, 0.16, 24, 1, true), body, 1.8);
            addLight(x, 1.8, z, 1.5);
            break;
          case "floor_lamp":
            mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 24), body, 0.01);
            mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.5), body, 0.75);
            mesh(new THREE.SphereGeometry(0.06, 16, 12), glow, 1.52);
            if (l.shade) mesh(new THREE.CylinderGeometry(0.13, 0.2, 0.3, square ? 4 : 24, 1, true), body, 1.55);
            addLight(x, 1.5, z, 2.5);
            break;
          case "table_lamp":
            // On a small side table.
            mesh(new THREE.BoxGeometry(0.45, 0.55, 0.45), new THREE.MeshStandardMaterial({ color: "#7b5a3c", roughness: 0.8 }), 0.275);
            mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.3), body, 0.7);
            mesh(new THREE.SphereGeometry(0.05, 16, 12), glow, 0.86);
            if (l.shade) mesh(new THREE.CylinderGeometry(0.09, 0.14, 0.2, square ? 4 : 24, 1, true), body, 0.88);
            addLight(x, 0.9, z, 1.5);
            break;
          default: // ceiling light
            mesh(square ? new THREE.BoxGeometry(0.36, 0.05, 0.36) : new THREE.CylinderGeometry(0.18, 0.18, 0.05, 32), glow, WALL_H - 0.03);
            addLight(x, WALL_H - 0.2, z, 3);
        }
      }
      // LED strips: a glowing bar, lit from its middle.
      const y = l.mount === "ceiling" ? WALL_H - 0.03 : l.mount === "wall" ? 1.2 : 0.06;
      for (const [p0, q0] of l.lines) {
        const p = l.mount === "wall" ? inward(level, p0, 0.02) : p0;
        const q = l.mount === "wall" ? inward(level, q0, 0.02) : q0;
        g.add(box(p, q, y - 0.015, y + 0.015, 0.03, glow));
        addLight(m((p[0] + q[0]) / 2), y + (l.mount === "ceiling" ? -0.1 : 0.1), m((p[1] + q[1]) / 2), 1.5);
      }
    }
    return count;
  }

  // -- Live state -------------------------------------------------------------

  /** An action's effect, shown until the entity's state changes in HA. */
  private _override(entity: string, value: { on?: boolean; target?: number }) {
    this._overrides.set(entity, { ...value, stamp: this.hass.states[entity]?.last_updated ?? "", at: Date.now() });
    // HA may never update an entity already in that state: let it win after a while
    window.setTimeout(() => {
      this._applyStates();
      this.requestUpdate();
    }, OVERRIDE_TTL + 50);
    this._applyStates();
    this.requestUpdate(); // the window shows the new target too
  }

  private _overrideOf(entity: string) {
    const o = this._overrides.get(entity);
    if (!o) return undefined;
    if ((this.hass.states[entity]?.last_updated ?? "") !== o.stamp || Date.now() - o.at > OVERRIDE_TTL) {
      this._overrides.delete(entity); // HA caught up: its state wins
      return undefined;
    }
    return o;
  }

  /** Lights, shutters and radiators as HA (or the last action) says. */
  private _applyStates() {
    if (!this.hass) return;
    for (const rig of this._lightRigs) {
      const st = this.hass.states[rig.entity];
      const o = this._overrideOf(rig.entity);
      const on = o?.on ?? st?.state === "on";
      const rgb = on ? (st?.attributes.rgb_color as number[] | undefined) : undefined;
      const bri = st?.state === "on" && st.attributes.brightness != null ? st.attributes.brightness / 255 : 1;
      const color = rgb ? `rgb(${rgb.join(",")})` : WARM;
      rig.glow.color.set(on ? color : LIGHT_OFF);
      for (const { pl, base } of rig.lights) {
        pl.color.set(color);
        pl.intensity = on ? base * (0.25 + 0.75 * bri) : 0;
      }
    }
    for (const rig of this._shutterRigs) {
      const st = this.hass.states[rig.entity];
      const o = this._overrideOf(rig.entity);
      const target = o?.target ?? coverPosition(st);
      const pos = this._shutterPos.get(rig.entity);
      if (pos) pos.target = target;
      else this._shutterPos.set(rig.entity, { cur: target, target });
    }
    const valves = new Map<string, any>();
    for (const e of Object.values((this.hass.entities ?? {}) as Record<string, { entity_id: string; device_id?: string }>)) {
      if (e.entity_id.startsWith("climate.") && e.device_id) valves.set(e.device_id, this.hass.states[e.entity_id]);
    }
    for (const rig of this._radRigs) {
      const v = valves.get(rig.device);
      rig.heating = v?.attributes.hvac_action === "heating";
      rig.mat.color.set(rig.heating ? HEAT : "#f2f2f2");
      rig.mat.emissive.set(rig.heating ? "#ff4a10" : "#000000");
      rig.mat.emissiveIntensity = rig.heating ? 0.35 : 0;
      rig.smoke.visible = rig.heating;
    }
    this._placeShutters();
  }

  /** Shutters glide to their target; heat rises above heating radiators. */
  private _animate(dt: number) {
    let moved = false;
    for (const pos of this._shutterPos.values()) {
      if (pos.cur === pos.target) continue;
      const step = SHUTTER_SPEED * dt;
      pos.cur = Math.abs(pos.target - pos.cur) <= step ? pos.target : pos.cur + Math.sign(pos.target - pos.cur) * step;
      moved = true;
    }
    if (moved) this._placeShutters();
    const t = performance.now() / 1000;
    for (const rig of this._radRigs) {
      if (!rig.heating || !rig.smoke.parent?.visible) continue;
      for (const p of rig.puffs) {
        const k = (t / 2.6 + p.phase) % 1; // 0 → 1 over a puff's life
        const sway = Math.sin((t + p.phase * 7) * 1.7) * 0.05;
        p.sprite.position.set(p.dx + sway, k * rig.rise, p.dz + sway * 0.6);
        const size = 0.2 + k * 0.5;
        p.sprite.scale.set(size, size, 1);
        (p.sprite.material as THREE.SpriteMaterial).opacity = Math.sin(k * Math.PI) * 0.55;
      }
    }
  }

  /** Every shutter drawn at its current opening (0 closed .. 100 open). */
  private _placeShutters() {
    for (const rig of this._shutterRigs) {
      const pos = (this._shutterPos.get(rig.entity)?.cur ?? 100) / 100;
      if (rig.kind === "roller") {
        const h = Math.max(0.03, (rig.top - rig.sill) * (1 - pos));
        rig.mesh.scale.y = h;
        rig.mesh.position.y = rig.top - h / 2;
      } else {
        // closed: across the window; open: folded back against the facade (outside)
        const theta = pos * Math.PI * 0.94;
        for (const leaf of rig.leaves) {
          const d: PlanPoint = [
            rig.u[0] * leaf.side * Math.cos(theta) - rig.n[0] * Math.sin(theta),
            rig.u[1] * leaf.side * Math.cos(theta) - rig.n[1] * Math.sin(theta),
          ];
          const cx = leaf.hinge[0] + (d[0] * rig.len) / 2;
          const cz = leaf.hinge[1] + (d[1] * rig.len) / 2;
          leaf.mesh.position.x = m(cx);
          leaf.mesh.position.z = m(cz);
          leaf.mesh.rotation.y = -Math.atan2(d[1], d[0]);
        }
      }
    }
  }

  // -- Hover ------------------------------------------------------------------

  /** The floor shown on top: the one picked, or the highest with "All floors". */
  private _activeLevel(): number {
    return this._upTo ?? Math.max(...(this.plan?.levels ?? []).map((l) => l.level));
  }

  /** The room floor of the active level at a view position (-1..1). */
  private _floorAt(x: number, y: number): THREE.Mesh | null {
    if (!this._camera) return null;
    const active = this._activeLevel();
    this._raycaster.setFromCamera(new THREE.Vector2(x, y), this._camera);
    const floors = this._floors.filter((f) => (f.userData.room as { level: PlanLevel }).level.level === active);
    return (this._raycaster.intersectObjects(floors, false)[0]?.object as THREE.Mesh | undefined) ?? null;
  }

  private _pick() {
    if (!this._pointer) return;
    this._setHover(this._floorAt(this._pointer.x, this._pointer.y));
  }

  private _setHover(mesh: THREE.Mesh | null) {
    if (mesh === this._hoverMesh) return;
    this._hoverMesh = mesh;
    this._hover = mesh ? (mesh.userData.room as { shape: PlanShape; level: PlanLevel }) : null;
    const canvas = this._renderer?.domElement;
    if (canvas) canvas.style.cursor = mesh ? "pointer" : "";
    this._glow();
  }

  private _select(mesh: THREE.Mesh | null) {
    this._selMesh = mesh;
    this._selected = mesh ? (mesh.userData.room as { shape: PlanShape; level: PlanLevel }) : null;
    this._glow();
  }

  /** Floors glow: a little when hovered, more when selected. */
  private _glow() {
    for (const f of this._floors) {
      const mat = (f.material as THREE.Material[])[0] as THREE.MeshStandardMaterial;
      const level = f === this._selMesh ? 0.5 : f === this._hoverMesh ? 0.22 : 0;
      mat.emissive.set(level ? "#ffcf87" : "#000000");
      mat.emissiveIntensity = level;
    }
  }

  private _call(domain: string, service: string, data: object) {
    this.hass.callService(domain, service, data);
  }

  /** Controls of the selected room, live from HA states: lights and scenes,
   * shutters, air quality and heating. */
  private _roomControls() {
    const sel = this._selected;
    if (!sel) return null;
    const { shape, level } = sel;
    const hass = this.hass;
    const st = (id: string | null | undefined) => (id ? hass.states[id] : undefined);
    const room = this.rooms.find((r) => r.room_id === shape.room_id);
    const title = (shape.room_id && this.names[shape.room_id]) || shape.name || t("builder.render_room");
    const inside = (p: PlanPoint) => pointInPolygon(p, shape.points);

    // lights, for the whole room only: its scenes when it has some, else on / off
    const roomSwitch = room ? st(`switch.homex_${room.room_id}_lights_toggle`) : undefined;
    const activeScene = roomSwitch?.state === "on" ? (roomSwitch.attributes.active_scene as string | null) : null;
    const hasScenes = (room?.scenes ?? []).some((x) => x.removable);
    const scenes = hasScenes ? (room?.scenes ?? []).filter((x) => x.removable || x.key === "turn_on") : [];
    // rooms without a Homex light switch: the fixtures drawn in them, all together
    const fixtures = (level.lights ?? []).filter((l) => l.points.some(inside) || l.lines.some(([p, q]) => inside([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2])));
    const lightIds = roomSwitch ? [] : [...new Set(fixtures.map((l) => l.entity_id))].filter((id) => st(id));
    const lightsOn = roomSwitch ? roomSwitch.state === "on" : lightIds.some((id) => st(id)?.state === "on");
    // the room's fixtures in the scene follow at once
    const fixtureIds = [...new Set(fixtures.map((l) => l.entity_id))];
    const showLights = (on: boolean) => fixtureIds.forEach((id) => this._override(id, { on }));
    const setLights = (on: boolean) => {
      showLights(on);
      return roomSwitch
        ? this._call("switch", on ? "turn_on" : "turn_off", { entity_id: roomSwitch.entity_id })
        : this._call("light", on ? "turn_on" : "turn_off", { entity_id: lightIds });
    };
    // shutters: the room's shutter groups (Homex drives the group); a room
    // without groups gets one "All shutters" row for the shutters fitted on its windows
    const groups = (room?.shutter_groups ?? [])
      .map((g) => ({ id: g.id, name: g.name, devices: g.devices.filter((d) => st(d)) }))
      .filter((g) => g.devices.length);
    const fitted = [...new Set((level.openings ?? []).filter((o) => o.shape === shape.id && o.cover).map((o) => o.cover!))].filter((id) => st(id));
    const shutterRows: { key: string; name: string; devices: string[]; group?: string }[] = groups.length
      ? groups.map((g) => ({ key: g.id, name: g.name, devices: g.devices, group: g.id }))
      : fitted.length
        ? [{ key: "all", name: t("builder.render_all_shutters"), devices: fitted }]
        : [];
    const shutter = (row: { devices: string[]; group?: string }, service: "open_cover" | "stop_cover" | "close_cover") => {
      // the shutters in the scene start moving (or stop) at once
      for (const id of row.devices) {
        const cur = this._shutterPos.get(id)?.cur ?? coverPosition(st(id));
        this._override(id, { target: service === "open_cover" ? 100 : service === "close_cover" ? 0 : cur });
      }
      return room && row.group
        ? hass.callWS({ type: "homex/room/shutter", entry_id: room.entry_id, group_id: row.group, service })
        : this._call("cover", service, { entity_id: row.devices });
    };
    const heating = room ? st(`switch.homex_${room.room_id}_heating`) : undefined;
    const valveIds = new Set(roomValves(hass, room));
    const planDevices = new Set((level.radiators ?? []).filter((r) => r.device_id && inside([r.x, r.y])).map((r) => r.device_id));
    for (const e of Object.values((hass.entities ?? {}) as Record<string, { entity_id: string; device_id?: string }>))
      if (e.entity_id.startsWith("climate.") && e.device_id && planDevices.has(e.device_id)) valveIds.add(e.entity_id);
    const valves = [...valveIds].map((id) => st(id)).filter(Boolean) as any[];
    // the room's heating: on unless its Homex switch says otherwise; its target
    // is the valves' (the highest when they differ), and setting it sets them all
    const heatOn = heating ? heating.state === "on" : valves.some((v) => v.state !== "off");
    const heatActive = heatOn && valves.some((v) => v.attributes.hvac_action === "heating");
    const targets = valves.map((v) => Number(v.attributes.temperature)).filter(Number.isFinite);
    const roomTarget = targets.length ? Math.max(...targets) : null;
    const roomStep = Math.min(...valves.map((v) => Number(v.attributes.target_temp_step) || 0.5), 0.5);
    const currents = valves.map((v) => Number(v.attributes.current_temperature)).filter(Number.isFinite);
    // climate metrics: the room's Homex sensor, else the sensors of its area
    // (averaged), else — for the temperature — what its valves measure
    const area = room?.area_id ?? shape.room_id ?? null;
    const areaOf = (e: { area_id?: string | null; device_id?: string | null }) =>
      e.area_id ?? (e.device_id ? (hass.devices as any)?.[e.device_id]?.area_id : undefined);
    const areaSensors = area
      ? Object.values((hass.entities ?? {}) as Record<string, any>)
          .filter((e) => e.entity_id.startsWith("sensor.") && areaOf(e) === area)
          .map((e) => st(e.entity_id))
          .filter((x): x is any => !!x && Number.isFinite(parseFloat(x.state)))
      : [];
    const metric = (key: string, deviceClass: string): { value: number; unit?: string } | undefined => {
      const own = room ? roomMetric(hass, room.room_id, key) : undefined;
      if (own) return own;
      const found = areaSensors.filter((x) => x.attributes.device_class === deviceClass);
      if (found.length)
        return { value: found.reduce((a, x) => a + parseFloat(x.state), 0) / found.length, unit: found[0].attributes.unit_of_measurement };
      if (key === "temperature" && currents.length) return { value: currents.reduce((a, b) => a + b, 0) / currents.length, unit: "°C" };
      return undefined;
    };
    const metrics = (
      [
        ["temperature", "temperature", "render_m_temperature", 1, ICON_TEMP],
        ["humidity", "humidity", "render_m_humidity", 0, ICON_HUMIDITY],
        ["co2", "carbon_dioxide", "render_m_co2", 0, ICON_CO2],
        ["pm25", "pm25", "render_m_pm25", 0, ICON_AIR],
        ["pm10", "pm10", "render_m_pm10", 0, ICON_AIR],
      ] as const
    )
      .map(([key, dc, label, digits, icon]) => {
        const m_ = metric(key, dc);
        if (!m_) return null;
        const air = key === "co2" || key === "pm25" || key === "pm10" ? airLevel(key as AirKey, m_.value) : null;
        return { key, label: t(`builder.${label}`), value: m_.value.toFixed(digits), unit: m_.unit ?? "", icon, air };
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
    const setRoomTarget = (d: number) => {
      if (roomTarget == null) return;
      const temperature = Math.round((roomTarget + d) / roomStep) * roomStep;
      this._call("climate", "set_temperature", { entity_id: valves.map((v) => v.entity_id), temperature });
    };

    // the window: sized to fit the view
    const host = this.renderRoot.querySelector(".view") as HTMLElement | null;
    const twoCols = shutterRows.length > 0; // shutters in their own (left) column
    const W = twoCols ? 590 : 360;
    const vw = host?.clientWidth ?? 800;
    const vh = host?.clientHeight ?? 600;
    // always docked on the left of the view, under its toolbar
    const left = 10;
    const top = 56;

    return html`<div class="ctl ${twoCols ? "two" : ""}" style="left:${left}px; top:${top}px; width:${Math.min(W, vw - 20)}px; max-height:${vh - top - 10}px" role="dialog" aria-label=${title}>
      <div class="c-head">
        <div>
          <strong>${title}</strong>
          <span>${level.name}</span>
        </div>
        <button class="x" title=${t("builder.render_close")} @click=${() => this._select(null)}>✕</button>
      </div>

      <div class="c-body">
      ${twoCols ? this._shutterColumn(shutterRows, st, shutter) : null}
      <div class="c-main">
      ${roomSwitch || lightIds.length
        ? html`<section>
            <div class="c-title">${t("builder.render_lights")}</div>
            <button class="power-row" @click=${() => setLights(!lightsOn)} aria-pressed=${lightsOn ? "true" : "false"}>
              <span class="power ${lightsOn ? "on" : ""}" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 3v9"></path><path d="M6.3 6.3a8 8 0 1 0 11.4 0"></path></svg>
              </span>
              <span class="p-text">
                <b>${t("builder.render_room_lights")}</b>
                <small>${lightsOn ? (scenes.find((x) => x.key === activeScene)?.name ?? t("builder.render_on")) : t("builder.render_off")}</small>
              </span>
            </button>
            ${scenes.length
              ? html`<div class="btn-group" role="group" aria-label=${t("builder.render_scenes")}>
                  <span class="bg-icon" title=${t("builder.render_scenes")} aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M5 21 15 11"></path><path d="m15 11 2-2"></path><path d="M14 4v2M20 10h2M18.5 5.5 17 7M9.5 5.5 11 7M18.5 14.5 17 13"></path><circle cx="14" cy="10" r="0.6"></circle></svg>
                  </span>
                  ${scenes.map(
                    (x) => html`<button
                      class=${activeScene === x.key ? "on" : ""}
                      @click=${() =>
                        hass.connection
                          .sendMessagePromise({ type: "homex/scene/activate", room_id: room!.room_id, key: x.key })
                          .catch((err) => console.warn("homex: scene", x.key, err))}
                    >
                      ${x.name}
                    </button>`
                  )}
                </div>`
              : null}
          </section>`
        : null}

      ${metrics.length || heating || targets.length
        ? html`<section>
            <div class="c-title">${t("builder.render_climate")}</div>
            ${metrics.length
              ? html`<div class="metrics">
                  ${metrics.map(
                    (x) => html`<div class="metric ${x.key} ${x.air ? `air l${x.air.level}` : ""}" title=${x.air ? `${x.label} · ${levelName(x.air.level)}` : x.label}>
                      <span class="m-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${x.icon}</svg></span>
                      <span class="m-val"><b>${x.value}</b><i>${x.unit}</i></span>
                      <small>${x.label}${x.air ? html` · ${levelName(x.air.level)}` : null}</small>
                    </div>`
                  )}
                </div>`
              : null}
            ${heating || targets.length
              ? html`<div class="heat-row">
                  <button
                    class="power heat ${heatOn ? "on" : ""} ${heatActive ? "active" : ""}"
                    ?disabled=${!heating}
                    title=${t("builder.render_heating")}
                    aria-pressed=${heatOn ? "true" : "false"}
                    @click=${() => heating && this._call("switch", heatOn ? "turn_off" : "turn_on", { entity_id: heating.entity_id })}
                  >
                    <svg viewBox="0 0 24 24"><path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-2 1-3 1.5-4 .5 1.5 1.5 2 1.5 2 0-2.5 0-4.5 1-6.5Z"></path><path d="M5 20h14"></path></svg>
                  </button>
                  <span class="p-text">
                    <b>${t("builder.render_heating")}</b>
                    <small>${heatOn ? (heatActive ? t("builder.render_heating_active") : t("builder.render_on")) : t("builder.render_heating_off")}</small>
                  </span>
                  ${targets.length
                    ? html`<span class="target ${heatOn ? "" : "dim"}">
                        <small>${t("builder.render_target")}</small>
                        <span class="t-set">
                          <button class="b" title="−${roomStep}" ?disabled=${!heatOn} @click=${() => setRoomTarget(-roomStep)}>−</button>
                          <b>${roomTarget!.toFixed(1)}<i>°C</i></b>
                          <button class="b" title="+${roomStep}" ?disabled=${!heatOn} @click=${() => setRoomTarget(roomStep)}>+</button>
                        </span>
                      </span>`
                    : null}
                </div>`
              : null}
          </section>`
        : null}

      ${!roomSwitch && !lightIds.length && !shutterRows.length && !metrics.length && !heating && !targets.length
        ? html`<p class="none">${t("builder.render_nothing")}</p>`
        : null}
      </div>
      </div>
    </div>`;
  }

  /** Left column of the room window: one block per shutter group, with its
   * opening and big Open / Stop / Close buttons stacked vertically. */
  private _shutterColumn(
    rows: { key: string; name: string; devices: string[]; group?: string }[],
    st: (id: string) => any,
    act: (row: { devices: string[]; group?: string }, service: "open_cover" | "stop_cover" | "close_cover") => unknown
  ) {
    return html`<section class="c-shutters">
      <div class="c-title">${t("builder.render_shutters")}</div>
      ${rows.map((row) => {
        // the group's opening: the mean of its shutters (as drawn in the scene while they move)
        const pos = Math.round(
          row.devices.reduce((sum, id) => sum + (this._shutterPos.get(id)?.target ?? coverPosition(st(id))), 0) / row.devices.length
        );
        return html`<div class="sh-group">
          <div class="sh-head">
            <span>${row.name}</span>
            <b>${pos} %</b>
          </div>
          <div class="sh-body">
            <div class="sh-gauge" title="${pos} %"><i style="height:${100 - pos}%"></i></div>
            <div class="sh-btns">
              <button title=${t("builder.render_open")} aria-label=${t("builder.render_open")} @click=${() => act(row, "open_cover")}><svg viewBox="0 0 24 24"><path d="M12 5 20 18H4Z"></path></svg></button>
              <button class="stop" title=${t("builder.render_stop")} aria-label=${t("builder.render_stop")} @click=${() => act(row, "stop_cover")}><svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2.5"></rect></svg></button>
              <button title=${t("builder.render_close")} aria-label=${t("builder.render_close")} @click=${() => act(row, "close_cover")}><svg viewBox="0 0 24 24"><path d="M12 19 4 6h16Z"></path></svg></button>
            </div>
          </div>
        </div>`;
      })}
    </section>`;
  }

  /** Register a mesh lying along plan segment a→b (cm): when the segment is
   * part of the house's outline (a room on one side only), it fades with the
   * facade it belongs to. Interior walls never fade. */
  private _fadeable(mesh: THREE.Mesh, level: PlanLevel, a: PlanPoint, b: PlanPoint) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const n: PlanPoint = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
    const mid: PlanPoint = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const probe = (s: number): PlanPoint => [mid[0] + n[0] * s * 20, mid[1] + n[1] * s * 20];
    const inRoom = (p: PlanPoint) => level.rooms.some((r) => pointInPolygon(p, r.points));
    const plus = inRoom(probe(1));
    const minus = inRoom(probe(-1));
    if (plus === minus) return; // interior wall (rooms both sides), or not part of a room
    const out = plus ? -1 : 1; // the outside is where there is no room
    this._fadeables.push({ mesh, nx: n[0] * out, nz: n[1] * out, solid: mesh.material });
  }

  /** The facades whose outer face is turned toward the camera go see-through,
   * entirely; the others stay solid. */
  private _updateFade() {
    const cam = this._camera;
    const tgt = this._controls?.target;
    if (!cam || !tgt || !this._fadeables.length) return;
    let dx = cam.position.x - tgt.x;
    let dz = cam.position.z - tgt.z;
    const dist = Math.hypot(dx, dz);
    const key = `${(dx / (dist || 1)).toFixed(3)},${(dz / (dist || 1)).toFixed(3)},${dist < 0.5}`;
    if (key === this._fadeKey) return;
    this._fadeKey = key;
    const overhead = dist < 0.5; // looking straight down: nothing in the way
    dx /= dist || 1;
    dz /= dist || 1;
    for (const f of this._fadeables) {
      const fade = !overhead && f.nx * dx + f.nz * dz > FADE_FACING;
      if (fade === !!f.mesh.userData.faded) continue;
      f.mesh.userData.faded = fade;
      f.mesh.material = fade ? this._fadedOf(f.solid) : f.solid;
    }
  }

  private _fadedOf(mat: THREE.Material | THREE.Material[]): THREE.Material | THREE.Material[] {
    if (Array.isArray(mat)) return mat.map((x) => this._fadedOf(x) as THREE.Material);
    let faded = this._faded.get(mat);
    if (!faded) {
      faded = mat.clone();
      faded.transparent = true;
      faded.opacity = Math.min(mat.opacity, FADE_OPACITY);
      faded.depthWrite = false;
      this._faded.set(mat, faded);
    }
    return faded;
  }

  /** The light's colour when on, else a warm white. */
  private _lightColor(l: PlanLight): string {
    const st = this.hass.states[l.entity_id];
    const rgb = st?.state === "on" ? (st.attributes.rgb_color as number[] | undefined) : undefined;
    return rgb ? `rgb(${rgb.join(",")})` : WARM;
  }

  // -- View -------------------------------------------------------------------

  /** Fit the whole house in view. */
  private _frame() {
    const pts = (this.plan?.levels ?? []).flatMap((l) => l.rooms.flatMap((r) => r.points));
    if (!pts.length || !this._camera || !this._controls) return;
    const xs = pts.map((p) => m(p[0]));
    const zs = pts.map((p) => m(p[1]));
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
    const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs), 4);
    const level = this._upTo ?? Math.max(...(this.plan?.levels ?? []).map((l) => l.level));
    const y = level * FLOOR_H + 1;
    this._controls.target.set(cx, y, cz);
    this._camera.position.set(cx + size * 0.55, y + size * 0.95, cz + size * 1.05);
    this._controls.update();
  }

  private _applyVisibility() {
    for (const [lvl, g] of this._levels) g.visible = this._upTo === null || lvl <= this._upTo;
    // hover and selection belong to the active floor
    if (this._selected && this._selected.level.level !== this._activeLevel()) this._select(null);
    if (this._hover && this._hover.level.level !== this._activeLevel()) this._setHover(null);
  }

  /** Show a floor and those below; the view follows it up or down. */
  private _show(level: number | null) {
    const levels = (this.plan?.levels ?? []).map((l) => l.level);
    const before = this._upTo ?? Math.max(...levels);
    const after = level ?? Math.max(...levels);
    this._upTo = level;
    const dy = (after - before) * FLOOR_H;
    if (dy && this._camera && this._controls) {
      this._camera.position.y += dy;
      this._controls.target.y += dy;
    }
  }

  render() {
    const levels = [...(this.plan?.levels ?? [])].sort((a, b) => b.level - a.level);
    return html`<div class="view"></div>
      <div class="floors">
        <button class=${this._upTo === null ? "on" : ""} @click=${() => this._show(null)}>${t("builder.render_all")}</button>
        ${levels.map(
          (l) => html`<button class=${this._upTo === l.level ? "on" : ""} @click=${() => this._show(l.level)}>
            <strong>${l.level}</strong> ${l.name}
          </button>`
        )}
      </div>
      ${this._roomControls()}
      <div class="bar">
        <button @click=${() => this._frame()}>⤢ ${t("builder.render_reset")}</button>
        <span>${t("builder.render_hint")}</span>
      </div>`;
  }

  static styles = css`
    :host {
      position: relative;
      display: block;
      flex: 1 1 auto;
      min-height: 0;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    }
    .view {
      position: absolute;
      inset: 0;
    }
    .view canvas {
      display: block;
    }
    .floors,
    .bar {
      position: absolute;
      background: color-mix(in srgb, var(--card-background-color, #1c1c1c) 90%, transparent);
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    .floors {
      right: 10px;
      bottom: 10px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 150px;
    }
    .floors button {
      font: inherit;
      font-size: 13px;
      text-align: left;
      padding: 8px 12px;
      border: 0;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .floors button + button {
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
    }
    .floors button.on {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .floors strong {
      display: inline-block;
      min-width: 22px;
    }
    .bar {
      left: 10px;
      top: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 10px 4px 4px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .bar button {
      font: inherit;
      font-size: 13px;
      padding: 6px 10px;
      border-radius: 8px;
      border: 0;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.2));
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .ctl {
      position: absolute;
      box-sizing: border-box;
      overflow: auto;
      padding: 14px 16px 16px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      font-size: 14px;
      color: var(--primary-text-color);
      background: color-mix(in srgb, var(--card-background-color, #1c1c1c) 95%, transparent);
      border: 1px solid color-mix(in srgb, #ffcf87 55%, transparent);
      border-radius: 14px;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45), 0 0 22px rgba(255, 207, 135, 0.15);
      z-index: 2;
    }
    .c-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }
    .c-head div {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .c-head strong {
      font-size: 17px;
    }
    .c-head span,
    .none {
      color: var(--secondary-text-color);
      font-size: 12px;
      margin: 0;
    }
    .x {
      border: 0;
      background: transparent;
      color: var(--secondary-text-color);
      font-size: 14px;
      cursor: pointer;
      padding: 2px 4px;
    }
    section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .c-title {
      font-size: 11.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--secondary-text-color);
      margin-bottom: 2px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      width: 100%;
      font: inherit;
      color: inherit;
      text-align: left;
      background: transparent;
      border: 0;
      padding: 7px 6px;
      border-radius: 10px;
      min-height: 40px;
    }
    button.row {
      cursor: pointer;
    }
    button.row:hover {
      background: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
    }
    .row > span:first-child {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }
    .val {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      color: var(--secondary-text-color);
    }
    .val b {
      color: var(--primary-text-color);
      min-width: 30px;
      text-align: center;
    }
    .b {
      font: inherit;
      font-size: 13px;
      width: 34px;
      height: 32px;
      padding: 0;
      border-radius: 8px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .val {
      gap: 6px;
    }
    .choices {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .choices button {
      flex: 1 1 auto;
      min-width: 76px;
      min-height: 40px;
      font: inherit;
      font-size: 14px;
      font-weight: 600;
      padding: 8px 14px;
      border-radius: 10px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .choices button.on {
      background: #e0a84f;
      border-color: #e0a84f;
      color: #1c1c1c;
    }
    .c-body {
      display: flex;
      flex-direction: column;
      gap: 18px;
      min-height: 0;
    }
    .ctl.two .c-body {
      display: grid;
      grid-template-columns: 150px minmax(0, 1fr);
      gap: 20px;
      align-items: start;
    }
    .c-main {
      display: flex;
      flex-direction: column;
      gap: 18px;
      min-width: 0;
    }
    .c-shutters {
      padding-right: 18px;
      border-right: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      gap: 12px;
    }
    .sh-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .sh-head {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      font-size: 14px;
    }
    .sh-head span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .sh-head b {
      color: var(--secondary-text-color);
      font-weight: 600;
    }
    .sh-body {
      display: flex;
      gap: 10px;
      align-items: stretch;
    }
    .sh-gauge {
      position: relative;
      flex: none;
      width: 26px;
      border-radius: 6px;
      overflow: hidden;
      background: linear-gradient(180deg, #8fc3e8, #d9ecf7);
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
    }
    .sh-gauge i {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      background: repeating-linear-gradient(180deg, #9a9a96 0 5px, #b9b9b4 5px 7px);
      transition: height 0.4s;
    }
    .sh-btns {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .sh-btns button {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: 8px;
      border-radius: 10px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .sh-btns button:hover {
      border-color: #e0a84f;
    }
    .sh-btns button svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }
    .sh-btns button.stop svg {
      width: 24px;
      height: 24px;
    }
    @media (max-width: 700px) {
      .ctl.two .c-body {
        grid-template-columns: 1fr;
      }
      .c-shutters {
        padding-right: 0;
        border-right: 0;
      }
    }
    .power-row {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 6px;
      font: inherit;
      color: inherit;
      text-align: left;
      background: transparent;
      border: 0;
      border-radius: 12px;
      cursor: pointer;
    }
    .power-row:hover {
      background: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
    }
    .power {
      flex: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid var(--divider-color, rgba(127, 127, 127, 0.45));
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      color: var(--secondary-text-color);
      transition: background 0.15s, color 0.15s, box-shadow 0.15s;
    }
    .power svg {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2.4;
      stroke-linecap: round;
    }
    .power.on {
      background: #e0a84f;
      border-color: #e0a84f;
      color: #1c1c1c;
      box-shadow: 0 0 16px rgba(224, 168, 79, 0.55);
    }
    .p-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .p-text small {
      color: var(--secondary-text-color);
      font-size: 12.5px;
    }
    .switch {
      position: relative;
      flex: none;
      width: 38px;
      height: 22px;
      border-radius: 999px;
      background: var(--divider-color, rgba(127, 127, 127, 0.4));
      transition: background 0.15s;
    }
    .switch::after {
      content: "";
      position: absolute;
      top: 3px;
      left: 3px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.15s;
    }
    .switch.on {
      background: #e0a84f;
    }
    .switch.on::after {
      transform: translateX(16px);
    }
    .btn-group {
      display: flex;
      flex-wrap: wrap;
      margin-top: 10px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
      border-radius: 12px;
      overflow: hidden;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    }
    .btn-group .bg-icon {
      flex: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      min-height: 42px;
      color: #e0a84f;
      background: color-mix(in srgb, #e0a84f 14%, transparent);
      border-right: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
    }
    .btn-group .bg-icon svg {
      width: 22px;
      height: 22px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
    }
    .btn-group button {
      flex: 1 1 auto;
      min-width: 70px;
      min-height: 42px;
      padding: 8px 12px;
      font: inherit;
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-text-color);
      background: transparent;
      border: 0;
      border-left: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
      cursor: pointer;
    }
    .btn-group .bg-icon + button {
      border-left: 0;
    }
    .btn-group button:hover {
      background: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
    }
    .btn-group button.on {
      background: #e0a84f;
      color: #1c1c1c;
    }
    .heat-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px;
      margin-top: 8px;
    }
    .heat-row .p-text {
      flex: 1;
      min-width: 0;
    }
    button.power.heat {
      padding: 0;
      cursor: pointer;
    }
    button.power.heat:disabled {
      cursor: default;
    }
    .power.heat svg {
      fill: none;
    }
    .power.heat.on {
      background: #e8743b;
      border-color: #e8743b;
      color: #fff;
      box-shadow: 0 0 16px rgba(232, 116, 59, 0.5);
    }
    .power.heat.on.active svg {
      animation: flicker 1.4s ease-in-out infinite;
    }
    @keyframes flicker {
      50% {
        transform: scale(1.12) translateY(-1px);
      }
    }
    .target {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .target > small {
      color: var(--secondary-text-color);
      font-size: 11.5px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .target .t-set {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .target .t-set b {
      font-size: 22px;
      font-weight: 700;
      min-width: 58px;
      text-align: center;
      color: #e8743b;
    }
    .target .t-set b i {
      font-style: normal;
      font-size: 12px;
      font-weight: 600;
      margin-left: 2px;
    }
    .target.dim .t-set b {
      color: var(--secondary-text-color);
    }
    .metrics {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 4px;
    }
    .metric {
      --m: var(--secondary-text-color);
      flex: 1 1 auto;
      display: grid;
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto;
      column-gap: 8px;
      align-items: center;
      padding: 8px 10px;
      border-radius: 12px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      border: 1px solid color-mix(in srgb, var(--m) 35%, transparent);
    }
    .metric.temperature {
      --m: #e8743b;
    }
    .metric.humidity {
      --m: #4ea3e0;
    }
    .metric.air.l0 {
      --m: #4caf7a;
    }
    .metric.air.l1 {
      --m: #e0a84f;
    }
    .metric.air.l2 {
      --m: #e05a4f;
    }
    .m-icon {
      grid-row: span 2;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: var(--m);
      background: color-mix(in srgb, var(--m) 16%, transparent);
    }
    .m-icon svg {
      width: 19px;
      height: 19px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .m-val {
      white-space: nowrap;
    }
    .m-val b {
      font-size: 17px;
      font-weight: 700;
    }
    .m-val i {
      font-style: normal;
      font-size: 11.5px;
      margin-left: 2px;
      color: var(--secondary-text-color);
    }
    .metric small {
      font-size: 11px;
      color: var(--secondary-text-color);
      white-space: nowrap;
    }
    .dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 6px;
      background: var(--divider-color, rgba(127, 127, 127, 0.4));
      vertical-align: 1px;
    }
    @media (max-width: 800px) {
      .bar span {
        display: none;
      }

    }
  `;
}

const lerp = (p: PlanPoint, q: PlanPoint, f: number): PlanPoint => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];

/** A box along plan segment a→b (cm), from y0 to y1 (m), `thick` m thick. */
function box(a: PlanPoint, b: PlanPoint, y0: number, y1: number, thick: number, mat: THREE.Material): THREE.Mesh {
  const dx = m(b[0] - a[0]);
  const dz = m(b[1] - a[1]);
  const len = Math.max(Math.hypot(dx, dz), 0.001);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(len, Math.max(y1 - y0, 0.001), thick), mat);
  mesh.position.set(m(a[0] + b[0]) / 2, (y0 + y1) / 2, m(a[1] + b[1]) / 2);
  mesh.rotation.y = -Math.atan2(dz, dx);
  return mesh;
}

/** A room name drawn on a canvas texture (dark text, or a light pill when floating). */
function labelTexture(text: string, pill: boolean): { tex: THREE.CanvasTexture; ratio: number } {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const font = "600 44px system-ui, sans-serif";
  ctx.font = font;
  canvas.width = Math.ceil(ctx.measureText(text).width) + (pill ? 44 : 24);
  canvas.height = 64;
  ctx.font = font;
  if (pill) {
    ctx.fillStyle = "rgba(245, 241, 232, 0.92)";
    ctx.beginPath();
    ctx.roundRect(2, 2, canvas.width - 4, canvas.height - 4, 30);
    ctx.fill();
  }
  ctx.fillStyle = pill ? "rgba(40, 32, 24, 0.95)" : "rgba(40, 32, 24, 0.75)";
  ctx.textBaseline = "middle";
  ctx.fillText(text, pill ? 22 : 12, 34);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { tex, ratio: canvas.width / canvas.height };
}

const LABEL_H = 0.28; // m
const LABEL_MARGIN = 12; // cm kept from walls and objects
const WIRE = "#3a2e22";

/** Plan rectangle (cm) a label must not cover. */
type Rect = { x0: number; y0: number; x1: number; y1: number };

const rectOf = (pts: PlanPoint[], pad = 0): Rect => ({
  x0: Math.min(...pts.map((p) => p[0])) - pad,
  y0: Math.min(...pts.map((p) => p[1])) - pad,
  x1: Math.max(...pts.map((p) => p[0])) + pad,
  y1: Math.max(...pts.map((p) => p[1])) + pad,
});
const overlaps = (a: Rect, b: Rect) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

/** What would hide a floor label, seen from above: stairs and stair openings,
 * radiators, light fixtures, open door leaves. */
function labelObstacles(level: PlanLevel, holes: PlanPoint[][]): Rect[] {
  const out: Rect[] = [];
  for (const st of level.stairs ?? []) out.push(rectOf(stairDrawing(st).outline));
  for (const h of holes) out.push(rectOf(h));
  for (const r of level.radiators ?? []) {
    const a = (r.angle * Math.PI) / 180;
    const dx = (Math.cos(a) * r.length) / 2;
    const dy = (Math.sin(a) * r.length) / 2;
    out.push(rectOf([[r.x - dx, r.y - dy], [r.x + dx, r.y + dy]], 10));
  }
  for (const l of level.lights ?? []) {
    for (const p of l.points) out.push(rectOf([p], 22));
    for (const [p, q] of l.lines) out.push(rectOf([p, q], 6));
  }
  for (const o of level.openings ?? []) {
    if (o.type !== "door") continue;
    const geo = openingGeometry(level, o);
    if (!geo) continue;
    const w = Math.hypot(geo.b[0] - geo.a[0], geo.b[1] - geo.a[1]);
    const hinge = o.flip ? geo.b : geo.a;
    const side = o.out ? -1 : 1;
    out.push(rectOf([hinge, [hinge[0] + geo.n[0] * side * w, hinge[1] + geo.n[1] * side * w]], 6));
  }
  return out;
}

/** A room's name on its floor, where it hides nothing. At the room's centre when
 * free, else at the nearest free spot with a wire to the centre, else floating
 * above the room with a wire down to it. */
function placeLabel(g: THREE.Group, text: string, room: PlanPoint[], obstacles: Rect[]) {
  const anchor = centroid(room);
  const { tex, ratio } = labelTexture(text, false);
  const wCm = LABEL_H * ratio * 100;
  const hCm = LABEL_H * 100;
  const fits = ([cx, cy]: PlanPoint) => {
    const r: Rect = { x0: cx - wCm / 2, y0: cy - hCm / 2, x1: cx + wCm / 2, y1: cy + hCm / 2 };
    const m_ = LABEL_MARGIN;
    const corners: PlanPoint[] = [
      [r.x0 - m_, r.y0 - m_],
      [r.x1 + m_, r.y0 - m_],
      [r.x1 + m_, r.y1 + m_],
      [r.x0 - m_, r.y1 + m_],
    ];
    return corners.every((c) => pointInPolygon(c, room)) && !obstacles.some((o) => overlaps(r, o));
  };
  let at: PlanPoint | null = fits(anchor) ? anchor : null;
  if (!at) {
    const b = rectOf(room);
    const step = 15;
    const spots: PlanPoint[] = [];
    for (let x = b.x0; x <= b.x1; x += step) for (let y = b.y0; y <= b.y1; y += step) spots.push([x, y]);
    spots.sort((p, q) => Math.hypot(p[0] - anchor[0], p[1] - anchor[1]) - Math.hypot(q[0] - anchor[0], q[1] - anchor[1]));
    at = spots.find(fits) ?? null;
  }
  const wireMat = new THREE.MeshBasicMaterial({ color: WIRE, transparent: true, opacity: 0.9 });
  if (at) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(wCm / 100, LABEL_H),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(m(at[0]), 0.01, m(at[1]));
    g.add(mesh);
    if (at !== anchor) {
      // wire from the centre of the room to the nearest point of the label
      const near: PlanPoint = [
        Math.max(at[0] - wCm / 2, Math.min(anchor[0], at[0] + wCm / 2)),
        Math.max(at[1] - hCm / 2, Math.min(anchor[1], at[1] + hCm / 2)),
      ];
      g.add(box(anchor, near, 0.012, 0.02, 0.025, wireMat));
      g.add(dot(anchor, 0.08, 0.019, new THREE.MeshBasicMaterial({ color: "#f5efe4" })));
      g.add(dot(anchor, 0.055, 0.021, wireMat));
    } else wireMat.dispose();
    return;
  }
  // no free spot on the floor: float in the room, facing the camera
  tex.dispose();
  const pill = labelTexture(text, true);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: pill.tex, transparent: true, depthWrite: false }));
  const h = 0.3;
  const y = 1.9; // inside the room, under the floor above
  sprite.scale.set(h * pill.ratio, h, 1);
  sprite.position.set(m(anchor[0]), y, m(anchor[1]));
  g.add(sprite);
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, y - h / 2), wireMat);
  wire.position.set(m(anchor[0]), (y - h / 2) / 2, m(anchor[1]));
  g.add(wire);
  g.add(dot(anchor, 0.08, 0.019, new THREE.MeshBasicMaterial({ color: "#f5efe4" })));
  g.add(dot(anchor, 0.055, 0.021, wireMat));
}

/** A small disc lying on the floor. */
function dot(at: PlanPoint, r: number, y: number, mat: THREE.Material): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(r, 20), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(m(at[0]), y, m(at[1]));
  return mesh;
}

/** Same wall piece whichever room draws it (rounded to the cm, either direction). */
function wallKey(a: PlanPoint, b: PlanPoint, y0: number, y1: number): string {
  const r = (p: PlanPoint) => `${Math.round(p[0])},${Math.round(p[1])}`;
  const [p, q] = [r(a), r(b)].sort();
  return `${p}|${q}|${y0.toFixed(2)}|${y1.toFixed(2)}`;
}

/** The part of a stair footprint inside a room, as a hole for its floor, or null.
 * Kept a little inside the room so the slab around it stays a valid shape. */
function stairHole(outline: PlanPoint[], room: PlanPoint[]): PlanPoint[] | null {
  let poly: PlanPoint[];
  if (outline.every((p) => pointInPolygon(p, room))) poly = outline;
  else if (isConvex(room)) poly = clip(outline, room);
  else return null;
  if (poly.length < 3 || Math.abs(signedArea(poly)) < 100) return null; // under 10×10 cm: not a real opening
  const [cx, cy] = centroid(poly);
  return poly.map(([x, y]) => [cx + (x - cx) * 0.995, cy + (y - cy) * 0.995] as PlanPoint);
}

function signedArea(pts: PlanPoint[]): number {
  let s = 0;
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    s += p[0] * q[1] - q[0] * p[1];
  });
  return s / 2;
}

function isConvex(pts: PlanPoint[]): boolean {
  let sign = 0;
  for (let i = 0; i < pts.length; i++) {
    const [a, b, c] = [pts[i], pts[(i + 1) % pts.length], pts[(i + 2) % pts.length]];
    const z = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
    if (Math.abs(z) < 1e-9) continue;
    if (sign && Math.sign(z) !== sign) return false;
    sign = Math.sign(z);
  }
  return true;
}

/** Sutherland–Hodgman: `subject` clipped by the convex polygon `by`. */
function clip(subject: PlanPoint[], by: PlanPoint[]): PlanPoint[] {
  const ccw = signedArea(by) > 0;
  const inside = (p: PlanPoint, a: PlanPoint, b: PlanPoint) => {
    const z = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    return ccw ? z >= 0 : z <= 0;
  };
  const cross = (p: PlanPoint, q: PlanPoint, a: PlanPoint, b: PlanPoint): PlanPoint => {
    const [x1, y1, x2, y2, x3, y3, x4, y4] = [p[0], p[1], q[0], q[1], a[0], a[1], b[0], b[1]];
    const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4) || 1e-9;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
  };
  let out = subject;
  for (let i = 0; i < by.length && out.length; i++) {
    const a = by[i];
    const b = by[(i + 1) % by.length];
    const input = out;
    out = [];
    input.forEach((p, j) => {
      const prev = input[(j + input.length - 1) % input.length];
      if (inside(p, a, b)) {
        if (!inside(prev, a, b)) out.push(cross(prev, p, a, b));
        out.push(p);
      } else if (inside(prev, a, b)) out.push(cross(prev, p, a, b));
    });
  }
  return out;
}

/** A point drawn on (or near) a wall, moved into the room so that an object of
 * half-depth `depth` (m) stands against the wall instead of through it. */
function inward(level: PlanLevel, p: PlanPoint, depth: number): PlanPoint {
  const clear = (WALL_T / 2 + depth) * 100 + 1; // cm from the wall's centre line
  let best: { d: number; on: PlanPoint; a: PlanPoint; b: PlanPoint } | null = null;
  for (const room of level.rooms) {
    room.points.forEach((a, i) => {
      const b = room.points[(i + 1) % room.points.length];
      const on = projectOnSegment(p, a, b);
      const d = Math.hypot(p[0] - on[0], p[1] - on[1]);
      if (!best || d < best.d) best = { d, on, a, b };
    });
  }
  if (!best) return p;
  const { d, on, a, b } = best as { d: number; on: PlanPoint; a: PlanPoint; b: PlanPoint };
  if (d >= clear) return p;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const n: PlanPoint = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
  // the side the point is on; on the line itself, the side inside a room
  const side = (s: number): PlanPoint => [on[0] + n[0] * s * clear, on[1] + n[1] * s * clear];
  const own = (p[0] - on[0]) * n[0] + (p[1] - on[1]) * n[1];
  let sign = Math.abs(own) > 0.5 ? Math.sign(own) : 1;
  const inRoom = (q: PlanPoint) => level.rooms.some((r) => pointInPolygon(q, r.points));
  if (!inRoom(side(sign)) && inRoom(side(-sign))) sign = -sign;
  return side(sign);
}

/** A soft round puff (shared texture) for the heat above radiators. */
let puff: THREE.CanvasTexture | undefined;
function puffTexture(): THREE.CanvasTexture {
  if (puff) return puff;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  puff = new THREE.CanvasTexture(c);
  return puff;
}
