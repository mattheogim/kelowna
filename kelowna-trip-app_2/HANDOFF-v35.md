# HANDOFF v35 — 켈로나 여행수첩 → 마법사 대전 (상시 게임)

> **이 문서 하나로 다음 세션에서 이어서 패치할 수 있게 만든 기준 문서.**
> v34까지의 여행 앱이 v35에서 상시 가챠+배틀 게임으로 전환됨. 아래는 배포 정보 → 현재 시스템 전체 → v34→v35 변경 전 기록 → 코드 지도 → 다음 세션 시작법 순서.

---

## 1. 배포 정보 (불변)

| 항목 | 값 |
|---|---|
| Repo | github.com/mattheogim/kelowna → 폴더 `kelowna-trip-app_2/` |
| 실주소 | https://mattheogim.github.io/kelowna/kelowna-trip-app_2/ |
| 업로드 | GitHub 웹에서 파일 드래그 (app.js · style.css · index.html · sw.js) |
| 배포마다 | sw.js `CACHE="kel-vNN"` +1, app.js `BUILD`/`BUILD_NO` +1, index.html `<meta name="build">` +1 |
| 확인 | **시크릿창** (구 SW 캐시 때문에 일반창 판정 금지) |
| Supabase | https://vprbjkqvytumfxbftofd.supabase.co (anon key는 config.js에 공개) |
| 반복 사고 2패턴 | ① Pages 캐시/구SW → 시크릿창 ② **SQL 미실행** → 신기능 전부 침묵 |

현재 버전: **v58** (`BUILD="2026-08-24 v58"`, `BUILD_NO=58`, `CACHE="kel-v58"`). v35 배포 후 v36에서 포켓몬 무대·트레이너 카드·관전 모드 추가.

## 2. DB 스키마 (v35 기준 전체)

- 기존 14테이블: checkins, expenses, polls, votes, itinerary, wishes, wish_likes, shopping, wine_ratings, reactions, sirens, settings, characters, inventory (+ liar_games, rush_locks, push_subs)
- **v35 신규 (SQL-v35.sql):**
  - `checkins.spell text` — 무전에 첨부된 주문 id
  - `wiz_stats(member pk, xp, ak_used, ak_bonus, exp_map jsonb, wins, losses, streak, sp_spent, dodge)`
  - `spellbook(member, spell_id, lv, pk(member,spell_id))`
  - `battles(id, created_at, a, b, phase, turn, pick_a, pick_b, state jsonb, winner, sched_at)`
    - phase: invite → sched → play → done / declined / expired
- 실시간: 기존 채널 "kel-live"(14테이블)·"kel-liar" + **v35 "kel-b35"** (battles·spellbook·wiz_stats)
- 푸시: `/functions/v1/notify`, `sendPush(title, body, tag, includeSelf)` 본인 제외 기본

## 3. v34 → v35 변경 전 기록

### 3-1. 로스터 (세계관 통일: 해리포터 + 반지의 제왕 마법사만)
- **제거 8:** jobs(잡스), yoda, son(손흥민), musk, freddie, bruce(이소룡), smaug, legolas
- **초월 t6 신설** — `TIERS`에 `{t:6, 초월, TRANSCENDENT, p:0.1, color:#8000A8}` 추가, t1 45.7→45.6
  - `riddle` 톰 리들(진명) 🐍 0.05% / `sauron` 사우론 👁️ 0.05%
- **신화 t5 재편:** dumbledore · voldemort · **snape↑** · **grindelwald↑** · grey→**간달프(백색) 리네임**(🤍) · **saruman 신규**(🗼)
- **potter t5→t4 강등.** 신규 t4: galadriel 🌟, witchking 👑. 신규 t3: elrond 💫, radagast 🐦
- FX 신규 3종: darklord(리들)·greateye(사우론)·whitehand(사루만) — FX 레지스트리 + specialFx T맵 + `FX2C()`가 캔버스 증폭 담당
- 숨은 각성 trap 시스템(donotchoose 등 → chosen)은 그대로

