import { NotificationButton } from "@/components/layout/sidebar/NotificationButton";
import { TabCloseIcon, TabOpenIcon } from "@/components/ui/icons";

type SidebarHeaderProps = {
  open: boolean;
  onToggle: () => void;
};

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
        <span className="min-w-0 flex-1 truncate text-bt-text-m font-bold uppercase text-muted">
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
