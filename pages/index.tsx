import Head from "next/head";
import { AvailabilityBar } from "@/components/dashboard/AvailabilityBar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { PanelMessage } from "@/components/dashboard/PanelMessage";
import { RecentIncidents } from "@/components/dashboard/RecentIncidents";
import { ServerStatusTable } from "@/components/dashboard/ServerStatusTable";
import { useMonitoringSnapshot } from "@/lib/monitoring/useMonitoringSnapshot";

// 서비스의 기본 화면입니다. 접속하면 바로 모니터링 대시보드가 보입니다.
// 데이터는 훅에서 한 번만 받아 오고, 아래 컴포넌트들에는 props 로만 넘겨 줍니다.
export default function DashboardPage() {
  const { snapshot, status } = useMonitoringSnapshot();
  const ready = status === "ready";

  return (
    <>
      <Head>
        <title>Dashboard | Server Monitoring</title>
      </Head>

      <DashboardHeader
        updatedAt={snapshot.updatedAt}
        source={snapshot.source}
        status={status}
      />

      <div className="space-y-3 px-6 py-4">
        {/* 전체 현황 */}
        <OverviewCards stats={snapshot.stats} loading={!ready} />

        {/* 상태 비율 막대 */}
        <AvailabilityBar stats={snapshot.stats} />

        {/* 서버 상태 목록 */}
        {ready ? (
          <ServerStatusTable servers={snapshot.servers} />
        ) : (
          <PanelMessage
            message={
              status === "loading"
                ? "서버 목록을 불러오는 중입니다."
                : "서버 목록을 불러오지 못했습니다."
            }
          />
        )}

        {/* 최근 장애 */}
        {ready ? (
          <RecentIncidents incidents={snapshot.incidents} />
        ) : (
          <PanelMessage
            message={
              status === "loading"
                ? "장애 이력을 불러오는 중입니다."
                : "장애 이력을 불러오지 못했습니다."
            }
          />
        )}
      </div>
    </>
  );
}
