import { ColorMode } from "@/components/ui/ColorMode";
import { LogoutIcon, TabCloseIcon, TabOpenIcon } from "@/components/ui/icons";
import { useAuth } from "@/lib/auth";

type SidebarProps = {
  open: boolean;
  onToggle: () => void;
};

// 사이드바 영역입니다.
// 메뉴 구성(메뉴 이름, 아이콘 등)은 다음 단계에서 정하기로 했으므로
// 가운데는 아직 빈 자리로 두었습니다.
//
// 접으면 아이콘 하나 너비(3rem)만 남습니다.
// 그래서 접힌 상태에서는 글자와 선택 상자를 숨기고,
// 아이콘만 가운데(justify-center)에 놓습니다.
export function Sidebar({ open, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden h-full min-w-0 flex-col overflow-hidden border-r border-line bg-panel-2 md:flex">
      {/* 머리 영역: 접기/펼치기 버튼은 접어도 계속 보입니다. */}
      <div
        className={`flex items-center gap-2 px-3 py-3 ${
          open ? "" : "justify-center"
        }`}
      >
        {open ? (
          <span className="min-w-0 flex-1 truncate text-d-label font-bold uppercase text-muted">
            상태 확인 모니터링 서버
          </span>
        ) : null}

        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? "사이드바 닫기" : "사이드바 열기"}
          aria-expanded={open}
          className="inline-flex shrink-0 items-center justify-center text-muted transition hover:text-body"
        >
          {open ? <TabCloseIcon /> : <TabOpenIcon />}
        </button>
      </div>

      {/* 메뉴가 들어갈 자리입니다. 남는 공간을 모두 차지해서
          아래 영역을 사이드바 맨 밑으로 밀어 줍니다. */}
      <div className="min-h-0 flex-1" />

      {/* 최하단 영역 */}
      <div className="border-t border-line px-3 py-3">
        {/* 아이디와 로그아웃 버튼을 같은 줄에서 가운데 맞춤으로 놓습니다. */}
        <div
          className={`flex items-center gap-2 ${open ? "" : "justify-center"}`}
        >
          {open && user ? (
            <span className="min-w-0 flex-1 truncate text-b2_body_m font-medium text-secondary">
              {user.username}
            </span>
          ) : null}

          <button
            type="button"
            onClick={logout}
            aria-label="로그아웃"
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
    </aside>
  );
}
