import type { Server } from "@/lib/servers/types";

// data/servers.json 이 아직 없을 때 처음 한 번 넣는 값입니다.
// 파일이 만들어진 뒤에는 이 값을 고쳐도 반영되지 않습니다.
// (다시 넣으려면 data/servers.json 을 지우면 됩니다.)
export const SEED_SERVERS: readonly Server[] = [
  {
    id: "srv-test-001",
    nameEn: "test-server-01",
    nameKo: "테스트 서버",
    ip: "1.1.1.1",
    type: "서버",
    divisionId: "control",
    status: "up",
    responseMs: 12,
    checkedAt: "2026-09-12T11:48:20.243Z",
    enabled: true,
  },
];
