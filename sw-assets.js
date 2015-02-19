// Chrome's currently missing some useful cache methods,
// this polyfill adds them.
// importScripts('serviceworker-cache-polyfill.js');

// Here comes the install event!
// This only happens once, when the browser sees this
// version of the ServiceWorker for the first time.
self.addEventListener('install', function(event) {
  console.log("WHAT: ", this.keys);
  // We pass a promise to event.waitUntil to signal how 
  // long install takes, and if it failed
  event.waitUntil(
    // We open a cache…
    // caches.open('assets-v3').then(function(cache) {
    //   // And add resources to it
    //   return cache.addAll([
    //     './',
    //     'style.css',
    //     'app.js',
    //     // Cache resources can be from other origins.
    //     // This is a no-cors request, meaning it doesn't need
    //     // CORS headers to be stored in the cache
    //     new Request('https://i.imgur.com/14JiQmL.jpg', {mode: 'no-cors'})
    //   ]);
    // })
  );
});

self.addEventListener('message', function(event) {
  console.log('Handling message event:', event.data);
  var dbReq = indexedDB.open('markdownHistory');
  dbReq.onsuccess = function(event) {
    var db = event.target.result;
    var transaction = db.transaction(['markdownHistory'], 'readwrite');
    transaction.oncomplete = function() {
      console.log("Transaction completed!");
    }
    transaction.onerror = function() {
      console.log("Transaction error! ", transaction.error);
    }

    var objectStore = transaction.objectStore("markdownHistory");
    console.log("Index Names: ", objectStore.indexNames);

    var objectStoreReq = objectStore.add({ mdFileName: 'hellothere', authorName: 'brittany' });
    objectStoreReq.onsuccess = function(event) {
      console.log("Object store item added!");
    }
  };
  console.log("WHAT THIS: ", typeof self);
});

// The fetch event happens for the page request with the
// ServiceWorker's scope, and any request made within that
// page
self.addEventListener('fetch', function(event) {
  console.log("FETCH: ", event);
//   if (/\.jpg$/.test(event.request.url)) {
//   event.respondWith(fetch('trollface.svg'));
//   return;
// }
  // Calling event.respondWith means we're in charge
  // of providing the response. We pass in a promise
  // that resolves with a response object
  // event.respondWith(
  //   // First we look for something in the caches that
  //   // matches the request
  //   caches.match(event.request).then(function(response) {

  //     // If no response & offline & request URL is hosted asset, provide fallback

  //     // If we get something, we return it, otherwise
  //     // it's null, and we'll pass the request to
  //     // fetch, which will use the network.
  //     return response || fetch(event.request);
  //   })
  // );
});
