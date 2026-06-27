/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ue = globalThis, we = ue.ShadowRoot && (ue.ShadyCSS === void 0 || ue.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ae = Symbol(), Pe = /* @__PURE__ */ new WeakMap();
let Xe = class {
  constructor(e, s, r) {
    if (this._$cssResult$ = !0, r !== Ae) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (we && e === void 0) {
      const r = s !== void 0 && s.length === 1;
      r && (e = Pe.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), r && Pe.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const lt = (t) => new Xe(typeof t == "string" ? t : t + "", void 0, Ae), b = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((r, i, o) => r + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[o + 1], t[0]);
  return new Xe(s, t, Ae);
}, ct = (t, e) => {
  if (we) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const r = document.createElement("style"), i = ue.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = s.cssText, t.appendChild(r);
  }
}, Me = we ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const r of e.cssRules) s += r.cssText;
  return lt(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: dt, defineProperty: pt, getOwnPropertyDescriptor: ht, getOwnPropertyNames: ut, getOwnPropertySymbols: gt, getPrototypeOf: mt } = Object, _e = globalThis, Ve = _e.trustedTypes, _t = Ve ? Ve.emptyScript : "", vt = _e.reactiveElementPolyfillSupport, ie = (t, e) => t, ge = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? _t : null;
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
} }, ke = (t, e) => !dt(t, e), De = { attribute: !0, type: String, converter: ge, reflect: !1, useDefault: !1, hasChanged: ke };
Symbol.metadata ??= Symbol("metadata"), _e.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let J = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = De) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(e, r, s);
      i !== void 0 && pt(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, s, r) {
    const { get: i, set: o } = ht(this.prototype, e) ?? { get() {
      return this[s];
    }, set(n) {
      this[s] = n;
    } };
    return { get: i, set(n) {
      const d = i?.call(this);
      o?.call(this, n), this.requestUpdate(e, d, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? De;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ie("elementProperties"))) return;
    const e = mt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ie("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ie("properties"))) {
      const s = this.properties, r = [...ut(s), ...gt(s)];
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
      for (const i of r) s.unshift(Me(i));
    } else e !== void 0 && s.push(Me(e));
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
    return ct(e, this.constructor.elementStyles), e;
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
      const o = (r.converter?.toAttribute !== void 0 ? r.converter : ge).toAttribute(s, r.type);
      this._$Em = e, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const r = this.constructor, i = r._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const o = r.getPropertyOptions(i), n = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : ge;
      this._$Em = i;
      const d = n.fromAttribute(s, o.type);
      this[i] = d ?? this._$Ej?.get(i) ?? d, this._$Em = null;
    }
  }
  requestUpdate(e, s, r, i = !1, o) {
    if (e !== void 0) {
      const n = this.constructor;
      if (i === !1 && (o = this[e]), r ??= n.getPropertyOptions(e), !((r.hasChanged ?? ke)(o, s) || r.useDefault && r.reflect && o === this._$Ej?.get(e) && !this.hasAttribute(n._$Eu(e, r)))) return;
      this.C(e, s, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: r, reflect: i, wrapped: o }, n) {
    r && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, n ?? s ?? this[e]), o !== !0 || n !== void 0) || (this._$AL.has(e) || (this.hasUpdated || r || (s = void 0), this._$AL.set(e, s)), i === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        const { wrapped: n } = o, d = this[i];
        n !== !0 || this._$AL.has(i) || d === void 0 || this.C(i, void 0, o, d);
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
J.elementStyles = [], J.shadowRootOptions = { mode: "open" }, J[ie("elementProperties")] = /* @__PURE__ */ new Map(), J[ie("finalized")] = /* @__PURE__ */ new Map(), vt?.({ ReactiveElement: J }), (_e.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ce = globalThis, ze = (t) => t, me = Ce.trustedTypes, Te = me ? me.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Ye = "$lit$", T = `lit$${Math.random().toFixed(9).slice(2)}$`, et = "?" + T, ft = `<${et}>`, q = document, re = () => q.createComment(""), oe = (t) => t === null || typeof t != "object" && typeof t != "function", Ee = Array.isArray, xt = (t) => Ee(t) || typeof t?.[Symbol.iterator] == "function", be = `[ 	
\f\r]`, te = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ne = /-->/g, je = />/g, R = RegExp(`>|${be}(?:([^\\s"'>=/]+)(${be}*=${be}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ue = /'/g, Re = /"/g, tt = /^(?:script|style|textarea|title)$/i, bt = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), a = bt(1), F = Symbol.for("lit-noChange"), v = Symbol.for("lit-nothing"), Ie = /* @__PURE__ */ new WeakMap(), B = q.createTreeWalker(q, 129);
function st(t, e) {
  if (!Ee(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Te !== void 0 ? Te.createHTML(e) : e;
}
const $t = (t, e) => {
  const s = t.length - 1, r = [];
  let i, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", n = te;
  for (let d = 0; d < s; d++) {
    const c = t[d];
    let g, _, l = -1, m = 0;
    for (; m < c.length && (n.lastIndex = m, _ = n.exec(c), _ !== null); ) m = n.lastIndex, n === te ? _[1] === "!--" ? n = Ne : _[1] !== void 0 ? n = je : _[2] !== void 0 ? (tt.test(_[2]) && (i = RegExp("</" + _[2], "g")), n = R) : _[3] !== void 0 && (n = R) : n === R ? _[0] === ">" ? (n = i ?? te, l = -1) : _[1] === void 0 ? l = -2 : (l = n.lastIndex - _[2].length, g = _[1], n = _[3] === void 0 ? R : _[3] === '"' ? Re : Ue) : n === Re || n === Ue ? n = R : n === Ne || n === je ? n = te : (n = R, i = void 0);
    const u = n === R && t[d + 1].startsWith("/>") ? " " : "";
    o += n === te ? c + ft : l >= 0 ? (r.push(g), c.slice(0, l) + Ye + c.slice(l) + T + u) : c + T + (l === -2 ? d : u);
  }
  return [st(t, o + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), r];
};
class ne {
  constructor({ strings: e, _$litType$: s }, r) {
    let i;
    this.parts = [];
    let o = 0, n = 0;
    const d = e.length - 1, c = this.parts, [g, _] = $t(e, s);
    if (this.el = ne.createElement(g, r), B.currentNode = this.el.content, s === 2 || s === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (i = B.nextNode()) !== null && c.length < d; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const l of i.getAttributeNames()) if (l.endsWith(Ye)) {
          const m = _[n++], u = i.getAttribute(l).split(T), f = /([.?@])?(.*)/.exec(m);
          c.push({ type: 1, index: o, name: f[2], strings: u, ctor: f[1] === "." ? wt : f[1] === "?" ? At : f[1] === "@" ? kt : ve }), i.removeAttribute(l);
        } else l.startsWith(T) && (c.push({ type: 6, index: o }), i.removeAttribute(l));
        if (tt.test(i.tagName)) {
          const l = i.textContent.split(T), m = l.length - 1;
          if (m > 0) {
            i.textContent = me ? me.emptyScript : "";
            for (let u = 0; u < m; u++) i.append(l[u], re()), B.nextNode(), c.push({ type: 2, index: ++o });
            i.append(l[m], re());
          }
        }
      } else if (i.nodeType === 8) if (i.data === et) c.push({ type: 2, index: o });
      else {
        let l = -1;
        for (; (l = i.data.indexOf(T, l + 1)) !== -1; ) c.push({ type: 7, index: o }), l += T.length - 1;
      }
      o++;
    }
  }
  static createElement(e, s) {
    const r = q.createElement("template");
    return r.innerHTML = e, r;
  }
}
function Q(t, e, s = t, r) {
  if (e === F) return e;
  let i = r !== void 0 ? s._$Co?.[r] : s._$Cl;
  const o = oe(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== o && (i?._$AO?.(!1), o === void 0 ? i = void 0 : (i = new o(t), i._$AT(t, s, r)), r !== void 0 ? (s._$Co ??= [])[r] = i : s._$Cl = i), i !== void 0 && (e = Q(t, i._$AS(t, e.values), i, r)), e;
}
class yt {
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
    const { el: { content: s }, parts: r } = this._$AD, i = (e?.creationScope ?? q).importNode(s, !0);
    B.currentNode = i;
    let o = B.nextNode(), n = 0, d = 0, c = r[0];
    for (; c !== void 0; ) {
      if (n === c.index) {
        let g;
        c.type === 2 ? g = new Y(o, o.nextSibling, this, e) : c.type === 1 ? g = new c.ctor(o, c.name, c.strings, this, e) : c.type === 6 && (g = new Ct(o, this, e)), this._$AV.push(g), c = r[++d];
      }
      n !== c?.index && (o = B.nextNode(), n++);
    }
    return B.currentNode = q, i;
  }
  p(e) {
    let s = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(e, r, s), s += r.strings.length - 2) : r._$AI(e[s])), s++;
  }
}
class Y {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, r, i) {
    this.type = 2, this._$AH = v, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = r, this.options = i, this._$Cv = i?.isConnected ?? !0;
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
    e = Q(this, e, s), oe(e) ? e === v || e == null || e === "" ? (this._$AH !== v && this._$AR(), this._$AH = v) : e !== this._$AH && e !== F && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : xt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== v && oe(this._$AH) ? this._$AA.nextSibling.data = e : this.T(q.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: r } = e, i = typeof r == "number" ? this._$AC(e) : (r.el === void 0 && (r.el = ne.createElement(st(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const o = new yt(i, this), n = o.u(this.options);
      o.p(s), this.T(n), this._$AH = o;
    }
  }
  _$AC(e) {
    let s = Ie.get(e.strings);
    return s === void 0 && Ie.set(e.strings, s = new ne(e)), s;
  }
  k(e) {
    Ee(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let r, i = 0;
    for (const o of e) i === s.length ? s.push(r = new Y(this.O(re()), this.O(re()), this, this.options)) : r = s[i], r._$AI(o), i++;
    i < s.length && (this._$AR(r && r._$AB.nextSibling, i), s.length = i);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const r = ze(e).nextSibling;
      ze(e).remove(), e = r;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class ve {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, r, i, o) {
    this.type = 1, this._$AH = v, this._$AN = void 0, this.element = e, this.name = s, this._$AM = i, this.options = o, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = v;
  }
  _$AI(e, s = this, r, i) {
    const o = this.strings;
    let n = !1;
    if (o === void 0) e = Q(this, e, s, 0), n = !oe(e) || e !== this._$AH && e !== F, n && (this._$AH = e);
    else {
      const d = e;
      let c, g;
      for (e = o[0], c = 0; c < o.length - 1; c++) g = Q(this, d[r + c], s, c), g === F && (g = this._$AH[c]), n ||= !oe(g) || g !== this._$AH[c], g === v ? e = v : e !== v && (e += (g ?? "") + o[c + 1]), this._$AH[c] = g;
    }
    n && !i && this.j(e);
  }
  j(e) {
    e === v ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class wt extends ve {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === v ? void 0 : e;
  }
}
class At extends ve {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== v);
  }
}
class kt extends ve {
  constructor(e, s, r, i, o) {
    super(e, s, r, i, o), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = Q(this, e, s, 0) ?? v) === F) return;
    const r = this._$AH, i = e === v && r !== v || e.capture !== r.capture || e.once !== r.once || e.passive !== r.passive, o = e !== v && (r === v || i);
    i && this.element.removeEventListener(this.name, this, r), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Ct {
  constructor(e, s, r) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Q(this, e);
  }
}
const Et = { I: Y }, St = Ce.litHtmlPolyfillSupport;
St?.(ne, Y), (Ce.litHtmlVersions ??= []).push("3.3.3");
const Ht = (t, e, s) => {
  const r = s?.renderBefore ?? e;
  let i = r._$litPart$;
  if (i === void 0) {
    const o = s?.renderBefore ?? null;
    r._$litPart$ = i = new Y(e.insertBefore(re(), o), o, void 0, s ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Se = globalThis;
let x = class extends J {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ht(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return F;
  }
};
x._$litElement$ = !0, x.finalized = !0, Se.litElementHydrateSupport?.({ LitElement: x });
const Ot = Se.litElementPolyfillSupport;
Ot?.({ LitElement: x });
(Se.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $ = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Lt = { attribute: !0, type: String, converter: ge, reflect: !1, hasChanged: ke }, Pt = (t = Lt, e, s) => {
  const { kind: r, metadata: i } = s;
  let o = globalThis.litPropertyMetadata.get(i);
  if (o === void 0 && globalThis.litPropertyMetadata.set(i, o = /* @__PURE__ */ new Map()), r === "setter" && ((t = Object.create(t)).wrapped = !0), o.set(s.name, t), r === "accessor") {
    const { name: n } = s;
    return { set(d) {
      const c = e.get.call(this);
      e.set.call(this, d), this.requestUpdate(n, c, t, !0, d);
    }, init(d) {
      return d !== void 0 && this.C(n, void 0, t, d), d;
    } };
  }
  if (r === "setter") {
    const { name: n } = s;
    return function(d) {
      const c = this[n];
      e.call(this, d), this.requestUpdate(n, c, t, !0, d);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function p(t) {
  return (e, s) => typeof s == "object" ? Pt(t, e, s) : ((r, i, o) => {
    const n = i.hasOwnProperty(o);
    return i.constructor.createProperty(o, r), n ? Object.getOwnPropertyDescriptor(i, o) : void 0;
  })(t, e, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function h(t) {
  return p({ ...t, state: !0, attribute: !1 });
}
const ye = "homex-changed", N = (t) => t.dispatchEvent(new CustomEvent(ye, { bubbles: !0, composed: !0 })), Mt = async (t) => (await t.callWS({ type: "homex/rooms" })).rooms || [], Vt = (t, e) => t.callWS({ type: "homex/room/create", ...e }), Dt = (t, e, s = !0) => t.callWS({ type: "homex/room/delete", entry_id: e, delete_scenes: s }), zt = async (t, e) => (await t.callWS({ type: "homex/device_triggers", device_id: e })).triggers || [], it = (t, e) => t.callWS({ type: "homex/room/update", ...e }), Tt = (t, e) => t.callWS({ type: "homex/room/sync_labels", entry_id: e }), Nt = (t, e, s) => t.callWS({ type: "homex/room/dim", entry_id: e, delta: s }), jt = (t, e) => t.callWS({ type: "homex/group/add", ...e }), Ut = (t, e) => t.callWS({ type: "homex/group/update", ...e }), Rt = (t, e, s) => t.callWS({ type: "homex/group/delete", entry_id: e, group_id: s }), Be = (t, e, s, r, i) => t.callWS({
  type: "homex/scene/add",
  entry_id: e,
  name: s,
  ...r ? { attach: r } : {},
  ...i ? { triggers: i } : {}
}), It = (t, e, s) => t.callWS({ type: "homex/scene/delete", entry_id: e, key: s }), Bt = (t, e, s) => t.callWS({ type: "homex/scene/reorder", entry_id: e, order: s }), qt = (t, e) => t.callWS({ type: "homex/scene/next", entry_id: e }), Ft = (t, e, s, r, i) => t.callWS({
  type: "homex/scene/rename",
  entry_id: e,
  key: s,
  name: r,
  ...i ? { triggers: i } : {}
}), y = (t) => t && (t.message || t.code) || String(t);
let he = null;
const qe = () => !!customElements.get("ha-entities-picker");
function Wt() {
  return qe() ? Promise.resolve(!0) : he || (he = (async () => {
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
    return qe();
  })(), he);
}
var Zt = "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z", Gt = "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z", Kt = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z", Jt = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z", Fe = "M3 6H21V4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H7V18H3V6M13 12H9V13.78C8.39 14.33 8 15.11 8 16C8 16.89 8.39 17.67 9 18.22V20H13V18.22C13.61 17.67 14 16.88 14 16S13.61 14.33 13 13.78V12M11 17.5C10.17 17.5 9.5 16.83 9.5 16S10.17 14.5 11 14.5 12.5 15.17 12.5 16 11.83 17.5 11 17.5M22 8H16C15.5 8 15 8.5 15 9V19C15 19.5 15.5 20 16 20H22C22.5 20 23 19.5 23 19V9C23 8.5 22.5 8 22 8M21 18H17V10H21V18Z", Qt = "M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z", Xt = "M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z", Yt = "M12,2C9.76,2 7.78,3.05 6.5,4.68L7.93,6.11C8.84,4.84 10.32,4 12,4A5,5 0 0,1 17,9C17,10.68 16.16,12.16 14.89,13.06L16.31,14.5C17.94,13.21 19,11.24 19,9A7,7 0 0,0 12,2M3.28,4L2,5.27L5.04,8.3C5,8.53 5,8.76 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H14.73L18.73,22L20,20.72L3.28,4M7.23,10.5L12.73,16H10V13.58C8.68,13 7.66,11.88 7.23,10.5M9,20V21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9Z", es = "M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63Z", ts = "M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z", ss = "M19,13H5V11H19V13Z", is = "M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z", rs = "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z", os = "M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z", rt = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z", We = "M11,13.5V21.5H3V13.5H11M12,2L17.5,11H6.5L12,2M17.5,13C20,13 22,15 22,17.5C22,20 20,22 17.5,22C15,22 13,20 13,17.5C13,15 15,13 17.5,13Z", ns = "M7.5,2C5.71,3.15 4.5,5.18 4.5,7.5C4.5,9.82 5.71,11.85 7.53,13C4.46,13 2,10.54 2,7.5A5.5,5.5 0 0,1 7.5,2M19.07,3.5L20.5,4.93L4.93,20.5L3.5,19.07L19.07,3.5M12.89,5.93L11.41,5L9.97,6L10.39,4.3L9,3.24L10.75,3.12L11.33,1.47L12,3.1L13.73,3.13L12.38,4.26L12.89,5.93M9.59,9.54L8.43,8.81L7.31,9.59L7.65,8.27L6.56,7.44L7.92,7.35L8.37,6.06L8.88,7.33L10.24,7.36L9.19,8.23L9.59,9.54M19,13.5A5.5,5.5 0 0,1 13.5,19C12.28,19 11.15,18.6 10.24,17.93L17.93,10.24C18.6,11.15 19,12.28 19,13.5M14.6,20.08L17.37,18.93L17.13,22.28L14.6,20.08M18.93,17.38L20.08,14.61L22.28,17.15L18.93,17.38M20.08,12.42L18.94,9.64L22.28,9.88L20.08,12.42M9.63,18.93L12.4,20.08L9.87,22.27L9.63,18.93Z";
const U = b`
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
var as = Object.defineProperty, ls = Object.getOwnPropertyDescriptor, ee = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? ls(e, s) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (i = (r ? n(e, s, i) : n(i)) || i);
  return r && i && as(e, s, i), i;
};
let j = class extends x {
  _isOn(t) {
    return this.hass.states[t]?.state === "on";
  }
  _toggle(t) {
    t.stopPropagation();
    const e = this.unit;
    if (e.group_id) {
      this.hass.callService("switch", "toggle", { entity_id: e.switch });
      return;
    }
    const s = this.hass.states[e.switch]?.attributes?.active_scene != null;
    this.hass.callService("switch", s ? "turn_off" : "turn_on", {
      entity_id: e.switch
    });
  }
  render() {
    const t = this.unit, e = this._isOn(t.switch);
    return a`
      <div class="controls">
        <button
          class="bulb ${e ? "on" : ""}"
          title=${e ? "Éteindre" : "Allumer"}
          @click=${this._toggle}
        >
          <svg viewBox="0 0 24 24">
            <path d=${e ? Xt : ts}></path>
          </svg>
        </button>
        ${this.areaIcon ? a`<ha-icon class="area-icon" .icon=${this.areaIcon}></ha-icon>` : ""}
        <div class="title">
          <div class="line1">
            <strong>${t.name}</strong>
            ${e && this.activeScene ? a`<span class="active-scene">${this.activeScene}</span>` : ""}
          </div>
          <div class="line2">
            <span class="rid">${t.group_id || t.room_id}</span>
            ${this.floorName ? a`<span class="floor">${this.floorName}</span>` : ""}
          </div>
        </div>
      </div>
    `;
  }
};
j.styles = [
  U,
  b`
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
ee([
  p({ attribute: !1 })
], j.prototype, "hass", 2);
ee([
  p({ attribute: !1 })
], j.prototype, "unit", 2);
ee([
  p({ attribute: !1 })
], j.prototype, "areaIcon", 2);
ee([
  p({ attribute: !1 })
], j.prototype, "floorName", 2);
ee([
  p({ attribute: !1 })
], j.prototype, "activeScene", 2);
j = ee([
  $("homex-unit-controls")
], j);
const ae = (t, e, s, r = "") => customElements.get("ha-textfield") ? a`<ha-textfield
      outlined
      .label=${t}
      .value=${e ?? ""}
      .placeholder=${r}
      @input=${(i) => s(i.target.value)}
    ></ha-textfield>` : a`<div class="field">
    <span>${t}</span>
    <input
      .value=${e ?? ""}
      placeholder=${r}
      @input=${(i) => s(i.target.value)}
    />
  </div>`, cs = /[̀-ͯ]/g, He = (t) => (t || "").normalize("NFD").replace(cs, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
var ds = Object.defineProperty, ps = Object.getOwnPropertyDescriptor, Oe = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? ps(e, s) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (i = (r ? n(e, s, i) : n(i)) || i);
  return r && i && ds(e, s, i), i;
};
let le = class extends x {
  constructor() {
    super(...arguments), this.open = !1, this.heading = "";
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  render() {
    return this.open ? a`
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
    ` : a``;
  }
};
le.styles = b`
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
Oe([
  p({ type: Boolean })
], le.prototype, "open", 2);
Oe([
  p()
], le.prototype, "heading", 2);
le = Oe([
  $("homex-dialog")
], le);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const hs = { CHILD: 2 }, ot = (t) => (...e) => ({ _$litDirective$: t, values: e });
let nt = class {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, s, r) {
    this._$Ct = e, this._$AM = s, this._$Ci = r;
  }
  _$AS(e, s) {
    return this.update(e, s);
  }
  update(e, s) {
    return this.render(...s);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { I: us } = Et, Ze = (t) => t, Ge = () => document.createComment(""), se = (t, e, s) => {
  const r = t._$AA.parentNode, i = e === void 0 ? t._$AB : e._$AA;
  if (s === void 0) {
    const o = r.insertBefore(Ge(), i), n = r.insertBefore(Ge(), i);
    s = new us(o, n, t, t.options);
  } else {
    const o = s._$AB.nextSibling, n = s._$AM, d = n !== t;
    if (d) {
      let c;
      s._$AQ?.(t), s._$AM = t, s._$AP !== void 0 && (c = t._$AU) !== n._$AU && s._$AP(c);
    }
    if (o !== i || d) {
      let c = s._$AA;
      for (; c !== o; ) {
        const g = Ze(c).nextSibling;
        Ze(r).insertBefore(c, i), c = g;
      }
    }
  }
  return s;
}, I = (t, e, s = t) => (t._$AI(e, s), t), gs = {}, at = (t, e = gs) => t._$AH = e, ms = (t) => t._$AH, $e = (t) => {
  t._$AR(), t._$AA.remove();
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ke = (t, e, s) => {
  const r = /* @__PURE__ */ new Map();
  for (let i = e; i <= s; i++) r.set(t[i], i);
  return r;
}, _s = ot(class extends nt {
  constructor(t) {
    if (super(t), t.type !== hs.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(t, e, s) {
    let r;
    s === void 0 ? s = e : e !== void 0 && (r = e);
    const i = [], o = [];
    let n = 0;
    for (const d of t) i[n] = r ? r(d, n) : n, o[n] = s(d, n), n++;
    return { values: o, keys: i };
  }
  render(t, e, s) {
    return this.dt(t, e, s).values;
  }
  update(t, [e, s, r]) {
    const i = ms(t), { values: o, keys: n } = this.dt(e, s, r);
    if (!Array.isArray(i)) return this.ut = n, o;
    const d = this.ut ??= [], c = [];
    let g, _, l = 0, m = i.length - 1, u = 0, f = o.length - 1;
    for (; l <= m && u <= f; ) if (i[l] === null) l++;
    else if (i[m] === null) m--;
    else if (d[l] === n[u]) c[u] = I(i[l], o[u]), l++, u++;
    else if (d[m] === n[f]) c[f] = I(i[m], o[f]), m--, f--;
    else if (d[l] === n[f]) c[f] = I(i[l], o[f]), se(t, c[f + 1], i[l]), l++, f--;
    else if (d[m] === n[u]) c[u] = I(i[m], o[u]), se(t, i[l], i[m]), m--, u++;
    else if (g === void 0 && (g = Ke(n, u, f), _ = Ke(d, l, m)), g.has(d[l])) if (g.has(d[m])) {
      const V = _.get(n[u]), xe = V !== void 0 ? i[V] : null;
      if (xe === null) {
        const Le = se(t, i[l]);
        I(Le, o[u]), c[u] = Le;
      } else c[u] = I(xe, o[u]), se(t, i[l], xe), i[V] = null;
      u++;
    } else $e(i[m]), m--;
    else $e(i[l]), l++;
    for (; u <= f; ) {
      const V = se(t, c[f + 1]);
      I(V, o[u]), c[u++] = V;
    }
    for (; l <= m; ) {
      const V = i[l++];
      V !== null && $e(V);
    }
    return this.ut = n, at(t, c), F;
  }
});
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const vs = ot(class extends nt {
  constructor() {
    super(...arguments), this.key = v;
  }
  render(t, e) {
    return this.key = t, e;
  }
  update(t, [e, s]) {
    return e !== this.key && (at(t), this.key = e), s;
  }
});
var fs = Object.defineProperty, xs = Object.getOwnPropertyDescriptor, K = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? xs(e, s) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (i = (r ? n(e, s, i) : n(i)) || i);
  return r && i && fs(e, s, i), i;
};
let D = class extends x {
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
  _nativePicker(t, e, s) {
    return a`<ha-entity-picker
      .hass=${this.hass}
      .value=${t}
      .includeDomains=${this.includeDomains}
      .includeEntities=${this.includeEntities}
      .excludeEntities=${e}
      @value-changed=${(r) => {
      r.stopPropagation(), s(r.detail.value || "");
    }}
    ></ha-entity-picker>`;
  }
  render() {
    return customElements.get("ha-entity-picker") ? a`
        ${_s(
      this.value,
      (t) => t,
      (t, e) => this._nativePicker(
        t,
        this.value.filter((s, r) => r !== e),
        (s) => this._setAt(e, s)
      )
    )}
        ${vs(
      this.value.length,
      this._nativePicker("", this.value, (t) => this._addNew(t))
    )}
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
    return a`
      <div class="chips">
        ${this.value.map(
      (t) => a`<span class="chip"
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
      ${this._open ? a`<div class="suggestions">
            ${this._filtered.length ? this._filtered.map(
      (t) => a`<div class="sugg" @mousedown=${() => this._add(t)}>
                    <span>${this._friendly(t)}</span><span class="sid">${t}</span>
                  </div>`
    ) : a`<div class="sugg empty">Aucune entité</div>`}
          </div>` : ""}
    `;
  }
};
D.styles = b`
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
K([
  p({ attribute: !1 })
], D.prototype, "hass", 2);
K([
  p({ type: Array })
], D.prototype, "value", 2);
K([
  p({ attribute: !1 })
], D.prototype, "includeDomains", 2);
K([
  p({ attribute: !1 })
], D.prototype, "includeEntities", 2);
K([
  h()
], D.prototype, "_query", 2);
K([
  h()
], D.prototype, "_open", 2);
D = K([
  $("homex-entity-picker")
], D);
const bs = ["light", "switch", "input_boolean"], Je = [
  "binary_sensor",
  "switch",
  "input_boolean",
  "person",
  "device_tracker"
];
var $s = Object.defineProperty, ys = Object.getOwnPropertyDescriptor, ce = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? ys(e, s) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (i = (r ? n(e, s, i) : n(i)) || i);
  return r && i && $s(e, s, i), i;
};
let W = class extends x {
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
    return customElements.get("ha-device-picker") ? a`<ha-device-picker
        .hass=${this.hass}
        .value=${this.value}
        @value-changed=${(t) => {
      t.stopPropagation(), this._emit(t.detail.value || "");
    }}
      ></ha-device-picker>` : this.value ? a`<div class="selected">
        <span class="name">${this._name(this.value)}</span>
        <button class="clear" title="Effacer" @click=${() => this._emit("")}>×</button>
      </div>` : a`
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
      ${this._open ? a`<div class="suggestions">
            ${this._filtered.length ? this._filtered.map(
      (t) => a`<div
                      class="sugg"
                      @mousedown=${() => {
        this._query = "", this._open = !1, this._emit(t);
      }}
                    >
                      ${this._name(t)}
                    </div>`
    ) : a`<div class="sugg">Aucun appareil</div>`}
          </div>` : ""}
    `;
  }
};
W.styles = b`
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
ce([
  p({ attribute: !1 })
], W.prototype, "hass", 2);
ce([
  p()
], W.prototype, "value", 2);
ce([
  h()
], W.prototype, "_query", 2);
ce([
  h()
], W.prototype, "_open", 2);
W = ce([
  $("homex-device-field")
], W);
var ws = Object.defineProperty, As = Object.getOwnPropertyDescriptor, de = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? As(e, s) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (i = (r ? n(e, s, i) : n(i)) || i);
  return r && i && ws(e, s, i), i;
};
let Z = class extends x {
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
        const e = await zt(this.hass, t);
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
    this._menuOpen = !1, this._emit([
      ...this.value,
      t === "device" ? { platform: "device", device_id: "" } : { platform: "state" }
    ]);
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
  // -- Entity (state / numeric_state) trigger, like the automation editor ---
  _entityType(t) {
    return t?.platform === "numeric_state" ? "numeric" : "state";
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
  _setKey(t, e, s, r) {
    const i = { ...e };
    r === "" || r === null || r === void 0 ? delete i[s] : i[s] = r, this._update(t, i);
  }
  _setEntity(t, e, s) {
    const r = e?.platform === "numeric_state" ? "numeric_state" : "state";
    this._update(t, s ? { platform: r, entity_id: s } : { platform: r });
  }
  _setEntityType(t, e, s) {
    const r = {
      platform: s === "numeric" ? "numeric_state" : "state",
      entity_id: this._entityOf(e)
    };
    e.attribute && (r.attribute = e.attribute), e.for && (r.for = e.for), this._update(t, r);
  }
  _entityField(t, e) {
    const s = this._entityOf(t), r = (o) => this._setEntity(e, t, o);
    if (customElements.get("ha-entity-picker"))
      return a`<ha-entity-picker
        .hass=${this.hass}
        .value=${s}
        .includeDomains=${Je}
        allow-custom-entity
        @value-changed=${(o) => {
        o.stopPropagation(), r(o.detail.value || "");
      }}
      ></ha-entity-picker>`;
    const i = Object.keys(this.hass.states).filter((o) => Je.includes(o.split(".")[0])).sort();
    return a`<select class="native" @change=${(o) => r(o.target.value)}>
      <option value="">Sélectionnez une entité</option>
      ${i.map(
      (o) => a`<option value=${o} ?selected=${o === s}>
          ${this.hass.states[o]?.attributes?.friendly_name || o}
        </option>`
    )}
    </select>`;
  }
  _entityTypeField(t, e) {
    const s = this._entityType(t);
    return a`<label class="field"><span>Type</span>
      <select
        class="native"
        @change=${(r) => this._setEntityType(e, t, r.target.value)}
      >
        <option value="state" ?selected=${s === "state"}>État</option>
        <option value="numeric" ?selected=${s === "numeric"}>État numérique</option>
      </select>
    </label>`;
  }
  _attrField(t, e) {
    const s = this._entityOf(t), r = Object.keys(this.hass.states[s]?.attributes || {}), i = t.attribute || "";
    return a`<label class="field"><span>Attribut (facultatif)</span>
      <select
        class="native"
        @change=${(o) => this._setKey(e, t, "attribute", o.target.value)}
      >
        <option value="" ?selected=${!i}>(état de l'entité)</option>
        ${r.map((o) => a`<option value=${o} ?selected=${o === i}>${o}</option>`)}
      </select>
    </label>`;
  }
  _stateValueField(t, e, s, r) {
    const i = this._entityOf(t), o = t[s] != null ? String(t[s]) : "", n = `st-${e}-${s}`;
    return a`<label class="field"><span>${r}</span>
      <input
        class="native"
        list=${n}
        .value=${o}
        @change=${(d) => this._setKey(e, t, s, d.target.value)}
      />
      <datalist id=${n}>
        ${this._entityStates(i).map((d) => a`<option value=${d}></option>`)}
      </datalist>
    </label>`;
  }
  _numField(t, e, s, r) {
    const i = t[s] != null ? String(t[s]) : "";
    return a`<label class="field"><span>${r}</span>
      <input
        class="native"
        type="number"
        .value=${i}
        @change=${(o) => {
      const n = o.target.value;
      this._setKey(e, t, s, n === "" ? "" : Number(n));
    }}
      />
    </label>`;
  }
  _forParts(t) {
    const e = t.for;
    if (e && typeof e == "object")
      return { h: e.hours || 0, m: e.minutes || 0, s: e.seconds || 0 };
    if (typeof e == "string") {
      const s = e.split(":").map(Number);
      return { h: s[0] || 0, m: s[1] || 0, s: s[2] || 0 };
    }
    return typeof e == "number" ? { h: 0, m: 0, s: e } : { h: 0, m: 0, s: 0 };
  }
  _setForPart(t, e, s, r) {
    const i = this._forParts(t);
    i[s] = isNaN(r) || r < 0 ? 0 : Math.floor(r);
    const o = i.h + i.m + i.s;
    this._setKey(
      e,
      t,
      "for",
      o ? { hours: i.h, minutes: i.m, seconds: i.s } : ""
    );
  }
  _forField(t, e) {
    const s = this._forParts(t), r = (i, o, n) => a`<input
      type="number"
      min="0"
      placeholder=${n}
      .value=${o ? String(o) : ""}
      @change=${(d) => this._setForPart(t, e, i, Number(d.target.value))}
    />`;
    return a`<label class="field"><span>Pendant (facultatif)</span>
      <div class="dur-row">
        ${r("h", s.h, "hh")}<span>:</span>${r("m", s.m, "mm")}<span>:</span>${r("s", s.s, "ss")}
      </div>
    </label>`;
  }
  _entityBody(t, e) {
    if (!this._entityOf(t)) return "";
    const s = this._entityType(t) === "numeric";
    return a`
      ${this._entityTypeField(t, e)}
      ${this._attrField(t, e)}
      ${s ? a`${this._numField(t, e, "above", "Au-dessus de (facultatif)")}
            ${this._numField(t, e, "below", "En-dessous de (facultatif)")}` : a`${this._stateValueField(t, e, "from", "De (facultatif)")}
            ${this._stateValueField(t, e, "to", "À (facultatif)")}`}
      ${this._forField(t, e)}
    `;
  }
  _deviceField(t, e) {
    return a`<homex-device-field
      .hass=${this.hass}
      .value=${t.device_id || ""}
      @value-changed=${(s) => {
      s.stopPropagation();
      const r = s.detail.value || "";
      r && this._ensure(r), this._update(e, { platform: "device", device_id: r });
    }}
    ></homex-device-field>`;
  }
  _actionField(t, e) {
    const s = this._devTriggers[t.device_id] || [], r = this._deviceTriggerIndex(t);
    return a`<select
      class="native"
      @change=${(i) => {
      const o = Number(i.target.value), n = (this._devTriggers[t.device_id] || [])[o];
      n && this._update(e, { ...n.trigger });
    }}
    >
      <option value="-1" ?selected=${r < 0}>Sélectionnez une action</option>
      ${s.map(
      (i, o) => a`<option value=${o} ?selected=${o === r}>${i.label}</option>`
    )}
    </select>`;
  }
  _card(t, e) {
    const s = !!t?.device_id || t?.platform === "device";
    return a`<div class="card">
      <div class="head">
        <svg viewBox="0 0 24 24"><path d=${s ? Fe : We}></path></svg>
        <span class="title">${s ? "Appareil" : "Entité"}</span>
        <button class="icon-btn" title="Supprimer" @click=${() => this._remove(e)}>
          <svg viewBox="0 0 24 24"><path d=${Kt}></path></svg>
        </button>
      </div>
      <div class="body">
        ${s ? a`<label class="field"><span>Appareil</span>${this._deviceField(t, e)}</label>
              ${t.device_id ? a`<label class="field"><span>Action</span>${this._actionField(t, e)}</label>` : ""}` : a`<label class="field"><span>Entité</span>${this._entityField(t, e)}</label>
              ${this._entityBody(t, e)}`}
      </div>
    </div>`;
  }
  render() {
    return a`
      ${this.value.map((t, e) => this._card(t, e))}
      <div class="add-wrap">
        <button class="add-btn" @click=${() => this._menuOpen = !this._menuOpen}>
          <svg viewBox="0 0 24 24"><path d=${rt}></path></svg>
          Ajouter un déclencheur
        </button>
        ${this._menuOpen ? a`
              <div class="backdrop" @click=${() => this._menuOpen = !1}></div>
              <div class="menu">
                <button @click=${() => this._add("entity")}>
                  <svg viewBox="0 0 24 24"><path d=${We}></path></svg> Entité
                </button>
                <button @click=${() => this._add("device")}>
                  <svg viewBox="0 0 24 24"><path d=${Fe}></path></svg> Appareil
                </button>
              </div>
            ` : ""}
      </div>
    `;
  }
};
Z.styles = b`
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
de([
  p({ attribute: !1 })
], Z.prototype, "hass", 2);
de([
  p({ attribute: !1 })
], Z.prototype, "value", 2);
de([
  h()
], Z.prototype, "_menuOpen", 2);
de([
  h()
], Z.prototype, "_devTriggers", 2);
Z = de([
  $("homex-trigger-selector")
], Z);
var ks = Object.defineProperty, Cs = Object.getOwnPropertyDescriptor, H = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Cs(e, s) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (i = (r ? n(e, s, i) : n(i)) || i);
  return r && i && ks(e, s, i), i;
};
let w = class extends x {
  constructor() {
    super(...arguments), this.open = !1, this.group = null, this._name = "", this._id = "", this._devices = [], this._triggers = [], this._busy = !1, this._idEdited = !1;
  }
  willUpdate(t) {
    t.has("open") && this.open && (this._name = this.group?.name ?? "", this._id = this.group?.group_id ?? "", this._devices = this.group?.devices ?? [], this._triggers = (this.group?.triggers ?? []).map((e) => ({ ...e })), this._busy = !1, this._idEdited = !!this.group);
  }
  _onName(t) {
    this._name = t, this._idEdited || (this._id = He(t));
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
      this.group ? await Ut(this.hass, {
        entry_id: this.room.entry_id,
        group_id: this.group.group_id,
        name: t,
        devices: this._devices,
        triggers: s
      }) : await jt(this.hass, {
        entry_id: this.room.entry_id,
        group_id: e,
        name: t,
        devices: this._devices,
        triggers: s
      }), N(this), this._close();
    } catch (r) {
      this._busy = !1, alert("Erreur Homex : " + y(r));
    }
  }
  async _delete() {
    if (this.group && confirm(`Supprimer le groupe "${this.group.group_id}" ?`)) {
      this._busy = !0;
      try {
        await Rt(this.hass, this.room.entry_id, this.group.group_id), N(this), this._close();
      } catch (t) {
        this._busy = !1, alert("Erreur Homex : " + y(t));
      }
    }
  }
  render() {
    const t = !!this.group;
    return a`
      <homex-dialog
        .open=${this.open}
        heading=${t ? "Modifier le groupe" : "Nouveau groupe"}
        @dialog-closed=${this._close}
      >
        ${ae("Nom", this._name, (e) => this._onName(e), "Table de chevet L")}
        ${t ? a`<div class="section">Id : ${this.group.group_id}</div>` : ae("Id", this._id, (e) => this._onId(e), "bedside_l")}
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
          ${t ? a`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
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
w.styles = U;
H([
  p({ attribute: !1 })
], w.prototype, "hass", 2);
H([
  p({ type: Boolean })
], w.prototype, "open", 2);
H([
  p({ attribute: !1 })
], w.prototype, "room", 2);
H([
  p({ attribute: !1 })
], w.prototype, "group", 2);
H([
  h()
], w.prototype, "_name", 2);
H([
  h()
], w.prototype, "_id", 2);
H([
  h()
], w.prototype, "_devices", 2);
H([
  h()
], w.prototype, "_triggers", 2);
H([
  h()
], w.prototype, "_busy", 2);
w = H([
  $("homex-group-dialog")
], w);
var Es = Object.defineProperty, Ss = Object.getOwnPropertyDescriptor, pe = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Ss(e, s) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (i = (r ? n(e, s, i) : n(i)) || i);
  return r && i && Es(e, s, i), i;
};
let G = class extends x {
  constructor() {
    super(...arguments), this._open = !1;
  }
  get _slug() {
    return `${this.room.room_id}_${this.group.group_id}`;
  }
  render() {
    const t = this._slug;
    return a`
      <div class="row">
        <homex-unit-controls .hass=${this.hass} .unit=${this.group}></homex-unit-controls>
        <a
          class="scene-link"
          href="/config/scene/edit/homex_${t}_turn_on"
          target="_blank"
          rel="noopener"
          title="Éditer la scène « allumé » du groupe"
        >
          <svg viewBox="0 0 24 24"><path d=${es}></path></svg>
        </a>
        <a
          class="scene-link"
          href="/config/scene/edit/homex_${t}_turn_off"
          target="_blank"
          rel="noopener"
          title="Éditer la scène « éteint » du groupe"
        >
          <svg viewBox="0 0 24 24"><path d=${Yt}></path></svg>
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
G.styles = [
  U,
  b`
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
pe([
  p({ attribute: !1 })
], G.prototype, "hass", 2);
pe([
  p({ attribute: !1 })
], G.prototype, "room", 2);
pe([
  p({ attribute: !1 })
], G.prototype, "group", 2);
pe([
  h()
], G.prototype, "_open", 2);
G = pe([
  $("homex-group-row")
], G);
var Hs = Object.defineProperty, Os = Object.getOwnPropertyDescriptor, O = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Os(e, s) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (i = (r ? n(e, s, i) : n(i)) || i);
  return r && i && Hs(e, s, i), i;
};
let A = class extends x {
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
    this._name = t, this._idEdited || (this._id = He(t));
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
      this.room ? await it(this.hass, {
        entry_id: this.room.entry_id,
        name: t,
        room_id: e,
        area_id: s,
        devices: this._devices,
        scene_strategy: this._strategy
      }) : await Vt(this.hass, {
        name: t,
        room_id: e,
        area_id: s,
        devices: this._devices,
        scene_strategy: this._strategy
      }), N(this), this._close();
    } catch (s) {
      this._busy = !1, alert("Erreur Homex : " + y(s));
    }
  }
  render() {
    const t = !!this.room;
    return a`
      <homex-dialog
        .open=${this.open}
        heading=${t ? "Modifier la pièce" : "Nouvelle pièce"}
        @dialog-closed=${this._close}
      >
        ${ae("Nom", this._name, (e) => this._onName(e), "Chambre")}
        ${ae("Id", this._id, (e) => this._onId(e), "bedroom")}
        <div class="section">Pièce Home Assistant (optionnel)</div>
        <select
          .value=${this._areaId}
          @change=${(e) => this._areaId = e.target.value}
        >
          <option value="">— Aucune —</option>
          ${this._areas.map(
      (e) => a`<option value=${e.area_id}>${e.name}</option>`
    )}
        </select>
        <div class="section">Appareils de la pièce</div>
        <homex-entity-picker
          .hass=${this.hass}
          .includeDomains=${bs}
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
A.styles = [
  U,
  b`
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
O([
  p({ attribute: !1 })
], A.prototype, "hass", 2);
O([
  p({ type: Boolean })
], A.prototype, "open", 2);
O([
  p({ attribute: !1 })
], A.prototype, "room", 2);
O([
  h()
], A.prototype, "_name", 2);
O([
  h()
], A.prototype, "_id", 2);
O([
  h()
], A.prototype, "_areaId", 2);
O([
  h()
], A.prototype, "_devices", 2);
O([
  h()
], A.prototype, "_strategy", 2);
O([
  h()
], A.prototype, "_busy", 2);
A = O([
  $("homex-room-dialog")
], A);
var Ls = Object.defineProperty, Ps = Object.getOwnPropertyDescriptor, z = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Ps(e, s) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (i = (r ? n(e, s, i) : n(i)) || i);
  return r && i && Ls(e, s, i), i;
};
let S = class extends x {
  constructor() {
    super(...arguments), this.open = !1, this._toggle = [], this._scene = [], this._dimUp = [], this._dimDown = [], this._busy = !1;
  }
  willUpdate(t) {
    t.has("open") && this.open && (this._toggle = (this.room?.triggers ?? []).map((e) => ({ ...e })), this._scene = (this.room?.scene_triggers ?? []).map((e) => ({ ...e })), this._dimUp = (this.room?.dim_up_triggers ?? []).map((e) => ({ ...e })), this._dimDown = (this.room?.dim_down_triggers ?? []).map((e) => ({ ...e })), this._busy = !1);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  async _save() {
    this._busy = !0;
    try {
      await it(this.hass, {
        entry_id: this.room.entry_id,
        triggers: this._toggle,
        scene_triggers: this._scene,
        dim_up_triggers: this._dimUp,
        dim_down_triggers: this._dimDown
      }), N(this), this._close();
    } catch (t) {
      this._busy = !1, alert("Erreur Homex : " + y(t));
    }
  }
  render() {
    return a`
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

        <div class="group">
          <div class="section">Dimmer + (monter la luminosité)</div>
          <p class="hint">
            Chaque déclenchement ajoute 20 à la luminosité des lumières de la pièce.
          </p>
          <homex-trigger-selector
            .hass=${this.hass}
            .value=${this._dimUp}
            @value-changed=${(t) => this._dimUp = t.detail.value}
          ></homex-trigger-selector>
        </div>

        <div class="group">
          <div class="section">Dimmer − (baisser la luminosité)</div>
          <p class="hint">
            Chaque déclenchement retire 20 à la luminosité des lumières de la pièce.
          </p>
          <homex-trigger-selector
            .hass=${this.hass}
            .value=${this._dimDown}
            @value-changed=${(t) => this._dimDown = t.detail.value}
          ></homex-trigger-selector>
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
S.styles = [
  U,
  b`
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
z([
  p({ attribute: !1 })
], S.prototype, "hass", 2);
z([
  p({ type: Boolean })
], S.prototype, "open", 2);
z([
  p({ attribute: !1 })
], S.prototype, "room", 2);
z([
  h()
], S.prototype, "_toggle", 2);
z([
  h()
], S.prototype, "_scene", 2);
z([
  h()
], S.prototype, "_dimUp", 2);
z([
  h()
], S.prototype, "_dimDown", 2);
z([
  h()
], S.prototype, "_busy", 2);
S = z([
  $("homex-triggers-dialog")
], S);
var Ms = Object.defineProperty, Vs = Object.getOwnPropertyDescriptor, L = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Vs(e, s) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (i = (r ? n(e, s, i) : n(i)) || i);
  return r && i && Ms(e, s, i), i;
};
let k = class extends x {
  constructor() {
    super(...arguments), this.open = !1, this.scene = null, this._name = "", this._mode = "new", this._attachId = "", this._triggers = [], this._busy = !1;
  }
  willUpdate(t) {
    t.has("open") && this.open && (this._name = this.scene?.name ?? "", this._mode = "new", this._attachId = "", this._triggers = (this.scene?.triggers ?? []).map((e) => ({ ...e })), this._busy = !1);
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
    const e = He(t);
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
        this.scene ? await Ft(
          this.hass,
          this.room.entry_id,
          this.scene.key,
          t,
          this._triggers
        ) : this._mode === "attach" ? await Be(
          this.hass,
          this.room.entry_id,
          t,
          this._attachId,
          this._triggers
        ) : await Be(
          this.hass,
          this.room.entry_id,
          t,
          void 0,
          this._triggers
        ), N(this), this._close();
      } catch (e) {
        this._busy = !1, alert("Erreur Homex : " + y(e));
      }
    }
  }
  render() {
    const t = !!this.scene, e = this._nameTaken, s = !!this._name.trim() && !e;
    return a`
      <homex-dialog
        .open=${this.open}
        heading=${t ? "Renommer la scène" : "Nouvelle scène"}
        @dialog-closed=${this._close}
      >
        ${ae("Nom de la scène", this._name, (r) => this._name = r, "Nuit")}
        ${e ? a`<div class="err">Ce nom de scène existe déjà.</div>` : ""}
        ${t ? "" : this._renderModePicker()}
        <div class="section">Déclencheurs (activent cette scène)</div>
        <homex-trigger-selector
          .hass=${this.hass}
          .value=${this._triggers}
          @value-changed=${(r) => this._triggers = r.detail.value}
        ></homex-trigger-selector>
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
    return a`
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
      ${this._mode === "new" ? a`<div class="section">
            La scène est créée « tout éteint » ; édite-la ensuite dans Home Assistant.
          </div>` : a`
            <div class="section">
              Scène existante à adopter (elle sera renommée, son contenu conservé)
            </div>
            <select
              .value=${this._attachId}
              @change=${(t) => this._onPickScene(t.target.value)}
            >
              <option value="">— Choisir une scène —</option>
              ${this._availableScenes.map(
      (t) => a`<option value=${t.config_id}>${t.name}</option>`
    )}
            </select>
          `}
    `;
  }
};
k.styles = [
  U,
  b`
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
L([
  p({ attribute: !1 })
], k.prototype, "hass", 2);
L([
  p({ type: Boolean })
], k.prototype, "open", 2);
L([
  p({ attribute: !1 })
], k.prototype, "room", 2);
L([
  p({ attribute: !1 })
], k.prototype, "scene", 2);
L([
  h()
], k.prototype, "_name", 2);
L([
  h()
], k.prototype, "_mode", 2);
L([
  h()
], k.prototype, "_attachId", 2);
L([
  h()
], k.prototype, "_triggers", 2);
L([
  h()
], k.prototype, "_busy", 2);
k = L([
  $("homex-scene-dialog")
], k);
var Ds = Object.defineProperty, zs = Object.getOwnPropertyDescriptor, P = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? zs(e, s) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (i = (r ? n(e, s, i) : n(i)) || i);
  return r && i && Ds(e, s, i), i;
};
let C = class extends x {
  constructor() {
    super(...arguments), this.expanded = !1, this._dialog = "", this._menuOpen = !1, this._renameScene = null, this._deleteScenes = !0, this._deleting = !1, this._syncing = !1, this._close = () => this._dialog = "", this._delete = () => {
      this._menuOpen = !1, this._deleteScenes = !0, this._dialog = "delete";
    }, this._confirmDelete = async () => {
      this._deleting = !0;
      try {
        await Dt(this.hass, this.room.entry_id, this._deleteScenes), this._dialog = "", N(this);
      } catch (t) {
        alert("Erreur Homex : " + y(t));
      } finally {
        this._deleting = !1;
      }
    }, this._syncLabels = async () => {
      this._menuOpen = !1, this._syncing = !0;
      try {
        const t = await Tt(this.hass, this.room.entry_id);
        alert(
          `Synchronisé : ${t.updated} entité(s) (area + labels), ${t.scenes_renamed} scène(s) renommée(s).`
        );
      } catch (t) {
        alert("Erreur Homex : " + y(t));
      } finally {
        this._syncing = !1;
      }
    }, this._sceneNext = async (t) => {
      t?.stopPropagation();
      try {
        await qt(this.hass, this.room.entry_id);
      } catch (e) {
        alert("Erreur Homex : " + y(e));
      }
    }, this._dim = async (t, e) => {
      e?.stopPropagation();
      try {
        await Nt(this.hass, this.room.entry_id, t);
      } catch (s) {
        alert("Erreur Homex : " + y(s));
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
        await It(this.hass, this.room.entry_id, t.key), N(this);
      } catch (e) {
        alert("Erreur Homex : " + y(e));
      }
  }
  async _sceneMoved(t) {
    const { oldIndex: e, newIndex: s } = t.detail, r = this.room.scenes.filter((o) => o.orderable).map((o) => o.key), [i] = r.splice(e, 1);
    r.splice(s, 0, i);
    try {
      await Bt(this.hass, this.room.entry_id, r), N(this);
    } catch (o) {
      alert("Erreur Homex : " + y(o));
    }
  }
  _iconBtn(t, e, s, r = !1) {
    return a`<button
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
    return a`
      <div class="scene-row">
        ${t.orderable ? a`<span class="handle" title="Glisser pour réordonner">
              <svg viewBox="0 0 24 24"><path d=${Qt}></path></svg>
            </span>` : a`<span class="pin" title="Toujours en dernier">
              <svg viewBox="0 0 24 24"><path d=${os}></path></svg>
            </span>`}
        <span class="scene-name">${t.name}</span>
        ${t.key === e ? a`<span class="active-tag">active</span>` : ""}
        <span class="btn-group">
          ${this._iconBtn(
      is,
      "Voir dans Home Assistant",
      () => this._openHa(t)
    )}
          ${this._iconBtn(rs, "Renommer", () => this._renameScene = t)}
          ${this._iconBtn(
      Jt,
      t.removable ? "Supprimer" : "Scène par défaut",
      () => this._deleteScene(t),
      !t.removable
    )}
        </span>
      </div>
    `;
  }
  render() {
    const t = this.room, s = this._isOn() ? this.hass.states[t.switch]?.attributes?.active_scene ?? null : null, r = s ? t.scenes.find((l) => l.key === s)?.name : void 0, i = t.area_id ? this.hass.areas?.[t.area_id] : null, o = i?.icon || void 0, d = (i?.floor_id ? this.hass.floors?.[i.floor_id] : null)?.name || void 0, c = t.scenes.filter((l) => l.orderable), g = t.scenes.filter((l) => !l.orderable), _ = t.scenes.some((l) => l.removable);
    return a`
      <ha-card>
        <div class="head" @click=${this._toggleExpand} title="Plier / déplier">
          <svg class="chevron" viewBox="0 0 24 24">
            <path d=${this.expanded ? Gt : Zt}></path>
          </svg>
          <homex-unit-controls
            .hass=${this.hass}
            .unit=${t}
            .areaIcon=${o}
            .floorName=${d}
            .activeScene=${r}
          ></homex-unit-controls>
          <div class="head-actions">
            ${t.dim_up_triggers?.length || t.dim_down_triggers?.length ? a`
                  <button
                    class="round"
                    title="Baisser la luminosité (−20)"
                    @click=${(l) => this._dim(-20, l)}
                  >
                    <svg viewBox="0 0 24 24"><path d=${ss}></path></svg>
                  </button>
                  <button
                    class="round"
                    title="Monter la luminosité (+20)"
                    @click=${(l) => this._dim(20, l)}
                  >
                    <svg viewBox="0 0 24 24"><path d=${rt}></path></svg>
                  </button>
                ` : ""}
            ${_ ? a`<button
                  class="round"
                  title="Changer de scène"
                  @click=${(l) => this._sceneNext(l)}
                >
                  <svg viewBox="0 0 24 24"><path d=${ns}></path></svg>
                </button>` : ""}
            <button
              class="kebab"
              title="Actions"
              @click=${(l) => {
      l.stopPropagation(), this._menuOpen = !0;
    }}
            >
              ⋮
            </button>
          </div>
        </div>

        ${this._menuOpen ? a`
              <div class="menu-backdrop" @click=${() => this._menuOpen = !1}></div>
              <div class="menu">
                <button @click=${() => this._pick("room")}>✏️ Modifier la pièce</button>
                <button @click=${() => this._pick("triggers")}>
                  ⚡ Déclencheurs (${t.triggers.length + t.scene_triggers.length})
                </button>
                <button @click=${() => this._pick("addgroup")}>
                  ＋ Ajouter un groupe
                </button>
                <button ?disabled=${this._syncing} @click=${this._syncLabels}>
                  🏷 ${this._syncing ? "Synchronisation…" : "Synchroniser les labels"}
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
          ${t.groups.length ? a`<span class="stat">📦 ${t.groups.length} groupe(s)</span>` : ""}
        </div>
        ${this.expanded ? this._renderBody(t, s, c, g) : ""}
      </ha-card>

      ${this._renderDialogs(t)}
    `;
  }
  _renderBody(t, e, s, r) {
    return a`
        <div class="section-row">
          <span class="section">Scènes</span>
          <button @click=${() => this._pick("addscene")}>＋ Scène</button>
        </div>
        <ha-sortable handle-selector=".handle" @item-moved=${this._sceneMoved}>
          <div>${s.map((i) => this._sceneRow(i, e))}</div>
        </ha-sortable>
        ${r.map((i) => this._sceneRow(i, e))}

        ${t.groups.length ? a`
              <div class="section-row">
                <span class="section">Groupes</span>
                <button @click=${() => this._pick("addgroup")}>＋ Groupe</button>
              </div>
              <div class="groups">
                ${t.groups.map(
      (i) => a`<homex-group-row
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
    return a`
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
    return a`
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
C.styles = [
  U,
  b`
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
  p({ attribute: !1 })
], C.prototype, "hass", 2);
P([
  p({ attribute: !1 })
], C.prototype, "room", 2);
P([
  p({ type: Boolean })
], C.prototype, "expanded", 2);
P([
  h()
], C.prototype, "_dialog", 2);
P([
  h()
], C.prototype, "_menuOpen", 2);
P([
  h()
], C.prototype, "_renameScene", 2);
P([
  h()
], C.prototype, "_deleteScenes", 2);
P([
  h()
], C.prototype, "_deleting", 2);
P([
  h()
], C.prototype, "_syncing", 2);
C = P([
  $("homex-room-card")
], C);
var Ts = Object.defineProperty, Ns = Object.getOwnPropertyDescriptor, fe = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Ns(e, s) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (i = (r ? n(e, s, i) : n(i)) || i);
  return r && i && Ts(e, s, i), i;
};
const Qe = (t) => '"' + String(t).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
function js(t) {
  const e = ["google_assistant:", "  entity_config:"];
  t.length || (e[1] = "  entity_config: {}");
  for (const s of t)
    e.push(`    ${s.switch}:`), e.push(`      name: ${Qe(s.name)}`), e.push("      expose: true"), e.push(`      room: ${Qe(s.name)}`);
  return e.join(`
`) + `
`;
}
let X = class extends x {
  constructor() {
    super(...arguments), this.open = !1, this.rooms = [], this._copied = !1;
  }
  get _yaml() {
    return js(this.rooms);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  async _copy() {
    const t = this._yaml;
    try {
      await navigator.clipboard.writeText(t);
    } catch {
      const e = this.renderRoot.querySelector("textarea");
      e && (e.select(), document.execCommand("copy"));
    }
    this._copied = !0, setTimeout(() => this._copied = !1, 1500);
  }
  _download() {
    const t = new Blob([this._yaml], { type: "text/yaml" }), e = URL.createObjectURL(t), s = document.createElement("a");
    s.href = e, s.download = "homex_google_assistant.yaml", s.click(), URL.revokeObjectURL(e);
  }
  render() {
    return a`
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
          @click=${(t) => t.target.select()}
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
X.styles = [
  U,
  b`
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
fe([
  p({ type: Boolean })
], X.prototype, "open", 2);
fe([
  p({ attribute: !1 })
], X.prototype, "rooms", 2);
fe([
  h()
], X.prototype, "_copied", 2);
X = fe([
  $("homex-export-dialog")
], X);
var Us = Object.defineProperty, Rs = Object.getOwnPropertyDescriptor, M = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Rs(e, s) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (i = (r ? n(e, s, i) : n(i)) || i);
  return r && i && Us(e, s, i), i;
};
const Is = "55";
let E = class extends x {
  constructor() {
    super(...arguments), this.narrow = !1, this._rooms = null, this._error = null, this._createOpen = !1, this._exportOpen = !1, this._expanded = localStorage.getItem("homex_expanded") || null, this._loaded = !1, this._onToggleExpand = (t) => {
      const e = t.detail.entry_id;
      this._expanded = this._expanded === e ? null : e, this._expanded ? localStorage.setItem("homex_expanded", this._expanded) : localStorage.removeItem("homex_expanded");
    }, this._reload = async () => {
      try {
        this._rooms = await Mt(this.hass), this._error = null;
      } catch (t) {
        this._error = y(t);
      }
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener(ye, this._reload), this.addEventListener("homex-toggle-expand", this._onToggleExpand);
  }
  disconnectedCallback() {
    this.removeEventListener(ye, this._reload), this.removeEventListener("homex-toggle-expand", this._onToggleExpand), super.disconnectedCallback();
  }
  updated(t) {
    t.has("hass") && this.hass && !this._loaded && (this._loaded = !0, Wt().then(() => this.requestUpdate()), this._reload());
  }
  _roomCard(t) {
    return a`<homex-room-card
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
      t = a`<div class="msg err">Erreur : ${this._error}</div>`;
    else if (!this._rooms)
      t = a`<div class="msg">Chargement…</div>`;
    else if (!this._rooms.length)
      t = a`<div class="msg">
        Aucune pièce. Clique sur <strong>＋ Nouvelle pièce</strong> en haut à
        droite pour en créer une.
      </div>`;
    else {
      const { ungrouped: e, floors: s, byFloor: r } = this._grouped();
      t = a`
        ${e.map((i) => this._roomCard(i))}
        ${s.map(
        (i) => a`
            <div class="floor-header">
              ${i.icon ? a`<ha-icon .icon=${i.icon}></ha-icon>` : ""}
              <span>${i.name}</span>
            </div>
            ${(r.get(i.floor_id) || []).map(
          (o) => this._roomCard(o)
        )}
          `
      )}
      `;
    }
    return a`
      <div class="wrap">
        <header>
          <h1>Homex <span class="ver">v${Is}</span></h1>
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
      <homex-export-dialog
        .rooms=${this._rooms || []}
        .open=${this._exportOpen}
        @dialog-closed=${() => this._exportOpen = !1}
      ></homex-export-dialog>
    `;
  }
};
E.styles = b`
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
M([
  p({ attribute: !1 })
], E.prototype, "hass", 2);
M([
  p({ attribute: !1 })
], E.prototype, "narrow", 2);
M([
  p({ attribute: !1 })
], E.prototype, "route", 2);
M([
  p({ attribute: !1 })
], E.prototype, "panel", 2);
M([
  h()
], E.prototype, "_rooms", 2);
M([
  h()
], E.prototype, "_error", 2);
M([
  h()
], E.prototype, "_createOpen", 2);
M([
  h()
], E.prototype, "_exportOpen", 2);
M([
  h()
], E.prototype, "_expanded", 2);
E = M([
  $("homex-panel")
], E);
export {
  E as HomexPanel
};
