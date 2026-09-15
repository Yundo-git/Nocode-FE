import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ClockIcon,
  DownloadIcon,
  FolderIcon,
  LockIcon,
  ServerLinkIcon,
  StarFilledIcon,
  StarIcon,
  UnlockIcon,
  UploadIcon,
  UserIcon,
} from "@/components/ui/icons";
import { RevisionModal } from "@/components/notes/RevisionModal";
import type { NoteRevision, TemplateId } from "@/lib/notes/types";
import type { EditorActions } from "@/components/notes/NoteEditor";
import { WidthToggle, useNoteWidth } from "@/components/notes/ViewToggle";
import { formatDateTime } from "@/lib/datetime";
import type { SaveState } from "@/lib/notes/NotesProvider";
import type { Note, Workspace } from "@/lib/notes/types";

const NoteEditor = dynamic(() => import("@/components/notes/NoteEditor"), {
  ssr: false,
  loading: () => (
    <div className="px-6 py-10 text-b2_body_r text-muted">편집기를 준비하고 있습니다.</div>
  ),
});

const SAVE_LABEL: Record<SaveState, string> = {
  idle: "",
  saving: "저장 중",
  saved: "저장됨",
  error: "저장 실패",
};

type NotePanelProps = {
  note: Note;
  workspaces: readonly Workspace[];
  saveState: SaveState;
  onTitleChange: (title: string) => void;
  onWorkspaceChange: (workspaceId: string | null) => void;
  onContentChange: (content: unknown) => void;
  onCreateChild: (title: string, template?: TemplateId) => Promise<string>;
  onNotice: (message: string) => void;
  onFavorite: (on: boolean) => void;
  onLock: (locked: boolean) => void;
  onLoadRevisions: (id: string) => Promise<readonly NoteRevision[]>;
  onRevert: (revisionId: string) => Promise<string>;
};

