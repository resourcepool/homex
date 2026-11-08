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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, ee = globalThis, te = ee.trustedTypes, ne = te ? te.emptyScript : "", re = ee.reactiveElementPolyfillSupport, ie = (e, t) => e, ae = {
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
}, oe = (e, t) => !l(e, t), se = {
	attribute: !0,
	type: String,
	converter: ae,
	reflect: !1,
	useDefault: !1,
	hasChanged: oe
};
Symbol.metadata ??= Symbol("metadata"), ee.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var ce = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = se) {
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
		return this.elementProperties.get(e) ?? se;
	}
	static _$Ei() {
		if (this.hasOwnProperty(ie("elementProperties"))) return;
		let e = m(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(ie("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ie("properties"))) {
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
			let i = (n.converter?.toAttribute === void 0 ? ae : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? ae : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? oe)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
ce.elementStyles = [], ce.shadowRootOptions = { mode: "open" }, ce[ie("elementProperties")] = /* @__PURE__ */ new Map(), ce[ie("finalized")] = /* @__PURE__ */ new Map(), re?.({ ReactiveElement: ce }), (ee.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var le = globalThis, ue = (e) => e, de = le.trustedTypes, fe = de ? de.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, pe = "$lit$", me = `lit$${Math.random().toFixed(9).slice(2)}$`, he = "?" + me, ge = `<${he}>`, _e = document, ve = () => _e.createComment(""), ye = (e) => e === null || typeof e != "object" && typeof e != "function", be = Array.isArray, xe = (e) => be(e) || typeof e?.[Symbol.iterator] == "function", Se = "[ 	\n\f\r]", Ce = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, we = /-->/g, Te = />/g, Ee = RegExp(`>|${Se}(?:([^\\s"'>=/]+)(${Se}*=${Se}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), De = /'/g, Oe = /"/g, ke = /^(?:script|style|textarea|title)$/i, Ae = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), h = Ae(1), g = Ae(2), je = Symbol.for("lit-noChange"), _ = Symbol.for("lit-nothing"), Me = /* @__PURE__ */ new WeakMap(), Ne = _e.createTreeWalker(_e, 129);
function Pe(e, t) {
	if (!be(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return fe === void 0 ? t : fe.createHTML(t);
}
var Fe = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Ce;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === Ce ? c[1] === "!--" ? o = we : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = Ee) : (ke.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = Ee) : o = Te : o === Ee ? c[0] === ">" ? (o = i ?? Ce, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? Ee : c[3] === "\"" ? Oe : De) : o === Oe || o === De ? o = Ee : o === we || o === Te ? o = Ce : (o = Ee, i = void 0);
		let d = o === Ee && e[t + 1].startsWith("/>") ? " " : "";
		a += o === Ce ? n + ge : l >= 0 ? (r.push(s), n.slice(0, l) + pe + n.slice(l) + me + d) : n + me + (l === -2 ? t : d);
	}
	return [Pe(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Ie = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Fe(t, n);
		if (this.el = e.createElement(l, r), Ne.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = Ne.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(pe)) {
					let t = u[o++], n = i.getAttribute(e).split(me), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Ve : r[1] === "?" ? He : r[1] === "@" ? Ue : Be
					}), i.removeAttribute(e);
				} else e.startsWith(me) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (ke.test(i.tagName)) {
					let e = i.textContent.split(me), t = e.length - 1;
					if (t > 0) {
						i.textContent = de ? de.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], ve()), Ne.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], ve());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === he) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(me, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += me.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = _e.createElement("template");
		return n.innerHTML = e, n;
	}
};
function Le(e, t, n = e, r) {
	if (t === je) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = ye(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = Le(e, i._$AS(e, t.values), i, r)), t;
}
var Re = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? _e).importNode(t, !0);
		Ne.currentNode = r;
		let i = Ne.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new ze(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new We(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = Ne.nextNode(), a++);
		}
		return Ne.currentNode = _e, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, ze = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = _, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = Le(this, e, t), ye(e) ? e === _ || e == null || e === "" ? (this._$AH !== _ && this._$AR(), this._$AH = _) : e !== this._$AH && e !== je && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? xe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== _ && ye(this._$AH) ? this._$AA.nextSibling.data = e : this.T(_e.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Ie.createElement(Pe(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Re(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = Me.get(e.strings);
		return t === void 0 && Me.set(e.strings, t = new Ie(e)), t;
	}
	k(t) {
		be(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(ve()), this.O(ve()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = ue(e).nextSibling;
			ue(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, Be = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = _, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = _;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = Le(this, e, t, 0), a = !ye(e) || e !== this._$AH && e !== je, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = Le(this, r[n + o], t, o), s === je && (s = this._$AH[o]), a ||= !ye(s) || s !== this._$AH[o], s === _ ? e = _ : e !== _ && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === _ ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Ve = class extends Be {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === _ ? void 0 : e;
	}
}, He = class extends Be {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== _);
	}
}, Ue = class extends Be {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = Le(this, e, t, 0) ?? _) === je) return;
		let n = this._$AH, r = e === _ && n !== _ || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== _ && (n === _ || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, We = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		Le(this, e);
	}
}, Ge = {
	M: pe,
	P: me,
	A: he,
	C: 1,
	L: Fe,
	R: Re,
	D: xe,
	V: Le,
	I: ze,
	H: Be,
	N: He,
	U: Ue,
	B: Ve,
	F: We
}, Ke = le.litHtmlPolyfillSupport;
Ke?.(Ie, ze), (le.litHtmlVersions ??= []).push("3.3.3");
var qe = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new ze(t.insertBefore(ve(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Je = globalThis, v = class extends ce {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = qe(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return je;
	}
};
v._$litElement$ = !0, v.finalized = !0, Je.litElementHydrateSupport?.({ LitElement: v });
var Ye = Je.litElementPolyfillSupport;
Ye?.({ LitElement: v }), (Je.litElementVersions ??= []).push("4.2.2");
// node_modules/@mdi/js/mdi.js
var Xe = "M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z", Ze = "M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z", Qe = "M3,5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5M11,6V14.5L7.5,11L6.08,12.42L12,18.34L17.92,12.42L16.5,11L13,14.5V6H11Z", $e = "M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z", et = "M21,19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19C20.11,3 21,3.9 21,5V19M13,18V9.5L16.5,13L17.92,11.58L12,5.66L6.08,11.58L7.5,13L11,9.5V18H13Z", tt = "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z", nt = "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z", rt = "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z", it = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z", at = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z", ot = "M3 6H21V4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H7V18H3V6M13 12H9V13.78C8.39 14.33 8 15.11 8 16C8 16.89 8.39 17.67 9 18.22V20H13V18.22C13.61 17.67 14 16.88 14 16S13.61 14.33 13 13.78V12M11 17.5C10.17 17.5 9.5 16.83 9.5 16S10.17 14.5 11 14.5 12.5 15.17 12.5 16 11.83 17.5 11 17.5M22 8H16C15.5 8 15 8.5 15 9V19C15 19.5 15.5 20 16 20H22C22.5 20 23 19.5 23 19V9C23 8.5 22.5 8 22 8M21 18H17V10H21V18Z", st = "M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z", ct = "M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z", lt = "M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.78 14.43 12.46 13.77 12.33 13C12.21 12.26 12.23 11.63 12.5 10.94C12.69 11.32 12.89 11.7 13.13 12C13.9 13 15.11 13.44 15.37 14.8C15.41 14.94 15.43 15.08 15.43 15.23C15.46 16.05 15.1 16.95 14.5 17.5H14.5Z", ut = "M22.11 21.46L2.39 1.73L1.11 3L7.09 9C5.66 10.36 4.88 12.47 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C17.1 19.26 17.15 19.18 17.22 19.11L20.84 22.73L22.11 21.46M8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C7 12.47 6.74 10.69 7.26 9.15L8.58 10.47C8.58 11.4 8.73 12.33 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.66 15 12.66 14.76 12.64 14.53L15 16.88C14.85 17.11 14.69 17.33 14.5 17.5M18.92 15.72L9.65 6.46C10.12 5.65 10.72 4.92 11.46 4.32C12.17 3.75 13 3.23 13.95 3C13 4.85 13.33 7.26 14.82 8.72C15.46 9.35 16.22 9.78 16.89 10.38C17.15 10.64 17.43 10.9 17.66 11.2C17.66 11.2 18.22 12 18.43 12.46L18.56 12.72C18.96 13.69 19.06 14.72 18.92 15.72Z", dt = "M13 24C9.74 24 6.81 22 5.6 19L2.57 11.37C2.26 10.58 3 9.79 3.81 10.05L4.6 10.31C5.16 10.5 5.62 10.92 5.84 11.47L7.25 15H8V3.25C8 2.56 8.56 2 9.25 2S10.5 2.56 10.5 3.25V12H11.5V1.25C11.5 .56 12.06 0 12.75 0S14 .56 14 1.25V12H15V2.75C15 2.06 15.56 1.5 16.25 1.5C16.94 1.5 17.5 2.06 17.5 2.75V12H18.5V5.75C18.5 5.06 19.06 4.5 19.75 4.5S21 5.06 21 5.75V16C21 20.42 17.42 24 13 24Z", ft = "M19 8C20.11 8 21 8.9 21 10V16.76C21.61 17.31 22 18.11 22 19C22 20.66 20.66 22 19 22C17.34 22 16 20.66 16 19C16 18.11 16.39 17.31 17 16.76V10C17 8.9 17.9 8 19 8M19 9C18.45 9 18 9.45 18 10V11H20V10C20 9.45 19.55 9 19 9M5 20V12H2L12 3L16.4 6.96C15.54 7.69 15 8.78 15 10V16C14.37 16.83 14 17.87 14 19L14.1 20H5Z", pt = "M10 2C13.9 2 17 5.1 17 9C17 11.4 15.8 13.5 14 14.7V17C14 17.6 13.6 18 13 18H7C6.4 18 6 17.6 6 17V14.7C4.2 13.5 3 11.4 3 9C3 5.1 6.1 2 10 2M7 21V20H13V21C13 21.6 12.6 22 12 22H8C7.4 22 7 21.6 7 21M10 4C7.2 4 5 6.2 5 9C5 11.1 6.2 12.8 8 13.6V16H12V13.6C13.8 12.8 15 11.1 15 9C15 6.2 12.8 4 10 4M19 12V7H21V13H19M19 17V15H21V17H19Z", mt = "M12,2C9.76,2 7.78,3.05 6.5,4.68L7.93,6.11C8.84,4.84 10.32,4 12,4A5,5 0 0,1 17,9C17,10.68 16.16,12.16 14.89,13.06L16.31,14.5C17.94,13.21 19,11.24 19,9A7,7 0 0,0 12,2M3.28,4L2,5.27L5.04,8.3C5,8.53 5,8.76 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H14.73L18.73,22L20,20.72L3.28,4M7.23,10.5L12.73,16H10V13.58C8.68,13 7.66,11.88 7.23,10.5M9,20V21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9Z", ht = "M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63Z", gt = "M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M11,18H13V15.87C14.73,15.43 16,13.86 16,12A4,4 0 0,0 12,8A4,4 0 0,0 8,12C8,13.86 9.27,15.43 11,15.87V18Z", _t = "M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z", vt = "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z", yt = "M19,13H5V11H19V13Z", bt = "M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z", xt = "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z", St = "M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z", Ct = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z", wt = "M2 21V15H3.5C3.18 14.06 3 13.05 3 12C3 7.03 7.03 3 12 3H22V9H20.5C20.82 9.94 21 10.95 21 12C21 16.97 16.97 21 12 21H2M5 12C5 13.28 5.34 14.47 5.94 15.5L9.4 13.5C9.15 13.06 9 12.55 9 12C9 11.35 9.21 10.75 9.56 10.26L6.3 7.93C5.5 9.08 5 10.5 5 12M12 19C14.59 19 16.85 17.59 18.06 15.5L14.6 13.5C14.08 14.4 13.11 15 12 15L11.71 15L11.33 18.97L12 19M12 9C13.21 9 14.26 9.72 14.73 10.76L18.37 9.1C17.27 6.68 14.83 5 12 5V9M12 11C11.45 11 11 11.45 11 12C11 12.55 11.45 13 12 13C12.55 13 13 12.55 13 12C13 11.45 12.55 11 12 11Z", Tt = "M22.1 21.5L2.4 1.7L1.1 3L4.8 6.7C3.7 8.2 3 10 3 12C3 13 3.2 14.1 3.5 15H2V21H12C14 21 15.8 20.3 17.3 19.2L20.8 22.7L22.1 21.5M5.9 15.5C5.3 14.5 5 13.3 5 12C5 10.6 5.5 9.2 6.2 8.1L9.2 11.1C9.1 11.3 9 11.7 9 12C9 12.5 9.2 13.1 9.4 13.5L5.9 15.5M12 19H11.3L11.7 15H12C12.3 15 12.6 14.9 12.9 14.8L15.9 17.8C14.8 18.5 13.4 19 12 19M12 8.8L7.4 4.2C8.8 3.5 10.3 3 12 3H22V9H20.5C20.8 9.9 21 11 21 12C21 13.7 20.5 15.2 19.8 16.6L12.2 9C13.3 9.1 14.3 9.8 14.7 10.7L18.3 9C17.3 6.7 14.8 5 12 5V8.8Z", Et = "M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z", Dt = "M20 19V3H4V19H2V21H22V19H20M6 19V13H11V14.8C10.6 15.1 10.2 15.6 10.2 16.2C10.2 17.2 11 18 12 18S13.8 17.2 13.8 16.2C13.8 15.6 13.5 15.1 13 14.8V13H18V19H6Z", Ot = "M11,13.5V21.5H3V13.5H11M12,2L17.5,11H6.5L12,2M17.5,13C20,13 22,15 22,17.5C22,20 20,22 17.5,22C15,22 13,20 13,17.5C13,15 15,13 17.5,13Z", kt = "M12,16A3,3 0 0,1 9,13C9,11.88 9.61,10.9 10.5,10.39L20.21,4.77L14.68,14.35C14.18,15.33 13.17,16 12,16M12,3C13.81,3 15.5,3.5 16.97,4.32L14.87,5.53C14,5.19 13,5 12,5A8,8 0 0,0 4,13C4,15.21 4.89,17.21 6.34,18.65H6.35C6.74,19.04 6.74,19.67 6.35,20.06C5.96,20.45 5.32,20.45 4.93,20.07V20.07C3.12,18.26 2,15.76 2,13A10,10 0 0,1 12,3M22,13C22,15.76 20.88,18.26 19.07,20.07V20.07C18.68,20.45 18.05,20.45 17.66,20.06C17.27,19.67 17.27,19.04 17.66,18.65V18.65C19.11,17.2 20,15.21 20,13C20,12 19.81,11 19.46,10.1L20.67,8C21.5,9.5 22,11.18 22,13Z", At = "M18,18H6V6H18V18Z", jt = "M7.5,2C5.71,3.15 4.5,5.18 4.5,7.5C4.5,9.82 5.71,11.85 7.53,13C4.46,13 2,10.54 2,7.5A5.5,5.5 0 0,1 7.5,2M19.07,3.5L20.5,4.93L4.93,20.5L3.5,19.07L19.07,3.5M12.89,5.93L11.41,5L9.97,6L10.39,4.3L9,3.24L10.75,3.12L11.33,1.47L12,3.1L13.73,3.13L12.38,4.26L12.89,5.93M9.59,9.54L8.43,8.81L7.31,9.59L7.65,8.27L6.56,7.44L7.92,7.35L8.37,6.06L8.88,7.33L10.24,7.36L9.19,8.23L9.59,9.54M19,13.5A5.5,5.5 0 0,1 13.5,19C12.28,19 11.15,18.6 10.24,17.93L17.93,10.24C18.6,11.15 19,12.28 19,13.5M14.6,20.08L17.37,18.93L17.13,22.28L14.6,20.08M18.93,17.38L20.08,14.61L22.28,17.15L18.93,17.38M20.08,12.42L18.94,9.64L22.28,9.88L20.08,12.42M9.63,18.93L12.4,20.08L9.87,22.27L9.63,18.93Z", Mt = "M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9M8 12H16V14H8V12M8 15H16V17H8V15M8 18H16V20H8V18Z", Nt = "M2 4H20V8H18V20H16V8H6V20H4V8H2V4M7 9H15V11H7V9M7 12H15V14H7V12M20 19V17H22V19H20M20 15V10H22V15H20Z", Pt = "M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9Z", y = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, Ft = {
	attribute: !0,
	type: String,
	converter: ae,
	reflect: !1,
	hasChanged: oe
}, It = (e = Ft, t, n) => {
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
function b(e) {
	return (t, n) => typeof n == "object" ? It(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function x(e) {
	return b({
		...e,
		state: !0,
		attribute: !1
	});
}
// src/types.ts
var Lt = "homex-changed", S = (e) => e.dispatchEvent(new CustomEvent(Lt, {
	bubbles: !0,
	composed: !0
})), Rt = async (e) => (await e.callWS({ type: "homex/layouts" })).layouts || [], zt = (e, t) => e.callWS({
	type: "homex/layout/save",
	layout: t
}), Bt = (e, t) => e.callWS({
	type: "homex/layout/delete",
	layout_id: t
}), Vt = async (e) => (await e.callWS({ type: "homex/switches" })).switches || [], Ht = (e, t, n = !1) => e.callWS({
	type: "homex/switch/save",
	switch: t,
	create: n
}), Ut = (e, t) => e.callWS({
	type: "homex/switch/remove",
	switch_id: t
}), Wt = async (e) => (await e.callWS({ type: "homex/presets" })).presets || [], Gt = (e, t) => e.callWS({
	type: "homex/preset/save",
	preset: t
}), Kt = (e, t) => e.callWS({
	type: "homex/preset/delete",
	preset_id: t
}), qt = async (e) => (await e.callWS({ type: "homex/switch_models" })).models || [], Jt = async (e) => (await e.callWS({ type: "homex/switch_devices" })).devices || [], Yt = async (e) => (await e.callWS({ type: "homex/shutter_models" })).models || [], Xt = (e, t) => e.callWS({
	type: "homex/z2m/state",
	device_id: t
}), Zt = async (e) => (await e.callWS({ type: "homex/shutter_presets" })).presets || [], Qt = (e, t) => e.callWS({
	type: "homex/shutter_preset/save",
	preset: t
}), $t = (e, t) => e.callWS({
	type: "homex/shutter_preset/delete",
	preset_id: t
}), en = async (e) => (await e.callWS({ type: "homex/rooms" })).rooms || [], tn = (e, t) => e.callWS({
	type: "homex/room/create",
	...t
}), nn = (e, t, n = !0) => e.callWS({
	type: "homex/room/delete",
	entry_id: t,
	delete_scenes: n
}), rn = (e, t, n) => e.callWS({
	type: "homex/shutter_group/add",
	entry_id: t,
	name: n
}), an = (e, t) => e.callWS({
	type: "homex/shutter_group/update",
	...t
}), on = (e, t, n) => e.callWS({
	type: "homex/shutter_group/delete",
	entry_id: t,
	group_id: n
}), sn = async (e, t) => (await e.callWS({
	type: "homex/device_triggers",
	device_id: t
})).triggers || [], cn = (e, t) => e.callWS({
	type: "homex/room/update",
	...t
}), ln = (e, t) => e.callWS({
	type: "homex/room/sync_labels",
	entry_id: t
}), un = (e, t, n) => e.callWS({
	type: "homex/room/dim",
	entry_id: t,
	delta: n
}), dn = (e, t, n, r) => e.callWS({
	type: "homex/room/shutter",
	entry_id: t,
	group_id: n,
	service: r
}), fn = (e, t) => e.callWS({
	type: "homex/group/add",
	...t
}), pn = (e, t) => e.callWS({
	type: "homex/group/update",
	...t
}), mn = (e, t, n) => e.callWS({
	type: "homex/group/delete",
	entry_id: t,
	group_id: n
}), hn = (e, t, n, r, i) => e.callWS({
	type: "homex/scene/add",
	entry_id: t,
	name: n,
	...r ? { attach: r } : {},
	...i ? { triggers: i } : {}
}), gn = (e, t, n) => e.callWS({
	type: "homex/scene/delete",
	entry_id: t,
	key: n
}), _n = (e, t, n) => e.callWS({
	type: "homex/scene/reorder",
	entry_id: t,
	order: n
}), vn = (e, t) => e.callWS({
	type: "homex/scene/next",
	entry_id: t
}), yn = (e, t, n, r, i) => e.callWS({
	type: "homex/scene/rename",
	entry_id: t,
	key: n,
	name: r,
	...i ? { triggers: i } : {}
}), C = (e) => e && (e.message || e.code) || String(e), bn = async (e) => e.callWS({ type: "homex/heating" }), xn = (e, t, n) => e.callWS({
	type: "homex/heating/preset/save",
	preset: t,
	create: n
}), Sn = (e, t) => e.callWS({
	type: "homex/heating/preset/delete",
	preset_id: t
}), Cn = (e, t, n) => e.callWS({
	type: "homex/heating/group/save",
	group: t,
	create: n
}), wn = (e, t) => e.callWS({
	type: "homex/heating/group/delete",
	group_id: t
}), Tn = async (e) => (await e.callWS({ type: "homex/heating/models" })).models || [], En = async (e, t, n) => (await e.callWS({
	type: "homex/heating/device_preset/save",
	preset: t,
	create: n
})).results || [], Dn = (e, t) => e.callWS({
	type: "homex/heating/device_preset/delete",
	preset_id: t
}), On = async (e, t) => (await e.callWS({
	type: "homex/heating/device_preset/apply",
	preset_id: t
})).results || [], kn = (e, t, n) => e.callWS({
	type: "homex/heating/zone/save",
	zone: t,
	create: n
}), An = (e, t) => e.callWS({
	type: "homex/heating/zone/delete",
	zone_id: t
}), jn = (e, t, n) => e.callWS({
	type: "homex/heating/zone/set_mode",
	zone_id: t,
	mode_id: n
}), Mn = (e, t, n) => e.callWS({
	type: "homex/heating/room_zone",
	room_id: t,
	zone_id: n
}), Nn = (e, t) => e.callWS({
	type: "homex/heating/enabled",
	enabled: t
}), Pn = (e, t, n) => e.callWS({
	type: "homex/heating/system/save",
	system: t,
	create: n
}), Fn = (e, t) => e.callWS({
	type: "homex/heating/system/delete",
	system_id: t
}), In = null, Ln = () => !!customElements.get("ha-entities-picker");
function Rn() {
	return Ln() ? Promise.resolve(!0) : In || (In = (async () => {
		try {
			let e = await window.loadCardHelpers?.();
			if (e?.createCardElement) {
				let t = (await e.createCardElement({
					type: "entities",
					entities: []
				}))?.constructor;
				t?.getConfigElement && await t.getConfigElement();
			}
		} catch {}
		return Ln();
	})(), In);
}
// src/lib/router.ts
var zn = (e = "") => e.split("/").filter(Boolean).map(decodeURIComponent), w = (e, ...t) => [e.replace(/\/+$/, ""), ...t.filter(Boolean).map(encodeURIComponent)].join("/");
function T(e, t = !1) {
	t ? history.replaceState(history.state, "", e) : history.pushState({ homexFrom: location.pathname }, "", e), window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: t } }));
}
function E(e) {
	history.state?.homexFrom === e ? history.back() : T(e, !0);
}
function Bn(e, t) {
	t && (t.metaKey || t.ctrlKey || t.shiftKey || t.button === 1) ? window.open(e, "_blank", "noopener") : (t?.preventDefault(), T(e));
}
// src/lib/device.ts
function Vn(e, t) {
	let n = (e.devices || {})[t];
	return n ? `${n.manufacturer || ""}|${n.model || n.model_id || ""}` : "";
}
function Hn(e, t) {
	let n = (e.devices || {})[t];
	return n ? [n.manufacturer, n.model || n.model_id].filter(Boolean).join(" ") || "modèle inconnu" : "";
}
function Un(e, t, n) {
	let r = Vn(e, n);
	return r ? t.filter((e) => e.model === r) : [];
}
function Wn(e, t, n) {
	let r = Un(e, t, n.device_id);
	if (n.preset_id) {
		let e = r.find((e) => e.id === n.preset_id);
		if (e) return e;
	}
	return r[0];
}
// src/lib/climate.ts
function Gn(e, t) {
	return Object.values(e.entities || {}).filter((e) => e.device_id === t && e.entity_id.startsWith("climate.")).map((e) => e.entity_id).sort((e, t) => e.length - t.length)[0];
}
var Kn = .5;
function qn(e) {
	let t = e?.attributes ?? {}, n = Number(t.temperature), r = Number(t.current_temperature);
	return t.hvac_action === "heating" && t.temperature != null && t.current_temperature != null && !Number.isNaN(n) && !Number.isNaN(r) && r >= n + Kn;
}
function Jn(e, t) {
	return (t.heating?.radiators ?? []).flatMap((t) => {
		let n = Gn(e, t.device_id), r = n ? e.states[n] : void 0;
		if (!qn(r)) return [];
		let i = e.devices?.[t.device_id];
		return [i?.name_by_user || i?.name || r.attributes?.friendly_name || n];
	});
}
function Yn(e, t) {
	let n = Jn(e, t);
	return n.length ? `Chauffe alors que la température dépasse la consigne : ${n.join(", ")}. Vanne bloquée ouverte ou état non rafraîchi — vérifie le radiateur.` : "";
}
function Xn(e, t) {
	return (t.heating?.radiators ?? []).some((t) => {
		let n = Gn(e, t.device_id);
		return !!n && e.states[n]?.attributes?.hvac_action === "heating";
	});
}
function Zn(e, t) {
	let n = Object.values(e.states || {}).filter((e) => e.entity_id.startsWith("select.homex_heating_")), r = n.find((e) => (e.attributes?.rooms ?? []).includes(t.room_id)) ?? n.find((e) => e.attributes?.zone_id === "default");
	if (!r || r.state === "unavailable" || r.state === "unknown") return;
	let i = String(r.attributes?.zone_name ?? r.attributes?.zone_id ?? "");
	return t.heating?.enabled === !1 ? {
		zone: i,
		mode: r.attributes?.modes?.unheated ?? "Unheated",
		own: !0
	} : {
		zone: i,
		mode: r.state,
		own: !1
	};
}
// src/lib/shutter.ts
var Qn = {
	open: Pt,
	closed: Mt,
	partial: Dt,
	opening: et,
	closing: Qe,
	unavailable: Nt
}, $n = {
	open: "Ouvert",
	closed: "Fermé",
	partial: "Entrouvert",
	opening: "Ouverture…",
	closing: "Fermeture…",
	unavailable: "Indisponible"
};
function er(e, t) {
	let n = e.states[t];
	if (!n) return null;
	let r = n.attributes?.current_position;
	return typeof r == "number" ? r : n.state === "open" ? 100 : n.state === "closed" ? 0 : null;
}
function tr(e, t) {
	let n = t.map((t) => e.states[t]).filter((e) => e && e.state !== "unavailable" && e.state !== "unknown"), r = n.map((t) => er(e, t.entity_id)).filter((e) => e !== null), i = r.length ? Math.round(r.reduce((e, t) => e + t, 0) / r.length) : null, a = n.length ? n.some((e) => e.state === "opening") ? "opening" : n.some((e) => e.state === "closing") ? "closing" : r.every((e) => e === 0) ? "closed" : r.every((e) => e === 100) ? "open" : "partial" : "unavailable";
	return {
		state: a,
		position: i,
		icon: Qn[a],
		label: $n[a]
	};
}
function nr(e) {
	let t = (e.shutter_groups ?? []).filter((e) => e.devices?.length);
	return t.find((e) => !e.removable) ?? t[0];
}
// src/lib/styles.ts
var D = o`
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
// \0@oxc-project+runtime@0.156.0/helpers/esm/decorate.js
function O(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/components/homex-unit-controls.ts
var rr = class extends v {
	constructor(...e) {
		super(...e), this.hideToggle = !1, this.hideId = !1, this.info = [];
	}
	_isOn(e) {
		return this.hass.states[e]?.state === "on";
	}
	_lightState(e) {
		let t = this.unit;
		return !t.group_id && e ? this.hass.states[t.switch]?.attributes?.active_scene == null ? "stray" : "lit" : e ? "lit" : (t.devices ?? []).some((e) => this._isOn(e)) || this._isOn(t.light) ? "stray" : "off";
	}
	_toggle(e) {
		e.stopPropagation();
		let t = this.unit;
		if (t.group_id) {
			this.hass.callService("switch", "toggle", { entity_id: t.switch });
			return;
		}
		let n = this.hass.states[t.switch]?.attributes?.active_scene != null;
		this.hass.callService("switch", n ? "turn_off" : "turn_on", { entity_id: t.switch });
	}
	render() {
		let e = this.unit, t = this._isOn(e.switch), n = this._lightState(t), r = n === "lit" ? `Allumée${this.activeScene ? ` · ${this.activeScene}` : ""} — éteindre` : n === "stray" ? "Éteinte, mais au moins une lumière est allumée — allumer" : "Allumer";
		return h`
      <div class="controls">
        ${this.hideToggle ? "" : h`<button
              class="bulb ${t ? "on" : ""}"
              title=${r}
              @click=${this._toggle}
            >
              <svg viewBox="0 0 24 24">
                <path
                  d=${n === "lit" ? gt : n === "stray" ? pt : _t}
                ></path>
              </svg>
            </button>`}
        ${this.areaIcon ? h`<ha-icon class="area-icon" .icon=${this.areaIcon}></ha-icon>` : ""}
        <div class="title">
          <div class="line1">
            <strong>${e.name}</strong>
          </div>
          ${this.hideId && !this.floorName ? "" : h`<div class="line2">
                ${this.hideId ? "" : h`<span class="rid">${e.group_id || e.room_id}</span>`}
                ${this.floorName ? h`<span class="floor">${this.floorName}</span>` : ""}
              </div>`}
        </div>
        ${this.info.length ? h`<div class="info">${this.info.map((e) => h`<span>${e}</span>`)}</div>` : ""}
      </div>
    `;
	}
}, k = (rr.styles = [D, o`
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
    `], rr);
O([b({ attribute: !1 })], k.prototype, "hass", void 0), O([b({ attribute: !1 })], k.prototype, "unit", void 0), O([b({ attribute: !1 })], k.prototype, "areaIcon", void 0), O([b({ attribute: !1 })], k.prototype, "floorName", void 0), O([b({ attribute: !1 })], k.prototype, "activeScene", void 0), O([b({ type: Boolean })], k.prototype, "hideToggle", void 0), O([b({ type: Boolean })], k.prototype, "hideId", void 0), O([b({ attribute: !1 })], k.prototype, "info", void 0), k = O([y("homex-unit-controls")], k);
// src/lib/fields.ts
var A = (e, t, n, r = "") => h`<div class="field">
  <span>${e}</span>
  <input
    .value=${t ?? ""}
    placeholder=${r}
    @input=${(e) => n(e.target.value)}
  />
</div>`, j = (e, t, n = !1) => h`<span class="toggle ${e ? "on" : ""}">
  <input
    type="checkbox"
    .checked=${e}
    ?disabled=${n}
    @change=${(e) => t(e.target.checked)}
  />
  <span class="knob"></span>
</span>`, ir = /[̀-ͯ]/g, M = (e) => (e || "").normalize("NFD").replace(ir, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""), ar = class extends v {
	constructor(...e) {
		super(...e), this.open = !1, this.heading = "", this.compact = !1;
	}
	_close() {
		this.dispatchEvent(new CustomEvent("dialog-closed"));
	}
	render() {
		return this.open ? h`
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
    ` : h``;
	}
}, or = (ar.styles = o`
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
  `, ar);
O([b({ type: Boolean })], or.prototype, "open", void 0), O([b()], or.prototype, "heading", void 0), O([b({
	type: Boolean,
	reflect: !0
})], or.prototype, "compact", void 0), or = O([y("homex-dialog")], or);
// node_modules/lit-html/directive.js
var sr = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, cr = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), lr = class {
	constructor(e) {}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AT(e, t, n) {
		this._$Ct = e, this._$AM = t, this._$Ci = n;
	}
	_$AS(e, t) {
		return this.update(e, t);
	}
	update(e, t) {
		return this.render(...t);
	}
}, { I: ur } = Ge, dr = (e) => e, fr = () => document.createComment(""), pr = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new ur(r.insertBefore(fr(), i), r.insertBefore(fr(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = dr(e).nextSibling;
				dr(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, mr = (e, t, n = e) => (e._$AI(t, n), e), hr = {}, gr = (e, t = hr) => e._$AH = t, _r = (e) => e._$AH, vr = (e) => {
	e._$AR(), e._$AA.remove();
}, yr = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, br = cr(class extends lr {
	constructor(e) {
		if (super(e), e.type !== sr.CHILD) throw Error("repeat() can only be used in text expressions");
	}
	dt(e, t, n) {
		let r;
		n === void 0 ? n = t : t !== void 0 && (r = t);
		let i = [], a = [], o = 0;
		for (let t of e) i[o] = r ? r(t, o) : o, a[o] = n(t, o), o++;
		return {
			values: a,
			keys: i
		};
	}
	render(e, t, n) {
		return this.dt(e, t, n).values;
	}
	update(e, [t, n, r]) {
		let i = _r(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, u, d = 0, f = i.length - 1, p = 0, m = a.length - 1;
		for (; d <= f && p <= m;) if (i[d] === null) d++;
		else if (i[f] === null) f--;
		else if (s[d] === o[p]) c[p] = mr(i[d], a[p]), d++, p++;
		else if (s[f] === o[m]) c[m] = mr(i[f], a[m]), f--, m--;
		else if (s[d] === o[m]) c[m] = mr(i[d], a[m]), pr(e, c[m + 1], i[d]), d++, m--;
		else if (s[f] === o[p]) c[p] = mr(i[f], a[p]), pr(e, i[d], i[f]), f--, p++;
		else if (l === void 0 && (l = yr(o, p, m), u = yr(s, d, f)), l.has(s[d])) {
			if (l.has(s[f])) {
				let t = u.get(o[p]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = pr(e, i[d]);
					mr(t, a[p]), c[p] = t;
				} else c[p] = mr(n, a[p]), pr(e, i[d], n), i[t] = null;
				p++;
			} else vr(i[f]), f--;
		} else vr(i[d]), d++;
		for (; p <= m;) {
			let t = pr(e, c[m + 1]);
			mr(t, a[p]), c[p++] = t;
		}
		for (; d <= f;) {
			let e = i[d++];
			e !== null && vr(e);
		}
		return this.ut = o, gr(e, c), je;
	}
}), xr = cr(class extends lr {
	constructor() {
		super(...arguments), this.key = _;
	}
	render(e, t) {
		return this.key = e, t;
	}
	update(e, [t, n]) {
		return t !== this.key && (gr(e), this.key = t), n;
	}
}), Sr = class extends v {
	constructor(...e) {
		super(...e), this.value = [], this._query = "", this._open = !1;
	}
	_friendly(e) {
		return this.hass?.states?.[e]?.attributes?.friendly_name || e;
	}
	_emit(e) {
		this.value = e, this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: e } }));
	}
	_setAt(e, t) {
		let n = t ? this.value.map((n, r) => r === e ? t : n) : this.value.filter((t, n) => n !== e);
		this._emit([...new Set(n)]);
	}
	_addNew(e) {
		e && !this.value.includes(e) && this._emit([...this.value, e]);
	}
	_nativePicker(e, t, n) {
		return h`<ha-entity-picker
      .hass=${this.hass}
      .value=${e}
      .includeDomains=${this.includeDomains}
      .includeEntities=${this.includeEntities}
      .excludeEntities=${t}
      @value-changed=${(e) => {
			e.stopPropagation(), n(e.detail.value || "");
		}}
    ></ha-entity-picker>`;
	}
	render() {
		return customElements.get("ha-entity-picker") ? h`
        ${br(this.value, (e) => e, (e, t) => this._nativePicker(e, this.value.filter((e, n) => n !== t), (e) => this._setAt(t, e)))}
        ${xr(this.value.length, this._nativePicker("", this.value, (e) => this._addNew(e)))}
      ` : this._renderFallback();
	}
	get _candidates() {
		if (this.includeEntities) return [...this.includeEntities].sort();
		let e = this.includeDomains || [];
		return Object.keys(this.hass.states).filter((t) => e.includes(t.split(".")[0])).sort();
	}
	get _filtered() {
		let e = new Set(this.value), t = this._query.trim().toLowerCase();
		return this._candidates.filter((t) => !e.has(t)).filter((e) => !t || e.toLowerCase().includes(t) || this._friendly(e).toLowerCase().includes(t)).slice(0, 10);
	}
	_add(e) {
		this.value.includes(e) || this._emit([...this.value, e]), this._query = "", this._open = !1;
	}
	_remove(e) {
		this._emit(this.value.filter((t) => t !== e));
	}
	_renderFallback() {
		return h`
      <div class="chips">
        ${this.value.map((e) => h`<span class="chip"
              >${this._friendly(e)}<button
                class="chipx"
                title="Retirer"
                @click=${() => this._remove(e)}
              >
                ×</button
              ></span
            >`)}
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
      ${this._open ? h`<div class="suggestions">
            ${this._filtered.length ? this._filtered.map((e) => h`<div class="sugg" @mousedown=${() => this._add(e)}>
                    <span>${this._friendly(e)}</span><span class="sid">${e}</span>
                  </div>`) : h`<div class="sugg empty">Aucune entité</div>`}
          </div>` : ""}
    `;
	}
}, Cr = (Sr.styles = o`
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
  `, Sr);
O([b({ attribute: !1 })], Cr.prototype, "hass", void 0), O([b({ type: Array })], Cr.prototype, "value", void 0), O([b({ attribute: !1 })], Cr.prototype, "includeDomains", void 0), O([b({ attribute: !1 })], Cr.prototype, "includeEntities", void 0), O([x()], Cr.prototype, "_query", void 0), O([x()], Cr.prototype, "_open", void 0), Cr = O([y("homex-entity-picker")], Cr);
// src/lib/domains.ts
var wr = [
	"light",
	"switch",
	"input_boolean"
], Tr = [
	"binary_sensor",
	"switch",
	"input_boolean",
	"person",
	"device_tracker"
], Er = class extends v {
	constructor(...e) {
		super(...e), this.value = "", this._query = "", this._open = !1;
	}
	_name(e) {
		let t = this.hass?.devices?.[e];
		return t?.name_by_user || t?.name || e;
	}
	_emit(e) {
		this.value = e, this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: e } }));
	}
	get _filtered() {
		let e = this._query.trim().toLowerCase();
		return Object.keys(this.hass.devices || {}).filter((t) => !e || this._name(t).toLowerCase().includes(e)).sort((e, t) => this._name(e).localeCompare(this._name(t))).slice(0, 12);
	}
	render() {
		return customElements.get("ha-device-picker") ? h`<ha-device-picker
        .hass=${this.hass}
        .value=${this.value}
        @value-changed=${(e) => {
			e.stopPropagation(), this._emit(e.detail.value || "");
		}}
      ></ha-device-picker>` : this.value ? h`<div class="selected">
        <span class="name">${this._name(this.value)}</span>
        <button class="clear" title="Effacer" @click=${() => this._emit("")}>×</button>
      </div>` : h`
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
      ${this._open ? h`<div class="suggestions">
            ${this._filtered.length ? this._filtered.map((e) => h`<div
                      class="sugg"
                      @mousedown=${() => {
			this._query = "", this._open = !1, this._emit(e);
		}}
                    >
                      ${this._name(e)}
                    </div>`) : h`<div class="sugg">Aucun appareil</div>`}
          </div>` : ""}
    `;
	}
}, Dr = (Er.styles = o`
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
  `, Er);
O([b({ attribute: !1 })], Dr.prototype, "hass", void 0), O([b()], Dr.prototype, "value", void 0), O([x()], Dr.prototype, "_query", void 0), O([x()], Dr.prototype, "_open", void 0), Dr = O([y("homex-device-field")], Dr);
// src/components/homex-select.ts
var Or, kr = 320, N = (Or = class extends v {
	constructor(...e) {
		super(...e), this.value = "", this.label = "", this.placeholder = "", this.options = [], this.groups = [], this.disabled = !1, this._open = !1, this._active = -1, this._pos = {}, this._none = {
			value: "",
			label: ""
		}, this._onOutside = (e) => {
			e.composedPath().includes(this) || this._close();
		}, this._onViewport = (e) => {
			e.type === "scroll" && e.composedPath().includes(this) || this._close();
		};
	}
	get _flat() {
		return [
			...this.placeholder ? [this._none] : [],
			...this.options,
			...this.groups.flatMap((e) => e.options)
		];
	}
	get _selected() {
		return [...this.options, ...this.groups.flatMap((e) => e.options)].find((e) => e.value === this.value);
	}
	willUpdate() {
		this._none.label = this.placeholder;
	}
	disconnectedCallback() {
		this._close(), super.disconnectedCallback();
	}
	_openPanel() {
		if (this.disabled || this._open) return;
		let e = this.renderRoot.querySelector(".trigger").getBoundingClientRect(), t = window.innerHeight - e.bottom, n = t < Math.min(kr, 220) && e.top > t;
		this._pos = {
			left: `${e.left}px`,
			width: `${e.width}px`,
			...n ? {
				bottom: `${window.innerHeight - e.top + 6}px`,
				maxHeight: `${Math.min(kr, e.top - 12)}px`
			} : {
				top: `${e.bottom + 6}px`,
				maxHeight: `${Math.min(kr, t - 12)}px`
			}
		}, this._active = Math.max(0, this._flat.findIndex((e) => e.value === this.value)), this._open = !0, document.addEventListener("pointerdown", this._onOutside, !0), window.addEventListener("scroll", this._onViewport, !0), window.addEventListener("resize", this._onViewport), this.updateComplete.then(() => this._scrollActive());
	}
	_close() {
		this._open && (this._open = !1, document.removeEventListener("pointerdown", this._onOutside, !0), window.removeEventListener("scroll", this._onViewport, !0), window.removeEventListener("resize", this._onViewport));
	}
	_pick(e) {
		e.disabled || (this._close(), this.renderRoot.querySelector(".trigger")?.focus(), e.value !== this.value && (this.value = e.value, this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: e.value } }))));
	}
	_move(e) {
		let t = this._flat;
		if (!t.length) return;
		let n = this._active;
		for (let r = 0; r < t.length && (n = (n + e + t.length) % t.length, t[n].disabled); r++);
		this._active = n, this.updateComplete.then(() => this._scrollActive());
	}
	_scrollActive() {
		this.renderRoot.querySelector(".option.active")?.scrollIntoView({ block: "nearest" });
	}
	_onKey(e) {
		if (!this._open) [
			"ArrowDown",
			"ArrowUp",
			"Enter",
			" "
		].includes(e.key) && (e.preventDefault(), this._openPanel());
		else if (e.key === "ArrowDown" || e.key === "ArrowUp") e.preventDefault(), this._move(e.key === "ArrowDown" ? 1 : -1);
		else if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			let t = this._flat[this._active];
			t && this._pick(t);
		} else e.key === "Escape" ? (e.preventDefault(), this._close()) : e.key === "Tab" && this._close();
	}
	_renderOption(e) {
		let t = this._flat.indexOf(e), n = e.value === this.value;
		return h`<div
      class="option ${n ? "selected" : ""} ${t === this._active ? "active" : ""} ${e.disabled ? "disabled" : ""}"
      role="option"
      aria-selected=${n ? "true" : "false"}
      aria-disabled=${e.disabled ? "true" : "false"}
      @pointerenter=${() => !e.disabled && (this._active = t)}
      @click=${() => this._pick(e)}
    >
      <div class="texts">
        <span class="line">
          <span class="primary">${e.label}</span>
          ${e.tertiary ? h`<span class="tertiary">${e.tertiary}</span>` : _}
        </span>
        ${e.secondary ? h`<span class="secondary">${e.secondary}</span>` : _}
      </div>
      ${n ? h`<svg class="check" viewBox="0 0 24 24"><path d=${tt}></path></svg>` : _}
    </div>`;
	}
	render() {
		let e = this._selected, t = Object.entries(this._pos).map(([e, t]) => `${e.replace(/[A-Z]/g, (e) => "-" + e.toLowerCase())}:${t}`).join(";");
		return h`
      ${this.label ? h`<span class="label">${this.label}</span>` : _}
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
          ${e ? h`<span class="primary">${e.label}</span>${e.secondary ? h`<span class="secondary">${e.secondary}</span>` : _}` : h`<span class="placeholder">${this.placeholder || "—"}</span>`}
        </span>
        <svg class="chevron" viewBox="0 0 24 24"><path d=${nt}></path></svg>
      </button>
      ${this._open ? h`<div class="panel" role="listbox" style=${t}>
            ${this.placeholder ? this._renderOption(this._none) : _}
            ${this.options.map((e) => this._renderOption(e))}
            ${this.groups.map((e) => h`<div class="group">${e.label}</div>
                ${e.options.map((e) => this._renderOption(e))}`)}
            ${this._flat.length ? _ : h`<div class="empty">Aucune option</div>`}
          </div>` : _}
    `;
	}
}, Or.styles = o`
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
      max-height: ${kr}px;
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
  `, Or);
