import { useCallback, useEffect, useRef, useState } from "react";

// 목록 화면이 공통으로 쓰는 상태입니다.
// 검색 조건, 쪽 번호, 한 쪽 개수를 다룹니다.
//
// ★ 거르기와 쪽 나누기를 **서버가** 합니다.
//   예전에는 전체를 받아 브라우저에서 걸렀습니다. 수십 건일 때는 괜찮지만
//   1,000대가 되면 목록 전체를 내려받는 것 자체가 부담입니다. (NOTES.md 4-11)
//
//   이제 조건과 쪽 번호를 서버에 넘기고 그 쪽만 받습니다.
//   장비가 몇 대든 화면이 받는 양은 한 쪽 분량 그대로입니다.

export type PageResult<T> = {
  readonly rows: readonly T[];
  readonly totalCount: number;
};

export type LoadStatus = "loading" | "ready" | "error";

export function useTableState<F, T>(
  emptyFilters: F,
  /**
   * 조건과 쪽을 받아 그 쪽만 돌려줍니다.
   * useCallback 으로 고정해 주세요. 아니면 매번 다시 불러옵니다.
   */
  fetchPage: (filters: F, page: number, pageSize: number) => Promise<PageResult<T>>,
) {
  const [filters, setFilters] = useState<F>(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [rows, setRows] = useState<readonly T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<LoadStatus>("loading");

  // 요청이 뒤섞이는 것을 막습니다.
  //
  // ★ 빠르게 검색을 두 번 하면 늦게 보낸 요청이 먼저 도착할 수 있습니다.
  //   그러면 **옛 결과가 새 결과를 덮어씁니다.**
  //   번호를 붙여, 마지막으로 보낸 요청의 답만 받아들입니다.
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

  // 조건이 바뀌면 첫 쪽부터 다시 봅니다.
  const search = useCallback((next: F) => {
    setFilters(next);
    setPage(1);
  }, []);

  const changePageSize = useCallback((next: number) => {
    setPageSize(next);
    setPage(1);
  }, []);

  /** 등록·삭제 뒤에 지금 쪽을 다시 받아 옵니다. */
  const reload = useCallback(() => {
    void load(filters, page, pageSize);
  }, [load, filters, page, pageSize]);

  return {
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
