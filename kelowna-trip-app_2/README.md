# 켈로나 여행수첩 — 띄우는 법 (10분)

## 1. Supabase (5분)
1. https://supabase.com → 로그인 → **New project** (리전 West US 아무거나)
2. 왼쪽 **SQL Editor** → New query → `schema.sql` 내용 전체 붙여넣기 → **Run**
3. **Project Settings → API** 에서 두 개 복사:
   - Project URL
   - anon public key

## 2. 키 넣기 (1분)
`config.js` 맨 위 두 줄에 붙여넣기:

```js
const SUPABASE_URL = "https://xxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJ...";
```

## 3. 배포 (2분)
- https://app.netlify.com/drop 열고 이 **폴더째로 드래그**
- 나오는 `https://….netlify.app` 주소를 단톡에 공유

## 4. 각자 폰에서 (1분)
- 링크 열기 → Safari 공유 버튼 → **홈 화면에 추가**
- 처음 열면 자기 이름 선택

## 참고
- WiFi 비번 · 도어코드 · 숙소 정확한 좌표는 앱 **정보 탭**에서 입력 (전원 실시간 공유됨)
- 일정·투표는 앱 안에서 수정/추가 가능. 파일 다시 배포할 필요 없음
- 키 없이 열면 미리보기 모드 (일정·정보만 보임)
- 이름/색 바꾸려면 `config.js`의 MEMBERS 수정 후 다시 드래그 배포
