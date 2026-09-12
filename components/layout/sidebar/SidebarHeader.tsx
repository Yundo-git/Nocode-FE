import { NotificationButton } from "@/components/layout/sidebar/NotificationButton";
import { TabCloseIcon, TabOpenIcon } from "@/components/ui/icons";

type SidebarHeaderProps = {
  open: boolean;
  onToggle: () => void;
};

// 사이드바 맨 위입니다. 알림과 접기/펼치기 버튼은 접어도 계속 보입니다.
//
// 접으면 폭이 3rem 밖에 안 돼서 두 버튼이 한 줄에 못 들어갑니다.
// 그래서 세로로 쌓는데, flex-col-reverse 를 써서 접기 버튼이 위에 오게 합니다.
// (펼쳤을 때도 접기 버튼이 맨 끝이라, 눌렀을 때 버튼이 제자리에 남습니다.)
//
// 세로로 쌓을 때는 아래 메뉴 아이콘들과 간격이 같아 보여야 하므로
// 메뉴 한 칸과 똑같이 py-2 + gap-1 을 씁니다.
// (SidebarNav 의 메뉴 한 칸이 py-2, 목록이 space-y-1 입니다.
//  숫자를 눈대중으로 맞추지 않고 같은 값을 써야 아이콘 크기가 바뀌어도 안 틀어집니다.)
const ICON_BUTTON_BASE =
  "inline-flex shrink-0 items-center justify-center text-muted transition hover:text-body";

export function SidebarHeader({ open, onToggle }: SidebarHeaderProps) {
  const iconButtonClass = open
    ? ICON_BUTTON_BASE
    : `${ICON_BUTTON_BASE} w-full py-2`;

  return (
    <div
      className={
        open
          ? "flex items-center gap-2 px-3 py-3"
          : "flex flex-col-reverse items-center gap-1 px-3 py-3"
      }
    >
      {open ? (
        <span className="min-w-0 flex-1 truncate text-d-label font-bold uppercase text-muted">
          상태 확인 모니터링 서버
        </span>
      ) : null}

      <NotificationButton className={iconButtonClass} />

      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? "사이드바 닫기" : "사이드바 열기"}
        aria-expanded={open}
        className={iconButtonClass}
      >
        {open ? <TabCloseIcon /> : <TabOpenIcon />}
      </button>
    </div>
  );
}
