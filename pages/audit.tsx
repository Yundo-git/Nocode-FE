import Head from "next/head";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast } from "@/components/ui/Toast";
import { RequirePermission } from "@/components/auth/RequirePermission";
import { canManageAccounts } from "@/lib/accounts/permissions";
import { AuditFilters } from "@/components/audit/AuditFilters";
import { AuditTable } from "@/components/audit/AuditTable";
import { useAudit } from "@/lib/audit/useAudit";

// 작업이력 화면입니다.
//
// ★ 로그조회와 다른 것입니다.
//   로그조회는 **장비가** 죽고 살아난 이력, 여기는 **사람이** 한 일입니다.
//   보관 기간도 다릅니다. 로그는 1일/60일, 작업이력은 1년입니다.
//
// ★ 관리자만 봅니다. 누가 어느 PC 에서 드나들었는지, 누구 비밀번호를
//   초기화했는지가 담깁니다. 주소를 직접 쳐도 대시보드로 돌려보냅니다.
//   (실제 차단은 API 가 합니다 — pingcheck-be 의 requireAccountManager)
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

  // 내려받기 결과입니다. 잘렸거나 실패했을 때만 알립니다.
  const [notice, setNotice] = useState("");

  return (
    <>
      <Head>
        <title>작업이력 | PingCheck</title>
      </Head>

      <Toast message={notice} tone="error" onDone={() => setNotice("")} />

      {/* ★ 화면 높이에 맞춰 채웁니다. 페이지 전체가 스크롤되지 않게 하려는 것입니다.
          표가 길어졌을 때 페이지가 통째로 내려가면 검색 조건과 쪽 번호가
          화면 밖으로 밀려나, 다음 쪽으로 가려고 매번 끝까지 내려야 합니다.
          아래 표 안쪽만 스크롤됩니다. (머리글은 sticky 로 붙어 있습니다) */}
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
