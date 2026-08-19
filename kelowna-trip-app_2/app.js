/* 켈로나 여행수첩 — app.js */
"use strict";

/* ============================================================
   캐릭터 뽑기 — 100명 · 5등급
   t5 신화 0.3%(각 0.1%) · t4 전설 6% · t3 영웅 18% · t2 희귀 30% · t1 일반 45.7%
   이름 표기: last + 한글이름 + first
   fx = 무전 보낼 때 받는 사람 화면에 뜨는 시그니처 이펙트
   ============================================================ */
const TIERS = [
  { t: 1, name: "일반",  en: "COMMON",    p: 45.7, color: "#7E9A6F" },
  { t: 2, name: "희귀",  en: "RARE",      p: 30,   color: "#5B7FA8" },
  { t: 3, name: "영웅",  en: "EPIC",      p: 18,   color: "#8A6BA8" },
  { t: 4, name: "전설",  en: "LEGENDARY", p: 6,    color: "#C79A3E" },
  { t: 5, name: "신화",  en: "MYTHIC",    p: 0.3,  color: "#C8503C" },
];
const MAX_ROLLS = 20;
const RESET_PW = "0909";   // 초기화 비밀번호
const BUILD = "2026-08-19 v4";   // 폰이 최신인지 확인용
const PITY_AT = 12;   // 12번 굴려도 영웅 이상 없으면 13번째 확정

/* fx 프리셋: shape(도형) · motion(fall/rise/sweep/burst) · color */
const FX = {
  bolt:     { shape:"streak",motion:"burst", c:"#F2C744", n:22, special:"bolt", quake:true },
  skull:    { shape:"grape", motion:"rise",  c:"#4FBF6A", n:26, special:"skull", quake:true },
  phoenix:  { shape:"leaf",  motion:"rise",  c:"#F0C36A", n:26, special:"phoenix" },
  patronus: { shape:"streak",motion:"sweep", c:"#BFE4F5", n:20, special:"patronus" },
  book:     { shape:"leaf",  motion:"fall",  c:"#C9A87C", n:20, special:"book" },
  chess:    { shape:"grape", motion:"fall",  c:"#3B3B3B", n:16, special:"chess", quake:true },
  paw:      { shape:"grape", motion:"fall",  c:"#4A4A4A", n:18, special:"dog" },
  cat:      { shape:"star",  motion:"burst", c:"#C7B26A", n:18, special:"cat" },
  curse:    { shape:"streak",motion:"burst", c:"#D8453C", n:24, special:"curse", quake:true },
  star:     { shape:"star",  motion:"rise",  c:"#9DBBE8", n:12 },
  snake:    { shape:"streak",motion:"sweep", c:"#5FA86B", n:8 },
  stomp:    { shape:"grape", motion:"fall",  c:"#8A6A4A", n:10, quake:true },
  feather:  { shape:"leaf",  motion:"fall",  c:"#D07A5C", n:10 },
  sock:     { shape:"leaf",  motion:"fall",  c:"#E0D2B8", n:8 },
  gold:     { shape:"star",  motion:"burst", c:"#E3B457", n:12 },
  owl:      { shape:"streak",motion:"sweep", c:"#C8B18A", n:7 },
  wolf:     { shape:"grape", motion:"rise",  c:"#8FA0B5", n:9 },
  heart:    { shape:"grape", motion:"rise",  c:"#E38AA8", n:10 },
  eye:      { shape:"ring",  motion:"burst", c:"#7FB2C8", n:5 },
  sand:     { shape:"grape", motion:"fall",  c:"#D9C08A", n:14 },
  charm:    { shape:"star",  motion:"burst", c:"#B9A2E0", n:10 },
  leaf:     { shape:"leaf",  motion:"fall",  c:"#7E9A6F", n:8 },
  fire:     { shape:"grape", motion:"rise",  c:"#E07A3C", n:10 },
  paint:    { shape:"grape", motion:"fall",  c:"#6FA0D0", n:8 },
  bird:     { shape:"leaf",  motion:"sweep", c:"#A8C8E0", n:8 },
  spark:    { shape:"star",  motion:"burst", c:"#F0A63C", n:12 },
  ruler:    { shape:"streak",motion:"fall",  c:"#8A8A8A", n:6 },
  dragon:   { shape:"grape", motion:"rise",  c:"#C85A3C", n:10 },
  soup:     { shape:"grape", motion:"rise",  c:"#D9A05C", n:8 },
  bolt2:    { shape:"streak",motion:"fall",  c:"#E0C05C", n:8 },
  broom:    { shape:"streak",motion:"sweep", c:"#A87F4A", n:6 },
  crystal:  { shape:"ring",  motion:"rise",  c:"#B49AD8", n:6 },
  ghost:    { shape:"grape", motion:"rise",  c:"#C8D4E0", n:10 },
  ring:     { shape:"ring",  motion:"fall",  c:"#E3B457", n:5 },
  dust:     { shape:"grape", motion:"fall",  c:"#B0A894", n:12 },
  water:    { shape:"grape", motion:"fall",  c:"#7FB2C8", n:12 },
  candy:    { shape:"grape", motion:"fall",  c:"#D07AA0", n:10 },
  coin:     { shape:"star",  motion:"fall",  c:"#D9B45C", n:10 },
  train:    { shape:"streak",motion:"sweep", c:"#8A5A4A", n:6 },
  bubble:   { shape:"ring",  motion:"rise",  c:"#9EC8D8", n:8 },
};

function C(id, last, first, em, t, ko, fx) { return { id, last, first, em, t, ko, fx }; }
const ROSTER = [
  /* ---------- 신화 0.1% × 3 ---------- */
  C("potter","Potter","Harry","⚡",5,"해리 포터","bolt"),
  C("voldemort","Riddle","Tom","💀",5,"볼드모트","skull"),
  C("dumbledore","Dumbledore","Albus","🧙",5,"덤블도어","phoenix"),
  /* ---------- 전설 1% × 6 ---------- */
  C("snape","Snape","Severus","🧪",4,"스네이프","patronus"),
  C("granger","Granger","Hermione","📚",4,"헤르미온느","book"),
  C("ron","Weasley","Ron","🍗",4,"론 위즐리","chess"),
  C("sirius","Black","Sirius","🐕",4,"시리우스","paw"),
  C("mcgonagall","McGonagall","Minerva","🐈",4,"맥고나걸","cat"),
  C("bellatrix","Lestrange","Bellatrix","🗡️",4,"벨라트릭스","curse"),
  /* ---------- 영웅 18% ---------- */
  C("luna","Lovegood","Luna","🌙",3,"루나 러브굿","star"),
  C("draco","Malfoy","Draco","🐍",3,"드레이코","snake"),
  C("hagrid","Hagrid","Rubeus","🗝️",3,"해그리드","stomp"),
  C("ginny","Weasley","Ginny","🦅",3,"지니","feather"),
  C("dobby","Dobby","the Elf","🧦",3,"도비","sock"),
  C("cedric","Diggory","Cedric","🏆",3,"세드릭","gold"),
  C("hedwig","Hedwig","the Owl","🦉",3,"헤드위그","owl"),
  C("lupin","Lupin","Remus","🐺",3,"리무스 루핀","wolf"),
  C("tonks","Tonks","Nymphadora","💗",3,"톤크스","heart"),
  C("moody","Moody","Alastor","👁️",3,"매드아이 무디","eye"),
  C("slughorn","Slughorn","Horace","⏳",3,"슬러그혼","sand"),
  C("flitwick","Flitwick","Filius","🪄",3,"플리트윅","charm"),
  /* ---------- 희귀 30% ---------- */
  C("neville","Longbottom","Neville","🌱",2,"네빌","leaf"),
  C("seamus","Finnigan","Seamus","🔥",2,"시무스","fire"),
  C("dean","Thomas","Dean","🎨",2,"딘 토마스","paint"),
  C("cho","Chang","Cho","🐦",2,"초 챙","bird"),
  C("fred","Weasley","Fred","🎇",2,"프레드","spark"),
  C("george","Weasley","George","🎆",2,"조지","spark"),
  C("percy","Weasley","Percy","📏",2,"퍼시","ruler"),
  C("bill","Weasley","Bill","💇",2,"빌 위즐리","gold"),
  C("charlie","Weasley","Charlie","🐉",2,"찰리 위즐리","dragon"),
  C("molly","Weasley","Molly","🍲",2,"몰리","soup"),
  C("arthur","Weasley","Arthur","🔌",2,"아서","bolt2"),
  C("wood","Wood","Oliver","🧹",2,"올리버 우드","broom"),
  C("angelina","Johnson","Angelina","🏑",2,"안젤리나","spark"),
  C("katie","Bell","Katie","🥅",2,"케이티 벨","gold"),
  C("colin","Creevey","Colin","📷",2,"콜린","spark"),
  C("lavender","Brown","Lavender","💜",2,"라벤더","heart"),
  C("parvati","Patil","Parvati","🔮",2,"파바티","crystal"),
  C("padma","Patil","Padma","📖",2,"파드마","book"),
  C("ernie","Macmillan","Ernie","📢",2,"어니","charm"),
  C("hannah","Abbott","Hannah","🌼",2,"한나","leaf"),
  C("justin","Finch","Justin","🎻",2,"저스틴","charm"),
  C("zacharias","Smith","Zacharias","📣",2,"자카리아스","charm"),
  C("michael","Corner","Michael","🎧",2,"마이클","star"),
  C("terry","Boot","Terry","🧮",2,"테리","ruler"),
  C("anthony","Goldstein","Anthony","🗺️",2,"앤서니","dust"),
  C("kingsley","Shacklebolt","Kingsley","🛡️",2,"킹슬리","charm"),
  C("firenze","Firenze","the Centaur","🏹",2,"피렌체","star"),
  C("grubbly","Grubbly-Plank","Wilhelmina","🌿",2,"그러블리플랭크","leaf"),
  C("sprout","Sprout","Pomona","🪴",2,"스프라우트","leaf"),
  C("pomfrey","Pomfrey","Poppy","💊",2,"폼프리","charm"),
  /* ---------- 일반 45.7% ---------- */
  C("gollum","Gollum","Sméagol","💍",1,"골룸 (배송 사고)","ring"),
  C("filch","Filch","Argus","🧹",1,"필치","dust"),
  C("peeves","Peeves","the Poltergeist","👻",1,"피브스","ghost"),
  C("trelawney","Trelawney","Sybill","🔮",1,"트릴로니","crystal"),
  C("lockhart","Lockhart","Gilderoy","💇‍♂️",1,"록하트","gold"),
  C("crabbe","Crabbe","Vincent","🍰",1,"크랩","candy"),
  C("goyle","Goyle","Gregory","🍩",1,"고일","candy"),
  C("trevor","Trevor","the Toad","🐸",1,"트레버","leaf"),
  C("scabbers","Scabbers","the Rat","🐀",1,"스캐버스","dust"),
  C("crookshanks","Crookshanks","the Cat","🐈‍⬛",1,"크룩섕스","cat"),
  C("norbert","Norbert","the Dragon","🐲",1,"노버트","dragon"),
  C("aragog","Aragog","the Spider","🕷️",1,"아라고그","dust"),
  C("hat","Sorting","Hat","🎩",1,"분류 모자","charm"),
  C("stairs","Moving","Staircase","🪜",1,"움직이는 계단","dust"),
  C("fatlady","Fat","Lady","🖼️",1,"뚱뚱한 부인","paint"),
  C("nick","Nick","the Ghost","👻",1,"목이 나간 닉","ghost"),
  C("greylady","Grey","Lady","🩶",1,"회색 숙녀","ghost"),
  C("baron","Bloody","Baron","🩸",1,"피의 남작","curse"),
  C("friar","Fat","Friar","🍺",1,"통통한 수사","bubble"),
  C("howler","Howler","the Letter","📣",1,"하울러","charm"),
  C("frog","Chocolate","Frog","🍫",1,"초콜릿 개구리","candy"),
  C("beans","Bertie","Botts","🫘",1,"버티봇 젤리","candy"),
  C("butterbeer","Butter","Beer","🍺",1,"버터맥주","bubble"),
  C("pumpkin","Pumpkin","Juice","🎃",1,"호박 주스","bubble"),
  C("tie","House","Tie","👔",1,"기숙사 넥타이","dust"),
  C("broom","Nimbus","the Broom","🧹",1,"님부스 빗자루","broom"),
  C("wand","Spare","Wand","🪄",1,"여분의 지팡이","charm"),
  C("quill","Owl","Feather","🪶",1,"부엉이 깃털","feather"),
  C("cauldron","Spare","Cauldron","⚗️",1,"솥단지","bubble"),
  C("mandrake","Mandrake","the Root","🌿",1,"만드레이크","leaf"),
  C("boggart","Boggart","the Fear","🫥",1,"보가트","ghost"),
  C("timeturner","Time","Turner","⏳",1,"시간 여행기","sand"),
  C("cloak","Invisibility","Cloak","🫥",1,"투명 망토","dust"),
  C("map","Old","Map","🗺️",1,"낡은 지도","dust"),
  C("trophy","Dusty","Trophy","🏆",1,"먼지 쌓인 트로피","gold"),
  C("hoop","Quidditch","Hoop","🥅",1,"퀴디치 골대","gold"),
  C("snitch","Golden","Snitch","🟡",1,"스니치","gold"),
  C("bludger","Bludger","the Ball","⚫",1,"블러저","stomp"),
  C("quaffle","Quaffle","the Ball","🔴",1,"쿼플","spark"),
  C("choir","Frog","Choir","🎵",1,"개구리 합창단","charm"),
  C("express","Hogwarts","Express","🚂",1,"급행열차","train"),
  C("platform","Platform","Nine¾","🚉",1,"9와 4분의 3","train"),
  C("knightbus","Knight","Bus","🚌",1,"나이트 버스","train"),
  C("flyingcar","Flying","Car","🚗",1,"하늘을 나는 차","train"),
  C("postbox","Owl","Post","📮",1,"부엉이 우편함","owl"),
  C("chess2","Wizard","Chess","♟️",1,"마법사 체스","chess"),
  C("snap","Exploding","Snap","💥",1,"폭발 스냅","spark"),
  C("goblin","Gringotts","Goblin","🪙",1,"고블린","coin"),
  C("elf","House","Elf","🧝",1,"집요정","sock"),
  C("merman","Merperson","of the Lake","🧜",1,"인어","water"),
  C("hippogriff","Hippogriff","the Beast","🦅",1,"히포그리프","feather"),
  C("werewolf","Full","Moon","🌕",1,"보름달","wolf"),
  C("pixie","Cornish","Pixie","🧚",1,"코니시 픽시","charm"),
  C("gnome","Garden","Gnome","🍄",1,"정원 노움","leaf"),
  C("thestral","Thestral","the Horse","🖤",1,"세스트랄","wolf"),
  C("kettle","Portkey","Kettle","🫖",1,"포트키 주전자","bubble"),
  C("newspaper","Daily","Prophet","📰",1,"예언자일보","dust"),
  C("acid","Acid","Pops","🍬",1,"애시드 팝","candy"),
  C("cake","Cauldron","Cake","🧁",1,"솥단지 케이크","candy"),
  C("liquorice","Liquorice","Wand","🥢",1,"감초 지팡이","candy"),
  C("owlpellet","Owl","Pellet","💩",1,"부엉이 배설물","dust"),
];


