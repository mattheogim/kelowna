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
  settings: {}, loadedAt: null,
};
let sb = null;
let me = localStorage.getItem("kel_me") || "";
let currentTab = "home";
let planDay = null;
let map = null, mapMarkers = [];
let lastPos = null;
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
  } else if (isIOS) {
    inner = '📲 앱처럼 쓰려면: 하단 <b>공유(⬆️) 버튼 → "홈 화면에 추가"</b>';
  } else return;
  b.innerHTML = inner + '<button class="ib-x" id="ib-close" aria-label="닫기">✕</button>';
  b.hidden = false;
  $("#ib-close").onclick = () => { localStorage.setItem("kel_a2hs", "1"); b.hidden = true; };
  const os = $("#open-safari");
  if (os) os.onclick = () => { location.href = "kakaotalk://web/openExternal?url=" + encodeURIComponent(location.href); };
  const di = $("#do-install");
  if (di) di.onclick = () => { if (!deferredPrompt) return; deferredPrompt.prompt(); deferredPrompt = null; b.hidden = true; };
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
    const [it, po, vo, ex, ch, wi, wl, sh, se] = await Promise.all([
      sb.from("itinerary").select("*").order("day").order("sort"),
      sb.from("polls").select("*").order("created_at", { ascending: false }),
      sb.from("votes").select("*"),
      sb.from("expenses").select("*").order("created_at", { ascending: false }),
      sb.from("checkins").select("*").order("created_at", { ascending: false }).limit(300),
      sb.from("wishes").select("*").order("created_at"),
      sb.from("wish_likes").select("*"),
      sb.from("shopping").select("*").order("created_at"),
      sb.from("settings").select("*"),
    ]);
    const bad = [it, po, vo, ex, ch, wi, wl, sh, se].find((r) => r.error);
    if (bad) throw bad.error;
    store.itinerary = it.data; store.polls = po.data; store.votes = vo.data;
    store.expenses = ex.data; store.checkins = ch.data;
    store.wishes = wi.data; store.wishLikes = wl.data; store.shopping = sh.data;
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
  ["checkins", "expenses", "polls", "votes", "itinerary", "wishes", "wish_likes", "shopping"].forEach((t) => {
    ch.on("postgres_changes", { event: "*", schema: "public", table: t }, (p) => onLive(t, p));
  });
  ch.subscribe();
}

