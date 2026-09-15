import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import {
  ChevronRightIcon,
  LockIcon,
  NoteIcon,
  PencilIcon,
  PlusIcon,
  StarFilledIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { useNotes } from "@/lib/notes/NotesProvider";
import {
  GROUP_NOTES,
  MY_NOTES,
  TRASH,
  childrenOf,
  noteTitleOf,
  notesOf,
  type NoteSummary,
} from "@/lib/notes/types";

const OPEN_KEY = "pingcheck-note-tree";

type Row = {
  readonly key: string;
  readonly name: string;
  readonly workspaceId: string | null;
  readonly notes: readonly NoteSummary[];
  readonly canRename: boolean;
};

function readOpen(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(OPEN_KEY);

    return raw === null ? { mine: true } : (JSON.parse(raw) as Record<string, boolean>);
  } catch {
    return { mine: true };
  }
}

const iconButton =
  "shrink-0 rounded p-0.5 text-muted opacity-0 transition focus:opacity-100 group-hover/folder:opacity-100";

type NoteLineProps = {
  note: NoteSummary;
  depth: number;
  all: readonly NoteSummary[];
  selectedId: string | null;
  onNoteRoute: boolean;
  onOpenNote: (id: string) => void;
  onRemoveNote: (note: NoteSummary) => void;
};

function NoteLine({
  note,
  depth,
  all,
  selectedId,
  onNoteRoute,
  onOpenNote,
  onRemoveNote,
}: NoteLineProps) {
  const active = note.id === selectedId && onNoteRoute;
  const kids = childrenOf(all, note.id);

  return (
    <>
      <div className="group/note flex items-center pr-1">
        <button
          type="button"
          onClick={() => onOpenNote(note.id)}
          title={noteTitleOf(note)}
          style={{ paddingLeft: `${28 + depth * 12}px` }}
          className={`min-w-0 flex-1 truncate rounded py-1 pr-1 text-left text-b2_body_r transition ${
            active
              ? "bg-primary-600 text-white"
              : "text-secondary hover:bg-row-hover hover:text-body"
          }`}
        >
          {noteTitleOf(note)}
        </button>

        {note.mine ? (
          <button
            type="button"
            onClick={() => onRemoveNote(note)}
            title="메모 지우기"
            aria-label={`${noteTitleOf(note)} 지우기`}
            className="shrink-0 rounded p-0.5 text-muted opacity-0 transition hover:text-down-500 focus:opacity-100 group-hover/note:opacity-100"
          >
            <TrashIcon width={13} height={13} />
          </button>
        ) : null}
      </div>

      {kids.map((kid) => (
        <NoteLine
          key={kid.id}
          note={kid}
          depth={depth + 1}
          all={all}
          selectedId={selectedId}
          onNoteRoute={onNoteRoute}
          onOpenNote={onOpenNote}
          onRemoveNote={onRemoveNote}
        />
      ))}
    </>
  );
}

type FolderProps = {
  row: Row;
  all: readonly NoteSummary[];
  open: boolean;
  selectedId: string | null;
  onNoteRoute: boolean;
  onToggle: (key: string) => void;
  onOpenWorkspace: (workspaceId: string | null) => void;
  activeWorkspace: string | null;
  onOpenNote: (id: string) => void;
  onAddNote: (workspaceId: string | null) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string, name: string) => void;
  onRemoveNote: (note: NoteSummary) => void;
};

