"use strict";

const API = "/api/zigemu";
const $ = (sel, el = document) => el.querySelector(sel);

const state = { cid: null, coordinators: [], profiles: [], devices: [], coordinator: {}, settings: { disabledProfiles: [], wishlist: [], tags: [], views: [] } };

// Inside Home Assistant the panel is a same-origin iframe: reuse the logged-in
// user's HA session (window.hassConnection) to authenticate API calls.
// Standalone (no HA around it) there is no token and none is required.
async function authToken() {
  try {
    const conn = await window.parent?.hassConnection;
    const auth = conn?.auth;
    if (!auth) return null;
    if (auth.expired) await auth.refreshAccessToken();
    return auth.accessToken;
  } catch {
    return null;
  }
}

async function authHeaders(extra = {}) {
  const token = await authToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

// Device and state calls belong to the selected coordinator: /c/<id>/…
const scoped = (path) => (/^\/(state|devices)\b/.test(path) ? `/c/${encodeURIComponent(state.cid)}${path}` : path);

async function api(path, opts = {}) {
  const res = await fetch(API + scoped(path), {
    ...opts,
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 401 || res.status === 403) {
    log({ type: "sys", summary: "not authorized: ZigEmu requires a Home Assistant administrator" });
    throw new Error("unauthorized");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    log({ type: "sys", summary: `error: ${data.error || res.statusText}` });
    throw new Error(data.error || res.statusText);
  }
  return data;
}

// ---------------------------------------------------------------- rendering
function renderCoordinator() {
  const c = state.coordinator;
  const proxy = c.kind === "proxy";
  document.body.classList.toggle("proxy-mode", proxy);
  $("#empty").textContent = proxy
    ? `No device seen yet. Point Zigbee2MQTT or ZHA at this proxy (port ${c.port}) instead of the stick: real devices appear as they talk; re-interview one to capture its descriptors.`
    : "";
  if (!proxy) $("#empty").innerHTML = 'No devices yet. Click <b>+ Add device</b>, then pair it while permit join is open in Zigbee2MQTT or ZHA.';
  const host = $("#host-pill");
  if (proxy) {
    // host -> ZigEmu -> stick
    host.textContent = !c.hostConnected
      ? `host: waiting on :${c.port ?? "?"} → ${c.upstream}`
      : c.upstreamConnected
        ? `host ⇄ stick ${c.upstream}`
        : `stick ${c.upstream}: ${c.upstreamError ? "unreachable" : "connecting…"}`;
    host.title = c.upstreamError ?? "";
    host.className = "pill" + (c.hostConnected && c.upstreamConnected ? " on" : c.upstreamError ? " hot" : "");
  } else {
    host.textContent = c.hostConnected ? `host: connected` : `host: waiting on :${c.port ?? "?"}`;
    host.title = "";
    host.className = "pill" + (c.hostConnected ? " on" : "");
  }
  const net = $("#net-pill");
  net.textContent = c.networkUp ? `ch ${c.channel} · pan 0x${(c.panId ?? 0).toString(16).padStart(4, "0")}` : "network: down";
  net.className = "pill" + (c.networkUp ? " on" : "");
  const pj = $("#join-pill");
  pj.textContent = c.permitJoin ? "permit join: open" : "permit join: closed";
  pj.className = "pill" + (c.permitJoin ? " hot" : "");
}

// Per-viewer conveniences (view, traffic panel, recent profiles). Browser storage
// may be unavailable (private window, blocked site data): everything works without it.
const Prefs = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(`zigemu.${key}`);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`zigemu.${key}`, JSON.stringify(value));
    } catch {
      /* not persisted */
    }
  },
};

// Device picture from the profile (Zigbee2MQTT's device image), with a type icon as fallback.
const TYPE_ICONS = {
  Remote: "dial", "Smart plug": "plug", Light: "bulb", "Contact sensor": "door", "Presence sensor": "person",
  "Water valve": "valve", Thermostat: "thermometer", Switch: "switch",
  Cover: "cover", "Temperature sensor": "thermometer", "Smoke detector": "flame", "Air quality sensor": "cloud",
};
function deviceImage(info, cls = "thumb") {
  const box = document.createElement("span");
  box.className = cls;
  const fallback = () => {
    box.replaceChildren(icon(TYPE_ICONS[info?.type] ?? "dial"));
    box.classList.add("no-image");
  };
  if (info?.image) {
    const img = new Image();
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.onerror = fallback;
    img.src = info.image;
    box.append(img);
  } else {
    fallback();
  }
  return box;
}

// ---- view: cards or compact list
function applyView(view) {
  const grid = $("#devices");
  grid.classList.toggle("device-list", view === "list");
  grid.classList.toggle("device-grid", view !== "list");
  for (const b of document.querySelectorAll(".view-toggle .seg-btn")) {
    const on = b.dataset.view === view;
    b.classList.toggle("on", on);
    b.setAttribute("aria-checked", String(on));
  }
}
for (const b of document.querySelectorAll(".view-toggle .seg-btn")) {
  b.addEventListener("click", () => {
    Prefs.set("view", b.dataset.view);
    applyView(b.dataset.view);
  });
}
applyView(Prefs.get("view", "cards"));

function renderDevices() {
  const grid = $("#devices");
  const existing = new Map([...grid.children].map((el) => [el.dataset.ieee, el]));
  for (const dev of state.devices) {
    let card = existing.get(dev.ieee);
    if (!card) {
      card = buildCard(dev);
      grid.append(card);
    }
    existing.delete(dev.ieee);
    updateCard(card, dev);
  }
  for (const el of existing.values()) if (el.classList.contains("card")) el.remove();
  $("#empty").hidden = state.devices.length > 0;
  Filters.apply();
}

function buildCard(dev) {
  const card = $("#device-tpl").content.firstElementChild.cloneNode(true);
  card.dataset.ieee = dev.ieee;
  $(".dev-model", card).textContent = [dev.info.vendor, dev.info.model].filter(Boolean).join(" ");
  $(".dev-model", card).title = dev.info.description ?? "";
  $(".dev-thumb", card).replaceWith(deviceImage(dev.info, "dev-thumb"));
  // Compact list: the whole left part of the row (chevron, picture, name, summary) expands / collapses it.
  $(".card-head", card).addEventListener("click", (e) => {
    if (!card.closest(".device-list")) return;
    if (e.target.closest("button:not(.expand), a, input, select, .status, .tag-chips, .dev-name")) return;
    const open = card.classList.toggle("expanded");
    if (open) Activity.render(card);
    $(".expand", card).setAttribute("aria-expanded", String(open));
    $(".expand", card).title = open ? "Hide controls" : "Show controls";
  });
  const controls = $(".controls", card);
  const indicators = $(".indicators", card);
  for (const ctrl of dev.controls.filter((c) => c.type === "indicator" && c.widget)) indicators.append(buildDisplay(ctrl));
  for (const ctrl of dev.controls.filter((c) => c.type === "indicator" && !c.widget)) {
    const item = document.createElement("div");
    item.className = "indicator";
    item.dataset.indicator = ctrl.id;
    item.innerHTML = '<span class="ind-dot"></span><span class="ind-label"></span><span class="ind-value"></span>';
    item.querySelector(".ind-label").textContent = ctrl.label;
    item.title = ctrl.comment ?? ctrl.label;
    indicators.append(item);
  }
  indicators.hidden = !indicators.children.length;
  // Consecutive plain push buttons are kept together (one column in the compact list).
  let group = null;
  for (const ctrl of dev.controls.filter((c) => c.type !== "indicator")) {
    const node = buildControl(dev, ctrl);
    if (ctrl.type === "button" && !isComponent(ctrl)) {
      if (!group) {
        group = Object.assign(document.createElement("div"), { className: "btn-group" });
        controls.append(group);
      }
      group.append(node);
    } else {
      group = null;
      controls.append(node);
    }
  }
  const ieee = dev.ieee;
  const cur = () => state.devices.find((d) => d.ieee === ieee) ?? dev;
  $(".pair", card).addEventListener("click", () => {
    const d = cur();
    if (d.joined) return api(`/devices/${ieee}/join`, { method: "POST" }).catch(() => {});
    api(`/devices/${ieee}/pairing`, { method: "POST", body: { enabled: !d.pairing } }).catch(() => {});
  });
  $(".info", card).addEventListener("click", () => Info.open(ieee));
  $(".activity-clear", card).addEventListener("click", () => Activity.clear(card));
  $(".tag-chips", card).addEventListener("click", () => Info.open(ieee, "tags"));
  const nameEl = $(".dev-name", card);
  nameEl.addEventListener("click", (e) => {
    e.stopPropagation();
    InlineRename.start(nameEl, cur());
  });
  nameEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === "F2") {
      e.preventDefault();
      InlineRename.start(nameEl, cur());
    }
  });
  $(".pair-big", card).addEventListener("click", (e) => {
    e.stopPropagation();
    api(`/devices/${ieee}/pairing`, { method: "POST", body: { enabled: !cur().pairing } }).catch(() => {});
  });
  for (const b of card.querySelectorAll(".modebar .seg-btn")) {
    b.addEventListener("click", () => api(`/devices/${ieee}/mode`, { method: "POST", body: { mode: b.dataset.mode } }).catch(() => {}));
  }
  $(".record", card).addEventListener("click", async () => {
    const d = cur();
    if (!d.recording?.active) {
      await api(`/devices/${ieee}/recording`, { method: "POST", body: { action: "start" } }).catch(() => {});
      return;
    }
    try {
      const res = await api(`/devices/${ieee}/recording`, { method: "POST", body: { action: "stop" } });
      log({ type: "sys", ieee, summary: `recorded: ${res.description}` });
      Routines.openDraft(cur(), res.routine);
    } catch {
      /* shown in the traffic log */
    }
  });
  if (window.Routines) Routines.mount(card, ieee);
  return card;
}

function updateCard(card, dev) {
  if (!$(".dev-name", card).classList.contains("editing")) $(".dev-name", card).textContent = dev.name;
  const st = $(".status", card);
  st.dataset.until = dev.pairing ? String(Date.now() + dev.pairingRemaining * 1000) : "";
  st.className = "status" + (dev.joined ? " joined" : dev.pairing ? " pairing" : "");
  renderStatus(st, dev);
  const auto = dev.mode === "auto";
  for (const b of card.querySelectorAll(".modebar .seg-btn")) {
    const on = b.dataset.mode === dev.mode;
    b.classList.toggle("on", on);
    b.setAttribute("aria-checked", String(on));
  }
  $(".controls", card).hidden = auto;
  for (const el of card.querySelectorAll(".controls > .ctrl, .controls > .btn-group > .ctrl")) {
    const ctrl = dev.controls.find((c) => c.id === el.dataset.control);
    const usable = (dev.joined && dev.powered) || ctrl?.offline || ctrl?.power;
    el.classList.toggle("disabled", !usable);
    el.title = usable ? ctrl?.description ?? "" : !dev.powered ? "No power" : "Pair the device to use this control";
  }
  for (const [id, ind] of Object.entries(dev.indicators ?? {})) {
    const el = card.querySelector(`[data-indicator="${id}"]`);
    if (!el) continue;
    if (ind.light) {
      updateDisplay(el, ind);
      continue;
    }
    el.querySelector(".ind-value").textContent = ind.text;
    el.classList.toggle("on", ind.on === true);
    el.classList.toggle("blink", ind.text === "blinking");
    const dot = el.querySelector(".ind-dot");
    dot.style.visibility = ind.on === null && !ind.swatch ? "hidden" : "";
    dot.style.background = ind.swatch || "";
    dot.style.boxShadow = ind.swatch ? `0 0 10px ${ind.swatch}` : "";
    dot.classList.toggle("swatch", !!ind.swatch);
  }
  card.classList.toggle("unpowered", dev.powered === false);
  renderSummary($(".row-summary", card), dev);
  renderTagChips(card, dev);
  card.classList.toggle("proxied", !!dev.proxied);
  const unpaired = !dev.joined && !dev.proxied;
  card.classList.toggle("unpaired", unpaired);
  card.classList.toggle("pairing-now", unpaired && !!dev.pairing);
  $(".pair-big", card).textContent = dev.pairing ? "Stop pairing" : "Pair";
  $(".pair-note", card).textContent = dev.pairing ? "Pairing… open permit join in your Zigbee host" : "Not paired";
  $(".routines", card).hidden = !auto;
  const pair = $(".pair", card);
  pair.textContent = pairLabel(dev);
  pair.classList.toggle("primary", !dev.joined && !dev.pairing);
  pair.title = pairHelp(dev);
  if (Info.ieee === dev.ieee) Info.render(dev);
  if (window.Routines) Routines.update(card, dev);
  for (const ctrl of dev.controls.filter(isComponent)) {
    const el = card.querySelector(`[data-control="${ctrl.id}"]`);
    if (el) updateComponent(el, dev, ctrl);
  }
  const rec = $(".record", card);
  rec.hidden = auto;
  rec.classList.toggle("recording", !!dev.recording?.active);
  if (dev.recording?.active) {
    rec.dataset.since = rec.dataset.since || String(Date.now() - dev.recording.elapsed * 1000);
    rec.dataset.events = dev.recording.events;
    renderRecord(rec);
  } else {
    delete rec.dataset.since;
    rec.textContent = "● Rec";
  }
  for (const [id, value] of Object.entries(dev.controlState || {})) {
    const input = card.querySelector(`[data-control="${id}"] input[type=range]`);
    if (input && document.activeElement !== input) {
      input.value = value;
      input.nextElementSibling.textContent = value;
    }
  }
}

