import { promises as fs } from "node:fs";
import path from "node:path";

// 서버에서만 씁니다. 브라우저에서는 동작하지 않습니다.
//
// 목록을 JSON 파일 하나에 담아 두는 저장소입니다.
// 서버 목록과 계정 목록이 같은 코드를 쓰고 있어 여기로 모았습니다.
//
// DB 로 옮길 때는 이 파일만 바꾸면 됩니다.
// createJsonStore 가 돌려주는 read / update 두 가지만 맞춰 주면
// 부르는 쪽(serverStore, accountStore)은 손대지 않아도 됩니다.
const DATA_DIR = path.join(process.cwd(), "data");

export type JsonStore<T> = {
  /** 전체를 읽습니다. */
  read(): Promise<T[]>;
  /**
   * 잠금 안에서 읽고, 바꾼 목록을 저장합니다.
   *
   * task 가 돌려준 값에 next 가 있으면 그 목록으로 파일을 덮어씁니다.
   * next 가 없으면 읽기만 하고 끝냅니다. (예: 중복이라 아무것도 안 바꿀 때)
   */
  update<R>(
    task: (items: T[]) => { next?: T[]; result: R },
  ): Promise<R>;
};

export function createJsonStore<T>(
  fileName: string,
  seed: readonly T[],
): JsonStore<T> {
  const file = path.join(DATA_DIR, fileName);

  // 읽기와 쓰기 사이에 다른 요청이 끼어들면 내용이 덮어써질 수 있습니다.
  // 요청을 한 줄로 세워 한 번에 하나씩만 처리합니다.
  // (Node 프로세스가 여러 개면 이 보호는 통하지 않습니다. NOTES.md 3-2 참고)
  let queue: Promise<unknown> = Promise.resolve();

  function withLock<R>(task: () => Promise<R>): Promise<R> {
    const run = queue.then(task, task);
    queue = run.catch(() => undefined);
    return run;
  }

  async function writeAll(items: T[]): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(file, JSON.stringify(items, null, 2), "utf8");
  }

  async function readAll(): Promise<T[]> {
    try {
      const raw = await fs.readFile(file, "utf8");
      const parsed: unknown = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        return parsed as T[];
      }
    } catch {
      // 파일이 없거나 깨져 있으면 아래에서 처음 값으로 만듭니다.
    }

    const initial = [...seed];
    await writeAll(initial);
    return initial;
  }

  return {
    read: () => withLock(readAll),

    update: <R,>(task: (items: T[]) => { next?: T[]; result: R }) =>
      withLock(async () => {
        const items = await readAll();
        const { next, result } = task(items);

        if (next !== undefined) {
          await writeAll(next);
        }

        return result;
      }),
  };
}

// id 로 한 줄을 찾아 일부 값만 바꿉니다. 두 저장소가 똑같이 쓰던 코드입니다.
export function patchById<T extends { id: string }>(
  items: T[],
  id: string,
  patch: Partial<T>,
): { next?: T[]; result: T | null } {
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return { result: null };
  }

  const updated: T = { ...items[index]!, ...patch };
  const next = [...items];
  next[index] = updated;

  return { next, result: updated };
}
