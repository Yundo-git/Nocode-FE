import type { BusinessDivisionId } from "@/lib/businessDivisions";

export type LogType =
  | "down"
  | "up"
  | "registered";

export const LOG_TYPES: readonly LogType[] = [
  "down",
  "up",
  "registered",
];

export const LOG_TYPE_LABEL: Record<LogType, string> = {
  down: "비정상 전환",
  up: "정상 복구",
  registered: "서버 등록",
};

export type LogEntry = {
  readonly id: string;
  readonly serverId: string;
  readonly serverIp: string;
  readonly serverNameKo: string;
  readonly serverNameEn: string;
  readonly serverType: string;
  readonly divisionId: BusinessDivisionId;
  readonly type: LogType;
  readonly detail: string;
  readonly occurredAt: string;
};

export type LogQuery = {
  readonly page: number;
  readonly pageSize: number;
  readonly from: string;
  readonly to: string;
  readonly serverId: string;
  readonly keyword: string;
  readonly type: LogType | "";
  readonly divisionId: BusinessDivisionId | "";
};

export const EMPTY_LOG_QUERY: LogQuery = {
  page: 1,
  pageSize: 50,
  from: "",
  to: "",
  serverId: "",
  keyword: "",
  type: "",
  divisionId: "",
};

export type LogPage = {
  readonly rows: readonly LogEntry[];
  readonly totalCount: number;
};