/* ---------------- 기본 도구 ---------------- */
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const byId = Object.fromEntries(MEMBERS.map((m) => [m.id, m]));
const charById = Object.fromEntries(ROSTER.map((c) => [c.id, c]));
const tierById = Object.fromEntries(TIERS.map((t) => [t.t, t]));
/* store.characters: [{member, char_id, tier, rolls}] */
function charOf(memberId) {
  const rec = (store.characters || []).find((c) => c.member === memberId);
  return rec ? charById[rec.char_id] : null;
}
function tierOf(memberId) { const c = charOf(memberId); return c ? c.t : 0; }
function fullName(memberId) {
  const c = charOf(memberId), m = byId[memberId];
  if (!c || !m) return m ? m.name : memberId;
  return c.last + " " + m.name + " " + c.first;
}
function takenIds() { return (store.characters || []).map((c) => c.char_id); }
const nameOf = (id) => (id && byId[id] ? byId[id].name : id ? id : "수첩");
const colorOf = (id) => { const t = tierOf(id); return t ? tierById[t].color : (byId[id] ? byId[id].color : "#9A9A92"); };
const avatarOf = (id) => { const c = charOf(id); if (c) return c.em; return byId[id] && byId[id].avatar ? byId[id].avatar : "📓"; };
const av = (id, cls) => '<span class="av ' + (cls || "") + (id === me ? " self" : "") + '" style="--rc:' + colorOf(id) + '">' + avatarOf(id) + "</span>";
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
const RALLY = { n: "Hope McDonald's", lat: 49.3768, lng: -121.4312, q: "McDonald's Hope BC", radiusKm: 0.6 };
const REST_STOPS = [
  { n: "Hope McDonald's — 집결 (필수)", lat: RALLY.lat, lng: RALLY.lng, q: RALLY.q, rally: true },
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
  if (/한번쉬자|맥도|McDonald|호프|Hope/i.test(t)) return RALLY.q;
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
  if (/한번쉬자|맥도|McDonald|호프|Hope/i.test(t)) return { n: RALLY.n, lat: RALLY.lat, lng: RALLY.lng };
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
/* ---------- 기상효과: 상황별 파티클 + 시스템 리본 ---------- */
const FX_SPEC = {
  drive:  { shape: "streak", tint: "#7FE3D2", up: true },
  winery: { shape: "grape",  tint: "#F0A6B4" },
  shop:   { shape: "leaf",   tint: "#8FE0A8" },
  arrival:{ shape: "leaf",   tint: "#FFD08A" },
  cabin:  { shape: "star",   tint: "#A8B8FF" },
  night:  { shape: "star",   tint: "#A8B8FF" },
  voice:  { shape: "ring",   tint: "#7FE3D2" },
  siren:  { shape: "warn",   tint: "#FF5E4D", up: true },
};
function fxModeNow() {
  const m = (function () { try { return homeMode(); } catch (e) { return "cabin"; } })();
  if (m === "costco") return "shop";
  if (m === "go") return "drive";
  if (m === "cabin" && isNight()) return "night";
  return FX_SPEC[m] ? m : "cabin";
}
function shapeHtml(shape, color, i) {
  const style = "--c:" + color + ";";
  if (shape === "streak") return '<i class="p p-streak" style="' + style + '"></i>';
  if (shape === "grape") return '<i class="p p-grape" style="' + style + '"></i>';
  if (shape === "leaf") return '<i class="p p-leaf" style="' + style + '"></i>';
  if (shape === "star") return '<i class="p p-star" style="' + style + '"></i>';
  if (shape === "ring") return '<i class="p p-ring" style="' + style + '"></i>';
  if (shape === "warn") return '<i class="p p-warn" style="' + style + '"></i>';
  return '<i class="p p-grape" style="' + style + '"></i>';
}
/* 캐릭터 시그니처 이펙트 */
function charFx(memberId, level) {
  const c = charOf(memberId);
  if (!c || !FX[c.fx]) return false;
  const f = FX[c.fx];
  const layer = document.getElementById("fx");
  if (!layer) return false;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const n = Math.round((f.n || 10) * (level >= 3 ? 1.6 : level >= 2 ? 1 : 0.6));
  let html = "";
  for (let i = 0; i < n; i++) {
    const dur = (2.4 + Math.random() * 2).toFixed(2) + "s";
    const delay = (Math.random() * .8).toFixed(2) + "s";
    const size = (f.shape === "ring" ? 18 : 7) + Math.round(Math.random() * 9);
    const drift = (Math.random() * 44 - 22).toFixed(0) + "px";
    if (f.motion === "sweep") {
      const top = Math.round(12 + Math.random() * 64) + "%";
      html += '<span class="pw sweep" style="top:' + top + ";animation-duration:" + dur + ";animation-delay:" + delay +
        ";--sz:" + size + 'px">' + shapeHtml(f.shape, f.c, i) + "</span>";
    } else if (f.motion === "burst") {
      const dx = Math.round((Math.random() * 2 - 1) * 180), dy = Math.round((Math.random() * 2 - 1) * 300);
      html += '<span class="pw burst" style="left:50%;top:44%;animation-duration:' + dur + ";animation-delay:" + delay +
        ";--sz:" + size + "px;--bx:" + dx + "px;--by:" + dy + 'px">' + shapeHtml(f.shape, f.c, i) + "</span>";
    } else {
      const left = Math.round(Math.random() * 94) + "%";
      html += '<span class="pw' + (f.motion === "rise" ? " up" : "") + '" style="left:' + left +
        ";animation-duration:" + dur + ";animation-delay:" + delay + ";--sz:" + size + "px;--drift:" + drift + '">' +
        shapeHtml(f.shape, f.c, i) + "</span>";
    }
  }
  layer.innerHTML = html;
  layer.hidden = false;
  clearTimeout(weatherFx._t);
  weatherFx._t = setTimeout(() => { layer.hidden = true; layer.innerHTML = ""; }, 5200);
  if (f.quake) { document.body.classList.add("quake"); setTimeout(() => document.body.classList.remove("quake"), 1100); }
  if (c.t >= 3) edgeGlow(f.c || colorOf(memberId), c.t >= 4);
  if (f.special) specialFx(f.special, f.c);
  return true;
}
function specialFx(kind, color) {
  const o = document.getElementById("sfx");
  if (!o) return;
  const bolt = (cls, w, hgt) => '<svg class="sfx-bolt ' + cls + '" viewBox="0 0 120 400" width="' + w + '" height="' + hgt +
    '" preserveAspectRatio="none"><path d="M70,0 L40,170 L74,160 L34,400" fill="none" stroke="#F7E27A" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>' +
    '<path d="M70,0 L40,170 L74,160 L34,400" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>';
  let h = "", shake = false;
  if (kind === "bolt") {
    h = '<div class="sfx-white"></div>' + bolt("", 170, 560) + bolt("b2", 130, 430) + bolt("b3", 110, 380);
    shake = true;
  }
  if (kind === "skull") {
    h = '<div class="sfx-dark"></div><div class="sfx-smoke"></div>' +
        '<div class="sfx-eyes"><i></i><i></i></div><div class="sfx-skull">💀</div>';
    shake = true;
  }
  if (kind === "phoenix") {
    h = '<div class="sfx-rays"></div><div class="sfx-glow"></div>' +
        '<div class="sfx-phoenix">🦅</div><div class="sfx-feather">🪶</div>';
  }
  if (kind === "patronus") h = '<div class="sfx-patronus"></div><div class="sfx-patronus" style="top:56%;animation-delay:.35s;width:120px;opacity:.7"></div>';
  if (kind === "chess")    { h = '<div class="sfx-chess">♜</div><div class="sfx-crack"></div>'; shake = true; }
  if (kind === "book")     h = '<div class="sfx-glow" style="--sc:#C9A87C"></div><div class="sfx-book">📖</div>' +
    '<span class="sfx-page p1">📄</span><span class="sfx-page p2">📄</span><span class="sfx-page p3">📄</span>';
  if (kind === "dog")      h = '<div class="sfx-dog">🐕‍🦺</div><span class="sfx-paw w1">🐾</span><span class="sfx-paw w2">🐾</span><span class="sfx-paw w3">🐾</span>';
  if (kind === "cat")      h = '<div class="sfx-cateyes"><i></i><i></i></div><div class="sfx-catring"></div><div class="sfx-cat">🐈‍⬛</div>';
  if (kind === "curse")    { h = '<div class="sfx-curse c1"></div><div class="sfx-curse c2"></div><div class="sfx-curse c3"></div><div class="sfx-redflash"></div>'; shake = true; }
  if (!h) return;
  if (shake) { document.body.classList.add("sfx-shake"); setTimeout(() => document.body.classList.remove("sfx-shake"), 1500); }
  o.innerHTML = h; o.hidden = false;
  o.style.setProperty("--sc", color || "#fff");
  clearTimeout(specialFx._t);
  specialFx._t = setTimeout(() => { o.hidden = true; o.innerHTML = ""; }, 3600);
}

/* level: 1 은은 · 2 보통 · 3 강함 */
function weatherFx(kind, level, tintOverride, ribbonText) {
  const layer = document.getElementById("fx");
  if (!layer) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (ribbonText) showRibbon(ribbonText, tintOverride);
    return;
  }
  const spec = FX_SPEC[kind] || FX_SPEC.cabin;
  const n = level === 3 ? 20 : level === 2 ? 12 : 6;
  const tint = tintOverride || spec.tint;
  let html = "";
  for (let i = 0; i < n; i++) {
    const left = Math.round(Math.random() * 96) + "%";
    const dur = (2.6 + Math.random() * 2.2).toFixed(2) + "s";
    const delay = (Math.random() * 0.9).toFixed(2) + "s";
    const size = (spec.shape === "ring" ? 18 : 7) + Math.round(Math.random() * 8);
    const drift = (Math.random() * 40 - 20).toFixed(0) + "px";
    html += '<span class="pw' + (spec.up ? " up" : "") + '" style="left:' + left + ";animation-duration:" + dur +
      ";animation-delay:" + delay + ";--sz:" + size + "px;--drift:" + drift + '">' + shapeHtml(spec.shape, tint, i) + "</span>";
  }
  layer.innerHTML = html;
  layer.hidden = false;
  clearTimeout(weatherFx._t);
  weatherFx._t = setTimeout(() => { layer.hidden = true; layer.innerHTML = ""; }, 5200);
  if (ribbonText) showRibbon(ribbonText, tint);
}
function showRibbon(text, tint) {
  const r = document.getElementById("ribbon");
  if (!r) return;
  r.style.setProperty("--c", tint || "#7FE3D2");
  r.textContent = text;
  r.hidden = false;
  r.classList.remove("in"); void r.offsetWidth; r.classList.add("in");
  clearTimeout(showRibbon._t);
  showRibbon._t = setTimeout(() => { r.hidden = true; }, 3600);
}

