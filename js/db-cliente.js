/* IndexedDB del cliente: su perfil y su historial local. */
(function (global) {
  'use strict';

  const NOMBRE = 'fidelidad-cliente';
  const VERSION = 1;
  let promesaDB = null;
  let cachePerfil = null;

  function abrir() {
    if (!global.idb || !global.idb.openDB) {
      return Promise.reject(new Error('No se cargó idb. Comprueba js/vendor/idb.umd.js'));
    }
    if (!promesaDB) {
      promesaDB = global.idb.openDB(NOMBRE, VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('perfil')) {
            db.createObjectStore('perfil', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('historial')) {
            const historial = db.createObjectStore('historial', { keyPath: 'id', autoIncrement: true });
            historial.createIndex('ts', 'ts');
          }
        }
      });
    }
    return promesaDB;
  }

  function perfilNuevo() {
    return {
      id: 1,
      token: Util.randomToken(),
      nombre: '',
      apellidos: '',
      cumpleanos: '',
      negocio_nombre: '',
      premio: '',
      sellos_para_premio: 0,
      racha_actual: 0,
      racha_maxima: 0,
      sellos_totales: 0,
      sellos_ciclo: 0,
      premios_reclamados: 0,
      ultimo_premio: null,
      ultimo_sello: null,
      ultimo_periodo: null,
      frecuencia: 'diario',
      negocio_id: '',
      created_at: Date.now()
    };
  }

  async function getPerfil() {
    const db = await abrir();
    let perfil = await db.get('perfil', 1);
    if (!perfil) {
      perfil = perfilNuevo();
      await db.put('perfil', perfil);
    } else {
      // Migración de perfiles creados antes del QR del sello diario.
      let cambiado = false;
      if (perfil.apellidos === undefined) { perfil.apellidos = ''; cambiado = true; }
      if (perfil.cumpleanos === undefined) { perfil.cumpleanos = ''; cambiado = true; }
      if (!perfil.frecuencia) { perfil.frecuencia = 'diario'; cambiado = true; }
      if (!perfil.ultimo_periodo && perfil.ultimo_sello) {
        perfil.ultimo_periodo = perfil.ultimo_sello;
        cambiado = true;
      }
      // Migración para el QR de reclamar premio: el ciclo arranca donde iba la tarjeta.
      if (perfil.sellos_ciclo === undefined) {
        const total = Number(perfil.sellos_totales) || 0;
        const cada = Number(perfil.sellos_para_premio) || 0;
        perfil.sellos_ciclo = cada > 0 && total >= cada ? cada : total;
        cambiado = true;
      }
      if (perfil.premios_reclamados === undefined) { perfil.premios_reclamados = 0; cambiado = true; }
      if (perfil.ultimo_premio === undefined) { perfil.ultimo_premio = null; cambiado = true; }
      if (cambiado) await db.put('perfil', perfil);
    }
    cachePerfil = perfil;
    return perfil;
  }

  async function guardarPerfil(perfil) {
    const db = await abrir();
    const copia = Object.assign({}, perfil, { id: 1 });
    await db.put('perfil', copia);
    cachePerfil = copia;
    return copia;
  }

  async function addHistorial(tipo, racha, extra) {
    const db = await abrir();
    const entrada = Object.assign({
      ts: Date.now(),
      tipo: tipo || 'sello',
      racha_actual: Number(racha) || 0
    }, extra || {});
    return db.add('historial', entrada);
  }

  async function listarHistorial() {
    const db = await abrir();
    const todo = await db.getAll('historial');
    return todo.sort(function (a, b) { return b.id - a.id; });
  }

  async function exportar() {
    const db = await abrir();
    return {
      formato: 'fidelidad-cliente',
      version: 1,
      exportado_at: Date.now(),
      datos: {
        perfil: await db.get('perfil', 1),
        historial: await db.getAll('historial')
      }
    };
  }

  async function importar(payload) {
    if (!payload || payload.formato !== 'fidelidad-cliente' || !payload.datos) {
      throw new Error('Ese archivo no es una copia de Mi Tarjeta.');
    }
    const perfil = payload.datos.perfil;
    if (!perfil || !Util.esToken(perfil.token)) {
      throw new Error('La copia no contiene un token válido.');
    }
    const db = await abrir();
    const tx = db.transaction(['perfil', 'historial'], 'readwrite');
    await tx.objectStore('perfil').put(Object.assign({}, perfil, { id: 1 }));
    await tx.objectStore('historial').clear();
    const historial = Array.isArray(payload.datos.historial) ? payload.datos.historial : [];
    for (const entrada of historial) {
      await tx.objectStore('historial').add(entrada);
    }
    await tx.done;
    cachePerfil = null;
    return getPerfil();
  }

  async function borrarTodo() {
    const db = await abrir();
    const tx = db.transaction(['perfil', 'historial'], 'readwrite');
    await tx.objectStore('perfil').clear();
    await tx.objectStore('historial').clear();
    await tx.done;
    cachePerfil = null;
  }

  global.DBCliente = {
    abrir: abrir,
    getPerfil: getPerfil,
    guardarPerfil: guardarPerfil,
    addHistorial: addHistorial,
    listarHistorial: listarHistorial,
    exportar: exportar,
    importar: importar,
    borrarTodo: borrarTodo
  };
})(window);
