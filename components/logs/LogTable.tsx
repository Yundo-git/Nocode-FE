import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime } from "@/lib/datetime";
import { BUSINESS_DIVISION_LABEL } from "@/lib/businessDivisions";
import { LOG_TYPE_LABEL, type LogEntry, type LogType } from "@/lib/logs/types";
import { useColumnWidths } from "@/lib/useColumnWidths";

// 로그 종류별 색입니다. 모두 테마에 따라 바뀌는 토큰만 씁니다.
const TYPE_CLASS: Record<LogType, string> = {
  down: "text-down-500 font-bold",
  up: "text-up-500 font-bold",
  "ping-on": "text-secondary",
  "ping-off": "text-muted",
  registered: "text-secondary",
};

// 열 정의입니다. 너비를 조절할 수 있어 한 곳에 모아 둡니다.
//
// 마지막 열("내용")에는 손잡이를 달지 않습니다.
// 남는 자리를 모두 차지하는 열이라, 끌어도 기준이 없어 이상하게 움직입니다.
const COLUMNS = [
  { key: "occurredAt", label: "발생 시각", width: 176 },
  { key: "type", label: "종류", width: 112 },
  { key: "ip", label: "IP", width: 144 },
  { key: "division", label: "업무구분", width: 96 },
  { key: "name", label: "장비명", width: 144 },
  { key: "detail", label: "내용", width: 0 }, // 남는 자리를 다 씁니다
] as const;

const DEFAULT_WIDTHS = Object.fromEntries(
  COLUMNS.filter((c) => c.width > 0).map((c) => [c.key, c.width]),
);

const WIDTH_STORAGE_KEY = "pingcheck-log-columns-v1";

type LogTableProps = {
  rows: readonly LogEntry[];
  totalCount: number;
  page: number;
  totalPages: number;
  pageSize: number;
  loading: boolean;
  /** 지금 조건 그대로 CSV 를 내려받습니다. */
  onDownload: () => void;
  downloading: boolean;
  onPageChange: (next: number) => void;
  onPageSizeChange: (next: number) => void;
};

const PAGE_SIZE_OPTIONS = [50, 100, 200] as const;

export function LogTable({
  rows,
  totalCount,
  page,
  totalPages,
  pageSize,
  loading,
  onDownload,
  downloading,
  onPageChange,
  onPageSizeChange,
}: LogTableProps) {
  const { widths, startResize, reset, changed } = useColumnWidths(
    WIDTH_STORAGE_KEY,
    DEFAULT_WIDTHS,
  );

  return (
    <div className="panel flex min-w-0 flex-col">
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
            title={totalCount === 0 ? "내려받을 로그가 없습니다" : undefined}
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

      <div className="min-w-0 overflow-x-auto">
        <table className="data-table min-w-[880px]">
          <colgroup>
            {COLUMNS.map((column) => (
              <col
                key={column.key}
                // 마지막 열은 너비를 주지 않아 남는 자리를 다 차지합니다.
                style={
                  column.width > 0 ? { width: widths[column.key] } : undefined
                }
              />
            ))}
          </colgroup>

          <thead>
            <tr>
              {COLUMNS.map((column, index) => (
                <th key={column.key} scope="col" className="relative">
                  {column.label}

                  {/* 열 사이의 줄입니다. 잡아 끌면 왼쪽 열의 너비가 바뀝니다.
                      마지막 열에는 달지 않습니다. */}
                  {index < COLUMNS.length - 1 ? (
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
                <td colSpan={COLUMNS.length} className="py-10 text-center text-muted">
                  불러오는 중입니다.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="py-10 text-center text-muted">
                  조건에 맞는 로그가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono">{formatDateTime(log.occurredAt)}</td>
                  <td className={TYPE_CLASS[log.type]}>
                    {LOG_TYPE_LABEL[log.type]}
                  </td>
                  <td className="font-mono">{log.serverIp}</td>
                  <td>{BUSINESS_DIVISION_LABEL[log.divisionId]}</td>
                  <td>{log.serverNameKo}</td>
                  <td>{log.detail}</td>
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
