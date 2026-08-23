/* 켈로나 여행수첩 — app.js */
"use strict";

/* ============================================================
   캐릭터 뽑기 — 100명 · 5등급
   t5 신화 0.3%(각 0.1%) · t4 전설 6% · t3 영웅 18% · t2 희귀 30% · t1 일반 45.7%
   이름 표기: last + 한글이름 + first
   fx = 무전 보낼 때 받는 사람 화면에 뜨는 시그니처 이펙트
   ============================================================ */
const TIERS = [
  { t: 1, name: "일반",  en: "COMMON",    p: 45.6, color: "#7E9A6F" },
  { t: 2, name: "희귀",  en: "RARE",      p: 30,   color: "#5B7FA8" },
  { t: 3, name: "영웅",  en: "EPIC",      p: 18,   color: "#8A6BA8" },
  { t: 4, name: "전설",  en: "LEGENDARY", p: 6,    color: "#C79A3E" },
  { t: 5, name: "신화",  en: "MYTHIC",    p: 0.4,  color: "#C8503C" },
  { t: 6, name: "초월",  en: "TRANSCENDENT", p: 0.1, color: "#8000A8" },
];
const MAX_ROLLS = 20;
const RESET_PW = "0909";   // 초기화 비밀번호
const BUILD = "2026-08-24 v35";
const BUILD_NO = 35;   // 숫자 버전 — 서버 min_version과 비교   // 폰이 최신인지 확인용
const PITY_AT = 12;   // 12번 굴려도 영웅 이상 없으면 13번째 확정

/* fx 프리셋: shape(도형) · motion(fall/rise/sweep/burst) · color */
const FX = {
  bolt:     { shape:"streak",motion:"burst", c:"#F2C744", n:22, special:"bolt", quake:true },
  youshallnot:{ shape:"streak",motion:"burst", c:"#EDE6D2", n:26, special:"youshallnot", quake:true },
  forcelift:{ shape:"star",  motion:"rise",  c:"#9FD48A", n:22, special:"forcelift" },
  goldengoal:{ shape:"streak",motion:"sweep", c:"#F2C744", n:26, special:"goldengoal", quake:true },
  darklord: { shape:"streak",motion:"burst", c:"#57E07A", n:34, special:"darklord", quake:true },
  greateye: { shape:"streak",motion:"sweep", c:"#FF7A2E", n:34, special:"greateye", quake:true },
  whitehand:{ shape:"star",  motion:"burst", c:"#EDEDED", n:28, special:"whitehand", quake:true },
  keynote:  { shape:"star",  motion:"rise",  c:"#E8E8ED", n:18, special:"keynote" },
  warn:     { shape:"warn",  motion:"fall",  c:"#C8503C", n:14 },
  ascend:   { shape:"star",  motion:"rise",  c:"#F5E08A", n:40, special:"ascend", quake:true },
  tsunami:  { shape:"grape", motion:"rise",  c:"#3E8FC4", n:26, special:"tsunami", quake:true },
  volcano:  { shape:"grape", motion:"rise",  c:"#E0562C", n:28, special:"volcano", quake:true },
  saiyan:   { shape:"streak",motion:"rise",  c:"#F5C542", n:30, special:"saiyan", quake:true },
  moon:     { shape:"star",  motion:"rise",  c:"#B9C7DE", n:18, special:"moon" },
  eyescan:  { shape:"ring",  motion:"burst", c:"#7FB2C8", n:12, special:"eyescan" },
  sandflood:{ shape:"grape", motion:"fall",  c:"#D9C08A", n:30, special:"sandflood" },
  starfall: { shape:"star",  motion:"fall",  c:"#9DBBE8", n:26, special:"starfall" },
  swarm:    { shape:"streak",motion:"sweep", c:"#5FA86B", n:24, special:"swarm" },
  sockrain: { shape:"leaf",  motion:"fall",  c:"#E0D2B8", n:24, special:"sockrain" },
  cupburst: { shape:"star",  motion:"burst", c:"#E3B457", n:24, special:"cupburst" },
  firebreath:{shape:"streak",motion:"sweep", c:"#FF6B2B", n:32, special:"firebreath", quake:true },
  arrowrain:{ shape:"streak",motion:"fall",  c:"#7FA86B", n:34, special:"arrowrain" },
  darkbolt: { shape:"streak",motion:"burst", c:"#8A5FD8", n:30, special:"darkbolt", quake:true },
  rocket:   { shape:"grape", motion:"rise",  c:"#E8E8ED", n:32, special:"rocket", quake:true },
  stage:    { shape:"star",  motion:"burst", c:"#E85FA8", n:34, special:"stage" },
  impact:   { shape:"ring",  motion:"burst", c:"#F2D04A", n:26, special:"impact", quake:true },
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
  /* ---------- 신화 0.1% × 7 ---------- */
  C("potter","Potter","Harry","⚡",4,"해리 포터","bolt"),
  C("voldemort","Riddle","Tom","💀",5,"볼드모트","skull"),
  C("riddle","Riddle","the Heir","🐍",6,"톰 리들 (계승자)","darklord"),
  C("sauron","Sauron","the Great Eye","👁️",6,"사우론","greateye"),
  C("saruman","Saruman","the Wise","🗼",5,"사루만","whitehand"),
  C("dumbledore","Dumbledore","Albus","🧙",5,"덤블도어","phoenix"),
  C("grey","Gandalf","the White","🤍",5,"간달프 (백색)","youshallnot"),
  /* ---------- 전설 1% × 6 ---------- */
  C("snape","Snape","Severus","🧪",5,"스네이프","patronus"),
  C("granger","Granger","Hermione","📚",4,"헤르미온느","book"),
  C("ron","Weasley","Ron","🍗",4,"론 위즐리","chess"),
  C("sirius","Black","Sirius","🐕",4,"시리우스","paw"),
  C("mcgonagall","McGonagall","Minerva","🐈",4,"맥고나걸","cat"),
  C("bellatrix","Lestrange","Bellatrix","🗡️",4,"벨라트릭스","curse"),
  C("galadriel","Galadriel","of Lórien","🌟",4,"갈라드리엘","starfall"),
  C("witchking","Witch-king","of Angmar","👑",4,"앙마르의 마술사왕","darkbolt"),
  C("grindelwald","Grindelwald","Gellert","🦇",5,"그린델왈드","darkbolt"),
  /* ---------- 영웅 18% ---------- */
  C("luna","Lovegood","Luna","🌙",3,"루나 러브굿","starfall"),
  C("draco","Malfoy","Draco","🐍",3,"드레이코","swarm"),
  C("hagrid","Hagrid","Rubeus","🗝️",3,"해그리드","volcano"),
  C("ginny","Weasley","Ginny","🦅",3,"지니","saiyan"),
  C("dobby","Dobby","the Elf","🧦",3,"도비","sockrain"),
  C("cedric","Diggory","Cedric","🏆",3,"세드릭","cupburst"),
  C("hedwig","Hedwig","the Owl","🦉",3,"헤드위그","tsunami"),
  C("lupin","Lupin","Remus","🐺",3,"리무스 루핀","moon"),
  C("tonks","Tonks","Nymphadora","💗",3,"톤크스","heart"),
  C("moody","Moody","Alastor","👁️",3,"매드아이 무디","eyescan"),
  C("elrond","Elrond","of Rivendell","💫",3,"엘론드","charm"),
  C("radagast","Radagast","the Brown","🐦",3,"라다가스트","bird"),
  C("slughorn","Slughorn","Horace","⏳",3,"슬러그혼","sandflood"),
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
  C("donotchoose","Do Not","Choose Me","🚫",1,"고르지 마라","warn"),
  C("nameless","The","Nameless","❓",1,"이름 없는 자","dust"),
  C("blankcard","Blank","Card","🕳️",1,"빈 칸","ghost"),
  C("joker","The","Joker","🃏",1,"조커","spark"),
  C("sealed","Sealed","Card","🔒",1,"봉인된 카드","charm"),
  C("unknownbox","Unknown","Box","📦",1,"미확인 상자","dust"),
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
  C("merman","Merperson","of the Lake","🧜",1,"인어","tsunami"),
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
  // 숨겨진 각성체 — 뽑기로는 안 나오고 '고르지 마라'를 확정했을 때만
  { id:"chosen", last:"The", first:"Chosen One", em:"🌟", t:5, ko:"선택받은 자", fx:"ascend", hidden:true },
];
const TRAP_POOL = ["donotchoose", "nameless", "blankcard", "joker", "sealed", "unknownbox"];
const TRAP_RATE = 23;   // % — 미끼 중 하나가 이 확률로 등장
/* 진짜 각성 카드는 서버(settings.trap_id)가 정한다.
   값이 없으면 reset_token을 해시해서 자동 결정 → 리셋할 때마다 정답이 바뀜 */
const TRAP_WARNS = {
  donotchoose: "⚠️ 확정하지 마시오",
  nameless:    "⚠️ 이름을 부르지 마시오",
  blankcard:   "⚠️ 비어 있음 · 확정 비권장",
  joker:       "⚠️ 무엇이 나올지 모름",
  sealed:      "⚠️ 봉인을 뜯지 마시오",
  unknownbox:  "⚠️ 열지 마시오",
};
function trapWarn(id) { return TRAP_WARNS[id] || "⚠️ 확정하지 마시오"; }
function trapId() {
  const fixed = setting("trap_id");
  if (fixed && TRAP_POOL.indexOf(fixed) >= 0) return fixed;
  const seed = String(setting("reset_token") || "seed");
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100000;
  return TRAP_POOL[h % TRAP_POOL.length];
}
function isTrap(id) { return TRAP_POOL.indexOf(id) >= 0; }



/* ============================================================
   무기 202종 — 등급 확률은 캐릭터와 동일
   for: 이 무기를 "원하는" 캐릭터들 (일치하면 각성)
   ============================================================ */
function W(id, ko, en, em, t, want) { return { id, ko, en, em, t, want }; }
const WEAPONS = [
  W("elderwand","딱총나무 지팡이","The Elder Wand","🪄",5,["potter","voldemort","dumbledore","grindelwald"]),
  W("resurrection","부활의 돌","Resurrection Stone","💎",5,["voldemort","dumbledore"]),
  W("truecloak","진짜 투명 망토","The True Cloak","🫥",5,["potter","sirius"]),
  W("voldywand","볼드모트의 지팡이","Voldemort's Wand","🦴",5,["voldemort","riddle"]),
  W("sauronmace","사우론의 철퇴","Mace of Sauron","🔨",5,["sauron","witchking"]),
  W("potterwand","해리의 지팡이","Harry's Wand","🪄",4,["potter"]),
  W("whitestaff","사루만의 지팡이","Staff of Saruman","🗼",4,["saruman"]),
  W("morgulblade","모르굴의 검","Morgul-blade","🔪",4,["witchking","sauron"]),
  W("nenya","네냐 (물의 반지)","Nenya","💧",4,["galadriel"]),
  W("vilya","빌랴 (바람의 반지)","Vilya","🌀",3,["elrond","galadriel"]),
  W("onering","절대 반지","The One Ring","💍",5,["gollum","sauron"]),
  W("timeturner_o","원본 시간 돌리개","Original Time-Turner","⏳",5,["granger","slughorn"]),
  W("basilisk","바실리스크 송곳니","Basilisk Fang","🦷",4,["potter","voldemort","ginny"]),
  W("gryffindorsword","그리핀도르의 검","Sword of Gryffindor","⚔️",4,["potter","neville"]),
  W("firebolt","파이어볼트","Firebolt","🧹",4,["potter","ginny","wood"]),
  W("marauder","도둑들의 지도","The Marauder's Map","🗺️",4,["potter","sirius","fred","george"]),
  W("pensieve","펜시브","Pensieve","🌀",4,["dumbledore","snape"]),
  W("phoenixfeather","불사조 깃털","Phoenix Feather","🪶",4,["dumbledore","hedwig"]),
  W("bellaknife","벨라트릭스의 단검","Bellatrix's Dagger","🗡️",4,["bellatrix"]),
  W("mirror","두 방향 거울","Two-Way Mirror","🪞",4,["sirius","potter"]),
  W("dragonhoard","스마우그의 보물","Smaug's Hoard","🪙",4,["smaug"]),
  W("elvenbow","요정의 활","Elven Bow","🏹",4,["legolas"]),
  W("staffgrey","회색의 지팡이","Staff of the Grey","🦯",4,["grey","dumbledore"]),
  W("chessqueen","마법사 체스 퀸","Wizard Chess Queen","♛",4,["ron","chess2"]),
  W("catglasses","맥고나걸의 안경","McGonagall's Spectacles","👓",4,["mcgonagall"]),
  W("darkmark","어둠의 표식","The Dark Mark","🐍",4,["voldemort","bellatrix","draco"]),
  W("nimbus2001","님부스 2001","Nimbus 2001","🧹",3,["draco","wood"]),
  W("timeturner","시간 돌리개","Time-Turner","⌛",3,["granger"]),
  W("sortinghat_w","분류 모자","Sorting Hat","🎩",3,["hat"]),
  W("invisibility","투명 망토","Invisibility Cloak","👻",3,["potter"]),
  W("luckpotion","펠릭스 펠리시스","Liquid Luck","🍀",3,["slughorn","potter"]),
  W("polyjuice","폴리주스 마법약","Polyjuice Potion","⚗️",3,["granger","snape"]),
  W("veritaserum","베리타세룸","Veritaserum","💧",3,["snape","moody"]),
  W("madeye","매드아이의 눈","Mad-Eye's Eye","👁️",3,["moody"]),
  W("snitch_w","황금 스니치","Golden Snitch","🟡",3,["potter","cedric","ginny"]),
  W("hedwigcage","헤드위그의 새장","Hedwig's Cage","🪺",3,["hedwig","potter"]),
  W("lunaspecs","스펙트라클스","Spectrespecs","🕶️",3,["luna"]),
  W("wolfsbane","늑대 삭이는 물약","Wolfsbane Potion","🌿",3,["lupin"]),
  W("hagridumbrella","해그리드의 우산","Hagrid's Umbrella","☂️",3,["hagrid"]),
  W("dobbysock","도비의 양말","Dobby's Sock","🧦",3,["dobby"]),
  W("triwizardcup","트리위저드 컵","Triwizard Cup","🏆",3,["cedric","potter"]),
  W("howler_w","하울러","Howler","📣",3,["molly","howler"]),
  W("weasleycar","하늘을 나는 포드","Flying Ford Anglia","🚙",3,["ron","arthur","flyingcar"]),
  W("scabbers_w","스캐버스의 발","Scabbers' Paw","🐀",3,["ron","scabbers"]),
  W("gilliweed","아가미풀","Gillyweed","🌱",3,["potter","neville"]),
  W("remembrall","리멤브럴","Remembrall","🔮",3,["neville"]),
  W("quaffle_w","쿼플","Quaffle","🔴",3,["ginny","katie","angelina"]),
  W("beaterbat","블러저 방망이","Beater's Bat","🏏",3,["fred","george"]),
  W("charmwand","플리트윅의 지휘봉","Flitwick's Baton","🪄",3,["flitwick"]),
  W("crystalball","트릴로니의 수정구","Crystal Ball","🔮",3,["trelawney","parvati"]),
  W("mandrake_w","만드레이크 화분","Mandrake Pot","🪴",3,["sprout","mandrake"]),
  W("firewhisky","파이어위스키","Firewhisky","🥃",3,["hagrid","sirius"]),
  W("nightbus","나이트 버스 티켓","Knight Bus Ticket","🎟️",3,["knightbus"]),
  W("expresstix","급행열차 티켓","Express Ticket","🚂",3,["express","platform"]),
  W("ledger_w","고블린 장부","Goblin Ledger","📒",3,["goblin"]),
  W("silverhand","은빛 손","Silver Hand","🤚",3,["scabbers","dobby"]),
  W("stdwand","표준 지팡이","Standard Wand","🪄",2,[]),
  W("owltreat","부엉이 간식","Owl Treat","🍪",2,[]),
  W("cauldron_w","솥단지","Cauldron","🍲",2,[]),
  W("quill_w","깃펜","Quill","🖋️",2,[]),
  W("inkpot","잉크병","Ink Pot","🫙",2,[]),
  W("parchment","양피지 뭉치","Parchment Roll","📜",2,[]),
  W("spellbook","주문서","Spellbook","📕",2,[]),
  W("potionkit","마법약 키트","Potion Kit","🧪",2,[]),
  W("brooms","학교 빗자루","School Broom","🧹",2,[]),
  W("gloves","용가죽 장갑","Dragonhide Gloves","🧤",2,[]),
  W("hourglass","기숙사 모래시계","House Hourglass","⏳",2,[]),
  W("scarf","기숙사 목도리","House Scarf","🧣",2,[]),
  W("tie_w","기숙사 넥타이","House Tie","👔",2,[]),
  W("badge","반장 배지","Prefect Badge","📛",2,[]),
  W("lantern","마법 등불","Wand-lit Lantern","🏮",2,[]),
  W("compass_w","마법 나침반","Enchanted Compass","🧭",2,[]),
  W("map_w","낡은 지도","Old Map","🗺️",2,[]),
  W("key_w","날개 달린 열쇠","Flying Key","🗝️",2,[]),
  W("mirror_s","작은 손거울","Hand Mirror","🪞",2,[]),
  W("chocolate","초콜릿 개구리","Chocolate Frog","🍫",2,[]),
  W("beans_w","버티봇 젤리","Bertie Bott's","🫘",2,[]),
  W("butterbeer_w","버터맥주","Butterbeer","🍺",2,[]),
  W("pumpkin_w","호박 주스","Pumpkin Juice","🎃",2,[]),
  W("cake_w","솥단지 케이크","Cauldron Cake","🧁",2,[]),
  W("liquorice_w","감초 지팡이","Liquorice Wand","🥢",2,[]),
  W("acidpop","애시드 팝","Acid Pop","🍬",2,[]),
  W("toadstool","독버섯","Toadstool","🍄",2,[]),
  W("feather_w","깃털","Feather","🪶",2,[]),
  W("candle","마법 양초","Floating Candle","🕯️",2,[]),
  W("bell","호그와트 종","Castle Bell","🔔",2,[]),
  W("chalk","분필","Chalk","🖍️",2,[]),
  W("abacus","산술 주판","Arithmancy Abacus","🧮",2,[]),
  W("telescope","천문 망원경","Telescope","🔭",2,[]),
  W("starchart","별자리표","Star Chart","🌌",2,[]),
  W("herbpot","약초 화분","Herb Pot","🪴",2,[]),
  W("wateringcan","물뿌리개","Watering Can","🚿",2,[]),
  W("shears","전지가위","Pruning Shears","✂️",2,[]),
  W("bucket","걸레와 양동이","Mop & Bucket","🪣",2,[]),
  W("broomcloset","빗자루 창고 열쇠","Broom Closet Key","🚪",2,[]),
  W("whistle","심판 호루라기","Referee Whistle","🪈",2,[]),
  W("goggles","퀴디치 고글","Quidditch Goggles","🥽",2,[]),
  W("kneepads","무릎 보호대","Knee Pads","🦵",2,[]),
  W("bandage","붕대","Bandage","🩹",2,[]),
  W("pepperup","페퍼업 물약","Pepperup Potion","🌶️",2,[]),
  W("skelegro","스켈레그로","Skele-Gro","🦴",2,[]),
  W("dungbomb","똥폭탄","Dungbomb","💣",2,[]),
  W("fanged","송곳니 프리스비","Fanged Frisbee","🥏",2,[]),
  W("extendable","늘어나는 귀","Extendable Ears","👂",2,[]),
  W("puking","토하는 사탕","Puking Pastille","🤢",2,[]),
  W("decoy","가짜 폭탄","Decoy Detonator","🧨",2,[]),
  W("noteboook","비밀 일기장","Secret Diary","📓",2,[]),
  W("stamp_w","부엉이 우표","Owl Stamp","📮",2,[]),
  W("scale","마법 저울","Brass Scales","⚖️",2,[]),
  W("goblet","불의 잔","Goblet","🏺",2,[]),
  W("ropes","마법 밧줄","Incarcerous Rope","🪢",2,[]),
  W("stick","그냥 나뭇가지","Just a Stick","🪵",1,[]),
  W("rock","돌멩이","Rock","🪨",1,[]),
  W("spoon","숟가락","Spoon","🥄",1,[]),
  W("fork","포크","Fork","🍴",1,[]),
  W("pan","프라이팬","Frying Pan","🍳",1,[]),
  W("pot","냄비","Pot","🫕",1,[]),
  W("mug","머그컵","Mug","☕",1,[]),
  W("straw","빨대","Straw","🥤",1,[]),
  W("napkin","냅킨","Napkin","🧻",1,[]),
  W("toothpick","이쑤시개","Toothpick","🦷",1,[]),
  W("sock_w","한 짝 양말","Odd Sock","🧦",1,[]),
  W("shoelace","신발끈","Shoelace","👟",1,[]),
  W("button","단추","Button","🔘",1,[]),
  W("paperclip","클립","Paperclip","📎",1,[]),
  W("rubber","고무줄","Rubber Band","🎗️",1,[]),
  W("pebble","조약돌","Pebble","🥌",1,[]),
  W("leaf_w","나뭇잎","Leaf","🍃",1,[]),
  W("acorn","도토리","Acorn","🌰",1,[]),
  W("pinecone","솔방울","Pine Cone","🌲",1,[]),
  W("shell","조개껍데기","Seashell","🐚",1,[]),
  W("bottle","빈 병","Empty Bottle","🍾",1,[]),
  W("cork","코르크","Cork","🍷",1,[]),
  W("can","찌그러진 캔","Dented Can","🥫",1,[]),
  W("box","빈 상자","Empty Box","📦",1,[]),
  W("bag","비닐봉지","Plastic Bag","🛍️",1,[]),
  W("receipt","영수증","Receipt","🧾",1,[]),
  W("coin_w","동전","Coin","🪙",1,[]),
  W("ticket","찢어진 티켓","Torn Ticket","🎫",1,[]),
  W("map_torn","찢어진 지도","Torn Map","🗺️",1,[]),
  W("pen","볼펜","Ballpoint Pen","🖊️",1,[]),
  W("eraser","지우개","Eraser","🩹",1,[]),
  W("ruler","자","Ruler","📏",1,[]),
  W("tape","테이프","Tape","🧻",1,[]),
  W("glue","풀","Glue Stick","🧴",1,[]),
  W("scissors","가위","Scissors","✂️",1,[]),
  W("stapler","스테이플러","Stapler","📎",1,[]),
  W("battery","방전된 배터리","Dead Battery","🔋",1,[]),
  W("cable","엉킨 케이블","Tangled Cable","🔌",1,[]),
  W("earbud","한쪽 이어폰","One Earbud","🎧",1,[]),
  W("charger","충전기","Charger","🔌",1,[]),
  W("umbrella","부러진 우산","Broken Umbrella","☂️",1,[]),
  W("hat_w","밀짚모자","Straw Hat","👒",1,[]),
  W("sunglass","선글라스","Sunglasses","🕶️",1,[]),
  W("towel","수건","Towel","🧺",1,[]),
  W("soap","비누","Soap","🧼",1,[]),
  W("brush","칫솔","Toothbrush","🪥",1,[]),
  W("comb","빗","Comb","💈",1,[]),
  W("mirror_c","깨진 손거울","Cracked Mirror","🪞",1,[]),
  W("candle_c","녹은 양초","Melted Candle","🕯️",1,[]),
  W("match","성냥","Matchstick","🔥",1,[]),
  W("lighter","라이터","Lighter","🔥",1,[]),
  W("flashlight","손전등","Flashlight","🔦",1,[]),
  W("rope_c","짧은 끈","Short Rope","🪢",1,[]),
  W("net","잠자리채","Net","🥅",1,[]),
  W("ball","테니스공","Tennis Ball","🎾",1,[]),
  W("dice","주사위","Dice","🎲",1,[]),
  W("card_c","트럼프 한 장","Playing Card","🃏",1,[]),
  W("marble","구슬","Marble","🔵",1,[]),
  W("yoyo","요요","Yo-yo","🪀",1,[]),
  W("balloon","풍선","Balloon","🎈",1,[]),
  W("whistle_c","호루라기","Whistle","🪈",1,[]),
  W("harmonica","하모니카","Harmonica","🎵",1,[]),
  W("triangle","트라이앵글","Triangle","🔺",1,[]),
  W("tambourine","탬버린","Tambourine","🪘",1,[]),
  W("banana","바나나","Banana","🍌",1,[]),
  W("apple_c","사과","Apple","🍎",1,[]),
  W("carrot","당근","Carrot","🥕",1,[]),
  W("corn","옥수수","Corn","🌽",1,[]),
  W("bread","식빵","Bread","🍞",1,[]),
  W("egg","계란","Egg","🥚",1,[]),
  W("cheese","치즈","Cheese","🧀",1,[]),
  W("sausage","소시지","Sausage","🌭",1,[]),
  W("pizza","식은 피자","Cold Pizza","🍕",1,[]),
  W("noodle","라면","Instant Noodle","🍜",1,[]),
  W("kimchi","김치","Kimchi","🥬",1,[]),
  W("chopsticks","나무젓가락","Chopsticks","🥢",1,[]),
  W("teabag","티백","Tea Bag","🫖",1,[]),
  W("sugar","각설탕","Sugar Cube","🧊",1,[]),
  W("ice","얼음","Ice","🧊",1,[]),
  W("snow","눈뭉치","Snowball","❄️",1,[]),
  W("sand","모래","Sand","🏖️",1,[]),
  W("mud","진흙","Mud","🟤",1,[]),
  W("dust_w","먼지 뭉치","Dust Bunny","🌫️",1,[]),
  W("cobweb","거미줄","Cobweb","🕸️",1,[]),
  W("worm","지렁이","Worm","🪱",1,[]),
  W("snail","달팽이","Snail","🐌",1,[]),
  W("frog","개구리","Frog","🐸",1,[]),
  W("pigeon","비둘기","Pigeon","🕊️",1,[]),
  W("pellet_w","부엉이 배설물","Owl Pellet","💩",1,[]),
  W("nothing","아무것도 없음","Nothing","🫙",1,[]),
  W("air","공기","Air","💨",1,[]),
  W("hope","희망","Hope","✨",1,[]),
  W("regret","후회","Regret","😔",1,[]),
  /* ---------- v33 신규 ---------- */
  W("palantir","팔란티어","The Palantir","🔮",5,["saruman","sauron"]),
  W("glamdring","글람드링","Glamdring","⚔️",4,["grey"]),
  W("gandalfworks","간달프의 폭죽","Gandalf's Fireworks","🎆",3,["grey"]),
  W("teamvest","팀 조끼","Team Bib","🦺",2,[]),
  W("foamcup","스티로폼 컵","Styrofoam Cup","🥤",1,[]),
  W("chopstick1","젓가락 한 짝","Single Chopstick","🥢",1,[]),
  W("wetwipe","물티슈 한 장","One Wet Wipe","🧻",1,[]),
];
const weaponById = Object.fromEntries(WEAPONS.map((w) => [w.id, w]));
const WTICKET_MAX = 12;
const WTICKET_MIN = 20;   // 분 — 이 간격마다 1장 충전

/* 무기 티켓 (캐릭터 뽑기와 별개) */
function wTickets() {
  const last = Number(localStorage.getItem("kel_wt_at") || 0);
  let n = Number(localStorage.getItem("kel_wt") || WTICKET_MAX);
  if (last) {
    const gained = Math.floor((Date.now() - last) / (WTICKET_MIN * 60000));
    if (gained > 0) { n = Math.min(WTICKET_MAX, n + gained); localStorage.setItem("kel_wt", String(n)); localStorage.setItem("kel_wt_at", String(Date.now())); }
  } else localStorage.setItem("kel_wt_at", String(Date.now()));
  return n;
}
function useTicket(k) {
  const n = wTickets();
  if (n < k) return false;
  localStorage.setItem("kel_wt", String(n - k));
  if (!localStorage.getItem("kel_wt_at")) localStorage.setItem("kel_wt_at", String(Date.now()));
  return true;
}
function addTicket(k) { localStorage.setItem("kel_wt", String(Math.min(WTICKET_MAX, wTickets() + k))); }
function nextTicketIn() {
  if (wTickets() >= WTICKET_MAX) return "";
  const last = Number(localStorage.getItem("kel_wt_at") || Date.now());
  const ms = WTICKET_MIN * 60000 - ((Date.now() - last) % (WTICKET_MIN * 60000));
  return Math.max(1, Math.ceil(ms / 60000)) + "분 후 +1";
}

/* 보유 무기 */
function myWeapons() { return (store.inventory || []).filter((r) => r.member === me); }
function ownedIds() { return myWeapons().map((r) => r.weapon_id); }
function wQty(id) { const r = myWeapons().find((x) => x.weapon_id === id); return r ? r.qty : 0; }
function equippedId() { const r = (store.characters || []).find((c) => c.member === me); return r ? r.weapon : null; }
function equippedOf(memberId) { const r = (store.characters || []).find((c) => c.member === memberId); return r ? r.weapon : null; }
function weaponOf(memberId) { const id = equippedOf(memberId); return id ? weaponById[id] : null; }
/* 각성 여부: 장착 무기가 내 캐릭터를 원하면 */
function isAwakened(memberId) {
  const w = weaponOf(memberId), c = charOf(memberId);
  if (!w || !c) return false;
  return (w.want || []).indexOf(c.id) >= 0;
}
function powerOf(memberId) {
  const w = weaponOf(memberId);
  if (!w) return 1;
  if (isAwakened(memberId)) return 3;
  return (w.want || []).length ? 1.5 : 1.3;
}
function drawWeapon(boost) {
  const weights = TIERS.map((t) => ({ t: t.t, p: boost && t.t >= 3 ? t.p * boost : t.p }));
  const total = weights.reduce((a, b) => a + b.p, 0);
  let roll = Math.random() * total, acc = 0, tier = 1;
  const order = weights.slice().sort((a, b) => a.p - b.p);
  for (const t of order) { acc += t.p; if (roll <= acc) { tier = t.t; break; } }
  let cands = WEAPONS.filter((w) => w.t === tier);
  for (let t = tier - 1; t >= 1 && !cands.length; t--) cands = WEAPONS.filter((w) => w.t === t);
  return cands[Math.floor(Math.random() * cands.length)];
}

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
const av = (id, cls) => {
  const w = weaponOf(id);
  return '<span class="av ' + (cls || "") + (id === me ? " self" : "") + (isAwakened(id) ? " awake" : "") +
    '" style="--rc:' + colorOf(id) + '">' + avatarOf(id) +
    (w ? '<i class="av-w">' + w.em + "</i>" : "") + "</span>";
};
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
/* 보낼 때 나도 내 시그니처를 본다 */
function selfFx(strong) {
  if (!me) return;
  const c = charOf(me);
  if (!c) return;
  const now = Date.now();
  if (!strong && now - (selfFx._t || 0) < 8000) return;   // 연타 방지
  selfFx._t = now;
  if (c.t >= 4) charFx(me, strong ? 3 : 2);
  else if (c.t === 3) edgeGlow(colorOf(me), false);
}

