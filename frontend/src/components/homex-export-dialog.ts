import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Room } from "../types";
import { sharedStyles } from "../lib/styles";
import "./homex-dialog";

/** Double-quote a YAML scalar, escaping backslashes and quotes. */
const yamlStr = (s: string): string =>
  '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';

/** Build a `google_assistant:` entity_config exposing each room's toggle. */
export function buildGoogleAssistantYaml(rooms: Room[]): string {
  const lines = ["google_assistant:", "  entity_config:"];
  if (!rooms.length) lines[1] = "  entity_config: {}";
  for (const r of rooms) {
    lines.push(`    ${r.switch}:`);
    lines.push(`      name: ${yamlStr(r.name)}`);
    lines.push(`      expose: true`);
    lines.push(`      room: ${yamlStr(r.name)}`);
  }
  return lines.join("\n") + "\n";
}

/** Modal that shows the Google Assistant exposure YAML for every room. */
@customElement("homex-export-dialog")
export class HomexExportDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) rooms: Room[] = [];

  @state() private _copied = false;

  static styles = [
    sharedStyles,
    css`
      .hint {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin: 0 0 10px;
      }
      .hint code {
        font-family: monospace;
      }
      textarea {
        width: 100%;
        min-height: 340px;
        box-sizing: border-box;
        font-family: "SFMono-Regular", Consolas, monospace;
        font-size: 13px;
        line-height: 1.5;
        padding: 12px 14px;
        border-radius: 8px;
        border: 1px solid var(--divider-color, #ccc);
        background: var(--code-editor-background-color, var(--card-background-color, #1c1c1c));
        color: var(--primary-text-color);
        white-space: pre;
        resize: vertical;
      }
    `,
  ];

  private get _yaml(): string {
    return buildGoogleAssistantYaml(this.rooms);
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }

  private async _copy() {
    const text = this._yaml;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for non-secure contexts: select + execCommand.
      const ta = this.renderRoot.querySelector("textarea");
      if (ta) {
        ta.select();
        document.execCommand("copy");
      }
    }
    this._copied = true;
    setTimeout(() => (this._copied = false), 1500);
  }

  private _download() {
    const blob = new Blob([this._yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "homex_google_assistant.yaml";
    a.click();
    URL.revokeObjectURL(url);
  }

  render() {
    return html`
      <homex-dialog
        .open=${this.open}
        heading="Exposer les pièces (Google Assistant)"
        @dialog-closed=${this._close}
      >
        <p class="hint">
          Colle cet extrait dans <code>configuration.yaml</code> pour exposer le
          toggle on/off de chaque pièce à Google Assistant.
        </p>
        <textarea
          readonly
          .value=${this._yaml}
          @click=${(e: Event) => (e.target as HTMLTextAreaElement).select()}
        ></textarea>
        <span slot="actions">
          <button @click=${this._download}>Télécharger .yaml</button>
          <button @click=${this._close}>Fermer</button>
          <button class="primary" @click=${this._copy}>
            ${this._copied ? "Copié ✓" : "Copier"}
          </button>
        </span>
      </homex-dialog>
    `;
  }
}
