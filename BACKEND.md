# 백엔드 작업지시서

서버 감시 시스템(PingCheck)의 백엔드를 새로 만듭니다.
프론트엔드는 이미 동작하며, 지금은 JSON 파일을 임시 저장소로 쓰고 있습니다.
이 문서의 목표는 **그 임시 저장소를 실제 시스템으로 바꾸는 것**입니다.

프론트를 고치지 않고 붙일 수 있도록 **API 응답 모양을 그대로 맞추는 것**이
가장 중요한 제약입니다. 4장의 계약을 먼저 읽어 주세요.

- 프론트 주의사항: `NOTES.md`
- 배포 방법: `DEPLOY.md`

---

## 1. 전체 구조

```
                      ┌──────────────────────────────┐
   사용자 브라우저  ──▶ │  web      Next.js (Node)     │
                      │           화면 + API          │
                      └───────┬──────────────┬───────┘
                              │              │
                              │ SQL          │ SQL
                              ▼              ▼
                      ┌──────────────────────────────┐
                      │  db       PostgreSQL          │
                      └──────────────▲───────────────┘
                                     │ SQL
                      ┌──────────────┴───────────────┐
                      │  pinger   Python              │
                      │           15초마다 핑          │
                      └──────────────┬───────────────┘
                                     │ ICMP
                                     ▼
                              감시 대상 장비들
```

컨테이너 3개 + DB 1개입니다. 전부 한 내부망 안에서 돕니다.

### 왜 이렇게 나누는가

**핑은 파이썬이 따로 돕니다.**
핑은 짧은 주기로 계속 도는 일이고, 장비가 늘면 시간이 오래 걸립니다.
API 서버와 같은 프로세스에 두면 화면 응답이 핑에 밀립니다.
프로세스를 나누면 한쪽이 죽어도 다른 쪽은 삽니다.

**두 프로세스는 서로 직접 부르지 않습니다.**
`pinger` 는 결과를 DB 에 쓰고, `web` 은 DB 에서 읽습니다.
서로 API 를 부르게 하면 한쪽이 죽었을 때 다른 쪽도 멈춥니다.
**DB 가 유일한 연결점입니다.**

**web 이 프론트와 API 를 함께 냅니다.**
이미 Next.js 안에 API 라우트가 들어 있어, 컨테이너를 더 늘릴 이유가 없습니다.
나중에 API 만 떼어 내야 하면 5장의 구조를 참고하세요.

---

## 2. 지금 프론트가 하고 있는데 백엔드로 옮겨야 하는 것

> 급한 순서입니다.

### 2-1. 인증 · 권한 (★ 배포 전 필수)

**지금 상태**

- 아이디와 비밀번호가 비어 있지만 않으면 **누구나 로그인됩니다.**
  비밀번호를 아예 확인하지 않습니다.
- 로그인 여부를 브라우저에서만 검사합니다.
  `localStorage` 의 `nocode-auth` 를 직접 넣으면 화면을 그대로 볼 수 있습니다.
- **API 는 요청자를 전혀 확인하지 않습니다.**
  `curl` 로 계정을 만들고 서버를 지울 수 있습니다.
- 화면에서 관리자 버튼을 숨기는 것은 **보기 좋으라고 하는 것**일 뿐입니다.

**해야 할 일**

1. `accounts` 에 비밀번호 해시와 소금값 칸 추가
2. 로그인 API 신설 — 아이디/비밀번호 확인 후 세션 또는 토큰 발급
3. **모든 API 에서 요청자 확인.** 프론트의 `lib/api/handler.ts` 처럼
   한 곳을 거치게 만들고 거기서 막으세요.
4. 권한 검사 — 규칙은 프론트의 `lib/accounts/permissions.ts` 와 같습니다.
   - `admin` : 자기 파트의 서버·계정을 다룸
   - `viewer` : 보기만
   - **둘 다 자기 파트만** 봅니다.
5. 초기 비밀번호를 어떻게 나눠 줄지 정하기 (첫 로그인 시 변경 강제 등)

해시는 새 라이브러리 없이 Node 의 `crypto.scrypt` 로 충분합니다.
비교는 반드시 `timingSafeEqual` 로 하세요.

