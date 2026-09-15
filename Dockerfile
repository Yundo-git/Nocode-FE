# ── 1단계: 화면을 빌드합니다 ────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# ★ /api/* 를 어디로 넘길지는 **빌드할 때 굳습니다.**
#   next.config.ts 의 rewrites() 는 next build 가 한 번 실행해서
#   routes-manifest.json 에 적어 둡니다. 그 뒤로는 환경변수를 바꿔도
#   읽지 않습니다. 실행할 때 넣으면 될 줄 알고 비워 뒀다가,
#   컨테이너가 자기 자신(localhost:4000)을 찾아 로그인이 500 이 났습니다.
#
#   도커 망 안에서 API 는 언제나 http://api:4000 입니다. (docker-compose.yml)
#   다른 이름을 쓰려면 --build-arg API_ORIGIN=... 로 넘기세요.
ARG API_ORIGIN=http://api:4000
ENV API_ORIGIN=$API_ORIGIN

RUN npm run build

# ── 2단계: 실행만 하는 이미지 ───────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV TZ=Asia/Seoul
ENV NEXT_TELEMETRY_DISABLED=1
# 컨테이너 밖에서 들어오는 요청을 받으려면 0.0.0.0 이어야 합니다.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# standalone 은 실행에 필요한 것만 모아 둔 꾸러미입니다. (next.config.ts 참고)
# static 과 public 은 따로 넣어야 합니다 — standalone 에 들어가지 않습니다.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

USER node

EXPOSE 3000

CMD ["node", "server.js"]
