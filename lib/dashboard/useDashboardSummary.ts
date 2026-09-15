import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { nextPollDelay } from "@/lib/dashboard/pollCycle";
import {
  SUMMARY_REFRESH_MS,
  type DashboardSummary,
} from "@/lib/dashboard/types";

export type SummaryStatus = "loading" | "ready" | "error";

const EMPTY: DashboardSummary = {
  counts: { online: 0, offline: 0, pending: 0, disabled: 0, total: 0 },
  byType: [],
  lastCheckedAt: null,
  pingIntervalSec: 15,
  todayDownCount: 0,
  problems: [],
};

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY);
  const [status, setStatus] = useState<SummaryStatus>("loading");

  const load = useCallback(async (): Promise<DashboardSummary | null> => {
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
