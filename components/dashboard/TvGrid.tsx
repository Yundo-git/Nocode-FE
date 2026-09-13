import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";
import type { ServerDisplayState } from "@/lib/servers/types";
import type { TvRow } from "@/lib/dashboard/useTvServers";

// 장비 하나가 작은 상자 하나입니다. 벽에 붙은 화면에서 한눈에 훑는 용도입니다.
//
// ★ 상자 크기를 못박아 둡니다.
//   "한 화면에 몇 개가 들어가는가" 를 세야 자동으로 넘길 수 있습니다.
//   auto-fill 로 브라우저에게 맡기면 개수를 알 길이 없습니다.
const BOX_WIDTH = 152; // 9.5rem
const BOX_HEIGHT = 38;
const GAP = 8;

/** 화면에 다 안 들어갈 때 다음 묶음으로 넘어가는 간격입니다. 핑 주기와 같습니다. */
const TURN_MS = 15_000;

// 상자 색입니다. 정상은 바탕을 건드리지 않습니다.
// 다 칠하면 온통 초록이라, 정작 빨강이 묻힙니다.
const BOX_STYLE: Record<ServerDisplayState, string> = {
  online: "border-line bg-panel text-body",
  offline: "border-down-500 bg-down-500/15 text-down-500",
  // 확정 전이라 바탕까지 물들이지는 않습니다. 점만 주황입니다.
  pending: "border-pending-500 bg-panel text-body",
  disabled: "border-line bg-panel text-muted opacity-60",
};

const DOT_STYLE: Record<ServerDisplayState, string> = {
  // ★ 정상만 깜빡입니다. "지금 살아 있다" 는 뜻입니다.
  //   멈춰 있으면 화면이 굳었는지 장비가 멀쩡한지 구분할 수 없습니다.
  online: "bg-up-500 animate-pulse-slow",
  // 비정상은 깜빡이지 않습니다. 상자째 빨갛게 두는 편이 훨씬 잘 보이고,
  // 초록이 잔잔히 뛰는 화면에서 **멈춰 있는 빨강**이 오히려 눈에 박힙니다.
  offline: "bg-down-500",
  // 확인 중입니다. 깜빡이지 않습니다 — 아직 알릴 일이 아닙니다.
  pending: "bg-pending-500",
  disabled: "bg-unknown-500",
};

/** 지금 칸 크기에서 한 화면에 몇 개가 들어가는지 셉니다. */
function countPerPage(width: number, height: number): number {
  const columns = Math.max(1, Math.floor((width + GAP) / (BOX_WIDTH + GAP)));
  const rows = Math.max(1, Math.floor((height + GAP) / (BOX_HEIGHT + GAP)));

  return columns * rows;
}

export function TvGrid({ rows }: { rows: readonly TvRow[] }) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [perPage, setPerPage] = useState(0);
  const [page, setPage] = useState(0);
  // 방금 복사한 장비입니다. 잠깐 표시해 주고 지웁니다.
  const [copiedId, setCopiedId] = useState("");

  // 칸 크기가 바뀌면 몇 개가 들어가는지 다시 셉니다.
  // TV 마다 해상도가 다르고, 창 크기를 바꿔 볼 수도 있습니다.
  useLayoutEffect(() => {
    const box = boxRef.current;

    if (box === null) return;

    const measure = () =>
      setPerPage(countPerPage(box.clientWidth, box.clientHeight));

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(box);

    return () => observer.disconnect();
  }, []);

  // ★ 아직 크기를 못 쟀으면 한 묶음에 전부 담습니다.
  //   벽 화면이 비어 보이는 것이 가장 나쁩니다. 넘쳐서 잘리는 편이 낫습니다.
  const size = perPage > 0 ? perPage : rows.length;
  const pageCount = size > 0 ? Math.ceil(rows.length / size) : 1;

  // 장비가 줄어 쪽 수가 줄면 지금 쪽 번호를 끌어내립니다.
  // 안 그러면 빈 쪽이 떠서 화면이 통째로 비어 보입니다.
  useEffect(() => {
    if (page >= pageCount) setPage(0);
  }, [page, pageCount]);

  // ★ 한 쪽에 다 들어가면 넘기지 않습니다.
  //   보여 줄 것이 그대로인데 15초마다 화면이 움직이면 방해만 됩니다.
  useEffect(() => {
    if (pageCount <= 1) return;

    const timer = setInterval(
      () => setPage((prev) => (prev + 1) % pageCount),
      TURN_MS,
    );

    return () => clearInterval(timer);
  }, [pageCount]);

  const handleCopy = async (row: TvRow) => {
    // 관제에서 장애를 보면 바로 핑을 쏴 봅니다. 그 명령을 통째로 넣어 줍니다.
    const ok = await copyText(`ping ${row.ip}`);

    if (!ok) return;

    setCopiedId(row.id);
    window.setTimeout(() => setCopiedId(""), 1200);
  };

  // ★ 장비가 없어도 이 칸은 **늘 그립니다.**
  //   여기서 일찍 빠져나가면 크기를 잴 칸(ref)이 붙지 않습니다.
  //   그러면 위 effect 가 아무것도 못 재고, 한 번만 도는 effect 라
  //   나중에 장비가 도착해도 다시 재지 않습니다.
  //   결과는 "한 화면에 0개" 로 굳어 **상자가 하나도 안 보이는 화면**입니다.
  return (
    <div ref={boxRef} className="relative h-full overflow-hidden">
      {rows.length === 0 ? (
        <p className="py-20 text-center text-s1 text-muted">등록된 장비가 없습니다.</p>
      ) : (
        <>
          {/* 쪽들을 옆으로 늘어놓고 통째로 밀어 넘깁니다.
              한 쪽씩 갈아 끼우면 깜빡여서, 벽 화면에서는 눈에 거슬립니다. */}
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {Array.from({ length: pageCount }, (_, index) => (
              <div
                key={index}
                className="grid h-full w-full shrink-0 content-start gap-2"
                style={{ gridTemplateColumns: `repeat(auto-fill, ${BOX_WIDTH}px)` }}
              >
                {rows.slice(index * size, (index + 1) * size).map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => void handleCopy(row)}
                    title={`누르면 "ping ${row.ip}" 가 복사됩니다`}
                    style={{ height: BOX_HEIGHT }}
                    className={`flex items-center gap-2 rounded-md border px-2.5 text-left transition ${BOX_STYLE[row.state]} hover:brightness-110`}
                  >
                    <span
                      aria-hidden
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT_STYLE[row.state]}`}
                    />
                    {/* 고정폭 숫자(tabular-nums)라야 자릿수가 달라도 세로줄이 맞습니다. */}
                    <span className="truncate font-mono text-bt-text-m tabular-nums">
                      {copiedId === row.id ? "복사됨" : row.ip}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* 지금 몇 번째 묶음인지입니다. 없으면 "왜 장비가 사라졌지" 로 읽힙니다. */}
          {pageCount > 1 ? (
            <div className="absolute bottom-0 right-0 flex items-center gap-1.5 rounded-md bg-panel/90 px-2 py-1">
              {Array.from({ length: pageCount }, (_, index) => (
                <span
                  key={index}
                  aria-hidden
                  className={`h-1.5 rounded-full transition-all ${
                    index === page ? "w-4 bg-primary-600" : "w-1.5 bg-line-strong"
                  }`}
                />
              ))}
              <span className="ml-1 font-mono text-bt-text-s tabular-nums text-muted">
                {page + 1}/{pageCount}
              </span>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
