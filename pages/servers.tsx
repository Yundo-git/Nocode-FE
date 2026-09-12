import Head from "next/head";
import { useCallback, useMemo, useState } from "react";
import { ServerFilters } from "@/components/servers/ServerFilters";
import { ServerTable } from "@/components/servers/ServerTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { useServers } from "@/lib/servers/useServers";
import {
  EMPTY_FILTERS,
  type Server,
  type ServerFilterValues,
} from "@/lib/servers/types";

// 검색 조건에 맞는 서버만 걸러 냅니다.
// 지금은 브라우저에서 거르지만, 백엔드가 붙으면 이 조건을 그대로
// 서버에 넘기고 이 함수는 지우면 됩니다.
function applyFilters(
  servers: readonly Server[],
  filters: ServerFilterValues,
): readonly Server[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return servers.filter((server) => {
    if (keyword) {
      const haystack = `${server.name} ${server.ip} ${server.id}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }

    if (filters.type && server.type !== filters.type) return false;
    if (filters.status && server.status !== filters.status) return false;

    // 날짜는 YYYY-MM-DD 문자열끼리 비교해도 순서가 맞습니다.
    const checkedDate = server.checkedAt.slice(0, 10);
    if (filters.from && checkedDate < filters.from) return false;
    if (filters.to && checkedDate > filters.to) return false;

    return true;
  });
}

export default function ServersPage() {
  const { servers, status, toggleEnabled } = useServers();

  const [filters, setFilters] = useState<ServerFilterValues>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());

  const filtered = useMemo(
    () => applyFilters(servers, filters),
    [servers, filters],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  // 조건이 바뀌어 쪽 수가 줄면 현재 쪽이 범위를 넘을 수 있어 잘라 줍니다.
  const currentPage = Math.min(page, totalPages);

  const rows = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize],
  );

  const handleSearch = useCallback((next: ServerFilterValues) => {
    setFilters(next);
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((next: number) => {
    setPageSize(next);
    setPage(1);
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // 이번 쪽이 모두 선택돼 있으면 이번 쪽만 풀고, 아니면 이번 쪽을 모두 더합니다.
  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = rows.length > 0 && rows.every((row) => next.has(row.id));

      for (const row of rows) {
        if (allSelected) next.delete(row.id);
        else next.add(row.id);
      }

      return next;
    });
  }, [rows]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return (
    <>
      <Head>
        <title>서버관리 | PingCheck</title>
      </Head>

      <div className="space-y-4 px-6 py-4">
        <PageHeader
          breadcrumb={["시스템", "서버관리"]}
          title="서버관리"
          actions={
            <>
              <button type="button" className="btn btn-ghost btn-md">
                미리보기
              </button>
              <button type="button" className="btn btn-primary btn-md">
                등록
              </button>
            </>
          }
        />

        {/* 검색 조건 */}
        <ServerFilters onSearch={handleSearch} />

        {/* 서버 목록 */}
        {status === "error" ? (
          <div className="panel px-4 py-10 text-center text-b2_body_r text-muted">
            서버 목록을 불러오지 못했습니다.
          </div>
        ) : (
          <ServerTable
            rows={rows}
            totalCount={filtered.length}
            page={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            selectedIds={selectedIds}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onClearSelection={handleClearSelection}
            onToggleEnabled={toggleEnabled}
          />
        )}
      </div>
    </>
  );
}
