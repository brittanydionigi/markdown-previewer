importScripts('serviceworker-cache-polyfill.js');
importScripts('markdown-it.min.js');

// Here comes the install event!
// This only happens once, when the browser sees this
// version of the ServiceWorker for the first time.
self.addEventListener('install', function(event) {
  // We pass a promise to event.waitUntil to signal how 
  // long install takes, and if it failed
  event.waitUntil(
    // We open a cache…
    caches.open('assets-v8').then(function(cache) {
      // And add resources to it
      return cache.addAll([
        'style.css',
        'app.js'
        // Cache resources can be from other origins.
        // This is a no-cors request, meaning it doesn't need
        // CORS headers to be stored in the cache
        // new Request('https://i.imgur.com/14JiQmL.jpg', {mode: 'no-cors'})
      ]);
    })
  );
});

self.addEventListener('message', function(event) {
  var md = self.markdownit();
  var result = md.render(event.data.mdContent);

  // If we're just updating the live preview, send the converted
  // HTML result back to the page to populate the preview div
  if (event.data.command === 'updatePreview') {
    event.ports[0].postMessage({
        error: null,
        htmlResult: result
      });
  }

  // If we want to save the current version, add a new record
  // in our mdFileHistory database 
  else if (event.data.command === 'saveToIndexedDB') {
    var dbReq = indexedDB.open('mdFileHistory');

    dbReq.onsuccess = function(event) {
      var db = event.target.result;
      var transaction = db.transaction(['mdFiles'], 'readwrite');
      transaction.oncomplete = function() {
        console.log("Transaction completed!");
      }
      transaction.onerror = function() {
        console.log("Transaction error! ", transaction.error);
      }

      var objectStore = transaction.objectStore("mdFiles");

      var objectStoreReq = objectStore.add({ 
        fileName: 'YOWHATUP-' + Date.now(),
        authorName: 'brittany',
        htmlContent: result
      });

      objectStoreReq.onsuccess = function(event) {
        console.log("Object store item added!");
      }
    };
  }

});

// The fetch event happens for the page request with the
// ServiceWorker's scope, and any request made within that
// page
self.addEventListener('fetch', function(event) {
  // Calling event.respondWith means we're in charge
  // of providing the response. We pass in a promise
  // that resolves with a response object
  event.respondWith(
    // First we look for something in the caches that
    // matches the request
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
