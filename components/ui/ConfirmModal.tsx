import { Modal } from "@/components/ui/Modal";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  /** 무엇이 일어나는지 알려 줍니다. 줄바꿈(\n)이 그대로 보입니다. */
  message: string;
  /** 실행 버튼 글자입니다. "삭제" 처럼 무엇을 하는지 적으세요. */
  confirmLabel: string;
  /** 처리 중이면 버튼을 잠급니다. 두 번 눌러 두 번 실행되는 것을 막습니다. */
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

// 되돌릴 수 없는 일을 하기 전에 한 번 물어봅니다.
//
// ★ 실행 버튼을 "확인" 이 아니라 "삭제" 처럼 적습니다.
//   "확인" 은 무엇을 확인하는지 알려 주지 않습니다.
//   급할 때 버튼 글자만 보고 누르는 일이 흔합니다.
export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  busy = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    // closeOnBackdrop={false}: 실수로 바깥을 눌러 닫히지 않게 합니다.
    <Modal open={open} title={title} onClose={onClose} closeOnBackdrop={false}>
      <div className="px-4 py-6">
        {/* whitespace-pre-line: 메시지의 줄바꿈을 그대로 보여 줍니다. */}
        <p className="whitespace-pre-line text-b2_body_r text-body">{message}</p>
      </div>

      <div className="flex justify-end gap-2 border-t border-line px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="btn btn-ghost btn-md"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="btn btn-danger btn-md"
        >
          {busy ? "처리 중…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
