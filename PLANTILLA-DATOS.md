# Plantilla de datos para personalizar el proyecto

Cópiala, rellénala y mándamela junto con el logo. Con esto te devuelvo el ZIP final y los tres QRs en PNG listos para imprimir.

> ✅ **Solo tres QRs en el local:** 1) instalar la app, 2) poner el sello en cada visita y 3) reclamar el premio cuando la tarjeta esté completa. La dueña no recibe datos de los clientes, así que su pantalla no muestra contadores: ahí solo está la configuración, los tres QRs y la copia de seguridad. No hace falta pedir nada más para ella.

---

## 1. Datos del negocio

- **Nombre del negocio:** ___________________________________
- **Logo / foto:** ___________________________________ (ruta del archivo o imagen pegada)
- **Color principal:** __________________ (si no lo dices, uso ámbar `#f59e0b` y negro `#111827`)
- **Color secundario:** __________________
- **Texto del cartelito del sello:** ___________________________________
  (ej.: «Tu sello de hoy está aquí →»)
- **Texto del cartelito de instalar:** ___________________________________
  (ej.: «Escanea y instala tu tarjeta»)
- **Texto del cartelito de reclamar premio:** ___________________________________
  (ej.: «¿Tarjeta completa? Escanea aquí y recoge tu premio»)

## 2. Reglas de la tarjeta

- **Premio:** ___________________________________ (ej.: «Barra gratis»)
- **Sellos necesarios para el premio:** ______ (1–100)
- **Frecuencia del sello:**
  - [ ] Diario (un sello cada día)
  - [ ] Semanal (un sello por semana)
- **¿Racha activada?** [ ] Sí [ ] No

## 3. Textos personalizados (opcional)

- **Saludo de bienvenida:** ___________________________________
- **Mensaje al poner sello:** ___________________________________
- **Mensaje al ganar premio:** ___________________________________
- **Aviso del sello diario:** ___________________________________ (ej.: «Jose, recuerda tu sello diario»)
- **Aviso de cumpleaños:** ___________________________________ (ej.: «Feliz cumpleaños, Jose García»)
- **Aviso de Navidad:** ___________________________________ (ej.: «Feliz Navidad, Jose. Recuerda que tu panadería favorita te está esperando»)

> Los avisos se escriben solos con nombre, apellidos y cumpleaños del alta; aquí solo puedes cambiar el tono.

## 4. Publicación (IMPORTANTE para el QR de instalar)

El QR **no guarda los archivos dentro**: guarda una URL. Al abrirla una vez, el Service Worker descarga y guarda los 22 archivos en el móvil del cliente; desde entonces funciona en modo avión.

- **¿Ya has publicado la carpeta?** [ ] Sí [ ] No
- Si sí, escribe la URL (solo para que yo pueda generarte los PNG impresibles):
  `https://______________________________/`
- Si no, **no pasa nada**: abre `duena.html` en tu URL final y la app genera el QR de instalar sola. El QR del sello no lleva URL.

> Sin HTTPS (o `localhost`) no funcionan el Service Worker ni la cámara. **Recomendado: GitHub Pages** (gratis, HTTPS y URL permanente). Netlify/Vercel sin cuenta caducan; reclama el sitio antes de imprimir. Ver `INSTRUCCIONES.md` apartado 1.

## 5. Entrega que quieres recibir

- [ ] ZIP con el proyecto personalizado
- [ ] QR de instalar en PNG (alta resolución, para imprimir)
- [ ] QR del sello en PNG (alta resolución, para imprimir)
- [ ] QR de reclamar premio en PNG (alta resolución, para imprimir)
- [ ] Cartelito listo para imprimir con logo + los 3 QRs (HTML/PNG)
- [ ] Iconos de la app generados a partir del logo

---

## Lo que yo hago con esto

1. Ajusto `index.html`, `cliente.html`, `duena.html`, `css/estilos.css`, manifiestos e iconos.
2. Genero los tres QRs con la URL y la configuración definitivas.
3. Actualizo `sw.js` (caché nueva) y `VERSION.md`.
4. Te devuelvo la carpeta + ZIP + QRs para que se lo pases a la dueña.
