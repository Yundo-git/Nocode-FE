type PingPulseProps = {
  lastCheckedAt: string | null;
  now: number;
  stale: boolean;
  pingIntervalMs: number;
};

export function PingPulse({
  lastCheckedAt,
  now,
  stale,
  pingIntervalMs,
}: PingPulseProps) {
  if (lastCheckedAt === null) {
    return null;
  }

  const elapsed = now - new Date(lastCheckedAt).getTime();
  const ratio = Math.min(1, Math.max(0, elapsed / pingIntervalMs));

  return (
    <div
      className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-line"
      role="img"
      aria-label={
        stale ? "감시가 멈춘 것으로 보입니다" : "핑이 정상적으로 돌고 있습니다"
      }
    >
      <div
        className={`h-full transition-[width] duration-1000 ease-linear ${
          stale ? "bg-down-500" : "bg-up-500"
        }`}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
