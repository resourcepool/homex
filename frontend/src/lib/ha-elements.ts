// Lazily force-load Home Assistant's own frontend elements (ha-entities-picker,
// ha-textfield, ...) which live in the config/editor chunk and are not loaded
// in a panel by default. This is the pattern used by community cards: creating
// the "entities" card editor pulls those elements into the registry.

let pending: Promise<boolean> | null = null;

export const haComponentsLoaded = (): boolean =>
  !!customElements.get("ha-entities-picker");

export function loadHaComponents(): Promise<boolean> {
  if (haComponentsLoaded()) return Promise.resolve(true);
  if (pending) return pending;
  pending = (async () => {
    try {
      const helpers = await (window as any).loadCardHelpers?.();
      if (helpers?.createCardElement) {
        const card = await helpers.createCardElement({
          type: "entities",
          entities: [],
        });
        const ctor: any = card?.constructor;
        if (ctor?.getConfigElement) await ctor.getConfigElement();
      }
    } catch (_err) {
      // No helpers / older HA: components fall back to the custom picker.
    }
    return haComponentsLoaded();
  })();
  return pending;
}
