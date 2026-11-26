# Tarjeta de fidelidad 100 % local

> **Versión 3.0.0 · 26 nov 2026** — ver `VERSION.md` para el historial de cambios y `PLANTILLA-DATOS.md` para encargar una personalización.

Tres QRs fijos en el mostrador de una **tienda ficticia de ejemplo** («Panadería Demo») y la dueña **no hace nada en cada visita**:

1. **QR 1 · Instalar** → abre la PWA del cliente una vez (necesita internet solo esa vez).
2. **QR 2 · Sello** → el cliente, ya con la app, lo escanea en cada visita y su móvil le pone el sello del día (o de la semana).
3. **QR 3 · Reclamar premio** → cuando la tarjeta está completa, lo escanea y su móvil anota el premio y empieza una tarjeta nueva.

No hay servidor, cuentas, nube ni suscripciones. Todo vive en IndexedDB.

> 👀 **Vista previa:** abre `PREVIEW-EJEMPLO.html` (o mira `PREVIEW-EJEMPLO.png`) para ver un ejemplo con datos ficticios: cartel del mostrador con los 3 QRs, tarjeta del cliente y panel de la dueña.

> ⚠️ **Lee esto antes de imprimir:** los QRs 2 y 3 funcionan **por confianza**. Al no haber servidor ni dispositivo en el mostrador, el sello y la reclamación se calculan y se guardan **en el móvil del cliente**. La app de la dueña no recibe ninguna señal, no sabe quién escaneó ni puede corregir el contador. El QR 3 solo funciona si la tarjeta está completa; después esa tarjeta vuelve a empezar. Si quieres control real, usa el **modo verificado** (sección 5).

> 📭 **Sobre la pantalla de la dueña:** es normal que salga **sin datos**. No hay contadores de clientes ni de sellos porque nadie le envía nada: solo guarda la configuración y los tres QRs. Su trabajo se reduce a configurar una vez, imprimir los tres cartelitos y hacer una copia de seguridad de vez en cuando. El modo verificado queda escondido en «🔎 Modo verificado» por si algún día quiere llevar control, pero **no añade ningún QR al local**.

---

## 1. Subir el proyecto (una vez) — recomendado: GitHub Pages

**Recomendado: GitHub Pages.** Es gratis, da HTTPS y la URL **no caduca**, que es justo lo que necesita un QR impreso en el mostrador.

1. Crea una cuenta gratis en `github.com` (si ya tienes, entra).
2. **New repository** → nombre: `tarjeta-de-fidelizacion-prueba-uno` (el repo que ya tienes) → **Public** → *Create repository*.
3. En el repo: **Add file → Upload files** → arrastra **todo el contenido** de esta carpeta (`index.html`, `cliente.html`, `duena.html`, `mostrador.html`, `css`, `js`, `icons`, manifiestos, `sw.js`) → **Commit changes**.
4. **Settings → Pages** → *Build and deployment* → Source: **Deploy from a branch** → Branch: `main` → carpeta `/(root)` → **Save**.
5. Espera 1–2 min. Tu URL será `https://endikale.github.io/tarjeta-de-fidelizacion-prueba-uno/`.
6. Abre `https://endikale.github.io/tarjeta-de-fidelizacion-prueba-uno/mostrador.html` para ver el cartel de la tienda ficticia, o `.../duena.html` en el móvil de la dueña si quieres personalizar los datos (apartado 2).

> Las rutas del proyecto son relativas (`./`), así que funcionan igual en la raíz que en una subcarpeta tipo `/tarjeta-de-fidelizacion-prueba-uno/`. No hay que cambiar nada.

**Alternativa:** Netlify con cuenta (loguéate antes en `app.netlify.com/drop` y arrastra la carpeta). Sin cuenta, el sitio es temporal y puede pedir contraseña; **reclámalo antes de imprimir el QR**. Vercel Drop sin cuenta caduca en unos 30–60 min: no lo uses para un QR fijo sin reclamarlo.

