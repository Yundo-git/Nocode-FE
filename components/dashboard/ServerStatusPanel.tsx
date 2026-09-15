import { HealthDonut } from "@/components/dashboard/HealthDonut";
import { PingPulse } from "@/components/dashboard/PingPulse";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatAgo } from "@/lib/dashboard/duration";
import type { CSSProperties } from "react";
import { useFlashOnChange } from "@/lib/useFlashOnChange";
import type { DashboardSummary } from "@/lib/dashboard/types";

type ServerStatusPanelProps = {
  summary: DashboardSummary;
  loading: boolean;
  now: number;
  staleAfterMs: number;
  pingIntervalMs: number;
};

export function ServerStatusPanel({
  summary,
  loading,
  now,
  staleAfterMs,
  pingIntervalMs,
}: ServerStatusPanelProps) {
  const todayFlash = useFlashOnChange(summary.todayDownCount);

  if (loading) {
    return (
      <div className="donut-grid h-full items-center gap-6">
        {[0, 1, 2].map((key) => (
          <div key={key} className="flex items-center justify-center gap-4">
            <Skeleton circle className="h-[164px] w-[164px]" />
            <div className="w-[104px] space-y-1.5">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { counts, byType, lastCheckedAt, todayDownCount } = summary;

  const stale =
    lastCheckedAt !== null &&
    now - new Date(lastCheckedAt).getTime() > staleAfterMs;

  return (
    <div className="flex h-full min-w-0 flex-col justify-center gap-4">
      <div className="donut-grid items-center gap-6">
        <HealthDonut label="전체" counts={counts} stale={stale} />
        {byType.map((item) => (
          <HealthDonut
            key={item.type}
            label={item.type}
            counts={item.counts}
            stale={stale}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-line pt-3 text-bt-text-m">
        <span className="flex flex-col items-center">
          <span
            className={stale ? "font-bold text-down-500" : "text-muted"}
            title={stale ? "핑이 예정대로 돌지 않고 있습니다" : undefined}
          >
            {lastCheckedAt === null
              ? "확인 기록 없음"
              : `마지막 점검 ${formatAgo(lastCheckedAt, now)}${stale ? " ⚠" : ""}`}
          </span>

          <PingPulse
            pingIntervalMs={pingIntervalMs} lastCheckedAt={lastCheckedAt} now={now} stale={stale} />
        </span>

        <span className="text-line-strong">·</span>

        <span
          className={`px-1 ${todayFlash ? "animate-flash" : ""} ${
            todayDownCount > 0 ? "font-semibold text-down-500" : "text-muted"
          }`}
          style={{ "--flash-color": "var(--row-hover)" } as CSSProperties}
        >
          오늘 장애 {todayDownCount}건
        </span>
      </div>
    </div>
  );
}
