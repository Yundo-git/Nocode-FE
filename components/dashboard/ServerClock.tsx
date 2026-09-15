import { formatInZone, useServerClock } from "@/lib/useServerClock";

export function ServerClock() {
  const { status, nowMs, timeZone } = useServerClock();

  if (status === "loading" || nowMs === null) {
    return (
      <Frame>
        <p className="text-b2_body_r text-muted">시각을 맞추는 중입니다.</p>
      </Frame>
    );
  }

  if (status === "error") {
    return (
      <Frame>
        <p className="text-b2_body_r text-down-500">
          서버 시각을 불러오지 못했습니다.
        </p>
      </Frame>
    );
  }

  const { date, time } = formatInZone(nowMs, timeZone);

  return (
    <Frame>
      <p className="text-h3 font-bold tabular-nums text-body">{time}</p>
      <p className="mt-1 text-b2_body_r tabular-nums text-secondary">{date}</p>
      <p className="mt-2 text-bt-text-s text-muted">서버 기준 · {timeZone}</p>
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      {children}
    </div>
  );
}