### 3-2. 무기
- **제거 13:** firstphone, teslacar, falcon, micstand, nunchaku, yodasaber, sonboots, captainband, soccerball, varmonitor, scarf_son, holocron, jedirobe
- **신규 7:** voldywand(t5) · sauronmace(t5) · potterwand(t4, 프리오리 이스터에그) · whitestaff(t4) · morgulblade(t4) · nenya(t4) · vilya(t3)
- want 수정: onering → [gollum, **sauron**], palantir → [saruman, sauron]

### 3-3. 주문 시스템 (신규)
- `SPELLS` 23종 (모듈 상단). 등급 확률은 캐릭터 TIERS와 동일하되 t6 제외.
- **아바다 케다브라: 절대 0.1%** (부스트 시 ×배수), **평생 10발**(wiz_stats.ak_used), 킬 성공 시 1발 환급(ak_bonus). 익스펠리아르무스만 카운터 가능 — **지팡이당 10회**(exp_map jsonb, 장착 무기 id 기준).
- 중복 뽑기 = 자동 Lv+1 (최대 5, 위력 +8%/Lv). 배틀 레벨업 포인트로도 강화 가능.
- **주문 티켓:** 20분당 1장, 최대 12 (`kel_st`/`kel_st_t`). 러시 타임엔 주문도 무료.
- 무전 이펙트 첨부: 문자/음성 교신 시 🪄 칩으로 주문 선택(`window.KSEL`) → checkins.spell → 수신자 전원 화면에 `FX2.cast()` 발동 (첨부는 차지 미소모).

### 3-4. 배틀 (신규 — 실시간 1:1 턴제)
- 교신 탭 친구 카드 ⚔️ → **시간 선택**(지금/30분/1시간/오늘20:00/직접입력) → battles insert(phase invite, sched_at).
- **10분 미응답 패널티:** invite 생성 후 10분 내 수락/거절 없으면 `sweepInvites()`가 phase→expired + 받은 쪽 `dodge+1`. **거절은 정당한 응답이라 무죄.**
  - 낙인 효과: 최대 HP·공격력 **-5%/스택(최대 5)**. **본인 화면엔 배지 없음**(피통만 미묘하게 깎임) — 상대·전적판엔 `👻×N` 표시. **배틀 1판 완주마다 1스택 소멸.**
