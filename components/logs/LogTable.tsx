import { Pagination } from "@/components/ui/Pagination";
import { BUSINESS_DIVISION_LABEL } from "@/lib/businessDivisions";
import { LOG_TYPE_LABEL, type LogEntry, type LogType } from "@/lib/logs/types";

// 로그 종류별 색입니다. 모두 테마에 따라 바뀌는 토큰만 씁니다.
const TYPE_CLASS: Record<LogType, string> = {
  down: "text-down-500 font-bold",
  up: "text-up-500 font-bold",
  "ping-on": "text-secondary",
  "ping-off": "text-muted",
  registered: "text-secondary",
};

type LogTableProps = {
  rows: readonly LogEntry[];
  totalCount: number;
  page: number;
  totalPages: number;
  pageSize: number;
  loading: boolean;
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
  onPageChange,
  onPageSizeChange,
}: LogTableProps) {
  return (
    <div className="panel flex min-w-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <span className="text-b2_body_m font-medium text-secondary">
          총 {totalCount.toLocaleString("en-US")}건 ({page}/{totalPages} page)
        </span>

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

      <div className="min-w-0 overflow-x-auto">
        <table className="data-table min-w-[880px]">
          <colgroup>
            <col className="w-44" />
            <col className="w-28" />
            <col className="w-36" />
            <col className="w-24" />
            <col className="w-28" />
            <col />
          </colgroup>

          <thead>
            <tr>
              <th scope="col">발생 시각</th>
              <th scope="col">종류</th>
              <th scope="col">IP</th>
              <th scope="col">업무구분</th>
              <th scope="col">장비명</th>
              <th scope="col">내용</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-muted">
                  불러오는 중입니다.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-muted">
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

// 2026-09-12 11:48:20 형태입니다.
// toLocaleString 은 브라우저 설정에 따라 모양이 달라져 직접 맞춥니다.
function formatDateTime(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "-";

  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}