function edgeGlow(color, strong) {
  const e = document.getElementById("edge");
  if (!e) return;
  e.style.setProperty("--glow", color || "#7FE3D2");
  e.classList.remove("on", "strong");
  void e.offsetWidth;
  e.classList.add(strong ? "strong" : "on");
  setTimeout(() => e.classList.remove("on", "strong"), strong ? 4200 : 2200);
}
function buzz(pattern) { try { if (navigator.vibrate) navigator.vibrate(pattern || [35, 60, 35]); } catch (e) {} }

/* 도착한 교신을 '메시지'처럼 보여주는 배너 */
function auraClass(memberId) {
  const c = charOf(memberId);
  if (!c) return { cls: "", color: "" };
  const f = FX[c.fx] || {};
  const fam = f.special ? f.special : (f.shape || "grape") + "-" + (f.motion || "fall");
  return { cls: " aura aura-" + fam, color: f.c || colorOf(memberId) };
}
function incoming(opts) {
  const box = document.getElementById("incoming");
  if (!box) return;
  const au = auraClass(opts.who);
  box.innerHTML = '<div class="inc-card' + au.cls + '" style="--ac:' + (au.color || opts.color || "#C8503C") + '">' +
    '<span class="aura-veil"></span>' +
    '<span class="inc-av">' + (opts.who ? avatarOf(opts.who) : "📻") + "</span>" +
    '<span class="inc-body"><span class="inc-name">' + esc(opts.name || "무전") + '</span>' +
    '<span class="inc-text">' + esc(opts.text || "") + "</span></span>" +
    (opts.audio ? '<button class="inc-play" id="inc-play">▶︎</button>' : '<button class="inc-go" id="inc-go">보기</button>') +
    "</div>";
  box.hidden = false;
  box.classList.remove("in"); void box.offsetWidth; box.classList.add("in");
  const p = document.getElementById("inc-play");
  if (p) p.onclick = () => { playAudio(opts.audio, p); };
  const g = document.getElementById("inc-go");
  if (g) g.onclick = () => { box.hidden = true; switchTab(opts.tab || "stamp"); };
  clearTimeout(incoming._t);
  incoming._t = setTimeout(() => { box.hidden = true; }, 7000);
  edgeGlow(opts.color || "#7FE3D2");
  const lvl = opts.level || 1;
  if (!(opts.who && charFx(opts.who, lvl)))
    weatherFx(opts.fx || (opts.audio ? "voice" : fxModeNow()), lvl, opts.color, opts.ribbon);
  else if (opts.ribbon) showRibbon(opts.ribbon, opts.color);
  buzz();
  beep();
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
  wineRatings: [], reactions: [], characters: [],
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

/* ---------------- 인앱 브라우저 차단 게이트 ---------------- */
function isInApp() {
  const ua = (navigator.userAgent || "").toLowerCase();
  const marks = ["kakaotalk", "naver(inapp", "instagram", "fban", "fbav", "line/", "daumapps", "everytimeapp", "kakaostory", "whale/"];
  for (const m of marks) if (ua.indexOf(m) >= 0) return true;
  return false;
}
function inAppName() {
  const ua = (navigator.userAgent || "").toLowerCase();
  if (ua.indexOf("kakaotalk") >= 0) return "카카오톡";
  if (ua.indexOf("naver(inapp") >= 0) return "네이버";
  if (ua.indexOf("instagram") >= 0) return "인스타그램";
  if (ua.indexOf("fban") >= 0 || ua.indexOf("fbav") >= 0) return "페이스북";
  if (ua.indexOf("line/") >= 0) return "라인";
  return "앱 내 브라우저";
}
function showGate() {
  const g = document.getElementById("gate");
  if (!g) return false;
  const ua = navigator.userAgent || "";
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const url = location.href.split("#")[0];
  g.innerHTML =
    '<div class="gate-card">' +
    '<div class="gate-ic">🚫📱</div>' +
    '<p class="gate-t">' + esc(inAppName()) + ' 브라우저에선 못 써</p>' +
    '<p class="gate-d">여기선 앱 설치도, 알림도, 마이크(음성 무전)도 안 돼.<br>' +
    (isIOS ? "<b>Safari</b>" : "<b>Chrome</b>") + '로 열어야 제대로 돌아가.</p>' +
    '<button class="btn gate-btn" id="gate-open">' + (isIOS ? "Safari로 열기" : "Chrome으로 열기") + "</button>" +
    '<button class="btn ghost gate-btn" id="gate-copy">주소 복사해서 직접 열기</button>' +
    '<p class="gate-hint">버튼이 안 먹으면: 오른쪽 위 <b>⋯</b> 또는 <b>공유</b> → ' +
    (isIOS ? '"Safari로 열기"' : '"다른 브라우저로 열기"') + " 선택</p>" +
    '<p class="gate-url">' + esc(url) + "</p></div>";
  g.hidden = false;
  document.body.classList.add("gated");
  const ob = document.getElementById("gate-open");
  if (ob) ob.onclick = () => {
    if (ua.toLowerCase().indexOf("kakaotalk") >= 0) { location.href = "kakaotalk://web/openExternal?url=" + encodeURIComponent(url); return; }
    if (isIOS) { location.href = "x-safari-" + url; return; }
    location.href = "intent://" + url.replace(/^https?:\/\//, "") + "#Intent;scheme=https;package=com.android.chrome;end";
  };
  const cb = document.getElementById("gate-copy");
  if (cb) cb.onclick = () => copyText(url, "주소");
  return true;
}

/* ---------------- 푸시 알림 ---------------- */
const VAPID_PUBLIC = "BLOZAjhNhQZ6pgfmjHWxNjGkK-7605WHrMgIGmjkgsmTGbJ5cws-oZKSgAwd6J26ahK6QAZ05Z4lsGUcfx-gyKo";
function b64ToU8(b64) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
function pushState() {
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return "unsupported";
  if (!isStandalone() && /iphone|ipad|ipod/i.test(navigator.userAgent)) return "need-install";
  return Notification.permission; // default | granted | denied
}
async function enablePush() {
  const st = pushState();
  if (st === "unsupported") return toast("이 브라우저는 푸시를 지원 안 해");
  if (st === "need-install") { fillInstallGuide(); $("#install-modal").hidden = false; return toast("먼저 홈 화면에 설치해야 푸시가 돼"); }
  if (needSb()) return;
  if (!me) return openWho();
  try {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return toast("알림이 차단됐어 (설정에서 허용 가능)");
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(VAPID_PUBLIC) });
    const { error } = await sb.from("push_subs").upsert({ member: me, sub: sub.toJSON() }, { onConflict: "member" });
    if (error) throw error;
    localStorage.setItem("kel_push", "1");
    toast("🔔 알림 켜졌어 — 앱 꺼져 있어도 무전이 와");
    renderInfo();
  } catch (e) {
    console.error(e);
    toast("알림 등록 실패 — 다시 시도해봐");
  }
}
/* 보낸 사람이 나머지에게 푸시를 쏜다 (서버 트리거 없이 동작) */
function sendPush(title, body, tag, includeSelf) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  try {
    fetch(SUPABASE_URL + "/functions/v1/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + SUPABASE_ANON_KEY, "apikey": SUPABASE_ANON_KEY },
      body: JSON.stringify({ title: title, body: body, tag: tag || "kel", exclude: includeSelf ? null : me }),
    }).catch(() => {});
  } catch (e) {}
}

function inviteText() {
  return "🏕️ 켈로나 여행수첩 (우리 여행 앱)\n" +
    location.href.split("#")[0] + "\n\n" +
    "📲 설치 3단계 (2분, 꼭 해줘)\n" +
    "1. 위 링크를 사파리로 열기\n" +
    "   (카톡에서 바로 열면 설치가 안 돼요. 카톡 브라우저면 화면 위 'Safari로 열기' 버튼 누르기)\n" +
    "2. 아래 공유 버튼 ⬆️ → '홈 화면에 추가' → 추가\n" +
    "3. 홈 화면 아이콘으로 앱 열고 → 정보 탭 → '알림 켜기'\n\n" +
    "이거 해야 앱 꺼져 있어도 무전이랑 위치 알림이 옵니다 📻";
}
async function shareInvite() {
  const text = inviteText();
  try {
    if (navigator.share) { await navigator.share({ title: "켈로나 여행수첩", text: text }); return; }
  } catch (e) { if (e && e.name === "AbortError") return; }
  copyText(text, "초대 메시지");
}

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
    const [it, po, vo, ex, ch, wi, wl, sh, wr, rx, ca, se] = await Promise.all([
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
      sb.from("characters").select("*"),
      sb.from("settings").select("*"),
    ]);
    const bad = [it, po, vo, ex, ch, wi, wl, sh, wr, rx, ca, se].find((r) => r.error);
    if (bad) throw bad.error;
    store.itinerary = it.data; store.polls = po.data; store.votes = vo.data;
    store.expenses = ex.data; store.checkins = ch.data;
    store.wishes = wi.data; store.wishLikes = wl.data; store.shopping = sh.data;
    store.wineRatings = wr.data; store.reactions = rx.data; store.characters = ca.data || [];
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
  ["checkins", "expenses", "polls", "votes", "itinerary", "wishes", "wish_likes", "shopping", "wine_ratings", "reactions", "sirens", "settings", "characters"].forEach((t) => {
    ch.on("postgres_changes", { event: "*", schema: "public", table: t }, (p) => onLive(t, p));
  });
  ch.subscribe();
}

