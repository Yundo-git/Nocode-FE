import { useCallback, useEffect, useState } from "react";
import { MOCK_SERVERS } from "@/lib/servers/mockServers";
import type { Server } from "@/lib/servers/types";

export type LoadStatus = "loading" | "ready" | "error";

// 서버 목록을 가져옵니다.
// 지금은 임시 데이터를 그대로 돌려주고, 나중에 이 함수 안만
// fetch("/api/servers") 같은 실제 호출로 바꾸면 화면 코드는 그대로 둬도 됩니다.
export async function fetchServers(): Promise<readonly Server[]> {
  return MOCK_SERVERS;
}

// 화면에서 쓰는 서버 목록 상태입니다.
export function useServers() {
  const [servers, setServers] = useState<readonly Server[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    let alive = true;

    fetchServers()
      .then((next) => {
        // 이미 화면을 벗어났으면 상태를 건드리지 않습니다.
        if (!alive) return;
        setServers(next);
        setStatus("ready");
      })
      .catch(() => {
        if (!alive) return;
        setStatus("error");
      });

    return () => {
      alive = false;
    };
  }, []);

  // 목록의 토글을 눌렀을 때 화면에서만 먼저 바꿔 둡니다.
  // 백엔드가 붙으면 여기서 저장 요청을 함께 보내면 됩니다.
  const toggleEnabled = useCallback((id: string) => {
    setServers((prev) =>
      prev.map((server) =>
        server.id === id ? { ...server, enabled: !server.enabled } : server,
      ),
    );
  }, []);

  return { servers, status, toggleEnabled };
}
