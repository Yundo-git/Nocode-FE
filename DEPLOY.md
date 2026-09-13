# 배포 안내 (인터넷이 없는 내부망)

목표: 인터넷이 되는 곳에서 **이미지 파일을 만들어**, USB 등으로 옮겨
내부망 서버에서 띄웁니다.

내부망 서버에는 **도커만 설치되어 있으면 됩니다.**
Node, Python, PostgreSQL 을 따로 깔 필요가 없습니다.

---

## 1. 왜 이 방식인가

내부망 서버는 `npm install`, `pip install`, `docker pull` 을 할 수 없습니다.
그래서 **필요한 것을 전부 담은 이미지**를 밖에서 만들어 통째로 옮깁니다.

```
[인터넷 되는 PC]                    [내부망 서버]
  이미지 빌드                          이미지 불러오기
  ──────────▶  pingcheck.tar  ──────▶  docker compose up
                 (USB)
```

주의할 점이 하나 있습니다.
**이미지를 만드는 PC 와 서버의 CPU 종류가 같아야 합니다.**
맥(애플 실리콘)에서 만들고 리눅스 서버(x86)에 올리면 돌지 않습니다.
빌드할 때 `--platform linux/amd64` 를 반드시 붙이세요.

---

## 2. 파일 구성

```
pingcheck/
  docker-compose.yml
  web/          ← 지금 이 저장소
    Dockerfile
  pinger/
    Dockerfile
    requirements.txt
    main.py ...
  db/
    init/01-schema.sql     ← BACKEND.md 3장의 표
```

### 2-1. `web/Dockerfile`

```dockerfile
# ── 1단계: 빌드 (인터넷 필요) ──
FROM node:22-alpine AS builder
WORKDIR /app

# 의존성을 먼저 받습니다. 소스만 바뀌면 이 층은 다시 받지 않습니다.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# next/font 가 폰트를 여기서 내려받아 결과물에 넣습니다.
# 그래서 실행할 때는 인터넷이 필요 없습니다.
RUN npm run build

# ── 2단계: 실행 (인터넷 불필요) ──
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV TZ=Asia/Seoul

COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000
CMD ["npm", "start"]
```

### 2-2. `pinger/Dockerfile`

```dockerfile
FROM python:3.12-slim
WORKDIR /app
ENV TZ=Asia/Seoul

# 권한 없이 핑을 쏘려면 ping 명령이 필요합니다. (3-1 참고)
RUN apt-get update \
 && apt-get install -y --no-install-recommends iputils-ping \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["python", "-u", "main.py"]
```

### 2-3. `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: pingcheck
      POSTGRES_USER: pingcheck
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      TZ: Asia/Seoul
    volumes:
      - db-data:/var/lib/postgresql/data
      # 처음 한 번만 실행됩니다. (데이터가 이미 있으면 건너뜁니다)
      - ./db/init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pingcheck"]
      interval: 10s
      retries: 5
    restart: unless-stopped

  web:
    image: pingcheck-web:1.0.0
    environment:
      DATABASE_URL: postgres://pingcheck:${DB_PASSWORD}@db:5432/pingcheck
      SESSION_SECRET: ${SESSION_SECRET}
      TZ: Asia/Seoul
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  pinger:
    image: pingcheck-pinger:1.0.0
    environment:
      DATABASE_URL: postgres://pingcheck:${DB_PASSWORD}@db:5432/pingcheck
      PING_INTERVAL_SEC: 15
      FAIL_THRESHOLD: 3
      TZ: Asia/Seoul
    # 핑을 쏘려면 이 권한이 필요합니다.
    cap_add:
      - NET_RAW
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  db-data:
```

`.env` (같은 폴더, **git 에 올리지 마세요**)

```
DB_PASSWORD=여기에_긴_비밀번호
SESSION_SECRET=여기에_긴_임의문자열
```

---

## 3. 주의할 점

### 3-1. 도커에서 핑 쏘기

컨테이너는 기본으로 ICMP 를 못 보냅니다. 두 가지 길이 있습니다.

| 방법 | 설명 |
| --- | --- |
| `cap_add: [NET_RAW]` | 파이썬에서 직접 소켓으로 핑. 위 compose 가 이 방식 |
| `ping` 명령 호출 | 권한 설정이 덜 필요하지만 프로세스를 매번 띄워 느림 |

장비가 많으면 첫 번째가 낫습니다.

### 3-2. 데이터는 볼륨에 있습니다

`db-data` 볼륨이 사라지면 **등록한 서버와 계정이 전부 사라집니다.**
`docker compose down -v` 의 `-v` 는 볼륨까지 지웁니다. 쓰지 마세요.

백업:

```bash
docker compose exec db pg_dump -U pingcheck pingcheck > backup_$(date +%F).sql
```

### 3-3. Node 프로세스는 하나로

지금 코드에는 파일/자원을 동시에 고치지 못하게 막는 장치가
**한 프로세스 안에서만** 동작합니다. PM2 cluster 처럼 여러 개로 띄우지 마세요.
DB 로 옮긴 뒤에는 이 제약이 없어집니다.

### 3-4. 시간대

`TZ=Asia/Seoul` 을 세 컨테이너 모두에 넣었는지 확인하세요.
빠지면 화면의 "현재시간" 이 9시간 이르게 나옵니다.

---

## 4. 순서대로 하기

### 4-1. 인터넷 되는 PC 에서 (이미지 만들기)

```bash
cd pingcheck

