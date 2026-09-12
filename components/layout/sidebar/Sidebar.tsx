import { SidebarFooter } from "@/components/layout/sidebar/SidebarFooter";
import { SidebarHeader } from "@/components/layout/sidebar/SidebarHeader";
import { SidebarNav } from "@/components/layout/sidebar/SidebarNav";

type SidebarProps = {
  open: boolean;
  onToggle: () => void;
};

// 사이드바입니다. 내용이 길어져서 세 부분으로 나눠 두었습니다.
// - SidebarHeader : 서비스 이름 + 접기/펼치기 버튼
// - SidebarNav    : 메뉴 목록 (메뉴 항목은 navItems.ts 에 모아 두었습니다)
// - SidebarFooter : 아이디 + 로그아웃 + 화면 모드
//
// 접으면 아이콘 하나 너비(3rem)만 남습니다.
// 그래서 접힌 상태에서는 글자와 선택 상자를 숨기고 아이콘만 가운데에 놓습니다.
export function Sidebar({ open, onToggle }: SidebarProps) {
  return (
    <aside className="hidden h-full min-w-0 flex-col overflow-hidden border-r border-line bg-panel-2 md:flex">
      <SidebarHeader open={open} onToggle={onToggle} />
      <SidebarNav open={open} />
      <SidebarFooter open={open} />
    </aside>
  );
}
