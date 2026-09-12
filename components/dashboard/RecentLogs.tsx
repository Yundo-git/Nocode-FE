import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { LOG_TYPE_LABEL, type LogEntry, type LogPage, type LogType } from "@/lib/logs/types";

// 최근 몇 건만 보여 줍니다. 전체 조회는 로그조회 화면에서 합니다.
const LIMIT = 30;
// 새 일이 생겼는지 확인하는 간격입니다.
// 아직 서버가 변화를 밀어 주지 못해서 주기적으로 물어봅니다. (NOTES.md 4-11)
const REFRESH_MS = 15_000;

const TYPE_CLASS: Record<LogType, string> = {
  down: "text-down-500 font-bold",
  up: "text-up-500 font-bold",
  "ping-on": "text-secondary",
  "ping-off": "text-muted",
  registered: "text-secondary",
};

// 대시보드의 실시간 로그입니다.
export function RecentLogs() {
  const [rows, setRows] = useState<readonly LogEntry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const res = await api.get<LogPage>(`/logs?page=1&pageSize=${LIMIT}`);

      if (!alive) return;

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setRows(res.data.rows);
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
    return <Center>불러오는 중입니다.</Center>;
  }

  if (status === "error") {
    return <Center tone="error">로그를 불러오지 못했습니다.</Center>;
  }

  if (rows.length === 0) {
    return <Center>기록된 로그가 없습니다.</Center>;
  }

  return (
    <div className="flex h-full min-w-0 flex-col">
      {/* 목록만 스크롤됩니다. 상자 높이는 그대로 유지됩니다. */}
      <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
        {rows.map((log) => (
          <li
            key={log.id}
            className="flex items-baseline gap-3 px-1 py-1.5 text-b2_body_r"
          >
            <span className="shrink-0 font-mono tabular-nums text-muted">
              {formatTime(log.occurredAt)}
            </span>
            <span className={`w-20 shrink-0 ${TYPE_CLASS[log.type]}`}>
              {LOG_TYPE_LABEL[log.type]}
            </span>
            <span className="w-28 shrink-0 font-mono text-secondary">
              {log.serverIp}
            </span>
            <span className="min-w-0 flex-1 truncate text-secondary">
              {log.serverNameKo} · {log.detail}
            </span>
          </li>
        ))}
      </ul>

      <div className="shrink-0 border-t border-line pt-2 text-right">
        <Link href="/logs" className="text-bt-text-m font-semibold text-primary-500">
          전체 보기 →
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

// 09-12 23:07:11 형태입니다. 오늘 것만 보는 게 아니라 날짜도 짧게 답니다.
function formatTime(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "-";

  const pad = (value: number) => String(value).padStart(2, "0");

  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
