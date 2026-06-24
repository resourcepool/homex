/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ne = globalThis, _e = ne.ShadowRoot && (ne.ShadyCSS === void 0 || ne.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, me = Symbol(), we = /* @__PURE__ */ new WeakMap();
let je = class {
  constructor(e, s, i) {
    if (this._$cssResult$ = !0, i !== me) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (_e && e === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (e = we.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && we.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const qe = (t) => new je(typeof t == "string" ? t : t + "", void 0, me), w = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((i, o, r) => i + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + t[r + 1], t[0]);
  return new je(s, t, me);
}, Ze = (t, e) => {
  if (_e) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const i = document.createElement("style"), o = ne.litNonce;
    o !== void 0 && i.setAttribute("nonce", o), i.textContent = s.cssText, t.appendChild(i);
  }
}, Ae = _e ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const i of e.cssRules) s += i.cssText;
  return qe(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ge, defineProperty: Fe, getOwnPropertyDescriptor: Je, getOwnPropertyNames: Ke, getOwnPropertySymbols: Xe, getPrototypeOf: Qe } = Object, de = globalThis, Ee = de.trustedTypes, Ye = Ee ? Ee.emptyScript : "", et = de.reactiveElementPolyfillSupport, K = (t, e) => t, ae = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Ye : null;
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
} }, fe = (t, e) => !Ge(t, e), Se = { attribute: !0, type: String, converter: ae, reflect: !1, useDefault: !1, hasChanged: fe };
Symbol.metadata ??= Symbol("metadata"), de.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let W = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = Se) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const i = Symbol(), o = this.getPropertyDescriptor(e, i, s);
      o !== void 0 && Fe(this.prototype, e, o);
    }
  }
  static getPropertyDescriptor(e, s, i) {
    const { get: o, set: r } = Je(this.prototype, e) ?? { get() {
      return this[s];
    }, set(n) {
      this[s] = n;
    } };
    return { get: o, set(n) {
      const h = o?.call(this);
      r?.call(this, n), this.requestUpdate(e, h, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Se;
  }
  static _$Ei() {
    if (this.hasOwnProperty(K("elementProperties"))) return;
    const e = Qe(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(K("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(K("properties"))) {
      const s = this.properties, i = [...Ke(s), ...Xe(s)];
      for (const o of i) this.createProperty(o, s[o]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const s = litPropertyMetadata.get(e);
      if (s !== void 0) for (const [i, o] of s) this.elementProperties.set(i, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const o = this._$Eu(s, i);
      o !== void 0 && this._$Eh.set(o, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const s = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const o of i) s.unshift(Ae(o));
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
  attributeChangedCallback(e, s, i) {
    this._$AK(e, i);
  }
  _$ET(e, s) {
    const i = this.constructor.elementProperties.get(e), o = this.constructor._$Eu(e, i);
    if (o !== void 0 && i.reflect === !0) {
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : ae).toAttribute(s, i.type);
      this._$Em = e, r == null ? this.removeAttribute(o) : this.setAttribute(o, r), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const i = this.constructor, o = i._$Eh.get(e);
    if (o !== void 0 && this._$Em !== o) {
      const r = i.getPropertyOptions(o), n = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : ae;
      this._$Em = o;
      const h = n.fromAttribute(s, r.type);
      this[o] = h ?? this._$Ej?.get(o) ?? h, this._$Em = null;
    }
  }
  requestUpdate(e, s, i, o = !1, r) {
    if (e !== void 0) {
      const n = this.constructor;
      if (o === !1 && (r = this[e]), i ??= n.getPropertyOptions(e), !((i.hasChanged ?? fe)(r, s) || i.useDefault && i.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(n._$Eu(e, i)))) return;
      this.C(e, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: i, reflect: o, wrapped: r }, n) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, n ?? s ?? this[e]), r !== !0 || n !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (s = void 0), this._$AL.set(e, s)), o === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [o, r] of this._$Ep) this[o] = r;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [o, r] of i) {
        const { wrapped: n } = r, h = this[o];
        n !== !0 || this._$AL.has(o) || h === void 0 || this.C(o, void 0, r, h);
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
W.elementStyles = [], W.shadowRootOptions = { mode: "open" }, W[K("elementProperties")] = /* @__PURE__ */ new Map(), W[K("finalized")] = /* @__PURE__ */ new Map(), et?.({ ReactiveElement: W }), (de.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ve = globalThis, ke = (t) => t, le = ve.trustedTypes, Ce = le ? le.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Te = "$lit$", z = `lit$${Math.random().toFixed(9).slice(2)}$`, Ue = "?" + z, tt = `<${Ue}>`, U = document, X = () => U.createComment(""), Q = (t) => t === null || typeof t != "object" && typeof t != "function", xe = Array.isArray, st = (t) => xe(t) || typeof t?.[Symbol.iterator] == "function", ue = `[ 	
\f\r]`, J = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, He = /-->/g, Pe = />/g, j = RegExp(`>|${ue}(?:([^\\s"'>=/]+)(${ue}*=${ue}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Oe = /'/g, Le = /"/g, Re = /^(?:script|style|textarea|title)$/i, it = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), a = it(1), q = Symbol.for("lit-noChange"), _ = Symbol.for("lit-nothing"), De = /* @__PURE__ */ new WeakMap(), T = U.createTreeWalker(U, 129);
function Ie(t, e) {
  if (!xe(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ce !== void 0 ? Ce.createHTML(e) : e;
}
const ot = (t, e) => {
  const s = t.length - 1, i = [];
  let o, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", n = J;
  for (let h = 0; h < s; h++) {
    const l = t[h];
    let g, p, u = -1, C = 0;
    for (; C < l.length && (n.lastIndex = C, p = n.exec(l), p !== null); ) C = n.lastIndex, n === J ? p[1] === "!--" ? n = He : p[1] !== void 0 ? n = Pe : p[2] !== void 0 ? (Re.test(p[2]) && (o = RegExp("</" + p[2], "g")), n = j) : p[3] !== void 0 && (n = j) : n === j ? p[0] === ">" ? (n = o ?? J, u = -1) : p[1] === void 0 ? u = -2 : (u = n.lastIndex - p[2].length, g = p[1], n = p[3] === void 0 ? j : p[3] === '"' ? Le : Oe) : n === Le || n === Oe ? n = j : n === He || n === Pe ? n = J : (n = j, o = void 0);
    const M = n === j && t[h + 1].startsWith("/>") ? " " : "";
    r += n === J ? l + tt : u >= 0 ? (i.push(g), l.slice(0, u) + Te + l.slice(u) + z + M) : l + z + (u === -2 ? h : M);
  }
  return [Ie(t, r + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class Y {
  constructor({ strings: e, _$litType$: s }, i) {
    let o;
    this.parts = [];
    let r = 0, n = 0;
    const h = e.length - 1, l = this.parts, [g, p] = ot(e, s);
    if (this.el = Y.createElement(g, i), T.currentNode = this.el.content, s === 2 || s === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (o = T.nextNode()) !== null && l.length < h; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const u of o.getAttributeNames()) if (u.endsWith(Te)) {
          const C = p[n++], M = o.getAttribute(u).split(z), oe = /([.?@])?(.*)/.exec(C);
          l.push({ type: 1, index: r, name: oe[2], strings: M, ctor: oe[1] === "." ? nt : oe[1] === "?" ? at : oe[1] === "@" ? lt : he }), o.removeAttribute(u);
        } else u.startsWith(z) && (l.push({ type: 6, index: r }), o.removeAttribute(u));
        if (Re.test(o.tagName)) {
          const u = o.textContent.split(z), C = u.length - 1;
          if (C > 0) {
            o.textContent = le ? le.emptyScript : "";
            for (let M = 0; M < C; M++) o.append(u[M], X()), T.nextNode(), l.push({ type: 2, index: ++r });
            o.append(u[C], X());
          }
        }
      } else if (o.nodeType === 8) if (o.data === Ue) l.push({ type: 2, index: r });
      else {
        let u = -1;
        for (; (u = o.data.indexOf(z, u + 1)) !== -1; ) l.push({ type: 7, index: r }), u += z.length - 1;
      }
      r++;
    }
  }
  static createElement(e, s) {
    const i = U.createElement("template");
    return i.innerHTML = e, i;
  }
}
function Z(t, e, s = t, i) {
  if (e === q) return e;
  let o = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const r = Q(e) ? void 0 : e._$litDirective$;
  return o?.constructor !== r && (o?._$AO?.(!1), r === void 0 ? o = void 0 : (o = new r(t), o._$AT(t, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = o : s._$Cl = o), o !== void 0 && (e = Z(t, o._$AS(t, e.values), o, i)), e;
}
class rt {
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
    const { el: { content: s }, parts: i } = this._$AD, o = (e?.creationScope ?? U).importNode(s, !0);
    T.currentNode = o;
    let r = T.nextNode(), n = 0, h = 0, l = i[0];
    for (; l !== void 0; ) {
      if (n === l.index) {
        let g;
        l.type === 2 ? g = new se(r, r.nextSibling, this, e) : l.type === 1 ? g = new l.ctor(r, l.name, l.strings, this, e) : l.type === 6 && (g = new ct(r, this, e)), this._$AV.push(g), l = i[++h];
      }
      n !== l?.index && (r = T.nextNode(), n++);
    }
    return T.currentNode = U, o;
  }
  p(e) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, s), s += i.strings.length - 2) : i._$AI(e[s])), s++;
  }
}
class se {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, i, o) {
    this.type = 2, this._$AH = _, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = i, this.options = o, this._$Cv = o?.isConnected ?? !0;
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
    e = Z(this, e, s), Q(e) ? e === _ || e == null || e === "" ? (this._$AH !== _ && this._$AR(), this._$AH = _) : e !== this._$AH && e !== q && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : st(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== _ && Q(this._$AH) ? this._$AA.nextSibling.data = e : this.T(U.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: i } = e, o = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = Y.createElement(Ie(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === o) this._$AH.p(s);
    else {
      const r = new rt(o, this), n = r.u(this.options);
      r.p(s), this.T(n), this._$AH = r;
    }
  }
  _$AC(e) {
    let s = De.get(e.strings);
    return s === void 0 && De.set(e.strings, s = new Y(e)), s;
  }
  k(e) {
    xe(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, o = 0;
    for (const r of e) o === s.length ? s.push(i = new se(this.O(X()), this.O(X()), this, this.options)) : i = s[o], i._$AI(r), o++;
    o < s.length && (this._$AR(i && i._$AB.nextSibling, o), s.length = o);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const i = ke(e).nextSibling;
      ke(e).remove(), e = i;
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
  constructor(e, s, i, o, r) {
    this.type = 1, this._$AH = _, this._$AN = void 0, this.element = e, this.name = s, this._$AM = o, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = _;
  }
  _$AI(e, s = this, i, o) {
    const r = this.strings;
    let n = !1;
    if (r === void 0) e = Z(this, e, s, 0), n = !Q(e) || e !== this._$AH && e !== q, n && (this._$AH = e);
    else {
      const h = e;
      let l, g;
      for (e = r[0], l = 0; l < r.length - 1; l++) g = Z(this, h[i + l], s, l), g === q && (g = this._$AH[l]), n ||= !Q(g) || g !== this._$AH[l], g === _ ? e = _ : e !== _ && (e += (g ?? "") + r[l + 1]), this._$AH[l] = g;
    }
    n && !o && this.j(e);
  }
  j(e) {
    e === _ ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class nt extends he {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === _ ? void 0 : e;
  }
}
class at extends he {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== _);
  }
}
class lt extends he {
  constructor(e, s, i, o, r) {
    super(e, s, i, o, r), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = Z(this, e, s, 0) ?? _) === q) return;
    const i = this._$AH, o = e === _ && i !== _ || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, r = e !== _ && (i === _ || o);
    o && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class ct {
  constructor(e, s, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Z(this, e);
  }
}
const dt = ve.litHtmlPolyfillSupport;
dt?.(Y, se), (ve.litHtmlVersions ??= []).push("3.3.3");
const ht = (t, e, s) => {
  const i = s?.renderBefore ?? e;
  let o = i._$litPart$;
  if (o === void 0) {
    const r = s?.renderBefore ?? null;
    i._$litPart$ = o = new se(e.insertBefore(X(), r), r, void 0, s ?? {});
  }
  return o._$AI(t), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const be = globalThis;
class m extends W {
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
    return q;
  }
}
m._$litElement$ = !0, m.finalized = !0, be.litElementHydrateSupport?.({ LitElement: m });
const pt = be.litElementPolyfillSupport;
pt?.({ LitElement: m });
(be.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const A = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ut = { attribute: !0, type: String, converter: ae, reflect: !1, hasChanged: fe }, gt = (t = ut, e, s) => {
  const { kind: i, metadata: o } = s;
  let r = globalThis.litPropertyMetadata.get(o);
  if (r === void 0 && globalThis.litPropertyMetadata.set(o, r = /* @__PURE__ */ new Map()), i === "setter" && ((t = Object.create(t)).wrapped = !0), r.set(s.name, t), i === "accessor") {
    const { name: n } = s;
    return { set(h) {
      const l = e.get.call(this);
      e.set.call(this, h), this.requestUpdate(n, l, t, !0, h);
    }, init(h) {
      return h !== void 0 && this.C(n, void 0, t, h), h;
    } };
  }
  if (i === "setter") {
    const { name: n } = s;
    return function(h) {
      const l = this[n];
      e.call(this, h), this.requestUpdate(n, l, t, !0, h);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function c(t) {
  return (e, s) => typeof s == "object" ? gt(t, e, s) : ((i, o, r) => {
    const n = o.hasOwnProperty(r);
    return o.constructor.createProperty(r, i), n ? Object.getOwnPropertyDescriptor(o, r) : void 0;
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
const ge = "homex-changed", N = (t) => t.dispatchEvent(new CustomEvent(ge, { bubbles: !0, composed: !0 })), _t = async (t) => (await t.callWS({ type: "homex/rooms" })).rooms || [], mt = (t, e) => t.callWS({ type: "homex/room/create", ...e }), ft = (t, e, s = !0) => t.callWS({ type: "homex/room/delete", entry_id: e, delete_scenes: s }), vt = async (t, e) => (await t.callWS({ type: "homex/device_actions", device_id: e })).actions || [], Be = (t, e) => t.callWS({ type: "homex/room/update", ...e }), xt = (t, e) => t.callWS({ type: "homex/group/add", ...e }), bt = (t, e) => t.callWS({ type: "homex/group/update", ...e }), $t = (t, e, s) => t.callWS({ type: "homex/group/delete", entry_id: e, group_id: s }), Me = (t, e, s, i) => t.callWS({
  type: "homex/scene/add",
  entry_id: e,
  name: s,
  ...i ? { attach: i } : {}
}), yt = (t, e, s) => t.callWS({ type: "homex/scene/delete", entry_id: e, key: s }), wt = (t, e, s) => t.callWS({ type: "homex/scene/reorder", entry_id: e, order: s }), At = (t, e) => t.callWS({ type: "homex/scene/next", entry_id: e }), Et = (t, e, s, i) => t.callWS({ type: "homex/scene/rename", entry_id: e, key: s, name: i }), S = (t) => t && (t.message || t.code) || String(t);
let re = null;
const ce = () => !!customElements.get("ha-entities-picker");
function St() {
  return ce() ? Promise.resolve(!0) : re || (re = (async () => {
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
    return ce();
  })(), re);
}
var kt = "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z", Ct = "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z", Ht = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z", Pt = "M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z", Ot = "M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z", Lt = "M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z", Dt = "M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z", Mt = "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z", zt = "M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z", Nt = "M7.5,2C5.71,3.15 4.5,5.18 4.5,7.5C4.5,9.82 5.71,11.85 7.53,13C4.46,13 2,10.54 2,7.5A5.5,5.5 0 0,1 7.5,2M19.07,3.5L20.5,4.93L4.93,20.5L3.5,19.07L19.07,3.5M12.89,5.93L11.41,5L9.97,6L10.39,4.3L9,3.24L10.75,3.12L11.33,1.47L12,3.1L13.73,3.13L12.38,4.26L12.89,5.93M9.59,9.54L8.43,8.81L7.31,9.59L7.65,8.27L6.56,7.44L7.92,7.35L8.37,6.06L8.88,7.33L10.24,7.36L9.19,8.23L9.59,9.54M19,13.5A5.5,5.5 0 0,1 13.5,19C12.28,19 11.15,18.6 10.24,17.93L17.93,10.24C18.6,11.15 19,12.28 19,13.5M14.6,20.08L17.37,18.93L17.13,22.28L14.6,20.08M18.93,17.38L20.08,14.61L22.28,17.15L18.93,17.38M20.08,12.42L18.94,9.64L22.28,9.88L20.08,12.42M9.63,18.93L12.4,20.08L9.87,22.27L9.63,18.93Z";
const I = w`
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
var Vt = Object.defineProperty, jt = Object.getOwnPropertyDescriptor, F = (t, e, s, i) => {
  for (var o = i > 1 ? void 0 : i ? jt(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (o = (i ? n(e, s, o) : n(o)) || o);
  return i && o && Vt(e, s, o), o;
};
let V = class extends m {
  _isOn(t) {
    return this.hass.states[t]?.state === "on";
  }
  _toggle(t) {
    t.stopPropagation(), this.hass.callService("switch", "toggle", { entity_id: this.unit.switch });
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
            <path d=${e ? Ot : Lt}></path>
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
V.styles = [
  I,
  w`
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
], V.prototype, "hass", 2);
F([
  c({ attribute: !1 })
], V.prototype, "unit", 2);
F([
  c({ attribute: !1 })
], V.prototype, "areaIcon", 2);
F([
  c({ attribute: !1 })
], V.prototype, "floorName", 2);
F([
  c({ attribute: !1 })
], V.prototype, "activeScene", 2);
V = F([
  A("homex-unit-controls")
], V);
const ee = (t, e, s, i = "") => customElements.get("ha-textfield") ? a`<ha-textfield
      outlined
      .label=${t}
      .value=${e ?? ""}
      .placeholder=${i}
      @input=${(o) => s(o.target.value)}
    ></ha-textfield>` : a`<div class="field">
    <span>${t}</span>
    <input
      .value=${e ?? ""}
      placeholder=${i}
      @input=${(o) => s(o.target.value)}
    />
  </div>`, Tt = /[̀-ͯ]/g, $e = (t) => (t || "").normalize("NFD").replace(Tt, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""), Ut = ["light", "switch", "input_boolean"], We = [
  "binary_sensor",
  "switch",
  "input_boolean",
  "person",
  "device_tracker"
];
var Rt = Object.defineProperty, It = Object.getOwnPropertyDescriptor, ye = (t, e, s, i) => {
  for (var o = i > 1 ? void 0 : i ? It(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (o = (i ? n(e, s, o) : n(o)) || o);
  return i && o && Rt(e, s, o), o;
};
let te = class extends m {
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
te.styles = w`
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
], te.prototype, "open", 2);
ye([
  c()
], te.prototype, "heading", 2);
te = ye([
  A("homex-dialog")
], te);
var Bt = Object.defineProperty, Wt = Object.getOwnPropertyDescriptor, B = (t, e, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Wt(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (o = (i ? n(e, s, o) : n(o)) || o);
  return i && o && Bt(e, s, o), o;
};
let H = class extends m {
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
    return ce() ? a`<ha-entities-picker
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
H.styles = w`
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
B([
  c({ attribute: !1 })
], H.prototype, "hass", 2);
B([
  c({ type: Array })
], H.prototype, "value", 2);
B([
  c({ attribute: !1 })
], H.prototype, "includeDomains", 2);
B([
  c({ attribute: !1 })
], H.prototype, "includeEntities", 2);
B([
  d()
], H.prototype, "_query", 2);
B([
  d()
], H.prototype, "_open", 2);
H = B([
  A("homex-entity-picker")
], H);
var qt = Object.defineProperty, Zt = Object.getOwnPropertyDescriptor, pe = (t, e, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Zt(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (o = (i ? n(e, s, o) : n(o)) || o);
  return i && o && qt(e, s, o), o;
};
let G = class extends m {
  constructor() {
    super(...arguments), this.value = [], this._actions = {};
  }
  willUpdate(t) {
    if (t.has("value"))
      for (const e of this.value) e.device_id && this._ensure(e.device_id);
  }
  async _ensure(t) {
    if (!(t in this._actions)) {
      this._actions = { ...this._actions, [t]: [] };
      try {
        const e = await vt(this.hass, t);
        this._actions = { ...this._actions, [t]: e };
      } catch {
      }
    }
  }
  _name(t) {
    const e = this.hass?.devices?.[t];
    return e?.name_by_user || e?.name || t;
  }
  _emit(t) {
    this.value = t, this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: t } }));
  }
  _setDevice(t, e) {
    if (t < 0) {
      e && (this._ensure(e), this._emit([...this.value, { device_id: e }]));
      return;
    }
    if (!e) {
      this._remove(t);
      return;
    }
    this._ensure(e), this._emit(this.value.map((s, i) => i === t ? { device_id: e } : s));
  }
  _setAction(t, e) {
    this._emit(
      this.value.map(
        (s, i) => i === t ? e ? { device_id: s.device_id, action: e } : { device_id: s.device_id } : s
      )
    );
  }
  _remove(t) {
    this._emit(this.value.filter((e, s) => s !== t));
  }
  _devicePicker(t, e) {
    if (ce())
      return a`<ha-device-picker
        class="dev"
        .hass=${this.hass}
        .value=${t}
        @value-changed=${(i) => e(i.detail.value || "")}
      ></ha-device-picker>`;
    const s = Object.keys(this.hass.devices || {}).sort(
      (i, o) => this._name(i).localeCompare(this._name(o))
    );
    return a`<select
      class="dev"
      @change=${(i) => e(i.target.value)}
    >
      <option value="">— Appareil —</option>
      ${s.map(
      (i) => a`<option value=${i} ?selected=${i === t}>
            ${this._name(i)}
          </option>`
    )}
    </select>`;
  }
  _row(t, e) {
    const s = t.device_id || "", i = s ? this._actions[s] || [] : [];
    return a`<div class="row">
      ${this._devicePicker(s, (o) => this._setDevice(e, o))}
      ${s ? a`<select
            @change=${(o) => this._setAction(e, o.target.value)}
          >
            <option value="" ?selected=${!t.action}>Toutes les actions</option>
            ${i.map(
      (o) => a`<option value=${o} ?selected=${t.action === o}>${o}</option>`
    )}
          </select>` : ""}
      ${e >= 0 ? a`<button class="x" title="Retirer" @click=${() => this._remove(e)}>
            ×
          </button>` : ""}
    </div>`;
  }
  render() {
    return a`
      ${this.value.map((t, e) => this._row(t, e))}
      ${this._row({ device_id: "" }, -1)}
    `;
  }
};
G.styles = w`
    :host {
      display: block;
      width: 100%;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .dev {
      flex: 1 1 auto;
      min-width: 0;
    }
    select {
      flex: 1 1 40%;
      box-sizing: border-box;
      padding: 12px 12px;
      font-size: 14px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
    }
    .x {
      flex: 0 0 auto;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      color: var(--secondary-text-color);
      border-radius: 50%;
      padding: 4px 8px;
    }
    .x:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }
  `;
pe([
  c({ attribute: !1 })
], G.prototype, "hass", 2);
pe([
  c({ attribute: !1 })
], G.prototype, "value", 2);
pe([
  d()
], G.prototype, "_actions", 2);
G = pe([
  A("homex-device-triggers")
], G);
var Gt = Object.defineProperty, Ft = Object.getOwnPropertyDescriptor, E = (t, e, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Ft(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (o = (i ? n(e, s, o) : n(o)) || o);
  return i && o && Gt(e, s, o), o;
};
let f = class extends m {
  constructor() {
    super(...arguments), this.open = !1, this.group = null, this._name = "", this._id = "", this._devices = [], this._trigEnt = [], this._trigDev = [], this._busy = !1, this._idEdited = !1;
  }
  willUpdate(t) {
    if (t.has("open") && this.open) {
      this._name = this.group?.name ?? "", this._id = this.group?.group_id ?? "", this._devices = this.group?.devices ?? [];
      const e = this.group?.triggers ?? [];
      this._trigEnt = e.map((s) => s.entity_id).filter((s) => !!s), this._trigDev = e.filter((s) => s.device_id).map(
        (s) => s.action ? { device_id: s.device_id, action: s.action } : { device_id: s.device_id }
      ), this._busy = !1, this._idEdited = !!this.group;
    }
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
    const s = [
      ...this._trigEnt.map((i) => ({ entity_id: i })),
      ...this._trigDev
    ];
    this._busy = !0;
    try {
      this.group ? await bt(this.hass, {
        entry_id: this.room.entry_id,
        group_id: this.group.group_id,
        name: t,
        devices: this._devices,
        triggers: s
      }) : await xt(this.hass, {
        entry_id: this.room.entry_id,
        group_id: e,
        name: t,
        devices: this._devices,
        triggers: s
      }), N(this), this._close();
    } catch (i) {
      this._busy = !1, alert("Erreur Homex : " + S(i));
    }
  }
  async _delete() {
    if (this.group && confirm(`Supprimer le groupe "${this.group.group_id}" ?`)) {
      this._busy = !0;
      try {
        await $t(this.hass, this.room.entry_id, this.group.group_id), N(this), this._close();
      } catch (t) {
        this._busy = !1, alert("Erreur Homex : " + S(t));
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
        ${ee("Nom", this._name, (e) => this._onName(e), "Table de chevet L")}
        ${t ? a`<div class="section">Id : ${this.group.group_id}</div>` : ee("Id", this._id, (e) => this._onId(e), "bedside_l")}
        <div class="section">Appareils (parmi la pièce)</div>
        <homex-entity-picker
          .hass=${this.hass}
          .includeEntities=${this.room.devices}
          .value=${this._devices}
          @value-changed=${(e) => this._devices = e.detail.value}
        ></homex-entity-picker>
        <div class="section">Déclencheurs — entités</div>
        <homex-entity-picker
          .hass=${this.hass}
          .includeDomains=${We}
          .value=${this._trigEnt}
          @value-changed=${(e) => this._trigEnt = e.detail.value}
        ></homex-entity-picker>
        <div class="section">Déclencheurs — appareils</div>
        <homex-device-triggers
          .hass=${this.hass}
          .value=${this._trigDev}
          @value-changed=${(e) => this._trigDev = e.detail.value}
        ></homex-device-triggers>

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
f.styles = I;
E([
  c({ attribute: !1 })
], f.prototype, "hass", 2);
E([
  c({ type: Boolean })
], f.prototype, "open", 2);
E([
  c({ attribute: !1 })
], f.prototype, "room", 2);
E([
  c({ attribute: !1 })
], f.prototype, "group", 2);
E([
  d()
], f.prototype, "_name", 2);
E([
  d()
], f.prototype, "_id", 2);
E([
  d()
], f.prototype, "_devices", 2);
E([
  d()
], f.prototype, "_trigEnt", 2);
E([
  d()
], f.prototype, "_trigDev", 2);
E([
  d()
], f.prototype, "_busy", 2);
f = E([
  A("homex-group-dialog")
], f);
var Jt = Object.defineProperty, Kt = Object.getOwnPropertyDescriptor, ie = (t, e, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Kt(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (o = (i ? n(e, s, o) : n(o)) || o);
  return i && o && Jt(e, s, o), o;
};
let R = class extends m {
  constructor() {
    super(...arguments), this._open = !1;
  }
  render() {
    return a`
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
R.styles = [
  I,
  w`
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
ie([
  c({ attribute: !1 })
], R.prototype, "hass", 2);
ie([
  c({ attribute: !1 })
], R.prototype, "room", 2);
ie([
  c({ attribute: !1 })
], R.prototype, "group", 2);
ie([
  d()
], R.prototype, "_open", 2);
R = ie([
  A("homex-group-row")
], R);
var Xt = Object.defineProperty, Qt = Object.getOwnPropertyDescriptor, k = (t, e, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Qt(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (o = (i ? n(e, s, o) : n(o)) || o);
  return i && o && Xt(e, s, o), o;
};
let v = class extends m {
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
      this.room ? await Be(this.hass, {
        entry_id: this.room.entry_id,
        name: t,
        room_id: e,
        area_id: s,
        devices: this._devices,
        scene_strategy: this._strategy
      }) : await mt(this.hass, {
        name: t,
        room_id: e,
        area_id: s,
        devices: this._devices,
        scene_strategy: this._strategy
      }), N(this), this._close();
    } catch (s) {
      this._busy = !1, alert("Erreur Homex : " + S(s));
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
        ${ee("Nom", this._name, (e) => this._onName(e), "Chambre")}
        ${ee("Id", this._id, (e) => this._onId(e), "bedroom")}
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
  I,
  w`
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
  d()
], v.prototype, "_name", 2);
k([
  d()
], v.prototype, "_id", 2);
k([
  d()
], v.prototype, "_areaId", 2);
k([
  d()
], v.prototype, "_devices", 2);
k([
  d()
], v.prototype, "_strategy", 2);
k([
  d()
], v.prototype, "_busy", 2);
v = k([
  A("homex-room-dialog")
], v);
var Yt = Object.defineProperty, es = Object.getOwnPropertyDescriptor, P = (t, e, s, i) => {
  for (var o = i > 1 ? void 0 : i ? es(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (o = (i ? n(e, s, o) : n(o)) || o);
  return i && o && Yt(e, s, o), o;
};
const ze = (t = []) => t.map((e) => e.entity_id).filter((e) => !!e), Ne = (t = []) => t.filter((e) => e.device_id).map((e) => e.action ? { device_id: e.device_id, action: e.action } : { device_id: e.device_id }), Ve = (t, e) => [
  ...t.map((s) => ({ entity_id: s })),
  ...e
];
let x = class extends m {
  constructor() {
    super(...arguments), this.open = !1, this._toggleEnt = [], this._toggleDev = [], this._sceneEnt = [], this._sceneDev = [], this._busy = !1;
  }
  willUpdate(t) {
    t.has("open") && this.open && (this._toggleEnt = ze(this.room?.triggers), this._toggleDev = Ne(this.room?.triggers), this._sceneEnt = ze(this.room?.scene_triggers), this._sceneDev = Ne(this.room?.scene_triggers), this._busy = !1);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }
  async _save() {
    this._busy = !0;
    try {
      await Be(this.hass, {
        entry_id: this.room.entry_id,
        triggers: Ve(this._toggleEnt, this._toggleDev),
        scene_triggers: Ve(this._sceneEnt, this._sceneDev)
      }), N(this), this._close();
    } catch (t) {
      this._busy = !1, alert("Erreur Homex : " + S(t));
    }
  }
  _pickers(t, e, s, i) {
    return a`
      <div class="label">Entités (changement d'état)</div>
      <homex-entity-picker
        .hass=${this.hass}
        .includeDomains=${We}
        .value=${t}
        @value-changed=${(o) => s(o.detail.value)}
      ></homex-entity-picker>
      <div class="label">Appareils (action — « toutes » ou une précise)</div>
      <homex-device-triggers
        .hass=${this.hass}
        .value=${e}
        @value-changed=${(o) => i(o.detail.value)}
      ></homex-device-triggers>
    `;
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
          ${this._pickers(
      this._toggleEnt,
      this._toggleDev,
      (t) => this._toggleEnt = t,
      (t) => this._toggleDev = t
    )}
        </div>

        <div class="group">
          <div class="section">Triggers scene switching</div>
          <p class="hint">Chaque déclenchement passe à la scène suivante (cycle).</p>
          ${this._pickers(
      this._sceneEnt,
      this._sceneDev,
      (t) => this._sceneEnt = t,
      (t) => this._sceneDev = t
    )}
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
x.styles = [
  I,
  w`
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
      .label {
        font-size: 13px;
        font-weight: 500;
        margin: 10px 0 4px;
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
  d()
], x.prototype, "_toggleEnt", 2);
P([
  d()
], x.prototype, "_toggleDev", 2);
P([
  d()
], x.prototype, "_sceneEnt", 2);
P([
  d()
], x.prototype, "_sceneDev", 2);
P([
  d()
], x.prototype, "_busy", 2);
x = P([
  A("homex-triggers-dialog")
], x);
var ts = Object.defineProperty, ss = Object.getOwnPropertyDescriptor, O = (t, e, s, i) => {
  for (var o = i > 1 ? void 0 : i ? ss(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (o = (i ? n(e, s, o) : n(o)) || o);
  return i && o && ts(e, s, o), o;
};
let b = class extends m {
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
        this.scene ? await Et(this.hass, this.room.entry_id, this.scene.key, t) : this._mode === "attach" ? await Me(this.hass, this.room.entry_id, t, this._attachId) : await Me(this.hass, this.room.entry_id, t), N(this), this._close();
      } catch (e) {
        this._busy = !1, alert("Erreur Homex : " + S(e));
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
        ${ee("Nom de la scène", this._name, (i) => this._name = i, "Nuit")}
        ${e ? a`<div class="err">Ce nom de scène existe déjà.</div>` : ""}
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
b.styles = [
  I,
  w`
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
], b.prototype, "hass", 2);
O([
  c({ type: Boolean })
], b.prototype, "open", 2);
O([
  c({ attribute: !1 })
], b.prototype, "room", 2);
O([
  c({ attribute: !1 })
], b.prototype, "scene", 2);
O([
  d()
], b.prototype, "_name", 2);
O([
  d()
], b.prototype, "_mode", 2);
O([
  d()
], b.prototype, "_attachId", 2);
O([
  d()
], b.prototype, "_busy", 2);
b = O([
  A("homex-scene-dialog")
], b);
var is = Object.defineProperty, os = Object.getOwnPropertyDescriptor, L = (t, e, s, i) => {
  for (var o = i > 1 ? void 0 : i ? os(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (o = (i ? n(e, s, o) : n(o)) || o);
  return i && o && is(e, s, o), o;
};
let $ = class extends m {
  constructor() {
    super(...arguments), this.expanded = !1, this._dialog = "", this._menuOpen = !1, this._renameScene = null, this._deleteScenes = !0, this._deleting = !1, this._close = () => this._dialog = "", this._delete = () => {
      this._menuOpen = !1, this._deleteScenes = !0, this._dialog = "delete";
    }, this._confirmDelete = async () => {
      this._deleting = !0;
      try {
        await ft(this.hass, this.room.entry_id, this._deleteScenes), this._dialog = "", N(this);
      } catch (t) {
        alert("Erreur Homex : " + S(t));
      } finally {
        this._deleting = !1;
      }
    }, this._sceneNext = async (t) => {
      t?.stopPropagation();
      try {
        await At(this.hass, this.room.entry_id);
      } catch (e) {
        alert("Erreur Homex : " + S(e));
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
        await yt(this.hass, this.room.entry_id, t.key), N(this);
      } catch (e) {
        alert("Erreur Homex : " + S(e));
      }
  }
  async _sceneMoved(t) {
    const { oldIndex: e, newIndex: s } = t.detail, i = this.room.scenes.filter((r) => r.orderable).map((r) => r.key), [o] = i.splice(e, 1);
    i.splice(s, 0, o);
    try {
      await wt(this.hass, this.room.entry_id, i), N(this);
    } catch (r) {
      alert("Erreur Homex : " + S(r));
    }
  }
  _iconBtn(t, e, s, i = !1) {
    return a`<button
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
    return a`
      <div class="scene-row">
        ${t.orderable ? a`<span class="handle" title="Glisser pour réordonner">
              <svg viewBox="0 0 24 24"><path d=${Pt}></path></svg>
            </span>` : a`<span class="pin" title="Toujours en dernier">
              <svg viewBox="0 0 24 24"><path d=${zt}></path></svg>
            </span>`}
        <span class="scene-name">${t.name}</span>
        ${t.key === e ? a`<span class="active-tag">active</span>` : ""}
        <span class="btn-group">
          ${this._iconBtn(
      Dt,
      "Voir dans Home Assistant",
      () => this._openHa(t)
    )}
          ${this._iconBtn(Mt, "Renommer", () => this._renameScene = t)}
          ${this._iconBtn(
      Ht,
      t.removable ? "Supprimer" : "Scène par défaut",
      () => this._deleteScene(t),
      !t.removable
    )}
        </span>
      </div>
    `;
  }
  render() {
    const t = this.room, s = this._isOn() ? this.hass.states[t.switch]?.attributes?.active_scene ?? null : null, i = s ? t.scenes.find((p) => p.key === s)?.name : void 0, o = t.area_id ? this.hass.areas?.[t.area_id] : null, r = o?.icon || void 0, h = (o?.floor_id ? this.hass.floors?.[o.floor_id] : null)?.name || void 0, l = t.scenes.filter((p) => p.orderable), g = t.scenes.filter((p) => !p.orderable);
    return a`
      <ha-card>
        <div class="head" @click=${this._toggleExpand} title="Plier / déplier">
          <svg class="chevron" viewBox="0 0 24 24">
            <path d=${this.expanded ? Ct : kt}></path>
          </svg>
          <homex-unit-controls
            .hass=${this.hass}
            .unit=${t}
            .areaIcon=${r}
            .floorName=${h}
            .activeScene=${i}
          ></homex-unit-controls>
          <div class="head-actions">
            <button
              class="round"
              title="Changer de scène"
              @click=${(p) => this._sceneNext(p)}
            >
              <svg viewBox="0 0 24 24"><path d=${Nt}></path></svg>
            </button>
            <button
              class="kebab"
              title="Actions"
              @click=${(p) => {
      p.stopPropagation(), this._menuOpen = !0;
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
        ${this.expanded ? this._renderBody(t, s, l, g) : ""}
      </ha-card>

      ${this._renderDialogs(t)}
    `;
  }
  _renderBody(t, e, s, i) {
    return a`
        <div class="section-row">
          <span class="section">Scènes</span>
          <button @click=${() => this._pick("addscene")}>＋ Scène</button>
        </div>
        <ha-sortable handle-selector=".handle" @item-moved=${this._sceneMoved}>
          <div>${s.map((o) => this._sceneRow(o, e))}</div>
        </ha-sortable>
        ${i.map((o) => this._sceneRow(o, e))}

        ${t.groups.length ? a`
              <div class="section-row">
                <span class="section">Groupes</span>
                <button @click=${() => this._pick("addgroup")}>＋ Groupe</button>
              </div>
              <div class="groups">
                ${t.groups.map(
      (o) => a`<homex-group-row
                    .hass=${this.hass}
                    .room=${t}
                    .group=${o}
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
$.styles = [
  I,
  w`
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
L([
  c({ attribute: !1 })
], $.prototype, "hass", 2);
L([
  c({ attribute: !1 })
], $.prototype, "room", 2);
L([
  c({ type: Boolean })
], $.prototype, "expanded", 2);
L([
  d()
], $.prototype, "_dialog", 2);
L([
  d()
], $.prototype, "_menuOpen", 2);
L([
  d()
], $.prototype, "_renameScene", 2);
L([
  d()
], $.prototype, "_deleteScenes", 2);
L([
  d()
], $.prototype, "_deleting", 2);
$ = L([
  A("homex-room-card")
], $);
var rs = Object.defineProperty, ns = Object.getOwnPropertyDescriptor, D = (t, e, s, i) => {
  for (var o = i > 1 ? void 0 : i ? ns(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (o = (i ? n(e, s, o) : n(o)) || o);
  return i && o && rs(e, s, o), o;
};
const as = "35";
let y = class extends m {
  constructor() {
    super(...arguments), this.narrow = !1, this._rooms = null, this._error = null, this._createOpen = !1, this._expanded = localStorage.getItem("homex_expanded") || null, this._loaded = !1, this._onToggleExpand = (t) => {
      const e = t.detail.entry_id;
      this._expanded = this._expanded === e ? null : e, this._expanded ? localStorage.setItem("homex_expanded", this._expanded) : localStorage.removeItem("homex_expanded");
    }, this._reload = async () => {
      try {
        this._rooms = await _t(this.hass), this._error = null;
      } catch (t) {
        this._error = S(t);
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
    t.has("hass") && this.hass && !this._loaded && (this._loaded = !0, St().then(() => this.requestUpdate()), this._reload());
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
    for (const i of this._rooms || []) {
      const r = (i.area_id ? this.hass.areas?.[i.area_id] : null)?.floor_id;
      r && this.hass.floors?.[r] ? (e.get(r) ?? e.set(r, []).get(r)).push(i) : t.push(i);
    }
    const s = [...e.keys()].map((i) => this.hass.floors[i]).sort(
      (i, o) => (i.level ?? 0) - (o.level ?? 0) || i.name.localeCompare(o.name)
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
      const { ungrouped: e, floors: s, byFloor: i } = this._grouped();
      t = a`
        ${e.map((o) => this._roomCard(o))}
        ${s.map(
        (o) => a`
            <div class="floor-header">
              ${o.icon ? a`<ha-icon .icon=${o.icon}></ha-icon>` : ""}
              <span>${o.name}</span>
            </div>
            ${(i.get(o.floor_id) || []).map(
          (r) => this._roomCard(r)
        )}
          `
      )}
      `;
    }
    return a`
      <div class="wrap">
        <header>
          <h1>Homex <span class="ver">v${as}</span></h1>
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
y.styles = w`
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
D([
  c({ attribute: !1 })
], y.prototype, "hass", 2);
D([
  c({ attribute: !1 })
], y.prototype, "narrow", 2);
D([
  c({ attribute: !1 })
], y.prototype, "route", 2);
D([
  c({ attribute: !1 })
], y.prototype, "panel", 2);
D([
  d()
], y.prototype, "_rooms", 2);
D([
  d()
], y.prototype, "_error", 2);
D([
  d()
], y.prototype, "_createOpen", 2);
D([
  d()
], y.prototype, "_expanded", 2);
y = D([
  A("homex-panel")
], y);
export {
  y as HomexPanel
};
