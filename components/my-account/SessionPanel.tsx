import { useCallback, useEffect, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { api } from "@/lib/api/client";
import { formatDateTime } from "@/lib/datetime";
import { formatAgo } from "@/lib/dashboard/duration";
import { useNow } from "@/lib/useNow";

type SessionInfo = {
  readonly id: string;
  readonly clientIp: string | null;
  readonly createdAt: string;
  readonly lastSeenAt: string;
  readonly expiresAt: string | null;
  readonly current: boolean;
};

function describeIp(ip: string | null): string {
  if (ip === null) return "주소 기록 없음";
  if (ip === "::1" || ip === "127.0.0.1") return "이 서버에서 직접";

  return ip;
}

export function SessionPanel() {
  const [sessions, setSessions] = useState<readonly SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const now = useNow();

  const load = useCallback(async () => {
    const res = await api.get<SessionInfo[]>("/auth/sessions");

    if (res.ok) setSessions(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleLogoutOthers = async () => {
    const res = await api.post<{ removed: number }>("/auth/logout-others", {});

    if (!res.ok) {
      setMessage(res.message);
      return;
    }

    setMessage(
      res.data.removed === 0
        ? "끊을 다른 기기가 없습니다."
        : `다른 기기 ${res.data.removed}곳을 로그아웃했습니다.`,
    );
    await load();
  };

  const others = sessions.filter((session) => !session.current).length;

  return (
    <Panel
      title="로그인된 기기"
      description="같은 계정으로 여러 곳에서 로그인할 수 있습니다"
    >
      {loading ? (
        <p className="text-b2_body_r text-muted">불러오는 중…</p>
      ) : (
        <>
          <ul className="space-y-2">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-line px-3 py-2"
              >
                <div className="min-w-0">
                  <span
                    className="font-mono text-b2_body_m text-body"
                    title={session.clientIp ?? undefined}
                  >
                    {describeIp(session.clientIp)}
                  </span>
                  {session.current ? (
                    <span className="ml-2 rounded-full bg-primary-500 px-2 py-0.5 text-d-label font-semibold text-white">
                      지금 이 기기
                    </span>
                  ) : null}
                </div>

                <div className="text-bt-text-s text-muted">
                  마지막 사용 {now === 0 ? "-" : formatAgo(session.lastSeenAt, now)}
                  <span className="mx-1.5">·</span>
                  {session.expiresAt === null
                    ? "만료 없음 (영구)"
                    : `만료 ${formatDateTime(session.expiresAt)}`}
                </div>
              </li>
            ))}
          </ul>

          {message ? (
            <p className="mt-3 text-bt-text-m text-muted">{message}</p>
          ) : null}

          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <p className="text-bt-text-s text-muted">
              모르는 기기가 있으면 끊고 비밀번호를 바꾸세요.
            </p>
            <button
              type="button"
              onClick={() => void handleLogoutOthers()}
              disabled={others === 0}
              className="btn btn-ghost btn-md"
            >
              다른 기기 로그아웃{others > 0 ? ` (${others})` : ""}
            </button>
          </div>
        </>
      )}
    </Panel>
  );
}
