import { Modal } from "@/components/ui/Modal";

type ErrorModalProps = {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
};

export function ErrorModal({ open, title, message, onClose }: ErrorModalProps) {
  return (
    <Modal open={open} title={title} onClose={onClose} closeOnBackdrop={false}>
      <div className="px-4 py-6">
        <p className="text-b1_body_m text-body">{message}</p>
        <p className="mt-2 text-b2_body_r text-muted">관리자에게 문의하세요.</p>
      </div>

      <div className="flex justify-end border-t border-line px-4 py-3">
        <button type="button" onClick={onClose} className="btn btn-primary btn-md">
          확인
        </button>
      </div>
    </Modal>
  );
}
