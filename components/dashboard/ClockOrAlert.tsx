import { OutageAlert } from "@/components/dashboard/OutageAlert";
import { ServerClock } from "@/components/dashboard/ServerClock";
import type { ProblemServer } from "@/lib/dashboard/types";

type ClockOrAlertProps = {
  /** 손봐야 할 장비입니다. 비정상이 있을 때만 알림으로 바뀝니다. */
  problems: readonly ProblemServer[];
  /** 내 알림을 꺼 뒀으면 깜빡임을 멈춥니다. (사람마다 다릅니다) */
  muted: boolean;
  now: number;
};

// 평소에는 서버 시계, 비정상이 있으면 알림을 보여 줍니다.
//
// 장애 대응 중에 가장 안 중요한 정보가 시계라서 이 자리를 씁니다.
// 미연결(감시를 꺼 둔 것)은 사람이 일부러 끈 것이라 알리지 않습니다.
export function ClockOrAlert({ problems, muted, now }: ClockOrAlertProps) {
  const offline = problems.filter((problem) => problem.state === "offline");

  if (offline.length === 0) {
    return <ServerClock />;
  }

  return <OutageAlert problems={offline} muted={muted} now={now} />;
}
