var CACHE_NAME = 'code-step-v3';
var STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icon.svg',
  '/manifest.json'
];

// インストール時: 静的アセットをキャッシュ
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// アクティベート時: 古いキャッシュを削除
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k)   { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// プッシュ通知受信
self.addEventListener('push', function(event) {
  var data = event.data ? event.data.json() : {};
  var title = data.title || 'CODE STEP';
  var body  = data.body  || '学習を再開しましょう！';
  var icon  = data.icon  || '/icon.svg';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
      badge: icon,
      data: { url: data.url || '/' }
    })
  );
});

// 通知クリックでアプリを開く
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var target = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.includes(self.location.origin)) {
          return list[i].focus();
        }
      }
      return clients.openWindow(target);
    })
  );
});

// フェッチ: 同一オリジンはキャッシュ優先、外部はネットワーク
self.addEventListener('fetch', function(event) {
  if (!event.request.url.startsWith(self.location.origin)) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      var networkFetch = fetch(event.request).then(function(res) {
        if (res && res.status === 200) {
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(event.request, clone); });
        }
        return res;
      });
      // キャッシュがあれば即返しつつバックグラウンドで更新
      return cached || networkFetch;
    })
  );
});
