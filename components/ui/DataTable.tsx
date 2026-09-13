import type { ReactNode } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { useColumnWidths } from "@/lib/useColumnWidths";

// 열 너비를 조절할 수 있는 표입니다. (로그조회 · 작업이력)
//
// ★ 두 화면이 똑같은 껍데기를 쓰고 있었습니다.
//   건수 표시, 열 너비 초기화, 엑셀 버튼, 쪽 크기 선택, 손잡이 달린 머리글,
//   안쪽만 스크롤되는 칸, 쪽 번호까지 전부요. (199줄 중 96줄만 달랐습니다)
//   다른 것은 **어떤 열을 어떻게 그리는가** 뿐이라, 그것만 밖에서 받습니다.
//
// ※ 서버관리·계정관리 표는 여기 넣지 않았습니다.
//   그쪽은 체크박스·줄 클릭·선택삭제가 붙어 모양이 제법 다릅니다.
//   억지로 합치면 넘길 것이 스무 개가 되어 오히려 읽기 어려워집니다.

export type Column = {
  readonly key: string;
  readonly label: string;
  /** 0 이면 남는 자리를 다 차지합니다. 마지막 열에만 씁니다. */
  readonly width: number;
};

const PAGE_SIZE_OPTIONS = [50, 100, 200] as const;

type DataTableProps<R> = {
  columns: readonly Column[];
  /** 열 너비를 기억해 둘 이름입니다. 화면마다 달라야 합니다. */
  widthStorageKey: string;
  /** 표가 이보다 좁아지면 가로로 스크롤됩니다. */
  minWidth: number;
  rows: readonly R[];
  rowKey: (row: R) => string;
  /** 한 줄의 칸들입니다. 열 차례와 맞아야 합니다. */
  renderCells: (row: R) => ReactNode;
  totalCount: number;
  page: number;
  totalPages: number;
  pageSize: number;
  loading: boolean;
  emptyText: string;
  /** 내려받을 것이 없을 때 버튼에 띄울 말입니다. */
  nothingToDownload: string;
  onDownload: () => void;
  downloading: boolean;
  onPageChange: (next: number) => void;
  onPageSizeChange: (next: number) => void;
};

export function DataTable<R>({
  columns,
  widthStorageKey,
  minWidth,
  rows,
  rowKey,
  renderCells,
  totalCount,
  page,
  totalPages,
  pageSize,
  loading,
  emptyText,
  nothingToDownload,
  onDownload,
  downloading,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<R>) {
  const defaults = Object.fromEntries(
    columns.filter((c) => c.width > 0).map((c) => [c.key, c.width]),
  );
  const { widths, startResize, reset, changed } = useColumnWidths(
    widthStorageKey,
    defaults,
  );

  return (
    <div className="panel flex min-h-[18rem] min-w-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-b2_body_m font-medium text-secondary">
            총 {totalCount.toLocaleString("en-US")}건 ({page}/{totalPages} page)
          </span>

          {/* 열 너비를 건드렸을 때만 나옵니다.
              평소에 띄워 두면 무엇을 되돌리는지 알 수 없어 오히려 방해가 됩니다. */}
          {changed ? (
            <button type="button" onClick={reset} className="btn btn-ghost btn-sm">
              열 너비 초기화
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading || totalCount === 0}
            title={totalCount === 0 ? nothingToDownload : undefined}
            className="btn btn-ghost btn-sm"
          >
            {downloading ? "만드는 중…" : "엑셀 다운로드"}
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

      {/* 이 칸만 스크롤됩니다. 머리글은 sticky 로 붙어 있습니다. (globals.css) */}
      <div className="min-h-0 min-w-0 flex-1 overflow-auto">
        <table className="data-table" style={{ minWidth }}>
          <colgroup>
            {columns.map((column) => (
              <col
                key={column.key}
                // 마지막 열은 너비를 주지 않아 남는 자리를 다 차지합니다.
                style={column.width > 0 ? { width: widths[column.key] } : undefined}
              />
            ))}
          </colgroup>

          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={column.key} scope="col" className="relative">
                  {column.label}

                  {/* 열 사이의 줄입니다. 잡아 끌면 왼쪽 열의 너비가 바뀝니다.
                      마지막 열에는 달지 않습니다 — 남는 자리를 다 차지하는 열이라
                      끌어도 기준이 없어 이상하게 움직입니다. */}
                  {index < columns.length - 1 ? (
                    <span
                      role="separator"
                      aria-orientation="vertical"
                      aria-label={`${column.label} 열 너비 조절`}
                      onPointerDown={(event) => startResize(column.key, event)}
                      // -right-1.5 ~ w-3: 줄보다 넓게 잡아, 정확히 겨누지 않아도
                      // 집히도록 합니다. 1px 짜리 선은 마우스로 잡기 어렵습니다.
                      className="absolute -right-1.5 top-0 z-10 flex h-full w-3 cursor-col-resize touch-none items-center justify-center"
                    >
                      <span className="h-1/2 w-px bg-line-strong transition-colors hover:bg-primary-500" />
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-muted">
                  불러오는 중입니다.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-muted">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row) => <tr key={rowKey(row)}>{renderCells(row)}</tr>)
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