// One-line digest for the compact list, icon first:
// - states (outlined actuators, boolean indicators): the icon alone, colored by state;
// - readings and presets: icon + short value; light: a dot of its real color.
// The full "Label: value" is in each item's tooltip.
function renderSummary(box, dev) {
  const items = [];
  for (const ctrl of dev.controls.filter((c) => c.outline)) {
    const v = dev.controlValues?.[ctrl.id];
    const on = ctrl.type === "toggle" ? v === ctrl.states[1] : v === "on";
    const text = ctrl.stateLabels?.[ctrl.type === "toggle" ? v : on ? "on" : "off"] ?? v;
    items.push({ kind: `state ${on ? "on" : "off"}`, icon: ctrl.icon, title: `${ctrl.label}: ${text}` });
  }
  for (const ctrl of dev.controls.filter((c) => c.type === "indicator")) {
    const ind = dev.indicators?.[ctrl.id];
    if (!ind) continue;
    if (ind.light) {
      const l = ind.light;
      if (ctrl.widget === "brightness") {
        items.push({ kind: "reading", icon: "bulb", text: !l.powered ? "—" : l.on ? `${l.level} %` : "off", swatch: l.on ? l.css : null, title: `${ctrl.label}: ${ind.text}` });
      } else if (l.color) {
        items.push({ kind: "reading", icon: "palette", text: l.color.scale === "ct" ? `${l.color.kelvin} K` : `${l.color.hue}°`, swatch: l.color.css, title: `${ctrl.label}: ${ind.text}` });
      }
    } else if (ind.on !== null && ind.on !== undefined) {
      items.push({ kind: `flag ${ind.on ? "on" : "off"}`, icon: ctrl.icon, title: `${ctrl.label}: ${ind.text}`, blink: ind.text === "blinking" });
    } else {
      items.push({ kind: "reading", icon: ctrl.icon, text: ind.text, title: `${ctrl.label}: ${ind.text}` });
    }
  }
  for (const ctrl of dev.controls.filter((c) => c.type === "preset")) {
    const opt = ctrl.options.find((o) => o.id === dev.controlState?.[ctrl.id]);
    if (opt) items.push({ kind: "reading preset", icon: ctrl.icon, text: opt.label ?? opt.id, title: `${ctrl.label}: ${opt.label ?? opt.id}` });
  }
  const key = JSON.stringify(items);
  if (box.dataset.key === key) return;
  box.dataset.key = key;
  box.replaceChildren(
    ...items.map((it) => {
      const span = document.createElement("span");
      span.className = `sum ${it.kind}${it.blink ? " blink" : ""}${it.text === undefined ? " icon-only" : ""}`;
      span.title = it.title;
      span.setAttribute("role", "img");
      span.setAttribute("aria-label", it.title);
      if (it.swatch !== undefined) {
        const dot = document.createElement("i");
        dot.className = "sum-swatch";
        if (it.swatch) dot.style.background = it.swatch;
        span.append(dot);
      } else {
        span.append(icon(it.icon));
      }
      if (it.text !== undefined) span.append(Object.assign(document.createElement("span"), { className: "sum-text", textContent: it.text }));
      return span;
    }),
  );
}

function control(dev, ctrl, action, params = {}) {
  return api(`/devices/${dev.ieee}/control`, {
    method: "POST",
    body: { control: ctrl.id, action, ...params },
  }).catch(() => {});
}

// ------------------------------------------------------------ component library
// Inline stroke icons (24x24, currentColor) for the standard components.
const ICONS = {
  power: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  battery: '<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2"/><path d="M6 10v4M10 10v4"/>',
  plug: '<path d="M9 2v5M15 2v5"/><path d="M6 7h12v4a6 6 0 0 1-12 0z"/><path d="M12 17v5"/>',
  voltage: '<path d="M2 12h3l3-7 4 14 3-9 2 2h5"/>',
  thermometer: '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/>',
  cloud: '<path d="M17.5 19H8a5 5 0 1 1 .9-9.9A6 6 0 0 1 20 11a4 4 0 0 1-2.5 8z"/>',
  waves: '<path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  door: '<path d="M5 21V4a1 1 0 0 1 1-1h9v18"/><path d="M15 3l4 2v16"/><path d="M3 21h18"/><circle cx="12" cy="12" r=".8"/>',
  person: '<circle cx="12" cy="6" r="3"/><path d="M6 21v-4a6 6 0 0 1 12 0v4"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
  droplet: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  switch: '<rect x="7" y="2" width="10" height="20" rx="2"/><rect x="9.5" y="5" width="5" height="7" rx="1"/>',
  dial: '<circle cx="12" cy="12" r="8"/><path d="M12 4v5"/>',
  cover: '<path d="M4 3h16M5 3v14M19 3v14"/><path d="M5 7h14M5 11h14M5 15h14"/><path d="M12 17v4"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  meter: '<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-6"/><path d="M4 21h16"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M10 2h4"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8"/>',
  flame: '<path d="M12 22c4 0 7-2.8 7-7 0-3.5-2.5-6-4-8-.4 2.2-1.6 3.5-3 4 .3-3-1-6-4-9-.2 4-4 6.5-4 12 0 4.2 3.5 8 8 8z"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  bulb: '<path d="M9.5 21h5M9.5 18h5"/><path d="M8.6 15.4A6.5 6.5 0 1 1 15.4 15.4c-.6.6-.9 1.3-.9 2.1v.5h-5v-.5c0-.8-.3-1.5-.9-2.1z"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1 0-.9.7-1.5 1.6-1.5H16a5 5 0 0 0 5-5c0-4.3-4-7.8-9-7.8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  push: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5"/><path d="M8.5 9a4.5 4.5 0 1 0 7 0"/>',
  valve: '<path d="M3 14h4l2-2h6l2 2h4"/><path d="M3 18h18"/><path d="M12 12V7"/><path d="M8 5h8"/>',
};
const isComponent = (c) =>
  ["toggle", "preset", "stepper"].includes(c.type) || (c.type === "button" && "state" in c) || (c.type === "action" && !!c.icon);

// Press / hold behaviour shared by every physical push button.
function pressable(b, dev, ctrl) {
  b.title = "Click = press. Hold > " + (ctrl.holdDelay ?? 800) + " ms = hold.";
  let holdTimer;
  const down = (e) => {
    e.preventDefault();
    b.setPointerCapture?.(e.pointerId);
    b.classList.add("down");
    holdTimer = setTimeout(() => b.classList.add("held"), ctrl.holdDelay ?? 800);
    control(dev, ctrl, "down");
  };
  const up = () => {
    if (!b.classList.contains("down")) return;
    clearTimeout(holdTimer);
    b.classList.remove("down", "held");
    control(dev, ctrl, "up");
  };
  b.addEventListener("pointerdown", down);
  b.addEventListener("pointerup", up);
  b.addEventListener("pointercancel", up);
  b.addEventListener("lostpointercapture", up);
  return b;
}

// ---- read-only light displays (brightness bar, color strip)
function buildDisplay(ctrl) {
  const wrap = document.createElement("div");
  wrap.className = `comp comp-display display-${ctrl.widget}`;
  wrap.dataset.indicator = ctrl.id;
  const head = document.createElement("div");
  head.className = "comp-head";
  head.append(icon(ctrl.icon));
  head.append(
    Object.assign(document.createElement("span"), { className: "comp-label", textContent: ctrl.label }),
    Object.assign(document.createElement("span"), { className: "comp-value" }),
  );
  const track = document.createElement("div");
  track.className = "light-track";
  track.innerHTML = ctrl.widget === "brightness" ? '<span class="light-fill"></span>' : '<span class="light-marker"></span>';
  const widget = document.createElement("div");
  widget.className = "comp-widget";
  widget.append(track);
  wrap.append(head, widget);
  if (ctrl.description) wrap.title = ctrl.description;
  return wrap;
}

const CT_STRIP = "linear-gradient(90deg, #ff9329, #ffc58f, #fff4e5, #f4f8ff, #c9d9ff)";
const HUE_STRIP = "linear-gradient(90deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)";

