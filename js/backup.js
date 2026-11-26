/* Copias de seguridad: exportar / importar IndexedDB a un .json. */
(function (global) {
  'use strict';

  function nombreConFecha(prefijo) {
    return prefijo + '-' + Util.fechaLocal() + '.json';
  }

  function descargar(nombreArchivo, datos) {
    const texto = JSON.stringify(datos, null, 2);
    const blob = new Blob([texto], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function leerArchivo(archivo) {
    return new Promise(function (resolver, rechazar) {
      if (!archivo) return rechazar(new Error('Selecciona un archivo .json'));
      const lector = new FileReader();
      lector.onload = function () {
        try {
          resolver(JSON.parse(lector.result));
        } catch (e) {
          rechazar(new Error('Ese archivo no es un JSON válido.'));
        }
      };
      lector.onerror = function () { rechazar(new Error('No se pudo leer el archivo.')); };
      lector.readAsText(archivo);
    });
  }

  async function exportarCliente() {
    const datos = await DBCliente.exportar();
    descargar(nombreConFecha('fidelidad-cliente'), datos);
    return datos;
  }

  async function importarCliente(archivo) {
    const payload = await leerArchivo(archivo);
    return DBCliente.importar(payload);
  }

  async function exportarDuena() {
    const datos = await DBDuena.exportarTodo();
    descargar(nombreConFecha('fidelidad-backup'), datos);
    await DBDuena.marcarBackup();
    return datos;
  }

  async function importarDuena(archivo) {
    const payload = await leerArchivo(archivo);
    return DBDuena.importarTodo(payload);
  }

  global.Backup = {
    descargar: descargar,
    leerArchivo: leerArchivo,
    exportarCliente: exportarCliente,
    importarCliente: importarCliente,
    exportarDuena: exportarDuena,
    importarDuena: importarDuena
  };
})(window);
