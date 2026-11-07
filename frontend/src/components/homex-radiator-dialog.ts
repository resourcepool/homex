import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  HeatingDevicePreset,
  HeatingModel,
  HomeAssistant,
  Radiator,
  Room,
} from "../types";
import { fireChanged } from "../types";
import {
  errorMessage,
  fetchHeating,
  fetchHeatingModels,
  fetchRooms,
  updateRoom,
} from "../api";
import { sharedStyles } from "../lib/styles";
import { areaNames, deviceArea, entityArea, splitByArea } from "../lib/area";
import "./homex-select";
import "./homex-dialog";

/** Modal to add a radiator to a room (index = -1) or edit one: the device,
 * its heating device preset and, for external-sensor presets, the
 * temperature sensor written to the valve. */
@customElement("homex-radiator-dialog")
export class HomexRadiatorDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) room!: Room;
  /** Index of the edited radiator in the room, -1 to add one. */
  @property({ type: Number }) index = -1;

  @state() private _rad: Radiator = { device_id: "", preset_id: "", external_sensor: "" };
  @state() private _models: HeatingModel[] = [];
  @state() private _presets: HeatingDevicePreset[] = [];
  @state() private _otherRooms: Room[] = [];
  @state() private _busy = false;

  static styles = [
    sharedStyles,
    css`
      .hint {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin: 6px 0;
      }
      .warn {
        color: var(--warning-color, #ff9800);
      }
    `,
  ];

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("open") && this.open) {
      const existing = this.room.heating?.radiators?.[this.index];
      this._rad = existing
        ? { external_sensor: "", ...existing }
        : { device_id: "", preset_id: "", external_sensor: "" };
      this._busy = false;
      this._load();
    }
  }

  private async _load() {
    try {
      const [heating, models, rooms] = await Promise.all([
        fetchHeating(this.hass),
        fetchHeatingModels(this.hass),
        fetchRooms(this.hass),
      ]);
      this._presets = heating.device_presets ?? [];
      this._models = models;
      this._otherRooms = rooms.filter((r) => r.room_id !== this.room.room_id);
    } catch {
      this._presets = [];
      this._models = [];
    }
  }

  private get _thermostats() {
    return this._models
      .flatMap((m) => m.devices.map((d) => ({ ...d, model: m.model, label: m.label })))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  private get _modelPresets(): HeatingDevicePreset[] {
    const model = this._thermostats.find((t) => t.device_id === this._rad.device_id)?.model;
    return this._presets.filter((p) => p.model === model);
  }
  private get _preset(): HeatingDevicePreset | undefined {
    return this._presets.find((p) => p.id === this._rad.preset_id);
  }

  private _onDevice(deviceId: string) {
    const model = this._thermostats.find((t) => t.device_id === deviceId)?.model;
    const ofModel = this._presets.filter((p) => p.model === model);
    this._rad = {
      ...this._rad,
      device_id: deviceId,
      preset_id: ofModel.length === 1 ? ofModel[0].id : "",
    };
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }

  private async _save() {
    const radiators = [...(this.room.heating?.radiators ?? [])];
    const rad = {
      ...this._rad,
      external_sensor: this._preset?.external_input ? this._rad.external_sensor : "",
    };
    if (this.index >= 0) radiators[this.index] = rad;
    else radiators.push(rad);
    this._busy = true;
    try {
      await updateRoom(this.hass, { entry_id: this.room.entry_id, heating: { ...this.room.heating, radiators } });
      fireChanged(this);
      this._close();
    } catch (err) {
      alert("Erreur Homex : " + errorMessage(err));
      this._busy = false;
    }
  }

  /** Source choices: the room's reference temperature, then the room's Homex
   * temperature sensors, then every other temperature sensor (A→Z). */
  private _renderExternalSensor() {
    const name = (id: string) => this.hass.states[id]?.attributes?.friendly_name || id;
    const cur = (id: string) => {
      const st = this.hass.states[id];
      const unit = st?.attributes?.unit_of_measurement ?? "";
      return st && !["unknown", "unavailable"].includes(st.state) ? `${st.state} ${unit}` : "—";
    };
    const ref = `sensor.homex_${this.room.room_id}_temperature`;
    const hasRef = !!this.room.metrics?.temperature?.sensors?.length;
    const roomSensors = (this.room.metrics?.temperature?.sensors ?? []).map((s) => s.entity_id);
    const others = Object.keys(this.hass.states)
      .filter(
        (id) =>
          id.startsWith("sensor.") &&
          id !== ref &&
          !roomSensors.includes(id) &&
          this.hass.states[id]?.attributes?.device_class === "temperature"
      )
      .sort((a, b) => name(a).localeCompare(name(b)));
    // Then the temperature sensors of the room's Home Assistant area.
    const { inArea, others: rest } = splitByArea(others, (id) => entityArea(this.hass, id), [
      this.room.area_id,
    ]);
    const sel = this._rad.external_sensor ?? "";
    const opt = (id: string, label = name(id)) => ({
      value: id,
      label,
      secondary: id,
      tertiary: cur(id),
    });
    return html`
      <div class="section">Capteur de température externe</div>
      <p class="hint">Sa température est recopiée dans la vanne à chaque mise à jour.</p>
      <homex-select
        placeholder="Choisir un capteur…"
        .value=${sel}
        .groups=${[
          ...(hasRef
            ? [{ label: "Référence de la pièce", options: [opt(ref, `Température de référence (${this.room.name})`)] }]
            : []),
          ...(roomSensors.length
            ? [{ label: "Capteurs de la pièce", options: roomSensors.map((id) => opt(id)) }]
            : []),
          ...(inArea.length
            ? [{ label: `Pièce : ${areaNames(this.hass, [this.room.area_id])}`, options: inArea.map((id) => opt(id)) }]
            : []),
          { label: "Autres", options: rest.map((id) => opt(id)) },
        ]}
        @value-changed=${(e: CustomEvent) =>
          (this._rad = { ...this._rad, external_sensor: e.detail.value })}
      ></homex-select>
      ${sel ? "" : html`<p class="hint warn">Ce preset utilise un capteur externe : choisis-en un.</p>`}
    `;
  }

  render() {
    if (!this.open) return html``;
    const editing = this.index >= 0;
    const used = new Set(
      (this.room.heating?.radiators ?? [])
        .filter((_, i) => i !== this.index)
        .map((r) => r.device_id)
    );
    const other = this._otherRooms.find((r) =>
      (r.heating?.radiators ?? []).some((x) => x.device_id === this._rad.device_id)
    );
    const presets = this._modelPresets;
    // Thermostats of the room's Home Assistant area first, then the others.
    const areaId = this.room.area_id || "";
    const areaName = areaId ? this.hass.areas?.[areaId]?.name : undefined;
    const { inArea, others } = splitByArea(
      this._thermostats,
      (d) => deviceArea(this.hass, d.device_id),
      [areaId]
    );
    const thermostatOpt = (d: { device_id: string; name: string; label: string }) => ({
      value: d.device_id,
      label: d.name,
      secondary: d.label,
      tertiary: used.has(d.device_id) ? "déjà dans la pièce" : undefined,
      disabled: used.has(d.device_id),
    });
    return html`
      <homex-dialog
        compact
        .open=${this.open}
        .heading=${editing ? "Modifier le radiateur" : "Ajouter un radiateur"}
        @dialog-closed=${this._close}
      >
        <div class="section">Radiateur</div>
        <homex-select
          placeholder="Choisir un radiateur…"
          .value=${this._rad.device_id}
          ?disabled=${editing}
          .options=${areaId ? [] : this._thermostats.map(thermostatOpt)}
          .groups=${areaId
            ? [
                ...(inArea.length
                  ? [{ label: `Pièce : ${areaName ?? areaId}`, options: inArea.map(thermostatOpt) }]
                  : []),
                { label: "Autres", options: others.map(thermostatOpt) },
              ]
            : []}
          @value-changed=${(e: CustomEvent) => this._onDevice(e.detail.value)}
        ></homex-select>
        ${other ? html`<p class="hint warn">Déjà dans la pièce « ${other.name} ».</p>` : ""}

        <div class="section">Device preset</div>
        <homex-select
          placeholder="Aucun preset"
          .value=${this._rad.preset_id}
          ?disabled=${!this._rad.device_id}
          .options=${presets.map((p) => ({
            value: p.id,
            label: p.name,
            tertiary: p.external_input ? "capteur externe" : undefined,
          }))}
          @value-changed=${(e: CustomEvent) =>
            (this._rad = { ...this._rad, preset_id: e.detail.value })}
        ></homex-select>
        <p class="hint">
          ${this._rad.device_id && !presets.length
            ? "Aucun device preset pour ce modèle (Climate Manager → Heating → Device Presets)."
            : "Le preset est appliqué en continu (vérifié et ré-appliqué toutes les 10 minutes)."}
        </p>

        ${this._preset?.external_input ? this._renderExternalSensor() : ""}

        <span slot="actions">
          <button @click=${this._close}>Annuler</button>
          <button
            class="primary"
            ?disabled=${this._busy || !this._rad.device_id}
            @click=${this._save}
          >
            ${editing ? "Enregistrer" : "Ajouter"}
          </button>
        </span>
      </homex-dialog>
    `;
  }
}
