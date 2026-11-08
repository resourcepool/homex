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
}, g = (e, t) => !l(e, t), ae = {
	attribute: !0,
	type: String,
	converter: h,
	reflect: !1,
	useDefault: !1,
	hasChanged: g
};
Symbol.metadata ??= Symbol("metadata"), f.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var _ = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = ae) {
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
		return this.elementProperties.get(e) ?? ae;
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
_.elementStyles = [], _.shadowRootOptions = { mode: "open" }, _[m("elementProperties")] = /* @__PURE__ */ new Map(), _[m("finalized")] = /* @__PURE__ */ new Map(), ie?.({ ReactiveElement: _ }), (f.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var v = globalThis, oe = (e) => e, y = v.trustedTypes, se = y ? y.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ce = "$lit$", b = `lit$${Math.random().toFixed(9).slice(2)}$`, le = "?" + b, ue = `<${le}>`, x = document, S = () => x.createComment(""), C = (e) => e === null || typeof e != "object" && typeof e != "function", de = Array.isArray, fe = (e) => de(e) || typeof e?.[Symbol.iterator] == "function", pe = "[ 	\n\f\r]", w = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, me = /-->/g, he = />/g, T = RegExp(`>|${pe}(?:([^\\s"'>=/]+)(${pe}*=${pe}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), ge = /'/g, _e = /"/g, ve = /^(?:script|style|textarea|title)$/i, ye = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), E = ye(1), be = ye(2), D = Symbol.for("lit-noChange"), O = Symbol.for("lit-nothing"), xe = /* @__PURE__ */ new WeakMap(), k = x.createTreeWalker(x, 129);
function Se(e, t) {
	if (!de(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return se === void 0 ? t : se.createHTML(t);
}
var Ce = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = w;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === w ? c[1] === "!--" ? o = me : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = T) : (ve.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = T) : o = he : o === T ? c[0] === ">" ? (o = i ?? w, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? T : c[3] === "\"" ? _e : ge) : o === _e || o === ge ? o = T : o === me || o === he ? o = w : (o = T, i = void 0);
		let d = o === T && e[t + 1].startsWith("/>") ? " " : "";
		a += o === w ? n + ue : l >= 0 ? (r.push(s), n.slice(0, l) + ce + n.slice(l) + b + d) : n + b + (l === -2 ? t : d);
	}
	return [Se(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, we = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Ce(t, n);
		if (this.el = e.createElement(l, r), k.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = k.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(ce)) {
					let t = u[o++], n = i.getAttribute(e).split(b), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Ee : r[1] === "?" ? De : r[1] === "@" ? Oe : M
					}), i.removeAttribute(e);
				} else e.startsWith(b) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (ve.test(i.tagName)) {
					let e = i.textContent.split(b), t = e.length - 1;
					if (t > 0) {
						i.textContent = y ? y.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], S()), k.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], S());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === le) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(b, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += b.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = x.createElement("template");
		return n.innerHTML = e, n;
	}
};
function A(e, t, n = e, r) {
	if (t === D) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = C(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = A(e, i._$AS(e, t.values), i, r)), t;
}
var Te = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? x).importNode(t, !0);
		k.currentNode = r;
		let i = k.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new j(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new ke(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = k.nextNode(), a++);
		}
		return k.currentNode = x, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, j = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = O, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = A(this, e, t), C(e) ? e === O || e == null || e === "" ? (this._$AH !== O && this._$AR(), this._$AH = O) : e !== this._$AH && e !== D && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? fe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== O && C(this._$AH) ? this._$AA.nextSibling.data = e : this.T(x.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = we.createElement(Se(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Te(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = xe.get(e.strings);
		return t === void 0 && xe.set(e.strings, t = new we(e)), t;
	}
	k(t) {
		de(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(S()), this.O(S()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = oe(e).nextSibling;
			oe(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, M = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = O, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = O;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = A(this, e, t, 0), a = !C(e) || e !== this._$AH && e !== D, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = A(this, r[n + o], t, o), s === D && (s = this._$AH[o]), a ||= !C(s) || s !== this._$AH[o], s === O ? e = O : e !== O && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === O ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Ee = class extends M {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === O ? void 0 : e;
	}
}, De = class extends M {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== O);
	}
}, Oe = class extends M {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = A(this, e, t, 0) ?? O) === D) return;
		let n = this._$AH, r = e === O && n !== O || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== O && (n === O || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, ke = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		A(this, e);
	}
}, Ae = v.litHtmlPolyfillSupport;
Ae?.(we, j), (v.litHtmlVersions ??= []).push("3.3.3");
var je = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new j(t.insertBefore(S(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, N = globalThis, P = class extends _ {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = je(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return D;
	}
};
P._$litElement$ = !0, P.finalized = !0, N.litElementHydrateSupport?.({ LitElement: P });
var Me = N.litElementPolyfillSupport;
Me?.({ LitElement: P }), (N.litElementVersions ??= []).push("4.2.2");
// node_modules/@lit/reactive-element/decorators/property.js
var Ne = {
	attribute: !0,
	type: String,
	converter: h,
	reflect: !1,
	hasChanged: g
}, Pe = (e = Ne, t, n) => {
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
function F(e) {
	return (t, n) => typeof n == "object" ? Pe(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function I(e) {
	return F({
		...e,
		state: !0,
		attribute: !1
	});
}
// node_modules/@mdi/js/mdi.js
var Fe = "M19.92,12.08L12,20L4.08,12.08L5.5,10.67L11,16.17V2H13V16.17L18.5,10.66L19.92,12.08M12,20H2V22H22V20H12Z", Ie = "M4.08,11.92L12,4L19.92,11.92L18.5,13.33L13,7.83V22H11V7.83L5.5,13.33L4.08,11.92M12,4H22V2H2V4H12Z", L = "M7.2,11.2C8.97,11.2 10.4,12.63 10.4,14.4C10.4,16.17 8.97,17.6 7.2,17.6C5.43,17.6 4,16.17 4,14.4C4,12.63 5.43,11.2 7.2,11.2M14.8,16A2,2 0 0,1 16.8,18A2,2 0 0,1 14.8,20A2,2 0 0,1 12.8,18A2,2 0 0,1 14.8,16M15.2,4A4.8,4.8 0 0,1 20,8.8C20,11.45 17.85,13.6 15.2,13.6A4.8,4.8 0 0,1 10.4,8.8C10.4,6.15 12.55,4 15.2,4Z", Le = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z", Re = "M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20Z", R = "M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.78 14.43 12.46 13.77 12.33 13C12.21 12.26 12.23 11.63 12.5 10.94C12.69 11.32 12.89 11.7 13.13 12C13.9 13 15.11 13.44 15.37 14.8C15.41 14.94 15.43 15.08 15.43 15.23C15.46 16.05 15.1 16.95 14.5 17.5H14.5Z", ze = "M22.11 21.46L2.39 1.73L1.11 3L7.09 9C5.66 10.36 4.88 12.47 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C17.1 19.26 17.15 19.18 17.22 19.11L20.84 22.73L22.11 21.46M8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C7 12.47 6.74 10.69 7.26 9.15L8.58 10.47C8.58 11.4 8.73 12.33 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.66 15 12.66 14.76 12.64 14.53L15 16.88C14.85 17.11 14.69 17.33 14.5 17.5M18.92 15.72L9.65 6.46C10.12 5.65 10.72 4.92 11.46 4.32C12.17 3.75 13 3.23 13.95 3C13 4.85 13.33 7.26 14.82 8.72C15.46 9.35 16.22 9.78 16.89 10.38C17.15 10.64 17.43 10.9 17.66 11.2C17.66 11.2 18.22 12 18.43 12.46L18.56 12.72C18.96 13.69 19.06 14.72 18.92 15.72Z", Be = "M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69M12 3L2 12H5V20H11V14H13V20H19V12H22", Ve = "M10 2C13.9 2 17 5.1 17 9C17 11.4 15.8 13.5 14 14.7V17C14 17.6 13.6 18 13 18H7C6.4 18 6 17.6 6 17V14.7C4.2 13.5 3 11.4 3 9C3 5.1 6.1 2 10 2M7 21V20H13V21C13 21.6 12.6 22 12 22H8C7.4 22 7 21.6 7 21M10 4C7.2 4 5 6.2 5 9C5 11.1 6.2 12.8 8 13.6V16H12V13.6C13.8 12.8 15 11.1 15 9C15 6.2 12.8 4 10 4M19 12V7H21V13H19M19 17V15H21V17H19Z", He = "M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M11,18H13V15.87C14.73,15.43 16,13.86 16,12A4,4 0 0,0 12,8A4,4 0 0,0 8,12C8,13.86 9.27,15.43 11,15.87V18Z", Ue = "M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z", We = "M19,13H5V11H19V13Z", Ge = "M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M6.5,12A1.5,1.5 0 0,1 5,10.5A1.5,1.5 0 0,1 6.5,9A1.5,1.5 0 0,1 8,10.5A1.5,1.5 0 0,1 6.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A1.5,1.5 0 0,0 13.5,19.5C13.5,19.11 13.35,18.76 13.11,18.5C12.88,18.23 12.73,17.88 12.73,17.5A1.5,1.5 0 0,1 14.23,16H16A5,5 0 0,0 21,11C21,6.58 16.97,3 12,3Z", Ke = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z", qe = "M7.95,3L6.53,5.19L7.95,7.4H7.94L5.95,10.5L4.22,9.6L5.64,7.39L4.22,5.19L6.22,2.09L7.95,3M13.95,2.89L12.53,5.1L13.95,7.3L13.94,7.31L11.95,10.4L10.22,9.5L11.64,7.3L10.22,5.1L12.22,2L13.95,2.89M20,2.89L18.56,5.1L20,7.3V7.31L18,10.4L16.25,9.5L17.67,7.3L16.25,5.1L18.25,2L20,2.89M2,22V14A2,2 0 0,1 4,12H20A2,2 0 0,1 22,14V22H20V20H4V22H2M6,14A1,1 0 0,0 5,15V17A1,1 0 0,0 6,18A1,1 0 0,0 7,17V15A1,1 0 0,0 6,14M10,14A1,1 0 0,0 9,15V17A1,1 0 0,0 10,18A1,1 0 0,0 11,17V15A1,1 0 0,0 10,14M14,14A1,1 0 0,0 13,15V17A1,1 0 0,0 14,18A1,1 0 0,0 15,17V15A1,1 0 0,0 14,14M18,14A1,1 0 0,0 17,15V17A1,1 0 0,0 18,18A1,1 0 0,0 19,17V15A1,1 0 0,0 18,14Z", Je = "M3.28,2L2,3.27L4.77,6.04L5.64,7.39L4.22,9.6L5.95,10.5L7.23,8.5L10.73,12H4A2,2 0 0,0 2,14V22H4V20H18.73L20,21.27V22H22V20.73L22,20.72V20.72L3.28,2M7,17A1,1 0 0,1 6,18A1,1 0 0,1 5,17V15A1,1 0 0,1 6,14A1,1 0 0,1 7,15V17M11,17A1,1 0 0,1 10,18A1,1 0 0,1 9,17V15A1,1 0 0,1 10,14A1,1 0 0,1 11,15V17M15,17A1,1 0 0,1 14,18A1,1 0 0,1 13,17V15C13,14.79 13.08,14.61 13.18,14.45L15,16.27V17M16.25,9.5L17.67,7.3L16.25,5.1L18.25,2L20,2.89L18.56,5.1L20,7.3V7.31L18,10.4L16.25,9.5M22,14V18.18L19,15.18V15A1,1 0 0,0 18,14C17.95,14 17.9,14 17.85,14.03L15.82,12H20C21.11,12 22,12.9 22,14M11.64,7.3L10.22,5.1L12.22,2L13.95,2.89L12.53,5.1L13.95,7.3L13.94,7.31L12.84,9L11.44,7.62L11.64,7.3M7.5,3.69L6.1,2.28L6.22,2.09L7.95,3L7.5,3.69Z", Ye = "M18,18H6V6H18V18Z", Xe = "M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5V8H11V5A1 1 0 0 1 12 4Z", Ze = "M16.95,16.95L14.83,14.83C15.55,14.1 16,13.1 16,12C16,11.26 15.79,10.57 15.43,10L17.6,7.81C18.5,9 19,10.43 19,12C19,13.93 18.22,15.68 16.95,16.95M12,5C13.57,5 15,5.5 16.19,6.4L14,8.56C13.43,8.21 12.74,8 12,8A4,4 0 0,0 8,12C8,13.1 8.45,14.1 9.17,14.83L7.05,16.95C5.78,15.68 5,13.93 5,12A7,7 0 0,1 12,5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z", Qe = "M12,3.25C12,3.25 6,10 6,14C6,17.32 8.69,20 12,20A6,6 0 0,0 18,14C18,10 12,3.25 12,3.25M14.47,9.97L15.53,11.03L9.53,17.03L8.47,15.97M9.75,10A1.25,1.25 0 0,1 11,11.25A1.25,1.25 0 0,1 9.75,12.5A1.25,1.25 0 0,1 8.5,11.25A1.25,1.25 0 0,1 9.75,10M14.25,14.5A1.25,1.25 0 0,1 15.5,15.75A1.25,1.25 0 0,1 14.25,17A1.25,1.25 0 0,1 13,15.75A1.25,1.25 0 0,1 14.25,14.5Z", $e = "M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9M8 12H16V14H8V12M8 15H16V17H8V15M8 18H16V20H8V18Z", et = "M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9Z", tt = {
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
}, nt = ["en", "fr"], z = {
	en: {},
	fr: {}
};
for (let [e, t] of Object.entries(tt)) for (let n of nt) for (let [r, i] of Object.entries(t[n] ?? {})) z[n][`${e}.${r}`] = i;
var B = "auto", V, H = "en", U = /* @__PURE__ */ new Set();
function rt(e) {
	return U.add(e), () => U.delete(e);
}
function it(e) {
	let t = (e || "").toLowerCase().split(/[-_]/)[0];
	return nt.includes(t) ? t : void 0;
}
function at() {
	let e = (B === "auto" ? it(V) : B) ?? "en";
	e !== H && (H = e, document.documentElement.dispatchEvent(new CustomEvent("homex-language-changed")), U.forEach((e) => e()));
}
function W(e) {
	let t = e?.locale?.language || e?.language;
	t && t !== V && (V = t, at());
}
function ot(e) {
	B = e && (e === "auto" || it(e)) ? e : "auto", at();
}
var st;
function ct(e) {
	return W(e), st ??= e.connection.sendMessagePromise({ type: "homex/settings/get" }).then((e) => ot(e.language)).catch(() => {
		st = void 0;
	}), st;
}
function G(e, t) {
	let n = z[H][e] ?? z.en[e] ?? e;
	return t && (n = n.replace(/\{(\w+)\}/g, (e, n) => n in t ? String(t[n]) : e)), n;
}
// src/cards/shared.ts
var lt;
function ut(e) {
	return lt ??= e.connection.sendMessagePromise({ type: "homex/rooms" }).then((e) => e.rooms).catch((e) => {
		throw lt = void 0, e;
	}), lt;
}
var K = (e, t, n = 1, r = 0) => t.toLocaleString(e.locale?.language || void 0, {
	minimumFractionDigits: r,
	maximumFractionDigits: n
}), q = (e) => E`<svg viewBox="0 0 24 24" aria-hidden="true">${be`<path d=${e}></path>`}</svg>`, dt = {
	co2: [800, 1200],
	pm25: [15, 35],
	pm10: [45, 100]
}, ft = (e) => G(`cardRoomTile.level_${[
	"good",
	"fair",
	"poor"
][e]}`), pt = (e, t) => {
	let [n, r] = dt[e];
	return {
		level: t <= n ? 0 : t <= r ? 1 : 2,
		ratio: t / n
	};
};
function J(e, t, n) {
	let r = e.states[`sensor.homex_${t}_${n}`], i = r ? parseFloat(r.state) : NaN;
	return Number.isNaN(i) ? void 0 : {
		value: i,
		unit: r.attributes.unit_of_measurement
	};
}
function mt(e, t) {
	let n = new Set((t?.heating?.radiators ?? []).map((e) => e.device_id));
	return n.size ? Object.values(e.entities ?? {}).filter((e) => e.entity_id.startsWith("climate.") && n.has(e.device_id)).map((e) => e.entity_id) : [];
}
function ht(e) {
	return [...new Set((e?.shutter_groups ?? []).flatMap((e) => e.devices))];
}
function gt(e) {
	let t = e?.attributes.current_position;
	return typeof t == "number" ? t : e?.state === "closed" ? 0 : 100;
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/decorate.js
function Y(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/cards/room-detail.ts
var _t, vt = [
	{
		key: "temperature",
		label: "cardRoomDetail.temperature",
		path: Xe,
		digits: 1
	},
	{
		key: "humidity",
		label: "cardRoomDetail.humidity",
		path: Qe,
		digits: 0
	},
	{
		key: "co2",
		label: "CO₂",
		path: Re,
		air: "co2",
		digits: 0
	},
	{
		key: "pm25",
		label: "PM2.5",
		path: L,
		air: "pm25",
		digits: 1
	},
	{
		key: "pm10",
		label: "PM10",
		path: L,
		air: "pm10",
		digits: 1
	}
], X = class extends P {
	constructor(...e) {
		super(...e), this.heading = "", this._busy = !1;
	}
	connectedCallback() {
		super.connectedCallback(), this._keydown = this._keydown.bind(this), window.addEventListener("keydown", this._keydown), this._unlisten = rt(() => this.requestUpdate()), this._loadHeating();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), window.removeEventListener("keydown", this._keydown), this._unlisten?.(), this._unlisten = void 0;
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
	willUpdate(e) {
		e.has("hass") && this.hass && (W(this.hass), ct(this.hass));
		let t = this.hass?.states[this._heatingSwitch]?.state;
		this._lastHeatingSwitch !== void 0 && t !== this._lastHeatingSwitch && setTimeout(() => this._loadHeating(), 1500), this._lastHeatingSwitch = t;
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
	async _setpoint(e, t) {
		this._busy = !0;
		try {
			await this.hass.callService("climate", "set_temperature", {
				entity_id: e,
				temperature: t
			});
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
		let e = this.room.room_id, t = (t) => J(this.hass, e, t), n = (e) => {
			let n = vt.find((t) => t.key === e), r = t(e);
			if (!r) return;
			let i = e === "humidity" ? "%" : r.unit ?? "", a = n.air ? pt(n.air, r.value).level : void 0;
			return E`<span class="item" title=${n.air ? n.label : G(n.label)}>
        <span class="micon">${q(n.path)}</span>
        ${n.air === "pm25" || n.air === "pm10" ? E`<span class="tag">${n.label.slice(2)}</span>` : O}
        <span class="mvalue">${K(this.hass, r.value, n.digits, +(e === "temperature"))} ${i}</span>
        ${a === void 0 ? O : E`<span class="pill l${a}">${ft(a)}</span>`}
      </span>`;
		}, r = [
			[n("temperature"), n("humidity")],
			[n("co2")],
			[n("pm25"), n("pm10")]
		].map((e) => e.filter((e) => e)).filter((e) => e.length);
		return r.length ? E`<section>
      <h3>${G("cardRoomDetail.climate")}</h3>
      ${r.map((e) => E`<div class="mline">${e}</div>`)}
    </section>` : O;
	}
	_heatingSection() {
		if (!this.room.heating?.radiators?.length) return O;
		let e = this.hass.states[this._heatingSwitch], t = this._heating, n = mt(this.hass, this.room).filter((e) => this.hass.states[e]), r = n.some((e) => this.hass.states[e]?.attributes.hvac_action === "heating"), i = e ? e.state === "on" : t?.room_enabled !== !1, a = n.length ? this.hass.states[n[0]].attributes : void 0, o = typeof a?.temperature == "number" ? a.temperature : void 0, s = a?.target_temp_step || .5, c = a?.min_temp ?? 5, l = a?.max_temp ?? 30, u = i ? r ? {
			cls: "heat",
			path: R,
			text: G("cardRoomDetail.heating")
		} : {
			cls: "",
			path: R,
			text: G("cardRoomDetail.idle")
		} : {
			cls: "off",
			path: ze,
			text: G("cardRoomDetail.off")
		};
		return E`<section class="heating">
      <div class="head">
        <h3>${G("cardRoomDetail.section_heating")}</h3>
        ${e ? E`<label class="switch" title=${G(i ? "cardRoomDetail.stop_heating_room" : "cardRoomDetail.heat_room")}>
              <input
                type="checkbox"
                .checked=${i}
                @change=${(e) => this.hass.callService("switch", e.target.checked ? "turn_on" : "turn_off", { entity_id: this._heatingSwitch })}
              />
              <span></span>
            </label>` : O}
      </div>
      <div class="hbody">
      <div class="hstatus">
        <span class="status big-icon ${u.cls}">${q(u.path)}</span>
        <span class="htext">
          <span class="hstate">${G(i ? "cardRoomDetail.room_heated" : "cardRoomDetail.room_unheated")}</span>
          <span class="secondary">${u.text}</span>
        </span>
      </div>
      ${o === void 0 ? O : E`<div
            class="setpoint ${i ? "" : "inactive"}"
            title=${G(i ? "cardRoomDetail.setpoint_kept" : "cardRoomDetail.room_unheated")}
          >
            <span class="muted">${G("cardRoomDetail.setpoint")}</span>
            <button
              class="round"
              title=${G("cardRoomDetail.raise")}
              ?disabled=${!i || this._busy || o + s > l}
              @click=${() => this._setpoint(n, o + s)}
            >
              ${q(Ke)}
            </button>
            <span class="big">${K(this.hass, o, 1, 1)} °C</span>
            <button
              class="round"
              title=${G("cardRoomDetail.lower")}
              ?disabled=${!i || this._busy || o - s < c}
              @click=${() => this._setpoint(n, o - s)}
            >
              ${q(We)}
            </button>
          </div>`}
      ${t ? E`<div class="hmode muted">
            ${i ? `${G("cardRoomDetail.mode", { name: t.mode_name })}${t.enabled ? "" : G("cardRoomDetail.global_off")}` : "—"}
          </div>` : O}
      </div>
    </section>`;
	}
	_shutters() {
		let e = ht(this.room).filter((e) => this.hass.states[e]);
		if (!e.length) return O;
		let t = (e) => {
			if (e.state === "opening") return G("cardRoomDetail.opening");
			if (e.state === "closing") return G("cardRoomDetail.closing");
			let t = gt(e);
			return t === 0 ? G("cardRoomDetail.closed") : t === 100 ? G("cardRoomDetail.open") : G("cardRoomDetail.partial", { pos: t });
		}, n = [...e.length > 1 ? [{
			title: G("cardRoomDetail.all"),
			state: "",
			entity: e
		}] : [], ...e.map((n, r) => ({
			title: e.length > 1 ? G("cardRoomDetail.shutter_n", { n: r + 1 }) : "",
			state: t(this.hass.states[n]),
			entity: n
		}))];
		return E`<section>
      <h3>${G("cardRoomDetail.shutters")}</h3>
      <div class="covers">
        ${n.map((e) => E`<div class="cover ${e.state ? "" : "all"}">
            ${e.title ? E`<div class="ctitle">${e.title}</div>` : O}
            <div class="cstate">${e.state || "\xA0"}</div>
            <button class="big-btn" title=${G("cardRoomDetail.open_action")} @click=${() => this._cover("open_cover", e.entity)}>
              ${q(Ie)}
            </button>
            <button class="big-btn" title=${G("cardRoomDetail.stop_action")} @click=${() => this._cover("stop_cover", e.entity)}>
              ${q(Ye)}
            </button>
            <button class="big-btn" title=${G("cardRoomDetail.close_action")} @click=${() => this._cover("close_cover", e.entity)}>
              ${q(Fe)}
            </button>
          </div>`)}
      </div>
    </section>`;
	}
	render() {
		if (!this.hass || !this.room) return O;
		let e = this._climate(), t = [this._shutters(), this._heatingSection()].filter((e) => e !== O), n = [...e === O ? [] : [e], ...t.length ? [E`<div class="cols ${t.length > 1 ? "two" : ""}">${t}</div>`] : []];
		return E`<div class="backdrop" @click=${this.close}></div>
      <div class="dialog ${t.length > 1 ? "wide" : ""}" role="dialog" aria-modal="true" aria-label=${this.heading}>
        <header>
          <h2>${this.heading}</h2>
          <button class="round" title=${G("common.close")} @click=${this.close}>${q(Le)}</button>
        </header>
        <div class="body">${n.length ? n : E`<p class="muted">${G("cardRoomDetail.no_data")}</p>`}</div>
      </div>`;
	}
};
_t = X, _t.styles = o`
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
    .dialog.wide {
      width: min(680px, calc(100vw - 32px));
    }
    .cols {
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
    }
    .body > .cols:first-child {
      border-top: none;
    }
    .cols.two {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
    .cols.two > section + section {
      border-top: none;
      border-left: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
      padding-left: 20px;
      margin-left: 20px;
    }
    /* Both columns: title on top, content vertically centred below. */
    .cols.two > section {
      display: flex;
      flex-direction: column;
    }
    .cols.two .covers,
    .cols.two .hbody {
      flex: 1;
    }
    .cols.two .covers {
      align-content: center;
      align-items: center;
    }
    .hbody {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-top: 10px;
    }
    .heating .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .hstatus {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
    }
    .big-icon svg {
      width: 36px;
      height: 36px;
    }
    .htext {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .secondary {
      color: var(--secondary-text-color);
    }
    .setpoint.inactive .big {
      color: var(--disabled-text-color, #6f6f6f);
    }
    .hmode {
      margin-top: 12px;
      text-align: center;
    }
    .hstate {
      font-weight: 500;
      font-size: 14px;
    }
    .setpoint {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      margin-top: 14px;
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
    .body > section + .cols,
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
    .mline {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px 20px;
      min-height: 32px;
    }
    .item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .tag {
      font-size: 10px;
      color: var(--secondary-text-color);
      margin-left: -4px;
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
      --pill: var(--secondary-text-color, #9e9e9e);
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
    .covers {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
    }
    .cover {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-width: 84px;
    }
    .cover.all {
      padding-right: 12px;
      border-right: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
    }
    .ctitle {
      font-weight: 500;
      font-size: 13px;
    }
    .cstate {
      font-size: 12px;
      color: var(--secondary-text-color);
      min-height: 16px;
    }
    .big-btn {
      width: 64px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(127, 127, 127, 0.15);
    }
    .big-btn:hover {
      background: rgba(127, 127, 127, 0.25);
    }
    .big-btn svg {
      width: 26px;
      height: 26px;
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
    /* Phones: shutters and heating stay side by side, everything smaller. */
    @media (max-width: 600px) {
      .body {
        padding: 0 14px 14px;
      }
      header {
        padding: 12px 12px 4px 16px;
      }
      h3 {
        font-size: 11px;
        margin: 10px 0 6px;
      }
      .cols.two > section + section {
        padding-left: 10px;
        margin-left: 10px;
      }
      .covers {
        gap: 6px;
      }
      .cover {
        min-width: 0;
        gap: 5px;
      }
      .cover.all {
        padding-right: 6px;
      }
      .ctitle {
        font-size: 11px;
      }
      .cstate {
        font-size: 10px;
      }
      .big-btn {
        width: 40px;
        height: 38px;
        border-radius: 10px;
      }
      .big-btn svg {
        width: 20px;
        height: 20px;
      }
      .switch {
        transform: scale(0.85);
        transform-origin: right center;
      }
      .hstatus {
        gap: 8px;
        font-size: 11px;
      }
      .big-icon svg {
        width: 26px;
        height: 26px;
      }
      .hstate {
        font-size: 12px;
      }
      .muted {
        font-size: 11px;
      }
      .setpoint {
        margin-top: 10px;
        gap: 4px;
      }
      .big {
        font-size: 17px;
        min-width: 0;
      }
      .round {
        width: 32px;
        height: 32px;
      }
      .mvalue {
        font-size: 14px;
      }
    }
  `, Y([F({ attribute: !1 })], X.prototype, "hass", void 0), Y([F({ attribute: !1 })], X.prototype, "room", void 0), Y([F()], X.prototype, "heading", void 0), Y([I()], X.prototype, "_heating", void 0), Y([I()], X.prototype, "_busy", void 0), customElements.get("homex-room-detail") || customElements.define("homex-room-detail", X);
// src/cards/room-tile.ts
var yt, bt = (e) => /^[a-z][a-z-]*$/.test(e) ? `var(--${e}-color, ${e})` : e, xt = "M3 4H21V6H20V20H18V6H6V20H4V6H3V4M7 7H17V9H7V7M7 10H17V12H7V10M7 13H17V14H7V13Z", Z = class extends P {
	static getStubConfig() {
		return { room: "" };
	}
	static getConfigElement() {
		return document.createElement("homex-room-tile-editor");
	}
	setConfig(e) {
		if (!e) throw Error(G("cardRoomTile.config_required"));
		e.room !== this._config?.room && (this._room = void 0), this._config = e;
	}
	connectedCallback() {
		super.connectedCallback(), this._unlisten = rt(() => this.requestUpdate());
	}
	willUpdate(e) {
		e.has("hass") && this.hass && (W(this.hass), ct(this.hass));
	}
	updated() {
		this.hass && this._config?.room && !this._room && ut(this.hass).then((e) => {
			this._room = e.find((e) => e.room_id === this._config.room);
		}).catch(() => void 0), this._detail && (this._detail.hass = this.hass);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._unlisten?.(), this._unlisten = void 0, this._detail?.close();
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
	get _climate() {
		return this._config?.mode === "climate";
	}
	get _entity() {
		return this._config.entity || `switch.homex_${this._config.room}_${this._climate ? "heating" : "lights_toggle"}`;
	}
	_setpoint() {
		let e = mt(this.hass, this._room).filter((e) => this.hass.states[e]), t = e.length ? this.hass.states[e[0]].attributes.temperature : void 0;
		return typeof t == "number" ? t : void 0;
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
	get _noAction() {
		return !this._climate && !this._config.entity && !this.hass.states[`switch.homex_${this._config.room}_lights_toggle`] && (!this._room || !this._room.modules?.includes("lights"));
	}
	_toggle() {
		if (this._noAction || this._config.toggle === !1) return;
		let e = this.hass.states[this._entity];
		if (!e) return;
		let t = this._isLights ? this._lightState() === "lit" : e.state === "on";
		this.hass.callService("switch", t ? "turn_off" : "turn_on", { entity_id: this._entity });
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
	_activateScene(e, t) {
		e.stopPropagation(), this.hass.connection.sendMessagePromise({
			type: "homex/scene/activate",
			room_id: this._config.room,
			key: t
		});
	}
	_air() {
		if (!this.hass || !this._config || this._climate) return [];
		let e = (e, t, n, r = "") => {
			let i = J(this.hass, this._config.room, e);
			return i && {
				key: e,
				label: t,
				path: n,
				tag: r,
				...i,
				...pt(e, i.value)
			};
		}, t = [e("pm25", "PM2.5", L, "2.5"), e("pm10", "PM10", L, "10")].filter((e) => !!e).sort((e, t) => t.ratio - e.ratio)[0];
		return [e("co2", "CO₂", Re), t].filter((e) => !!e);
	}
	_scenes() {
		if (!this._room || this._climate || this._config?.show_scenes !== !0 || !this._room.modules?.includes("lights")) return [];
		let e = (this._room.scenes ?? []).filter((e) => e.key !== "turn_off");
		if (e.length < 2) return [];
		let t = this._config?.scenes;
		return e.filter((e) => !t || t.includes(e.key));
	}
	_heatingStatus() {
		if (!this._room?.heating?.radiators?.length) return O;
		let e = this.hass.states[`switch.homex_${this._config.room}_heating`];
		return (e ? e.state !== "off" : this._room.heating.enabled !== !1) ? mt(this.hass, this._room).some((e) => this.hass.states[e]?.attributes.hvac_action === "heating") ? this._status(R, "heat", G("cardRoomTile.heating")) : this._status(R, "", G("cardRoomTile.no_demand")) : this._status(ze, "off", G("cardRoomTile.room_unheated"));
	}
	_shutterStatus() {
		if (this._climate) return O;
		let e = ht(this._room).map((e) => this.hass.states[e]).filter((e) => e && e.state !== "unavailable" && e.state !== "unknown");
		if (!e.length) return O;
		let t = e.map(gt), n = Math.round(t.reduce((e, t) => e + t, 0) / t.length);
		return t.every((e) => e === 0) ? this._status($e, "", G("cardRoomTile.shutters_closed")) : t.every((e) => e === 100) ? this._status(et, "", G("cardRoomTile.shutters_open")) : this._status(xt, "", G("cardRoomTile.shutters_partial", { pos: n }));
	}
	_status(e, t, n) {
		return E`<span class="status ${t}" title=${n}>${q(e)}</span>`;
	}
	render() {
		if (!this._config || !this.hass) return O;
		if (!this._config.room) return E`<ha-card class="empty">${G("cardRoomTile.choose_room")}</ha-card>`;
		let e = this.hass.states[this._entity], t = e?.state === "on", n = this._entity.endsWith("_heating"), r = this._isLights ? this._lightState() : void 0, i = this._climate ? t ? qe : Je : r === "lit" ? He : r === "stray" ? Ve : r === "off" ? Ue : void 0, a = e ? e.state === "unavailable" ? G("cardRoomTile.unavailable") : this._climate ? G(t ? "cardRoomTile.heated_toggle" : "cardRoomTile.unheated_toggle") : r === "lit" ? G("cardRoomTile.lit_toggle") : r === "stray" ? G("cardRoomTile.stray_toggle") : r === "off" ? G("cardRoomTile.off_toggle") : this.hass.formatEntityState?.(e) ?? e.state : G("cardRoomTile.not_found"), o = this._noAction, s = !o && this._config.toggle === !1, c = !o && (!e || e.state === "unavailable"), l = J(this.hass, this._config.room, "temperature"), u = J(this.hass, this._config.room, "humidity"), d = this._air(), ee = this._scenes(), te = this._climate && t && !c ? this._setpoint() : void 0, ne = this._lightState() === "lit" ? this.hass.states[`switch.homex_${this._config.room}_lights_toggle`]?.attributes.active_scene : void 0, f = this._heatingStatus(), p = this._shutterStatus(), re = l || u || f !== O || p !== O;
		return E`<ha-card
      class="${t && !o && !s ? "on" : ""} ${o || s ? "static" : ""}"
      style=${this._config.color ? `--tile-color: ${bt(this._config.color)}` : n ? "--tile-color: var(--state-climate-heat-color, #ff8100)" : ""}
      title=${o ? this._name() : s ? a.split(" — ")[0] : a}
      @click=${this._toggle}
    >
      <div class="main">
        <div class="icon">
          ${this._config.icon ? E`<ha-icon .icon=${this._config.icon}></ha-icon>` : o ? q(Be) : i ? q(i) : E`<ha-icon .icon=${"mdi:radiator"}></ha-icon>`}
        </div>
        <div class="info">
          <div class="name">${this._name()}</div>
          ${c ? E`<div class="sub">${a}</div>` : O}
          ${this._climate && !c ? E`<div class="sub setpoint">
                ${t ? te === void 0 ? G("cardRoomTile.room_heated") : E`${q(Ze)}<span>${G("cardRoomTile.setpoint", { value: K(this.hass, te, 1, 1) })}</span>` : G("cardRoomTile.room_unheated")}
              </div>` : O}
          ${d.length ? E`<div class="pills">
                ${d.map((e) => E`<span class="pill l${e.level}" title=${G("cardRoomTile.metric_title", {
			label: e.label,
			value: K(this.hass, e.value, 1),
			unit: e.unit ?? ""
		})}
                      ><span class="picto">${q(e.path)}${e.tag ? E`<small>${e.tag}</small>` : O}</span
                      ><span class="pval">${K(this.hass, e.value, 0)}</span></span
                    >`)}
              </div>` : O}
        </div>
        ${re ? E`<button class="right" title=${G("cardRoomTile.room_status")} @click=${this._openDetail}>
              <span class="statuses">${p}${f}</span>
              ${l || u ? E`<span class="readings">
                    ${l ? E`<span class="temp">${K(this.hass, l.value, 1, 1)} ${l.unit ?? "°C"}</span>` : O}
                    ${u ? E`<span class="hum">${K(this.hass, u.value, 0)} %</span>` : O}
                  </span>` : O}
            </button>` : O}
      </div>
      ${ee.length ? E`<div class="scenes" @click=${(e) => e.stopPropagation()}>
            <span class="scenes-icon" title=${G("cardRoomTile.scenes")}>${q(Ge)}</span>
            <div class="group">
            ${ee.map((e) => E`<button
                  class="scene ${e.key === ne ? "active" : ""}"
                  title=${this._config.scene_names?.[e.key] || e.name}
                  @click=${(t) => this._activateScene(t, e.key)}
                >
                  ${this._config.scene_names?.[e.key] || e.name}
                </button>`)}
            </div>
          </div>` : O}
    </ha-card>`;
	}
};
yt = Z, yt.styles = o`
    :host {
      --tile-color: var(--state-light-active-color, var(--amber-color, #ffc107));
    }
    ha-card {
      height: 100%;
      box-sizing: border-box;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
    }
    ha-card.static {
      cursor: default;
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
      padding: 10px 6px 10px 10px;
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
    .setpoint {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
    }
    .setpoint svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }
    .pills {
      display: flex;
      gap: 4px;
      margin-top: 3px;
    }
    .pill {
      --pill: var(--secondary-text-color, #9e9e9e);
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
    .readings {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      min-width: 56px;
    }
    .temp {
      font-size: 12px;
      font-weight: 600;
      line-height: 16px;
      color: var(--primary-text-color);
    }
    .hum {
      font-size: 12px;
      font-weight: 600;
      line-height: 16px;
      color: var(--secondary-text-color);
    }
    /* The scenes row: past a divider, flush with the card's right and bottom
       edges (the button group ends where the card does). */
    .scenes {
      display: flex;
      align-items: stretch;
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      cursor: default;
    }
    .scenes-icon {
      flex: none;
      width: 56px;
      align-items: center;
      display: flex;
      justify-content: center;
      color: var(--secondary-text-color);
    }
    .scenes-icon svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
    .group {
      flex: 1;
      min-width: 0;
      display: flex;
      border-left: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    }
    .scene {
      flex: 1 1 0;
      min-width: 0;
      min-height: 42px;
      padding: 4px 6px;
      font: inherit;
      font-size: 13px;
      line-height: 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border: none;
      border-left: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      background: none;
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .scene:first-child {
      border-left: none;
    }
    .scene:hover {
      background: rgba(127, 127, 127, 0.1);
    }
    .scene.active {
      background: color-mix(in srgb, var(--tile-color) 28%, transparent);
      font-weight: 600;
    }
  `, Y([F({ attribute: !1 })], Z.prototype, "hass", void 0), Y([I()], Z.prototype, "_config", void 0), Y([I()], Z.prototype, "_room", void 0), customElements.get("homex-room-tile") || customElements.define("homex-room-tile", Z);
// src/lib/logo.ts
var St = "M10 1H22A9 9 0 0 1 31 10V22A9 9 0 0 1 22 31H10A9 9 0 0 1 1 22V10A9 9 0 0 1 10 1ZM10 3.5A6.5 6.5 0 0 0 3.5 10V22A6.5 6.5 0 0 0 10 28.5H22A6.5 6.5 0 0 0 28.5 22V10A6.5 6.5 0 0 0 22 3.5ZM9.5 7H12.5A2.5 2.5 0 0 1 15 9.5V22.5A2.5 2.5 0 0 1 12.5 25H9.5A2.5 2.5 0 0 1 7 22.5V9.5A2.5 2.5 0 0 1 9.5 7ZM19.5 6.5H22.5A3 3 0 0 1 25.5 9.5V22.5A3 3 0 0 1 22.5 25.5H19.5A3 3 0 0 1 16.5 22.5V9.5A3 3 0 0 1 19.5 6.5ZM19.75 8.75A1 1 0 0 0 18.75 9.75V22.25A1 1 0 0 0 19.75 23.25H22.25A1 1 0 0 0 23.25 22.25V9.75A1 1 0 0 0 22.25 8.75Z";
function Ct() {
	let e = window;
	e.customIconsets = e.customIconsets || {}, e.customIconsets.homex ??= async () => ({
		path: St,
		viewBox: "0 0 32 32"
	});
}
// src/cards/room-tile-editor.ts
var wt, Tt = [
	"red",
	"pink",
	"purple",
	"deep-purple",
	"indigo",
	"blue",
	"light-blue",
	"cyan",
	"teal",
	"green",
	"light-green",
	"lime",
	"yellow",
	"amber",
	"orange",
	"deep-orange",
	"brown",
	"grey",
	"blue-grey"
], Et = (e) => G(`cardRoomTileEditor.color_${e.replace(/-/g, "_")}`), Q = class extends P {
	constructor(...e) {
		super(...e), this._rooms = [];
	}
	setConfig(e) {
		this._config = e;
	}
	connectedCallback() {
		super.connectedCallback(), this._unlisten = rt(() => this.requestUpdate());
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._unlisten?.(), this._unlisten = void 0;
	}
	willUpdate(e) {
		e.has("hass") && this.hass && (W(this.hass), ct(this.hass));
	}
	firstUpdated() {
		ut(this.hass).then((e) => this._rooms = [...e].sort((e, t) => e.name.localeCompare(t.name))).catch(() => void 0);
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
	_include(e, t, n) {
		let r = this._config.scenes ?? e, i = n ? [...r, t] : r.filter((e) => e !== t), a = e.every((e) => i.includes(e));
		this._set({ scenes: a ? void 0 : e.filter((e) => i.includes(e)) });
	}
	_rename(e, t) {
		let n = { ...this._config.scene_names ?? {} };
		t.trim() ? n[e] = t.trim() : delete n[e], this._set({ scene_names: Object.keys(n).length ? n : void 0 });
	}
	render() {
		if (!this._config) return O;
		let e = this._rooms.find((e) => e.room_id === this._config.room), t = this._config.room, n = t ? [[`switch.homex_${t}_lights_toggle`, G("cardRoomTileEditor.lights")], [`switch.homex_${t}_heating`, G("cardRoomTileEditor.heating")]].filter(([e]) => this.hass.states[e]) : [], r = this._config.entity || `switch.homex_${t}_lights_toggle`, i = (e?.scenes ?? []).filter((e) => e.key !== "turn_off"), a = this._config.scenes, o = this._config.mode === "climate", s = this._config.color, c = !!s && Tt.includes(s);
		return E`
      <label>
        ${G("cardRoomTileEditor.room")}
        <select @change=${(e) => this._set({
			room: e.target.value,
			scenes: void 0,
			entity: void 0
		})}>
          <option value="" ?selected=${!t}>—</option>
          ${this._rooms.map((e) => E`<option value=${e.room_id} ?selected=${e.room_id === t}>${e.name}</option>`)}
        </select>
      </label>
      <label>
        ${G("cardRoomTileEditor.variant")}
        <select
          @change=${(e) => {
			let t = e.target.value;
			this._set(t === "climate" ? {
				mode: "climate",
				entity: void 0,
				show_scenes: void 0,
				scenes: void 0,
				scene_names: void 0
			} : {
				mode: void 0,
				entity: void 0
			});
		}}
        >
          <option value="default" ?selected=${!o}>${G("cardRoomTileEditor.variant_default")}</option>
          <option value="climate" ?selected=${o}>${G("cardRoomTileEditor.variant_climate")}</option>
        </select>
      </label>
      ${!o && n.length > 1 ? E`<label>
            ${G("cardRoomTileEditor.tile_switch")}
            <select
              @change=${(e) => {
			let t = e.target.value;
			this._set({ entity: t.endsWith("_lights_toggle") ? void 0 : t });
		}}
            >
              ${n.map(([e, t]) => E`<option value=${e} ?selected=${e === r}>${t}</option>`)}
            </select>
          </label>` : O}
      <label>
        ${G("cardRoomTileEditor.name")}
        <input
          .value=${this._config.name ?? ""}
          placeholder=${e?.name ?? ""}
          @change=${(e) => this._set({ name: e.target.value })}
        />
      </label>
      <div class="color-row">
        <label>
          ${G("cardRoomTileEditor.active_color")}
          <select
            @change=${(e) => {
			let t = e.target.value;
			this._set({ color: t === "custom" ? this._config.color?.startsWith("#") ? this._config.color : "#ff8100" : t || void 0 });
		}}
          >
            <option value="" ?selected=${!s}>${G("cardRoomTileEditor.color_default", { color: G(o ? "cardRoomTileEditor.color_default_heating" : "cardRoomTileEditor.color_default_lights") })}</option>
            ${Tt.map((e) => E`<option value=${e} ?selected=${s === e}>${Et(e)}</option>`)}
            <option value="custom" ?selected=${!!s && !c}>${G("cardRoomTileEditor.color_custom")}</option>
          </select>
        </label>
        ${s && !c ? E`<input
              type="color"
              .value=${/^#[0-9a-f]{6}$/i.test(s) ? s : "#ff8100"}
              @change=${(e) => this._set({ color: e.target.value })}
            />` : E`<span class="swatch" style="background: ${s ? bt(s) : o ? "var(--state-climate-heat-color, #ff8100)" : "var(--state-light-active-color, var(--amber-color, #ffc107))"}"></span>`}
      </div>
      <div class="toggle-row">
        <span>${G(o ? "cardRoomTileEditor.toggle_heating" : "cardRoomTileEditor.toggle_lights")}</span>
        <label class="switch">
          <input
            type="checkbox"
            .checked=${this._config.toggle !== !1}
            @change=${(e) => this._set({ toggle: e.target.checked ? void 0 : !1 })}
          />
          <span></span>
        </label>
      </div>
      ${!o && i.length > 1 ? E`<div class="toggle-row">
              <span>${G("cardRoomTileEditor.show_scenes")}</span>
              <label class="switch">
                <input
                  type="checkbox"
                  .checked=${this._config.show_scenes === !0}
                  @change=${(e) => this._set({ show_scenes: e.target.checked ? !0 : void 0 })}
                />
                <span></span>
              </label>
            </div>
            ${this._config.show_scenes === !0 ? E`<div class="scene-list">
                  <div class="hint">${G("cardRoomTileEditor.scenes_hint")}</div>
                  ${i.map((e) => {
			let t = !a || a.includes(e.key);
			return E`<div class="scene-row ${t ? "" : "excluded"}">
                      <input
                        type="checkbox"
                        title=${G(t ? "cardRoomTileEditor.remove_scene" : "cardRoomTileEditor.add_scene")}
                        .checked=${t}
                        @change=${(t) => this._include(i.map((e) => e.key), e.key, t.target.checked)}
                      />
                      <input
                        class="label"
                        .value=${this._config.scene_names?.[e.key] ?? ""}
                        placeholder=${e.name}
                        ?disabled=${!t}
                        @change=${(t) => this._rename(e.key, t.target.value)}
                      />
                    </div>`;
		})}
                </div>` : O}` : O}
    `;
	}
};
// src/homex-cards.ts
wt = Q, wt.styles = o`
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
    .color-row {
      display: flex;
      align-items: flex-end;
      gap: 10px;
    }
    .color-row label {
      flex: 1;
    }
    .color-row input[type="color"],
    .swatch {
      width: 38px;
      height: 38px;
      flex: none;
      box-sizing: border-box;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #888);
      padding: 2px;
      background: none;
    }
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      color: var(--primary-text-color);
    }
    .switch {
      position: relative;
      display: inline-block;
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
      background: var(--primary-color, #03a9f4);
    }
    .switch input:checked + span::before {
      transform: translateX(18px);
    }
    .scene-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
      border-radius: 8px;
      padding: 10px;
    }
    .hint {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .scene-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .scene-row input[type="checkbox"] {
      width: 18px;
      height: 18px;
      flex: none;
      accent-color: var(--primary-color);
    }
    .scene-row .label {
      flex: 1;
      min-width: 0;
    }
    .scene-row.excluded .label {
      opacity: 0.5;
    }
  `, Y([F({ attribute: !1 })], Q.prototype, "hass", void 0), Y([I()], Q.prototype, "_config", void 0), Y([I()], Q.prototype, "_rooms", void 0), customElements.get("homex-room-tile-editor") || customElements.define("homex-room-tile-editor", Q), Ct();
var $ = window;
$.customCards = $.customCards || [], $.customCards.some((e) => e.type === "homex-room-tile") || $.customCards.push({
	type: "homex-room-tile",
	get name() {
		return G("cardRoomTile.card_name");
	},
	get description() {
		return G("cardRoomTile.card_description");
	},
	preview: !0
});
