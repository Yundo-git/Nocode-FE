import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Server,
  XCircle,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatCount } from "@/lib/monitoring/format";
import type { OverviewStats } from "@/lib/monitoring/types";

interface OverviewCardsProps {
  stats: OverviewStats;
  loading?: boolean;
}

// 전체 현황 카드 묶음입니다. 데이터는 props 로만 받습니다.
export function OverviewCards({ stats, loading = false }: OverviewCardsProps) {
  // 아직 데이터를 받지 못했으면 숫자 대신 "-" 를 보여 줍니다.
  const count = (value: number) => (loading ? "-" : formatCount(value));

  // 전체 대비 비율입니다. 서버가 0대이면 표시하지 않습니다.
  const ratio = (value: number) =>
    loading || stats.total === 0
      ? undefined
      : `${((value / stats.total) * 100).toFixed(1)}%`;

  return (
    // 카드가 6개이므로 2 / 3 / 6칸으로만 나눠 빈칸이 생기지 않게 합니다.
    // 사이드바(16rem)가 자리를 차지하므로 6칸은 화면이 1400px 이상일 때만 씁니다.
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 min-[1400px]:grid-cols-6">
      <StatCard
        label="Total Servers"
        value={count(stats.total)}
        hint="모니터링 대상"
        icon={Server}
      />
      <StatCard
        label="UP"
        value={count(stats.up)}
        hint={ratio(stats.up)}
        tone="up"
        icon={CheckCircle2}
      />
      <StatCard
        label="DOWN"
        value={count(stats.down)}
        hint={ratio(stats.down)}
        tone="down"
        icon={XCircle}
      />
      <StatCard
        label="Warning"
        value={count(stats.warning)}
        hint={ratio(stats.warning)}
        tone="warning"
        icon={AlertTriangle}
      />
      <StatCard
        label="Unknown"
        value={count(stats.unknown)}
        hint={ratio(stats.unknown)}
        tone="unknown"
        icon={HelpCircle}
      />
      <StatCard
        label="Avg Latency"
        value={
          loading || stats.avgLatencyMs === null
            ? "-"
            : `${stats.avgLatencyMs} ms`
        }
        hint="응답한 서버 기준"
        icon={Activity}
      />
    </div>
  );
}
