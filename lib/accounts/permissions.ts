import type { BusinessDivisionId } from "@/lib/businessDivisions";
import type { Account } from "@/lib/accounts/types";

// 권한 판단을 한 곳에 모읍니다.
// 화면마다 role === "admin" 을 직접 비교하면, 나중에 권한이 늘어날 때
// 고쳐야 할 곳을 찾기 어렵습니다.
//
// 백엔드가 붙어도 이 함수들은 그대로 씁니다.
// 다만 화면에서 버튼을 숨기는 것은 편의일 뿐이고,
// 실제 차단은 API 가 다시 판단해야 합니다.

/**
 * 관제 자리인가.
 *
 * ★ 관제는 **보는 범위만** 넓습니다. 권한은 다른 파트와 똑같습니다.
 *   사법·등기·가족은 각자 자기 장비를 지키고, 관제는 그 전체를 지켜봅니다.
 *   그래서 대시보드·TV·로그조회·알림함에는 네 파트가 합쳐 나옵니다.
 *
 * ★ 관리는 자기 파트(관제)만 입니다.
 *   관제에도 자체 장비와 계정이 있고, 그건 관제 관리자가 다룹니다.
 *   남의 파트 장비를 대신 고치지는 않습니다.
 *
 * ※ 총괄(superadmin)은 어느 파트에 두든 전부 보고 전부 다룹니다.
 */
export function isControlDesk(account: Account): boolean {
  return account.divisionId === "control" && account.role !== "superadmin";
}

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

