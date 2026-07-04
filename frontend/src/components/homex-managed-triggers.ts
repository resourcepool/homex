import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

/** Read-only list of triggers that come from the Switches module. Shown next to
 * the editable trigger selectors in the Lights-module dialogs. */
@customElement("homex-managed-triggers")
export class HomexManagedTriggers extends LitElement {
  @property({ attribute: false }) triggers: string[] = [];

  static styles = css`
    .list {
      margin: 6px 0 4px;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      margin-bottom: 4px;
      border: 1px dashed var(--divider-color, #ccc);
      border-radius: 8px;
      background: color-mix(in srgb, var(--primary-color) 6%, transparent);
      font-size: 13px;
    }
    .icon {
      flex: 0 0 auto;
    }
    .lbl {
      flex: 1;
      min-width: 0;
      color: var(--primary-text-color);
    }
    .tag {
      flex: 0 0 auto;
      font-size: 11px;
      color: var(--secondary-text-color);
      background: var(--secondary-background-color, rgba(128, 128, 128, 0.15));
      border-radius: 10px;
      padding: 2px 8px;
      white-space: nowrap;
    }
  `;

  render() {
    if (!this.triggers?.length) return html``;
    return html`<div class="list">
      ${this.triggers.map(
        (t) => html`<div class="row">
          <span class="icon">🎛</span>
          <span class="lbl">${t}</span>
          <span class="tag">Géré par le module Switches</span>
        </div>`
      )}
    </div>`;
  }
}
