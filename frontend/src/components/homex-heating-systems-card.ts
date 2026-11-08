import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { mdiFire, mdiFireOff, mdiHandBackRight, mdiPump, mdiPumpOff, mdiSpeedometer } from "@mdi/js";
import type { HeatingSystem, HeatingZone, HomeAssistant } from "../types";
import { toggleSwitch } from "../lib/fields";
import { sharedStyles } from "../lib/styles";
import { locale, t } from "../lib/i18n";

const DAYS = 7;
const REFRESH_MS = 5 * 60 * 1000;
const RULE_LABELS: Record<string, [() => string, string]> = {
  setpoint_tank: [() => t("heatingSystemsCard.rule_setpoint_tank"), "setpoint_tank"],
  flow_return: [() => t("heatingSystemsCard.rule_flow_return"), "flow_return"],
  delta: [() => t("heatingSystemsCard.rule_setpoint_tank"), "setpoint_tank"],
};

interface Day {
  date: Date;
  minutes: number;
}

/** Heating systems stats for the dashboard Climate tab: per boiler / buffer
 * tank, its live state, readings, rules against their thresholds, quick
 * switch (buffer tank force) and its daily run time over 7 days (from
 * the history of its dry contact / circulator). */
@customElement("homex-heating-systems-card")
export class HomexHeatingSystemsCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) systems: HeatingSystem[] = [];
  @property({ attribute: false }) zones: HeatingZone[] = [];

  @state() private _days: Record<string, Day[]> = {};
  @state() private _hover: { sid: string; i: number } | null = null;
  private _timer?: number;

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .card {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        background: var(--card-background-color, #1c1c1c);
        padding: 14px 16px;
        margin-bottom: 16px;
      }
      .card-title {
        font-size: 13px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--secondary-text-color);
        margin-bottom: 10px;
      }
      .system + .system {
        border-top: 1px solid var(--divider-color, #e0e0e0);
        margin-top: 14px;
        padding-top: 14px;
      }
      .head {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 12px;
      }
      .head .info {
        flex: 1;
        min-width: 150px;
      }
      .name {
        font-weight: 500;
      }
      .muted {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .pills {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 10px 3px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
      }
      .pill svg {
        width: 14px;
        height: 14px;
        fill: currentColor;
      }
      .pill.on {
        color: var(--state-climate-heat-color, #ff8100);
        background: color-mix(in srgb, var(--state-climate-heat-color, #ff8100) 16%, transparent);
      }
      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
        gap: 8px;
        margin-top: 12px;
      }
      .tile {
        padding: 8px 10px;
        border-radius: 10px;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.06));
        min-width: 0;
      }
      .tile .label {
        font-size: 11px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tile .value {
        font-size: 18px;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        margin-top: 2px;
      }
      .rules {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .rule {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 4px 10px;
        font-size: 13px;
      }
      .rule .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--disabled-text-color, #777);
        flex: none;
      }
      .rule .dot.on {
        background: var(--state-climate-heat-color, #ff8100);
      }
      .rule .gap {
        font-weight: 500;
        font-variant-numeric: tabular-nums;
      }
      .switches {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 20px;
        margin-top: 12px;
      }
      .switches label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;
      }
      .chart {
        margin-top: 14px;
      }
      .chart-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-bottom: 6px;
      }
      .chart-head .readout {
        color: var(--primary-text-color);
        font-variant-numeric: tabular-nums;
      }
      svg.bars {
        display: block;
        width: 100%;
        height: 70px;
        overflow: visible;
      }
      svg.bars .bar {
        fill: var(--state-climate-heat-color, #ff8100);
      }
      svg.bars .bar.dim {
        opacity: 0.45;
      }
      svg.bars .base {
        stroke: var(--divider-color, rgba(127, 127, 127, 0.4));
        stroke-width: 1;
      }
      svg.bars .hit {
        fill: transparent;
        cursor: default;
      }
      .days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0 6px;
        margin-top: 4px;
        font-size: 10px;
        text-align: center;
        color: var(--secondary-text-color);
      }
      .empty {
        font-size: 14px;
        color: var(--secondary-text-color);
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._timer = window.setInterval(() => this._loadHistory(), REFRESH_MS);
  }

  disconnectedCallback() {
    window.clearInterval(this._timer);
    super.disconnectedCallback();
  }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("systems")) this._loadHistory();
  }

  private _driven(sys: HeatingSystem): string | undefined {
    return sys.type === "buffer_tank" ? sys.circulator : sys.contact;
  }

  /** Daily on-time of each system's contact / circulator over DAYS days. */
  private async _loadHistory() {
    if (!this.hass) return;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (DAYS - 1));
    const ids = this.systems.map((s) => this._driven(s)).filter(Boolean) as string[];
    if (!ids.length) return;
    let hist: Record<string, { s: string; lu?: number; lc?: number }[]> = {};
    try {
      hist = await this.hass.callWS({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        entity_ids: ids,
        minimal_response: true,
        no_attributes: true,
        significant_changes_only: false,
      });
    } catch {
      return;
    }
    const now = Date.now();
    const days: Record<string, Day[]> = {};
    for (const sys of this.systems) {
      const id = this._driven(sys);
      const list = Array.from({ length: DAYS }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return { date: d, minutes: 0 };
      });
      const changes = (id && hist[id]) || [];
      changes.forEach((c, i) => {
        if (c.s !== "on") return;
        const from = Math.max(((c.lc ?? c.lu) || 0) * 1000, start.getTime());
        const next = changes[i + 1];
        const to = next ? ((next.lc ?? next.lu) || 0) * 1000 : now;
        // Split the "on" period over the days it spans.
        for (const day of list) {
          const d0 = day.date.getTime();
          const d1 = d0 + 86400000;
          const overlap = Math.min(to, d1) - Math.max(from, d0);
          if (overlap > 0) day.minutes += overlap / 60000;
        }
      });
      days[sys.id] = list;
    }
    this._days = days;
  }

  private _temp(id?: string): string {
    const v = parseFloat(id ? this.hass.states[id]?.state ?? "" : "");
    return Number.isNaN(v) ? "—" : `${Math.round(v * 10) / 10} °C`;
  }

  private _dur(minutes: number): string {
    const m = Math.round(minutes);
    if (m < 60) return `${m} min`;
    return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
  }

  private _scope(sys: HeatingSystem): string {
    const zones = sys.zones?.length ? sys.zones : ["global"];
    return zones
      .map((z) => (z === "global" ? t("heatingSystemsCard.global") : this.zones.find((x) => x.id === z)?.name ?? z))
      .join(", ");
  }

  private _ent(sys: HeatingSystem, domain: string, key: string) {
    return this.hass.states[`${domain}.homex_system_${sys.id}_${key}`];
  }

  private _toggle(sys: HeatingSystem, key: string, label: string) {
    const st = this._ent(sys, "switch", key);
    if (!st) return nothing;
    return html`<label title=${st.entity_id}>
      ${toggleSwitch(st.state === "on", (on) =>
        this.hass.callService("switch", on ? "turn_on" : "turn_off", { entity_id: st.entity_id })
      )}
      ${label}
    </label>`;
  }

  private _renderChart(sys: HeatingSystem) {
    const days = this._days[sys.id];
    if (!days) return nothing;
    const W = 320;
    const H = 70;
    const gap = 6;
    const bw = (W - gap * (DAYS - 1)) / DAYS;
    const max = Math.max(60, ...days.map((d) => d.minutes));
    const total = days.reduce((a, d) => a + d.minutes, 0);
    const hover = this._hover?.sid === sys.id ? days[this._hover.i] : undefined;
    const fmtDay = (d: Date) =>
      d.toLocaleDateString(locale(), { weekday: "short", day: "numeric" });
    // A bar with a 4px rounded top, flat on the baseline.
    const bar = (x: number, h: number) => {
      if (h <= 0) return "";
      const r = Math.min(4, h, bw / 2);
      const y = H - h;
      return `M${x},${H}V${y + r}Q${x},${y} ${x + r},${y}H${x + bw - r}Q${x + bw},${y} ${x + bw},${y + r}V${H}Z`;
    };
    return html`<div class="chart">
      <div class="chart-head">
        <span>${t("heatingSystemsCard.runtime_days", { days: DAYS })}</span>
        <span class="readout">
          ${hover
            ? t("heatingSystemsCard.day_value", { day: fmtDay(hover.date), value: this._dur(hover.minutes) })
            : t("heatingSystemsCard.total", { total: this._dur(total), avg: this._dur(total / DAYS) })}
        </span>
      </div>
      <svg
        class="bars"
        viewBox="0 0 ${W} ${H}"
        preserveAspectRatio="none"
        role="img"
        aria-label=${t("heatingSystemsCard.chart_label", { name: sys.name, days: DAYS })}
        @pointerleave=${() => (this._hover = null)}
      >
        ${days.map((d, i) => {
          const x = i * (bw + gap);
          const h = (d.minutes / max) * H;
          const dim = hover && hover !== d;
          return svg`<path class="bar ${dim ? "dim" : ""}" d=${bar(x, h)}></path>
            <rect
              class="hit"
              x=${x - gap / 2}
              y="0"
              width=${bw + gap}
              height=${H}
              @pointerenter=${() => (this._hover = { sid: sys.id, i })}
            >
              <title>${t("heatingSystemsCard.day_value", { day: fmtDay(d.date), value: this._dur(d.minutes) })}</title>
            </rect>`;
        })}
        ${svg`<line class="base" x1="0" x2=${W} y1=${H} y2=${H}></line>`}
      </svg>
      <div class="days">
        ${days.map(
          (d, i) => html`<span
            @pointerenter=${() => (this._hover = { sid: sys.id, i })}
            @pointerleave=${() => (this._hover = null)}
            >${d.date.toLocaleDateString(locale(), { weekday: "short" })}</span
          >`
        )}
      </div>
    </div>`;
  }

  private _renderTank(sys: HeatingSystem) {
    const running = this.hass.states[sys.circulator ?? ""]?.state === "on";
    const forced = this._ent(sys, "switch", "force")?.state === "on";
    const demand = this._ent(sys, "binary_sensor", "demand")?.state === "on";
    const days = this._days[sys.id];
    const today = days
      ? days[days.length - 1].minutes
      : parseFloat(this._ent(sys, "sensor", "runtime_today")?.state ?? "");
    const left = parseFloat(this._ent(sys, "sensor", "min_runtime_left")?.state ?? "");
    return html`
      <div class="head">
        <div class="info">
          <div class="name">🛢️ ${sys.name}</div>
          <div class="muted">${t("heatingSystemsCard.buffer_tank")} · ${this._scope(sys)} · min ${sys.min_runtime ?? 0} min</div>
        </div>
        <div class="pills">
          <span class="pill ${running ? "on" : ""}" title=${sys.circulator ?? ""}>
            <svg viewBox="0 0 24 24"><path d=${running ? mdiPump : mdiPumpOff}></path></svg>
            ${running ? t("heatingSystemsCard.circulating") : t("heatingSystemsCard.stopped")}
          </span>
          <span class="pill ${demand ? "on" : ""}" title=${t("heatingSystemsCard.demand_title")}>
            <svg viewBox="0 0 24 24"><path d=${demand ? mdiFire : mdiFireOff}></path></svg>
            ${demand ? t("heatingSystemsCard.demand") : t("heatingSystemsCard.no_demand")}
          </span>
          ${forced
            ? html`<span class="pill on"><svg viewBox="0 0 24 24"><path d=${mdiHandBackRight}></path></svg>${t("heatingSystemsCard.forced")}</span>`
            : nothing}
          ${sys.aggressive
            ? html`<span class="pill"><svg viewBox="0 0 24 24"><path d=${mdiSpeedometer}></path></svg>${t("heatingSystemsCard.aggressive")}</span>`
            : nothing}
        </div>
      </div>
      <div class="tiles">
        <div class="tile"><div class="label">${t("heatingSystemsCard.setpoint")}</div><div class="value">${this._temp(sys.setpoint_sensor)}</div></div>
        ${sys.tank_sensor
          ? html`<div class="tile"><div class="label">${t("heatingSystemsCard.tank")}</div><div class="value">${this._temp(sys.tank_sensor)}</div></div>`
          : nothing}
        ${sys.flow_sensor
          ? html`<div class="tile"><div class="label">${t("heatingSystemsCard.flow")}</div><div class="value">${this._temp(sys.flow_sensor)}</div></div>`
          : nothing}
        ${sys.return_sensor
          ? html`<div class="tile"><div class="label">${t("heatingSystemsCard.return")}</div><div class="value">${this._temp(sys.return_sensor)}</div></div>`
          : nothing}
        <div class="tile">
          <div class="label">${t("heatingSystemsCard.tank_active_today")}</div>
          <div class="value">${Number.isNaN(today) ? "—" : this._dur(today)}</div>
        </div>
        ${left > 0
          ? html`<div class="tile">
              <div class="label">${t("heatingSystemsCard.min_time_left")}</div>
              <div class="value">${this._dur(left / 60)}</div>
            </div>`
          : nothing}
      </div>
      ${(sys.rules ?? []).length
        ? html`<div class="rules">
            ${(sys.rules ?? []).map((r) => {
              const [label, key] = RULE_LABELS[r.type] ?? [() => r.type, r.type];
              const gap = parseFloat(this._ent(sys, "sensor", `gap_${key}`)?.state ?? "");
              const on = this._ent(sys, "binary_sensor", `rule_${key}`)?.state === "on";
              return html`<div class="rule">
                <span class="dot ${on ? "on" : ""}"></span>
                <span>${label()}</span>
                <span class="gap">${Number.isNaN(gap) ? "—" : `${gap} °C`}</span>
                <span class="muted">${t("heatingSystemsCard.rule_status", { delta: r.delta, tolerance: r.tolerance, state: on ? t("heatingSystemsCard.rule_on") : t("heatingSystemsCard.rule_off") })}</span>
              </div>`;
            })}
          </div>`
        : nothing}
      <div class="switches">${this._toggle(sys, "force", t("heatingSystemsCard.manual_override"))}</div>
      ${this._renderChart(sys)}
    `;
  }

  private _renderBoiler(sys: HeatingSystem) {
    const contact = this.hass.states[sys.contact ?? ""];
    const on = contact?.state === "on";
    const demand = this._ent(sys, "binary_sensor", "demand")?.state === "on";
    const days = this._days[sys.id];
    const today = days ? days[days.length - 1].minutes : NaN;
    return html`
      <div class="head">
        <div class="info">
          <div class="name">🔥 ${sys.name}</div>
          <div class="muted">${t("heatingSystemsCard.boiler")} · ${this._scope(sys)}</div>
        </div>
        <div class="pills">
          <span class="pill ${on ? "on" : ""}" title=${sys.contact ?? ""}>
            <svg viewBox="0 0 24 24"><path d=${on ? mdiFire : mdiFireOff}></path></svg>
            ${on ? t("heatingSystemsCard.boiler_on") : t("heatingSystemsCard.boiler_off")}
          </span>
          <span class="pill ${demand ? "on" : ""}">${demand ? t("heatingSystemsCard.demand") : t("heatingSystemsCard.no_demand")}</span>
          ${sys.aggressive
            ? html`<span class="pill"><svg viewBox="0 0 24 24"><path d=${mdiSpeedometer}></path></svg>${t("heatingSystemsCard.aggressive")}</span>`
            : nothing}
        </div>
      </div>
      <div class="tiles">
        <div class="tile">
          <div class="label">${t("heatingSystemsCard.boiler_active_today")}</div>
          <div class="value">${Number.isNaN(today) ? "—" : this._dur(today)}</div>
        </div>
      </div>
      ${this._renderChart(sys)}
    `;
  }

  render() {
    const systems = this.systems.filter((s) => s.type === "boiler" || s.type === "buffer_tank");
    if (!systems.length) return nothing;
    return html`<div class="card">
      <div class="card-title">${t("heatingSystemsCard.title")}</div>
      ${systems.map(
        (s) => html`<div class="system">
          ${s.type === "buffer_tank" ? this._renderTank(s) : this._renderBoiler(s)}
        </div>`
      )}
    </div>`;
  }
}
