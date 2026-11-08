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
var Xe = "M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z", Ze = "M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z", Qe = "M3,5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5M11,6V14.5L7.5,11L6.08,12.42L12,18.34L17.92,12.42L16.5,11L13,14.5V6H11Z", $e = "M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z", et = "M21,19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19C20.11,3 21,3.9 21,5V19M13,18V9.5L16.5,13L17.92,11.58L12,5.66L6.08,11.58L7.5,13L11,9.5V18H13Z", tt = "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z", nt = "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z", rt = "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z", it = "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z", at = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z", ot = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z", st = "M3 6H21V4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H7V18H3V6M13 12H9V13.78C8.39 14.33 8 15.11 8 16C8 16.89 8.39 17.67 9 18.22V20H13V18.22C13.61 17.67 14 16.88 14 16S13.61 14.33 13 13.78V12M11 17.5C10.17 17.5 9.5 16.83 9.5 16S10.17 14.5 11 14.5 12.5 15.17 12.5 16 11.83 17.5 11 17.5M22 8H16C15.5 8 15 8.5 15 9V19C15 19.5 15.5 20 16 20H22C22.5 20 23 19.5 23 19V9C23 8.5 22.5 8 22 8M21 18H17V10H21V18Z", ct = "M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z", lt = "M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z", ut = "M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.78 14.43 12.46 13.77 12.33 13C12.21 12.26 12.23 11.63 12.5 10.94C12.69 11.32 12.89 11.7 13.13 12C13.9 13 15.11 13.44 15.37 14.8C15.41 14.94 15.43 15.08 15.43 15.23C15.46 16.05 15.1 16.95 14.5 17.5H14.5Z", dt = "M22.11 21.46L2.39 1.73L1.11 3L7.09 9C5.66 10.36 4.88 12.47 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C17.1 19.26 17.15 19.18 17.22 19.11L20.84 22.73L22.11 21.46M8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C7 12.47 6.74 10.69 7.26 9.15L8.58 10.47C8.58 11.4 8.73 12.33 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.66 15 12.66 14.76 12.64 14.53L15 16.88C14.85 17.11 14.69 17.33 14.5 17.5M18.92 15.72L9.65 6.46C10.12 5.65 10.72 4.92 11.46 4.32C12.17 3.75 13 3.23 13.95 3C13 4.85 13.33 7.26 14.82 8.72C15.46 9.35 16.22 9.78 16.89 10.38C17.15 10.64 17.43 10.9 17.66 11.2C17.66 11.2 18.22 12 18.43 12.46L18.56 12.72C18.96 13.69 19.06 14.72 18.92 15.72Z", ft = "M13 24C9.74 24 6.81 22 5.6 19L2.57 11.37C2.26 10.58 3 9.79 3.81 10.05L4.6 10.31C5.16 10.5 5.62 10.92 5.84 11.47L7.25 15H8V3.25C8 2.56 8.56 2 9.25 2S10.5 2.56 10.5 3.25V12H11.5V1.25C11.5 .56 12.06 0 12.75 0S14 .56 14 1.25V12H15V2.75C15 2.06 15.56 1.5 16.25 1.5C16.94 1.5 17.5 2.06 17.5 2.75V12H18.5V5.75C18.5 5.06 19.06 4.5 19.75 4.5S21 5.06 21 5.75V16C21 20.42 17.42 24 13 24Z", pt = "M15 13L11 17V14H2V12H11V9L15 13M5 20V16H7V18H17V10.19L12 5.69L7.21 10H4.22L12 3L22 12H19V20H5Z", mt = "M17 14H19V17H22V19H19V22H17V19H14V17H17V14M5 20V12H2L12 3L22 12H17V10.19L12 5.69L7 10.19V18H12C12 18.7 12.12 19.37 12.34 20H5Z", ht = "M19 8C20.11 8 21 8.9 21 10V16.76C21.61 17.31 22 18.11 22 19C22 20.66 20.66 22 19 22C17.34 22 16 20.66 16 19C16 18.11 16.39 17.31 17 16.76V10C17 8.9 17.9 8 19 8M19 9C18.45 9 18 9.45 18 10V11H20V10C20 9.45 19.55 9 19 9M5 20V12H2L12 3L16.4 6.96C15.54 7.69 15 8.78 15 10V16C14.37 16.83 14 17.87 14 19L14.1 20H5Z", gt = "M10 2C13.9 2 17 5.1 17 9C17 11.4 15.8 13.5 14 14.7V17C14 17.6 13.6 18 13 18H7C6.4 18 6 17.6 6 17V14.7C4.2 13.5 3 11.4 3 9C3 5.1 6.1 2 10 2M7 21V20H13V21C13 21.6 12.6 22 12 22H8C7.4 22 7 21.6 7 21M10 4C7.2 4 5 6.2 5 9C5 11.1 6.2 12.8 8 13.6V16H12V13.6C13.8 12.8 15 11.1 15 9C15 6.2 12.8 4 10 4M19 12V7H21V13H19M19 17V15H21V17H19Z", _t = "M12,2C9.76,2 7.78,3.05 6.5,4.68L7.93,6.11C8.84,4.84 10.32,4 12,4A5,5 0 0,1 17,9C17,10.68 16.16,12.16 14.89,13.06L16.31,14.5C17.94,13.21 19,11.24 19,9A7,7 0 0,0 12,2M3.28,4L2,5.27L5.04,8.3C5,8.53 5,8.76 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H14.73L18.73,22L20,20.72L3.28,4M7.23,10.5L12.73,16H10V13.58C8.68,13 7.66,11.88 7.23,10.5M9,20V21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9Z", vt = "M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63Z", yt = "M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M11,18H13V15.87C14.73,15.43 16,13.86 16,12A4,4 0 0,0 12,8A4,4 0 0,0 8,12C8,13.86 9.27,15.43 11,15.87V18Z", bt = "M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z", xt = "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z", St = "M19,13H5V11H19V13Z", Ct = "M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z", wt = "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z", Tt = "M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z", Et = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z", Dt = "M2 21V15H3.5C3.18 14.06 3 13.05 3 12C3 7.03 7.03 3 12 3H22V9H20.5C20.82 9.94 21 10.95 21 12C21 16.97 16.97 21 12 21H2M5 12C5 13.28 5.34 14.47 5.94 15.5L9.4 13.5C9.15 13.06 9 12.55 9 12C9 11.35 9.21 10.75 9.56 10.26L6.3 7.93C5.5 9.08 5 10.5 5 12M12 19C14.59 19 16.85 17.59 18.06 15.5L14.6 13.5C14.08 14.4 13.11 15 12 15L11.71 15L11.33 18.97L12 19M12 9C13.21 9 14.26 9.72 14.73 10.76L18.37 9.1C17.27 6.68 14.83 5 12 5V9M12 11C11.45 11 11 11.45 11 12C11 12.55 11.45 13 12 13C12.55 13 13 12.55 13 12C13 11.45 12.55 11 12 11Z", Ot = "M22.1 21.5L2.4 1.7L1.1 3L4.8 6.7C3.7 8.2 3 10 3 12C3 13 3.2 14.1 3.5 15H2V21H12C14 21 15.8 20.3 17.3 19.2L20.8 22.7L22.1 21.5M5.9 15.5C5.3 14.5 5 13.3 5 12C5 10.6 5.5 9.2 6.2 8.1L9.2 11.1C9.1 11.3 9 11.7 9 12C9 12.5 9.2 13.1 9.4 13.5L5.9 15.5M12 19H11.3L11.7 15H12C12.3 15 12.6 14.9 12.9 14.8L15.9 17.8C14.8 18.5 13.4 19 12 19M12 8.8L7.4 4.2C8.8 3.5 10.3 3 12 3H22V9H20.5C20.8 9.9 21 11 21 12C21 13.7 20.5 15.2 19.8 16.6L12.2 9C13.3 9.1 14.3 9.8 14.7 10.7L18.3 9C17.3 6.7 14.8 5 12 5V8.8Z", kt = "M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z", At = "M20 19V3H4V19H2V21H22V19H20M6 19V13H11V14.8C10.6 15.1 10.2 15.6 10.2 16.2C10.2 17.2 11 18 12 18S13.8 17.2 13.8 16.2C13.8 15.6 13.5 15.1 13 14.8V13H18V19H6Z", jt = "M11,13.5V21.5H3V13.5H11M12,2L17.5,11H6.5L12,2M17.5,13C20,13 22,15 22,17.5C22,20 20,22 17.5,22C15,22 13,20 13,17.5C13,15 15,13 17.5,13Z", Mt = "M12,16A3,3 0 0,1 9,13C9,11.88 9.61,10.9 10.5,10.39L20.21,4.77L14.68,14.35C14.18,15.33 13.17,16 12,16M12,3C13.81,3 15.5,3.5 16.97,4.32L14.87,5.53C14,5.19 13,5 12,5A8,8 0 0,0 4,13C4,15.21 4.89,17.21 6.34,18.65H6.35C6.74,19.04 6.74,19.67 6.35,20.06C5.96,20.45 5.32,20.45 4.93,20.07V20.07C3.12,18.26 2,15.76 2,13A10,10 0 0,1 12,3M22,13C22,15.76 20.88,18.26 19.07,20.07V20.07C18.68,20.45 18.05,20.45 17.66,20.06C17.27,19.67 17.27,19.04 17.66,18.65V18.65C19.11,17.2 20,15.21 20,13C20,12 19.81,11 19.46,10.1L20.67,8C21.5,9.5 22,11.18 22,13Z", Nt = "M18,18H6V6H18V18Z", Pt = "M7.5,2C5.71,3.15 4.5,5.18 4.5,7.5C4.5,9.82 5.71,11.85 7.53,13C4.46,13 2,10.54 2,7.5A5.5,5.5 0 0,1 7.5,2M19.07,3.5L20.5,4.93L4.93,20.5L3.5,19.07L19.07,3.5M12.89,5.93L11.41,5L9.97,6L10.39,4.3L9,3.24L10.75,3.12L11.33,1.47L12,3.1L13.73,3.13L12.38,4.26L12.89,5.93M9.59,9.54L8.43,8.81L7.31,9.59L7.65,8.27L6.56,7.44L7.92,7.35L8.37,6.06L8.88,7.33L10.24,7.36L9.19,8.23L9.59,9.54M19,13.5A5.5,5.5 0 0,1 13.5,19C12.28,19 11.15,18.6 10.24,17.93L17.93,10.24C18.6,11.15 19,12.28 19,13.5M14.6,20.08L17.37,18.93L17.13,22.28L14.6,20.08M18.93,17.38L20.08,14.61L22.28,17.15L18.93,17.38M20.08,12.42L18.94,9.64L22.28,9.88L20.08,12.42M9.63,18.93L12.4,20.08L9.87,22.27L9.63,18.93Z", Ft = "M12.87,15.07L10.33,12.56L10.36,12.53C12.1,10.59 13.34,8.36 14.07,6H17V4H10V2H8V4H1V6H12.17C11.5,7.92 10.44,9.75 9,11.35C8.07,10.32 7.3,9.19 6.69,8H4.69C5.42,9.63 6.42,11.17 7.67,12.56L2.58,17.58L4,19L9,14L12.11,17.11L12.87,15.07M18.5,10H16.5L12,22H14L15.12,19H19.87L21,22H23L18.5,10M15.88,17L17.5,12.67L19.12,17H15.88Z", It = "M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9M8 12H16V14H8V12M8 15H16V17H8V15M8 18H16V20H8V18Z", Lt = "M2 4H20V8H18V20H16V8H6V20H4V8H2V4M7 9H15V11H7V9M7 12H15V14H7V12M20 19V17H22V19H20M20 15V10H22V15H20Z", Rt = "M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9Z", y = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, zt = {
	attribute: !0,
	type: String,
	converter: ae,
	reflect: !1,
	hasChanged: oe
}, Bt = (e = zt, t, n) => {
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
	return (t, n) => typeof n == "object" ? Bt(e, t, n) : ((e, t, n) => {
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
// node_modules/lit-html/directive.js
var Vt = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, Ht = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Ut = class {
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
}, { I: Wt } = Ge, Gt = (e) => e, Kt = () => document.createComment(""), qt = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new Wt(r.insertBefore(Kt(), i), r.insertBefore(Kt(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = Gt(e).nextSibling;
				Gt(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, Jt = (e, t, n = e) => (e._$AI(t, n), e), Yt = {}, Xt = (e, t = Yt) => e._$AH = t, Zt = (e) => e._$AH, Qt = (e) => {
	e._$AR(), e._$AA.remove();
}, $t = Ht(class extends Ut {
	constructor() {
		super(...arguments), this.key = _;
	}
	render(e, t) {
		return this.key = e, t;
	}
	update(e, [t, n]) {
		return t !== this.key && (Xt(e), this.key = t), n;
	}
}), en = {
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
	panel: {
		en: {
			tab_general: "General",
			tab_climate: "Climate",
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
}, tn = ["en", "fr"], nn = {
	en: {},
	fr: {}
};
for (let [e, t] of Object.entries(en)) for (let n of tn) for (let [r, i] of Object.entries(t[n] ?? {})) nn[n][`${e}.${r}`] = i;
var rn = "auto", an, on = "en", sn = /* @__PURE__ */ new Set();
function cn(e) {
	return sn.add(e), () => sn.delete(e);
}
function ln(e) {
	let t = (e || "").toLowerCase().split(/[-_]/)[0];
	return tn.includes(t) ? t : void 0;
}
function un() {
	let e = (rn === "auto" ? ln(an) : rn) ?? "en";
	e !== on && (on = e, document.documentElement.dispatchEvent(new CustomEvent("homex-language-changed")), sn.forEach((e) => e()));
}
function dn(e) {
	let t = e?.locale?.language || e?.language;
	t && t !== an && (an = t, un());
}
function fn(e) {
	rn = e && (e === "auto" || ln(e)) ? e : "auto", un();
}
var pn = () => rn, mn = () => on, hn;
function gn(e) {
	return dn(e), hn ??= e.connection.sendMessagePromise({ type: "homex/settings/get" }).then((e) => fn(e.language)).catch(() => {
		hn = void 0;
	}), hn;
}
function S(e, t) {
	let n = nn[on][e] ?? nn.en[e] ?? e;
	return t && (n = n.replace(/\{(\w+)\}/g, (e, n) => n in t ? String(t[n]) : e)), n;
}
var _n = () => on, vn = (e = 28) => g`<svg viewBox="0 0 32 32" width=${e} height=${e} aria-hidden="true" class="homex-logo">
  <rect x="2" y="2" width="28" height="28" rx="8" fill="var(--homex-logo-plate, #fbfcfd)" stroke="var(--homex-logo-edge, #c9d1da)" stroke-width="1.5"></rect>
  <rect x="7" y="7" width="8" height="18" rx="2.5" fill="#f2b233"></rect>
  <rect x="17" y="7" width="8" height="18" rx="2.5" fill="none" stroke="var(--homex-logo-off, #556275)" stroke-width="1.5"></rect>
</svg>`, yn = "M10 1H22A9 9 0 0 1 31 10V22A9 9 0 0 1 22 31H10A9 9 0 0 1 1 22V10A9 9 0 0 1 10 1ZM10 3.5A6.5 6.5 0 0 0 3.5 10V22A6.5 6.5 0 0 0 10 28.5H22A6.5 6.5 0 0 0 28.5 22V10A6.5 6.5 0 0 0 22 3.5ZM9.5 7H12.5A2.5 2.5 0 0 1 15 9.5V22.5A2.5 2.5 0 0 1 12.5 25H9.5A2.5 2.5 0 0 1 7 22.5V9.5A2.5 2.5 0 0 1 9.5 7ZM19.5 6.5H22.5A3 3 0 0 1 25.5 9.5V22.5A3 3 0 0 1 22.5 25.5H19.5A3 3 0 0 1 16.5 22.5V9.5A3 3 0 0 1 19.5 6.5ZM19.75 8.75A1 1 0 0 0 18.75 9.75V22.25A1 1 0 0 0 19.75 23.25H22.25A1 1 0 0 0 23.25 22.25V9.75A1 1 0 0 0 22.25 8.75Z";
function bn() {
	let e = window;
	e.customIconsets = e.customIconsets || {}, e.customIconsets.homex ??= async () => ({
		path: yn,
		viewBox: "0 0 32 32"
	});
}
// src/types.ts
var xn = "homex-changed", C = (e) => e.dispatchEvent(new CustomEvent(xn, {
	bubbles: !0,
	composed: !0
})), Sn = async (e) => (await e.callWS({ type: "homex/layouts" })).layouts || [], Cn = (e, t) => e.callWS({
	type: "homex/layout/save",
	layout: t
}), wn = (e, t) => e.callWS({
	type: "homex/layout/delete",
	layout_id: t
}), Tn = async (e) => (await e.callWS({ type: "homex/switches" })).switches || [], En = (e, t, n = !1) => e.callWS({
	type: "homex/switch/save",
	switch: t,
	create: n
}), Dn = (e, t) => e.callWS({
	type: "homex/switch/remove",
	switch_id: t
}), On = async (e) => (await e.callWS({ type: "homex/presets" })).presets || [], kn = (e, t) => e.callWS({
	type: "homex/preset/save",
	preset: t
}), An = (e, t) => e.callWS({
	type: "homex/preset/delete",
	preset_id: t
}), jn = async (e) => (await e.callWS({ type: "homex/switch_models" })).models || [], Mn = async (e) => (await e.callWS({ type: "homex/switch_devices" })).devices || [], Nn = async (e) => (await e.callWS({ type: "homex/shutter_models" })).models || [], Pn = (e, t) => e.callWS({
	type: "homex/z2m/state",
	device_id: t
}), Fn = async (e) => (await e.callWS({ type: "homex/shutter_presets" })).presets || [], In = (e, t) => e.callWS({
	type: "homex/shutter_preset/save",
	preset: t
}), Ln = (e, t) => e.callWS({
	type: "homex/shutter_preset/delete",
	preset_id: t
}), Rn = async (e) => (await e.callWS({ type: "homex/rooms" })).rooms || [], zn = (e, t) => e.callWS({
	type: "homex/room/create",
	...t
}), Bn = (e, t) => e.callWS({
	type: "homex/rooms/import",
	rooms: t
}), Vn = (e, t, n = !0) => e.callWS({
	type: "homex/room/delete",
	entry_id: t,
	delete_scenes: n
}), Hn = (e, t, n) => e.callWS({
	type: "homex/shutter_group/add",
	entry_id: t,
	name: n
}), Un = (e, t) => e.callWS({
	type: "homex/shutter_group/update",
	...t
}), Wn = (e, t, n) => e.callWS({
	type: "homex/shutter_group/delete",
	entry_id: t,
	group_id: n
}), Gn = async (e, t) => (await e.callWS({
	type: "homex/device_triggers",
	device_id: t
})).triggers || [], Kn = (e, t) => e.callWS({
	type: "homex/room/update",
	...t
}), qn = (e, t) => e.callWS({
	type: "homex/room/sync_labels",
	entry_id: t
}), Jn = (e, t, n) => e.callWS({
	type: "homex/room/dim",
	entry_id: t,
	delta: n
}), Yn = (e, t, n, r) => e.callWS({
	type: "homex/room/shutter",
	entry_id: t,
	group_id: n,
	service: r
}), Xn = (e, t) => e.callWS({
	type: "homex/group/add",
	...t
}), Zn = (e, t) => e.callWS({
	type: "homex/group/update",
	...t
}), Qn = (e, t, n) => e.callWS({
	type: "homex/group/delete",
	entry_id: t,
	group_id: n
}), $n = (e, t, n, r, i) => e.callWS({
	type: "homex/scene/add",
	entry_id: t,
	name: n,
	...r ? { attach: r } : {},
	...i ? { triggers: i } : {}
}), er = (e, t, n) => e.callWS({
	type: "homex/scene/delete",
	entry_id: t,
	key: n
}), tr = (e, t, n) => e.callWS({
	type: "homex/scene/reorder",
	entry_id: t,
	order: n
}), nr = (e, t) => e.callWS({
	type: "homex/scene/next",
	entry_id: t
}), rr = (e, t, n, r, i) => e.callWS({
	type: "homex/scene/rename",
	entry_id: t,
	key: n,
	name: r,
	...i ? { triggers: i } : {}
}), w = (e) => e && (e.message || e.code) || String(e), ir = async (e) => e.callWS({ type: "homex/heating" }), ar = (e, t, n) => e.callWS({
	type: "homex/heating/preset/save",
	preset: t,
	create: n
}), or = (e, t) => e.callWS({
	type: "homex/heating/preset/delete",
	preset_id: t
}), sr = (e, t, n) => e.callWS({
	type: "homex/heating/group/save",
	group: t,
	create: n
}), cr = (e, t) => e.callWS({
	type: "homex/heating/group/delete",
	group_id: t
}), lr = async (e) => (await e.callWS({ type: "homex/heating/models" })).models || [], ur = async (e, t, n) => (await e.callWS({
	type: "homex/heating/device_preset/save",
	preset: t,
	create: n
})).results || [], dr = (e, t) => e.callWS({
	type: "homex/heating/device_preset/delete",
	preset_id: t
}), fr = async (e, t) => (await e.callWS({
	type: "homex/heating/device_preset/apply",
	preset_id: t
})).results || [], pr = (e, t, n) => e.callWS({
	type: "homex/heating/zone/save",
	zone: t,
	create: n
}), mr = (e, t) => e.callWS({
	type: "homex/heating/zone/delete",
	zone_id: t
}), hr = (e, t, n) => e.callWS({
	type: "homex/heating/zone/set_mode",
	zone_id: t,
	mode_id: n
}), gr = (e, t, n) => e.callWS({
	type: "homex/heating/room_zone",
	room_id: t,
	zone_id: n
}), _r = (e, t) => e.callWS({
	type: "homex/heating/enabled",
	enabled: t
}), vr = (e, t, n) => e.callWS({
	type: "homex/heating/system/save",
	system: t,
	create: n
}), yr = (e, t) => e.callWS({
	type: "homex/heating/system/delete",
	system_id: t
}), br = (e, t) => e.callWS({
	type: "homex/setup/shutter_plan",
	covers: t
}), xr = (e, t) => e.callWS({
	type: "homex/setup/switch_plan",
	...t ? { area_ids: t } : {}
}), Sr = null, Cr = () => !!customElements.get("ha-entities-picker");
function wr() {
	return Cr() ? Promise.resolve(!0) : Sr || (Sr = (async () => {
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
		return Cr();
	})(), Sr);
}
// src/lib/router.ts
var Tr = (e = "") => e.split("/").filter(Boolean).map(decodeURIComponent), T = (e, ...t) => [e.replace(/\/+$/, ""), ...t.filter(Boolean).map(encodeURIComponent)].join("/");
function E(e, t = !1) {
	t ? history.replaceState(history.state, "", e) : history.pushState({ homexFrom: location.pathname }, "", e), window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: t } }));
}
function D(e) {
	history.state?.homexFrom === e ? history.back() : E(e, !0);
}
function Er(e, t) {
	t && (t.metaKey || t.ctrlKey || t.shiftKey || t.button === 1) ? window.open(e, "_blank", "noopener") : (t?.preventDefault(), E(e));
}
// src/lib/device.ts
function Dr(e, t) {
	let n = (e.devices || {})[t];
	return n ? `${n.manufacturer || ""}|${n.model || n.model_id || ""}` : "";
}
function Or(e, t) {
	let n = (e.devices || {})[t];
	return n ? [n.manufacturer, n.model || n.model_id].filter(Boolean).join(" ") || S("lib.unknown_model") : "";
}
function kr(e, t, n) {
	let r = Dr(e, n);
	return r ? t.filter((e) => e.model === r) : [];
}
function Ar(e, t, n) {
	let r = kr(e, t, n.device_id);
	if (n.preset_id) {
		let e = r.find((e) => e.id === n.preset_id);
		if (e) return e;
	}
	return r[0];
}
// src/lib/climate.ts
function jr(e, t) {
	return Object.values(e.entities || {}).filter((e) => e.device_id === t && e.entity_id.startsWith("climate.")).map((e) => e.entity_id).sort((e, t) => e.length - t.length)[0];
}
var Mr = .5;
function Nr(e) {
	let t = e?.attributes ?? {}, n = Number(t.temperature), r = Number(t.current_temperature);
	return t.hvac_action === "heating" && t.temperature != null && t.current_temperature != null && !Number.isNaN(n) && !Number.isNaN(r) && r >= n + Mr;
}
function Pr(e, t) {
	return (t.heating?.radiators ?? []).flatMap((t) => {
		let n = jr(e, t.device_id), r = n ? e.states[n] : void 0;
		if (!Nr(r)) return [];
		let i = e.devices?.[t.device_id];
		return [i?.name_by_user || i?.name || r.attributes?.friendly_name || n];
	});
}
function Fr(e, t) {
	let n = Pr(e, t);
	return n.length ? S("lib.stuck_warning", { names: n.join(", ") }) : "";
}
function Ir(e, t) {
	return (t.heating?.radiators ?? []).some((t) => {
		let n = jr(e, t.device_id);
		return !!n && e.states[n]?.attributes?.hvac_action === "heating";
	});
}
function Lr(e, t) {
	let n = Object.values(e.states || {}).filter((e) => e.entity_id.startsWith("select.homex_heating_")), r = n.find((e) => (e.attributes?.rooms ?? []).includes(t.room_id)) ?? n.find((e) => e.attributes?.zone_id === "default");
	if (!r || r.state === "unavailable" || r.state === "unknown") return;
	let i = String(r.attributes?.zone_name ?? r.attributes?.zone_id ?? "");
	return t.heating?.enabled === !1 ? {
		zone: i,
		mode: r.attributes?.modes?.unheated ?? S("lib.unheated"),
		own: !0
	} : {
		zone: i,
		mode: r.state,
		own: !1
	};
}
// src/lib/shutter.ts
var Rr = {
	open: Rt,
	closed: It,
	partial: At,
	opening: et,
	closing: Qe,
	unavailable: Lt
}, zr = (e) => S(`lib.shutter_${e}`);
function Br(e, t) {
	let n = e.states[t];
	if (!n) return null;
	let r = n.attributes?.current_position;
	return typeof r == "number" ? r : n.state === "open" ? 100 : n.state === "closed" ? 0 : null;
}
function Vr(e, t) {
	let n = t.map((t) => e.states[t]).filter((e) => e && e.state !== "unavailable" && e.state !== "unknown"), r = n.map((t) => Br(e, t.entity_id)).filter((e) => e !== null), i = r.length ? Math.round(r.reduce((e, t) => e + t, 0) / r.length) : null, a = n.length ? n.some((e) => e.state === "opening") ? "opening" : n.some((e) => e.state === "closing") ? "closing" : r.every((e) => e === 0) ? "closed" : r.every((e) => e === 100) ? "open" : "partial" : "unavailable";
	return {
		state: a,
		position: i,
		icon: Rr[a],
		label: zr(a)
	};
}
function Hr(e) {
	let t = (e.shutter_groups ?? []).filter((e) => e.devices?.length);
	return t.find((e) => !e.removable) ?? t[0];
}
// src/lib/styles.ts
var O = o`
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
function k(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/components/homex-unit-controls.ts
var Ur = class extends v {
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
		let e = this.unit, t = this._isOn(e.switch), n = this._lightState(t), r = n === "lit" ? this.activeScene ? S("unitControls.lit_scene_turn_off", { scene: this.activeScene }) : S("unitControls.lit_turn_off") : S(n === "stray" ? "unitControls.stray_turn_on" : "unitControls.turn_on");
		return h`
      <div class="controls">
        ${this.hideToggle ? "" : h`<button
              class="bulb ${t ? "on" : ""}"
              title=${r}
              @click=${this._toggle}
            >
              <svg viewBox="0 0 24 24">
                <path
                  d=${n === "lit" ? yt : n === "stray" ? gt : bt}
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
}, Wr = (Ur.styles = [O, o`
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
    `], Ur);
k([b({ attribute: !1 })], Wr.prototype, "hass", void 0), k([b({ attribute: !1 })], Wr.prototype, "unit", void 0), k([b({ attribute: !1 })], Wr.prototype, "areaIcon", void 0), k([b({ attribute: !1 })], Wr.prototype, "floorName", void 0), k([b({ attribute: !1 })], Wr.prototype, "activeScene", void 0), k([b({ type: Boolean })], Wr.prototype, "hideToggle", void 0), k([b({ type: Boolean })], Wr.prototype, "hideId", void 0), k([b({ attribute: !1 })], Wr.prototype, "info", void 0), Wr = k([y("homex-unit-controls")], Wr);
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
</span>`, Gr = /[̀-ͯ]/g, M = (e) => (e || "").normalize("NFD").replace(Gr, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""), Kr = class extends v {
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
            <button class="x" title=${S("common.close")} @click=${this._close}>×</button>
          </header>
          <div class="content"><slot></slot></div>
          <div class="footer"><slot name="actions"></slot></div>
        </div>
      </div>
    ` : h``;
	}
}, qr = (Kr.styles = o`
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
  `, Kr);
k([b({ type: Boolean })], qr.prototype, "open", void 0), k([b()], qr.prototype, "heading", void 0), k([b({
	type: Boolean,
	reflect: !0
})], qr.prototype, "compact", void 0), qr = k([y("homex-dialog")], qr);
// node_modules/lit-html/directives/repeat.js
var Jr = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, Yr = Ht(class extends Ut {
	constructor(e) {
		if (super(e), e.type !== Vt.CHILD) throw Error("repeat() can only be used in text expressions");
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
		let i = Zt(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, u, d = 0, f = i.length - 1, p = 0, m = a.length - 1;
		for (; d <= f && p <= m;) if (i[d] === null) d++;
		else if (i[f] === null) f--;
		else if (s[d] === o[p]) c[p] = Jt(i[d], a[p]), d++, p++;
		else if (s[f] === o[m]) c[m] = Jt(i[f], a[m]), f--, m--;
		else if (s[d] === o[m]) c[m] = Jt(i[d], a[m]), qt(e, c[m + 1], i[d]), d++, m--;
		else if (s[f] === o[p]) c[p] = Jt(i[f], a[p]), qt(e, i[d], i[f]), f--, p++;
		else if (l === void 0 && (l = Jr(o, p, m), u = Jr(s, d, f)), l.has(s[d])) {
			if (l.has(s[f])) {
				let t = u.get(o[p]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = qt(e, i[d]);
					Jt(t, a[p]), c[p] = t;
				} else c[p] = Jt(n, a[p]), qt(e, i[d], n), i[t] = null;
				p++;
			} else Qt(i[f]), f--;
		} else Qt(i[d]), d++;
		for (; p <= m;) {
			let t = qt(e, c[m + 1]);
			Jt(t, a[p]), c[p++] = t;
		}
		for (; d <= f;) {
			let e = i[d++];
			e !== null && Qt(e);
		}
		return this.ut = o, Xt(e, c), je;
	}
}), Xr = class extends v {
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
        ${Yr(this.value, (e) => e, (e, t) => this._nativePicker(e, this.value.filter((e, n) => n !== t), (e) => this._setAt(t, e)))}
        ${$t(this.value.length, this._nativePicker("", this.value, (e) => this._addNew(e)))}
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
                title=${S("entityPicker.remove")}
                @click=${() => this._remove(e)}
              >
                ×</button
              ></span
            >`)}
      </div>
      <input
        .value=${this._query}
        placeholder=${S("entityPicker.search")}
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
                  </div>`) : h`<div class="sugg empty">${S("entityPicker.no_entity")}</div>`}
          </div>` : ""}
    `;
	}
}, Zr = (Xr.styles = o`
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
  `, Xr);
k([b({ attribute: !1 })], Zr.prototype, "hass", void 0), k([b({ type: Array })], Zr.prototype, "value", void 0), k([b({ attribute: !1 })], Zr.prototype, "includeDomains", void 0), k([b({ attribute: !1 })], Zr.prototype, "includeEntities", void 0), k([x()], Zr.prototype, "_query", void 0), k([x()], Zr.prototype, "_open", void 0), Zr = k([y("homex-entity-picker")], Zr);
// src/lib/domains.ts
var Qr = [
	"light",
	"switch",
	"input_boolean"
], $r = [
	"binary_sensor",
	"switch",
	"input_boolean",
	"person",
	"device_tracker"
], ei = class extends v {
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
        <button class="clear" title=${S("deviceField.clear")} @click=${() => this._emit("")}>×</button>
      </div>` : h`
      <input
        .value=${this._query}
        placeholder=${S("deviceField.search")}
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
                    </div>`) : h`<div class="sugg">${S("deviceField.no_device")}</div>`}
          </div>` : ""}
    `;
	}
}, ti = (ei.styles = o`
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
  `, ei);
