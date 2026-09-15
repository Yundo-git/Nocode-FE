import { useEffect, useRef, useState } from "react";
import { FilterField } from "@/components/ui/FilterForm";

type PresetKey = "1h" | "6h" | "today" | "yesterday" | "7d" | "30d" | "thisMonth";

type Preset = {
  readonly key: PresetKey;
  readonly label: string;
  readonly build: () => { start: Date; end: Date };
};

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 0, 0);
  return next;
}

function daysAgo(days: number): Date {
  const next = new Date();
  next.setDate(next.getDate() - days);
  return next;
}

const TIME_PRESETS: readonly Preset[] = [
  {
    key: "1h",
    label: "최근 1시간",
    build: () => ({ start: new Date(Date.now() - 3_600_000), end: new Date() }),
  },
  {
    key: "6h",
    label: "최근 6시간",
    build: () => ({ start: new Date(Date.now() - 6 * 3_600_000), end: new Date() }),
  },
];

const DAY_PRESETS: readonly Preset[] = [
  {
    key: "today",
    label: "오늘",
    build: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) }),
  },
  {
    key: "yesterday",
    label: "어제",
    build: () => ({ start: startOfDay(daysAgo(1)), end: endOfDay(daysAgo(1)) }),
  },
  {
    key: "7d",
    label: "최근 7일",
    build: () => ({ start: startOfDay(daysAgo(6)), end: endOfDay(new Date()) }),
  },
  {
    key: "30d",
    label: "최근 30일",
    build: () => ({ start: startOfDay(daysAgo(29)), end: endOfDay(new Date()) }),
  },
  {
    key: "thisMonth",
    label: "이번 달",
    build: () => {
      const now = new Date();
      return {
        start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
        end: endOfDay(now),
      };
    },
  },
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toValue(date: Date, withTime: boolean): string {
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  return withTime ? `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}` : day;
}

function toShortLabel(value: string): string {
  const parts = (value.split("T")[0] ?? "").split("-");

  return parts.length === 3 ? `${parts[1]}.${parts[2]}` : value;
}

type DateRangeFieldProps = {
  label: string;
  idPrefix: string;
  from: string;
  to: string;
  withTime?: boolean;
  onChange: (next: { from: string; to: string }) => void;
};

export function DateRangeField({
  label,
  idPrefix,
  from,
  to,
  withTime = false,
  onChange,
}: DateRangeFieldProps) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<PresetKey | null>(null);

  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const presets = withTime ? [...TIME_PRESETS, ...DAY_PRESETS] : DAY_PRESETS;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const openPanel = () => {
    const fallback = DAY_PRESETS[0]!.build();

    setDraftFrom(from || toValue(fallback.start, withTime));
    setDraftTo(to || toValue(fallback.end, withTime));
    setOpen(true);
  };

  const applyPreset = (preset: Preset) => {
    const { start, end } = preset.build();

    setPicked(preset.key);
    onChange({ from: toValue(start, withTime), to: toValue(end, withTime) });
    setOpen(false);
  };

  const applyCustom = () => {
    setPicked(null);
    onChange({ from: draftFrom, to: draftTo });
    setOpen(false);
  };

  const clear = () => {
    setPicked(null);
    onChange({ from: "", to: "" });
    setOpen(false);
  };

  const isEmpty = from === "" && to === "";
  const pickedLabel = presets.find((preset) => preset.key === picked)?.label;
  const triggerLabel = isEmpty
    ? "전체"
    : (pickedLabel ?? `${toShortLabel(from)} ~ ${toShortLabel(to)}`);

  const inputType = withTime ? "datetime-local" : "date";

  return (
    <FilterField label={label} htmlFor={`${idPrefix}-range`}>
      <div ref={containerRef} className="relative min-w-0">
        <button
          ref={triggerRef}
          id={`${idPrefix}-range`}
          type="button"
          onClick={() => (open ? setOpen(false) : openPanel())}
          aria-haspopup="dialog"
          aria-expanded={open}
          title={isEmpty ? undefined : `${from} ~ ${to}`}
          className="select flex w-full items-center justify-between gap-2 text-left"
        >
          <span className="min-w-0 truncate">{triggerLabel}</span>
          <span aria-hidden className="shrink-0 text-muted">
            ▾
          </span>
        </button>

        {open ? (
          <div
            role="dialog"
            aria-label={`${label} 고르기`}
            className="absolute left-0 top-full z-20 mt-1 w-[17rem] rounded-[var(--radius-md)] border border-line-strong bg-panel p-1.5 shadow-soft"
          >
            <div className="flex flex-col">
              {presets.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-b2_body_r transition hover:bg-row-hover ${
                    picked === preset.key
                      ? "font-semibold text-primary-600"
                      : "text-secondary"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="mt-1.5 space-y-1.5 border-t border-line pt-2">
              <p className="px-1 text-bt-text-s font-medium text-muted">직접 지정</p>

              <label className="flex items-center gap-2 px-1">
                <span className="w-8 shrink-0 text-bt-text-s text-muted">시작</span>
                <input
                  type={inputType}
                  value={draftFrom}
                  onChange={(event) => setDraftFrom(event.currentTarget.value)}
                  className="input input-sm min-w-0 flex-1"
                />
              </label>

              <label className="flex items-center gap-2 px-1">
                <span className="w-8 shrink-0 text-bt-text-s text-muted">종료</span>
                <input
                  type={inputType}
                  value={draftTo}
                  onChange={(event) => setDraftTo(event.currentTarget.value)}
                  className="input input-sm min-w-0 flex-1"
                />
              </label>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2 border-t border-line pt-2">
              <button
                type="button"
                onClick={clear}
                disabled={isEmpty}
                className="btn btn-ghost btn-sm"
              >
                전체로
              </button>
              <button
                type="button"
                onClick={applyCustom}
                disabled={draftFrom === "" || draftTo === ""}
                className="btn btn-primary btn-sm"
              >
                적용
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </FilterField>
  );
}
