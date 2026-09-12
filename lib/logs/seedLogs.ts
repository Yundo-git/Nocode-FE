import { SEED_SERVERS } from "@/lib/servers/mockServers";
import type { LogEntry, LogType } from "@/lib/logs/types";

// data/logs.json 이 없을 때 처음 한 번 넣는 값입니다.
//
// **서버 시드 목록에서 만들어 냅니다.**
// 로그에만 있고 목록에는 없는 장비가 생기면, 로그조회의 장비 선택칸에
// 나오지 않는 로그가 화면에 뜨게 됩니다. 같은 곳에서 뽑아 그런 일을 막습니다.
//
// 실제 로그는 핑을 쏘는 쪽(백엔드)이 쌓습니다. (NOTES.md 4-12)
const CYCLE: readonly { type: LogType; detail: string }[] = [
  { type: "down", detail: "응답 없음 (3회 연속)" },
  { type: "up", detail: "응답 정상" },
  { type: "ping-off", detail: "관리자가 감시를 중지함" },
  { type: "ping-on", detail: "관리자가 감시를 시작함" },
];

function build(): LogEntry[] {
  const rows: LogEntry[] = [];
  // 파일을 처음 만드는 시점을 기준으로 과거로 뻗습니다.
  // 고정 날짜로 두면 화면에 늘 며칠 전 기록이 "최신" 으로 떠서 어색합니다.
  const base = Date.now();

  for (let i = 0; i < 240; i += 1) {
    const server = SEED_SERVERS[i % SEED_SERVERS.length]!;
    const event = CYCLE[i % CYCLE.length]!;

    rows.push({
      id: `log-${String(i).padStart(4, "0")}`,
      serverId: server.id,
      serverIp: server.ip,
      serverNameKo: server.nameKo,
      divisionId: server.divisionId,
      type: i === 0 ? "registered" : event.type,
      detail: i === 0 ? "서버가 등록됨" : event.detail,
      // 뒤로 갈수록 과거입니다. (7분 간격 -> 약 28시간 분량)
      occurredAt: new Date(base - i * 7 * 60_000).toISOString(),
    });
  }

  return rows;
}

export const SEED_LOGS: readonly LogEntry[] = build();
