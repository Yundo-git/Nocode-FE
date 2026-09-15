import Head from "next/head";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast } from "@/components/ui/Toast";
import { LogFilters } from "@/components/logs/LogFilters";
import { LogTable } from "@/components/logs/LogTable";
import { useLogs } from "@/lib/logs/useLogs";

export default function LogsPage() {
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
  } = useLogs();

  const [notice, setNotice] = useState("");

  const handleDownload = async () => {
    setNotice(await download());
  };

  return (
    <>
      <Head>
        <title>로그조회 | PingCheck</title>
      </Head>

      <Toast message={notice} tone="error" onDone={() => setNotice("")} />

      <div className="flex h-full min-h-0 flex-col gap-4 px-6 py-4">
        <PageHeader breadcrumb={["시스템", "로그조회"]} title="로그조회" />

        <LogFilters onSearch={search} />

        {status === "error" ? (
          <div className="panel px-4 py-10 text-center text-b2_body_r text-muted">
            로그를 불러오지 못했습니다.
          </div>
        ) : (
          <LogTable
            rows={rows}
            totalCount={totalCount}
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            loading={status === "loading"}
            onDownload={() => void handleDownload()}
          downloading={downloading}
          onPageChange={goToPage}
            onPageSizeChange={changePageSize}
          />
        )}
      </div>
    </>
  );
}