**No hace falta enviar la URL a nadie para generar los QRs:** la app de la dueña crea el QR de instalar con la dirección desde la que se abre. Si la abres en tu URL final, el QR apunta solo a ella.

Para probar en el ordenador: `powershell -File servir-local.ps1` y abre `http://localhost:8765/`.

⚠️ Con doble clic (`file://`) se ve la interfaz, pero **cámara y Service Worker no funcionan**. Para el uso real hace falta HTTPS (o localhost).

---

## 2. La dueña: primera puesta en marcha

1. Abre `https://TU-URL/duena.html` en su móvil.
2. Rellena: negocio, premio, sellos para el premio y **cada cuánto se da el sello** (diario o semanal). No hace falta PIN.
3. Guarda y entra directamente al panel. **No te sorprendas si no ves clientes ni contadores**: con los 3 QRs fijos ese móvil no recibe sellos ni premios; ahí solo está la configuración. El botón principal es «🖨️ Los 3 QRs del local».
4. Pulsa **«🖨️ Los 3 QRs del local»**. Imprime los tres y pégalos juntos en el mostrador: son los **únicos tres QRs** que debe haber en el local. El 1 se escanea una vez, el 2 en cada visita y el 3 solo al completar la tarjeta.
5. Pulsa **«Copia de seguridad» → «Exportar ahora»** y guarda el `.json` en Drive o por email. Es lo único que conviene guardar de este móvil.

Instalar como app: Android → menú del navegador → «Instalar app». iPhone → Safari → Compartir → «Añadir a pantalla de inicio».

> 🏪 **Tienda ficticia lista:** abre `mostrador.html` para ver e imprimir los 3 QRs de «Panadería Demo» sin configurar nada (3 sellos, barra gratis, sello diario). Es la página del cartel del local; `duena.html` queda como panel opcional si algún día quieres cambiar los datos.

**Si cambias el premio, los sellos o la frecuencia, imprime los QRs 2 y 3 otra vez**: son fijos y llevan esos datos escritos dentro.

---

## 3. El cliente: primera vez y cada visita

**Primera vez**
1. Escanea el QR 1 de instalar (con internet solo la primera vez).
2. Instala la app en pantalla de inicio.
3. **Antes de nada**, escribe su nombre, sus apellidos y su fecha de nacimiento, y pulsa «Crear mi tarjeta». Sin esos tres datos no se puede sellar ni reclamar.
4. Al crear la tarjeta se piden permisos y se activan los 3 avisos (ver apartado 7).

**Cada visita (sin internet)**
1. Abre la app → **«Escanear QR del local»**.
2. Apunta al QR 2 del sello del mostrador.
3. Sale `✅ Sello de Panadería Demo — Racha 3`. Al completar la tarjeta (por ejemplo, 3 de 3) aparece `🎁 ¡TARJETA COMPLETA!` con la instrucción de escanear el QR 3.

**Cuando complete la tarjeta**
1. Pulsa de nuevo **«Escanear QR del local»** y apunta al QR 3, «Reclamar premio».
2. Sale `🎉 ¡PREMIO RECLAMADO!` con el premio y el aviso «Muestra este mensaje en el local».
3. El contador de la tarjeta vuelve a 0: ya puede empezar la siguiente. El total de sellos de siempre y el historial no se borran.
4. Si le faltan sellos, el móvil dice cuántos faltan y no reclama nada. Si escanea el QR 3 dos veces seguidas, tampoco suma dos premios.

También funciona con la **cámara nativa**: al escanear cualquiera de los QRs se abre la app y aplica la acción sola.

Si no hay cámara o no hay permiso, el modal tiene un apartado **«Pegar el código aquí»**.

---

## 4. Reglas de los QRs 2 y 3

### QR 2 · Sello

- El QR lleva esto dentro:
  ```json
  { "t": "sello-diario", "v": 2, "id": "abcd1234abcd1234",
    "negocio": "Panadería Demo", "premio": "Barra gratis",
    "cada": 3, "frecuencia": "diario" }
  ```
