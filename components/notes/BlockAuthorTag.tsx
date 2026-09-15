import { useEffect, useState } from "react";

export type BlockAuthors = Record<string, { name: string; at: string }>;

type BlockAuthorTagProps = {
  editor: { onSelectionChange: (fn: () => void) => () => void;
            getTextCursorPosition: () => { block: { id: string } } };
  authors: BlockAuthors;
  containerRef: { current: HTMLDivElement | null };
};

export function BlockAuthorTag({ editor, authors, containerRef }: BlockAuthorTagProps) {
  const [spot, setSpot] = useState<{ top: number; name: string } | null>(null);

  useEffect(() => {
    const update = () => {
      const box = containerRef.current;

      if (box === null) {
        setSpot(null);
        return;
      }

      let blockId = "";

      try {
        blockId = editor.getTextCursorPosition().block.id;
      } catch {
        setSpot(null);
        return;
      }

      const found = authors[blockId];

      if (found === undefined) {
        setSpot(null);
        return;
      }

      const node = box.querySelector(`[data-id="${blockId}"]`);

      if (node === null) {
        setSpot(null);
        return;
      }

      const top =
        node.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;

      setSpot({ top, name: found.name });
    };

    update();

    return editor.onSelectionChange(update);
  }, [authors, containerRef, editor]);

  if (spot === null) return null;

  return (
    <span
      aria-hidden
      style={{ top: `${spot.top}px` }}
      className="pointer-events-none absolute right-2 z-10 select-none text-bt-text-s italic text-muted/50"
    >
      @{spot.name}
    </span>
  );
}