# CPU 종류를 맞춥니다. 내부망 서버가 x86 이면 amd64 입니다.
docker build --platform linux/amd64 -t pingcheck-web:1.0.0     ./web
docker build --platform linux/amd64 -t pingcheck-pinger:1.0.0  ./pinger

# PostgreSQL 공식 이미지도 같이 받아 둡니다. (내부망에서는 못 받습니다)
docker pull --platform linux/amd64 postgres:16-alpine

# 세 개를 파일 하나로 묶습니다.
docker save \
  pingcheck-web:1.0.0 \
  pingcheck-pinger:1.0.0 \
  postgres:16-alpine \
  | gzip > pingcheck-1.0.0.tar.gz
```

USB 로 옮길 것:

```
pingcheck-1.0.0.tar.gz     (이미지 묶음, 보통 300~500MB)
docker-compose.yml
db/init/01-schema.sql
.env                       (직접 만들어 비밀번호 채우기)
```

### 4-2. 내부망 서버에서 (띄우기)

```bash
mkdir -p /opt/pingcheck && cd /opt/pingcheck
# USB 에서 위 파일들을 복사

# 이미지를 도커에 넣습니다.
gunzip -c pingcheck-1.0.0.tar.gz | docker load

# 들어갔는지 확인
docker images | grep -E "pingcheck|postgres"

# 띄웁니다.
docker compose up -d

# 상태 확인
docker compose ps
docker compose logs -f web
```

브라우저에서 `http://서버주소:3000` 으로 접속합니다.

### 4-3. 새 버전으로 올리기

```bash
# [인터넷 PC] 번호를 올려 다시 만듭니다.
docker build --platform linux/amd64 -t pingcheck-web:1.1.0 ./web
docker save pingcheck-web:1.1.0 | gzip > web-1.1.0.tar.gz

# [내부망 서버]
gunzip -c web-1.1.0.tar.gz | docker load
# docker-compose.yml 의 image 를 1.1.0 으로 고친 뒤
docker compose up -d web
```

**`latest` 를 쓰지 마세요.** 지금 무엇이 돌고 있는지 알 수 없게 되고,
문제가 생겼을 때 되돌릴 수 없습니다. 번호를 붙이면
`docker-compose.yml` 의 숫자만 내려서 이전 버전으로 돌아갑니다.

---

## 5. 문제가 생겼을 때

| 증상 | 확인할 것 |
| --- | --- |
| `exec format error` | CPU 종류가 다름. `--platform linux/amd64` 로 다시 빌드 |
| 화면은 뜨는데 자료가 없음 | `docker compose logs web` 에서 DB 연결 오류 확인 |
| 현재시간이 9시간 이름 | 컨테이너에 `TZ=Asia/Seoul` 이 빠짐 |
| "감시 멈춤" 경고 | `docker compose logs pinger` 확인. 죽었을 수 있음 |
| 핑이 전부 실패 | `cap_add: NET_RAW` 가 빠졌거나 방화벽이 ICMP 를 막음 |
| 빌드 때 폰트 오류 | 빌드 PC 가 인터넷에 연결돼 있어야 함 (실행 때는 불필요) |
