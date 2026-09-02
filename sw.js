/* 菜價計算機 service worker
   ‧ index.html 網路優先 → 有網路自動更新,離線退回快取
   ‧ 其他資源快取優先 → 完全離線可用
   ‧ 改了 icon 或 manifest 時把 CACHE 版本號 +1 再 push */
const CACHE = 'vpc-v3';
const ASSETS = ['./','./index.html','./manifest.json','./icon-180.png','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate' || e.request.url.endsWith('index.html');
  if (isPage) {
    e.respondWith(fetch(e.request)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html'))));
  } else {
    e.respondWith(caches.match(e.request).then(hit => hit ||
      fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })));
  }
});
