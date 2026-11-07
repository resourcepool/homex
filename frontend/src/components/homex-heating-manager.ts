import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  HeatingDevicePreset,
  HeatingGroup,
  HeatingPreset,
  HeatingSystem,
  HeatingZone,
  HomeAssistant,
  Room,
} from "../types";
import {
  deleteHeatingPreset,
  errorMessage,
  fetchHeating,
  fetchRooms,
  saveHeatingPreset,
  setHeatingEnabled,
  setHeatingZoneMode,
} from "../api";
import { goBack, joinPath, navigate, segments } from "../lib/router";
import { sharedStyles } from "../lib/styles";
import "./homex-select";
import { textField } from "../lib/fields";
import { slugify } from "../lib/slug";
import { DEFAULT_HEATING_GROUP } from "./homex-heating-group-editor";
import "./homex-heating-group-editor";
import "./homex-heating-device-preset-editor";
import { DEFAULT_HEATING_ZONE } from "./homex-heating-zone-editor";
import "./homex-heating-zone-editor";
import "./homex-heating-system-editor";

type Section = "modes" | "setpoints" | "zones" | "devices" | "systems";
const SECTIONS: Section[] = ["modes", "setpoints", "zones", "devices", "systems"];
const SECTION_LABELS: Record<Section, string> = {
  modes: "Heating Modes",
  setpoints: "Setpoints",
  zones: "Zones",
  devices: "Device Presets",
  systems: "Heating System",
};
const ADD_LABELS: Record<Section, string> = {
  modes: "＋ Mode",
  setpoints: "＋ Setpoint",
  zones: "＋ Zone",
  devices: "＋ Device preset",
  systems: "＋ Système",
};
const PARAM_NAMES: Record<string, string> = {
  tolerance: "Tolérance",
  mode: "Mode",
  lock: "Verrouillage",
  sensor: "Capteur",
};

const formatTemp = (t: number | undefined) =>
  t == null ? "—" : `${t.toLocaleString("fr-FR")} °C`;

/** Heating Manager: Heating Modes (presets), Setpoints (heating groups:
 * setpoints per rooms), Zones (rooms running their own mode) and Device
 * Presets. */
