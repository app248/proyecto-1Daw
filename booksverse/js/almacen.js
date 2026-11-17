/*
 * almacen.js — Guarda TUS datos en el navegador con localStorage.
 *
 * Todo lo que haces en ByBook (estados de lectura, favoritos, notas, reseñas,
 * progreso, a quién sigues…) se guarda como un único objeto JSON con la clave
 * "bybook-v1". Así los datos siguen ahí al recargar la página.
 *
 * Limitación del prototipo: solo se guarda en ESTE navegador y ESTE ordenador.
 * En el proyecto definitivo esto se guardaría en una base de datos del servidor.
 */
(function () {
  'use strict';

  const CLAVE = 'bybook-v1';
  const ESTADOS = { quiero: 'Quiero leer', leyendo: 'Leyendo', leido: 'Leído' };

  function vacio() {
    return {
      cuenta: null,          // { nombre, email } — cuenta de demostración (nunca guardamos la contraseña)
      biblioteca: {},        // { idObra: { estado, favorito, nota, progreso, resena, fechaResena, actualizado } }
      seguimientos: {},      // { usuario: 'siguiendo' | 'pendiente' }
      recomendaciones: [],   // recomendaciones que has enviado (simuladas)
      reto: 12,              // objetivo de lectura del año
      publico: true,         // privacidad del perfil (demostración)
      avisoVisto: false,     // aviso sobre el almacenamiento local
      bingo: [false, false, false, false, false, false, false, false, false]
    };
  }

  // Lee los datos guardados (si no hay o están dañados, empieza de cero)
  function leer() {
    try {
      const texto = localStorage.getItem(CLAVE);
      return texto ? Object.assign(vacio(), JSON.parse(texto)) : vacio();
    } catch (e) {
      return vacio();
    }
  }

  let datos = leer();

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch (e) { /* navegador sin almacenamiento: los cambios duran hasta recargar */ }
  }

  function hoy() { return new Date().toISOString().slice(0, 10); }

  // Devuelve la entrada de una obra en tu biblioteca (o una vacía si no está)
  function entrada(id) {
    return datos.biblioteca[id] || { estado: null, favorito: false, nota: 0, progreso: 0, resena: '', fechaResena: null, actualizado: null };
  }

  // Cambia algunos campos de una obra y guarda. Si la obra se queda "vacía", se borra.
  function cambiar(id, cambios) {
    const nueva = Object.assign({}, entrada(id), cambios, { actualizado: new Date().toISOString() });
    if (!nueva.estado && !nueva.favorito && !nueva.nota && !nueva.resena) delete datos.biblioteca[id];
    else datos.biblioteca[id] = nueva;
    guardar();
  }

  const Almacen = {
    ESTADOS,
    entrada,

    // ----- Estado de lectura (independiente del favorito, la nota y la reseña) -----
    ponerEstado(id, estado) {
      const obra = window.ByBookDatos.obra(id);
      const actual = entrada(id);
      const cambios = { estado: actual.estado === estado ? null : estado };
      // Al marcarlo como leído, el progreso llega al final
      if (cambios.estado === 'leido' && obra && obra.total) cambios.progreso = obra.total;
      if (cambios.estado === 'quiero') cambios.progreso = 0;
      cambiar(id, cambios);
    },
    alternarFavorito(id) { cambiar(id, { favorito: !entrada(id).favorito }); },
    ponerNota(id, nota) { cambiar(id, { nota: entrada(id).nota === nota ? 0 : nota }); },
    ponerProgreso(id, valor) {
      const obra = window.ByBookDatos.obra(id);
      let n = Math.max(0, parseInt(valor, 10) || 0);
      if (obra && obra.total) n = Math.min(n, obra.total);
      const cambios = { progreso: n };
      if (!entrada(id).estado) cambios.estado = 'leyendo';
      cambiar(id, cambios);
    },

    // ----- Reseñas -----
    guardarResena(id, texto) { cambiar(id, { resena: texto.trim(), fechaResena: hoy() }); },
    borrarResena(id) { cambiar(id, { resena: '', fechaResena: null }); },

    // ----- Consultas -----
    // Todas tus obras con sus datos, de la más reciente a la más antigua
    misObras() {
      return Object.keys(datos.biblioteca)
        .filter((id) => window.ByBookDatos.obra(id))
        .map((id) => Object.assign({ obra: window.ByBookDatos.obra(id), id }, datos.biblioteca[id]))
        .sort((a, b) => (b.actualizado || '').localeCompare(a.actualizado || ''));
    },
    misResenas() { return this.misObras().filter((e) => e.resena); },

    // Progreso de una saga calculado con los estados de tu biblioteca
    progresoSaga(sagaId) {
      const saga = window.ByBookDatos.SAGAS[sagaId];
      const leidos = saga.obras.filter((id) => entrada(id).estado === 'leido').length;
      const siguiente = saga.obras.find((id) => entrada(id).estado !== 'leido') || null;
      return { leidos, total: saga.obras.length, porcentaje: Math.round(leidos / saga.obras.length * 100), siguiente };
    },

    // ----- Seguir a lectores -----
    seguimiento(usuario) { return datos.seguimientos[usuario] || null; },
    alternarSeguir(usuario) {
      const lector = window.ByBookDatos.lector(usuario);
      if (datos.seguimientos[usuario]) delete datos.seguimientos[usuario];
      // Perfil público: se sigue al momento. Perfil privado: queda como solicitud pendiente.
      else datos.seguimientos[usuario] = lector && lector.publico ? 'siguiendo' : 'pendiente';
      guardar();
    },

    // ----- Cuenta de demostración (no hay servidor: solo recordamos nombre y correo) -----
    cuenta() { return datos.cuenta; },
    iniciarSesion(nombre, email) { datos.cuenta = { nombre, email }; guardar(); },
    cerrarSesion() { datos.cuenta = null; guardar(); },
    nombre() { return datos.cuenta ? datos.cuenta.nombre : 'Invitado'; },

    // ----- Otras preferencias -----
    reto() { return datos.reto; },
    ponerReto(n) { datos.reto = Math.max(1, n); guardar(); },
    esPublico() { return datos.publico; },
    alternarPublico() { datos.publico = !datos.publico; guardar(); },
    avisoVisto() { return datos.avisoVisto; },
    marcarAvisoVisto() { datos.avisoVisto = true; guardar(); },
    bingo() { return datos.bingo.slice(); },
    ponerBingo(lista) { datos.bingo = lista; guardar(); },
    enviarRecomendacion(obraId, usuario) { datos.recomendaciones.push({ obra: obraId, para: usuario, fecha: hoy() }); guardar(); },

    // Borra todos tus datos de prueba
    borrarTodo() { datos = vacio(); guardar(); }
  };

  window.ByBookAlmacen = Almacen;
})();
