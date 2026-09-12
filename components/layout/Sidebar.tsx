// 사이드바 영역입니다.
// 메뉴 구성(메뉴 이름, 아이콘, 사용자 정보 등)은 다음 단계에서 정하기로 했으므로
// 이번 단계에서는 영역만 확보해 둡니다.
export function Sidebar() {
  return (
    <aside className="hidden h-full flex-col border-r border-line bg-panel-2 md:flex">
      <div className="px-4 py-3">
        <span className="text-d-label font-bold uppercase text-muted">
          Sidebar
        </span>
      </div>
    </aside>
  );
}
