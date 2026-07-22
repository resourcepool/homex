/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Te = globalThis, Ze = Te.ShadowRoot && (Te.ShadyCSS === void 0 || Te.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ye = Symbol(), rt = /* @__PURE__ */ new WeakMap();
let At = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== Ye) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (Ze && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = rt.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && rt.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Kt = (e) => new At(typeof e == "string" ? e : e + "", void 0, Ye), k = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, o, r) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + e[r + 1], e[0]);
  return new At(s, e, Ye);
}, Zt = (e, t) => {
  if (Ze) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const i = document.createElement("style"), o = Te.litNonce;
    o !== void 0 && i.setAttribute("nonce", o), i.textContent = s.cssText, e.appendChild(i);
  }
}, at = Ze ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const i of t.cssRules) s += i.cssText;
  return Kt(s);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Yt, defineProperty: Jt, getOwnPropertyDescriptor: Xt, getOwnPropertyNames: Qt, getOwnPropertySymbols: es, getPrototypeOf: ts } = Object, Re = globalThis, nt = Re.trustedTypes, ss = nt ? nt.emptyScript : "", is = Re.reactiveElementPolyfillSupport, Ae = (e, t) => e, Ie = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? ss : null;
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
} }, Je = (e, t) => !Yt(e, t), lt = { attribute: !0, type: String, converter: Ie, reflect: !1, useDefault: !1, hasChanged: Je };
Symbol.metadata ??= Symbol("metadata"), Re.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let xe = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = lt) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const i = Symbol(), o = this.getPropertyDescriptor(t, i, s);
      o !== void 0 && Jt(this.prototype, t, o);
    }
  }
  static getPropertyDescriptor(t, s, i) {
    const { get: o, set: r } = Xt(this.prototype, t) ?? { get() {
      return this[s];
    }, set(a) {
      this[s] = a;
    } };
    return { get: o, set(a) {
      const l = o?.call(this);
      r?.call(this, a), this.requestUpdate(t, l, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? lt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Ae("elementProperties"))) return;
    const t = ts(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Ae("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Ae("properties"))) {
      const s = this.properties, i = [...Qt(s), ...es(s)];
      for (const o of i) this.createProperty(o, s[o]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const s = litPropertyMetadata.get(t);
      if (s !== void 0) for (const [i, o] of s) this.elementProperties.set(i, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const o = this._$Eu(s, i);
      o !== void 0 && this._$Eh.set(o, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const s = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const o of i) s.unshift(at(o));
    } else t !== void 0 && s.push(at(t));
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
    return Zt(t, this.constructor.elementStyles), t;
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
    const i = this.constructor.elementProperties.get(t), o = this.constructor._$Eu(t, i);
    if (o !== void 0 && i.reflect === !0) {
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : Ie).toAttribute(s, i.type);
      this._$Em = t, r == null ? this.removeAttribute(o) : this.setAttribute(o, r), this._$Em = null;
    }
  }
  _$AK(t, s) {
    const i = this.constructor, o = i._$Eh.get(t);
    if (o !== void 0 && this._$Em !== o) {
      const r = i.getPropertyOptions(o), a = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : Ie;
      this._$Em = o;
      const l = a.fromAttribute(s, r.type);
      this[o] = l ?? this._$Ej?.get(o) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, s, i, o = !1, r) {
    if (t !== void 0) {
      const a = this.constructor;
      if (o === !1 && (r = this[t]), i ??= a.getPropertyOptions(t), !((i.hasChanged ?? Je)(r, s) || i.useDefault && i.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(a._$Eu(t, i)))) return;
      this.C(t, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, s, { useDefault: i, reflect: o, wrapped: r }, a) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, a ?? s ?? this[t]), r !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (s = void 0), this._$AL.set(t, s)), o === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
        for (const [o, r] of this._$Ep) this[o] = r;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [o, r] of i) {
        const { wrapped: a } = r, l = this[o];
        a !== !0 || this._$AL.has(o) || l === void 0 || this.C(o, void 0, r, l);
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
xe.elementStyles = [], xe.shadowRootOptions = { mode: "open" }, xe[Ae("elementProperties")] = /* @__PURE__ */ new Map(), xe[Ae("finalized")] = /* @__PURE__ */ new Map(), is?.({ ReactiveElement: xe }), (Re.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Xe = globalThis, ct = (e) => e, je = Xe.trustedTypes, dt = je ? je.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Ct = "$lit$", ie = `lit$${Math.random().toFixed(9).slice(2)}$`, Et = "?" + ie, os = `<${Et}>`, ce = document, Ce = () => ce.createComment(""), Ee = (e) => e === null || typeof e != "object" && typeof e != "function", Qe = Array.isArray, rs = (e) => Qe(e) || typeof e?.[Symbol.iterator] == "function", Ue = `[ 	
\f\r]`, ke = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, pt = /-->/g, ht = />/g, ae = RegExp(`>|${Ue}(?:([^\\s"'>=/]+)(${Ue}*=${Ue}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ut = /'/g, _t = /"/g, Pt = /^(?:script|style|textarea|title)$/i, Lt = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), n = Lt(1), b = Lt(2), de = Symbol.for("lit-noChange"), A = Symbol.for("lit-nothing"), gt = /* @__PURE__ */ new WeakMap(), le = ce.createTreeWalker(ce, 129);
function Ot(e, t) {
  if (!Qe(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return dt !== void 0 ? dt.createHTML(t) : t;
}
const as = (e, t) => {
  const s = e.length - 1, i = [];
  let o, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = ke;
  for (let l = 0; l < s; l++) {
    const d = e[l];
    let p, m, u = -1, _ = 0;
    for (; _ < d.length && (a.lastIndex = _, m = a.exec(d), m !== null); ) _ = a.lastIndex, a === ke ? m[1] === "!--" ? a = pt : m[1] !== void 0 ? a = ht : m[2] !== void 0 ? (Pt.test(m[2]) && (o = RegExp("</" + m[2], "g")), a = ae) : m[3] !== void 0 && (a = ae) : a === ae ? m[0] === ">" ? (a = o ?? ke, u = -1) : m[1] === void 0 ? u = -2 : (u = a.lastIndex - m[2].length, p = m[1], a = m[3] === void 0 ? ae : m[3] === '"' ? _t : ut) : a === _t || a === ut ? a = ae : a === pt || a === ht ? a = ke : (a = ae, o = void 0);
    const g = a === ae && e[l + 1].startsWith("/>") ? " " : "";
    r += a === ke ? d + os : u >= 0 ? (i.push(p), d.slice(0, u) + Ct + d.slice(u) + ie + g) : d + ie + (u === -2 ? l : g);
  }
  return [Ot(e, r + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class Pe {
  constructor({ strings: t, _$litType$: s }, i) {
    let o;
    this.parts = [];
    let r = 0, a = 0;
    const l = t.length - 1, d = this.parts, [p, m] = as(t, s);
    if (this.el = Pe.createElement(p, i), le.currentNode = this.el.content, s === 2 || s === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (o = le.nextNode()) !== null && d.length < l; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const u of o.getAttributeNames()) if (u.endsWith(Ct)) {
          const _ = m[a++], g = o.getAttribute(u).split(ie), x = /([.?@])?(.*)/.exec(_);
          d.push({ type: 1, index: r, name: x[2], strings: g, ctor: x[1] === "." ? ls : x[1] === "?" ? cs : x[1] === "@" ? ds : Ve }), o.removeAttribute(u);
        } else u.startsWith(ie) && (d.push({ type: 6, index: r }), o.removeAttribute(u));
        if (Pt.test(o.tagName)) {
          const u = o.textContent.split(ie), _ = u.length - 1;
          if (_ > 0) {
            o.textContent = je ? je.emptyScript : "";
            for (let g = 0; g < _; g++) o.append(u[g], Ce()), le.nextNode(), d.push({ type: 2, index: ++r });
            o.append(u[_], Ce());
          }
        }
      } else if (o.nodeType === 8) if (o.data === Et) d.push({ type: 2, index: r });
      else {
        let u = -1;
        for (; (u = o.data.indexOf(ie, u + 1)) !== -1; ) d.push({ type: 7, index: r }), u += ie.length - 1;
      }
      r++;
    }
  }
  static createElement(t, s) {
    const i = ce.createElement("template");
    return i.innerHTML = t, i;
  }
}
function fe(e, t, s = e, i) {
  if (t === de) return t;
  let o = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const r = Ee(t) ? void 0 : t._$litDirective$;
  return o?.constructor !== r && (o?._$AO?.(!1), r === void 0 ? o = void 0 : (o = new r(e), o._$AT(e, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = o : s._$Cl = o), o !== void 0 && (t = fe(e, o._$AS(e, t.values), o, i)), t;
}
class ns {
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
    const { el: { content: s }, parts: i } = this._$AD, o = (t?.creationScope ?? ce).importNode(s, !0);
    le.currentNode = o;
    let r = le.nextNode(), a = 0, l = 0, d = i[0];
    for (; d !== void 0; ) {
      if (a === d.index) {
        let p;
        d.type === 2 ? p = new ye(r, r.nextSibling, this, t) : d.type === 1 ? p = new d.ctor(r, d.name, d.strings, this, t) : d.type === 6 && (p = new ps(r, this, t)), this._$AV.push(p), d = i[++l];
      }
      a !== d?.index && (r = le.nextNode(), a++);
    }
    return le.currentNode = ce, o;
  }
  p(t) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, s), s += i.strings.length - 2) : i._$AI(t[s])), s++;
  }
}
class ye {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, s, i, o) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t, this._$AB = s, this._$AM = i, this.options = o, this._$Cv = o?.isConnected ?? !0;
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
    t = fe(this, t, s), Ee(t) ? t === A || t == null || t === "" ? (this._$AH !== A && this._$AR(), this._$AH = A) : t !== this._$AH && t !== de && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : rs(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== A && Ee(this._$AH) ? this._$AA.nextSibling.data = t : this.T(ce.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: s, _$litType$: i } = t, o = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Pe.createElement(Ot(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === o) this._$AH.p(s);
    else {
      const r = new ns(o, this), a = r.u(this.options);
      r.p(s), this.T(a), this._$AH = r;
    }
  }
  _$AC(t) {
    let s = gt.get(t.strings);
    return s === void 0 && gt.set(t.strings, s = new Pe(t)), s;
  }
  k(t) {
    Qe(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, o = 0;
    for (const r of t) o === s.length ? s.push(i = new ye(this.O(Ce()), this.O(Ce()), this, this.options)) : i = s[o], i._$AI(r), o++;
    o < s.length && (this._$AR(i && i._$AB.nextSibling, o), s.length = o);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const i = ct(t).nextSibling;
      ct(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class Ve {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, s, i, o, r) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t, this.name = s, this._$AM = o, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = A;
  }
  _$AI(t, s = this, i, o) {
    const r = this.strings;
    let a = !1;
    if (r === void 0) t = fe(this, t, s, 0), a = !Ee(t) || t !== this._$AH && t !== de, a && (this._$AH = t);
    else {
      const l = t;
      let d, p;
      for (t = r[0], d = 0; d < r.length - 1; d++) p = fe(this, l[i + d], s, d), p === de && (p = this._$AH[d]), a ||= !Ee(p) || p !== this._$AH[d], p === A ? t = A : t !== A && (t += (p ?? "") + r[d + 1]), this._$AH[d] = p;
    }
    a && !o && this.j(t);
  }
  j(t) {
    t === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class ls extends Ve {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === A ? void 0 : t;
  }
}
class cs extends Ve {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== A);
  }
}
class ds extends Ve {
  constructor(t, s, i, o, r) {
    super(t, s, i, o, r), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = fe(this, t, s, 0) ?? A) === de) return;
    const i = this._$AH, o = t === A && i !== A || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== A && (i === A || o);
    o && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class ps {
  constructor(t, s, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    fe(this, t);
  }
}
const hs = { I: ye }, us = Xe.litHtmlPolyfillSupport;
us?.(Pe, ye), (Xe.litHtmlVersions ??= []).push("3.3.3");
const _s = (e, t, s) => {
  const i = s?.renderBefore ?? t;
  let o = i._$litPart$;
  if (o === void 0) {
    const r = s?.renderBefore ?? null;
    i._$litPart$ = o = new ye(t.insertBefore(Ce(), r), r, void 0, s ?? {});
  }
  return o._$AI(e), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const et = globalThis;
let f = class extends xe {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = _s(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return de;
  }
};
f._$litElement$ = !0, f.finalized = !0, et.litElementHydrateSupport?.({ LitElement: f });
const gs = et.litElementPolyfillSupport;
gs?.({ LitElement: f });
(et.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const S = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ms = { attribute: !0, type: String, converter: Ie, reflect: !1, hasChanged: Je }, vs = (e = ms, t, s) => {
  const { kind: i, metadata: o } = s;
  let r = globalThis.litPropertyMetadata.get(o);
  if (r === void 0 && globalThis.litPropertyMetadata.set(o, r = /* @__PURE__ */ new Map()), i === "setter" && ((e = Object.create(e)).wrapped = !0), r.set(s.name, e), i === "accessor") {
    const { name: a } = s;
    return { set(l) {
      const d = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(a, d, e, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(a, void 0, e, l), l;
    } };
  }
  if (i === "setter") {
    const { name: a } = s;
    return function(l) {
      const d = this[a];
      t.call(this, l), this.requestUpdate(a, d, e, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function h(e) {
  return (t, s) => typeof s == "object" ? vs(e, t, s) : ((i, o, r) => {
    const a = o.hasOwnProperty(r);
    return o.constructor.createProperty(r, i), a ? Object.getOwnPropertyDescriptor(o, r) : void 0;
  })(e, t, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function c(e) {
  return h({ ...e, state: !0, attribute: !1 });
}
const Ge = "homex-changed", J = (e) => e.dispatchEvent(new CustomEvent(Ge, { bubbles: !0, composed: !0 })), Mt = async (e) => (await e.callWS({ type: "homex/layouts" })).layouts || [], xs = (e, t) => e.callWS({ type: "homex/layout/save", layout: t }), fs = (e, t) => e.callWS({ type: "homex/layout/delete", layout_id: t }), Ht = async (e) => (await e.callWS({ type: "homex/switches" })).switches || [], Dt = (e, t, s = !1) => e.callWS({ type: "homex/switch/save", switch: t, create: s }), bs = (e, t) => e.callWS({ type: "homex/switch/remove", switch_id: t }), zt = async (e) => (await e.callWS({ type: "homex/presets" })).presets || [], ys = (e, t) => e.callWS({ type: "homex/preset/save", preset: t }), $s = (e, t) => e.callWS({ type: "homex/preset/delete", preset_id: t }), ws = async (e) => (await e.callWS({ type: "homex/switch_models" })).models || [], Tt = async (e) => (await e.callWS({ type: "homex/switch_devices" })).devices || [], ks = async (e) => (await e.callWS({ type: "homex/shutter_models" })).models || [], Ss = async (e) => (await e.callWS({ type: "homex/shutter_presets" })).presets || [], As = (e, t) => e.callWS({ type: "homex/shutter_preset/save", preset: t }), Cs = (e, t) => e.callWS({ type: "homex/shutter_preset/delete", preset_id: t }), tt = async (e) => (await e.callWS({ type: "homex/rooms" })).rooms || [], Es = (e, t) => e.callWS({ type: "homex/room/create", ...t }), Ps = (e, t, s = !0) => e.callWS({ type: "homex/room/delete", entry_id: t, delete_scenes: s }), Ls = (e, t, s) => e.callWS({ type: "homex/shutter_group/add", entry_id: t, name: s }), Os = (e, t) => e.callWS({ type: "homex/shutter_group/update", ...t }), Ms = (e, t, s) => e.callWS({ type: "homex/shutter_group/delete", entry_id: t, group_id: s }), It = async (e, t) => (await e.callWS({ type: "homex/device_triggers", device_id: t })).triggers || [], jt = (e, t) => e.callWS({ type: "homex/room/update", ...t }), Hs = (e, t) => e.callWS({ type: "homex/room/sync_labels", entry_id: t }), Ds = (e, t, s) => e.callWS({ type: "homex/room/dim", entry_id: t, delta: s }), zs = (e, t) => e.callWS({ type: "homex/group/add", ...t }), Ts = (e, t) => e.callWS({ type: "homex/group/update", ...t }), Is = (e, t, s) => e.callWS({ type: "homex/group/delete", entry_id: t, group_id: s }), mt = (e, t, s, i, o) => e.callWS({
  type: "homex/scene/add",
  entry_id: t,
  name: s,
  ...i ? { attach: i } : {},
  ...o ? { triggers: o } : {}
}), js = (e, t, s) => e.callWS({ type: "homex/scene/delete", entry_id: t, key: s }), Ns = (e, t, s) => e.callWS({ type: "homex/scene/reorder", entry_id: t, order: s }), Rs = (e, t) => e.callWS({ type: "homex/scene/next", entry_id: t }), Vs = (e, t, s, i, o) => e.callWS({
  type: "homex/scene/rename",
  entry_id: t,
  key: s,
  name: i,
  ...o ? { triggers: o } : {}
}), $ = (e) => e && (e.message || e.code) || String(e);
let ze = null;
const vt = () => !!customElements.get("ha-entities-picker");
function Bs() {
  return vt() ? Promise.resolve(!0) : ze || (ze = (async () => {
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
    return vt();
  })(), ze);
}
var Us = "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z", qs = "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z", Fs = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z", Gs = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z", xt = "M3 6H21V4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H7V18H3V6M13 12H9V13.78C8.39 14.33 8 15.11 8 16C8 16.89 8.39 17.67 9 18.22V20H13V18.22C13.61 17.67 14 16.88 14 16S13.61 14.33 13 13.78V12M11 17.5C10.17 17.5 9.5 16.83 9.5 16S10.17 14.5 11 14.5 12.5 15.17 12.5 16 11.83 17.5 11 17.5M22 8H16C15.5 8 15 8.5 15 9V19C15 19.5 15.5 20 16 20H22C22.5 20 23 19.5 23 19V9C23 8.5 22.5 8 22 8M21 18H17V10H21V18Z", Ws = "M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z", Ks = "M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z", Zs = "M12,2C9.76,2 7.78,3.05 6.5,4.68L7.93,6.11C8.84,4.84 10.32,4 12,4A5,5 0 0,1 17,9C17,10.68 16.16,12.16 14.89,13.06L16.31,14.5C17.94,13.21 19,11.24 19,9A7,7 0 0,0 12,2M3.28,4L2,5.27L5.04,8.3C5,8.53 5,8.76 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H14.73L18.73,22L20,20.72L3.28,4M7.23,10.5L12.73,16H10V13.58C8.68,13 7.66,11.88 7.23,10.5M9,20V21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9Z", Ys = "M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63Z", Js = "M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z", Xs = "M19,13H5V11H19V13Z", Qs = "M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z", ei = "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z", ti = "M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z", Nt = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z", ft = "M11,13.5V21.5H3V13.5H11M12,2L17.5,11H6.5L12,2M17.5,13C20,13 22,15 22,17.5C22,20 20,22 17.5,22C15,22 13,20 13,17.5C13,15 15,13 17.5,13Z", si = "M7.5,2C5.71,3.15 4.5,5.18 4.5,7.5C4.5,9.82 5.71,11.85 7.53,13C4.46,13 2,10.54 2,7.5A5.5,5.5 0 0,1 7.5,2M19.07,3.5L20.5,4.93L4.93,20.5L3.5,19.07L19.07,3.5M12.89,5.93L11.41,5L9.97,6L10.39,4.3L9,3.24L10.75,3.12L11.33,1.47L12,3.1L13.73,3.13L12.38,4.26L12.89,5.93M9.59,9.54L8.43,8.81L7.31,9.59L7.65,8.27L6.56,7.44L7.92,7.35L8.37,6.06L8.88,7.33L10.24,7.36L9.19,8.23L9.59,9.54M19,13.5A5.5,5.5 0 0,1 13.5,19C12.28,19 11.15,18.6 10.24,17.93L17.93,10.24C18.6,11.15 19,12.28 19,13.5M14.6,20.08L17.37,18.93L17.13,22.28L14.6,20.08M18.93,17.38L20.08,14.61L22.28,17.15L18.93,17.38M20.08,12.42L18.94,9.64L22.28,9.88L20.08,12.42M9.63,18.93L12.4,20.08L9.87,22.27L9.63,18.93Z";
function We(e, t) {
  const s = (e.devices || {})[t];
  return s ? `${s.manufacturer || ""}|${s.model || s.model_id || ""}` : "";
}
function Ke(e, t) {
  const s = (e.devices || {})[t];
  return s ? [s.manufacturer, s.model || s.model_id].filter(Boolean).join(" ") || "modèle inconnu" : "";
}
function Rt(e, t, s) {
  const i = We(e, s);
  return i ? t.filter((o) => o.model === i) : [];
}
function st(e, t, s) {
  const i = Rt(e, t, s.device_id);
  if (s.preset_id) {
    const o = i.find((r) => r.id === s.preset_id);
    if (o) return o;
  }
  return i[0];
}
const z = k`
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
var ii = Object.defineProperty, oi = Object.getOwnPropertyDescriptor, _e = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? oi(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && ii(t, s, o), o;
};
let ee = class extends f {
  constructor() {
    super(...arguments), this.hideToggle = !1;
  }
  _isOn(e) {
    return this.hass.states[e]?.state === "on";
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
    const e = this.unit, t = this._isOn(e.switch);
    return n`
      <div class="controls">
        ${this.hideToggle ? "" : n`<button
              class="bulb ${t ? "on" : ""}"
              title=${t ? "Éteindre" : "Allumer"}
              @click=${this._toggle}
            >
              <svg viewBox="0 0 24 24">
                <path d=${t ? Ks : Js}></path>
              </svg>
            </button>`}
        ${this.areaIcon ? n`<ha-icon class="area-icon" .icon=${this.areaIcon}></ha-icon>` : ""}
        <div class="title">
          <div class="line1">
            <strong>${e.name}</strong>
            ${t && this.activeScene ? n`<span class="active-scene">${this.activeScene}</span>` : ""}
          </div>
          <div class="line2">
            <span class="rid">${e.group_id || e.room_id}</span>
            ${this.floorName ? n`<span class="floor">${this.floorName}</span>` : ""}
          </div>
        </div>
      </div>
    `;
  }
};
ee.styles = [
  z,
  k`
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
        --mdc-icon-size: 22px;
        color: var(--secondary-text-color);
      }
      .title {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
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
        gap: 8px;
      }
      strong {
        font-size: 17px;
      }
      .group strong {
        font-size: 15px;
        font-weight: 500;
      }
      .active-scene {
        font-size: 12px;
        font-weight: 500;
        color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 14%, transparent);
        border-radius: 12px;
        padding: 2px 10px;
      }
      .rid {
        font-size: 12px;
        color: var(--secondary-text-color);
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
_e([
  h({ attribute: !1 })
], ee.prototype, "hass", 2);
_e([
  h({ attribute: !1 })
], ee.prototype, "unit", 2);
_e([
  h({ attribute: !1 })
], ee.prototype, "areaIcon", 2);
_e([
  h({ attribute: !1 })
], ee.prototype, "floorName", 2);
_e([
  h({ attribute: !1 })
], ee.prototype, "activeScene", 2);
_e([
  h({ type: Boolean })
], ee.prototype, "hideToggle", 2);
ee = _e([
  S("homex-unit-controls")
], ee);
const X = (e, t, s, i = "") => customElements.get("ha-textfield") ? n`<ha-textfield
      outlined
      .label=${e}
      .value=${t ?? ""}
      .placeholder=${i}
      @input=${(o) => s(o.target.value)}
    ></ha-textfield>` : n`<div class="field">
    <span>${e}</span>
    <input
      .value=${t ?? ""}
      placeholder=${i}
      @input=${(o) => s(o.target.value)}
    />
  </div>`, ri = /[̀-ͯ]/g, K = (e) => (e || "").normalize("NFD").replace(ri, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
var ai = Object.defineProperty, ni = Object.getOwnPropertyDescriptor, it = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? ni(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && ai(t, s, o), o;
};
let Le = class extends f {
  constructor() {
    super(...arguments), this.open = !1, this.heading = "";
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
Le.styles = k`
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
  `;
it([
  h({ type: Boolean })
], Le.prototype, "open", 2);
it([
  h()
], Le.prototype, "heading", 2);
Le = it([
  S("homex-dialog")
], Le);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const li = { CHILD: 2 }, Vt = (e) => (...t) => ({ _$litDirective$: e, values: t });
let Bt = class {
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
const { I: ci } = hs, bt = (e) => e, yt = () => document.createComment(""), Se = (e, t, s) => {
  const i = e._$AA.parentNode, o = t === void 0 ? e._$AB : t._$AA;
  if (s === void 0) {
    const r = i.insertBefore(yt(), o), a = i.insertBefore(yt(), o);
    s = new ci(r, a, e, e.options);
  } else {
    const r = s._$AB.nextSibling, a = s._$AM, l = a !== e;
    if (l) {
      let d;
      s._$AQ?.(e), s._$AM = e, s._$AP !== void 0 && (d = e._$AU) !== a._$AU && s._$AP(d);
    }
    if (r !== o || l) {
      let d = s._$AA;
      for (; d !== r; ) {
        const p = bt(d).nextSibling;
        bt(i).insertBefore(d, o), d = p;
      }
    }
  }
  return s;
}, ne = (e, t, s = e) => (e._$AI(t, s), e), di = {}, Ut = (e, t = di) => e._$AH = t, pi = (e) => e._$AH, qe = (e) => {
  e._$AR(), e._$AA.remove();
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $t = (e, t, s) => {
  const i = /* @__PURE__ */ new Map();
  for (let o = t; o <= s; o++) i.set(e[o], o);
  return i;
}, hi = Vt(class extends Bt {
  constructor(e) {
    if (super(e), e.type !== li.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(e, t, s) {
    let i;
    s === void 0 ? s = t : t !== void 0 && (i = t);
    const o = [], r = [];
    let a = 0;
    for (const l of e) o[a] = i ? i(l, a) : a, r[a] = s(l, a), a++;
    return { values: r, keys: o };
  }
  render(e, t, s) {
    return this.dt(e, t, s).values;
  }
  update(e, [t, s, i]) {
    const o = pi(e), { values: r, keys: a } = this.dt(t, s, i);
    if (!Array.isArray(o)) return this.ut = a, r;
    const l = this.ut ??= [], d = [];
    let p, m, u = 0, _ = o.length - 1, g = 0, x = r.length - 1;
    for (; u <= _ && g <= x; ) if (o[u] === null) u++;
    else if (o[_] === null) _--;
    else if (l[u] === a[g]) d[g] = ne(o[u], r[g]), u++, g++;
    else if (l[_] === a[x]) d[x] = ne(o[_], r[x]), _--, x--;
    else if (l[u] === a[x]) d[x] = ne(o[u], r[x]), Se(e, d[x + 1], o[u]), u++, x--;
    else if (l[_] === a[g]) d[g] = ne(o[_], r[g]), Se(e, o[u], o[_]), _--, g++;
    else if (p === void 0 && (p = $t(a, g, x), m = $t(l, u, _)), p.has(l[u])) if (p.has(l[_])) {
      const v = m.get(a[g]), we = v !== void 0 ? o[v] : null;
      if (we === null) {
        const re = Se(e, o[u]);
        ne(re, r[g]), d[g] = re;
      } else d[g] = ne(we, r[g]), Se(e, o[u], we), o[v] = null;
      g++;
    } else qe(o[_]), _--;
    else qe(o[u]), u++;
    for (; g <= x; ) {
      const v = Se(e, d[x + 1]);
      ne(v, r[g]), d[g++] = v;
    }
    for (; u <= _; ) {
      const v = o[u++];
      v !== null && qe(v);
    }
    return this.ut = a, Ut(e, d), de;
  }
});
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ui = Vt(class extends Bt {
  constructor() {
    super(...arguments), this.key = A;
  }
  render(e, t) {
    return this.key = e, t;
  }
  update(e, [t, s]) {
    return t !== this.key && (Ut(e), this.key = t), s;
  }
});
var _i = Object.defineProperty, gi = Object.getOwnPropertyDescriptor, ge = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? gi(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && _i(t, s, o), o;
};
let te = class extends f {
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
    const s = t ? this.value.map((i, o) => o === e ? t : i) : this.value.filter((i, o) => o !== e);
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
        ${hi(
      this.value,
      (e) => e,
      (e, t) => this._nativePicker(
        e,
        this.value.filter((s, i) => i !== t),
        (s) => this._setAt(t, s)
      )
    )}
        ${ui(
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
te.styles = k`
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
ge([
  h({ attribute: !1 })
], te.prototype, "hass", 2);
ge([
  h({ type: Array })
], te.prototype, "value", 2);
ge([
  h({ attribute: !1 })
], te.prototype, "includeDomains", 2);
ge([
  h({ attribute: !1 })
], te.prototype, "includeEntities", 2);
ge([
  c()
], te.prototype, "_query", 2);
ge([
  c()
], te.prototype, "_open", 2);
te = ge([
  S("homex-entity-picker")
], te);
const mi = ["light", "switch", "input_boolean"], wt = [
  "binary_sensor",
  "switch",
  "input_boolean",
  "person",
  "device_tracker"
];
var vi = Object.defineProperty, xi = Object.getOwnPropertyDescriptor, Oe = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? xi(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && vi(t, s, o), o;
};
let pe = class extends f {
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
pe.styles = k`
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
Oe([
  h({ attribute: !1 })
], pe.prototype, "hass", 2);
Oe([
  h()
], pe.prototype, "value", 2);
Oe([
  c()
], pe.prototype, "_query", 2);
Oe([
  c()
], pe.prototype, "_open", 2);
pe = Oe([
  S("homex-device-field")
], pe);
var fi = Object.defineProperty, bi = Object.getOwnPropertyDescriptor, Me = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? bi(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && fi(t, s, o), o;
};
let he = class extends f {
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
        const t = await It(this.hass, e);
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
    ], i = new Set(s.includes(t) ? ["on", "off"] : []), o = this.hass.states[e]?.state;
    return o && !["unavailable", "unknown", ""].includes(o) && i.add(o), [...i];
  }
  _setKey(e, t, s, i) {
    const o = { ...t };
    i === "" || i === null || i === void 0 ? delete o[s] : o[s] = i, this._update(e, o);
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
    const s = this._entityOf(e), i = (r) => this._setEntity(t, e, r);
    if (customElements.get("ha-entity-picker"))
      return n`<ha-entity-picker
        .hass=${this.hass}
        .value=${s}
        .includeDomains=${wt}
        allow-custom-entity
        @value-changed=${(r) => {
        r.stopPropagation(), i(r.detail.value || "");
      }}
      ></ha-entity-picker>`;
    const o = Object.keys(this.hass.states).filter((r) => wt.includes(r.split(".")[0])).sort();
    return n`<select class="native" @change=${(r) => i(r.target.value)}>
      <option value="">Sélectionnez une entité</option>
      ${o.map(
      (r) => n`<option value=${r} ?selected=${r === s}>
          ${this.hass.states[r]?.attributes?.friendly_name || r}
        </option>`
    )}
    </select>`;
  }
  _entityTypeField(e, t) {
    const s = this._entityType(e);
    return n`<label class="field"><span>Type</span>
      <select
        class="native"
        @change=${(i) => this._setEntityType(t, e, i.target.value)}
      >
        <option value="state" ?selected=${s === "state"}>État</option>
        <option value="numeric" ?selected=${s === "numeric"}>État numérique</option>
      </select>
    </label>`;
  }
  _attrField(e, t) {
    const s = this._entityOf(e), i = Object.keys(this.hass.states[s]?.attributes || {}), o = e.attribute || "";
    return n`<label class="field"><span>Attribut (facultatif)</span>
      <select
        class="native"
        @change=${(r) => this._setKey(t, e, "attribute", r.target.value)}
      >
        <option value="" ?selected=${!o}>(état de l'entité)</option>
        ${i.map((r) => n`<option value=${r} ?selected=${r === o}>${r}</option>`)}
      </select>
    </label>`;
  }
  _stateValueField(e, t, s, i) {
    const o = this._entityOf(e), r = e[s] != null ? String(e[s]) : "", a = `st-${t}-${s}`;
    return n`<label class="field"><span>${i}</span>
      <input
        class="native"
        list=${a}
        .value=${r}
        @change=${(l) => this._setKey(t, e, s, l.target.value)}
      />
      <datalist id=${a}>
        ${this._entityStates(o).map((l) => n`<option value=${l}></option>`)}
      </datalist>
    </label>`;
  }
  _numField(e, t, s, i) {
    const o = e[s] != null ? String(e[s]) : "";
    return n`<label class="field"><span>${i}</span>
      <input
        class="native"
        type="number"
        .value=${o}
        @change=${(r) => {
      const a = r.target.value;
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
    const o = this._forParts(e);
    o[s] = isNaN(i) || i < 0 ? 0 : Math.floor(i);
    const r = o.h + o.m + o.s;
    this._setKey(
      t,
      e,
      "for",
      r ? { hours: o.h, minutes: o.m, seconds: o.s } : ""
    );
  }
  _forField(e, t) {
    const s = this._forParts(e), i = (o, r, a) => n`<input
      type="number"
      min="0"
      placeholder=${a}
      .value=${r ? String(r) : ""}
      @change=${(l) => this._setForPart(e, t, o, Number(l.target.value))}
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
    return n`<select
      class="native"
      @change=${(o) => {
      const r = Number(o.target.value), a = (this._devTriggers[e.device_id] || [])[r];
      a && this._update(t, { ...a.trigger });
    }}
    >
      <option value="-1" ?selected=${i < 0}>Sélectionnez une action</option>
      ${s.map(
      (o, r) => n`<option value=${r} ?selected=${r === i}>${o.label}</option>`
    )}
    </select>`;
  }
  _card(e, t) {
    const s = !!e?.device_id || e?.platform === "device";
    return n`<div class="card">
      <div class="head">
        <svg viewBox="0 0 24 24"><path d=${s ? xt : ft}></path></svg>
        <span class="title">${s ? "Appareil" : "Entité"}</span>
        <button class="icon-btn" title="Supprimer" @click=${() => this._remove(t)}>
          <svg viewBox="0 0 24 24"><path d=${Fs}></path></svg>
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
          <svg viewBox="0 0 24 24"><path d=${Nt}></path></svg>
          Ajouter un déclencheur
        </button>
        ${this._menuOpen ? n`
              <div class="backdrop" @click=${() => this._menuOpen = !1}></div>
              <div class="menu">
                <button @click=${() => this._add("entity")}>
                  <svg viewBox="0 0 24 24"><path d=${ft}></path></svg> Entité
                </button>
                <button @click=${() => this._add("device")}>
                  <svg viewBox="0 0 24 24"><path d=${xt}></path></svg> Appareil
                </button>
              </div>
            ` : ""}
      </div>
    `;
  }
};
he.styles = k`
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
    select.native,
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
    input.native:focus,
    select.native:focus {
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
Me([
  h({ attribute: !1 })
], he.prototype, "hass", 2);
Me([
  h({ attribute: !1 })
], he.prototype, "value", 2);
Me([
  c()
], he.prototype, "_menuOpen", 2);
Me([
  c()
], he.prototype, "_devTriggers", 2);
he = Me([
  S("homex-trigger-selector")
], he);
var yi = Object.defineProperty, $i = Object.getOwnPropertyDescriptor, qt = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? $i(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && yi(t, s, o), o;
};
let Ne = class extends f {
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
Ne.styles = k`
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
qt([
  h({ attribute: !1 })
], Ne.prototype, "triggers", 2);
Ne = qt([
  S("homex-managed-triggers")
], Ne);
var wi = Object.defineProperty, ki = Object.getOwnPropertyDescriptor, B = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? ki(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && wi(t, s, o), o;
};
let T = class extends f {
  constructor() {
    super(...arguments), this.open = !1, this.group = null, this._name = "", this._id = "", this._devices = [], this._triggers = [], this._dim = !1, this._dimUp = [], this._dimDown = [], this._busy = !1, this._idEdited = !1;
  }
  willUpdate(e) {
    e.has("open") && this.open && (this._name = this.group?.name ?? "", this._id = this.group?.group_id ?? "", this._devices = this.group?.devices ?? [], this._triggers = (this.group?.triggers ?? []).map((t) => ({ ...t })), this._dim = this.group?.dim ?? !1, this._dimUp = (this.group?.dim_up_triggers ?? []).map((t) => ({ ...t })), this._dimDown = (this.group?.dim_down_triggers ?? []).map((t) => ({ ...t })), this._busy = !1, this._idEdited = !!this.group);
  }
  _onName(e) {
    this._name = e, this._idEdited || (this._id = K(e));
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
      this.group ? await Ts(this.hass, {
        entry_id: this.room.entry_id,
        group_id: this.group.group_id,
        name: e,
        devices: this._devices,
        triggers: s,
        ...i
      }) : await zs(this.hass, {
        entry_id: this.room.entry_id,
        group_id: t,
        name: e,
        devices: this._devices,
        triggers: s,
        ...i
      }), J(this), this._close();
    } catch (o) {
      this._busy = !1, alert("Erreur Homex : " + $(o));
    }
  }
  async _delete() {
    if (this.group && confirm(`Supprimer le groupe "${this.group.group_id}" ?`)) {
      this._busy = !0;
      try {
        await Is(this.hass, this.room.entry_id, this.group.group_id), J(this), this._close();
      } catch (e) {
        this._busy = !1, alert("Erreur Homex : " + $(e));
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
        ${X("Nom", this._name, (t) => this._onName(t), "Table de chevet L")}
        ${e ? n`<div class="section">Id : ${this.group.group_id}</div>` : X("Id", this._id, (t) => this._onId(t), "bedside_l")}
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
T.styles = [
  z,
  k`
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
B([
  h({ attribute: !1 })
], T.prototype, "hass", 2);
B([
  h({ type: Boolean })
], T.prototype, "open", 2);
B([
  h({ attribute: !1 })
], T.prototype, "room", 2);
B([
  h({ attribute: !1 })
], T.prototype, "group", 2);
B([
  c()
], T.prototype, "_name", 2);
B([
  c()
], T.prototype, "_id", 2);
B([
  c()
], T.prototype, "_devices", 2);
B([
  c()
], T.prototype, "_triggers", 2);
B([
  c()
], T.prototype, "_dim", 2);
B([
  c()
], T.prototype, "_dimUp", 2);
B([
  c()
], T.prototype, "_dimDown", 2);
B([
  c()
], T.prototype, "_busy", 2);
T = B([
  S("homex-group-dialog")
], T);
var Si = Object.defineProperty, Ai = Object.getOwnPropertyDescriptor, He = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Ai(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && Si(t, s, o), o;
};
let ue = class extends f {
  constructor() {
    super(...arguments), this._open = !1;
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
          target="_blank"
          rel="noopener"
          title="Éditer la scène « allumé » du groupe"
        >
          <svg viewBox="0 0 24 24"><path d=${Ys}></path></svg>
        </a>
        <a
          class="scene-link"
          href="/config/scene/edit/homex_${e}_turn_off"
          target="_blank"
          rel="noopener"
          title="Éditer la scène « éteint » du groupe"
        >
          <svg viewBox="0 0 24 24"><path d=${Zs}></path></svg>
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
ue.styles = [
  z,
  k`
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
He([
  h({ attribute: !1 })
], ue.prototype, "hass", 2);
He([
  h({ attribute: !1 })
], ue.prototype, "room", 2);
He([
  h({ attribute: !1 })
], ue.prototype, "group", 2);
He([
  c()
], ue.prototype, "_open", 2);
ue = He([
  S("homex-group-row")
], ue);
var Ci = Object.defineProperty, Ei = Object.getOwnPropertyDescriptor, Y = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Ei(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && Ci(t, s, o), o;
};
let V = class extends f {
  constructor() {
    super(...arguments), this.open = !1, this.room = null, this._name = "", this._id = "", this._areaId = "", this._modules = ["lights"], this._devices = [], this._strategy = "recall_first", this._busy = !1, this._idEdited = !1;
  }
  willUpdate(e) {
    e.has("open") && this.open && (this._name = this.room?.name ?? "", this._id = this.room?.room_id ?? "", this._areaId = this.room?.area_id ?? "", this._modules = [...this.room?.modules ?? ["lights"]], this._devices = this.room?.devices ?? [], this._strategy = this.room?.scene_strategy ?? "recall_first", this._busy = !1, this._idEdited = !!this.room);
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
    const o = this._hasModule(e);
    return n`
      <label class="module">
        <span class="module-name">${t} ${s}</span>
        <span class="toggle ${o ? "on" : ""}">
          <input
            type="checkbox"
            .checked=${o}
            @change=${(r) => this._setModule(e, r.target.checked)}
          />
          <span class="knob"></span>
        </span>
      </label>
      <p class="hint">${i}</p>
    `;
  }
  _onName(e) {
    this._name = e, this._idEdited || (this._id = K(e));
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
      this.room ? await jt(this.hass, {
        entry_id: this.room.entry_id,
        name: e,
        room_id: t,
        area_id: s,
        modules: this._modules,
        devices: this._devices,
        scene_strategy: this._strategy
      }) : await Es(this.hass, {
        name: e,
        room_id: t,
        area_id: s,
        modules: this._modules,
        devices: this._devices,
        scene_strategy: this._strategy
      }), J(this), this._close();
    } catch (s) {
      this._busy = !1, alert("Erreur Homex : " + $(s));
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
        ${X("Nom", this._name, (t) => this._onName(t), "Chambre")}
        ${X("Id", this._id, (t) => this._onId(t), "bedroom")}
        <div class="section">Pièce Home Assistant (optionnel)</div>
        <select
          .value=${this._areaId}
          @change=${(t) => this._areaId = t.target.value}
        >
          <option value="">— Aucune —</option>
          ${this._areas.map(
      (t) => n`<option value=${t.area_id}>${t.name}</option>`
    )}
        </select>

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

        ${this._hasModule("lights") ? n`
              <div class="tab">Lights</div>
              <div class="section">Luminaires de la pièce</div>
              <homex-entity-picker
                .hass=${this.hass}
                .includeDomains=${mi}
                .value=${this._devices}
                @value-changed=${(t) => this._devices = t.detail.value}
              ></homex-entity-picker>

              <div class="section">Scene switching strategy</div>
              <select
                .value=${this._strategy}
                @change=${(t) => this._strategy = t.target.value}
              >
                <option value="recall_first">Repart de zéro</option>
                <option value="recall_last">Dernière utilisée</option>
              </select>
              <p class="hint">
                Quand un trigger scene-switching change de scène et que la pièce
                était éteinte : repartir de la première scène, ou reprendre la
                dernière utilisée.
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
V.styles = [
  z,
  k`
      select {
        width: 100%;
        box-sizing: border-box;
        padding: 12px 14px;
        font-size: 15px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        margin: 6px 0;
      }
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
Y([
  h({ attribute: !1 })
], V.prototype, "hass", 2);
Y([
  h({ type: Boolean })
], V.prototype, "open", 2);
Y([
  h({ attribute: !1 })
], V.prototype, "room", 2);
Y([
  c()
], V.prototype, "_name", 2);
Y([
  c()
], V.prototype, "_id", 2);
Y([
  c()
], V.prototype, "_areaId", 2);
Y([
  c()
], V.prototype, "_modules", 2);
Y([
  c()
], V.prototype, "_devices", 2);
Y([
  c()
], V.prototype, "_strategy", 2);
Y([
  c()
], V.prototype, "_busy", 2);
V = Y([
  S("homex-room-dialog")
], V);
var Pi = Object.defineProperty, Li = Object.getOwnPropertyDescriptor, se = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Li(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && Pi(t, s, o), o;
};
let Z = class extends f {
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
      await jt(this.hass, {
        entry_id: this.room.entry_id,
        triggers: this._toggle,
        scene_triggers: this._scene,
        dim_up_triggers: this._dimUp,
        dim_down_triggers: this._dimDown
      }), J(this), this._close();
    } catch (e) {
      this._busy = !1, alert("Erreur Homex : " + $(e));
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
Z.styles = [
  z,
  k`
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
se([
  h({ attribute: !1 })
], Z.prototype, "hass", 2);
se([
  h({ type: Boolean })
], Z.prototype, "open", 2);
se([
  h({ attribute: !1 })
], Z.prototype, "room", 2);
se([
  c()
], Z.prototype, "_toggle", 2);
se([
  c()
], Z.prototype, "_scene", 2);
se([
  c()
], Z.prototype, "_dimUp", 2);
se([
  c()
], Z.prototype, "_dimDown", 2);
se([
  c()
], Z.prototype, "_busy", 2);
Z = se([
  S("homex-triggers-dialog")
], Z);
var Oi = Object.defineProperty, Mi = Object.getOwnPropertyDescriptor, Q = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Mi(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && Oi(t, s, o), o;
};
let F = class extends f {
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
    const t = K(e);
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
        this.scene ? await Vs(
          this.hass,
          this.room.entry_id,
          this.scene.key,
          e,
          this._triggers
        ) : this._mode === "attach" ? await mt(
          this.hass,
          this.room.entry_id,
          e,
          this._attachId,
          this._triggers
        ) : await mt(
          this.hass,
          this.room.entry_id,
          e,
          void 0,
          this._triggers
        ), J(this), this._close();
      } catch (t) {
        this._busy = !1, alert("Erreur Homex : " + $(t));
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
        ${X("Nom de la scène", this._name, (i) => this._name = i, "Nuit")}
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
            <select
              .value=${this._attachId}
              @change=${(e) => this._onPickScene(e.target.value)}
            >
              <option value="">— Choisir une scène —</option>
              ${this._availableScenes.map(
      (e) => n`<option value=${e.config_id}>${e.name}</option>`
    )}
            </select>
          `}
    `;
  }
};
F.styles = [
  z,
  k`
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
      select {
        width: 100%;
        box-sizing: border-box;
        padding: 12px 14px;
        font-size: 15px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        margin: 6px 0;
      }
    `
];
Q([
  h({ attribute: !1 })
], F.prototype, "hass", 2);
Q([
  h({ type: Boolean })
], F.prototype, "open", 2);
Q([
  h({ attribute: !1 })
], F.prototype, "room", 2);
Q([
  h({ attribute: !1 })
], F.prototype, "scene", 2);
Q([
  c()
], F.prototype, "_name", 2);
Q([
  c()
], F.prototype, "_mode", 2);
Q([
  c()
], F.prototype, "_attachId", 2);
Q([
  c()
], F.prototype, "_triggers", 2);
Q([
  c()
], F.prototype, "_busy", 2);
F = Q([
  S("homex-scene-dialog")
], F);
var Hi = Object.defineProperty, Di = Object.getOwnPropertyDescriptor, G = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Di(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && Hi(t, s, o), o;
};
let j = class extends f {
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
      t || (t = (await Ls(
        this.hass,
        this.room.entry_id,
        e
      ))?.group_id), await Os(this.hass, {
        entry_id: this.room.entry_id,
        group_id: t,
        name: e,
        devices: this._devices,
        toggle_triggers: this._toggle,
        open_triggers: this._openT,
        close_triggers: this._close,
        stop_triggers: this._stop
      }), J(this), this._close_();
    } catch (t) {
      this._busy = !1, alert("Erreur Homex : " + $(t));
    }
  }
  async _delete() {
    if (this.group && confirm(`Supprimer le groupe de volets "${this.group.name}" ?`)) {
      this._busy = !0;
      try {
        await Ms(this.hass, this.room.entry_id, this.group.id), J(this), this._close_();
      } catch (e) {
        this._busy = !1, alert("Erreur Homex : " + $(e));
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
        ${X("Nom", this._name, (s) => this._name = s, "Salon")}
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
j.styles = [
  z,
  k`
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
G([
  h({ attribute: !1 })
], j.prototype, "hass", 2);
G([
  h({ type: Boolean })
], j.prototype, "open", 2);
G([
  h({ attribute: !1 })
], j.prototype, "room", 2);
G([
  h({ attribute: !1 })
], j.prototype, "group", 2);
G([
  c()
], j.prototype, "_name", 2);
G([
  c()
], j.prototype, "_devices", 2);
G([
  c()
], j.prototype, "_toggle", 2);
G([
  c()
], j.prototype, "_openT", 2);
G([
  c()
], j.prototype, "_close", 2);
G([
  c()
], j.prototype, "_stop", 2);
G([
  c()
], j.prototype, "_busy", 2);
j = G([
  S("homex-shutter-group-dialog")
], j);
var zi = Object.defineProperty, Ti = Object.getOwnPropertyDescriptor, W = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Ti(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && zi(t, s, o), o;
};
const Ii = {
  lights: "💡 Lights",
  shutters: "🪟 Shutters"
}, ji = {
  single: "Simple",
  double: "Double",
  long: "Long"
};
function Fe(e) {
  return e.kind === "group" ? `group:${e.group_id}` : e.kind === "scene" ? `scene:${e.scene_key}` : e.kind.startsWith("shutter_") ? `${e.kind}:${e.group_id}` : e.kind;
}
let N = class extends f {
  constructor() {
    super(...arguments), this.open = !1, this.layout = null, this.taps = {}, this._rooms = [], this._mappings = {}, this._tapTab = "single", this._dragId = "", this._dropBtn = null, this._busy = !1;
  }
  willUpdate(e) {
    e.has("open") && this.open && (this._mappings = JSON.parse(JSON.stringify(this.sw?.mappings ?? {})), this._tapTab = this._enabledModes()[0] ?? "single", this._busy = !1, this._dragId = "", this._loadRooms());
  }
  async _loadRooms() {
    try {
      const e = await tt(this.hass), t = new Set(this.sw?.rooms ?? []);
      this._rooms = e.filter((s) => t.has(s.room_id));
    } catch {
      this._rooms = [];
    }
  }
  get _multi() {
    return this._rooms.length > 1;
  }
  /** Homex actions for one room (mirrors the Déclencheurs menu). */
  _actionsForRoom(e) {
    const t = (i, o, r, a, l) => ({
      id: `${e.room_id}::${Fe(l)}`,
      room_id: e.room_id,
      room_name: e.name,
      module: i,
      label: o,
      clabel: r,
      short: a,
      action: l
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
    return this._itemById(`${e.room}::${Fe(e.action)}`);
  }
  /** Action ids already assigned to any button/tap mode on this switch. */
  _usedIds() {
    const e = /* @__PURE__ */ new Set();
    for (const t of Object.values(this._mappings))
      for (const s of Object.values(t))
        e.add(`${s.room}::${Fe(s.action)}`);
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
    const s = this._itemById(this._dragId);
    s && (this._mappings = {
      ...this._mappings,
      [e]: {
        ...this._mappings[e] ?? {},
        [t]: { room: s.room_id, action: s.action }
      }
    }, this._dragId = "");
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
      await Dt(this.hass, { ...this.sw, mappings: this._mappings }), this._close();
    } catch (e) {
      this._busy = !1, alert("Erreur Homex : " + $(e));
    }
  }
  _trunc(e, t) {
    return e.length > t ? e.slice(0, t - 1) + "…" : e;
  }
  _actionRow(e, t) {
    return n`<div
      class="act ${t.has(e.id) ? "used" : ""}"
      draggable="true"
      @dragstart=${() => this._dragId = e.id}
      @dragend=${() => {
      this._dragId = "", this._dropBtn = null;
    }}
    >
      <span class="badge">${e.short}</span>
      <span>${e.label}</span>
    </div>`;
  }
  _canvas(e) {
    const t = this.layout;
    if (!t) return n`<p class="hint">Layout introuvable pour ce modèle.</p>`;
    const s = t.bounds, i = t.shape === "round", o = `mapclip-${t.id}`, r = i ? b`<ellipse cx=${s.x + s.w / 2} cy=${s.y + s.h / 2} rx=${s.w / 2} ry=${s.h / 2}></ellipse>` : b`<rect x=${s.x} y=${s.y} width=${s.w} height=${s.h} rx="0.4"></rect>`, a = i ? b`<ellipse class="sh" cx=${s.x + s.w / 2} cy=${s.y + s.h / 2} rx=${s.w / 2} ry=${s.h / 2}></ellipse>` : b`<rect class="sh" x=${s.x} y=${s.y} width=${s.w} height=${s.h} rx="0.4"></rect>`, l = new Set(this._buttonsFor(e)), d = (_) => (t.positions || []).find((g) => g.n === _), p = s.x + s.w / 2, m = s.y + s.h / 2, u = (_, g) => i ? [p + (_ - p) * 0.82, m + (g - m) * 0.82] : [_, g];
    return n`<svg class="canvas" viewBox="-10 -10 20 20">
      <defs><clipPath id=${o}>${r}</clipPath></defs>
      ${a}
      ${(t.zones || []).map((_) => {
      const g = l.has(_.n), x = this._mappings[e]?.[_.n], v = x ? this._itemForValue(x) : void 0, we = (g ? x ? "zone assigned" : "zone" : "zone disabled") + (g && this._dropBtn === _.n ? " drop" : ""), re = d(_.n), [De, me] = u(
        re ? re.x : _.x + _.w / 2,
        re ? re.y : _.y + _.h / 2
      ), ot = b`<rect class=${we} x=${_.x} y=${_.y} width=${_.w} height=${_.h}
          clip-path="url(#${o})"
          @dragover=${(Wt) => {
        g && (Wt.preventDefault(), this._dropBtn = _.n);
      }}
          @dragleave=${() => {
        this._dropBtn === _.n && (this._dropBtn = null);
      }}
          @drop=${() => {
        g && this._assign(e, _.n), this._dropBtn = null;
      }}
          @click=${() => g && x && this._clear(e, _.n)}></rect>`;
      if (!x || !v)
        return b`${ot}<text class="bn" x=${De} y=${me}>${_.n}</text>`;
      const Ft = this._multi ? me - 1.2 : me - 0.8, Gt = this._multi ? me - 0.1 : me + 0.4;
      return b`${ot}
          <text class="ic" x=${De} y=${Ft}>${v.short}</text>
          <text class="lb" x=${De} y=${Gt}>${this._trunc(v.clabel, 12)}</text>
          ${this._multi ? b`<text class="rm" x=${De} y=${me + 0.9}>${this._trunc(v.room_name, 12)}</text>` : ""}`;
    })}
    </svg>`;
  }
  _invisibleTray(e) {
    const t = this._invisibleButtons(e);
    return t.length ? n`<div class="tray">
      <span class="tray-label">Boutons invisibles</span>
      ${t.map((s) => {
      const i = this._mappings[e]?.[s], o = i ? this._itemForValue(i) : void 0;
      return n`<div
          class="ichip ${i ? "assigned" : ""} ${this._dropBtn === s ? "drop" : ""}"
          @dragover=${(r) => {
        r.preventDefault(), this._dropBtn = s;
      }}
          @dragleave=${() => {
        this._dropBtn === s && (this._dropBtn = null);
      }}
          @drop=${() => {
        this._assign(e, s), this._dropBtn = null;
      }}
          @click=${() => i && this._clear(e, s)}
        >
          <span class="ichip-n">${s}</span>
          ${o ? n`<span class="ichip-a"
                >${o.short} ${this._trunc(o.clabel, 12)}${this._multi ? ` · ${o.room_name}` : ""}</span
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
      ([i, o]) => n`
                        ${this._multi ? n`<p class="room-head">🏠 ${i.name}</p>` : ""}
                        ${o.map(
        ([r, a]) => n`
                            <p class="mod-head">${Ii[r] ?? r}</p>
                            ${a.map((l) => this._actionRow(l, s))}
                          `
      )}
                      `
    )}
            <p class="hint">
              Glisse une action sur un bouton du canvas. Clique un bouton assigné
              pour le vider.
            </p>
          </div>
          <div class="right">
            ${e.length ? n`<div class="tabs">
                    ${e.map(
      (i) => n`<span
                        class="tab ${i === t ? "active" : ""}"
                        @click=${() => this._tapTab = i}
                        >${ji[i]}</span
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
N.styles = [
  z,
  k`
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
W([
  h({ attribute: !1 })
], N.prototype, "hass", 2);
W([
  h({ type: Boolean })
], N.prototype, "open", 2);
W([
  h({ attribute: !1 })
], N.prototype, "sw", 2);
W([
  h({ attribute: !1 })
], N.prototype, "layout", 2);
W([
  h({ attribute: !1 })
], N.prototype, "taps", 2);
W([
  c()
], N.prototype, "_rooms", 2);
W([
  c()
], N.prototype, "_mappings", 2);
W([
  c()
], N.prototype, "_tapTab", 2);
W([
  c()
], N.prototype, "_dragId", 2);
W([
  c()
], N.prototype, "_dropBtn", 2);
W([
  c()
], N.prototype, "_busy", 2);
N = W([
  S("homex-switch-mapping")
], N);
var Ni = Object.defineProperty, Ri = Object.getOwnPropertyDescriptor, L = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Ri(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && Ni(t, s, o), o;
};
let C = class extends f {
  constructor() {
    super(...arguments), this.expanded = !1, this._dialog = "", this._menuOpen = !1, this._renameScene = null, this._deleteScenes = !0, this._deleting = !1, this._syncing = !1, this._activeTab = "", this._gswitches = [], this._presets = [], this._layouts = [], this._mappingSwitch = null, this._shutterGroupOpen = !1, this._shutterGroupEdit = null, this._close = () => this._dialog = "", this._delete = () => {
      this._menuOpen = !1, this._deleteScenes = !0, this._dialog = "delete";
    }, this._confirmDelete = async () => {
      this._deleting = !0;
      try {
        await Ps(this.hass, this.room.entry_id, this._deleteScenes), this._dialog = "", J(this);
      } catch (e) {
        alert("Erreur Homex : " + $(e));
      } finally {
        this._deleting = !1;
      }
    }, this._syncLabels = async () => {
      this._menuOpen = !1, this._syncing = !0;
      try {
        const e = await Hs(this.hass, this.room.entry_id);
        alert(
          `Synchronisé : ${e.updated} entité(s) (area + labels), ${e.scenes_renamed} scène(s) renommée(s).`
        );
      } catch (e) {
        alert("Erreur Homex : " + $(e));
      } finally {
        this._syncing = !1;
      }
    }, this._sceneNext = async (e) => {
      e?.stopPropagation();
      try {
        await Rs(this.hass, this.room.entry_id);
      } catch (t) {
        alert("Erreur Homex : " + $(t));
      }
    }, this._dim = async (e, t) => {
      t?.stopPropagation();
      try {
        await Ds(this.hass, this.room.entry_id, e);
      } catch (s) {
        alert("Erreur Homex : " + $(s));
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
  _openHa(e) {
    window.open(`/config/scene/edit/${e.config_id}`, "_blank", "noopener");
  }
  async _deleteScene(e) {
    if (confirm(`Supprimer la scène "${e.name}" ?`))
      try {
        await js(this.hass, this.room.entry_id, e.key), J(this);
      } catch (t) {
        alert("Erreur Homex : " + $(t));
      }
  }
  async _sceneMoved(e) {
    const { oldIndex: t, newIndex: s } = e.detail, i = this.room.scenes.filter((r) => r.orderable).map((r) => r.key), [o] = i.splice(t, 1);
    i.splice(s, 0, o);
    try {
      await Ns(this.hass, this.room.entry_id, i), J(this);
    } catch (r) {
      alert("Erreur Homex : " + $(r));
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
              <svg viewBox="0 0 24 24"><path d=${Ws}></path></svg>
            </span>` : n`<span class="pin" title="Toujours en dernier">
              <svg viewBox="0 0 24 24"><path d=${ti}></path></svg>
            </span>`}
        <span class="scene-name">${e.name}</span>
        ${e.key === t ? n`<span class="active-tag">active</span>` : ""}
        <span class="btn-group">
          ${this._iconBtn(
      Qs,
      "Voir dans Home Assistant",
      () => this._openHa(e)
    )}
          ${this._iconBtn(ei, "Renommer", () => this._renameScene = e)}
          ${this._iconBtn(
      Gs,
      e.removable ? "Supprimer" : "Scène par défaut",
      () => this._deleteScene(e),
      !e.removable
    )}
        </span>
      </div>
    `;
  }
  render() {
    const e = this.room, s = this._isOn() ? this.hass.states[e.switch]?.attributes?.active_scene ?? null : null, i = s ? e.scenes.find((v) => v.key === s)?.name : void 0, o = e.area_id ? this.hass.areas?.[e.area_id] : null, r = o?.icon || void 0, l = (o?.floor_id ? this.hass.floors?.[o.floor_id] : null)?.name || void 0, d = e.scenes.filter((v) => v.orderable), p = e.scenes.filter((v) => !v.orderable), m = e.scenes.some((v) => v.removable), u = e.modules?.includes("lights") ?? !0, _ = e.modules?.includes("switches") ?? !1, g = e.modules?.includes("shutters") ?? !1, x = !!(e.dim_up_triggers?.length || e.dim_down_triggers?.length);
    return n`
      <ha-card>
        <div class="head" @click=${this._toggleExpand} title="Plier / déplier">
          <svg class="chevron" viewBox="0 0 24 24">
            <path d=${this.expanded ? qs : Us}></path>
          </svg>
          <homex-unit-controls
            .hass=${this.hass}
            .unit=${e}
            .areaIcon=${r}
            .floorName=${l}
            .activeScene=${i}
            .hideToggle=${!u}
          ></homex-unit-controls>
          <div class="head-actions">
            ${u && x ? n`
                  <button
                    class="round"
                    title="Baisser la luminosité (−20)"
                    @click=${(v) => this._dim(-20, v)}
                  >
                    <svg viewBox="0 0 24 24"><path d=${Xs}></path></svg>
                  </button>
                  <button
                    class="round"
                    title="Monter la luminosité (+20)"
                    @click=${(v) => this._dim(20, v)}
                  >
                    <svg viewBox="0 0 24 24"><path d=${Nt}></path></svg>
                  </button>
                ` : ""}
            ${u && m ? n`<button
                  class="round"
                  title="Changer de scène"
                  @click=${(v) => this._sceneNext(v)}
                >
                  <svg viewBox="0 0 24 24"><path d=${si}></path></svg>
                </button>` : ""}
            <button
              class="kebab"
              title="Actions"
              @click=${(v) => {
      v.stopPropagation(), this._menuOpen = !0;
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
                ${u ? n`
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

        ${u ? n`
              <div class="module-title">Lights</div>
              <div class="stats">
                <span class="stat">🔌 ${e.devices.length} lumière(s)</span>
                <span class="stat">🎬 ${e.scenes.length} scène(s)</span>
                ${e.groups.length ? n`<span class="stat">📦 ${e.groups.length} groupe(s)</span>` : ""}
              </div>
            ` : ""}
        ${_ ? n`
              <div class="module-title">Switches</div>
              <div class="stats">
                <span class="stat">🎛 ${this._roomSwitches().length} interrupteur(s)</span>
                <span class="stat">⚡ ${this._switchActionCount(e)} action(s)</span>
              </div>
            ` : ""}
        ${g ? n`
              <div class="module-title">Shutters</div>
              <div class="stats">
                <span class="stat">📦 ${(e.shutter_groups ?? []).length} groupe(s)</span>
                <span class="stat">🪟 ${this._shutterCount(e)} volet(s)</span>
              </div>
            ` : ""}
        ${this.expanded ? this._renderBody(
      e,
      s,
      d,
      p,
      u,
      _,
      g
    ) : ""}
      </ha-card>

      ${this._renderDialogs(e)}
    `;
  }
  _renderBody(e, t, s, i, o, r, a) {
    const l = [];
    if (o && l.push({ key: "lights", label: "Lights" }), r && l.push({ key: "switches", label: "Switches" }), a && l.push({ key: "shutters", label: "Shutters" }), !l.length)
      return n`<div class="empty-body">Aucun module actif sur cette pièce.</div>`;
    const d = l.some((p) => p.key === this._activeTab) ? this._activeTab : l[0].key;
    return n`
      <div class="tabs">
        ${l.map(
      (p) => n`<span
            class="tab ${p.key === d ? "active" : ""}"
            @click=${() => this._activeTab = p.key}
            >${p.label}</span
          >`
    )}
      </div>
      <div class="tab-panel">
        ${d === "lights" ? this._renderLightsTab(e, t, s, i) : d === "switches" ? this._renderSwitchesTab(e) : this._renderShuttersTab(e)}
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
        <div>${s.map((o) => this._sceneRow(o, t))}</div>
      </ha-sortable>
      ${i.map((o) => this._sceneRow(o, t))}

      ${e.groups.length ? n`
            <div class="section-row">
              <span class="section">Groupes</span>
              <button @click=${() => this._pick("addgroup")}>＋ Groupe</button>
            </div>
            <div class="groups">
              ${e.groups.map(
      (o) => n`<homex-group-row
                  .hass=${this.hass}
                  .room=${e}
                  .group=${o}
                ></homex-group-row>`
    )}
            </div>
          ` : ""}
    `;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSwitchData();
  }
  async _loadSwitchData() {
    try {
      [this._gswitches, this._presets, this._layouts] = await Promise.all([
        Ht(this.hass),
        zt(this.hass),
        Mt(this.hass)
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
    return st(this.hass, this._presets, e);
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
  _renderDialogs(e) {
    return n`
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
C.styles = [
  z,
  k`
      ha-card {
        position: relative;
        padding: 16px;
        margin-bottom: 16px;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }
      .chevron {
        flex: 0 0 auto;
        width: 24px;
        height: 24px;
        fill: var(--secondary-text-color);
      }
      homex-unit-controls {
        flex: 1;
      }
      .head-actions {
        display: flex;
        align-items: center;
        gap: 4px;
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
        cursor: default;
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
      }
      .switch-meta {
        font-size: 12px;
        color: var(--secondary-text-color);
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
L([
  h({ attribute: !1 })
], C.prototype, "hass", 2);
L([
  h({ attribute: !1 })
], C.prototype, "room", 2);
L([
  h({ type: Boolean })
], C.prototype, "expanded", 2);
L([
  c()
], C.prototype, "_dialog", 2);
L([
  c()
], C.prototype, "_menuOpen", 2);
L([
  c()
], C.prototype, "_renameScene", 2);
L([
  c()
], C.prototype, "_deleteScenes", 2);
L([
  c()
], C.prototype, "_deleting", 2);
L([
  c()
], C.prototype, "_syncing", 2);
L([
  c()
], C.prototype, "_activeTab", 2);
L([
  c()
], C.prototype, "_gswitches", 2);
L([
  c()
], C.prototype, "_presets", 2);
L([
  c()
], C.prototype, "_layouts", 2);
L([
  c()
], C.prototype, "_mappingSwitch", 2);
L([
  c()
], C.prototype, "_shutterGroupOpen", 2);
L([
  c()
], C.prototype, "_shutterGroupEdit", 2);
C = L([
  S("homex-room-card")
], C);
var Vi = Object.defineProperty, Bi = Object.getOwnPropertyDescriptor, Be = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Bi(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && Vi(t, s, o), o;
};
const kt = (e) => '"' + String(e).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
function Ui(e) {
  const t = ["google_assistant:", "  entity_config:"];
  e.length || (t[1] = "  entity_config: {}");
  for (const s of e)
    t.push(`    ${s.switch}:`), t.push(`      name: ${kt(s.name)}`), t.push("      expose: true"), t.push(`      room: ${kt(s.name)}`);
  return t.join(`
`) + `
`;
}
let be = class extends f {
  constructor() {
    super(...arguments), this.open = !1, this.rooms = [], this._copied = !1;
  }
  get _yaml() {
    return Ui(this.rooms);
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
be.styles = [
  z,
  k`
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
Be([
  h({ type: Boolean })
], be.prototype, "open", 2);
Be([
  h({ attribute: !1 })
], be.prototype, "rooms", 2);
Be([
  c()
], be.prototype, "_copied", 2);
be = Be([
  S("homex-export-dialog")
], be);
var qi = Object.defineProperty, Fi = Object.getOwnPropertyDescriptor, O = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Fi(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && qi(t, s, o), o;
};
const ve = 20, St = 0.5;
let E = class extends f {
  constructor() {
    super(...arguments), this.layout = null, this._name = "", this._id = "", this._buttons = 2, this._shape = "round", this._bounds = { x: 5, y: 5, w: 10, h: 10 }, this._columns = 2, this._rows = 1, this._colLines = [], this._rowLines = [], this._assignments = [], this._busy = !1, this._dragClient = null, this._hoverCell = -1, this._overTray = !1, this._idEdited = !1, this._drag = null, this._onUp = () => {
      const e = this._drag;
      if (e?.kind === "num") {
        const t = [...this._assignments];
        this._hoverCell >= 0 ? (e.fromCell >= 0 ? [t[e.fromCell], t[this._hoverCell]] = [t[this._hoverCell], t[e.fromCell]] : t[this._hoverCell] = e.button, this._assignments = t) : this._overTray && e.fromCell >= 0 && (t[e.fromCell] = 0, this._assignments = t);
      }
      this._drag = null, this._dragClient = null, this._hoverCell = -1, this._overTray = !1, window.removeEventListener("pointermove", this._onMove), window.removeEventListener("pointerup", this._onUp);
    }, this._onMove = (e) => {
      const t = this._drag;
      if (!t) return;
      if (t.kind === "num") {
        this._dragClient = { x: e.clientX, y: e.clientY }, this._hitTest(e.clientX, e.clientY);
        return;
      }
      const { x: s, y: i } = this._svgPoint(e), o = this._bounds;
      if (t.kind === "col") {
        const r = [...this._colLines];
        r[t.index] = Math.min(Math.max(s, o.x), o.x + o.w), this._colLines = r;
      } else if (t.kind === "row") {
        const r = [...this._rowLines];
        r[t.index] = Math.min(Math.max(i, o.y), o.y + o.h), this._rowLines = r;
      } else if (t.kind === "br") {
        let r = Math.max(2, s - o.x), a = Math.max(2, i - o.y);
        this._shape === "round" && (r = a = Math.max(r, a)), this._bounds = { ...o, w: r, h: a }, this._clampDividers();
      } else if (t.kind === "tl") {
        const r = o.x + o.w, a = o.y + o.h;
        let l = Math.min(s, r - 2), d = Math.min(i, a - 2), p = r - l, m = a - d;
        if (this._shape === "round") {
          const u = Math.max(p, m);
          l = r - u, d = a - u, p = m = u;
        }
        this._bounds = { x: l, y: d, w: p, h: m }, this._clampDividers();
      }
    };
  }
  willUpdate(e) {
    if (e.has("layout")) {
      const t = this.layout;
      this._name = t?.name ?? "", this._id = t?.id ?? "", this._buttons = t?.buttons ?? 2, this._shape = t?.shape ?? "round";
      const s = 10;
      this._bounds = t?.bounds ? { x: t.bounds.x + s, y: t.bounds.y + s, w: t.bounds.w, h: t.bounds.h } : this._defaultBounds(this._shape), this._columns = t?.columns ?? 2, this._rows = t?.rows ?? 1, this._idEdited = !!t, this._busy = !1, this._dragClient = null, this._hoverCell = -1, this._overTray = !1, t && (t.colLines?.length || t.rowLines?.length) ? (this._colLines = (t.colLines ?? []).map((i) => i + s), this._rowLines = (t.rowLines ?? []).map((i) => i + s)) : this._resetDividers(), this._assignments = t?.assignments ? [...t.assignments] : [], this._reconcile();
    }
  }
  _defaultBounds(e) {
    return e === "vrect" ? { x: 7.5, y: 0, w: 5, h: 20 } : { x: 5, y: 5, w: 10, h: 10 };
  }
  _snap(e) {
    return Math.min(ve, Math.max(0, Math.round(e / St) * St));
  }
  _resetDividers() {
    const e = this._bounds, t = Math.max(1, this._columns), s = Math.max(1, this._rows);
    this._colLines = Array.from(
      { length: t - 1 },
      (i, o) => e.x + e.w * (o + 1) / t
    ), this._rowLines = Array.from(
      { length: s - 1 },
      (i, o) => e.y + e.h * (o + 1) / s
    );
  }
  _clampDividers() {
    const e = this._bounds;
    this._colLines = this._colLines.map((t) => Math.min(Math.max(t, e.x), e.x + e.w)), this._rowLines = this._rowLines.map((t) => Math.min(Math.max(t, e.y), e.y + e.h));
  }
  /** Fit the per-cell assignments to the current button count and grid: keep
   * placements that still fit, then place any not-yet-placed button in a free
   * cell. Buttons that don't fit remain unassigned (save is blocked). */
  _reconcile() {
    const e = Math.max(1, this._columns) * Math.max(1, this._rows), t = this._assignments, s = new Array(e).fill(0), i = /* @__PURE__ */ new Set();
    for (let o = 0; o < Math.min(t.length, e); o++) {
      const r = t[o];
      r >= 1 && r <= this._buttons && !i.has(r) && (s[o] = r, i.add(r));
    }
    for (let o = 1; o <= this._buttons; o++)
      if (!i.has(o)) {
        const r = s.indexOf(0);
        r >= 0 && (s[r] = o, i.add(o));
      }
    this._assignments = s;
  }
  _cells() {
    const e = this._bounds, t = Math.max(1, this._columns), s = Math.max(1, this._rows), i = [e.x, ...[...this._colLines].sort((a, l) => a - l), e.x + e.w], o = [e.y, ...[...this._rowLines].sort((a, l) => a - l), e.y + e.h], r = [];
    for (let a = 0; a < s; a++)
      for (let l = 0; l < t; l++) {
        const d = i[l] ?? e.x, p = i[l + 1] ?? e.x + e.w, m = o[a] ?? e.y, u = o[a + 1] ?? e.y + e.h;
        r.push({
          i: a * t + l,
          x: d,
          y: m,
          w: p - d,
          h: u - m,
          cx: (d + p) / 2,
          cy: (m + u) / 2
        });
      }
    return r;
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
    this._name = e, this._idEdited || (this._id = K(e));
  }
  // -- Dragging -----------------------------------------------------------
  _svgPoint(e, t = !0) {
    const i = this.renderRoot.querySelector("svg").getBoundingClientRect(), o = (e.clientX - i.left) / i.width * ve, r = (e.clientY - i.top) / i.height * ve;
    return t ? { x: this._snap(o), y: this._snap(r) } : { x: o, y: r };
  }
  _start(e, t) {
    t.preventDefault(), t.stopPropagation(), this._drag = e, e?.kind === "num" && (this._dragClient = { x: t.clientX, y: t.clientY }, this._hitTest(t.clientX, t.clientY)), window.addEventListener("pointermove", this._onMove), window.addEventListener("pointerup", this._onUp);
  }
  /** Update _hoverCell / _overTray for a client point (num drag targets). */
  _hitTest(e, t) {
    const i = this.renderRoot.querySelector("svg").getBoundingClientRect();
    if (e >= i.left && e <= i.right && t >= i.top && t <= i.bottom) {
      const a = (e - i.left) / i.width * ve, l = (t - i.top) / i.height * ve;
      this._hoverCell = this._cellAt(a, l), this._overTray = !1;
      return;
    }
    const r = this.renderRoot.querySelector(".tray")?.getBoundingClientRect();
    this._overTray = !!(r && e >= r.left && e <= r.right && t >= r.top && t <= r.bottom), this._hoverCell = -1;
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
    const s = 10, o = this._cells().filter((p) => this._assignments[p.i] > 0), r = o.map((p) => ({
      n: this._assignments[p.i],
      x: p.cx - s,
      y: p.cy - s
    })), a = o.map((p) => ({
      n: this._assignments[p.i],
      x: p.x - s,
      y: p.y - s,
      w: p.w,
      h: p.h
    })), l = this._bounds, d = {
      id: t,
      name: e,
      buttons: this._buttons,
      shape: this._shape,
      bounds: { x: l.x - s, y: l.y - s, w: l.w, h: l.h },
      columns: this._columns,
      rows: this._rows,
      colLines: this._colLines.map((p) => p - s),
      rowLines: this._rowLines.map((p) => p - s),
      assignments: this._assignments,
      positions: r,
      zones: a
    };
    this._busy = !0;
    try {
      await xs(this.hass, d), this._close();
    } catch (p) {
      this._busy = !1, alert("Erreur Homex : " + $(p));
    }
  }
  async _delete() {
    if (this.layout && confirm(`Supprimer le layout "${this.layout.name}" ?`)) {
      this._busy = !0;
      try {
        await fs(this.hass, this.layout.id), this._close();
      } catch (e) {
        this._busy = !1, alert("Erreur Homex : " + $(e));
      }
    }
  }
  // -- Render -------------------------------------------------------------
  _renderShape() {
    const e = this._bounds;
    return this._shape === "round" ? b`<ellipse class="shape" cx=${e.x + e.w / 2} cy=${e.y + e.h / 2}
        rx=${e.w / 2} ry=${e.h / 2}></ellipse>` : b`<rect class="shape" x=${e.x} y=${e.y} width=${e.w} height=${e.h}
      rx="0.4"></rect>`;
  }
  /** The contour geometry (no styling) used as the clip mask, so zones don't
   * spill outside a round shape. */
  _shapeClip() {
    const e = this._bounds;
    return this._shape === "round" ? b`<ellipse cx=${e.x + e.w / 2} cy=${e.y + e.h / 2}
        rx=${e.w / 2} ry=${e.h / 2}></ellipse>` : b`<rect x=${e.x} y=${e.y} width=${e.w} height=${e.h} rx="0.4"></rect>`;
  }
  render() {
    const e = this._bounds, t = Array.from({ length: ve + 1 }, (l, d) => d), s = this._cells(), i = this._unassigned(), o = this._drag?.kind === "num" ? this._drag : null, r = o ? o.fromCell : -1, a = o ? this._hoverCell : -1;
    return n`
      <div class="cols">
        <div class="form">
          ${X("Nom", this._name, (l) => this._onName(l), "Rond 2 boutons")}
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
                @change=${(l) => this._setButtons(Number(l.target.value))} />
            </div>
            <div class="field">
              <label>Colonnes</label>
              <input class="num" type="number" min="1" .value=${String(this._columns)}
                @change=${(l) => this._setColumns(Number(l.target.value))} />
            </div>
            <div class="field">
              <label>Lignes</label>
              <input class="num" type="number" min="1" .value=${String(this._rows)}
                @change=${(l) => this._setRows(Number(l.target.value))} />
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

        <div>
          <svg class="canvas" viewBox="0 0 20 20">
            <defs>
              <clipPath id="shapeclip">${this._shapeClip()}</clipPath>
            </defs>
            ${t.map(
      (l) => b`
                <line class="grid-line" x1=${l} y1="0" x2=${l} y2="20"></line>
                <line class="grid-line" x1="0" y1=${l} x2="20" y2=${l}></line>`
    )}
            ${this._renderShape()}
            ${s.map(
      (l) => this._assignments[l.i] > 0 ? b`<rect class="zone" x=${l.x} y=${l.y} width=${l.w} height=${l.h}
                    clip-path="url(#shapeclip)"></rect>` : ""
    )}
            ${a >= 0 && a !== r ? (() => {
      const l = s[a];
      return b`<rect class="cell-hi" x=${l.x} y=${l.y}
                    width=${l.w} height=${l.h} clip-path="url(#shapeclip)"></rect>`;
    })() : ""}
            ${this._colLines.map(
      (l, d) => b`
                <line class="divider" x1=${l} y1=${e.y} x2=${l} y2=${e.y + e.h}
                  clip-path="url(#shapeclip)"></line>
                <line class="divider-hit" x1=${l} y1=${e.y} x2=${l} y2=${e.y + e.h}
                  @pointerdown=${(p) => this._start({ kind: "col", index: d }, p)}></line>`
    )}
            ${this._rowLines.map(
      (l, d) => b`
                <line class="divider" x1=${e.x} y1=${l} x2=${e.x + e.w} y2=${l}
                  clip-path="url(#shapeclip)"></line>
                <line class="divider-hit" x1=${e.x} y1=${l} x2=${e.x + e.w} y2=${l}
                  @pointerdown=${(p) => this._start({ kind: "row", index: d }, p)}></line>`
    )}
            ${s.map((l) => {
      const d = this._assignments[l.i];
      return !d || l.i === r ? "" : b`
                <circle class="num-badge" cx=${l.cx} cy=${l.cy} r="1.1"
                  @pointerdown=${(p) => this._start({ kind: "num", fromCell: l.i, button: d }, p)}></circle>
                <text class="num-text" x=${l.cx} y=${l.cy}>${d}</text>`;
    })}
            <rect class="handle" x=${e.x - 0.35} y=${e.y - 0.35} width="0.7" height="0.7"
              @pointerdown=${(l) => this._start({ kind: "tl" }, l)}></rect>
            <rect class="handle" x=${e.x + e.w - 0.35} y=${e.y + e.h - 0.35} width="0.7" height="0.7"
              @pointerdown=${(l) => this._start({ kind: "br" }, l)}></rect>
          </svg>

          <div class="tray ${o && this._overTray ? "over" : ""}">
            <span class="tray-label">Invisible</span>
            ${i.length ? i.map(
      (l) => n`<span
                    class="tray-badge"
                    @pointerdown=${(d) => this._start({ kind: "num", fromCell: -1, button: l }, d)}
                    >${l}</span
                  >`
    ) : n`<span class="tray-empty">
                  Glisse un bouton ici pour le rendre invisible
                </span>`}
          </div>
        </div>
      </div>

      ${o && this._dragClient ? n`<div
            class="floating"
            style="left:${this._dragClient.x}px; top:${this._dragClient.y}px"
          >
            ${o.button}
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
E.styles = [
  z,
  k`
      .cols {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
      }
      .form {
        flex: 1 1 260px;
        min-width: 240px;
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
        max-width: 78vw;
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
        max-width: 78vw;
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
O([
  h({ attribute: !1 })
], E.prototype, "hass", 2);
O([
  h({ attribute: !1 })
], E.prototype, "layout", 2);
O([
  c()
], E.prototype, "_name", 2);
O([
  c()
], E.prototype, "_id", 2);
O([
  c()
], E.prototype, "_buttons", 2);
O([
  c()
], E.prototype, "_shape", 2);
O([
  c()
], E.prototype, "_bounds", 2);
O([
  c()
], E.prototype, "_columns", 2);
O([
  c()
], E.prototype, "_rows", 2);
O([
  c()
], E.prototype, "_colLines", 2);
O([
  c()
], E.prototype, "_rowLines", 2);
O([
  c()
], E.prototype, "_assignments", 2);
O([
  c()
], E.prototype, "_busy", 2);
O([
  c()
], E.prototype, "_dragClient", 2);
O([
  c()
], E.prototype, "_hoverCell", 2);
O([
  c()
], E.prototype, "_overTray", 2);
E = O([
  S("homex-layout-editor")
], E);
var Gi = Object.defineProperty, Wi = Object.getOwnPropertyDescriptor, M = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Wi(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && Gi(t, s, o), o;
};
let w = class extends f {
  constructor() {
    super(...arguments), this.preset = null, this.layouts = [], this.prefillDevice = "", this._name = "", this._id = "", this._deviceId = "", this._modelKey = "", this._models = [], this._devices = [], this._layoutId = "", this._taps = {}, this._bindings = {}, this._actions = [], this._actionTab = "single", this._busy = !1, this._idEdited = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadModels(), this._loadDevices();
  }
  async _loadModels() {
    try {
      this._models = await ws(this.hass);
    } catch {
      this._models = [];
    }
  }
  async _loadDevices() {
    try {
      this._devices = await Tt(this.hass);
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
      this._name = t?.name ?? "", this._id = t?.id ?? "", this._deviceId = t?.device_id ?? this.prefillDevice ?? "", this._modelKey = t?.model ?? (this._deviceId ? We(this.hass, this._deviceId) : ""), this._layoutId = t?.layout_id ?? "", this._taps = JSON.parse(JSON.stringify(t?.taps ?? {})), this._bindings = JSON.parse(JSON.stringify(t?.bindings ?? {})), this._actions = [], this._idEdited = !!t, this._busy = !1, !t && this._deviceId && !this._name && (this._name = Ke(this.hass, this._deviceId), this._id = K(this._name)), this._ensureTaps(), this._deviceId && this._loadActions();
    }
  }
  updated() {
    this.renderRoot.querySelectorAll(".bind-select").forEach((e) => {
      const t = e.dataset.mode ?? "", s = Number(e.dataset.btn), i = this._bindings[t]?.[s]?.[0] ?? "";
      e.value !== i && (e.value = i);
    });
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
      this._actions = await It(this.hass, this._deviceId);
    } catch {
      this._actions = [];
    }
  }
  _onModel(e) {
    this._modelKey = e;
    const t = this._models.find((s) => s.model === e);
    this._deviceId = t?.device_id ?? "", this._actions = [], this._bindings = {}, t && (this._idEdited || (this._name = t.label, this._id = K(t.label)), this._loadActions());
  }
  _onRefDevice(e) {
    this._deviceId = e, this._actions = [], this._bindings = {}, e && this._loadActions();
  }
  _enabledModes() {
    const e = /* @__PURE__ */ new Set();
    return Object.values(this._taps).forEach((t) => t.forEach((s) => e.add(s))), w.TAP_MODES.map((t) => t.mode).filter(
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
    for (const [i, o] of Object.entries(this._bindings))
      for (const [r, a] of Object.entries(o))
        i === e && Number(r) === t || (a ?? []).forEach((l) => s.add(l));
    return s;
  }
  _onName(e) {
    this._name = e, this._idEdited || (this._id = K(e));
  }
  _onId(e) {
    this._id = e, this._idEdited = !0;
  }
  _close() {
    this.dispatchEvent(new CustomEvent("preset-closed"));
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
      await ys(this.hass, {
        id: t,
        name: e,
        model: We(this.hass, this._deviceId),
        model_label: Ke(this.hass, this._deviceId),
        device_id: this._deviceId,
        layout_id: this._layoutId,
        taps: this._taps,
        bindings: this._bindings
      }), this._close();
    } catch (s) {
      this._busy = !1, alert("Erreur Homex : " + $(s));
    }
  }
  async _delete() {
    if (this.preset && confirm(`Supprimer le preset "${this.preset.name}" ?`)) {
      this._busy = !0;
      try {
        await $s(this.hass, this.preset.id), this._close();
      } catch (e) {
        this._busy = !1, alert("Erreur Homex : " + $(e));
      }
    }
  }
  _renderActions() {
    if (!this._deviceId) return "";
    if (!this._actions.length)
      return n`<p class="hint">Aucune action disponible pour cet appareil.</p>`;
    const e = this._enabledModes();
    if (!e.length) return "";
    const t = e.includes(this._actionTab) ? this._actionTab : e[0], s = (i) => w.TAP_MODES.find((o) => o.mode === i)?.label ?? i;
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
      const o = this._bindings[t]?.[i]?.[0] ?? "", r = this._usedActions(t, i);
      return n`<div class="bind-row">
          <div class="btn-lbl">Bouton ${i}</div>
          <select
            class="bind-select"
            data-mode=${t}
            data-btn=${i}
            @change=${(a) => this._setBind(t, i, a.target.value)}
          >
            <option value="">— aucune action —</option>
            ${this._actions.filter((a) => !r.has(a.label) || a.label === o).map((a) => n`<option value=${a.label}>${a.label}</option>`)}
          </select>
        </div>`;
    })}
    `;
  }
  render() {
    const e = !!this.preset;
    return n`
      ${X("Nom du preset", this._name, (t) => this._onName(t), "Modèle X")}
      ${e ? n`<div class="section">Id : ${this.preset.id}</div>` : ""}

      <div class="section">Modèle d'interrupteur</div>
      ${this._models.length ? n`<select
            .value=${this._modelKey}
            @change=${(t) => this._onModel(t.target.value)}
          >
            <option value="">— Choisir un modèle —</option>
            ${this._models.map(
      (t) => n`<option value=${t.model} ?selected=${t.model === this._modelKey}>
                ${t.label} (${t.count})
              </option>`
    )}
          </select>` : n`<p class="hint">
            Aucun interrupteur détecté (appareil exposant des actions).
          </p>`}

      ${this._modelKey ? n`<div class="section">Appareil de référence</div>
            <p class="hint">
              Appareil du modèle duquel les actions sont récupérées. Un même
              modèle peut exposer des actions différentes selon l'appareil.
            </p>
            ${this._devicesForModel().length ? n`<select
                  .value=${this._deviceId}
                  @change=${(t) => this._onRefDevice(t.target.value)}
                >
                  <option value="">— Choisir un appareil —</option>
                  ${this._devicesForModel().map(
      (t) => n`<option
                      value=${t.device_id}
                      ?selected=${t.device_id === this._deviceId}
                    >
                      ${t.name}
                    </option>`
    )}
                </select>` : n`<p class="hint">
                  Aucun appareil détecté pour ce modèle.
                </p>`}` : ""}

      <div class="section">Layout</div>
      ${this.layouts.length ? n`<select
            .value=${this._layoutId}
            @change=${(t) => this._onLayout(t.target.value)}
          >
            <option value="">— Choisir un layout —</option>
            ${this.layouts.map(
      (t) => n`<option value=${t.id} ?selected=${t.id === this._layoutId}>
                ${t.name} (${t.buttons} bouton(s))
              </option>`
    )}
          </select>` : n`<p class="hint">Aucun layout. Crée-en un dans « Switch Layouts ».</p>`}

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
                  ${w.TAP_MODES.map(
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
w.TAP_MODES = [
  { mode: "single", label: "Simple" },
  { mode: "double", label: "Double" },
  { mode: "long", label: "Long" }
];
w.styles = [
  z,
  k`
      select {
        width: 100%;
        box-sizing: border-box;
        padding: 12px 14px;
        font-size: 15px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        margin: 6px 0;
      }
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
M([
  h({ attribute: !1 })
], w.prototype, "hass", 2);
M([
  h({ attribute: !1 })
], w.prototype, "preset", 2);
M([
  h({ attribute: !1 })
], w.prototype, "layouts", 2);
M([
  h({ attribute: !1 })
], w.prototype, "prefillDevice", 2);
M([
  c()
], w.prototype, "_name", 2);
M([
  c()
], w.prototype, "_id", 2);
M([
  c()
], w.prototype, "_deviceId", 2);
M([
  c()
], w.prototype, "_modelKey", 2);
M([
  c()
], w.prototype, "_models", 2);
M([
  c()
], w.prototype, "_devices", 2);
M([
  c()
], w.prototype, "_layoutId", 2);
M([
  c()
], w.prototype, "_taps", 2);
M([
  c()
], w.prototype, "_bindings", 2);
M([
  c()
], w.prototype, "_actions", 2);
M([
  c()
], w.prototype, "_actionTab", 2);
M([
  c()
], w.prototype, "_busy", 2);
w = M([
  S("homex-preset-editor")
], w);
var Ki = Object.defineProperty, Zi = Object.getOwnPropertyDescriptor, U = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Zi(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && Ki(t, s, o), o;
};
let I = class extends f {
  constructor() {
    super(...arguments), this.sw = null, this.presets = [], this.initialRooms = [], this._name = "", this._id = "", this._deviceId = "", this._presetId = "", this._devices = [], this._rooms = [], this._allRooms = [], this._busy = !1, this._idEdited = !1;
  }
  willUpdate(e) {
    e.has("sw") && (this._name = this.sw?.name ?? "", this._id = this.sw?.id ?? "", this._deviceId = this.sw?.device_id ?? "", this._presetId = this.sw?.preset_id ?? "", this._rooms = [...this.sw?.rooms ?? this.initialRooms ?? []], this._idEdited = !!this.sw, this._busy = !1, this._loadRooms());
  }
  async _loadRooms() {
    try {
      const e = await tt(this.hass);
      this._allRooms = e.filter((t) => (t.modules ?? []).includes("switches")).map((t) => ({ room_id: t.room_id, name: t.name }));
    } catch {
      this._allRooms = [];
    }
  }
  connectedCallback() {
    super.connectedCallback(), this._loadDevices();
  }
  async _loadDevices() {
    try {
      this._devices = await Tt(this.hass);
    } catch {
      this._devices = [];
    }
  }
  /** Presets matching the selected device's model. */
  _modelPresets() {
    return this._deviceId ? Rt(this.hass, this.presets, this._deviceId) : [];
  }
  _preset() {
    if (this._deviceId)
      return st(this.hass, this.presets, {
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
    this._name = e, this._idEdited || (this._id = K(e));
  }
  _toggleRoom(e) {
    this._rooms = this._rooms.includes(e) ? this._rooms.filter((t) => t !== e) : [...this._rooms, e];
  }
  _close() {
    this.dispatchEvent(new CustomEvent("switch-closed"));
  }
  _createPreset() {
    this.dispatchEvent(
      new CustomEvent("create-preset", { detail: { device_id: this._deviceId } })
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
      await Dt(
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
      this._busy = !1, alert("Erreur Homex : " + $(s));
    }
  }
  async _delete() {
    if (this.sw && confirm(`Supprimer le switch "${this.sw.name}" ?`)) {
      this._busy = !0;
      try {
        await bs(this.hass, this.sw.id), this._close();
      } catch (e) {
        this._busy = !1, alert("Erreur Homex : " + $(e));
      }
    }
  }
  /** Preset section: choose among the model's presets, or offer to create one. */
  _renderPreset(e) {
    const t = this._modelPresets(), s = Ke(this.hass, this._deviceId);
    return t.length ? n`<div class="preset-box ${e ? "ok" : ""}">
      <div class="section">Preset</div>
      <select
        .value=${e?.id ?? ""}
        @change=${(i) => this._presetId = i.target.value}
      >
        ${t.map(
      (i) => n`<option value=${i.id} ?selected=${i.id === e?.id}>
            ${i.name}
          </option>`
    )}
      </select>
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
  render() {
    const e = !!this.sw, t = this._preset();
    return n`
      ${X("Nom", this._name, (s) => this._onName(s), "Interrupteur chevet")}
      ${e ? n`<div class="section">Id : ${this.sw.id}</div>` : ""}

      <div class="section">Interrupteur (appareil)</div>
      ${this._devices.length ? n`<select
            .value=${this._deviceId}
            @change=${(s) => this._onDevice(s.target.value)}
          >
            <option value="">— Choisir un interrupteur —</option>
            ${this._devices.map(
      (s) => n`<option value=${s.device_id} ?selected=${s.device_id === this._deviceId}>
                ${s.name} · ${s.model_label}
              </option>`
    )}
          </select>` : n`<p class="hint">
            Aucun interrupteur détecté (appareil exposant des actions).
          </p>`}

      ${this._deviceId ? this._renderPreset(t) : ""}

      <div class="section">Pièces Homex assignées (0..n)</div>
      <div class="rooms">
        ${this._allRooms.length ? this._allRooms.map(
      (s) => n`<span
                class="chip ${this._rooms.includes(s.room_id) ? "on" : ""}"
                @click=${() => this._toggleRoom(s.room_id)}
                >${s.name}</span
              >`
    ) : n`<span class="hint">Aucune pièce.</span>`}
      </div>

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
I.styles = [
  z,
  k`
      select {
        width: 100%;
        box-sizing: border-box;
        padding: 12px 14px;
        font-size: 15px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        margin: 6px 0;
      }
      .rooms {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 4px 0 8px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        border-radius: 16px;
        border: 1px solid var(--divider-color, #ccc);
        cursor: pointer;
        font-size: 14px;
        user-select: none;
      }
      .chip.on {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-color: var(--primary-color);
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
U([
  h({ attribute: !1 })
], I.prototype, "hass", 2);
U([
  h({ attribute: !1 })
], I.prototype, "sw", 2);
U([
  h({ attribute: !1 })
], I.prototype, "presets", 2);
U([
  h({ attribute: !1 })
], I.prototype, "initialRooms", 2);
U([
  c()
], I.prototype, "_name", 2);
U([
  c()
], I.prototype, "_id", 2);
U([
  c()
], I.prototype, "_deviceId", 2);
U([
  c()
], I.prototype, "_presetId", 2);
U([
  c()
], I.prototype, "_devices", 2);
U([
  c()
], I.prototype, "_rooms", 2);
U([
  c()
], I.prototype, "_allRooms", 2);
U([
  c()
], I.prototype, "_busy", 2);
I = U([
  S("homex-gswitch-editor")
], I);
var Yi = Object.defineProperty, Ji = Object.getOwnPropertyDescriptor, H = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Ji(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && Yi(t, s, o), o;
};
let P = class extends f {
  constructor() {
    super(...arguments), this.startAdd = !1, this.startAddRoom = null, this._section = "switches", this._addRooms = [], this._startAddHandled = !1, this._layouts = [], this._presets = [], this._gswitches = [], this._loaded = !1, this._editingLayout = !1, this._editLayout = null, this._editingPreset = !1, this._editPreset = null, this._prefillDevice = "", this._editingSwitch = !1, this._editSwitch = null, this._fromSwitchFlow = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  willUpdate() {
    this.startAdd && !this._startAddHandled && (this._startAddHandled = !0, this._section = "switches", this._editSwitch = null, this._addRooms = this.startAddRoom ? [this.startAddRoom] : [], this._editingSwitch = !0);
  }
  async _load() {
    try {
      [this._layouts, this._presets, this._gswitches] = await Promise.all([
        Mt(this.hass),
        zt(this.hass),
        Ht(this.hass)
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
    this._editingLayout = !1, this._load();
  }
  _onPresetClosed() {
    this._editingPreset = !1, this._prefillDevice = "", this._load(), this._fromSwitchFlow && (this._fromSwitchFlow = !1, this._section = "switches");
  }
  _onSwitchClosed() {
    this._editingSwitch = !1, this._load();
  }
  _onCreatePreset(e) {
    this._editingSwitch = !1, this._prefillDevice = e.detail.device_id || "", this._editPreset = null, this._editingPreset = !0, this._fromSwitchFlow = !0, this._section = "presets";
  }
  _add() {
    this._section === "layouts" ? (this._editLayout = null, this._editingLayout = !0) : this._section === "presets" ? (this._editPreset = null, this._prefillDevice = "", this._editingPreset = !0) : (this._editSwitch = null, this._addRooms = [], this._editingSwitch = !0);
  }
  _preview(e) {
    const t = e.bounds, s = `clip-${e.id}`, i = e.shape === "round", o = i ? b`<ellipse cx=${t.x + t.w / 2} cy=${t.y + t.h / 2} rx=${t.w / 2} ry=${t.h / 2}></ellipse>` : b`<rect x=${t.x} y=${t.y} width=${t.w} height=${t.h} rx="0.4"></rect>`, r = i ? b`<ellipse class="sh" cx=${t.x + t.w / 2} cy=${t.y + t.h / 2} rx=${t.w / 2} ry=${t.h / 2}></ellipse>` : b`<rect class="sh" x=${t.x} y=${t.y} width=${t.w} height=${t.h} rx="0.4"></rect>`;
    return n`<svg class="preview" viewBox="-10 -10 20 20">
      <defs><clipPath id=${s}>${o}</clipPath></defs>
      ${(e.zones || []).map(
      (a) => b`<rect class="zn" x=${a.x} y=${a.y} width=${a.w} height=${a.h}
          clip-path="url(#${s})"></rect>`
    )}
      ${r}
      ${(e.positions || []).map(
      (a) => b`<circle class="zn" cx=${a.x} cy=${a.y} r="1.3"></circle>
          <text x=${a.x} y=${a.y}>${a.n}</text>`
    )}
    </svg>`;
  }
  render() {
    if (this._editingLayout)
      return n`
        <div class="head">
          <button @click=${this._onLayoutClosed}>← Layouts</button>
          <h2>${this._editLayout ? "Modifier le layout" : "Nouveau layout"}</h2>
        </div>
        <homex-layout-editor
          .hass=${this.hass}
          .layout=${this._editLayout}
          @layout-closed=${this._onLayoutClosed}
        ></homex-layout-editor>
      `;
    if (this._editingPreset)
      return n`
        <div class="head">
          <button @click=${this._onPresetClosed}>← Presets</button>
          <h2>${this._editPreset ? "Modifier le preset" : "Nouveau device preset"}</h2>
        </div>
        <div class="editor">
          <homex-preset-editor
            .hass=${this.hass}
            .preset=${this._editPreset}
            .layouts=${this._layouts}
            .prefillDevice=${this._prefillDevice}
            @preset-closed=${this._onPresetClosed}
          ></homex-preset-editor>
        </div>
      `;
    if (this._editingSwitch)
      return n`
        <div class="head">
          <button @click=${this._onSwitchClosed}>← Switches</button>
          <h2>${this._editSwitch ? "Modifier le switch" : "Nouveau switch"}</h2>
        </div>
        <div class="editor">
          <homex-gswitch-editor
            .hass=${this.hass}
            .sw=${this._editSwitch}
            .presets=${this._presets}
            .initialRooms=${this._addRooms}
            @switch-closed=${this._onSwitchClosed}
            @create-preset=${this._onCreatePreset}
          ></homex-gswitch-editor>
        </div>
      `;
    const e = this._section === "layouts" ? "＋ Layout" : this._section === "presets" ? "＋ Preset" : "＋ Switch";
    return n`
      <div class="head">
        <button @click=${this._back}>← Homex</button>
        <h2>Switch Manager</h2>
        <button class="primary" @click=${this._add}>${e}</button>
      </div>
      <div class="tabs">
        ${[
      ["switches", "Switches"],
      ["presets", "Presets"],
      ["layouts", "Layouts"]
    ].map(
      ([t, s]) => n`<span
            class="tab ${this._section === t ? "active" : ""}"
            @click=${() => this._section = t}
            >${s}</span
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
          @click=${() => {
        this._editLayout = e, this._editingLayout = !0;
      }}
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
        this._editPreset = e, this._editingPreset = !0;
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
      const t = st(this.hass, this._presets, e), s = t ? this._layouts.find((i) => i.id === t.layout_id) : void 0;
      return n`<div
          class="card"
          @click=${() => {
        this._editSwitch = e, this._editingSwitch = !0;
      }}
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
P.styles = [
  z,
  k`
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
H([
  h({ attribute: !1 })
], P.prototype, "hass", 2);
H([
  h({ type: Boolean })
], P.prototype, "startAdd", 2);
H([
  h({ attribute: !1 })
], P.prototype, "startAddRoom", 2);
H([
  c()
], P.prototype, "_section", 2);
H([
  c()
], P.prototype, "_addRooms", 2);
H([
  c()
], P.prototype, "_layouts", 2);
H([
  c()
], P.prototype, "_presets", 2);
H([
  c()
], P.prototype, "_gswitches", 2);
H([
  c()
], P.prototype, "_loaded", 2);
H([
  c()
], P.prototype, "_editingLayout", 2);
H([
  c()
], P.prototype, "_editLayout", 2);
H([
  c()
], P.prototype, "_editingPreset", 2);
H([
  c()
], P.prototype, "_editPreset", 2);
H([
  c()
], P.prototype, "_prefillDevice", 2);
H([
  c()
], P.prototype, "_editingSwitch", 2);
H([
  c()
], P.prototype, "_editSwitch", 2);
P = H([
  S("homex-switch-manager")
], P);
var Xi = Object.defineProperty, Qi = Object.getOwnPropertyDescriptor, q = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Qi(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && Xi(t, s, o), o;
};
let y = class extends f {
  constructor() {
    super(...arguments), this.preset = null, this._name = "", this._id = "", this._models = [], this._modelKey = "", this._deviceId = "", this._smart = !1, this._up = { domain: "", suffix: "", state: "" }, this._down = { domain: "", suffix: "", state: "" }, this._stopped = { domain: "", suffix: "", state: "" }, this._busy = !1, this._idEdited = !1;
  }
  /** Normalize a stored condition into {domain, suffix, state}, migrating the
   * legacy {entity_id, state} shape using the reference device slug. */
  _cond(e) {
    const t = Array.isArray(e) ? e[0] : e;
    if (!t) return { ...y.EMPTY };
    if (t.suffix !== void 0 || t.domain !== void 0)
      return { domain: t.domain ?? "", suffix: t.suffix ?? "", state: t.state ?? "" };
    const [s, i = ""] = String(t.entity_id ?? "").split("."), o = this._deviceSlug(), r = o && i.startsWith(o + "_") ? i.slice(o.length + 1) : i;
    return { domain: s ?? "", suffix: r, state: t.state ?? "" };
  }
  /** Entity-id prefix (slug) for the current reference device. */
  _deviceSlug() {
    const e = this.hass.devices?.[this._deviceId];
    return K(e?.name_by_user || e?.name || "");
  }
  connectedCallback() {
    super.connectedCallback(), this._loadModels();
  }
  async _loadModels() {
    try {
      this._models = await ks(this.hass);
    } catch {
      this._models = [];
    }
  }
  willUpdate(e) {
    if (e.has("preset")) {
      const t = this.preset;
      this._name = t?.name ?? "", this._id = t?.id ?? "", this._modelKey = t?.model ?? "", this._deviceId = t?.device_id ?? "", this._smart = t?.smart_toggle ?? !1, this._up = this._cond(t?.moving_up), this._down = this._cond(t?.moving_down), this._stopped = this._cond(t?.stopped), this._idEdited = !!t, this._busy = !1;
    }
  }
  _model() {
    return this._models.find((e) => e.model === this._modelKey);
  }
  _onModel(e) {
    this._modelKey = e;
    const t = this._model();
    this._deviceId = t?.devices[0]?.device_id ?? "", this._up = { ...y.EMPTY }, this._down = { ...y.EMPTY }, this._stopped = { ...y.EMPTY }, t && !this._idEdited && (this._name = t.label, this._id = K(t.label));
  }
  _onName(e) {
    this._name = e, this._idEdited || (this._id = K(e));
  }
  /** Sensors of the reference device, exposed generically (domain + suffix).
   * The suffix (entity object-id minus the device slug) is what is stored, so
   * the sensor can be reconstructed for any device of the model. */
  _refSensors() {
    const e = this.hass.entities || {}, t = /* @__PURE__ */ new Set(["sensor", "binary_sensor"]), s = this._deviceSlug();
    return Object.values(e).filter(
      (i) => i.device_id === this._deviceId && t.has(String(i.entity_id).split(".")[0])
    ).map((i) => {
      const [o, r = ""] = String(i.entity_id).split("."), a = s && r.startsWith(s + "_") ? r.slice(s.length + 1) : r;
      return { domain: o, suffix: a, key: `${o}|${a}`, entity_id: i.entity_id };
    }).sort((i, o) => i.suffix.localeCompare(o.suffix));
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
    return Array.isArray(i) && i.forEach((o) => s.add(String(o))), t.state && !["unknown", "unavailable"].includes(t.state) && s.add(t.state), [...s];
  }
  /** One entry (Montée / Descente / Arrêt) = a single sensor with a value. */
  _condEditor(e, t, s, i, o) {
    const r = `dl-${e}`, a = i.domain && i.suffix ? `${i.domain}|${i.suffix}` : "", l = this._sensorValues(this._condEntityId(i));
    return n`<div class="cond">
      <div class="section">${t}</div>
      <p class="hint">${s}</p>
      <div class="cond-row">
        <select
          .value=${a}
          @change=${(d) => {
      const [p = "", m = ""] = d.target.value.split("|");
      o({ ...i, domain: p, suffix: m });
    }}
        >
          <option value="">— Capteur —</option>
          ${this._refSensors().map(
      (d) => n`<option value=${d.key} ?selected=${d.key === a}>
              ${d.suffix}
            </option>`
    )}
        </select>
        <input
          placeholder="valeur"
          list=${r}
          .value=${i.state}
          @change=${(d) => o({ ...i, state: d.target.value })}
        />
        <datalist id=${r}>
          ${l.map((d) => n`<option value=${d}></option>`)}
        </datalist>
      </div>
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
    const s = (i) => this._smart ? { ...i, state: (i.state || "").trim().toLowerCase() } : { ...y.EMPTY };
    this._busy = !0;
    try {
      await As(this.hass, {
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
      this._busy = !1, alert("Erreur Homex : " + $(i));
    }
  }
  async _delete() {
    if (this.preset && confirm(`Supprimer le preset "${this.preset.name}" ?`)) {
      this._busy = !0;
      try {
        await Cs(this.hass, this.preset.id), this._close();
      } catch (e) {
        this._busy = !1, alert("Erreur Homex : " + $(e));
      }
    }
  }
  render() {
    const e = !!this.preset, t = this._model();
    return n`
      ${X("Nom du preset", this._name, (s) => this._onName(s), "Volet salon")}
      ${e ? n`<div class="section">Id : ${this.preset.id}</div>` : ""}

      <div class="section">Modèle de volet</div>
      ${this._models.length ? n`<select
            .value=${this._modelKey}
            @change=${(s) => this._onModel(s.target.value)}
          >
            <option value="">— Choisir un modèle —</option>
            ${this._models.map(
      (s) => n`<option value=${s.model} ?selected=${s.model === this._modelKey}>
                ${s.label} (${s.count})
              </option>`
    )}
          </select>` : n`<p class="hint">Aucun volet (device avec entité cover) détecté.</p>`}

      ${t ? n`
            <div class="section">Device de référence</div>
            <p class="hint">Les capteurs/actions sont tirés de ce device.</p>
            <select
              .value=${this._deviceId}
              @change=${(s) => {
      this._deviceId = s.target.value, this._up = { ...y.EMPTY }, this._down = { ...y.EMPTY }, this._stopped = { ...y.EMPTY };
    }}
            >
              ${t.devices.map(
      (s) => n`<option value=${s.device_id} ?selected=${s.device_id === this._deviceId}>
                  ${s.name}
                </option>`
    )}
            </select>

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
              Si activée, indique comment détecter l'état du volet (souvent un ou
              plusieurs capteurs avec une valeur précise).
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
y.EMPTY = { domain: "", suffix: "", state: "" };
y.styles = [
  z,
  k`
      select {
        width: 100%;
        box-sizing: border-box;
        padding: 12px 14px;
        font-size: 15px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        margin: 6px 0;
      }
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
        gap: 8px;
        align-items: center;
        margin: 6px 0;
      }
      .cond-row select {
        flex: 2;
        margin: 0;
      }
      .cond-row input {
        flex: 1;
        box-sizing: border-box;
        padding: 12px 14px;
        font-size: 15px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
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
q([
  h({ attribute: !1 })
], y.prototype, "hass", 2);
q([
  h({ attribute: !1 })
], y.prototype, "preset", 2);
q([
  c()
], y.prototype, "_name", 2);
q([
  c()
], y.prototype, "_id", 2);
q([
  c()
], y.prototype, "_models", 2);
q([
  c()
], y.prototype, "_modelKey", 2);
q([
  c()
], y.prototype, "_deviceId", 2);
q([
  c()
], y.prototype, "_smart", 2);
q([
  c()
], y.prototype, "_up", 2);
q([
  c()
], y.prototype, "_down", 2);
q([
  c()
], y.prototype, "_stopped", 2);
q([
  c()
], y.prototype, "_busy", 2);
y = q([
  S("homex-shutter-preset-editor")
], y);
var eo = Object.defineProperty, to = Object.getOwnPropertyDescriptor, $e = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? to(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && eo(t, s, o), o;
};
let oe = class extends f {
  constructor() {
    super(...arguments), this._presets = [], this._loaded = !1, this._editing = !1, this._edit = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    try {
      this._presets = await Ss(this.hass);
    } catch {
      this._presets = [];
    }
    this._loaded = !0;
  }
  _back() {
    this.dispatchEvent(new CustomEvent("close"));
  }
  _onClosed() {
    this._editing = !1, this._load();
  }
  render() {
    return this._editing ? n`
        <div class="head">
          <button @click=${this._onClosed}>← Presets</button>
          <h2>${this._edit ? "Modifier le preset" : "Nouveau shutter device preset"}</h2>
        </div>
        <div class="editor">
          <homex-shutter-preset-editor
            .hass=${this.hass}
            .preset=${this._edit}
            @shutter-preset-closed=${this._onClosed}
          ></homex-shutter-preset-editor>
        </div>
      ` : n`
      <div class="head">
        <button @click=${this._back}>← Homex</button>
        <h2>Shutter Manager</h2>
        <button
          class="primary"
          @click=${() => {
      this._edit = null, this._editing = !0;
    }}
        >
          ＋ Preset
        </button>
      </div>
      ${this._loaded ? this._presets.length ? n`<div class="grid">
              ${this._presets.map(
      (e) => n`<div
                  class="card"
                  @click=${() => {
        this._edit = e, this._editing = !0;
      }}
                >
                  <div class="icon">🪟</div>
                  <div class="info">
                    <div class="name">${e.name}</div>
                    <div class="meta">
                      ${e.model_label}${e.smart_toggle ? " · permutation intelligente" : ""}
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
oe.styles = [
  z,
  k`
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
$e([
  h({ attribute: !1 })
], oe.prototype, "hass", 2);
$e([
  c()
], oe.prototype, "_presets", 2);
$e([
  c()
], oe.prototype, "_loaded", 2);
$e([
  c()
], oe.prototype, "_editing", 2);
$e([
  c()
], oe.prototype, "_edit", 2);
oe = $e([
  S("homex-shutter-manager")
], oe);
var so = Object.defineProperty, io = Object.getOwnPropertyDescriptor, R = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? io(t, s) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = (i ? a(t, s, o) : a(o)) || o);
  return i && o && so(t, s, o), o;
};
const oo = "96";
let D = class extends f {
  constructor() {
    super(...arguments), this.narrow = !1, this._rooms = null, this._error = null, this._createOpen = !1, this._exportOpen = !1, this._view = "rooms", this._menuOpen = !1, this._switchStartAdd = !1, this._switchAddRoom = null, this._expanded = localStorage.getItem("homex_expanded") || null, this._loaded = !1, this._onToggleExpand = (e) => {
      const t = e.detail.entry_id;
      this._expanded = this._expanded === t ? null : t, this._expanded ? localStorage.setItem("homex_expanded", this._expanded) : localStorage.removeItem("homex_expanded");
    }, this._reload = async () => {
      try {
        this._rooms = await tt(this.hass), this._error = null;
      } catch (e) {
        this._error = $(e);
      }
    }, this._onOpenSwitchAdd = (e) => {
      this._switchAddRoom = e.detail?.room_id ?? null, this._switchStartAdd = !0, this._view = "switches";
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener(Ge, this._reload), this.addEventListener("homex-toggle-expand", this._onToggleExpand);
  }
  disconnectedCallback() {
    this.removeEventListener(Ge, this._reload), this.removeEventListener("homex-toggle-expand", this._onToggleExpand), super.disconnectedCallback();
  }
  updated(e) {
    e.has("hass") && this.hass && !this._loaded && (this._loaded = !0, Bs().then(() => this.requestUpdate()), this._reload());
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
      const r = (i.area_id ? this.hass.areas?.[i.area_id] : null)?.floor_id;
      r && this.hass.floors?.[r] ? (t.get(r) ?? t.set(r, []).get(r)).push(i) : e.push(i);
    }
    const s = [...t.keys()].map((i) => this.hass.floors[i]).sort(
      (i, o) => (i.level ?? 0) - (o.level ?? 0) || i.name.localeCompare(o.name)
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
        ${t.map((o) => this._roomCard(o))}
        ${s.map(
        (o) => n`
            <div class="floor-header">
              ${o.icon ? n`<ha-icon .icon=${o.icon}></ha-icon>` : ""}
              <span>${o.name}</span>
            </div>
            ${(i.get(o.floor_id) || []).map(
          (r) => this._roomCard(r)
        )}
          `
      )}
      `;
    }
    return this._view === "switches" ? n`
        <div class="wrap">
          <homex-switch-manager
            .hass=${this.hass}
            .startAdd=${this._switchStartAdd}
            .startAddRoom=${this._switchAddRoom}
            @close=${() => this._view = "rooms"}
          ></homex-switch-manager>
        </div>
      ` : this._view === "shutters" ? n`
        <div class="wrap">
          <homex-shutter-manager
            .hass=${this.hass}
            @close=${() => this._view = "rooms"}
          ></homex-shutter-manager>
        </div>
      ` : n`
      <div class="wrap" @open-switch-add=${this._onOpenSwitchAdd}>
        <header>
          <h1>Homex <span class="ver">v${oo}</span></h1>
          <div class="header-actions">
            <button @click=${this._reload}>Rafraîchir</button>
            <button
              ?disabled=${!this._rooms?.length}
              @click=${() => this._exportOpen = !0}
            >
              ⬇ Exporter
            </button>
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
      this._menuOpen = !1, this._switchStartAdd = !1, this._switchAddRoom = null, this._view = "switches";
    }}
                      >
                        🎛 Switch Manager
                      </button>
                      <button
                        @click=${() => {
      this._menuOpen = !1, this._view = "shutters";
    }}
                      >
                        🪟 Shutter Manager
                      </button>
                    </div>
                  ` : ""}
            </div>
          </div>
        </header>
        ${e}
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
D.styles = k`
    .wrap {
      max-width: 1000px;
      margin: 0 auto;
      padding: 16px;
      color: var(--primary-text-color);
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
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
R([
  h({ attribute: !1 })
], D.prototype, "hass", 2);
R([
  h({ attribute: !1 })
], D.prototype, "narrow", 2);
R([
  h({ attribute: !1 })
], D.prototype, "route", 2);
R([
  h({ attribute: !1 })
], D.prototype, "panel", 2);
R([
  c()
], D.prototype, "_rooms", 2);
R([
  c()
], D.prototype, "_error", 2);
R([
  c()
], D.prototype, "_createOpen", 2);
R([
  c()
], D.prototype, "_exportOpen", 2);
R([
  c()
], D.prototype, "_view", 2);
R([
  c()
], D.prototype, "_menuOpen", 2);
R([
  c()
], D.prototype, "_switchStartAdd", 2);
R([
  c()
], D.prototype, "_switchAddRoom", 2);
R([
  c()
], D.prototype, "_expanded", 2);
D = R([
  S("homex-panel")
], D);
export {
  D as HomexPanel
};
