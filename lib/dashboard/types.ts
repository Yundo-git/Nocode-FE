import type { ServerType } from "@/lib/servers/types";

export type ProblemState = "offline" | "disabled";

export type ProblemServer = {
  readonly id: string;
  readonly ip: string;
  readonly nameKo: string;
  readonly state: ProblemState;
  readonly since: string | null;
};

export type StateCounts = {
  readonly online: number;
  readonly offline: number;
  readonly pending: number;
  readonly disabled: number;
  readonly total: number;
};

export type TypeSummary = {
  readonly type: ServerType;
  readonly counts: StateCounts;
};

export type DashboardSummary = {
  readonly counts: StateCounts;
  readonly byType: readonly TypeSummary[];
  readonly lastCheckedAt: string | null;
  readonly pingIntervalSec: number;
  readonly todayDownCount: number;
  readonly problems: readonly ProblemServer[];
};

export const SUMMARY_REFRESH_MS = 15_000;

export function staleAfterMs(pingIntervalSec: number): number {
  return pingIntervalSec * 1000 * 3 + SUMMARY_REFRESH_MS;
}