### 2-2. 목록 거르기 · 쪽 나누기

**지금 상태**

| 화면 | 거르기 | 쪽 나누기 |
| --- | --- | --- |
| 서버관리 | 브라우저 | 브라우저 |
| 계정관리 | 브라우저 | 브라우저 |
| 로그조회 | **서버** | **서버** |

서버관리·계정관리는 전체를 받아 브라우저에서 거릅니다.
지금은 수십 건이라 괜찮지만 **1,000대쯤부터 느려집니다.**

**해야 할 일**
`/api/servers` 와 `/api/accounts` 도 로그처럼 조건과 쪽을 받아
그 쪽만 돌려주도록 바꾸세요. (`/api/logs` 가 이미 그 모양입니다)

프론트는 `lib/useTableState.ts` 에 넘기는 함수만 바꾸면 되도록 짜여 있습니다.

### 2-3. 대시보드 집계

`/api/dashboard/summary` 가 이미 서버에서 셉니다. 다만 지금은
**로그 파일 전체를 읽어서** 셉니다. DB 에서는 질의 두 개로 나누세요.

- 장비별 마지막 `down` 시각 → `GROUP BY server_id` + `MAX(occurred_at)`
- 오늘 `down` 건수 → `COUNT(*)` + `WHERE occurred_at >= 오늘0시`

### 2-4. 핑과 로그 (지금은 아예 없음)

- **핑은 가짜입니다.** 서버를 등록할 때 성공한 척 값을 지어냅니다.
  실제로 아무 데도 접속하지 않습니다.
- **로그는 화면 확인용 240건**뿐입니다. 아무도 쌓지 않습니다.
- 목록의 사용여부 토글은 값만 바꿉니다. 실제 핑 시작·중지와 무관합니다.

### 2-5. 알림

내 계정의 "알림 받기"(`notifyEnabled`)는 값만 저장됩니다.
실제 알림은 없습니다. 붙일 때 **작업 모드를 반드시 확인**해야 합니다. (2-6)

### 2-6. 작업 모드

`settings` 의 `maintenance_mode` 가 켜져 있으면 **알림을 보내지 마세요.**
핑과 로그는 평소대로 돕니다. 알림만 멈춥니다.

끄는 것을 잊는 것이 가장 위험합니다.
**N시간 이상 켜져 있으면 관리자에게 알리는 안전장치**를 권합니다.

---

## 3. 데이터베이스

### 3-1. 표

```sql
-- 업무구분. 지금은 사법/등기/가족/관제 네 가지입니다.
-- 코드(id)는 절대 바꾸지 마세요. 계정 권한이 이 값으로 묶입니다.
CREATE TABLE divisions (
  id    TEXT PRIMARY KEY,          -- judicial, registry, family, control
  label TEXT NOT NULL,             -- 사법, 등기, 가족, 관제
  sort  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE accounts (
  id             BIGSERIAL PRIMARY KEY,
  login_id       TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  password_salt  TEXT NOT NULL,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT NOT NULL,
  division_id    TEXT NOT NULL REFERENCES divisions(id),
  role           TEXT NOT NULL CHECK (role IN ('admin','viewer')),
  enabled        BOOLEAN NOT NULL DEFAULT TRUE,
  notify_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE servers (
  id            BIGSERIAL PRIMARY KEY,
  name_en       TEXT NOT NULL,
  name_ko       TEXT NOT NULL,
  ip            INET NOT NULL UNIQUE,     -- 중복 등록을 DB 가 막습니다
  type          TEXT NOT NULL CHECK (type IN ('방화벽','서버')),
  division_id   TEXT NOT NULL REFERENCES divisions(id),
  enabled       BOOLEAN NOT NULL DEFAULT TRUE,   -- 핑을 쏠지
  -- 아래 세 칸은 pinger 가 갱신합니다.
  status        TEXT NOT NULL DEFAULT 'down' CHECK (status IN ('up','down')),
  response_ms   INTEGER,
  checked_at    TIMESTAMPTZ,
  fail_streak   INTEGER NOT NULL DEFAULT 0,      -- 연속 실패 횟수
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON servers (division_id);
CREATE INDEX ON servers (enabled) WHERE enabled;

-- 상태 변경 이력. 고치거나 지우지 않습니다.
CREATE TABLE logs (
  id             BIGSERIAL PRIMARY KEY,
  server_id      BIGINT REFERENCES servers(id) ON DELETE SET NULL,
  -- 장비를 지워도 "그때 무슨 일이 있었는지" 는 남아야 하므로 값을 복사해 둡니다.
  server_ip      INET NOT NULL,
  server_name_ko TEXT NOT NULL,
  division_id    TEXT NOT NULL,
  type           TEXT NOT NULL
                 CHECK (type IN ('down','up','ping-on','ping-off','registered')),
  detail         TEXT NOT NULL DEFAULT '',
  occurred_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 로그조회의 기본 정렬과 조건에 맞춘 색인입니다.
CREATE INDEX ON logs (occurred_at DESC);
CREATE INDEX ON logs (server_id, occurred_at DESC);
CREATE INDEX ON logs (type, occurred_at DESC);

-- 시스템 설정. 줄이 하나뿐입니다.
CREATE TABLE settings (
  id                 BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
  maintenance_mode   BOOLEAN NOT NULL DEFAULT FALSE,
  maintenance_since  TIMESTAMPTZ,
  maintenance_by     TEXT,
  ping_interval_sec  INTEGER NOT NULL DEFAULT 15,
  fail_threshold     INTEGER NOT NULL DEFAULT 3,
  log_retention_days INTEGER NOT NULL DEFAULT 90
);
```

