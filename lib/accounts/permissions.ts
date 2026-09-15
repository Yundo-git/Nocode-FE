import type { BusinessDivisionId } from "@/lib/businessDivisions";
import type { Account } from "@/lib/accounts/types";

export function canManageServers(account: Account): boolean {
  return account.role === "superadmin" || account.role === "admin";
}

export function canManageAccounts(account: Account): boolean {
  return account.role === "superadmin" || account.role === "admin";
}

export function canChangeOwnDivision(account: Account): boolean {
  return account.role === "superadmin" || account.role === "admin";
}

function canAccessDivision(
  account: Account,
  divisionId: BusinessDivisionId,
): boolean {
  if (account.role === "superadmin") return true;

  return account.divisionId === divisionId;
}

