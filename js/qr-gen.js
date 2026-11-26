/* Generación de QRs (qrcodejs, servido desde js/vendor). */
(function (global) {
  'use strict';

  function dibujar(elemento, texto, tamano) {
    if (!elemento) throw new Error('No existe el contenedor del QR.');
    if (!global.QRCode) throw new Error('No se cargó qrcodejs. Comprueba js/vendor/qrcode.min.js');
    elemento.innerHTML = '';
    const size = Number(tamano) || 240;
    // QRCode dibuja un canvas: se ve bien en pantallas de alta densidad.
    new global.QRCode(elemento, {
      text: texto,
      width: size,
      height: size,
      colorDark: '#111827',
      colorLight: '#ffffff',
      correctLevel: global.QRCode.CorrectLevel.M
    });
  }

  // QR 1 (cliente -> dueña): solo identidad. NUNCA el estado.
  function codigoIdentidad(perfil) {
    return JSON.stringify({
      t: 'id',
      v: 1,
      token: perfil.token,
      nombre: perfil.nombre || 'Cliente'
    });
  }

  // QR fijo del mostrador: el cliente lo escanea y se sella él solo.
  // Es de CONFIANZA: no hay servidor que verifique la compra.
  function codigoSelloDiario(config) {
    return JSON.stringify({
      t: 'sello-diario',
      v: 2,
      id: config.negocio_id,
      negocio: config.nombre_negocio,
      premio: config.premio,
      cada: config.sellos_para_premio,
      frecuencia: config.frecuencia === 'semanal' ? 'semanal' : 'diario'
    });
  }

  // QR 3 del mostrador: el cliente lo escanea cuando ya completó la tarjeta.
  // No envía nada a la dueña: marca el premio en el móvil del cliente.
  function codigoReclamarPremio(config) {
    return JSON.stringify({
      t: 'reclamar-premio',
      v: 1,
      id: config.negocio_id,
      negocio: config.nombre_negocio,
      premio: config.premio
    });
  }

  function urlInstalar() {
    return Util.urlDe('cliente.html');
  }

  // QR 2 (dueña -> cliente): URL con los datos en el hash.
  function urlRespuesta(datos) {
    return Util.urlDe('cliente.html') + '#d=' + encodeURIComponent(Util.jsonAB64(datos));
  }

  global.QRGen = {
    dibujar: dibujar,
    codigoIdentidad: codigoIdentidad,
    codigoSelloDiario: codigoSelloDiario,
    codigoReclamarPremio: codigoReclamarPremio,
    urlInstalar: urlInstalar,
    urlRespuesta: urlRespuesta
  };
})(window);
