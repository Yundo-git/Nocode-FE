import { OutageAlert } from "@/components/dashboard/OutageAlert";
import { ServerClock } from "@/components/dashboard/ServerClock";
import type { ProblemServer } from "@/lib/dashboard/types";

type ClockOrAlertProps = {
  problems: readonly ProblemServer[];
  muted: boolean;
  now: number;
};

export function ClockOrAlert({ problems, muted, now }: ClockOrAlertProps) {
  const offline = problems.filter((problem) => problem.state === "offline");

  if (offline.length === 0) {
    return <ServerClock />;
  }

  return <OutageAlert problems={offline} muted={muted} now={now} />;
}
