import { SEED_LOGS } from "@/lib/logs/seedLogs";
import type { LogEntry, LogPage, LogQuery } from "@/lib/logs/types";
import { createJsonStore } from "@/lib/storage/jsonStore";

// 이 파일은 API 라우트에서만 불러옵니다.
//
// 로그는 읽기만 합니다. 고치거나 지우는 함수를 두지 않았습니다.
// 이력이 바뀔 수 있으면 이력이 아닙니다.
const store = createJsonStore<LogEntry>("logs.json", SEED_LOGS);

// datetime-local 값(2026-09-12T09:00)을 견주기 좋은 형태로 바꿉니다.
// 빈 값이면 null 이고, 그 조건은 무시합니다.
function toTime(value: string): number | null {
  if (!value) return null;

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

// 조건에 맞는 로그를 한 쪽만 잘라서 돌려줍니다.
//
// **거르기와 쪽 나누기를 서버에서 합니다.**
// 로그는 금방 수만 건이 되어 브라우저로 전부 보낼 수 없습니다.
// DB 로 옮기면 이 함수 안이 WHERE + LIMIT/OFFSET 질의가 됩니다.
export async function queryLogs(query: LogQuery): Promise<LogPage> {
  const all = await store.read();

  const from = toTime(query.from);
  const to = toTime(query.to);

  const matched = all.filter((log) => {
    if (query.serverId && log.serverId !== query.serverId) return false;
    if (query.type && log.type !== query.type) return false;
    if (query.divisionId && log.divisionId !== query.divisionId) return false;

    const at = new Date(log.occurredAt).getTime();
    if (from !== null && at < from) return false;
    if (to !== null && at > to) return false;

    return true;
  });

  // 최근 것이 위로 오게 합니다.
  matched.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  const start = (query.page - 1) * query.pageSize;

  return {
    rows: matched.slice(start, start + query.pageSize),
    totalCount: matched.length,
  };
}

// 대시보드 요약을 만들 때 쓰는 전체 읽기입니다.
//
// 최신이 앞에 오도록 정렬해서 돌려줍니다.
// "이 장비가 언제 죽었는지" 는 앞에서부터 찾으면 바로 나옵니다.
//
// DB 로 옮기면 전체를 읽지 말고 질의 두 개로 나누세요.
//   1) 장비별 마지막 down 시각  (GROUP BY + MAX)
//   2) 오늘 down 건수           (COUNT + WHERE)
export async function listLogsForSummary(): Promise<LogEntry[]> {
  const all = await store.read();
  return all.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}
