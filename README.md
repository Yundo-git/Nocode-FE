# web

PingCheck 의 화면입니다. Next.js 16 (Pages Router) · React 19 · Tailwind 3.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm start
```

`/api/*` 는 `next.config.ts` 의 rewrite 가 백엔드(:4000)로 넘깁니다.
따로 띄워 두어야 화면이 돕니다.

> **`middleware.ts` 를 지우지 마세요.** rewrite 는 접속자 IP 를 넘겨 주지 않습니다.
> 없으면 모든 세션이 `::1` 로 기록되고 로그인 시도 제한이 전 사용자를 한 덩어리로
> 셉니다.

구조와 판단 근거는 뿌리의 [ARCHITECTURE.md](../ARCHITECTURE.md) 를 보세요.
