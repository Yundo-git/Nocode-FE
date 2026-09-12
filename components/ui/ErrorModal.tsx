import { Modal } from "@/components/ui/Modal";

type ErrorModalProps = {
  open: boolean;
  /** 창 제목입니다. 예: "등록 실패" */
  title: string;
  /** 무엇이 잘못됐는지 한 줄로 알려 줍니다. */
  message: string;
  onClose: () => void;
};

// 실패를 알리는 창입니다.
// 사용자가 스스로 고칠 수 없는 경우가 있으므로 늘 문의 안내를 함께 보여 줍니다.
export function ErrorModal({ open, title, message, onClose }: ErrorModalProps) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
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
