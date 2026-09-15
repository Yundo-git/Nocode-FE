import type { BusinessDivisionId } from "@/lib/businessDivisions";

export type AccountRole = "superadmin" | "admin" | "viewer";

export const ACCOUNT_ROLES: readonly AccountRole[] = ["admin", "viewer"];

export const ROLE_LABEL: Record<AccountRole, string> = {
  superadmin: "총괄 관리자",
  admin: "파트 관리자",
  viewer: "일반",
};

export type Account = {
  readonly id: string;
  readonly loginId: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly divisionId: BusinessDivisionId;
  readonly role: AccountRole;
  readonly enabled: boolean;
  readonly notifyEnabled: boolean;
  readonly sessionTtlMinutes: number | null;
  readonly createdAt: string;
};

export type MyProfileInput = {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
};

export type AdminAccountInput = {
  readonly loginId: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly divisionId: BusinessDivisionId;
  readonly role: AccountRole;
};

export type AccountWriteResult =
  | { readonly ok: true; readonly account: Account }
  | { readonly ok: false; readonly reason: "duplicate-login-id" | "not-found" };

export type AccountFilterValues = {
  readonly keyword: string;
  readonly divisionId: BusinessDivisionId | "";
  readonly role: AccountRole | "";
  readonly enabled: "" | "on" | "off";
};

export const EMPTY_ACCOUNT_FILTERS: AccountFilterValues = {
  keyword: "",
  divisionId: "",
  role: "",
  enabled: "",
};
