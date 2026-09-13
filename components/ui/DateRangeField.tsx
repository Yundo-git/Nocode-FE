import { useEffect, useRef, useState } from "react";
import { FilterField } from "@/components/ui/FilterForm";

// 기간을 고르는 칸입니다. 서버관리와 로그조회가 **같은 것**을 씁니다.
//
// ── 왜 펼침 창(popover)인가 ─────────────────────────────────────────────
//
// 앞서 두 가지를 시도했다가 둘 다 접었습니다.
//
//   1) 날짜 칸 두 개를 그대로 늘어놓기
//      비어 있을 때 "연도. 월. 일. -- --:--" 가 그대로 보입니다.
//      브라우저가 넣는 글자라 CSS 로 지울 수 없습니다.
//      게다가 두 칸이면 검색 조건 한 칸(약 230px)에 절대 들어가지 않습니다.
//
//   2) "직접 지정" 일 때만 칸을 펼치고 두 열을 차지하게 하기
//      고를 때마다 **다른 조건들이 밀려나 자리가 흔들립니다.**
//      검색 조건은 눈이 위치를 외우고 쓰는 곳이라 가장 하면 안 되는 일입니다.
//
// 그래서 **바깥에 보이는 것은 언제나 버튼 하나**로 두었습니다.
// 폭이 고정이라 자리가 흔들리지 않고, 빈 날짜 칸이 밖으로 새지 않습니다.
// 고르는 일은 눌렀을 때 열리는 창 안에서 넉넉하게 합니다.
//
// 기간은 "자주 쓰는 몇 개 + 가끔 직접 지정" 으로 쏠림이 뚜렷합니다.
// 자주 쓰는 것은 한 번 눌러 끝나고, 드문 경우만 두 칸을 만집니다.

type PresetKey = "1h" | "6h" | "today" | "yesterday" | "7d" | "30d" | "thisMonth";

type Preset = {
  readonly key: PresetKey;
  readonly label: string;
  /** 지금을 기준으로 시작·끝을 만듭니다. */
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

// 시각 단위 선택지입니다. 로그조회에서만 씁니다.
//
// ★ 서버관리에는 넣지 않습니다.
//   거기서 거르는 값은 장비 등록 시각이라 "최근 1시간에 등록된 장비" 는
//   쓸 일이 없습니다. 쓰지 않을 선택지를 늘어놓으면 고르기만 느려집니다.
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

// ── 값 만들기 ───────────────────────────────────────────────────────────
//
// ★ toISOString() 을 쓰지 않습니다. UTC 로 바꿔 버려서
//   한국 시간 오전 9시 이전이면 **하루 전 날짜**가 나옵니다.
function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toValue(date: Date, withTime: boolean): string {
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  return withTime ? `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}` : day;
}

/** 버튼에 보여 줄 짧은 표기입니다. 예: 09.13 */
function toShortLabel(value: string): string {
  const parts = (value.split("T")[0] ?? "").split("-");

  return parts.length === 3 ? `${parts[1]}.${parts[2]}` : value;
}

type DateRangeFieldProps = {
  label: string;
  /** 화면 안에서 겹치지 않는 값이어야 합니다. (예: "server", "log") */
  idPrefix: string;
  from: string;
  to: string;
  /**
   * 시각까지 고를지입니다.
   *
   * 로그는 "몇 시 몇 분에 일어났는지" 가 중요해서 시각까지 받고,
   * 목록은 날짜면 충분합니다.
   */
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
  // 지금 고른 선택지입니다. 버튼 글자를 만드는 데만 씁니다.
  const [picked, setPicked] = useState<PresetKey | null>(null);

  // 창 안에서 고치는 중인 값입니다. "적용" 을 눌러야 바깥으로 나갑니다.
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const presets = withTime ? [...TIME_PRESETS, ...DAY_PRESETS] : DAY_PRESETS;

  // 열려 있을 때만 바깥 클릭과 Esc 를 살핍니다.
  // 닫히면 정리 함수가 바로 떼어 내서 평소에는 아무 일도 하지 않습니다.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        // 키보드로 닫았으면 눌렀던 자리로 초점을 돌려 줍니다.
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
    // 창을 열 때 지금 값을 가져다 놓습니다. 비어 있으면 오늘로 채웁니다.
    // 빈 칸으로 두면 "연도. 월. 일. --" 이 보이고 고칠 기준점도 없습니다.
    const fallback = DAY_PRESETS[0]!.build();

    setDraftFrom(from || toValue(fallback.start, withTime));
    setDraftTo(to || toValue(fallback.end, withTime));
    setOpen(true);
  };

  // 자주 쓰는 선택지는 **한 번 눌러 바로 적용**됩니다.
  // 고르고 나서 또 "적용" 을 눌러야 하면 두 번 일이 됩니다.
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
          // 값이 있으면 마우스를 올렸을 때 전체를 보여 줍니다.
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
            {/* 자주 쓰는 것들. 누르면 바로 적용되고 창이 닫힙니다. */}
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

            {/* 직접 지정. 창 안이라 두 칸을 위아래로 넉넉히 놓을 수 있습니다. */}
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