function updateDisplay(el, ind) {
  const l = ind.light;
  const value = el.querySelector(".comp-value");
  const ic = el.querySelector(".comp-icon");
  const lit = l.on && l.powered;
  el.classList.toggle("on", lit);
  el.classList.toggle("blink", l.blinking);
  if (el.classList.contains("display-brightness")) {
    value.textContent = !l.powered ? "No power" : l.blinking ? "Identifying" : lit ? `${l.level} %` : "Off";
    const fill = el.querySelector(".light-fill");
    fill.style.width = `${l.level}%`;
    fill.style.background = lit ? `linear-gradient(90deg, #3a3a36, ${l.css})` : "";
    ic.style.color = lit ? l.css : "";
    ic.style.filter = lit ? `drop-shadow(0 0 ${2 + l.level / 12}px ${l.css})` : "";
  } else {
    const c = l.color;
    if (!c) return;
    const track = el.querySelector(".light-track");
    track.style.background = c.scale === "ct" ? CT_STRIP : HUE_STRIP;
    const x = c.scale === "ct" ? 1 - c.pos : c.pos; // warm on the left
    const marker = el.querySelector(".light-marker");
    marker.style.left = `${(x * 100).toFixed(1)}%`;
    marker.style.background = c.css;
    value.textContent = c.scale === "ct" ? `${c.kelvin} K` : `${c.hue}° · ${c.sat} %`;
    track.title = c.scale === "ct" ? `${c.minK} K – ${c.maxK} K` : c.mode === "xy" ? ind.text : `hue ${c.hue}°, saturation ${c.sat} %`;
  }
}
function icon(name) {
  const span = document.createElement("span");
  span.className = "comp-icon";
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] ?? ICONS.dial}</svg>`;
  return span;
}

// One row layout for every standard component: icon · label · value ……… widget
function buildComponent(dev, ctrl) {
  const wrap = document.createElement("div");
  const stateful = !!ctrl.outline;
  wrap.className = `ctrl comp comp-${ctrl.type}${stateful ? " stateful" : ""}`;
  wrap.dataset.control = ctrl.id;
  const head = document.createElement("div");
  head.className = "comp-head";
  head.append(icon(ctrl.icon));
  const label = Object.assign(document.createElement("span"), { className: "comp-label", textContent: ctrl.label });
  const value = Object.assign(document.createElement("span"), { className: "comp-value preset-value" });
  head.append(label, value);
  wrap.append(head);
  const widget = document.createElement("div");
  widget.className = "comp-widget";
  if (ctrl.type === "toggle") {
    const sw = document.createElement("button");
    sw.type = "button";
    sw.className = "switch-btn";
    sw.setAttribute("role", "switch");
    sw.setAttribute("aria-label", ctrl.label);
    sw.addEventListener("click", () => control(dev, ctrl, "toggle"));
    widget.append(sw);
  } else if (ctrl.type === "preset") {
    const seg = document.createElement("div");
    seg.className = "seg preset";
    seg.setAttribute("role", "radiogroup");
    seg.setAttribute("aria-label", ctrl.label);
    for (const opt of ctrl.options) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "seg-btn";
      b.dataset.option = opt.id;
      b.setAttribute("role", "radio");
      b.textContent = opt.label ?? opt.id;
      b.title = opt.range ? `${opt.range[0]}–${opt.range[1]} ${ctrl.unit ?? ""}, fluctuating` : `${opt.value} ${ctrl.unit ?? ""}`;
      b.addEventListener("click", () => control(dev, ctrl, "select", { option: opt.id }));
      seg.append(b);
    }
    widget.append(seg);
  } else if (ctrl.type === "button") {
    const b = Object.assign(document.createElement("button"), { type: "button", className: "push-btn" });
    b.setAttribute("aria-label", ctrl.label);
    b.append(icon(ctrl.icon));
    widget.append(pressable(b, dev, ctrl));
  } else if (ctrl.type === "action") {
    const seg = document.createElement("div");
    seg.className = "seg actions";
    for (const ev of Object.keys(ctrl.on ?? {})) {
      const b = Object.assign(document.createElement("button"), { type: "button", className: "seg-btn", textContent: ctrl.actionLabels?.[ev] ?? ev });
      b.setAttribute("aria-label", `${ctrl.label}: ${ctrl.actionLabels?.[ev] ?? ev}`);
      b.addEventListener("click", () => control(dev, ctrl, ev));
      seg.append(b);
    }
    widget.append(seg);
  } else if (ctrl.type === "stepper") {
    for (const [dir, text] of [["down", "−"], ["up", "+"]]) {
      const b = Object.assign(document.createElement("button"), { type: "button", className: "btn step-btn", textContent: text });
      b.setAttribute("aria-label", `${ctrl.label} ${dir}`);
      b.addEventListener("click", () => control(dev, ctrl, dir));
      widget.append(b);
    }
  }
  wrap.append(widget);
  if (ctrl.description) wrap.title = ctrl.description;
  return wrap;
}

function updateComponent(el, dev, ctrl) {
  const value = el.querySelector(".comp-value");
  if (ctrl.type === "button") {
    const on = dev.controlValues?.[ctrl.id] === "on";
    const text = ctrl.stateLabels?.[on ? "on" : "off"] ?? (on ? "On" : "Off");
    value.textContent = text;
    el.classList.toggle("on", on);
    el.classList.toggle("off", !on);
    el.querySelector(".push-btn").setAttribute("aria-description", `${ctrl.label}: ${text}`);
  } else if (ctrl.type === "toggle") {
    const state = dev.controlValues?.[ctrl.id] ?? ctrl.states[0];
    const on = state === ctrl.states[1];
    const sw = el.querySelector(".switch-btn");
    sw.setAttribute("aria-checked", String(on));
    sw.title = `${ctrl.label}: ${ctrl.stateLabels?.[state] ?? state}`;
    value.textContent = ctrl.stateLabels?.[state] ?? state;
    el.classList.toggle("on", on);
    el.classList.toggle("off", !on);
  } else if (ctrl.type === "preset") {
    const current = dev.controlState?.[ctrl.id];
    for (const b of el.querySelectorAll(".seg-btn")) {
      const on = b.dataset.option === current;
      b.classList.toggle("on", on);
      b.setAttribute("aria-checked", String(on));
    }
    const v = dev.controlValues?.[ctrl.id];
    value.textContent = v === undefined || v === null ? "" : `${v} ${ctrl.unit ?? ""}`;
  }
}

function buildControl(dev, ctrl) {
  if (isComponent(ctrl)) return buildComponent(dev, ctrl);
  const wrap = document.createElement("div");
  wrap.className = "ctrl";
  wrap.dataset.control = ctrl.id;
  const label = document.createElement("span");
  label.className = "ctrl-label";
  label.textContent = ctrl.label;
  if (ctrl.type === "button") label.hidden = true;
  wrap.append(label);

  if (ctrl.type === "button") {
    const b = document.createElement("button");
    b.className = "hw-btn";
    b.type = "button";
    b.textContent = ctrl.label;
    wrap.append(pressable(b, dev, ctrl));
  } else if (ctrl.type === "dial") {
    wrap.classList.add("wide");
    const row = document.createElement("div");
    row.className = "dial-wrap";
    const knob = document.createElement("div");
    knob.className = "knob";
    knob.title = "Drag around to rotate";
    let angle = 0;
    let last = null;
    let pending = 0;
    let flushTimer = null;
    const flush = () => {
      flushTimer = null;
      const steps = Math.round(pending);
      if (steps !== 0) {
        pending -= steps;
        control(dev, ctrl, "rotate", { steps });
      }
    };
    const pt = (e) => {
      const r = knob.getBoundingClientRect();
      return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
    };
    knob.addEventListener("pointerdown", (e) => {
      knob.setPointerCapture(e.pointerId);
      knob.classList.add("grab");
      last = pt(e);
    });
    knob.addEventListener("pointermove", (e) => {
      if (last === null) return;
      const a = pt(e);
      let d = a - last;
      if (d > Math.PI) d -= 2 * Math.PI;
      if (d < -Math.PI) d += 2 * Math.PI;
      last = a;
      angle += d;
      knob.style.transform = `rotate(${angle}rad)`;
      pending += (d * 180) / Math.PI / 3; // ~1 step per 3 degrees
      if (!flushTimer) flushTimer = setTimeout(flush, 250); // real device reports ~4x/s
    });
    const end = () => {
      last = null;
      knob.classList.remove("grab");
    };
    knob.addEventListener("pointerup", end);
    knob.addEventListener("pointercancel", end);
    row.append(knob);

    const presets = document.createElement("div");
    presets.className = "presets";
    for (const p of ctrl.presets ?? [{ label: "step", steps: 10 }]) {
      for (const dir of [-1, 1]) {
        const b = document.createElement("button");
        b.className = "btn";
        b.type = "button";
        b.textContent = `${dir < 0 ? "⟲" : "⟳"} ${p.label}`;
        b.addEventListener("click", () => {
          angle += (dir * p.steps * 3 * Math.PI) / 180;
          knob.style.transform = `rotate(${angle}rad)`;
          control(dev, ctrl, "rotate", { steps: dir * p.steps });
        });
        presets.append(b);
      }
    }
    row.append(presets);
    wrap.append(row);
  } else if (ctrl.type === "range") {
    wrap.classList.add("wide");
    const row = document.createElement("div");
    row.className = "range-row";
    const input = document.createElement("input");
    input.type = "range";
    input.min = ctrl.min ?? 0;
    input.max = ctrl.max ?? 100;
    input.step = ctrl.step ?? 1;
    input.value = dev.controlState?.[ctrl.id] ?? ctrl.default ?? ctrl.min ?? 0;
    const val = document.createElement("span");
    val.className = "range-val";
    val.textContent = input.value;
    input.addEventListener("input", () => (val.textContent = input.value));
    input.addEventListener("change", () => control(dev, ctrl, "set", { value: Number(input.value) }));
    row.append(input, val);
    wrap.append(row);
  } else if (ctrl.type === "action") {
    wrap.classList.add("wide");
    const row = document.createElement("div");
    row.className = "presets";
    for (const ev of Object.keys(ctrl.on ?? {})) {
      const b = document.createElement("button");
      b.className = "btn";
      b.type = "button";
      b.textContent = ev;
      b.addEventListener("click", () => control(dev, ctrl, ev));
      row.append(b);
    }
    wrap.append(row);
  }
  if (ctrl.description) label.title = ctrl.description;
  return wrap;
}

function renderStatus(st, dev) {
  if (dev.proxied) st.textContent = dev.joined ? "real" : "left";
  else if (dev.powered === false) st.textContent = "no power";
  else if (dev.joined) st.textContent = "joined";
  else if (st.dataset.until) {
    const s = Math.max(0, Math.round((Number(st.dataset.until) - Date.now()) / 1000));
    st.textContent = `pairing… ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  } else st.textContent = "not paired";
}
setInterval(() => {
  for (const st of document.querySelectorAll(".status.pairing")) {
    const dev = state.devices.find((d) => d.ieee === st.closest(".card").dataset.ieee);
    if (dev) renderStatus(st, dev);
  }
}, 1000);

function renderRecord(btn) {
  const s = Math.max(0, Math.round((Date.now() - Number(btn.dataset.since)) / 1000));
  const n = Number(btn.dataset.events || 0);
  btn.textContent = `■ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} · ${n}`;
  btn.title = `Recording: ${n} action${n === 1 ? "" : "s"}. Click to stop and open the routine.`;
}
setInterval(() => document.querySelectorAll(".record.recording").forEach(renderRecord), 1000);

const pairLabel = (dev) => (dev.joined ? "Re-pair" : dev.pairing ? "Stop pairing" : "Pair");
const pairHelp = (dev) =>
  dev.joined
    ? "Unsecured rejoin + announce: lets a host that lost its database rediscover the device."
    : dev.pairing
      ? "Stop looking for a network."
      : "Look for a network that permits joining (like holding the setup button).";

// Device info modal: everything that doesn't need to be on the card.
// ---- tag editor: chips + input with autocomplete; Enter / comma / Tab picks or creates.
// value(): ids of existing tags and names of new ones (the server creates them).
function TagEditor(root, { onChange = null } = {}) {
  root.classList.add("tag-editor");
  root.innerHTML = '<div class="te-chips"></div><input class="te-input" placeholder="Add a tag…" autocomplete="off" data-1p-ignore data-lpignore="true" aria-label="Add a tag"><div class="te-menu" role="listbox" hidden></div>';
  const chips = root.querySelector(".te-chips");
  const input = root.querySelector(".te-input");
  const menu = root.querySelector(".te-menu");
  let items = []; // [{id?, name}]
  let active = 0;
  let typing = false;

  const labelOf = (it) => (it.id ? tagOf(it.id)?.name ?? it.name : it.name);
  const render = () => {
    // a tag created on the fly by the server: adopt its id (and color) as soon as it exists
    for (const it of items) {
      if (!it.id) {
        const t = state.settings.tags.find((x) => fold(x.name) === fold(it.name));
        if (t) it.id = t.id;
      }
    }
    chips.replaceChildren(
      ...items.map((it, i) => {
        const tag = it.id ? tagOf(it.id) : null;
        const chip = tagChip(tag ?? { name: it.name, color: "slate" });
        if (!tag) chip.classList.add("new");
        chip.title = tag ? tag.name : `${it.name} (new tag)`;
        const x = Object.assign(document.createElement("button"), { type: "button", className: "te-x", textContent: "✕" });
        x.setAttribute("aria-label", `Remove tag ${labelOf(it)}`);
        x.addEventListener("click", (e) => {
          e.preventDefault();
          items.splice(i, 1);
          changed();
        });
        chip.append(x);
        return chip;
      }),
    );
  };
  const changed = () => {
    render();
    onChange?.(value());
  };
  const value = () => items.map((it) => it.id ?? it.name);
  const suggestions = () => {
    const q = fold(input.value.trim());
    const taken = new Set(items.map((it) => it.id).filter(Boolean));
    const list = state.settings.tags.filter((t) => !taken.has(t.id) && (!q || fold(t.name).includes(q)));
    const exact = state.settings.tags.some((t) => fold(t.name) === q) || items.some((it) => fold(labelOf(it)) === q);
    const out = list.slice(0, 8).map((t) => ({ id: t.id, name: t.name }));
    if (q && !exact) out.push({ create: true, name: input.value.trim().slice(0, 40) });
    return out;
  };
  const showMenu = () => {
    const sug = suggestions();
    active = Math.min(active, Math.max(0, sug.length - 1));
    menu.replaceChildren(
      ...sug.map((sg, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "te-opt" + (i === active ? " on" : "");
        b.setAttribute("role", "option");
        if (sg.create) b.textContent = `Create tag “${sg.name}”`;
        else b.append(tagChip(tagOf(sg.id)));
        b.addEventListener("mousedown", (e) => {
          e.preventDefault();
          pick(sg);
        });
        return b;
      }),
    );
    menu.hidden = !sug.length || document.activeElement !== input;
  };
  const pick = (sg) => {
    if (!sg) return;
    const name = sg.name.trim();
    if (!name) return;
    const existing = sg.id ? sg : state.settings.tags.find((t) => fold(t.name) === fold(name));
    const item = existing ? { id: existing.id, name: existing.name } : { name };
    if (!items.some((it) => (item.id ? it.id === item.id : fold(labelOf(it)) === fold(name)))) items.push(item);
    input.value = "";
    active = 0;
    changed();
    showMenu();
  };
  input.addEventListener("input", () => {
    typing = true;
    active = 0;
    showMenu();
  });
  input.addEventListener("focus", showMenu);
  input.addEventListener("blur", () => {
    typing = false;
    setTimeout(() => (menu.hidden = true), 100);
  });
  input.addEventListener("keydown", (e) => {
    const sug = suggestions();
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      active = (active + (e.key === "ArrowDown" ? 1 : sug.length - 1)) % Math.max(1, sug.length);
      showMenu();
    } else if (e.key === "Enter" || e.key === "," || (e.key === "Tab" && input.value.trim())) {
      if (!input.value.trim() && e.key === "Enter") return; // let the form handle it
      e.preventDefault();
      e.stopPropagation();
      pick(input.value.trim() ? sug[active] ?? { create: true, name: input.value.trim() } : null);
    } else if (e.key === "Backspace" && !input.value && items.length) {
      items.pop();
      changed();
    } else if (e.key === "Escape" && !menu.hidden) {
      e.preventDefault();
      e.stopPropagation();
      menu.hidden = true;
    }
  });
  root.addEventListener("click", (e) => {
    if (e.target === root || e.target === chips) input.focus();
  });
  return {
    value,
    set(tags) {
      items = (tags ?? []).map((t) => (tagOf(t) ? { id: t, name: tagOf(t).name } : { name: String(t) }));
      render();
    },
    focus: () => input.focus(),
    busy: () => typing || document.activeElement === input,
    refresh: render,
  };
}

