import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { beep, unlockBeep } from "@/lib/notifications/beep";
import { nextPollDelay } from "@/lib/dashboard/pollCycle";

// 사이드바 종에 뜨는 알림입니다.
//
// ★ 대시보드가 아니라 **사이드바**가 가지고 있습니다.
//   장애는 어느 화면을 보고 있든 알아야 합니다. 대시보드에 두면
//   서버관리 화면을 열어 둔 사이에 난 장애를 놓칩니다.

/** 서버가 주기를 알려 주기 전에 쓰는 값입니다. */
const FALLBACK_POLL_MS = 15_000;

/** 어디까지 봤는지입니다. 브라우저마다 따로 기억합니다. */
const SEEN_KEY = "pingcheck.notifications.seen";

/**
 * 알림 한 줄입니다. 장비 하나의 **지금 상태**입니다.
 *
 * ★ 로그 한 줄이 아니라 장비 한 대입니다.
 *   복구되면 같은 줄이 "정상 복구" 로 바뀝니다. 비정상 줄이 따로 남지 않습니다.
 */
export type AlertRow = {
  readonly serverId: string;
  readonly serverIp: string;
  readonly serverNameKo: string;
  readonly serverNameEn: string;
  readonly serverType: string;
  readonly divisionId: string;
  readonly type: "down" | "up";
  readonly detail: string;
  readonly occurredAt: string;
};

export type Notifications = {
  readonly rows: readonly AlertRow[];
  readonly muted: boolean;
  /** 삑 소리를 핑이 도는 박자에 맞추는 데 씁니다. (lib/dashboard/pollCycle.ts) */
  readonly lastCheckedAt: string | null;
  readonly pingIntervalSec: number;
};

/**
 * 시각을 견줍니다. "안 읽음" 표시에 씁니다.
 *
 * ★ 글자 그대로 견주지 않습니다. ISO 문자열은 대체로 글자순과 시간순이 같지만,
 *   시간대 표기가 섞이면 어긋납니다. 숫자로 바꿔 견줍니다.
 */
function isNewerThan(iso: string, mark: string): boolean {
  return mark === "" || new Date(iso).getTime() > new Date(mark).getTime();
}

function readSeen(): string {
  try {
    return window.localStorage.getItem(SEEN_KEY) ?? "";
  } catch {
    // 저장소를 막아 둔 브라우저입니다. 이번 접속 동안만 기억합니다.
    return "";
  }
}

export function useNotifications() {
  const [rows, setRows] = useState<readonly AlertRow[]>([]);
  const [muted, setMuted] = useState(false);
  const [seenId, setSeenId] = useState("");

  // 저장소는 화면이 뜬 뒤에 읽습니다. (NOTES.md 5-4)
  useEffect(() => {
    setSeenId(readSeen());
  }, []);

  // 사람이 화면을 누를 때마다 소리를 낼 준비를 해 둡니다.
  // 장애가 난 다음에 준비하면 그 소리는 브라우저가 막습니다.
  useEffect(() => {
    const handle = () => unlockBeep();

    window.addEventListener("pointerdown", handle);
    window.addEventListener("keydown", handle);

    return () => {
      window.removeEventListener("pointerdown", handle);
      window.removeEventListener("keydown", handle);
    };
  }, []);

  // ★ setInterval 이 아니라 **다음 핑에 맞춰** 다시 받습니다.
  //   제 나름의 15초로 받으면 삑 소리가 핑과 어긋나,
  //   게이지는 다 찼는데 소리는 아직이거나 그 반대가 됩니다.
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const load = async () => {
      // 화면이 스스로 보내는 요청입니다. 로그인 기한을 밀지 않습니다.
      const res = await api.get<Notifications>("/notifications", { background: true });

      if (!alive) return;

      if (!res.ok) {
        timer = setTimeout(() => void load(), FALLBACK_POLL_MS);
        return;
      }

      setRows(res.data.rows);
      setMuted(res.data.muted);

      // ★ 응답이 없는 장비가 하나라도 있으면 **받아 올 때마다** 울립니다.
      //   핑 주기와 같은 15초 간격입니다. 한 번만 울리고 마는 쪽은
      //   자리를 비운 사이에 지나가 버리면 아무도 모릅니다.
      //   장애가 이어지는 동안 계속 울려야 사람이 자리로 돌아옵니다.
      //
      // ★ 멈추는 길은 둘입니다. 장비가 살아나거나, 알림을 지우거나.
      //   지우면 목록에서 빠지므로 소리도 함께 멎습니다. "확인했다" 는 뜻입니다.
      //   내 알림을 꺼 뒀을 때도 울리지 않습니다. (사람마다 다릅니다)
      //
      // ★ 몇 대가 죽었든 한 번만 울립니다.
      //   50대가 죽었다고 삑 소리가 50번 겹치면 아무 뜻도 전하지 못합니다.
      if (!res.data.muted && res.data.rows.some((row) => row.type === "down")) {
        beep();
      }

      timer = setTimeout(
        () => void load(),
        nextPollDelay(res.data.lastCheckedAt, res.data.pingIntervalSec),
      );
    };

    void load();

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  /** 종을 눌러 목록을 본 순간, 여기까지 봤다고 적어 둡니다. */
  const markSeen = useCallback(() => {
    const newest = rows[0]?.occurredAt ?? "";

    if (newest === "") return;

    setSeenId(newest);

    try {
      window.localStorage.setItem(SEEN_KEY, newest);
    } catch {
      // 저장소를 막아 둔 브라우저입니다. 이번 접속 동안만 기억합니다.
    }
  }, [rows]);

  /**
   * 알림을 지웁니다. **로그는 지우지 않습니다.**
   *
   * ★ 같은 파트 사람 모두의 알림함에서 함께 사라집니다.
   *   관제는 여럿이 같은 화면을 봅니다. 한 사람이 확인했으면 끝난 일입니다.
   *
   * 지운 뒤 바로 다시 받아 옵니다. 15초를 기다리면 누른 것이 안 먹은 줄 압니다.
   */
  const clear = useCallback(async (serverIds: string[] | null): Promise<void> => {
    const res = await api.post<{ cleared: number }>(
      "/notifications/clear",
      serverIds === null ? { all: true } : { serverIds },
    );

    if (!res.ok) return;

    // 지운 것은 이미 본 것입니다. 빨간 점이 남지 않게 함께 밀어 둡니다.
    setRows((prev) =>
      serverIds === null
        ? []
        : prev.filter((row) => !serverIds.includes(row.serverId)),
    );
  }, []);

  const unreadCount = rows.filter((row) => isNewerThan(row.occurredAt, seenId)).length;

  return { rows, muted, unreadCount, markSeen, clear };
}
