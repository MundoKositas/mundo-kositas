const CACHE = 'mundokositas-v1';
const ARCHIVOS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap'
];

// Instalar y guardar en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ARCHIVOS))
  );
  self.skipWaiting();
});

// Activar y limpiar cachés viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia: Network first, caché de respaldo
self.addEventListener('fetch', e => {
  // Solo manejar GET
  if (e.request.method !== 'GET') return;

  // Firebase y APIs externas: solo network
  if (e.request.url.includes('firebaseapp') ||
      e.request.url.includes('googleapis.com/firestore') ||
      e.request.url.includes('identitytoolkit')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Guardar copia en caché
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
