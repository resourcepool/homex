import { html } from "lit";

// A large styled native text input. HA's own ha-textfield was dropped in
// HA 2026.9 (replaced by ha-input) and is not reliably registered in a custom
// panel, so we never depend on it.
export const textField = (
  label: string,
  value: string,
  onInput: (v: string) => void,
  placeholder = ""
) => html`<div class="field">
  <span>${label}</span>
  <input
    .value=${value ?? ""}
    placeholder=${placeholder}
    @input=${(e: Event) => onInput((e.target as HTMLInputElement).value)}
  />
</div>`;
