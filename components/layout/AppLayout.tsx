import Head from "next/head";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

// 앱 전체 골격입니다. 왼쪽에 사이드바, 오른쪽에 본문을 배치합니다.
// grid 의 minmax(0, 1fr) 덕분에 본문에 넓은 내용이 들어와도
// 본문이 사이드바를 밀어내거나 화면 밖으로 넘치지 않습니다.
export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="bg-theme grid h-[100dvh] grid-cols-1 md:grid-cols-[16rem_minmax(0,1fr)]">
        <Sidebar />
        {/* 본문만 세로로 스크롤됩니다. */}
        <main className="min-w-0 overflow-y-auto">{children}</main>
      </div>
    </>
  );
}