export function NotePanel({
  note,
  workspaces,
  saveState,
  onTitleChange,
  onWorkspaceChange,
  onContentChange,
  onCreateChild,
  onNotice,
  onFavorite,
  onLock,
  onLoadRevisions,
  onRevert,
}: NotePanelProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [title, setTitle] = useState(note.title);

  useEffect(() => {
    setTitle(note.title);
  }, [note.id]);

  const [width, setWidth] = useNoteWidth();

  const actionsRef = useRef<EditorActions | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const download = async () => {
    const text = (await actionsRef.current?.toMarkdown()) ?? "";
    const name = title.trim() === "" ? "제목 없음" : title.trim();

    const url = URL.createObjectURL(
      new Blob(["\ufeff", text], { type: "text/markdown;charset=utf-8" }),
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = `${name.replace(/[\\/:*?"<>|]/g, "_")}.md`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const upload = async (picked: File | undefined) => {
    if (picked === undefined) return;

    if (picked.size > 1_000_000) {
      onNotice("1MB 이하 파일만 불러올 수 있습니다.");
      return;
    }

    setBusy(true);

    try {
      const text = await picked.text();

      if (/[\u0000-\u0008\u000e-\u001f]/.test(text.slice(0, 4000))) {
        onNotice("글자 파일이 아닙니다. 마크다운(.md) 파일을 골라 주세요.");
        setBusy(false);
        return;
      }

      await actionsRef.current?.fromMarkdown(text);
    } catch {
      onNotice("파일을 읽지 못했습니다.");
    }

    setBusy(false);
  };
  return (
    <div
      className={`panel flex h-full min-h-0 flex-col ${
        width === "narrow" ? "mx-auto w-full max-w-[920px]" : "flex-1"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-2.5">
        <input
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.currentTarget.value);
            onTitleChange(event.currentTarget.value);
          }}
          placeholder="제목을 입력해주세요"
          aria-label="메모 제목"
          maxLength={200}
          className="min-w-0 flex-1 border-0 bg-transparent px-0 text-s2 font-semibold text-body outline-none placeholder:text-muted/60"
        />

        <span
          aria-live="polite"
          className={`text-d-label ${saveState === "error" ? "text-down-500" : "text-muted"}`}
        >
          {SAVE_LABEL[saveState]}
        </span>

        <button
          type="button"
          onClick={() => onFavorite(!note.favorite)}
          title={note.favorite ? "즐겨찾기 빼기" : "즐겨찾기"}
          aria-label={note.favorite ? "즐겨찾기 빼기" : "즐겨찾기"}
          className={`shrink-0 rounded p-1.5 transition hover:bg-row-hover ${
            note.favorite ? "text-pending-500" : "text-muted hover:text-body"
          }`}
        >
          {note.favorite ? (
            <StarFilledIcon width={16} height={16} />
          ) : (
            <StarIcon width={16} height={16} />
          )}
        </button>

        <button
          type="button"
          onClick={() => onLock(!note.locked)}
          title={note.locked ? "잠금 풀기" : "잠가서 못 고치게 하기"}
          aria-label={note.locked ? "잠금 풀기" : "잠그기"}
          className={`shrink-0 rounded p-1.5 transition hover:bg-row-hover ${
            note.locked ? "text-down-500" : "text-muted hover:text-body"
          }`}
        >
          {note.locked ? (
            <LockIcon width={16} height={16} />
          ) : (
            <UnlockIcon width={16} height={16} />
          )}
        </button>

        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          title="고친 이력"
          aria-label="고친 이력"
          className="shrink-0 rounded p-1.5 text-muted transition hover:bg-row-hover hover:text-body"
        >
          <ClockIcon width={16} height={16} />
        </button>

        <WidthToggle width={width} onChange={setWidth} />

        <button
          type="button"
          onClick={() => void download()}
          title="이 메모를 마크다운 파일로 내려받습니다"
          className="btn btn-ghost btn-sm shrink-0"
        >
          <DownloadIcon width={14} height={14} />내려받기
        </button>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy || note.locked}
          title="마크다운 파일을 읽어 이 메모에 덮어씁니다"
          className="btn btn-ghost btn-sm shrink-0"
        >
          <UploadIcon width={14} height={14} />불러오기
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".md,.markdown,.txt,text/markdown,text/plain"
          aria-label="마크다운 불러오기"
          hidden
          onChange={(event) => {
            void upload(event.currentTarget.files?.[0]);
            event.currentTarget.value = "";
          }}
        />

        <label className="flex shrink-0 items-center gap-1.5">
          {note.workspaceId === null ? (
            <LockIcon width={15} height={15} className="text-muted" />
          ) : (
            <FolderIcon width={15} height={15} className="text-primary-600" />
          )}
          <select
            value={note.workspaceId ?? ""}
            onChange={(event) =>
              onWorkspaceChange(
                event.currentTarget.value === "" ? null : event.currentTarget.value,
              )
            }
            aria-label="메모 위치"
            className="select select-sm"
          >
            <option value="">내 메모 (나만 보기)</option>
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-4 py-1.5 text-bt-text-s text-muted/80">
        <span>작성 {note.ownerName}</span>
        <span>마지막 수정 {formatDateTime(note.updatedAt)}</span>
        {note.updatedBy === "" ? null : <span>{note.updatedBy}</span>}

        {note.locked ? (
          <span className="flex items-center gap-1 font-semibold text-down-500">
            <LockIcon width={12} height={12} />
            잠김 — 고치려면 잠금을 푸세요
          </span>
        ) : null}

        {note.people.length === 0 ? null : (
          <span className="flex flex-wrap items-center gap-1">
            <UserIcon width={13} height={13} />
            <span>언급된 사람</span>
            {note.people.map((person) => (
              <span
                key={person.id}
                title={person.loginId}
                className="rounded border border-up-500/40 px-1.5 font-semibold text-up-500"
              >
                {person.name}
              </span>
            ))}
          </span>
        )}

        {note.servers.length === 0 ? null : (
          <span className="flex flex-wrap items-center gap-1">
            <ServerLinkIcon width={13} height={13} />
            <span>언급된 장비</span>
            {note.servers.map((server) => (
              <Link
                key={server.id}
                href={`/servers?keyword=${encodeURIComponent(server.ip)}`}
                title={`${server.nameKo} · ${server.ip}`}
                className={`rounded border px-1.5 font-semibold transition hover:bg-row-hover ${
                  server.statusDisplay === "offline"
                    ? "border-down-500/40 text-down-500"
                    : server.statusDisplay === "online"
                      ? "border-up-500/40 text-up-500"
                      : "border-line-strong text-muted"
                }`}
              >
                {server.nameKo === "" ? server.ip : server.nameKo}
              </Link>
            ))}
          </span>
        )}
      </div>

      <RevisionModal
        open={historyOpen}
        noteId={note.id}
        onClose={() => setHistoryOpen(false)}
        onLoad={onLoadRevisions}
        onRevert={onRevert}
        onNotice={onNotice}
      />

      <div className="min-h-0 flex-1 overflow-y-auto py-3">
        <div className="w-full">
          <NoteEditor
          key={note.id}
          noteId={note.id}
          initialContent={note.content}
          onChange={onContentChange}
          onCreateChild={onCreateChild}
            actionsRef={actionsRef}
            editable={!note.locked}
            blockAuthors={note.blockAuthors ?? {}}
            showAuthors={note.workspaceId !== null}
          />
        </div>
      </div>
    </div>
  );
}
