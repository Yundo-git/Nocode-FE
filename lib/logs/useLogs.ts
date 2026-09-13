import { useServerQuery } from "@/lib/useServerQuery";
import { EMPTY_LOG_QUERY, type LogEntry, type LogQuery } from "@/lib/logs/types";

// 로그조회 상태입니다. 조건과 쪽 번호를 서버로 보내고 그 쪽만 받아 옵니다.
// 실제 일은 공용 훅이 합니다. (작업이력과 같은 것을 씁니다)
export function useLogs() {
  return useServerQuery<LogQuery, LogEntry>(
    "/logs",
    EMPTY_LOG_QUERY,
    "너무 많아 최근 50,000건만 받았습니다. 기간을 좁혀 다시 받아 주세요.",
  );
}
