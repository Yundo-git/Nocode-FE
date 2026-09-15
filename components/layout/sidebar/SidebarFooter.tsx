import { useMemo } from "react";
import {
  AccountMenu,
  type AccountMenuItem,
} from "@/components/layout/sidebar/AccountMenu";
import { LogoutIcon } from "@/components/ui/icons";
import { useAuth } from "@/lib/auth";

export function SidebarFooter({ open }: { open: boolean }) {
  const { account, logout } = useAuth();

  const accountMenuItems = useMemo<readonly AccountMenuItem[]>(
    () => [
      { key: "my-account", label: "내 설정", href: "/my-account" },
      { key: "logout", label: "로그아웃", onSelect: () => void logout() },
    ],
    [logout],
  );

  return (
    <div className="border-t border-line px-3 py-3">
      <div className={`flex items-center gap-2 ${open ? "" : "justify-center"}`}>
        {open && account ? (
          <AccountMenu username={account.name} items={accountMenuItems} />
        ) : null}

        <button
          type="button"
          onClick={() => void logout()}
          aria-label="로그아웃"
          title={open ? undefined : "로그아웃"}
          className="inline-flex shrink-0 items-center justify-center text-muted transition hover:text-body"
        >
          <LogoutIcon />
        </button>
      </div>

      {open ? (
        <p className="mt-2.5 text-d-label text-muted/70">© 2026 ydh</p>
      ) : null}
    </div>
  );
}