// ---- rename in place: click a device's name
const InlineRename = {
  start(el, dev) {
    if (!dev || el.classList.contains("editing")) return;
    const input = Object.assign(document.createElement("input"), { className: "rename-input", value: dev.name, maxLength: 60 });
    input.setAttribute("aria-label", "Device name");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("data-1p-ignore", "");
    el.classList.add("editing");
    el.replaceChildren(input);
    input.focus();
    input.select();
    let done = false;
    const finish = (save) => {
      if (done) return;
      done = true;
      const v = input.value.trim();
      el.classList.remove("editing");
      el.textContent = save && v ? v : dev.name;
      if (save && v && v !== dev.name) api(`/devices/${dev.ieee}/rename`, { method: "POST", body: { name: v } }).catch(() => (el.textContent = dev.name));
    };
    input.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") finish(true);
      else if (e.key === "Escape") {
        e.preventDefault();
        finish(false);
      }
    });
    input.addEventListener("click", (e) => e.stopPropagation());
    input.addEventListener("blur", () => finish(true));
  },
};

const Info = (() => {
  const dlg = document.getElementById("device-info");
  const api_ = { ieee: null };
  const dev = () => state.devices.find((d) => d.ieee === api_.ieee);
  const pairBtn = dlg.querySelector(".i-pair");

  pairBtn.addEventListener("click", () => {
    const d = dev();
    if (!d) return;
    if (d.joined) api(`/devices/${d.ieee}/join`, { method: "POST" }).catch(() => {});
    else api(`/devices/${d.ieee}/pairing`, { method: "POST", body: { enabled: !d.pairing } }).catch(() => {});
  });
  dlg.querySelector(".i-leave").addEventListener("click", () => api(`/devices/${api_.ieee}/leave`, { method: "POST" }).catch(() => {}));
  confirmClick(dlg.querySelector(".i-reset"), "Confirm reset", () =>
    api(`/devices/${api_.ieee}/reset`, { method: "POST", body: { pair: true } }).catch(() => {}),
  );
  confirmClick(dlg.querySelector(".i-remove"), "Confirm remove", async () => {
    await api(`/devices/${api_.ieee}`, { method: "DELETE" }).catch(() => {});
    dlg.close();
  });
  dlg.addEventListener("close", () => (api_.ieee = null));
  const nameInput = dlg.querySelector(".i-name");
  const saveName = () => {
    const d = dev();
    const v = nameInput.value.trim();
    if (!d) return;
    if (!v) nameInput.value = d.name;
    else if (v !== d.name) api(`/devices/${d.ieee}/rename`, { method: "POST", body: { name: v } }).catch(() => (nameInput.value = d.name));
  };
  nameInput.addEventListener("change", saveName);
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveName();
      nameInput.blur();
    }
  });
  api_.tags = TagEditor(dlg.querySelector(".i-tags"), {
    onChange: (tags) => {
      const d = dev();
      if (d) api(`/devices/${d.ieee}/tags`, { method: "POST", body: { tags } }).catch(() => {});
    },
  });

  const fact = (dl, k, v) => {
    if (v === undefined || v === null || v === "") return;
    dl.append(Object.assign(document.createElement("dt"), { textContent: k }), Object.assign(document.createElement("dd"), { textContent: v }));
  };

  api_.render = (d) => {
    dlg.querySelector(".info-name").textContent = d.name;
    if (document.activeElement !== nameInput) nameInput.value = d.name;
    if (!api_.tags.busy()) api_.tags.set(d.tags ?? []);
    else api_.tags.refresh();
    dlg.querySelector(".info-model").textContent = [d.info.vendor, d.info.model, d.info.description].filter(Boolean).join(" · ");
    const facts = dlg.querySelector(".info-facts");
    facts.replaceChildren();
    fact(facts, "Status", [d.powered === false ? "no power" : null, d.joined ? "joined" : d.pairing ? "pairing" : "not paired"].filter(Boolean).join(", "));
    fact(facts, "IEEE", d.ieee);
    fact(facts, "NWK", d.nwk);
    if (!d.proxied) fact(facts, "Mode", d.mode);
    fact(facts, "Profile", d.profile);
    const groups = Object.entries(d.groups ?? {}).map(([ep, gs]) => `ep ${ep}: ${gs.map((g) => "0x" + Number(g).toString(16).padStart(4, "0")).join(", ")}`);
    fact(facts, "Groups", groups.join(" · "));
    const ctrls = dlg.querySelector(".info-controls");
    ctrls.replaceChildren();
    for (const c of d.controls) {
      let text = c.description ?? c.comment ?? "";
      if (c.type === "toggle") text = [text, c.states.map((st) => c.stateLabels?.[st] ?? st).join(" / ")].filter(Boolean).join(" ");
      if (c.type === "preset") {
        const opts = c.options.map((o) => `${o.label ?? o.id}: ${o.range ? `${o.range[0]}–${o.range[1]}` : o.value}${c.unit ? " " + c.unit : ""}${o.range ? " (fluctuating)" : ""}`);
        text = [text, opts.join(" · ")].filter(Boolean).join(" ");
      }
      if (text) fact(ctrls, c.label, text);
    }
    dlg.querySelector(".info-controls-section").hidden = !ctrls.children.length;
    pairBtn.textContent = pairLabel(d);
    dlg.querySelector(".i-pair-help").textContent = pairHelp(d);
    dlg.querySelector(".i-leave").disabled = !d.joined;
    const links = dlg.querySelector(".info-links");
    links.replaceChildren(
      ...(d.info.links ?? []).map((l) => Object.assign(document.createElement("a"), { href: l.url, target: "_blank", rel: "noopener", textContent: `${l.label} ↗` })),
    );
    dlg.querySelector(".info-links-section").hidden = !links.children.length;
    Capture.render(dlg, d);
  };

  api_.open = (ieee, focus = null) => {
    api_.ieee = ieee;
    const d = dev();
    if (!d) return;
    api_.render(d);
    dlg.showModal();
    if (focus === "tags") api_.tags.focus();
    else if (focus === "name") nameInput.select();
  };
  return api_;
})();

// Two-step confirmation without browser dialogs.
function confirmClick(btn, confirmLabel, action) {
  const label = btn.textContent;
  let timer;
  btn.addEventListener("click", () => {
    if (btn.dataset.armed) {
      clearTimeout(timer);
      delete btn.dataset.armed;
      btn.textContent = label;
      action();
      return;
    }
    btn.dataset.armed = "1";
    btn.textContent = confirmLabel + "?";
    timer = setTimeout(() => {
      delete btn.dataset.armed;
      btn.textContent = label;
    }, 3000);
  });
}

// ---------------------------------------------------------------- traffic log
function log(ev) {
  if (ev.ieee) Activity.add(ev);
  if (ev.type === "rx" && !$("#log-rx").checked) return;
  if (ev.type === "tx" && !$("#log-tx").checked) return;
  const list = $("#log");
  const li = document.createElement("li");
  const t = new Date().toLocaleTimeString([], { hour12: false });
  const dir = ev.type === "tx" || ev.type === "rx" ? ev.type : "sys";
  const dev = state.devices.find((d) => d.ieee === ev.ieee);
  const who = dev ? dev.name : ev.ieee ?? "";
  li.innerHTML = `<span class="t"></span><span class="dir ${dir}"></span><span class="body"></span>`;
  li.children[0].textContent = t;
  li.children[1].textContent = dir === "sys" ? "•" : dir === "tx" ? "→" : "←";
  const body = li.children[2];
  const head = document.createElement("div");
  head.textContent = [who, ev.cluster, ev.summary].filter(Boolean).join(" · ");
  body.append(head);
  if (ev.payload) {
    const hex = document.createElement("div");
    hex.className = "hex";
    hex.textContent = ev.payload;
    body.append(hex);
  }
  list.prepend(li);
  while (list.children.length > 400) list.lastChild.remove();
  if (Traffic.collapsed) Traffic.bump();
}

// ---- per-device activity (right half of an expanded row in the compact list)
const Activity = {
  max: 200,
  byDevice: new Map(), // ieee -> [{t, dir, text, payload}] newest first

  add(ev) {
    const dir = ev.type === "tx" || ev.type === "rx" ? ev.type : "sys";
    const entry = { t: new Date().toLocaleTimeString([], { hour12: false }), dir, text: [ev.cluster, ev.summary].filter(Boolean).join(" · "), payload: ev.payload };
    const list = this.byDevice.get(ev.ieee) ?? [];
    list.unshift(entry);
    if (list.length > this.max) list.length = this.max;
    this.byDevice.set(ev.ieee, list);
    const card = document.querySelector(`#devices .card[data-ieee="${ev.ieee}"]`);
    if (card?.classList.contains("expanded")) {
      const ol = $(".activity-list", card);
      ol.prepend(this.item(entry));
      while (ol.children.length > this.max) ol.lastChild.remove();
      this.counts(card, list);
    }
  },

  item(e) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="t"></span><span class="dir ${e.dir}"></span><span class="body"><div></div></span>`;
    li.children[0].textContent = e.t;
    li.children[1].textContent = e.dir === "sys" ? "•" : e.dir === "tx" ? "→" : "←";
    li.children[1].title = e.dir === "tx" ? "sent by the device" : e.dir === "rx" ? "received by the device" : "";
    li.querySelector(".body > div").textContent = e.text;
    if (e.payload) li.querySelector(".body").append(Object.assign(document.createElement("div"), { className: "hex", textContent: e.payload }));
    return li;
  },

  counts(card, list) {
    $(".activity-count", card).textContent = list.length ? String(list.length) : "";
    $(".activity-empty", card).hidden = list.length > 0;
  },

  render(card) {
    const list = this.byDevice.get(card.dataset.ieee) ?? [];
    $(".activity-list", card).replaceChildren(...list.map((e) => this.item(e)));
    this.counts(card, list);
  },

  clear(card) {
    this.byDevice.delete(card.dataset.ieee);
    this.render(card);
  },
};

// ---- traffic panel: collapse / expand
const Traffic = {
  collapsed: false,
  unseen: 0,
  set(collapsed) {
    this.collapsed = collapsed;
    Prefs.set("trafficCollapsed", collapsed);
    $(".layout").classList.toggle("log-collapsed", collapsed);
    $("#traffic").classList.toggle("collapsed", collapsed);
    this.unseen = 0;
    this.render();
  },
  bump() {
    this.unseen += 1;
    this.render();
  },
  render() {
    const badge = $("#log-unseen");
    badge.hidden = !this.unseen;
    badge.textContent = this.unseen > 99 ? "99+" : String(this.unseen);
    $("#log-expand").title = this.unseen ? `Show traffic (${this.unseen} new)` : "Show traffic";
  },
};
$("#log-collapse").addEventListener("click", () => Traffic.set(true));
$("#log-expand").addEventListener("click", () => Traffic.set(false));
Traffic.set(Prefs.get("trafficCollapsed", false));

// ---------------------------------------------------------------- wiring
async function refresh() {
  await Coordinators.load();
  if (!state.cid) return;
  let data;
  try {
    data = await api("/state");
  } catch {
    Coordinators.showBanner();
    return;
  }
  Coordinators.showBanner();
  state.coordinator = data.coordinator;
  state.devices = data.devices;
  if (data.settings) state.settings = data.settings;
  if (data.tagUsage) state.tagUsage = data.tagUsage;
  if (JSON.stringify(state.profiles) !== JSON.stringify(data.profiles)) {
    state.profiles = data.profiles;
    if (AddDevice.dialog.open) AddDevice.render();
  }
  if (Settings.dialog.open) Settings.render();
  renderCoordinator();
  renderDevices();
}

function connectWs() {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  const ws = new WebSocket(`${proto}://${location.host}${API}/ws`);
  ws.onopen = async () => {
    const token = await authToken();
    if (token) ws.send(JSON.stringify({ type: "auth", access_token: token }));
  };
  ws.onmessage = (m) => {
    const ev = JSON.parse(m.data);
    if (ev.type === "auth_ok") return;
    if (ev.type === "auth_invalid") {
      log({ type: "sys", summary: "live updates refused: ZigEmu requires a Home Assistant administrator" });
      return;
    }
    if (ev.type === "coordinators") {
      Coordinators.set(ev.coordinators);
      return;
    }
    if (ev.cid && ev.cid !== state.cid) return; // another coordinator's event
    if (ev.type === "state") {
      if (ev.settings) state.settings = { ...state.settings, ...ev.settings };
      if (ev.tagUsage) state.tagUsage = ev.tagUsage;
      state.coordinator = ev.coordinator;
      state.devices = ev.devices;
      renderCoordinator();
      renderDevices();
    } else {
      log(ev);
    }
  };
  ws.onclose = () => setTimeout(connectWs, 2000);
}