function onLive(table, payload) {
  scheduleLoad();
  if (payload.eventType !== "INSERT") return;
  const r = payload.new || {};
  const actor = r.member || r.payer || r.added_by || r.created_by || "";
  if (actor === me) return;
  let msg = "", tab = "";
  if (table === "checkins") { msg = "📻 " + nameOf(actor) + " — " + r.place + (r.note ? " · " + r.note : ""); tab = "stamp"; }
  if (table === "expenses") { msg = nameOf(actor) + "가 장부에 적음: " + r.title + " " + money(Number(r.amount)); tab = "ledger"; }
  if (table === "polls") { msg = "새 투표: " + r.question; tab = "home"; }
  if (table === "itinerary") { msg = "일정 추가됨: " + r.title; tab = "plan"; }
  if (table === "wishes") { msg = "금요일 제안: " + r.title; tab = "plan"; }
  if (table === "shopping") { msg = "장보기 추가: " + r.item; tab = "ledger"; }
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
function itemsFor(day) {
  return store.itinerary.filter((r) => r.day === day).slice().sort((a, b) => (a.sort || 0) - (b.sort || 0));
}
function nowAndNext() {
  const items = itemsFor(todayStr());
  const timed = items.filter((r) => /^\d{1,2}:\d{2}$/.test(r.t || ""));
  const now = hm(new Date());
  let cur = null, next = null;
  for (const r of timed) { if (r.t <= now) cur = r; else { next = r; break; } }
  if (!cur && timed.length) next = timed[0];
  return { cur, next };
}

function renderHome() {
  const el = $("#tab-home");
  const p = phase();
  let html = "";

  if (p === "before") {
    const d = Math.max(0, Math.ceil((new Date(TRIP.start + "T08:00:00") - new Date()) / 86400000));
    html += '<div class="now-card"><div class="now-eyebrow">출발까지</div>' +
      '<div class="dday">D-' + d + '</div>' +
      '<div class="now-note">목 7:30 포트무디 집결 → 8:00 출발</div></div>';
    html += '<div id="aq-home">' + aqHtml() + "</div>";
    html += '<h2 class="sec">준비물</h2><div class="card checklist" id="checklist"></div>';
  }

  if (p === "during") {
    const { cur, next } = nowAndNext();
    html += '<div class="now-card" style="border-color:' + dayTheme() + '">' +
      '<div class="now-eyebrow" style="color:' + dayTheme() + '">지금</div>' +
      '<div class="now-title">' + esc(cur ? cur.title : "자유시간") + "</div>" +
      (cur && cur.note ? '<div class="now-note">' + esc(cur.note) + "</div>" : "") +
      (next ? '<div class="now-next">다음 → <b>' + esc(next.t) + " " + esc(next.title) + "</b></div>" : "") +
      "</div>";
    html += '<div class="radio-row">' +
      '<button class="stamp-big alt half" id="home-ping">📻 나 여기야!</button>' +
      '<button class="stamp-big half" id="home-stamp">📮 도장+한마디</button></div>';
    html += '<div id="aq-home">' + aqHtml() + "</div>";
    html += cabinCardHtml();
  }

  if (p === "after") {
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

  if (p === "before") renderChecklist();
  const np = $("#new-poll"); if (np) np.onclick = openPollModal;
  const hp = $("#home-ping"); if (hp) hp.onclick = quickPing;
  const hs = $("#home-stamp"); if (hs) hs.onclick = openStampModal;
  bindPolls(el);
}

function cabinCardHtml() {
  const reveal = new Date() >= new Date(TRIP.doorCodeRevealAt);
  const near = lastPos && distKm(lastPos.lat, lastPos.lng, cabinLat(), cabinLng()) <= TRIP.nearCabinKm;
  if (!reveal && !near) return "";
  const door = store.settings.door_code, wifi = store.settings.wifi_code;
  return '<div class="card stitch"><b>🏠 ' + esc(TRIP.cabinName) + "</b>" +
    '<div class="kv"><b>도어코드</b><span class="code-val">' + (door ? esc(door) : '<span class="muted" style="font-size:13px">정보 탭에서 입력</span>') + "</span></div>" +
    '<div class="kv"><b>Wi-Fi</b><span class="code-val">' + (wifi ? esc(wifi) : '<span class="muted" style="font-size:13px">숙소 안 QR / 정보 탭에서 입력</span>') + "</span></div>" +
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
      '<button class="plan-edit" data-id="' + r.id + '">✎</button></div>';
  }
  html += "</div>";
  html += '<button class="btn ghost" id="it-add" style="width:100%">+ 일정 추가</button>';

  // 목요일: 4번째 와이너리 — 둘 다 보여주기
  if (planDay === TRIP.days[0].date) {
    html += '<h2 class="sec">4번째 와이너리 — 그날 결정</h2><div class="card">' +
      '<div class="kv"><b>안 1</b><span><b>Volcanic Hills</b> — Boucherie Rd 와인 트레일</span></div>' +
      '<div class="kv"><b>안 2</b><span><b>Mt. Boucherie</b> — 바로 근처</span></div>' +
      '<div class="muted">같은 동네라 컨디션 되면 둘 다, 힘들면 패스. 그날 홈 탭에서 투표 하나 걸어도 됨.</div></div>';
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
    '<button class="ptt" id="do-ping"><span class="ptt-ic">📻</span>나 여기야!</button>' +
    '<p class="ptt-hint">누르면 내 위치가 다들 폰에 바로 뜸<br>신호 없으면 잡히는 순간 자동 송신</p>' +
    '<div class="status-row">' +
    '<span class="chip">' + (online ? "🟢 신호 있음" : "🔴 오프라인") + "</span>" +
    (myLast ? '<span class="chip">내 마지막 송신 ' + relTime(myLast.created_at) + "</span>" : "") +
    (queue.length ? '<span class="chip" style="color:var(--wine)">대기 ' + queue.length + "건</span>" : "") +
    "</div></div>" +
    '<button class="stamp-big" id="do-stamp">📮 도장 찍고 한마디 남기기</button>';

  html += '<h2 class="sec">교신 — 지금 다들 어디?</h2><div class="board">';
  for (const m of MEMBERS) {
    const c = latest[m.id];
    html += '<div class="board-card"><div class="board-name">' + av(m.id, "mini") + esc(m.name) + "</div>" +
      (c ? '<div class="board-place">' + esc(c.place) + '</div><div class="board-when">' + relTime(c.created_at) + (c.lat ? " · 📍" : "") + "</div>" +
        (c.note ? '<div class="board-note">' + esc(c.note) + "</div>" : "")
        : '<div class="board-when">아직 소식 없음</div>') +
      "</div>";
  }
  html += "</div>";

  html += '<h2 class="sec">지도</h2><div id="map"></div>';

  html += '<h2 class="sec">여권 — 스탬프 수집</h2><div class="card">';
  for (const m of MEMBERS) {
    const n = store.checkins.filter((c) => c.member === m.id).length;
    html += '<div class="passport-row">' + av(m.id, "mini") + esc(m.name) +
      '<span class="passport-count">' + n + "개</span></div>";
  }
  html += "</div>";

  html += '<h2 class="sec">교신 기록</h2><div class="card feed">';
  if (!store.checkins.length) html += '<div class="muted">첫 교신의 주인공은?</div>';
  for (const c of store.checkins.slice(0, 40)) {
    html += '<div class="feed-row">' + av(c.member, "mini") + '<span class="feed-who" style="color:' + colorOf(c.member) + '">' + esc(nameOf(c.member)) + "</span>" +
      '<span class="feed-body">' + esc(c.place) + (c.note ? ' <span class="feed-note">' + esc(c.note) + "</span>" : "") + "</span>" +
      '<span class="feed-when">' + relTime(c.created_at) + "</span></div>";
  }
  html += "</div>";

  html += '<h2 class="sec">도장첩</h2><div class="stamp-wall">';
  store.checkins.slice(0, 30).forEach((c, i) => {
    const rot = (i % 5) * 4 - 8;
    html += '<div class="stamp" style="--c:' + colorOf(c.member) + ";--rot:" + rot + 'deg">' +
      '<span class="s-place">' + esc(c.place) + "</span>" +
      '<span class="s-when">' + relTime(c.created_at) + "</span>" +
      '<span class="s-who">' + esc(nameOf(c.member)) + "</span></div>";
  });
  html += "</div>";

  el.innerHTML = html;
  $("#do-stamp").onclick = openStampModal;
  $("#do-ping").onclick = quickPing;
  map = null;
  if (currentTab === "stamp") setTimeout(initMap, 60);
}

async function quickPing() {
  if (!me) return openWho();
  if (inkDrying()) return;
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

function initMap() {
  const holder = $("#map");
  if (!holder || typeof L === "undefined") return;
  if (!map) {
    map = L.map("map", { zoomControl: false, attributionControl: true });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(map);
  }
  mapMarkers.forEach((m) => m.remove()); mapMarkers = [];
  const pts = [];
  const cabin = L.circleMarker([cabinLat(), cabinLng()], { radius: 8, color: "#26241E", fillColor: "#F3EDE0", fillOpacity: 1 })
    .addTo(map).bindPopup("🏠 숙소");
  mapMarkers.push(cabin); pts.push([cabinLat(), cabinLng()]);
  const latest = latestByMember();
  for (const m of MEMBERS) {
    const c = latest[m.id];
    if (c && c.lat && c.lng) {
      const mk = L.marker([c.lat, c.lng], { icon: L.divIcon({ className: "av-pin", html: '<span class="av big" style="border-color:' + m.color + '">' + m.avatar + "</span>", iconSize: [34, 34], iconAnchor: [17, 17] }) })
        .addTo(map).bindPopup("<b>" + m.avatar + " " + esc(m.name) + "</b><br>" + esc(c.place) + "<br>" + relTime(c.created_at));
      mapMarkers.push(mk); pts.push([c.lat, c.lng]);
    }
  }
  if (pts.length > 1) map.fitBounds(pts, { padding: [30, 30] });
  else map.setView(pts[0], 11);
  setTimeout(() => map && map.invalidateSize(), 120);
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
  $("#shop-go").onclick = addShopItem;
  $("#shop-item").addEventListener("keydown", (e) => { if (e.key === "Enter") addShopItem(); });
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

async function addShopItem() {
  if (!me) return openWho();
  const v = $("#shop-item").value.trim();
  if (!v) return;
  const r = await qInsert("shopping", { item: v, added_by: me });
  $("#shop-item").value = "";
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
    '<div class="muted">9995 McCulloch Rd #1 — 켈로나 동남쪽 산속, Hydraulic Lake 호숫가</div>' +
    '<div class="kv"><b>체크인</b><span>목 16:00 (셀프, 스마트락)</span></div>' +
    '<div class="kv"><b>체크아웃</b><span>토 10:00</span></div>' +
    '<div class="kv"><b>도어코드</b><span class="code-line"><span class="code-val">' + (s.door_code ? esc(s.door_code) : "—") + '</span><button class="btn ghost small" id="edit-door">입력</button></span></div>' +
    '<div class="kv"><b>Wi-Fi</b><span class="code-line"><span class="code-val">' + (s.wifi_code ? esc(s.wifi_code) : "—") + '</span><button class="btn ghost small" id="edit-wifi">입력</button></span></div>' +
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
    "</div>";

  html += '<p class="muted" style="margin:14px 4px">Safari 공유 버튼 → "홈 화면에 추가" 하면 앱처럼 열려. 6명 다 해두자.</p>';

  el.innerHTML = html;
  $("#edit-door").onclick = () => editSetting("door_code", "도어코드 (호스트 메시지에 있음)");
  $("#edit-wifi").onclick = () => editSetting("wifi_code", "Wi-Fi 비밀번호");
  $("#edit-album").onclick = () => editSetting("album_url", "공유 앨범 링크 (https://…)");
  $("#edit-coord").onclick = editCoord;
  $("#edit-me").onclick = openWho;
  const ta = $("#tut-again"); if (ta) ta.onclick = openTut;
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

/* ---------------- 튜토리얼 ---------------- */
const TUT = [
  { ic: "🏕️", t: "홈 — 지금 뭐 할 차례?", d: "일정 따라 '지금' 카드가 자동으로 바뀌어. 급한 결정은 투표 걸면 실시간 집계." },
  { ic: "📻", t: "무전 — 흩어져도 OK", d: "큰 버튼 한 번이면 내 위치가 다들 폰에 뜸. 카톡 필요 없음. 산길에서 신호 없어도 잡히는 순간 자동 송신." },
  { ic: "📮", t: "도장 — 게임처럼 모아", d: "가는 곳마다 도장 쾅. 여권에 쌓이고, 제일 많이 모은 사람이 이번 여행 MVP." },
  { ic: "🧾", t: "장부 — 정산은 자동", d: "산 사람이 그 자리에서 한 줄만 적으면 끝. 마지막에 누가 누구한테 얼마 보낼지 자동 계산." },
  { ic: "🎒", t: "준비 끝!", d: "Wi-Fi·도어코드·숙소 규칙은 정보 탭. 금요일에 뭐 할지는 일정 탭 → 제안 보드에서 골라." },
];
let tutIdx = 0;
function openTut() { tutIdx = 0; drawTut(); $("#tut-modal").hidden = false; }
function drawTut() {
  const st = TUT[tutIdx];
  $("#tut-body").innerHTML = '<div class="tut-ic">' + st.ic + '</div>' +
    '<p class="modal-title" style="text-align:center">' + st.t + "</p>" +
    '<p class="tut-d">' + st.d + "</p>";
  $("#tut-dots").innerHTML = TUT.map((_, i) => '<span class="tut-dot' + (i === tutIdx ? " on" : "") + '"></span>').join("");
  $("#tut-next").textContent = tutIdx === TUT.length - 1 ? "시작하기" : "다음";
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
  $("#tut-next").onclick = () => { if (tutIdx >= TUT.length - 1) closeTut(); else { tutIdx++; drawTut(); } };
  $("#stamp-cancel").onclick = () => $("#stamp-modal").hidden = true;
  $("#exp-cancel").onclick = () => $("#exp-modal").hidden = true;
  $("#poll-cancel").onclick = () => $("#poll-modal").hidden = true;
  $("#wish-cancel").onclick = () => $("#wish-modal").hidden = true;
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
}

/* ---------------- 시작 ---------------- */
function boot() {
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
  setInterval(() => { if (currentTab === "home" || currentTab === "plan") { renderHome(); renderPlan(); } }, 60000);
  setInterval(() => { loadAll(); flushQueue(); }, 300000);
  setInterval(loadAQ, 1800000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { loadAll(); flushQueue(); } });
  window.addEventListener("online", () => { loadAll(); flushQueue(); });

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", boot);
