# Tarjeta de fidelidad 100 % local

Demo de **tienda ficticia** («Panadería Demo») con tarjeta de fidelidad sin servidor, sin cuentas y sin internet después de la primera instalación.

## Las dos páginas de la demo

1. **`mostrador.html`** — cartel imprimible con los **3 QRs fijos** del local:
   - 1️⃣ Instalar la app (`cliente.html`).
   - 2️⃣ Poner el sello del día (avanza la tarjeta).
   - 3️⃣ Reclamar el premio cuando la tarjeta está completa (reinicia el ciclo).
2. **`cliente.html`** — tarjeta del cliente: alta obligatoria (nombre, apellidos y cumpleaños), cámara para escanear los QRs, tarjeta visual, historial, avisos locales y copias de seguridad.

`duena.html` es un panel opcional para personalizar negocio, premio, sellos y frecuencia; `index.html` es la portada.

## Puntos clave

- Todo vive en **IndexedDB** en el móvil: no hay backend, APIs, nube ni push real.
- Los QRs 2 y 3 son **de confianza**: el móvil del cliente valida y guarda sellos y premios; la dueña no recibe esos datos.
- Un sello por día (o por semana) y un premio cada 3 sellos en la tienda ficticia.
- Los 3 avisos son locales: sello diario, cumpleaños y Navidad, con el nombre del cliente.
- Requiere HTTPS (o `localhost`) para Service Worker y cámara. Funciona en modo avión tras la primera carga.

## Uso rápido

- Ver/imprimir el cartel: abre `mostrador.html`.
- Probar como cliente: abre `cliente.html` desde el QR 1 o directamente.
- Documentación completa: `INSTRUCCIONES.md`. Historial: `VERSION.md`. Datos a personalizar: `PLANTILLA-DATOS.md`.
- Vista previa visual: `PREVIEW-EJEMPLO.html` / `PREVIEW-EJEMPLO.png`.

## Publicación

GitHub Pages (gratis, HTTPS y URL permanente). Sube toda esta carpeta al repo `tarjeta-de-fidelizacion-prueba-uno` y activa **Settings → Pages → Deploy from a branch → main → /(root)**. La URL pública será `https://endikale.github.io/tarjeta-de-fidelizacion-prueba-uno/mostrador.html`. La URL del QR de instalar se genera sola desde la URL donde esté publicado `cliente.html`.

> Versión 3.0.0 · 26 nov 2026 · caché `fidelidad-v16`.
