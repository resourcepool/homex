import { html } from "lit";

// A text field: native Material ha-textfield when it is actually registered,
// otherwise a large styled input. Gate on ha-textfield specifically so the
// field is never an undefined (invisible) element.
export const textField = (
  label: string,
  value: string,
  onInput: (v: string) => void,
  placeholder = ""
) => {
  if (customElements.get("ha-textfield")) {
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
