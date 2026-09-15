export type WorkspaceKind = "division" | "private";

export type WorkspaceMember = {
  readonly id: string;
  readonly loginId: string;
  readonly name: string;
  readonly divisionId: string;
};

export type Workspace = {
  readonly id: string;
  readonly name: string;
  readonly kind: WorkspaceKind;
  readonly divisionId: string;
  readonly ownerId: string | null;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly noteCount: number;
  readonly members: readonly WorkspaceMember[];
  readonly canManage: boolean;
};

export type NoteSummary = {
  readonly id: string;
  readonly title: string;
  readonly preview: string;
  readonly ownerLoginId: string;
  readonly ownerName: string;
  readonly divisionId: string;
  readonly workspaceId: string | null;
  readonly parentId: string | null;
  readonly mine: boolean;
  readonly locked: boolean;
  readonly favorite: boolean;
  readonly deletedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

export type LinkedServer = {
  readonly id: string;
  readonly ip: string;
  readonly nameKo: string;
  readonly statusDisplay: string;
};

export type MentionedPerson = {
  readonly id: string;
  readonly loginId: string;
  readonly name: string;
  readonly divisionId: string;
};

export type Note = NoteSummary & {
  readonly content: unknown;
  readonly blockAuthors: Record<string, { name: string; at: string }>;
  readonly servers: readonly LinkedServer[];
  readonly people: readonly MentionedPerson[];
};

export type NoteRevision = {
  readonly id: string;
  readonly title: string;
  readonly preview: string;
  readonly editedBy: string;
  readonly editedAt: string;
};

export type TemplateId = "todo" | "notice";

export const TEMPLATE_LABEL: Record<TemplateId, string> = {
  todo: "오늘 할 일",
  notice: "공지사항",
};

export type NoteTree = {
  readonly workspaces: readonly Workspace[];
  readonly notes: readonly NoteSummary[];
  readonly trash: readonly NoteSummary[];
  readonly canManageWorkspaces: boolean;
  readonly trashDays: number;
};

export const TRASH = "trash";
export const INVITED = "invited";
export const FAVORITES = "favorites";

export type NoteDraft = {
  readonly title: string;
  readonly content: unknown;
  readonly workspaceId: string | null;
};

export const MY_NOTES = "mine";
export const GROUP_NOTES = "group";

export function trailOf(
  notes: readonly NoteSummary[],
  noteId: string,
): readonly NoteSummary[] {
  const trail: NoteSummary[] = [];

  let current = notes.find((note) => note.id === noteId);

  while (current !== undefined && trail.length < 12) {
    trail.unshift(current);

    const parentId = current.parentId;

    current = parentId === null ? undefined : notes.find((note) => note.id === parentId);
  }

  return trail;
}

export const EMPTY_CONTENT: unknown[] = [
  { id: "start", type: "paragraph", content: [], children: [] },
];

export function noteTitleOf(note: { title: string }): string {
  return note.title.trim() === "" ? "제목 없음" : note.title;
}

export function notesOf(
  notes: readonly NoteSummary[],
  workspaceId: string | null,
): readonly NoteSummary[] {
  return notes.filter(
    (note) => note.workspaceId === workspaceId && note.parentId === null,
  );
}

export function childrenOf(
  notes: readonly NoteSummary[],
  parentId: string,
): readonly NoteSummary[] {
  return notes.filter((note) => note.parentId === parentId);
}
