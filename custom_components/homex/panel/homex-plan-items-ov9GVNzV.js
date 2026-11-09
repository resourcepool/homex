// node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, h = globalThis, ee = h.trustedTypes, te = ee ? ee.emptyScript : "", ne = h.reactiveElementPolyfillSupport, g = (e, t) => e, _ = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? te : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, v = (e, t) => !l(e, t), re = {
	attribute: !0,
	type: String,
	converter: _,
	reflect: !1,
	useDefault: !1,
	hasChanged: v
};
Symbol.metadata ??= Symbol("metadata"), h.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = re) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? re;
	}
	static _$Ei() {
		if (this.hasOwnProperty(g("elementProperties"))) return;
		let e = m(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(g("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(g("properties"))) {
			let e = this.properties, t = [...f(e), ...p(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
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
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? _ : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? _ : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? v)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[g("elementProperties")] = /* @__PURE__ */ new Map(), y[g("finalized")] = /* @__PURE__ */ new Map(), ne?.({ ReactiveElement: y }), (h.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var b = globalThis, ie = (e) => e, x = b.trustedTypes, ae = x ? x.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, S = "$lit$", C = `lit$${Math.random().toFixed(9).slice(2)}$`, w = "?" + C, oe = `<${w}>`, T = document, E = () => T.createComment(""), D = (e) => e === null || typeof e != "object" && typeof e != "function", O = Array.isArray, se = (e) => O(e) || typeof e?.[Symbol.iterator] == "function", k = "[ 	\n\f\r]", A = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ce = /-->/g, le = />/g, j = RegExp(`>|${k}(?:([^\\s"'>=/]+)(${k}*=${k}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), ue = /'/g, de = /"/g, fe = /^(?:script|style|textarea|title)$/i, pe = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), me = pe(1), he = pe(2), M = Symbol.for("lit-noChange"), N = Symbol.for("lit-nothing"), ge = /* @__PURE__ */ new WeakMap(), P = T.createTreeWalker(T, 129);
function _e(e, t) {
	if (!O(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ae === void 0 ? t : ae.createHTML(t);
}
var ve = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = A;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === A ? c[1] === "!--" ? o = ce : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = j) : (fe.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = j) : o = le : o === j ? c[0] === ">" ? (o = i ?? A, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? j : c[3] === "\"" ? de : ue) : o === de || o === ue ? o = j : o === ce || o === le ? o = A : (o = j, i = void 0);
		let d = o === j && e[t + 1].startsWith("/>") ? " " : "";
		a += o === A ? n + oe : l >= 0 ? (r.push(s), n.slice(0, l) + S + n.slice(l) + C + d) : n + C + (l === -2 ? t : d);
	}
	return [_e(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, F = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = ve(t, n);
		if (this.el = e.createElement(l, r), P.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = P.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(S)) {
					let t = u[o++], n = i.getAttribute(e).split(C), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? be : r[1] === "?" ? xe : r[1] === "@" ? Se : R
					}), i.removeAttribute(e);
				} else e.startsWith(C) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (fe.test(i.tagName)) {
					let e = i.textContent.split(C), t = e.length - 1;
					if (t > 0) {
						i.textContent = x ? x.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], E()), P.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], E());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === w) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(C, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += C.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = T.createElement("template");
		return n.innerHTML = e, n;
	}
};
function I(e, t, n = e, r) {
	if (t === M) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = D(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = I(e, i._$AS(e, t.values), i, r)), t;
}
var ye = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? T).importNode(t, !0);
		P.currentNode = r;
		let i = P.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new L(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Ce(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = P.nextNode(), a++);
		}
		return P.currentNode = T, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, L = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = N, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = I(this, e, t), D(e) ? e === N || e == null || e === "" ? (this._$AH !== N && this._$AR(), this._$AH = N) : e !== this._$AH && e !== M && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? se(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== N && D(this._$AH) ? this._$AA.nextSibling.data = e : this.T(T.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = F.createElement(_e(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new ye(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = ge.get(e.strings);
		return t === void 0 && ge.set(e.strings, t = new F(e)), t;
	}
	k(t) {
		O(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(E()), this.O(E()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = ie(e).nextSibling;
			ie(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, R = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = N, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = N;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = I(this, e, t, 0), a = !D(e) || e !== this._$AH && e !== M, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = I(this, r[n + o], t, o), s === M && (s = this._$AH[o]), a ||= !D(s) || s !== this._$AH[o], s === N ? e = N : e !== N && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === N ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, be = class extends R {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === N ? void 0 : e;
	}
}, xe = class extends R {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== N);
	}
}, Se = class extends R {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = I(this, e, t, 0) ?? N) === M) return;
		let n = this._$AH, r = e === N && n !== N || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== N && (n === N || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Ce = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		I(this, e);
	}
}, we = {
	M: S,
	P: C,
	A: w,
	C: 1,
	L: ve,
	R: ye,
	D: se,
	V: I,
	I: L,
	H: R,
	N: xe,
	U: Se,
	B: be,
	F: Ce
}, Te = b.litHtmlPolyfillSupport;
Te?.(F, L), (b.litHtmlVersions ??= []).push("3.3.3");
var Ee = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new L(t.insertBefore(E(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, z = globalThis, B = class extends y {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ee(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return M;
	}
};
B._$litElement$ = !0, B.finalized = !0, z.litElementHydrateSupport?.({ LitElement: B });
var De = z.litElementPolyfillSupport;
De?.({ LitElement: B }), (z.litElementVersions ??= []).push("4.2.2");
// node_modules/@lit/reactive-element/decorators/property.js
var Oe = {
	attribute: !0,
	type: String,
	converter: _,
	reflect: !1,
	hasChanged: v
}, ke = (e = Oe, t, n) => {
	let { kind: r, metadata: i } = n, a = globalThis.litPropertyMetadata.get(i);
	if (a === void 0 && globalThis.litPropertyMetadata.set(i, a = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), a.set(n.name, e), r === "accessor") {
		let { name: r } = n;
		return {
			set(n) {
				let i = t.get.call(this);
				t.set.call(this, n), this.requestUpdate(r, i, e, !0, n);
			},
			init(t) {
				return t !== void 0 && this.C(r, void 0, e, t), t;
			}
		};
	}
	if (r === "setter") {
		let { name: r } = n;
		return function(n) {
			let i = this[r];
			t.call(this, n), this.requestUpdate(r, i, e, !0, n);
		};
	}
	throw Error("Unsupported decorator location: " + r);
};
function Ae(e) {
	return (t, n) => typeof n == "object" ? ke(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function je(e) {
	return Ae({
		...e,
		state: !0,
		attribute: !1
	});
}
// src/i18n/index.ts
var Me = {
	common: {
		en: {
			save: "Save",
			cancel: "Cancel",
			close: "Close",
			delete: "Delete",
			edit: "Edit",
			add: "Add",
			rename: "Rename",
			create: "Create",
			confirm: "Confirm",
			loading: "Loading…",
			none: "None",
			error: "Homex error: {message}",
			language: "Language",
			language_auto: "Automatic (Home Assistant language)",
			language_en: "English",
			language_fr: "Français"
		},
		fr: {
			save: "Enregistrer",
			cancel: "Annuler",
			close: "Fermer",
			delete: "Supprimer",
			edit: "Modifier",
			add: "Ajouter",
			rename: "Renommer",
			create: "Créer",
			confirm: "Confirmer",
			loading: "Chargement…",
			none: "Aucun",
			error: "Erreur Homex : {message}",
			language: "Langue",
			language_auto: "Automatique (langue de Home Assistant)",
			language_en: "English",
			language_fr: "Français"
		}
	},
	backup: {
		en: {
			backup: "Back up",
			restore_menu: "Restore…",
			backup_failed: "Backup failed: {message}",
			restore_title: "Restore a Homex backup",
			restore_intro: "Pick a backup file made with “Back up”. You will see what it holds before restoring it.",
			choose_file: "Choose a file",
			no_file: "No file chosen",
			not_json: "This file is not valid JSON.",
			from: "Backup of {date} (Homex {version}):",
			count_rooms: "room(s)",
			count_switches: "switch(es)",
			count_switch_presets: "switch preset(s)",
			count_layouts: "switch layout(s)",
			count_shutter_presets: "shutter preset(s)",
			count_zones: "heating zone(s)",
			count_heating_systems: "heating system(s)",
			count_scenes: "scene(s)",
			count_plan_levels: "3D Builder level(s)",
			warning: "Restoring replaces Homex's whole configuration (rooms, presets, switches, heating, Homex scenes). A safety backup of the current state is saved first.",
			restore: "Restore",
			restoring: "Restoring…",
			restored: "Backup restored.",
			safety: "The previous configuration was saved to {path} in your Home Assistant config folder."
		},
		fr: {
			backup: "Sauvegarder",
			restore_menu: "Restaurer…",
			backup_failed: "Échec de la sauvegarde : {message}",
			restore_title: "Restaurer une sauvegarde Homex",
			restore_intro: "Choisis un fichier de sauvegarde créé avec « Sauvegarder ». Tu verras son contenu avant de le restaurer.",
			choose_file: "Choisir un fichier",
			no_file: "Aucun fichier choisi",
			not_json: "Ce fichier n'est pas un JSON valide.",
			from: "Sauvegarde du {date} (Homex {version}) :",
			count_rooms: "pièce(s)",
			count_switches: "interrupteur(s)",
			count_switch_presets: "preset(s) d'interrupteur",
			count_layouts: "layout(s) d'interrupteur",
			count_shutter_presets: "preset(s) de volet",
			count_zones: "zone(s) de chauffage",
			count_heating_systems: "système(s) de chauffage",
			count_scenes: "scène(s)",
			count_plan_levels: "étage(s) du 3D Builder",
			warning: "La restauration remplace toute la configuration de Homex (pièces, presets, interrupteurs, chauffage, scènes Homex). Une copie de sécurité de l'état actuel est enregistrée avant.",
			restore: "Restaurer",
			restoring: "Restauration…",
			restored: "Sauvegarde restaurée.",
			safety: "La configuration précédente a été enregistrée dans {path}, dans le dossier de configuration de Home Assistant."
		}
	},
	builder: {
		en: {
			fx_lights: "Lights",
			fx_lights_hint: "Drag a light onto the plan, or click it, then click to place its spots or strips.",
			fx_no_lights: "Every light of this floor's rooms is placed (or none is in their Lights module).",
			fx_on: "On",
			fx_off: "Off",
			light_kind: "Type",
			light_kind_point: "Point",
			light_kind_linear: "Linear",
			light_mount: "Mounted on",
			light_mount_ceiling: "Ceiling",
			light_mount_floor: "Floor",
			light_type: "Fixture",
			light_type_ceiling_light: "Ceiling light",
			light_type_pendant: "Pendant",
			light_type_spot: "Spot",
			light_type_projector: "Spot projector",
			light_type_sconce: "Wall sconce",
			light_type_floor_lamp: "Floor lamp",
			light_type_table_lamp: "Desk / table lamp",
			light_type_led_strip: "LED strip",
			light_shape: "Shape",
			light_shape_round: "Round",
			light_shape_square: "Square",
			light_shade: "Lampshade",
			light_shade_no: "Without",
			light_shade_yes: "With",
			light_color: "Fixture colour",
			style: "Style",
			style_color: "Colour",
			style_color_default: "Default",
			style_color_custom: "Custom colour",
			style_door_plain: "Plain",
			style_door_panel: "Panelled",
			style_door_glazed: "Glazed",
			style_sliding_door_plain: "Plain",
			style_sliding_door_glazed: "Glazed",
			style_sliding_door_pocket: "Pocket",
			style_window_casement: "Casement",
			style_window_tilt: "Tilt & turn",
			style_window_fixed: "Fixed",
			style_window_sliding: "Sliding",
			style_glass_door_casement: "Casement",
			style_glass_door_sliding: "Sliding",
			style_glass_door_fixed: "Fixed",
			style_opening_full: "Full height",
			style_opening_doorway: "Doorway",
			style_opening_low_wall: "Low wall",
			stairs_shape: "Shape",
			stairs_shape_straight: "Straight",
			stairs_shape_l: "Quarter turn",
			stairs_shape_u: "Half turn",
			stairs_shape_spiral: "Spiral",
			stairs_side: "Turns",
			stairs_side_left: "Left",
			stairs_side_right: "Right",
			shutter_type: "Shutter type",
			shutter_type_roller: "Roller",
			shutter_type_hinged: "Hinged",
			light_mount_wall: "Wall",
			light_points: "{count} spot(s)",
			light_lines: "{count} strip(s)",
			light_hint_point: "Click to place each spot.",
			light_hint_line_start: "Click the start of a strip.",
			light_hint_line_end: "Click the end of the strip.",
			light_hint_wall: "Wall lights go on the walls.",
			light_done: "Done",
			light_add_points: "Add spots",
			light_add_lines: "Add strips",
			keys_light_placing: "Keys: Enter / Esc done · Backspace removes the last one · Alt: no snap",
			keys_light: "Drag a spot or strip to move it, its ends to stretch it; double-click removes it.",
			hint_fx_light_placing: "Drawing the light: spots and strips snap to a 10 cm grid and line up with the other lights (wall lights onto the walls).",
			hint_fx_light: "Drag its spots / strips (they snap), double-click one to remove it, Delete removes the light from the plan.",
			mode_structure: "Structure",
			mode_fixtures: "Fixtures",
			mode_render: "Rendering",
			render_pane: "Commands",
			render_house: "House",
			render_expand: "Show the panel",
			render_collapse: "Hide the panel",
			render_view: "View",
			render_floors: "Floors",
			render_pick_room: "Click a room in the 3D view to see its lights, shutters and climate here.",
			render_all: "All floors",
			render_reset: "Reset view",
			render_room: "Room",
			render_lights: "Lights",
			render_shutters: "Shutters",
			render_climate: "Climate",
			render_heating: "Heating",
			pub_done: "Published",
			pub_tab: "The house shows in the 3D tab of the Homex dashboard.",
			pub_dashboard: "Home Assistant dashboard",
			pub_dashboard_hint: "A dashboard of its own shows the house full size (in the sidebar, for wall tablets too).",
			pub_dashboard_name: "Dashboard name",
			pub_dashboard_create: "Create the dashboard",
			pub_dashboard_update: "Update the dashboard",
			pub_dashboard_open: "Open",
			pub_dashboard_done: "Dashboard ready, in the sidebar.",
			pub_withdraw: "Withdraw the publication",
			house_dashboard_title: "3D House",
			house_card_name: "Homex 3D house",
			house_card_description: "The house published from the Homex 3D Builder, full size: floors, rooms, lights, shutters and heating, live.",
			house_card_unpublished: "No 3D house published yet: publish it from the Homex 3D Builder (3D view).",
			publish: "Publish",
			published: "Published",
			publish_hint: "Show this 3D house in a new tab of the Homex dashboard",
			unpublish_hint: "Published: the Homex dashboard's 3D tab and its own Home Assistant dashboard",
			radiator_type: "Type",
			radiator_panel: "Normal",
			radiator_tall: "Full height",
			render_target: "Target",
			render_current: "now",
			render_scenes: "Scenes",
			render_heating_off: "Not heated",
			render_heating_active: "Heating up",
			render_m_temperature: "Temperature",
			render_m_humidity: "Humidity",
			render_m_co2: "CO₂",
			render_m_pm25: "PM2.5",
			render_m_pm10: "PM10",
			render_on: "On",
			render_off: "Off",
			render_none: "None",
			render_room_lights: "Room lights",
			render_all_shutters: "All shutters",
			render_open: "Open",
			render_stop: "Stop",
			render_close: "Close",
			render_nothing: "Nothing to control in this room yet.",
			render_hint: "Drag to turn · right-drag or Shift to move · wheel to zoom",
			fx_shutters: "Shutters",
			fx_shutters_hint: "Click a shutter then a window, or drag it onto a window, glass door or sliding door (dashed orange: none yet).",
			fx_shutters_hint_selected: "Click a shutter to fit it on the selected opening, or drag it onto another one.",
			fx_no_shutters: "Every shutter of this floor's rooms is placed (or none is configured in their Shutters module).",
			fx_radiators: "Radiators",
			fx_radiators_hint: "Click a radiator then the plan (or drag it there): it lines up along the nearest wall.",
			fx_no_radiators: "Every radiator of this floor's rooms is placed (or none is configured in their Climate module).",
			fx_shutter: "Shutter",
			fx_no_shutter: "No shutter",
			fx_state: "Now:",
			fx_heating: "Heating",
			fx_idle: "Idle",
			fx_remove: "Remove from the plan",
			keys_radiator: "Keys: ← → turn 90° · ↑ ↓ flip · + − length · Alt: no wall snap",
			hint_fx_place_radiator: "Click the plan to place the radiator: it lines up along the nearest wall. Esc cancels.",
			hint_fx_place_shutter: "Click a window, glass door or sliding door to fit the shutter on it. Esc cancels.",
			hint_fixtures: "Fixtures: the structure is locked. Fit the shutters on the windows and place the radiators.",
			hint_fx_opening: "Pick its shutter in the panel or click one in the list. Delete removes the shutter.",
			hint_fx_radiator: "Drag it along the walls (it snaps to them), turn it with the arrows. Delete removes it from the plan.",
			stairs_go_up: "Goes up",
			stairs_go_down: "Goes down",
			stairs_to_down: "Leads down to: {name}",
			stairs_no_below: "No floor below yet.",
			stairs_tag_up: "UP",
			stairs_tag_down: "DOWN",
			stairs_arrival_up: "↑ from {name}",
			stairs_arrival_down: "↓ from {name}",
			rotate: "Rotate",
			mirror: "Mirror",
			stairs_climb: "Direction",
			keys_door: "Keys: ← → rotate · ↑ ↓ mirror · + − width",
			keys_width: "Keys: + − width",
			keys_stairs: "Keys: arrows set the direction · PgUp / PgDn up / down",
			tool_door: "Door",
			tool_sliding_door: "Sliding door",
			tool_window: "Window",
			tool_glass_door: "Glass door",
			tool_opening: "Opening",
			opening_whole_wall: "Whole wall",
			tool_stairs: "Stairs",
			opening_type: "Type",
			width_cm: "Width (cm)",
			length_cm: "Length (cm)",
			door_flip: "Hinge side",
			door_side: "Opening side",
			stairs_turn: "Turn the climb",
			stairs_to: "Leads up to: {name}",
			stairs_no_above: "No floor above yet.",
			item_delete: "Delete",
			hint_opening: "Hover a wall and click to place it (centred on a 10 cm step). Set width, rotation and mirror beforehand in the panel or with the keys.",
			hint_opening_no_wall: "Draw rooms first: doors and windows go in their walls.",
			hint_opening_selected: "Drag it along the walls, set its width and side in the panel. Delete removes it.",
			hint_stairs: "Drag to draw the stairs (snapped). The arrow shows the way up; turn it in the panel.",
			hint_stair_selected: "Drag the stairs to move them, set size and climb direction in the panel. They show through on the next floors.",
			level_new: "New floor",
			level_edit: "Edit floor",
			level_dialog_intro: "Pick the Home Assistant floor this level draws, and its level number.",
			level_number: "Level",
			level_number_hint: "0 = ground floor, 1 = first floor, -1 = basement…",
			level_taken: "Level {level} is already used by another floor.",
			no_floor_left: "Every Home Assistant floor already has its level. Create floors in Home Assistant (Settings → Areas, labels & zones) to add more.",
			level_create: "Create",
			create_first: "Create the first floor",
			level_label: "level {level}",
			rooms_hint_selected: "Click a room to assign it to the selected outline, or drag it onto the plan.",
			no_floor: "no floor",
			all_placed: "Every room of this floor is placed.",
			back: "Back",
			saving: "Saving…",
			saved: "Saved",
			save_error: "Not saved",
			empty_title: "Draw your home, level by level",
			empty_text: "Create a floor from a Home Assistant floor, then draw each room's outline on a 50 cm grid (lines snap to the grid and to other walls) and drag your Homex rooms onto them. Add the other floors from the switcher at the bottom right: the floor below shows through to trace over.",
			create_base: "Create the base level",
			level_base: "Ground floor",
			level_n: "Level {n}",
			level_unnamed: "Unnamed level",
			levels: "Levels",
			add_above: "Level above",
			add_below: "Level below",
			level_name: "Name",
			level_floor: "Home Assistant floor",
			level_floor_none: "None",
			level_delete: "Delete this level",
			level_delete_confirm: "Delete the level \"{name}\" and its rooms?",
			next_level: "Next level",
			next_level_new: "Next level (new)",
			rooms: "Homex rooms",
			objects: "Objects",
			objects_hint: "Pick an object, then click a wall (stairs: drag a rectangle).",
			rooms_hint: "Drag a room onto an outline to assign it, or onto an empty spot to create a 4 × 3 m room.",
			room_on: "Placed on: {levels}",
			no_rooms: "No Homex room yet.",
			room_n: "Room {n}",
			selection: "Selected room",
			mapped_room: "Homex room",
			unmapped: "Not mapped",
			shape_name: "Name",
			area: "Area",
			perimeter: "perimeter",
			shape_delete: "Delete this outline",
			tool_select: "Select",
			tool_draw: "Draw",
			tool_rect: "Rectangle",
			undo: "Undo (Ctrl+Z)",
			redo: "Redo (Ctrl+Shift+Z)",
			zoom_in: "Zoom in",
			zoom_out: "Zoom out",
			fit: "Fit to view",
			grid: "Grid {size}",
			hint_empty: "No room on this level yet: pick Draw (D) or Rectangle (R), or drag a Homex room onto the plan.",
			hint_select: "Click a room to select it, drag it to move it. Drag the background to pan, scroll to zoom.",
			hint_selected: "Drag the corners to reshape (they snap), the small squares to add a corner, double-click a corner to remove it. Delete removes the room.",
			hint_draw: "Click to place each corner: it snaps to the grid, corners and walls (hold Alt for free placement). Esc cancels.",
			hint_draw_close: "Click the first corner, double-click or press Enter to close the room. Backspace removes the last corner.",
			hint_rect: "Drag to draw a rectangular room (snapped to the grid and walls)."
		},
		fr: {
			fx_lights: "Lumières",
			fx_lights_hint: "Glissez une lumière sur le plan, ou cliquez-la, puis cliquez pour placer ses points ou ses lignes.",
			fx_no_lights: "Toutes les lumières des pièces de cet étage sont placées (ou aucune n'est dans leur module Lumières).",
			fx_on: "Allumée",
			fx_off: "Éteinte",
			light_kind: "Type",
			light_kind_point: "Ponctuelle",
			light_kind_linear: "Linéaire",
			light_mount: "Fixation",
			light_mount_ceiling: "Plafond",
			light_mount_floor: "Sol",
			light_type: "Luminaire",
			light_type_ceiling_light: "Plafonnier",
			light_type_pendant: "Suspension",
			light_type_spot: "Spot",
			light_type_projector: "Spot projecteur",
			light_type_sconce: "Applique murale",
			light_type_floor_lamp: "Lampe sur pied",
			light_type_table_lamp: "Lampe de bureau / d'appoint",
			light_type_led_strip: "Ruban LED",
			light_shape: "Forme",
			light_shape_round: "Ronde",
			light_shape_square: "Carrée",
			light_shade: "Abat-jour",
			light_shade_no: "Sans",
			light_shade_yes: "Avec",
			light_color: "Couleur du luminaire",
			style: "Style",
			style_color: "Couleur",
			style_color_default: "Par défaut",
			style_color_custom: "Couleur personnalisée",
			style_door_plain: "Pleine",
			style_door_panel: "Moulurée",
			style_door_glazed: "Vitrée",
			style_sliding_door_plain: "Pleine",
			style_sliding_door_glazed: "Vitrée",
			style_sliding_door_pocket: "À galandage",
			style_window_casement: "Battante",
			style_window_tilt: "Oscillo-battante",
			style_window_fixed: "Fixe",
			style_window_sliding: "Coulissante",
			style_glass_door_casement: "Battante",
			style_glass_door_sliding: "Coulissante",
			style_glass_door_fixed: "Fixe",
			style_opening_full: "Toute hauteur",
			style_opening_doorway: "Baie (linteau)",
			style_opening_low_wall: "Muret",
			stairs_shape: "Forme",
			stairs_shape_straight: "Droit",
			stairs_shape_l: "Quart tournant (90°)",
			stairs_shape_u: "Demi-tournant (180°)",
			stairs_shape_spiral: "Colimaçon",
			stairs_side: "Tourne vers la",
			stairs_side_left: "Gauche",
			stairs_side_right: "Droite",
			shutter_type: "Type de volet",
			shutter_type_roller: "Roulant",
			shutter_type_hinged: "Battant",
			light_mount_wall: "Murale",
			light_points: "{count} point(s)",
			light_lines: "{count} ligne(s)",
			light_hint_point: "Cliquez pour placer chaque point.",
			light_hint_line_start: "Cliquez le début d'une ligne.",
			light_hint_line_end: "Cliquez la fin de la ligne.",
			light_hint_wall: "Une lumière murale se place sur les murs.",
			light_done: "Terminer",
			light_add_points: "Ajouter des points",
			light_add_lines: "Ajouter des lignes",
			keys_light_placing: "Clavier : Entrée / Échap pour terminer · Retour arrière retire le dernier · Alt : sans aimantage",
			keys_light: "Glissez un point ou une ligne pour le déplacer, ses extrémités pour l'étirer ; double-clic pour le retirer.",
			hint_fx_light_placing: "Tracé de la lumière : points et lignes s'aimantent à une grille de 10 cm et s'alignent sur les autres lumières (sur les murs pour une murale).",
			hint_fx_light: "Glissez ses points / lignes (ils s'aimantent), double-cliquez-en un pour le retirer, Suppr retire la lumière du plan.",
			mode_structure: "Bâti",
			mode_fixtures: "Équipements",
			mode_render: "Rendu",
			render_pane: "Commandes",
			render_house: "Maison",
			render_expand: "Afficher le volet",
			render_collapse: "Masquer le volet",
			render_view: "Vue",
			render_floors: "Étages",
			render_pick_room: "Cliquez sur une pièce dans la vue 3D pour voir ici ses lumières, volets et son climat.",
			render_all: "Tous les étages",
			render_reset: "Recentrer",
			render_room: "Pièce",
			render_lights: "Lumières",
			render_shutters: "Volets",
			render_climate: "Climat",
			render_heating: "Chauffage",
			pub_done: "Publiée",
			pub_tab: "La maison s'affiche dans l'onglet 3D du tableau de bord Homex.",
			pub_dashboard: "Tableau de bord Home Assistant",
			pub_dashboard_hint: "Un tableau de bord dédié affiche la maison en grand format (dans la barre latérale, idéal pour une tablette murale).",
			pub_dashboard_name: "Nom du tableau de bord",
			pub_dashboard_create: "Créer le tableau de bord",
			pub_dashboard_update: "Mettre à jour le tableau de bord",
			pub_dashboard_open: "Ouvrir",
			pub_dashboard_done: "Tableau de bord prêt, dans la barre latérale.",
			pub_withdraw: "Retirer la publication",
			house_dashboard_title: "Maison 3D",
			house_card_name: "Maison 3D Homex",
			house_card_description: "La maison publiée depuis le 3D Builder Homex, en grand format : étages, pièces, lumières, volets et chauffage, en direct.",
			house_card_unpublished: "Aucune maison 3D publiée : publiez-la depuis le 3D Builder Homex (vue 3D).",
			publish: "Publier",
			published: "Publiée",
			publish_hint: "Afficher cette maison 3D dans un nouvel onglet du tableau de bord Homex",
			unpublish_hint: "Publiée : onglet 3D du tableau de bord Homex et tableau de bord Home Assistant dédié",
			radiator_type: "Type",
			radiator_panel: "Normal",
			radiator_tall: "Pleine hauteur",
			render_target: "Consigne",
			render_current: "actuel",
			render_scenes: "Scènes",
			render_heating_off: "Non chauffée",
			render_heating_active: "En chauffe",
			render_m_temperature: "Température",
			render_m_humidity: "Humidité",
			render_m_co2: "CO₂",
			render_m_pm25: "PM2.5",
			render_m_pm10: "PM10",
			render_on: "Allumé",
			render_off: "Éteint",
			render_none: "Aucune",
			render_room_lights: "Lumières de la pièce",
			render_all_shutters: "Tous les volets",
			render_open: "Ouvrir",
			render_stop: "Arrêter",
			render_close: "Fermer",
			render_nothing: "Rien à piloter dans cette pièce pour l'instant.",
			render_hint: "Glisser pour tourner · clic droit ou Maj pour se déplacer · molette pour zoomer",
			fx_shutters: "Volets",
			fx_shutters_hint: "Cliquez sur un volet puis sur une fenêtre, ou glissez-le sur une fenêtre, porte vitrée ou porte coulissante (pointillés orange : pas encore de volet).",
			fx_shutters_hint_selected: "Cliquez un volet pour l'installer sur l'ouverture sélectionnée, ou glissez-le sur une autre.",
			fx_no_shutters: "Tous les volets des pièces de cet étage sont placés (ou aucun n'est configuré dans leur module Volets).",
			fx_radiators: "Radiateurs",
			fx_radiators_hint: "Cliquez sur un radiateur puis sur le plan (ou glissez-le) : il se cale le long du mur le plus proche.",
			fx_no_radiators: "Tous les radiateurs des pièces de cet étage sont placés (ou aucun n'est configuré dans leur module Climat).",
			fx_shutter: "Volet",
			fx_no_shutter: "Aucun volet",
			fx_state: "Actuellement :",
			fx_heating: "En chauffe",
			fx_idle: "Inactif",
			fx_remove: "Retirer du plan",
			keys_radiator: "Clavier : ← → tourner de 90° · ↑ ↓ retourner · + − longueur · Alt : sans aimantage au mur",
			hint_fx_place_radiator: "Cliquez sur le plan pour poser le radiateur : il se cale le long du mur le plus proche. Échap annule.",
			hint_fx_place_shutter: "Cliquez sur une fenêtre, porte vitrée ou porte coulissante pour y installer le volet. Échap annule.",
			hint_fixtures: "Équipements : le bâti est verrouillé. Installez les volets sur les fenêtres et placez les radiateurs.",
			hint_fx_opening: "Choisissez son volet dans le panneau ou cliquez-en un dans la liste. Suppr retire le volet.",
			hint_fx_radiator: "Glissez-le le long des murs (il s'y aimante), tournez-le avec les flèches. Suppr le retire du plan.",
			stairs_go_up: "Monte",
			stairs_go_down: "Descend",
			stairs_to_down: "Descend vers : {name}",
			stairs_no_below: "Pas encore d'étage en dessous.",
			stairs_tag_up: "MONTE",
			stairs_tag_down: "DESCEND",
			stairs_arrival_up: "↑ depuis {name}",
			stairs_arrival_down: "↓ depuis {name}",
			rotate: "Rotation",
			mirror: "Miroir",
			stairs_climb: "Direction",
			keys_door: "Clavier : ← → rotation · ↑ ↓ miroir · + − largeur",
			keys_width: "Clavier : + − largeur",
			keys_stairs: "Clavier : flèches pour la direction · PgUp / PgDn monte / descend",
			tool_door: "Porte",
			tool_sliding_door: "Porte coulissante",
			tool_window: "Fenêtre",
			tool_glass_door: "Porte vitrée",
			tool_opening: "Ouverture",
			opening_whole_wall: "Toute la cloison",
			tool_stairs: "Escalier",
			opening_type: "Type",
			width_cm: "Largeur (cm)",
			length_cm: "Longueur (cm)",
			door_flip: "Côté des gonds",
			door_side: "Sens d'ouverture",
			stairs_turn: "Tourner la montée",
			stairs_to: "Monte vers : {name}",
			stairs_no_above: "Pas encore d'étage au-dessus.",
			item_delete: "Supprimer",
			hint_opening: "Survolez un mur et cliquez pour la placer (centrée au pas de 10 cm). Réglez avant la largeur, la rotation et le miroir dans le panneau ou au clavier.",
			hint_opening_no_wall: "Tracez d'abord les pièces : portes et fenêtres se placent dans leurs murs.",
			hint_opening_selected: "Glissez-la le long des murs, réglez sa largeur et son sens dans le panneau. Suppr la retire.",
			hint_stairs: "Glissez pour tracer l'escalier (aimanté). La flèche indique la montée ; tournez-la dans le panneau.",
			hint_stair_selected: "Glissez l'escalier pour le déplacer, réglez sa taille et le sens de montée dans le panneau. Il apparaît en transparence sur les étages voisins.",
			level_new: "Nouvel étage",
			level_edit: "Modifier l'étage",
			level_dialog_intro: "Choisissez l'étage Home Assistant que ce niveau représente, et son numéro de niveau.",
			level_number: "Niveau",
			level_number_hint: "0 = rez-de-chaussée, 1 = premier étage, -1 = sous-sol…",
			level_taken: "Le niveau {level} est déjà utilisé par un autre étage.",
			no_floor_left: "Tous les étages Home Assistant ont déjà leur niveau. Créez des étages dans Home Assistant (Paramètres → Pièces, étiquettes et zones) pour en ajouter.",
			level_create: "Créer",
			create_first: "Créer le premier étage",
			level_label: "niveau {level}",
			rooms_hint_selected: "Cliquez une pièce pour l'associer au contour sélectionné, ou glissez-la sur le plan.",
			no_floor: "sans étage",
			all_placed: "Toutes les pièces de cet étage sont placées.",
			back: "Retour",
			saving: "Enregistrement…",
			saved: "Enregistré",
			save_error: "Non enregistré",
			empty_title: "Dessinez votre maison, étage par étage",
			empty_text: "Créez un étage à partir d'un étage Home Assistant, puis tracez le contour de chaque pièce sur une grille de 50 cm (les traits s'aimantent à la grille et aux autres murs) et glissez vos pièces Homex dessus. Ajoutez les autres étages depuis le sélecteur en bas à droite : l'étage du dessous apparaît en transparence pour vous guider.",
			create_base: "Créer l'étage de base",
			level_base: "Rez-de-chaussée",
			level_n: "Niveau {n}",
			level_unnamed: "Étage sans nom",
			levels: "Étages",
			add_above: "Étage au-dessus",
			add_below: "Étage en dessous",
			level_name: "Nom",
			level_floor: "Étage Home Assistant",
			level_floor_none: "Aucun",
			level_delete: "Supprimer cet étage",
			level_delete_confirm: "Supprimer l'étage « {name} » et ses pièces ?",
			next_level: "Étage suivant",
			next_level_new: "Étage suivant (nouveau)",
			rooms: "Pièces Homex",
			objects: "Objets",
			objects_hint: "Choisissez un objet, puis cliquez sur un mur (escalier : tracez un rectangle).",
			rooms_hint: "Glissez une pièce sur un contour pour l'associer, ou sur un espace vide pour créer une pièce de 4 × 3 m.",
			room_on: "Placée sur : {levels}",
			no_rooms: "Aucune pièce Homex pour l'instant.",
			room_n: "Pièce {n}",
			selection: "Pièce sélectionnée",
			mapped_room: "Pièce Homex",
			unmapped: "Non associée",
			shape_name: "Nom",
			area: "Surface",
			perimeter: "périmètre",
			shape_delete: "Supprimer ce contour",
			tool_select: "Sélection",
			tool_draw: "Tracer",
			tool_rect: "Rectangle",
			undo: "Annuler (Ctrl+Z)",
			redo: "Rétablir (Ctrl+Maj+Z)",
			zoom_in: "Zoomer",
			zoom_out: "Dézoomer",
			fit: "Ajuster à la vue",
			grid: "Grille {size}",
			hint_empty: "Aucune pièce sur cet étage : choisissez Tracer (D) ou Rectangle (R), ou glissez une pièce Homex sur le plan.",
			hint_select: "Cliquez une pièce pour la sélectionner, glissez-la pour la déplacer. Glissez le fond pour vous déplacer, molette pour zoomer.",
			hint_selected: "Glissez les coins pour modifier la forme (ils s'aimantent), les petits carrés pour ajouter un coin, double-cliquez un coin pour le retirer. Suppr retire la pièce.",
			hint_draw: "Cliquez pour placer chaque coin : il s'aimante à la grille, aux coins et aux murs (Alt pour un placement libre). Échap annule.",
			hint_draw_close: "Cliquez le premier coin, double-cliquez ou appuyez sur Entrée pour fermer la pièce. Retour arrière retire le dernier coin.",
			hint_rect: "Glissez pour tracer une pièce rectangulaire (aimantée à la grille et aux murs)."
		}
	},
	panel: {
		en: {
			tab_general: "General",
			tab_climate: "Climate",
			tab_house: "3D House",
			error: "Error: {message}",
			no_rooms: "No rooms yet. Click “＋ {button}” at the top right to create one.",
			new_room: "New room",
			menu: "Menu",
			refresh: "Refresh",
			export: "Export",
			switch_manager: "Switch Manager",
			shutter_manager: "Shutter Manager",
			climate_manager: "Climate Manager"
		},
		fr: {
			tab_general: "Général",
			tab_climate: "Climat",
			tab_house: "Maison 3D",
			error: "Erreur : {message}",
			no_rooms: "Aucune pièce. Clique sur « ＋ {button} » en haut à droite pour en créer une.",
			new_room: "Nouvelle pièce",
			menu: "Menu",
			refresh: "Rafraîchir",
			export: "Exporter",
			switch_manager: "Gestion des interrupteurs",
			shutter_manager: "Gestion des volets",
			climate_manager: "Gestion du climat"
		}
	},
	climateDashboard: {
		en: {
			heating_status: "Heating",
			idle: "Idle",
			no_rooms: "No rooms",
			zone_mode: "Zone mode",
			zone_tolerance: "Zone tolerance",
			heating: "Heating",
			enabled: "Enabled",
			disabled: "Disabled",
			disable: "Disable",
			enable: "Enable",
			tolerance: "Tolerance",
			zones: "Zones",
			rooms: "Rooms",
			off: "off",
			room_heating: "Room heating",
			no_radiator: "No radiator",
			radiators: "{count} radiator(s)",
			setpoint: "Setpoint",
			current_temperature: "Current temperature",
			valve_warning: "Valve?"
		},
		fr: {
			heating_status: "Chauffe",
			idle: "Au repos",
			no_rooms: "Aucune pièce",
			zone_mode: "Mode de la zone",
			zone_tolerance: "Tolérance de la zone",
			heating: "Chauffage",
			enabled: "Activé",
			disabled: "Désactivé",
			disable: "Désactiver",
			enable: "Activer",
			tolerance: "Tolérance",
			zones: "Zones",
			rooms: "Pièces",
			off: "coupé",
			room_heating: "Chauffage de la pièce",
			no_radiator: "Aucun radiateur",
			radiators: "{count} radiateur(s)",
			setpoint: "Consigne",
			current_temperature: "Température actuelle",
			valve_warning: "Vanne ?"
		}
	},
	climateManager: {
		en: {
			title: "Climate Manager",
			back_climate: "← Climate",
			metrics: "Metrics",
			metrics_desc: "Temperature, humidity and air quality sensors.",
			heating: "Heating",
			heating_desc: "Heating modes, setpoints, zones and radiator presets.",
			ac: "Air Conditioning",
			ac_desc: "Air conditioning — not available yet.",
			ac_unavailable: "Air conditioning is not available yet."
		},
		fr: {
			title: "Gestion du climat",
			back_climate: "← Climat",
			metrics: "Mesures",
			metrics_desc: "Capteurs de température, d'humidité et de qualité de l'air.",
			heating: "Chauffage",
			heating_desc: "Modes de chauffage, consignes, zones et presets des radiateurs.",
			ac: "Climatisation",
			ac_desc: "Climatisation — pas encore disponible.",
			ac_unavailable: "La climatisation n'est pas encore disponible."
		}
	},
	climateMetrics: {
		en: {
			title: "Metrics",
			back_climate: "← Climate",
			back_metrics: "← Metrics",
			temperature: "Temperature",
			humidity: "Humidity",
			air_quality: "Air quality",
			rule_mean: "Weighted average",
			rule_max: "Maximum",
			rule_min: "Minimum",
			enable_module: "Enable the Climate module on the room “{room}”?",
			rule_label: "Reference value calculation",
			weight: "Weight",
			remove: "Remove",
			add_sensor: "＋ Add a sensor…",
			area: "Area: {area}",
			others: "Others",
			no_sensor: "No sensor",
			module_not_enabled: "The Climate module is not enabled on this room.",
			room_not_found: "“{room}” not found.",
			no_ha_area: "No associated HA area",
			module_disabled: "Climate module disabled"
		},
		fr: {
			title: "Mesures",
			back_climate: "← Climat",
			back_metrics: "← Mesures",
			temperature: "Température",
			humidity: "Humidité",
			air_quality: "Qualité de l'air",
			rule_mean: "Moyenne pondérée",
			rule_max: "Maximum",
			rule_min: "Minimum",
			enable_module: "Activer le module Climat sur la pièce « {room} » ?",
			rule_label: "Calcul de la valeur de référence",
			weight: "Poids",
			remove: "Retirer",
			add_sensor: "＋ Ajouter un capteur…",
			area: "Pièce : {area}",
			others: "Autres",
			no_sensor: "Aucun capteur",
			module_not_enabled: "Le module Climat n'est pas activé sur cette pièce.",
			room_not_found: "« {room} » introuvable.",
			no_ha_area: "Aucune pièce HA associée",
			module_disabled: "Module Climat désactivé"
		}
	},
	deviceField: {
		en: {
			clear: "Clear",
			search: "Search for a device…",
			no_device: "No device"
		},
		fr: {
			clear: "Effacer",
			search: "Rechercher un appareil…",
			no_device: "Aucun appareil"
		}
	},
	dialog: {
		en: {},
		fr: {}
	},
	entityPicker: {
		en: {
			remove: "Remove",
			search: "Search for an entity…",
			no_entity: "No entity"
		},
		fr: {
			remove: "Retirer",
			search: "Rechercher une entité…",
			no_entity: "Aucune entité"
		}
	},
	exportDialog: {
		en: {
			heading: "Expose rooms (Google Assistant)",
			hint_before: "Paste this snippet into",
			hint_after: "to expose each room's on/off toggle to Google Assistant.",
			download: "Download .yaml",
			copy: "Copy",
			copied: "Copied ✓"
		},
		fr: {
			heading: "Exposer les pièces (Google Assistant)",
			hint_before: "Colle cet extrait dans",
			hint_after: "pour exposer le toggle on/off de chaque pièce à Google Assistant.",
			download: "Télécharger .yaml",
			copy: "Copier",
			copied: "Copié ✓"
		}
	},
	groupDialog: {
		en: {
			name_id_required: "Group name and id are required.",
			confirm_delete: "Delete the group \"{name}\"?",
			heading_edit: "Edit group",
			heading_new: "New group",
			name: "Name",
			name_placeholder: "Bedside table L",
			id: "Id",
			id_label: "Id: {id}",
			devices: "Devices (from the room)",
			enable_dim: "Enable group dimming",
			triggers: "Triggers",
			dim_up_title: "Dimmer + (raise brightness)",
			dim_up_hint: "Each trigger adds 20 to the brightness of the group's lights.",
			dim_down_title: "Dimmer − (lower brightness)",
			dim_down_hint: "Each trigger removes 20 from the brightness of the group's lights.",
			create: "Create group"
		},
		fr: {
			name_id_required: "Nom et id du groupe requis.",
			confirm_delete: "Supprimer le groupe \"{name}\" ?",
			heading_edit: "Modifier le groupe",
			heading_new: "Nouveau groupe",
			name: "Nom",
			name_placeholder: "Table de chevet L",
			id: "Id",
			id_label: "Id : {id}",
			devices: "Appareils (parmi la pièce)",
			enable_dim: "Activer le dimming du groupe",
			triggers: "Déclencheurs",
			dim_up_title: "Dimmer + (monter la luminosité)",
			dim_up_hint: "Chaque déclenchement ajoute 20 à la luminosité des lumières du groupe.",
			dim_down_title: "Dimmer − (baisser la luminosité)",
			dim_down_hint: "Chaque déclenchement retire 20 à la luminosité des lumières du groupe.",
			create: "Créer le groupe"
		}
	},
	groupRow: {
		en: {
			edit_on_scene: "Edit the group's “on” scene",
			edit_off_scene: "Edit the group's “off” scene",
			configure: "Configure the group"
		},
		fr: {
			edit_on_scene: "Éditer la scène « allumé » du groupe",
			edit_off_scene: "Éditer la scène « éteint » du groupe",
			configure: "Configurer le groupe"
		}
	},
	gswitchEditor: {
		en: {
			name_id_required: "Switch name and id are required.",
			choose_device: "Choose a device.",
			confirm_delete: "Delete switch \"{name}\"?",
			no_preset_for_model: "No preset for model {model}.",
			create_preset: "＋ Create a preset",
			preset: "Preset",
			model: "Model: {model}",
			new_preset: "＋ New preset",
			no_rooms_with_module: "No rooms with the Switches module.",
			no_room: "— No room —",
			name: "Name",
			name_placeholder: "Bedside switch",
			id: "Id: {id}",
			device: "Switch (device)",
			choose_switch: "Choose a switch…",
			area: "Area: {names}",
			others: "Others",
			no_devices: "No switch detected (device exposing actions).",
			rooms: "Assigned Homex rooms (0..n)",
			create_switch: "Create switch"
		},
		fr: {
			name_id_required: "Nom et id du switch requis.",
			choose_device: "Choisis un appareil.",
			confirm_delete: "Supprimer le switch \"{name}\" ?",
			no_preset_for_model: "Aucun preset pour le modèle {model}.",
			create_preset: "＋ Créer un preset",
			preset: "Preset",
			model: "Modèle : {model}",
			new_preset: "＋ Nouveau preset",
			no_rooms_with_module: "Aucune pièce avec le module Interrupteurs.",
			no_room: "— Aucune pièce —",
			name: "Nom",
			name_placeholder: "Interrupteur chevet",
			id: "Id : {id}",
			device: "Interrupteur (appareil)",
			choose_switch: "Choisir un interrupteur…",
			area: "Pièce : {names}",
			others: "Autres",
			no_devices: "Aucun interrupteur détecté (appareil exposant des actions).",
			rooms: "Pièces Homex assignées (0..n)",
			create_switch: "Créer le switch"
		}
	},
	heatingDevicePresetEditor: {
		en: {
			param_tolerance: "Tolerance / accuracy",
			param_mode: "Mode",
			param_lock: "Lock",
			param_sensor: "Sensor (internal / external)",
			switch_on: "On",
			switch_off: "Off",
			locked: "Locked",
			unlocked: "Unlocked",
			delete_confirm: "Delete the device preset “{name}”?",
			choose: "Choose…",
			entity: "Entity ({domains})",
			main_entity: "(main entity)",
			value: "Value to set",
			current: "Current: {value}",
			mode_normal: "Normal mode",
			mode_aggressive: "Aggressive mode",
			current_tolerance: "Current: {value} · applied according to select.homex_climate_tolerance_mode",
			external_sensor: "External sensor: the chosen value makes the valve read an external temperature",
			external_input_hint: "External temperature input: the sensor chosen for each radiator (in the room) is copied to it on every update.",
			no_device: "No device of this model found.",
			applied_on: "Applied to {count} device(s)",
			failed: "{param}: {error}",
			name: "Name",
			name_placeholder: "Thermostatic valve",
			id: "Id",
			id_label: "Id: {id}",
			model: "Thermostat model",
			choose_model: "Choose a model…",
			device_count: "{count} device(s)",
			reference_device: "Reference device",
			reference_hint: "Its entities are used to choose the settings; they are then applied to the {count} device(s) of the model.",
			settings: "Settings to enforce",
			model_not_found: "Model not found (no devices left?).",
			applying: "Applying…",
			save_apply: "Save and apply",
			apply_now: "Apply now",
			done: "Done"
		},
		fr: {
			param_tolerance: "Tolérance / précision",
			param_mode: "Mode",
			param_lock: "Verrouillage",
			param_sensor: "Capteur (interne / externe)",
			switch_on: "Activé",
			switch_off: "Désactivé",
			locked: "Verrouillé",
			unlocked: "Déverrouillé",
			delete_confirm: "Supprimer le device preset « {name} » ?",
			choose: "Choisir…",
			entity: "Entité ({domains})",
			main_entity: "(entité principale)",
			value: "Valeur à fixer",
			current: "Actuel : {value}",
			mode_normal: "Mode normal",
			mode_aggressive: "Mode agressive",
			current_tolerance: "Actuel : {value} · appliqué selon select.homex_climate_tolerance_mode",
			external_sensor: "Capteur externe : la valeur choisie fait lire à la vanne une température externe",
			external_input_hint: "Entrée de température externe : le capteur choisi pour chaque radiateur (dans la pièce) y est recopié à chaque mise à jour.",
			no_device: "Aucun appareil de ce modèle trouvé.",
			applied_on: "Appliqué sur {count} appareil(s)",
			failed: "{param} : {error}",
			name: "Nom",
			name_placeholder: "Vanne thermostatique",
			id: "Id",
			id_label: "Id : {id}",
			model: "Modèle de thermostat",
			choose_model: "Choisir un modèle…",
			device_count: "{count} appareil(s)",
			reference_device: "Appareil de référence",
			reference_hint: "Ses entités servent à choisir les réglages ; ils s'appliquent ensuite aux {count} appareil(s) du modèle.",
			settings: "Réglages à fixer",
			model_not_found: "Modèle introuvable (plus aucun appareil ?).",
			applying: "Application…",
			save_apply: "Enregistrer et appliquer",
			apply_now: "Appliquer maintenant",
			done: "Terminé"
		}
	},
	heatingGroupEditor: {
		en: {
			minus: "−0.5 °C",
			plus: "+0.5 °C",
			delete_confirm: "Delete the setpoint “{name}”? Its rooms go back to the default setpoint.",
			name: "Name",
			name_placeholder: "Bedrooms",
			id: "Id",
			id_label: "Id: {id}",
			setpoints: "Temperature setpoints",
			heating_off: "Heating off",
			rooms: "Rooms",
			default_hint: "Applies to every room that is in no other setpoint.",
			rooms_hint: "A room belongs to one setpoint only: ticking it removes it from its current setpoint."
		},
		fr: {
			minus: "−0,5 °C",
			plus: "+0,5 °C",
			delete_confirm: "Supprimer le setpoint « {name} » ? Ses pièces repassent dans le setpoint par défaut.",
			name: "Nom",
			name_placeholder: "Chambres",
			id: "Id",
			id_label: "Id : {id}",
			setpoints: "Consignes de température",
			heating_off: "Chauffage coupé",
			rooms: "Pièces",
			default_hint: "S'applique à toutes les pièces qui ne sont dans aucun autre setpoint.",
			rooms_hint: "Une pièce n'appartient qu'à un setpoint : la cocher la retire de son setpoint actuel."
		}
	},
	heatingManager: {
		en: {
			title: "Heating",
			back_climate: "← Climate",
			section_modes: "Heating Modes",
			section_setpoints: "Setpoints",
			section_zones: "Zones",
			section_devices: "Device Presets",
			section_systems: "Heating System",
			add_modes: "＋ Mode",
			add_setpoints: "＋ Setpoint",
			add_zones: "＋ Zone",
			add_devices: "＋ Device preset",
			add_systems: "＋ System",
			param_tolerance: "Tolerance",
			param_mode: "Mode",
			param_lock: "Lock",
			param_sensor: "Sensor",
			delete_mode_confirm: "Delete the mode “{name}” and its setpoints?",
			edit_mode: "Edit mode",
			new_mode: "New heating mode",
			name: "Name",
			name_placeholder: "Holidays",
			id: "Id",
			id_label: "Id: {id}",
			builtin_hint: "Default mode: it can be renamed, not deleted.",
			builtin_tag: " · default",
			unheated_tag: " · off or setpoint",
			other_rooms: "Other rooms: {rooms}",
			all_other_rooms: "All other rooms (none for now)",
			no_rooms: "No rooms",
			off: "off",
			active_mode: "Active mode",
			triggers: "{count} trigger(s)",
			no_systems: "No system. Click “＋ System” to declare a boiler or a buffer tank.",
			global: "Global",
			boiler: "Boiler",
			heat_pump: "Heat Pump",
			buffer_tank: "Buffer Tank",
			contact: "Contact:",
			aggressive: "Aggressive",
			rules: "{count} rule(s)",
			setpoint: "Setpoint",
			tank: "Tank",
			flow: "Flow",
			return: "Return",
			forced_title: "Manual override enabled",
			forced: "Forced",
			runtime_title: "Circulator run time today",
			circulator: "Circulator:",
			circulator_on: "running",
			circulator_off: "stopped",
			no_device_presets: "No device preset. Click “＋ Device preset” to set the settings of a thermostatic valve model.",
			no_settings: "No settings",
			not_found: "“{id}” not found.",
			edit_system: "Edit system",
			new_system: "New heating system",
			edit_zone: "Edit zone",
			new_zone: "New zone",
			edit_device_preset: "Edit device preset",
			new_device_preset: "New device preset",
			edit_setpoint: "Edit setpoint",
			new_setpoint: "New setpoint",
			disable_title: "Disable: every valve switches to off",
			enable_title: "Enable: presets are re-applied",
			heating_enabled: "Heating on",
			heating_disabled: "Heating off"
		},
		fr: {
			title: "Chauffage",
			back_climate: "← Climat",
			section_modes: "Modes de chauffage",
			section_setpoints: "Consignes",
			section_zones: "Zones",
			section_devices: "Device presets",
			section_systems: "Système de chauffage",
			add_modes: "＋ Mode",
			add_setpoints: "＋ Consigne",
			add_zones: "＋ Zone",
			add_devices: "＋ Device preset",
			add_systems: "＋ Système",
			param_tolerance: "Tolérance",
			param_mode: "Mode",
			param_lock: "Verrouillage",
			param_sensor: "Capteur",
			delete_mode_confirm: "Supprimer le mode « {name} » et ses consignes ?",
			edit_mode: "Modifier le mode",
			new_mode: "Nouveau mode de chauffage",
			name: "Nom",
			name_placeholder: "Vacances",
			id: "Id",
			id_label: "Id : {id}",
			builtin_hint: "Mode par défaut : il peut être renommé, pas supprimé.",
			builtin_tag: " · par défaut",
			unheated_tag: " · coupé ou consigne",
			other_rooms: "Autres pièces : {rooms}",
			all_other_rooms: "Toutes les autres pièces (aucune pour l'instant)",
			no_rooms: "Aucune pièce",
			off: "coupé",
			active_mode: "Mode actif",
			triggers: "{count} déclencheur(s)",
			no_systems: "Aucun système. Clique sur « ＋ Système » pour déclarer une chaudière (Boiler) ou un ballon tampon (Buffer Tank).",
			global: "Global",
			boiler: "Chaudière",
			heat_pump: "Pompe à chaleur",
			buffer_tank: "Ballon tampon",
			contact: "Contact :",
			aggressive: "Agressif",
			rules: "{count} règle(s)",
			setpoint: "Consigne",
			tank: "Ballon",
			flow: "Départ",
			return: "Retour",
			forced_title: "Forçage manuel activé",
			forced: "Forcé",
			runtime_title: "Durée d'activité du circulateur aujourd'hui",
			circulator: "Circulateur :",
			circulator_on: "en marche",
			circulator_off: "arrêté",
			no_device_presets: "Aucun device preset. Clique sur « ＋ Device preset » pour fixer les réglages d'un modèle de vanne thermostatique.",
			no_settings: "Aucun réglage",
			not_found: "« {id} » introuvable.",
			edit_system: "Modifier le système",
			new_system: "Nouveau système de chauffage",
			edit_zone: "Modifier la zone",
			new_zone: "Nouvelle zone",
			edit_device_preset: "Modifier le device preset",
			new_device_preset: "Nouveau device preset",
			edit_setpoint: "Modifier le setpoint",
			new_setpoint: "Nouveau setpoint",
			disable_title: "Désactiver : toutes les vannes passent sur off",
			enable_title: "Activer : les presets sont ré-appliqués",
			heating_enabled: "Chauffage activé",
			heating_disabled: "Chauffage désactivé"
		}
	},
	heatingSystemEditor: {
		en: {
			sensor_setpoint: "Setpoint temperature",
			sensor_tank: "Tank temperature",
			sensor_flow: "Flow temperature",
			sensor_return: "Return temperature",
			rule_setpoint_tank: "Setpoint / tank delta",
			rule_flow_return: "Flow / return delta",
			add_rule_setpoint_tank: "＋ Setpoint / tank delta rule",
			add_rule_flow_return: "＋ Flow / return delta rule",
			short_setpoint: "setpoint",
			short_tank: "tank",
			short_flow: "flow",
			short_return: "return",
			type_boiler: "Boiler",
			type_buffer_tank: "Buffer Tank",
			no_area: "No area",
			rule_required: "Delta and tolerance required.",
			rule_invalid: "Delta must be > tolerance ≥ 0.",
			delete_confirm: "Delete the system “{name}”?",
			dry_contact: "Dry contact",
			dry_contact_hint: "The boiler's controlled switch: on as soon as its scope needs heating, off otherwise.",
			choose_switch: "Choose a switch…",
			driven_contact: "dry contact",
			driven_circulator: "circulator",
			scope: "Scope",
			scope_hint: "The zones whose heating demand counts for this system.",
			global_system: "Global system (all zones)",
			zone: "Zone {name}",
			aggressive_mode: "Aggressive mode",
			aggressive_hint: "Aggressive mode: “aggressive” tolerance over the scope while the {driven} is on",
			explain_setpoint_tank: "Circulates when tank ≤ setpoint − {delta} °C; stops when tank > setpoint − {tolerance} °C.",
			explain_setpoint_tank_live: "Setpoint {setpoint}: circulates when tank ≤ {start}; stops when tank > {stop}.",
			explain_flow_return: "Circulates when flow − return ≥ {delta} °C; stops when flow − return < {tolerance} °C.",
			currently: " Currently {a} − {b} = {value}.",
			rule_title: "Rule {n} · {label}",
			delta: "Delta (°C)",
			tolerance: "Tolerance (°C)",
			delete_rule: "Delete the rule",
			manual_override: "Manual override",
			force_hint: "While on, the circulator runs regardless of the rules and of the radiators' demand (if heating is enabled globally).",
			force_entity: "Entity:",
			force_entity_suffix: "(applies immediately).",
			force_unavailable: "Available once the system is saved.",
			sensors: "Sensors",
			required: "{label} (required)",
			choose_sensor: "Choose a sensor…",
			circulator: "Circulator",
			controlled_switch: "Controlled switch",
			min_runtime: "Minimum run time (min)",
			rules: "Circulation rules",
			rules_hint: "The circulator runs as long as at least one rule requests it and at least one radiator needs heat (heating enabled globally). Once started, it always runs at least the minimum run time, even if the temperature rises quickly or nothing requests heat any more.",
			name: "Name",
			name_placeholder: "Boiler",
			id: "Id",
			id_label: "Id: {id}",
			type: "Type",
			heat_pump_unavailable: "Heat pumps are no longer offered: choose Boiler or Buffer Tank."
		},
		fr: {
			sensor_setpoint: "Température de consigne",
			sensor_tank: "Température ballon",
			sensor_flow: "Température départ",
			sensor_return: "Température retour",
			rule_setpoint_tank: "Delta consigne / ballon",
			rule_flow_return: "Delta départ / retour",
			add_rule_setpoint_tank: "＋ Règle delta consigne / ballon",
			add_rule_flow_return: "＋ Règle delta départ / retour",
			short_setpoint: "consigne",
			short_tank: "ballon",
			short_flow: "départ",
			short_return: "retour",
			type_boiler: "Chaudière",
			type_buffer_tank: "Ballon tampon",
			no_area: "Sans pièce",
			rule_required: "Delta et tolérance requis.",
			rule_invalid: "Il faut delta > tolérance ≥ 0.",
			delete_confirm: "Supprimer le système « {name} » ?",
			dry_contact: "Contact sec",
			dry_contact_hint: "L'interrupteur commandé de la chaudière : activé dès que sa portée a besoin d'être chauffée, désactivé sinon.",
			choose_switch: "Choisir un interrupteur…",
			driven_contact: "contact sec",
			driven_circulator: "circulateur",
			scope: "Portée",
			scope_hint: "Les zones dont la demande de chauffe compte pour ce système.",
			global_system: "Système global (toutes les zones)",
			zone: "Zone {name}",
			aggressive_mode: "Mode agressif",
			aggressive_hint: "Mode agressif : tolérance « agressive » sur la portée tant que le {driven} est actif",
			explain_setpoint_tank: "Circule quand ballon ≤ consigne − {delta} °C ; s'arrête quand ballon > consigne − {tolerance} °C.",
			explain_setpoint_tank_live: "Consigne {setpoint} : circule quand ballon ≤ {start} ; s'arrête quand ballon > {stop}.",
			explain_flow_return: "Circule quand départ − retour ≥ {delta} °C ; s'arrête quand départ − retour < {tolerance} °C.",
			currently: " Actuellement {a} − {b} = {value}.",
			rule_title: "Règle {n} · {label}",
			delta: "Delta (°C)",
			tolerance: "Tolérance (°C)",
			delete_rule: "Supprimer la règle",
			manual_override: "Forçage manuel",
			force_hint: "Tant qu'il est activé, le circulateur tourne quelles que soient les règles et la demande des radiateurs (si le chauffage est activé globalement).",
			force_entity: "Entité :",
			force_entity_suffix: "(s'applique immédiatement).",
			force_unavailable: "Disponible une fois le système enregistré.",
			sensors: "Capteurs",
			required: "{label} (requis)",
			choose_sensor: "Choisir un capteur…",
			circulator: "Circulateur",
			controlled_switch: "Interrupteur commandé",
			min_runtime: "Temps d'exécution minimal (min)",
			rules: "Règles de circulation",
			rules_hint: "Le circulateur tourne tant qu'au moins une règle le demande et qu'au moins un radiateur a besoin de chauffer (chauffage activé globalement). Une fois lancé, il tourne toujours au moins le temps d'exécution minimal, même si la température remonte vite ou si plus rien ne demande de chauffe.",
			name: "Nom",
			name_placeholder: "Chaudière",
			id: "Id",
			id_label: "Id : {id}",
			type: "Type",
			heat_pump_unavailable: "Les pompes à chaleur ne sont plus proposées : choisis Chaudière ou Ballon tampon."
		}
	},
	heatingSystemsCard: {
		en: {
			title: "Heating systems",
			rule_setpoint_tank: "Setpoint − tank",
			rule_flow_return: "Flow − return",
			global: "Global",
			runtime_days: "Run time · {days} days",
			day_value: "{day}: {value}",
			total: "Total {total} · avg. {avg}/day",
			chart_label: "Daily run time of {name} over {days} days",
			buffer_tank: "Buffer Tank",
			boiler: "Boiler",
			circulating: "Circulating",
			stopped: "Stopped",
			demand_title: "Heating demand of the scope",
			demand: "Demand",
			no_demand: "No demand",
			forced: "Forced",
			aggressive: "Aggressive",
			setpoint: "Setpoint",
			tank: "Tank",
			flow: "Flow",
			return: "Return",
			tank_active_today: "Active today",
			min_time_left: "Min. time left",
			rule_status: "starts ≥ {delta} · stops < {tolerance} · {state}",
			rule_on: "requests circulation",
			rule_off: "inactive",
			manual_override: "Manual override",
			boiler_on: "Running",
			boiler_off: "Stopped",
			boiler_active_today: "Active today"
		},
		fr: {
			title: "Systèmes de chauffage",
			rule_setpoint_tank: "Consigne − ballon",
			rule_flow_return: "Départ − retour",
			global: "Global",
			runtime_days: "Temps d'activité · {days} jours",
			day_value: "{day} : {value}",
			total: "Total {total} · moy. {avg}/j",
			chart_label: "Temps d'activité quotidien de {name} sur {days} jours",
			buffer_tank: "Ballon tampon",
			boiler: "Chaudière",
			circulating: "Circulation",
			stopped: "Arrêté",
			demand_title: "Demande de chauffe de la portée",
			demand: "Demande",
			no_demand: "Pas de demande",
			forced: "Forcé",
			aggressive: "Agressif",
			setpoint: "Consigne",
			tank: "Ballon",
			flow: "Départ",
			return: "Retour",
			tank_active_today: "Actif aujourd'hui",
			min_time_left: "Temps min. restant",
			rule_status: "démarre ≥ {delta} · s'arrête < {tolerance} · {state}",
			rule_on: "demande la circulation",
			rule_off: "inactive",
			manual_override: "Forçage manuel",
			boiler_on: "En marche",
			boiler_off: "Arrêtée",
			boiler_active_today: "Active aujourd'hui"
		}
	},
	heatingZoneEditor: {
		en: {
			delete_confirm: "Delete the zone “{name}”? Its rooms go back to the default zone.",
			name: "Name",
			name_placeholder: "Studio",
			id: "Id",
			id_label: "Id: {id}",
			control_entity: "Control entity:",
			rooms: "Rooms",
			default_hint: "Contains every room that is in no other zone.",
			rooms_hint: "A room belongs to one zone only: ticking it removes it from its current zone.",
			triggers: "Triggers per mode",
			triggers_hint: "Each trigger switches the zone to the matching mode. Switch buttons can also be set up in the Switch Manager (🔥 Climate module).",
			trigger_count: "· {count} trigger(s)"
		},
		fr: {
			delete_confirm: "Supprimer la zone « {name} » ? Ses pièces repassent dans la zone par défaut.",
			name: "Nom",
			name_placeholder: "Studio",
			id: "Id",
			id_label: "Id : {id}",
			control_entity: "Entité de commande :",
			rooms: "Pièces",
			default_hint: "Contient toutes les pièces qui ne sont dans aucune autre zone.",
			rooms_hint: "Une pièce n'appartient qu'à une zone : la cocher la retire de sa zone actuelle.",
			triggers: "Déclencheurs par mode",
			triggers_hint: "Chaque déclencheur passe la zone dans le mode correspondant. Les boutons d'interrupteurs se configurent aussi dans la Gestion des interrupteurs (module 🔥 Climat).",
			trigger_count: "· {count} déclencheur(s)"
		}
	},
	layoutEditor: {
		en: {
			name_id_required: "Layout name and id are required.",
			confirm_delete: "Delete layout \"{name}\"?",
			name: "Name",
			name_placeholder: "Round 2 buttons",
			main_shape: "Main shape",
			shape_round: "● Round",
			shape_square: "■ Square",
			shape_vrect: "▮ Vertical rect.",
			buttons: "Buttons",
			columns: "Columns",
			rows: "Rows",
			center_shape: "⊕ Center the shape",
			hint: "Magnetic 20×20 grid. A button takes up one zone (cell) delimited by the separators. Drag a number to assign it to a cell (it swaps with the occupant) or to the “Invisible” zone to remove it from the visual. The shape is recentered on save.",
			invisible: "Invisible",
			tray_empty: "Drag a button here to make it invisible",
			create_layout: "Create layout"
		},
		fr: {
			name_id_required: "Nom et id du layout requis.",
			confirm_delete: "Supprimer le layout \"{name}\" ?",
			name: "Nom",
			name_placeholder: "Rond 2 boutons",
			main_shape: "Forme principale",
			shape_round: "● Rond",
			shape_square: "■ Carré",
			shape_vrect: "▮ Rect. vertical",
			buttons: "Boutons",
			columns: "Colonnes",
			rows: "Lignes",
			center_shape: "⊕ Centrer la forme",
			hint: "Grille aimantée 20×20. Un bouton occupe une zone (cadran) délimitée par les séparateurs. Glisse un chiffre pour l'assigner à un cadran (il s'échange avec l'occupant) ou vers la zone « Invisible » pour le retirer du visuel. La forme est recentrée à la sauvegarde.",
			invisible: "Invisible",
			tray_empty: "Glisse un bouton ici pour le rendre invisible",
			create_layout: "Créer le layout"
		}
	},
	managedTriggers: {
		en: { managed_by_switches: "Managed by the Switches module" },
		fr: { managed_by_switches: "Géré par le module Interrupteurs" }
	},
	presetEditor: {
		en: {
			tap_single: "Single",
			tap_double: "Double",
			tap_long: "Long",
			name_id_required: "Preset name and id are required.",
			choose_device_model: "Choose a device (model).",
			select_layout: "Select a layout.",
			confirm_delete: "Delete preset \"{name}\"?",
			no_actions: "No actions available for this device.",
			actions_per_button: "Actions per button",
			actions_hint: "For each tap mode, map each button to the model's standard actions.",
			button: "Button {n}",
			no_action: "No action",
			name: "Preset name",
			name_placeholder: "Model X",
			id: "Id: {id}",
			switch_model: "Switch model",
			choose_model: "Choose a model…",
			devices_count: "{count} device(s)",
			no_switches: "No switch detected (device exposing actions).",
			ref_device: "Reference device",
			ref_device_hint: "Device of the model the actions are pulled from. The same model can expose different actions depending on the device.",
			choose_device: "Choose a device…",
			no_devices_for_model: "No device detected for this model.",
			layout: "Layout",
			choose_layout: "Choose a layout…",
			buttons_count: "{count} button(s)",
			no_layouts: "No layouts yet. Create one in “Switch Layouts”.",
			tap_modes: "Tap modes per button",
			tap_modes_hint: "Single enabled by default; add Double / Long as needed.",
			create_preset: "Create preset"
		},
		fr: {
			tap_single: "Simple",
			tap_double: "Double",
			tap_long: "Long",
			name_id_required: "Nom et id du preset requis.",
			choose_device_model: "Choisis un appareil (modèle).",
			select_layout: "Sélectionne un layout.",
			confirm_delete: "Supprimer le preset \"{name}\" ?",
			no_actions: "Aucune action disponible pour cet appareil.",
			actions_per_button: "Actions par bouton",
			actions_hint: "Pour chaque tap mode, associe chaque bouton aux actions standard du modèle.",
			button: "Bouton {n}",
			no_action: "Aucune action",
			name: "Nom du preset",
			name_placeholder: "Modèle X",
			id: "Id : {id}",
			switch_model: "Modèle d'interrupteur",
			choose_model: "Choisir un modèle…",
			devices_count: "{count} appareil(s)",
			no_switches: "Aucun interrupteur détecté (appareil exposant des actions).",
			ref_device: "Appareil de référence",
			ref_device_hint: "Appareil du modèle duquel les actions sont récupérées. Un même modèle peut exposer des actions différentes selon l'appareil.",
			choose_device: "Choisir un appareil…",
			no_devices_for_model: "Aucun appareil détecté pour ce modèle.",
			layout: "Layout",
			choose_layout: "Choisir un layout…",
			buttons_count: "{count} bouton(s)",
			no_layouts: "Aucun layout. Crée-en un dans « Switch Layouts ».",
			tap_modes: "Tap modes par bouton",
			tap_modes_hint: "Simple activé par défaut ; ajoute Double / Long au besoin.",
			create_preset: "Créer le preset"
		}
	},
	radiatorDialog: {
		en: {
			external_sensor: "External temperature sensor",
			external_sensor_hint: "Its temperature is copied to the valve on every update.",
			choose_sensor: "Choose a sensor…",
			room_reference: "Room reference",
			reference_temperature: "Reference temperature ({room})",
			room_sensors: "Room sensors",
			area: "Area: {area}",
			others: "Others",
			sensor_required: "This preset uses an external sensor: choose one.",
			already_in_room: "already in the room",
			edit_title: "Edit radiator",
			add_title: "Add a radiator",
			radiator: "Radiator",
			choose_radiator: "Choose a radiator…",
			already_in_other_room: "Already in the room “{room}”.",
			device_preset: "Device preset",
			no_preset: "No preset",
			external_sensor_tag: "external sensor",
			no_preset_for_model: "No device preset for this model (Climate Manager → Heating → Device Presets).",
			preset_applied: "The preset is applied continuously (checked and re-applied every 10 minutes)."
		},
		fr: {
			external_sensor: "Capteur de température externe",
			external_sensor_hint: "Sa température est recopiée dans la vanne à chaque mise à jour.",
			choose_sensor: "Choisir un capteur…",
			room_reference: "Référence de la pièce",
			reference_temperature: "Température de référence ({room})",
			room_sensors: "Capteurs de la pièce",
			area: "Pièce : {area}",
			others: "Autres",
			sensor_required: "Ce preset utilise un capteur externe : choisis-en un.",
			already_in_room: "déjà dans la pièce",
			edit_title: "Modifier le radiateur",
			add_title: "Ajouter un radiateur",
			radiator: "Radiateur",
			choose_radiator: "Choisir un radiateur…",
			already_in_other_room: "Déjà dans la pièce « {room} ».",
			device_preset: "Device preset",
			no_preset: "Aucun preset",
			external_sensor_tag: "capteur externe",
			no_preset_for_model: "Aucun device preset pour ce modèle (Gestion du climat → Chauffage → Device presets).",
			preset_applied: "Le preset est appliqué en continu (vérifié et ré-appliqué toutes les 10 minutes)."
		}
	},
	roomCard: {
		en: {
			synced: "Synced: {entities} entity(ies) (area + labels), {scenes} scene(s) renamed.",
			confirm_delete_scene: "Delete the scene \"{name}\"?",
			drag_reorder: "Drag to reorder",
			always_last: "Always last",
			active: "active",
			open_in_ha: "View in Home Assistant",
			default_scene: "Default scene",
			collapse_expand: "Collapse / expand",
			dim_down: "Lower brightness (−20)",
			dim_up: "Raise brightness (+20)",
			next_scene: "Next scene",
			actions: "Actions",
			edit_room: "Edit room",
			triggers: "Triggers ({count})",
			add_group: "Add a group",
			syncing: "Syncing…",
			sync_labels: "Sync labels",
			delete_room: "Delete room",
			heating_disabled_room: "Heating disabled in the room",
			zone_mode: "{zone} zone mode",
			heating: "Heating",
			heating_hint: "At least one valve is heating",
			idle: "Idle",
			idle_hint: "No valve is heating",
			valve_check: "Valve?",
			module_lights: "Lights",
			module_switches: "Switches",
			module_shutters: "Shutters",
			module_climate: "Climate",
			lights_count: "{count} light(s)",
			scenes_count: "{count} scene(s)",
			groups_count: "{count} group(s)",
			switches_count: "{count} switch(es)",
			actions_count: "{count} action(s)",
			shutters_count: "{count} shutter(s)",
			metrics_count: "{count} metric(s)",
			radiators_count: "{count} radiator(s)",
			no_modules: "No module enabled on this room.",
			scenes: "Scenes",
			add_scene: "Scene",
			groups: "Groups",
			add_group_short: "Group",
			no_groups: "No groups. A group controls part of the room's lights (e.g. a bedside lamp).",
			switches: "Switches",
			add_switch: "Switch",
			no_preset: "no preset",
			no_switches: "No associated switch. Click “＋ {button}” to create one (via the Switch Manager) and associate it with this room.",
			shutter_groups: "Shutter groups",
			configure_group: "Configure the group",
			no_shutters_in_group: "No shutter in this group.",
			shutters_title: "Shutters ({name}): {state}",
			confirm_delete_room: "Delete the room “{name}”?",
			delete_room_text: "The room's switch, light group and triggers will be deleted. This action cannot be undone.",
			delete_scenes_too: "Also delete the {count} associated scene(s)",
			deleting: "Deleting…"
		},
		fr: {
			synced: "Synchronisé : {entities} entité(s) (area + labels), {scenes} scène(s) renommée(s).",
			confirm_delete_scene: "Supprimer la scène \"{name}\" ?",
			drag_reorder: "Glisser pour réordonner",
			always_last: "Toujours en dernier",
			active: "active",
			open_in_ha: "Voir dans Home Assistant",
			default_scene: "Scène par défaut",
			collapse_expand: "Plier / déplier",
			dim_down: "Baisser la luminosité (−20)",
			dim_up: "Monter la luminosité (+20)",
			next_scene: "Changer de scène",
			actions: "Actions",
			edit_room: "Modifier la pièce",
			triggers: "Déclencheurs ({count})",
			add_group: "Ajouter un groupe",
			syncing: "Synchronisation…",
			sync_labels: "Synchroniser les labels",
			delete_room: "Supprimer la pièce",
			heating_disabled_room: "Chauffage désactivé dans la pièce",
			zone_mode: "Mode de la zone {zone}",
			heating: "En chauffe",
			heating_hint: "Au moins une vanne chauffe",
			idle: "Au repos",
			idle_hint: "Aucune vanne ne chauffe",
			valve_check: "Vanne ?",
			module_lights: "Lumières",
			module_switches: "Interrupteurs",
			module_shutters: "Volets",
			module_climate: "Climat",
			lights_count: "{count} lumière(s)",
			scenes_count: "{count} scène(s)",
			groups_count: "{count} groupe(s)",
			switches_count: "{count} interrupteur(s)",
			actions_count: "{count} action(s)",
			shutters_count: "{count} volet(s)",
			metrics_count: "{count} métrique(s)",
			radiators_count: "{count} radiateur(s)",
			no_modules: "Aucun module actif sur cette pièce.",
			scenes: "Scènes",
			add_scene: "Scène",
			groups: "Groupes",
			add_group_short: "Groupe",
			no_groups: "Aucun groupe. Un groupe pilote une partie des lumières de la pièce (ex. une lampe de chevet).",
			switches: "Interrupteurs",
			add_switch: "Interrupteur",
			no_preset: "aucun preset",
			no_switches: "Aucun interrupteur associé. Clique sur « ＋ {button} » pour en créer un (via le Switch Manager) et l'associer à cette pièce.",
			shutter_groups: "Groupes de volets",
			configure_group: "Configurer le groupe",
			no_shutters_in_group: "Aucun volet dans ce groupe.",
			shutters_title: "Volets ({name}) : {state}",
			confirm_delete_room: "Supprimer la pièce « {name} » ?",
			delete_room_text: "Le switch, le groupe de lumières et les déclencheurs de cette pièce seront supprimés. Cette action est irréversible.",
			delete_scenes_too: "Supprimer aussi les {count} scène(s) associée(s)",
			deleting: "Suppression…"
		}
	},
	roomClimate: {
		en: {
			metric_temperature: "Temperature",
			metric_humidity: "Humidity",
			metric_pm25: "PM2.5",
			metric_pm10: "PM10",
			metric_co2: "CO₂",
			rule_mean: "weighted average",
			rule_max: "max",
			rule_min: "min",
			action_heating: "🔥 Heating",
			action_idle: "Idle",
			action_off: "Off",
			action_preheating: "Preheating",
			action_heat: "Heat mode",
			action_auto: "Auto mode",
			metrics: "Metrics",
			configure: "Configure",
			sensor_count: "{count} sensor(s)",
			no_sensors: "No sensors: “Configure” to add some.",
			this_radiator: "this radiator",
			confirm_remove: "Remove {name} from the room?",
			preset: "Preset: {name}",
			no_preset: "No preset",
			sensor: "Sensor: {name}",
			unavailable: "Unavailable",
			valve_stuck: "Heating while the temperature is above the setpoint: valve stuck open or state not refreshed — check the radiator.",
			target_temp: "Target temperature",
			current_temp: "Current temperature",
			remove: "Remove",
			heating: "Heating",
			disable_hint: "Disable: the room switches to Unheated, its valves off",
			enable_hint: "Enable: the room goes back to its zone's mode",
			heating_on: "Heating on",
			heating_off: "Heating off",
			add_radiator: "Radiator",
			no_radiators: "No radiators."
		},
		fr: {
			metric_temperature: "Température",
			metric_humidity: "Humidité",
			metric_pm25: "PM2.5",
			metric_pm10: "PM10",
			metric_co2: "CO₂",
			rule_mean: "moyenne pondérée",
			rule_max: "max",
			rule_min: "min",
			action_heating: "🔥 Chauffe",
			action_idle: "En veille",
			action_off: "Éteint",
			action_preheating: "Préchauffe",
			action_heat: "Mode chauffage",
			action_auto: "Mode auto",
			metrics: "Mesures",
			configure: "Configurer",
			sensor_count: "{count} capteur(s)",
			no_sensors: "Aucun capteur : « Configurer » pour en ajouter.",
			this_radiator: "ce radiateur",
			confirm_remove: "Retirer {name} de la pièce ?",
			preset: "Preset : {name}",
			no_preset: "Aucun preset",
			sensor: "Capteur : {name}",
			unavailable: "Indisponible",
			valve_stuck: "Chauffe alors que la température dépasse la consigne : vanne bloquée ouverte ou état non rafraîchi — vérifie le radiateur.",
			target_temp: "Température de consigne",
			current_temp: "Température actuelle",
			remove: "Retirer",
			heating: "Chauffage",
			disable_hint: "Désactiver : la pièce passe en mode Non chauffé, ses vannes sur off",
			enable_hint: "Activer : la pièce reprend le mode de sa zone",
			heating_on: "Chauffage activé",
			heating_off: "Chauffage désactivé",
			add_radiator: "Radiateur",
			no_radiators: "Aucun radiateur."
		}
	},
	roomDialog: {
		en: {
			name_id_required: "Name and id are required.",
			heading_edit: "Edit room",
			heading_new: "New room",
			name: "Name",
			name_placeholder: "Bedroom",
			id: "Id",
			area: "Home Assistant area (optional)",
			area_none: "None",
			modules: "Modules",
			module_lights: "Lights",
			module_lights_hint: "The Lights module handles the room's lighting, scenes and groups.",
			module_switches: "Switches",
			module_switches_hint: "The Switches module handles the room's physical switches.",
			module_shutters: "Shutters",
			module_shutters_hint: "The Shutters module handles the room's roller shutters.",
			module_climate: "Climate",
			module_climate_hint: "The Climate module handles the room's sensors and radiators (Climate tab).",
			lights_devices: "Room lights",
			import_lights: "Import from Home Assistant",
			import_hint: "Add the lights of this room's Home Assistant area",
			import_no_area: "Link the room to a Home Assistant area to import its lights.",
			import_added: "{count} light(s) added from the area.",
			import_none: "No new light in this area.",
			strategy: "Scene switching strategy",
			strategy_first: "Start over",
			strategy_first_hint: "First scene",
			strategy_last: "Last used",
			strategy_last_hint: "Resumes the last scene",
			strategy_hint: "When a scene-switching trigger changes scene while the room was off: start again from the first scene, or resume the last one used.",
			heating_zone: "Heating zone",
			zone_default_hint: "All other rooms",
			climate_hint: "Sensors and radiators are configured in the room's Climate tab.",
			create: "Create room"
		},
		fr: {
			name_id_required: "Nom et id requis.",
			heading_edit: "Modifier la pièce",
			heading_new: "Nouvelle pièce",
			name: "Nom",
			name_placeholder: "Chambre",
			id: "Id",
			area: "Pièce Home Assistant (optionnel)",
			area_none: "Aucune",
			modules: "Modules",
			module_lights: "Lumières",
			module_lights_hint: "Le module Lumières gère l'allumage, les scènes et les groupes de la pièce.",
			module_switches: "Interrupteurs",
			module_switches_hint: "Le module Interrupteurs gère les interrupteurs physiques de la pièce.",
			module_shutters: "Volets",
			module_shutters_hint: "Le module Volets gère les volets roulants de la pièce.",
			module_climate: "Climat",
			module_climate_hint: "Le module Climat gère les capteurs et les radiateurs de la pièce (onglet Climat).",
			lights_devices: "Luminaires de la pièce",
			import_lights: "Importer depuis Home Assistant",
			import_hint: "Ajouter les lumières de la zone Home Assistant de la pièce",
			import_no_area: "Associez la pièce à une zone Home Assistant pour importer ses lumières.",
			import_added: "{count} lumière(s) ajoutée(s) depuis la zone.",
			import_none: "Aucune nouvelle lumière dans cette zone.",
			strategy: "Stratégie de changement de scène",
			strategy_first: "Repart de zéro",
			strategy_first_hint: "Première scène",
			strategy_last: "Dernière utilisée",
			strategy_last_hint: "Reprend la dernière scène",
			strategy_hint: "Quand un trigger scene-switching change de scène et que la pièce était éteinte : repartir de la première scène, ou reprendre la dernière utilisée.",
			heating_zone: "Zone de chauffage",
			zone_default_hint: "Toutes les autres pièces",
			climate_hint: "Capteurs et radiateurs se configurent dans l'onglet Climat de la pièce.",
			create: "Créer la pièce"
		}
	},
	sceneDialog: {
		en: {
			pick_scene_required: "Pick an existing scene to attach.",
			heading_rename: "Rename scene",
			heading_new: "New scene",
			name: "Scene name",
			name_placeholder: "Night",
			name_taken: "This scene name already exists.",
			triggers: "Triggers (activate this scene)",
			attach: "Attach",
			create: "Create scene",
			mode_new: "New",
			mode_attach: "Attach an existing one",
			new_hint: "The scene is created “all off”; edit it afterwards in Home Assistant.",
			attach_hint: "Existing scene to adopt (it will be renamed, its content kept)",
			pick_scene: "Pick a scene…"
		},
		fr: {
			pick_scene_required: "Choisis une scène existante à rattacher.",
			heading_rename: "Renommer la scène",
			heading_new: "Nouvelle scène",
			name: "Nom de la scène",
			name_placeholder: "Nuit",
			name_taken: "Ce nom de scène existe déjà.",
			triggers: "Déclencheurs (activent cette scène)",
			attach: "Rattacher",
			create: "Créer la scène",
			mode_new: "Nouvelle",
			mode_attach: "Rattacher une existante",
			new_hint: "La scène est créée « tout éteint » ; édite-la ensuite dans Home Assistant.",
			attach_hint: "Scène existante à adopter (elle sera renommée, son contenu conservé)",
			pick_scene: "Choisir une scène…"
		}
	},
	select: {
		en: { no_option: "No option" },
		fr: { no_option: "Aucune option" }
	},
	setupWizard: {
		en: {
			title: "Homex Setup Wizard",
			subtitle: "Let's set up your home, room by room.",
			step_rooms: "Rooms",
			rooms_intro: "Homex works room by room. Start from the areas you already have in Home Assistant, or create your first room.",
			import_title: "Import rooms from Home Assistant",
			import_text: "{count} area(s) found. Pick the ones to bring into Homex.",
			import_none: "No Home Assistant area left to import.",
			create_title: "Create a room",
			create_text: "Start from an empty room and name it yourself.",
			import_pick: "Check the areas to import as Homex rooms. You can add or remove rooms later.",
			select_all: "All",
			select_none: "None",
			no_floor: "No floor",
			already_imported: "Already in Homex",
			device_one: "1 device",
			device_other: "{count} devices",
			back: "Back",
			import_button_one: "Import 1 room",
			import_button_other: "Import {count} rooms",
			importing: "Importing…",
			done_one: "1 room imported.",
			done_other: "{count} rooms imported.",
			continue: "Continue",
			step_switches: "Switches",
			switches_intro: "Next, your wall switches and remotes. Homex describes them in three levels:",
			concept_layout: "Layout",
			concept_layout_text: "The shape of a switch: how many buttons, and where.",
			concept_preset: "Preset",
			concept_preset_text: "One per model: which device action each button and press (single, double, long) sends. Every switch of that model reuses it.",
			concept_switch: "Switch",
			concept_switch_text: "Each device: its rooms, and what each button does in them.",
			switches_found: "{devices} switch(es) of {models} model(s) found in your rooms. Homex can prepare their presets now.",
			switches_none: "No wall switch or remote found in these rooms.",
			skip: "Skip this step",
			configure_switches: "Configure the switches",
			switches_pick: "Homex read the actions of each model and suggests its layout and preset. Check the ones to create.",
			preset_existing: "Existing preset: {name}.",
			actions_unknown: "Actions not recognized: set its preset up in the Switch Manager.",
			create_preset: "Create the preset",
			presets_hint: "Presets stay editable in the Switch Manager (layout, presses, actions). Assigning each switch to its rooms comes next.",
			create_presets_one: "Create 1 preset",
			create_presets_other: "Create {count} presets",
			presets_done_one: "1 switch preset created.",
			presets_done_other: "{count} switch presets created.",
			btn_main: "button",
			btn_left: "left",
			btn_right: "right",
			btn_on: "on",
			btn_n: "button {n}",
			btn_off: "off",
			btn_up: "up",
			btn_down: "down",
			btn_arrow_left: "left arrow",
			btn_arrow_right: "right arrow",
			tap_single: "single",
			tap_double: "double",
			tap_long: "long",
			next: "Next",
			options_intro: "What should Homex bring along with these {count} room(s)?",
			lights_title: "Import the lights",
			lights_desc: "Turns on the Lights module and adds the {lights} light(s) of {rooms} room(s).",
			lights_none: "No light found in these rooms.",
			shutters_title: "Import the shutters",
			shutters_desc: "Turns on the Shutters module: {checked} of the {total} cover(s) of {rooms} room(s) go to their room's General group.",
			shutters_none: "No cover found in these rooms.",
			not_a_shutter: "{type} — not a shutter?",
			dc_garage: "Garage door",
			dc_gate: "Gate",
			dc_door: "Door",
			dc_window: "Window",
			dc_awning: "Awning",
			dc_damper: "Damper",
			models_intro: "Shutter models: Homex creates a preset per model so a single button can open, close and stop (smart toggle).",
			model_existing: "Existing preset: {name}.",
			model_z2m: "Detected: Zigbee2MQTT motion field “{field}”.",
			model_cover: "Detected from the shutter's state (opening / closing).",
			smart_toggle: "Smart toggle",
			smart_hint: "Smart toggle: a press stops a moving shutter, otherwise moves it the other way. Without it, a press only opens or closes. Presets stay editable in the Shutter Manager.",
			options_hint: "Rooms are created without any module; each import turns on the matching module. Everything stays editable afterwards."
		},
		fr: {
			title: "Assistant de configuration Homex",
			subtitle: "Configurons ta maison, pièce par pièce.",
			step_rooms: "Pièces",
			rooms_intro: "Homex fonctionne pièce par pièce. Pars des pièces que tu as déjà dans Home Assistant, ou crée ta première pièce.",
			import_title: "Importer les pièces de Home Assistant",
			import_text: "{count} pièce(s) trouvée(s). Choisis celles à reprendre dans Homex.",
			import_none: "Plus aucune pièce Home Assistant à importer.",
			create_title: "Créer une pièce",
			create_text: "Pars d'une pièce vide et nomme-la toi-même.",
			import_pick: "Coche les pièces à importer dans Homex. Tu pourras en ajouter ou en retirer plus tard.",
			select_all: "Toutes",
			select_none: "Aucune",
			no_floor: "Sans étage",
			already_imported: "Déjà dans Homex",
			device_one: "1 appareil",
			device_other: "{count} appareils",
			back: "Retour",
			import_button_one: "Importer 1 pièce",
			import_button_other: "Importer {count} pièces",
			importing: "Import en cours…",
			done_one: "1 pièce importée.",
			done_other: "{count} pièces importées.",
			continue: "Continuer",
			step_switches: "Interrupteurs",
			switches_intro: "Place aux interrupteurs muraux et télécommandes. Homex les décrit en trois niveaux :",
			concept_layout: "Layout",
			concept_layout_text: "La forme d'un interrupteur : combien de boutons, et où.",
			concept_preset: "Preset",
			concept_preset_text: "Un par modèle : quelle action de l'appareil envoie chaque bouton et chaque appui (simple, double, long). Tous les interrupteurs de ce modèle le réutilisent.",
			concept_switch: "Interrupteur",
			concept_switch_text: "Chaque appareil : ses pièces, et ce que fait chaque bouton dans ces pièces.",
			switches_found: "{devices} interrupteur(s) de {models} modèle(s) trouvé(s) dans tes pièces. Homex peut préparer leurs presets maintenant.",
			switches_none: "Aucun interrupteur ni télécommande trouvé dans ces pièces.",
			skip: "Passer cette étape",
			configure_switches: "Configurer les interrupteurs",
			switches_pick: "Homex a lu les actions de chaque modèle et propose son layout et son preset. Coche ceux à créer.",
			preset_existing: "Preset existant : {name}.",
			actions_unknown: "Actions non reconnues : configure son preset dans la Gestion des interrupteurs.",
			create_preset: "Créer le preset",
			presets_hint: "Les presets restent modifiables dans la Gestion des interrupteurs (layout, appuis, actions). L'affectation de chaque interrupteur à ses pièces vient ensuite.",
			create_presets_one: "Créer 1 preset",
			create_presets_other: "Créer {count} presets",
			presets_done_one: "1 preset d'interrupteur créé.",
			presets_done_other: "{count} presets d'interrupteurs créés.",
			btn_main: "bouton",
			btn_left: "gauche",
			btn_right: "droite",
			btn_on: "on",
			btn_n: "bouton {n}",
			btn_off: "off",
			btn_up: "haut",
			btn_down: "bas",
			btn_arrow_left: "flèche gauche",
			btn_arrow_right: "flèche droite",
			tap_single: "simple",
			tap_double: "double",
			tap_long: "long",
			next: "Suivant",
			options_intro: "Que doit importer Homex avec ces {count} pièce(s) ?",
			lights_title: "Importer les lumières",
			lights_desc: "Active le module Lumières et ajoute les {lights} lumière(s) de {rooms} pièce(s).",
			lights_none: "Aucune lumière trouvée dans ces pièces.",
			shutters_title: "Importer les volets",
			shutters_desc: "Active le module Volets : {checked} des {total} volet(s) de {rooms} pièce(s) vont dans le groupe Général de leur pièce.",
			shutters_none: "Aucun volet trouvé dans ces pièces.",
			not_a_shutter: "{type} — pas un volet ?",
			dc_garage: "Porte de garage",
			dc_gate: "Portail",
			dc_door: "Porte",
			dc_window: "Fenêtre",
			dc_awning: "Store banne",
			dc_damper: "Clapet",
			models_intro: "Modèles de volets : Homex crée un preset par modèle pour qu'un seul bouton ouvre, ferme et arrête (basculement intelligent).",
			model_existing: "Preset existant : {name}.",
			model_z2m: "Détecté : champ de mouvement Zigbee2MQTT « {field} ».",
			model_cover: "Détecté via l'état du volet (ouverture / fermeture).",
			smart_toggle: "Basculement intelligent",
			smart_hint: "Basculement intelligent : un appui arrête un volet en mouvement, sinon le fait repartir dans l'autre sens. Sans lui, un appui ne fait qu'ouvrir ou fermer. Les presets restent modifiables dans la Gestion des volets.",
			options_hint: "Les pièces sont créées sans aucun module ; chaque import active le module correspondant. Tout reste modifiable ensuite."
		}
	},
	shutterControlDialog: {
		en: {
			heading: "Shutters · {room}",
			avg_position: "Average position: {position} %",
			open: "Open",
			stop: "Stop",
			close: "Close",
			done: "Done"
		},
		fr: {
			heading: "Volets · {room}",
			avg_position: "Position moyenne : {position} %",
			open: "Ouvrir",
			stop: "Stop",
			close: "Fermer",
			done: "Terminé"
		}
	},
	shutterGroupDialog: {
		en: {
			name_required: "Group name is required.",
			confirm_delete: "Delete shutter group \"{name}\"?",
			edit_heading: "Edit shutter group",
			new_heading: "New shutter group",
			name: "Name",
			name_placeholder: "Living room",
			covers: "Shutters (cover entities)",
			triggers: "Group triggers",
			triggers_hint: "Each trigger drives the shutters of this group.",
			toggle: "Toggle (open / close)",
			open: "Open",
			close: "Close",
			stop: "Stop",
			create_group: "Create group"
		},
		fr: {
			name_required: "Nom du groupe requis.",
			confirm_delete: "Supprimer le groupe de volets \"{name}\" ?",
			edit_heading: "Modifier le groupe de volets",
			new_heading: "Nouveau groupe de volets",
			name: "Nom",
			name_placeholder: "Salon",
			covers: "Volets (entités cover)",
			triggers: "Déclencheurs du groupe",
			triggers_hint: "Chaque déclencheur pilote les volets de ce groupe.",
			toggle: "Permuter (ouvrir / fermer)",
			open: "Ouvrir",
			close: "Fermer",
			stop: "Stop",
			create_group: "Créer le groupe"
		}
	},
	shutterManager: {
		en: {
			presets: "Presets",
			not_found: "“{id}” not found.",
			edit_preset: "Edit preset",
			new_preset: "New shutter device preset",
			title: "Shutter Manager",
			add_preset: "＋ Preset",
			no_presets: "No shutter device presets yet. Click “＋ Preset” to define how a shutter model is driven.",
			smart_toggle: " · smart toggle"
		},
		fr: {
			presets: "Presets",
			not_found: "« {id} » introuvable.",
			edit_preset: "Modifier le preset",
			new_preset: "Nouveau shutter device preset",
			title: "Gestion des volets",
			add_preset: "＋ Preset",
			no_presets: "Aucun shutter device preset. Clique sur « ＋ Preset » pour définir le pilotage d'un modèle de volet.",
			smart_toggle: " · permutation intelligente"
		}
	},
	shutterPresetEditor: {
		en: {
			field_placeholder: "field, e.g. motor_run_status",
			z2m_field: "Zigbee2MQTT field…",
			sensor: "Sensor…",
			source_ha: "HA sensor",
			source_z2m: "Zigbee2MQTT state",
			source_cover: "Cover state",
			cover_state: "State of the cover entity (a|b matches either)",
			value: "value",
			z2m_no_state: "No state received from Zigbee2MQTT for this device yet (it is published on every change: move the shutter, then reopen this preset to see the list of fields), or type the field name.",
			name_id_required: "Preset name and id are required.",
			choose_model_device: "Choose a model and a reference device.",
			confirm_delete: "Delete preset \"{name}\"?",
			name: "Preset name",
			name_placeholder: "Living room shutter",
			id: "Id: {id}",
			shutter_model: "Shutter model",
			choose_model: "Choose a model…",
			devices_count: "{count} device(s)",
			no_shutters: "No shutter (device with a cover entity) detected.",
			ref_device: "Reference device",
			ref_device_hint: "Sensors/actions are taken from this device.",
			smart_toggle: "Enable smart toggle",
			smart_toggle_hint: "When enabled, tell how to detect the shutter's state: a Home Assistant sensor, or a field of the device's Zigbee2MQTT state (e.g. motor_run_status), with a specific value. “Toggle” then stops a moving shutter, and restarts a stopped shutter in the opposite direction of its last movement.",
			up_title: "Rising (shutter moving up)",
			up_hint: "The shutter is rising when this sensor equals:",
			down_title: "Lowering (shutter moving down)",
			down_hint: "The shutter is lowering when this sensor equals:",
			stopped_title: "Stopped (shutter not moving)",
			stopped_hint: "The shutter is stopped when this sensor equals:",
			create_preset: "Create preset"
		},
		fr: {
			field_placeholder: "champ, ex. motor_run_status",
			z2m_field: "Champ Zigbee2MQTT…",
			sensor: "Capteur…",
			source_ha: "Capteur HA",
			source_z2m: "État Zigbee2MQTT",
			source_cover: "État du volet",
			cover_state: "État de l'entité volet (a|b : l'une ou l'autre)",
			value: "valeur",
			z2m_no_state: "Aucun état reçu de Zigbee2MQTT pour cet appareil pour l'instant (il est publié à chaque changement : bouge le volet puis rouvre ce preset pour voir la liste des champs), ou saisis le nom du champ.",
			name_id_required: "Nom et id du preset requis.",
			choose_model_device: "Choisis un modèle et un device de référence.",
			confirm_delete: "Supprimer le preset \"{name}\" ?",
			name: "Nom du preset",
			name_placeholder: "Volet salon",
			id: "Id : {id}",
			shutter_model: "Modèle de volet",
			choose_model: "Choisir un modèle…",
			devices_count: "{count} appareil(s)",
			no_shutters: "Aucun volet (device avec entité cover) détecté.",
			ref_device: "Device de référence",
			ref_device_hint: "Les capteurs/actions sont tirés de ce device.",
			smart_toggle: "Implémenter la permutation intelligente",
			smart_toggle_hint: "Si activée, indique comment détecter l'état du volet : un capteur Home Assistant, ou un champ de l'état Zigbee2MQTT de l'appareil (ex. motor_run_status), avec une valeur précise. « Permuter » arrête alors un volet en mouvement, et relance un volet arrêté dans le sens inverse de son dernier mouvement.",
			up_title: "Montée (volet en mouvement vers le haut)",
			up_hint: "Le volet est en train de monter quand ce capteur vaut :",
			down_title: "Descente (volet en mouvement vers le bas)",
			down_hint: "Le volet est en train de descendre quand ce capteur vaut :",
			stopped_title: "Arrêt (volet à l'arrêt)",
			stopped_hint: "Le volet est à l'arrêt quand ce capteur vaut :",
			create_preset: "Créer le preset"
		}
	},
	switchManager: {
		en: {
			not_found: "“{id}” not found.",
			layouts: "Layouts",
			presets: "Presets",
			switches: "Switches",
			edit_layout: "Edit layout",
			new_layout: "New layout",
			edit_preset: "Edit preset",
			new_preset: "New device preset",
			edit_switch: "Edit switch",
			new_switch: "New switch",
			add_layout: "＋ Layout",
			add_preset: "＋ Preset",
			add_switch: "＋ Switch",
			title: "Switch Manager",
			no_layouts: "No layouts yet. Click “＋ Layout”.",
			layout_meta: "{count} button(s) · {shape}",
			shape_round: "round",
			shape_square: "square",
			shape_vrect: "vertical rect.",
			no_presets: "No presets yet. Click “＋ Preset” to define the standard mapping of a device model.",
			no_switches: "No switches yet. Click “＋ Switch”.",
			no_preset: "no preset",
			rooms_count: "{count} room(s)"
		},
		fr: {
			not_found: "« {id} » introuvable.",
			layouts: "Layouts",
			presets: "Presets",
			switches: "Interrupteurs",
			edit_layout: "Modifier le layout",
			new_layout: "Nouveau layout",
			edit_preset: "Modifier le preset",
			new_preset: "Nouveau device preset",
			edit_switch: "Modifier le switch",
			new_switch: "Nouveau switch",
			add_layout: "＋ Layout",
			add_preset: "＋ Preset",
			add_switch: "＋ Switch",
			title: "Gestion des interrupteurs",
			no_layouts: "Aucun layout. Clique sur « ＋ Layout ».",
			layout_meta: "{count} bouton(s) · {shape}",
			shape_round: "rond",
			shape_square: "carré",
			shape_vrect: "rect. vertical",
			no_presets: "Aucun preset. Clique sur « ＋ Preset » pour définir le mapping standard d'un modèle d'appareil.",
			no_switches: "Aucun switch. Clique sur « ＋ Switch ».",
			no_preset: "aucun preset",
			rooms_count: "{count} pièce(s)"
		}
	},
	switchMapping: {
		en: {
			module_lights: "💡 Lights",
			module_shutters: "🪟 Shutters",
			module_heating: "🔥 Climate",
			tap_single: "Single",
			tap_double: "Double",
			tap_long: "Long",
			toggle_room: "Toggle room (on / off)",
			toggle_short: "Toggle",
			scene_next: "Next scene",
			scene_next_short: "Scene →",
			dim_up: "Dimmer +",
			dim_up_short: "Dim +",
			dim_down: "Dimmer −",
			dim_down_short: "Dim −",
			group: "Group: {name}",
			scene: "Scene: {name}",
			shutter_toggle: "{name} — Toggle",
			shutter_open: "{name} — Open",
			shutter_close: "{name} — Close",
			shutter_stop: "{name} — Stop",
			heating_next: "Heating — next mode",
			heating_next_short: "Mode →",
			heating_mode: "Heating — {name}",
			layout_not_found: "Layout not found for this model.",
			invisible_buttons: "Invisible buttons",
			heading: "Assignments — {name}",
			homex_actions: "Homex actions",
			no_rooms: "No room associated with this switch.",
			no_actions: "No actions available: the associated rooms have no active module (e.g. Lights).",
			hint: "Drag an action onto a button of the canvas (or tap an action, then a button). Tap an assigned button to clear it.",
			no_tap_modes: "No tap mode configured on this preset."
		},
		fr: {
			module_lights: "💡 Lumières",
			module_shutters: "🪟 Volets",
			module_heating: "🔥 Climat",
			tap_single: "Simple",
			tap_double: "Double",
			tap_long: "Long",
			toggle_room: "Toggle pièce (on / off)",
			toggle_short: "Toggle",
			scene_next: "Changement de scène",
			scene_next_short: "Scène →",
			dim_up: "Dimmer +",
			dim_up_short: "Dim +",
			dim_down: "Dimmer −",
			dim_down_short: "Dim −",
			group: "Groupe : {name}",
			scene: "Scène : {name}",
			shutter_toggle: "{name} — Permuter",
			shutter_open: "{name} — Ouvrir",
			shutter_close: "{name} — Fermer",
			shutter_stop: "{name} — Stop",
			heating_next: "Chauffage — mode suivant",
			heating_next_short: "Mode →",
			heating_mode: "Chauffage — {name}",
			layout_not_found: "Layout introuvable pour ce modèle.",
			invisible_buttons: "Boutons invisibles",
			heading: "Assignations — {name}",
			homex_actions: "Actions Homex",
			no_rooms: "Aucune pièce associée à cet interrupteur.",
			no_actions: "Aucune action disponible : les pièces associées n'ont aucun module actif (ex. Lumières).",
			hint: "Glisse une action sur un bouton du canvas (ou touche une action puis un bouton). Touche un bouton assigné pour le vider.",
			no_tap_modes: "Aucun tap mode configuré sur ce preset."
		}
	},
	triggerSelector: {
		en: {
			select_entity: "Select an entity",
			type: "Type",
			type_state: "State",
			type_numeric: "Numeric state",
			attribute: "Attribute (optional)",
			attribute_none: "(entity state)",
			for: "For (optional)",
			above: "Above (optional)",
			below: "Below (optional)",
			from: "From (optional)",
			to: "To (optional)",
			select_action: "Select an action",
			device: "Device",
			entity: "Entity",
			action: "Action",
			add_trigger: "Add trigger"
		},
		fr: {
			select_entity: "Sélectionnez une entité",
			type: "Type",
			type_state: "État",
			type_numeric: "État numérique",
			attribute: "Attribut (facultatif)",
			attribute_none: "(état de l'entité)",
			for: "Pendant (facultatif)",
			above: "Au-dessus de (facultatif)",
			below: "En-dessous de (facultatif)",
			from: "De (facultatif)",
			to: "À (facultatif)",
			select_action: "Sélectionnez une action",
			device: "Appareil",
			entity: "Entité",
			action: "Action",
			add_trigger: "Ajouter un déclencheur"
		}
	},
	triggersDialog: {
		en: {
			heading: "Room triggers",
			toggle_title: "Toggle triggers (turn on / off)",
			toggle_hint: "Each trigger toggles the room on/off.",
			scene_title: "Scene switching triggers",
			scene_hint: "Each trigger moves to the next scene (cycle).",
			scene_strategy_hint: "The strategy (start over / last used) is set in “Edit room”.",
			dim_up_title: "Dimmer + (raise brightness)",
			dim_up_hint: "Each trigger adds 20 to the brightness of the room's lights.",
			dim_down_title: "Dimmer − (lower brightness)",
			dim_down_hint: "Each trigger removes 20 from the brightness of the room's lights."
		},
		fr: {
			heading: "Déclencheurs de la pièce",
			toggle_title: "Déclencheurs allumer / éteindre",
			toggle_hint: "Chaque déclenchement permute l'état on/off de la pièce.",
			scene_title: "Déclencheurs de changement de scène",
			scene_hint: "Chaque déclenchement passe à la scène suivante (cycle).",
			scene_strategy_hint: "La stratégie (repart de zéro / dernière utilisée) se règle dans « Modifier la pièce ».",
			dim_up_title: "Dimmer + (monter la luminosité)",
			dim_up_hint: "Chaque déclenchement ajoute 20 à la luminosité des lumières de la pièce.",
			dim_down_title: "Dimmer − (baisser la luminosité)",
			dim_down_hint: "Chaque déclenchement retire 20 à la luminosité des lumières de la pièce."
		}
	},
	unitControls: {
		en: {
			lit_scene_turn_off: "On · {scene} — turn off",
			lit_turn_off: "On — turn off",
			stray_turn_on: "Off, but at least one light is on — turn on",
			turn_on: "Turn on"
		},
		fr: {
			lit_scene_turn_off: "Allumée · {scene} — éteindre",
			lit_turn_off: "Allumée — éteindre",
			stray_turn_on: "Éteinte, mais au moins une lumière est allumée — allumer",
			turn_on: "Allumer"
		}
	},
	cardRoomTile: {
		en: {
			config_required: "homex-room-tile: configuration required",
			room_unheated: "Room not heated",
			room_heated: "Room heated",
			heating: "Heating",
			no_demand: "No heating demand",
			shutters_closed: "Shutters closed",
			shutters_open: "Shutters open",
			shutters_partial: "Shutters {pos} % open",
			choose_room: "Choose a Homex room",
			not_found: "Not found",
			unavailable: "Unavailable",
			heated_toggle: "Room heated — stop heating",
			unheated_toggle: "Room not heated — heat",
			lit_toggle: "On — turn off",
			stray_toggle: "Off, but at least one light is on — turn on",
			off_toggle: "Off — turn on",
			setpoint: "Setpoint {value} °C",
			metric_title: "{label}: {value} {unit}",
			room_status: "Room status",
			scenes: "Scenes",
			level_good: "Good",
			level_fair: "Fair",
			level_poor: "Poor",
			card_name: "Homex – Room",
			card_description: "The room's lights and scenes, climate, heating and Homex shutters (details on tapping the right part)."
		},
		fr: {
			config_required: "homex-room-tile: configuration requise",
			room_unheated: "Pièce non chauffée",
			room_heated: "Pièce chauffée",
			heating: "En chauffe",
			no_demand: "Pas de demande de chauffe",
			shutters_closed: "Volets fermés",
			shutters_open: "Volets ouverts",
			shutters_partial: "Volets ouverts à {pos} %",
			choose_room: "Choisir une pièce Homex",
			not_found: "Introuvable",
			unavailable: "Indisponible",
			heated_toggle: "Pièce chauffée — ne plus chauffer",
			unheated_toggle: "Pièce non chauffée — chauffer",
			lit_toggle: "Allumée — éteindre",
			stray_toggle: "Éteinte, mais au moins une lumière est allumée — allumer",
			off_toggle: "Éteinte — allumer",
			setpoint: "Consigne {value} °C",
			metric_title: "{label} : {value} {unit}",
			room_status: "État de la pièce",
			scenes: "Scènes",
			level_good: "Bon",
			level_fair: "Moyen",
			level_poor: "Mauvais",
			card_name: "Homex – Pièce",
			card_description: "Lumières de la pièce et ses scènes, climat, chauffage et volets Homex (détail au clic sur la partie droite)."
		}
	},
	cardRoomDetail: {
		en: {
			previous: "Previous shutter",
			next: "Next shutter",
			temperature: "Temperature",
			humidity: "Humidity",
			climate: "Climate",
			off: "Off",
			heating: "Heating",
			idle: "Idle",
			section_heating: "Heating",
			stop_heating_room: "Stop heating the room",
			heat_room: "Heat the room",
			room_heated: "Room heated",
			room_unheated: "Room not heated",
			setpoint_kept: "Kept until the next mode change",
			setpoint: "Setpoint",
			raise: "Raise",
			lower: "Lower",
			mode: "{name} mode",
			global_off: " · global heating off",
			opening: "Opening",
			closing: "Closing",
			closed: "Closed",
			open: "Open",
			partial: "Partly open · {pos} %",
			all: "All",
			shutter_n: "Shutter {n}",
			shutters: "Shutters",
			open_action: "Open",
			stop_action: "Stop",
			close_action: "Close",
			no_data: "No climate, heating or shutter data for this room."
		},
		fr: {
			previous: "Volet précédent",
			next: "Volet suivant",
			temperature: "Température",
			humidity: "Humidité",
			climate: "Climat",
			off: "Éteint",
			heating: "En chauffe",
			idle: "Inactif",
			section_heating: "Chauffage",
			stop_heating_room: "Ne plus chauffer la pièce",
			heat_room: "Chauffer la pièce",
			room_heated: "Pièce chauffée",
			room_unheated: "Pièce non chauffée",
			setpoint_kept: "Gardée jusqu'au prochain changement de mode",
			setpoint: "Consigne",
			raise: "Monter",
			lower: "Baisser",
			mode: "Mode {name}",
			global_off: " · chauffage global coupé",
			opening: "Ouverture",
			closing: "Fermeture",
			closed: "Fermé",
			open: "Ouvert",
			partial: "Entrouvert · {pos} %",
			all: "Tous",
			shutter_n: "Volet {n}",
			shutters: "Volets",
			open_action: "Ouvrir",
			stop_action: "Stop",
			close_action: "Fermer",
			no_data: "Aucune donnée de climat, de chauffage ni de volet pour cette pièce."
		}
	},
	cardRoomTileEditor: {
		en: {
			color_red: "Red",
			color_pink: "Pink",
			color_purple: "Purple",
			color_deep_purple: "Deep purple",
			color_indigo: "Indigo",
			color_blue: "Blue",
			color_light_blue: "Light blue",
			color_cyan: "Cyan",
			color_teal: "Teal",
			color_green: "Green",
			color_light_green: "Light green",
			color_lime: "Lime",
			color_yellow: "Yellow",
			color_amber: "Amber",
			color_orange: "Orange",
			color_deep_orange: "Deep orange",
			color_brown: "Brown",
			color_grey: "Grey",
			color_blue_grey: "Blue grey",
			lights: "Lights",
			heating: "Heating",
			room: "Homex room",
			variant: "Variant",
			variant_default: "Default — lights, air quality, shutters, scenes",
			variant_climate: "Climate — heating and setpoint",
			tile_switch: "Tile switch",
			name: "Name (optional)",
			active_color: "Active colour",
			color_default: "Default ({color})",
			color_default_heating: "heating orange",
			color_default_lights: "lights amber",
			color_custom: "Custom…",
			toggle_heating: "Turn heating on / off on tap",
			toggle_lights: "Turn on / off on tap",
			show_scenes: "Show scenes",
			scenes_hint: "Widget scenes — uncheck to hide, label optional",
			remove_scene: "Remove from the widget",
			add_scene: "Add to the widget"
		},
		fr: {
			color_red: "Rouge",
			color_pink: "Rose",
			color_purple: "Violet",
			color_deep_purple: "Violet foncé",
			color_indigo: "Indigo",
			color_blue: "Bleu",
			color_light_blue: "Bleu clair",
			color_cyan: "Cyan",
			color_teal: "Sarcelle",
			color_green: "Vert",
			color_light_green: "Vert clair",
			color_lime: "Citron vert",
			color_yellow: "Jaune",
			color_amber: "Ambre",
			color_orange: "Orange",
			color_deep_orange: "Orange foncé",
			color_brown: "Marron",
			color_grey: "Gris",
			color_blue_grey: "Gris bleu",
			lights: "Lumières",
			heating: "Chauffage",
			room: "Pièce Homex",
			variant: "Variante",
			variant_default: "Défaut — lumières, qualité de l'air, volets, scènes",
			variant_climate: "Climat — chauffage et consigne",
			tile_switch: "Interrupteur de la tuile",
			name: "Nom (optionnel)",
			active_color: "Couleur active",
			color_default: "Défaut ({color})",
			color_default_heating: "orange chauffage",
			color_default_lights: "ambre lumières",
			color_custom: "Personnalisée…",
			toggle_heating: "Activer / désactiver le chauffage au clic",
			toggle_lights: "Allumer / éteindre au clic",
			show_scenes: "Afficher les scènes",
			scenes_hint: "Scènes du widget — décocher pour masquer, libellé facultatif",
			remove_scene: "Retirer du widget",
			add_scene: "Ajouter au widget"
		}
	},
	lib: {
		en: {
			unknown_model: "unknown model",
			stuck_warning: "Heating while the temperature is above the setpoint: {names}. Valve stuck open or state not refreshed — check the radiator.",
			unheated: "Unheated",
			shutter_open: "Open",
			shutter_closed: "Closed",
			shutter_partial: "Partly open",
			shutter_opening: "Opening…",
			shutter_closing: "Closing…",
			shutter_unavailable: "Unavailable"
		},
		fr: {
			unknown_model: "modèle inconnu",
			stuck_warning: "Chauffe alors que la température dépasse la consigne : {names}. Vanne bloquée ouverte ou état non rafraîchi — vérifie le radiateur.",
			unheated: "Non chauffé",
			shutter_open: "Ouvert",
			shutter_closed: "Fermé",
			shutter_partial: "Entrouvert",
			shutter_opening: "Ouverture…",
			shutter_closing: "Fermeture…",
			shutter_unavailable: "Indisponible"
		}
	}
}, V = ["en", "fr"], H = {
	en: {},
	fr: {}
};
for (let [e, t] of Object.entries(Me)) for (let n of V) for (let [r, i] of Object.entries(t[n] ?? {})) H[n][`${e}.${r}`] = i;
var U = "auto", W, G = "en", K = /* @__PURE__ */ new Set();
function Ne(e) {
	return K.add(e), () => K.delete(e);
}
function Pe(e) {
	let t = (e || "").toLowerCase().split(/[-_]/)[0];
	return V.includes(t) ? t : void 0;
}
function Fe() {
	let e = (U === "auto" ? Pe(W) : U) ?? "en";
	e !== G && (G = e, document.documentElement.dispatchEvent(new CustomEvent("homex-language-changed")), K.forEach((e) => e()));
}
function Ie(e) {
	let t = e?.locale?.language || e?.language;
	t && t !== W && (W = t, Fe());
}
function Le(e) {
	U = e && (e === "auto" || Pe(e)) ? e : "auto", Fe();
}
var Re = () => U, ze = () => G, Be = {}, Ve = !1, He = (e) => !!Be[e], Ue = () => Ve, q;
function We(e) {
	return Ie(e), q ??= e.connection.sendMessagePromise({ type: "homex/settings/get" }).then((e) => {
		Be = e.features ?? {}, Ve = !0, Le(e.language);
	}).catch(() => {
		q = void 0;
	}), q;
}
function Ge(e, t) {
	let n = H[G][e] ?? H.en[e] ?? e;
	return t && (n = n.replace(/\{(\w+)\}/g, (e, n) => n in t ? String(t[n]) : e)), n;
}
var Ke = () => G;
// \0@oxc-project+runtime@0.156.0/helpers/esm/decorate.js
function qe(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
var J = (e, t) => Math.hypot(e[0] - t[0], e[1] - t[1]), Y = (e, t) => Math.round(e / t) * t;
function X(e, t, n) {
	let r = n[0] - t[0], i = n[1] - t[1], a = r * r + i * i;
	if (!a) return t;
	let o = Math.max(0, Math.min(1, ((e[0] - t[0]) * r + (e[1] - t[1]) * i) / a));
	return [t[0] + o * r, t[1] + o * i];
}
function Je(e, t) {
	let n = t.tolerance, r = t.grid ?? 50, i = null, a = n;
	for (let n of t.vertices) {
		let t = J(e, n);
		t <= a && (i = n, a = t);
	}
	if (i) return {
		p: [i[0], i[1]],
		kind: "vertex"
	};
	let o = null, s = n * .75, c = null;
	for (let n of t.edges) {
		let t = X(e, n[0], n[1]), r = J(e, t);
		r <= s && (o = t, s = r, c = n);
	}
	if (o && c) {
		if (c[0][0] === c[1][0]) {
			let e = Y(o[1], r), [t, n] = [Math.min(c[0][1], c[1][1]), Math.max(c[0][1], c[1][1])];
			return {
				p: [c[0][0], Math.max(t, Math.min(n, e))],
				kind: "edge"
			};
		}
		if (c[0][1] === c[1][1]) {
			let e = Y(o[0], r), [t, n] = [Math.min(c[0][0], c[1][0]), Math.max(c[0][0], c[1][0])];
			return {
				p: [Math.max(t, Math.min(n, e)), c[0][1]],
				kind: "edge"
			};
		}
		return {
			p: o,
			kind: "edge"
		};
	}
	let l = Y(e[0], r), u = Y(e[1], r), d, f, p = n, m = n, h = Math.tan(8 * Math.PI / 180);
	for (let r of t.anchors ?? []) {
		let t = Math.abs(e[0] - r[0]), i = Math.abs(e[1] - r[1]);
		i <= Math.max(n, t * h) && i < m + n && (u = r[1], f = r[1], m = 0), t <= Math.max(n, i * h) && t < p + n && (l = r[0], d = r[0], p = 0);
	}
	for (let n of t.vertices) {
		let t = Math.abs(e[0] - n[0]);
		t <= p && (p = t, l = n[0], d = n[0]);
		let r = Math.abs(e[1] - n[1]);
		r <= m && (m = r, u = n[1], f = n[1]);
	}
	return {
		p: [l, u],
		kind: d !== void 0 || f !== void 0 ? "align" : "grid",
		guideX: d,
		guideY: f
	};
}
function Ye(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) {
		let [r, i] = e[n], [a, o] = e[(n + 1) % e.length];
		t += r * o - a * i;
	}
	return Math.abs(t) / 2 / 1e4;
}
function Xe(e) {
	let t = 0, n = 0, r = 0;
	for (let i = 0; i < e.length; i++) {
		let [a, o] = e[i], [s, c] = e[(i + 1) % e.length], l = a * c - s * o;
		t += l, n += (a + s) * l, r += (o + c) * l;
	}
	if (Math.abs(t) < 1e-6) {
		let t = e.length || 1;
		return [e.reduce((e, t) => e + t[0], 0) / t, e.reduce((e, t) => e + t[1], 0) / t];
	}
	return [n / (3 * t), r / (3 * t)];
}
function Ze(e, t) {
	let n = !1;
	for (let r = 0, i = t.length - 1; r < t.length; i = r++) {
		let [a, o] = t[r], [s, c] = t[i];
		o > e[1] != c > e[1] && e[0] < (s - a) * (e[1] - o) / (c - o) + a && (n = !n);
	}
	return n;
}
function Qe(e) {
	return e.map((t, n) => [t, e[(n + 1) % e.length]]);
}
function $e(e) {
	return e.length ? {
		minX: Math.min(...e.map((e) => e[0])),
		minY: Math.min(...e.map((e) => e[1])),
		maxX: Math.max(...e.map((e) => e[0])),
		maxY: Math.max(...e.map((e) => e[1]))
	} : null;
}
function et(e, t) {
	return `${(e / 100).toLocaleString(t, { maximumFractionDigits: 2 })} m`;
}
var Z = (e, t) => J(e, t), tt = (e) => `${e}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, nt = {
	door: 90,
	sliding_door: 90,
	window: 120,
	glass_door: 240,
	opening: 120
}, rt = (e, t, n) => {
	let r = e.rooms.find((e) => e.id === t);
	return !r || n < 0 || n >= r.points.length ? null : [r.points[n], r.points[(n + 1) % r.points.length]];
};
function it(e, t) {
	let n = rt(e, t.shape, t.edge);
	if (!n) return null;
	let [r, i] = n, a = Z(r, i);
	if (!a) return null;
	let o = [(i[0] - r[0]) / a, (i[1] - r[1]) / a], s = [r[0] + (i[0] - r[0]) * t.t, r[1] + (i[1] - r[1]) * t.t], c = Math.min(t.width, a) / 2, l = [s[0] - o[0] * c, s[1] - o[1] * c], u = [s[0] + o[0] * c, s[1] + o[1] * c], d = e.rooms.find((e) => e.id === t.shape), f = [-o[1], o[0]];
	return at([s[0] + f[0] * 5, s[1] + f[1] * 5], d.points) || (f = [o[1], -o[0]]), {
		a: l,
		b: u,
		c: s,
		u: o,
		n: f
	};
}
function at(e, t) {
	let n = !1;
	for (let r = 0, i = t.length - 1; r < t.length; i = r++) {
		let [a, o] = t[r], [s, c] = t[i];
		o > e[1] != c > e[1] && e[0] < (s - a) * (e[1] - o) / (c - o) + a && (n = !n);
	}
	return n;
}
function ot(e, t, n, r) {
	let i = null;
	for (let a of e.rooms) a.points.forEach((e, o) => {
		let s = a.points[(o + 1) % a.points.length], c = X(t, e, s), l = Z(t, c), u = Z(e, s);
		if (l > n || !u || i && l >= i.dist) return;
		let d = Y(Z(e, c), 10), f = Math.min(r, u) / 2;
		d = Math.max(f, Math.min(u - f, d)), i = {
			shape: a.id,
			edge: o,
			t: d / u,
			len: u,
			dist: l
		};
	});
	return i;
}
function st(e, t, n, r) {
	for (let i of e.openings ?? []) i.shape === t && (i.edge > n ? i.edge += 1 : i.edge === n && (i.t < r ? i.t /= r : (i.edge += 1, i.t = (i.t - r) / (1 - r))));
}
function ct(e, t, n, r, i, a) {
	let o = (n + r - 1) % r, s = n === 0 ? r - 2 : n - 1;
	for (let r of e.openings ?? []) r.shape === t && (r.edge === o ? (r.t = r.t * i / (i + a), r.edge = s) : r.edge === n ? (r.t = (i + r.t * a) / (i + a), r.edge = s) : (n === 0 || r.edge > n) && --r.edge);
}
function lt(e) {
	return [
		[e.x, e.y],
		[e.x + e.w, e.y],
		[e.x + e.w, e.y + e.h],
		[e.x, e.y + e.h]
	];
}
function ut(e) {
	let t = e.dir === "up" || e.dir === "down", n = t ? e.h : e.w, r = Math.max(2, Math.round(n / 25)), i = [];
	for (let n = 1; n < r; n++) {
		let a = n / r;
		i.push(t ? [[e.x, e.y + e.h * a], [e.x + e.w, e.y + e.h * a]] : [[e.x + e.w * a, e.y], [e.x + e.w * a, e.y + e.h]]);
	}
	return i;
}
function dt(e) {
	let t = e.x + e.w / 2, n = e.y + e.h / 2, r = .12;
	switch (e.dir) {
		case "up": return [[t, e.y + e.h * .88], [t, e.y + e.h * r]];
		case "down": return [[t, e.y + e.h * r], [t, e.y + e.h * .88]];
		case "left": return [[e.x + e.w * .88, n], [e.x + e.w * r, n]];
		default: return [[e.x + e.w * r, n], [e.x + e.w * .88, n]];
	}
}
var ft = {
	up: "right",
	right: "down",
	down: "left",
	left: "up"
}, pt = [
	[!1, !1],
	[!0, !1],
	[!0, !0],
	[!1, !0]
];
function mt(e, t) {
	let [n, r] = pt[(pt.findIndex(([t, n]) => t === !!e.flip && n === !!e.out) + t + 4) % 4];
	e.flip = n, e.out = r;
}
var ht = {
	up: "down",
	down: "up",
	left: "right",
	right: "left"
};
function gt(e, t, n, r) {
	let i = null;
	for (let a of e.rooms) a.points.forEach((e, o) => {
		let s = a.points[(o + 1) % a.points.length], c = Z(e, s);
		if (!c) return;
		let l = X(t, e, s), u = Z(t, l);
		if (u > n || i && u >= i.d) return;
		let d = [(s[0] - e[0]) / c, (s[1] - e[1]) / c], f = Math.min(r, c) / 2, p = Math.max(f, Math.min(c - f, Y(Z(e, l), 10))), m = [e[0] + d[0] * p, e[1] + d[1] * p], h = [-d[1], d[0]];
		at([m[0] + h[0] * 5, m[1] + h[1] * 5], a.points) || (h = [d[1], -d[0]]), i = {
			x: m[0] + h[0] * 9,
			y: m[1] + h[1] * 9,
			angle: Math.atan2(d[1], d[0]) * 180 / Math.PI,
			d: u
		};
	});
	if (!i) return null;
	let { x: a, y: o, angle: s } = i;
	return {
		x: a,
		y: o,
		angle: s
	};
}
function _t(e) {
	let t = e.angle * Math.PI / 180, n = [Math.cos(t), Math.sin(t)], r = [-n[1], n[0]], i = e.length / 2;
	return [
		[e.x - n[0] * i - r[0] * 5, e.y - n[1] * i - r[1] * 5],
		[e.x + n[0] * i - r[0] * 5, e.y + n[1] * i - r[1] * 5],
		[e.x + n[0] * i + r[0] * 5, e.y + n[1] * i + r[1] * 5],
		[e.x - n[0] * i + r[0] * 5, e.y - n[1] * i + r[1] * 5]
	];
}
var Q = {
	door: [
		"plain",
		"panel",
		"glazed"
	],
	sliding_door: [
		"plain",
		"glazed",
		"pocket"
	],
	window: [
		"casement",
		"tilt",
		"fixed",
		"sliding"
	],
	glass_door: [
		"casement",
		"sliding",
		"fixed"
	],
	opening: [
		"full",
		"doorway",
		"low_wall"
	]
}, vt = (e) => e.style && Q[e.type].includes(e.style) ? e.style : Q[e.type][0], yt = [
	"straight",
	"l",
	"u",
	"spiral"
], $ = {
	ceiling: [
		"ceiling_light",
		"pendant",
		"spot",
		"projector",
		"led_strip"
	],
	wall: [
		"sconce",
		"projector",
		"led_strip"
	],
	floor: [
		"floor_lamp",
		"table_lamp",
		"led_strip"
	]
}, bt = [
	"pendant",
	"sconce",
	"floor_lamp",
	"table_lamp"
], xt = (e) => e.type && $[e.mount]?.includes(e.type) ? e.type : e.kind === "linear" ? "led_strip" : $[e.mount]?.[0] ?? "ceiling_light", St = (e) => e === "led_strip" ? "linear" : "point";
function Ct(e) {
	let { x: t, y: n, w: r, h: i } = e, { o: a, s: o, c: s, L: c, B: l } = {
		up: {
			o: [t, n + i],
			s: [0, -1],
			c: [1, 0],
			L: i,
			B: r
		},
		down: {
			o: [t + r, n],
			s: [0, 1],
			c: [-1, 0],
			L: i,
			B: r
		},
		right: {
			o: [t, n],
			s: [1, 0],
			c: [0, 1],
			L: r,
			B: i
		},
		left: {
			o: [t + r, n + i],
			s: [-1, 0],
			c: [0, -1],
			L: r,
			B: i
		}
	}[e.dir], u = e.turn === "left";
	return {
		at: (e, t) => {
			let n = u ? l - t : t;
			return [a[0] + o[0] * e + s[0] * n, a[1] + o[1] * e + s[1] * n];
		},
		L: c,
		B: l
	};
}
function wt(e) {
	let t = e.shape ?? "straight", { at: n, L: r, B: i } = Ct(e), a = [], o = [], s = (e, t, r, i) => {
		let o = Math.max(2, Math.round(Math.abs(t - e) / 25));
		for (let s = 1; s < o; s++) {
			let c = e + (t - e) * s / o;
			a.push([n(c, r), n(c, i)]);
		}
	};
	if (t === "spiral") {
		let t = e.x + e.w / 2, r = e.y + e.h / 2, s = Math.min(e.w, e.h) / 2, c = s * .16, l = [];
		for (let e = 0; e < 36; e++) {
			let n = e / 36 * 2 * Math.PI;
			l.push([t + s * Math.cos(n), r + s * Math.sin(n)]);
		}
		let u = n(0, i / 2), d = Math.atan2(u[1] - r, u[0] - t), f = e.turn === "left" ? -1 : 1;
		for (let e = 0; e <= 12; e++) {
			let n = d + e / 12 * f * (2 * Math.PI) * (300 / 360);
			a.push([[t + c * Math.cos(n), r + c * Math.sin(n)], [t + s * Math.cos(n), r + s * Math.sin(n)]]);
		}
		for (let e = 0; e < 16; e++) {
			let n = e / 16 * 2 * Math.PI, i = (e + 1) / 16 * 2 * Math.PI;
			o.push([[t + c * Math.cos(n), r + c * Math.sin(n)], [t + c * Math.cos(i), r + c * Math.sin(i)]]);
		}
		let p = [], m = (s + c) / 2 + s * .1;
		for (let e = 0; e <= 20; e++) {
			let n = d + f * (.04 + e / 20 * .76) * 2 * Math.PI;
			p.push([t + m * Math.cos(n), r + m * Math.sin(n)]);
		}
		return {
			outline: l,
			treads: a,
			edges: o,
			path: p
		};
	}
	let c = Math.min(r, i) * .08;
	if (t === "l" && r > 40 && i > 40) {
		let e = Math.min(i, r) / 2;
		s(0, r - e, 0, e);
		let t = Math.max(2, Math.round((i - e) / 25));
		for (let o = 1; o < t; o++) {
			let s = e + (i - e) * o / t;
			a.push([n(r - e, s), n(r, s)]);
		}
		return o.push([n(r - e, e), n(r, 0)]), o.push([n(r - e, 0), n(r - e, e)]), o.push([n(r - e, e), n(r, e)]), {
			outline: [
				n(0, 0),
				n(r, 0),
				n(r, i),
				n(r - e, i),
				n(r - e, e),
				n(0, e)
			],
			treads: a,
			edges: o,
			path: [
				n(c, e / 2),
				n(r - e / 2, e / 2),
				n(r - e / 2, i - c)
			]
		};
	}
	if (t === "u" && r > 40 && i > 40) {
		let e = i / 2, t = Math.min(e, r / 2);
		return s(0, r - t, 0, e), s(0, r - t, e, i), o.push([n(0, e), n(r - t, e)]), o.push([n(r - t, 0), n(r - t, i)]), {
			outline: [
				n(0, 0),
				n(r, 0),
				n(r, i),
				n(0, i)
			],
			treads: a,
			edges: o,
			path: [
				n(c, e / 2),
				n(r - t / 2, e / 2),
				n(r - t / 2, i - e / 2),
				n(c, i - e / 2)
			]
		};
	}
	return {
		outline: lt(e),
		treads: ut(e),
		edges: o,
		path: dt(e)
	};
}
export { qe as A, Ie as B, et as C, Z as D, Y as E, Re as F, N as G, je as H, We as I, we as J, M as K, Ke as L, He as M, Ue as N, Je as O, ze as P, Ne as R, Qe as S, X as T, Ae as U, Ge as V, B as W, o as X, he as Y, gt as _, ht as a, $e as b, St as c, it as d, vt as f, mt as g, ct as h, nt as i, V as j, tt as k, xt as l, st as m, ft as n, bt as o, _t as p, me as q, Q as r, yt as s, $ as t, ot as u, wt as v, Ze as w, Xe as x, Ye as y, Le as z };
