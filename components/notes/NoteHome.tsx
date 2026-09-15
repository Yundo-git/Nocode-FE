import { useRouter } from "next/router";
import { NewNoteButton } from "@/components/notes/NewNoteButton";
import {
  FolderIcon,
  LockIcon,
  NoteIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
} from "@/components/ui/icons";
import { BUSINESS_DIVISION_LABEL, type BusinessDivisionId } from "@/lib/businessDivisions";
import { formatAgo } from "@/lib/dashboard/duration";
import { useNow } from "@/lib/useNow";
import {
  GROUP_NOTES,
  MY_NOTES,
  noteTitleOf,
  notesOf,
  type NoteSummary,
  type NoteTree,
  type TemplateId,
} from "@/lib/notes/types";

type RecentCardProps = {
  note: NoteSummary;
  where: string;
  now: number;
  onOpen: (id: string) => void;
};

function RecentCard({ note, where, now, onOpen }: RecentCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(note.id)}
      className="panel flex h-[104px] w-[190px] shrink-0 flex-col justify-between p-3 text-left transition hover:border-primary-400 hover:bg-row-hover"
    >
      <span className="flex items-start gap-1.5">
        <NoteIcon width={15} height={15} className="mt-0.5 shrink-0 text-muted" />
        <span className="line-clamp-2 text-b2_body_m font-semibold text-body">
          {noteTitleOf(note)}
        </span>
      </span>

      <span className="block">
        <span className="block truncate text-bt-text-s text-muted">{where}</span>
        <span className="block text-bt-text-s text-muted/70">
          {now === 0 ? "" : formatAgo(note.updatedAt, now)}
        </span>
      </span>
    </button>
  );
}

type NoteRowProps = {
  note: NoteSummary;
  now: number;
  showOwner: boolean;
  canDelete: boolean;
  onOpen: (id: string) => void;
  onDelete: (note: NoteSummary) => void;
};

function NoteRow({ note, now, showOwner, canDelete, onOpen, onDelete }: NoteRowProps) {
  return (
    <div className="group/row flex items-center rounded-[var(--radius-md)] pr-1 transition hover:bg-row-hover">
    <button
      type="button"
      onClick={() => onOpen(note.id)}
      className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left"
    >
      <NoteIcon width={15} height={15} className="shrink-0 text-muted" />
      <span className="shrink-0 max-w-[45%] truncate text-b2_body_r text-body">
        {noteTitleOf(note)}
      </span>
      <span className="hidden min-w-0 flex-1 truncate text-bt-text-s text-muted/70 lg:block">
        {note.preview}
      </span>
      <span className="flex-1 lg:hidden" />
      {showOwner && !note.mine ? (
        <span className="shrink-0 text-bt-text-s text-muted/70">{note.ownerName}</span>
      ) : null}
      <span className="shrink-0 text-bt-text-s text-muted/70">
        {now === 0 ? "" : formatAgo(note.updatedAt, now)}
      </span>
    </button>

      {canDelete ? (
        <button
          type="button"
          onClick={() => onDelete(note)}
          title="휴지통으로 보내기"
          aria-label={`${noteTitleOf(note)} 지우기`}
          className="shrink-0 rounded p-1 text-muted opacity-0 transition hover:text-down-500 focus:opacity-100 group-hover/row:opacity-100"
        >
          <TrashIcon width={15} height={15} />
        </button>
      ) : null}
    </div>
  );
}

type NoteHomeProps = {
  tree: NoteTree;
  divisionId: string;
  onCreate: (workspaceId: string | null, template?: TemplateId) => void;
  onAddWorkspace: () => void;
  onDelete: (note: NoteSummary) => void;
};