/* 캐릭터 시그니처 이펙트 */
function charFx(memberId, level) {
  const c = charOf(memberId);
  if (!c || !FX[c.fx]) return false;
  const f = FX[c.fx];
  const layer = document.getElementById("fx");
  if (!layer) return false;
  const calmFx = reduceMotion();
  const tierMul = c.t >= 5 ? 2.4 : c.t >= 4 ? 1.7 : 1;
  const base = c.t >= 5 ? Math.max(f.n || 10, 34) : (f.n || 10);
  const pw = powerOf(memberId);
  const n = Math.round(base * (level >= 3 ? 1.6 : level >= 2 ? 1 : 0.6) * tierMul * pw * (calmFx ? 0.35 : 1));
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
  if (f.quake && !calmFx) { document.body.classList.add("quake"); setTimeout(() => document.body.classList.remove("quake"), 1100); }
  if (c.t >= 3) edgeGlow(f.c || colorOf(memberId), c.t >= 4);
  if (f.special) specialFx(f.special, f.c, isAwakened(memberId) ? 6 : c.t, memberId);
  if (typeof FX2C === "function") FX2C(c);
  if (typeof FX2C === "function" && c.t >= 5) FX2C(c);
  else { const o = document.getElementById("sfx"); if (o) { o.hidden = true; o.innerHTML = ""; o.className = ""; o.style.display = "none"; } }
  return true;
}
function specialFx(kind, color, tier, memberId) {
  const o = document.getElementById("sfx");
  if (!o) return;
  const T = {
    bolt:     { wash:"#F2C744", glyph:"⚡", cls:"w-bolt" },
    skull:    { wash:"#2E9650", glyph:"💀", cls:"w-skull" },
    phoenix:  { wash:"#E8B54A", glyph:"🔥", cls:"w-phoenix" },
    patronus: { wash:"#8FD4F0", glyph:"🦌", cls:"w-patronus" },
    book:     { wash:"#C9A87C", glyph:"📖", cls:"w-book" },
    chess:    { wash:"#5A5A5A", glyph:"♜", cls:"w-chess" },
    dog:      { wash:"#3A3A44", glyph:"🐾", cls:"w-dog" },
    cat:      { wash:"#C7B26A", glyph:"🐈‍⬛", cls:"w-cat" },
    curse:    { wash:"#D8453C", glyph:"🗡️", cls:"w-curse" },
    keynote:  { wash:"#101014", glyph:"🍎", cls:"w-keynote" },
    tsunami:  { wash:"#2E7FB8", glyph:"🌊", cls:"w-tsunami" },
    volcano:  { wash:"#E0562C", glyph:"🌋", cls:"w-volcano" },
    saiyan:   { wash:"#F5C542", glyph:"💥", cls:"w-saiyan" },
    moon:     { wash:"#8FA4C4", glyph:"🌕", cls:"w-moon" },
    eyescan:  { wash:"#5F93AC", glyph:"👁️", cls:"w-eye" },
    sandflood:{ wash:"#C9A961", glyph:"⏳", cls:"w-sand" },
    starfall: { wash:"#6C8CC4", glyph:"✨", cls:"w-starfall" },
    swarm:    { wash:"#3E8054", glyph:"🐍", cls:"w-swarm" },
    sockrain: { wash:"#B8A88C", glyph:"🧦", cls:"w-sock" },
    cupburst: { wash:"#D9A441", glyph:"🏆", cls:"w-cup" },
    firebreath:{wash:"#FF6B2B", glyph:"🐉", cls:"w-fire" },
    arrowrain:{ wash:"#6E9660", glyph:"🏹", cls:"w-arrow" },
    darkbolt: { wash:"#7A4FC4", glyph:"🦇", cls:"w-dark" },
    rocket:   { wash:"#5A6478", glyph:"🚀", cls:"w-rocket" },
    stage:    { wash:"#D9418F", glyph:"🎤", cls:"w-stage" },
    impact:   { wash:"#E0B520", glyph:"🥋", cls:"w-impact" },
    ascend:   { wash:"#F5E08A", glyph:"🌟", cls:"w-ascend" },
    youshallnot:{ wash:"#CFC8B4", glyph:"🧙‍♂️", cls:"w-ysn" },
    forcelift:{ wash:"#6FA85C", glyph:"🐸", cls:"w-force" },
    goldengoal:{ wash:"#0F5132", glyph:"⚽", cls:"w-goal" },
    darklord: { wash:"#12291A", glyph:"🐍", cls:"w-skull" },
    greateye: { wash:"#3A0E00", glyph:"👁️", cls:"w-eye" },
    whitehand:{ wash:"#D8D8D8", glyph:"🗼", cls:"w-chess" },
    darklord: { wash:"#12301C", glyph:"🐍", cls:"w-skull" },
    greateye: { wash:"#3A0E00", glyph:"👁️", cls:"w-eye" },
    whitehand:{ wash:"#D8D8D8", glyph:"🗼", cls:"w-chess" },
  }[kind];
  if (!T) return;

  let extra = "";
  if (kind === "bolt")
    extra = boltSvg("", 190, 620) + boltSvg("b2", 140, 470) + boltSvg("b3", 120, 400) + '<div class="sfx-white"></div>';
  if (kind === "skull")
    extra = '<div class="sfx-dark"></div><div class="sfx-smoke"></div><div class="sfx-eyes"><i></i><i></i></div>';
  if (kind === "phoenix")
    extra = '<div class="sfx-rays"></div><div class="sfx-phoenix">🦅</div>';
  if (kind === "patronus")
    extra = '<div class="sfx-patronus"></div><div class="sfx-patronus" style="top:58%;animation-delay:.3s;width:150px"></div>';
  if (kind === "book")
    extra = '<span class="sfx-page p1">📄</span><span class="sfx-page p2">📄</span><span class="sfx-page p3">📄</span>';
  if (kind === "chess")
    extra = '<div class="sfx-crack"></div>';
  if (kind === "dog")
    extra = '<div class="sfx-dog">🐕‍🦺</div><span class="sfx-paw w1">🐾</span><span class="sfx-paw w2">🐾</span><span class="sfx-paw w3">🐾</span>';
  if (kind === "cat")
    extra = '<div class="sfx-cateyes"><i></i><i></i></div><div class="sfx-catring"></div>';
  if (kind === "curse")
    extra = '<div class="sfx-curse c1"></div><div class="sfx-curse c2"></div><div class="sfx-curse c3"></div>' +
            '<div class="sfx-curse c4"></div><div class="sfx-redflash"></div><div class="sfx-slash"></div>';
  if (kind === "keynote")
    extra = '<div class="sfx-black"></div><div class="sfx-spot"></div>' +
            '<div class="sfx-keytext">One more thing...</div>';
  if (kind === "tsunami")
    extra = '<div class="sfx-wave w1"></div><div class="sfx-wave w2"></div><div class="sfx-wave w3"></div><div class="sfx-foam"></div>';
  if (kind === "volcano")
    extra = '<div class="sfx-lava"></div><div class="sfx-ember e1"></div><div class="sfx-ember e2"></div>' +
            '<div class="sfx-ember e3"></div><div class="sfx-ember e4"></div><div class="sfx-ember e5"></div><div class="sfx-redflash"></div>';
  if (kind === "saiyan")
    extra = '<div class="sfx-aura"></div><div class="sfx-pillar"></div><div class="sfx-spark s1"></div>' +
            '<div class="sfx-spark s2"></div><div class="sfx-spark s3"></div><div class="sfx-white"></div>';
  if (kind === "moon")
    extra = '<div class="sfx-moonrise">🌕</div><div class="sfx-howl">🐺</div>';
  if (kind === "eyescan")
    extra = '<div class="sfx-scanline"></div><div class="sfx-scanline s2"></div>';
  if (kind === "sandflood")
    extra = '<div class="sfx-sandwall"></div>';
  if (kind === "starfall")
    extra = '<div class="sfx-comet c1"></div><div class="sfx-comet c2"></div><div class="sfx-comet c3"></div>';
  if (kind === "swarm")
    extra = '<div class="sfx-snake s1">🐍</div><div class="sfx-snake s2">🐍</div><div class="sfx-snake s3">🐍</div>';
  if (kind === "sockrain")
    extra = '<div class="sfx-sock k1">🧦</div><div class="sfx-sock k2">🧦</div><div class="sfx-sock k3">🧦</div>';
  if (kind === "cupburst")
    extra = '<div class="sfx-goldburst"></div>';
  if (kind === "firebreath")
    extra = '<div class="sfx-breath"></div><div class="sfx-scorch"></div><div class="sfx-redflash"></div>';
  if (kind === "arrowrain")
    extra = '<div class="sfx-arrow a1"></div><div class="sfx-arrow a2"></div><div class="sfx-arrow a3"></div>' +
            '<div class="sfx-arrow a4"></div><div class="sfx-arrow a5"></div><div class="sfx-arrow a6"></div>';
  if (kind === "darkbolt")
    extra = '<div class="sfx-dark"></div><div class="sfx-vbolt v1"></div><div class="sfx-vbolt v2"></div><div class="sfx-vbolt v3"></div>';
  if (kind === "rocket")
    extra = '<div class="sfx-rocket">🚀</div><div class="sfx-plume"></div><div class="sfx-white"></div>';
  if (kind === "stage")
    extra = '<div class="sfx-beamL"></div><div class="sfx-beamR"></div><div class="sfx-crowd"></div>';
  if (kind === "impact")
    extra = '<div class="sfx-hit"></div><div class="sfx-crackline c1"></div><div class="sfx-crackline c2"></div>';
  if (kind === "ascend")
    extra = '<div class="sfx-white"></div><div class="sfx-ascendbeam"></div><div class="sfx-halo2"></div>' +
            '<div class="sfx-featherup f1">🪶</div><div class="sfx-featherup f2">🪶</div><div class="sfx-featherup f3">🪶</div>';
  if (kind === "youshallnot") {
    extra = '<div class="sfx-white"></div><div class="sfx-ysncrack"></div><div class="sfx-ysnwall"></div>' +
            '<div class="sfx-ysnstamp">지나갈 수 없다</div>';
  }
  if (kind === "forcelift") {
    extra = '<div class="sfx-forcering r1"></div><div class="sfx-forcering r2"></div><div class="sfx-forcering r3"></div>';
    document.body.classList.add("forcelift");
    setTimeout(() => document.body.classList.remove("forcelift"), 2600);
  }
  if (kind === "goldengoal") {
    extra = '<div class="sfx-pitch"></div><div class="sfx-net"></div><div class="sfx-ball">⚽</div>' +
            '<div class="sfx-goalstamp">GOAL</div><div class="sfx-white"></div>';
    document.body.classList.add("slowmo");
    setTimeout(() => document.body.classList.remove("slowmo"), 2400);
  }

  o.className = T.cls;
  o.removeAttribute("hidden");
  o.style.cssText = "position:fixed;inset:0;z-index:206;pointer-events:none;overflow:hidden;opacity:1;visibility:visible;display:block";
  o.style.setProperty("--sc", T.wash);
  const grand = tier >= 4
    ? '<div class="sfx-flash2"></div><div class="sfx-ring2"></div><div class="sfx-ring2 r2"></div><div class="sfx-ring2 r3"></div>' +
      '<div class="sfx-speed"></div><div class="sfx-grade"></div><div class="sfx-zoom"></div>' +
      '<div class="sfx-shard s1"></div><div class="sfx-shard s2"></div><div class="sfx-shard s3"></div><div class="sfx-shard s4"></div>'
    : "";
  const wp = memberId ? weaponOf(memberId) : null;
  const awake = tier >= 6;
  const awakeLayer = awake
    ? '<div class="sfx-awaken"></div><div class="sfx-wglyph">' + (wp ? wp.em : "⚔️") + "</div>" +
      '<div class="sfx-mythbar awk">AWAKENED · ' + (wp ? esc(wp.ko) : "") + "</div>" +
      '<div class="sfx-ripple"></div><div class="sfx-ripple r2"></div><div class="sfx-ripple r3"></div>'
    : "";
  const myth = tier >= 5
    ? '<div class="sfx-vignette"></div>' + (awake ? "" : '<div class="sfx-mythbar">MYTHIC · 0.1%</div>') +
      '<div class="sfx-orbit"><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
      '<div class="sfx-godray"></div><div class="sfx-shockdisc"></div><div class="sfx-crackscreen"></div>'
    : "";
  o.innerHTML =
    '<div class="sfx-wash"></div>' +
    '<div class="sfx-rings"><i></i><i></i><i></i></div>' +
    grand + extra + myth + awakeLayer +
    '<div class="sfx-big' + (awake ? " awk" : tier >= 5 ? " myth" : tier >= 4 ? " grand" : "") + '">' + T.glyph + "</div>";
  o.hidden = false;

  if (!reduceMotion()) {
    document.body.classList.add("sfx-shake");
    setTimeout(() => document.body.classList.remove("sfx-shake"), 1800);
  }
  clearTimeout(specialFx._t);
  specialFx._t = setTimeout(() => { o.style.display = "none"; o.hidden = true; o.innerHTML = ""; o.className = ""; }, tier >= 5 ? 5600 : 4600);
}
function boltSvg(cls, w, h) {
  return '<svg class="sfx-bolt ' + cls + '" viewBox="0 0 120 400" width="' + w + '" height="' + h +
    '" preserveAspectRatio="none"><path d="M70,0 L40,170 L74,160 L34,400" fill="none" stroke="#F7E27A" stroke-width="11" stroke-linejoin="round" stroke-linecap="round"/>' +
    '<path d="M70,0 L40,170 L74,160 L34,400" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/></svg>';
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
  wineRatings: [], reactions: [], characters: [], inventory: [],
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
    const [it, po, vo, ex, ch, wi, wl, sh, wr, rx, ca, iv, se] = await Promise.all([
      sb.from("itinerary").select("*").order("day").order("sort"),
      sb.from("polls").select("*").order("created_at", { ascending: false }),
      sb.from("votes").select("*"),
      sb.from("expenses").select("*").order("created_at", { ascending: false }),
      sb.from("checkins").select("*").order("created_at", { ascending: false }).limit(150),
      sb.from("wishes").select("*").order("created_at"),
      sb.from("wish_likes").select("*"),
      sb.from("shopping").select("*").order("created_at"),
      sb.from("wine_ratings").select("*").order("created_at", { ascending: false }),
      sb.from("reactions").select("*"),
      sb.from("characters").select("*"),
      sb.from("inventory").select("*"),
      sb.from("settings").select("*"),
    ]);
    const bad = [it, po, vo, ex, ch, wi, wl, sh, wr, rx, ca, iv, se].find((r) => r.error);
    if (bad) throw bad.error;
    store.itinerary = it.data; store.polls = po.data; store.votes = vo.data;
    store.expenses = ex.data; store.checkins = ch.data;
    store.wishes = wi.data; store.wishLikes = wl.data; store.shopping = sh.data;
    store.wineRatings = wr.data; store.reactions = rx.data; store.characters = ca.data || []; store.inventory = iv.data || [];
    store.settings = Object.fromEntries(se.data.map((r) => [r.key, r.value]));
    store.loadedAt = Date.now();
    localStorage.setItem("kel_mirror", JSON.stringify(store));
    $("#offline-banner").hidden = true;
  } catch (e) {
    console.error(e);
    restoreMirror(false);
  }
  if (checkVersionGate()) return;
  applyGrants();
  checkNews();
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
  ["checkins", "expenses", "polls", "votes", "itinerary", "wishes", "wish_likes", "shopping", "wine_ratings", "reactions", "sirens", "settings", "characters", "inventory"].forEach((t) => {
    ch.on("postgres_changes", { event: "*", schema: "public", table: t }, (p) => onLive(t, p));
  });
  ch.subscribe();
}

function onLive(table, payload) {
  scheduleLoad();
  if (payload.eventType !== "INSERT") return;
  const r = payload.new || {};
  if (table === "sirens") { emergency(r.note || null); return; }
  if (table === "reactions" || table === "characters" || table === "inventory") return;
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
    if (r.spell) try { FX2.cast(r.spell, { quick: true, lv: typeof spellLvOf === "function" ? spellLvOf(actor, r.spell) : 1 }); } catch (e) {}
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
    if (ok) { toast("🧭 전원 홈에 띄웠어: " + d.n); selfFx(true); sendPush("🧭 다음 목적지", nameOf(me) + ": 우리 다 같이 → " + d.n, "dest"); switchTab("home"); }
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
  html += kelHubHtml();

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
    '<div class="shop-add" id="text-row" hidden><input class="input" id="radio-text" placeholder="짧게 한 마디 (신호 없으면 자동 대기)"><button class="btn" id="radio-send">📨</button></div>' + spellChipRow();

  html += '<h2 class="sec">교신 — 카드 탭하면 위치 요청</h2><div class="board">';
  for (const m of MEMBERS) {
    const c = latest[m.id];
    html += '<div class="board-card" data-mid="' + m.id + '"><div class="board-name">' + av(m.id, "mini") + esc(m.name) + (m.id !== me ? '<span class="board-req">📍</span>' : "") + (m.id !== me && charOf(me) && charOf(m.id) ? '<span class="board-duel" data-duel="' + m.id + '">⚔️</span>' : "") + "</div>" +
      (c ? '<div class="board-place">' + esc(c.place) + (c.audio ? ' <button class="play-btn" data-audio="' + esc(c.audio) + '">▶️</button>' : "") + '</div><div class="board-when">' + relTime(c.created_at) + (c.lat ? " · 📍" : "") + "</div>" +
        (c.note ? '<div class="board-note">' + esc(c.note) + "</div>" : "")
        : '<div class="board-when">아직 소식 없음</div>') +
      "</div>";
  }
  html += "</div>";

  html += marauderCardHtml();

  const hideFeed = localStorage.getItem("kel_hidefeed") === "1";
  if (!hideFeed) {
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
  }

  html += '<h2 class="sec">긴급</h2><div class="card" style="text-align:center">' +
    '<div class="siren-wrap"><button class="siren-btn" id="siren-btn"><span class="siren-ic">🚽</span><span>화장실 긴급</span></button>' +
    '<p class="muted" id="siren-hint" style="margin:10px 0 0">익명 · 10분에 1번 · 두 번 눌러야 발사 (전원 폰에 사이렌)</p></div></div>';

  el.innerHTML = html;
  bindMarauder();
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
    if (r === true) { toast("📻 전송: " + q); selfFx(); sendPush(nameOf(me), q, "radio"); loadAll(); }
  });

  $$(".board-card", el).forEach((bc) => bc.onclick = async (ev) => {
    if (ev.target.closest(".play-btn") || ev.target.closest(".board-duel")) return;
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
    const res = await qInsert("checkins", { member: me, place: "💬", note: v, lat: null, lng: null, spell: window.KSEL || null });
    if (window.KSEL) FX2.cast(window.KSEL);
    rt.value = "";
    if (res === true) { selfFx(); sendPush(nameOf(me), v, "radio"); loadAll(); }
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
      audio: pub.data.publicUrl, spell: window.KSEL || null,
    });
    if (ins.error) throw ins.error;
    beep(); stampFx("📻 음성 교신");
    selfFx(true);
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

  html += '<details class="arch"><summary>🗄️ 여행 아카이브 — 켈로나 2026.08</summary>';
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
  html += liarCardHtml();
  html += '<h2 class="sec">같이 한 것</h2>' + archMissionsHtml();
  html += '</details>';

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
    '<div class="kv"><b>나</b><span class="code-line">' + (me ? av(me) + " <b>" + esc(nameOf(me)) + "</b>" : '<span class="muted">미선택</span>') +
    '<button class="btn ghost small" id="who-change">다른 사람으로</button></span></div>' +
    '<div class="kv"><b>내 캐릭터</b><span class="code-line">' + (me && charOf(me) ? av(me) + " <b>" + esc(fullName(me)) + '</b> <span class="muted" style="font-size:12px">' + esc(tierById[tierOf(me)].name) + "</span>" : '<span class="muted">아직 없음</span>') +
    '<button class="btn ghost small" id="open-odds">확률표</button>' +
    (charOf(me) ? '<button class="btn ghost small" id="fx-demo">내 이펙트</button>' : "") +
    '<button class="btn ghost small" id="pack-demo">뽑기 연출 테스트</button>' +
    '<button class="btn ghost small" id="diag">연출 진단</button></span></div>' +
    '<div class="kv"><b>⚔️ 무기</b><span class="code-line">' +
    (weaponOf(me) ? weaponOf(me).em + " <b>" + esc(weaponOf(me).ko) + "</b>" + (isAwakened(me) ? ' <span style="color:var(--gold);font-weight:800">⚡각성</span>' : "") : '<span class="muted">미장착</span>') +
    ' <span class="muted" style="font-size:12px">🎟️' + wTickets() + "</span>" +
    '<button class="btn ghost small" id="armory-btn">무기고</button>' +
    '<button class="btn ghost small" id="wdraw-btn">뽑기</button></span></div>' +
    '<div class="kv"><b>📜 주문</b><span class="code-line"><span class="muted" style="font-size:12px">Lv.' + lvOf(me) + ' · ' + myBook().length + '개 · 📜' + sTickets() + '</span>' +
    '<button class="btn ghost small" id="book-btn">주문서</button>' +
    '<button class="btn ghost small" id="rank-btn">전적</button></span></div>' +
    '<div class="kv"><b>교신 기록</b><span class="code-line">' +
    (localStorage.getItem("kel_hidefeed") === "1" ? '<span class="muted">숨김</span>' : '<b style="color:var(--pine)">표시 중</b>') +
    '<button class="btn ghost small" id="feed-toggle">' + (localStorage.getItem("kel_hidefeed") === "1" ? "다시 보기" : "숨기기") + "</button></span></div>" +
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

  const rank = MEMBERS.map((m) => {
    const owned = (store.inventory || []).filter((r) => r.member === m.id).length;
    return { m, c: charOf(m.id), owned, awake: isAwakened(m.id), w: weaponOf(m.id) };
  }).sort((a, b) => b.owned - a.owned || (b.c ? b.c.t : 0) - (a.c ? a.c.t : 0));
  html += '<h2 class="sec">컬렉션 랭킹</h2><div class="card" style="padding:4px 18px">';
  rank.forEach((x, i) => {
    const pct = Math.round(x.owned / WEAPONS.length * 100);
    html += '<div class="rowline"><span class="rk-no">' + (i + 1) + "</span>" + av(x.m.id) +
      '<div style="min-width:0"><div style="font-weight:700;font-size:14px">' + esc(x.m.name) +
      (x.awake ? ' <span style="color:var(--gold);font-size:11px">⚡각성</span>' : "") + "</div>" +
      '<div class="muted" style="font-size:12px;margin-top:2px">' + (x.c ? x.c.em + " " + esc(x.c.ko) : "미정") +
      (x.w ? " · " + x.w.em + " " + esc(x.w.ko) : "") + "</div></div>" +
      '<div style="margin-left:auto;text-align:right"><div style="font-weight:800;font-size:15px">' + x.owned + "</div>" +
      '<div class="muted" style="font-size:11px">' + pct + "%</div></div></div>";
  });
  html += "</div>";

  const hall = MEMBERS.map((m) => ({ m, c: charOf(m.id) })).filter((x) => x.c).sort((a, b) => b.c.t - a.c.t);
  if (false) {
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
    (fateCount() ? '<div class="muted" style="font-size:11px;margin-top:2px">지금까지 ' + fateCount() + "번 거슬렀음" +
      (myTitle() ? ' · <b style="color:var(--gold)">' + myTitle().em + " " + myTitle().t + "</b>" : "") +
      (coupons() > 0 ? ' · 🎟️' + coupons() : "") + "</div>" : "") + "</div>" +
    '<div style="margin-left:auto;text-align:right"><div class="fate-price">$10.99</div>' +
    '<div class="muted" style="font-size:11px">사실 공짜</div></div></div>' +
    '<div class="btn-row" style="margin-top:12px;gap:8px">' +
    '<button class="btn ghost" id="quiz-btn" style="flex:1">🧠 퀴즈 만점 = 확률 2배</button>' +
    '</div>' +
    '<button class="btn" id="fate-btn" style="width:100%;margin-top:8px">$10.99 결제 (가짜)</button>' +
    '<div class="shop">' +
      '<button class="shop-item' + (canBuy100() ? "" : " off") + '" id="buy100">' +
        '<span class="shop-price">$100</span>' +
        '<span class="shop-t">프리미엄 팩</span>' +
        '<span class="shop-d">종류 선택 · 5장 · 확률 3배 · 하루 ' + P100_PER_DAY + "번</span>" +
        '<span class="shop-s">' + (extraPrem() > 0 ? "🎁 보유 " + extraPrem() + "장 · " : "") +
          "오늘 " + used100Today() + "/" + P100_PER_DAY +
          (used100Today() < P100_PER_DAY ? " · 구매 가능" : (extraPrem() > 0 ? " · 선물로 가능" : " · 내일 다시")) + "</span></button>" +
      '<button class="shop-item ultra' + (canBuy1000() ? "" : " off") + '" id="buy1000">' +
        '<span class="shop-price">$1,000</span>' +
        '<span class="shop-t">울트라 팩</span>' +
        '<span class="shop-d">카드 3장 · 확률 10배 · 평생 1번</span>' +
        '<span class="shop-s">' + (extraUltra() > 0 ? "🎁 보유 " + extraUltra() + "장 · " : "") +
          (!localStorage.getItem("kel_p1000") ? "평생 1회 남음" : (extraUltra() > 0 ? "기본분 사용함" : "이미 사용함")) + "</span></button>" +
    "</div>" +
    '<p class="muted" style="font-size:11.5px;margin:9px 0 0;text-align:center">퀴즈 무제한 · 광고 ' + (MAX_ADS - adsWatched()) + '회 남음</p></div>';

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
  const wc = $("#who-change"); if (wc) wc.onclick = openWho;
  const oo = $("#open-odds"); if (oo) oo.onclick = openOdds;
  const fu = $("#force-update");
  if (fu) fu.onclick = hardUpdate;
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
  const ar = $("#armory-btn"); if (ar) ar.onclick = openArmory;
  const wd = $("#wdraw-btn"); if (wd) wd.onclick = openWeapon;
  const fd = $("#fx-demo"); if (fd) fd.onclick = () => { charFx(me, 3); showRibbon(charOf(me).ko + "의 시그니처", colorOf(me)); };
  const ft = $("#feed-toggle");
  if (ft) ft.onclick = () => {
    const now = localStorage.getItem("kel_hidefeed") === "1";
    localStorage.setItem("kel_hidefeed", now ? "0" : "1");
    toast(now ? "교신 기록 다시 표시" : "교신 기록 숨김");
    rerender();
  };
  const dg = $("#diag");
  if (dg) dg.onclick = () => {
    const L = [];
    const pack = document.getElementById("pack"), sfx = document.getElementById("sfx"), fx = document.getElementById("fx");
    L.push("빌드: " + BUILD);
    L.push("설치됨: " + (isStandalone() ? "예" : "아니오"));
    L.push("동작줄이기: " + (reduceMotion() ? "켜짐 ⚠️" : "꺼짐"));
    L.push("애니메이션 지원: " + (typeof document.body.animate === "function" ? "예" : "아니오"));
    L.push("요소 pack/sfx/fx: " + (pack ? "O" : "X") + "/" + (sfx ? "O" : "X") + "/" + (fx ? "O" : "X"));
    L.push("HTML 신선도: " + (document.querySelector('meta[name="build"]') ? "최신" : "옛 캐시(자동보정됨)"));
    if (pack) {
      pack.removeAttribute("hidden");
      pack.style.cssText = "display:flex;position:fixed;inset:0;z-index:600;opacity:1;background:#111";
      const cs = getComputedStyle(pack);
      L.push("pack 계산값 → display:" + cs.display + " opacity:" + cs.opacity + " z:" + cs.zIndex);
      const em = document.getElementById("p-em");
      if (em) { const es = getComputedStyle(em); L.push("이모지 → opacity:" + es.opacity + " size:" + es.fontSize + " 내용:" + (em.textContent || "(빈칸)")); }
      setTimeout(() => { pack.style.display = "none"; pack.hidden = true; }, 900);
    }
    L.push("화면: " + window.innerWidth + "x" + window.innerHeight);
    L.push("UA: " + navigator.userAgent.slice(0, 70));
    alert(L.join("\n"));
  };
  const pd = $("#pack-demo");
  if (pd) pd.onclick = () => { const pick = ROSTER[Math.floor(Math.random() * ROSTER.length)]; openPack(pick, () => toast(pick.em + " " + pick.ko + " — 연출 끝")); };
  const fb = $("#fate-btn"); if (fb) fb.onclick = () => {
    localStorage.setItem("kel_rolls", "0");
    localStorage.setItem("kel_fate", String(fateCount() + 1));
    const n = fateCount();
    sendPush("💸 " + nameOf(me) + "의 과금", "운명 거스르기 " + n + "회째… 그만해", "fate");
    qInsert("checkins", { member: me, place: "💸 운명 거스르기 " + n + "회째", note: null, lat: null, lng: null });
    checkTitleUnlock();
    rollResult = drawCharacter();
    toast("💸 결제 완료(가짜). 20번 새로 받았어");
    setTimeout(openRoll, myTitle() && localStorage.getItem("kel_title_seen") === String(myTitle().n) ? 300 : 0);
  };
  const b100 = $("#buy100");
  if (b100) b100.onclick = () => {
    if (!canBuy100()) return toast("오늘 " + P100_PER_DAY + "번 다 썼어. 내일 다시");
    openPackChoose(100);
  };
  const b1000 = $("#buy1000");
  if (b1000) b1000.onclick = () => openPackChoose(1000);
  const bkb = $("#book-btn"); if (bkb) bkb.onclick = openSpellbook;
  const rkb = $("#rank-btn"); if (rkb) rkb.onclick = openRank;
  const qb = $("#quiz-btn");
  if (qb) qb.onclick = () => showQuiz(() => { rollResult = drawCharacter(); openRoll(); });
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

/* ---------- 강제 업데이트 (캐시·SW·HTTP캐시 전부) ---------- */
let appLocked = false;
function navTo(u) { location.replace(u); }
async function hardUpdate() {
  const btns = document.querySelectorAll("#vw-go,#force-update");
  btns.forEach((b) => { b.disabled = true; b.textContent = "갱신 중… 잠시만"; });
  toast("갱신 중… 화면이 한 번 새로고침돼");
  const stamp = Date.now();
  // 1) 서비스워커 캐시
  try {
    if ("caches" in window) { const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k))); }
  } catch (e) {}
  // 2) 서비스워커 등록 해제
  try {
    if (navigator.serviceWorker) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch (e) {}
  // 2-b) 대기 중인 새 서비스워커가 있으면 즉시 활성화
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.controller)
      navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
  } catch (e) {}
  // 3) 브라우저 HTTP 캐시까지 강제로 새로 받기 (이게 없으면 옛 app.js가 그대로 옴)
  try {
    await Promise.all(["app.js", "style.css", "config.js", "index.html", "sw.js"].map((f) =>
      fetch(f + "?bust=" + stamp, { cache: "reload" }).catch(() => {})));
  } catch (e) {}
  // 4) 주소에 표식을 붙여 재진입 (index.html을 명시해 확실히 새로 받음)
  const base = location.pathname.replace(/[^/]*$/, "");
  navTo(base + "index.html?v=" + stamp);
  // 혹시 이동이 막히면 수동 안내
  setTimeout(() => {
    btns.forEach((b) => { b.disabled = false; b.textContent = "다시 시도"; });
    alert("자동 갱신이 막혔어.\n\n1) 이 화면을 닫고\n2) 앱을 완전히 종료(위로 쓸어올리기)한 뒤\n3) 다시 열어줘\n\n그래도 안 되면 홈 화면 아이콘을 지우고 사파리에서 다시 설치하면 확실해.");
  }, 2500);
}

