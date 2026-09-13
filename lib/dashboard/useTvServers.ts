import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { ServerDisplayState } from "@/lib/servers/types";
import { SUMMARY_REFRESH_MS } from "@/lib/dashboard/types";
import { nextPollDelay } from "@/lib/dashboard/pollCycle";

// TV모드에 뿌릴 상자 목록입니다.
//
// ★ 칸이 셋뿐입니다. (번호·IP·상태)
//   벽에 붙은 화면은 하루 종일 켜 둔 채 15초마다 이걸 받습니다.
//   서버관리 목록을 그대로 쓰면 쓰지도 않는 칸까지 하루 수백 MB 가 오갑니다.
export type TvRow = {
  readonly id: string;
  readonly ip: string;
  readonly state: ServerDisplayState;
};

type TvPayload = {
  readonly rows: readonly TvRow[];
  readonly lastCheckedAt: string | null;
  readonly pingIntervalSec: number;
};

export function useTvServers() {
  const [rows, setRows] = useState<readonly TvRow[]>([]);
  const [ready, setReady] = useState(false);

  // ★ setInterval 이 아니라 **다음 핑에 맞춰** 다시 받습니다.
  //   벽 화면은 하루 종일 켜 둡니다. 박자가 어긋난 채로 두면
  //   상자 색이 바뀌는 시점과 머리줄 게이지가 따로 놉니다.
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const load = async () => {
      // 화면이 스스로 보내는 요청입니다. 로그인 기한을 밀지 않습니다.
      //
      // ★ 이것이 TV모드에서 특히 중요합니다.
      //   벽 화면은 아무도 손대지 않습니다. 이 요청이 기한을 밀어 준다면
      //   "8시간 뒤 자동 로그아웃" 을 골라도 영영 로그인된 채로 남습니다.
      const res = await api.get<TvPayload>("/dashboard/tv", { background: true });

      if (!alive) return;

      if (!res.ok) {
        timer = setTimeout(() => void load(), SUMMARY_REFRESH_MS);
        return;
      }

      setRows(res.data.rows);
      setReady(true);

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

  return { rows, ready };
}
