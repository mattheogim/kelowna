/* 켈로나 여행수첩 — app.js */
"use strict";

/* ---------------- 기본 도구 ---------------- */
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const byId = Object.fromEntries(MEMBERS.map((m) => [m.id, m]));
const nameOf = (id) => (id && byId[id] ? byId[id].name : id ? id : "수첩");
const colorOf = (id) => (id && byId[id] ? byId[id].color : "#8D8577");
const avatarOf = (id) => (id && byId[id] && byId[id].avatar ? byId[id].avatar : "📓");
const av = (id, cls) => '<span class="av ' + (cls || "") + '" style="border-color:' + colorOf(id) + '">' + avatarOf(id) + "</span>";
const money = (n) => "$" + (Math.round(n * 100) / 100).toFixed(2);
const pad = (n) => String(n).padStart(2, "0");
const CAT_EMOJI = { "와이너리": "🍷", "음식": "🍽️", "액티비티": "🏞️", "기타": "📌" };
const QUICK_PHRASES = ["📢 어디십니까", "📍 위치를 보내라", "👌 콜", "🚗 지금 출발함", "⏱️ 5분 안에 감", "🍚 밥은?"];
const REACT_EMOJI = ["🫡", "👍", "😂"];
const WINERIES = [
  { n: "Quails' Gate", lat: 49.848, lng: -119.556 },
  { n: "Beaumont Family Estates", lat: 49.828, lng: -119.523 },
  { n: "Little Straw", lat: 49.8253, lng: -119.532 },
  { n: "Volcanic Hills", lat: 49.8268, lng: -119.5308 },
  { n: "Mt. Boucherie", lat: 49.845, lng: -119.556 },
  { n: "Kalala", lat: 49.8657, lng: -119.6335 },
  { n: "Off the Grid", lat: 49.8686, lng: -119.642 },
];
const COSTCO = { n: "코스트코 켈로나", lat: 49.8829, lng: -119.4266 };
const REST_STOPS = [
  { n: "호프 — 주유·간식", lat: 49.3792, lng: -121.4419, q: "Hope BC" },
  { n: "Britton Creek 휴게소", lat: 49.596, lng: -120.868, q: "Britton Creek Rest Area" },
  { n: "메리트 — 마지막 큰 정류", lat: 50.1113, lng: -120.7862, q: "Merritt BC" },
];
const WAYPOINTS = [
  { lat: 49.2831, lng: -122.8317 }, { lat: 49.3792, lng: -121.4419 },
  { lat: 49.596, lng: -120.868 }, { lat: 50.1113, lng: -120.7862 },
  { lat: 49.8625, lng: -119.5833 },
];
function gmapUrl(q) { return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q); }
function placeQuery(title) {
  const t = title || "";
  const w = WINERIES.find((x) => t.indexOf(x.n) >= 0);
  if (w) return w.n + " Winery West Kelowna";
  if (/코스트코/.test(t)) return "Costco Kelowna BC";
  if (/숙소/.test(t)) return "9995 McCulloch Rd Kelowna BC";
  if (/West Kelowna/.test(t)) return "West Kelowna BC";
  if (/포트무디/.test(t)) return "Port Moody BC";
  return null;
}
function placeCoord(title) {
  const t = title || "";
  const w = WINERIES.find((x) => t.indexOf(x.n) >= 0);
  if (w) return { n: w.n, lat: w.lat, lng: w.lng };
  if (/코스트코/.test(t)) return COSTCO;
  if (/숙소/.test(t)) return { n: "숙소", lat: cabinLat(), lng: cabinLng() };
  if (/West Kelowna/.test(t)) return { n: "West Kelowna", lat: 49.8625, lng: -119.5833 };
  return null;
}

const MISSIONS = [
  { e: "🍷", t: "와이너리 4곳 정복" },
  { e: "🍽️", t: "Old Vines 점심" },
  { e: "🛒", t: "코스트코 클리어" },
  { e: "🏠", t: "숙소 도착" },
  { e: "🌊", t: "호수 입수" },
  { e: "🛶", t: "카약·패들보드" },
  { e: "♨️", t: "핫텁" },
  { e: "🔥", t: "캠프파이어" },
  { e: "📸", t: "단체사진" },
  { e: "⭐", t: "별 보기" },
];

async function copyText(t, label) {
  try { await navigator.clipboard.writeText(t); toast((label || "") + " 복사됨"); }
  catch (e) { prompt("길게 눌러서 복사해", t); }
}
function bindCopies(scope) {
  $$(".cp", scope).forEach((b) => b.onclick = () => copyText(b.dataset.copy, b.dataset.lb));
}

function todayStr(d) { const x = d || new Date(); return x.getFullYear() + "-" + pad(x.getMonth() + 1) + "-" + pad(x.getDate()); }
function hm(d) { return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
function relTime(iso) {
  const t = new Date(iso), diff = (Date.now() - t.getTime()) / 60000;
  if (diff < 1) return "방금";
  if (diff < 60) return Math.floor(diff) + "분 전";
  if (todayStr(t) === todayStr()) return hm(t);
  return (t.getMonth() + 1) + "/" + t.getDate() + " " + hm(t);
}
let lastToast = { msg: "", ts: 0 };
function toast(msg) {
  if (msg === lastToast.msg && Date.now() - lastToast.ts < 2500) return;
  lastToast = { msg, ts: Date.now() };
  const el = document.createElement("div");
  el.className = "toast"; el.textContent = msg;
  $("#toasts").appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ---------------- 상태 ---------------- */
const store = {
  itinerary: [], polls: [], votes: [], expenses: [], checkins: [],
  wishes: [], wishLikes: [], shopping: [],
  wineRatings: [], reactions: [],
  settings: {}, loadedAt: null,
};
let sb = null;
let me = localStorage.getItem("kel_me") || "";
let currentTab = "home";
let planDay = null;
const maps = {};
let lastPos = null;
let modeOverride = "";
let alertLog = JSON.parse(localStorage.getItem("kel_alerts") || "[]");
let lastSend = 0;
function inkDrying() {
  if (Date.now() - lastSend < 3000) { toast("🖋️ 잉크 마르는 중… 잠깐만"); return true; }
  lastSend = Date.now();
  return false;
}
let queue = JSON.parse(localStorage.getItem("kel_queue") || "[]");

/* 데모(키 없음)용 — schema.sql 시드와 동일 */
const DEMO_ITINERARY = [
  ["2026-08-20","07:30","포트무디 집결","희정이네. 재형 7:30까지. 안 가는 차는 여기 주차",10],
  ["2026-08-20","08:00","출발","A조 4명 / B조 2명(상우·다흰, 랭리 출발)",20],
  ["2026-08-20","12:40","West Kelowna 도착","",30],
  ["2026-08-20","13:00","Quails' Gate — Old Vines 점심","희정 1픽. 6명 점심 예약 확인 필수",40],
  ["2026-08-20","15:00","Beaumont Family Estates","희정 2픽 · 상우 요청",50],
  ["2026-08-20","16:30","Little Straw","상우 2픽",60],
  ["2026-08-20","17:30","4번째 — 그날 기분따라","Volcanic Hills / Mt. Boucherie. 같은 동네라 둘 다 가도 됨",70],
  ["2026-08-20","18:30","코스트코","다흰 카드. 마감 시간 확인",80],
  ["2026-08-20","20:05","숙소 도착","Hwy 33으로만 진입! 도어코드는 정보 탭",90],
  ["2026-08-21","","프리 데이","뭘 할지는 아래 제안 보드에서",10],
  ["2026-08-21","오후","캐빈 · 호수","카약 / 패들보드 / 핫텁",20],
  ["2026-08-21","저녁","저녁 + 캠프파이어(?)","파이어밴 확인 후",30],
  ["2026-08-22","10:00","체크아웃","정화조 · 쓰레기 정리",10],
  ["2026-08-22","낮","귀가","원하면 가는 길에 한 곳",20],
].map((r, i) => ({ id: -1 - i, day: r[0], t: r[1], title: r[2], note: r[3], sort: r[4] }));
const DEMO_WISHES = ["Kalala Organic Estate|와이너리", "Off the Grid Organic Winery|와이너리", "다운타운에서 점심|음식", "늦잠 + 호수 (카약·패들보드)|액티비티", "체리 · 과일 U-pick|액티비티", "저녁 캠프파이어 (파이어밴 확인)|액티비티"]
  .map((s, i) => { const p = s.split("|"); return { id: -1 - i, member: null, title: p[0], category: p[1], created_at: new Date().toISOString() }; });

/* ---------------- 설치 유도 ---------------- */
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredPrompt = e; showInstall(); });
function isStandalone() {
  return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;
}
function showInstall() {
  const b = $("#install-banner");
  if (!b || isStandalone() || localStorage.getItem("kel_a2hs")) return;
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isKakao = /KAKAOTALK/i.test(ua);
  let inner = "";
  if (isKakao) {
    inner = '📲 카톡 브라우저에선 앱 설치가 안 돼 — <button class="btn small" id="open-safari">Safari로 열기</button>';
  } else if (deferredPrompt) {
    inner = '📲 홈 화면에 앱으로 설치 가능 — <button class="btn small" id="do-install">설치</button>';
  } else if (isIOS && /CriOS|FxiOS|EdgiOS/i.test(ua)) {
    inner = '📲 앱으로 설치 가능 — <button class="btn small" id="ig-open">크롬에서 하는 법</button>';
  } else if (isIOS) {
    inner = '📲 앱처럼 설치하면 전체화면 + 아이콘 생김 — <button class="btn small" id="ig-open">방법 보기</button>';
  } else if (/Chrome|Edg/i.test(ua)) {
    inner = '📲 주소창 오른쪽 <b>설치 아이콘</b>(⊕)을 누르면 앱으로 설치돼 — <button class="btn small" id="ig-open">자세히</button>';
  } else return;
  b.innerHTML = inner + '<button class="ib-x" id="ib-close" aria-label="닫기">✕</button>';
  b.hidden = false;
  $("#ib-close").onclick = () => { localStorage.setItem("kel_a2hs", "1"); b.hidden = true; };
  const os = $("#open-safari");
  if (os) os.onclick = () => { location.href = "kakaotalk://web/openExternal?url=" + encodeURIComponent(location.href); };
  const di = $("#do-install");
  if (di) di.onclick = () => { if (!deferredPrompt) return; deferredPrompt.prompt(); deferredPrompt = null; b.hidden = true; };
  const ig = $("#ig-open");
  if (ig) ig.onclick = () => { fillInstallGuide(); $("#install-modal").hidden = false; };
}

/* ---------------- 여행 단계 ---------------- */
function phase() {
  const t = todayStr();
  if (t < TRIP.start) return "before";
  if (t > TRIP.end) return "after";
  return "during";
}
function phaseLabel() {
  const p = phase();
  if (p === "before") {
    const d = Math.ceil((new Date(TRIP.start + "T00:00:00") - new Date()) / 86400000);
    return d <= 0 ? "출발일!" : "D-" + d;
  }
  if (p === "during") {
    const idx = TRIP.days.findIndex((d) => d.date === todayStr());
    return idx >= 0 ? (idx + 1) + "일차 · " + TRIP.days[idx].label + "요일" : "여행 중";
  }
  return "여행 끝 — 정산의 시간";
}
function dayTheme() {
  const d = TRIP.days.find((x) => x.date === todayStr());
  return d ? d.theme : "#7C2E3E";
}

/* ---------------- Supabase + 송신 큐 ---------------- */
function initSb() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) { $("#nokey-banner").hidden = false; return; }
  try { sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); }
  catch (e) { console.error(e); toast("Supabase 연결 실패 — config.js 확인"); }
}
function needSb() { if (!sb) { toast("config.js에 Supabase 키부터 넣어줘"); return true; } return false; }

function saveQ() { localStorage.setItem("kel_queue", JSON.stringify(queue)); }

/* 신호 없으면 큐에 쌓고, 잡히면 자동 송신 — 무전기 방식 */
async function qInsert(table, row) {
  if (!sb) { toast("config.js에 Supabase 키부터 넣어줘"); return false; }
  try {
    const { error } = await sb.from(table).insert(row);
    if (error) throw error;
    return true;
  } catch (e) {
    queue.push({ table, row }); saveQ();
    toast("📻 신호 없음 — 잡히는 순간 자동 송신할게");
    return "queued";
  }
}
async function flushQueue() {
  if (!sb || !queue.length || !navigator.onLine) return;
  const pending = queue; queue = []; saveQ();
  let sent = 0;
  for (const it of pending) {
    try { const { error } = await sb.from(it.table).insert(it.row); if (error) throw error; sent++; }
    catch (e) { queue.push(it); }
  }
  saveQ();
  if (sent) { toast("📻 밀렸던 송신 " + sent + "건 전송 완료"); loadAll(); }
}

let loadTimer = null, loading = false, pendingLoad = false;
function scheduleLoad() { clearTimeout(loadTimer); loadTimer = setTimeout(loadAll, 600); }

