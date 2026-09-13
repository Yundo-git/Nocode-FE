import Head from "next/head";
import { useCallback, useMemo, useState } from "react";
import { useTableState } from "@/lib/useTableState";
import { AccountFilters } from "@/components/accounts/AccountFilters";
import { AccountFormModal } from "@/components/accounts/AccountFormModal";
import { AccountTable } from "@/components/accounts/AccountTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { canManageAccounts } from "@/lib/accounts/permissions";
import { RequirePermission } from "@/components/auth/RequirePermission";
import { fetchAccountPage, useAccountActions } from "@/lib/accounts/useAccounts";
import { useAuth } from "@/lib/auth";
import {
  EMPTY_ACCOUNT_FILTERS,
  type Account,
  type AccountFilterValues,
  type AdminAccountInput,
} from "@/lib/accounts/types";

// 주소를 직접 쳐서 들어오는 것도 막습니다. (사이드바에서 감추는 것만으로는 부족)
export default function AccountsPageRoute() {
  return (
    <RequirePermission allow={canManageAccounts}>
      <AccountsPage />
    </RequirePermission>
  );
}

function AccountsPage() {
  // 지금 보고 있는 사람은 백엔드가 세션을 보고 알려 줍니다.
  const { account: me } = useAuth();
  const {
    setEnabled,
    createAccount,
    updateAccount,
    removeAccount,
    resetPassword,
  } = useAccountActions();

  // 버튼을 숨기는 것은 화면 정리일 뿐입니다.
  // 실제 차단은 API 가 합니다. (pingcheck-be 의 requireAccountManager)
  const canManage = me !== null && canManageAccounts(me);

  // null 이면 새로 만드는 창, 값이 있으면 그 계정을 고치는 창입니다.
  const [editing, setEditing] = useState<Account | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const table = useTableState<AccountFilterValues, Account>(
    EMPTY_ACCOUNT_FILTERS,
    fetchAccountPage,
  );

  const handleSubmit = useCallback(
    async (input: AdminAccountInput): Promise<string> => {
      const result =
        editing === null
          ? await createAccount(input)
          : await updateAccount(editing.id, input);

      if (!result.ok) {
        return result.reason === "duplicate-login-id"
          ? "이미 쓰고 있는 아이디입니다."
          : "계정을 찾을 수 없습니다.";
      }

      // 쪽 나누기를 서버가 하므로 지금 쪽을 다시 받아야 합니다.
      if (editing === null) table.setPage(1);
      table.reload();
      return "";
    },
    [editing, createAccount, updateAccount, table],
  );

  const handleDelete = useCallback(
    async (id: string): Promise<string> => {
      const message = await removeAccount(id);

      if (message === "") table.reload();

      return message;
    },
    [removeAccount, table],
  );

  const handleToggleEnabled = useCallback(
    async (id: string) => {
      const target = table.rows.find((row) => row.id === id);

      if (target === undefined) return;

      const message = await setEnabled(id, !target.enabled);

      if (message === "") table.reload();
    },
    [setEnabled, table],
  );

  return (
    <>
      <Head>
        <title>계정관리 | PingCheck</title>
      </Head>

      <div className="space-y-4 px-6 py-4">
        <PageHeader breadcrumb={["시스템", "계정관리"]} title="계정관리" />

        <AccountFilters onSearch={table.search} />

        {table.status === "error" ? (
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
            onToggleEnabled={(id) => void handleToggleEnabled(id)}
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
            onDelete={handleDelete}
            onResetPassword={resetPassword}
          />
        ) : null}
      </div>
    </>
  );
}
