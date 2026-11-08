import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { mdiCheck, mdiChevronDown } from "@mdi/js";
import { t } from "../lib/i18n";

export interface SelectOption {
  value: string;
  /** Primary info (the option's name). */
  label: string;
  /** Optional second info (smaller, muted). */
  secondary?: string;
  /** Optional third info (smallest, faint), after the primary on its line. */
  tertiary?: string;
  disabled?: boolean;
}
export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

const PANEL_MAX = 320; // px

/**
 * Homex select box: a roomy trigger styled like Homex's buttons / toggles /
 * pills, opening a listbox whose options show one to three infos (primary,
 * secondary, tertiary). Keyboard: ↑ ↓ Enter Escape. Pass `options` (flat)
 * and/or `groups`; listen to `value-changed` ({ detail: { value } }).
 * The listbox is position: fixed so scrolling dialogs don't clip it.
 */
@customElement("homex-select")
export class HomexSelect extends LitElement {
  @property() value = "";
  @property() label = "";
  @property() placeholder = "";
  @property({ attribute: false }) options: SelectOption[] = [];
  @property({ attribute: false }) groups: SelectGroup[] = [];
  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private _open = false;
  @state() private _active = -1; // index in _flat, keyboard highlight
  @state() private _pos: Record<string, string> = {};

  static styles = css`
    :host {
      display: block;
      min-width: 0;
    }
    .label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      color: var(--secondary-text-color);
    }
    .trigger {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      min-height: 48px;
      box-sizing: border-box;
      margin: 0;
      padding: 10px 48px 10px 16px;
      font: inherit;
      font-size: 15px;
      text-align: left;
      color: var(--primary-text-color);
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
      border: 1px solid transparent;
      border-radius: 12px;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .trigger:hover {
      border-color: var(--divider-color, rgba(127, 127, 127, 0.4));
    }
    .trigger:focus-visible,
    .trigger.open {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 25%, transparent);
    }
    .trigger:disabled {
      opacity: 0.5;
      cursor: default;
    }
    .value {
      display: flex;
      align-items: baseline;
      gap: 8px;
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
    }
    /* The primary info keeps its room; the secondary shrinks first. */
    .value .primary {
      flex: 0 0 auto;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .value .secondary {
      flex: 1 1 0;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 13px;
      color: var(--secondary-text-color);
    }
    .placeholder {
      color: var(--secondary-text-color);
    }
    .chevron {
      position: absolute;
      top: 50%;
      right: 14px;
      width: 22px;
      height: 22px;
      transform: translateY(-50%);
      fill: var(--secondary-text-color);
      pointer-events: none;
      transition: transform 0.15s, fill 0.15s;
    }
    .trigger.open .chevron {
      transform: translateY(-50%) rotate(180deg);
      fill: var(--primary-color);
    }
    .panel {
      position: fixed;
      z-index: 2000;
      box-sizing: border-box;
      max-height: ${PANEL_MAX}px;
      overflow-y: auto;
      padding: 6px;
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 14px;
      box-shadow: 0 10px 32px rgba(0, 0, 0, 0.35);
    }
    .group {
      padding: 10px 12px 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--secondary-text-color);
    }
    .option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 12px;
      margin: 1px 0;
      border-radius: 10px;
      cursor: pointer;
    }
    .option.active {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    }
    .option.selected .primary {
      color: var(--primary-color);
      font-weight: 500;
    }
    .option.disabled {
      opacity: 0.45;
      cursor: default;
    }
    .texts {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      line-height: 1.3;
    }
    .line {
      display: flex;
      align-items: baseline;
      gap: 6px;
      min-width: 0;
    }
    .texts .primary {
      font-size: 15px;
      color: var(--primary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .texts .secondary {
      font-size: 12px;
      color: var(--secondary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .texts .tertiary {
      flex: none;
      font-size: 12px;
      color: var(--secondary-text-color);
      opacity: 0.75;
      white-space: nowrap;
    }
    .texts .tertiary::before {
      content: "·";
      margin-right: 6px;
    }
    .check {
      flex: none;
      width: 20px;
      height: 20px;
      fill: var(--primary-color);
    }
    .empty {
      padding: 12px;
      font-size: 14px;
      color: var(--secondary-text-color);
    }
  `;

  // The "no value" option, when a placeholder is set (stable for indexOf).
  private _none: SelectOption = { value: "", label: "" };

  /** Every option, flat: the placeholder one, then ungrouped, then groups. */
  private get _flat(): SelectOption[] {
    const none = this.placeholder ? [this._none] : [];
    return [...none, ...this.options, ...this.groups.flatMap((g) => g.options)];
  }
  private get _selected(): SelectOption | undefined {
    return [...this.options, ...this.groups.flatMap((g) => g.options)].find(
      (o) => o.value === this.value
    );
  }

  willUpdate() {
    this._none.label = this.placeholder;
  }

  disconnectedCallback() {
    this._close();
    super.disconnectedCallback();
  }

