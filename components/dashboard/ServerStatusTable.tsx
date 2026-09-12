import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/Button";
import {
  formatClock,
  formatCount,
  formatLatency,
  formatUptime,
} from "@/lib/monitoring/format";
import { sortBySeverity } from "@/lib/monitoring/stats";
import type { ServerRecord, ServerStatus } from "@/lib/monitoring/types";

// 한 번에 화면에 그리는 줄 수입니다.
// 서버가 1,000대여도 실제로 그려지는 줄은 이만큼뿐입니다.
// 나중에 가상 스크롤(virtualization)을 붙일 때도 이 파일만 바꾸면 됩니다.
const PAGE_SIZE = 50;

interface ServerRowProps {
  name: string;
  ipAddress: string;
  group: string;
  region: string;
  status: ServerStatus;
  latencyMs: number | null;
  uptimePercent: number;
  lastCheckedAt: string;
}

// 표의 한 줄입니다. 값이 바뀌지 않으면 다시 그리지 않도록 memo 로 감쌉니다.
const ServerRow = memo(function ServerRow({
  name,
  ipAddress,
  group,
  region,
  status,
  latencyMs,
  uptimePercent,
  lastCheckedAt,
}: ServerRowProps) {
  return (
    <tr>
      <td className="font-medium text-main">{name}</td>
      <td className="font-mono text-bt-text-s">{ipAddress}</td>
      <td>{group}</td>
      <td>{region}</td>
      <td>
        <StatusBadge status={status} />
      </td>
      <td className="num font-mono">{formatLatency(latencyMs)}</td>
      <td className="num font-mono">{formatUptime(uptimePercent)}</td>
      <td className="num font-mono text-muted">{formatClock(lastCheckedAt)}</td>
    </tr>
  );
});

// 서버 목록 표입니다.
// 데이터는 props 로만 받고, 화면에 보여 줄 범위만 스스로 관리합니다.
export function ServerStatusTable({ servers }: { servers: ServerRecord[] }) {
  const [page, setPage] = useState(0);

  // 장애 > 경고 > 확인 불가 > 정상 순서로 정렬해 먼저 봐야 할 서버를 위로 올립니다.
  const sorted = useMemo(() => sortBySeverity(servers), [servers]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  // 목록이 줄어들어 현재 쪽이 사라지는 경우를 대비합니다.
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, sorted.length);

  const rows = useMemo(
    () => sorted.slice(start, start + PAGE_SIZE),
    [sorted, start]
  );

  return (
    <div className="panel overflow-hidden">
      <div className="panel-head">
        <h2 className="text-bt-text-large font-semibold text-main">
          Server Status
        </h2>
        <span className="text-bt-text-s tabular-nums text-muted">
          확인이 필요한 서버를 위쪽에 먼저 표시합니다
        </span>
      </div>

      {/* 이 영역만 스크롤되므로 표 머리글이 위쪽에 고정됩니다. */}
      <div className="max-h-[58vh] overflow-auto">
        <table className="data-table min-w-[900px]">
          {/* 칸 너비를 미리 정해 두어 쪽을 넘겨도 표가 흔들리지 않게 합니다. */}
          <colgroup>
            <col className="w-[16%]" />
            <col className="w-[14%]" />
            <col className="w-[9%]" />
            <col className="w-[13%]" />
            <col className="w-[13%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
            <col className="w-[13%]" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Server</th>
              <th scope="col">IP Address</th>
              <th scope="col">Group</th>
              <th scope="col">Region</th>
              <th scope="col">Status</th>
              <th scope="col" className="num">
                Latency
              </th>
              <th scope="col" className="num">
                Uptime
              </th>
              <th scope="col" className="num">
                Last Check
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((server) => (
              <ServerRow
                key={server.id}
                name={server.name}
                ipAddress={server.ipAddress}
                group={server.group}
                region={server.region}
                status={server.status}
                latencyMs={server.latencyMs}
                uptimePercent={server.uptimePercent}
                lastCheckedAt={server.lastCheckedAt}
              />
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-muted">
                  표시할 서버가 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* 쪽 이동 영역입니다. */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2">
        <p className="text-bt-text-s tabular-nums text-muted">
          {sorted.length === 0
            ? "표시할 서버 없음"
            : `${formatCount(sorted.length)}대 중 ${formatCount(start + 1)}-${formatCount(end)} 표시`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            aria-label="이전 쪽"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <span className="text-bt-text-s tabular-nums text-muted">
            {currentPage + 1} / {pageCount}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(Math.min(pageCount - 1, currentPage + 1))}
            disabled={currentPage >= pageCount - 1}
            aria-label="다음 쪽"
          >
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
