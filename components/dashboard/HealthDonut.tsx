import type { StateCounts } from "@/lib/dashboard/types";

const SIZE = 164;
const STROKE = 20;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type HealthDonutProps = {
  label: string;
  counts: StateCounts;
  stale?: boolean;
};

export function HealthDonut({ label, counts, stale = false }: HealthDonutProps) {
  const empty = counts.total === 0;
  const ratio = empty ? 0 : counts.online / counts.total;
  const percent = Math.round(ratio * 100);

  const segments = buildSegments(counts);

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-4 gap-y-2">
      <div className="min-w-[7rem] max-w-[164px] flex-1 basis-[7rem]">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-auto w-full"
          role="img"
          aria-label={
            empty
              ? `${label} 등록된 장비 없음`
              : `${label} 전체 ${counts.total}대 · 정상 ${counts.online} · 비정상 ${counts.offline} · 확인 중 ${counts.pending} · 미연결 ${counts.disabled}`
          }
        >
          <g
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            className={`transition-opacity ${stale ? "opacity-30" : ""}`}
          >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-line"
          />
          {segments.map((segment) => (
            <circle
              key={segment.key}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="butt"
              strokeDasharray={`${segment.length} ${CIRCUMFERENCE}`}
              strokeDashoffset={-segment.offset}
              className={`transition-[stroke-dasharray,stroke-dashoffset] duration-500 ${segment.className}`}
            />
          ))}
          </g>

          {empty ? (
            <text
              x={SIZE / 2}
              y={SIZE / 2 + 5}
              textAnchor="middle"
              fontSize="15"
              fill="var(--text-muted)"
            >
              등록 없음
            </text>
          ) : (
            <>
              <text
                x={SIZE / 2}
                y={SIZE / 2 + 4}
                textAnchor="middle"
                fontSize="34"
                fontWeight="700"
                fill="var(--text-primary)"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {percent}
                <tspan fontSize="22">%</tspan>
              </text>
              <text
                x={SIZE / 2}
                y={SIZE / 2 + 24}
                textAnchor="middle"
                fontSize="12"
                fill="var(--text-muted)"
              >
                정상
              </text>
            </>
          )}
        </svg>
      </div>

      <div className="min-w-[104px] flex-1 basis-[104px]">
        <p className="text-s2 font-semibold text-body">{label}</p>

        <dl className="mt-1.5 space-y-0.5 border-t border-line pt-1.5 text-bt-text-m">
          <Stat label="전체" value={counts.total} />
          <Stat label="정상" value={counts.online} tone={empty ? "muted" : "up"} />
          <Stat
            label="비정상"
            value={counts.offline}
            tone={counts.offline > 0 ? "down" : "muted"}
          />
          <Stat
            label="확인 중"
            value={counts.pending}
            tone={counts.pending > 0 ? "pending" : "muted"}
          />
          <Stat
            label="미연결"
            value={counts.disabled}
            tone={counts.disabled > 0 ? "unknown" : "muted"}
          />
        </dl>
      </div>
    </div>
  );
}

type Segment = {
  key: string;
  length: number;
  offset: number;
  className: string;
};

function buildSegments(counts: StateCounts): Segment[] {
  if (counts.total === 0) {
    return [];
  }

  const parts = [
    { key: "online", value: counts.online, className: "stroke-up-500" },
    { key: "offline", value: counts.offline, className: "stroke-down-500" },
    { key: "pending", value: counts.pending, className: "stroke-pending-500" },
    { key: "disabled", value: counts.disabled, className: "stroke-unknown-500" },
  ];

  const segments: Segment[] = [];
  let offset = 0;

  for (const part of parts) {
    if (part.value === 0) continue;

    const length = (part.value / counts.total) * CIRCUMFERENCE;

    segments.push({ key: part.key, length, offset, className: part.className });

    offset += length;
  }

  return segments;
}

const TONE_CLASS = {
  up: "text-up-500",
  down: "text-down-500",
  pending: "text-pending-500",
  unknown: "text-unknown-500",
  muted: "text-secondary",
} as const;

function Stat({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: number;
  tone?: keyof typeof TONE_CLASS;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className={`font-bold tabular-nums ${TONE_CLASS[tone]}`}>{value}</dd>
    </div>
  );
}
