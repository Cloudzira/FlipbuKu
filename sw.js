/* FlipbuKu Service Worker
 * - App shell (index.html, styles.css, app.js, ikon, manifest) disimpan agar aplikasi cepat dibuka & tetap tampil saat offline.
 * - File inti (html/css/js) memakai "jaringan dulu": setiap ada versi baru di hosting, langsung terpakai.
 *   Cache hanya jadi cadangan saat offline.
 * - Library CDN (Tailwind, FontAwesome, Google Fonts, PDF.js, StPageFlip, Supabase JS) di-cache saat pertama dipakai.
 * - Data Supabase, file PDF, dan panel Al-Quran TIDAK di-cache (selalu langsung ke jaringan).
 * Ubah VERSION setiap kali Anda mengunggah perubahan besar supaya cache lama dibuang.
 */
const VERSION = 'v5';
const SHELL_CACHE = 'flipbuku-shell-' + VERSION;
const CDN_CACHE = 'flipbuku-cdn-' + VERSION;

const SHELL_FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icon-32.png',
  './icon-64.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

const CDN_HOSTS = [
  'cdn.tailwindcss.com',
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// File yang harus selalu terbaru (jaringan dulu)
const FRESH_FIRST = /\.(?:html|css|js|webmanifest|json)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      // cache:'reload' = ambil langsung dari server, bukan dari cache browser yang mungkin masih lama
      .then((cache) => Promise.all(SHELL_FILES.map((f) => cache.add(new Request(f, { cache: 'reload' })).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('flipbuku-') && k !== SHELL_CACHE && k !== CDN_CACHE)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 1) File milik FlipbuKu sendiri
  if (url.origin === self.location.origin) {
    const isNav = req.mode === 'navigate';
    const fresh = isNav || url.pathname.endsWith('/') || FRESH_FIRST.test(url.pathname);

    if (fresh) {
      // Jaringan dulu (selalu cek versi terbaru ke server), cadangan dari cache saat offline
      event.respondWith(
        fetch(new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' }))
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(SHELL_CACHE).then((c) => c.put(isNav ? './index.html' : req, copy));
            }
            return res;
          })
          .catch(() =>
            caches.match(isNav ? './index.html' : req).then((r) => r || (isNav ? caches.match('./') : undefined))
          )
      );
      return;
    }

    // Gambar/ikon: cache dulu, perbarui di belakang layar
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // 2) Library & font dari CDN: cache dulu, perbarui di belakang layar
  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.open(CDN_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          const network = fetch(req)
            .then((res) => {
              if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
              return res;
            })
            .catch(() => cached);
          return cached || network;
        })
      )
    );
    return;
  }

  // 3) Lainnya (Supabase, PDF, Al-Quran, dll): langsung ke jaringan, tanpa cache
});
