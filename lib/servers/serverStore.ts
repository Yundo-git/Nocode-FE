import { createJsonStore, patchById } from "@/lib/storage/jsonStore";
import { SEED_SERVERS } from "@/lib/servers/mockServers";
import type { NewServerInput, Server } from "@/lib/servers/types";

// 이 파일은 API 라우트에서만 불러옵니다.
//
// 파일을 읽고 쓰는 공통 부분은 lib/storage/jsonStore.ts 에 있습니다.
// 여기에는 "서버" 에만 해당하는 규칙(중복 IP, 첫 핑 흉내)만 둡니다.
const store = createJsonStore<Server>("servers.json", SEED_SERVERS);

export function listServers(): Promise<Server[]> {
  return store.read();
}

// 등록하자마자 핑을 쏜 것으로 칩니다.
// 실제 핑은 나중에 백엔드가 하므로, 지금은 결과를 흉내 냅니다.
function createServer(input: NewServerInput): Server {
  return {
    id: `srv-${Date.now().toString(36)}`,
    ...input,
    status: input.enabled ? "up" : "down",
    responseMs: input.enabled ? 10 + Math.floor(Math.random() * 40) : null,
    checkedAt: new Date().toISOString(),
  };
}

export type CreateResult =
  | { ok: true; server: Server }
  | { ok: false; reason: "duplicate-ip" };

export function createServerRecord(
  input: NewServerInput,
): Promise<CreateResult> {
  // 제네릭을 적어 둡니다. 안 적으면 먼저 나오는 분기(실패)로 타입이 굳습니다.
  return store.update<CreateResult>((servers) => {
    if (servers.some((server) => server.ip === input.ip)) {
      // next 를 주지 않으므로 파일은 그대로입니다.
      return { result: { ok: false, reason: "duplicate-ip" } };
    }

    const created = createServer(input);
    return {
      next: [created, ...servers],
      result: { ok: true, server: created },
    };
  });
}

export function setServerEnabled(
  id: string,
  enabled: boolean,
): Promise<Server | null> {
  return store.update((servers) => patchById(servers, id, { enabled }));
}