/* ---------- 버전 강제 · 원격 리셋 ---------- */
function setting(k) {
  const st = store.settings;
  if (!st) return "";
  if (Array.isArray(st)) { const r = st.find((x) => x.key === k); return r ? r.value : ""; }
  return st[k] || "";
}
function checkVersionGate() {
  const min = Number(setting("min_version") || 0);
  if (min && BUILD_NO < min) {
    // 먼저 조용히 자동 갱신을 한 번 시도하고, 그래도 안 되면 잠금
    const tried = localStorage.getItem("kel_autoupd");
    if (tried !== String(min)) {
      localStorage.setItem("kel_autoupd", String(min));
      toast("새 버전이 있어 — 자동으로 갱신할게");
      setTimeout(hardUpdate, 400);
      return true;
    }
    showVersionWall(min);
    return true;
  }
  localStorage.removeItem("kel_autoupd");
  const tok = setting("reset_token") || "";
  if (tok && localStorage.getItem("kel_reset_token") !== tok) {
    localStorage.setItem("kel_reset_token", tok);
    ["kel_me", "kel_rolls", "kel_dry", "kel_fate", "kel_tut", "kel_tut_loc", "kel_tut_siren",
     "kel_push_x", "kel_check", "kel_alerts", "kel_siren", "kel_req_done"].forEach((k) => localStorage.removeItem(k));
    me = "";
    rollResult = null;
    localStorage.removeItem("kel_x_ultra"); localStorage.removeItem("kel_x_prem");
    localStorage.removeItem("kel_grant_token");
    showWelcome();
  }
  return false;
}
function showVersionWall(min) {
  const g = document.getElementById("wall");
  if (!g) return;
  g.innerHTML =
    '<div class="wall-card">' +
      '<div class="wall-ic">🔄</div>' +
      '<p class="wall-t">업데이트가 필요해</p>' +
      '<p class="wall-d">이 폰은 <b>v' + BUILD_NO + "</b>, 지금 필요한 건 <b>v" + min + "</b>야.<br>버튼 한 번이면 끝나.</p>" +
      '<button class="btn" id="vw-go" style="width:100%;padding:16px">⬇️ 지금 갱신하기</button>' +
      '<button class="btn ghost" id="vw-alt" style="width:100%;margin-top:9px">그래도 안 되면 — 주소 새로 열기</button>' +
      '<p class="wall-hint" style="text-align:left;margin-top:18px">' +
      '<b>두 번 눌러도 그대로면:</b><br>' +
      '① 앱을 완전히 종료 (위로 쓸어올려 닫기) 후 다시 열기<br>' +
      '② 그래도 같으면 홈 화면 아이콘을 <b>길게 눌러 삭제</b> → 사파리로 주소 열기 → 홈 화면에 추가<br>' +
      '갱신해도 여행 기록·정산은 서버에 그대로 있어.</p>' +
    "</div>";
  g.hidden = false;
  appLocked = true;
  document.body.classList.add("walled");
  ["who-modal", "roll-modal", "odds-modal", "tut-modal", "install-modal"].forEach((id) => {
    const m = document.getElementById(id); if (m) m.hidden = true;
  });
  $("#vw-go").onclick = hardUpdate;
  const alt = $("#vw-alt"); if (alt) alt.onclick = () => navTo(location.pathname.replace(/[^/]*$/, "") + "index.html?v=" + Date.now());
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
function openTut() {
  if (appLocked) return; tutIdx = 0; tutPaused = false; tutList = tutSteps(); drawTut(); $("#tut-modal").hidden = false; }
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
function closeTut() { localStorage.setItem("kel_tut", "35"); tutPaused = false; $("#tut-modal").hidden = true; rerender(); }

/* ---------- 연출용 레이어가 없으면 직접 만든다 (옛 HTML 캐시 대비) ---------- */
function ensureLayers() {
  const mk = (id, html, cls) => {
    let el = document.getElementById(id);
    if (el) return el;
    el = document.createElement("div");
    el.id = id;
    el.hidden = true;
    if (cls) el.className = cls;
    if (html) el.innerHTML = html;
    document.body.appendChild(el);
    return el;
  };
  mk("fx", "");
  mk("sfx", "");
  mk("point", "");
  mk("wall", "");
  const edge = document.getElementById("edge") || (() => { const e = document.createElement("div"); e.id = "edge"; document.body.appendChild(e); return e; })();
  if (!document.getElementById("ribbon")) { const r = document.createElement("div"); r.id = "ribbon"; r.hidden = true; document.body.appendChild(r); }
  if (!document.getElementById("incoming")) {
    const i = document.createElement("div"); i.id = "incoming"; i.hidden = true; document.body.appendChild(i);
  }
  if (!document.getElementById("pack")) {
    mk("pack",
      '<div class="flash" id="p-flash"></div><div id="p-beams"></div>' +
      '<div class="cardwrap"><div class="card3d" id="c3d">' +
      '<div class="face front" id="p-front"><div class="shine"></div>' +
      '<div class="em" id="p-em"></div><div class="nm" id="p-nm"></div>' +
      '<div class="ko" id="p-ko"></div><div class="rk" id="p-rk"></div></div>' +
      '<div class="face back"><i>🎴</i></div></div></div>' +
      '<div id="p-conf"></div><div class="skip">TAP TO SKIP</div>');
  }
  if (!document.getElementById("roll-modal")) {
    const m = document.createElement("div");
    m.id = "roll-modal"; m.className = "modal"; m.hidden = true;
    m.innerHTML = '<div class="modal-card"><p class="modal-title">🎲 캐릭터 뽑기</p>' +
      '<p class="modal-sub">이름은 운이 정해 · 중복 없음</p><div id="roll-body"></div></div>';
    document.body.appendChild(m);
  }
  if (!document.getElementById("odds-modal")) {
    const m = document.createElement("div");
    m.id = "odds-modal"; m.className = "modal"; m.hidden = true;
    m.innerHTML = '<div class="modal-card"><p class="modal-title">확률표</p><div id="odds-body"></div>' +
      '<button class="btn" id="odds-close" style="width:100%;margin-top:14px">닫기</button></div>';
    document.body.appendChild(m);
    m.querySelector("#odds-close").onclick = () => { m.hidden = true; };
  }
  return edge;
}

/* ---------------- 가짜 광고 (뽑기 충전) ---------------- */
const MAX_ADS = 10;
const ADS = [
  { em: "🧪", t: "스네이프 표 두통약", d: "\"수업 중 졸음, 단 한 방울로\"", by: "호그와트 약초학과 공동개발" },
  { em: "🧹", t: "님부스 2001 리스", d: "월 39,900원부터 · 첫 달 무료", by: "퀴디치 모터스" },
  { em: "🦉", t: "부엉이 우편 프리미엄", d: "당일배송 · 비 오는 날도 정시", by: "OWL POST" },
  { em: "🍺", t: "버터맥주 6캔 패키지", d: "지금 주문 시 거품 2배", by: "호그스미드 유통" },
  { em: "💍", t: "잃어버린 반지 찾아드립니다", d: "골룸 흥신소 · 상담 무료", by: "샤이어 지사" },
  { em: "🎩", t: "분류모자 성격검사", d: "3분이면 내 기숙사가 나온다", by: "제휴: 마법부" },
  { em: "🚂", t: "호그와트 급행 얼리버드", d: "9와 4분의 3 승강장 출발", by: "영국 마법철도" },
  { em: "🧦", t: "도비의 양말 정기구독", d: "매달 새 양말이 자유를 배달", by: "집요정 노동조합" },
];
function adsWatched() { return Number(localStorage.getItem("kel_ads") || 0); }
function showAd(onDone) {
  if (adsWatched() >= MAX_ADS) { toast("광고는 " + MAX_ADS + "번까지야"); return; }
  let box = document.getElementById("adbox");
  if (!box) { box = document.createElement("div"); box.id = "adbox"; document.body.appendChild(box); }
  const ad = ADS[Math.floor(Math.random() * ADS.length)];
  const left = MAX_ADS - adsWatched() - 1;
  let sec = 5;
  const draw = () => {
    box.innerHTML =
      '<div class="ad-card">' +
        '<div class="ad-top">광고 · SPONSORED<span id="ad-count">' + sec + "초</span></div>" +
        '<div class="ad-em">' + ad.em + "</div>" +
        '<div class="ad-t">' + ad.t + "</div>" +
        '<div class="ad-d">' + ad.d + "</div>" +
        '<div class="ad-by">' + ad.by + "</div>" +
        '<div class="ad-bar"><i id="ad-fill"></i></div>' +
        '<button class="btn" id="ad-skip"' + (sec > 0 ? " disabled" : "") + ' style="width:100%;margin-top:14px">' +
          (sec > 0 ? sec + "초 후 보상 받기" : "🎲 뽑기 10번 받기") + "</button>" +
        '<p class="ad-note">가짜 광고야. 아무 데도 안 팔아.<br>남은 광고 ' + left + "회</p>" +
      "</div>";
    const b = document.getElementById("ad-skip");
    if (sec <= 0 && b) b.onclick = () => {
      localStorage.setItem("kel_ads", String(adsWatched() + 1));
      localStorage.setItem("kel_rolls", String(Math.max(0, myRolls() - 10)));
      addTicket(2);
      box.hidden = true; box.innerHTML = "";
      toast("🎲 뽑기 10번 충전!");
      onDone && onDone();
    };
  };
  box.hidden = false;
  draw();
  const iv = setInterval(() => {
    sec--;
    if (sec > 0) {
      const c = document.getElementById("ad-count"), f = document.getElementById("ad-fill"), b = document.getElementById("ad-skip");
      if (c) c.textContent = sec + "초";
      if (f) f.style.width = ((5 - sec) / 5 * 100) + "%";
      if (b) b.textContent = sec + "초 후 보상 받기";
    } else { clearInterval(iv); sec = 0; draw(); const f = document.getElementById("ad-fill"); if (f) f.style.width = "100%"; }
  }, 1000);
}

/* ---------------- 칭호 · 2배 쿠폰 ---------------- */
const TITLES = [
  { n: 10, t: "지갑을 여는 자", em: "💸" },
  { n: 25, t: "과금의 길", em: "🪙" },
  { n: 50, t: "운명을 거스른 자", em: "⏳" },
  { n: 100, t: "시간의 지배자", em: "🌌" },
];
function fateCount() { return Number(localStorage.getItem("kel_fate") || 0); }
function coupons() { return Number(localStorage.getItem("kel_coupon") || 0); }
function myTitle() {
  let cur = null;
  for (const t of TITLES) if (fateCount() >= t.n) cur = t;
  return cur;
}
function checkTitleUnlock() {
  const got = myTitle();
  if (!got) return;
  const seen = localStorage.getItem("kel_title_seen") || "";
  if (seen === String(got.n)) return;
  localStorage.setItem("kel_title_seen", String(got.n));
  const bonus = got.n >= 50 ? 5 : 0;
  if (bonus) localStorage.setItem("kel_coupon", String(coupons() + bonus));
  sendPush("🏅 칭호 획득", nameOf(me) + " — " + got.em + " " + got.t + " (" + got.n + "회)", "title");
  qInsert("checkins", { member: me, place: "🏅 " + got.em + " " + got.t + " 달성 (" + got.n + "회)", note: null, lat: null, lng: null });
  showTitleCard(got, bonus);
}
function checkNews() {
  const tok = setting("news_token") || "";
  if (!tok || localStorage.getItem("kel_news") === tok) return;
  localStorage.setItem("kel_news", tok);
  showNews();
}
function showNews() {
  let box = document.getElementById("newsbox");
  if (!box) { box = document.createElement("div"); box.id = "newsbox"; document.body.appendChild(box); }
  box.innerHTML =
    '<div class="wel-card">' +
      '<div class="wel-em">⚔️</div>' +
      '<div class="wel-t">무기 업데이트</div>' +
      '<div class="wel-d">캐릭터는 그대로! 이제 무기를 모아</div>' +
      '<div class="wel-list">' +
        '<div><b>⚔️ 무기 202종</b><span>등급은 캐릭터와 동일 · 티켓은 20분마다 1장 (최대 12)</span></div>' +
        '<div><b>⚡ 각성</b><span>내 캐릭터가 <b>원하는 무기</b>를 장착하면 이펙트가 폭주 · 셋이 딱총나무 지팡이를 노린다</span></div>' +
        '<div><b>📦 위험한 상자</b><span>무기를 잃을 수도, 신화를 얻을 수도. 🚫 고르지 마라 상자는 60% 전멸 / 22% 신화</span></div>' +
        '<div><b>🏆 컬렉션 랭킹</b><span>INFO 탭에서 6명 수집 순위 실시간</span></div>' +
        '<div><b>🎟️ 티켓 얻는 법</b><span>시간 충전 · 퀴즈 · 광고 · 상자</span></div>' +
      "</div>" +
      '<button class="btn" id="news-ok" style="width:100%;margin-top:18px">무기고 열기</button>' +
    "</div>";
  box.hidden = false;
  packTone(4); buzz([40, 50, 90]);
  $("#news-ok").onclick = () => { box.hidden = true; box.innerHTML = ""; openArmory(); };
}

function showWelcome() {
  let box = document.getElementById("welcomebox");
  if (!box) { box = document.createElement("div"); box.id = "welcomebox"; document.body.appendChild(box); }
  box.innerHTML =
    '<div class="wel-card">' +
      '<div class="wel-em">🎲</div>' +
      '<div class="wel-t">새 판이 시작됐어</div>' +
      '<div class="wel-d">테스트 기록은 전부 지웠어. 지금부터가 진짜야.</div>' +
      '<div class="wel-list">' +
        '<div><b>1. 이름 고르기</b><span>내가 6명 중 누구인지 선택</span></div>' +
        '<div><b>2. 캐릭터 뽑기</b><span>119명 중 랜덤 · 20번까지 다시 굴리기</span></div>' +
        '<div><b>3. 알림 켜기</b><span>앱이 꺼져 있어도 무전이 옴</span></div>' +
        '<div><b>4. 등급이 곧 이펙트</b><span>전설·신화면 무전 보낼 때 화면이 뒤집힘</span></div>' +
        '<div><b>5. 충전 방법</b><span>퀴즈 만점 = 확률 2배 · 광고 = 10번 · 상점 팩</span></div>' +
      "</div>" +
      '<button class="btn" id="wel-ok" style="width:100%;margin-top:18px">시작하기</button>' +
    "</div>";
  box.hidden = false;
  $("#wel-ok").onclick = () => { box.hidden = true; box.innerHTML = ""; rerender(); openWho(); };
}

function showTitleCard(t, bonus) {
  let box = document.getElementById("titlebox");
  if (!box) { box = document.createElement("div"); box.id = "titlebox"; document.body.appendChild(box); }
  box.innerHTML =
    '<div class="title-card">' +
      '<div class="title-lab">칭호 획득</div>' +
      '<div class="title-em">' + t.em + "</div>" +
      '<div class="title-t">' + t.t + "</div>" +
      '<div class="title-d">운명 거스르기 ' + t.n + "회 달성</div>" +
      (bonus ? '<div class="title-coupon">🎟️ 확률 2배 쿠폰 ' + bonus + "장<br><span>다음 " + bonus + "번의 뽑기에서 영웅 이상 확률이 두 배</span></div>" : "") +
      '<button class="btn" id="title-ok" style="width:100%;margin-top:16px">받기</button>' +
    "</div>";
  box.hidden = false;
  packTone(5); buzz([60, 40, 60, 40, 140]);
  weatherFx("arrival", 3, "#C79A3E", t.em + " " + t.t);
  $("#title-ok").onclick = () => { box.hidden = true; box.innerHTML = ""; };
}

/* ---------------- 퀴즈로 뽑기 충전 ---------------- */
const MAX_QUIZ = 10;
function quizDone() { return Number(localStorage.getItem("kel_quiz") || 0); }
const QZ_TF = ["① 참 · ② 참", "① 참 · ② 거짓", "① 거짓 · ② 참", "① 거짓 · ② 거짓"];
const QUIZ = [
  { q: "지희 생일은?", o: ["9월 5일", "9월 15일", "9월 25일", "10월 15일"], a: 1 },
  { q: "다흰이가 쓰는 쿠션 호수는?", o: ["17호", "19호", "21호", "23호"], a: 2 },
  { q: "상우 전화번호 뒷자리는?", o: ["2189", "2918", "2198", "9128"], a: 2 },
  { q: "재민이가 첫날 산 와인은 몇 병?", o: ["3병", "4병", "5병", "6병"], a: 2 },
  { q: "이번 여행에서 처음 간 와이너리는?", o: ["Beaumont", "Quails' Gate", "Little Straw", "Mt. Boucherie"], a: 1 },
  { q: "숙소 와이파이 이름을 정확히 고르면?", o: ["cabinlife", "cablinife", "cabinlyfe", "cabinlfie"], a: 0 },
  { q: "2026 월드컵 우승팀은?", o: ["아르헨티나", "프랑스", "스페인", "잉글랜드"], a: 2 },
  { q: "2026 월드컵 결승 스코어는?", o: ["1 : 0", "2 : 1", "0 : 0 승부차기", "3 : 1"], a: 0 },
  { q: "그 결승골의 주인공은?", o: ["라민 야말", "페란 토레스", "니코 윌리엄스", "메시"], a: 1 },
  { q: "오카나간 호수에 산다는 전설의 괴물 이름은?", o: ["오고포고", "사스콰치", "웬디고", "네시"], a: 0 },
  { q: "BC주의 주도는?", o: ["밴쿠버", "버나비", "빅토리아", "켈로나"], a: 2 },
  { q: "피노 누아는 무슨 포도로 만들까?", o: ["청포도", "적포도", "얼린 포도", "건포도"], a: 1 },
  { q: "희정 생일은?", o: ["9월 9일", "9월 19일", "9월 5일", "8월 9일"], a: 0 },
  { q: "재민 생일은?", o: ["11월 15일", "11월 5일", "10월 5일", "11월 25일"], a: 1 },
  { q: "재형 생일은?", o: ["1월 25일", "1월 15일", "2월 25일", "1월 5일"], a: 0 },
  { q: "상우 생일은?", o: ["11월 9일", "12월 19일", "11월 19일", "11월 29일"], a: 2 },
  { s: ["희정이 생일은 9월 9일이다", "지희 생일은 9월 19일이다"], o: QZ_TF, a: 1 },
  { s: ["재민·희정 커플의 기념일은 8월 15일이다", "그날은 광복절이다"], o: QZ_TF, a: 0 },
  { s: ["재형이는 1월생이다", "상우는 12월생이다"], o: QZ_TF, a: 1 },
  { s: ["다흰이는 쿠션 21호를 쓴다", "2026 월드컵 우승팀은 스페인이다"], o: QZ_TF, a: 0 },
  { s: ["이 여행 멤버 중 11월생은 두 명이다", "멤버 중 생일이 가장 빠른 달은 다흰이다"], o: QZ_TF, a: 1 },
  { s: ["월드컵 결승골은 연장전에 터졌다", "그 경기는 승부차기까지 갔다"], o: QZ_TF, a: 1 },
  { s: ["숙소 도어코드는 0992다", "숙소 변기엔 휴지만 버릴 수 있다"], o: QZ_TF, a: 0 },
  { s: ["출발 집결지는 Hope 맥도날드였다", "이 숙소는 Hydraulic Lake 근처다"], o: QZ_TF, a: 0 },
];
function showQuiz(onDone) {
  let box = document.getElementById("quizbox");
  if (!box) { box = document.createElement("div"); box.id = "quizbox"; document.body.appendChild(box); }
  const pool = QUIZ.slice().sort(() => Math.random() - 0.5).slice(0, 5);
  let i = 0, correct = 0;
  box.hidden = false;
  const finish = () => {
    const perfect = correct === pool.length;
    if (perfect) {
      localStorage.setItem("kel_quiz", String(quizDone() + 1));
      localStorage.setItem("kel_coupon", String(coupons() + 3));
      addTicket(3);
      localStorage.setItem("kel_rush5", String(Date.now() + RUSH_QUIZ_MS));
    }
    box.innerHTML =
      '<div class="quiz-card">' +
        '<div class="quiz-em">' + (perfect ? "⚡" : correct >= 3 ? "😐" : "😵") + "</div>" +
        '<div class="quiz-res">' + correct + " / " + pool.length + " 정답</div>" +
        '<div class="quiz-sub">' + (perfect ? "만점! 5분 무제한 발동!" : "하나라도 틀리면 꽝 — 뭐가 틀렸는진 비밀 😈") + "</div>" +
        (perfect ? '<div class="title-coupon" style="margin-top:14px">⚡ 5분간 무기 뽑기 무제한<br><span>+ 🎟️ 확률 2배 쿠폰 3장 + 무기 티켓 3장</span></div>' : "") +
        '<button class="btn" id="quiz-ok" style="width:100%;margin-top:16px">' + (perfect ? "받고 뽑으러 가기" : "다시 도전") + "</button>" +
        '<button class="btn ghost" id="quiz-x" style="width:100%;margin-top:8px">닫기</button>' +
        '<p class="ad-note">' + (perfect ? "퀴즈는 무제한 — 만점이면 또 보상" : "5개 전부 맞혀야 보상을 줘") + "</p>" +
      "</div>";
    $("#quiz-x").onclick = () => { box.hidden = true; box.innerHTML = ""; };
    $("#quiz-ok").onclick = () => {
      box.hidden = true; box.innerHTML = "";
      if (perfect) { toast("⚡ 5분 무제한 + 쿠폰 3 + 티켓 3!"); if (onDone) onDone(); else openArmory(); }
      else showQuiz(onDone);
    };
  };
  const draw = () => {
    if (i >= pool.length) return finish();
    const item = pool[i];
    const map = item.o.map((_, k) => k).sort(() => Math.random() - 0.5);
    box.innerHTML =
      '<div class="quiz-card">' +
        '<div class="quiz-num">' + (i + 1) + " / " + pool.length + "</div>" +
        '<div class="quiz-q">' + esc(item.q || "다음 진술의 참 · 거짓을 가려라") + "</div>" +
        (item.s ? '<div class="quiz-st">' + item.s.map((t, k) => "<span>" + "①②".charAt(k) + " " + esc(t) + "</span>").join("") + "</div>" : "") +
        '<div class="quiz-opts">' + map.map((oi) =>
          '<button class="quiz-opt" data-i="' + oi + '">' + esc(item.o[oi]) + "</button>").join("") + "</div>" +
        '<p class="ad-note">5문제 전부 맞혀야 보상 — 틀려도 정답은 안 알려줌</p>' +
      "</div>";
    $$(".quiz-opt", box).forEach((b) => b.onclick = () => {
      const ok = Number(b.dataset.i) === item.a;
      if (ok) { correct++; b.classList.add("right"); buzz([30]); }
      else { b.classList.add("wrongonly"); buzz([60, 40, 60]); }
      $$(".quiz-opt", box).forEach((x) => x.disabled = true);
      setTimeout(() => { i++; draw(); }, ok ? 450 : 800);
    });
  };
  draw();
}

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
  // 이 앱은 연출이 핵심이라 시스템 '동작 줄이기'를 따르지 않는다.
  // 정말 끄고 싶으면 localStorage.setItem("kel_calm","1")
  return localStorage.getItem("kel_calm") === "1";
}
function openPack(c, done) {
  const pack = document.getElementById("pack");
  if (!pack) { done && done(); return; }
  packClear();
  const tier = tierById[c.t];
  const myth = c.t >= 5;
  const calm = reduceMotion();
  const dur = calm ? 1800 : (myth ? 6200 : 4600), scale = dur / 4600;
  const F = FX[c.fx] || {};

  pack.classList.toggle("calm", calm);
  pack.removeAttribute("hidden");
  pack.style.cssText = "display:flex;align-items:center;justify-content:center;position:fixed;inset:0;z-index:600;" +
    "opacity:1;visibility:visible;overflow:hidden;background:radial-gradient(120% 80% at 50% 50%,#241F1A 0%,#12100E 58%,#080807 100%)";
  pack.style.setProperty("--rc", tier.color);

  const c3d = $("#c3d"), front = $("#p-front");
  front.style.setProperty("--rc", tier.color);
  front.classList.remove("on"); front.classList.toggle("holo", !!c.holo); c3d.className = "card3d"; c3d.style.transform = ""; c3d.style.opacity = "1";
  front.style.opacity = ""; front.style.zIndex = "";
  const bk0 = pack.querySelector(".back"); if (bk0) { bk0.style.opacity = ""; bk0.style.zIndex = ""; }
  const cw = pack.querySelector(".cardwrap");
  if (cw) cw.style.cssText = "position:relative;width:236px;height:330px;z-index:5";

  $("#p-em").textContent = c.em;
  $("#p-nm").textContent = c.last + " " + nameOf(me) + " " + c.first;
  $("#p-ko").textContent = c.ko + " · " + tier.name;
  $("#p-rk").textContent = tier.en + " · " + (myth ? "0.1%" : tier.p + "%");
  $("#p-beams").innerHTML = ""; $("#p-conf").innerHTML = "";

  // 배경 레이어(워시·광선·등급 라벨·거대 글리프) 준비
  let bg = pack.querySelector(".pack-bg");
  if (!bg) { bg = document.createElement("div"); bg.className = "pack-bg"; pack.insertBefore(bg, pack.firstChild); }
  bg.innerHTML =
    '<div class="pack-wash"></div>' +
    (c.t >= 3 ? '<div class="pack-rays"></div>' : "") +
    '<div class="pack-shock"></div><div class="pack-shock s2"></div><div class="pack-shock s3"></div>' +
    '<div class="pack-glyph">' + c.em + "</div>" +
    '<div class="pack-tier">' + tier.en + "</div>";
  bg.style.setProperty("--rc", tier.color);
  bg.classList.remove("reveal");

  const tBeam = Math.round(400 * scale), tFlip = Math.round(2400 * scale), tEnd = Math.round(4600 * scale);

  c3d.classList.add("enter");

  // 1) 충전 — 빛기둥 + 안쪽으로 빨려드는 입자
  PT(() => {
    const n = myth ? 10 : c.t >= 4 ? 8 : c.t >= 3 ? 6 : c.t >= 2 ? 4 : 3;
    let h = "";
    for (let i = 0; i < n; i++)
      h += '<span class="beam go" style="--rc:' + tier.color + ";--rot:" + (i * (180 / n)) +
        "deg;--dur:" + ((tFlip - tBeam) / 1000) + "s;--bw:" + (c.t >= 4 ? 160 : 110) + "px;--bl:" +
        (c.t >= 4 ? 10 : 16) + "px;animation-delay:" + (i * 0.05) + 's"></span>';
    h += '<span class="halo go" style="--rc:' + tier.color + ";--dur:" + ((tFlip - tBeam) / 1000) + 's"></span>';
    const sucks = myth ? 34 : c.t >= 4 ? 26 : 16;
    for (let i = 0; i < sucks; i++) {
      const a = Math.random() * 360, d = 260 + Math.random() * 260;
      h += '<span class="suck" style="--sx:' + Math.round(Math.cos(a * Math.PI / 180) * d) + "px;--sy:" +
        Math.round(Math.sin(a * Math.PI / 180) * d) + "px;--sc2:" + tier.color +
        ";animation-delay:" + (Math.random() * 1.1).toFixed(2) + 's"></span>';
    }
    $("#p-beams").innerHTML = h;
    packTone(c.t);
    buzz(c.t >= 5 ? [60, 40, 60, 40, 140] : c.t >= 4 ? [40, 50, 90] : [30]);
  }, tBeam);

  // 1.5) 등급 티징 — 테두리 색이 아래 등급부터 차오르다 진짜 색으로 스냅
  if (c.t >= 3 && !calm) {
    const ladder = [1, 2, 3, 4, 5, 6].filter((x) => x <= c.t).map((x) => tierById[x].color);
    ladder.forEach((col, i) => PT(() => {
      pack.style.setProperty("--rc", col);
      front.style.setProperty("--rc", col);
      bg.style.setProperty("--rc", col);
      if (i === ladder.length - 1 && typeof FX2 !== "undefined") FX2.flash(col, 160);
    }, Math.round(tFlip * 0.35) + i * Math.round((tFlip * 0.55) / ladder.length)));
  }

  // 1.5) 등급 티징 — 한 단계 낮은 색으로 예열하다 마지막에 진짜 색으로 스냅
  PT(() => {
    let tz = pack.querySelector(".pack-tease");
    if (!tz) { tz = document.createElement("div"); tz.className = "pack-tease"; pack.appendChild(tz); }
    const fakeT = c.t >= 4 ? tierById[c.t - 1] : tier;
    tz.style.setProperty("--tc", fakeT.color);
    tz.classList.add("t");
    PT(() => { tz.style.setProperty("--tc", tier.color); }, Math.round(700 * scale));
    PT(() => { tz.classList.remove("t"); }, Math.round(1100 * scale));
  }, tFlip - Math.round(1300 * scale));

  // 2) 공개 직전 섬광
  PT(() => { const f = $("#p-flash"); f.className = "flash"; void f.offsetWidth; f.className = "flash go" + (c.t >= 4 ? " big" : ""); },
     tFlip - Math.round(220 * scale));

  // 3) 공개 — 카드 뒤집기 + 충격파 + 흔들림 + 캐릭터 시그니처
  PT(() => {
    c3d.classList.add("flip", "shown");
    front.style.opacity = "1"; front.style.zIndex = "2";
    const bk = pack.querySelector(".back"); if (bk) { bk.style.opacity = "0"; bk.style.zIndex = "1"; }
    bg.classList.add("reveal");
    document.body.classList.add("sfx-shake");
    setTimeout(() => document.body.classList.remove("sfx-shake"), 1500);
    if (F.special) specialFx(F.special, F.c, c.t);
    if (typeof FX2 !== "undefined") {
      if (c.t >= 5) { FX2.hitstop(c.t >= 6 ? 260 : 180); FX2.shake(c.t >= 6 ? 0.7 : 0.45); }
      FX2.burst(innerWidth / 2, innerHeight * 0.42, { c: tier.color, n: c.t >= 5 ? 90 : 40 + c.t * 10, sp: 8 + c.t, sz: 9, up: 1 });
      if (c.t >= 6) FX2.stamp("TRANSCENDENT", tier.color);
    }
  }, tFlip);

  // 4) 정보 등장 + 색종이(전 등급)
  PT(() => {
    front.classList.add("on");
    const n = myth ? 70 : c.t >= 4 ? 48 : c.t >= 3 ? 30 : c.t >= 2 ? 20 : 12;
    let h = "";
    for (let i = 0; i < n; i++) {
      const dx = (Math.random() * 2 - 1) * 300, dy = 200 + Math.random() * 520, dr = Math.random() * 900 - 450;
      h += '<span class="conf go" style="left:' + (30 + Math.random() * 40) + "%;top:26%;background:" +
        (i % 3 ? tier.color : c.t >= 4 ? "#F4E4B8" : "#FFFFFF") +
        ";--dx:" + dx + "px;--dy:" + dy + "px;--dr:" + dr + "deg;--cd:" + (1.3 + Math.random() * 1.1) +
        "s;animation-delay:" + (Math.random() * .4) + 's"></span>';
    }
    $("#p-conf").innerHTML = h;
  }, tFlip + Math.round(280 * scale));

  const finish = () => {
    packClear();
    pack.style.display = "none"; pack.hidden = true;
    document.body.classList.remove("quake", "sfx-shake");
    done && done();
  };
  PT(finish, tEnd + Math.round(1400 * scale));
  pack.onclick = finish;
}

function ascendFx() {
  return new Promise((res) => {
    let box = document.getElementById("ascbox");
    if (!box) { box = document.createElement("div"); box.id = "ascbox"; document.body.appendChild(box); }
    box.hidden = false;
    box.innerHTML =
      '<div class="asc-wrap">' +
        '<div class="asc-warn">🚫</div>' +
        '<div class="asc-line1">그러게 고르지 말랬는데</div>' +
        '<div class="asc-star">🌟</div>' +
        '<div class="asc-line2">선택받은 자</div>' +
        '<div class="asc-tier">MYTHIC · 0.1%</div>' +
      "</div>";
    packTone(5);
    buzz([80, 50, 80, 50, 200]);
    specialFx("ascend", "#F5E08A", 5);
    document.body.classList.add("sfx-shake");
    setTimeout(() => document.body.classList.remove("sfx-shake"), 1800);
    setTimeout(() => { box.hidden = true; box.innerHTML = ""; res(); }, 4200);
  });
}