async function loadAll() {
  if (loading) { pendingLoad = true; return; }
  loading = true;
  try {
  if (!sb) {
    store.itinerary = DEMO_ITINERARY;
    store.wishes = DEMO_WISHES;
    restoreMirror(true);
    rerender();
    return;
  }
  try {
    const [it, po, vo, ex, ch, wi, wl, sh, wr, rx, se] = await Promise.all([
      sb.from("itinerary").select("*").order("day").order("sort"),
      sb.from("polls").select("*").order("created_at", { ascending: false }),
      sb.from("votes").select("*"),
      sb.from("expenses").select("*").order("created_at", { ascending: false }),
      sb.from("checkins").select("*").order("created_at", { ascending: false }).limit(300),
      sb.from("wishes").select("*").order("created_at"),
      sb.from("wish_likes").select("*"),
      sb.from("shopping").select("*").order("created_at"),
      sb.from("wine_ratings").select("*").order("created_at", { ascending: false }),
      sb.from("reactions").select("*"),
      sb.from("settings").select("*"),
    ]);
    const bad = [it, po, vo, ex, ch, wi, wl, sh, wr, rx, se].find((r) => r.error);
    if (bad) throw bad.error;
    store.itinerary = it.data; store.polls = po.data; store.votes = vo.data;
    store.expenses = ex.data; store.checkins = ch.data;
    store.wishes = wi.data; store.wishLikes = wl.data; store.shopping = sh.data;
    store.wineRatings = wr.data; store.reactions = rx.data;
    store.settings = Object.fromEntries(se.data.map((r) => [r.key, r.value]));
    store.loadedAt = Date.now();
    localStorage.setItem("kel_mirror", JSON.stringify(store));
    $("#offline-banner").hidden = true;
  } catch (e) {
    console.error(e);
    restoreMirror(false);
  }
  rerender();
  } finally {
    loading = false;
    if (pendingLoad) { pendingLoad = false; scheduleLoad(); }
  }
}

function restoreMirror(silent) {
  const m = localStorage.getItem("kel_mirror");
  if (m) {
    try { Object.assign(store, JSON.parse(m)); $("#offline-banner").hidden = false; return; } catch (e) {}
  }
  if (!silent) $("#offline-banner").hidden = false;
}

/* ---------------- 실시간 + 알림 ---------------- */
function subscribe() {
  if (!sb) return;
  const ch = sb.channel("kel-live");
  ["checkins", "expenses", "polls", "votes", "itinerary", "wishes", "wish_likes", "shopping", "wine_ratings", "reactions", "sirens", "settings"].forEach((t) => {
    ch.on("postgres_changes", { event: "*", schema: "public", table: t }, (p) => onLive(t, p));
  });
  ch.subscribe();
}

function onLive(table, payload) {
  scheduleLoad();
  if (payload.eventType !== "INSERT") return;
  const r = payload.new || {};
  if (table === "sirens") { emergency(); return; }
  if (table === "reactions") return;
  if (table === "settings") {
    const r2 = payload.new || {};
    if (r2.key === "current_dest" && r2.value) {
      try {
        const d = JSON.parse(r2.value);
        if (d && d.n && d.by !== me) {
          toast("🧭 다음 목적지: " + d.n + (d.by ? " (" + nameOf(d.by) + ")" : ""));
          pushAlert("🧭 다음 목적지: " + d.n);
          if (currentTab !== "home") badge("home", true);
        }
      } catch (e) {}
    }
    return;
  }
  const actor = r.member || r.payer || r.added_by || r.created_by || "";
  if (actor === me) return;
  let msg = "", tab = "";
  if (table === "checkins") { msg = "📻 " + nameOf(actor) + " — " + r.place + (r.note ? " · " + r.note : ""); tab = "stamp"; if (r.audio) beep(); }
  if (table === "expenses") { msg = nameOf(actor) + "가 장부에 적음: " + r.title + " " + money(Number(r.amount)); tab = "ledger"; }
  if (table === "polls") { msg = "새 투표: " + r.question; tab = "home"; }
  if (table === "itinerary") { msg = "일정 추가됨: " + r.title; tab = "plan"; }
  if (table === "wishes") { msg = "금요일 제안: " + r.title; tab = "plan"; }
  if (table === "shopping") { msg = "장보기 추가: " + r.item; tab = "ledger"; }
  if (table === "wine_ratings") { msg = "🍷 " + nameOf(actor) + " — " + r.winery + " ★" + r.stars; tab = "plan"; }
  if (!msg) return;
  toast(msg);
  pushAlert(msg);
  if (tab && tab !== currentTab) badge(tab, true);
}

function pushAlert(msg) {
  alertLog.unshift({ msg, ts: new Date().toISOString() });
  alertLog = alertLog.slice(0, 50);
  localStorage.setItem("kel_alerts", JSON.stringify(alertLog));
  $("#bell-dot").hidden = false;
}
function badge(tab, on) {
  const b = $('#tabbar .tb[data-tab="' + tab + '"] .tb-dot');
  if (b) b.hidden = !on;
}

/* ---------------- 탭 ---------------- */
function switchTab(tab) {
  currentTab = tab;
  $$("#tabbar .tb").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  $$(".tab").forEach((s) => s.classList.toggle("active", s.id === "tab-" + tab));
  badge(tab, false);
  renderTab(tab);
  window.scrollTo(0, 0);
}

/* ---------------- 홈 ---------------- */
function timeKey(r) {
  const t = (r.t || "").trim();
  if (!t) return 5 + (r.sort || 0) / 1000;
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  const fuzzy = { "새벽": 300, "아침": 480, "오전": 540, "점심": 720, "낮": 730, "오후": 840, "저녁": 1080, "밤": 1260 };
  for (const k in fuzzy) if (t.indexOf(k) >= 0) return fuzzy[k];
  return 720 + (r.sort || 0) / 1000;
}
function itemsFor(day) {
  return store.itinerary.filter((r) => r.day === day).slice()
    .sort((a, b) => timeKey(a) - timeKey(b) || (a.sort || 0) - (b.sort || 0));
}
function nowAndNext() {
  const items = itemsFor(todayStr());
  const timed = items.filter((r) => /^\d{1,2}:\d{2}/.test((r.t || "").trim()));
  const nowK = new Date().getHours() * 60 + new Date().getMinutes();
  let cur = null, next = null;
  for (const r of timed) { if (timeKey(r) <= nowK) cur = r; else { next = r; break; } }
  if (!cur && timed.length) next = timed[0];
  return { cur, next };
}

function ddayStampHtml() {
  const d = Math.max(0, Math.ceil((new Date(TRIP.start + "T08:00:00") - new Date()) / 86400000));
  return '<div class="stamp dday-stamp" style="--c:var(--wine);--rot:8deg"><span class="s-place">D-' + d + '</span><span class="s-when">8/20 목 8:00</span></div>';
}
function heroBeforeHtml() {
  return '<div class="hero card" style="position:relative">' +
    '<div id="home-map" class="hero-map map-paper"></div>' + ddayStampHtml() +
    '<button class="hero-cap" id="hero-go">포트무디 → West Kelowna → Hydraulic Lake</button></div>';
}
function heroLiveHtml() {
  const latest = latestByMember();
  const seen = MEMBERS.filter((m) => latest[m.id]).length;
  const night = isNight();
  let inner = eyebrow(night ? "🌙" : "🏕️", "지금 · 캐빈", hm(new Date()));
  inner += '<div class="band-title">' + (night ? "밤의 Hydraulic Lake" : "Hydraulic Lake") + "</div>" +
    '<div class="band-sub">' + seen + "/" + MEMBERS.length + ' 명 위치 공유 중</div>' +
    bandBtns([bBtn("📻 나 여기야", "home-ping"), bBtn("🗺️ 지도 크게", "hero-go", true)]);
  return band("cabin", inner) +
    '<div class="hero card"><div id="home-map" class="hero-map map-paper"></div></div>';
}
function isNight() { const h = new Date().getHours(); return h >= 20 || h < 6; }
function modeDots(active) {
  const order = ["drive", "winery", "shop", "arr", "cabin"];
  return '<div class="mode-dots">' + order.map((m) => '<i class="' + (m === active ? "on" : "") + '"></i>').join("") + "</div>";
}

/* ---- 홈 자동 전환 엔진 ---- */
function homeMode() {
  if (modeOverride) return modeOverride;
  const dd = getDest();
  if (dd) {
    if (lastPos && dd.lat && distKm(lastPos.lat, lastPos.lng, dd.lat, dd.lng) <= 0.4) {
      if (!destClearing) { destClearing = true; setDest(null).then(() => { destClearing = false; toast("🏁 도착 — 목적지 자동 해제"); }); }
    } else return "go";
  }
  const isThu = todayStr() === TRIP.days[0].date;
  if (lastPos) {
    if (distKm(lastPos.lat, lastPos.lng, COSTCO.lat, COSTCO.lng) <= 0.6) return "costco";
    if (distKm(lastPos.lat, lastPos.lng, cabinLat(), cabinLng()) <= TRIP.nearCabinKm) return isThu ? "arrival" : "cabin";
  }
  const cur = nowAndNext().cur;
  const t = cur ? cur.title || "" : "";
  if (/코스트코/.test(t)) return "costco";
  if (/숙소 도착/.test(t)) return "arrival";
  if (WINERIES.some((w) => t.indexOf(w.n) >= 0) || /와이너리/.test(t)) return "winery";
  if (isThu && hm(new Date()) < "12:40") return "drive";
  return "cabin";
}

const etaCache = {};
function fetchETA(a, b, elId) {
  const ck = elId + "-" + Math.round(a.lat * 300) + "," + Math.round(a.lng * 300);
  const paint = (v) => {
    const el = document.getElementById(elId);
    if (!el) return;
    if (el.classList.contains("band-num")) {
      el.textContent = Math.round(v.sec / 60);
      const side = el.parentElement && el.parentElement.querySelector(".band-side");
      if (side) side.textContent = (Math.round(v.km * 10) / 10) + " km" + (v.approx ? " · 추정" : "") + " 남음";
    } else {
      el.innerHTML = Math.round(v.sec / 60) + '분 <span class="muted" style="font-size:14px">· ' + (Math.round(v.km * 10) / 10) + "km" + (v.approx ? " · 직선 추정" : "") + " · " + hm(new Date()) + ' 기준</span>';
    }
  };
  const hit = etaCache[ck];
  if (hit && Date.now() - hit.ts < 90000) { paint(hit); return; }
  fetch("https://router.project-osrm.org/route/v1/driving/" + a.lng + "," + a.lat + ";" + b.lng + "," + b.lat + "?overview=false")
    .then((r) => r.json())
    .then((d) => {
      const rt = d.routes && d.routes[0];
      if (!rt) throw 0;
      etaCache[ck] = { ts: Date.now(), sec: rt.duration, km: rt.distance / 1000 };
      paint(etaCache[ck]);
    })
    .catch(() => { const km = distKm(a.lat, a.lng, b.lat, b.lng); paint({ sec: (km / 75) * 3600, km, approx: true }); });
}

/* ---------- 시네마틱 밴드 빌더 ---------- */
function bandStars(n) {
  let out = "";
  const pts = [[26,200],[58,150],[40,265],[80,90],[100,240],[64,300]];
  for (let i = 0; i < Math.min(n, pts.length); i++)
    out += '<span class="star" style="width:' + (i % 2 ? 2 : 3) + "px;height:" + (i % 2 ? 2 : 3) + "px;top:" + pts[i][0] + "px;left:" + pts[i][1] + "px;animation-delay:" + (i * 0.6) + 's"></span>';
  return out;
}
function progHtml(fromLabel, toLabel, pct) {
  const p = Math.max(2, Math.min(98, pct));
  return '<div class="prog"><div class="prog-track"></div><div class="prog-fill" style="width:' + p + '%"></div>' +
    '<div class="prog-dot" style="left:' + p + '%"></div><div class="prog-end"></div></div>' +
    '<div class="prog-labels"><span>' + esc(fromLabel) + "</span><span>" + esc(toLabel) + "</span></div>";
}
function band(mode, inner) {
  return '<div class="band m-' + mode + '">' + (mode === "cabin" ? bandStars(6) : "") + inner + "</div>";
}
function eyebrow(ic, text, stamp) {
  return '<div class="band-eyebrow"><span class="ic">' + ic + "</span>" + esc(text) +
    (stamp ? '<span class="band-stamp">' + esc(stamp) + "</span>" : "") + "</div>";
}
function bandBtns(arr) { return '<div class="band-actions">' + arr.join("") + "</div>"; }
function bBtn(label, id, ghost) { return '<button class="bbtn' + (ghost ? " ghost" : "") + '" id="' + id + '">' + label + "</button>"; }
function bLink(label, q, ghost) { return '<a class="bbtn' + (ghost ? " ghost" : "") + '" href="' + gmapUrl(q) + '" target="_blank" rel="noopener">' + label + "</a>"; }

function navBtn(q, label) {
  return '<a class="btn ghost small" style="text-decoration:none" href="' + gmapUrl(q) + '" target="_blank" rel="noopener">📍 ' + (label || "구글맵") + "</a>";
}

function driveCardHtml() {
  const next = nowAndNext().next;
  let dest = next ? placeCoord(next.title) : null;
  let q = next ? placeQuery(next.title) : null;
  if (!dest) { const fd = firstDestination(); if (fd) { dest = fd; q = fd.q; } }
  const total = dest ? distKm(WAYPOINTS[0].lat, WAYPOINTS[0].lng, dest.lat, dest.lng) : 0;
  const left = dest && lastPos ? distKm(lastPos.lat, lastPos.lng, dest.lat, dest.lng) : total;
  const pct = total > 0 ? Math.max(0, Math.min(100, (1 - left / total) * 100)) : 0;
  let inner = eyebrow("🚗", "지금 · 이동 중", lastPos ? hm(new Date()) + " 갱신" : "");
  if (dest) {
    inner += '<div class="band-label">' + esc(dest.n) + "까지</div>" +
      '<div class="band-big"><span class="band-num" id="nav-eta">' + (lastPos ? "…" : "—") + '</span><span class="band-unit">분</span>' +
      '<span class="band-side">' + (lastPos ? Math.round(left) + " km 남음" : "위치 켜면 실시간") + "</span></div>" +
      progHtml("포트무디", dest.n, pct) +
      bandBtns([bLink("🧭 내비 시작", q || dest.n), bBtn("🛑 쉬는 곳 " + REST_STOPS.length, "rest-jump", true)]);
    if (!lastPos) inner += bandBtns([bBtn("📍 위치 켜기 — 1분마다 자동 갱신", "nav-loc", true)]);
  } else {
    inner += '<div class="band-title">West Kelowna까지 달리는 중</div>';
  }
  let html = band("drive", inner);
  html += '<div class="row-list" id="rest-list">';
  for (const r of REST_STOPS) {
    html += '<div class="lrow"><span class="ic">☕️</span>' + esc(r.n) +
      (lastPos ? '<span class="rt">' + Math.round(distKm(lastPos.lat, lastPos.lng, r.lat, r.lng)) + " km</span>" : '<span class="rt"></span>') +
      '<a class="rest-map" href="' + gmapUrl(r.q) + '" target="_blank" rel="noopener">📍</a></div>';
  }
  html += "</div>";
  return html;
}

