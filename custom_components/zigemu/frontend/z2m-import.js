"use strict";

// Read the device models out of a Zigbee2MQTT export, entirely in the browser.
// Accepted inputs (anything JSON, searched recursively, or newline-delimited JSON):
// - the frontend's "Download state" file and the bridge/devices payload: device
//   objects with a `definition` { model, vendor, description } and `model_id`;
// - data/database.db (one JSON device per line): `modelId` + `manufName` only.
// Returns one entry per model, with how many devices of the network use it.
(function (root) {
  const Z2M = "https://www.zigbee2mqtt.io";

  // Zigbee2MQTT's own file naming for device pages and pictures.
  const pageName = (model) => model.replace(/[/| :]/g, "_");
  const imageName = (model) => model.replace(/[/| :]/g, "-");

  function parseText(text) {
    try {
      return [JSON.parse(text)];
    } catch {
      const out = [];
      for (const line of text.split(/\r?\n/)) {
        const t = line.trim();
        if (!t) continue;
        try {
          out.push(JSON.parse(t));
        } catch {
          /* not a JSON line */
        }
      }
      if (!out.length) throw new Error("This file is not JSON: expected a Zigbee2MQTT state export or database.db.");
      return out;
    }
  }

  function str(v) {
    return typeof v === "string" && v.trim() ? v.trim() : null;
  }

  function fromObject(o) {
    const type = str(o.type);
    if (type && /coordinator/i.test(type)) return null;
    const def = o.definition && typeof o.definition === "object" ? o.definition : null;
    if (def && str(def.model)) {
      return {
        vendor: str(def.vendor) ?? str(o.manufacturer) ?? "Unknown",
        model: str(def.model),
        description: str(def.description),
        zigbeeModel: str(o.model_id) ?? str(o.modelID),
        manufacturer: str(o.manufacturer),
        logicalType: type,
        name: str(o.friendly_name),
      };
    }
    const zm = str(o.modelId) ?? str(o.modelID) ?? str(o.model_id);
    const manuf = str(o.manufName) ?? str(o.manufacturerName) ?? str(o.manufacturer);
    const isDevice = zm && (o.ieeeAddr || o.ieee_address || o.ieee || manuf);
    if (isDevice) {
      return { vendor: manuf ?? "Unknown", model: null, description: null, zigbeeModel: zm, manufacturer: manuf, logicalType: type, name: str(o.friendly_name) };
    }
    return null;
  }

  function walk(node, found, seen, depth = 0) {
    if (!node || typeof node !== "object" || depth > 12 || seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) {
      for (const x of node) walk(x, found, seen, depth + 1);
      return;
    }
    const dev = fromObject(node);
    if (dev) {
      found.push(dev);
      return; // don't descend into a device (its endpoints are not devices)
    }
    for (const v of Object.values(node)) walk(v, found, seen, depth + 1);
  }

  function extract(text) {
    const found = [];
    const seen = new Set();
    for (const doc of parseText(text)) walk(doc, found, seen);
    // Same model seen as a full definition and as a bare zigbee model id: keep the full one.
    const byZigbee = new Map(found.filter((d) => d.model && d.zigbeeModel).map((d) => [d.zigbeeModel, d]));
    const models = new Map();
    for (const d of found) {
      const full = d.model ? d : byZigbee.get(d.zigbeeModel) ?? d;
      const key = `${full.vendor.toLowerCase()}|${(full.model ?? full.zigbeeModel).toLowerCase()}`;
      const cur = models.get(key);
      if (cur) {
        cur.count += 1;
        if (d.name && cur.names.length < 5) cur.names.push(d.name);
      } else {
        const entry = { ...full, count: 1, names: d.name ? [d.name] : [] };
        if (full.model) {
          entry.url = `${Z2M}/devices/${pageName(full.model)}.html`;
          entry.image = `${Z2M}/images/devices/${imageName(full.model)}.png`;
        }
        delete entry.name;
        models.set(key, entry);
      }
    }
    return [...models.values()].sort(
      (a, b) => a.vendor.localeCompare(b.vendor) || (a.model ?? a.zigbeeModel).localeCompare(b.model ?? b.zigbeeModel),
    );
  }

  // Which ZigEmu profile already emulates this model (by Z2M model, or Zigbee model id)?
  function supportedBy(entry, profiles) {
    const norm = (s) => String(s ?? "").toLowerCase();
    return (
      profiles.find((p) => entry.model && norm(p.info?.model) === norm(entry.model)) ??
      profiles.find((p) => entry.zigbeeModel && (p.modelIds ?? []).some((m) => norm(m) === norm(entry.zigbeeModel))) ??
      null
    );
  }

  const api = { extract, supportedBy, pageName, imageName };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Z2MImport = api;
})(typeof window !== "undefined" ? window : globalThis);
