import { TabCloseIcon, TabOpenIcon } from "@/components/ui/icons";

type SidebarHeaderProps = {
  open: boolean;
  onToggle: () => void;
};

// 사이드바 맨 위입니다. 접기/펼치기 버튼은 접어도 계속 보입니다.
export function SidebarHeader({ open, onToggle }: SidebarHeaderProps) {
  return (
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
  );
}
