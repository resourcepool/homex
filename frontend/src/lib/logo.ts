/** The Homex logo (from homex-website): a two-gang wall switch, the left
 * rocker lit. */
import { svg } from "lit";

/** Colour logo (panel header). */
export const logo = (size = 28) => svg`<svg viewBox="0 0 32 32" width=${size} height=${size} aria-hidden="true" class="homex-logo">
  <rect x="2" y="2" width="28" height="28" rx="8" fill="var(--homex-logo-plate, #fbfcfd)" stroke="var(--homex-logo-edge, #c9d1da)" stroke-width="1.5"></rect>
  <rect x="7" y="7" width="8" height="18" rx="2.5" fill="#f2b233"></rect>
  <rect x="17" y="7" width="8" height="18" rx="2.5" fill="none" stroke="var(--homex-logo-off, #556275)" stroke-width="1.5"></rect>
</svg>`;

/** Monochrome single-path version (sidebar icon "homex:logo"), viewBox 0 0 32 32. */
export const LOGO_PATH =
  "M10 1H22A9 9 0 0 1 31 10V22A9 9 0 0 1 22 31H10A9 9 0 0 1 1 22V10A9 9 0 0 1 10 1ZM10 3.5A6.5 6.5 0 0 0 3.5 10V22A6.5 6.5 0 0 0 10 28.5H22A6.5 6.5 0 0 0 28.5 22V10A6.5 6.5 0 0 0 22 3.5ZM9.5 7H12.5A2.5 2.5 0 0 1 15 9.5V22.5A2.5 2.5 0 0 1 12.5 25H9.5A2.5 2.5 0 0 1 7 22.5V9.5A2.5 2.5 0 0 1 9.5 7ZM19.5 6.5H22.5A3 3 0 0 1 25.5 9.5V22.5A3 3 0 0 1 22.5 25.5H19.5A3 3 0 0 1 16.5 22.5V9.5A3 3 0 0 1 19.5 6.5ZM19.75 8.75A1 1 0 0 0 18.75 9.75V22.25A1 1 0 0 0 19.75 23.25H22.25A1 1 0 0 0 23.25 22.25V9.75A1 1 0 0 0 22.25 8.75Z";

/** Register the "homex" icon set (homex:logo) for the sidebar and cards. */
export function registerIconset() {
  const w = window as unknown as {
    customIconsets?: Record<string, (name: string) => Promise<{ path: string; viewBox?: string }>>;
  };
  w.customIconsets = w.customIconsets || {};
  w.customIconsets.homex ??= async () => ({ path: LOGO_PATH, viewBox: "0 0 32 32" });
}
