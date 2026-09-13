import Head from "next/head";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast } from "@/components/ui/Toast";
import { LogFilters } from "@/components/logs/LogFilters";
import { LogTable } from "@/components/logs/LogTable";
import { useLogs } from "@/lib/logs/useLogs";

// 로그조회 화면입니다.
//
// 대시보드의 "실시간 로그" 는 방금 일어난 몇 건만 보여 주고,
// 여기서는 저장된 전체를 조건으로 찾아봅니다.
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

  // 내려받기 결과입니다. 잘렸거나 실패했을 때만 알립니다.
  // 잘 받아졌으면 파일이 내려오는 것 자체가 신호라 따로 알리지 않습니다.
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

      <div className="space-y-4 px-6 py-4">
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
