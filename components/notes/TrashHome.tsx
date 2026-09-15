import { NoteIcon, TrashIcon } from "@/components/ui/icons";
import { formatDateTime } from "@/lib/datetime";
import { noteTitleOf, type NoteSummary, type NoteTree } from "@/lib/notes/types";

type TrashHomeProps = {
  tree: NoteTree;
  onRestore: (note: NoteSummary) => void;
  onPurge: (note: NoteSummary) => void;
};

export function TrashHome({ tree, onRestore, onPurge }: TrashHomeProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 pb-10">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-panel-2">
              <TrashIcon width={20} height={20} className="text-muted" />
            </span>
            <div className="min-w-0">
              <p className="text-b2_body_r text-muted">
                지운 메모는 <b className="text-body">{tree.trashDays}일</b> 동안 보관한 뒤
                자동으로 지워집니다 · {tree.trash.length}건
              </p>
            </div>
          </div>
        </header>

        {tree.trash.length === 0 ? (
          <div className="panel px-4 py-12 text-center text-b2_body_r text-muted">
            휴지통이 비어 있습니다.
          </div>
        ) : (
          <div className="panel p-2">
            {tree.trash.map((note) => (
              <div
                key={note.id}
                className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-2 transition hover:bg-row-hover"
              >
                <NoteIcon width={15} height={15} className="shrink-0 text-muted" />
                <span className="shrink-0 max-w-[40%] truncate text-b2_body_r text-body">
                  {noteTitleOf(note)}
                </span>
                <span className="hidden min-w-0 flex-1 truncate text-bt-text-s text-muted/70 lg:block">
                  {note.preview}
                </span>
                <span className="flex-1 lg:hidden" />
                <span className="shrink-0 text-bt-text-s text-muted/70">
                  {note.ownerName} · {formatDateTime(note.deletedAt)} 지움
                </span>

                <button
                  type="button"
                  onClick={() => onRestore(note)}
                  className="btn btn-ghost btn-sm shrink-0"
                >
                  되살리기
                </button>
                <button
                  type="button"
                  onClick={() => onPurge(note)}
                  className="btn btn-danger btn-sm shrink-0"
                >
                  완전삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
