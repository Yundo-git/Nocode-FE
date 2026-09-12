import { Pagination } from "@/components/ui/Pagination";
import { Toggle } from "@/components/ui/Toggle";
import { ROLE_LABEL, type Account } from "@/lib/accounts/types";
import { BUSINESS_DIVISION_LABEL } from "@/lib/businessDivisions";

type AccountTableProps = {
  rows: readonly Account[];
  totalCount: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (next: number) => void;
  onPageSizeChange: (next: number) => void;
  onToggleEnabled: (id: string) => void;
  /** 관리자일 때만 참입니다. 등록 버튼과 줄 누르기를 켭니다. */
  canManage: boolean;
  onCreateClick: () => void;
  onRowClick: (account: Account) => void;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

// 파트 관리자는 눈에 띄게 표시합니다. 일반 계정은 조용히 둡니다.
function RoleBadge({ role }: { role: Account["role"] }) {
  if (role === "viewer") {
    return <span className="text-muted">{ROLE_LABEL.viewer}</span>;
  }

  return (
    <span className="rounded-[var(--radius-sm)] bg-primary-600 px-1.5 py-0.5 text-bt-text-s font-bold text-white">
      {ROLE_LABEL.admin}
    </span>
  );
}

export function AccountTable({
  rows,
  totalCount,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onToggleEnabled,
  canManage,
  onCreateClick,
  onRowClick,
}: AccountTableProps) {
  return (
    <div className="panel flex min-w-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <span className="text-b2_body_m font-medium text-secondary">
          총 {totalCount}건 ({page}/{Math.max(totalPages, 1)} page)
        </span>

        <div className="flex items-center gap-2">
          {/* 등록 버튼은 관리자에게만 보입니다. */}
          {canManage ? (
            <button
              type="button"
              onClick={onCreateClick}
              className="btn btn-primary btn-sm"
            >
              등록
            </button>
          ) : null}

          <select
            aria-label="한 쪽에 보여 줄 개수"
          value={pageSize}
            onChange={(event) =>
              onPageSizeChange(Number(event.currentTarget.value))
            }
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
        <table className="data-table min-w-[900px]">
          <colgroup>
            <col className="w-40" />
            <col className="w-24" />
            <col className="w-24" />
            <col className="w-28" />
            <col />
            <col className="w-36" />
            <col className="w-24" />
          </colgroup>

          <thead>
            <tr>
              <th scope="col">아이디</th>
              <th scope="col">이름</th>
              <th scope="col">소속 파트</th>
              <th scope="col">권한</th>
              <th scope="col">이메일</th>
              <th scope="col">번호</th>
              <th scope="col" className="center">사용여부</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-muted">
                  조건에 맞는 계정이 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((account) => (
                <tr
                  key={account.id}
                  // 관리자만 줄을 눌러 수정 창을 열 수 있습니다.
                  onClick={canManage ? () => onRowClick(account) : undefined}
                  className={canManage ? "cursor-pointer" : undefined}
                >
                  <td className="font-mono">{account.loginId}</td>
                  <td>{account.name}</td>
                  <td>{BUSINESS_DIVISION_LABEL[account.divisionId]}</td>
                  <td>
                    <RoleBadge role={account.role} />
                  </td>
                  <td>{account.email}</td>
                  <td className="font-mono">{account.phone}</td>
                  {/* 토글을 눌렀을 때 줄 클릭(수정 창)까지 일어나지 않게 막습니다. */}
                  <td className="center" onClick={(event) => event.stopPropagation()}>
                    <Toggle
                      checked={account.enabled}
                      onChange={() => onToggleEnabled(account.id)}
                      label={`${account.name} 계정 사용`}
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
