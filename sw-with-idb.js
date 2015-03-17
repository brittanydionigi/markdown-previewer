// importScripts('serviceworker-cache-polyfill.js');

// self.addEventListener('install', function(event) {
//   event.waitUntil(
//     caches.open('assets-v14').then(function(cache) {
//       return cache.addAll([
//         'style.css',
//         'markdown-it.js'
//       ]);
//     })
//   );
// });


self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});


self.addEventListener('message', function(event) {
  var result = event.data.mdContent;
  var swContext = self;
  console.log("Command: ", event);
  var cmd = event.data.command;
  self.clients.matchAll().then(function(client) {
    client[0].postMessage({
      command: 'logMessage',
      error: null,
      message: { 'context': swContext, 'message': 'hi there message here!!!!!' }
    });
  });




  // If we want to save the current version, add a new record
  // in our mdFileHistory database 
  if (cmd === 'saveToIndexedDB') {
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
        console.log("Transaction completed!");
        swContext.clients.matchAll().then(function(client) {
          client[0].postMessage({
            command: 'logMessage',
            error: null,
            message: 'rawr transaction complete'
          });
        });
      }
      transaction.onerror = function(event) {
        console.log("Transaction error! ", transaction.error);
        swContext.clients.matchAll().then(function(client) {
          client[0].postMessage({
            command: 'logMessage',
            error: null,
            message: event
          });
        });
      }

      var objectStore = transaction.objectStore("mdFiles");
      var objectStoreReq = objectStore.add({ 
        fileName: 'YOWHATUP-' + Date.now(),
        authorName: 'brittany',
        htmlContent: result
      });

      objectStoreReq.onsuccess = function(event) {
        console.log("Object store item added!");
        swContext.clients.matchAll().then(function(client) {
          console.log("Hello? ", client);
          client[0].postMessage({
            command: 'logMessage',
            message: 'hello there'
          });
        });
      }
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
