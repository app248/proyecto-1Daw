/*
 * dc.js — mini motor de plantillas para ByBook (JavaScript puro, sin librerías).
 *
 * Cada página HTML contiene:
 *   <template data-dc-component="__root"> ... </template>  → el HTML de la página con {{huecos}}
 *   <script type="text/x-dc" data-dc-logic="__root"> ...   → class Component extends DCLogic { renderVals() {...} }
 * Los componentes compartidos (cabecera, pie, portada) se registran en js/componentes.js con DC.registrar().
 *
 * Idea clave: renderVals() devuelve los datos; la plantilla los pinta. Cuando algo cambia
 * se llama a setState() o forceUpdate() y la página se vuelve a pintar (solo cambia lo necesario).
 *
 * Sintaxis soportada en las plantillas:
 *   {{ ruta.al.valor }}          texto o atributo
 *   onClick="{{ funcion }}"      eventos (onClick, onInput, onChange, onSubmit, onKeyDown)
 *   <sc-for list="{{lista}}" as="item"> ... </sc-for>      repetir
 *   <sc-if value="{{condicion}}"> ... </sc-if>              mostrar si es verdadero
 *   <dc-import name="Nav" active="inicio"></dc-import>     insertar componente
 */
(function () {
  'use strict';

  /* ---------- Clase base de los componentes ---------- */
  class DCLogic {
    constructor(props) {
      this.props = props || {};
      this.state = {};
    }
    setState(update) {
      const patch = typeof update === 'function' ? update(this.state, this.props) : update;
      this.state = Object.assign({}, this.state, patch);
      if (this.__instance) this.__instance.schedule();
    }
    forceUpdate() {
      if (this.__instance) this.__instance.schedule();
    }
  }
  window.DCLogic = DCLogic;

  /* ---------- Registro de plantillas y lógicas ---------- */
  const templates = {};
  const classes = {};

  // Permite definir componentes compartidos desde un archivo .js (ver js/componentes.js):
  //   DC.registrar('Nav', '<header>…</header>', class extends DCLogic { renderVals() {…} });
  window.DC = {
    registrar(nombre, html, Clase) {
      const t = document.createElement('template');
      t.innerHTML = html;
      templates[nombre] = t;
      if (Clase) classes[nombre] = Clase;
    }
  };

  function compileLogic(src) {
    // eslint-disable-next-line no-new-func
    return new Function('DCLogic', src + '\nreturn Component;')(DCLogic);
  }

  /* ---------- Resolución de {{huecos}} ---------- */
  const WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  const ANY = /\{\{\s*([^}]+?)\s*\}\}/g;

  function lookup(path, scope) {
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    if (/^(['"]).*\1$/.test(path)) return path.slice(1, -1);
    const parts = path.split('.');
    let cur = scope;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  }

  // Atributos: si el valor es solo un hueco, devuelve el dato tal cual (número, función...)
  function resolve(str, scope) {
    const m = str.match(WHOLE);
    if (m) return lookup(m[1], scope);
    return interpolate(str, scope);
  }

  // Texto: sustituye cada hueco por su valor y conserva los espacios de alrededor
  function interpolate(str, scope) {
    if (str.indexOf('{{') === -1) return str;
    return str.replace(ANY, (_, p) => {
      const v = lookup(p, scope);
      return v == null ? '' : String(v);
    });
  }

  /* ---------- Plantilla → nodos virtuales ---------- */
  const EVENTS = { onclick: 'click', oninput: 'input', onchange: 'change', onsubmit: 'submit', onkeydown: 'keydown' };

  function build(node, scope, out) {
    if (node.nodeType === 3) {
      out.push({ text: interpolate(node.nodeValue, scope) });
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();

    if (tag === 'sc-if') {
      const v = resolve(node.getAttribute('value') || '', scope);
      if (v) buildChildren(node, scope, out);
      return;
    }
    if (tag === 'sc-for') {
      const list = resolve(node.getAttribute('list') || '', scope) || [];
      const as = node.getAttribute('as') || 'item';
      Array.from(list).forEach((item, i) => {
        const s = Object.create(scope);
        s[as] = item;
        s.$index = i;
        buildChildren(node, s, out);
      });
      return;
    }
    if (tag === 'dc-import') {
      const props = {};
      let name = '';
      for (const a of Array.from(node.attributes)) {
        if (a.name === 'name') { name = a.value; continue; }
        if (a.name.indexOf('hint-') === 0) continue;
        const key = a.name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        props[key] = resolve(a.value, scope);
      }
      out.push({ component: name, props });
      return;
    }

    const v = { tag, attrs: {}, events: {}, children: [] };
    for (const a of Array.from(node.attributes)) {
      const lname = a.name.toLowerCase();
      if (lname.indexOf('hint-') === 0) continue;
      if (EVENTS[lname]) {
        let ev = EVENTS[lname];
        if (lname === 'onchange' && (tag === 'input' || tag === 'textarea')) ev = 'input';
        v.events[ev] = resolve(a.value, scope);
        continue;
      }
      const val = resolve(a.value, scope);
      if (val === false || val == null) continue;
      v.attrs[a.name] = val === true ? '' : String(val);
    }
    const src = tag === 'template' ? node.content : node;
    buildChildren(src, scope, v.children);
    out.push(v);
  }

  function buildChildren(node, scope, out) {
    for (const c of Array.from(node.childNodes)) build(c, scope, out);
    return out;
  }

  /* ---------- Nodos virtuales → DOM (con actualización mínima) ---------- */
  function sameKind(dom, v) {
    if (!dom) return false;
    if (v.text !== undefined) return dom.nodeType === 3;
    if (v.component) return dom.nodeType === 1 && dom.__dcName === v.component;
    return dom.nodeType === 1 && !dom.__dcName && dom.tagName.toLowerCase() === v.tag;
  }

  function create(v, parent) {
    if (v.text !== undefined) return document.createTextNode(v.text);
    if (v.component) {
      const host = document.createElement('div');
      host.style.display = 'contents';
      host.__dcName = v.component;
      host.__dcInst = new Instance(v.component, v.props, host);
      return host;
    }
    const SVG = 'http://www.w3.org/2000/svg';
    const inSvg = v.tag === 'svg' || (parent && parent.namespaceURI === SVG);
    const el = inSvg ? document.createElementNS(SVG, v.tag) : document.createElement(v.tag);
    update(el, v);
    return el;
  }

  function update(el, v) {
    if (v.text !== undefined) {
      if (el.nodeValue !== v.text) el.nodeValue = v.text;
      return;
    }
    if (v.component) {
      el.__dcInst.setProps(v.props);
      return;
    }
    // atributos
    for (const a of Array.from(el.attributes)) {
      if (!(a.name in v.attrs)) el.removeAttribute(a.name);
    }
    for (const k in v.attrs) {
      if (el.getAttribute(k) !== v.attrs[k]) el.setAttribute(k, v.attrs[k]);
    }
    if ((v.tag === 'input' || v.tag === 'textarea') && 'value' in v.attrs && el.value !== v.attrs.value) {
      el.value = v.attrs.value;
    }
    // eventos
    el.__dcEvents = el.__dcEvents || {};
    for (const ev in v.events) {
      if (!(ev in el.__dcEvents)) {
        el.addEventListener(ev, (e) => {
          const fn = el.__dcEvents[ev];
          if (ev === 'submit') e.preventDefault();
          if (typeof fn === 'function') fn(e);
        });
      }
      el.__dcEvents[ev] = v.events[ev];
    }
    for (const ev in el.__dcEvents) if (!(ev in v.events)) el.__dcEvents[ev] = null;
    patchChildren(el, v.children);
    // Casillas: la marca sigue al atributo checked de la plantilla
    if (v.tag === 'input' && (el.type === 'checkbox' || el.type === 'radio')) el.checked = 'checked' in v.attrs;
    // Desplegables: la opción elegida sigue al atributo value de la plantilla
    if (v.tag === 'select' && 'value' in v.attrs && el.value !== v.attrs.value) el.value = v.attrs.value;
  }

  function patchChildren(parent, vlist) {
    const doms = Array.from(parent.childNodes);
    vlist.forEach((v, i) => {
      const d = doms[i];
      if (sameKind(d, v)) {
        update(d, v);
      } else {
        const n = create(v, parent);
        if (d) { destroy(d); parent.replaceChild(n, d); } else parent.appendChild(n);
        if (n.__dcInst) n.__dcInst.mount();
      }
    });
    for (let i = vlist.length; i < doms.length; i++) { destroy(doms[i]); parent.removeChild(doms[i]); }
  }

  function destroy(dom) {
    if (dom.nodeType !== 1) return;
    if (dom.__dcInst) dom.__dcInst.unmount();
    dom.querySelectorAll('*').forEach((c) => { if (c.__dcInst) c.__dcInst.unmount(); });
  }

  /* ---------- Instancia de componente ---------- */
  class Instance {
    constructor(name, props, host) {
      this.name = name;
      this.host = host;
      const Cls = classes[name] || class extends DCLogic { renderVals() { return {}; } };
      this.logic = new Cls(props || {});
      this.logic.props = props || {};
      this.logic.__instance = this;
      this.pending = false;
      this.render();
    }
    setProps(props) {
      this.logic.props = props;
      this.render();
    }
    schedule() {
      if (this.pending) return;
      this.pending = true;
      Promise.resolve().then(() => { this.pending = false; this.render(); });
    }
    render() {
      const tpl = templates[this.name];
      if (!tpl) return;
      const vals = this.logic.renderVals ? this.logic.renderVals() : {};
      patchChildren(this.host, buildChildren(tpl.content, vals, []));
    }
    mount() {
      if (this.logic.componentDidMount) this.logic.componentDidMount();
    }
    unmount() {
      if (this.logic.componentWillUnmount) this.logic.componentWillUnmount();
    }
  }

  /* ---------- Arranque ---------- */
  function start() {
    document.querySelectorAll('template[data-dc-component]').forEach((t) => {
      templates[t.getAttribute('data-dc-component')] = t;
    });
    document.querySelectorAll('script[type="text/x-dc"][data-dc-logic]').forEach((s) => {
      classes[s.getAttribute('data-dc-logic')] = compileLogic(s.textContent);
    });
    const root = document.getElementById('dc-app');
    const inst = new Instance('__root', {}, root);
    inst.mount();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
