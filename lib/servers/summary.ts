import { getDisplayState, type Server } from "@/lib/servers/types";

export type StateCounts = {
  readonly online: number;
  readonly offline: number;
  readonly disabled: number;
  readonly total: number;
};

function countStates(servers: readonly Server[]): StateCounts {
  let online = 0;
  let offline = 0;
  let disabled = 0;

  for (const server of servers) {
    const state = getDisplayState(server);

    if (state === "online") online += 1;
    else if (state === "offline") offline += 1;
    else disabled += 1;
  }

  return { online, offline, disabled, total: servers.length };
}

// 전체 현황과, 알림에 쓸 장애 목록을 계산합니다.
//
// 업무구분별 집계는 두지 않습니다.
// 계정은 자기 파트의 장비만 보기 때문에, 한 사람 화면에서는
// 업무구분이 사실상 하나뿐입니다. (lib/accounts/permissions.ts)
export function summarize(servers: readonly Server[]): {
  overall: StateCounts;
  offlineServers: readonly Server[];
} {
  return {
    overall: countStates(servers),
    // 알림에 쓸 목록입니다. 응답이 없는 것만 모읍니다.
    offlineServers: servers.filter(
      (server) => getDisplayState(server) === "offline",
    ),
  };
}

// 정상 비율입니다. 등록된 서버가 없으면 100% 로 봅니다.
// (0 대 중 0 대가 죽었으므로 "문제 없음" 이 맞습니다)
export function healthyRatio(counts: StateCounts): number {
  if (counts.total === 0) return 1;
  return counts.online / counts.total;
}
