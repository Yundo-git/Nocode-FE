import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatShortWithSeconds } from "@/lib/datetime";
import { DISPLAY_STATE_LABEL, type ServerDisplayState } from "@/lib/servers/types";
import { BUSINESS_DIVISION_LABEL, type BusinessDivisionId } from "@/lib/businessDivisions";

type RecentCheck = {
  readonly id: string;
  readonly ip: string;
  readonly nameKo: string;
  readonly nameEn: string;
  readonly type: string;
  readonly divisionId: BusinessDivisionId;
  readonly state: ServerDisplayState;
  readonly responseMs: number | null;
  /** 한 번도 확인한 적 없으면 null 입니다. */
  readonly checkedAt: string | null;
  /** 이번 확인에서 상태가 바뀌었으면 그 종류. 다음 갱신에는 null 이 됩니다. */
  readonly changed: "up" | "down" | null;
};

const LIMIT = 30;
const REFRESH_MS = 15_000;

const STATE_CLASS: Record<ServerDisplayState, string> = {
  online: "text-up-500",
  offline: "text-down-500 font-bold",
  pending: "text-pending-500",
  disabled: "text-muted",
};

/** 상태가 막 바뀐 줄에 붙는 이름표입니다. */
const CHANGED_LABEL = { up: "정상 전환", down: "장애 발생" } as const;
const CHANGED_CLASS = {
  up: "text-up-500 font-bold",
  down: "text-down-500 font-bold",
} as const;

// 대시보드의 실시간 확인 결과입니다.
//
// ★ logs 표가 아니라 **장비의 마지막 확인 결과**를 보여 줍니다.
//   정상으로 다녀온 핑까지 나와야 "감시가 돌고 있다" 가 눈에 보입니다.
//   정상 핑을 logs 에 남기면 1,000대 기준 하루 576만 건이 되어
//   로그조회가 "응답 정상" 으로 뒤덮입니다.
//
// ★ 차례는 비정상 → 정상 → 미연결 입니다.
//   흐르는 목록이라 급한 것이 밀려나면 안 됩니다.
//   꺼 둔 장비도 맨 아래에 둡니다. 빼 버리면 파트 장비를 전부 꺼 둔 사람에게
//   빈 화면만 남아, 감시가 죽은 것과 구분이 안 됩니다.
//
// ★ 상태가 막 바뀐 줄은 "정상 전환" / "장애 발생" 으로 한 번 보여 주고,
//   다음 갱신에는 평범한 확인 결과로 돌아갑니다.
//   바뀌는 순간을 놓치지 않으면서도, 계속 강조되어 눈에 익어 버리지 않게 합니다.
export function RecentLogs() {
  const [rows, setRows] = useState<readonly RecentCheck[]>([]);
  // 이번에 값이 바뀐 줄만 기억합니다. 전부 움직이면 어지럽습니다.
  const [freshIds, setFreshIds] = useState<ReadonlySet<string>>(new Set());
  // 값은 마지막 확인 시각입니다. 한 번도 확인 안 한 장비는 null 입니다.
  const seenRef = useRef<Map<string, string | null> | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      // 화면이 스스로 보내는 주기 요청입니다. 로그인 기한을 밀지 않습니다.
      const res = await api.get<RecentCheck[]>("/dashboard/recent", {
        background: true,
      });

      if (!alive) return;

      if (!res.ok) {
        setStatus("error");
        return;
      }

      const incoming = res.data;

      if (seenRef.current === null) {
        // 첫 응답은 전부 "이미 있던 것" 으로 칩니다.
        seenRef.current = new Map(incoming.map((row) => [row.id, row.checkedAt]));
      } else {
        const seen = seenRef.current;
        const fresh = new Set(
          incoming
            .filter((row) => seen.get(row.id) !== row.checkedAt)
            .map((row) => row.id),
        );

        for (const row of incoming) seen.set(row.id, row.checkedAt);
        setFreshIds(fresh);
      }

      setRows(incoming);
      setStatus("ready");
    };

    void load();
    const timer = setInterval(() => void load(), REFRESH_MS);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="space-y-2 py-1">
        {[0, 1, 2, 3, 4, 5].map((key) => (
          <div key={key} className="flex items-center gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (status === "error") {
    return <Center tone="error">확인 결과를 불러오지 못했습니다.</Center>;
  }

  if (rows.length === 0) {
    return <Center>등록된 장비가 없습니다.</Center>;
  }

  return (
    <div className="flex h-full min-w-0 flex-col">
      {/* 열이 많아 좁은 화면에서는 가로로 스크롤됩니다. 눌려서 잘리는 것보다 낫습니다. */}
      <ul className="min-h-0 flex-1 divide-y divide-line overflow-auto">
        {rows.map((row) => (
          <li
            key={row.id}
            className={`flex min-w-[880px] items-baseline gap-3 px-1 py-1.5 text-b2_body_r ${
              freshIds.has(row.id) ? "animate-slide-in" : ""
            } ${row.state === "disabled" ? "opacity-55" : ""}`}
          >
            <span className="shrink-0 font-mono tabular-nums text-muted">
              {row.checkedAt === null ? "-" : formatShortWithSeconds(row.checkedAt)}
            </span>
            <span
              className={`w-20 shrink-0 ${
                row.changed ? CHANGED_CLASS[row.changed] : STATE_CLASS[row.state]
              }`}
            >
              {row.changed ? CHANGED_LABEL[row.changed] : DISPLAY_STATE_LABEL[row.state]}
            </span>
            <span className="w-28 shrink-0 font-mono text-secondary">{row.ip}</span>
            <span className="w-14 shrink-0 text-secondary">{row.type}</span>
            <span className="w-14 shrink-0 text-secondary">
              {BUSINESS_DIVISION_LABEL[row.divisionId]}
            </span>
            <span className="w-32 shrink-0 truncate font-mono text-muted">
              {row.nameEn}
            </span>
            <span className="min-w-0 flex-1 truncate text-secondary">{row.nameKo}</span>
            {/* 응답시간은 자릿수를 맞춰 세로로 읽히게 맨 오른쪽에 둡니다. */}
            <span className="w-16 shrink-0 text-right font-mono tabular-nums text-muted">
              {row.responseMs === null ? "-" : `${row.responseMs}ms`}
            </span>
          </li>
        ))}
      </ul>

      <div className="shrink-0 border-t border-line pt-2 text-right">
        {/* 로그조회에는 등록·감시시작·감시중지까지 **모든 이력**이 있습니다.
            여기는 지금 상태만 보여 주는 자리입니다. */}
        <Link href="/logs" className="text-bt-text-m font-semibold text-primary-500">
          전체 로그 보기 →
        </Link>
      </div>
    </div>
  );
}

function Center({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "error";
}) {
  return (
    <div
      className={`flex h-full items-center justify-center text-b2_body_r ${
        tone === "error" ? "text-down-500" : "text-muted"
      }`}
    >
      {children}
    </div>
  );
}
