/* Utilidades compartidas por las dos apps. Sin frameworks, sin red. */
(function (global) {
  'use strict';

  function fechaLocal(fecha) {
    const d = fecha || new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + dia;
  }

  // Resta un día a una fecha YYYY-MM-DD sin usar UTC (importante en España).
  function diaAnterior(iso) {
    const partes = String(iso).split('-').map(Number);
    const d = new Date(partes[0], partes[1] - 1, partes[2]);
    d.setDate(d.getDate() - 1);
    return fechaLocal(d);
  }

  // Clave del periodo: diario = YYYY-MM-DD, semanal = YYYY-Www (ISO).
  function claveSemana(fecha) {
    const d = fecha || new Date();
    const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dia = utc.getUTCDay() || 7;
    utc.setUTCDate(utc.getUTCDate() + 4 - dia);
    const inicio = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
    const semana = Math.ceil(((utc - inicio) / 86400000 + 1) / 7);
    return utc.getUTCFullYear() + '-W' + String(semana).padStart(2, '0');
  }

  function claveActual(frecuencia) {
    return frecuencia === 'semanal' ? claveSemana(new Date()) : fechaLocal();
  }

  function claveAnterior(clave, frecuencia) {
    if (frecuencia === 'semanal') {
      const partes = String(clave).split('-W');
      const anio = Number(partes[0]);
      const semana = Number(partes[1]);
      const jueves = new Date(Date.UTC(anio, 0, 4));
      const lunes = new Date(Date.UTC(anio, 0, 4 - (jueves.getUTCDay() || 7) + 1 + (semana - 1) * 7));
      const anterior = new Date(lunes.getUTCFullYear(), lunes.getUTCMonth(), lunes.getUTCDate() - 7);
      return claveSemana(anterior);
    }
    const partes = String(clave).split('-').map(Number);
    const d = new Date(partes[0], partes[1] - 1, partes[2]);
    d.setDate(d.getDate() - 1);
    return fechaLocal(d);
  }

  function randomToken() {
    const bytes = new Uint8Array(16);
    if (global.crypto && global.crypto.getRandomValues) {
      global.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  function esToken(valor) {
    return /^[0-9a-f]{32}$/i.test(String(valor || ''));
  }

  // UTF-8 -> base64 (btoa directa rompe los acentos).
  function b64encode(texto) {
    const bytes = new TextEncoder().encode(texto);
    let binario = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binario += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(binario);
  }

  function b64decode(base64) {
    const binario = atob(String(base64).replace(/\s/g, ''));
    const bytes = Uint8Array.from(binario, function (c) { return c.charCodeAt(0); });
    return new TextDecoder().decode(bytes);
  }

  function jsonAB64(objeto) {
    return b64encode(JSON.stringify(objeto));
  }

  function jsonDesdeB64(base64) {
    return JSON.parse(b64decode(base64));
  }

  // URL base del deploy, funcione en la raíz o en un subdirectorio.
  function baseUrl() {
    const u = new URL(global.location.href);
    u.hash = '';
    u.search = '';
    const archivo = u.pathname.split('/').pop() || '';
    if (/\.html$/i.test(archivo)) {
      u.pathname = u.pathname.slice(0, -archivo.length);
    }
    return u.href;
  }

  function urlDe(archivo) {
    return baseUrl() + archivo;
  }

  // Lee { ... } o una URL con #d=<base64> pegada/escaneada.
  function datosDelTexto(texto) {
    const limpio = String(texto || '').trim();
    if (!limpio) return null;
    try {
      const u = new URL(limpio);
      const m = u.hash.match(/[#&]d=([^&]+)/);
      if (m) return jsonDesdeB64(decodeURIComponent(m[1]));
    } catch (e) { /* no era URL */ }
    try {
      if (limpio.charAt(0) === '{') return JSON.parse(limpio);
    } catch (e) { /* no era JSON */ }
    try {
      return jsonDesdeB64(limpio);
    } catch (e) { /* no era base64 */ }
    return null;
  }

  function datosDelHash() {
    const m = String(global.location.hash || '').match(/[#&]d=([^&]+)/);
    if (!m) return null;
    try {
      return jsonDesdeB64(decodeURIComponent(m[1]));
    } catch (e) {
      return null;
    }
  }

  function limpiarHash() {
    if (global.history && global.history.replaceState) {
      global.history.replaceState(null, '', global.location.pathname + global.location.search);
    }
  }

  function escapar(texto) {
    return String(texto == null ? '' : texto).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function toast(mensaje, tipo) {
    let capa = document.getElementById('capa-toasts');
    if (!capa) {
      capa = document.createElement('div');
      capa.id = 'capa-toasts';
      capa.className = 'capa-toasts';
      document.body.appendChild(capa);
    }
    const aviso = document.createElement('div');
    aviso.className = 'toast' + (tipo === 'error' ? ' toast--error' : '');
    aviso.textContent = mensaje;
    capa.appendChild(aviso);
    setTimeout(function () { aviso.remove(); }, 3800);
  }

  function copiar(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(texto).catch(function () { return copiarFallback(texto); });
    }
    return Promise.resolve(copiarFallback(texto));
  }

  function copiarFallback(texto) {
    const area = document.createElement('textarea');
    area.value = texto;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); } catch (e) { /* ignorar */ }
    area.remove();
  }

  global.Util = {
    fechaLocal: fechaLocal,
    diaAnterior: diaAnterior,
    claveSemana: claveSemana,
    claveActual: claveActual,
    claveAnterior: claveAnterior,
    randomToken: randomToken,
    esToken: esToken,
    b64encode: b64encode,
    b64decode: b64decode,
    jsonAB64: jsonAB64,
    jsonDesdeB64: jsonDesdeB64,
    urlDe: urlDe,
    datosDelTexto: datosDelTexto,
    datosDelHash: datosDelHash,
    limpiarHash: limpiarHash,
    escapar: escapar,
    toast: toast,
    copiar: copiar
  };
})(window);