k([b({ attribute: !1 })], ti.prototype, "hass", void 0), k([b()], ti.prototype, "value", void 0), k([x()], ti.prototype, "_query", void 0), k([x()], ti.prototype, "_open", void 0), ti = k([y("homex-device-field")], ti);
// src/components/homex-select.ts
var ni, ri = 320, N = (ni = class extends v {
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
		let e = this.renderRoot.querySelector(".trigger").getBoundingClientRect(), t = window.innerHeight - e.bottom, n = t < Math.min(ri, 220) && e.top > t;
		this._pos = {
			left: `${e.left}px`,
			width: `${e.width}px`,
			...n ? {
				bottom: `${window.innerHeight - e.top + 6}px`,
				maxHeight: `${Math.min(ri, e.top - 12)}px`
			} : {
				top: `${e.bottom + 6}px`,
				maxHeight: `${Math.min(ri, t - 12)}px`
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
        <svg class="chevron" viewBox="0 0 24 24"><path d=${rt}></path></svg>
      </button>
      ${this._open ? h`<div class="panel" role="listbox" style=${t}>
            ${this.placeholder ? this._renderOption(this._none) : _}
            ${this.options.map((e) => this._renderOption(e))}
            ${this.groups.map((e) => h`<div class="group">${e.label}</div>
                ${e.options.map((e) => this._renderOption(e))}`)}
            ${this._flat.length ? _ : h`<div class="empty">${S("select.no_option")}</div>`}
          </div>` : _}
    `;
	}
}, ni.styles = o`
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
      max-height: ${ri}px;
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
  `, ni);
k([b()], N.prototype, "value", void 0), k([b()], N.prototype, "label", void 0), k([b()], N.prototype, "placeholder", void 0), k([b({ attribute: !1 })], N.prototype, "options", void 0), k([b({ attribute: !1 })], N.prototype, "groups", void 0), k([b({
	type: Boolean,
	reflect: !0
})], N.prototype, "disabled", void 0), k([x()], N.prototype, "_open", void 0), k([x()], N.prototype, "_active", void 0), k([x()], N.prototype, "_pos", void 0), N = k([y("homex-select")], N);
// src/components/homex-trigger-selector.ts
var ii = class extends v {
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
				let t = await Gn(this.hass, e);
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
        .includeDomains=${$r}
        allow-custom-entity
        @value-changed=${(e) => {
			e.stopPropagation(), r(e.detail.value || "");
		}}
      ></ha-entity-picker>`;
		let i = Object.keys(this.hass.states).filter((e) => $r.includes(e.split(".")[0])).sort();
		return h`<homex-select
      placeholder=${S("triggerSelector.select_entity")}
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
		let n = this._entityType(e);
		return h`<label class="field"><span>${S("triggerSelector.type")}</span>
      <homex-select
        .value=${n}
        .options=${[{
			value: "state",
			label: S("triggerSelector.type_state")
		}, {
			value: "numeric",
			label: S("triggerSelector.type_numeric")
		}]}
        @value-changed=${(n) => this._setEntityType(t, e, n.detail.value)}
      ></homex-select>
    </label>`;
	}
	_attrField(e, t) {
		let n = this._entityOf(e), r = Object.keys(this.hass.states[n]?.attributes || {}), i = e.attribute || "";
		return h`<label class="field"><span>${S("triggerSelector.attribute")}</span>
      <homex-select
        placeholder=${S("triggerSelector.attribute_none")}
        .value=${i}
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
		return h`<label class="field"><span>${S("triggerSelector.for")}</span>
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
      ${n ? h`${this._numField(e, t, "above", S("triggerSelector.above"))}
            ${this._numField(e, t, "below", S("triggerSelector.below"))}` : h`${this._stateValueField(e, t, "from", S("triggerSelector.from"))}
            ${this._stateValueField(e, t, "to", S("triggerSelector.to"))}`}
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
      placeholder=${S("triggerSelector.select_action")}
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
        <svg viewBox="0 0 24 24"><path d=${n ? st : jt}></path></svg>
        <span class="title">${S(n ? "triggerSelector.device" : "triggerSelector.entity")}</span>
        <button class="icon-btn" title=${S("common.delete")} @click=${() => this._remove(t)}>
          <svg viewBox="0 0 24 24"><path d=${at}></path></svg>
        </button>
      </div>
      <div class="body">
        ${n ? h`<label class="field"><span>${S("triggerSelector.device")}</span>${this._deviceField(e, t)}</label>
              ${e.device_id ? h`<label class="field"><span>${S("triggerSelector.action")}</span>${this._actionField(e, t)}</label>` : ""}` : h`<label class="field"><span>${S("triggerSelector.entity")}</span>${this._entityField(e, t)}</label>
              ${this._entityBody(e, t)}`}
      </div>
    </div>`;
	}
	render() {
		return h`
      ${this.value.map((e, t) => this._card(e, t))}
      <div class="add-wrap">
        <button class="add-btn" @click=${() => this._menuOpen = !this._menuOpen}>
          <svg viewBox="0 0 24 24"><path d=${Et}></path></svg>
          ${S("triggerSelector.add_trigger")}
        </button>
        ${this._menuOpen ? h`
              <div class="backdrop" @click=${() => this._menuOpen = !1}></div>
              <div class="menu">
                <button @click=${() => this._add("entity")}>
                  <svg viewBox="0 0 24 24"><path d=${jt}></path></svg> ${S("triggerSelector.entity")}
                </button>
                <button @click=${() => this._add("device")}>
                  <svg viewBox="0 0 24 24"><path d=${st}></path></svg> ${S("triggerSelector.device")}
                </button>
              </div>
            ` : ""}
      </div>
    `;
	}
}, ai = (ii.styles = o`
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
  `, ii);
k([b({ attribute: !1 })], ai.prototype, "hass", void 0), k([b({ attribute: !1 })], ai.prototype, "value", void 0), k([x()], ai.prototype, "_menuOpen", void 0), k([x()], ai.prototype, "_devTriggers", void 0), ai = k([y("homex-trigger-selector")], ai);
// src/components/homex-managed-triggers.ts
var oi = class extends v {
	constructor(...e) {
		super(...e), this.triggers = [];
	}
	render() {
		return this.triggers?.length ? h`<div class="list">
      ${this.triggers.map((e) => h`<div class="row">
          <span class="icon">🎛</span>
          <span class="lbl">${e}</span>
          <span class="tag">${S("managedTriggers.managed_by_switches")}</span>
        </div>`)}
    </div>` : h``;
	}
}, si = (oi.styles = o`
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
  `, oi);
k([b({ attribute: !1 })], si.prototype, "triggers", void 0), si = k([y("homex-managed-triggers")], si);
// src/components/homex-group-dialog.ts
var ci = class extends v {
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
			alert(S("groupDialog.name_id_required"));
			return;
		}
		let n = this._triggers, r = {
			dim: this._dim,
			dim_up_triggers: this._dim ? this._dimUp : [],
			dim_down_triggers: this._dim ? this._dimDown : []
		};
		this._busy = !0;
		try {
			this.group ? await Zn(this.hass, {
				entry_id: this.room.entry_id,
				group_id: this.group.group_id,
				name: e,
				devices: this._devices,
				triggers: n,
				...r
			}) : await Xn(this.hass, {
				entry_id: this.room.entry_id,
				group_id: t,
				name: e,
				devices: this._devices,
				triggers: n,
				...r
			}), C(this), this._close();
		} catch (e) {
			this._busy = !1, alert(S("common.error", { message: w(e) }));
		}
	}
	async _delete() {
		if (this.group && confirm(S("groupDialog.confirm_delete", { name: this.group.name || this.group.group_id }))) {
			this._busy = !0;
			try {
				await Qn(this.hass, this.room.entry_id, this.group.group_id), C(this), this._close();
			} catch (e) {
				this._busy = !1, alert(S("common.error", { message: w(e) }));
			}
		}
	}
	render() {
		let e = !!this.group;
		return h`
      <homex-dialog
        .open=${this.open}
        heading=${S(e ? "groupDialog.heading_edit" : "groupDialog.heading_new")}
        @dialog-closed=${this._close}
      >
        ${A(S("groupDialog.name"), this._name, (e) => this._onName(e), S("groupDialog.name_placeholder"))}
        ${e ? h`<div class="section">${S("groupDialog.id_label", { id: this.group.group_id })}</div>` : A(S("groupDialog.id"), this._id, (e) => this._onId(e), "bedside_l")}
        <div class="section">${S("groupDialog.devices")}</div>
        <homex-entity-picker
          .hass=${this.hass}
          .includeEntities=${this.room.devices}
          .value=${this._devices}
          @value-changed=${(e) => this._devices = e.detail.value}
        ></homex-entity-picker>
        <label class="dim-toggle">
          <span class="dim-name">${S("groupDialog.enable_dim")}</span>
          <span class="toggle ${this._dim ? "on" : ""}">
            <input
              type="checkbox"
              .checked=${this._dim}
              @change=${(e) => this._dim = e.target.checked}
            />
            <span class="knob"></span>
          </span>
        </label>
        <div class="section">${S("groupDialog.triggers")}</div>
        <homex-trigger-selector
          .hass=${this.hass}
          .value=${this._triggers}
          @value-changed=${(e) => this._triggers = e.detail.value}
        ></homex-trigger-selector>
        ${e ? h`<homex-managed-triggers
              .triggers=${this.room?.switch_triggers?.groups?.[this.group.group_id] ?? []}
            ></homex-managed-triggers>` : ""}

        
        ${this._dim ? h`
              <div class="section">${S("groupDialog.dim_up_title")}</div>
              <p class="hint">${S("groupDialog.dim_up_hint")}</p>
              <homex-trigger-selector
                .hass=${this.hass}
                .value=${this._dimUp}
                @value-changed=${(e) => this._dimUp = e.detail.value}
              ></homex-trigger-selector>
              <div class="section">${S("groupDialog.dim_down_title")}</div>
              <p class="hint">${S("groupDialog.dim_down_hint")}</p>
              <homex-trigger-selector
                .hass=${this.hass}
                .value=${this._dimDown}
                @value-changed=${(e) => this._dimDown = e.detail.value}
              ></homex-trigger-selector>
            ` : ""}

        <span slot="actions">
          ${e ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
                ${S("common.delete")}
              </button>` : ""}
          <button @click=${this._close}>${S("common.cancel")}</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            ${S(e ? "common.save" : "groupDialog.create")}
          </button>
        </span>
      </homex-dialog>
    `;
	}
}, P = (ci.styles = [O, o`
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
    `], ci);
k([b({ attribute: !1 })], P.prototype, "hass", void 0), k([b({ type: Boolean })], P.prototype, "open", void 0), k([b({ attribute: !1 })], P.prototype, "room", void 0), k([b({ attribute: !1 })], P.prototype, "group", void 0), k([x()], P.prototype, "_name", void 0), k([x()], P.prototype, "_id", void 0), k([x()], P.prototype, "_devices", void 0), k([x()], P.prototype, "_triggers", void 0), k([x()], P.prototype, "_dim", void 0), k([x()], P.prototype, "_dimUp", void 0), k([x()], P.prototype, "_dimDown", void 0), k([x()], P.prototype, "_busy", void 0), P = k([y("homex-group-dialog")], P);
// src/components/homex-group-row.ts
var li = class extends v {
	constructor(...e) {
		super(...e), this._open = !1, this._openScene = (e) => Er(e.currentTarget.getAttribute("href"), e);
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
          title=${S("groupRow.edit_on_scene")}
        >
          <svg viewBox="0 0 24 24"><path d=${vt}></path></svg>
        </a>
        <a
          class="scene-link"
          href="/config/scene/edit/homex_${e}_turn_off"
          @click=${this._openScene}
          title=${S("groupRow.edit_off_scene")}
        >
          <svg viewBox="0 0 24 24"><path d=${_t}></path></svg>
        </a>
        <button title=${S("groupRow.configure")} @click=${() => this._open = !0}>
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
}, ui = (li.styles = [O, o`
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
    `], li);
k([b({ attribute: !1 })], ui.prototype, "hass", void 0), k([b({ attribute: !1 })], ui.prototype, "room", void 0), k([b({ attribute: !1 })], ui.prototype, "group", void 0), k([x()], ui.prototype, "_open", void 0), ui = k([y("homex-group-row")], ui);
// src/components/homex-room-dialog.ts
var di = class extends v {
	constructor(...e) {
		super(...e), this.open = !1, this.room = null, this._name = "", this._id = "", this._areaId = "", this._modules = ["lights"], this._devices = [], this._strategy = "recall_first", this._busy = !1, this._zones = [], this._zoneId = "default", this._initialZone = "default", this._idEdited = !1;
	}
	willUpdate(e) {
		e.has("open") && this.open && (this._name = this.room?.name ?? "", this._id = this.room?.room_id ?? "", this._areaId = this.room?.area_id ?? "", this._modules = [...this.room?.modules ?? ["lights"]], this._devices = this.room?.devices ?? [], this._strategy = this.room?.scene_strategy ?? "recall_first", this._busy = !1, this._idEdited = !!this.room, this._loadZones());
	}
	async _loadZones() {
		try {
			this._zones = (await ir(this.hass)).zones ?? [];
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
		if (!e || !t) alert(S("roomDialog.name_id_required"));
		else {
			this._busy = !0;
			try {
				let n = this._areaId || null;
				this.room ? await Kn(this.hass, {
					entry_id: this.room.entry_id,
					name: e,
					room_id: t,
					area_id: n,
					modules: this._modules,
					devices: this._devices,
					scene_strategy: this._strategy
				}) : await zn(this.hass, {
					name: e,
					room_id: t,
					area_id: n,
					modules: this._modules,
					devices: this._devices,
					scene_strategy: this._strategy
				}), this._hasModule("heating") && this._zoneId !== this._initialZone && await gr(this.hass, t, this._zoneId), C(this), this._close();
			} catch (e) {
				this._busy = !1, alert(S("common.error", { message: w(e) }));
			}
		}
	}
	render() {
		let e = !!this.room;
		return h`
      <homex-dialog
        .open=${this.open}
        heading=${S(e ? "roomDialog.heading_edit" : "roomDialog.heading_new")}
        @dialog-closed=${this._close}
      >
        ${A(S("roomDialog.name"), this._name, (e) => this._onName(e), S("roomDialog.name_placeholder"))}
        ${A(S("roomDialog.id"), this._id, (e) => this._onId(e), "bedroom")}
        <div class="section">${S("roomDialog.area")}</div>
        <homex-select
          placeholder=${S("roomDialog.area_none")}
          .value=${this._areaId}
          .options=${this._areas.map((e) => ({
			value: e.area_id,
			label: e.name
		}))}
          @value-changed=${(e) => this._areaId = e.detail.value}
        ></homex-select>

        <div class="section">${S("roomDialog.modules")}</div>
        ${this._moduleRow("lights", "💡", S("roomDialog.module_lights"), S("roomDialog.module_lights_hint"))}
        ${this._moduleRow("switches", "🎛", S("roomDialog.module_switches"), S("roomDialog.module_switches_hint"))}
        ${this._moduleRow("shutters", "🪟", S("roomDialog.module_shutters"), S("roomDialog.module_shutters_hint"))}
        ${this._moduleRow("heating", "🔥", S("roomDialog.module_climate"), S("roomDialog.module_climate_hint"))}

        ${this._hasModule("lights") ? h`
              <div class="tab">${S("roomDialog.module_lights")}</div>
              <div class="section">${S("roomDialog.lights_devices")}</div>
              <homex-entity-picker
                .hass=${this.hass}
                .includeDomains=${Qr}
                .value=${this._devices}
                @value-changed=${(e) => this._devices = e.detail.value}
              ></homex-entity-picker>

              <div class="section">${S("roomDialog.strategy")}</div>
              <homex-select
                .value=${this._strategy}
                .options=${[{
			value: "recall_first",
			label: S("roomDialog.strategy_first"),
			secondary: S("roomDialog.strategy_first_hint")
		}, {
			value: "recall_last",
			label: S("roomDialog.strategy_last"),
			secondary: S("roomDialog.strategy_last_hint")
		}]}
                @value-changed=${(e) => this._strategy = e.detail.value}
              ></homex-select>
              <p class="hint">${S("roomDialog.strategy_hint")}</p>
            ` : ""}

        ${this._hasModule("heating") ? h`
              <div class="tab">${S("roomDialog.module_climate")}</div>
              <div class="section">${S("roomDialog.heating_zone")}</div>
              <homex-select
                .value=${this._zoneId}
                .options=${this._zones.map((e) => ({
			value: e.id,
			label: e.name,
			secondary: e.id === "default" ? S("roomDialog.zone_default_hint") : void 0
		}))}
                @value-changed=${(e) => this._zoneId = e.detail.value}
              ></homex-select>
              <p class="hint">${S("roomDialog.climate_hint")}</p>
            ` : ""}

        <span slot="actions">
          <button @click=${this._close}>${S("common.cancel")}</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            ${S(e ? "common.save" : "roomDialog.create")}
          </button>
        </span>
      </homex-dialog>
    `;
	}
}, F = (di.styles = [O, o`
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
    `], di);
k([b({ attribute: !1 })], F.prototype, "hass", void 0), k([b({ type: Boolean })], F.prototype, "open", void 0), k([b({ attribute: !1 })], F.prototype, "room", void 0), k([x()], F.prototype, "_name", void 0), k([x()], F.prototype, "_id", void 0), k([x()], F.prototype, "_areaId", void 0), k([x()], F.prototype, "_modules", void 0), k([x()], F.prototype, "_devices", void 0), k([x()], F.prototype, "_strategy", void 0), k([x()], F.prototype, "_busy", void 0), k([x()], F.prototype, "_zones", void 0), k([x()], F.prototype, "_zoneId", void 0), F = k([y("homex-room-dialog")], F);
// src/components/homex-triggers-dialog.ts
var fi = class extends v {
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
			await Kn(this.hass, {
				entry_id: this.room.entry_id,
				triggers: this._toggle,
				scene_triggers: this._scene,
				dim_up_triggers: this._dimUp,
				dim_down_triggers: this._dimDown
			}), C(this), this._close();
		} catch (e) {
			this._busy = !1, alert(S("common.error", { message: w(e) }));
		}
	}
	render() {
		return h`
      <homex-dialog
        .open=${this.open}
        heading=${S("triggersDialog.heading")}
        @dialog-closed=${this._close}
      >
        ${this._hasLights ? h`
              <div class="group">
                <div class="section">${S("triggersDialog.toggle_title")}</div>
                <p class="hint">${S("triggersDialog.toggle_hint")}</p>
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
                <div class="section">${S("triggersDialog.scene_title")}</div>
                <p class="hint">${S("triggersDialog.scene_hint")}</p>
                <homex-trigger-selector
                  .hass=${this.hass}
                  .value=${this._scene}
                  @value-changed=${(e) => this._scene = e.detail.value}
                ></homex-trigger-selector>
                <homex-managed-triggers
                  .triggers=${this.room?.switch_triggers?.scene_next ?? []}
                ></homex-managed-triggers>
                <p class="hint">${S("triggersDialog.scene_strategy_hint")}</p>
              </div>

              <div class="group">
                <div class="section">${S("triggersDialog.dim_up_title")}</div>
                <p class="hint">${S("triggersDialog.dim_up_hint")}</p>
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
                <div class="section">${S("triggersDialog.dim_down_title")}</div>
                <p class="hint">${S("triggersDialog.dim_down_hint")}</p>
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
          <button @click=${this._close}>${S("common.cancel")}</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            ${S("common.save")}
          </button>
        </span>
      </homex-dialog>
    `;
	}
}, pi = (fi.styles = [O, o`
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
    `], fi);
k([b({ attribute: !1 })], pi.prototype, "hass", void 0), k([b({ type: Boolean })], pi.prototype, "open", void 0), k([b({ attribute: !1 })], pi.prototype, "room", void 0), k([x()], pi.prototype, "_toggle", void 0), k([x()], pi.prototype, "_scene", void 0), k([x()], pi.prototype, "_dimUp", void 0), k([x()], pi.prototype, "_dimDown", void 0), k([x()], pi.prototype, "_busy", void 0), pi = k([y("homex-triggers-dialog")], pi);
// src/components/homex-scene-dialog.ts
var mi = class extends v {
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
			if (!this.scene && this._mode === "attach" && !this._attachId) alert(S("sceneDialog.pick_scene_required"));
			else {
				this._busy = !0;
				try {
					this.scene ? await rr(this.hass, this.room.entry_id, this.scene.key, e, this._triggers) : this._mode === "attach" ? await $n(this.hass, this.room.entry_id, e, this._attachId, this._triggers) : await $n(this.hass, this.room.entry_id, e, void 0, this._triggers), C(this), this._close();
				} catch (e) {
					this._busy = !1, alert(S("common.error", { message: w(e) }));
				}
			}
		}
	}
	render() {
		let e = !!this.scene, t = this._nameTaken, n = !!this._name.trim() && !t;
		return h`
      <homex-dialog
        .open=${this.open}
        heading=${S(e ? "sceneDialog.heading_rename" : "sceneDialog.heading_new")}
        @dialog-closed=${this._close}
      >
        ${A(S("sceneDialog.name"), this._name, (e) => this._name = e, S("sceneDialog.name_placeholder"))}
        ${t ? h`<div class="err">${S("sceneDialog.name_taken")}</div>` : ""}
        ${e ? "" : this._renderModePicker()}
        <div class="section">${S("sceneDialog.triggers")}</div>
        <homex-trigger-selector
          .hass=${this.hass}
          .value=${this._triggers}
          @value-changed=${(e) => this._triggers = e.detail.value}
        ></homex-trigger-selector>
        ${e ? h`<homex-managed-triggers
              .triggers=${this.room?.switch_triggers?.scenes?.[this.scene.key] ?? []}
            ></homex-managed-triggers>` : ""}
        <span slot="actions">
          <button @click=${this._close}>${S("common.cancel")}</button>
          <button class="primary" ?disabled=${this._busy || !n} @click=${this._save}>
            ${e ? S("common.rename") : this._mode === "attach" ? S("sceneDialog.attach") : S("sceneDialog.create")}
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
          ${S("sceneDialog.mode_new")}
        </button>
        <button
          class=${this._mode === "attach" ? "active" : ""}
          @click=${() => this._mode = "attach"}
        >
          ${S("sceneDialog.mode_attach")}
        </button>
      </div>
      ${this._mode === "new" ? h`<div class="section">${S("sceneDialog.new_hint")}</div>` : h`
            <div class="section">${S("sceneDialog.attach_hint")}</div>
            <homex-select
              placeholder=${S("sceneDialog.pick_scene")}
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
}, I = (mi.styles = [O, o`
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
    `], mi);
