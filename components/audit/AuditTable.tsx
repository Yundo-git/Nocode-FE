import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatDateTime } from "@/lib/datetime";
import { BUSINESS_DIVISION_LABEL, type BusinessDivisionId } from "@/lib/businessDivisions";
import { AUDIT_ACTION_LABEL, type AuditEntry } from "@/lib/audit/types";

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

const COLUMNS: readonly Column[] = [
  { key: "occurredAt", label: "발생 시각", width: 168 },
  { key: "actor", label: "ID", width: 140 },
  { key: "actorName", label: "이름", width: 100 },
  { key: "actorIp", label: "접속 IP", width: 132 },
  { key: "action", label: "한 일", width: 128 },
  { key: "target", label: "대상", width: 200 },
  { key: "division", label: "업무구분", width: 88 },
  { key: "detail", label: "내용", width: 0 },
];

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

export function AuditTable(props: AuditTableProps) {
  return (
    <DataTable
      {...props}
      columns={COLUMNS}
      widthStorageKey="pingcheck-audit-columns-v1"
      minWidth={1120}
      rowKey={(row) => row.id}
      emptyText="조건에 맞는 이력이 없습니다."
      nothingToDownload="내려받을 이력이 없습니다"
      renderCells={(row) => (
        <>
          <td className="font-mono">{formatDateTime(row.occurredAt)}</td>
          <td className="font-mono">{row.actorLoginId}</td>
          <td>{row.actorName}</td>
          <td className="font-mono">{row.actorIp ?? "-"}</td>
          <td className={actionClass(row.action)}>
            {AUDIT_ACTION_LABEL[row.action] ?? row.action}
          </td>
          <td className="truncate" title={row.targetLabel}>
            {row.targetLabel === "" ? "-" : row.targetLabel}
          </td>
          <td>
            {row.divisionId === null
              ? "-"
              : (BUSINESS_DIVISION_LABEL[row.divisionId as BusinessDivisionId] ??
                row.divisionId)}
          </td>
          <td>{row.detail}</td>
        </>
      )}
    />
  );
}
