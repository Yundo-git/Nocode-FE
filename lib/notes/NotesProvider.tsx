import { useRouter } from "next/router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import {
  EMPTY_CONTENT,
  type Note,
  type NoteDraft,
  type NoteRevision,
  type NoteTree,
  type TemplateId,
  type Workspace,
  type WorkspaceKind,
} from "@/lib/notes/types";

export type SaveState = "idle" | "saving" | "saved" | "error";

const EMPTY_TREE: NoteTree = {
  workspaces: [],
  notes: [],
  trash: [],
  canManageWorkspaces: false,
  trashDays: 30,
};

type NotesValue = {
  readonly tree: NoteTree;
  readonly note: Note | null;
  readonly selectedId: string | null;
  readonly saveState: SaveState;
  readonly error: string;
  readonly refresh: () => Promise<void>;
  readonly createNote: (workspaceId: string | null, template?: TemplateId) => Promise<void>;
  readonly setFavorite: (id: string, on: boolean) => Promise<void>;
  readonly setLocked: (id: string, locked: boolean) => Promise<string>;
  readonly restoreNote: (id: string) => Promise<string>;
  readonly purgeNote: (id: string) => Promise<string>;
  readonly loadRevisions: (id: string) => Promise<readonly NoteRevision[]>;
  readonly revertTo: (id: string, revisionId: string) => Promise<string>;
  readonly createChild: (
    parentId: string,
    title: string,
    template?: TemplateId,
  ) => Promise<string>;
  readonly saveNote: (draft: NoteDraft, immediate?: boolean) => void;
  readonly deleteNote: (id: string) => Promise<string>;
  readonly createWorkspace: (name: string, kind?: WorkspaceKind) => Promise<string>;
  readonly inviteMember: (id: string, accountId: string) => Promise<string>;
  readonly expelMember: (id: string, accountId: string) => Promise<string>;
  readonly renameWorkspace: (id: string, name: string) => Promise<string>;
  readonly deleteWorkspace: (id: string) => Promise<string>;
};

const NotesContext = createContext<NotesValue | null>(null);