/* ---------------- 프리미엄 뽑기 (100 / 1000) ---------------- */
function today() { const d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
function extraUltra() { return Number(localStorage.getItem("kel_x_ultra") || 0); }
function extraPrem() { return Number(localStorage.getItem("kel_x_prem") || 0); }
const P100_PER_DAY = 6;
function used100Today() {
  const rec = (localStorage.getItem("kel_p100") || "").split("|");
  return rec[0] === today() ? Number(rec[1] || 1) : 0;
}
function canBuy100() { return used100Today() < P100_PER_DAY || extraPrem() > 0; }
function canBuy1000() { return ultraLeftType("char") || extraUltra() > 0; }
function applyGrants() {
  const tok = setting("grant_token") || "";
  if (!tok || !me) return;
  if (localStorage.getItem("kel_grant_token") === tok) return;
  let g = {};
  try { g = JSON.parse(setting("grants") || "{}"); } catch (e) { return; }
  localStorage.setItem("kel_grant_token", tok);
  const mine = g[me];
  if (!mine) return;
  if (mine.ultra) localStorage.setItem("kel_x_ultra", String(extraUltra() + mine.ultra));
  if (mine.premium) localStorage.setItem("kel_x_prem", String(extraPrem() + mine.premium));
  const parts = [];
  if (mine.ultra) parts.push("🏆 $1,000 울트라 팩 " + mine.ultra + "장");
  if (mine.premium) parts.push("💵 $100 프리미엄 팩 " + mine.premium + "장");
  showGiftCard(parts, mine.why || "");
}
function showGiftCard(parts, why) {
  let box = document.getElementById("giftbox");
  if (!box) { box = document.createElement("div"); box.id = "giftbox"; document.body.appendChild(box); }
  box.innerHTML =
    '<div class="title-card">' +
      '<div class="title-lab">선물 도착</div>' +
      '<div class="title-em">🎁</div>' +
      '<div class="title-t">' + esc(nameOf(me)) + "에게</div>" +
      (why ? '<div class="title-d">' + esc(why) + "</div>" : "") +
      '<div class="title-coupon" style="margin-top:14px">' + parts.join("<br>") + "</div>" +
      '<button class="btn" id="gift-ok" style="width:100%;margin-top:16px">받기</button>' +
    "</div>";
  box.hidden = false;
  packTone(5); buzz([60, 40, 60, 40, 140]);
  weatherFx("arrival", 3, "#C79A3E", "🎁 선물이 도착했다");
  $("#gift-ok").onclick = () => { box.hidden = true; box.innerHTML = ""; rerender(); };
}
function drawMulti(n, boost) {
  const taken = takenIds();
  const out = [];
  const pool = ROSTER.filter((c) => taken.indexOf(c.id) < 0 && !c.hidden && !isTrap(c.id));
  for (let k = 0; k < n && pool.length; k++) {
    const weights = TIERS.map((t) => ({ t: t.t, p: t.t >= 3 ? t.p * boost : t.p }));
    const total = weights.reduce((a, b) => a + b.p, 0);
    let roll = Math.random() * total, acc = 0, tier = 1;
    const order = weights.slice().sort((a, b) => a.p - b.p);
    for (const t of order) { acc += t.p; if (roll <= acc) { tier = t.t; break; } }
    let cands = pool.filter((c) => c.t === tier && out.indexOf(c) < 0);
    for (let t = tier - 1; t >= 1 && !cands.length; t--) cands = pool.filter((c) => c.t === t && out.indexOf(c) < 0);
    if (!cands.length) cands = pool.filter((c) => out.indexOf(c) < 0);
    if (!cands.length) break;
    out.push(cands[Math.floor(Math.random() * cands.length)]);
  }
  return out;
}
function openMulti(kind) {
  if (kind === 100 && !canBuy100()) return toast("100달러 팩은 하루 " + P100_PER_DAY + "번이야");
  if (kind === 1000 && !canBuy1000()) return toast("이번 주 울트라 캐릭터 슬롯은 이미 썼어 — 월요일 리셋");
  if (!me) return openWho();
  const n = kind === 1000 ? 3 : 5;
  const boost = kind === 1000 ? 10 : 3;
  const cards = drawMulti(n, boost);
  if (!cards.length) return toast("남은 캐릭터가 없어");
  if (kind === 100) {
    if (used100Today() >= P100_PER_DAY && extraPrem() > 0)
      localStorage.setItem("kel_x_prem", String(extraPrem() - 1));
    else localStorage.setItem("kel_p100", today() + "|" + (used100Today() + 1));
  } else { /* 울트라 캐릭터 슬롯은 openPackChoose에서 ultraMark 처리 */ }

  let box = document.getElementById("multibox");
  if (!box) { box = document.createElement("div"); box.id = "multibox"; document.body.appendChild(box); }
  box.className = kind === 1000 ? "ultra" : "";
  box.hidden = false;
  box.innerHTML =
    '<div class="multi-wrap">' +
      '<div class="multi-top">' + (kind === 1000 ? "$1,000 ULTRA PACK · 확률 10배" : "$100 PREMIUM PACK · 확률 3배") + "</div>" +
      '<div class="multi-sub">카드 ' + cards.length + "장 · 마음에 드는 하나를 골라</div>" +
      '<div class="multi-grid' + (cards.length === 3 ? " three" : "") + '">' +
        cards.map((c, i) => {
          const t = tierById[c.t];
          return '<button class="mcard" data-i="' + i + '" style="--rc:' + t.color + ';animation-delay:' + (i * 0.35) + 's">' +
            '<span class="mc-em">' + c.em + "</span>" +
            '<span class="mc-ko">' + esc(c.ko) + "</span>" +
            '<span class="mc-rk">' + t.en + "</span></button>";
        }).join("") +
      "</div>" +
      '<button class="btn ghost" id="multi-x" style="width:100%;margin-top:16px">닫기</button>' +
    "</div>";
  packTone(Math.max.apply(null, cards.map((c) => c.t)));
  buzz([50, 40, 50, 40, 120]);
  const best = cards.reduce((a, b) => (b.t > a.t ? b : a), cards[0]);
  if (best.t >= 4) setTimeout(() => specialFx((FX[best.fx] || {}).special || "cupburst", (FX[best.fx] || {}).c, best.t), cards.length * 350 + 200);
  $$(".mcard", box).forEach((b) => b.onclick = () => {
    const c = cards[Number(b.dataset.i)];
    box.hidden = true; box.innerHTML = "";
    rollResult = c;
    openPack(c, () => { drawRoll(); $("#roll-modal").hidden = false; });
  });
  $("#multi-x").onclick = () => { box.hidden = true; box.innerHTML = ""; };
}

/* ---------------- 무기 ---------------- */
let wRoll = null;
async function grantWeapon(w) {
  if (needSb()) return;
  const cur = wQty(w.id);
  await sb.from("inventory").upsert({ member: me, weapon_id: w.id, qty: cur + 1 }, { onConflict: "member,weapon_id" });
  await loadAll();
}
function openWeapon(mode) {
  if (installRequired()) { showInstallWall(); return; }
  if (!me) { toast("먼저 이름을 골라줘"); return openWho(); }
  if (!charOf(me)) { toast("캐릭터부터 뽑자"); return openRoll(); }
  let boost = 0;
  if (mode === "b2") {
    if (!useWb2()) return toast("✨ 2배 쿠폰이 없어");
    boost = 2; toast("✨ 2배 쿠폰 — 무료 뽑기 + 상위 확률 ×2");
  } else if (mode === "b10") {
    if (!useUb10()) return toast("💥 10배 쿠폰이 없어");
    boost = 10; toast("💥 10배 쿠폰 — 무료 뽑기 + 상위 확률 ×10");
  } else if (rushActive()) {
    mode = undefined;
  } else if (!useTicket(1)) return toast("무기 티켓이 없어 · " + nextTicketIn());
  const w = drawWeapon(boost);
  wRoll = w;
  openPack({ em: w.em, ko: w.ko, last: w.en.split(" ")[0], first: w.en.split(" ").slice(1).join(" ") || "", t: w.t, fx: "gold", holo: w.t >= 4 }, async () => {
    await grantWeapon(w);
    drawWeaponResult(w, mode);
  });
}
function drawWeaponResult(w, mode) {
  const t = tierById[w.t];
  const c = charOf(me);
  const fit = c && (w.want || []).indexOf(c.id) >= 0;
  const dupe = wQty(w.id) > 1;
  let box = document.getElementById("wbox");
  if (!box) { box = document.createElement("div"); box.id = "wbox"; document.body.appendChild(box); }
  box.hidden = false;
  box.innerHTML =
    '<div class="quiz-card"><button class="ovx" data-ovx>✕</button>' +
      '<div class="wres-em">' + w.em + "</div>" +
      '<div class="wres-t">' + esc(w.ko) + "</div>" +
      '<div class="wres-en">' + esc(w.en) + " · " + t.name + "</div>" +
      (fit ? '<div class="title-coupon" style="margin-top:12px">⚡ 각성 무기<br><span>' + esc(c.ko) + '이(가) 원하던 것 · 장착하면 이펙트가 폭주</span></div>'
           : dupe ? '<div class="muted" style="margin-top:10px">이미 가진 무기 (보유 ' + wQty(w.id) + "개)</div>" : "") +
      '<div class="btn-row" style="margin-top:14px">' +
        '<button class="btn ghost" id="w-again" style="flex:1">' + againLabel(mode) + "</button>" +
        '<button class="btn" id="w-equip" style="flex:1">장착하기</button></div>' +
      boostBtnRow() +
      '<button class="btn ghost" id="w-close" style="width:100%;margin-top:8px">보관함으로</button>' +
    "</div>";
  weaponFlair(w.t);
  $("#w-again").onclick = () => { box.hidden = true; openWeapon(mode === "b2" || mode === "b10" ? mode : undefined); };
  $("#w-equip").onclick = async () => { box.hidden = true; await equipWeapon(w.id); };
  $("#w-close").onclick = () => { box.hidden = true; openArmory(); };
}
async function equipWeapon(id) {
  if (needSb() || !me) return;
  const rec = (store.characters || []).find((c) => c.member === me);
  if (!rec) return toast("캐릭터부터 뽑자");
  await sb.from("characters").update({ weapon: id }).eq("member", me);
  await loadAll();
  const w = weaponById[id];
  if (isAwakened(me)) {
    toast("⚡ 각성! " + charOf(me).ko + " + " + w.ko);
    sendPush("⚡ 각성", nameOf(me) + " — " + charOf(me).ko + "이(가) " + w.ko + "를 손에 넣었다", "awaken");
    qInsert("checkins", { member: me, place: "⚡ 각성 — " + charOf(me).ko + " + " + w.ko, note: null, lat: null, lng: null });
    selfFx._t = 0; setTimeout(() => charFx(me, 3), 400);
  } else toast(w.em + " " + w.ko + " 장착");
  rerender();
}
function openArmory() {
  let box = document.getElementById("armorybox");
  if (!box) { box = document.createElement("div"); box.id = "armorybox"; document.body.appendChild(box); }
  const owned = myWeapons();
  const c = charOf(me);
  const wants = c ? WEAPONS.filter((w) => (w.want || []).indexOf(c.id) >= 0) : [];
  const eq = equippedId();
  const rush = rushActive();
  box.hidden = false;
  box.innerHTML =
    '<div class="armory"><button class="ovx" data-ovx>✕</button>' +
      '<div class="arm-top">무기고 <span>' + owned.length + " / " + WEAPONS.length + "</span></div>" +
      (rush ? '<div class="rush-note">⚡ 무제한 진행 중 — ' + fmtMS(rushLeftMs()) + " 동안 티켓 없이 뽑기</div>" : "") +
      (wants.length ? '<div class="arm-want">' + (c ? esc(c.ko) : "") + '이(가) 원하는 무기<div class="arm-wrow">' +
        wants.map((w) => '<span class="arm-wchip' + (wQty(w.id) ? " has" : "") + '">' + w.em + " " + esc(w.ko) +
          (wQty(w.id) ? " ✅" : "") + "</span>").join("") + "</div></div>" : "") +
      '<div class="arm-grid">' +
        (owned.length ? owned.map((r) => {
          const w = weaponById[r.weapon_id]; if (!w) return "";
          const t = tierById[w.t];
          const fit = c && (w.want || []).indexOf(c.id) >= 0;
          return '<button class="arm-item' + (eq === w.id ? " on" : "") + (fit ? " fit" : "") + '" data-w="' + w.id + '" style="--rc:' + t.color + '">' +
            '<span class="ai-em">' + w.em + "</span><span class=\"ai-ko\">" + esc(w.ko) + "</span>" +
            '<span class="ai-t" style="background:' + t.color + '">' + t.en + "</span>" +
            (r.qty > 1 ? '<span class="ai-q">×' + r.qty + "</span>" : "") +
            (eq === w.id ? '<span class="ai-eq">장착중</span>' : "") + "</button>";
        }).join("") : '<p class="muted" style="grid-column:1/-1;text-align:center">아직 무기가 없어. 뽑아보자</p>') +
      "</div>" +
      '<div class="btn-row" style="margin-top:14px">' +
        '<button class="btn' + (rush ? "" : " ghost") + '" id="arm-draw" style="flex:1.35">' + (rush ? "⚡ 무제한 뽑기" : "🎟️ 무기 뽑기 (" + wTickets() + ")") + "</button>" +
        '<button class="btn ghost" id="arm-syn" style="flex:1">💞 궁합</button>' +
        '<button class="btn ghost" id="arm-quiz" style="flex:1">🧠 퀴즈</button>' +
        '<button class="btn ghost" id="arm-box" style="flex:1">📦 상자</button></div>' +
      boostBtnRow() +
      '<button class="btn ghost" id="arm-close" style="width:100%;margin-top:8px">닫기</button>' +
    "</div>";
  $$(".arm-item", box).forEach((b) => b.onclick = async () => { box.hidden = true; await equipWeapon(b.dataset.w); openArmory(); });
  $("#arm-draw").onclick = () => { box.hidden = true; openWeapon(); };
  $("#arm-syn").onclick = () => { box.hidden = true; openSynergy(); };
  $("#arm-box").onclick = () => { box.hidden = true; openBoxes(); };
  $("#arm-quiz").onclick = () => { box.hidden = true; showQuiz(() => openArmory()); };
  $("#arm-close").onclick = () => { box.hidden = true; };
}

/* ---------------- 위험한 상자 ---------------- */
const BOXES = [
  { id:"safe",  em:"📦", ko:"미확인 상자",   cost:2, lose:10, mythic:2,  desc:"10% 확률로 무기 하나 소멸" },
  { id:"cursed",em:"☠️", ko:"저주받은 상자", cost:4, lose:35, mythic:8,  desc:"35% 확률로 무기 절반 소멸" },
  { id:"trap",  em:"🚫", ko:"고르지 마라",   cost:6, lose:60, mythic:22, desc:"60% 확률로 전부 소멸" },
];
function openBoxes() {
  let box = document.getElementById("boxbox");
  if (!box) { box = document.createElement("div"); box.id = "boxbox"; document.body.appendChild(box); }
  box.hidden = false;
  box.innerHTML =
    '<div class="armory"><button class="ovx" data-ovx>✕</button>' +
      '<div class="arm-top">위험한 상자 <span>🎟️ ' + wTickets() + "</span></div>" +
      '<p class="muted" style="font-size:12.5px;margin:0 0 12px">잃을 수도 있고, 신화를 얻을 수도 있어</p>' +
      BOXES.map((b) =>
        '<button class="boxcard b-' + b.id + '" data-b="' + b.id + '">' +
          '<span class="bx-em">' + b.em + "</span>" +
          '<span class="bx-t">' + b.ko + "</span>" +
          '<span class="bx-d">' + b.desc + " · 신화 " + b.mythic + "%</span>" +
          '<span class="bx-c">🎟️ ' + b.cost + "</span></button>").join("") +
      '<button class="btn ghost" id="box-close" style="width:100%;margin-top:12px">닫기</button>' +
    "</div>";
  $$(".boxcard", box).forEach((b) => b.onclick = () => runBox(b.dataset.b));
  $("#box-close").onclick = () => { box.hidden = true; };
}
async function runBox(id) {
  const b = BOXES.find((x) => x.id === id);
  if (!b) return;
  if (!confirm(b.em + " " + b.ko + "\n\n티켓 " + b.cost + "장 소모\n" + b.desc + "\n신화 무기 확률 " + b.mythic + "%\n\n진짜 열까?")) return;
  if (!useTicket(b.cost)) return toast("티켓이 부족해 · " + nextTicketIn());
  document.getElementById("boxbox").hidden = true;

  const roll = Math.random() * 100;
  if (roll < b.lose) {
    const mine = myWeapons();
    if (!mine.length) { toast("잃을 게 없었다… 운이 좋네"); return; }
    let killed = [];
    if (b.id === "trap") killed = mine.slice();
    else if (b.id === "cursed") killed = mine.slice(0, Math.max(1, Math.ceil(mine.length / 2)));
    else killed = [mine[Math.floor(Math.random() * mine.length)]];
    if (!needSb()) {
      await sb.from("inventory").delete().eq("member", me).in("weapon_id", killed.map((k) => k.weapon_id));
      if (killed.some((k) => k.weapon_id === equippedId())) await sb.from("characters").update({ weapon: null }).eq("member", me);
      await loadAll();
    }
    showBoxResult(false, killed.length, null);
    sendPush("💀 상자 참사", nameOf(me) + "이(가) 무기 " + killed.length + "개를 잃었다", "box");
    return;
  }
  const boost = roll < b.lose + b.mythic ? 999 : 3;
  const w = drawWeapon(boost);
  await grantWeapon(w);
  showBoxResult(true, 0, w);
  if (w.t >= 5) {
    sendPush("✦ 신화 무기", nameOf(me) + "이(가) " + w.em + " " + w.ko + "를 얻었다", "myth");
    qInsert("checkins", { member: me, place: "✦ 신화 무기 " + w.em + " " + w.ko + " 획득", note: null, lat: null, lng: null });
  }
}
function showBoxResult(win, lost, w) {
  let box = document.getElementById("wbox");
  if (!box) { box = document.createElement("div"); box.id = "wbox"; document.body.appendChild(box); }
  box.hidden = false;
  if (!win) {
    box.innerHTML = '<div class="quiz-card"><button class="ovx" data-ovx>✕</button>' +
      '<div class="wres-em">💀</div><div class="wres-t">무기 ' + lost + "개 소멸</div>" +
      '<div class="wres-en">그러게 열지 말랬는데</div>' +
      '<button class="btn" id="w-close" style="width:100%;margin-top:16px">…</button></div>';
    buzz([80, 60, 80]); weatherFx("go", 3, "#C8503C", "전부 잃었다");
  } else {
    const t = tierById[w.t];
    const c = charOf(me);
    const fit = c && (w.want || []).indexOf(c.id) >= 0;
    box.innerHTML = '<div class="quiz-card"><button class="ovx" data-ovx>✕</button>' +
      '<div class="wres-em">' + w.em + "</div>" +
      '<div class="wres-t">' + esc(w.ko) + "</div>" +
      '<div class="wres-en">' + esc(w.en) + " · " + t.name + "</div>" +
      (fit ? '<div class="title-coupon" style="margin-top:12px">⚡ 각성 무기다!</div>' : "") +
      '<div class="btn-row" style="margin-top:14px">' +
        '<button class="btn ghost" id="w-close" style="flex:1">보관함</button>' +
        '<button class="btn" id="w-equip2" style="flex:1">장착</button></div></div>';
    packTone(w.t); if (w.t >= 4) specialFx("cupburst", t.color, w.t);
    const e = $("#w-equip2"); if (e) e.onclick = async () => { box.hidden = true; await equipWeapon(w.id); };
  }
  const cl = $("#w-close"); if (cl) cl.onclick = () => { box.hidden = true; openArmory(); };
}

/* ---------------- 캐릭터 뽑기 ---------------- */
let rollResult = null;
function myRolls() { return Number(localStorage.getItem("kel_rolls") || 0); }
function bumpRolls() { localStorage.setItem("kel_rolls", String(myRolls() + 1)); }
function dryStreak() { return Number(localStorage.getItem("kel_dry") || 0); }
function drawCharacter(forceMult) {
  const taken = takenIds();
  const pool = ROSTER.filter((c) => taken.indexOf(c.id) < 0 && !c.hidden);
  if (!pool.length) return null;
  // 쿠폰은 어떤 뽑기든 1장 소모
  const boost = !forceMult && coupons() > 0;
  if (boost) localStorage.setItem("kel_coupon", String(coupons() - 1));
  const bmult = forceMult || (boost ? 2 : 1);
  // 함정 캐릭터는 '일반' 등급 몫에서만 가져간다 (상위 등급 확률 유지)
  const traps = pool.filter((c) => isTrap(c.id));
  const trap = (dryStreak() >= PITY_AT || !traps.length) ? null   // 천장이 걸린 턴엔 미끼 안 나옴
    : traps[Math.floor(Math.random() * traps.length)];
  if (trap && Math.random() * 100 < TRAP_RATE) {
    localStorage.setItem("kel_dry", String(dryStreak() + 1));
    return trap;
  }
  let picked = null;
  // 천장: 12번 연속 영웅 미만이면 영웅 이상 확정
  if (dryStreak() >= PITY_AT) {
    const hi = pool.filter((c) => c.t >= 3);
    if (hi.length) picked = hi[Math.floor(Math.random() * hi.length)];
  }
  if (!picked) {
    const trapLeft = !!trap;
    const weights = TIERS.map((t) => {
      let p = t.t >= 3 ? t.p * bmult : t.p;
      if (t.t === 1 && trapLeft) p = Math.max(0.1, p - TRAP_RATE);   // 함정이 가져간 몫만큼 일반에서 차감
      return { t: t.t, p };
    });
    const total = weights.reduce((a, b) => a + b.p, 0);
    const roll = Math.random() * total;
    let acc = 0, tier = 1;
    const order = weights.slice().sort((a, b) => a.p - b.p); // 희귀한 것부터
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
  if (appLocked) return;
  if (installRequired()) { showInstallWall(); return; }
  if (!me) { toast("먼저 내가 누구인지 골라줘"); return openWho(); }
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
    (isTrap(c.id) ? '<div class="trap-warn">' + trapWarn(c.id) + "</div>" : "") +
    '<div class="roll-name"><div class="en">' + esc(c.last) + " <b>" + esc(nameOf(me)) + "</b> " + esc(c.first) + "</div>" +
      '<div class="ko">' + esc(c.ko) + " · " + t.name + (c.t === 6 ? " — 이 세계 사람이 아니야" : c.t === 5 ? " — 부엉이다" : "") + "</div></div>" +
    '<div class="rolls">ROLLS LEFT<b>' + left + '<span>/' + MAX_ROLLS + "</span></b></div>" +
    (coupons() > 0 ? '<div class="coupon-on">🎟️ 확률 2배 적용 중 · ' + coupons() + "번 남음</div>" : "") +
    '<div class="btn-row" style="margin-top:12px">' +
      '<button class="btn ghost" id="roll-again"' + (left <= 0 ? " disabled" : "") + ' style="flex:1">🎲 다시 굴리기</button>' +
      '<button class="btn" id="roll-ok" style="flex:1">이걸로 확정</button></div>' +
    (ub10() > 0 ? '<button class="btn boost10" id="roll-b10" style="width:100%;margin-top:8px">💥 10배 쿠폰으로 다시 굴리기 · ' + ub10() + "</button>" : "") +
    (taken.length ? '<div class="field-label">이미 뽑힌 이름</div><div class="taken">' +
      taken.map((x) => "<span>" + x.em + " " + esc(x.ko) + "</span>").join("") + "</div>" : "") +
    '<button class="btn ghost" id="roll-odds" style="width:100%;margin-top:14px">확률표 보기</button>' +
    '<p class="muted" style="text-align:center;margin:12px 0 0;font-size:12.5px">확정 후에도 <b>INFO 탭 → 운명 거스르기</b>에서 다시 뽑을 수 있어</p>';
  $("#roll-again").onclick = () => {
    if (myRolls() >= MAX_ROLLS) {
      if (confirm("뽑기 20번을 다 썼어.\n퀴즈 만점 맞히면 확률 2배 쿠폰을 줘. 풀어볼래?"))
        return showQuiz(() => { rollResult = drawCharacter(); drawRoll(); });
      return toast("INFO 탭 → 운명 거스르기에서 충전할 수 있어");
    }
    bumpRolls();
    const next = drawCharacter();
    if (!next) return toast("남은 캐릭터가 없어");
    $("#roll-modal").hidden = true;
    openPack(next, () => { rollResult = next; drawRoll(); $("#roll-modal").hidden = false; });
  };
  const rb10 = $("#roll-b10");
  if (rb10) rb10.onclick = () => {
    if (!useUb10()) return;
    const next = drawCharacter(10);
    if (!next) return toast("남은 캐릭터가 없어");
    $("#roll-modal").hidden = true;
    openPack(next, () => { rollResult = next; drawRoll(); $("#roll-modal").hidden = false; });
  };
  $("#roll-ok").onclick = confirmRoll;
  $("#roll-odds").onclick = openOdds;
}
async function confirmRoll() {
  if (needSb() || !rollResult) return;
  let c = rollResult;
  if (isTrap(c.id) && c.id !== trapId()) {
    // 미끼였지만 이번 판의 정답이 아님 → 그냥 그 캐릭터로 확정
    toast("…아무 일도 일어나지 않았다");
    weatherFx("cabin", 1, "#9A9A92", "그냥 카드였다");
  }
  if (c.id === trapId()) {
    const asc = charById["chosen"];
    if (asc && takenIds().indexOf("chosen") < 0) {
      $("#roll-modal").hidden = true;
      await ascendFx();
      c = asc;
      rollResult = asc;
    }
  }
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
  if (c.t >= 3) setTimeout(() => { selfFx._t = 0; charFx(me, 3); showRibbon(c.ko + " 등장!", tierById[c.t].color); }, 700);
  if (c.t >= 5) {
    sendPush("✦ 0.1% 등장", nameOf(me) + "이(가) " + c.em + " " + c.ko + "를 뽑았다", "myth");
    await qInsert("checkins", { member: me, place: "✦ " + c.em + " " + c.ko + " (0.1%) 뽑음", note: null, lat: null, lng: null });
  } else if (c.t === 4) {
    sendPush("🏅 전설 등장", nameOf(me) + " → " + c.em + " " + c.ko, "legend");
  }
  if (localStorage.getItem("kel_tut") !== "35") setTimeout(openTut, 2600);
  else setTimeout(() => toast("다시 뽑고 싶으면 INFO 탭 → 운명 거스르기"), 3000);
}
function openOdds() {
  const box = $("#odds-body");
  if (!box) return;
  const taken = takenIds();
  box.innerHTML = TIERS.map((t) => {
    const list = ROSTER.filter((c) => c.t === t.t && !c.hidden);
    const left = list.filter((c) => taken.indexOf(c.id) < 0).length;
    return '<div class="odds-row"><span class="odds-ring" style="--rc:' + t.color + '">' + list[0].em + "</span>" +
      '<div><div class="odds-t">' + t.name + " <span class=\"muted\">" + t.en + "</span></div>" +
      '<div class="odds-l">' + list.map((c) => c.em + " " + c.ko).join(" · ") + "</div>" +
      '<div class="odds-l">남은 인원 ' + left + "/" + list.length + "</div></div>" +
      '<span class="odds-p" style="color:' + t.color + '">' + t.p + "%</span></div>";
  }).join("") +
    '<div class="odds-row" style="border-top:1.5px dashed var(--line-2);margin-top:6px;padding-top:14px">' +
    '<span class="odds-ring" style="--rc:#C8503C">🚫</span>' +
    '<div><div class="odds-t">수상한 카드 <span class="muted">SUSPICIOUS</span></div>' +
    '<div class="odds-l">등급과 별개로 이 확률로 등장. 확정하면 어떻게 되는지는 아무도 몰라</div></div>' +
    '<span class="odds-p" style="color:#C8503C">' + TRAP_RATE + "%</span></div>" +
    '<p class="muted" style="text-align:center;margin-top:14px">꽝은 없어. 운만 다를 뿐</p>';
  $("#odds-modal").hidden = false;
}

/* ---------------- 나 선택 ---------------- */
function openWho() {
  if (appLocked) return;
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
      toast("🎮 " + nameOf(me) + " 선택! (상단 아바타를 누르면 언제든 바꿀 수 있어)");
      if (tutPaused) setTimeout(tutResume, 300);
      else if (!charOf(me)) setTimeout(openRoll, 400);
      else if (localStorage.getItem("kel_tut") !== "35") setTimeout(openTut, 400);
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
  ensureLayers();
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
  if (!me) openWho();                       // 1단계: 내가 누구인지
  else setTimeout(() => { if (sb && !charOf(me)) openRoll(); }, 900);   // 2단계: 캐릭터 뽑기
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
    navigator.serviceWorker.register("sw.js").then((reg) => {
      if (reg) reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) {
            nw.postMessage({ type: "SKIP_WAITING" });
            if (!sessionStorage.getItem("kel_swreload")) {
              sessionStorage.setItem("kel_swreload", "1");
              setTimeout(() => location.reload(), 600);
            }
          }
        });
      });
      return reg;
    }).catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", boot);


/* ================================================================
   v33 — 정각 무제한 · 라이어 게임 · 궁합표 · 배수 쿠폰 · 무기 플레어
   ================================================================ */

/* ---------------- 배수 쿠폰 (라이어 게임 보상) ---------------- */
function wb2() { return Number(localStorage.getItem("kel_wb2") || 0); }
function ub10() { return Number(localStorage.getItem("kel_ub10") || 0); }
function addWb2(n) { localStorage.setItem("kel_wb2", String(wb2() + n)); }
function addUb10(n) { localStorage.setItem("kel_ub10", String(ub10() + n)); }
function useWb2() { if (wb2() <= 0) return false; localStorage.setItem("kel_wb2", String(wb2() - 1)); return true; }
function useUb10() { if (ub10() <= 0) return false; localStorage.setItem("kel_ub10", String(ub10() - 1)); return true; }
function boostBtnRow() {
  const a = wb2(), b = ub10();
  if (!a && !b) return "";
  let h = '<div class="btn-row" style="margin-top:8px">';
  if (a) h += '<button class="btn boost2" data-bm="b2" style="flex:1">✨ 2배 뽑기 · ' + a + "</button>";
  if (b) h += '<button class="btn boost10" data-bm="b10" style="flex:1">💥 10배 뽑기 · ' + b + "</button>";
  return h + "</div>";
}
function againLabel(mode) {
  if (mode === "b2") return "✨ 2배 한 번 더 (" + wb2() + ")";
  if (mode === "b10") return "💥 10배 한 번 더 (" + ub10() + ")";
  if (rushActive()) return "⚡ 무제한 한 번 더";
  return "🎟️ 한 번 더 (" + wTickets() + ")";
}

