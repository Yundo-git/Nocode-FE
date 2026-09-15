import { SidebarFooter } from "@/components/layout/sidebar/SidebarFooter";
import { SidebarHeader } from "@/components/layout/sidebar/SidebarHeader";
import { SidebarNav } from "@/components/layout/sidebar/SidebarNav";

type SidebarProps = {
  open: boolean;
  onToggle: () => void;
  onRequestOpen: () => void;
  onNotice: (message: string) => void;
};

export function Sidebar({ open, onToggle, onRequestOpen, onNotice }: SidebarProps) {
  return (
    <aside className="hidden h-full min-w-0 flex-col overflow-hidden border-r border-line bg-panel-2 md:flex">
      <SidebarHeader open={open} onToggle={onToggle} />
      <SidebarNav open={open} onRequestOpen={onRequestOpen} onNotice={onNotice} />
      <SidebarFooter open={open} />
    </aside>
  );
}
