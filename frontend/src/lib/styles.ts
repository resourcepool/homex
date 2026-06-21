import { css } from "lit";

// Styles shared across Homex panel components (buttons, edit blocks, fields).
// Sizing follows Material Design density (comfortable touch targets, spacing).
export const sharedStyles = css`
  button {
    cursor: pointer;
    border: none;
    border-radius: 10px;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 500;
    min-height: 40px;
    background: var(--secondary-background-color, #f0f0f0);
    color: var(--primary-text-color);
  }
  button:hover {
    filter: brightness(0.95);
  }
  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  button.primary {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }
  button.danger {
    background: var(--error-color, #db4437);
    color: #fff;
  }
  .rid {
    font-size: 12px;
    color: var(--secondary-text-color);
    background: var(--secondary-background-color, #f0f0f0);
    border-radius: 6px;
    padding: 2px 8px;
  }
  .section {
    font-size: 14px;
    font-weight: 500;
    margin: 20px 0 8px;
    color: var(--primary-text-color);
  }
  .actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  /* Native Material text field, full width with breathing room. */
  ha-textfield {
    display: block;
    width: 100%;
    margin: 12px 0;
  }

  /* Fallback text field (stacked label + large input). */
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 14px 0;
  }
  .field > span {
    font-size: 13px;
    color: var(--secondary-text-color);
  }
  .field input {
    width: 100%;
    box-sizing: border-box;
    padding: 13px 14px;
    font-size: 16px;
    border: 1px solid var(--divider-color, #ccc);
    border-radius: 8px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
  }
  .field input:focus {
    outline: none;
    border-color: var(--primary-color, #03a9f4);
    box-shadow: 0 0 0 1px var(--primary-color, #03a9f4);
  }

  details.editblock {
    margin-top: 14px;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 10px;
    padding: 12px 16px;
  }
  summary {
    cursor: pointer;
    font-size: 14px;
    color: var(--secondary-text-color);
  }
  details[open] summary {
    margin-bottom: 10px;
  }
`;
