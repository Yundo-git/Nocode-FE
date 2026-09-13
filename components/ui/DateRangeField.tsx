import { FilterField } from "@/components/ui/FilterForm";

// 기간을 고르는 칸입니다. 서버관리와 로그조회가 **같은 것**을 씁니다.
//
// ★ 전에는 두 화면이 달랐습니다.
//   서버관리는 날짜만(type="date"), 로그조회는 날짜+시각(datetime-local).
//   빠른 선택도 없어서 "최근 일주일" 을 보려면 두 칸을 직접 채워야 했습니다.
//
//   같은 일을 하는 칸이 화면마다 다르면, 쓰는 사람은 매번 다시 익혀야 합니다.

/** 빠른 선택입니다. 실무에서 거의 이 중 하나를 고릅니다. */
const PRESETS: readonly { label: string; days: number }[] = [
  { label: "오늘", days: 0 },
  { label: "최근 7일", days: 6 },
  { label: "최근 30일", days: 29 },
];

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
   * 목록은 날짜면 충분합니다. 생김새와 빠른 선택은 같습니다.
   */
  withTime?: boolean;
  onChange: (next: { from: string; to: string }) => void;
};

/** 로컬 기준 YYYY-MM-DD 를 만듭니다. */
function toDateString(date: Date): string {
  // ★ toISOString() 을 쓰면 안 됩니다. UTC 로 바꿔 버려서
  //   한국 시간 오전 9시 이전이면 **하루 전 날짜**가 나옵니다.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

export function DateRangeField({
  label,
  idPrefix,
  from,
  to,
  withTime = false,
  onChange,
}: DateRangeFieldProps) {
  const type = withTime ? "datetime-local" : "date";

  const applyPreset = (days: number) => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - days);

    onChange(
      withTime
        ? {
            // 시작은 그날 0시, 끝은 오늘 지금까지입니다.
            from: `${toDateString(start)}T00:00`,
            to: `${toDateString(now)}T23:59`,
          }
        : { from: toDateString(start), to: toDateString(now) },
    );
  };

  return (
    <FilterField label={label} htmlFor={`${idPrefix}-from`}>
      <div className="min-w-0 space-y-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <input
            id={`${idPrefix}-from`}
            type={type}
            value={from}
            onChange={(event) => onChange({ from: event.currentTarget.value, to })}
            className="input min-w-0 flex-1"
          />
          <span className="shrink-0 text-b2_body_r text-muted">~</span>
          <input
            type={type}
            aria-label={`${label} 끝`}
            value={to}
            onChange={(event) => onChange({ from, to: event.currentTarget.value })}
            className="input min-w-0 flex-1"
          />
        </div>

        {/* 빠른 선택. 두 칸을 직접 채우는 수고를 덜어 줍니다. */}
        <div className="flex flex-wrap items-center gap-1">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.days)}
              className="btn btn-ghost btn-sm"
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange({ from: "", to: "" })}
            disabled={from === "" && to === ""}
            className="btn btn-ghost btn-sm"
          >
            전체
          </button>
        </div>
      </div>
    </FilterField>
  );
}