@customElement("homex-heating-manager")
export class HomexHeatingManager extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  /** URL of the manager (the Presets tab). */
  @property({ attribute: false }) base = "";
  /** Sub-page below `base`: "<section>[/new | /edit/<id>]". */
  @property({ attribute: false }) subpath = "";

  @state() private _presets: HeatingPreset[] = [];
  @state() private _groups: HeatingGroup[] = [];
  @state() private _devicePresets: HeatingDevicePreset[] = [];
  @state() private _zones: HeatingZone[] = [];
  @state() private _systems: HeatingSystem[] = [];
  @state() private _enabledLocal = true;
  /** Global heating: switch.homex_heating (live), else the last loaded value. */
  private get _enabled(): boolean {
    const st = this.hass?.states["switch.homex_heating"];
    return st ? st.state === "on" : this._enabledLocal;
  }
  @state() private _switching = false;
  @state() private _rooms: Room[] = [];
  @state() private _loaded = false;
  // Preset form (the preset editor is small enough to live here).
  @state() private _presetName = "";
  @state() private _presetId = "";
  @state() private _busy = false;
  private _presetIdEdited = false;
  private _formFor: string | null = null;

  static styles = [
    sharedStyles,
    css`
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .head h2 {
        flex: 1;
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
      .head button {
        min-height: 0;
        padding: 8px 12px;
        border-radius: 8px;
      }
      .master {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .master.on {
        color: var(--state-climate-heat-color, #ff8100);
      }
      .toggle {
        position: relative;
        width: 40px;
        height: 22px;
        border-radius: 11px;
        background: var(--disabled-color, #888);
        transition: background 0.2s;
      }
      .toggle.on {
        background: var(--state-climate-heat-color, #ff8100);
      }
      .toggle input {
        position: absolute;
        inset: 0;
        opacity: 0;
        margin: 0;
        cursor: pointer;
      }
      .knob {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #fff;
        transition: transform 0.2s;
        pointer-events: none;
      }
      .toggle.on .knob {
        transform: translateX(18px);
      }
      .tab-actions {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 12px;
      }
      .tab-picker {
        display: none;
        margin-bottom: 12px;
      }
      .tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .tab {
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .tab.active {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
        margin-bottom: -1px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 12px;
      }
      .card {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        cursor: pointer;
        background: var(--card-background-color, #1c1c1c);
      }
      .card:hover {
        border-color: var(--primary-color);
      }
      .card-head {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .icon {
        flex: 0 0 auto;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
      }
      .name {
        font-size: 15px;
        font-weight: 500;
      }
      .meta {
        font-size: 12px;
        color: var(--secondary-text-color);
        overflow-wrap: anywhere;
      }
      .temps {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .temp {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 10px;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
      }
      .zone-mode {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--secondary-text-color);
        cursor: default;
      }
      .zone-mode homex-select {
        flex: 1;
      }
      .msg {
        padding: 24px 4px;
        color: var(--secondary-text-color);
      }
      .editor {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        padding: 16px;
      }
      .hint {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      /* Phones (last, to override the rules above). */
      @media (max-width: 600px) {
        .tab-actions button {
          flex: 1;
        }
        .tabs {
          display: none;
        }
        .tab-picker {
          display: block;
        }
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._load();
  }

  private async _load() {
    try {
      const [heating, rooms] = await Promise.all([
        fetchHeating(this.hass),
        fetchRooms(this.hass),
      ]);
      this._presets = heating.presets;
      this._groups = heating.groups;
      this._devicePresets = heating.device_presets ?? [];
      this._zones = heating.zones ?? [];
      this._systems = heating.systems ?? [];
      this._enabledLocal = heating.enabled ?? true;
      this._rooms = rooms;
    } catch {
      this._presets = [];
      this._groups = [];
      this._devicePresets = [];
      this._zones = [];
    }
    this._loaded = true;
  }

  willUpdate() {
    const { section, editing, id } = this._route;
    if (editing && section === "modes") {
      const preset = id ? this._presets.find((p) => p.id === id) : null;
      if (!id || preset) this._syncPresetForm(preset ?? null);
    } else {
      this._formFor = null;
    }
  }

  private get _route(): { section: Section; editing: boolean; id?: string } {
    const [section, mode, id] = segments(this.subpath);
    return {
      section: SECTIONS.includes(section as Section) ? (section as Section) : "modes",
      editing: mode === "new" || (mode === "edit" && !!id),
      id: mode === "edit" ? id : undefined,
    };
  }

  private _url(section: Section, ...rest: string[]): string {
    return section === "modes" && !rest.length
      ? this.base
      : joinPath(this.base, section, ...rest);
  }
  private _openEditor(section: Section, id?: string) {
    navigate(this._url(section, ...(id ? ["edit", id] : ["new"])));
  }
  private _closeEditor(section: Section) {
    this._load();
    goBack(this._url(section));
  }

  private async _setEnabled(enabled: boolean) {
    this._switching = true;
    try {
      await setHeatingEnabled(this.hass, enabled);
      this._enabledLocal = enabled;
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
    } finally {
      this._switching = false;
    }
  }

  private _back() {
    this.dispatchEvent(new CustomEvent("close"));
  }

  // --- Presets -------------------------------------------------------------

  /** (Re)fill the preset form when the edited preset changes. */
  private _syncPresetForm(preset: HeatingPreset | null) {
    const key = preset?.id ?? "__new__";
    if (this._formFor === key) return;
    this._formFor = key;
    this._presetName = preset?.name ?? "";
    this._presetId = preset?.id ?? "";
    this._presetIdEdited = !!preset;
    this._busy = false;
  }

  private async _savePreset(preset: HeatingPreset | null) {
    this._busy = true;
    try {
      await saveHeatingPreset(
        this.hass,
        { id: this._presetId, name: this._presetName.trim() },
        !preset
      );
      this._closeEditor("modes");
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
      this._busy = false;
    }
  }

  private async _deletePreset(preset: HeatingPreset) {
    if (!confirm(`Supprimer le mode « ${preset.name} » et ses consignes ?`)) return;
    this._busy = true;
    try {
      await deleteHeatingPreset(this.hass, preset.id);
      this._closeEditor("modes");
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
      this._busy = false;
    }
  }

  private _renderPresetEditor(preset: HeatingPreset | null) {
    const cancel = () => this._closeEditor("modes");
    return html`
      <div class="head">
        <button @click=${cancel}>← Heating Modes</button>
        <h2>${preset ? "Modifier le mode" : "Nouveau mode de chauffage"}</h2>
      </div>
      <div class="editor">
        ${textField("Nom", this._presetName, (v) => {
          this._presetName = v;
          if (!this._presetIdEdited) this._presetId = slugify(v);
        }, "Vacances")}
        ${preset
          ? html`<div class="section">Id : ${preset.id}</div>`
          : textField("Id", this._presetId, (v) => {
              this._presetIdEdited = true;
              this._presetId = slugify(v);
            })}
        ${preset?.builtin
          ? html`<p class="hint">Mode par défaut : il peut être renommé, pas supprimé.</p>`
          : ""}
        <div class="actions">
          <button
            class="primary"
            ?disabled=${this._busy || !this._presetName.trim() || !this._presetId}
            @click=${() => this._savePreset(preset)}
          >
            Enregistrer
          </button>
          <button ?disabled=${this._busy} @click=${cancel}>Annuler</button>
          ${preset && !preset.builtin
            ? html`<button
                class="danger"
                ?disabled=${this._busy}
                @click=${() => this._deletePreset(preset)}
              >
                Supprimer
              </button>`
            : ""}
        </div>
      </div>
    `;
  }

  private _renderPresets() {
    return html`<div class="grid">
      ${this._presets.map(
        (p) => html`<div class="card" @click=${() => this._openEditor("modes", p.id)}>
          <div class="card-head">
            <div class="icon">🌡</div>
            <div>
              <div class="name">${p.name}</div>
              <div class="meta">
                ${p.id}${p.builtin ? " · par défaut" : ""}${p.unheated ? " · coupé ou consigne" : ""}
              </div>
            </div>
          </div>
        </div>`
      )}
    </div>`;
  }

  // --- Heating groups ------------------------------------------------------

  /** Rooms of a setpoint / zone; the default one lists every room left. */
  private _roomNames(
    g: { id: string; rooms: string[] },
    all: { rooms: string[] }[] = this._groups,
    defaultId = DEFAULT_HEATING_GROUP
  ): string {
    if (g.id === defaultId) {
      const taken = new Set(all.flatMap((x) => x.rooms));
      const rest = this._rooms.filter((r) => !taken.has(r.room_id));
      return rest.length
        ? `Autres pièces : ${rest.map((r) => r.name).join(", ")}`
        : "Toutes les autres pièces (aucune pour l'instant)";
    }
    if (!g.rooms.length) return "Aucune pièce";
    return g.rooms
      .map((id) => this._rooms.find((r) => r.room_id === id)?.name ?? id)
      .join(", ");
  }

  private _renderGroups() {
    return html`<div class="grid">
      ${this._groups.map(
        (g) => html`<div class="card" @click=${() => this._openEditor("setpoints", g.id)}>
          <div class="card-head">
            <div class="icon">🔥</div>
            <div>
              <div class="name">${g.name}</div>
              <div class="meta">${this._roomNames(g)}</div>
            </div>
          </div>
          <div class="temps">
            ${this._presets.map(
              (p) => html`<span class="temp"
                >${p.name} ·
                ${p.unheated && g.setpoints[p.id] == null ? "coupé" : formatTemp(g.setpoints[p.id])}</span
              >`
            )}
          </div>
        </div>`
      )}
    </div>`;
  }

  private async _setZoneMode(zone: HeatingZone, modeId: string) {
    try {
      await setHeatingZoneMode(this.hass, zone.id, modeId);
      this._zones = this._zones.map((z) => (z.id === zone.id ? { ...z, mode: modeId } : z));
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
    }
  }

  private _renderZones() {
    return html`<div class="grid">
      ${this._zones.map((z) => {
        const triggers = Object.values(z.triggers ?? {}).reduce((n, t) => n + t.length, 0);
        return html`<div class="card" @click=${() => this._openEditor("zones", z.id)}>
          <div class="card-head">
            <div class="icon">🏠</div>
            <div>
              <div class="name">${z.name}</div>
              <div class="meta">
                ${this._roomNames(z, this._zones, DEFAULT_HEATING_ZONE)}
              </div>
            </div>
          </div>
          <label class="zone-mode" @click=${(e: Event) => e.stopPropagation()}>
            Mode actif
            <homex-select
              .value=${z.mode}
              .options=${this._presets.map((m) => ({ value: m.id, label: m.name }))}
              @value-changed=${(e: CustomEvent) => this._setZoneMode(z, e.detail.value)}
            ></homex-select>
          </label>
          <div class="meta">
            select.homex_heating_${z.id} · ${triggers} déclencheur(s)
          </div>
        </div>`;
      })}
    </div>`;
  }

  private _renderSystems() {
    if (!this._systems.length) {
      return html`<div class="msg">
        Aucun système. Clique sur « ＋ Système » pour déclarer une chaudière (Boiler)
        ou un ballon tampon (Buffer Tank).
      </div>`;
    }
    const zoneName = (id: string) =>
      id === "global" ? "Global" : this._zones.find((z) => z.id === id)?.name ?? id;
    return html`<div class="grid">
      ${this._systems.map((sys) => {
        if (sys.type === "buffer_tank") return this._renderTankCard(sys);
        const contact = sys.contact ? this.hass.states[sys.contact] : undefined;
        return html`<div class="card" @click=${() => this._openEditor("systems", sys.id)}>
          <div class="card-head">
            <div class="icon">${sys.type === "boiler" ? "🔥" : "♨️"}</div>
            <div>
              <div class="name">${sys.name}</div>
              <div class="meta">
                ${sys.type === "boiler" ? "Boiler" : "Heat Pump"} ·
                ${(sys.zones ?? ["global"]).map(zoneName).join(", ")}
              </div>
            </div>
          </div>
          ${sys.type === "boiler"
            ? html`<div class="temps">
                <span class="temp">
                  Contact :
                  ${contact?.attributes?.friendly_name ?? (sys.contact || "—")}
                  ${contact ? `(${contact.state})` : ""}
                </span>
                ${sys.aggressive ? html`<span class="temp">Agressif</span>` : ""}
              </div>`
            : ""}
        </div>`;
      })}
    </div>`;
  }

  private _renderTankCard(sys: HeatingSystem) {
    const zoneName = (id: string) =>
      id === "global" ? "Global" : this._zones.find((z) => z.id === id)?.name ?? id;
    const temp = (id?: string) => {
      const st = id ? this.hass.states[id] : undefined;
      const v = parseFloat(st?.state ?? "");
      return Number.isNaN(v) ? "—" : `${v} °C`;
    };
    const circ = sys.circulator ? this.hass.states[sys.circulator] : undefined;
    const rules = sys.rules ?? [];
    return html`<div class="card" @click=${() => this._openEditor("systems", sys.id)}>
      <div class="card-head">
        <div class="icon">🛢️</div>
        <div>
          <div class="name">${sys.name}</div>
          <div class="meta">
            Buffer Tank · ${(sys.zones ?? ["global"]).map(zoneName).join(", ")} ·
            ${rules.length} règle(s) · min ${sys.min_runtime ?? 0} min
          </div>
        </div>
      </div>
      <div class="temps">
        <span class="temp" title="Consigne">🎯 ${temp(sys.setpoint_sensor)}</span>
        ${sys.tank_sensor ? html`<span class="temp" title="Ballon">🛢 ${temp(sys.tank_sensor)}</span>` : ""}
        ${sys.flow_sensor ? html`<span class="temp" title="Départ">↗ ${temp(sys.flow_sensor)}</span>` : ""}
        <span class="temp" title="Retour">↘ ${temp(sys.return_sensor)}</span>
        ${sys.aggressive ? html`<span class="temp">Agressif</span>` : ""}
        ${this.hass.states[`switch.homex_system_${sys.id}_force`]?.state === "on"
          ? html`<span class="temp" title="Forçage manuel activé">Forcé</span>`
          : ""}
        ${(() => {
          const rt = parseFloat(this.hass.states[`sensor.homex_system_${sys.id}_runtime_today`]?.state ?? "");
          if (Number.isNaN(rt)) return "";
          const m = Math.round(rt);
          const txt = m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}` : `${m} min`;
          return html`<span class="temp" title="Durée d'activité du circulateur aujourd'hui">⏱ ${txt}</span>`;
        })()}
        <span class="temp" title=${circ?.attributes?.friendly_name ?? sys.circulator ?? ""}>
          Circulateur : ${circ ? (circ.state === "on" ? "en marche" : circ.state === "off" ? "arrêté" : circ.state) : "—"}
        </span>
      </div>
    </div>`;
  }

  private _renderDevicePresets() {
    if (!this._devicePresets.length) {
      return html`<div class="msg">
        Aucun device preset. Clique sur « ＋ Device preset » pour fixer les réglages
        d'un modèle de vanne thermostatique.
      </div>`;
    }
    return html`<div class="grid">
      ${this._devicePresets.map((p) => {
        const params = Object.entries(p.params ?? {});
        return html`<div class="card" @click=${() => this._openEditor("devices", p.id)}>
          <div class="card-head">
            <div class="icon">🎛</div>
            <div>
              <div class="name">${p.name}</div>
              <div class="meta">${p.model.replace("|", " ")}</div>
            </div>
          </div>
          <div class="temps">
            ${params.length
              ? params.map(
                  ([k, v]) =>
                    html`<span class="temp"
                      >${PARAM_NAMES[k] ?? k} ·
                      ${String(v!.value)}${v!.value_agressive != null
                        ? ` / ${v!.value_agressive}`
                        : ""}</span
                    >`
                )
              : html`<span class="meta">Aucun réglage</span>`}
          </div>
        </div>`;
      })}
    </div>`;
  }

  private _notFound(section: Section, id: string) {
    return html`
      <div class="head">
        <button @click=${() => this._closeEditor(section)}>
          ← ${SECTION_LABELS[section]}
        </button>
        <h2></h2>
      </div>
      <div class="msg">${this._loaded ? `« ${id} » introuvable.` : "Chargement…"}</div>
    `;
  }

  render() {
    const { section, editing, id } = this._route;
    if (editing && section === "modes") {
      const preset = id ? this._presets.find((p) => p.id === id) : null;
      if (id && !preset) return this._notFound(section, id);
      return this._renderPresetEditor(preset ?? null);
    }
    if (editing && section === "systems") {
      const system = id ? this._systems.find((x) => x.id === id) : null;
      if (id && !system) return this._notFound(section, id);
      return html`
        <div class="head">
          <button @click=${() => this._closeEditor("systems")}>← Heating System</button>
          <h2>${system ? "Modifier le système" : "Nouveau système de chauffage"}</h2>
        </div>
        <div class="editor">
          <homex-heating-system-editor
            .hass=${this.hass}
            .system=${system ?? null}
            .zones=${this._zones}
            @heating-system-closed=${() => this._closeEditor("systems")}
          ></homex-heating-system-editor>
        </div>
      `;
    }
    if (editing && section === "zones") {
      const zone = id ? this._zones.find((z) => z.id === id) : null;
      if (id && !zone) return this._notFound(section, id);
      return html`
        <div class="head">
          <button @click=${() => this._closeEditor("zones")}>← Zones</button>
          <h2>${zone ? "Modifier la zone" : "Nouvelle zone"}</h2>
        </div>
        <div class="editor">
          <homex-heating-zone-editor
            .hass=${this.hass}
            .zone=${zone ?? null}
            .zones=${this._zones}
            .modes=${this._presets}
            .rooms=${this._rooms}
            @heating-zone-closed=${() => this._closeEditor("zones")}
          ></homex-heating-zone-editor>
        </div>
      `;
    }
    if (editing && section === "devices") {
      const preset = id ? this._devicePresets.find((p) => p.id === id) : null;
      if (id && !preset) return this._notFound(section, id);
      return html`
        <div class="head">
          <button @click=${() => this._closeEditor("devices")}>← Device Presets</button>
          <h2>${preset ? "Modifier le device preset" : "Nouveau device preset"}</h2>
        </div>
        <div class="editor">
          <homex-heating-device-preset-editor
            .hass=${this.hass}
            .preset=${preset ?? null}
            @heating-device-preset-closed=${() => this._closeEditor("devices")}
          ></homex-heating-device-preset-editor>
        </div>
      `;
    }
    if (editing) {
      const group = id ? this._groups.find((g) => g.id === id) : null;
      if (id && !group) return this._notFound(section, id);
      return html`
        <div class="head">
          <button @click=${() => this._closeEditor("setpoints")}>← Setpoints</button>
          <h2>${group ? "Modifier le setpoint" : "Nouveau setpoint"}</h2>
        </div>
        <div class="editor">
          <homex-heating-group-editor
            .hass=${this.hass}
            .group=${group ?? null}
            .groups=${this._groups}
            .presets=${this._presets}
            .rooms=${this._rooms}
            @heating-group-closed=${() => this._closeEditor("setpoints")}
          ></homex-heating-group-editor>
        </div>
      `;
    }
    return html`
      <div class="head">
        <button @click=${this._back}>← Climate</button>
        <h2>Heating</h2>
        <label
          class="master ${this._enabled ? "on" : ""}"
          title=${this._enabled
            ? "Désactiver : toutes les vannes passent sur off"
            : "Activer : les presets sont ré-appliqués"}
        >
          ${this._enabled ? "Chauffage activé" : "Chauffage désactivé"}
          <span class="toggle ${this._enabled ? "on" : ""}">
            <input
              type="checkbox"
              .checked=${this._enabled}
              ?disabled=${this._switching}
              @change=${(e: Event) => this._setEnabled((e.target as HTMLInputElement).checked)}
            />
            <span class="knob"></span>
          </span>
        </label>
      </div>
      <div class="tabs">
        ${SECTIONS.map((key) => [key, SECTION_LABELS[key]] as [Section, string]).map(
          ([key, label]) => html`<span
            class="tab ${section === key ? "active" : ""}"
            @click=${() => {
              if (key !== section) navigate(this._url(key), true);
            }}
            >${label}</span
          >`
        )}
      </div>
      <!-- Phones: too many tabs for one row, a section picker instead. -->
      <homex-select
        class="tab-picker"
        .value=${section}
        .options=${SECTIONS.map((key) => ({ value: key, label: SECTION_LABELS[key] }))}
        @value-changed=${(e: CustomEvent) => {
          if (e.detail.value !== section) navigate(this._url(e.detail.value), true);
        }}
      ></homex-select>
      <div class="tab-actions">
        <button class="primary" @click=${() => this._openEditor(section)}>
          ${ADD_LABELS[section]}
        </button>
      </div>
      ${!this._loaded
        ? html`<div class="msg">Chargement…</div>`
        : section === "modes"
          ? this._renderPresets()
          : section === "setpoints"
            ? this._renderGroups()
            : section === "zones"
              ? this._renderZones()
              : section === "systems"
                ? this._renderSystems()
                : this._renderDevicePresets()}
    `;
  }
}
