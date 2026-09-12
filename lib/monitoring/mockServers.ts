import type { Incident, ServerRecord, ServerStatus } from "@/lib/monitoring/types";

// 백엔드가 아직 없으므로 화면 확인용 가짜(mock) 데이터를 만듭니다.
// 주의: 서버 렌더링과 브라우저 렌더링 결과가 달라지면 화면이 깨지므로
// Math.random() 이나 현재 시각을 쓰지 않고, 항상 같은 값이 나오도록 만듭니다.

// 모니터링 대상 서버 수입니다. (실제 시스템 목표치와 동일하게 1,000대)
const SERVER_COUNT = 1000;

// 기준 시각입니다. 이 값을 바탕으로 점검 시각을 계산합니다.
const BASE_TIME_MS = Date.UTC(2026, 8, 10, 9, 12, 45);

// 서버 이름과 그룹을 만들 때 사용하는 값들입니다.
const GROUPS = ["api", "web", "db", "cache", "batch", "edge"];
const REGIONS = ["kr-seoul-a", "kr-seoul-b", "kr-busan-a", "jp-tokyo-a"];

// 상태별 서버 대수입니다. 합계는 SERVER_COUNT 와 같습니다.
const STATUS_PLAN: Array<{ status: ServerStatus; count: number }> = [
  { status: "down", count: 13 },
  { status: "warning", count: 24 },
  { status: "unknown", count: 6 },
];

// 씨앗값(seed)이 같으면 항상 같은 순서의 숫자를 돌려주는 난수 생성기입니다.
function createRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

// 0 이상 max 미만의 정수를 만듭니다.
function pickInt(random: () => number, min: number, max: number) {
  return min + Math.floor(random() * (max - min + 1));
}

// 소수점 자리를 정리한 숫자를 만듭니다.
function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

// 밀리초 값을 ISO 문자열로 바꿉니다.
function toIso(timeMs: number) {
  return new Date(timeMs).toISOString();
}

// 어떤 서버가 어떤 상태인지 미리 정해 둡니다.
function buildStatusList(): ServerStatus[] {
  const statuses: ServerStatus[] = new Array(SERVER_COUNT).fill("up");
  const random = createRandom(20260910);
  const used = new Set<number>();

  for (const plan of STATUS_PLAN) {
    let assigned = 0;

    while (assigned < plan.count) {
      const index = pickInt(random, 0, SERVER_COUNT - 1);

      if (used.has(index)) {
        continue;
      }

      used.add(index);
      statuses[index] = plan.status;
      assigned += 1;
    }
  }

  return statuses;
}

// 상태에 맞는 응답 시간을 만듭니다. 응답이 없는 상태는 null 입니다.
function buildLatency(status: ServerStatus, random: () => number) {
  if (status === "down" || status === "unknown") {
    return null;
  }

  if (status === "warning") {
    return pickInt(random, 180, 950);
  }

  return pickInt(random, 3, 68);
}

// 상태에 맞는 가동률을 만듭니다.
function buildUptime(status: ServerStatus, random: () => number) {
  if (status === "down") {
    return round(93 + random() * 5, 2);
  }

  if (status === "warning") {
    return round(97.5 + random() * 2, 2);
  }

  if (status === "unknown") {
    return round(90 + random() * 8, 2);
  }

  return round(99.5 + random() * 0.5, 2);
}

// 서버 1,000대 목록을 만듭니다.
function buildServers(): ServerRecord[] {
  const statuses = buildStatusList();
  const random = createRandom(77003);

  return statuses.map((status, index) => {
    const group = GROUPS[index % GROUPS.length];
    const region = REGIONS[index % REGIONS.length];
    const sequence = String(index + 1).padStart(4, "0");
    // 점검 주기는 15초이므로 최근 45초 안에서 점검 시각을 만듭니다.
    const checkedAt = BASE_TIME_MS - pickInt(random, 0, 45) * 1000;

    return {
      id: `srv-${sequence}`,
      name: `${group}-${sequence}`,
      ipAddress: `10.${GROUPS.indexOf(group) + 10}.${Math.floor(index / 254)}.${(index % 254) + 1}`,
      group,
      region,
      status,
      latencyMs: buildLatency(status, random),
      uptimePercent: buildUptime(status, random),
      lastCheckedAt: toIso(checkedAt),
    };
  });
}

// 장애 목록을 서버 상태에서 만들어 냅니다.
// 실제 시스템에서는 백엔드가 장애 이력을 따로 내려주게 됩니다.
function buildIncidents(servers: ServerRecord[]): Incident[] {
  const random = createRandom(310555);

  const failing = servers
    .filter((server) => server.status === "down" || server.status === "warning")
    .slice(0, 6)
    .map((server, index) => {
      const durationMinutes = pickInt(random, 2, 180);

      return {
        id: `inc-${server.id}-${index}`,
        serverId: server.id,
        serverName: server.name,
        ipAddress: server.ipAddress,
        kind: server.status === "down" ? ("down" as const) : ("warning" as const),
        startedAt: toIso(BASE_TIME_MS - durationMinutes * 60 * 1000),
        durationMinutes,
        detail:
          server.status === "down"
            ? "Ping 응답 없음"
            : `응답 지연 ${server.latencyMs ?? 0}ms`,
      };
    });

  // 최근에 복구된 서버도 함께 보여 줍니다.
  const recovered = servers
    .filter((server) => server.status === "up" && server.uptimePercent < 99.6)
    .slice(0, 3)
    .map((server, index) => {
      const durationMinutes = pickInt(random, 3, 42);

      return {
        id: `inc-recovered-${server.id}-${index}`,
        serverId: server.id,
        serverName: server.name,
        ipAddress: server.ipAddress,
        kind: "recovered" as const,
        startedAt: toIso(BASE_TIME_MS - (durationMinutes + 12) * 60 * 1000),
        durationMinutes,
        detail: "정상 응답으로 복구",
      };
    });

  return [...failing, ...recovered].sort((a, b) =>
    a.startedAt < b.startedAt ? 1 : -1
  );
}

// 모듈을 불러올 때 한 번만 계산해서 재사용합니다.
export const MOCK_SERVERS: ServerRecord[] = buildServers();
export const MOCK_INCIDENTS: Incident[] = buildIncidents(MOCK_SERVERS);
export const MOCK_UPDATED_AT: string = toIso(BASE_TIME_MS);
