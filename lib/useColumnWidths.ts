import { useCallback, useEffect, useRef, useState } from "react";

const MIN_WIDTH = 60;

export type ColumnWidths = Record<string, number>;

export function useColumnWidths(
  storageKey: string,
  defaults: ColumnWidths,
): {
  widths: ColumnWidths;
  startResize: (key: string, event: React.PointerEvent) => void;
  reset: () => void;
  changed: boolean;
} {
  const [widths, setWidths] = useState<ColumnWidths>(defaults);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);

      if (!raw) return;

      const parsed: unknown = JSON.parse(raw);

      if (typeof parsed !== "object" || parsed === null) return;

      const next: ColumnWidths = { ...defaults };
      let any = false;

      for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
        if (key in defaults && typeof value === "number" && value >= MIN_WIDTH) {
          next[key] = value;
          any = true;
        }
      }

      if (any) {
        setWidths(next);
        setChanged(true);
      }
    } catch {
    }
  }, [storageKey, defaults]);

  const save = useCallback(
    (next: ColumnWidths) => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
      }
    },
    [storageKey],
  );

  const dragRef = useRef<{ key: string; startX: number; startWidth: number } | null>(
    null,
  );

  const startResize = useCallback(
    (key: string, event: React.PointerEvent) => {
      event.preventDefault();

      dragRef.current = {
        key,
        startX: event.clientX,
        startWidth: widths[key] ?? defaults[key] ?? MIN_WIDTH,
      };

      const handleMove = (moveEvent: PointerEvent) => {
        const drag = dragRef.current;

        if (drag === null) return;

        const next = Math.max(
          MIN_WIDTH,
          drag.startWidth + (moveEvent.clientX - drag.startX),
        );

        setWidths((prev) => ({ ...prev, [drag.key]: next }));
        setChanged(true);
      };

      const handleUp = () => {
        dragRef.current = null;

        document.removeEventListener("pointermove", handleMove);
        document.removeEventListener("pointerup", handleUp);
        document.body.style.removeProperty("cursor");
        document.body.style.removeProperty("user-select");

        setWidths((prev) => {
          save(prev);
          return prev;
        });
      };

      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
      document.body.style.setProperty("cursor", "col-resize");
      document.body.style.setProperty("user-select", "none");
    },
    [widths, defaults, save],
  );

  const reset = useCallback(() => {
    setWidths(defaults);
    setChanged(false);

    try {
      window.localStorage.removeItem(storageKey);
    } catch {
    }
  }, [defaults, storageKey]);

  return { widths, startResize, reset, changed };
}
