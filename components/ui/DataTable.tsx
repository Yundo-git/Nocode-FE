import type { ReactNode } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { useColumnWidths } from "@/lib/useColumnWidths";

export type Column = {
  readonly key: string;
  readonly label: string;
  readonly width: number;
};

const PAGE_SIZE_OPTIONS = [50, 100, 200] as const;

type DataTableProps<R> = {
  columns: readonly Column[];
  widthStorageKey: string;
  minWidth: number;
  rows: readonly R[];
  rowKey: (row: R) => string;
  renderCells: (row: R) => ReactNode;
  totalCount: number;
  page: number;
  totalPages: number;
  pageSize: number;
  loading: boolean;
  emptyText: string;
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

      <div className="min-h-0 min-w-0 flex-1 overflow-auto">
        <table className="data-table" style={{ minWidth }}>
          <colgroup>
            {columns.map((column) => (
              <col
                key={column.key}
                style={column.width > 0 ? { width: widths[column.key] } : undefined}
              />
            ))}
          </colgroup>

          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={column.key} scope="col" className="relative">
                  {column.label}

                  {index < columns.length - 1 ? (
                    <span
                      role="separator"
                      aria-orientation="vertical"
                      aria-label={`${column.label} 열 너비 조절`}
                      onPointerDown={(event) => startResize(column.key, event)}
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
