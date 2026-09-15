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

export default function AccountsPageRoute() {
  return (
    <RequirePermission allow={canManageAccounts}>
      <AccountsPage />
    </RequirePermission>
  );
}

function AccountsPage() {
  const { account: me } = useAuth();
  const {
    setEnabled,
    createAccount,
    updateAccount,
    removeAccount,
    resetPassword,
  } = useAccountActions();

  const canManage = me !== null && canManageAccounts(me);

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

      <div className="flex h-full min-h-0 flex-col gap-4 px-6 py-4">
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