  private _onOutside = (e: Event) => {
    if (!e.composedPath().includes(this)) this._close();
  };
  private _onViewport = (e: Event) => {
    // Keep the panel's own scroll; anything else moving closes it.
    if (e.type === "scroll" && e.composedPath().includes(this)) return;
    this._close();
  };

  private _openPanel() {
    if (this.disabled || this._open) return;
    const trigger = this.renderRoot.querySelector(".trigger") as HTMLElement;
    const r = trigger.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const up = below < Math.min(PANEL_MAX, 220) && r.top > below;
    this._pos = {
      left: `${r.left}px`,
      width: `${r.width}px`,
      ...(up
        ? { bottom: `${window.innerHeight - r.top + 6}px`, maxHeight: `${Math.min(PANEL_MAX, r.top - 12)}px` }
        : { top: `${r.bottom + 6}px`, maxHeight: `${Math.min(PANEL_MAX, below - 12)}px` }),
    };
    this._active = Math.max(0, this._flat.findIndex((o) => o.value === this.value));
    this._open = true;
    document.addEventListener("pointerdown", this._onOutside, true);
    window.addEventListener("scroll", this._onViewport, true);
    window.addEventListener("resize", this._onViewport);
    this.updateComplete.then(() => this._scrollActive());
  }

  private _close() {
    if (!this._open) return;
    this._open = false;
    document.removeEventListener("pointerdown", this._onOutside, true);
    window.removeEventListener("scroll", this._onViewport, true);
    window.removeEventListener("resize", this._onViewport);
  }

  private _pick(o: SelectOption) {
    if (o.disabled) return;
    this._close();
    (this.renderRoot.querySelector(".trigger") as HTMLElement)?.focus();
    if (o.value === this.value) return;
    this.value = o.value;
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: o.value } }));
  }

  private _move(step: number) {
    const flat = this._flat;
    if (!flat.length) return;
    let i = this._active;
    for (let n = 0; n < flat.length; n++) {
      i = (i + step + flat.length) % flat.length;
      if (!flat[i].disabled) break;
    }
    this._active = i;
    this.updateComplete.then(() => this._scrollActive());
  }

  private _scrollActive() {
    this.renderRoot.querySelector(".option.active")?.scrollIntoView({ block: "nearest" });
  }

  private _onKey(e: KeyboardEvent) {
    if (!this._open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        this._openPanel();
      }
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      this._move(e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const o = this._flat[this._active];
      if (o) this._pick(o);
    } else if (e.key === "Escape") {
      e.preventDefault();
      this._close();
    } else if (e.key === "Tab") {
      this._close();
    }
  }

  private _renderOption(o: SelectOption) {
    const index = this._flat.indexOf(o);
    const selected = o.value === this.value;
    return html`<div
      class="option ${selected ? "selected" : ""} ${index === this._active ? "active" : ""} ${o.disabled
        ? "disabled"
        : ""}"
      role="option"
      aria-selected=${selected ? "true" : "false"}
      aria-disabled=${o.disabled ? "true" : "false"}
      @pointerenter=${() => !o.disabled && (this._active = index)}
      @click=${() => this._pick(o)}
    >
      <div class="texts">
        <span class="line">
          <span class="primary">${o.label}</span>
          ${o.tertiary ? html`<span class="tertiary">${o.tertiary}</span>` : nothing}
        </span>
        ${o.secondary ? html`<span class="secondary">${o.secondary}</span>` : nothing}
      </div>
      ${selected ? html`<svg class="check" viewBox="0 0 24 24"><path d=${mdiCheck}></path></svg>` : nothing}
    </div>`;
  }

  render() {
    const sel = this._selected;
    const style = Object.entries(this._pos)
      .map(([k, v]) => `${k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}:${v}`)
      .join(";");
    return html`
      ${this.label ? html`<span class="label">${this.label}</span>` : nothing}
      <button
        type="button"
        class="trigger ${this._open ? "open" : ""}"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded=${this._open ? "true" : "false"}
        aria-label=${this.label || this.placeholder}
        ?disabled=${this.disabled}
        @click=${() => (this._open ? this._close() : this._openPanel())}
        @keydown=${this._onKey}
      >
        <span class="value">
          ${sel
            ? html`<span class="primary">${sel.label}</span>${sel.secondary
                  ? html`<span class="secondary">${sel.secondary}</span>`
                  : nothing}`
            : html`<span class="placeholder">${this.placeholder || "—"}</span>`}
        </span>
        <svg class="chevron" viewBox="0 0 24 24"><path d=${mdiChevronDown}></path></svg>
      </button>
      ${this._open
        ? html`<div class="panel" role="listbox" style=${style}>
            ${this.placeholder ? this._renderOption(this._none) : nothing}
            ${this.options.map((o) => this._renderOption(o))}
            ${this.groups.map(
              (g) => html`<div class="group">${g.label}</div>
                ${g.options.map((o) => this._renderOption(o))}`
            )}
            ${!this._flat.length
              ? html`<div class="empty">${t("select.no_option")}</div>`
              : nothing}
          </div>`
        : nothing}
    `;
  }
}
