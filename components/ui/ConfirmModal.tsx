import { Modal } from "@/components/ui/Modal";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

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
    <Modal open={open} title={title} onClose={onClose} closeOnBackdrop={false}>
      <div className="px-4 py-6">
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
