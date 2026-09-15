import { useEffect, useRef, useState } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime } from "@/lib/datetime";
import { BUSINESS_DIVISION_LABEL } from "@/lib/businessDivisions";
import { Toggle } from "@/components/ui/Toggle";
import {
  DISPLAY_STATE_LABEL,
  getDisplayState,
  type Server,
  type ServerDisplayState,
} from "@/lib/servers/types";

const DOT_COLOR: Record<ServerDisplayState, string> = {
  online: "bg-up-500",
  offline: "bg-down-500",
  pending: "bg-pending-500",
  disabled: "bg-unknown-500",
};

function StatusDot({ state }: { state: ServerDisplayState }) {
  const label = DISPLAY_STATE_LABEL[state];

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`inline-block h-2.5 w-2.5 rounded-full ${DOT_COLOR[state]}`}
    />
  );
}

type ServerTableProps = {
  rows: readonly Server[];
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
  onRegisterClick: () => void;
  onDeleteSelected: () => void;
  onDownload: () => void;
  downloading: boolean;
  onImportClick: () => void;
  onRowClick?: (server: Server) => void;
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
  onRegisterClick,
  onDeleteSelected,
  onDownload,
  downloading,
  onImportClick,
  onRowClick,
}: ServerTableProps) {
  const [freshIds, setFreshIds] = useState<ReadonlySet<string>>(new Set());
  const seenRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    const ids = rows.map((row) => row.id);

    if (seenRef.current === null) {
      seenRef.current = new Set(ids);
      return;
    }

    const seen = seenRef.current;
    const fresh = new Set(ids.filter((id) => !seen.has(id)));

    if (fresh.size === 0) return;

    for (const id of fresh) seen.add(id);
    setFreshIds(fresh);

    const timer = setTimeout(() => setFreshIds(new Set()), 1500);
    return () => clearTimeout(timer);
  }, [rows]);

  const allOnPageSelected =
    rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  return (
    <div className="panel flex min-h-[18rem] min-w-0 flex-1 flex-col">
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
            onClick={onDeleteSelected}
            disabled={selectedIds.size === 0}
            className="btn btn-ghost btn-sm"
          >
            선택삭제
            {selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading || totalCount === 0}
            title={totalCount === 0 ? "내려받을 장비가 없습니다" : undefined}
            className="btn btn-ghost btn-sm"
          >
            {downloading ? "만드는 중…" : "엑셀 다운로드"}
          </button>
          <button
            type="button"
            onClick={onImportClick}
            className="btn btn-ghost btn-sm"
          >
            일괄등록
          </button>
          <button
            type="button"
            onClick={onRegisterClick}
            className="btn btn-primary btn-sm"
          >
            등록
          </button>
          <select
            aria-label="한 쪽에 보여 줄 개수"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.currentTarget.value))}
            className="select select-sm"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-auto">
        <table className="data-table min-w-[980px]">
          <colgroup>
            <col className="w-12" />
            <col className="w-16" />
            <col className="w-36" />
            <col className="w-24" />
            <col className="w-24" />
            <col />
            <col />
            <col className="w-24" />
            <col className="w-44" />
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
              <th scope="col" className="center">상태</th>
              <th scope="col">IP</th>
              <th scope="col">타입</th>
              <th scope="col">업무구분</th>
              <th scope="col">영문명</th>
              <th scope="col">한글명</th>
              <th scope="col" className="num">응답(ms)</th>
              <th scope="col">마지막 확인</th>
              <th scope="col" className="center">사용여부</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-10 text-center text-muted">
                  조건에 맞는 서버가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((server) => (
                <tr
                  key={server.id}
                  onClick={onRowClick ? () => onRowClick(server) : undefined}
                  className={`${freshIds.has(server.id) ? "animate-flash" : ""} ${
                    onRowClick ? "cursor-pointer hover:bg-row-hover" : ""
                  }`}
                >
                  <td className="center" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`${server.nameKo} 선택`}
                      checked={selectedIds.has(server.id)}
                      onChange={() => onToggleSelect(server.id)}
                      className="h-4 w-4 accent-primary-600"
                    />
                  </td>
                  <td className="center">
                    <StatusDot state={getDisplayState(server)} />
                  </td>
                  <td className="font-mono">{server.ip}</td>
                  <td>{server.type}</td>
                  <td>{BUSINESS_DIVISION_LABEL[server.divisionId]}</td>
                  <td className="font-mono">{server.nameEn}</td>
                  <td>{server.nameKo}</td>
                  <td className="num">
                    {server.responseMs === null ? "-" : server.responseMs}
                  </td>
                  <td>{formatDateTime(server.checkedAt)}</td>
                  <td className="center" onClick={(event) => event.stopPropagation()}>
                    <Toggle
                      checked={server.enabled}
                      onChange={() => onToggleEnabled(server.id)}
                      label={`${server.nameKo} 핑 보내기`}
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