// ---------------------------------------------------------------- add device
// Search by brand, model and type; filter chips; recently used profiles first.
const fold = (t) => String(t ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const AddDevice = {
  dialog: $("#add-dialog"),
  type: null,
  vendor: null,
  picked: null,
  results: [],

  open() {
    this.type = this.vendor = this.picked = null;
    $("#add-search").value = "";
    $("#name-input").value = "";
    this.tags.set([]);
    this.render();
    this.dialog.showModal();
    $("#name-input").focus(); // name and tags first, then the profile
  },

  recent() {
    const ids = [...Prefs.get("recentProfiles", [])];
    for (const d of [...state.devices].reverse()) if (!ids.includes(d.profile)) ids.push(d.profile);
    return ids.map((id) => state.profiles.find((p) => p.id === id && p.enabled !== false)).filter(Boolean).slice(0, 4);
  },

  remember(id) {
    Prefs.set("recentProfiles", [id, ...Prefs.get("recentProfiles", []).filter((x) => x !== id)].slice(0, 8));
  },

  // Every word must match somewhere; model / brand / type hits rank higher than description hits.
  score(p, words) {
    const i = p.info ?? {};
    const fields = { model: fold(i.model), vendor: fold(i.vendor), type: fold(i.type), name: fold(p.name), desc: fold(i.description), id: fold(p.id) };
    let total = 0;
    for (const w of words) {
      let best = 0;
      if (fields.model === w) best = 100;
      else if (fields.model.startsWith(w)) best = 60;
      else if (fields.vendor.startsWith(w)) best = 50;
      else if (fields.type.split(" ").some((t) => t.startsWith(w))) best = 45;
      else if (fields.model.includes(w)) best = 35;
      else if (fields.name.includes(w) || fields.id.includes(w)) best = 20;
      else if (fields.desc.includes(w) || fields.type.includes(w) || fields.vendor.includes(w)) best = 10;
      if (!best) return 0;
      total += best;
    }
    return total || 1;
  },

  filtered() {
    const words = fold($("#add-search").value).split(/\s+/).filter(Boolean);
    return state.profiles
      .filter((p) => p.enabled !== false)
      .filter((p) => (!this.type || p.info?.type === this.type) && (!this.vendor || p.info?.vendor === this.vendor))
      .map((p) => ({ p, s: this.score(p, words) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || fold(a.p.info?.vendor).localeCompare(fold(b.p.info?.vendor)) || fold(a.p.info?.model).localeCompare(fold(b.p.info?.model)))
      .map((r) => r.p);
  },

  chips(box, key, values) {
    box.replaceChildren(
      ...values.map(([value, count]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (this[key] === value ? " on" : "");
        b.setAttribute("aria-pressed", String(this[key] === value));
        b.innerHTML = '<span></span><small></small>';
        b.firstChild.textContent = value;
        b.lastChild.textContent = count;
        b.addEventListener("click", () => {
          this[key] = this[key] === value ? null : value;
          this.render();
        });
        return b;
      }),
    );
  },

  tile(p, small = false) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "profile-tile" + (small ? " small" : "") + (this.picked === p.id ? " on" : "");
    b.dataset.profile = p.id;
    b.setAttribute("role", "option");
    b.setAttribute("aria-selected", String(this.picked === p.id));
    b.append(deviceImage(p.info, "tile-img"));
    const text = document.createElement("span");
    text.className = "tile-text";
    text.innerHTML = '<span class="tile-vendor"></span><span class="tile-model"></span><span class="tile-desc"></span>';
    text.children[0].textContent = p.info?.vendor ?? "";
    text.children[1].textContent = p.info?.model ?? p.name;
    text.children[2].textContent = p.info?.description ?? p.name;
    b.title = `${p.info?.vendor ?? ""} ${p.info?.model ?? ""} — ${p.info?.description ?? p.name}`;
    b.append(text);
    if (p.info?.type && !small) b.append(Object.assign(document.createElement("span"), { className: "tile-type", textContent: p.info.type }));
    b.addEventListener("click", () => this.pick(p.id));
    b.addEventListener("dblclick", () => {
      this.pick(p.id);
      this.add();
    });
    return b;
  },

  render() {
    const count = (key) => {
      const m = new Map();
      for (const p of state.profiles) if (p.enabled !== false && p.info?.[key]) m.set(p.info[key], (m.get(p.info[key]) ?? 0) + 1);
      return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    };
    this.chips($("#add-types"), "type", count("type"));
    this.chips($("#add-vendors"), "vendor", count("vendor"));
    const searching = !!$("#add-search").value.trim() || this.type || this.vendor;
    const recent = this.recent();
    $("#add-recent-section").hidden = searching || !recent.length;
    $("#add-recent").replaceChildren(...recent.map((p) => this.tile(p, true)));
    this.results = this.filtered();
    $("#add-results-title").textContent = searching ? `${this.results.length} match${this.results.length === 1 ? "" : "es"}` : "All profiles";
    $("#add-results").replaceChildren(...this.results.map((p) => this.tile(p)));
    $("#add-none").hidden = this.results.length > 0;
    this.renderPicked();
  },

  pick(id) {
    this.picked = id;
    for (const t of this.dialog.querySelectorAll(".profile-tile")) {
      const on = t.dataset.profile === id;
      t.classList.toggle("on", on);
      t.setAttribute("aria-selected", String(on));
    }
    this.renderPicked();
  },

  renderPicked() {
    const p = state.profiles.find((x) => x.id === this.picked);
    $("#add-picked").textContent = p ? `${p.info?.vendor ?? ""} ${p.info?.model ?? p.name}`.trim() : "Pick a profile";
    $("#add-picked").classList.toggle("muted", !p);
    $("#add-confirm").disabled = !p;
    $("#name-input").placeholder = p ? `Name (default: ${p.name})` : "Name (optional)";
  },

  move(delta) {
    if (!this.results.length) return;
    const i = this.results.findIndex((p) => p.id === this.picked);
    const next = this.results[Math.max(0, Math.min(this.results.length - 1, i < 0 ? 0 : i + delta))];
    this.pick(next.id);
    this.dialog.querySelector(`.add-results [data-profile="${next.id}"]`)?.scrollIntoView({ block: "nearest" });
  },

  async add() {
    const id = this.picked ?? (this.results.length === 1 ? this.results[0].id : null);
    if (!id) return;
    const btn = $("#add-confirm");
    btn.disabled = true;
    try {
      await api("/devices", { method: "POST", body: { profile: id, name: $("#name-input").value.trim() || undefined, tags: this.tags.value() } });
      this.remember(id);
      this.dialog.close();
    } catch {
      /* shown in the traffic log */
    } finally {
      btn.disabled = false;
    }
  },
};
AddDevice.tags = TagEditor($("#add-tags"));
$("#add-open").addEventListener("click", () => AddDevice.open());
$("#add-search").addEventListener("input", () => {
  AddDevice.picked = null;
  AddDevice.render();
  if (AddDevice.results.length === 1) AddDevice.pick(AddDevice.results[0].id);
});
$("#add-search").addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    AddDevice.move(e.key === "ArrowDown" ? 1 : -1);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (!AddDevice.picked && AddDevice.results.length) AddDevice.pick(AddDevice.results[0].id);
    else AddDevice.add();
  }
});
$("#name-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (AddDevice.picked) AddDevice.add();
    else AddDevice.tags.focus();
  }
});
$("#add-confirm").addEventListener("click", () => AddDevice.add());
$("#log-clear").addEventListener("click", () => ($("#log").innerHTML = ""));



// ---------------------------------------------------------------- settings
// Supported profiles (shown in Add device or not) and the wishlist of devices to
// support, imported from a Zigbee2MQTT export and downloadable as JSON.
const wishKey = (w) => `${(w.vendor ?? "").toLowerCase()}|${(w.model ?? w.zigbeeModel ?? "").toLowerCase()}`;

function groupByVendor(items) {
  const groups = new Map();
  for (const it of items) {
    const v = it.vendor || "Unknown";
    if (!groups.has(v)) groups.set(v, []);
    groups.get(v).push(it);
  }
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined && text !== null) e.textContent = text;
  return e;
}

