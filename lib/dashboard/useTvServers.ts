import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { ServerDisplayState } from "@/lib/servers/types";
import { SUMMARY_REFRESH_MS } from "@/lib/dashboard/types";
import { nextPollDelay } from "@/lib/dashboard/pollCycle";

export type TvRow = {
  readonly id: string;
  readonly ip: string;
  readonly state: ServerDisplayState;
};

type TvPayload = {
  readonly rows: readonly TvRow[];
  readonly lastCheckedAt: string | null;
  readonly pingIntervalSec: number;
};

export function useTvServers() {
  const [rows, setRows] = useState<readonly TvRow[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const load = async () => {
      const res = await api.get<TvPayload>("/dashboard/tv", { background: true });

      if (!alive) return;

      if (!res.ok) {
        timer = setTimeout(() => void load(), SUMMARY_REFRESH_MS);
        return;
      }

      setRows(res.data.rows);
      setReady(true);

      timer = setTimeout(
        () => void load(),
        nextPollDelay(res.data.lastCheckedAt, res.data.pingIntervalSec),
      );
    };

    void load();

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  return { rows, ready };
}