/* ---------------- 정각 무제한 (러시) ---------------- */
const RUSH_QUIZ_MS = 5 * 60000;
function rushPersonalUntil() { return Number(localStorage.getItem("kel_rush5") || 0); }
function rushActive() { return new Date().getMinutes() % 10 === 0 || Date.now() < rushPersonalUntil(); }
function rushLeftMs() {
  const d = new Date();
  let g = 0;
  if (d.getMinutes() % 10 === 0) g = 60000 - d.getSeconds() * 1000 - d.getMilliseconds();
  return Math.max(g, rushPersonalUntil() - Date.now());
}
function rushNextMs() { const d = new Date(); return ((9 - d.getMinutes() % 10) * 60 + (60 - d.getSeconds())) * 1000; }
function fmtMS(ms) { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

function rushPill() {
  let p = document.getElementById("rush-pill");
  if (!p) {
    p = document.createElement("button");
    p.id = "rush-pill";
    document.body.appendChild(p);
    p.onclick = () => { try { openArmory(); } catch (e) {} };
  }
  if (rushActive()) { p.classList.add("on"); p.innerHTML = "⚡ 무제한 <b>" + fmtMS(rushLeftMs()) + "</b>"; }
  else { p.classList.remove("on"); p.innerHTML = "🎰 다음 무제한 <b>" + fmtMS(rushNextMs()) + "</b>"; }
}
async function rushClaimPush(hkey) {
  if (!sb) return;
  try {
    const { error } = await sb.from("rush_locks").insert({ hkey: hkey });
    if (!error) sendPush("⚡ 무기 뽑기 무제한", "지금부터 1분 — 티켓 없이 무한으로 뽑아. 무기고로!", "rush");
  } catch (e) {}
}
function rushBlast() {
  let o = document.getElementById("rushov");
  if (!o) { o = document.createElement("div"); o.id = "rushov"; document.body.appendChild(o); }
  o.innerHTML =
    '<div class="rush-in">' +
      '<div class="rush-bolt">⚡</div>' +
      '<div class="rush-t">무기 뽑기 무제한</div>' +
      '<div class="rush-s">지금부터 1분 — 티켓이 필요 없다</div>' +
      '<button class="btn" id="rush-go" style="width:100%;margin-top:14px">무기고 열기</button>' +
    "</div>";
  o.hidden = false;
  try { packTone(5); } catch (e) {}
  buzz([70, 50, 70, 50, 180]);
  const g = document.getElementById("rush-go");
  if (g) g.onclick = () => { o.hidden = true; openArmory(); };
  setTimeout(() => { o.hidden = true; }, 6500);
}
function rushTick() {
  rushPill();
  const d = new Date();
  if (d.getMinutes() % 10 === 0 && d.getSeconds() < 3) {
    const hkey = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getHours() + "-" + d.getMinutes();
    if ((localStorage.getItem("kel_rush_hr") || "") !== hkey) {
      localStorage.setItem("kel_rush_hr", hkey);
      rushBlast();
      if (d.getMinutes() === 0) rushClaimPush(hkey);   // 푸시는 정각에만 — 10분마다 울리면 피로함
      const ab = document.getElementById("armorybox");
      if (ab && !ab.hidden) openArmory();
    }
  }
}

/* ---------------- 궁합표 ---------------- */
function openSynergy() {
  let box = document.getElementById("synbox");
  if (!box) { box = document.createElement("div"); box.id = "synbox"; document.body.appendChild(box); }
  const myC = charOf(me);
  const chipOf = (id) => {
    const ch = charById[id];
    if (!ch) return "";
    const mine = myC && myC.id === id;
    return '<span class="syn-chip' + (mine ? " mine" : "") + '">' + ch.em + " " + esc(ch.ko) + "</span>";
  };
  const row = (w) => {
    const t = tierById[w.t];
    const own = wQty(w.id) > 0;
    const fit = myC && (w.want || []).indexOf(myC.id) >= 0;
    return '<div class="syn-row' + (fit ? " fit" : "") + '">' +
      '<div class="syn-w"><span class="syn-em">' + w.em + "</span><div><div class=\"syn-ko\">" + esc(w.ko) + (own ? ' <span class="syn-own">보유 ✓</span>' : "") + "</div>" +
      '<span class="syn-tier" style="background:' + t.color + '">' + t.en + "</span></div></div>" +
      '<div class="syn-chips">' + (w.want || []).map(chipOf).join("") + "</div></div>";
  };
  const tiers = [5, 4, 3];
  const myList = myC ? WEAPONS.filter((w) => (w.want || []).indexOf(myC.id) >= 0) : [];
  box.hidden = false;
  box.innerHTML =
    '<div class="armory syn-wrap">' +
      '<div class="arm-top">💞 궁합표 <span>맞춰 들면 각성 ×3</span></div>' +
      (myC ? '<div class="syn-minehdr">' + myC.em + " " + esc(myC.ko) + " 전용 무기</div>" +
        (myList.length ? myList.map(row).join("") : '<p class="muted" style="margin:4px 0 10px">네 캐릭터를 원하는 무기가 없어… 잡템 인생</p>') : "") +
      tiers.map((tn) => {
        const t = tierById[tn];
        const list = WEAPONS.filter((w) => w.t === tn && (w.want || []).length);
        return '<div class="syn-thdr" style="color:' + t.color + '">' + t.name + " · " + t.en + "</div>" + list.map(row).join("");
      }).join("") +
      '<p class="muted" style="font-size:12px;margin:10px 0 0">1·2성 잡템은 궁합이 없어 — 누가 들어도 잡템</p>' +
      '<div class="btn-row" style="margin-top:12px">' +
        '<button class="btn ghost" id="syn-back" style="flex:1">← 무기고</button>' +
        '<button class="btn" id="syn-close" style="flex:1">닫기</button></div>' +
    "</div>";
  const bk = document.getElementById("syn-back"); if (bk) bk.onclick = () => { box.hidden = true; openArmory(); };
  const cl = document.getElementById("syn-close"); if (cl) cl.onclick = () => { box.hidden = true; };
}

/* ---------------- 무기 뽑기 플레어 (금박 폭포 + 프리즘) ---------------- */
function weaponFlair(t) {
  if (t < 4) return;
  let o = document.getElementById("wflair");
  if (!o) { o = document.createElement("div"); o.id = "wflair"; document.body.appendChild(o); }
  let h = "";
  const n = t >= 5 ? 46 : 26;
  for (let i = 0; i < n; i++) {
    h += '<i class="gf" style="left:' + (Math.random() * 100).toFixed(1) + "%;animation-delay:" + (Math.random() * 0.9).toFixed(2) +
      "s;animation-duration:" + (1.6 + Math.random() * 1.2).toFixed(2) + 's"></i>';
  }
  if (t >= 5) h += '<i class="prism"></i><i class="prism p2"></i>';
  o.innerHTML = h;
  o.hidden = false;
  clearTimeout(weaponFlair._t);
  weaponFlair._t = setTimeout(() => { o.hidden = true; o.innerHTML = ""; }, 3400);
}

/* ---------------- 라이어 게임 ---------------- */
const LIAR_WORDS = [
  { c: "여행", w: "와이너리" }, { c: "여행", w: "핫텁" }, { c: "여행", w: "카약" }, { c: "여행", w: "패들보드" },
  { c: "여행", w: "캠프파이어" }, { c: "여행", w: "코스트코" }, { c: "여행", w: "선크림" }, { c: "여행", w: "모기" },
  { c: "여행", w: "아이스박스" }, { c: "여행", w: "불멍" }, { c: "여행", w: "소맥" }, { c: "여행", w: "도어코드" },
  { c: "여행", w: "마시멜로" }, { c: "여행", w: "휴게소" }, { c: "여행", w: "이층침대" }, { c: "여행", w: "블루투스 스피커" },
  { c: "음식", w: "삼겹살" }, { c: "음식", w: "라면" }, { c: "음식", w: "김치찌개" }, { c: "음식", w: "마라탕" },
  { c: "음식", w: "치킨" }, { c: "음식", w: "떡볶이" }, { c: "음식", w: "초밥" }, { c: "음식", w: "붕어빵" },
  { c: "음식", w: "아이스 아메리카노" }, { c: "음식", w: "샤인머스캣" }, { c: "음식", w: "곱창" }, { c: "음식", w: "부대찌개" },
  { c: "물건", w: "에어팟" }, { c: "물건", w: "고데기" }, { c: "물건", w: "손톱깎이" }, { c: "물건", w: "콘택트렌즈" },
  { c: "물건", w: "보조배터리" }, { c: "물건", w: "셀카봉" }, { c: "물건", w: "물티슈" }, { c: "물건", w: "립밤" },
  { c: "물건", w: "다이슨" }, { c: "물건", w: "휴지" },
  { c: "장소", w: "노래방" }, { c: "장소", w: "찜질방" }, { c: "장소", w: "코인세탁소" }, { c: "장소", w: "PC방" },
  { c: "장소", w: "이케아" }, { c: "장소", w: "스타벅스" }, { c: "장소", w: "한강" }, { c: "장소", w: "면세점" },
  { c: "상황", w: "양치질" }, { c: "상황", w: "눈치게임" }, { c: "상황", w: "셀카" }, { c: "상황", w: "낮잠" },
  { c: "상황", w: "계좌이체" }, { c: "상황", w: "넷플릭스 정주행" }, { c: "상황", w: "다이어트" }, { c: "상황", w: "벌레 잡기" },
  { c: "동물", w: "카피바라" }, { c: "동물", w: "수달" }, { c: "동물", w: "알파카" }, { c: "동물", w: "미어캣" },
  { c: "동물", w: "골든리트리버" }, { c: "동물", w: "고슴도치" },
];

let liarG = null, liarPrevPhase = null, liarCntT = null;

function liarInit() {
  if (!sb) { setTimeout(liarInit, 900); return; }
  try {
    const ch = sb.channel("kel-liar");
    ch.on("postgres_changes", { event: "*", schema: "public", table: "liar_games" }, () => { liarRefresh(); });
    ch.subscribe();
  } catch (e) {}
  liarRefresh();
}

async function liarRefresh() {
  if (!sb) return;
  try {
    const { data, error } = await sb.from("liar_games").select("*").order("id", { ascending: false }).limit(1);
    if (error) return;
    liarG = (data && data[0]) || null;
    liarAfterRefresh();
  } catch (e) {}
}

function liarPlayers() { return (liarG && liarG.players) || []; }
function liarActive() { return liarG && liarG.phase !== "done"; }
function liarImIn() { return liarPlayers().indexOf(me) >= 0; }

function liarAfterRefresh() {
  const box = document.getElementById("liarbox");
  const open = box && !box.hidden;
  const ph = liarG ? liarG.phase + ":" + liarG.id + ":" + (liarG.vround || 1) : "none";
  // 판이 놀이/투표 단계로 넘어갔는데 내가 플레이어면 자동으로 화면 띄움
  if (liarG && liarImIn() && !open && ["play", "vote", "steal", "done"].indexOf(liarG.phase) >= 0 && liarPrevPhase !== ph) {
    openLiar();
  } else if (open) {
    liarRender();
  } else if (liarG && liarG.phase === "lobby" && !liarImIn() && liarPrevPhase !== ph) {
    toast("🎭 라이어 게임 판 열림 — RADIO 탭에서 조인");
  }
  liarPrevPhase = ph;
  // RADIO 탭 카드 갱신
  try { if (document.querySelector("#tab-stamp.active")) renderStamp(); } catch (e) {}
  // 보상 지급 (한 번만)
  liarReward();
}

function openLiar() {
  if (!me) { toast("먼저 내가 누구인지 골라줘"); return openWho(); }
  let box = document.getElementById("liarbox");
  if (!box) { box = document.createElement("div"); box.id = "liarbox"; document.body.appendChild(box); }
  box.hidden = false;
  liarRender();
  liarRefresh();
}

function liarClose() {
  const box = document.getElementById("liarbox");
  if (box) box.hidden = true;
  if (liarCntT) { clearInterval(liarCntT); liarCntT = null; }
}

function liarHead(sub) {
  return '<div class="arm-top">🎭 라이어 게임 <span>' + (sub || "") + "</span></div>";
}

function liarRender() {
  const box = document.getElementById("liarbox");
  if (!box || box.hidden) return;
  if (liarCntT) { clearInterval(liarCntT); liarCntT = null; }
  const g = liarG;

  // 판 없음 / 끝난 판만 있음 → 시작 화면
  if (!g || (g.phase === "done" && localStorage.getItem("kel_lr_seen") === String(g.id))) {
    box.innerHTML =
      '<div class="armory liar-wrap">' + liarHead("") +
        '<div class="liar-hero">🎭</div>' +
        '<p class="liar-rule">라이어 빼고 전원에게 단어가 뜬다.<br>돌아가면서 <b>입으로</b> 설명하고, 다 끝나면 폰으로 라이어를 지목.<br>' +
        '시민이 이기면 전원 <b>2배 쿠폰 10장씩</b>(무기+캐릭터), 라이어가 살아남으면 혼자 <b>10배 쿠폰 10장</b>.</p>' +
        '<button class="btn" id="lr-new" style="width:100%;margin-top:14px">새 판 열기</button>' +
        '<button class="btn ghost" id="lr-x" style="width:100%;margin-top:8px">닫기</button>' +
      "</div>";
    bind("#lr-new", liarCreate); bind("#lr-x", liarClose);
    return;
  }

  const ps = liarPlayers();

  if (g.phase === "lobby") {
    const inG = liarImIn();
    box.innerHTML =
      '<div class="armory liar-wrap">' + liarHead(ps.length + " / " + MEMBERS.length) +
        '<p class="liar-sub">전원 모이면 자동 시작 · 4명부터는 수동 시작 가능</p>' +
        '<div class="lr-grid">' + MEMBERS.map((m) => {
          const joined = ps.indexOf(m.id) >= 0;
          return '<div class="lr-p' + (joined ? " in" : "") + '">' + av(m.id, "mini") + "<span>" + esc(m.name) + "</span>" + (joined ? "<b>✓</b>" : "") + "</div>";
        }).join("") + "</div>" +
        (inG ? '<p class="liar-sub" style="margin-top:12px">조인 완료 — 친구들 기다리는 중…</p>'
             : '<button class="btn" id="lr-join" style="width:100%;margin-top:12px">조인하기</button>') +
        (ps.length >= 4 ? '<button class="btn' + (inG ? "" : " ghost") + '" id="lr-start" style="width:100%;margin-top:8px">지금 시작 (' + ps.length + "명)</button>" : "") +
        '<button class="btn ghost" id="lr-x" style="width:100%;margin-top:8px">닫기</button>' +
      "</div>";
    bind("#lr-join", liarJoin); bind("#lr-start", liarStart); bind("#lr-x", liarClose);
    // 6명 다 모이면 방장이 자동 시작
    if (ps.length >= MEMBERS.length && me === g.host) liarStart();
    return;
  }

  if (g.phase === "play") {
    const t0 = new Date(g.start_at || g.created_at).getTime() + 3400;
    const leftMs = t0 - Date.now();
    if (leftMs > 0) {
      const draw = () => {
        const s = Math.max(0, Math.ceil((t0 - Date.now()) / 1000));
        box.innerHTML =
          '<div class="armory liar-wrap liar-center">' + liarHead("") +
            '<div class="liar-count">' + (s || "🎬") + "</div>" +
            '<p class="liar-sub">단어 공개까지…</p>' +
          "</div>";
        if (Date.now() >= t0) { clearInterval(liarCntT); liarCntT = null; liarRender(); }
      };
      draw();
      liarCntT = setInterval(draw, 250);
      buzz([30]);
      return;
    }
    const imLiar = g.liar === me;
    const done = g.done_j || [];
    const iDone = done.indexOf(me) >= 0;
    box.innerHTML =
      '<div class="armory liar-wrap">' + liarHead(done.length + " / " + ps.length + " 설명 끝") +
        '<div class="liar-cat">카테고리 · ' + esc(g.category || "") + "</div>" +
        (imLiar
          ? '<div class="liar-word liar-liar">🤫<br>당신이 라이어</div><p class="liar-sub">단어를 몰라도 아는 척 설명해. 들키면 끝이야.</p>'
          : '<div class="liar-word">' + esc(g.word || "") + '</div><p class="liar-sub">이 단어를 <b>말하지 말고</b> 돌아가면서 설명해.<br>라이어 앞에서 너무 다 퍼주지 말 것.</p>') +
        '<div class="lr-grid" style="margin-top:12px">' + ps.map((id) => {
          const d = done.indexOf(id) >= 0;
          return '<div class="lr-p' + (d ? " in" : "") + '">' + av(id, "mini") + "<span>" + esc(nameOf(id)) + "</span>" + (d ? "<b>✓</b>" : "") + "</div>";
        }).join("") + "</div>" +
        (liarImIn() ? '<button class="btn" id="lr-done" style="width:100%;margin-top:12px"' + (iDone ? " disabled" : "") + ">🗣️ " + (iDone ? "설명 끝 완료" : "내 설명 끝") + "</button>" : "") +
        '<button class="btn ghost" id="lr-x" style="width:100%;margin-top:8px">잠깐 닫기</button>' +
      "</div>";
    bind("#lr-done", liarDone); bind("#lr-x", liarClose);
    return;
  }

  if (g.phase === "vote") {
    const votes = g.votes_j || {};
    const myPick = votes[me];
    const nVoted = Object.keys(votes).filter((k) => ps.indexOf(k) >= 0).length;
    box.innerHTML =
      '<div class="armory liar-wrap">' + liarHead(nVoted + " / " + ps.length + " 투표" + ((g.vround || 1) > 1 ? " · 재투표" : "")) +
        '<div class="liar-cat">라이어는 누구?</div>' +
        ((g.vround || 1) > 1 ? '<p class="liar-sub" style="color:var(--accent)">동률! 다시 투표해 — 또 동률이면 라이어 승리</p>' : '<p class="liar-sub">한 명을 골라. 다 고르면 자동으로 결과가 뜬다.</p>') +
        '<div class="lv-grid">' + ps.filter((id) => id !== me).map((id) =>
          '<button class="lv-p' + (myPick === id ? " picked" : "") + '" data-v="' + id + '">' + av(id, "mini") + "<span>" + esc(nameOf(id)) + "</span></button>"
        ).join("") + "</div>" +
        (liarImIn() ? "" : '<p class="liar-sub">관전 중 — 투표는 참가자만</p>') +
        '<button class="btn ghost" id="lr-x" style="width:100%;margin-top:10px">잠깐 닫기</button>' +
      "</div>";
    $$(".lv-p", box).forEach((b) => b.onclick = () => { if (liarImIn()) liarVote(b.dataset.v); });
    bind("#lr-x", liarClose);
    return;
  }

  if (g.phase === "steal") {
    if (g.liar === me) {
      box.innerHTML =
        '<div class="armory liar-wrap liar-center">' + liarHead("") +
          '<div class="liar-cat">정체 발각!</div>' +
          '<div class="liar-hero">📣</div>' +
          '<div class="liar-word liar-liar" style="font-size:24px">마지막 기회 —<br>단어를 입으로 크게 외쳐!</div>' +
          '<p class="liar-sub">보기 같은 건 없다. 맞히면 역전승.<br>판정은 시민들이 폰으로 한다.</p>' +
        "</div>";
    } else {
      box.innerHTML =
        '<div class="armory liar-wrap liar-center">' + liarHead("") +
          '<div class="liar-hero">🫣</div>' +
          '<p class="liar-sub"><b>' + esc(nameOf(g.liar)) + "</b>가 라이어로 지목됐다!<br>이제 입으로 단어를 외칠 거야 — 듣고 판정해.</p>" +
          '<div class="btn-row" style="margin-top:12px">' +
            '<button class="btn ghost" id="lr-miss" style="flex:1">❌ 틀렸다</button>' +
            '<button class="btn" id="lr-hit" style="flex:1">😱 맞혔다</button></div>' +
          '<p class="liar-sub" style="font-size:11px;opacity:.75">아무나 한 명이 누르면 전원 확정 — 양심껏</p>' +
        "</div>";
      bind("#lr-hit", () => liarJudge(true));
      bind("#lr-miss", () => liarJudge(false));
    }
    return;
  }

  if (g.phase === "done") {
    const votes = g.votes_j || {};
    const counts = {};
    ps.forEach((p) => counts[p] = 0);
    Object.keys(votes).forEach((k) => { if (counts[votes[k]] !== undefined) counts[votes[k]]++; });
    const maxV = Math.max.apply(null, ps.map((p) => counts[p]).concat([1]));
    const citWin = g.outcome === "citizens";
    box.innerHTML =
      '<div class="armory liar-wrap">' + liarHead("") +
        '<div class="liar-banner ' + (citWin ? "cit" : "liar") + '">' + (citWin ? "🕵️ 시민 승리" : "🎭 라이어 승리") + "</div>" +
        '<p class="liar-reveal">라이어는 <b>' + esc(nameOf(g.liar)) + "</b> · 단어는 <b>" + esc(g.word) + "</b>" +
          (g.steal_pick ? "<br>마지막 외침: " + (g.steal_pick === "hit" ? "<b>적중</b> 😱 역전!" : "<b>오답</b> — 발악 실패") : "") + "</p>" +
        '<div class="tally">' + ps.map((p) =>
          '<div class="tally-row"><span class="tally-n">' + esc(nameOf(p)) + (p === g.liar ? " 🎭" : "") + "</span>" +
          '<span class="tally-bar"><i style="width:' + Math.round((counts[p] / maxV) * 100) + '%"></i></span><b>' + counts[p] + "표</b></div>"
        ).join("") + "</div>" +
        '<p class="liar-sub" style="margin-top:10px">' + (citWin ? "시민 전원 ✨2배 쿠폰 10장씩 (무기 + 캐릭터)" : "라이어에게 💥10배 쿠폰 10장") + "</p>" +
        '<div class="btn-row" style="margin-top:12px">' +
          '<button class="btn ghost" id="lr-again" style="flex:1">🎭 한 판 더</button>' +
          '<button class="btn" id="lr-x2" style="flex:1">닫기</button></div>' +
      "</div>";
    bind("#lr-again", () => { localStorage.setItem("kel_lr_seen", String(g.id)); liarCreate(); });
    bind("#lr-x2", () => { localStorage.setItem("kel_lr_seen", String(g.id)); liarClose(); });
    return;
  }
}

function bind(sel, fn) { const el = document.querySelector(sel); if (el) el.onclick = fn; }

async function liarCreate() {
  if (needSb() || !me) return;
  const { error } = await sb.from("liar_games").insert({ host: me, players: [me], phase: "lobby" });
  if (error) { toast("판 생성 실패 — LIAR-SQL 돌렸어?"); return; }
  sendPush("🎭 라이어 게임", nameOf(me) + "이(가) 판 열었다 — RADIO 탭에서 조인!", "liar");
  liarRefresh();
}

async function liarJoin() {
  if (!sb || !liarG) return;
  for (let i = 0; i < 3; i++) {
    const { data } = await sb.from("liar_games").select("*").eq("id", liarG.id).limit(1);
    const g = data && data[0];
    if (!g || g.phase !== "lobby") return liarRefresh();
    if (g.players.indexOf(me) >= 0) { liarG = g; return liarRender(); }
    await sb.from("liar_games").update({ players: g.players.concat([me]) }).eq("id", g.id).eq("phase", "lobby");
    await new Promise((r) => setTimeout(r, 250 + Math.random() * 350));
  }
  liarRefresh();
}

async function liarStart() {
  const g = liarG;
  if (!sb || !g || g.phase !== "lobby" || g.players.length < 4) return;
  const recent = JSON.parse(localStorage.getItem("kel_liar_recent") || "[]");
  let pool = LIAR_WORDS.filter((x) => recent.indexOf(x.w) < 0);
  if (!pool.length) pool = LIAR_WORDS;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const liar = g.players[Math.floor(Math.random() * g.players.length)];
  const { data, error } = await sb.from("liar_games").update({
    phase: "play", word: pick.w, category: pick.c, liar: liar, start_at: new Date().toISOString(),
  }).eq("id", g.id).eq("phase", "lobby").select();
  if (!error && data && data.length) {
    localStorage.setItem("kel_liar_recent", JSON.stringify([pick.w].concat(recent).slice(0, 10)));
    sendPush("🎭 라이어 게임 시작", "3초 뒤 단어 공개 — 폰 봐!", "liar");
  }
  liarRefresh();
}

async function liarDone() {
  if (!sb || !liarG || liarG.phase !== "play") return;
  for (let i = 0; i < 3; i++) {
    const { data } = await sb.from("liar_games").select("*").eq("id", liarG.id).limit(1);
    const g = data && data[0];
    if (!g || g.phase !== "play") return liarRefresh();
    const done = g.done_j || [];
    if (done.indexOf(me) < 0) {
      await sb.from("liar_games").update({ done_j: done.concat([me]) }).eq("id", g.id).eq("phase", "play");
      await new Promise((r) => setTimeout(r, 250 + Math.random() * 350));
      continue;
    }
    // 전원 끝났으면 투표로 전환 (한 명만 성공)
    if (g.players.every((p) => done.indexOf(p) >= 0)) {
      await sb.from("liar_games").update({ phase: "vote" }).eq("id", g.id).eq("phase", "play");
    }
    return liarRefresh();
  }
  liarRefresh();
}

async function liarVote(target) {
  if (!sb || !liarG || liarG.phase !== "vote") return;
  buzz([25]);
  for (let i = 0; i < 3; i++) {
    const { data } = await sb.from("liar_games").select("*").eq("id", liarG.id).limit(1);
    const g = data && data[0];
    if (!g || g.phase !== "vote") return liarRefresh();
    const votes = Object.assign({}, g.votes_j || {});
    votes[me] = target;
    await sb.from("liar_games").update({ votes_j: votes }).eq("id", g.id).eq("phase", "vote").eq("vround", g.vround || 1);
    const { data: d2 } = await sb.from("liar_games").select("*").eq("id", liarG.id).limit(1);
    const g2 = d2 && d2[0];
    if (g2 && g2.phase === "vote" && (g2.votes_j || {})[me] === target) { liarG = g2; liarSettle(g2); return liarRender(); }
  }
  liarRefresh();
}

async function liarSettle(g) {
  // 전원 투표 완료 시 판정 — 조건부 업데이트라 한 폰만 성공한다
  const ps = g.players, votes = g.votes_j || {};
  if (!ps.every((p) => votes[p])) return;
  const counts = {};
  ps.forEach((p) => counts[p] = 0);
  ps.forEach((p) => { const t = votes[p]; if (counts[t] !== undefined) counts[t]++; });
  let top = null, max = -1, tie = false;
  ps.forEach((p) => { if (counts[p] > max) { max = counts[p]; top = p; tie = false; } else if (counts[p] === max) tie = true; });
  const vr = g.vround || 1;
  if (tie) {
    if (vr >= 2) await sb.from("liar_games").update({ phase: "done", outcome: "liar" }).eq("id", g.id).eq("phase", "vote").eq("vround", vr);
    else await sb.from("liar_games").update({ votes_j: {}, vround: 2 }).eq("id", g.id).eq("phase", "vote").eq("vround", 1);
  } else if (top === g.liar) {
    await sb.from("liar_games").update({ phase: "steal" }).eq("id", g.id).eq("phase", "vote").eq("vround", vr);
  } else {
    await sb.from("liar_games").update({ phase: "done", outcome: "liar" }).eq("id", g.id).eq("phase", "vote").eq("vround", vr);
  }
  liarRefresh();
}

function liarOpts(g) {
  const same = LIAR_WORDS.filter((x) => x.c === g.category && x.w !== g.word).map((x) => x.w);
  let s = (Number(g.id) || 1) * 7 + 13;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const cp = same.slice(), d = [];
  while (d.length < 3 && cp.length) d.push(cp.splice(Math.floor(rnd() * cp.length), 1)[0]);
  const opts = d.concat([g.word]);
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = opts[i]; opts[i] = opts[j]; opts[j] = t; }
  return opts;
}

async function liarJudge(hit) {
  if (!sb || !liarG || liarG.phase !== "steal" || liarG.liar === me) return;
  await sb.from("liar_games").update({
    steal_pick: hit ? "hit" : "miss", outcome: hit ? "liar" : "citizens", phase: "done",
  }).eq("id", liarG.id).eq("phase", "steal");
  liarRefresh();
}

function liarReward() {
  const g = liarG;
  if (!g || g.phase !== "done" || !g.outcome) return;
  const key = "kel_lr_paid_" + g.id;
  if (localStorage.getItem(key)) return;
  if (liarPlayers().indexOf(me) < 0) return;
  localStorage.setItem(key, "1");
  if (g.outcome === "citizens" && me !== g.liar) {
    addWb2(10);
    localStorage.setItem("kel_coupon", String(coupons() + 10));
    toast("🕵️ 시민 승리 — ✨2배 쿠폰: 무기 10장 + 캐릭터 10장");
    try { specialFx("cupburst", "#E3B457", 4); } catch (e) {}
  } else if (g.outcome === "liar" && me === g.liar) {
    addUb10(10);
    toast("🎭 완전 범죄 — 💥10배 쿠폰 10장 (무기·캐릭터 아무 데나)");
    try { specialFx("ascend", "#F5E08A", 5); } catch (e) {}
  }
  buzz([50, 40, 90]);
}

/* ---------------- RADIO 탭 카드 ---------------- */
function liarCardHtml() {
  const g = liarG, act = g && g.phase !== "done";
  return '<div class="liar-card"><div class="lc-l"><span class="lc-em">🎭</span><div>' +
    '<div class="lc-t">라이어 게임</div>' +
    '<div class="lc-s">' + (act ? (g.phase === "lobby" ? "판 열림 — " + g.players.length + "명 대기 중" : "진행 중!") : "말로 설명, 폰으로 투표 — 이기면 배수 쿠폰") + "</div></div></div>" +
    '<button class="btn' + (act ? "" : " ghost") + ' lc-btn" id="liar-open">' + (act ? "참여" : "새 판") + "</button></div>";
}

/* ---------------- 전역 클릭 위임 + 부팅 ---------------- */
document.addEventListener("click", (e) => {
  if (e.target.closest && e.target.closest("#liar-open")) { openLiar(); return; }
  const bb = e.target.closest && e.target.closest("[data-bm]");
  if (bb) {
    const host = bb.closest("#wbox") || bb.closest("#armorybox");
    if (host) host.hidden = true;
    openWeapon(bb.dataset.bm);
  }
});

