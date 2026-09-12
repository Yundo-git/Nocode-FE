import { methodHandler } from "@/lib/api/handler";
import type {
  DashboardSummary,
  ProblemServer,
  StateCounts,
} from "@/lib/dashboard/types";
import { listLogsForSummary } from "@/lib/logs/logStore";
import { listServers } from "@/lib/servers/serverStore";
import { SERVER_TYPES, getDisplayState, type Server } from "@/lib/servers/types";

// 한 묶음의 상태를 셉니다.
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

// 오늘 0시(서버 시간대 기준)입니다.
function startOfToday(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

// GET /api/dashboard/summary
//
// 대시보드에 필요한 값을 한 번에 계산해 내려보냅니다.
// 브라우저가 로그 전체를 받아 세는 일이 없도록 여기서 끝냅니다.
export default methodHandler({
  GET: async (_req, res) => {
    const [servers, logs] = await Promise.all([
      listServers(),
      listLogsForSummary(),
    ]);

    let online = 0;
    let offline = 0;
    let disabled = 0;
    let lastCheckedAt: string | null = null;

    const problems: ProblemServer[] = [];

    for (const server of servers) {
      const state = getDisplayState(server);

      if (state === "online") online += 1;
      else if (state === "offline") offline += 1;
      else disabled += 1;

      // 감시를 켜 둔 장비만 봅니다. 꺼 둔 장비는 원래 확인하지 않습니다.
      if (server.enabled) {
        if (lastCheckedAt === null || server.checkedAt > lastCheckedAt) {
          lastCheckedAt = server.checkedAt;
        }
      }

      if (state === "offline" || state === "disabled") {
        // 이 상태가 된 시각을 로그에서 찾습니다.
        // (로그는 최신이 앞이라 먼저 만나는 것이 가장 최근입니다)
        const marker = state === "offline" ? "down" : "ping-off";
        const found = logs.find(
          (log) => log.serverId === server.id && log.type === marker,
        );

        problems.push({
          id: server.id,
          ip: server.ip,
          nameKo: server.nameKo,
          state,
          since: found?.occurredAt ?? null,
        });
      }
    }

    // 비정상을 앞에, 그 안에서는 오래된 것을 앞에 둡니다.
    problems.sort((a, b) => {
      if (a.state !== b.state) return a.state === "offline" ? -1 : 1;
      return (a.since ?? "").localeCompare(b.since ?? "");
    });

    const todayStart = startOfToday();
    const todayDownCount = logs.filter(
      (log) =>
        log.type === "down" && new Date(log.occurredAt).getTime() >= todayStart,
    ).length;

    const summary: DashboardSummary = {
      counts: { online, offline, disabled, total: servers.length },
      byType: SERVER_TYPES.map((type) => ({
        type,
        counts: countStates(servers.filter((server) => server.type === type)),
      })),
      lastCheckedAt,
      todayDownCount,
      problems,
    };

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(summary);
  },
});
