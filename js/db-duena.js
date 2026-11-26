/* IndexedDB de la dueña: FUENTE DE VERDAD del negocio. */
(function (global) {
  'use strict';

  const NOMBRE = 'fidelidad-duena-v2';
  const LEGADO = 'fidelidad-duena';
  const VERSION = 1;
  const CLAVE_MIGRACION = 'fidelidad_duena_v2_migrado';
  let promesaDB = null;
  let migracionLegacy = null;

  function abrir() {
    if (!global.idb || !global.idb.openDB) {
      return Promise.reject(new Error('No se cargó idb. Comprueba js/vendor/idb.umd.js'));
    }
    if (!promesaDB) {
      promesaDB = global.idb.openDB(NOMBRE, VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('config')) {
            db.createObjectStore('config', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('clientes')) {
            db.createObjectStore('clientes', { keyPath: 'token' });
          }
          if (!db.objectStoreNames.contains('sellos')) {
            const sellos = db.createObjectStore('sellos', { keyPath: 'id', autoIncrement: true });
            sellos.createIndex('token', 'token');
          }
        }
      });
    }
    return promesaDB;
  }

  // Migración única desde el nombre anterior. Si la base antigua está bloqueada,
  // se salta con un timeout para que la app nunca se quede en blanco.
  async function migrarLegacy() {
    if (migracionLegacy) return migracionLegacy;
    migracionLegacy = (async function () {
      try {
        let yaMigrado = false;
        try { yaMigrado = localStorage.getItem(CLAVE_MIGRACION) === '1'; } catch (e) { /* sin storage */ }
        if (yaMigrado || !global.idb || !global.idb.openDB) return;

        const antigua = await Promise.race([
          global.idb.openDB(LEGADO, 1),
          new Promise(function (_, rechazar) { setTimeout(function () { rechazar(new Error('base antigua no disponible')); }, 1500); })
        ]);
        const config = await antigua.get('config', 1);
        const clientes = await antigua.getAll('clientes');
        const sellos = await antigua.getAll('sellos');
        antigua.close();

        if (config || clientes.length || sellos.length) {
          const db = await abrir();
          const tx = db.transaction(['config', 'clientes', 'sellos'], 'readwrite');
          await tx.objectStore('config').clear();
          await tx.objectStore('clientes').clear();
          await tx.objectStore('sellos').clear();
          if (config) await tx.objectStore('config').put(Object.assign({}, config, { id: 1 }));
          for (const cliente of clientes) await tx.objectStore('clientes').put(cliente);
          for (const sello of sellos) {
            const copia = Object.assign({}, sello);
            delete copia.id;
            await tx.objectStore('sellos').add(copia);
          }
          await tx.done;
        }
      } catch (e) { /* la base antigua puede estar bloqueada: no importa */ }
      try { localStorage.setItem(CLAVE_MIGRACION, '1'); } catch (e) { /* sin storage */ }
    })();
    return migracionLegacy;
  }

  async function getConfig() {
    const db = await abrir();
    return (await db.get('config', 1)) || null;
  }

  async function guardarConfig(datos) {
    const db = await abrir();
    const actual = await db.get('config', 1);
    const config = {
      id: 1,
      nombre_negocio: String(datos.nombre_negocio || '').trim(),
      premio: String(datos.premio || '').trim(),
      sellos_para_premio: Math.max(1, Math.min(100, Number(datos.sellos_para_premio) || 10)),
      pin: String(datos.pin || ''),
      negocio_id: datos.negocio_id || (actual && actual.negocio_id) || Util.randomToken().slice(0, 16),
      frecuencia: datos.frecuencia === 'semanal' ? 'semanal' : 'diario',
      created_at: actual ? actual.created_at : Date.now(),
      updated_at: Date.now(),
      last_backup_at: actual ? actual.last_backup_at || null : null
    };
    await db.put('config', config);
    return config;
  }

  // Configuraciones creadas antes del QR fijo no tenían id de negocio.
  async function asegurarNegocioId() {
    const db = await abrir();
    const config = await db.get('config', 1);
    if (config && !config.negocio_id) {
      config.negocio_id = Util.randomToken().slice(0, 16);
      await db.put('config', config);
    }
    return config;
  }

  async function marcarBackup() {
    const db = await abrir();
    const config = await db.get('config', 1);
    if (config) {
      config.last_backup_at = Date.now();
      await db.put('config', config);
    }
  }

  /*
   * REGLA DE ORO: aquí solo entra el token. El estado lo calcula este móvil.
   * Fechas en hora local (no UTC) para que el cambio de día cuadre con el local.
   */
  async function validarSello(token, nombre) {
    if (!Util.esToken(token)) {
      return { ok: false, error: 'El QR no trae un token válido.' };
    }
    const config = await getConfig();
    if (!config) {
      return { ok: false, error: 'Configura el negocio antes de sellar.' };
    }

    const db = await abrir();
    const frecuencia = config.frecuencia === 'semanal' ? 'semanal' : 'diario';
    const periodo = Util.claveActual(frecuencia);
    const periodoAnterior = Util.claveAnterior(periodo, frecuencia);
    let cliente = await db.get('clientes', token);

    if (!cliente) {
      cliente = {
        token: token,
        nombre: String(nombre || 'Cliente').trim().slice(0, 60),
        racha_actual: 0,
        racha_maxima: 0,
        sellos_totales: 0,
        sellos_ciclo: 0,
        premios_reclamados: 0,
        ultimo_premio: null,
        ultimo_sello: null,
        created_at: Date.now(),
        notas: ''
      };
    } else if (nombre && cliente.nombre !== String(nombre).trim()) {
      cliente.nombre = String(nombre).trim().slice(0, 60);
    }
    if (cliente.sellos_ciclo === undefined) {
      cliente.sellos_ciclo = Number(cliente.sellos_totales) || 0;
    }
    if (cliente.premios_reclamados === undefined) cliente.premios_reclamados = 0;
    if (cliente.ultimo_premio === undefined) cliente.ultimo_premio = null;

    const ultimoPeriodo = cliente.ultimo_periodo || cliente.ultimo_sello;
    if (ultimoPeriodo === periodo) {
      return {
        ok: false,
        error: cliente.nombre + ' ya selló ' + (frecuencia === 'diario' ? 'hoy. Vuelve mañana.' : 'esta semana. Vuelve la semana que viene.')
      };
    }

    cliente.racha_actual = ultimoPeriodo === periodoAnterior ? Number(cliente.racha_actual || 0) + 1 : 1;
    cliente.racha_maxima = Math.max(Number(cliente.racha_maxima || 0), cliente.racha_actual);
    cliente.sellos_totales = Number(cliente.sellos_totales || 0) + 1;
    cliente.sellos_ciclo = Number(cliente.sellos_ciclo || 0) + 1;
    cliente.ultimo_sello = Util.fechaLocal();
    cliente.ultimo_periodo = periodo;

    await db.put('clientes', cliente);
    await db.add('sellos', { token: token, nombre: cliente.nombre, ts: Date.now() });

    return {
      ok: true,
      cliente: cliente,
      premio: cliente.sellos_ciclo % config.sellos_para_premio === 0,
      premio_texto: config.premio,
      negocio: config.nombre_negocio,
      sellos_para_premio: config.sellos_para_premio
    };
  }

  async function listarClientes() {
    const db = await abrir();
    const todos = await db.getAll('clientes');
    return todos.sort(function (a, b) {
      return String(a.nombre).localeCompare(String(b.nombre), 'es');
    });
  }

  async function getCliente(token) {
    const db = await abrir();
    return db.get('clientes', token);
  }

  async function guardarCliente(cliente) {
    const db = await abrir();
    await db.put('clientes', cliente);
    return cliente;
  }

  // Recuperar la tarjeta en un móvil nuevo: se cambia el token y se lleva el log.
  async function cambiarToken(anterior, nuevo) {
    if (!Util.esToken(nuevo)) throw new Error('Token nuevo no válido.');
    const db = await abrir();
    const cliente = await db.get('clientes', anterior);
    if (!cliente) throw new Error('No existe ese cliente.');
    if (await db.get('clientes', nuevo)) throw new Error('Ese token ya está en uso.');

    const tx = db.transaction(['clientes', 'sellos'], 'readwrite');
    const actualizado = Object.assign({}, cliente, { token: nuevo });
    await tx.objectStore('clientes').put(actualizado);
    await tx.objectStore('clientes').delete(anterior);
    const sellos = await tx.objectStore('sellos').index('token').getAll(anterior);
    for (const sello of sellos) {
      await tx.objectStore('sellos').delete(sello.id);
      await tx.objectStore('sellos').add(Object.assign({}, sello, { token: nuevo }));
    }
    await tx.done;
    return actualizado;
  }

  async function listarSellos(limite) {
    const db = await abrir();
    const todos = await db.getAll('sellos');
    todos.sort(function (a, b) { return b.ts - a.ts; });
    return limite ? todos.slice(0, limite) : todos;
  }

  async function exportarTodo() {
    const db = await abrir();
    return {
      formato: 'fidelidad-duena',
      version: 1,
      exportado_at: Date.now(),
      datos: {
        config: await db.get('config', 1),
        clientes: await db.getAll('clientes'),
        sellos: await db.getAll('sellos')
      }
    };
  }

  async function importarTodo(payload) {
    if (!payload || payload.formato !== 'fidelidad-duena' || !payload.datos) {
      throw new Error('Ese archivo no es una copia de Fidelidad Dueña.');
    }
    const datos = payload.datos;
    if (!datos.config || !Array.isArray(datos.clientes) || !Array.isArray(datos.sellos)) {
      throw new Error('La copia está incompleta.');
    }
    for (const cliente of datos.clientes) {
      if (!Util.esToken(cliente.token)) throw new Error('La copia contiene un token no válido.');
    }
    const db = await abrir();
    const tx = db.transaction(['config', 'clientes', 'sellos'], 'readwrite');
    await tx.objectStore('config').clear();
    await tx.objectStore('clientes').clear();
    await tx.objectStore('sellos').clear();
    await tx.objectStore('config').put(Object.assign({}, datos.config, { id: 1 }));
    for (const cliente of datos.clientes) await tx.objectStore('clientes').put(cliente);
    for (const sello of datos.sellos) {
      const copia = Object.assign({}, sello);
      delete copia.id; // el id es autoincremental
      await tx.objectStore('sellos').add(copia);
    }
    await tx.done;
    return getConfig();
  }

  async function borrarTodo() {
    const db = await abrir();
    const tx = db.transaction(['config', 'clientes', 'sellos'], 'readwrite');
    await tx.objectStore('config').clear();
    await tx.objectStore('clientes').clear();
    await tx.objectStore('sellos').clear();
    await tx.done;
  }

  global.DBDuena = {
    abrir: abrir,
    migrarLegacy: migrarLegacy,
    getConfig: getConfig,
    asegurarNegocioId: asegurarNegocioId,
    guardarConfig: guardarConfig,
    marcarBackup: marcarBackup,
    validarSello: validarSello,
    listarClientes: listarClientes,
    getCliente: getCliente,
    guardarCliente: guardarCliente,
    cambiarToken: cambiarToken,
    listarSellos: listarSellos,
    exportarTodo: exportarTodo,
    importarTodo: importarTodo,
    borrarTodo: borrarTodo
  };
})(window);
