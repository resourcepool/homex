import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "../types";
import { errorMessage } from "../api";
import { fireChanged } from "../types";
import { t } from "../lib/i18n";
import "./homex-dialog";

export interface BackupSummary {
  created_at?: string;
  homex_version?: string;
  rooms: number;
  switches: number;
  switch_presets: number;
  shutter_presets: number;
  layouts: number;
  zones: number;
  heating_systems: number;
  scenes: number;
  plan_levels?: number;
}

/** Download a backup of Homex (configuration and data). */
export async function downloadBackup(hass: HomeAssistant) {
  const { backup } = await hass.callWS({ type: "homex/backup/create" });
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, "").replace("T", "-");
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `homex-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Restore a Homex backup: pick the file, see what it holds, confirm.
 * Everything Homex holds is replaced; a safety backup of the current state is
 * written to config/homex_backups/ first.
 */
@customElement("homex-backup-dialog")
export class HomexBackupDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) open = false;

  @state() private _backup: Record<string, unknown> | null = null;
  @state() private _summary: BackupSummary | null = null;
  @state() private _fileName = "";
  @state() private _error = "";
  @state() private _busy = false;
  @state() private _done = "";

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("open") && this.open) {
      this._backup = null;
      this._summary = null;
      this._fileName = "";
      this._error = "";
      this._done = "";
      this._busy = false;
    }
  }

  private async _pick(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this._fileName = file.name;
    this._error = "";
    this._summary = null;
    this._backup = null;
    try {
      const backup = JSON.parse(await file.text());
      const res = await this.hass.callWS({ type: "homex/backup/check", backup });
      this._backup = backup;
      this._summary = res.summary;
    } catch (err) {
      this._error = err instanceof SyntaxError ? t("backup.not_json") : errorMessage(err);
    }
  }

  private async _restore() {
    if (!this._backup) return;
    this._busy = true;
    try {
      const res = await this.hass.callWS({
        type: "homex/backup/restore",
        backup: this._backup,
      });
      this._done = res.safety_backup;
      fireChanged(this);
    } catch (err) {
      this._error = errorMessage(err);
    } finally {
      this._busy = false;
    }
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }

  private _summaryList(s: BackupSummary) {
    const rows: [string, number][] = [
      ["rooms", s.rooms],
      ["switches", s.switches],
      ["switch_presets", s.switch_presets],
      ["layouts", s.layouts],
      ["shutter_presets", s.shutter_presets],
      ["zones", s.zones],
      ["heating_systems", s.heating_systems],
      ["scenes", s.scenes],
      ["plan_levels", s.plan_levels ?? 0],
    ];
    const date = s.created_at ? new Date(s.created_at).toLocaleString(this.hass.locale?.language) : "?";
    return html`<p>${t("backup.from", { date, version: s.homex_version ?? "?" })}</p>
      <ul>
        ${rows.map(([k, n]) => html`<li><strong>${n}</strong> ${t(`backup.count_${k}`)}</li>`)}
      </ul>`;
  }

  render() {
    return html`<homex-dialog compact .open=${this.open} heading=${t("backup.restore_title")} @dialog-closed=${this._close}>
      ${this._done
        ? html`<p class="ok">${t("backup.restored")}</p>
            <p class="hint">${t("backup.safety", { path: this._done })}</p>`
        : html`
            <p>${t("backup.restore_intro")}</p>
            <label class="file">
              <input type="file" accept="application/json,.json" @change=${this._pick} />
              <span class="file-btn">${t("backup.choose_file")}</span>
              <span class="file-name">${this._fileName || t("backup.no_file")}</span>
            </label>
            ${this._error ? html`<p class="err">${this._error}</p>` : nothing}
            ${this._summary
              ? html`${this._summaryList(this._summary)}
                  <p class="warn">${t("backup.warning")}</p>`
              : nothing}
          `}
      ${this._done
        ? html`<button slot="actions" class="primary" @click=${this._close}>${t("common.close")}</button>`
        : html`<button slot="actions" @click=${this._close}>${t("common.cancel")}</button>
            <button
              slot="actions"
              class="danger"
              ?disabled=${!this._summary || this._busy}
              @click=${this._restore}
            >
              ${this._busy ? t("backup.restoring") : t("backup.restore")}
            </button>`}
    </homex-dialog>`;
  }

  static styles = css`
    p {
      margin: 0 0 12px;
      line-height: 1.5;
    }
    ul {
      margin: 0 0 12px;
      padding-left: 20px;
      line-height: 1.6;
    }
    .file {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      cursor: pointer;
    }
    .file input {
      display: none;
    }
    .file-btn {
      padding: 7px 14px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      font-weight: 500;
    }
    .file-name {
      color: var(--secondary-text-color);
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .err {
      color: var(--error-color, #db4437);
    }
    .warn {
      color: var(--warning-color, #ffa600);
    }
    .ok {
      color: var(--success-color, #43a047);
      font-weight: 500;
    }
    .hint {
      color: var(--secondary-text-color);
      font-size: 13px;
    }
    button.danger {
      background: var(--error-color, #db4437);
      color: #fff;
      border: none;
    }
    button.danger:disabled {
      opacity: 0.5;
    }
  `;
}
