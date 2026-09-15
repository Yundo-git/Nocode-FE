import { useCallback, useEffect, useRef, useState } from "react";

export type PageResult<T> = {
  readonly rows: readonly T[];
  readonly totalCount: number;
};

export type LoadStatus = "loading" | "ready" | "error";

export function useTableState<F, T>(
  emptyFilters: F,
  fetchPage: (filters: F, page: number, pageSize: number) => Promise<PageResult<T>>,
) {
  const [filters, setFilters] = useState<F>(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [rows, setRows] = useState<readonly T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<LoadStatus>("loading");

  const requestId = useRef(0);

  const load = useCallback(
    async (nextFilters: F, nextPage: number, nextSize: number) => {
      const id = ++requestId.current;

      setStatus("loading");

      try {
        const result = await fetchPage(nextFilters, nextPage, nextSize);

        if (id !== requestId.current) return;

        setRows(result.rows);
        setTotalCount(result.totalCount);
        setStatus("ready");
      } catch {
        if (id !== requestId.current) return;

        setStatus("error");
      }
    },
    [fetchPage],
  );

  useEffect(() => {
    void load(filters, page, pageSize);
  }, [load, filters, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const search = useCallback((next: F) => {
    setFilters(next);
    setPage(1);
  }, []);

  const changePageSize = useCallback((next: number) => {
    setPageSize(next);
    setPage(1);
  }, []);

  const reload = useCallback(() => {
    void load(filters, page, pageSize);
  }, [load, filters, page, pageSize]);

  return {
    filters,
    rows,
    totalCount,
    status,
    page: Math.min(page, totalPages),
    pageSize,
    totalPages,
    search,
    setPage,
    changePageSize,
    reload,
  };
}
