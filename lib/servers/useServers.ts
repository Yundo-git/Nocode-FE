import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type {
  AddServerResult,
  NewServerInput,
  Server,
} from "@/lib/servers/types";

export type LoadStatus = "loading" | "ready" | "error";

// 목록은 서버의 data/servers.json 에 있습니다.
// 브라우저 저장소가 아니라서 다른 PC 에서 접속해도 같은 목록이 보이고,
// 로그아웃하거나 새로고침해도 남습니다.
//
// 나중에 실제 DB 를 붙일 때는 API 라우트(pages/api/servers) 안만 바꾸면 되고,
// 아래 화면 코드는 그대로 둘 수 있습니다.
export async function fetchServers(): Promise<readonly Server[]> {
  const res = await api.get<Server[]>("/servers");

  if (!res.ok) {
    throw new Error(res.message);
  }

  return res.data;
}

// 화면에서 쓰는 서버 목록 상태입니다.
export function useServers() {
  const [servers, setServers] = useState<readonly Server[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  // 화면에서 "새로고침" 을 눌렀을 때 다시 받아 옵니다.
  const reload = useCallback(async () => {
    setStatus("loading");

    try {
      setServers(await fetchServers());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

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

  // 서버를 한 대 등록합니다.
  // 중복 IP 검사는 API 가 합니다. 브라우저에서만 검사하면
  // 두 사람이 동시에 같은 IP 를 넣을 때 막지 못합니다.
  const addServer = useCallback(
    async (input: NewServerInput): Promise<AddServerResult> => {
      const res = await api.post<Server>("/servers", input);

      if (!res.ok) {
        // 409 는 "이미 있는 IP" 라는 뜻입니다. (pages/api/servers/index.ts)
        return {
          ok: false,
          reason: res.status === 409 ? "duplicate-ip" : "request-failed",
        };
      }

      setServers((prev) => [res.data, ...prev]);
      return { ok: true };
    },
    [],
  );

  // 목록의 토글은 "핑을 쏠지" 를 정합니다.
  // 누른 즉시 화면을 바꿔 반응이 바로 보이게 하고,
  // 저장에 실패하면 원래대로 되돌립니다.
  const toggleEnabled = useCallback(
    async (id: string) => {
      const target = servers.find((server) => server.id === id);

      if (target === undefined) {
        return;
      }

      const next = !target.enabled;

      setServers((prev) =>
        prev.map((server) =>
          server.id === id ? { ...server, enabled: next } : server,
        ),
      );

      const res = await api.patch<Server>(`/servers/${id}`, { enabled: next });

      if (res.ok) {
        setServers((prev) =>
          prev.map((server) => (server.id === id ? res.data : server)),
        );
        return;
      }

      // 저장에 실패했으니 눌렀던 것을 되돌립니다.
      setServers((prev) =>
        prev.map((server) =>
          server.id === id ? { ...server, enabled: !next } : server,
        ),
      );
    },
    [servers],
  );

  return { servers, status, reload, addServer, toggleEnabled };
}