### 3-2. 꼭 지킬 것

- **`logs` 는 넣기만 합니다.** 수정·삭제 API 를 만들지 마세요.
  이력이 바뀔 수 있으면 이력이 아닙니다. 오래된 것을 지우는 일(보관 기간)만 예외입니다.
- **`servers.ip` 에 UNIQUE 를 겁니다.** 브라우저 검사만으로는
  두 사람이 동시에 같은 IP 를 넣는 것을 막지 못합니다.
- **`division_id` 는 코드값입니다.** 이름(사법 등)을 저장하지 마세요.
  나중에 "사법" 을 "사법업무" 로 바꾸면 저장된 권한이 전부 깨집니다.
- 시각은 전부 `TIMESTAMPTZ` 로 넣고 **UTC 로 저장**하세요.
  화면에 보일 때만 시간대를 적용합니다.

---

## 4. API 계약 (프론트가 이미 이 모양으로 부릅니다)

응답의 **필드 이름과 타입을 바꾸지 마세요.** 바꾸면 화면이 깨집니다.
날짜는 전부 ISO 문자열(`2026-09-13T02:11:00.000Z`)입니다.

### 4-1. 서버

```
GET    /api/servers            → Server[]
POST   /api/servers            → 201 Server | 409 중복 IP | 400 입력오류
PATCH  /api/servers/:id        { enabled: boolean } → Server | 404
```

```ts
Server = {
  id: string; nameEn: string; nameKo: string; ip: string;
  type: "방화벽" | "서버";
  divisionId: "judicial" | "registry" | "family" | "control";
  status: "up" | "down";
  responseMs: number | null;
  checkedAt: string;       // ISO
  enabled: boolean;        // 핑을 쏠지
}
```

**IP 검증 규칙은 프론트와 똑같이 서버에서도 해야 합니다.**
규칙은 `lib/servers/validation.ts` 에 있습니다. 요약하면:

- IPv4 형식, 앞자리 0 금지 (`01.1.1.1` → `1.1.1.1` 과 같은 호스트인데
  글자가 달라 중복 검사를 빠져나갑니다)
- 막는 대역: `0.x`, `127.x`, `169.254.x`, `224~239.x`, `240~255.x`
- 끝자리 `0`(네트워크 주소), `255`(브로드캐스트) 금지
  ※ `/24` 를 전제로 한 규칙입니다. 더 넓은 대역을 쓰면 이 두 개는 풀어야 합니다.

### 4-2. 계정

