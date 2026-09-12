import type { BusinessDivisionId } from "@/lib/businessDivisions";

// 계정 권한입니다.
//
// admin  : 파트 관리자. 소속 파트의 서버 등록과 계정 관리를 할 수 있습니다.
//          다른 파트는 건드릴 수 없습니다.
// viewer : 일반 모니터링 계정. 보기만 합니다.
export type AccountRole = "admin" | "viewer";

export const ACCOUNT_ROLES: readonly AccountRole[] = ["admin", "viewer"];

export const ROLE_LABEL: Record<AccountRole, string> = {
  admin: "파트 관리자",
  viewer: "일반",
};

export type Account = {
  readonly id: string;
  /** 로그인에 쓰는 아이디입니다. 만든 뒤에는 바꿀 수 없습니다. */
  readonly loginId: string;
  readonly name: string;
  /** 아이디와 다릅니다. 알림을 받는 주소입니다. */
  readonly email: string;
  readonly phone: string;
  /** 소속 파트입니다. 권한이 미치는 범위가 됩니다. */
  readonly divisionId: BusinessDivisionId;
  readonly role: AccountRole;
  /** 꺼 두면 로그인할 수 없습니다. */
  readonly enabled: boolean;
  /**
   * 핑이 끊겼을 때 알림(소리 포함)을 받을지 여부입니다.
   *
   * 브라우저가 아니라 계정에 둡니다.
   * 사람 단위 설정이라 다른 PC 로 로그인해도 따라와야 하고,
   * 나중에 메일·문자 같은 다른 통로가 생겨도 같은 값을 씁니다.
   */
  readonly notifyEnabled: boolean;
  readonly createdAt: string;
};

// 본인이 고칠 수 있는 값입니다.
// 아이디 / 소속 파트 / 권한은 여기 없습니다. 관리자만 바꿀 수 있어야 합니다.
export type MyProfileInput = {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
};

export type ChangePasswordInput = {
  readonly currentPassword: string;
  readonly newPassword: string;
};

// 검색 조건입니다. 빈 문자열은 "조건 없음"으로 봅니다.
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
