import type { BusinessDivisionId } from "@/lib/businessDivisions";
import type { Account } from "@/lib/accounts/types";

// 권한 판단을 한 곳에 모읍니다.
// 화면마다 role === "admin" 을 직접 비교하면, 나중에 권한이 늘어날 때
// 고쳐야 할 곳을 찾기 어렵습니다.
//
// 백엔드가 붙어도 이 함수들은 그대로 씁니다.
// 다만 화면에서 버튼을 숨기는 것은 편의일 뿐이고,
// 실제 차단은 API 가 다시 판단해야 합니다.

// ★ 관제도 권한은 다른 파트와 똑같습니다. 자기 파트만 관리합니다.
//   관제가 다른 점은 **보는 범위**뿐이고, 그건 서버가 정합니다.
//   (pingcheck-be 의 watchScope) 화면에서 가릴 것이 없습니다.

// 서버를 등록·수정할 수 있는가. (자기 파트만)
export function canManageServers(account: Account): boolean {
  return account.role === "superadmin" || account.role === "admin";
}

// 계정을 만들고 고칠 수 있는가. (자기 파트만)
export function canManageAccounts(account: Account): boolean {
  return account.role === "superadmin" || account.role === "admin";
}

// 이 업무구분(파트)을 다룰 수 있는가.
//
// 관리자도 소속 파트만 다룹니다. 일반 계정도 소속 파트만 봅니다.
// 전체를 볼 수 있는 최고 관리자가 필요해지면 여기에 역할을 하나 더 두면 됩니다.
/**
 * 자기 소속 파트를 스스로 바꿀 수 있는가.
 *
 * ★ 자기가 볼 수 있는 범위를 스스로 옮기는 일입니다.
 *   관리자에게 파트 경계는 "막는 벽" 이 아니라 "지금 보고 있는 창" 이 됩니다.
 *   일반 계정은 바꿀 수 없습니다.
 *
 */
export function canChangeOwnDivision(account: Account): boolean {
  return account.role === "superadmin" || account.role === "admin";
}

function canAccessDivision(
  account: Account,
  divisionId: BusinessDivisionId,
): boolean {
  // 총괄은 모든 파트를 봅니다.
  if (account.role === "superadmin") return true;

  return account.divisionId === divisionId;
}