function wineryCardHtml() {
  const sq = seqNow();
  const curName = sq.here ? sq.here.n : (sq.curItem ? sq.curItem.title : "와이너리");
  let inner = eyebrow("🍷", "지금 · 와이너리" + (sq.here ? " · 위치 확인됨" : ""), hm(new Date()));
  inner += '<div class="band-title">' + esc(curName) + "</div>";
  if (sq.nextItem) {
    const nd = placeCoord(sq.nextItem.title);
    inner += '<div class="band-sub">다음 → <b>' + esc(sq.nextItem.title) + "</b>" + (sq.nextItem.t ? " · " + esc(sq.nextItem.t) + " 예정" : "") + "</div>";
    if (nd && lastPos) inner += '<div class="band-big"><span class="band-num sm" id="nav-eta">…</span><span class="band-unit">분</span><span class="band-side">차로</span></div>';
    const btns = [];
    if (nd) btns.push(bLink("🧭 내비", placeQuery(sq.nextItem.title) || nd.n));
    btns.push(bBtn("✅ 출발 확정 — 전원에게", "go-next", true));
    inner += bandBtns(btns);
  }
  if (sq.rest.length) inner += '<div class="band-note">이후 → ' + sq.rest.map((r) => esc(r.title)).join(" → ") + "</div>";
  return band("wine", inner) + '<button class="btn" id="wine-go" style="width:100%;margin-top:10px">🍷 이 와이너리 평가 남기기</button>';
}

function costcoCardHtml() {
  const shop = store.shopping;
  const done = shop.filter((x) => x.done).length;
  const pct = shop.length ? Math.round((done / shop.length) * 100) : 0;
  let inner = eyebrow("🛒", "지금 · 코스트코 — 다흰 카드", hm(new Date()));
  inner += '<div class="band-big"><span class="band-num">' + done + '</span><span class="band-unit">/ ' + shop.length + " 담음</span>" +
    '<span class="band-side">' + pct + "%</span></div>" +
    '<div class="band-bar"><i style="width:' + pct + '%"></i></div>' +
    bandBtns([bBtn("🧾 계산 끝 — 장부 기록", "home-exp"), bLink("📍 지도", "Costco Kelowna BC", true)]);
  let html = band("shop", inner);
  html += '<div class="card"><div class="shop-add"><input class="input" id="shop-item-h" placeholder="살 것 바로 추가"><button class="btn" id="shop-go-h">추가</button></div>' +
    '<div class="checklist" id="home-shop">';
  const sorted = shop.slice().sort((a, b) => (a.done === b.done ? new Date(a.created_at) - new Date(b.created_at) : a.done ? 1 : -1));
  if (!sorted.length) html += '<div class="muted">리스트 비어 있음 — 위에서 추가</div>';
  for (const it of sorted) {
    html += '<label><input type="checkbox" class="shop-check" data-id="' + it.id + '"' + (it.done ? " checked" : "") + '><span class="' + (it.done ? "done" : "") + '">' + esc(it.item) +
      (it.added_by ? ' <span class="muted" style="font-size:11px">' + esc(nameOf(it.added_by)) + "</span>" : "") + "</span></label>";
  }
  html += "</div></div>";
  return html;
}

function arrivalCardHtml() {
  const door = store.settings.door_code, wifi = store.settings.wifi_code;
  let inner = eyebrow("🏠", "지금 · 숙소 도착", hm(new Date()));
  inner += '<div class="arr-row"><span class="arr-label">도어코드</span><span class="arr-code">' + (door ? esc(door) : "—") + "</span>" +
    (door ? '<button class="bbtn ghost cp" data-copy="' + esc(door) + '" data-lb="도어코드" style="margin-left:auto">복사</button>' : "") + "</div>" +
    '<div class="arr-row"><span class="arr-label">Wi-Fi</span><span class="arr-code" style="font-size:20px">' + (wifi ? esc(wifi) : "숙소 안 QR") + "</span>" +
    (wifi ? '<button class="bbtn ghost cp" data-copy="' + esc(wifi) + '" data-lb="Wi-Fi" style="margin-left:auto">복사</button>' : "") + "</div>" +
    '<div class="band-note">⚠️ 반드시 Hwy 33 · 변기엔 휴지만 · 수돗물 마시지 말기</div>' +
    bandBtns([bLink("🧭 숙소 내비", "9995 McCulloch Rd Kelowna BC")]);
  return band("arr", inner);
}

/* ---- 공유 목적지: 누가 정하면 전원 홈이 바뀐다 ---- */
let destClearing = false;
function getDest() {
  const v = store.settings.current_dest;
  if (!v) return null;
  try { const d = JSON.parse(v); return d && d.n ? d : null; } catch (e) { return null; }
}
async function setDest(d) {
  if (needSb()) return false;
  const { error } = await sb.from("settings").upsert({ key: "current_dest", value: d ? JSON.stringify(d) : "" });
  if (error) { toast("실패 — 다시 시도"); return false; }
  loadAll();
  return true;
}
function setDestFromTitle(title) {
  const c = placeCoord(title);
  const d = {
    n: c ? c.n : title,
    q: placeQuery(title) || title + " Kelowna BC",
    lat: c ? c.lat : null, lng: c ? c.lng : null,
    by: me, ts: Date.now(),
  };
  return setDest(d).then((ok) => {
    if (ok) { toast("🧭 전원 홈에 띄웠어: " + d.n); switchTab("home"); }
  });
}
function goCardHtml() {
  const d = getDest();
  if (!d) return "";
  let inner = eyebrow("🧭", "우리 다 같이 → 이동 중", d.by ? nameOf(d.by) + " 확정" : "");
  inner += '<div class="band-title">' + esc(d.n) + "</div>";
  if (d.lat && lastPos) {
    inner += '<div class="band-big"><span class="band-num sm" id="nav-eta">…</span><span class="band-unit">분</span>' +
      '<span class="band-side">' + Math.round(distKm(lastPos.lat, lastPos.lng, d.lat, d.lng)) + " km 남음</span></div>";
  } else if (d.lat) {
    inner += '<div class="band-sub">위치 켜면 남은 시간이 여기 떠</div>';
  }
  const btns = [bLink("🧭 내비 시작", d.q || d.n), bBtn("🏁 도착 · 해제", "dest-done", true)];
  if (d.lat && !lastPos) btns.push(bBtn("📍 위치 켜기", "nav-loc", true));
  inner += bandBtns(btns);
  return band("drive", inner);
}

function nearestWinery() {
  if (!lastPos) return null;
  let best = null, bd = 2;
  for (const w of WINERIES) {
    const d = distKm(lastPos.lat, lastPos.lng, w.lat, w.lng);
    if (d < bd) { bd = d; best = w; }
  }
  return best;
}

/* 일정표 체인 기준 지금/다음 — 시계가 아니라 순서를 따른다 */
function seqNow() {
  let items = itemsFor(todayStr());
  if (!items.length) items = itemsFor(TRIP.days[0].date); // 시연·출발 전 대비
  let idx = -1;
  const here = nearestWinery();
  if (here) idx = items.findIndex((r) => (r.title || "").indexOf(here.n) >= 0);
  if (idx < 0) {
    const cur = nowAndNext().cur;
    if (cur) idx = items.findIndex((r) => r.id === cur.id);
  }
  const curItem = idx >= 0 ? items[idx] : null;
  const nextItem = idx + 1 < items.length ? items[idx + 1] : (idx < 0 && items.length ? items[0] : null);
  const rest = idx >= 0 ? items.slice(idx + 2, idx + 4) : [];
  return { curItem, nextItem, rest, here };
}
function renderHome() {
  const el = $("#tab-home");
  const p = modeOverride ? "during" : phase();
  let html = "";

  if (p === "before") {
    const fd = firstDestination();
    let inner = eyebrow("🧭", "출발 대기", "");
    inner += '<div class="band-label">목 8:00 출발까지</div>' +
      '<div class="band-big"><span class="band-num sm" data-tick="dep">…</span></div>' +
      '<div class="band-sub">7:30 포트무디 집결 · A조 4 / B조 2</div>';
    if (fd) inner += '<div class="band-note">첫 목적지 <b>' + esc(fd.n) + '</b> · <span id="pre-eta">경로 계산 중…</span></div>' +
      bandBtns([bLink("🧭 경로 미리 보기", fd.q)]);
    html += band("drive", inner);
    html += heroBeforeHtml();
    html += '<div id="aq-home">' + aqHtml() + "</div>";
    html += '<h2 class="sec">준비물</h2><div class="card checklist" id="checklist"></div>';
  }

  if (p === "during") {
    if (modeOverride) html += '<button class="chip" id="preview-off" style="margin-top:10px">👁️ 시연 모드 (실제 당일엔 자동) — 종료 ✕</button>';
    const mode = homeMode();
    if (mode === "go") html += goCardHtml();
    else if (mode === "drive") html += driveCardHtml();
    else if (mode === "winery") html += wineryCardHtml();
    else if (mode === "costco") html += costcoCardHtml();
    else if (mode === "arrival") html += arrivalCardHtml();
    else html += heroLiveHtml();
    html += modeDots(mode === "go" ? "drive" : mode === "costco" ? "shop" : mode === "arrival" ? "arr" : mode === "cabin" ? "cabin" : mode);

    const { cur, next } = nowAndNext();
    if (mode !== "costco") {
      html += '<div class="now-card" style="border-color:' + dayTheme() + '">' +
        '<div class="now-eyebrow" style="color:' + dayTheme() + '">지금</div>' +
        '<div class="now-title">' + esc(cur ? cur.title : "자유시간") + "</div>" +
        (cur && cur.note ? '<div class="now-note">' + esc(cur.note) + "</div>" : "") +
        (next ? '<div class="now-next">다음 → <b>' + esc(next.t) + " " + esc(next.title) + "</b></div>" : "") +
        "</div>";
    }
    html += '<div class="radio-row">' +
      '<button class="stamp-big alt half" id="home-ping">📻 나 여기야!</button>' +
      '<button class="stamp-big half" id="home-stamp">📮 도장+한마디</button></div>';
    html += '<div id="aq-home">' + aqHtml() + "</div>";
  }

  if (p === "after") {
    html += heroLiveHtml();
    html += '<div class="now-card"><div class="now-eyebrow">수고했어</div>' +
      '<div class="now-title">2박 3일 끝!</div>' +
      '<div class="now-note">장부 탭에서 정산 마무리하고, 사진은 공유 앨범에.</div></div>';
    const alb = store.settings.album_url;
    if (alb) html += '<div class="card linkline"><a href="' + esc(alb) + '" target="_blank" rel="noopener">📸 공유 앨범 열기</a></div>';
  }

  html += '<h2 class="sec">투표 — 그날그날 급한 결정</h2>';
  const open = store.polls.filter((x) => !x.closed);
  const closed = store.polls.filter((x) => x.closed);
  if (!open.length) html += '<div class="card muted">열린 투표 없음. "4번째 와이너리 갈까 말까" 같은 건 여기서 바로.</div>';
  for (const poll of open) html += pollHtml(poll, false);
  html += '<button class="btn ghost" id="new-poll" style="width:100%">+ 새 투표 걸기</button>';
  if (closed.length) {
    html += '<h2 class="sec">끝난 투표</h2>';
    for (const poll of closed.slice(0, 5)) html += pollHtml(poll, true);
  }

  el.innerHTML = html;

  if (p === "before") { renderChecklist(); tickDep(); preTripETA(); }
  const po = $("#preview-off"); if (po) po.onclick = () => { modeOverride = ""; renderHome(); };
  if ($("#home-map")) drawMap("home-map", p === "before" ? { route: true } : {});
  const hg = $("#hero-go"); if (hg) hg.onclick = () => switchTab("stamp");
  bindCopies(el);
  const np = $("#new-poll"); if (np) np.onclick = openPollModal;
  const hp = $("#home-ping"); if (hp) hp.onclick = () => quickPing();
  const hs = $("#home-stamp"); if (hs) hs.onclick = openStampModal;
  const nl = $("#nav-loc"); if (nl) nl.onclick = () => getPosition().then(() => renderHome());
  const rj = $("#rest-jump"); if (rj) rj.onclick = () => { const t = $("#rest-list"); if (t) t.scrollIntoView({ behavior: "smooth", block: "center" }); };
  const ddn = $("#dest-done"); if (ddn) ddn.onclick = async () => { if (!confirm("목적지 해제할까? (전원 홈에서 사라짐)")) return; await setDest(null); toast("🏁 해제됨"); };
  const wg = $("#wine-go"); if (wg) wg.onclick = openWineModal;
  const gn = $("#go-next"); if (gn) gn.onclick = () => {
    if (!me) return openWho();
    const nx = seqNow().nextItem;
    if (nx) setDestFromTitle(nx.title);
  };
  const sgh = $("#shop-go-h"); if (sgh) sgh.onclick = () => addShopItem("shop-item-h");
  const sih = $("#shop-item-h"); if (sih) sih.addEventListener("keydown", (e) => { if (e.key === "Enter") addShopItem("shop-item-h"); });
  const hex = $("#home-exp"); if (hex) hex.onclick = openExpModal;
  $$("#home-shop .shop-check", el).forEach((cb) => cb.onchange = async () => {
    if (needSb()) return;
    await sb.from("shopping").update({ done: cb.checked }).eq("id", Number(cb.dataset.id));
    loadAll();
  });
  // ETA 계산
  if (p === "during" && lastPos && $("#nav-eta")) {
    const mode2 = homeMode();
    let dest = null;
    if (mode2 === "go") { const dd = getDest(); if (dd && dd.lat) dest = dd; }
    else if (mode2 === "winery") { const nx = seqNow().nextItem; dest = nx ? placeCoord(nx.title) : null; }
    else { const next = nowAndNext().next; dest = next ? placeCoord(next.title) : null; }
    if (!dest) { const fd = firstDestination(); if (fd) dest = fd; }
    if (dest) fetchETA(lastPos, dest, "nav-eta");
  }
  bindPolls(el);
}

