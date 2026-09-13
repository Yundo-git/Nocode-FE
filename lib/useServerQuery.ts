import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { downloadFile } from "@/lib/api/download";

// 서버가 걸러 주는 목록 화면의 상태입니다. (로그조회 · 작업이력)
//
// ★ 두 화면이 똑같은 일을 합니다.
//   조건을 주소로 만들어 한 쪽만 받아 오고, 같은 조건으로 CSV 를 내려받고,
//   조건이 바뀌면 첫 쪽으로 돌아갑니다. 따로 두면 한쪽만 고치는 일이 생깁니다.
//   (전에는 두 훅이 204줄 중 28줄만 달랐습니다)
//
// ★ useTableState 와 무엇이 다른가
//   그쪽은 조건과 쪽 번호를 따로 들고 있어 서버관리·계정관리가 씁니다.
//   여기는 조건 안에 쪽 번호가 함께 들어 있고 **내려받기**가 붙습니다.
//   합치려면 양쪽 다 어정쩡해져서 둘로 둡니다.

type Page<R> = { readonly rows: readonly R[]; readonly totalCount: number };

export type QueryStatus = "loading" | "ready" | "error";

/**
 * 조건을 주소 뒤에 붙일 문자열로 바꿉니다.
 *
 * ★ 빈 값은 보내지 않습니다. 서버에서 "조건 없음" 과 같지만 주소가 지저분해지고,
 *   무엇으로 걸렀는지 주소만 보고 알 수 없게 됩니다.
 */
function toSearch(query: Record<string, unknown>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    const text = typeof value === "string" ? value.trim() : String(value);

    if (text !== "") params.set(key, text);
  }

  return params.toString();
}

export function useServerQuery<Q extends { page: number; pageSize: number }, R>(
  /** "/logs" 처럼 앞의 /api 를 뺀 주소입니다. 내려받기는 여기에 /export 를 붙입니다. */
  path: string,
  emptyQuery: Q,
  /** 서버가 "다 담지 못했다" 고 알려 줬을 때 보여 줄 문구입니다. */
  whenTruncated: string,
) {
  const [query, setQuery] = useState<Q>(emptyQuery);
  const [page, setPage] = useState<Page<R>>({ rows: [], totalCount: 0 });
  const [status, setStatus] = useState<QueryStatus>("loading");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let alive = true;

    setStatus("loading");

    api
      .get<Page<R>>(`${path}?${toSearch(query)}`)
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
  }, [path, query]);

  /**
   * 지금 조건 그대로 CSV 를 내려받습니다.
   *
   * ★ 보고 있는 쪽이 아니라 **조건에 맞는 전체**를 받습니다.
   *   50줄만 받으려고 내려받기를 누르지는 않습니다.
   */
  const download = useCallback(async (): Promise<string> => {
    setDownloading(true);

    try {
      return await downloadFile(`${path}/export?${toSearch(query)}`, whenTruncated);
    } finally {
      setDownloading(false);
    }
  }, [path, query, whenTruncated]);

  // 조건이 바뀌면 첫 쪽부터 다시 봅니다.
  const search = useCallback((next: Omit<Q, "page" | "pageSize">) => {
    setQuery((prev) => ({ ...prev, ...next, page: 1 }));
  }, []);

  const goToPage = useCallback((next: number) => {
    setQuery((prev) => ({ ...prev, page: next }));
  }, []);

  const changePageSize = useCallback((next: number) => {
    setQuery((prev) => ({ ...prev, pageSize: next, page: 1 }));
  }, []);

  return {
    rows: page.rows,
    totalCount: page.totalCount,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(page.totalCount / query.pageSize)),
    status,
    search,
    goToPage,
    changePageSize,
    download,
    downloading,
  };
}
