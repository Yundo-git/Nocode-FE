import { useCallback, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { BellIcon } from "@/components/ui/icons";

type NotificationButtonProps = {
  /** 종 버튼에 입힐 클래스입니다. 사이드바가 접혔는지에 따라 달라집니다. */
  className: string;
};

// 알림 버튼과 알림 목록 창입니다.
// 목록 내용은 아직 없고 창만 뜹니다.
export function NotificationButton({ className }: NotificationButtonProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // 창을 닫으면 눌렀던 버튼으로 초점을 돌려 줍니다.
  // Modal 의 useEffect 가 이 함수를 의존성으로 쓰기 때문에 useCallback 으로 고정합니다.
  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="알림"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="알림"
        className={className}
      >
        <BellIcon />
      </button>

      <Modal open={open} title="알림" onClose={close}>
        <p className="px-4 py-12 text-center text-b2_body_r text-muted">
          표시할 알림이 없습니다.
        </p>
      </Modal>
    </>
  );
}
