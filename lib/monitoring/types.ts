// 서버 모니터링 화면에서 공통으로 사용하는 데이터 타입입니다.
// UI 컴포넌트는 이 타입에만 의존하므로, 나중에 데이터 출처가
// mock -> REST API -> WebSocket 으로 바뀌어도 화면 코드는 그대로 둘 수 있습니다.

// 서버 한 대의 상태 값입니다.
export type ServerStatus = "up" | "down" | "warning" | "unknown";

// 모니터링 대상 서버 한 대의 정보입니다.
export interface ServerRecord {
  id: string;
  name: string;
  ipAddress: string;
  group: string;
  region: string;
  status: ServerStatus;
  // 응답 시간(ms). 응답이 없으면 null 입니다.
  latencyMs: number | null;
  uptimePercent: number;
  // 마지막 점검 시각(ISO 8601 UTC 문자열).
  lastCheckedAt: string;
}

// 상단 요약 카드에 표시하는 전체 현황입니다.
export interface OverviewStats {
  total: number;
  up: number;
  down: number;
  warning: number;
  unknown: number;
  // 응답한 서버들의 평균 응답 시간(ms)입니다.
  avgLatencyMs: number | null;
}

// 장애 이력의 종류입니다.
export type IncidentKind = "down" | "warning" | "recovered";

// 최근 장애 목록에 표시하는 항목입니다.
export interface Incident {
  id: string;
  serverId: string;
  serverName: string;
  ipAddress: string;
  kind: IncidentKind;
  startedAt: string;
  durationMinutes: number;
  detail: string;
}

// 데이터를 어디에서 가져왔는지 나타냅니다.
export type MonitoringSource = "mock" | "rest" | "websocket";

// 대시보드 한 화면을 그리는 데 필요한 데이터 묶음입니다.
export interface MonitoringSnapshot {
  servers: ServerRecord[];
  stats: OverviewStats;
  incidents: Incident[];
  updatedAt: string;
  source: MonitoringSource;
}
