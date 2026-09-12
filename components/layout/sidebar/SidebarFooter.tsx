import { ColorMode } from "@/components/ui/ColorMode";
import { LogoutIcon } from "@/components/ui/icons";
import { useAuth } from "@/lib/auth";

// 사이드바 맨 아래입니다. 아이디, 로그아웃, 화면 모드 선택이 들어갑니다.
export function SidebarFooter({ open }: { open: boolean }) {
  const { user, logout } = useAuth();

  return (
    <div className="border-t border-line px-3 py-3">
      {/* 아이디와 로그아웃 버튼을 같은 줄에서 가운데 맞춤으로 놓습니다. */}
      <div className={`flex items-center gap-2 ${open ? "" : "justify-center"}`}>
        {open && user ? (
          <span className="min-w-0 flex-1 truncate text-b2_body_m font-medium text-secondary">
            {user.username}
          </span>
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
