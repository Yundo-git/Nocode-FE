import { useCallback, useEffect, useState } from "react";
import { MOCK_SERVERS } from "@/lib/servers/mockServers";
import type {
  AddServerResult,
  NewServerInput,
  Server,
} from "@/lib/servers/types";

export type LoadStatus = "loading" | "ready" | "error";

// 서버 목록을 가져옵니다.
// 지금은 임시 데이터를 그대로 돌려주고, 나중에 이 함수 안만
// fetch("/api/servers") 같은 실제 호출로 바꾸면 화면 코드는 그대로 둬도 됩니다.
export async function fetchServers(): Promise<readonly Server[]> {
  return MOCK_SERVERS;
}

// 등록 폼의 값을 목록에 넣을 한 줄로 바꿉니다.
//
// 지금은 브라우저에서 만들어 넣습니다. 백엔드가 붙으면 이 함수 대신
// POST /api/servers 의 응답을 그대로 쓰면 됩니다.
//
// 사용여부를 켜고 등록하면 곧바로 핑을 쏜 것으로 칩니다.
// 실제 핑은 백엔드가 하므로, 여기서는 UI 를 확인할 수 있게 결과를 흉내 냅니다.
function createServer(input: NewServerInput): Server {
  const now = new Date().toISOString();

  if (!input.enabled) {
    // 핑을 쏘지 않으므로 확인된 값이 없습니다.
    return {
      id: `srv-${Date.now().toString(36)}`,
      ...input,
      status: "down",
      responseMs: null,
      checkedAt: now,
    };
  }

  return {
    id: `srv-${Date.now().toString(36)}`,
    ...input,
    status: "up",
    responseMs: 10 + Math.floor(Math.random() * 40),
    checkedAt: now,
  };
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

  // 서버를 한 대 등록합니다. 새로 등록한 줄이 맨 위에 오도록 앞에 붙입니다.
  //
  // 같은 IP 가 이미 있으면 넣지 않고 실패를 돌려줍니다.
  // 백엔드가 붙으면 서버 쪽에서도 같은 검사를 해야 합니다.
  // (두 사람이 동시에 같은 IP 를 등록하면 브라우저 검사만으로는 못 막습니다.)
  const addServer = useCallback(
    (input: NewServerInput): AddServerResult => {
      if (servers.some((server) => server.ip === input.ip)) {
        return { ok: false, reason: "duplicate-ip" };
      }

      setServers((prev) => [createServer(input), ...prev]);
      return { ok: true };
    },
    [servers],
  );

  // 목록의 토글은 "핑을 쏠지" 를 정합니다.
  // 지금은 화면에서만 바꾸고, 백엔드가 붙으면 여기서 저장 요청을 함께 보냅니다.
  const toggleEnabled = useCallback((id: string) => {
    setServers((prev) =>
      prev.map((server) =>
        server.id === id ? { ...server, enabled: !server.enabled } : server,
      ),
    );
  }, []);

  return { servers, status, addServer, toggleEnabled };
}
