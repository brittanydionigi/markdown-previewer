importScripts('markdown-it.js');

function syncLivePreview() {
  self.addEventListener('message', function(event) {

    var md = markdownit();
    var result = md.render(event.data.mdContent);

    // If we're just updating the live preview, send the converted
    // HTML result back to the page to populate the preview div
    if (event.data.command === 'updatePreview') {
      self.postMessage({
        'command': 'updatePreview',
        'htmlResult': result
      });
    }
  }, false)
}

syncLivePreview();
