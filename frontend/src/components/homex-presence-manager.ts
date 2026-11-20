import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  HomeAssistant,
  PresenceAction,
  PresenceActionKind,
  PresenceEvent,
  PresenceRoutineKey,
  PresenceState,
  Room,
} from "../types";
import { errorMessage, fetchPresence, fetchRooms, savePresence, setPresenceEnabled } from "../api";
import { sharedStyles } from "../lib/styles";
import { t } from "../lib/i18n";

const ROUTINES: { key: PresenceRoutineKey; icon: string; start: string; end: string }[] = [
  { key: "morning", icon: "🌅", start: "07:00", end: "08:30" },
  { key: "lunch", icon: "🍽", start: "12:00", end: "13:30" },
  { key: "afternoon", icon: "☀️", start: "15:00", end: "17:00" },
  { key: "evening", icon: "🌆", start: "19:00", end: "22:30" },
  { key: "night", icon: "🌙", start: "23:00", end: "00:30" },
];
const KINDS: { kind: PresenceActionKind; icon: string }[] = [
  { kind: "light", icon: "💡" },
  { kind: "blink", icon: "✨" },
  { kind: "off", icon: "🌑" },
  { kind: "shutter", icon: "🪟" },
];
const ENTITY_ID = "switch.homex_presence_simulator";

const newId = () => `a${Math.random().toString(16).slice(2, 10)}`;
const hasLights = (r: Room) => (r.modules ?? ["lights"]).includes("lights");
const shutterGroups = (r: Room) => (r.shutter_groups ?? []).filter((g) => g.devices.length);

/** Presence Simulator page: the on/off toggle, the five routines (lights and
 * shutters at given times) and today's plan. */
