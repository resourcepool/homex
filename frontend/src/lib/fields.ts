import { html } from "lit";
import { haComponentsLoaded } from "./ha-elements";

// A text field: native Material ha-textfield when available, large styled input
// otherwise. Both render full width with comfortable sizing.
export const textField = (
  label: string,
  value: string,
  onInput: (v: string) => void,
  placeholder = ""
) => {
  if (haComponentsLoaded()) {
    return html`<ha-textfield
      outlined
      .label=${label}
      .value=${value ?? ""}
      .placeholder=${placeholder}
      @input=${(e: Event) => onInput((e.target as HTMLInputElement).value)}
    ></ha-textfield>`;
  }
  return html`<div class="field">
    <span>${label}</span>
    <input
      .value=${value ?? ""}
      placeholder=${placeholder}
      @input=${(e: Event) => onInput((e.target as HTMLInputElement).value)}
    />
  </div>`;
};
