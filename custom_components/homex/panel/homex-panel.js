/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ce = globalThis, _e = ce.ShadowRoot && (ce.ShadyCSS === void 0 || ce.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ve = Symbol(), Ae = /* @__PURE__ */ new WeakMap();
let Ue = class {
  constructor(e, s, r) {
    if (this._$cssResult$ = !0, r !== ve) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (_e && e === void 0) {
      const r = s !== void 0 && s.length === 1;
      r && (e = Ae.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), r && Ae.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Fe = (t) => new Ue(typeof t == "string" ? t : t + "", void 0, ve), x = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((r, i, o) => r + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[o + 1], t[0]);
  return new Ue(s, t, ve);
}, Ze = (t, e) => {
  if (_e) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const r = document.createElement("style"), i = ce.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = s.cssText, t.appendChild(r);
  }
}, ke = _e ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const r of e.cssRules) s += r.cssText;
  return Fe(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ge, defineProperty: Je, getOwnPropertyDescriptor: Ke, getOwnPropertyNames: Xe, getOwnPropertySymbols: Qe, getPrototypeOf: Ye } = Object, he = globalThis, Ce = he.trustedTypes, et = Ce ? Ce.emptyScript : "", tt = he.reactiveElementPolyfillSupport, X = (t, e) => t, de = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? et : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let s = t;
  switch (e) {
    case Boolean:
      s = t !== null;
      break;
    case Number:
      s = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(t);
      } catch {
        s = null;
      }
  }
  return s;
} }, fe = (t, e) => !Ge(t, e), Ee = { attribute: !0, type: String, converter: de, reflect: !1, useDefault: !1, hasChanged: fe };
Symbol.metadata ??= Symbol("metadata"), he.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let F = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = Ee) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(e, r, s);
      i !== void 0 && Je(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, s, r) {
    const { get: i, set: o } = Ke(this.prototype, e) ?? { get() {
      return this[s];
    }, set(a) {
      this[s] = a;
    } };
    return { get: i, set(a) {
      const p = i?.call(this);
      o?.call(this, a), this.requestUpdate(e, p, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Ee;
  }
  static _$Ei() {
    if (this.hasOwnProperty(X("elementProperties"))) return;
    const e = Ye(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(X("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(X("properties"))) {
      const s = this.properties, r = [...Xe(s), ...Qe(s)];
      for (const i of r) this.createProperty(i, s[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const s = litPropertyMetadata.get(e);
      if (s !== void 0) for (const [r, i] of s) this.elementProperties.set(r, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, r] of this.elementProperties) {
      const i = this._$Eu(s, r);
      i !== void 0 && this._$Eh.set(i, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const s = [];
    if (Array.isArray(e)) {
      const r = new Set(e.flat(1 / 0).reverse());
      for (const i of r) s.unshift(ke(i));
    } else e !== void 0 && s.push(ke(e));
    return s;
  }
  static _$Eu(e, s) {
    const r = s.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const r of s.keys()) this.hasOwnProperty(r) && (e.set(r, this[r]), delete this[r]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ze(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, s, r) {
    this._$AK(e, r);
  }
  _$ET(e, s) {
    const r = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, r);
    if (i !== void 0 && r.reflect === !0) {
      const o = (r.converter?.toAttribute !== void 0 ? r.converter : de).toAttribute(s, r.type);
      this._$Em = e, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const r = this.constructor, i = r._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const o = r.getPropertyOptions(i), a = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : de;
      this._$Em = i;
      const p = a.fromAttribute(s, o.type);
      this[i] = p ?? this._$Ej?.get(i) ?? p, this._$Em = null;
    }
  }
  requestUpdate(e, s, r, i = !1, o) {
    if (e !== void 0) {
      const a = this.constructor;
      if (i === !1 && (o = this[e]), r ??= a.getPropertyOptions(e), !((r.hasChanged ?? fe)(o, s) || r.useDefault && r.reflect && o === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, r)))) return;
      this.C(e, s, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: r, reflect: i, wrapped: o }, a) {
    r && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? s ?? this[e]), o !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || r || (s = void 0), this._$AL.set(e, s)), i === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [i, o] of this._$Ep) this[i] = o;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [i, o] of r) {
        const { wrapped: a } = o, p = this[i];
        a !== !0 || this._$AL.has(i) || p === void 0 || this.C(i, void 0, o, p);
      }
    }
    let e = !1;
    const s = this._$AL;
    try {
      e = this.shouldUpdate(s), e ? (this.willUpdate(s), this._$EO?.forEach((r) => r.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (r) {
      throw e = !1, this._$EM(), r;
    }
    e && this._$AE(s);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((s) => s.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((s) => this._$ET(s, this[s])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
F.elementStyles = [], F.shadowRootOptions = { mode: "open" }, F[X("elementProperties")] = /* @__PURE__ */ new Map(), F[X("finalized")] = /* @__PURE__ */ new Map(), tt?.({ ReactiveElement: F }), (he.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const xe = globalThis, Se = (t) => t, pe = xe.trustedTypes, He = pe ? pe.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Re = "$lit$", V = `lit$${Math.random().toFixed(9).slice(2)}$`, Ie = "?" + V, st = `<${Ie}>`, j = document, Q = () => j.createComment(""), Y = (t) => t === null || typeof t != "object" && typeof t != "function", be = Array.isArray, it = (t) => be(t) || typeof t?.[Symbol.iterator] == "function", ge = `[ 	
\f\r]`, K = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Oe = /-->/g, Pe = />/g, N = RegExp(`>|${ge}(?:([^\\s"'>=/]+)(${ge}*=${ge}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Le = /'/g, Me = /"/g, Be = /^(?:script|style|textarea|title)$/i, rt = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), n = rt(1), Z = Symbol.for("lit-noChange"), m = Symbol.for("lit-nothing"), Ve = /* @__PURE__ */ new WeakMap(), T = j.createTreeWalker(j, 129);
function qe(t, e) {
  if (!be(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return He !== void 0 ? He.createHTML(e) : e;
}
const ot = (t, e) => {
  const s = t.length - 1, r = [];
  let i, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = K;
  for (let p = 0; p < s; p++) {
    const l = t[p];
    let g, h, u = -1, E = 0;
    for (; E < l.length && (a.lastIndex = E, h = a.exec(l), h !== null); ) E = a.lastIndex, a === K ? h[1] === "!--" ? a = Oe : h[1] !== void 0 ? a = Pe : h[2] !== void 0 ? (Be.test(h[2]) && (i = RegExp("</" + h[2], "g")), a = N) : h[3] !== void 0 && (a = N) : a === N ? h[0] === ">" ? (a = i ?? K, u = -1) : h[1] === void 0 ? u = -2 : (u = a.lastIndex - h[2].length, g = h[1], a = h[3] === void 0 ? N : h[3] === '"' ? Me : Le) : a === Me || a === Le ? a = N : a === Oe || a === Pe ? a = K : (a = N, i = void 0);
    const M = a === N && t[p + 1].startsWith("/>") ? " " : "";
    o += a === K ? l + st : u >= 0 ? (r.push(g), l.slice(0, u) + Re + l.slice(u) + V + M) : l + V + (u === -2 ? p : M);
  }
  return [qe(t, o + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), r];
};
class ee {
  constructor({ strings: e, _$litType$: s }, r) {
    let i;
    this.parts = [];
    let o = 0, a = 0;
    const p = e.length - 1, l = this.parts, [g, h] = ot(e, s);
    if (this.el = ee.createElement(g, r), T.currentNode = this.el.content, s === 2 || s === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (i = T.nextNode()) !== null && l.length < p; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const u of i.getAttributeNames()) if (u.endsWith(Re)) {
          const E = h[a++], M = i.getAttribute(u).split(V), ne = /([.?@])?(.*)/.exec(E);
          l.push({ type: 1, index: o, name: ne[2], strings: M, ctor: ne[1] === "." ? nt : ne[1] === "?" ? lt : ne[1] === "@" ? ct : ue }), i.removeAttribute(u);
        } else u.startsWith(V) && (l.push({ type: 6, index: o }), i.removeAttribute(u));
        if (Be.test(i.tagName)) {
          const u = i.textContent.split(V), E = u.length - 1;
          if (E > 0) {
            i.textContent = pe ? pe.emptyScript : "";
            for (let M = 0; M < E; M++) i.append(u[M], Q()), T.nextNode(), l.push({ type: 2, index: ++o });
            i.append(u[E], Q());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Ie) l.push({ type: 2, index: o });
      else {
        let u = -1;
        for (; (u = i.data.indexOf(V, u + 1)) !== -1; ) l.push({ type: 7, index: o }), u += V.length - 1;
      }
      o++;
    }
  }
  static createElement(e, s) {
    const r = j.createElement("template");
    return r.innerHTML = e, r;
  }
}
function G(t, e, s = t, r) {
  if (e === Z) return e;
  let i = r !== void 0 ? s._$Co?.[r] : s._$Cl;
  const o = Y(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== o && (i?._$AO?.(!1), o === void 0 ? i = void 0 : (i = new o(t), i._$AT(t, s, r)), r !== void 0 ? (s._$Co ??= [])[r] = i : s._$Cl = i), i !== void 0 && (e = G(t, i._$AS(t, e.values), i, r)), e;
}
class at {
  constructor(e, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: s }, parts: r } = this._$AD, i = (e?.creationScope ?? j).importNode(s, !0);
    T.currentNode = i;
    let o = T.nextNode(), a = 0, p = 0, l = r[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let g;
        l.type === 2 ? g = new ie(o, o.nextSibling, this, e) : l.type === 1 ? g = new l.ctor(o, l.name, l.strings, this, e) : l.type === 6 && (g = new dt(o, this, e)), this._$AV.push(g), l = r[++p];
      }
      a !== l?.index && (o = T.nextNode(), a++);
    }
    return T.currentNode = j, i;
  }
  p(e) {
    let s = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(e, r, s), s += r.strings.length - 2) : r._$AI(e[s])), s++;
  }
}
class ie {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, r, i) {
    this.type = 2, this._$AH = m, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = r, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && e?.nodeType === 11 && (e = s.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, s = this) {
    e = G(this, e, s), Y(e) ? e === m || e == null || e === "" ? (this._$AH !== m && this._$AR(), this._$AH = m) : e !== this._$AH && e !== Z && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : it(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== m && Y(this._$AH) ? this._$AA.nextSibling.data = e : this.T(j.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: r } = e, i = typeof r == "number" ? this._$AC(e) : (r.el === void 0 && (r.el = ee.createElement(qe(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const o = new at(i, this), a = o.u(this.options);
      o.p(s), this.T(a), this._$AH = o;
    }
  }
  _$AC(e) {
    let s = Ve.get(e.strings);
    return s === void 0 && Ve.set(e.strings, s = new ee(e)), s;
  }
  k(e) {
    be(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let r, i = 0;
    for (const o of e) i === s.length ? s.push(r = new ie(this.O(Q()), this.O(Q()), this, this.options)) : r = s[i], r._$AI(o), i++;
    i < s.length && (this._$AR(r && r._$AB.nextSibling, i), s.length = i);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const r = Se(e).nextSibling;
      Se(e).remove(), e = r;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class ue {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, r, i, o) {
    this.type = 1, this._$AH = m, this._$AN = void 0, this.element = e, this.name = s, this._$AM = i, this.options = o, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = m;
  }
  _$AI(e, s = this, r, i) {
    const o = this.strings;
    let a = !1;
    if (o === void 0) e = G(this, e, s, 0), a = !Y(e) || e !== this._$AH && e !== Z, a && (this._$AH = e);
    else {
      const p = e;
      let l, g;
      for (e = o[0], l = 0; l < o.length - 1; l++) g = G(this, p[r + l], s, l), g === Z && (g = this._$AH[l]), a ||= !Y(g) || g !== this._$AH[l], g === m ? e = m : e !== m && (e += (g ?? "") + o[l + 1]), this._$AH[l] = g;
    }
    a && !i && this.j(e);
  }
  j(e) {
    e === m ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class nt extends ue {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === m ? void 0 : e;
  }
}
class lt extends ue {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== m);
  }
}
class ct extends ue {
  constructor(e, s, r, i, o) {
    super(e, s, r, i, o), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = G(this, e, s, 0) ?? m) === Z) return;
    const r = this._$AH, i = e === m && r !== m || e.capture !== r.capture || e.once !== r.once || e.passive !== r.passive, o = e !== m && (r === m || i);
    i && this.element.removeEventListener(this.name, this, r), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class dt {
  constructor(e, s, r) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    G(this, e);
  }
}
const pt = xe.litHtmlPolyfillSupport;
pt?.(ee, ie), (xe.litHtmlVersions ??= []).push("3.3.3");
const ht = (t, e, s) => {
  const r = s?.renderBefore ?? e;
  let i = r._$litPart$;
  if (i === void 0) {
    const o = s?.renderBefore ?? null;
    r._$litPart$ = i = new ie(e.insertBefore(Q(), o), o, void 0, s ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ye = globalThis;
class _ extends F {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ht(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return Z;
  }
}
_._$litElement$ = !0, _.finalized = !0, ye.litElementHydrateSupport?.({ LitElement: _ });
const ut = ye.litElementPolyfillSupport;
ut?.({ LitElement: _ });
(ye.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const b = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const gt = { attribute: !0, type: String, converter: de, reflect: !1, hasChanged: fe }, mt = (t = gt, e, s) => {
  const { kind: r, metadata: i } = s;
  let o = globalThis.litPropertyMetadata.get(i);
  if (o === void 0 && globalThis.litPropertyMetadata.set(i, o = /* @__PURE__ */ new Map()), r === "setter" && ((t = Object.create(t)).wrapped = !0), o.set(s.name, t), r === "accessor") {
    const { name: a } = s;
    return { set(p) {
      const l = e.get.call(this);
      e.set.call(this, p), this.requestUpdate(a, l, t, !0, p);
    }, init(p) {
      return p !== void 0 && this.C(a, void 0, t, p), p;
    } };
  }
  if (r === "setter") {
    const { name: a } = s;
    return function(p) {
      const l = this[a];
      e.call(this, p), this.requestUpdate(a, l, t, !0, p);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function c(t) {
  return (e, s) => typeof s == "object" ? mt(t, e, s) : ((r, i, o) => {
    const a = i.hasOwnProperty(o);
    return i.constructor.createProperty(o, r), a ? Object.getOwnPropertyDescriptor(i, o) : void 0;
  })(t, e, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function d(t) {
  return c({ ...t, state: !0, attribute: !1 });
}
const me = "homex-changed", z = (t) => t.dispatchEvent(new CustomEvent(me, { bubbles: !0, composed: !0 })), _t = async (t) => (await t.callWS({ type: "homex/rooms" })).rooms || [], vt = (t, e) => t.callWS({ type: "homex/room/create", ...e }), ft = (t, e, s = !0) => t.callWS({ type: "homex/room/delete", entry_id: e, delete_scenes: s }), xt = async (t, e) => (await t.callWS({ type: "homex/device_triggers", device_id: e })).triggers || [], We = (t, e) => t.callWS({ type: "homex/room/update", ...e }), bt = (t, e) => t.callWS({ type: "homex/group/add", ...e }), yt = (t, e) => t.callWS({ type: "homex/group/update", ...e }), $t = (t, e, s) => t.callWS({ type: "homex/group/delete", entry_id: e, group_id: s }), ze = (t, e, s, r) => t.callWS({
  type: "homex/scene/add",
  entry_id: e,
  name: s,
  ...r ? { attach: r } : {}
}), wt = (t, e, s) => t.callWS({ type: "homex/scene/delete", entry_id: e, key: s }), At = (t, e, s) => t.callWS({ type: "homex/scene/reorder", entry_id: e, order: s }), kt = (t, e) => t.callWS({ type: "homex/scene/next", entry_id: e }), Ct = (t, e, s, r) => t.callWS({ type: "homex/scene/rename", entry_id: e, key: s, name: r }), A = (t) => t && (t.message || t.code) || String(t);
let le = null;
const De = () => !!customElements.get("ha-entities-picker");
function Et() {
  return De() ? Promise.resolve(!0) : le || (le = (async () => {
    try {
      const t = await window.loadCardHelpers?.();
      if (t?.createCardElement) {
        const s = (await t.createCardElement({
          type: "entities",
          entities: []
        }))?.constructor;
        s?.getConfigElement && await s.getConfigElement();
      }
    } catch {
    }
    return De();
  })(), le);
}
var St = "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z", Ht = "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z", Ot = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z", Pt = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z", Ne = "M3 6H21V4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H7V18H3V6M13 12H9V13.78C8.39 14.33 8 15.11 8 16C8 16.89 8.39 17.67 9 18.22V20H13V18.22C13.61 17.67 14 16.88 14 16S13.61 14.33 13 13.78V12M11 17.5C10.17 17.5 9.5 16.83 9.5 16S10.17 14.5 11 14.5 12.5 15.17 12.5 16 11.83 17.5 11 17.5M22 8H16C15.5 8 15 8.5 15 9V19C15 19.5 15.5 20 16 20H22C22.5 20 23 19.5 23 19V9C23 8.5 22.5 8 22 8M21 18H17V10H21V18Z", Lt = "M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z", Mt = "M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z", Vt = "M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z", zt = "M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z", Dt = "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z", Nt = "M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z", Tt = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z", Te = "M11,13.5V21.5H3V13.5H11M12,2L17.5,11H6.5L12,2M17.5,13C20,13 22,15 22,17.5C22,20 20,22 17.5,22C15,22 13,20 13,17.5C13,15 15,13 17.5,13Z", jt = "M7.5,2C5.71,3.15 4.5,5.18 4.5,7.5C4.5,9.82 5.71,11.85 7.53,13C4.46,13 2,10.54 2,7.5A5.5,5.5 0 0,1 7.5,2M19.07,3.5L20.5,4.93L4.93,20.5L3.5,19.07L19.07,3.5M12.89,5.93L11.41,5L9.97,6L10.39,4.3L9,3.24L10.75,3.12L11.33,1.47L12,3.1L13.73,3.13L12.38,4.26L12.89,5.93M9.59,9.54L8.43,8.81L7.31,9.59L7.65,8.27L6.56,7.44L7.92,7.35L8.37,6.06L8.88,7.33L10.24,7.36L9.19,8.23L9.59,9.54M19,13.5A5.5,5.5 0 0,1 13.5,19C12.28,19 11.15,18.6 10.24,17.93L17.93,10.24C18.6,11.15 19,12.28 19,13.5M14.6,20.08L17.37,18.93L17.13,22.28L14.6,20.08M18.93,17.38L20.08,14.61L22.28,17.15L18.93,17.38M20.08,12.42L18.94,9.64L22.28,9.88L20.08,12.42M9.63,18.93L12.4,20.08L9.87,22.27L9.63,18.93Z";
const B = x`
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
var Ut = Object.defineProperty, Rt = Object.getOwnPropertyDescriptor, J = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Rt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && Ut(e, s, i), i;
};
let D = class extends _ {
  _isOn(t) {
    return this.hass.states[t]?.state === "on";
  }
  _toggle(t) {
    t.stopPropagation(), this.hass.callService("switch", "toggle", { entity_id: this.unit.switch });
  }
  render() {
    const t = this.unit, e = this._isOn(t.switch);
    return n`
      <div class="controls">
        <button
          class="bulb ${e ? "on" : ""}"
          title=${e ? "Éteindre" : "Allumer"}
          @click=${this._toggle}
        >
          <svg viewBox="0 0 24 24">
            <path d=${e ? Mt : Vt}></path>
          </svg>
        </button>
        ${this.areaIcon ? n`<ha-icon class="area-icon" .icon=${this.areaIcon}></ha-icon>` : ""}
        <div class="title">
          <div class="line1">
            <strong>${t.name}</strong>
            ${e && this.activeScene ? n`<span class="active-scene">${this.activeScene}</span>` : ""}
          </div>
          <div class="line2">
            <span class="rid">${t.group_id || t.room_id}</span>
            ${this.floorName ? n`<span class="floor">${this.floorName}</span>` : ""}
          </div>
        </div>
      </div>
    `;
  }
};
D.styles = [
  B,
  x`
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
J([
  c({ attribute: !1 })
], D.prototype, "hass", 2);
J([
  c({ attribute: !1 })
], D.prototype, "unit", 2);
J([
  c({ attribute: !1 })
], D.prototype, "areaIcon", 2);
J([
  c({ attribute: !1 })
], D.prototype, "floorName", 2);
J([
  c({ attribute: !1 })
], D.prototype, "activeScene", 2);
D = J([
  b("homex-unit-controls")
], D);
const te = (t, e, s, r = "") => customElements.get("ha-textfield") ? n`<ha-textfield
      outlined
      .label=${t}
      .value=${e ?? ""}
      .placeholder=${r}
      @input=${(i) => s(i.target.value)}
    ></ha-textfield>` : n`<div class="field">
    <span>${t}</span>
    <input
      .value=${e ?? ""}
      placeholder=${r}
      @input=${(i) => s(i.target.value)}
    />
  </div>`, It = /[̀-ͯ]/g, $e = (t) => (t || "").normalize("NFD").replace(It, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
var Bt = Object.defineProperty, qt = Object.getOwnPropertyDescriptor, we = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? qt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && Bt(e, s, i), i;
};
let se = class extends _ {
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
        @click=${(t) => {
      t.target === t.currentTarget && this._close();
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
se.styles = x`
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
we([
  c({ type: Boolean })
], se.prototype, "open", 2);
we([
  c()
], se.prototype, "heading", 2);
se = we([
  b("homex-dialog")
], se);
var Wt = Object.defineProperty, Ft = Object.getOwnPropertyDescriptor, q = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Ft(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && Wt(e, s, i), i;
};
let S = class extends _ {
  constructor() {
    super(...arguments), this.value = [], this._query = "", this._open = !1;
  }
  _friendly(t) {
    return this.hass?.states?.[t]?.attributes?.friendly_name || t;
  }
  _emit(t) {
    this.value = t, this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: t } }));
  }
  _setAt(t, e) {
    const s = e ? this.value.map((r, i) => i === t ? e : r) : this.value.filter((r, i) => i !== t);
    this._emit([...new Set(s)]);
  }
  _addNew(t) {
    t && !this.value.includes(t) && this._emit([...this.value, t]);
  }
  _nativePicker(t, e) {
    return n`<ha-entity-picker
      .hass=${this.hass}
      .value=${t}
      .includeDomains=${this.includeDomains}
      .includeEntities=${this.includeEntities}
      @value-changed=${(s) => {
      s.stopPropagation(), e(s.detail.value || "");
    }}
    ></ha-entity-picker>`;
  }
  render() {
    return customElements.get("ha-entity-picker") ? n`
        ${this.value.map((t, e) => this._nativePicker(t, (s) => this._setAt(e, s)))}
        ${this._nativePicker("", (t) => this._addNew(t))}
      ` : this._renderFallback();
  }
  // --- fallback widget ---------------------------------------------------
  get _candidates() {
    if (this.includeEntities) return [...this.includeEntities].sort();
    const t = this.includeDomains || [];
    return Object.keys(this.hass.states).filter((e) => t.includes(e.split(".")[0])).sort();
  }
  get _filtered() {
    const t = new Set(this.value), e = this._query.trim().toLowerCase();
    return this._candidates.filter((s) => !t.has(s)).filter(
      (s) => !e || s.toLowerCase().includes(e) || this._friendly(s).toLowerCase().includes(e)
    ).slice(0, 10);
  }
  _add(t) {
    this.value.includes(t) || this._emit([...this.value, t]), this._query = "", this._open = !1;
  }
  _remove(t) {
    this._emit(this.value.filter((e) => e !== t));
  }
  _renderFallback() {
    return n`
      <div class="chips">
        ${this.value.map(
      (t) => n`<span class="chip"
              >${this._friendly(t)}<button
                class="chipx"
                title="Retirer"
                @click=${() => this._remove(t)}
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
        @input=${(t) => {
      this._query = t.target.value, this._open = !0;
    }}
        @blur=${() => setTimeout(() => this._open = !1, 200)}
      />
      ${this._open ? n`<div class="suggestions">
            ${this._filtered.length ? this._filtered.map(
      (t) => n`<div class="sugg" @mousedown=${() => this._add(t)}>
                    <span>${this._friendly(t)}</span><span class="sid">${t}</span>
                  </div>`
    ) : n`<div class="sugg empty">Aucune entité</div>`}
          </div>` : ""}
    `;
  }
};
S.styles = x`
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
q([
  c({ attribute: !1 })
], S.prototype, "hass", 2);
q([
  c({ type: Array })
], S.prototype, "value", 2);
q([
  c({ attribute: !1 })
], S.prototype, "includeDomains", 2);
q([
  c({ attribute: !1 })
], S.prototype, "includeEntities", 2);
q([
  d()
], S.prototype, "_query", 2);
q([
  d()
], S.prototype, "_open", 2);
S = q([
  b("homex-entity-picker")
], S);
const Zt = ["light", "switch", "input_boolean"], je = [
  "binary_sensor",
  "switch",
  "input_boolean",
  "person",
  "device_tracker"
];
var Gt = Object.defineProperty, Jt = Object.getOwnPropertyDescriptor, re = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Jt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && Gt(e, s, i), i;
};
let U = class extends _ {
  constructor() {
    super(...arguments), this.value = "", this._query = "", this._open = !1;
  }
  _name(t) {
    const e = this.hass?.devices?.[t];
    return e?.name_by_user || e?.name || t;
  }
  _emit(t) {
    this.value = t, this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: t } }));
  }
  get _filtered() {
    const t = this._query.trim().toLowerCase();
    return Object.keys(this.hass.devices || {}).filter((e) => !t || this._name(e).toLowerCase().includes(t)).sort((e, s) => this._name(e).localeCompare(this._name(s))).slice(0, 12);
  }
  render() {
    return customElements.get("ha-device-picker") ? n`<ha-device-picker
        .hass=${this.hass}
        .value=${this.value}
        @value-changed=${(t) => {
      t.stopPropagation(), this._emit(t.detail.value || "");
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
        @input=${(t) => {
      this._query = t.target.value, this._open = !0;
    }}
        @blur=${() => setTimeout(() => this._open = !1, 200)}
      />
      ${this._open ? n`<div class="suggestions">
            ${this._filtered.length ? this._filtered.map(
      (t) => n`<div
                      class="sugg"
                      @mousedown=${() => {
        this._query = "", this._open = !1, this._emit(t);
      }}
                    >
                      ${this._name(t)}
                    </div>`
    ) : n`<div class="sugg">Aucun appareil</div>`}
          </div>` : ""}
    `;
  }
};
U.styles = x`
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
re([
  c({ attribute: !1 })
], U.prototype, "hass", 2);
re([
  c()
], U.prototype, "value", 2);
re([
  d()
], U.prototype, "_query", 2);
re([
  d()
], U.prototype, "_open", 2);
U = re([
  b("homex-device-field")
], U);
var Kt = Object.defineProperty, Xt = Object.getOwnPropertyDescriptor, oe = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Xt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && Kt(e, s, i), i;
};
let R = class extends _ {
  constructor() {
    super(...arguments), this.value = [], this._menuOpen = !1, this._devTriggers = {};
  }
  willUpdate(t) {
    if (t.has("value"))
      for (const e of this.value) e?.device_id && this._ensure(e.device_id);
  }
  async _ensure(t) {
    if (!(t in this._devTriggers)) {
      this._devTriggers = { ...this._devTriggers, [t]: [] };
      try {
        const e = await xt(this.hass, t);
        this._devTriggers = { ...this._devTriggers, [t]: e };
      } catch {
      }
    }
  }
  _emit(t) {
    this.value = t, this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: t } }));
  }
  _update(t, e) {
    this._emit(this.value.map((s, r) => r === t ? e : s));
  }
  _remove(t) {
    this._emit(this.value.filter((e, s) => s !== t));
  }
  _add(t) {
    this._menuOpen = !1, this._emit([...this.value, t === "device" ? { device_id: "" } : { platform: "state" }]);
  }
  _entityOf(t) {
    const e = t?.entity_id;
    return Array.isArray(e) ? e[0] || "" : e || "";
  }
  _deviceTriggerIndex(t) {
    return (this._devTriggers[t.device_id] || []).findIndex(
      (s) => s.trigger.type === t.type && s.trigger.subtype === t.subtype && s.trigger.domain === t.domain
    );
  }
  _deviceName(t) {
    const e = this.hass?.devices?.[t];
    return e?.name_by_user || e?.name || t;
  }
  _entityField(t, e) {
    const s = this._entityOf(t), r = (o) => this._update(e, o ? { platform: "state", entity_id: o } : { platform: "state" });
    if (customElements.get("ha-entity-picker"))
      return n`<ha-entity-picker
        .hass=${this.hass}
        .value=${s}
        .includeDomains=${je}
        allow-custom-entity
        @value-changed=${(o) => {
        o.stopPropagation(), r(o.detail.value || "");
      }}
      ></ha-entity-picker>`;
    const i = Object.keys(this.hass.states).filter((o) => je.includes(o.split(".")[0])).sort();
    return n`<select class="native" @change=${(o) => r(o.target.value)}>
      <option value="">Sélectionnez une entité</option>
      ${i.map(
      (o) => n`<option value=${o} ?selected=${o === s}>
          ${this.hass.states[o]?.attributes?.friendly_name || o}
        </option>`
    )}
    </select>`;
  }
  _entityStates(t) {
    const e = t.split(".")[0], s = [
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
    ], r = new Set(s.includes(e) ? ["on", "off"] : []), i = this.hass.states[t]?.state;
    return i && !["unavailable", "unknown", ""].includes(i) && r.add(i), [...r];
  }
  _stateLabel(t) {
    return { on: "Activé (on)", off: "Désactivé (off)" }[t] || t;
  }
  _entityActionField(t, e) {
    const s = this._entityOf(t), r = typeof t.to == "string" ? t.to : "";
    return n`<select
      class="native"
      @change=${(i) => {
      const o = i.target.value;
      this._update(
        e,
        o ? { platform: "state", entity_id: s, to: o } : { platform: "state", entity_id: s }
      );
    }}
    >
      <option value="" ?selected=${!r}>À n'importe quel changement d'état</option>
      ${this._entityStates(s).map(
      (i) => n`<option value=${i} ?selected=${i === r}>Passe à : ${this._stateLabel(i)}</option>`
    )}
    </select>`;
  }
  _deviceField(t, e) {
    return n`<homex-device-field
      .hass=${this.hass}
      .value=${t.device_id || ""}
      @value-changed=${(s) => {
      s.stopPropagation();
      const r = s.detail.value || "";
      r && this._ensure(r), this._update(e, { device_id: r });
    }}
    ></homex-device-field>`;
  }
  _actionField(t, e) {
    const s = this._devTriggers[t.device_id] || [], r = this._deviceTriggerIndex(t);
    return n`<select
      class="native"
      @change=${(i) => {
      const o = Number(i.target.value), a = (this._devTriggers[t.device_id] || [])[o];
      a && this._update(e, { ...a.trigger });
    }}
    >
      <option value="-1" ?selected=${r < 0}>Sélectionnez une action</option>
      ${s.map(
      (i, o) => n`<option value=${o} ?selected=${o === r}>${i.label}</option>`
    )}
    </select>`;
  }
  _card(t, e) {
    const s = !!t?.device_id || t?.platform === "device";
    return n`<div class="card">
      <div class="head">
        <svg viewBox="0 0 24 24"><path d=${s ? Ne : Te}></path></svg>
        <span class="title">${s ? "Appareil" : "Entité"}</span>
        <button class="icon-btn" title="Supprimer" @click=${() => this._remove(e)}>
          <svg viewBox="0 0 24 24"><path d=${Ot}></path></svg>
        </button>
      </div>
      <div class="body">
        ${s ? n`<label class="field"><span>Appareil</span>${this._deviceField(t, e)}</label>
              ${t.device_id ? n`<label class="field"><span>Action</span>${this._actionField(t, e)}</label>` : ""}` : n`<label class="field"><span>Entité</span>${this._entityField(t, e)}</label>
              ${this._entityOf(t) ? n`<label class="field"><span>Action</span>${this._entityActionField(t, e)}</label>` : ""}`}
      </div>
    </div>`;
  }
  render() {
    return n`
      ${this.value.map((t, e) => this._card(t, e))}
      <div class="add-wrap">
        <button class="add-btn" @click=${() => this._menuOpen = !this._menuOpen}>
          <svg viewBox="0 0 24 24"><path d=${Tt}></path></svg>
          Ajouter un déclencheur
        </button>
        ${this._menuOpen ? n`
              <div class="backdrop" @click=${() => this._menuOpen = !1}></div>
              <div class="menu">
                <button @click=${() => this._add("entity")}>
                  <svg viewBox="0 0 24 24"><path d=${Te}></path></svg> Entité
                </button>
                <button @click=${() => this._add("device")}>
                  <svg viewBox="0 0 24 24"><path d=${Ne}></path></svg> Appareil
                </button>
              </div>
            ` : ""}
      </div>
    `;
  }
};
R.styles = x`
    :host {
      display: block;
      width: 100%;
    }
    .card {
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      border-radius: 12px;
      margin-bottom: 12px;
      overflow: hidden;
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
    select.native {
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
oe([
  c({ attribute: !1 })
], R.prototype, "hass", 2);
oe([
  c({ attribute: !1 })
], R.prototype, "value", 2);
oe([
  d()
], R.prototype, "_menuOpen", 2);
oe([
  d()
], R.prototype, "_devTriggers", 2);
R = oe([
  b("homex-trigger-selector")
], R);
var Qt = Object.defineProperty, Yt = Object.getOwnPropertyDescriptor, k = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Yt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && Qt(e, s, i), i;
};
let v = class extends _ {
  constructor() {
    super(...arguments), this.open = !1, this.group = null, this._name = "", this._id = "", this._devices = [], this._triggers = [], this._busy = !1, this._idEdited = !1;
  }
  willUpdate(t) {
    t.has("open") && this.open && (this._name = this.group?.name ?? "", this._id = this.group?.group_id ?? "", this._devices = this.group?.devices ?? [], this._triggers = (this.group?.triggers ?? []).map((e) => ({ ...e })), this._busy = !1, this._idEdited = !!this.group);
  }
  _onName(t) {
    this._name = t, this._idEdited || (this._id = $e(t));
  }
  _onId(t) {
    this._id = t, this._idEdited = !0;
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  async _save() {
    const t = this._name.trim(), e = this._id.trim();
    if (!t || !e) {
      alert("Nom et id du groupe requis.");
      return;
    }
    const s = this._triggers;
    this._busy = !0;
    try {
      this.group ? await yt(this.hass, {
        entry_id: this.room.entry_id,
        group_id: this.group.group_id,
        name: t,
        devices: this._devices,
        triggers: s
      }) : await bt(this.hass, {
        entry_id: this.room.entry_id,
        group_id: e,
        name: t,
        devices: this._devices,
        triggers: s
      }), z(this), this._close();
    } catch (r) {
      this._busy = !1, alert("Erreur Homex : " + A(r));
    }
  }
  async _delete() {
    if (this.group && confirm(`Supprimer le groupe "${this.group.group_id}" ?`)) {
      this._busy = !0;
      try {
        await $t(this.hass, this.room.entry_id, this.group.group_id), z(this), this._close();
      } catch (t) {
        this._busy = !1, alert("Erreur Homex : " + A(t));
      }
    }
  }
  render() {
    const t = !!this.group;
    return n`
      <homex-dialog
        .open=${this.open}
        heading=${t ? "Modifier le groupe" : "Nouveau groupe"}
        @dialog-closed=${this._close}
      >
        ${te("Nom", this._name, (e) => this._onName(e), "Table de chevet L")}
        ${t ? n`<div class="section">Id : ${this.group.group_id}</div>` : te("Id", this._id, (e) => this._onId(e), "bedside_l")}
        <div class="section">Appareils (parmi la pièce)</div>
        <homex-entity-picker
          .hass=${this.hass}
          .includeEntities=${this.room.devices}
          .value=${this._devices}
          @value-changed=${(e) => this._devices = e.detail.value}
        ></homex-entity-picker>
        <div class="section">Déclencheurs</div>
        <homex-trigger-selector
          .hass=${this.hass}
          .value=${this._triggers}
          @value-changed=${(e) => this._triggers = e.detail.value}
        ></homex-trigger-selector>

        <span slot="actions">
          ${t ? n`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
                Supprimer
              </button>` : ""}
          <button @click=${this._close}>Annuler</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            ${t ? "Enregistrer" : "Créer le groupe"}
          </button>
        </span>
      </homex-dialog>
    `;
  }
};
v.styles = B;
k([
  c({ attribute: !1 })
], v.prototype, "hass", 2);
k([
  c({ type: Boolean })
], v.prototype, "open", 2);
k([
  c({ attribute: !1 })
], v.prototype, "room", 2);
k([
  c({ attribute: !1 })
], v.prototype, "group", 2);
k([
  d()
], v.prototype, "_name", 2);
k([
  d()
], v.prototype, "_id", 2);
k([
  d()
], v.prototype, "_devices", 2);
k([
  d()
], v.prototype, "_triggers", 2);
k([
  d()
], v.prototype, "_busy", 2);
v = k([
  b("homex-group-dialog")
], v);
var es = Object.defineProperty, ts = Object.getOwnPropertyDescriptor, ae = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? ts(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && es(e, s, i), i;
};
let I = class extends _ {
  constructor() {
    super(...arguments), this._open = !1;
  }
  render() {
    return n`
      <div class="row">
        <homex-unit-controls .hass=${this.hass} .unit=${this.group}></homex-unit-controls>
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
I.styles = [
  B,
  x`
      .row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      homex-unit-controls {
        flex: 1;
      }
    `
];
ae([
  c({ attribute: !1 })
], I.prototype, "hass", 2);
ae([
  c({ attribute: !1 })
], I.prototype, "room", 2);
ae([
  c({ attribute: !1 })
], I.prototype, "group", 2);
ae([
  d()
], I.prototype, "_open", 2);
I = ae([
  b("homex-group-row")
], I);
var ss = Object.defineProperty, is = Object.getOwnPropertyDescriptor, C = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? is(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && ss(e, s, i), i;
};
let f = class extends _ {
  constructor() {
    super(...arguments), this.open = !1, this.room = null, this._name = "", this._id = "", this._areaId = "", this._devices = [], this._strategy = "recall_first", this._busy = !1, this._idEdited = !1;
  }
  willUpdate(t) {
    t.has("open") && this.open && (this._name = this.room?.name ?? "", this._id = this.room?.room_id ?? "", this._areaId = this.room?.area_id ?? "", this._devices = this.room?.devices ?? [], this._strategy = this.room?.scene_strategy ?? "recall_first", this._busy = !1, this._idEdited = !!this.room);
  }
  get _areas() {
    return Object.values(this.hass.areas || {}).map((t) => ({ area_id: t.area_id, name: t.name })).sort((t, e) => t.name.localeCompare(e.name));
  }
  _onName(t) {
    this._name = t, this._idEdited || (this._id = $e(t));
  }
  _onId(t) {
    this._id = t, this._idEdited = !0;
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  async _save() {
    const t = this._name.trim(), e = this._id.trim();
    if (!t || !e) {
      alert("Nom et id requis.");
      return;
    }
    this._busy = !0;
    try {
      const s = this._areaId || null;
      this.room ? await We(this.hass, {
        entry_id: this.room.entry_id,
        name: t,
        room_id: e,
        area_id: s,
        devices: this._devices,
        scene_strategy: this._strategy
      }) : await vt(this.hass, {
        name: t,
        room_id: e,
        area_id: s,
        devices: this._devices,
        scene_strategy: this._strategy
      }), z(this), this._close();
    } catch (s) {
      this._busy = !1, alert("Erreur Homex : " + A(s));
    }
  }
  render() {
    const t = !!this.room;
    return n`
      <homex-dialog
        .open=${this.open}
        heading=${t ? "Modifier la pièce" : "Nouvelle pièce"}
        @dialog-closed=${this._close}
      >
        ${te("Nom", this._name, (e) => this._onName(e), "Chambre")}
        ${te("Id", this._id, (e) => this._onId(e), "bedroom")}
        <div class="section">Pièce Home Assistant (optionnel)</div>
        <select
          .value=${this._areaId}
          @change=${(e) => this._areaId = e.target.value}
        >
          <option value="">— Aucune —</option>
          ${this._areas.map(
      (e) => n`<option value=${e.area_id}>${e.name}</option>`
    )}
        </select>
        <div class="section">Appareils de la pièce</div>
        <homex-entity-picker
          .hass=${this.hass}
          .includeDomains=${Zt}
          .value=${this._devices}
          @value-changed=${(e) => this._devices = e.detail.value}
        ></homex-entity-picker>

        <div class="section">Scene switching strategy</div>
        <select
          .value=${this._strategy}
          @change=${(e) => this._strategy = e.target.value}
        >
          <option value="recall_first">Repart de zéro</option>
          <option value="recall_last">Dernière utilisée</option>
        </select>
        <p class="hint">
          Quand un trigger scene-switching change de scène et que la pièce était
          éteinte : repartir de la première scène, ou reprendre la dernière utilisée.
        </p>

        <span slot="actions">
          <button @click=${this._close}>Annuler</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            ${t ? "Enregistrer" : "Créer la pièce"}
          </button>
        </span>
      </homex-dialog>
    `;
  }
};
f.styles = [
  B,
  x`
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
    `
];
C([
  c({ attribute: !1 })
], f.prototype, "hass", 2);
C([
  c({ type: Boolean })
], f.prototype, "open", 2);
C([
  c({ attribute: !1 })
], f.prototype, "room", 2);
C([
  d()
], f.prototype, "_name", 2);
C([
  d()
], f.prototype, "_id", 2);
C([
  d()
], f.prototype, "_areaId", 2);
C([
  d()
], f.prototype, "_devices", 2);
C([
  d()
], f.prototype, "_strategy", 2);
C([
  d()
], f.prototype, "_busy", 2);
f = C([
  b("homex-room-dialog")
], f);
var rs = Object.defineProperty, os = Object.getOwnPropertyDescriptor, W = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? os(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && rs(e, s, i), i;
};
let H = class extends _ {
  constructor() {
    super(...arguments), this.open = !1, this._toggle = [], this._scene = [], this._busy = !1;
  }
  willUpdate(t) {
    t.has("open") && this.open && (this._toggle = (this.room?.triggers ?? []).map((e) => ({ ...e })), this._scene = (this.room?.scene_triggers ?? []).map((e) => ({ ...e })), this._busy = !1);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  async _save() {
    this._busy = !0;
    try {
      await We(this.hass, {
        entry_id: this.room.entry_id,
        triggers: this._toggle,
        scene_triggers: this._scene
      }), z(this), this._close();
    } catch (t) {
      this._busy = !1, alert("Erreur Homex : " + A(t));
    }
  }
  render() {
    return n`
      <homex-dialog
        .open=${this.open}
        heading="Déclencheurs de la pièce"
        @dialog-closed=${this._close}
      >
        <div class="group">
          <div class="section">Triggers toggle (allumer / éteindre)</div>
          <p class="hint">
            Chaque déclenchement permute l'état on/off de la pièce.
          </p>
          <homex-trigger-selector
            .hass=${this.hass}
            .value=${this._toggle}
            @value-changed=${(t) => this._toggle = t.detail.value}
          ></homex-trigger-selector>
        </div>

        <div class="group">
          <div class="section">Triggers scene switching</div>
          <p class="hint">Chaque déclenchement passe à la scène suivante (cycle).</p>
          <homex-trigger-selector
            .hass=${this.hass}
            .value=${this._scene}
            @value-changed=${(t) => this._scene = t.detail.value}
          ></homex-trigger-selector>
          <p class="hint">
            La stratégie (repart de zéro / dernière utilisée) se règle dans
            « Modifier la pièce ».
          </p>
        </div>

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
H.styles = [
  B,
  x`
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
W([
  c({ attribute: !1 })
], H.prototype, "hass", 2);
W([
  c({ type: Boolean })
], H.prototype, "open", 2);
W([
  c({ attribute: !1 })
], H.prototype, "room", 2);
W([
  d()
], H.prototype, "_toggle", 2);
W([
  d()
], H.prototype, "_scene", 2);
W([
  d()
], H.prototype, "_busy", 2);
H = W([
  b("homex-triggers-dialog")
], H);
var as = Object.defineProperty, ns = Object.getOwnPropertyDescriptor, O = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? ns(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && as(e, s, i), i;
};
let y = class extends _ {
  constructor() {
    super(...arguments), this.open = !1, this.scene = null, this._name = "", this._mode = "new", this._attachId = "", this._busy = !1;
  }
  willUpdate(t) {
    t.has("open") && this.open && (this._name = this.scene?.name ?? "", this._mode = "new", this._attachId = "", this._busy = !1);
  }
  // Existing HA scenes that are not already Homex-managed.
  get _availableScenes() {
    return Object.keys(this.hass.states).filter((t) => t.startsWith("scene.")).map((t) => {
      const e = this.hass.states[t].attributes || {};
      return {
        config_id: e.id ? String(e.id) : "",
        name: e.friendly_name || t
      };
    }).filter((t) => t.config_id && !t.config_id.startsWith("homex_")).sort((t, e) => t.name.localeCompare(e.name));
  }
  // The proposed name must not collide with another scene of the room.
  get _nameTaken() {
    const t = this._name.trim();
    if (!t) return !1;
    const e = $e(t);
    return this.room.scenes.some((s) => this.scene && s.key === this.scene.key ? !1 : s.name.toLowerCase() === t.toLowerCase() || s.key === e);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  _onPickScene(t) {
    if (this._attachId = t, !this._name.trim()) {
      const e = this._availableScenes.find((s) => s.config_id === t);
      e && (this._name = e.name);
    }
  }
  async _save() {
    const t = this._name.trim();
    if (!(!t || this._nameTaken)) {
      if (!this.scene && this._mode === "attach" && !this._attachId) {
        alert("Choisis une scène existante à rattacher.");
        return;
      }
      this._busy = !0;
      try {
        this.scene ? await Ct(this.hass, this.room.entry_id, this.scene.key, t) : this._mode === "attach" ? await ze(this.hass, this.room.entry_id, t, this._attachId) : await ze(this.hass, this.room.entry_id, t), z(this), this._close();
      } catch (e) {
        this._busy = !1, alert("Erreur Homex : " + A(e));
      }
    }
  }
  render() {
    const t = !!this.scene, e = this._nameTaken, s = !!this._name.trim() && !e;
    return n`
      <homex-dialog
        .open=${this.open}
        heading=${t ? "Renommer la scène" : "Nouvelle scène"}
        @dialog-closed=${this._close}
      >
        ${te("Nom de la scène", this._name, (r) => this._name = r, "Nuit")}
        ${e ? n`<div class="err">Ce nom de scène existe déjà.</div>` : ""}
        ${t ? "" : this._renderModePicker()}
        <span slot="actions">
          <button @click=${this._close}>Annuler</button>
          <button class="primary" ?disabled=${this._busy || !s} @click=${this._save}>
            ${t ? "Renommer" : this._mode === "attach" ? "Rattacher" : "Créer la scène"}
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
              @change=${(t) => this._onPickScene(t.target.value)}
            >
              <option value="">— Choisir une scène —</option>
              ${this._availableScenes.map(
      (t) => n`<option value=${t.config_id}>${t.name}</option>`
    )}
            </select>
          `}
    `;
  }
};
y.styles = [
  B,
  x`
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
O([
  c({ attribute: !1 })
], y.prototype, "hass", 2);
O([
  c({ type: Boolean })
], y.prototype, "open", 2);
O([
  c({ attribute: !1 })
], y.prototype, "room", 2);
O([
  c({ attribute: !1 })
], y.prototype, "scene", 2);
O([
  d()
], y.prototype, "_name", 2);
O([
  d()
], y.prototype, "_mode", 2);
O([
  d()
], y.prototype, "_attachId", 2);
O([
  d()
], y.prototype, "_busy", 2);
y = O([
  b("homex-scene-dialog")
], y);
var ls = Object.defineProperty, cs = Object.getOwnPropertyDescriptor, P = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? cs(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && ls(e, s, i), i;
};
let $ = class extends _ {
  constructor() {
    super(...arguments), this.expanded = !1, this._dialog = "", this._menuOpen = !1, this._renameScene = null, this._deleteScenes = !0, this._deleting = !1, this._close = () => this._dialog = "", this._delete = () => {
      this._menuOpen = !1, this._deleteScenes = !0, this._dialog = "delete";
    }, this._confirmDelete = async () => {
      this._deleting = !0;
      try {
        await ft(this.hass, this.room.entry_id, this._deleteScenes), this._dialog = "", z(this);
      } catch (t) {
        alert("Erreur Homex : " + A(t));
      } finally {
        this._deleting = !1;
      }
    }, this._sceneNext = async (t) => {
      t?.stopPropagation();
      try {
        await kt(this.hass, this.room.entry_id);
      } catch (e) {
        alert("Erreur Homex : " + A(e));
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
  _pick(t) {
    this._menuOpen = !1, this._dialog = t;
  }
  _isOn() {
    return this.hass.states[this.room.switch]?.state === "on";
  }
  _openHa(t) {
    window.open(`/config/scene/edit/${t.config_id}`, "_blank", "noopener");
  }
  async _deleteScene(t) {
    if (confirm(`Supprimer la scène "${t.name}" ?`))
      try {
        await wt(this.hass, this.room.entry_id, t.key), z(this);
      } catch (e) {
        alert("Erreur Homex : " + A(e));
      }
  }
  async _sceneMoved(t) {
    const { oldIndex: e, newIndex: s } = t.detail, r = this.room.scenes.filter((o) => o.orderable).map((o) => o.key), [i] = r.splice(e, 1);
    r.splice(s, 0, i);
    try {
      await At(this.hass, this.room.entry_id, r), z(this);
    } catch (o) {
      alert("Erreur Homex : " + A(o));
    }
  }
  _iconBtn(t, e, s, r = !1) {
    return n`<button
      class="icon-btn"
      title=${e}
      aria-label=${e}
      ?disabled=${r}
      @click=${s}
    >
      <svg viewBox="0 0 24 24"><path d=${t}></path></svg>
    </button>`;
  }
  _sceneRow(t, e) {
    return n`
      <div class="scene-row">
        ${t.orderable ? n`<span class="handle" title="Glisser pour réordonner">
              <svg viewBox="0 0 24 24"><path d=${Lt}></path></svg>
            </span>` : n`<span class="pin" title="Toujours en dernier">
              <svg viewBox="0 0 24 24"><path d=${Nt}></path></svg>
            </span>`}
        <span class="scene-name">${t.name}</span>
        ${t.key === e ? n`<span class="active-tag">active</span>` : ""}
        <span class="btn-group">
          ${this._iconBtn(
      zt,
      "Voir dans Home Assistant",
      () => this._openHa(t)
    )}
          ${this._iconBtn(Dt, "Renommer", () => this._renameScene = t)}
          ${this._iconBtn(
      Pt,
      t.removable ? "Supprimer" : "Scène par défaut",
      () => this._deleteScene(t),
      !t.removable
    )}
        </span>
      </div>
    `;
  }
  render() {
    const t = this.room, s = this._isOn() ? this.hass.states[t.switch]?.attributes?.active_scene ?? null : null, r = s ? t.scenes.find((h) => h.key === s)?.name : void 0, i = t.area_id ? this.hass.areas?.[t.area_id] : null, o = i?.icon || void 0, p = (i?.floor_id ? this.hass.floors?.[i.floor_id] : null)?.name || void 0, l = t.scenes.filter((h) => h.orderable), g = t.scenes.filter((h) => !h.orderable);
    return n`
      <ha-card>
        <div class="head" @click=${this._toggleExpand} title="Plier / déplier">
          <svg class="chevron" viewBox="0 0 24 24">
            <path d=${this.expanded ? Ht : St}></path>
          </svg>
          <homex-unit-controls
            .hass=${this.hass}
            .unit=${t}
            .areaIcon=${o}
            .floorName=${p}
            .activeScene=${r}
          ></homex-unit-controls>
          <div class="head-actions">
            <button
              class="round"
              title="Changer de scène"
              @click=${(h) => this._sceneNext(h)}
            >
              <svg viewBox="0 0 24 24"><path d=${jt}></path></svg>
            </button>
            <button
              class="kebab"
              title="Actions"
              @click=${(h) => {
      h.stopPropagation(), this._menuOpen = !0;
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
                <button @click=${() => this._pick("triggers")}>
                  ⚡ Déclencheurs (${t.triggers.length + t.scene_triggers.length})
                </button>
                <button @click=${() => this._pick("addgroup")}>
                  ＋ Ajouter un groupe
                </button>
                <div class="sep"></div>
                <button class="danger-item" @click=${this._delete}>
                  🗑 Supprimer la pièce
                </button>
              </div>
            ` : ""}

        <div class="stats">
          <span class="stat">🔌 ${t.devices.length} appareil(s)</span>
          <span class="stat">🎬 ${t.scenes.length} scène(s)</span>
          ${t.groups.length ? n`<span class="stat">📦 ${t.groups.length} groupe(s)</span>` : ""}
        </div>
        ${this.expanded ? this._renderBody(t, s, l, g) : ""}
      </ha-card>

      ${this._renderDialogs(t)}
    `;
  }
  _renderBody(t, e, s, r) {
    return n`
        <div class="section-row">
          <span class="section">Scènes</span>
          <button @click=${() => this._pick("addscene")}>＋ Scène</button>
        </div>
        <ha-sortable handle-selector=".handle" @item-moved=${this._sceneMoved}>
          <div>${s.map((i) => this._sceneRow(i, e))}</div>
        </ha-sortable>
        ${r.map((i) => this._sceneRow(i, e))}

        ${t.groups.length ? n`
              <div class="section-row">
                <span class="section">Groupes</span>
                <button @click=${() => this._pick("addgroup")}>＋ Groupe</button>
              </div>
              <div class="groups">
                ${t.groups.map(
      (i) => n`<homex-group-row
                    .hass=${this.hass}
                    .room=${t}
                    .group=${i}
                  ></homex-group-row>`
    )}
              </div>
            ` : ""}
    `;
  }
  _renderDialogs(t) {
    return n`
      <homex-room-dialog
        .hass=${this.hass}
        .room=${t}
        .open=${this._dialog === "room"}
        @dialog-closed=${this._close}
      ></homex-room-dialog>
      <homex-triggers-dialog
        .hass=${this.hass}
        .room=${t}
        .open=${this._dialog === "triggers"}
        @dialog-closed=${this._close}
      ></homex-triggers-dialog>
      <homex-group-dialog
        .hass=${this.hass}
        .room=${t}
        .group=${null}
        .open=${this._dialog === "addgroup"}
        @dialog-closed=${this._close}
      ></homex-group-dialog>
      <homex-scene-dialog
        .hass=${this.hass}
        .room=${t}
        .scene=${null}
        .open=${this._dialog === "addscene"}
        @dialog-closed=${this._close}
      ></homex-scene-dialog>
      <homex-scene-dialog
        .hass=${this.hass}
        .room=${t}
        .scene=${this._renameScene}
        .open=${this._renameScene !== null}
        @dialog-closed=${() => this._renameScene = null}
      ></homex-scene-dialog>
      ${this._dialog === "delete" ? this._renderDeleteConfirm(t) : ""}
    `;
  }
  _renderDeleteConfirm(t) {
    return n`
      <div
        class="confirm-backdrop"
        @click=${(e) => {
      e.target === e.currentTarget && !this._deleting && this._close();
    }}
      >
        <div class="confirm-card" role="dialog" aria-modal="true">
          <h3>Supprimer la pièce « ${t.name} » ?</h3>
          <p class="confirm-text">
            Le switch, le groupe de lumières et les déclencheurs de cette pièce
            seront supprimés. Cette action est irréversible.
          </p>
          <label class="toggle-row">
            <span class="toggle ${this._deleteScenes ? "on" : ""}">
              <input
                type="checkbox"
                .checked=${this._deleteScenes}
                @change=${(e) => this._deleteScenes = e.target.checked}
              />
              <span class="knob"></span>
            </span>
            <span class="toggle-label">
              Supprimer aussi les ${t.scenes.length} scène(s) associée(s)
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
$.styles = [
  B,
  x`
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
P([
  c({ attribute: !1 })
], $.prototype, "hass", 2);
P([
  c({ attribute: !1 })
], $.prototype, "room", 2);
P([
  c({ type: Boolean })
], $.prototype, "expanded", 2);
P([
  d()
], $.prototype, "_dialog", 2);
P([
  d()
], $.prototype, "_menuOpen", 2);
P([
  d()
], $.prototype, "_renameScene", 2);
P([
  d()
], $.prototype, "_deleteScenes", 2);
P([
  d()
], $.prototype, "_deleting", 2);
$ = P([
  b("homex-room-card")
], $);
var ds = Object.defineProperty, ps = Object.getOwnPropertyDescriptor, L = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? ps(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && ds(e, s, i), i;
};
const hs = "42";
let w = class extends _ {
  constructor() {
    super(...arguments), this.narrow = !1, this._rooms = null, this._error = null, this._createOpen = !1, this._expanded = localStorage.getItem("homex_expanded") || null, this._loaded = !1, this._onToggleExpand = (t) => {
      const e = t.detail.entry_id;
      this._expanded = this._expanded === e ? null : e, this._expanded ? localStorage.setItem("homex_expanded", this._expanded) : localStorage.removeItem("homex_expanded");
    }, this._reload = async () => {
      try {
        this._rooms = await _t(this.hass), this._error = null;
      } catch (t) {
        this._error = A(t);
      }
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener(me, this._reload), this.addEventListener("homex-toggle-expand", this._onToggleExpand);
  }
  disconnectedCallback() {
    this.removeEventListener(me, this._reload), this.removeEventListener("homex-toggle-expand", this._onToggleExpand), super.disconnectedCallback();
  }
  updated(t) {
    t.has("hass") && this.hass && !this._loaded && (this._loaded = !0, Et().then(() => this.requestUpdate()), this._reload());
  }
  _roomCard(t) {
    return n`<homex-room-card
      .hass=${this.hass}
      .room=${t}
      .expanded=${t.entry_id === this._expanded}
    ></homex-room-card>`;
  }
  // Split rooms: unlinked/no-floor first, then one group per floor (by level).
  _grouped() {
    const t = [], e = /* @__PURE__ */ new Map();
    for (const r of this._rooms || []) {
      const o = (r.area_id ? this.hass.areas?.[r.area_id] : null)?.floor_id;
      o && this.hass.floors?.[o] ? (e.get(o) ?? e.set(o, []).get(o)).push(r) : t.push(r);
    }
    const s = [...e.keys()].map((r) => this.hass.floors[r]).sort(
      (r, i) => (r.level ?? 0) - (i.level ?? 0) || r.name.localeCompare(i.name)
    );
    return { ungrouped: t, floors: s, byFloor: e };
  }
  render() {
    let t;
    if (this._error)
      t = n`<div class="msg err">Erreur : ${this._error}</div>`;
    else if (!this._rooms)
      t = n`<div class="msg">Chargement…</div>`;
    else if (!this._rooms.length)
      t = n`<div class="msg">
        Aucune pièce. Clique sur <strong>＋ Nouvelle pièce</strong> en haut à
        droite pour en créer une.
      </div>`;
    else {
      const { ungrouped: e, floors: s, byFloor: r } = this._grouped();
      t = n`
        ${e.map((i) => this._roomCard(i))}
        ${s.map(
        (i) => n`
            <div class="floor-header">
              ${i.icon ? n`<ha-icon .icon=${i.icon}></ha-icon>` : ""}
              <span>${i.name}</span>
            </div>
            ${(r.get(i.floor_id) || []).map(
          (o) => this._roomCard(o)
        )}
          `
      )}
      `;
    }
    return n`
      <div class="wrap">
        <header>
          <h1>Homex <span class="ver">v${hs}</span></h1>
          <div class="header-actions">
            <button @click=${this._reload}>Rafraîchir</button>
            <button class="primary" @click=${() => this._createOpen = !0}>
              ＋ Nouvelle pièce
            </button>
          </div>
        </header>
        ${t}
      </div>
      <homex-room-dialog
        .hass=${this.hass}
        .room=${null}
        .open=${this._createOpen}
        @dialog-closed=${() => this._createOpen = !1}
      ></homex-room-dialog>
    `;
  }
};
w.styles = x`
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
L([
  c({ attribute: !1 })
], w.prototype, "hass", 2);
L([
  c({ attribute: !1 })
], w.prototype, "narrow", 2);
L([
  c({ attribute: !1 })
], w.prototype, "route", 2);
L([
  c({ attribute: !1 })
], w.prototype, "panel", 2);
L([
  d()
], w.prototype, "_rooms", 2);
L([
  d()
], w.prototype, "_error", 2);
L([
  d()
], w.prototype, "_createOpen", 2);
L([
  d()
], w.prototype, "_expanded", 2);
w = L([
  b("homex-panel")
], w);
export {
  w as HomexPanel
};
