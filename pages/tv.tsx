import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { HealthDonut } from "@/components/dashboard/HealthDonut";
import { PingPulse } from "@/components/dashboard/PingPulse";
import { OutageAlert } from "@/components/dashboard/OutageAlert";
import { TvGrid } from "@/components/dashboard/TvGrid";
import { useDashboardSummary } from "@/lib/dashboard/useDashboardSummary";
import { useTvServers } from "@/lib/dashboard/useTvServers";
import { SUMMARY_REFRESH_MS, staleAfterMs } from "@/lib/dashboard/types";
import { useSettings } from "@/lib/settings/useSettings";
import { useNotifications } from "@/lib/notifications/useNotifications";
import { useNow } from "@/lib/useNow";
import { formatAgo } from "@/lib/dashboard/duration";

export default function TvPage() {
  const router = useRouter();

  const { muted, soundReady } = useNotifications();
  const { summary, status } = useDashboardSummary();
  const { rows } = useTvServers();
  const { settings } = useSettings();
  const now = useNow();

  const stale =
    summary.lastCheckedAt !== null &&
    now - new Date(summary.lastCheckedAt).getTime() > staleAfterMs(settings.pingIntervalSec);

  const offline = summary.problems.filter((problem) => problem.state === "offline");

  return (
    <>
      <Head>
        <title>TV모드 | PingCheck</title>
      </Head>

      <div className="bg-theme flex h-[100dvh] flex-col px-6 py-4">
        <TvHeader
          onExit={() => void router.push("/")}
          lastCheckedAt={summary.lastCheckedAt}
          now={now}
          stale={stale}
          muted={muted}
          soundReady={soundReady}
          pingIntervalMs={settings.pingIntervalSec * 1000}
        />

        <div className="donut-grid shrink-0 items-center gap-6 py-2">
          <HealthDonut label="전체" counts={summary.counts} stale={stale} />
          {summary.byType.map((item) => (
            <HealthDonut
              key={item.type}
              label={item.type}
              counts={item.counts}
              stale={stale}
            />
          ))}

          {offline.length > 0 ? (
            <OutageAlert
              problems={offline}
              muted={muted}
              now={now}
            />
          ) : null}
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-hidden border-t border-line pt-3">
          {status === "loading" && rows.length === 0 ? (
            <p className="py-20 text-center text-s1 text-muted">불러오는 중…</p>
          ) : (
            <TvGrid rows={rows} />
          )}
        </div>
      </div>
    </>
  );
}

type TvHeaderProps = {
  onExit: () => void;
  lastCheckedAt: string | null;
  now: number;
  stale: boolean;
  muted: boolean;
  soundReady: boolean;
  pingIntervalMs: number;
};

function TvHeader({
  onExit,
  lastCheckedAt,
  now,
  stale,
  muted,
  soundReady,
  pingIntervalMs,
}: TvHeaderProps) {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement !== null);

    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement === null) {
      void document.documentElement.requestFullscreen?.().catch(() => undefined);
      return;
    }

    void document.exitFullscreen?.().catch(() => undefined);
  }, []);

  const handleExit = useCallback(async () => {
    if (document.fullscreenElement !== null) {
      await document.exitFullscreen?.().catch(() => undefined);
    }

    onExit();
  }, [onExit]);

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
      <div className="flex items-baseline gap-3">
        <span className="text-s1 font-bold text-body">PingCheck</span>

        <span className="font-mono text-s1 font-bold tabular-nums text-body">
          {now === 0 ? "--:--:--" : new Date(now).toLocaleTimeString("ko-KR", { hour12: false })}
        </span>

        <span className="flex flex-col">
          <span
            className={`text-bt-text-m ${stale ? "font-bold text-down-500" : "text-muted"}`}
          >
            {lastCheckedAt === null || now === 0
              ? "확인 기록 없음"
              : `마지막 점검 ${formatAgo(lastCheckedAt, now)}${stale ? " ⚠ 감시 멈춤" : ""}`}
          </span>
          <PingPulse
            lastCheckedAt={lastCheckedAt}
            now={now}
            stale={stale}
            pingIntervalMs={pingIntervalMs}
          />
        </span>

        {muted ? (
          <span className="rounded-md bg-row-hover px-2 py-0.5 text-bt-text-m font-semibold text-secondary">
            알림 꺼짐
          </span>
        ) : !soundReady ? (
          <span
            className="rounded-md bg-pending-500/20 px-2 py-0.5 text-bt-text-m font-semibold text-pending-500"
            title="브라우저가 소리를 막고 있습니다. 화면을 한 번 누르면 열립니다."
          >
            소리 잠김 · 화면을 한 번 눌러 주세요
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-bt-text-m text-muted">
          {SUMMARY_REFRESH_MS / 1000}초 갱신
        </span>
        <button type="button" onClick={toggleFullscreen} className="btn btn-ghost btn-sm">
          {fullscreen ? "전체화면 끄기" : "전체화면"}
        </button>
        <button
          type="button"
          onClick={() => void handleExit()}
          className="btn btn-ghost btn-sm"
        >
          나가기
        </button>
      </div>
    </div>
  );
}
