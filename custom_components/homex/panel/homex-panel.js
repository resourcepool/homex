/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ft = globalThis, Bt = ft.ShadowRoot && (ft.ShadyCSS === void 0 || ft.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ut = Symbol(), Xt = /* @__PURE__ */ new WeakMap();
let $s = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== Ut) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (Bt && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = Xt.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && Xt.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const ai = (e) => new $s(typeof e == "string" ? e : e + "", void 0, Ut), y = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, r, o) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + e[o + 1], e[0]);
  return new $s(s, e, Ut);
}, ni = (e, t) => {
  if (Bt) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const i = document.createElement("style"), r = ft.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = s.cssText, e.appendChild(i);
  }
}, Jt = Bt ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const i of t.cssRules) s += i.cssText;
  return ai(s);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: li, defineProperty: ci, getOwnPropertyDescriptor: di, getOwnPropertyNames: pi, getOwnPropertySymbols: hi, getPrototypeOf: ui } = Object, wt = globalThis, Qt = wt.trustedTypes, mi = Qt ? Qt.emptyScript : "", _i = wt.reactiveElementPolyfillSupport, lt = (e, t) => e, xt = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? mi : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let s = e;
  switch (t) {
    case Boolean:
      s = e !== null;
      break;
    case Number:
      s = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(e);
      } catch {
        s = null;
      }
  }
  return s;
} }, Ft = (e, t) => !li(e, t), es = { attribute: !0, type: String, converter: xt, reflect: !1, useDefault: !1, hasChanged: Ft };
Symbol.metadata ??= Symbol("metadata"), wt.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let We = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = es) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(t, i, s);
      r !== void 0 && ci(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, s, i) {
    const { get: r, set: o } = di(this.prototype, t) ?? { get() {
      return this[s];
    }, set(a) {
      this[s] = a;
    } };
    return { get: r, set(a) {
      const c = r?.call(this);
      o?.call(this, a), this.requestUpdate(t, c, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? es;
  }
  static _$Ei() {
    if (this.hasOwnProperty(lt("elementProperties"))) return;
    const t = ui(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(lt("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(lt("properties"))) {
      const s = this.properties, i = [...pi(s), ...hi(s)];
      for (const r of i) this.createProperty(r, s[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const s = litPropertyMetadata.get(t);
      if (s !== void 0) for (const [i, r] of s) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const r = this._$Eu(s, i);
      r !== void 0 && this._$Eh.set(r, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const s = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const r of i) s.unshift(Jt(r));
    } else t !== void 0 && s.push(Jt(t));
    return s;
  }
  static _$Eu(t, s) {
    const i = s.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const i of s.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ni(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, s, i) {
    this._$AK(t, i);
  }
  _$ET(t, s) {
    const i = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, i);
    if (r !== void 0 && i.reflect === !0) {
      const o = (i.converter?.toAttribute !== void 0 ? i.converter : xt).toAttribute(s, i.type);
      this._$Em = t, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(t, s) {
    const i = this.constructor, r = i._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const o = i.getPropertyOptions(r), a = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : xt;
      this._$Em = r;
      const c = a.fromAttribute(s, o.type);
      this[r] = c ?? this._$Ej?.get(r) ?? c, this._$Em = null;
    }
  }
  requestUpdate(t, s, i, r = !1, o) {
    if (t !== void 0) {
      const a = this.constructor;
      if (r === !1 && (o = this[t]), i ??= a.getPropertyOptions(t), !((i.hasChanged ?? Ft)(o, s) || i.useDefault && i.reflect && o === this._$Ej?.get(t) && !this.hasAttribute(a._$Eu(t, i)))) return;
      this.C(t, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, s, { useDefault: i, reflect: r, wrapped: o }, a) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, a ?? s ?? this[t]), o !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (s = void 0), this._$AL.set(t, s)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [r, o] of this._$Ep) this[r] = o;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [r, o] of i) {
        const { wrapped: a } = o, c = this[r];
        a !== !0 || this._$AL.has(r) || c === void 0 || this.C(r, void 0, o, c);
      }
    }
    let t = !1;
    const s = this._$AL;
    try {
      t = this.shouldUpdate(s), t ? (this.willUpdate(s), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(s);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((s) => s.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((s) => this._$ET(s, this[s])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
We.elementStyles = [], We.shadowRootOptions = { mode: "open" }, We[lt("elementProperties")] = /* @__PURE__ */ new Map(), We[lt("finalized")] = /* @__PURE__ */ new Map(), _i?.({ ReactiveElement: We }), (wt.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const qt = globalThis, ts = (e) => e, yt = qt.trustedTypes, ss = yt ? yt.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ws = "$lit$", Ce = `lit$${Math.random().toFixed(9).slice(2)}$`, ks = "?" + Ce, gi = `<${ks}>`, Ie = document, dt = () => Ie.createComment(""), pt = (e) => e === null || typeof e != "object" && typeof e != "function", Wt = Array.isArray, vi = (e) => Wt(e) || typeof e?.[Symbol.iterator] == "function", Pt = `[ 	
\f\r]`, rt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, is = /-->/g, rs = />/g, Le = RegExp(`>|${Pt}(?:([^\\s"'>=/]+)(${Pt}*=${Pt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), os = /'/g, as = /"/g, Cs = /^(?:script|style|textarea|title)$/i, Ss = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), n = Ss(1), S = Ss(2), Ve = Symbol.for("lit-noChange"), k = Symbol.for("lit-nothing"), ns = /* @__PURE__ */ new WeakMap(), Te = Ie.createTreeWalker(Ie, 129);
function Es(e, t) {
  if (!Wt(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ss !== void 0 ? ss.createHTML(t) : t;
}
const fi = (e, t) => {
  const s = e.length - 1, i = [];
  let r, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = rt;
  for (let c = 0; c < s; c++) {
    const d = e[c];
    let p, m, u = -1, _ = 0;
    for (; _ < d.length && (a.lastIndex = _, m = a.exec(d), m !== null); ) _ = a.lastIndex, a === rt ? m[1] === "!--" ? a = is : m[1] !== void 0 ? a = rs : m[2] !== void 0 ? (Cs.test(m[2]) && (r = RegExp("</" + m[2], "g")), a = Le) : m[3] !== void 0 && (a = Le) : a === Le ? m[0] === ">" ? (a = r ?? rt, u = -1) : m[1] === void 0 ? u = -2 : (u = a.lastIndex - m[2].length, p = m[1], a = m[3] === void 0 ? Le : m[3] === '"' ? as : os) : a === as || a === os ? a = Le : a === is || a === rs ? a = rt : (a = Le, r = void 0);
    const g = a === Le && e[c + 1].startsWith("/>") ? " " : "";
    o += a === rt ? d + gi : u >= 0 ? (i.push(p), d.slice(0, u) + ws + d.slice(u) + Ce + g) : d + Ce + (u === -2 ? c : g);
  }
  return [Es(e, o + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class ht {
  constructor({ strings: t, _$litType$: s }, i) {
    let r;
    this.parts = [];
    let o = 0, a = 0;
    const c = t.length - 1, d = this.parts, [p, m] = fi(t, s);
    if (this.el = ht.createElement(p, i), Te.currentNode = this.el.content, s === 2 || s === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (r = Te.nextNode()) !== null && d.length < c; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const u of r.getAttributeNames()) if (u.endsWith(ws)) {
          const _ = m[a++], g = r.getAttribute(u).split(Ce), f = /([.?@])?(.*)/.exec(_);
          d.push({ type: 1, index: o, name: f[2], strings: g, ctor: f[1] === "." ? xi : f[1] === "?" ? yi : f[1] === "@" ? $i : kt }), r.removeAttribute(u);
        } else u.startsWith(Ce) && (d.push({ type: 6, index: o }), r.removeAttribute(u));
        if (Cs.test(r.tagName)) {
          const u = r.textContent.split(Ce), _ = u.length - 1;
          if (_ > 0) {
            r.textContent = yt ? yt.emptyScript : "";
            for (let g = 0; g < _; g++) r.append(u[g], dt()), Te.nextNode(), d.push({ type: 2, index: ++o });
            r.append(u[_], dt());
          }
        }
      } else if (r.nodeType === 8) if (r.data === ks) d.push({ type: 2, index: o });
      else {
        let u = -1;
        for (; (u = r.data.indexOf(Ce, u + 1)) !== -1; ) d.push({ type: 7, index: o }), u += Ce.length - 1;
      }
      o++;
    }
  }
  static createElement(t, s) {
    const i = Ie.createElement("template");
    return i.innerHTML = t, i;
  }
}
function Ze(e, t, s = e, i) {
  if (t === Ve) return t;
  let r = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const o = pt(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== o && (r?._$AO?.(!1), o === void 0 ? r = void 0 : (r = new o(e), r._$AT(e, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = r : s._$Cl = r), r !== void 0 && (t = Ze(e, r._$AS(e, t.values), r, i)), t;
}
class bi {
  constructor(t, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: s }, parts: i } = this._$AD, r = (t?.creationScope ?? Ie).importNode(s, !0);
    Te.currentNode = r;
    let o = Te.nextNode(), a = 0, c = 0, d = i[0];
    for (; d !== void 0; ) {
      if (a === d.index) {
        let p;
        d.type === 2 ? p = new Xe(o, o.nextSibling, this, t) : d.type === 1 ? p = new d.ctor(o, d.name, d.strings, this, t) : d.type === 6 && (p = new wi(o, this, t)), this._$AV.push(p), d = i[++c];
      }
      a !== d?.index && (o = Te.nextNode(), a++);
    }
    return Te.currentNode = Ie, r;
  }
  p(t) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, s), s += i.strings.length - 2) : i._$AI(t[s])), s++;
  }
}
class Xe {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, s, i, r) {
    this.type = 2, this._$AH = k, this._$AN = void 0, this._$AA = t, this._$AB = s, this._$AM = i, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && t?.nodeType === 11 && (t = s.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, s = this) {
    t = Ze(this, t, s), pt(t) ? t === k || t == null || t === "" ? (this._$AH !== k && this._$AR(), this._$AH = k) : t !== this._$AH && t !== Ve && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : vi(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== k && pt(this._$AH) ? this._$AA.nextSibling.data = t : this.T(Ie.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: s, _$litType$: i } = t, r = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = ht.createElement(Es(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(s);
    else {
      const o = new bi(r, this), a = o.u(this.options);
      o.p(s), this.T(a), this._$AH = o;
    }
  }
  _$AC(t) {
    let s = ns.get(t.strings);
    return s === void 0 && ns.set(t.strings, s = new ht(t)), s;
  }
  k(t) {
    Wt(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, r = 0;
    for (const o of t) r === s.length ? s.push(i = new Xe(this.O(dt()), this.O(dt()), this, this.options)) : i = s[r], i._$AI(o), r++;
    r < s.length && (this._$AR(i && i._$AB.nextSibling, r), s.length = r);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const i = ts(t).nextSibling;
      ts(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class kt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, s, i, r, o) {
    this.type = 1, this._$AH = k, this._$AN = void 0, this.element = t, this.name = s, this._$AM = r, this.options = o, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = k;
  }
  _$AI(t, s = this, i, r) {
    const o = this.strings;
    let a = !1;
    if (o === void 0) t = Ze(this, t, s, 0), a = !pt(t) || t !== this._$AH && t !== Ve, a && (this._$AH = t);
    else {
      const c = t;
      let d, p;
      for (t = o[0], d = 0; d < o.length - 1; d++) p = Ze(this, c[i + d], s, d), p === Ve && (p = this._$AH[d]), a ||= !pt(p) || p !== this._$AH[d], p === k ? t = k : t !== k && (t += (p ?? "") + o[d + 1]), this._$AH[d] = p;
    }
    a && !r && this.j(t);
  }
  j(t) {
    t === k ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class xi extends kt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === k ? void 0 : t;
  }
}
class yi extends kt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== k);
  }
}
class $i extends kt {
  constructor(t, s, i, r, o) {
    super(t, s, i, r, o), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = Ze(this, t, s, 0) ?? k) === Ve) return;
    const i = this._$AH, r = t === k && i !== k || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, o = t !== k && (i === k || r);
    r && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class wi {
  constructor(t, s, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Ze(this, t);
  }
}
const ki = { I: Xe }, Ci = qt.litHtmlPolyfillSupport;
Ci?.(ht, Xe), (qt.litHtmlVersions ??= []).push("3.3.3");
const Si = (e, t, s) => {
  const i = s?.renderBefore ?? t;
  let r = i._$litPart$;
  if (r === void 0) {
    const o = s?.renderBefore ?? null;
    i._$litPart$ = r = new Xe(t.insertBefore(dt(), o), o, void 0, s ?? {});
  }
  return r._$AI(e), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Zt = globalThis;
let b = class extends We {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Si(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return Ve;
  }
};
b._$litElement$ = !0, b.finalized = !0, Zt.litElementHydrateSupport?.({ LitElement: b });
const Ei = Zt.litElementPolyfillSupport;
Ei?.({ LitElement: b });
(Zt.litElementVersions ??= []).push("4.2.2");
var As = "M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z", Ai = "M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z", Pi = "M3,5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5M11,6V14.5L7.5,11L6.08,12.42L12,18.34L17.92,12.42L16.5,11L13,14.5V6H11Z", Mi = "M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z", Hi = "M21,19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19C20.11,3 21,3.9 21,5V19M13,18V9.5L16.5,13L17.92,11.58L12,5.66L6.08,11.58L7.5,13L11,9.5V18H13Z", zi = "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z", Ps = "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z", Li = "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z", Oi = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z", Di = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z", ls = "M3 6H21V4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H7V18H3V6M13 12H9V13.78C8.39 14.33 8 15.11 8 16C8 16.89 8.39 17.67 9 18.22V20H13V18.22C13.61 17.67 14 16.88 14 16S13.61 14.33 13 13.78V12M11 17.5C10.17 17.5 9.5 16.83 9.5 16S10.17 14.5 11 14.5 12.5 15.17 12.5 16 11.83 17.5 11 17.5M22 8H16C15.5 8 15 8.5 15 9V19C15 19.5 15.5 20 16 20H22C22.5 20 23 19.5 23 19V9C23 8.5 22.5 8 22 8M21 18H17V10H21V18Z", Ti = "M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z", Ii = "M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z", Ot = "M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.78 14.43 12.46 13.77 12.33 13C12.21 12.26 12.23 11.63 12.5 10.94C12.69 11.32 12.89 11.7 13.13 12C13.9 13 15.11 13.44 15.37 14.8C15.41 14.94 15.43 15.08 15.43 15.23C15.46 16.05 15.1 16.95 14.5 17.5H14.5Z", Dt = "M22.11 21.46L2.39 1.73L1.11 3L7.09 9C5.66 10.36 4.88 12.47 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C17.1 19.26 17.15 19.18 17.22 19.11L20.84 22.73L22.11 21.46M8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C7 12.47 6.74 10.69 7.26 9.15L8.58 10.47C8.58 11.4 8.73 12.33 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.66 15 12.66 14.76 12.64 14.53L15 16.88C14.85 17.11 14.69 17.33 14.5 17.5M18.92 15.72L9.65 6.46C10.12 5.65 10.72 4.92 11.46 4.32C12.17 3.75 13 3.23 13.95 3C13 4.85 13.33 7.26 14.82 8.72C15.46 9.35 16.22 9.78 16.89 10.38C17.15 10.64 17.43 10.9 17.66 11.2C17.66 11.2 18.22 12 18.43 12.46L18.56 12.72C18.96 13.69 19.06 14.72 18.92 15.72Z", Vi = "M19 8C20.11 8 21 8.9 21 10V16.76C21.61 17.31 22 18.11 22 19C22 20.66 20.66 22 19 22C17.34 22 16 20.66 16 19C16 18.11 16.39 17.31 17 16.76V10C17 8.9 17.9 8 19 8M19 9C18.45 9 18 9.45 18 10V11H20V10C20 9.45 19.55 9 19 9M5 20V12H2L12 3L16.4 6.96C15.54 7.69 15 8.78 15 10V16C14.37 16.83 14 17.87 14 19L14.1 20H5Z", Ni = "M10 2C13.9 2 17 5.1 17 9C17 11.4 15.8 13.5 14 14.7V17C14 17.6 13.6 18 13 18H7C6.4 18 6 17.6 6 17V14.7C4.2 13.5 3 11.4 3 9C3 5.1 6.1 2 10 2M7 21V20H13V21C13 21.6 12.6 22 12 22H8C7.4 22 7 21.6 7 21M10 4C7.2 4 5 6.2 5 9C5 11.1 6.2 12.8 8 13.6V16H12V13.6C13.8 12.8 15 11.1 15 9C15 6.2 12.8 4 10 4M19 12V7H21V13H19M19 17V15H21V17H19Z", Ri = "M12,2C9.76,2 7.78,3.05 6.5,4.68L7.93,6.11C8.84,4.84 10.32,4 12,4A5,5 0 0,1 17,9C17,10.68 16.16,12.16 14.89,13.06L16.31,14.5C17.94,13.21 19,11.24 19,9A7,7 0 0,0 12,2M3.28,4L2,5.27L5.04,8.3C5,8.53 5,8.76 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H14.73L18.73,22L20,20.72L3.28,4M7.23,10.5L12.73,16H10V13.58C8.68,13 7.66,11.88 7.23,10.5M9,20V21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9Z", ji = "M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63Z", Bi = "M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M11,18H13V15.87C14.73,15.43 16,13.86 16,12A4,4 0 0,0 12,8A4,4 0 0,0 8,12C8,13.86 9.27,15.43 11,15.87V18Z", Ui = "M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z", Fi = "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z", Ms = "M19,13H5V11H19V13Z", qi = "M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z", Wi = "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z", Zi = "M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z", Gt = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z", Gi = "M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z", Ki = "M20 19V3H4V19H2V21H22V19H20M6 19V13H11V14.8C10.6 15.1 10.2 15.6 10.2 16.2C10.2 17.2 11 18 12 18S13.8 17.2 13.8 16.2C13.8 15.6 13.5 15.1 13 14.8V13H18V19H6Z", cs = "M11,13.5V21.5H3V13.5H11M12,2L17.5,11H6.5L12,2M17.5,13C20,13 22,15 22,17.5C22,20 20,22 17.5,22C15,22 13,20 13,17.5C13,15 15,13 17.5,13Z", Yi = "M18,18H6V6H18V18Z", Xi = "M7.5,2C5.71,3.15 4.5,5.18 4.5,7.5C4.5,9.82 5.71,11.85 7.53,13C4.46,13 2,10.54 2,7.5A5.5,5.5 0 0,1 7.5,2M19.07,3.5L20.5,4.93L4.93,20.5L3.5,19.07L19.07,3.5M12.89,5.93L11.41,5L9.97,6L10.39,4.3L9,3.24L10.75,3.12L11.33,1.47L12,3.1L13.73,3.13L12.38,4.26L12.89,5.93M9.59,9.54L8.43,8.81L7.31,9.59L7.65,8.27L6.56,7.44L7.92,7.35L8.37,6.06L8.88,7.33L10.24,7.36L9.19,8.23L9.59,9.54M19,13.5A5.5,5.5 0 0,1 13.5,19C12.28,19 11.15,18.6 10.24,17.93L17.93,10.24C18.6,11.15 19,12.28 19,13.5M14.6,20.08L17.37,18.93L17.13,22.28L14.6,20.08M18.93,17.38L20.08,14.61L22.28,17.15L18.93,17.38M20.08,12.42L18.94,9.64L22.28,9.88L20.08,12.42M9.63,18.93L12.4,20.08L9.87,22.27L9.63,18.93Z", Ji = "M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9M8 12H16V14H8V12M8 15H16V17H8V15M8 18H16V20H8V18Z", Qi = "M2 4H20V8H18V20H16V8H6V20H4V8H2V4M7 9H15V11H7V9M7 12H15V14H7V12M20 19V17H22V19H20M20 15V10H22V15H20Z", er = "M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9Z";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $ = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const tr = { attribute: !0, type: String, converter: xt, reflect: !1, hasChanged: Ft }, sr = (e = tr, t, s) => {
  const { kind: i, metadata: r } = s;
  let o = globalThis.litPropertyMetadata.get(r);
  if (o === void 0 && globalThis.litPropertyMetadata.set(r, o = /* @__PURE__ */ new Map()), i === "setter" && ((e = Object.create(e)).wrapped = !0), o.set(s.name, e), i === "accessor") {
    const { name: a } = s;
    return { set(c) {
      const d = t.get.call(this);
      t.set.call(this, c), this.requestUpdate(a, d, e, !0, c);
    }, init(c) {
      return c !== void 0 && this.C(a, void 0, e, c), c;
    } };
  }
  if (i === "setter") {
    const { name: a } = s;
    return function(c) {
      const d = this[a];
      t.call(this, c), this.requestUpdate(a, d, e, !0, c);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function h(e) {
  return (t, s) => typeof s == "object" ? sr(e, t, s) : ((i, r, o) => {
    const a = r.hasOwnProperty(o);
    return r.constructor.createProperty(o, i), a ? Object.getOwnPropertyDescriptor(r, o) : void 0;
  })(e, t, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function l(e) {
  return h({ ...e, state: !0, attribute: !1 });
}
const Tt = "homex-changed", U = (e) => e.dispatchEvent(new CustomEvent(Tt, { bubbles: !0, composed: !0 })), Hs = async (e) => (await e.callWS({ type: "homex/layouts" })).layouts || [], ir = (e, t) => e.callWS({ type: "homex/layout/save", layout: t }), rr = (e, t) => e.callWS({ type: "homex/layout/delete", layout_id: t }), zs = async (e) => (await e.callWS({ type: "homex/switches" })).switches || [], Ls = (e, t, s = !1) => e.callWS({ type: "homex/switch/save", switch: t, create: s }), or = (e, t) => e.callWS({ type: "homex/switch/remove", switch_id: t }), Os = async (e) => (await e.callWS({ type: "homex/presets" })).presets || [], ar = (e, t) => e.callWS({ type: "homex/preset/save", preset: t }), nr = (e, t) => e.callWS({ type: "homex/preset/delete", preset_id: t }), lr = async (e) => (await e.callWS({ type: "homex/switch_models" })).models || [], Ds = async (e) => (await e.callWS({ type: "homex/switch_devices" })).devices || [], cr = async (e) => (await e.callWS({ type: "homex/shutter_models" })).models || [], dr = (e, t) => e.callWS({ type: "homex/z2m/state", device_id: t }), pr = async (e) => (await e.callWS({ type: "homex/shutter_presets" })).presets || [], hr = (e, t) => e.callWS({ type: "homex/shutter_preset/save", preset: t }), ur = (e, t) => e.callWS({ type: "homex/shutter_preset/delete", preset_id: t }), Je = async (e) => (await e.callWS({ type: "homex/rooms" })).rooms || [], mr = (e, t) => e.callWS({ type: "homex/room/create", ...t }), _r = (e, t, s = !0) => e.callWS({ type: "homex/room/delete", entry_id: t, delete_scenes: s }), gr = (e, t, s) => e.callWS({ type: "homex/shutter_group/add", entry_id: t, name: s }), vr = (e, t) => e.callWS({ type: "homex/shutter_group/update", ...t }), fr = (e, t, s) => e.callWS({ type: "homex/shutter_group/delete", entry_id: t, group_id: s }), Ts = async (e, t) => (await e.callWS({ type: "homex/device_triggers", device_id: t })).triggers || [], Se = (e, t) => e.callWS({ type: "homex/room/update", ...t }), br = (e, t) => e.callWS({ type: "homex/room/sync_labels", entry_id: t }), xr = (e, t, s) => e.callWS({ type: "homex/room/dim", entry_id: t, delta: s }), yr = (e, t, s, i) => e.callWS({ type: "homex/room/shutter", entry_id: t, group_id: s, service: i }), $r = (e, t) => e.callWS({ type: "homex/group/add", ...t }), wr = (e, t) => e.callWS({ type: "homex/group/update", ...t }), kr = (e, t, s) => e.callWS({ type: "homex/group/delete", entry_id: t, group_id: s }), ds = (e, t, s, i, r) => e.callWS({
  type: "homex/scene/add",
  entry_id: t,
  name: s,
  ...i ? { attach: i } : {},
  ...r ? { triggers: r } : {}
}), Cr = (e, t, s) => e.callWS({ type: "homex/scene/delete", entry_id: t, key: s }), Sr = (e, t, s) => e.callWS({ type: "homex/scene/reorder", entry_id: t, order: s }), Er = (e, t) => e.callWS({ type: "homex/scene/next", entry_id: t }), Ar = (e, t, s, i, r) => e.callWS({
  type: "homex/scene/rename",
  entry_id: t,
  key: s,
  name: i,
  ...r ? { triggers: r } : {}
}), v = (e) => e && (e.message || e.code) || String(e), Qe = async (e) => e.callWS({ type: "homex/heating" }), Pr = (e, t, s) => e.callWS({ type: "homex/heating/preset/save", preset: t, create: s }), Mr = (e, t) => e.callWS({ type: "homex/heating/preset/delete", preset_id: t }), Hr = (e, t, s) => e.callWS({ type: "homex/heating/group/save", group: t, create: s }), zr = (e, t) => e.callWS({ type: "homex/heating/group/delete", group_id: t }), Is = async (e) => (await e.callWS({ type: "homex/heating/models" })).models || [], Lr = async (e, t, s) => (await e.callWS({ type: "homex/heating/device_preset/save", preset: t, create: s })).results || [], Or = (e, t) => e.callWS({ type: "homex/heating/device_preset/delete", preset_id: t }), Dr = async (e, t) => (await e.callWS({ type: "homex/heating/device_preset/apply", preset_id: t })).results || [], Tr = (e, t, s) => e.callWS({ type: "homex/heating/zone/save", zone: t, create: s }), Ir = (e, t) => e.callWS({ type: "homex/heating/zone/delete", zone_id: t }), Vr = (e, t, s) => e.callWS({ type: "homex/heating/zone/set_mode", zone_id: t, mode_id: s }), Nr = (e, t, s) => e.callWS({ type: "homex/heating/room_zone", room_id: t, zone_id: s }), Vs = (e, t) => e.callWS({ type: "homex/heating/enabled", enabled: t }), Rr = (e, t, s) => e.callWS({ type: "homex/heating/system/save", system: t, create: s }), jr = (e, t) => e.callWS({ type: "homex/heating/system/delete", system_id: t });
let vt = null;
const ps = () => !!customElements.get("ha-entities-picker");
function Br() {
  return ps() ? Promise.resolve(!0) : vt || (vt = (async () => {
    try {
      const e = await window.loadCardHelpers?.();
      if (e?.createCardElement) {
        const s = (await e.createCardElement({
          type: "entities",
          entities: []
        }))?.constructor;
        s?.getConfigElement && await s.getConfigElement();
      }
    } catch {
    }
    return ps();
  })(), vt);
}
const ye = (e = "") => e.split("/").filter(Boolean).map(decodeURIComponent), B = (e, ...t) => [e.replace(/\/+$/, ""), ...t.filter(Boolean).map(encodeURIComponent)].join("/");
function I(e, t = !1) {
  t ? history.replaceState(history.state, "", e) : history.pushState({ homexFrom: location.pathname }, "", e), window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: t } }));
}
function ce(e) {
  history.state?.homexFrom === e ? history.back() : I(e, !0);
}
function Ns(e, t) {
  if (t && (t.metaKey || t.ctrlKey || t.shiftKey || t.button === 1)) {
    window.open(e, "_blank", "noopener");
    return;
  }
  t?.preventDefault(), I(e);
}
function It(e, t) {
  const s = (e.devices || {})[t];
  return s ? `${s.manufacturer || ""}|${s.model || s.model_id || ""}` : "";
}
function Vt(e, t) {
  const s = (e.devices || {})[t];
  return s ? [s.manufacturer, s.model || s.model_id].filter(Boolean).join(" ") || "modèle inconnu" : "";
}
function Rs(e, t, s) {
  const i = It(e, s);
  return i ? t.filter((r) => r.model === i) : [];
}
function Kt(e, t, s) {
  const i = Rs(e, t, s.device_id);
  if (s.preset_id) {
    const r = i.find((o) => o.id === s.preset_id);
    if (r) return r;
  }
  return i[0];
}
function Ct(e, t) {
  return Object.values(e.entities || {}).filter((s) => s.device_id === t && s.entity_id.startsWith("climate.")).map((s) => s.entity_id).sort((s, i) => s.length - i.length)[0];
}
const Ur = 0.5;
function js(e) {
  const t = e?.attributes ?? {}, s = Number(t.temperature), i = Number(t.current_temperature);
  return t.hvac_action === "heating" && t.temperature != null && t.current_temperature != null && !Number.isNaN(s) && !Number.isNaN(i) && i >= s + Ur;
}
function Fr(e, t) {
  return (t.heating?.radiators ?? []).flatMap((s) => {
    const i = Ct(e, s.device_id), r = i ? e.states[i] : void 0;
    if (!js(r)) return [];
    const o = e.devices?.[s.device_id];
    return [o?.name_by_user || o?.name || r.attributes?.friendly_name || i];
  });
}
function Bs(e, t) {
  const s = Fr(e, t);
  return s.length ? `Chauffe alors que la température dépasse la consigne : ${s.join(", ")}. Vanne bloquée ouverte ou état non rafraîchi — vérifie le radiateur.` : "";
}
function Us(e, t) {
  return (t.heating?.radiators ?? []).some((s) => {
    const i = Ct(e, s.device_id);
    return !!i && e.states[i]?.attributes?.hvac_action === "heating";
  });
}
function Fs(e, t) {
  const s = Object.values(e.states || {}).filter(
    (o) => o.entity_id.startsWith("select.homex_heating_")
  ), i = s.find((o) => (o.attributes?.rooms ?? []).includes(t.room_id)) ?? s.find((o) => o.attributes?.zone_id === "default");
  if (!i || i.state === "unavailable" || i.state === "unknown") return;
  const r = String(i.attributes?.zone_name ?? i.attributes?.zone_id ?? "");
  return t.heating?.enabled === !1 ? { zone: r, mode: i.attributes?.modes?.unheated ?? "Unheated", own: !0 } : { zone: r, mode: i.state, own: !1 };
}
const qr = {
  open: er,
  closed: Ji,
  partial: Ki,
  opening: Hi,
  closing: Pi,
  unavailable: Qi
}, Wr = {
  open: "Ouvert",
  closed: "Fermé",
  partial: "Entrouvert",
  opening: "Ouverture…",
  closing: "Fermeture…",
  unavailable: "Indisponible"
};
function qs(e, t) {
  const s = e.states[t];
  if (!s) return null;
  const i = s.attributes?.current_position;
  return typeof i == "number" ? i : s.state === "open" ? 100 : s.state === "closed" ? 0 : null;
}
function Nt(e, t) {
  const s = t.map((a) => e.states[a]).filter((a) => a && a.state !== "unavailable" && a.state !== "unknown"), i = s.map((a) => qs(e, a.entity_id)).filter((a) => a !== null), r = i.length ? Math.round(i.reduce((a, c) => a + c, 0) / i.length) : null, o = s.length ? s.some((a) => a.state === "opening") ? "opening" : s.some((a) => a.state === "closing") ? "closing" : i.every((a) => a === 0) ? "closed" : i.every((a) => a === 100) ? "open" : "partial" : "unavailable";
  return { state: o, position: r, icon: qr[o], label: Wr[o] };
}
function Ws(e) {
  const t = (e.shutter_groups ?? []).filter((s) => s.devices?.length);
  return t.find((s) => !s.removable) ?? t[0];
}
const C = y`
  /* On/off toggle switch (see toggleSwitch in lib/fields). */
  .toggle {
    position: relative;
    display: inline-block;
    flex: 0 0 auto;
    width: 42px;
    height: 24px;
    border-radius: 12px;
    background: var(--switch-unchecked-track-color, #bdbdbd);
    transition: background 0.2s;
    vertical-align: middle;
  }
  .toggle.on {
    background: var(--switch-checked-track-color, var(--primary-color));
  }
  .toggle input {
    position: absolute;
    inset: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }
  .toggle .knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s;
    pointer-events: none;
  }
  .toggle.on .knob {
    transform: translateX(18px);
  }
  .toggle:has(input:disabled) {
    opacity: 0.4;
  }
  .toggle input:disabled {
    cursor: default;
  }
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
    overflow-wrap: anywhere;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
  }

  /* Text field (stacked label + large input). */
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
var Zr = Object.defineProperty, Gr = Object.getOwnPropertyDescriptor, we = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Gr(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && Zr(t, s, r), r;
};
let de = class extends b {
  constructor() {
    super(...arguments), this.hideToggle = !1, this.hideId = !1, this.info = [];
  }
  _isOn(e) {
    return this.hass.states[e]?.state === "on";
  }
  /** Lit (a Homex scene applies) vs. stray (should be off, yet some light is
   * on — turned on outside Homex). A room's switch turns on with any of its
   * parts, so for a room "should be off" means no active scene. */
  _lightState(e) {
    const t = this.unit;
    return !t.group_id && e ? this.hass.states[t.switch]?.attributes?.active_scene != null ? "lit" : "stray" : e ? "lit" : (t.devices ?? []).some((i) => this._isOn(i)) || this._isOn(t.light) ? "stray" : "off";
  }
  _toggle(e) {
    e.stopPropagation();
    const t = this.unit;
    if (t.group_id) {
      this.hass.callService("switch", "toggle", { entity_id: t.switch });
      return;
    }
    const s = this.hass.states[t.switch]?.attributes?.active_scene != null;
    this.hass.callService("switch", s ? "turn_off" : "turn_on", {
      entity_id: t.switch
    });
  }
  render() {
    const e = this.unit, t = this._isOn(e.switch), s = this._lightState(t), i = s === "lit" ? `Allumée${this.activeScene ? ` · ${this.activeScene}` : ""} — éteindre` : s === "stray" ? "Éteinte, mais au moins une lumière est allumée — allumer" : "Allumer";
    return n`
      <div class="controls">
        ${this.hideToggle ? "" : n`<button
              class="bulb ${t ? "on" : ""}"
              title=${i}
              @click=${this._toggle}
            >
              <svg viewBox="0 0 24 24">
                <path
                  d=${s === "lit" ? Bi : s === "stray" ? Ni : Ui}
                ></path>
              </svg>
            </button>`}
        ${this.areaIcon ? n`<ha-icon class="area-icon" .icon=${this.areaIcon}></ha-icon>` : ""}
        <div class="title">
          <div class="line1">
            <strong>${e.name}</strong>
          </div>
          ${this.hideId && !this.floorName ? "" : n`<div class="line2">
                ${this.hideId ? "" : n`<span class="rid">${e.group_id || e.room_id}</span>`}
                ${this.floorName ? n`<span class="floor">${this.floorName}</span>` : ""}
              </div>`}
        </div>
        ${this.info.length ? n`<div class="info">${this.info.map((r) => n`<span>${r}</span>`)}</div>` : ""}
      </div>
    `;
  }
};
de.styles = [
  C,
  y`
      :host {
        display: block;
        min-width: 0;
      }
      .controls {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .bulb {
        flex: 0 0 auto;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        cursor: pointer;
        background: var(--secondary-background-color, #f0f0f0);
        color: var(--secondary-text-color);
      }
      .bulb:hover {
        filter: brightness(0.95);
      }
      .bulb.on {
        background: var(--state-active-color, #ffc107);
        color: #222;
      }
      .bulb svg {
        width: 24px;
        height: 24px;
        fill: currentColor;
      }
      .area-icon {
        flex: 0 0 auto;
        --mdc-icon-size: 22px;
        color: var(--secondary-text-color);
      }
      .title {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .info {
        display: flex;
        flex-direction: column;
        flex: none;
        font-size: 11px;
        line-height: 1.3;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .line1 {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .line2 {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 4px 8px;
      }
      strong {
        font-size: 17px;
        overflow-wrap: anywhere;
      }
      .group strong {
        font-size: 15px;
        font-weight: 500;
      }
      .rid {
        font-size: 12px;
        color: var(--secondary-text-color);
        overflow-wrap: anywhere;
      }
      .floor {
        font-size: 12px;
        color: var(--secondary-text-color);
        background: var(--secondary-background-color, #f0f0f0);
        border-radius: 6px;
        padding: 1px 8px;
      }
    `
];
we([
  h({ attribute: !1 })
], de.prototype, "hass", 2);
we([
  h({ attribute: !1 })
], de.prototype, "unit", 2);
we([
  h({ attribute: !1 })
], de.prototype, "areaIcon", 2);
we([
  h({ attribute: !1 })
], de.prototype, "floorName", 2);
we([
  h({ attribute: !1 })
], de.prototype, "activeScene", 2);
we([
  h({ type: Boolean })
], de.prototype, "hideToggle", 2);
we([
  h({ type: Boolean })
], de.prototype, "hideId", 2);
we([
  h({ attribute: !1 })
], de.prototype, "info", 2);
de = we([
  $("homex-unit-controls")
], de);
const P = (e, t, s, i = "") => n`<div class="field">
  <span>${e}</span>
  <input
    .value=${t ?? ""}
    placeholder=${i}
    @input=${(r) => s(r.target.value)}
  />
</div>`, _e = (e, t, s = !1) => n`<span class="toggle ${e ? "on" : ""}">
  <input
    type="checkbox"
    .checked=${e}
    ?disabled=${s}
    @change=${(i) => t(i.target.checked)}
  />
  <span class="knob"></span>
</span>`, Kr = /[̀-ͯ]/g, E = (e) => (e || "").normalize("NFD").replace(Kr, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
var Yr = Object.defineProperty, Xr = Object.getOwnPropertyDescriptor, St = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Xr(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && Yr(t, s, r), r;
};
let Ge = class extends b {
  constructor() {
    super(...arguments), this.open = !1, this.heading = "", this.compact = !1;
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  render() {
    return this.open ? n`
      <div
        class="backdrop"
        @click=${(e) => {
      e.target === e.currentTarget && this._close();
    }}
      >
        <div class="dialog" role="dialog" aria-modal="true">
          <header>
            <h2>${this.heading}</h2>
            <button class="x" title="Fermer" @click=${this._close}>×</button>
          </header>
          <div class="content"><slot></slot></div>
          <div class="footer"><slot name="actions"></slot></div>
        </div>
      </div>
    ` : n``;
  }
};
Ge.styles = y`
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2vh 2vw;
      box-sizing: border-box;
    }
    .dialog {
      width: 96vw;
      max-width: 1100px;
      height: 96vh;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      border-radius: 14px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }
    .x {
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 22px;
      line-height: 1;
      color: var(--secondary-text-color);
    }
    .content {
      flex: 1;
      padding: 20px 24px;
      overflow: auto;
    }
    .footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 20px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }
    :host([compact]) .dialog {
      max-width: 440px;
      height: auto;
      max-height: 96vh;
    }
    @media (max-width: 600px) {
      .content {
        padding: 16px 14px;
      }
      header,
      .footer {
        padding-left: 14px;
        padding-right: 14px;
      }
    }
  `;
St([
  h({ type: Boolean })
], Ge.prototype, "open", 2);
St([
  h()
], Ge.prototype, "heading", 2);
St([
  h({ type: Boolean, reflect: !0 })
], Ge.prototype, "compact", 2);
Ge = St([
  $("homex-dialog")
], Ge);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Jr = { CHILD: 2 }, Zs = (e) => (...t) => ({ _$litDirective$: e, values: t });
let Gs = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, s, i) {
    this._$Ct = t, this._$AM = s, this._$Ci = i;
  }
  _$AS(t, s) {
    return this.update(t, s);
  }
  update(t, s) {
    return this.render(...s);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { I: Qr } = ki, hs = (e) => e, us = () => document.createComment(""), ot = (e, t, s) => {
  const i = e._$AA.parentNode, r = t === void 0 ? e._$AB : t._$AA;
  if (s === void 0) {
    const o = i.insertBefore(us(), r), a = i.insertBefore(us(), r);
    s = new Qr(o, a, e, e.options);
  } else {
    const o = s._$AB.nextSibling, a = s._$AM, c = a !== e;
    if (c) {
      let d;
      s._$AQ?.(e), s._$AM = e, s._$AP !== void 0 && (d = e._$AU) !== a._$AU && s._$AP(d);
    }
    if (o !== r || c) {
      let d = s._$AA;
      for (; d !== o; ) {
        const p = hs(d).nextSibling;
        hs(i).insertBefore(d, r), d = p;
      }
    }
  }
  return s;
}, Oe = (e, t, s = e) => (e._$AI(t, s), e), eo = {}, Ks = (e, t = eo) => e._$AH = t, to = (e) => e._$AH, Mt = (e) => {
  e._$AR(), e._$AA.remove();
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ms = (e, t, s) => {
  const i = /* @__PURE__ */ new Map();
  for (let r = t; r <= s; r++) i.set(e[r], r);
  return i;
}, so = Zs(class extends Gs {
  constructor(e) {
    if (super(e), e.type !== Jr.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(e, t, s) {
    let i;
    s === void 0 ? s = t : t !== void 0 && (i = t);
    const r = [], o = [];
    let a = 0;
    for (const c of e) r[a] = i ? i(c, a) : a, o[a] = s(c, a), a++;
    return { values: o, keys: r };
  }
  render(e, t, s) {
    return this.dt(e, t, s).values;
  }
  update(e, [t, s, i]) {
    const r = to(e), { values: o, keys: a } = this.dt(t, s, i);
    if (!Array.isArray(r)) return this.ut = a, o;
    const c = this.ut ??= [], d = [];
    let p, m, u = 0, _ = r.length - 1, g = 0, f = o.length - 1;
    for (; u <= _ && g <= f; ) if (r[u] === null) u++;
    else if (r[_] === null) _--;
    else if (c[u] === a[g]) d[g] = Oe(r[u], o[g]), u++, g++;
    else if (c[_] === a[f]) d[f] = Oe(r[_], o[f]), _--, f--;
    else if (c[u] === a[f]) d[f] = Oe(r[u], o[f]), ot(e, d[f + 1], r[u]), u++, f--;
    else if (c[_] === a[g]) d[g] = Oe(r[_], o[g]), ot(e, r[u], r[_]), _--, g++;
    else if (p === void 0 && (p = ms(a, g, f), m = ms(c, u, _)), p.has(c[u])) if (p.has(c[_])) {
      const x = m.get(a[g]), it = x !== void 0 ? r[x] : null;
      if (it === null) {
        const ze = ot(e, r[u]);
        Oe(ze, o[g]), d[g] = ze;
      } else d[g] = Oe(it, o[g]), ot(e, r[u], it), r[x] = null;
      g++;
    } else Mt(r[_]), _--;
    else Mt(r[u]), u++;
    for (; g <= f; ) {
      const x = ot(e, d[f + 1]);
      Oe(x, o[g]), d[g++] = x;
    }
    for (; u <= _; ) {
      const x = r[u++];
      x !== null && Mt(x);
    }
    return this.ut = a, Ks(e, d), Ve;
  }
});
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const io = Zs(class extends Gs {
  constructor() {
    super(...arguments), this.key = k;
  }
  render(e, t) {
    return this.key = e, t;
  }
  update(e, [t, s]) {
    return t !== this.key && (Ks(e), this.key = t), s;
  }
});
var ro = Object.defineProperty, oo = Object.getOwnPropertyDescriptor, Be = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? oo(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && ro(t, s, r), r;
};
let $e = class extends b {
  constructor() {
    super(...arguments), this.value = [], this._query = "", this._open = !1;
  }
  _friendly(e) {
    return this.hass?.states?.[e]?.attributes?.friendly_name || e;
  }
  _emit(e) {
    this.value = e, this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: e } }));
  }
  _setAt(e, t) {
    const s = t ? this.value.map((i, r) => r === e ? t : i) : this.value.filter((i, r) => r !== e);
    this._emit([...new Set(s)]);
  }
  _addNew(e) {
    e && !this.value.includes(e) && this._emit([...this.value, e]);
  }
  _nativePicker(e, t, s) {
    return n`<ha-entity-picker
      .hass=${this.hass}
      .value=${e}
      .includeDomains=${this.includeDomains}
      .includeEntities=${this.includeEntities}
      .excludeEntities=${t}
      @value-changed=${(i) => {
      i.stopPropagation(), s(i.detail.value || "");
    }}
    ></ha-entity-picker>`;
  }
  render() {
    return customElements.get("ha-entity-picker") ? n`
        ${so(
      this.value,
      (e) => e,
      (e, t) => this._nativePicker(
        e,
        this.value.filter((s, i) => i !== t),
        (s) => this._setAt(t, s)
      )
    )}
        ${io(
      this.value.length,
      this._nativePicker("", this.value, (e) => this._addNew(e))
    )}
      ` : this._renderFallback();
  }
  // --- fallback widget ---------------------------------------------------
  get _candidates() {
    if (this.includeEntities) return [...this.includeEntities].sort();
    const e = this.includeDomains || [];
    return Object.keys(this.hass.states).filter((t) => e.includes(t.split(".")[0])).sort();
  }
  get _filtered() {
    const e = new Set(this.value), t = this._query.trim().toLowerCase();
    return this._candidates.filter((s) => !e.has(s)).filter(
      (s) => !t || s.toLowerCase().includes(t) || this._friendly(s).toLowerCase().includes(t)
    ).slice(0, 10);
  }
  _add(e) {
    this.value.includes(e) || this._emit([...this.value, e]), this._query = "", this._open = !1;
  }
  _remove(e) {
    this._emit(this.value.filter((t) => t !== e));
  }
  _renderFallback() {
    return n`
      <div class="chips">
        ${this.value.map(
      (e) => n`<span class="chip"
              >${this._friendly(e)}<button
                class="chipx"
                title="Retirer"
                @click=${() => this._remove(e)}
              >
                ×</button
              ></span
            >`
    )}
      </div>
      <input
        .value=${this._query}
        placeholder="Rechercher une entité…"
        autocomplete="off"
        @focus=${() => this._open = !0}
        @input=${(e) => {
      this._query = e.target.value, this._open = !0;
    }}
        @blur=${() => setTimeout(() => this._open = !1, 200)}
      />
      ${this._open ? n`<div class="suggestions">
            ${this._filtered.length ? this._filtered.map(
      (e) => n`<div class="sugg" @mousedown=${() => this._add(e)}>
                    <span>${this._friendly(e)}</span><span class="sid">${e}</span>
                  </div>`
    ) : n`<div class="sugg empty">Aucune entité</div>`}
          </div>` : ""}
    `;
  }
};
$e.styles = y`
    :host {
      display: block;
      width: 100%;
      position: relative;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      background: var(--secondary-background-color, #eee);
      border-radius: 16px;
      padding: 6px 6px 6px 14px;
    }
    .chipx {
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      padding: 0 6px;
      border-radius: 50%;
      color: var(--secondary-text-color);
    }
    input {
      width: 100%;
      box-sizing: border-box;
      padding: 13px 14px;
      font-size: 16px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
    }
    input:focus {
      outline: none;
      border-color: var(--primary-color, #03a9f4);
      box-shadow: 0 0 0 1px var(--primary-color, #03a9f4);
    }
    .suggestions {
      position: absolute;
      z-index: 20;
      left: 0;
      right: 0;
      margin-top: 2px;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 6px;
      max-height: 240px;
      overflow: auto;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
    }
    .sugg {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      padding: 11px 14px;
      cursor: pointer;
      font-size: 15px;
    }
    .sugg:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }
    .sid {
      color: var(--secondary-text-color);
      font-size: 11px;
    }
    .empty {
      cursor: default;
      color: var(--secondary-text-color);
    }
    ha-entity-picker {
      display: block;
      width: 100%;
      margin-bottom: 8px;
    }
  `;
Be([
  h({ attribute: !1 })
], $e.prototype, "hass", 2);
Be([
  h({ type: Array })
], $e.prototype, "value", 2);
Be([
  h({ attribute: !1 })
], $e.prototype, "includeDomains", 2);
Be([
  h({ attribute: !1 })
], $e.prototype, "includeEntities", 2);
Be([
  l()
], $e.prototype, "_query", 2);
Be([
  l()
], $e.prototype, "_open", 2);
$e = Be([
  $("homex-entity-picker")
], $e);
const ao = ["light", "switch", "input_boolean"], _s = [
  "binary_sensor",
  "switch",
  "input_boolean",
  "person",
  "device_tracker"
];
var no = Object.defineProperty, lo = Object.getOwnPropertyDescriptor, ut = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? lo(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && no(t, s, r), r;
};
let Ne = class extends b {
  constructor() {
    super(...arguments), this.value = "", this._query = "", this._open = !1;
  }
  _name(e) {
    const t = this.hass?.devices?.[e];
    return t?.name_by_user || t?.name || e;
  }
  _emit(e) {
    this.value = e, this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: e } }));
  }
  get _filtered() {
    const e = this._query.trim().toLowerCase();
    return Object.keys(this.hass.devices || {}).filter((t) => !e || this._name(t).toLowerCase().includes(e)).sort((t, s) => this._name(t).localeCompare(this._name(s))).slice(0, 12);
  }
  render() {
    return customElements.get("ha-device-picker") ? n`<ha-device-picker
        .hass=${this.hass}
        .value=${this.value}
        @value-changed=${(e) => {
      e.stopPropagation(), this._emit(e.detail.value || "");
    }}
      ></ha-device-picker>` : this.value ? n`<div class="selected">
        <span class="name">${this._name(this.value)}</span>
        <button class="clear" title="Effacer" @click=${() => this._emit("")}>×</button>
      </div>` : n`
      <input
        .value=${this._query}
        placeholder="Rechercher un appareil…"
        autocomplete="off"
        @focus=${() => this._open = !0}
        @input=${(e) => {
      this._query = e.target.value, this._open = !0;
    }}
        @blur=${() => setTimeout(() => this._open = !1, 200)}
      />
      ${this._open ? n`<div class="suggestions">
            ${this._filtered.length ? this._filtered.map(
      (e) => n`<div
                      class="sugg"
                      @mousedown=${() => {
        this._query = "", this._open = !1, this._emit(e);
      }}
                    >
                      ${this._name(e)}
                    </div>`
    ) : n`<div class="sugg">Aucun appareil</div>`}
          </div>` : ""}
    `;
  }
};
Ne.styles = y`
    :host {
      display: block;
      width: 100%;
      position: relative;
    }
    .selected {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 13px 12px;
      border-radius: 4px 4px 0 0;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      background: var(--input-fill-color, rgba(225, 225, 225, 0.06));
      font-size: 15px;
    }
    .selected .name {
      flex: 1;
    }
    .clear {
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--secondary-text-color);
      font-size: 18px;
      line-height: 1;
      padding: 0 4px;
    }
    input {
      width: 100%;
      box-sizing: border-box;
      padding: 13px 12px;
      font-size: 15px;
      border: none;
      border-radius: 4px 4px 0 0;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      background: var(--input-fill-color, rgba(225, 225, 225, 0.06));
      color: var(--primary-text-color);
    }
    input:focus {
      outline: none;
      border-bottom: 2px solid var(--primary-color, #009ac7);
    }
    .suggestions {
      position: absolute;
      z-index: 40;
      left: 0;
      right: 0;
      margin-top: 2px;
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      border-radius: 6px;
      max-height: 260px;
      overflow: auto;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
    }
    .sugg {
      padding: 11px 14px;
      cursor: pointer;
      font-size: 15px;
    }
    .sugg:hover {
      background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
    }
  `;
ut([
  h({ attribute: !1 })
], Ne.prototype, "hass", 2);
ut([
  h()
], Ne.prototype, "value", 2);
ut([
  l()
], Ne.prototype, "_query", 2);
ut([
  l()
], Ne.prototype, "_open", 2);
Ne = ut([
  $("homex-device-field")
], Ne);
var co = Object.defineProperty, po = Object.getOwnPropertyDescriptor, fe = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? po(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && co(t, s, r), r;
};
const bt = 320;
let ie = class extends b {
  constructor() {
    super(...arguments), this.value = "", this.label = "", this.placeholder = "", this.options = [], this.groups = [], this.disabled = !1, this._open = !1, this._active = -1, this._pos = {}, this._none = { value: "", label: "" }, this._onOutside = (e) => {
      e.composedPath().includes(this) || this._close();
    }, this._onViewport = (e) => {
      e.type === "scroll" && e.composedPath().includes(this) || this._close();
    };
  }
  /** Every option, flat: the placeholder one, then ungrouped, then groups. */
  get _flat() {
    return [...this.placeholder ? [this._none] : [], ...this.options, ...this.groups.flatMap((t) => t.options)];
  }
  get _selected() {
    return [...this.options, ...this.groups.flatMap((e) => e.options)].find(
      (e) => e.value === this.value
    );
  }
  willUpdate() {
    this._none.label = this.placeholder;
  }
  disconnectedCallback() {
    this._close(), super.disconnectedCallback();
  }
  _openPanel() {
    if (this.disabled || this._open) return;
    const t = this.renderRoot.querySelector(".trigger").getBoundingClientRect(), s = window.innerHeight - t.bottom, i = s < Math.min(bt, 220) && t.top > s;
    this._pos = {
      left: `${t.left}px`,
      width: `${t.width}px`,
      ...i ? { bottom: `${window.innerHeight - t.top + 6}px`, maxHeight: `${Math.min(bt, t.top - 12)}px` } : { top: `${t.bottom + 6}px`, maxHeight: `${Math.min(bt, s - 12)}px` }
    }, this._active = Math.max(0, this._flat.findIndex((r) => r.value === this.value)), this._open = !0, document.addEventListener("pointerdown", this._onOutside, !0), window.addEventListener("scroll", this._onViewport, !0), window.addEventListener("resize", this._onViewport), this.updateComplete.then(() => this._scrollActive());
  }
  _close() {
    this._open && (this._open = !1, document.removeEventListener("pointerdown", this._onOutside, !0), window.removeEventListener("scroll", this._onViewport, !0), window.removeEventListener("resize", this._onViewport));
  }
  _pick(e) {
    e.disabled || (this._close(), this.renderRoot.querySelector(".trigger")?.focus(), e.value !== this.value && (this.value = e.value, this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: e.value } }))));
  }
  _move(e) {
    const t = this._flat;
    if (!t.length) return;
    let s = this._active;
    for (let i = 0; i < t.length && (s = (s + e + t.length) % t.length, !!t[s].disabled); i++)
      ;
    this._active = s, this.updateComplete.then(() => this._scrollActive());
  }
  _scrollActive() {
    this.renderRoot.querySelector(".option.active")?.scrollIntoView({ block: "nearest" });
  }
  _onKey(e) {
    if (!this._open) {
      ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key) && (e.preventDefault(), this._openPanel());
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp")
      e.preventDefault(), this._move(e.key === "ArrowDown" ? 1 : -1);
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const t = this._flat[this._active];
      t && this._pick(t);
    } else e.key === "Escape" ? (e.preventDefault(), this._close()) : e.key === "Tab" && this._close();
  }
  _renderOption(e) {
    const t = this._flat.indexOf(e), s = e.value === this.value;
    return n`<div
      class="option ${s ? "selected" : ""} ${t === this._active ? "active" : ""} ${e.disabled ? "disabled" : ""}"
      role="option"
      aria-selected=${s ? "true" : "false"}
      aria-disabled=${e.disabled ? "true" : "false"}
      @pointerenter=${() => !e.disabled && (this._active = t)}
      @click=${() => this._pick(e)}
    >
      <div class="texts">
        <span class="line">
          <span class="primary">${e.label}</span>
          ${e.tertiary ? n`<span class="tertiary">${e.tertiary}</span>` : k}
        </span>
        ${e.secondary ? n`<span class="secondary">${e.secondary}</span>` : k}
      </div>
      ${s ? n`<svg class="check" viewBox="0 0 24 24"><path d=${zi}></path></svg>` : k}
    </div>`;
  }
  render() {
    const e = this._selected, t = Object.entries(this._pos).map(([s, i]) => `${s.replace(/[A-Z]/g, (r) => "-" + r.toLowerCase())}:${i}`).join(";");
    return n`
      ${this.label ? n`<span class="label">${this.label}</span>` : k}
      <button
        type="button"
        class="trigger ${this._open ? "open" : ""}"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded=${this._open ? "true" : "false"}
        aria-label=${this.label || this.placeholder}
        ?disabled=${this.disabled}
        @click=${() => this._open ? this._close() : this._openPanel()}
        @keydown=${this._onKey}
      >
        <span class="value">
          ${e ? n`<span class="primary">${e.label}</span>${e.secondary ? n`<span class="secondary">${e.secondary}</span>` : k}` : n`<span class="placeholder">${this.placeholder || "—"}</span>`}
        </span>
        <svg class="chevron" viewBox="0 0 24 24"><path d=${Ps}></path></svg>
      </button>
      ${this._open ? n`<div class="panel" role="listbox" style=${t}>
            ${this.placeholder ? this._renderOption(this._none) : k}
            ${this.options.map((s) => this._renderOption(s))}
            ${this.groups.map(
      (s) => n`<div class="group">${s.label}</div>
                ${s.options.map((i) => this._renderOption(i))}`
    )}
            ${this._flat.length ? k : n`<div class="empty">Aucune option</div>`}
          </div>` : k}
    `;
  }
};
ie.styles = y`
    :host {
      display: block;
      min-width: 0;
    }
    .label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      color: var(--secondary-text-color);
    }
    .trigger {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      min-height: 48px;
      box-sizing: border-box;
      margin: 0;
      padding: 10px 48px 10px 16px;
      font: inherit;
      font-size: 15px;
      text-align: left;
      color: var(--primary-text-color);
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
      border: 1px solid transparent;
      border-radius: 12px;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .trigger:hover {
      border-color: var(--divider-color, rgba(127, 127, 127, 0.4));
    }
    .trigger:focus-visible,
    .trigger.open {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 25%, transparent);
    }
    .trigger:disabled {
      opacity: 0.5;
      cursor: default;
    }
    .value {
      display: flex;
      align-items: baseline;
      gap: 8px;
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
    }
    /* The primary info keeps its room; the secondary shrinks first. */
    .value .primary {
      flex: 0 0 auto;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .value .secondary {
      flex: 1 1 0;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 13px;
      color: var(--secondary-text-color);
    }
    .placeholder {
      color: var(--secondary-text-color);
    }
    .chevron {
      position: absolute;
      top: 50%;
      right: 14px;
      width: 22px;
      height: 22px;
      transform: translateY(-50%);
      fill: var(--secondary-text-color);
      pointer-events: none;
      transition: transform 0.15s, fill 0.15s;
    }
    .trigger.open .chevron {
      transform: translateY(-50%) rotate(180deg);
      fill: var(--primary-color);
    }
    .panel {
      position: fixed;
      z-index: 2000;
      box-sizing: border-box;
      max-height: ${bt}px;
      overflow-y: auto;
      padding: 6px;
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 14px;
      box-shadow: 0 10px 32px rgba(0, 0, 0, 0.35);
    }
    .group {
      padding: 10px 12px 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--secondary-text-color);
    }
    .option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 12px;
      margin: 1px 0;
      border-radius: 10px;
      cursor: pointer;
    }
    .option.active {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    }
    .option.selected .primary {
      color: var(--primary-color);
      font-weight: 500;
    }
    .option.disabled {
      opacity: 0.45;
      cursor: default;
    }
    .texts {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      line-height: 1.3;
    }
    .line {
      display: flex;
      align-items: baseline;
      gap: 6px;
      min-width: 0;
    }
    .texts .primary {
      font-size: 15px;
      color: var(--primary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .texts .secondary {
      font-size: 12px;
      color: var(--secondary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .texts .tertiary {
      flex: none;
      font-size: 12px;
      color: var(--secondary-text-color);
      opacity: 0.75;
      white-space: nowrap;
    }
    .texts .tertiary::before {
      content: "·";
      margin-right: 6px;
    }
    .check {
      flex: none;
      width: 20px;
      height: 20px;
      fill: var(--primary-color);
    }
    .empty {
      padding: 12px;
      font-size: 14px;
      color: var(--secondary-text-color);
    }
  `;
fe([
  h()
], ie.prototype, "value", 2);
fe([
  h()
], ie.prototype, "label", 2);
fe([
  h()
], ie.prototype, "placeholder", 2);
fe([
  h({ attribute: !1 })
], ie.prototype, "options", 2);
fe([
  h({ attribute: !1 })
], ie.prototype, "groups", 2);
fe([
  h({ type: Boolean, reflect: !0 })
], ie.prototype, "disabled", 2);
fe([
  l()
], ie.prototype, "_open", 2);
fe([
  l()
], ie.prototype, "_active", 2);
fe([
  l()
], ie.prototype, "_pos", 2);
ie = fe([
  $("homex-select")
], ie);
var ho = Object.defineProperty, uo = Object.getOwnPropertyDescriptor, mt = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? uo(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && ho(t, s, r), r;
};
let Re = class extends b {
  constructor() {
    super(...arguments), this.value = [], this._menuOpen = !1, this._devTriggers = {};
  }
  willUpdate(e) {
    if (e.has("value"))
      for (const t of this.value) t?.device_id && this._ensure(t.device_id);
  }
  async _ensure(e) {
    if (!(e in this._devTriggers)) {
      this._devTriggers = { ...this._devTriggers, [e]: [] };
      try {
        const t = await Ts(this.hass, e);
        this._devTriggers = { ...this._devTriggers, [e]: t };
      } catch {
      }
    }
  }
  _emit(e) {
    this.value = e, this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: e } }));
  }
  _update(e, t) {
    this._emit(this.value.map((s, i) => i === e ? t : s));
  }
  _remove(e) {
    this._emit(this.value.filter((t, s) => s !== e));
  }
  _add(e) {
    this._menuOpen = !1, this._emit([
      ...this.value,
      e === "device" ? { platform: "device", device_id: "" } : { platform: "state" }
    ]);
  }
  _entityOf(e) {
    const t = e?.entity_id;
    return Array.isArray(t) ? t[0] || "" : t || "";
  }
  _deviceTriggerIndex(e) {
    return (this._devTriggers[e.device_id] || []).findIndex(
      (s) => s.trigger.type === e.type && s.trigger.subtype === e.subtype && s.trigger.domain === e.domain
    );
  }
  _deviceName(e) {
    const t = this.hass?.devices?.[e];
    return t?.name_by_user || t?.name || e;
  }
  // -- Entity (state / numeric_state) trigger, like the automation editor ---
  _entityType(e) {
    return e?.platform === "numeric_state" ? "numeric" : "state";
  }
  _entityStates(e) {
    const t = e.split(".")[0], s = [
      "light",
      "switch",
      "input_boolean",
      "binary_sensor",
      "fan",
      "cover",
      "lock",
      "automation",
      "script",
      "group",
      "media_player"
    ], i = new Set(s.includes(t) ? ["on", "off"] : []), r = this.hass.states[e]?.state;
    return r && !["unavailable", "unknown", ""].includes(r) && i.add(r), [...i];
  }
  _setKey(e, t, s, i) {
    const r = { ...t };
    i === "" || i === null || i === void 0 ? delete r[s] : r[s] = i, this._update(e, r);
  }
  _setEntity(e, t, s) {
    const i = t?.platform === "numeric_state" ? "numeric_state" : "state";
    this._update(e, s ? { platform: i, entity_id: s } : { platform: i });
  }
  _setEntityType(e, t, s) {
    const i = {
      platform: s === "numeric" ? "numeric_state" : "state",
      entity_id: this._entityOf(t)
    };
    t.attribute && (i.attribute = t.attribute), t.for && (i.for = t.for), this._update(e, i);
  }
  _entityField(e, t) {
    const s = this._entityOf(e), i = (o) => this._setEntity(t, e, o);
    if (customElements.get("ha-entity-picker"))
      return n`<ha-entity-picker
        .hass=${this.hass}
        .value=${s}
        .includeDomains=${_s}
        allow-custom-entity
        @value-changed=${(o) => {
        o.stopPropagation(), i(o.detail.value || "");
      }}
      ></ha-entity-picker>`;
    const r = Object.keys(this.hass.states).filter((o) => _s.includes(o.split(".")[0])).sort();
    return n`<homex-select
      placeholder="Sélectionnez une entité"
      .value=${s ?? ""}
      .options=${r.map((o) => ({
      value: o,
      label: this.hass.states[o]?.attributes?.friendly_name || o,
      secondary: o
    }))}
      @value-changed=${(o) => i(o.detail.value)}
    ></homex-select>`;
  }
  _entityTypeField(e, t) {
    const s = this._entityType(e);
    return n`<label class="field"><span>Type</span>
      <homex-select
        .value=${s}
        .options=${[
      { value: "state", label: "État" },
      { value: "numeric", label: "État numérique" }
    ]}
        @value-changed=${(i) => this._setEntityType(t, e, i.detail.value)}
      ></homex-select>
    </label>`;
  }
  _attrField(e, t) {
    const s = this._entityOf(e), i = Object.keys(this.hass.states[s]?.attributes || {}), r = e.attribute || "";
    return n`<label class="field"><span>Attribut (facultatif)</span>
      <homex-select
        placeholder="(état de l'entité)"
        .value=${r}
        .options=${i.map((o) => ({ value: o, label: o }))}
        @value-changed=${(o) => this._setKey(t, e, "attribute", o.detail.value)}
      ></homex-select>
    </label>`;
  }
  _stateValueField(e, t, s, i) {
    const r = this._entityOf(e), o = e[s] != null ? String(e[s]) : "", a = `st-${t}-${s}`;
    return n`<label class="field"><span>${i}</span>
      <input
        class="native"
        list=${a}
        .value=${o}
        @change=${(c) => this._setKey(t, e, s, c.target.value)}
      />
      <datalist id=${a}>
        ${this._entityStates(r).map((c) => n`<option value=${c}></option>`)}
      </datalist>
    </label>`;
  }
  _numField(e, t, s, i) {
    const r = e[s] != null ? String(e[s]) : "";
    return n`<label class="field"><span>${i}</span>
      <input
        class="native"
        type="number"
        .value=${r}
        @change=${(o) => {
      const a = o.target.value;
      this._setKey(t, e, s, a === "" ? "" : Number(a));
    }}
      />
    </label>`;
  }
  _forParts(e) {
    const t = e.for;
    if (t && typeof t == "object")
      return { h: t.hours || 0, m: t.minutes || 0, s: t.seconds || 0 };
    if (typeof t == "string") {
      const s = t.split(":").map(Number);
      return { h: s[0] || 0, m: s[1] || 0, s: s[2] || 0 };
    }
    return typeof t == "number" ? { h: 0, m: 0, s: t } : { h: 0, m: 0, s: 0 };
  }
  _setForPart(e, t, s, i) {
    const r = this._forParts(e);
    r[s] = isNaN(i) || i < 0 ? 0 : Math.floor(i);
    const o = r.h + r.m + r.s;
    this._setKey(
      t,
      e,
      "for",
      o ? { hours: r.h, minutes: r.m, seconds: r.s } : ""
    );
  }
  _forField(e, t) {
    const s = this._forParts(e), i = (r, o, a) => n`<input
      type="number"
      min="0"
      placeholder=${a}
      .value=${o ? String(o) : ""}
      @change=${(c) => this._setForPart(e, t, r, Number(c.target.value))}
    />`;
    return n`<label class="field"><span>Pendant (facultatif)</span>
      <div class="dur-row">
        ${i("h", s.h, "hh")}<span>:</span>${i("m", s.m, "mm")}<span>:</span>${i("s", s.s, "ss")}
      </div>
    </label>`;
  }
  _entityBody(e, t) {
    if (!this._entityOf(e)) return "";
    const s = this._entityType(e) === "numeric";
    return n`
      ${this._entityTypeField(e, t)}
      ${this._attrField(e, t)}
      ${s ? n`${this._numField(e, t, "above", "Au-dessus de (facultatif)")}
            ${this._numField(e, t, "below", "En-dessous de (facultatif)")}` : n`${this._stateValueField(e, t, "from", "De (facultatif)")}
            ${this._stateValueField(e, t, "to", "À (facultatif)")}`}
      ${this._forField(e, t)}
    `;
  }
  _deviceField(e, t) {
    return n`<homex-device-field
      .hass=${this.hass}
      .value=${e.device_id || ""}
      @value-changed=${(s) => {
      s.stopPropagation();
      const i = s.detail.value || "";
      i && this._ensure(i), this._update(t, { platform: "device", device_id: i });
    }}
    ></homex-device-field>`;
  }
  _actionField(e, t) {
    const s = this._devTriggers[e.device_id] || [], i = this._deviceTriggerIndex(e);
    return n`<homex-select
      placeholder="Sélectionnez une action"
      .value=${i >= 0 ? String(i) : ""}
      .options=${s.map((r, o) => ({ value: String(o), label: r.label }))}
      @value-changed=${(r) => {
      const o = (this._devTriggers[e.device_id] || [])[Number(r.detail.value)];
      o && this._update(t, { ...o.trigger });
    }}
    ></homex-select>`;
  }
  _card(e, t) {
    const s = !!e?.device_id || e?.platform === "device";
    return n`<div class="card">
      <div class="head">
        <svg viewBox="0 0 24 24"><path d=${s ? ls : cs}></path></svg>
        <span class="title">${s ? "Appareil" : "Entité"}</span>
        <button class="icon-btn" title="Supprimer" @click=${() => this._remove(t)}>
          <svg viewBox="0 0 24 24"><path d=${Oi}></path></svg>
        </button>
      </div>
      <div class="body">
        ${s ? n`<label class="field"><span>Appareil</span>${this._deviceField(e, t)}</label>
              ${e.device_id ? n`<label class="field"><span>Action</span>${this._actionField(e, t)}</label>` : ""}` : n`<label class="field"><span>Entité</span>${this._entityField(e, t)}</label>
              ${this._entityBody(e, t)}`}
      </div>
    </div>`;
  }
  render() {
    return n`
      ${this.value.map((e, t) => this._card(e, t))}
      <div class="add-wrap">
        <button class="add-btn" @click=${() => this._menuOpen = !this._menuOpen}>
          <svg viewBox="0 0 24 24"><path d=${Gt}></path></svg>
          Ajouter un déclencheur
        </button>
        ${this._menuOpen ? n`
              <div class="backdrop" @click=${() => this._menuOpen = !1}></div>
              <div class="menu">
                <button @click=${() => this._add("entity")}>
                  <svg viewBox="0 0 24 24"><path d=${cs}></path></svg> Entité
                </button>
                <button @click=${() => this._add("device")}>
                  <svg viewBox="0 0 24 24"><path d=${ls}></path></svg> Appareil
                </button>
              </div>
            ` : ""}
      </div>
    `;
  }
};
Re.styles = y`
    :host {
      display: block;
      width: 100%;
    }
    .card {
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      border-radius: 12px;
      margin-bottom: 12px;
      /* No overflow:hidden — it would clip the device search dropdown. */
      position: relative;
    }
    .head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 8px 12px 16px;
      border-bottom: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
    }
    .head svg {
      width: 22px;
      height: 22px;
      fill: var(--secondary-text-color);
      flex: 0 0 auto;
    }
    .head .title {
      flex: 1;
      font-size: 15px;
      font-weight: 500;
    }
    .icon-btn {
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 6px;
      border-radius: 50%;
      display: inline-flex;
      color: var(--secondary-text-color);
    }
    .icon-btn:hover {
      background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
    }
    .icon-btn svg {
      width: 22px;
      height: 22px;
      fill: currentColor;
    }
    .body {
      padding: 12px 16px 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    label.field {
      display: block;
    }
    label.field > span {
      display: block;
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-bottom: 6px;
    }
    ha-entity-picker,
    ha-device-picker {
      display: block;
      width: 100%;
    }
    input.native {
      width: 100%;
      box-sizing: border-box;
      padding: 14px 12px;
      font-size: 15px;
      border: none;
      border-radius: 4px 4px 0 0;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      background: var(--input-fill-color, rgba(225, 225, 225, 0.06));
      color: var(--primary-text-color);
    }
    input.native:focus {
      outline: none;
      border-bottom: 2px solid var(--primary-color, #009ac7);
    }
    .dur-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dur-row input {
      width: 64px;
      box-sizing: border-box;
      padding: 12px 8px;
      font-size: 15px;
      text-align: center;
      border: none;
      border-radius: 4px 4px 0 0;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      background: var(--input-fill-color, rgba(225, 225, 225, 0.06));
      color: var(--primary-text-color);
    }
    .dur-row span {
      color: var(--secondary-text-color);
    }
    .add-wrap {
      position: relative;
      display: inline-block;
    }
    .add-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      border: none;
      border-radius: 24px;
      padding: 9px 20px 9px 14px;
      font-size: 14px;
      font-weight: 500;
      background: var(--primary-color, #009ac7);
      color: var(--text-primary-color, #fff);
    }
    .add-btn svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
    .menu {
      position: absolute;
      z-index: 30;
      top: 46px;
      left: 0;
      min-width: 220px;
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      border-radius: 10px;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
      padding: 6px;
    }
    .menu button {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      text-align: left;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 12px 12px;
      border-radius: 8px;
      font-size: 15px;
      color: var(--primary-text-color);
    }
    .menu button:hover {
      background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
    }
    .menu button svg {
      width: 22px;
      height: 22px;
      fill: var(--secondary-text-color);
    }
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 29;
    }
  `;
mt([
  h({ attribute: !1 })
], Re.prototype, "hass", 2);
mt([
  h({ attribute: !1 })
], Re.prototype, "value", 2);
mt([
  l()
], Re.prototype, "_menuOpen", 2);
mt([
  l()
], Re.prototype, "_devTriggers", 2);
Re = mt([
  $("homex-trigger-selector")
], Re);
var mo = Object.defineProperty, _o = Object.getOwnPropertyDescriptor, Ys = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? _o(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && mo(t, s, r), r;
};
let $t = class extends b {
  constructor() {
    super(...arguments), this.triggers = [];
  }
  render() {
    return this.triggers?.length ? n`<div class="list">
      ${this.triggers.map(
      (e) => n`<div class="row">
          <span class="icon">🎛</span>
          <span class="lbl">${e}</span>
          <span class="tag">Géré par le module Switches</span>
        </div>`
    )}
    </div>` : n``;
  }
};
$t.styles = y`
    .list {
      margin: 6px 0 4px;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      margin-bottom: 4px;
      border: 1px dashed var(--divider-color, #ccc);
      border-radius: 8px;
      background: color-mix(in srgb, var(--primary-color) 6%, transparent);
      font-size: 13px;
    }
    .icon {
      flex: 0 0 auto;
    }
    .lbl {
      flex: 1;
      min-width: 0;
      color: var(--primary-text-color);
    }
    .tag {
      flex: 0 0 auto;
      font-size: 11px;
      color: var(--secondary-text-color);
      background: var(--secondary-background-color, rgba(128, 128, 128, 0.15));
      border-radius: 10px;
      padding: 2px 8px;
      white-space: nowrap;
    }
  `;
Ys([
  h({ attribute: !1 })
], $t.prototype, "triggers", 2);
$t = Ys([
  $("homex-managed-triggers")
], $t);
var go = Object.defineProperty, vo = Object.getOwnPropertyDescriptor, te = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? vo(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && go(t, s, r), r;
};
let F = class extends b {
  constructor() {
    super(...arguments), this.open = !1, this.group = null, this._name = "", this._id = "", this._devices = [], this._triggers = [], this._dim = !1, this._dimUp = [], this._dimDown = [], this._busy = !1, this._idEdited = !1;
  }
  willUpdate(e) {
    e.has("open") && this.open && (this._name = this.group?.name ?? "", this._id = this.group?.group_id ?? "", this._devices = this.group?.devices ?? [], this._triggers = (this.group?.triggers ?? []).map((t) => ({ ...t })), this._dim = this.group?.dim ?? !1, this._dimUp = (this.group?.dim_up_triggers ?? []).map((t) => ({ ...t })), this._dimDown = (this.group?.dim_down_triggers ?? []).map((t) => ({ ...t })), this._busy = !1, this._idEdited = !!this.group);
  }
  _onName(e) {
    this._name = e, this._idEdited || (this._id = E(e));
  }
  _onId(e) {
    this._id = e, this._idEdited = !0;
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  async _save() {
    const e = this._name.trim(), t = this._id.trim();
    if (!e || !t) {
      alert("Nom et id du groupe requis.");
      return;
    }
    const s = this._triggers, i = {
      dim: this._dim,
      dim_up_triggers: this._dim ? this._dimUp : [],
      dim_down_triggers: this._dim ? this._dimDown : []
    };
    this._busy = !0;
    try {
      this.group ? await wr(this.hass, {
        entry_id: this.room.entry_id,
        group_id: this.group.group_id,
        name: e,
        devices: this._devices,
        triggers: s,
        ...i
      }) : await $r(this.hass, {
        entry_id: this.room.entry_id,
        group_id: t,
        name: e,
        devices: this._devices,
        triggers: s,
        ...i
      }), U(this), this._close();
    } catch (r) {
      this._busy = !1, alert("Erreur Homex : " + v(r));
    }
  }
  async _delete() {
    if (this.group && confirm(`Supprimer le groupe "${this.group.name || this.group.group_id}" ?`)) {
      this._busy = !0;
      try {
        await kr(this.hass, this.room.entry_id, this.group.group_id), U(this), this._close();
      } catch (e) {
        this._busy = !1, alert("Erreur Homex : " + v(e));
      }
    }
  }
  render() {
    const e = !!this.group;
    return n`
      <homex-dialog
        .open=${this.open}
        heading=${e ? "Modifier le groupe" : "Nouveau groupe"}
        @dialog-closed=${this._close}
      >
        ${P("Nom", this._name, (t) => this._onName(t), "Table de chevet L")}
        ${e ? n`<div class="section">Id : ${this.group.group_id}</div>` : P("Id", this._id, (t) => this._onId(t), "bedside_l")}
        <div class="section">Appareils (parmi la pièce)</div>
        <homex-entity-picker
          .hass=${this.hass}
          .includeEntities=${this.room.devices}
          .value=${this._devices}
          @value-changed=${(t) => this._devices = t.detail.value}
        ></homex-entity-picker>
        <label class="dim-toggle">
          <span class="dim-name">Activer le dimming du groupe</span>
          <span class="toggle ${this._dim ? "on" : ""}">
            <input
              type="checkbox"
              .checked=${this._dim}
              @change=${(t) => this._dim = t.target.checked}
            />
            <span class="knob"></span>
          </span>
        </label>
        <div class="section">Déclencheurs</div>
        <homex-trigger-selector
          .hass=${this.hass}
          .value=${this._triggers}
          @value-changed=${(t) => this._triggers = t.detail.value}
        ></homex-trigger-selector>
        ${e ? n`<homex-managed-triggers
              .triggers=${this.room?.switch_triggers?.groups?.[this.group.group_id] ?? []}
            ></homex-managed-triggers>` : ""}

        
        ${this._dim ? n`
              <div class="section">Dimmer + (monter la luminosité)</div>
              <p class="hint">
                Chaque déclenchement ajoute 20 à la luminosité des lumières du
                groupe.
              </p>
              <homex-trigger-selector
                .hass=${this.hass}
                .value=${this._dimUp}
                @value-changed=${(t) => this._dimUp = t.detail.value}
              ></homex-trigger-selector>
              <div class="section">Dimmer − (baisser la luminosité)</div>
              <p class="hint">
                Chaque déclenchement retire 20 à la luminosité des lumières du
                groupe.
              </p>
              <homex-trigger-selector
                .hass=${this.hass}
                .value=${this._dimDown}
                @value-changed=${(t) => this._dimDown = t.detail.value}
              ></homex-trigger-selector>
            ` : ""}

        <span slot="actions">
          ${e ? n`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
                Supprimer
              </button>` : ""}
          <button @click=${this._close}>Annuler</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            ${e ? "Enregistrer" : "Créer le groupe"}
          </button>
        </span>
      </homex-dialog>
    `;
  }
};
F.styles = [
  C,
  y`
      .dim-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        margin: 12px 0 4px;
        cursor: pointer;
      }
      .dim-name {
        font-size: 15px;
        font-weight: 500;
      }
      .toggle {
        position: relative;
        flex: 0 0 auto;
        width: 42px;
        height: 24px;
        border-radius: 12px;
        background: var(--switch-unchecked-track-color, #bdbdbd);
        transition: background 0.2s;
      }
      .toggle.on {
        background: var(--switch-checked-track-color, var(--primary-color));
      }
      .toggle input {
        position: absolute;
        inset: 0;
        margin: 0;
        opacity: 0;
        cursor: pointer;
      }
      .toggle .knob {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        transition: transform 0.2s;
      }
      .toggle.on .knob {
        transform: translateX(18px);
      }
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 0 0 8px;
      }
    `
];
te([
  h({ attribute: !1 })
], F.prototype, "hass", 2);
te([
  h({ type: Boolean })
], F.prototype, "open", 2);
te([
  h({ attribute: !1 })
], F.prototype, "room", 2);
te([
  h({ attribute: !1 })
], F.prototype, "group", 2);
te([
  l()
], F.prototype, "_name", 2);
te([
  l()
], F.prototype, "_id", 2);
te([
  l()
], F.prototype, "_devices", 2);
te([
  l()
], F.prototype, "_triggers", 2);
te([
  l()
], F.prototype, "_dim", 2);
te([
  l()
], F.prototype, "_dimUp", 2);
te([
  l()
], F.prototype, "_dimDown", 2);
te([
  l()
], F.prototype, "_busy", 2);
F = te([
  $("homex-group-dialog")
], F);
var fo = Object.defineProperty, bo = Object.getOwnPropertyDescriptor, _t = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? bo(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && fo(t, s, r), r;
};
let je = class extends b {
  constructor() {
    super(...arguments), this._open = !1, this._openScene = (e) => Ns(e.currentTarget.getAttribute("href"), e);
  }
  get _slug() {
    return `${this.room.room_id}_${this.group.group_id}`;
  }
  render() {
    const e = this._slug;
    return n`
      <div class="row">
        <homex-unit-controls .hass=${this.hass} .unit=${this.group}></homex-unit-controls>
        <a
          class="scene-link"
          href="/config/scene/edit/homex_${e}_turn_on"
          @click=${this._openScene}
          title="Éditer la scène « allumé » du groupe"
        >
          <svg viewBox="0 0 24 24"><path d=${ji}></path></svg>
        </a>
        <a
          class="scene-link"
          href="/config/scene/edit/homex_${e}_turn_off"
          @click=${this._openScene}
          title="Éditer la scène « éteint » du groupe"
        >
          <svg viewBox="0 0 24 24"><path d=${Ri}></path></svg>
        </a>
        <button title="Configurer le groupe" @click=${() => this._open = !0}>
          ⚙︎
        </button>
      </div>
      <homex-group-dialog
        .hass=${this.hass}
        .room=${this.room}
        .group=${this.group}
        .open=${this._open}
        @dialog-closed=${() => this._open = !1}
      ></homex-group-dialog>
    `;
  }
};
je.styles = [
  C,
  y`
      .row {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      homex-unit-controls {
        flex: 1;
      }
      .scene-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        color: var(--secondary-text-color);
        text-decoration: none;
      }
      .scene-link:hover {
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
        color: var(--primary-text-color);
      }
      .scene-link svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
      }
    `
];
_t([
  h({ attribute: !1 })
], je.prototype, "hass", 2);
_t([
  h({ attribute: !1 })
], je.prototype, "room", 2);
_t([
  h({ attribute: !1 })
], je.prototype, "group", 2);
_t([
  l()
], je.prototype, "_open", 2);
je = _t([
  $("homex-group-row")
], je);
var xo = Object.defineProperty, yo = Object.getOwnPropertyDescriptor, se = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? yo(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && xo(t, s, r), r;
};
let q = class extends b {
  constructor() {
    super(...arguments), this.open = !1, this.room = null, this._name = "", this._id = "", this._areaId = "", this._modules = ["lights"], this._devices = [], this._strategy = "recall_first", this._busy = !1, this._zones = [], this._zoneId = "default", this._initialZone = "default", this._idEdited = !1;
  }
  willUpdate(e) {
    e.has("open") && this.open && (this._name = this.room?.name ?? "", this._id = this.room?.room_id ?? "", this._areaId = this.room?.area_id ?? "", this._modules = [...this.room?.modules ?? ["lights"]], this._devices = this.room?.devices ?? [], this._strategy = this.room?.scene_strategy ?? "recall_first", this._busy = !1, this._idEdited = !!this.room, this._loadZones());
  }
  async _loadZones() {
    try {
      this._zones = (await Qe(this.hass)).zones ?? [];
    } catch {
      this._zones = [];
    }
    const e = this.room?.room_id;
    this._initialZone = e && this._zones.find((t) => t.rooms.includes(e))?.id || "default", this._zoneId = this._initialZone;
  }
  get _areas() {
    return Object.values(this.hass.areas || {}).map((e) => ({ area_id: e.area_id, name: e.name })).sort((e, t) => e.name.localeCompare(t.name));
  }
  _hasModule(e) {
    return this._modules.includes(e);
  }
  _setModule(e, t) {
    this._modules = t ? [.../* @__PURE__ */ new Set([...this._modules, e])] : this._modules.filter((s) => s !== e);
  }
  _moduleRow(e, t, s, i) {
    const r = this._hasModule(e);
    return n`
      <label class="module">
        <span class="module-name">${t} ${s}</span>
        <span class="toggle ${r ? "on" : ""}">
          <input
            type="checkbox"
            .checked=${r}
            @change=${(o) => this._setModule(e, o.target.checked)}
          />
          <span class="knob"></span>
        </span>
      </label>
      <p class="hint">${i}</p>
    `;
  }
  _onName(e) {
    this._name = e, this._idEdited || (this._id = E(e));
  }
  _onId(e) {
    this._id = e, this._idEdited = !0;
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  async _save() {
    const e = this._name.trim(), t = this._id.trim();
    if (!e || !t) {
      alert("Nom et id requis.");
      return;
    }
    this._busy = !0;
    try {
      const s = this._areaId || null;
      this.room ? await Se(this.hass, {
        entry_id: this.room.entry_id,
        name: e,
        room_id: t,
        area_id: s,
        modules: this._modules,
        devices: this._devices,
        scene_strategy: this._strategy
      }) : await mr(this.hass, {
        name: e,
        room_id: t,
        area_id: s,
        modules: this._modules,
        devices: this._devices,
        scene_strategy: this._strategy
      }), this._hasModule("heating") && this._zoneId !== this._initialZone && await Nr(this.hass, t, this._zoneId), U(this), this._close();
    } catch (s) {
      this._busy = !1, alert("Erreur Homex : " + v(s));
    }
  }
  render() {
    const e = !!this.room;
    return n`
      <homex-dialog
        .open=${this.open}
        heading=${e ? "Modifier la pièce" : "Nouvelle pièce"}
        @dialog-closed=${this._close}
      >
        ${P("Nom", this._name, (t) => this._onName(t), "Chambre")}
        ${P("Id", this._id, (t) => this._onId(t), "bedroom")}
        <div class="section">Pièce Home Assistant (optionnel)</div>
        <homex-select
          placeholder="Aucune"
          .value=${this._areaId}
          .options=${this._areas.map((t) => ({ value: t.area_id, label: t.name }))}
          @value-changed=${(t) => this._areaId = t.detail.value}
        ></homex-select>

        <div class="section">Modules</div>
        ${this._moduleRow(
      "lights",
      "💡",
      "Lights",
      "Le module Lights gère l'allumage, les scènes et les groupes de la pièce."
    )}
        ${this._moduleRow(
      "switches",
      "🎛",
      "Switches",
      "Le module Switches gère les interrupteurs physiques de la pièce."
    )}
        ${this._moduleRow(
      "shutters",
      "🪟",
      "Shutters",
      "Le module Shutters gère les volets roulants de la pièce."
    )}
        ${this._moduleRow(
      "heating",
      "🔥",
      "Climate",
      "Le module Climate gère les capteurs et les radiateurs de la pièce (onglet Climate)."
    )}

        ${this._hasModule("lights") ? n`
              <div class="tab">Lights</div>
              <div class="section">Luminaires de la pièce</div>
              <homex-entity-picker
                .hass=${this.hass}
                .includeDomains=${ao}
                .value=${this._devices}
                @value-changed=${(t) => this._devices = t.detail.value}
              ></homex-entity-picker>

              <div class="section">Scene switching strategy</div>
              <homex-select
                .value=${this._strategy}
                .options=${[
      { value: "recall_first", label: "Repart de zéro", secondary: "Première scène" },
      { value: "recall_last", label: "Dernière utilisée", secondary: "Reprend la dernière scène" }
    ]}
                @value-changed=${(t) => this._strategy = t.detail.value}
              ></homex-select>
              <p class="hint">
                Quand un trigger scene-switching change de scène et que la pièce
                était éteinte : repartir de la première scène, ou reprendre la
                dernière utilisée.
              </p>
            ` : ""}

        ${this._hasModule("heating") ? n`
              <div class="tab">Climate</div>
              <div class="section">Zone de chauffage</div>
              <homex-select
                .value=${this._zoneId}
                .options=${this._zones.map((t) => ({
      value: t.id,
      label: t.name,
      secondary: t.id === "default" ? "Toutes les autres pièces" : void 0
    }))}
                @value-changed=${(t) => this._zoneId = t.detail.value}
              ></homex-select>
              <p class="hint">
                Capteurs et radiateurs se configurent dans l'onglet Climate de la pièce.
              </p>
            ` : ""}

        <span slot="actions">
          <button @click=${this._close}>Annuler</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            ${e ? "Enregistrer" : "Créer la pièce"}
          </button>
        </span>
      </homex-dialog>
    `;
  }
};
q.styles = [
  C,
  y`
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 0 0 8px;
      }
      .module {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        margin: 6px 0;
        cursor: pointer;
      }
      .module-name {
        font-size: 15px;
        font-weight: 500;
      }
      .toggle {
        position: relative;
        flex: 0 0 auto;
        width: 42px;
        height: 24px;
        border-radius: 12px;
        background: var(--switch-unchecked-track-color, #bdbdbd);
        transition: background 0.2s;
      }
      .toggle.on {
        background: var(--switch-checked-track-color, var(--primary-color));
      }
      .toggle input {
        position: absolute;
        inset: 0;
        margin: 0;
        opacity: 0;
        cursor: pointer;
      }
      .toggle .knob {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        transition: transform 0.2s;
      }
      .toggle.on .knob {
        transform: translateX(18px);
      }
      .tab {
        display: inline-block;
        margin: 14px 0 2px;
        padding: 6px 14px;
        border-radius: 8px 8px 0 0;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
        border-bottom: 2px solid var(--primary-color);
        font-size: 14px;
        font-weight: 600;
      }
    `
];
se([
  h({ attribute: !1 })
], q.prototype, "hass", 2);
se([
  h({ type: Boolean })
], q.prototype, "open", 2);
se([
  h({ attribute: !1 })
], q.prototype, "room", 2);
se([
  l()
], q.prototype, "_name", 2);
se([
  l()
], q.prototype, "_id", 2);
se([
  l()
], q.prototype, "_areaId", 2);
se([
  l()
], q.prototype, "_modules", 2);
se([
  l()
], q.prototype, "_devices", 2);
se([
  l()
], q.prototype, "_strategy", 2);
se([
  l()
], q.prototype, "_busy", 2);
se([
  l()
], q.prototype, "_zones", 2);
se([
  l()
], q.prototype, "_zoneId", 2);
q = se([
  $("homex-room-dialog")
], q);
var $o = Object.defineProperty, wo = Object.getOwnPropertyDescriptor, ke = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? wo(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && $o(t, s, r), r;
};
let pe = class extends b {
  constructor() {
    super(...arguments), this.open = !1, this._toggle = [], this._scene = [], this._dimUp = [], this._dimDown = [], this._busy = !1;
  }
  willUpdate(e) {
    e.has("open") && this.open && (this._toggle = (this.room?.triggers ?? []).map((t) => ({ ...t })), this._scene = (this.room?.scene_triggers ?? []).map((t) => ({ ...t })), this._dimUp = (this.room?.dim_up_triggers ?? []).map((t) => ({ ...t })), this._dimDown = (this.room?.dim_down_triggers ?? []).map((t) => ({ ...t })), this._busy = !1);
  }
  get _hasLights() {
    return (this.room?.modules ?? []).includes("lights");
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  async _save() {
    this._busy = !0;
    try {
      await Se(this.hass, {
        entry_id: this.room.entry_id,
        triggers: this._toggle,
        scene_triggers: this._scene,
        dim_up_triggers: this._dimUp,
        dim_down_triggers: this._dimDown
      }), U(this), this._close();
    } catch (e) {
      this._busy = !1, alert("Erreur Homex : " + v(e));
    }
  }
  render() {
    return n`
      <homex-dialog
        .open=${this.open}
        heading="Déclencheurs de la pièce"
        @dialog-closed=${this._close}
      >
        ${this._hasLights ? n`
              <div class="group">
                <div class="section">Triggers toggle (allumer / éteindre)</div>
                <p class="hint">
                  Chaque déclenchement permute l'état on/off de la pièce.
                </p>
                <homex-trigger-selector
                  .hass=${this.hass}
                  .value=${this._toggle}
                  @value-changed=${(e) => this._toggle = e.detail.value}
                ></homex-trigger-selector>
                <homex-managed-triggers
                  .triggers=${this.room?.switch_triggers?.toggle ?? []}
                ></homex-managed-triggers>
              </div>

              <div class="group">
                <div class="section">Triggers scene switching</div>
                <p class="hint">Chaque déclenchement passe à la scène suivante (cycle).</p>
                <homex-trigger-selector
                  .hass=${this.hass}
                  .value=${this._scene}
                  @value-changed=${(e) => this._scene = e.detail.value}
                ></homex-trigger-selector>
                <homex-managed-triggers
                  .triggers=${this.room?.switch_triggers?.scene_next ?? []}
                ></homex-managed-triggers>
                <p class="hint">
                  La stratégie (repart de zéro / dernière utilisée) se règle dans
                  « Modifier la pièce ».
                </p>
              </div>

              <div class="group">
                <div class="section">Dimmer + (monter la luminosité)</div>
                <p class="hint">
                  Chaque déclenchement ajoute 20 à la luminosité des lumières de la pièce.
                </p>
                <homex-trigger-selector
                  .hass=${this.hass}
                  .value=${this._dimUp}
                  @value-changed=${(e) => this._dimUp = e.detail.value}
                ></homex-trigger-selector>
                <homex-managed-triggers
                  .triggers=${this.room?.switch_triggers?.dim_up ?? []}
                ></homex-managed-triggers>
              </div>

              <div class="group">
                <div class="section">Dimmer − (baisser la luminosité)</div>
                <p class="hint">
                  Chaque déclenchement retire 20 à la luminosité des lumières de la pièce.
                </p>
                <homex-trigger-selector
                  .hass=${this.hass}
                  .value=${this._dimDown}
                  @value-changed=${(e) => this._dimDown = e.detail.value}
                ></homex-trigger-selector>
                <homex-managed-triggers
                  .triggers=${this.room?.switch_triggers?.dim_down ?? []}
                ></homex-managed-triggers>
              </div>
            ` : ""}

        <span slot="actions">
          <button @click=${this._close}>Annuler</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            Enregistrer
          </button>
        </span>
      </homex-dialog>
    `;
  }
};
pe.styles = [
  C,
  y`
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 0 0 8px;
      }
      .group {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        padding: 12px 14px;
        margin-bottom: 14px;
      }
    `
];
ke([
  h({ attribute: !1 })
], pe.prototype, "hass", 2);
ke([
  h({ type: Boolean })
], pe.prototype, "open", 2);
ke([
  h({ attribute: !1 })
], pe.prototype, "room", 2);
ke([
  l()
], pe.prototype, "_toggle", 2);
ke([
  l()
], pe.prototype, "_scene", 2);
ke([
  l()
], pe.prototype, "_dimUp", 2);
ke([
  l()
], pe.prototype, "_dimDown", 2);
ke([
  l()
], pe.prototype, "_busy", 2);
pe = ke([
  $("homex-triggers-dialog")
], pe);
var ko = Object.defineProperty, Co = Object.getOwnPropertyDescriptor, be = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Co(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && ko(t, s, r), r;
};
let re = class extends b {
  constructor() {
    super(...arguments), this.open = !1, this.scene = null, this._name = "", this._mode = "new", this._attachId = "", this._triggers = [], this._busy = !1;
  }
  willUpdate(e) {
    e.has("open") && this.open && (this._name = this.scene?.name ?? "", this._mode = "new", this._attachId = "", this._triggers = (this.scene?.triggers ?? []).map((t) => ({ ...t })), this._busy = !1);
  }
  // Existing HA scenes that are not already Homex-managed.
  get _availableScenes() {
    return Object.keys(this.hass.states).filter((e) => e.startsWith("scene.")).map((e) => {
      const t = this.hass.states[e].attributes || {};
      return {
        config_id: t.id ? String(t.id) : "",
        name: t.friendly_name || e
      };
    }).filter((e) => e.config_id && !e.config_id.startsWith("homex_")).sort((e, t) => e.name.localeCompare(t.name));
  }
  // The proposed name must not collide with another scene of the room.
  get _nameTaken() {
    const e = this._name.trim();
    if (!e) return !1;
    const t = E(e);
    return this.room.scenes.some((s) => this.scene && s.key === this.scene.key ? !1 : s.name.toLowerCase() === e.toLowerCase() || s.key === t);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  _onPickScene(e) {
    if (this._attachId = e, !this._name.trim()) {
      const t = this._availableScenes.find((s) => s.config_id === e);
      t && (this._name = t.name);
    }
  }
  async _save() {
    const e = this._name.trim();
    if (!(!e || this._nameTaken)) {
      if (!this.scene && this._mode === "attach" && !this._attachId) {
        alert("Choisis une scène existante à rattacher.");
        return;
      }
      this._busy = !0;
      try {
        this.scene ? await Ar(
          this.hass,
          this.room.entry_id,
          this.scene.key,
          e,
          this._triggers
        ) : this._mode === "attach" ? await ds(
          this.hass,
          this.room.entry_id,
          e,
          this._attachId,
          this._triggers
        ) : await ds(
          this.hass,
          this.room.entry_id,
          e,
          void 0,
          this._triggers
        ), U(this), this._close();
      } catch (t) {
        this._busy = !1, alert("Erreur Homex : " + v(t));
      }
    }
  }
  render() {
    const e = !!this.scene, t = this._nameTaken, s = !!this._name.trim() && !t;
    return n`
      <homex-dialog
        .open=${this.open}
        heading=${e ? "Renommer la scène" : "Nouvelle scène"}
        @dialog-closed=${this._close}
      >
        ${P("Nom de la scène", this._name, (i) => this._name = i, "Nuit")}
        ${t ? n`<div class="err">Ce nom de scène existe déjà.</div>` : ""}
        ${e ? "" : this._renderModePicker()}
        <div class="section">Déclencheurs (activent cette scène)</div>
        <homex-trigger-selector
          .hass=${this.hass}
          .value=${this._triggers}
          @value-changed=${(i) => this._triggers = i.detail.value}
        ></homex-trigger-selector>
        ${e ? n`<homex-managed-triggers
              .triggers=${this.room?.switch_triggers?.scenes?.[this.scene.key] ?? []}
            ></homex-managed-triggers>` : ""}
        <span slot="actions">
          <button @click=${this._close}>Annuler</button>
          <button class="primary" ?disabled=${this._busy || !s} @click=${this._save}>
            ${e ? "Renommer" : this._mode === "attach" ? "Rattacher" : "Créer la scène"}
          </button>
        </span>
      </homex-dialog>
    `;
  }
  _renderModePicker() {
    return n`
      <div class="modes">
        <button
          class=${this._mode === "new" ? "active" : ""}
          @click=${() => this._mode = "new"}
        >
          Nouvelle
        </button>
        <button
          class=${this._mode === "attach" ? "active" : ""}
          @click=${() => this._mode = "attach"}
        >
          Rattacher une existante
        </button>
      </div>
      ${this._mode === "new" ? n`<div class="section">
            La scène est créée « tout éteint » ; édite-la ensuite dans Home Assistant.
          </div>` : n`
            <div class="section">
              Scène existante à adopter (elle sera renommée, son contenu conservé)
            </div>
            <homex-select
              placeholder="Choisir une scène…"
              .value=${this._attachId}
              .options=${this._availableScenes.map((e) => ({
      value: e.config_id,
      label: e.name,
      secondary: e.config_id
    }))}
              @value-changed=${(e) => this._onPickScene(e.detail.value)}
            ></homex-select>
          `}
    `;
  }
};
re.styles = [
  C,
  y`
      .modes {
        display: flex;
        gap: 8px;
        margin: 8px 0;
      }
      .modes button {
        flex: 1;
      }
      .modes button.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .err {
        color: var(--error-color, #db4437);
        font-size: 12px;
        margin: -4px 0 8px;
      }
    `
];
be([
  h({ attribute: !1 })
], re.prototype, "hass", 2);
be([
  h({ type: Boolean })
], re.prototype, "open", 2);
be([
  h({ attribute: !1 })
], re.prototype, "room", 2);
be([
  h({ attribute: !1 })
], re.prototype, "scene", 2);
be([
  l()
], re.prototype, "_name", 2);
be([
  l()
], re.prototype, "_mode", 2);
be([
  l()
], re.prototype, "_attachId", 2);
be([
  l()
], re.prototype, "_triggers", 2);
be([
  l()
], re.prototype, "_busy", 2);
re = be([
  $("homex-scene-dialog")
], re);
var So = Object.defineProperty, Eo = Object.getOwnPropertyDescriptor, ae = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Eo(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && So(t, s, r), r;
};
let W = class extends b {
  constructor() {
    super(...arguments), this.open = !1, this.group = null, this._name = "", this._devices = [], this._toggle = [], this._openT = [], this._close = [], this._stop = [], this._busy = !1;
  }
  willUpdate(e) {
    if (e.has("open") && this.open) {
      const t = this.group;
      this._name = t?.name ?? "", this._devices = [...t?.devices ?? []], this._toggle = (t?.toggle_triggers ?? []).map((s) => ({ ...s })), this._openT = (t?.open_triggers ?? []).map((s) => ({ ...s })), this._close = (t?.close_triggers ?? []).map((s) => ({ ...s })), this._stop = (t?.stop_triggers ?? []).map((s) => ({ ...s })), this._busy = !1;
    }
  }
  _close_() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  async _save() {
    const e = this._name.trim();
    if (!e) {
      alert("Nom du groupe requis.");
      return;
    }
    this._busy = !0;
    try {
      let t = this.group?.id;
      t || (t = (await gr(
        this.hass,
        this.room.entry_id,
        e
      ))?.group_id), await vr(this.hass, {
        entry_id: this.room.entry_id,
        group_id: t,
        name: e,
        devices: this._devices,
        toggle_triggers: this._toggle,
        open_triggers: this._openT,
        close_triggers: this._close,
        stop_triggers: this._stop
      }), U(this), this._close_();
    } catch (t) {
      this._busy = !1, alert("Erreur Homex : " + v(t));
    }
  }
  async _delete() {
    if (this.group && confirm(`Supprimer le groupe de volets "${this.group.name}" ?`)) {
      this._busy = !0;
      try {
        await fr(this.hass, this.room.entry_id, this.group.id), U(this), this._close_();
      } catch (e) {
        this._busy = !1, alert("Erreur Homex : " + v(e));
      }
    }
  }
  _trigGroup(e, t, s) {
    return n`<div class="group">
      <div class="section">${e}</div>
      <homex-trigger-selector
        .hass=${this.hass}
        .value=${t}
        @value-changed=${(i) => s(i.detail.value)}
      ></homex-trigger-selector>
    </div>`;
  }
  render() {
    const e = !!this.group, t = e && this.group.removable;
    return n`
      <homex-dialog
        .open=${this.open}
        heading=${e ? "Modifier le groupe de volets" : "Nouveau groupe de volets"}
        @dialog-closed=${this._close_}
      >
        ${P("Nom", this._name, (s) => this._name = s, "Salon")}
        <div class="section">Volets (entités cover)</div>
        <homex-entity-picker
          .hass=${this.hass}
          .includeDomains=${["cover"]}
          .value=${this._devices}
          @value-changed=${(s) => this._devices = s.detail.value}
        ></homex-entity-picker>

        <div class="section">Déclencheurs du groupe</div>
        <p class="hint">
          Chaque déclencheur pilote les volets de ce groupe.
        </p>
        ${this._trigGroup("Permuter (ouvrir / fermer)", this._toggle, (s) => this._toggle = s)}
        ${this._trigGroup("Ouvrir", this._openT, (s) => this._openT = s)}
        ${this._trigGroup("Fermer", this._close, (s) => this._close = s)}
        ${this._trigGroup("Stop", this._stop, (s) => this._stop = s)}

        <span slot="actions">
          ${t ? n`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
                Supprimer
              </button>` : ""}
          <button @click=${this._close_}>Annuler</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            ${e ? "Enregistrer" : "Créer le groupe"}
          </button>
        </span>
      </homex-dialog>
    `;
  }
};
W.styles = [
  C,
  y`
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 0 0 8px;
      }
      .group {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        padding: 12px 14px;
        margin-bottom: 12px;
      }
    `
];
ae([
  h({ attribute: !1 })
], W.prototype, "hass", 2);
ae([
  h({ type: Boolean })
], W.prototype, "open", 2);
ae([
  h({ attribute: !1 })
], W.prototype, "room", 2);
ae([
  h({ attribute: !1 })
], W.prototype, "group", 2);
ae([
  l()
], W.prototype, "_name", 2);
ae([
  l()
], W.prototype, "_devices", 2);
ae([
  l()
], W.prototype, "_toggle", 2);
ae([
  l()
], W.prototype, "_openT", 2);
ae([
  l()
], W.prototype, "_close", 2);
ae([
  l()
], W.prototype, "_stop", 2);
ae([
  l()
], W.prototype, "_busy", 2);
W = ae([
  $("homex-shutter-group-dialog")
], W);
var Ao = Object.defineProperty, Po = Object.getOwnPropertyDescriptor, et = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Po(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && Ao(t, s, r), r;
};
let Ee = class extends b {
  constructor() {
    super(...arguments), this.open = !1, this._groupId = "", this._busy = !1;
  }
  willUpdate(e) {
    e.has("open") && this.open && (this._groupId = Ws(this.room)?.id ?? "");
  }
  get _groups() {
    return (this.room.shutter_groups ?? []).filter((e) => e.devices?.length);
  }
  async _run(e) {
    this._busy = !0;
    try {
      await yr(this.hass, this.room.entry_id, this._groupId, e);
    } catch (t) {
      alert("Erreur Homex : " + v(t));
    } finally {
      this._busy = !1;
    }
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  render() {
    if (!this.open) return n``;
    const e = this._groups, t = e.find((r) => r.id === this._groupId) ?? e[0], s = t?.devices ?? [], i = Nt(this.hass, s);
    return n`
      <homex-dialog
        compact
        .open=${this.open}
        .heading=${`Volets · ${this.room.name}`}
        @dialog-closed=${this._close}
      >
        ${e.length > 1 ? n`<div class="groups">
              ${e.map(
      (r) => n`<button
                  class="chip ${r.id === t?.id ? "active" : ""}"
                  @click=${() => this._groupId = r.id}
                >
                  ${r.name}
                </button>`
    )}
            </div>` : ""}
        <div class="summary">
          <svg viewBox="0 0 24 24"><path d=${i.icon}></path></svg>
          <div>
            <div class="state">${i.label}</div>
            <div class="pos">
              ${i.position !== null ? `Position moyenne : ${i.position} %` : ""}
            </div>
          </div>
        </div>
        <div class="controls">
          <button ?disabled=${this._busy || !t} @click=${() => this._run("open_cover")}>
            <svg viewBox="0 0 24 24"><path d=${Mi}></path></svg>Ouvrir
          </button>
          <button ?disabled=${this._busy || !t} @click=${() => this._run("stop_cover")}>
            <svg viewBox="0 0 24 24"><path d=${Yi}></path></svg>Stop
          </button>
          <button ?disabled=${this._busy || !t} @click=${() => this._run("close_cover")}>
            <svg viewBox="0 0 24 24"><path d=${Ai}></path></svg>Fermer
          </button>
        </div>
        ${s.map((r) => {
      const o = Nt(this.hass, [r]), a = qs(this.hass, r);
      return n`<div class="cover">
            <svg viewBox="0 0 24 24"><path d=${o.icon}></path></svg>
            <span class="name">
              ${this.hass.states[r]?.attributes?.friendly_name || r}
            </span>
            <span class="val">${o.label}${a !== null ? ` · ${a} %` : ""}</span>
          </div>`;
    })}
        <button slot="actions" @click=${this._close}>Terminé</button>
      </homex-dialog>
    `;
  }
};
Ee.styles = [
  C,
  y`
      .groups {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 16px;
      }
      .chip {
        min-height: 32px;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 13px;
      }
      .chip.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .summary {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 16px;
      }
      .summary svg {
        width: 48px;
        height: 48px;
        fill: var(--primary-color);
        flex: none;
      }
      .summary .state {
        font-size: 18px;
        font-weight: 500;
      }
      .summary .pos {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .controls {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 16px;
      }
      .controls button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 12px 8px;
      }
      .controls svg {
        width: 28px;
        height: 28px;
        fill: currentColor;
      }
      .cover {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-top: 1px solid var(--divider-color, #e0e0e0);
        font-size: 14px;
      }
      .cover svg {
        width: 22px;
        height: 22px;
        fill: var(--secondary-text-color);
        flex: none;
      }
      .cover .name {
        flex: 1;
        overflow-wrap: anywhere;
      }
      .cover .val {
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
    `
];
et([
  h({ attribute: !1 })
], Ee.prototype, "hass", 2);
et([
  h({ type: Boolean })
], Ee.prototype, "open", 2);
et([
  h({ attribute: !1 })
], Ee.prototype, "room", 2);
et([
  l()
], Ee.prototype, "_groupId", 2);
et([
  l()
], Ee.prototype, "_busy", 2);
Ee = et([
  $("homex-shutter-control-dialog")
], Ee);
function Xs(e, t) {
  const s = e.entities?.[t];
  return s?.area_id || s?.device_id && e.devices?.[s.device_id]?.area_id || void 0;
}
function Js(e, t) {
  return e.devices?.[t]?.area_id || void 0;
}
function Rt(e, t, s) {
  const i = new Set(s.filter(Boolean)), r = i.size ? e.filter((o) => i.has(t(o) ?? "")) : [];
  return { inArea: r, others: e.filter((o) => !r.includes(o)) };
}
function Qs(e, t) {
  return [...new Set(t.filter(Boolean))].map((s) => e.areas?.[s]?.name ?? s).join(", ");
}
var Mo = Object.defineProperty, Ho = Object.getOwnPropertyDescriptor, xe = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ho(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && Mo(t, s, r), r;
};
let oe = class extends b {
  constructor() {
    super(...arguments), this.open = !1, this.index = -1, this._rad = { device_id: "", preset_id: "", external_sensor: "" }, this._models = [], this._presets = [], this._otherRooms = [], this._busy = !1;
  }
  willUpdate(e) {
    if (e.has("open") && this.open) {
      const t = this.room.heating?.radiators?.[this.index];
      this._rad = t ? { external_sensor: "", ...t } : { device_id: "", preset_id: "", external_sensor: "" }, this._busy = !1, this._load();
    }
  }
  async _load() {
    try {
      const [e, t, s] = await Promise.all([
        Qe(this.hass),
        Is(this.hass),
        Je(this.hass)
      ]);
      this._presets = e.device_presets ?? [], this._models = t, this._otherRooms = s.filter((i) => i.room_id !== this.room.room_id);
    } catch {
      this._presets = [], this._models = [];
    }
  }
  get _thermostats() {
    return this._models.flatMap((e) => e.devices.map((t) => ({ ...t, model: e.model, label: e.label }))).sort((e, t) => e.name.localeCompare(t.name));
  }
  get _modelPresets() {
    const e = this._thermostats.find((t) => t.device_id === this._rad.device_id)?.model;
    return this._presets.filter((t) => t.model === e);
  }
  get _preset() {
    return this._presets.find((e) => e.id === this._rad.preset_id);
  }
  _onDevice(e) {
    const t = this._thermostats.find((i) => i.device_id === e)?.model, s = this._presets.filter((i) => i.model === t);
    this._rad = {
      ...this._rad,
      device_id: e,
      preset_id: s.length === 1 ? s[0].id : ""
    };
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  async _save() {
    const e = [...this.room.heating?.radiators ?? []], t = {
      ...this._rad,
      external_sensor: this._preset?.external_input ? this._rad.external_sensor : ""
    };
    this.index >= 0 ? e[this.index] = t : e.push(t), this._busy = !0;
    try {
      await Se(this.hass, { entry_id: this.room.entry_id, heating: { ...this.room.heating, radiators: e } }), U(this), this._close();
    } catch (s) {
      alert("Erreur Homex : " + v(s)), this._busy = !1;
    }
  }
  /** Source choices: the room's reference temperature, then the room's Homex
   * temperature sensors, then every other temperature sensor (A→Z). */
  _renderExternalSensor() {
    const e = (m) => this.hass.states[m]?.attributes?.friendly_name || m, t = (m) => {
      const u = this.hass.states[m], _ = u?.attributes?.unit_of_measurement ?? "";
      return u && !["unknown", "unavailable"].includes(u.state) ? `${u.state} ${_}` : "—";
    }, s = `sensor.homex_${this.room.room_id}_temperature`, i = !!this.room.metrics?.temperature?.sensors?.length, r = (this.room.metrics?.temperature?.sensors ?? []).map((m) => m.entity_id), o = Object.keys(this.hass.states).filter(
      (m) => m.startsWith("sensor.") && m !== s && !r.includes(m) && this.hass.states[m]?.attributes?.device_class === "temperature"
    ).sort((m, u) => e(m).localeCompare(e(u))), { inArea: a, others: c } = Rt(o, (m) => Xs(this.hass, m), [
      this.room.area_id
    ]), d = this._rad.external_sensor ?? "", p = (m, u = e(m)) => ({
      value: m,
      label: u,
      secondary: m,
      tertiary: t(m)
    });
    return n`
      <div class="section">Capteur de température externe</div>
      <p class="hint">Sa température est recopiée dans la vanne à chaque mise à jour.</p>
      <homex-select
        placeholder="Choisir un capteur…"
        .value=${d}
        .groups=${[
      ...i ? [{ label: "Référence de la pièce", options: [p(s, `Température de référence (${this.room.name})`)] }] : [],
      ...r.length ? [{ label: "Capteurs de la pièce", options: r.map((m) => p(m)) }] : [],
      ...a.length ? [{ label: `Pièce : ${Qs(this.hass, [this.room.area_id])}`, options: a.map((m) => p(m)) }] : [],
      { label: "Autres", options: c.map((m) => p(m)) }
    ]}
        @value-changed=${(m) => this._rad = { ...this._rad, external_sensor: m.detail.value }}
      ></homex-select>
      ${d ? "" : n`<p class="hint warn">Ce preset utilise un capteur externe : choisis-en un.</p>`}
    `;
  }
  render() {
    if (!this.open) return n``;
    const e = this.index >= 0, t = new Set(
      (this.room.heating?.radiators ?? []).filter((p, m) => m !== this.index).map((p) => p.device_id)
    ), s = this._otherRooms.find(
      (p) => (p.heating?.radiators ?? []).some((m) => m.device_id === this._rad.device_id)
    ), i = this._modelPresets, r = this.room.area_id || "", o = r ? this.hass.areas?.[r]?.name : void 0, { inArea: a, others: c } = Rt(
      this._thermostats,
      (p) => Js(this.hass, p.device_id),
      [r]
    ), d = (p) => ({
      value: p.device_id,
      label: p.name,
      secondary: p.label,
      tertiary: t.has(p.device_id) ? "déjà dans la pièce" : void 0,
      disabled: t.has(p.device_id)
    });
    return n`
      <homex-dialog
        compact
        .open=${this.open}
        .heading=${e ? "Modifier le radiateur" : "Ajouter un radiateur"}
        @dialog-closed=${this._close}
      >
        <div class="section">Radiateur</div>
        <homex-select
          placeholder="Choisir un radiateur…"
          .value=${this._rad.device_id}
          ?disabled=${e}
          .options=${r ? [] : this._thermostats.map(d)}
          .groups=${r ? [
      ...a.length ? [{ label: `Pièce : ${o ?? r}`, options: a.map(d) }] : [],
      { label: "Autres", options: c.map(d) }
    ] : []}
          @value-changed=${(p) => this._onDevice(p.detail.value)}
        ></homex-select>
        ${s ? n`<p class="hint warn">Déjà dans la pièce « ${s.name} ».</p>` : ""}

        <div class="section">Device preset</div>
        <homex-select
          placeholder="Aucun preset"
          .value=${this._rad.preset_id}
          ?disabled=${!this._rad.device_id}
          .options=${i.map((p) => ({
      value: p.id,
      label: p.name,
      tertiary: p.external_input ? "capteur externe" : void 0
    }))}
          @value-changed=${(p) => this._rad = { ...this._rad, preset_id: p.detail.value }}
        ></homex-select>
        <p class="hint">
          ${this._rad.device_id && !i.length ? "Aucun device preset pour ce modèle (Climate Manager → Heating → Device Presets)." : "Le preset est appliqué en continu (vérifié et ré-appliqué toutes les 10 minutes)."}
        </p>

        ${this._preset?.external_input ? this._renderExternalSensor() : ""}

        <span slot="actions">
          <button @click=${this._close}>Annuler</button>
          <button
            class="primary"
            ?disabled=${this._busy || !this._rad.device_id}
            @click=${this._save}
          >
            ${e ? "Enregistrer" : "Ajouter"}
          </button>
        </span>
      </homex-dialog>
    `;
  }
};
oe.styles = [
  C,
  y`
      .hint {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin: 6px 0;
      }
      .warn {
        color: var(--warning-color, #ff9800);
      }
    `
];
xe([
  h({ attribute: !1 })
], oe.prototype, "hass", 2);
xe([
  h({ type: Boolean })
], oe.prototype, "open", 2);
xe([
  h({ attribute: !1 })
], oe.prototype, "room", 2);
xe([
  h({ type: Number })
], oe.prototype, "index", 2);
xe([
  l()
], oe.prototype, "_rad", 2);
xe([
  l()
], oe.prototype, "_models", 2);
xe([
  l()
], oe.prototype, "_presets", 2);
xe([
  l()
], oe.prototype, "_otherRooms", 2);
xe([
  l()
], oe.prototype, "_busy", 2);
oe = xe([
  $("homex-radiator-dialog")
], oe);
var zo = Object.defineProperty, Lo = Object.getOwnPropertyDescriptor, tt = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Lo(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && zo(t, s, r), r;
};
const Oo = [
  { key: "temperature", icon: "🌡", label: "Température" },
  { key: "humidity", icon: "💧", label: "Humidité" },
  { key: "pm25", icon: "🌫", label: "PM2.5" },
  { key: "pm10", icon: "🌫", label: "PM10" },
  { key: "co2", icon: "🫧", label: "CO₂" }
], Do = {
  mean: "moyenne pondérée",
  max: "max",
  min: "min"
}, To = {
  heating: "🔥 Chauffe",
  idle: "En veille",
  off: "Éteint",
  preheating: "Préchauffe",
  heat: "Mode chauffage",
  auto: "Mode auto"
};
let Ae = class extends b {
  constructor() {
    super(...arguments), this._devicePresets = [], this._dialogIndex = null, this._switching = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    try {
      this._devicePresets = (await Qe(this.hass)).device_presets ?? [];
    } catch {
      this._devicePresets = [];
    }
  }
  _state(e) {
    const t = this.hass.states[e];
    if (!t || t.state === "unknown" || t.state === "unavailable") return "—";
    const s = t.attributes?.unit_of_measurement;
    return s ? `${t.state} ${s}` : t.state;
  }
  // --- Metrics -------------------------------------------------------------
  _renderMetrics() {
    const e = this.room, t = Oo.filter((s) => e.metrics?.[s.key]?.sensors?.length);
    return n`
      <div class="section-row">
        <span class="section">Metrics</span>
        <button @click=${() => I(`/homex/climate/metrics/${e.room_id}`)}>
          Configurer
        </button>
      </div>
      ${t.length ? n`<div class="metrics">
            ${t.map((s) => {
      const i = e.metrics[s.key];
      return n`<div class="metric">
                <div class="muted">${s.icon} ${s.label}</div>
                <div class="v">${this._state(`sensor.homex_${e.room_id}_${s.key}`)}</div>
                <div class="muted">
                  ${i.sensors.length} capteur(s) · ${Do[i.rule] ?? i.rule}
                </div>
              </div>`;
    })}
          </div>` : n`<div class="empty">Aucun capteur : « Configurer » pour en ajouter.</div>`}
    `;
  }
  // --- Heating -------------------------------------------------------------
  get _roomOn() {
    return this.room.heating?.enabled !== !1;
  }
  /** The room's own heating: off = Unheated (valves off), on = zone mode. */
  async _setRoomHeating(e) {
    this._switching = !0;
    try {
      await Se(this.hass, {
        entry_id: this.room.entry_id,
        heating: { radiators: this.room.heating?.radiators ?? [], enabled: e }
      }), U(this);
    } catch (t) {
      alert("Erreur Homex : " + v(t));
    } finally {
      this._switching = !1;
    }
  }
  async _remove(e) {
    const t = [...this.room.heating?.radiators ?? []], s = this.hass.devices?.[t[e]?.device_id]?.name ?? "ce radiateur";
    if (confirm(`Retirer ${s} de la pièce ?`)) {
      t.splice(e, 1);
      try {
        await Se(this.hass, { entry_id: this.room.entry_id, heating: { ...this.room.heating, radiators: t } }), U(this);
      } catch (i) {
        alert("Erreur Homex : " + v(i));
      }
    }
  }
  _renderRadiator(e) {
    const t = this.room.heating.radiators[e], s = this.hass.devices?.[t.device_id], i = Ct(this.hass, t.device_id), r = i ? this.hass.states[i] : void 0, o = r?.attributes ?? {}, a = o.hvac_action ?? r?.state, c = this.hass.config?.unit_system?.temperature ?? "°C", d = (u) => u == null ? "—" : `${u} ${c}`, p = this._devicePresets.find((u) => u.id === t.preset_id), m = t.external_sensor ? this.hass.states[t.external_sensor]?.attributes?.friendly_name || t.external_sensor : "";
    return n`<div class="row">
      <div class="info">
        <div class="name">${s?.name_by_user || s?.name || t.device_id}</div>
        <div class="muted">
          ${p ? `Preset : ${p.name}` : "Aucun preset"}
          ${m ? n` · Capteur : ${m}` : ""}
        </div>
      </div>
      <span class=${a === "heating" ? "heating" : "muted"}>
        ${!r || r.state === "unavailable" ? "Indisponible" : To[a] ?? a}
        ${js(r) ? n`<span
              class="warning"
              title="Chauffe alors que la température dépasse la consigne : vanne bloquée ouverte ou état non rafraîchi — vérifie le radiateur."
              >⚠</span
            >` : ""}
      </span>
      <div class="temps">
        <span title="Température de consigne">🎯 ${d(o.temperature)}</span>
        <span title="Température actuelle">🌡 ${d(o.current_temperature)}</span>
      </div>
      <button title="Modifier" @click=${() => this._dialogIndex = e}>✏️</button>
      <button title="Retirer" @click=${() => this._remove(e)}>✕</button>
    </div>`;
  }
  _renderHeating() {
    const e = this.room.heating?.radiators ?? [];
    return n`
      <div class="section-row">
        <span class="section">Heating</span>
        ${e.length ? n`<label
              class="room-switch ${this._roomOn ? "on" : ""}"
              title=${this._roomOn ? "Désactiver : la pièce passe en Unheated, ses vannes sur off" : "Activer : la pièce reprend le mode de sa zone"}
            >
              ${this._roomOn ? "Chauffage activé" : "Chauffage désactivé"}
              <span class="toggle ${this._roomOn ? "on" : ""}">
                <input
                  type="checkbox"
                  .checked=${this._roomOn}
                  ?disabled=${this._switching}
                  @change=${(t) => this._setRoomHeating(t.target.checked)}
                />
                <span class="knob"></span>
              </span>
            </label>` : ""}
        <button @click=${() => this._dialogIndex = -1}>＋ Radiateur</button>
      </div>
      ${e.length ? e.map((t, s) => this._renderRadiator(s)) : n`<div class="empty">Aucun radiateur.</div>`}
    `;
  }
  render() {
    return n`
      ${this._renderMetrics()} ${this._renderHeating()}
      <homex-radiator-dialog
        .hass=${this.hass}
        .room=${this.room}
        .index=${this._dialogIndex ?? -1}
        .open=${this._dialogIndex !== null}
        @dialog-closed=${() => this._dialogIndex = null}
      ></homex-radiator-dialog>
    `;
  }
};
Ae.styles = [
  C,
  y`
      .section-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin: 16px 0 8px;
      }
      .section-row .section {
        margin: 0;
      }
      .section-row button,
      .row button {
        min-height: 0;
        padding: 6px 12px;
      }
      .section-row .room-switch {
        margin-left: auto;
      }
      .room-switch {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .room-switch.on {
        color: var(--state-climate-heat-color, #ff8100);
      }
      .toggle {
        position: relative;
        width: 36px;
        height: 20px;
        border-radius: 10px;
        background: var(--disabled-color, #888);
        transition: background 0.2s;
      }
      .toggle.on {
        background: var(--state-climate-heat-color, #ff8100);
      }
      .toggle input {
        position: absolute;
        inset: 0;
        opacity: 0;
        margin: 0;
        cursor: pointer;
      }
      .knob {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #fff;
        transition: transform 0.2s;
        pointer-events: none;
      }
      .toggle.on .knob {
        transform: translateX(16px);
      }
      .metrics {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .metric {
        padding: 8px 12px;
        border-radius: 10px;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
      }
      .metric .v {
        font-size: 16px;
        font-weight: 500;
      }
      .muted {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }
      .row .info {
        flex: 1;
        min-width: 0;
      }
      .row .name {
        font-weight: 500;
      }
      .temps {
        display: flex;
        gap: 12px;
        font-size: 14px;
        white-space: nowrap;
      }
      .warning {
        color: var(--warning-color, #ffa600);
        cursor: help;
      }
      .heating {
        color: var(--state-climate-heat-color, #ff8100);
        font-weight: 500;
      }
      .empty {
        font-size: 14px;
        color: var(--secondary-text-color);
        padding: 8px 0;
      }
      @media (max-width: 600px) {
        .row {
          flex-wrap: wrap;
          row-gap: 6px;
        }
        /* Name + preset on their own line; state, temperatures, actions below. */
        .row .info {
          flex-basis: 100%;
        }
        .row .temps {
          margin-left: auto;
        }
      }
    `
];
tt([
  h({ attribute: !1 })
], Ae.prototype, "hass", 2);
tt([
  h({ attribute: !1 })
], Ae.prototype, "room", 2);
tt([
  l()
], Ae.prototype, "_devicePresets", 2);
tt([
  l()
], Ae.prototype, "_dialogIndex", 2);
tt([
  l()
], Ae.prototype, "_switching", 2);
Ae = tt([
  $("homex-room-climate")
], Ae);
var Io = Object.defineProperty, Vo = Object.getOwnPropertyDescriptor, K = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Vo(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && Io(t, s, r), r;
};
const No = {
  lights: "💡 Lights",
  shutters: "🪟 Shutters",
  heating: "🔥 Climate"
}, Ro = {
  single: "Simple",
  double: "Double",
  long: "Long"
};
function Ht(e) {
  return e.kind === "group" ? `group:${e.group_id}` : e.kind === "scene" ? `scene:${e.scene_key}` : e.kind.startsWith("shutter_") ? `${e.kind}:${e.group_id}` : e.kind === "heating_mode" ? `heating_mode:${e.mode_id}` : e.kind;
}
let V = class extends b {
  constructor() {
    super(...arguments), this.open = !1, this.layout = null, this.taps = {}, this._rooms = [], this._heatingModes = [], this._mappings = {}, this._tapTab = "single", this._dragId = "", this._picked = "", this._dropBtn = null, this._busy = !1;
  }
  willUpdate(e) {
    e.has("open") && this.open && (this._mappings = JSON.parse(JSON.stringify(this.sw?.mappings ?? {})), this._tapTab = this._enabledModes()[0] ?? "single", this._busy = !1, this._dragId = "", this._picked = "", this._loadRooms());
  }
  async _loadRooms() {
    try {
      const e = await Je(this.hass), t = new Set(this.sw?.rooms ?? []);
      this._rooms = e.filter((s) => t.has(s.room_id));
    } catch {
      this._rooms = [];
    }
    try {
      this._heatingModes = (await Qe(this.hass)).presets;
    } catch {
      this._heatingModes = [];
    }
  }
  get _multi() {
    return this._rooms.length > 1;
  }
  /** Homex actions for one room (mirrors the Déclencheurs menu). */
  _actionsForRoom(e) {
    const t = (i, r, o, a, c) => ({
      id: `${e.room_id}::${Ht(c)}`,
      room_id: e.room_id,
      room_name: e.name,
      module: i,
      label: r,
      clabel: o,
      short: a,
      action: c
    }), s = [];
    if ((e.modules ?? []).includes("lights")) {
      s.push(
        t("lights", "Toggle pièce (on / off)", "Toggle", "⏻", { kind: "toggle" }),
        t("lights", "Changement de scène", "Scène →", "🎬", { kind: "scene_next" }),
        t("lights", "Dimmer +", "Dim +", "🔆", { kind: "dim_up" }),
        t("lights", "Dimmer −", "Dim −", "🔅", { kind: "dim_down" })
      );
      for (const i of e.groups ?? [])
        s.push(
          t("lights", `Groupe : ${i.name}`, i.name, "◧", {
            kind: "group",
            group_id: i.group_id
          })
        );
      for (const i of e.scenes ?? [])
        s.push(
          t("lights", `Scène : ${i.name}`, i.name, "★", {
            kind: "scene",
            scene_key: i.key
          })
        );
    }
    if ((e.modules ?? []).includes("shutters"))
      for (const i of e.shutter_groups ?? [])
        s.push(
          t("shutters", `${i.name} — Permuter`, `${i.name} ⇅`, "⇅", {
            kind: "shutter_toggle",
            group_id: i.id
          }),
          t("shutters", `${i.name} — Ouvrir`, `${i.name} ⬆`, "⬆", {
            kind: "shutter_open",
            group_id: i.id
          }),
          t("shutters", `${i.name} — Fermer`, `${i.name} ⬇`, "⬇", {
            kind: "shutter_close",
            group_id: i.id
          }),
          t("shutters", `${i.name} — Stop`, `${i.name} ⏹`, "⏹", {
            kind: "shutter_stop",
            group_id: i.id
          })
        );
    if (this._heatingModes.length) {
      s.push(
        t("heating", "Chauffage — mode suivant", "Mode →", "🔥", {
          kind: "heating_mode_next"
        })
      );
      for (const i of this._heatingModes)
        s.push(
          t("heating", `Chauffage — ${i.name}`, i.name, "🌡", {
            kind: "heating_mode",
            mode_id: i.id
          })
        );
    }
    return s;
  }
  /** A room's actions grouped by module, in module display order. */
  _actionsByModule(e) {
    const t = /* @__PURE__ */ new Map();
    for (const s of this._actionsForRoom(e)) {
      const i = t.get(s.module) ?? [];
      i.push(s), t.set(s.module, i);
    }
    return [...t.entries()];
  }
  _allActions() {
    return this._rooms.flatMap((e) => this._actionsForRoom(e));
  }
  _itemById(e) {
    return this._allActions().find((t) => t.id === e);
  }
  _itemForValue(e) {
    return this._itemById(`${e.room}::${Ht(e.action)}`);
  }
  /** Action ids already assigned to any button/tap mode on this switch. */
  _usedIds() {
    const e = /* @__PURE__ */ new Set();
    for (const t of Object.values(this._mappings))
      for (const s of Object.values(t))
        e.add(`${s.room}::${Ht(s.action)}`);
    return e;
  }
  _enabledModes() {
    const e = /* @__PURE__ */ new Set();
    return Object.values(this.taps).forEach((t) => t.forEach((s) => e.add(s))), ["single", "double", "long"].filter((t) => e.has(t));
  }
  _buttonsFor(e) {
    return Object.entries(this.taps).filter(([, t]) => t.includes(e)).map(([t]) => Number(t)).sort((t, s) => t - s);
  }
  /** Buttons of this tap mode that have no zone on the canvas (invisible). */
  _invisibleButtons(e) {
    const t = new Set((this.layout?.zones || []).map((s) => s.n));
    return this._buttonsFor(e).filter((s) => !t.has(s));
  }
  _assign(e, t) {
    const s = this._itemById(this._dragId || this._picked);
    this._picked = "", s && (this._mappings = {
      ...this._mappings,
      [e]: {
        ...this._mappings[e] ?? {},
        [t]: { room: s.room_id, action: s.action }
      }
    }, this._dragId = "");
  }
  /** Tap on a button: assign the picked action, else clear the button. */
  _tapButton(e, t, s) {
    this._picked ? this._assign(e, t) : s && this._clear(e, t);
  }
  _clear(e, t) {
    const s = { ...this._mappings[e] ?? {} };
    delete s[t], this._mappings = { ...this._mappings, [e]: s };
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  async _save() {
    this._busy = !0;
    try {
      await Ls(this.hass, { ...this.sw, mappings: this._mappings }), U(this), this._close();
    } catch (e) {
      this._busy = !1, alert("Erreur Homex : " + v(e));
    }
  }
  _trunc(e, t) {
    return e.length > t ? e.slice(0, t - 1) + "…" : e;
  }
  _actionRow(e, t) {
    return n`<div
      class="act ${t.has(e.id) ? "used" : ""} ${this._picked === e.id ? "picked" : ""}"
      draggable="true"
      @dragstart=${() => {
      this._picked = "", this._dragId = e.id;
    }}
      @dragend=${() => {
      this._dragId = "", this._dropBtn = null;
    }}
      @click=${() => this._picked = this._picked === e.id ? "" : e.id}
    >
      <span class="badge">${e.short}</span>
      <span>${e.label}</span>
    </div>`;
  }
  _canvas(e) {
    const t = this.layout;
    if (!t) return n`<p class="hint">Layout introuvable pour ce modèle.</p>`;
    const s = t.bounds, i = t.shape === "round", r = `mapclip-${t.id}`, o = i ? S`<ellipse cx=${s.x + s.w / 2} cy=${s.y + s.h / 2} rx=${s.w / 2} ry=${s.h / 2}></ellipse>` : S`<rect x=${s.x} y=${s.y} width=${s.w} height=${s.h} rx="0.4"></rect>`, a = i ? S`<ellipse class="sh" cx=${s.x + s.w / 2} cy=${s.y + s.h / 2} rx=${s.w / 2} ry=${s.h / 2}></ellipse>` : S`<rect class="sh" x=${s.x} y=${s.y} width=${s.w} height=${s.h} rx="0.4"></rect>`, c = new Set(this._buttonsFor(e)), d = (_) => (t.positions || []).find((g) => g.n === _), p = s.x + s.w / 2, m = s.y + s.h / 2, u = (_, g) => i ? [p + (_ - p) * 0.82, m + (g - m) * 0.82] : [_, g];
    return n`<svg class="canvas" viewBox="-10 -10 20 20">
      <defs><clipPath id=${r}>${o}</clipPath></defs>
      ${a}
      ${(t.zones || []).map((_) => {
      const g = c.has(_.n), f = this._mappings[e]?.[_.n], x = f ? this._itemForValue(f) : void 0, it = (g ? f ? "zone assigned" : "zone" : "zone disabled") + (g && this._dropBtn === _.n ? " drop" : ""), ze = d(_.n), [gt, Ue] = u(
        ze ? ze.x : _.x + _.w / 2,
        ze ? ze.y : _.y + _.h / 2
      ), Yt = S`<rect class=${it} x=${_.x} y=${_.y} width=${_.w} height=${_.h}
          clip-path="url(#${r})"
          @dragover=${(oi) => {
        g && (oi.preventDefault(), this._dropBtn = _.n);
      }}
          @dragleave=${() => {
        this._dropBtn === _.n && (this._dropBtn = null);
      }}
          @drop=${() => {
        g && this._assign(e, _.n), this._dropBtn = null;
      }}
          @click=${() => g && this._tapButton(e, _.n, !!f)}></rect>`;
      if (!f || !x)
        return S`${Yt}<text class="bn" x=${gt} y=${Ue}>${_.n}</text>`;
      const ii = this._multi ? Ue - 1.2 : Ue - 0.8, ri = this._multi ? Ue - 0.1 : Ue + 0.4;
      return S`${Yt}
          <text class="ic" x=${gt} y=${ii}>${x.short}</text>
          <text class="lb" x=${gt} y=${ri}>${this._trunc(x.clabel, 12)}</text>
          ${this._multi ? S`<text class="rm" x=${gt} y=${Ue + 0.9}>${this._trunc(x.room_name, 12)}</text>` : ""}`;
    })}
    </svg>`;
  }
  _invisibleTray(e) {
    const t = this._invisibleButtons(e);
    return t.length ? n`<div class="tray">
      <span class="tray-label">Boutons invisibles</span>
      ${t.map((s) => {
      const i = this._mappings[e]?.[s], r = i ? this._itemForValue(i) : void 0;
      return n`<div
          class="ichip ${i ? "assigned" : ""} ${this._dropBtn === s ? "drop" : ""}"
          @dragover=${(o) => {
        o.preventDefault(), this._dropBtn = s;
      }}
          @dragleave=${() => {
        this._dropBtn === s && (this._dropBtn = null);
      }}
          @drop=${() => {
        this._assign(e, s), this._dropBtn = null;
      }}
          @click=${() => this._tapButton(e, s, !!i)}
        >
          <span class="ichip-n">${s}</span>
          ${r ? n`<span class="ichip-a"
                >${r.short} ${this._trunc(r.clabel, 12)}${this._multi ? ` · ${r.room_name}` : ""}</span
              >` : ""}
        </div>`;
    })}
    </div>` : "";
  }
  render() {
    const e = this._enabledModes(), t = e.includes(this._tapTab) ? this._tapTab : e[0], s = this._usedIds();
    return n`
      <homex-dialog
        .open=${this.open}
        heading=${`Assignations — ${this.sw?.name ?? ""}`}
        @dialog-closed=${this._close}
      >
        <div class="cols">
          <div class="left">
            <p class="section">Actions Homex</p>
            ${this._rooms.length === 0 ? n`<p class="hint">Aucune pièce associée à cet interrupteur.</p>` : this._rooms.every((i) => !this._actionsByModule(i).length) ? n`<p class="hint">
                    Aucune action disponible : les pièces associées n'ont aucun
                    module actif (ex. Lights).
                  </p>` : this._rooms.map((i) => [i, this._actionsByModule(i)]).filter(([, i]) => i.length > 0).map(
      ([i, r]) => n`
                        ${this._multi ? n`<p class="room-head">🏠 ${i.name}</p>` : ""}
                        ${r.map(
        ([o, a]) => n`
                            <p class="mod-head">${No[o] ?? o}</p>
                            ${a.map((c) => this._actionRow(c, s))}
                          `
      )}
                      `
    )}
            <p class="hint">
              Glisse une action sur un bouton du canvas (ou touche une action
              puis un bouton). Touche un bouton assigné pour le vider.
            </p>
          </div>
          <div class="right">
            ${e.length ? n`<div class="tabs">
                    ${e.map(
      (i) => n`<span
                        class="tab ${i === t ? "active" : ""}"
                        @click=${() => this._tapTab = i}
                        >${Ro[i]}</span
                      >`
    )}
                  </div>
                  ${this._canvas(t)} ${this._invisibleTray(t)}` : n`<p class="hint">Aucun tap mode configuré sur ce preset.</p>`}
          </div>
        </div>
        <div slot="actions">
          <button @click=${this._close}>Annuler</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            Enregistrer
          </button>
        </div>
      </homex-dialog>
    `;
  }
};
V.styles = [
  C,
  y`
      .cols {
        display: flex;
        gap: 20px;
        align-items: flex-start;
      }
      .left {
        flex: 0 0 280px;
        max-height: 70vh;
        overflow: auto;
      }
      .right {
        flex: 1;
        min-width: 0;
      }
      /* Phone: switch visual first, then the action list, full width. */
      @media (max-width: 700px) {
        .cols {
          flex-direction: column;
          align-items: stretch;
        }
        .right {
          order: -1;
        }
        .left {
          flex: none;
          max-height: none;
          overflow: visible;
        }
        svg.canvas {
          max-width: 320px;
          margin: 0 auto;
        }
      }
      .section {
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        color: var(--secondary-text-color);
        margin: 0 0 8px;
      }
      .room-head {
        font-size: 13px;
        font-weight: 700;
        margin: 12px 0 6px;
        padding-bottom: 2px;
        border-bottom: 1px solid var(--divider-color, #444);
      }
      .mod-head {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        color: var(--secondary-text-color);
        margin: 8px 0 4px;
      }
      .act {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 12px;
        margin-bottom: 6px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 9px;
        cursor: grab;
        font-size: 14px;
        background: var(--card-background-color, #1c1c1c);
        user-select: none;
      }
      .act:active {
        cursor: grabbing;
      }
      /* Assigned somewhere on the switch — greyed but still draggable. */
      .act.used {
        opacity: 0.45;
      }
      /* Picked by a tap (touch alternative to dragging). */
      .act.picked {
        opacity: 1;
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 18%, transparent);
      }
      .act .badge {
        flex: 0 0 auto;
        width: 26px;
        height: 26px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        background: var(--primary-color);
        color: #fff;
      }
      .tabs {
        display: flex;
        gap: 4px;
        margin: 0 0 12px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .tab {
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .tab.active {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
        margin-bottom: -1px;
      }
      svg.canvas {
        width: 100%;
        max-width: 480px;
        aspect-ratio: 1;
        background: var(--code-editor-background-color, #111);
        border-radius: 10px;
        display: block;
      }
      .sh {
        fill: none;
        stroke: var(--primary-color);
        stroke-width: 0.2;
      }
      .zone {
        fill: color-mix(in srgb, var(--primary-color) 10%, transparent);
        stroke: color-mix(in srgb, var(--primary-color) 40%, transparent);
        stroke-width: 0.12;
      }
      .zone.assigned {
        fill: color-mix(in srgb, var(--primary-color) 32%, transparent);
      }
      .zone.disabled {
        fill: rgba(128, 128, 128, 0.12);
        stroke: rgba(128, 128, 128, 0.25);
      }
      /* Highlight the zone currently under a drag, so the target is obvious. */
      .zone.drop {
        fill: color-mix(in srgb, var(--primary-color) 60%, transparent);
        stroke: var(--primary-color);
        stroke-width: 0.25;
      }
      /* Labels must not swallow drop/click events — let them reach the rect. */
      .bn,
      .ic,
      .lb,
      .rm {
        pointer-events: none;
        text-anchor: middle;
        dominant-baseline: central;
      }
      .bn {
        fill: #fff;
        font-size: 1px;
        font-weight: 700;
      }
      .ic {
        font-size: 1px;
      }
      .lb {
        fill: #fff;
        font-size: 0.7px;
        font-weight: 600;
      }
      .rm {
        fill: var(--primary-color);
        font-size: 0.63px;
      }
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 8px 0 0;
      }
      .tray {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
        max-width: 480px;
      }
      .tray-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-text-color);
        margin-right: 4px;
      }
      .ichip {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border: 1px dashed var(--divider-color, #666);
        border-radius: 8px;
        font-size: 13px;
        min-height: 20px;
      }
      .ichip.assigned {
        border-style: solid;
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 14%, transparent);
        cursor: pointer;
      }
      .ichip.drop {
        border-style: solid;
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 45%, transparent);
      }
      .ichip * {
        pointer-events: none;
      }
      .ichip-n {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--secondary-background-color, #333);
        font-weight: 700;
        font-size: 12px;
      }
      .ichip-a {
        color: var(--primary-text-color);
      }
      button {
        cursor: pointer;
        border: none;
        border-radius: 8px;
        padding: 8px 14px;
        background: var(--secondary-background-color, #f0f0f0);
        color: var(--primary-text-color);
      }
      button.primary {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
    `
];
K([
  h({ attribute: !1 })
], V.prototype, "hass", 2);
K([
  h({ type: Boolean })
], V.prototype, "open", 2);
K([
  h({ attribute: !1 })
], V.prototype, "sw", 2);
K([
  h({ attribute: !1 })
], V.prototype, "layout", 2);
K([
  h({ attribute: !1 })
], V.prototype, "taps", 2);
K([
  l()
], V.prototype, "_rooms", 2);
K([
  l()
], V.prototype, "_heatingModes", 2);
K([
  l()
], V.prototype, "_mappings", 2);
K([
  l()
], V.prototype, "_tapTab", 2);
K([
  l()
], V.prototype, "_dragId", 2);
K([
  l()
], V.prototype, "_picked", 2);
K([
  l()
], V.prototype, "_dropBtn", 2);
K([
  l()
], V.prototype, "_busy", 2);
V = K([
  $("homex-switch-mapping")
], V);
var jo = Object.defineProperty, Bo = Object.getOwnPropertyDescriptor, O = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Bo(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && jo(t, s, r), r;
};
let M = class extends b {
  constructor() {
    super(...arguments), this.expanded = !1, this._dialog = "", this._menuOpen = !1, this._shutterCtlOpen = !1, this._renameScene = null, this._deleteScenes = !0, this._deleting = !1, this._syncing = !1, this._activeTab = "", this._gswitches = [], this._presets = [], this._layouts = [], this._mappingSwitch = null, this._shutterGroupOpen = !1, this._shutterGroupEdit = null, this._close = () => this._dialog = "", this._delete = () => {
      this._menuOpen = !1, this._deleteScenes = !0, this._dialog = "delete";
    }, this._confirmDelete = async () => {
      this._deleting = !0;
      try {
        await _r(this.hass, this.room.entry_id, this._deleteScenes), this._dialog = "", U(this);
      } catch (e) {
        alert("Erreur Homex : " + v(e));
      } finally {
        this._deleting = !1;
      }
    }, this._syncLabels = async () => {
      this._menuOpen = !1, this._syncing = !0;
      try {
        const e = await br(this.hass, this.room.entry_id);
        alert(
          `Synchronisé : ${e.updated} entité(s) (area + labels), ${e.scenes_renamed} scène(s) renommée(s).`
        );
      } catch (e) {
        alert("Erreur Homex : " + v(e));
      } finally {
        this._syncing = !1;
      }
    }, this._sceneNext = async (e) => {
      e?.stopPropagation();
      try {
        await Er(this.hass, this.room.entry_id);
      } catch (t) {
        alert("Erreur Homex : " + v(t));
      }
    }, this._dim = async (e, t) => {
      t?.stopPropagation();
      try {
        await xr(this.hass, this.room.entry_id, e);
      } catch (s) {
        alert("Erreur Homex : " + v(s));
      }
    }, this._toggleExpand = () => {
      this.dispatchEvent(
        new CustomEvent("homex-toggle-expand", {
          detail: { entry_id: this.room.entry_id },
          bubbles: !0,
          composed: !0
        })
      );
    };
  }
  _pick(e) {
    this._menuOpen = !1, this._dialog = e;
  }
  _isOn() {
    return this.hass.states[this.room.switch]?.state === "on";
  }
  _openHa(e, t) {
    Ns(`/config/scene/edit/${e.config_id}`, t);
  }
  async _deleteScene(e) {
    if (confirm(`Supprimer la scène "${e.name}" ?`))
      try {
        await Cr(this.hass, this.room.entry_id, e.key), U(this);
      } catch (t) {
        alert("Erreur Homex : " + v(t));
      }
  }
  async _sceneMoved(e) {
    const { oldIndex: t, newIndex: s } = e.detail, i = this.room.scenes.filter((o) => o.orderable).map((o) => o.key), [r] = i.splice(t, 1);
    i.splice(s, 0, r);
    try {
      await Sr(this.hass, this.room.entry_id, i), U(this);
    } catch (o) {
      alert("Erreur Homex : " + v(o));
    }
  }
  _iconBtn(e, t, s, i = !1) {
    return n`<button
      class="icon-btn"
      title=${t}
      aria-label=${t}
      ?disabled=${i}
      @click=${s}
    >
      <svg viewBox="0 0 24 24"><path d=${e}></path></svg>
    </button>`;
  }
  _sceneRow(e, t) {
    return n`
      <div class="scene-row">
        ${e.orderable ? n`<span class="handle" title="Glisser pour réordonner">
              <svg viewBox="0 0 24 24"><path d=${Ii}></path></svg>
            </span>` : n`<span class="pin" title="Toujours en dernier">
              <svg viewBox="0 0 24 24"><path d=${Zi}></path></svg>
            </span>`}
        <span class="scene-name">${e.name}</span>
        ${e.key === t ? n`<span class="active-tag">active</span>` : ""}
        <span class="btn-group">
          ${this._iconBtn(
      qi,
      "Voir dans Home Assistant",
      (s) => this._openHa(e, s)
    )}
          ${this._iconBtn(Wi, "Renommer", () => this._renameScene = e)}
          ${this._iconBtn(
      Di,
      e.removable ? "Supprimer" : "Scène par défaut",
      () => this._deleteScene(e),
      !e.removable
    )}
        </span>
      </div>
    `;
  }
  render() {
    const e = this.room, s = this._isOn() ? this.hass.states[e.switch]?.attributes?.active_scene ?? null : null, i = s ? e.scenes.find((f) => f.key === s)?.name : void 0, o = (e.area_id ? this.hass.areas?.[e.area_id] : null)?.icon || void 0, a = e.scenes.filter((f) => f.orderable), c = e.scenes.filter((f) => !f.orderable), d = e.scenes.some((f) => f.removable), p = e.modules?.includes("lights") ?? !0, m = e.modules?.includes("switches") ?? !1, u = e.modules?.includes("shutters") ?? !1, _ = e.modules?.includes("heating") ?? !1, g = !!(e.dim_up_triggers?.length || e.dim_down_triggers?.length);
    return n`
      <ha-card class=${this.expanded ? "selected" : ""}>
        <div class="head" @click=${this._toggleExpand} title="Plier / déplier">
          <svg class="chevron" viewBox="0 0 24 24">
            <path d=${this.expanded ? Li : Ps}></path>
          </svg>
          <homex-unit-controls
            .hass=${this.hass}
            .unit=${e}
            .areaIcon=${o}
            hideId
            .activeScene=${i}
            .hideToggle=${!p}
            .info=${_ ? this._climateReadings(e) : []}
          ></homex-unit-controls>
          <div class="head-actions">
            ${p && g ? n`
                  <button
                    class="round"
                    title="Baisser la luminosité (−20)"
                    @click=${(f) => this._dim(-20, f)}
                  >
                    <svg viewBox="0 0 24 24"><path d=${Ms}></path></svg>
                  </button>
                  <button
                    class="round"
                    title="Monter la luminosité (+20)"
                    @click=${(f) => this._dim(20, f)}
                  >
                    <svg viewBox="0 0 24 24"><path d=${Gt}></path></svg>
                  </button>
                ` : ""}
            ${p && d ? n`<button
                  class="round"
                  title="Changer de scène"
                  @click=${(f) => this._sceneNext(f)}
                >
                  <svg viewBox="0 0 24 24"><path d=${Xi}></path></svg>
                </button>` : ""}
            ${u ? this._renderShutterButton(e) : ""}
            <button
              class="kebab"
              title="Actions"
              @click=${(f) => {
      f.stopPropagation(), this._menuOpen = !0;
    }}
            >
              ⋮
            </button>
          </div>
        </div>

        ${this._menuOpen ? n`
              <div class="menu-backdrop" @click=${() => this._menuOpen = !1}></div>
              <div class="menu">
                <button @click=${() => this._pick("room")}>✏️ Modifier la pièce</button>
                ${p ? n`
                      <div class="menu-section">Lights</div>
                      <button @click=${() => this._pick("triggers")}>
                        ⚡ Déclencheurs (${e.triggers.length + e.scene_triggers.length})
                      </button>
                      <button @click=${() => this._pick("addgroup")}>
                        ＋ Ajouter un groupe
                      </button>
                      <div class="sep"></div>
                    ` : ""}
                <button ?disabled=${this._syncing} @click=${this._syncLabels}>
                  🏷 ${this._syncing ? "Synchronisation…" : "Synchroniser les labels"}
                </button>
                <div class="sep"></div>
                <button class="danger-item" @click=${this._delete}>
                  🗑 Supprimer la pièce
                </button>
              </div>
            ` : ""}

        ${this.expanded ? this._renderStats(e, p, m, u, _) : ""}
        ${this.expanded ? this._renderBody(
      e,
      s,
      a,
      c,
      p,
      m,
      u,
      _
    ) : ""}
      </ha-card>

      ${this._renderDialogs(e)}
    `;
  }
  /** The room's reference temperature and humidity (Climate metrics). */
  _climateReadings(e) {
    return ["temperature", "humidity"].filter((t) => e.metrics?.[t]?.sensors?.length).map((t) => {
      const s = this.hass.states[`sensor.homex_${e.room_id}_${t}`];
      if (!s || s.state === "unknown" || s.state === "unavailable") return "—";
      const i = s.attributes?.unit_of_measurement ?? "";
      return `${s.state}${i === "%" ? "" : " "}${i}`;
    });
  }
  /** Heating status pills: the zone's active mode, and Heating as soon as
   * one valve heats (Idle otherwise; none without radiators). */
  _climatePills(e) {
    const t = Fs(this.hass, e), s = Bs(this.hass, e), i = (r, o, a, c = "") => n`<span class="stat icon-stat ${c}" title=${a}>
        <svg viewBox="0 0 24 24"><path d=${r}></path></svg>${o}
      </span>`;
    return n`
      ${t ? i(
      Vi,
      t.mode,
      t.own ? "Chauffage désactivé dans la pièce" : `Mode de la zone ${t.zone}`
    ) : ""}
      ${e.heating?.radiators?.length ? Us(this.hass, e) ? i(Ot, "Heating", "Au moins une vanne chauffe", "heating") : i(Dt, "Idle", "Aucune vanne ne chauffe") : ""}
      ${s ? i(As, "Vanne ?", s, "warning") : ""}
    `;
  }
  /** Per-module counters, shown only once the room is expanded (the collapsed
   * card stays a compact one-line header). */
  _renderStats(e, t, s, i, r) {
    const o = Object.values(e.metrics ?? {}).filter((a) => a?.sensors?.length).length;
    return n`
      ${t ? n`
            <div class="module-title">Lights</div>
            <div class="stats">
              <span class="stat">🔌 ${e.devices.length} lumière(s)</span>
              <span class="stat">🎬 ${e.scenes.length} scène(s)</span>
              ${e.groups.length ? n`<span class="stat">📦 ${e.groups.length} groupe(s)</span>` : ""}
            </div>
          ` : ""}
      ${s ? n`
            <div class="module-title">Switches</div>
            <div class="stats">
              <span class="stat">🎛 ${this._roomSwitches().length} interrupteur(s)</span>
              <span class="stat">⚡ ${this._switchActionCount(e)} action(s)</span>
            </div>
          ` : ""}
      ${i ? n`
            <div class="module-title">Shutters</div>
            <div class="stats">
              <span class="stat">📦 ${(e.shutter_groups ?? []).length} groupe(s)</span>
              <span class="stat">🪟 ${this._shutterCount(e)} volet(s)</span>
            </div>
          ` : ""}
      ${r ? n`
            <div class="module-title">Climate</div>
            <div class="stats">
              <span class="stat">📈 ${o} métrique(s)</span>
              <span class="stat">🔥 ${e.heating?.radiators?.length ?? 0} radiateur(s)</span>
              ${this._climatePills(e)}
            </div>
          ` : ""}
    `;
  }
  _renderBody(e, t, s, i, r, o, a, c) {
    const d = [];
    if (r && d.push({ key: "lights", label: "Lights" }), o && d.push({ key: "switches", label: "Switches" }), a && d.push({ key: "shutters", label: "Shutters" }), c && d.push({ key: "climate", label: "Climate" }), !d.length)
      return n`<div class="empty-body">Aucun module actif sur cette pièce.</div>`;
    const p = d.some((m) => m.key === this._activeTab) ? this._activeTab : d[0].key;
    return n`
      <div class="tabs">
        ${d.map(
      (m) => n`<span
            class="tab ${m.key === p ? "active" : ""}"
            @click=${() => this._activeTab = m.key}
            >${m.label}</span
          >`
    )}
      </div>
      <div class="tab-panel">
        ${p === "lights" ? this._renderLightsTab(e, t, s, i) : p === "switches" ? this._renderSwitchesTab(e) : p === "climate" ? n`<homex-room-climate .hass=${this.hass} .room=${e}></homex-room-climate>` : this._renderShuttersTab(e)}
      </div>
    `;
  }
  _renderLightsTab(e, t, s, i) {
    return n`
      <div class="section-row">
        <span class="section">Scènes</span>
        <button @click=${() => this._pick("addscene")}>＋ Scène</button>
      </div>
      <ha-sortable handle-selector=".handle" @item-moved=${this._sceneMoved}>
        <div>${s.map((r) => this._sceneRow(r, t))}</div>
      </ha-sortable>
      ${i.map((r) => this._sceneRow(r, t))}

      <div class="section-row">
        <span class="section">Groupes</span>
        <button @click=${() => this._pick("addgroup")}>＋ Groupe</button>
      </div>
      ${e.groups.length ? n`<div class="groups">
            ${e.groups.map(
      (r) => n`<homex-group-row
                .hass=${this.hass}
                .room=${e}
                .group=${r}
              ></homex-group-row>`
    )}
          </div>` : n`<div class="empty-body">
            Aucun groupe. Un groupe pilote une partie des lumières de la pièce
            (ex. une lampe de chevet).
          </div>`}
    `;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSwitchData();
  }
  async _loadSwitchData() {
    try {
      [this._gswitches, this._presets, this._layouts] = await Promise.all([
        zs(this.hass),
        Os(this.hass),
        Hs(this.hass)
      ]);
    } catch {
    }
  }
  /** Global switches associated with this room. */
  _roomSwitches() {
    const e = this.room.room_id;
    return this._gswitches.filter((t) => (t.rooms || []).includes(e));
  }
  /** Number of Homex actions (switch triggers) registered on this room. */
  _switchActionCount(e) {
    const t = e.switch_triggers;
    if (!t) return 0;
    let s = t.toggle.length + t.scene_next.length + t.dim_up.length + t.dim_down.length;
    for (const i of Object.values(t.scenes)) s += i.length;
    for (const i of Object.values(t.groups)) s += i.length;
    return s;
  }
  _presetFor(e) {
    return Kt(this.hass, this._presets, e);
  }
  _layoutFor(e) {
    return e ? this._layouts.find((t) => t.id === e.layout_id) : void 0;
  }
  /** Adding a switch is owned by the Switch Manager — ask the panel to open its
   * add flow (pre-associating this room) instead of duplicating a local modal. */
  _openSwitchManagerAdd() {
    this.dispatchEvent(
      new CustomEvent("open-switch-add", {
        detail: { room_id: this.room.room_id },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _renderSwitchesTab(e) {
    const t = this._roomSwitches();
    return n`
      <div class="section-row">
        <span class="section">Interrupteurs</span>
        <button @click=${() => this._openSwitchManagerAdd()}>＋ Interrupteur</button>
      </div>
      ${t.length ? t.map((s) => {
      const i = this._presetFor(s);
      return n`<div
              class="switch-row"
              @click=${() => this._mappingSwitch = s}
            >
              <span class="switch-name">🎛 ${s.name}</span>
              <span class="switch-meta">
                ${i ? i.name : "aucun preset"}
              </span>
            </div>`;
    }) : n`<div class="empty-body">
            Aucun interrupteur associé. Clique sur « ＋ Interrupteur » pour en
            créer un (via le Switch Manager) et l'associer à cette pièce.
          </div>`}
    `;
  }
  _openShutterGroup(e) {
    this._shutterGroupEdit = e, this._shutterGroupOpen = !0;
  }
  _renderShuttersTab(e) {
    const t = e.shutter_groups ?? [];
    return n`
      <div class="section-row">
        <span class="section">Groupes de volets</span>
        <button @click=${() => this._openShutterGroup(null)}>＋ Groupe</button>
      </div>
      ${t.map(
      (s) => n`<div class="shutter-group">
          <div class="shutter-group-head">
            <span class="switch-name">📦 ${s.name}</span>
            <button
              class="cfg-btn"
              title="Configurer le groupe"
              @click=${() => this._openShutterGroup(s)}
            >
              ⚙
            </button>
          </div>
          ${s.devices.length ? s.devices.map(
        (i) => n`<div class="shutter-cover">
                  🪟 ${this._entityName(i)}
                </div>`
      ) : n`<div class="shutter-cover empty">Aucun volet dans ce groupe.</div>`}
        </div>`
    )}
    `;
  }
  _entityName(e) {
    return this.hass.states[e]?.attributes?.friendly_name || e;
  }
  _shutterCount(e) {
    return (e.shutter_groups ?? []).reduce(
      (t, s) => t + (s.devices?.length ?? 0),
      0
    );
  }
  /** Round quick button showing the default shutter group's state; opens the
   * shutter control modal. Hidden when the room has no shutter. */
  _renderShutterButton(e) {
    const t = Ws(e);
    if (!t) return "";
    const s = Nt(this.hass, t.devices);
    return n`<button
      class="round shutter-btn ${s.state}"
      title=${`Volets (${t.name}) : ${s.label}${s.position !== null ? ` · ${s.position} %` : ""}`}
      @click=${(i) => {
      i.stopPropagation(), this._shutterCtlOpen = !0;
    }}
    >
      <svg viewBox="0 0 24 24"><path d=${s.icon}></path></svg>
    </button>`;
  }
  _renderDialogs(e) {
    return n`
      <homex-shutter-control-dialog
        .hass=${this.hass}
        .room=${e}
        .open=${this._shutterCtlOpen}
        @dialog-closed=${() => this._shutterCtlOpen = !1}
      ></homex-shutter-control-dialog>
      <homex-room-dialog
        .hass=${this.hass}
        .room=${e}
        .open=${this._dialog === "room"}
        @dialog-closed=${this._close}
      ></homex-room-dialog>
      <homex-triggers-dialog
        .hass=${this.hass}
        .room=${e}
        .open=${this._dialog === "triggers"}
        @dialog-closed=${this._close}
      ></homex-triggers-dialog>
      <homex-group-dialog
        .hass=${this.hass}
        .room=${e}
        .group=${null}
        .open=${this._dialog === "addgroup"}
        @dialog-closed=${this._close}
      ></homex-group-dialog>
      <homex-scene-dialog
        .hass=${this.hass}
        .room=${e}
        .scene=${null}
        .open=${this._dialog === "addscene"}
        @dialog-closed=${this._close}
      ></homex-scene-dialog>
      <homex-scene-dialog
        .hass=${this.hass}
        .room=${e}
        .scene=${this._renameScene}
        .open=${this._renameScene !== null}
        @dialog-closed=${() => this._renameScene = null}
      ></homex-scene-dialog>
      <homex-shutter-group-dialog
        .hass=${this.hass}
        .room=${e}
        .group=${this._shutterGroupEdit}
        .open=${this._shutterGroupOpen}
        @dialog-closed=${() => this._shutterGroupOpen = !1}
      ></homex-shutter-group-dialog>
      ${this._mappingSwitch ? n`<homex-switch-mapping
            .hass=${this.hass}
            .open=${!0}
            .sw=${this._mappingSwitch}
            .layout=${this._layoutFor(this._presetFor(this._mappingSwitch))}
            .taps=${this._presetFor(this._mappingSwitch)?.taps ?? {}}
            @dialog-closed=${() => {
      this._mappingSwitch = null, this._loadSwitchData();
    }}
          ></homex-switch-mapping>` : ""}
      ${this._dialog === "delete" ? this._renderDeleteConfirm(e) : ""}
    `;
  }
  _renderDeleteConfirm(e) {
    return n`
      <div
        class="confirm-backdrop"
        @click=${(t) => {
      t.target === t.currentTarget && !this._deleting && this._close();
    }}
      >
        <div class="confirm-card" role="dialog" aria-modal="true">
          <h3>Supprimer la pièce « ${e.name} » ?</h3>
          <p class="confirm-text">
            Le switch, le groupe de lumières et les déclencheurs de cette pièce
            seront supprimés. Cette action est irréversible.
          </p>
          <label class="toggle-row">
            <span class="toggle ${this._deleteScenes ? "on" : ""}">
              <input
                type="checkbox"
                .checked=${this._deleteScenes}
                @change=${(t) => this._deleteScenes = t.target.checked}
              />
              <span class="knob"></span>
            </span>
            <span class="toggle-label">
              Supprimer aussi les ${e.scenes.length} scène(s) associée(s)
            </span>
          </label>
          <div class="confirm-actions">
            <button @click=${this._close} ?disabled=${this._deleting}>
              Annuler
            </button>
            <button
              class="danger"
              @click=${this._confirmDelete}
              ?disabled=${this._deleting}
            >
              ${this._deleting ? "Suppression…" : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    `;
  }
};
M.styles = [
  C,
  y`
      ha-card {
        position: relative;
        padding: 16px;
        margin-bottom: 16px;
      }
      /* Collapsed rooms: a compact one-line header. */
      ha-card:not(.selected) {
        padding: 8px 16px;
        margin-bottom: 8px;
      }
      /* The expanded (selected) room: blue outline, without shifting layout. */
      ha-card.selected {
        --ha-card-border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }
      .head {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        cursor: pointer;
      }
      .chevron {
        flex: 0 0 auto;
        width: 24px;
        height: 24px;
        fill: var(--secondary-text-color);
      }
      /* Title shrinks (min-width: 0) and the actions wrap onto their own
         line on narrow screens instead of overflowing the card. */
      homex-unit-controls {
        flex: 1 1 160px;
        min-width: 0;
      }
      .head-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
      }
      .round {
        width: 42px;
        height: 42px;
        min-height: 0;
        padding: 0;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--secondary-background-color, #f0f0f0);
        color: var(--secondary-text-color);
      }
      .round svg {
        width: 22px;
        height: 22px;
        fill: currentColor;
      }
      /* Shutters letting light in (or moving) stand out like a lit room. */
      .shutter-btn.open,
      .shutter-btn.partial,
      .shutter-btn.opening,
      .shutter-btn.closing {
        color: var(--primary-color);
      }
      .kebab {
        min-height: 0;
        padding: 6px 10px;
        font-size: 20px;
        line-height: 1;
        border-radius: 50%;
        background: transparent;
      }
      .menu-backdrop {
        position: fixed;
        inset: 0;
        z-index: 30;
      }
      .menu {
        position: absolute;
        top: 52px;
        right: 12px;
        z-index: 31;
        min-width: 230px;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.22);
        padding: 6px;
        display: flex;
        flex-direction: column;
      }
      .menu button {
        text-align: left;
        background: transparent;
        border-radius: 8px;
        min-height: 0;
        padding: 10px 12px;
        font-weight: 400;
      }
      .menu button:hover {
        background: var(--secondary-background-color, #f0f0f0);
      }
      .menu .danger-item {
        color: var(--error-color, #db4437);
      }
      .sep {
        height: 1px;
        background: var(--divider-color, #e0e0e0);
        margin: 6px 4px;
      }
      .menu-section {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--secondary-text-color);
        padding: 8px 12px 2px;
      }
      .module-title {
        margin: 14px 0 2px;
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--secondary-text-color);
      }
      .tabs {
        display: flex;
        gap: 4px;
        margin: 16px 0 0;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .tab {
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .tab.active {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
        margin-bottom: -1px;
      }
      .empty-body {
        padding: 20px 4px;
        color: var(--secondary-text-color);
        font-size: 14px;
      }
      .switch-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 12px 4px;
        border-top: 1px solid var(--divider-color, #ececec);
        cursor: pointer;
      }
      .switch-row:hover {
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.06));
      }
      .switch-name {
        font-size: 15px;
        font-weight: 500;
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .switch-meta {
        font-size: 12px;
        color: var(--secondary-text-color);
        text-align: right;
      }
      @media (max-width: 600px) {
        .switch-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }
        .switch-meta {
          text-align: left;
        }
      }
      .shutter-group {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        padding: 8px 12px;
        margin-top: 10px;
      }
      .shutter-group-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .cfg-btn {
        min-height: 0;
        padding: 4px 10px;
        font-size: 16px;
        border-radius: 8px;
        background: var(--secondary-background-color, #f0f0f0);
      }
      .shutter-cover {
        font-size: 14px;
        padding: 4px 0 4px 6px;
        color: var(--primary-text-color);
      }
      .shutter-cover.empty {
        color: var(--secondary-text-color);
        font-size: 13px;
      }
      .stats {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 12px 0 4px;
      }
      .stat {
        font-size: 13px;
        background: var(--secondary-background-color, #f0f0f0);
        border-radius: 14px;
        padding: 4px 12px;
      }
      .icon-stat {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .icon-stat svg {
        width: 15px;
        height: 15px;
        fill: currentColor;
      }
      .icon-stat.warning {
        color: var(--warning-color, #ffa600);
        background: color-mix(in srgb, var(--warning-color, #ffa600) 16%, transparent);
        cursor: help;
      }
      .icon-stat.heating {
        color: var(--state-climate-heat-color, #ff8100);
        background: color-mix(in srgb, var(--state-climate-heat-color, #ff8100) 16%, transparent);
      }
      .section-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 16px;
      }
      .scene-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-top: 1px solid var(--divider-color, #ececec);
      }
      .handle {
        display: flex;
        cursor: grab;
        color: var(--secondary-text-color);
      }
      .handle:active {
        cursor: grabbing;
      }
      .pin {
        display: flex;
        color: var(--secondary-text-color);
      }
      .handle svg,
      .pin svg {
        width: 22px;
        height: 22px;
        fill: currentColor;
      }
      .scene-name {
        flex: 1;
        font-size: 15px;
      }
      .active-tag {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-primary-color, #fff);
        background: var(--state-active-color, #ffc107);
        border-radius: 6px;
        padding: 2px 7px;
      }
      .btn-group {
        display: inline-flex;
        border: 1px solid var(--divider-color, #d0d0d0);
        border-radius: 8px;
        overflow: hidden;
      }
      .btn-group .icon-btn {
        min-height: 0;
        border: none;
        border-left: 1px solid var(--divider-color, #d0d0d0);
        border-radius: 0;
        background: transparent;
        padding: 6px 12px;
      }
      .btn-group .icon-btn:first-child {
        border-left: none;
      }
      .btn-group .icon-btn:hover:not(:disabled) {
        background: var(--secondary-background-color, #f0f0f0);
      }
      .btn-group .icon-btn:disabled {
        opacity: 0.3;
        cursor: default;
      }
      .icon-btn svg {
        display: block;
        width: 20px;
        height: 20px;
        fill: currentColor;
      }
      .groups {
        margin-top: 14px;
      }
      .groups homex-group-row {
        display: block;
        border-top: 1px solid var(--divider-color, #e0e0e0);
        margin-top: 8px;
        padding-top: 6px;
      }
      .confirm-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }
      .confirm-card {
        width: 440px;
        max-width: 100%;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        border-radius: 14px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        padding: 20px 22px;
      }
      .confirm-card h3 {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 500;
      }
      .confirm-text {
        margin: 0 0 16px;
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.45;
      }
      .toggle-row {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        padding: 10px 0;
      }
      .toggle-label {
        font-size: 14px;
      }
      .toggle {
        position: relative;
        flex: 0 0 auto;
        width: 42px;
        height: 24px;
        border-radius: 12px;
        background: var(--switch-unchecked-track-color, #bdbdbd);
        transition: background 0.2s;
      }
      .toggle.on {
        background: var(--switch-checked-track-color, var(--primary-color));
      }
      .toggle input {
        position: absolute;
        inset: 0;
        margin: 0;
        opacity: 0;
        cursor: pointer;
      }
      .toggle .knob {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        transition: transform 0.2s;
      }
      .toggle.on .knob {
        transform: translateX(18px);
      }
      .confirm-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 18px;
      }
      .confirm-actions button {
        cursor: pointer;
        border: none;
        border-radius: 8px;
        padding: 8px 16px;
        background: var(--secondary-background-color, #f0f0f0);
        color: var(--primary-text-color);
      }
      .confirm-actions button.danger {
        background: var(--error-color, #db4437);
        color: #fff;
      }
      .confirm-actions button:disabled {
        opacity: 0.6;
        cursor: default;
      }
    `
];
O([
  h({ attribute: !1 })
], M.prototype, "hass", 2);
O([
  h({ attribute: !1 })
], M.prototype, "room", 2);
O([
  h({ type: Boolean })
], M.prototype, "expanded", 2);
O([
  l()
], M.prototype, "_dialog", 2);
O([
  l()
], M.prototype, "_menuOpen", 2);
O([
  l()
], M.prototype, "_shutterCtlOpen", 2);
O([
  l()
], M.prototype, "_renameScene", 2);
O([
  l()
], M.prototype, "_deleteScenes", 2);
O([
  l()
], M.prototype, "_deleting", 2);
O([
  l()
], M.prototype, "_syncing", 2);
O([
  l()
], M.prototype, "_activeTab", 2);
O([
  l()
], M.prototype, "_gswitches", 2);
O([
  l()
], M.prototype, "_presets", 2);
O([
  l()
], M.prototype, "_layouts", 2);
O([
  l()
], M.prototype, "_mappingSwitch", 2);
O([
  l()
], M.prototype, "_shutterGroupOpen", 2);
O([
  l()
], M.prototype, "_shutterGroupEdit", 2);
M = O([
  $("homex-room-card")
], M);
var Uo = Object.defineProperty, Fo = Object.getOwnPropertyDescriptor, Et = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Fo(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && Uo(t, s, r), r;
};
const gs = (e) => '"' + String(e).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
function qo(e) {
  const t = ["google_assistant:", "  entity_config:"];
  e.length || (t[1] = "  entity_config: {}");
  for (const s of e)
    t.push(`    ${s.switch}:`), t.push(`      name: ${gs(s.name)}`), t.push("      expose: true"), t.push(`      room: ${gs(s.name)}`);
  return t.join(`
`) + `
`;
}
let Ke = class extends b {
  constructor() {
    super(...arguments), this.open = !1, this.rooms = [], this._copied = !1;
  }
  get _yaml() {
    return qo(this.rooms);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  async _copy() {
    const e = this._yaml;
    try {
      await navigator.clipboard.writeText(e);
    } catch {
      const t = this.renderRoot.querySelector("textarea");
      t && (t.select(), document.execCommand("copy"));
    }
    this._copied = !0, setTimeout(() => this._copied = !1, 1500);
  }
  _download() {
    const e = new Blob([this._yaml], { type: "text/yaml" }), t = URL.createObjectURL(e), s = document.createElement("a");
    s.href = t, s.download = "homex_google_assistant.yaml", s.click(), URL.revokeObjectURL(t);
  }
  render() {
    return n`
      <homex-dialog
        .open=${this.open}
        heading="Exposer les pièces (Google Assistant)"
        @dialog-closed=${this._close}
      >
        <p class="hint">
          Colle cet extrait dans <code>configuration.yaml</code> pour exposer le
          toggle on/off de chaque pièce à Google Assistant.
        </p>
        <textarea
          readonly
          .value=${this._yaml}
          @click=${(e) => e.target.select()}
        ></textarea>
        <span slot="actions">
          <button @click=${this._download}>Télécharger .yaml</button>
          <button @click=${this._close}>Fermer</button>
          <button class="primary" @click=${this._copy}>
            ${this._copied ? "Copié ✓" : "Copier"}
          </button>
        </span>
      </homex-dialog>
    `;
  }
};
Ke.styles = [
  C,
  y`
      .hint {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin: 0 0 10px;
      }
      .hint code {
        font-family: monospace;
      }
      textarea {
        width: 100%;
        min-height: 340px;
        box-sizing: border-box;
        font-family: "SFMono-Regular", Consolas, monospace;
        font-size: 13px;
        line-height: 1.5;
        padding: 12px 14px;
        border-radius: 8px;
        border: 1px solid var(--divider-color, #ccc);
        background: var(--code-editor-background-color, var(--card-background-color, #1c1c1c));
        color: var(--primary-text-color);
        white-space: pre;
        resize: vertical;
      }
    `
];
Et([
  h({ type: Boolean })
], Ke.prototype, "open", 2);
Et([
  h({ attribute: !1 })
], Ke.prototype, "rooms", 2);
Et([
  l()
], Ke.prototype, "_copied", 2);
Ke = Et([
  $("homex-export-dialog")
], Ke);
var Wo = Object.defineProperty, Zo = Object.getOwnPropertyDescriptor, D = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Zo(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && Wo(t, s, r), r;
};
const Fe = 20, vs = 0.5;
let H = class extends b {
  constructor() {
    super(...arguments), this.layout = null, this._name = "", this._id = "", this._buttons = 2, this._shape = "round", this._bounds = { x: 5, y: 5, w: 10, h: 10 }, this._columns = 2, this._rows = 1, this._colLines = [], this._rowLines = [], this._userHidden = /* @__PURE__ */ new Set(), this._assignments = [], this._busy = !1, this._dragClient = null, this._hoverCell = -1, this._overTray = !1, this._idEdited = !1, this._drag = null, this._onUp = () => {
      const e = this._drag;
      if (e?.kind === "num") {
        const t = [...this._assignments];
        this._hoverCell >= 0 ? (e.fromCell >= 0 ? [t[e.fromCell], t[this._hoverCell]] = [t[this._hoverCell], t[e.fromCell]] : (t[this._hoverCell] > 0 && this._userHidden.add(t[this._hoverCell]), t[this._hoverCell] = e.button, this._userHidden.delete(e.button)), this._assignments = t) : this._overTray && e.fromCell >= 0 && (this._userHidden.add(t[e.fromCell]), t[e.fromCell] = 0, this._assignments = t);
      }
      this._drag = null, this._dragClient = null, this._hoverCell = -1, this._overTray = !1, window.removeEventListener("pointermove", this._onMove), window.removeEventListener("pointerup", this._onUp);
    }, this._onMove = (e) => {
      const t = this._drag;
      if (!t) return;
      if (t.kind === "num") {
        this._dragClient = { x: e.clientX, y: e.clientY }, this._hitTest(e.clientX, e.clientY);
        return;
      }
      const { x: s, y: i } = this._svgPoint(e), r = this._bounds;
      if (t.kind === "col") {
        const o = [...this._colLines];
        o[t.index] = Math.min(Math.max(s, r.x), r.x + r.w), this._colLines = o;
      } else if (t.kind === "row") {
        const o = [...this._rowLines];
        o[t.index] = Math.min(Math.max(i, r.y), r.y + r.h), this._rowLines = o;
      } else if (t.kind === "br") {
        let o = Math.max(2, s - r.x), a = Math.max(2, i - r.y);
        this._shape === "round" && (o = a = Math.max(o, a)), this._bounds = { ...r, w: o, h: a }, this._clampDividers();
      } else if (t.kind === "tl") {
        const o = r.x + r.w, a = r.y + r.h;
        let c = Math.min(s, o - 2), d = Math.min(i, a - 2), p = o - c, m = a - d;
        if (this._shape === "round") {
          const u = Math.max(p, m);
          c = o - u, d = a - u, p = m = u;
        }
        this._bounds = { x: c, y: d, w: p, h: m }, this._clampDividers();
      }
    };
  }
  willUpdate(e) {
    if (e.has("layout")) {
      const t = this.layout;
      this._name = t?.name ?? "", this._id = t?.id ?? "", this._buttons = t?.buttons ?? 2, this._shape = t?.shape ?? "round";
      const s = 10;
      this._bounds = t?.bounds ? { x: t.bounds.x + s, y: t.bounds.y + s, w: t.bounds.w, h: t.bounds.h } : this._defaultBounds(this._shape), this._columns = t?.columns ?? 2, this._rows = t?.rows ?? 1, this._idEdited = !!t, this._busy = !1, this._dragClient = null, this._hoverCell = -1, this._overTray = !1, t && (t.colLines?.length || t.rowLines?.length) ? (this._colLines = (t.colLines ?? []).map((i) => i + s), this._rowLines = (t.rowLines ?? []).map((i) => i + s)) : this._resetDividers(), this._assignments = t?.assignments ? [...t.assignments] : [], this._userHidden = new Set(t?.assignments ? this._unassigned() : []), this._reconcile();
    }
  }
  _defaultBounds(e) {
    return e === "vrect" ? { x: 7.5, y: 0, w: 5, h: 20 } : { x: 5, y: 5, w: 10, h: 10 };
  }
  _snap(e) {
    return Math.min(Fe, Math.max(0, Math.round(e / vs) * vs));
  }
  _resetDividers() {
    const e = this._bounds, t = Math.max(1, this._columns), s = Math.max(1, this._rows);
    this._colLines = Array.from(
      { length: t - 1 },
      (i, r) => e.x + e.w * (r + 1) / t
    ), this._rowLines = Array.from(
      { length: s - 1 },
      (i, r) => e.y + e.h * (r + 1) / s
    );
  }
  _clampDividers() {
    const e = this._bounds;
    this._colLines = this._colLines.map((t) => Math.min(Math.max(t, e.x), e.x + e.w)), this._rowLines = this._rowLines.map((t) => Math.min(Math.max(t, e.y), e.y + e.h));
  }
  /** Fit the per-cell assignments to the current button count and grid: keep
   * placements that still fit, then place any not-yet-placed button in a free
   * cell. Buttons that don't fit remain unassigned (save is blocked).
   * Buttons the user made invisible are never auto-placed. */
  _reconcile() {
    for (const o of [...this._userHidden])
      o > this._buttons && this._userHidden.delete(o);
    const e = this._userHidden, t = Math.max(1, this._columns) * Math.max(1, this._rows), s = this._assignments, i = new Array(t).fill(0), r = /* @__PURE__ */ new Set();
    for (let o = 0; o < Math.min(s.length, t); o++) {
      const a = s[o];
      a >= 1 && a <= this._buttons && !r.has(a) && (i[o] = a, r.add(a));
    }
    for (let o = 1; o <= this._buttons; o++)
      if (!r.has(o) && !e.has(o)) {
        const a = i.indexOf(0);
        a >= 0 && (i[a] = o, r.add(o));
      }
    this._assignments = i;
  }
  _cells() {
    const e = this._bounds, t = Math.max(1, this._columns), s = Math.max(1, this._rows), i = [e.x, ...[...this._colLines].sort((a, c) => a - c), e.x + e.w], r = [e.y, ...[...this._rowLines].sort((a, c) => a - c), e.y + e.h], o = [];
    for (let a = 0; a < s; a++)
      for (let c = 0; c < t; c++) {
        const d = i[c] ?? e.x, p = i[c + 1] ?? e.x + e.w, m = r[a] ?? e.y, u = r[a + 1] ?? e.y + e.h;
        o.push({
          i: a * t + c,
          x: d,
          y: m,
          w: p - d,
          h: u - m,
          cx: (d + p) / 2,
          cy: (m + u) / 2
        });
      }
    return o;
  }
  _cellAt(e, t) {
    for (const s of this._cells())
      if (e >= s.x && e <= s.x + s.w && t >= s.y && t <= s.y + s.h) return s.i;
    return -1;
  }
  _unassigned() {
    const e = new Set(this._assignments.filter((s) => s > 0)), t = [];
    for (let s = 1; s <= this._buttons; s++) e.has(s) || t.push(s);
    return t;
  }
  _setShape(e) {
    this._shape = e, this._bounds = this._defaultBounds(e), this._resetDividers(), this._reconcile();
  }
  _setButtons(e) {
    this._buttons = isNaN(e) || e < 1 ? 1 : Math.floor(e), this._reconcile();
  }
  _setColumns(e) {
    this._columns = isNaN(e) || e < 1 ? 1 : Math.floor(e), this._resetDividers(), this._reconcile();
  }
  _setRows(e) {
    this._rows = isNaN(e) || e < 1 ? 1 : Math.floor(e), this._resetDividers(), this._reconcile();
  }
  _onName(e) {
    this._name = e, this._idEdited || (this._id = E(e));
  }
  // -- Dragging -----------------------------------------------------------
  _svgPoint(e, t = !0) {
    const i = this.renderRoot.querySelector("svg").getBoundingClientRect(), r = (e.clientX - i.left) / i.width * Fe, o = (e.clientY - i.top) / i.height * Fe;
    return t ? { x: this._snap(r), y: this._snap(o) } : { x: r, y: o };
  }
  _start(e, t) {
    t.preventDefault(), t.stopPropagation(), this._drag = e, e?.kind === "num" && (this._dragClient = { x: t.clientX, y: t.clientY }, this._hitTest(t.clientX, t.clientY)), window.addEventListener("pointermove", this._onMove), window.addEventListener("pointerup", this._onUp);
  }
  /** Update _hoverCell / _overTray for a client point (num drag targets). */
  _hitTest(e, t) {
    const i = this.renderRoot.querySelector("svg").getBoundingClientRect();
    if (e >= i.left && e <= i.right && t >= i.top && t <= i.bottom) {
      const a = (e - i.left) / i.width * Fe, c = (t - i.top) / i.height * Fe;
      this._hoverCell = this._cellAt(a, c), this._overTray = !1;
      return;
    }
    const o = this.renderRoot.querySelector(".tray")?.getBoundingClientRect();
    this._overTray = !!(o && e >= o.left && e <= o.right && t >= o.top && t <= o.bottom), this._hoverCell = -1;
  }
  // -- Persistence --------------------------------------------------------
  _close() {
    this.dispatchEvent(new CustomEvent("layout-closed"));
  }
  /** Translate everything so the shape is centered on the canvas (10,10). */
  _recenterShape() {
    const e = this._bounds, t = 10 - (e.x + e.w / 2), s = 10 - (e.y + e.h / 2);
    this._bounds = { x: e.x + t, y: e.y + s, w: e.w, h: e.h }, this._colLines = this._colLines.map((i) => i + t), this._rowLines = this._rowLines.map((i) => i + s);
  }
  async _save() {
    const e = this._name.trim(), t = this._id.trim();
    if (!e || !t) {
      alert("Nom et id du layout requis.");
      return;
    }
    this._recenterShape();
    const s = 10, r = this._cells().filter((p) => this._assignments[p.i] > 0), o = r.map((p) => ({
      n: this._assignments[p.i],
      x: p.cx - s,
      y: p.cy - s
    })), a = r.map((p) => ({
      n: this._assignments[p.i],
      x: p.x - s,
      y: p.y - s,
      w: p.w,
      h: p.h
    })), c = this._bounds, d = {
      id: t,
      name: e,
      buttons: this._buttons,
      shape: this._shape,
      bounds: { x: c.x - s, y: c.y - s, w: c.w, h: c.h },
      columns: this._columns,
      rows: this._rows,
      colLines: this._colLines.map((p) => p - s),
      rowLines: this._rowLines.map((p) => p - s),
      assignments: this._assignments,
      positions: o,
      zones: a
    };
    this._busy = !0;
    try {
      await ir(this.hass, d), this._close();
    } catch (p) {
      this._busy = !1, alert("Erreur Homex : " + v(p));
    }
  }
  async _delete() {
    if (this.layout && confirm(`Supprimer le layout "${this.layout.name}" ?`)) {
      this._busy = !0;
      try {
        await rr(this.hass, this.layout.id), this._close();
      } catch (e) {
        this._busy = !1, alert("Erreur Homex : " + v(e));
      }
    }
  }
  // -- Render -------------------------------------------------------------
  _renderShape() {
    const e = this._bounds;
    return this._shape === "round" ? S`<ellipse class="shape" cx=${e.x + e.w / 2} cy=${e.y + e.h / 2}
        rx=${e.w / 2} ry=${e.h / 2}></ellipse>` : S`<rect class="shape" x=${e.x} y=${e.y} width=${e.w} height=${e.h}
      rx="0.4"></rect>`;
  }
  /** The contour geometry (no styling) used as the clip mask, so zones don't
   * spill outside a round shape. */
  _shapeClip() {
    const e = this._bounds;
    return this._shape === "round" ? S`<ellipse cx=${e.x + e.w / 2} cy=${e.y + e.h / 2}
        rx=${e.w / 2} ry=${e.h / 2}></ellipse>` : S`<rect x=${e.x} y=${e.y} width=${e.w} height=${e.h} rx="0.4"></rect>`;
  }
  render() {
    const e = this._bounds, t = Array.from({ length: Fe + 1 }, (c, d) => d), s = this._cells(), i = this._unassigned(), r = this._drag?.kind === "num" ? this._drag : null, o = r ? r.fromCell : -1, a = r ? this._hoverCell : -1;
    return n`
      <div class="cols">
        <div class="form">
          ${P("Nom", this._name, (c) => this._onName(c), "Rond 2 boutons")}
          <div class="section">Forme principale</div>
          <div class="shapes">
            <button class="shape-btn ${this._shape === "round" ? "on" : ""}"
              @click=${() => this._setShape("round")}>● Rond</button>
            <button class="shape-btn ${this._shape === "square" ? "on" : ""}"
              @click=${() => this._setShape("square")}>■ Carré</button>
            <button class="shape-btn ${this._shape === "vrect" ? "on" : ""}"
              @click=${() => this._setShape("vrect")}>▮ Rect. vertical</button>
          </div>
          <div class="fields">
            <div class="field">
              <label>Boutons</label>
              <input class="num" type="number" min="1" .value=${String(this._buttons)}
                @change=${(c) => this._setButtons(Number(c.target.value))} />
            </div>
            <div class="field">
              <label>Colonnes</label>
              <input class="num" type="number" min="1" .value=${String(this._columns)}
                @change=${(c) => this._setColumns(Number(c.target.value))} />
            </div>
            <div class="field">
              <label>Lignes</label>
              <input class="num" type="number" min="1" .value=${String(this._rows)}
                @change=${(c) => this._setRows(Number(c.target.value))} />
            </div>
          </div>
          <button class="center-btn" @click=${() => this._recenterShape()}>
            ⊕ Centrer la forme
          </button>
          <p class="hint">
            Grille aimantée 20×20. Un bouton occupe une zone (cadran) délimitée par
            les séparateurs. Glisse un chiffre pour l'assigner à un cadran (il
            s'échange avec l'occupant) ou vers la zone « Invisible » pour le
            retirer du visuel. La forme est recentrée à la sauvegarde.
          </p>
        </div>

        <div class="stage">
          <svg class="canvas" viewBox="0 0 20 20">
            <defs>
              <clipPath id="shapeclip">${this._shapeClip()}</clipPath>
            </defs>
            ${t.map(
      (c) => S`
                <line class="grid-line" x1=${c} y1="0" x2=${c} y2="20"></line>
                <line class="grid-line" x1="0" y1=${c} x2="20" y2=${c}></line>`
    )}
            ${this._renderShape()}
            ${s.map(
      (c) => this._assignments[c.i] > 0 ? S`<rect class="zone" x=${c.x} y=${c.y} width=${c.w} height=${c.h}
                    clip-path="url(#shapeclip)"></rect>` : ""
    )}
            ${a >= 0 && a !== o ? (() => {
      const c = s[a];
      return S`<rect class="cell-hi" x=${c.x} y=${c.y}
                    width=${c.w} height=${c.h} clip-path="url(#shapeclip)"></rect>`;
    })() : ""}
            ${this._colLines.map(
      (c, d) => S`
                <line class="divider" x1=${c} y1=${e.y} x2=${c} y2=${e.y + e.h}
                  clip-path="url(#shapeclip)"></line>
                <line class="divider-hit" x1=${c} y1=${e.y} x2=${c} y2=${e.y + e.h}
                  @pointerdown=${(p) => this._start({ kind: "col", index: d }, p)}></line>`
    )}
            ${this._rowLines.map(
      (c, d) => S`
                <line class="divider" x1=${e.x} y1=${c} x2=${e.x + e.w} y2=${c}
                  clip-path="url(#shapeclip)"></line>
                <line class="divider-hit" x1=${e.x} y1=${c} x2=${e.x + e.w} y2=${c}
                  @pointerdown=${(p) => this._start({ kind: "row", index: d }, p)}></line>`
    )}
            ${s.map((c) => {
      const d = this._assignments[c.i];
      return !d || c.i === o ? "" : S`
                <circle class="num-badge" cx=${c.cx} cy=${c.cy} r="1.1"
                  @pointerdown=${(p) => this._start({ kind: "num", fromCell: c.i, button: d }, p)}></circle>
                <text class="num-text" x=${c.cx} y=${c.cy}>${d}</text>`;
    })}
            <rect class="handle" x=${e.x - 0.35} y=${e.y - 0.35} width="0.7" height="0.7"
              @pointerdown=${(c) => this._start({ kind: "tl" }, c)}></rect>
            <rect class="handle" x=${e.x + e.w - 0.35} y=${e.y + e.h - 0.35} width="0.7" height="0.7"
              @pointerdown=${(c) => this._start({ kind: "br" }, c)}></rect>
          </svg>

          <div class="tray ${r && this._overTray ? "over" : ""}">
            <span class="tray-label">Invisible</span>
            ${i.length ? i.map(
      (c) => n`<span
                    class="tray-badge"
                    @pointerdown=${(d) => this._start({ kind: "num", fromCell: -1, button: c }, d)}
                    >${c}</span
                  >`
    ) : n`<span class="tray-empty">
                  Glisse un bouton ici pour le rendre invisible
                </span>`}
          </div>
        </div>
      </div>

      ${r && this._dragClient ? n`<div
            class="floating"
            style="left:${this._dragClient.x}px; top:${this._dragClient.y}px"
          >
            ${r.button}
          </div>` : ""}

      <div class="actions">
        ${this.layout ? n`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>` : ""}
        <button @click=${this._close}>Annuler</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._save}>
          ${this.layout ? "Enregistrer" : "Créer le layout"}
        </button>
      </div>
    `;
  }
};
H.styles = [
  C,
  y`
      .cols {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
      }
      .form {
        flex: 1 1 260px;
        min-width: 240px;
      }
      /* Canvas column: 380px wide, shrinking to the screen on phones. */
      .stage {
        flex: 0 1 380px;
        min-width: 0;
      }
      .fields {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .field {
        flex: 1 1 90px;
      }
      .field label {
        display: block;
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }
      input.num {
        width: 100%;
        box-sizing: border-box;
        padding: 10px 12px;
        font-size: 15px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      .shapes {
        display: flex;
        gap: 8px;
        margin: 6px 0 14px;
      }
      .shape-btn {
        flex: 1;
        cursor: pointer;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        padding: 8px;
        font-size: 13px;
      }
      .shape-btn.on {
        border-color: var(--primary-color);
        color: var(--primary-color);
        box-shadow: inset 0 0 0 1px var(--primary-color);
      }
      .center-btn {
        margin: 6px 0 0;
        padding: 8px 12px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        cursor: pointer;
      }
      .center-btn:hover {
        border-color: var(--primary-color);
      }
      svg.canvas {
        width: 380px;
        max-width: 100%;
        height: auto;
        aspect-ratio: 1;
        background: var(--card-background-color, #111);
        border: 1px solid var(--divider-color, #444);
        border-radius: 8px;
        touch-action: none;
      }
      .grid-line {
        stroke: var(--divider-color, rgba(255, 255, 255, 0.08));
        stroke-width: 0.03;
      }
      .shape {
        fill: color-mix(in srgb, var(--primary-color) 12%, transparent);
        stroke: var(--primary-color);
        stroke-width: 0.15;
      }
      .zone {
        fill: color-mix(in srgb, var(--primary-color) 6%, transparent);
        stroke: color-mix(in srgb, var(--primary-color) 40%, transparent);
        stroke-width: 0.06;
      }
      .cell-hi {
        fill: color-mix(in srgb, var(--primary-color) 22%, transparent);
        pointer-events: none;
      }
      .divider {
        stroke: var(--secondary-text-color);
        stroke-width: 0.1;
        stroke-dasharray: 0.4 0.3;
      }
      .divider-hit {
        stroke: transparent;
        stroke-width: 1.2;
        cursor: grab;
      }
      .handle {
        fill: var(--primary-color);
        cursor: nwse-resize;
      }
      .num-badge {
        fill: var(--primary-color);
        cursor: grab;
      }
      .num-text {
        fill: #fff;
        font-size: 1.6px;
        font-weight: 700;
        text-anchor: middle;
        dominant-baseline: central;
        pointer-events: none;
        user-select: none;
      }
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 8px 0;
      }
      .warn {
        font-size: 13px;
        color: var(--error-color, #db4437);
        margin: 8px 0;
      }
      .tray {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
        padding: 10px 12px;
        min-height: 44px;
        border: 1px dashed var(--divider-color, #666);
        border-radius: 8px;
        width: 380px;
        max-width: 100%;
        box-sizing: border-box;
      }
      .tray.over {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      }
      .tray-label {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--secondary-text-color);
        margin-right: 4px;
      }
      .tray-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--primary-color);
        color: #fff;
        font-weight: 700;
        font-size: 14px;
        cursor: grab;
        touch-action: none;
        user-select: none;
      }
      .tray-empty {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .floating {
        position: fixed;
        z-index: 1000;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--primary-color);
        color: #fff;
        font-weight: 700;
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-50%, -50%);
        pointer-events: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
      }
      button.primary:disabled {
        opacity: 0.5;
        cursor: default;
      }
    `
];
D([
  h({ attribute: !1 })
], H.prototype, "hass", 2);
D([
  h({ attribute: !1 })
], H.prototype, "layout", 2);
D([
  l()
], H.prototype, "_name", 2);
D([
  l()
], H.prototype, "_id", 2);
D([
  l()
], H.prototype, "_buttons", 2);
D([
  l()
], H.prototype, "_shape", 2);
D([
  l()
], H.prototype, "_bounds", 2);
D([
  l()
], H.prototype, "_columns", 2);
D([
  l()
], H.prototype, "_rows", 2);
D([
  l()
], H.prototype, "_colLines", 2);
D([
  l()
], H.prototype, "_rowLines", 2);
D([
  l()
], H.prototype, "_assignments", 2);
D([
  l()
], H.prototype, "_busy", 2);
D([
  l()
], H.prototype, "_dragClient", 2);
D([
  l()
], H.prototype, "_hoverCell", 2);
D([
  l()
], H.prototype, "_overTray", 2);
H = D([
  $("homex-layout-editor")
], H);
var Go = Object.defineProperty, Ko = Object.getOwnPropertyDescriptor, T = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ko(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && Go(t, s, r), r;
};
let A = class extends b {
  constructor() {
    super(...arguments), this.preset = null, this.layouts = [], this.prefillDevice = "", this._name = "", this._nameTyped = !1, this._id = "", this._deviceId = "", this._modelKey = "", this._models = [], this._devices = [], this._layoutId = "", this._taps = {}, this._bindings = {}, this._actions = [], this._actionTab = "single", this._busy = !1, this._idEdited = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadModels(), this._loadDevices();
  }
  async _loadModels() {
    try {
      this._models = await lr(this.hass);
    } catch {
      this._models = [];
    }
  }
  async _loadDevices() {
    try {
      this._devices = await Ds(this.hass);
    } catch {
      this._devices = [];
    }
  }
  /** Individual devices of the currently selected model, name-sorted. */
  _devicesForModel() {
    return this._modelKey ? this._devices.filter((e) => e.model === this._modelKey) : [];
  }
  willUpdate(e) {
    if (e.has("preset")) {
      const t = this.preset;
      this._name = t?.name ?? "", this._nameTyped = !!t, this._id = t?.id ?? "", this._deviceId = t?.device_id ?? this.prefillDevice ?? "", this._modelKey = t?.model ?? (this._deviceId ? It(this.hass, this._deviceId) : ""), this._layoutId = t?.layout_id ?? "", this._taps = JSON.parse(JSON.stringify(t?.taps ?? {})), this._bindings = JSON.parse(JSON.stringify(t?.bindings ?? {})), this._actions = [], this._idEdited = !!t, this._busy = !1, !t && this._deviceId && !this._name && (this._name = Vt(this.hass, this._deviceId), this._id = E(this._name)), this._ensureTaps(), this._deviceId && this._loadActions();
    }
  }
  _selectedLayout() {
    return this.layouts.find((e) => e.id === this._layoutId);
  }
  _ensureTaps() {
    const e = this._selectedLayout()?.buttons ?? 0, t = {};
    for (let s = 1; s <= e; s++) t[s] = this._taps[s] ?? ["single"];
    this._taps = t;
  }
  _toggleTap(e, t) {
    const s = this._taps[e] ?? [];
    this._taps = {
      ...this._taps,
      [e]: s.includes(t) ? s.filter((i) => i !== t) : [...s, t]
    };
  }
  _onLayout(e) {
    this._layoutId = e, this._ensureTaps();
  }
  async _loadActions() {
    try {
      this._actions = await Ts(this.hass, this._deviceId);
    } catch {
      this._actions = [];
    }
  }
  _onModel(e) {
    this._modelKey = e;
    const t = this._models.find((s) => s.model === e);
    this._deviceId = t?.device_id ?? "", this._actions = [], this._bindings = {}, t && ((!this._name.trim() || !this._nameTyped) && (this._name = t.label, this._idEdited || (this._id = E(t.label))), this._loadActions());
  }
  _onRefDevice(e) {
    this._deviceId = e, this._actions = [], this._bindings = {}, e && this._loadActions();
  }
  _enabledModes() {
    const e = /* @__PURE__ */ new Set();
    return Object.values(this._taps).forEach((t) => t.forEach((s) => e.add(s))), A.TAP_MODES.map((t) => t.mode).filter(
      (t) => e.has(t)
    );
  }
  _buttonsFor(e) {
    return Object.entries(this._taps).filter(([, t]) => t.includes(e)).map(([t]) => Number(t)).sort((t, s) => t - s);
  }
  /** Set the single action bound to (mode, btn); "" clears it. */
  _setBind(e, t, s) {
    this._bindings = {
      ...this._bindings,
      [e]: {
        ...this._bindings[e] ?? {},
        [t]: s ? [s] : []
      }
    };
  }
  /** Action labels already used by any other (mode, button) — one use each. */
  _usedActions(e, t) {
    const s = /* @__PURE__ */ new Set();
    for (const [i, r] of Object.entries(this._bindings))
      for (const [o, a] of Object.entries(r))
        i === e && Number(o) === t || (a ?? []).forEach((c) => s.add(c));
    return s;
  }
  _onName(e) {
    this._name = e, this._nameTyped = !0, this._idEdited || (this._id = E(e));
  }
  _onId(e) {
    this._id = e, this._idEdited = !0;
  }
  /** ``savedId``: the preset just saved, so a caller can select it. */
  _close(e = "") {
    this.dispatchEvent(
      new CustomEvent("preset-closed", { detail: { preset_id: e } })
    );
  }
  async _save() {
    const e = this._name.trim(), t = this._id.trim();
    if (!e || !t) {
      alert("Nom et id du preset requis.");
      return;
    }
    if (!this._deviceId) {
      alert("Choisis un appareil (modèle).");
      return;
    }
    if (!this._layoutId) {
      alert("Sélectionne un layout.");
      return;
    }
    this._busy = !0;
    try {
      await ar(this.hass, {
        id: t,
        name: e,
        model: It(this.hass, this._deviceId),
        model_label: Vt(this.hass, this._deviceId),
        device_id: this._deviceId,
        layout_id: this._layoutId,
        taps: this._taps,
        bindings: this._bindings
      }), this._close(t);
    } catch (s) {
      this._busy = !1, alert("Erreur Homex : " + v(s));
    }
  }
  async _delete() {
    if (this.preset && confirm(`Supprimer le preset "${this.preset.name}" ?`)) {
      this._busy = !0;
      try {
        await nr(this.hass, this.preset.id), this._close();
      } catch (e) {
        this._busy = !1, alert("Erreur Homex : " + v(e));
      }
    }
  }
  _renderActions() {
    if (!this._deviceId) return "";
    if (!this._actions.length)
      return n`<p class="hint">Aucune action disponible pour cet appareil.</p>`;
    const e = this._enabledModes();
    if (!e.length) return "";
    const t = e.includes(this._actionTab) ? this._actionTab : e[0], s = (i) => A.TAP_MODES.find((r) => r.mode === i)?.label ?? i;
    return n`
      <div class="section">Actions par bouton</div>
      <p class="hint">
        Pour chaque tap mode, associe chaque bouton aux actions standard du modèle.
      </p>
      <div class="tabs">
        ${e.map(
      (i) => n`<span
            class="atab ${i === t ? "active" : ""}"
            @click=${() => this._actionTab = i}
            >${s(i)}</span
          >`
    )}
      </div>
      ${this._buttonsFor(t).map((i) => {
      const r = this._bindings[t]?.[i]?.[0] ?? "", o = this._usedActions(t, i);
      return n`<div class="bind-row">
          <div class="btn-lbl">Bouton ${i}</div>
          <homex-select
            class="bind-select"
            placeholder="Aucune action"
            .value=${r}
            .options=${this._actions.filter((a) => !o.has(a.label) || a.label === r).map((a) => ({ value: a.label, label: a.label }))}
            @value-changed=${(a) => this._setBind(t, i, a.detail.value)}
          ></homex-select>
        </div>`;
    })}
    `;
  }
  render() {
    const e = !!this.preset;
    return n`
      ${P("Nom du preset", this._name, (t) => this._onName(t), "Modèle X")}
      ${e ? n`<div class="section">Id : ${this.preset.id}</div>` : ""}

      <div class="section">Modèle d'interrupteur</div>
      ${this._models.length ? n`<homex-select
            placeholder="Choisir un modèle…"
            .value=${this._modelKey}
            .options=${this._models.map((t) => ({
      value: t.model,
      label: t.label,
      tertiary: `${t.count} appareil(s)`
    }))}
            @value-changed=${(t) => this._onModel(t.detail.value)}
          ></homex-select>` : n`<p class="hint">
            Aucun interrupteur détecté (appareil exposant des actions).
          </p>`}

      ${this._modelKey ? n`<div class="section">Appareil de référence</div>
            <p class="hint">
              Appareil du modèle duquel les actions sont récupérées. Un même
              modèle peut exposer des actions différentes selon l'appareil.
            </p>
            ${this._devicesForModel().length ? n`<homex-select
                  placeholder="Choisir un appareil…"
                  .value=${this._deviceId}
                  .options=${this._devicesForModel().map((t) => ({
      value: t.device_id,
      label: t.name
    }))}
                  @value-changed=${(t) => this._onRefDevice(t.detail.value)}
                ></homex-select>` : n`<p class="hint">
                  Aucun appareil détecté pour ce modèle.
                </p>`}` : ""}

      <div class="section">Layout</div>
      ${this.layouts.length ? n`<homex-select
            placeholder="Choisir un layout…"
            .value=${this._layoutId}
            .options=${this.layouts.map((t) => ({
      value: t.id,
      label: t.name,
      tertiary: `${t.buttons} bouton(s)`
    }))}
            @value-changed=${(t) => this._onLayout(t.detail.value)}
          ></homex-select>` : n`<p class="hint">Aucun layout. Crée-en un dans « Switch Layouts ».</p>`}

      ${this._selectedLayout() ? n`
            <div class="section">Tap modes par bouton</div>
            <p class="hint">Simple activé par défaut ; ajoute Double / Long au besoin.</p>
            ${Array.from(
      { length: this._selectedLayout().buttons },
      (t, s) => s + 1
    ).map(
      (t) => n`<div class="btn-row">
                <span class="btn-lbl">Bouton ${t}</span>
                <div class="chips">
                  ${A.TAP_MODES.map(
        (s) => n`<span
                      class="tap ${(this._taps[t] ?? []).includes(s.mode) ? "on" : ""}"
                      @click=${() => this._toggleTap(t, s.mode)}
                      >${s.label}</span
                    >`
      )}
                </div>
              </div>`
    )}
            ${this._renderActions()}
          ` : ""}

      <div class="actions">
        ${e ? n`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>` : ""}
        <button @click=${this._close}>Annuler</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._save}>
          ${e ? "Enregistrer" : "Créer le preset"}
        </button>
      </div>
    `;
  }
};
A.TAP_MODES = [
  { mode: "single", label: "Simple" },
  { mode: "double", label: "Double" },
  { mode: "long", label: "Long" }
];
A.styles = [
  C,
  y`
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 0 0 8px;
      }
      .model {
        font-size: 13px;
        margin: 4px 0 8px;
      }
      .btn-row,
      .bind-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 8px 0;
      }
      .bind-row {
        align-items: center;
        border-top: 1px solid var(--divider-color, #ececec);
      }
      .bind-select {
        flex: 1;
        margin: 0;
      }
      .btn-lbl {
        min-width: 84px;
        font-size: 14px;
        font-weight: 500;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .tap {
        padding: 5px 12px;
        border-radius: 14px;
        border: 1px solid var(--divider-color, #ccc);
        cursor: pointer;
        font-size: 13px;
        user-select: none;
      }
      .tap.on {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-color: var(--primary-color);
      }
      .tabs {
        display: flex;
        gap: 4px;
        margin: 8px 0 12px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .atab {
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .atab.active {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
        margin-bottom: -1px;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
      }
    `
];
T([
  h({ attribute: !1 })
], A.prototype, "hass", 2);
T([
  h({ attribute: !1 })
], A.prototype, "preset", 2);
T([
  h({ attribute: !1 })
], A.prototype, "layouts", 2);
T([
  h({ attribute: !1 })
], A.prototype, "prefillDevice", 2);
T([
  l()
], A.prototype, "_name", 2);
T([
  l()
], A.prototype, "_id", 2);
T([
  l()
], A.prototype, "_deviceId", 2);
T([
  l()
], A.prototype, "_modelKey", 2);
T([
  l()
], A.prototype, "_models", 2);
T([
  l()
], A.prototype, "_devices", 2);
T([
  l()
], A.prototype, "_layoutId", 2);
T([
  l()
], A.prototype, "_taps", 2);
T([
  l()
], A.prototype, "_bindings", 2);
T([
  l()
], A.prototype, "_actions", 2);
T([
  l()
], A.prototype, "_actionTab", 2);
T([
  l()
], A.prototype, "_busy", 2);
A = T([
  $("homex-preset-editor")
], A);
var Yo = Object.defineProperty, Xo = Object.getOwnPropertyDescriptor, Y = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Xo(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && Yo(t, s, r), r;
};
let N = class extends b {
  constructor() {
    super(...arguments), this.sw = null, this.presets = [], this.initialRooms = [], this.draft = null, this._name = "", this._id = "", this._deviceId = "", this._presetId = "", this._devices = [], this._rooms = [], this._allRooms = [], this._busy = !1, this._idEdited = !1, this._closeRoomsOutside = (e) => {
      const t = this._roomsDropdown();
      t?.open && !e.composedPath().includes(t) && (t.open = !1);
    }, this._closeRoomsOnEscape = (e) => {
      const t = this._roomsDropdown();
      t?.open && e.key === "Escape" && (t.open = !1);
    };
  }
  willUpdate(e) {
    if (e.has("sw") || e.has("draft")) {
      const t = { ...this.sw ?? {}, ...this.draft ?? {} };
      this._name = t.name ?? "", this._id = t.id ?? "", this._deviceId = t.device_id ?? "", this._presetId = t.preset_id ?? "", this._rooms = [...t.rooms ?? this.initialRooms ?? []], this._idEdited = !!this.sw || !!this.draft?.id, this._busy = !1, this._loadRooms();
    }
  }
  async _loadRooms() {
    try {
      const e = await Je(this.hass);
      this._allRooms = e.filter((t) => (t.modules ?? []).includes("switches")).map((t) => ({ room_id: t.room_id, name: t.name, area_id: t.area_id }));
    } catch {
      this._allRooms = [];
    }
  }
  connectedCallback() {
    super.connectedCallback(), this._loadDevices(), document.addEventListener("click", this._closeRoomsOutside), document.addEventListener("keydown", this._closeRoomsOnEscape);
  }
  disconnectedCallback() {
    document.removeEventListener("click", this._closeRoomsOutside), document.removeEventListener("keydown", this._closeRoomsOnEscape), super.disconnectedCallback();
  }
  // The rooms dropdown overlays the form: close it like a native select.
  _roomsDropdown() {
    return this.shadowRoot?.querySelector("details.multi") ?? null;
  }
  async _loadDevices() {
    try {
      this._devices = await Ds(this.hass);
    } catch {
      this._devices = [];
    }
  }
  /** Presets matching the selected device's model. */
  _modelPresets() {
    return this._deviceId ? Rs(this.hass, this.presets, this._deviceId) : [];
  }
  _preset() {
    if (this._deviceId)
      return Kt(this.hass, this.presets, {
        device_id: this._deviceId,
        preset_id: this._presetId
      });
  }
  _onDevice(e) {
    this._deviceId = e;
    const t = this._modelPresets();
    t.some((s) => s.id === this._presetId) || (this._presetId = t.length === 1 ? t[0].id : "");
  }
  _onName(e) {
    this._name = e, this._idEdited || (this._id = E(e));
  }
  _toggleRoom(e) {
    this._rooms = this._rooms.includes(e) ? this._rooms.filter((t) => t !== e) : [...this._rooms, e];
  }
  _close() {
    this.dispatchEvent(new CustomEvent("switch-closed"));
  }
  _createPreset() {
    this.dispatchEvent(
      new CustomEvent("create-preset", {
        detail: {
          device_id: this._deviceId,
          draft: {
            name: this._name,
            id: this._id,
            device_id: this._deviceId,
            preset_id: this._presetId,
            rooms: this._rooms
          }
        }
      })
    );
  }
  async _save() {
    const e = this._name.trim(), t = this._id.trim();
    if (!e || !t) {
      alert("Nom et id du switch requis.");
      return;
    }
    if (!this._deviceId) {
      alert("Choisis un appareil.");
      return;
    }
    this._busy = !0;
    try {
      await Ls(
        this.hass,
        {
          ...this.sw ?? {},
          id: t,
          name: e,
          device_id: this._deviceId,
          preset_id: this._preset()?.id ?? "",
          rooms: this._rooms
        },
        !this.sw
        // creating: reject a colliding id instead of overwriting
      ), this._close();
    } catch (s) {
      this._busy = !1, alert("Erreur Homex : " + v(s));
    }
  }
  async _delete() {
    if (this.sw && confirm(`Supprimer le switch "${this.sw.name}" ?`)) {
      this._busy = !0;
      try {
        await or(this.hass, this.sw.id), this._close();
      } catch (e) {
        this._busy = !1, alert("Erreur Homex : " + v(e));
      }
    }
  }
  /** Preset section: choose among the model's presets, or offer to create one. */
  _renderPreset(e) {
    const t = this._modelPresets(), s = Vt(this.hass, this._deviceId);
    return t.length ? n`<div class="preset-box ${e ? "ok" : ""}">
      <div class="section">Preset</div>
      <homex-select
        .value=${e?.id ?? ""}
        .options=${t.map((i) => ({ value: i.id, label: i.name }))}
        @value-changed=${(i) => this._presetId = i.detail.value}
      ></homex-select>
      <div class="row">
        <span class="hint">Modèle : ${s}</span>
        <button @click=${this._createPreset}>＋ Nouveau preset</button>
      </div>
    </div>` : n`<div class="preset-box">
        <div class="row">
          <span>Aucun preset pour le modèle <b>${s}</b>.</span>
          <button class="primary" @click=${this._createPreset}>
            ＋ Créer un preset
          </button>
        </div>
      </div>`;
  }
  /** Rooms multi-select: a dropdown of checkable rooms. */
  _renderRooms() {
    if (!this._allRooms.length)
      return n`<p class="hint">Aucune pièce avec le module Switches.</p>`;
    const e = this._allRooms.filter((t) => this._rooms.includes(t.room_id)).map((t) => t.name);
    return n`<details class="multi">
      <summary>
        <span class=${e.length ? "" : "placeholder"}>
          ${e.length ? e.join(", ") : "— Aucune pièce —"}
        </span>
        ▾
      </summary>
      <div class="options">
        ${this._allRooms.map(
      (t) => n`<label>
            ${_e(this._rooms.includes(t.room_id), () => this._toggleRoom(t.room_id))}
            ${t.name}
          </label>`
    )}
      </div>
    </details>`;
  }
  render() {
    const e = !!this.sw, t = this._preset(), s = this._allRooms.filter((a) => this._rooms.includes(a.room_id) && a.area_id).map((a) => a.area_id), { inArea: i, others: r } = Rt(
      this._devices,
      (a) => Js(this.hass, a.device_id),
      s
    ), o = (a) => ({
      value: a.device_id,
      label: a.name,
      secondary: a.model_label
    });
    return n`
      ${P("Nom", this._name, (a) => this._onName(a), "Interrupteur chevet")}
      ${e ? n`<div class="section">Id : ${this.sw.id}</div>` : ""}

      <div class="section">Interrupteur (appareil)</div>
      ${this._devices.length ? n`<homex-select
            placeholder="Choisir un interrupteur…"
            .value=${this._deviceId}
            .options=${s.length ? [] : this._devices.map(o)}
            .groups=${s.length ? [
      ...i.length ? [{ label: `Pièce : ${Qs(this.hass, s)}`, options: i.map(o) }] : [],
      { label: "Autres", options: r.map(o) }
    ] : []}
            @value-changed=${(a) => this._onDevice(a.detail.value)}
          ></homex-select>` : n`<p class="hint">
            Aucun interrupteur détecté (appareil exposant des actions).
          </p>`}

      ${this._deviceId ? this._renderPreset(t) : ""}

      <div class="section">Pièces Homex assignées (0..n)</div>
      ${this._renderRooms()}

      <div class="actions">
        ${e ? n`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>` : ""}
        <button @click=${this._close}>Annuler</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._save}>
          ${e ? "Enregistrer" : "Créer le switch"}
        </button>
      </div>
    `;
  }
};
N.styles = [
  C,
  y`
      details.multi {
        position: relative;
        margin: 6px 0;
      }
      details.multi summary {
        list-style: none;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 14px;
        font-size: 15px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      details.multi summary::-webkit-details-marker {
        display: none;
      }
      details.multi summary span {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      details.multi summary span.placeholder {
        color: var(--secondary-text-color);
      }
      details.multi[open] summary {
        margin-bottom: 0;
        border-color: var(--primary-color);
      }
      .options {
        position: absolute;
        z-index: 2;
        left: 0;
        right: 0;
        margin-top: 4px;
        max-height: 260px;
        overflow-y: auto;
        padding: 4px 0;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      .options label {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        font-size: 14px;
        cursor: pointer;
      }
      .options label:hover {
        background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      }
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 0 0 8px;
      }
      .preset-box {
        margin: 8px 0;
        padding: 12px 14px;
        border-radius: 10px;
        border: 1px solid var(--divider-color, #e0e0e0);
        font-size: 14px;
      }
      .preset-box.ok {
        border-color: var(--primary-color);
      }
      .preset-box .row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .preset-box .row span {
        flex: 1;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
      }
    `
];
Y([
  h({ attribute: !1 })
], N.prototype, "hass", 2);
Y([
  h({ attribute: !1 })
], N.prototype, "sw", 2);
Y([
  h({ attribute: !1 })
], N.prototype, "presets", 2);
Y([
  h({ attribute: !1 })
], N.prototype, "initialRooms", 2);
Y([
  h({ attribute: !1 })
], N.prototype, "draft", 2);
Y([
  l()
], N.prototype, "_name", 2);
Y([
  l()
], N.prototype, "_id", 2);
Y([
  l()
], N.prototype, "_deviceId", 2);
Y([
  l()
], N.prototype, "_presetId", 2);
Y([
  l()
], N.prototype, "_devices", 2);
Y([
  l()
], N.prototype, "_rooms", 2);
Y([
  l()
], N.prototype, "_allRooms", 2);
Y([
  l()
], N.prototype, "_busy", 2);
N = Y([
  $("homex-gswitch-editor")
], N);
var Jo = Object.defineProperty, Qo = Object.getOwnPropertyDescriptor, he = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Qo(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && Jo(t, s, r), r;
};
const ea = ["switches", "presets", "layouts"];
let J = class extends b {
  constructor() {
    super(...arguments), this.base = "", this.subpath = "", this._addRooms = [], this._layouts = [], this._presets = [], this._gswitches = [], this._loaded = !1, this._prefillDevice = "", this._switchFlowFrom = null, this._switchDraft = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  get _route() {
    const [e, t, s] = ye(this.subpath);
    return {
      section: ea.includes(e) ? e : "switches",
      editing: t === "new" || t === "edit" && !!s,
      id: t === "edit" ? s : void 0
    };
  }
  get _section() {
    return this._route.section;
  }
  /** URL of a section list, or of its editor ("new" / "edit", id). */
  _url(e, ...t) {
    return e === "switches" && !t.length ? this.base : B(this.base, e, ...t);
  }
  _openEditor(e, t) {
    I(this._url(e, ...t ? ["edit", t] : ["new"]));
  }
  willUpdate(e) {
    if (!e.has("subpath")) return;
    const { section: t, editing: s, id: i } = this._route;
    if (!s)
      this._switchDraft = null, this._switchFlowFrom = null;
    else if (t === "switches" && !i && !this._switchDraft) {
      const r = new URLSearchParams(location.search).get("room");
      this._addRooms = r ? [r] : [];
    }
  }
  async _load() {
    try {
      [this._layouts, this._presets, this._gswitches] = await Promise.all([
        Hs(this.hass),
        Os(this.hass),
        zs(this.hass)
      ]);
    } catch {
      this._layouts = [], this._presets = [], this._gswitches = [];
    }
    this._loaded = !0;
  }
  _back() {
    this.dispatchEvent(new CustomEvent("close"));
  }
  _onLayoutClosed() {
    this._load(), ce(this._url("layouts"));
  }
  _onPresetClosed(e) {
    this._prefillDevice = "", this._load();
    const t = this._switchFlowFrom;
    if (t) {
      const s = e?.detail?.preset_id;
      s && this._switchDraft && (this._switchDraft = { ...this._switchDraft, preset_id: s }), this._switchFlowFrom = null, ce(t);
    } else
      ce(this._url("presets"));
  }
  _onSwitchClosed() {
    this._switchDraft = null, this._load(), ce(this._url("switches"));
  }
  _onCreatePreset(e) {
    this._switchDraft = e.detail.draft ?? null, this._prefillDevice = e.detail.device_id || "", this._switchFlowFrom = location.pathname, this._openEditor("presets");
  }
  _add() {
    this._prefillDevice = "", this._switchDraft = null, this._addRooms = [], this._openEditor(this._section);
  }
  _preview(e) {
    const t = e.bounds, s = `clip-${e.id}`, i = e.shape === "round", r = i ? S`<ellipse cx=${t.x + t.w / 2} cy=${t.y + t.h / 2} rx=${t.w / 2} ry=${t.h / 2}></ellipse>` : S`<rect x=${t.x} y=${t.y} width=${t.w} height=${t.h} rx="0.4"></rect>`, o = i ? S`<ellipse class="sh" cx=${t.x + t.w / 2} cy=${t.y + t.h / 2} rx=${t.w / 2} ry=${t.h / 2}></ellipse>` : S`<rect class="sh" x=${t.x} y=${t.y} width=${t.w} height=${t.h} rx="0.4"></rect>`;
    return n`<svg class="preview" viewBox="-10 -10 20 20">
      <defs><clipPath id=${s}>${r}</clipPath></defs>
      ${(e.zones || []).map(
      (a) => S`<rect class="zn" x=${a.x} y=${a.y} width=${a.w} height=${a.h}
          clip-path="url(#${s})"></rect>`
    )}
      ${o}
      ${(e.positions || []).map(
      (a) => S`<circle class="zn" cx=${a.x} cy=${a.y} r="1.3"></circle>
          <text x=${a.x} y=${a.y}>${a.n}</text>`
    )}
    </svg>`;
  }
  /** The item an "edit/<id>" sub-page points to, or a placeholder page while
   * loading / when the id is unknown (deep link to a deleted item). */
  _editTarget(e, t, s) {
    const i = this._route.id;
    if (!i) return { item: null };
    const r = e.find((o) => o.id === i);
    return r ? { item: r } : {
      page: n`
        <div class="head">
          <button @click=${t}>← ${s}</button>
          <h2></h2>
        </div>
        <div class="msg">
          ${this._loaded ? `« ${i} » introuvable.` : "Chargement…"}
        </div>
      `
    };
  }
  render() {
    const { section: e, editing: t } = this._route;
    if (t && e === "layouts") {
      const i = () => this._onLayoutClosed(), r = this._editTarget(this._layouts, i, "Layouts");
      return "page" in r ? r.page : n`
        <div class="head">
          <button @click=${i}>← Layouts</button>
          <h2>${r.item ? "Modifier le layout" : "Nouveau layout"}</h2>
        </div>
        <homex-layout-editor
          .hass=${this.hass}
          .layout=${r.item}
          @layout-closed=${this._onLayoutClosed}
        ></homex-layout-editor>
      `;
    }
    if (t && e === "presets") {
      const i = () => this._onPresetClosed(), r = this._editTarget(this._presets, i, "Presets");
      return "page" in r ? r.page : n`
        <div class="head">
          <button @click=${i}>← Presets</button>
          <h2>${r.item ? "Modifier le preset" : "Nouveau device preset"}</h2>
        </div>
        <div class="editor">
          <homex-preset-editor
            .hass=${this.hass}
            .preset=${r.item}
            .layouts=${this._layouts}
            .prefillDevice=${this._prefillDevice}
            @preset-closed=${this._onPresetClosed}
          ></homex-preset-editor>
        </div>
      `;
    }
    if (t) {
      const i = () => this._onSwitchClosed(), r = this._editTarget(this._gswitches, i, "Switches");
      return "page" in r ? r.page : n`
        <div class="head">
          <button @click=${i}>← Switches</button>
          <h2>${r.item ? "Modifier le switch" : "Nouveau switch"}</h2>
        </div>
        <div class="editor">
          <homex-gswitch-editor
            .hass=${this.hass}
            .sw=${r.item}
            .presets=${this._presets}
            .initialRooms=${this._addRooms}
            .draft=${this._switchDraft}
            @switch-closed=${this._onSwitchClosed}
            @create-preset=${this._onCreatePreset}
          ></homex-gswitch-editor>
        </div>
      `;
    }
    const s = this._section === "layouts" ? "＋ Layout" : this._section === "presets" ? "＋ Preset" : "＋ Switch";
    return n`
      <div class="head">
        <button @click=${this._back}>← Homex</button>
        <h2>Switch Manager</h2>
        <button class="primary" @click=${this._add}>${s}</button>
      </div>
      <div class="tabs">
        ${[
      ["switches", "Switches"],
      ["presets", "Presets"],
      ["layouts", "Layouts"]
    ].map(
      ([i, r]) => n`<span
            class="tab ${this._section === i ? "active" : ""}"
            @click=${() => {
        i !== this._section && I(this._url(i), !0);
      }}
            >${r}</span
          >`
    )}
      </div>
      ${this._loaded ? this._section === "layouts" ? this._renderLayouts() : this._section === "presets" ? this._renderPresets() : this._renderSwitches() : n`<div class="msg">Chargement…</div>`}
    `;
  }
  _renderLayouts() {
    return this._layouts.length ? n`<div class="grid">
      ${this._layouts.map(
      (e) => n`<div
          class="card"
          @click=${() => this._openEditor("layouts", e.id)}
        >
          ${this._preview(e)}
          <div class="info">
            <div class="name">${e.name}</div>
            <div class="meta">${e.buttons} bouton(s) · ${e.shape}</div>
          </div>
        </div>`
    )}
    </div>` : n`<div class="msg">Aucun layout. Clique sur « ＋ Layout ».</div>`;
  }
  _renderPresets() {
    return this._presets.length ? n`<div class="grid">
      ${this._presets.map((e) => {
      const t = this._layouts.find((s) => s.id === e.layout_id);
      return n`<div
          class="card"
          @click=${() => {
        this._prefillDevice = "", this._openEditor("presets", e.id);
      }}
        >
          ${t ? this._preview(t) : n`<div class="icon">🎚</div>`}
          <div class="info">
            <div class="name">${e.name}</div>
            <div class="meta">${e.model_label}</div>
          </div>
        </div>`;
    })}
    </div>` : n`<div class="msg">
        Aucun preset. Clique sur « ＋ Preset » pour définir le mapping standard
        d'un modèle d'appareil.
      </div>`;
  }
  _renderSwitches() {
    return this._gswitches.length ? n`<div class="grid">
      ${this._gswitches.map((e) => {
      const t = Kt(this.hass, this._presets, e), s = t ? this._layouts.find((i) => i.id === t.layout_id) : void 0;
      return n`<div
          class="card"
          @click=${() => this._openEditor("switches", e.id)}
        >
          ${s ? this._preview(s) : n`<div class="icon">🎛</div>`}
          <div class="info">
            <div class="name">${e.name}</div>
            <div class="meta">
              ${t ? t.name : "aucun preset"} ·
              ${(e.rooms || []).length} pièce(s)
            </div>
          </div>
        </div>`;
    })}
    </div>` : n`<div class="msg">Aucun switch. Clique sur « ＋ Switch ».</div>`;
  }
};
J.styles = [
  C,
  y`
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .head h2 {
        flex: 1;
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
      button {
        cursor: pointer;
        border: none;
        border-radius: 8px;
        padding: 8px 12px;
        background: var(--secondary-background-color, #f0f0f0);
        color: var(--primary-text-color);
      }
      button.primary {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .tabs {
        display: flex;
        gap: 4px;
        margin: 0 0 16px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .tab {
        padding: 10px 18px;
        font-size: 15px;
        font-weight: 500;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .tab.active {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
        margin-bottom: -1px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 12px;
      }
      .card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        cursor: pointer;
        background: var(--card-background-color, #1c1c1c);
      }
      .card:hover {
        border-color: var(--primary-color);
      }
      .info {
        min-width: 0;
      }
      .name {
        font-size: 15px;
        font-weight: 500;
      }
      .meta {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .msg {
        padding: 24px 4px;
        color: var(--secondary-text-color);
      }
      svg.preview {
        width: 56px;
        height: 56px;
        flex: 0 0 auto;
        background: var(--code-editor-background-color, #111);
        border-radius: 6px;
      }
      .preview .sh {
        fill: none;
        stroke: var(--primary-color);
        stroke-width: 0.2;
      }
      .preview .zn {
        fill: color-mix(in srgb, var(--primary-color) 20%, transparent);
        stroke: color-mix(in srgb, var(--primary-color) 45%, transparent);
        stroke-width: 0.12;
      }
      .preview text {
        fill: #fff;
        font-size: 2px;
        font-weight: 700;
        text-anchor: middle;
        dominant-baseline: central;
      }
      .icon {
        flex: 0 0 auto;
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
      }
      .editor {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        padding: 16px;
      }
    `
];
he([
  h({ attribute: !1 })
], J.prototype, "hass", 2);
he([
  h({ attribute: !1 })
], J.prototype, "base", 2);
he([
  h({ attribute: !1 })
], J.prototype, "subpath", 2);
he([
  l()
], J.prototype, "_addRooms", 2);
he([
  l()
], J.prototype, "_layouts", 2);
he([
  l()
], J.prototype, "_presets", 2);
he([
  l()
], J.prototype, "_gswitches", 2);
he([
  l()
], J.prototype, "_loaded", 2);
he([
  l()
], J.prototype, "_prefillDevice", 2);
he([
  l()
], J.prototype, "_switchDraft", 2);
J = he([
  $("homex-switch-manager")
], J);
var ta = Object.defineProperty, sa = Object.getOwnPropertyDescriptor, X = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? sa(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && ta(t, s, r), r;
};
let w = class extends b {
  constructor() {
    super(...arguments), this.preset = null, this._name = "", this._nameTyped = !1, this._id = "", this._models = [], this._modelKey = "", this._deviceId = "", this._smart = !1, this._up = { ...w.EMPTY }, this._down = { ...w.EMPTY }, this._stopped = { ...w.EMPTY }, this._z2m = null, this._busy = !1, this._idEdited = !1;
  }
  /** Normalize a stored condition into {domain, suffix, state}, migrating the
   * legacy {entity_id, state} shape using the reference device slug. */
  _cond(e) {
    const t = Array.isArray(e) ? e[0] : e;
    if (!t) return { ...w.EMPTY };
    if (t.source === "z2m")
      return {
        ...w.EMPTY,
        source: "z2m",
        field: t.field ?? "",
        state: t.state ?? ""
      };
    if (t.suffix !== void 0 || t.domain !== void 0)
      return {
        ...w.EMPTY,
        domain: t.domain ?? "",
        suffix: t.suffix ?? "",
        state: t.state ?? ""
      };
    const [s, i = ""] = String(t.entity_id ?? "").split("."), r = this._deviceSlug(), o = r && i.startsWith(r + "_") ? i.slice(r.length + 1) : i;
    return {
      ...w.EMPTY,
      domain: s ?? "",
      suffix: o,
      state: t.state ?? ""
    };
  }
  /** Entity-id prefix (slug) for the current reference device. */
  _deviceSlug() {
    const e = this.hass.devices?.[this._deviceId];
    return E(e?.name_by_user || e?.name || "");
  }
  connectedCallback() {
    super.connectedCallback(), this._loadModels();
  }
  updated(e) {
    e.has("_deviceId") && this._loadZ2M();
  }
  /** Fields of the reference device's Zigbee2MQTT state (if it is a Z2M one). */
  async _loadZ2M() {
    const e = this._deviceId;
    if (this._z2m = null, !!e)
      try {
        const t = await dr(this.hass, e);
        e === this._deviceId && (this._z2m = t);
      } catch {
        e === this._deviceId && (this._z2m = { available: !1, topic: null, fields: [] });
      }
  }
  async _loadModels() {
    try {
      this._models = await cr(this.hass);
    } catch {
      this._models = [];
    }
  }
  willUpdate(e) {
    if (e.has("preset")) {
      const t = this.preset;
      this._name = t?.name ?? "", this._nameTyped = !!t, this._id = t?.id ?? "", this._modelKey = t?.model ?? "", this._deviceId = t?.device_id ?? "", this._smart = t?.smart_toggle ?? !1, this._up = this._cond(t?.moving_up), this._down = this._cond(t?.moving_down), this._stopped = this._cond(t?.stopped), this._idEdited = !!t, this._busy = !1;
    }
  }
  _model() {
    return this._models.find((e) => e.model === this._modelKey);
  }
  _onModel(e) {
    this._modelKey = e;
    const t = this._model();
    this._deviceId = t?.devices[0]?.device_id ?? "", this._up = { ...w.EMPTY }, this._down = { ...w.EMPTY }, this._stopped = { ...w.EMPTY }, t && (!this._name.trim() || !this._nameTyped) && (this._name = t.label, this._idEdited || (this._id = E(t.label)));
  }
  _onName(e) {
    this._name = e, this._nameTyped = !0, this._idEdited || (this._id = E(e));
  }
  /** Sensors of the reference device, exposed generically (domain + suffix).
   * The suffix (entity object-id minus the device slug) is what is stored, so
   * the sensor can be reconstructed for any device of the model. */
  _refSensors() {
    const e = this.hass.entities || {}, t = /* @__PURE__ */ new Set(["sensor", "binary_sensor"]), s = this._deviceSlug();
    return Object.values(e).filter(
      (i) => i.device_id === this._deviceId && t.has(String(i.entity_id).split(".")[0])
    ).map((i) => {
      const [r, o = ""] = String(i.entity_id).split("."), a = s && o.startsWith(s + "_") ? o.slice(s.length + 1) : o;
      return { domain: r, suffix: a, key: `${r}|${a}`, entity_id: i.entity_id };
    }).sort((i, r) => i.suffix.localeCompare(r.suffix));
  }
  /** The reference-device entity id for a condition (reconstructed from suffix). */
  _condEntityId(e) {
    if (!e.domain || !e.suffix) return "";
    const t = this._deviceSlug();
    return `${e.domain}.${t ? t + "_" : ""}${e.suffix}`;
  }
  /** Suggested values for a sensor: its enum options + its current state. */
  _sensorValues(e) {
    const t = this.hass.states[e];
    if (!t) return [];
    const s = /* @__PURE__ */ new Set(), i = t.attributes?.options;
    return Array.isArray(i) && i.forEach((r) => s.add(String(r))), t.state && !["unknown", "unavailable"].includes(t.state) && s.add(t.state), [...s];
  }
  /** Current value of a Z2M field on the reference device, as text. */
  _z2mValue(e) {
    const t = this._z2m?.fields.find((s) => s.field === e);
    return t === void 0 || t.value === null ? "" : String(t.value);
  }
  /** One entry (Montée / Descente / Arrêt) = a single value to match, read
   * from a HA sensor or from the device's Zigbee2MQTT state. */
  _condEditor(e, t, s, i, r) {
    const o = `dl-${e}`, a = i.source === "z2m", c = !!this._z2m?.available;
    let d, p;
    if (a) {
      const m = this._z2m?.fields ?? [], u = m.some((g) => g.field === i.field);
      d = m.length ? n`<homex-select
        placeholder="Champ Zigbee2MQTT…"
        .value=${i.field ?? ""}
        .options=${[
        ...i.field && !u ? [{ value: i.field, label: i.field }] : [],
        ...m.map((g) => ({ value: g.field, label: g.field, tertiary: String(g.value) }))
      ]}
        @value-changed=${(g) => r({ ...i, field: g.detail.value })}
      ></homex-select>` : n`<input
            class="field-name"
            placeholder="champ, ex. motor_run_status"
            .value=${i.field ?? ""}
            @change=${(g) => r({
        ...i,
        field: g.target.value.trim()
      })}
          />`;
      const _ = i.field ? this._z2mValue(i.field) : "";
      p = _ ? [_] : [];
    } else {
      const m = i.domain && i.suffix ? `${i.domain}|${i.suffix}` : "";
      d = n`<homex-select
        placeholder="Capteur…"
        .value=${m}
        .options=${this._refSensors().map((u) => ({
        value: u.key,
        label: u.suffix,
        secondary: u.entity_id
      }))}
        @value-changed=${(u) => {
        const [_ = "", g = ""] = String(u.detail.value).split("|");
        r({ ...i, domain: _, suffix: g });
      }}
      ></homex-select>`, p = this._sensorValues(this._condEntityId(i));
    }
    return n`<div class="cond">
      <div class="section">${t}</div>
      <p class="hint">${s}</p>
      ${c || a ? n`<div class="sources">
            <button
              class="src ${a ? "" : "on"}"
              @click=${() => r({ ...w.EMPTY, state: i.state })}
            >
              Capteur HA
            </button>
            <button
              class="src ${a ? "on" : ""}"
              ?disabled=${!c && !a}
              @click=${() => r({
      ...w.EMPTY,
      source: "z2m",
      state: i.state
    })}
            >
              État Zigbee2MQTT
            </button>
          </div>` : ""}
      <div class="cond-row">
        ${d}
        <input
          placeholder="valeur"
          list=${o}
          .value=${i.state}
          @change=${(m) => r({ ...i, state: m.target.value })}
        />
        <datalist id=${o}>
          ${p.map((m) => n`<option value=${m}></option>`)}
        </datalist>
      </div>
      ${a && this._z2m?.available && !this._z2m.fields.length ? n`<p class="hint">
            Aucun état reçu de Zigbee2MQTT pour cet appareil pour l'instant
            (il est publié à chaque changement : bouge le volet puis rouvre ce
            preset pour voir la liste des champs), ou saisis le nom du champ.
          </p>` : ""}
    </div>`;
  }
  _close() {
    this.dispatchEvent(new CustomEvent("shutter-preset-closed"));
  }
  async _save() {
    const e = this._name.trim(), t = this._id.trim();
    if (!e || !t) {
      alert("Nom et id du preset requis.");
      return;
    }
    if (!this._modelKey || !this._deviceId) {
      alert("Choisis un modèle et un device de référence.");
      return;
    }
    const s = (i) => this._smart ? { ...i, state: (i.state || "").trim().toLowerCase() } : { ...w.EMPTY };
    this._busy = !0;
    try {
      await hr(this.hass, {
        id: t,
        name: e,
        model: this._modelKey,
        model_label: this._model()?.label ?? this._modelKey,
        device_id: this._deviceId,
        smart_toggle: this._smart,
        moving_up: s(this._up),
        moving_down: s(this._down),
        stopped: s(this._stopped)
      }), this._close();
    } catch (i) {
      this._busy = !1, alert("Erreur Homex : " + v(i));
    }
  }
  async _delete() {
    if (this.preset && confirm(`Supprimer le preset "${this.preset.name}" ?`)) {
      this._busy = !0;
      try {
        await ur(this.hass, this.preset.id), this._close();
      } catch (e) {
        this._busy = !1, alert("Erreur Homex : " + v(e));
      }
    }
  }
  render() {
    const e = !!this.preset, t = this._model();
    return n`
      ${P("Nom du preset", this._name, (s) => this._onName(s), "Volet salon")}
      ${e ? n`<div class="section">Id : ${this.preset.id}</div>` : ""}

      <div class="section">Modèle de volet</div>
      ${this._models.length ? n`<homex-select
            placeholder="Choisir un modèle…"
            .value=${this._modelKey}
            .options=${this._models.map((s) => ({
      value: s.model,
      label: s.label,
      tertiary: `${s.count} appareil(s)`
    }))}
            @value-changed=${(s) => this._onModel(s.detail.value)}
          ></homex-select>` : n`<p class="hint">Aucun volet (device avec entité cover) détecté.</p>`}

      ${t ? n`
            <div class="section">Device de référence</div>
            <p class="hint">Les capteurs/actions sont tirés de ce device.</p>
            <homex-select
              .value=${this._deviceId}
              .options=${t.devices.map((s) => ({ value: s.device_id, label: s.name }))}
              @value-changed=${(s) => {
      this._deviceId = s.detail.value, this._up = { ...w.EMPTY }, this._down = { ...w.EMPTY }, this._stopped = { ...w.EMPTY };
    }}
            ></homex-select>

            <label class="toggle-row">
              <span>Implémenter la permutation intelligente</span>
              <span class="toggle ${this._smart ? "on" : ""}">
                <input
                  type="checkbox"
                  .checked=${this._smart}
                  @change=${(s) => this._smart = s.target.checked}
                />
                <span class="knob"></span>
              </span>
            </label>
            <p class="hint">
              Si activée, indique comment détecter l'état du volet : un capteur
              Home Assistant, ou un champ de l'état Zigbee2MQTT de l'appareil
              (ex. motor_run_status), avec une valeur précise. « Permuter »
              arrête alors un volet en mouvement, et relance un volet arrêté
              dans le sens inverse de son dernier mouvement.
            </p>
            ${this._smart ? n`
                  ${this._condEditor(
      "up",
      "Montée (volet en mouvement vers le haut)",
      "Le volet est en train de monter quand ce capteur vaut :",
      this._up,
      (s) => this._up = s
    )}
                  ${this._condEditor(
      "down",
      "Descente (volet en mouvement vers le bas)",
      "Le volet est en train de descendre quand ce capteur vaut :",
      this._down,
      (s) => this._down = s
    )}
                  ${this._condEditor(
      "stopped",
      "Arrêt (volet à l'arrêt)",
      "Le volet est à l'arrêt quand ce capteur vaut :",
      this._stopped,
      (s) => this._stopped = s
    )}
                ` : ""}
          ` : ""}

      <div class="actions">
        ${e ? n`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>` : ""}
        <button @click=${this._close}>Annuler</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._save}>
          ${e ? "Enregistrer" : "Créer le preset"}
        </button>
      </div>
    `;
  }
};
w.EMPTY = {
  source: "entity",
  domain: "",
  suffix: "",
  field: "",
  state: ""
};
w.styles = [
  C,
  y`
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 0 0 8px;
      }
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        margin: 14px 0 4px;
        cursor: pointer;
      }
      .toggle {
        position: relative;
        flex: 0 0 auto;
        width: 42px;
        height: 24px;
        border-radius: 12px;
        background: var(--switch-unchecked-track-color, #bdbdbd);
        transition: background 0.2s;
      }
      .toggle.on {
        background: var(--switch-checked-track-color, var(--primary-color));
      }
      .toggle input {
        position: absolute;
        inset: 0;
        margin: 0;
        opacity: 0;
        cursor: pointer;
      }
      .toggle .knob {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        transition: transform 0.2s;
      }
      .toggle.on .knob {
        transform: translateX(18px);
      }
      .cond {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        padding: 10px 12px;
        margin-bottom: 12px;
      }
      .cond-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        margin: 6px 0;
      }
      /* Sensor + value side by side, stacked when too narrow. */
      .cond-row input.field-name {
        flex: 2 1 180px;
      }
      .cond-row input {
        flex: 1 1 100px;
        min-width: 0;
        box-sizing: border-box;
        padding: 12px 14px;
        font-size: 15px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      .sources {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin: 4px 0 6px;
      }
      button.src {
        min-height: 0;
        padding: 6px 12px;
        font-size: 13px;
        border-radius: 16px;
        border: 1px solid var(--divider-color, #ccc);
        background: transparent;
      }
      button.src.on {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .x {
        flex: 0 0 auto;
        cursor: pointer;
        border: none;
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 18px;
      }
      .add {
        font-size: 13px;
        padding: 6px 10px;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
      }
    `
];
X([
  h({ attribute: !1 })
], w.prototype, "hass", 2);
X([
  h({ attribute: !1 })
], w.prototype, "preset", 2);
X([
  l()
], w.prototype, "_name", 2);
X([
  l()
], w.prototype, "_id", 2);
X([
  l()
], w.prototype, "_models", 2);
X([
  l()
], w.prototype, "_modelKey", 2);
X([
  l()
], w.prototype, "_deviceId", 2);
X([
  l()
], w.prototype, "_smart", 2);
X([
  l()
], w.prototype, "_up", 2);
X([
  l()
], w.prototype, "_down", 2);
X([
  l()
], w.prototype, "_stopped", 2);
X([
  l()
], w.prototype, "_z2m", 2);
X([
  l()
], w.prototype, "_busy", 2);
w = X([
  $("homex-shutter-preset-editor")
], w);
var ia = Object.defineProperty, ra = Object.getOwnPropertyDescriptor, st = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ra(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && ia(t, s, r), r;
};
let Pe = class extends b {
  constructor() {
    super(...arguments), this._presets = [], this._loaded = !1, this.base = "", this.subpath = "";
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    try {
      this._presets = await pr(this.hass);
    } catch {
      this._presets = [];
    }
    this._loaded = !0;
  }
  _back() {
    this.dispatchEvent(new CustomEvent("close"));
  }
  _onClosed() {
    this._load(), ce(this.base);
  }
  _openEditor(e) {
    I(B(this.base, ...e ? ["edit", e] : ["new"]));
  }
  render() {
    const [e, t] = ye(this.subpath);
    if (e === "new" || e === "edit" && t) {
      const s = t ? this._presets.find((i) => i.id === t) : null;
      return t && !s ? n`
          <div class="head">
            <button @click=${this._onClosed}>← Presets</button>
            <h2></h2>
          </div>
          <div class="msg">
            ${this._loaded ? `« ${t} » introuvable.` : "Chargement…"}
          </div>
        ` : n`
        <div class="head">
          <button @click=${this._onClosed}>← Presets</button>
          <h2>${s ? "Modifier le preset" : "Nouveau shutter device preset"}</h2>
        </div>
        <div class="editor">
          <homex-shutter-preset-editor
            .hass=${this.hass}
            .preset=${s ?? null}
            @shutter-preset-closed=${this._onClosed}
          ></homex-shutter-preset-editor>
        </div>
      `;
    }
    return n`
      <div class="head">
        <button @click=${this._back}>← Homex</button>
        <h2>Shutter Manager</h2>
        <button
          class="primary"
          @click=${() => this._openEditor()}
        >
          ＋ Preset
        </button>
      </div>
      ${this._loaded ? this._presets.length ? n`<div class="grid">
              ${this._presets.map(
      (s) => n`<div
                  class="card"
                  @click=${() => this._openEditor(s.id)}
                >
                  <div class="icon">🪟</div>
                  <div class="info">
                    <div class="name">${s.name}</div>
                    <div class="meta">
                      ${s.model_label}${s.smart_toggle ? " · permutation intelligente" : ""}
                    </div>
                  </div>
                </div>`
    )}
            </div>` : n`<div class="msg">
              Aucun shutter device preset. Clique sur « ＋ Preset » pour définir
              le pilotage d'un modèle de volet.
            </div>` : n`<div class="msg">Chargement…</div>`}
    `;
  }
};
Pe.styles = [
  C,
  y`
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .head h2 {
        flex: 1;
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
      button {
        cursor: pointer;
        border: none;
        border-radius: 8px;
        padding: 8px 12px;
        background: var(--secondary-background-color, #f0f0f0);
        color: var(--primary-text-color);
      }
      button.primary {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 12px;
      }
      .card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        cursor: pointer;
        background: var(--card-background-color, #1c1c1c);
      }
      .card:hover {
        border-color: var(--primary-color);
      }
      .icon {
        flex: 0 0 auto;
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
      }
      .name {
        font-size: 15px;
        font-weight: 500;
      }
      .meta {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .msg {
        padding: 24px 4px;
        color: var(--secondary-text-color);
      }
      .editor {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        padding: 16px;
      }
    `
];
st([
  h({ attribute: !1 })
], Pe.prototype, "hass", 2);
st([
  l()
], Pe.prototype, "_presets", 2);
st([
  l()
], Pe.prototype, "_loaded", 2);
st([
  h({ attribute: !1 })
], Pe.prototype, "base", 2);
st([
  h({ attribute: !1 })
], Pe.prototype, "subpath", 2);
Pe = st([
  $("homex-shutter-manager")
], Pe);
var oa = Object.defineProperty, aa = Object.getOwnPropertyDescriptor, ue = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? aa(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && oa(t, s, r), r;
};
const jt = "default", ei = 5, ti = 30, ct = 0.5, na = 12, la = (e) => Math.min(ti, Math.max(ei, Math.round(e / ct) * ct));
let Q = class extends b {
  constructor() {
    super(...arguments), this.group = null, this.groups = [], this.presets = [], this.rooms = [], this._name = "", this._id = "", this._rooms = [], this._setpoints = {}, this._busy = !1, this._idEdited = !1;
  }
  willUpdate(e) {
    const t = !this.group && e.has("groups") && !Object.keys(this._setpoints).length;
    if (e.has("group") || t) {
      const s = this.group, i = s?.setpoints ?? this.groups.find((r) => r.id === jt)?.setpoints ?? {};
      this._name = s?.name ?? "", this._id = s?.id ?? "", this._rooms = [...s?.rooms ?? []], this._setpoints = { ...i }, this._idEdited = !!s, this._busy = !1;
    }
  }
  get _isDefault() {
    return this.group?.id === jt;
  }
  _onName(e) {
    this._name = e, this._idEdited || (this._id = E(e));
  }
  _setTemp(e, t) {
    Number.isNaN(t) || (this._setpoints = { ...this._setpoints, [e]: la(t) });
  }
  _toggleRoom(e) {
    this._rooms = this._rooms.includes(e) ? this._rooms.filter((t) => t !== e) : [...this._rooms, e];
  }
  /** The other group a room currently belongs to, if any. */
  _otherGroup(e) {
    return this.groups.find(
      (t) => t.id !== this.group?.id && t.rooms.includes(e)
    );
  }
  /** −/+ stepper (0.5 °C) for one heating mode's setpoint. */
  _stepper(e, t) {
    return n`<div class="stepper">
      <button
        title="−0,5 °C"
        @click=${() => this._setTemp(e, (t ?? 20) - ct)}
      >
        <svg viewBox="0 0 24 24"><path d=${Ms}></path></svg>
      </button>
      <input
        type="number"
        inputmode="decimal"
        min=${ei}
        max=${ti}
        step=${ct}
        .value=${t != null ? String(t) : ""}
        placeholder="—"
        @change=${(s) => this._setTemp(e, parseFloat(s.target.value))}
      />
      <button
        title="+0,5 °C"
        @click=${() => this._setTemp(e, (t ?? 20) + ct)}
      >
        <svg viewBox="0 0 24 24"><path d=${Gt}></path></svg>
      </button>
      <span class="unit">°C</span>
    </div>`;
  }
  _setUnheatedCut(e, t) {
    const { [e]: s, ...i } = this._setpoints;
    this._setpoints = t ? i : { ...i, [e]: na };
  }
  _close() {
    this.dispatchEvent(new CustomEvent("heating-group-closed"));
  }
  async _save() {
    this._busy = !0;
    try {
      await Hr(
        this.hass,
        {
          id: this._id,
          name: this._name.trim(),
          rooms: this._isDefault ? [] : this._rooms,
          setpoints: this._setpoints
        },
        !this.group
      ), this._close();
    } catch (e) {
      alert("Erreur Homex : " + v(e)), this._busy = !1;
    }
  }
  async _delete() {
    if (this.group && confirm(`Supprimer le setpoint « ${this.group.name} » ? Ses pièces repassent dans le setpoint par défaut.`)) {
      this._busy = !0;
      try {
        await zr(this.hass, this.group.id), this._close();
      } catch (e) {
        alert("Erreur Homex : " + v(e)), this._busy = !1;
      }
    }
  }
  render() {
    const e = !!this.group;
    return n`
      ${P("Nom", this._name, (t) => this._onName(t), "Chambres")}
      ${e ? n`<div class="section">Id : ${this.group.id}</div>` : P("Id", this._id, (t) => {
      this._idEdited = !0, this._id = E(t);
    })}

      <div class="section">Consignes de température</div>
      ${this.presets.map((t) => {
      const s = this._setpoints[t.id];
      if (t.unheated) {
        const i = s == null;
        return n`<div class="setpoint">
            <span class="label">${t.name}</span>
            <label class="cut">
              ${_e(i, (r) => this._setUnheatedCut(t.id, r))}
              Chauffage coupé
            </label>
            ${i ? "" : this._stepper(t.id, s)}
          </div>`;
      }
      return n`<div class="setpoint">
          <span class="label">${t.name}</span>
          ${this._stepper(t.id, s)}
        </div>`;
    })}

      <div class="section">Pièces</div>
      ${this._isDefault ? n`<p class="hint">
            S'applique à toutes les pièces qui ne sont dans aucun autre setpoint.
          </p>` : n`<p class="hint">
              Une pièce n'appartient qu'à un setpoint : la cocher la retire de son
              setpoint actuel.
            </p>
            <div class="rooms">
              ${this.rooms.map((t) => {
      const s = this._otherGroup(t.room_id);
      return n`<label>
                  ${_e(
        this._rooms.includes(t.room_id),
        () => this._toggleRoom(t.room_id)
      )}
                  <span>
                    ${t.name}
                    ${s && !this._rooms.includes(t.room_id) ? n`<span class="other">· ${s.name}</span>` : ""}
                  </span>
                </label>`;
    })}
            </div>`}

      <div class="actions">
        <button
          class="primary"
          ?disabled=${this._busy || !this._name.trim() || !this._id}
          @click=${this._save}
        >
          Enregistrer
        </button>
        <button ?disabled=${this._busy} @click=${this._close}>Annuler</button>
        ${e && !this.group.builtin ? n`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>` : ""}
      </div>
    `;
  }
};
Q.styles = [
  C,
  y`
      .hint {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin: 4px 0 8px;
      }
      .setpoint {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 0;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .setpoint .label {
        flex: 1;
        font-size: 14px;
      }
      .stepper {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .stepper button {
        width: 36px;
        height: 36px;
        min-height: 0;
        padding: 0;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .stepper svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
      }
      .stepper input {
        width: 72px;
        box-sizing: border-box;
        padding: 8px;
        font-size: 16px;
        text-align: center;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      .cut {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .unit {
        font-size: 14px;
        color: var(--secondary-text-color);
      }
      .rooms {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 4px 12px;
      }
      .rooms label {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 0;
        font-size: 14px;
        cursor: pointer;
      }
      .other {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
    `
];
ue([
  h({ attribute: !1 })
], Q.prototype, "hass", 2);
ue([
  h({ attribute: !1 })
], Q.prototype, "group", 2);
ue([
  h({ attribute: !1 })
], Q.prototype, "groups", 2);
ue([
  h({ attribute: !1 })
], Q.prototype, "presets", 2);
ue([
  h({ attribute: !1 })
], Q.prototype, "rooms", 2);
ue([
  l()
], Q.prototype, "_name", 2);
ue([
  l()
], Q.prototype, "_id", 2);
ue([
  l()
], Q.prototype, "_rooms", 2);
ue([
  l()
], Q.prototype, "_setpoints", 2);
ue([
  l()
], Q.prototype, "_busy", 2);
Q = ue([
  $("homex-heating-group-editor")
], Q);
var ca = Object.defineProperty, da = Object.getOwnPropertyDescriptor, ne = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? da(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && ca(t, s, r), r;
};
const De = [
  {
    key: "tolerance",
    label: "Tolérance / précision",
    domains: ["number"],
    guess: /accuracy|precision|hysteresis|tolerance/
  },
  { key: "mode", label: "Mode", domains: ["climate", "select"], guess: /.*/ },
  {
    key: "lock",
    label: "Verrouillage",
    domains: ["switch", "lock"],
    guess: /child_lock|securite_enfants|verrou|lock/
  },
  {
    key: "sensor",
    label: "Capteur (interne / externe)",
    domains: ["select", "switch"],
    guess: /sensor_select|temperature_sensor|capteur_de_temperature_externe|external.*sensor/
  }
], pa = [
  ["on", "Activé"],
  ["off", "Désactivé"]
], ha = [
  ["locked", "Verrouillé"],
  ["unlocked", "Déverrouillé"]
], fs = Object.fromEntries(
  De.map((e) => [e.key, e.label])
);
let Z = class extends b {
  constructor() {
    super(...arguments), this.preset = null, this._models = [], this._name = "", this._id = "", this._modelKey = "", this._deviceId = "", this._params = this._emptyParams(), this._busy = !1, this._results = null, this._idEdited = !1, this._nameTyped = !1, this._extInput = "", this._created = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadModels();
  }
  async _loadModels() {
    try {
      this._models = await Is(this.hass);
    } catch {
      this._models = [];
    }
  }
  _emptyParams() {
    return Object.fromEntries(
      De.map((e) => [e.key, { enabled: !1, entity: "", value: "" }])
    );
  }
  willUpdate(e) {
    if (e.has("preset")) {
      const t = this.preset;
      this._name = t?.name ?? "", this._nameTyped = !!t, this._id = t?.id ?? "", this._idEdited = !!t, this._modelKey = t?.model ?? "", this._deviceId = t?.device_id ?? "";
      const s = this._emptyParams();
      for (const i of De) {
        const r = t?.params?.[i.key];
        r && (s[i.key] = {
          enabled: !0,
          entity: `${r.domain}|${r.suffix}`,
          value: String(r.value),
          valueAgressive: r.value_agressive != null ? String(r.value_agressive) : ""
        });
      }
      this._params = s, this._extInput = t?.external_input ? `number|${t.external_input.suffix}` : "", this._results = null, this._busy = !1, this._created = !1;
    }
  }
  _model() {
    return this._models.find((e) => e.model === this._modelKey);
  }
  /** Entity-id prefix (slug) of the reference device. */
  _deviceSlug() {
    const e = this.hass.devices?.[this._deviceId];
    return E(e?.name_by_user || e?.name || "");
  }
  /** Controllable entities of the reference device, as domain + suffix. */
  _refEntities(e) {
    const t = this._deviceSlug();
    return Object.values(this.hass.entities || {}).filter(
      (s) => s.device_id === this._deviceId && e.includes(String(s.entity_id).split(".")[0])
    ).map((s) => {
      const [i, r = ""] = String(s.entity_id).split("."), o = r === t ? "" : t && r.startsWith(t + "_") ? r.slice(t.length + 1) : r;
      return { domain: i, suffix: o, key: `${i}|${o}`, entity_id: s.entity_id };
    }).sort((s, i) => s.key.localeCompare(i.key));
  }
  _entityOf(e) {
    const t = e.split("|")[0];
    return this._refEntities([t]).find((s) => s.key === e);
  }
  /** Allowed values of an entity: [value, label] pairs, or null for a number. */
  _choices(e) {
    if (!e) return [];
    const t = this.hass.states[e.entity_id]?.attributes ?? {};
    switch (e.domain) {
      case "number":
        return null;
      case "select":
        return (t.options ?? []).map((s) => [s, s]);
      case "climate":
        return (t.hvac_modes ?? []).map((s) => [s, s]);
      case "switch":
        return pa;
      case "lock":
        return ha;
      default:
        return [];
    }
  }
  /** The reference entity's current value, as a preset value. */
  _currentValue(e) {
    const t = e ? this.hass.states[e.entity_id] : void 0;
    return !t || t.state === "unknown" || t.state === "unavailable" ? "" : String(t.state);
  }
  _onModel(e) {
    this._modelKey = e;
    const t = this._model();
    this._deviceId = t?.devices[0]?.device_id ?? "", t && (!this._name.trim() || !this._nameTyped) && (this._name = t.label, this._idEdited || (this._id = E(t.label))), this._suggestParams();
  }
  _onDevice(e) {
    this._deviceId = e, this._suggestParams();
  }
  /** Pre-select each setting's likely entity on the reference device (off by
   * default: the user enables the ones to fix). */
  _suggestParams() {
    const e = this._emptyParams();
    for (const t of De) {
      const i = this._refEntities(t.domains).find((r) => t.guess.test(r.suffix));
      i && (e[t.key] = { enabled: !1, entity: i.key, value: this._currentValue(i) });
    }
    this._params = e, this._extInput = "";
  }
  /** Likely external temperature input of the reference device. */
  _guessExtInput() {
    return this._refEntities(["number"]).find(
      (e) => /external_temperature_input|capteur_de_temperature_externe|external.*temp/.test(e.suffix)
    )?.key ?? "";
  }
  _setParam(e, t) {
    this._params = { ...this._params, [e]: { ...this._params[e], ...t } };
  }
  _onParamEntity(e, t) {
    const s = this._entityOf(t);
    this._setParam(e, { entity: t, value: this._currentValue(s) });
  }
  _buildPreset() {
    const e = {};
    for (const t of De) {
      const s = this._params[t.key];
      if (!s.enabled || !s.entity || s.value === "") continue;
      const [i, r] = s.entity.split("|");
      e[t.key] = {
        domain: i,
        suffix: r,
        value: i === "number" ? parseFloat(s.value) : s.value
      }, t.key === "tolerance" && s.valueAgressive && (e[t.key].value_agressive = parseFloat(s.valueAgressive));
    }
    return {
      id: this._id,
      name: this._name.trim(),
      model: this._modelKey,
      device_id: this._deviceId,
      params: e,
      external_input: e.sensor && this._extInput ? { domain: "number", suffix: this._extInput.split("|")[1] } : null
    };
  }
  _close() {
    this.dispatchEvent(new CustomEvent("heating-device-preset-closed"));
  }
  async _save() {
    this._busy = !0;
    try {
      this._results = await Lr(
        this.hass,
        this._buildPreset(),
        !this.preset && !this._created
      ), this._created = !0;
    } catch (e) {
      alert("Erreur Homex : " + v(e));
    } finally {
      this._busy = !1;
    }
  }
  async _apply() {
    if (this.preset) {
      this._busy = !0;
      try {
        this._results = await Dr(this.hass, this.preset.id);
      } catch (e) {
        alert("Erreur Homex : " + v(e));
      } finally {
        this._busy = !1;
      }
    }
  }
  async _delete() {
    if (this.preset && confirm(`Supprimer le device preset « ${this.preset.name} » ?`)) {
      this._busy = !0;
      try {
        await Or(this.hass, this.preset.id), this._close();
      } catch (e) {
        alert("Erreur Homex : " + v(e)), this._busy = !1;
      }
    }
  }
  _renderValue(e, t) {
    const s = this._entityOf(t.entity), i = this._choices(s);
    if (i === null) {
      const r = s && this.hass.states[s.entity_id]?.attributes || {};
      return n`<span class="value"
        ><input
          type="number"
          inputmode="decimal"
          min=${r.min ?? ""}
          max=${r.max ?? ""}
          step=${r.step ?? "any"}
          .value=${t.value}
          @change=${(o) => this._setParam(e, { value: o.target.value })}
      /></span>`;
    }
    return n`<homex-select
      placeholder="Choisir…"
      .value=${t.value}
      .options=${i.map(([r, o]) => ({ value: r, label: o }))}
      @value-changed=${(r) => this._setParam(e, { value: r.detail.value })}
    ></homex-select>`;
  }
  _renderParam(e) {
    const t = this._params[e.key], s = this._refEntities(e.domains), i = this._entityOf(t.entity), r = this._currentValue(i);
    return n`<div class="param">
      <label class="param-head">
        ${_e(t.enabled, (o) => this._setParam(e.key, { enabled: o }))}
        ${e.label}
      </label>
      ${t.enabled ? n`<div class="param-body">
            <label>
              Entité (${e.domains.join(" / ")})
              <homex-select
                placeholder="Choisir…"
                .value=${t.entity}
                .options=${s.map((o) => ({
      value: o.key,
      label: o.suffix || "(entité principale)",
      secondary: o.entity_id,
      tertiary: o.domain
    }))}
                @value-changed=${(o) => this._onParamEntity(e.key, o.detail.value)}
              ></homex-select>
            </label>
            ${e.key === "tolerance" ? this._renderToleranceValues(t, i, r) : n`<label>
                  Valeur à fixer
                  ${this._renderValue(e.key, t)}
                  ${i ? n`<span class="current">Actuel : ${r || "—"}</span>` : ""}
                </label>`}
            ${e.key === "sensor" ? this._renderExtInput() : ""}
          </div>` : ""}
    </div>`;
  }
  /** Tolerance: one value per tolerance mode (select.homex_climate_tolerance_mode). */
  _renderToleranceValues(e, t, s) {
    const i = t && this.hass.states[t.entity_id]?.attributes || {}, r = (o, a) => n`<span class="value"
      ><input
        type="number"
        inputmode="decimal"
        min=${i.min ?? ""}
        max=${i.max ?? ""}
        step=${i.step ?? "any"}
        .value=${o}
        @change=${(c) => a(c.target.value)}
    /></span>`;
    return n`<div class="tolerances">
      <label>
        Mode normal
        ${r(e.value, (o) => this._setParam("tolerance", { value: o }))}
      </label>
      <label>
        Mode agressive
        ${r(
      e.valueAgressive ?? "",
      (o) => this._setParam("tolerance", { valueAgressive: o })
    )}
      </label>
      ${t ? n`<span class="current">
            Actuel : ${s || "—"} · appliqué selon select.homex_climate_tolerance_mode
          </span>` : ""}
    </div>`;
  }
  /** Where the valve reads an external temperature (sensor setting only). */
  _renderExtInput() {
    const e = this._refEntities(["number"]);
    return n`<label class="wide">
      <span>
        ${_e(
      !!this._extInput,
      (t) => this._extInput = t && (this._guessExtInput() || e[0]?.key) || ""
    )}
        Capteur externe : la valeur choisie fait lire à la vanne une température externe
      </span>
      ${this._extInput ? n`<homex-select
              .value=${this._extInput}
              .options=${e.map((t) => ({
      value: t.key,
      label: t.suffix,
      secondary: t.entity_id
    }))}
              @value-changed=${(t) => this._extInput = t.detail.value}
            ></homex-select>
            <span class="current">
              Entrée de température externe : le capteur choisi pour chaque radiateur
              (dans la pièce) y est recopié à chaque mise à jour.
            </span>` : ""}
    </label>`;
  }
  _renderResults() {
    const e = this._results;
    return e.length ? n`<div class="results">
      <strong>Appliqué sur ${e.length} appareil(s)</strong>
      ${e.map(
      (t) => n`<div class="dev">
          ${t.failed.length ? n`<span class="ko">✗</span>` : n`<span class="ok">✓</span>`}
          ${t.name}
          ${t.applied.length ? n` · ${t.applied.map((s) => fs[s]).join(", ")}` : ""}
          ${t.failed.map(
        (s) => n`<div class="ko">${fs[s.param]} : ${s.error}</div>`
      )}
        </div>`
    )}
    </div>` : n`<div class="results">Aucun appareil de ce modèle trouvé.</div>`;
  }
  render() {
    const e = !!this.preset, t = this._model(), s = De.some((i) => {
      const r = this._params[i.key];
      return r.enabled && r.entity && r.value !== "";
    });
    return n`
      ${P("Nom", this._name, (i) => {
      this._name = i, this._nameTyped = !0, this._idEdited || (this._id = E(i));
    }, "Vanne thermostatique")}
      ${e || this._created ? n`<div class="section">Id : ${this._id}</div>` : P("Id", this._id, (i) => {
      this._idEdited = !0, this._id = E(i);
    })}

      <div class="section">Modèle de thermostat</div>
      <homex-select
        placeholder="Choisir un modèle…"
        .value=${this._modelKey}
        .options=${this._models.map((i) => ({
      value: i.model,
      label: i.label,
      tertiary: `${i.count} appareil(s)`
    }))}
        @value-changed=${(i) => this._onModel(i.detail.value)}
      ></homex-select>

      ${t ? n`
            <div class="section">Appareil de référence</div>
            <p class="hint">
              Ses entités servent à choisir les réglages ; ils s'appliquent ensuite
              aux ${t.count} appareil(s) du modèle.
            </p>
            <homex-select
              .value=${this._deviceId}
              .options=${t.devices.map((i) => ({ value: i.device_id, label: i.name }))}
              @value-changed=${(i) => this._onDevice(i.detail.value)}
            ></homex-select>

            <div class="section">Réglages à fixer</div>
            ${De.map((i) => this._renderParam(i))}
          ` : this._modelKey ? n`<p class="hint">Modèle introuvable (plus aucun appareil ?).</p>` : ""}

      ${this._results ? this._renderResults() : ""}

      <div class="actions">
        <button
          class="primary"
          ?disabled=${this._busy || !this._name.trim() || !this._id || !t || !s}
          @click=${this._save}
        >
          ${this._busy ? "Application…" : "Enregistrer et appliquer"}
        </button>
        ${e ? n`<button ?disabled=${this._busy} @click=${this._apply}>
              Appliquer maintenant
            </button>` : ""}
        <button ?disabled=${this._busy} @click=${this._close}>
          ${this._results ? "Terminé" : "Annuler"}
        </button>
        ${e ? n`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>` : ""}
      </div>
    `;
  }
};
Z.styles = [
  C,
  y`
      .value input {
        width: 100%;
        box-sizing: border-box;
        padding: 12px 14px;
        font-size: 15px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      .hint {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin: 4px 0 8px;
      }
      .param {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        padding: 10px 12px;
        margin: 10px 0;
      }
      .param-head {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        cursor: pointer;
      }
      .param-body {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 10px;
        margin-top: 10px;
      }
      /* Grid / flex children may shrink below their content (long entity ids). */
      .param-body > *,
      .tolerances > * {
        min-width: 0;
      }
      @media (max-width: 600px) {
        .param-body {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .param-body label {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .tolerances {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        align-content: start;
      }
      .tolerances label {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .tolerances .current {
        grid-column: 1 / -1;
      }
      .param-body label.wide {
        grid-column: 1 / -1;
      }
      .param-body label.wide > span:first-child {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--primary-text-color);
        cursor: pointer;
      }
      .current {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .results {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        padding: 10px 12px;
        margin-top: 12px;
        font-size: 14px;
      }
      .results .dev {
        padding: 4px 0;
      }
      .ok {
        color: var(--success-color, #43a047);
      }
      .ko {
        color: var(--error-color, #db4437);
      }
    `
];
ne([
  h({ attribute: !1 })
], Z.prototype, "hass", 2);
ne([
  h({ attribute: !1 })
], Z.prototype, "preset", 2);
ne([
  l()
], Z.prototype, "_models", 2);
ne([
  l()
], Z.prototype, "_name", 2);
ne([
  l()
], Z.prototype, "_id", 2);
ne([
  l()
], Z.prototype, "_modelKey", 2);
ne([
  l()
], Z.prototype, "_deviceId", 2);
ne([
  l()
], Z.prototype, "_params", 2);
ne([
  l()
], Z.prototype, "_busy", 2);
ne([
  l()
], Z.prototype, "_results", 2);
ne([
  l()
], Z.prototype, "_extInput", 2);
Z = ne([
  $("homex-heating-device-preset-editor")
], Z);
var ua = Object.defineProperty, ma = Object.getOwnPropertyDescriptor, me = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ma(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && ua(t, s, r), r;
};
const si = "default";
let ee = class extends b {
  constructor() {
    super(...arguments), this.zone = null, this.zones = [], this.modes = [], this.rooms = [], this._name = "", this._id = "", this._rooms = [], this._triggers = {}, this._busy = !1, this._idEdited = !1;
  }
  willUpdate(e) {
    if (e.has("zone")) {
      const t = this.zone;
      this._name = t?.name ?? "", this._id = t?.id ?? "", this._rooms = [...t?.rooms ?? []], this._triggers = { ...t?.triggers ?? {} }, this._idEdited = !!t, this._busy = !1;
    }
  }
  get _isDefault() {
    return this.zone?.id === si;
  }
  _toggleRoom(e) {
    this._rooms = this._rooms.includes(e) ? this._rooms.filter((t) => t !== e) : [...this._rooms, e];
  }
  _otherZone(e) {
    return this.zones.find((t) => t.id !== this.zone?.id && t.rooms.includes(e));
  }
  _close() {
    this.dispatchEvent(new CustomEvent("heating-zone-closed"));
  }
  async _save() {
    this._busy = !0;
    try {
      await Tr(
        this.hass,
        {
          id: this._id,
          name: this._name.trim(),
          rooms: this._isDefault ? [] : this._rooms,
          triggers: this._triggers
        },
        !this.zone
      ), this._close();
    } catch (e) {
      alert("Erreur Homex : " + v(e)), this._busy = !1;
    }
  }
  async _delete() {
    if (this.zone && confirm(`Supprimer la zone « ${this.zone.name} » ? Ses pièces repassent dans la zone par défaut.`)) {
      this._busy = !0;
      try {
        await Ir(this.hass, this.zone.id), this._close();
      } catch (e) {
        alert("Erreur Homex : " + v(e)), this._busy = !1;
      }
    }
  }
  render() {
    const e = !!this.zone;
    return n`
      ${P("Nom", this._name, (t) => {
      this._name = t, this._idEdited || (this._id = E(t));
    }, "Studio")}
      ${e ? n`<div class="section">Id : ${this.zone.id}</div>` : P("Id", this._id, (t) => {
      this._idEdited = !0, this._id = E(t);
    })}
      ${this._id ? n`<p class="hint">
            Entité de commande : <code>select.homex_heating_${this._id}</code>
          </p>` : ""}

      <div class="section">Pièces</div>
      ${this._isDefault ? n`<p class="hint">
            Contient toutes les pièces qui ne sont dans aucune autre zone.
          </p>` : n`<p class="hint">
              Une pièce n'appartient qu'à une zone : la cocher la retire de sa zone
              actuelle.
            </p>
            <div class="rooms">
              ${this.rooms.map((t) => {
      const s = this._otherZone(t.room_id);
      return n`<label>
                  ${_e(
        this._rooms.includes(t.room_id),
        () => this._toggleRoom(t.room_id)
      )}
                  <span>
                    ${t.name}
                    ${s && !this._rooms.includes(t.room_id) ? n`<span class="other">· ${s.name}</span>` : ""}
                  </span>
                </label>`;
    })}
            </div>`}

      <div class="section">Déclencheurs par mode</div>
      <p class="hint">
        Chaque déclencheur passe la zone dans le mode correspondant. Les boutons
        d'interrupteurs se configurent aussi dans le Switch Manager (module 🔥 Climate).
      </p>
      ${this.modes.map((t) => {
      const s = this._triggers[t.id] ?? [];
      return n`<details class="mode" ?open=${s.length > 0}>
          <summary>
            ${t.name}
            <span class="count">· ${s.length} déclencheur(s)</span>
          </summary>
          <homex-trigger-selector
            .hass=${this.hass}
            .value=${s}
            @value-changed=${(i) => this._triggers = { ...this._triggers, [t.id]: i.detail.value }}
          ></homex-trigger-selector>
        </details>`;
    })}

      <div class="actions">
        <button
          class="primary"
          ?disabled=${this._busy || !this._name.trim() || !this._id}
          @click=${this._save}
        >
          Enregistrer
        </button>
        <button ?disabled=${this._busy} @click=${this._close}>Annuler</button>
        ${e && !this.zone.builtin ? n`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>` : ""}
      </div>
    `;
  }
};
ee.styles = [
  C,
  y`
      .hint {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin: 4px 0 8px;
      }
      .rooms {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 4px 12px;
      }
      .rooms label {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 0;
        font-size: 14px;
        cursor: pointer;
      }
      .other {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      details.mode {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        padding: 8px 12px;
        margin: 8px 0;
      }
      details.mode summary {
        cursor: pointer;
        font-weight: 500;
        padding: 4px 0;
      }
      .count {
        font-weight: 400;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
    `
];
me([
  h({ attribute: !1 })
], ee.prototype, "hass", 2);
me([
  h({ attribute: !1 })
], ee.prototype, "zone", 2);
me([
  h({ attribute: !1 })
], ee.prototype, "zones", 2);
me([
  h({ attribute: !1 })
], ee.prototype, "modes", 2);
me([
  h({ attribute: !1 })
], ee.prototype, "rooms", 2);
me([
  l()
], ee.prototype, "_name", 2);
me([
  l()
], ee.prototype, "_id", 2);
me([
  l()
], ee.prototype, "_rooms", 2);
me([
  l()
], ee.prototype, "_triggers", 2);
me([
  l()
], ee.prototype, "_busy", 2);
ee = me([
  $("homex-heating-zone-editor")
], ee);
var _a = Object.defineProperty, ga = Object.getOwnPropertyDescriptor, R = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ga(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && _a(t, s, r), r;
};
const qe = "global", va = ["switch", "input_boolean"], fa = ["input_number", "number"], ba = [
  ["setpoint_sensor", "Température de consigne"],
  ["tank_sensor", "Température ballon"],
  ["flow_sensor", "Température départ"],
  ["return_sensor", "Température retour"]
], at = {
  setpoint_tank: {
    label: "Delta consigne / ballon",
    gap: ["setpoint_sensor", "tank_sensor"],
    a: "consigne",
    b: "ballon",
    init: ["6", "3"]
  },
  flow_return: {
    label: "Delta départ / retour",
    gap: ["flow_sensor", "return_sensor"],
    a: "départ",
    b: "retour",
    init: ["10", "5"]
  }
}, xa = { delta: "setpoint_tank" }, ya = [
  ["boiler", "Boiler"],
  ["buffer_tank", "Buffer Tank"]
];
let z = class extends b {
  constructor() {
    super(...arguments), this.system = null, this.zones = [], this._sysName = "", this._id = "", this._type = "boiler", this._contact = "", this._zones = [qe], this._aggressive = !1, this._tank = {
      setpoint_sensor: "",
      tank_sensor: "",
      flow_sensor: "",
      return_sensor: ""
    }, this._circulator = "", this._force = "", this._minRuntime = "5", this._rules = [], this._busy = !1, this._idEdited = !1;
  }
  willUpdate(e) {
    if (e.has("system")) {
      const t = this.system;
      this._sysName = t?.name ?? "", this._id = t?.id ?? "", this._type = t?.type ?? "boiler", this._contact = t?.contact ?? "", this._zones = [...t?.zones?.length ? t.zones : [qe]], this._aggressive = t?.aggressive ?? !1, this._tank = {
        setpoint_sensor: t?.setpoint_sensor ?? "",
        tank_sensor: t?.tank_sensor ?? "",
        flow_sensor: t?.flow_sensor ?? "",
        return_sensor: t?.return_sensor ?? ""
      }, this._circulator = t?.circulator ?? "", this._force = t?.force ?? "", this._minRuntime = String(t?.min_runtime ?? 5), this._rules = (t?.rules ?? []).map((s) => ({
        type: xa[s.type] ?? s.type,
        delta: String(s.delta),
        tolerance: String(s.tolerance)
      })), this._idEdited = !!t, this._busy = !1;
    }
  }
  get _contacts() {
    const e = (t) => this.hass.states[t]?.attributes?.friendly_name || t;
    return Object.keys(this.hass.states).filter((t) => va.includes(t.split(".")[0])).sort((t, s) => e(t).localeCompare(e(s)));
  }
  _name(e) {
    return this.hass.states[e]?.attributes?.friendly_name || e;
  }
  /** Entities as select groups by Home Assistant area (named areas first). */
  _grouped(e) {
    const t = /* @__PURE__ */ new Map();
    for (const i of e) {
      const r = this.hass.entities?.[i], o = r?.area_id || r?.device_id && this.hass.devices?.[r.device_id]?.area_id || "";
      t.set(o, [...t.get(o) ?? [], i]);
    }
    const s = (i) => i ? this.hass.areas?.[i]?.name ?? i : "Sans pièce";
    return [...t.entries()].sort(([i], [r]) => i ? r ? s(i).localeCompare(s(r)) : -1 : 1).map(([i, r]) => ({
      label: s(i),
      options: r.sort((o, a) => this._name(o).localeCompare(this._name(a))).map((o) => {
        const a = this.hass.states[o], c = a?.attributes?.unit_of_measurement ?? "";
        return {
          value: o,
          label: this._name(o),
          secondary: o,
          tertiary: a ? `${a.state}${c ? " " + c : ""}` : void 0
        };
      })
    }));
  }
  /** Temperature sensors (and, for the setpoint, input/number entities). */
  _tempSensors(e) {
    return Object.keys(this.hass.states).filter((t) => {
      const s = t.split(".")[0], i = this.hass.states[t].attributes ?? {};
      return e && fa.includes(s) ? !0 : s === "sensor" && (i.device_class === "temperature" || ["°C", "°F"].includes(i.unit_of_measurement));
    });
  }
  _value(e) {
    const t = parseFloat(this.hass.states[e]?.state ?? "");
    return Number.isNaN(t) ? null : t;
  }
  _ruleError(e) {
    const t = parseFloat(e.delta), s = parseFloat(e.tolerance);
    return Number.isNaN(t) || Number.isNaN(s) ? "Delta et tolérance requis." : t <= 0 || s < 0 || s >= t ? "Il faut delta > tolérance ≥ 0." : "";
  }
  /** Sensors the configured rules need. */
  get _required() {
    return new Set(this._rules.flatMap((e) => at[e.type].gap));
  }
  get _tankValid() {
    return [...this._required].every((e) => !!this._tank[e]) && !!this._circulator && this._force !== this._circulator && !Number.isNaN(parseFloat(this._minRuntime)) && this._rules.every((e) => !this._ruleError(e));
  }
  _toggleZone(e) {
    const t = this._zones.filter((i) => i !== qe), s = t.includes(e) ? t.filter((i) => i !== e) : [...t, e];
    this._zones = s.length ? s : [qe];
  }
  _close() {
    this.dispatchEvent(new CustomEvent("heating-system-closed"));
  }
  async _save() {
    this._busy = !0;
    const e = { id: this._id, name: this._sysName.trim(), type: this._type }, t = this._type === "buffer_tank" ? {
      ...e,
      ...this._tank,
      circulator: this._circulator,
      force: this._force,
      min_runtime: parseFloat(this._minRuntime) || 0,
      zones: this._zones,
      aggressive: this._aggressive,
      rules: this._rules.map(
        (s) => ({
          type: s.type,
          delta: parseFloat(s.delta),
          tolerance: parseFloat(s.tolerance)
        })
      )
    } : {
      ...e,
      contact: this._type === "boiler" ? this._contact : "",
      zones: this._zones,
      aggressive: this._type === "boiler" && this._aggressive
    };
    try {
      await Rr(this.hass, t, !this.system), this._close();
    } catch (s) {
      alert("Erreur Homex : " + v(s)), this._busy = !1;
    }
  }
  async _delete() {
    if (this.system && confirm(`Supprimer le système « ${this.system.name} » ?`)) {
      this._busy = !0;
      try {
        await jr(this.hass, this.system.id), this._close();
      } catch (e) {
        alert("Erreur Homex : " + v(e)), this._busy = !1;
      }
    }
  }
  _renderBoiler() {
    const e = (t) => this._name(t);
    return n`
      <div class="section">Contact sec</div>
      <p class="hint">
        L'interrupteur commandé de la chaudière : activé dès que sa portée a besoin
        d'être chauffée, désactivé sinon.
      </p>
      <homex-select
        placeholder="Choisir un interrupteur…"
        .value=${this._contact}
        .options=${this._contacts.map((t) => ({
      value: t,
      label: e(t),
      secondary: t
    }))}
        @value-changed=${(t) => this._contact = t.detail.value}
      ></homex-select>

      ${this._renderScope("contact sec")}
    `;
  }
  /** Scope (global or zones) and agressive mode, shared by both types. */
  _renderScope(e) {
    const t = this._zones.includes(qe);
    return n`
      <div class="section">Portée</div>
      <p class="hint">Les zones dont la demande de chauffe compte pour ce système.</p>
      <div class="checks">
        <label>
          ${_e(t, () => this._zones = [qe])}
          Système global (toutes les zones)
        </label>
        ${this.zones.map(
      (s) => n`<label>
            ${_e(
        !t && this._zones.includes(s.id),
        () => this._toggleZone(s.id)
      )}
            Zone ${s.name}
          </label>`
    )}
      </div>

      <div class="section">Mode agressif</div>
      <div class="checks">
        <label>
          ${_e(this._aggressive, (s) => this._aggressive = s)}
          Mode agressif : tolérance « agressive » sur la portée tant que le ${e} est
          actif
        </label>
      </div>
    `;
  }
  _num(e, t, s, i = "0.5") {
    return n`<label class="num">
      ${e}
      <input
        type="number"
        inputmode="decimal"
        step=${i}
        min="0"
        .value=${t}
        @input=${(r) => s(r.target.value)}
      />
    </label>`;
  }
  _setRule(e, t) {
    this._rules = this._rules.map((s, i) => i === e ? { ...s, ...t } : s);
  }
  _addRule(e) {
    if (this._rules.some((i) => i.type === e)) return;
    const [t, s] = at[e].init;
    this._rules = [...this._rules, { type: e, delta: t, tolerance: s }];
  }
  _renderRule(e, t) {
    const s = at[e.type], i = this._ruleError(e), r = (u) => `${Math.round(u * 10) / 10} °C`, [o, a] = s.gap, c = this._value(this._tank[o]), d = this._value(this._tank[a]);
    let p = i;
    if (!i && e.type === "setpoint_tank") {
      const u = parseFloat(e.delta), _ = parseFloat(e.tolerance);
      p = c == null ? `Circule quand ballon ≤ consigne − ${e.delta} °C ; s'arrête quand ballon > consigne − ${e.tolerance} °C.` : `Consigne ${r(c)} : circule quand ballon ≤ ${r(c - u)} ; s'arrête quand ballon > ${r(c - _)}.`;
    } else i || (p = `Circule quand départ − retour ≥ ${e.delta} °C ; s'arrête quand départ − retour < ${e.tolerance} °C.`);
    const m = !i && c != null && d != null ? ` Actuellement ${s.a} − ${s.b} = ${r(c - d)}.` : "";
    return n`<div class="rule">
      <div class="title">Règle ${t + 1} · ${s.label}</div>
      ${this._num("Delta (°C)", e.delta, (u) => this._setRule(t, { delta: u }))}
      ${this._num("Tolérance (°C)", e.tolerance, (u) => this._setRule(t, { tolerance: u }))}
      <button
        title="Supprimer la règle"
        @click=${() => this._rules = this._rules.filter((u, _) => _ !== t)}
      >
        ✕
      </button>
      <div class="explain ${i ? "err" : ""}">${p}${m}</div>
    </div>`;
  }
  _renderTank() {
    const e = this._grouped(this._tempSensors(!1)), t = this._grouped(this._tempSensors(!0)), s = this._grouped(this._contacts);
    return n`
      <div class="section">Capteurs</div>
      <div class="tank-grid">
        ${ba.map(
      ([i, r]) => n`<homex-select
            label=${this._required.has(i) ? `${r} (requis)` : r}
            placeholder="Choisir un capteur…"
            .value=${this._tank[i]}
            .groups=${i === "setpoint_sensor" ? t : e}
            @value-changed=${(o) => this._tank = { ...this._tank, [i]: o.detail.value }}
          ></homex-select>`
    )}
      </div>

      <div class="section">Circulateur</div>
      <div class="tank-grid">
        <homex-select
          label="Interrupteur commandé"
          placeholder="Choisir un interrupteur…"
          .value=${this._circulator}
          .groups=${s}
          @value-changed=${(i) => this._circulator = i.detail.value}
        ></homex-select>
        ${this._num(
      "Temps d'exécution minimal (min)",
      this._minRuntime,
      (i) => this._minRuntime = i,
      "1"
    )}
        <homex-select
          label="Forçage manuel (optionnel)"
          placeholder="Aucun forçage"
          .value=${this._force}
          .groups=${this._grouped(this._contacts.filter((i) => i !== this._circulator))}
          @value-changed=${(i) => this._force = i.detail.value}
        ></homex-select>
      </div>
      <p class="hint">
        Forçage manuel : tant que cet interrupteur est allumé, le circulateur tourne
        quelles que soient les règles et la demande des radiateurs (si le chauffage
        est activé globalement).
      </p>

      <div class="section">Règles de circulation</div>
      <p class="hint">
        Le circulateur tourne tant qu'au moins une règle le demande et qu'au moins un
        radiateur a besoin de chauffer (chauffage activé globalement). Une fois lancé,
        il tourne toujours au moins le temps d'exécution minimal, même si la
        température remonte vite ou si plus rien ne demande de chauffe.
      </p>
      ${this._rules.map((i, r) => this._renderRule(i, r))}
      <div class="rule-add">
        ${Object.keys(at).filter((i) => !this._rules.some((r) => r.type === i)).map(
      (i) => n`<button @click=${() => this._addRule(i)}>＋ Règle ${at[i].label.toLowerCase()}</button>`
    )}
      </div>
    `;
  }
  render() {
    const e = !!this.system;
    return n`
      ${P("Nom", this._sysName, (t) => {
      this._sysName = t, this._idEdited || (this._id = E(t));
    }, "Chaudière")}
      ${e ? n`<div class="section">Id : ${this.system.id}</div>` : P("Id", this._id, (t) => {
      this._idEdited = !0, this._id = E(t);
    })}

      <div class="section">Type</div>
      <div class="btn-group">
        ${ya.map(
      ([t, s]) => n`<button
            class=${this._type === t ? "active" : ""}
            @click=${() => this._type = t}
          >
            ${s}
          </button>`
    )}
      </div>

      ${this._type === "boiler" ? this._renderBoiler() : this._type === "buffer_tank" ? n`${this._renderTank()}${this._renderScope("circulateur")}` : n`<p class="hint">
              Les pompes à chaleur ne sont plus proposées : choisis Boiler ou Buffer Tank.
            </p>`}

      <div class="actions">
        <button
          class="primary"
          ?disabled=${this._busy || !this._sysName.trim() || !this._id || this._type === "buffer_tank" && !this._tankValid}
          @click=${this._save}
        >
          Enregistrer
        </button>
        <button ?disabled=${this._busy} @click=${this._close}>Annuler</button>
        ${e ? n`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>` : ""}
      </div>
    `;
  }
};
z.styles = [
  C,
  y`
      .hint {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin: 4px 0 8px;
      }
      .btn-group {
        display: inline-flex;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        overflow: hidden;
      }
      .btn-group button {
        min-height: 0;
        padding: 8px 16px;
        border-radius: 0;
        background: transparent;
      }
      .btn-group button + button {
        border-left: 1px solid var(--divider-color, #ccc);
      }
      .btn-group button.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .tank-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      @media (max-width: 600px) {
        .tank-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .num {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .num input {
        box-sizing: border-box;
        width: 100%;
        min-height: 44px;
        padding: 8px 12px;
        font: inherit;
        font-size: 15px;
        color: var(--primary-text-color);
        background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
        border: 1px solid transparent;
        border-radius: 12px;
      }
      .num input:focus {
        outline: none;
        border-color: var(--primary-color);
      }
      .rule {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
        align-items: end;
        gap: 12px;
        padding: 12px;
        margin-bottom: 8px;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
        border-radius: 12px;
      }
      .rule .title {
        grid-column: 1 / -1;
        font-weight: 500;
      }
      .rule .explain {
        grid-column: 1 / -1;
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .rule .explain.err {
        color: var(--error-color, #db4437);
      }
      .rule-add {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .checks label {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 0;
        font-size: 14px;
        cursor: pointer;
      }
    `
];
R([
  h({ attribute: !1 })
], z.prototype, "hass", 2);
R([
  h({ attribute: !1 })
], z.prototype, "system", 2);
R([
  h({ attribute: !1 })
], z.prototype, "zones", 2);
R([
  l()
], z.prototype, "_sysName", 2);
R([
  l()
], z.prototype, "_id", 2);
R([
  l()
], z.prototype, "_type", 2);
R([
  l()
], z.prototype, "_contact", 2);
R([
  l()
], z.prototype, "_zones", 2);
R([
  l()
], z.prototype, "_aggressive", 2);
R([
  l()
], z.prototype, "_tank", 2);
R([
  l()
], z.prototype, "_circulator", 2);
R([
  l()
], z.prototype, "_force", 2);
R([
  l()
], z.prototype, "_minRuntime", 2);
R([
  l()
], z.prototype, "_rules", 2);
R([
  l()
], z.prototype, "_busy", 2);
z = R([
  $("homex-heating-system-editor")
], z);
var $a = Object.defineProperty, wa = Object.getOwnPropertyDescriptor, j = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? wa(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && $a(t, s, r), r;
};
const zt = ["modes", "setpoints", "zones", "devices", "systems"], Lt = {
  modes: "Heating Modes",
  setpoints: "Setpoints",
  zones: "Zones",
  devices: "Device Presets",
  systems: "Heating System"
}, ka = {
  modes: "＋ Mode",
  setpoints: "＋ Setpoint",
  zones: "＋ Zone",
  devices: "＋ Device preset",
  systems: "＋ Système"
}, Ca = {
  tolerance: "Tolérance",
  mode: "Mode",
  lock: "Verrouillage",
  sensor: "Capteur"
}, Sa = (e) => e == null ? "—" : `${e.toLocaleString("fr-FR")} °C`;
let L = class extends b {
  constructor() {
    super(...arguments), this.base = "", this.subpath = "", this._presets = [], this._groups = [], this._devicePresets = [], this._zones = [], this._systems = [], this._enabledLocal = !0, this._switching = !1, this._rooms = [], this._loaded = !1, this._presetName = "", this._presetId = "", this._busy = !1, this._presetIdEdited = !1, this._formFor = null;
  }
  /** Global heating: switch.homex_heating (live), else the last loaded value. */
  get _enabled() {
    const e = this.hass?.states["switch.homex_heating"];
    return e ? e.state === "on" : this._enabledLocal;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    try {
      const [e, t] = await Promise.all([
        Qe(this.hass),
        Je(this.hass)
      ]);
      this._presets = e.presets, this._groups = e.groups, this._devicePresets = e.device_presets ?? [], this._zones = e.zones ?? [], this._systems = e.systems ?? [], this._enabledLocal = e.enabled ?? !0, this._rooms = t;
    } catch {
      this._presets = [], this._groups = [], this._devicePresets = [], this._zones = [];
    }
    this._loaded = !0;
  }
  willUpdate() {
    const { section: e, editing: t, id: s } = this._route;
    if (t && e === "modes") {
      const i = s ? this._presets.find((r) => r.id === s) : null;
      (!s || i) && this._syncPresetForm(i ?? null);
    } else
      this._formFor = null;
  }
  get _route() {
    const [e, t, s] = ye(this.subpath);
    return {
      section: zt.includes(e) ? e : "modes",
      editing: t === "new" || t === "edit" && !!s,
      id: t === "edit" ? s : void 0
    };
  }
  _url(e, ...t) {
    return e === "modes" && !t.length ? this.base : B(this.base, e, ...t);
  }
  _openEditor(e, t) {
    I(this._url(e, ...t ? ["edit", t] : ["new"]));
  }
  _closeEditor(e) {
    this._load(), ce(this._url(e));
  }
  async _setEnabled(e) {
    this._switching = !0;
    try {
      await Vs(this.hass, e), this._enabledLocal = e;
    } catch (t) {
      alert("Erreur Homex : " + v(t));
    } finally {
      this._switching = !1;
    }
  }
  _back() {
    this.dispatchEvent(new CustomEvent("close"));
  }
  // --- Presets -------------------------------------------------------------
  /** (Re)fill the preset form when the edited preset changes. */
  _syncPresetForm(e) {
    const t = e?.id ?? "__new__";
    this._formFor !== t && (this._formFor = t, this._presetName = e?.name ?? "", this._presetId = e?.id ?? "", this._presetIdEdited = !!e, this._busy = !1);
  }
  async _savePreset(e) {
    this._busy = !0;
    try {
      await Pr(
        this.hass,
        { id: this._presetId, name: this._presetName.trim() },
        !e
      ), this._closeEditor("modes");
    } catch (t) {
      alert("Erreur Homex : " + v(t)), this._busy = !1;
    }
  }
  async _deletePreset(e) {
    if (confirm(`Supprimer le mode « ${e.name} » et ses consignes ?`)) {
      this._busy = !0;
      try {
        await Mr(this.hass, e.id), this._closeEditor("modes");
      } catch (t) {
        alert("Erreur Homex : " + v(t)), this._busy = !1;
      }
    }
  }
  _renderPresetEditor(e) {
    const t = () => this._closeEditor("modes");
    return n`
      <div class="head">
        <button @click=${t}>← Heating Modes</button>
        <h2>${e ? "Modifier le mode" : "Nouveau mode de chauffage"}</h2>
      </div>
      <div class="editor">
        ${P("Nom", this._presetName, (s) => {
      this._presetName = s, this._presetIdEdited || (this._presetId = E(s));
    }, "Vacances")}
        ${e ? n`<div class="section">Id : ${e.id}</div>` : P("Id", this._presetId, (s) => {
      this._presetIdEdited = !0, this._presetId = E(s);
    })}
        ${e?.builtin ? n`<p class="hint">Mode par défaut : il peut être renommé, pas supprimé.</p>` : ""}
        <div class="actions">
          <button
            class="primary"
            ?disabled=${this._busy || !this._presetName.trim() || !this._presetId}
            @click=${() => this._savePreset(e)}
          >
            Enregistrer
          </button>
          <button ?disabled=${this._busy} @click=${t}>Annuler</button>
          ${e && !e.builtin ? n`<button
                class="danger"
                ?disabled=${this._busy}
                @click=${() => this._deletePreset(e)}
              >
                Supprimer
              </button>` : ""}
        </div>
      </div>
    `;
  }
  _renderPresets() {
    return n`<div class="grid">
      ${this._presets.map(
      (e) => n`<div class="card" @click=${() => this._openEditor("modes", e.id)}>
          <div class="card-head">
            <div class="icon">🌡</div>
            <div>
              <div class="name">${e.name}</div>
              <div class="meta">
                ${e.id}${e.builtin ? " · par défaut" : ""}${e.unheated ? " · coupé ou consigne" : ""}
              </div>
            </div>
          </div>
        </div>`
    )}
    </div>`;
  }
  // --- Heating groups ------------------------------------------------------
  /** Rooms of a setpoint / zone; the default one lists every room left. */
  _roomNames(e, t = this._groups, s = jt) {
    if (e.id === s) {
      const i = new Set(t.flatMap((o) => o.rooms)), r = this._rooms.filter((o) => !i.has(o.room_id));
      return r.length ? `Autres pièces : ${r.map((o) => o.name).join(", ")}` : "Toutes les autres pièces (aucune pour l'instant)";
    }
    return e.rooms.length ? e.rooms.map((i) => this._rooms.find((r) => r.room_id === i)?.name ?? i).join(", ") : "Aucune pièce";
  }
  _renderGroups() {
    return n`<div class="grid">
      ${this._groups.map(
      (e) => n`<div class="card" @click=${() => this._openEditor("setpoints", e.id)}>
          <div class="card-head">
            <div class="icon">🔥</div>
            <div>
              <div class="name">${e.name}</div>
              <div class="meta">${this._roomNames(e)}</div>
            </div>
          </div>
          <div class="temps">
            ${this._presets.map(
        (t) => n`<span class="temp"
                >${t.name} ·
                ${t.unheated && e.setpoints[t.id] == null ? "coupé" : Sa(e.setpoints[t.id])}</span
              >`
      )}
          </div>
        </div>`
    )}
    </div>`;
  }
  async _setZoneMode(e, t) {
    try {
      await Vr(this.hass, e.id, t), this._zones = this._zones.map((s) => s.id === e.id ? { ...s, mode: t } : s);
    } catch (s) {
      alert("Erreur Homex : " + v(s));
    }
  }
  _renderZones() {
    return n`<div class="grid">
      ${this._zones.map((e) => {
      const t = Object.values(e.triggers ?? {}).reduce((s, i) => s + i.length, 0);
      return n`<div class="card" @click=${() => this._openEditor("zones", e.id)}>
          <div class="card-head">
            <div class="icon">🏠</div>
            <div>
              <div class="name">${e.name}</div>
              <div class="meta">
                ${this._roomNames(e, this._zones, si)}
              </div>
            </div>
          </div>
          <label class="zone-mode" @click=${(s) => s.stopPropagation()}>
            Mode actif
            <homex-select
              .value=${e.mode}
              .options=${this._presets.map((s) => ({ value: s.id, label: s.name }))}
              @value-changed=${(s) => this._setZoneMode(e, s.detail.value)}
            ></homex-select>
          </label>
          <div class="meta">
            select.homex_heating_${e.id} · ${t} déclencheur(s)
          </div>
        </div>`;
    })}
    </div>`;
  }
  _renderSystems() {
    if (!this._systems.length)
      return n`<div class="msg">
        Aucun système. Clique sur « ＋ Système » pour déclarer une chaudière (Boiler)
        ou un ballon tampon (Buffer Tank).
      </div>`;
    const e = (t) => t === "global" ? "Global" : this._zones.find((s) => s.id === t)?.name ?? t;
    return n`<div class="grid">
      ${this._systems.map((t) => {
      if (t.type === "buffer_tank") return this._renderTankCard(t);
      const s = t.contact ? this.hass.states[t.contact] : void 0;
      return n`<div class="card" @click=${() => this._openEditor("systems", t.id)}>
          <div class="card-head">
            <div class="icon">${t.type === "boiler" ? "🔥" : "♨️"}</div>
            <div>
              <div class="name">${t.name}</div>
              <div class="meta">
                ${t.type === "boiler" ? "Boiler" : "Heat Pump"} ·
                ${(t.zones ?? ["global"]).map(e).join(", ")}
              </div>
            </div>
          </div>
          ${t.type === "boiler" ? n`<div class="temps">
                <span class="temp">
                  Contact :
                  ${s?.attributes?.friendly_name ?? (t.contact || "—")}
                  ${s ? `(${s.state})` : ""}
                </span>
                ${t.aggressive ? n`<span class="temp">Agressif</span>` : ""}
              </div>` : ""}
        </div>`;
    })}
    </div>`;
  }
  _renderTankCard(e) {
    const t = (o) => o === "global" ? "Global" : this._zones.find((a) => a.id === o)?.name ?? o, s = (o) => {
      const a = o ? this.hass.states[o] : void 0, c = parseFloat(a?.state ?? "");
      return Number.isNaN(c) ? "—" : `${c} °C`;
    }, i = e.circulator ? this.hass.states[e.circulator] : void 0, r = e.rules ?? [];
    return n`<div class="card" @click=${() => this._openEditor("systems", e.id)}>
      <div class="card-head">
        <div class="icon">🛢️</div>
        <div>
          <div class="name">${e.name}</div>
          <div class="meta">
            Buffer Tank · ${(e.zones ?? ["global"]).map(t).join(", ")} ·
            ${r.length} règle(s) · min ${e.min_runtime ?? 0} min
          </div>
        </div>
      </div>
      <div class="temps">
        <span class="temp" title="Consigne">🎯 ${s(e.setpoint_sensor)}</span>
        ${e.tank_sensor ? n`<span class="temp" title="Ballon">🛢 ${s(e.tank_sensor)}</span>` : ""}
        ${e.flow_sensor ? n`<span class="temp" title="Départ">↗ ${s(e.flow_sensor)}</span>` : ""}
        <span class="temp" title="Retour">↘ ${s(e.return_sensor)}</span>
        ${e.aggressive ? n`<span class="temp">Agressif</span>` : ""}
        ${e.force && this.hass.states[e.force]?.state === "on" ? n`<span class="temp" title=${this.hass.states[e.force]?.attributes?.friendly_name ?? e.force}>Forcé</span>` : ""}
        ${(() => {
      const o = parseFloat(this.hass.states[`sensor.homex_system_${e.id}_runtime_today`]?.state ?? "");
      if (Number.isNaN(o)) return "";
      const a = Math.round(o), c = a >= 60 ? `${Math.floor(a / 60)} h ${String(a % 60).padStart(2, "0")}` : `${a} min`;
      return n`<span class="temp" title="Durée d'activité du circulateur aujourd'hui">⏱ ${c}</span>`;
    })()}
        <span class="temp" title=${i?.attributes?.friendly_name ?? e.circulator ?? ""}>
          Circulateur : ${i ? i.state === "on" ? "en marche" : i.state === "off" ? "arrêté" : i.state : "—"}
        </span>
      </div>
    </div>`;
  }
  _renderDevicePresets() {
    return this._devicePresets.length ? n`<div class="grid">
      ${this._devicePresets.map((e) => {
      const t = Object.entries(e.params ?? {});
      return n`<div class="card" @click=${() => this._openEditor("devices", e.id)}>
          <div class="card-head">
            <div class="icon">🎛</div>
            <div>
              <div class="name">${e.name}</div>
              <div class="meta">${e.model.replace("|", " ")}</div>
            </div>
          </div>
          <div class="temps">
            ${t.length ? t.map(
        ([s, i]) => n`<span class="temp"
                      >${Ca[s] ?? s} ·
                      ${String(i.value)}${i.value_agressive != null ? ` / ${i.value_agressive}` : ""}</span
                    >`
      ) : n`<span class="meta">Aucun réglage</span>`}
          </div>
        </div>`;
    })}
    </div>` : n`<div class="msg">
        Aucun device preset. Clique sur « ＋ Device preset » pour fixer les réglages
        d'un modèle de vanne thermostatique.
      </div>`;
  }
  _notFound(e, t) {
    return n`
      <div class="head">
        <button @click=${() => this._closeEditor(e)}>
          ← ${Lt[e]}
        </button>
        <h2></h2>
      </div>
      <div class="msg">${this._loaded ? `« ${t} » introuvable.` : "Chargement…"}</div>
    `;
  }
  render() {
    const { section: e, editing: t, id: s } = this._route;
    if (t && e === "modes") {
      const i = s ? this._presets.find((r) => r.id === s) : null;
      return s && !i ? this._notFound(e, s) : this._renderPresetEditor(i ?? null);
    }
    if (t && e === "systems") {
      const i = s ? this._systems.find((r) => r.id === s) : null;
      return s && !i ? this._notFound(e, s) : n`
        <div class="head">
          <button @click=${() => this._closeEditor("systems")}>← Heating System</button>
          <h2>${i ? "Modifier le système" : "Nouveau système de chauffage"}</h2>
        </div>
        <div class="editor">
          <homex-heating-system-editor
            .hass=${this.hass}
            .system=${i ?? null}
            .zones=${this._zones}
            @heating-system-closed=${() => this._closeEditor("systems")}
          ></homex-heating-system-editor>
        </div>
      `;
    }
    if (t && e === "zones") {
      const i = s ? this._zones.find((r) => r.id === s) : null;
      return s && !i ? this._notFound(e, s) : n`
        <div class="head">
          <button @click=${() => this._closeEditor("zones")}>← Zones</button>
          <h2>${i ? "Modifier la zone" : "Nouvelle zone"}</h2>
        </div>
        <div class="editor">
          <homex-heating-zone-editor
            .hass=${this.hass}
            .zone=${i ?? null}
            .zones=${this._zones}
            .modes=${this._presets}
            .rooms=${this._rooms}
            @heating-zone-closed=${() => this._closeEditor("zones")}
          ></homex-heating-zone-editor>
        </div>
      `;
    }
    if (t && e === "devices") {
      const i = s ? this._devicePresets.find((r) => r.id === s) : null;
      return s && !i ? this._notFound(e, s) : n`
        <div class="head">
          <button @click=${() => this._closeEditor("devices")}>← Device Presets</button>
          <h2>${i ? "Modifier le device preset" : "Nouveau device preset"}</h2>
        </div>
        <div class="editor">
          <homex-heating-device-preset-editor
            .hass=${this.hass}
            .preset=${i ?? null}
            @heating-device-preset-closed=${() => this._closeEditor("devices")}
          ></homex-heating-device-preset-editor>
        </div>
      `;
    }
    if (t) {
      const i = s ? this._groups.find((r) => r.id === s) : null;
      return s && !i ? this._notFound(e, s) : n`
        <div class="head">
          <button @click=${() => this._closeEditor("setpoints")}>← Setpoints</button>
          <h2>${i ? "Modifier le setpoint" : "Nouveau setpoint"}</h2>
        </div>
        <div class="editor">
          <homex-heating-group-editor
            .hass=${this.hass}
            .group=${i ?? null}
            .groups=${this._groups}
            .presets=${this._presets}
            .rooms=${this._rooms}
            @heating-group-closed=${() => this._closeEditor("setpoints")}
          ></homex-heating-group-editor>
        </div>
      `;
    }
    return n`
      <div class="head">
        <button @click=${this._back}>← Climate</button>
        <h2>Heating</h2>
        <label
          class="master ${this._enabled ? "on" : ""}"
          title=${this._enabled ? "Désactiver : toutes les vannes passent sur off" : "Activer : les presets sont ré-appliqués"}
        >
          ${this._enabled ? "Chauffage activé" : "Chauffage désactivé"}
          <span class="toggle ${this._enabled ? "on" : ""}">
            <input
              type="checkbox"
              .checked=${this._enabled}
              ?disabled=${this._switching}
              @change=${(i) => this._setEnabled(i.target.checked)}
            />
            <span class="knob"></span>
          </span>
        </label>
      </div>
      <div class="tabs">
        ${zt.map((i) => [i, Lt[i]]).map(
      ([i, r]) => n`<span
            class="tab ${e === i ? "active" : ""}"
            @click=${() => {
        i !== e && I(this._url(i), !0);
      }}
            >${r}</span
          >`
    )}
      </div>
      <!-- Phones: too many tabs for one row, a section picker instead. -->
      <homex-select
        class="tab-picker"
        .value=${e}
        .options=${zt.map((i) => ({ value: i, label: Lt[i] }))}
        @value-changed=${(i) => {
      i.detail.value !== e && I(this._url(i.detail.value), !0);
    }}
      ></homex-select>
      <div class="tab-actions">
        <button class="primary" @click=${() => this._openEditor(e)}>
          ${ka[e]}
        </button>
      </div>
      ${this._loaded ? e === "modes" ? this._renderPresets() : e === "setpoints" ? this._renderGroups() : e === "zones" ? this._renderZones() : e === "systems" ? this._renderSystems() : this._renderDevicePresets() : n`<div class="msg">Chargement…</div>`}
    `;
  }
};
L.styles = [
  C,
  y`
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .head h2 {
        flex: 1;
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
      .head button {
        min-height: 0;
        padding: 8px 12px;
        border-radius: 8px;
      }
      .master {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .master.on {
        color: var(--state-climate-heat-color, #ff8100);
      }
      .toggle {
        position: relative;
        width: 40px;
        height: 22px;
        border-radius: 11px;
        background: var(--disabled-color, #888);
        transition: background 0.2s;
      }
      .toggle.on {
        background: var(--state-climate-heat-color, #ff8100);
      }
      .toggle input {
        position: absolute;
        inset: 0;
        opacity: 0;
        margin: 0;
        cursor: pointer;
      }
      .knob {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #fff;
        transition: transform 0.2s;
        pointer-events: none;
      }
      .toggle.on .knob {
        transform: translateX(18px);
      }
      .tab-actions {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 12px;
      }
      .tab-picker {
        display: none;
        margin-bottom: 12px;
      }
      .tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .tab {
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .tab.active {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
        margin-bottom: -1px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 12px;
      }
      .card {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        cursor: pointer;
        background: var(--card-background-color, #1c1c1c);
      }
      .card:hover {
        border-color: var(--primary-color);
      }
      .card-head {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .icon {
        flex: 0 0 auto;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
      }
      .name {
        font-size: 15px;
        font-weight: 500;
      }
      .meta {
        font-size: 12px;
        color: var(--secondary-text-color);
        overflow-wrap: anywhere;
      }
      .temps {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .temp {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 10px;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
      }
      .zone-mode {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--secondary-text-color);
        cursor: default;
      }
      .zone-mode homex-select {
        flex: 1;
      }
      .msg {
        padding: 24px 4px;
        color: var(--secondary-text-color);
      }
      .editor {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        padding: 16px;
      }
      .hint {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      /* Phones (last, to override the rules above). */
      @media (max-width: 600px) {
        .tab-actions button {
          flex: 1;
        }
        .tabs {
          display: none;
        }
        .tab-picker {
          display: block;
        }
      }
    `
];
j([
  h({ attribute: !1 })
], L.prototype, "hass", 2);
j([
  h({ attribute: !1 })
], L.prototype, "base", 2);
j([
  h({ attribute: !1 })
], L.prototype, "subpath", 2);
j([
  l()
], L.prototype, "_presets", 2);
j([
  l()
], L.prototype, "_groups", 2);
j([
  l()
], L.prototype, "_devicePresets", 2);
j([
  l()
], L.prototype, "_zones", 2);
j([
  l()
], L.prototype, "_systems", 2);
j([
  l()
], L.prototype, "_enabledLocal", 2);
j([
  l()
], L.prototype, "_switching", 2);
j([
  l()
], L.prototype, "_rooms", 2);
j([
  l()
], L.prototype, "_loaded", 2);
j([
  l()
], L.prototype, "_presetName", 2);
j([
  l()
], L.prototype, "_presetId", 2);
j([
  l()
], L.prototype, "_busy", 2);
L = j([
  $("homex-heating-manager")
], L);
var Ea = Object.defineProperty, Aa = Object.getOwnPropertyDescriptor, Me = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Aa(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && Ea(t, s, r), r;
};
const bs = "heating", xs = [
  { key: "temperature", label: "Température", icon: "🌡", deviceClass: "temperature", section: "Température" },
  { key: "humidity", label: "Humidité", icon: "💧", deviceClass: "humidity", section: "Humidité" },
  { key: "pm25", label: "PM2.5", icon: "🌫", deviceClass: "pm25", section: "Qualité de l'air" },
  { key: "pm10", label: "PM10", icon: "🌫", deviceClass: "pm10", section: "Qualité de l'air" },
  { key: "co2", label: "CO₂", icon: "🫧", deviceClass: "carbon_dioxide", section: "CO₂" }
], Pa = [
  ["mean", "Moyenne pondérée"],
  ["max", "Maximum"],
  ["min", "Minimum"]
];
function Ma(e, t) {
  if (!e.length) return null;
  if (t === "max") return Math.max(...e.map(([i]) => i));
  if (t === "min") return Math.min(...e.map(([i]) => i));
  const s = e.reduce((i, [, r]) => i + r, 0);
  return s <= 0 ? e.reduce((i, [r]) => i + r, 0) / e.length : e.reduce((i, [r, o]) => i + r * o, 0) / s;
}
let ge = class extends b {
  constructor() {
    super(...arguments), this.base = "", this.subpath = "", this._rooms = [], this._loaded = !1, this._draft = {}, this._busy = !1, this._draftFor = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    try {
      this._rooms = await Je(this.hass);
    } catch {
      this._rooms = [];
    }
    this._loaded = !0;
  }
  get _roomId() {
    return ye(this.subpath)[0] ?? null;
  }
  willUpdate() {
    const e = this._roomId ? this._rooms.find((t) => t.room_id === this._roomId) : null;
    if (!e) {
      this._draftFor = null;
      return;
    }
    this._draftFor !== e.room_id && (this._draftFor = e.room_id, this._draft = JSON.parse(JSON.stringify(e.metrics ?? {})), this._busy = !1);
  }
  _hasClimate(e) {
    return (e.modules ?? []).includes(bs);
  }
  async _openRoom(e) {
    if (!this._hasClimate(e)) {
      if (!confirm(`Activer le module Climate sur la pièce « ${e.name} » ?`)) return;
      try {
        await Se(this.hass, {
          entry_id: e.entry_id,
          modules: [...e.modules ?? [], bs]
        }), await this._load();
      } catch (t) {
        alert("Erreur Homex : " + v(t));
        return;
      }
    }
    I(B(this.base, e.room_id));
  }
  // --- Sensors --------------------------------------------------------------
  _friendly(e) {
    return this.hass.states[e]?.attributes?.friendly_name || e;
  }
  _current(e) {
    const t = this.hass.states[e];
    if (!t || t.state === "unknown" || t.state === "unavailable") return "—";
    const s = t.attributes?.unit_of_measurement;
    return s ? `${t.state} ${s}` : t.state;
  }
  /** Sensors of a metric's device class: the room area's first, then others
   * (alphabetical); Homex's own reference sensors excluded. */
  _candidates(e, t) {
    const s = (a, c) => this._friendly(a).localeCompare(this._friendly(c)), i = Object.keys(this.hass.states).filter(
      (a) => a.startsWith("sensor.") && !a.startsWith("sensor.homex_") && this.hass.states[a]?.attributes?.device_class === e.deviceClass
    ), r = t.area_id ? i.filter((a) => Xs(this.hass, a) === t.area_id).sort(s) : [], o = i.filter((a) => !r.includes(a)).sort(s);
    return { area: r, others: o };
  }
  _cfg(e) {
    return this._draft[e] ?? { sensors: [], rule: "mean" };
  }
  _setCfg(e, t) {
    this._draft = { ...this._draft, [e]: t };
  }
  _addSensor(e, t) {
    if (!t) return;
    const s = this._cfg(e);
    s.sensors.some((i) => i.entity_id === t) || this._setCfg(e, { ...s, sensors: [...s.sensors, { entity_id: t, weight: 1 }] });
  }
  /** The reference value of a metric with the draft config (live preview). */
  _reference(e) {
    const t = this._cfg(e), s = [];
    let i = "";
    for (const o of t.sensors) {
      const a = this.hass.states[o.entity_id], c = parseFloat(a?.state);
      Number.isNaN(c) || (s.push([c, o.weight]), i = i || a.attributes?.unit_of_measurement || "");
    }
    const r = Ma(s, t.rule);
    return r == null ? "—" : `${Math.round(r * 10) / 10}${i ? " " + i : ""}`;
  }
  async _save(e) {
    this._busy = !0;
    try {
      await Se(this.hass, { entry_id: e.entry_id, metrics: this._draft }), this._draftFor = null, await this._load(), ce(this.base);
    } catch (t) {
      alert("Erreur Homex : " + v(t)), this._busy = !1;
    }
  }
  _renderMetric(e, t) {
    const s = this._cfg(e.key), { area: i, others: r } = this._candidates(e, t), o = new Set(s.sensors.map((d) => d.entity_id)), a = t.area_id ? this.hass.areas?.[t.area_id]?.name : void 0, c = (d) => ({
      value: d,
      label: this._friendly(d),
      secondary: d,
      tertiary: this._current(d),
      disabled: o.has(d)
    });
    return n`<div class="metric">
      <div class="metric-head">
        <span class="title">${e.icon} ${e.label}</span>
        ${s.sensors.length ? n`<span class="ref">${this._reference(e.key)}</span>` : ""}
      </div>
      ${s.sensors.length > 1 ? n`<homex-select
            class="rule"
            label="Calcul de la valeur de référence"
            .value=${s.rule}
            .options=${Pa.map(([d, p]) => ({ value: d, label: p }))}
            @value-changed=${(d) => this._setCfg(e.key, { ...s, rule: d.detail.value })}
          ></homex-select>` : ""}
      ${s.sensors.map(
      (d, p) => n`<div class="sensor">
          <span>${this._friendly(d.entity_id)}</span>
          <span class="cur">${this._current(d.entity_id)}</span>
          ${s.rule === "mean" && s.sensors.length > 1 ? n`<input
                type="number"
                min="0"
                step="0.1"
                title="Poids"
                .value=${String(d.weight)}
                @change=${(m) => {
        const u = Math.max(0, parseFloat(m.target.value) || 0);
        this._setCfg(e.key, {
          ...s,
          sensors: s.sensors.map((_, g) => g === p ? { ..._, weight: u } : _)
        });
      }}
              />` : n`<span></span>`}
          <button
            title="Retirer"
            @click=${() => this._setCfg(e.key, {
        ...s,
        sensors: s.sensors.filter((m, u) => u !== p)
      })}
          >
            ✕
          </button>
        </div>`
    )}
      <homex-select
        class="add"
        placeholder="＋ Ajouter un capteur…"
        value=""
        .groups=${[
      ...i.length ? [{ label: `Pièce : ${a ?? t.area_id}`, options: i.map((d) => c(d)) }] : [],
      { label: "Autres", options: r.map((d) => c(d)) }
    ]}
        @value-changed=${(d) => {
      this._addSensor(e.key, d.detail.value), d.target.value = "";
    }}
      ></homex-select>
    </div>`;
  }
  _renderRoom(e) {
    let t = "";
    return n`
      <div class="head">
        <button @click=${() => ce(this.base)}>← Metrics</button>
        <h2>${e.name}</h2>
        <button class="primary" ?disabled=${this._busy} @click=${() => this._save(e)}>
          Enregistrer
        </button>
      </div>
      ${xs.map((s) => {
      const i = s.section !== t ? s.section : "";
      return t = s.section, n`${i ? n`<div class="section-title">${i}</div>` : ""}
          ${this._renderMetric(s, e)}`;
    })}
    `;
  }
  /** The room's reference values (its sensor.homex_<room>_<metric> entities). */
  _roomValues(e) {
    const t = xs.filter((s) => e.metrics?.[s.key]?.sensors?.length);
    return t.length ? n`<div class="values">
      ${t.map(
      (s) => n`<span class="value">
          ${s.icon} ${this._current(`sensor.homex_${e.room_id}_${s.key}`)}
        </span>`
    )}
    </div>` : n`<span class="meta">Aucun capteur</span>`;
  }
  render() {
    if (!this._loaded) return n`<div class="msg">Chargement…</div>`;
    const e = this._roomId;
    if (e) {
      const t = this._rooms.find((s) => s.room_id === e);
      return !t || !this._hasClimate(t) ? n`<div class="head">
            <button @click=${() => ce(this.base)}>← Metrics</button>
            <h2></h2>
          </div>
          <div class="msg">
            ${t ? "Le module Climate n'est pas activé sur cette pièce." : `« ${e} » introuvable.`}
          </div>` : this._renderRoom(t);
    }
    return n`
      <div class="head">
        <button @click=${() => this.dispatchEvent(new CustomEvent("close"))}>← Climate</button>
        <h2>Metrics</h2>
      </div>
      <div class="list">
        ${this._rooms.map((t) => {
      const s = this._hasClimate(t), i = t.area_id ? this.hass.areas?.[t.area_id]?.name : void 0;
      return n`<div class="row ${s ? "" : "off"}" @click=${() => this._openRoom(t)}>
            <div class="info">
              <div class="name">${t.name}</div>
              <div class="meta">${i ?? "Aucune pièce HA associée"}</div>
            </div>
            ${s ? this._roomValues(t) : n`<span class="meta">Module Climate désactivé</span>`}
            <span class="chevron">›</span>
          </div>`;
    })}
      </div>
    `;
  }
};
ge.styles = [
  C,
  y`
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      .head h2 {
        flex: 1;
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
      .head button {
        min-height: 0;
        padding: 8px 12px;
        border-radius: 8px;
      }
      .list {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        overflow: hidden;
        background: var(--card-background-color, #1c1c1c);
      }
      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        cursor: pointer;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }
      .row:first-child {
        border-top: none;
      }
      .row:hover {
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.06));
      }
      .row.off {
        opacity: 0.45;
      }
      .row .info {
        flex: 1;
        min-width: 0;
      }
      .row .values {
        justify-content: flex-end;
      }
      .chevron {
        color: var(--secondary-text-color);
        font-size: 18px;
      }
      @media (max-width: 600px) {
        .row {
          flex-wrap: wrap;
        }
        .row .values {
          justify-content: flex-start;
          width: 100%;
        }
      }
      .name {
        font-size: 15px;
        font-weight: 500;
      }
      .meta {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .values {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .value {
        font-size: 13px;
        padding: 3px 9px;
        border-radius: 10px;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
      }
      .msg {
        padding: 24px 4px;
        color: var(--secondary-text-color);
      }
      .metric {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        padding: 12px 14px;
        margin-bottom: 12px;
      }
      .metric .rule {
        max-width: 320px;
        margin: 10px 0 4px;
      }
      .metric-head {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .metric-head .title {
        flex: 1;
        font-weight: 500;
      }
      .ref {
        font-size: 18px;
        font-weight: 500;
        color: var(--primary-color);
      }
      input {
        box-sizing: border-box;
        padding: 8px 10px;
        font-size: 14px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      .sensor {
        display: grid;
        grid-template-columns: 1fr auto auto auto;
        gap: 8px;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        font-size: 14px;
      }
      .sensor .cur {
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .sensor input {
        width: 72px;
      }
      .sensor button {
        min-height: 0;
        padding: 6px 10px;
      }
      .add {
        width: 100%;
        margin-top: 8px;
      }
      .section-title {
        font-size: 13px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--secondary-text-color);
        margin: 18px 0 8px;
      }
    `
];
Me([
  h({ attribute: !1 })
], ge.prototype, "hass", 2);
Me([
  h({ attribute: !1 })
], ge.prototype, "base", 2);
Me([
  h({ attribute: !1 })
], ge.prototype, "subpath", 2);
Me([
  l()
], ge.prototype, "_rooms", 2);
Me([
  l()
], ge.prototype, "_loaded", 2);
Me([
  l()
], ge.prototype, "_draft", 2);
Me([
  l()
], ge.prototype, "_busy", 2);
ge = Me([
  $("homex-climate-metrics")
], ge);
var Ha = Object.defineProperty, za = Object.getOwnPropertyDescriptor, At = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? za(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && Ha(t, s, r), r;
};
const ys = [
  {
    key: "metrics",
    icon: "📈",
    label: "Metrics",
    desc: "Capteurs de température, d'humidité et de qualité de l'air."
  },
  {
    key: "heating",
    icon: "🔥",
    label: "Heating",
    desc: "Modes de chauffage, consignes, zones et presets des radiateurs."
  },
  {
    key: "ac",
    icon: "❄️",
    label: "Air Conditioning",
    desc: "Climatisation — pas encore disponible."
  }
];
let Ye = class extends b {
  constructor() {
    super(...arguments), this.base = "", this.subpath = "", this._toLanding = () => ce(this.base);
  }
  get _page() {
    const e = ye(this.subpath)[0];
    return ys.some((t) => t.key === e) ? e : null;
  }
  _placeholder(e, t) {
    return n`
      <div class="head">
        <button @click=${this._toLanding}>← Climate</button>
        <h2>${e}</h2>
      </div>
      <div class="msg">${t}</div>
    `;
  }
  render() {
    const e = this._page;
    return e === "heating" ? n`<homex-heating-manager
        .hass=${this.hass}
        .base=${B(this.base, "heating")}
        .subpath=${ye(this.subpath).slice(1).join("/")}
        @close=${this._toLanding}
      ></homex-heating-manager>` : e === "metrics" ? n`<homex-climate-metrics
        .hass=${this.hass}
        .base=${B(this.base, "metrics")}
        .subpath=${ye(this.subpath).slice(1).join("/")}
        @close=${this._toLanding}
      ></homex-climate-metrics>` : e === "ac" ? this._placeholder("Air Conditioning", "La climatisation n'est pas encore disponible.") : n`
      <div class="head">
        <button @click=${() => this.dispatchEvent(new CustomEvent("close"))}>← Homex</button>
        <h2>Climate Manager</h2>
      </div>
      <div class="pages">
        ${ys.map(
      (t) => n`<div
            class="page ${t.key === "ac" ? "soon" : ""}"
            @click=${() => I(B(this.base, t.key))}
          >
            <div class="icon">${t.icon}</div>
            <div>
              <div class="name">${t.label}</div>
              <div class="desc">${t.desc}</div>
            </div>
          </div>`
    )}
      </div>
    `;
  }
};
Ye.styles = [
  C,
  y`
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      .head h2 {
        flex: 1;
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
      .head button {
        min-height: 0;
        padding: 8px 12px;
        border-radius: 8px;
      }
      .pages {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 12px;
      }
      .page {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        cursor: pointer;
        background: var(--card-background-color, #1c1c1c);
      }
      .page:hover {
        border-color: var(--primary-color);
      }
      .page.soon {
        opacity: 0.6;
      }
      .icon {
        flex: none;
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
      }
      .name {
        font-size: 16px;
        font-weight: 500;
      }
      .desc {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .msg {
        padding: 24px 4px;
        color: var(--secondary-text-color);
      }
    `
];
At([
  h({ attribute: !1 })
], Ye.prototype, "hass", 2);
At([
  h({ attribute: !1 })
], Ye.prototype, "base", 2);
At([
  h({ attribute: !1 })
], Ye.prototype, "subpath", 2);
Ye = At([
  $("homex-climate-manager")
], Ye);
var La = Object.defineProperty, Oa = Object.getOwnPropertyDescriptor, He = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Oa(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && La(t, s, r), r;
};
const nt = "select.homex_climate_tolerance_mode";
let ve = class extends b {
  constructor() {
    super(...arguments), this.rooms = [], this._zones = [], this._enabledLocal = !0, this._loaded = !1, this._busy = !1, this._roomBusy = /* @__PURE__ */ new Set();
  }
  /** Global heating: switch.homex_heating (live), else the last loaded value. */
  get _enabled() {
    const e = this.hass?.states["switch.homex_heating"];
    return e ? e.state === "on" : this._enabledLocal;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    try {
      const e = await Qe(this.hass);
      this._zones = e.zones ?? [], this._enabledLocal = e.enabled ?? !0;
    } catch {
      this._zones = [];
    }
    this._loaded = !0;
  }
  async _toggle() {
    this._busy = !0;
    try {
      const e = !this._enabled;
      await Vs(this.hass, e), this._enabledLocal = e;
    } catch (e) {
      alert("Erreur Homex : " + v(e));
    } finally {
      this._busy = !1;
    }
  }
  _demandPill(e) {
    const t = this.hass.states[e]?.state === "on";
    return n`<span class="pill ${t ? "heating" : ""}" title=${e}>
      <svg viewBox="0 0 24 24"><path d=${t ? Ot : Dt}></path></svg>
      ${t ? "Heating" : "Idle"}
    </span>`;
  }
  /** Rooms of a zone (the default zone: every room no other zone lists). */
  _zoneRooms(e) {
    const t = new Set(this._zones.flatMap((r) => r.rooms)), i = (e.id === "default" ? this.rooms.map((r) => r.room_id).filter((r) => !t.has(r)) : e.rooms).map((r) => this.rooms.find((o) => o.room_id === r)?.name ?? r);
    return i.length ? i.join(", ") : "Aucune pièce";
  }
  _renderZone(e) {
    const t = `select.homex_heating_${e.id}`, s = this.hass.states[t], i = s?.attributes?.options ?? [];
    return n`<div class="zone">
      <div class="info">
        <div class="name">${e.name}</div>
        <div class="muted">${this._zoneRooms(e)}</div>
      </div>
      ${this._demandPill(`binary_sensor.homex_heating_needed_${e.id}`)}
      <homex-select
        class="zone-mode"
        title="Mode de la zone"
        .value=${s?.state ?? ""}
        ?disabled=${!s}
        .options=${i.map((r) => ({ value: r, label: r }))}
        @value-changed=${(r) => this.hass.callService("select", "select_option", {
      entity_id: t,
      option: r.detail.value
    })}
      ></homex-select>
      ${this.hass.states[`${nt}_${e.id}`] ? n`<span class="zone-tol" title="Tolérance de la zone">
            ${this._btnGroup(`${nt}_${e.id}`)}
          </span>` : ""}
    </div>`;
  }
  /** A segmented button group for a select entity, its option highlighted. */
  _btnGroup(e) {
    const t = this.hass.states[e];
    return n`<div class="btn-group" role="radiogroup" title=${e}>
      ${(t?.attributes?.options ?? []).map(
      (s) => n`<button
          role="radio"
          aria-checked=${s === t.state ? "true" : "false"}
          class=${s === t.state ? "active" : ""}
          @click=${() => s !== t.state && this.hass.callService("select", "select_option", { entity_id: e, option: s })}
        >
          ${s}
        </button>`
    )}
    </div>`;
  }
  render() {
    if (!this._loaded) return n`<div class="muted">Chargement…</div>`;
    const e = this.hass.states[nt];
    return n`
      <div class="card">
        <div class="card-title">Chauffage</div>
        <div class="global">
          <span class="state ${this._enabled ? "on" : ""}">
            ${this._enabled ? "Activé" : "Désactivé"}
          </span>
          <div class="pills">
            ${this._demandPill("binary_sensor.homex_heating_needed")}
          </div>
          <button ?disabled=${this._busy} @click=${this._toggle}>
            ${this._enabled ? "Désactiver" : "Activer"}
          </button>
        </div>
        <div class="options">
          ${e ? n`<div class="field-select" title=${nt}>
                <span>Tolérance</span>
                ${this._btnGroup(nt)}
              </div>` : ""}
        </div>
      </div>
      <div class="card">
        <div class="card-title">Zones</div>
        ${this._zones.map((t) => this._renderZone(t))}
      </div>
      ${this._renderRooms()}
    `;
  }
  // --- Rooms ---------------------------------------------------------------
  /** Rooms with the Climate module: heating switch, mode, setpoint, current
   * temperature, radiators and heating demand. */
  _renderRooms() {
    const e = this.rooms.filter((t) => (t.modules ?? []).includes("heating"));
    return e.length ? n`<div class="card">
      <div class="card-title">Pièces</div>
      ${e.map((t) => this._renderRoom(t))}
    </div>` : "";
  }
  _fmt(e) {
    if (!e.length) return "—";
    const t = Math.min(...e), s = Math.max(...e), i = (r) => `${Math.round(r * 10) / 10}`;
    return t === s ? `${i(t)} °C` : `${i(t)}–${i(s)} °C`;
  }
  _renderRoom(e) {
    const t = e.heating?.radiators ?? [], s = e.heating?.enabled !== !1, i = t.map((x) => Ct(this.hass, x.device_id)).map((x) => x ? this.hass.states[x] : void 0).filter((x) => x && !["unknown", "unavailable"].includes(x.state)), r = (x) => typeof x == "number" ? [x] : [], o = i.filter((x) => x.state !== "off").flatMap((x) => r(x.attributes.temperature)), a = i.length > 0 && i.every((x) => x.state === "off"), c = o.length ? this._fmt(o) : a ? "coupé" : "—", d = this.hass.states[`sensor.homex_${e.room_id}_temperature`], p = parseFloat(d?.state), m = Number.isNaN(p) ? this._fmt(i.flatMap((x) => r(x.attributes.current_temperature))) : `${p} °C`, u = Fs(this.hass, e), _ = Us(this.hass, e), g = Bs(this.hass, e), f = this._roomBusy.has(e.room_id);
    return n`<div class="room ${s ? "" : "off"}">
      <label class="room-switch" title=${t.length ? "Chauffage de la pièce" : "Aucun radiateur"}>
        ${_e(s, (x) => this._setRoomHeating(e, x), f || !t.length)}
      </label>
      <div class="info">
        <div class="name">${e.name}</div>
        <div class="muted">
          ${t.length} radiateur(s)${u ? n` · ${u.mode}` : ""}
        </div>
      </div>
      <div class="temps">
        <span title="Consigne">🎯 ${c}</span>
        <span title="Température actuelle">🌡 ${m}</span>
      </div>
      ${t.length ? n`<span class="pill ${_ ? "heating" : ""}">
            <svg viewBox="0 0 24 24"><path d=${_ ? Ot : Dt}></path></svg>
            ${_ ? "Heating" : "Idle"}
          </span>` : ""}
      ${g ? n`<span class="pill warning" title=${g}>
            <svg viewBox="0 0 24 24"><path d=${As}></path></svg>Vanne ?
          </span>` : ""}
    </div>`;
  }
  /** The room's own heating: off = Unheated, on = its zone's mode. */
  async _setRoomHeating(e, t) {
    this._roomBusy = /* @__PURE__ */ new Set([...this._roomBusy, e.room_id]);
    try {
      await Se(this.hass, {
        entry_id: e.entry_id,
        heating: { radiators: e.heating?.radiators ?? [], enabled: t }
      }), U(this);
    } catch (s) {
      alert("Erreur Homex : " + v(s));
    } finally {
      const s = new Set(this._roomBusy);
      s.delete(e.room_id), this._roomBusy = s;
    }
  }
};
ve.styles = [
  C,
  y`
      .card {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        background: var(--card-background-color, #1c1c1c);
        padding: 14px 16px;
        margin-bottom: 16px;
      }
      .card-title {
        font-size: 13px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--secondary-text-color);
        margin-bottom: 10px;
      }
      .global {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px 16px;
      }
      .global .state {
        flex: 1;
        font-size: 18px;
        font-weight: 500;
      }
      .global .state.on {
        color: var(--state-climate-heat-color, #ff8100);
      }
      .pills {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 10px 3px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.08));
      }
      .pill svg {
        width: 14px;
        height: 14px;
        fill: currentColor;
      }
      .pill.warning {
        color: var(--warning-color, #ffa600);
        background: color-mix(in srgb, var(--warning-color, #ffa600) 16%, transparent);
        cursor: help;
      }
      .pill.heating {
        color: var(--state-climate-heat-color, #ff8100);
        background: color-mix(in srgb, var(--state-climate-heat-color, #ff8100) 16%, transparent);
      }
      .room {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 14px;
        padding: 10px 0;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }
      .card-title + .room {
        border-top: none;
      }
      .room.off .info,
      .room.off .temps {
        opacity: 0.55;
      }
      .room .info {
        flex: 1;
        min-width: 140px;
      }
      .room .name {
        font-weight: 500;
      }
      .room .temps {
        display: flex;
        gap: 12px;
        font-size: 14px;
        white-space: nowrap;
      }
      .room-switch {
        display: flex;
        cursor: pointer;
      }
      .zone {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 14px;
        padding: 10px 0;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }
      .zone:first-of-type {
        border-top: none;
      }
      .zone .info {
        flex: 1;
        min-width: 160px;
      }
      .zone .name {
        font-weight: 500;
      }
      .muted {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .options {
        margin-top: 12px;
      }
      .field-select {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .btn-group {
        display: inline-flex;
        align-self: flex-start;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        overflow: hidden;
      }
      .btn-group button {
        min-height: 0;
        padding: 6px 14px;
        border-radius: 0;
        background: transparent;
        color: var(--primary-text-color);
      }
      .btn-group button + button {
        border-left: 1px solid var(--divider-color, #ccc);
      }
      .btn-group button.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        cursor: default;
      }
      .zone-mode {
        width: 200px;
      }
      @media (max-width: 600px) {
        .zone-mode {
          width: 100%;
        }
      }
    `
];
He([
  h({ attribute: !1 })
], ve.prototype, "hass", 2);
He([
  h({ attribute: !1 })
], ve.prototype, "rooms", 2);
He([
  l()
], ve.prototype, "_zones", 2);
He([
  l()
], ve.prototype, "_enabledLocal", 2);
He([
  l()
], ve.prototype, "_loaded", 2);
He([
  l()
], ve.prototype, "_busy", 2);
He([
  l()
], ve.prototype, "_roomBusy", 2);
ve = He([
  $("homex-climate-dashboard")
], ve);
var Da = Object.defineProperty, Ta = Object.getOwnPropertyDescriptor, le = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ta(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && Da(t, s, r), r;
};
const Ia = "170";
let G = class extends b {
  constructor() {
    super(...arguments), this.narrow = !1, this._rooms = null, this._error = null, this._createOpen = !1, this._exportOpen = !1, this._menuOpen = !1, this._dashTab = localStorage.getItem("homex_dash_tab") === "climate" ? "climate" : "general", this._expanded = localStorage.getItem("homex_expanded") || null, this._loaded = !1, this._onToggleExpand = (e) => {
      const t = e.detail.entry_id;
      this._expanded = this._expanded === t ? null : t, this._expanded ? localStorage.setItem("homex_expanded", this._expanded) : localStorage.removeItem("homex_expanded");
    }, this._reload = async () => {
      try {
        this._rooms = await Je(this.hass), this._error = null;
      } catch (e) {
        this._error = v(e);
      }
    }, this._backToRooms = () => ce(this._prefix), this._onOpenSwitchAdd = (e) => {
      const t = e.detail?.room_id;
      I(
        B(this._prefix, "switches", "switches", "new") + (t ? `?room=${encodeURIComponent(t)}` : "")
      );
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener(Tt, this._reload), this.addEventListener("homex-toggle-expand", this._onToggleExpand);
  }
  disconnectedCallback() {
    this.removeEventListener(Tt, this._reload), this.removeEventListener("homex-toggle-expand", this._onToggleExpand), super.disconnectedCallback();
  }
  /** Sub-page path segments: [] (rooms), ["switches", ...], ["shutters", ...]. */
  get _segs() {
    return ye(this.route?.path);
  }
  get _view() {
    const e = this._segs[0];
    return e === "switches" || e === "shutters" || e === "climate" ? e : "rooms";
  }
  get _prefix() {
    return this.route?.prefix || "/homex";
  }
  updated(e) {
    if (e.has("hass") && this.hass && !this._loaded && (this._loaded = !0, Br().then(() => this.requestUpdate()), this._reload()), this._segs[0] === "heating") {
      I(B(this._prefix, "climate", ...this._segs), !0);
      return;
    }
    const t = e.get("route");
    t && this._loaded && this._view === "rooms" && ye(t.path).length && this._reload();
  }
  /** General (rooms) and, once a room has the Climate module, Climate tabs. */
  _renderDashboard(e) {
    if (!(this._rooms ?? []).some((r) => (r.modules ?? []).includes("heating"))) return e;
    const s = this._dashTab, i = (r) => {
      this._dashTab = r;
      try {
        localStorage.setItem("homex_dash_tab", r);
      } catch {
      }
    };
    return n`
      <div class="dash-tabs">
        <span class="dash-tab ${s === "general" ? "active" : ""}" @click=${() => i("general")}
          >General</span
        >
        <span class="dash-tab ${s === "climate" ? "active" : ""}" @click=${() => i("climate")}
          >Climate</span
        >
      </div>
      ${s === "climate" ? n`<homex-climate-dashboard
            .hass=${this.hass}
            .rooms=${this._rooms ?? []}
          ></homex-climate-dashboard>` : e}
    `;
  }
  _toggleSidebar() {
    this.dispatchEvent(
      new Event("hass-toggle-menu", { bubbles: !0, composed: !0 })
    );
  }
  _roomCard(e) {
    return n`<homex-room-card
      .hass=${this.hass}
      .room=${e}
      .expanded=${e.entry_id === this._expanded}
    ></homex-room-card>`;
  }
  // Split rooms: unlinked/no-floor first, then one group per floor (by level).
  _grouped() {
    const e = [], t = /* @__PURE__ */ new Map();
    for (const i of this._rooms || []) {
      const o = (i.area_id ? this.hass.areas?.[i.area_id] : null)?.floor_id;
      o && this.hass.floors?.[o] ? (t.get(o) ?? t.set(o, []).get(o)).push(i) : e.push(i);
    }
    const s = [...t.keys()].map((i) => this.hass.floors[i]).sort(
      (i, r) => (i.level ?? 0) - (r.level ?? 0) || i.name.localeCompare(r.name)
    );
    return { ungrouped: e, floors: s, byFloor: t };
  }
  render() {
    let e;
    if (this._error)
      e = n`<div class="msg err">Erreur : ${this._error}</div>`;
    else if (!this._rooms)
      e = n`<div class="msg">Chargement…</div>`;
    else if (!this._rooms.length)
      e = n`<div class="msg">
        Aucune pièce. Clique sur <strong>＋ Nouvelle pièce</strong> en haut à
        droite pour en créer une.
      </div>`;
    else {
      const { ungrouped: t, floors: s, byFloor: i } = this._grouped();
      e = n`
        ${t.map((r) => this._roomCard(r))}
        ${s.map(
        (r) => n`
            <div class="floor-header">
              ${r.icon ? n`<ha-icon .icon=${r.icon}></ha-icon>` : ""}
              <span>${r.name}</span>
            </div>
            ${(i.get(r.floor_id) || []).map(
          (o) => this._roomCard(o)
        )}
          `
      )}
      `;
    }
    return this._view === "switches" ? n`
        <div class="wrap">
          <homex-switch-manager
            .hass=${this.hass}
            .base=${B(this._prefix, "switches")}
            .subpath=${this._segs.slice(1).join("/")}
            @close=${this._backToRooms}
          ></homex-switch-manager>
        </div>
      ` : this._view === "climate" ? n`
        <div class="wrap">
          <homex-climate-manager
            .hass=${this.hass}
            .base=${B(this._prefix, "climate")}
            .subpath=${this._segs.slice(1).join("/")}
            @close=${this._backToRooms}
          ></homex-climate-manager>
        </div>
      ` : this._view === "shutters" ? n`
        <div class="wrap">
          <homex-shutter-manager
            .hass=${this.hass}
            .base=${B(this._prefix, "shutters")}
            .subpath=${this._segs.slice(1).join("/")}
            @close=${this._backToRooms}
          ></homex-shutter-manager>
        </div>
      ` : n`
      <div class="wrap" @open-switch-add=${this._onOpenSwitchAdd}>
        <header>
          <div class="title">
            ${this.narrow ? n`<button
                  class="menu-btn"
                  title="Menu"
                  @click=${this._toggleSidebar}
                >
                  <svg viewBox="0 0 24 24"><path d=${Fi}></path></svg>
                </button>` : ""}
            <h1>Homex <span class="ver">v${Ia}</span></h1>
          </div>
          <div class="header-actions">
            <button class="primary" @click=${() => this._createOpen = !0}>
              ＋ Nouvelle pièce
            </button>
            <div class="menu-wrap">
              <button
                class="kebab"
                title="Menu"
                @click=${() => this._menuOpen = !this._menuOpen}
              >
                ⋮
              </button>
              ${this._menuOpen ? n`
                    <div
                      class="menu-backdrop"
                      @click=${() => this._menuOpen = !1}
                    ></div>
                    <div class="menu">
                      <button
                        @click=${() => {
      this._menuOpen = !1, this._reload();
    }}
                      >
                        <svg class="ico" viewBox="0 0 24 24"><path d=${Gi}></path></svg>
                        Rafraîchir
                      </button>
                      <button
                        ?disabled=${!this._rooms?.length}
                        @click=${() => {
      this._menuOpen = !1, this._exportOpen = !0;
    }}
                      >
                        <svg class="ico" viewBox="0 0 24 24"><path d=${Ti}></path></svg>
                        Exporter
                      </button>
                      <div class="menu-sep"></div>
                      <button
                        @click=${() => {
      this._menuOpen = !1, I(B(this._prefix, "switches"));
    }}
                      >
                        🎛 Switch Manager
                      </button>
                      <button
                        @click=${() => {
      this._menuOpen = !1, I(B(this._prefix, "shutters"));
    }}
                      >
                        🪟 Shutter Manager
                      </button>
                      <button
                        @click=${() => {
      this._menuOpen = !1, I(B(this._prefix, "climate"));
    }}
                      >
                        🌡 Climate Manager
                      </button>
                    </div>
                  ` : ""}
            </div>
          </div>
        </header>
        ${this._renderDashboard(e)}
      </div>
      <homex-room-dialog
        .hass=${this.hass}
        .room=${null}
        .open=${this._createOpen}
        @dialog-closed=${() => this._createOpen = !1}
      ></homex-room-dialog>
      <homex-export-dialog
        .rooms=${this._rooms || []}
        .open=${this._exportOpen}
        @dialog-closed=${() => this._exportOpen = !1}
      ></homex-export-dialog>
    `;
  }
};
G.styles = y`
    .wrap {
      max-width: 1000px;
      margin: 0 auto;
      padding: 16px;
      color: var(--primary-text-color);
    }
    header {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px 12px;
      margin-bottom: 16px;
    }
    .title {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1 1 auto;
    }
    /* HA hides its sidebar on narrow screens: panels must offer the toggle. */
    .menu-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      margin-left: -8px;
      border-radius: 50%;
      background: transparent;
    }
    .menu-btn svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }
    h1 {
      font-size: 22px;
      font-weight: 500;
      margin: 0;
    }
    .ver {
      font-size: 12px;
      font-weight: 400;
      color: var(--secondary-text-color);
      vertical-align: middle;
    }
    .header-actions {
      display: flex;
      gap: 8px;
      margin-left: auto;
    }
    .header-actions button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }
    .ico {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }
    @media (max-width: 600px) {
      .wrap {
        padding: 12px;
      }
      /* Icon-only secondary actions to fit a phone width. */
      .lbl {
        display: none;
      }
    }
    button {
      cursor: pointer;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      background: var(--secondary-background-color, #f0f0f0);
      color: var(--primary-text-color);
    }
    button.primary {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    button:disabled {
      opacity: 0.5;
      cursor: default;
    }
    .menu-wrap {
      position: relative;
    }
    .kebab {
      padding: 8px 12px;
      font-size: 18px;
      line-height: 1;
    }
    .menu-backdrop {
      position: fixed;
      inset: 0;
      z-index: 30;
    }
    .menu {
      position: absolute;
      top: 44px;
      right: 0;
      z-index: 31;
      min-width: 200px;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.22);
      padding: 6px;
      display: flex;
      flex-direction: column;
    }
    .menu button {
      text-align: left;
      background: transparent;
      border-radius: 8px;
    }
    .menu button:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }
    .menu button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .menu-sep {
      height: 1px;
      margin: 4px 6px;
      background: var(--divider-color, #e0e0e0);
    }
    .dash-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }
    .dash-tab {
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .dash-tab.active {
      color: var(--primary-color);
      border-bottom: 2px solid var(--primary-color);
      margin-bottom: -1px;
    }
    .floor-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 22px 0 10px;
      padding-bottom: 6px;
      border-bottom: 2px solid var(--divider-color, #e0e0e0);
      font-size: 16px;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .floor-header ha-icon {
      color: var(--secondary-text-color);
    }
    .msg {
      padding: 24px;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .msg.err {
      color: var(--error-color, #db4437);
    }
    a {
      color: var(--primary-color);
    }
  `;
le([
  h({ attribute: !1 })
], G.prototype, "hass", 2);
le([
  h({ attribute: !1 })
], G.prototype, "narrow", 2);
le([
  h({ attribute: !1 })
], G.prototype, "route", 2);
le([
  h({ attribute: !1 })
], G.prototype, "panel", 2);
le([
  l()
], G.prototype, "_rooms", 2);
le([
  l()
], G.prototype, "_error", 2);
le([
  l()
], G.prototype, "_createOpen", 2);
le([
  l()
], G.prototype, "_exportOpen", 2);
le([
  l()
], G.prototype, "_menuOpen", 2);
le([
  l()
], G.prototype, "_dashTab", 2);
le([
  l()
], G.prototype, "_expanded", 2);
G = le([
  $("homex-panel")
], G);
export {
  G as HomexPanel
};