function Folder({
  row,
  all,
  open,
  selectedId,
  onNoteRoute,
  onToggle,
  onOpenWorkspace,
  activeWorkspace,
  onOpenNote,
  onAddNote,
  onRename,
  onRemove,
  onRemoveNote,
}: FolderProps) {
  return (
    <div>
      <div className="group/folder flex items-center gap-0.5 pr-1">
        <button
          type="button"
          onClick={() => onToggle(row.key)}
          aria-expanded={open}
          aria-label={`${row.name} ${open ? "접기" : "펼치기"}`}
          className="shrink-0 rounded p-0.5 pl-1 text-secondary transition hover:bg-row-hover hover:text-body"
        >
          <ChevronRightIcon
            width={13}
            height={13}
            className={`transition-transform ${open ? "rotate-90" : ""}`}
          />
        </button>

        <button
          type="button"
          onClick={() => onOpenWorkspace(row.workspaceId)}
          title={`${row.name} 홈`}
          className={`flex min-w-0 flex-1 items-center gap-1 rounded px-1 py-1 text-left transition hover:bg-row-hover hover:text-body ${
            activeWorkspace === (row.workspaceId ?? "mine")
              ? "text-primary-600"
              : "text-secondary"
          }`}
        >
          <span className="truncate text-b2_body_r font-semibold">{row.name}</span>
          <span className="shrink-0 text-bt-text-s text-muted/70">{row.notes.length}</span>
        </button>

        <button
          type="button"
          onClick={() => onAddNote(row.workspaceId)}
          title={`${row.name}에 메모 추가`}
          aria-label={`${row.name}에 메모 추가`}
          className={`${iconButton} hover:text-body`}
        >
          <PlusIcon width={13} height={13} />
        </button>

        {row.canRename && row.workspaceId !== null ? (
          <>
            <button
              type="button"
              onClick={() => onRename(row.workspaceId as string, row.name)}
              title="이름 바꾸기"
              aria-label={`${row.name} 이름 바꾸기`}
              className={`${iconButton} hover:text-body`}
            >
              <PencilIcon width={13} height={13} />
            </button>
            <button
              type="button"
              onClick={() => onRemove(row.workspaceId as string, row.name)}
              title="워크스페이스 지우기"
              aria-label={`${row.name} 지우기`}
              className={`${iconButton} hover:text-down-500`}
            >
              <TrashIcon width={13} height={13} />
            </button>
          </>
        ) : null}
      </div>

      {!open ? null : row.notes.length === 0 ? (
        <p className="py-1 pl-7 text-bt-text-s text-muted/70">비어 있습니다</p>
      ) : (
        row.notes.map((note) => (
          <NoteLine
            key={note.id}
            note={note}
            depth={0}
            all={all}
            selectedId={selectedId}
            onNoteRoute={onNoteRoute}
            onOpenNote={onOpenNote}
            onRemoveNote={onRemoveNote}
          />
        ))
      )}
    </div>
  );
}

type NoteTreeProps = {
  open: boolean;
  onRequestOpen: () => void;
  onNotice: (message: string) => void;
};

