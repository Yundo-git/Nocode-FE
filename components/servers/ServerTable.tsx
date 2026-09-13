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

// 상태 점 색입니다. 모두 테마에 따라 바뀌는 토큰만 씁니다.
const DOT_COLOR: Record<ServerDisplayState, string> = {
  online: "bg-up-500",
  offline: "bg-down-500",
  disabled: "bg-unknown-500",
};

// 상태를 색 점 하나로 보여 줍니다.
// 색만으로는 못 알아보는 사람이 있으므로 이름을 함께 전달합니다.
// (title 은 마우스를 올렸을 때, aria-label 은 읽기 도구용입니다.)
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
  /** 등록 버튼을 눌렀을 때. 창을 여는 일은 페이지가 맡습니다. */
  onRegisterClick: () => void;
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
}: ServerTableProps) {
  // 방금 등록된 줄을 잠깐 표시해 줍니다.
  // "내가 한 것이 반영됐다" 를 보여 주는 용도라, 처음 목록에는 쓰지 않습니다.
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

    // 잠깐 표시한 뒤 원래대로 둡니다.
    const timer = setTimeout(() => setFreshIds(new Set()), 1500);
    return () => clearTimeout(timer);
  }, [rows]);

  // 이번 쪽이 전부 선택돼 있는지 봅니다. 빈 쪽은 선택된 것으로 치지 않습니다.
  const allOnPageSelected =
    rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  return (
    <div className="panel flex min-w-0 flex-col">
      {/* 표 위 줄: 왼쪽은 건수와 선택 관련, 오른쪽은 내려받기와 등록, 쪽 크기 */}
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
          {/* 아직 만들지 않았습니다. 눌러도 아무 일 없는 것보다
              눌리지 않는 편이 오해가 없습니다. */}
          <button
            type="button"
            disabled
            title="준비 중입니다"
            className="btn btn-ghost btn-sm"
          >
            엑셀 다운로드
          </button>
          {/* 아직 만들지 않았습니다. 눌러도 아무 일 없는 것보다
              눌리지 않는 편이 오해가 없습니다. */}
          <button
            type="button"
            disabled
            title="준비 중입니다"
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

      {/* 표. 좁은 화면에서는 가로로만 스크롤됩니다. */}
      <div className="min-w-0 overflow-x-auto">
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
                  className={freshIds.has(server.id) ? "animate-flash" : ""}
                >
                  <td className="center">
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
                  <td className="center">
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

// 2026-09-12 11:48:20 형태로 보여 줍니다.
// toLocaleString 은 서버와 브라우저의 시간대/언어 설정이 달라 결과가 어긋날 수 있어
// 직접 자릿수를 맞춥니다.
