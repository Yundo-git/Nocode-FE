import { NextResponse, type NextRequest } from "next/server";

// ── /api/* 를 백엔드로 넘길 때 접속자 IP 를 함께 보냅니다 ────────────────
//
// ★ 이 파일이 없으면 백엔드는 모든 접속자를 ::1(로컬)로 봅니다.
//   next.config.ts 의 rewrite 는 **서버가 대신 요청을 보내는** 방식이라,
//   백엔드 입장에서는 접속자가 아니라 Next 서버가 부른 것으로 보입니다.
//
//   그러면 이런 것이 전부 망가집니다.
//   - "로그인된 기기" 목록에 전부 ::1 만 나옴
//   - 로그인 시도 횟수 제한이 **모든 사람을 한 덩어리로** 셈
//     (한 사람이 10번 틀리면 전 직원이 10분간 못 들어옵니다)
//
//   미들웨어가 지나가면 Next 가 x-forwarded-for 를 붙여 주고,
//   백엔드의 trust proxy 설정이 그 값을 읽습니다.
//
// ※ 헤더를 바꾸지 않고 그대로 통과시키기만 해도 됩니다.
//   NextResponse.next({ request }) 를 거치는 것 자체가 필요합니다.
export function middleware(request: NextRequest) {
  return NextResponse.next({ request: { headers: request.headers } });
}

export const config = { matcher: "/api/:path*" };
