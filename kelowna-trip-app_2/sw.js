/* 켈로나 여행수첩 — service worker */
const CACHE = "kel-v1";
const SHELL = ["./", "index.html", "style.css", "app.js", "config.js", "manifest.json", "icon-180.png", "icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // 데이터/API는 캐시하지 않음 (앱이 자체적으로 마지막 데이터를 저장함)
  if (url.hostname.includes("supabase") || url.hostname.includes("open-meteo") || url.hostname.includes("openstreetmap")) return;

  // 페이지 진입: 네트워크 우선, 실패 시 캐시 (업데이트가 씹히지 않게)
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put("index.html", copy));
        return res;
      }).catch(() => caches.match("index.html"))
    );
    return;
  }

  // 나머지 정적 리소스(폰트·leaflet 포함): 캐시 우선, 없으면 받아서 저장
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res.ok && (url.origin === location.origin || url.hostname.includes("fonts.g") || url.hostname.includes("unpkg") || url.hostname.includes("jsdelivr"))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      });
    })
  );
});
