import Head from "next/head";
import type { ResponsiveLayouts } from "react-grid-layout";
import {
  DashboardGrid,
  DRAG_HANDLE_CLASS,
} from "@/components/dashboard/DashboardGrid";
import { Panel } from "@/components/ui/Panel";

// 상자를 옮긴 자리를 저장해 두는 칸 이름입니다.
const LAYOUT_STORAGE_KEY = "nocode-dashboard-layout";

// 처음 배치입니다. i 값은 아래 JSX 의 key 와 반드시 같아야 합니다.
//
// 넓은 화면은 14칸을 씁니다. 상단을 8 : 6 으로 나누면 정확히 4 : 3 입니다.
// 좁은 화면(768px 미만)은 1칸이라 위에서 아래로 하나씩 쌓입니다.
const WIDE_LAYOUT = [
  { i: "status", x: 0, y: 0, w: 8, h: 6 },
  { i: "uptime", x: 8, y: 0, w: 6, h: 6 },
  { i: "incidents", x: 0, y: 6, w: 14, h: 6 },
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
                description="1분갱신"
                actions={
                  <button type="button" className="btn btn-ghost btn-sm">
                    새로고침
                  </button>
                }
              >
                <PlaceholderBody />
              </Panel>
            </div>

            <div key="uptime">
              <Panel
                className="h-full"
                headerClassName={HEADER_CLASS}
                bodyClassName="overflow-auto"
                title="현재시간"
              >
                <PlaceholderBody />
              </Panel>
            </div>

            <div key="incidents">
              <Panel
                className="h-full"
                headerClassName={HEADER_CLASS}
                bodyClassName="overflow-auto"
                title="실시간 로그"
                footer={
                  <span className="text-b2_body_r text-muted">
                    마지막 갱신 --:--
                  </span>
                }
              >
                <PlaceholderBody />
              </Panel>
            </div>
          </DashboardGrid>
        </div>
      </div>
    </>
  );
}

// 아직 데이터가 없어서 자리만 채워 두는 부분입니다.
function PlaceholderBody() {
  return (
    <div className="flex h-full items-center justify-center text-b2_body_r text-muted">
      연결된 데이터가 없습니다.
    </div>
  );
}