export function NoteHome({
  tree,
  divisionId,
  onCreate,
  onAddWorkspace,
  onDelete,
}: NoteHomeProps) {
  const router = useRouter();
  const now = useNow();

  const open = (id: string) => void router.push({ pathname: "/notes", query: { id } });
  const goWorkspace = (ws: string) =>
    void router.push({ pathname: "/notes", query: { ws } });

  const mine = notesOf(tree.notes, null);
  const recent = [...tree.notes].slice(0, 8);

  const whereOf = (note: NoteSummary): string =>
    note.workspaceId === null
      ? "내 메모"
      : (tree.workspaces.find((w) => w.id === note.workspaceId)?.name ?? "워크스페이스");

  const division =
    BUSINESS_DIVISION_LABEL[divisionId as BusinessDivisionId] ?? divisionId;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-7 pb-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <p className="min-w-0 text-b2_body_r text-muted">
            {division} 파트 · 내 메모 {mine.length}건 · 그룹 워크스페이스{" "}
            {tree.workspaces.length}개
          </p>

          <NewNoteButton onCreate={(template) => onCreate(null, template)} />
        </header>

        {recent.length === 0 ? null : (
          <section>
            <h3 className="mb-2 text-b2_body_m font-semibold text-secondary">최근 메모</h3>
            <div
              className="flex gap-3 overflow-x-auto pb-1"
              style={{
                maskImage:
                  "linear-gradient(to right, black calc(100% - 40px), transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, black calc(100% - 40px), transparent 100%)",
              }}
            >
              {recent.map((note) => (
                <RecentCard
                  key={note.id}
                  note={note}
                  where={whereOf(note)}
                  now={now}
                  onOpen={open}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-2 flex items-center gap-2">
            <LockIcon width={16} height={16} className="shrink-0 text-muted" />
            <button
              type="button"
              onClick={() => goWorkspace(MY_NOTES)}
              className="text-b2_body_m font-semibold text-secondary hover:underline"
            >
              내 워크스페이스
            </button>
            <span className="text-bt-text-s text-muted/70">나만 봅니다</span>
            <span className="flex-1" />
            <button
              type="button"
              onClick={() => onCreate(null)}
              aria-label="내 메모에 새 메모"
              className="rounded p-1 text-muted transition hover:bg-row-hover hover:text-body"
            >
              <PlusIcon width={15} height={15} />
            </button>
          </div>

          <div className="panel p-2">
            {mine.length === 0 ? (
              <p className="px-2 py-6 text-center text-b2_body_r text-muted">
                아직 메모가 없습니다.
              </p>
            ) : (
              mine.map((note) => (
                <NoteRow
                  key={note.id}
                  note={note}
                  now={now}
                  showOwner={false}
                  canDelete
                  onOpen={open}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2">
            <UserIcon width={16} height={16} className="shrink-0 text-muted" />
            <button
              type="button"
              onClick={() => goWorkspace(GROUP_NOTES)}
              className="text-b2_body_m font-semibold text-secondary hover:underline"
            >
              그룹 워크스페이스
            </button>
            <span className="text-bt-text-s text-muted/70">
              {division} 파트가 함께 봅니다
            </span>
            <span className="flex-1" />
            {tree.canManageWorkspaces ? (
              <button type="button" onClick={onAddWorkspace} className="btn btn-ghost btn-sm">
                <FolderIcon width={14} height={14} />만들기
              </button>
            ) : null}
          </div>

          {tree.workspaces.filter((w) => w.kind === "division").length === 0 ? (
            <div className="panel px-4 py-8 text-center">
              <p className="text-b2_body_r text-muted">아직 그룹 워크스페이스가 없습니다.</p>
              <p className="mt-1 text-bt-text-s text-muted/70">
                {tree.canManageWorkspaces
                  ? "위 '만들기' 로 파트가 함께 쓸 공간을 만들어 주세요."
                  : "관리자가 만들면 여기에 보입니다."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {tree.workspaces
                .filter((w) => w.kind === "division")
                .map((workspace) => {
                const notes = notesOf(tree.notes, workspace.id);

                return (
                  <div key={workspace.id} className="panel flex flex-col p-3">
                    <div className="mb-2 flex items-center gap-2 border-b border-line pb-2">
                      <FolderIcon
                        width={16}
                        height={16}
                        className="shrink-0 text-primary-600"
                      />
                      <button
                        type="button"
                        onClick={() => goWorkspace(workspace.id)}
                        title={`${workspace.name} 홈`}
                        className="min-w-0 flex-1 truncate text-left text-b2_body_m font-semibold text-body hover:underline"
                      >
                        {workspace.name}
                      </button>
                      <span className="shrink-0 text-bt-text-s text-muted/70">
                        {notes.length}건
                      </span>
                      <button
                        type="button"
                        onClick={() => onCreate(workspace.id)}
                        aria-label={`${workspace.name}에 새 메모`}
                        className="shrink-0 rounded p-1 text-muted transition hover:bg-row-hover hover:text-body"
                      >
                        <PlusIcon width={15} height={15} />
                      </button>
                    </div>

                    {notes.length === 0 ? (
                      <p className="px-2 py-4 text-center text-bt-text-s text-muted/70">
                        비어 있습니다
                      </p>
                    ) : (
                      notes
                        .slice(0, 5)
                        .map((note) => (
                          <NoteRow
                            key={note.id}
                            note={note}
                            now={now}
                            showOwner
                            canDelete={note.mine || tree.canManageWorkspaces}
                            onOpen={open}
                            onDelete={onDelete}
                          />
                        ))
                    )}

                    {notes.length > 5 ? (
                      <button
                        type="button"
                        onClick={() => goWorkspace(workspace.id)}
                        className="px-2 pt-1 text-left text-bt-text-s text-muted/70 hover:underline"
                      >
                        외 {notes.length - 5}건 모두 보기
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
