import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { mdiCheckCircle, mdiHomeImportOutline, mdiHomePlusOutline } from "@mdi/js";
import type { HomeAssistant, Room } from "../types";
import {
  errorMessage,
  importRooms,
  saveLayout,
  savePreset,
  saveShutterPreset,
  shutterPlan,
  switchPlan,
  type ShutterPlanModel,
  type SwitchPlanModel,
} from "../api";
import type { SwitchLayout } from "../types";
import { fireChanged } from "../types";
import { t } from "../lib/i18n";
import { lightsByArea } from "../lib/area-lights";
import { logo } from "../lib/logo";
import { slugify } from "../lib/slug";

interface AreaRow {
  area_id: string;
  name: string;
  icon?: string;
  devices: number;
  imported: boolean;
}

/**
 * Homex Setup Wizard, shown while Homex has no room.
 *
 * Step 1 — rooms: import the Home Assistant areas as Homex rooms (pick
 * which ones, grouped by floor) or create a room by hand.
 */
@customElement("homex-setup-wizard")
export class HomexSetupWizard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) rooms: Room[] = [];

  /** choose: import or create; import: pick the areas; options: what to
   * import with them (lights, shutters); done: summary. */
  @state() private _step:
    | "choose"
    | "import"
    | "options"
    | "shutters"
    | "switches_intro"
    | "switches"
    | "done" = "choose";
  /** Areas of the imported rooms (the switches step looks there). */
  private _importedAreas: string[] = [];
  /** Switch models of the imported rooms, and the presets to create. */
  @state() private _switchPlan: SwitchPlanModel[] | null = null;
  @state() private _createPresets = new Set<string>();
  @state() private _presetsCreated = 0;
  /** What to bring along with the rooms (step "options"). */
  @state() private _withLights = true;
  @state() private _withShutters = true;
  /** Covers checked for import (step "options"). */
  @state() private _covers = new Set<string>();
  /** Shutter models of the checked covers, and the smart toggle choice per
   * model without a preset yet (step "shutters"). */
  @state() private _plan: ShutterPlanModel[] = [];
  @state() private _smart = new Set<string>();
  @state() private _selected = new Set<string>();
  @state() private _busy = false;
  @state() private _created = 0;

  /** HA areas with their device count, minus those already linked to a room. */
  private _areas(): AreaRow[] {
    const linked = new Set(this.rooms.map((r) => r.area_id).filter(Boolean));
    const counts = new Map<string, number>();
    for (const dev of Object.values((this.hass.devices ?? {}) as Record<string, any>)) {
      if (dev.area_id && !dev.disabled_by) counts.set(dev.area_id, (counts.get(dev.area_id) ?? 0) + 1);
    }
    return Object.values((this.hass.areas ?? {}) as Record<string, any>).map((a) => ({
      area_id: a.area_id,
      name: a.name,
      icon: a.icon,
      devices: counts.get(a.area_id) ?? 0,
      imported: linked.has(a.area_id),
    }));
  }

  /** Areas grouped by floor (by level), areas without a floor last. */
  private _byFloor(areas: AreaRow[]) {
    const floors = Object.values((this.hass.floors ?? {}) as Record<string, any>).sort(
      (a, b) => (a.level ?? 0) - (b.level ?? 0) || a.name.localeCompare(b.name)
    );
    const areaFloor = (id: string) => (this.hass.areas as any)?.[id]?.floor_id as string | undefined;
    const groups = floors
      .map((f) => ({
        key: f.floor_id as string,
        name: f.name as string,
        icon: f.icon as string | undefined,
        areas: areas.filter((a) => areaFloor(a.area_id) === f.floor_id),
      }))
      .filter((g) => g.areas.length);
    const rest = areas.filter((a) => !areaFloor(a.area_id) || !floors.some((f) => f.floor_id === areaFloor(a.area_id)));
    if (rest.length) groups.push({ key: "", name: t("setupWizard.no_floor"), icon: undefined, areas: rest });
    for (const g of groups) g.areas.sort((a, b) => a.name.localeCompare(b.name));
    return groups;
  }

  private _startImport() {
    // Every area not imported yet is checked by default.
    this._selected = new Set(this._areas().filter((a) => !a.imported).map((a) => a.area_id));
    this._step = "import";
  }

  private _toggle(id: string, on: boolean) {
    const next = new Set(this._selected);
    if (on) next.add(id);
    else next.delete(id);
    this._selected = next;
  }

  private _toggleAll(ids: string[], on: boolean) {
    const next = new Set(this._selected);
    for (const id of ids) {
      if (on) next.add(id);
      else next.delete(id);
    }
    this._selected = next;
  }

  /** Light entities by area (the entity's area, else its device's), minus
   * Homex's own, hidden and configuration / diagnostic ones. */
  private _lightsByArea(): Map<string, string[]> {
    return lightsByArea(this.hass);
  }

  /** Cover entities by area, with their device class. */
  private _coversByArea(): Map<string, { entity_id: string; name: string; dc?: string }[]> {
    const devices = (this.hass.devices ?? {}) as Record<string, any>;
    const out = new Map<string, { entity_id: string; name: string; dc?: string }[]>();
    for (const e of Object.values((this.hass.entities ?? {}) as Record<string, any>)) {
      if (!e.entity_id.startsWith("cover.") || e.hidden || e.entity_category) continue;
      const area = e.area_id || (e.device_id && devices[e.device_id]?.area_id);
      if (!area) continue;
      const st = this.hass.states[e.entity_id];
      const name = (st?.attributes.friendly_name as string) || e.entity_id;
      (out.get(area) ?? out.set(area, []).get(area)!).push({
        entity_id: e.entity_id,
        name,
        dc: st?.attributes.device_class as string | undefined,
      });
    }
    for (const list of out.values()) list.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }

  /** Shutter-like covers are checked by default; garage doors, gates,
   * doors, windows, awnings and dampers are listed but not checked. */
  private static NOT_SHUTTERS = new Set(["garage", "gate", "door", "window", "awning", "damper"]);

  private _goOptions() {
    const covers = this._coversByArea();
    this._covers = new Set(
      this._selectedAreas()
        .flatMap((a) => covers.get(a.area_id) ?? [])
        .filter((c) => !HomexSetupWizard.NOT_SHUTTERS.has(c.dc ?? ""))
        .map((c) => c.entity_id)
    );
    this._step = "options";
  }

  private _checkedCovers(): string[] {
    if (!this._withShutters) return [];
    const covers = this._coversByArea();
    return this._selectedAreas()
      .flatMap((a) => covers.get(a.area_id) ?? [])
      .map((c) => c.entity_id)
      .filter((id) => this._covers.has(id));
  }

  private async _goShutters() {
    this._busy = true;
    try {
      this._plan = (await shutterPlan(this.hass, this._checkedCovers())).models;
      this._smart = new Set(this._plan.filter((m) => m.suggested).map((m) => m.model));
      this._step = "shutters";
    } catch (err) {
      alert(t("common.error", { message: errorMessage(err) }));
    } finally {
      this._busy = false;
    }
  }

  private _selectedAreas() {
    return this._areas().filter((a) => this._selected.has(a.area_id) && !a.imported);
  }

  /** The rooms to create: a free id from the area (its id when valid, else
   * its slugified name), and the lights when importing them. */
  private _roomIds(areas: AreaRow[]) {
    const taken = new Set(this.rooms.map((r) => r.room_id));
    const lights = this._lightsByArea();
    const covers = this._coversByArea();
    const checked = new Set(this._checkedCovers());
    return areas.map((a) => {
      const base = /^[a-z0-9_]+$/.test(a.area_id) ? a.area_id : slugify(a.name) || "room";
      let id = base;
      for (let n = 2; taken.has(id); n++) id = `${base}_${n}`;
      taken.add(id);
      const devices = this._withLights ? lights.get(a.area_id) ?? [] : [];
      const shutters = (covers.get(a.area_id) ?? []).map((c) => c.entity_id).filter((c) => checked.has(c));
      return {
        name: a.name,
        room_id: id,
        area_id: a.area_id,
        modules: devices.length ? ["lights"] : [],
        devices,
        shutters,
      };
    });
  }

  private async _import() {
    const areas = this._selectedAreas();
    if (!areas.length) return;
    this._busy = true;
    try {
      // Shutter presets first (smart toggle), for the models that need one.
      if (this._step === "shutters") {
        for (const m of this._plan) {
          if (m.suggested && this._smart.has(m.model)) await saveShutterPreset(this.hass, m.suggested);
        }
      }
      const res = await importRooms(this.hass, this._roomIds(areas));
      this._created = res.created.length;
      this._importedAreas = areas.map((a) => a.area_id);
      // Step 2: the switches of these rooms (configure or skip).
      this._switchPlan = (await switchPlan(this.hass, this._importedAreas)).models;
      this._createPresets = new Set(this._switchPlan.filter((m) => m.preset).map((m) => m.model));
      this._step = "switches_intro";
    } catch (err) {
      alert(t("common.error", { message: errorMessage(err) }));
    } finally {
      this._busy = false;
    }
  }

  /** Create the checked suggested presets (with their layouts). */
  private async _createSwitchPresets() {
    this._busy = true;
    try {
      let n = 0;
      for (const m of this._switchPlan ?? []) {
        if (!m.preset || !m.layout || !this._createPresets.has(m.model)) continue;
        await saveLayout(this.hass, m.layout);
        await savePreset(this.hass, m.preset);
        n++;
      }
      this._presetsCreated = n;
      this._step = "done";
    } catch (err) {
      alert(t("common.error", { message: errorMessage(err) }));
    } finally {
      this._busy = false;
    }
  }

  /** A small drawing of a layout, its buttons named after the model's. */
  private _layoutPreview(layout: SwitchLayout, names: string[]) {
    const b = layout.bounds;
    const outline =
      layout.shape === "round"
        ? svg`<circle cx=${b.x + b.w / 2} cy=${b.y + b.h / 2} r=${Math.max(b.w, b.h) / 2} class="plate"></circle>`
        : svg`<rect x=${b.x} y=${b.y} width=${b.w} height=${b.h} rx=${layout.shape === "vrect" ? 2.5 : 2} class="plate"></rect>`;
    return html`<svg class="layout" viewBox="-11 -11 22 22" aria-hidden="true">
      ${outline}
      ${layout.zones.map(
        (z) => svg`<rect x=${z.x + 0.6} y=${z.y + 0.6} width=${z.w - 1.2} height=${z.h - 1.2} rx="1" class="zone"></rect>
          <text x=${z.x + z.w / 2} y=${z.y + z.h / 2} class="zone-label">${this._buttonLabel(names[z.n - 1] ?? String(z.n))}</text>`
      )}
    </svg>`;
  }

  private _buttonLabel(name: string) {
    const short: Record<string, string> = { arrow_left: "◀", arrow_right: "▶", left: "L", right: "R", main: "●", up: "+", down: "−" };
    return short[name] ?? (name.length > 3 ? name.slice(0, 3) : name);
  }

  /** A detected button's name, readable (known names translated). */
  private _buttonName(name: string) {
    const key = `setupWizard.btn_${name}`;
    const label = t(key);
    return label === key ? name.replace(/_/g, " ") : label;
  }

  private _tapNames(taps: string[]) {
    return taps.map((tp) => t(`setupWizard.tap_${tp}`)).join(", ");
  }

  /** Step 2 intro: what presets are, configure or skip. */
  private _switchesIntro() {
    const models = this._switchPlan ?? [];
    const devices = models.reduce((n, m) => n + m.devices.length, 0);
    return html`
      <div class="done inline">
        <span class="done-icon">${this._icon(mdiCheckCircle)}</span>
        <span>${t(this._created === 1 ? "setupWizard.done_one" : "setupWizard.done_other", { count: this._created })}</span>
      </div>
      <p class="lead">${t("setupWizard.switches_intro")}</p>
      <div class="concepts">
        <div class="concept">
          <span class="concept-title">${t("setupWizard.concept_layout")}</span>
          <span class="option-desc">${t("setupWizard.concept_layout_text")}</span>
        </div>
        <div class="concept">
          <span class="concept-title">${t("setupWizard.concept_preset")}</span>
          <span class="option-desc">${t("setupWizard.concept_preset_text")}</span>
        </div>
        <div class="concept">
          <span class="concept-title">${t("setupWizard.concept_switch")}</span>
          <span class="option-desc">${t("setupWizard.concept_switch_text")}</span>
        </div>
      </div>
      <p class="lead">
        ${devices
          ? t("setupWizard.switches_found", { devices, models: models.length })
          : t("setupWizard.switches_none")}
      </p>
      <div class="actions">
        ${devices
          ? html`<button class="secondary" @click=${() => (this._step = "done")}>${t("setupWizard.skip")}</button>
              <button class="primary" @click=${() => (this._step = "switches")}>${t("setupWizard.configure_switches")}</button>`
          : html`<button class="primary" @click=${() => (this._step = "done")}>${t("setupWizard.next")}</button>`}
      </div>
    `;
  }

  /** Step 2: one card per switch model (existing preset or suggestion). */
  private _switches() {
    const models = this._switchPlan ?? [];
    const toCreate = models.filter((m) => m.preset && this._createPresets.has(m.model)).length;
    return html`
      <p class="lead">${t("setupWizard.switches_pick")}</p>
      ${models.map((m) => {
        const names = m.buttons.map((b) => b.name);
        const devices = m.devices.map((d) => (d.area ? `${d.name} (${d.area})` : d.name));
        return html`<div class="switch-model">
          ${m.layout ? this._layoutPreview(m.layout, names) : html`<div class="layout placeholder"></div>`}
          <div class="option-text">
            <span class="option-title">${m.label} <span class="count">× ${m.devices.length}</span></span>
            <span class="option-desc">
              ${m.existing
                ? t("setupWizard.preset_existing", { name: m.existing.name })
                : m.buttons.length
                  ? m.buttons.map((b) => `${this._buttonName(b.name)} (${this._tapNames(b.taps)})`).join(" · ")
                  : t("setupWizard.actions_unknown")}
            </span>
            <span class="devices">${devices.join(", ")}</span>
          </div>
          ${m.preset
            ? html`<label class="smart">
                <span>${t("setupWizard.create_preset")}</span>
                <span class="switch">
                  <input
                    type="checkbox"
                    .checked=${this._createPresets.has(m.model)}
                    @change=${(e: Event) => {
                      const next = new Set(this._createPresets);
                      if ((e.target as HTMLInputElement).checked) next.add(m.model);
                      else next.delete(m.model);
                      this._createPresets = next;
                    }}
                  />
                  <span></span>
                </span>
              </label>`
            : nothing}
        </div>`;
      })}
      <p class="hint">${t("setupWizard.presets_hint")}</p>
      <div class="actions">
        <button class="secondary" @click=${() => (this._step = "switches_intro")}>${t("setupWizard.back")}</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._createSwitchPresets}>
          ${toCreate
            ? t(toCreate === 1 ? "setupWizard.create_presets_one" : "setupWizard.create_presets_other", { count: toCreate })
            : t("setupWizard.next")}
        </button>
      </div>
    `;
  }

  private _finish() {
    // The panel reloads its rooms: with rooms, the wizard steps aside.
    fireChanged(this);
    this.dispatchEvent(new CustomEvent("wizard-finished", { bubbles: true, composed: true }));
  }

  private _create() {
    this.dispatchEvent(new CustomEvent("wizard-create-room", { bubbles: true, composed: true }));
  }

  private _icon(path: string) {
    return html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d=${path}></path></svg>`;
  }

  private _choose() {
    const available = this._areas().filter((a) => !a.imported).length;
    return html`
      <p class="lead">${t("setupWizard.rooms_intro")}</p>
      <div class="choices">
        <button class="choice" ?disabled=${!available} @click=${this._startImport}>
          <span class="choice-icon">${this._icon(mdiHomeImportOutline)}</span>
          <span class="choice-title">${t("setupWizard.import_title")}</span>
          <span class="choice-text">
            ${available
              ? t("setupWizard.import_text", { count: available })
              : t("setupWizard.import_none")}
          </span>
        </button>
        <button class="choice" @click=${this._create}>
          <span class="choice-icon">${this._icon(mdiHomePlusOutline)}</span>
          <span class="choice-title">${t("setupWizard.create_title")}</span>
          <span class="choice-text">${t("setupWizard.create_text")}</span>
        </button>
      </div>
    `;
  }

  private _importList() {
    const areas = this._areas();
    const groups = this._byFloor(areas);
    const selectable = areas.filter((a) => !a.imported).map((a) => a.area_id);
    const count = selectable.filter((id) => this._selected.has(id)).length;
    return html`
      <div class="list-head">
        <p class="lead">${t("setupWizard.import_pick")}</p>
        <span class="bulk">
          <button class="link" @click=${() => this._toggleAll(selectable, true)}>${t("setupWizard.select_all")}</button>
          ·
          <button class="link" @click=${() => this._toggleAll(selectable, false)}>${t("setupWizard.select_none")}</button>
        </span>
      </div>
      ${groups.map((g) => {
        const ids = g.areas.filter((a) => !a.imported).map((a) => a.area_id);
        const all = ids.length > 0 && ids.every((id) => this._selected.has(id));
        return html`<section class="floor">
          <label class="floor-head">
            <input
              type="checkbox"
              .checked=${all}
              .indeterminate=${!all && ids.some((id) => this._selected.has(id))}
              ?disabled=${!ids.length}
              @change=${(e: Event) => this._toggleAll(ids, (e.target as HTMLInputElement).checked)}
            />
            ${g.icon ? html`<ha-icon .icon=${g.icon}></ha-icon>` : nothing}
            <span>${g.name}</span>
          </label>
          ${g.areas.map(
            (a) => html`<label class="area ${a.imported ? "imported" : ""}">
              <input
                type="checkbox"
                .checked=${a.imported || this._selected.has(a.area_id)}
                ?disabled=${a.imported}
                @change=${(e: Event) => this._toggle(a.area_id, (e.target as HTMLInputElement).checked)}
              />
              <ha-icon .icon=${a.icon || "mdi:texture-box"}></ha-icon>
              <span class="area-name">${a.name}</span>
              <span class="meta">
                ${a.imported
                  ? t("setupWizard.already_imported")
                  : t(a.devices === 1 ? "setupWizard.device_one" : "setupWizard.device_other", { count: a.devices })}
              </span>
            </label>`
          )}
        </section>`;
      })}
      <div class="actions">
        <button class="secondary" @click=${() => (this._step = "choose")}>${t("setupWizard.back")}</button>
        <button class="primary" ?disabled=${!count} @click=${this._goOptions}>
          ${t("setupWizard.next")}
        </button>
      </div>
    `;
  }

  /** What to import with the rooms: their lights, their shutters. */
  private _options() {
    const areas = this._selectedAreas();
    const lights = this._lightsByArea();
    const nLights = areas.reduce((n, a) => n + (lights.get(a.area_id)?.length ?? 0), 0);
    const roomsWithLights = areas.filter((a) => lights.get(a.area_id)?.length).length;
    const count = areas.length;
    return html`
      <p class="lead">${t("setupWizard.options_intro", { count })}</p>
      <label class="option">
        <span class="option-text">
          <span class="option-title">${t("setupWizard.lights_title")}</span>
          <span class="option-desc">
            ${nLights
              ? t("setupWizard.lights_desc", { lights: nLights, rooms: roomsWithLights })
              : t("setupWizard.lights_none")}
          </span>
        </span>
        <span class="switch">
          <input
            type="checkbox"
            .checked=${this._withLights && nLights > 0}
            ?disabled=${!nLights}
            @change=${(e: Event) => (this._withLights = (e.target as HTMLInputElement).checked)}
          />
          <span></span>
        </span>
      </label>
      ${this._shuttersOption(areas)}
      <p class="hint">${t("setupWizard.options_hint")}</p>
      <div class="actions">
        <button class="secondary" @click=${() => (this._step = "import")}>${t("setupWizard.back")}</button>
        ${this._checkedCovers().length
          ? html`<button class="primary" ?disabled=${this._busy} @click=${this._goShutters}>
              ${t("setupWizard.next")}
            </button>`
          : this._importButton(count)}
      </div>
    `;
  }

  private _importButton(count: number) {
    return html`<button class="primary" ?disabled=${!count || this._busy} @click=${this._import}>
      ${this._busy
        ? t("setupWizard.importing")
        : t(count === 1 ? "setupWizard.import_button_one" : "setupWizard.import_button_other", { count })}
    </button>`;
  }

  /** "Import the shutters": the toggle, then the covers of each room. */
  private _shuttersOption(areas: AreaRow[]) {
    const covers = this._coversByArea();
    // Same order as the room selection: by floor, then by name.
    const order = this._byFloor(areas).flatMap((g) => g.areas);
    const rooms = order.filter((a) => covers.get(a.area_id)?.length);
    const total = rooms.reduce((n, a) => n + covers.get(a.area_id)!.length, 0);
    const checked = this._checkedCovers().length;
    const on = this._withShutters && total > 0;
    return html`<div class="option-block ${on ? "open" : ""}">
      <label class="option">
        <span class="option-text">
          <span class="option-title">${t("setupWizard.shutters_title")}</span>
          <span class="option-desc">
            ${total
              ? t("setupWizard.shutters_desc", { checked, total, rooms: rooms.length })
              : t("setupWizard.shutters_none")}
          </span>
        </span>
        <span class="switch">
          <input
            type="checkbox"
            .checked=${on}
            ?disabled=${!total}
            @change=${(e: Event) => (this._withShutters = (e.target as HTMLInputElement).checked)}
          />
          <span></span>
        </span>
      </label>
      ${on
        ? html`<div class="covers">
            ${rooms.map(
              (a) => html`<div class="cover-room">${a.name}</div>
                ${covers.get(a.area_id)!.map((c) => {
                  const other = HomexSetupWizard.NOT_SHUTTERS.has(c.dc ?? "");
                  return html`<label class="cover">
                    <input
                      type="checkbox"
                      .checked=${this._covers.has(c.entity_id)}
                      @change=${(e: Event) => {
                        const next = new Set(this._covers);
                        if ((e.target as HTMLInputElement).checked) next.add(c.entity_id);
                        else next.delete(c.entity_id);
                        this._covers = next;
                      }}
                    />
                    <span class="area-name">${c.name}</span>
                    ${other ? html`<span class="tag">${t("setupWizard.not_a_shutter", { type: t(`setupWizard.dc_${c.dc}`) })}</span>` : nothing}
                  </label>`;
                })}`
            )}
          </div>`
        : nothing}
    </div>`;
  }

  /** Shutter models: reuse a preset, or create one with smart toggle. */
  private _shutters() {
    const count = this._selectedAreas().length;
    return html`
      <p class="lead">${t("setupWizard.models_intro")}</p>
      ${this._plan.map((m) => {
        const n = m.covers.length;
        return html`<div class="option model">
          <span class="option-text">
            <span class="option-title">${m.label} <span class="count">× ${n}</span></span>
            <span class="option-desc">
              ${m.existing
                ? t("setupWizard.model_existing", { name: m.existing.name })
                : m.detection?.source === "z2m"
                  ? t("setupWizard.model_z2m", { field: m.detection.field ?? "" })
                  : t("setupWizard.model_cover")}
            </span>
          </span>
          ${m.suggested
            ? html`<label class="smart">
                <span>${t("setupWizard.smart_toggle")}</span>
                <span class="switch">
                  <input
                    type="checkbox"
                    .checked=${this._smart.has(m.model)}
                    @change=${(e: Event) => {
                      const next = new Set(this._smart);
                      if ((e.target as HTMLInputElement).checked) next.add(m.model);
                      else next.delete(m.model);
                      this._smart = next;
                    }}
                  />
                  <span></span>
                </span>
              </label>`
            : nothing}
        </div>`;
      })}
      <p class="hint">${t("setupWizard.smart_hint")}</p>
      <div class="actions">
        <button class="secondary" @click=${() => (this._step = "options")}>${t("setupWizard.back")}</button>
        ${this._importButton(count)}
      </div>
    `;
  }

  private _done() {
    return html`
      <div class="done">
        <span class="done-icon">${this._icon(mdiCheckCircle)}</span>
        <div>
          <p class="lead">
            ${t(this._created === 1 ? "setupWizard.done_one" : "setupWizard.done_other", { count: this._created })}
          </p>
          ${this._presetsCreated
            ? html`<p class="lead">
                ${t(this._presetsCreated === 1 ? "setupWizard.presets_done_one" : "setupWizard.presets_done_other", {
                  count: this._presetsCreated,
                })}
              </p>`
            : nothing}
        </div>
      </div>
      <div class="actions">
        <button class="primary" @click=${this._finish}>${t("setupWizard.continue")}</button>
      </div>
    `;
  }

  /** 1 Rooms · 2 Switches, the current one highlighted. */
  private _stepper() {
    const second = ["switches_intro", "switches"].includes(this._step);
    const finished = this._step === "done";
    const steps = [
      { n: 1, label: t("setupWizard.step_rooms"), state: second || finished ? "past" : "current" },
      { n: 2, label: t("setupWizard.step_switches"), state: finished ? "past" : second ? "current" : "next" },
    ];
    return html`<div class="steps">
      ${steps.map(
        (st) => html`<span class="step ${st.state}">
          <span class="step-num">${st.state === "past" ? "✓" : st.n}</span>
          <span>${st.label}</span>
        </span>`
      )}
    </div>`;
  }

  render() {
    return html`
      <div class="card">
        <header>
          ${logo(36)}
          <div>
            <h2>${t("setupWizard.title")}</h2>
            <div class="sub">${t("setupWizard.subtitle")}</div>
          </div>
        </header>
        ${this._stepper()}
        ${this._step === "choose"
          ? this._choose()
          : this._step === "import"
            ? this._importList()
            : this._step === "options"
              ? this._options()
              : this._step === "shutters"
                ? this._shutters()
                : this._step === "switches_intro"
                  ? this._switchesIntro()
                  : this._step === "switches"
                    ? this._switches()
                    : this._done()}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    .card {
      background: var(--ha-card-background, var(--card-background-color, #fff));
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
      border-radius: 16px;
      padding: 24px;
      color: var(--primary-text-color);
    }
    header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
    }
    h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 500;
    }
    .sub {
      color: var(--secondary-text-color);
      font-size: 14px;
      margin-top: 2px;
    }
    .steps {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 22px;
      margin-bottom: 8px;
    }
    .step.next {
      opacity: 0.5;
    }
    .step.past .step-num {
      background: var(--success-color, #43a047);
    }
    .step {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
      font-size: 15px;
      margin-bottom: 8px;
    }
    .step-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .lead {
      margin: 8px 0 16px;
      color: var(--secondary-text-color);
      line-height: 1.5;
    }
    svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }
    button {
      font: inherit;
      color: inherit;
      cursor: pointer;
    }
    button:disabled {
      cursor: default;
      opacity: 0.5;
    }
    .choices {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 14px;
    }
    .choice {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      text-align: left;
      padding: 18px;
      border-radius: 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      background: transparent;
    }
    .choice:not(:disabled):hover {
      border-color: var(--primary-color);
      background: color-mix(in srgb, var(--primary-color) 6%, transparent);
    }
    .choice-icon {
      color: var(--primary-color);
    }
    .choice-icon svg {
      width: 32px;
      height: 32px;
    }
    .choice-title {
      font-weight: 500;
      font-size: 16px;
    }
    .choice-text {
      color: var(--secondary-text-color);
      font-size: 14px;
      line-height: 1.4;
    }
    .list-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .bulk {
      color: var(--secondary-text-color);
      white-space: nowrap;
    }
    .link {
      border: none;
      background: none;
      padding: 0;
      color: var(--primary-color);
    }
    .floor {
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
      border-radius: 12px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }
    .floor-head {
      padding: 10px 14px;
      font-weight: 500;
      background: rgba(127, 127, 127, 0.08);
    }
    .area {
      padding: 8px 14px 8px 38px;
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.15));
    }
    .area.imported {
      cursor: default;
      opacity: 0.6;
    }
    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      margin: 0;
      flex: none;
      accent-color: var(--primary-color);
    }
    ha-icon {
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
      flex: none;
    }
    .area-name {
      flex: 1;
      min-width: 0;
    }
    .meta {
      color: var(--secondary-text-color);
      font-size: 13px;
      white-space: nowrap;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 18px;
    }
    .primary,
    .secondary {
      border-radius: 8px;
      padding: 9px 18px;
      font-weight: 500;
      border: 1px solid transparent;
    }
    .primary {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .secondary {
      background: transparent;
      border-color: var(--divider-color, rgba(127, 127, 127, 0.4));
    }
    .option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 16px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
      border-radius: 12px;
      margin-bottom: 10px;
    }
    .option-block {
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
      border-radius: 12px;
      margin-bottom: 10px;
    }
    .option-block .option {
      border: none;
      margin: 0;
    }
    .covers {
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.15));
      padding: 6px 16px 12px;
      max-height: 320px;
      overflow-y: auto;
    }
    .cover-room {
      font-size: 13px;
      font-weight: 500;
      color: var(--secondary-text-color);
      margin: 10px 0 4px;
    }
    .cover {
      padding: 4px 0 4px 8px;
    }
    .tag {
      font-size: 12px;
      color: var(--warning-color, #ffa600);
      white-space: nowrap;
    }
    .model {
      cursor: default;
    }
    .count {
      color: var(--secondary-text-color);
      font-weight: 400;
    }
    .smart {
      gap: 10px;
      font-size: 13px;
      color: var(--secondary-text-color);
      white-space: nowrap;
    }
    .option.disabled {
      cursor: default;
      opacity: 0.55;
    }
    .option-text {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .option-title {
      font-weight: 500;
    }
    .option-desc,
    .hint {
      color: var(--secondary-text-color);
      font-size: 13px;
      line-height: 1.4;
    }
    .switch {
      position: relative;
      width: 40px;
      height: 22px;
      flex: none;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .switch span {
      position: absolute;
      inset: 0;
      border-radius: 11px;
      background: rgba(127, 127, 127, 0.4);
      transition: background 0.2s;
    }
    .switch span::before {
      content: "";
      position: absolute;
      width: 18px;
      height: 18px;
      left: 2px;
      top: 2px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.2s;
    }
    .switch input:checked + span {
      background: var(--primary-color);
    }
    .switch input:checked + span::before {
      transform: translateX(18px);
    }
    .done.inline {
      font-weight: 500;
      margin-bottom: 4px;
    }
    .done.inline svg {
      width: 22px;
      height: 22px;
    }
    .concepts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }
    .concept {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px 14px;
      border-radius: 10px;
      background: rgba(127, 127, 127, 0.08);
    }
    .concept-title {
      font-weight: 500;
    }
    .switch-model {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
      border-radius: 12px;
      margin-bottom: 10px;
    }
    .switch-model .option-text {
      flex: 1;
      min-width: 0;
    }
    .layout {
      width: 76px;
      height: 76px;
      flex: none;
    }
    .layout .plate {
      fill: rgba(127, 127, 127, 0.12);
      stroke: var(--secondary-text-color);
      stroke-width: 0.4;
    }
    .layout .zone {
      fill: var(--card-background-color, #fff);
      stroke: var(--primary-color);
      stroke-width: 0.35;
    }
    .layout .zone-label {
      font-size: 2.6px;
      fill: var(--primary-text-color);
      text-anchor: middle;
      dominant-baseline: central;
    }
    .devices {
      font-size: 12px;
      color: var(--secondary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .done {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .done-icon {
      color: var(--success-color, #43a047);
    }
    .done-icon svg {
      width: 36px;
      height: 36px;
    }
  `;
}
