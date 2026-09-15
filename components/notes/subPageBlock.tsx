import { useRouter } from "next/router";
import { createReactBlockSpec } from "@blocknote/react";
import { NoteIcon } from "@/components/ui/icons";
import { useNotes } from "@/lib/notes/NotesProvider";
import { noteTitleOf } from "@/lib/notes/types";

function SubPageLink({ noteId }: { noteId: string }) {
  const router = useRouter();
  const { tree } = useNotes();

  const found = tree.notes.find((note) => note.id === noteId);

  if (noteId === "") {
    return <span className="text-b2_body_r text-muted">페이지를 만드는 중입니다…</span>;
  }

  if (found === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 text-b2_body_r text-muted line-through">
        <NoteIcon width={16} height={16} />
        지워진 페이지
      </span>
    );
  }

  return (
    <button
      type="button"
      contentEditable={false}
      onClick={() => void router.push({ pathname: "/notes", query: { id: noteId } })}
      className="inline-flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left transition hover:bg-row-hover"
    >
      <NoteIcon width={16} height={16} className="shrink-0 text-muted" />
      <span className="truncate border-b border-line-strong text-b2_body_r font-medium text-body">
        {noteTitleOf(found)}
      </span>
    </button>
  );
}

export const subPageBlock = createReactBlockSpec(
  {
    type: "subpage",
    propSchema: { noteId: { default: "" } },
    content: "none",
  },
  {
    render: (props) => <SubPageLink noteId={props.block.props.noteId} />,
  },
);
