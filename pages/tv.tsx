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

// 관제실 벽 화면입니다.
//
// ★ 사이드바도 머리말도 없습니다. (_app.tsx 의 isBareRoute)
//   벽에 띄워 두고 아무도 손대지 않는 화면이라, 누를 것이 없어야 합니다.
//   주소를 그대로 즐겨찾기에 넣어 두면 켤 때마다 이 화면이 뜹니다.
//
// ★ 위에 도넛 셋, 그 아래로 장비 상자들입니다.
//   도넛은 "전체가 어떤가", 상자는 "어느 것이 문제인가" 입니다.
export default function TvPage() {
  const router = useRouter();

  // ★ 벽 화면에서도 삑 소리가 나야 합니다.
  //   알림은 사이드바에 붙어 있는데 TV모드에는 사이드바가 없습니다.
  //   여기서 따로 불러 줘야 소리가 납니다. 정작 소리가 가장 필요한 곳입니다.
  //   내 알림을 꺼 뒀는지(muted)도 이 훅이 알려 줍니다.
  const { muted, soundReady } = useNotifications();
  const { summary, status } = useDashboardSummary();
  const { rows } = useTvServers();
  const { settings } = useSettings();
  const now = useNow();

  // 마지막 확인이 너무 오래됐으면 핑을 쏘는 쪽이 멈춘 것입니다.
  // 그때 화면은 마지막 상태를 그대로 보여 주어 전부 "정상" 으로 보입니다.
  // 벽 화면에서는 이걸 놓치는 것이 가장 위험합니다. 크게 띄웁니다.
  const stale =
    summary.lastCheckedAt !== null &&
    now - new Date(summary.lastCheckedAt).getTime() > staleAfterMs(settings.pingIntervalSec);

  // ★ 미연결(감시를 꺼 둔 장비)은 알리지 않습니다. 사람이 일부러 끈 것입니다.
  //   problems 에는 비정상이 앞, 미연결이 뒤로 섞여 옵니다.
  //   (대시보드 ClockOrAlert 와 같은 규칙입니다)
  const offline = summary.problems.filter((problem) => problem.state === "offline");

  return (
    <>
      <Head>
        <title>TV모드 | PingCheck</title>
      </Head>

      {/* 화면 전체를 씁니다. 아래 목록만 넘칠 때 스크롤됩니다. */}
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

        {/* 위: 도넛 셋, 그리고 장애가 나면 그 오른쪽에 한 칸이 더 생깁니다.
            ★ 대시보드의 "현재시간" 자리에 뜨는 것과 **같은 화면**입니다.
              (OutageAlert — 깜빡임, IP 번갈아 표시, 확인 버튼까지 그대로)
              두 화면에서 장애가 다르게 보이면, 벽 화면을 보다가 자리로
              돌아온 사람이 같은 장애인지 아닌지부터 따져야 합니다.

            ★ 도넛 옆인 이유: 눈이 이미 머무는 줄입니다.
              "몇 대가 정상인가" 를 보는 그 자리에서 "무엇이 죽었나" 까지
              한 번에 읽힙니다. 장애가 없으면 칸 자체가 없어 도넛이 넓게 퍼집니다. */}
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

        {/* 아래: 장비 상자들.
            ★ 스크롤하지 않습니다. 벽에 붙은 화면은 아무도 안 굴립니다.
              다 안 들어가면 15초마다 다음 묶음으로 넘어갑니다. (TvGrid)
              비정상이 맨 앞이라, 넘겨도 문제가 있는 것은 첫 묶음에 있습니다. */}
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
  /** 내 소리를 꺼 뒀는지입니다. 벽 화면에도 그 사실을 적어 둡니다. */
  muted: boolean;
  /** 브라우저가 소리를 열어 줬는지입니다. 아직이면 안내가 필요합니다. */
  soundReady: boolean;
  /** 박동 선이 차오르는 속도입니다. 서버가 알려 준 핑 주기입니다. */
  pingIntervalMs: number;
};

// 맨 윗줄입니다. 벽 화면이라 글자를 크게 둡니다.
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

  // 브라우저가 전체화면을 벗어났는지 알려 줍니다. (Esc 로 나갈 수 있습니다)
  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement !== null);

    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = useCallback(() => {
    // 지원하지 않는 브라우저에서도 화면은 그대로 돕니다. 버튼만 듣지 않습니다.
    if (document.fullscreenElement === null) {
      void document.documentElement.requestFullscreen?.().catch(() => undefined);
      return;
    }

    void document.exitFullscreen?.().catch(() => undefined);
  }, []);

  /**
   * TV모드에서 나갑니다.
   *
   * ★ 전체화면을 **먼저 풉니다.**
   *   전체화면은 화면 하나가 아니라 브라우저 전체에 걸리는 상태입니다.
   *   그대로 두고 나가면 대시보드가 전체화면인 채로 뜨고, 사이드바도
   *   주소창도 없어서 사람은 빠져나갈 길을 못 찾습니다.
   */
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

        {/* 지금 몇 시인지입니다. 벽 화면에서 자주 보게 되는 값입니다.
            now 는 화면에 붙은 뒤에야 채워집니다. (lib/useNow.ts)
            0 을 그대로 그리면 9시 정각이 한 번 번쩍였다 사라집니다. */}
        <span className="font-mono text-s1 font-bold tabular-nums text-body">
          {now === 0 ? "--:--:--" : new Date(now).toLocaleTimeString("ko-KR", { hour12: false })}
        </span>

        {/* 마지막 점검과 박동 선입니다.
            ★ 글자만 두면 "3분 전 ⚠" 이 뜰 때까지 3분을 기다려야 압니다.
              선은 핑 주기에 맞춰 차오르다 리셋되기를 되풀이하다가,
              감시가 죽으면 **가득 찬 채 멈춥니다.** 몇 초 만에 눈치챕니다. */}
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

        {/* 소리를 꺼 뒀으면 그 사실을 적어 둡니다.
            모르면 "조용하니 괜찮구나" 로 읽습니다. */}
        {muted ? (
          <span className="rounded-md bg-row-hover px-2 py-0.5 text-bt-text-m font-semibold text-secondary">
            알림 꺼짐
          </span>
        ) : !soundReady ? (
          // ★ 브라우저는 사람이 한 번 누르기 전에는 소리를 막습니다.
          //   벽에 띄워 두고 아무도 안 누르면 **장애가 나도 조용합니다.**
          //   띄워 놓은 사람이 떠나기 전에 알아채야 합니다.
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
