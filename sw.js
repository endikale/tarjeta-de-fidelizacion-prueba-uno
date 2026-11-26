/* Service Worker único para las dos PWAs: cache offline + avisos locales. */
const CACHE = 'fidelidad-v16';
const ASSETS = [
  './',
  './index.html',
  './cliente.html',
  './duena.html',
  './mostrador.html',
  './css/estilos.css',
  './manifest-cliente.json',
  './manifest-duena.json',
  './js/util.js',
  './js/db-cliente.js',
  './js/db-duena.js',
  './js/qr-scan.js',
  './js/qr-gen.js',
  './js/backup.js',
  './js/notif.js',
  './js/vendor/idb.umd.js',
  './js/vendor/qrcode.min.js',
  './js/vendor/html5-qrcode.min.js',
  './icons/cliente-192.png',
  './icons/cliente-512.png',
  './icons/duena-192.png',
  './icons/duena-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const peticion = event.request;
  if (peticion.method !== 'GET') return;
  const url = new URL(peticion.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(peticion).then((cacheada) => {
      if (cacheada) return cacheada;
      return fetch(peticion).then((respuesta) => {
        if (respuesta && respuesta.ok) {
          const copia = respuesta.clone();
          caches.open(CACHE).then((cache) => cache.put(peticion, copia));
        }
        return respuesta;
      });
    })
  );
});

/* Recordatorios: NO es push. Solo temporizadores dentro del SW. */
const temporizadores = {};

self.addEventListener('message', (event) => {
  const datos = event.data;
  if (!datos || !datos.tipo) return;

  if (datos.tipo === 'programar-notif') {
    const demora = Number(datos.cuando) - Date.now();
    if (demora > 0 && demora < 7 * 24 * 60 * 60 * 1000) {
      clearTimeout(temporizadores[datos.tag]);
      temporizadores[datos.tag] = setTimeout(() => {
        self.registration.showNotification(datos.titulo, {
          body: datos.cuerpo,
          icon: datos.icon || './icons/cliente-192.png',
          tag: datos.tag,
          data: { url: './cliente.html' }
        });
      }, demora);
    }
  }

  if (datos.tipo === 'cancelar-notif') {
    clearTimeout(temporizadores[datos.tag]);
    delete temporizadores[datos.tag];
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ventanas) => {
      for (const ventana of ventanas) {
        if (ventana.url.indexOf('cliente.html') !== -1) return ventana.focus();
      }
      return clients.openWindow('./cliente.html');
    })
  );
});