const Settings = {
  dialog: $("#settings-dialog"),
  tab: "profiles",
  review: null, // { source, entries: [...], selected: Set(keys) }

  open(tab = this.tab) {
    this.show(tab);
    this.dialog.showModal();
  },

  show(tab) {
    this.tab = tab;
    for (const b of this.dialog.querySelectorAll(".tabs .seg-btn")) {
      const on = b.dataset.tab === tab;
      b.classList.toggle("on", on);
      b.setAttribute("aria-selected", String(on));
    }
    for (const p of this.dialog.querySelectorAll(".tab-panel")) p.hidden = p.dataset.panel !== tab;
    this.render();
  },

  async save(patch) {
    try {
      state.settings = await api("/settings", { method: "POST", body: patch });
      await refresh();
    } catch {
      /* shown in the traffic log */
    }
  },

  render() {
    const enabled = state.profiles.filter((p) => p.enabled !== false).length;
    $("#tab-profiles-count").textContent = `${enabled}/${state.profiles.length}`;
    const missing = state.settings.wishlist.filter((w) => !Z2MImport.supportedBy(w, state.profiles)).length;
    $("#tab-wishlist-count").textContent = state.settings.wishlist.length ? String(missing) : "";
    if (this.tab === "profiles") this.renderProfiles();
    else this.renderWishlist();
  },

  // ---- supported profiles
  renderProfiles() {
    const q = fold($("#prof-search").value);
    const used = new Map();
    for (const d of state.devices) used.set(d.profile, (used.get(d.profile) ?? 0) + 1);
    const rows = state.profiles
      .filter((p) => !q || fold(`${p.info?.vendor} ${p.info?.model} ${p.info?.type} ${p.info?.description} ${p.name}`).includes(q))
      .sort((a, b) => fold(a.info?.vendor).localeCompare(fold(b.info?.vendor)) || fold(a.info?.model).localeCompare(fold(b.info?.model)));
    $("#prof-list").replaceChildren(
      ...rows.map((p) => {
        const row = el("div", "prof-row" + (p.enabled === false ? " disabled" : ""));
        row.append(deviceImage(p.info, "tile-img small"));
        const text = el("div", "tile-text");
        text.append(el("span", "tile-vendor", `${p.info?.vendor ?? ""}${p.info?.type ? ` · ${p.info.type}` : ""}`), el("span", "tile-model", p.info?.model ?? p.name), el("span", "tile-desc", p.info?.description ?? p.name));
        row.append(text);
        const n = used.get(p.id);
        row.append(el("span", "prof-used", n ? `${n} in use` : ""));
        const sw = el("button", "switch-btn");
        sw.type = "button";
        sw.setAttribute("role", "switch");
        sw.setAttribute("aria-checked", String(p.enabled !== false));
        sw.setAttribute("aria-label", `Offer ${p.info?.vendor ?? ""} ${p.info?.model ?? p.name} in Add device`);
        sw.addEventListener("click", () => {
          const disabled = new Set(state.settings.disabledProfiles);
          if (disabled.has(p.id)) disabled.delete(p.id);
          else disabled.add(p.id);
          this.save({ disabledProfiles: [...disabled] });
        });
        row.append(sw);
        return row;
      }),
    );
  },

  // ---- wishlist
  async importFile(file) {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      log({ type: "sys", summary: "wishlist import: file larger than 50 MB" });
      return;
    }
    try {
      const entries = Z2MImport.extract(await file.text());
      if (!entries.length) throw new Error("No devices found in this file.");
      const inList = new Set(state.settings.wishlist.map(wishKey));
      this.review = { source: file.name, entries, selected: new Set(entries.map(wishKey).filter((k) => inList.has(k))) };
      $("#wish-import-error")?.remove();
    } catch (e) {
      this.review = null;
      const err = el("p", "wish-error", e.message);
      err.id = "wish-import-error";
      $("#wish-import-error")?.remove();
      $("#wish-drop").after(err);
    }
    this.renderWishlist();
  },

  wishRow(item, { checkbox, onToggle, onRemove }) {
    const row = el("label", "wish-row");
    const prof = Z2MImport.supportedBy(item, state.profiles);
    if (checkbox) {
      const cb = el("input");
      cb.type = "checkbox";
      cb.checked = checkbox.checked;
      cb.disabled = !!prof;
      cb.addEventListener("change", () => onToggle(cb.checked));
      row.append(cb);
    }
    row.append(deviceImage({ image: item.image, type: null }, "tile-img small"));
    const text = el("span", "tile-text");
    const model = el("span", "tile-model", item.model ?? item.zigbeeModel);
    text.append(model, el("span", "tile-desc", item.description ?? (item.model ? "" : `Zigbee model id (not identified by Zigbee2MQTT)`)));
    row.append(text);
    row.append(el("span", "wish-count", item.count > 1 ? `×${item.count}` : ""));
    if (prof) row.append(el("span", "badge ok", "Supported"));
    else if (!checkbox) row.append(el("span", "badge", "Missing"));
    if (item.url) {
      const a = el("a", "wish-link", "Z2M");
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.title = "Zigbee2MQTT device page";
      row.append(a);
    }
    if (onRemove) {
      const x = el("button", "icon-btn", "✕");
      x.type = "button";
      x.setAttribute("aria-label", `Remove ${item.model ?? item.zigbeeModel} from the wishlist`);
      x.addEventListener("click", (e) => {
        e.preventDefault();
        onRemove();
      });
      row.append(x);
    }
    row.title = [item.vendor, item.model, item.zigbeeModel && `zigbee model: ${item.zigbeeModel}`, prof && `emulated by profile ${prof.id}`].filter(Boolean).join(" · ");
    return row;
  },

  renderWishlist() {
    const r = this.review;
    $("#wish-review").hidden = !r;
    $("#wish-drop").hidden = !!r;
    if (r) this.renderReview();
    const list = state.settings.wishlist;
    const missing = list.filter((w) => !Z2MImport.supportedBy(w, state.profiles));
    $("#wish-summary").textContent = list.length ? `${list.length} model${list.length > 1 ? "s" : ""} · ${missing.length} still missing` : "";
    $("#wish-empty").hidden = list.length > 0;
    $("#wish-download").disabled = $("#wish-clear").disabled = !list.length;
    $("#wish-list").replaceChildren(
      ...groupByVendor(list).map(([vendor, items]) => {
        const g = el("details", "wish-group");
        g.open = true;
        const sum = el("summary");
        sum.append(el("b", null, vendor), el("small", null, `${items.length}`));
        g.append(sum);
        for (const it of items) {
          g.append(this.wishRow(it, { onRemove: () => this.save({ wishlist: list.filter((w) => wishKey(w) !== wishKey(it)) }) }));
        }
        return g;
      }),
    );
  },

  renderReview() {
    const r = this.review;
    const q = fold($("#wish-search").value);
    const hideSupported = $("#wish-hide-supported").checked;
    const visible = r.entries.filter(
      (e) =>
        (!q || fold(`${e.vendor} ${e.model ?? ""} ${e.zigbeeModel ?? ""} ${e.description ?? ""}`).includes(q)) &&
        !(hideSupported && Z2MImport.supportedBy(e, state.profiles)),
    );
    const supported = r.entries.filter((e) => Z2MImport.supportedBy(e, state.profiles)).length;
    const devices = r.entries.reduce((a, e) => a + e.count, 0);
    $("#wish-review-title").textContent = `${r.source}: ${devices} devices, ${r.entries.length} models (${supported} already supported)`;
    $("#wish-apply").textContent = `Save wishlist selection (${r.selected.size})`;
    $("#wish-groups").replaceChildren(
      ...groupByVendor(visible).map(([vendor, items]) => {
        const g = el("details", "wish-group");
        g.open = true;
        const sum = el("summary");
        const selectable = items.filter((e) => !Z2MImport.supportedBy(e, state.profiles));
        const nSel = selectable.filter((e) => r.selected.has(wishKey(e))).length;
        const all = el("input");
        all.type = "checkbox";
        all.checked = selectable.length > 0 && nSel === selectable.length;
        all.indeterminate = nSel > 0 && nSel < selectable.length;
        all.disabled = !selectable.length;
        all.setAttribute("aria-label", `Select all ${vendor} devices`);
        all.addEventListener("click", (e) => e.stopPropagation());
        all.addEventListener("change", () => {
          for (const e of selectable) all.checked ? r.selected.add(wishKey(e)) : r.selected.delete(wishKey(e));
          this.renderReview();
        });
        sum.append(all, el("b", null, vendor), el("small", null, `${nSel}/${selectable.length} selected · ${items.reduce((a, e) => a + e.count, 0)} devices`));
        g.append(sum);
        for (const e of items) {
          g.append(
            this.wishRow(e, {
              checkbox: { checked: r.selected.has(wishKey(e)) },
              onToggle: (on) => {
                on ? r.selected.add(wishKey(e)) : r.selected.delete(wishKey(e));
                this.renderReview();
              },
            }),
          );
        }
        return g;
      }),
    );
    if (!visible.length) $("#wish-groups").append(el("p", "add-none", "Nothing to show with these filters."));
  },

  async applyReview() {
    const r = this.review;
    if (!r) return;
    const imported = new Set(r.entries.map(wishKey));
    const stamp = new Date().toISOString().slice(0, 10);
    const kept = state.settings.wishlist.filter((w) => !imported.has(wishKey(w)) || r.selected.has(wishKey(w)));
    const keptKeys = new Set(kept.map(wishKey));
    const added = r.entries
      .filter((e) => r.selected.has(wishKey(e)) && !keptKeys.has(wishKey(e)))
      .map(({ names, ...e }) => ({ ...e, source: r.source, added: stamp }));
    // refresh counts / descriptions of entries already in the list from the new export
    const fresh = new Map(r.entries.map((e) => [wishKey(e), e]));
    const merged = kept.map((w) => (fresh.has(wishKey(w)) ? { ...w, count: fresh.get(wishKey(w)).count } : w));
    await this.save({ wishlist: [...merged, ...added] });
    this.review = null;
    $("#wish-file").value = "";
    this.renderWishlist();
  },

  download() {
    const list = state.settings.wishlist;
    const doc = {
      format: "zigemu-wishlist",
      version: 1,
      generated: new Date().toISOString(),
      note: "Devices to add to ZigEmu as device profiles. Put this file in the repository's wishlist/ folder.",
      supportedProfiles: state.profiles.map((p) => ({ id: p.id, vendor: p.info?.vendor, model: p.info?.model })),
      devices: list.map((w) => {
        const prof = Z2MImport.supportedBy(w, state.profiles);
        return { ...w, status: prof ? "supported" : "missing", ...(prof ? { profile: prof.id } : {}) };
      }),
    };
    const blob = new Blob([JSON.stringify(doc, null, 2) + "\n"], { type: "application/json" });
    const a = el("a");
    a.href = URL.createObjectURL(blob);
    a.download = `zigemu-wishlist-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
};


for (const b of Settings.dialog.querySelectorAll(".tabs .seg-btn")) b.addEventListener("click", () => Settings.show(b.dataset.tab));
$("#prof-search").addEventListener("input", () => Settings.renderProfiles());
$("#prof-all").addEventListener("click", () => Settings.save({ disabledProfiles: [] }));
$("#prof-none").addEventListener("click", () => Settings.save({ disabledProfiles: state.profiles.map((p) => p.id) }));
$("#wish-file").addEventListener("change", (e) => Settings.importFile(e.target.files[0]));
const drop = $("#wish-drop");
drop.addEventListener("dragover", (e) => {
  e.preventDefault();
  drop.classList.add("over");
});
drop.addEventListener("dragleave", () => drop.classList.remove("over"));
drop.addEventListener("drop", (e) => {
  e.preventDefault();
  drop.classList.remove("over");
  Settings.importFile(e.dataTransfer.files[0]);
});
$("#wish-search").addEventListener("input", () => Settings.renderReview());
$("#wish-hide-supported").addEventListener("change", () => Settings.renderReview());
$("#wish-cancel").addEventListener("click", () => {
  Settings.review = null;
  $("#wish-file").value = "";
  Settings.renderWishlist();
});
$("#wish-apply").addEventListener("click", () => Settings.applyReview());
$("#wish-download").addEventListener("click", () => Settings.download());
confirmClick($("#wish-clear"), "Confirm clear", () => Settings.save({ wishlist: [] }));


// ---------------------------------------------------------------- tags, filters, views
const CAT_COLORS = {
  slate: "#8a8f98", red: "#e5484d", orange: "#f76b15", amber: "#ffb224", green: "#30a46c",
  teal: "#12a594", blue: "#3e63dd", violet: "#8e4ec6", pink: "#d6409f",
};
const newId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const tagOf = (id) => state.settings.tags.find((t) => t.id === id) ?? null;
const deviceTags = (dev) => (dev.tags ?? []).map(tagOf).filter(Boolean);

function tagChip(tag) {
  const chip = document.createElement("span");
  chip.className = "tag-chip";
  chip.style.setProperty("--tag", CAT_COLORS[tag.color] ?? CAT_COLORS.slate);
  chip.append(Object.assign(document.createElement("i"), { className: "cat-dot" }), document.createTextNode(tag.name));
  return chip;
}

function renderTagChips(card, dev) {
  const box = $(".tag-chips", card);
  const tags = deviceTags(dev);
  const key = JSON.stringify(tags);
  if (box.dataset.key === key) return;
  box.dataset.key = key;
  box.replaceChildren(...tags.map(tagChip));
  if (!tags.length) box.append(Object.assign(document.createElement("span"), { className: "tag-chip add", textContent: "+ tag" }));
  box.title = tags.length ? `Tags: ${tags.map((t) => t.name).join(", ")} (click to edit)` : "Add tags";
}

const STATUS_LABELS = { joined: "Joined", pairing: "Pairing", unpaired: "Not paired", unpowered: "No power" };
const MODE_LABELS = { manual: "Manual", auto: "Auto" };
const FILTER_KEYS = ["tags", "types", "vendors", "status", "modes"];
const normFilters = (f) => {
  const out = emptyFilters();
  for (const k of Object.keys(out)) if (f && Array.isArray(out[k]) ? Array.isArray(f[k]) : typeof f?.[k] === "string") out[k] = structuredClone(f[k]);
  return out;
};
const emptyFilters = () => ({ q: "", tags: [], types: [], vendors: [], status: [], modes: [] });

const Filters = {
  f: normFilters(Prefs.get("filters", {})),
  group: Prefs.get("group", false),
  view: Prefs.get("activeView", ""),

  statusOf(dev) {
    const out = [dev.joined ? "joined" : dev.pairing ? "pairing" : "unpaired"];
    if (dev.powered === false) out.push("unpowered");
    return out;
  },

  matches(dev) {
    const f = this.f;
    if (f.q) {
      const tagNames = deviceTags(dev).map((t) => t.name).join(" ");
      const hay = fold(`${dev.name} ${dev.info?.vendor} ${dev.info?.model} ${dev.info?.type} ${dev.info?.description} ${dev.profile} ${dev.ieee} ${tagNames}`);
      if (!fold(f.q).split(/\s+/).filter(Boolean).every((w) => hay.includes(w))) return false;
    }
    if (f.tags.length) {
      const ids = deviceTags(dev).map((t) => t.id);
      if (!(ids.length ? ids : ["none"]).some((t) => f.tags.includes(t))) return false;
    }
    if (f.types.length && !f.types.includes(dev.info?.type)) return false;
    if (f.vendors.length && !f.vendors.includes(dev.info?.vendor)) return false;
    if (f.status.length && !this.statusOf(dev).some((st) => f.status.includes(st))) return false;
    if (f.modes.length && !f.modes.includes(dev.mode)) return false;
    return true;
  },

  active() {
    return !!this.f.q || FILTER_KEYS.some((k) => this.f[k].length);
  },

  save() {
    Prefs.set("filters", this.f);
    Prefs.set("group", this.group);
    Prefs.set("activeView", this.view);
  },

  set(patch) {
    Object.assign(this.f, patch);
    this.save();
    this.apply();
  },

  clear() {
    this.f = emptyFilters();
    this.view = "";
    $("#dev-search").value = "";
    this.save();
    this.apply();
  },

  options(key) {
    const counts = new Map();
    const add = (v, label) => {
      const cur = counts.get(v) ?? { label, n: 0 };
      cur.n += 1;
      counts.set(v, cur);
    };
    for (const d of state.devices) {
      if (key === "tags") {
        const tags = deviceTags(d);
        if (!tags.length) add("none", "No tags");
        for (const t of tags) add(t.id, t.name);
      } else if (key === "types") add(d.info?.type ?? "Other", d.info?.type ?? "Other");
      else if (key === "vendors") add(d.info?.vendor ?? "Other", d.info?.vendor ?? "Other");
      else if (key === "status") for (const st of this.statusOf(d)) add(st, STATUS_LABELS[st]);
      else if (key === "modes") add(d.mode, MODE_LABELS[d.mode]);
    }
    let order;
    if (key === "tags") order = [...state.settings.tags.map((t) => t.id), "none"];
    else if (key === "status") order = Object.keys(STATUS_LABELS);
    else if (key === "modes") order = Object.keys(MODE_LABELS);
    else order = [...counts.keys()].sort((a, b) => a.localeCompare(b));
    // keep selected values visible even with no device
    for (const v of this.f[key]) if (!counts.has(v)) counts.set(v, { label: key === "tags" ? tagOf(v)?.name ?? v : STATUS_LABELS[v] ?? MODE_LABELS[v] ?? v, n: 0 });
    for (const v of this.f[key]) if (!order.includes(v)) order.push(v);
    return order.filter((v) => counts.has(v)).map((v) => ({ value: v, ...counts.get(v) }));
  },

  labelFor(key, value) {
    if (key === "tags") return value === "none" ? "No tags" : tagOf(value)?.name ?? value;
    if (key === "status") return STATUS_LABELS[value] ?? value;
    if (key === "modes") return MODE_LABELS[value] ?? value;
    return value;
  },

  renderToolbar() {
    for (const dd of document.querySelectorAll(".filter-dd")) {
      const key = dd.dataset.key;
      const opts = this.options(key);
      const sig = JSON.stringify([opts, this.f[key]]);
      dd.querySelector(".dd-count").textContent = this.f[key].length ? String(this.f[key].length) : "";
      dd.classList.toggle("on", this.f[key].length > 0);
      const menu = dd.querySelector(".dd-menu");
      if (menu.dataset.sig === sig) continue;
      menu.dataset.sig = sig;
      menu.replaceChildren(
        ...(opts.length
          ? opts.map((o) => {
              const row = document.createElement("label");
              row.className = "dd-item";
              const cb = Object.assign(document.createElement("input"), { type: "checkbox", checked: this.f[key].includes(o.value) });
              cb.addEventListener("change", () => {
                const set = new Set(this.f[key]);
                cb.checked ? set.add(o.value) : set.delete(o.value);
                this.set({ [key]: [...set] });
              });
              row.append(cb);
              if (key === "tags") {
                const dot = document.createElement("i");
                dot.className = "cat-dot";
                const c = tagOf(o.value);
                dot.style.background = c ? CAT_COLORS[c.color] : "transparent";
                if (!c) dot.classList.add("none");
                row.append(dot);
              }
              row.append(Object.assign(document.createElement("span"), { textContent: o.label }), Object.assign(document.createElement("small"), { textContent: o.n }));
              return row;
            })
          : [Object.assign(document.createElement("p"), { className: "hint", textContent: "Nothing to filter yet." })]),
      );
    }
    // saved views
    const sel = $("#view-select");
    const views = state.settings.views;
    const vsig = JSON.stringify([views, this.view]);
    if (sel.dataset.sig !== vsig) {
      sel.dataset.sig = vsig;
      sel.replaceChildren(
        Object.assign(document.createElement("option"), { value: "", textContent: views.length ? "All devices" : "All devices (no saved views)" }),
        ...views.map((v) => Object.assign(document.createElement("option"), { value: v.id, textContent: v.name })),
      );
    }
    const view = views.find((v) => v.id === this.view);
    if (!view && this.view) this.view = "";
    sel.value = view ? view.id : "";
    const dirty = view && (JSON.stringify(view.filters) !== JSON.stringify(this.f) || !!view.group !== this.group);
    $("#view-update").hidden = !dirty;
    $("#view-update").textContent = view ? `Update “${view.name}”` : "Update view";
    $("#filters-clear").hidden = !this.active() && !this.view;
    $("#group-toggle").setAttribute("aria-pressed", String(this.group));
    $("#group-toggle").classList.toggle("on", this.group);
    if (document.activeElement !== $("#dev-search")) $("#dev-search").value = this.f.q;
    // active filter chips
    const chips = [];
    for (const key of FILTER_KEYS) {
      for (const v of this.f[key]) {
        const b = Object.assign(document.createElement("button"), { type: "button", className: "chip on" });
        b.append(Object.assign(document.createElement("span"), { textContent: this.labelFor(key, v) }), Object.assign(document.createElement("small"), { textContent: "✕" }));
        b.title = "Remove this filter";
        b.addEventListener("click", () => this.set({ [key]: this.f[key].filter((x) => x !== v) }));
        chips.push(b);
      }
    }
    $("#active-filters").replaceChildren(...chips);
    $("#active-filters").hidden = !chips.length;
  },

  // Show matching cards, in state order or grouped under their first tag.
  apply() {
    this.renderToolbar();
    const grid = $("#devices");
    const cards = new Map([...grid.querySelectorAll(":scope > .card")].map((c) => [c.dataset.ieee, c]));
    const visible = state.devices.filter((d) => this.matches(d));
    const seq = [];
    if (this.group) {
      const groups = [...state.settings.tags.map((t) => ({ id: t.id, name: t.name, color: t.color })), { id: "none", name: "No tags", color: null }];
      for (const g of groups) {
        const devs = visible.filter((d) => (deviceTags(d)[0]?.id ?? "none") === g.id);
        if (!devs.length) continue;
        seq.push({ header: g, n: devs.length });
        for (const d of devs) seq.push({ ieee: d.ieee });
      }
    } else {
      for (const d of visible) seq.push({ ieee: d.ieee });
    }
    const sig = JSON.stringify(seq);
    if (grid.dataset.sig !== sig) {
      grid.dataset.sig = sig;
      for (const h of grid.querySelectorAll(":scope > .group-head")) h.remove();
      const shown = new Set(visible.map((d) => d.ieee));
      for (const [ieee, card] of cards) card.hidden = !shown.has(ieee);
      for (const item of seq) {
        if (item.header) {
          const h = document.createElement("h3");
          h.className = "group-head";
          const dot = document.createElement("i");
          dot.className = "cat-dot" + (item.header.color ? "" : " none");
          if (item.header.color) dot.style.background = CAT_COLORS[item.header.color];
          h.append(dot, Object.assign(document.createElement("span"), { textContent: item.header.name }), Object.assign(document.createElement("small"), { textContent: item.n }));
          grid.append(h);
        } else {
          const card = cards.get(item.ieee);
          if (card) grid.append(card);
        }
      }
      for (const [ieee, card] of cards) if (!shown.has(ieee)) grid.append(card); // hidden ones last
    }
    const total = state.devices.length;
    $("#dev-count").textContent = total ? (visible.length === total ? String(total) : `${visible.length} / ${total}`) : "";
    $("#no-match").hidden = !total || visible.length > 0;
  },

  useView(id) {
    const view = state.settings.views.find((v) => v.id === id);
    this.view = view ? id : "";
    if (view) {
      this.f = normFilters(view.filters);
      this.group = !!view.group;
    }
    $("#dev-search").value = this.f.q;
    this.save();
    this.apply();
  },

  summary() {
    const parts = [];
    if (this.f.q) parts.push(`“${this.f.q}”`);
    for (const key of FILTER_KEYS) if (this.f[key].length) parts.push(this.f[key].map((v) => this.labelFor(key, v)).join(" or "));
    if (this.group) parts.push("grouped by tag");
    return parts.length ? parts.join(" · ") : "All devices";
  },

  async saveView(name) {
    const view = { id: newId("v"), name, filters: structuredClone(this.f), group: this.group };
    await Settings.save({ views: [...state.settings.views, view] });
    this.view = view.id;
    this.save();
    this.apply();
  },

  async updateView() {
    const views = state.settings.views.map((v) => (v.id === this.view ? { ...v, filters: structuredClone(this.f), group: this.group } : v));
    await Settings.save({ views });
    this.apply();
  },
};

$("#dev-search").addEventListener("input", (e) => Filters.set({ q: e.target.value }));
$("#group-toggle").addEventListener("click", () => {
  Filters.group = !Filters.group;
  Filters.save();
  Filters.apply();
});
$("#filters-clear").addEventListener("click", () => Filters.clear());
$("#no-match-clear").addEventListener("click", () => Filters.clear());
$("#view-select").addEventListener("change", (e) => (e.target.value ? Filters.useView(e.target.value) : Filters.clear()));
$("#view-update").addEventListener("click", () => Filters.updateView());
for (const dd of document.querySelectorAll(".filter-dd")) {
  dd.addEventListener("toggle", () => {
    if (dd.open) for (const other of document.querySelectorAll(".filter-dd[open]")) if (other !== dd) other.open = false;
  });
}
document.addEventListener("click", (e) => {
  for (const dd of document.querySelectorAll(".filter-dd[open]")) if (!dd.contains(e.target)) dd.open = false;
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") for (const dd of document.querySelectorAll(".filter-dd[open]")) dd.open = false;
});
const viewDialog = $("#view-dialog");
$("#view-save").addEventListener("click", () => {
  $("#view-name").value = "";
  $("#view-dialog-summary").textContent = `Saves: ${Filters.summary()}.`;
  viewDialog.showModal();
  $("#view-name").focus();
});
// Enter in the name field saves (the form's first submit button is the ✕ close button)
$("#view-name").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if ($("#view-name").value.trim()) viewDialog.close("save");
  }
});
viewDialog.addEventListener("close", () => {
  const name = $("#view-name").value.trim();
  if (viewDialog.returnValue === "save" && name) Filters.saveView(name);
});

// ---- Settings tab: tags & saved views
Object.assign(Settings, {
  renderTags() {
    const editing = this.dialog.querySelector(".tab-panel[data-panel=tags]").contains(document.activeElement) && document.activeElement.tagName === "INPUT" && document.activeElement.id !== "cat-new-name";
    if (editing) return; // don't re-render under the cursor
    const used = new Map(Object.entries(state.tagUsage ?? {})); // across every coordinator
    const cats = state.settings.tags;
    const unused = cats.filter((c) => !used.get(c.id));
    const purge = $("#tags-purge");
    purge.hidden = !unused.length;
    purge.textContent = `Delete unused tags (${unused.length})`;
    purge.title = unused.map((c) => c.name).join(", ");
    $("#cat-list").replaceChildren(
      ...cats.map((c, i) => {
        const row = el("div", "cat-row");
        const colors = el("div", "cat-colors");
        colors.setAttribute("role", "radiogroup");
        colors.setAttribute("aria-label", `${c.name} color`);
        for (const [name, hex] of Object.entries(CAT_COLORS)) {
          const b = el("button", "cat-color" + (c.color === name ? " on" : ""));
          b.type = "button";
          b.style.background = hex;
          b.setAttribute("role", "radio");
          b.setAttribute("aria-checked", String(c.color === name));
          b.setAttribute("aria-label", name);
          b.addEventListener("click", () => this.save({ tags: cats.map((x) => (x.id === c.id ? { ...x, color: name } : x)) }));
          colors.append(b);
        }
        const name = el("input", "add-search small cat-name");
        name.value = c.name;
        name.maxLength = 40;
        name.setAttribute("aria-label", "Tag name");
        const commit = async () => {
          const v = name.value.trim();
          if (!v || v === c.name) {
            name.value = c.name;
            return;
          }
          if (cats.some((x) => x.id !== c.id && x.name.toLowerCase() === v.toLowerCase())) {
            tagError(`A tag named “${v}” already exists.`);
            name.value = c.name;
            return;
          }
          tagError("");
          await this.save({ tags: cats.map((x) => (x.id === c.id ? { ...x, name: v } : x)) });
        };
        name.addEventListener("change", commit);
        name.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            name.blur();
          }
        });
        const move = (d) => {
          const arr = [...cats];
          const j = i + d;
          if (j < 0 || j >= arr.length) return;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          this.save({ tags: arr });
        };
        const up = el("button", "icon-btn", "↑");
        up.type = "button";
        up.disabled = i === 0;
        up.setAttribute("aria-label", `Move ${c.name} up`);
        up.addEventListener("click", () => move(-1));
        const down = el("button", "icon-btn", "↓");
        down.type = "button";
        down.disabled = i === cats.length - 1;
        down.setAttribute("aria-label", `Move ${c.name} down`);
        down.addEventListener("click", () => move(1));
        const del = el("button", "btn tiny ghost danger", "Delete");
        del.type = "button";
        confirmClick(del, "Confirm delete", () => this.save({ tags: cats.filter((x) => x.id !== c.id) }));
        const n = used.get(c.id) ?? 0;
        if (n) del.title = `Removes it from ${n} device${n > 1 ? "s" : ""}`;
        row.append(colors, name, el("span", "prof-used" + (n ? "" : " unused"), n ? `${n} device${n > 1 ? "s" : ""}` : "unused"), up, down, del);
        return row;
      }),
    );
    if (!cats.length) $("#cat-list").append(el("p", "add-none", "No tags yet."));
    const views = state.settings.views;
    $("#views-list").replaceChildren(
      ...views.map((v) => {
        const row = el("div", "cat-row view-row");
        const name = el("input", "add-search small cat-name");
        name.value = v.name;
        name.maxLength = 40;
        name.setAttribute("aria-label", "View name");
        name.addEventListener("change", () => {
          const n = name.value.trim();
          if (n && n !== v.name) this.save({ views: views.map((x) => (x.id === v.id ? { ...x, name: n } : x)) });
          else name.value = v.name;
        });
        const saved = Filters.f;
        Filters.f = normFilters(v.filters);
        const g = Filters.group;
        Filters.group = v.group;
        const summary = Filters.summary();
        Filters.f = saved;
        Filters.group = g;
        const open = el("button", "btn tiny", "Open");
        open.type = "button";
        open.addEventListener("click", () => {
          Filters.useView(v.id);
          this.dialog.close();
        });
        const del = el("button", "btn tiny ghost danger", "Delete");
        del.type = "button";
        confirmClick(del, "Confirm delete", () => this.save({ views: views.filter((x) => x.id !== v.id) }));
        row.append(name, el("span", "hint view-summary", summary), open, del);
        return row;
      }),
    );
    if (!views.length) $("#views-list").append(el("p", "add-none", "No saved views. Filter the device list, then “Save view…”."));
  },
});
const _settingsRender = Settings.render.bind(Settings);
Settings.render = function () {
  $("#tab-tags-count").textContent = state.settings.tags.length ? String(state.settings.tags.length) : "";
  if (this.tab === "tags") {
    const enabled = state.profiles.filter((p) => p.enabled !== false).length;
    $("#tab-profiles-count").textContent = `${enabled}/${state.profiles.length}`;
    this.renderTags();
    return;
  }
  _settingsRender();
};
function tagError(msg) {
  const e = $("#tags-error");
  e.textContent = msg;
  e.hidden = !msg;
}
confirmClick($("#tags-purge"), "Confirm: delete them", () => {
  const used = state.tagUsage ?? {};
  Settings.save({ tags: state.settings.tags.filter((t) => used[t.id]) });
});
const addTag = () => {
  const input = $("#cat-new-name");
  const name = input.value.trim();
  if (!name) return input.focus();
  const used = new Set(state.settings.tags.map((c) => c.color));
  const color = Object.keys(CAT_COLORS).find((c) => c !== "slate" && !used.has(c)) ?? "slate";
  if (state.settings.tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
    tagError(`A tag named “${name}” already exists.`);
    return input.select();
  }
  tagError("");
  Settings.save({ tags: [...state.settings.tags, { id: newId("t"), name, color }] });
  input.value = "";
};
$("#cat-add").addEventListener("click", addTag);
$("#cat-new-name").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addTag();
  }
});


// ---------------------------------------------------------------- coordinators
// Several emulated coordinators (one NCP port each); the selector at the top
// right switches the dashboard between them, the last option adds one.
const Coordinators = {
  defaults: { nextPort: 6638, defaultHost: "0.0.0.0" },
  dialog: $("#coord-dialog"),
  editing: null,

  async load() {
    const data = await api("/coordinators");
    this.defaults = { nextPort: data.nextPort, defaultHost: data.defaultHost };
    this.set(data.coordinators, false);
  },

  set(list, reload = true) {
    state.coordinators = list;
    const prev = state.cid;
    if (!list.some((c) => c.id === state.cid)) state.cid = (list.find((c) => c.id === Prefs.get("coordinator", "")) ?? list[0])?.id ?? null;
    this.render();
    if (reload && state.cid !== prev) this.switchTo(state.cid, true);
  },

  current() {
    return state.coordinators.find((c) => c.id === state.cid) ?? null;
  },

  render() {
    const none = !state.coordinators.length;
    $("#onboarding").hidden = !none;
    $("#main-layout").hidden = none;
    $(".top-right").classList.toggle("empty", none);
    if (none) {
      const f = $("#onboard-form");
      if (!f.port.value) f.port.value = this.defaults.nextPort;
      if (!f.host.value) f.host.value = this.defaults.defaultHost;
    }
    const sel = $("#coord-select");
    const opts = state.coordinators.map((c) => {
      const o = document.createElement("option");
      o.value = c.id;
      o.textContent = `${c.error ? "⚠ " : ""}${c.kind === "proxy" ? "⇄ " : ""}${c.name} · :${c.port}`;
      return o;
    });
    const sep = Object.assign(document.createElement("option"), { disabled: true, textContent: "──────────" });
    const add = Object.assign(document.createElement("option"), { value: "__add", textContent: "＋ Add coordinator…" });
    sel.replaceChildren(...opts, ...(opts.length ? [sep] : []), add);
    sel.value = state.cid ?? "__add";
    this.showBanner();
  },

  showBanner() {
    const c = this.current();
    const b = $("#coord-banner");
    b.hidden = !c?.error;
    if (c?.error) {
      b.replaceChildren(
        Object.assign(document.createElement("span"), { textContent: `“${c.name}” is not running: ${c.error}. ` }),
        Object.assign(document.createElement("button"), { type: "button", className: "btn tiny", textContent: "Change its port…", onclick: () => this.openDialog(c) }),
      );
    }
  },

  async switchTo(cid, force = false) {
    if (!cid || (cid === state.cid && !force)) return;
    state.cid = cid;
    Prefs.set("coordinator", cid);
    // a different network: forget the previous coordinator's devices and traffic
    for (const card of document.querySelectorAll("#devices > .card, #devices > .group-head")) card.remove();
    delete $("#devices").dataset.sig;
    $("#log").innerHTML = "";
    Activity.byDevice.clear();
    const infoDlg = $("#device-info");
    if (infoDlg.open) infoDlg.close();
    state.devices = [];
    this.render();
    try {
      await refresh();
    } catch {
      /* banner / traffic log */
    }
  },

  connectHelp(port, proxy = false) {
    const host = location.hostname || "<host>";
    const where = `Zigbee2MQTT: adapter ember, port tcp://${host}:${port} · ZHA: socket://${host}:${port}`;
    return proxy ? `Point your host here instead of the stick — ${where}. The network stays in the stick: nothing to re-pair.` : where;
  },

  openDialog(c = null) {
    this.editing = c;
    const f = $("#coord-form");
    $("#coord-dialog-title").textContent = c ? "Coordinator settings" : "Add coordinator";
    f.querySelector(".coord-submit").textContent = c ? "Save" : "Create";
    f.name.value = c ? c.name : `Coordinator ${state.coordinators.length + 1}`;
    f.port.value = c ? c.port : this.defaults.nextPort;
    f.host.value = c ? c.host : this.defaults.defaultHost;
    const kind = c?.kind ?? "emulated";
    for (const r of f.querySelectorAll("input[name=kind]")) {
      r.checked = r.value === kind;
      r.disabled = !!c; // the type of an existing coordinator is fixed
    }
    f.upstream.value = c?.upstream ?? "";
    syncKind(f);
    f.querySelector(".coord-delete").hidden = !c;
    f.querySelector(".coord-connect").textContent = this.connectHelp(f.port.value);
    this.error(f, "");
    this.dialog.showModal();
    f.name.select();
  },

  error(form, msg) {
    const e = form.querySelector(".form-error");
    e.textContent = msg;
    e.hidden = !msg;
  },

  async submit(form, editing) {
    const kind = form.querySelector("input[name=kind]:checked")?.value ?? "emulated";
    const body = { name: form.name.value.trim(), port: Number(form.port.value), host: form.host.value.trim() || undefined, kind };
    if (kind === "proxy") body.upstream = form.upstream.value.trim();
    const btn = form.querySelector("[type=submit]");
    btn.disabled = true;
    try {
      const res = await fetch(`${API}/coordinators${editing ? `/${encodeURIComponent(editing.id)}/update` : ""}`, {
        method: "POST",
        headers: await authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || res.statusText);
      await this.load();
      await this.switchTo(data.id, true);
      return true;
    } catch (e) {
      this.error(form, e.message);
      return false;
    } finally {
      btn.disabled = false;
    }
  },

  async remove(c) {
    await api(`/coordinators/${encodeURIComponent(c.id)}`, { method: "DELETE" }).catch(() => {});
    this.dialog.close();
    state.cid = null;
    await this.load();
    if (state.cid) await this.switchTo(state.cid, true);
  },
};

