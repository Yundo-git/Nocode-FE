import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { EMPTY_LOG_QUERY, type LogPage, type LogQuery } from "@/lib/logs/types";

export type LogStatus = "loading" | "ready" | "error";

// 조건을 주소 뒤에 붙일 문자열로 바꿉니다. 빈 값은 보내지 않습니다.
function toSearch(query: LogQuery): string {
  const params = new URLSearchParams();

  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));

  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.serverId) params.set("serverId", query.serverId);
  if (query.type) params.set("type", query.type);
  if (query.divisionId) params.set("divisionId", query.divisionId);

  return params.toString();
}

// 로그 조회 상태입니다.
//
// 서버관리·계정관리와 다릅니다. 그쪽은 전체를 받아 브라우저에서 걸렀지만,
// 로그는 조건과 쪽 번호를 서버로 보내고 그 쪽만 받아 옵니다.
// (전체를 받으면 브라우저가 버티지 못합니다)
export function useLogs() {
  const [query, setQuery] = useState<LogQuery>(EMPTY_LOG_QUERY);
  const [page, setPage] = useState<LogPage>({ rows: [], totalCount: 0 });
  const [status, setStatus] = useState<LogStatus>("loading");

  useEffect(() => {
    let alive = true;

    setStatus("loading");

    api
      .get<LogPage>(`/logs?${toSearch(query)}`)
      .then((res) => {
        if (!alive) return;

        if (!res.ok) {
          setStatus("error");
          return;
        }

        setPage(res.data);
        setStatus("ready");
      })
      .catch(() => {
        if (alive) setStatus("error");
      });

    return () => {
      alive = false;
    };
  }, [query]);

  // 조건이 바뀌면 첫 쪽부터 다시 봅니다.
  const search = useCallback((next: Omit<LogQuery, "page" | "pageSize">) => {
    setQuery((prev) => ({ ...prev, ...next, page: 1 }));
  }, []);

  const goToPage = useCallback((next: number) => {
    setQuery((prev) => ({ ...prev, page: next }));
  }, []);

  const changePageSize = useCallback((next: number) => {
    setQuery((prev) => ({ ...prev, pageSize: next, page: 1 }));
  }, []);

  const totalPages = Math.max(1, Math.ceil(page.totalCount / query.pageSize));

  return {
    rows: page.rows,
    totalCount: page.totalCount,
    page: query.page,
    pageSize: query.pageSize,
    totalPages,
    status,
    search,
    goToPage,
    changePageSize,
  };
}
