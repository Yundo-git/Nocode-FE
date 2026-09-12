import { promises as fs } from "node:fs";
import path from "node:path";
import { SEED_SERVERS } from "@/lib/servers/mockServers";
import type { NewServerInput, Server } from "@/lib/servers/types";

// 이 파일은 API 라우트에서만 불러옵니다. 브라우저에서는 동작하지 않습니다.
//
// 목록을 서버의 JSON 파일에 둡니다.
// 브라우저 저장소와 달리 모든 PC 가 같은 내용을 보고, 로그아웃해도 남습니다.
// 나중에 DB 를 붙일 때는 아래 readAll / writeAll 만 질의로 바꾸면 됩니다.
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "servers.json");

// 파일을 읽고 쓰는 사이에 다른 요청이 끼어들면 내용이 덮어써질 수 있습니다.
// 요청을 한 줄로 세워서 한 번에 하나씩만 처리합니다.
let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

async function readAll(): Promise<Server[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed as Server[];
    }
  } catch {
    // 파일이 아직 없거나 깨져 있으면 아래에서 처음 값으로 만듭니다.
  }

  const seed = [...SEED_SERVERS];
  await writeAll(seed);
  return seed;
}

async function writeAll(servers: Server[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(servers, null, 2), "utf8");
}

export function listServers(): Promise<Server[]> {
  return withLock(readAll);
}

// 등록하자마자 핑을 쏜 것으로 칩니다.
// 실제 핑은 나중에 백엔드가 하므로, 지금은 결과를 흉내 냅니다.
function createServer(input: NewServerInput): Server {
  const now = new Date().toISOString();

  return {
    id: `srv-${Date.now().toString(36)}`,
    ...input,
    status: input.enabled ? "up" : "down",
    responseMs: input.enabled ? 10 + Math.floor(Math.random() * 40) : null,
    checkedAt: now,
  };
}

export type CreateResult =
  | { ok: true; server: Server }
  | { ok: false; reason: "duplicate-ip" };

export function createServerRecord(
  input: NewServerInput,
): Promise<CreateResult> {
  return withLock(async () => {
    const servers = await readAll();

    if (servers.some((server) => server.ip === input.ip)) {
      return { ok: false, reason: "duplicate-ip" } as const;
    }

    const created = createServer(input);
    await writeAll([created, ...servers]);
    return { ok: true, server: created } as const;
  });
}

export function setServerEnabled(
  id: string,
  enabled: boolean,
): Promise<Server | null> {
  return withLock(async () => {
    const servers = await readAll();
    const index = servers.findIndex((server) => server.id === id);

    if (index === -1) {
      return null;
    }

    const updated: Server = { ...servers[index]!, enabled };
    const next = [...servers];
    next[index] = updated;

    await writeAll(next);
    return updated;
  });
}