function cabinCardHtml() {
  const reveal = new Date() >= new Date(TRIP.doorCodeRevealAt);
  const near = lastPos && distKm(lastPos.lat, lastPos.lng, cabinLat(), cabinLng()) <= TRIP.nearCabinKm;
  if (!reveal && !near) return "";
  const door = store.settings.door_code, wifi = store.settings.wifi_code;
  return '<div class="card stitch"><b>🏠 ' + esc(TRIP.cabinName) + "</b>" +
    '<div class="kv"><b>도어코드</b><span class="code-line"><span class="code-val">' + (door ? esc(door) : '<span class="muted" style="font-size:13px">정보 탭에서 입력</span>') + "</span>" + (door ? '<button class="btn ghost small cp" data-copy="' + esc(door) + '" data-lb="도어코드">복사</button>' : "") + "</span></div>" +
    '<div class="kv"><b>Wi-Fi</b><span class="code-line"><span class="code-val">' + (wifi ? esc(wifi) : '<span class="muted" style="font-size:13px">숙소 안 QR / 정보 탭에서 입력</span>') + "</span>" + (wifi ? '<button class="btn ghost small cp" data-copy="' + esc(wifi) + '" data-lb="Wi-Fi">복사</button>' : "") + "</span></div>" +
    '<div class="kv"><b>주소</b><span class="code-line"><span style="font-size:13px">Unit #1, 9995 McCulloch Rd</span><button class="btn ghost small cp" data-copy="9995 McCulloch Rd, Kelowna, BC" data-lb="주소">복사</button></span></div>' +
    '<div class="muted">Hwy 33으로만 진입 · 생수 · 변기엔 휴지만</div></div>';
}

function renderChecklist() {
  const wrap = $("#checklist");
  if (!wrap) return;
  const state = JSON.parse(localStorage.getItem("kel_check") || "{}");
  wrap.innerHTML = CHECKLIST.map((item, i) =>
    '<label><input type="checkbox" data-i="' + i + '"' + (state[i] ? " checked" : "") + '><span class="' + (state[i] ? "done" : "") + '">' + esc(item) + "</span></label>"
  ).join("");
  $$("input", wrap).forEach((cb) => cb.onchange = () => {
    state[cb.dataset.i] = cb.checked;
    localStorage.setItem("kel_check", JSON.stringify(state));
    renderChecklist();
  });
}

/* ---------------- 공기질 (산불 연기) — 무료 API, 서버 불필요 ---------------- */
function aqInfo() { try { return JSON.parse(localStorage.getItem("kel_aq")); } catch (e) { return null; } }
function aqHtml() {
  const a = aqInfo();
  if (!a) return "";
  let label = "좋음", cls = "aq-good";
  if (a.aqi > 150) { label = "나쁨 — 연기 가능성 높음"; cls = "aq-bad"; }
  else if (a.aqi > 100) { label = "연기 조짐 — 민감하면 마스크"; cls = "aq-bad"; }
  else if (a.aqi > 50) { label = "보통"; cls = "aq-mid"; }
  return '<div class="card aq ' + cls + '">🌫️ 숙소 공기 <b>AQI ' + a.aqi + " · " + label + "</b>" +
    '<span class="muted"> — PM2.5 ' + a.pm + " · " + relTime(new Date(a.ts).toISOString()) + " 갱신 · 30분마다 자동</span></div>";
}
async function loadAQ() {
  try {
    const u = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=" + cabinLat() + "&longitude=" + cabinLng() + "&current=pm2_5,us_aqi&timezone=auto";
    const d = await (await fetch(u)).json();
    localStorage.setItem("kel_aq", JSON.stringify({ aqi: Math.round(d.current.us_aqi), pm: Math.round(d.current.pm2_5), ts: Date.now() }));
  } catch (e) {}
  const h = $("#aq-home"); if (h) h.innerHTML = aqHtml();
  const i = $("#aq-info"); if (i) i.innerHTML = aqHtml();
}

/* ---------------- 투표 ---------------- */
function pollHtml(poll, isClosed) {
  const votes = store.votes.filter((v) => v.poll_id === poll.id);
  const total = votes.length || 1;
  const myVote = votes.find((v) => v.member === me);
  let opts = "";
  (poll.options || []).forEach((label, i) => {
    const these = votes.filter((v) => v.option_idx === i);
    const pct = Math.round((these.length / total) * 100);
    const mine = myVote && myVote.option_idx === i;
    opts += '<button class="opt' + (mine ? " mine" : "") + '" data-poll="' + poll.id + '" data-i="' + i + '"' + (isClosed ? " disabled" : "") + ">" +
      '<span class="bar" style="width:' + (votes.length ? pct : 0) + '%"></span>' +
      '<span class="opt-label">' + esc(label) + '<span class="opt-count">' + these.length + "표</span></span>" +
      (these.length ? '<span class="voters">' + these.map((v) => esc(nameOf(v.member))).join(" · ") + "</span>" : "") +
      "</button>";
  });
  return '<div class="card poll"><div class="poll-q">' + esc(poll.question) +
    '<span class="poll-by">' + esc(poll.created_by || "") + "</span></div>" + opts +
    (!isClosed ? '<div class="btn-row"><button class="btn ghost small close-poll" data-poll="' + poll.id + '">마감</button></div>' : "") +
    "</div>";
}
function bindPolls(scope) {
  $$(".opt", scope).forEach((b) => b.onclick = async () => {
    if (needSb()) return;
    if (!me) return openWho();
    const pid = Number(b.dataset.poll), idx = Number(b.dataset.i);
    // 낙관적 반영: 누르는 즉시 화면부터, 서버는 뒤에서
    store.votes = store.votes.filter((v) => !(v.poll_id === pid && v.member === me));
    store.votes.push({ poll_id: pid, member: me, option_idx: idx });
    if (currentTab === "home") { const y = window.scrollY; renderHome(); window.scrollTo(0, y); }
    const { error } = await sb.from("votes").upsert(
      { poll_id: pid, member: me, option_idx: idx },
      { onConflict: "poll_id,member" }
    );
    if (error) { toast("투표 전송 실패 — 신호 확인"); scheduleLoad(); }
  });
  $$(".close-poll", scope).forEach((b) => b.onclick = async () => {
    if (needSb()) return;
    if (!confirm("이 투표 마감할까?")) return;
    await sb.from("polls").update({ closed: true }).eq("id", Number(b.dataset.poll));
    loadAll();
  });
}
function openPollModal() {
  if (!me) return openWho();
  ["#poll-q", "#poll-o1", "#poll-o2", "#poll-o3", "#poll-o4"].forEach((s) => $(s).value = "");
  $("#poll-modal").hidden = false;
}

/* ---------------- 일정 + 금요일 제안 보드 ---------------- */
function renderPlan() {
  const el = $("#tab-plan");
  if (!planDay) planDay = phase() === "during" ? todayStr() : TRIP.days[0].date;
  if (!TRIP.days.some((d) => d.date === planDay)) planDay = TRIP.days[0].date;
  const day = TRIP.days.find((d) => d.date === planDay);

  let html = '<div class="day-tabs">' + TRIP.days.map((d) =>
    '<button class="day-tab' + (d.date === planDay ? " active" : "") + '" style="--day-color:' + d.theme + '" data-day="' + d.date + '">' +
    d.label + " · " + Number(d.date.slice(8)) + "일</button>"
  ).join("") + "</div>";

  const items = itemsFor(planDay);
  const { cur } = nowAndNext();
  html += '<div class="plan-list" style="--day-color:' + day.theme + '">';
  if (!items.length) html += '<div class="plan-row"><span></span><span class="muted">아직 비어 있음 — 아래에서 추가</span></div>';
  for (const r of items) {
    const isNow = cur && cur.id === r.id && planDay === todayStr();
    const tbd = /미정|기분따라|프리|\(\?\)/.test(r.title);
    html += '<div class="plan-row' + (isNow ? " now-row" : "") + '">' +
      '<span class="plan-time">' + esc(r.t || "") + "</span>" +
      '<span class="plan-title"><span class="' + (tbd ? "tbd" : "") + '">' + esc(r.title) + "</span>" +
      (r.note ? '<span class="plan-note">' + esc(r.note) + "</span>" : "") + "</span>" +
      '<span style="white-space:nowrap"><button class="plan-edit go-set" data-title="' + esc(r.title) + '" title="전원 홈에 다음 목적지로">▶</button>' +
      (placeQuery(r.title) ? '<a class="plan-edit" style="text-decoration:none" href="' + gmapUrl(placeQuery(r.title)) + '" target="_blank" rel="noopener">📍</a>' : "") +
      '<button class="plan-edit" data-id="' + r.id + '">✎</button></span></div>';
  }
  html += "</div>";
  html += '<button class="btn ghost" id="it-add" style="width:100%">+ 일정 추가</button>';

  // 목요일: 4번째 와이너리 — 둘 다 보여주기
  if (planDay === TRIP.days[0].date) {
    html += '<h2 class="sec">4번째 와이너리 — 그날 결정</h2><div class="card">' +
      '<div class="kv"><b>안 1</b><span><b>Volcanic Hills</b> <a href="' + gmapUrl("Volcanic Hills Winery West Kelowna") + '" target="_blank" rel="noopener">📍</a></span></div>' +
      '<div class="kv"><b>안 2</b><span><b>Mt. Boucherie</b> <a href="' + gmapUrl("Mt Boucherie Estate Winery West Kelowna") + '" target="_blank" rel="noopener">📍</a></span></div>' +
      '<div class="muted">같은 동네라 컨디션 되면 둘 다, 힘들면 패스. 그날 홈 탭에서 투표 하나 걸어도 됨.</div></div>';

    // 와인 노트
    html += '<h2 class="sec">🍷 와인 노트</h2>';
    const byW = {};
    store.wineRatings.forEach((r) => { (byW[r.winery] = byW[r.winery] || []).push(r); });
    const ranked = Object.keys(byW).map((w) => {
      const rs = byW[w];
      return { w, rs, avg: rs.reduce((a, b) => a + b.stars, 0) / rs.length };
    }).sort((a, b) => b.avg - a.avg);
    if (!ranked.length) html += '<div class="card muted">첫 잔 마시면 여기서 평가 — 나중에 우리 조 1위 와인 발표.</div>';
    else {
      html += '<div class="card">';
      ranked.forEach((g, i) => {
        html += '<div class="wine-winery">' + (i === 0 ? '<span class="crown">👑 현재 1위</span> ' : "") + "<b>" + esc(g.w) + '</b><span class="wine-avg">★ ' + (Math.round(g.avg * 10) / 10) + ' <span class="muted">(' + g.rs.length + "명)</span></span></div>";
        for (const r of g.rs) {
          html += '<div class="wine-row">' + av(r.member, "mini") +
            '<span class="wine-stars">' + "★".repeat(r.stars) + "</span>" +
            '<span class="wine-body">' + (r.wine ? esc(r.wine) : "") + (r.price ? ' <span class="muted">' + money(Number(r.price)) + "</span>" : "") +
            (r.note ? ' <span class="feed-note">' + esc(r.note) + "</span>" : "") + "</span></div>";
        }
      });
      html += "</div>";
    }
    html += '<button class="btn ghost" id="wine-add" style="width:100%">🍷 평가 남기기</button>';
  }

  // 금요일: 제안 보드
  if (planDay === TRIP.days[1].date) {
    html += '<h2 class="sec">제안 보드 — 프리 데이</h2>' +
      '<p class="muted" style="margin:2px 4px 6px">가고 싶은 곳·하고 싶은 것 아무거나 올리고 👍. 많이 받은 순서.</p><div class="card">';
    const likeCount = (id) => store.wishLikes.filter((l) => l.wish_id === id).length;
    const wishes = store.wishes.slice().sort((a, b) => likeCount(b.id) - likeCount(a.id) || new Date(a.created_at) - new Date(b.created_at));
    if (!wishes.length) html += '<div class="muted">아직 제안 없음 — 첫 번째로 올려봐.</div>';
    for (const w of wishes) {
      const n = likeCount(w.id);
      const mine = store.wishLikes.some((l) => l.wish_id === w.id && l.member === me);
      html += '<div class="wish-row"><span class="wish-cat">' + (CAT_EMOJI[w.category] || "📌") + "</span>" +
        '<span class="wish-body">' + esc(w.title) + '<span class="wish-by">' + esc(nameOf(w.member)) + "</span></span>" +
        '<button class="like-btn' + (mine ? " on" : "") + '" data-id="' + w.id + '">👍 ' + n + "</button>" +
        '<button class="plan-edit wish-del" data-id="' + w.id + '">✕</button></div>';
    }
    html += "</div>" +
      '<button class="btn ghost" id="wish-add" style="width:100%">+ 제안 올리기</button>';
  }

  el.innerHTML = html;

  $$(".day-tab", el).forEach((b) => b.onclick = () => { planDay = b.dataset.day; renderPlan(); });
  $("#it-add").onclick = () => openItModal(null);
  $$(".plan-edit:not(.wish-del)", el).forEach((b) => b.onclick = () => {
    const row = store.itinerary.find((x) => String(x.id) === b.dataset.id);
    if (row) openItModal(row);
  });
  const wa = $("#wish-add"); if (wa) wa.onclick = openWishModal;
  const wn = $("#wine-add"); if (wn) wn.onclick = openWineModal;
  $$(".go-set", el).forEach((b) => b.onclick = () => {
    if (!me) return openWho();
    const t = b.dataset.title;
    if (!confirm('"' + t + '" — 전원 홈에 "지금 우리 → 여기"로 띄울까?')) return;
    setDestFromTitle(t);
  });
  $$(".like-btn", el).forEach((b) => b.onclick = async () => {
    if (needSb()) return;
    if (!me) return openWho();
    const id = Number(b.dataset.id);
    const mine = store.wishLikes.find((l) => l.wish_id === id && l.member === me);
    if (mine) await sb.from("wish_likes").delete().eq("wish_id", id).eq("member", me);
    else await sb.from("wish_likes").insert({ wish_id: id, member: me });
    loadAll();
  });
  $$(".wish-del", el).forEach((b) => b.onclick = async () => {
    if (needSb()) return;
    if (!confirm("이 제안 내릴까?")) return;
    await sb.from("wishes").delete().eq("id", Number(b.dataset.id));
    loadAll();
  });
}

