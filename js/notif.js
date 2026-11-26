/* Notificaciones LOCALES y personalizadas. No hay push: no necesita servidor. */
(function (global) {
  'use strict';

  const CLAVE = 'fidelidad_notificaciones_v2';
  const SEMANA = 7 * 24 * 60 * 60 * 1000;

  async function pedirPermiso() {
    if (!('Notification' in global)) return 'no-soportado';
    if (Notification.permission === 'default') {
      try { return await Notification.requestPermission(); } catch (e) { return 'denegado'; }
    }
    return Notification.permission;
  }

  function nombre(perfil) {
    return String((perfil && perfil.nombre) || '').trim() || 'Cliente';
  }

  function nombreCompleto(perfil) {
    const n = nombre(perfil);
    const a = String((perfil && perfil.apellidos) || '').trim();
    return a ? n + ' ' + a : n;
  }

  function negocio(perfil) {
    return String((perfil && perfil.negocio_nombre) || '').trim() || 'tu local favorito';
  }

  function aLas(anio, mes, dia, hora) {
    return new Date(anio, mes, dia, hora, 0, 0, 0).getTime();
  }

  // 29 de febrero: si el año no es bisiesto, se felicita el 28.
  function fechaCumple(anio, mes, dia) {
    const fecha = new Date(anio, mes, dia, 9, 0, 0, 0);
    if (mes === 1 && dia === 29 && fecha.getMonth() !== 1) {
      return new Date(anio, 1, 28, 9, 0, 0, 0).getTime();
    }
    return fecha.getTime();
  }

  function proximoCumple(cumpleanos, ahora) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(cumpleanos || ''));
    if (!m) return null;
    const mes = Number(m[2]) - 1;
    const dia = Number(m[3]);
    if (mes < 0 || mes > 11 || dia < 1 || dia > 31) return null;
    const anio = ahora.getFullYear();
    let cuando = fechaCumple(anio, mes, dia);
    if (cuando <= ahora.getTime()) cuando = fechaCumple(anio + 1, mes, dia);
    return cuando;
  }

  function proximaNavidad(ahora) {
    const anio = ahora.getFullYear();
    let cuando = aLas(anio, 11, 25, 9);
    if (cuando <= ahora.getTime()) cuando = aLas(anio + 1, 11, 25, 9);
    return cuando;
  }

  function mananaALas10(ahora) {
    const fecha = new Date(ahora);
    fecha.setDate(fecha.getDate() + 1);
    fecha.setHours(10, 0, 0, 0);
    return fecha.getTime();
  }

  // Los tres avisos que pide el negocio, ya con el nombre de la persona metido.
  function avisos(perfil, racha) {
    const ahora = new Date();
    const n = nombre(perfil);
    const completo = nombreCompleto(perfil);
    const local = negocio(perfil);
    const r = Math.max(0, Number(racha) || 0);

    const lista = [{
      tag: 'sello-diario',
      cuando: mananaALas10(ahora),
      titulo: '⏰ ' + n + ', recuerda tu sello diario',
      cuerpo: r > 0
        ? 'Llevas ' + r + ' ' + (r === 1 ? 'día' : 'días') + ' de racha. ¡Vuelve hoy!'
        : 'Pásate por ' + local + ' y pon tu sello de hoy.',
      icon: 'icons/cliente-192.png'
    }];

    const cumple = proximoCumple(perfil && perfil.cumpleanos, ahora);
    if (cumple) {
      lista.push({
        tag: 'cumpleanos',
        cuando: cumple,
        titulo: '🎂 Feliz cumpleaños, ' + completo + '!',
        cuerpo: 'Un día estupendo desde ' + local + '. 🎉',
        icon: 'icons/cliente-192.png'
      });
    }

    lista.push({
      tag: 'navidad',
      cuando: proximaNavidad(ahora),
      titulo: '🎄 Feliz Navidad, ' + n,
      cuerpo: 'Recuerda que ' + local + ' te está esperando. 🎁',
      icon: 'icons/cliente-192.png'
    });

    return lista;
  }

  function leer() {
    try { return JSON.parse(localStorage.getItem(CLAVE) || '[]') || []; }
    catch (e) { return []; }
  }

  function guardar(lista) {
    try { localStorage.setItem(CLAVE, JSON.stringify(lista)); } catch (e) { /* sin almacenamiento */ }
  }

  function mensajeAlSW(mensaje) {
    if (!navigator.serviceWorker) return Promise.resolve(false);
    return navigator.serviceWorker.ready.then(function (reg) {
      if (!reg.active) return false;
      reg.active.postMessage(mensaje);
      return true;
    }).catch(function () { return false; });
  }

  function enviarAlSW(aviso) {
    mensajeAlSW({
      tipo: 'programar-notif',
      cuando: aviso.cuando,
      titulo: aviso.titulo,
      cuerpo: aviso.cuerpo,
      tag: aviso.tag,
      icon: aviso.icon
    }).catch(function () {});
  }

  function mostrar(aviso) {
    if ('Notification' in global && Notification.permission === 'granted') {
      try {
        // El mismo tag evita duplicados: el navegador sustituye el aviso anterior.
        new Notification(aviso.titulo, { body: aviso.cuerpo, icon: aviso.icon, tag: aviso.tag });
      } catch (e) { /* algunos navegadores exigen showNotification del SW */ }
    }
  }

  let intervalo = null;

  function revisarPendientes() {
    const ahora = Date.now();
    const permiso = ('Notification' in global) ? Notification.permission : 'denied';
    const actuales = leer();
    let cambio = false;
    actuales.forEach(function (aviso) {
      if (aviso.enviado) return;
      if (aviso.cuando <= ahora) {
        // Si todavía no hay permiso, no lo marcamos como enviado: se reintentará.
        if (permiso === 'granted') {
          mostrar(aviso);
          aviso.enviado = ahora;
          cambio = true;
        }
      } else if (aviso.cuando - ahora < SEMANA) {
        enviarAlSW(aviso);
      }
    });
    if (cambio) guardar(actuales);
  }

  function vigilar() {
    if (intervalo) clearInterval(intervalo);
    revisarPendientes();
    // El SW puede ser detenido por el sistema: mientras la página esté abierta,
    // se revisa cada hora y se reprograma lo que ya entre en su ventana de 7 días.
    intervalo = setInterval(revisarPendientes, 60 * 60 * 1000);
  }

  async function programarTodo(perfil, racha) {
    const permiso = await pedirPermiso();
    if (permiso !== 'granted') return permiso;

    const anteriores = leer();
    const porTag = {};
    anteriores.forEach(function (aviso) { porTag[aviso.tag] = aviso; });

    const lista = avisos(perfil, racha).map(function (aviso) {
      const viejo = porTag[aviso.tag];
      if (viejo && viejo.cuando === aviso.cuando && viejo.enviado) aviso.enviado = viejo.enviado;
      return aviso;
    });

    guardar(lista);
    lista.forEach(enviarAlSW);
    vigilar();
    return 'programada';
  }

  // Compatibilidad con la firma antigua.
  function programar(racha, tag) {
    return programarTodo(null, racha);
  }

  async function cancelar(tag) {
    guardar(leer().filter(function (aviso) { return aviso.tag !== tag; }));
    await mensajeAlSW({ tipo: 'cancelar-notif', tag: tag || 'racha' });
  }

  // Al abrir la app: si venció mientras estaba cerrada, se muestra;
  // si el permiso ya estaba dado, se recalculan las tres fechas.
  async function sincronizar(perfil, racha) {
    revisarPendientes();
    if (perfil && 'Notification' in global && Notification.permission === 'granted') {
      await programarTodo(perfil, racha);
    } else {
      vigilar();
    }
  }

  async function probar(perfil) {
    const permiso = await pedirPermiso();
    if (permiso !== 'granted') return permiso;
    avisos(perfil || {}, 0).forEach(function (aviso, indice) {
      setTimeout(function () {
        mostrar({
          titulo: '🔔 Prueba · ' + aviso.titulo,
          cuerpo: aviso.cuerpo,
          icon: aviso.icon,
          tag: 'prueba-' + aviso.tag
        });
      }, indice * 600);
    });
    return 'enviada';
  }

  global.Notif = {
    pedirPermiso: pedirPermiso,
    programar: programar,
    programarTodo: programarTodo,
    cancelar: cancelar,
    sincronizar: sincronizar,
    probar: probar,
    avisos: avisos
  };
})(window);
