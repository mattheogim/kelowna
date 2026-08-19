-- ============================================================
-- 켈로나 여행수첩 — Supabase 스키마 + 시드
-- Supabase → SQL Editor → New query → 전체 붙여넣기 → Run
-- ============================================================

-- 일정
create table if not exists itinerary (
  id bigint generated always as identity primary key,
  day date not null,
  t text,                -- "07:30" 또는 "오전" 같은 자유 텍스트
  title text not null,
  note text,
  sort int default 0
);

-- 지출 (장부)
create table if not exists expenses (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  payer text not null,           -- member id
  title text not null,
  amount numeric not null,
  participants text[] not null,  -- member id 배열 (이 사람들끼리 n빵)
  category text default '기타',
  memo text
);

-- 투표 (그날그날 급한 결정용)
create table if not exists polls (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  question text not null,
  options jsonb not null,
  created_by text,
  closed boolean default false
);

create table if not exists votes (
  poll_id bigint references polls(id) on delete cascade,
  member text not null,
  option_idx int not null,
  created_at timestamptz default now(),
  primary key (poll_id, member)
);

-- 무전/스탬프 (체크인 + 위치 + 한줄)
create table if not exists checkins (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  member text not null,
  place text not null,
  note text,
  lat double precision,
  lng double precision
);

-- 금요일 제안 보드 (프리 데이)
create table if not exists wishes (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  member text,                   -- null이면 '수첩'이 미리 넣어둔 것
  title text not null,
  category text default '기타'
);

create table if not exists wish_likes (
  wish_id bigint references wishes(id) on delete cascade,
  member text not null,
  primary key (wish_id, member)
);

-- 장보기 리스트
create table if not exists shopping (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  item text not null,
  added_by text,
  done boolean default false
);

-- 설정 (WiFi, 도어코드, 앨범 링크, 숙소 좌표)
create table if not exists settings (
  key text primary key,
  value text
);

-- ---------- 권한 (친구 6명용 단순 모드: anon 전부 허용) ----------
alter table itinerary  enable row level security;
alter table expenses   enable row level security;
alter table polls      enable row level security;
alter table votes      enable row level security;
alter table checkins   enable row level security;
alter table wishes     enable row level security;
alter table wish_likes enable row level security;
alter table shopping   enable row level security;
alter table settings   enable row level security;

create policy "all itinerary"  on itinerary  for all to anon using (true) with check (true);
create policy "all expenses"   on expenses   for all to anon using (true) with check (true);
create policy "all polls"      on polls      for all to anon using (true) with check (true);
create policy "all votes"      on votes      for all to anon using (true) with check (true);
create policy "all checkins"   on checkins   for all to anon using (true) with check (true);
create policy "all wishes"     on wishes     for all to anon using (true) with check (true);
create policy "all wish_likes" on wish_likes for all to anon using (true) with check (true);
create policy "all shopping"   on shopping   for all to anon using (true) with check (true);
create policy "all settings"   on settings   for all to anon using (true) with check (true);

-- ---------- 실시간 ----------
alter publication supabase_realtime add table checkins;
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table polls;
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table itinerary;
alter publication supabase_realtime add table wishes;
alter publication supabase_realtime add table wish_likes;
alter publication supabase_realtime add table shopping;

-- ---------- 시드: 일정 ----------
insert into itinerary (day, t, title, note, sort) values
('2026-08-20','07:30','포트무디 집결','희정이네. 재형 7:30까지. 안 가는 차는 여기 주차',10),
('2026-08-20','08:00','출발','A조 4명 / B조 2명(상우·다흰, 랭리 출발). Hwy로 West Kelowna까지',20),
('2026-08-20','12:40','West Kelowna 도착','',30),
('2026-08-20','13:00','Quails'' Gate — Old Vines 점심','희정 1픽. 6명 점심 예약 확인 필수',40),
('2026-08-20','15:00','Beaumont Family Estates','희정 2픽 · 상우 요청',50),
('2026-08-20','16:30','Little Straw','상우 2픽',60),
('2026-08-20','17:30','4번째 — 그날 기분따라','Volcanic Hills / Mt. Boucherie. 같은 동네라 둘 다 가도 됨. 컨디션 보고 현장 결정',70),
('2026-08-20','18:30','코스트코','다흰 카드. 마감 시간 확인. 장보기 리스트는 장부 탭',80),
('2026-08-20','20:05','숙소 도착','Hwy 33으로만 진입! 체크인·도어코드는 정보 탭',90),
('2026-08-21','','프리 데이','뭘 할지는 아래 제안 보드에서 — 올리고 👍 누르면 됨',10),
('2026-08-21','오후','캐빈 · 호수','카약 / 패들보드 / 핫텁',20),
('2026-08-21','저녁','저녁 + 캠프파이어(?)','파이어밴 여부 확인 후',30),
('2026-08-22','10:00','체크아웃','정화조 · 쓰레기 정리하고 출발',10),
('2026-08-22','낮','귀가','원하면 가는 길에 한 곳 들르기',20);

-- ---------- 시드: 금요일 제안 보드 ----------
insert into wishes (member, title, category) values
(null,'Kalala Organic Estate','와이너리'),
(null,'Off the Grid Organic Winery','와이너리'),
(null,'다운타운에서 점심','음식'),
(null,'늦잠 + 호수 (카약·패들보드)','액티비티'),
(null,'체리 · 과일 U-pick','액티비티'),
(null,'저녁 캠프파이어 (파이어밴 확인)','액티비티');

-- ---------- 시드: 장보기 ----------
insert into shopping (item, added_by) values
('생수 큰 팩 (숙소 물은 호수물!)', null),
('얼음', null),
('고기', null);

-- ---------- 시드: 설정 ----------
insert into settings (key, value) values
('wifi_code','Chalet1 / cabinlife'),
('door_code','0992'),
('album_url',''),
('cabin_lat','49.771'),
('cabin_lng','-119.209')
on conflict (key) do nothing;
