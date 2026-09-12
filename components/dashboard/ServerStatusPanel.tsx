import { HealthDonut } from "@/components/dashboard/HealthDonut";
import { formatAgo } from "@/lib/dashboard/duration";
import { STALE_AFTER_MS, type DashboardSummary } from "@/lib/dashboard/types";

type ServerStatusPanelProps = {
  summary: DashboardSummary;
  loading: boolean;
  /** 매초 바뀌는 지금 시각입니다. */
  now: number;
};

// 대시보드의 서버 상태입니다.
//
// 전체 / 방화벽 / 서버 세 덩어리를 같은 크기로 나눠 가운데에 놓습니다.
// 목록처럼 있다 없다 하는 것을 옆에 두면, 문제가 없는 날에는
// 그 자리가 통째로 비어 허전해집니다. 늘 같은 모양이 유지되도록 도넛만 둡니다.
//
// 업무구분(사법·등기…)이 아니라 장비 종류로 나누는 이유:
// 계정은 자기 파트의 장비만 봅니다. 업무구분으로 나누면 한 사람 화면에는
// 한 칸만 차고 나머지는 늘 비어 있습니다. 종류는 어느 파트에나 섞여 있습니다.
export function ServerStatusPanel({
  summary,
  loading,
  now,
}: ServerStatusPanelProps) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-b2_body_r text-muted">
        불러오는 중입니다.
      </div>
    );
  }

  const { counts, byType, lastCheckedAt, todayDownCount } = summary;

  // 마지막 확인이 너무 오래됐으면 핑을 쏘는 쪽이 멈춘 것입니다.
  // 그때 화면은 마지막 상태를 그대로 보여 주기 때문에 전부 "정상" 으로 보입니다.
  const stale =
    lastCheckedAt !== null &&
    now - new Date(lastCheckedAt).getTime() > STALE_AFTER_MS;

  return (
    <div className="flex h-full min-w-0 flex-col justify-center gap-4">
      {/* 세 칸을 같은 폭으로 나눠 도넛을 고르게 벌립니다. */}
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-3">
        <HealthDonut label="전체" counts={counts} stale={stale} />
        {byType.map((item) => (
          <HealthDonut
            key={item.type}
            label={item.type}
            counts={item.counts}
            stale={stale}
          />
        ))}
      </div>

      {/* 감시가 돌고 있는지와, 지금 순간만으로는 안 보이는 값입니다. */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-line pt-3 text-bt-text-m">
        <span
          className={stale ? "font-bold text-down-500" : "text-muted"}
          title={stale ? "핑이 예정대로 돌지 않고 있습니다" : undefined}
        >
          {lastCheckedAt === null
            ? "확인 기록 없음"
            : `마지막 점검 ${formatAgo(lastCheckedAt, now)}${stale ? " ⚠" : ""}`}
        </span>

        <span className="text-line-strong">·</span>

        {/* 하루에 여러 번 끊겼다 붙는 장비는 지금 순간엔 정상이라
            위 도넛에 잡히지 않습니다. 그것을 드러내는 숫자입니다. */}
        <span
          className={
            todayDownCount > 0 ? "font-semibold text-down-500" : "text-muted"
          }
        >
          오늘 장애 {todayDownCount}건
        </span>
      </div>
    </div>
  );
}