```
GET    /api/accounts           → Account[]
POST   /api/accounts           → 201 Account | 409 중복 아이디 | 400
PATCH  /api/accounts/:id       { enabled } | { notifyEnabled } | { name,email,phone }
PUT    /api/accounts/:id       관리자 수정 (아이디·파트·권한까지)
DELETE /api/accounts/:id       → 204 | 404
```

**`PATCH` 와 `PUT` 을 나눈 이유**: `PATCH` 는 본인이 자기 정보를 고치는 길이라
**아이디·소속 파트·권한을 받지 않습니다.** 본문에 넣어도 무시해야 합니다.
관리자만 `PUT` 으로 그것들을 바꿉니다.

### 4-3. 로그 (조건과 쪽을 서버가 처리)

```
GET /api/logs?page=1&pageSize=50&from=&to=&serverId=&type=&divisionId=
  → { rows: LogEntry[], totalCount: number }
```

- `from`/`to` 는 `datetime-local` 형식(`2026-09-13T09:00`)입니다.
- `pageSize` 상한은 200 입니다. 안 막으면 전부 달라는 요청이 옵니다.
- 최신이 앞입니다 (`occurred_at DESC`).

### 4-4. 대시보드 요약

```
GET /api/dashboard/summary
  → {
      counts:  { online, offline, disabled, total },
      byType:  [{ type: "방화벽"|"서버", counts: {...} }],
      lastCheckedAt: string | null,
      todayDownCount: number,
      problems: [{ id, ip, nameKo, state: "offline"|"disabled", since: string|null }]
    }
```

- `online` = `enabled` 이고 `status='up'`
- `offline` = `enabled` 인데 `status='down'`
- `disabled` = `enabled=false` (사람이 꺼 둔 것)
- `lastCheckedAt` = **`enabled` 인 장비 중 가장 최근 `checked_at`**
  → 화면은 이 값이 오래되면 "감시 멈춤" 경고를 띄웁니다. 반드시 갱신하세요.
- `since` = 그 상태가 된 시각. 로그에서 마지막 `down`(또는 `ping-off`) 을 찾습니다.

### 4-5. 설정 · 시각

```
GET   /api/settings            → { maintenanceMode, maintenanceSince, maintenanceBy }
PATCH /api/settings            { maintenanceMode: boolean, by?: string }
GET   /api/time                → { epochMs: number, timeZone: string }
```

`/api/time` 은 `Cache-Control: no-store` 를 반드시 붙이세요. 시계는 캐시되면 안 됩니다.

---

## 5. 코드 구조

### 5-1. web (Node / Next.js)

지금도 계층이 나뉘어 있습니다. MVC 로 보면 이렇습니다.

```
pages/api/**          Controller   요청 받고, 검증하고, 상태코드 정하기
lib/*/validation.ts   Validator    입력 검사 (화면과 같은 규칙을 공유)
lib/*/**Store.ts      Model        데이터 읽고 쓰기  ← 여기만 DB 로 바꾸면 됩니다
lib/api/handler.ts    미들웨어      메서드 라우팅 (여기에 인증을 넣으세요)
```

**바꿀 곳은 `lib/*/**Store.ts` 뿐입니다.**
`lib/storage/jsonStore.ts`(파일 읽기/쓰기)를 DB 질의로 바꾸면
Controller 와 화면은 손대지 않아도 됩니다.

나중에 API 를 따로 떼어 내려면(MSA), 위 네 층을 그대로 별도 서비스로 옮기고
Next.js 는 화면만 내도록 하면 됩니다. 지금 구조가 그것을 막지 않습니다.

### 5-2. pinger (Python)

```
pinger/
  main.py          주기 루프
  config.py        환경변수 읽기
  db.py            DB 연결 (psycopg)
  checker.py       핑 한 번 쏘기
  recorder.py      상태 갱신 + 로그 남기기
```

**핑 한 바퀴의 흐름**

```
1) enabled=true 인 서버 목록을 DB 에서 읽는다
2) 동시에 핑을 쏜다 (장비가 많으면 순차로는 주기를 못 지킴)
3) 결과를 모아 한 번에 갱신한다
     - servers.status, response_ms, checked_at, fail_streak
     - 상태가 "바뀐" 장비만 logs 에 한 줄
4) 주기가 남으면 기다린다
```

