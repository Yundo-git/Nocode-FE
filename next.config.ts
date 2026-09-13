import type { NextConfig } from "next";

// 이 폴더(web)가 프로젝트 뿌리입니다.
//
// 이걸 적어 두지 않으면 Next 가 위쪽 폴더를 훑어 올라가며 package-lock.json 을 찾고,
// 홈 디렉터리에 있는 lock 파일을 뿌리로 잡아 버립니다.
// 그러면 빌드 산출물에 엉뚱한 파일이 딸려 들어가거나 모듈을 못 찾는 일이 생깁니다.
const projectRoot = process.cwd();

// API 서버(pingcheck-be)의 주소입니다.
// 도커로 옮기면 http://api:4000 처럼 컨테이너 이름이 됩니다.
const apiOrigin = process.env.API_ORIGIN ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ── 도커 이미지에 넣을 꾸러미를 추려 냅니다 ──────────────────────────
  //
  // ★ 빌드하면 .next/standalone 안에 **실행에 필요한 것만** 모입니다.
  //   node_modules 를 통째로 넣으면 이미지가 1GB 를 넘습니다.
  //   인터넷 없는 내부망에는 이미지를 파일로 옮겨야 해서 크기가 곧 작업 시간입니다.
  //
  // ★ web/Dockerfile 이 이 폴더를 복사합니다. 이 줄을 지우면 빌드가 깨집니다.
  //   (개발에는 아무 영향이 없습니다. next build 에서만 쓰입니다)
  output: "standalone",
  // 개발·빌드 때 모듈을 찾는 기준입니다.
  turbopack: {
    root: projectRoot,
  },
  // next start 가 실행에 필요한 파일을 추려낼 때의 기준입니다.
  outputFileTracingRoot: projectRoot,

  // ── /api/* 를 백엔드로 넘깁니다 ────────────────────────────────────────
  //
  // ★ 왜 브라우저가 4000 번을 직접 부르지 않는가
  //   주소(포트)가 다르면 브라우저는 "다른 출처" 로 봅니다. 그러면
  //     - CORS 설정이 필요하고
  //     - 쿠키를 주고받는 조건이 까다로워집니다 (sameSite)
  //   여기서 넘겨 주면 브라우저에게는 전부 같은 주소라 그 문제가 사라집니다.
  //
  //   세션 쿠키가 화면과 같은 출처에 저장되므로 sameSite=lax 가 제대로 듭니다.
  //
  // ※ 이 rewrite 는 pages/api/ 에 같은 경로의 파일이 없어야 동작합니다.
  //   (파일이 있으면 그쪽이 먼저 잡습니다)
  //   그래서 목 API 라우트를 전부 지웠습니다.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
