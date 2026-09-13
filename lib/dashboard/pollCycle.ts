// 다시 받아 올 시각을 핑 주기에 맞춥니다.
//
// ★ 왜 그냥 15초마다 받으면 안 되는가
//   핑은 0·15·30초에 돌고, 화면은 제 나름의 15초(예: 7·22·37초)에 받습니다.
//   두 박자가 맞물리지 않아서 "마지막 점검 7초 전" 이 18초, 22초까지
//   올라갔다가 뚝 떨어집니다. 게이지도 다 찬 채로 한참 서 있다가 리셋됩니다.
//   사람 눈에는 **감시가 불규칙하게 도는 것처럼** 보입니다. 실제로는 정확한데.
//
//   서버가 알려 준 마지막 점검 시각에 주기를 더하면 다음 핑이 도는 시각입니다.
//   거기에 맞춰 받아 오면 게이지가 0에서 차올라 꽉 찰 때 갱신됩니다.
//   삑 소리도 그 박자에 맞습니다.

/**
 * 결과가 DB 에 쓰이고 나서 받아 오기까지의 여유입니다.
 *
 * ★ 짧아야 합니다. 이 시간만큼 **게이지 리셋과 삑 소리가 늦습니다.**
 *   2초로 뒀더니 게이지가 꽉 찬 채로 2초를 서 있다가 리셋됐습니다.
 *
 * ★ 그렇다고 0 이면 안 됩니다. 아직 안 쓰인 값을 읽을 수 있습니다.
 *   너무 일찍 읽어도 스스로 고칩니다 — 지난 시각이 그대로 오면
 *   계산값이 과거가 되어 MIN_MS 뒤에 다시 두드리고 박자를 되찾습니다.
 *
 * ※ 핑을 쏘고 답을 기다리는 시간(기본 2초)은 여기에 넣지 않습니다.
 *   checked_at 은 **답을 다 받은 뒤** 찍히고, 다음 주기도 그만큼 뒤에
 *   찍히므로 두 시각의 간격은 정확히 주기입니다.
 */
const GRACE_MS = 800;

/** 너무 자주 두드리지 않게 둡니다. 감시가 멈췄을 때의 하한입니다. */
const MIN_MS = 3_000;

/**
 * 다음에 받아 올 때까지 기다릴 시간(ms)입니다.
 *
 * 감시가 멈춰 lastCheckedAt 이 제자리면 계산값이 과거가 됩니다.
 * 그때는 MIN_MS 마다 두드립니다 — 살아나는 것을 빨리 알아채는 편이 낫습니다.
 */
export function nextPollDelay(
  lastCheckedAt: string | null,
  pingIntervalSec: number,
  now: number = Date.now(),
): number {
  const intervalMs = Math.max(1, pingIntervalSec) * 1000;

  // 아직 한 번도 확인한 적이 없으면 주기만큼 기다립니다.
  if (lastCheckedAt === null) return intervalMs;

  const due = new Date(lastCheckedAt).getTime() + intervalMs + GRACE_MS;

  if (Number.isNaN(due)) return intervalMs;

  // 주기보다 더 오래 기다리지는 않습니다.
  return Math.min(intervalMs, Math.max(MIN_MS, due - now));
}