- 수락 배너 3버튼: **⚡지금**(즉시 play) / 예약 수락(sched) / 거절. sched 중엔 어느 쪽이든 **⚡ 지금 하자** 제안 → 상대 ㄱㄱ 동의 시 조기 시작(state.early). sched_at+2시간 노쇼 → expired(낙인 없음). **v37:** 보낸 invite ✖회수, sched 양측 ✖파토 가능 — phase 'canceled', 낙인 없음, 파토는 전원 푸시 통보. **v40 안정화:** 매치업 중복 도전장 자동 취소(dedupeBattles/sweep)+연타 가드, 배너는 목록 변경시에만 DOM 재구성(1초 틱은 시간 텍스트만 — 재애니메이션 지터 제거), FX2 캔버스 유휴 시 display:none+blend 제거, 오버레이 backdrop-filter 제거, kelLoad35 350ms 디바운스, 홈 라이브 리렌더 2.5s 스로틀.
- **동시 배틀:** 여러 명과 invite/sched 동시 보유 가능. 단 같은 상대와 중복 금지, **phase=play는 한 번에 1판**(입장·즉시수락이 막힘). 배너는 #duel-banners에 최대 4줄 스택.
- 턴: 양쪽 몰래 pick(25초, 시간초과=패스) → pick_a/pick_b 조건부 update → **a쪽 폰이 resolver**(`resolveTurn`, `.eq("turn")` 가드로 1회만).
- HP = 90 + 캐릭터티어×14 + Lv×4 (낙인 반영). 위력 = pow × (1+0.08(spLv-1)) × (0.9+0.06tier) × 0.85~1.15 × 크리8%(1.5) × 각성1.35 × 낙인.
- 상태: 도트(크루시오/세크텀 3턴), 기절(스투페파이 30%/페트리 20%), 실드(프로테고 70%/패트로누스 100%+힐12, 아바다는 못 막음), 약화(레비/윙가), 버프(루모스+30%), 임페리오(상대 픽 랜덤 강제), 오블리비아테(주문 1개 이 판 삭제).
- XP: **승 20+턴보너스 / 패 35+연패×5** (질수록 큼). Lv = 1+floor(sqrt(xp/15)). 강화 포인트 = Lv-1-sp_spent.
- **배틀 화면 = 포켓몬식 무대(v35.1):** 상대 스프라이트 우상단·내 스프라이트 좌하단(크게), 타원 플랫폼, HP박스 대각 배치, 하단 텍스트박스. 턴 해소 로그를 파싱해 **돌진(lunge)→주문 FX(스프라이트 좌표 기준)→피격 셰이크→데미지 팝→기절(faint)/승리 바운스** 연출(playTheatre, __btSeen으로 중복 재생 방지).
- **스프라이트 이미지 로더:** repo `kelowna-trip-app_2/chars/<캐릭터id>.png` 파일이 있으면 자동으로 이미지 스프라이트 사용(load 이벤트 → .hasimg), 없으면 이모지 폴백. 홈 트레이너 카드에도 동일 적용. 이미지 수급은 유저가 직접.
- **홈 트레이너 카드(kelMyCardHtml, 허브 내부):** 내 스프라이트(탭=이펙트)·이름·등급·Lv·전적·장착 지팡이·배운 주문 이모지(Lv 뱃지, 탭=주문서).
- **관전 모드(v36):** 홈 허브 아래 "⚔️ 결투장" 보드에 진행 중(LIVE·관전 버튼)/예정(시간)/최근 1시간 결과(리플레이)가 전원에게 노출. 관전자는 openSpectate로 같은 포켓몬 무대+연극을 실시간 시청(픽 내용은 ●/○만, 주문은 비공개). **v48:** 무대 부품 id를 창별 네임스페이스(bt-/sp-)로 분리(내 배틀·관전 동시 오픈 시 연출 혼선 제거), 관전도 부분 갱신(픽 변화는 텍스트만)+연출 중 리빌드 유예+스크롤 보존, 끝난 판 '리플레이'는 마지막 8줄 재생. 참가자는 좌하단 고정, 관전자는 a가 좌하단(__pkMap 배역).
- 결과창 확인 기록은 kel_bt_seen **목록**(최근 80개) — 단일 값이던 시절 done 배틀 2개가 번갈아 재등장하던 좀비 결과창 버그 v47에서 수리. 보상 지급 가드: `kel_bt_paid_<id>` (각자 자기 것만 갱신).

### 3-5. 이스터에그 5종 (발동 시 `kel_egg_*` 해금 → 궁합표 표시)
1. **neville**: 네빌+그리핀도르의검 vs 리들 → ×5 + 리들 아바다 환급 봉인
2. **mtdoom**: 절대반지 장착+인센디오 vs 사우론 → ×6, 대신 사우론 선공권
3. **priori**: 해리+potterwand가 익스펠로 아바다 막으면 시전자에게 반사(즉사)
4. **molly**: 몰리 vs 벨라트릭스 → 모든 위력 ×3
5. **lockhart**: 록하트+오블리비아테 → 삭제 확정, 50% 자기 기절