@customElement("homex-presence-manager")
export class HomexPresenceManager extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;

  @state() private _state: PresenceState | null = null;
  @state() private _rooms: Room[] = [];
  @state() private _dirty = false;
  @state() private _busy = false;
  @state() private _error: string | null = null;
  @state() private _saved = false;

  static styles = [
    sharedStyles,
    css`
      .head {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
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
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: var(--secondary-text-color);
      }
      .master.on {
        color: var(--primary-color);
        font-weight: 500;
      }
      .intro,
      .hint,
      .msg {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .card {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        padding: 12px 16px;
        margin: 12px 0;
        background: var(--card-background-color, #1c1c1c);
      }
      .card.off .rows {
        opacity: 0.45;
      }
      .card-head {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .card-head h3 {
        flex: 1;
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
      .rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 10px 0;
      }
      .row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px 8px;
        padding: 8px 10px;
        border-radius: 10px;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
        font-size: 14px;
      }
      .row .kind {
        min-width: 130px;
        font-weight: 500;
      }
      .row .grow {
        flex: 1;
      }
      select,
      input[type="time"],
      input[type="number"] {
        padding: 6px 8px;
        font-size: 14px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      input[type="number"] {
        width: 64px;
      }
      select.missing {
        border-color: var(--error-color, #db4437);
      }
      .row button.rm {
        min-height: 0;
        padding: 4px 10px;
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 18px;
      }
      .adds {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .adds button {
        min-height: 0;
        padding: 6px 12px;
        font-size: 13px;
      }
      .jitter {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        font-size: 14px;
      }
      .savebar {
        position: sticky;
        bottom: 0;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        background: var(--primary-background-color);
      }
      .savebar .status {
        flex: 1;
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .savebar .status.err {
        color: var(--error-color, #db4437);
      }
      .timeline {
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-top: 8px;
        font-size: 14px;
      }
      .ev {
        display: flex;
        gap: 12px;
        padding: 4px 0;
      }
      .ev.done {
        opacity: 0.45;
      }
      .ev .time {
        width: 52px;
        font-variant-numeric: tabular-nums;
        font-weight: 500;
      }
      .ev .tag {
        font-size: 11px;
        color: var(--secondary-text-color);
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._load();
  }

  private async _load() {
    try {
      const [state, rooms] = await Promise.all([fetchPresence(this.hass), fetchRooms(this.hass)]);
      this._state = state;
      this._rooms = rooms;
      this._dirty = false;
      this._error = null;
    } catch (err) {
      this._error = errorMessage(err);
    }
  }

  private get _enabled(): boolean {
    const st = this.hass.states[ENTITY_ID];
    return st ? st.state === "on" : !!this._state?.enabled;
  }

  private async _setEnabled(enabled: boolean) {
    this._busy = true;
    try {
      const next = await setPresenceEnabled(this.hass, enabled);
      // Keep unsaved edits; take the new status and plan.
      this._state = this._dirty
        ? { ...this._state!, enabled: next.enabled, schedule: next.schedule }
        : next;
    } catch (err) {
      alert(t("common.error", { message: errorMessage(err) }));
    }
    this._busy = false;
  }

  private _edit(fn: (s: PresenceState) => void) {
    const next = structuredClone(this._state!);
    fn(next);
    this._state = next;
    this._dirty = true;
    this._saved = false;
  }

  private _patch(routine: PresenceRoutineKey, id: string, patch: Partial<PresenceAction>) {
    this._edit((s) => {
      const a = s.routines[routine].actions.find((x) => x.id === id);
      if (a) Object.assign(a, patch);
    });
  }

  private _add(routine: PresenceRoutineKey, kind: PresenceActionKind) {
    const def = ROUTINES.find((r) => r.key === routine)!;
    const action: PresenceAction = { id: newId(), kind, room_id: "", start: def.start };
    if (kind === "light") action.end = def.end;
    if (kind === "blink") Object.assign(action, { count: 3, duration: 10 });
    if (kind === "off") action.start = def.end;
    if (kind === "shutter") Object.assign(action, { group_id: "", action: routine === "evening" || routine === "night" ? "close" : "open" });
    this._edit((s) => s.routines[routine].actions.push(action));
  }

  private _incomplete(): boolean {
    return Object.values(this._state!.routines).some((r) =>
      r.actions.some((a) => !a.room_id || (a.kind === "shutter" && !a.group_id))
    );
  }

  private async _save() {
    if (this._incomplete()) {
      this._error = t("presence.incomplete");
      return;
    }
    this._busy = true;
    try {
      this._state = await savePresence(this.hass, {
        jitter: this._state!.jitter,
        routines: this._state!.routines,
      });
      this._dirty = false;
      this._saved = true;
      this._error = null;
    } catch (err) {
      this._error = errorMessage(err);
    }
    this._busy = false;
  }

  private _roomSelect(rooms: Room[], value: string, onPick: (room_id: string) => void) {
    return html`<select
      class=${value ? "" : "missing"}
      @change=${(e: Event) => onPick((e.target as HTMLSelectElement).value)}
    >
      <option value="" ?selected=${!value}>${t("presence.pick_room")}</option>
      ${rooms.map((r) => html`<option value=${r.room_id} ?selected=${r.room_id === value}>${r.name}</option>`)}
      ${value && !rooms.some((r) => r.room_id === value)
        ? html`<option value=${value} selected>${value}</option>`
        : nothing}
    </select>`;
  }

  private _time(value: string | undefined, onChange: (v: string) => void) {
    return html`<input
      type="time"
      .value=${value ?? ""}
      @change=${(e: Event) => {
        const v = (e.target as HTMLInputElement).value;
        if (v) onChange(v);
      }}
    />`;
  }

  private _num(value: number | undefined, min: number, max: number, onChange: (v: number) => void) {
    return html`<input
      type="number"
      min=${min}
      max=${max}
      .value=${String(value ?? min)}
      @change=${(e: Event) => {
        const v = Math.round(Number((e.target as HTMLInputElement).value));
        if (Number.isFinite(v)) onChange(Math.max(min, Math.min(max, v)));
      }}
    />`;
  }

  private _row(routine: PresenceRoutineKey, a: PresenceAction) {
    const p = (patch: Partial<PresenceAction>) => this._patch(routine, a.id, patch);
    const icon = KINDS.find((k) => k.kind === a.kind)?.icon ?? "";
    const lightRooms = this._rooms.filter(hasLights);
    let body;
    if (a.kind === "shutter") {
      const rooms = this._rooms.filter((r) => shutterGroups(r).length);
      const groups = shutterGroups(this._rooms.find((r) => r.room_id === a.room_id) ?? ({} as Room));
      body = html`
        ${this._roomSelect(rooms, a.room_id, (room_id) => {
          const room = rooms.find((r) => r.room_id === room_id);
          const gs = room ? shutterGroups(room) : [];
          p({ room_id, group_id: gs.length === 1 ? gs[0].id : "" });
        })}
        <select
          class=${a.group_id ? "" : "missing"}
          @change=${(e: Event) => p({ group_id: (e.target as HTMLSelectElement).value })}
        >
          <option value="" ?selected=${!a.group_id}>${t("presence.pick_group")}</option>
          ${groups.map((g) => html`<option value=${g.id} ?selected=${g.id === a.group_id}>${g.name}</option>`)}
        </select>
        <select @change=${(e: Event) => p({ action: (e.target as HTMLSelectElement).value as "open" | "close" })}>
          <option value="open" ?selected=${a.action !== "close"}>${t("presence.open")}</option>
          <option value="close" ?selected=${a.action === "close"}>${t("presence.close")}</option>
        </select>
        ${t("presence.at")} ${this._time(a.start, (start) => p({ start }))}
      `;
    } else if (a.kind === "light") {
      body = html`
        ${this._roomSelect(lightRooms, a.room_id, (room_id) => p({ room_id }))}
        ${t("presence.from")} ${this._time(a.start, (start) => p({ start }))}
        ${t("presence.to")} ${this._time(a.end, (end) => p({ end }))}
        ${a.end && a.end < a.start ? html`<span class="hint">(${t("presence.next_day")})</span>` : nothing}
      `;
    } else if (a.kind === "blink") {
      body = html`
        ${this._roomSelect(lightRooms, a.room_id, (room_id) => p({ room_id }))}
        ${this._num(a.count, 1, 20, (count) => p({ count }))} ${t("presence.times")}
        ${this._num(a.duration, 1, 240, (duration) => p({ duration }))} ${t("presence.minutes")}
        ${t("presence.from")} ${this._time(a.start, (start) => p({ start }))}
      `;
    } else {
      body = html`
        ${this._roomSelect(lightRooms, a.room_id, (room_id) => p({ room_id }))}
        ${t("presence.at")} ${this._time(a.start, (start) => p({ start }))}
      `;
    }
    return html`<div class="row">
      <span class="kind">${icon} ${t(`presence.kind_${a.kind}`)}</span>
      ${body}
      <span class="grow"></span>
      <button
        class="rm"
        title=${t("presence.remove")}
        @click=${() => this._edit((s) => (s.routines[routine].actions = s.routines[routine].actions.filter((x) => x.id !== a.id)))}
      >
        ×
      </button>
    </div>`;
  }

  private _routine(key: PresenceRoutineKey, icon: string) {
    const r = this._state!.routines[key];
    return html`<div class="card ${r.enabled ? "" : "off"}">
      <div class="card-head">
        <span>${icon}</span>
        <h3>${t(`presence.routine_${key}`)}</h3>
        <span class="toggle ${r.enabled ? "on" : ""}">
          <input
            type="checkbox"
            .checked=${r.enabled}
            @change=${(e: Event) => this._edit((s) => (s.routines[key].enabled = (e.target as HTMLInputElement).checked))}
          />
          <span class="knob"></span>
        </span>
      </div>
      <div class="rows">
        ${r.actions.length
          ? [...r.actions].sort((a, b) => a.start.localeCompare(b.start)).map((a) => this._row(key, a))
          : html`<div class="msg">${t("presence.no_actions")}</div>`}
      </div>
      <div class="adds">
        ${KINDS.map((k) => html`<button @click=${() => this._add(key, k.kind)}>${t(`presence.add_${k.kind}`)}</button>`)}
      </div>
    </div>`;
  }

  private _eventLabel(ev: PresenceEvent) {
    const room = this._rooms.find((r) => r.room_id === ev.room_id);
    const name = room?.name ?? ev.room_id;
    if (ev.kind === "open" || ev.kind === "close") {
      const group = room?.shutter_groups?.find((g) => g.id === ev.group_id);
      return `${name}${group ? ` · ${group.name}` : ""} — ${t(`presence.ev_${ev.kind}`)}`;
    }
    return `${name} — ${t(`presence.ev_${ev.kind}`)}`;
  }

  private _schedule() {
    if (!this._enabled) return html`<div class="msg">${t("presence.schedule_off")}</div>`;
    const events = this._state!.schedule;
    if (!events.length) return html`<div class="msg">${t("presence.schedule_empty")}</div>`;
    const today = new Date().toDateString();
    return html`<div class="timeline">
      ${events.map((ev) => {
        const at = new Date(ev.at);
        return html`<div class="ev ${ev.done ? "done" : ""}">
          <span class="time">${at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <span>
            ${this._eventLabel(ev)}
            <span class="tag">· ${t(`presence.routine_${ev.routine}`)}${at.toDateString() !== today ? ` · ${t("presence.next_day")}` : ""}</span>
          </span>
        </div>`;
      })}
    </div>`;
  }

  render() {
    const enabled = this._enabled;
    const head = html`<div class="head">
      <button @click=${() => this.dispatchEvent(new CustomEvent("close"))}>← Homex</button>
      <h2>${t("presence.title")}</h2>
      <label
        class="master ${enabled ? "on" : ""}"
        title=${enabled ? t("presence.disable_title") : t("presence.enable_title")}
      >
        ${enabled ? t("presence.enabled") : t("presence.disabled")}
        <span class="toggle ${enabled ? "on" : ""}">
          <input
            type="checkbox"
            .checked=${enabled}
            ?disabled=${this._busy || !this._state}
            @change=${(e: Event) => this._setEnabled((e.target as HTMLInputElement).checked)}
          />
          <span class="knob"></span>
        </span>
      </label>
    </div>`;
    if (!this._state) {
      return html`${head}
        <div class="msg">${this._error ? t("common.error", { message: this._error }) : t("common.loading")}</div>`;
    }
    return html`
      ${head}
      <div class="intro">${t("presence.intro")}</div>
      ${this._rooms.some(hasLights) ? nothing : html`<div class="msg">${t("presence.no_light_rooms")}</div>`}
      <div class="card">
        <div class="jitter">
          ${t("presence.jitter")}
          ${this._num(this._state.jitter, 0, 60, (jitter) => this._edit((s) => (s.jitter = jitter)))}
        </div>
        <div class="hint">${t("presence.jitter_hint")}</div>
      </div>
      ${ROUTINES.map((r) => this._routine(r.key, r.icon))}
      <div class="savebar">
        <span class="status ${this._error ? "err" : ""}">
          ${this._error ?? (this._dirty ? t("presence.unsaved") : this._saved ? t("presence.saved") : "")}
        </span>
        <button class="primary" ?disabled=${!this._dirty || this._busy} @click=${this._save}>${t("presence.save")}</button>
      </div>
      <div class="section">${t("presence.schedule")}</div>
      <div class="card">${this._schedule()}</div>
    `;
  }
}
