import { ColorMode } from "@/components/ui/ColorMode";
import { useAuth } from "@/lib/auth";

// 사이드바 영역입니다.
// 메뉴 구성(메뉴 이름, 아이콘 등)은 다음 단계에서 정하기로 했으므로
// 위쪽은 영역만 확보해 두고, 최하단에만 화면 모드 선택 상자를 놓았습니다.
export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden h-full flex-col border-r border-line bg-panel-2 md:flex">
      <div className="px-4 py-3">
        <span className="text-d-label font-bold uppercase text-muted">
          모니터링 상태 확인 서버
        </span>
      </div>

      {/* 메뉴가 들어갈 자리입니다. 남는 공간을 모두 차지해서
          아래 영역을 사이드바 맨 밑으로 밀어 줍니다. */}
      <div className="min-h-0 flex-1" />

      {/* 최하단 영역 */}
      <div className="space-y-2 border-t border-line px-3 py-3">
        {user ? (
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-b2_body_m font-medium text-secondary">
              {user.username}
            </span>
            <button
              type="button"
              onClick={logout}
              className="btn btn-ghost btn-sm shrink-0"
            >
              로그아웃
            </button>
          </div>
        ) : null}

        <ColorMode />
      </div>
    </aside>
  );
}
