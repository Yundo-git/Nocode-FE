import { useCallback, useEffect, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { api } from "@/lib/api/client";
import { formatDateTime } from "@/lib/datetime";
import { formatAgo } from "@/lib/dashboard/duration";
import { useNow } from "@/lib/useNow";

type SessionInfo = {
  readonly id: string;
  /** 로그인한 곳의 IP 입니다. 알 수 없으면 null 입니다. */
  readonly clientIp: string | null;
  readonly createdAt: string;
  readonly lastSeenAt: string;
  /** null 이면 만료되지 않습니다. (유지 시간이 "영구") */
  readonly expiresAt: string | null;
  readonly current: boolean;
};

/**
 * IP 를 사람이 읽을 수 있게 바꿉니다.
 *
 * ★ ::1 과 127.0.0.1 은 "이 서버에서 직접" 이라는 뜻입니다.
 *   서버와 같은 PC 에서 localhost 로 접속하면 이렇게 나옵니다.
 *   숫자를 그대로 보여 주면 "IP 가 안 나온다" 고 오해하기 쉬워
 *   말로 풀어 적습니다.
 *
 *   다른 PC 에서 접속하면 192.168.x.x 처럼 실제 주소가 나옵니다.
 */
function describeIp(ip: string | null): string {
  if (ip === null) return "주소 기록 없음";
  if (ip === "::1" || ip === "127.0.0.1") return "이 서버에서 직접";

  return ip;
}

// 지금 로그인되어 있는 기기 목록입니다.
//
// ★ 같은 계정으로 여러 곳에서 로그인할 수 있습니다. 일부러 막지 않았습니다.
//   자리 PC 와 상황실 화면을 같이 쓰는 일이 흔하기 때문입니다.
//   대신 **보이게** 만들었습니다. 모르는 기기가 있으면 바로 끊을 수 있습니다.
//
// ★ 세션 값 전체는 내려오지 않습니다. 앞 8자만 옵니다.
//   그 값이 곧 열쇠라서, 화면에 보이면 훔쳐 갈 수 있습니다.
//   사람이 "몇 개인지, 언제 쓴 것인지" 를 구분할 만큼만 보여 줍니다.
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
                  {/* ★ IP 만 보여 줍니다.
                      전에는 세션 번호(앞 8자)도 같이 띄웠는데, 사람에게는
                      아무 뜻이 없는 글자라 혼란만 줍니다.
                      기기를 알아보는 단서는 IP 하나면 충분합니다. */}
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
                  {/* useNow 가 0 이면 아직 화면이 붙기 전입니다. (서버에는 시간이 없습니다) */}
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
