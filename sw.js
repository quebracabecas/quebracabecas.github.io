const cacheName = "site-static-v1";
const assets = [
  "https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400&display=swap"
];

function addImagesToCache(request) {
    if (request.destination === "image" && (
        request.url.includes('quebracabecas.github.io') ||
        request.url.includes('localhost') ||
        request.url.includes('127.0.0.1')
    )) {
        return caches.open(cacheName)
            .then((cache) => cache.match(request)
                .then((res) => {
                    if (res) return res;
                    return fetch(request.clone())
                        .then((res) => {
                            if (res.type !== "opaque" && res.ok === false) {
                                throw new Error( "Resource not available" );
                            }
                            cache.put(request, res.clone());
                            return res;
                        });
                })
            );
    } else {
        return fetch(request);
    }
}

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(cacheName)
      .then(cache => {cache.addAll(assets);})
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== cacheName)
        .map(key => caches.delete(key))
    ))
  )
});

self.addEventListener("fetch", e => {
  const { request } = e;
  if (request.method === "POST") return;
  return e.respondWith(caches.match(request).then(res => res || addImagesToCache(request)));
});