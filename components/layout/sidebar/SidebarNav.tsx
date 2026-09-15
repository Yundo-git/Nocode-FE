import Link from "next/link";
import { useRouter } from "next/router";
import { memo } from "react";
import {
  isNavItemActive,
  visibleNavItems,
  type NavItem,
} from "@/components/layout/sidebar/navItems";
import { useAuth } from "@/lib/auth";
import { NoteTree } from "@/components/layout/sidebar/NoteTree";

type SidebarNavItemProps = {
  item: NavItem;
  open: boolean;
  active: boolean;
};

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

type SidebarNavProps = {
  open: boolean;
  onRequestOpen: () => void;
  onNotice: (message: string) => void;
};

export function SidebarNav({ open, onRequestOpen, onNotice }: SidebarNavProps) {
  const { pathname } = useRouter();
  const { account } = useAuth();

  const items = visibleNavItems(account);

  return (
    <nav
      aria-label="주요 메뉴"
      className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 py-2"
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

      <NoteTree open={open} onRequestOpen={onRequestOpen} onNotice={onNotice} />
    </nav>
  );
}
