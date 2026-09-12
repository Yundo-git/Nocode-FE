import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// 메뉴 한 줄입니다.
// "주소로 이동하는 줄" 과 "누르면 뭔가 실행하는 줄" 둘 중 하나만 될 수 있습니다.
// 유니온으로 나눠 둬서 href 와 onSelect 를 같이 적거나 둘 다 빠뜨리면
// 화면을 켜 보기 전에 타입 검사에서 걸립니다.
export type AccountMenuItem =
  | {
      readonly key: string;
      readonly label: string;
      readonly href: string;
      // 링크 줄에는 onSelect 를 적을 수 없다는 표시입니다.
      // 이게 없으면 href 와 onSelect 를 같이 적어도 타입 검사를 통과하고,
      // 실제로는 onSelect 가 영영 실행되지 않아 찾기 어려운 버그가 됩니다.
      readonly onSelect?: never;
    }
  | {
      readonly key: string;
      readonly label: string;
      readonly href?: never;
      readonly onSelect: () => void;
    };

type AccountMenuProps = {
  username: string;
  items: readonly AccountMenuItem[];
};

const ITEM_CLASS =
  "block w-full px-2.5 py-1.5 text-left text-b2_body_r text-secondary transition hover:bg-row-hover hover:text-body";

// 계정명을 누르면 열리는 선택 메뉴입니다.
//
// 닫혀 있을 때는 원래 계정명 그대로이고 테두리만 둘렀습니다.
// 사이드바(aside)에 overflow-hidden 이 걸려 있어서 아래로 열면 잘리기 때문에
// 위쪽(bottom-full)으로 폅니다. 계정명이 사이드바 맨 아래에 있어 위가 늘 넉넉합니다.
export function AccountMenu({ username, items }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // 열려 있을 때만 바깥 클릭과 Esc 를 살핍니다.
  // 닫히면 정리 함수가 바로 떼어 내서 평소에는 아무 일도 하지 않습니다.
  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        // 키보드로 닫았으면 눌렀던 자리로 초점을 돌려 줍니다.
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center rounded-[var(--radius-md)] border border-line-strong px-2 py-1 text-left transition hover:border-primary-400"
      >
        <span className="min-w-0 flex-1 truncate text-b2_body_m font-medium text-secondary">
          {username}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="계정 메뉴"
          className="absolute bottom-full left-0 z-10 mb-1 w-full overflow-hidden rounded-[var(--radius-md)] border border-line-strong bg-panel py-1 shadow-soft"
        >
          {/* href 가 있으면 링크, 없으면 실행 버튼으로 그립니다.
              ("href" in item 은 쓸 수 없습니다. 아래쪽 줄도 href?: never 로
               키 자체는 가지고 있어서 in 으로는 구분이 되지 않습니다.) */}
          {items.map((item) =>
            item.href !== undefined ? (
              <Link
                key={item.key}
                href={item.href}
                role="menuitem"
                className={ITEM_CLASS}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                className={ITEM_CLASS}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
