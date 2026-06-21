/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ne = globalThis, me = ne.ShadowRoot && (ne.ShadyCSS === void 0 || ne.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, _e = Symbol(), we = /* @__PURE__ */ new WeakMap();
let Ne = class {
  constructor(e, s, i) {
    if (this._$cssResult$ = !0, i !== _e) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (me && e === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (e = we.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && we.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Te = (t) => new Ne(typeof t == "string" ? t : t + "", void 0, _e), $ = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((i, r, o) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[o + 1], t[0]);
  return new Ne(s, t, _e);
}, Ie = (t, e) => {
  if (me) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const i = document.createElement("style"), r = ne.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = s.cssText, t.appendChild(i);
  }
}, Ae = me ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const i of e.cssRules) s += i.cssText;
  return Te(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Be, defineProperty: qe, getOwnPropertyDescriptor: We, getOwnPropertyNames: Ze, getOwnPropertySymbols: Ge, getPrototypeOf: Fe } = Object, pe = globalThis, Ee = pe.trustedTypes, Je = Ee ? Ee.emptyScript : "", Ke = pe.reactiveElementPolyfillSupport, Q = (t, e) => t, le = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Je : null;
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
} }, fe = (t, e) => !Be(t, e), Ce = { attribute: !0, type: String, converter: le, reflect: !1, useDefault: !1, hasChanged: fe };
Symbol.metadata ??= Symbol("metadata"), pe.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let W = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = Ce) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, s);
      r !== void 0 && qe(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, s, i) {
    const { get: r, set: o } = We(this.prototype, e) ?? { get() {
      return this[s];
    }, set(a) {
      this[s] = a;
    } };
    return { get: r, set(a) {
      const d = r?.call(this);
      o?.call(this, a), this.requestUpdate(e, d, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Ce;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Q("elementProperties"))) return;
    const e = Fe(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Q("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Q("properties"))) {
      const s = this.properties, i = [...Ze(s), ...Ge(s)];
      for (const r of i) this.createProperty(r, s[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const s = litPropertyMetadata.get(e);
      if (s !== void 0) for (const [i, r] of s) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const r = this._$Eu(s, i);
      r !== void 0 && this._$Eh.set(r, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const s = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const r of i) s.unshift(Ae(r));
    } else e !== void 0 && s.push(Ae(e));
    return s;
  }
  static _$Eu(e, s) {
    const i = s.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
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
    for (const i of s.keys()) this.hasOwnProperty(i) && (e.set(i, this[i]), delete this[i]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ie(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, s, i) {
    this._$AK(e, i);
  }
  _$ET(e, s) {
    const i = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, i);
    if (r !== void 0 && i.reflect === !0) {
      const o = (i.converter?.toAttribute !== void 0 ? i.converter : le).toAttribute(s, i.type);
      this._$Em = e, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const o = i.getPropertyOptions(r), a = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : le;
      this._$Em = r;
      const d = a.fromAttribute(s, o.type);
      this[r] = d ?? this._$Ej?.get(r) ?? d, this._$Em = null;
    }
  }
  requestUpdate(e, s, i, r = !1, o) {
    if (e !== void 0) {
      const a = this.constructor;
      if (r === !1 && (o = this[e]), i ??= a.getPropertyOptions(e), !((i.hasChanged ?? fe)(o, s) || i.useDefault && i.reflect && o === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, i)))) return;
      this.C(e, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: i, reflect: r, wrapped: o }, a) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? s ?? this[e]), o !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (s = void 0), this._$AL.set(e, s)), r === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [r, o] of this._$Ep) this[r] = o;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [r, o] of i) {
        const { wrapped: a } = o, d = this[r];
        a !== !0 || this._$AL.has(r) || d === void 0 || this.C(r, void 0, o, d);
      }
    }
    let e = !1;
    const s = this._$AL;
    try {
      e = this.shouldUpdate(s), e ? (this.willUpdate(s), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (i) {
      throw e = !1, this._$EM(), i;
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
W.elementStyles = [], W.shadowRootOptions = { mode: "open" }, W[Q("elementProperties")] = /* @__PURE__ */ new Map(), W[Q("finalized")] = /* @__PURE__ */ new Map(), Ke?.({ ReactiveElement: W }), (pe.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ve = globalThis, Se = (t) => t, ce = ve.trustedTypes, ke = ce ? ce.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, De = "$lit$", M = `lit$${Math.random().toFixed(9).slice(2)}$`, Ve = "?" + M, Qe = `<${Ve}>`, R = document, X = () => R.createComment(""), Y = (t) => t === null || typeof t != "object" && typeof t != "function", xe = Array.isArray, Xe = (t) => xe(t) || typeof t?.[Symbol.iterator] == "function", ue = `[ 	
\f\r]`, K = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, He = /-->/g, Pe = />/g, V = RegExp(`>|${ue}(?:([^\\s"'>=/]+)(${ue}*=${ue}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Oe = /'/g, Le = /"/g, je = /^(?:script|style|textarea|title)$/i, Ye = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), n = Ye(1), Z = Symbol.for("lit-noChange"), m = Symbol.for("lit-nothing"), Me = /* @__PURE__ */ new WeakMap(), j = R.createTreeWalker(R, 129);
function Re(t, e) {
  if (!xe(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ke !== void 0 ? ke.createHTML(e) : e;
}
const et = (t, e) => {
  const s = t.length - 1, i = [];
  let r, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = K;
  for (let d = 0; d < s; d++) {
    const l = t[d];
    let g, h, u = -1, C = 0;
    for (; C < l.length && (a.lastIndex = C, h = a.exec(l), h !== null); ) C = a.lastIndex, a === K ? h[1] === "!--" ? a = He : h[1] !== void 0 ? a = Pe : h[2] !== void 0 ? (je.test(h[2]) && (r = RegExp("</" + h[2], "g")), a = V) : h[3] !== void 0 && (a = V) : a === V ? h[0] === ">" ? (a = r ?? K, u = -1) : h[1] === void 0 ? u = -2 : (u = a.lastIndex - h[2].length, g = h[1], a = h[3] === void 0 ? V : h[3] === '"' ? Le : Oe) : a === Le || a === Oe ? a = V : a === He || a === Pe ? a = K : (a = V, r = void 0);
    const L = a === V && t[d + 1].startsWith("/>") ? " " : "";
    o += a === K ? l + Qe : u >= 0 ? (i.push(g), l.slice(0, u) + De + l.slice(u) + M + L) : l + M + (u === -2 ? d : L);
  }
  return [Re(t, o + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class ee {
  constructor({ strings: e, _$litType$: s }, i) {
    let r;
    this.parts = [];
    let o = 0, a = 0;
    const d = e.length - 1, l = this.parts, [g, h] = et(e, s);
    if (this.el = ee.createElement(g, i), j.currentNode = this.el.content, s === 2 || s === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (r = j.nextNode()) !== null && l.length < d; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const u of r.getAttributeNames()) if (u.endsWith(De)) {
          const C = h[a++], L = r.getAttribute(u).split(M), oe = /([.?@])?(.*)/.exec(C);
          l.push({ type: 1, index: o, name: oe[2], strings: L, ctor: oe[1] === "." ? st : oe[1] === "?" ? it : oe[1] === "@" ? rt : he }), r.removeAttribute(u);
        } else u.startsWith(M) && (l.push({ type: 6, index: o }), r.removeAttribute(u));
        if (je.test(r.tagName)) {
          const u = r.textContent.split(M), C = u.length - 1;
          if (C > 0) {
            r.textContent = ce ? ce.emptyScript : "";
            for (let L = 0; L < C; L++) r.append(u[L], X()), j.nextNode(), l.push({ type: 2, index: ++o });
            r.append(u[C], X());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Ve) l.push({ type: 2, index: o });
      else {
        let u = -1;
        for (; (u = r.data.indexOf(M, u + 1)) !== -1; ) l.push({ type: 7, index: o }), u += M.length - 1;
      }
      o++;
    }
  }
  static createElement(e, s) {
    const i = R.createElement("template");
    return i.innerHTML = e, i;
  }
}
function G(t, e, s = t, i) {
  if (e === Z) return e;
  let r = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const o = Y(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== o && (r?._$AO?.(!1), o === void 0 ? r = void 0 : (r = new o(t), r._$AT(t, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = r : s._$Cl = r), r !== void 0 && (e = G(t, r._$AS(t, e.values), r, i)), e;
}
class tt {
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
    const { el: { content: s }, parts: i } = this._$AD, r = (e?.creationScope ?? R).importNode(s, !0);
    j.currentNode = r;
    let o = j.nextNode(), a = 0, d = 0, l = i[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let g;
        l.type === 2 ? g = new ie(o, o.nextSibling, this, e) : l.type === 1 ? g = new l.ctor(o, l.name, l.strings, this, e) : l.type === 6 && (g = new ot(o, this, e)), this._$AV.push(g), l = i[++d];
      }
      a !== l?.index && (o = j.nextNode(), a++);
    }
    return j.currentNode = R, r;
  }
  p(e) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, s), s += i.strings.length - 2) : i._$AI(e[s])), s++;
  }
}
class ie {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, i, r) {
    this.type = 2, this._$AH = m, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = i, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    e = G(this, e, s), Y(e) ? e === m || e == null || e === "" ? (this._$AH !== m && this._$AR(), this._$AH = m) : e !== this._$AH && e !== Z && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Xe(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== m && Y(this._$AH) ? this._$AA.nextSibling.data = e : this.T(R.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = ee.createElement(Re(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(s);
    else {
      const o = new tt(r, this), a = o.u(this.options);
      o.p(s), this.T(a), this._$AH = o;
    }
  }
  _$AC(e) {
    let s = Me.get(e.strings);
    return s === void 0 && Me.set(e.strings, s = new ee(e)), s;
  }
  k(e) {
    xe(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, r = 0;
    for (const o of e) r === s.length ? s.push(i = new ie(this.O(X()), this.O(X()), this, this.options)) : i = s[r], i._$AI(o), r++;
    r < s.length && (this._$AR(i && i._$AB.nextSibling, r), s.length = r);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const i = Se(e).nextSibling;
      Se(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class he {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, i, r, o) {
    this.type = 1, this._$AH = m, this._$AN = void 0, this.element = e, this.name = s, this._$AM = r, this.options = o, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = m;
  }
  _$AI(e, s = this, i, r) {
    const o = this.strings;
    let a = !1;
    if (o === void 0) e = G(this, e, s, 0), a = !Y(e) || e !== this._$AH && e !== Z, a && (this._$AH = e);
    else {
      const d = e;
      let l, g;
      for (e = o[0], l = 0; l < o.length - 1; l++) g = G(this, d[i + l], s, l), g === Z && (g = this._$AH[l]), a ||= !Y(g) || g !== this._$AH[l], g === m ? e = m : e !== m && (e += (g ?? "") + o[l + 1]), this._$AH[l] = g;
    }
    a && !r && this.j(e);
  }
  j(e) {
    e === m ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class st extends he {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === m ? void 0 : e;
  }
}
class it extends he {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== m);
  }
}
class rt extends he {
  constructor(e, s, i, r, o) {
    super(e, s, i, r, o), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = G(this, e, s, 0) ?? m) === Z) return;
    const i = this._$AH, r = e === m && i !== m || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, o = e !== m && (i === m || r);
    r && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class ot {
  constructor(e, s, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    G(this, e);
  }
}
const at = ve.litHtmlPolyfillSupport;
at?.(ee, ie), (ve.litHtmlVersions ??= []).push("3.3.3");
const nt = (t, e, s) => {
  const i = s?.renderBefore ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const o = s?.renderBefore ?? null;
    i._$litPart$ = r = new ie(e.insertBefore(X(), o), o, void 0, s ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const be = globalThis;
class _ extends W {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = nt(s, this.renderRoot, this.renderOptions);
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
_._$litElement$ = !0, _.finalized = !0, be.litElementHydrateSupport?.({ LitElement: _ });
const lt = be.litElementPolyfillSupport;
lt?.({ LitElement: _ });
(be.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const y = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct = { attribute: !0, type: String, converter: le, reflect: !1, hasChanged: fe }, dt = (t = ct, e, s) => {
  const { kind: i, metadata: r } = s;
  let o = globalThis.litPropertyMetadata.get(r);
  if (o === void 0 && globalThis.litPropertyMetadata.set(r, o = /* @__PURE__ */ new Map()), i === "setter" && ((t = Object.create(t)).wrapped = !0), o.set(s.name, t), i === "accessor") {
    const { name: a } = s;
    return { set(d) {
      const l = e.get.call(this);
      e.set.call(this, d), this.requestUpdate(a, l, t, !0, d);
    }, init(d) {
      return d !== void 0 && this.C(a, void 0, t, d), d;
    } };
  }
  if (i === "setter") {
    const { name: a } = s;
    return function(d) {
      const l = this[a];
      e.call(this, d), this.requestUpdate(a, l, t, !0, d);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function c(t) {
  return (e, s) => typeof s == "object" ? dt(t, e, s) : ((i, r, o) => {
    const a = r.hasOwnProperty(o);
    return r.constructor.createProperty(o, i), a ? Object.getOwnPropertyDescriptor(r, o) : void 0;
  })(t, e, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function p(t) {
  return c({ ...t, state: !0, attribute: !1 });
}
const ge = "homex-changed", z = (t) => t.dispatchEvent(new CustomEvent(ge, { bubbles: !0, composed: !0 })), pt = async (t) => (await t.callWS({ type: "homex/rooms" })).rooms || [], ht = (t, e) => t.callWS({ type: "homex/room/create", ...e }), ut = (t, e) => t.callWS({ type: "homex/room/delete", entry_id: e }), gt = async (t, e) => (await t.callWS({ type: "homex/device_actions", device_id: e })).actions || [], Ue = (t, e) => t.callWS({ type: "homex/room/update", ...e }), mt = (t, e) => t.callWS({ type: "homex/group/add", ...e }), _t = (t, e) => t.callWS({ type: "homex/group/update", ...e }), ft = (t, e, s) => t.callWS({ type: "homex/group/delete", entry_id: e, group_id: s }), ze = (t, e, s, i) => t.callWS({
  type: "homex/scene/add",
  entry_id: e,
  name: s,
  ...i ? { attach: i } : {}
}), vt = (t, e, s) => t.callWS({ type: "homex/scene/delete", entry_id: e, key: s }), xt = (t, e, s) => t.callWS({ type: "homex/scene/reorder", entry_id: e, order: s }), bt = (t, e) => t.callWS({ type: "homex/scene/next", entry_id: e }), $t = (t, e, s, i) => t.callWS({ type: "homex/scene/rename", entry_id: e, key: s, name: i }), w = (t) => t && (t.message || t.code) || String(t);
let ae = null;
const de = () => !!customElements.get("ha-entities-picker");
function yt() {
  return de() ? Promise.resolve(!0) : ae || (ae = (async () => {
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
    return de();
  })(), ae);
}
var wt = "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z", At = "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z", Et = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z", Ct = "M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z", St = "M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z", kt = "M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z", Ht = "M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z", Pt = "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z", Ot = "M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z", Lt = "M7.5,2C5.71,3.15 4.5,5.18 4.5,7.5C4.5,9.82 5.71,11.85 7.53,13C4.46,13 2,10.54 2,7.5A5.5,5.5 0 0,1 7.5,2M19.07,3.5L20.5,4.93L4.93,20.5L3.5,19.07L19.07,3.5M12.89,5.93L11.41,5L9.97,6L10.39,4.3L9,3.24L10.75,3.12L11.33,1.47L12,3.1L13.73,3.13L12.38,4.26L12.89,5.93M9.59,9.54L8.43,8.81L7.31,9.59L7.65,8.27L6.56,7.44L7.92,7.35L8.37,6.06L8.88,7.33L10.24,7.36L9.19,8.23L9.59,9.54M19,13.5A5.5,5.5 0 0,1 13.5,19C12.28,19 11.15,18.6 10.24,17.93L17.93,10.24C18.6,11.15 19,12.28 19,13.5M14.6,20.08L17.37,18.93L17.13,22.28L14.6,20.08M18.93,17.38L20.08,14.61L22.28,17.15L18.93,17.38M20.08,12.42L18.94,9.64L22.28,9.88L20.08,12.42M9.63,18.93L12.4,20.08L9.87,22.27L9.63,18.93Z";
const T = $`
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
var Mt = Object.defineProperty, zt = Object.getOwnPropertyDescriptor, F = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? zt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Mt(e, s, r), r;
};
let N = class extends _ {
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
            <path d=${e ? St : kt}></path>
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
N.styles = [
  T,
  $`
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
F([
  c({ attribute: !1 })
], N.prototype, "hass", 2);
F([
  c({ attribute: !1 })
], N.prototype, "unit", 2);
F([
  c({ attribute: !1 })
], N.prototype, "areaIcon", 2);
F([
  c({ attribute: !1 })
], N.prototype, "floorName", 2);
F([
  c({ attribute: !1 })
], N.prototype, "activeScene", 2);
N = F([
  y("homex-unit-controls")
], N);
const te = (t, e, s, i = "") => de() ? n`<ha-textfield
      outlined
      .label=${t}
      .value=${e ?? ""}
      .placeholder=${i}
      @input=${(r) => s(r.target.value)}
    ></ha-textfield>` : n`<div class="field">
    <span>${t}</span>
    <input
      .value=${e ?? ""}
      placeholder=${i}
      @input=${(r) => s(r.target.value)}
    />
  </div>`, Nt = /[̀-ͯ]/g, $e = (t) => (t || "").normalize("NFD").replace(Nt, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
var Dt = Object.defineProperty, Vt = Object.getOwnPropertyDescriptor, ye = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Vt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Dt(e, s, r), r;
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
se.styles = $`
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
ye([
  c({ type: Boolean })
], se.prototype, "open", 2);
ye([
  c()
], se.prototype, "heading", 2);
se = ye([
  y("homex-dialog")
], se);
var jt = Object.defineProperty, Rt = Object.getOwnPropertyDescriptor, I = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Rt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && jt(e, s, r), r;
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
  render() {
    return de() ? n`<ha-entities-picker
        .hass=${this.hass}
        .value=${this.value}
        .includeDomains=${this.includeDomains}
        .includeEntities=${this.includeEntities}
        @value-changed=${(t) => this._emit(t.detail.value || [])}
      ></ha-entities-picker>` : this._renderFallback();
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
S.styles = $`
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
  `;
I([
  c({ attribute: !1 })
], S.prototype, "hass", 2);
I([
  c({ type: Array })
], S.prototype, "value", 2);
I([
  c({ attribute: !1 })
], S.prototype, "includeDomains", 2);
I([
  c({ attribute: !1 })
], S.prototype, "includeEntities", 2);
I([
  p()
], S.prototype, "_query", 2);
I([
  p()
], S.prototype, "_open", 2);
S = I([
  y("homex-entity-picker")
], S);
const Ut = ["light", "switch", "input_boolean"], Tt = [
  "binary_sensor",
  "switch",
  "input_boolean",
  "person",
  "device_tracker"
];
var It = Object.defineProperty, Bt = Object.getOwnPropertyDescriptor, J = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Bt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && It(e, s, r), r;
};
let D = class extends _ {
  constructor() {
    super(...arguments), this.value = [], this._query = "", this._open = !1, this._actions = {};
  }
  willUpdate(t) {
    if (t.has("value"))
      for (const e of this.value)
        e.device_id && this._ensureActions(e.device_id);
  }
  async _ensureActions(t) {
    if (!(t in this._actions)) {
      this._actions = { ...this._actions, [t]: [] };
      try {
        const e = await gt(this.hass, t);
        this._actions = { ...this._actions, [t]: e };
      } catch {
      }
    }
  }
  _entityName(t) {
    return this.hass.states[t]?.attributes?.friendly_name || t;
  }
  _deviceName(t) {
    const e = this.hass.devices?.[t];
    return e && (e.name_by_user || e.name) || t;
  }
  get _candidates() {
    const t = new Set(
      this.value.filter((i) => i.entity_id).map((i) => i.entity_id)
    ), e = Object.keys(this.hass.states).filter((i) => Tt.includes(i.split(".")[0])).filter((i) => !t.has(i)).map((i) => ({ kind: "entity", id: i, name: this._entityName(i) })), s = Object.keys(this.hass.devices || {}).map(
      (i) => ({ kind: "device", id: i, name: this._deviceName(i) })
    );
    return [...e, ...s].sort(
      (i, r) => i.name.localeCompare(r.name)
    );
  }
  get _filtered() {
    const t = this._query.trim().toLowerCase();
    return this._candidates.filter((e) => !t || e.name.toLowerCase().includes(t) || e.id.toLowerCase().includes(t)).slice(0, 12);
  }
  _emit(t) {
    this.value = t, this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: t } }));
  }
  _add(t) {
    const e = t.kind === "entity" ? { entity_id: t.id } : { device_id: t.id, action: "" };
    t.kind === "device" && this._ensureActions(t.id), this._emit([...this.value, e]), this._query = "", this._open = !1;
  }
  _remove(t) {
    this._emit(this.value.filter((e, s) => s !== t));
  }
  _setAction(t, e) {
    this._emit(this.value.map((s, i) => i === t ? { ...s, action: e } : s));
  }
  _renderRow(t, e) {
    if (t.entity_id)
      return n`<div class="row">
        <span class="tag">entité</span>
        <span class="name">${this._entityName(t.entity_id)}</span>
        <button class="rm" title="Retirer" @click=${() => this._remove(e)}>×</button>
      </div>`;
    const s = t.device_id, i = `acts-${e}`, r = this._actions[s] || [];
    return n`<div class="row device-row">
      <span class="tag">appareil</span>
      <span class="name">${this._deviceName(s)}</span>
      <button class="rm" title="Retirer" @click=${() => this._remove(e)}>×</button>
      <input
        class="action"
        list=${i}
        placeholder="Action (ex. press, turn_on…)"
        .value=${t.action || ""}
        @input=${(o) => this._setAction(e, o.target.value)}
      />
      <datalist id=${i}>
        ${r.map((o) => n`<option value=${o}></option>`)}
      </datalist>
    </div>`;
  }
  render() {
    return n`
      ${this.value.map((t, e) => this._renderRow(t, e))}
      <input
        class="add"
        .value=${this._query}
        placeholder="Ajouter une entité ou un appareil…"
        autocomplete="off"
        @focus=${() => this._open = !0}
        @input=${(t) => {
      this._query = t.target.value, this._open = !0;
    }}
        @blur=${() => setTimeout(() => this._open = !1, 200)}
      />
      ${this._open ? n`<div class="suggestions">
            ${this._filtered.map(
      (t) => n`<div class="sugg" @mousedown=${() => this._add(t)}>
                <span class="tag">${t.kind === "entity" ? "entité" : "appareil"}</span>
                <span>${t.name}</span><span class="sid">${t.id}</span>
              </div>`
    )}
          </div>` : ""}
    `;
  }
};
D.styles = $`
    :host {
      display: block;
      position: relative;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
    }
    .tag {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color);
      background: var(--secondary-background-color, #eee);
      border-radius: 6px;
      padding: 2px 6px;
    }
    .name {
      font-size: 14px;
    }
    .device-row {
      flex-wrap: wrap;
    }
    .action {
      flex: 1;
      min-width: 160px;
      box-sizing: border-box;
      padding: 9px 11px;
      font-size: 14px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
    }
    .rm {
      margin-left: auto;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--error-color, #db4437);
      font-size: 18px;
      line-height: 1;
    }
    .device-row .rm {
      margin-left: 0;
    }
    input.add {
      width: 100%;
      box-sizing: border-box;
      margin-top: 6px;
      padding: 13px 14px;
      font-size: 16px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
    }
    .suggestions {
      position: absolute;
      z-index: 20;
      left: 0;
      right: 0;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 6px;
      max-height: 260px;
      overflow: auto;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
    }
    .sugg {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      cursor: pointer;
      font-size: 14px;
    }
    .sugg:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }
    .sugg .sid {
      margin-left: auto;
      color: var(--secondary-text-color);
      font-size: 11px;
    }
  `;
J([
  c({ attribute: !1 })
], D.prototype, "hass", 2);
J([
  c({ type: Array })
], D.prototype, "value", 2);
J([
  p()
], D.prototype, "_query", 2);
J([
  p()
], D.prototype, "_open", 2);
J([
  p()
], D.prototype, "_actions", 2);
D = J([
  y("homex-trigger-list")
], D);
var qt = Object.defineProperty, Wt = Object.getOwnPropertyDescriptor, A = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Wt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && qt(e, s, r), r;
};
let f = class extends _ {
  constructor() {
    super(...arguments), this.open = !1, this.group = null, this._name = "", this._id = "", this._devices = [], this._triggers = [], this._busy = !1, this._idEdited = !1;
  }
  willUpdate(t) {
    t.has("open") && this.open && (this._name = this.group?.name ?? "", this._id = this.group?.group_id ?? "", this._devices = this.group?.devices ?? [], this._triggers = this.group?.triggers ?? [], this._busy = !1, this._idEdited = !!this.group);
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
    this._busy = !0;
    try {
      this.group ? await _t(this.hass, {
        entry_id: this.room.entry_id,
        group_id: this.group.group_id,
        name: t,
        devices: this._devices,
        triggers: this._triggers
      }) : await mt(this.hass, {
        entry_id: this.room.entry_id,
        group_id: e,
        name: t,
        devices: this._devices,
        triggers: this._triggers
      }), z(this), this._close();
    } catch (s) {
      this._busy = !1, alert("Erreur Homex : " + w(s));
    }
  }
  async _delete() {
    if (this.group && confirm(`Supprimer le groupe "${this.group.group_id}" ?`)) {
      this._busy = !0;
      try {
        await ft(this.hass, this.room.entry_id, this.group.group_id), z(this), this._close();
      } catch (t) {
        this._busy = !1, alert("Erreur Homex : " + w(t));
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
        <homex-trigger-list
          .hass=${this.hass}
          .value=${this._triggers}
          @value-changed=${(e) => this._triggers = e.detail.value}
        ></homex-trigger-list>

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
f.styles = T;
A([
  c({ attribute: !1 })
], f.prototype, "hass", 2);
A([
  c({ type: Boolean })
], f.prototype, "open", 2);
A([
  c({ attribute: !1 })
], f.prototype, "room", 2);
A([
  c({ attribute: !1 })
], f.prototype, "group", 2);
A([
  p()
], f.prototype, "_name", 2);
A([
  p()
], f.prototype, "_id", 2);
A([
  p()
], f.prototype, "_devices", 2);
A([
  p()
], f.prototype, "_triggers", 2);
A([
  p()
], f.prototype, "_busy", 2);
f = A([
  y("homex-group-dialog")
], f);
var Zt = Object.defineProperty, Gt = Object.getOwnPropertyDescriptor, re = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Gt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Zt(e, s, r), r;
};
let U = class extends _ {
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
U.styles = [
  T,
  $`
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
re([
  c({ attribute: !1 })
], U.prototype, "hass", 2);
re([
  c({ attribute: !1 })
], U.prototype, "room", 2);
re([
  c({ attribute: !1 })
], U.prototype, "group", 2);
re([
  p()
], U.prototype, "_open", 2);
U = re([
  y("homex-group-row")
], U);
var Ft = Object.defineProperty, Jt = Object.getOwnPropertyDescriptor, E = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Jt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Ft(e, s, r), r;
};
let v = class extends _ {
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
      this.room ? await Ue(this.hass, {
        entry_id: this.room.entry_id,
        name: t,
        room_id: e,
        area_id: s,
        devices: this._devices,
        scene_strategy: this._strategy
      }) : await ht(this.hass, {
        name: t,
        room_id: e,
        area_id: s,
        devices: this._devices,
        scene_strategy: this._strategy
      }), z(this), this._close();
    } catch (s) {
      this._busy = !1, alert("Erreur Homex : " + w(s));
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
          .includeDomains=${Ut}
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
v.styles = [
  T,
  $`
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
E([
  c({ attribute: !1 })
], v.prototype, "hass", 2);
E([
  c({ type: Boolean })
], v.prototype, "open", 2);
E([
  c({ attribute: !1 })
], v.prototype, "room", 2);
E([
  p()
], v.prototype, "_name", 2);
E([
  p()
], v.prototype, "_id", 2);
E([
  p()
], v.prototype, "_areaId", 2);
E([
  p()
], v.prototype, "_devices", 2);
E([
  p()
], v.prototype, "_strategy", 2);
E([
  p()
], v.prototype, "_busy", 2);
v = E([
  y("homex-room-dialog")
], v);
var Kt = Object.defineProperty, Qt = Object.getOwnPropertyDescriptor, B = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Qt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Kt(e, s, r), r;
};
let k = class extends _ {
  constructor() {
    super(...arguments), this.open = !1, this._toggle = [], this._scene = [], this._busy = !1;
  }
  willUpdate(t) {
    t.has("open") && this.open && (this._toggle = this.room?.triggers ?? [], this._scene = this.room?.scene_triggers ?? [], this._busy = !1);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  async _save() {
    this._busy = !0;
    try {
      await Ue(this.hass, {
        entry_id: this.room.entry_id,
        triggers: this._toggle,
        scene_triggers: this._scene
      }), z(this), this._close();
    } catch (t) {
      this._busy = !1, alert("Erreur Homex : " + w(t));
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
            Entité (changement d'état) ou appareil (action). Chaque déclenchement
            permute l'état on/off de la pièce.
          </p>
          <homex-trigger-list
            .hass=${this.hass}
            .value=${this._toggle}
            @value-changed=${(t) => this._toggle = t.detail.value}
          ></homex-trigger-list>
        </div>

        <div class="group">
          <div class="section">Triggers scene switching</div>
          <p class="hint">Chaque déclenchement passe à la scène suivante (cycle).</p>
          <homex-trigger-list
            .hass=${this.hass}
            .value=${this._scene}
            @value-changed=${(t) => this._scene = t.detail.value}
          ></homex-trigger-list>
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
k.styles = [
  T,
  $`
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
B([
  c({ attribute: !1 })
], k.prototype, "hass", 2);
B([
  c({ type: Boolean })
], k.prototype, "open", 2);
B([
  c({ attribute: !1 })
], k.prototype, "room", 2);
B([
  p()
], k.prototype, "_toggle", 2);
B([
  p()
], k.prototype, "_scene", 2);
B([
  p()
], k.prototype, "_busy", 2);
k = B([
  y("homex-triggers-dialog")
], k);
var Xt = Object.defineProperty, Yt = Object.getOwnPropertyDescriptor, P = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Yt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Xt(e, s, r), r;
};
let x = class extends _ {
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
        this.scene ? await $t(this.hass, this.room.entry_id, this.scene.key, t) : this._mode === "attach" ? await ze(this.hass, this.room.entry_id, t, this._attachId) : await ze(this.hass, this.room.entry_id, t), z(this), this._close();
      } catch (e) {
        this._busy = !1, alert("Erreur Homex : " + w(e));
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
        ${te("Nom de la scène", this._name, (i) => this._name = i, "Nuit")}
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
x.styles = [
  T,
  $`
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
P([
  c({ attribute: !1 })
], x.prototype, "hass", 2);
P([
  c({ type: Boolean })
], x.prototype, "open", 2);
P([
  c({ attribute: !1 })
], x.prototype, "room", 2);
P([
  c({ attribute: !1 })
], x.prototype, "scene", 2);
P([
  p()
], x.prototype, "_name", 2);
P([
  p()
], x.prototype, "_mode", 2);
P([
  p()
], x.prototype, "_attachId", 2);
P([
  p()
], x.prototype, "_busy", 2);
x = P([
  y("homex-scene-dialog")
], x);
var es = Object.defineProperty, ts = Object.getOwnPropertyDescriptor, q = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ts(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && es(e, s, r), r;
};
let H = class extends _ {
  constructor() {
    super(...arguments), this.expanded = !1, this._dialog = "", this._menuOpen = !1, this._renameScene = null, this._close = () => this._dialog = "", this._sceneNext = async (t) => {
      t?.stopPropagation();
      try {
        await bt(this.hass, this.room.entry_id);
      } catch (e) {
        alert("Erreur Homex : " + w(e));
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
  async _delete() {
    this._menuOpen = !1;
    const t = this.room;
    if (confirm(
      `Supprimer la pièce "${t.name}" ?
Ses scènes et entités seront supprimées.`
    ))
      try {
        await ut(this.hass, t.entry_id), z(this);
      } catch (e) {
        alert("Erreur Homex : " + w(e));
      }
  }
  _openHa(t) {
    window.open(`/config/scene/edit/${t.config_id}`, "_blank", "noopener");
  }
  async _deleteScene(t) {
    if (confirm(`Supprimer la scène "${t.name}" ?`))
      try {
        await vt(this.hass, this.room.entry_id, t.key), z(this);
      } catch (e) {
        alert("Erreur Homex : " + w(e));
      }
  }
  async _sceneMoved(t) {
    const { oldIndex: e, newIndex: s } = t.detail, i = this.room.scenes.filter((o) => o.orderable).map((o) => o.key), [r] = i.splice(e, 1);
    i.splice(s, 0, r);
    try {
      await xt(this.hass, this.room.entry_id, i), z(this);
    } catch (o) {
      alert("Erreur Homex : " + w(o));
    }
  }
  _iconBtn(t, e, s, i = !1) {
    return n`<button
      class="icon-btn"
      title=${e}
      aria-label=${e}
      ?disabled=${i}
      @click=${s}
    >
      <svg viewBox="0 0 24 24"><path d=${t}></path></svg>
    </button>`;
  }
  _sceneRow(t, e) {
    return n`
      <div class="scene-row">
        ${t.orderable ? n`<span class="handle" title="Glisser pour réordonner">
              <svg viewBox="0 0 24 24"><path d=${Ct}></path></svg>
            </span>` : n`<span class="pin" title="Toujours en dernier">
              <svg viewBox="0 0 24 24"><path d=${Ot}></path></svg>
            </span>`}
        <span class="scene-name">${t.name}</span>
        ${t.key === e ? n`<span class="active-tag">active</span>` : ""}
        <span class="btn-group">
          ${this._iconBtn(
      Ht,
      "Voir dans Home Assistant",
      () => this._openHa(t)
    )}
          ${this._iconBtn(Pt, "Renommer", () => this._renameScene = t)}
          ${this._iconBtn(
      Et,
      t.removable ? "Supprimer" : "Scène par défaut",
      () => this._deleteScene(t),
      !t.removable
    )}
        </span>
      </div>
    `;
  }
  render() {
    const t = this.room, s = this._isOn() ? this.hass.states[t.switch]?.attributes?.active_scene ?? null : null, i = s ? t.scenes.find((h) => h.key === s)?.name : void 0, r = t.area_id ? this.hass.areas?.[t.area_id] : null, o = r?.icon || void 0, d = (r?.floor_id ? this.hass.floors?.[r.floor_id] : null)?.name || void 0, l = t.scenes.filter((h) => h.orderable), g = t.scenes.filter((h) => !h.orderable);
    return n`
      <ha-card>
        <div class="head" @click=${this._toggleExpand} title="Plier / déplier">
          <svg class="chevron" viewBox="0 0 24 24">
            <path d=${this.expanded ? At : wt}></path>
          </svg>
          <homex-unit-controls
            .hass=${this.hass}
            .unit=${t}
            .areaIcon=${o}
            .floorName=${d}
            .activeScene=${i}
          ></homex-unit-controls>
          <div class="head-actions">
            <button
              class="round"
              title="Changer de scène"
              @click=${(h) => this._sceneNext(h)}
            >
              <svg viewBox="0 0 24 24"><path d=${Lt}></path></svg>
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
  _renderBody(t, e, s, i) {
    return n`
        <div class="section-row">
          <span class="section">Scènes</span>
          <button @click=${() => this._pick("addscene")}>＋ Scène</button>
        </div>
        <ha-sortable handle-selector=".handle" @item-moved=${this._sceneMoved}>
          <div>${s.map((r) => this._sceneRow(r, e))}</div>
        </ha-sortable>
        ${i.map((r) => this._sceneRow(r, e))}

        ${t.groups.length ? n`
              <div class="section-row">
                <span class="section">Groupes</span>
                <button @click=${() => this._pick("addgroup")}>＋ Groupe</button>
              </div>
              <div class="groups">
                ${t.groups.map(
      (r) => n`<homex-group-row
                    .hass=${this.hass}
                    .room=${t}
                    .group=${r}
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
    `;
  }
};
H.styles = [
  T,
  $`
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
    `
];
q([
  c({ attribute: !1 })
], H.prototype, "hass", 2);
q([
  c({ attribute: !1 })
], H.prototype, "room", 2);
q([
  c({ type: Boolean })
], H.prototype, "expanded", 2);
q([
  p()
], H.prototype, "_dialog", 2);
q([
  p()
], H.prototype, "_menuOpen", 2);
q([
  p()
], H.prototype, "_renameScene", 2);
H = q([
  y("homex-room-card")
], H);
var ss = Object.defineProperty, is = Object.getOwnPropertyDescriptor, O = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? is(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && ss(e, s, r), r;
};
const rs = "29";
let b = class extends _ {
  constructor() {
    super(...arguments), this.narrow = !1, this._rooms = null, this._error = null, this._createOpen = !1, this._expanded = localStorage.getItem("homex_expanded") || null, this._loaded = !1, this._onToggleExpand = (t) => {
      const e = t.detail.entry_id;
      this._expanded = this._expanded === e ? null : e, this._expanded ? localStorage.setItem("homex_expanded", this._expanded) : localStorage.removeItem("homex_expanded");
    }, this._reload = async () => {
      try {
        this._rooms = await pt(this.hass), this._error = null;
      } catch (t) {
        this._error = w(t);
      }
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener(ge, this._reload), this.addEventListener("homex-toggle-expand", this._onToggleExpand);
  }
  disconnectedCallback() {
    this.removeEventListener(ge, this._reload), this.removeEventListener("homex-toggle-expand", this._onToggleExpand), super.disconnectedCallback();
  }
  updated(t) {
    t.has("hass") && this.hass && !this._loaded && (this._loaded = !0, yt().then(() => this.requestUpdate()), this._reload());
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
    for (const i of this._rooms || []) {
      const o = (i.area_id ? this.hass.areas?.[i.area_id] : null)?.floor_id;
      o && this.hass.floors?.[o] ? (e.get(o) ?? e.set(o, []).get(o)).push(i) : t.push(i);
    }
    const s = [...e.keys()].map((i) => this.hass.floors[i]).sort(
      (i, r) => (i.level ?? 0) - (r.level ?? 0) || i.name.localeCompare(r.name)
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
        Aucune pièce. Ajoute-en une via
        <a href="/config/integrations/integration/homex"
          >Paramètres → Intégrations → Homex</a
        >.
      </div>`;
    else {
      const { ungrouped: e, floors: s, byFloor: i } = this._grouped();
      t = n`
        ${e.map((r) => this._roomCard(r))}
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
    return n`
      <div class="wrap">
        <header>
          <h1>Homex <span class="ver">v${rs}</span></h1>
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
b.styles = $`
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
O([
  c({ attribute: !1 })
], b.prototype, "hass", 2);
O([
  c({ attribute: !1 })
], b.prototype, "narrow", 2);
O([
  c({ attribute: !1 })
], b.prototype, "route", 2);
O([
  c({ attribute: !1 })
], b.prototype, "panel", 2);
O([
  p()
], b.prototype, "_rooms", 2);
O([
  p()
], b.prototype, "_error", 2);
O([
  p()
], b.prototype, "_createOpen", 2);
O([
  p()
], b.prototype, "_expanded", 2);
b = O([
  y("homex-panel")
], b);
export {
  b as HomexPanel
};
