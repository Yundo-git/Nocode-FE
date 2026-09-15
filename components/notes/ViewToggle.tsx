import { useEffect, useState } from "react";
import {
  CardViewIcon,
  ListViewIcon,
  NarrowIcon,
  WideIcon,
} from "@/components/ui/icons";

export type NoteView = "list" | "card";

const KEY = "pingcheck-note-view";

export function useNoteView(): [NoteView, (next: NoteView) => void] {
  const [view, setView] = useState<NoteView>("list");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);

      if (saved === "card" || saved === "list") setView(saved);
    } catch {
    }
  }, []);

  const change = (next: NoteView) => {
    setView(next);

    try {
      window.localStorage.setItem(KEY, next);
    } catch {
    }
  };

  return [view, change];
}

type ViewToggleProps = {
  view: NoteView;
  onChange: (next: NoteView) => void;
};

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  const base =
    "flex h-[var(--control-h-sm)] w-8 items-center justify-center transition";

  return (
    <div
      role="group"
      aria-label="보기 방식"
      className="flex overflow-hidden rounded-[var(--radius-md)] border border-line-strong"
    >
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-pressed={view === "list"}
        title="목록으로 보기"
        className={`${base} ${
          view === "list"
            ? "bg-primary-600 text-white"
            : "bg-panel text-muted hover:bg-row-hover hover:text-body"
        }`}
      >
        <ListViewIcon width={15} height={15} />
      </button>

      <button
        type="button"
        onClick={() => onChange("card")}
        aria-pressed={view === "card"}
        title="카드로 보기"
        className={`${base} border-l border-line-strong ${
          view === "card"
            ? "bg-primary-600 text-white"
            : "bg-panel text-muted hover:bg-row-hover hover:text-body"
        }`}
      >
        <CardViewIcon width={15} height={15} />
      </button>
    </div>
  );
}

export type NoteWidth = "narrow" | "wide";

const WIDTH_KEY = "pingcheck-note-width";

export function useNoteWidth(): [NoteWidth, (next: NoteWidth) => void] {
  const [width, setWidth] = useState<NoteWidth>("narrow");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(WIDTH_KEY);

      if (saved === "narrow" || saved === "wide") setWidth(saved);
    } catch {
    }
  }, []);

  const change = (next: NoteWidth) => {
    setWidth(next);

    try {
      window.localStorage.setItem(WIDTH_KEY, next);
    } catch {
    }
  };

  return [width, change];
}

type WidthToggleProps = {
  width: NoteWidth;
  onChange: (next: NoteWidth) => void;
};

export function WidthToggle({ width, onChange }: WidthToggleProps) {
  const base =
    "flex h-[var(--control-h-sm)] w-8 items-center justify-center transition";

  return (
    <div
      role="group"
      aria-label="본문 폭"
      className="flex overflow-hidden rounded-[var(--radius-md)] border border-line-strong"
    >
      <button
        type="button"
        onClick={() => onChange("narrow")}
        aria-pressed={width === "narrow"}
        title="좁게 보기 (읽기 편한 폭)"
        className={`${base} ${
          width === "narrow"
            ? "bg-primary-600 text-white"
            : "bg-panel text-muted hover:bg-row-hover hover:text-body"
        }`}
      >
        <NarrowIcon width={15} height={15} />
      </button>

      <button
        type="button"
        onClick={() => onChange("wide")}
        aria-pressed={width === "wide"}
        title="넓게 보기 (화면 전체)"
        className={`${base} border-l border-line-strong ${
          width === "wide"
            ? "bg-primary-600 text-white"
            : "bg-panel text-muted hover:bg-row-hover hover:text-body"
        }`}
      >
        <WideIcon width={15} height={15} />
      </button>
    </div>
  );
}
