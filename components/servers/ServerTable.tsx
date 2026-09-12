import { Pagination } from "@/components/ui/Pagination";
import { Toggle } from "@/components/ui/Toggle";
import { STATUS_LABEL, type Server, type ServerStatus } from "@/lib/servers/types";

// 상태 배지 색입니다. 모두 테마에 따라 바뀌는 토큰만 씁니다.
const STATUS_BADGE: Record<ServerStatus, string> = {
  up: "text-up-500 bg-up-bg",
  warning: "text-warn-500 bg-warn-bg",
  down: "text-down-500 bg-down-bg",
  unknown: "text-unknown-500 bg-unknown-bg",
};

type ServerTableProps = {
  /** 이번 쪽에 보여 줄 줄들입니다. */
  rows: readonly Server[];
  /** 검색 결과 전체 건수입니다. (쪽 나누기 전) */
  totalCount: number;
  page: number;
  totalPages: number;
  pageSize: number;
  selectedIds: ReadonlySet<string>;
  onPageChange: (next: number) => void;
  onPageSizeChange: (next: number) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onToggleEnabled: (id: string) => void;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export function ServerTable({
  rows,
  totalCount,
  page,
  totalPages,
  pageSize,
  selectedIds,
  onPageChange,
  onPageSizeChange,
  onToggleSelect,
  onToggleSelectAll,
  onClearSelection,
  onToggleEnabled,
}: ServerTableProps) {
  // 이번 쪽이 전부 선택돼 있는지 봅니다. 빈 쪽은 선택된 것으로 치지 않습니다.
  const allOnPageSelected =
    rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  return (
    <div className="panel flex min-w-0 flex-col">
      {/* 표 위 줄: 왼쪽은 건수와 선택 관련, 오른쪽은 내려받기와 쪽 크기 */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-b2_body_m font-medium text-secondary">
            총 {totalCount}건 ({page}/{Math.max(totalPages, 1)} page)
          </span>
          <button
            type="button"
            onClick={onClearSelection}
            disabled={selectedIds.size === 0}
            className="btn btn-ghost btn-sm"
          >
            선택해제
          </button>
          <button
            type="button"
            disabled={selectedIds.size === 0}
            className="btn btn-ghost btn-sm"
          >
            선택삭제
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-ghost btn-sm">
            엑셀 다운로드
          </button>
          <select
            aria-label="한 쪽에 보여 줄 개수"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.currentTarget.value))}
            className="select"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 표. 좁은 화면에서는 가로로만 스크롤됩니다. */}
      <div className="min-w-0 overflow-x-auto">
        <table className="data-table min-w-[880px]">
          <colgroup>
            <col className="w-12" />
            <col className="w-40" />
            <col className="w-24" />
            <col />
            <col className="w-32" />
            <col className="w-28" />
            <col className="w-48" />
            <col className="w-24" />
          </colgroup>

          <thead>
            <tr>
              <th scope="col" className="center">
                <input
                  type="checkbox"
                  aria-label="이번 쪽 전체 선택"
                  checked={allOnPageSelected}
                  onChange={onToggleSelectAll}
                  className="h-4 w-4 accent-primary-600"
                />
              </th>
              <th scope="col">서버 ID</th>
              <th scope="col">타입</th>
              <th scope="col">서버명</th>
              <th scope="col">IP</th>
              <th scope="col" className="num">응답(ms)</th>
              <th scope="col">마지막 확인</th>
              <th scope="col" className="center">사용여부</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-muted">
                  조건에 맞는 서버가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((server) => (
                <tr key={server.id}>
                  <td className="center">
                    <input
                      type="checkbox"
                      aria-label={`${server.name} 선택`}
                      checked={selectedIds.has(server.id)}
                      onChange={() => onToggleSelect(server.id)}
                      className="h-4 w-4 accent-primary-600"
                    />
                  </td>
                  <td>{server.id}</td>
                  <td>{server.type}</td>
                  <td>
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={`shrink-0 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-bt-text-s font-bold ${STATUS_BADGE[server.status]}`}
                      >
                        {STATUS_LABEL[server.status]}
                      </span>
                      <span className="truncate">{server.name}</span>
                    </span>
                  </td>
                  <td className="font-mono">{server.ip}</td>
                  <td className="num">
                    {server.responseMs === null ? "-" : server.responseMs}
                  </td>
                  <td>{formatDateTime(server.checkedAt)}</td>
                  <td className="center">
                    <Toggle
                      checked={server.enabled}
                      onChange={() => onToggleEnabled(server.id)}
                      label={`${server.name} 감시 사용`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-line px-4 py-3">
        <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
      </div>
    </div>
  );
}

// 2026-09-12 11:48:20 형태로 보여 줍니다.
// toLocaleString 은 서버와 브라우저의 시간대/언어 설정이 달라 결과가 어긋날 수 있어
// 직접 자릿수를 맞춥니다.
function formatDateTime(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}
