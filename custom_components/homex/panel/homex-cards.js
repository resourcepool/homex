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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: ee } = Object, m = globalThis, te = m.trustedTypes, ne = te ? te.emptyScript : "", re = m.reactiveElementPolyfillSupport, h = (e, t) => e, g = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ne : null;
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
}, _ = (e, t) => !l(e, t), ie = {
	attribute: !0,
	type: String,
	converter: g,
	reflect: !1,
	useDefault: !1,
	hasChanged: _
};
Symbol.metadata ??= Symbol("metadata"), m.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var v = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = ie) {
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
		return this.elementProperties.get(e) ?? ie;
	}
	static _$Ei() {
		if (this.hasOwnProperty(h("elementProperties"))) return;
		let e = ee(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(h("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(h("properties"))) {
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
			let i = (n.converter?.toAttribute === void 0 ? g : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? g : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? _)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
v.elementStyles = [], v.shadowRootOptions = { mode: "open" }, v[h("elementProperties")] = /* @__PURE__ */ new Map(), v[h("finalized")] = /* @__PURE__ */ new Map(), re?.({ ReactiveElement: v }), (m.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var y = globalThis, ae = (e) => e, b = y.trustedTypes, oe = b ? b.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, se = "$lit$", x = `lit$${Math.random().toFixed(9).slice(2)}$`, ce = "?" + x, le = `<${ce}>`, S = document, C = () => S.createComment(""), w = (e) => e === null || typeof e != "object" && typeof e != "function", T = Array.isArray, ue = (e) => T(e) || typeof e?.[Symbol.iterator] == "function", E = "[ 	\n\f\r]", D = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, de = /-->/g, fe = />/g, O = RegExp(`>|${E}(?:([^\\s"'>=/]+)(${E}*=${E}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), pe = /'/g, me = /"/g, he = /^(?:script|style|textarea|title)$/i, ge = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), k = ge(1), _e = ge(2), A = Symbol.for("lit-noChange"), j = Symbol.for("lit-nothing"), ve = /* @__PURE__ */ new WeakMap(), M = S.createTreeWalker(S, 129);
function ye(e, t) {
	if (!T(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return oe === void 0 ? t : oe.createHTML(t);
}
var be = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = D;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === D ? c[1] === "!--" ? o = de : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = O) : (he.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = O) : o = fe : o === O ? c[0] === ">" ? (o = i ?? D, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? O : c[3] === "\"" ? me : pe) : o === me || o === pe ? o = O : o === de || o === fe ? o = D : (o = O, i = void 0);
		let d = o === O && e[t + 1].startsWith("/>") ? " " : "";
		a += o === D ? n + le : l >= 0 ? (r.push(s), n.slice(0, l) + se + n.slice(l) + x + d) : n + x + (l === -2 ? t : d);
	}
	return [ye(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, N = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = be(t, n);
		if (this.el = e.createElement(l, r), M.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = M.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(se)) {
					let t = u[o++], n = i.getAttribute(e).split(x), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Se : r[1] === "?" ? Ce : r[1] === "@" ? we : I
					}), i.removeAttribute(e);
				} else e.startsWith(x) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (he.test(i.tagName)) {
					let e = i.textContent.split(x), t = e.length - 1;
					if (t > 0) {
						i.textContent = b ? b.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], C()), M.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], C());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === ce) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(x, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += x.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = S.createElement("template");
		return n.innerHTML = e, n;
	}
};
function P(e, t, n = e, r) {
	if (t === A) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = w(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = P(e, i._$AS(e, t.values), i, r)), t;
}
var xe = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? S).importNode(t, !0);
		M.currentNode = r;
		let i = M.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new F(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Te(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = M.nextNode(), a++);
		}
		return M.currentNode = S, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, F = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = j, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = P(this, e, t), w(e) ? e === j || e == null || e === "" ? (this._$AH !== j && this._$AR(), this._$AH = j) : e !== this._$AH && e !== A && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ue(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== j && w(this._$AH) ? this._$AA.nextSibling.data = e : this.T(S.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = N.createElement(ye(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new xe(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = ve.get(e.strings);
		return t === void 0 && ve.set(e.strings, t = new N(e)), t;
	}
	k(t) {
		T(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(C()), this.O(C()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = ae(e).nextSibling;
			ae(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, I = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = j, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = j;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = P(this, e, t, 0), a = !w(e) || e !== this._$AH && e !== A, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = P(this, r[n + o], t, o), s === A && (s = this._$AH[o]), a ||= !w(s) || s !== this._$AH[o], s === j ? e = j : e !== j && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === j ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Se = class extends I {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === j ? void 0 : e;
	}
}, Ce = class extends I {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== j);
	}
}, we = class extends I {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = P(this, e, t, 0) ?? j) === A) return;
		let n = this._$AH, r = e === j && n !== j || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== j && (n === j || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Te = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		P(this, e);
	}
}, Ee = y.litHtmlPolyfillSupport;
Ee?.(N, F), (y.litHtmlVersions ??= []).push("3.3.3");
var De = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new F(t.insertBefore(C(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, L = globalThis, R = class extends v {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = De(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return A;
	}
};
R._$litElement$ = !0, R.finalized = !0, L.litElementHydrateSupport?.({ LitElement: R });
var Oe = L.litElementPolyfillSupport;
Oe?.({ LitElement: R }), (L.litElementVersions ??= []).push("4.2.2");
// node_modules/@lit/reactive-element/decorators/property.js
var ke = {
	attribute: !0,
	type: String,
	converter: g,
	reflect: !1,
	hasChanged: _
}, Ae = (e = ke, t, n) => {
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
function z(e) {
	return (t, n) => typeof n == "object" ? Ae(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function B(e) {
	return z({
		...e,
		state: !0,
		attribute: !1
	});
}
// node_modules/@mdi/js/mdi.js
var je = "M19.92,12.08L12,20L4.08,12.08L5.5,10.67L11,16.17V2H13V16.17L18.5,10.66L19.92,12.08M12,20H2V22H22V20H12Z", Me = "M4.08,11.92L12,4L19.92,11.92L18.5,13.33L13,7.83V22H11V7.83L5.5,13.33L4.08,11.92M12,4H22V2H2V4H12Z", V = "M7.2,11.2C8.97,11.2 10.4,12.63 10.4,14.4C10.4,16.17 8.97,17.6 7.2,17.6C5.43,17.6 4,16.17 4,14.4C4,12.63 5.43,11.2 7.2,11.2M14.8,16A2,2 0 0,1 16.8,18A2,2 0 0,1 14.8,20A2,2 0 0,1 12.8,18A2,2 0 0,1 14.8,16M15.2,4A4.8,4.8 0 0,1 20,8.8C20,11.45 17.85,13.6 15.2,13.6A4.8,4.8 0 0,1 10.4,8.8C10.4,6.15 12.55,4 15.2,4Z", Ne = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z", Pe = "M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20Z", H = "M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.78 14.43 12.46 13.77 12.33 13C12.21 12.26 12.23 11.63 12.5 10.94C12.69 11.32 12.89 11.7 13.13 12C13.9 13 15.11 13.44 15.37 14.8C15.41 14.94 15.43 15.08 15.43 15.23C15.46 16.05 15.1 16.95 14.5 17.5H14.5Z", Fe = "M22.11 21.46L2.39 1.73L1.11 3L7.09 9C5.66 10.36 4.88 12.47 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C17.1 19.26 17.15 19.18 17.22 19.11L20.84 22.73L22.11 21.46M8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C7 12.47 6.74 10.69 7.26 9.15L8.58 10.47C8.58 11.4 8.73 12.33 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.66 15 12.66 14.76 12.64 14.53L15 16.88C14.85 17.11 14.69 17.33 14.5 17.5M18.92 15.72L9.65 6.46C10.12 5.65 10.72 4.92 11.46 4.32C12.17 3.75 13 3.23 13.95 3C13 4.85 13.33 7.26 14.82 8.72C15.46 9.35 16.22 9.78 16.89 10.38C17.15 10.64 17.43 10.9 17.66 11.2C17.66 11.2 18.22 12 18.43 12.46L18.56 12.72C18.96 13.69 19.06 14.72 18.92 15.72Z", Ie = "M10 2C13.9 2 17 5.1 17 9C17 11.4 15.8 13.5 14 14.7V17C14 17.6 13.6 18 13 18H7C6.4 18 6 17.6 6 17V14.7C4.2 13.5 3 11.4 3 9C3 5.1 6.1 2 10 2M7 21V20H13V21C13 21.6 12.6 22 12 22H8C7.4 22 7 21.6 7 21M10 4C7.2 4 5 6.2 5 9C5 11.1 6.2 12.8 8 13.6V16H12V13.6C13.8 12.8 15 11.1 15 9C15 6.2 12.8 4 10 4M19 12V7H21V13H19M19 17V15H21V17H19Z", Le = "M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M11,18H13V15.87C14.73,15.43 16,13.86 16,12A4,4 0 0,0 12,8A4,4 0 0,0 8,12C8,13.86 9.27,15.43 11,15.87V18Z", Re = "M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z", ze = "M19,13H5V11H19V13Z", Be = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z", Ve = "M18,18H6V6H18V18Z", He = "M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5V8H11V5A1 1 0 0 1 12 4Z", Ue = "M12,3.25C12,3.25 6,10 6,14C6,17.32 8.69,20 12,20A6,6 0 0,0 18,14C18,10 12,3.25 12,3.25M14.47,9.97L15.53,11.03L9.53,17.03L8.47,15.97M9.75,10A1.25,1.25 0 0,1 11,11.25A1.25,1.25 0 0,1 9.75,12.5A1.25,1.25 0 0,1 8.5,11.25A1.25,1.25 0 0,1 9.75,10M14.25,14.5A1.25,1.25 0 0,1 15.5,15.75A1.25,1.25 0 0,1 14.25,17A1.25,1.25 0 0,1 13,15.75A1.25,1.25 0 0,1 14.25,14.5Z", We = "M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9M8 12H16V14H8V12M8 15H16V17H8V15M8 18H16V20H8V18Z", Ge = "M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9Z", U;
function Ke(e) {
	return U ??= e.connection.sendMessagePromise({ type: "homex/rooms" }).then((e) => e.rooms).catch((e) => {
		throw U = void 0, e;
	}), U;
}
var W = (e, t, n = 1, r = 0) => t.toLocaleString(e.locale?.language || void 0, {
	minimumFractionDigits: r,
	maximumFractionDigits: n
}), G = (e) => k`<svg viewBox="0 0 24 24" aria-hidden="true">${_e`<path d=${e}></path>`}</svg>`, qe = {
	co2: [800, 1200],
	pm25: [15, 35],
	pm10: [45, 100]
}, Je = [
	"Bon",
	"Moyen",
	"Mauvais"
], Ye = (e, t) => {
	let [n, r] = qe[e];
	return {
		level: t <= n ? 0 : t <= r ? 1 : 2,
		ratio: t / n
	};
};
function K(e, t, n) {
	let r = e.states[`sensor.homex_${t}_${n}`], i = r ? parseFloat(r.state) : NaN;
	return Number.isNaN(i) ? void 0 : {
		value: i,
		unit: r.attributes.unit_of_measurement
	};
}
function Xe(e, t) {
	let n = new Set((t?.heating?.radiators ?? []).map((e) => e.device_id));
	return n.size ? Object.values(e.entities ?? {}).filter((e) => e.entity_id.startsWith("climate.") && n.has(e.device_id)).map((e) => e.entity_id) : [];
}
function q(e) {
	return [...new Set((e?.shutter_groups ?? []).flatMap((e) => e.devices))];
}
function Ze(e) {
	let t = e?.attributes.current_position;
	return typeof t == "number" ? t : e?.state === "closed" ? 0 : 100;
}
var J = (e, t) => e.states[t]?.attributes.friendly_name ?? t;
// \0@oxc-project+runtime@0.156.0/helpers/esm/decorate.js
function Y(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/cards/room-detail.ts
var Qe, $e = [
	{
		key: "temperature",
		label: "Température",
		path: He,
		digits: 1
	},
	{
		key: "humidity",
		label: "Humidité",
		path: Ue,
		digits: 0
	},
	{
		key: "co2",
		label: "CO₂",
		path: Pe,
		air: "co2",
		digits: 0
	},
	{
		key: "pm25",
		label: "PM2.5",
		path: V,
		air: "pm25",
		digits: 1
	},
	{
		key: "pm10",
		label: "PM10",
		path: V,
		air: "pm10",
		digits: 1
	}
], X = class extends R {
	constructor(...e) {
		super(...e), this.heading = "", this._busy = !1;
	}
	connectedCallback() {
		super.connectedCallback(), this._keydown = this._keydown.bind(this), window.addEventListener("keydown", this._keydown), this._loadHeating();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), window.removeEventListener("keydown", this._keydown);
	}
	_keydown(e) {
		e.key === "Escape" && this.close();
	}
	close() {
		this.remove();
	}
	get _heatingSwitch() {
		return `switch.homex_${this.room.room_id}_heating`;
	}
	willUpdate() {
		let e = this.hass?.states[this._heatingSwitch]?.state;
		this._lastHeatingSwitch !== void 0 && e !== this._lastHeatingSwitch && setTimeout(() => this._loadHeating(), 1500), this._lastHeatingSwitch = e;
	}
	async _loadHeating() {
		if (this.room?.heating?.radiators?.length) try {
			this._heating = await this.hass.connection.sendMessagePromise({
				type: "homex/heating/room_status",
				room_id: this.room.room_id
			});
		} catch {
			this._heating = void 0;
		}
	}
	async _setpoint(e) {
		this._busy = !0;
		try {
			await this.hass.connection.sendMessagePromise({
				type: "homex/heating/room_setpoint",
				room_id: this.room.room_id,
				setpoint: e
			}), await this._loadHeating();
		} finally {
			this._busy = !1;
		}
	}
	_cover(e, t, n = {}) {
		this.hass.callService("cover", e, {
			entity_id: t,
			...n
		});
	}
	_climate() {
		let e = $e.map((e) => ({
			...e,
			v: K(this.hass, this.room.room_id, e.key)
		})).filter((e) => e.v);
		return e.length ? k`<section>
      <h3>Climat</h3>
      ${e.map((e) => {
			let t = e.air ? Ye(e.air, e.v.value).level : void 0, n = e.key === "humidity" ? "%" : e.v.unit ?? "", r = this.hass.states[`sensor.homex_${this.room.room_id}_${e.key}`]?.attributes.sensors ?? [], i = this.hass.states[`sensor.homex_${this.room.room_id}_${e.key}`]?.attributes.rule;
			return k`<div class="metric">
          <div class="mrow">
            <span class="micon">${G(e.path)}</span>
            <span class="mlabel">${e.label}</span>
            ${t === void 0 ? j : k`<span class="pill l${t}">${Je[t]}</span>`}
            <span class="mvalue">${W(this.hass, e.v.value, e.digits, +(e.key === "temperature"))} ${n}</span>
          </div>
          ${r.length > 1 || r.length === 1 && i !== "mean" ? k`<div class="sources">
                ${r.map((t) => {
				let n = this.hass.states[t], r = n ? parseFloat(n.state) : NaN;
				return k`<div class="source">
                    <span>${J(this.hass, t)}</span>
                    <span>${Number.isNaN(r) ? n?.state ?? "—" : `${W(this.hass, r, e.digits)} ${n.attributes.unit_of_measurement ?? ""}`}</span>
                  </div>`;
			})}
                <div class="source muted">Règle : ${i === "max" ? "maximum" : i === "min" ? "minimum" : "moyenne"}</div>
              </div>` : r.length === 1 ? k`<div class="sources"><div class="source muted"><span>${J(this.hass, r[0])}</span></div></div>` : j}
        </div>`;
		})}
    </section>` : j;
	}
	_heatingSection() {
		if (!this.room.heating?.radiators?.length) return j;
		let e = this.hass.states[this._heatingSwitch], t = this._heating, n = Xe(this.hass, this.room), r = n.some((e) => this.hass.states[e]?.attributes.hvac_action === "heating"), i = e ? e.state === "on" : t?.room_enabled !== !1;
		return k`<section>
      <h3>Chauffage</h3>
      <div class="line">
        <span class="status ${i ? r ? "heat" : "" : "off"}"
          >${G(i ? H : Fe)}</span
        >
        <span class="grow">
          ${i ? r ? "En chauffe" : "Pas de demande de chauffe" : "Pièce non chauffée"}
          ${t ? k`<span class="muted"> · mode ${t.mode_name}${t.enabled ? "" : " · chauffage global coupé"}</span>` : j}
        </span>
        ${e ? k`<label class="switch" title="Chauffage de la pièce">
              <input
                type="checkbox"
                .checked=${i}
                @change=${(e) => this.hass.callService("switch", e.target.checked ? "turn_on" : "turn_off", { entity_id: this._heatingSwitch })}
              />
              <span></span>
            </label>` : j}
      </div>
      ${t && !t.off && t.setpoint != null ? k`<div class="line setpoint">
            <span class="grow">
              Consigne
              ${t.override == null ? k`<span class="muted"> · du mode ${t.mode_name}</span>` : k`<span class="muted"> · surchargée (mode : ${t.group_setpoint ?? "—"} °C)</span>`}
            </span>
            <button class="round" ?disabled=${this._busy || t.setpoint <= t.min} @click=${() => this._setpoint(t.setpoint - t.step)}>
              ${G(ze)}
            </button>
            <span class="big">${W(this.hass, t.setpoint, 1, 1)} °C</span>
            <button class="round" ?disabled=${this._busy || t.setpoint >= t.max} @click=${() => this._setpoint(t.setpoint + t.step)}>
              ${G(Be)}
            </button>
          </div>
          ${t.override == null ? j : k`<div class="line">
                <span class="grow muted">La surcharge tombe au prochain changement de mode.</span>
                <button class="text" ?disabled=${this._busy} @click=${() => this._setpoint(null)}>Revenir au mode</button>
              </div>`}` : j}
      ${n.length ? k`<div class="sources">
            ${n.map((e) => {
			let t = this.hass.states[e], n = t?.attributes ?? {};
			return k`<div class="source">
                <span>${J(this.hass, e)}</span>
                <span>
                  ${n.current_temperature == null ? "" : `${W(this.hass, n.current_temperature)} °C`}
                  ${n.temperature == null ? "" : ` → ${W(this.hass, n.temperature)} °C`}
                  · ${n.hvac_action === "heating" ? "chauffe" : t?.state === "off" ? "coupé" : n.hvac_action ?? t?.state ?? "—"}
                </span>
              </div>`;
		})}
          </div>` : j}
    </section>`;
	}
	_shutters() {
		let e = q(this.room).filter((e) => this.hass.states[e]);
		return e.length ? k`<section>
      <h3>Volets</h3>
      ${e.length > 1 ? k`<div class="line">
            <span class="grow">Tous les volets</span>
            ${this._coverButtons(e)}
          </div>` : j}
      ${e.map((e) => {
			let t = this.hass.states[e], n = Ze(t), r = typeof t.attributes.current_position == "number";
			return k`<div class="cover">
          <div class="line">
            <span class="grow">${J(this.hass, e)}</span>
            <span class="muted">${t.state === "opening" ? "s'ouvre" : t.state === "closing" ? "se ferme" : `${n} %`}</span>
            ${this._coverButtons(e)}
          </div>
          ${r ? k`<input
                type="range"
                min="0"
                max="100"
                step="5"
                .value=${String(n)}
                @change=${(t) => this._cover("set_cover_position", e, { position: Number(t.target.value) })}
              />` : j}
        </div>`;
		})}
    </section>` : j;
	}
	_coverButtons(e) {
		return k`<span class="buttons">
      <button class="round" title="Ouvrir" @click=${() => this._cover("open_cover", e)}>${G(Me)}</button>
      <button class="round" title="Stop" @click=${() => this._cover("stop_cover", e)}>${G(Ve)}</button>
      <button class="round" title="Fermer" @click=${() => this._cover("close_cover", e)}>${G(je)}</button>
    </span>`;
	}
	render() {
		if (!this.hass || !this.room) return j;
		let e = [
			this._climate(),
			this._heatingSection(),
			this._shutters()
		].filter((e) => e !== j);
		return k`<div class="backdrop" @click=${this.close}></div>
      <div class="dialog" role="dialog" aria-modal="true" aria-label=${this.heading}>
        <header>
          <h2>${this.heading}</h2>
          <button class="round" title="Fermer" @click=${this.close}>${G(Ne)}</button>
        </header>
        <div class="body">${e.length ? e : k`<p class="muted">Aucune donnée de climat, de chauffage ni de volet pour cette pièce.</p>`}</div>
      </div>`;
	}
};
Qe = X, Qe.styles = o`
    :host {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--ha-font-family-body, Roboto, sans-serif);
      color: var(--primary-text-color);
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
    }
    .dialog {
      position: relative;
      width: min(480px, calc(100vw - 32px));
      max-height: calc(100vh - 48px);
      display: flex;
      flex-direction: column;
      background: var(--ha-card-background, var(--card-background-color, #1c1c1c));
      border-radius: var(--ha-dialog-border-radius, 24px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      overflow: hidden;
    }
    header {
      display: flex;
      align-items: center;
      padding: 16px 16px 8px 24px;
    }
    h2 {
      flex: 1;
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    .body {
      overflow-y: auto;
      padding: 0 24px 20px;
    }
    section + section {
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
    }
    h3 {
      margin: 14px 0 8px;
      font-size: 13px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--secondary-text-color);
    }
    section {
      padding-bottom: 10px;
    }
    svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
    .metric {
      padding: 4px 0;
    }
    .mrow,
    .line {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 36px;
    }
    .micon {
      display: flex;
      color: var(--secondary-text-color);
    }
    .mlabel,
    .grow {
      flex: 1;
      min-width: 0;
    }
    .mvalue {
      font-weight: 500;
      font-size: 16px;
    }
    .big {
      font-weight: 500;
      font-size: 20px;
      min-width: 74px;
      text-align: center;
    }
    .sources {
      margin: 0 0 4px 28px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .source {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 2px 0;
    }
    .muted {
      color: var(--secondary-text-color);
      font-size: 12px;
    }
    .pill {
      --pill: var(--success-color, #43a047);
      font-size: 11px;
      font-weight: 500;
      padding: 1px 8px;
      border-radius: 9px;
      color: var(--pill);
      background: color-mix(in srgb, var(--pill) 18%, transparent);
    }
    .pill.l1 {
      --pill: var(--warning-color, #ffa600);
    }
    .pill.l2 {
      --pill: var(--error-color, #db4437);
    }
    .status {
      display: flex;
      color: var(--secondary-text-color);
    }
    .status.heat {
      color: var(--state-climate-heat-color, #ff8100);
    }
    .status.off {
      color: var(--error-color, #db4437);
    }
    button {
      font: inherit;
      color: inherit;
      cursor: pointer;
      border: none;
      background: none;
    }
    button:disabled {
      opacity: 0.4;
      cursor: default;
    }
    .round {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(127, 127, 127, 0.15);
      flex: none;
    }
    .text {
      color: var(--primary-color);
      font-weight: 500;
      padding: 6px 8px;
    }
    .buttons {
      display: inline-flex;
      gap: 4px;
    }
    .cover input[type="range"] {
      width: 100%;
      accent-color: var(--primary-color);
      margin: 0 0 6px;
    }
    .switch {
      position: relative;
      width: 40px;
      height: 22px;
      flex: none;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .switch span {
      position: absolute;
      inset: 0;
      border-radius: 11px;
      background: rgba(127, 127, 127, 0.4);
      cursor: pointer;
      transition: background 0.2s;
    }
    .switch span::before {
      content: "";
      position: absolute;
      width: 18px;
      height: 18px;
      left: 2px;
      top: 2px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.2s;
    }
    .switch input:checked + span {
      background: var(--state-climate-heat-color, #ff8100);
    }
    .switch input:checked + span::before {
      transform: translateX(18px);
    }
  `, Y([z({ attribute: !1 })], X.prototype, "hass", void 0), Y([z({ attribute: !1 })], X.prototype, "room", void 0), Y([z()], X.prototype, "heading", void 0), Y([B()], X.prototype, "_heating", void 0), Y([B()], X.prototype, "_busy", void 0), customElements.get("homex-room-detail") || customElements.define("homex-room-detail", X);
// src/cards/room-tile.ts
var et, tt = "M3 4H21V6H20V20H18V6H6V20H4V6H3V4M7 7H17V9H7V7M7 10H17V12H7V10M7 13H17V14H7V13Z", Z = class extends R {
	static getStubConfig() {
		return { room: "" };
	}
	static getConfigElement() {
		return document.createElement("homex-room-tile-editor");
	}
	setConfig(e) {
		if (!e) throw Error("homex-room-tile: configuration requise");
		e.room !== this._config?.room && (this._room = void 0), this._config = e;
	}
	updated() {
		this.hass && this._config?.room && !this._room && Ke(this.hass).then((e) => {
			this._room = e.find((e) => e.room_id === this._config.room);
		}).catch(() => void 0), this._detail && (this._detail.hass = this.hass);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._detail?.close();
	}
	getCardSize() {
		return 1 + +!!this._air().length + +!!this._scenes().length;
	}
	getGridOptions() {
		return {
			columns: "full",
			rows: "auto",
			min_columns: 6
		};
	}
	get _entity() {
		return this._config.entity || `switch.homex_${this._config.room}_lights_toggle`;
	}
	get _isLights() {
		return this._entity.endsWith("_lights_toggle");
	}
	_lightState() {
		let e = this.hass.states[`switch.homex_${this._config.room}_lights_toggle`];
		return e?.state === "on" ? e.attributes.active_scene == null ? "stray" : "lit" : "off";
	}
	_name() {
		return this._config.name ? this._config.name : this._room?.name ? this._room.name : (this.hass.states[this._entity]?.attributes.friendly_name)?.split(" - ")[2] ?? this._config.room;
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
	_openDetail(e) {
		if (e.stopPropagation(), !this._room) return;
		this._detail?.close();
		let t = document.createElement("homex-room-detail");
		t.hass = this.hass, t.room = this._room, t.heading = this._name(), document.body.appendChild(t), this._detail = t;
		let n = () => {
			this._detail === t && (this._detail = void 0);
		};
		new MutationObserver((e, r) => {
			t.isConnected || (n(), r.disconnect());
		}).observe(document.body, { childList: !0 });
	}
	_activateScene(e, t, n) {
		e.stopPropagation(), this.hass.connection.sendMessagePromise({
			type: "homex/scene/activate",
			room_id: this._config.room,
			key: n ? "turn_off" : t
		});
	}
	_air() {
		if (!this.hass || !this._config) return [];
		let e = (e, t, n, r = "") => {
			let i = K(this.hass, this._config.room, e);
			return i && {
				key: e,
				label: t,
				path: n,
				tag: r,
				...i,
				...Ye(e, i.value)
			};
		}, t = [e("pm25", "PM2.5", V, "2.5"), e("pm10", "PM10", V, "10")].filter((e) => !!e).sort((e, t) => t.ratio - e.ratio)[0];
		return [e("co2", "CO₂", Pe), t].filter((e) => !!e);
	}
	_scenes() {
		if (!this._room || this._config?.show_scenes === !1 || !this._room.modules?.includes("lights")) return [];
		let e = this._config?.scenes;
		return (this._room.scenes ?? []).filter((t) => t.key !== "turn_off" && (!e || e.includes(t.key)));
	}
	_heatingStatus() {
		if (!this._room?.heating?.radiators?.length) return j;
		let e = this.hass.states[`switch.homex_${this._config.room}_heating`];
		return (e ? e.state !== "off" : this._room.heating.enabled !== !1) ? Xe(this.hass, this._room).some((e) => this.hass.states[e]?.attributes.hvac_action === "heating") ? this._status(H, "heat", "En chauffe") : this._status(H, "", "Pas de demande de chauffe") : this._status(Fe, "off", "Pièce non chauffée");
	}
	_shutterStatus() {
		let e = q(this._room).map((e) => this.hass.states[e]).filter((e) => e && e.state !== "unavailable" && e.state !== "unknown");
		if (!e.length) return j;
		let t = e.map(Ze), n = Math.round(t.reduce((e, t) => e + t, 0) / t.length);
		return t.every((e) => e === 0) ? this._status(We, "", "Volets fermés") : t.every((e) => e === 100) ? this._status(Ge, "", "Volets ouverts") : this._status(tt, "", `Volets ouverts à ${n} %`);
	}
	_status(e, t, n) {
		return k`<span class="status ${t}" title=${n}>${G(e)}</span>`;
	}
	render() {
		if (!this._config || !this.hass) return j;
		if (!this._config.room) return k`<ha-card class="empty">Choisir une pièce Homex</ha-card>`;
		let e = this.hass.states[this._entity], t = e?.state === "on", n = this._entity.endsWith("_heating"), r = this._isLights ? this._lightState() : void 0, i = r === "lit" ? Le : r === "stray" ? Ie : r === "off" ? Re : void 0, a = e ? e.state === "unavailable" ? "Indisponible" : r === "lit" ? "Allumée — éteindre" : r === "stray" ? "Éteinte, mais au moins une lumière est allumée — allumer" : r === "off" ? "Éteinte — allumer" : this.hass.formatEntityState?.(e) ?? e.state : "Introuvable", o = !e || e.state === "unavailable", s = K(this.hass, this._config.room, "temperature"), c = K(this.hass, this._config.room, "humidity"), l = this._air(), u = this._scenes(), d = this._lightState() === "lit" ? this.hass.states[`switch.homex_${this._config.room}_lights_toggle`]?.attributes.active_scene : void 0, f = this._heatingStatus(), p = this._shutterStatus(), ee = s || c || f !== j || p !== j;
		return k`<ha-card
      class=${t ? "on" : ""}
      style=${n ? "--tile-color: var(--state-climate-heat-color, #ff8100)" : ""}
      title=${a}
      @click=${this._toggle}
    >
      <div class="main">
        <div class="icon" @click=${this._moreInfo} title="Détails">
          ${i && !this._config.icon ? G(i) : k`<ha-icon .icon=${this._config.icon || "mdi:radiator"}></ha-icon>`}
        </div>
        <div class="info">
          <div class="name">${this._name()}</div>
          ${o ? k`<div class="sub">${a}</div>` : j}
          ${l.length ? k`<div class="pills">
                ${l.map((e) => k`<span class="pill l${e.level}" title=${`${e.label} : ${W(this.hass, e.value, 1)} ${e.unit ?? ""}`}
                      ><span class="picto">${G(e.path)}${e.tag ? k`<small>${e.tag}</small>` : j}</span
                      ><span class="pval">${W(this.hass, e.value, 0)}</span></span
                    >`)}
              </div>` : j}
        </div>
        ${ee ? k`<button class="right" title="État de la pièce" @click=${this._openDetail}>
              <span class="statuses">${f}${p}</span>
              ${s || c ? k`<span class="readings">
                    ${s ? k`<span class="temp">${W(this.hass, s.value, 1, 1)} ${s.unit ?? "°C"}</span>` : j}
                    ${c ? k`<span class="hum">${W(this.hass, c.value, 0)} %</span>` : j}
                  </span>` : j}
            </button>` : j}
      </div>
      ${u.length ? k`<div class="scenes">
            ${u.map((e) => k`<button
                  class="scene ${e.key === d ? "active" : ""}"
                  title=${e.key === d ? `${e.name} — éteindre` : e.name}
                  @click=${(t) => this._activateScene(t, e.key, e.key === d)}
                >
                  ${e.name}
                </button>`)}
          </div>` : j}
    </ha-card>`;
	}
};
et = Z, et.styles = o`
    :host {
      --tile-color: var(--state-light-active-color, var(--amber-color, #ffc107));
    }
    ha-card {
      height: 100%;
      box-sizing: border-box;
      padding: 10px 6px 10px 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 8px;
    }
    ha-card.empty {
      padding: 16px;
      color: var(--secondary-text-color);
    }
    .main {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
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
      color: var(--secondary-text-color);
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
      border-radius: 7px;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      color: var(--pill);
      background: color-mix(in srgb, var(--pill) 18%, transparent);
    }
    .picto {
      display: inline-flex;
      align-items: center;
      gap: 1px;
      padding: 0 4px 0 5px;
    }
    .pval {
      padding: 0 6px 0 4px;
      border-left: 1px solid color-mix(in srgb, var(--pill) 45%, transparent);
    }
    .pill svg {
      width: 11px;
      height: 11px;
      fill: currentColor;
    }
    .pill small {
      font-size: 8px;
      opacity: 0.85;
    }
    .pill.l1 {
      --pill: var(--warning-color, #ffa600);
    }
    .pill.l2 {
      --pill: var(--error-color, #db4437);
    }
    .right {
      flex: none;
      display: flex;
      align-items: center;
      gap: 10px;
      align-self: stretch;
      margin: -4px 0;
      padding: 0 8px 0 12px;
      border: none;
      border-left: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 0 10px 10px 0;
      background: none;
      font: inherit;
      color: inherit;
      cursor: pointer;
    }
    .right:hover {
      background: rgba(127, 127, 127, 0.08);
    }
    .statuses {
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
      display: flex;
      flex-direction: column;
      align-items: flex-end;
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
    .scenes {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding-left: 46px;
    }
    .scene {
      font: inherit;
      font-size: 12px;
      line-height: 16px;
      padding: 4px 10px;
      border-radius: 14px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
      background: none;
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .scene:hover {
      background: rgba(127, 127, 127, 0.1);
    }
    .scene.active {
      border-color: var(--tile-color);
      background: color-mix(in srgb, var(--tile-color) 22%, transparent);
      font-weight: 500;
    }
  `, Y([z({ attribute: !1 })], Z.prototype, "hass", void 0), Y([B()], Z.prototype, "_config", void 0), Y([B()], Z.prototype, "_room", void 0), customElements.get("homex-room-tile") || customElements.define("homex-room-tile", Z);
// src/cards/room-tile-editor.ts
var nt, Q = class extends R {
	constructor(...e) {
		super(...e), this._rooms = [];
	}
	setConfig(e) {
		this._config = e;
	}
	firstUpdated() {
		Ke(this.hass).then((e) => this._rooms = [...e].sort((e, t) => e.name.localeCompare(t.name))).catch(() => void 0);
	}
	_set(e) {
		let t = {
			...this._config,
			...e
		};
		for (let [e, n] of Object.entries(t)) (n === void 0 || n === "") && delete t[e];
		this._config = t, this.dispatchEvent(new CustomEvent("config-changed", {
			detail: { config: t },
			bubbles: !0,
			composed: !0
		}));
	}
	render() {
		if (!this._config) return j;
		let e = this._rooms.find((e) => e.room_id === this._config.room), t = this._config.room, n = t ? [[`switch.homex_${t}_lights_toggle`, "Lumières"], [`switch.homex_${t}_heating`, "Chauffage"]].filter(([e]) => this.hass.states[e]) : [], r = this._config.entity || `switch.homex_${t}_lights_toggle`, i = (e?.scenes ?? []).filter((e) => e.key !== "turn_off"), a = this._config.scenes;
		return k`
      <label>
        Pièce Homex
        <select @change=${(e) => this._set({
			room: e.target.value,
			scenes: void 0,
			entity: void 0
		})}>
          <option value="" ?selected=${!t}>—</option>
          ${this._rooms.map((e) => k`<option value=${e.room_id} ?selected=${e.room_id === t}>${e.name}</option>`)}
        </select>
      </label>
      ${n.length > 1 ? k`<label>
            Interrupteur de la tuile
            <select
              @change=${(e) => {
			let t = e.target.value;
			this._set({ entity: t.endsWith("_lights_toggle") ? void 0 : t });
		}}
            >
              ${n.map(([e, t]) => k`<option value=${e} ?selected=${e === r}>${t}</option>`)}
            </select>
          </label>` : j}
      <label>
        Nom (optionnel)
        <input
          .value=${this._config.name ?? ""}
          placeholder=${e?.name ?? ""}
          @change=${(e) => this._set({ name: e.target.value })}
        />
      </label>
      ${i.length ? k`<label class="check">
              <input
                type="checkbox"
                .checked=${this._config.show_scenes !== !1}
                @change=${(e) => this._set({ show_scenes: e.target.checked ? void 0 : !1 })}
              />
              Afficher les scènes
            </label>
            ${this._config.show_scenes === !1 ? j : k`<div class="scenes">
                  ${i.map((e) => k`<label class="check">
                      <input
                        type="checkbox"
                        .checked=${!a || a.includes(e.key)}
                        @change=${(t) => {
			let n = t.target.checked, r = a ?? i.map((e) => e.key), o = n ? [...r, e.key] : r.filter((t) => t !== e.key), s = i.every((e) => o.includes(e.key));
			this._set({ scenes: s ? void 0 : i.map((e) => e.key).filter((e) => o.includes(e)) });
		}}
                      />
                      ${e.name}
                    </label>`)}
                </div>`}` : j}
    `;
	}
};
nt = Q, nt.styles = o`
    :host {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 14px;
      color: var(--primary-text-color);
    }
    label.check {
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }
    select,
    input:not([type]) {
      font: inherit;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #888);
      background: var(--card-background-color, transparent);
      color: var(--primary-text-color);
    }
    .scenes {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding-left: 26px;
    }
  `, Y([z({ attribute: !1 })], Q.prototype, "hass", void 0), Y([B()], Q.prototype, "_config", void 0), Y([B()], Q.prototype, "_rooms", void 0), customElements.get("homex-room-tile-editor") || customElements.define("homex-room-tile-editor", Q);
// src/homex-cards.ts
var $ = window;
$.customCards = $.customCards || [], $.customCards.some((e) => e.type === "homex-room-tile") || $.customCards.push({
	type: "homex-room-tile",
	name: "Homex – Pièce",
	description: "Lumières de la pièce et ses scènes, climat, chauffage et volets Homex (détail au clic sur la partie droite).",
	preview: !0
});
