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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: ee, getOwnPropertySymbols: te, getPrototypeOf: ne } = Object, f = globalThis, p = f.trustedTypes, re = p ? p.emptyScript : "", ie = f.reactiveElementPolyfillSupport, m = (e, t) => e, h = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? re : null;
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
}, g = (e, t) => !l(e, t), _ = {
	attribute: !0,
	type: String,
	converter: h,
	reflect: !1,
	useDefault: !1,
	hasChanged: g
};
Symbol.metadata ??= Symbol("metadata"), f.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var v = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = _) {
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
		return this.elementProperties.get(e) ?? _;
	}
	static _$Ei() {
		if (this.hasOwnProperty(m("elementProperties"))) return;
		let e = ne(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(m("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(m("properties"))) {
			let e = this.properties, t = [...ee(e), ...te(e)];
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
			let i = (n.converter?.toAttribute === void 0 ? h : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? h : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? g)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
v.elementStyles = [], v.shadowRootOptions = { mode: "open" }, v[m("elementProperties")] = /* @__PURE__ */ new Map(), v[m("finalized")] = /* @__PURE__ */ new Map(), ie?.({ ReactiveElement: v }), (f.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var y = globalThis, b = (e) => e, x = y.trustedTypes, S = x ? x.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, C = "$lit$", w = `lit$${Math.random().toFixed(9).slice(2)}$`, ae = "?" + w, oe = `<${ae}>`, T = document, E = () => T.createComment(""), D = (e) => e === null || typeof e != "object" && typeof e != "function", O = Array.isArray, se = (e) => O(e) || typeof e?.[Symbol.iterator] == "function", k = "[ 	\n\f\r]", A = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ce = /-->/g, le = />/g, j = RegExp(`>|${k}(?:([^\\s"'>=/]+)(${k}*=${k}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), ue = /'/g, M = /"/g, N = /^(?:script|style|textarea|title)$/i, P = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), F = P(1), I = P(2), L = Symbol.for("lit-noChange"), R = Symbol.for("lit-nothing"), z = /* @__PURE__ */ new WeakMap(), B = T.createTreeWalker(T, 129);
function V(e, t) {
	if (!O(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return S === void 0 ? t : S.createHTML(t);
}
var de = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = A;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === A ? c[1] === "!--" ? o = ce : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = j) : (N.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = j) : o = le : o === j ? c[0] === ">" ? (o = i ?? A, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? j : c[3] === "\"" ? M : ue) : o === M || o === ue ? o = j : o === ce || o === le ? o = A : (o = j, i = void 0);
		let d = o === j && e[t + 1].startsWith("/>") ? " " : "";
		a += o === A ? n + oe : l >= 0 ? (r.push(s), n.slice(0, l) + C + n.slice(l) + w + d) : n + w + (l === -2 ? t : d);
	}
	return [V(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, H = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = de(t, n);
		if (this.el = e.createElement(l, r), B.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = B.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(C)) {
					let t = u[o++], n = i.getAttribute(e).split(w), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? pe : r[1] === "?" ? me : r[1] === "@" ? he : G
					}), i.removeAttribute(e);
				} else e.startsWith(w) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (N.test(i.tagName)) {
					let e = i.textContent.split(w), t = e.length - 1;
					if (t > 0) {
						i.textContent = x ? x.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], E()), B.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], E());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === ae) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(w, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += w.length - 1;
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
function U(e, t, n = e, r) {
	if (t === L) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = D(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = U(e, i._$AS(e, t.values), i, r)), t;
}
var fe = class {
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
		B.currentNode = r;
		let i = B.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new W(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new ge(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = B.nextNode(), a++);
		}
		return B.currentNode = T, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, W = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = R, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = U(this, e, t), D(e) ? e === R || e == null || e === "" ? (this._$AH !== R && this._$AR(), this._$AH = R) : e !== this._$AH && e !== L && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? se(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== R && D(this._$AH) ? this._$AA.nextSibling.data = e : this.T(T.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = H.createElement(V(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new fe(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = z.get(e.strings);
		return t === void 0 && z.set(e.strings, t = new H(e)), t;
	}
	k(t) {
		O(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(E()), this.O(E()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = b(e).nextSibling;
			b(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, G = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = R, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = R;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = U(this, e, t, 0), a = !D(e) || e !== this._$AH && e !== L, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = U(this, r[n + o], t, o), s === L && (s = this._$AH[o]), a ||= !D(s) || s !== this._$AH[o], s === R ? e = R : e !== R && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === R ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, pe = class extends G {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === R ? void 0 : e;
	}
}, me = class extends G {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== R);
	}
}, he = class extends G {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = U(this, e, t, 0) ?? R) === L) return;
		let n = this._$AH, r = e === R && n !== R || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== R && (n === R || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, ge = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		U(this, e);
	}
}, _e = y.litHtmlPolyfillSupport;
_e?.(H, W), (y.litHtmlVersions ??= []).push("3.3.3");
var ve = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new W(t.insertBefore(E(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, K = globalThis, q = class extends v {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ve(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return L;
	}
};
q._$litElement$ = !0, q.finalized = !0, K.litElementHydrateSupport?.({ LitElement: q });
var ye = K.litElementPolyfillSupport;
ye?.({ LitElement: q }), (K.litElementVersions ??= []).push("4.2.2");
// node_modules/@lit/reactive-element/decorators/property.js
var be = {
	attribute: !0,
	type: String,
	converter: h,
	reflect: !1,
	hasChanged: g
}, xe = (e = be, t, n) => {
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
function J(e) {
	return (t, n) => typeof n == "object" ? xe(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function Y(e) {
	return J({
		...e,
		state: !0,
		attribute: !1
	});
}
// node_modules/@mdi/js/mdi.js
var Se = "M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.78 14.43 12.46 13.77 12.33 13C12.21 12.26 12.23 11.63 12.5 10.94C12.69 11.32 12.89 11.7 13.13 12C13.9 13 15.11 13.44 15.37 14.8C15.41 14.94 15.43 15.08 15.43 15.23C15.46 16.05 15.1 16.95 14.5 17.5H14.5Z", Ce = "M22.11 21.46L2.39 1.73L1.11 3L7.09 9C5.66 10.36 4.88 12.47 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C17.1 19.26 17.15 19.18 17.22 19.11L20.84 22.73L22.11 21.46M8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C7 12.47 6.74 10.69 7.26 9.15L8.58 10.47C8.58 11.4 8.73 12.33 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.66 15 12.66 14.76 12.64 14.53L15 16.88C14.85 17.11 14.69 17.33 14.5 17.5M18.92 15.72L9.65 6.46C10.12 5.65 10.72 4.92 11.46 4.32C12.17 3.75 13 3.23 13.95 3C13 4.85 13.33 7.26 14.82 8.72C15.46 9.35 16.22 9.78 16.89 10.38C17.15 10.64 17.43 10.9 17.66 11.2C17.66 11.2 18.22 12 18.43 12.46L18.56 12.72C18.96 13.69 19.06 14.72 18.92 15.72Z", we = "M10 2C13.9 2 17 5.1 17 9C17 11.4 15.8 13.5 14 14.7V17C14 17.6 13.6 18 13 18H7C6.4 18 6 17.6 6 17V14.7C4.2 13.5 3 11.4 3 9C3 5.1 6.1 2 10 2M7 21V20H13V21C13 21.6 12.6 22 12 22H8C7.4 22 7 21.6 7 21M10 4C7.2 4 5 6.2 5 9C5 11.1 6.2 12.8 8 13.6V16H12V13.6C13.8 12.8 15 11.1 15 9C15 6.2 12.8 4 10 4M19 12V7H21V13H19M19 17V15H21V17H19Z", Te = "M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M11,18H13V15.87C14.73,15.43 16,13.86 16,12A4,4 0 0,0 12,8A4,4 0 0,0 8,12C8,13.86 9.27,15.43 11,15.87V18Z", Ee = "M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z", De = "M3.28,2L2,3.27L4.77,6.04L5.64,7.39L4.22,9.6L5.95,10.5L7.23,8.5L10.73,12H4A2,2 0 0,0 2,14V22H4V20H18.73L20,21.27V22H22V20.73L22,20.72V20.72L3.28,2M7,17A1,1 0 0,1 6,18A1,1 0 0,1 5,17V15A1,1 0 0,1 6,14A1,1 0 0,1 7,15V17M11,17A1,1 0 0,1 10,18A1,1 0 0,1 9,17V15A1,1 0 0,1 10,14A1,1 0 0,1 11,15V17M15,17A1,1 0 0,1 14,18A1,1 0 0,1 13,17V15C13,14.79 13.08,14.61 13.18,14.45L15,16.27V17M16.25,9.5L17.67,7.3L16.25,5.1L18.25,2L20,2.89L18.56,5.1L20,7.3V7.31L18,10.4L16.25,9.5M22,14V18.18L19,15.18V15A1,1 0 0,0 18,14C17.95,14 17.9,14 17.85,14.03L15.82,12H20C21.11,12 22,12.9 22,14M11.64,7.3L10.22,5.1L12.22,2L13.95,2.89L12.53,5.1L13.95,7.3L13.94,7.31L12.84,9L11.44,7.62L11.64,7.3M7.5,3.69L6.1,2.28L6.22,2.09L7.95,3L7.5,3.69Z", Oe = "M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9M8 12H16V14H8V12M8 15H16V17H8V15M8 18H16V20H8V18Z", ke = "M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9Z";
// \0@oxc-project+runtime@0.156.0/helpers/esm/decorate.js
function X(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/homex-cards.ts
var Ae, je = "M3 4H21V6H20V20H18V6H6V20H4V6H3V4M7 7H17V9H7V7M7 10H17V12H7V10M7 13H17V14H7V13Z", Z;
function Me(e) {
	return Z ??= e.connection.sendMessagePromise({ type: "homex/rooms" }).then((e) => e.rooms).catch((e) => {
		throw Z = void 0, e;
	}), Z;
}
var Ne = {
	co2: [800, 1200],
	pm25: [15, 35],
	pm10: [45, 100]
}, Pe = (e, t) => {
	let [n, r] = Ne[e];
	return {
		level: t <= n ? 0 : t <= r ? 1 : 2,
		ratio: t / n
	};
}, Q = (e, t, n = 1, r = 0) => t.toLocaleString(e.locale?.language || void 0, {
	minimumFractionDigits: r,
	maximumFractionDigits: n
}), $ = class extends q {
	updated() {
		this.hass && this._config && !this._room && Me(this.hass).then((e) => {
			this._room = e.find((e) => e.room_id === this._config.room);
		}).catch(() => void 0);
	}
	_valves() {
		let e = new Set((this._room?.heating?.radiators ?? []).map((e) => e.device_id));
		return e.size ? Object.values(this.hass.entities ?? {}).filter((t) => t.entity_id.startsWith("climate.") && e.has(t.device_id)).map((e) => e.entity_id) : [];
	}
	_covers() {
		return [...new Set((this._room?.shutter_groups ?? []).flatMap((e) => e.devices))];
	}
	_heatingStatus() {
		return this._room?.heating?.radiators?.length ? this._room.heating.enabled === !1 ? this._status(De, "off", "Pièce non chauffée") : this._valves().some((e) => this.hass.states[e]?.attributes.hvac_action === "heating") ? this._status(Se, "heat", "Demande de chauffe") : this._status(Ce, "", "Pas de demande de chauffe") : R;
	}
	_shutterStatus() {
		let e = this._covers().map((e) => this.hass.states[e]).filter((e) => e && e.state !== "unavailable" && e.state !== "unknown");
		if (!e.length) return R;
		let t = e.map((e) => {
			let t = e.attributes.current_position;
			return typeof t == "number" ? t : e.state === "closed" ? 0 : 100;
		}), n = Math.round(t.reduce((e, t) => e + t, 0) / t.length);
		return t.every((e) => e === 0) ? this._status(Oe, "", "Volets fermés") : t.every((e) => e === 100) ? this._status(ke, "", "Volets ouverts") : this._status(je, "", `Volets ouverts à ${n} %`);
	}
	_status(e, t, n) {
		return F`<span class="status ${t}" title=${n}
      ><svg viewBox="0 0 24 24">${I`<path d=${e}></path>`}</svg></span
    >`;
	}
	static getStubConfig() {
		return { room: "salon" };
	}
	setConfig(e) {
		if (!e?.room) throw Error("homex-room-tile: « room » (id de pièce Homex) requis");
		this._config = e;
	}
	get _entity() {
		return this._config.entity || `switch.homex_${this._config.room}_lights_toggle`;
	}
	_metric(e) {
		let t = this.hass?.states[`sensor.homex_${this._config.room}_${e}`], n = t ? parseFloat(t.state) : NaN;
		return Number.isNaN(n) ? void 0 : {
			value: n,
			unit: t.attributes.unit_of_measurement
		};
	}
	_air() {
		let e = (e, t) => {
			let n = this._metric(e);
			return n && {
				key: e,
				label: t,
				...n,
				...Pe(e, n.value)
			};
		}, t = [e("pm25", "PM2.5"), e("pm10", "PM10")].filter((e) => !!e).sort((e, t) => t.ratio - e.ratio)[0];
		return [e("co2", "CO₂"), t].filter((e) => !!e);
	}
	getCardSize() {
		return this._air().length ? 2 : 1;
	}
	getGridOptions() {
		return {
			columns: "full",
			rows: "auto",
			min_columns: 6
		};
	}
	_name() {
		return this._config.name ? this._config.name : (this.hass.states[this._entity]?.attributes.friendly_name)?.split(" - ")[2] ?? this._config.room;
	}
	get _isLights() {
		return this._entity.endsWith("_lights_toggle");
	}
	_lightState() {
		let e = this.hass.states[this._entity];
		return e?.state === "on" ? e.attributes.active_scene == null ? "stray" : "lit" : "off";
	}
	_toggle() {
		let e = this.hass.states[this._entity];
		if (!e) return;
		let t = this._isLights ? this._lightState() === "lit" : e.state === "on";
		this.hass.callService("switch", t ? "turn_off" : "turn_on", { entity_id: this._entity });
	}
	_moreInfo(e) {
		e.stopPropagation(), this.dispatchEvent(new CustomEvent("hass-more-info", {
			detail: { entityId: this._entity },
			bubbles: !0,
			composed: !0
		}));
	}
	render() {
		if (!this._config || !this.hass) return R;
		let e = this.hass.states[this._entity], t = e?.state === "on", n = this._entity.endsWith("_heating"), r = this._isLights ? this._lightState() : void 0, i = r === "lit" ? Te : r === "stray" ? we : r === "off" ? Ee : void 0, a = this._config.icon || "mdi:radiator", o = e ? e.state === "unavailable" ? "Indisponible" : r === "lit" ? "Allumée — éteindre" : r === "stray" ? "Éteinte, mais au moins une lumière est allumée — allumer" : r === "off" ? "Éteinte — allumer" : this.hass.formatEntityState?.(e) ?? e.state : "Introuvable", s = !e || e.state === "unavailable", c = this._metric("temperature"), l = this._metric("humidity"), u = this._air();
		return F`<ha-card
      class=${t ? "on" : ""}
      style=${n ? "--tile-color: var(--state-climate-heat-color, #ff8100)" : ""}
      title=${o}
      @click=${this._toggle}
    >
      <div class="icon" @click=${this._moreInfo} title="Détails">
        ${i && !this._config.icon ? F`<svg viewBox="0 0 24 24">${I`<path d=${i}></path>`}</svg>` : F`<ha-icon .icon=${a}></ha-icon>`}
      </div>
      <div class="info">
        <div class="name">${this._name()}</div>
        ${s ? F`<div class="sub">${o}</div>` : R}
        ${u.length ? F`<div class="pills">
              ${u.map((e) => F`<span class="pill l${e.level}" title=${`${e.label} : ${Q(this.hass, e.value, 1)} ${e.unit ?? ""}`}
                    >${e.label} ${Q(this.hass, e.value, 0)}</span
                  >`)}
            </div>` : R}
      </div>
      <div class="statuses">${this._heatingStatus()}${this._shutterStatus()}</div>
      ${c || l ? F`<div class="readings">
            ${c ? F`<div class="temp">${Q(this.hass, c.value, 1, 1)} ${c.unit ?? "°C"}</div>` : R}
            ${l ? F`<div class="hum">${Q(this.hass, l.value, 0)} %</div>` : R}
          </div>` : R}
    </ha-card>`;
	}
};
if (Ae = $, Ae.styles = o`
    :host {
      --tile-color: var(--state-light-active-color, var(--amber-color, #ffc107));
    }
    ha-card {
      height: 100%;
      box-sizing: border-box;
      padding: 10px 14px 10px 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .statuses {
      flex: none;
      display: flex;
      gap: 6px;
    }
    .status {
      display: flex;
      color: var(--secondary-text-color);
      opacity: 0.8;
    }
    .status svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
    .status.heat {
      color: var(--state-climate-heat-color, #ff8100);
      opacity: 1;
    }
    .status.off {
      color: var(--error-color, #db4437);
      opacity: 1;
    }
    .readings {
      flex: none;
      text-align: right;
      min-width: 56px;
    }
    .temp {
      font-size: 16px;
      font-weight: 500;
      line-height: 20px;
      color: var(--primary-text-color);
    }
    .hum {
      font-size: 12px;
      line-height: 16px;
      color: var(--secondary-text-color);
    }
    .icon {
      flex: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(127, 127, 127, 0.15);
      color: var(--state-inactive-color, var(--secondary-text-color));
      --mdc-icon-size: 22px;
    }
    .icon svg {
      width: 22px;
      height: 22px;
      fill: currentColor;
    }
    .on .icon {
      color: var(--tile-color);
      background: color-mix(in srgb, var(--tile-color) 20%, transparent);
    }
    .info {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sub {
      font-size: 12px;
      line-height: 16px;
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pills {
      display: flex;
      gap: 4px;
      margin-top: 3px;
    }
    .pill {
      --pill: var(--success-color, #43a047);
      font-size: 10px;
      font-weight: 500;
      line-height: 14px;
      padding: 0 6px;
      border-radius: 7px;
      white-space: nowrap;
      color: var(--pill);
      background: color-mix(in srgb, var(--pill) 18%, transparent);
    }
    .pill.l1 {
      --pill: var(--warning-color, #ffa600);
    }
    .pill.l2 {
      --pill: var(--error-color, #db4437);
    }
  `, X([J({ attribute: !1 })], $.prototype, "hass", void 0), X([Y()], $.prototype, "_config", void 0), X([Y()], $.prototype, "_room", void 0), !customElements.get("homex-room-tile")) {
	customElements.define("homex-room-tile", $);
	let e = window;
	e.customCards = e.customCards || [], e.customCards.push({
		type: "homex-room-tile",
		name: "Homex – Pièce",
		description: "Switch de la pièce, température / humidité et qualité de l'air Homex."
	});
}
