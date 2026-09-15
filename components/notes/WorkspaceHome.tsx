import { useRouter } from "next/router";
import { ViewToggle, useNoteView } from "@/components/notes/ViewToggle";
import { NewNoteButton } from "@/components/notes/NewNoteButton";
import { MemberBar } from "@/components/notes/MemberBar";
import {
  FolderIcon,
  LockIcon,
  NoteIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
} from "@/components/ui/icons";
import { formatDateTime } from "@/lib/datetime";
import { formatAgo } from "@/lib/dashboard/duration";
import { useNow } from "@/lib/useNow";
import {
  childrenOf,
  noteTitleOf,
  notesOf,
  type NoteSummary,
  type NoteTree,
  type TemplateId,
  type Workspace,
} from "@/lib/notes/types";

type LineProps = {
  note: NoteSummary;
  depth: number;
  all: readonly NoteSummary[];
  now: number;
  showOwner: boolean;
  canDelete: (note: NoteSummary) => boolean;
  onOpen: (id: string) => void;
  onDelete: (note: NoteSummary) => void;
};

function Line({ note, depth, all, now, showOwner, canDelete, onOpen, onDelete }: LineProps) {
  const kids = childrenOf(all, note.id);

  return (
    <>
      <div className="group/row flex items-center rounded-[var(--radius-md)] pr-1 transition hover:bg-row-hover">
      <button
        type="button"
        onClick={() => onOpen(note.id)}
        style={{ paddingLeft: `${8 + depth * 18}px` }}
        className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-2 text-left"
      >
        <NoteIcon width={15} height={15} className="shrink-0 text-muted" />
        <span className="shrink-0 max-w-[45%] truncate text-b2_body_r text-body">
          {noteTitleOf(note)}
        </span>
        <span className="hidden min-w-0 flex-1 truncate text-bt-text-s text-muted/70 lg:block">
          {note.preview}
        </span>
        <span className="flex-1 lg:hidden" />
        {showOwner ? (
          <span className="shrink-0 text-bt-text-s text-muted/70">{note.ownerName}</span>
        ) : null}
        <span className="shrink-0 text-bt-text-s text-muted/70">
          {now === 0 ? "" : formatAgo(note.updatedAt, now)}
        </span>
      </button>

        {canDelete(note) ? (
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

      {kids.map((kid) => (
        <Line
          key={kid.id}
          note={kid}
          depth={depth + 1}
          all={all}
          now={now}
          showOwner={showOwner}
          canDelete={canDelete}
          onOpen={onOpen}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

type CardProps = {
  note: NoteSummary;
  kids: number;
  now: number;
  showOwner: boolean;
  canDelete: boolean;
  onOpen: (id: string) => void;
  onDelete: (note: NoteSummary) => void;
};

function Card({ note, kids, now, showOwner, canDelete, onOpen, onDelete }: CardProps) {
  return (
    <div className="group/card panel relative flex h-[150px] flex-col transition hover:border-primary-400">
      {canDelete ? (
        <button
          type="button"
          onClick={() => onDelete(note)}
          title="휴지통으로 보내기"
          aria-label={`${noteTitleOf(note)} 지우기`}
          className="absolute right-1.5 top-1.5 z-10 rounded p-1 text-muted opacity-0 transition hover:bg-row-hover hover:text-down-500 focus:opacity-100 group-hover/card:opacity-100"
        >
          <TrashIcon width={15} height={15} />
        </button>
      ) : null}

    <button
      type="button"
      onClick={() => onOpen(note.id)}
      className="flex flex-1 flex-col gap-2 p-3 text-left"
    >
      <span className="flex items-start gap-1.5 pr-6">
        <NoteIcon width={15} height={15} className="mt-0.5 shrink-0 text-muted" />
        <span className="line-clamp-2 text-b2_body_m font-semibold text-body">
          {noteTitleOf(note)}
        </span>
      </span>

      <span className="line-clamp-3 flex-1 text-bt-text-s text-muted">
        {note.preview === "" ? "내용 없음" : note.preview}
      </span>

      <span className="flex items-center gap-2 text-bt-text-s text-muted/70">
        {kids > 0 ? <span>하위 {kids}</span> : null}
        {showOwner ? <span>{note.ownerName}</span> : null}
        <span className="flex-1" />
        <span>{now === 0 ? "" : formatAgo(note.updatedAt, now)}</span>
      </span>
    </button>
    </div>
  );
}

type WorkspaceHomeProps = {
  tree: NoteTree;
  workspace: Workspace | null;
  groupOverview?: boolean;
  myId: string;
  onCreate: (workspaceId: string | null, template?: TemplateId) => void;
  onAddWorkspace: () => void;
  onInvite: (workspaceId: string, accountId: string) => void;
  onExpel: (workspaceId: string, accountId: string) => void;
  onDelete: (note: NoteSummary) => void;
};

export function WorkspaceHome({
  tree,
  workspace,
  groupOverview = false,
  onCreate,
  onAddWorkspace,
  onDelete,
  myId,
  onInvite,
  onExpel,
}: WorkspaceHomeProps) {
  const mayDelete = (note: NoteSummary): boolean =>
    note.mine || tree.canManageWorkspaces;
  const router = useRouter();
  const now = useNow();
  const [view, setView] = useNoteView();

  const open = (id: string) => void router.push({ pathname: "/notes", query: { id } });

  if (groupOverview) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 pb-10">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-panel-2">
                <UserIcon width={20} height={20} className="text-primary-600" />
              </span>
              <div className="min-w-0">
                <p className="text-b2_body_r text-muted">
                  파트 사람이 함께 보는 공간입니다 ·{" "}
                  {tree.workspaces.filter((w) => w.kind === "division").length}개
                </p>
              </div>
            </div>

            {tree.canManageWorkspaces ? (
              <button type="button" onClick={onAddWorkspace} className="btn btn-primary btn-md shrink-0">
                <FolderIcon width={16} height={16} />워크스페이스 만들기
              </button>
            ) : null}
          </header>

          {tree.workspaces.length === 0 ? (
            <div className="panel px-4 py-10 text-center">
              <p className="text-b2_body_r text-muted">아직 그룹 워크스페이스가 없습니다.</p>
              <p className="mt-1 text-bt-text-s text-muted/70">
                {tree.canManageWorkspaces
                  ? "위 단추로 파트가 함께 쓸 공간을 만들어 주세요."
                  : "관리자가 만들면 여기에 보입니다."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tree.workspaces
                .filter((item) => item.kind === "division")
                .map((item) => {
                const count = tree.notes.filter((n) => n.workspaceId === item.id).length;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      void router.push({ pathname: "/notes", query: { ws: item.id } })
                    }
                    className="panel flex flex-col gap-2 p-4 text-left transition hover:border-primary-400 hover:bg-row-hover"
                  >
                    <span className="flex items-center gap-2">
                      <FolderIcon width={18} height={18} className="shrink-0 text-primary-600" />
                      <span className="min-w-0 flex-1 truncate text-b2_body_m font-semibold text-body">
                        {item.name}
                      </span>
                    </span>
                    <span className="text-bt-text-s text-muted">메모 {count}건</span>
                    <span className="text-bt-text-s text-muted/70">
                      만든 사람 {item.createdBy}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const isGroup = workspace !== null;
  const notes = notesOf(tree.notes, workspace?.id ?? null);
  const total = tree.notes.filter(
    (note) => note.workspaceId === (workspace?.id ?? null),
  ).length;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 pb-10">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-panel-2">
              {isGroup ? (
                <FolderIcon width={20} height={20} className="text-primary-600" />
              ) : (
                <LockIcon width={20} height={20} className="text-muted" />
              )}
            </span>

            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-2 text-bt-text-s text-muted">
                {isGroup ? (
                  <>
                    <UserIcon width={12} height={12} />
                    <span>
                      {workspace.kind === "private"
                        ? "초대받은 사람만 봅니다"
                        : "파트 사람이 함께 봅니다"}
                    </span>
                    <span>·</span>
                    <span>만든 사람 {workspace.createdBy}</span>
                    <span>·</span>
                    <span>{formatDateTime(workspace.createdAt)}</span>
                  </>
                ) : (
                  <>
                    <LockIcon width={12} height={12} />
                    <span>나만 봅니다. 다른 사람에게는 보이지 않습니다</span>
                  </>
                )}
                <span>·</span>
                <span>메모 {total}건</span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ViewToggle view={view} onChange={setView} />

            <NewNoteButton
              onCreate={(template) => onCreate(workspace?.id ?? null, template)}
            />
          </div>
        </header>

        {workspace !== null && workspace.kind === "private" ? (
          <MemberBar
            workspace={workspace}
            myId={myId}
            onInvite={(accountId) => onInvite(workspace.id, accountId)}
            onExpel={(accountId) => onExpel(workspace.id, accountId)}
          />
        ) : null}

        {notes.length === 0 ? (
          <div className="panel px-2 py-10 text-center text-b2_body_r text-muted">
            아직 메모가 없습니다.
          </div>
        ) : view === "list" ? (
          <div className="panel p-2">
            {notes.map((note) => (
              <Line
                key={note.id}
                note={note}
                depth={0}
                all={tree.notes}
                now={now}
                showOwner={isGroup}
                canDelete={mayDelete}
                onOpen={open}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Card
                key={note.id}
                note={note}
                kids={childrenOf(tree.notes, note.id).length}
                now={now}
                showOwner={isGroup}
                canDelete={mayDelete(note)}
                onOpen={open}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
