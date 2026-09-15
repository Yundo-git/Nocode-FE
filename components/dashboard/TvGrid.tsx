import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";
import type { ServerDisplayState } from "@/lib/servers/types";
import type { TvRow } from "@/lib/dashboard/useTvServers";

const BOX_WIDTH = 152;
const BOX_HEIGHT = 38;
const GAP = 8;

const TURN_MS = 15_000;

const BOX_STYLE: Record<ServerDisplayState, string> = {
  online: "border-line bg-panel text-body",
  offline: "border-down-500 bg-down-500/15 text-down-500",
  pending: "border-pending-500 bg-panel text-body",
  disabled: "border-line bg-panel text-muted opacity-60",
};

const DOT_STYLE: Record<ServerDisplayState, string> = {
  online: "bg-up-500 animate-pulse-slow",
  offline: "bg-down-500",
  pending: "bg-pending-500",
  disabled: "bg-unknown-500",
};

function countPerPage(width: number, height: number): number {
  const columns = Math.max(1, Math.floor((width + GAP) / (BOX_WIDTH + GAP)));
  const rows = Math.max(1, Math.floor((height + GAP) / (BOX_HEIGHT + GAP)));

  return columns * rows;
}

export function TvGrid({ rows }: { rows: readonly TvRow[] }) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [perPage, setPerPage] = useState(0);
  const [page, setPage] = useState(0);
  const [copiedId, setCopiedId] = useState("");

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

  const size = perPage > 0 ? perPage : rows.length;
  const pageCount = size > 0 ? Math.ceil(rows.length / size) : 1;

  useEffect(() => {
    if (page >= pageCount) setPage(0);
  }, [page, pageCount]);

  useEffect(() => {
    if (pageCount <= 1) return;

    const timer = setInterval(
      () => setPage((prev) => (prev + 1) % pageCount),
      TURN_MS,
    );

    return () => clearInterval(timer);
  }, [pageCount]);

  const handleCopy = async (row: TvRow) => {
    const ok = await copyText(`ping ${row.ip}`);

    if (!ok) return;

    setCopiedId(row.id);
    window.setTimeout(() => setCopiedId(""), 1200);
  };

  return (
    <div ref={boxRef} className="relative h-full overflow-hidden">
      {rows.length === 0 ? (
        <p className="py-20 text-center text-s1 text-muted">등록된 장비가 없습니다.</p>
      ) : (
        <>
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
                    <span className="truncate font-mono text-bt-text-m tabular-nums">
                      {copiedId === row.id ? "복사됨" : row.ip}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>

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
