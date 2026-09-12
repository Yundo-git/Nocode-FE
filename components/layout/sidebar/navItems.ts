import type { ComponentType, SVGProps } from "react";
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
};

// 모듈을 읽을 때 딱 한 번만 만들어집니다.
// 화면이 다시 그려져도 같은 배열/같은 아이콘을 그대로 쓰기 때문에
// 메뉴가 쓸데없이 다시 그려지지 않습니다.
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "대시보드", Icon: DashboardIcon },
  { href: "/servers", label: "서버관리", Icon: ServerIcon },
  { href: "/accounts", label: "계정관리", Icon: UserIcon },
  { href: "/logs", label: "로그조회", Icon: LogIcon },
] as const;

// 지금 보고 있는 화면이 이 메뉴인지 판단합니다.
// "/" 는 정확히 같을 때만, 나머지는 하위 주소(/servers/1)까지 켜진 것으로 봅니다.
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