$("#coord-select").addEventListener("change", (e) => {
  const v = e.target.value;
  if (v === "__add") {
    e.target.value = state.cid ?? "__add";
    Coordinators.openDialog();
    return;
  }
  Coordinators.switchTo(v);
});
$("#coord-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (await Coordinators.submit(e.target, Coordinators.editing)) Coordinators.dialog.close();
});
$("#coord-form").port.addEventListener("input", (e) => {
  $("#coord-form .coord-connect").textContent = Coordinators.connectHelp(e.target.value);
});
for (const b of document.querySelectorAll("#coord-form .coord-close")) b.addEventListener("click", () => Coordinators.dialog.close());
confirmClick($("#coord-form .coord-delete"), "Delete it and its devices", () => Coordinators.editing && Coordinators.remove(Coordinators.editing));
$("#onboard-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  await Coordinators.submit(e.target, null);
});

// ---- burger menu (top right)
const Menu = {
  btn: $("#menu-btn"),
  box: $("#main-menu"),
  toggle(open = this.box.hidden) {
    this.box.hidden = !open;
    this.btn.setAttribute("aria-expanded", String(open));
    if (open) this.box.querySelector("button:not([disabled])")?.focus();
  },
};
Menu.btn.addEventListener("click", (e) => {
  e.stopPropagation();
  Menu.toggle();
});
document.addEventListener("click", (e) => {
  if (!Menu.box.hidden && !Menu.box.contains(e.target)) Menu.toggle(false);
});
Menu.box.addEventListener("keydown", (e) => {
  const items = [...Menu.box.querySelectorAll("button:not([disabled])")];
  const i = items.indexOf(document.activeElement);
  if (e.key === "Escape") {
    Menu.toggle(false);
    Menu.btn.focus();
  } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    items[(i + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length]?.focus();
  }
});
for (const item of Menu.box.querySelectorAll("[data-menu]")) {
  item.addEventListener("click", () => {
    Menu.toggle(false);
    const what = item.dataset.menu;
    if (what === "coord-add") Coordinators.openDialog();
    else if (what === "coord-edit") Coordinators.current() ? Coordinators.openDialog(Coordinators.current()) : Coordinators.openDialog();
    else Settings.open(what);
  });
}

