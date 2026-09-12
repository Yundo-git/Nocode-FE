import Head from "next/head";
import { useCallback, useMemo, useState } from "react";
import { useTableState } from "@/lib/useTableState";
import { AccountFilters } from "@/components/accounts/AccountFilters";
import { AccountFormModal } from "@/components/accounts/AccountFormModal";
import { AccountTable } from "@/components/accounts/AccountTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { canManageAccounts } from "@/lib/accounts/permissions";
import { useAccounts } from "@/lib/accounts/useAccounts";
import { useAuth } from "@/lib/auth";
import {
  EMPTY_ACCOUNT_FILTERS,
  type Account,
  type AccountFilterValues,
  type AdminAccountInput,
} from "@/lib/accounts/types";

// 검색 조건에 맞는 계정만 걸러 냅니다.
// 백엔드가 붙으면 이 조건을 그대로 넘기고 이 함수는 지우면 됩니다.
function applyFilters(
  accounts: readonly Account[],
  filters: AccountFilterValues,
): readonly Account[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return accounts.filter((account) => {
    if (keyword) {
      const haystack =
        `${account.loginId} ${account.name} ${account.email}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }

    if (filters.divisionId && account.divisionId !== filters.divisionId) {
      return false;
    }
    if (filters.role && account.role !== filters.role) return false;
    if (filters.enabled === "on" && !account.enabled) return false;
    if (filters.enabled === "off" && account.enabled) return false;

    return true;
  });
}

export default function AccountsPage() {
  const { user } = useAuth();
  const {
    accounts,
    status,
    toggleEnabled,
    createAccount,
    updateAccount,
    removeAccount,
  } = useAccounts();

  // 지금 보고 있는 사람이 누구인지는 아이디로만 알 수 있습니다.
  // 세션이 없어서, 이 판단은 화면을 정리해 줄 뿐 보안이 되지 못합니다. (NOTES.md 4-5)
  const me = useMemo(
    () =>
      user === null
        ? null
        : (accounts.find((item) => item.loginId === user.username) ?? null),
    [accounts, user],
  );
  const canManage = me !== null && canManageAccounts(me);

  // null 이면 새로 만드는 창, 값이 있으면 그 계정을 고치는 창입니다.
  const [editing, setEditing] = useState<Account | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const handleSubmit = useCallback(
    async (input: AdminAccountInput): Promise<string> => {
      const result =
        editing === null
          ? await createAccount(input)
          : await updateAccount(editing.id, input);

      if (result.ok) return "";

      return result.reason === "duplicate-login-id"
        ? "이미 쓰고 있는 아이디입니다."
        : "계정을 찾을 수 없습니다.";
    },
    [editing, createAccount, updateAccount],
  );


  const filterAccounts = useCallback(
    (values: AccountFilterValues) => applyFilters(accounts, values),
    [accounts],
  );

  const table = useTableState(EMPTY_ACCOUNT_FILTERS, filterAccounts);

  return (
    <>
      <Head>
        <title>계정관리 | PingCheck</title>
      </Head>

      <div className="space-y-4 px-6 py-4">
        <PageHeader breadcrumb={["시스템", "계정관리"]} title="계정관리" />

        <AccountFilters onSearch={table.search} />

        {status === "error" ? (
          <div className="panel px-4 py-10 text-center text-b2_body_r text-muted">
            계정 목록을 불러오지 못했습니다.
          </div>
        ) : (
          <AccountTable
            rows={table.rows}
            totalCount={table.totalCount}
            page={table.page}
            totalPages={table.totalPages}
            pageSize={table.pageSize}
            onPageChange={table.setPage}
            onPageSizeChange={table.changePageSize}
            onToggleEnabled={toggleEnabled}
            canManage={canManage}
            onCreateClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            onRowClick={(account) => {
              setEditing(account);
              setFormOpen(true);
            }}
          />
        )}

        {/* 관리자에게만 창을 띄웁니다. */}
        {canManage ? (
          <AccountFormModal
            open={formOpen}
            account={editing}
            onClose={() => setFormOpen(false)}
            onSubmit={handleSubmit}
            onDelete={removeAccount}
          />
        ) : null}
      </div>
    </>
  );
}
