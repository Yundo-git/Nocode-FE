import { useEffect, useState } from "react";
import {
  EMPTY_SNAPSHOT,
  fetchMonitoringSnapshot,
} from "@/lib/monitoring/dataSource";
import type { MonitoringSnapshot } from "@/lib/monitoring/types";

export type SnapshotStatus = "loading" | "ready" | "error";

// 대시보드 화면이 사용하는 상태 저장소입니다.
// 화면 -> 이 훅 -> 데이터 출처 순서로 연결되어 있어서
// 나중에 실시간(WebSocket) 갱신을 붙일 때도 이 파일만 고치면 됩니다.
// 지금은 화면을 열 때 한 번만 데이터를 읽습니다. (주기적 polling 없음)
export function useMonitoringSnapshot(): {
  snapshot: MonitoringSnapshot;
  status: SnapshotStatus;
} {
  const [snapshot, setSnapshot] = useState<MonitoringSnapshot>(EMPTY_SNAPSHOT);
  const [status, setStatus] = useState<SnapshotStatus>("loading");

  useEffect(() => {
    // 화면이 사라진 뒤에 상태를 바꾸지 않도록 표시해 둡니다.
    let cancelled = false;

    fetchMonitoringSnapshot()
      .then((next) => {
        if (cancelled) {
          return;
        }

        setSnapshot(next);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { snapshot, status };
}
