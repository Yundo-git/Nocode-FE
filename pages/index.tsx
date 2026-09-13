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

// 상자를 옮긴 자리를 저장해 두는 칸 이름입니다.
//
// 뒤의 숫자는 기본 배치를 바꿀 때마다 올립니다.
// 한 번이라도 대시보드를 연 브라우저에는 그때의 배치가 저장돼 있어서,
// 키를 그대로 두면 새 기본값(7:3)이 보이지 않고 예전 배치가 계속 나옵니다.
// (배치에 영향을 주는 값을 바꿀 때마다 뒤 숫자를 올리세요)
const LAYOUT_STORAGE_KEY = "nocode-dashboard-layout-v5";

// 처음 배치입니다. i 값은 아래 JSX 의 key 와 반드시 같아야 합니다.
//
// 가로: 20칸을 씁니다. 상단을 16 : 4 로 나누면 정확히 8 : 2 입니다.
// 세로: 위 4행 + 아래 6행 = 10행. 서버상태줄 : 실시간로그줄 이 4 : 6 입니다.
// (20칸을 쓰는 이유는 DashboardGrid.tsx 의 COLS 주석 참고)
// 좁은 화면(768px 미만)은 1칸이라 위에서 아래로 하나씩 쌓입니다.
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

// 머리말을 잡고 끌면 상자가 움직입니다.
// 오른쪽 아래 모서리를 잡으면 크기가 바뀝니다.
const HEADER_CLASS = `${DRAG_HANDLE_CLASS} cursor-move select-none`;

export default function HomePage() {
  const router = useRouter();
  // 내 소리를 꺼 뒀으면 장애 알림도 깜빡이지 않습니다. (사람마다 다릅니다)
  const { account } = useAuth();
  const { summary, status, reload } = useDashboardSummary();
  const { settings } = useSettings();
  // 지속 시간이 매초 늘어나 보이도록 지금 시각을 여기서 한 번만 셉니다.
  // (각 줄이 따로 타이머를 돌리면 초가 제각각으로 넘어갑니다)
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
            // 위 4 + 아래 6 = 10행이 화면 높이에 딱 맞습니다.
            // WIDE_LAYOUT 의 h 를 바꾸면 이 값도 함께 바꿔야 합니다.
            fitRows={10}
            toolbarLeft={<MaintenanceToggle />}
            onTvMode={() => void router.push("/tv")}
          >
            {/* 각 자식의 key 가 위 배치의 i 와 짝이 맞아야 합니다.
                Panel 을 바로 두지 않고 div 로 한 번 감싸는 이유는,
                격자가 자식에 위치 style 과 ref 를 직접 넣기 때문입니다. */}
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
                  // ★ 서버가 알려 준 핑 주기로 계산합니다.
                  //   화면에 숫자를 적어 두면 언젠가 실제와 어긋납니다.
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
