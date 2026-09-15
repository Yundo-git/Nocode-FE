import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { beep, canBeep, unlockBeep } from "@/lib/notifications/beep";
import { nextPollDelay } from "@/lib/dashboard/pollCycle";

const FALLBACK_POLL_MS = 15_000;

const SEEN_KEY = "pingcheck.notifications.seen";

export type AlertRow = {
  readonly serverId: string;
  readonly serverIp: string;
  readonly serverNameKo: string;
  readonly serverNameEn: string;
  readonly serverType: string;
  readonly divisionId: string;
  readonly type: "down" | "up";
  readonly detail: string;
  readonly occurredAt: string;
};

export type Notifications = {
  readonly rows: readonly AlertRow[];
  readonly muted: boolean;
  readonly lastCheckedAt: string | null;
  readonly pingIntervalSec: number;
};

function isNewerThan(iso: string, mark: string): boolean {
  return mark === "" || new Date(iso).getTime() > new Date(mark).getTime();
}

function readSeen(): string {
  try {
    return window.localStorage.getItem(SEEN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function useNotifications() {
  const [rows, setRows] = useState<readonly AlertRow[]>([]);
  const [muted, setMuted] = useState(false);
  const [seenId, setSeenId] = useState("");
  const [soundReady, setSoundReady] = useState(false);

  useEffect(() => {
    setSeenId(readSeen());
  }, []);

  useEffect(() => {
    const handle = () => {
      unlockBeep();
      setSoundReady(canBeep());
    };

    window.addEventListener("pointerdown", handle);
    window.addEventListener("keydown", handle);

    return () => {
      window.removeEventListener("pointerdown", handle);
      window.removeEventListener("keydown", handle);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const load = async () => {
      const res = await api.get<Notifications>("/notifications", { background: true });

      if (!alive) return;

      if (!res.ok) {
        timer = setTimeout(() => void load(), FALLBACK_POLL_MS);
        return;
      }

      setRows(res.data.rows);
      setMuted(res.data.muted);

      if (!res.data.muted && res.data.rows.some((row) => row.type === "down")) {
        beep();
      }

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

  const markSeen = useCallback(() => {
    const newest = rows[0]?.occurredAt ?? "";

    if (newest === "") return;

    setSeenId(newest);

    try {
      window.localStorage.setItem(SEEN_KEY, newest);
    } catch {
    }
  }, [rows]);

  const clear = useCallback(async (serverIds: string[] | null): Promise<void> => {
    const res = await api.post<{ cleared: number }>(
      "/notifications/clear",
      serverIds === null ? { all: true } : { serverIds },
    );

    if (!res.ok) return;

    setRows((prev) =>
      serverIds === null
        ? []
        : prev.filter((row) => !serverIds.includes(row.serverId)),
    );
  }, []);

  const unreadCount = rows.filter((row) => isNewerThan(row.occurredAt, seenId)).length;

  return { rows, muted, unreadCount, markSeen, clear, soundReady };
}
