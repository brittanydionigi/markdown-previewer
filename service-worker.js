importScripts('serviceworker-cache-polyfill.js');

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('assets-v15').then(function(cache) {
      return cache.addAll([
        'style.css',
        'markdown-it.js'
      ]);
    })
  );
});


self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});


self.addEventListener('message', function(event) {
  self.clients.matchAll().then(function(client) {
    client[0].postMessage({
      message: 'hi there message here!!!'
    });
  });
});