O([b()], N.prototype, "value", void 0), O([b()], N.prototype, "label", void 0), O([b()], N.prototype, "placeholder", void 0), O([b({ attribute: !1 })], N.prototype, "options", void 0), O([b({ attribute: !1 })], N.prototype, "groups", void 0), O([b({
	type: Boolean,
	reflect: !0
})], N.prototype, "disabled", void 0), O([x()], N.prototype, "_open", void 0), O([x()], N.prototype, "_active", void 0), O([x()], N.prototype, "_pos", void 0), N = O([y("homex-select")], N);
// src/components/homex-trigger-selector.ts
var Ar = class extends v {
	constructor(...e) {
		super(...e), this.value = [], this._menuOpen = !1, this._devTriggers = {};
	}
	willUpdate(e) {
		if (e.has("value")) for (let e of this.value) e?.device_id && this._ensure(e.device_id);
	}
	async _ensure(e) {
		if (!(e in this._devTriggers)) {
			this._devTriggers = {
				...this._devTriggers,
				[e]: []
			};
			try {
				let t = await sn(this.hass, e);
				this._devTriggers = {
					...this._devTriggers,
					[e]: t
				};
			} catch {}
		}
	}
	_emit(e) {
		this.value = e, this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: e } }));
	}
	_update(e, t) {
		this._emit(this.value.map((n, r) => r === e ? t : n));
	}
	_remove(e) {
		this._emit(this.value.filter((t, n) => n !== e));
	}
	_add(e) {
		this._menuOpen = !1, this._emit([...this.value, e === "device" ? {
			platform: "device",
			device_id: ""
		} : { platform: "state" }]);
	}
	_entityOf(e) {
		let t = e?.entity_id;
		return Array.isArray(t) ? t[0] || "" : t || "";
	}
	_deviceTriggerIndex(e) {
		return (this._devTriggers[e.device_id] || []).findIndex((t) => t.trigger.type === e.type && t.trigger.subtype === e.subtype && t.trigger.domain === e.domain);
	}
	_deviceName(e) {
		let t = this.hass?.devices?.[e];
		return t?.name_by_user || t?.name || e;
	}
	_entityType(e) {
		return e?.platform === "numeric_state" ? "numeric" : "state";
	}
	_entityStates(e) {
		let t = e.split(".")[0], n = new Set([
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
		].includes(t) ? ["on", "off"] : []), r = this.hass.states[e]?.state;
		return r && ![
			"unavailable",
			"unknown",
			""
		].includes(r) && n.add(r), [...n];
	}
	_setKey(e, t, n, r) {
		let i = { ...t };
		r === "" || r == null ? delete i[n] : i[n] = r, this._update(e, i);
	}
	_setEntity(e, t, n) {
		let r = t?.platform === "numeric_state" ? "numeric_state" : "state";
		this._update(e, n ? {
			platform: r,
			entity_id: n
		} : { platform: r });
	}
	_setEntityType(e, t, n) {
		let r = {
			platform: n === "numeric" ? "numeric_state" : "state",
			entity_id: this._entityOf(t)
		};
		t.attribute && (r.attribute = t.attribute), t.for && (r.for = t.for), this._update(e, r);
	}
	_entityField(e, t) {
		let n = this._entityOf(e), r = (n) => this._setEntity(t, e, n);
		if (customElements.get("ha-entity-picker")) return h`<ha-entity-picker
        .hass=${this.hass}
        .value=${n}
        .includeDomains=${Tr}
        allow-custom-entity
        @value-changed=${(e) => {
			e.stopPropagation(), r(e.detail.value || "");
		}}
      ></ha-entity-picker>`;
		let i = Object.keys(this.hass.states).filter((e) => Tr.includes(e.split(".")[0])).sort();
		return h`<homex-select
      placeholder="Sélectionnez une entité"
      .value=${n ?? ""}
      .options=${i.map((e) => ({
			value: e,
			label: this.hass.states[e]?.attributes?.friendly_name || e,
			secondary: e
		}))}
      @value-changed=${(e) => r(e.detail.value)}
    ></homex-select>`;
	}
	_entityTypeField(e, t) {
		return h`<label class="field"><span>Type</span>
      <homex-select
        .value=${this._entityType(e)}
        .options=${[{
			value: "state",
			label: "État"
		}, {
			value: "numeric",
			label: "État numérique"
		}]}
        @value-changed=${(n) => this._setEntityType(t, e, n.detail.value)}
      ></homex-select>
    </label>`;
	}
	_attrField(e, t) {
		let n = this._entityOf(e), r = Object.keys(this.hass.states[n]?.attributes || {});
		return h`<label class="field"><span>Attribut (facultatif)</span>
      <homex-select
        placeholder="(état de l'entité)"
        .value=${e.attribute || ""}
        .options=${r.map((e) => ({
			value: e,
			label: e
		}))}
        @value-changed=${(n) => this._setKey(t, e, "attribute", n.detail.value)}
      ></homex-select>
    </label>`;
	}
	_stateValueField(e, t, n, r) {
		let i = this._entityOf(e), a = e[n] == null ? "" : String(e[n]), o = `st-${t}-${n}`;
		return h`<label class="field"><span>${r}</span>
      <input
        class="native"
        list=${o}
        .value=${a}
        @change=${(r) => this._setKey(t, e, n, r.target.value)}
      />
      <datalist id=${o}>
        ${this._entityStates(i).map((e) => h`<option value=${e}></option>`)}
      </datalist>
    </label>`;
	}
	_numField(e, t, n, r) {
		return h`<label class="field"><span>${r}</span>
      <input
        class="native"
        type="number"
        .value=${e[n] == null ? "" : String(e[n])}
        @change=${(r) => {
			let i = r.target.value;
			this._setKey(t, e, n, i === "" ? "" : Number(i));
		}}
      />
    </label>`;
	}
	_forParts(e) {
		let t = e.for;
		if (t && typeof t == "object") return {
			h: t.hours || 0,
			m: t.minutes || 0,
			s: t.seconds || 0
		};
		if (typeof t == "string") {
			let e = t.split(":").map(Number);
			return {
				h: e[0] || 0,
				m: e[1] || 0,
				s: e[2] || 0
			};
		}
		return typeof t == "number" ? {
			h: 0,
			m: 0,
			s: t
		} : {
			h: 0,
			m: 0,
			s: 0
		};
	}
	_setForPart(e, t, n, r) {
		let i = this._forParts(e);
		i[n] = isNaN(r) || r < 0 ? 0 : Math.floor(r);
		let a = i.h + i.m + i.s;
		this._setKey(t, e, "for", a ? {
			hours: i.h,
			minutes: i.m,
			seconds: i.s
		} : "");
	}
	_forField(e, t) {
		let n = this._forParts(e), r = (n, r, i) => h`<input
      type="number"
      min="0"
      placeholder=${i}
      .value=${r ? String(r) : ""}
      @change=${(r) => this._setForPart(e, t, n, Number(r.target.value))}
    />`;
		return h`<label class="field"><span>Pendant (facultatif)</span>
      <div class="dur-row">
        ${r("h", n.h, "hh")}<span>:</span>${r("m", n.m, "mm")}<span>:</span>${r("s", n.s, "ss")}
      </div>
    </label>`;
	}
	_entityBody(e, t) {
		if (!this._entityOf(e)) return "";
		let n = this._entityType(e) === "numeric";
		return h`
      ${this._entityTypeField(e, t)}
      ${this._attrField(e, t)}
      ${n ? h`${this._numField(e, t, "above", "Au-dessus de (facultatif)")}
            ${this._numField(e, t, "below", "En-dessous de (facultatif)")}` : h`${this._stateValueField(e, t, "from", "De (facultatif)")}
            ${this._stateValueField(e, t, "to", "À (facultatif)")}`}
      ${this._forField(e, t)}
    `;
	}
	_deviceField(e, t) {
		return h`<homex-device-field
      .hass=${this.hass}
      .value=${e.device_id || ""}
      @value-changed=${(e) => {
			e.stopPropagation();
			let n = e.detail.value || "";
			n && this._ensure(n), this._update(t, {
				platform: "device",
				device_id: n
			});
		}}
    ></homex-device-field>`;
	}
	_actionField(e, t) {
		let n = this._devTriggers[e.device_id] || [], r = this._deviceTriggerIndex(e);
		return h`<homex-select
      placeholder="Sélectionnez une action"
      .value=${r >= 0 ? String(r) : ""}
      .options=${n.map((e, t) => ({
			value: String(t),
			label: e.label
		}))}
      @value-changed=${(n) => {
			let r = (this._devTriggers[e.device_id] || [])[Number(n.detail.value)];
			r && this._update(t, { ...r.trigger });
		}}
    ></homex-select>`;
	}
	_card(e, t) {
		let n = !!e?.device_id || e?.platform === "device";
		return h`<div class="card">
      <div class="head">
        <svg viewBox="0 0 24 24"><path d=${n ? ot : Ot}></path></svg>
        <span class="title">${n ? "Appareil" : "Entité"}</span>
        <button class="icon-btn" title="Supprimer" @click=${() => this._remove(t)}>
          <svg viewBox="0 0 24 24"><path d=${it}></path></svg>
        </button>
      </div>
      <div class="body">
        ${n ? h`<label class="field"><span>Appareil</span>${this._deviceField(e, t)}</label>
              ${e.device_id ? h`<label class="field"><span>Action</span>${this._actionField(e, t)}</label>` : ""}` : h`<label class="field"><span>Entité</span>${this._entityField(e, t)}</label>
              ${this._entityBody(e, t)}`}
      </div>
    </div>`;
	}
	render() {
		return h`
      ${this.value.map((e, t) => this._card(e, t))}
      <div class="add-wrap">
        <button class="add-btn" @click=${() => this._menuOpen = !this._menuOpen}>
          <svg viewBox="0 0 24 24"><path d=${Ct}></path></svg>
          Ajouter un déclencheur
        </button>
        ${this._menuOpen ? h`
              <div class="backdrop" @click=${() => this._menuOpen = !1}></div>
              <div class="menu">
                <button @click=${() => this._add("entity")}>
                  <svg viewBox="0 0 24 24"><path d=${Ot}></path></svg> Entité
                </button>
                <button @click=${() => this._add("device")}>
                  <svg viewBox="0 0 24 24"><path d=${ot}></path></svg> Appareil
                </button>
              </div>
            ` : ""}
      </div>
    `;
	}
}, jr = (Ar.styles = o`
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
  `, Ar);
O([b({ attribute: !1 })], jr.prototype, "hass", void 0), O([b({ attribute: !1 })], jr.prototype, "value", void 0), O([x()], jr.prototype, "_menuOpen", void 0), O([x()], jr.prototype, "_devTriggers", void 0), jr = O([y("homex-trigger-selector")], jr);
// src/components/homex-managed-triggers.ts
var Mr = class extends v {
	constructor(...e) {
		super(...e), this.triggers = [];
	}
	render() {
		return this.triggers?.length ? h`<div class="list">
      ${this.triggers.map((e) => h`<div class="row">
          <span class="icon">🎛</span>
          <span class="lbl">${e}</span>
          <span class="tag">Géré par le module Switches</span>
        </div>`)}
    </div>` : h``;
	}
}, Nr = (Mr.styles = o`
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
  `, Mr);
