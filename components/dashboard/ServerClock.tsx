import { formatInZone, useServerClock } from "@/lib/useServerClock";

// 서버의 현재 시각입니다.
//
// 보는 사람 PC 의 시계가 아니라 서버 시계를 보여 줍니다.
// 장애 시각을 로그와 맞춰 보려면 기준이 서버여야 하기 때문입니다.
export function ServerClock() {
  const { status, nowMs, timeZone } = useServerClock();

  // 서버에는 시계가 흐르지 않습니다. 첫 응답을 받기 전에는 자리만 잡아 둡니다.
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
      {/* tabular-nums 가 없으면 숫자 폭이 달라 초가 바뀔 때마다 글자가 흔들립니다. */}
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