- **Un sello por periodo** como máximo: si ya escaneó hoy (o esta semana), sale «Ya sellaste hoy. Vuelve mañana.»
- Si el sello anterior fue justo el periodo anterior, la racha sube 1. Si no, empieza en 1.
- Cada `cada` sellos → tarjeta completa, lista para reclamar.
- Fechas en **hora local**, no UTC.
- El ID de negocio evita que un QR de otro local mezcle sus datos.
- El historial guarda la hora exacta de cada escaneo (`ts`) y el periodo.

### QR 3 · Reclamar premio

- El QR lleva:
  ```json
  { "t": "reclamar-premio", "v": 1, "id": "abcd1234abcd1234",
    "negocio": "Panadería Demo", "premio": "Barra gratis" }
  ```
- Solo deja reclamar si los sellos del ciclo llegaron a `cada`. Si faltan, avisa de cuántos.
- Al reclamar: suma 1 a `premios_reclamados`, guarda la fecha, añade una entrada `tipo: "premio"` al historial y pone el ciclo a 0.
- El `id` debe coincidir con el del QR 2; si es de otro local, no lo aplica.
- No envía nada a la dueña: es de confianza, igual que el sello.

---

## 5. Modo verificado (opcional, cuando la dueña quiera control)

La app de la dueña conserva el flujo original de 3 segundos:

1. Cliente → «Mostrar mi QR».
2. Dueña → «Escanear QR del cliente». Ve `✅ Juan sellado — Racha 3` y el QR de respuesta.
3. Cliente → «Escanear sello del local» (acepta también este QR de respuesta).

Aquí **la dueña sí lleva el registro**: su IndexedDB es la fuente de verdad, aplica el bloqueo de periodo y puede reasignar tokens. Es la única forma de saber quién compró de verdad sin servidor.

---

## 6. Copias de seguridad

Con el QR fijo, **cada cliente guarda su propia tarjeta**; la dueña solo guarda su configuración (y, si usa el modo verificado, clientes y sellos). Por eso su copia es pequeña: lo valioso son las tarjetas de cada móvil.

- La dueña: «Copia de seguridad → Exportar ahora» → `fidelidad-backup-AAAA-MM-DD.json` (config, clientes y sellos del modo verificado). Una vez por semana.
- El cliente: «Ajustes → Exportar mi tarjeta» → `fidelidad-cliente-AAAA-MM-DD.json`.
- Para migrar de móvil: instalar la app, importar la copia antes de configurar nada (dueña) o desde Ajustes (cliente).
- La app recuerda la última copia y avisa a los 7 días.

Sin copia, si se pierde el móvil, se pierden los datos de ese móvil.

---

## 7. Notificaciones (solo locales, personalizadas)

Con el nombre, los apellidos y el cumpleaños del alta, la app programa **tres avisos** en el móvil del cliente:

| Cuándo | Aviso |
| --- | --- |
| Mañana a las 10:00 (y cada vez que sella) | **⏰ Jose, recuerda tu sello diario** |
| El cumpleaños, a las 09:00 | **🎂 Feliz cumpleaños, Jose García!** |
| 25 de diciembre a las 09:00 | **🎄 Feliz Navidad, Jose** + «Recuerda que Panadería Demo te está esperando.» |

Si aún no ha venido nunca, en el aviso de Navidad y en el diario se usa «tu local favorito» en lugar del nombre del negocio. En Ajustes está **«🔔 Probar mis 3 avisos»** para verlos al momento.

No es push: no hay FCM ni servidor. Limitaciones: iOS 16.4+ e instalada en pantalla de inicio; el Service Worker solo puede esperar hasta 7 días, así que cumpleaños y Navidad se reprograman cada vez que se abre la app (y mientras esté abierta se revisa cada hora); si el móvil está apagado, el aviso aparece al abrir la app. El 29 de febrero se felicita el 28 en los años no bisiestos.

---

## 8. Qué se puede y qué no se puede falsear

