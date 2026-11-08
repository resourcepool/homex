/**
 * 3D Builder "Rendering" tab: the house as a doll's house (no ceilings), built
 * from the plan: walls with their openings, floors, stairs, radiators, the
 * lights on and the shutters half open. View only: orbit, pan, zoom, floors.
 * Loaded on demand (three.js is a separate chunk).
 */
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { HomeAssistant, Plan, PlanLevel, PlanLight, PlanOpening, PlanPoint, PlanStair } from "../types";
import { centroid } from "../lib/plan-geometry";
import { lightType, openingGeometry, openingStyle, stairDrawing } from "../lib/plan-items";
import { t } from "../lib/i18n";

const FLOOR_H = 2.8; // m, level to level
const WALL_H = 2.5;
const WALL_T = 0.1;
const SLAB = 0.12;
const MAX_LIGHTS = 40;
const WARM = "#ffcf87";

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

  /** Highest level shown, null: all. */
  @state() private _upTo: number | null = null;

  private _renderer?: THREE.WebGLRenderer;
  private _scene?: THREE.Scene;
  private _camera?: THREE.PerspectiveCamera;
  private _controls?: OrbitControls;
  private _ro?: ResizeObserver;
  private _levels = new Map<number, THREE.Group>();
  private _built: Plan | null = null;

  disconnectedCallback() {
    super.disconnectedCallback();
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
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(host);
    this._resize();
    renderer.setAnimationLoop(() => {
      controls.update();
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
    } else if (changed.has("_upTo")) this._applyVisibility();
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
    for (const level of plan.levels) {
      const g = new THREE.Group();
      g.position.y = level.level * FLOOR_H;
      this._buildLevel(g, level);
      lights = this._buildLights(g, level, lights);
      scene.add(g);
      this._levels.set(level.level, g);
    }
    this._scene = scene;
  }

  private _buildLevel(g: THREE.Group, level: PlanLevel) {
    const wallMat = new THREE.MeshStandardMaterial({ color: "#ecebe6", roughness: 0.9 });
    const floorMat = new THREE.MeshStandardMaterial({ color: "#c9b79c", roughness: 0.8 });
    const slabMat = new THREE.MeshStandardMaterial({ color: "#8d8a84", roughness: 1 });
    for (const room of level.rooms) {
      // Floor: the outline extruded down by the slab.
      const shape = new THREE.Shape(room.points.map(([x, y]) => new THREE.Vector2(m(x), -m(y))));
      const geo = new THREE.ExtrudeGeometry(shape, { depth: SLAB, bevelEnabled: false });
      geo.rotateX(-Math.PI / 2);
      geo.translate(0, -SLAB, 0);
      g.add(new THREE.Mesh(geo, [floorMat, slabMat]));
      // Walls, cut around the openings on them.
      room.points.forEach((p, i) => {
        const q = room.points[(i + 1) % room.points.length];
        for (const [s0, s1, y0, y1] of this._wallPieces(level, p, q)) {
          const a: PlanPoint = lerp(p, q, s0);
          const b: PlanPoint = lerp(p, q, s1);
          if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.5) continue;
          g.add(box(a, b, y0, y1, WALL_T, wallMat));
        }
      });
      // Room name on the floor.
      const name = (room.room_id && this.names[room.room_id]) || room.name;
      if (name) g.add(label(name, centroid(room.points)));
    }
    for (const o of level.openings ?? []) this._buildOpening(g, level, o);
    for (const st of level.stairs ?? []) this._buildStairs(g, st);
    const radMat = new THREE.MeshStandardMaterial({ color: "#f2f2f2", roughness: 0.5 });
    for (const r of level.radiators ?? []) {
      const a = (r.angle * Math.PI) / 180;
      const u: PlanPoint = [Math.cos(a), Math.sin(a)];
      const p: PlanPoint = [r.x - (u[0] * r.length) / 2, r.y - (u[1] * r.length) / 2];
      const q: PlanPoint = [r.x + (u[0] * r.length) / 2, r.y + (u[1] * r.length) / 2];
      g.add(box(p, q, 0.15, 0.75, 0.08, radMat));
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

  private _buildOpening(g: THREE.Group, level: PlanLevel, o: PlanOpening) {
    const geo = openingGeometry(level, o);
    if (!geo) return;
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
      // Shutters, half open, on the outside (-n).
      const mat = new THREE.MeshStandardMaterial({ color: o.cover_color ?? "#cfcfcf", roughness: 0.7 });
      if (o.cover_type === "hinged") {
        const k = Math.SQRT1_2;
        const leaf = (h: PlanPoint, along: number): PlanPoint => [
          h[0] + (u[0] * along * k - n[0] * k) * (w / 2),
          h[1] + (u[1] * along * k - n[1] * k) * (w / 2),
        ];
        const ha = off(a, -7);
        const hb = off(b, -7);
        g.add(box(ha, leaf(ha, 1), sill, top, 0.03, mat));
        g.add(box(hb, leaf(hb, -1), sill, top, 0.03, mat));
      } else {
        g.add(box(off(a, -8), off(b, -8), top - (top - sill) / 2, top, 0.03, mat));
        g.add(box(off(a, -11), off(b, -11), top, top + 0.2, 0.22, mat));
      }
    }
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
      const body = new THREE.MeshStandardMaterial({ color: l.color ?? "#e8e8e8", roughness: 0.5, side: THREE.DoubleSide });
      const type = lightType(l);
      const addLight = (x: number, y: number, z: number, intensity: number) => {
        if (count >= MAX_LIGHTS) return;
        const pl = new THREE.PointLight(color, intensity, 7, 2);
        pl.position.set(x, y, z);
        g.add(pl);
        count++;
      };
      for (const [px, py] of l.points) {
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
      for (const [p, q] of l.lines) {
        g.add(box(p, q, y - 0.015, y + 0.015, 0.03, glow));
        addLight(m((p[0] + q[0]) / 2), y + (l.mount === "ceiling" ? -0.1 : 0.1), m((p[1] + q[1]) / 2), 1.5);
      }
    }
    return count;
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

/** A room name lying on its floor. */
function label(text: string, at: PlanPoint): THREE.Mesh {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const font = "600 44px system-ui, sans-serif";
  ctx.font = font;
  canvas.width = Math.ceil(ctx.measureText(text).width) + 24;
  canvas.height = 64;
  ctx.font = font;
  ctx.fillStyle = "rgba(40, 32, 24, 0.75)";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 12, 34);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const h = 0.28;
  const w = (h * canvas.width) / canvas.height;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(m(at[0]), 0.01, m(at[1]));
  return mesh;
}