### 3-6. 상점 v2 / 뽑기 허브
- **홈 최상단 허브**(`kelHubHtml`): 🧙/🪄/📜 대형 3버튼 + 상점·주문서·궁합·전적 미니 4버튼 (data-hub 위임).
- $10.99 ×3 무제한: 캐릭터 20롤 리셋 / 무기 티켓 12 풀충 / 주문 티켓 12 풀충.
- **$100 프리미엄: 하루 6장**(P100_PER_DAY=6, 종류 공유 카운트) — 종류 선택(`openPackChoose(100)`) → 캐릭터는 기존 5장 1택, 무기/주문은 5장 **전부 획득**(`openMultiWS`).
- **$1,000 울트라: 주 3장**(캐릭터·무기·주문 각 1, ISO주 리셋 `kel_ultra_wk`) — 확률 10배, 캐릭터 3장 1택 / 무기·주문 3장 전부.
- **광고 시스템 완전 삭제**(ad-btn·바인딩 제거, showAd는 데드코드로 잔존). 퀴즈 2배는 유지.

### 3-7. 도적의 지도 (교신 탭 상단)
- 양피지 카드 + 세피아 필터(`#map.marauder .leaflet-tile-pane`), 기존 Leaflet `drawMap` 래핑.
- **📢 전원 위치 소집**(target:"all" + 푸시) / 📍 내 위치 / **1시간 자동 공유**(`kel_autoshare`, `checkRequests` 래핑 — 켜져 있으면 요청 오는 즉시 자동 응답).
- 마커 등장 발자국 연출(.footstep).

### 3-8. FX 2.0 (모듈 최상단 `FX2`)
- **WebGL 우선 + Canvas2D 자동 폴백** 단일 캔버스 `#fx2`(z640, screen 블렌드). 아이폰 사파리 WebGL 지원 확인됨. contextlost 시 2D로 자동 전환.
- API: `burst/ring/beamTo/arc(전기)/glyphBurst(이모지 점군)/flash/stamp(타이포)/shake(트라우마)/hitstop/cast(spellId)/liftUI`.
- `cast()` 5단계 문법: 예열→발사→비행→임팩트→잔향. 아바다=💀점군+AVADA KEDAVRA 스탬프, 패트로누스=🦌점군, 윙가디움=UI 리프트.
- 팩 연출 훅: 공개 1.3초 전 **등급 티징**(t4↑는 한 단계 낮은 색 페이크→진짜 색 스냅, `.pack-tease`), 공개 순간 t5↑ 히트스톱+대형 버스트.
- `FX2C(c)`: 리들/사우론/사루만/신화 캐릭터 시그니처 증폭.

### 3-9. 대격변 마이그레이션 (각자 v35 첫 실행 시 1회)
1. **캐릭터 보상** — 로스터에서 삭제된 캐릭터(jobs/yoda/son/musk/freddie/bruce/smaug/legolas) 보유자에게 🪦 모달 → **울트라 쿠폰 ×150 + 프리미엄 쿠폰 ×150** 지급(`kel_x_ultra`/`kel_x_prem` — 기존 선물 시스템 재사용) 후 재뽑기 유도. 가드 `kel_mig35_comp`. 마법사 캐릭터 보유자는 아무 일 없음.
2. **무기 소각** — 보유 무기 중 **1개만 선택해서 남김**(수량도 1로), 나머지 전부 delete + 남긴 것 자동 장착. 제거된 13종 무기는 선택지에서 제외(강제 소각). 가드 `kel_mig35_wipe`. 0~1개 보유자는 조용히 통과.
3. **쿠폰 소모 규칙** — 상점에서 주간(울트라)/일일(프리미엄) 한도 소진 시 쿠폰이 **자동으로 대신 소모**됨(잔량은 상점 버튼에 🎟️N 표시). 캐릭터-$100 경로는 기존 openMulti 내부 로직이 처리.

