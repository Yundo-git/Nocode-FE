import { useServerQuery } from "@/lib/useServerQuery";
import { EMPTY_LOG_QUERY, type LogEntry, type LogQuery } from "@/lib/logs/types";

export function useLogs() {
  return useServerQuery<LogQuery, LogEntry>(
    "/logs",
    EMPTY_LOG_QUERY,
    "너무 많아 최근 50,000건만 받았습니다. 기간을 좁혀 다시 받아 주세요.",
  );
}