O([b({ attribute: !1 })], Nr.prototype, "triggers", void 0), Nr = O([y("homex-managed-triggers")], Nr);
// src/components/homex-group-dialog.ts
var Pr = class extends v {
	constructor(...e) {
		super(...e), this.open = !1, this.group = null, this._name = "", this._id = "", this._devices = [], this._triggers = [], this._dim = !1, this._dimUp = [], this._dimDown = [], this._busy = !1, this._idEdited = !1;
	}
	willUpdate(e) {
		e.has("open") && this.open && (this._name = this.group?.name ?? "", this._id = this.group?.group_id ?? "", this._devices = this.group?.devices ?? [], this._triggers = (this.group?.triggers ?? []).map((e) => ({ ...e })), this._dim = this.group?.dim ?? !1, this._dimUp = (this.group?.dim_up_triggers ?? []).map((e) => ({ ...e })), this._dimDown = (this.group?.dim_down_triggers ?? []).map((e) => ({ ...e })), this._busy = !1, this._idEdited = !!this.group);
	}
	_onName(e) {
		this._name = e, this._idEdited || (this._id = M(e));
	}
	_onId(e) {
		this._id = e, this._idEdited = !0;
	}
	_close() {
		this.dispatchEvent(new CustomEvent("dialog-closed"));
	}
	async _save() {
		let e = this._name.trim(), t = this._id.trim();
		if (!e || !t) {
			alert("Nom et id du groupe requis.");
			return;
		}
		let n = this._triggers, r = {
			dim: this._dim,
			dim_up_triggers: this._dim ? this._dimUp : [],
			dim_down_triggers: this._dim ? this._dimDown : []
		};
		this._busy = !0;
		try {
			this.group ? await pn(this.hass, {
				entry_id: this.room.entry_id,
				group_id: this.group.group_id,
				name: e,
				devices: this._devices,
				triggers: n,
				...r
			}) : await fn(this.hass, {
				entry_id: this.room.entry_id,
				group_id: t,
				name: e,
				devices: this._devices,
				triggers: n,
				...r
			}), S(this), this._close();
		} catch (e) {
			this._busy = !1, alert("Erreur Homex : " + C(e));
		}
	}
	async _delete() {
		if (this.group && confirm(`Supprimer le groupe "${this.group.name || this.group.group_id}" ?`)) {
			this._busy = !0;
			try {
				await mn(this.hass, this.room.entry_id, this.group.group_id), S(this), this._close();
			} catch (e) {
				this._busy = !1, alert("Erreur Homex : " + C(e));
			}
		}
	}
	render() {
		let e = !!this.group;
		return h`
      <homex-dialog
        .open=${this.open}
        heading=${e ? "Modifier le groupe" : "Nouveau groupe"}
        @dialog-closed=${this._close}
      >
        ${A("Nom", this._name, (e) => this._onName(e), "Table de chevet L")}
        ${e ? h`<div class="section">Id : ${this.group.group_id}</div>` : A("Id", this._id, (e) => this._onId(e), "bedside_l")}
        <div class="section">Appareils (parmi la pièce)</div>
        <homex-entity-picker
          .hass=${this.hass}
          .includeEntities=${this.room.devices}
          .value=${this._devices}
          @value-changed=${(e) => this._devices = e.detail.value}
        ></homex-entity-picker>
        <label class="dim-toggle">
          <span class="dim-name">Activer le dimming du groupe</span>
          <span class="toggle ${this._dim ? "on" : ""}">
            <input
              type="checkbox"
              .checked=${this._dim}
              @change=${(e) => this._dim = e.target.checked}
            />
            <span class="knob"></span>
          </span>
        </label>
        <div class="section">Déclencheurs</div>
        <homex-trigger-selector
          .hass=${this.hass}
          .value=${this._triggers}
          @value-changed=${(e) => this._triggers = e.detail.value}
        ></homex-trigger-selector>
        ${e ? h`<homex-managed-triggers
              .triggers=${this.room?.switch_triggers?.groups?.[this.group.group_id] ?? []}
            ></homex-managed-triggers>` : ""}

        
        ${this._dim ? h`
              <div class="section">Dimmer + (monter la luminosité)</div>
              <p class="hint">
                Chaque déclenchement ajoute 20 à la luminosité des lumières du
                groupe.
              </p>
              <homex-trigger-selector
                .hass=${this.hass}
                .value=${this._dimUp}
                @value-changed=${(e) => this._dimUp = e.detail.value}
              ></homex-trigger-selector>
              <div class="section">Dimmer − (baisser la luminosité)</div>
              <p class="hint">
                Chaque déclenchement retire 20 à la luminosité des lumières du
                groupe.
              </p>
              <homex-trigger-selector
                .hass=${this.hass}
                .value=${this._dimDown}
                @value-changed=${(e) => this._dimDown = e.detail.value}
              ></homex-trigger-selector>
            ` : ""}

        <span slot="actions">
          ${e ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
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
}, P = (Pr.styles = [D, o`
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
    `], Pr);
O([b({ attribute: !1 })], P.prototype, "hass", void 0), O([b({ type: Boolean })], P.prototype, "open", void 0), O([b({ attribute: !1 })], P.prototype, "room", void 0), O([b({ attribute: !1 })], P.prototype, "group", void 0), O([x()], P.prototype, "_name", void 0), O([x()], P.prototype, "_id", void 0), O([x()], P.prototype, "_devices", void 0), O([x()], P.prototype, "_triggers", void 0), O([x()], P.prototype, "_dim", void 0), O([x()], P.prototype, "_dimUp", void 0), O([x()], P.prototype, "_dimDown", void 0), O([x()], P.prototype, "_busy", void 0), P = O([y("homex-group-dialog")], P);
// src/components/homex-group-row.ts
var Fr = class extends v {
	constructor(...e) {
		super(...e), this._open = !1, this._openScene = (e) => Bn(e.currentTarget.getAttribute("href"), e);
	}
	get _slug() {
		return `${this.room.room_id}_${this.group.group_id}`;
	}
	render() {
		let e = this._slug;
		return h`
      <div class="row">
        <homex-unit-controls .hass=${this.hass} .unit=${this.group}></homex-unit-controls>
        <a
          class="scene-link"
          href="/config/scene/edit/homex_${e}_turn_on"
          @click=${this._openScene}
          title="Éditer la scène « allumé » du groupe"
        >
          <svg viewBox="0 0 24 24"><path d=${ht}></path></svg>
        </a>
        <a
          class="scene-link"
          href="/config/scene/edit/homex_${e}_turn_off"
          @click=${this._openScene}
          title="Éditer la scène « éteint » du groupe"
        >
          <svg viewBox="0 0 24 24"><path d=${mt}></path></svg>
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
}, Ir = (Fr.styles = [D, o`
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
    `], Fr);
O([b({ attribute: !1 })], Ir.prototype, "hass", void 0), O([b({ attribute: !1 })], Ir.prototype, "room", void 0), O([b({ attribute: !1 })], Ir.prototype, "group", void 0), O([x()], Ir.prototype, "_open", void 0), Ir = O([y("homex-group-row")], Ir);
// src/components/homex-room-dialog.ts
var Lr = class extends v {
	constructor(...e) {
		super(...e), this.open = !1, this.room = null, this._name = "", this._id = "", this._areaId = "", this._modules = ["lights"], this._devices = [], this._strategy = "recall_first", this._busy = !1, this._zones = [], this._zoneId = "default", this._initialZone = "default", this._idEdited = !1;
	}
	willUpdate(e) {
		e.has("open") && this.open && (this._name = this.room?.name ?? "", this._id = this.room?.room_id ?? "", this._areaId = this.room?.area_id ?? "", this._modules = [...this.room?.modules ?? ["lights"]], this._devices = this.room?.devices ?? [], this._strategy = this.room?.scene_strategy ?? "recall_first", this._busy = !1, this._idEdited = !!this.room, this._loadZones());
	}
	async _loadZones() {
		try {
			this._zones = (await bn(this.hass)).zones ?? [];
		} catch {
			this._zones = [];
		}
		let e = this.room?.room_id;
		this._initialZone = e && this._zones.find((t) => t.rooms.includes(e))?.id || "default", this._zoneId = this._initialZone;
	}
	get _areas() {
		return Object.values(this.hass.areas || {}).map((e) => ({
			area_id: e.area_id,
			name: e.name
		})).sort((e, t) => e.name.localeCompare(t.name));
	}
	_hasModule(e) {
		return this._modules.includes(e);
	}
	_setModule(e, t) {
		this._modules = t ? [.../* @__PURE__ */ new Set([...this._modules, e])] : this._modules.filter((t) => t !== e);
	}
	_moduleRow(e, t, n, r) {
		let i = this._hasModule(e);
		return h`
      <label class="module">
        <span class="module-name">${t} ${n}</span>
        <span class="toggle ${i ? "on" : ""}">
          <input
            type="checkbox"
            .checked=${i}
            @change=${(t) => this._setModule(e, t.target.checked)}
          />
          <span class="knob"></span>
        </span>
      </label>
      <p class="hint">${r}</p>
    `;
	}
	_onName(e) {
		this._name = e, this._idEdited || (this._id = M(e));
	}
	_onId(e) {
		this._id = e, this._idEdited = !0;
	}
	_close() {
		this.dispatchEvent(new CustomEvent("dialog-closed"));
	}
	async _save() {
		let e = this._name.trim(), t = this._id.trim();
		if (!e || !t) alert("Nom et id requis.");
		else {
			this._busy = !0;
			try {
				let n = this._areaId || null;
				this.room ? await cn(this.hass, {
					entry_id: this.room.entry_id,
					name: e,
					room_id: t,
					area_id: n,
					modules: this._modules,
					devices: this._devices,
					scene_strategy: this._strategy
				}) : await tn(this.hass, {
					name: e,
					room_id: t,
					area_id: n,
					modules: this._modules,
					devices: this._devices,
					scene_strategy: this._strategy
				}), this._hasModule("heating") && this._zoneId !== this._initialZone && await Mn(this.hass, t, this._zoneId), S(this), this._close();
			} catch (e) {
				this._busy = !1, alert("Erreur Homex : " + C(e));
			}
		}
	}
	render() {
		let e = !!this.room;
		return h`
      <homex-dialog
        .open=${this.open}
        heading=${e ? "Modifier la pièce" : "Nouvelle pièce"}
        @dialog-closed=${this._close}
      >
        ${A("Nom", this._name, (e) => this._onName(e), "Chambre")}
        ${A("Id", this._id, (e) => this._onId(e), "bedroom")}
        <div class="section">Pièce Home Assistant (optionnel)</div>
        <homex-select
          placeholder="Aucune"
          .value=${this._areaId}
          .options=${this._areas.map((e) => ({
			value: e.area_id,
			label: e.name
		}))}
          @value-changed=${(e) => this._areaId = e.detail.value}
        ></homex-select>

        <div class="section">Modules</div>
        ${this._moduleRow("lights", "💡", "Lights", "Le module Lights gère l'allumage, les scènes et les groupes de la pièce.")}
        ${this._moduleRow("switches", "🎛", "Switches", "Le module Switches gère les interrupteurs physiques de la pièce.")}
        ${this._moduleRow("shutters", "🪟", "Shutters", "Le module Shutters gère les volets roulants de la pièce.")}
        ${this._moduleRow("heating", "🔥", "Climate", "Le module Climate gère les capteurs et les radiateurs de la pièce (onglet Climate).")}

        ${this._hasModule("lights") ? h`
              <div class="tab">Lights</div>
              <div class="section">Luminaires de la pièce</div>
              <homex-entity-picker
                .hass=${this.hass}
                .includeDomains=${wr}
                .value=${this._devices}
                @value-changed=${(e) => this._devices = e.detail.value}
              ></homex-entity-picker>

              <div class="section">Scene switching strategy</div>
              <homex-select
                .value=${this._strategy}
                .options=${[{
			value: "recall_first",
			label: "Repart de zéro",
			secondary: "Première scène"
		}, {
			value: "recall_last",
			label: "Dernière utilisée",
			secondary: "Reprend la dernière scène"
		}]}
                @value-changed=${(e) => this._strategy = e.detail.value}
              ></homex-select>
              <p class="hint">
                Quand un trigger scene-switching change de scène et que la pièce
                était éteinte : repartir de la première scène, ou reprendre la
                dernière utilisée.
              </p>
            ` : ""}

        ${this._hasModule("heating") ? h`
              <div class="tab">Climate</div>
              <div class="section">Zone de chauffage</div>
              <homex-select
                .value=${this._zoneId}
                .options=${this._zones.map((e) => ({
			value: e.id,
			label: e.name,
			secondary: e.id === "default" ? "Toutes les autres pièces" : void 0
		}))}
                @value-changed=${(e) => this._zoneId = e.detail.value}
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
}, F = (Lr.styles = [D, o`
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
    `], Lr);
O([b({ attribute: !1 })], F.prototype, "hass", void 0), O([b({ type: Boolean })], F.prototype, "open", void 0), O([b({ attribute: !1 })], F.prototype, "room", void 0), O([x()], F.prototype, "_name", void 0), O([x()], F.prototype, "_id", void 0), O([x()], F.prototype, "_areaId", void 0), O([x()], F.prototype, "_modules", void 0), O([x()], F.prototype, "_devices", void 0), O([x()], F.prototype, "_strategy", void 0), O([x()], F.prototype, "_busy", void 0), O([x()], F.prototype, "_zones", void 0), O([x()], F.prototype, "_zoneId", void 0), F = O([y("homex-room-dialog")], F);
// src/components/homex-triggers-dialog.ts
var Rr = class extends v {
	constructor(...e) {
		super(...e), this.open = !1, this._toggle = [], this._scene = [], this._dimUp = [], this._dimDown = [], this._busy = !1;
	}
	willUpdate(e) {
		e.has("open") && this.open && (this._toggle = (this.room?.triggers ?? []).map((e) => ({ ...e })), this._scene = (this.room?.scene_triggers ?? []).map((e) => ({ ...e })), this._dimUp = (this.room?.dim_up_triggers ?? []).map((e) => ({ ...e })), this._dimDown = (this.room?.dim_down_triggers ?? []).map((e) => ({ ...e })), this._busy = !1);
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
			await cn(this.hass, {
				entry_id: this.room.entry_id,
				triggers: this._toggle,
				scene_triggers: this._scene,
				dim_up_triggers: this._dimUp,
				dim_down_triggers: this._dimDown
			}), S(this), this._close();
		} catch (e) {
			this._busy = !1, alert("Erreur Homex : " + C(e));
		}
	}
	render() {
		return h`
      <homex-dialog
        .open=${this.open}
        heading="Déclencheurs de la pièce"
        @dialog-closed=${this._close}
      >
        ${this._hasLights ? h`
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
}, I = (Rr.styles = [D, o`
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
    `], Rr);
O([b({ attribute: !1 })], I.prototype, "hass", void 0), O([b({ type: Boolean })], I.prototype, "open", void 0), O([b({ attribute: !1 })], I.prototype, "room", void 0), O([x()], I.prototype, "_toggle", void 0), O([x()], I.prototype, "_scene", void 0), O([x()], I.prototype, "_dimUp", void 0), O([x()], I.prototype, "_dimDown", void 0), O([x()], I.prototype, "_busy", void 0), I = O([y("homex-triggers-dialog")], I);
// src/components/homex-scene-dialog.ts
var zr = class extends v {
	constructor(...e) {
		super(...e), this.open = !1, this.scene = null, this._name = "", this._mode = "new", this._attachId = "", this._triggers = [], this._busy = !1;
	}
	willUpdate(e) {
		e.has("open") && this.open && (this._name = this.scene?.name ?? "", this._mode = "new", this._attachId = "", this._triggers = (this.scene?.triggers ?? []).map((e) => ({ ...e })), this._busy = !1);
	}
	get _availableScenes() {
		return Object.keys(this.hass.states).filter((e) => e.startsWith("scene.")).map((e) => {
			let t = this.hass.states[e].attributes || {};
			return {
				config_id: t.id ? String(t.id) : "",
				name: t.friendly_name || e
			};
		}).filter((e) => e.config_id && !e.config_id.startsWith("homex_")).sort((e, t) => e.name.localeCompare(t.name));
	}
	get _nameTaken() {
		let e = this._name.trim();
		if (!e) return !1;
		let t = M(e);
		return this.room.scenes.some((n) => this.scene && n.key === this.scene.key ? !1 : n.name.toLowerCase() === e.toLowerCase() || n.key === t);
	}
	_close() {
		this.dispatchEvent(new CustomEvent("dialog-closed"));
	}
	_onPickScene(e) {
		if (this._attachId = e, !this._name.trim()) {
			let t = this._availableScenes.find((t) => t.config_id === e);
			t && (this._name = t.name);
		}
	}
	async _save() {
		let e = this._name.trim();
		if (e && !this._nameTaken) {
			if (!this.scene && this._mode === "attach" && !this._attachId) alert("Choisis une scène existante à rattacher.");
			else {
				this._busy = !0;
				try {
					this.scene ? await yn(this.hass, this.room.entry_id, this.scene.key, e, this._triggers) : this._mode === "attach" ? await hn(this.hass, this.room.entry_id, e, this._attachId, this._triggers) : await hn(this.hass, this.room.entry_id, e, void 0, this._triggers), S(this), this._close();
				} catch (e) {
					this._busy = !1, alert("Erreur Homex : " + C(e));
				}
			}
		}
	}
	render() {
		let e = !!this.scene, t = this._nameTaken, n = !!this._name.trim() && !t;
		return h`
      <homex-dialog
        .open=${this.open}
        heading=${e ? "Renommer la scène" : "Nouvelle scène"}
        @dialog-closed=${this._close}
      >
        ${A("Nom de la scène", this._name, (e) => this._name = e, "Nuit")}
        ${t ? h`<div class="err">Ce nom de scène existe déjà.</div>` : ""}
        ${e ? "" : this._renderModePicker()}
        <div class="section">Déclencheurs (activent cette scène)</div>
        <homex-trigger-selector
          .hass=${this.hass}
          .value=${this._triggers}
          @value-changed=${(e) => this._triggers = e.detail.value}
        ></homex-trigger-selector>
        ${e ? h`<homex-managed-triggers
              .triggers=${this.room?.switch_triggers?.scenes?.[this.scene.key] ?? []}
            ></homex-managed-triggers>` : ""}
        <span slot="actions">
          <button @click=${this._close}>Annuler</button>
          <button class="primary" ?disabled=${this._busy || !n} @click=${this._save}>
            ${e ? "Renommer" : this._mode === "attach" ? "Rattacher" : "Créer la scène"}
          </button>
        </span>
      </homex-dialog>
    `;
	}
	_renderModePicker() {
		return h`
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
      ${this._mode === "new" ? h`<div class="section">
            La scène est créée « tout éteint » ; édite-la ensuite dans Home Assistant.
          </div>` : h`
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
}, L = (zr.styles = [D, o`
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
    `], zr);
O([b({ attribute: !1 })], L.prototype, "hass", void 0), O([b({ type: Boolean })], L.prototype, "open", void 0), O([b({ attribute: !1 })], L.prototype, "room", void 0), O([b({ attribute: !1 })], L.prototype, "scene", void 0), O([x()], L.prototype, "_name", void 0), O([x()], L.prototype, "_mode", void 0), O([x()], L.prototype, "_attachId", void 0), O([x()], L.prototype, "_triggers", void 0), O([x()], L.prototype, "_busy", void 0), L = O([y("homex-scene-dialog")], L);
// src/components/homex-shutter-group-dialog.ts
var Br = class extends v {
	constructor(...e) {
		super(...e), this.open = !1, this.group = null, this._name = "", this._devices = [], this._toggle = [], this._openT = [], this._close = [], this._stop = [], this._busy = !1;
	}
	willUpdate(e) {
		if (e.has("open") && this.open) {
			let e = this.group;
			this._name = e?.name ?? "", this._devices = [...e?.devices ?? []], this._toggle = (e?.toggle_triggers ?? []).map((e) => ({ ...e })), this._openT = (e?.open_triggers ?? []).map((e) => ({ ...e })), this._close = (e?.close_triggers ?? []).map((e) => ({ ...e })), this._stop = (e?.stop_triggers ?? []).map((e) => ({ ...e })), this._busy = !1;
		}
	}
	_close_() {
		this.dispatchEvent(new CustomEvent("dialog-closed"));
	}
	async _save() {
		let e = this._name.trim();
		if (!e) alert("Nom du groupe requis.");
		else {
			this._busy = !0;
			try {
				let t = this.group?.id;
				t ||= (await rn(this.hass, this.room.entry_id, e))?.group_id, await an(this.hass, {
					entry_id: this.room.entry_id,
					group_id: t,
					name: e,
					devices: this._devices,
					toggle_triggers: this._toggle,
					open_triggers: this._openT,
					close_triggers: this._close,
					stop_triggers: this._stop
				}), S(this), this._close_();
			} catch (e) {
				this._busy = !1, alert("Erreur Homex : " + C(e));
			}
		}
	}
	async _delete() {
		if (this.group && confirm(`Supprimer le groupe de volets "${this.group.name}" ?`)) {
			this._busy = !0;
			try {
				await on(this.hass, this.room.entry_id, this.group.id), S(this), this._close_();
			} catch (e) {
				this._busy = !1, alert("Erreur Homex : " + C(e));
			}
		}
	}
	_trigGroup(e, t, n) {
		return h`<div class="group">
      <div class="section">${e}</div>
      <homex-trigger-selector
        .hass=${this.hass}
        .value=${t}
        @value-changed=${(e) => n(e.detail.value)}
      ></homex-trigger-selector>
    </div>`;
	}
	render() {
		let e = !!this.group, t = e && this.group.removable;
		return h`
      <homex-dialog
        .open=${this.open}
        heading=${e ? "Modifier le groupe de volets" : "Nouveau groupe de volets"}
        @dialog-closed=${this._close_}
      >
        ${A("Nom", this._name, (e) => this._name = e, "Salon")}
        <div class="section">Volets (entités cover)</div>
        <homex-entity-picker
          .hass=${this.hass}
          .includeDomains=${["cover"]}
          .value=${this._devices}
          @value-changed=${(e) => this._devices = e.detail.value}
        ></homex-entity-picker>

        <div class="section">Déclencheurs du groupe</div>
        <p class="hint">
          Chaque déclencheur pilote les volets de ce groupe.
        </p>
        ${this._trigGroup("Permuter (ouvrir / fermer)", this._toggle, (e) => this._toggle = e)}
        ${this._trigGroup("Ouvrir", this._openT, (e) => this._openT = e)}
        ${this._trigGroup("Fermer", this._close, (e) => this._close = e)}
        ${this._trigGroup("Stop", this._stop, (e) => this._stop = e)}

        <span slot="actions">
          ${t ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
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
}, R = (Br.styles = [D, o`
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
    `], Br);
O([b({ attribute: !1 })], R.prototype, "hass", void 0), O([b({ type: Boolean })], R.prototype, "open", void 0), O([b({ attribute: !1 })], R.prototype, "room", void 0), O([b({ attribute: !1 })], R.prototype, "group", void 0), O([x()], R.prototype, "_name", void 0), O([x()], R.prototype, "_devices", void 0), O([x()], R.prototype, "_toggle", void 0), O([x()], R.prototype, "_openT", void 0), O([x()], R.prototype, "_close", void 0), O([x()], R.prototype, "_stop", void 0), O([x()], R.prototype, "_busy", void 0), R = O([y("homex-shutter-group-dialog")], R);
// src/components/homex-shutter-control-dialog.ts
var Vr = class extends v {
	constructor(...e) {
		super(...e), this.open = !1, this._groupId = "", this._busy = !1;
	}
	willUpdate(e) {
		e.has("open") && this.open && (this._groupId = nr(this.room)?.id ?? "");
	}
	get _groups() {
		return (this.room.shutter_groups ?? []).filter((e) => e.devices?.length);
	}
	async _run(e) {
		this._busy = !0;
		try {
			await dn(this.hass, this.room.entry_id, this._groupId, e);
		} catch (e) {
			alert("Erreur Homex : " + C(e));
		} finally {
			this._busy = !1;
		}
	}
	_close() {
		this.dispatchEvent(new CustomEvent("dialog-closed"));
	}
	render() {
		if (!this.open) return h``;
		let e = this._groups, t = e.find((e) => e.id === this._groupId) ?? e[0], n = t?.devices ?? [], r = tr(this.hass, n);
		return h`
      <homex-dialog
        compact
        .open=${this.open}
        .heading=${`Volets · ${this.room.name}`}
        @dialog-closed=${this._close}
      >
        ${e.length > 1 ? h`<div class="groups">
              ${e.map((e) => h`<button
                  class="chip ${e.id === t?.id ? "active" : ""}"
                  @click=${() => this._groupId = e.id}
                >
                  ${e.name}
                </button>`)}
            </div>` : ""}
        <div class="summary">
          <svg viewBox="0 0 24 24"><path d=${r.icon}></path></svg>
          <div>
            <div class="state">${r.label}</div>
            <div class="pos">
              ${r.position === null ? "" : `Position moyenne : ${r.position} %`}
            </div>
          </div>
        </div>
        <div class="controls">
          <button ?disabled=${this._busy || !t} @click=${() => this._run("open_cover")}>
            <svg viewBox="0 0 24 24"><path d=${$e}></path></svg>Ouvrir
          </button>
          <button ?disabled=${this._busy || !t} @click=${() => this._run("stop_cover")}>
            <svg viewBox="0 0 24 24"><path d=${At}></path></svg>Stop
          </button>
          <button ?disabled=${this._busy || !t} @click=${() => this._run("close_cover")}>
            <svg viewBox="0 0 24 24"><path d=${Ze}></path></svg>Fermer
          </button>
        </div>
        ${n.map((e) => {
			let t = tr(this.hass, [e]), n = er(this.hass, e);
			return h`<div class="cover">
            <svg viewBox="0 0 24 24"><path d=${t.icon}></path></svg>
            <span class="name">
              ${this.hass.states[e]?.attributes?.friendly_name || e}
            </span>
            <span class="val">${t.label}${n === null ? "" : ` · ${n} %`}</span>
          </div>`;
		})}
        <button slot="actions" @click=${this._close}>Terminé</button>
      </homex-dialog>
    `;
	}
}, Hr = (Vr.styles = [D, o`
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
    `], Vr);
O([b({ attribute: !1 })], Hr.prototype, "hass", void 0), O([b({ type: Boolean })], Hr.prototype, "open", void 0), O([b({ attribute: !1 })], Hr.prototype, "room", void 0), O([x()], Hr.prototype, "_groupId", void 0), O([x()], Hr.prototype, "_busy", void 0), Hr = O([y("homex-shutter-control-dialog")], Hr);
// src/lib/area.ts
function Ur(e, t) {
	let n = e.entities?.[t];
	return n?.area_id || n?.device_id && e.devices?.[n.device_id]?.area_id || void 0;
}
function Wr(e, t) {
	return e.devices?.[t]?.area_id || void 0;
}
function Gr(e, t, n) {
	let r = new Set(n.filter(Boolean)), i = r.size ? e.filter((e) => r.has(t(e) ?? "")) : [];
	return {
		inArea: i,
		others: e.filter((e) => !i.includes(e))
	};
}
function Kr(e, t) {
	return [...new Set(t.filter(Boolean))].map((t) => e.areas?.[t]?.name ?? t).join(", ");
}
// src/components/homex-radiator-dialog.ts
var qr = class extends v {
	constructor(...e) {
		super(...e), this.open = !1, this.index = -1, this._rad = {
			device_id: "",
			preset_id: "",
			external_sensor: ""
		}, this._models = [], this._presets = [], this._otherRooms = [], this._busy = !1;
	}
	willUpdate(e) {
		if (e.has("open") && this.open) {
			let e = this.room.heating?.radiators?.[this.index];
			this._rad = e ? {
				external_sensor: "",
				...e
			} : {
				device_id: "",
				preset_id: "",
				external_sensor: ""
			}, this._busy = !1, this._load();
		}
	}
	async _load() {
		try {
			let [e, t, n] = await Promise.all([
				bn(this.hass),
				Tn(this.hass),
				en(this.hass)
			]);
			this._presets = e.device_presets ?? [], this._models = t, this._otherRooms = n.filter((e) => e.room_id !== this.room.room_id);
		} catch {
			this._presets = [], this._models = [];
		}
	}
	get _thermostats() {
		return this._models.flatMap((e) => e.devices.map((t) => ({
			...t,
			model: e.model,
			label: e.label
		}))).sort((e, t) => e.name.localeCompare(t.name));
	}
	get _modelPresets() {
		let e = this._thermostats.find((e) => e.device_id === this._rad.device_id)?.model;
		return this._presets.filter((t) => t.model === e);
	}
	get _preset() {
		return this._presets.find((e) => e.id === this._rad.preset_id);
	}
	_onDevice(e) {
		let t = this._thermostats.find((t) => t.device_id === e)?.model, n = this._presets.filter((e) => e.model === t);
		this._rad = {
			...this._rad,
			device_id: e,
			preset_id: n.length === 1 ? n[0].id : ""
		};
	}
	_close() {
		this.dispatchEvent(new CustomEvent("dialog-closed"));
	}
	async _save() {
		let e = [...this.room.heating?.radiators ?? []], t = {
			...this._rad,
			external_sensor: this._preset?.external_input ? this._rad.external_sensor : ""
		};
		this.index >= 0 ? e[this.index] = t : e.push(t), this._busy = !0;
		try {
			await cn(this.hass, {
				entry_id: this.room.entry_id,
				heating: {
					...this.room.heating,
					radiators: e
				}
			}), S(this), this._close();
		} catch (e) {
			alert("Erreur Homex : " + C(e)), this._busy = !1;
		}
	}
	_renderExternalSensor() {
		let e = (e) => this.hass.states[e]?.attributes?.friendly_name || e, t = (e) => {
			let t = this.hass.states[e], n = t?.attributes?.unit_of_measurement ?? "";
			return t && !["unknown", "unavailable"].includes(t.state) ? `${t.state} ${n}` : "—";
		}, n = `sensor.homex_${this.room.room_id}_temperature`, r = !!this.room.metrics?.temperature?.sensors?.length, i = (this.room.metrics?.temperature?.sensors ?? []).map((e) => e.entity_id), { inArea: a, others: o } = Gr(Object.keys(this.hass.states).filter((e) => e.startsWith("sensor.") && e !== n && !i.includes(e) && this.hass.states[e]?.attributes?.device_class === "temperature").sort((t, n) => e(t).localeCompare(e(n))), (e) => Ur(this.hass, e), [this.room.area_id]), s = this._rad.external_sensor ?? "", c = (n, r = e(n)) => ({
			value: n,
			label: r,
			secondary: n,
			tertiary: t(n)
		});
		return h`
      <div class="section">Capteur de température externe</div>
      <p class="hint">Sa température est recopiée dans la vanne à chaque mise à jour.</p>
      <homex-select
        placeholder="Choisir un capteur…"
        .value=${s}
        .groups=${[
			...r ? [{
				label: "Référence de la pièce",
				options: [c(n, `Température de référence (${this.room.name})`)]
			}] : [],
			...i.length ? [{
				label: "Capteurs de la pièce",
				options: i.map((e) => c(e))
			}] : [],
			...a.length ? [{
				label: `Pièce : ${Kr(this.hass, [this.room.area_id])}`,
				options: a.map((e) => c(e))
			}] : [],
			{
				label: "Autres",
				options: o.map((e) => c(e))
			}
		]}
        @value-changed=${(e) => this._rad = {
			...this._rad,
			external_sensor: e.detail.value
		}}
      ></homex-select>
      ${s ? "" : h`<p class="hint warn">Ce preset utilise un capteur externe : choisis-en un.</p>`}
    `;
	}
	render() {
		if (!this.open) return h``;
		let e = this.index >= 0, t = new Set((this.room.heating?.radiators ?? []).filter((e, t) => t !== this.index).map((e) => e.device_id)), n = this._otherRooms.find((e) => (e.heating?.radiators ?? []).some((e) => e.device_id === this._rad.device_id)), r = this._modelPresets, i = this.room.area_id || "", a = i ? this.hass.areas?.[i]?.name : void 0, { inArea: o, others: s } = Gr(this._thermostats, (e) => Wr(this.hass, e.device_id), [i]), c = (e) => ({
			value: e.device_id,
			label: e.name,
			secondary: e.label,
			tertiary: t.has(e.device_id) ? "déjà dans la pièce" : void 0,
			disabled: t.has(e.device_id)
		});
		return h`
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
          .options=${i ? [] : this._thermostats.map(c)}
          .groups=${i ? [...o.length ? [{
			label: `Pièce : ${a ?? i}`,
			options: o.map(c)
		}] : [], {
			label: "Autres",
			options: s.map(c)
		}] : []}
          @value-changed=${(e) => this._onDevice(e.detail.value)}
        ></homex-select>
        ${n ? h`<p class="hint warn">Déjà dans la pièce « ${n.name} ».</p>` : ""}

        <div class="section">Device preset</div>
        <homex-select
          placeholder="Aucun preset"
          .value=${this._rad.preset_id}
          ?disabled=${!this._rad.device_id}
          .options=${r.map((e) => ({
			value: e.id,
			label: e.name,
			tertiary: e.external_input ? "capteur externe" : void 0
		}))}
          @value-changed=${(e) => this._rad = {
			...this._rad,
			preset_id: e.detail.value
		}}
        ></homex-select>
        <p class="hint">
          ${this._rad.device_id && !r.length ? "Aucun device preset pour ce modèle (Climate Manager → Heating → Device Presets)." : "Le preset est appliqué en continu (vérifié et ré-appliqué toutes les 10 minutes)."}
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
}, z = (qr.styles = [D, o`
      .hint {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin: 6px 0;
      }
      .warn {
        color: var(--warning-color, #ff9800);
      }
    `], qr);
O([b({ attribute: !1 })], z.prototype, "hass", void 0), O([b({ type: Boolean })], z.prototype, "open", void 0), O([b({ attribute: !1 })], z.prototype, "room", void 0), O([b({ type: Number })], z.prototype, "index", void 0), O([x()], z.prototype, "_rad", void 0), O([x()], z.prototype, "_models", void 0), O([x()], z.prototype, "_presets", void 0), O([x()], z.prototype, "_otherRooms", void 0), O([x()], z.prototype, "_busy", void 0), z = O([y("homex-radiator-dialog")], z);
// src/components/homex-room-climate.ts
var Jr, Yr = [
	{
		key: "temperature",
		icon: "🌡",
		label: "Température"
	},
	{
		key: "humidity",
		icon: "💧",
		label: "Humidité"
	},
	{
		key: "pm25",
		icon: "🌫",
		label: "PM2.5"
	},
	{
		key: "pm10",
		icon: "🌫",
		label: "PM10"
	},
	{
		key: "co2",
		icon: "🫧",
		label: "CO₂"
	}
], Xr = {
	mean: "moyenne pondérée",
	max: "max",
	min: "min"
}, Zr = {
	heating: "🔥 Chauffe",
	idle: "En veille",
	off: "Éteint",
	preheating: "Préchauffe",
	heat: "Mode chauffage",
	auto: "Mode auto"
}, Qr = (Jr = class extends v {
	constructor(...e) {
		super(...e), this._devicePresets = [], this._dialogIndex = null, this._switching = !1;
	}
	connectedCallback() {
		super.connectedCallback(), this._load();
	}
	async _load() {
		try {
			this._devicePresets = (await bn(this.hass)).device_presets ?? [];
		} catch {
			this._devicePresets = [];
		}
	}
	_state(e) {
		let t = this.hass.states[e];
		if (!t || t.state === "unknown" || t.state === "unavailable") return "—";
		let n = t.attributes?.unit_of_measurement;
		return n ? `${t.state} ${n}` : t.state;
	}
	_renderMetrics() {
		let e = this.room, t = Yr.filter((t) => e.metrics?.[t.key]?.sensors?.length);
		return h`
      <div class="section-row">
        <span class="section">Metrics</span>
        <button @click=${() => T(`/homex/climate/metrics/${e.room_id}`)}>
          Configurer
        </button>
      </div>
      ${t.length ? h`<div class="metrics">
            ${t.map((t) => {
			let n = e.metrics[t.key];
			return h`<div class="metric">
                <div class="muted">${t.icon} ${t.label}</div>
                <div class="v">${this._state(`sensor.homex_${e.room_id}_${t.key}`)}</div>
                <div class="muted">
                  ${n.sensors.length} capteur(s) · ${Xr[n.rule] ?? n.rule}
                </div>
              </div>`;
		})}
          </div>` : h`<div class="empty">Aucun capteur : « Configurer » pour en ajouter.</div>`}
    `;
	}
	get _roomOn() {
		return this.room.heating?.enabled !== !1;
	}
	async _setRoomHeating(e) {
		this._switching = !0;
		try {
			await cn(this.hass, {
				entry_id: this.room.entry_id,
				heating: {
					radiators: this.room.heating?.radiators ?? [],
					enabled: e
				}
			}), S(this);
		} catch (e) {
			alert("Erreur Homex : " + C(e));
		} finally {
			this._switching = !1;
		}
	}
	async _remove(e) {
		let t = [...this.room.heating?.radiators ?? []], n = this.hass.devices?.[t[e]?.device_id]?.name ?? "ce radiateur";
		if (confirm(`Retirer ${n} de la pièce ?`)) {
			t.splice(e, 1);
			try {
				await cn(this.hass, {
					entry_id: this.room.entry_id,
					heating: {
						...this.room.heating,
						radiators: t
					}
				}), S(this);
			} catch (e) {
				alert("Erreur Homex : " + C(e));
			}
		}
	}
	_renderRadiator(e) {
		let t = this.room.heating.radiators[e], n = this.hass.devices?.[t.device_id], r = Gn(this.hass, t.device_id), i = r ? this.hass.states[r] : void 0, a = i?.attributes ?? {}, o = a.hvac_action ?? i?.state, s = this.hass.config?.unit_system?.temperature ?? "°C", c = (e) => e == null ? "—" : `${e} ${s}`, l = this._devicePresets.find((e) => e.id === t.preset_id), u = t.external_sensor ? this.hass.states[t.external_sensor]?.attributes?.friendly_name || t.external_sensor : "";
		return h`<div class="row">
      <div class="info">
        <div class="name">${n?.name_by_user || n?.name || t.device_id}</div>
        <div class="muted">
          ${l ? `Preset : ${l.name}` : "Aucun preset"}
          ${u ? h` · Capteur : ${u}` : ""}
        </div>
      </div>
      <span class=${o === "heating" ? "heating" : "muted"}>
        ${!i || i.state === "unavailable" ? "Indisponible" : Zr[o] ?? o}
        ${qn(i) ? h`<span
              class="warning"
              title="Chauffe alors que la température dépasse la consigne : vanne bloquée ouverte ou état non rafraîchi — vérifie le radiateur."
              >⚠</span
            >` : ""}
      </span>
      <div class="temps">
        <span title="Température de consigne">🎯 ${c(a.temperature)}</span>
        <span title="Température actuelle">🌡 ${c(a.current_temperature)}</span>
      </div>
      <button title="Modifier" @click=${() => this._dialogIndex = e}>✏️</button>
      <button title="Retirer" @click=${() => this._remove(e)}>✕</button>
    </div>`;
	}
	_renderHeating() {
		let e = this.room.heating?.radiators ?? [];
		return h`
      <div class="section-row">
        <span class="section">Heating</span>
        ${e.length ? h`<label
              class="room-switch ${this._roomOn ? "on" : ""}"
              title=${this._roomOn ? "Désactiver : la pièce passe en Unheated, ses vannes sur off" : "Activer : la pièce reprend le mode de sa zone"}
            >
              ${this._roomOn ? "Chauffage activé" : "Chauffage désactivé"}
              <span class="toggle ${this._roomOn ? "on" : ""}">
                <input
                  type="checkbox"
                  .checked=${this._roomOn}
                  ?disabled=${this._switching}
                  @change=${(e) => this._setRoomHeating(e.target.checked)}
                />
                <span class="knob"></span>
              </span>
            </label>` : ""}
        <button @click=${() => this._dialogIndex = -1}>＋ Radiateur</button>
      </div>
      ${e.length ? e.map((e, t) => this._renderRadiator(t)) : h`<div class="empty">Aucun radiateur.</div>`}
    `;
	}
	render() {
		return h`
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
}, Jr.styles = [D, o`
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
    `], Jr);
O([b({ attribute: !1 })], Qr.prototype, "hass", void 0), O([b({ attribute: !1 })], Qr.prototype, "room", void 0), O([x()], Qr.prototype, "_devicePresets", void 0), O([x()], Qr.prototype, "_dialogIndex", void 0), O([x()], Qr.prototype, "_switching", void 0), Qr = O([y("homex-room-climate")], Qr);
// src/components/homex-switch-mapping.ts
var $r, ei = {
	lights: "💡 Lights",
	shutters: "🪟 Shutters",
	heating: "🔥 Climate"
}, ti = {
	single: "Simple",
	double: "Double",
	long: "Long"
};
function ni(e) {
	return e.kind === "group" ? `group:${e.group_id}` : e.kind === "scene" ? `scene:${e.scene_key}` : e.kind.startsWith("shutter_") ? `${e.kind}:${e.group_id}` : e.kind === "heating_mode" ? `heating_mode:${e.mode_id}` : e.kind;
}
var B = ($r = class extends v {
	constructor(...e) {
		super(...e), this.open = !1, this.layout = null, this.taps = {}, this._rooms = [], this._heatingModes = [], this._mappings = {}, this._tapTab = "single", this._dragId = "", this._picked = "", this._dropBtn = null, this._busy = !1;
	}
	willUpdate(e) {
		e.has("open") && this.open && (this._mappings = JSON.parse(JSON.stringify(this.sw?.mappings ?? {})), this._tapTab = this._enabledModes()[0] ?? "single", this._busy = !1, this._dragId = "", this._picked = "", this._loadRooms());
	}
	async _loadRooms() {
		try {
			let e = await en(this.hass), t = new Set(this.sw?.rooms ?? []);
			this._rooms = e.filter((e) => t.has(e.room_id));
		} catch {
			this._rooms = [];
		}
		try {
			this._heatingModes = (await bn(this.hass)).presets;
		} catch {
			this._heatingModes = [];
		}
	}
	get _multi() {
		return this._rooms.length > 1;
	}
	_actionsForRoom(e) {
		let t = (t, n, r, i, a) => ({
			id: `${e.room_id}::${ni(a)}`,
			room_id: e.room_id,
			room_name: e.name,
			module: t,
			label: n,
			clabel: r,
			short: i,
			action: a
		}), n = [];
		if ((e.modules ?? []).includes("lights")) {
			n.push(t("lights", "Toggle pièce (on / off)", "Toggle", "⏻", { kind: "toggle" }), t("lights", "Changement de scène", "Scène →", "🎬", { kind: "scene_next" }), t("lights", "Dimmer +", "Dim +", "🔆", { kind: "dim_up" }), t("lights", "Dimmer −", "Dim −", "🔅", { kind: "dim_down" }));
			for (let r of e.groups ?? []) n.push(t("lights", `Groupe : ${r.name}`, r.name, "◧", {
				kind: "group",
				group_id: r.group_id
			}));
			for (let r of e.scenes ?? []) n.push(t("lights", `Scène : ${r.name}`, r.name, "★", {
				kind: "scene",
				scene_key: r.key
			}));
		}
		if ((e.modules ?? []).includes("shutters")) for (let r of e.shutter_groups ?? []) n.push(t("shutters", `${r.name} — Permuter`, `${r.name} ⇅`, "⇅", {
			kind: "shutter_toggle",
			group_id: r.id
		}), t("shutters", `${r.name} — Ouvrir`, `${r.name} ⬆`, "⬆", {
			kind: "shutter_open",
			group_id: r.id
		}), t("shutters", `${r.name} — Fermer`, `${r.name} ⬇`, "⬇", {
			kind: "shutter_close",
			group_id: r.id
		}), t("shutters", `${r.name} — Stop`, `${r.name} ⏹`, "⏹", {
			kind: "shutter_stop",
			group_id: r.id
		}));
		if (this._heatingModes.length) {
			n.push(t("heating", "Chauffage — mode suivant", "Mode →", "🔥", { kind: "heating_mode_next" }));
			for (let e of this._heatingModes) n.push(t("heating", `Chauffage — ${e.name}`, e.name, "🌡", {
				kind: "heating_mode",
				mode_id: e.id
			}));
		}
		return n;
	}
	_actionsByModule(e) {
		let t = /* @__PURE__ */ new Map();
		for (let n of this._actionsForRoom(e)) {
			let e = t.get(n.module) ?? [];
			e.push(n), t.set(n.module, e);
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
		return this._itemById(`${e.room}::${ni(e.action)}`);
	}
	_usedIds() {
		let e = /* @__PURE__ */ new Set();
		for (let t of Object.values(this._mappings)) for (let n of Object.values(t)) e.add(`${n.room}::${ni(n.action)}`);
		return e;
	}
	_enabledModes() {
		let e = /* @__PURE__ */ new Set();
		return Object.values(this.taps).forEach((t) => t.forEach((t) => e.add(t))), [
			"single",
			"double",
			"long"
		].filter((t) => e.has(t));
	}
	_buttonsFor(e) {
		return Object.entries(this.taps).filter(([, t]) => t.includes(e)).map(([e]) => Number(e)).sort((e, t) => e - t);
	}
	_invisibleButtons(e) {
		let t = new Set((this.layout?.zones || []).map((e) => e.n));
		return this._buttonsFor(e).filter((e) => !t.has(e));
	}
	_assign(e, t) {
		let n = this._itemById(this._dragId || this._picked);
		this._picked = "", n && (this._mappings = {
			...this._mappings,
			[e]: {
				...this._mappings[e] ?? {},
				[t]: {
					room: n.room_id,
					action: n.action
				}
			}
		}, this._dragId = "");
	}
	_tapButton(e, t, n) {
		this._picked ? this._assign(e, t) : n && this._clear(e, t);
	}
	_clear(e, t) {
		let n = { ...this._mappings[e] ?? {} };
		delete n[t], this._mappings = {
			...this._mappings,
			[e]: n
		};
	}
	_close() {
		this.dispatchEvent(new CustomEvent("dialog-closed"));
	}
	async _save() {
		this._busy = !0;
		try {
			await Ht(this.hass, {
				...this.sw,
				mappings: this._mappings
			}), S(this), this._close();
		} catch (e) {
			this._busy = !1, alert("Erreur Homex : " + C(e));
		}
	}
	_trunc(e, t) {
		return e.length > t ? e.slice(0, t - 1) + "…" : e;
	}
	_actionRow(e, t) {
		return h`<div
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
		let t = this.layout;
		if (!t) return h`<p class="hint">Layout introuvable pour ce modèle.</p>`;
		let n = t.bounds, r = t.shape === "round", i = `mapclip-${t.id}`, a = r ? g`<ellipse cx=${n.x + n.w / 2} cy=${n.y + n.h / 2} rx=${n.w / 2} ry=${n.h / 2}></ellipse>` : g`<rect x=${n.x} y=${n.y} width=${n.w} height=${n.h} rx="0.4"></rect>`, o = r ? g`<ellipse class="sh" cx=${n.x + n.w / 2} cy=${n.y + n.h / 2} rx=${n.w / 2} ry=${n.h / 2}></ellipse>` : g`<rect class="sh" x=${n.x} y=${n.y} width=${n.w} height=${n.h} rx="0.4"></rect>`, s = new Set(this._buttonsFor(e)), c = (e) => (t.positions || []).find((t) => t.n === e), l = n.x + n.w / 2, u = n.y + n.h / 2, d = (e, t) => r ? [l + (e - l) * .82, u + (t - u) * .82] : [e, t];
		return h`<svg class="canvas" viewBox="-10 -10 20 20">
      <defs><clipPath id=${i}>${a}</clipPath></defs>
      ${o}
      ${(t.zones || []).map((t) => {
			let n = s.has(t.n), r = this._mappings[e]?.[t.n], a = r ? this._itemForValue(r) : void 0, o = (n ? r ? "zone assigned" : "zone" : "zone disabled") + (n && this._dropBtn === t.n ? " drop" : ""), l = c(t.n), [u, f] = d(l ? l.x : t.x + t.w / 2, l ? l.y : t.y + t.h / 2), p = g`<rect class=${o} x=${t.x} y=${t.y} width=${t.w} height=${t.h}
          clip-path="url(#${i})"
          @dragover=${(e) => {
				n && (e.preventDefault(), this._dropBtn = t.n);
			}}
          @dragleave=${() => {
				this._dropBtn === t.n && (this._dropBtn = null);
			}}
          @drop=${() => {
				n && this._assign(e, t.n), this._dropBtn = null;
			}}
          @click=${() => n && this._tapButton(e, t.n, !!r)}></rect>`;
			if (!r || !a) return g`${p}<text class="bn" x=${u} y=${f}>${t.n}</text>`;
			let m = this._multi ? f - 1.2 : f - .8, ee = this._multi ? f - .1 : f + .4;
			return g`${p}
          <text class="ic" x=${u} y=${m}>${a.short}</text>
          <text class="lb" x=${u} y=${ee}>${this._trunc(a.clabel, 12)}</text>
          ${this._multi ? g`<text class="rm" x=${u} y=${f + .9}>${this._trunc(a.room_name, 12)}</text>` : ""}`;
		})}
    </svg>`;
	}
	_invisibleTray(e) {
		let t = this._invisibleButtons(e);
		return t.length ? h`<div class="tray">
      <span class="tray-label">Boutons invisibles</span>
      ${t.map((t) => {
			let n = this._mappings[e]?.[t], r = n ? this._itemForValue(n) : void 0;
			return h`<div
          class="ichip ${n ? "assigned" : ""} ${this._dropBtn === t ? "drop" : ""}"
          @dragover=${(e) => {
				e.preventDefault(), this._dropBtn = t;
			}}
          @dragleave=${() => {
				this._dropBtn === t && (this._dropBtn = null);
			}}
          @drop=${() => {
				this._assign(e, t), this._dropBtn = null;
			}}
          @click=${() => this._tapButton(e, t, !!n)}
        >
          <span class="ichip-n">${t}</span>
          ${r ? h`<span class="ichip-a"
                >${r.short} ${this._trunc(r.clabel, 12)}${this._multi ? ` · ${r.room_name}` : ""}</span
              >` : ""}
        </div>`;
		})}
    </div>` : "";
	}
	render() {
		let e = this._enabledModes(), t = e.includes(this._tapTab) ? this._tapTab : e[0], n = this._usedIds();
		return h`
      <homex-dialog
        .open=${this.open}
        heading=${`Assignations — ${this.sw?.name ?? ""}`}
        @dialog-closed=${this._close}
      >
        <div class="cols">
          <div class="left">
            <p class="section">Actions Homex</p>
            ${this._rooms.length === 0 ? h`<p class="hint">Aucune pièce associée à cet interrupteur.</p>` : this._rooms.every((e) => !this._actionsByModule(e).length) ? h`<p class="hint">
                    Aucune action disponible : les pièces associées n'ont aucun
                    module actif (ex. Lights).
                  </p>` : this._rooms.map((e) => [e, this._actionsByModule(e)]).filter(([, e]) => e.length > 0).map(([e, t]) => h`
                        ${this._multi ? h`<p class="room-head">🏠 ${e.name}</p>` : ""}
                        ${t.map(([e, t]) => h`
                            <p class="mod-head">${ei[e] ?? e}</p>
                            ${t.map((e) => this._actionRow(e, n))}
                          `)}
                      `)}
            <p class="hint">
              Glisse une action sur un bouton du canvas (ou touche une action
              puis un bouton). Touche un bouton assigné pour le vider.
            </p>
          </div>
          <div class="right">
            ${e.length ? h`<div class="tabs">
                    ${e.map((e) => h`<span
                        class="tab ${e === t ? "active" : ""}"
                        @click=${() => this._tapTab = e}
                        >${ti[e]}</span
                      >`)}
                  </div>
                  ${this._canvas(t)} ${this._invisibleTray(t)}` : h`<p class="hint">Aucun tap mode configuré sur ce preset.</p>`}
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
}, $r.styles = [D, o`
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
    `], $r);
O([b({ attribute: !1 })], B.prototype, "hass", void 0), O([b({ type: Boolean })], B.prototype, "open", void 0), O([b({ attribute: !1 })], B.prototype, "sw", void 0), O([b({ attribute: !1 })], B.prototype, "layout", void 0), O([b({ attribute: !1 })], B.prototype, "taps", void 0), O([x()], B.prototype, "_rooms", void 0), O([x()], B.prototype, "_heatingModes", void 0), O([x()], B.prototype, "_mappings", void 0), O([x()], B.prototype, "_tapTab", void 0), O([x()], B.prototype, "_dragId", void 0), O([x()], B.prototype, "_picked", void 0), O([x()], B.prototype, "_dropBtn", void 0), O([x()], B.prototype, "_busy", void 0), B = O([y("homex-switch-mapping")], B);
// src/components/homex-room-card.ts
var ri = class extends v {
	constructor(...e) {
		super(...e), this.expanded = !1, this._dialog = "", this._menuOpen = !1, this._shutterCtlOpen = !1, this._renameScene = null, this._deleteScenes = !0, this._deleting = !1, this._syncing = !1, this._activeTab = "", this._gswitches = [], this._presets = [], this._layouts = [], this._mappingSwitch = null, this._shutterGroupOpen = !1, this._shutterGroupEdit = null, this._close = () => this._dialog = "", this._delete = () => {
			this._menuOpen = !1, this._deleteScenes = !0, this._dialog = "delete";
		}, this._confirmDelete = async () => {
			this._deleting = !0;
			try {
				await nn(this.hass, this.room.entry_id, this._deleteScenes), this._dialog = "", S(this);
			} catch (e) {
				alert("Erreur Homex : " + C(e));
			} finally {
				this._deleting = !1;
			}
		}, this._syncLabels = async () => {
			this._menuOpen = !1, this._syncing = !0;
			try {
				let e = await ln(this.hass, this.room.entry_id);
				alert(`Synchronisé : ${e.updated} entité(s) (area + labels), ${e.scenes_renamed} scène(s) renommée(s).`);
			} catch (e) {
				alert("Erreur Homex : " + C(e));
			} finally {
				this._syncing = !1;
			}
		}, this._sceneNext = async (e) => {
			e?.stopPropagation();
			try {
				await vn(this.hass, this.room.entry_id);
			} catch (e) {
				alert("Erreur Homex : " + C(e));
			}
		}, this._dim = async (e, t) => {
			t?.stopPropagation();
			try {
				await un(this.hass, this.room.entry_id, e);
			} catch (e) {
				alert("Erreur Homex : " + C(e));
			}
		}, this._toggleExpand = () => {
			this.dispatchEvent(new CustomEvent("homex-toggle-expand", {
				detail: { entry_id: this.room.entry_id },
				bubbles: !0,
				composed: !0
			}));
		};
	}
	_pick(e) {
		this._menuOpen = !1, this._dialog = e;
	}
	_isOn() {
		return this.hass.states[this.room.switch]?.state === "on";
	}
	_openHa(e, t) {
		Bn(`/config/scene/edit/${e.config_id}`, t);
	}
	async _deleteScene(e) {
		if (confirm(`Supprimer la scène "${e.name}" ?`)) try {
			await gn(this.hass, this.room.entry_id, e.key), S(this);
		} catch (e) {
			alert("Erreur Homex : " + C(e));
		}
	}
	async _sceneMoved(e) {
		let { oldIndex: t, newIndex: n } = e.detail, r = this.room.scenes.filter((e) => e.orderable).map((e) => e.key), [i] = r.splice(t, 1);
		r.splice(n, 0, i);
		try {
			await _n(this.hass, this.room.entry_id, r), S(this);
		} catch (e) {
			alert("Erreur Homex : " + C(e));
		}
	}
	_iconBtn(e, t, n, r = !1) {
		return h`<button
      class="icon-btn"
      title=${t}
      aria-label=${t}
      ?disabled=${r}
      @click=${n}
    >
      <svg viewBox="0 0 24 24"><path d=${e}></path></svg>
    </button>`;
	}
	_sceneRow(e, t) {
		return h`
      <div class="scene-row">
        ${e.orderable ? h`<span class="handle" title="Glisser pour réordonner">
              <svg viewBox="0 0 24 24"><path d=${ct}></path></svg>
            </span>` : h`<span class="pin" title="Toujours en dernier">
              <svg viewBox="0 0 24 24"><path d=${St}></path></svg>
            </span>`}
        <span class="scene-name">${e.name}</span>
        ${e.key === t ? h`<span class="active-tag">active</span>` : ""}
        <span class="btn-group">
          ${this._iconBtn(bt, "Voir dans Home Assistant", (t) => this._openHa(e, t))}
          ${this._iconBtn(xt, "Renommer", () => this._renameScene = e)}
          ${this._iconBtn(at, e.removable ? "Supprimer" : "Scène par défaut", () => this._deleteScene(e), !e.removable)}
        </span>
      </div>
    `;
	}
	render() {
		let e = this.room, t = this._isOn() ? this.hass.states[e.switch]?.attributes?.active_scene ?? null : null, n = t ? e.scenes.find((e) => e.key === t)?.name : void 0, r = (e.area_id ? this.hass.areas?.[e.area_id] : null)?.icon || void 0, i = e.scenes.filter((e) => e.orderable), a = e.scenes.filter((e) => !e.orderable), o = e.scenes.some((e) => e.removable), s = e.modules?.includes("lights") ?? !0, c = e.modules?.includes("switches") ?? !1, l = e.modules?.includes("shutters") ?? !1, u = e.modules?.includes("heating") ?? !1, d = !!(e.dim_up_triggers?.length || e.dim_down_triggers?.length);
		return h`
      <ha-card class=${this.expanded ? "selected" : ""}>
        <div class="head" @click=${this._toggleExpand} title="Plier / déplier">
          <svg class="chevron" viewBox="0 0 24 24">
            <path d=${this.expanded ? rt : nt}></path>
          </svg>
          <homex-unit-controls
            .hass=${this.hass}
            .unit=${e}
            .areaIcon=${r}
            hideId
            .activeScene=${n}
            .hideToggle=${!s}
            .info=${u ? this._climateReadings(e) : []}
          ></homex-unit-controls>
          <div class="head-actions">
            ${s && d ? h`
                  <button
                    class="round"
                    title="Baisser la luminosité (−20)"
                    @click=${(e) => this._dim(-20, e)}
                  >
                    <svg viewBox="0 0 24 24"><path d=${yt}></path></svg>
                  </button>
                  <button
                    class="round"
                    title="Monter la luminosité (+20)"
                    @click=${(e) => this._dim(20, e)}
                  >
                    <svg viewBox="0 0 24 24"><path d=${Ct}></path></svg>
                  </button>
                ` : ""}
            ${s && o ? h`<button
                  class="round"
                  title="Changer de scène"
                  @click=${(e) => this._sceneNext(e)}
                >
                  <svg viewBox="0 0 24 24"><path d=${jt}></path></svg>
                </button>` : ""}
            ${l ? this._renderShutterButton(e) : ""}
            <button
              class="kebab"
              title="Actions"
              @click=${(e) => {
			e.stopPropagation(), this._menuOpen = !0;
		}}
            >
              ⋮
            </button>
          </div>
        </div>

        ${this._menuOpen ? h`
              <div class="menu-backdrop" @click=${() => this._menuOpen = !1}></div>
              <div class="menu">
                <button @click=${() => this._pick("room")}>✏️ Modifier la pièce</button>
                ${s ? h`
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

        ${this.expanded ? this._renderStats(e, s, c, l, u) : ""}
        ${this.expanded ? this._renderBody(e, t, i, a, s, c, l, u) : ""}
      </ha-card>

      ${this._renderDialogs(e)}
    `;
	}
	_climateReadings(e) {
		return ["temperature", "humidity"].filter((t) => e.metrics?.[t]?.sensors?.length).map((t) => {
			let n = this.hass.states[`sensor.homex_${e.room_id}_${t}`];
			if (!n || n.state === "unknown" || n.state === "unavailable") return "—";
			let r = n.attributes?.unit_of_measurement ?? "";
			return `${n.state}${r === "%" ? "" : " "}${r}`;
		});
	}
	_climatePills(e) {
		let t = Zn(this.hass, e), n = Yn(this.hass, e), r = (e, t, n, r = "") => h`<span class="stat icon-stat ${r}" title=${n}>
        <svg viewBox="0 0 24 24"><path d=${e}></path></svg>${t}
      </span>`;
		return h`
      ${t ? r(ft, t.mode, t.own ? "Chauffage désactivé dans la pièce" : `Mode de la zone ${t.zone}`) : ""}
      ${e.heating?.radiators?.length ? Xn(this.hass, e) ? r(lt, "Heating", "Au moins une vanne chauffe", "heating") : r(ut, "Idle", "Aucune vanne ne chauffe") : ""}
      ${n ? r(Xe, "Vanne ?", n, "warning") : ""}
    `;
	}
	_renderStats(e, t, n, r, i) {
		let a = Object.values(e.metrics ?? {}).filter((e) => e?.sensors?.length).length;
		return h`
      ${t ? h`
            <div class="module-title">Lights</div>
            <div class="stats">
              <span class="stat">🔌 ${e.devices.length} lumière(s)</span>
              <span class="stat">🎬 ${e.scenes.length} scène(s)</span>
              ${e.groups.length ? h`<span class="stat">📦 ${e.groups.length} groupe(s)</span>` : ""}
            </div>
          ` : ""}
      ${n ? h`
            <div class="module-title">Switches</div>
            <div class="stats">
              <span class="stat">🎛 ${this._roomSwitches().length} interrupteur(s)</span>
              <span class="stat">⚡ ${this._switchActionCount(e)} action(s)</span>
            </div>
          ` : ""}
      ${r ? h`
            <div class="module-title">Shutters</div>
            <div class="stats">
              <span class="stat">📦 ${(e.shutter_groups ?? []).length} groupe(s)</span>
              <span class="stat">🪟 ${this._shutterCount(e)} volet(s)</span>
            </div>
          ` : ""}
      ${i ? h`
            <div class="module-title">Climate</div>
            <div class="stats">
              <span class="stat">📈 ${a} métrique(s)</span>
              <span class="stat">🔥 ${e.heating?.radiators?.length ?? 0} radiateur(s)</span>
              ${this._climatePills(e)}
            </div>
          ` : ""}
    `;
	}
	_renderBody(e, t, n, r, i, a, o, s) {
		let c = [];
		if (i && c.push({
			key: "lights",
			label: "Lights"
		}), a && c.push({
			key: "switches",
			label: "Switches"
		}), o && c.push({
			key: "shutters",
			label: "Shutters"
		}), s && c.push({
			key: "climate",
			label: "Climate"
		}), !c.length) return h`<div class="empty-body">Aucun module actif sur cette pièce.</div>`;
		let l = c.some((e) => e.key === this._activeTab) ? this._activeTab : c[0].key;
		return h`
      <div class="tabs">
        ${c.map((e) => h`<span
            class="tab ${e.key === l ? "active" : ""}"
            @click=${() => this._activeTab = e.key}
            >${e.label}</span
          >`)}
      </div>
      <div class="tab-panel">
        ${l === "lights" ? this._renderLightsTab(e, t, n, r) : l === "switches" ? this._renderSwitchesTab(e) : l === "climate" ? h`<homex-room-climate .hass=${this.hass} .room=${e}></homex-room-climate>` : this._renderShuttersTab(e)}
      </div>
    `;
	}
	_renderLightsTab(e, t, n, r) {
		return h`
      <div class="section-row">
        <span class="section">Scènes</span>
        <button @click=${() => this._pick("addscene")}>＋ Scène</button>
      </div>
      <ha-sortable handle-selector=".handle" @item-moved=${this._sceneMoved}>
        <div>${n.map((e) => this._sceneRow(e, t))}</div>
      </ha-sortable>
      ${r.map((e) => this._sceneRow(e, t))}

      <div class="section-row">
        <span class="section">Groupes</span>
        <button @click=${() => this._pick("addgroup")}>＋ Groupe</button>
      </div>
      ${e.groups.length ? h`<div class="groups">
            ${e.groups.map((t) => h`<homex-group-row
                .hass=${this.hass}
                .room=${e}
                .group=${t}
              ></homex-group-row>`)}
          </div>` : h`<div class="empty-body">
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
				Vt(this.hass),
				Wt(this.hass),
				Rt(this.hass)
			]);
		} catch {}
	}
	_roomSwitches() {
		let e = this.room.room_id;
		return this._gswitches.filter((t) => (t.rooms || []).includes(e));
	}
	_switchActionCount(e) {
		let t = e.switch_triggers;
		if (!t) return 0;
		let n = t.toggle.length + t.scene_next.length + t.dim_up.length + t.dim_down.length;
		for (let e of Object.values(t.scenes)) n += e.length;
		for (let e of Object.values(t.groups)) n += e.length;
		return n;
	}
	_presetFor(e) {
		return Wn(this.hass, this._presets, e);
	}
	_layoutFor(e) {
		return e ? this._layouts.find((t) => t.id === e.layout_id) : void 0;
	}
	_openSwitchManagerAdd() {
		this.dispatchEvent(new CustomEvent("open-switch-add", {
			detail: { room_id: this.room.room_id },
			bubbles: !0,
			composed: !0
		}));
	}
	_renderSwitchesTab(e) {
		let t = this._roomSwitches();
		return h`
      <div class="section-row">
        <span class="section">Interrupteurs</span>
        <button @click=${() => this._openSwitchManagerAdd()}>＋ Interrupteur</button>
      </div>
      ${t.length ? t.map((e) => {
			let t = this._presetFor(e);
			return h`<div
              class="switch-row"
              @click=${() => this._mappingSwitch = e}
            >
              <span class="switch-name">🎛 ${e.name}</span>
              <span class="switch-meta">
                ${t ? t.name : "aucun preset"}
              </span>
            </div>`;
		}) : h`<div class="empty-body">
            Aucun interrupteur associé. Clique sur « ＋ Interrupteur » pour en
            créer un (via le Switch Manager) et l'associer à cette pièce.
          </div>`}
    `;
	}
	_openShutterGroup(e) {
		this._shutterGroupEdit = e, this._shutterGroupOpen = !0;
	}
	_renderShuttersTab(e) {
		return h`
      <div class="section-row">
        <span class="section">Groupes de volets</span>
        <button @click=${() => this._openShutterGroup(null)}>＋ Groupe</button>
      </div>
      ${(e.shutter_groups ?? []).map((e) => h`<div class="shutter-group">
          <div class="shutter-group-head">
            <span class="switch-name">📦 ${e.name}</span>
            <button
              class="cfg-btn"
              title="Configurer le groupe"
              @click=${() => this._openShutterGroup(e)}
            >
              ⚙
            </button>
          </div>
          ${e.devices.length ? e.devices.map((e) => h`<div class="shutter-cover">
                  🪟 ${this._entityName(e)}
                </div>`) : h`<div class="shutter-cover empty">Aucun volet dans ce groupe.</div>`}
        </div>`)}
    `;
	}
	_entityName(e) {
		return this.hass.states[e]?.attributes?.friendly_name || e;
	}
	_shutterCount(e) {
		return (e.shutter_groups ?? []).reduce((e, t) => e + (t.devices?.length ?? 0), 0);
	}
	_renderShutterButton(e) {
		let t = nr(e);
		if (!t) return "";
		let n = tr(this.hass, t.devices);
		return h`<button
      class="round shutter-btn ${n.state}"
      title=${`Volets (${t.name}) : ${n.label}${n.position === null ? "" : ` · ${n.position} %`}`}
      @click=${(e) => {
			e.stopPropagation(), this._shutterCtlOpen = !0;
		}}
    >
      <svg viewBox="0 0 24 24"><path d=${n.icon}></path></svg>
    </button>`;
	}
	_renderDialogs(e) {
		return h`
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
      ${this._mappingSwitch ? h`<homex-switch-mapping
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
		return h`
      <div
        class="confirm-backdrop"
        @click=${(e) => {
			e.target === e.currentTarget && !this._deleting && this._close();
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
                @change=${(e) => this._deleteScenes = e.target.checked}
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
}, V = (ri.styles = [D, o`
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
    `], ri);
O([b({ attribute: !1 })], V.prototype, "hass", void 0), O([b({ attribute: !1 })], V.prototype, "room", void 0), O([b({ type: Boolean })], V.prototype, "expanded", void 0), O([x()], V.prototype, "_dialog", void 0), O([x()], V.prototype, "_menuOpen", void 0), O([x()], V.prototype, "_shutterCtlOpen", void 0), O([x()], V.prototype, "_renameScene", void 0), O([x()], V.prototype, "_deleteScenes", void 0), O([x()], V.prototype, "_deleting", void 0), O([x()], V.prototype, "_syncing", void 0), O([x()], V.prototype, "_activeTab", void 0), O([x()], V.prototype, "_gswitches", void 0), O([x()], V.prototype, "_presets", void 0), O([x()], V.prototype, "_layouts", void 0), O([x()], V.prototype, "_mappingSwitch", void 0), O([x()], V.prototype, "_shutterGroupOpen", void 0), O([x()], V.prototype, "_shutterGroupEdit", void 0), V = O([y("homex-room-card")], V);
// src/components/homex-export-dialog.ts
var ii, ai = (e) => "\"" + String(e).replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"";
function oi(e) {
	let t = ["google_assistant:", "  entity_config:"];
	e.length || (t[1] = "  entity_config: {}");
	for (let n of e) t.push(`    ${n.switch}:`), t.push(`      name: ${ai(n.name)}`), t.push("      expose: true"), t.push(`      room: ${ai(n.name)}`);
	return t.join("\n") + "\n";
}
var si = (ii = class extends v {
	constructor(...e) {
		super(...e), this.open = !1, this.rooms = [], this._copied = !1;
	}
	get _yaml() {
		return oi(this.rooms);
	}
	_close() {
		this.dispatchEvent(new CustomEvent("dialog-closed"));
	}
	async _copy() {
		let e = this._yaml;
		try {
			await navigator.clipboard.writeText(e);
		} catch {
			let e = this.renderRoot.querySelector("textarea");
			e && (e.select(), document.execCommand("copy"));
		}
		this._copied = !0, setTimeout(() => this._copied = !1, 1500);
	}
	_download() {
		let e = new Blob([this._yaml], { type: "text/yaml" }), t = URL.createObjectURL(e), n = document.createElement("a");
		n.href = t, n.download = "homex_google_assistant.yaml", n.click(), URL.revokeObjectURL(t);
	}
	render() {
		return h`
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
}, ii.styles = [D, o`
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
    `], ii);
O([b({ type: Boolean })], si.prototype, "open", void 0), O([b({ attribute: !1 })], si.prototype, "rooms", void 0), O([x()], si.prototype, "_copied", void 0), si = O([y("homex-export-dialog")], si);
// src/components/homex-layout-editor.ts
var ci, li = 20, ui = .5, H = (ci = class extends v {
	constructor(...e) {
		super(...e), this.layout = null, this._name = "", this._id = "", this._buttons = 2, this._shape = "round", this._bounds = {
			x: 5,
			y: 5,
			w: 10,
			h: 10
		}, this._columns = 2, this._rows = 1, this._colLines = [], this._rowLines = [], this._userHidden = /* @__PURE__ */ new Set(), this._assignments = [], this._busy = !1, this._dragClient = null, this._hoverCell = -1, this._overTray = !1, this._idEdited = !1, this._drag = null, this._onUp = () => {
			let e = this._drag;
			if (e?.kind === "num") {
				let t = [...this._assignments];
				this._hoverCell >= 0 ? (e.fromCell >= 0 ? [t[e.fromCell], t[this._hoverCell]] = [t[this._hoverCell], t[e.fromCell]] : (t[this._hoverCell] > 0 && this._userHidden.add(t[this._hoverCell]), t[this._hoverCell] = e.button, this._userHidden.delete(e.button)), this._assignments = t) : this._overTray && e.fromCell >= 0 && (this._userHidden.add(t[e.fromCell]), t[e.fromCell] = 0, this._assignments = t);
			}
			this._drag = null, this._dragClient = null, this._hoverCell = -1, this._overTray = !1, window.removeEventListener("pointermove", this._onMove), window.removeEventListener("pointerup", this._onUp);
		}, this._onMove = (e) => {
			let t = this._drag;
			if (!t) return;
			if (t.kind === "num") {
				this._dragClient = {
					x: e.clientX,
					y: e.clientY
				}, this._hitTest(e.clientX, e.clientY);
				return;
			}
			let { x: n, y: r } = this._svgPoint(e), i = this._bounds;
			if (t.kind === "col") {
				let e = [...this._colLines];
				e[t.index] = Math.min(Math.max(n, i.x), i.x + i.w), this._colLines = e;
			} else if (t.kind === "row") {
				let e = [...this._rowLines];
				e[t.index] = Math.min(Math.max(r, i.y), i.y + i.h), this._rowLines = e;
			} else if (t.kind === "br") {
				let e = Math.max(2, n - i.x), t = Math.max(2, r - i.y);
				this._shape === "round" && (e = t = Math.max(e, t)), this._bounds = {
					...i,
					w: e,
					h: t
				}, this._clampDividers();
			} else if (t.kind === "tl") {
				let e = i.x + i.w, t = i.y + i.h, a = Math.min(n, e - 2), o = Math.min(r, t - 2), s = e - a, c = t - o;
				if (this._shape === "round") {
					let n = Math.max(s, c);
					a = e - n, o = t - n, s = c = n;
				}
				this._bounds = {
					x: a,
					y: o,
					w: s,
					h: c
				}, this._clampDividers();
			}
		};
	}
	willUpdate(e) {
		if (e.has("layout")) {
			let e = this.layout;
			this._name = e?.name ?? "", this._id = e?.id ?? "", this._buttons = e?.buttons ?? 2, this._shape = e?.shape ?? "round", this._bounds = e?.bounds ? {
				x: e.bounds.x + 10,
				y: e.bounds.y + 10,
				w: e.bounds.w,
				h: e.bounds.h
			} : this._defaultBounds(this._shape), this._columns = e?.columns ?? 2, this._rows = e?.rows ?? 1, this._idEdited = !!e, this._busy = !1, this._dragClient = null, this._hoverCell = -1, this._overTray = !1, e && (e.colLines?.length || e.rowLines?.length) ? (this._colLines = (e.colLines ?? []).map((e) => e + 10), this._rowLines = (e.rowLines ?? []).map((e) => e + 10)) : this._resetDividers(), this._assignments = e?.assignments ? [...e.assignments] : [], this._userHidden = new Set(e?.assignments ? this._unassigned() : []), this._reconcile();
		}
	}
	_defaultBounds(e) {
		return e === "vrect" ? {
			x: 7.5,
			y: 0,
			w: 5,
			h: 20
		} : {
			x: 5,
			y: 5,
			w: 10,
			h: 10
		};
	}
	_snap(e) {
		return Math.min(li, Math.max(0, Math.round(e / ui) * ui));
	}
	_resetDividers() {
		let e = this._bounds, t = Math.max(1, this._columns), n = Math.max(1, this._rows);
		this._colLines = Array.from({ length: t - 1 }, (n, r) => e.x + e.w * (r + 1) / t), this._rowLines = Array.from({ length: n - 1 }, (t, r) => e.y + e.h * (r + 1) / n);
	}
	_clampDividers() {
		let e = this._bounds;
		this._colLines = this._colLines.map((t) => Math.min(Math.max(t, e.x), e.x + e.w)), this._rowLines = this._rowLines.map((t) => Math.min(Math.max(t, e.y), e.y + e.h));
	}
	_reconcile() {
		for (let e of [...this._userHidden]) e > this._buttons && this._userHidden.delete(e);
		let e = this._userHidden, t = Math.max(1, this._columns) * Math.max(1, this._rows), n = this._assignments, r = Array(t).fill(0), i = /* @__PURE__ */ new Set();
		for (let e = 0; e < Math.min(n.length, t); e++) {
			let t = n[e];
			t >= 1 && t <= this._buttons && !i.has(t) && (r[e] = t, i.add(t));
		}
		for (let t = 1; t <= this._buttons; t++) if (!i.has(t) && !e.has(t)) {
			let e = r.indexOf(0);
			e >= 0 && (r[e] = t, i.add(t));
		}
		this._assignments = r;
	}
	_cells() {
		let e = this._bounds, t = Math.max(1, this._columns), n = Math.max(1, this._rows), r = [
			e.x,
			...[...this._colLines].sort((e, t) => e - t),
			e.x + e.w
		], i = [
			e.y,
			...[...this._rowLines].sort((e, t) => e - t),
			e.y + e.h
		], a = [];
		for (let o = 0; o < n; o++) for (let n = 0; n < t; n++) {
			let s = r[n] ?? e.x, c = r[n + 1] ?? e.x + e.w, l = i[o] ?? e.y, u = i[o + 1] ?? e.y + e.h;
			a.push({
				i: o * t + n,
				x: s,
				y: l,
				w: c - s,
				h: u - l,
				cx: (s + c) / 2,
				cy: (l + u) / 2
			});
		}
		return a;
	}
	_cellAt(e, t) {
		for (let n of this._cells()) if (e >= n.x && e <= n.x + n.w && t >= n.y && t <= n.y + n.h) return n.i;
		return -1;
	}
	_unassigned() {
		let e = new Set(this._assignments.filter((e) => e > 0)), t = [];
		for (let n = 1; n <= this._buttons; n++) e.has(n) || t.push(n);
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
		this._name = e, this._idEdited || (this._id = M(e));
	}
	_svgPoint(e, t = !0) {
		let n = this.renderRoot.querySelector("svg").getBoundingClientRect(), r = (e.clientX - n.left) / n.width * li, i = (e.clientY - n.top) / n.height * li;
		return t ? {
			x: this._snap(r),
			y: this._snap(i)
		} : {
			x: r,
			y: i
		};
	}
	_start(e, t) {
		t.preventDefault(), t.stopPropagation(), this._drag = e, e?.kind === "num" && (this._dragClient = {
			x: t.clientX,
			y: t.clientY
		}, this._hitTest(t.clientX, t.clientY)), window.addEventListener("pointermove", this._onMove), window.addEventListener("pointerup", this._onUp);
	}
	_hitTest(e, t) {
		let n = this.renderRoot.querySelector("svg").getBoundingClientRect();
		if (e >= n.left && e <= n.right && t >= n.top && t <= n.bottom) {
			let r = (e - n.left) / n.width * li, i = (t - n.top) / n.height * li;
			this._hoverCell = this._cellAt(r, i), this._overTray = !1;
			return;
		}
		let r = this.renderRoot.querySelector(".tray")?.getBoundingClientRect();
		this._overTray = !!(r && e >= r.left && e <= r.right && t >= r.top && t <= r.bottom), this._hoverCell = -1;
	}
	_close() {
		this.dispatchEvent(new CustomEvent("layout-closed"));
	}
	_recenterShape() {
		let e = this._bounds, t = 10 - (e.x + e.w / 2), n = 10 - (e.y + e.h / 2);
		this._bounds = {
			x: e.x + t,
			y: e.y + n,
			w: e.w,
			h: e.h
		}, this._colLines = this._colLines.map((e) => e + t), this._rowLines = this._rowLines.map((e) => e + n);
	}
	async _save() {
		let e = this._name.trim(), t = this._id.trim();
		if (!e || !t) {
			alert("Nom et id du layout requis.");
			return;
		}
		this._recenterShape();
		let n = this._cells().filter((e) => this._assignments[e.i] > 0), r = n.map((e) => ({
			n: this._assignments[e.i],
			x: e.cx - 10,
			y: e.cy - 10
		})), i = n.map((e) => ({
			n: this._assignments[e.i],
			x: e.x - 10,
			y: e.y - 10,
			w: e.w,
			h: e.h
		})), a = this._bounds, o = {
			id: t,
			name: e,
			buttons: this._buttons,
			shape: this._shape,
			bounds: {
				x: a.x - 10,
				y: a.y - 10,
				w: a.w,
				h: a.h
			},
			columns: this._columns,
			rows: this._rows,
			colLines: this._colLines.map((e) => e - 10),
			rowLines: this._rowLines.map((e) => e - 10),
			assignments: this._assignments,
			positions: r,
			zones: i
		};
		this._busy = !0;
		try {
			await zt(this.hass, o), this._close();
		} catch (e) {
			this._busy = !1, alert("Erreur Homex : " + C(e));
		}
	}
	async _delete() {
		if (this.layout && confirm(`Supprimer le layout "${this.layout.name}" ?`)) {
			this._busy = !0;
			try {
				await Bt(this.hass, this.layout.id), this._close();
			} catch (e) {
				this._busy = !1, alert("Erreur Homex : " + C(e));
			}
		}
	}
	_renderShape() {
		let e = this._bounds;
		return this._shape === "round" ? g`<ellipse class="shape" cx=${e.x + e.w / 2} cy=${e.y + e.h / 2}
        rx=${e.w / 2} ry=${e.h / 2}></ellipse>` : g`<rect class="shape" x=${e.x} y=${e.y} width=${e.w} height=${e.h}
      rx="0.4"></rect>`;
	}
	_shapeClip() {
		let e = this._bounds;
		return this._shape === "round" ? g`<ellipse cx=${e.x + e.w / 2} cy=${e.y + e.h / 2}
        rx=${e.w / 2} ry=${e.h / 2}></ellipse>` : g`<rect x=${e.x} y=${e.y} width=${e.w} height=${e.h} rx="0.4"></rect>`;
	}
	render() {
		let e = this._bounds, t = Array.from({ length: 21 }, (e, t) => t), n = this._cells(), r = this._unassigned(), i = this._drag?.kind === "num" ? this._drag : null, a = i ? i.fromCell : -1, o = i ? this._hoverCell : -1;
		return h`
      <div class="cols">
        <div class="form">
          ${A("Nom", this._name, (e) => this._onName(e), "Rond 2 boutons")}
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
                @change=${(e) => this._setButtons(Number(e.target.value))} />
            </div>
            <div class="field">
              <label>Colonnes</label>
              <input class="num" type="number" min="1" .value=${String(this._columns)}
                @change=${(e) => this._setColumns(Number(e.target.value))} />
            </div>
            <div class="field">
              <label>Lignes</label>
              <input class="num" type="number" min="1" .value=${String(this._rows)}
                @change=${(e) => this._setRows(Number(e.target.value))} />
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
            ${t.map((e) => g`
                <line class="grid-line" x1=${e} y1="0" x2=${e} y2="20"></line>
                <line class="grid-line" x1="0" y1=${e} x2="20" y2=${e}></line>`)}
            ${this._renderShape()}
            ${n.map((e) => this._assignments[e.i] > 0 ? g`<rect class="zone" x=${e.x} y=${e.y} width=${e.w} height=${e.h}
                    clip-path="url(#shapeclip)"></rect>` : "")}
            ${o >= 0 && o !== a ? (() => {
			let e = n[o];
			return g`<rect class="cell-hi" x=${e.x} y=${e.y}
                    width=${e.w} height=${e.h} clip-path="url(#shapeclip)"></rect>`;
		})() : ""}
            ${this._colLines.map((t, n) => g`
                <line class="divider" x1=${t} y1=${e.y} x2=${t} y2=${e.y + e.h}
                  clip-path="url(#shapeclip)"></line>
                <line class="divider-hit" x1=${t} y1=${e.y} x2=${t} y2=${e.y + e.h}
                  @pointerdown=${(e) => this._start({
			kind: "col",
			index: n
		}, e)}></line>`)}
            ${this._rowLines.map((t, n) => g`
                <line class="divider" x1=${e.x} y1=${t} x2=${e.x + e.w} y2=${t}
                  clip-path="url(#shapeclip)"></line>
                <line class="divider-hit" x1=${e.x} y1=${t} x2=${e.x + e.w} y2=${t}
                  @pointerdown=${(e) => this._start({
			kind: "row",
			index: n
		}, e)}></line>`)}
            ${n.map((e) => {
			let t = this._assignments[e.i];
			return !t || e.i === a ? "" : g`
                <circle class="num-badge" cx=${e.cx} cy=${e.cy} r="1.1"
                  @pointerdown=${(n) => this._start({
				kind: "num",
				fromCell: e.i,
				button: t
			}, n)}></circle>
                <text class="num-text" x=${e.cx} y=${e.cy}>${t}</text>`;
		})}
            <rect class="handle" x=${e.x - .35} y=${e.y - .35} width="0.7" height="0.7"
              @pointerdown=${(e) => this._start({ kind: "tl" }, e)}></rect>
            <rect class="handle" x=${e.x + e.w - .35} y=${e.y + e.h - .35} width="0.7" height="0.7"
              @pointerdown=${(e) => this._start({ kind: "br" }, e)}></rect>
          </svg>

          <div class="tray ${i && this._overTray ? "over" : ""}">
            <span class="tray-label">Invisible</span>
            ${r.length ? r.map((e) => h`<span
                    class="tray-badge"
                    @pointerdown=${(t) => this._start({
			kind: "num",
			fromCell: -1,
			button: e
		}, t)}
                    >${e}</span
                  >`) : h`<span class="tray-empty">
                  Glisse un bouton ici pour le rendre invisible
                </span>`}
          </div>
        </div>
      </div>

      ${i && this._dragClient ? h`<div
            class="floating"
            style="left:${this._dragClient.x}px; top:${this._dragClient.y}px"
          >
            ${i.button}
          </div>` : ""}

      <div class="actions">
        ${this.layout ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>` : ""}
        <button @click=${this._close}>Annuler</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._save}>
          ${this.layout ? "Enregistrer" : "Créer le layout"}
        </button>
      </div>
    `;
	}
}, ci.styles = [D, o`
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
    `], ci);
O([b({ attribute: !1 })], H.prototype, "hass", void 0), O([b({ attribute: !1 })], H.prototype, "layout", void 0), O([x()], H.prototype, "_name", void 0), O([x()], H.prototype, "_id", void 0), O([x()], H.prototype, "_buttons", void 0), O([x()], H.prototype, "_shape", void 0), O([x()], H.prototype, "_bounds", void 0), O([x()], H.prototype, "_columns", void 0), O([x()], H.prototype, "_rows", void 0), O([x()], H.prototype, "_colLines", void 0), O([x()], H.prototype, "_rowLines", void 0), O([x()], H.prototype, "_assignments", void 0), O([x()], H.prototype, "_busy", void 0), O([x()], H.prototype, "_dragClient", void 0), O([x()], H.prototype, "_hoverCell", void 0), O([x()], H.prototype, "_overTray", void 0), H = O([y("homex-layout-editor")], H);
// src/components/homex-preset-editor.ts
var di = class extends v {
	constructor(...e) {
		super(...e), this.preset = null, this.layouts = [], this.prefillDevice = "", this._name = "", this._nameTyped = !1, this._id = "", this._deviceId = "", this._modelKey = "", this._models = [], this._devices = [], this._layoutId = "", this._taps = {}, this._bindings = {}, this._actions = [], this._actionTab = "single", this._busy = !1, this._idEdited = !1;
	}
	connectedCallback() {
		super.connectedCallback(), this._loadModels(), this._loadDevices();
	}
	async _loadModels() {
		try {
			this._models = await qt(this.hass);
		} catch {
			this._models = [];
		}
	}
	async _loadDevices() {
		try {
			this._devices = await Jt(this.hass);
		} catch {
			this._devices = [];
		}
	}
	_devicesForModel() {
		return this._modelKey ? this._devices.filter((e) => e.model === this._modelKey) : [];
	}
	willUpdate(e) {
		if (e.has("preset")) {
			let e = this.preset;
			this._name = e?.name ?? "", this._nameTyped = !!e, this._id = e?.id ?? "", this._deviceId = e?.device_id ?? this.prefillDevice ?? "", this._modelKey = e?.model ?? (this._deviceId ? Vn(this.hass, this._deviceId) : ""), this._layoutId = e?.layout_id ?? "", this._taps = JSON.parse(JSON.stringify(e?.taps ?? {})), this._bindings = JSON.parse(JSON.stringify(e?.bindings ?? {})), this._actions = [], this._idEdited = !!e, this._busy = !1, !e && this._deviceId && !this._name && (this._name = Hn(this.hass, this._deviceId), this._id = M(this._name)), this._ensureTaps(), this._deviceId && this._loadActions();
		}
	}
	_selectedLayout() {
		return this.layouts.find((e) => e.id === this._layoutId);
	}
	_ensureTaps() {
		let e = this._selectedLayout()?.buttons ?? 0, t = {};
		for (let n = 1; n <= e; n++) t[n] = this._taps[n] ?? ["single"];
		this._taps = t;
	}
	_toggleTap(e, t) {
		let n = this._taps[e] ?? [];
		this._taps = {
			...this._taps,
			[e]: n.includes(t) ? n.filter((e) => e !== t) : [...n, t]
		};
	}
	_onLayout(e) {
		this._layoutId = e, this._ensureTaps();
	}
	async _loadActions() {
		try {
			this._actions = await sn(this.hass, this._deviceId);
		} catch {
			this._actions = [];
		}
	}
	_onModel(e) {
		this._modelKey = e;
		let t = this._models.find((t) => t.model === e);
		this._deviceId = t?.device_id ?? "", this._actions = [], this._bindings = {}, t && (this._name.trim() && this._nameTyped || (this._name = t.label, this._idEdited || (this._id = M(t.label))), this._loadActions());
	}
	_onRefDevice(e) {
		this._deviceId = e, this._actions = [], this._bindings = {}, e && this._loadActions();
	}
	_enabledModes() {
		let e = /* @__PURE__ */ new Set();
		return Object.values(this._taps).forEach((t) => t.forEach((t) => e.add(t))), fi.TAP_MODES.map((e) => e.mode).filter((t) => e.has(t));
	}
	_buttonsFor(e) {
		return Object.entries(this._taps).filter(([, t]) => t.includes(e)).map(([e]) => Number(e)).sort((e, t) => e - t);
	}
	_setBind(e, t, n) {
		this._bindings = {
			...this._bindings,
			[e]: {
				...this._bindings[e] ?? {},
				[t]: n ? [n] : []
			}
		};
	}
	_usedActions(e, t) {
		let n = /* @__PURE__ */ new Set();
		for (let [r, i] of Object.entries(this._bindings)) for (let [a, o] of Object.entries(i)) (r !== e || Number(a) !== t) && (o ?? []).forEach((e) => n.add(e));
		return n;
	}
	_onName(e) {
		this._name = e, this._nameTyped = !0, this._idEdited || (this._id = M(e));
	}
	_onId(e) {
		this._id = e, this._idEdited = !0;
	}
	_close(e = "") {
		this.dispatchEvent(new CustomEvent("preset-closed", { detail: { preset_id: e } }));
	}
	async _save() {
		let e = this._name.trim(), t = this._id.trim();
		if (!e || !t) alert("Nom et id du preset requis.");
		else if (!this._deviceId) alert("Choisis un appareil (modèle).");
		else if (!this._layoutId) alert("Sélectionne un layout.");
		else {
			this._busy = !0;
			try {
				await Gt(this.hass, {
					id: t,
					name: e,
					model: Vn(this.hass, this._deviceId),
					model_label: Hn(this.hass, this._deviceId),
					device_id: this._deviceId,
					layout_id: this._layoutId,
					taps: this._taps,
					bindings: this._bindings
				}), this._close(t);
			} catch (e) {
				this._busy = !1, alert("Erreur Homex : " + C(e));
			}
		}
	}
	async _delete() {
		if (this.preset && confirm(`Supprimer le preset "${this.preset.name}" ?`)) {
			this._busy = !0;
			try {
				await Kt(this.hass, this.preset.id), this._close();
			} catch (e) {
				this._busy = !1, alert("Erreur Homex : " + C(e));
			}
		}
	}
	_renderActions() {
		if (!this._deviceId) return "";
		if (!this._actions.length) return h`<p class="hint">Aucune action disponible pour cet appareil.</p>`;
		let e = this._enabledModes();
		if (!e.length) return "";
		let t = e.includes(this._actionTab) ? this._actionTab : e[0], n = (e) => fi.TAP_MODES.find((t) => t.mode === e)?.label ?? e;
		return h`
      <div class="section">Actions par bouton</div>
      <p class="hint">
        Pour chaque tap mode, associe chaque bouton aux actions standard du modèle.
      </p>
      <div class="tabs">
        ${e.map((e) => h`<span
            class="atab ${e === t ? "active" : ""}"
            @click=${() => this._actionTab = e}
            >${n(e)}</span
          >`)}
      </div>
      ${this._buttonsFor(t).map((e) => {
			let n = this._bindings[t]?.[e]?.[0] ?? "", r = this._usedActions(t, e);
			return h`<div class="bind-row">
          <div class="btn-lbl">Bouton ${e}</div>
          <homex-select
            class="bind-select"
            placeholder="Aucune action"
            .value=${n}
            .options=${this._actions.filter((e) => !r.has(e.label) || e.label === n).map((e) => ({
				value: e.label,
				label: e.label
			}))}
            @value-changed=${(n) => this._setBind(t, e, n.detail.value)}
          ></homex-select>
        </div>`;
		})}
    `;
	}
	render() {
		let e = !!this.preset;
		return h`
      ${A("Nom du preset", this._name, (e) => this._onName(e), "Modèle X")}
      ${e ? h`<div class="section">Id : ${this.preset.id}</div>` : ""}

      <div class="section">Modèle d'interrupteur</div>
      ${this._models.length ? h`<homex-select
            placeholder="Choisir un modèle…"
            .value=${this._modelKey}
            .options=${this._models.map((e) => ({
			value: e.model,
			label: e.label,
			tertiary: `${e.count} appareil(s)`
		}))}
            @value-changed=${(e) => this._onModel(e.detail.value)}
          ></homex-select>` : h`<p class="hint">
            Aucun interrupteur détecté (appareil exposant des actions).
          </p>`}

      ${this._modelKey ? h`<div class="section">Appareil de référence</div>
            <p class="hint">
              Appareil du modèle duquel les actions sont récupérées. Un même
              modèle peut exposer des actions différentes selon l'appareil.
            </p>
            ${this._devicesForModel().length ? h`<homex-select
                  placeholder="Choisir un appareil…"
                  .value=${this._deviceId}
                  .options=${this._devicesForModel().map((e) => ({
			value: e.device_id,
			label: e.name
		}))}
                  @value-changed=${(e) => this._onRefDevice(e.detail.value)}
                ></homex-select>` : h`<p class="hint">
                  Aucun appareil détecté pour ce modèle.
                </p>`}` : ""}

      <div class="section">Layout</div>
      ${this.layouts.length ? h`<homex-select
            placeholder="Choisir un layout…"
            .value=${this._layoutId}
            .options=${this.layouts.map((e) => ({
			value: e.id,
			label: e.name,
			tertiary: `${e.buttons} bouton(s)`
		}))}
            @value-changed=${(e) => this._onLayout(e.detail.value)}
          ></homex-select>` : h`<p class="hint">Aucun layout. Crée-en un dans « Switch Layouts ».</p>`}

      ${this._selectedLayout() ? h`
            <div class="section">Tap modes par bouton</div>
            <p class="hint">Simple activé par défaut ; ajoute Double / Long au besoin.</p>
            ${Array.from({ length: this._selectedLayout().buttons }, (e, t) => t + 1).map((e) => h`<div class="btn-row">
                <span class="btn-lbl">Bouton ${e}</span>
                <div class="chips">
                  ${fi.TAP_MODES.map((t) => h`<span
                      class="tap ${(this._taps[e] ?? []).includes(t.mode) ? "on" : ""}"
                      @click=${() => this._toggleTap(e, t.mode)}
                      >${t.label}</span
                    >`)}
                </div>
              </div>`)}
            ${this._renderActions()}
          ` : ""}

      <div class="actions">
        ${e ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>` : ""}
        <button @click=${this._close}>Annuler</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._save}>
          ${e ? "Enregistrer" : "Créer le preset"}
        </button>
      </div>
    `;
	}
}, fi = di, U = (di.TAP_MODES = [
	{
		mode: "single",
		label: "Simple"
	},
	{
		mode: "double",
		label: "Double"
	},
	{
		mode: "long",
		label: "Long"
	}
], di.styles = [D, o`
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
    `], di);
O([b({ attribute: !1 })], U.prototype, "hass", void 0), O([b({ attribute: !1 })], U.prototype, "preset", void 0), O([b({ attribute: !1 })], U.prototype, "layouts", void 0), O([b({ attribute: !1 })], U.prototype, "prefillDevice", void 0), O([x()], U.prototype, "_name", void 0), O([x()], U.prototype, "_id", void 0), O([x()], U.prototype, "_deviceId", void 0), O([x()], U.prototype, "_modelKey", void 0), O([x()], U.prototype, "_models", void 0), O([x()], U.prototype, "_devices", void 0), O([x()], U.prototype, "_layoutId", void 0), O([x()], U.prototype, "_taps", void 0), O([x()], U.prototype, "_bindings", void 0), O([x()], U.prototype, "_actions", void 0), O([x()], U.prototype, "_actionTab", void 0), O([x()], U.prototype, "_busy", void 0), U = fi = O([y("homex-preset-editor")], U);
// src/components/homex-gswitch-editor.ts
var pi = class extends v {
	constructor(...e) {
		super(...e), this.sw = null, this.presets = [], this.initialRooms = [], this.draft = null, this._name = "", this._id = "", this._deviceId = "", this._presetId = "", this._devices = [], this._rooms = [], this._allRooms = [], this._busy = !1, this._idEdited = !1, this._closeRoomsOutside = (e) => {
			let t = this._roomsDropdown();
			t?.open && !e.composedPath().includes(t) && (t.open = !1);
		}, this._closeRoomsOnEscape = (e) => {
			let t = this._roomsDropdown();
			t?.open && e.key === "Escape" && (t.open = !1);
		};
	}
	willUpdate(e) {
		if (e.has("sw") || e.has("draft")) {
			let e = {
				...this.sw ?? {},
				...this.draft ?? {}
			};
			this._name = e.name ?? "", this._id = e.id ?? "", this._deviceId = e.device_id ?? "", this._presetId = e.preset_id ?? "", this._rooms = [...e.rooms ?? this.initialRooms ?? []], this._idEdited = !!this.sw || !!this.draft?.id, this._busy = !1, this._loadRooms();
		}
	}
	async _loadRooms() {
		try {
			let e = await en(this.hass);
			this._allRooms = e.filter((e) => (e.modules ?? []).includes("switches")).map((e) => ({
				room_id: e.room_id,
				name: e.name,
				area_id: e.area_id
			}));
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
	_roomsDropdown() {
		return this.shadowRoot?.querySelector("details.multi") ?? null;
	}
	async _loadDevices() {
		try {
			this._devices = await Jt(this.hass);
		} catch {
			this._devices = [];
		}
	}
	_modelPresets() {
		return this._deviceId ? Un(this.hass, this.presets, this._deviceId) : [];
	}
	_preset() {
		if (this._deviceId) return Wn(this.hass, this.presets, {
			device_id: this._deviceId,
			preset_id: this._presetId
		});
	}
	_onDevice(e) {
		this._deviceId = e;
		let t = this._modelPresets();
		t.some((e) => e.id === this._presetId) || (this._presetId = t.length === 1 ? t[0].id : "");
	}
	_onName(e) {
		this._name = e, this._idEdited || (this._id = M(e));
	}
	_toggleRoom(e) {
		this._rooms = this._rooms.includes(e) ? this._rooms.filter((t) => t !== e) : [...this._rooms, e];
	}
	_close() {
		this.dispatchEvent(new CustomEvent("switch-closed"));
	}
	_createPreset() {
		this.dispatchEvent(new CustomEvent("create-preset", { detail: {
			device_id: this._deviceId,
			draft: {
				name: this._name,
				id: this._id,
				device_id: this._deviceId,
				preset_id: this._presetId,
				rooms: this._rooms
			}
		} }));
	}
	async _save() {
		let e = this._name.trim(), t = this._id.trim();
		if (!e || !t) alert("Nom et id du switch requis.");
		else if (!this._deviceId) alert("Choisis un appareil.");
		else {
			this._busy = !0;
			try {
				await Ht(this.hass, {
					...this.sw ?? {},
					id: t,
					name: e,
					device_id: this._deviceId,
					preset_id: this._preset()?.id ?? "",
					rooms: this._rooms
				}, !this.sw), this._close();
			} catch (e) {
				this._busy = !1, alert("Erreur Homex : " + C(e));
			}
		}
	}
	async _delete() {
		if (this.sw && confirm(`Supprimer le switch "${this.sw.name}" ?`)) {
			this._busy = !0;
			try {
				await Ut(this.hass, this.sw.id), this._close();
			} catch (e) {
				this._busy = !1, alert("Erreur Homex : " + C(e));
			}
		}
	}
	_renderPreset(e) {
		let t = this._modelPresets(), n = Hn(this.hass, this._deviceId);
		return t.length ? h`<div class="preset-box ${e ? "ok" : ""}">
      <div class="section">Preset</div>
      <homex-select
        .value=${e?.id ?? ""}
        .options=${t.map((e) => ({
			value: e.id,
			label: e.name
		}))}
        @value-changed=${(e) => this._presetId = e.detail.value}
      ></homex-select>
      <div class="row">
        <span class="hint">Modèle : ${n}</span>
        <button @click=${this._createPreset}>＋ Nouveau preset</button>
      </div>
    </div>` : h`<div class="preset-box">
        <div class="row">
          <span>Aucun preset pour le modèle <b>${n}</b>.</span>
          <button class="primary" @click=${this._createPreset}>
            ＋ Créer un preset
          </button>
        </div>
      </div>`;
	}
	_renderRooms() {
		if (!this._allRooms.length) return h`<p class="hint">Aucune pièce avec le module Switches.</p>`;
		let e = this._allRooms.filter((e) => this._rooms.includes(e.room_id)).map((e) => e.name);
		return h`<details class="multi">
      <summary>
        <span class=${e.length ? "" : "placeholder"}>
          ${e.length ? e.join(", ") : "— Aucune pièce —"}
        </span>
        ▾
      </summary>
      <div class="options">
        ${this._allRooms.map((e) => h`<label>
            ${j(this._rooms.includes(e.room_id), () => this._toggleRoom(e.room_id))}
            ${e.name}
          </label>`)}
      </div>
    </details>`;
	}
	render() {
		let e = !!this.sw, t = this._preset(), n = this._allRooms.filter((e) => this._rooms.includes(e.room_id) && e.area_id).map((e) => e.area_id), { inArea: r, others: i } = Gr(this._devices, (e) => Wr(this.hass, e.device_id), n), a = (e) => ({
			value: e.device_id,
			label: e.name,
			secondary: e.model_label
		});
		return h`
      ${A("Nom", this._name, (e) => this._onName(e), "Interrupteur chevet")}
      ${e ? h`<div class="section">Id : ${this.sw.id}</div>` : ""}

      <div class="section">Interrupteur (appareil)</div>
      ${this._devices.length ? h`<homex-select
            placeholder="Choisir un interrupteur…"
            .value=${this._deviceId}
            .options=${n.length ? [] : this._devices.map(a)}
            .groups=${n.length ? [...r.length ? [{
			label: `Pièce : ${Kr(this.hass, n)}`,
			options: r.map(a)
		}] : [], {
			label: "Autres",
			options: i.map(a)
		}] : []}
            @value-changed=${(e) => this._onDevice(e.detail.value)}
          ></homex-select>` : h`<p class="hint">
            Aucun interrupteur détecté (appareil exposant des actions).
          </p>`}

      ${this._deviceId ? this._renderPreset(t) : ""}

      <div class="section">Pièces Homex assignées (0..n)</div>
      ${this._renderRooms()}

      <div class="actions">
        ${e ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>` : ""}
        <button @click=${this._close}>Annuler</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._save}>
          ${e ? "Enregistrer" : "Créer le switch"}
        </button>
      </div>
    `;
	}
}, W = (pi.styles = [D, o`
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
    `], pi);
O([b({ attribute: !1 })], W.prototype, "hass", void 0), O([b({ attribute: !1 })], W.prototype, "sw", void 0), O([b({ attribute: !1 })], W.prototype, "presets", void 0), O([b({ attribute: !1 })], W.prototype, "initialRooms", void 0), O([b({ attribute: !1 })], W.prototype, "draft", void 0), O([x()], W.prototype, "_name", void 0), O([x()], W.prototype, "_id", void 0), O([x()], W.prototype, "_deviceId", void 0), O([x()], W.prototype, "_presetId", void 0), O([x()], W.prototype, "_devices", void 0), O([x()], W.prototype, "_rooms", void 0), O([x()], W.prototype, "_allRooms", void 0), O([x()], W.prototype, "_busy", void 0), W = O([y("homex-gswitch-editor")], W);
// src/components/homex-switch-manager.ts
var mi, hi = [
	"switches",
	"presets",
	"layouts"
], G = (mi = class extends v {
	constructor(...e) {
		super(...e), this.base = "", this.subpath = "", this._addRooms = [], this._layouts = [], this._presets = [], this._gswitches = [], this._loaded = !1, this._prefillDevice = "", this._switchFlowFrom = null, this._switchDraft = null;
	}
	connectedCallback() {
		super.connectedCallback(), this._load();
	}
	get _route() {
		let [e, t, n] = zn(this.subpath);
		return {
			section: hi.includes(e) ? e : "switches",
			editing: t === "new" || t === "edit" && !!n,
			id: t === "edit" ? n : void 0
		};
	}
	get _section() {
		return this._route.section;
	}
	_url(e, ...t) {
		return e === "switches" && !t.length ? this.base : w(this.base, e, ...t);
	}
	_openEditor(e, t) {
		T(this._url(e, ...t ? ["edit", t] : ["new"]));
	}
	willUpdate(e) {
		if (!e.has("subpath")) return;
		let { section: t, editing: n, id: r } = this._route;
		if (!n) this._switchDraft = null, this._switchFlowFrom = null;
		else if (t === "switches" && !r && !this._switchDraft) {
			let e = new URLSearchParams(location.search).get("room");
			this._addRooms = e ? [e] : [];
		}
	}
	async _load() {
		try {
			[this._layouts, this._presets, this._gswitches] = await Promise.all([
				Rt(this.hass),
				Wt(this.hass),
				Vt(this.hass)
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
		this._load(), E(this._url("layouts"));
	}
	_onPresetClosed(e) {
		this._prefillDevice = "", this._load();
		let t = this._switchFlowFrom;
		if (t) {
			let n = e?.detail?.preset_id;
			n && this._switchDraft && (this._switchDraft = {
				...this._switchDraft,
				preset_id: n
			}), this._switchFlowFrom = null, E(t);
		} else E(this._url("presets"));
	}
	_onSwitchClosed() {
		this._switchDraft = null, this._load(), E(this._url("switches"));
	}
	_onCreatePreset(e) {
		this._switchDraft = e.detail.draft ?? null, this._prefillDevice = e.detail.device_id || "", this._switchFlowFrom = location.pathname, this._openEditor("presets");
	}
	_add() {
		this._prefillDevice = "", this._switchDraft = null, this._addRooms = [], this._openEditor(this._section);
	}
	_preview(e) {
		let t = e.bounds, n = `clip-${e.id}`, r = e.shape === "round", i = r ? g`<ellipse cx=${t.x + t.w / 2} cy=${t.y + t.h / 2} rx=${t.w / 2} ry=${t.h / 2}></ellipse>` : g`<rect x=${t.x} y=${t.y} width=${t.w} height=${t.h} rx="0.4"></rect>`, a = r ? g`<ellipse class="sh" cx=${t.x + t.w / 2} cy=${t.y + t.h / 2} rx=${t.w / 2} ry=${t.h / 2}></ellipse>` : g`<rect class="sh" x=${t.x} y=${t.y} width=${t.w} height=${t.h} rx="0.4"></rect>`;
		return h`<svg class="preview" viewBox="-10 -10 20 20">
      <defs><clipPath id=${n}>${i}</clipPath></defs>
      ${(e.zones || []).map((e) => g`<rect class="zn" x=${e.x} y=${e.y} width=${e.w} height=${e.h}
          clip-path="url(#${n})"></rect>`)}
      ${a}
      ${(e.positions || []).map((e) => g`<circle class="zn" cx=${e.x} cy=${e.y} r="1.3"></circle>
          <text x=${e.x} y=${e.y}>${e.n}</text>`)}
    </svg>`;
	}
	_editTarget(e, t, n) {
		let r = this._route.id;
		if (!r) return { item: null };
		let i = e.find((e) => e.id === r);
		return i ? { item: i } : { page: h`
        <div class="head">
          <button @click=${t}>← ${n}</button>
          <h2></h2>
        </div>
        <div class="msg">
          ${this._loaded ? `« ${r} » introuvable.` : "Chargement…"}
        </div>
      ` };
	}
	render() {
		let { section: e, editing: t } = this._route;
		if (t && e === "layouts") {
			let e = () => this._onLayoutClosed(), t = this._editTarget(this._layouts, e, "Layouts");
			return "page" in t ? t.page : h`
        <div class="head">
          <button @click=${e}>← Layouts</button>
          <h2>${t.item ? "Modifier le layout" : "Nouveau layout"}</h2>
        </div>
        <homex-layout-editor
          .hass=${this.hass}
          .layout=${t.item}
          @layout-closed=${this._onLayoutClosed}
        ></homex-layout-editor>
      `;
		}
		if (t && e === "presets") {
			let e = () => this._onPresetClosed(), t = this._editTarget(this._presets, e, "Presets");
			return "page" in t ? t.page : h`
        <div class="head">
          <button @click=${e}>← Presets</button>
          <h2>${t.item ? "Modifier le preset" : "Nouveau device preset"}</h2>
        </div>
        <div class="editor">
          <homex-preset-editor
            .hass=${this.hass}
            .preset=${t.item}
            .layouts=${this._layouts}
            .prefillDevice=${this._prefillDevice}
            @preset-closed=${this._onPresetClosed}
          ></homex-preset-editor>
        </div>
      `;
		}
		if (t) {
			let e = () => this._onSwitchClosed(), t = this._editTarget(this._gswitches, e, "Switches");
			return "page" in t ? t.page : h`
        <div class="head">
          <button @click=${e}>← Switches</button>
          <h2>${t.item ? "Modifier le switch" : "Nouveau switch"}</h2>
        </div>
        <div class="editor">
          <homex-gswitch-editor
            .hass=${this.hass}
            .sw=${t.item}
            .presets=${this._presets}
            .initialRooms=${this._addRooms}
            .draft=${this._switchDraft}
            @switch-closed=${this._onSwitchClosed}
            @create-preset=${this._onCreatePreset}
          ></homex-gswitch-editor>
        </div>
      `;
		}
		let n = this._section === "layouts" ? "＋ Layout" : this._section === "presets" ? "＋ Preset" : "＋ Switch";
		return h`
      <div class="head">
        <button @click=${this._back}>← Homex</button>
        <h2>Switch Manager</h2>
        <button class="primary" @click=${this._add}>${n}</button>
      </div>
      <div class="tabs">
        ${[
			["switches", "Switches"],
			["presets", "Presets"],
			["layouts", "Layouts"]
		].map(([e, t]) => h`<span
            class="tab ${this._section === e ? "active" : ""}"
            @click=${() => {
			e !== this._section && T(this._url(e), !0);
		}}
            >${t}</span
          >`)}
      </div>
      ${this._loaded ? this._section === "layouts" ? this._renderLayouts() : this._section === "presets" ? this._renderPresets() : this._renderSwitches() : h`<div class="msg">Chargement…</div>`}
    `;
	}
	_renderLayouts() {
		return this._layouts.length ? h`<div class="grid">
      ${this._layouts.map((e) => h`<div
          class="card"
          @click=${() => this._openEditor("layouts", e.id)}
        >
          ${this._preview(e)}
          <div class="info">
            <div class="name">${e.name}</div>
            <div class="meta">${e.buttons} bouton(s) · ${e.shape}</div>
          </div>
        </div>`)}
    </div>` : h`<div class="msg">Aucun layout. Clique sur « ＋ Layout ».</div>`;
	}
	_renderPresets() {
		return this._presets.length ? h`<div class="grid">
      ${this._presets.map((e) => {
			let t = this._layouts.find((t) => t.id === e.layout_id);
			return h`<div
          class="card"
          @click=${() => {
				this._prefillDevice = "", this._openEditor("presets", e.id);
			}}
        >
          ${t ? this._preview(t) : h`<div class="icon">🎚</div>`}
          <div class="info">
            <div class="name">${e.name}</div>
            <div class="meta">${e.model_label}</div>
          </div>
        </div>`;
		})}
    </div>` : h`<div class="msg">
        Aucun preset. Clique sur « ＋ Preset » pour définir le mapping standard
        d'un modèle d'appareil.
      </div>`;
	}
	_renderSwitches() {
		return this._gswitches.length ? h`<div class="grid">
      ${this._gswitches.map((e) => {
			let t = Wn(this.hass, this._presets, e), n = t ? this._layouts.find((e) => e.id === t.layout_id) : void 0;
			return h`<div
          class="card"
          @click=${() => this._openEditor("switches", e.id)}
        >
          ${n ? this._preview(n) : h`<div class="icon">🎛</div>`}
          <div class="info">
            <div class="name">${e.name}</div>
            <div class="meta">
              ${t ? t.name : "aucun preset"} ·
              ${(e.rooms || []).length} pièce(s)
            </div>
          </div>
        </div>`;
		})}
    </div>` : h`<div class="msg">Aucun switch. Clique sur « ＋ Switch ».</div>`;
	}
}, mi.styles = [D, o`
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
    `], mi);
O([b({ attribute: !1 })], G.prototype, "hass", void 0), O([b({ attribute: !1 })], G.prototype, "base", void 0), O([b({ attribute: !1 })], G.prototype, "subpath", void 0), O([x()], G.prototype, "_addRooms", void 0), O([x()], G.prototype, "_layouts", void 0), O([x()], G.prototype, "_presets", void 0), O([x()], G.prototype, "_gswitches", void 0), O([x()], G.prototype, "_loaded", void 0), O([x()], G.prototype, "_prefillDevice", void 0), O([x()], G.prototype, "_switchDraft", void 0), G = O([y("homex-switch-manager")], G);
// src/components/homex-shutter-preset-editor.ts
var gi = class extends v {
	constructor(...e) {
		super(...e), this.preset = null, this._name = "", this._nameTyped = !1, this._id = "", this._models = [], this._modelKey = "", this._deviceId = "", this._smart = !1, this._up = { ...K.EMPTY }, this._down = { ...K.EMPTY }, this._stopped = { ...K.EMPTY }, this._z2m = null, this._busy = !1, this._idEdited = !1;
	}
	_cond(e) {
		let t = Array.isArray(e) ? e[0] : e;
		if (!t) return { ...K.EMPTY };
		if (t.source === "z2m") return {
			...K.EMPTY,
			source: "z2m",
			field: t.field ?? "",
			state: t.state ?? ""
		};
		if (t.suffix !== void 0 || t.domain !== void 0) return {
			...K.EMPTY,
			domain: t.domain ?? "",
			suffix: t.suffix ?? "",
			state: t.state ?? ""
		};
		let [n, r = ""] = String(t.entity_id ?? "").split("."), i = this._deviceSlug(), a = i && r.startsWith(i + "_") ? r.slice(i.length + 1) : r;
		return {
			...K.EMPTY,
			domain: n ?? "",
			suffix: a,
			state: t.state ?? ""
		};
	}
	_deviceSlug() {
		let e = this.hass.devices?.[this._deviceId];
		return M(e?.name_by_user || e?.name || "");
	}
	connectedCallback() {
		super.connectedCallback(), this._loadModels();
	}
	updated(e) {
		e.has("_deviceId") && this._loadZ2M();
	}
	async _loadZ2M() {
		let e = this._deviceId;
		if (this._z2m = null, e) try {
			let t = await Xt(this.hass, e);
			e === this._deviceId && (this._z2m = t);
		} catch {
			e === this._deviceId && (this._z2m = {
				available: !1,
				topic: null,
				fields: []
			});
		}
	}
	async _loadModels() {
		try {
			this._models = await Yt(this.hass);
		} catch {
			this._models = [];
		}
	}
	willUpdate(e) {
		if (e.has("preset")) {
			let e = this.preset;
			this._name = e?.name ?? "", this._nameTyped = !!e, this._id = e?.id ?? "", this._modelKey = e?.model ?? "", this._deviceId = e?.device_id ?? "", this._smart = e?.smart_toggle ?? !1, this._up = this._cond(e?.moving_up), this._down = this._cond(e?.moving_down), this._stopped = this._cond(e?.stopped), this._idEdited = !!e, this._busy = !1;
		}
	}
	_model() {
		return this._models.find((e) => e.model === this._modelKey);
	}
	_onModel(e) {
		this._modelKey = e;
		let t = this._model();
		this._deviceId = t?.devices[0]?.device_id ?? "", this._up = { ...K.EMPTY }, this._down = { ...K.EMPTY }, this._stopped = { ...K.EMPTY }, !t || this._name.trim() && this._nameTyped || (this._name = t.label, this._idEdited || (this._id = M(t.label)));
	}
	_onName(e) {
		this._name = e, this._nameTyped = !0, this._idEdited || (this._id = M(e));
	}
	_refSensors() {
		let e = this.hass.entities || {}, t = /* @__PURE__ */ new Set(["sensor", "binary_sensor"]), n = this._deviceSlug();
		return Object.values(e).filter((e) => e.device_id === this._deviceId && t.has(String(e.entity_id).split(".")[0])).map((e) => {
			let [t, r = ""] = String(e.entity_id).split("."), i = n && r.startsWith(n + "_") ? r.slice(n.length + 1) : r;
			return {
				domain: t,
				suffix: i,
				key: `${t}|${i}`,
				entity_id: e.entity_id
			};
		}).sort((e, t) => e.suffix.localeCompare(t.suffix));
	}
	_condEntityId(e) {
		if (!e.domain || !e.suffix) return "";
		let t = this._deviceSlug();
		return `${e.domain}.${t ? t + "_" : ""}${e.suffix}`;
	}
	_sensorValues(e) {
		let t = this.hass.states[e];
		if (!t) return [];
		let n = /* @__PURE__ */ new Set(), r = t.attributes?.options;
		return Array.isArray(r) && r.forEach((e) => n.add(String(e))), t.state && !["unknown", "unavailable"].includes(t.state) && n.add(t.state), [...n];
	}
	_z2mValue(e) {
		let t = this._z2m?.fields.find((t) => t.field === e);
		return t === void 0 || t.value === null ? "" : String(t.value);
	}
	_condEditor(e, t, n, r, i) {
		let a = `dl-${e}`, o = r.source === "z2m", s = !!this._z2m?.available, c, l;
		if (o) {
			let e = this._z2m?.fields ?? [], t = e.some((e) => e.field === r.field);
			c = e.length ? h`<homex-select
        placeholder="Champ Zigbee2MQTT…"
        .value=${r.field ?? ""}
        .options=${[...r.field && !t ? [{
				value: r.field,
				label: r.field
			}] : [], ...e.map((e) => ({
				value: e.field,
				label: e.field,
				tertiary: String(e.value)
			}))]}
        @value-changed=${(e) => i({
				...r,
				field: e.detail.value
			})}
      ></homex-select>` : h`<input
            class="field-name"
            placeholder="champ, ex. motor_run_status"
            .value=${r.field ?? ""}
            @change=${(e) => i({
				...r,
				field: e.target.value.trim()
			})}
          />`;
			let n = r.field ? this._z2mValue(r.field) : "";
			l = n ? [n] : [];
		} else c = h`<homex-select
        placeholder="Capteur…"
        .value=${r.domain && r.suffix ? `${r.domain}|${r.suffix}` : ""}
        .options=${this._refSensors().map((e) => ({
			value: e.key,
			label: e.suffix,
			secondary: e.entity_id
		}))}
        @value-changed=${(e) => {
			let [t = "", n = ""] = String(e.detail.value).split("|");
			i({
				...r,
				domain: t,
				suffix: n
			});
		}}
      ></homex-select>`, l = this._sensorValues(this._condEntityId(r));
		return h`<div class="cond">
      <div class="section">${t}</div>
      <p class="hint">${n}</p>
      ${s || o ? h`<div class="sources">
            <button
              class="src ${o ? "" : "on"}"
              @click=${() => i({
			...K.EMPTY,
			state: r.state
		})}
            >
              Capteur HA
            </button>
            <button
              class="src ${o ? "on" : ""}"
              ?disabled=${!s && !o}
              @click=${() => i({
			...K.EMPTY,
			source: "z2m",
			state: r.state
		})}
            >
              État Zigbee2MQTT
            </button>
          </div>` : ""}
      <div class="cond-row">
        ${c}
        <input
          placeholder="valeur"
          list=${a}
          .value=${r.state}
          @change=${(e) => i({
			...r,
			state: e.target.value
		})}
        />
        <datalist id=${a}>
          ${l.map((e) => h`<option value=${e}></option>`)}
        </datalist>
      </div>
      ${o && this._z2m?.available && !this._z2m.fields.length ? h`<p class="hint">
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
		let e = this._name.trim(), t = this._id.trim();
		if (!e || !t) {
			alert("Nom et id du preset requis.");
			return;
		}
		if (!this._modelKey || !this._deviceId) {
			alert("Choisis un modèle et un device de référence.");
			return;
		}
		let n = (e) => this._smart ? {
			...e,
			state: (e.state || "").trim().toLowerCase()
		} : { ...K.EMPTY };
		this._busy = !0;
		try {
			await Qt(this.hass, {
				id: t,
				name: e,
				model: this._modelKey,
				model_label: this._model()?.label ?? this._modelKey,
				device_id: this._deviceId,
				smart_toggle: this._smart,
				moving_up: n(this._up),
				moving_down: n(this._down),
				stopped: n(this._stopped)
			}), this._close();
		} catch (e) {
			this._busy = !1, alert("Erreur Homex : " + C(e));
		}
	}
	async _delete() {
		if (this.preset && confirm(`Supprimer le preset "${this.preset.name}" ?`)) {
			this._busy = !0;
			try {
				await $t(this.hass, this.preset.id), this._close();
			} catch (e) {
				this._busy = !1, alert("Erreur Homex : " + C(e));
			}
		}
	}
	render() {
		let e = !!this.preset, t = this._model();
		return h`
      ${A("Nom du preset", this._name, (e) => this._onName(e), "Volet salon")}
      ${e ? h`<div class="section">Id : ${this.preset.id}</div>` : ""}

      <div class="section">Modèle de volet</div>
      ${this._models.length ? h`<homex-select
            placeholder="Choisir un modèle…"
            .value=${this._modelKey}
            .options=${this._models.map((e) => ({
			value: e.model,
			label: e.label,
			tertiary: `${e.count} appareil(s)`
		}))}
            @value-changed=${(e) => this._onModel(e.detail.value)}
          ></homex-select>` : h`<p class="hint">Aucun volet (device avec entité cover) détecté.</p>`}

      ${t ? h`
            <div class="section">Device de référence</div>
            <p class="hint">Les capteurs/actions sont tirés de ce device.</p>
            <homex-select
              .value=${this._deviceId}
              .options=${t.devices.map((e) => ({
			value: e.device_id,
			label: e.name
		}))}
              @value-changed=${(e) => {
			this._deviceId = e.detail.value, this._up = { ...K.EMPTY }, this._down = { ...K.EMPTY }, this._stopped = { ...K.EMPTY };
		}}
            ></homex-select>

            <label class="toggle-row">
              <span>Implémenter la permutation intelligente</span>
              <span class="toggle ${this._smart ? "on" : ""}">
                <input
                  type="checkbox"
                  .checked=${this._smart}
                  @change=${(e) => this._smart = e.target.checked}
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
            ${this._smart ? h`
                  ${this._condEditor("up", "Montée (volet en mouvement vers le haut)", "Le volet est en train de monter quand ce capteur vaut :", this._up, (e) => this._up = e)}
                  ${this._condEditor("down", "Descente (volet en mouvement vers le bas)", "Le volet est en train de descendre quand ce capteur vaut :", this._down, (e) => this._down = e)}
                  ${this._condEditor("stopped", "Arrêt (volet à l'arrêt)", "Le volet est à l'arrêt quand ce capteur vaut :", this._stopped, (e) => this._stopped = e)}
                ` : ""}
          ` : ""}

      <div class="actions">
        ${e ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>` : ""}
        <button @click=${this._close}>Annuler</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._save}>
          ${e ? "Enregistrer" : "Créer le preset"}
        </button>
      </div>
    `;
	}
}, K = gi, q = (gi.EMPTY = {
	source: "entity",
	domain: "",
	suffix: "",
	field: "",
	state: ""
}, gi.styles = [D, o`
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
    `], gi);
O([b({ attribute: !1 })], q.prototype, "hass", void 0), O([b({ attribute: !1 })], q.prototype, "preset", void 0), O([x()], q.prototype, "_name", void 0), O([x()], q.prototype, "_id", void 0), O([x()], q.prototype, "_models", void 0), O([x()], q.prototype, "_modelKey", void 0), O([x()], q.prototype, "_deviceId", void 0), O([x()], q.prototype, "_smart", void 0), O([x()], q.prototype, "_up", void 0), O([x()], q.prototype, "_down", void 0), O([x()], q.prototype, "_stopped", void 0), O([x()], q.prototype, "_z2m", void 0), O([x()], q.prototype, "_busy", void 0), q = K = O([y("homex-shutter-preset-editor")], q);
// src/components/homex-shutter-manager.ts
var _i = class extends v {
	constructor(...e) {
		super(...e), this._presets = [], this._loaded = !1, this.base = "", this.subpath = "";
	}
	connectedCallback() {
		super.connectedCallback(), this._load();
	}
	async _load() {
		try {
			this._presets = await Zt(this.hass);
		} catch {
			this._presets = [];
		}
		this._loaded = !0;
	}
	_back() {
		this.dispatchEvent(new CustomEvent("close"));
	}
	_onClosed() {
		this._load(), E(this.base);
	}
	_openEditor(e) {
		T(w(this.base, ...e ? ["edit", e] : ["new"]));
	}
	render() {
		let [e, t] = zn(this.subpath);
		if (e === "new" || e === "edit" && t) {
			let e = t ? this._presets.find((e) => e.id === t) : null;
			return t && !e ? h`
          <div class="head">
            <button @click=${this._onClosed}>← Presets</button>
            <h2></h2>
          </div>
          <div class="msg">
            ${this._loaded ? `« ${t} » introuvable.` : "Chargement…"}
          </div>
        ` : h`
        <div class="head">
          <button @click=${this._onClosed}>← Presets</button>
          <h2>${e ? "Modifier le preset" : "Nouveau shutter device preset"}</h2>
        </div>
        <div class="editor">
          <homex-shutter-preset-editor
            .hass=${this.hass}
            .preset=${e ?? null}
            @shutter-preset-closed=${this._onClosed}
          ></homex-shutter-preset-editor>
        </div>
      `;
		}
		return h`
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
      ${this._loaded ? this._presets.length ? h`<div class="grid">
              ${this._presets.map((e) => h`<div
                  class="card"
                  @click=${() => this._openEditor(e.id)}
                >
                  <div class="icon">🪟</div>
                  <div class="info">
                    <div class="name">${e.name}</div>
                    <div class="meta">
                      ${e.model_label}${e.smart_toggle ? " · permutation intelligente" : ""}
                    </div>
                  </div>
                </div>`)}
            </div>` : h`<div class="msg">
              Aucun shutter device preset. Clique sur « ＋ Preset » pour définir
              le pilotage d'un modèle de volet.
            </div>` : h`<div class="msg">Chargement…</div>`}
    `;
	}
}, vi = (_i.styles = [D, o`
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
    `], _i);
O([b({ attribute: !1 })], vi.prototype, "hass", void 0), O([x()], vi.prototype, "_presets", void 0), O([x()], vi.prototype, "_loaded", void 0), O([b({ attribute: !1 })], vi.prototype, "base", void 0), O([b({ attribute: !1 })], vi.prototype, "subpath", void 0), vi = O([y("homex-shutter-manager")], vi);
// src/components/homex-heating-group-editor.ts
var yi, bi = "default", xi = 5, Si = 30, Ci = .5, wi = 12, Ti = (e) => Math.min(Si, Math.max(xi, Math.round(e / Ci) * Ci)), J = (yi = class extends v {
	constructor(...e) {
		super(...e), this.group = null, this.groups = [], this.presets = [], this.rooms = [], this._name = "", this._id = "", this._rooms = [], this._setpoints = {}, this._busy = !1, this._idEdited = !1;
	}
	willUpdate(e) {
		let t = !this.group && e.has("groups") && !Object.keys(this._setpoints).length;
		if (e.has("group") || t) {
			let e = this.group, t = e?.setpoints ?? this.groups.find((e) => e.id === "default")?.setpoints ?? {};
			this._name = e?.name ?? "", this._id = e?.id ?? "", this._rooms = [...e?.rooms ?? []], this._setpoints = { ...t }, this._idEdited = !!e, this._busy = !1;
		}
	}
	get _isDefault() {
		return this.group?.id === bi;
	}
	_onName(e) {
		this._name = e, this._idEdited || (this._id = M(e));
	}
	_setTemp(e, t) {
		Number.isNaN(t) || (this._setpoints = {
			...this._setpoints,
			[e]: Ti(t)
		});
	}
	_toggleRoom(e) {
		this._rooms = this._rooms.includes(e) ? this._rooms.filter((t) => t !== e) : [...this._rooms, e];
	}
	_otherGroup(e) {
		return this.groups.find((t) => t.id !== this.group?.id && t.rooms.includes(e));
	}
	_stepper(e, t) {
		return h`<div class="stepper">
      <button
        title="−0,5 °C"
        @click=${() => this._setTemp(e, (t ?? 20) - Ci)}
      >
        <svg viewBox="0 0 24 24"><path d=${yt}></path></svg>
      </button>
      <input
        type="number"
        inputmode="decimal"
        min=${xi}
        max=${Si}
        step=${Ci}
        .value=${t == null ? "" : String(t)}
        placeholder="—"
        @change=${(t) => this._setTemp(e, parseFloat(t.target.value))}
      />
      <button
        title="+0,5 °C"
        @click=${() => this._setTemp(e, (t ?? 20) + Ci)}
      >
        <svg viewBox="0 0 24 24"><path d=${Ct}></path></svg>
      </button>
      <span class="unit">°C</span>
    </div>`;
	}
	_setUnheatedCut(e, t) {
		let { [e]: n, ...r } = this._setpoints;
		this._setpoints = t ? r : {
			...r,
			[e]: wi
		};
	}
	_close() {
		this.dispatchEvent(new CustomEvent("heating-group-closed"));
	}
	async _save() {
		this._busy = !0;
		try {
			await Cn(this.hass, {
				id: this._id,
				name: this._name.trim(),
				rooms: this._isDefault ? [] : this._rooms,
				setpoints: this._setpoints
			}, !this.group), this._close();
		} catch (e) {
			alert("Erreur Homex : " + C(e)), this._busy = !1;
		}
	}
	async _delete() {
		if (this.group && confirm(`Supprimer le setpoint « ${this.group.name} » ? Ses pièces repassent dans le setpoint par défaut.`)) {
			this._busy = !0;
			try {
				await wn(this.hass, this.group.id), this._close();
			} catch (e) {
				alert("Erreur Homex : " + C(e)), this._busy = !1;
			}
		}
	}
	render() {
		let e = !!this.group;
		return h`
      ${A("Nom", this._name, (e) => this._onName(e), "Chambres")}
      ${e ? h`<div class="section">Id : ${this.group.id}</div>` : A("Id", this._id, (e) => {
			this._idEdited = !0, this._id = M(e);
		})}

      <div class="section">Consignes de température</div>
      ${this.presets.map((e) => {
			let t = this._setpoints[e.id];
			if (e.unheated) {
				let n = t == null;
				return h`<div class="setpoint">
            <span class="label">${e.name}</span>
            <label class="cut">
              ${j(n, (t) => this._setUnheatedCut(e.id, t))}
              Chauffage coupé
            </label>
            ${n ? "" : this._stepper(e.id, t)}
          </div>`;
			}
			return h`<div class="setpoint">
          <span class="label">${e.name}</span>
          ${this._stepper(e.id, t)}
        </div>`;
		})}

      <div class="section">Pièces</div>
      ${this._isDefault ? h`<p class="hint">
            S'applique à toutes les pièces qui ne sont dans aucun autre setpoint.
          </p>` : h`<p class="hint">
              Une pièce n'appartient qu'à un setpoint : la cocher la retire de son
              setpoint actuel.
            </p>
            <div class="rooms">
              ${this.rooms.map((e) => {
			let t = this._otherGroup(e.room_id);
			return h`<label>
                  ${j(this._rooms.includes(e.room_id), () => this._toggleRoom(e.room_id))}
                  <span>
                    ${e.name}
                    ${t && !this._rooms.includes(e.room_id) ? h`<span class="other">· ${t.name}</span>` : ""}
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
        ${e && !this.group.builtin ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>` : ""}
      </div>
    `;
	}
}, yi.styles = [D, o`
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
    `], yi);
O([b({ attribute: !1 })], J.prototype, "hass", void 0), O([b({ attribute: !1 })], J.prototype, "group", void 0), O([b({ attribute: !1 })], J.prototype, "groups", void 0), O([b({ attribute: !1 })], J.prototype, "presets", void 0), O([b({ attribute: !1 })], J.prototype, "rooms", void 0), O([x()], J.prototype, "_name", void 0), O([x()], J.prototype, "_id", void 0), O([x()], J.prototype, "_rooms", void 0), O([x()], J.prototype, "_setpoints", void 0), O([x()], J.prototype, "_busy", void 0), J = O([y("homex-heating-group-editor")], J);
// src/components/homex-heating-device-preset-editor.ts
var Ei, Di = [
	{
		key: "tolerance",
		label: "Tolérance / précision",
		domains: ["number"],
		guess: /accuracy|precision|hysteresis|tolerance/
	},
	{
		key: "mode",
		label: "Mode",
		domains: ["climate", "select"],
		guess: /.*/
	},
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
], Oi = [["on", "Activé"], ["off", "Désactivé"]], ki = [["locked", "Verrouillé"], ["unlocked", "Déverrouillé"]], Ai = Object.fromEntries(Di.map((e) => [e.key, e.label])), Y = (Ei = class extends v {
	constructor(...e) {
		super(...e), this.preset = null, this._models = [], this._name = "", this._id = "", this._modelKey = "", this._deviceId = "", this._params = this._emptyParams(), this._busy = !1, this._results = null, this._idEdited = !1, this._nameTyped = !1, this._extInput = "", this._created = !1;
	}
	connectedCallback() {
		super.connectedCallback(), this._loadModels();
	}
	async _loadModels() {
		try {
			this._models = await Tn(this.hass);
		} catch {
			this._models = [];
		}
	}
	_emptyParams() {
		return Object.fromEntries(Di.map((e) => [e.key, {
			enabled: !1,
			entity: "",
			value: ""
		}]));
	}
	willUpdate(e) {
		if (e.has("preset")) {
			let e = this.preset;
			this._name = e?.name ?? "", this._nameTyped = !!e, this._id = e?.id ?? "", this._idEdited = !!e, this._modelKey = e?.model ?? "", this._deviceId = e?.device_id ?? "";
			let t = this._emptyParams();
			for (let n of Di) {
				let r = e?.params?.[n.key];
				r && (t[n.key] = {
					enabled: !0,
					entity: `${r.domain}|${r.suffix}`,
					value: String(r.value),
					valueAgressive: r.value_agressive == null ? "" : String(r.value_agressive)
				});
			}
			this._params = t, this._extInput = e?.external_input ? `number|${e.external_input.suffix}` : "", this._results = null, this._busy = !1, this._created = !1;
		}
	}
	_model() {
		return this._models.find((e) => e.model === this._modelKey);
	}
	_deviceSlug() {
		let e = this.hass.devices?.[this._deviceId];
		return M(e?.name_by_user || e?.name || "");
	}
	_refEntities(e) {
		let t = this._deviceSlug();
		return Object.values(this.hass.entities || {}).filter((t) => t.device_id === this._deviceId && e.includes(String(t.entity_id).split(".")[0])).map((e) => {
			let [n, r = ""] = String(e.entity_id).split("."), i = r === t ? "" : t && r.startsWith(t + "_") ? r.slice(t.length + 1) : r;
			return {
				domain: n,
				suffix: i,
				key: `${n}|${i}`,
				entity_id: e.entity_id
			};
		}).sort((e, t) => e.key.localeCompare(t.key));
	}
	_entityOf(e) {
		let t = e.split("|")[0];
		return this._refEntities([t]).find((t) => t.key === e);
	}
	_choices(e) {
		if (!e) return [];
		let t = this.hass.states[e.entity_id]?.attributes ?? {};
		switch (e.domain) {
			case "number": return null;
			case "select": return (t.options ?? []).map((e) => [e, e]);
			case "climate": return (t.hvac_modes ?? []).map((e) => [e, e]);
			case "switch": return Oi;
			case "lock": return ki;
			default: return [];
		}
	}
	_currentValue(e) {
		let t = e ? this.hass.states[e.entity_id] : void 0;
		return !t || t.state === "unknown" || t.state === "unavailable" ? "" : String(t.state);
	}
	_onModel(e) {
		this._modelKey = e;
		let t = this._model();
		this._deviceId = t?.devices[0]?.device_id ?? "", !t || this._name.trim() && this._nameTyped || (this._name = t.label, this._idEdited || (this._id = M(t.label))), this._suggestParams();
	}
	_onDevice(e) {
		this._deviceId = e, this._suggestParams();
	}
	_suggestParams() {
		let e = this._emptyParams();
		for (let t of Di) {
			let n = this._refEntities(t.domains).find((e) => t.guess.test(e.suffix));
			n && (e[t.key] = {
				enabled: !1,
				entity: n.key,
				value: this._currentValue(n)
			});
		}
		this._params = e, this._extInput = "";
	}
	_guessExtInput() {
		return this._refEntities(["number"]).find((e) => /external_temperature_input|capteur_de_temperature_externe|external.*temp/.test(e.suffix))?.key ?? "";
	}
	_setParam(e, t) {
		this._params = {
			...this._params,
			[e]: {
				...this._params[e],
				...t
			}
		};
	}
	_onParamEntity(e, t) {
		let n = this._entityOf(t);
		this._setParam(e, {
			entity: t,
			value: this._currentValue(n)
		});
	}
	_buildPreset() {
		let e = {};
		for (let t of Di) {
			let n = this._params[t.key];
			if (!n.enabled || !n.entity || n.value === "") continue;
			let [r, i] = n.entity.split("|");
			e[t.key] = {
				domain: r,
				suffix: i,
				value: r === "number" ? parseFloat(n.value) : n.value
			}, t.key === "tolerance" && n.valueAgressive && (e[t.key].value_agressive = parseFloat(n.valueAgressive));
		}
		return {
			id: this._id,
			name: this._name.trim(),
			model: this._modelKey,
			device_id: this._deviceId,
			params: e,
			external_input: e.sensor && this._extInput ? {
				domain: "number",
				suffix: this._extInput.split("|")[1]
			} : null
		};
	}
	_close() {
		this.dispatchEvent(new CustomEvent("heating-device-preset-closed"));
	}
	async _save() {
		this._busy = !0;
		try {
			this._results = await En(this.hass, this._buildPreset(), !this.preset && !this._created), this._created = !0;
		} catch (e) {
			alert("Erreur Homex : " + C(e));
		} finally {
			this._busy = !1;
		}
	}
	async _apply() {
		if (this.preset) {
			this._busy = !0;
			try {
				this._results = await On(this.hass, this.preset.id);
			} catch (e) {
				alert("Erreur Homex : " + C(e));
			} finally {
				this._busy = !1;
			}
		}
	}
	async _delete() {
		if (this.preset && confirm(`Supprimer le device preset « ${this.preset.name} » ?`)) {
			this._busy = !0;
			try {
				await Dn(this.hass, this.preset.id), this._close();
			} catch (e) {
				alert("Erreur Homex : " + C(e)), this._busy = !1;
			}
		}
	}
	_renderValue(e, t) {
		let n = this._entityOf(t.entity), r = this._choices(n);
		if (r === null) {
			let r = n && this.hass.states[n.entity_id]?.attributes || {};
			return h`<span class="value"
        ><input
          type="number"
          inputmode="decimal"
          min=${r.min ?? ""}
          max=${r.max ?? ""}
          step=${r.step ?? "any"}
          .value=${t.value}
          @change=${(t) => this._setParam(e, { value: t.target.value })}
      /></span>`;
		}
		return h`<homex-select
      placeholder="Choisir…"
      .value=${t.value}
      .options=${r.map(([e, t]) => ({
			value: e,
			label: t
		}))}
      @value-changed=${(t) => this._setParam(e, { value: t.detail.value })}
    ></homex-select>`;
	}
	_renderParam(e) {
		let t = this._params[e.key], n = this._refEntities(e.domains), r = this._entityOf(t.entity), i = this._currentValue(r);
		return h`<div class="param">
      <label class="param-head">
        ${j(t.enabled, (t) => this._setParam(e.key, { enabled: t }))}
        ${e.label}
      </label>
      ${t.enabled ? h`<div class="param-body">
            <label>
              Entité (${e.domains.join(" / ")})
              <homex-select
                placeholder="Choisir…"
                .value=${t.entity}
                .options=${n.map((e) => ({
			value: e.key,
			label: e.suffix || "(entité principale)",
			secondary: e.entity_id,
			tertiary: e.domain
		}))}
                @value-changed=${(t) => this._onParamEntity(e.key, t.detail.value)}
              ></homex-select>
            </label>
            ${e.key === "tolerance" ? this._renderToleranceValues(t, r, i) : h`<label>
                  Valeur à fixer
                  ${this._renderValue(e.key, t)}
                  ${r ? h`<span class="current">Actuel : ${i || "—"}</span>` : ""}
                </label>`}
            ${e.key === "sensor" ? this._renderExtInput() : ""}
          </div>` : ""}
    </div>`;
	}
	_renderToleranceValues(e, t, n) {
		let r = t && this.hass.states[t.entity_id]?.attributes || {}, i = (e, t) => h`<span class="value"
      ><input
        type="number"
        inputmode="decimal"
        min=${r.min ?? ""}
        max=${r.max ?? ""}
        step=${r.step ?? "any"}
        .value=${e}
        @change=${(e) => t(e.target.value)}
    /></span>`;
		return h`<div class="tolerances">
      <label>
        Mode normal
        ${i(e.value, (e) => this._setParam("tolerance", { value: e }))}
      </label>
      <label>
        Mode agressive
        ${i(e.valueAgressive ?? "", (e) => this._setParam("tolerance", { valueAgressive: e }))}
      </label>
      ${t ? h`<span class="current">
            Actuel : ${n || "—"} · appliqué selon select.homex_climate_tolerance_mode
          </span>` : ""}
    </div>`;
	}
	_renderExtInput() {
		let e = this._refEntities(["number"]);
		return h`<label class="wide">
      <span>
        ${j(!!this._extInput, (t) => this._extInput = t && (this._guessExtInput() || e[0]?.key) || "")}
        Capteur externe : la valeur choisie fait lire à la vanne une température externe
      </span>
      ${this._extInput ? h`<homex-select
              .value=${this._extInput}
              .options=${e.map((e) => ({
			value: e.key,
			label: e.suffix,
			secondary: e.entity_id
		}))}
              @value-changed=${(e) => this._extInput = e.detail.value}
            ></homex-select>
            <span class="current">
              Entrée de température externe : le capteur choisi pour chaque radiateur
              (dans la pièce) y est recopié à chaque mise à jour.
            </span>` : ""}
    </label>`;
	}
	_renderResults() {
		let e = this._results;
		return e.length ? h`<div class="results">
      <strong>Appliqué sur ${e.length} appareil(s)</strong>
      ${e.map((e) => h`<div class="dev">
          ${e.failed.length ? h`<span class="ko">✗</span>` : h`<span class="ok">✓</span>`}
          ${e.name}
          ${e.applied.length ? h` · ${e.applied.map((e) => Ai[e]).join(", ")}` : ""}
          ${e.failed.map((e) => h`<div class="ko">${Ai[e.param]} : ${e.error}</div>`)}
        </div>`)}
    </div>` : h`<div class="results">Aucun appareil de ce modèle trouvé.</div>`;
	}
	render() {
		let e = !!this.preset, t = this._model(), n = Di.some((e) => {
			let t = this._params[e.key];
			return t.enabled && t.entity && t.value !== "";
		});
		return h`
      ${A("Nom", this._name, (e) => {
			this._name = e, this._nameTyped = !0, this._idEdited || (this._id = M(e));
		}, "Vanne thermostatique")}
      ${e || this._created ? h`<div class="section">Id : ${this._id}</div>` : A("Id", this._id, (e) => {
			this._idEdited = !0, this._id = M(e);
		})}

      <div class="section">Modèle de thermostat</div>
      <homex-select
        placeholder="Choisir un modèle…"
        .value=${this._modelKey}
        .options=${this._models.map((e) => ({
			value: e.model,
			label: e.label,
			tertiary: `${e.count} appareil(s)`
		}))}
        @value-changed=${(e) => this._onModel(e.detail.value)}
      ></homex-select>

      ${t ? h`
            <div class="section">Appareil de référence</div>
            <p class="hint">
              Ses entités servent à choisir les réglages ; ils s'appliquent ensuite
              aux ${t.count} appareil(s) du modèle.
            </p>
            <homex-select
              .value=${this._deviceId}
              .options=${t.devices.map((e) => ({
			value: e.device_id,
			label: e.name
		}))}
              @value-changed=${(e) => this._onDevice(e.detail.value)}
            ></homex-select>

            <div class="section">Réglages à fixer</div>
            ${Di.map((e) => this._renderParam(e))}
          ` : this._modelKey ? h`<p class="hint">Modèle introuvable (plus aucun appareil ?).</p>` : ""}

      ${this._results ? this._renderResults() : ""}

      <div class="actions">
        <button
          class="primary"
          ?disabled=${this._busy || !this._name.trim() || !this._id || !t || !n}
          @click=${this._save}
        >
          ${this._busy ? "Application…" : "Enregistrer et appliquer"}
        </button>
        ${e ? h`<button ?disabled=${this._busy} @click=${this._apply}>
              Appliquer maintenant
            </button>` : ""}
        <button ?disabled=${this._busy} @click=${this._close}>
          ${this._results ? "Terminé" : "Annuler"}
        </button>
        ${e ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>` : ""}
      </div>
    `;
	}
}, Ei.styles = [D, o`
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
    `], Ei);
O([b({ attribute: !1 })], Y.prototype, "hass", void 0), O([b({ attribute: !1 })], Y.prototype, "preset", void 0), O([x()], Y.prototype, "_models", void 0), O([x()], Y.prototype, "_name", void 0), O([x()], Y.prototype, "_id", void 0), O([x()], Y.prototype, "_modelKey", void 0), O([x()], Y.prototype, "_deviceId", void 0), O([x()], Y.prototype, "_params", void 0), O([x()], Y.prototype, "_busy", void 0), O([x()], Y.prototype, "_results", void 0), O([x()], Y.prototype, "_extInput", void 0), Y = O([y("homex-heating-device-preset-editor")], Y);
// src/components/homex-heating-zone-editor.ts
var ji, Mi = "default", X = (ji = class extends v {
	constructor(...e) {
		super(...e), this.zone = null, this.zones = [], this.modes = [], this.rooms = [], this._name = "", this._id = "", this._rooms = [], this._triggers = {}, this._busy = !1, this._idEdited = !1;
	}
	willUpdate(e) {
		if (e.has("zone")) {
			let e = this.zone;
			this._name = e?.name ?? "", this._id = e?.id ?? "", this._rooms = [...e?.rooms ?? []], this._triggers = { ...e?.triggers ?? {} }, this._idEdited = !!e, this._busy = !1;
		}
	}
	get _isDefault() {
		return this.zone?.id === Mi;
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
			await kn(this.hass, {
				id: this._id,
				name: this._name.trim(),
				rooms: this._isDefault ? [] : this._rooms,
				triggers: this._triggers
			}, !this.zone), this._close();
		} catch (e) {
			alert("Erreur Homex : " + C(e)), this._busy = !1;
		}
	}
	async _delete() {
		if (this.zone && confirm(`Supprimer la zone « ${this.zone.name} » ? Ses pièces repassent dans la zone par défaut.`)) {
			this._busy = !0;
			try {
				await An(this.hass, this.zone.id), this._close();
			} catch (e) {
				alert("Erreur Homex : " + C(e)), this._busy = !1;
			}
		}
	}
	render() {
		let e = !!this.zone;
		return h`
      ${A("Nom", this._name, (e) => {
			this._name = e, this._idEdited || (this._id = M(e));
		}, "Studio")}
      ${e ? h`<div class="section">Id : ${this.zone.id}</div>` : A("Id", this._id, (e) => {
			this._idEdited = !0, this._id = M(e);
		})}
      ${this._id ? h`<p class="hint">
            Entité de commande : <code>select.homex_heating_${this._id}</code>
          </p>` : ""}

      <div class="section">Pièces</div>
      ${this._isDefault ? h`<p class="hint">
            Contient toutes les pièces qui ne sont dans aucune autre zone.
          </p>` : h`<p class="hint">
              Une pièce n'appartient qu'à une zone : la cocher la retire de sa zone
              actuelle.
            </p>
            <div class="rooms">
              ${this.rooms.map((e) => {
			let t = this._otherZone(e.room_id);
			return h`<label>
                  ${j(this._rooms.includes(e.room_id), () => this._toggleRoom(e.room_id))}
                  <span>
                    ${e.name}
                    ${t && !this._rooms.includes(e.room_id) ? h`<span class="other">· ${t.name}</span>` : ""}
                  </span>
                </label>`;
		})}
            </div>`}

      <div class="section">Déclencheurs par mode</div>
      <p class="hint">
        Chaque déclencheur passe la zone dans le mode correspondant. Les boutons
        d'interrupteurs se configurent aussi dans le Switch Manager (module 🔥 Climate).
      </p>
      ${this.modes.map((e) => {
			let t = this._triggers[e.id] ?? [];
			return h`<details class="mode" ?open=${t.length > 0}>
          <summary>
            ${e.name}
            <span class="count">· ${t.length} déclencheur(s)</span>
          </summary>
          <homex-trigger-selector
            .hass=${this.hass}
            .value=${t}
            @value-changed=${(t) => this._triggers = {
				...this._triggers,
				[e.id]: t.detail.value
			}}
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
        ${e && !this.zone.builtin ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>` : ""}
      </div>
    `;
	}
}, ji.styles = [D, o`
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
    `], ji);
O([b({ attribute: !1 })], X.prototype, "hass", void 0), O([b({ attribute: !1 })], X.prototype, "zone", void 0), O([b({ attribute: !1 })], X.prototype, "zones", void 0), O([b({ attribute: !1 })], X.prototype, "modes", void 0), O([b({ attribute: !1 })], X.prototype, "rooms", void 0), O([x()], X.prototype, "_name", void 0), O([x()], X.prototype, "_id", void 0), O([x()], X.prototype, "_rooms", void 0), O([x()], X.prototype, "_triggers", void 0), O([x()], X.prototype, "_busy", void 0), X = O([y("homex-heating-zone-editor")], X);
// src/components/homex-heating-system-editor.ts
var Ni, Pi = "global", Fi = ["switch", "input_boolean"], Ii = ["input_number", "number"], Li = [
	["setpoint_sensor", "Température de consigne"],
	["tank_sensor", "Température ballon"],
	["flow_sensor", "Température départ"],
	["return_sensor", "Température retour"]
], Ri = {
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
}, zi = { delta: "setpoint_tank" }, Bi = [["boiler", "Boiler"], ["buffer_tank", "Buffer Tank"]], Z = (Ni = class extends v {
	constructor(...e) {
		super(...e), this.system = null, this.zones = [], this._sysName = "", this._id = "", this._type = "boiler", this._contact = "", this._zones = [Pi], this._aggressive = !1, this._tank = {
			setpoint_sensor: "",
			tank_sensor: "",
			flow_sensor: "",
			return_sensor: ""
		}, this._circulator = "", this._minRuntime = "5", this._rules = [], this._busy = !1, this._idEdited = !1;
	}
	willUpdate(e) {
		if (e.has("system")) {
			let e = this.system;
			this._sysName = e?.name ?? "", this._id = e?.id ?? "", this._type = e?.type ?? "boiler", this._contact = e?.contact ?? "", this._zones = [...e?.zones?.length ? e.zones : [Pi]], this._aggressive = e?.aggressive ?? !1, this._tank = {
				setpoint_sensor: e?.setpoint_sensor ?? "",
				tank_sensor: e?.tank_sensor ?? "",
				flow_sensor: e?.flow_sensor ?? "",
				return_sensor: e?.return_sensor ?? ""
			}, this._circulator = e?.circulator ?? "", this._minRuntime = String(e?.min_runtime ?? 5), this._rules = (e?.rules ?? []).map((e) => ({
				type: zi[e.type] ?? e.type,
				delta: String(e.delta),
				tolerance: String(e.tolerance)
			})), this._idEdited = !!e, this._busy = !1;
		}
	}
	get _contacts() {
		let e = (e) => this.hass.states[e]?.attributes?.friendly_name || e;
		return Object.keys(this.hass.states).filter((e) => Fi.includes(e.split(".")[0])).sort((t, n) => e(t).localeCompare(e(n)));
	}
	_name(e) {
		return this.hass.states[e]?.attributes?.friendly_name || e;
	}
	_grouped(e) {
		let t = /* @__PURE__ */ new Map();
		for (let n of e) {
			let e = this.hass.entities?.[n], r = e?.area_id || e?.device_id && this.hass.devices?.[e.device_id]?.area_id || "";
			t.set(r, [...t.get(r) ?? [], n]);
		}
		let n = (e) => e ? this.hass.areas?.[e]?.name ?? e : "Sans pièce";
		return [...t.entries()].sort(([e], [t]) => e ? t ? n(e).localeCompare(n(t)) : -1 : 1).map(([e, t]) => ({
			label: n(e),
			options: t.sort((e, t) => this._name(e).localeCompare(this._name(t))).map((e) => {
				let t = this.hass.states[e], n = t?.attributes?.unit_of_measurement ?? "";
				return {
					value: e,
					label: this._name(e),
					secondary: e,
					tertiary: t ? `${t.state}${n ? " " + n : ""}` : void 0
				};
			})
		}));
	}
	_tempSensors(e) {
		return Object.keys(this.hass.states).filter((t) => {
			let n = t.split(".")[0], r = this.hass.states[t].attributes ?? {};
			return e && Ii.includes(n) ? !0 : n === "sensor" && (r.device_class === "temperature" || ["°C", "°F"].includes(r.unit_of_measurement));
		});
	}
	_value(e) {
		let t = parseFloat(this.hass.states[e]?.state ?? "");
		return Number.isNaN(t) ? null : t;
	}
	_ruleError(e) {
		let t = parseFloat(e.delta), n = parseFloat(e.tolerance);
		return Number.isNaN(t) || Number.isNaN(n) ? "Delta et tolérance requis." : t <= 0 || n < 0 || n >= t ? "Il faut delta > tolérance ≥ 0." : "";
	}
	get _required() {
		return new Set(this._rules.flatMap((e) => Ri[e.type].gap));
	}
	get _tankValid() {
		return [...this._required].every((e) => !!this._tank[e]) && !!this._circulator && !Number.isNaN(parseFloat(this._minRuntime)) && this._rules.every((e) => !this._ruleError(e));
	}
	_toggleZone(e) {
		let t = this._zones.filter((e) => e !== Pi), n = t.includes(e) ? t.filter((t) => t !== e) : [...t, e];
		this._zones = n.length ? n : [Pi];
	}
	_close() {
		this.dispatchEvent(new CustomEvent("heating-system-closed"));
	}
	async _save() {
		this._busy = !0;
		let e = {
			id: this._id,
			name: this._sysName.trim(),
			type: this._type
		}, t = this._type === "buffer_tank" ? {
			...e,
			...this._tank,
			circulator: this._circulator,
			min_runtime: parseFloat(this._minRuntime) || 0,
			zones: this._zones,
			aggressive: this._aggressive,
			rules: this._rules.map((e) => ({
				type: e.type,
				delta: parseFloat(e.delta),
				tolerance: parseFloat(e.tolerance)
			}))
		} : {
			...e,
			contact: this._type === "boiler" ? this._contact : "",
			zones: this._zones,
			aggressive: this._type === "boiler" && this._aggressive
		};
		try {
			await Pn(this.hass, t, !this.system), this._close();
		} catch (e) {
			alert("Erreur Homex : " + C(e)), this._busy = !1;
		}
	}
	async _delete() {
		if (this.system && confirm(`Supprimer le système « ${this.system.name} » ?`)) {
			this._busy = !0;
			try {
				await Fn(this.hass, this.system.id), this._close();
			} catch (e) {
				alert("Erreur Homex : " + C(e)), this._busy = !1;
			}
		}
	}
	_renderBoiler() {
		let e = (e) => this._name(e);
		return h`
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
        @value-changed=${(e) => this._contact = e.detail.value}
      ></homex-select>

      ${this._renderScope("contact sec")}
    `;
	}
	_renderScope(e) {
		let t = this._zones.includes(Pi);
		return h`
      <div class="section">Portée</div>
      <p class="hint">Les zones dont la demande de chauffe compte pour ce système.</p>
      <div class="checks">
        <label>
          ${j(t, () => this._zones = [Pi])}
          Système global (toutes les zones)
        </label>
        ${this.zones.map((e) => h`<label>
            ${j(!t && this._zones.includes(e.id), () => this._toggleZone(e.id))}
            Zone ${e.name}
          </label>`)}
      </div>

      <div class="section">Mode agressif</div>
      <div class="checks">
        <label>
          ${j(this._aggressive, (e) => this._aggressive = e)}
          Mode agressif : tolérance « agressive » sur la portée tant que le ${e} est
          actif
        </label>
      </div>
    `;
	}
	_num(e, t, n, r = "0.5") {
		return h`<label class="num">
      ${e}
      <input
        type="number"
        inputmode="decimal"
        step=${r}
        min="0"
        .value=${t}
        @input=${(e) => n(e.target.value)}
      />
    </label>`;
	}
	_setRule(e, t) {
		this._rules = this._rules.map((n, r) => r === e ? {
			...n,
			...t
		} : n);
	}
	_addRule(e) {
		if (this._rules.some((t) => t.type === e)) return;
		let [t, n] = Ri[e].init;
		this._rules = [...this._rules, {
			type: e,
			delta: t,
			tolerance: n
		}];
	}
	_renderRule(e, t) {
		let n = Ri[e.type], r = this._ruleError(e), i = (e) => `${Math.round(e * 10) / 10} °C`, [a, o] = n.gap, s = this._value(this._tank[a]), c = this._value(this._tank[o]), l = r;
		if (!r && e.type === "setpoint_tank") {
			let t = parseFloat(e.delta), n = parseFloat(e.tolerance);
			l = s == null ? `Circule quand ballon ≤ consigne − ${e.delta} °C ; s'arrête quand ballon > consigne − ${e.tolerance} °C.` : `Consigne ${i(s)} : circule quand ballon ≤ ${i(s - t)} ; s'arrête quand ballon > ${i(s - n)}.`;
		} else r || (l = `Circule quand départ − retour ≥ ${e.delta} °C ; s'arrête quand départ − retour < ${e.tolerance} °C.`);
		let u = !r && s != null && c != null ? ` Actuellement ${n.a} − ${n.b} = ${i(Math.max(0, s - c))}.` : "";
		return h`<div class="rule">
      <div class="title">Règle ${t + 1} · ${n.label}</div>
      ${this._num("Delta (°C)", e.delta, (e) => this._setRule(t, { delta: e }))}
      ${this._num("Tolérance (°C)", e.tolerance, (e) => this._setRule(t, { tolerance: e }))}
      <button
        title="Supprimer la règle"
        @click=${() => this._rules = this._rules.filter((e, n) => n !== t)}
      >
        ✕
      </button>
      <div class="explain ${r ? "err" : ""}">${l}${u}</div>
    </div>`;
	}
	_renderForce() {
		let e = this.system ? `switch.homex_system_${this.system.id}_force` : "", t = e ? this.hass.states[e] : void 0;
		return h`<div class="checks">
        <label>
          ${j(t?.state === "on", (t) => this.hass.callService("switch", t ? "turn_on" : "turn_off", { entity_id: e }), !t)}
          Forçage manuel
        </label>
      </div>
      <p class="hint">
        Tant qu'il est activé, le circulateur tourne quelles que soient les règles et la
        demande des radiateurs (si le chauffage est activé globalement).
        ${t ? h`Entité : <code>${e}</code> (s'applique immédiatement).` : "Disponible une fois le système enregistré."}
      </p>`;
	}
	_renderTank() {
		let e = this._grouped(this._tempSensors(!1)), t = this._grouped(this._tempSensors(!0)), n = this._grouped(this._contacts);
		return h`
      <div class="section">Capteurs</div>
      <div class="tank-grid">
        ${Li.map(([n, r]) => h`<homex-select
            label=${this._required.has(n) ? `${r} (requis)` : r}
            placeholder="Choisir un capteur…"
            .value=${this._tank[n]}
            .groups=${n === "setpoint_sensor" ? t : e}
            @value-changed=${(e) => this._tank = {
			...this._tank,
			[n]: e.detail.value
		}}
          ></homex-select>`)}
      </div>

      <div class="section">Circulateur</div>
      <div class="tank-grid">
        <homex-select
          label="Interrupteur commandé"
          placeholder="Choisir un interrupteur…"
          .value=${this._circulator}
          .groups=${n}
          @value-changed=${(e) => this._circulator = e.detail.value}
        ></homex-select>
        ${this._num("Temps d'exécution minimal (min)", this._minRuntime, (e) => this._minRuntime = e, "1")}
      </div>
      ${this._renderForce()}

      <div class="section">Règles de circulation</div>
      <p class="hint">
        Le circulateur tourne tant qu'au moins une règle le demande et qu'au moins un
        radiateur a besoin de chauffer (chauffage activé globalement). Une fois lancé,
        il tourne toujours au moins le temps d'exécution minimal, même si la
        température remonte vite ou si plus rien ne demande de chauffe.
      </p>
      ${this._rules.map((e, t) => this._renderRule(e, t))}
      <div class="rule-add">
        ${Object.keys(Ri).filter((e) => !this._rules.some((t) => t.type === e)).map((e) => h`<button @click=${() => this._addRule(e)}>＋ Règle ${Ri[e].label.toLowerCase()}</button>`)}
      </div>
    `;
	}
	render() {
		let e = !!this.system;
		return h`
      ${A("Nom", this._sysName, (e) => {
			this._sysName = e, this._idEdited || (this._id = M(e));
		}, "Chaudière")}
      ${e ? h`<div class="section">Id : ${this.system.id}</div>` : A("Id", this._id, (e) => {
			this._idEdited = !0, this._id = M(e);
		})}

      <div class="section">Type</div>
      <div class="btn-group">
        ${Bi.map(([e, t]) => h`<button
            class=${this._type === e ? "active" : ""}
            @click=${() => this._type = e}
          >
            ${t}
          </button>`)}
      </div>

      ${this._type === "boiler" ? this._renderBoiler() : this._type === "buffer_tank" ? h`${this._renderTank()}${this._renderScope("circulateur")}` : h`<p class="hint">
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
        ${e ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              Supprimer
            </button>` : ""}
      </div>
    `;
	}
}, Ni.styles = [D, o`
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
    `], Ni);
O([b({ attribute: !1 })], Z.prototype, "hass", void 0), O([b({ attribute: !1 })], Z.prototype, "system", void 0), O([b({ attribute: !1 })], Z.prototype, "zones", void 0), O([x()], Z.prototype, "_sysName", void 0), O([x()], Z.prototype, "_id", void 0), O([x()], Z.prototype, "_type", void 0), O([x()], Z.prototype, "_contact", void 0), O([x()], Z.prototype, "_zones", void 0), O([x()], Z.prototype, "_aggressive", void 0), O([x()], Z.prototype, "_tank", void 0), O([x()], Z.prototype, "_circulator", void 0), O([x()], Z.prototype, "_minRuntime", void 0), O([x()], Z.prototype, "_rules", void 0), O([x()], Z.prototype, "_busy", void 0), Z = O([y("homex-heating-system-editor")], Z);
// src/components/homex-heating-manager.ts
var Vi, Hi = [
	"modes",
	"setpoints",
	"zones",
	"devices",
	"systems"
], Ui = {
	modes: "Heating Modes",
	setpoints: "Setpoints",
	zones: "Zones",
	devices: "Device Presets",
	systems: "Heating System"
}, Wi = {
	modes: "＋ Mode",
	setpoints: "＋ Setpoint",
	zones: "＋ Zone",
	devices: "＋ Device preset",
	systems: "＋ Système"
}, Gi = {
	tolerance: "Tolérance",
	mode: "Mode",
	lock: "Verrouillage",
	sensor: "Capteur"
}, Ki = (e) => e == null ? "—" : `${e.toLocaleString("fr-FR")} °C`, Q = (Vi = class extends v {
	constructor(...e) {
		super(...e), this.base = "", this.subpath = "", this._presets = [], this._groups = [], this._devicePresets = [], this._zones = [], this._systems = [], this._enabledLocal = !0, this._switching = !1, this._rooms = [], this._loaded = !1, this._presetName = "", this._presetId = "", this._busy = !1, this._presetIdEdited = !1, this._formFor = null;
	}
	get _enabled() {
		let e = this.hass?.states["switch.homex_heating"];
		return e ? e.state === "on" : this._enabledLocal;
	}
	connectedCallback() {
		super.connectedCallback(), this._load();
	}
	async _load() {
		try {
			let [e, t] = await Promise.all([bn(this.hass), en(this.hass)]);
			this._presets = e.presets, this._groups = e.groups, this._devicePresets = e.device_presets ?? [], this._zones = e.zones ?? [], this._systems = e.systems ?? [], this._enabledLocal = e.enabled ?? !0, this._rooms = t;
		} catch {
			this._presets = [], this._groups = [], this._devicePresets = [], this._zones = [];
		}
		this._loaded = !0;
	}
	willUpdate() {
		let { section: e, editing: t, id: n } = this._route;
		if (t && e === "modes") {
			let e = n ? this._presets.find((e) => e.id === n) : null;
			(!n || e) && this._syncPresetForm(e ?? null);
		} else this._formFor = null;
	}
	get _route() {
		let [e, t, n] = zn(this.subpath);
		return {
			section: Hi.includes(e) ? e : "modes",
			editing: t === "new" || t === "edit" && !!n,
			id: t === "edit" ? n : void 0
		};
	}
	_url(e, ...t) {
		return e === "modes" && !t.length ? this.base : w(this.base, e, ...t);
	}
	_openEditor(e, t) {
		T(this._url(e, ...t ? ["edit", t] : ["new"]));
	}
	_closeEditor(e) {
		this._load(), E(this._url(e));
	}
	async _setEnabled(e) {
		this._switching = !0;
		try {
			await Nn(this.hass, e), this._enabledLocal = e;
		} catch (e) {
			alert("Erreur Homex : " + C(e));
		} finally {
			this._switching = !1;
		}
	}
	_back() {
		this.dispatchEvent(new CustomEvent("close"));
	}
	_syncPresetForm(e) {
		let t = e?.id ?? "__new__";
		this._formFor !== t && (this._formFor = t, this._presetName = e?.name ?? "", this._presetId = e?.id ?? "", this._presetIdEdited = !!e, this._busy = !1);
	}
	async _savePreset(e) {
		this._busy = !0;
		try {
			await xn(this.hass, {
				id: this._presetId,
				name: this._presetName.trim()
			}, !e), this._closeEditor("modes");
		} catch (e) {
			alert("Erreur Homex : " + C(e)), this._busy = !1;
		}
	}
	async _deletePreset(e) {
		if (confirm(`Supprimer le mode « ${e.name} » et ses consignes ?`)) {
			this._busy = !0;
			try {
				await Sn(this.hass, e.id), this._closeEditor("modes");
			} catch (e) {
				alert("Erreur Homex : " + C(e)), this._busy = !1;
			}
		}
	}
	_renderPresetEditor(e) {
		let t = () => this._closeEditor("modes");
		return h`
      <div class="head">
        <button @click=${t}>← Heating Modes</button>
        <h2>${e ? "Modifier le mode" : "Nouveau mode de chauffage"}</h2>
      </div>
      <div class="editor">
        ${A("Nom", this._presetName, (e) => {
			this._presetName = e, this._presetIdEdited || (this._presetId = M(e));
		}, "Vacances")}
        ${e ? h`<div class="section">Id : ${e.id}</div>` : A("Id", this._presetId, (e) => {
			this._presetIdEdited = !0, this._presetId = M(e);
		})}
        ${e?.builtin ? h`<p class="hint">Mode par défaut : il peut être renommé, pas supprimé.</p>` : ""}
        <div class="actions">
          <button
            class="primary"
            ?disabled=${this._busy || !this._presetName.trim() || !this._presetId}
            @click=${() => this._savePreset(e)}
          >
            Enregistrer
          </button>
          <button ?disabled=${this._busy} @click=${t}>Annuler</button>
          ${e && !e.builtin ? h`<button
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
		return h`<div class="grid">
      ${this._presets.map((e) => h`<div class="card" @click=${() => this._openEditor("modes", e.id)}>
          <div class="card-head">
            <div class="icon">🌡</div>
            <div>
              <div class="name">${e.name}</div>
              <div class="meta">
                ${e.id}${e.builtin ? " · par défaut" : ""}${e.unheated ? " · coupé ou consigne" : ""}
              </div>
            </div>
          </div>
        </div>`)}
    </div>`;
	}
	_roomNames(e, t = this._groups, n = bi) {
		if (e.id === n) {
			let e = new Set(t.flatMap((e) => e.rooms)), n = this._rooms.filter((t) => !e.has(t.room_id));
			return n.length ? `Autres pièces : ${n.map((e) => e.name).join(", ")}` : "Toutes les autres pièces (aucune pour l'instant)";
		}
		return e.rooms.length ? e.rooms.map((e) => this._rooms.find((t) => t.room_id === e)?.name ?? e).join(", ") : "Aucune pièce";
	}
	_renderGroups() {
		return h`<div class="grid">
      ${this._groups.map((e) => h`<div class="card" @click=${() => this._openEditor("setpoints", e.id)}>
          <div class="card-head">
            <div class="icon">🔥</div>
            <div>
              <div class="name">${e.name}</div>
              <div class="meta">${this._roomNames(e)}</div>
            </div>
          </div>
          <div class="temps">
            ${this._presets.map((t) => h`<span class="temp"
                >${t.name} ·
                ${t.unheated && e.setpoints[t.id] == null ? "coupé" : Ki(e.setpoints[t.id])}</span
              >`)}
          </div>
        </div>`)}
    </div>`;
	}
	async _setZoneMode(e, t) {
		try {
			await jn(this.hass, e.id, t), this._zones = this._zones.map((n) => n.id === e.id ? {
				...n,
				mode: t
			} : n);
		} catch (e) {
			alert("Erreur Homex : " + C(e));
		}
	}
	_renderZones() {
		return h`<div class="grid">
      ${this._zones.map((e) => {
			let t = Object.values(e.triggers ?? {}).reduce((e, t) => e + t.length, 0);
			return h`<div class="card" @click=${() => this._openEditor("zones", e.id)}>
          <div class="card-head">
            <div class="icon">🏠</div>
            <div>
              <div class="name">${e.name}</div>
              <div class="meta">
                ${this._roomNames(e, this._zones, Mi)}
              </div>
            </div>
          </div>
          <label class="zone-mode" @click=${(e) => e.stopPropagation()}>
            Mode actif
            <homex-select
              .value=${e.mode}
              .options=${this._presets.map((e) => ({
				value: e.id,
				label: e.name
			}))}
              @value-changed=${(t) => this._setZoneMode(e, t.detail.value)}
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
		if (!this._systems.length) return h`<div class="msg">
        Aucun système. Clique sur « ＋ Système » pour déclarer une chaudière (Boiler)
        ou un ballon tampon (Buffer Tank).
      </div>`;
		let e = (e) => e === "global" ? "Global" : this._zones.find((t) => t.id === e)?.name ?? e;
		return h`<div class="grid">
      ${this._systems.map((t) => {
			if (t.type === "buffer_tank") return this._renderTankCard(t);
			let n = t.contact ? this.hass.states[t.contact] : void 0;
			return h`<div class="card" @click=${() => this._openEditor("systems", t.id)}>
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
          ${t.type === "boiler" ? h`<div class="temps">
                <span class="temp">
                  Contact :
                  ${n?.attributes?.friendly_name ?? (t.contact || "—")}
                  ${n ? `(${n.state})` : ""}
                </span>
                ${t.aggressive ? h`<span class="temp">Agressif</span>` : ""}
              </div>` : ""}
        </div>`;
		})}
    </div>`;
	}
	_renderTankCard(e) {
		let t = (e) => e === "global" ? "Global" : this._zones.find((t) => t.id === e)?.name ?? e, n = (e) => {
			let t = e ? this.hass.states[e] : void 0, n = parseFloat(t?.state ?? "");
			return Number.isNaN(n) ? "—" : `${n} °C`;
		}, r = e.circulator ? this.hass.states[e.circulator] : void 0, i = e.rules ?? [];
		return h`<div class="card" @click=${() => this._openEditor("systems", e.id)}>
      <div class="card-head">
        <div class="icon">🛢️</div>
        <div>
          <div class="name">${e.name}</div>
          <div class="meta">
            Buffer Tank · ${(e.zones ?? ["global"]).map(t).join(", ")} ·
            ${i.length} règle(s) · min ${e.min_runtime ?? 0} min
          </div>
        </div>
      </div>
      <div class="temps">
        <span class="temp" title="Consigne">🎯 ${n(e.setpoint_sensor)}</span>
        ${e.tank_sensor ? h`<span class="temp" title="Ballon">🛢 ${n(e.tank_sensor)}</span>` : ""}
        ${e.flow_sensor ? h`<span class="temp" title="Départ">↗ ${n(e.flow_sensor)}</span>` : ""}
        <span class="temp" title="Retour">↘ ${n(e.return_sensor)}</span>
        ${e.aggressive ? h`<span class="temp">Agressif</span>` : ""}
        ${this.hass.states[`switch.homex_system_${e.id}_force`]?.state === "on" ? h`<span class="temp" title="Forçage manuel activé">Forcé</span>` : ""}
        ${(() => {
			let t = parseFloat(this.hass.states[`sensor.homex_system_${e.id}_runtime_today`]?.state ?? "");
			if (Number.isNaN(t)) return "";
			let n = Math.round(t);
			return h`<span class="temp" title="Durée d'activité du circulateur aujourd'hui">⏱ ${n >= 60 ? `${Math.floor(n / 60)} h ${String(n % 60).padStart(2, "0")}` : `${n} min`}</span>`;
		})()}
        <span class="temp" title=${r?.attributes?.friendly_name ?? e.circulator ?? ""}>
          Circulateur : ${r ? r.state === "on" ? "en marche" : r.state === "off" ? "arrêté" : r.state : "—"}
        </span>
      </div>
    </div>`;
	}
	_renderDevicePresets() {
		return this._devicePresets.length ? h`<div class="grid">
      ${this._devicePresets.map((e) => {
			let t = Object.entries(e.params ?? {});
			return h`<div class="card" @click=${() => this._openEditor("devices", e.id)}>
          <div class="card-head">
            <div class="icon">🎛</div>
            <div>
              <div class="name">${e.name}</div>
              <div class="meta">${e.model.replace("|", " ")}</div>
            </div>
          </div>
          <div class="temps">
            ${t.length ? t.map(([e, t]) => h`<span class="temp"
                      >${Gi[e] ?? e} ·
                      ${String(t.value)}${t.value_agressive == null ? "" : ` / ${t.value_agressive}`}</span
                    >`) : h`<span class="meta">Aucun réglage</span>`}
          </div>
        </div>`;
		})}
    </div>` : h`<div class="msg">
        Aucun device preset. Clique sur « ＋ Device preset » pour fixer les réglages
        d'un modèle de vanne thermostatique.
      </div>`;
	}
	_notFound(e, t) {
		return h`
      <div class="head">
        <button @click=${() => this._closeEditor(e)}>
          ← ${Ui[e]}
        </button>
        <h2></h2>
      </div>
      <div class="msg">${this._loaded ? `« ${t} » introuvable.` : "Chargement…"}</div>
    `;
	}
	render() {
		let { section: e, editing: t, id: n } = this._route;
		if (t && e === "modes") {
			let t = n ? this._presets.find((e) => e.id === n) : null;
			return n && !t ? this._notFound(e, n) : this._renderPresetEditor(t ?? null);
		}
		if (t && e === "systems") {
			let t = n ? this._systems.find((e) => e.id === n) : null;
			return n && !t ? this._notFound(e, n) : h`
        <div class="head">
          <button @click=${() => this._closeEditor("systems")}>← Heating System</button>
          <h2>${t ? "Modifier le système" : "Nouveau système de chauffage"}</h2>
        </div>
        <div class="editor">
          <homex-heating-system-editor
            .hass=${this.hass}
            .system=${t ?? null}
            .zones=${this._zones}
            @heating-system-closed=${() => this._closeEditor("systems")}
          ></homex-heating-system-editor>
        </div>
      `;
		}
		if (t && e === "zones") {
			let t = n ? this._zones.find((e) => e.id === n) : null;
			return n && !t ? this._notFound(e, n) : h`
        <div class="head">
          <button @click=${() => this._closeEditor("zones")}>← Zones</button>
          <h2>${t ? "Modifier la zone" : "Nouvelle zone"}</h2>
        </div>
        <div class="editor">
          <homex-heating-zone-editor
            .hass=${this.hass}
            .zone=${t ?? null}
            .zones=${this._zones}
            .modes=${this._presets}
            .rooms=${this._rooms}
            @heating-zone-closed=${() => this._closeEditor("zones")}
          ></homex-heating-zone-editor>
        </div>
      `;
		}
		if (t && e === "devices") {
			let t = n ? this._devicePresets.find((e) => e.id === n) : null;
			return n && !t ? this._notFound(e, n) : h`
        <div class="head">
          <button @click=${() => this._closeEditor("devices")}>← Device Presets</button>
          <h2>${t ? "Modifier le device preset" : "Nouveau device preset"}</h2>
        </div>
        <div class="editor">
          <homex-heating-device-preset-editor
            .hass=${this.hass}
            .preset=${t ?? null}
            @heating-device-preset-closed=${() => this._closeEditor("devices")}
          ></homex-heating-device-preset-editor>
        </div>
      `;
		}
		if (t) {
			let t = n ? this._groups.find((e) => e.id === n) : null;
			return n && !t ? this._notFound(e, n) : h`
        <div class="head">
          <button @click=${() => this._closeEditor("setpoints")}>← Setpoints</button>
          <h2>${t ? "Modifier le setpoint" : "Nouveau setpoint"}</h2>
        </div>
        <div class="editor">
          <homex-heating-group-editor
            .hass=${this.hass}
            .group=${t ?? null}
            .groups=${this._groups}
            .presets=${this._presets}
            .rooms=${this._rooms}
            @heating-group-closed=${() => this._closeEditor("setpoints")}
          ></homex-heating-group-editor>
        </div>
      `;
		}
		return h`
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
              @change=${(e) => this._setEnabled(e.target.checked)}
            />
            <span class="knob"></span>
          </span>
        </label>
      </div>
      <div class="tabs">
        ${Hi.map((e) => [e, Ui[e]]).map(([t, n]) => h`<span
            class="tab ${e === t ? "active" : ""}"
            @click=${() => {
			t !== e && T(this._url(t), !0);
		}}
            >${n}</span
          >`)}
      </div>
      <!-- Phones: too many tabs for one row, a section picker instead. -->
      <homex-select
        class="tab-picker"
        .value=${e}
        .options=${Hi.map((e) => ({
			value: e,
			label: Ui[e]
		}))}
        @value-changed=${(t) => {
			t.detail.value !== e && T(this._url(t.detail.value), !0);
		}}
      ></homex-select>
      <div class="tab-actions">
        <button class="primary" @click=${() => this._openEditor(e)}>
          ${Wi[e]}
        </button>
      </div>
      ${this._loaded ? e === "modes" ? this._renderPresets() : e === "setpoints" ? this._renderGroups() : e === "zones" ? this._renderZones() : e === "systems" ? this._renderSystems() : this._renderDevicePresets() : h`<div class="msg">Chargement…</div>`}
    `;
	}
}, Vi.styles = [D, o`
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
    `], Vi);
O([b({ attribute: !1 })], Q.prototype, "hass", void 0), O([b({ attribute: !1 })], Q.prototype, "base", void 0), O([b({ attribute: !1 })], Q.prototype, "subpath", void 0), O([x()], Q.prototype, "_presets", void 0), O([x()], Q.prototype, "_groups", void 0), O([x()], Q.prototype, "_devicePresets", void 0), O([x()], Q.prototype, "_zones", void 0), O([x()], Q.prototype, "_systems", void 0), O([x()], Q.prototype, "_enabledLocal", void 0), O([x()], Q.prototype, "_switching", void 0), O([x()], Q.prototype, "_rooms", void 0), O([x()], Q.prototype, "_loaded", void 0), O([x()], Q.prototype, "_presetName", void 0), O([x()], Q.prototype, "_presetId", void 0), O([x()], Q.prototype, "_busy", void 0), Q = O([y("homex-heating-manager")], Q);
// src/components/homex-climate-metrics.ts
var qi, Ji = "heating", Yi = [
	{
		key: "temperature",
		label: "Température",
		icon: "🌡",
		deviceClass: "temperature",
		section: "Température"
	},
	{
		key: "humidity",
		label: "Humidité",
		icon: "💧",
		deviceClass: "humidity",
		section: "Humidité"
	},
	{
		key: "pm25",
		label: "PM2.5",
		icon: "🌫",
		deviceClass: "pm25",
		section: "Qualité de l'air"
	},
	{
		key: "pm10",
		label: "PM10",
		icon: "🌫",
		deviceClass: "pm10",
		section: "Qualité de l'air"
	},
	{
		key: "co2",
		label: "CO₂",
		icon: "🫧",
		deviceClass: "carbon_dioxide",
		section: "CO₂"
	}
], Xi = [
	["mean", "Moyenne pondérée"],
	["max", "Maximum"],
	["min", "Minimum"]
];
function Zi(e, t) {
	if (!e.length) return null;
	if (t === "max") return Math.max(...e.map(([e]) => e));
	if (t === "min") return Math.min(...e.map(([e]) => e));
	let n = e.reduce((e, [, t]) => e + t, 0);
	return n <= 0 ? e.reduce((e, [t]) => e + t, 0) / e.length : e.reduce((e, [t, n]) => e + t * n, 0) / n;
}
var Qi = (qi = class extends v {
	constructor(...e) {
		super(...e), this.base = "", this.subpath = "", this._rooms = [], this._loaded = !1, this._draft = {}, this._busy = !1, this._draftFor = null;
	}
	connectedCallback() {
		super.connectedCallback(), this._load();
	}
	async _load() {
		try {
			this._rooms = await en(this.hass);
		} catch {
			this._rooms = [];
		}
		this._loaded = !0;
	}
	get _roomId() {
		return zn(this.subpath)[0] ?? null;
	}
	willUpdate() {
		let e = this._roomId ? this._rooms.find((e) => e.room_id === this._roomId) : null;
		e ? this._draftFor !== e.room_id && (this._draftFor = e.room_id, this._draft = JSON.parse(JSON.stringify(e.metrics ?? {})), this._busy = !1) : this._draftFor = null;
	}
	_hasClimate(e) {
		return (e.modules ?? []).includes(Ji);
	}
	async _openRoom(e) {
		if (!this._hasClimate(e)) {
			if (!confirm(`Activer le module Climate sur la pièce « ${e.name} » ?`)) return;
			try {
				await cn(this.hass, {
					entry_id: e.entry_id,
					modules: [...e.modules ?? [], Ji]
				}), await this._load();
			} catch (e) {
				alert("Erreur Homex : " + C(e));
				return;
			}
		}
		T(w(this.base, e.room_id));
	}
	_friendly(e) {
		return this.hass.states[e]?.attributes?.friendly_name || e;
	}
	_current(e) {
		let t = this.hass.states[e];
		if (!t || t.state === "unknown" || t.state === "unavailable") return "—";
		let n = t.attributes?.unit_of_measurement;
		return n ? `${t.state} ${n}` : t.state;
	}
	_candidates(e, t) {
		let n = (e, t) => this._friendly(e).localeCompare(this._friendly(t)), r = Object.keys(this.hass.states).filter((t) => t.startsWith("sensor.") && !t.startsWith("sensor.homex_") && this.hass.states[t]?.attributes?.device_class === e.deviceClass), i = t.area_id ? r.filter((e) => Ur(this.hass, e) === t.area_id).sort(n) : [];
		return {
			area: i,
			others: r.filter((e) => !i.includes(e)).sort(n)
		};
	}
	_cfg(e) {
		return this._draft[e] ?? {
			sensors: [],
			rule: "mean"
		};
	}
	_setCfg(e, t) {
		this._draft = {
			...this._draft,
			[e]: t
		};
	}
	_addSensor(e, t) {
		if (!t) return;
		let n = this._cfg(e);
		n.sensors.some((e) => e.entity_id === t) || this._setCfg(e, {
			...n,
			sensors: [...n.sensors, {
				entity_id: t,
				weight: 1
			}]
		});
	}
	_reference(e) {
		let t = this._cfg(e), n = [], r = "";
		for (let e of t.sensors) {
			let t = this.hass.states[e.entity_id], i = parseFloat(t?.state);
			Number.isNaN(i) || (n.push([i, e.weight]), r = r || t.attributes?.unit_of_measurement || "");
		}
		let i = Zi(n, t.rule);
		return i == null ? "—" : `${Math.round(i * 10) / 10}${r ? " " + r : ""}`;
	}
	async _save(e) {
		this._busy = !0;
		try {
			await cn(this.hass, {
				entry_id: e.entry_id,
				metrics: this._draft
			}), this._draftFor = null, await this._load(), E(this.base);
		} catch (e) {
			alert("Erreur Homex : " + C(e)), this._busy = !1;
		}
	}
	_renderMetric(e, t) {
		let n = this._cfg(e.key), { area: r, others: i } = this._candidates(e, t), a = new Set(n.sensors.map((e) => e.entity_id)), o = t.area_id ? this.hass.areas?.[t.area_id]?.name : void 0, s = (e) => ({
			value: e,
			label: this._friendly(e),
			secondary: e,
			tertiary: this._current(e),
			disabled: a.has(e)
		});
		return h`<div class="metric">
      <div class="metric-head">
        <span class="title">${e.icon} ${e.label}</span>
        ${n.sensors.length ? h`<span class="ref">${this._reference(e.key)}</span>` : ""}
      </div>
      ${n.sensors.length > 1 ? h`<homex-select
            class="rule"
            label="Calcul de la valeur de référence"
            .value=${n.rule}
            .options=${Xi.map(([e, t]) => ({
			value: e,
			label: t
		}))}
            @value-changed=${(t) => this._setCfg(e.key, {
			...n,
			rule: t.detail.value
		})}
          ></homex-select>` : ""}
      ${n.sensors.map((t, r) => h`<div class="sensor">
          <span>${this._friendly(t.entity_id)}</span>
          <span class="cur">${this._current(t.entity_id)}</span>
          ${n.rule === "mean" && n.sensors.length > 1 ? h`<input
                type="number"
                min="0"
                step="0.1"
                title="Poids"
                .value=${String(t.weight)}
                @change=${(t) => {
			let i = Math.max(0, parseFloat(t.target.value) || 0);
			this._setCfg(e.key, {
				...n,
				sensors: n.sensors.map((e, t) => t === r ? {
					...e,
					weight: i
				} : e)
			});
		}}
              />` : h`<span></span>`}
          <button
            title="Retirer"
            @click=${() => this._setCfg(e.key, {
			...n,
			sensors: n.sensors.filter((e, t) => t !== r)
		})}
          >
            ✕
          </button>
        </div>`)}
      <homex-select
        class="add"
        placeholder="＋ Ajouter un capteur…"
        value=""
        .groups=${[...r.length ? [{
			label: `Pièce : ${o ?? t.area_id}`,
			options: r.map((e) => s(e))
		}] : [], {
			label: "Autres",
			options: i.map((e) => s(e))
		}]}
        @value-changed=${(t) => {
			this._addSensor(e.key, t.detail.value), t.target.value = "";
		}}
      ></homex-select>
    </div>`;
	}
	_renderRoom(e) {
		let t = "";
		return h`
      <div class="head">
        <button @click=${() => E(this.base)}>← Metrics</button>
        <h2>${e.name}</h2>
        <button class="primary" ?disabled=${this._busy} @click=${() => this._save(e)}>
          Enregistrer
        </button>
      </div>
      ${Yi.map((n) => {
			let r = n.section === t ? "" : n.section;
			return t = n.section, h`${r ? h`<div class="section-title">${r}</div>` : ""}
          ${this._renderMetric(n, e)}`;
		})}
    `;
	}
	_roomValues(e) {
		let t = Yi.filter((t) => e.metrics?.[t.key]?.sensors?.length);
		return t.length ? h`<div class="values">
      ${t.map((t) => h`<span class="value">
          ${t.icon} ${this._current(`sensor.homex_${e.room_id}_${t.key}`)}
        </span>`)}
    </div>` : h`<span class="meta">Aucun capteur</span>`;
	}
	render() {
		if (!this._loaded) return h`<div class="msg">Chargement…</div>`;
		let e = this._roomId;
		if (e) {
			let t = this._rooms.find((t) => t.room_id === e);
			return !t || !this._hasClimate(t) ? h`<div class="head">
            <button @click=${() => E(this.base)}>← Metrics</button>
            <h2></h2>
          </div>
          <div class="msg">
            ${t ? "Le module Climate n'est pas activé sur cette pièce." : `« ${e} » introuvable.`}
          </div>` : this._renderRoom(t);
		}
		return h`
      <div class="head">
        <button @click=${() => this.dispatchEvent(new CustomEvent("close"))}>← Climate</button>
        <h2>Metrics</h2>
      </div>
      <div class="list">
        ${this._rooms.map((e) => {
			let t = this._hasClimate(e), n = e.area_id ? this.hass.areas?.[e.area_id]?.name : void 0;
			return h`<div class="row ${t ? "" : "off"}" @click=${() => this._openRoom(e)}>
            <div class="info">
              <div class="name">${e.name}</div>
              <div class="meta">${n ?? "Aucune pièce HA associée"}</div>
            </div>
            ${t ? this._roomValues(e) : h`<span class="meta">Module Climate désactivé</span>`}
            <span class="chevron">›</span>
          </div>`;
		})}
      </div>
    `;
	}
}, qi.styles = [D, o`
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
    `], qi);
O([b({ attribute: !1 })], Qi.prototype, "hass", void 0), O([b({ attribute: !1 })], Qi.prototype, "base", void 0), O([b({ attribute: !1 })], Qi.prototype, "subpath", void 0), O([x()], Qi.prototype, "_rooms", void 0), O([x()], Qi.prototype, "_loaded", void 0), O([x()], Qi.prototype, "_draft", void 0), O([x()], Qi.prototype, "_busy", void 0), Qi = O([y("homex-climate-metrics")], Qi);
// src/components/homex-climate-manager.ts
var $i, ea = [
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
], ta = ($i = class extends v {
	constructor(...e) {
		super(...e), this.base = "", this.subpath = "", this._toLanding = () => E(this.base);
	}
	get _page() {
		let e = zn(this.subpath)[0];
		return ea.some((t) => t.key === e) ? e : null;
	}
	_placeholder(e, t) {
		return h`
      <div class="head">
        <button @click=${this._toLanding}>← Climate</button>
        <h2>${e}</h2>
      </div>
      <div class="msg">${t}</div>
    `;
	}
	render() {
		let e = this._page;
		return e === "heating" ? h`<homex-heating-manager
        .hass=${this.hass}
        .base=${w(this.base, "heating")}
        .subpath=${zn(this.subpath).slice(1).join("/")}
        @close=${this._toLanding}
      ></homex-heating-manager>` : e === "metrics" ? h`<homex-climate-metrics
        .hass=${this.hass}
        .base=${w(this.base, "metrics")}
        .subpath=${zn(this.subpath).slice(1).join("/")}
        @close=${this._toLanding}
      ></homex-climate-metrics>` : e === "ac" ? this._placeholder("Air Conditioning", "La climatisation n'est pas encore disponible.") : h`
      <div class="head">
        <button @click=${() => this.dispatchEvent(new CustomEvent("close"))}>← Homex</button>
        <h2>Climate Manager</h2>
      </div>
      <div class="pages">
        ${ea.map((e) => h`<div
            class="page ${e.key === "ac" ? "soon" : ""}"
            @click=${() => T(w(this.base, e.key))}
          >
            <div class="icon">${e.icon}</div>
            <div>
              <div class="name">${e.label}</div>
              <div class="desc">${e.desc}</div>
            </div>
          </div>`)}
      </div>
    `;
	}
}, $i.styles = [D, o`
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
    `], $i);
O([b({ attribute: !1 })], ta.prototype, "hass", void 0), O([b({ attribute: !1 })], ta.prototype, "base", void 0), O([b({ attribute: !1 })], ta.prototype, "subpath", void 0), ta = O([y("homex-climate-manager")], ta);
// src/components/homex-heating-systems-card.ts
var na, ra = 7, ia = 3e5, aa = {
	setpoint_tank: ["Consigne − ballon", "setpoint_tank"],
	flow_return: ["Départ − retour", "flow_return"],
	delta: ["Consigne − ballon", "setpoint_tank"]
}, oa = (na = class extends v {
	constructor(...e) {
		super(...e), this.systems = [], this.zones = [], this._days = {}, this._hover = null;
	}
	connectedCallback() {
		super.connectedCallback(), this._timer = window.setInterval(() => this._loadHistory(), ia);
	}
	disconnectedCallback() {
		window.clearInterval(this._timer), super.disconnectedCallback();
	}
	willUpdate(e) {
		e.has("systems") && this._loadHistory();
	}
	_driven(e) {
		return e.type === "buffer_tank" ? e.circulator : e.contact;
	}
	async _loadHistory() {
		if (!this.hass) return;
		let e = /* @__PURE__ */ new Date();
		e.setHours(0, 0, 0, 0), e.setDate(e.getDate() - 6);
		let t = this.systems.map((e) => this._driven(e)).filter(Boolean);
		if (!t.length) return;
		let n = {};
		try {
			n = await this.hass.callWS({
				type: "history/history_during_period",
				start_time: e.toISOString(),
				entity_ids: t,
				minimal_response: !0,
				no_attributes: !0,
				significant_changes_only: !1
			});
		} catch {
			return;
		}
		let r = Date.now(), i = {};
		for (let t of this.systems) {
			let a = this._driven(t), o = Array.from({ length: ra }, (t, n) => {
				let r = new Date(e);
				return r.setDate(e.getDate() + n), {
					date: r,
					minutes: 0
				};
			}), s = a && n[a] || [];
			s.forEach((t, n) => {
				if (t.s !== "on") return;
				let i = Math.max(((t.lc ?? t.lu) || 0) * 1e3, e.getTime()), a = s[n + 1], c = a ? ((a.lc ?? a.lu) || 0) * 1e3 : r;
				for (let e of o) {
					let t = e.date.getTime(), n = t + 864e5, r = Math.min(c, n) - Math.max(i, t);
					r > 0 && (e.minutes += r / 6e4);
				}
			}), i[t.id] = o;
		}
		this._days = i;
	}
	_temp(e) {
		let t = parseFloat(e ? this.hass.states[e]?.state ?? "" : "");
		return Number.isNaN(t) ? "—" : `${Math.round(t * 10) / 10} °C`;
	}
	_dur(e) {
		let t = Math.round(e);
		return t < 60 ? `${t} min` : `${Math.floor(t / 60)} h ${String(t % 60).padStart(2, "0")}`;
	}
	_scope(e) {
		return (e.zones?.length ? e.zones : ["global"]).map((e) => e === "global" ? "Global" : this.zones.find((t) => t.id === e)?.name ?? e).join(", ");
	}
	_ent(e, t, n) {
		return this.hass.states[`${t}.homex_system_${e.id}_${n}`];
	}
	_toggle(e, t, n) {
		let r = this._ent(e, "switch", t);
		return r ? h`<label title=${r.entity_id}>
      ${j(r.state === "on", (e) => this.hass.callService("switch", e ? "turn_on" : "turn_off", { entity_id: r.entity_id }))}
      ${n}
    </label>` : _;
	}
	_renderChart(e) {
		let t = this._days[e.id];
		if (!t) return _;
		let n = 284 / ra, r = Math.max(60, ...t.map((e) => e.minutes)), i = t.reduce((e, t) => e + t.minutes, 0), a = this._hover?.sid === e.id ? t[this._hover.i] : void 0, o = (e) => e.toLocaleDateString(void 0, {
			weekday: "short",
			day: "numeric"
		}), s = (e, t) => {
			if (t <= 0) return "";
			let r = Math.min(4, t, n / 2), i = 70 - t;
			return `M${e},70V${i + r}Q${e},${i} ${e + r},${i}H${e + n - r}Q${e + n},${i} ${e + n},${i + r}V70Z`;
		};
		return h`<div class="chart">
      <div class="chart-head">
        <span>Temps d'activité · ${ra} jours</span>
        <span class="readout">
          ${a ? `${o(a.date)} : ${this._dur(a.minutes)}` : `Total ${this._dur(i)} · moy. ${this._dur(i / ra)}/j`}
        </span>
      </div>
      <svg
        class="bars"
        viewBox="0 0 ${320} ${70}"
        preserveAspectRatio="none"
        role="img"
        aria-label=${`Temps d'activité quotidien de ${e.name} sur ${ra} jours`}
        @pointerleave=${() => this._hover = null}
      >
        ${t.map((t, n) => {
			let i = n * 46.57142857142857, c = t.minutes / r * 70;
			return g`<path class="bar ${a && a !== t ? "dim" : ""}" d=${s(i, c)}></path>
            <rect
              class="hit"
              x=${i - 3}
              y="0"
              width=${46.57142857142857}
              height=${70}
              @pointerenter=${() => this._hover = {
				sid: e.id,
				i: n
			}}
            >
              <title>${o(t.date)} : ${this._dur(t.minutes)}</title>
            </rect>`;
		})}
        ${g`<line class="base" x1="0" x2=${320} y1=${70} y2=${70}></line>`}
      </svg>
      <div class="days">
        ${t.map((t, n) => h`<span
            @pointerenter=${() => this._hover = {
			sid: e.id,
			i: n
		}}
            @pointerleave=${() => this._hover = null}
            >${t.date.toLocaleDateString(void 0, { weekday: "short" })}</span
          >`)}
      </div>
    </div>`;
	}
	_renderTank(e) {
		let t = this.hass.states[e.circulator ?? ""]?.state === "on", n = this._ent(e, "switch", "force")?.state === "on", r = this._ent(e, "binary_sensor", "demand")?.state === "on", i = this._days[e.id], a = i ? i[i.length - 1].minutes : parseFloat(this._ent(e, "sensor", "runtime_today")?.state ?? ""), o = parseFloat(this._ent(e, "sensor", "min_runtime_left")?.state ?? "");
		return h`
      <div class="head">
        <div class="info">
          <div class="name">🛢️ ${e.name}</div>
          <div class="muted">Buffer Tank · ${this._scope(e)} · min ${e.min_runtime ?? 0} min</div>
        </div>
        <div class="pills">
          <span class="pill ${t ? "on" : ""}" title=${e.circulator ?? ""}>
            <svg viewBox="0 0 24 24"><path d=${t ? wt : Tt}></path></svg>
            ${t ? "Circulation" : "Arrêté"}
          </span>
          <span class="pill ${r ? "on" : ""}" title="Demande de chauffe de la portée">
            <svg viewBox="0 0 24 24"><path d=${r ? lt : ut}></path></svg>
            ${r ? "Demande" : "Pas de demande"}
          </span>
          ${n ? h`<span class="pill on"><svg viewBox="0 0 24 24"><path d=${dt}></path></svg>Forcé</span>` : _}
          ${e.aggressive ? h`<span class="pill"><svg viewBox="0 0 24 24"><path d=${kt}></path></svg>Agressif</span>` : _}
        </div>
      </div>
      <div class="tiles">
        <div class="tile"><div class="label">Consigne</div><div class="value">${this._temp(e.setpoint_sensor)}</div></div>
        ${e.tank_sensor ? h`<div class="tile"><div class="label">Ballon</div><div class="value">${this._temp(e.tank_sensor)}</div></div>` : _}
        ${e.flow_sensor ? h`<div class="tile"><div class="label">Départ</div><div class="value">${this._temp(e.flow_sensor)}</div></div>` : _}
        ${e.return_sensor ? h`<div class="tile"><div class="label">Retour</div><div class="value">${this._temp(e.return_sensor)}</div></div>` : _}
        <div class="tile">
          <div class="label">Actif aujourd'hui</div>
          <div class="value">${Number.isNaN(a) ? "—" : this._dur(a)}</div>
        </div>
        ${o > 0 ? h`<div class="tile">
              <div class="label">Temps min. restant</div>
              <div class="value">${this._dur(o / 60)}</div>
            </div>` : _}
      </div>
      ${(e.rules ?? []).length ? h`<div class="rules">
            ${(e.rules ?? []).map((t) => {
			let [n, r] = aa[t.type] ?? [t.type, t.type], i = parseFloat(this._ent(e, "sensor", `gap_${r}`)?.state ?? ""), a = this._ent(e, "binary_sensor", `rule_${r}`)?.state === "on";
			return h`<div class="rule">
                <span class="dot ${a ? "on" : ""}"></span>
                <span>${n}</span>
                <span class="gap">${Number.isNaN(i) ? "—" : `${i} °C`}</span>
                <span class="muted">démarre ≥ ${t.delta} · s'arrête &lt; ${t.tolerance} · ${a ? "demande la circulation" : "inactive"}</span>
              </div>`;
		})}
          </div>` : _}
      <div class="switches">${this._toggle(e, "force", "Forçage manuel")}</div>
      ${this._renderChart(e)}
    `;
	}
	_renderBoiler(e) {
		let t = this.hass.states[e.contact ?? ""]?.state === "on", n = this._ent(e, "binary_sensor", "demand")?.state === "on", r = this._days[e.id], i = r ? r[r.length - 1].minutes : NaN;
		return h`
      <div class="head">
        <div class="info">
          <div class="name">🔥 ${e.name}</div>
          <div class="muted">Boiler · ${this._scope(e)}</div>
        </div>
        <div class="pills">
          <span class="pill ${t ? "on" : ""}" title=${e.contact ?? ""}>
            <svg viewBox="0 0 24 24"><path d=${t ? lt : ut}></path></svg>
            ${t ? "En marche" : "Arrêtée"}
          </span>
          <span class="pill ${n ? "on" : ""}">${n ? "Demande" : "Pas de demande"}</span>
          ${e.aggressive ? h`<span class="pill"><svg viewBox="0 0 24 24"><path d=${kt}></path></svg>Agressif</span>` : _}
        </div>
      </div>
      <div class="tiles">
        <div class="tile">
          <div class="label">Active aujourd'hui</div>
          <div class="value">${Number.isNaN(i) ? "—" : this._dur(i)}</div>
        </div>
      </div>
      ${this._renderChart(e)}
    `;
	}
	render() {
		let e = this.systems.filter((e) => e.type === "boiler" || e.type === "buffer_tank");
		return e.length ? h`<div class="card">
      <div class="card-title">Systèmes de chauffage</div>
      ${e.map((e) => h`<div class="system">
          ${e.type === "buffer_tank" ? this._renderTank(e) : this._renderBoiler(e)}
        </div>`)}
    </div>` : _;
	}
}, na.styles = [D, o`
      :host {
        display: block;
      }
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
      .system + .system {
        border-top: 1px solid var(--divider-color, #e0e0e0);
        margin-top: 14px;
        padding-top: 14px;
      }
      .head {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 12px;
      }
      .head .info {
        flex: 1;
        min-width: 150px;
      }
      .name {
        font-weight: 500;
      }
      .muted {
        font-size: 12px;
        color: var(--secondary-text-color);
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
      .pill.on {
        color: var(--state-climate-heat-color, #ff8100);
        background: color-mix(in srgb, var(--state-climate-heat-color, #ff8100) 16%, transparent);
      }
      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
        gap: 8px;
        margin-top: 12px;
      }
      .tile {
        padding: 8px 10px;
        border-radius: 10px;
        background: var(--secondary-background-color, rgba(225, 225, 225, 0.06));
        min-width: 0;
      }
      .tile .label {
        font-size: 11px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tile .value {
        font-size: 18px;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        margin-top: 2px;
      }
      .rules {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .rule {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 4px 10px;
        font-size: 13px;
      }
      .rule .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--disabled-text-color, #777);
        flex: none;
      }
      .rule .dot.on {
        background: var(--state-climate-heat-color, #ff8100);
      }
      .rule .gap {
        font-weight: 500;
        font-variant-numeric: tabular-nums;
      }
      .switches {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 20px;
        margin-top: 12px;
      }
      .switches label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;
      }
      .chart {
        margin-top: 14px;
      }
      .chart-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-bottom: 6px;
      }
      .chart-head .readout {
        color: var(--primary-text-color);
        font-variant-numeric: tabular-nums;
      }
      svg.bars {
        display: block;
        width: 100%;
        height: 70px;
        overflow: visible;
      }
      svg.bars .bar {
        fill: var(--state-climate-heat-color, #ff8100);
      }
      svg.bars .bar.dim {
        opacity: 0.45;
      }
      svg.bars .base {
        stroke: var(--divider-color, rgba(127, 127, 127, 0.4));
        stroke-width: 1;
      }
      svg.bars .hit {
        fill: transparent;
        cursor: default;
      }
      .days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0 6px;
        margin-top: 4px;
        font-size: 10px;
        text-align: center;
        color: var(--secondary-text-color);
      }
      .empty {
        font-size: 14px;
        color: var(--secondary-text-color);
      }
    `], na);
O([b({ attribute: !1 })], oa.prototype, "hass", void 0), O([b({ attribute: !1 })], oa.prototype, "systems", void 0), O([b({ attribute: !1 })], oa.prototype, "zones", void 0), O([x()], oa.prototype, "_days", void 0), O([x()], oa.prototype, "_hover", void 0), oa = O([y("homex-heating-systems-card")], oa);
// src/components/homex-climate-dashboard.ts
var sa, ca = "select.homex_climate_tolerance_mode", la = (sa = class extends v {
	constructor(...e) {
		super(...e), this.rooms = [], this._zones = [], this._systems = [], this._enabledLocal = !0, this._loaded = !1, this._busy = !1, this._roomBusy = /* @__PURE__ */ new Set();
	}
	get _enabled() {
		let e = this.hass?.states["switch.homex_heating"];
		return e ? e.state === "on" : this._enabledLocal;
	}
	connectedCallback() {
		super.connectedCallback(), this._load();
	}
	async _load() {
		try {
			let e = await bn(this.hass);
			this._zones = e.zones ?? [], this._systems = e.systems ?? [], this._enabledLocal = e.enabled ?? !0;
		} catch {
			this._zones = [];
		}
		this._loaded = !0;
	}
	async _toggle() {
		this._busy = !0;
		try {
			let e = !this._enabled;
			await Nn(this.hass, e), this._enabledLocal = e;
		} catch (e) {
			alert("Erreur Homex : " + C(e));
		} finally {
			this._busy = !1;
		}
	}
	_demandPill(e) {
		let t = this.hass.states[e]?.state === "on";
		return h`<span class="pill ${t ? "heating" : ""}" title=${e}>
      <svg viewBox="0 0 24 24"><path d=${t ? lt : ut}></path></svg>
      ${t ? "Heating" : "Idle"}
    </span>`;
	}
	_zoneRooms(e) {
		let t = new Set(this._zones.flatMap((e) => e.rooms)), n = (e.id === "default" ? this.rooms.map((e) => e.room_id).filter((e) => !t.has(e)) : e.rooms).map((e) => this.rooms.find((t) => t.room_id === e)?.name ?? e);
		return n.length ? n.join(", ") : "Aucune pièce";
	}
	_renderZone(e) {
		let t = `select.homex_heating_${e.id}`, n = this.hass.states[t], r = n?.attributes?.options ?? [];
		return h`<div class="zone">
      <div class="info">
        <div class="name">${e.name}</div>
        <div class="muted">${this._zoneRooms(e)}</div>
      </div>
      ${this._demandPill(`binary_sensor.homex_heating_needed_${e.id}`)}
      <homex-select
        class="zone-mode"
        title="Mode de la zone"
        .value=${n?.state ?? ""}
        ?disabled=${!n}
        .options=${r.map((e) => ({
			value: e,
			label: e
		}))}
        @value-changed=${(e) => this.hass.callService("select", "select_option", {
			entity_id: t,
			option: e.detail.value
		})}
      ></homex-select>
      ${this.hass.states[`${ca}_${e.id}`] ? h`<span class="zone-tol" title="Tolérance de la zone">
            ${this._btnGroup(`${ca}_${e.id}`)}
          </span>` : ""}
    </div>`;
	}
	_btnGroup(e) {
		let t = this.hass.states[e];
		return h`<div class="btn-group" role="radiogroup" title=${e}>
      ${(t?.attributes?.options ?? []).map((n) => h`<button
          role="radio"
          aria-checked=${n === t.state ? "true" : "false"}
          class=${n === t.state ? "active" : ""}
          @click=${() => n !== t.state && this.hass.callService("select", "select_option", {
			entity_id: e,
			option: n
		})}
        >
          ${n}
        </button>`)}
    </div>`;
	}
	render() {
		if (!this._loaded) return h`<div class="muted">Chargement…</div>`;
		let e = this.hass.states[ca];
		return h`
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
          ${e ? h`<div class="field-select" title=${ca}>
                <span>Tolérance</span>
                ${this._btnGroup(ca)}
              </div>` : ""}
        </div>
      </div>
      <homex-heating-systems-card
        .hass=${this.hass}
        .systems=${this._systems}
        .zones=${this._zones}
      ></homex-heating-systems-card>
      <div class="card">
        <div class="card-title">Zones</div>
        ${this._zones.map((e) => this._renderZone(e))}
      </div>
      ${this._renderRooms()}
    `;
	}
	_renderRooms() {
		let e = this.rooms.filter((e) => (e.modules ?? []).includes("heating"));
		return e.length ? h`<div class="card">
      <div class="card-title">Pièces</div>
      ${e.map((e) => this._renderRoom(e))}
    </div>` : "";
	}
	_fmt(e) {
		if (!e.length) return "—";
		let t = Math.min(...e), n = Math.max(...e), r = (e) => `${Math.round(e * 10) / 10}`;
		return t === n ? `${r(t)} °C` : `${r(t)}–${r(n)} °C`;
	}
	_renderRoom(e) {
		let t = e.heating?.radiators ?? [], n = e.heating?.enabled !== !1, r = t.map((e) => Gn(this.hass, e.device_id)).map((e) => e ? this.hass.states[e] : void 0).filter((e) => e && !["unknown", "unavailable"].includes(e.state)), i = (e) => typeof e == "number" ? [e] : [], a = r.filter((e) => e.state !== "off").flatMap((e) => i(e.attributes.temperature)), o = r.length > 0 && r.every((e) => e.state === "off"), s = a.length ? this._fmt(a) : o ? "coupé" : "—", c = this.hass.states[`sensor.homex_${e.room_id}_temperature`], l = parseFloat(c?.state), u = Number.isNaN(l) ? this._fmt(r.flatMap((e) => i(e.attributes.current_temperature))) : `${l} °C`, d = Zn(this.hass, e), f = Xn(this.hass, e), p = Yn(this.hass, e), m = this._roomBusy.has(e.room_id);
		return h`<div class="room ${n ? "" : "off"}">
      <label class="room-switch" title=${t.length ? "Chauffage de la pièce" : "Aucun radiateur"}>
        ${j(n, (t) => this._setRoomHeating(e, t), m || !t.length)}
      </label>
      <div class="info">
        <div class="name">${e.name}</div>
        <div class="muted">
          ${t.length} radiateur(s)${d ? h` · ${d.mode}` : ""}
        </div>
      </div>
      <div class="temps">
        <span title="Consigne">🎯 ${s}</span>
        <span title="Température actuelle">🌡 ${u}</span>
      </div>
      ${t.length ? h`<span class="pill ${f ? "heating" : ""}">
            <svg viewBox="0 0 24 24"><path d=${f ? lt : ut}></path></svg>
            ${f ? "Heating" : "Idle"}
          </span>` : ""}
      ${p ? h`<span class="pill warning" title=${p}>
            <svg viewBox="0 0 24 24"><path d=${Xe}></path></svg>Vanne ?
          </span>` : ""}
    </div>`;
	}
	async _setRoomHeating(e, t) {
		this._roomBusy = /* @__PURE__ */ new Set([...this._roomBusy, e.room_id]);
		try {
			await cn(this.hass, {
				entry_id: e.entry_id,
				heating: {
					radiators: e.heating?.radiators ?? [],
					enabled: t
				}
			}), S(this);
		} catch (e) {
			alert("Erreur Homex : " + C(e));
		} finally {
			let t = new Set(this._roomBusy);
			t.delete(e.room_id), this._roomBusy = t;
		}
	}
}, sa.styles = [D, o`
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
    `], sa);
O([b({ attribute: !1 })], la.prototype, "hass", void 0), O([b({ attribute: !1 })], la.prototype, "rooms", void 0), O([x()], la.prototype, "_zones", void 0), O([x()], la.prototype, "_systems", void 0), O([x()], la.prototype, "_enabledLocal", void 0), O([x()], la.prototype, "_loaded", void 0), O([x()], la.prototype, "_busy", void 0), O([x()], la.prototype, "_roomBusy", void 0), la = O([y("homex-climate-dashboard")], la);
// src/homex-panel.ts
var ua, da = "198", $ = (ua = class extends v {
	constructor(...e) {
		super(...e), this.narrow = !1, this._rooms = null, this._error = null, this._createOpen = !1, this._exportOpen = !1, this._menuOpen = !1, this._dashTab = localStorage.getItem("homex_dash_tab") === "climate" ? "climate" : "general", this._expanded = localStorage.getItem("homex_expanded") || null, this._loaded = !1, this._onToggleExpand = (e) => {
			let t = e.detail.entry_id;
			this._expanded = this._expanded === t ? null : t, this._expanded ? localStorage.setItem("homex_expanded", this._expanded) : localStorage.removeItem("homex_expanded");
		}, this._reload = async () => {
			try {
				this._rooms = await en(this.hass), this._error = null;
			} catch (e) {
				this._error = C(e);
			}
		}, this._backToRooms = () => E(this._prefix), this._onOpenSwitchAdd = (e) => {
			let t = e.detail?.room_id;
			T(w(this._prefix, "switches", "switches", "new") + (t ? `?room=${encodeURIComponent(t)}` : ""));
		};
	}
	connectedCallback() {
		super.connectedCallback(), this.addEventListener(Lt, this._reload), this.addEventListener("homex-toggle-expand", this._onToggleExpand);
	}
	disconnectedCallback() {
		this.removeEventListener(Lt, this._reload), this.removeEventListener("homex-toggle-expand", this._onToggleExpand), super.disconnectedCallback();
	}
	get _segs() {
		return zn(this.route?.path);
	}
	get _view() {
		let e = this._segs[0];
		return e === "switches" || e === "shutters" || e === "climate" ? e : "rooms";
	}
	get _prefix() {
		return this.route?.prefix || "/homex";
	}
	updated(e) {
		if (e.has("hass") && this.hass && !this._loaded && (this._loaded = !0, Rn().then(() => this.requestUpdate()), this._reload()), this._segs[0] === "heating") {
			T(w(this._prefix, "climate", ...this._segs), !0);
			return;
		}
		let t = e.get("route");
		t && this._loaded && this._view === "rooms" && zn(t.path).length && this._reload();
	}
	_renderDashboard(e) {
		if (!(this._rooms ?? []).some((e) => (e.modules ?? []).includes("heating"))) return e;
		let t = this._dashTab, n = (e) => {
			this._dashTab = e;
			try {
				localStorage.setItem("homex_dash_tab", e);
			} catch {}
		};
		return h`
      <div class="dash-tabs">
        <span class="dash-tab ${t === "general" ? "active" : ""}" @click=${() => n("general")}
          >General</span
        >
        <span class="dash-tab ${t === "climate" ? "active" : ""}" @click=${() => n("climate")}
          >Climate</span
        >
      </div>
      ${t === "climate" ? h`<homex-climate-dashboard
            .hass=${this.hass}
            .rooms=${this._rooms ?? []}
          ></homex-climate-dashboard>` : e}
    `;
	}
	_toggleSidebar() {
		this.dispatchEvent(new Event("hass-toggle-menu", {
			bubbles: !0,
			composed: !0
		}));
	}
	_roomCard(e) {
		return h`<homex-room-card
      .hass=${this.hass}
      .room=${e}
      .expanded=${e.entry_id === this._expanded}
    ></homex-room-card>`;
	}
	_grouped() {
		let e = [], t = /* @__PURE__ */ new Map();
		for (let n of this._rooms || []) {
			let r = (n.area_id ? this.hass.areas?.[n.area_id] : null)?.floor_id;
			r && this.hass.floors?.[r] ? (t.get(r) ?? t.set(r, []).get(r)).push(n) : e.push(n);
		}
		return {
			ungrouped: e,
			floors: [...t.keys()].map((e) => this.hass.floors[e]).sort((e, t) => (e.level ?? 0) - (t.level ?? 0) || e.name.localeCompare(t.name)),
			byFloor: t
		};
	}
	render() {
		let e;
		if (this._error) e = h`<div class="msg err">Erreur : ${this._error}</div>`;
		else if (!this._rooms) e = h`<div class="msg">Chargement…</div>`;
		else if (!this._rooms.length) e = h`<div class="msg">
        Aucune pièce. Clique sur <strong>＋ Nouvelle pièce</strong> en haut à
        droite pour en créer une.
      </div>`;
		else {
			let { ungrouped: t, floors: n, byFloor: r } = this._grouped();
			e = h`
        ${t.map((e) => this._roomCard(e))}
        ${n.map((e) => h`
            <div class="floor-header">
              ${e.icon ? h`<ha-icon .icon=${e.icon}></ha-icon>` : ""}
              <span>${e.name}</span>
            </div>
            ${(r.get(e.floor_id) || []).map((e) => this._roomCard(e))}
          `)}
      `;
		}
		return this._view === "switches" ? h`
        <div class="wrap">
          <homex-switch-manager
            .hass=${this.hass}
            .base=${w(this._prefix, "switches")}
            .subpath=${this._segs.slice(1).join("/")}
            @close=${this._backToRooms}
          ></homex-switch-manager>
        </div>
      ` : this._view === "climate" ? h`
        <div class="wrap">
          <homex-climate-manager
            .hass=${this.hass}
            .base=${w(this._prefix, "climate")}
            .subpath=${this._segs.slice(1).join("/")}
            @close=${this._backToRooms}
          ></homex-climate-manager>
        </div>
      ` : this._view === "shutters" ? h`
        <div class="wrap">
          <homex-shutter-manager
            .hass=${this.hass}
            .base=${w(this._prefix, "shutters")}
            .subpath=${this._segs.slice(1).join("/")}
            @close=${this._backToRooms}
          ></homex-shutter-manager>
        </div>
      ` : h`
      <div class="wrap" @open-switch-add=${this._onOpenSwitchAdd}>
        <header>
          <div class="title">
            ${this.narrow ? h`<button
                  class="menu-btn"
                  title="Menu"
                  @click=${this._toggleSidebar}
                >
                  <svg viewBox="0 0 24 24"><path d=${vt}></path></svg>
                </button>` : ""}
            <h1>Homex <span class="ver">v${da}</span></h1>
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
              ${this._menuOpen ? h`
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
                        <svg class="ico" viewBox="0 0 24 24"><path d=${Et}></path></svg>
                        Rafraîchir
                      </button>
                      <button
                        ?disabled=${!this._rooms?.length}
                        @click=${() => {
			this._menuOpen = !1, this._exportOpen = !0;
		}}
                      >
                        <svg class="ico" viewBox="0 0 24 24"><path d=${st}></path></svg>
                        Exporter
                      </button>
                      <div class="menu-sep"></div>
                      <button
                        @click=${() => {
			this._menuOpen = !1, T(w(this._prefix, "switches"));
		}}
                      >
                        🎛 Switch Manager
                      </button>
                      <button
                        @click=${() => {
			this._menuOpen = !1, T(w(this._prefix, "shutters"));
		}}
                      >
                        🪟 Shutter Manager
                      </button>
                      <button
                        @click=${() => {
			this._menuOpen = !1, T(w(this._prefix, "climate"));
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
}, ua.styles = o`
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
  `, ua);
O([b({ attribute: !1 })], $.prototype, "hass", void 0), O([b({ attribute: !1 })], $.prototype, "narrow", void 0), O([b({ attribute: !1 })], $.prototype, "route", void 0), O([b({ attribute: !1 })], $.prototype, "panel", void 0), O([x()], $.prototype, "_rooms", void 0), O([x()], $.prototype, "_error", void 0), O([x()], $.prototype, "_createOpen", void 0), O([x()], $.prototype, "_exportOpen", void 0), O([x()], $.prototype, "_menuOpen", void 0), O([x()], $.prototype, "_dashTab", void 0), O([x()], $.prototype, "_expanded", void 0), $ = O([y("homex-panel")], $);
export { $ as HomexPanel };
