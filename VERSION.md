# Historial de versiones

## v3.0.0 — 26 nov 2026 (última versión)

- **Tercer QR fijo en el mostrador:** «Reclamar premio». Solo funciona con la tarjeta completa, anota el premio en el móvil del cliente y reinicia el ciclo para la siguiente tarjeta.
- El cliente ve `3 / 3 sellos`, `🎁 ¡TARJETA COMPLETA!` y, al escanear el QR 3, `🎉 ¡PREMIO RECLAMADO!`. El historial añade entradas de premio; el total de sellos de siempre no se pierde.
- La dueña genera e imprime los **3 QRs** (instalar, sello y reclamar premio) desde «🖨️ Los 3 QRs del local».
- **Página nueva `mostrador.html`**: cartel imprimible de la tienda ficticia «Panadería Demo» con los 3 QRs ya configurados (3 sellos, barra gratis, sello diario). Es la página del local; `duena.html` queda como panel opcional.
- Cambios en `db-cliente.js`, `db-duena.js`, `qr-gen.js`, `qr-scan.js`, `util.js`, `cliente.html`, `duena.html`, `index.html`, CSS, documentación y preview.
- Service Worker en `fidelidad-v16` (22 recursos en caché).

---

## v2.4.0 — 26 nov 2026

- **Pantalla de la dueña honesta:** ya no muestra contadores de clientes, sellos ni «hoy» (siempre quedaban a cero porque el QR fijo no envía nada). Ahora explica que los sellos viven en el móvil del cliente y pone «🖨️ Los 2 QRs del local» como acción principal.
- El modo verificado queda plegado bajo «🔎 Modo verificado (opcional)»: sigue existiendo, pero **no añade ningún QR al local**. Solo dos QRs fijos en el mostrador.
- Avisos en cliente, portada, documentación y preview: la dueña no recibe datos.
- Service Worker en `fidelidad-v14`.

---

## v2.3.4 — 26 nov 2026

- La base de la dueña usa un nombre nuevo (`fidelidad-duena-v2`) con migración única desde la anterior. Así un almacenamiento local bloqueado no deja el panel en blanco.
- Service Worker en `fidelidad-v13`.

---

## v2.3.3 — 26 nov 2026

- Auditoría final: un aviso vencido **no se marca como enviado** si aún no se ha dado permiso; se reintenta al abrir la app.
- Plantilla de datos actualizada con los 3 textos de aviso personalizables.
- Service Worker en `fidelidad-v12`.

---

## v2.3.2 — 26 nov 2026

- Auditoría completa del flujo: portada actualizada y corrección de «1 días» → «1 día» en la racha.
- Service Worker en `fidelidad-v11`.

---

## v2.3.1 — 26 nov 2026

- Auditoría completa del flujo: la portada ya explica el alta con apellidos y cumpleaños y los 3 avisos.
- Service Worker en `fidelidad-v10`.

---

## v2.3.0 — 26 nov 2026

- **Alta obligatoria antes de sellar:** nombre, apellidos y fecha de nacimiento. Los perfiles antiguos vuelven a la pantalla de alta para completarlos.
- **Tres avisos locales personalizados:** `Jose, recuerda tu sello diario`, `Feliz cumpleaños, Jose García!` y `Feliz Navidad, Jose` + nombre del negocio.
- Botón **«🔔 Probar mis 3 avisos»** en Ajustes, y activación de los avisos al crear la tarjeta.
- Cumpleaños y Navidad se recalculan en cada apertura (el SW solo llega a 7 días); 29 de febrero → 28 en años no bisiestos.
- Service Worker en `fidelidad-v9`.

---

## v2.2.0 — 25 nov 2026

- **PIN eliminado del flujo normal**: la dueña entra directa al panel; el PIN queda como opción que solo se activa si se quiere (y se puede quitar desde Ajustes).
- Plantilla de datos actualizada: ya no pide PIN.
- Service Worker en `fidelidad-v8`.

---

## v2.1.0 — 25 nov 2026

- Botón **«📲 Instalar app en este móvil»** en la pantalla de bienvenida y en Ajustes. Usa `beforeinstallprompt` en Android y muestra las instrucciones en iPhone.
- Texto de alta del cliente aclarado: el nombre solo se usa en el modo verificado opcional.
- Nueva `PLANTILLA-DATOS.md` para encargar la personalización (logo, colores, textos, premio, URL final).
- Service Worker en `fidelidad-v7`.
- Añadido `mobile-web-app-capable` para evitar el aviso de meta obsoleto.

---

## v2.0.0 — 25 nov 2026

Cambio principal: **dos QRs fijos en el mostrador** y la dueña no interviene en cada visita.

### Añadido
- **QR de instalar**: abre `cliente.html` y permite instalar la PWA del cliente.
- **QR del sello**: el cliente lo escanea y su móvil aplica el sello del periodo.
- Botón **«🖨️ Los 2 QRs del local»** en `duena.html`, con opción de imprimir/copiar.
- Configuración de frecuencia **diaria / semanal** (claves `YYYY-MM-DD` / `YYYY-Www`).
- `negocio_id` de 16 hex para que un QR no mezcle datos de otro local.
- `ultimo_periodo` en cliente y dueña: **un sello por periodo** como máximo.
- Racha y premio configurables también en el QR fijo (`cada`, `premio`).
- Textos y ayuda actualizados al flujo de 2 QRs; modo verificado conservado como opcional.
- Parche local en `qrcodejs` para generar QRs con nombres acentuados («Panadería»).
- Service Worker en `fidelidad-v5` con los 21 recursos precacheados.

### Cambiado
- `cliente.html` acepta tanto el QR fijo (`t: sello-diario`) como el QR verificado (`t: sello`).
- `db-duena.js` calcula el bloqueo con `Util.claveActual()` / `Util.claveAnterior()`.
- `db-cliente.js` migra perfiles antiguos añadiendo `frecuencia` y `ultimo_periodo`.
- `INSTRUCCIONES.md` reescrito para el nuevo flujo y sus limitaciones de confianza.

### Limitación deliberada
El QR del sello **no envía señal a la dueña**: sin servidor ni dispositivo en el mostrador, el sello vive en el móvil del cliente. Es un modo **de confianza**. Para control real existe el modo verificado (cliente muestra su QR → dueña escanea → dueña devuelve QR).

---

## v1.0.0 — 24 nov 2026

Versión inicial: dos PWAs independientes, IndexedDB como única fuente de verdad, intercambio de QRs cliente↔dueña, PIN local, backup JSON, notificaciones locales y caché offline.
