import Head from "next/head";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast } from "@/components/ui/Toast";
import { RequirePermission } from "@/components/auth/RequirePermission";
import { canManageAccounts } from "@/lib/accounts/permissions";
import { AuditFilters } from "@/components/audit/AuditFilters";
import { AuditTable } from "@/components/audit/AuditTable";
import { useAudit } from "@/lib/audit/useAudit";

export default function AuditPageRoute() {
  return (
    <RequirePermission allow={canManageAccounts}>
      <AuditPage />
    </RequirePermission>
  );
}

function AuditPage() {
  const {
    rows,
    totalCount,
    page,
    pageSize,
    totalPages,
    status,
    search,
    goToPage,
    changePageSize,
    download,
    downloading,
  } = useAudit();

  const [notice, setNotice] = useState("");

  return (
    <>
      <Head>
        <title>작업이력 | PingCheck</title>
      </Head>

      <Toast message={notice} tone="error" onDone={() => setNotice("")} />

      <div className="flex h-full min-h-0 flex-col gap-4 px-6 py-4">
        <PageHeader breadcrumb={["시스템", "작업이력"]} title="작업이력" />

        <AuditFilters onSearch={search} />

        {status === "error" ? (
          <div className="panel px-4 py-10 text-center text-b2_body_r text-muted">
            작업이력을 불러오지 못했습니다.
          </div>
        ) : (
          <AuditTable
            rows={rows}
            totalCount={totalCount}
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            loading={status === "loading"}
            onDownload={() => void download().then(setNotice)}
            downloading={downloading}
            onPageChange={goToPage}
            onPageSizeChange={changePageSize}
          />
        )}
      </div>
    </>
  );
}