function kelV33Init() {
  rushPill();
  setInterval(rushTick, 1000);
  liarInit();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", kelV33Init);
else kelV33Init();

/* ============================================================
   v35 — 마법사 대전 업데이트 (여행 종료 → 상시 게임 앱)
   FX 2.0(WebGL+Canvas) · 주문 수집 · 실시간 배틀 · 도적의 지도
   ============================================================ */

/* ---------------- FX 2.0 — 이중 렌더러 엔진 ---------------- */
var FX2 = (function () {
  var cv, gl, ctx2, W2 = 0, H2 = 0, dpr = 1, mode = "none";
  var parts = [], pool = [], MAXP = 420, running = false, lastT = 0;
  var trauma = 0, hitUntil = 0, timeScale = 1;
  var glProg, glBuf, glLoc = {};

  function mount() {
    if (cv) return;
    cv = document.createElement("canvas");
    cv.id = "fx2";
    cv.style.cssText = "position:fixed;inset:0;z-index:640;pointer-events:none;mix-blend-mode:screen";
    document.body.appendChild(cv);
    resize();
    window.addEventListener("resize", resize);
    // WebGL 우선, 실패하면 2D 폴백 — API는 동일
    try {
      gl = cv.getContext("webgl2", { alpha: true, premultipliedAlpha: true }) ||
           cv.getContext("webgl", { alpha: true, premultipliedAlpha: true });
      if (gl) initGL();
    } catch (e) { gl = null; }
    if (gl && glProg) mode = "gl";
    else { ctx2 = cv.getContext("2d"); mode = "2d"; }
    cv.addEventListener("webglcontextlost", function (e) {
      e.preventDefault(); gl = null; glProg = null; ctx2 = cv.getContext("2d"); mode = "2d";
    });
  }
  function resize() {
    if (!cv) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W2 = cv.width = Math.round(innerWidth * dpr);
    H2 = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    if (gl) gl.viewport(0, 0, W2, H2);
  }
  function initGL() {
    var vs = "attribute vec2 p;attribute float s;attribute vec4 c;varying vec4 vc;uniform vec2 r;" +
      "void main(){vc=c;gl_PointSize=s;gl_Position=vec4(p/r*2.0-1.0,0.0,1.0);gl_Position.y*=-1.0;}";
    var fs = "precision mediump float;varying vec4 vc;void main(){vec2 d=gl_PointCoord-vec2(.5);" +
      "float a=smoothstep(.5,.06,length(d));float core=smoothstep(.24,.0,length(d));" +
      "vec3 col=mix(vc.rgb,vec3(1.0),core*.85);gl_FragColor=vec4(col*a*vc.a,a*vc.a);}";
    function sh(t, src) { var s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(s); return s; }
    glProg = gl.createProgram();
    gl.attachShader(glProg, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(glProg, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(glProg);
    if (!gl.getProgramParameter(glProg, gl.LINK_STATUS)) { glProg = null; return; }
    gl.useProgram(glProg);
    glBuf = gl.createBuffer();
    glLoc.p = gl.getAttribLocation(glProg, "p");
    glLoc.s = gl.getAttribLocation(glProg, "s");
    glLoc.c = gl.getAttribLocation(glProg, "c");
    glLoc.r = gl.getUniformLocation(glProg, "r");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // additive-ish premultiplied
  }
  function hex(c) {
    var n = parseInt((c || "#ffffff").replace("#", ""), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }
  function P2() { return pool.pop() || {}; }
  function spawn(o) {
    if (parts.length >= MAXP) { pool.push(parts.shift()); }
    var p = P2();
    p.x = o.x; p.y = o.y; p.vx = o.vx || 0; p.vy = o.vy || 0;
    p.g = o.g || 0; p.drag = o.drag == null ? 0.995 : o.drag;
    p.life = p.life0 = o.life || 0.9;
    p.sz = o.sz || 6; p.c = o.c || "#fff"; p.rgb = hex(p.c);
    p.tw = o.tw || 0; p.turb = o.turb || 0; p.stretch = o.stretch || 0;
    p.seed = Math.random() * 6.28;
    parts.push(p);
    kick();
  }
  function kick() {
    if (running) return;
    running = true; lastT = performance.now();
    requestAnimationFrame(loop);
  }
  function loop(t) {
    var dt = Math.min(0.05, (t - lastT) / 1000); lastT = t;
    var ts = performance.now() < hitUntil ? 0.22 : 1; // 히트스톱
    dt *= ts * timeScale;
    // 트라우마 셰이크 (지수 감쇠 + 미세 회전)
    if (trauma > 0.003) {
      trauma *= Math.pow(0.86, dt * 60);
      var sh2 = trauma * trauma;
      document.body.style.transform = "translate(" + ((Math.random() * 2 - 1) * 14 * sh2) + "px," +
        ((Math.random() * 2 - 1) * 10 * sh2) + "px) rotate(" + ((Math.random() * 2 - 1) * 1.4 * sh2) + "deg)";
    } else if (trauma !== 0) { trauma = 0; document.body.style.transform = ""; }

    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.life -= dt;
      if (p.life <= 0) { pool.push(p); parts.splice(i, 1); continue; }
      if (p.turb) { p.vx += Math.sin(t / 300 + p.seed) * p.turb * dt * 60; }
      p.vy += p.g * dt * 60;
      p.vx *= p.drag; p.vy *= p.drag;
      p.x += p.vx * dt * 60; p.y += p.vy * dt * 60;
    }
    draw();
    if (parts.length || trauma > 0.003) requestAnimationFrame(loop);
    else { running = false; clear(); document.body.style.transform = ""; }
  }
  function clear() {
    if (mode === "gl" && gl) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
    else if (ctx2) ctx2.clearRect(0, 0, W2, H2);
  }
  var buf = new Float32Array(MAXP * 7);
  function draw() {
    if (mode === "gl" && gl && glProg) {
      // 잔상 트레일: 프레임을 지우지 않고 어두운 사각형으로 살짝 덮는다
      gl.blendFunc(gl.ZERO, gl.SRC_ALPHA); // dst *= alpha
      fadeQuad(0.86);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      var n = 0;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], a = Math.min(1, p.life / p.life0 * 1.4);
        var k = n * 7;
        buf[k] = p.x * dpr; buf[k + 1] = p.y * dpr;
        buf[k + 2] = (p.sz + (p.tw ? Math.sin(lastT / 60 + p.seed) * p.tw : 0)) * dpr;
        buf[k + 3] = p.rgb[0]; buf[k + 4] = p.rgb[1]; buf[k + 5] = p.rgb[2]; buf[k + 6] = a;
        n++;
      }
      gl.useProgram(glProg);
      gl.uniform2f(glLoc.r, W2, H2);
      gl.bindBuffer(gl.ARRAY_BUFFER, glBuf);
      gl.bufferData(gl.ARRAY_BUFFER, buf.subarray(0, n * 7), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(glLoc.p); gl.vertexAttribPointer(glLoc.p, 2, gl.FLOAT, false, 28, 0);
      gl.enableVertexAttribArray(glLoc.s); gl.vertexAttribPointer(glLoc.s, 1, gl.FLOAT, false, 28, 8);
      gl.enableVertexAttribArray(glLoc.c); gl.vertexAttribPointer(glLoc.c, 4, gl.FLOAT, false, 28, 12);
      gl.drawArrays(gl.POINTS, 0, n);
    } else if (ctx2) {
      ctx2.globalCompositeOperation = "destination-in";
      ctx2.fillStyle = "rgba(0,0,0,0.86)";
      ctx2.fillRect(0, 0, W2, H2);
      ctx2.globalCompositeOperation = "lighter";
      for (var j = 0; j < parts.length; j++) {
        var q = parts[j], al = Math.min(1, q.life / q.life0 * 1.4);
        var sz = (q.sz + (q.tw ? Math.sin(lastT / 60 + q.seed) * q.tw : 0)) * dpr * 0.5;
        var sp = Math.hypot(q.vx, q.vy);
        ctx2.save();
        ctx2.translate(q.x * dpr, q.y * dpr);
        if (q.stretch && sp > 2) { ctx2.rotate(Math.atan2(q.vy, q.vx)); ctx2.scale(1 + sp * 0.12, 1); }
        var g2 = ctx2.createRadialGradient(0, 0, 0, 0, 0, sz);
        g2.addColorStop(0, "rgba(255,255,255," + (0.9 * al) + ")");
        g2.addColorStop(0.35, q.c);
        g2.addColorStop(1, "rgba(0,0,0,0)");
        ctx2.globalAlpha = al;
        ctx2.fillStyle = g2;
        ctx2.beginPath(); ctx2.arc(0, 0, sz, 0, 6.283); ctx2.fill();
        ctx2.restore();
      }
      ctx2.globalAlpha = 1;
    }
  }
  var fadeBuf;
  function fadeQuad(alpha) {
    // 화면 전체를 point 하나로 덮을 수 없으니 거대 포인트 하나로 근사
    if (!fadeBuf) fadeBuf = gl.createBuffer();
    var m = Math.max(W2, H2) * 2.2;
    var arr = new Float32Array([W2 / 2, H2 / 2, m, 0, 0, 0, alpha]);
    gl.useProgram(glProg);
    gl.uniform2f(glLoc.r, W2, H2);
    gl.bindBuffer(gl.ARRAY_BUFFER, fadeBuf);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(glLoc.p); gl.vertexAttribPointer(glLoc.p, 2, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(glLoc.s); gl.vertexAttribPointer(glLoc.s, 1, gl.FLOAT, false, 28, 8);
    gl.enableVertexAttribArray(glLoc.c); gl.vertexAttribPointer(glLoc.c, 4, gl.FLOAT, false, 28, 12);
    gl.drawArrays(gl.POINTS, 0, 1);
  }

  /* ---- 상위 프리미티브 ---- */
  function burst(x, y, o) {
    o = o || {};
    var n = o.n || 40;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.283, sp = (o.sp || 7) * (0.3 + Math.random());
      spawn({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0),
        g: o.g || 0.12, life: (o.life || 0.9) * (0.6 + Math.random() * 0.7),
        sz: (o.sz || 9) * (0.5 + Math.random()), c: o.c, drag: 0.965, stretch: 1, tw: 2, turb: o.turb || 0 });
    }
  }
  function beamTo(x1, y1, x2, y2, o) {
    o = o || {};
    var n = o.n || 26, dx = x2 - x1, dy = y2 - y1;
    for (var i = 0; i < n; i++) {
      var t = i / n;
      spawn({ x: x1 + dx * t + (Math.random() - 0.5) * 10, y: y1 + dy * t + (Math.random() - 0.5) * 10,
        vx: dx * 0.012, vy: dy * 0.012, life: 0.5 + t * 0.4, sz: o.sz || 10, c: o.c, drag: 0.94, stretch: 1 });
    }
  }
  function ring(x, y, o) {
    o = o || {};
    var n = o.n || 46;
    for (var i = 0; i < n; i++) {
      var a = i / n * 6.283, sp = o.sp || 9;
      spawn({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 0,
        life: o.life || 0.55, sz: o.sz || 7, c: o.c, drag: 0.9, stretch: 1 });
    }
  }
  function arc(x1, y1, x2, y2, c, depth) {
    // 미드포인트 변위 — 전기 아크
    var pts = [[x1, y1], [x2, y2]];
    for (var d = 0; d < (depth || 5); d++) {
      var nx = [pts[0]];
      for (var i = 1; i < pts.length; i++) {
        var mx = (pts[i - 1][0] + pts[i][0]) / 2 + (Math.random() - 0.5) * 60 / (d + 1);
        var my = (pts[i - 1][1] + pts[i][1]) / 2 + (Math.random() - 0.5) * 60 / (d + 1);
        nx.push([mx, my], pts[i]);
      }
      pts = nx;
    }
    for (var k = 0; k < pts.length; k++)
      spawn({ x: pts[k][0], y: pts[k][1], vx: 0, vy: 0, life: 0.22 + Math.random() * 0.15, sz: 8, c: c, drag: 1, tw: 3 });
  }
  var glyphCache = {};
  function glyphPts(gy, step) {
    var key = gy + "|" + step;
    if (glyphCache[key]) return glyphCache[key];
    var c = document.createElement("canvas"); c.width = c.height = 120;
    var x = c.getContext("2d");
    x.font = "100px serif"; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText(gy, 60, 66);
    var d = x.getImageData(0, 0, 120, 120).data, out = [];
    for (var yy = 0; yy < 120; yy += step) for (var xx = 0; xx < 120; xx += step)
      if (d[(yy * 120 + xx) * 4 + 3] > 120) out.push([xx / 120 - 0.5, yy / 120 - 0.5]);
    glyphCache[key] = out;
    return out;
  }
  function glyphBurst(gy, x, y, o) {
    // 이모지 실루엣 점군 — 파티클이 모양대로 서서히 나타났다 흩어짐
    o = o || {};
    var pts = glyphPts(gy, o.step || 5), sc = o.scale || 260;
    for (var i = 0; i < pts.length; i++) {
      var tx = x + pts[i][0] * sc, ty = y + pts[i][1] * sc;
      spawn({ x: tx + (Math.random() - 0.5) * 8, y: ty + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 0.6, vy: -0.3 - Math.random() * 0.5,
        g: -0.01, life: (o.life || 1.6) * (0.7 + Math.random() * 0.5),
        sz: o.sz || 6, c: o.c || "#BFE9FF", drag: 0.985, tw: 2, turb: 0.4 });
    }
  }
  function flash(color, ms) {
    var f = document.getElementById("fx2flash");
    if (!f) { f = document.createElement("div"); f.id = "fx2flash"; document.body.appendChild(f); }
    f.style.background = color || "#fff";
    f.classList.remove("go"); void f.offsetWidth; f.classList.add("go");
    if (ms) f.style.setProperty("--fd", ms + "ms");
  }
  function stamp(txt, color) {
    var s = document.createElement("div");
    s.className = "fx2stamp";
    s.style.color = color || "#DFF7E4";
    s.innerHTML = String(txt).split("").map(function (ch, i) {
      return "<span style='animation-delay:" + (i * 0.05) + "s'>" + ch + "</span>";
    }).join("");
    document.body.appendChild(s);
    setTimeout(function () { s.remove(); }, 2600);
  }
  function shake(n) { trauma = Math.min(1, trauma + n); kick(); }
  function hitstop(ms) { hitUntil = performance.now() + (ms || 180); }
  function envGlow(color) { try { edgeGlow(color, true); } catch (e) {} }
  function center() { return [innerWidth / 2, innerHeight / 2]; }

  /* ---- 주문 연출 프리셋: 예열→발사→비행→임팩트→잔향 ---- */
  function cast(spellId, o) {
    o = o || {};
    mount();
    var sp = (typeof spellById !== "undefined" && spellById[spellId]) || { em: "✨", c: "#EDE0B8", ko: spellId };
    var c = sp.c || "#EDE0B8";
    var cx = o.x != null ? o.x : innerWidth / 2, cy = o.y != null ? o.y : innerHeight * 0.42;
    var from = o.from || [innerWidth / 2, innerHeight - 90];
    var lv = Math.max(1, o.lv || (typeof spLv === "function" ? spLv(spellId) : 1) || 1);
    var LM = 1 + 0.18 * (lv - 1);          // Lv당 +18% — Lv5면 파티클·반동 1.72배
    var big = sp.t >= 4 || spellId === "avada" || lv >= 4;
    // ① 예열
    ring(from[0], from[1], { c: c, sp: -3, n: 20, sz: 6, life: 0.4 });
    setTimeout(function () {
      // ② 발사 + ③ 비행
      flash(c, 140);
      beamTo(from[0], from[1], cx, cy, { c: c, n: Math.round((big ? 34 : 20) * LM), sz: big ? 12 : 8 });
      if (spellId === "crucio" || spellId === "sectumsempra") arc(from[0], from[1], cx, cy, c, 5);
      setTimeout(function () {
        // ④ 임팩트
        if (big) { hitstop(spellId === "avada" ? 240 : Math.round(140 + lv * 12)); flash("#FFFFFF", 90); }
        burst(cx, cy, { c: c, n: Math.round((big ? 90 : 45) * LM), sp: (big ? 11 : 7) * (1 + 0.08 * (lv - 1)), sz: big ? 11 : 8, up: 1 });
        ring(cx, cy, { c: c, sp: (big ? 13 : 8) * LM, n: 54 });
        if (lv >= 3) setTimeout(function () { ring(cx, cy, { c: "#FFFFFF", sp: 15 * LM, n: 40, sz: 5 }); }, 140);
        if (lv >= 5) { flash(c, 160); setTimeout(function () { glyphBurst(sp.em, cx, cy - 30, { c: c, scale: 200, life: 1.4 }); }, 220); }
        shake((big ? 0.55 : 0.28) * (1 + 0.12 * (lv - 1)));
        envGlow(c);
        // ⑤ 잔향 + 시그니처
        if (spellId === "avada") { glyphBurst("💀", cx, cy - 20, { c: "#7CFF9E", scale: 230 }); stamp("AVADA KEDAVRA", "#7CFF9E"); }
        else if (spellId === "patronum") glyphBurst("🦌", cx, cy - 10, { c: "#BFE9FF", scale: 300, life: 2.1 });
        else if (spellId === "fiendfyre") glyphBurst("🐍", cx, cy, { c: "#FF8A3C", scale: 280 });
        else if (spellId === "imperio") glyphBurst("🌀", cx, cy, { c: c, scale: 200 });
        else if (spellId === "wingardium") liftUI(1800);
        else if (spellId === "expelliarmus") stamp("EXPELLIARMUS", "#FF6A5E");
        for (var i = 0; i < Math.round((big ? 26 : 12) * LM); i++)
          spawn({ x: cx + (Math.random() - 0.5) * 90, y: cy + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5), vy: -0.6 - Math.random(), g: -0.02,
            life: 1.4, sz: 7, c: c, drag: 0.99, turb: 0.8, tw: 2 });
        if (o.done) setTimeout(o.done, 500);
      }, 260);
    }, o.quick ? 60 : 340);
  }
  function liftUI(ms) {
    document.body.classList.add("forcelift");
    setTimeout(function () { document.body.classList.remove("forcelift"); }, ms || 1800);
  }
  return { mount: mount, burst: burst, ring: ring, beamTo: beamTo, arc: arc, glyphBurst: glyphBurst,
    flash: flash, stamp: stamp, shake: shake, hitstop: hitstop, cast: cast, liftUI: liftUI,
    mode: function () { return mode; } };
})();

/* 캐릭터 시그니처를 FX2로 증폭 (신규 초월·신화) */
function FX2C(c) {
  try {
    FX2.mount();
    var cx = innerWidth / 2, cy = innerHeight * 0.42;
    if (c.id === "riddle") { FX2.hitstop(220); FX2.flash("#183A22", 160); FX2.arc(cx - 150, 60, cx, cy, "#57E07A", 6); FX2.arc(cx + 150, 60, cx, cy, "#57E07A", 6); FX2.glyphBurst("🐍", cx, cy, { c: "#7CFF9E", scale: 320, life: 2 }); FX2.stamp("I AM LORD VOLDEMORT", "#7CFF9E"); FX2.shake(0.6); }
    else if (c.id === "sauron") { FX2.flash("#3A0E00", 180); FX2.glyphBurst("👁️", cx, cy - 10, { c: "#FF7A2E", scale: 330, life: 2.2 }); FX2.ring(cx, cy, { c: "#FF7A2E", sp: 14, n: 70 }); FX2.stamp("THE GREAT EYE", "#FF9A4E"); FX2.shake(0.6); }
    else if (c.id === "saruman") { FX2.flash("#EDEDED", 130); FX2.burst(cx, cy, { c: "#F2F2F2", n: 80, sp: 10, sz: 10 }); FX2.glyphBurst("🗼", cx, cy, { c: "#DADADA", scale: 300 }); }
    else if (c.t >= 5) { FX2.burst(cx, cy, { c: "#F2C744", n: 60, sp: 9, sz: 10, up: 1 }); FX2.shake(0.35); }
  } catch (e) {}
}

/* ---------------- 주문 도감 ---------------- */
function SP(id, ko, en, em, t, kind, pow, c, d) { return { id: id, ko: ko, en: en, em: em, t: t, kind: kind, pow: pow, c: c, d: d }; }
var SPELLS = [
  SP("avada","아바다 케다브라","Avada Kedavra","☠️",5,"kill",999,"#57E07A","즉사 · 평생 10발 · 성공 시 1발 환급 · 익스펠리아르무스만이 막는다"),
  SP("patronum","익스펙토 패트로눔","Expecto Patronum","🦌",5,"guard",0,"#BFE9FF","다음에 맞을 공격 1회 완전 무효 + HP 12 회복 (아바다는 못 막음)"),
  SP("fiendfyre","피엔디파이어","Fiendfyre","🔥",5,"atk",34,"#FF8A3C","저주받은 불 — 최고 화력"),
  SP("crucio","크루시오","Crucio","🩸",4,"dot",8,"#E0453C","고문 저주 — 3턴간 매턴 8 도트 피해"),
  SP("sectumsempra","세크텀셈프라","Sectumsempra","🗡️",4,"dot2",10,"#B03A6E","즉시 8 + 3턴 출혈 10 (스네이프 각성 시 위력 ↑)"),
  SP("imperio","임페리오","Imperio","🌀",4,"ctrl",6,"#9A6BC4","상대의 다음 주문을 랜덤으로 강제"),
  SP("expelliarmus","익스펠리아르무스","Expelliarmus","🪄",4,"counter",8,"#FF6A5E","아바다 케다브라 전용 카운터 · 지팡이당 10회 · 그 외엔 견제 8"),
  SP("obliviate","오블리비아테","Obliviate","💫",4,"forget",6,"#C4B0E8","상대가 배운 주문 하나를 이 판 동안 지운다 (록하트는 50% 자기 기절)"),
  SP("stupefy","스투페파이","Stupefy","🔻",3,"stun",14,"#E85D4A","14 피해 + 30% 확률로 상대 1턴 기절"),
  SP("bombarda","봄바다","Bombarda","💥",3,"atk",20,"#E8A23C","폭파 — 큰 한 방"),
  SP("reducto","리덕토","Reducto","🧱",3,"atk",16,"#C4763C","분쇄 저주"),
  SP("confringo","콘프링고","Confringo","🎇",3,"atk",17,"#FF6B2B","작열 폭발"),
  SP("levicorpus","레비코퍼스","Levicorpus","🙃",3,"weak",8,"#7FB8E8","거꾸로 매달기 — 상대 다음 주문 위력 절반"),
  SP("protego","프로테고","Protego","🛡️",2,"shield",0,"#8FD4F0","다음에 맞을 일반 공격 70% 경감 (아바다는 못 막음)"),
  SP("incendio","인센디오","Incendio","🔥",2,"atk",10,"#F08A3C","불꽃"),
  SP("wingardium","윙가르디움 레비오사","Wingardium Leviosa","🪶",2,"weak",6,"#C8E0A0","상대를 띄운다 — 다음 주문 위력 절반 (무전에선 화면이 떠오름)"),
  SP("petrificus","페트리피쿠스 토탈루스","Petrificus Totalus","🗿",2,"stun",6,"#A8A8A8","6 피해 + 20% 기절"),
  SP("riddikulus","리디큘러스","Riddikulus","😂",2,"atk",8,"#E8C43C","웃음 공격"),
  SP("lumos","루모스","Lumos","💡",1,"buff",0,"#F5E8A0","다음 내 주문 위력 +30%"),
  SP("rictusempra","릭투셈프라","Rictusempra","🤣",1,"atk",6,"#E8D07C","간지럼 저주"),
  SP("aguamenti","아구아멘티","Aguamenti","💧",1,"atk",5,"#7FB8E8","물줄기"),
  SP("alohomora","알로호모라","Alohomora","🔓",1,"atk",4,"#C4B07C","자물쇠 열기 — 급하면 때리는 용도"),
  SP("tarantallegra","타란탈레그라","Tarantallegra","🕺",1,"atk",5,"#E87CA0","막춤 저주"),
];
var spellById = {}; SPELLS.forEach(function (s) { spellById[s.id] = s; });

/* ---- 서버 상태 (spellbook · wiz_stats · battles) ---- */
var store35 = { spellbook: [], wstats: [], battles: [] };
function myBook() { return store35.spellbook.filter(function (r) { return r.member === me; }); }
function spLv(id) { var r = store35.spellbook.find(function (x) { return x.member === me && x.spell_id === id; }); return r ? r.lv : 0; }
function spellLvOf(m2, id) { var r = store35.spellbook.find(function (x) { return x.member === m2 && x.spell_id === id; }); return r ? r.lv : 1; }
function learned(m, id) { return store35.spellbook.some(function (x) { return x.member === m && x.spell_id === id; }); }
function statsOf(m) { return store35.wstats.find(function (x) { return x.member === m; }) || { member: m, xp: 0, ak_used: 0, ak_bonus: 0, exp_map: {}, wins: 0, losses: 0, streak: 0, sp_spent: 0 }; }
function lvOf(m) { return 1 + Math.floor(Math.sqrt(statsOf(m).xp / 15)); }
function spPoints() { var s = statsOf(me); return Math.max(0, lvOf(me) - 1 - (s.sp_spent || 0)); }
function akLeft(m) { var s = statsOf(m); return Math.max(0, 10 + (s.ak_bonus || 0) - (s.ak_used || 0)); }
function expelLeft(m) {
  var eq = typeof equippedOf === "function" ? equippedOf(m) : null;
  if (!eq) return 0;
  var s = statsOf(m); var used = (s.exp_map || {})[eq] || 0;
  return Math.max(0, 10 - used);
}
async function ensureStats() {
  if (!sb || !me) return;
  if (!store35.wstats.some(function (x) { return x.member === me; }))
    await sb.from("wiz_stats").upsert({ member: me }, { onConflict: "member" });
}
async function statPatch(patch) {
  if (!sb || !me) return;
  await ensureStats();
  await sb.from("wiz_stats").update(patch).eq("member", me);
  kelLoad35();
}
async function kelLoad35() {
  if (!sb) return;
  try {
    var r = await Promise.all([
      sb.from("spellbook").select("*"),
      sb.from("wiz_stats").select("*"),
      sb.from("battles").select("*").order("id", { ascending: false }).limit(12),
    ]);
    if (r[0].data) store35.spellbook = r[0].data;
    if (r[1].data) store35.wstats = r[1].data;
    if (r[2].data) store35.battles = r[2].data;
    battleWatch();
  } catch (e) {}
}

/* ---- 주문 티켓 (20분당 1장 · 최대 12) ---- */
var STICKET_MAX = 12;
function sTickets() {
  var n = Number(localStorage.getItem("kel_st") || 5);
  var last = Number(localStorage.getItem("kel_st_t") || Date.now());
  var gained = Math.floor((Date.now() - last) / 1200000);
  if (gained > 0) {
    n = Math.min(STICKET_MAX, n + gained);
    localStorage.setItem("kel_st", String(n));
    localStorage.setItem("kel_st_t", String(last + gained * 1200000));
  }
  if (!localStorage.getItem("kel_st_t")) localStorage.setItem("kel_st_t", String(Date.now()));
  return n;
}
function useSTicket() { var n = sTickets(); if (n <= 0) return false; localStorage.setItem("kel_st", String(n - 1)); return true; }
function addSTicket(k) { localStorage.setItem("kel_st", String(Math.min(STICKET_MAX, sTickets() + k))); }
function fillSTicket() { localStorage.setItem("kel_st", String(STICKET_MAX)); }

/* ---- 주문 뽑기 ---- */
function drawSpell(boost) {
  // 아바다는 절대 0.1% (부스트 시 ×배수), 나머지는 등급 확률
  var akP = 0.001 * (boost || 1);
  if (!learned(me, "avada") && Math.random() < akP) return spellById.avada;
  var ts = TIERS.filter(function (t) { return t.t <= 5; });
  var ws = ts.map(function (t) { return { t: t.t, p: boost && t.t >= 3 ? t.p * boost : t.p }; });
  var tot = ws.reduce(function (a, b) { return a + b.p; }, 0);
  var roll = Math.random() * tot, acc = 0, tier = 1;
  ws.slice().sort(function (a, b) { return a.p - b.p; }).forEach(function (w) { if (tier === 1 && (acc += w.p) >= roll) tier = w.t; });
  var pool = SPELLS.filter(function (s) { return s.t === tier && s.id !== "avada"; });
  if (!pool.length) pool = SPELLS.filter(function (s) { return s.id !== "avada"; });
  return pool[Math.floor(Math.random() * pool.length)];
}
async function grantSpell(s) {
  if (!sb || !me) return "";
  var cur = store35.spellbook.find(function (x) { return x.member === me && x.spell_id === s.id; });
  if (cur) {
    var nl = Math.min(5, (cur.lv || 1) + 1);
    if (nl === cur.lv) { return "이미 Lv.5 — 마력이 허공으로"; }
    await sb.from("spellbook").update({ lv: nl }).eq("member", me).eq("spell_id", s.id);
    kelLoad35();
    return "중복! → Lv." + nl + " 자동 강화";
  }
  await sb.from("spellbook").upsert({ member: me, spell_id: s.id, lv: 1 }, { onConflict: "member,spell_id" });
  kelLoad35();
  return "";
}
function openSpellDraw(mode) {
  if (!me) { toast("먼저 이름을 골라줘"); return openWho(); }
  var boost = 0;
  if (mode === "b10") { if (!useUb10()) return toast("💥 10배 쿠폰이 없어"); boost = 10; }
  else if (typeof rushActive === "function" && rushActive()) { /* 러시엔 주문도 무료 */ }
  else if (!useSTicket()) return toast("📜 주문 티켓이 없어 · 20분마다 1장");
  var s = drawSpell(boost);
  openPack({ em: s.em, ko: s.ko, last: s.en.split(" ")[0], first: s.en.split(" ").slice(1).join(" "), t: s.t, fx: "gold", holo: s.t >= 4 }, async function () {
    var note = await grantSpell(s);
    FX2.cast(s.id, { quick: true });
    drawSpellResult(s, note, mode);
  });
}
function drawSpellResult(s, note, mode) {
  var box = document.getElementById("spbox");
  if (!box) { box = document.createElement("div"); box.id = "spbox"; document.body.appendChild(box); }
  var t = tierById[s.t];
  box.hidden = false;
  box.innerHTML =
    '<div class="quiz-card"><button class="ovx" data-ovx>✕</button>' +
      '<div class="wres-em">' + s.em + "</div>" +
      '<div class="wres-name">' + esc(s.ko) + '</div>' +
      '<div class="wres-t" style="background:' + t.color + '">' + t.en + " · Lv." + (spLv(s.id) || 1) + "</div>" +
      '<p class="muted" style="margin:10px 0;font-size:12.5px;line-height:1.6">' + esc(s.d) + "</p>" +
      (note ? '<div class="title-coupon" style="margin:6px 0">' + esc(note) + "</div>" : "") +
      '<div class="btn-row" style="margin-top:12px">' +
        '<button class="btn ghost" id="sp-book" style="flex:1">📖 주문서</button>' +
        '<button class="btn" id="sp-again" style="flex:1">' + (mode === "b10" ? "💥 10배로 또" : "📜 한 번 더 (" + sTickets() + ")") + "</button></div>" +
    "</div>";
  $("#sp-again").onclick = function () { box.hidden = true; openSpellDraw(mode); };
  $("#sp-book").onclick = function () { box.hidden = true; openSpellbook(); };
}
function openSpellbook() {
  var box = document.getElementById("bookbox");
  if (!box) { box = document.createElement("div"); box.id = "bookbox"; document.body.appendChild(box); }
  var mine = myBook();
  var pts = spPoints();
  box.hidden = false;
  box.innerHTML =
    '<div class="armory"><button class="ovx" data-ovx>✕</button>' +
      '<div class="arm-top">주문서 <span>' + mine.length + " / " + SPELLS.length + "</span></div>" +
      '<div class="wiz-line">Lv.' + lvOf(me) + " 마법사 · XP " + statsOf(me).xp +
        (pts ? ' · <b style="color:var(--gold)">강화 포인트 ' + pts + "</b>" : "") +
        ' · ☠️' + akLeft(me) + " · 🪄" + expelLeft(me) + "</div>" +
      '<div class="arm-grid book-grid">' +
      SPELLS.map(function (s) {
        var have = mine.some(function (r) { return r.spell_id === s.id; });
        var t = tierById[s.t];
        return '<button class="arm-item sp-item' + (have ? "" : " lock") + '" data-sp="' + s.id + '" style="--rc:' + t.color + '">' +
          '<span class="ai-em">' + (have ? s.em : "❔") + "</span>" +
          '<span class="ai-ko">' + (have ? esc(s.ko) : "???") + "</span>" +
          '<span class="ai-t" style="background:' + t.color + '">' + t.en + "</span>" +
          (have && spLv(s.id) > 1 ? '<span class="ai-q">Lv' + spLv(s.id) + "</span>" : "") +
          "</button>";
      }).join("") + "</div>" +
      '<div class="btn-row" style="margin-top:14px">' +
        '<button class="btn" id="bk-draw" style="flex:1.3">📜 주문 뽑기 (' + sTickets() + ")</button>" +
        '<button class="btn ghost" id="bk-1099">💵 $10.99 풀충전</button></div>' +
      (ub10() > 0 ? '<button class="btn boost10" data-bm-sp="b10" style="width:100%;margin-top:8px">💥 10배 쿠폰 주문 뽑기 · ' + ub10() + "</button>" : "") +
    "</div>";
  $("#bk-draw").onclick = function () { box.hidden = true; openSpellDraw(); };
  $("#bk-1099").onclick = function () {
    if (!confirm("$10.99 — 주문 티켓 12장 풀충전 (진짜 결제 아님)")) return;
    fillSTicket(); sendPush("💸 " + nameOf(me) + "의 과금", "주문 티켓 풀충전 $10.99", "fate");
    toast("💸 결제 완료(가짜) — 📜 12장"); openSpellbook();
  };
  var b10 = box.querySelector("[data-bm-sp]");
  if (b10) b10.onclick = function () { box.hidden = true; openSpellDraw("b10"); };
  $$(".sp-item", box).forEach(function (b) {
    b.onclick = function () {
      var s = spellById[b.dataset.sp];
      var have = learned(me, s.id);
      if (!have) return toast("아직 못 배운 주문 — " + t5hint(s));
      openSpellDetail(s);
    };
  });
  function t5hint(s) { return s.t >= 5 ? "신화급이야, 행운을 빈다" : "뽑기로 배울 수 있어"; }
}
function openSpellDetail(s) {
  var box = document.getElementById("spbox");
  if (!box) { box = document.createElement("div"); box.id = "spbox"; document.body.appendChild(box); }
  var lv = spLv(s.id), t = tierById[s.t], pts = spPoints();
  box.hidden = false;
  box.innerHTML =
    '<div class="quiz-card"><button class="ovx" data-ovx>✕</button>' +
      '<div class="wres-em">' + s.em + "</div>" +
      '<div class="wres-name">' + esc(s.ko) + '</div>' +
      '<div class="wres-t" style="background:' + t.color + '">' + t.en + " · Lv." + lv + "</div>" +
      '<p class="muted" style="margin:10px 0;font-size:12.5px;line-height:1.6">' + esc(s.d) +
      (s.id === "avada" ? "<br><b>남은 발수 ☠️ " + akLeft(me) + " / 10</b>" : "") +
      (s.id === "expelliarmus" ? "<br><b>이 지팡이 남은 카운터 🪄 " + expelLeft(me) + " / 10</b>" : "") + "</p>" +
      '<div class="btn-row">' +
        '<button class="btn ghost" id="spd-fx" style="flex:1">✨ 이펙트 보기</button>' +
        (lv < 5 ? '<button class="btn' + (pts ? "" : " off") + '" id="spd-up" style="flex:1">⬆️ 강화 (포인트 ' + pts + ")</button>" : '<span class="btn off" style="flex:1">MAX</span>') +
      "</div></div>";
  $("#spd-fx").onclick = function () { FX2.cast(s.id); };
  var up = $("#spd-up");
  if (up) up.onclick = async function () {
    if (!spPoints()) return toast("강화 포인트가 없어 — 배틀에서 레벨을 올려");
    await sb.from("spellbook").update({ lv: lv + 1 }).eq("member", me).eq("spell_id", s.id);
    await statPatch({ sp_spent: (statsOf(me).sp_spent || 0) + 1 });
    toast("⬆️ " + s.ko + " Lv." + (lv + 1));
    openSpellDetail(s);
  };
}