export function NoteTree({ open, onRequestOpen, onNotice }: NoteTreeProps) {
  const router = useRouter();
  const {
    tree,
    selectedId,
    createNote,
    deleteNote,
    createWorkspace,
    renameWorkspace,
    deleteWorkspace,
  } = useNotes();

  const [expanded, setExpanded] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [folders, setFolders] = useState<Record<string, boolean>>({ mine: true });

  useEffect(() => {
    setFolders(readOpen());
  }, []);

  const toggleFolder = useCallback((key: string) => {
    setFolders((prev) => {
      const next = { ...prev, [key]: !(prev[key] ?? false) };

      try {
        window.localStorage.setItem(OPEN_KEY, JSON.stringify(next));
      } catch {
      }

      return next;
    });
  }, []);

  const search = keyword.trim().toLowerCase();

  const hit = (note: NoteSummary): boolean =>
    search === "" ||
    noteTitleOf(note).toLowerCase().includes(search) ||
    note.preview.toLowerCase().includes(search);

  const visible = search === "" ? tree.notes : tree.notes.filter(hit);

  const pick = (workspaceId: string | null): readonly NoteSummary[] =>
    search === "" ? notesOf(tree.notes, workspaceId) : visible.filter((n) => n.workspaceId === workspaceId);

  const favorites: Row = {
    key: "favorites",
    name: "즐겨찾기",
    workspaceId: null,
    notes: visible.filter((n) => n.favorite),
    canRename: false,
  };

  const personal: Row = {
    key: "mine",
    name: "내 메모",
    workspaceId: null,
    notes: pick(null),
    canRename: false,
  };

  const toRow = (workspace: (typeof tree.workspaces)[number]): Row => ({
    key: workspace.id,
    name: workspace.name,
    workspaceId: workspace.id,
    notes: pick(workspace.id),
    canRename: workspace.canManage || (workspace.kind === "division" && tree.canManageWorkspaces),
  });

  const group: readonly Row[] = tree.workspaces
    .filter((w) => w.kind === "division")
    .map(toRow);

  const invited: readonly Row[] = tree.workspaces
    .filter((w) => w.kind === "private")
    .map(toRow);

  const onNoteRoute = router.pathname === "/notes";

  const openNote = (id: string) =>
    void router.push({ pathname: "/notes", query: { id } });

  const goWorkspace = (ws: string) =>
    void router.push({ pathname: "/notes", query: { ws } });

  const handleAddWorkspace = async () => {
    const name = window.prompt("새 파트 공용 워크스페이스 이름을 적어주세요.");

    if (name === null || name.trim() === "") return;

    const message = await createWorkspace(name.trim());

    if (message !== "") onNotice(message);
  };

  const handleAddPrivate = async () => {
    const name = window.prompt(
      "초대한 사람만 보는 워크스페이스입니다.\n이름을 적어주세요.",
    );

    if (name === null || name.trim() === "") return;

    const message = await createWorkspace(name.trim(), "private");

    if (message !== "") onNotice(message);
  };

  const handleRename = async (id: string, current: string) => {
    const name = window.prompt("워크스페이스 이름을 바꿉니다.", current);

    if (name === null || name.trim() === "" || name.trim() === current) return;

    const message = await renameWorkspace(id, name.trim());

    if (message !== "") onNotice(message);
  };

  const handleRemoveWorkspace = async (id: string, name: string) => {
    if (!window.confirm(`'${name}' 워크스페이스를 지웁니다.`)) return;

    const message = await deleteWorkspace(id);

    if (message !== "") onNotice(message);
  };

  const handleRemoveNote = async (note: NoteSummary) => {
    const kids = childrenOf(tree.notes, note.id).length;

    const extra = kids === 0 ? "" : `\n하위 페이지 ${kids}건도 함께 갑니다.`;

    if (
      !window.confirm(
        `'${noteTitleOf(note)}' 을(를) 휴지통으로 보냅니다.${extra}\n${tree.trashDays}일 안에는 되살릴 수 있습니다.`,
      )
    ) {
      return;
    }

    const message = await deleteNote(note.id);

    if (message !== "") onNotice(message);
  };

  const shared = {
    all: visible,
    selectedId,
    onNoteRoute,
    onToggle: toggleFolder,
    activeWorkspace:
      onNoteRoute && typeof router.query.ws === "string" ? router.query.ws : null,
    onOpenWorkspace: (workspaceId: string | null) =>
      goWorkspace(workspaceId ?? MY_NOTES),
    onOpenNote: openNote,
    onAddNote: (workspaceId: string | null) => void createNote(workspaceId),
    onRename: (id: string, name: string) => void handleRename(id, name),
    onRemove: (id: string, name: string) => void handleRemoveWorkspace(id, name),
    onRemoveNote: (note: NoteSummary) => void handleRemoveNote(note),
  };

  if (!open) {
    return (
      <div className="mt-2 border-t border-line pt-2">
        <button
          type="button"
          onClick={onRequestOpen}
          title="메모"
          aria-label="메모"
          className={`flex w-full items-center justify-center rounded-[var(--radius-md)] py-2 transition ${
            onNoteRoute
              ? "bg-primary-600 text-white"
              : "text-secondary hover:bg-row-hover hover:text-body"
          }`}
        >
          <NoteIcon width={18} height={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-line-strong bg-panel">
      <div
        className={`flex items-center gap-1 border-b border-line px-1.5 py-1.5 ${
          onNoteRoute ? "text-primary-600" : "text-secondary"
        }`}
      >
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-label={expanded ? "메모 접기" : "메모 펼치기"}
          className="shrink-0 rounded p-0.5 transition hover:bg-row-hover"
        >
          <ChevronRightIcon
            width={14}
            height={14}
            className={`transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </button>

        <button
          type="button"
          onClick={() => void router.push("/notes")}
          title="메모 홈"
          className="flex min-w-0 flex-1 items-center gap-1 rounded px-1 py-0.5 text-left transition hover:bg-row-hover"
        >
          <NoteIcon width={15} height={15} className="shrink-0" />
          <span className="truncate text-b2_body_m font-semibold">메모</span>
        </button>
      </div>

      {expanded ? (
        <div className="border-b border-line px-1.5 py-1.5">
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.currentTarget.value)}
            placeholder="메모 검색"
            aria-label="메모 검색"
            className="input input-sm w-full"
          />
        </div>
      ) : null}

      {expanded ? (
        <div className="min-h-0 flex-1 overflow-y-auto py-1">
          <button
            type="button"
            onClick={() => goWorkspace(MY_NOTES)}
            title="내 워크스페이스 홈"
            className="flex w-full items-center gap-1 rounded px-2 pb-0.5 pt-1 text-left text-bt-text-s font-semibold uppercase tracking-wide text-muted/70 transition hover:bg-row-hover hover:text-body"
          >
            <LockIcon width={13} height={13} />
            개인
          </button>

          {favorites.notes.length === 0 ? null : (
            <div className="mb-1">
              <div className="flex items-center gap-1 px-2 pb-0.5 pt-0.5 text-bt-text-s font-semibold uppercase tracking-wide text-muted/70">
                <StarFilledIcon width={13} height={13} className="text-pending-500" />
                즐겨찾기
              </div>
              {favorites.notes.map((note) => (
                <NoteLine
                  key={`fav-${note.id}`}
                  note={note}
                  depth={0}
                  all={[]}
                  selectedId={selectedId}
                  onNoteRoute={onNoteRoute}
                  onOpenNote={openNote}
                  onRemoveNote={handleRemoveNote}
                />
              ))}
            </div>
          )}

          <Folder row={personal} open={search !== "" || (folders.mine ?? false)} {...shared} />

          <div className="mt-1 flex items-center gap-1 px-2 pb-0.5 pt-1.5">
            <button
              type="button"
              onClick={() => goWorkspace(GROUP_NOTES)}
              title="그룹 워크스페이스 홈"
              className="flex min-w-0 flex-1 items-center gap-1 rounded text-left text-bt-text-s font-semibold uppercase tracking-wide text-muted/70 transition hover:bg-row-hover hover:text-body"
            >
              <UserIcon width={13} height={13} />
              <span className="truncate">그룹 워크스페이스</span>
            </button>
            {tree.canManageWorkspaces ? (
              <button
                type="button"
                onClick={() => void handleAddWorkspace()}
                title="그룹 워크스페이스 만들기"
                aria-label="워크스페이스 만들기"
                className="rounded p-0.5 text-muted transition hover:bg-row-hover hover:text-body"
              >
                <PlusIcon width={13} height={13} />
              </button>
            ) : null}
          </div>

          {group.length === 0 ? (
            <p className="px-2 py-1 pl-4 text-bt-text-s text-muted/70">
              {tree.canManageWorkspaces ? "+ 로 만들어 주세요" : "아직 없습니다"}
            </p>
          ) : (
            group.map((row) => (
              <Folder
                key={row.key}
                row={row}
                open={search !== "" || (folders[row.key] ?? false)}
                {...shared}
              />
            ))
          )}

          <div className="mt-1 flex items-center gap-1 px-2 pb-0.5 pt-1.5">
            <UsersIcon width={13} height={13} className="text-muted/70" />
            <span className="min-w-0 flex-1 truncate text-bt-text-s font-semibold uppercase tracking-wide text-muted/70">
              초대받은 워크스페이스
            </span>
            <button
              type="button"
              onClick={() => void handleAddPrivate()}
              title="초대형 워크스페이스 만들기"
              aria-label="초대형 워크스페이스 만들기"
              className="rounded p-0.5 text-muted transition hover:bg-row-hover hover:text-body"
            >
              <PlusIcon width={13} height={13} />
            </button>
          </div>

          {invited.length === 0 ? (
            <p className="px-2 py-1 pl-4 text-bt-text-s text-muted/70">+ 로 만들어 주세요</p>
          ) : (
            invited.map((row) => (
              <Folder
                key={row.key}
                row={row}
                open={search !== "" || (folders[row.key] ?? false)}
                {...shared}
              />
            ))
          )}

          {tree.trash.length === 0 ? null : (
            <button
              type="button"
              onClick={() => goWorkspace(TRASH)}
              title="휴지통"
              className={`mt-2 flex w-full items-center gap-1 rounded px-2 py-1.5 text-left text-bt-text-s font-semibold uppercase tracking-wide transition hover:bg-row-hover hover:text-body ${
                router.query.ws === TRASH ? "text-primary-600" : "text-muted/70"
              }`}
            >
              <TrashIcon width={13} height={13} />
              휴지통
              <span className="ml-auto font-normal">{tree.trash.length}</span>
            </button>
          )}

        </div>
      ) : null}
    </div>
  );
}
