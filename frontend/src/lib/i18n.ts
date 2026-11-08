/** Homex translations (panel and Lovelace cards).
 *
 * Strings live in per-namespace catalogs under src/i18n/ (one file per
 * component or area, each exporting `{ en: {...}, fr: {...} }`), merged in
 * src/i18n/index.ts. Keys are "<namespace>.<key>"; `{name}` placeholders are
 * filled from `t()`'s params.
 *
 * Language: the Homex setting (Settings → Devices & services → Homex →
 * Configure, or the panel menu) when set, else Home Assistant's language,
 * else English. Every catalog must define every key in English (the
 * fallback); a key missing in French falls back to English too.
 */
import type { HomeAssistant } from "../types";
import { CATALOGS } from "../i18n";

export const LANGUAGES = ["en", "fr"] as const;
export type Lang = (typeof LANGUAGES)[number];
/** The Homex setting: "auto" follows Home Assistant. */
export type LangSetting = "auto" | Lang;

type Dict = Record<string, string>;
const DICTS: Record<Lang, Dict> = { en: {}, fr: {} };
for (const [ns, cat] of Object.entries(CATALOGS)) {
  for (const lang of LANGUAGES) {
    for (const [k, v] of Object.entries((cat as Record<Lang, Dict>)[lang] ?? {})) DICTS[lang][`${ns}.${k}`] = v;
  }
}

let setting: LangSetting = "auto";
let haLang: string | undefined;
let current: Lang = "en";

const listeners = new Set<() => void>();
/** Called when the active language changes (re-render). Returns an unsubscribe. */
export function onLanguageChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function pick(code?: string): Lang | undefined {
  const base = (code || "").toLowerCase().split(/[-_]/)[0];
  return (LANGUAGES as readonly string[]).includes(base) ? (base as Lang) : undefined;
}

function recompute() {
  const next = (setting !== "auto" ? setting : pick(haLang)) ?? "en";
  if (next === current) return;
  current = next;
  document.documentElement.dispatchEvent(new CustomEvent("homex-language-changed"));
  listeners.forEach((fn) => fn());
}

/** Follow Home Assistant's language (call with every new hass). */
export function syncHass(hass?: HomeAssistant) {
  const code = hass?.locale?.language || (hass as any)?.language;
  if (code && code !== haLang) {
    haLang = code;
    recompute();
  }
}

export function setLanguageSetting(value: LangSetting | undefined) {
  setting = value && (value === "auto" || pick(value)) ? value : "auto";
  recompute();
}

export const languageSetting = () => setting;
export const language = () => current;

/** Beta features enabled in the integration settings (homex/settings/get). */
let features: Record<string, boolean> = {};
let featuresLoaded = false;
export const featureEnabled = (name: string) => !!features[name];
export const featuresKnown = () => featuresLoaded;

/** Load the Homex language setting once per page (shared by panel and cards). */
let settingsPromise: Promise<void> | undefined;
export function loadLanguageSetting(hass: HomeAssistant): Promise<void> {
  syncHass(hass);
  settingsPromise ??= hass.connection
    .sendMessagePromise({ type: "homex/settings/get" })
    .then((r: { language?: LangSetting; features?: Record<string, boolean> }) => {
      features = r.features ?? {};
      featuresLoaded = true;
      setLanguageSetting(r.language);
    })
    .catch(() => {
      settingsPromise = undefined; // retry next time (e.g. Homex reloading)
    });
  return settingsPromise;
}

/** Translate "<namespace>.<key>", filling `{param}` placeholders. Unknown
 * keys return the key itself (visible, so it gets fixed). */
export function t(key: string, params?: Record<string, string | number>): string {
  let s = DICTS[current][key] ?? DICTS.en[key] ?? key;
  if (params) s = s.replace(/\{(\w+)\}/g, (m, p) => (p in params ? String(params[p]) : m));
  return s;
}

/** Locale for number / date formatting. */
export const locale = () => current;