/* ---------------- 마법사 배틀 — 실시간 턴제 ---------------- */
var btG = null, btCh = null, btTimer = null, btAnim = 0;
var EGGS = [
  { id:"neville", n:"검을 든 소년", d:"네빌 + 그리핀도르의 검 vs 톰 리들 — 위력 ×5, 리들의 아바다 환급 봉인" },
  { id:"mtdoom", n:"운명의 산", d:"절대 반지 장착 + 인센디오 vs 사우론 — 위력 ×6, 대신 사우론이 선공권" },
  { id:"priori", n:"프리오리 인칸타템", d:"해리 + 해리의 지팡이: 익스펠로 아바다를 막으면 그대로 반사" },
  { id:"molly", n:"NOT MY DAUGHTER", d:"몰리 vs 벨라트릭스 — 모든 위력 ×3" },
  { id:"lockhart", n:"기억이여 안녕", d:"록하트 + 오블리비아테 — 등급 무관 주문 삭제, 대신 50% 자기 기절" },
];
function eggSeen(id) { return localStorage.getItem("kel_egg_" + id) === "1"; }
function eggMark(id) { if (!eggSeen(id)) { localStorage.setItem("kel_egg_" + id, "1"); toast("🥚 이스터에그 발견 — 궁합표에 해금됨"); } }

function maxHp(m) { var c = charOf(m); return 90 + (c ? c.t * 14 : 14) + lvOf(m) * 4; }
function myBattles() {
  return store35.battles.filter(function (b) {
    if (b.a !== me && b.b !== me) return false;
    if (b.phase === "invite") return true;                       // 10분 스윕이 정리
    if (b.phase === "sched") return Date.now() < new Date(b.sched_at || b.created_at).getTime() + 7200000;
    if (b.phase === "play") return Date.now() - new Date(b.created_at).getTime() < 21600000;
    return false;
  });
}
function myPlay() { return myBattles().find(function (b) { return b.phase === "play"; }); }
function openWith(mid) { return myBattles().find(function (b) { return b.a === mid || b.b === mid; }); }
function dodgeOf(m) { return Math.min(5, statsOf(m).dodge || 0); }
function dodgeMul(m) { return 1 - 0.05 * dodgeOf(m); }           // HP·위력 -5%/스택 (최대 5)
function maxHpReal(m) { return Math.round(maxHp(m) * dodgeMul(m)); }
function dodgeBadge(m) { // 본인 눈에는 절대 안 보임
  return (m !== me && dodgeOf(m) > 0) ? ' <span class="bt-dodge" title="결투 신청 10분 무시 누적">👻×' + dodgeOf(m) + "</span>" : "";
}
function duelInvite(mid) {
  if (needSb()) return;
  if (!charOf(me) || !charOf(mid)) return toast("둘 다 캐릭터가 있어야 배틀 가능");
  if (openWith(mid)) return toast(nameOf(mid) + "와는 이미 잡혀 있어 — 끝나고 다시");
  if (!myBook().length) { toast("주문을 하나는 배워야 싸우지 — 주문서로 보낼게"); return openSpellbook(); }
  var box = document.getElementById("duelbox");
  if (!box) { box = document.createElement("div"); box.id = "duelbox"; document.body.appendChild(box); }
  box.hidden = false;
  box.innerHTML = '<div class="quiz-card"><button class="ovx" data-ovx>✕</button>' +
    '<div class="wres-em">⚔️</div><div class="wres-name">' + esc(nameOf(mid)) + '에게 결투 신청</div>' +
    '<p class="muted" style="font-size:12px;margin:8px 0">시간을 정해서 보내 — 상대가 <b>10분 안에</b> 수락/거절 안 하면 도주로 기록돼</p>' +
    '<div class="btn-row" style="flex-wrap:wrap;gap:8px">' +
    [["0","⚡ 지금 바로"],["30","🕐 30분 뒤"],["60","🕑 1시간 뒤"],["ev","🌙 오늘 20:00"]].map(function (x) {
      return '<button class="btn ghost" data-dw="' + x[0] + '" style="flex:1;min-width:40%">' + x[1] + "</button>";
    }).join("") + "</div>" +
    '<input class="input" id="dw-custom" placeholder="직접 입력 예: 21:30" style="margin-top:8px">' +
    '<button class="btn" id="dw-go" style="width:100%;margin-top:8px">직접 입력한 시간으로 신청</button></div>';
  function fire(when) { box.hidden = true; duelSend(mid, when); }
  $$("[data-dw]", box).forEach(function (b) {
    b.onclick = function () {
      var k = b.dataset.dw;
      if (k === "ev") { var d = new Date(); d.setHours(20, 0, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 1); return fire(d); }
      return fire(new Date(Date.now() + Number(k) * 60000));
    };
  });
  $("#dw-go").onclick = function () {
    var v = ($("#dw-custom").value || "").trim();
    var m2 = v.match(/^(\d{1,2}):(\d{2})$/);
    if (!m2) return toast("21:30 형식으로 써줘");
    var d = new Date(); d.setHours(Number(m2[1]), Number(m2[2]), 0, 0);
    if (d < new Date()) d.setDate(d.getDate() + 1);
    fire(d);
  };
}
async function duelSend(mid, when) {
  var st = { hp: {}, dot: {}, shield: {}, stun: {}, weak: {}, buff: {}, forget: {}, log: [] };
  st.hp[me] = maxHpReal(me); st.hp[mid] = maxHpReal(mid);   // 낙인 있으면 피통이 소리 없이 깎인 채 시작
  var ins = await sb.from("battles").insert({ a: me, b: mid, phase: "invite", state: st, sched_at: when.toISOString() }).select();
  if (ins.error) return toast("배틀 생성 실패 — SQL-v35 실행했어?");
  var hm = when.getHours().toString().padStart(2, "0") + ":" + when.getMinutes().toString().padStart(2, "0");
  var now = when - Date.now() < 90000;
  sendPush("⚔️ " + nameOf(me), nameOf(mid) + ", " + (now ? "지금 바로" : hm + "에") + " 결투다! 10분 안에 응답해라", "duel");
  toast("⚔️ 도전장 보냄 (" + (now ? "즉시" : hm) + ") — 10분 안에 무응답이면 도주 기록");
  kelLoad35();
}
async function sweepInvites() {
  // 10분 넘게 방치된 도전장 → 만료 + 받은 쪽에 도주 낙인 (경쟁 조건은 조건부 update로 1회만)
  var stale = store35.battles.filter(function (b) {
    return b.phase === "invite" && Date.now() - new Date(b.created_at).getTime() > 600000;
  });
  for (var i = 0; i < stale.length; i++) {
    var b = stale[i];
    var r = await sb.from("battles").update({ phase: "expired" }).eq("id", b.id).eq("phase", "invite").select();
    if (r.data && r.data.length) {
      var s = statsOf(b.b);
      await sb.from("wiz_stats").upsert({ member: b.b }, { onConflict: "member" });
      await sb.from("wiz_stats").update({ dodge: (s.dodge || 0) + 1 }).eq("member", b.b);
      if (b.a === me) toast("👻 " + nameOf(b.b) + " 도주 — 낙인이 새겨졌다");
    }
  }
  var ghost = store35.battles.filter(function (b) {
    return b.phase === "sched" && b.sched_at && Date.now() > new Date(b.sched_at).getTime() + 7200000;
  });
  for (var j = 0; j < ghost.length; j++)
    await sb.from("battles").update({ phase: "expired" }).eq("id", ghost[j].id).eq("phase", "sched");
  if (stale.length || ghost.length) kelLoad35();
}
function battleWatch() {
  sweepInvites();
  var list = myBattles();
  var play = myPlay();
  // 방금 끝난 판(결과 미확인) 우선 표시
  var justDone = store35.battles.find(function (b) {
    return (b.a === me || b.b === me) && b.phase === "done" &&
      localStorage.getItem("kel_bt_seen") !== String(b.id) &&
      Date.now() - new Date(b.created_at).getTime() < 21600000;
  });
  var g = play || justDone;
  if (g) {
    var changed = !btG || btG.id !== g.id || btG.turn !== g.turn || btG.phase !== g.phase ||
      JSON.stringify(g.state && g.state.log) !== JSON.stringify(btG.state && btG.state.log);
    btG = g;
    if (changed) openBattle();
  } else btG = null;
  renderBattleBanners(list.filter(function (b) { return !g || b.id !== g.id; }));
}
async function earlyGo(g) {
  // 예약전 조기 시작 — 내가 play 중이면 불가
  if (myPlay()) return toast("지금 싸우는 판부터 끝내");
  await sb.from("battles").update({ phase: "play" }).eq("id", g.id).in("phase", ["sched", "invite"]);
  FX2.flash("#C8503C", 200); FX2.shake(0.4);
  kelLoad35();
}
async function earlyPropose(g) {
  var st = g.state || {}; st.early = me;
  await sb.from("battles").update({ state: st }).eq("id", g.id).eq("phase", "sched");
  sendPush("⚡ " + nameOf(me), "예약 결투, 지금 바로 하자는데?", "duel");
  toast("⚡ 제안 보냄 — 상대가 ㄱㄱ 누르면 시작");
  kelLoad35();
}
var btBnTimer = null;
function renderBattleBanners(list) {
  var wrap = document.getElementById("duel-banners");
  clearInterval(btBnTimer);
  if (!list || !list.length) { if (wrap) wrap.remove(); return; }
  if (!wrap) { wrap = document.createElement("div"); wrap.id = "duel-banners"; document.body.appendChild(wrap); }
  function hmOf(g) { var d = new Date(g.sched_at || g.created_at); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
  function draw() {
    var rows = "";
    list.slice(0, 4).forEach(function (g) {
      var en = g.a === me ? g.b : g.a, hm = hmOf(g);
      if (g.phase === "invite" && g.b === me) {
        var left = Math.max(0, Math.ceil((new Date(g.created_at).getTime() + 600000 - Date.now()) / 1000));
        rows += '<div class="duel-row" data-bid="' + g.id + '">⚔️ <b>' + esc(nameOf(g.a)) + "</b> " + hm + " 신청 · <b>" +
          Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0") + "</b>" +
          '<span class="duel-acts"><button class="btn small" data-act="now">⚡ 지금</button>' +
          '<button class="btn small ghost" data-act="ok">예약 수락</button>' +
          '<button class="btn small ghost" data-act="no">거절</button></span></div>';
      } else if (g.phase === "invite") {
        rows += '<div class="duel-row muted2">⚔️ ' + esc(nameOf(g.b)) + " 응답 대기 (" + hm + ") — 10분 무응답이면 👻</div>";
      } else if (g.phase === "sched") {
        var lf = new Date(g.sched_at).getTime() - Date.now();
        var early = (g.state || {}).early;
        if (lf <= 0) {
          rows += '<div class="duel-row" data-bid="' + g.id + '">⚔️ <b>결투 시간!</b> vs ' + esc(nameOf(en)) +
            '<span class="duel-acts"><button class="btn small" data-act="enter">입장</button></span></div>';
        } else if (early && early !== me) {
          rows += '<div class="duel-row" data-bid="' + g.id + '">⚡ <b>' + esc(nameOf(en)) + "</b>: 지금 바로 하재!" +
            '<span class="duel-acts"><button class="btn small" data-act="enter">ㄱㄱ</button>' +
            '<button class="btn small ghost" data-act="keep">예약대로</button></span></div>';
        } else {
          var mn = Math.floor(lf / 60000), sc = Math.floor(lf % 60000 / 1000);
          rows += '<div class="duel-row" data-bid="' + g.id + '">⚔️ ' + hm + " vs " + esc(nameOf(en)) + " — <b>" +
            (mn > 99 ? mn + "분" : mn + ":" + String(sc).padStart(2, "0")) + "</b>" +
            '<span class="duel-acts">' + (early === me ? '<span class="muted2">⚡ 제안됨</span>' :
              '<button class="btn small ghost" data-act="early">⚡ 지금 하자</button>') + "</span></div>";
        }
      }
    });
    wrap.innerHTML = rows;
    $$(".duel-row [data-act]", wrap).forEach(function (b) {
      b.onclick = async function () {
        var row = b.closest(".duel-row"), g = list.find(function (x) { return String(x.id) === row.dataset.bid; });
        if (!g) return;
        var act = b.dataset.act;
        if (act === "no") { await sb.from("battles").update({ phase: "declined" }).eq("id", g.id).eq("phase", "invite"); kelLoad35(); }
        else if (act === "ok") {
          var immediate = new Date(g.sched_at || 0) - Date.now() < 90000;
          if (immediate && myPlay()) return toast("지금 싸우는 판부터 끝내 — 예약으로 잡아둘게") || sb.from("battles").update({ phase: "sched" }).eq("id", g.id).eq("phase", "invite").then(kelLoad35);
          await sb.from("battles").update({ phase: immediate ? "play" : "sched" }).eq("id", g.id).eq("phase", "invite");
          sendPush("⚔️ " + nameOf(me), "수락! " + (immediate ? "지금 바로 붙는다" : hmOf(g) + "에 보자"), "duel");
          kelLoad35();
        }
        else if (act === "now") { if (myPlay()) return toast("지금 싸우는 판부터 끝내"); await sb.from("battles").update({ phase: "play" }).eq("id", g.id).eq("phase", "invite"); sendPush("⚡ " + nameOf(me), "바로 붙자!", "duel"); kelLoad35(); }
        else if (act === "enter") { earlyGo(g); }
        else if (act === "early") { earlyPropose(g); }
        else if (act === "keep") { var st = g.state || {}; delete st.early; await sb.from("battles").update({ state: st }).eq("id", g.id); toast("예약 시간대로 간다"); kelLoad35(); }
      };
    });
  }
  draw();
  btBnTimer = setInterval(draw, 1000);
}
function foe() { return btG.a === me ? btG.b : btG.a; }
function myPickCol() { return btG.a === me ? "pick_a" : "pick_b"; }
function hpBar(m, hp) {
  var mx = m === me ? maxHp(m) : maxHpReal(m);   // 본인은 낙인 반영 안 된 정가로 표시 (피만 살짝 까져 보임)
  var pct = Math.max(0, Math.min(100, Math.round(hp / mx * 100)));
  return '<div class="bt-side"><div class="bt-name">' + av(m, "mini") + " " + esc(nameOf(m)) +
    ' <span class="bt-lv">Lv.' + lvOf(m) + "</span>" + dodgeBadge(m) + "</div>" +
    '<div class="bt-hp"><i style="width:' + pct + '%;background:' + (pct > 50 ? "#5E8C5A" : pct > 25 ? "#C79A3E" : "#C8503C") + '"></i></div>' +
    '<div class="bt-hpn">' + Math.max(0, Math.round(hp)) + " / " + mx + "</div></div>";
}
function openBattle() {
  var g = btG; if (!g) return;
  var box = document.getElementById("btbox");
  if (!box) { box = document.createElement("div"); box.id = "btbox"; document.body.appendChild(box); }
  box.hidden = false;
  var st = g.state || {}, en = foe();
  var myPicked = !!g[myPickCol()];
  var head = '<div class="bt-arena">' + hpBar(g.a, (st.hp || {})[g.a] || 0) +
    '<div class="bt-vs">' + (g.phase === "done" ? "🏁" : "T" + g.turn) + "</div>" +
    hpBar(g.b, (st.hp || {})[g.b] || 0) + "</div>";
  var logH = '<div class="bt-log" id="bt-log">' + (st.log || []).slice(-6).map(function (l) {
    return '<div class="bt-line">' + l.txt + "</div>";
  }).join("") + "</div>";

  if (g.phase === "done") {
    var win = g.winner;
    box.innerHTML = '<div class="armory bt-wrap"><button class="ovx" data-ovx>✕</button>' + head + logH +
      '<div class="liar-banner ' + (win === me ? "cit" : win ? "liar" : "") + '">' +
      (win ? (win === me ? "🏆 승리!" : "💀 패배…") : "무승부") + "</div>" +
      '<p class="liar-sub" id="bt-xp"></p>' +
      '<div class="btn-row"><button class="btn ghost" id="bt-re" style="flex:1">⚔️ 재대결</button>' +
      '<button class="btn" id="bt-x" style="flex:1">닫기</button></div></div>';
    battleReward(g);
    $("#bt-x").onclick = function () { box.hidden = true; localStorage.setItem("kel_bt_seen", String(g.id)); btG = null; };
    $("#bt-re").onclick = function () { box.hidden = true; localStorage.setItem("kel_bt_seen", String(g.id)); btG = null; duelInvite(en); };
    return;
  }

  // pick 화면
  var forgot = (st.forget || {})[me] || [];
  var mine = myBook().filter(function (r) { return forgot.indexOf(r.spell_id) < 0; });
  box.innerHTML = '<div class="armory bt-wrap">' + head + logH +
    '<div class="bt-pickmsg">' + (myPicked ? "⏳ <b>" + esc(nameOf(en)) + "</b>의 주문 대기 중…" :
      "이번 턴 주문을 골라 — <b id='bt-cd'>25</b>초") + "</div>" +
    (myPicked ? "" :
      '<div class="arm-grid book-grid">' + mine.map(function (r) {
        var s = spellById[r.spell_id]; if (!s) return "";
        var dis = (s.id === "avada" && akLeft(me) <= 0) || (s.id === "expelliarmus" && expelLeft(me) <= 0);
        var t = tierById[s.t];
        return '<button class="arm-item sp-item' + (dis ? " lock" : "") + '" data-cast="' + s.id + '" style="--rc:' + t.color + '">' +
          '<span class="ai-em">' + s.em + '</span><span class="ai-ko">' + esc(s.ko) + "</span>" +
          '<span class="ai-t" style="background:' + t.color + '">' +
          (s.id === "avada" ? "☠️" + akLeft(me) : s.id === "expelliarmus" ? "🪄" + expelLeft(me) : "Lv" + r.lv) + "</span></button>";
      }).join("") + "</div>") +
    '<button class="btn ghost" id="bt-run" style="width:100%;margin-top:10px">🏳️ 기권</button></div>';
  $$("[data-cast]", box).forEach(function (b) {
    b.onclick = function () {
      if (b.classList.contains("lock")) return toast("차지가 없어");
      submitPick(b.dataset.cast);
    };
  });
  $("#bt-run").onclick = async function () {
    if (!confirm("기권할까? 상대 승리로 끝나")) return;
    await sb.from("battles").update({ phase: "done", winner: en }).eq("id", g.id).eq("phase", "play");
    kelLoad35();
  };
  clearInterval(btTimer);
  if (!myPicked) {
    var left = 25;
    btTimer = setInterval(function () {
      left--;
      var c = document.getElementById("bt-cd");
      if (c) c.textContent = left;
      if (left <= 0) { clearInterval(btTimer); submitPick("__pass"); }
    }, 1000);
  }
}
async function submitPick(spellId) {
  var g = btG; if (!g || g.phase !== "play") return;
  clearInterval(btTimer);
  var patch = {}; patch[myPickCol()] = spellId;
  var q = sb.from("battles").update(patch).eq("id", g.id).eq("phase", "play").eq("turn", g.turn);
  q = myPickCol() === "pick_a" ? q.is("pick_a", null) : q.is("pick_b", null);
  await q;
  var fresh = await sb.from("battles").select("*").eq("id", g.id).single();
  if (fresh.data) { btG = fresh.data; if (fresh.data.pick_a && fresh.data.pick_b) return resolveTurn(fresh.data); openBattle(); }
}
function effPow(s, caster, target, st) {
  var c = charOf(caster), lv = spLv.call ? 1 : 1;
  var slv = (store35.spellbook.find(function (x) { return x.member === caster && x.spell_id === s.id; }) || {}).lv || 1;
  var p = s.pow * (1 + 0.08 * (slv - 1)) * (0.9 + 0.06 * (c ? c.t : 1)) * (0.85 + Math.random() * 0.3);
  if (Math.random() < 0.08) p *= 1.5;
  if ((st.buff || {})[caster]) p *= 1.3;
  if ((st.weak || {})[caster]) p *= 0.5;
  // 이스터에그 배수
  if (c && c.id === "molly" && charOf(target) && charOf(target).id === "bellatrix") { p *= 3; eggMark("molly"); }
  if (c && c.id === "neville" && equippedOf(caster) === "gryffindorsword" && charOf(target) && charOf(target).id === "riddle") { p *= 5; eggMark("neville"); }
  if (equippedOf(caster) === "onering" && s.id === "incendio" && charOf(target) && charOf(target).id === "sauron") { p *= 6; eggMark("mtdoom"); }
  if (isAwakened(caster)) p *= 1.35;
  p *= dodgeMul(caster);
  if (c && c.id === "snape" && s.id === "sectumsempra") p *= 1.5;
  return Math.round(p);
}
async function resolveTurn(g) {
  // a 쪽 폰만 판정 (조건부 update로 한 번만 성공)
  if (g.a !== me) { btG = g; openBattle(); return; }
  var st = JSON.parse(JSON.stringify(g.state || {}));
  st.log = st.log || []; st.dot = st.dot || {}; st.shield = st.shield || {}; st.stun = st.stun || {};
  st.weak = st.weak || {}; st.buff = st.buff || {}; st.forget = st.forget || {};
  var pa = g.pick_a, pb = g.pick_b;
  // 임페리오: 상대 픽 랜덤 강제
  function imperio(victim, pick) {
    var book = store35.spellbook.filter(function (r) { return r.member === victim; });
    if (!book.length) return pick;
    return book[Math.floor(Math.random() * book.length)].spell_id;
  }
  if (pa === "imperio") pb = imperio(g.b, pb);
  if (pb === "imperio") pa = imperio(g.a, pa);

  var order = [[g.a, pa, g.b], [g.b, pb, g.a]];
  // 사우론 선공 이스터에그: 절대반지 낀 상대가 있으면 사우론이 먼저
  order.forEach(function (o) {
    var c = charOf(o[0]);
    if (c && c.id === "sauron" && equippedOf(o[2]) === "onering") { order = [o, order[0][0] === o[0] ? order[1] : order[0]]; }
  });

  function line(txt, fx, who) { st.log.push({ txt: txt, fx: fx || null, who: who || null, t: g.turn }); }
  // 도트 선처리
  [g.a, g.b].forEach(function (m) {
    var d = st.dot[m];
    if (d && d.n > 0) { st.hp[m] -= d.p; d.n--; line(nameOf(m) + " " + d.em + " 도트 -" + d.p, null, m); if (d.n <= 0) delete st.dot[m]; }
  });

  for (var i = 0; i < order.length; i++) {
    var caster = order[i][0], pick = order[i][1], target = order[i][2];
    if (st.hp[caster] <= 0) continue;
    if (st.stun[caster]) { delete st.stun[caster]; line("😵 " + nameOf(caster) + " 기절 — 턴 스킵"); continue; }
    if (!pick || pick === "__pass") { line("💨 " + nameOf(caster) + " 허둥지둥 (패스)"); continue; }
    var s = spellById[pick]; if (!s) continue;
    var enemyPick = caster === g.a ? pb : pa;

    if (s.id === "avada") {
      var stt = statsOf(caster);
      await sb.from("wiz_stats").update({ ak_used: (stt.ak_used || 0) + 1 }).eq("member", caster);
      var blocked = enemyPick === "expelliarmus" && expelLeft(target) > 0;
      if (blocked) {
        var ts2 = statsOf(target), em2 = ts2.exp_map || {}; em2[equippedOf(target)] = (em2[equippedOf(target)] || 0) + 1;
        await sb.from("wiz_stats").update({ exp_map: em2 }).eq("member", target);
        // 프리오리 인칸타템: 해리+해리 지팡이 vs 볼드모트 → 반사
        var tc = charOf(target), cc = charOf(caster);
        if (tc && tc.id === "potter" && equippedOf(target) === "potterwand" && cc && (cc.id === "voldemort" || cc.id === "riddle")) {
          st.hp[caster] = 0; line("✨ 프리오리 인칸타템! ☠️가 " + nameOf(caster) + "에게 반사됐다", "avada", target); eggMark("priori");
        } else line("🪄 " + nameOf(target) + "의 익스펠리아르무스가 ☠️를 튕겨냈다!", "expelliarmus", target);
      } else {
        st.hp[target] = 0;
        line("☠️ " + nameOf(caster) + "의 아바다 케다브라 — 즉사", "avada", caster);
        var cc2 = charOf(caster);
        var refundBlock = charOf(target) && charOf(target).id !== undefined &&
          cc2 && cc2.id === "riddle" && eggActiveNeville(target);
        if (!refundBlock) await sb.from("wiz_stats").update({ ak_bonus: (statsOf(caster).ak_bonus || 0) + 1 }).eq("member", caster);
        else line("🗡️ 그리핀도르의 검 — 리들의 환급이 봉인됐다");
      }
      continue;
    }
    function eggActiveNeville(m) { var c = charOf(m); return c && c.id === "neville" && equippedOf(m) === "gryffindorsword"; }
    if (s.id === "expelliarmus") {
      if (enemyPick === "avada") { line("🪄 " + nameOf(caster) + " 카운터 준비!"); continue; } // 처리 위에서
      st.hp[target] -= 8; line("🪄 " + nameOf(caster) + " 익스펠리아르무스 — 견제 8", "expelliarmus", caster); continue;
    }
    if (s.kind === "shield") { st.shield[caster] = { v: 0.7 }; line("🛡️ " + nameOf(caster) + " 프로테고 전개", "protego", caster); continue; }
    if (s.id === "patronum") { st.shield[caster] = { v: 1, pat: 1 }; st.hp[caster] = Math.min(maxHp(caster), st.hp[caster] + 12); line("🦌 " + nameOf(caster) + " 패트로누스! 다음 공격 무효 +12", "patronum", caster); continue; }
    if (s.kind === "buff") { st.buff[caster] = 1; line("💡 " + nameOf(caster) + " 루모스 — 다음 주문 +30%", "lumos", caster); continue; }
    if (s.id === "obliviate") {
      var tbook = store35.spellbook.filter(function (r) { return r.member === target && ((st.forget[target] || []).indexOf(r.spell_id) < 0); });
      if (tbook.length) {
        var vic = tbook[Math.floor(Math.random() * tbook.length)].spell_id;
        st.forget[target] = (st.forget[target] || []).concat([vic]);
        line("💫 " + nameOf(caster) + " 오블리비아테 — " + nameOf(target) + "의 " + (spellById[vic] || {}).ko + " 삭제!", "obliviate", caster);
        var cc3 = charOf(caster);
        if (cc3 && cc3.id === "lockhart") { eggMark("lockhart"); if (Math.random() < 0.5) { st.stun[caster] = 1; line("💥 지팡이 역효과 — 록하트 본인이 기절"); } }
      } else line("💫 오블리비아테 — 지울 게 없다");
      continue;
    }
    // 일반 공격/도트/기절/약화
    var dmg = effPow(s, caster, target, st);
    st.buff[caster] && delete st.buff[caster];
    st.weak[caster] && delete st.weak[caster];
    var sh = st.shield[target];
    if (sh) { if (sh.pat) { dmg = 0; line("🦌 패트로누스가 " + s.ko + "를 삼켰다"); } else dmg = Math.round(dmg * (1 - sh.v)); delete st.shield[target]; }
    if (dmg > 0) { st.hp[target] -= dmg; line(s.em + " " + nameOf(caster) + "의 " + s.ko + " — " + dmg, s.id, caster); }
    if (s.kind === "dot") st.dot[target] = { p: Math.round(s.pow), n: 3, em: s.em };
    if (s.kind === "dot2") st.dot[target] = { p: Math.round(s.pow), n: 3, em: s.em };
    if (s.kind === "stun" && Math.random() < (s.id === "stupefy" ? 0.3 : 0.2)) { st.stun[target] = 1; line("😵 " + nameOf(target) + " 기절!"); }
    if (s.kind === "weak") { st.weak[target] = 1; line("🙃 " + nameOf(target) + " 다음 주문 위력 절반"); }
  }

  var dead = [g.a, g.b].filter(function (m) { return st.hp[m] <= 0; });
  var patch = { state: st, pick_a: null, pick_b: null, turn: g.turn + 1 };
  if (dead.length) {
    patch.phase = "done";
    patch.winner = dead.length === 2 ? (st.hp[g.a] >= st.hp[g.b] ? g.a : g.b) : (dead[0] === g.a ? g.b : g.a);
  }
  await sb.from("battles").update(patch).eq("id", g.id).eq("turn", g.turn);
  kelLoad35();
}
function playBattleFx(st) {
  var last = (st.log || []).slice(-4);
  last.forEach(function (l, i) {
    if (l.fx) setTimeout(function () { FX2.cast(l.fx, { quick: true, lv: l.who ? spellLvOf(l.who, l.fx) : 1 }); }, i * 650);
  });
}
async function battleReward(g) {
  var key = "kel_bt_paid_" + g.id;
  var el = document.getElementById("bt-xp");
  var s = statsOf(me);
  if (localStorage.getItem(key)) { if (el) el.textContent = "보상 지급 완료"; return; }
  localStorage.setItem(key, "1");
  var win = g.winner === me;
  var gain = win ? 20 + Math.min(10, g.turn) : 35 + Math.min(25, (s.streak || 0) * 5);
  var patch = { xp: (s.xp || 0) + gain };
  if (win) { patch.wins = (s.wins || 0) + 1; patch.streak = 0; }
  else { patch.losses = (s.losses || 0) + 1; patch.streak = (s.streak || 0) + 1; }
  if (s.dodge > 0) patch.dodge = s.dodge - 1;   // 배틀 완주 = 낙인 1개 소멸 (본인은 이것도 모름)
  var beforeLv = lvOf(me);
  await statPatch(patch);
  var afterLv = 1 + Math.floor(Math.sqrt(patch.xp / 15));
  if (el) el.innerHTML = (win ? "승리 XP +" + gain : "패배 XP <b>+" + gain + "</b> (질수록 많이 큰다)") +
    (afterLv > beforeLv ? ' · <b style="color:var(--gold)">Lv.' + afterLv + " 달성! 강화 포인트 +1</b>" : "");
  if (afterLv > beforeLv) FX2.burst(innerWidth / 2, innerHeight / 2, { c: "#F2C744", n: 70, sp: 10, up: 2 });
  playBattleFx(g.state || {});
}

/* ---------------- 뽑기 허브 (홈 상단) ---------------- */
function kelHubHtml() {
  var wc = typeof wTickets === "function" ? wTickets() : 0;
  return '<div class="hub">' +
    '<div class="hub-top">🎴 뽑기</div>' +
    '<div class="hub-grid">' +
      '<button class="hub-b" data-hub="char"><span class="hub-em">🧙</span>캐릭터<span class="hub-s">' + (charOf(me) ? "재도전 $10.99" : "무료") + "</span></button>" +
      '<button class="hub-b" data-hub="wand"><span class="hub-em">🪄</span>지팡이<span class="hub-s">🎟️ ' + wc + "</span></button>" +
      '<button class="hub-b" data-hub="spell"><span class="hub-em">📜</span>주문<span class="hub-s">📜 ' + sTickets() + "</span></button>" +
    "</div>" +
    '<div class="hub-row2">' +
      '<button class="hub-mini" data-hub="shop">💵 상점</button>' +
      '<button class="hub-mini" data-hub="book">📖 주문서</button>' +
      '<button class="hub-mini" data-hub="syn">💞 궁합</button>' +
      '<button class="hub-mini" data-hub="rank">🏆 전적</button>' +
    "</div></div>";
}
function openRank() {
  var box = document.getElementById("rankbox");
  if (!box) { box = document.createElement("div"); box.id = "rankbox"; document.body.appendChild(box); }
  var rows = MEMBERS.map(function (m) { var s = statsOf(m.id); return { m: m, s: s, lv: lvOf(m.id) }; })
    .sort(function (a, b) { return (b.s.xp || 0) - (a.s.xp || 0); });
  box.hidden = false;
  box.innerHTML = '<div class="armory"><button class="ovx" data-ovx>✕</button>' +
    '<div class="arm-top">마법사 전적</div>' +
    rows.map(function (r, i) {
      return '<div class="rowline"><span class="rk-no">' + (i + 1) + "</span>" + av(r.m.id) +
        '<div><div style="font-weight:700;font-size:14px">' + esc(r.m.name) + ' <span class="bt-lv">Lv.' + r.lv + "</span></div>" +
        '<div class="muted" style="font-size:12px">' + (r.s.wins || 0) + "승 " + (r.s.losses || 0) + "패 · XP " + (r.s.xp || 0) + "</div></div>" +
        '<span style="margin-left:auto">☠️' + akLeft(r.m.id) + dodgeBadge(r.m.id) + "</span></div>";
    }).join("") + "</div>";
}

/* ---------------- 상점 v2 — 프리미엄 6/일 · 울트라 주 3장 ---------------- */
function isoWeek() {
  var d = new Date(); var day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day + 3);
  var first = new Date(d.getFullYear(), 0, 4);
  return d.getFullYear() + "-" + Math.round(((d - first) / 86400000 + ((first.getDay() + 6) % 7)) / 7);
}
function ultraUsedSet() {
  var rec = (localStorage.getItem("kel_ultra_wk") || "").split("|");
  return rec[0] === isoWeek() ? (rec[1] || "").split(",").filter(Boolean) : [];
}
function ultraLeftType(t) { return ultraUsedSet().indexOf(t) < 0; }
function ultraMark(t) {
  var u = ultraUsedSet(); if (u.indexOf(t) < 0) u.push(t);
  localStorage.setItem("kel_ultra_wk", isoWeek() + "|" + u.join(","));
}
function bumpPrem() { localStorage.setItem("kel_p100", today() + "|" + (used100Today() + 1)); }
function openShop() {
  var box = document.getElementById("shopbox");
  if (!box) { box = document.createElement("div"); box.id = "shopbox"; document.body.appendChild(box); }
  var u = ultraUsedSet();
  box.hidden = false;
  box.innerHTML = '<div class="armory"><button class="ovx" data-ovx>✕</button>' +
    '<div class="arm-top">상점 <span class="muted" style="font-size:11px">전부 가짜 결제</span></div>' +
    '<div class="shop">' +
      '<button class="shop-item" data-buy="f-char"><span class="shop-price">$10.99</span><span class="shop-t">🧙 운명 거스르기</span><span class="shop-d">캐릭터 재굴리기 20번 리필 · 무제한</span></button>' +
      '<button class="shop-item" data-buy="f-wand"><span class="shop-price">$10.99</span><span class="shop-t">🪄 지팡이 티켓 풀충전</span><span class="shop-d">무기 티켓 12장 · 무제한</span></button>' +
      '<button class="shop-item" data-buy="f-spell"><span class="shop-price">$10.99</span><span class="shop-t">📜 주문 티켓 풀충전</span><span class="shop-d">주문 티켓 12장 · 무제한</span></button>' +
      '<button class="shop-item' + (canBuy100() ? "" : " off") + '" data-buy="p100"><span class="shop-price">$100</span><span class="shop-t">프리미엄 팩</span><span class="shop-d">종류 선택 · 5장 중 1택 · 확률 3배</span><span class="shop-s">오늘 ' + used100Today() + "/" + P100_PER_DAY + (extraPrem() > 0 ? " · 🎟️" + extraPrem() : "") + "</span></button>" +
      '<button class="shop-item ultra" data-buy="p1000"><span class="shop-price">$1,000</span><span class="shop-t">울트라 팩</span><span class="shop-d">확률 10배 · 주마다 캐릭터·지팡이·주문 각 1장</span><span class="shop-s">이번 주 남음: ' +
        ["char", "wand", "spell"].filter(function (t) { return u.indexOf(t) < 0; }).map(function (t) { return { char: "🧙", wand: "🪄", spell: "📜" }[t]; }).join(" ") + (extraUltra() > 0 ? " · 🎟️" + extraUltra() : "") + "</span></button>" +
    "</div></div>";
  $$("[data-buy]", box).forEach(function (b) {
    b.onclick = function () {
      var k = b.dataset.buy;
      if (k === "f-char") { box.hidden = true; return $("#fate-btn") ? $("#fate-btn").click() : fakeFate(); }
      if (k === "f-wand") { if (!confirm("$10.99 — 무기 티켓 12장 (가짜)")) return; localStorage.setItem("kel_wt", String(WTICKET_MAX)); localStorage.setItem("kel_wt_t", String(Date.now())); sendPush("💸 " + nameOf(me) + "의 과금", "지팡이 티켓 풀충전 $10.99", "fate"); toast("💸 🎟️ 12장"); return openShop(); }
      if (k === "f-spell") { if (!confirm("$10.99 — 주문 티켓 12장 (가짜)")) return; fillSTicket(); sendPush("💸 " + nameOf(me) + "의 과금", "주문 티켓 풀충전 $10.99", "fate"); toast("💸 📜 12장"); return openShop(); }
      if (k === "p100") { if (!canBuy100()) return toast("오늘 " + P100_PER_DAY + "번 다 썼어"); box.hidden = true; return openPackChoose(100); }
      if (k === "p1000") { box.hidden = true; return openPackChoose(1000); }
    };
  });
}
function fakeFate() {
  localStorage.setItem("kel_rolls", "0");
  localStorage.setItem("kel_fate", String(fateCount() + 1));
  toast("💸 결제 완료(가짜). 20번 새로 받았어");
  rollResult = drawCharacter(); openRoll();
}
function openPackChoose(kind) {
  var box = document.getElementById("pkbox");
  if (!box) { box = document.createElement("div"); box.id = "pkbox"; document.body.appendChild(box); }
  var u = ultraUsedSet();
  box.hidden = false;
  box.innerHTML = '<div class="quiz-card"><button class="ovx" data-ovx>✕</button>' +
    '<div class="wres-name">' + (kind === 1000 ? "$1,000 울트라" : "$100 프리미엄") + ' — 뭘 뽑을까</div>' +
    '<div class="btn-row" style="margin-top:12px">' +
      ["char|🧙 캐릭터", "wand|🪄 지팡이", "spell|📜 주문"].map(function (x) {
        var p = x.split("|"), off = kind === 1000 && u.indexOf(p[0]) >= 0;
        return '<button class="btn' + (off ? " off" : "") + '" data-pt="' + p[0] + '" style="flex:1">' + p[1] + (off ? " ✅" : "") + "</button>";
      }).join("") + "</div></div>";
  $$("[data-pt]", box).forEach(function (b) {
    b.onclick = function () {
      var t = b.dataset.pt;
      function payUltra(slot) {
        if (ultraLeftType(slot)) { ultraMark(slot); return true; }
        if (extraUltra() > 0) { localStorage.setItem("kel_x_ultra", String(extraUltra() - 1)); toast("🎟️ 울트라 쿠폰 사용 (남음 " + extraUltra() + ")"); return true; }
        toast("이번 주 이 종류는 이미 열었어 — 월요일 리셋"); return false;
      }
      function payPrem() {
        if (used100Today() < P100_PER_DAY) { bumpPrem(); return true; }
        if (extraPrem() > 0) { localStorage.setItem("kel_x_prem", String(extraPrem() - 1)); toast("🎟️ 프리미엄 쿠폰 사용 (남음 " + extraPrem() + ")"); return true; }
        toast("오늘 " + P100_PER_DAY + "번 다 썼어"); return false;
      }
      if (t === "char") {
        if (kind === 1000) { if (!payUltra("char")) return; box.hidden = true; openMulti(1000); }
        else { box.hidden = true; openMulti(100); }
      } else {
        if (kind === 1000) { if (!payUltra(t)) return; } else { if (!payPrem()) return; }
        box.hidden = true;
        openMultiWS(kind, t);
      }
    };
  });
}
function openMultiWS(kind, type) {
  var n = kind === 1000 ? 3 : 5, boost = kind === 1000 ? 10 : 3;
  var cards = [];
  for (var i = 0; i < n; i++) cards.push(type === "wand" ? drawWeapon(boost) : drawSpell(boost));
  var box = document.getElementById("multibox");
  if (!box) { box = document.createElement("div"); box.id = "multibox"; document.body.appendChild(box); }
  box.className = kind === 1000 ? "ultra" : "";
  box.hidden = false;
  box.innerHTML = '<div class="multi-wrap">' +
    '<div class="multi-top">' + (kind === 1000 ? "$1,000 ULTRA · 확률 10배" : "$100 PREMIUM · 확률 3배") + "</div>" +
    '<div class="multi-sub">' + (type === "wand" ? "🪄 지팡이" : "📜 주문") + " " + n + "장 — 전부 획득!</div>" +
    '<div class="multi-grid' + (n === 3 ? " three" : "") + '">' +
    cards.map(function (c, i) {
      var t = tierById[c.t];
      return '<div class="mcard on" style="--rc:' + t.color + ';animation-delay:' + (i * 0.3) + 's">' +
        '<div class="mc-em">' + c.em + '</div><div class="mc-ko">' + esc(c.ko) + '</div>' +
        '<div class="mc-t" style="background:' + t.color + '">' + t.en + "</div></div>";
    }).join("") + "</div>" +
    '<button class="btn" id="mw-take" style="width:100%;margin-top:14px">전부 받기</button></div>';
  sendPush("💸 " + nameOf(me) + "의 과금", (kind === 1000 ? "$1,000 울트라" : "$100 프리미엄") + " 팩 개봉", "fate");
  FX2.burst(innerWidth / 2, innerHeight * 0.3, { c: kind === 1000 ? "#C8503C" : "#C79A3E", n: 70, sp: 9, up: 1 });
  $("#mw-take").onclick = async function () {
    box.hidden = true;
    for (var i = 0; i < cards.length; i++) {
      if (type === "wand") await grantWeapon(cards[i]);
      else await grantSpell(cards[i]);
    }
    toast("🎉 " + cards.length + "장 전부 획득");
    if (type === "spell") openSpellbook();
  };
}

