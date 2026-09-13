import { EXPECTED_PING_INTERVAL_MS } from "@/lib/dashboard/types";

type PingPulseProps = {
  /** 마지막으로 장비를 확인한 시각입니다. */
  lastCheckedAt: string | null;
  now: number;
  stale: boolean;
};

// 핑이 돌고 있다는 것을 보여 주는 가는 선입니다.
//
// 마지막 점검부터 흐른 시간을 핑 주기로 나눠 채웁니다.
// 핑이 제때 돌면 차오르다가 리셋되기를 되풀이합니다. 심장박동처럼 보입니다.
//
// **선이 가득 찬 채 멈춰 있으면 감시가 죽은 것입니다.**
// 글자로 된 "3분 전 ⚠" 은 3분을 기다려야 알지만, 이 선은 몇 초 만에 눈치챕니다.
//
// 이 화면에서 상시 움직여도 되는 유일한 요소입니다.
// 다른 곳의 움직임은 "무언가 바뀌었을 때" 에만 일어납니다.
export function PingPulse({ lastCheckedAt, now, stale }: PingPulseProps) {
  if (lastCheckedAt === null) {
    return null;
  }

  const elapsed = now - new Date(lastCheckedAt).getTime();
  // 주기를 넘기면 100% 에서 멈춥니다. 넘쳐 흐르게 두면 뜻이 흐려집니다.
  const ratio = Math.min(1, Math.max(0, elapsed / EXPECTED_PING_INTERVAL_MS));

  return (
    <div
      className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-line"
      role="img"
      aria-label={
        stale ? "감시가 멈춘 것으로 보입니다" : "핑이 정상적으로 돌고 있습니다"
      }
    >
      <div
        // 리셋될 때 뒤로 미끄러지면 어색해서, 채워질 때만 부드럽게 움직입니다.
        className={`h-full transition-[width] duration-1000 ease-linear ${
          stale ? "bg-down-500" : "bg-up-500"
        }`}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