k([b({ attribute: !1 })], I.prototype, "hass", void 0), k([b({ type: Boolean })], I.prototype, "open", void 0), k([b({ attribute: !1 })], I.prototype, "room", void 0), k([b({ attribute: !1 })], I.prototype, "scene", void 0), k([x()], I.prototype, "_name", void 0), k([x()], I.prototype, "_mode", void 0), k([x()], I.prototype, "_attachId", void 0), k([x()], I.prototype, "_triggers", void 0), k([x()], I.prototype, "_busy", void 0), I = k([y("homex-scene-dialog")], I);
// src/components/homex-shutter-group-dialog.ts
var hi = class extends v {
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
		if (!e) alert(S("shutterGroupDialog.name_required"));
		else {
			this._busy = !0;
			try {
				let t = this.group?.id;
				t ||= (await Hn(this.hass, this.room.entry_id, e))?.group_id, await Un(this.hass, {
					entry_id: this.room.entry_id,
					group_id: t,
					name: e,
					devices: this._devices,
					toggle_triggers: this._toggle,
					open_triggers: this._openT,
					close_triggers: this._close,
					stop_triggers: this._stop
				}), C(this), this._close_();
			} catch (e) {
				this._busy = !1, alert(S("common.error", { message: w(e) }));
			}
		}
	}
	async _delete() {
		if (this.group && confirm(S("shutterGroupDialog.confirm_delete", { name: this.group.name }))) {
			this._busy = !0;
			try {
				await Wn(this.hass, this.room.entry_id, this.group.id), C(this), this._close_();
			} catch (e) {
				this._busy = !1, alert(S("common.error", { message: w(e) }));
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
        heading=${S(e ? "shutterGroupDialog.edit_heading" : "shutterGroupDialog.new_heading")}
        @dialog-closed=${this._close_}
      >
        ${A(S("shutterGroupDialog.name"), this._name, (e) => this._name = e, S("shutterGroupDialog.name_placeholder"))}
        <div class="section">${S("shutterGroupDialog.covers")}</div>
        <homex-entity-picker
          .hass=${this.hass}
          .includeDomains=${["cover"]}
          .value=${this._devices}
          @value-changed=${(e) => this._devices = e.detail.value}
        ></homex-entity-picker>

        <div class="section">${S("shutterGroupDialog.triggers")}</div>
        <p class="hint">${S("shutterGroupDialog.triggers_hint")}</p>
        ${this._trigGroup(S("shutterGroupDialog.toggle"), this._toggle, (e) => this._toggle = e)}
        ${this._trigGroup(S("shutterGroupDialog.open"), this._openT, (e) => this._openT = e)}
        ${this._trigGroup(S("shutterGroupDialog.close"), this._close, (e) => this._close = e)}
        ${this._trigGroup(S("shutterGroupDialog.stop"), this._stop, (e) => this._stop = e)}

        <span slot="actions">
          ${t ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
                ${S("common.delete")}
              </button>` : ""}
          <button @click=${this._close_}>${S("common.cancel")}</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            ${S(e ? "common.save" : "shutterGroupDialog.create_group")}
          </button>
        </span>
      </homex-dialog>
    `;
	}
}, L = (hi.styles = [O, o`
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
    `], hi);
k([b({ attribute: !1 })], L.prototype, "hass", void 0), k([b({ type: Boolean })], L.prototype, "open", void 0), k([b({ attribute: !1 })], L.prototype, "room", void 0), k([b({ attribute: !1 })], L.prototype, "group", void 0), k([x()], L.prototype, "_name", void 0), k([x()], L.prototype, "_devices", void 0), k([x()], L.prototype, "_toggle", void 0), k([x()], L.prototype, "_openT", void 0), k([x()], L.prototype, "_close", void 0), k([x()], L.prototype, "_stop", void 0), k([x()], L.prototype, "_busy", void 0), L = k([y("homex-shutter-group-dialog")], L);
// src/components/homex-shutter-control-dialog.ts
var gi = class extends v {
	constructor(...e) {
		super(...e), this.open = !1, this._groupId = "", this._busy = !1;
	}
	willUpdate(e) {
		e.has("open") && this.open && (this._groupId = Hr(this.room)?.id ?? "");
	}
	get _groups() {
		return (this.room.shutter_groups ?? []).filter((e) => e.devices?.length);
	}
	async _run(e) {
		this._busy = !0;
		try {
			await Yn(this.hass, this.room.entry_id, this._groupId, e);
		} catch (e) {
			alert(S("common.error", { message: w(e) }));
		} finally {
			this._busy = !1;
		}
	}
	async _runOne(e, t) {
		try {
			await this.hass.callService("cover", t, { entity_id: e });
		} catch (e) {
			alert(S("common.error", { message: w(e) }));
		}
	}
	_close() {
		this.dispatchEvent(new CustomEvent("dialog-closed"));
	}
	render() {
		if (!this.open) return h``;
		let e = this._groups, t = e.find((e) => e.id === this._groupId) ?? e[0], n = t?.devices ?? [], r = Vr(this.hass, n);
		return h`
      <homex-dialog
        compact
        .open=${this.open}
        .heading=${S("shutterControlDialog.heading", { room: this.room.name })}
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
              ${r.position === null ? "" : S("shutterControlDialog.avg_position", { position: r.position })}
            </div>
          </div>
        </div>
        <div class="controls">
          <button ?disabled=${this._busy || !t} @click=${() => this._run("open_cover")}>
            <svg viewBox="0 0 24 24"><path d=${$e}></path></svg>${S("shutterControlDialog.open")}
          </button>
          <button ?disabled=${this._busy || !t} @click=${() => this._run("stop_cover")}>
            <svg viewBox="0 0 24 24"><path d=${Nt}></path></svg>${S("shutterControlDialog.stop")}
          </button>
          <button ?disabled=${this._busy || !t} @click=${() => this._run("close_cover")}>
            <svg viewBox="0 0 24 24"><path d=${Ze}></path></svg>${S("shutterControlDialog.close")}
          </button>
        </div>
        ${n.map((e) => {
			let t = Vr(this.hass, [e]), r = Br(this.hass, e);
			return h`<div class="cover">
            <svg viewBox="0 0 24 24"><path d=${t.icon}></path></svg>
            <span class="name">
              ${this.hass.states[e]?.attributes?.friendly_name || e}
            </span>
            <span class="val">${t.label}${r === null ? "" : ` · ${r} %`}</span>
            ${n.length > 1 ? h`<span class="one">
                  <button title=${S("shutterControlDialog.open")} @click=${() => this._runOne(e, "open_cover")}>
                    <svg viewBox="0 0 24 24"><path d=${$e}></path></svg>
                  </button>
                  <button title=${S("shutterControlDialog.stop")} @click=${() => this._runOne(e, "stop_cover")}>
                    <svg viewBox="0 0 24 24"><path d=${Nt}></path></svg>
                  </button>
                  <button title=${S("shutterControlDialog.close")} @click=${() => this._runOne(e, "close_cover")}>
                    <svg viewBox="0 0 24 24"><path d=${Ze}></path></svg>
                  </button>
                </span>` : ""}
          </div>`;
		})}
        <button slot="actions" @click=${this._close}>${S("shutterControlDialog.done")}</button>
      </homex-dialog>
    `;
	}
}, _i = (gi.styles = [O, o`
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
      /* Per-shutter controls (when the group has several). */
      .cover .one {
        display: flex;
        gap: 4px;
        flex: none;
      }
      .cover .one button {
        width: 36px;
        height: 36px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .cover .one svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
      }
      @media (max-width: 600px) {
        .cover {
          flex-wrap: wrap;
        }
        .cover .one {
          width: 100%;
          justify-content: flex-end;
        }
      }
    `], gi);
k([b({ attribute: !1 })], _i.prototype, "hass", void 0), k([b({ type: Boolean })], _i.prototype, "open", void 0), k([b({ attribute: !1 })], _i.prototype, "room", void 0), k([x()], _i.prototype, "_groupId", void 0), k([x()], _i.prototype, "_busy", void 0), _i = k([y("homex-shutter-control-dialog")], _i);
// src/lib/area.ts
function vi(e, t) {
	let n = e.entities?.[t];
	return n?.area_id || n?.device_id && e.devices?.[n.device_id]?.area_id || void 0;
}
function yi(e, t) {
	return e.devices?.[t]?.area_id || void 0;
}
function bi(e, t, n) {
	let r = new Set(n.filter(Boolean)), i = r.size ? e.filter((e) => r.has(t(e) ?? "")) : [];
	return {
		inArea: i,
		others: e.filter((e) => !i.includes(e))
	};
}
function xi(e, t) {
	return [...new Set(t.filter(Boolean))].map((t) => e.areas?.[t]?.name ?? t).join(", ");
}
// src/components/homex-radiator-dialog.ts
var Si = class extends v {
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
				ir(this.hass),
				lr(this.hass),
				Rn(this.hass)
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
			await Kn(this.hass, {
				entry_id: this.room.entry_id,
				heating: {
					...this.room.heating,
					radiators: e
				}
			}), C(this), this._close();
		} catch (e) {
			alert(S("common.error", { message: w(e) })), this._busy = !1;
		}
	}
	_renderExternalSensor() {
		let e = (e) => this.hass.states[e]?.attributes?.friendly_name || e, t = (e) => {
			let t = this.hass.states[e], n = t?.attributes?.unit_of_measurement ?? "";
			return t && !["unknown", "unavailable"].includes(t.state) ? `${t.state} ${n}` : "—";
		}, n = `sensor.homex_${this.room.room_id}_temperature`, r = !!this.room.metrics?.temperature?.sensors?.length, i = (this.room.metrics?.temperature?.sensors ?? []).map((e) => e.entity_id), { inArea: a, others: o } = bi(Object.keys(this.hass.states).filter((e) => e.startsWith("sensor.") && e !== n && !i.includes(e) && this.hass.states[e]?.attributes?.device_class === "temperature").sort((t, n) => e(t).localeCompare(e(n))), (e) => vi(this.hass, e), [this.room.area_id]), s = this._rad.external_sensor ?? "", c = (n, r = e(n)) => ({
			value: n,
			label: r,
			secondary: n,
			tertiary: t(n)
		});
		return h`
      <div class="section">${S("radiatorDialog.external_sensor")}</div>
      <p class="hint">${S("radiatorDialog.external_sensor_hint")}</p>
      <homex-select
        placeholder=${S("radiatorDialog.choose_sensor")}
        .value=${s}
        .groups=${[
			...r ? [{
				label: S("radiatorDialog.room_reference"),
				options: [c(n, S("radiatorDialog.reference_temperature", { room: this.room.name }))]
			}] : [],
			...i.length ? [{
				label: S("radiatorDialog.room_sensors"),
				options: i.map((e) => c(e))
			}] : [],
			...a.length ? [{
				label: S("radiatorDialog.area", { area: xi(this.hass, [this.room.area_id]) }),
				options: a.map((e) => c(e))
			}] : [],
			{
				label: S("radiatorDialog.others"),
				options: o.map((e) => c(e))
			}
		]}
        @value-changed=${(e) => this._rad = {
			...this._rad,
			external_sensor: e.detail.value
		}}
      ></homex-select>
      ${s ? "" : h`<p class="hint warn">${S("radiatorDialog.sensor_required")}</p>`}
    `;
	}
	render() {
		if (!this.open) return h``;
		let e = this.index >= 0, t = new Set((this.room.heating?.radiators ?? []).filter((e, t) => t !== this.index).map((e) => e.device_id)), n = this._otherRooms.find((e) => (e.heating?.radiators ?? []).some((e) => e.device_id === this._rad.device_id)), r = this._modelPresets, i = this.room.area_id || "", a = i ? this.hass.areas?.[i]?.name : void 0, { inArea: o, others: s } = bi(this._thermostats, (e) => yi(this.hass, e.device_id), [i]), c = (e) => ({
			value: e.device_id,
			label: e.name,
			secondary: e.label,
			tertiary: t.has(e.device_id) ? S("radiatorDialog.already_in_room") : void 0,
			disabled: t.has(e.device_id)
		});
		return h`
      <homex-dialog
        compact
        .open=${this.open}
        .heading=${S(e ? "radiatorDialog.edit_title" : "radiatorDialog.add_title")}
        @dialog-closed=${this._close}
      >
        <div class="section">${S("radiatorDialog.radiator")}</div>
        <homex-select
          placeholder=${S("radiatorDialog.choose_radiator")}
          .value=${this._rad.device_id}
          ?disabled=${e}
          .options=${i ? [] : this._thermostats.map(c)}
          .groups=${i ? [...o.length ? [{
			label: S("radiatorDialog.area", { area: a ?? i }),
			options: o.map(c)
		}] : [], {
			label: S("radiatorDialog.others"),
			options: s.map(c)
		}] : []}
          @value-changed=${(e) => this._onDevice(e.detail.value)}
        ></homex-select>
        ${n ? h`<p class="hint warn">${S("radiatorDialog.already_in_other_room", { room: n.name })}</p>` : ""}

        <div class="section">${S("radiatorDialog.device_preset")}</div>
        <homex-select
          placeholder=${S("radiatorDialog.no_preset")}
          .value=${this._rad.preset_id}
          ?disabled=${!this._rad.device_id}
          .options=${r.map((e) => ({
			value: e.id,
			label: e.name,
			tertiary: e.external_input ? S("radiatorDialog.external_sensor_tag") : void 0
		}))}
          @value-changed=${(e) => this._rad = {
			...this._rad,
			preset_id: e.detail.value
		}}
        ></homex-select>
        <p class="hint">
          ${this._rad.device_id && !r.length ? S("radiatorDialog.no_preset_for_model") : S("radiatorDialog.preset_applied")}
        </p>

        ${this._preset?.external_input ? this._renderExternalSensor() : ""}

        <span slot="actions">
          <button @click=${this._close}>${S("common.cancel")}</button>
          <button
            class="primary"
            ?disabled=${this._busy || !this._rad.device_id}
            @click=${this._save}
          >
            ${S(e ? "common.save" : "common.add")}
          </button>
        </span>
      </homex-dialog>
    `;
	}
}, R = (Si.styles = [O, o`
      .hint {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin: 6px 0;
      }
      .warn {
        color: var(--warning-color, #ff9800);
      }
    `], Si);