### 3-10. v44 — 재설치 안전 · 전투 확장
- **대격변·쿠폰 서버 이관:** 완료 플래그(__m35c/__m35w)와 울트라·프리미엄 쿠폰(__xu/__xp)을 wiz_stats.exp_map(jsonb)에 저장 — 앱 재설치/기기변경에도 유지. 로컬 잔액은 1회 자동 이관(__cm). 소각 모달에 "이미 골랐었어 — 건너뛰기" 탈출구.
- **전투 상태 확장:** 💤솜니움(t3, 수면 2턴·행동 70% 실패·피격 시 기상), ⚡리네베이트(t2, 수면·기절 해제+8힐+수면 면역, 잠든 채 시전 가능한 유일 주문). 🔥계열(incendio/confringo/fiendfyre): 25% 화상 도트, 잠든 상대 1.5배. 💧아구아멘티: +6힐·자기 화상 소화·상대 불 픽 60% 상쇄.
- **배틀 UX:** openBattle 시그니처 게이트(같은 상태 재렌더 금지)+스크롤 보존+연극 중 리빌드 유예 → 화면 점프·깜빡임 제거. 무브 목록은 자체 스크롤박스(36vh)·등급순 정렬·계열 이모지+예상 위력 표시. ❓이기는 법 가이드(openBattleGuide). 주문서 필터(전체/공격/방어/상태/보조)+상세에 예상 위력.
- **FX 3배:** 활성 시에만 mix-blend screen 재점등, 물량 2.4배, 트레일 연장, 2중 충격 링+상승 불꽃 상시, 무대 캐스팅 비네트+지면 충격링.

### 3-11. v45 핫픽스 — 오버레이 유령 스택
근본 원인: 코어 CSS에 전역 [hidden] 규칙이 없어, ID 셀렉터의 display:flex가 hidden 속성을 이김 → v35 이후 모든 오버레이가 "닫아도" 투명하게 남아 터치를 가로챔(✕ 무반응·결투신청 모달 전체 무반응·렉·딤 중첩의 진짜 원인). 수리: 전역 `[hidden]{display:none!important}` + 부팅 시 유령 오버레이 강제 정리.

### 3-12. 기타
- **라이어 게임 + 같이한 것(MISSIONS)** → INFO 탭 `<details class="arch">` "🗄️ 여행 아카이브"로 이동(숙소·규칙·이동·역할 포함). 교신 탭에서 제거.
- 전체화면 오버레이 공통 ✕(`.ovx` data-ovx 위임): 무기고·상자·퀴즈·결과·주문서·배틀·상점 등.
- 튜토리얼 v35 전면 교체(`tutSteps` 재할당) — 게이트 `kel_tut !== "35"`.
- 무전 3D(.ptt3d 틸트+녹음 글로우), 궁합표 v2(`openSynergy` 재할당: t6/5/4 + 이스터에그 ???잠금).
- INFO 내캐릭터 영역에 📜주문(주문서/⚔️전적) 행 추가.

## 4. localStorage 키 (v35 신규)
`kel_st`/`kel_st_t`(주문 티켓), `kel_ultra_wk`(ISO주|사용종류), `kel_autoshare`(자동공유 만료ts), `kel_egg_*`(이스터에그), `kel_bt_paid_*`(배틀 보상 가드), `kel_bt_seen`, `kel_tut`="35", `kel_mig35_comp`/`kel_mig35_wipe`(대격변 가드). 기존: kel_wt(무기티켓), kel_p100(프리미엄 일일), kel_wb2/kel_ub10(배수쿠폰), kel_fate, kel_rolls, kel_rush5 등.

## 5. 코드 지도
- app.js = **코어(~2600줄, v34 + v35 수술 패치)** + 말미 **v35 모듈(~1250줄, `/* v35 — 마법사 대전 업데이트 */` 주석부터)**.
- 모듈이 코어 함수 3개를 재할당으로 교체: `openSynergy`, `tutSteps`, `checkRequests`(자동공유 래핑) + `drawMap` 래핑.
- 코어 수술 지점: TIERS(t6)·ROSTER·FX/specialFx T·charFx(FX2C 훅)·openPack(티징+FX2)·WEAPONS·renderHome(허브)·renderStamp(도적의지도/주문칩/⚔️/아카이브 이동)·renderInfo(아카이브·주문행·상점 라우팅)·onLive(checkins spell cast)·P100_PER_DAY=6·canBuy1000(주간제)·튜토리얼 게이트.