/* ---------------- 궁합표 v2 — 지팡이×마법사 + 이스터에그 ---------------- */
openSynergy = function () {
  var box = document.getElementById("synbox");
  if (!box) { box = document.createElement("div"); box.id = "synbox"; document.body.appendChild(box); }
  var myC = charOf(me);
  var myList = myC ? WEAPONS.filter(function (w) { return (w.want || []).indexOf(myC.id) >= 0; }) : [];
  box.hidden = false;
  box.innerHTML = '<div class="armory syn-wrap"><button class="ovx" data-ovx>✕</button>' +
    '<div class="arm-top">궁합표 <span class="muted" style="font-size:11px">맞는 지팡이 = 전투력 ×3</span></div>' +
    (myC ? '<div class="syn-mine"><b>' + myC.em + " " + esc(myC.ko) + "</b>가 원하는 것" +
      '<div class="arm-wrow">' + (myList.length ? myList.map(function (w) {
        return '<span class="arm-wchip' + (wQty(w.id) ? " has" : "") + '">' + w.em + " " + esc(w.ko) + (wQty(w.id) ? " ✅" : "") + "</span>";
      }).join("") : '<span class="muted">전용 무기가 없는 캐릭터야 — 잡템 ×1.3은 유효</span>') + "</div></div>" : "") +
    [6, 5, 4].map(function (tt) {
      var t = tierById[tt];
      var ws = WEAPONS.filter(function (w) { return w.t === tt; });
      return '<div class="syn-tier" style="--rc:' + t.color + '"><div class="syn-th">' + t.en + "</div>" +
        ws.map(function (w) {
          var owners = (w.want || []).map(function (id) { var c = charById[id]; return c ? c.em + " " + c.ko : id; }).join(" · ");
          return '<div class="syn-row"><span class="syn-w">' + w.em + " " + esc(w.ko) + '</span><span class="syn-c">' + (owners || "—") + "</span></div>";
        }).join("") + "</div>";
    }).join("") +
    '<div class="syn-tier" style="--rc:#8000A8"><div class="syn-th">🥚 이스터에그 — 하극상의 길</div>' +
    EGGS.map(function (e) {
      var seen = eggSeen(e.id);
      return '<div class="syn-row egg' + (seen ? " open" : "") + '"><span class="syn-w">' + (seen ? "🥚 " + e.n : "❓ ???") + "</span>" +
        '<span class="syn-c">' + (seen ? esc(e.d) : "배틀에서 조건을 맞추면 해금") + "</span></div>";
    }).join("") + "</div>" +
  "</div>";
};

/* ---------------- 도적의 지도 ---------------- */
function marauderCardHtml() {
  var autoUntil = Number(localStorage.getItem("kel_autoshare") || 0);
  var on = autoUntil > Date.now();
  return '<div class="mmap-card"><div class="mmap-head">🗺️ 도적의 지도' +
    '<span class="mmap-oath">"나는 못된 짓을 꾸미고 있음을 엄숙히 맹세합니다"</span></div>' +
    '<div id="map" class="mmap"></div>' +
    '<div class="btn-row" style="margin-top:10px">' +
      '<button class="btn" id="mm-all" style="flex:1.4">📢 전원 위치 소집</button>' +
      '<button class="btn ghost" id="mm-me" style="flex:1">📍 내 위치</button>' +
      '<button class="btn ghost' + (on ? " on" : "") + '" id="mm-auto" style="flex:1">' + (on ? "🕐 자동공유 중" : "1시간 자동") + "</button>" +
    "</div></div>";
}
function bindMarauder() {
  var a = $("#mm-all");
  if (a) a.onclick = async function () {
    if (!me) return openWho();
    var r = await qInsert("checkins", { member: me, place: "🗺️ 전원 위치 소집!", note: null, target: "all", lat: null, lng: null });
    if (r === true) { toast("🗺️ 소집 발동 — 응답 오는 대로 지도에 찍힘"); sendPush(nameOf(me), "🗺️ 전원 위치를 소집한다! (지도 탭에서 응답)", "req"); loadAll(); }
  };
  var mm = $("#mm-me"); if (mm) mm.onclick = function () { quickPing(true); };
  var au = $("#mm-auto");
  if (au) au.onclick = function () {
    var cur = Number(localStorage.getItem("kel_autoshare") || 0);
    if (cur > Date.now()) { localStorage.setItem("kel_autoshare", "0"); toast("자동 공유 끔"); }
    else { localStorage.setItem("kel_autoshare", String(Date.now() + 3600000)); toast("🕐 1시간 동안 위치 요청에 자동 응답"); }
    renderTab(currentTab);
  };
}
/* 자동 응답: 요청 배너 뜨는 조건에서 자동공유 켜져 있으면 바로 쏨 */
var _checkReq35 = typeof checkRequests === "function" ? checkRequests : null;
checkRequests = function () {
  if (Number(localStorage.getItem("kel_autoshare") || 0) > Date.now() && me) {
    var tenMin = Date.now() - 600000;
    var myLastLoc = store.checkins.find(function (c) { return c.member === me && c.lat; });
    var req = store.checkins.find(function (c) {
      return c.target && (c.target === me || c.target === "all") && c.member !== me &&
        new Date(c.created_at).getTime() > tenMin &&
        (!myLastLoc || new Date(c.created_at) > new Date(myLastLoc.created_at));
    });
    if (req && localStorage.getItem("kel_req_done") !== String(req.id)) {
      localStorage.setItem("kel_req_done", String(req.id));
      quickPing(true);
      toast("🕐 자동 공유 — 위치 송신");
      return;
    }
  }
  if (_checkReq35) _checkReq35();
};
var _drawMap35 = drawMap;
drawMap = function (id, opts) {
  _drawMap35(id, opts);
  var holder = document.getElementById(id);
  if (holder) holder.classList.add("marauder");
  // 발자국: 마커 등장 연출
  setTimeout(function () {
    document.querySelectorAll("#" + id + " .av-pin").forEach(function (p, i) {
      p.classList.add("footstep");
      p.style.animationDelay = (i * 0.15) + "s";
    });
  }, 150);
};

/* ---------------- 무전 이펙트 첨부 + 3D ---------------- */
window.KSEL = null;
function spellChipRow() {
  var mine = myBook();
  if (!mine.length) return "";
  return '<div class="chip-row spellrow"><span class="muted" style="font-size:11px;align-self:center">🪄 이펙트:</span>' +
    '<button class="chip spx' + (!window.KSEL ? " on" : "") + '" data-spx="">없음</button>' +
    mine.map(function (r) {
      var s = spellById[r.spell_id]; if (!s) return "";
      return '<button class="chip spx' + (window.KSEL === s.id ? " on" : "") + '" data-spx="' + s.id + '">' + s.em + "</button>";
    }).join("") + "</div>";
}
document.addEventListener("click", function (e) {
  var sx = e.target.closest && e.target.closest("[data-spx]");
  if (sx) {
    window.KSEL = sx.dataset.spx || null;
    document.querySelectorAll(".spx").forEach(function (x) { x.classList.toggle("on", x.dataset.spx === (window.KSEL || "")); });
    if (window.KSEL) FX2.cast(window.KSEL, { quick: true });
  }
  var hb = e.target.closest && e.target.closest("[data-hub]");
  if (hb) {
    var k = hb.dataset.hub;
    if (k === "char") { if (!me) return openWho(); if (!charOf(me)) { rollResult = drawCharacter(); openRoll(); } else openShop(); }
    else if (k === "wand") openArmory();
    else if (k === "spell") openSpellbook();
    else if (k === "shop") openShop();
    else if (k === "book") openSpellbook();
    else if (k === "syn") openSynergy();
    else if (k === "rank") openRank();
  }
  var ox = e.target.closest && e.target.closest("[data-ovx]");
  if (ox) { var ov = ox.closest("#armorybox,#synbox,#boxbox,#quizbox,#wbox,#spbox,#bookbox,#btbox,#rankbox,#shopbox,#pkbox,#multibox,#liarbox,#oddsov,#duelbox"); if (ov) { ov.hidden = true; } }
  var dl = e.target.closest && e.target.closest("[data-duel]");
  if (dl) { e.stopPropagation(); duelInvite(dl.dataset.duel); }
});

/* ---------------- 여행 아카이브 (정보 탭) ---------------- */
function archMissionsHtml() {
  var h = '<div class="card">';
  for (var i = 0; i < MISSIONS.length; i++) {
    var mi = MISSIONS[i], label = mi.e + " " + mi.t;
    var doneBy = MEMBERS.filter(function (m2) { return store.checkins.some(function (c) { return c.member === m2.id && c.place === label; }); });
    h += '<div class="mission-row done-view"><span class="mi-badge">' + mi.e + '</span><span class="mi-title">' + esc(mi.t) + "</span>" +
      '<span class="mi-who">' + doneBy.map(function (m2) { return av(m2.id, "mini"); }).join("") + "</span></div>";
  }
  return h + "</div>";
}

/* ---------------- 튜토리얼 v35 ---------------- */
tutSteps = function () {
  var installed = isStandalone();
  var pushOn = pushState() === "granted" && !!localStorage.getItem("kel_push");
  return [
    { ic: "🧙", t: "여행수첩 → 마법사 대전", d: "여행은 끝났지만 게임은 계속돼. 이제 이 앱은 <b>뽑기 + 무전 + 마법사 배틀</b>이야. 홈 맨 위 <b>뽑기 허브</b>에서 전부 시작해." },
    { ic: (me && charOf(me) ? avatarOf(me) : "🎲"), t: "① 캐릭터", d: me && charOf(me) ? ("현재 <b>" + esc(fullName(me)) + "</b>. 다시 뽑고 싶으면 상점 $10.99 (가짜 결제, 무제한).") : "먼저 마법사를 뽑아. 20번까지 다시 굴릴 수 있어.",
      btn: charOf(me) ? null : "지금 뽑기", run: function () { tutPause(); rollResult = drawCharacter(); openRoll(); }, done: function () { return !!charOf(me); } },
    { ic: "🪄", t: "② 지팡이", d: "티켓은 20분마다 1장(최대 12). <b>궁합 맞는 지팡이 장착 = 전투력 ×3</b>이고 배틀에서 익스펠리아르무스 카운터도 지팡이당 10회야." },
    { ic: "📜", t: "③ 주문", d: "주문도 티켓으로 뽑아 모아(중복 = 자동 강화). <b>아바다 케다브라는 0.1%, 평생 10발.</b> 주문은 배틀에서도 쓰고, 무전 보낼 때 이펙트로도 붙일 수 있어.",
      btn: "주문 하나 뽑아보기", run: function () { tutPause(); openSpellDraw(); }, done: function () { return myBook().length > 0; } },
    { ic: "⚔️", t: "④ 배틀", d: "교신 탭 친구 카드의 <b>⚔️</b>를 누르면 실시간 턴제 결투. 매턴 서로 몰래 주문을 고르고 동시에 공개돼.<br><b>지면 경험치를 더 많이 받아</b> — 약해도 계속 크는 구조." },
    { ic: "🥚", t: "⑤ 하극상", d: "일반 캐릭터도 초월을 잡는 <b>이스터에그 조합</b>이 숨어 있어. 발동하면 궁합표에 해금돼. 궁합 아이템은 절대 무시하지 마." },
    { ic: "🗺️", t: "⑥ 도적의 지도", d: "교신 탭 맨 위 지도에서 <b>📢 전원 위치 소집</b> 한 번이면 응답 오는 대로 전원이 지도에 찍혀. 1시간 자동 공유도 켤 수 있어." },
    { ic: "📲", t: "설치 · 알림", d: "홈 화면 설치 + 알림을 켜야 결투 신청·무전이 밖에서도 와.", btn: installed ? (pushOn ? null : "알림 켜기") : "설치 위치 보여줘",
      run: function () { if (!installed) { tutPause(); pointToShare(); } else enablePush().then(drawTut); }, done: function () { return installed && pushOn; }, skipIf: function () { return installed && pushOn; } },
  ];
};

/* ---------------- v35 부팅 ---------------- */
function kelV35Init() {
  FX2.mount();
  kelLoad35();
  ensureStats();
  if (sb) {
    try {
      btCh = sb.channel("kel-b35");
      ["battles", "spellbook", "wiz_stats"].forEach(function (t) {
        btCh.on("postgres_changes", { event: "*", schema: "public", table: t }, function () { kelLoad35(); });
      });
      btCh.subscribe();
    } catch (e) {}
  } else setTimeout(kelV35Init, 1500);
  // 라디오 3D 래핑
  var ptw = document.querySelector(".ptt-wrap");
  if (ptw) ptw.classList.add("ptt3d");
  // 대격변 마이그레이션 — loadAll 완료(=settings 채워짐)가 확인된 뒤에만 실행
  var tries = 0;
  (function waitMig() {
    var loaded = store && store.settings && Object.keys(store.settings).length > 0;
    if (me && loaded) return runMig35();
    if (tries++ < 40) setTimeout(waitMig, 900);
  })();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(kelV35Init, 600); });
else setTimeout(kelV35Init, 600);

/* ---------------- v35 대격변 마이그레이션 ----------------
   ① 무기: 전원 1개만 선택해서 남기고 나머지 소각 (제거된 13종은 강제 소각)
   ② 캐릭터: 유지. 단, 로스터에서 삭제된 캐릭터(잡스·요다·손흥민 등)를
      들고 있던 사람 → 울트라 쿠폰 150 + 프리미엄 쿠폰 150 보상 후 재뽑기 유도 */
var REMOVED_CHARS = ["jobs","yoda","son","musk","freddie","bruce","smaug","legolas"];
var REMOVED_WEAPONS = ["firstphone","teslacar","falcon","micstand","nunchaku","yodasaber","sonboots","captainband","soccerball","varmonitor","scarf_son","holocron","jedirobe"];
var REMOVED_KO = { jobs:"스티브 잡스", yoda:"요다", son:"손흥민", musk:"일론 머스크", freddie:"프레디 머큐리", bruce:"브루스 리", smaug:"스마우그", legolas:"레골라스" };

function runMig35() {
  // 데이터 로드 전엔 절대 플래그를 태우지 않는다 (쿠폰 미지급 레이스 방지)
  if (!me || !store || !store.settings || !Object.keys(store.settings).length) return;
  // ② 보상 먼저
  if (!localStorage.getItem("kel_mig35_comp")) {
    var rec = (store.characters || []).find(function (c) { return c.member === me; });
    if (rec && REMOVED_CHARS.indexOf(rec.char_id) >= 0) return migCompModal(rec.char_id);
    localStorage.setItem("kel_mig35_comp", "1");
  }
  // ① 무기 대격변
  if (!localStorage.getItem("kel_mig35_wipe")) return migWipe();
}
function migCompModal(deadId) {
  var box = document.getElementById("migbox");
  if (!box) { box = document.createElement("div"); box.id = "migbox"; document.body.appendChild(box); }
  box.hidden = false;
  box.innerHTML = '<div class="quiz-card mig-card">' +
    '<div class="wres-em" style="filter:grayscale(1)">🪦</div>' +
    '<div class="wres-name">' + esc(REMOVED_KO[deadId] || deadId) + '</div>' +
    '<p class="muted" style="margin:10px 0;font-size:13px;line-height:1.7">세계관이 마법사로 통일되면서<br>네 캐릭터는 이 세계를 떠났다.</p>' +
    '<div class="title-coupon" style="margin:10px 0">🎁 위로금<br><b style="font-size:16px">$1,000 울트라 쿠폰 ×150<br>$100 프리미엄 쿠폰 ×150</b></div>' +
    '<p class="muted" style="font-size:11.5px">쿠폰은 주간·일일 한도를 무시하고 상점에서 자동 소모돼</p>' +
    '<button class="btn" id="mig-take" style="width:100%;margin-top:10px">받고 새 마법사 뽑기</button></div>';
  $("#mig-take").onclick = function () {
    localStorage.setItem("kel_x_ultra", String(extraUltra() + 150));
    localStorage.setItem("kel_x_prem", String(extraPrem() + 150));
    localStorage.setItem("kel_mig35_comp", "1");
    box.hidden = true;
    FX2.burst(innerWidth / 2, innerHeight / 2, { c: "#C79A3E", n: 90, sp: 11, up: 2 });
    toast("🎁 울트라 150 · 프리미엄 150 지급");
    rollResult = drawCharacter(); openRoll();
    setTimeout(runMig35, 15000);  // 재뽑기 연출 끝난 뒤 무기 소각
  };
}
async function migWipe() {
  var mineW = (store.inventory || []).filter(function (r) { return r.member === me; });
  var valid = mineW.filter(function (r) { return REMOVED_WEAPONS.indexOf(r.weapon_id) < 0 && weaponById[r.weapon_id]; });
  if (mineW.length <= 1 && valid.length === mineW.length) { localStorage.setItem("kel_mig35_wipe", "1"); return; }
  if (!valid.length) { // 전부 제거 대상 → 통째로 소각
    await sb.from("inventory").delete().eq("member", me);
    localStorage.setItem("kel_mig35_wipe", "1");
    toast("🔥 구시대의 무기가 전부 재가 되었다"); loadAll(); return;
  }
  var box = document.getElementById("migbox");
  if (!box) { box = document.createElement("div"); box.id = "migbox"; document.body.appendChild(box); }
  box.hidden = false;
  box.innerHTML = '<div class="armory mig-card">' +
    '<div class="arm-top">🔥 대격변</div>' +
    '<p class="muted" style="font-size:12.5px;margin:0 0 12px;line-height:1.7">새 시대가 열리며 창고가 불탄다.<br><b>단 하나만</b> 품에 안고 나올 수 있다 — 나머지는 전부 재가 된다.<br>(수량도 1개로 줄어듦 · 되돌릴 수 없음)</p>' +
    '<div class="arm-grid">' +
    valid.map(function (r) {
      var w = weaponById[r.weapon_id], t = tierById[w.t];
      return '<button class="arm-item" data-keep="' + w.id + '" style="--rc:' + t.color + '">' +
        '<span class="ai-em">' + w.em + '</span><span class="ai-ko">' + esc(w.ko) + "</span>" +
        '<span class="ai-t" style="background:' + t.color + '">' + t.en + "</span>" +
        (r.qty > 1 ? '<span class="ai-q">×' + r.qty + "</span>" : "") + "</button>";
    }).join("") + "</div></div>";
  $$("[data-keep]", box).forEach(function (b) {
    b.onclick = async function () {
      var keep = b.dataset.keep, w = weaponById[keep];
      if (!confirm('"' + w.ko + '" 하나만 남기고 전부 태울까?\n\n(진짜로 되돌릴 수 없음)')) return;
      box.hidden = true;
      await sb.from("inventory").delete().eq("member", me).neq("weapon_id", keep);
      await sb.from("inventory").update({ qty: 1 }).eq("member", me).eq("weapon_id", keep);
      await equipWeapon(keep);
      localStorage.setItem("kel_mig35_wipe", "1");
      FX2.flash("#E0562C", 260); FX2.shake(0.6);
      FX2.burst(innerWidth / 2, innerHeight / 2, { c: "#3A3226", n: 110, sp: 8, up: 2, g: -0.05 });
      FX2.glyphBurst("🔥", innerWidth / 2, innerHeight * 0.4, { c: "#FF8A3C", scale: 260 });
      toast("🔥 " + w.ko + "만 살아남았다");
      loadAll();
    };
  });
}
