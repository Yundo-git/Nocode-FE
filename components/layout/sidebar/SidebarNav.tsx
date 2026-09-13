import Link from "next/link";
import { useRouter } from "next/router";
import { memo } from "react";
import {
  isNavItemActive,
  visibleNavItems,
  type NavItem,
} from "@/components/layout/sidebar/navItems";
import { useAuth } from "@/lib/auth";

type SidebarNavItemProps = {
  item: NavItem;
  open: boolean;
  active: boolean;
};

// 메뉴 한 칸입니다.
// props 가 모두 값(문자열/참거짓)이거나 고정된 아이콘이라
// memo 로 감싸면 테마나 로그인 상태가 바뀔 때 다시 그리지 않습니다.
const SidebarNavItem = memo(function SidebarNavItem({
  item,
  open,
  active,
}: SidebarNavItemProps) {
  const { href, label, Icon } = item;

  return (
    <li>
      <Link
        href={href}
        // 접었을 때는 이름이 안 보이니 마우스를 올리면 이름이 뜨게 합니다.
        title={open ? undefined : label}
        aria-current={active ? "page" : undefined}
        className={[
          "flex items-center rounded-[var(--radius-md)] py-2 transition",
          open ? "gap-2.5 px-3" : "justify-center px-0",
          active
            ? "bg-primary-600 text-white"
            : "text-secondary hover:bg-row-hover hover:text-body",
        ].join(" ")}
      >
        <Icon width={18} height={18} className="shrink-0" />
        {open ? (
          <span className="truncate text-b2_body_m font-medium">{label}</span>
        ) : null}
      </Link>
    </li>
  );
});

// 사이드바 메뉴 목록입니다.
// flex-1 로 남는 공간을 모두 차지해서 아래 영역을 맨 밑으로 밀어 줍니다.
export function SidebarNav({ open }: { open: boolean }) {
  // pathname 은 주소가 바뀔 때만 값이 달라집니다.
  const { pathname } = useRouter();
  const { account } = useAuth();

  // 권한이 없는 메뉴는 아예 그리지 않습니다.
  const items = visibleNavItems(account);

  return (
    <nav
      aria-label="주요 메뉴"
      className="min-h-0 flex-1 overflow-y-auto px-2 py-2"
    >
      <ul className="space-y-1">
        {items.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            open={open}
            active={isNavItemActive(pathname, item.href)}
          />
        ))}
      </ul>
    </nav>
  );
}