let wineStars = 0, wineWinery = "";
async function openWineModal() {
  if (!me) return openWho();
  wineStars = 0;
  $("#wine-name").value = ""; $("#wine-price").value = ""; $("#wine-note").value = "";
  const near = nearestWinery();
  wineWinery = near ? near.n : "";
  drawWineChips();
  $("#wine-modal").hidden = false;
  if (!near) getPosition().then((p) => { if (p) { const n2 = nearestWinery(); if (n2 && !wineWinery) { wineWinery = n2.n; drawWineChips(); } } });
}
function drawWineChips() {
  $("#wine-winery").innerHTML = WINERIES.map((w) =>
    '<button class="chip' + (wineWinery === w.n ? " on" : "") + '">' + esc(w.n) + "</button>").join("");
  $$("#wine-winery .chip").forEach((c) => c.onclick = () => { wineWinery = c.textContent; drawWineChips(); });
  $("#wine-stars").innerHTML = [1, 2, 3, 4, 5].map((n) =>
    '<button class="star' + (n <= wineStars ? " on" : "") + '" data-n="' + n + '">★</button>').join("");
  $$("#wine-stars .star").forEach((st) => st.onclick = () => { wineStars = Number(st.dataset.n); drawWineChips(); });
}

let wishCat = "액티비티";
function openWishModal() {
  if (!me) return openWho();
  $("#wish-title").value = ""; wishCat = "액티비티";
  drawWishChips();
  $("#wish-modal").hidden = false;
}
function drawWishChips() {
  $("#wish-cat").innerHTML = WISH_CATEGORIES.map((k) =>
    '<button class="chip' + (wishCat === k ? " on" : "") + '">' + (CAT_EMOJI[k] || "") + " " + esc(k) + "</button>").join("");
  $$("#wish-cat .chip").forEach((c) => c.onclick = () => { wishCat = c.textContent.trim().replace(/^\S+\s/, ""); drawWishChips(); });
}

let itEditing = null;
function openItModal(row) {
  itEditing = row;
  $("#it-title-label").textContent = row ? "일정 수정" : "일정 추가";
  $("#it-time").value = row ? row.t || "" : "";
  $("#it-title").value = row ? row.title : "";
  $("#it-note").value = row ? row.note || "" : "";
  $("#it-delete").hidden = !row;
  const dayWrap = $("#it-day");
  const sel = row ? row.day : planDay;
  dayWrap.innerHTML = TRIP.days.map((d) =>
    '<button class="chip' + (d.date === sel ? " on" : "") + '" data-day="' + d.date + '">' + d.label + "</button>"
  ).join("");
  $$(".chip", dayWrap).forEach((c) => c.onclick = () => {
    $$(".chip", dayWrap).forEach((x) => x.classList.remove("on"));
    c.classList.add("on");
  });
  $("#it-modal").hidden = false;
}

/* ---------------- 무전 (스탬프 + 위치) ---------------- */
function latestByMember() {
  const out = {};
  for (const c of store.checkins) if (!out[c.member]) out[c.member] = c;
  return out;
}
function renderStamp() {
  const el = $("#tab-stamp");
  const latest = latestByMember();
  const myLast = latest[me];

  const online = navigator.onLine;
  let html = '<div class="ptt-wrap">' +
    '<button class="ptt" id="do-ping"><span class="ptt-ic">📻</span>꾹 눌러 말하기</button>' +
    '<span class="ptt-state" id="ptt-state"></span>' +
    '<p class="ptt-hint"><b>꾹 누르고 말해, 떼면 전송</b> (최대 30초)<br>짧게 탭 = 위치만 송신 · 신호 없으면 위치는 자동 대기 후 송신</p>' +
    '<div class="status-row">' +
    '<span class="chip">' + (online ? "🟢 신호 있음" : "🔴 오프라인") + "</span>" +
    (myLast ? '<span class="chip">내 마지막 송신 ' + relTime(myLast.created_at) + "</span>" : "") +
    (queue.length ? '<span class="chip" style="color:var(--wine)">대기 ' + queue.length + "건</span>" : "") +
    "</div></div>";

  html += '<div class="chip-row qp-row">' + QUICK_PHRASES.map((q) => '<button class="chip qp">' + esc(q) + "</button>").join("") + "</div>";

  html += '<div class="radio-row" style="margin-top:8px">' +
    '<button class="stamp-big half" id="do-stamp">📮 도장+한마디</button>' +
    '<button class="stamp-big half" id="do-text" style="background:var(--ink)">💬 문자 교신</button></div>' +
    '<div class="shop-add" id="text-row" hidden><input class="input" id="radio-text" placeholder="짧게 한 마디 (신호 없으면 자동 대기)"><button class="btn" id="radio-send">📨</button></div>';

  html += '<h2 class="sec">교신 — 카드 탭하면 위치 요청</h2><div class="board">';
  for (const m of MEMBERS) {
    const c = latest[m.id];
    html += '<div class="board-card" data-mid="' + m.id + '"><div class="board-name">' + av(m.id, "mini") + esc(m.name) + (m.id !== me ? '<span class="board-req">📍</span>' : "") + "</div>" +
      (c ? '<div class="board-place">' + esc(c.place) + (c.audio ? ' <button class="play-btn" data-audio="' + esc(c.audio) + '">▶️</button>' : "") + '</div><div class="board-when">' + relTime(c.created_at) + (c.lat ? " · 📍" : "") + "</div>" +
        (c.note ? '<div class="board-note">' + esc(c.note) + "</div>" : "")
        : '<div class="board-when">아직 소식 없음</div>') +
      "</div>";
  }
  html += "</div>";

  html += '<h2 class="sec">지도</h2><div id="map"></div>';

  html += '<h2 class="sec">같이 할 것</h2><div class="card">';
  for (const mi of MISSIONS) {
    const label = mi.e + " " + mi.t;
    const doneBy = MEMBERS.filter((m2) => store.checkins.some((c) => c.member === m2.id && c.place === label));
    const mine = me && doneBy.some((m2) => m2.id === me);
    html += '<div class="mission-row' + (mine ? " done" : "") + '" data-label="' + esc(label) + '">' +
      '<span class="mi-badge">' + mi.e + "</span>" +
      '<span class="mi-title">' + esc(mi.t) + "</span>" +
      '<span class="mi-who">' + doneBy.map((m2) => av(m2.id, "mini")).join("") + "</span>" +
      '<span class="mi-act">' + (mine ? "✔" : "완료") + "</span></div>";
  }
  html += "</div>";

  html += '<h2 class="sec">교신 기록</h2><div class="card feed">';
  if (!store.checkins.length) html += '<div class="muted">첫 교신의 주인공은?</div>';
  for (const c of store.checkins.slice(0, 40)) {
    const rx = store.reactions.filter((x) => x.checkin_id === c.id);
    let rxHtml = "";
    if (c.id > 0) {
      rxHtml = '<span class="rx-row">' + REACT_EMOJI.map((e) => {
        const these = rx.filter((r) => r.emoji === e);
        const mine = these.some((r) => r.member === me);
        return '<button class="rx' + (mine ? " on" : "") + '" data-cid="' + c.id + '" data-e="' + e + '">' + e + (these.length ? " " + these.length : "") + "</button>";
      }).join("") + "</span>";
    }
    html += '<div class="feed-item"><div class="feed-row">' + av(c.member, "mini") + '<span class="feed-who" style="color:' + colorOf(c.member) + '">' + esc(nameOf(c.member)) + "</span>" +
      '<span class="feed-body">' + esc(c.place) + (c.audio ? ' <button class="play-btn" data-audio="' + esc(c.audio) + '">▶️</button>' : "") + (c.note ? ' <span class="feed-note">' + esc(c.note) + "</span>" : "") + "</span>" +
      '<span class="feed-when">' + relTime(c.created_at) + "</span></div>" + rxHtml + "</div>";
  }
  html += "</div>";

  html += '<h2 class="sec">긴급</h2><div class="card" style="text-align:center">' +
    '<div class="siren-wrap"><button class="siren-btn" id="siren-btn"><span class="siren-ic">🚽</span><span>화장실 긴급</span></button>' +
    '<p class="muted" id="siren-hint" style="margin:10px 0 0">익명 · 10분에 1번 · 두 번 눌러야 발사 (전원 폰에 사이렌)</p></div></div>';

  el.innerHTML = html;
  $("#do-stamp").onclick = openStampModal;
  const ptt = $("#do-ping");
  ptt.onpointerdown = pttDown;
  ptt.onpointerup = pttUp;
  ptt.onpointercancel = pttUp;
  ptt.onpointerleave = () => { if (rec.t0) pttUp(); };
  ptt.oncontextmenu = (e) => e.preventDefault();
  $$(".play-btn", el).forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); playAudio(b.dataset.audio, b); });

  $$(".qp", el).forEach((b) => b.onclick = async () => {
    if (!me) return openWho();
    const q = b.textContent;
    const row = { member: me, place: q, note: null, lat: null, lng: null };
    if (q.indexOf("위치를 보내라") >= 0) row.target = "all";
    const r = await qInsert("checkins", row);
    if (r === true) { toast("📻 전송: " + q); loadAll(); }
  });

  $$(".board-card", el).forEach((bc) => bc.onclick = async (ev) => {
    if (ev.target.closest(".play-btn")) return;
    const mid = bc.dataset.mid;
    if (!mid || mid === me) return;
    if (!me) return openWho();
    if (!confirm(nameOf(mid) + "에게 위치 요청 보낼까?")) return;
    const r = await qInsert("checkins", { member: me, place: "📍 위치 요청 → " + nameOf(mid), note: null, target: mid, lat: null, lng: null });
    if (r === true) { toast("요청 보냄 — 응답 오면 알려줄게"); loadAll(); }
  });

  $$(".rx", el).forEach((b) => b.onclick = async () => {
    if (needSb()) return;
    if (!me) return openWho();
    const cid = Number(b.dataset.cid), e = b.dataset.e;
    const mine = store.reactions.find((r) => r.checkin_id === cid && r.member === me);
    if (mine && mine.emoji === e) await sb.from("reactions").delete().eq("checkin_id", cid).eq("member", me);
    else await sb.from("reactions").upsert({ checkin_id: cid, member: me, emoji: e }, { onConflict: "checkin_id,member" });
    loadAll();
  });

  $$(".mission-row", el).forEach((r) => r.onclick = async () => {
    if (!me) return openWho();
    const label = r.dataset.label;
    if (store.checkins.some((c) => c.member === me && c.place === label)) return toast("이미 완료 체크했어");
    if (!confirm('"' + label + '" 완료로 체크할까?')) return;
    const res = await qInsert("checkins", { member: me, place: label, note: "완료", lat: lastPos ? lastPos.lat : null, lng: lastPos ? lastPos.lng : null });
    if (res === true) { stampFx(label); loadAll(); }
  });

  const dt = $("#do-text"), tr = $("#text-row"), rt = $("#radio-text"), rs = $("#radio-send");
  if (dt) dt.onclick = () => { tr.hidden = !tr.hidden; if (!tr.hidden) rt.focus(); };
  async function sendRadioText() {
    if (!me) return openWho();
    const v = rt.value.trim();
    if (!v) return;
    const res = await qInsert("checkins", { member: me, place: "💬", note: v, lat: null, lng: null });
    rt.value = "";
    if (res === true) loadAll();
  }
  if (rs) rs.onclick = sendRadioText;
  if (rt) rt.addEventListener("keydown", (e) => { if (e.key === "Enter") sendRadioText(); });

  wireSiren();
  if (currentTab === "stamp") setTimeout(() => drawMap("map"), 60);
}

