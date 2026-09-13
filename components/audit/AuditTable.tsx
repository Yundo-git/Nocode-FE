import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime } from "@/lib/datetime";
import { BUSINESS_DIVISION_LABEL, type BusinessDivisionId } from "@/lib/businessDivisions";
import { useColumnWidths } from "@/lib/useColumnWidths";
import { AUDIT_ACTION_LABEL, type AuditEntry } from "@/lib/audit/types";

// 한 일에 따른 색입니다. 모두 테마에 따라 바뀌는 토큰만 씁니다.
//
// ★ 지우는 일과 로그인 실패만 붉게 둡니다.
//   전부 색을 입히면 아무것도 안 튀어나옵니다. 되짚어 볼 때 먼저 찾는 것은
//   "누가 지웠나" 와 "누가 두드렸나" 둘입니다.
function actionClass(action: string): string {
  if (
    action.endsWith(".delete") ||
    action === "auth.login.fail" ||
    action === "access.rejected"
  ) {
    return "text-down-500 font-bold";
  }
  if (action.startsWith("auth.")) return "text-muted";

  return "text-secondary";
}

// 열 정의입니다. 너비를 조절할 수 있어 한 곳에 모아 둡니다.
// 마지막 열("내용")에는 손잡이를 달지 않습니다 — 남는 자리를 다 차지하는 열이라
// 끌어도 기준이 없어 이상하게 움직입니다.
const COLUMNS = [
  { key: "occurredAt", label: "발생 시각", width: 168 },
  { key: "actor", label: "한 사람", width: 140 },
  { key: "actorName", label: "이름", width: 100 },
  { key: "actorIp", label: "접속 IP", width: 132 },
  { key: "action", label: "한 일", width: 128 },
  { key: "target", label: "대상", width: 200 },
  { key: "division", label: "업무구분", width: 88 },
  { key: "detail", label: "내용", width: 0 }, // 남는 자리를 다 씁니다
] as const;

const DEFAULT_WIDTHS = Object.fromEntries(
  COLUMNS.filter((c) => c.width > 0).map((c) => [c.key, c.width]),
);

const WIDTH_STORAGE_KEY = "pingcheck-audit-columns-v1";

const PAGE_SIZE_OPTIONS = [50, 100, 200] as const;

type AuditTableProps = {
  rows: readonly AuditEntry[];
  totalCount: number;
  page: number;
  totalPages: number;
  pageSize: number;
  loading: boolean;
  onDownload: () => void;
  downloading: boolean;
  onPageChange: (next: number) => void;
  onPageSizeChange: (next: number) => void;
};

export function AuditTable({
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
}: AuditTableProps) {
  const { widths, startResize, reset, changed } = useColumnWidths(
    WIDTH_STORAGE_KEY,
    DEFAULT_WIDTHS,
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
            title={totalCount === 0 ? "내려받을 이력이 없습니다" : undefined}
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
        <table className="data-table min-w-[1120px]">
          <colgroup>
            {COLUMNS.map((column) => (
              <col
                key={column.key}
                style={column.width > 0 ? { width: widths[column.key] } : undefined}
              />
            ))}
          </colgroup>

          <thead>
            <tr>
              {COLUMNS.map((column, index) => (
                <th key={column.key} scope="col" className="relative">
                  {column.label}

                  {index < COLUMNS.length - 1 ? (
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
                <td colSpan={COLUMNS.length} className="py-10 text-center text-muted">
                  불러오는 중입니다.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="py-10 text-center text-muted">
                  조건에 맞는 이력이 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="font-mono">{formatDateTime(row.occurredAt)}</td>
                  <td className="font-mono">{row.actorLoginId}</td>
                  <td>{row.actorName}</td>
                  {/* 화면을 거치지 않고 들어온 요청은 IP 가 없을 수 있습니다. */}
                  <td className="font-mono">{row.actorIp ?? "-"}</td>
                  {/* 모르는 행위 이름이면 그대로 보여 줍니다. 감추면 무슨 일이었는지 사라집니다. */}
                  <td className={actionClass(row.action)}>
                    {AUDIT_ACTION_LABEL[row.action] ?? row.action}
                  </td>
                  <td className="truncate" title={row.targetLabel}>
                    {row.targetLabel === "" ? "-" : row.targetLabel}
                  </td>
                  {/* 로그인·설정처럼 파트와 무관한 일은 빈 칸입니다. */}
                  <td>
                    {row.divisionId === null
                      ? "-"
                      : (BUSINESS_DIVISION_LABEL[row.divisionId as BusinessDivisionId] ??
                        row.divisionId)}
                  </td>
                  <td>{row.detail}</td>
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
