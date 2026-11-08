"use strict";

// Auto mode: routine list per device card + the routine editor dialog.
// Gestures and their parameters come from the device's `capabilities`
// (derived server-side from the profile's controls), so the editor can only
// offer what the emulated device can actually do.

window.Routines = (() => {
  const q = (sel, root = document) => root.querySelector(sel);
  const el = (tag, attrs = {}, ...children) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else if (v !== undefined && v !== null && v !== false) n.setAttribute(k, v === true ? "" : v);
    }
    n.append(...children.filter((c) => c !== null && c !== undefined));
    return n;
  };
  const device = (ieee) => state.devices.find((d) => d.ieee === ieee);
  const strip = (r) => ({ id: r.id, name: r.name, enabled: r.enabled, loop: r.loop, steps: r.steps });
  const sec = (ms) => Math.round(ms / 10) / 100; // ms -> s, 2 decimals
  const fmt = (ms) => (ms >= 60000 ? `${Math.round(ms / 6000) / 10} min` : `${sec(ms)} s`);

  async function putRoutines(ieee, routines) {
    await api(`/devices/${ieee}/routines`, { method: "PUT", body: { routines: routines.map(strip) } });
  }

  // ------------------------------------------------------------ card panel
  function mount(card, ieee) {
    q(".new-routine", card).addEventListener("click", () => {
      const dev = device(ieee);
      Editor.open(dev, { name: "", loop: true, enabled: true, steps: [] }, null);
    });
    const sel = q(".template-select", card);
    sel.addEventListener("change", () => {
      const dev = device(ieee);
      const t = dev.routineTemplates.find((x) => x.id === sel.value);
      sel.value = "";
      if (t) Editor.open(dev, { ...structuredClone(strip(t)), id: undefined }, null);
    });
  }

  function update(card, dev) {
    const sel = q(".template-select", card);
    const sig = JSON.stringify(dev.routineTemplates.map((t) => t.id));
    if (sel.dataset.sig !== sig) {
      sel.dataset.sig = sig;
      sel.length = 1;
      for (const t of dev.routineTemplates) sel.append(el("option", { value: t.id, text: t.name, title: t.description }));
    }
    const list = q(".routine-list", card);
    const lsig = JSON.stringify([dev.mode, dev.joined, dev.routines, dev.routineStatus]);
    if (list.dataset.sig === lsig) return;
    list.dataset.sig = lsig;
    list.replaceChildren(...dev.routines.map((r, i) => routineRow(dev, r, i)));
    q(".routine-empty", card).hidden = dev.routines.length > 0;
  }

  function statusText(dev, r) {
    if (!r.enabled) return { text: "Off", cls: "off" };
    if (dev.mode !== "auto") return { text: "Enabled, runs in auto mode", cls: "idle" };
    const st = dev.routineStatus[r.id];
    if (!st) return { text: "Starting…", cls: "idle" };
    if (st.state === "waiting") return { text: "Waiting for the device to join", cls: "waiting" };
    if (st.state === "finished") return { text: "Finished", cls: "done" };
    if (st.state === "error") return { text: `Error: ${st.detail}`, cls: "error" };
    return { text: `Running step ${st.step + 1}/${r.steps.length}${r.loop ? ` · run ${st.loop}` : ""}`, cls: "running" };
  }

  function routineRow(dev, r, i) {
    const st = statusText(dev, r);
    const toggle = el("input", {
      type: "checkbox",
      class: "switch",
      "aria-label": `Enable ${r.name}`,
      onchange: (e) => {
        const routines = dev.routines.map((x) => ({ ...x }));
        routines[i].enabled = e.target.checked;
        putRoutines(dev.ieee, routines).catch(() => (e.target.checked = !e.target.checked));
      },
    });
    toggle.checked = r.enabled;
    const del = el("button", { type: "button", class: "btn tiny ghost danger", text: "Delete" });
    confirmClick(del, "Sure", () => putRoutines(dev.ieee, dev.routines.filter((_, j) => j !== i)).catch(() => {}));
    return el(
      "li",
      { class: `routine ${st.cls}` },
      toggle,
      el(
        "div",
        { class: "r-main" },
        el("div", { class: "r-name", text: r.name }),
        el("div", { class: "r-desc", text: r.description, title: r.description }),
        el("div", { class: `r-status ${st.cls}`, text: st.text }),
      ),
      el(
        "div",
        { class: "r-tools" },
        el("button", { type: "button", class: "btn tiny ghost", text: "Edit", onclick: () => Editor.open(dev, structuredClone(strip(r)), i) }),
        el("button", {
          type: "button",
          class: "btn tiny ghost",
          text: "Copy",
          onclick: () => Editor.open(dev, { ...structuredClone(strip(r)), id: undefined, name: `${r.name} (copy)` }, null),
        }),
        del,
      ),
    );
  }

  // ---------------------------------------------------------------- editor
  const Editor = (() => {
    const dlg = document.getElementById("routine-editor");
    let dev = null;
    let draft = null;
    let index = null; // position in dev.routines, or null for a new routine
    let previewTimer = null;
    let valid = false;

    const cap = (control) => dev.capabilities.find((c) => c.control === control);

    function defaultStep(control) {
      if (control === "wait") return { kind: "wait", ms: 2000 };
      const c = cap(control);
      const [gesture, g] = Object.entries(c.gestures)[0];
      return withDefaults({ kind: "gesture", control, gesture }, c, g);
    }

    function withDefaults(step, c, g) {
      step.params = Object.fromEntries(Object.entries(g.params).map(([k, p]) => [k, step.params?.[k] ?? p.default]));
      if (g.needsRepeat && !step.repeat) step.repeat = { every: c.defaultEvery, times: 10 };
      else if (c.type === "dial" && !step.repeat) step.repeat = { every: c.defaultEvery, for: 5000 };
      return step;
    }

    function open(device_, routine, idx) {
      dev = device_;
      draft = routine;
      index = idx;
      q(".editor-name", dlg).value = draft.name;
      q(".editor-loop", dlg).checked = draft.loop;
      const btns = q(".add-step-btns", dlg);
      btns.replaceChildren(
        ...dev.capabilities.map((c) =>
          el("button", { type: "button", class: "btn tiny", text: c.label, onclick: () => addStep(c.control) }),
        ),
        el("button", { type: "button", class: "btn tiny ghost", text: "Wait", onclick: () => addStep("wait") }),
      );
      render();
      dlg.showModal();
      if (!draft.name) q(".editor-name", dlg).focus();
    }

    function addStep(control) {
      draft.steps.push(defaultStep(control));
      render();
      const items = q(".step-list", dlg).children;
      items[items.length - 1]?.scrollIntoView({ block: "nearest" });
    }

    function changed() {
      clearTimeout(previewTimer);
      previewTimer = setTimeout(preview, 200);
      q(".preview-meta", dlg).textContent = estimate();
    }

    function estimate() {
      let ms = 0;
      for (const s of draft.steps) {
        if (s.kind === "wait") ms += s.ms;
        else if (s.repeat) ms += s.repeat.times ? s.repeat.times * s.repeat.every : s.repeat.for;
        else ms += s.gesture === "hold" ? s.params.holdMs : s.gesture === "double_tap" ? 440 : s.gesture === "tap" ? 120 : 0;
      }
      if (!draft.steps.length) return "";
      return `≈ ${fmt(ms)} per run${draft.loop ? ", then starts over" : ""}`;
    }

    async function preview() {
      const box = q(".preview-text", dlg);
      const save = q(".editor-save", dlg);
      if (!draft.steps.length) {
        box.textContent = "Add a first step: pick one of the device's controls below.";
        box.className = "preview-text muted";
        valid = false;
        save.disabled = true;
        return;
      }
      const res = await fetch(`${API}${scoped(`/devices/${dev.ieee}/routines/preview`)}`, {
        method: "POST",
        headers: await authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ routine: { ...draft, name: draft.name || "Untitled routine" } }),
      });
      const data = await res.json().catch(() => ({}));
      valid = res.ok;
      box.textContent = res.ok ? data.description : data.error;
      box.className = "preview-text" + (res.ok ? "" : " invalid");
      save.disabled = !valid;
    }

    function numberField(label, value, { min, max, step = 1, unit, onInput }) {
      const input = el("input", { type: "number", value, min, max, step, class: "num" });
      input.addEventListener("input", () => {
        if (input.value !== "") onInput(Number(input.value));
      });
      return el("label", { class: "field" }, el("span", { text: label }), input, unit ? el("span", { class: "unit", text: unit }) : null);
    }

    function paramFields(step, g) {
      return Object.entries(g.params).map(([name, p]) => {
        if (p.type === "enum") {
          const seg = el("div", { class: "seg small", role: "radiogroup", "aria-label": p.label });
          for (const opt of p.options) {
            const b = el("button", {
              type: "button",
              class: "seg-btn" + (step.params[name] === opt ? " on" : ""),
              text: p.labels?.[opt] ?? opt,
              onclick: () => {
                step.params[name] = opt;
                render();
              },
            });
            seg.append(b);
          }
          return el("div", { class: "field" }, el("span", { text: p.label }), seg);
        }
        if (p.unit === "ms") {
          return numberField(p.label, sec(step.params[name]), {
            min: p.min / 1000,
            max: p.max / 1000,
            step: 0.05,
            unit: "s",
            onInput: (v) => {
              step.params[name] = Math.round(v * 1000);
              changed();
            },
          });
        }
        return numberField(p.label, step.params[name], {
          min: p.min,
          max: p.max,
          onInput: (v) => {
            step.params[name] = Math.round(v);
            changed();
          },
        });
      });
    }

    function repeatFields(step, c, g) {
      const mode = !step.repeat ? "once" : step.repeat.times ? "times" : "for";
      const select = el(
        "select",
        {
          "aria-label": "Repeat",
          onchange: (e) => {
            const every = step.repeat?.every ?? c.defaultEvery;
            if (e.target.value === "once") delete step.repeat;
            else if (e.target.value === "times") step.repeat = { every, times: 5 };
            else step.repeat = { every, for: 10000 };
            render();
          },
        },
        g.needsRepeat ? null : el("option", { value: "once", text: "Once" }),
        el("option", { value: "times", text: "Repeat N times" }),
        el("option", { value: "for", text: "Repeat for…" }),
      );
      select.value = mode;
      const out = [el("label", { class: "field" }, el("span", { text: g.needsRepeat ? "Steps" : "Repeat" }), select)];
      if (step.repeat) {
        out.push(
          numberField("every", sec(step.repeat.every), {
            min: 0.05,
            step: 0.05,
            unit: "s",
            onInput: (v) => {
              step.repeat.every = Math.max(50, Math.round(v * 1000));
              changed();
            },
          }),
        );
        if (step.repeat.times) {
          out.push(
            numberField("", step.repeat.times, {
              min: 1,
              unit: "times",
              onInput: (v) => {
                step.repeat.times = Math.max(1, Math.round(v));
                changed();
              },
            }),
          );
        } else {
          out.push(
            numberField("for", sec(step.repeat.for), {
              min: 0.05,
              step: 0.5,
              unit: "s",
              onInput: (v) => {
                step.repeat.for = Math.round(v * 1000);
                changed();
              },
            }),
          );
        }
      }
      return out;
    }

    function stepRow(step, i) {
      const n = draft.steps.length;
      const move = (d) => {
        const [s] = draft.steps.splice(i, 1);
        draft.steps.splice(i + d, 0, s);
        render();
      };
      const tools = el(
        "div",
        { class: "step-tools" },
        el("button", { type: "button", class: "icon", title: "Move up", disabled: i === 0, text: "↑", onclick: () => move(-1) }),
        el("button", { type: "button", class: "icon", title: "Move down", disabled: i === n - 1, text: "↓", onclick: () => move(1) }),
        el("button", {
          type: "button",
          class: "icon",
          title: "Duplicate",
          text: "⧉",
          onclick: () => {
            draft.steps.splice(i + 1, 0, structuredClone(step));
            render();
          },
        }),
        el("button", {
          type: "button",
          class: "icon danger",
          title: "Delete step",
          text: "✕",
          onclick: () => {
            draft.steps.splice(i, 1);
            render();
          },
        }),
      );
      let body;
      if (step.kind === "wait") {
        body = el(
          "div",
          { class: "step-body" },
          el(
            "div",
            { class: "step-line" },
            el("span", { class: "step-title", text: "Wait" }),
            numberField("", sec(step.ms), {
              min: 0,
              step: 0.5,
              unit: "s",
              onInput: (v) => {
                step.ms = Math.round(v * 1000);
                changed();
              },
            }),
          ),
        );
      } else {
        const c = cap(step.control);
        const g = c.gestures[step.gesture];
        const controlSel = el(
          "select",
          {
            "aria-label": "Control",
            onchange: (e) => {
              draft.steps[i] = defaultStep(e.target.value);
              render();
            },
          },
          ...dev.capabilities.map((x) => el("option", { value: x.control, text: x.label })),
          el("option", { value: "wait", text: "Wait" }),
        );
        controlSel.value = step.control;
        const gestureSel = el(
          "select",
          {
            "aria-label": "Gesture",
            onchange: (e) => {
              step.gesture = e.target.value;
              delete step.repeat;
              withDefaults(step, c, c.gestures[step.gesture]);
              render();
            },
          },
          ...Object.entries(c.gestures).map(([k, v]) => el("option", { value: k, text: v.label })),
        );
        gestureSel.value = step.gesture;
        body = el(
          "div",
          { class: "step-body" },
          el("div", { class: "step-line" }, controlSel, gestureSel, ...paramFields(step, g)),
          el("div", { class: "step-line repeat" }, ...repeatFields(step, c, g)),
        );
      }
      return el("li", { class: "step" }, el("span", { class: "step-num", text: String(i + 1) }), body, tools);
    }

    function render() {
      q(".step-list", dlg).replaceChildren(...draft.steps.map(stepRow));
      changed();
    }

    async function save() {
      draft.name = q(".editor-name", dlg).value.trim() || "Untitled routine";
      draft.loop = q(".editor-loop", dlg).checked;
      if (!valid) return;
      const routines = dev.routines.map(strip);
      if (index === null) routines.push(draft);
      else routines[index] = draft;
      try {
        await putRoutines(dev.ieee, routines);
        dlg.close();
      } catch {
        /* error already shown in the traffic log */
      }
    }

    q(".editor-save", dlg).addEventListener("click", save);
    q(".editor-cancel", dlg).addEventListener("click", () => dlg.close());
    q(".editor-loop", dlg).addEventListener("change", (e) => {
      draft.loop = e.target.checked;
      changed();
    });
    q(".editor-name", dlg).addEventListener("input", (e) => (draft.name = e.target.value));
    q(".editor-form", dlg).addEventListener("submit", (e) => e.preventDefault());

    return { open };
  })();

  // A recorded routine: open it in the editor as a new routine, ready to save.
  function openDraft(dev, routine) {
    Editor.open(dev, { ...structuredClone(routine), id: undefined }, null);
  }

  return { mount, update, openDraft };
})();
