/** Sub-page navigation inside the Homex panel, through HA's own router.
 *
 * HA hands the panel a `route` ({prefix: "/homex", path: "/switches/..."}) and
 * updates it on `location-changed` (what HA's `navigate()` fires) and on
 * popstate, so the browser history (back/forward, reload, deep links) works.
 */

export interface PanelRoute {
  prefix: string;
  path: string;
}

/** Path segments of a route path ("/a/b" → ["a", "b"]). */
export const segments = (path = ""): string[] =>
  path.split("/").filter(Boolean).map(decodeURIComponent);

/** Join path segments under a base URL, encoding each one. */
export const joinPath = (base: string, ...segs: string[]): string =>
  [base.replace(/\/+$/, ""), ...segs.filter(Boolean).map(encodeURIComponent)].join("/");

export function navigate(url: string, replace = false): void {
  if (replace) {
    history.replaceState(history.state, "", url);
  } else {
    // Remember where the sub-page was opened from, so leaving it can pop the
    // history entry instead of stacking a new one (see goBack).
    history.pushState({ homexFrom: location.pathname }, "", url);
  }
  window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace } }));
}

/** Leave the current sub-page for `url`: a history step back when it was
 * opened from there, otherwise a replace (deep link, reload). */
export function goBack(url: string): void {
  if (history.state?.homexFrom === url) history.back();
  else navigate(url, true);
}

/** Open another HA page (e.g. a scene editor) inside the HA frontend. A new
 * tab would leave the companion app for the system browser, which has no HA
 * session; Cmd/Ctrl/Shift/middle click still opens one on desktop. */
export function openHaPage(url: string, e?: MouseEvent): void {
  if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1)) {
    window.open(url, "_blank", "noopener");
    return;
  }
  e?.preventDefault();
  navigate(url);
}
