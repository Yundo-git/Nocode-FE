import type { BusinessDivisionId } from "@/lib/businessDivisions";

export type ServerStatus = "pending" | "up" | "down";

export type ServerType = "보안장비" | "서버";

export const SERVER_TYPES: readonly ServerType[] = ["보안장비", "서버"];

export type Server = {
  readonly id: string;
  readonly nameEn: string;
  readonly nameKo: string;
  readonly ip: string;
  readonly type: ServerType;
  readonly divisionId: BusinessDivisionId;
  readonly status: ServerStatus;
  readonly responseMs: number | null;
  readonly checkedAt: string | null;
  readonly enabled: boolean;
};

export type ServerDisplayState = "online" | "offline" | "pending" | "disabled";

export function getDisplayState(server: Server): ServerDisplayState {
  if (!server.enabled) return "disabled";
  if (server.status === "up") return "online";
  if (server.status === "down") return "offline";

  return "pending";
}

export const DISPLAY_STATE_LABEL: Record<ServerDisplayState, string> = {
  online: "정상",
  offline: "비정상",
  pending: "확인 중",
  disabled: "미연결",
};

export type NewServerInput = {
  readonly ip: string;
  readonly type: ServerType;
  readonly divisionId: BusinessDivisionId;
  readonly nameEn: string;
  readonly nameKo: string;
  readonly enabled: boolean;
};

export type AddServerResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "duplicate-ip" | "request-failed" };

export type ServerFilterValues = {
  readonly keyword: string;
  readonly type: ServerType | "";
  readonly divisionId: BusinessDivisionId | "";
  readonly status: ServerDisplayState | "";
  readonly from: string;
  readonly to: string;
};

export const EMPTY_FILTERS: ServerFilterValues = {
  keyword: "",
  type: "",
  divisionId: "",
  status: "",
  from: "",
  to: "",
};

export type ImportResult = {
  readonly added: number;
  readonly failed: readonly { line: number; message: string }[];
};
