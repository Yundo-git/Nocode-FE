import type { StateCounts } from "@/lib/dashboard/types";

// 도넛 하나와 그 아래 숫자들입니다.
//
// 차트 라이브러리를 쓰지 않고 SVG 로 직접 그립니다.
// 도넛에 라이브러리를 넣으면 용량도 늘고, 무엇보다 라이브러리가 정한 색을
// 블랙 모드에 맞추기가 번거롭습니다.
// stroke-dasharray 로 원 둘레의 일부만 칠하는 방식입니다.
//
// ── 크기 ────────────────────────────────────────────────────────────────
//
// ★ SIZE 는 **그리는 기준**일 뿐 화면에 나오는 크기가 아닙니다.
//   viewBox 를 이 값으로 두고 폭은 100% 로 두어, 자리에 맞춰 늘었다 줄었다 합니다.
//
//   전에는 164px 로 못박고 shrink-0 까지 걸어 두어, 자리가 좁아지면
//   줄어들지 못하고 **옆으로 삐져나왔습니다.**
//   대시보드는 사람이 상자 크기를 줄일 수 있어서 특히 잘 깨졌습니다.
//
// ★ 가운데 숫자도 SVG 안에 넣었습니다.
//   바깥에 HTML 로 얹어 두면 도넛만 작아지고 글자는 그대로라 밖으로 넘칩니다.
//   안에 넣으면 도넛과 **같은 비율로** 함께 줄어듭니다.
const SIZE = 164;
const STROKE = 20;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type HealthDonutProps = {
  label: string;
  counts: StateCounts;
  /** 감시가 멈춘 것으로 보이면 회색으로 칠합니다. */
  stale?: boolean;
};

export function HealthDonut({ label, counts, stale = false }: HealthDonutProps) {
  // 등록된 장비가 없으면 비율을 그리지 않습니다.
  // 0대를 100% 로 칠하면 "다 정상" 처럼 보여 오해를 부릅니다.
  const empty = counts.total === 0;
  const ratio = empty ? 0 : counts.online / counts.total;
  const percent = Math.round(ratio * 100);

  const segments = buildSegments(counts);

  return (
    // 도넛은 왼쪽, 숫자는 오른쪽입니다.
    // 자리가 모자라면 숫자가 아랫줄로 내려갑니다. (눌려서 깨지지 않게)
    <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-4 gap-y-2">
      {/* 도넛은 자리에 맞춰 줄어듭니다. 다만 너무 작아지면 뜻이 없어
          최소 크기를 두고, 원래 크기(164px)보다 커지지는 않습니다. */}
      <div className="min-w-[7rem] max-w-[164px] flex-1 basis-[7rem]">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-auto w-full"
          role="img"
          aria-label={
            empty
              ? `${label} 등록된 장비 없음`
              : `${label} 전체 ${counts.total}대 · 정상 ${counts.online} · 비정상 ${counts.offline} · 미연결 ${counts.disabled}`
          }
        >
          {/* 12시 방향에서 시작하도록 원만 돌립니다.
              (가운데 글자까지 돌아가면 안 되므로 묶어서 따로 돌립니다)

              감시가 멈추면 흐리게만 합니다. 색을 지우지는 않습니다.
              마지막으로 본 상태라도 보이는 편이 아무것도 안 보이는 것보다 낫고,
              "지금 값이 아니다" 는 아래 ⚠ 문구가 알려 줍니다. */}
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
          {/* 정상(초록) · 비정상(빨강) · 미연결(회색) 을 이어 붙입니다.
              앞 구간이 끝난 자리에서 시작하도록 dashoffset 을 뒤로 밀어 줍니다.
              끝을 둥글게 하면 구간끼리 겹쳐 보여서 각지게 둡니다. */}
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

          {/* 가운데 글자. 도넛과 같이 줄어들도록 SVG 안에 둡니다.
              색은 테마 토큰을 그대로 씁니다. (블랙 모드에서 같이 바뀝니다) */}
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
                // 숫자 폭을 고정해 값이 바뀔 때 가운데가 흔들리지 않게 합니다.
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

      {/* 도넛만으로는 부족합니다.
          100대 중 1대가 죽으면 빨간 조각이 1% 라 눈에 안 들어옵니다.
          숫자를 따로 적어야 보입니다. */}
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

// 상태별로 원 둘레를 나눠 갖습니다.
function buildSegments(counts: StateCounts): Segment[] {
  if (counts.total === 0) {
    return [];
  }

  const parts = [
    { key: "online", value: counts.online, className: "stroke-up-500" },
    { key: "offline", value: counts.offline, className: "stroke-down-500" },
    { key: "disabled", value: counts.disabled, className: "stroke-unknown-500" },
  ];

  const segments: Segment[] = [];
  let offset = 0;

  for (const part of parts) {
    // 0 대인 상태는 그리지 않습니다.
    if (part.value === 0) continue;

    const length = (part.value / counts.total) * CIRCUMFERENCE;

    segments.push({ key: part.key, length, offset, className: part.className });

    offset += length;
  }

  return segments;
}

// 도넛 구간과 같은 색을 씁니다. 색이 다르면 둘을 잇기 어렵습니다.
const TONE_CLASS = {
  up: "text-up-500",
  down: "text-down-500",
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