function onLive(table, payload) {
  scheduleLoad();
  if (payload.eventType !== "INSERT") return;
  const r = payload.new || {};
  if (table === "sirens") { emergency(r.note || null); return; }
  if (table === "reactions" || table === "characters") return;
  if (table === "settings") {
    const r2 = payload.new || {};
    if (r2.key === "current_dest" && r2.value) {
      try {
        const d = JSON.parse(r2.value);
        if (d && d.n && d.by !== me) {
          incoming({
            who: d.by, name: nameOf(d.by) + " · 목적지 확정",
            text: "우리 다 같이 → " + d.n, tab: "home", color: "#7FE3D2",
            level: 3, fx: "drive", ribbon: "다음 목적지 — " + d.n,
          });
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
  if (table === "checkins") {
    const isVoice = !!r.audio;
    const body = isVoice ? "음성 무전이 도착했어" : (r.note ? r.note : r.place);
    incoming({
      who: actor,
      name: nameOf(actor) + (isVoice ? " · 음성" : r.lat ? " · 위치" : ""),
      text: body, audio: r.audio, tab: "stamp", color: colorOf(actor),
      level: isVoice ? 2 : 1,
      fx: isVoice ? "voice" : fxModeNow(),
      ribbon: isVoice ? nameOf(actor) + "의 무전이 도착했다" : null,
    });
    pushAlert("📻 " + nameOf(actor) + " — " + (r.note || r.place));
    if (currentTab !== "stamp") badge("stamp", true);
    return;
  }
  if (table === "expenses") { msg = nameOf(actor) + "가 장부에 적음: " + r.title + " " + money(Number(r.amount)); tab = "ledger"; }
  if (table === "polls") {
    incoming({ who: null, name: "🗳️ 새 투표 · " + (r.created_by || ""), text: r.question, tab: "home", color: "#7FE3D2", level: 2, ribbon: "투표가 올라왔다" });
    pushAlert("🗳️ 새 투표: " + r.question);
    if (currentTab !== "home") badge("home", true);
    return;
  }
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
function partyPositions(destLat, destLng, originLat, originLng) {
  // 각자 마지막 위치를 출발지→목적지 진행률(0~1)로
  const latest = latestByMember();
  const total = distKm(originLat, originLng, destLat, destLng) || 1;
  const out = [];
  for (const m of MEMBERS) {
    const c = latest[m.id];
    if (!c || !c.lat) { out.push({ id: m.id, pct: null, stale: true }); continue; }
    const left = distKm(c.lat, c.lng, destLat, destLng);
    const pct = Math.max(3, Math.min(97, (1 - left / total) * 100));
    const stale = (Date.now() - new Date(c.created_at).getTime()) > 30 * 60000;
    out.push({ id: m.id, pct, stale });
  }
  return out;
}
function progHtml(fromLabel, toLabel, pct, party) {
  const p = Math.max(2, Math.min(98, pct));
  let avs = "";
  if (party && party.length) {
    const placed = party.filter((x) => x.pct !== null);
    placed.forEach((x, i) => {
      avs += '<span class="prog-av' + (x.id === me ? " self" : "") + (x.stale ? " stale" : "") +
        '" style="left:' + x.pct + "%;--pc:" + colorOf(x.id) + '">' + avatarOf(x.id) +
        "<b>" + esc(nameOf(x.id)) + "</b></span>";
    });
  }
  return '<div class="prog"><div class="prog-track"></div><div class="prog-fill" style="width:' + p + '%"></div>' +
    (avs ? avs : '<div class="prog-dot" style="left:' + p + '%"></div>') + '<div class="prog-end"></div></div>' +
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

function rallyStripHtml() {
  const since = Date.now() - 3 * 3600000;
  const arrived = {};
  for (const c of store.checkins) {
    if (!c.lat || new Date(c.created_at).getTime() < since) continue;
    if (distKm(c.lat, c.lng, RALLY.lat, RALLY.lng) <= RALLY.radiusKm) arrived[c.member] = true;
  }
  const n = Object.keys(arrived).length;
  const meNear = lastPos && distKm(lastPos.lat, lastPos.lng, RALLY.lat, RALLY.lng) <= RALLY.radiusKm;
  return '<div class="card rally"><div class="rally-top"><b>🍟 ' + esc(RALLY.n) + '</b><span class="rally-tag">집결 · 여기서 한 번 쉼</span></div>' +
    '<div class="rally-avs">' + MEMBERS.map((m) =>
      '<span class="rally-av' + (arrived[m.id] ? " in" : "") + '" style="border-color:' + m.color + '">' + m.avatar + "</span>").join("") +
    '<span class="rally-count">' + n + "/" + MEMBERS.length + " 도착</span></div>" +
    '<div class="stop-acts"><a class="chip" href="' + gmapUrl(RALLY.q) + '" target="_blank" rel="noopener">📍 지도</a>' +
    '<button class="chip go-set" data-title="한번쉬자">🧭 여기로 출발</button>' +
    (meNear ? '<button class="chip" id="rally-here">📻 나 도착했다고 알리기</button>' : "") + "</div></div>";
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
      progHtml("포트무디", dest.n, pct, partyPositions(dest.lat, dest.lng, WAYPOINTS[0].lat, WAYPOINTS[0].lng)) +
      bandBtns([bLink("🧭 내비 시작", q || dest.n), bBtn("🛑 쉬는 곳 " + REST_STOPS.length, "rest-jump", true)]);
    if (!lastPos) inner += bandBtns([bBtn("📍 위치 켜기 — 1분마다 자동 갱신", "nav-loc", true)]);
  } else {
    inner += '<div class="band-title">West Kelowna까지 달리는 중</div>';
  }
  let html = band("drive", inner);
  const passedHope = lastPos && lastPos.lng > -121.2;
  if (!passedHope) html += rallyStripHtml();
  html += '<div class="row-list" id="rest-list">';
  for (const r of REST_STOPS) {
    html += '<div class="lrow"><span class="ic">' + (r.rally ? "🍟" : "☕️") + "</span>" + esc(r.n) +
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
  if (sq.nextItem) {
    const nd2 = placeCoord(sq.nextItem.title);
    const cur = sq.here || (sq.curItem ? placeCoord(sq.curItem.title) : null);
    if (nd2 && cur) inner += progHtml(sq.here ? sq.here.n : "지금", sq.nextItem.title, 40,
      partyPositions(nd2.lat, nd2.lng, cur.lat, cur.lng));
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
    if (ok) { toast("🧭 전원 홈에 띄웠어: " + d.n); sendPush("🧭 다음 목적지", nameOf(me) + ": 우리 다 같이 → " + d.n, "dest"); switchTab("home"); }
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

/* ---- 첫 목적지 · 카운트다운 · 실시간 ETA ---- */
function firstDestination() {
  const items = itemsFor(TRIP.days[0].date);
  for (const r of items) {
    const w = WINERIES.find((x) => (r.title || "").indexOf(x.n) >= 0);
    if (w) return { n: w.n, lat: w.lat, lng: w.lng, q: w.n + " Winery West Kelowna" };
  }
  for (const r of items) {
    const c = placeCoord(r.title);
    if (c) return { n: c.n, lat: c.lat, lng: c.lng, q: placeQuery(r.title) || c.n };
  }
  return null;
}
function fmtDur(sec) {
  const h = Math.floor(sec / 3600), m2 = Math.round((sec % 3600) / 60);
  return (h ? h + "시간 " : "") + m2 + "분";
}
function tickDep() {
  const el = document.querySelector('[data-tick="dep"]');
  if (!el) return;
  let ms = new Date(TRIP.start + "T08:00:00") - Date.now();
  if (ms < 0) ms = 0;
  const h = Math.floor(ms / 3600000), mnt = Math.floor((ms % 3600000) / 60000), sec = Math.floor((ms % 60000) / 1000);
  el.textContent = (h ? h + ":" : "") + pad(mnt) + ":" + pad(sec);
}
function preTripETA() {
  const el = document.getElementById("pre-eta");
  if (!el) return;
  const fd = firstDestination();
  if (!fd) { el.textContent = ""; return; }
  const pm = WAYPOINTS[0];
  fetch("https://router.project-osrm.org/route/v1/driving/" + pm.lng + "," + pm.lat + ";" + fd.lng + "," + fd.lat + "?overview=false")
    .then((r) => r.json())
    .then((d) => {
      const rt = d.routes && d.routes[0];
      if (!rt) throw 0;
      const dep = new Date(TRIP.start + "T08:00:00");
      const arr = new Date(dep.getTime() + rt.duration * 1000);
      el.innerHTML = "차로 " + fmtDur(rt.duration) + " · " + Math.round(rt.distance / 1000) + "km · 논스톱이면 " + hm(arr) + " 도착";
    })
    .catch(() => {
      const km = distKm(pm.lat, pm.lng, fd.lat, fd.lng);
      el.textContent = "약 " + Math.round(km) + "km (직선)";
    });
}
function refreshLiveETA() {
  if (currentTab !== "home") return;
  const p = modeOverride ? "during" : phase();
  if (p !== "during") return;
  const mode = homeMode();
  if (mode !== "drive" && mode !== "winery" && mode !== "go") return;
  if (!navigator.permissions || !navigator.permissions.query) return;
  navigator.permissions.query({ name: "geolocation" }).then((st) => {
    if (st.state !== "granted") return;
    getPosition().then(() => {
      let dest = null;
      if (mode === "go") { const dd = getDest(); if (dd && dd.lat) dest = dd; }
      else if (mode === "winery") { const nx = seqNow().nextItem; dest = nx ? placeCoord(nx.title) : null; }
      else { const next = nowAndNext().next; dest = next ? placeCoord(next.title) : null; }
      if (!dest) { const fd = firstDestination(); if (fd) dest = fd; }
      if (dest && lastPos && document.getElementById("nav-eta")) fetchETA(lastPos, dest, "nav-eta");
    });
  }).catch(() => {});
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
function urgentPollsHtml() {
  const open = store.polls.filter((x) => !x.closed);
  if (!open.length) return "";
  let html = "";
  for (const poll of open) {
    const votes = store.votes.filter((v) => v.poll_id === poll.id);
    const mine = votes.find((v) => v.member === me);
    if (mine) {
      const labels = poll.options || [];
      html += '<div class="card poll-mini" data-poll="' + poll.id + '">' +
        '<span class="pm-q">' + esc(poll.question) + "</span>" +
        '<span class="pm-me">내 표: ' + esc(labels[mine.option_idx] || "") + "</span>" +
        '<span class="pm-n">' + votes.length + "/" + MEMBERS.length + "</span>" +
        '<button class="chip pm-x" data-poll="' + poll.id + '">바꾸기</button></div>';
    } else {
      html += '<div class="card poll urgent">' +
        '<div class="urgent-tag">🗳️ 아직 투표 안 했어</div>' +
        '<div class="poll-q">' + esc(poll.question) + '<span class="poll-by">' + esc(poll.created_by || "") + "</span></div>" +
        (poll.options || []).map((label, i) => {
          const these = votes.filter((v) => v.option_idx === i);
          return '<button class="opt" data-poll="' + poll.id + '" data-i="' + i + '">' +
            '<span class="opt-label">' + esc(label) + '<span class="opt-count">' + these.length + "표</span></span></button>";
        }).join("") + "</div>";
    }
  }
  return html;
}

function pushNudgeHtml() {
  const st = pushState();
  if (st === "granted" && localStorage.getItem("kel_push")) return "";
  if (st === "unsupported") return "";
  const need = st === "need-install";
  return '<div class="card nudge">' +
    '<div class="nudge-ic">🔔</div>' +
    '<div class="nudge-body"><b>' + (need ? "홈 화면에 설치하면 알림이 와" : "알림 켜면 앱 꺼져도 무전이 와") + "</b>" +
    '<span class="muted">' + (need ? "설치 후 알림까지 켜야 무전·사이렌을 놓치지 않아" : "이거 안 켜면 앱 열었을 때만 알 수 있어") + "</span></div>" +
    '<button class="btn small" id="nudge-go">' + (need ? "설치 방법" : "알림 켜기") + "</button></div>";
}

function stopStackHtml() {
  const day = (modeOverride || phase() === "during") ? todayStr() : TRIP.days[0].date;
  let items = itemsFor(day);
  if (!items.length) items = itemsFor(TRIP.days[0].date);
  const sq = seqNow();
  let idx = 0;
  if (sq.curItem) {
    const i = items.findIndex((r) => r.id === sq.curItem.id);
    if (i >= 0) idx = i;
  }
  const list = items.slice(idx, idx + 6);
  if (!list.length) return "";
  let html = '<h2 class="sec">다음 순서</h2><div class="stack">';
  list.forEach((r, i) => {
    const c = placeCoord(r.title);
    const q = placeQuery(r.title);
    html += '<div class="stopcard' + (i === 0 ? " cur" : "") + '">' +
      '<div class="stop-t">' + esc(r.t || "") + (i === 0 ? ' <span class="stop-now">지금</span>' : "") + "</div>" +
      '<div class="stop-title">' + esc(r.title) + "</div>" +
      (r.note ? '<div class="stop-note">' + esc(r.note) + "</div>" : "") +
      '<div class="stop-acts">' +
      (q ? '<a class="chip" href="' + gmapUrl(q) + '" target="_blank" rel="noopener">📍 지도</a>' : "") +
      (c ? '<button class="chip go-set" data-title="' + esc(r.title) + '">🧭 여기로 출발</button>' : "") +
      "</div></div>";
  });
  html += "</div>";
  return html;
}

function modeSwitchHtml(active) {
  const list = [["", "자동"], ["drive", "🚗 이동"], ["winery", "🍷 와이너리"], ["costco", "🛒 코스트코"], ["arrival", "🏠 도착"], ["cabin", "🗺️ 지도"]];
  return '<div class="chip-row mode-switch" id="mode-switch">' + list.map((m) =>
    '<button class="chip' + ((modeOverride || "") === m[0] ? " on" : "") + '" data-pv="' + m[0] + '">' + m[1] + "</button>").join("") + "</div>";
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
    html += urgentPollsHtml();
    html += pushNudgeHtml();
    html += stopStackHtml();
    html += heroBeforeHtml();
    html += '<div id="aq-home">' + aqHtml() + "</div>";
    html += '<h2 class="sec">준비물</h2><div class="card checklist" id="checklist"></div>';
  }

  if (p === "during") {
    const mode = homeMode();
    if (mode === "go") html += goCardHtml();
    else if (mode === "drive") html += driveCardHtml();
    else if (mode === "winery") html += wineryCardHtml();
    else if (mode === "costco") html += costcoCardHtml();
    else if (mode === "arrival") html += arrivalCardHtml();
    else html += heroLiveHtml();
    html += modeSwitchHtml(mode);
    html += urgentPollsHtml();
    html += pushNudgeHtml();
    html += stopStackHtml();

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

  const closed = store.polls.filter((x) => x.closed);
  html += '<h2 class="sec">투표</h2>';
  html += '<button class="btn ghost" id="new-poll" style="width:100%">+ 새 투표 걸기</button>';
  if (closed.length) {
    html += '<h2 class="sec">끝난 투표</h2>';
    for (const poll of closed.slice(0, 5)) html += pollHtml(poll, true);
  }

  el.innerHTML = html;

  if (p === "before") { renderChecklist(); tickDep(); preTripETA(); }
  $$("#mode-switch .chip", el).forEach((c) => c.onclick = () => { modeOverride = c.dataset.pv; renderHome(); });
  $$(".pm-x", el).forEach((b) => b.onclick = async () => {
    if (needSb()) return;
    await sb.from("votes").delete().eq("poll_id", Number(b.dataset.poll)).eq("member", me);
    loadAll();
  });
  const ng = $("#nudge-go");
  if (ng) ng.onclick = () => { if (pushState() === "need-install") { fillInstallGuide(); $("#install-modal").hidden = false; } else enablePush(); };

  $$(".go-set", el).forEach((b) => b.onclick = () => {
    if (!me) return openWho();
    const t = b.dataset.title;
    if (!confirm('"' + t + '" — 전원 홈에 "우리 다 같이 → 여기"로 띄울까?')) return;
    setDestFromTitle(t);
  });
  if ($("#home-map")) drawMap("home-map", p === "before" ? { route: true } : {});
  const hg = $("#hero-go"); if (hg) hg.onclick = () => switchTab("stamp");
  bindCopies(el);
  const np = $("#new-poll"); if (np) np.onclick = openPollModal;
  const hp = $("#home-ping"); if (hp) hp.onclick = () => quickPing();
  const hs = $("#home-stamp"); if (hs) hs.onclick = openStampModal;
  const nl = $("#nav-loc"); if (nl) nl.onclick = () => getPosition().then(() => renderHome());
  const rh = $("#rally-here");
  if (rh) rh.onclick = async () => {
    if (!me) return openWho();
    const r = await qInsert("checkins", { member: me, place: "🍟 " + RALLY.n + " 도착", note: null, lat: lastPos ? lastPos.lat : null, lng: lastPos ? lastPos.lng : null });
    if (r === true) { toast("도착 알림 보냄"); loadAll(); }
  };
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
    if (r === true) { toast("📻 전송: " + q); sendPush(nameOf(me), q, "radio"); loadAll(); }
  });

  $$(".board-card", el).forEach((bc) => bc.onclick = async (ev) => {
    if (ev.target.closest(".play-btn")) return;
    const mid = bc.dataset.mid;
    if (!mid || mid === me) return;
    if (!me) return openWho();
    if (!confirm(nameOf(mid) + "에게 위치 요청 보낼까?")) return;
    const r = await qInsert("checkins", { member: me, place: "📍 위치 요청 → " + nameOf(mid), note: null, target: mid, lat: null, lng: null });
    if (r === true) { toast("요청 보냄 — 응답 오면 알려줄게"); sendPush(nameOf(me), "📍 " + nameOf(mid) + ", 위치를 보내라!", "req"); loadAll(); }
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
    if (res === true) { sendPush(nameOf(me), v, "radio"); loadAll(); }
  }
  if (rs) rs.onclick = sendRadioText;
  if (rt) rt.addEventListener("keydown", (e) => { if (e.key === "Enter") sendRadioText(); });

  wireSiren();
  if (currentTab === "stamp") setTimeout(() => drawMap("map"), 60);
}

/* ---- 화장실 긴급 버튼 ---- */
let sirenArmTimer = null, sirenNodes = null, emgSoundTimer = null;
function wireSiren(sel) {
  const b = $(sel || "#siren-btn");
  if (!b) return;
  const hintOf = () => $(b.id === "siren-fab" ? "#fab-hint" : "#siren-hint");
  b.onclick = async () => {
    const last = Number(localStorage.getItem("kel_siren") || 0);
    if (Date.now() - last < 600000) return toast("🚽 10분에 한 번만 — " + Math.ceil((600000 - (Date.now() - last)) / 60000) + "분 뒤 가능");
    if (!b.classList.contains("armed")) {
      b.classList.add("armed");
      buzz([25]);
      const h = hintOf();
      if (h) h.textContent = "⚠️ 진짜 급해? 3초 안에 한 번 더 누르면 전원 발사";
      if (b.id === "siren-fab") { const t = $("#fab-tip"); if (t) { t.hidden = false; t.textContent = "한 번 더 누르면 발사!"; } }
      clearTimeout(sirenArmTimer);
      sirenArmTimer = setTimeout(() => {
        b.classList.remove("armed");
        const h2 = hintOf();
        if (h2) h2.textContent = "익명 · 10분에 1번 · 두 번 눌러야 발사 (전원 폰에 사이렌)";
        const t2 = $("#fab-tip"); if (t2) t2.hidden = true;
      }, 3000);
      return;
    }
    const tipEl = $("#fab-tip"); if (tipEl) tipEl.hidden = true;
    clearTimeout(sirenArmTimer);
    b.classList.remove("armed");
    if (needSb()) return;
    localStorage.setItem("kel_siren", String(Date.now()));
    const leak = Math.random() < 0.15;
    const note = leak ? "절대 " + nameOf(me) + " 아님" : null;
    emergency(note);
    sendPush("🚨 화장실 긴급", note || "누군가 한계에 도달했다. 길을 비켜라", "siren");
    await sb.from("sirens").insert(note ? { note } : {});
  };
}
function emergencyPractice() {
  const e = $("#emg");
  if (!e || !e.hidden) return;
  const t = e.querySelector(".emg-title"), sub = e.querySelector(".emg-sub"), ic = e.querySelector(".emg-icon");
  const old = [t.textContent, sub.textContent, ic.textContent];
  sub.classList.remove("leak");
  e.classList.add("practice");
  ic.textContent = "🚽 ✨ 🚽";
  t.textContent = "연습 발사 성공";
  sub.textContent = "진짜로 누르면 6명 폰이 전부 이렇게 돼. 익명이야.";
  e.hidden = false;
  chime();
  edgeGlow("#FFD08A", true);
  weatherFx("arrival", 3, "#FFD08A", "이게 화장실 긴급 버튼이야");
  buzz([40, 60, 40]);
  setTimeout(() => {
    e.hidden = true;
    e.classList.remove("practice");
    t.textContent = old[0]; sub.textContent = old[1]; ic.textContent = old[2];
  }, 3600);
}

function emergency(note) {
  const e = $("#emg");
  if (!e || !e.hidden) return;
  const sub = e.querySelector(".emg-sub");
  if (sub) {
    if (note) { sub.textContent = note; sub.classList.add("leak"); }
    else { sub.textContent = "익명 · 길을 비켜라"; sub.classList.remove("leak"); }
  }
  e.hidden = false;
  edgeGlow("#FF5E4D", true);
  weatherFx("siren", 3, "#FF5E4D", "화장실 긴급 — 길을 비켜라");
  buzz([90, 70, 90, 70, 160]);
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

function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "triangle"; o.frequency.value = f;
      const t0 = now + i * 0.13;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.13, t0 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.1);
      o.connect(g); g.connect(ctx.destination);
      o.start(t0); o.stop(t0 + 1.2);
    });
    setTimeout(() => { try { ctx.close(); } catch (e) {} }, 1900);
  } catch (e) {}
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
    sendPush(nameOf(me), "🎙️ 음성 무전이 도착했어", "voice");
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

  const pst = pushState();
  html += '<h2 class="sec">알림 · 초대</h2><div class="card">' +
    '<div class="kv"><b>🔔 알림</b><span class="code-line">' +
    (pst === "granted" && localStorage.getItem("kel_push")
      ? '<b style="color:var(--pine)">켜짐 — 앱 꺼져도 옴</b>'
      : pst === "need-install" ? '<span class="muted">홈 화면 설치 필요</span>'
      : pst === "denied" ? '<span class="muted">차단됨 — 아이폰 설정 → 알림</span>'
      : '<span style="color:var(--danger);font-weight:600">꺼짐</span>') +
    '<button class="btn small" id="push-on">' + (localStorage.getItem("kel_push") ? "다시 등록" : "알림 켜기") + "</button>" +
    (pst === "granted" && localStorage.getItem("kel_push") ? '<button class="btn ghost small" id="push-test">내 폰으로 테스트</button>' : "") +
    "</span></div>" +
    '<div class="kv"><b>📤 친구 초대</b><span class="code-line"><button class="btn ghost small" id="invite-go">설치 안내 보내기</button></span></div>' +
    '<div class="kv"><b>📲 설치</b><span class="code-line"><button class="btn ghost small" id="ig-open2">설치 방법 보기</button></span></div>' +
    "</div>";

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
    '<div class="kv"><b>내 캐릭터</b><span class="code-line">' + (me && charOf(me) ? av(me) + " <b>" + esc(fullName(me)) + '</b> <span class="muted" style="font-size:12px">' + esc(tierById[tierOf(me)].name) + "</span>" : '<span class="muted">아직 없음</span>') +
    '<button class="btn ghost small" id="open-odds">확률표</button>' +
    (charOf(me) ? '<button class="btn ghost small" id="fx-demo">내 이펙트</button>' : "") +
    '<button class="btn ghost small" id="pack-demo">뽑기 연출 테스트</button></span></div>' +
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

  const hall = MEMBERS.map((m) => ({ m, c: charOf(m.id) })).filter((x) => x.c).sort((a, b) => b.c.t - a.c.t);
  if (hall.length) {
    html += '<h2 class="sec">명예의 전당</h2><div class="card" style="padding:4px 18px">';
    for (const x of hall) {
      const t = tierById[x.c.t];
      html += '<div class="rowline">' + av(x.m.id) +
        '<div><div style="font-weight:700;font-size:14px">' + esc(x.c.last + " " + x.m.name + " " + x.c.first) + "</div>" +
        '<div class="muted" style="font-size:12px;margin-top:2px">' + x.c.em + " " + esc(x.c.ko) + "</div></div>" +
        '<span style="margin-left:auto;font-weight:800;font-size:12px;color:' + t.color + '">' + t.en + "</span></div>";
    }
    html += "</div>";
  }

  html += '<h2 class="sec">운명</h2><div class="card"><div class="fate">' +
    '<div><div style="font-weight:700;font-size:15px">운명 거스르기</div>' +
    '<div class="muted" style="margin-top:3px">뽑기 20번을 새로 받아</div>' +
    (Number(localStorage.getItem("kel_fate") || 0) ? '<div class="muted" style="font-size:11px;margin-top:2px">지금까지 ' + localStorage.getItem("kel_fate") + '번 거슬렀음</div>' : "") + "</div>" +
    '<div style="margin-left:auto;text-align:right"><div class="fate-price">$10.99</div>' +
    '<div class="muted" style="font-size:11px">사실 공짜</div></div></div>' +
    '<button class="btn" id="fate-btn" style="width:100%;margin-top:12px">뽑기</button></div>';

  html += '<p class="muted" style="margin:14px 4px">Safari 공유 버튼 → "홈 화면에 추가" 하면 앱처럼 열려. 6명 다 해두자.</p>';
  html += '<div class="card" style="display:flex;align-items:center;gap:10px">' +
    '<div><div style="font-weight:700;font-size:14px">앱 버전</div>' +
    '<div class="muted" style="font-size:12px;margin-top:2px">' + BUILD + "</div></div>" +
    '<button class="btn small" id="force-update" style="margin-left:auto">최신으로 갱신</button></div>';
  html += '<button class="btn ghost" id="reset-local" style="width:100%;margin:6px 0 20px;color:var(--pencil)">🔒 이 폰 초기화 (비밀번호 필요)</button>';

  el.innerHTML = html;
  $("#edit-door").onclick = () => editSetting("door_code", "도어코드 (호스트 메시지에 있음)");
  $("#edit-wifi").onclick = () => editSetting("wifi_code", "Wi-Fi 비밀번호");
  $("#edit-album").onclick = () => editSetting("album_url", "공유 앨범 링크 (https://…)");
  $("#edit-coord").onclick = editCoord;
  $("#edit-me").onclick = openWho;
  const ta = $("#tut-again"); if (ta) ta.onclick = openTut;
  const oo = $("#open-odds"); if (oo) oo.onclick = openOdds;
  const fu = $("#force-update");
  if (fu) fu.onclick = async () => {
    toast("갱신 중…");
    try {
      if ("caches" in window) { const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k))); }
      if (navigator.serviceWorker) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch (e) {}
    location.href = location.pathname + "?v=" + Date.now();
  };
  const rl = $("#reset-local");
  if (rl) rl.onclick = () => {
    const pw = prompt("초기화 비밀번호를 입력해");
    if (pw === null) return;
    if (pw.trim() !== RESET_PW) return toast("비밀번호가 틀렸어");
    if (!confirm("이 폰의 캐릭터·뽑기 횟수·튜토리얼·알림 등록을 모두 지울까?\n(다른 사람 데이터는 그대로)")) return;
    ["kel_me","kel_rolls","kel_dry","kel_fate","kel_tut","kel_tut_loc","kel_tut_siren","kel_push","kel_nonotif",
     "kel_bypass","kel_a2hs","kel_a2hs_snooze","kel_push_x","kel_check","kel_alerts","kel_queue","kel_mirror",
     "kel_theme","kel_siren","kel_req_done","kel_aq"].forEach((k) => localStorage.removeItem(k));
    location.reload();
  };
  const fd = $("#fx-demo"); if (fd) fd.onclick = () => { charFx(me, 3); showRibbon(charOf(me).ko + "의 시그니처", colorOf(me)); };
  const pd = $("#pack-demo");
  if (pd) pd.onclick = () => { const pick = ROSTER[Math.floor(Math.random() * ROSTER.length)]; openPack(pick, () => toast(pick.em + " " + pick.ko + " — 연출 끝")); };
  const fb = $("#fate-btn"); if (fb) fb.onclick = () => {
    if (!confirm("$10.99 — 진짜 결제는 아니야.\n뽑기 20번을 새로 받고 다시 굴릴까?")) return;
    localStorage.setItem("kel_rolls", "0");
    localStorage.setItem("kel_fate", String(Number(localStorage.getItem("kel_fate") || 0) + 1));
    rollResult = drawCharacter();
    toast("💸 결제 완료(가짜). 20번 새로 받았어");
    openRoll();
  };
  const pon = $("#push-on"); if (pon) pon.onclick = enablePush;
  const pt = $("#push-test");
  if (pt) pt.onclick = () => {
    sendPush("🔔 테스트 알림", "이렇게 오면 성공! 앱을 닫고 다시 눌러봐도 와.", "test", true);
    toast("보냈어 — 몇 초 안에 알림이 뜰 거야");
  };
  const inv = $("#invite-go"); if (inv) inv.onclick = shareInvite;
  const ig2 = $("#ig-open2"); if (ig2) ig2.onclick = () => { fillInstallGuide(); $("#install-modal").hidden = false; };
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

function phoneSvg(kind) {
  const F = '<rect x="6" y="4" width="128" height="212" rx="20" fill="var(--card)" stroke="var(--line-2)" stroke-width="2"/>';
  if (kind === "share") {
    return '<svg viewBox="0 0 140 230" class="ig-svg">' + F +
      '<rect x="18" y="26" width="104" height="150" rx="8" fill="var(--paper-2)"/>' +
      '<rect x="12" y="186" width="116" height="24" rx="12" fill="var(--paper-2)" stroke="var(--line-2)"/>' +
      '<g transform="translate(64,190)"><rect x="0" y="6" width="14" height="12" rx="2.5" fill="none" stroke="var(--lake)" stroke-width="2"/>' +
      '<path d="M7 10 V1 M7 1 L3.6 4.4 M7 1 L10.4 4.4" stroke="var(--lake)" stroke-width="2" fill="none" stroke-linecap="round"/></g>' +
      '<circle cx="71" cy="198" r="17" fill="none" stroke="var(--lake)" stroke-width="2" opacity=".9"><animate attributeName="r" values="14;22;14" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0;.9" dur="1.6s" repeatCount="indefinite"/></circle>' +
      "</svg>";
  }
  if (kind === "sheet") {
    return '<svg viewBox="0 0 140 230" class="ig-svg">' + F +
      '<rect x="14" y="70" width="112" height="140" rx="14" fill="var(--paper-2)"/>' +
      '<rect x="24" y="84" width="92" height="16" rx="5" fill="var(--line)"/>' +
      '<rect x="24" y="108" width="92" height="16" rx="5" fill="var(--line)"/>' +
      '<rect x="24" y="132" width="92" height="16" rx="5" fill="var(--line)"/>' +
      '<rect x="20" y="154" width="100" height="26" rx="7" fill="rgba(31,110,122,.16)" stroke="var(--lake)" stroke-width="2"/>' +
      '<rect x="27" y="161" width="12" height="12" rx="3" fill="none" stroke="var(--lake)" stroke-width="2"/>' +
      '<path d="M33 164 v6 M30 167 h6" stroke="var(--lake)" stroke-width="2" stroke-linecap="round"/>' +
      '<rect x="46" y="164" width="52" height="7" rx="3.5" fill="var(--lake)" opacity=".55"/>' +
      '<path d="M70 196 v10" stroke="var(--pencil)" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M66 202 l4 5 l4 -5" fill="none" stroke="var(--pencil)" stroke-width="2" stroke-linecap="round"/>' +
      "</svg>";
  }
  if (kind === "add") {
    return '<svg viewBox="0 0 140 230" class="ig-svg">' + F +
      '<rect x="14" y="28" width="112" height="40" rx="10" fill="var(--paper-2)"/>' +
      '<rect x="86" y="38" width="34" height="20" rx="10" fill="var(--lake)"/>' +
      '<rect x="94" y="45" width="18" height="6" rx="3" fill="#fff"/>' +
      '<circle cx="103" cy="48" r="24" fill="none" stroke="var(--lake)" stroke-width="2"><animate attributeName="r" values="20;28;20" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0;.9" dur="1.6s" repeatCount="indefinite"/></circle>' +
      '<rect x="24" y="86" width="60" height="10" rx="5" fill="var(--line)"/>' +
      '<rect x="24" y="104" width="92" height="8" rx="4" fill="var(--line)"/>' +
      "</svg>";
  }
  return '<svg viewBox="0 0 140 230" class="ig-svg">' + F +
    '<rect x="22" y="40" width="30" height="30" rx="8" fill="var(--line)"/>' +
    '<rect x="60" y="40" width="30" height="30" rx="8" fill="var(--line)"/>' +
    '<rect x="98" y="40" width="24" height="30" rx="8" fill="var(--line)"/>' +
    '<rect x="22" y="86" width="30" height="30" rx="8" fill="var(--wine)"/>' +
    '<circle cx="37" cy="101" r="9" fill="none" stroke="#fff" stroke-width="2"/>' +
    '<rect x="22" y="122" width="30" height="7" rx="3.5" fill="var(--line)"/>' +
    '<circle cx="37" cy="101" r="24" fill="none" stroke="var(--wine)" stroke-width="2"><animate attributeName="r" values="20;30;20" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0;.9" dur="1.6s" repeatCount="indefinite"/></circle>' +
    '<rect x="60" y="86" width="30" height="30" rx="8" fill="var(--line)"/>' +
    "</svg>";
}

let igIdx = 0, igSteps = [];
function igBuild() {
  const ua = navigator.userAgent || "";
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const chromeIOS = isIOS && /CriOS/i.test(ua);
  if (isIOS) {
    return [
      { svg: "share", t: "1. 화면 맨 아래 공유 버튼", d: chromeIOS
          ? "크롬은 <b>주소창 오른쪽</b>에 있어. 안 보이면 <b>⋯ 더보기</b>를 눌러."
          : "네모에서 화살표 올라가는 아이콘이야.<br><b>안 보이면 화면을 아래로 살짝 스크롤</b>하면 나타나." },
      { svg: "sheet", t: '2. "홈 화면에 추가" 찾기', d: "메뉴가 뜨면 <b>한참 아래로 스크롤</b>해야 나와.<br>여기서 포기하는 사람이 제일 많아. 스크롤 계속!" },
      { svg: "add", t: "3. 오른쪽 위 '추가'", d: "이름은 그대로 두고 <b>추가</b>만 누르면 돼." },
      { svg: "home", t: "4. 이제 이 아이콘으로만 열기", d: "홈 화면에 아이콘이 생겼어.<br><b>사파리 탭으로 들어오면 알림이 안 와.</b> 꼭 아이콘으로." },
    ];
  }
  return [
    { svg: "add", t: "1. 주소창 오른쪽 설치 아이콘", d: "⊕ 또는 모니터 모양 아이콘을 눌러. 안 보이면 다음 단계로." },
    { svg: "sheet", t: "2. 오른쪽 위 ⋮ 더보기", d: "점 세 개 메뉴 → <b>앱으로 설치</b> 또는 <b>홈 화면에 추가</b>" },
    { svg: "home", t: "3. 설치 완료", d: "앱 아이콘이 생겨. <b>그 아이콘으로 열어야 알림이 와.</b>" },
  ];
}
function fillInstallGuide() { igIdx = 0; igSteps = igBuild(); igDraw(); }
function igDraw() {
  const box = $("#ig-body");
  if (!box) return;
  const st = igSteps[igIdx];
  box.innerHTML = '<div class="ig-stage">' + phoneSvg(st.svg) +
    '<div class="ig-text"><p class="ig-t">' + st.t + '</p><p class="ig-d">' + st.d + "</p></div></div>" +
    '<div class="tut-dots">' + igSteps.map((_, i) => '<span class="tut-dot' + (i === igIdx ? " on" : "") + '"></span>').join("") + "</div>" +
    (igIdx === 0 ? '<button class="btn" id="ig-point" style="width:100%;margin-bottom:8px">👆 화면에서 직접 가리켜 줘</button>' : "") +
    '<div class="btn-row" style="justify-content:space-between">' +
    '<button class="btn ghost" id="ig-prev">' + (igIdx === 0 ? "닫기" : "이전") + "</button>" +
    '<button class="btn" id="ig-next">' + (igIdx === igSteps.length - 1 ? "다 했어" : "다음") + "</button></div>";
  const pb = $("#ig-point");
  if (pb) pb.onclick = () => { $("#install-modal").hidden = true; pointToShare(); };
  $("#ig-prev").onclick = () => { if (igIdx === 0) { $("#install-modal").hidden = true; tutResume(); } else { igIdx--; igDraw(); } };
  $("#ig-next").onclick = () => {
    if (igIdx < igSteps.length - 1) { igIdx++; igDraw(); return; }
    $("#install-modal").hidden = true;
    if (isStandalone()) { toast("설치 완료! 이제 알림도 켜자"); } else { toast("아직 사파리 탭이야 — 홈 화면 아이콘으로 열어줘"); }
    tutResume();
  };
}

/* 설치 전 하단 상시 바 */
function a2hsBar() {
  const b = document.getElementById("a2hs-bar");
  if (!b) return;
  const snooze = Number(localStorage.getItem("kel_a2hs_snooze") || 0);
  if (isStandalone() || Date.now() < snooze || pushState() === "unsupported") { b.hidden = true; return; }
  b.innerHTML = '<span>📲 <b>홈 화면에 설치</b>해야 알림이 와</span>' +
    '<button class="btn small" id="a2hs-go">방법 보기</button>' +
    '<button class="ib-x" id="a2hs-x" aria-label="닫기">✕</button>';
  b.hidden = false;
  document.body.classList.add("has-a2hs");
  $("#a2hs-go").onclick = () => { pointToShare(); };
  $("#a2hs-x").onclick = () => {
    localStorage.setItem("kel_a2hs_snooze", String(Date.now() + 86400000));
    b.hidden = true; document.body.classList.remove("has-a2hs");
  };
}

/* ---------- 설치 안 하면 앱 잠금 ---------- */
function isMobileUA() { return /iphone|ipad|ipod|android/i.test(navigator.userAgent || ""); }
function installRequired() {
  if (localStorage.getItem("kel_bypass")) return false;
  return !isStandalone();     // 데스크탑 포함 전 기기
}
function showInstallWall() {
  const g = document.getElementById("wall");
  if (!g) return false;
  const ua = navigator.userAgent || "";
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  g.innerHTML =
    '<div class="wall-card">' +
      '<div class="wall-ic">🎲</div>' +
      '<p class="wall-t">먼저 홈 화면에 설치해야<br>시작할 수 있어</p>' +
      '<p class="wall-d">캐릭터 뽑기·알림·음성 무전은 <b>설치한 앱에서만</b> 작동해.<br>2분이면 끝나고, 한 번만 하면 돼.</p>' +
      '<button class="btn" id="wall-point" style="width:100%;padding:16px">👆 어디 누르는지 보여줘</button>' +
      '<button class="btn ghost" id="wall-guide" style="width:100%;margin-top:9px">그림으로 4단계 보기</button>' +
      '<p class="wall-hint">설치 후에는 <b>홈 화면 아이콘</b>으로 열어야 해.<br>사파리 탭으로 들어오면 이 화면이 계속 떠.</p>' +
      '<button class="wall-skip" id="wall-skip">🔒 관리자 우회 →</button>' +
    "</div>";
  g.hidden = false;
  document.body.classList.add("walled");
  const wi = $("#wall-install");
  if (wi) wi.onclick = async () => {
    if (!deferredPrompt) return pointToShare();
    deferredPrompt.prompt();
    const res = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (res && res.outcome === "accepted") { toast("설치했으면 새 창(앱 아이콘)에서 열어줘"); setTimeout(() => location.reload(), 1200); }
  };
  $("#wall-point").onclick = pointToShare;
  $("#wall-guide").onclick = () => { fillInstallGuide(); $("#install-modal").hidden = false; };
  // 벽 위에서 열리는 모달이 가려지지 않게 (스타일에서 처리)
  $("#wall-skip").onclick = () => {
    const pw = prompt("우회하려면 관리자 비밀번호가 필요해");
    if (pw === null) return;
    if (pw.trim() !== RESET_PW) { alert("비밀번호가 틀렸어"); return; }
    if (!confirm("설치 없이 계속할까? (알림·음성 무전은 안 될 수 있어)")) return;
    localStorage.setItem("kel_bypass", "1");
    g.hidden = true; document.body.classList.remove("walled");
    location.reload();
  };
  return true;
}

/* ---------- 알림 안 켜면 뽑기 잠금 ---------- */
function notifReady() { return pushState() === "granted" && !!localStorage.getItem("kel_push"); }
function showNotifWall() {
  const g = document.getElementById("wall");
  if (!g) return false;
  const denied = pushState() === "denied";
  g.innerHTML =
    '<div class="wall-card">' +
      '<div class="wall-ic">🔔</div>' +
      '<p class="wall-t">' + (denied ? "알림이 꺼져 있어" : "알림을 켜야<br>뽑을 수 있어") + "</p>" +
      '<p class="wall-d">' + (denied
        ? '아이폰 <b>설정 → 알림 → 켈로나 수첩</b>에서 "알림 허용"을 켜고 돌아와.'
        : '무전·사이렌이 앱 꺼져 있을 때도 오게 하려면 필요해.<br>딱 한 번만 누르면 돼.') + "</p>" +
      (denied
        ? '<button class="btn" id="wall-recheck" style="width:100%;padding:16px">켰어 — 다시 확인</button>'
        : '<button class="btn" id="wall-notif" style="width:100%;padding:16px">🔔 알림 켜기</button>') +
      '<p class="wall-hint">이거 안 켜면 다른 사람이 무전을 보내도<br>앱을 직접 열기 전엔 알 수 없어.</p>' +
      '<button class="wall-skip" id="wall-skip2">알림 없이 그냥 할래 →</button>' +
    "</div>";
  g.hidden = false;
  document.body.classList.add("walled", "walled-notif");
  const nb = $("#wall-notif");
  if (nb) nb.onclick = async () => {
    await enablePush();
    if (notifReady()) { g.hidden = true; document.body.classList.remove("walled", "walled-notif"); openRoll(); }
    else showNotifWall();
  };
  const rc = $("#wall-recheck");
  if (rc) rc.onclick = () => {
    if (pushState() === "granted") { enablePush().then(() => { g.hidden = true; document.body.classList.remove("walled", "walled-notif"); openRoll(); }); }
    else toast("아직 꺼져 있어 — 설정에서 켜고 다시");
  };
  $("#wall-skip2").onclick = () => {
    if (!confirm("알림 없이 진행하면 무전을 놓칠 수 있어. 그래도 할까?")) return;
    localStorage.setItem("kel_nonotif", "1");
    g.hidden = true; document.body.classList.remove("walled", "walled-notif");
    openRoll();
  };
  return true;
}

/* ---------- 설치: 실제 화면 위에 화살표 오버레이 ---------- */
function pointToShare() {
  const o = document.getElementById("point");
  if (!o) return;
  const ua = navigator.userAgent || "";
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const chromeIOS = isIOS && /CriOS/i.test(ua);
  const top = chromeIOS || !isIOS;   // 크롬은 위쪽, 사파리는 아래쪽
  o.innerHTML =
    '<div class="pt-msg" style="' + (top ? "top:22%" : "bottom:30%") + '">' +
      '<div class="pt-t">' + (top ? "주소창 오른쪽" : "화면 맨 아래") + " <b>공유 버튼</b>을 눌러</div>" +
      '<div class="pt-d">' + (top ? "안 보이면 ⋯ 더보기 안에 있어" : "안 보이면 화면을 아래로 살짝 스크롤하면 나타나") + "</div>" +
      '<button class="btn" id="pt-done" style="width:100%;margin-top:14px">눌렀어 / 닫기</button>' +
    "</div>" +
    '<svg class="pt-arrow" style="' + (top ? "top:52px;right:34px" : "bottom:64px;left:50%;transform:translateX(-50%)") + '" width="70" height="120" viewBox="0 0 70 120">' +
      '<path d="M35,' + (top ? "104 C35,60 30,40 35,14" : "16 C35,60 40,80 35,106") + '" fill="none" stroke="#C8503C" stroke-width="4" stroke-linecap="round" stroke-dasharray="7 9"/>' +
      '<path d="' + (top ? "M35,6 l-11,16 h22Z" : "M35,114 l-11,-16 h22Z") + '" fill="#C8503C"/></svg>' +
    '<div class="pt-ring" style="' + (top ? "top:14px;right:22px" : "bottom:14px;left:50%;transform:translateX(-50%)") + '"></div>';
  o.hidden = false;
  document.body.classList.add("pointing");
  const d = document.getElementById("pt-done");
  if (d) d.onclick = () => {
    o.hidden = true; document.body.classList.remove("pointing");
    if (isStandalone()) location.reload(); else tutResume();
  };
}

/* ---------------- 튜토리얼 (행동형) ---------------- */
function tutSteps() {
  const installed = isStandalone();
  const pushOn = pushState() === "granted" && !!localStorage.getItem("kel_push");
  return [
    { ic: (me ? avatarOf(me) : "🎲"), t: me && charOf(me) ? fullName(me) : "캐릭터 뽑기",
      d: me && charOf(me) ? ("등급 <b>" + tierById[tierOf(me)].name + "</b>. 이 이모지가 지도·무전·장부에서 계속 나를 대신해.") : "주사위를 굴려서 이름을 받아. 20번까지 다시 굴릴 수 있어.",
      btn: charOf(me) ? "다시 뽑기" : "지금 뽑기", run: () => { tutPause(); rollResult = drawCharacter(); openRoll(); }, done: () => !!charOf(me) },
    { ic: "📲", t: "홈 화면에 설치", d: "이거 안 하면 알림이 아예 안 와 (애플 규칙).<br><b>버튼을 누르면 화면에서 직접 어디를 눌러야 하는지 화살표로 가리켜 줄게.</b>",
      btn: "어디 누르는지 보여줘", run: () => { tutPause(); pointToShare(); }, done: () => installed, skipIf: () => installed },
    { ic: "🔔", t: "알림 켜기", d: "앱이 꺼져 있어도 무전·사이렌이 알림으로 와. 지금 눌러서 켜자.",
      btn: "알림 켜기", run: async () => { await enablePush(); drawTut(); }, done: () => pushOn },
    { ic: "📍", t: "위치 한 번 보내보기", d: "여기서 바로 눌러봐. 내 위치가 다들 지도에 뜨고, 이게 둘째 날 흩어져도 서로 찾는 방법이야.",
      btn: "지금 보내기", run: async () => { await quickPing(true); localStorage.setItem("kel_tut_loc", "1"); drawTut(); }, done: () => !!localStorage.getItem("kel_tut_loc") },
    { ic: "📻", t: "무전 쓰는 법",
      d: "<b>꾹 누르면</b> 음성 녹음, 떼면 전송<br><b>짧게 탭</b>하면 위치만 송신<br><b>빠른 무전</b> 칩으로 '어디십니까' 원탭<br><b>친구 카드 탭</b>하면 그 사람에게 위치 요청" },
    { ic: "🚽", t: "화장실 긴급 버튼", d: "화면 <b>오른쪽 아래</b>에 항상 떠 있어. 한 번 누르면 무장, 3초 안에 한 번 더 누르면 <b>6명 전원 폰에 사이렌</b>. 누가 눌렀는진 아무도 몰라. 10분에 한 번만.",
      btn: "연습으로 눌러보기", run: () => { tutPause(); emergencyPractice(); setTimeout(() => { $("#tut-modal").hidden = false; localStorage.setItem("kel_tut_siren", "1"); drawTut(); }, 3800); }, done: () => !!localStorage.getItem("kel_tut_siren") },
    { ic: "🧭", t: "홈은 알아서 바뀐다", d: "이동 중엔 남은 시간, 코스트코 시간엔 장보기, 숙소 도착하면 도어코드가 저절로 떠. 준비 끝!" },
  ];
}
let tutIdx = 0, tutList = [], tutPaused = false;
function tutPause() { tutPaused = true; $("#tut-modal").hidden = true; }
function tutResume() { if (!tutPaused) return; tutPaused = false; $("#tut-modal").hidden = false; drawTut(); }
function openTut() { tutIdx = 0; tutPaused = false; tutList = tutSteps(); drawTut(); $("#tut-modal").hidden = false; }
function drawTut() {
  tutList = tutSteps();
  const st = tutList[tutIdx];
  if (!st) return closeTut();
  const isDone = st.done ? st.done() : false;
  $("#tut-body").innerHTML =
    '<div class="tut-ic">' + st.ic + "</div>" +
    '<p class="modal-title" style="text-align:center">' + esc(st.t) + (isDone ? ' <span class="tut-ok">✅</span>' : "") + "</p>" +
    '<p class="tut-d">' + st.d + "</p>" +
    (st.btn ? '<button class="btn tut-act" id="tut-act"' + (isDone ? " disabled" : "") + ">" + (isDone ? "완료됨 ✅" : st.btn) + "</button>" : "");
  $("#tut-dots").innerHTML = tutList.map((x, i) =>
    '<span class="tut-dot' + (i === tutIdx ? " on" : (x.done && x.done() ? " ok" : "")) + '"></span>').join("");
  const last = tutIdx === tutList.length - 1;
  $("#tut-next").textContent = last ? "시작하기" : (st.btn && !isDone ? "나중에" : "다음");
  $("#tut-skip").textContent = tutIdx === 0 ? "건너뛰기" : "이전";
  const a = $("#tut-act");
  if (a && !isDone) a.onclick = () => { try { st.run(); } catch (e) { console.error(e); } };
}
function closeTut() { localStorage.setItem("kel_tut", "1"); tutPaused = false; $("#tut-modal").hidden = true; rerender(); }

/* ---------------- 팩 오프닝 연출 ---------------- */
let packT = [];
function packClear() { packT.forEach(clearTimeout); packT = []; }
function PT(fn, ms) { packT.push(setTimeout(fn, ms)); }
function packTone(tier) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)(), now = ctx.currentTime;
    const notes = tier >= 5 ? [261,329,392,523,659,784] : tier >= 4 ? [261,329,392,523] : tier >= 3 ? [329,415,523] : [392,494];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = tier >= 4 ? "triangle" : "sine"; o.frequency.value = f;
      const t0 = now + i * 0.16;
      g.gain.setValueAtTime(.0001, t0); g.gain.linearRampToValueAtTime(tier >= 4 ? .16 : .1, t0 + .03);
      g.gain.exponentialRampToValueAtTime(.0001, t0 + .9);
      o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0 + 1);
    });
    if (tier >= 5) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sawtooth"; o.frequency.value = 55;
      g.gain.setValueAtTime(.0001, now); g.gain.linearRampToValueAtTime(.2, now + .05);
      g.gain.exponentialRampToValueAtTime(.0001, now + 1.5);
      o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + 1.6);
    }
    setTimeout(() => { try { ctx.close(); } catch (e) {} }, 2800);
  } catch (e) {}
}
function reduceMotion() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}
function openPack(c, done) {
  const pack = document.getElementById("pack");
  if (!pack) { done && done(); return; }
  packClear();
  const tier = tierById[c.t];
  const myth = c.t === 5;
  const calm = reduceMotion();
  const dur = calm ? 1600 : (myth ? 5500 : 4000), scale = dur / 4000;
  pack.hidden = false;
  pack.style.setProperty("--rc", tier.color);
  const c3d = $("#c3d"), front = $("#p-front");
  front.style.setProperty("--rc", tier.color);
  front.classList.remove("on"); c3d.className = "card3d"; c3d.style.transform = ""; c3d.style.opacity = "";
  document.body.classList.remove("quake");
  $("#p-em").textContent = c.em;
  $("#p-nm").textContent = c.last + " " + nameOf(me) + " " + c.first;
  $("#p-ko").textContent = c.ko + " · " + tier.name;
  $("#p-rk").textContent = tier.en + " · " + (myth ? "0.1%" : tier.p + "%");
  $("#p-beams").innerHTML = ""; $("#p-conf").innerHTML = "";
  const tBeam = Math.round(500 * scale), tFlip = Math.round(2200 * scale), tEnd = Math.round(4000 * scale);
  pack.classList.toggle("calm", calm);
  c3d.classList.add("enter");
  PT(() => {
    const n = myth ? 8 : c.t >= 4 ? 6 : c.t >= 3 ? 4 : c.t >= 2 ? 3 : 2;
    let h = "";
    for (let i = 0; i < n; i++)
      h += '<span class="beam go" style="--rc:' + tier.color + ";--rot:" + (i * (180 / n)) +
        "deg;--dur:" + ((tFlip - tBeam) / 1000) + "s;--bw:" + (c.t >= 4 ? 150 : 100) + "px;--bl:" +
        (c.t >= 4 ? 10 : 16) + "px;animation-delay:" + (i * 0.05) + 's"></span>';
    h += '<span class="halo go" style="--rc:' + tier.color + ";--dur:" + ((tFlip - tBeam) / 1000) + 's"></span>';
    $("#p-beams").innerHTML = h;
    packTone(c.t);
    buzz(c.t >= 5 ? [60,40,60,40,140] : c.t >= 4 ? [40,50,90] : [30]);
  }, tBeam);
  if (c.t >= 4) PT(() => { const f = $("#p-flash"); f.className = "flash"; void f.offsetWidth; f.className = "flash go"; }, tFlip - Math.round(200 * scale));
  PT(() => { c3d.classList.add("flip", "shown"); }, tFlip);
  // 안전장치: 애니메이션이 죽어도 3.2초 뒤엔 무조건 카드가 보이게
  PT(() => { c3d.classList.add("shown"); c3d.style.transform = "rotateY(0)"; c3d.style.opacity = "1"; front.classList.add("on"); }, tFlip + Math.round(900 * scale));
  PT(() => {
    front.classList.add("on");
    if (c.t >= 4) {
      document.body.classList.add("quake");
      let h = "";
      const n = c.t >= 5 ? 40 : 24;
      for (let i = 0; i < n; i++) {
        const dx = (Math.random() * 2 - 1) * 260, dy = 200 + Math.random() * 420, dr = Math.random() * 720 - 360;
        h += '<span class="conf go" style="left:50%;top:34%;background:' + (i % 3 ? tier.color : "#F4E4B8") +
          ";--dx:" + dx + "px;--dy:" + dy + "px;--dr:" + dr + "deg;--cd:" + (1.2 + Math.random() * .9) +
          "s;animation-delay:" + (Math.random() * .3) + 's"></span>';
      }
      $("#p-conf").innerHTML = h;
    }
  }, tFlip + Math.round(300 * scale));
  const finish = () => { packClear(); pack.hidden = true; document.body.classList.remove("quake"); done && done(); };
  PT(finish, tEnd + Math.round(1200 * scale));
  pack.onclick = finish;
}

