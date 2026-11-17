/*
 * componentes.js — Piezas compartidas por todas las páginas de ByBook.
 *
 *  1. ByBook: funciones de ayuda (enlaces, fechas, estrellas, datos listos para pintar).
 *  2. Componentes: Nav (cabecera), Pie (pie de página y aviso de datos) y Portada.
 *     Antes la cabecera y el pie estaban copiados en las 11 páginas; ahora están solo aquí.
 *  3. Accesibilidad con teclado: diálogos (Escape y foco) y pestañas (flechas).
 *
 * Orden de carga en cada página: dc.js → datos.js → almacen.js → componentes.js
 */
(function () {
  'use strict';

  const D = window.ByBookDatos;
  const A = window.ByBookAlmacen;

  /* =========================================================
     1. Funciones de ayuda
     ========================================================= */
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

  const ByBook = {
    // Lee un parámetro de la dirección: libro.html?id=dune → parametro('id') = 'dune'
    parametro(nombre) { return new URLSearchParams(window.location.search).get(nombre); },

    urlObra(id) { return 'libro.html?id=' + encodeURIComponent(id); },
    urlPerfil(usuario) { return 'perfil.html?u=' + encodeURIComponent(usuario); },
    urlAutor(id) { return 'autores.html?id=' + encodeURIComponent(id); },
    urlSaga(id) { return 'sagas.html?id=' + encodeURIComponent(id); },

    // '2026-11-10' → '10 nov 2026'
    fecha(iso) {
      if (!iso) return '';
      const p = iso.slice(0, 10).split('-');
      return parseInt(p[2], 10) + ' ' + MESES[parseInt(p[1], 10) - 1] + ' ' + p[0];
    },

    // 4 → '★★★★☆'
    estrellas(n) { return n ? '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n) : ''; },
    textoNota(n) { return n ? n + ' de 5 estrellas' : 'Sin puntuar'; },

    // Nota media: lectores de ejemplo + la tuya
    media(obraId) {
      const notas = D.resenasDeEjemplo(obraId).map((r) => r.nota).filter(Boolean);
      const mia = A.entrada(obraId).nota;
      if (mia) notas.push(mia);
      if (!notas.length) return null;
      return (notas.reduce((s, n) => s + n, 0) / notas.length).toFixed(1).replace('.', ',');
    },

    // Prepara una obra con todo lo que necesitan las plantillas
    vistaObra(obra) {
      const f = D.FORMATOS[obra.formato];
      const autor = D.autor(obra.autor);
      const mia = A.entrada(obra.id);
      const saga = obra.saga ? D.SAGAS[obra.saga] : null;
      return Object.assign({}, obra, {
        url: ByBook.urlObra(obra.id),
        formatoNombre: f.nombre,
        unidades: f.unidades,
        autorNombre: autor.nombre,
        autorUrl: ByBook.urlAutor(obra.autor),
        inicial: obra.titulo.replace(/^(El|La|Los|Las) /, '').charAt(0),
        sagaNombre: saga ? saga.nombre : '',
        volumenTexto: obra.volumen ? 'Vol. ' + obra.volumen : '',
        media: ByBook.media(obra.id),
        miEstado: mia.estado,
        miEstadoTexto: mia.estado ? A.ESTADOS[mia.estado] : '',
        miFavorito: mia.favorito,
        etiquetaAccesible: obra.titulo + ', ' + f.nombre.toLowerCase() + ' de ' + autor.nombre
      });
    },

    /* ----- Diálogos: abrir, cerrar y devolver el foco ----- */
    abrirDialogo(accion) {
      ByBook._origen = document.activeElement;
      accion();
      // Esperamos a que se pinte el diálogo y movemos el foco dentro
      setTimeout(() => {
        const d = document.querySelector('[role="dialog"][aria-modal="true"]');
        if (!d) return;
        const primero = d.querySelector('[data-foco]') || d.querySelector(ENFOCABLES);
        (primero || d).focus();
      }, 30);
    },
    cerrarDialogo(accion) {
      accion();
      setTimeout(() => { if (ByBook._origen && document.body.contains(ByBook._origen)) ByBook._origen.focus(); }, 30);
    }
  };
  window.ByBook = ByBook;

  const ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

  /* =========================================================
     2. Componentes compartidos
     ========================================================= */

  /* ----- Portada tipográfica (no hay imágenes reales de las obras) ----- */
  DC.registrar('Portada', `
<span class="portada estilo-{{o.estilo}} tono-{{o.tono}} portada--{{tam}}" aria-hidden="true">
<span class="portada-letra">{{o.inicial}}</span>
<span class="portada-formato">{{o.formatoNombre}}</span>
<span class="portada-titulo">{{o.titulo}}</span>
<span class="portada-autor">{{o.autorNombre}}</span>
<sc-if value="{{o.volumen}}"><span class="portada-vol">{{o.volumen}}</span></sc-if>
</span>`, class extends DCLogic {
    renderVals() { return { o: this.props.obra || {}, tam: this.props.tam || 'm' }; }
  });

  /* ----- Cabecera ----- */
  DC.registrar('Nav', `
<a class="saltar" href="#contenido">Saltar al contenido</a>
<header class="cabecera">
<div class="contenedor cabecera-fila">
<a href="index.html" class="logo" aria-label="ByBook, ir al inicio">
<img src="img/logo.svg" alt="" width="52" height="30">
<span class="logo-texto">By<span>Book</span></span>
</a>
<nav class="menu" id="menu-principal" aria-label="Principal" data-abierto="{{menuAbierto}}">
<sc-for list="{{enlaces}}" as="l"><a href="{{l.href}}" class="menu-enlace" aria-current="{{l.actual}}">{{l.nombre}}</a></sc-for>
<a href="{{cuentaUrl}}" class="menu-enlace solo-movil">{{cuentaTexto}}</a>
</nav>
<div class="acciones">
<button type="button" class="boton-icono" onClick="{{alternarBusqueda}}" aria-label="Buscar" aria-expanded="{{busquedaAbierta}}" aria-controls="panel-busqueda"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg></button>
<a href="biblioteca.html" class="menu-enlace menu-enlace--diario" aria-label="Mi diario" aria-current="{{diarioActual}}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"></path><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"></path></svg><span class="ocultar-movil" aria-hidden="true">Mi diario</span></a>
<a href="{{cuentaUrl}}" class="boton boton--principal boton--pequeno ocultar-movil">{{cuentaTexto}}</a>
<button type="button" class="boton-icono boton-menu" onClick="{{alternarMenu}}" aria-label="{{menuEtiqueta}}" aria-expanded="{{menuAbierto}}" aria-controls="menu-principal">
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="{{menuIcono}}"></path></svg>
</button>
</div>
</div>
<sc-if value="{{busqueda}}">
<div class="panel-busqueda" id="panel-busqueda">
<form class="contenedor" role="search" action="explorar.html" method="get">
<label for="buscar-global">Buscar en el catálogo</label>
<div class="entrada-grupo">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
<input id="buscar-global" name="q" type="search" placeholder="Título o autor: Dune, One Piece, Tolkien…" autocomplete="off">
<button type="submit" class="boton boton--principal">Buscar</button>
</div>
</form>
</div>
</sc-if>
</header>`, class extends DCLogic {
    constructor(props) { super(props); this.state = { menu: false, busqueda: false }; }
    renderVals() {
      const st = this.state;
      const activo = this.props.active || '';
      const lista = [['catalogo', 'Catálogo', 'explorar.html'], ['sagas', 'Sagas', 'sagas.html'], ['autores', 'Autores', 'autores.html'], ['lectores', 'Lectores', 'lectores.html'], ['comunidad', 'Comunidad', 'comunidad.html']];
      const cuenta = A.cuenta();
      return {
        enlaces: lista.map((e) => ({ nombre: e[1], href: e[2], actual: activo === e[0] ? 'page' : 'false' })),
        diarioActual: activo === 'biblioteca' ? 'page' : 'false',
        cuentaUrl: cuenta ? 'perfil.html?u=yo' : 'acceso.html',
        cuentaTexto: cuenta ? 'Mi perfil' : 'Entrar',
        menuAbierto: st.menu ? 'true' : 'false',
        menuEtiqueta: st.menu ? 'Cerrar menú' : 'Abrir menú',
        menuIcono: st.menu ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16',
        busqueda: st.busqueda,
        busquedaAbierta: st.busqueda ? 'true' : 'false',
        alternarMenu: () => this.setState({ menu: !st.menu }),
        alternarBusqueda: () => {
          this.setState({ busqueda: !st.busqueda });
          setTimeout(() => { const c = document.getElementById('buscar-global'); if (c) c.focus(); }, 40);
        }
      };
    }
  });

  /* ----- Pie de página + aviso sobre los datos ----- */
  DC.registrar('Pie', `
<footer class="pie">
<div class="contenedor">
<div class="pie-superior">
<div class="pie-marca">
<a href="index.html" class="logo" aria-label="ByBook, ir al inicio"><img src="img/logo.svg" alt="" width="52" height="30"><span class="logo-texto">By<span>Book</span></span></a>
<p>Diario de lectura para libros, cómics, manga, manhwa y webtoons.</p>
</div>
<div class="pie-columnas">
<div class="pie-columna"><h2>Explora</h2><a href="explorar.html">Catálogo</a><a href="sagas.html">Sagas</a><a href="autores.html">Autores</a><a href="lectores.html">Lectores</a><a href="comunidad.html">Comunidad</a></div>
<div class="pie-columna"><h2>Tu diario</h2><a href="biblioteca.html">Mi biblioteca</a><a href="perfil.html?u=yo">Mi perfil</a><a href="acceso.html">Entrar</a><a href="acceso.html?modo=registro">Crear cuenta</a></div>
<div class="pie-columna"><h2>Esta versión</h2><span>Prototipo académico. Los lectores y su actividad son de ejemplo.</span><span>Tus lecturas se guardan solo en este navegador.</span><a href="paleta.html">Guía de estilo</a><button type="button" class="pie-boton" onClick="{{borrar}}">Borrar mis datos de prueba</button></div>
</div>
</div>
<div class="pie-inferior"><span>© 2026 ByBook · Proyecto intermodular · 1.º DAW</span><span>ByBook no vende libros: los enlaces de compra llevan a tiendas externas.</span></div>
</div>
</footer>
<sc-if value="{{mostrarAviso}}">
<div class="aviso-datos" role="region" aria-label="Aviso sobre tus datos">
<p><b>Así guardamos tus datos:</b> tus lecturas, notas y reseñas se guardan solo en este navegador (localStorage). No hay servidor ni cookies de seguimiento.</p>
<button type="button" class="boton boton--claro boton--pequeno" onClick="{{entendido}}">Entendido</button>
</div>
</sc-if>`, class extends DCLogic {
    renderVals() {
      return {
        mostrarAviso: !A.avisoVisto(),
        entendido: () => { A.marcarAvisoVisto(); this.forceUpdate(); },
        borrar: () => {
          if (window.confirm('¿Borrar todas tus lecturas, notas y reseñas de prueba? No se puede deshacer.')) { A.borrarTodo(); window.location.reload(); }
        }
      };
    }
  });

  /* =========================================================
     3. Teclado: diálogos y pestañas
     ========================================================= */
  document.addEventListener('keydown', (e) => {
    // --- Diálogo abierto: Escape cierra y Tab no sale del diálogo ---
    const dialogo = document.querySelector('[role="dialog"][aria-modal="true"]');
    if (dialogo) {
      if (e.key === 'Escape') {
        const cerrar = dialogo.querySelector('[data-cerrar]');
        if (cerrar) { e.preventDefault(); cerrar.click(); }
        return;
      }
      if (e.key === 'Tab') {
        const lista = Array.from(dialogo.querySelectorAll(ENFOCABLES));
        if (!lista.length) return;
        const primero = lista[0], ultimo = lista[lista.length - 1];
        if (e.shiftKey && (document.activeElement === primero || !dialogo.contains(document.activeElement))) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && (document.activeElement === ultimo || !dialogo.contains(document.activeElement))) { e.preventDefault(); primero.focus(); }
      }
    }

    // --- Pestañas: flechas izquierda/derecha, Inicio y Fin ---
    const pestana = e.target.closest && e.target.closest('[role="tab"]');
    if (pestana && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      const grupo = Array.from(pestana.closest('[role="tablist"]').querySelectorAll('[role="tab"]'));
      let i = grupo.indexOf(pestana);
      if (e.key === 'ArrowRight') i = (i + 1) % grupo.length;
      if (e.key === 'ArrowLeft') i = (i - 1 + grupo.length) % grupo.length;
      if (e.key === 'Home') i = 0;
      if (e.key === 'End') i = grupo.length - 1;
      e.preventDefault();
      grupo[i].click();
      setTimeout(() => grupo[i].focus(), 20);
    }
  });
})();
