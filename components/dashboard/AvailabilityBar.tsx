import { formatCount } from "@/lib/monitoring/format";
import type { OverviewStats } from "@/lib/monitoring/types";

// 막대와 범례에 쓰는 항목입니다. 클래스 이름은 통째로 적습니다.
const SEGMENTS = [
  { key: "up", label: "UP", bar: "meter-up", text: "text-up-500" },
  { key: "warning", label: "WARNING", bar: "meter-warning", text: "text-warn-500" },
  { key: "down", label: "DOWN", bar: "meter-down", text: "text-down-500" },
  { key: "unknown", label: "UNKNOWN", bar: "meter-unknown", text: "text-unknown-500" },
] as const;

// 전체 서버가 어떤 상태로 나뉘어 있는지 가로 막대 하나로 보여 줍니다.
export function AvailabilityBar({ stats }: { stats: OverviewStats }) {
  const total = stats.total;
  const ratio = (value: number) => (total === 0 ? 0 : (value / total) * 100);

  return (
    <div className="panel px-4 py-3">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-d-label font-bold uppercase text-muted">
          Availability
        </span>
        <span className="text-bt-text-s tabular-nums text-muted">
          {total === 0 ? "-" : `${ratio(stats.up).toFixed(1)}% UP`} ·{" "}
          {formatCount(total)} servers
        </span>
      </div>

      <div className="meter" role="img" aria-label="서버 상태 비율">
        {SEGMENTS.map((segment) => {
          const width = ratio(stats[segment.key]);

          if (width === 0) {
            return null;
          }

          return (
            <span
              key={segment.key}
              className={segment.bar}
              style={{ width: `${width}%` }}
            />
          );
        })}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1">
        {SEGMENTS.map((segment) => (
          <span
            key={segment.key}
            className="flex items-center gap-1.5 text-bt-text-s text-secondary"
          >
            <span className={`status-dot ${segment.text}`} />
            {segment.label}
            <span className="tabular-nums font-semibold text-main">
              {formatCount(stats[segment.key])}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
