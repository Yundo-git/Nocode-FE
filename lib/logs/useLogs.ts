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
  if (query.keyword.trim()) params.set("keyword", query.keyword.trim());
  if (query.type) params.set("type", query.type);
  if (query.divisionId) params.set("divisionId", query.divisionId);

  return params.toString();
}

// 로그 조회 상태입니다.
//
// 조건과 쪽 번호를 서버로 보내고 그 쪽만 받아 옵니다.
// (서버관리·계정관리도 이제 같은 방식입니다)
export function useLogs() {
  const [query, setQuery] = useState<LogQuery>(EMPTY_LOG_QUERY);
  const [page, setPage] = useState<LogPage>({ rows: [], totalCount: 0 });
  const [status, setStatus] = useState<LogStatus>("loading");
  const [downloading, setDownloading] = useState(false);

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

  /**
   * 지금 조건 그대로 CSV 를 내려받습니다.
   *
   * ★ 보고 있는 쪽이 아니라 **조건에 맞는 전체**를 받습니다.
   *   50줄만 받으려고 내려받기를 누르지는 않습니다.
   *
   * ★ 평범한 링크(<a download>)를 쓰지 않는 이유
   *   그러면 실패해도 빈 파일이 받아지고 사람은 이유를 모릅니다.
   *   여기서 받아 보고, 잘렸으면 알려 주고, 실패하면 문구를 돌려줍니다.
   */
  const download = useCallback(async (): Promise<string> => {
    setDownloading(true);

    try {
      const res = await fetch(`/api/logs/export?${toSearch(query)}`, {
        credentials: "include",
        headers: { "X-Background": "1" },
      });

      if (!res.ok) return "내려받지 못했습니다. 잠시 후 다시 시도해주세요.";

      const blob = await res.blob();

      // 서버가 정한 파일 이름을 그대로 씁니다.
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const matched = /filename="([^"]+)"/.exec(disposition);
      const filename = matched?.[1] ?? "pingcheck-logs.csv";

      // 받은 내용을 주소로 만들어 눌러 줍니다.
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      // 안 풀어 주면 받은 내용이 메모리에 그대로 남습니다.
      URL.revokeObjectURL(url);

      return res.headers.get("X-Export-Truncated") === "1"
        ? "너무 많아 최근 50,000건만 받았습니다. 기간을 좁혀 다시 받아 주세요."
        : "";
    } catch {
      return "서버에 연결하지 못했습니다.";
    } finally {
      setDownloading(false);
    }
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
    download,
    downloading,
  };
}