/* ---------------- 캐릭터 뽑기 ---------------- */
let rollResult = null;
function myRolls() { return Number(localStorage.getItem("kel_rolls") || 0); }
function bumpRolls() { localStorage.setItem("kel_rolls", String(myRolls() + 1)); }
function dryStreak() { return Number(localStorage.getItem("kel_dry") || 0); }
function drawCharacter() {
  const taken = takenIds();
  const pool = ROSTER.filter((c) => taken.indexOf(c.id) < 0);
  if (!pool.length) return null;
  let picked = null;
  // 천장: 12번 연속 영웅 미만이면 영웅 이상 확정
  if (dryStreak() >= PITY_AT) {
    const hi = pool.filter((c) => c.t >= 3);
    if (hi.length) picked = hi[Math.floor(Math.random() * hi.length)];
  }
  if (!picked) {
    const roll = Math.random() * 100;
    let acc = 0, tier = 1;
    const order = TIERS.slice().sort((a, b) => a.p - b.p); // 희귀한 것부터
    for (const t of order) { acc += t.p; if (roll <= acc) { tier = t.t; break; } }
    let cands = pool.filter((c) => c.t === tier);
    for (let t = tier - 1; t >= 1 && !cands.length; t--) cands = pool.filter((c) => c.t === t);
    if (!cands.length) cands = pool;
    picked = cands[Math.floor(Math.random() * cands.length)];
  }
  localStorage.setItem("kel_dry", picked.t >= 3 ? "0" : String(dryStreak() + 1));
  return picked;
}
function openRoll(skipFx) {
  if (installRequired()) { showInstallWall(); return; }
  if (!me) return openWho();
  if (!notifReady() && !localStorage.getItem("kel_nonotif") && pushState() !== "unsupported") { showNotifWall(); return; }
  const fresh = !rollResult;
  rollResult = rollResult || drawCharacter();
  if (!rollResult) return toast("남은 캐릭터가 없어");
  if (fresh && !skipFx) { openPack(rollResult, () => { drawRoll(); $("#roll-modal").hidden = false; }); return; }
  drawRoll();
  $("#roll-modal").hidden = false;
}
function drawRoll() {
  const box = $("#roll-body");
  if (!box) return;
  const c = rollResult;
  if (!c) { box.innerHTML = '<p class="muted">남은 캐릭터가 없어.</p>'; return; }
  const t = tierById[c.t];
  const left = Math.max(0, MAX_ROLLS - myRolls());
  const taken = takenIds().map((id) => charById[id]).filter(Boolean);
  box.innerHTML =
    '<div class="medal spin" style="--rc:' + t.color + '">' +
      (c.t >= 5 ? '<span class="spark" style="width:8px;height:8px;top:-2px;left:70px"></span><span class="spark" style="width:5px;height:5px;top:36px;right:-6px;animation-delay:.5s"></span><span class="spark" style="width:4px;height:4px;bottom:10px;left:14px;animation-delay:1s"></span>' : "") +
      '<div class="rg"></div><div class="in"><div class="em">' + c.em + '</div><div class="rk">' + t.en + " · " + t.p + "%</div></div></div>" +
    '<div class="roll-name"><div class="en">' + esc(c.last) + " <b>" + esc(nameOf(me)) + "</b> " + esc(c.first) + "</div>" +
      '<div class="ko">' + esc(c.ko) + " · " + t.name + (c.t === 6 ? " — 이 세계 사람이 아니야" : c.t === 5 ? " — 부엉이다" : "") + "</div></div>" +
    '<div class="rolls">ROLLS LEFT<b>' + left + '<span>/' + MAX_ROLLS + "</span></b></div>" +
    '<div class="btn-row" style="margin-top:12px">' +
      '<button class="btn ghost" id="roll-again"' + (left <= 0 ? " disabled" : "") + ' style="flex:1">🎲 다시 굴리기</button>' +
      '<button class="btn" id="roll-ok" style="flex:1">이걸로 확정</button></div>' +
    (taken.length ? '<div class="field-label">이미 뽑힌 이름</div><div class="taken">' +
      taken.map((x) => "<span>" + x.em + " " + esc(x.ko) + "</span>").join("") + "</div>" : "") +
    '<button class="btn ghost" id="roll-odds" style="width:100%;margin-top:14px">확률표 보기</button>';
  $("#roll-again").onclick = () => {
    if (myRolls() >= MAX_ROLLS) return toast("20번 다 썼어 — 정보 탭에서 운명 거스르기");
    bumpRolls();
    const next = drawCharacter();
    if (!next) return toast("남은 캐릭터가 없어");
    $("#roll-modal").hidden = true;
    openPack(next, () => { rollResult = next; drawRoll(); $("#roll-modal").hidden = false; });
  };
  $("#roll-ok").onclick = confirmRoll;
  $("#roll-odds").onclick = openOdds;
}
async function confirmRoll() {
  if (needSb() || !rollResult) return;
  const c = rollResult;
  const { error } = await sb.from("characters").upsert({ member: me, char_id: c.id, tier: c.t, rolls: myRolls() }, { onConflict: "member" });
  if (error) {
    toast("누가 방금 그 캐릭터를 가져갔어 — 다시 뽑을게");
    await loadAll(); rollResult = drawCharacter(); drawRoll(); return;
  }
  $("#roll-modal").hidden = true;
  rollResult = null;
  await loadAll();
  stampFx(c.em + " " + c.ko);
  toast(fullName(me) + " 확정!");
  if (c.t >= 5) {
    sendPush("✦ 0.1% 등장", nameOf(me) + "이(가) " + c.em + " " + c.ko + "를 뽑았다", "myth");
    await qInsert("checkins", { member: me, place: "✦ " + c.em + " " + c.ko + " (0.1%) 뽑음", note: null, lat: null, lng: null });
  } else if (c.t === 4) {
    sendPush("🏅 전설 등장", nameOf(me) + " → " + c.em + " " + c.ko, "legend");
  }
  if (!localStorage.getItem("kel_tut")) setTimeout(openTut, 500);
}
function openOdds() {
  const box = $("#odds-body");
  if (!box) return;
  const taken = takenIds();
  box.innerHTML = TIERS.map((t) => {
    const list = ROSTER.filter((c) => c.t === t.t);
    const left = list.filter((c) => taken.indexOf(c.id) < 0).length;
    return '<div class="odds-row"><span class="odds-ring" style="--rc:' + t.color + '">' + list[0].em + "</span>" +
      '<div><div class="odds-t">' + t.name + " <span class=\"muted\">" + t.en + "</span></div>" +
      '<div class="odds-l">' + list.map((c) => c.em + " " + c.ko).join(" · ") + "</div>" +
      '<div class="odds-l">남은 인원 ' + left + "/" + list.length + "</div></div>" +
      '<span class="odds-p" style="color:' + t.color + '">' + t.p + "%</span></div>";
  }).join("") + '<p class="muted" style="text-align:center;margin-top:14px">꽝은 없어. 운만 다를 뿐</p>';
  $("#odds-modal").hidden = false;
}

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
      if (tutPaused) setTimeout(tutResume, 300);
      else if (!charOf(me)) setTimeout(openRoll, 400);
      else if (!localStorage.getItem("kel_tut")) setTimeout(openTut, 400);
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
  $("#tut-skip").onclick = () => { if (tutIdx === 0) closeTut(); else { tutIdx--; drawTut(); } };
  $("#install-close").onclick = () => { $("#install-modal").hidden = true; tutResume(); };
  const oc = $("#odds-close"); if (oc) oc.onclick = () => { $("#odds-modal").hidden = true; };
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
    sendPush("🗳️ 새 투표 — " + nameOf(me), q, "poll");
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
  try {
    if (tab === "home") renderHome();
    else if (tab === "plan") renderPlan();
    else if (tab === "stamp") renderStamp();
    else if (tab === "ledger") renderLedger();
    else if (tab === "info") renderInfo();
  } catch (e) {
    console.error(e);
    const el = document.getElementById("tab-" + tab);
    if (el) {
      el.innerHTML = '<div class="card"><b>화면을 그리다 문제가 생겼어</b>' +
        '<div class="muted" style="margin:6px 0">' + esc(e.message) + "</div>" +
        '<button class="btn" id="err-reload" style="width:100%">새로고침</button></div>';
      const rb = document.getElementById("err-reload");
      if (rb) rb.onclick = () => location.reload();
    }
  }
}
function togetherBadge() {
  const latest = latestByMember();
  const pts = MEMBERS.map((m) => latest[m.id]).filter((c) => c && c.lat &&
    (Date.now() - new Date(c.created_at).getTime()) < 30 * 60000);
  const el = document.getElementById("together");
  if (!el) return;
  if (pts.length < 2) { el.hidden = true; return; }
  let far = 0;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++)
    far = Math.max(far, distKm(pts[i].lat, pts[i].lng, pts[j].lat, pts[j].lng));
  const near = far <= 0.3;
  el.textContent = near ? "● " + pts.length + "명 모임" : "● " + pts.length + "명 · " + Math.round(far) + "km 분산";
  el.className = "together" + (near ? "" : " split");
  el.hidden = false;
}

