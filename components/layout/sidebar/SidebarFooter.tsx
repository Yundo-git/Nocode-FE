import { useMemo } from "react";
import {
  AccountMenu,
  type AccountMenuItem,
} from "@/components/layout/sidebar/AccountMenu";
import { ColorMode } from "@/components/ui/ColorMode";
import { LogoutIcon } from "@/components/ui/icons";
import { useAuth } from "@/lib/auth";

// 사이드바 맨 아래입니다. 계정명, 로그아웃, 화면 모드 선택이 들어갑니다.
export function SidebarFooter({ open }: { open: boolean }) {
  const { user, logout } = useAuth();

  // logout 은 auth.tsx 에서 useCallback 으로 고정해 둔 함수라
  // 이 배열도 로그인 상태가 바뀌기 전까지 그대로 유지됩니다.
  const accountMenuItems = useMemo<readonly AccountMenuItem[]>(
    () => [
      // 사이드바 메뉴의 "계정관리"(/accounts)는 전체 계정을 다루는 화면이고,
      // 여기는 로그인한 본인 계정만 다루는 화면이라 주소를 나눠 두었습니다.
      { key: "my-account", label: "내 설정", href: "/my-account" },
      { key: "logout", label: "로그아웃", onSelect: logout },
    ],
    [logout],
  );

  return (
    <div className="border-t border-line px-3 py-3">
      {/* 계정명과 로그아웃 버튼을 같은 줄에서 가운데 맞춤으로 놓습니다. */}
      <div className={`flex items-center gap-2 ${open ? "" : "justify-center"}`}>
        {open && user ? (
          <AccountMenu username={user.username} items={accountMenuItems} />
        ) : null}

        <button
          type="button"
          onClick={logout}
          aria-label="로그아웃"
          title={open ? undefined : "로그아웃"}
          className="inline-flex shrink-0 items-center justify-center text-muted transition hover:text-body"
        >
          <LogoutIcon />
        </button>
      </div>

      {/* 화면 모드 선택 상자는 접었을 때 들어갈 자리가 없어 숨깁니다. */}
      {open ? (
        <div className="mt-2">
          <ColorMode />
        </div>
      ) : null}
    </div>
  );
}
