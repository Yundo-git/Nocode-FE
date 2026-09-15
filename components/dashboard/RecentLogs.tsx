import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatShortWithSeconds } from "@/lib/datetime";
import { DISPLAY_STATE_LABEL, type ServerDisplayState } from "@/lib/servers/types";
import { BUSINESS_DIVISION_LABEL, type BusinessDivisionId } from "@/lib/businessDivisions";

type RecentCheck = {
  readonly id: string;
  readonly ip: string;
  readonly nameKo: string;
  readonly nameEn: string;
  readonly type: string;
  readonly divisionId: BusinessDivisionId;
  readonly state: ServerDisplayState;
  readonly responseMs: number | null;
  readonly checkedAt: string | null;
  readonly changed: "up" | "down" | null;
};

const LIMIT = 30;
const REFRESH_MS = 15_000;

const STATE_CLASS: Record<ServerDisplayState, string> = {
  online: "text-up-500",
  offline: "text-down-500 font-bold",
  pending: "text-pending-500",
  disabled: "text-muted",
};

const CHANGED_LABEL = { up: "정상 전환", down: "장애 발생" } as const;
const CHANGED_CLASS = {
  up: "text-up-500 font-bold",
  down: "text-down-500 font-bold",
} as const;

export function RecentLogs() {
  const [rows, setRows] = useState<readonly RecentCheck[]>([]);
  const [freshIds, setFreshIds] = useState<ReadonlySet<string>>(new Set());
  const seenRef = useRef<Map<string, string | null> | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const res = await api.get<RecentCheck[]>("/dashboard/recent", {
        background: true,
      });

      if (!alive) return;

      if (!res.ok) {
        setStatus("error");
        return;
      }

      const incoming = res.data;

      if (seenRef.current === null) {
        seenRef.current = new Map(incoming.map((row) => [row.id, row.checkedAt]));
      } else {
        const seen = seenRef.current;
        const fresh = new Set(
          incoming
            .filter((row) => seen.get(row.id) !== row.checkedAt)
            .map((row) => row.id),
        );

        for (const row of incoming) seen.set(row.id, row.checkedAt);
        setFreshIds(fresh);
      }

      setRows(incoming);
      setStatus("ready");
    };

    void load();
    const timer = setInterval(() => void load(), REFRESH_MS);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="space-y-2 py-1">
        {[0, 1, 2, 3, 4, 5].map((key) => (
          <div key={key} className="flex items-center gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (status === "error") {
    return <Center tone="error">확인 결과를 불러오지 못했습니다.</Center>;
  }

  if (rows.length === 0) {
    return <Center>등록된 장비가 없습니다.</Center>;
  }

  return (
    <div className="flex h-full min-w-0 flex-col">
      <ul className="min-h-0 flex-1 divide-y divide-line overflow-auto">
        {rows.map((row) => (
          <li
            key={row.id}
            className={`flex min-w-[880px] items-baseline gap-3 px-1 py-1.5 text-b2_body_r ${
              freshIds.has(row.id) ? "animate-slide-in" : ""
            } ${row.state === "disabled" ? "opacity-55" : ""}`}
          >
            <span className="shrink-0 font-mono tabular-nums text-muted">
              {row.checkedAt === null ? "-" : formatShortWithSeconds(row.checkedAt)}
            </span>
            <span
              className={`w-20 shrink-0 ${
                row.changed ? CHANGED_CLASS[row.changed] : STATE_CLASS[row.state]
              }`}
            >
              {row.changed ? CHANGED_LABEL[row.changed] : DISPLAY_STATE_LABEL[row.state]}
            </span>
            <span className="w-28 shrink-0 font-mono text-secondary">{row.ip}</span>
            <span className="w-14 shrink-0 text-secondary">{row.type}</span>
            <span className="w-14 shrink-0 text-secondary">
              {BUSINESS_DIVISION_LABEL[row.divisionId]}
            </span>
            <span className="w-32 shrink-0 truncate font-mono text-muted">
              {row.nameEn}
            </span>
            <span className="min-w-0 flex-1 truncate text-secondary">{row.nameKo}</span>
            <span className="w-16 shrink-0 text-right font-mono tabular-nums text-muted">
              {row.responseMs === null ? "-" : `${row.responseMs}ms`}
            </span>
          </li>
        ))}
      </ul>

      <div className="shrink-0 border-t border-line pt-2 text-right">
        <Link href="/logs" className="text-bt-text-m font-semibold text-primary-500">
          전체 로그 보기 →
        </Link>
      </div>
    </div>
  );
}

function Center({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "error";
}) {
  return (
    <div
      className={`flex h-full items-center justify-center text-b2_body_r ${
        tone === "error" ? "text-down-500" : "text-muted"
      }`}
    >
      {children}
    </div>
  );
}
