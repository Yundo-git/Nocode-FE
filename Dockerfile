# ── 1단계: 화면을 빌드합니다 ────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# 빌드할 때 이미 굳는 값이 없도록 주의합니다.
# API 주소는 서버에서 읽으므로(next.config.ts 의 rewrites) 여기서 넣지 않습니다.
ENV NEXT_TELEMETRY_DISABLED=1
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
