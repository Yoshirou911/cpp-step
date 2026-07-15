var CACHE_NAME = 'code-step-v5';
var STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// インストール時: 静的アセットをキャッシュ
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
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

// フェッチ: script.js/style.css/index.html はネットワーク優先、その他はキャッシュ優先
var NETWORK_FIRST = ['/script.js', '/style.css', '/index.html', '/'];

self.addEventListener('fetch', function(event) {
  if (!event.request.url.startsWith(self.location.origin)) return;
  if (event.request.method !== 'GET') return;

  var path = new URL(event.request.url).pathname;
  var isNetworkFirst = NETWORK_FIRST.indexOf(path) >= 0;

  if (isNetworkFirst) {
    event.respondWith(
      fetch(event.request).then(function(res) {
        if (res && res.status === 200) {
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(event.request, clone); });
        }
        return res;
      }).catch(function() {
        return caches.match(event.request);
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        var networkFetch = fetch(event.request).then(function(res) {
          if (res && res.status === 200) {
            var clone = res.clone();
            caches.open(CACHE_NAME).then(function(c) { c.put(event.request, clone); });
          }
          return res;
        });
        return cached || networkFetch;
      })
    );
  }
});
