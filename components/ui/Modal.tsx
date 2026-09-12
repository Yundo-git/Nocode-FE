import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  /** 창 제목입니다. 화면에도 보이고 읽기 도구에도 이 이름으로 전달됩니다. */
  title: string;
  onClose: () => void;
  children?: ReactNode;
};

// 화면 가운데에 뜨는 창입니다.
//
// document.body 에 따로 그립니다(createPortal).
// 사이드바(aside)에 overflow-hidden 이 걸려 있어서 그 안에 그리면 잘리기 때문입니다.
// open 이 참이 되는 건 사람이 누른 뒤뿐이라 서버에서 그릴 때는 실행되지 않습니다.
export function Modal({ open, title, onClose, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // 창이 떠 있는 동안 뒤쪽 화면이 같이 스크롤되지 않게 막습니다.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 키보드 초점을 창 안으로 옮겨 줍니다.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 뒤쪽을 덮는 어두운 면입니다. 누르면 닫힙니다. */}
      <button
        type="button"
        aria-label="닫기"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/40"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="panel relative z-10 flex max-h-[80dvh] w-full max-w-[420px] flex-col shadow-soft outline-none"
      >
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
          <h2 className="truncate text-s2 font-semibold text-body">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="shrink-0 text-bt-text-m font-semibold text-muted transition hover:text-body"
          >
            닫기
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