**Con los QRs 2 y 3 fijos (modo confianza)**
- Un mismo móvil no puede sumar dos sellos en el mismo día/semana: lo comprueba su IndexedDB.
- El QR 3 no reclama si no están todos los sellos, y una tarjeta completa solo se reclama una vez (al reclamar se reinicia el ciclo).
- Cualquiera puede escanear los cartelitos desde casa: no hay prueba de compra ni de entrega del premio.
- El cliente puede cambiar la fecha del móvil, reinstalar la app o editar su IndexedDB y fabricarse sellos y premios.
- La dueña no ve esos sellos ni esas reclamaciones y no puede corregirlos: por eso su pantalla no muestra contadores ni listas de clientes. Muestra el premio cuando el cliente le enseña el mensaje «🎉 ¡PREMIO RECLAMADO!».

**Con el modo verificado**
- El cliente solo muestra su token; la dueña calcula el estado con su propia IndexedDB.
- El cliente no puede adelantar la fecha ni saltarse el bloqueo de periodo.
- Si edita su IndexedDB, solo se engaña a sí mismo: la dueña le reescribe el estado.

**Siempre**
- El PIN es **opcional**: solo se usa si se activa a propósito para quien tenga el móvil al público. No es cifrado. En el flujo de los 3 QRs no hace falta.
- 1 negocio = 1 móvil de dueña. No hay multi-local.

---

## 9. Estructura

```
fidelidad-local/
├── index.html                 landing
├── cliente.html               PWA del cliente
├── duena.html                 PWA de la dueña (panel opcional)
├── mostrador.html             cartel imprimible con los 3 QRs de la tienda ficticia
├── manifest-cliente.json
├── manifest-duena.json
├── sw.js                      cache offline + avisos locales
├── css/estilos.css
├── js/
│   ├── util.js                fechas, periodos, base64, URL, toasts
│   ├── db-cliente.js          IndexedDB del cliente
│   ├── db-duena.js            IndexedDB de la dueña + validarSello()
│   ├── qr-scan.js             escáner + validación de todos los QRs
│   ├── qr-gen.js              generador de los 3 QRs del mostrador
│   ├── backup.js              export/import JSON
│   ├── notif.js               notificaciones locales
│   └── vendor/                idb, qrcodejs y html5-qrcode (locales)
├── icons/                     4 PNG (192 y 512, cliente y dueña)
├── generar-iconos.ps1         opcional: regenera iconos
└── servir-local.ps1           opcional: servidor de prueba
```

Protocolo QR:
- QR 1, instalar: `URL/cliente.html`.
- QR 2, sello fijo: `{ "t":"sello-diario", "v":2, "id":"16hex", "negocio", "premio", "cada", "frecuencia" }`.
- QR 3, reclamar premio: `{ "t":"reclamar-premio", "v":1, "id":"16hex", "negocio", "premio" }`.
- Modo verificado, identidad: `{ "t":"id", "v":1, "token":"32hex", "nombre":"Juan" }`.
- Modo verificado, respuesta: `URL/cliente.html#d=<base64 del JSON>` con `{ "t":"sello", "v":1, ... }`.

---

## 10. Personalizar

- Colores: variables en `css/estilos.css` (`--ambar`, `--tinta`, `--crema`).
- Iconos: sustituye los PNG de `icons/` o ejecuta `generar-iconos.ps1`.
- Negocio, premio, frecuencia y sellos: se configuran en la app de la dueña.
- Si cambias archivos, sube el `sw.js` con el caché incrementado (ahora va por `fidelidad-v16`; la próxima será `fidelidad-v17`) para que los móviles descarguen la versión nueva.

Librerías incluidas (MIT): `idb` 7 (Jake Archibald), `qrcodejs` 1.0.0, `html5-qrcode` 2.3.8. Servidas desde `js/vendor/` para funcionar sin red. El `qrcodejs` lleva un parche local para que los nombres con acentos (por ejemplo «Panadería») no desborden el QR.