k([b({ attribute: !1 })], R.prototype, "hass", void 0), k([b({ type: Boolean })], R.prototype, "open", void 0), k([b({ attribute: !1 })], R.prototype, "room", void 0), k([b({ type: Number })], R.prototype, "index", void 0), k([x()], R.prototype, "_rad", void 0), k([x()], R.prototype, "_models", void 0), k([x()], R.prototype, "_presets", void 0), k([x()], R.prototype, "_otherRooms", void 0), k([x()], R.prototype, "_busy", void 0), R = k([y("homex-radiator-dialog")], R);
// src/components/homex-room-climate.ts
var Ci, wi = [
	{
		key: "temperature",
		icon: "🌡"
	},
	{
		key: "humidity",
		icon: "💧"
	},
	{
		key: "pm25",
		icon: "🌫"
	},
	{
		key: "pm10",
		icon: "🌫"
	},
	{
		key: "co2",
		icon: "🫧"
	}
], Ti = [
	"mean",
	"max",
	"min"
], Ei = (e) => Ti.includes(e) ? S(`roomClimate.rule_${e}`) : e, Di = [
	"heating",
	"idle",
	"off",
	"preheating",
	"heat",
	"auto"
], Oi = (e) => Di.includes(e) ? S(`roomClimate.action_${e}`) : e, ki = (Ci = class extends v {
	constructor(...e) {
		super(...e), this._devicePresets = [], this._dialogIndex = null, this._switching = !1;
	}
	connectedCallback() {
		super.connectedCallback(), this._load();
	}
	async _load() {
		try {
			this._devicePresets = (await ir(this.hass)).device_presets ?? [];
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
		let e = this.room, t = wi.filter((t) => e.metrics?.[t.key]?.sensors?.length);
		return h`
      <div class="section-row">
        <span class="section">${S("roomClimate.metrics")}</span>
        <button @click=${() => E(`/homex/climate/metrics/${e.room_id}`)}>
          ${S("roomClimate.configure")}
        </button>
      </div>
      ${t.length ? h`<div class="metrics">
            ${t.map((t) => {
			let n = e.metrics[t.key];
			return h`<div class="metric">
                <div class="muted">${t.icon} ${S(`roomClimate.metric_${t.key}`)}</div>
                <div class="v">${this._state(`sensor.homex_${e.room_id}_${t.key}`)}</div>
                <div class="muted">
                  ${S("roomClimate.sensor_count", { count: n.sensors.length })} · ${Ei(n.rule)}
                </div>
              </div>`;
		})}
          </div>` : h`<div class="empty">${S("roomClimate.no_sensors")}</div>`}
    `;
	}
	get _roomOn() {
		return this.room.heating?.enabled !== !1;
	}
	async _setRoomHeating(e) {
		this._switching = !0;
		try {
			await Kn(this.hass, {
				entry_id: this.room.entry_id,
				heating: {
					radiators: this.room.heating?.radiators ?? [],
					enabled: e
				}
			}), C(this);
		} catch (e) {
			alert(S("common.error", { message: w(e) }));
		} finally {
			this._switching = !1;
		}
	}
	async _remove(e) {
		let t = [...this.room.heating?.radiators ?? []], n = this.hass.devices?.[t[e]?.device_id]?.name ?? S("roomClimate.this_radiator");
		if (confirm(S("roomClimate.confirm_remove", { name: n }))) {
			t.splice(e, 1);
			try {
				await Kn(this.hass, {
					entry_id: this.room.entry_id,
					heating: {
						...this.room.heating,
						radiators: t
					}
				}), C(this);
			} catch (e) {
				alert(S("common.error", { message: w(e) }));
			}
		}
	}
	_renderRadiator(e) {
		let t = this.room.heating.radiators[e], n = this.hass.devices?.[t.device_id], r = jr(this.hass, t.device_id), i = r ? this.hass.states[r] : void 0, a = i?.attributes ?? {}, o = a.hvac_action ?? i?.state, s = this.hass.config?.unit_system?.temperature ?? "°C", c = (e) => e == null ? "—" : `${e} ${s}`, l = this._devicePresets.find((e) => e.id === t.preset_id), u = t.external_sensor ? this.hass.states[t.external_sensor]?.attributes?.friendly_name || t.external_sensor : "";
		return h`<div class="row">
      <div class="info">
        <div class="name">${n?.name_by_user || n?.name || t.device_id}</div>
        <div class="muted">
          ${l ? S("roomClimate.preset", { name: l.name }) : S("roomClimate.no_preset")}
          ${u ? h` · ${S("roomClimate.sensor", { name: u })}` : ""}
        </div>
      </div>
      <span class=${o === "heating" ? "heating" : "muted"}>
        ${!i || i.state === "unavailable" ? S("roomClimate.unavailable") : Oi(o)}
        ${Nr(i) ? h`<span
              class="warning"
              title=${S("roomClimate.valve_stuck")}
              >⚠</span
            >` : ""}
      </span>
      <div class="temps">
        <span title=${S("roomClimate.target_temp")}>🎯 ${c(a.temperature)}</span>
        <span title=${S("roomClimate.current_temp")}>🌡 ${c(a.current_temperature)}</span>
      </div>
      <button title=${S("common.edit")} @click=${() => this._dialogIndex = e}>✏️</button>
      <button title=${S("roomClimate.remove")} @click=${() => this._remove(e)}>✕</button>
    </div>`;
	}
	_renderHeating() {
		let e = this.room.heating?.radiators ?? [];
		return h`
      <div class="section-row">
        <span class="section">${S("roomClimate.heating")}</span>
        ${e.length ? h`<label
              class="room-switch ${this._roomOn ? "on" : ""}"
              title=${this._roomOn ? S("roomClimate.disable_hint") : S("roomClimate.enable_hint")}
            >
              ${this._roomOn ? S("roomClimate.heating_on") : S("roomClimate.heating_off")}
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
        <button @click=${() => this._dialogIndex = -1}>＋ ${S("roomClimate.add_radiator")}</button>
      </div>
      ${e.length ? e.map((e, t) => this._renderRadiator(t)) : h`<div class="empty">${S("roomClimate.no_radiators")}</div>`}
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
}, Ci.styles = [O, o`
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
    `], Ci);
k([b({ attribute: !1 })], ki.prototype, "hass", void 0), k([b({ attribute: !1 })], ki.prototype, "room", void 0), k([x()], ki.prototype, "_devicePresets", void 0), k([x()], ki.prototype, "_dialogIndex", void 0), k([x()], ki.prototype, "_switching", void 0), ki = k([y("homex-room-climate")], ki);
// src/components/homex-switch-mapping.ts
var Ai, ji = [
	"lights",
	"shutters",
	"heating"
], Mi = (e) => ji.includes(e) ? S(`switchMapping.module_${e}`) : e, Ni = (e) => S(`switchMapping.tap_${e}`);
function Pi(e) {
	return e.kind === "group" ? `group:${e.group_id}` : e.kind === "scene" ? `scene:${e.scene_key}` : e.kind.startsWith("shutter_") ? `${e.kind}:${e.group_id}` : e.kind === "heating_mode" ? `heating_mode:${e.mode_id}` : e.kind;
}
var z = (Ai = class extends v {
	constructor(...e) {
		super(...e), this.open = !1, this.layout = null, this.taps = {}, this._rooms = [], this._heatingModes = [], this._mappings = {}, this._tapTab = "single", this._dragId = "", this._picked = "", this._dropBtn = null, this._busy = !1;
	}
	willUpdate(e) {
		e.has("open") && this.open && (this._mappings = JSON.parse(JSON.stringify(this.sw?.mappings ?? {})), this._tapTab = this._enabledModes()[0] ?? "single", this._busy = !1, this._dragId = "", this._picked = "", this._loadRooms());
	}
	async _loadRooms() {
		try {
			let e = await Rn(this.hass), t = new Set(this.sw?.rooms ?? []);
			this._rooms = e.filter((e) => t.has(e.room_id));
		} catch {
			this._rooms = [];
		}
		try {
			this._heatingModes = (await ir(this.hass)).presets;
		} catch {
			this._heatingModes = [];
		}
	}
	get _multi() {
		return this._rooms.length > 1;
	}
	_actionsForRoom(e) {
		let t = (t, n, r, i, a) => ({
			id: `${e.room_id}::${Pi(a)}`,
			room_id: e.room_id,
			room_name: e.name,
			module: t,
			label: n,
			clabel: r,
			short: i,
			action: a
		}), n = [];
		if ((e.modules ?? []).includes("lights")) {
			n.push(t("lights", S("switchMapping.toggle_room"), S("switchMapping.toggle_short"), "⏻", { kind: "toggle" }), t("lights", S("switchMapping.scene_next"), S("switchMapping.scene_next_short"), "🎬", { kind: "scene_next" }), t("lights", S("switchMapping.dim_up"), S("switchMapping.dim_up_short"), "🔆", { kind: "dim_up" }), t("lights", S("switchMapping.dim_down"), S("switchMapping.dim_down_short"), "🔅", { kind: "dim_down" }));
			for (let r of e.groups ?? []) n.push(t("lights", S("switchMapping.group", { name: r.name }), r.name, "◧", {
				kind: "group",
				group_id: r.group_id
			}));
			for (let r of e.scenes ?? []) n.push(t("lights", S("switchMapping.scene", { name: r.name }), r.name, "★", {
				kind: "scene",
				scene_key: r.key
			}));
		}
		if ((e.modules ?? []).includes("shutters")) for (let r of e.shutter_groups ?? []) n.push(t("shutters", S("switchMapping.shutter_toggle", { name: r.name }), `${r.name} ⇅`, "⇅", {
			kind: "shutter_toggle",
			group_id: r.id
		}), t("shutters", S("switchMapping.shutter_open", { name: r.name }), `${r.name} ⬆`, "⬆", {
			kind: "shutter_open",
			group_id: r.id
		}), t("shutters", S("switchMapping.shutter_close", { name: r.name }), `${r.name} ⬇`, "⬇", {
			kind: "shutter_close",
			group_id: r.id
		}), t("shutters", S("switchMapping.shutter_stop", { name: r.name }), `${r.name} ⏹`, "⏹", {
			kind: "shutter_stop",
			group_id: r.id
		}));
		if (this._heatingModes.length) {
			n.push(t("heating", S("switchMapping.heating_next"), S("switchMapping.heating_next_short"), "🔥", { kind: "heating_mode_next" }));
			for (let e of this._heatingModes) n.push(t("heating", S("switchMapping.heating_mode", { name: e.name }), e.name, "🌡", {
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
		return this._itemById(`${e.room}::${Pi(e.action)}`);
	}
	_usedIds() {
		let e = /* @__PURE__ */ new Set();
		for (let t of Object.values(this._mappings)) for (let n of Object.values(t)) e.add(`${n.room}::${Pi(n.action)}`);
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
			await En(this.hass, {
				...this.sw,
				mappings: this._mappings
			}), C(this), this._close();
		} catch (e) {
			this._busy = !1, alert(S("common.error", { message: w(e) }));
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
		if (!t) return h`<p class="hint">${S("switchMapping.layout_not_found")}</p>`;
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
      <span class="tray-label">${S("switchMapping.invisible_buttons")}</span>
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
        heading=${S("switchMapping.heading", { name: this.sw?.name ?? "" })}
        @dialog-closed=${this._close}
      >
        <div class="cols">
          <div class="left">
            <p class="section">${S("switchMapping.homex_actions")}</p>
            ${this._rooms.length === 0 ? h`<p class="hint">${S("switchMapping.no_rooms")}</p>` : this._rooms.every((e) => !this._actionsByModule(e).length) ? h`<p class="hint">${S("switchMapping.no_actions")}</p>` : this._rooms.map((e) => [e, this._actionsByModule(e)]).filter(([, e]) => e.length > 0).map(([e, t]) => h`
                        ${this._multi ? h`<p class="room-head">🏠 ${e.name}</p>` : ""}
                        ${t.map(([e, t]) => h`
                            <p class="mod-head">${Mi(e)}</p>
                            ${t.map((e) => this._actionRow(e, n))}
                          `)}
                      `)}
            <p class="hint">${S("switchMapping.hint")}</p>
          </div>
          <div class="right">
            ${e.length ? h`<div class="tabs">
                    ${e.map((e) => h`<span
                        class="tab ${e === t ? "active" : ""}"
                        @click=${() => this._tapTab = e}
                        >${Ni(e)}</span
                      >`)}
                  </div>
                  ${this._canvas(t)} ${this._invisibleTray(t)}` : h`<p class="hint">${S("switchMapping.no_tap_modes")}</p>`}
          </div>
        </div>
        <div slot="actions">
          <button @click=${this._close}>${S("common.cancel")}</button>
          <button class="primary" ?disabled=${this._busy} @click=${this._save}>
            ${S("common.save")}
          </button>
        </div>
      </homex-dialog>
    `;
	}
}, Ai.styles = [O, o`
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
    `], Ai);
k([b({ attribute: !1 })], z.prototype, "hass", void 0), k([b({ type: Boolean })], z.prototype, "open", void 0), k([b({ attribute: !1 })], z.prototype, "sw", void 0), k([b({ attribute: !1 })], z.prototype, "layout", void 0), k([b({ attribute: !1 })], z.prototype, "taps", void 0), k([x()], z.prototype, "_rooms", void 0), k([x()], z.prototype, "_heatingModes", void 0), k([x()], z.prototype, "_mappings", void 0), k([x()], z.prototype, "_tapTab", void 0), k([x()], z.prototype, "_dragId", void 0), k([x()], z.prototype, "_picked", void 0), k([x()], z.prototype, "_dropBtn", void 0), k([x()], z.prototype, "_busy", void 0), z = k([y("homex-switch-mapping")], z);
// src/components/homex-room-card.ts
var Fi = class extends v {
	constructor(...e) {
		super(...e), this.expanded = !1, this._dialog = "", this._menuOpen = !1, this._shutterCtlOpen = !1, this._renameScene = null, this._deleteScenes = !0, this._deleting = !1, this._syncing = !1, this._activeTab = "", this._gswitches = [], this._presets = [], this._layouts = [], this._mappingSwitch = null, this._shutterGroupOpen = !1, this._shutterGroupEdit = null, this._close = () => this._dialog = "", this._delete = () => {
			this._menuOpen = !1, this._deleteScenes = !0, this._dialog = "delete";
		}, this._confirmDelete = async () => {
			this._deleting = !0;
			try {
				await Vn(this.hass, this.room.entry_id, this._deleteScenes), this._dialog = "", C(this);
			} catch (e) {
				alert(S("common.error", { message: w(e) }));
			} finally {
				this._deleting = !1;
			}
		}, this._syncLabels = async () => {
			this._menuOpen = !1, this._syncing = !0;
			try {
				let e = await qn(this.hass, this.room.entry_id);
				alert(S("roomCard.synced", {
					entities: e.updated,
					scenes: e.scenes_renamed
				}));
			} catch (e) {
				alert(S("common.error", { message: w(e) }));
			} finally {
				this._syncing = !1;
			}
		}, this._sceneNext = async (e) => {
			e?.stopPropagation();
			try {
				await nr(this.hass, this.room.entry_id);
			} catch (e) {
				alert(S("common.error", { message: w(e) }));
			}
		}, this._dim = async (e, t) => {
			t?.stopPropagation();
			try {
				await Jn(this.hass, this.room.entry_id, e);
			} catch (e) {
				alert(S("common.error", { message: w(e) }));
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
		Er(`/config/scene/edit/${e.config_id}`, t);
	}
	async _deleteScene(e) {
		if (confirm(S("roomCard.confirm_delete_scene", { name: e.name }))) try {
			await er(this.hass, this.room.entry_id, e.key), C(this);
		} catch (e) {
			alert(S("common.error", { message: w(e) }));
		}
	}
	async _sceneMoved(e) {
		let { oldIndex: t, newIndex: n } = e.detail, r = this.room.scenes.filter((e) => e.orderable).map((e) => e.key), [i] = r.splice(t, 1);
		r.splice(n, 0, i);
		try {
			await tr(this.hass, this.room.entry_id, r), C(this);
		} catch (e) {
			alert(S("common.error", { message: w(e) }));
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
        ${e.orderable ? h`<span class="handle" title=${S("roomCard.drag_reorder")}>
              <svg viewBox="0 0 24 24"><path d=${lt}></path></svg>
            </span>` : h`<span class="pin" title=${S("roomCard.always_last")}>
              <svg viewBox="0 0 24 24"><path d=${Tt}></path></svg>
            </span>`}
        <span class="scene-name">${e.name}</span>
        ${e.key === t ? h`<span class="active-tag">${S("roomCard.active")}</span>` : ""}
        <span class="btn-group">
          ${this._iconBtn(Ct, S("roomCard.open_in_ha"), (t) => this._openHa(e, t))}
          ${this._iconBtn(wt, S("common.rename"), () => this._renameScene = e)}
          ${this._iconBtn(ot, e.removable ? S("common.delete") : S("roomCard.default_scene"), () => this._deleteScene(e), !e.removable)}
        </span>
      </div>
    `;
	}
	render() {
		let e = this.room, t = this._isOn() ? this.hass.states[e.switch]?.attributes?.active_scene ?? null : null, n = t ? e.scenes.find((e) => e.key === t)?.name : void 0, r = (e.area_id ? this.hass.areas?.[e.area_id] : null)?.icon || void 0, i = e.scenes.filter((e) => e.orderable), a = e.scenes.filter((e) => !e.orderable), o = e.scenes.some((e) => e.removable), s = e.modules?.includes("lights") ?? !0, c = e.modules?.includes("switches") ?? !1, l = e.modules?.includes("shutters") ?? !1, u = e.modules?.includes("heating") ?? !1, d = !!(e.dim_up_triggers?.length || e.dim_down_triggers?.length);
		return h`
      <ha-card class=${this.expanded ? "selected" : ""}>
        <div class="head" @click=${this._toggleExpand} title=${S("roomCard.collapse_expand")}>
          <svg class="chevron" viewBox="0 0 24 24">
            <path d=${this.expanded ? it : rt}></path>
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
                    title=${S("roomCard.dim_down")}
                    @click=${(e) => this._dim(-20, e)}
                  >
                    <svg viewBox="0 0 24 24"><path d=${St}></path></svg>
                  </button>
                  <button
                    class="round"
                    title=${S("roomCard.dim_up")}
                    @click=${(e) => this._dim(20, e)}
                  >
                    <svg viewBox="0 0 24 24"><path d=${Et}></path></svg>
                  </button>
                ` : ""}
            ${s && o ? h`<button
                  class="round"
                  title=${S("roomCard.next_scene")}
                  @click=${(e) => this._sceneNext(e)}
                >
                  <svg viewBox="0 0 24 24"><path d=${Pt}></path></svg>
                </button>` : ""}
            ${l ? this._renderShutterButton(e) : ""}
            <button
              class="kebab"
              title=${S("roomCard.actions")}
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
                <button @click=${() => this._pick("room")}>✏️ ${S("roomCard.edit_room")}</button>
                ${s ? h`
                      <div class="menu-section">${S("roomCard.module_lights")}</div>
                      <button @click=${() => this._pick("triggers")}>
                        ⚡ ${S("roomCard.triggers", { count: e.triggers.length + e.scene_triggers.length })}
                      </button>
                      <button @click=${() => this._pick("addgroup")}>
                        ＋ ${S("roomCard.add_group")}
                      </button>
                      <div class="sep"></div>
                    ` : ""}
                <button ?disabled=${this._syncing} @click=${this._syncLabels}>
                  🏷 ${this._syncing ? S("roomCard.syncing") : S("roomCard.sync_labels")}
                </button>
                <div class="sep"></div>
                <button class="danger-item" @click=${this._delete}>
                  🗑 ${S("roomCard.delete_room")}
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
		let t = Lr(this.hass, e), n = Fr(this.hass, e), r = (e, t, n, r = "") => h`<span class="stat icon-stat ${r}" title=${n}>
        <svg viewBox="0 0 24 24"><path d=${e}></path></svg>${t}
      </span>`;
		return h`
      ${t ? r(ht, t.mode, t.own ? S("roomCard.heating_disabled_room") : S("roomCard.zone_mode", { zone: t.zone })) : ""}
      ${e.heating?.radiators?.length ? Ir(this.hass, e) ? r(ut, S("roomCard.heating"), S("roomCard.heating_hint"), "heating") : r(dt, S("roomCard.idle"), S("roomCard.idle_hint")) : ""}
      ${n ? r(Xe, S("roomCard.valve_check"), n, "warning") : ""}
    `;
	}
	_renderStats(e, t, n, r, i) {
		let a = Object.values(e.metrics ?? {}).filter((e) => e?.sensors?.length).length;
		return h`
      ${t ? h`
            <div class="module-title">${S("roomCard.module_lights")}</div>
            <div class="stats">
              <span class="stat">🔌 ${S("roomCard.lights_count", { count: e.devices.length })}</span>
              <span class="stat">🎬 ${S("roomCard.scenes_count", { count: e.scenes.length })}</span>
              ${e.groups.length ? h`<span class="stat">📦 ${S("roomCard.groups_count", { count: e.groups.length })}</span>` : ""}
            </div>
          ` : ""}
      ${n ? h`
            <div class="module-title">${S("roomCard.module_switches")}</div>
            <div class="stats">
              <span class="stat">🎛 ${S("roomCard.switches_count", { count: this._roomSwitches().length })}</span>
              <span class="stat">⚡ ${S("roomCard.actions_count", { count: this._switchActionCount(e) })}</span>
            </div>
          ` : ""}
      ${r ? h`
            <div class="module-title">${S("roomCard.module_shutters")}</div>
            <div class="stats">
              <span class="stat">📦 ${S("roomCard.groups_count", { count: (e.shutter_groups ?? []).length })}</span>
              <span class="stat">🪟 ${S("roomCard.shutters_count", { count: this._shutterCount(e) })}</span>
            </div>
          ` : ""}
      ${i ? h`
            <div class="module-title">${S("roomCard.module_climate")}</div>
            <div class="stats">
              <span class="stat">📈 ${S("roomCard.metrics_count", { count: a })}</span>
              <span class="stat">🔥 ${S("roomCard.radiators_count", { count: e.heating?.radiators?.length ?? 0 })}</span>
              ${this._climatePills(e)}
            </div>
          ` : ""}
    `;
	}
	_renderBody(e, t, n, r, i, a, o, s) {
		let c = [];
		if (i && c.push({
			key: "lights",
			label: S("roomCard.module_lights")
		}), a && c.push({
			key: "switches",
			label: S("roomCard.module_switches")
		}), o && c.push({
			key: "shutters",
			label: S("roomCard.module_shutters")
		}), s && c.push({
			key: "climate",
			label: S("roomCard.module_climate")
		}), !c.length) return h`<div class="empty-body">${S("roomCard.no_modules")}</div>`;
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
        <span class="section">${S("roomCard.scenes")}</span>
        <button @click=${() => this._pick("addscene")}>＋ ${S("roomCard.add_scene")}</button>
      </div>
      <ha-sortable handle-selector=".handle" @item-moved=${this._sceneMoved}>
        <div>${n.map((e) => this._sceneRow(e, t))}</div>
      </ha-sortable>
      ${r.map((e) => this._sceneRow(e, t))}

      <div class="section-row">
        <span class="section">${S("roomCard.groups")}</span>
        <button @click=${() => this._pick("addgroup")}>＋ ${S("roomCard.add_group_short")}</button>
      </div>
      ${e.groups.length ? h`<div class="groups">
            ${e.groups.map((t) => h`<homex-group-row
                .hass=${this.hass}
                .room=${e}
                .group=${t}
              ></homex-group-row>`)}
          </div>` : h`<div class="empty-body">${S("roomCard.no_groups")}</div>`}
    `;
	}
	connectedCallback() {
		super.connectedCallback(), this._loadSwitchData();
	}
	async _loadSwitchData() {
		try {
			[this._gswitches, this._presets, this._layouts] = await Promise.all([
				Tn(this.hass),
				On(this.hass),
				Sn(this.hass)
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
		return Ar(this.hass, this._presets, e);
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
        <span class="section">${S("roomCard.switches")}</span>
        <button @click=${() => this._openSwitchManagerAdd()}>＋ ${S("roomCard.add_switch")}</button>
      </div>
      ${t.length ? t.map((e) => {
			let t = this._presetFor(e);
			return h`<div
              class="switch-row"
              @click=${() => this._mappingSwitch = e}
            >
              <span class="switch-name">🎛 ${e.name}</span>
              <span class="switch-meta">
                ${t ? t.name : S("roomCard.no_preset")}
              </span>
            </div>`;
		}) : h`<div class="empty-body">${S("roomCard.no_switches", { button: S("roomCard.add_switch") })}</div>`}
    `;
	}
	_openShutterGroup(e) {
		this._shutterGroupEdit = e, this._shutterGroupOpen = !0;
	}
	_renderShuttersTab(e) {
		let t = e.shutter_groups ?? [];
		return h`
      <div class="section-row">
        <span class="section">${S("roomCard.shutter_groups")}</span>
        <button @click=${() => this._openShutterGroup(null)}>＋ ${S("roomCard.add_group_short")}</button>
      </div>
      ${t.map((e) => h`<div class="shutter-group">
          <div class="shutter-group-head">
            <span class="switch-name">📦 ${e.name}</span>
            <button
              class="cfg-btn"
              title=${S("roomCard.configure_group")}
              @click=${() => this._openShutterGroup(e)}
            >
              ⚙
            </button>
          </div>
          ${e.devices.length ? e.devices.map((e) => h`<div class="shutter-cover">
                  🪟 ${this._entityName(e)}
                </div>`) : h`<div class="shutter-cover empty">${S("roomCard.no_shutters_in_group")}</div>`}
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
		let t = Hr(e);
		if (!t) return "";
		let n = Vr(this.hass, t.devices);
		return h`<button
      class="round shutter-btn ${n.state}"
      title=${`${S("roomCard.shutters_title", {
			name: t.name,
			state: n.label
		})}${n.position === null ? "" : ` · ${n.position} %`}`}
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
          <h3>${S("roomCard.confirm_delete_room", { name: e.name })}</h3>
          <p class="confirm-text">${S("roomCard.delete_room_text")}</p>
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
              ${S("roomCard.delete_scenes_too", { count: e.scenes.length })}
            </span>
          </label>
          <div class="confirm-actions">
            <button @click=${this._close} ?disabled=${this._deleting}>
              ${S("common.cancel")}
            </button>
            <button
              class="danger"
              @click=${this._confirmDelete}
              ?disabled=${this._deleting}
            >
              ${this._deleting ? S("roomCard.deleting") : S("common.delete")}
            </button>
          </div>
        </div>
      </div>
    `;
	}
}, B = (Fi.styles = [O, o`
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
    `], Fi);
k([b({ attribute: !1 })], B.prototype, "hass", void 0), k([b({ attribute: !1 })], B.prototype, "room", void 0), k([b({ type: Boolean })], B.prototype, "expanded", void 0), k([x()], B.prototype, "_dialog", void 0), k([x()], B.prototype, "_menuOpen", void 0), k([x()], B.prototype, "_shutterCtlOpen", void 0), k([x()], B.prototype, "_renameScene", void 0), k([x()], B.prototype, "_deleteScenes", void 0), k([x()], B.prototype, "_deleting", void 0), k([x()], B.prototype, "_syncing", void 0), k([x()], B.prototype, "_activeTab", void 0), k([x()], B.prototype, "_gswitches", void 0), k([x()], B.prototype, "_presets", void 0), k([x()], B.prototype, "_layouts", void 0), k([x()], B.prototype, "_mappingSwitch", void 0), k([x()], B.prototype, "_shutterGroupOpen", void 0), k([x()], B.prototype, "_shutterGroupEdit", void 0), B = k([y("homex-room-card")], B);
// src/components/homex-export-dialog.ts
var Ii, Li = (e) => "\"" + String(e).replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"";
function Ri(e) {
	let t = ["google_assistant:", "  entity_config:"];
	e.length || (t[1] = "  entity_config: {}");
	for (let n of e) t.push(`    ${n.switch}:`), t.push(`      name: ${Li(n.name)}`), t.push("      expose: true"), t.push(`      room: ${Li(n.name)}`);
	return t.join("\n") + "\n";
}
var zi = (Ii = class extends v {
	constructor(...e) {
		super(...e), this.open = !1, this.rooms = [], this._copied = !1;
	}
	get _yaml() {
		return Ri(this.rooms);
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
        heading=${S("exportDialog.heading")}
        @dialog-closed=${this._close}
      >
        <p class="hint">
          ${S("exportDialog.hint_before")} <code>configuration.yaml</code>
          ${S("exportDialog.hint_after")}
        </p>
        <textarea
          readonly
          .value=${this._yaml}
          @click=${(e) => e.target.select()}
        ></textarea>
        <span slot="actions">
          <button @click=${this._download}>${S("exportDialog.download")}</button>
          <button @click=${this._close}>${S("common.close")}</button>
          <button class="primary" @click=${this._copy}>
            ${this._copied ? S("exportDialog.copied") : S("exportDialog.copy")}
          </button>
        </span>
      </homex-dialog>
    `;
	}
}, Ii.styles = [O, o`
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
    `], Ii);
k([b({ type: Boolean })], zi.prototype, "open", void 0), k([b({ attribute: !1 })], zi.prototype, "rooms", void 0), k([x()], zi.prototype, "_copied", void 0), zi = k([y("homex-export-dialog")], zi);
// src/components/homex-layout-editor.ts
var Bi, Vi = 20, Hi = .5, V = (Bi = class extends v {
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
		return Math.min(Vi, Math.max(0, Math.round(e / Hi) * Hi));
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
		let n = this.renderRoot.querySelector("svg").getBoundingClientRect(), r = (e.clientX - n.left) / n.width * Vi, i = (e.clientY - n.top) / n.height * Vi;
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
			let r = (e - n.left) / n.width * Vi, i = (t - n.top) / n.height * Vi;
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
			alert(S("layoutEditor.name_id_required"));
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
			await Cn(this.hass, o), this._close();
		} catch (e) {
			this._busy = !1, alert(S("common.error", { message: w(e) }));
		}
	}
	async _delete() {
		if (this.layout && confirm(S("layoutEditor.confirm_delete", { name: this.layout.name }))) {
			this._busy = !0;
			try {
				await wn(this.hass, this.layout.id), this._close();
			} catch (e) {
				this._busy = !1, alert(S("common.error", { message: w(e) }));
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
          ${A(S("layoutEditor.name"), this._name, (e) => this._onName(e), S("layoutEditor.name_placeholder"))}
          <div class="section">${S("layoutEditor.main_shape")}</div>
          <div class="shapes">
            <button class="shape-btn ${this._shape === "round" ? "on" : ""}"
              @click=${() => this._setShape("round")}>${S("layoutEditor.shape_round")}</button>
            <button class="shape-btn ${this._shape === "square" ? "on" : ""}"
              @click=${() => this._setShape("square")}>${S("layoutEditor.shape_square")}</button>
            <button class="shape-btn ${this._shape === "vrect" ? "on" : ""}"
              @click=${() => this._setShape("vrect")}>${S("layoutEditor.shape_vrect")}</button>
          </div>
          <div class="fields">
            <div class="field">
              <label>${S("layoutEditor.buttons")}</label>
              <input class="num" type="number" min="1" .value=${String(this._buttons)}
                @change=${(e) => this._setButtons(Number(e.target.value))} />
            </div>
            <div class="field">
              <label>${S("layoutEditor.columns")}</label>
              <input class="num" type="number" min="1" .value=${String(this._columns)}
                @change=${(e) => this._setColumns(Number(e.target.value))} />
            </div>
            <div class="field">
              <label>${S("layoutEditor.rows")}</label>
              <input class="num" type="number" min="1" .value=${String(this._rows)}
                @change=${(e) => this._setRows(Number(e.target.value))} />
            </div>
          </div>
          <button class="center-btn" @click=${() => this._recenterShape()}>
            ${S("layoutEditor.center_shape")}
          </button>
          <p class="hint">${S("layoutEditor.hint")}</p>
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
            <span class="tray-label">${S("layoutEditor.invisible")}</span>
            ${r.length ? r.map((e) => h`<span
                    class="tray-badge"
                    @pointerdown=${(t) => this._start({
			kind: "num",
			fromCell: -1,
			button: e
		}, t)}
                    >${e}</span
                  >`) : h`<span class="tray-empty">
                  ${S("layoutEditor.tray_empty")}
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
              ${S("common.delete")}
            </button>` : ""}
        <button @click=${this._close}>${S("common.cancel")}</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._save}>
          ${this.layout ? S("common.save") : S("layoutEditor.create_layout")}
        </button>
      </div>
    `;
	}
}, Bi.styles = [O, o`
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
    `], Bi);
k([b({ attribute: !1 })], V.prototype, "hass", void 0), k([b({ attribute: !1 })], V.prototype, "layout", void 0), k([x()], V.prototype, "_name", void 0), k([x()], V.prototype, "_id", void 0), k([x()], V.prototype, "_buttons", void 0), k([x()], V.prototype, "_shape", void 0), k([x()], V.prototype, "_bounds", void 0), k([x()], V.prototype, "_columns", void 0), k([x()], V.prototype, "_rows", void 0), k([x()], V.prototype, "_colLines", void 0), k([x()], V.prototype, "_rowLines", void 0), k([x()], V.prototype, "_assignments", void 0), k([x()], V.prototype, "_busy", void 0), k([x()], V.prototype, "_dragClient", void 0), k([x()], V.prototype, "_hoverCell", void 0), k([x()], V.prototype, "_overTray", void 0), V = k([y("homex-layout-editor")], V);
// src/components/homex-preset-editor.ts
var Ui = class extends v {
	constructor(...e) {
		super(...e), this.preset = null, this.layouts = [], this.prefillDevice = "", this._name = "", this._nameTyped = !1, this._id = "", this._deviceId = "", this._modelKey = "", this._models = [], this._devices = [], this._layoutId = "", this._taps = {}, this._bindings = {}, this._actions = [], this._actionTab = "single", this._busy = !1, this._idEdited = !1;
	}
	static _tapLabel(e) {
		return S(`presetEditor.tap_${e}`);
	}
	connectedCallback() {
		super.connectedCallback(), this._loadModels(), this._loadDevices();
	}
	async _loadModels() {
		try {
			this._models = await jn(this.hass);
		} catch {
			this._models = [];
		}
	}
	async _loadDevices() {
		try {
			this._devices = await Mn(this.hass);
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
			this._name = e?.name ?? "", this._nameTyped = !!e, this._id = e?.id ?? "", this._deviceId = e?.device_id ?? this.prefillDevice ?? "", this._modelKey = e?.model ?? (this._deviceId ? Dr(this.hass, this._deviceId) : ""), this._layoutId = e?.layout_id ?? "", this._taps = JSON.parse(JSON.stringify(e?.taps ?? {})), this._bindings = JSON.parse(JSON.stringify(e?.bindings ?? {})), this._actions = [], this._idEdited = !!e, this._busy = !1, !e && this._deviceId && !this._name && (this._name = Or(this.hass, this._deviceId), this._id = M(this._name)), this._ensureTaps(), this._deviceId && this._loadActions();
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
			this._actions = await Gn(this.hass, this._deviceId);
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
		return Object.values(this._taps).forEach((t) => t.forEach((t) => e.add(t))), Wi.TAP_MODES.map((e) => e.mode).filter((t) => e.has(t));
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
		if (!e || !t) alert(S("presetEditor.name_id_required"));
		else if (!this._deviceId) alert(S("presetEditor.choose_device_model"));
		else if (!this._layoutId) alert(S("presetEditor.select_layout"));
		else {
			this._busy = !0;
			try {
				await kn(this.hass, {
					id: t,
					name: e,
					model: Dr(this.hass, this._deviceId),
					model_label: Or(this.hass, this._deviceId),
					device_id: this._deviceId,
					layout_id: this._layoutId,
					taps: this._taps,
					bindings: this._bindings
				}), this._close(t);
			} catch (e) {
				this._busy = !1, alert(S("common.error", { message: w(e) }));
			}
		}
	}
	async _delete() {
		if (this.preset && confirm(S("presetEditor.confirm_delete", { name: this.preset.name }))) {
			this._busy = !0;
			try {
				await An(this.hass, this.preset.id), this._close();
			} catch (e) {
				this._busy = !1, alert(S("common.error", { message: w(e) }));
			}
		}
	}
	_renderActions() {
		if (!this._deviceId) return "";
		if (!this._actions.length) return h`<p class="hint">${S("presetEditor.no_actions")}</p>`;
		let e = this._enabledModes();
		if (!e.length) return "";
		let t = e.includes(this._actionTab) ? this._actionTab : e[0], n = (e) => Wi._tapLabel(e);
		return h`
      <div class="section">${S("presetEditor.actions_per_button")}</div>
      <p class="hint">${S("presetEditor.actions_hint")}</p>
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
          <div class="btn-lbl">${S("presetEditor.button", { n: e })}</div>
          <homex-select
            class="bind-select"
            placeholder=${S("presetEditor.no_action")}
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
      ${A(S("presetEditor.name"), this._name, (e) => this._onName(e), S("presetEditor.name_placeholder"))}
      ${e ? h`<div class="section">${S("presetEditor.id", { id: this.preset.id })}</div>` : ""}

      <div class="section">${S("presetEditor.switch_model")}</div>
      ${this._models.length ? h`<homex-select
            placeholder=${S("presetEditor.choose_model")}
            .value=${this._modelKey}
            .options=${this._models.map((e) => ({
			value: e.model,
			label: e.label,
			tertiary: S("presetEditor.devices_count", { count: e.count })
		}))}
            @value-changed=${(e) => this._onModel(e.detail.value)}
          ></homex-select>` : h`<p class="hint">${S("presetEditor.no_switches")}</p>`}

      ${this._modelKey ? h`<div class="section">${S("presetEditor.ref_device")}</div>
            <p class="hint">${S("presetEditor.ref_device_hint")}</p>
            ${this._devicesForModel().length ? h`<homex-select
                  placeholder=${S("presetEditor.choose_device")}
                  .value=${this._deviceId}
                  .options=${this._devicesForModel().map((e) => ({
			value: e.device_id,
			label: e.name
		}))}
                  @value-changed=${(e) => this._onRefDevice(e.detail.value)}
                ></homex-select>` : h`<p class="hint">${S("presetEditor.no_devices_for_model")}</p>`}` : ""}

      <div class="section">${S("presetEditor.layout")}</div>
      ${this.layouts.length ? h`<homex-select
            placeholder=${S("presetEditor.choose_layout")}
            .value=${this._layoutId}
            .options=${this.layouts.map((e) => ({
			value: e.id,
			label: e.name,
			tertiary: S("presetEditor.buttons_count", { count: e.buttons })
		}))}
            @value-changed=${(e) => this._onLayout(e.detail.value)}
          ></homex-select>` : h`<p class="hint">${S("presetEditor.no_layouts")}</p>`}

      ${this._selectedLayout() ? h`
            <div class="section">${S("presetEditor.tap_modes")}</div>
            <p class="hint">${S("presetEditor.tap_modes_hint")}</p>
            ${Array.from({ length: this._selectedLayout().buttons }, (e, t) => t + 1).map((e) => h`<div class="btn-row">
                <span class="btn-lbl">${S("presetEditor.button", { n: e })}</span>
                <div class="chips">
                  ${Wi.TAP_MODES.map((t) => h`<span
                      class="tap ${(this._taps[e] ?? []).includes(t.mode) ? "on" : ""}"
                      @click=${() => this._toggleTap(e, t.mode)}
                      >${Wi._tapLabel(t.mode)}</span
                    >`)}
                </div>
              </div>`)}
            ${this._renderActions()}
          ` : ""}

      <div class="actions">
        ${e ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              ${S("common.delete")}
            </button>` : ""}
        <button @click=${this._close}>${S("common.cancel")}</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._save}>
          ${S(e ? "common.save" : "presetEditor.create_preset")}
        </button>
      </div>
    `;
	}
}, Wi = Ui, H = (Ui.TAP_MODES = [
	{ mode: "single" },
	{ mode: "double" },
	{ mode: "long" }
], Ui.styles = [O, o`
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
    `], Ui);
k([b({ attribute: !1 })], H.prototype, "hass", void 0), k([b({ attribute: !1 })], H.prototype, "preset", void 0), k([b({ attribute: !1 })], H.prototype, "layouts", void 0), k([b({ attribute: !1 })], H.prototype, "prefillDevice", void 0), k([x()], H.prototype, "_name", void 0), k([x()], H.prototype, "_id", void 0), k([x()], H.prototype, "_deviceId", void 0), k([x()], H.prototype, "_modelKey", void 0), k([x()], H.prototype, "_models", void 0), k([x()], H.prototype, "_devices", void 0), k([x()], H.prototype, "_layoutId", void 0), k([x()], H.prototype, "_taps", void 0), k([x()], H.prototype, "_bindings", void 0), k([x()], H.prototype, "_actions", void 0), k([x()], H.prototype, "_actionTab", void 0), k([x()], H.prototype, "_busy", void 0), H = Wi = k([y("homex-preset-editor")], H);
// src/components/homex-gswitch-editor.ts
var Gi = class extends v {
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
			let e = await Rn(this.hass);
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
			this._devices = await Mn(this.hass);
		} catch {
			this._devices = [];
		}
	}
	_modelPresets() {
		return this._deviceId ? kr(this.hass, this.presets, this._deviceId) : [];
	}
	_preset() {
		if (this._deviceId) return Ar(this.hass, this.presets, {
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
		if (!e || !t) alert(S("gswitchEditor.name_id_required"));
		else if (!this._deviceId) alert(S("gswitchEditor.choose_device"));
		else {
			this._busy = !0;
			try {
				await En(this.hass, {
					...this.sw ?? {},
					id: t,
					name: e,
					device_id: this._deviceId,
					preset_id: this._preset()?.id ?? "",
					rooms: this._rooms
				}, !this.sw), this._close();
			} catch (e) {
				this._busy = !1, alert(S("common.error", { message: w(e) }));
			}
		}
	}
	async _delete() {
		if (this.sw && confirm(S("gswitchEditor.confirm_delete", { name: this.sw.name }))) {
			this._busy = !0;
			try {
				await Dn(this.hass, this.sw.id), this._close();
			} catch (e) {
				this._busy = !1, alert(S("common.error", { message: w(e) }));
			}
		}
	}
	_renderPreset(e) {
		let t = this._modelPresets(), n = Or(this.hass, this._deviceId);
		if (!t.length) {
			let [e, t] = S("gswitchEditor.no_preset_for_model").split("{model}");
			return h`<div class="preset-box">
        <div class="row">
          <span>${e}<b>${n}</b>${t}</span>
          <button class="primary" @click=${this._createPreset}>
            ${S("gswitchEditor.create_preset")}
          </button>
        </div>
      </div>`;
		}
		return h`<div class="preset-box ${e ? "ok" : ""}">
      <div class="section">${S("gswitchEditor.preset")}</div>
      <homex-select
        .value=${e?.id ?? ""}
        .options=${t.map((e) => ({
			value: e.id,
			label: e.name
		}))}
        @value-changed=${(e) => this._presetId = e.detail.value}
      ></homex-select>
      <div class="row">
        <span class="hint">${S("gswitchEditor.model", { model: n })}</span>
        <button @click=${this._createPreset}>${S("gswitchEditor.new_preset")}</button>
      </div>
    </div>`;
	}
	_renderRooms() {
		if (!this._allRooms.length) return h`<p class="hint">${S("gswitchEditor.no_rooms_with_module")}</p>`;
		let e = this._allRooms.filter((e) => this._rooms.includes(e.room_id)).map((e) => e.name);
		return h`<details class="multi">
      <summary>
        <span class=${e.length ? "" : "placeholder"}>
          ${e.length ? e.join(", ") : S("gswitchEditor.no_room")}
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
		let e = !!this.sw, t = this._preset(), n = this._allRooms.filter((e) => this._rooms.includes(e.room_id) && e.area_id).map((e) => e.area_id), { inArea: r, others: i } = bi(this._devices, (e) => yi(this.hass, e.device_id), n), a = (e) => ({
			value: e.device_id,
			label: e.name,
			secondary: e.model_label
		});
		return h`
      ${A(S("gswitchEditor.name"), this._name, (e) => this._onName(e), S("gswitchEditor.name_placeholder"))}
      ${e ? h`<div class="section">${S("gswitchEditor.id", { id: this.sw.id })}</div>` : ""}

      <div class="section">${S("gswitchEditor.device")}</div>
      ${this._devices.length ? h`<homex-select
            placeholder=${S("gswitchEditor.choose_switch")}
            .value=${this._deviceId}
            .options=${n.length ? [] : this._devices.map(a)}
            .groups=${n.length ? [...r.length ? [{
			label: S("gswitchEditor.area", { names: xi(this.hass, n) }),
			options: r.map(a)
		}] : [], {
			label: S("gswitchEditor.others"),
			options: i.map(a)
		}] : []}
            @value-changed=${(e) => this._onDevice(e.detail.value)}
          ></homex-select>` : h`<p class="hint">${S("gswitchEditor.no_devices")}</p>`}

      ${this._deviceId ? this._renderPreset(t) : ""}

      <div class="section">${S("gswitchEditor.rooms")}</div>
      ${this._renderRooms()}

      <div class="actions">
        ${e ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              ${S("common.delete")}
            </button>` : ""}
        <button @click=${this._close}>${S("common.cancel")}</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._save}>
          ${S(e ? "common.save" : "gswitchEditor.create_switch")}
        </button>
      </div>
    `;
	}
}, U = (Gi.styles = [O, o`
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
    `], Gi);
k([b({ attribute: !1 })], U.prototype, "hass", void 0), k([b({ attribute: !1 })], U.prototype, "sw", void 0), k([b({ attribute: !1 })], U.prototype, "presets", void 0), k([b({ attribute: !1 })], U.prototype, "initialRooms", void 0), k([b({ attribute: !1 })], U.prototype, "draft", void 0), k([x()], U.prototype, "_name", void 0), k([x()], U.prototype, "_id", void 0), k([x()], U.prototype, "_deviceId", void 0), k([x()], U.prototype, "_presetId", void 0), k([x()], U.prototype, "_devices", void 0), k([x()], U.prototype, "_rooms", void 0), k([x()], U.prototype, "_allRooms", void 0), k([x()], U.prototype, "_busy", void 0), U = k([y("homex-gswitch-editor")], U);
// src/components/homex-switch-manager.ts
var Ki, qi = [
	"switches",
	"presets",
	"layouts"
], W = (Ki = class extends v {
	constructor(...e) {
		super(...e), this.base = "", this.subpath = "", this._addRooms = [], this._layouts = [], this._presets = [], this._gswitches = [], this._loaded = !1, this._prefillDevice = "", this._switchFlowFrom = null, this._switchDraft = null;
	}
	connectedCallback() {
		super.connectedCallback(), this._load();
	}
	get _route() {
		let [e, t, n] = Tr(this.subpath);
		return {
			section: qi.includes(e) ? e : "switches",
			editing: t === "new" || t === "edit" && !!n,
			id: t === "edit" ? n : void 0
		};
	}
	get _section() {
		return this._route.section;
	}
	_url(e, ...t) {
		return e === "switches" && !t.length ? this.base : T(this.base, e, ...t);
	}
	_openEditor(e, t) {
		E(this._url(e, ...t ? ["edit", t] : ["new"]));
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
				Sn(this.hass),
				On(this.hass),
				Tn(this.hass)
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
		this._load(), D(this._url("layouts"));
	}
	_onPresetClosed(e) {
		this._prefillDevice = "", this._load();
		let t = this._switchFlowFrom;
		if (t) {
			let n = e?.detail?.preset_id;
			n && this._switchDraft && (this._switchDraft = {
				...this._switchDraft,
				preset_id: n
			}), this._switchFlowFrom = null, D(t);
		} else D(this._url("presets"));
	}
	_onSwitchClosed() {
		this._switchDraft = null, this._load(), D(this._url("switches"));
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
          ${this._loaded ? S("switchManager.not_found", { id: r }) : S("common.loading")}
        </div>
      ` };
	}
	render() {
		let { section: e, editing: t } = this._route;
		if (t && e === "layouts") {
			let e = () => this._onLayoutClosed(), t = this._editTarget(this._layouts, e, S("switchManager.layouts"));
			return "page" in t ? t.page : h`
        <div class="head">
          <button @click=${e}>← ${S("switchManager.layouts")}</button>
          <h2>${t.item ? S("switchManager.edit_layout") : S("switchManager.new_layout")}</h2>
        </div>
        <homex-layout-editor
          .hass=${this.hass}
          .layout=${t.item}
          @layout-closed=${this._onLayoutClosed}
        ></homex-layout-editor>
      `;
		}
		if (t && e === "presets") {
			let e = () => this._onPresetClosed(), t = this._editTarget(this._presets, e, S("switchManager.presets"));
			return "page" in t ? t.page : h`
        <div class="head">
          <button @click=${e}>← ${S("switchManager.presets")}</button>
          <h2>${t.item ? S("switchManager.edit_preset") : S("switchManager.new_preset")}</h2>
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
			let e = () => this._onSwitchClosed(), t = this._editTarget(this._gswitches, e, S("switchManager.switches"));
			return "page" in t ? t.page : h`
        <div class="head">
          <button @click=${e}>← ${S("switchManager.switches")}</button>
          <h2>${t.item ? S("switchManager.edit_switch") : S("switchManager.new_switch")}</h2>
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
		let n = this._section === "layouts" ? S("switchManager.add_layout") : this._section === "presets" ? S("switchManager.add_preset") : S("switchManager.add_switch");
		return h`
      <div class="head">
        <button @click=${this._back}>← Homex</button>
        <h2>${S("switchManager.title")}</h2>
        <button class="primary" @click=${this._add}>${n}</button>
      </div>
      <div class="tabs">
        ${[
			["switches", S("switchManager.switches")],
			["presets", S("switchManager.presets")],
			["layouts", S("switchManager.layouts")]
		].map(([e, t]) => h`<span
            class="tab ${this._section === e ? "active" : ""}"
            @click=${() => {
			e !== this._section && E(this._url(e), !0);
		}}
            >${t}</span
          >`)}
      </div>
      ${this._loaded ? this._section === "layouts" ? this._renderLayouts() : this._section === "presets" ? this._renderPresets() : this._renderSwitches() : h`<div class="msg">${S("common.loading")}</div>`}
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
            <div class="meta">${S("switchManager.layout_meta", {
			count: e.buttons,
			shape: S(`switchManager.shape_${e.shape}`)
		})}</div>
          </div>
        </div>`)}
    </div>` : h`<div class="msg">${S("switchManager.no_layouts")}</div>`;
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
    </div>` : h`<div class="msg">${S("switchManager.no_presets")}</div>`;
	}
	_renderSwitches() {
		return this._gswitches.length ? h`<div class="grid">
      ${this._gswitches.map((e) => {
			let t = Ar(this.hass, this._presets, e), n = t ? this._layouts.find((e) => e.id === t.layout_id) : void 0;
			return h`<div
          class="card"
          @click=${() => this._openEditor("switches", e.id)}
        >
          ${n ? this._preview(n) : h`<div class="icon">🎛</div>`}
          <div class="info">
            <div class="name">${e.name}</div>
            <div class="meta">
              ${t ? t.name : S("switchManager.no_preset")} ·
              ${S("switchManager.rooms_count", { count: (e.rooms || []).length })}
            </div>
          </div>
        </div>`;
		})}
    </div>` : h`<div class="msg">${S("switchManager.no_switches")}</div>`;
	}
}, Ki.styles = [O, o`
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
    `], Ki);
