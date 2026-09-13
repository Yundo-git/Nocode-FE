import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatDateTime } from "@/lib/datetime";
import { BUSINESS_DIVISION_LABEL, type BusinessDivisionId } from "@/lib/businessDivisions";
import { AUDIT_ACTION_LABEL, type AuditEntry } from "@/lib/audit/types";

// 한 일에 따른 색입니다.
//
// ★ 지우는 일·로그인 실패·거절만 붉게 둡니다.
//   전부 색을 입히면 아무것도 안 튀어나옵니다. 되짚어 볼 때 먼저 찾는 것은
//   "누가 지웠나" 와 "누가 두드렸나" 입니다.
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
  { key: "actor", label: "한 사람", width: 140 },
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
          {/* 화면을 거치지 않고 들어온 요청은 IP 가 없을 수 있습니다. */}
          <td className="font-mono">{row.actorIp ?? "-"}</td>
          {/* 모르는 행위 이름이면 그대로 보여 줍니다. 감추면 무슨 일이었는지 사라집니다. */}
          <td className={actionClass(row.action)}>
            {AUDIT_ACTION_LABEL[row.action] ?? row.action}
          </td>
          <td className="truncate" title={row.targetLabel}>
            {row.targetLabel === "" ? "-" : row.targetLabel}
          </td>
          {/* 로그인·거절처럼 파트와 무관한 일은 빈 칸입니다. */}
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
