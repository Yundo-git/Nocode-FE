import Head from "next/head";
import { useCallback, useRef, useState } from "react";
import { PageHeader, type Crumb } from "@/components/ui/PageHeader";
import { Toast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { NoteHome } from "@/components/notes/NoteHome";
import { WorkspaceHome } from "@/components/notes/WorkspaceHome";
import { TrashHome } from "@/components/notes/TrashHome";
import { NotePanel } from "@/components/notes/NotePanel";
import { useAuth } from "@/lib/auth";
import { useNotes } from "@/lib/notes/NotesProvider";
import {
  GROUP_NOTES,
  MY_NOTES,
  TRASH,
  childrenOf,
  noteTitleOf,
  trailOf,
  type NoteSummary,
} from "@/lib/notes/types";
import { useRouter } from "next/router";

export default function NotesPage() {
  const router = useRouter();
  const { account } = useAuth();
  const {
    tree,
    note,
    saveState,
    error,
    saveNote,
    createNote,
    createChild,
    createWorkspace,
    inviteMember,
    expelMember,
    setFavorite,
    setLocked,
    restoreNote,
    purgeNote,
    deleteNote,
    loadRevisions,
    revertTo,
  } = useNotes();

  const [notice, setNotice] = useState("");
  const [purgeTarget, setPurgeTarget] = useState<NoteSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NoteSummary | null>(null);

  const draftRef = useRef<{ title: string; workspaceId: string | null; content: unknown } | null>(
    null,
  );

  const openedId = useRef<string | null>(null);

  if (note !== null && openedId.current !== note.id) {
    openedId.current = note.id;
    draftRef.current = null;
  }

  const push = useCallback(
    (
      next: Partial<{ title: string; workspaceId: string | null; content: unknown }>,
      immediate = false,
    ) => {
      if (note === null) return;

      const base = draftRef.current ?? {
        title: note.title,
        workspaceId: note.workspaceId,
        content: note.content,
      };

      const merged = { ...base, ...next };

      draftRef.current = merged;

      saveNote(merged, immediate);
    },
    [note, saveNote],
  );

  const ws =
    typeof router.query.ws === "string" && router.query.ws !== "" ? router.query.ws : null;

  const handleAddWorkspace = async () => {
    const name = window.prompt("새 그룹 워크스페이스 이름을 적어주세요.");

    if (name === null || name.trim() === "") return;

    const message = await createWorkspace(name.trim());

    if (message !== "") setNotice(message);
  };

  const pageTitle =
    note !== null
      ? noteTitleOf(note)
      : ws === MY_NOTES
        ? "내 워크스페이스"
        : ws === GROUP_NOTES
          ? "그룹 워크스페이스"
          : ws === TRASH
            ? "휴지통"
          : ws !== null
            ? (tree.workspaces.find((w) => w.id === ws)?.name ?? "워크스페이스")
            : "메모";

  const crumbs: Crumb[] = ["업무", { label: "메모", href: "/notes" }];

  if (note !== null) {
    const trail = trailOf(tree.notes, note.id);
    const home = trail[0] ?? note;

    if (home.workspaceId === null) {
      crumbs.push({ label: "내 워크스페이스", href: `/notes?ws=${MY_NOTES}` });
    } else {
      const ws = tree.workspaces.find((w) => w.id === home.workspaceId);

      if (ws?.kind === "private") {
        crumbs.push("초대받은 워크스페이스");
      } else {
        crumbs.push({ label: "그룹 워크스페이스", href: `/notes?ws=${GROUP_NOTES}` });
      }

      crumbs.push({
        label: ws?.name ?? "워크스페이스",
        href: `/notes?ws=${home.workspaceId}`,
      });
    }

    for (const step of trail) {
      crumbs.push(
        step.id === note.id
          ? noteTitleOf(step)
          : { label: noteTitleOf(step), href: `/notes?id=${step.id}` },
      );
    }
  } else if (ws === MY_NOTES) {
    crumbs.push("내 워크스페이스");
  } else if (ws === GROUP_NOTES) {
    crumbs.push("그룹 워크스페이스");
  } else if (ws === TRASH) {
    crumbs.push("휴지통");
  } else if (ws !== null) {
    const found = tree.workspaces.find((w) => w.id === ws);

    if (found?.kind === "private") {
      crumbs.push("초대받은 워크스페이스");
    } else {
      crumbs.push({ label: "그룹 워크스페이스", href: `/notes?ws=${GROUP_NOTES}` });
    }

    crumbs.push(found?.name ?? "워크스페이스");
  }

  return (
    <>
      <Head>
        <title>{note === null ? "메모" : noteTitleOf(note)} | PingCheck</title>
      </Head>

      <Toast message={notice} tone="error" onDone={() => setNotice("")} />

      <ConfirmModal
        open={deleteTarget !== null}
        title="메모 삭제"
        message={
          deleteTarget === null
            ? ""
            : `'${noteTitleOf(deleteTarget)}' 을(를) 휴지통으로 보냅니다.${
                childrenOf(tree.notes, deleteTarget.id).length === 0
                  ? ""
                  : `\n하위 페이지 ${childrenOf(tree.notes, deleteTarget.id).length}건도 함께 갑니다.`
              }\n${tree.trashDays}일 안에는 되살릴 수 있습니다.`
        }
        confirmLabel="휴지통으로"
        onConfirm={() => {
          const target = deleteTarget;

          setDeleteTarget(null);

          if (target !== null) {
            void deleteNote(target.id).then((m) => {
              if (m !== "") setNotice(m);
            });
          }
        }}
        onClose={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        open={purgeTarget !== null}
        title="완전삭제"
        message={
          purgeTarget === null
            ? ""
            : `'${noteTitleOf(purgeTarget)}' 을(를) 완전히 지웁니다.\n되돌릴 수 없습니다.`
        }
        confirmLabel="완전삭제"
        onConfirm={() => {
          const target = purgeTarget;

          setPurgeTarget(null);

          if (target !== null) {
            void purgeNote(target.id).then((m) => {
              if (m !== "") setNotice(m);
            });
          }
        }}
        onClose={() => setPurgeTarget(null)}
      />

      <div className="flex h-full min-h-0 flex-col gap-4 px-6 py-4">
        <PageHeader breadcrumb={crumbs} title={pageTitle} />

        {error === "" ? null : (
          <p className="panel px-4 py-2.5 text-b2_body_r text-down-500">{error}</p>
        )}

        {note !== null ? (
          <NotePanel
            note={note}
            workspaces={tree.workspaces}
            saveState={saveState}
            onTitleChange={(title) => push({ title })}
            onWorkspaceChange={(workspaceId) => push({ workspaceId }, true)}
            onContentChange={(content) => push({ content })}
            onCreateChild={(title, template) => createChild(note.id, title, template)}
            onNotice={setNotice}
            onFavorite={(on) => void setFavorite(note.id, on)}
            onLock={(locked) =>
              void setLocked(note.id, locked).then((m) => {
                if (m !== "") setNotice(m);
              })
            }
            onLoadRevisions={loadRevisions}
            onRevert={(revisionId) => revertTo(note.id, revisionId)}
          />
        ) : ws === TRASH ? (
          <TrashHome
            tree={tree}
            onRestore={(row) =>
              void restoreNote(row.id).then((m) => {
                if (m !== "") setNotice(m);
              })
            }
            onPurge={(row) => setPurgeTarget(row)}
          />
        ) : ws !== null ? (
          <WorkspaceHome
            tree={tree}
            groupOverview={ws === GROUP_NOTES}
            workspace={
              ws === MY_NOTES || ws === GROUP_NOTES
                ? null
                : (tree.workspaces.find((w) => w.id === ws) ?? null)
            }
            onCreate={(workspaceId, template) => void createNote(workspaceId, template)}
            onAddWorkspace={() => void handleAddWorkspace()}
            onDelete={setDeleteTarget}
            myId={account?.id ?? ""}
            onInvite={(wsId, accountId) =>
              void inviteMember(wsId, accountId).then((m) => {
                if (m !== "") setNotice(m);
              })
            }
            onExpel={(wsId, accountId) =>
              void expelMember(wsId, accountId).then((m) => {
                if (m !== "") setNotice(m);
              })
            }
          />
        ) : (
          <NoteHome
            tree={tree}
            divisionId={account?.divisionId ?? ""}
            onCreate={(workspaceId, template) => void createNote(workspaceId, template)}
            onAddWorkspace={() => void handleAddWorkspace()}
            onDelete={setDeleteTarget}
          />
        )}
      </div>
    </>
  );
}
