import type { Server } from "@/lib/servers/types";

// UI 를 확인하려고 넣어 둔 임시 서버입니다.
// 백엔드가 붙으면 이 파일은 지우고 useServers.ts 의 fetchServers 만 바꾸면 됩니다.
export const MOCK_SERVERS: readonly Server[] = [
  {
    id: "srv-test-001",
    name: "테스트 서버",
    ip: "1.1.1.1",
    type: "일반",
    status: "up",
    responseMs: 12,
    checkedAt: "2026-09-12T11:48:20.243Z",
    enabled: true,
  },
];
