import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatDateTime } from "@/lib/datetime";
import { BUSINESS_DIVISION_LABEL } from "@/lib/businessDivisions";
import { LOG_TYPE_LABEL, type LogEntry, type LogType } from "@/lib/logs/types";

const TYPE_CLASS: Record<LogType, string> = {
  down: "text-down-500 font-bold",
  up: "text-up-500 font-bold",
  registered: "text-secondary",
};

const COLUMNS: readonly Column[] = [
  { key: "occurredAt", label: "발생 시각", width: 168 },
  { key: "type", label: "종류", width: 104 },
  { key: "ip", label: "IP", width: 132 },
  { key: "serverType", label: "타입", width: 88 },
  { key: "division", label: "업무구분", width: 88 },
  { key: "nameEn", label: "영문명", width: 132 },
  { key: "nameKo", label: "한글명", width: 132 },
  { key: "detail", label: "내용", width: 0 },
];

type LogTableProps = {
  rows: readonly LogEntry[];
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

export function LogTable(props: LogTableProps) {
  return (
    <DataTable
      {...props}
      columns={COLUMNS}
      widthStorageKey="pingcheck-log-columns-v2"
      minWidth={1120}
      rowKey={(log) => log.id}
      emptyText="조건에 맞는 로그가 없습니다."
      nothingToDownload="내려받을 로그가 없습니다"
      renderCells={(log) => (
        <>
          <td className="font-mono">{formatDateTime(log.occurredAt)}</td>
          <td className={TYPE_CLASS[log.type]}>{LOG_TYPE_LABEL[log.type]}</td>
          <td className="font-mono">{log.serverIp}</td>
          <td>{log.serverType}</td>
          <td>{BUSINESS_DIVISION_LABEL[log.divisionId]}</td>
          <td className="font-mono">{log.serverNameEn}</td>
          <td>{log.serverNameKo}</td>
          <td>{log.detail}</td>
        </>
      )}
    />
  );
}
