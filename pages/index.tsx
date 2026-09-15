import Head from "next/head";
import { useRouter } from "next/router";
import type { ResponsiveLayouts } from "react-grid-layout";
import {
  DashboardGrid,
  DRAG_HANDLE_CLASS,
} from "@/components/dashboard/DashboardGrid";
import { ClockOrAlert } from "@/components/dashboard/ClockOrAlert";
import { RecentLogs } from "@/components/dashboard/RecentLogs";
import { MaintenanceToggle } from "@/components/dashboard/MaintenanceToggle";
import { ServerStatusPanel } from "@/components/dashboard/ServerStatusPanel";
import { Panel } from "@/components/ui/Panel";
import { useDashboardSummary } from "@/lib/dashboard/useDashboardSummary";
import { SUMMARY_REFRESH_MS, staleAfterMs } from "@/lib/dashboard/types";
import { useNow } from "@/lib/useNow";
import { useSettings } from "@/lib/settings/useSettings";
import { useAuth } from "@/lib/auth";

const LAYOUT_STORAGE_KEY = "nocode-dashboard-layout-v5";

const WIDE_LAYOUT = [
  { i: "status", x: 0, y: 0, w: 16, h: 4 },
  { i: "uptime", x: 16, y: 0, w: 4, h: 4 },
  { i: "incidents", x: 0, y: 4, w: 20, h: 6 },
];

const NARROW_LAYOUT = [
  { i: "status", x: 0, y: 0, w: 1, h: 6 },
  { i: "uptime", x: 0, y: 6, w: 1, h: 6 },
  { i: "incidents", x: 0, y: 12, w: 1, h: 6 },
];

const DEFAULT_LAYOUTS: ResponsiveLayouts = {
  lg: WIDE_LAYOUT,
  md: WIDE_LAYOUT,
  sm: WIDE_LAYOUT,
  xs: NARROW_LAYOUT,
  xxs: NARROW_LAYOUT,
};

const HEADER_CLASS = `${DRAG_HANDLE_CLASS} cursor-move select-none`;

export default function HomePage() {
  const router = useRouter();
  const { account } = useAuth();
  const { summary, status, reload } = useDashboardSummary();
  const { settings } = useSettings();
  const now = useNow();

  return (
    <>
      <Head>
        <title>PingCheck</title>
      </Head>

      <div className="px-6 py-4">

        <div className="mt-4">
          <DashboardGrid
            storageKey={LAYOUT_STORAGE_KEY}
            defaultLayouts={DEFAULT_LAYOUTS}
            fitRows={10}
            toolbarLeft={<MaintenanceToggle />}
            onTvMode={() => void router.push("/tv")}
          >
            <div key="status">
              <Panel
                className="h-full"
                headerClassName={HEADER_CLASS}
                bodyClassName="overflow-auto"
                title="서버 상태"
                description={`${SUMMARY_REFRESH_MS / 1000}초 갱신`}
                actions={
                  <button
                    type="button"
                    onClick={() => void reload()}
                    disabled={status === "loading"}
                    className="btn btn-ghost btn-sm"
                  >
                    새로고침
                  </button>
                }
              >
                <ServerStatusPanel
                  summary={summary}
                  loading={status === "loading"}
                  now={now}
                  staleAfterMs={staleAfterMs(settings.pingIntervalSec)}
                  pingIntervalMs={settings.pingIntervalSec * 1000}
                />
              </Panel>
            </div>

            <div key="uptime">
              <Panel
                className="h-full"
                headerClassName={HEADER_CLASS}
                bodyClassName="overflow-auto"
                title="현재시간"
              >
                <ClockOrAlert
                  problems={summary.problems}
                  muted={account?.notifyEnabled === false}
                  now={now}
                />
              </Panel>
            </div>

            <div key="incidents">
              <Panel
                className="h-full"
                headerClassName={HEADER_CLASS}
                bodyClassName="overflow-auto"
                title="실시간 확인 결과"
                description={`${SUMMARY_REFRESH_MS / 1000}초 갱신`}
              >
                <RecentLogs />
              </Panel>
            </div>
          </DashboardGrid>
        </div>
      </div>
    </>
  );
}
