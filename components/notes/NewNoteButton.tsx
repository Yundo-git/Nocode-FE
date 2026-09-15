import { useEffect, useRef, useState } from "react";
import { NoteIcon, PlusIcon } from "@/components/ui/icons";
import { TEMPLATE_LABEL, type TemplateId } from "@/lib/notes/types";

const TEMPLATES: readonly { id: TemplateId; hint: string }[] = [
  { id: "todo", hint: "체크박스로 오늘 할 일을 적습니다" },
  { id: "notice", hint: "파트에 알릴 내용을 적습니다" },
];

type NewNoteButtonProps = {
  onCreate: (template?: TemplateId) => void;
};

export function NewNoteButton({ onCreate }: NewNoteButtonProps) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const close = (event: MouseEvent) => {
      if (boxRef.current !== null && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);

    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={boxRef} className="relative">
      <div className="flex">
        <button
          type="button"
          onClick={() => onCreate()}
          className="btn btn-primary btn-md rounded-r-none"
        >
          <PlusIcon width={16} height={16} />새 메모
        </button>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="서식 고르기"
          aria-expanded={open}
          className="btn btn-primary btn-md rounded-l-none border-l border-white/25 px-2"
        >
          <span aria-hidden>▾</span>
        </button>
      </div>

      {open ? (
        <div className="panel absolute right-0 top-[calc(100%+4px)] z-20 w-[240px] p-1 shadow-soft">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onCreate();
            }}
            className="flex w-full items-start gap-2 rounded-[var(--radius-md)] px-2 py-2 text-left transition hover:bg-row-hover"
          >
            <NoteIcon width={15} height={15} className="mt-0.5 shrink-0 text-muted" />
            <span>
              <span className="block text-b2_body_r text-body">빈 메모</span>
              <span className="block text-bt-text-s text-muted/70">처음부터 씁니다</span>
            </span>
          </button>

          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                setOpen(false);
                onCreate(template.id);
              }}
              className="flex w-full items-start gap-2 rounded-[var(--radius-md)] px-2 py-2 text-left transition hover:bg-row-hover"
            >
              <NoteIcon width={15} height={15} className="mt-0.5 shrink-0 text-primary-600" />
              <span>
                <span className="block text-b2_body_r text-body">
                  {TEMPLATE_LABEL[template.id]}
                </span>
                <span className="block text-bt-text-s text-muted/70">{template.hint}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
