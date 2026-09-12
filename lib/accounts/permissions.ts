import type { BusinessDivisionId } from "@/lib/businessDivisions";
import type { Account } from "@/lib/accounts/types";

// 권한 판단을 한 곳에 모읍니다.
// 화면마다 role === "admin" 을 직접 비교하면, 나중에 권한이 늘어날 때
// 고쳐야 할 곳을 찾기 어렵습니다.
//
// 백엔드가 붙어도 이 함수들은 그대로 씁니다.
// 다만 화면에서 버튼을 숨기는 것은 편의일 뿐이고,
// 실제 차단은 API 가 다시 판단해야 합니다.

// 서버를 등록·수정할 수 있는가.
export function canManageServers(account: Account): boolean {
  return account.role === "admin";
}

// 계정을 만들고 고칠 수 있는가.
export function canManageAccounts(account: Account): boolean {
  return account.role === "admin";
}

// 이 업무구분(파트)을 다룰 수 있는가.
//
// 관리자도 소속 파트만 다룹니다. 일반 계정도 소속 파트만 봅니다.
// 전체를 볼 수 있는 최고 관리자가 필요해지면 여기에 역할을 하나 더 두면 됩니다.
export function canAccessDivision(
  account: Account,
  divisionId: BusinessDivisionId,
): boolean {
  return account.divisionId === divisionId;
}

// 목록에서 이 계정이 볼 수 있는 것만 남깁니다.
export function filterByDivision<T extends { divisionId: BusinessDivisionId }>(
  account: Account,
  items: readonly T[],
): readonly T[] {
  return items.filter((item) => canAccessDivision(account, item.divisionId));
}
