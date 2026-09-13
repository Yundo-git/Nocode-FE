import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { nextPollDelay } from "@/lib/dashboard/pollCycle";
import {
  SUMMARY_REFRESH_MS,
  type DashboardSummary,
} from "@/lib/dashboard/types";

export type SummaryStatus = "loading" | "ready" | "error";

// 다시 받아 오는 간격은 types.ts 의 SUMMARY_REFRESH_MS 를 씁니다.
// 감시가 멈춘 것을 판단하는 기준이 이 값과 맞물려 있어 한 곳에서 정합니다.

const EMPTY: DashboardSummary = {
  counts: { online: 0, offline: 0, pending: 0, disabled: 0, total: 0 },
  byType: [],
  lastCheckedAt: null,
  // 서버가 알려 주기 전에 쓰는 값입니다. settings 의 기본값과 같습니다.
  pingIntervalSec: 15,
  todayDownCount: 0,
  problems: [],
};

// 대시보드 요약입니다. 요청 한 번으로 필요한 값을 모두 받습니다.
export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY);
  const [status, setStatus] = useState<SummaryStatus>("loading");

  const load = useCallback(async (): Promise<DashboardSummary | null> => {
    // 화면이 스스로 보내는 요청입니다. 로그인 기한을 밀지 않습니다.
    const res = await api.get<DashboardSummary>("/dashboard/summary", {
      background: true,
    });

    if (!res.ok) {
      setStatus("error");
      return null;
    }

    setSummary(res.data);
    setStatus("ready");

    return res.data;
  }, []);

  // ★ setInterval 이 아니라 **다음 핑에 맞춰** 다시 받습니다.
  //   그냥 15초마다 받으면 핑 주기와 어긋나, "마지막 점검 7초 전" 이
  //   22초까지 올라갔다가 뚝 떨어집니다. (lib/dashboard/pollCycle.ts)
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const run = async () => {
      const data = await load();

      if (!alive) return;

      timer = setTimeout(
        () => void run(),
        data === null
          ? SUMMARY_REFRESH_MS
          : nextPollDelay(data.lastCheckedAt, data.pingIntervalSec),
      );
    };

    void run();

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [load]);

  return { summary, status, reload: load };
}
