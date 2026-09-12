import { Circle } from "lucide-react";
import { ColorMode } from "@/components/ui/ColorMode";
import { formatClock } from "@/lib/monitoring/format";
import { useTheme } from "@/lib/theme";
import type { MonitoringSource } from "@/lib/monitoring/types";
import type { SnapshotStatus } from "@/lib/monitoring/useMonitoringSnapshot";

interface DashboardHeaderProps {
  updatedAt: string;
  source: MonitoringSource;
  status: SnapshotStatus;
}

// 상태 표시등 색상입니다. 클래스 이름은 통째로 적습니다.
const STATUS_CLASS: Record<SnapshotStatus, string> = {
  loading: "text-unknown-500",
  ready: "text-up-500",
  error: "text-down-500",
};

// 데이터 상태를 사람이 읽을 수 있는 문장으로 바꿉니다.
function describeStatus(status: SnapshotStatus, updatedAt: string) {
  if (status === "loading") {
    return "불러오는 중";
  }

  if (status === "error") {
    return "불러오지 못함";
  }

  return `${formatClock(updatedAt)} UTC`;
}

// 본문 맨 위에 붙는 막대입니다. 스크롤해도 위에 남습니다.
export function DashboardHeader({
  updatedAt,
  source,
  status,
}: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line bg-panel px-6 py-2.5">
      <div className="flex items-baseline gap-3">
        <h1 className="text-s1 font-semibold text-main">Dashboard</h1>
        <span className="text-bt-text-s text-muted">
          Server Monitoring Overview
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-bt-text-s tabular-nums text-secondary">
          <Circle
            className={`h-2 w-2 fill-current ${STATUS_CLASS[status]}`}
            aria-hidden="true"
          />
          마지막 점검 {describeStatus(status, updatedAt)}
        </span>
        <span className="rounded-[var(--radius-sm)] bg-panel-2 px-1.5 py-0.5 text-bt-text-s font-semibold uppercase text-muted">
          {source}
        </span>
        {/* 기존 프로젝트의 화이트/블랙 모드 전환 기능을 그대로 사용합니다. */}
        <ColorMode
          theme={theme}
          setTheme={(next) => setTheme(next === "dark" ? "dark" : "light")}
        />
      </div>
    </header>
  );
}