/* ---- 화장실 긴급 버튼 ---- */
let sirenArmTimer = null, sirenNodes = null, emgSoundTimer = null;
function wireSiren() {
  const b = $("#siren-btn");
  if (!b) return;
  b.onclick = async () => {
    const last = Number(localStorage.getItem("kel_siren") || 0);
    if (Date.now() - last < 600000) return toast("🚽 10분에 한 번만 — " + Math.ceil((600000 - (Date.now() - last)) / 60000) + "분 뒤 가능");
    if (!b.classList.contains("armed")) {
      b.classList.add("armed");
      $("#siren-hint").textContent = "⚠️ 진짜 급해? 3초 안에 한 번 더 누르면 전원 발사";
      clearTimeout(sirenArmTimer);
      sirenArmTimer = setTimeout(() => { b.classList.remove("armed"); $("#siren-hint").textContent = "익명 · 10분에 1번 · 두 번 눌러야 발사 (전원 폰에 사이렌)"; }, 3000);
      return;
    }
    clearTimeout(sirenArmTimer);
    b.classList.remove("armed");
    if (needSb()) return;
    localStorage.setItem("kel_siren", String(Date.now()));
    emergency();
    await sb.from("sirens").insert({});
  };
}
function emergency() {
  const e = $("#emg");
  if (!e || !e.hidden) return;
  e.hidden = false;
  startSirenSound();
  clearTimeout(emgSoundTimer);
  emgSoundTimer = setTimeout(stopSirenSound, 12000);
  pushAlert("🚨 누군가 화장실이 급함 (익명)");
}
function startSirenSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "square"; g.gain.value = 0.06;
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 650; o.start();
    let hi = false;
    const iv = setInterval(() => { hi = !hi; o.frequency.value = hi ? 980 : 650; }, 340);
    sirenNodes = { ctx, o, iv };
  } catch (err) {}
}
function stopSirenSound() {
  if (!sirenNodes) return;
  clearInterval(sirenNodes.iv);
  try { sirenNodes.o.stop(); sirenNodes.ctx.close(); } catch (e) {}
  sirenNodes = null;
}

/* ---- 위치 요청 배너 ---- */
function checkRequests() {
  const b = $("#req-banner");
  if (!b || !me) return;
  const tenMin = Date.now() - 600000;
  const myLastLoc = store.checkins.find((c) => c.member === me && c.lat);
  const req = store.checkins.find((c) =>
    c.target && (c.target === me || c.target === "all") && c.member !== me &&
    new Date(c.created_at).getTime() > tenMin &&
    (!myLastLoc || new Date(c.created_at) > new Date(myLastLoc.created_at)));
  if (!req || localStorage.getItem("kel_req_done") === String(req.id)) { b.hidden = true; return; }
  b.innerHTML = '📻 <b>' + esc(nameOf(req.member)) + '</b>: 위치를 달라! <button class="btn small" id="req-go">바로 응답</button><button class="ib-x" id="req-x">✕</button>';
  b.hidden = false;
  $("#req-go").onclick = () => { localStorage.setItem("kel_req_done", String(req.id)); b.hidden = true; quickPing(true); };
  $("#req-x").onclick = () => { localStorage.setItem("kel_req_done", String(req.id)); b.hidden = true; };
}

/* ---- 음성 무전/* ---- 음성 무전 (꾹 누르고 말하기) ---- */
const rec = { mr: null, chunks: [], t0: 0, stream: null, limit: null };
const REC_MIN = 500, REC_MAX = 30000;

function setPttState(st) {
  const b = $("#do-ping"), h = $("#ptt-state");
  if (b) b.classList.toggle("rec", st === "rec");
  if (h) h.textContent = st === "rec" ? "🔴 녹음 중… 손 떼면 전송" : st === "nomic" ? "마이크를 못 잡았어 — 떼면 위치만 송신" : "";
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880; g.gain.value = 0.08; o.start();
    setTimeout(() => { o.frequency.value = 660; }, 90);
    setTimeout(() => { o.stop(); ctx.close(); }, 190);
  } catch (e) {}
}

async function pttDown(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!me) return openWho();
  if (needSb()) return;
  if (rec.mr || rec.t0) return;
  rec.t0 = Date.now();
  getPosition(); // GPS는 백그라운드로 미리
  let stream = null;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (err) {}
  if (rec.t0 === 0) { if (stream) stream.getTracks().forEach((t) => t.stop()); return; } // 이미 뗐음
  if (!stream || !window.MediaRecorder) { setPttState("nomic"); return; }
  const mime = MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4"
    : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
  try { rec.mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined); }
  catch (err) { stream.getTracks().forEach((t) => t.stop()); setPttState("nomic"); return; }
  rec.stream = stream;
  rec.chunks = [];
  rec.mr.ondataavailable = (ev) => { if (ev.data && ev.data.size) rec.chunks.push(ev.data); };
  rec.mr.start();
  setPttState("rec");
  rec.limit = setTimeout(pttUp, REC_MAX);
}

async function pttUp() {
  if (!rec.t0) return;
  clearTimeout(rec.limit);
  const held = Date.now() - rec.t0;
  rec.t0 = 0;
  const mr = rec.mr; rec.mr = null;
  if (!mr) { setPttState("idle"); quickPing(); return; } // 마이크 실패 → 위치만
  await new Promise((res) => { mr.onstop = res; try { mr.stop(); } catch (e) { res(); } });
  if (rec.stream) { rec.stream.getTracks().forEach((t) => t.stop()); rec.stream = null; }
  setPttState("idle");
  if (held < REC_MIN) { quickPing(); return; } // 짧게 = 위치만
  const blob = new Blob(rec.chunks, { type: mr.mimeType || "audio/mp4" });
  if (!blob.size) { toast("녹음이 비었어 — 다시"); return; }
  sendVoice(blob, mr.mimeType || "audio/mp4");
}

async function sendVoice(blob, mime) {
  toast("📻 전송 중…");
  const ext = mime.includes("webm") ? "webm" : "m4a";
  const path = me + "-" + Date.now() + "." + ext;
  try {
    const up = await sb.storage.from("radio").upload(path, blob, { contentType: mime });
    if (up.error) throw up.error;
    const pub = sb.storage.from("radio").getPublicUrl(path);
    const ins = await sb.from("checkins").insert({
      member: me, place: "📻 음성 교신", note: null,
      lat: lastPos ? lastPos.lat : null, lng: lastPos ? lastPos.lng : null,
      audio: pub.data.publicUrl,
    });
    if (ins.error) throw ins.error;
    beep(); stampFx("📻 음성 교신");
    loadAll();
  } catch (err) {
    console.error(err);
    toast("전송 실패 — 음성은 신호가 있어야 돼 (위치 송신은 짧게 탭)");
  }
}

let player = null;
function playAudio(url, btn) {
  if (player) { player.pause(); player = null; }
  $$(".play-btn").forEach((b) => b.textContent = "▶️");
  player = new Audio(url);
  player.play().catch(() => toast("재생 실패 — 다시 눌러봐"));
  btn.textContent = "🔊";
  player.onended = () => { btn.textContent = "▶️"; };
}

async function quickPing(force) {
  if (!me) return openWho();
  if (!force && inkDrying()) return;
  lastSend = Date.now();
  toast("📻 위치 잡는 중…");
  const pos = await getPosition();
  const r = await qInsert("checkins", {
    member: me, place: "📻 여기!", note: null,
    lat: pos ? pos.lat : null, lng: pos ? pos.lng : null,
  });
  if (r === true) { stampFx("📻 여기!"); loadAll(); }
  else if (r === "queued") renderStamp();
}

function stampFx(place) {
  const box = $("#stamp-fx"), inner = $("#stamp-fx-inner");
  if (!box || !inner) return;
  inner.style.setProperty("--c", colorOf(me));
  inner.innerHTML = '<span class="s-place">' + esc(place) + '</span><span class="s-when">' + hm(new Date()) + '</span><span class="s-who">' + esc(nameOf(me)) + "</span>";
  box.hidden = false;
  inner.classList.remove("slam"); void inner.offsetWidth; inner.classList.add("slam");
  setTimeout(() => { box.hidden = true; }, 950);
}

function openStampModal() {
  if (!me) return openWho();
  $("#stamp-place").value = ""; $("#stamp-note").value = "";
  const wrap = $("#stamp-presets");
  wrap.innerHTML = STAMP_PRESETS.map((p) => '<button class="chip">' + esc(p) + "</button>").join("");
  $$(".chip", wrap).forEach((c) => c.onclick = () => { $("#stamp-place").value = c.textContent; });
  $("#stamp-modal").hidden = false;
}

function getPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => { lastPos = { lat: p.coords.latitude, lng: p.coords.longitude, ts: Date.now() }; resolve(lastPos); },
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }
    );
  });
}