// start: everything above is defined
refresh().then(connectWs);


// ---- coordinator type (emulated / proxy) in the coordinator forms
function syncKind(form) {
  const proxy = form.querySelector("input[name=kind]:checked")?.value === "proxy";
  form.querySelector(".upstream-field").hidden = !proxy;
  form.upstream.required = proxy;
  const help = form.querySelector(".coord-connect");
  if (help) help.textContent = Coordinators.connectHelp(form.port.value, proxy);
}
for (const form of [$("#coord-form"), $("#onboard-form")]) {
  for (const r of form.querySelectorAll("input[name=kind]")) r.addEventListener("change", () => syncKind(form));
  syncKind(form);
}

// ---- proxied (real) devices in the device info: capture + profile draft
const Capture = {
  render(dlg, d) {
    const proxied = !!d.proxied;
    for (const a of dlg.querySelectorAll(".emu-only")) a.hidden = proxied;
    dlg.querySelector(".i-remove").textContent = proxied ? "Forget" : "Remove";
    dlg.querySelector(".i-remove-help").textContent = proxied
      ? "Forgets what was captured about this device (it reappears when it talks again). The real device is not touched."
      : "Deletes this virtual device (leaves first if joined).";
    const section = dlg.querySelector(".info-capture-section");
    section.hidden = !proxied;
    if (!proxied) return;
    const c = d.capture ?? {};
    const dl = dlg.querySelector(".info-capture");
    dl.replaceChildren();
    const fact = (k, v) => {
      if (v === undefined || v === null || v === "") return;
      dl.append(Object.assign(document.createElement("dt"), { textContent: k }), Object.assign(document.createElement("dd"), { textContent: v }));
    };
    if (c.node?.logicalType) fact("Node", `${c.node.logicalType.replace("_", " ")} · manufacturer 0x${(c.node.manufacturerCode ?? 0).toString(16).padStart(4, "0")} · MAC caps 0x${(c.node.macCapabilities ?? 0).toString(16)}`);
    for (const ep of c.endpoints ?? []) {
      fact(`Endpoint ${ep.id}`, `profile 0x${ep.profileId.toString(16).padStart(4, "0")} · device 0x${ep.deviceId.toString(16).padStart(4, "0")}\nin: ${ep.inClusters.join(", ") || "—"}\nout: ${ep.outClusters.join(", ") || "—"}`);
    }
    for (const [k, v] of Object.entries(c.basic ?? {})) fact(k, String(v));
    const missing = [];
    if (!(c.endpoints ?? []).length) missing.push("endpoints");
    if (!c.basic?.modelId) missing.push("model");
    if (!c.node?.logicalType) missing.push("node descriptor");
    dlg.querySelector(".i-capture-hint").textContent = missing.length
      ? `Not captured yet: ${missing.join(", ")}. They are sent when the device pairs or is re-interviewed (Zigbee2MQTT: device → Interview; ZHA: Reconfigure).`
      : d.profile
        ? `ZigEmu already emulates this model (profile ${d.profile}).`
        : "Complete capture: download a profile draft to emulate this model.";
  },
  async download(d) {
    const res = await fetch(`${API}/c/${encodeURIComponent(state.cid)}/devices/${d.ieee}/draft`, { headers: await authHeaders() });
    if (!res.ok) return log({ type: "sys", summary: "profile draft: " + ((await res.json().catch(() => ({}))).error ?? res.statusText) });
    const draft = await res.json();
    const blob = new Blob([JSON.stringify(draft, null, 2) + "\n"], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${draft.id}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
};
$("#device-info .i-draft").addEventListener("click", () => {
  const d = state.devices.find((x) => x.ieee === Info.ieee);
  if (d) Capture.download(d);
});
