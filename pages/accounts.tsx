import Head from "next/head";
import { useCallback } from "react";
import { useTableState } from "@/lib/useTableState";
import { AccountFilters } from "@/components/accounts/AccountFilters";
import { AccountTable } from "@/components/accounts/AccountTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAccounts } from "@/lib/accounts/useAccounts";
import {
  EMPTY_ACCOUNT_FILTERS,
  type Account,
  type AccountFilterValues,
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
  const { accounts, status, toggleEnabled } = useAccounts();

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
          />
        )}
      </div>
    </>
  );
}