function cabinLat() { return Number(store.settings.cabin_lat || TRIP.cabinLat); }
function cabinLng() { return Number(store.settings.cabin_lng || TRIP.cabinLng); }
function distKm(a, b, c, d) {
  const R = 6371, dLat = (c - a) * Math.PI / 180, dLng = (d - b) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function drawMap(id, opts) {
  opts = opts || {};
  const holder = document.getElementById(id);
  if (!holder || typeof L === "undefined") return;
  let m = maps[id];
  if (m && m.getContainer() !== holder) { try { m.remove(); } catch (e) {} m = null; maps[id] = null; }
  if (!m) {
    m = L.map(id, { zoomControl: false, attributionControl: true });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(m);
    m._mk = [];
    maps[id] = m;
  }
  (m._mk || []).forEach((x) => x.remove()); m._mk = [];
  const pts = [];
  if (opts.route) {
    const wp = WAYPOINTS.concat([{ lat: cabinLat(), lng: cabinLng() }]);
    const line = L.polyline(wp.map((w) => [w.lat, w.lng]), { color: "#7C2E3E", weight: 3, dashArray: "2 8", lineCap: "round" }).addTo(m);
    m._mk.push(line);
    wp.forEach((w) => pts.push([w.lat, w.lng]));
    const start = L.circleMarker([wp[0].lat, wp[0].lng], { radius: 6, color: "#26241E", fillColor: "#26241E", fillOpacity: 1 }).addTo(m).bindPopup("포트무디 — 7:30 집결");
    m._mk.push(start);
  }
  const cabin = L.circleMarker([cabinLat(), cabinLng()], { radius: 8, color: "#26241E", fillColor: "#F3EDE0", fillOpacity: 1 })
    .addTo(m).bindPopup("🏠 숙소");
  m._mk.push(cabin); pts.push([cabinLat(), cabinLng()]);
  const latest = latestByMember();
  for (const mem of MEMBERS) {
    const c = latest[mem.id];
    if (c && c.lat && c.lng) {
      const mk = L.marker([c.lat, c.lng], { icon: L.divIcon({ className: "av-pin", html: '<span class="av big" style="border-color:' + mem.color + '">' + mem.avatar + "</span>", iconSize: [34, 34], iconAnchor: [17, 17] }) })
        .addTo(m).bindPopup("<b>" + mem.avatar + " " + esc(mem.name) + "</b><br>" + esc(c.place) + "<br>" + relTime(c.created_at));
      m._mk.push(mk); pts.push([c.lat, c.lng]);
    }
  }
  if (pts.length > 1) m.fitBounds(pts, { padding: [28, 28] });
  else m.setView(pts[0], 11);
  setTimeout(() => { const mm = maps[id]; if (mm) mm.invalidateSize(); }, 120);
}

/* ---------------- 장부 (장보기 + 지출 + 정산) ---------------- */
function settle() {
  const bal = {}; MEMBERS.forEach((m) => bal[m.id] = 0);
  for (const e of store.expenses) {
    const amt = Number(e.amount) || 0;
    const parts = (e.participants || []).filter((p) => bal[p] !== undefined);
    if (!parts.length) continue;
    const share = amt / parts.length;
    if (bal[e.payer] !== undefined) bal[e.payer] += amt;
    parts.forEach((p) => bal[p] -= share);
  }
  const debt = [], cred = [];
  for (const id in bal) {
    const v = Math.round(bal[id] * 100) / 100;
    if (v < -0.01) debt.push({ id, v: -v });
    if (v > 0.01) cred.push({ id, v });
  }
  debt.sort((a, b) => b.v - a.v); cred.sort((a, b) => b.v - a.v);
  const moves = [];
  let i = 0, j = 0;
  while (i < debt.length && j < cred.length) {
    const x = Math.min(debt[i].v, cred[j].v);
    moves.push({ from: debt[i].id, to: cred[j].id, amt: x });
    debt[i].v -= x; cred[j].v -= x;
    if (debt[i].v < 0.01) i++;
    if (cred[j].v < 0.01) j++;
  }
  return { bal, moves };
}

function renderLedger() {
  const el = $("#tab-ledger");
  const { bal, moves } = settle();
  const total = store.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  // 장보기 리스트 (엑셀 대체)
  let html = '<h2 class="sec" style="margin-top:14px">장보기 리스트</h2>' +
    '<div class="shop-add"><input class="input" id="shop-item" placeholder="살 것 추가 (예: 마시멜로)"><button class="btn" id="shop-go">추가</button></div>' +
    '<div class="card checklist" id="shop-list">';
  const shop = store.shopping.slice().sort((a, b) => (a.done === b.done ? new Date(a.created_at) - new Date(b.created_at) : a.done ? 1 : -1));
  if (!shop.length) html += '<div class="muted">리스트가 비었어. 위에서 추가.</div>';
  for (const s of shop) {
    html += '<label><input type="checkbox" class="shop-check" data-id="' + s.id + '"' + (s.done ? " checked" : "") + ">" +
      '<span class="' + (s.done ? "done" : "") + '">' + esc(s.item) +
      (s.added_by ? ' <span class="muted" style="font-size:11px">' + esc(nameOf(s.added_by)) + "</span>" : "") + "</span>" +
      '<button class="plan-edit shop-del" data-id="' + s.id + '" style="margin-left:auto">✕</button></label>';
  }
  html += '</div><p class="muted" style="margin:2px 4px">계산대 지나면 아래 장부에 금액 한 줄로 — 정산은 자동.</p>';

  html += '<button class="btn" id="exp-add" style="width:100%;margin-top:8px">🧾 장부에 적기</button>';

  html += '<h2 class="sec">정산 — 이렇게 보내면 끝</h2><div class="card">';
  if (!moves.length) html += '<div class="muted">아직 주고받을 게 없음.</div>';
  for (const mv of moves) {
    html += '<div class="settle-row">' + av(mv.from, "mini") + esc(nameOf(mv.from)) +
      " → " + av(mv.to, "mini") + esc(nameOf(mv.to)) +
      '<span class="settle-amt">' + money(mv.amt) + "</span></div>";
  }
  html += "</div>";

  html += '<h2 class="sec">사람별 (+ 받을 돈 / − 보낼 돈)</h2><div class="card totals">';
  for (const m of MEMBERS) {
    const v = Math.round((bal[m.id] || 0) * 100) / 100;
    html += "<div>" + av(m.id, "mini") + '<span style="margin-left:6px">' + esc(m.name) + "</span>" + '<b style="color:' + (v >= 0 ? "var(--pine)" : "var(--danger)") + '">' + (v >= 0 ? "+" : "−") + money(Math.abs(v)) + "</b></div>";
  }
  html += "</div>";

  html += '<h2 class="sec">기록 · 총 ' + money(total) + "</h2>";
  if (!store.expenses.length) html += '<div class="card muted">아직 장부가 하얗다. 코스트코에서 시작해보자.</div>';
  else {
    html += '<div class="ledger">';
    for (const e of store.expenses) {
      html += '<div class="exp-row">' + av(e.payer, "mini") +
        '<span><span class="exp-title">' + esc(e.title) + "</span> " +
        '<span class="exp-meta">' + esc(nameOf(e.payer)) + " · " + esc(e.category || "기타") + " · " + (e.participants || []).length + "명 · " + relTime(e.created_at) + "</span></span>" +
        '<span class="exp-amount">' + money(Number(e.amount)) + "</span>" +
        '<button class="plan-edit exp-del" data-id="' + e.id + '">✕</button></div>';
    }
    html += "</div>";
  }
  el.innerHTML = html;

  $("#exp-add").onclick = openExpModal;
  $("#shop-go").onclick = () => addShopItem("shop-item");
  $("#shop-item").addEventListener("keydown", (e) => { if (e.key === "Enter") addShopItem("shop-item"); });
  $$(".shop-check", el).forEach((cb) => cb.onchange = async () => {
    if (needSb()) return;
    await sb.from("shopping").update({ done: cb.checked }).eq("id", Number(cb.dataset.id));
    loadAll();
  });
  $$(".shop-del", el).forEach((b) => b.onclick = async (e) => {
    e.preventDefault();
    if (needSb()) return;
    await sb.from("shopping").delete().eq("id", Number(b.dataset.id));
    loadAll();
  });
  $$(".exp-del", el).forEach((b) => b.onclick = async () => {
    if (needSb()) return;
    if (!confirm("이 기록 지울까?")) return;
    await sb.from("expenses").delete().eq("id", Number(b.dataset.id));
    loadAll();
  });
}

async function addShopItem(inputId) {
  if (!me) return openWho();
  const inp = document.getElementById(typeof inputId === "string" ? inputId : "shop-item");
  if (!inp) return;
  const v = inp.value.trim();
  if (!v) return;
  const r = await qInsert("shopping", { item: v, added_by: me });
  inp.value = "";
  if (r === true) loadAll();
}

let expPayer = "", expParts = [], expCat = "장보기";
function openExpModal() {
  if (!me) return openWho();
  expPayer = me; expParts = MEMBERS.map((m) => m.id); expCat = "장보기";
  $("#exp-title").value = ""; $("#exp-amount").value = "";
  drawExpChips();
  $("#exp-modal").hidden = false;
}
function drawExpChips() {
  $("#exp-payer").innerHTML = MEMBERS.map((m) =>
    '<button class="chip' + (expPayer === m.id ? " on" : "") + '" data-id="' + m.id + '">' + esc(m.name) + "</button>").join("");
  $$("#exp-payer .chip").forEach((c) => c.onclick = () => { expPayer = c.dataset.id; drawExpChips(); });
  $("#exp-parts").innerHTML = MEMBERS.map((m) =>
    '<button class="chip' + (expParts.includes(m.id) ? " on" : "") + '" data-id="' + m.id + '">' + esc(m.name) + "</button>").join("");
  $$("#exp-parts .chip").forEach((c) => c.onclick = () => {
    const id = c.dataset.id;
    expParts = expParts.includes(id) ? expParts.filter((x) => x !== id) : expParts.concat(id);
    drawExpChips();
  });
  $("#exp-cat").innerHTML = EXPENSE_CATEGORIES.map((k) =>
    '<button class="chip' + (expCat === k ? " on" : "") + '">' + esc(k) + "</button>").join("");
  $$("#exp-cat .chip").forEach((c) => c.onclick = () => { expCat = c.textContent; drawExpChips(); });
}

/* ---------------- 정보 ---------------- */
function renderInfo() {
  const el = $("#tab-info");
  const s = store.settings;
  const myName = me ? nameOf(me) : "미선택";
  let html = "";

  html += '<h2 class="sec">숙소</h2><div class="card">' +
    "<b>" + esc(TRIP.cabinName) + "</b>" +
    '<div class="kv"><b>주소</b><span class="code-line"><span style="font-size:13.5px">Unit #1, 9995 McCulloch Rd</span><button class="btn ghost small cp" data-copy="9995 McCulloch Rd, Kelowna, BC" data-lb="주소">복사</button></span></div>' +
    '<div class="muted">켈로나 동남쪽 산속, Hydraulic Lake 호숫가 — GPS 말고 Hwy 33 경로 확인</div>' +
    '<div class="kv"><b>체크인</b><span>목 16:00 (셀프, 스마트락)</span></div>' +
    '<div class="kv"><b>체크아웃</b><span>토 10:00</span></div>' +
    '<div class="kv"><b>도어코드</b><span class="code-line"><span class="code-val">' + (s.door_code ? esc(s.door_code) : "—") + "</span>" + (s.door_code ? '<button class="btn ghost small cp" data-copy="' + esc(s.door_code) + '" data-lb="도어코드">복사</button>' : "") + '<button class="btn ghost small" id="edit-door">입력</button></span></div>' +
    '<div class="kv"><b>Wi-Fi</b><span class="code-line"><span class="code-val">' + (s.wifi_code ? esc(s.wifi_code) : "—") + "</span>" + (s.wifi_code ? '<button class="btn ghost small cp" data-copy="' + esc(s.wifi_code) + '" data-lb="Wi-Fi">복사</button>' : "") + '<button class="btn ghost small" id="edit-wifi">입력</button></span></div>' +
    "</div>";

  html += '<div class="card stitch"><b>호스트(Kelly) 규칙 — 진짜 중요</b><ul class="rule-list">' +
    "<li><b>반드시 Hwy 33</b>으로 진입 — 임도 금지, GPS 못 믿음. 지도 스크린샷 미리</li>" +
    "<li>산길 셀신호 약함 — 이 수첩은 마지막 본 내용을 저장해두고, 쓴 건 신호 잡히면 자동 송신</li>" +
    "<li>수돗물이 호수물 — <b>생수 지참</b> (핫텁 물 뿌연 것도 이 때문, 정상)</li>" +
    "<li>정화조 민감 — 변기엔 <b>휴지만</b> (물티슈는 '변기용'이라 써 있어도 금지)</li>" +
    "<li>Wi-Fi 비번은 숙소 안 QR</li></ul></div>";

  html += '<h2 class="sec">이동 · 차</h2><div class="card">' +
    '<div class="kv"><b>집결</b><span>목 7:30 희정이네 (포트무디) — 재형 데드라인</span></div>' +
    '<div class="kv"><b>출발</b><span>8:00 · A조 4명 / B조 2명 (상우·다흰, 랭리)</span></div>' +
    '<div class="kv"><b>주차</b><span>안 가는 차는 희정이네</span></div>' +
    '<div class="kv"><b>기름값</b><span>각자 탄 차에서 n빵 (장부에 참여자만 골라서 적으면 됨)</span></div>' +
    '<div class="kv"><b>안전</b><span>신호 없는 구간 대비 — 아이폰 위성 SOS 캐나다 지원</span></div>' +
    "</div>";

  html += '<h2 class="sec">역할</h2><div class="card">' +
    '<div class="kv"><b>플랜·정산</b><span>재민 · 희정 (+ 산불 체크, 출발/도착, 와이너리)</span></div>' +
    '<div class="kv"><b>술·게임</b><span>재형 커플</span></div>' +
    '<div class="kv"><b>음식</b><span>상우 · 다흰 (장보기 리스트는 장부 탭)</span></div>' +
    '<div class="kv"><b>벙커베드</b><span>게임 져서 정함 · 이틀 연속 금지</span></div>' +
    "</div>";

  html += '<h2 class="sec">현지 체크 — 자동</h2>' +
    '<div id="aq-info">' + aqHtml() + "</div>" +
    '<div class="card linkline">' +
    '<div id="weather" class="muted">숙소 날씨 불러오는 중…</div>' +
    '<div class="kv"><b>도로</b><span><a href="https://www.drivebc.ca" target="_blank" rel="noopener">DriveBC — Hwy 상황</a></span></div>' +
    '<div class="kv"><b>산불</b><span><a href="https://wildfiresituation.nrs.gov.bc.ca/map" target="_blank" rel="noopener">BC Wildfire 지도</a> — 불 위치는 여기서, 연기는 위 공기질로</span></div>' +
    "</div>";

  html += '<h2 class="sec">앨범 · 기타</h2><div class="card">' +
    '<div class="kv"><b>공유 앨범</b><span class="code-line">' + (s.album_url ? '<a href="' + esc(s.album_url) + '" target="_blank" rel="noopener">열기</a>' : '<span class="muted">iCloud 공유 앨범 만들어서 링크 넣기</span>') + ' <button class="btn ghost small" id="edit-album">링크</button></span></div>' +
    '<div class="kv"><b>숙소 좌표</b><span class="code-line"><span class="muted">' + esc(String(cabinLat())) + ", " + esc(String(cabinLng())) + '</span><button class="btn ghost small" id="edit-coord">수정</button></span></div>' +
    '<div class="kv"><b>나</b><span class="code-line">' + (me ? av(me, "mini") + " " : "") + '<b style="color:' + (me ? colorOf(me) : "inherit") + '">' + esc(myName) + '</b><button class="btn ghost small" id="edit-me">변경</button></span></div>' +
    '<div class="kv"><b>튜토리얼</b><span><button class="btn ghost small" id="tut-again">다시 보기</button></span></div>' +
    '<div class="kv"><b>홈 미리보기</b><span class="chip-row" style="margin:0" id="preview-row">' +
    [["", "자동"], ["drive", "🚗 이동"], ["winery", "🍷 와이너리"], ["costco", "🛒 코스트코"], ["arrival", "🏠 도착"], ["cabin", "🗺️ 지도"]].map((pv) =>
      '<button class="chip' + (modeOverride === pv[0] ? " on" : "") + '" data-pv="' + pv[0] + '">' + pv[1] + "</button>").join("") +
    "</span></div>" +
    '<div class="kv"><b>테마</b><span class="chip-row" style="margin:0" id="theme-row">' +
    [["", "📓 수첩"], ["dark", "🌙 다크"], ["clean", "⬜ 클린"]].map((td) =>
      '<button class="chip' + ((localStorage.getItem("kel_theme") || "") === td[0] ? " on" : "") + '" data-th="' + td[0] + '">' + td[1] + "</button>").join("") +
    "</span></div>" +
    "</div>";

  html += '<p class="muted" style="margin:14px 4px">Safari 공유 버튼 → "홈 화면에 추가" 하면 앱처럼 열려. 6명 다 해두자.</p>';

  el.innerHTML = html;
  $("#edit-door").onclick = () => editSetting("door_code", "도어코드 (호스트 메시지에 있음)");
  $("#edit-wifi").onclick = () => editSetting("wifi_code", "Wi-Fi 비밀번호");
  $("#edit-album").onclick = () => editSetting("album_url", "공유 앨범 링크 (https://…)");
  $("#edit-coord").onclick = editCoord;
  $("#edit-me").onclick = openWho;
  const ta = $("#tut-again"); if (ta) ta.onclick = openTut;
  $$("#preview-row .chip").forEach((c) => c.onclick = () => {
    modeOverride = c.dataset.pv;
    switchTab("home");
    if (modeOverride) toast("시연 모드 — 당일엔 시간·위치 따라 자동으로 떠");
  });
  $$("#theme-row .chip").forEach((c) => c.onclick = () => {
    const th = c.dataset.th;
    if (th) { localStorage.setItem("kel_theme", th); document.documentElement.setAttribute("data-theme", th); }
    else { localStorage.removeItem("kel_theme"); document.documentElement.removeAttribute("data-theme"); }
    rerender();
  });
  bindCopies(el);
  loadWeather();
}

async function editSetting(key, label) {
  if (needSb()) return;
  const v = prompt(label, store.settings[key] || "");
  if (v === null) return;
  await sb.from("settings").upsert({ key, value: v.trim() });
  loadAll();
}
async function editCoord() {
  if (needSb()) return;
  const v = prompt("숙소 좌표 (위도, 경도)", cabinLat() + ", " + cabinLng());
  if (!v) return;
  const m = v.split(",").map((x) => Number(x.trim()));
  if (m.length !== 2 || m.some(isNaN)) return toast("형식: 49.771, -119.209");
  await sb.from("settings").upsert([{ key: "cabin_lat", value: String(m[0]) }, { key: "cabin_lng", value: String(m[1]) }]);
  loadAll();
}

async function loadWeather() {
  const el = $("#weather");
  if (!el) return;
  try {
    const u = "https://api.open-meteo.com/v1/forecast?latitude=" + cabinLat() + "&longitude=" + cabinLng() +
      "&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,sunset&forecast_days=1&timezone=auto";
    const r = await fetch(u); const d = await r.json();
    const code = d.current.weather_code;
    const sky = code === 0 ? "맑음" : code < 4 ? "구름 조금" : code < 50 ? "흐림" : code < 70 ? "비" : code < 80 ? "눈?" : "소나기";
    const sunset = (d.daily.sunset && d.daily.sunset[0]) ? d.daily.sunset[0].slice(11, 16) : "";
    el.innerHTML = "🌤️ 숙소 부근 지금 <b>" + Math.round(d.current.temperature_2m) + "°C · " + sky + "</b>" +
      " (최고 " + Math.round(d.daily.temperature_2m_max[0]) + "° / 최저 " + Math.round(d.daily.temperature_2m_min[0]) + "°)" +
      (sunset ? " · 일몰 " + sunset : "");
  } catch (e) { el.textContent = "날씨는 신호 잡히면 다시 떠."; }
}

function fillInstallGuide() {
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const chromeIOS = isIOS && /CriOS/i.test(ua);
  const box = $("#ig-body");
  if (!box) return;
  const shareSvg = '<svg class="ig-ic" width="20" height="24" viewBox="0 0 22 26"><rect x="2" y="9" width="18" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 14 V2 M11 2 L6.5 6.5 M11 2 L15.5 6.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const plusSvg = '<svg class="ig-ic" width="20" height="20" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7 v10 M7 12 h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  let steps;
  if (chromeIOS) {
    steps = [
      ["크롬 주소창 오른쪽 <b>공유 버튼</b> 탭 " + shareSvg, ""],
      ['메뉴에서 <b>"홈 화면에 추가"</b> ' + plusSvg, "안 보이면 아래로 스크롤"],
      ["오른쪽 위 <b>추가</b>", "홈 화면에 아이콘 생김"],
      ["<b>Safari가 더 매끄러워</b>", "사파리로 이 주소를 열어서 같은 방법으로 해도 됨"],
    ];
  } else if (isIOS) {
    steps = [
      ["Safari로 열려 있는지 확인", "카톡 브라우저면 위 배너의 'Safari로 열기'부터"],
      ["하단 가운데 <b>공유 버튼</b> 탭 " + shareSvg, ""],
      ['아래로 스크롤 → <b>"홈 화면에 추가"</b> ' + plusSvg, ""],
      ["오른쪽 위 <b>추가</b>", "끝! 홈 화면에 아이콘 생김"],
    ];
  } else {
    steps = [
      ["주소창 오른쪽 <b>설치 아이콘</b>(⊕ 또는 모니터 모양) 클릭", ""],
      ["<b>설치</b> 누르기", "안 보이면 ⋮ 메뉴 → '앱으로 설치' 또는 'Install'"],
      ["창이 앱처럼 떠서 끝", "안드로이드는 홈 화면에 아이콘 생김"],
    ];
  }
  box.innerHTML = steps.map((st, i) =>
    '<div class="ig-step"><span class="ig-num">' + (i + 1) + "</span><div>" + st[0] +
    (st[1] ? '<br><span class="muted">' + st[1] + "</span>" : "") + "</div></div>").join("");
}

/* ---------------- 튜토리얼 ---------------- */
const TUT = [
  { ic: "🏕️", t: "홈 — 지금 뭐 할 차례?", d: "일정 따라 '지금' 카드가 자동으로 바뀌어. 급한 결정은 투표 걸면 실시간 집계." },
  { ic: "📻", t: "무전 — 진짜 무전기임", d: "큰 버튼 꾹 누르고 말하면 음성 전송, 짧게 탭하면 위치만. \"어디십니까\" 같은 빠른 무전도 원탭. 친구 카드 탭하면 위치 요청이 날아가." },
  { ic: "🚽", t: "긴급 버튼", d: "화장실 위기엔 무전 탭 맨 아래 빨간 버튼. 익명이고, 전원 폰에 사이렌이 울려. 10분에 한 번만." },
  { ic: "🧾", t: "장부 — 정산은 자동", d: "산 사람이 그 자리에서 한 줄만 적으면 끝. 마지막에 누가 누구한테 얼마 보낼지 자동 계산." },
  { ic: "🎒", t: "준비 끝!", d: "Wi-Fi·도어코드·숙소 규칙은 정보 탭. 금요일에 뭐 할지는 일정 탭 → 제안 보드에서 골라." },
];
let tutIdx = 0, tutList = TUT;
function openTut() {
  tutList = TUT.slice();
  if (!isStandalone()) tutList.splice(tutList.length - 1, 0,
    { ic: "📲", t: "홈 화면에 설치", d: "앱처럼 전체화면으로 쓰려면 설치가 최고야. 상단 배너의 '방법 보기' 누르면 그림으로 알려줘." });
  tutIdx = 0; drawTut(); $("#tut-modal").hidden = false;
}
function drawTut() {
  const st = tutList[tutIdx];
  $("#tut-body").innerHTML = '<div class="tut-ic">' + st.ic + '</div>' +
    '<p class="modal-title" style="text-align:center">' + st.t + "</p>" +
    '<p class="tut-d">' + st.d + "</p>";
  $("#tut-dots").innerHTML = tutList.map((_, i) => '<span class="tut-dot' + (i === tutIdx ? " on" : "") + '"></span>').join("");
  $("#tut-next").textContent = tutIdx === tutList.length - 1 ? "시작하기" : "다음";
}
function closeTut() { localStorage.setItem("kel_tut", "1"); $("#tut-modal").hidden = true; }

/* ---------------- 나 선택 ---------------- */
function openWho() {
  const g = $("#who-grid");
  g.innerHTML = MEMBERS.map((m) =>
    '<button class="who-btn" data-id="' + m.id + '" style="border-color:' + m.color + ";color:" + m.color + '">' +
    '<span class="av who-av" style="border-color:' + m.color + '">' + m.avatar + "</span>" +
    esc(m.name) + "</button>").join("");
  $$(".who-btn", g).forEach((b) => b.onclick = () => {
    if (g.dataset.lock) return;
    g.dataset.lock = "1";
    b.classList.add("picked");
    setTimeout(() => {
      delete g.dataset.lock;
      me = b.dataset.id;
      localStorage.setItem("kel_me", me);
      $("#who-modal").hidden = true;
      rerender();
      toast("🎮 " + avatarOf(me) + " " + nameOf(me) + " 선택! 이 폰은 이제 네 수첩이야");
      if (!localStorage.getItem("kel_tut")) setTimeout(openTut, 400);
    }, 320);
  });
  $("#who-modal").hidden = false;
}

/* ---------------- 알림 모달 ---------------- */
function openAlerts() {
  $("#bell-dot").hidden = true;
  const list = $("#alert-list");
  list.innerHTML = alertLog.length
    ? alertLog.map((a) => '<div class="alert-row">' + esc(a.msg) + '<span class="when">' + relTime(a.ts) + "</span></div>").join("")
    : '<div class="muted">아직 조용하네.</div>';
  $("#alert-modal").hidden = false;
}

/* ---------------- 모달 저장 핸들러 ---------------- */
function wireModals() {
  $$(".modal").forEach((m) => m.addEventListener("click", (e) => { if (e.target === m && m.id !== "who-modal") m.hidden = true; }));
  $("#alert-close").onclick = () => $("#alert-modal").hidden = true;
  $("#tut-skip").onclick = closeTut;
  $("#install-close").onclick = () => $("#install-modal").hidden = true;
  $("#tut-next").onclick = () => { if (tutIdx >= tutList.length - 1) closeTut(); else { tutIdx++; drawTut(); } };
  $("#stamp-cancel").onclick = () => $("#stamp-modal").hidden = true;
  $("#exp-cancel").onclick = () => $("#exp-modal").hidden = true;
  $("#poll-cancel").onclick = () => $("#poll-modal").hidden = true;
  $("#wish-cancel").onclick = () => $("#wish-modal").hidden = true;
  $("#wine-cancel").onclick = () => $("#wine-modal").hidden = true;
  $("#emg-x").onclick = () => { stopSirenSound(); $("#emg").hidden = true; };
  $("#wine-save").onclick = async () => {
    if (needSb()) return;
    if (!wineWinery) return toast("어느 와이너리인지 골라줘");
    if (!wineStars) return toast("별점을 눌러줘");
    const price = Number($("#wine-price").value);
    const { error } = await sb.from("wine_ratings").insert({
      member: me, winery: wineWinery, stars: wineStars,
      wine: $("#wine-name").value.trim() || null,
      price: price > 0 ? price : null,
      note: $("#wine-note").value.trim() || null,
    });
    if (error) return toast("실패 — 다시 시도");
    $("#wine-modal").hidden = true;
    toast("🍷 기록됨");
    loadAll();
  };
  $("#it-cancel").onclick = () => $("#it-modal").hidden = true;

  $("#stamp-save").onclick = async () => {
    const place = $("#stamp-place").value.trim();
    if (!place) return toast("장소를 골라줘");
    if (inkDrying()) return;
    let pos = null;
    if ($("#stamp-gps").checked) { toast("위치 잡는 중…"); pos = await getPosition(); }
    const r = await qInsert("checkins", {
      member: me, place, note: $("#stamp-note").value.trim() || null,
      lat: pos ? pos.lat : null, lng: pos ? pos.lng : null,
    });
    if (r === false) return;
    $("#stamp-modal").hidden = true;
    if (r === true) { stampFx(place); loadAll(); }
  };

  $("#exp-save").onclick = async () => {
    const title = $("#exp-title").value.trim();
    const amount = Number($("#exp-amount").value);
    if (!title || !amount) return toast("항목이랑 금액은 필수");
    if (!expParts.length) return toast("누구 몫인지 최소 1명");
    const r = await qInsert("expenses", { payer: expPayer, title, amount, participants: expParts, category: expCat });
    if (r === false) return;
    $("#exp-modal").hidden = true;
    if (r === true) loadAll();
  };

  $("#poll-save").onclick = async () => {
    if (needSb()) return;
    const q = $("#poll-q").value.trim();
    const opts = ["#poll-o1", "#poll-o2", "#poll-o3", "#poll-o4"].map((s) => $(s).value.trim()).filter(Boolean);
    if (!q || opts.length < 2) return toast("질문 + 선택지 2개 이상");
    const { error } = await sb.from("polls").insert({ question: q, options: opts, created_by: nameOf(me) });
    if (error) return toast("실패 — 다시 시도");
    $("#poll-modal").hidden = true; loadAll();
  };

  $("#wish-save").onclick = async () => {
    if (needSb()) return;
    const title = $("#wish-title").value.trim();
    if (!title) return toast("내용을 적어줘");
    const { error } = await sb.from("wishes").insert({ member: me, title, category: wishCat });
    if (error) return toast("실패 — 다시 시도");
    $("#wish-modal").hidden = true; loadAll();
  };

  $("#it-save").onclick = async () => {
    if (needSb()) return;
    const sel = $("#it-day .chip.on");
    const day = sel ? sel.dataset.day : planDay;
    const t = $("#it-time").value.trim(), title = $("#it-title").value.trim(), note = $("#it-note").value.trim();
    if (!title) return toast("제목은 필수");
    if (itEditing) await sb.from("itinerary").update({ day, t, title, note }).eq("id", itEditing.id);
    else {
      const maxSort = Math.max(0, ...itemsFor(day).map((r) => r.sort || 0));
      await sb.from("itinerary").insert({ day, t, title, note, sort: maxSort + 10 });
    }
    $("#it-modal").hidden = true; loadAll();
  };
  $("#it-delete").onclick = async () => {
    if (needSb() || !itEditing) return;
    if (!confirm("이 일정 지울까?")) return;
    await sb.from("itinerary").delete().eq("id", itEditing.id);
    $("#it-modal").hidden = true; loadAll();
  };
}

/* ---------------- 전체 렌더 ---------------- */
function renderTab(tab) {
  if (tab === "home") renderHome();
  else if (tab === "plan") renderPlan();
  else if (tab === "stamp") renderStamp();
  else if (tab === "ledger") renderLedger();
  else if (tab === "info") renderInfo();
}
function rerender() {
  document.documentElement.style.setProperty("--accent", phase() === "during" ? dayTheme() : "#7C2E3E");
  $("#phase-label").textContent = phaseLabel();
  const chip = $("#me-chip");
  if (chip) { chip.hidden = !me; if (me) chip.innerHTML = av(me); }
  const y = window.scrollY;
  renderTab(currentTab);
  window.scrollTo(0, y);
  checkRequests();
}

/* ---------------- 시작 ---------------- */
function boot() {
  const th = localStorage.getItem("kel_theme");
  if (th) document.documentElement.setAttribute("data-theme", th);
  initSb();
  wireModals();
  $("#bell").onclick = openAlerts;
  const mc = $("#me-chip"); if (mc) mc.onclick = openWho;
  $$("#tabbar .tb").forEach((b) => b.onclick = () => switchTab(b.dataset.tab));
  if (!me) openWho();
  loadAll();
  subscribe();
  loadAQ();
  flushQueue();
  showInstall();

  // 위치 권한이 이미 있으면 조용히 한 번 받아서 '숙소 근처 모드' 판단
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: "geolocation" }).then((st) => {
      if (st.state === "granted") getPosition().then(() => renderHome());
    }).catch(() => {});
  }

  // 1분: '지금' 카드 · 5분: 데이터 · 30분: 공기질
  let lastNowKey = "";
  setInterval(() => {
    const nn = nowAndNext();
    const key = todayStr() + "-" + (nn.cur ? nn.cur.id : 0) + "-" + (nn.next ? nn.next.id : 0);
    if (key !== lastNowKey) {
      lastNowKey = key;
      if (currentTab === "home" || currentTab === "plan") { const y = window.scrollY; renderTab(currentTab); window.scrollTo(0, y); }
    }
  }, 60000);
  setInterval(() => { loadAll(); flushQueue(); }, 300000);
  setInterval(loadAQ, 1800000);
  setInterval(tickDep, 1000);
  setInterval(refreshLiveETA, 60000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { loadAll(); flushQueue(); } });
  window.addEventListener("online", () => { loadAll(); flushQueue(); });

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", boot);
