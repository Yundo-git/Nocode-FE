import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import {
  SUMMARY_REFRESH_MS,
  type DashboardSummary,
} from "@/lib/dashboard/types";

export type SummaryStatus = "loading" | "ready" | "error";

// 다시 받아 오는 간격은 types.ts 의 SUMMARY_REFRESH_MS 를 씁니다.
// 감시가 멈춘 것을 판단하는 기준이 이 값과 맞물려 있어 한 곳에서 정합니다.

const EMPTY: DashboardSummary = {
  counts: { online: 0, offline: 0, disabled: 0, total: 0 },
  byType: [],
  lastCheckedAt: null,
  todayDownCount: 0,
  problems: [],
};

// 대시보드 요약입니다. 요청 한 번으로 필요한 값을 모두 받습니다.
export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY);
  const [status, setStatus] = useState<SummaryStatus>("loading");

  const load = useCallback(async () => {
    const res = await api.get<DashboardSummary>("/dashboard/summary");

    if (!res.ok) {
      setStatus("error");
      return;
    }

    setSummary(res.data);
    setStatus("ready");
  }, []);

  useEffect(() => {
    let alive = true;

    const run = () => {
      if (alive) void load();
    };

    run();
    const timer = setInterval(run, SUMMARY_REFRESH_MS);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [load]);

  return { summary, status, reload: load };
}
