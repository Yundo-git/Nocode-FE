import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { downloadFile } from "@/lib/api/download";

type Page<R> = { readonly rows: readonly R[]; readonly totalCount: number };

export type QueryStatus = "loading" | "ready" | "error";

function toSearch(query: Record<string, unknown>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    const text = typeof value === "string" ? value.trim() : String(value);

    if (text !== "") params.set(key, text);
  }

  return params.toString();
}

export function useServerQuery<Q extends { page: number; pageSize: number }, R>(
  path: string,
  emptyQuery: Q,
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

  const download = useCallback(async (): Promise<string> => {
    setDownloading(true);

    try {
      return await downloadFile(`${path}/export?${toSearch(query)}`, whenTruncated);
    } finally {
      setDownloading(false);
    }
  }, [path, query, whenTruncated]);

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
