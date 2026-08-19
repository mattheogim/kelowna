/* ============================================================
   켈로나 여행수첩 — 설정 파일
   네가 손댈 곳은 아래 두 줄뿐이야.
   Supabase → Project Settings → API 에서 복사해서 붙여넣기.
   ============================================================ */

const SUPABASE_URL = "https://vprbjkqvytumfxbftofd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_zty8j8PQBy4KfH7_yzxwCQ_iEChTAxp";


/* ---------- 여기부터는 필요할 때만 수정 ---------- */

// avatar는 아무 이모지로 바꿔도 됨 — 여기만 고치면 앱 전체(교신판·피드·장부·지도)에 반영
const MEMBERS = [
  { id: "jaemin",  name: "재민", color: "#33506B", avatar: "🐻" },
  { id: "heejung", name: "희정", color: "#7C2E3E", avatar: "🦊" },
  { id: "jaehyung",name: "재형", color: "#47603F", avatar: "🐯" },
  { id: "jihee",   name: "지히", color: "#A2762A", avatar: "🐰" },
  { id: "sangwoo", name: "상우", color: "#2E6E6A", avatar: "🐧" },
  { id: "dahin",   name: "다흰", color: "#6D4A7C", avatar: "🐱" },
];

const TRIP = {
  title: "켈로나 여행수첩",
  start: "2026-08-20",           // 목
  end:   "2026-08-22",           // 토
  days: [
    { date: "2026-08-20", label: "목", theme: "#7C2E3E" }, // 와인
    { date: "2026-08-21", label: "금", theme: "#2E6E6A" }, // 호수
    { date: "2026-08-22", label: "토", theme: "#47603F" }, // 귀가
  ],
  // 숙소 대략 좌표 (McCulloch Rd / Hydraulic Lake 부근) — 정보 탭에서 수정 가능
  cabinLat: 49.771,
  cabinLng: -119.209,
  cabinName: "Waterfront Kelowna Cabin #1",
  doorCodeRevealAt: "2026-08-20T14:00:00", // 이 시각부터 홈에 도어코드 카드 표시
  nearCabinKm: 3,                          // 숙소 반경 몇 km면 '도착 모드'
};

// 출발 전 준비물 (체크 상태는 각자 폰에 저장됨)
const CHECKLIST = [
  "생수 (숙소 물은 호수물!)",
  "지도 스크린샷 (산길 셀신호 약함)",
  "수영복 · 타월",
  "선크림 · 벌레 스프레이",
  "술 · 믹서 (재형 커플)",
  "장보기 리스트 (상우 · 다흰)",
  "보드게임 · 카드",
  "아이스박스",
  "충전기 · 보조배터리",
  "손전등 (밤 산길)",
];

// 스탬프 찍을 때 빠른 선택지
const STAMP_PRESETS = [
  "포트무디 출발", "휴게소", "West Kelowna 도착",
  "Quails' Gate", "Beaumont", "Little Straw",
  "Volcanic Hills", "Mt. Boucherie", "Kalala", "Off the Grid",
  "코스트코", "다운타운", "호수", "숙소",
];

const EXPENSE_CATEGORIES = ["장보기", "기름", "외식", "와인", "숙소", "기타"];

const WISH_CATEGORIES = ["와이너리", "음식", "액티비티", "기타"];