k([b({ attribute: !1 })], W.prototype, "hass", void 0), k([b({ attribute: !1 })], W.prototype, "base", void 0), k([b({ attribute: !1 })], W.prototype, "subpath", void 0), k([x()], W.prototype, "_addRooms", void 0), k([x()], W.prototype, "_layouts", void 0), k([x()], W.prototype, "_presets", void 0), k([x()], W.prototype, "_gswitches", void 0), k([x()], W.prototype, "_loaded", void 0), k([x()], W.prototype, "_prefillDevice", void 0), k([x()], W.prototype, "_switchDraft", void 0), W = k([y("homex-switch-manager")], W);
// src/components/homex-shutter-preset-editor.ts
var Ji = class extends v {
	constructor(...e) {
		super(...e), this.preset = null, this._name = "", this._nameTyped = !1, this._id = "", this._models = [], this._modelKey = "", this._deviceId = "", this._smart = !1, this._up = { ...G.EMPTY }, this._down = { ...G.EMPTY }, this._stopped = { ...G.EMPTY }, this._z2m = null, this._busy = !1, this._idEdited = !1;
	}
	_cond(e) {
		let t = Array.isArray(e) ? e[0] : e;
		if (!t) return { ...G.EMPTY };
		if (t.source === "cover") return {
			...G.EMPTY,
			source: "cover",
			state: t.state ?? ""
		};
		if (t.source === "z2m") return {
			...G.EMPTY,
			source: "z2m",
			field: t.field ?? "",
			state: t.state ?? ""
		};
		if (t.suffix !== void 0 || t.domain !== void 0) return {
			...G.EMPTY,
			domain: t.domain ?? "",
			suffix: t.suffix ?? "",
			state: t.state ?? ""
		};
		let [n, r = ""] = String(t.entity_id ?? "").split("."), i = this._deviceSlug(), a = i && r.startsWith(i + "_") ? r.slice(i.length + 1) : r;
		return {
			...G.EMPTY,
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
			let t = await Pn(this.hass, e);
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
			this._models = await Nn(this.hass);
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
		this._deviceId = t?.devices[0]?.device_id ?? "", this._up = { ...G.EMPTY }, this._down = { ...G.EMPTY }, this._stopped = { ...G.EMPTY }, !t || this._name.trim() && this._nameTyped || (this._name = t.label, this._idEdited || (this._id = M(t.label)));
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
		let a = `dl-${e}`, o = r.source === "z2m", s = r.source === "cover", c = !!this._z2m?.available, l, u;
		if (s) l = h`<span class="cover-src">${S("shutterPresetEditor.cover_state")}</span>`, u = [
			"opening",
			"closing",
			"open|closed"
		];
		else if (o) {
			let e = this._z2m?.fields ?? [], t = e.some((e) => e.field === r.field);
			l = e.length ? h`<homex-select
        placeholder=${S("shutterPresetEditor.z2m_field")}
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
            placeholder=${S("shutterPresetEditor.field_placeholder")}
            .value=${r.field ?? ""}
            @change=${(e) => i({
				...r,
				field: e.target.value.trim()
			})}
          />`;
			let n = r.field ? this._z2mValue(r.field) : "";
			u = n ? [n] : [];
		} else {
			let e = r.domain && r.suffix ? `${r.domain}|${r.suffix}` : "";
			l = h`<homex-select
        placeholder=${S("shutterPresetEditor.sensor")}
        .value=${e}
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
      ></homex-select>`, u = this._sensorValues(this._condEntityId(r));
		}
		return h`<div class="cond">
      <div class="section">${t}</div>
      <p class="hint">${n}</p>
      <div class="sources">
            <button
              class="src ${o || s ? "" : "on"}"
              @click=${() => i({
			...G.EMPTY,
			state: r.state
		})}
            >
              ${S("shutterPresetEditor.source_ha")}
            </button>
            <button
              class="src ${o ? "on" : ""}"
              ?disabled=${!c && !o}
              @click=${() => i({
			...G.EMPTY,
			source: "z2m",
			state: r.state
		})}
            >
              ${S("shutterPresetEditor.source_z2m")}
            </button>
            <button
              class="src ${s ? "on" : ""}"
              @click=${() => i({
			...G.EMPTY,
			source: "cover",
			state: r.state
		})}
            >
              ${S("shutterPresetEditor.source_cover")}
            </button>
          </div>
      <div class="cond-row">
        ${l}
        <input
          placeholder=${S("shutterPresetEditor.value")}
          list=${a}
          .value=${r.state}
          @change=${(e) => i({
			...r,
			state: e.target.value
		})}
        />
        <datalist id=${a}>
          ${u.map((e) => h`<option value=${e}></option>`)}
        </datalist>
      </div>
      ${o && this._z2m?.available && !this._z2m.fields.length ? h`<p class="hint">${S("shutterPresetEditor.z2m_no_state")}</p>` : ""}
    </div>`;
	}
	_close() {
		this.dispatchEvent(new CustomEvent("shutter-preset-closed"));
	}
	async _save() {
		let e = this._name.trim(), t = this._id.trim();
		if (!e || !t) {
			alert(S("shutterPresetEditor.name_id_required"));
			return;
		}
		if (!this._modelKey || !this._deviceId) {
			alert(S("shutterPresetEditor.choose_model_device"));
			return;
		}
		let n = (e) => this._smart ? {
			...e,
			state: (e.state || "").trim().toLowerCase()
		} : { ...G.EMPTY };
		this._busy = !0;
		try {
			await In(this.hass, {
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
			this._busy = !1, alert(S("common.error", { message: w(e) }));
		}
	}
	async _delete() {
		if (this.preset && confirm(S("shutterPresetEditor.confirm_delete", { name: this.preset.name }))) {
			this._busy = !0;
			try {
				await Ln(this.hass, this.preset.id), this._close();
			} catch (e) {
				this._busy = !1, alert(S("common.error", { message: w(e) }));
			}
		}
	}
	render() {
		let e = !!this.preset, t = this._model();
		return h`
      ${A(S("shutterPresetEditor.name"), this._name, (e) => this._onName(e), S("shutterPresetEditor.name_placeholder"))}
      ${e ? h`<div class="section">${S("shutterPresetEditor.id", { id: this.preset.id })}</div>` : ""}

      <div class="section">${S("shutterPresetEditor.shutter_model")}</div>
      ${this._models.length ? h`<homex-select
            placeholder=${S("shutterPresetEditor.choose_model")}
            .value=${this._modelKey}
            .options=${this._models.map((e) => ({
			value: e.model,
			label: e.label,
			tertiary: S("shutterPresetEditor.devices_count", { count: e.count })
		}))}
            @value-changed=${(e) => this._onModel(e.detail.value)}
          ></homex-select>` : h`<p class="hint">${S("shutterPresetEditor.no_shutters")}</p>`}

      ${t ? h`
            <div class="section">${S("shutterPresetEditor.ref_device")}</div>
            <p class="hint">${S("shutterPresetEditor.ref_device_hint")}</p>
            <homex-select
              .value=${this._deviceId}
              .options=${t.devices.map((e) => ({
			value: e.device_id,
			label: e.name
		}))}
              @value-changed=${(e) => {
			this._deviceId = e.detail.value, this._up = { ...G.EMPTY }, this._down = { ...G.EMPTY }, this._stopped = { ...G.EMPTY };
		}}
            ></homex-select>

            <label class="toggle-row">
              <span>${S("shutterPresetEditor.smart_toggle")}</span>
              <span class="toggle ${this._smart ? "on" : ""}">
                <input
                  type="checkbox"
                  .checked=${this._smart}
                  @change=${(e) => this._smart = e.target.checked}
                />
                <span class="knob"></span>
              </span>
            </label>
            <p class="hint">${S("shutterPresetEditor.smart_toggle_hint")}</p>
            ${this._smart ? h`
                  ${this._condEditor("up", S("shutterPresetEditor.up_title"), S("shutterPresetEditor.up_hint"), this._up, (e) => this._up = e)}
                  ${this._condEditor("down", S("shutterPresetEditor.down_title"), S("shutterPresetEditor.down_hint"), this._down, (e) => this._down = e)}
                  ${this._condEditor("stopped", S("shutterPresetEditor.stopped_title"), S("shutterPresetEditor.stopped_hint"), this._stopped, (e) => this._stopped = e)}
                ` : ""}
          ` : ""}

      <div class="actions">
        ${e ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              ${S("common.delete")}
            </button>` : ""}
        <button @click=${this._close}>${S("common.cancel")}</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._save}>
          ${S(e ? "common.save" : "shutterPresetEditor.create_preset")}
        </button>
      </div>
    `;
	}
}, G = Ji, K = (Ji.EMPTY = {
	source: "entity",
	domain: "",
	suffix: "",
	field: "",
	state: ""
}, Ji.styles = [O, o`
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
      .cover-src {
      flex: 1;
      align-self: center;
      color: var(--secondary-text-color);
      font-size: 13px;
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
    `], Ji);
k([b({ attribute: !1 })], K.prototype, "hass", void 0), k([b({ attribute: !1 })], K.prototype, "preset", void 0), k([x()], K.prototype, "_name", void 0), k([x()], K.prototype, "_id", void 0), k([x()], K.prototype, "_models", void 0), k([x()], K.prototype, "_modelKey", void 0), k([x()], K.prototype, "_deviceId", void 0), k([x()], K.prototype, "_smart", void 0), k([x()], K.prototype, "_up", void 0), k([x()], K.prototype, "_down", void 0), k([x()], K.prototype, "_stopped", void 0), k([x()], K.prototype, "_z2m", void 0), k([x()], K.prototype, "_busy", void 0), K = G = k([y("homex-shutter-preset-editor")], K);
// src/components/homex-shutter-manager.ts
var Yi = class extends v {
	constructor(...e) {
		super(...e), this._presets = [], this._loaded = !1, this.base = "", this.subpath = "";
	}
	connectedCallback() {
		super.connectedCallback(), this._load();
	}
	async _load() {
		try {
			this._presets = await Fn(this.hass);
		} catch {
			this._presets = [];
		}
		this._loaded = !0;
	}
	_back() {
		this.dispatchEvent(new CustomEvent("close"));
	}
	_onClosed() {
		this._load(), D(this.base);
	}
	_openEditor(e) {
		E(T(this.base, ...e ? ["edit", e] : ["new"]));
	}
	render() {
		let [e, t] = Tr(this.subpath);
		if (e === "new" || e === "edit" && t) {
			let e = t ? this._presets.find((e) => e.id === t) : null;
			return t && !e ? h`
          <div class="head">
            <button @click=${this._onClosed}>← ${S("shutterManager.presets")}</button>
            <h2></h2>
          </div>
          <div class="msg">
            ${this._loaded ? S("shutterManager.not_found", { id: t }) : S("common.loading")}
          </div>
        ` : h`
        <div class="head">
          <button @click=${this._onClosed}>← ${S("shutterManager.presets")}</button>
          <h2>${S(e ? "shutterManager.edit_preset" : "shutterManager.new_preset")}</h2>
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
        <h2>${S("shutterManager.title")}</h2>
        <button
          class="primary"
          @click=${() => this._openEditor()}
        >
          ${S("shutterManager.add_preset")}
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
                      ${e.model_label}${e.smart_toggle ? S("shutterManager.smart_toggle") : ""}
                    </div>
                  </div>
                </div>`)}
            </div>` : h`<div class="msg">${S("shutterManager.no_presets")}</div>` : h`<div class="msg">${S("common.loading")}</div>`}
    `;
	}
}, Xi = (Yi.styles = [O, o`
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
    `], Yi);
k([b({ attribute: !1 })], Xi.prototype, "hass", void 0), k([x()], Xi.prototype, "_presets", void 0), k([x()], Xi.prototype, "_loaded", void 0), k([b({ attribute: !1 })], Xi.prototype, "base", void 0), k([b({ attribute: !1 })], Xi.prototype, "subpath", void 0), Xi = k([y("homex-shutter-manager")], Xi);
// src/components/homex-heating-group-editor.ts
var Zi, Qi = "default", $i = 5, ea = 30, ta = .5, na = 12, ra = (e) => Math.min(ea, Math.max($i, Math.round(e / ta) * ta)), q = (Zi = class extends v {
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
		return this.group?.id === Qi;
	}
	_onName(e) {
		this._name = e, this._idEdited || (this._id = M(e));
	}
	_setTemp(e, t) {
		Number.isNaN(t) || (this._setpoints = {
			...this._setpoints,
			[e]: ra(t)
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
        title=${S("heatingGroupEditor.minus")}
        @click=${() => this._setTemp(e, (t ?? 20) - ta)}
      >
        <svg viewBox="0 0 24 24"><path d=${St}></path></svg>
      </button>
      <input
        type="number"
        inputmode="decimal"
        min=${$i}
        max=${ea}
        step=${ta}
        .value=${t == null ? "" : String(t)}
        placeholder="—"
        @change=${(t) => this._setTemp(e, parseFloat(t.target.value))}
      />
      <button
        title=${S("heatingGroupEditor.plus")}
        @click=${() => this._setTemp(e, (t ?? 20) + ta)}
      >
        <svg viewBox="0 0 24 24"><path d=${Et}></path></svg>
      </button>
      <span class="unit">°C</span>
    </div>`;
	}
	_setUnheatedCut(e, t) {
		let { [e]: n, ...r } = this._setpoints;
		this._setpoints = t ? r : {
			...r,
			[e]: na
		};
	}
	_close() {
		this.dispatchEvent(new CustomEvent("heating-group-closed"));
	}
	async _save() {
		this._busy = !0;
		try {
			await sr(this.hass, {
				id: this._id,
				name: this._name.trim(),
				rooms: this._isDefault ? [] : this._rooms,
				setpoints: this._setpoints
			}, !this.group), this._close();
		} catch (e) {
			alert(S("common.error", { message: w(e) })), this._busy = !1;
		}
	}
	async _delete() {
		if (this.group && confirm(S("heatingGroupEditor.delete_confirm", { name: this.group.name }))) {
			this._busy = !0;
			try {
				await cr(this.hass, this.group.id), this._close();
			} catch (e) {
				alert(S("common.error", { message: w(e) })), this._busy = !1;
			}
		}
	}
	render() {
		let e = !!this.group;
		return h`
      ${A(S("heatingGroupEditor.name"), this._name, (e) => this._onName(e), S("heatingGroupEditor.name_placeholder"))}
      ${e ? h`<div class="section">${S("heatingGroupEditor.id_label", { id: this.group.id })}</div>` : A(S("heatingGroupEditor.id"), this._id, (e) => {
			this._idEdited = !0, this._id = M(e);
		})}

      <div class="section">${S("heatingGroupEditor.setpoints")}</div>
      ${this.presets.map((e) => {
			let t = this._setpoints[e.id];
			if (e.unheated) {
				let n = t == null;
				return h`<div class="setpoint">
            <span class="label">${e.name}</span>
            <label class="cut">
              ${j(n, (t) => this._setUnheatedCut(e.id, t))}
              ${S("heatingGroupEditor.heating_off")}
            </label>
            ${n ? "" : this._stepper(e.id, t)}
          </div>`;
			}
			return h`<div class="setpoint">
          <span class="label">${e.name}</span>
          ${this._stepper(e.id, t)}
        </div>`;
		})}

      <div class="section">${S("heatingGroupEditor.rooms")}</div>
      ${this._isDefault ? h`<p class="hint">${S("heatingGroupEditor.default_hint")}</p>` : h`<p class="hint">${S("heatingGroupEditor.rooms_hint")}</p>
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
          ${S("common.save")}
        </button>
        <button ?disabled=${this._busy} @click=${this._close}>${S("common.cancel")}</button>
        ${e && !this.group.builtin ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              ${S("common.delete")}
            </button>` : ""}
      </div>
    `;
	}
}, Zi.styles = [O, o`
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
    `], Zi);
k([b({ attribute: !1 })], q.prototype, "hass", void 0), k([b({ attribute: !1 })], q.prototype, "group", void 0), k([b({ attribute: !1 })], q.prototype, "groups", void 0), k([b({ attribute: !1 })], q.prototype, "presets", void 0), k([b({ attribute: !1 })], q.prototype, "rooms", void 0), k([x()], q.prototype, "_name", void 0), k([x()], q.prototype, "_id", void 0), k([x()], q.prototype, "_rooms", void 0), k([x()], q.prototype, "_setpoints", void 0), k([x()], q.prototype, "_busy", void 0), q = k([y("homex-heating-group-editor")], q);
// src/components/homex-heating-device-preset-editor.ts
var ia, aa = [
	{
		key: "tolerance",
		label: () => S("heatingDevicePresetEditor.param_tolerance"),
		domains: ["number"],
		guess: /accuracy|precision|hysteresis|tolerance/
	},
	{
		key: "mode",
		label: () => S("heatingDevicePresetEditor.param_mode"),
		domains: ["climate", "select"],
		guess: /.*/
	},
	{
		key: "lock",
		label: () => S("heatingDevicePresetEditor.param_lock"),
		domains: ["switch", "lock"],
		guess: /child_lock|securite_enfants|verrou|lock/
	},
	{
		key: "sensor",
		label: () => S("heatingDevicePresetEditor.param_sensor"),
		domains: ["select", "switch"],
		guess: /sensor_select|temperature_sensor|capteur_de_temperature_externe|external.*sensor/
	}
], oa = () => [["on", S("heatingDevicePresetEditor.switch_on")], ["off", S("heatingDevicePresetEditor.switch_off")]], sa = () => [["locked", S("heatingDevicePresetEditor.locked")], ["unlocked", S("heatingDevicePresetEditor.unlocked")]], ca = (e) => aa.find((t) => t.key === e)?.label() ?? e, J = (ia = class extends v {
	constructor(...e) {
		super(...e), this.preset = null, this._models = [], this._name = "", this._id = "", this._modelKey = "", this._deviceId = "", this._params = this._emptyParams(), this._busy = !1, this._results = null, this._idEdited = !1, this._nameTyped = !1, this._extInput = "", this._created = !1;
	}
	connectedCallback() {
		super.connectedCallback(), this._loadModels();
	}
	async _loadModels() {
		try {
			this._models = await lr(this.hass);
		} catch {
			this._models = [];
		}
	}
	_emptyParams() {
		return Object.fromEntries(aa.map((e) => [e.key, {
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
			for (let n of aa) {
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
			case "switch": return oa();
			case "lock": return sa();
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
		for (let t of aa) {
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
		for (let t of aa) {
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
			this._results = await ur(this.hass, this._buildPreset(), !this.preset && !this._created), this._created = !0;
		} catch (e) {
			alert(S("common.error", { message: w(e) }));
		} finally {
			this._busy = !1;
		}
	}
	async _apply() {
		if (this.preset) {
			this._busy = !0;
			try {
				this._results = await fr(this.hass, this.preset.id);
			} catch (e) {
				alert(S("common.error", { message: w(e) }));
			} finally {
				this._busy = !1;
			}
		}
	}
	async _delete() {
		if (this.preset && confirm(S("heatingDevicePresetEditor.delete_confirm", { name: this.preset.name }))) {
			this._busy = !0;
			try {
				await dr(this.hass, this.preset.id), this._close();
			} catch (e) {
				alert(S("common.error", { message: w(e) })), this._busy = !1;
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
      placeholder=${S("heatingDevicePresetEditor.choose")}
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
        ${e.label()}
      </label>
      ${t.enabled ? h`<div class="param-body">
            <label>
              ${S("heatingDevicePresetEditor.entity", { domains: e.domains.join(" / ") })}
              <homex-select
                placeholder=${S("heatingDevicePresetEditor.choose")}
                .value=${t.entity}
                .options=${n.map((e) => ({
			value: e.key,
			label: e.suffix || S("heatingDevicePresetEditor.main_entity"),
			secondary: e.entity_id,
			tertiary: e.domain
		}))}
                @value-changed=${(t) => this._onParamEntity(e.key, t.detail.value)}
              ></homex-select>
            </label>
            ${e.key === "tolerance" ? this._renderToleranceValues(t, r, i) : h`<label>
                  ${S("heatingDevicePresetEditor.value")}
                  ${this._renderValue(e.key, t)}
                  ${r ? h`<span class="current">${S("heatingDevicePresetEditor.current", { value: i || "—" })}</span>` : ""}
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
        ${S("heatingDevicePresetEditor.mode_normal")}
        ${i(e.value, (e) => this._setParam("tolerance", { value: e }))}
      </label>
      <label>
        ${S("heatingDevicePresetEditor.mode_aggressive")}
        ${i(e.valueAgressive ?? "", (e) => this._setParam("tolerance", { valueAgressive: e }))}
      </label>
      ${t ? h`<span class="current">
            ${S("heatingDevicePresetEditor.current_tolerance", { value: n || "—" })}
          </span>` : ""}
    </div>`;
	}
	_renderExtInput() {
		let e = this._refEntities(["number"]);
		return h`<label class="wide">
      <span>
        ${j(!!this._extInput, (t) => this._extInput = t && (this._guessExtInput() || e[0]?.key) || "")}
        ${S("heatingDevicePresetEditor.external_sensor")}
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
            <span class="current">${S("heatingDevicePresetEditor.external_input_hint")}</span>` : ""}
    </label>`;
	}
	_renderResults() {
		let e = this._results;
		return e.length ? h`<div class="results">
      <strong>${S("heatingDevicePresetEditor.applied_on", { count: e.length })}</strong>
      ${e.map((e) => h`<div class="dev">
          ${e.failed.length ? h`<span class="ko">✗</span>` : h`<span class="ok">✓</span>`}
          ${e.name}
          ${e.applied.length ? h` · ${e.applied.map((e) => ca(e)).join(", ")}` : ""}
          ${e.failed.map((e) => h`<div class="ko">${S("heatingDevicePresetEditor.failed", {
			param: ca(e.param),
			error: e.error
		})}</div>`)}
        </div>`)}
    </div>` : h`<div class="results">${S("heatingDevicePresetEditor.no_device")}</div>`;
	}
	render() {
		let e = !!this.preset, t = this._model(), n = aa.some((e) => {
			let t = this._params[e.key];
			return t.enabled && t.entity && t.value !== "";
		});
		return h`
      ${A(S("heatingDevicePresetEditor.name"), this._name, (e) => {
			this._name = e, this._nameTyped = !0, this._idEdited || (this._id = M(e));
		}, S("heatingDevicePresetEditor.name_placeholder"))}
      ${e || this._created ? h`<div class="section">${S("heatingDevicePresetEditor.id_label", { id: this._id })}</div>` : A(S("heatingDevicePresetEditor.id"), this._id, (e) => {
			this._idEdited = !0, this._id = M(e);
		})}

      <div class="section">${S("heatingDevicePresetEditor.model")}</div>
      <homex-select
        placeholder=${S("heatingDevicePresetEditor.choose_model")}
        .value=${this._modelKey}
        .options=${this._models.map((e) => ({
			value: e.model,
			label: e.label,
			tertiary: S("heatingDevicePresetEditor.device_count", { count: e.count })
		}))}
        @value-changed=${(e) => this._onModel(e.detail.value)}
      ></homex-select>

      ${t ? h`
            <div class="section">${S("heatingDevicePresetEditor.reference_device")}</div>
            <p class="hint">${S("heatingDevicePresetEditor.reference_hint", { count: t.count })}</p>
            <homex-select
              .value=${this._deviceId}
              .options=${t.devices.map((e) => ({
			value: e.device_id,
			label: e.name
		}))}
              @value-changed=${(e) => this._onDevice(e.detail.value)}
            ></homex-select>

            <div class="section">${S("heatingDevicePresetEditor.settings")}</div>
            ${aa.map((e) => this._renderParam(e))}
          ` : this._modelKey ? h`<p class="hint">${S("heatingDevicePresetEditor.model_not_found")}</p>` : ""}

      ${this._results ? this._renderResults() : ""}

      <div class="actions">
        <button
          class="primary"
          ?disabled=${this._busy || !this._name.trim() || !this._id || !t || !n}
          @click=${this._save}
        >
          ${this._busy ? S("heatingDevicePresetEditor.applying") : S("heatingDevicePresetEditor.save_apply")}
        </button>
        ${e ? h`<button ?disabled=${this._busy} @click=${this._apply}>
              ${S("heatingDevicePresetEditor.apply_now")}
            </button>` : ""}
        <button ?disabled=${this._busy} @click=${this._close}>
          ${this._results ? S("heatingDevicePresetEditor.done") : S("common.cancel")}
        </button>
        ${e ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              ${S("common.delete")}
            </button>` : ""}
      </div>
    `;
	}
}, ia.styles = [O, o`
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
    `], ia);
k([b({ attribute: !1 })], J.prototype, "hass", void 0), k([b({ attribute: !1 })], J.prototype, "preset", void 0), k([x()], J.prototype, "_models", void 0), k([x()], J.prototype, "_name", void 0), k([x()], J.prototype, "_id", void 0), k([x()], J.prototype, "_modelKey", void 0), k([x()], J.prototype, "_deviceId", void 0), k([x()], J.prototype, "_params", void 0), k([x()], J.prototype, "_busy", void 0), k([x()], J.prototype, "_results", void 0), k([x()], J.prototype, "_extInput", void 0), J = k([y("homex-heating-device-preset-editor")], J);
// src/components/homex-heating-zone-editor.ts
var la, ua = "default", Y = (la = class extends v {
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
		return this.zone?.id === ua;
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
			await pr(this.hass, {
				id: this._id,
				name: this._name.trim(),
				rooms: this._isDefault ? [] : this._rooms,
				triggers: this._triggers
			}, !this.zone), this._close();
		} catch (e) {
			alert(S("common.error", { message: w(e) })), this._busy = !1;
		}
	}
	async _delete() {
		if (this.zone && confirm(S("heatingZoneEditor.delete_confirm", { name: this.zone.name }))) {
			this._busy = !0;
			try {
				await mr(this.hass, this.zone.id), this._close();
			} catch (e) {
				alert(S("common.error", { message: w(e) })), this._busy = !1;
			}
		}
	}
	render() {
		let e = !!this.zone;
		return h`
      ${A(S("heatingZoneEditor.name"), this._name, (e) => {
			this._name = e, this._idEdited || (this._id = M(e));
		}, S("heatingZoneEditor.name_placeholder"))}
      ${e ? h`<div class="section">${S("heatingZoneEditor.id_label", { id: this.zone.id })}</div>` : A(S("heatingZoneEditor.id"), this._id, (e) => {
			this._idEdited = !0, this._id = M(e);
		})}
      ${this._id ? h`<p class="hint">
            ${S("heatingZoneEditor.control_entity")} <code>select.homex_heating_${this._id}</code>
          </p>` : ""}

      <div class="section">${S("heatingZoneEditor.rooms")}</div>
      ${this._isDefault ? h`<p class="hint">${S("heatingZoneEditor.default_hint")}</p>` : h`<p class="hint">${S("heatingZoneEditor.rooms_hint")}</p>
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

      <div class="section">${S("heatingZoneEditor.triggers")}</div>
      <p class="hint">${S("heatingZoneEditor.triggers_hint")}</p>
      ${this.modes.map((e) => {
			let t = this._triggers[e.id] ?? [];
			return h`<details class="mode" ?open=${t.length > 0}>
          <summary>
            ${e.name}
            <span class="count">${S("heatingZoneEditor.trigger_count", { count: t.length })}</span>
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
          ${S("common.save")}
        </button>
        <button ?disabled=${this._busy} @click=${this._close}>${S("common.cancel")}</button>
        ${e && !this.zone.builtin ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              ${S("common.delete")}
            </button>` : ""}
      </div>
    `;
	}
}, la.styles = [O, o`
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
    `], la);
k([b({ attribute: !1 })], Y.prototype, "hass", void 0), k([b({ attribute: !1 })], Y.prototype, "zone", void 0), k([b({ attribute: !1 })], Y.prototype, "zones", void 0), k([b({ attribute: !1 })], Y.prototype, "modes", void 0), k([b({ attribute: !1 })], Y.prototype, "rooms", void 0), k([x()], Y.prototype, "_name", void 0), k([x()], Y.prototype, "_id", void 0), k([x()], Y.prototype, "_rooms", void 0), k([x()], Y.prototype, "_triggers", void 0), k([x()], Y.prototype, "_busy", void 0), Y = k([y("homex-heating-zone-editor")], Y);
// src/components/homex-heating-system-editor.ts
var da, fa = "global", pa = ["switch", "input_boolean"], ma = ["input_number", "number"], ha = [
	["setpoint_sensor", () => S("heatingSystemEditor.sensor_setpoint")],
	["tank_sensor", () => S("heatingSystemEditor.sensor_tank")],
	["flow_sensor", () => S("heatingSystemEditor.sensor_flow")],
	["return_sensor", () => S("heatingSystemEditor.sensor_return")]
], ga = {
	setpoint_tank: {
		label: () => S("heatingSystemEditor.rule_setpoint_tank"),
		add: () => S("heatingSystemEditor.add_rule_setpoint_tank"),
		gap: ["setpoint_sensor", "tank_sensor"],
		a: () => S("heatingSystemEditor.short_setpoint"),
		b: () => S("heatingSystemEditor.short_tank"),
		init: ["6", "3"]
	},
	flow_return: {
		label: () => S("heatingSystemEditor.rule_flow_return"),
		add: () => S("heatingSystemEditor.add_rule_flow_return"),
		gap: ["flow_sensor", "return_sensor"],
		a: () => S("heatingSystemEditor.short_flow"),
		b: () => S("heatingSystemEditor.short_return"),
		init: ["10", "5"]
	}
}, _a = { delta: "setpoint_tank" }, va = [["boiler", () => S("heatingSystemEditor.type_boiler")], ["buffer_tank", () => S("heatingSystemEditor.type_buffer_tank")]], X = (da = class extends v {
	constructor(...e) {
		super(...e), this.system = null, this.zones = [], this._sysName = "", this._id = "", this._type = "boiler", this._contact = "", this._zones = [fa], this._aggressive = !1, this._tank = {
			setpoint_sensor: "",
			tank_sensor: "",
			flow_sensor: "",
			return_sensor: ""
		}, this._circulator = "", this._minRuntime = "5", this._rules = [], this._busy = !1, this._idEdited = !1;
	}
	willUpdate(e) {
		if (e.has("system")) {
			let e = this.system;
			this._sysName = e?.name ?? "", this._id = e?.id ?? "", this._type = e?.type ?? "boiler", this._contact = e?.contact ?? "", this._zones = [...e?.zones?.length ? e.zones : [fa]], this._aggressive = e?.aggressive ?? !1, this._tank = {
				setpoint_sensor: e?.setpoint_sensor ?? "",
				tank_sensor: e?.tank_sensor ?? "",
				flow_sensor: e?.flow_sensor ?? "",
				return_sensor: e?.return_sensor ?? ""
			}, this._circulator = e?.circulator ?? "", this._minRuntime = String(e?.min_runtime ?? 5), this._rules = (e?.rules ?? []).map((e) => ({
				type: _a[e.type] ?? e.type,
				delta: String(e.delta),
				tolerance: String(e.tolerance)
			})), this._idEdited = !!e, this._busy = !1;
		}
	}
	get _contacts() {
		let e = (e) => this.hass.states[e]?.attributes?.friendly_name || e;
		return Object.keys(this.hass.states).filter((e) => pa.includes(e.split(".")[0])).sort((t, n) => e(t).localeCompare(e(n)));
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
		let n = (e) => e ? this.hass.areas?.[e]?.name ?? e : S("heatingSystemEditor.no_area");
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
			return e && ma.includes(n) ? !0 : n === "sensor" && (r.device_class === "temperature" || ["°C", "°F"].includes(r.unit_of_measurement));
		});
	}
	_value(e) {
		let t = parseFloat(this.hass.states[e]?.state ?? "");
		return Number.isNaN(t) ? null : t;
	}
	_ruleError(e) {
		let t = parseFloat(e.delta), n = parseFloat(e.tolerance);
		return Number.isNaN(t) || Number.isNaN(n) ? S("heatingSystemEditor.rule_required") : t <= 0 || n < 0 || n >= t ? S("heatingSystemEditor.rule_invalid") : "";
	}
	get _required() {
		return new Set(this._rules.flatMap((e) => ga[e.type].gap));
	}
	get _tankValid() {
		return [...this._required].every((e) => !!this._tank[e]) && !!this._circulator && !Number.isNaN(parseFloat(this._minRuntime)) && this._rules.every((e) => !this._ruleError(e));
	}
	_toggleZone(e) {
		let t = this._zones.filter((e) => e !== fa), n = t.includes(e) ? t.filter((t) => t !== e) : [...t, e];
		this._zones = n.length ? n : [fa];
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
			await vr(this.hass, t, !this.system), this._close();
		} catch (e) {
			alert(S("common.error", { message: w(e) })), this._busy = !1;
		}
	}
	async _delete() {
		if (this.system && confirm(S("heatingSystemEditor.delete_confirm", { name: this.system.name }))) {
			this._busy = !0;
			try {
				await yr(this.hass, this.system.id), this._close();
			} catch (e) {
				alert(S("common.error", { message: w(e) })), this._busy = !1;
			}
		}
	}
	_renderBoiler() {
		let e = (e) => this._name(e);
		return h`
      <div class="section">${S("heatingSystemEditor.dry_contact")}</div>
      <p class="hint">${S("heatingSystemEditor.dry_contact_hint")}</p>
      <homex-select
        placeholder=${S("heatingSystemEditor.choose_switch")}
        .value=${this._contact}
        .options=${this._contacts.map((t) => ({
			value: t,
			label: e(t),
			secondary: t
		}))}
        @value-changed=${(e) => this._contact = e.detail.value}
      ></homex-select>

      ${this._renderScope(S("heatingSystemEditor.driven_contact"))}
    `;
	}
	_renderScope(e) {
		let t = this._zones.includes(fa);
		return h`
      <div class="section">${S("heatingSystemEditor.scope")}</div>
      <p class="hint">${S("heatingSystemEditor.scope_hint")}</p>
      <div class="checks">
        <label>
          ${j(t, () => this._zones = [fa])}
          ${S("heatingSystemEditor.global_system")}
        </label>
        ${this.zones.map((e) => h`<label>
            ${j(!t && this._zones.includes(e.id), () => this._toggleZone(e.id))}
            ${S("heatingSystemEditor.zone", { name: e.name })}
          </label>`)}
      </div>

      <div class="section">${S("heatingSystemEditor.aggressive_mode")}</div>
      <div class="checks">
        <label>
          ${j(this._aggressive, (e) => this._aggressive = e)}
          ${S("heatingSystemEditor.aggressive_hint", { driven: e })}
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
		let [t, n] = ga[e].init;
		this._rules = [...this._rules, {
			type: e,
			delta: t,
			tolerance: n
		}];
	}
	_renderRule(e, t) {
		let n = ga[e.type], r = this._ruleError(e), i = (e) => `${Math.round(e * 10) / 10} °C`, [a, o] = n.gap, s = this._value(this._tank[a]), c = this._value(this._tank[o]), l = r;
		if (!r && e.type === "setpoint_tank") {
			let t = parseFloat(e.delta), n = parseFloat(e.tolerance);
			l = s == null ? S("heatingSystemEditor.explain_setpoint_tank", {
				delta: e.delta,
				tolerance: e.tolerance
			}) : S("heatingSystemEditor.explain_setpoint_tank_live", {
				setpoint: i(s),
				start: i(s - t),
				stop: i(s - n)
			});
		} else r || (l = S("heatingSystemEditor.explain_flow_return", {
			delta: e.delta,
			tolerance: e.tolerance
		}));
		let u = !r && s != null && c != null ? S("heatingSystemEditor.currently", {
			a: n.a(),
			b: n.b(),
			value: i(Math.max(0, s - c))
		}) : "";
		return h`<div class="rule">
      <div class="title">${S("heatingSystemEditor.rule_title", {
			n: t + 1,
			label: n.label()
		})}</div>
      ${this._num(S("heatingSystemEditor.delta"), e.delta, (e) => this._setRule(t, { delta: e }))}
      ${this._num(S("heatingSystemEditor.tolerance"), e.tolerance, (e) => this._setRule(t, { tolerance: e }))}
      <button
        title=${S("heatingSystemEditor.delete_rule")}
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
          ${S("heatingSystemEditor.manual_override")}
        </label>
      </div>
      <p class="hint">
        ${S("heatingSystemEditor.force_hint")}
        ${t ? h`${S("heatingSystemEditor.force_entity")} <code>${e}</code> ${S("heatingSystemEditor.force_entity_suffix")}` : S("heatingSystemEditor.force_unavailable")}
      </p>`;
	}
	_renderTank() {
		let e = this._grouped(this._tempSensors(!1)), t = this._grouped(this._tempSensors(!0)), n = this._grouped(this._contacts);
		return h`
      <div class="section">${S("heatingSystemEditor.sensors")}</div>
      <div class="tank-grid">
        ${ha.map(([n, r]) => h`<homex-select
            label=${this._required.has(n) ? S("heatingSystemEditor.required", { label: r() }) : r()}
            placeholder=${S("heatingSystemEditor.choose_sensor")}
            .value=${this._tank[n]}
            .groups=${n === "setpoint_sensor" ? t : e}
            @value-changed=${(e) => this._tank = {
			...this._tank,
			[n]: e.detail.value
		}}
          ></homex-select>`)}
      </div>

      <div class="section">${S("heatingSystemEditor.circulator")}</div>
      <div class="tank-grid">
        <homex-select
          label=${S("heatingSystemEditor.controlled_switch")}
          placeholder=${S("heatingSystemEditor.choose_switch")}
          .value=${this._circulator}
          .groups=${n}
          @value-changed=${(e) => this._circulator = e.detail.value}
        ></homex-select>
        ${this._num(S("heatingSystemEditor.min_runtime"), this._minRuntime, (e) => this._minRuntime = e, "1")}
      </div>
      ${this._renderForce()}

      <div class="section">${S("heatingSystemEditor.rules")}</div>
      <p class="hint">${S("heatingSystemEditor.rules_hint")}</p>
      ${this._rules.map((e, t) => this._renderRule(e, t))}
      <div class="rule-add">
        ${Object.keys(ga).filter((e) => !this._rules.some((t) => t.type === e)).map((e) => h`<button @click=${() => this._addRule(e)}>${ga[e].add()}</button>`)}
      </div>
    `;
	}
	render() {
		let e = !!this.system;
		return h`
      ${A(S("heatingSystemEditor.name"), this._sysName, (e) => {
			this._sysName = e, this._idEdited || (this._id = M(e));
		}, S("heatingSystemEditor.name_placeholder"))}
      ${e ? h`<div class="section">${S("heatingSystemEditor.id_label", { id: this.system.id })}</div>` : A(S("heatingSystemEditor.id"), this._id, (e) => {
			this._idEdited = !0, this._id = M(e);
		})}

      <div class="section">${S("heatingSystemEditor.type")}</div>
      <div class="btn-group">
        ${va.map(([e, t]) => h`<button
            class=${this._type === e ? "active" : ""}
            @click=${() => this._type = e}
          >
            ${t()}
          </button>`)}
      </div>

      ${this._type === "boiler" ? this._renderBoiler() : this._type === "buffer_tank" ? h`${this._renderTank()}${this._renderScope(S("heatingSystemEditor.driven_circulator"))}` : h`<p class="hint">${S("heatingSystemEditor.heat_pump_unavailable")}</p>`}

      <div class="actions">
        <button
          class="primary"
          ?disabled=${this._busy || !this._sysName.trim() || !this._id || this._type === "buffer_tank" && !this._tankValid}
          @click=${this._save}
        >
          ${S("common.save")}
        </button>
        <button ?disabled=${this._busy} @click=${this._close}>${S("common.cancel")}</button>
        ${e ? h`<button class="danger" ?disabled=${this._busy} @click=${this._delete}>
              ${S("common.delete")}
            </button>` : ""}
      </div>
    `;
	}
}, da.styles = [O, o`
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
    `], da);
k([b({ attribute: !1 })], X.prototype, "hass", void 0), k([b({ attribute: !1 })], X.prototype, "system", void 0), k([b({ attribute: !1 })], X.prototype, "zones", void 0), k([x()], X.prototype, "_sysName", void 0), k([x()], X.prototype, "_id", void 0), k([x()], X.prototype, "_type", void 0), k([x()], X.prototype, "_contact", void 0), k([x()], X.prototype, "_zones", void 0), k([x()], X.prototype, "_aggressive", void 0), k([x()], X.prototype, "_tank", void 0), k([x()], X.prototype, "_circulator", void 0), k([x()], X.prototype, "_minRuntime", void 0), k([x()], X.prototype, "_rules", void 0), k([x()], X.prototype, "_busy", void 0), X = k([y("homex-heating-system-editor")], X);
// src/components/homex-heating-manager.ts
var ya, ba = [
	"modes",
	"setpoints",
	"zones",
	"devices",
	"systems"
], xa = (e) => S(`heatingManager.section_${e}`), Sa = (e) => S(`heatingManager.add_${e}`), Ca = [
	"tolerance",
	"mode",
	"lock",
	"sensor"
], wa = (e) => Ca.includes(e) ? S(`heatingManager.param_${e}`) : e, Ta = (e) => e == null ? "—" : `${e.toLocaleString(_n())} °C`, Z = (ya = class extends v {
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
			let [e, t] = await Promise.all([ir(this.hass), Rn(this.hass)]);
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
		let [e, t, n] = Tr(this.subpath);
		return {
			section: ba.includes(e) ? e : "modes",
			editing: t === "new" || t === "edit" && !!n,
			id: t === "edit" ? n : void 0
		};
	}
	_url(e, ...t) {
		return e === "modes" && !t.length ? this.base : T(this.base, e, ...t);
	}
	_openEditor(e, t) {
		E(this._url(e, ...t ? ["edit", t] : ["new"]));
	}
	_closeEditor(e) {
		this._load(), D(this._url(e));
	}
	async _setEnabled(e) {
		this._switching = !0;
		try {
			await _r(this.hass, e), this._enabledLocal = e;
		} catch (e) {
			alert(S("common.error", { message: w(e) }));
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
			await ar(this.hass, {
				id: this._presetId,
				name: this._presetName.trim()
			}, !e), this._closeEditor("modes");
		} catch (e) {
			alert(S("common.error", { message: w(e) })), this._busy = !1;
		}
	}
	async _deletePreset(e) {
		if (confirm(S("heatingManager.delete_mode_confirm", { name: e.name }))) {
			this._busy = !0;
			try {
				await or(this.hass, e.id), this._closeEditor("modes");
			} catch (e) {
				alert(S("common.error", { message: w(e) })), this._busy = !1;
			}
		}
	}
	_renderPresetEditor(e) {
		let t = () => this._closeEditor("modes");
		return h`
      <div class="head">
        <button @click=${t}>← ${xa("modes")}</button>
        <h2>${S(e ? "heatingManager.edit_mode" : "heatingManager.new_mode")}</h2>
      </div>
      <div class="editor">
        ${A(S("heatingManager.name"), this._presetName, (e) => {
			this._presetName = e, this._presetIdEdited || (this._presetId = M(e));
		}, S("heatingManager.name_placeholder"))}
        ${e ? h`<div class="section">${S("heatingManager.id_label", { id: e.id })}</div>` : A(S("heatingManager.id"), this._presetId, (e) => {
			this._presetIdEdited = !0, this._presetId = M(e);
		})}
        ${e?.builtin ? h`<p class="hint">${S("heatingManager.builtin_hint")}</p>` : ""}
        <div class="actions">
          <button
            class="primary"
            ?disabled=${this._busy || !this._presetName.trim() || !this._presetId}
            @click=${() => this._savePreset(e)}
          >
            ${S("common.save")}
          </button>
          <button ?disabled=${this._busy} @click=${t}>${S("common.cancel")}</button>
          ${e && !e.builtin ? h`<button
                class="danger"
                ?disabled=${this._busy}
                @click=${() => this._deletePreset(e)}
              >
                ${S("common.delete")}
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
                ${e.id}${e.builtin ? S("heatingManager.builtin_tag") : ""}${e.unheated ? S("heatingManager.unheated_tag") : ""}
              </div>
            </div>
          </div>
        </div>`)}
    </div>`;
	}
	_roomNames(e, t = this._groups, n = Qi) {
		if (e.id === n) {
			let e = new Set(t.flatMap((e) => e.rooms)), n = this._rooms.filter((t) => !e.has(t.room_id));
			return n.length ? S("heatingManager.other_rooms", { rooms: n.map((e) => e.name).join(", ") }) : S("heatingManager.all_other_rooms");
		}
		return e.rooms.length ? e.rooms.map((e) => this._rooms.find((t) => t.room_id === e)?.name ?? e).join(", ") : S("heatingManager.no_rooms");
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
                ${t.unheated && e.setpoints[t.id] == null ? S("heatingManager.off") : Ta(e.setpoints[t.id])}</span
              >`)}
          </div>
        </div>`)}
    </div>`;
	}
	async _setZoneMode(e, t) {
		try {
			await hr(this.hass, e.id, t), this._zones = this._zones.map((n) => n.id === e.id ? {
				...n,
				mode: t
			} : n);
		} catch (e) {
			alert(S("common.error", { message: w(e) }));
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
                ${this._roomNames(e, this._zones, ua)}
              </div>
            </div>
          </div>
          <label class="zone-mode" @click=${(e) => e.stopPropagation()}>
            ${S("heatingManager.active_mode")}
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
            select.homex_heating_${e.id} · ${S("heatingManager.triggers", { count: t })}
          </div>
        </div>`;
		})}
    </div>`;
	}
	_renderSystems() {
		if (!this._systems.length) return h`<div class="msg">${S("heatingManager.no_systems")}</div>`;
		let e = (e) => e === "global" ? S("heatingManager.global") : this._zones.find((t) => t.id === e)?.name ?? e;
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
                ${t.type === "boiler" ? S("heatingManager.boiler") : S("heatingManager.heat_pump")} ·
                ${(t.zones ?? ["global"]).map(e).join(", ")}
              </div>
            </div>
          </div>
          ${t.type === "boiler" ? h`<div class="temps">
                <span class="temp">
                  ${S("heatingManager.contact")}
                  ${n?.attributes?.friendly_name ?? (t.contact || "—")}
                  ${n ? `(${n.state})` : ""}
                </span>
                ${t.aggressive ? h`<span class="temp">${S("heatingManager.aggressive")}</span>` : ""}
              </div>` : ""}
        </div>`;
		})}
    </div>`;
	}
	_renderTankCard(e) {
		let t = (e) => e === "global" ? S("heatingManager.global") : this._zones.find((t) => t.id === e)?.name ?? e, n = (e) => {
			let t = e ? this.hass.states[e] : void 0, n = parseFloat(t?.state ?? "");
			return Number.isNaN(n) ? "—" : `${n} °C`;
		}, r = e.circulator ? this.hass.states[e.circulator] : void 0, i = e.rules ?? [];
		return h`<div class="card" @click=${() => this._openEditor("systems", e.id)}>
      <div class="card-head">
        <div class="icon">🛢️</div>
        <div>
          <div class="name">${e.name}</div>
          <div class="meta">
            ${S("heatingManager.buffer_tank")} · ${(e.zones ?? ["global"]).map(t).join(", ")} ·
            ${S("heatingManager.rules", { count: i.length })} · min ${e.min_runtime ?? 0} min
          </div>
        </div>
      </div>
      <div class="temps">
        <span class="temp" title=${S("heatingManager.setpoint")}>🎯 ${n(e.setpoint_sensor)}</span>
        ${e.tank_sensor ? h`<span class="temp" title=${S("heatingManager.tank")}>🛢 ${n(e.tank_sensor)}</span>` : ""}
        ${e.flow_sensor ? h`<span class="temp" title=${S("heatingManager.flow")}>↗ ${n(e.flow_sensor)}</span>` : ""}
        <span class="temp" title=${S("heatingManager.return")}>↘ ${n(e.return_sensor)}</span>
        ${e.aggressive ? h`<span class="temp">${S("heatingManager.aggressive")}</span>` : ""}
        ${this.hass.states[`switch.homex_system_${e.id}_force`]?.state === "on" ? h`<span class="temp" title=${S("heatingManager.forced_title")}>${S("heatingManager.forced")}</span>` : ""}
        ${(() => {
			let t = parseFloat(this.hass.states[`sensor.homex_system_${e.id}_runtime_today`]?.state ?? "");
			if (Number.isNaN(t)) return "";
			let n = Math.round(t), r = n >= 60 ? `${Math.floor(n / 60)} h ${String(n % 60).padStart(2, "0")}` : `${n} min`;
			return h`<span class="temp" title=${S("heatingManager.runtime_title")}>⏱ ${r}</span>`;
		})()}
        <span class="temp" title=${r?.attributes?.friendly_name ?? e.circulator ?? ""}>
          ${S("heatingManager.circulator")} ${r ? r.state === "on" ? S("heatingManager.circulator_on") : r.state === "off" ? S("heatingManager.circulator_off") : r.state : "—"}
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
                      >${wa(e)} ·
                      ${String(t.value)}${t.value_agressive == null ? "" : ` / ${t.value_agressive}`}</span
                    >`) : h`<span class="meta">${S("heatingManager.no_settings")}</span>`}
          </div>
        </div>`;
		})}
    </div>` : h`<div class="msg">${S("heatingManager.no_device_presets")}</div>`;
	}
	_notFound(e, t) {
		return h`
      <div class="head">
        <button @click=${() => this._closeEditor(e)}>
          ← ${xa(e)}
        </button>
        <h2></h2>
      </div>
      <div class="msg">${this._loaded ? S("heatingManager.not_found", { id: t }) : S("common.loading")}</div>
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
          <button @click=${() => this._closeEditor("systems")}>← ${xa("systems")}</button>
          <h2>${S(t ? "heatingManager.edit_system" : "heatingManager.new_system")}</h2>
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
          <button @click=${() => this._closeEditor("zones")}>← ${xa("zones")}</button>
          <h2>${S(t ? "heatingManager.edit_zone" : "heatingManager.new_zone")}</h2>
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
          <button @click=${() => this._closeEditor("devices")}>← ${xa("devices")}</button>
          <h2>${S(t ? "heatingManager.edit_device_preset" : "heatingManager.new_device_preset")}</h2>
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
          <button @click=${() => this._closeEditor("setpoints")}>← ${xa("setpoints")}</button>
          <h2>${S(t ? "heatingManager.edit_setpoint" : "heatingManager.new_setpoint")}</h2>
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
        <button @click=${this._back}>${S("heatingManager.back_climate")}</button>
        <h2>${S("heatingManager.title")}</h2>
        <label
          class="master ${this._enabled ? "on" : ""}"
          title=${this._enabled ? S("heatingManager.disable_title") : S("heatingManager.enable_title")}
        >
          ${this._enabled ? S("heatingManager.heating_enabled") : S("heatingManager.heating_disabled")}
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
        ${ba.map((e) => [e, xa(e)]).map(([t, n]) => h`<span
            class="tab ${e === t ? "active" : ""}"
            @click=${() => {
			t !== e && E(this._url(t), !0);
		}}
            >${n}</span
          >`)}
      </div>
      <!-- Phones: too many tabs for one row, a section picker instead. -->
      <homex-select
        class="tab-picker"
        .value=${e}
        .options=${ba.map((e) => ({
			value: e,
			label: xa(e)
		}))}
        @value-changed=${(t) => {
			t.detail.value !== e && E(this._url(t.detail.value), !0);
		}}
      ></homex-select>
      <div class="tab-actions">
        <button class="primary" @click=${() => this._openEditor(e)}>
          ${Sa(e)}
        </button>
      </div>
      ${this._loaded ? e === "modes" ? this._renderPresets() : e === "setpoints" ? this._renderGroups() : e === "zones" ? this._renderZones() : e === "systems" ? this._renderSystems() : this._renderDevicePresets() : h`<div class="msg">${S("common.loading")}</div>`}
    `;
	}
}, ya.styles = [O, o`
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
    `], ya);
k([b({ attribute: !1 })], Z.prototype, "hass", void 0), k([b({ attribute: !1 })], Z.prototype, "base", void 0), k([b({ attribute: !1 })], Z.prototype, "subpath", void 0), k([x()], Z.prototype, "_presets", void 0), k([x()], Z.prototype, "_groups", void 0), k([x()], Z.prototype, "_devicePresets", void 0), k([x()], Z.prototype, "_zones", void 0), k([x()], Z.prototype, "_systems", void 0), k([x()], Z.prototype, "_enabledLocal", void 0), k([x()], Z.prototype, "_switching", void 0), k([x()], Z.prototype, "_rooms", void 0), k([x()], Z.prototype, "_loaded", void 0), k([x()], Z.prototype, "_presetName", void 0), k([x()], Z.prototype, "_presetId", void 0), k([x()], Z.prototype, "_busy", void 0), Z = k([y("homex-heating-manager")], Z);
// src/components/homex-climate-metrics.ts
var Ea, Da = "heating", Oa = [
	{
		key: "temperature",
		label: () => S("climateMetrics.temperature"),
		icon: "🌡",
		deviceClass: "temperature",
		section: () => S("climateMetrics.temperature")
	},
	{
		key: "humidity",
		label: () => S("climateMetrics.humidity"),
		icon: "💧",
		deviceClass: "humidity",
		section: () => S("climateMetrics.humidity")
	},
	{
		key: "pm25",
		label: () => "PM2.5",
		icon: "🌫",
		deviceClass: "pm25",
		section: () => S("climateMetrics.air_quality")
	},
	{
		key: "pm10",
		label: () => "PM10",
		icon: "🌫",
		deviceClass: "pm10",
		section: () => S("climateMetrics.air_quality")
	},
	{
		key: "co2",
		label: () => "CO₂",
		icon: "🫧",
		deviceClass: "carbon_dioxide",
		section: () => "CO₂"
	}
], ka = [
	["mean", () => S("climateMetrics.rule_mean")],
	["max", () => S("climateMetrics.rule_max")],
	["min", () => S("climateMetrics.rule_min")]
];
function Aa(e, t) {
	if (!e.length) return null;
	if (t === "max") return Math.max(...e.map(([e]) => e));
	if (t === "min") return Math.min(...e.map(([e]) => e));
	let n = e.reduce((e, [, t]) => e + t, 0);
	return n <= 0 ? e.reduce((e, [t]) => e + t, 0) / e.length : e.reduce((e, [t, n]) => e + t * n, 0) / n;
}
var ja = (Ea = class extends v {
	constructor(...e) {
		super(...e), this.base = "", this.subpath = "", this._rooms = [], this._loaded = !1, this._draft = {}, this._busy = !1, this._draftFor = null;
	}
	connectedCallback() {
		super.connectedCallback(), this._load();
	}
	async _load() {
		try {
			this._rooms = await Rn(this.hass);
		} catch {
			this._rooms = [];
		}
		this._loaded = !0;
	}
	get _roomId() {
		return Tr(this.subpath)[0] ?? null;
	}
	willUpdate() {
		let e = this._roomId ? this._rooms.find((e) => e.room_id === this._roomId) : null;
		e ? this._draftFor !== e.room_id && (this._draftFor = e.room_id, this._draft = JSON.parse(JSON.stringify(e.metrics ?? {})), this._busy = !1) : this._draftFor = null;
	}
	_hasClimate(e) {
		return (e.modules ?? []).includes(Da);
	}
	async _openRoom(e) {
		if (!this._hasClimate(e)) {
			if (!confirm(S("climateMetrics.enable_module", { room: e.name }))) return;
			try {
				await Kn(this.hass, {
					entry_id: e.entry_id,
					modules: [...e.modules ?? [], Da]
				}), await this._load();
			} catch (e) {
				alert(S("common.error", { message: w(e) }));
				return;
			}
		}
		E(T(this.base, e.room_id));
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
		let n = (e, t) => this._friendly(e).localeCompare(this._friendly(t)), r = Object.keys(this.hass.states).filter((t) => t.startsWith("sensor.") && !t.startsWith("sensor.homex_") && this.hass.states[t]?.attributes?.device_class === e.deviceClass), i = t.area_id ? r.filter((e) => vi(this.hass, e) === t.area_id).sort(n) : [];
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
		let i = Aa(n, t.rule);
		return i == null ? "—" : `${Math.round(i * 10) / 10}${r ? " " + r : ""}`;
	}
	async _save(e) {
		this._busy = !0;
		try {
			await Kn(this.hass, {
				entry_id: e.entry_id,
				metrics: this._draft
			}), this._draftFor = null, await this._load(), D(this.base);
		} catch (e) {
			alert(S("common.error", { message: w(e) })), this._busy = !1;
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
        <span class="title">${e.icon} ${e.label()}</span>
        ${n.sensors.length ? h`<span class="ref">${this._reference(e.key)}</span>` : ""}
      </div>
      ${n.sensors.length > 1 ? h`<homex-select
            class="rule"
            label=${S("climateMetrics.rule_label")}
            .value=${n.rule}
            .options=${ka.map(([e, t]) => ({
			value: e,
			label: t()
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
                title=${S("climateMetrics.weight")}
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
            title=${S("climateMetrics.remove")}
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
        placeholder=${S("climateMetrics.add_sensor")}
        value=""
        .groups=${[...r.length ? [{
			label: S("climateMetrics.area", { area: o ?? t.area_id ?? "" }),
			options: r.map((e) => s(e))
		}] : [], {
			label: S("climateMetrics.others"),
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
        <button @click=${() => D(this.base)}>${S("climateMetrics.back_metrics")}</button>
        <h2>${e.name}</h2>
        <button class="primary" ?disabled=${this._busy} @click=${() => this._save(e)}>
          ${S("common.save")}
        </button>
      </div>
      ${Oa.map((n) => {
			let r = n.section(), i = r === t ? "" : r;
			return t = r, h`${i ? h`<div class="section-title">${i}</div>` : ""}
          ${this._renderMetric(n, e)}`;
		})}
    `;
	}
	_roomValues(e) {
		let t = Oa.filter((t) => e.metrics?.[t.key]?.sensors?.length);
		return t.length ? h`<div class="values">
      ${t.map((t) => h`<span class="value">
          ${t.icon} ${this._current(`sensor.homex_${e.room_id}_${t.key}`)}
        </span>`)}
    </div>` : h`<span class="meta">${S("climateMetrics.no_sensor")}</span>`;
	}
	render() {
		if (!this._loaded) return h`<div class="msg">${S("common.loading")}</div>`;
		let e = this._roomId;
		if (e) {
			let t = this._rooms.find((t) => t.room_id === e);
			return !t || !this._hasClimate(t) ? h`<div class="head">
            <button @click=${() => D(this.base)}>${S("climateMetrics.back_metrics")}</button>
            <h2></h2>
          </div>
          <div class="msg">
            ${t ? S("climateMetrics.module_not_enabled") : S("climateMetrics.room_not_found", { room: e })}
          </div>` : this._renderRoom(t);
		}
		return h`
      <div class="head">
        <button @click=${() => this.dispatchEvent(new CustomEvent("close"))}>${S("climateMetrics.back_climate")}</button>
        <h2>${S("climateMetrics.title")}</h2>
      </div>
      <div class="list">
        ${this._rooms.map((e) => {
			let t = this._hasClimate(e), n = e.area_id ? this.hass.areas?.[e.area_id]?.name : void 0;
			return h`<div class="row ${t ? "" : "off"}" @click=${() => this._openRoom(e)}>
            <div class="info">
              <div class="name">${e.name}</div>
              <div class="meta">${n ?? S("climateMetrics.no_ha_area")}</div>
            </div>
            ${t ? this._roomValues(e) : h`<span class="meta">${S("climateMetrics.module_disabled")}</span>`}
            <span class="chevron">›</span>
          </div>`;
		})}
      </div>
    `;
	}
}, Ea.styles = [O, o`
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
    `], Ea);
k([b({ attribute: !1 })], ja.prototype, "hass", void 0), k([b({ attribute: !1 })], ja.prototype, "base", void 0), k([b({ attribute: !1 })], ja.prototype, "subpath", void 0), k([x()], ja.prototype, "_rooms", void 0), k([x()], ja.prototype, "_loaded", void 0), k([x()], ja.prototype, "_draft", void 0), k([x()], ja.prototype, "_busy", void 0), ja = k([y("homex-climate-metrics")], ja);
// src/components/homex-climate-manager.ts
var Ma, Na = [
	{
		key: "metrics",
		icon: "📈",
		label: () => S("climateManager.metrics"),
		desc: () => S("climateManager.metrics_desc")
	},
	{
		key: "heating",
		icon: "🔥",
		label: () => S("climateManager.heating"),
		desc: () => S("climateManager.heating_desc")
	},
	{
		key: "ac",
		icon: "❄️",
		label: () => S("climateManager.ac"),
		desc: () => S("climateManager.ac_desc")
	}
], Pa = (Ma = class extends v {
	constructor(...e) {
		super(...e), this.base = "", this.subpath = "", this._toLanding = () => D(this.base);
	}
	get _page() {
		let e = Tr(this.subpath)[0];
		return Na.some((t) => t.key === e) ? e : null;
	}
	_placeholder(e, t) {
		return h`
      <div class="head">
        <button @click=${this._toLanding}>${S("climateManager.back_climate")}</button>
        <h2>${e}</h2>
      </div>
      <div class="msg">${t}</div>
    `;
	}
	render() {
		let e = this._page;
		return e === "heating" ? h`<homex-heating-manager
        .hass=${this.hass}
        .base=${T(this.base, "heating")}
        .subpath=${Tr(this.subpath).slice(1).join("/")}
        @close=${this._toLanding}
      ></homex-heating-manager>` : e === "metrics" ? h`<homex-climate-metrics
        .hass=${this.hass}
        .base=${T(this.base, "metrics")}
        .subpath=${Tr(this.subpath).slice(1).join("/")}
        @close=${this._toLanding}
      ></homex-climate-metrics>` : e === "ac" ? this._placeholder(S("climateManager.ac"), S("climateManager.ac_unavailable")) : h`
      <div class="head">
        <button @click=${() => this.dispatchEvent(new CustomEvent("close"))}>← Homex</button>
        <h2>${S("climateManager.title")}</h2>
      </div>
      <div class="pages">
        ${Na.map((e) => h`<div
            class="page ${e.key === "ac" ? "soon" : ""}"
            @click=${() => E(T(this.base, e.key))}
          >
            <div class="icon">${e.icon}</div>
            <div>
              <div class="name">${e.label()}</div>
              <div class="desc">${e.desc()}</div>
            </div>
          </div>`)}
      </div>
    `;
	}
}, Ma.styles = [O, o`
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
    `], Ma);
k([b({ attribute: !1 })], Pa.prototype, "hass", void 0), k([b({ attribute: !1 })], Pa.prototype, "base", void 0), k([b({ attribute: !1 })], Pa.prototype, "subpath", void 0), Pa = k([y("homex-climate-manager")], Pa);
// src/components/homex-heating-systems-card.ts
var Fa, Ia = 7, La = 3e5, Ra = {
	setpoint_tank: [() => S("heatingSystemsCard.rule_setpoint_tank"), "setpoint_tank"],
	flow_return: [() => S("heatingSystemsCard.rule_flow_return"), "flow_return"],
	delta: [() => S("heatingSystemsCard.rule_setpoint_tank"), "setpoint_tank"]
}, za = (Fa = class extends v {
	constructor(...e) {
		super(...e), this.systems = [], this.zones = [], this._days = {}, this._hover = null;
	}
	connectedCallback() {
		super.connectedCallback(), this._timer = window.setInterval(() => this._loadHistory(), La);
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
			let a = this._driven(t), o = Array.from({ length: Ia }, (t, n) => {
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
		return (e.zones?.length ? e.zones : ["global"]).map((e) => e === "global" ? S("heatingSystemsCard.global") : this.zones.find((t) => t.id === e)?.name ?? e).join(", ");
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
		let n = 284 / Ia, r = Math.max(60, ...t.map((e) => e.minutes)), i = t.reduce((e, t) => e + t.minutes, 0), a = this._hover?.sid === e.id ? t[this._hover.i] : void 0, o = (e) => e.toLocaleDateString(_n(), {
			weekday: "short",
			day: "numeric"
		}), s = (e, t) => {
			if (t <= 0) return "";
			let r = Math.min(4, t, n / 2), i = 70 - t;
			return `M${e},70V${i + r}Q${e},${i} ${e + r},${i}H${e + n - r}Q${e + n},${i} ${e + n},${i + r}V70Z`;
		};
		return h`<div class="chart">
      <div class="chart-head">
        <span>${S("heatingSystemsCard.runtime_days", { days: Ia })}</span>
        <span class="readout">
          ${a ? S("heatingSystemsCard.day_value", {
			day: o(a.date),
			value: this._dur(a.minutes)
		}) : S("heatingSystemsCard.total", {
			total: this._dur(i),
			avg: this._dur(i / Ia)
		})}
        </span>
      </div>
      <svg
        class="bars"
        viewBox="0 0 ${320} ${70}"
        preserveAspectRatio="none"
        role="img"
        aria-label=${S("heatingSystemsCard.chart_label", {
			name: e.name,
			days: Ia
		})}
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
              <title>${S("heatingSystemsCard.day_value", {
				day: o(t.date),
				value: this._dur(t.minutes)
			})}</title>
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
            >${t.date.toLocaleDateString(_n(), { weekday: "short" })}</span
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
          <div class="muted">${S("heatingSystemsCard.buffer_tank")} · ${this._scope(e)} · min ${e.min_runtime ?? 0} min</div>
        </div>
        <div class="pills">
          <span class="pill ${t ? "on" : ""}" title=${e.circulator ?? ""}>
            <svg viewBox="0 0 24 24"><path d=${t ? Dt : Ot}></path></svg>
            ${S(t ? "heatingSystemsCard.circulating" : "heatingSystemsCard.stopped")}
          </span>
          <span class="pill ${r ? "on" : ""}" title=${S("heatingSystemsCard.demand_title")}>
            <svg viewBox="0 0 24 24"><path d=${r ? ut : dt}></path></svg>
            ${S(r ? "heatingSystemsCard.demand" : "heatingSystemsCard.no_demand")}
          </span>
          ${n ? h`<span class="pill on"><svg viewBox="0 0 24 24"><path d=${ft}></path></svg>${S("heatingSystemsCard.forced")}</span>` : _}
          ${e.aggressive ? h`<span class="pill"><svg viewBox="0 0 24 24"><path d=${Mt}></path></svg>${S("heatingSystemsCard.aggressive")}</span>` : _}
        </div>
      </div>
      <div class="tiles">
        <div class="tile"><div class="label">${S("heatingSystemsCard.setpoint")}</div><div class="value">${this._temp(e.setpoint_sensor)}</div></div>
        ${e.tank_sensor ? h`<div class="tile"><div class="label">${S("heatingSystemsCard.tank")}</div><div class="value">${this._temp(e.tank_sensor)}</div></div>` : _}
        ${e.flow_sensor ? h`<div class="tile"><div class="label">${S("heatingSystemsCard.flow")}</div><div class="value">${this._temp(e.flow_sensor)}</div></div>` : _}
        ${e.return_sensor ? h`<div class="tile"><div class="label">${S("heatingSystemsCard.return")}</div><div class="value">${this._temp(e.return_sensor)}</div></div>` : _}
        <div class="tile">
          <div class="label">${S("heatingSystemsCard.tank_active_today")}</div>
          <div class="value">${Number.isNaN(a) ? "—" : this._dur(a)}</div>
        </div>
        ${o > 0 ? h`<div class="tile">
              <div class="label">${S("heatingSystemsCard.min_time_left")}</div>
              <div class="value">${this._dur(o / 60)}</div>
            </div>` : _}
      </div>
      ${(e.rules ?? []).length ? h`<div class="rules">
            ${(e.rules ?? []).map((t) => {
			let [n, r] = Ra[t.type] ?? [() => t.type, t.type], i = parseFloat(this._ent(e, "sensor", `gap_${r}`)?.state ?? ""), a = this._ent(e, "binary_sensor", `rule_${r}`)?.state === "on";
			return h`<div class="rule">
                <span class="dot ${a ? "on" : ""}"></span>
                <span>${n()}</span>
                <span class="gap">${Number.isNaN(i) ? "—" : `${i} °C`}</span>
                <span class="muted">${S("heatingSystemsCard.rule_status", {
				delta: t.delta,
				tolerance: t.tolerance,
				state: S(a ? "heatingSystemsCard.rule_on" : "heatingSystemsCard.rule_off")
			})}</span>
              </div>`;
		})}
          </div>` : _}
      <div class="switches">${this._toggle(e, "force", S("heatingSystemsCard.manual_override"))}</div>
      ${this._renderChart(e)}
    `;
	}
	_renderBoiler(e) {
		let t = this.hass.states[e.contact ?? ""]?.state === "on", n = this._ent(e, "binary_sensor", "demand")?.state === "on", r = this._days[e.id], i = r ? r[r.length - 1].minutes : NaN;
		return h`
      <div class="head">
        <div class="info">
          <div class="name">🔥 ${e.name}</div>
          <div class="muted">${S("heatingSystemsCard.boiler")} · ${this._scope(e)}</div>
        </div>
        <div class="pills">
          <span class="pill ${t ? "on" : ""}" title=${e.contact ?? ""}>
            <svg viewBox="0 0 24 24"><path d=${t ? ut : dt}></path></svg>
            ${S(t ? "heatingSystemsCard.boiler_on" : "heatingSystemsCard.boiler_off")}
          </span>
          <span class="pill ${n ? "on" : ""}">${S(n ? "heatingSystemsCard.demand" : "heatingSystemsCard.no_demand")}</span>
          ${e.aggressive ? h`<span class="pill"><svg viewBox="0 0 24 24"><path d=${Mt}></path></svg>${S("heatingSystemsCard.aggressive")}</span>` : _}
        </div>
      </div>
      <div class="tiles">
        <div class="tile">
          <div class="label">${S("heatingSystemsCard.boiler_active_today")}</div>
          <div class="value">${Number.isNaN(i) ? "—" : this._dur(i)}</div>
        </div>
      </div>
      ${this._renderChart(e)}
    `;
	}
	render() {
		let e = this.systems.filter((e) => e.type === "boiler" || e.type === "buffer_tank");
		return e.length ? h`<div class="card">
      <div class="card-title">${S("heatingSystemsCard.title")}</div>
      ${e.map((e) => h`<div class="system">
          ${e.type === "buffer_tank" ? this._renderTank(e) : this._renderBoiler(e)}
        </div>`)}
    </div>` : _;
	}
}, Fa.styles = [O, o`
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
    `], Fa);
k([b({ attribute: !1 })], za.prototype, "hass", void 0), k([b({ attribute: !1 })], za.prototype, "systems", void 0), k([b({ attribute: !1 })], za.prototype, "zones", void 0), k([x()], za.prototype, "_days", void 0), k([x()], za.prototype, "_hover", void 0), za = k([y("homex-heating-systems-card")], za);
// src/components/homex-climate-dashboard.ts
var Ba, Va = "select.homex_climate_tolerance_mode", Ha = (Ba = class extends v {
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
			let e = await ir(this.hass);
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
			await _r(this.hass, e), this._enabledLocal = e;
		} catch (e) {
			alert(S("common.error", { message: w(e) }));
		} finally {
			this._busy = !1;
		}
	}
	_demandPill(e) {
		let t = this.hass.states[e]?.state === "on";
		return h`<span class="pill ${t ? "heating" : ""}" title=${e}>
      <svg viewBox="0 0 24 24"><path d=${t ? ut : dt}></path></svg>
      ${S(t ? "climateDashboard.heating_status" : "climateDashboard.idle")}
    </span>`;
	}
	_zoneRooms(e) {
		let t = new Set(this._zones.flatMap((e) => e.rooms)), n = (e.id === "default" ? this.rooms.map((e) => e.room_id).filter((e) => !t.has(e)) : e.rooms).map((e) => this.rooms.find((t) => t.room_id === e)?.name ?? e);
		return n.length ? n.join(", ") : S("climateDashboard.no_rooms");
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
        title=${S("climateDashboard.zone_mode")}
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
      ${this.hass.states[`${Va}_${e.id}`] ? h`<span class="zone-tol" title=${S("climateDashboard.zone_tolerance")}>
            ${this._btnGroup(`${Va}_${e.id}`)}
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
		if (!this._loaded) return h`<div class="muted">${S("common.loading")}</div>`;
		let e = this.hass.states[Va];
		return h`
      <div class="card">
        <div class="card-title">${S("climateDashboard.heating")}</div>
        <div class="global">
          <span class="state ${this._enabled ? "on" : ""}">
            ${this._enabled ? S("climateDashboard.enabled") : S("climateDashboard.disabled")}
          </span>
          <div class="pills">
            ${this._demandPill("binary_sensor.homex_heating_needed")}
          </div>
          <button ?disabled=${this._busy} @click=${this._toggle}>
            ${this._enabled ? S("climateDashboard.disable") : S("climateDashboard.enable")}
          </button>
        </div>
        <div class="options">
          ${e ? h`<div class="field-select" title=${Va}>
                <span>${S("climateDashboard.tolerance")}</span>
                ${this._btnGroup(Va)}
              </div>` : ""}
        </div>
      </div>
      <homex-heating-systems-card
        .hass=${this.hass}
        .systems=${this._systems}
        .zones=${this._zones}
      ></homex-heating-systems-card>
      <div class="card">
        <div class="card-title">${S("climateDashboard.zones")}</div>
        ${this._zones.map((e) => this._renderZone(e))}
      </div>
      ${this._renderRooms()}
    `;
	}
	_renderRooms() {
		let e = this.rooms.filter((e) => (e.modules ?? []).includes("heating"));
		return e.length ? h`<div class="card">
      <div class="card-title">${S("climateDashboard.rooms")}</div>
      ${e.map((e) => this._renderRoom(e))}
    </div>` : "";
	}
	_fmt(e) {
		if (!e.length) return "—";
		let t = Math.min(...e), n = Math.max(...e), r = (e) => `${Math.round(e * 10) / 10}`;
		return t === n ? `${r(t)} °C` : `${r(t)}–${r(n)} °C`;
	}
	_renderRoom(e) {
		let t = e.heating?.radiators ?? [], n = e.heating?.enabled !== !1, r = t.map((e) => jr(this.hass, e.device_id)).map((e) => e ? this.hass.states[e] : void 0).filter((e) => e && !["unknown", "unavailable"].includes(e.state)), i = (e) => typeof e == "number" ? [e] : [], a = r.filter((e) => e.state !== "off").flatMap((e) => i(e.attributes.temperature)), o = r.length > 0 && r.every((e) => e.state === "off"), s = a.length ? this._fmt(a) : o ? S("climateDashboard.off") : "—", c = this.hass.states[`sensor.homex_${e.room_id}_temperature`], l = parseFloat(c?.state), u = Number.isNaN(l) ? this._fmt(r.flatMap((e) => i(e.attributes.current_temperature))) : `${l} °C`, d = Lr(this.hass, e), f = Ir(this.hass, e), p = Fr(this.hass, e), m = this._roomBusy.has(e.room_id);
		return h`<div class="room ${n ? "" : "off"}">
      <label class="room-switch" title=${t.length ? S("climateDashboard.room_heating") : S("climateDashboard.no_radiator")}>
        ${j(n, (t) => this._setRoomHeating(e, t), m || !t.length)}
      </label>
      <div class="info">
        <div class="name">${e.name}</div>
        <div class="muted">
          ${S("climateDashboard.radiators", { count: t.length })}${d ? h` · ${d.mode}` : ""}
        </div>
      </div>
      <div class="temps">
        <span title=${S("climateDashboard.setpoint")}>🎯 ${s}</span>
        <span title=${S("climateDashboard.current_temperature")}>🌡 ${u}</span>
      </div>
      ${t.length ? h`<span class="pill ${f ? "heating" : ""}">
            <svg viewBox="0 0 24 24"><path d=${f ? ut : dt}></path></svg>
            ${S(f ? "climateDashboard.heating_status" : "climateDashboard.idle")}
          </span>` : ""}
      ${p ? h`<span class="pill warning" title=${p}>
            <svg viewBox="0 0 24 24"><path d=${Xe}></path></svg>${S("climateDashboard.valve_warning")}
          </span>` : ""}
    </div>`;
	}
	async _setRoomHeating(e, t) {
		this._roomBusy = /* @__PURE__ */ new Set([...this._roomBusy, e.room_id]);
		try {
			await Kn(this.hass, {
				entry_id: e.entry_id,
				heating: {
					radiators: e.heating?.radiators ?? [],
					enabled: t
				}
			}), C(this);
		} catch (e) {
			alert(S("common.error", { message: w(e) }));
		} finally {
			let t = new Set(this._roomBusy);
			t.delete(e.room_id), this._roomBusy = t;
		}
	}
}, Ba.styles = [O, o`
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
    `], Ba);
k([b({ attribute: !1 })], Ha.prototype, "hass", void 0), k([b({ attribute: !1 })], Ha.prototype, "rooms", void 0), k([x()], Ha.prototype, "_zones", void 0), k([x()], Ha.prototype, "_systems", void 0), k([x()], Ha.prototype, "_enabledLocal", void 0), k([x()], Ha.prototype, "_loaded", void 0), k([x()], Ha.prototype, "_busy", void 0), k([x()], Ha.prototype, "_roomBusy", void 0), Ha = k([y("homex-climate-dashboard")], Ha);
// src/components/homex-setup-wizard.ts
var Ua = class extends v {
	constructor(...e) {
		super(...e), this.rooms = [], this._step = "choose", this._importedAreas = [], this._switchPlan = null, this._createPresets = /* @__PURE__ */ new Set(), this._presetsCreated = 0, this._withLights = !0, this._withShutters = !0, this._covers = /* @__PURE__ */ new Set(), this._plan = [], this._smart = /* @__PURE__ */ new Set(), this._selected = /* @__PURE__ */ new Set(), this._busy = !1, this._created = 0;
	}
	_areas() {
		let e = new Set(this.rooms.map((e) => e.area_id).filter(Boolean)), t = /* @__PURE__ */ new Map();
		for (let e of Object.values(this.hass.devices ?? {})) e.area_id && !e.disabled_by && t.set(e.area_id, (t.get(e.area_id) ?? 0) + 1);
		return Object.values(this.hass.areas ?? {}).map((n) => ({
			area_id: n.area_id,
			name: n.name,
			icon: n.icon,
			devices: t.get(n.area_id) ?? 0,
			imported: e.has(n.area_id)
		}));
	}
	_byFloor(e) {
		let t = Object.values(this.hass.floors ?? {}).sort((e, t) => (e.level ?? 0) - (t.level ?? 0) || e.name.localeCompare(t.name)), n = (e) => this.hass.areas?.[e]?.floor_id, r = t.map((t) => ({
			key: t.floor_id,
			name: t.name,
			icon: t.icon,
			areas: e.filter((e) => n(e.area_id) === t.floor_id)
		})).filter((e) => e.areas.length), i = e.filter((e) => !n(e.area_id) || !t.some((t) => t.floor_id === n(e.area_id)));
		i.length && r.push({
			key: "",
			name: S("setupWizard.no_floor"),
			icon: void 0,
			areas: i
		});
		for (let e of r) e.areas.sort((e, t) => e.name.localeCompare(t.name));
		return r;
	}
	_startImport() {
		this._selected = new Set(this._areas().filter((e) => !e.imported).map((e) => e.area_id)), this._step = "import";
	}
	_toggle(e, t) {
		let n = new Set(this._selected);
		t ? n.add(e) : n.delete(e), this._selected = n;
	}
	_toggleAll(e, t) {
		let n = new Set(this._selected);
		for (let r of e) t ? n.add(r) : n.delete(r);
		this._selected = n;
	}
	_lightsByArea() {
		let e = this.hass.devices ?? {}, t = /* @__PURE__ */ new Map();
		for (let n of Object.values(this.hass.entities ?? {})) {
			if (!n.entity_id.startsWith("light.") || n.entity_id.startsWith("light.homex_") || n.hidden || n.entity_category) continue;
			let r = n.area_id || n.device_id && e[n.device_id]?.area_id;
			r && (t.get(r) ?? t.set(r, []).get(r)).push(n.entity_id);
		}
		for (let e of t.values()) e.sort();
		return t;
	}
	_coversByArea() {
		let e = this.hass.devices ?? {}, t = /* @__PURE__ */ new Map();
		for (let n of Object.values(this.hass.entities ?? {})) {
			if (!n.entity_id.startsWith("cover.") || n.hidden || n.entity_category) continue;
			let r = n.area_id || n.device_id && e[n.device_id]?.area_id;
			if (!r) continue;
			let i = this.hass.states[n.entity_id], a = i?.attributes.friendly_name || n.entity_id;
			(t.get(r) ?? t.set(r, []).get(r)).push({
				entity_id: n.entity_id,
				name: a,
				dc: i?.attributes.device_class
			});
		}
		for (let e of t.values()) e.sort((e, t) => e.name.localeCompare(t.name));
		return t;
	}
	_goOptions() {
		let e = this._coversByArea();
		this._covers = new Set(this._selectedAreas().flatMap((t) => e.get(t.area_id) ?? []).filter((e) => !Wa.NOT_SHUTTERS.has(e.dc ?? "")).map((e) => e.entity_id)), this._step = "options";
	}
	_checkedCovers() {
		if (!this._withShutters) return [];
		let e = this._coversByArea();
		return this._selectedAreas().flatMap((t) => e.get(t.area_id) ?? []).map((e) => e.entity_id).filter((e) => this._covers.has(e));
	}
	async _goShutters() {
		this._busy = !0;
		try {
			this._plan = (await br(this.hass, this._checkedCovers())).models, this._smart = new Set(this._plan.filter((e) => e.suggested).map((e) => e.model)), this._step = "shutters";
		} catch (e) {
			alert(S("common.error", { message: w(e) }));
		} finally {
			this._busy = !1;
		}
	}
	_selectedAreas() {
		return this._areas().filter((e) => this._selected.has(e.area_id) && !e.imported);
	}
	_roomIds(e) {
		let t = new Set(this.rooms.map((e) => e.room_id)), n = this._lightsByArea(), r = this._coversByArea(), i = new Set(this._checkedCovers());
		return e.map((e) => {
			let a = /^[a-z0-9_]+$/.test(e.area_id) ? e.area_id : M(e.name) || "room", o = a;
			for (let e = 2; t.has(o); e++) o = `${a}_${e}`;
			t.add(o);
			let s = this._withLights ? n.get(e.area_id) ?? [] : [], c = (r.get(e.area_id) ?? []).map((e) => e.entity_id).filter((e) => i.has(e));
			return {
				name: e.name,
				room_id: o,
				area_id: e.area_id,
				modules: s.length ? ["lights"] : [],
				devices: s,
				shutters: c
			};
		});
	}
	async _import() {
		let e = this._selectedAreas();
		if (e.length) {
			this._busy = !0;
			try {
				if (this._step === "shutters") for (let e of this._plan) e.suggested && this._smart.has(e.model) && await In(this.hass, e.suggested);
				let t = await Bn(this.hass, this._roomIds(e));
				this._created = t.created.length, this._importedAreas = e.map((e) => e.area_id), this._switchPlan = (await xr(this.hass, this._importedAreas)).models, this._createPresets = new Set(this._switchPlan.filter((e) => e.preset).map((e) => e.model)), this._step = "switches_intro";
			} catch (e) {
				alert(S("common.error", { message: w(e) }));
			} finally {
				this._busy = !1;
			}
		}
	}
	async _createSwitchPresets() {
		this._busy = !0;
		try {
			let e = 0;
			for (let t of this._switchPlan ?? []) t.preset && t.layout && this._createPresets.has(t.model) && (await Cn(this.hass, t.layout), await kn(this.hass, t.preset), e++);
			this._presetsCreated = e, this._step = "done";
		} catch (e) {
			alert(S("common.error", { message: w(e) }));
		} finally {
			this._busy = !1;
		}
	}
	_layoutPreview(e, t) {
		let n = e.bounds;
		return h`<svg class="layout" viewBox="-11 -11 22 22" aria-hidden="true">
      ${e.shape === "round" ? g`<circle cx=${n.x + n.w / 2} cy=${n.y + n.h / 2} r=${Math.max(n.w, n.h) / 2} class="plate"></circle>` : g`<rect x=${n.x} y=${n.y} width=${n.w} height=${n.h} rx=${e.shape === "vrect" ? 2.5 : 2} class="plate"></rect>`}
      ${e.zones.map((e) => g`<rect x=${e.x + .6} y=${e.y + .6} width=${e.w - 1.2} height=${e.h - 1.2} rx="1" class="zone"></rect>
          <text x=${e.x + e.w / 2} y=${e.y + e.h / 2} class="zone-label">${this._buttonLabel(t[e.n - 1] ?? String(e.n))}</text>`)}
    </svg>`;
	}
	_buttonLabel(e) {
		return {
			arrow_left: "◀",
			arrow_right: "▶",
			left: "L",
			right: "R",
			main: "●",
			up: "+",
			down: "−"
		}[e] ?? (e.length > 3 ? e.slice(0, 3) : e);
	}
	_buttonName(e) {
		let t = `setupWizard.btn_${e}`, n = S(t);
		return n === t ? e.replace(/_/g, " ") : n;
	}
	_tapNames(e) {
		return e.map((e) => S(`setupWizard.tap_${e}`)).join(", ");
	}
	_switchesIntro() {
		let e = this._switchPlan ?? [], t = e.reduce((e, t) => e + t.devices.length, 0);
		return h`
      <div class="done inline">
        <span class="done-icon">${this._icon(nt)}</span>
        <span>${S(this._created === 1 ? "setupWizard.done_one" : "setupWizard.done_other", { count: this._created })}</span>
      </div>
      <p class="lead">${S("setupWizard.switches_intro")}</p>
      <div class="concepts">
        <div class="concept">
          <span class="concept-title">${S("setupWizard.concept_layout")}</span>
          <span class="option-desc">${S("setupWizard.concept_layout_text")}</span>
        </div>
        <div class="concept">
          <span class="concept-title">${S("setupWizard.concept_preset")}</span>
          <span class="option-desc">${S("setupWizard.concept_preset_text")}</span>
        </div>
        <div class="concept">
          <span class="concept-title">${S("setupWizard.concept_switch")}</span>
          <span class="option-desc">${S("setupWizard.concept_switch_text")}</span>
        </div>
      </div>
      <p class="lead">
        ${t ? S("setupWizard.switches_found", {
			devices: t,
			models: e.length
		}) : S("setupWizard.switches_none")}
      </p>
      <div class="actions">
        ${t ? h`<button class="secondary" @click=${() => this._step = "done"}>${S("setupWizard.skip")}</button>
              <button class="primary" @click=${() => this._step = "switches"}>${S("setupWizard.configure_switches")}</button>` : h`<button class="primary" @click=${() => this._step = "done"}>${S("setupWizard.next")}</button>`}
      </div>
    `;
	}
	_switches() {
		let e = this._switchPlan ?? [], t = e.filter((e) => e.preset && this._createPresets.has(e.model)).length;
		return h`
      <p class="lead">${S("setupWizard.switches_pick")}</p>
      ${e.map((e) => {
			let t = e.buttons.map((e) => e.name), n = e.devices.map((e) => e.area ? `${e.name} (${e.area})` : e.name);
			return h`<div class="switch-model">
          ${e.layout ? this._layoutPreview(e.layout, t) : h`<div class="layout placeholder"></div>`}
          <div class="option-text">
            <span class="option-title">${e.label} <span class="count">× ${e.devices.length}</span></span>
            <span class="option-desc">
              ${e.existing ? S("setupWizard.preset_existing", { name: e.existing.name }) : e.buttons.length ? e.buttons.map((e) => `${this._buttonName(e.name)} (${this._tapNames(e.taps)})`).join(" · ") : S("setupWizard.actions_unknown")}
            </span>
            <span class="devices">${n.join(", ")}</span>
          </div>
          ${e.preset ? h`<label class="smart">
                <span>${S("setupWizard.create_preset")}</span>
                <span class="switch">
                  <input
                    type="checkbox"
                    .checked=${this._createPresets.has(e.model)}
                    @change=${(t) => {
				let n = new Set(this._createPresets);
				t.target.checked ? n.add(e.model) : n.delete(e.model), this._createPresets = n;
			}}
                  />
                  <span></span>
                </span>
              </label>` : _}
        </div>`;
		})}
      <p class="hint">${S("setupWizard.presets_hint")}</p>
      <div class="actions">
        <button class="secondary" @click=${() => this._step = "switches_intro"}>${S("setupWizard.back")}</button>
        <button class="primary" ?disabled=${this._busy} @click=${this._createSwitchPresets}>
          ${t ? S(t === 1 ? "setupWizard.create_presets_one" : "setupWizard.create_presets_other", { count: t }) : S("setupWizard.next")}
        </button>
      </div>
    `;
	}
	_finish() {
		C(this), this.dispatchEvent(new CustomEvent("wizard-finished", {
			bubbles: !0,
			composed: !0
		}));
	}
	_create() {
		this.dispatchEvent(new CustomEvent("wizard-create-room", {
			bubbles: !0,
			composed: !0
		}));
	}
	_icon(e) {
		return h`<svg viewBox="0 0 24 24" aria-hidden="true"><path d=${e}></path></svg>`;
	}
	_choose() {
		let e = this._areas().filter((e) => !e.imported).length;
		return h`
      <p class="lead">${S("setupWizard.rooms_intro")}</p>
      <div class="choices">
        <button class="choice" ?disabled=${!e} @click=${this._startImport}>
          <span class="choice-icon">${this._icon(pt)}</span>
          <span class="choice-title">${S("setupWizard.import_title")}</span>
          <span class="choice-text">
            ${e ? S("setupWizard.import_text", { count: e }) : S("setupWizard.import_none")}
          </span>
        </button>
        <button class="choice" @click=${this._create}>
          <span class="choice-icon">${this._icon(mt)}</span>
          <span class="choice-title">${S("setupWizard.create_title")}</span>
          <span class="choice-text">${S("setupWizard.create_text")}</span>
        </button>
      </div>
    `;
	}
	_importList() {
		let e = this._areas(), t = this._byFloor(e), n = e.filter((e) => !e.imported).map((e) => e.area_id), r = n.filter((e) => this._selected.has(e)).length;
		return h`
      <div class="list-head">
        <p class="lead">${S("setupWizard.import_pick")}</p>
        <span class="bulk">
          <button class="link" @click=${() => this._toggleAll(n, !0)}>${S("setupWizard.select_all")}</button>
          ·
          <button class="link" @click=${() => this._toggleAll(n, !1)}>${S("setupWizard.select_none")}</button>
        </span>
      </div>
      ${t.map((e) => {
			let t = e.areas.filter((e) => !e.imported).map((e) => e.area_id), n = t.length > 0 && t.every((e) => this._selected.has(e));
			return h`<section class="floor">
          <label class="floor-head">
            <input
              type="checkbox"
              .checked=${n}
              .indeterminate=${!n && t.some((e) => this._selected.has(e))}
              ?disabled=${!t.length}
              @change=${(e) => this._toggleAll(t, e.target.checked)}
            />
            ${e.icon ? h`<ha-icon .icon=${e.icon}></ha-icon>` : _}
            <span>${e.name}</span>
          </label>
          ${e.areas.map((e) => h`<label class="area ${e.imported ? "imported" : ""}">
              <input
                type="checkbox"
                .checked=${e.imported || this._selected.has(e.area_id)}
                ?disabled=${e.imported}
                @change=${(t) => this._toggle(e.area_id, t.target.checked)}
              />
              <ha-icon .icon=${e.icon || "mdi:texture-box"}></ha-icon>
              <span class="area-name">${e.name}</span>
              <span class="meta">
                ${e.imported ? S("setupWizard.already_imported") : S(e.devices === 1 ? "setupWizard.device_one" : "setupWizard.device_other", { count: e.devices })}
              </span>
            </label>`)}
        </section>`;
		})}
      <div class="actions">
        <button class="secondary" @click=${() => this._step = "choose"}>${S("setupWizard.back")}</button>
        <button class="primary" ?disabled=${!r} @click=${this._goOptions}>
          ${S("setupWizard.next")}
        </button>
      </div>
    `;
	}
	_options() {
		let e = this._selectedAreas(), t = this._lightsByArea(), n = e.reduce((e, n) => e + (t.get(n.area_id)?.length ?? 0), 0), r = e.filter((e) => t.get(e.area_id)?.length).length, i = e.length;
		return h`
      <p class="lead">${S("setupWizard.options_intro", { count: i })}</p>
      <label class="option">
        <span class="option-text">
          <span class="option-title">${S("setupWizard.lights_title")}</span>
          <span class="option-desc">
            ${n ? S("setupWizard.lights_desc", {
			lights: n,
			rooms: r
		}) : S("setupWizard.lights_none")}
          </span>
        </span>
        <span class="switch">
          <input
            type="checkbox"
            .checked=${this._withLights && n > 0}
            ?disabled=${!n}
            @change=${(e) => this._withLights = e.target.checked}
          />
          <span></span>
        </span>
      </label>
      ${this._shuttersOption(e)}
      <p class="hint">${S("setupWizard.options_hint")}</p>
      <div class="actions">
        <button class="secondary" @click=${() => this._step = "import"}>${S("setupWizard.back")}</button>
        ${this._checkedCovers().length ? h`<button class="primary" ?disabled=${this._busy} @click=${this._goShutters}>
              ${S("setupWizard.next")}
            </button>` : this._importButton(i)}
      </div>
    `;
	}
	_importButton(e) {
		return h`<button class="primary" ?disabled=${!e || this._busy} @click=${this._import}>
      ${this._busy ? S("setupWizard.importing") : S(e === 1 ? "setupWizard.import_button_one" : "setupWizard.import_button_other", { count: e })}
    </button>`;
	}
	_shuttersOption(e) {
		let t = this._coversByArea(), n = this._byFloor(e).flatMap((e) => e.areas).filter((e) => t.get(e.area_id)?.length), r = n.reduce((e, n) => e + t.get(n.area_id).length, 0), i = this._checkedCovers().length, a = this._withShutters && r > 0;
		return h`<div class="option-block ${a ? "open" : ""}">
      <label class="option">
        <span class="option-text">
          <span class="option-title">${S("setupWizard.shutters_title")}</span>
          <span class="option-desc">
            ${r ? S("setupWizard.shutters_desc", {
			checked: i,
			total: r,
			rooms: n.length
		}) : S("setupWizard.shutters_none")}
          </span>
        </span>
        <span class="switch">
          <input
            type="checkbox"
            .checked=${a}
            ?disabled=${!r}
            @change=${(e) => this._withShutters = e.target.checked}
          />
          <span></span>
        </span>
      </label>
      ${a ? h`<div class="covers">
            ${n.map((e) => h`<div class="cover-room">${e.name}</div>
                ${t.get(e.area_id).map((e) => {
			let t = Wa.NOT_SHUTTERS.has(e.dc ?? "");
			return h`<label class="cover">
                    <input
                      type="checkbox"
                      .checked=${this._covers.has(e.entity_id)}
                      @change=${(t) => {
				let n = new Set(this._covers);
				t.target.checked ? n.add(e.entity_id) : n.delete(e.entity_id), this._covers = n;
			}}
                    />
                    <span class="area-name">${e.name}</span>
                    ${t ? h`<span class="tag">${S("setupWizard.not_a_shutter", { type: S(`setupWizard.dc_${e.dc}`) })}</span>` : _}
                  </label>`;
		})}`)}
          </div>` : _}
    </div>`;
	}
	_shutters() {
		let e = this._selectedAreas().length;
		return h`
      <p class="lead">${S("setupWizard.models_intro")}</p>
      ${this._plan.map((e) => {
			let t = e.covers.length;
			return h`<div class="option model">
          <span class="option-text">
            <span class="option-title">${e.label} <span class="count">× ${t}</span></span>
            <span class="option-desc">
              ${e.existing ? S("setupWizard.model_existing", { name: e.existing.name }) : e.detection?.source === "z2m" ? S("setupWizard.model_z2m", { field: e.detection.field ?? "" }) : S("setupWizard.model_cover")}
            </span>
          </span>
          ${e.suggested ? h`<label class="smart">
                <span>${S("setupWizard.smart_toggle")}</span>
                <span class="switch">
                  <input
                    type="checkbox"
                    .checked=${this._smart.has(e.model)}
                    @change=${(t) => {
				let n = new Set(this._smart);
				t.target.checked ? n.add(e.model) : n.delete(e.model), this._smart = n;
			}}
                  />
                  <span></span>
                </span>
              </label>` : _}
        </div>`;
		})}
      <p class="hint">${S("setupWizard.smart_hint")}</p>
      <div class="actions">
        <button class="secondary" @click=${() => this._step = "options"}>${S("setupWizard.back")}</button>
        ${this._importButton(e)}
      </div>
    `;
	}
	_done() {
		return h`
      <div class="done">
        <span class="done-icon">${this._icon(nt)}</span>
        <div>
          <p class="lead">
            ${S(this._created === 1 ? "setupWizard.done_one" : "setupWizard.done_other", { count: this._created })}
          </p>
          ${this._presetsCreated ? h`<p class="lead">
                ${S(this._presetsCreated === 1 ? "setupWizard.presets_done_one" : "setupWizard.presets_done_other", { count: this._presetsCreated })}
              </p>` : _}
        </div>
      </div>
      <div class="actions">
        <button class="primary" @click=${this._finish}>${S("setupWizard.continue")}</button>
      </div>
    `;
	}
	_stepper() {
		let e = ["switches_intro", "switches"].includes(this._step), t = this._step === "done";
		return h`<div class="steps">
      ${[{
			n: 1,
			label: S("setupWizard.step_rooms"),
			state: e || t ? "past" : "current"
		}, {
			n: 2,
			label: S("setupWizard.step_switches"),
			state: t ? "past" : e ? "current" : "next"
		}].map((e) => h`<span class="step ${e.state}">
          <span class="step-num">${e.state === "past" ? "✓" : e.n}</span>
          <span>${e.label}</span>
        </span>`)}
    </div>`;
	}
	render() {
		return h`
      <div class="card">
        <header>
          ${vn(36)}
          <div>
            <h2>${S("setupWizard.title")}</h2>
            <div class="sub">${S("setupWizard.subtitle")}</div>
          </div>
        </header>
        ${this._stepper()}
        ${this._step === "choose" ? this._choose() : this._step === "import" ? this._importList() : this._step === "options" ? this._options() : this._step === "shutters" ? this._shutters() : this._step === "switches_intro" ? this._switchesIntro() : this._step === "switches" ? this._switches() : this._done()}
      </div>
    `;
	}
}, Wa = Ua, Q = (Ua.NOT_SHUTTERS = /* @__PURE__ */ new Set([
	"garage",
	"gate",
	"door",
	"window",
	"awning",
	"damper"
]), Ua.styles = o`
    :host {
      display: block;
    }
    .card {
      background: var(--ha-card-background, var(--card-background-color, #fff));
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
      border-radius: 16px;
      padding: 24px;
      color: var(--primary-text-color);
    }
    header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
    }
    h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 500;
    }
    .sub {
      color: var(--secondary-text-color);
      font-size: 14px;
      margin-top: 2px;
    }
    .steps {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 22px;
      margin-bottom: 8px;
    }
    .step.next {
      opacity: 0.5;
    }
    .step.past .step-num {
      background: var(--success-color, #43a047);
    }
    .step {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
      font-size: 15px;
      margin-bottom: 8px;
    }
    .step-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .lead {
      margin: 8px 0 16px;
      color: var(--secondary-text-color);
      line-height: 1.5;
    }
    svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }
    button {
      font: inherit;
      color: inherit;
      cursor: pointer;
    }
    button:disabled {
      cursor: default;
      opacity: 0.5;
    }
    .choices {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 14px;
    }
    .choice {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      text-align: left;
      padding: 18px;
      border-radius: 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      background: transparent;
    }
    .choice:not(:disabled):hover {
      border-color: var(--primary-color);
      background: color-mix(in srgb, var(--primary-color) 6%, transparent);
    }
    .choice-icon {
      color: var(--primary-color);
    }
    .choice-icon svg {
      width: 32px;
      height: 32px;
    }
    .choice-title {
      font-weight: 500;
      font-size: 16px;
    }
    .choice-text {
      color: var(--secondary-text-color);
      font-size: 14px;
      line-height: 1.4;
    }
    .list-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .bulk {
      color: var(--secondary-text-color);
      white-space: nowrap;
    }
    .link {
      border: none;
      background: none;
      padding: 0;
      color: var(--primary-color);
    }
    .floor {
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
      border-radius: 12px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }
    .floor-head {
      padding: 10px 14px;
      font-weight: 500;
      background: rgba(127, 127, 127, 0.08);
    }
    .area {
      padding: 8px 14px 8px 38px;
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.15));
    }
    .area.imported {
      cursor: default;
      opacity: 0.6;
    }
    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      margin: 0;
      flex: none;
      accent-color: var(--primary-color);
    }
    ha-icon {
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
      flex: none;
    }
    .area-name {
      flex: 1;
      min-width: 0;
    }
    .meta {
      color: var(--secondary-text-color);
      font-size: 13px;
      white-space: nowrap;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 18px;
    }
    .primary,
    .secondary {
      border-radius: 8px;
      padding: 9px 18px;
      font-weight: 500;
      border: 1px solid transparent;
    }
    .primary {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .secondary {
      background: transparent;
      border-color: var(--divider-color, rgba(127, 127, 127, 0.4));
    }
    .option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 16px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
      border-radius: 12px;
      margin-bottom: 10px;
    }
    .option-block {
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
      border-radius: 12px;
      margin-bottom: 10px;
    }
    .option-block .option {
      border: none;
      margin: 0;
    }
    .covers {
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.15));
      padding: 6px 16px 12px;
      max-height: 320px;
      overflow-y: auto;
    }
    .cover-room {
      font-size: 13px;
      font-weight: 500;
      color: var(--secondary-text-color);
      margin: 10px 0 4px;
    }
    .cover {
      padding: 4px 0 4px 8px;
    }
    .tag {
      font-size: 12px;
      color: var(--warning-color, #ffa600);
      white-space: nowrap;
    }
    .model {
      cursor: default;
    }
    .count {
      color: var(--secondary-text-color);
      font-weight: 400;
    }
    .smart {
      gap: 10px;
      font-size: 13px;
      color: var(--secondary-text-color);
      white-space: nowrap;
    }
    .option.disabled {
      cursor: default;
      opacity: 0.55;
    }
    .option-text {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .option-title {
      font-weight: 500;
    }
    .option-desc,
    .hint {
      color: var(--secondary-text-color);
      font-size: 13px;
      line-height: 1.4;
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
      background: var(--primary-color);
    }
    .switch input:checked + span::before {
      transform: translateX(18px);
    }
    .done.inline {
      font-weight: 500;
      margin-bottom: 4px;
    }
    .done.inline svg {
      width: 22px;
      height: 22px;
    }
    .concepts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }
    .concept {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px 14px;
      border-radius: 10px;
      background: rgba(127, 127, 127, 0.08);
    }
    .concept-title {
      font-weight: 500;
    }
    .switch-model {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
      border-radius: 12px;
      margin-bottom: 10px;
    }
    .switch-model .option-text {
      flex: 1;
      min-width: 0;
    }
    .layout {
      width: 76px;
      height: 76px;
      flex: none;
    }
    .layout .plate {
      fill: rgba(127, 127, 127, 0.12);
      stroke: var(--secondary-text-color);
      stroke-width: 0.4;
    }
    .layout .zone {
      fill: var(--card-background-color, #fff);
      stroke: var(--primary-color);
      stroke-width: 0.35;
    }
    .layout .zone-label {
      font-size: 2.6px;
      fill: var(--primary-text-color);
      text-anchor: middle;
      dominant-baseline: central;
    }
    .devices {
      font-size: 12px;
      color: var(--secondary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .done {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .done-icon {
      color: var(--success-color, #43a047);
    }
    .done-icon svg {
      width: 36px;
      height: 36px;
    }
  `, Ua);
k([b({ attribute: !1 })], Q.prototype, "hass", void 0), k([b({ attribute: !1 })], Q.prototype, "rooms", void 0), k([x()], Q.prototype, "_step", void 0), k([x()], Q.prototype, "_switchPlan", void 0), k([x()], Q.prototype, "_createPresets", void 0), k([x()], Q.prototype, "_presetsCreated", void 0), k([x()], Q.prototype, "_withLights", void 0), k([x()], Q.prototype, "_withShutters", void 0), k([x()], Q.prototype, "_covers", void 0), k([x()], Q.prototype, "_plan", void 0), k([x()], Q.prototype, "_smart", void 0), k([x()], Q.prototype, "_selected", void 0), k([x()], Q.prototype, "_busy", void 0), k([x()], Q.prototype, "_created", void 0), Q = Wa = k([y("homex-setup-wizard")], Q);
// src/homex-panel.ts
var Ga, Ka = "213", $ = (Ga = class extends v {
	constructor(...e) {
		super(...e), this.narrow = !1, this._rooms = null, this._error = null, this._createOpen = !1, this._exportOpen = !1, this._menuOpen = !1, this._dashTab = localStorage.getItem("homex_dash_tab") === "climate" ? "climate" : "general", this._expanded = localStorage.getItem("homex_expanded") || null, this._loaded = !1, this._onToggleExpand = (e) => {
			let t = e.detail.entry_id;
			this._expanded = this._expanded === t ? null : t, this._expanded ? localStorage.setItem("homex_expanded", this._expanded) : localStorage.removeItem("homex_expanded");
		}, this._reload = async () => {
			try {
				this._rooms = await Rn(this.hass), this._error = null;
			} catch (e) {
				this._error = w(e);
			}
		}, this._backToRooms = () => D(this._prefix), this._onOpenSwitchAdd = (e) => {
			let t = e.detail?.room_id;
			E(T(this._prefix, "switches", "switches", "new") + (t ? `?room=${encodeURIComponent(t)}` : ""));
		};
	}
	connectedCallback() {
		super.connectedCallback(), bn(), this._unlisten = cn(() => this.requestUpdate()), this.addEventListener(xn, this._reload), this.addEventListener("homex-toggle-expand", this._onToggleExpand);
	}
	disconnectedCallback() {
		this._unlisten?.(), this.removeEventListener(xn, this._reload), this.removeEventListener("homex-toggle-expand", this._onToggleExpand), super.disconnectedCallback();
	}
	get _segs() {
		return Tr(this.route?.path);
	}
	get _view() {
		let e = this._segs[0];
		return e === "switches" || e === "shutters" || e === "climate" ? e : "rooms";
	}
	get _prefix() {
		return this.route?.prefix || "/homex";
	}
	updated(e) {
		if (e.has("hass") && dn(this.hass), e.has("hass") && this.hass && !this._loaded && (this._loaded = !0, gn(this.hass), wr().then(() => this.requestUpdate()), this._reload()), this._segs[0] === "heating") {
			E(T(this._prefix, "climate", ...this._segs), !0);
			return;
		}
		let t = e.get("route");
		t && this._loaded && this._view === "rooms" && Tr(t.path).length && this._reload();
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
          >${S("panel.tab_general")}</span
        >
        <span class="dash-tab ${t === "climate" ? "active" : ""}" @click=${() => n("climate")}
          >${S("panel.tab_climate")}</span
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
	async _setLanguage(e) {
		this._menuOpen = !1;
		try {
			await this.hass.callWS({
				type: "homex/settings/set",
				language: e
			}), fn(e), setTimeout(() => this._reload(), 3e3);
		} catch (e) {
			alert(S("common.error", { message: w(e) }));
		}
	}
	render() {
		return $t(mn(), this._render());
	}
	_render() {
		let e;
		if (this._error) e = h`<div class="msg err">${S("panel.error", { message: this._error })}</div>`;
		else if (!this._rooms) e = h`<div class="msg">${S("common.loading")}</div>`;
		else if (!this._rooms.length) e = h`<homex-setup-wizard
        .hass=${this.hass}
        .rooms=${this._rooms}
        @wizard-create-room=${() => this._createOpen = !0}
      ></homex-setup-wizard>`;
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
            .base=${T(this._prefix, "switches")}
            .subpath=${this._segs.slice(1).join("/")}
            @close=${this._backToRooms}
          ></homex-switch-manager>
        </div>
      ` : this._view === "climate" ? h`
        <div class="wrap">
          <homex-climate-manager
            .hass=${this.hass}
            .base=${T(this._prefix, "climate")}
            .subpath=${this._segs.slice(1).join("/")}
            @close=${this._backToRooms}
          ></homex-climate-manager>
        </div>
      ` : this._view === "shutters" ? h`
        <div class="wrap">
          <homex-shutter-manager
            .hass=${this.hass}
            .base=${T(this._prefix, "shutters")}
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
                  title=${S("panel.menu")}
                  @click=${this._toggleSidebar}
                >
                  <svg viewBox="0 0 24 24"><path d=${xt}></path></svg>
                </button>` : ""}
            <h1>${vn(28)} Homex <span class="ver">v${Ka}</span></h1>
          </div>
          <div class="header-actions">
            <button class="primary" @click=${() => this._createOpen = !0}>
              ＋ ${S("panel.new_room")}
            </button>
            <div class="menu-wrap">
              <button
                class="kebab"
                title=${S("panel.menu")}
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
                        <svg class="ico" viewBox="0 0 24 24"><path d=${kt}></path></svg>
                        ${S("panel.refresh")}
                      </button>
                      <button
                        ?disabled=${!this._rooms?.length}
                        @click=${() => {
			this._menuOpen = !1, this._exportOpen = !0;
		}}
                      >
                        <svg class="ico" viewBox="0 0 24 24"><path d=${ct}></path></svg>
                        ${S("panel.export")}
                      </button>
                      <div class="menu-sep"></div>
                      <button
                        @click=${() => {
			this._menuOpen = !1, E(T(this._prefix, "switches"));
		}}
                      >
                        🎛 ${S("panel.switch_manager")}
                      </button>
                      <button
                        @click=${() => {
			this._menuOpen = !1, E(T(this._prefix, "shutters"));
		}}
                      >
                        🪟 ${S("panel.shutter_manager")}
                      </button>
                      <button
                        @click=${() => {
			this._menuOpen = !1, E(T(this._prefix, "climate"));
		}}
                      >
                        🌡 ${S("panel.climate_manager")}
                      </button>
                      <div class="menu-sep"></div>
                      <div class="menu-label">
                        <svg class="ico" viewBox="0 0 24 24"><path d=${Ft}></path></svg>
                        ${S("common.language")}
                      </div>
                      ${["auto", ...tn].map((e) => h`<button class="lang" @click=${() => this._setLanguage(e)}>
                          <svg class="ico" viewBox="0 0 24 24" style=${pn() === e ? "" : "visibility:hidden"}>
                            <path d=${tt}></path>
                          </svg>
                          ${S(`common.language_${e}`)}
                        </button>`)}
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
}, Ga.styles = o`
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
    h1 .homex-logo {
      vertical-align: -5px;
      margin-right: 4px;
    }
    .menu-label {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px 4px;
      font-size: 12px;
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
  `, Ga);
k([b({ attribute: !1 })], $.prototype, "hass", void 0), k([b({ attribute: !1 })], $.prototype, "narrow", void 0), k([b({ attribute: !1 })], $.prototype, "route", void 0), k([b({ attribute: !1 })], $.prototype, "panel", void 0), k([x()], $.prototype, "_rooms", void 0), k([x()], $.prototype, "_error", void 0), k([x()], $.prototype, "_createOpen", void 0), k([x()], $.prototype, "_exportOpen", void 0), k([x()], $.prototype, "_menuOpen", void 0), k([x()], $.prototype, "_dashTab", void 0), k([x()], $.prototype, "_expanded", void 0), $ = k([y("homex-panel")], $);
export { $ as HomexPanel };