## 6. 다음 세션 시작 프롬프트 (복붙용)
> "켈로나 앱(마법사 대전) 이어서. HANDOFF-v35.md 첨부함 — 이거 기준으로 [원하는 변경] 패치해줘. repo mattheogim/kelowna의 kelowna-trip-app_2, 배포는 GitHub 웹 드래그, 버전 v36으로 올려서 4파일 주고, DB 바뀌면 SQL도."

## 7. 배포 체크리스트 (v35)
1. GitHub → kelowna-trip-app_2 → 4파일 드래그 업로드(app.js, style.css, index.html, sw.js) → Commit
2. **supabase.com → SQL Editor → New query → SQL-v35.sql 전체 붙여넣기 → Run** (미실행 시 배틀 "생성 실패"·주문 저장 안 됨)
3. 2~3분 뒤 시크릿창에서 접속 → INFO 하단 빌드 "v35" 확인
4. **전원 강제 업데이트 — 완전 자동(무컨펌):** 새 빌드가 처음 켜지는 순간(누구 폰이든) autoRollout이 settings.min_version을 즉시 올림 → 전원 푸시 + 자동 갱신. 파일 업로드가 곧 배포다. **v43 DB 게이트(1회성 SQL-v43-GATE.sql):** 클라이언트가 모든 요청에 x-app-version 헤더를 싣고, app_ok() 함수 + as restrictive 정책이 min_version 미만의 **모든 쓰기를 DB에서 거절**(구버전은 뭘 눌러도 서버가 막음). SELECT와 realtime은 열어둠 — Realtime은 request.headers가 없어 게이트를 걸면 신버전까지 이벤트가 끊기기 때문. 구버전 폰은 settings 실시간/폴링으로 min_version을 보고 스스로 hardUpdate. 이 SQL은 한 번만 돌리면 이후 영구 자동(비교값이 settings.min_version 동적 참조). **v41 워치독:** 모든 폰이 settings 실시간+45초 폴링+포그라운드 복귀 시 min_version을 검사, 낮으면 그 자리에서 잠금 스플래시(📦 서버가 멈췄다) → 1.2초 뒤 자동 재시작. **v46:** 재시작은 캐시·SW 정리를 최대 2초만 기다리고 무조건 이동(매달림 방지, 3초 이중 안전핀), sessionStorage 루프 브레이커(3회 실패 시 자동 중단→수동 갱신 벽), 버전 충족 부팅 시 카운터 리셋. 라이어 자동오픈은 진행중+3시간 이내 판만(kel_liar_ph 기억, done 제외), rerender 180ms 코얼레싱+스크롤 보존, 지도 발자국 애니메이션 세션당 1회. **v42:** .ovx 40px+히트슬롭 60px, 닫기 위임은 id 목록 없이 body 직계 오버레이로 walk-up(모든 화면 공통), 어두운 배경 탭=닫기(btbox·migbox 제외). 비상용 수동: SQL Editor `update settings set value='NN' where key='min_version';`
5. 대격변: 각자 첫 실행에서 (삭제 캐릭터 보유자면) 위로금 모달 → 전원 무기 1개 선택 소각 모달이 순서대로 뜸 — 되돌릴 수 없으니 미리 공지 추천
6. 테스트: 주문 1뽑 → 무전에 🪄이펙트 첨부 전송(다른 폰에서 발동 확인) → 폰 2대 ⚔️ 배틀(시간 선택→수락→턴) → 도적의지도 📢소집 → 초대 10분 방치 시 상대 폰 전적에 👻 확인
