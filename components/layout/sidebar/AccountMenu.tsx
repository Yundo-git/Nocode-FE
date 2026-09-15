import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type AccountMenuItem =
  | {
      readonly key: string;
      readonly label: string;
      readonly href: string;
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

export function AccountMenu({ username, items }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

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
