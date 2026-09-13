import type { ComponentType, SVGProps } from "react";
import type { Account } from "@/lib/accounts/types";
import {
  canManageAccounts,
  canManageServers,
} from "@/lib/accounts/permissions";
import {
  DashboardIcon,
  LogIcon,
  ServerIcon,
  UserIcon,
} from "@/components/ui/icons";

// 사이드바 메뉴 한 칸의 생김새입니다.
export type NavItem = {
  /** 눌렀을 때 이동할 주소입니다. */
  readonly href: string;
  /** 사이드바에 보이는 이름입니다. */
  readonly label: string;
  /** 이름 왼쪽에 붙는 아이콘입니다. */
  readonly Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /**
   * 이 메뉴를 볼 수 있는지 판단합니다. 없으면 누구나 볼 수 있습니다.
   *
   * ★ 메뉴를 감추는 것은 **화면 정리**입니다. 보안이 아닙니다.
   *   주소를 직접 치면 들어갈 수 있고, 실제 차단은 API 가 합니다.
   *   그래도 감춥니다 — 눌러 봐야 아무것도 못 하는 메뉴를 보여 주면
   *   "왜 안 되지" 하고 헤매게 되기 때문입니다.
   */
  readonly canSee?: (account: Account) => boolean;
};

// 모듈을 읽을 때 딱 한 번만 만들어집니다.
// 화면이 다시 그려져도 같은 배열/같은 아이콘을 그대로 쓰기 때문에
// 메뉴가 쓸데없이 다시 그려지지 않습니다.
const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "대시보드", Icon: DashboardIcon },
  // 일반(viewer) 계정에는 보이지 않습니다. 보기만 하는 계정이라
  // 들어가 봐야 등록·수정 버튼이 전부 막혀 있습니다.
  { href: "/servers", label: "서버관리", Icon: ServerIcon, canSee: canManageServers },
  { href: "/accounts", label: "계정관리", Icon: UserIcon, canSee: canManageAccounts },
  { href: "/logs", label: "로그조회", Icon: LogIcon },
] as const;

/** 이 계정이 볼 수 있는 메뉴만 남깁니다. */
export function visibleNavItems(account: Account | null): readonly NavItem[] {
  if (account === null) return [];

  return NAV_ITEMS.filter((item) => item.canSee?.(account) ?? true);
}

// 지금 보고 있는 화면이 이 메뉴인지 판단합니다.
// "/" 는 정확히 같을 때만, 나머지는 하위 주소(/servers/1)까지 켜진 것으로 봅니다.
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
