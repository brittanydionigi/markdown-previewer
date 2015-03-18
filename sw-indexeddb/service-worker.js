importScripts('serviceworker-cache-polyfill.js');


self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('assets-v14').then(function(cache) {
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
  var swContext = self;

  var result = event.data.mdContent;
  var cmd = event.data.command;

  swContext.clients.matchAll().then(function(client) {
    client[0].postMessage({
      command: 'logMessage',
      error: null,
      message: 'hi there message here.'
    });
  });




  // If we want to save the current version, add a new record
  // in our mdFileHistory database 
  if (cmd === 'saveToIndexedDB') {
    self.clients.matchAll().then(function(client) {
      client[0].postMessage({
        command: 'logMessage',
        error: null,
        message: 'Trying to save to indexedDB...'
      });
    });

    var dbReq = indexedDB.open('mdFileHistory');

    dbReq.onsuccess = function(event) {
      swContext.clients.matchAll().then(function(client) {
        client[0].postMessage({
          command: 'logMessage',
          error: null,
          message: 'db opened from service worker'
        });
      });
      
      var db = event.target.result;
      var transaction = db.transaction(['mdFiles'], 'readwrite');

      transaction.oncomplete = function(event) {
        swContext.clients.matchAll().then(function(client) {
          client[0].postMessage({
            command: 'logMessage',
            error: null,
            message: 'transaction success'
          });
        });
      }
      transaction.onerror = function(event) {
        swContext.clients.matchAll().then(function(client) {
          client[0].postMessage({
            command: 'logMessage',
            error: null,
            message: 'transaction error'
          });
        });
      }

      var objectStore = transaction.objectStore("mdFiles");
      var objectStoreReq = objectStore.count();

      objectStoreReq.onsuccess = function(event) {
        swContext.clients.matchAll().then(function(client) {
          client[0].postMessage({
            command: 'logMessage',
            message: 'objectStore req success!'
          });
        });
      }

      objectStoreReq.onerror = function(event) {
        swContext.clients.matchAll().then(function(client) {
          client[0].postMessage({
            command: 'logMessage',
            message: 'objectStore req failure!'
          });
        });
      };
    };

    dbReq.onerror = function(event) {
      swContext.clients.matchAll().then(function(client) {
        client[0].postMessage({
          command: 'logMessage',
          error: null,
          message: 'db not opened from sw'
        });
      });
    };
  };
});