**반드시 지킬 것**

- **상태가 바뀔 때만 로그를 남깁니다.**
  핑마다 남기면 하루에 수백만 건이 됩니다.
  `up` 이 계속 `up` 이면 기록하지 않고, `up → down` 일 때만 남깁니다.
- **연속 실패 임계값**(`fail_threshold`, 기본 3)을 씁니다.
  한 번 실패로 장애 판정하면 오탐이 쏟아집니다.
  순간적인 패킷 손실은 흔합니다.
- **`checked_at` 은 실패해도 갱신합니다.**
  이 값이 멈추면 화면이 "감시 멈춤" 으로 판단합니다.
  "핑 실패" 와 "핑을 안 쏨" 은 다른 상태입니다.
- **`enabled=false` 인 장비는 건드리지 않습니다.**
- 한 바퀴가 주기보다 오래 걸리면 **겹쳐 돌지 않게** 막으세요.
- 오래된 로그 삭제(보관 기간)도 여기서 하루 한 번 하면 됩니다.

**ICMP 권한**: 도커에서 핑을 쏘려면 `NET_RAW` 권한이 필요합니다.
컨테이너에 `cap_add: [NET_RAW]` 를 주거나, 권한이 필요 없는
`ping` 명령을 호출하는 방식을 쓰세요. (`DEPLOY.md` 참고)

---

## 6. 작업 순서

> 위에서부터 하세요. 아래 것이 위 것에 기댑니다.

| # | 할 일 | 왜 이 순서인가 |
| --- | --- | --- |
| 1 | DB 스키마 + 초기 데이터(divisions) | 전부의 바탕 |
| 2 | `**Store.ts` 를 DB 질의로 교체 | 화면이 바로 실제 데이터로 돕니다 |
| 3 | **로그인 · 인증 · 권한** | 이것 없이는 내부망이라도 배포 불가 |
| 4 | pinger 기본 동작 (핑 → 상태 갱신) | 화면이 살아 움직이기 시작 |
| 5 | 상태 변경 로그 남기기 | 로그조회·지속시간·오늘건수가 채워짐 |
| 6 | 연속 실패 임계값 · 작업 모드 확인 | 오탐과 알림 피로를 막음 |
| 7 | 서버/계정 목록도 서버 페이징 | 장비가 늘어날 때 대비 |
| 8 | 알림 (소리·메일 등) | 위가 다 돌아야 의미가 있음 |
| 9 | 로그 보관 기간 정리 작업 | 운영 시작 뒤 쌓이기 시작할 때 |

### 6-1. 마무리 전 점검

- [ ] `curl` 로 로그인 없이 API 를 불러 **막히는지** 확인
- [ ] 다른 파트 계정으로 로그인해 **남의 파트 장비가 안 보이는지** 확인
- [ ] pinger 를 멈췄을 때 화면에 **"감시 멈춤" 경고가 뜨는지** 확인
- [ ] 작업 모드를 켜고 장애를 내서 **알림이 안 가는지** 확인
- [ ] 같은 IP 를 두 번 등록해 **409 가 나는지** 확인
- [ ] 서버 시간대가 `Asia/Seoul` 인지 확인 (화면의 "현재시간")

---

## 7. 환경변수

`web`

```
DATABASE_URL=postgres://pingcheck:****@db:5432/pingcheck
SESSION_SECRET=****
TZ=Asia/Seoul
```

`pinger`

```
DATABASE_URL=postgres://pingcheck:****@db:5432/pingcheck
PING_INTERVAL_SEC=15
PING_TIMEOUT_SEC=2
FAIL_THRESHOLD=3
TZ=Asia/Seoul
```

**`TZ` 를 빼먹지 마세요.** 리눅스 서버와 컨테이너는 보통 UTC 라서,
그대로 두면 화면의 "현재시간" 이 9시간 이르게 나옵니다.

**핑 주기를 바꾸면** 프론트의 `lib/dashboard/types.ts` 의
`EXPECTED_PING_INTERVAL_MS` 도 같이 맞춰야 합니다. (`NOTES.md` 4-15)
