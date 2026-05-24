const CACHE = 'flow-v5';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(wins => Promise.all(wins.map(w => w.navigate(w.url).catch(() => {}))))
  );
});

self.addEventListener('fetch', e => {
  const req = new Request(e.request, { cache: 'no-cache' });
  e.respondWith(
    fetch(req)
      .then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
