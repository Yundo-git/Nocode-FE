import {
  MOCK_INCIDENTS,
  MOCK_SERVERS,
  MOCK_UPDATED_AT,
} from "@/lib/monitoring/mockServers";
import { summarizeServers } from "@/lib/monitoring/stats";
import type { MonitoringSnapshot } from "@/lib/monitoring/types";

// 대시보드가 데이터를 가져오는 유일한 통로입니다.
//
// 지금은 백엔드가 없어서 mock 데이터를 돌려주지만,
// 나중에 아래 fetchMonitoringSnapshot 함수 안의 내용만 바꾸면 됩니다.
//   - REST API      : return (await fetch("/api/monitoring/snapshot")).json();
//   - WebSocket     : 최초 1회 스냅샷을 받고, 이후 변경분만 반영
// 화면 컴포넌트는 이 파일을 직접 부르지 않고 props 로만 데이터를 받으므로
// 데이터 출처가 바뀌어도 UI 코드는 고치지 않아도 됩니다.

const MOCK_SNAPSHOT: MonitoringSnapshot = {
  servers: MOCK_SERVERS,
  stats: summarizeServers(MOCK_SERVERS),
  incidents: MOCK_INCIDENTS,
  updatedAt: MOCK_UPDATED_AT,
  source: "mock",
};

// 데이터를 아직 받지 못했을 때 사용하는 빈 값입니다.
export const EMPTY_SNAPSHOT: MonitoringSnapshot = {
  servers: [],
  stats: {
    total: 0,
    up: 0,
    down: 0,
    warning: 0,
    unknown: 0,
    avgLatencyMs: null,
  },
  incidents: [],
  updatedAt: "",
  source: "mock",
};

// 현재 서버 상태 스냅샷을 가져옵니다.
export async function fetchMonitoringSnapshot(): Promise<MonitoringSnapshot> {
  return MOCK_SNAPSHOT;
}
