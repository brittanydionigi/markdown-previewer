importScripts('../lib/serviceworker-cache-polyfill.js');


self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('assets-v14').then(function(cache) {
      return cache.addAll([
        '../css/style.css',
        '../lib/markdown-it.js'
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
  var swContext = self;

  var result = event.data.mdContent;
  var cmd = event.data.command;

  console.log("HELLO: ", cmd, result);

  // If we want to save the current version, add a new record
  // in our mdFileHistory database 
  if (cmd === 'saveToIndexedDB') {
    self.clients.matchAll().then(function(client) {
      client[0].postMessage({
        command: 'logMessage',
        message: 'Service Worker received message. Trying to save to IndexedDB...'
      });
    });

    var dbReq = indexedDB.open('mdFileHistory');

    dbReq.onsuccess = function(event) {
      swContext.clients.matchAll().then(function(client) {
        client[0].postMessage({
          command: 'logMessage',
          message: 'DB opened from service worker'
        });
      });
      
      var db = event.target.result;
      var transaction = db.transaction(['mdFiles'], 'readwrite');

      transaction.oncomplete = function(event) {
        swContext.clients.matchAll().then(function(client) {
          client[0].postMessage({
            command: 'logMessage',
            message: 'transaction success'
          });
        });
      }
      transaction.onerror = function(event) {
        swContext.clients.matchAll().then(function(client) {
          client[0].postMessage({
            command: 'logMessage',
            message: 'transaction error'
          });
        });
      }

      var objectStore = transaction.objectStore("mdFiles");
      var objectStoreReq = objectStore.add({ 
        fileName: 'MarkdownFileName-' + Date.now(),
        authorName: 'Brittany Storoz',
        markdownContent: result
      });

      objectStoreReq.onsuccess = function(event) {
        swContext.clients.matchAll().then(function(client) {
          client[0].postMessage({
            command: 'logMessage',
            message: 'objectStore request succeeded'
          });
        });
      }

      objectStoreReq.onerror = function(event) {
        swContext.clients.matchAll().then(function(client) {
          client[0].postMessage({
            command: 'logMessage',
            message: 'objectStore request failed'
          });
        });
      };
    };

    dbReq.onerror = function(event) {
      swContext.clients.matchAll().then(function(client) {
        client[0].postMessage({
          command: 'logMessage',
          message: 'DB not opened from sw'
        });
      });
    };
  };
});
