import type { ComponentType, SVGProps } from "react";
import type { Account } from "@/lib/accounts/types";
import {
  canManageAccounts,
  canManageServers,
} from "@/lib/accounts/permissions";
import {
  DashboardIcon,
  HistoryIcon,
  LogIcon,
  ServerIcon,
  UserIcon,
} from "@/components/ui/icons";

export type NavItem = {
  readonly href: string;
  readonly label: string;
  readonly Icon: ComponentType<SVGProps<SVGSVGElement>>;
  readonly canSee?: (account: Account) => boolean;
};

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "대시보드", Icon: DashboardIcon },
  { href: "/servers", label: "서버관리", Icon: ServerIcon, canSee: canManageServers },
  { href: "/accounts", label: "계정관리", Icon: UserIcon, canSee: canManageAccounts },
  { href: "/logs", label: "로그조회", Icon: LogIcon },
  { href: "/audit", label: "작업이력", Icon: HistoryIcon, canSee: canManageAccounts },
] as const;

export function visibleNavItems(account: Account | null): readonly NavItem[] {
  if (account === null) return [];

  return NAV_ITEMS.filter((item) => item.canSee?.(account) ?? true);
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
