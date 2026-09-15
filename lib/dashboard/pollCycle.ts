
// ★ 핑 한 바퀴가 도는 데 걸리는 시간만큼 여유를 둡니다.
//   checked_at 은 바퀴가 **끝날 때** 찍힙니다. 장비가 많아 바퀴가 길어지면
//   (5,000대면 약 2.6초) 800ms 로는 모자라, 아직 안 바뀐 값을 보고
//   3초 바닥으로 떨어져 쉴 새 없이 물어보게 됩니다.
const GRACE_MS = 3_500;

const MIN_MS = 3_000;

export function nextPollDelay(
  lastCheckedAt: string | null,
  pingIntervalSec: number,
  now: number = Date.now(),
): number {
  const intervalMs = Math.max(1, pingIntervalSec) * 1000;

  if (lastCheckedAt === null) return intervalMs;

  const due = new Date(lastCheckedAt).getTime() + intervalMs + GRACE_MS;

  if (Number.isNaN(due)) return intervalMs;

  return Math.min(intervalMs, Math.max(MIN_MS, due - now));
}