function rerender() {
  document.documentElement.style.setProperty("--accent", phase() === "during" ? dayTheme() : "#7C2E3E");
  $("#phase-label").textContent = phaseLabel();
  const chip = $("#me-chip");
  if (chip) { chip.hidden = !me; if (me) chip.innerHTML = av(me); }
  togetherBadge();
  const y = window.scrollY;
  renderTab(currentTab);
  window.scrollTo(0, y);
  checkRequests();
}

/* ---------------- 시작 ---------------- */
function boot() {
  if (isInApp() && showGate()) return;
  if (installRequired() && showInstallWall()) return;
  const th = localStorage.getItem("kel_theme");
  if (th) document.documentElement.setAttribute("data-theme", th);
  initSb();
  wireModals();
  $("#bell").onclick = openAlerts;
  wireSiren("#siren-fab");
  const mc = $("#me-chip"); if (mc) mc.onclick = openWho;
  $$("#tabbar .tb").forEach((b) => b.onclick = () => switchTab(b.dataset.tab));
  if (!me) openWho();
  else setTimeout(() => { if (sb && !charOf(me)) openRoll(); }, 900);
  loadAll();
  subscribe();
  loadAQ();
  flushQueue();
  showInstall();
  a2hsBar();

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
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    loadAll(); flushQueue();
    const wl = document.getElementById("wall");
    if (wl && !wl.hidden && !installRequired() && !document.body.classList.contains("walled-notif")) location.reload();
  });
  window.addEventListener("online", () => { loadAll(); flushQueue(); });

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", boot);
