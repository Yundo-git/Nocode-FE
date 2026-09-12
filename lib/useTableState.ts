import { useCallback, useMemo, useState } from "react";

// 목록 화면이 공통으로 쓰는 상태입니다.
// 검색 조건, 쪽 번호, 한 쪽 개수를 다루고 이번 쪽에 보여 줄 줄까지 잘라 줍니다.
//
// 지금은 브라우저에서 걸러 냅니다. 백엔드가 쪽 단위로 내려 주게 되면
// applyFilters 를 서버 호출로 바꾸고 totalCount 만 응답 값으로 받으면 됩니다.
export function useTableState<F, T>(
  emptyFilters: F,
  /** 조건에 맞는 줄을 모두 돌려줍니다. useCallback 으로 고정해 주세요. */
  applyFilters: (filters: F) => readonly T[],
) {
  const [filters, setFilters] = useState<F>(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => applyFilters(filters), [applyFilters, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  // 조건이 바뀌어 쪽 수가 줄면 현재 쪽이 범위를 넘을 수 있어 잘라 줍니다.
  const currentPage = Math.min(page, totalPages);

  const rows = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize],
  );

  // 조건이 바뀌면 첫 쪽부터 다시 봅니다.
  const search = useCallback((next: F) => {
    setFilters(next);
    setPage(1);
  }, []);

  const changePageSize = useCallback((next: number) => {
    setPageSize(next);
    setPage(1);
  }, []);

  return {
    rows,
    totalCount: filtered.length,
    page: currentPage,
    pageSize,
    totalPages,
    search,
    setPage,
    changePageSize,
  };
}
