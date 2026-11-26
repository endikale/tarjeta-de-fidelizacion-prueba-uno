/* Escáner de QRs (html5-qrcode) + validación del protocolo. */
(function (global) {
  'use strict';

  let lector = null;
  let activo = false;

  function parsearIdentidad(texto) {
    const datos = Util.datosDelTexto(texto);
    if (!datos || datos.t !== 'id' || Number(datos.v) !== 1 || !Util.esToken(datos.token)) {
      throw new Error('Ese QR no es una tarjeta válida. Debe mostrar el QR de "Mi Tarjeta".');
    }
    return {
      t: 'id',
      v: 1,
      token: String(datos.token).toLowerCase(),
      nombre: String(datos.nombre || 'Cliente').trim().slice(0, 60)
    };
  }

  function parsearSelloDiario(texto) {
    const datos = Util.datosDelTexto(texto);
    if (!datos || datos.t !== 'sello-diario' || Number(datos.v) !== 2 || !/^[0-9a-f]{16}$/i.test(datos.id || '')) {
      throw new Error('Ese QR no es el sello del local.');
    }
    return {
      t: 'sello-diario',
      v: 2,
      id: String(datos.id).toLowerCase(),
      negocio: String(datos.negocio || 'El local').trim().slice(0, 60),
      premio: String(datos.premio || 'Premio').trim().slice(0, 80),
      cada: Math.max(1, Math.min(100, Number(datos.cada) || 10)),
      frecuencia: datos.frecuencia === 'semanal' ? 'semanal' : 'diario'
    };
  }

  function parsearReclamarPremio(texto) {
    const datos = Util.datosDelTexto(texto);
    if (!datos || datos.t !== 'reclamar-premio' || Number(datos.v) !== 1 || !/^[0-9a-f]{16}$/i.test(datos.id || '')) {
      throw new Error('Ese QR no es para reclamar el premio.');
    }
    return {
      t: 'reclamar-premio',
      v: 1,
      id: String(datos.id).toLowerCase(),
      negocio: String(datos.negocio || 'El local').trim().slice(0, 60),
      premio: String(datos.premio || 'Premio').trim().slice(0, 80)
    };
  }

  function parsearRespuesta(texto) {
    const datos = Util.datosDelTexto(texto);
    if (!datos || datos.t !== 'sello' || Number(datos.v) !== 1 || !Util.esToken(datos.token)) {
      throw new Error('Ese QR no es un sello válido de la dueña.');
    }
    return datos;
  }

  async function iniciar(opciones) {
    await detener();
    if (!global.Html5Qrcode) {
      throw new Error('No se cargó el escáner. Comprueba js/vendor/html5-qrcode.min.js');
    }
    const elemento = document.getElementById(opciones.elementId);
    if (!elemento) throw new Error('No existe el Visor de la cámara.');

    lector = new global.Html5Qrcode(opciones.elementId, { verbose: false });
    activo = true;
    try {
      await lector.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: function (ancho, alto) {
            const lado = Math.floor(Math.min(ancho, alto) * 0.72);
            return { width: lado, height: lado };
          },
          disableFlip: false
        },
        function (texto) {
          if (opciones.onResultado) opciones.onResultado(texto);
        },
        function () { /* un frame sin QR no es un error */ }
      );
    } catch (error) {
      activo = false;
      lector = null;
      throw new Error('No se pudo abrir la cámara. Usa el campo "Pegar código" o revisa los permisos.');
    }
  }

  async function detener() {
    if (!lector) return;
    const actual = lector;
    lector = null;
    activo = false;
    try { await actual.stop(); } catch (e) { /* ya estaba parado */ }
    try { actual.clear(); } catch (e) { /* ignorar */ }
  }

  function estaActivo() {
    return activo;
  }

  global.QRScan = {
    iniciar: iniciar,
    detener: detener,
    estaActivo: estaActivo,
    parsearIdentidad: parsearIdentidad,
    parsearRespuesta: parsearRespuesta,
    parsearSelloDiario: parsearSelloDiario,
    parsearReclamarPremio: parsearReclamarPremio
  };
})(window);
