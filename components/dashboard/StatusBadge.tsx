import type { ServerStatus } from "@/lib/monitoring/types";

// 상태별 배지 색상입니다.
// Tailwind 가 사용 중인 클래스를 찾아내야 하므로 클래스 이름을 통째로 적습니다.
const BADGE_CLASS: Record<ServerStatus, string> = {
  up: "badge badge-up",
  warning: "badge badge-warning",
  down: "badge badge-down",
  unknown: "badge badge-unknown",
};

const BADGE_LABEL: Record<ServerStatus, string> = {
  up: "UP",
  warning: "WARNING",
  down: "DOWN",
  unknown: "UNKNOWN",
};

// 서버 상태를 색상 배지로 보여 줍니다.
export function StatusBadge({ status }: { status: ServerStatus }) {
  return (
    <span className={BADGE_CLASS[status]}>
      <span className="status-dot" />
      {BADGE_LABEL[status]}
    </span>
  );
}
