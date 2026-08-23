/* 켈로나 여행수첩 — service worker */
const CACHE = "kel-v51";
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

  // 같은 사이트 파일(페이지·JS·CSS): 항상 네트워크 우선 → 새 버전 즉시 반영, 오프라인일 때만 캐시
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(e.request).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
        return res;
      }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html")))
    );
    return;
  }

  // 외부 정적 리소스(폰트·leaflet): 캐시 우선
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res.ok && (url.hostname.includes("fonts.g") || url.hostname.includes("unpkg") || url.hostname.includes("jsdelivr"))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      });
    })
  );
});


/* ---------- 푸시 알림 ---------- */
self.addEventListener("push", (e) => {
  let d = { title: "켈로나 여행수첩", body: "새 교신", tag: "kel" };
  try { if (e.data) d = Object.assign(d, e.data.json()); } catch (err) { try { d.body = e.data.text(); } catch (e2) {} }
  e.waitUntil(self.registration.showNotification(d.title, {
    body: d.body,
    tag: d.tag,
    icon: "icon-180.png",
    badge: "icon-180.png",
    vibrate: [60, 40, 60],
    renotify: true,
    data: { url: "./" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ("focus" in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});


self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});
