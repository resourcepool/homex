import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { mdiCheckCircle, mdiHomeImportOutline, mdiHomePlusOutline } from "@mdi/js";
import type { HomeAssistant, Room } from "../types";
import { errorMessage, importRooms } from "../api";
import { fireChanged } from "../types";
import { t } from "../lib/i18n";
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
  @state() private _step: "choose" | "import" | "options" | "done" = "choose";
  /** What to bring along with the rooms (step "options"). */
  @state() private _withLights = true;
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
    const devices = (this.hass.devices ?? {}) as Record<string, any>;
    const out = new Map<string, string[]>();
    for (const e of Object.values((this.hass.entities ?? {}) as Record<string, any>)) {
      if (!e.entity_id.startsWith("light.") || e.entity_id.startsWith("light.homex_")) continue;
      if (e.hidden || e.entity_category) continue;
      const area = e.area_id || (e.device_id && devices[e.device_id]?.area_id);
      if (!area) continue;
      (out.get(area) ?? out.set(area, []).get(area)!).push(e.entity_id);
    }
    for (const list of out.values()) list.sort();
    return out;
  }

  private _selectedAreas() {
    return this._areas().filter((a) => this._selected.has(a.area_id) && !a.imported);
  }

  /** The rooms to create: a free id from the area (its id when valid, else
   * its slugified name), and the lights when importing them. */
  private _roomIds(areas: AreaRow[]) {
    const taken = new Set(this.rooms.map((r) => r.room_id));
    const lights = this._lightsByArea();
    return areas.map((a) => {
      const base = /^[a-z0-9_]+$/.test(a.area_id) ? a.area_id : slugify(a.name) || "room";
      let id = base;
      for (let n = 2; taken.has(id); n++) id = `${base}_${n}`;
      taken.add(id);
      const devices = this._withLights ? lights.get(a.area_id) ?? [] : [];
      return {
        name: a.name,
        room_id: id,
        area_id: a.area_id,
        modules: devices.length ? ["lights"] : [],
        devices,
      };
    });
  }

  private async _import() {
    const areas = this._selectedAreas();
    if (!areas.length) return;
    this._busy = true;
    try {
      const res = await importRooms(this.hass, this._roomIds(areas));
      this._created = res.created.length;
      this._step = "done";
    } catch (err) {
      alert(t("common.error", { message: errorMessage(err) }));
    } finally {
      this._busy = false;
    }
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
        <button class="primary" ?disabled=${!count} @click=${() => (this._step = "options")}>
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
      <label class="option disabled">
        <span class="option-text">
          <span class="option-title">${t("setupWizard.shutters_title")}</span>
          <span class="option-desc">${t("setupWizard.shutters_soon")}</span>
        </span>
        <span class="switch">
          <input type="checkbox" disabled />
          <span></span>
        </span>
      </label>
      <p class="hint">${t("setupWizard.options_hint")}</p>
      <div class="actions">
        <button class="secondary" @click=${() => (this._step = "import")}>${t("setupWizard.back")}</button>
        <button class="primary" ?disabled=${!count || this._busy} @click=${this._import}>
          ${this._busy
            ? t("setupWizard.importing")
            : t(count === 1 ? "setupWizard.import_button_one" : "setupWizard.import_button_other", { count })}
        </button>
      </div>
    `;
  }

  private _done() {
    return html`
      <div class="done">
        <span class="done-icon">${this._icon(mdiCheckCircle)}</span>
        <p class="lead">
          ${t(this._created === 1 ? "setupWizard.done_one" : "setupWizard.done_other", { count: this._created })}
        </p>
      </div>
      <div class="actions">
        <button class="primary" @click=${this._finish}>${t("setupWizard.continue")}</button>
      </div>
    `;
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
        <div class="step">
          <span class="step-num">1</span>
          <span>${t("setupWizard.step_rooms")}</span>
        </div>
        ${this._step === "choose"
          ? this._choose()
          : this._step === "import"
            ? this._importList()
            : this._step === "options"
              ? this._options()
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
      justify-content: space-between;
      gap: 16px;
      padding: 14px 16px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
      border-radius: 12px;
      margin-bottom: 10px;
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
