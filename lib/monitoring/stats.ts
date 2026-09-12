import type { OverviewStats, ServerRecord, ServerStatus } from "@/lib/monitoring/types";

// 서버 목록에서 상단 요약 카드에 필요한 숫자를 계산합니다.
// 어떤 데이터 출처를 쓰더라도 같은 방식으로 계산하도록 순수 함수로 둡니다.
export function summarizeServers(servers: ServerRecord[]): OverviewStats {
  let up = 0;
  let down = 0;
  let warning = 0;
  let unknown = 0;
  let latencySum = 0;
  let latencyCount = 0;

  for (const server of servers) {
    if (server.status === "up") {
      up += 1;
    } else if (server.status === "down") {
      down += 1;
    } else if (server.status === "warning") {
      warning += 1;
    } else {
      unknown += 1;
    }

    if (server.latencyMs !== null) {
      latencySum += server.latencyMs;
      latencyCount += 1;
    }
  }

  return {
    total: servers.length,
    up,
    down,
    warning,
    unknown,
    avgLatencyMs:
      latencyCount === 0 ? null : Math.round((latencySum / latencyCount) * 10) / 10,
  };
}

// 목록에서 먼저 확인해야 하는 순서입니다. 장애 서버가 위로 오게 합니다.
const STATUS_PRIORITY: Record<ServerStatus, number> = {
  down: 0,
  warning: 1,
  unknown: 2,
  up: 3,
};

// 장애 -> 경고 -> 확인 불가 -> 정상 순서로 정렬합니다.
export function sortBySeverity(servers: ServerRecord[]): ServerRecord[] {
  return [...servers].sort((a, b) => {
    const priorityGap = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];

    if (priorityGap !== 0) {
      return priorityGap;
    }

    return a.name.localeCompare(b.name);
  });
}
