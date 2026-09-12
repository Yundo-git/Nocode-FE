import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

// 타일 왼쪽 색 띠와 숫자에 사용할 색상 종류입니다.
export type StatTone = "neutral" | "up" | "warning" | "down" | "unknown";

// 색상별 클래스입니다. 클래스 이름을 통째로 적어 두어야 빌드에서 지워지지 않습니다.
const VALUE_CLASS: Record<StatTone, string> = {
  neutral: "text-main",
  up: "text-up-500",
  warning: "text-warn-500",
  down: "text-down-500",
  unknown: "text-unknown-500",
};

// 왼쪽 색 띠는 CSS 변수로 넘깁니다.
const TONE_VAR: Record<StatTone, string> = {
  neutral: "var(--primary-500)",
  up: "var(--up-500)",
  warning: "var(--warn-500)",
  down: "var(--down-500)",
  unknown: "var(--unknown-500)",
};

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: StatTone;
  icon: LucideIcon;
}

// 전체 현황 숫자 한 칸입니다.
export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon: Icon,
}: StatCardProps) {
  const style = { "--tile-tone": TONE_VAR[tone] } as CSSProperties;

  return (
    <div className="stat-tile" style={style}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-d-label font-bold uppercase text-muted">
          {label}
        </span>
        <Icon
          className={`h-3.5 w-3.5 ${VALUE_CLASS[tone]}`}
          aria-hidden="true"
        />
      </div>
      <p
        className={`mt-1.5 font-semibold leading-none tabular-nums text-[26px] ${VALUE_CLASS[tone]}`}
      >
        {value}
      </p>
      <p className="mt-1.5 h-4 text-bt-text-s tabular-nums text-muted">
        {hint ?? ""}
      </p>
    </div>
  );
}