export function useNotes(): NotesValue {
  const found = useContext(NotesContext);

  if (found === null) throw new Error("NotesProvider 안에서만 쓸 수 있습니다.");

  return found;
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const { account } = useAuth();
  const router = useRouter();

  const pending = useRef<number | null>(null);
  const gone = useRef<Set<string>>(new Set());
  const viewing = useRef<string | null>(null);

  const [tree, setTree] = useState<NoteTree>(EMPTY_TREE);
  const [note, setNote] = useState<Note | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState("");

  const selectedId =
    typeof router.query.id === "string" && router.query.id !== "" ? router.query.id : null;

  viewing.current = selectedId;

  const refresh = useCallback(async () => {
    if (account === null) {
      setTree(EMPTY_TREE);
      return;
    }

    const res = await api.get<NoteTree>("/notes", { background: true });

    if (!res.ok) {
      setError(res.message);
      return;
    }

    setError("");
    setTree(res.data);
  }, [account]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setError("");

    if (selectedId === null) {
      setNote(null);
      setSaveState("idle");
      return;
    }

    let alive = true;

    setSaveState("idle");

    void api.get<Note>(`/notes/${selectedId}`).then((res) => {
      if (!alive) return;

      if (!res.ok) {
        setError(res.message);
        setNote(null);
        return;
      }

      setError("");
      setNote(res.data);
    });

    return () => {
      alive = false;
    };
  }, [selectedId]);

  const openNote = useCallback(
    async (id: string) => {
      await router.push({ pathname: "/notes", query: { id } }, undefined, {
        shallow: router.pathname === "/notes",
      });
    },
    [router],
  );

  const createNote = useCallback(
    async (workspaceId: string | null, template?: TemplateId) => {
      const res = await api.post<Note>("/notes", {
        title: "",
        workspaceId,
        content: EMPTY_CONTENT,
        ...(template === undefined ? {} : { template }),
      });

      if (!res.ok) {
        setError(res.message);
        return;
      }

      setError("");
      setNote(res.data);
      await refresh();
      await openNote(res.data.id);
    },
    [openNote, refresh],
  );

  const createChild = useCallback(
    async (parentId: string, title: string, template?: TemplateId): Promise<string> => {
      const res = await api.post<Note>(`/notes/${parentId}/children`, {
        title,
        ...(template === undefined ? {} : { template }),
      });

      if (!res.ok) {
        setError(res.message);
        return "";
      }

      setError("");
      await refresh();

      return res.data.id;
    },
    [refresh],
  );

  const saveNote = useCallback(
    (draft: NoteDraft, immediate = false) => {
      const id = note?.id;

      if (id === undefined) return;

      if (pending.current !== null) window.clearTimeout(pending.current);

      const run = async () => {
        if (gone.current.has(id)) return;

        setSaveState("saving");

        const res = await api.put<Note>(`/notes/${id}`, draft);

        if (gone.current.has(id)) return;

        const stillHere = viewing.current === id;

        if (!res.ok) {
          if (stillHere) {
            setSaveState("error");
            setError(res.message);
          }

          return;
        }

        if (stillHere) {
          setError("");
          setSaveState("saved");
          setNote(res.data);
        }

        await refresh();
      };

      if (immediate) {
        void run();
        return;
      }

      pending.current = window.setTimeout(() => void run(), 700);
    },
    [note?.id, refresh],
  );

  const deleteNote = useCallback(
    async (id: string): Promise<string> => {
      if (pending.current !== null) {
        window.clearTimeout(pending.current);
        pending.current = null;
      }

      gone.current.add(id);

      const res = await api.remove<null>(`/notes/${id}`);

      if (!res.ok) {
        gone.current.delete(id);
        return res.message;
      }

      if (selectedId === id) await router.push("/notes");

      await refresh();

      return "";
    },
    [refresh, router, selectedId],
  );

  const setFavorite = useCallback(
    async (id: string, on: boolean) => {
      await api.post(`/notes/${id}/favorite`, { on });
      await refresh();
    },
    [refresh],
  );

  const setLocked = useCallback(
    async (id: string, locked: boolean): Promise<string> => {
      const res = await api.post<Note>(`/notes/${id}/lock`, { locked });

      if (!res.ok) return res.message;

      if (viewing.current === id) setNote(res.data);

      await refresh();

      return "";
    },
    [refresh],
  );

  const restoreNote = useCallback(
    async (id: string): Promise<string> => {
      const res = await api.post<null>(`/notes/${id}/restore`, {});

      if (!res.ok) return res.message;

      gone.current.delete(id);
      await refresh();

      return "";
    },
    [refresh],
  );

  const purgeNote = useCallback(
    async (id: string): Promise<string> => {
      const res = await api.remove<null>(`/notes/${id}/purge`);

      if (!res.ok) return res.message;

      await refresh();

      return "";
    },
    [refresh],
  );

  const loadRevisions = useCallback(async (id: string): Promise<readonly NoteRevision[]> => {
    const res = await api.get<{ rows: readonly NoteRevision[] }>(`/notes/${id}/revisions`);

    return res.ok ? res.data.rows : [];
  }, []);

  const revertTo = useCallback(
    async (id: string, revisionId: string): Promise<string> => {
      const res = await api.post<Note>(`/notes/${id}/revisions/${revisionId}`, {});

      if (!res.ok) return res.message;

      if (viewing.current === id) setNote(res.data);

      await refresh();

      return "";
    },
    [refresh],
  );

  const createWorkspace = useCallback(
    async (name: string, kind: WorkspaceKind = "division"): Promise<string> => {
      const res = await api.post<Workspace>("/notes/workspaces", { name, kind });

      if (!res.ok) return res.message;

      await refresh();

      return "";
    },
    [refresh],
  );

  const inviteMember = useCallback(
    async (id: string, accountId: string): Promise<string> => {
      const res = await api.post<Workspace>(`/notes/workspaces/${id}/members`, {
        accountId,
      });

      if (!res.ok) return res.message;

      await refresh();

      return "";
    },
    [refresh],
  );

  const expelMember = useCallback(
    async (id: string, accountId: string): Promise<string> => {
      const res = await api.remove<Workspace>(
        `/notes/workspaces/${id}/members/${accountId}`,
      );

      if (!res.ok) return res.message;

      await refresh();

      return "";
    },
    [refresh],
  );

  const renameWorkspace = useCallback(
    async (id: string, name: string): Promise<string> => {
      const res = await api.put<Workspace>(`/notes/workspaces/${id}`, { name });

      if (!res.ok) return res.message;

      await refresh();

      return "";
    },
    [refresh],
  );

  const deleteWorkspace = useCallback(
    async (id: string): Promise<string> => {
      const res = await api.remove<null>(`/notes/workspaces/${id}`);

      if (!res.ok) return res.message;

      await refresh();

      return "";
    },
    [refresh],
  );

  useEffect(() => {
    return () => {
      if (pending.current !== null) window.clearTimeout(pending.current);
    };
  }, []);

  return (
    <NotesContext.Provider
      value={{
        tree,
        note,
        selectedId,
        saveState,
        error,
        refresh,
        createNote,
        createChild,
        setFavorite,
        setLocked,
        restoreNote,
        purgeNote,
        loadRevisions,
        revertTo,
        saveNote,
        deleteNote,
        createWorkspace,
        inviteMember,
        expelMember,
        renameWorkspace,
        deleteWorkspace,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}
