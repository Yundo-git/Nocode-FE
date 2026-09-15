import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { formatDateTime } from "@/lib/datetime";
import type { NoteRevision } from "@/lib/notes/types";

type RevisionModalProps = {
  open: boolean;
  noteId: string;
  onClose: () => void;
  onLoad: (id: string) => Promise<readonly NoteRevision[]>;
  onRevert: (revisionId: string) => Promise<string>;
  onNotice: (message: string) => void;
};

export function RevisionModal({
  open,
  noteId,
  onClose,
  onLoad,
  onRevert,
  onNotice,
}: RevisionModalProps) {
  const [rows, setRows] = useState<readonly NoteRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    void onLoad(noteId).then((found) => {
      setRows(found);
      setLoading(false);
    });
  }, [noteId, onLoad, open]);

  const revert = async (revisionId: string) => {
    if (!window.confirm("이 시점 내용으로 되돌립니다.\n지금 내용도 이력에 남습니다.")) {
      return;
    }

    setBusy(revisionId);

    const message = await onRevert(revisionId);

    setBusy("");

    if (message !== "") {
      onNotice(message);
      return;
    }

    onClose();
  };

  return (
    <Modal open={open} title="고친 이력" onClose={onClose}>
      <div className="px-4 py-3">
        {loading ? (
          <p className="py-6 text-center text-b2_body_r text-muted">불러오는 중입니다.</p>
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-b2_body_r text-muted">
            아직 고친 이력이 없습니다.
          </p>
        ) : (
          <ul className="space-y-1">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-2 hover:bg-row-hover"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-b2_body_r text-body">
                    {row.title.trim() === "" ? "제목 없음" : row.title}
                  </span>
                  <span className="block truncate text-bt-text-s text-muted/70">
                    {row.preview === "" ? "내용 없음" : row.preview}
                  </span>
                </span>

                <span className="shrink-0 text-bt-text-s text-muted/70">
                  {row.editedBy} · {formatDateTime(row.editedAt)}
                </span>

                <button
                  type="button"
                  onClick={() => void revert(row.id)}
                  disabled={busy !== ""}
                  className="btn btn-ghost btn-sm shrink-0"
                >
                  되돌리기
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
