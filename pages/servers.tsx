import Head from "next/head";
import { useCallback, useMemo, useState } from "react";
import { ServerFilters } from "@/components/servers/ServerFilters";
import { ServerRegisterModal } from "@/components/servers/ServerRegisterModal";
import { ServerTable } from "@/components/servers/ServerTable";
import { ErrorModal } from "@/components/ui/ErrorModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { useServers } from "@/lib/servers/useServers";
import {
  EMPTY_FILTERS,
  getDisplayState,
  type NewServerInput,
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
      const haystack =
        `${server.nameEn} ${server.nameKo} ${server.ip}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }

    if (filters.type && server.type !== filters.type) return false;
    if (filters.divisionId && server.divisionId !== filters.divisionId) {
      return false;
    }
    // 상태는 핑 결과가 아니라 화면에 보이는 점(정상/비정상/미연결) 기준으로 거릅니다.
    if (filters.status && getDisplayState(server) !== filters.status) return false;

    // 날짜는 YYYY-MM-DD 문자열끼리 비교해도 순서가 맞습니다.
    const checkedDate = server.checkedAt.slice(0, 10);
    if (filters.from && checkedDate < filters.from) return false;
    if (filters.to && checkedDate > filters.to) return false;

    return true;
  });
}

export default function ServersPage() {
  const { servers, status, addServer, toggleEnabled } = useServers();

  const [filters, setFilters] = useState<ServerFilterValues>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const [registerOpen, setRegisterOpen] = useState(false);
  // 등록이 실패했을 때 보여 줄 문구입니다. 비어 있으면 창이 닫힌 상태입니다.
  const [registerError, setRegisterError] = useState("");

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

  // 등록하면 새 줄이 맨 위에 붙습니다. 검색 조건 때문에 안 보일 수 있으므로
  // 첫 쪽으로 되돌려 줍니다.
  //
  // 같은 IP 가 이미 있으면 등록되지 않고 실패 창이 뜹니다.
  const handleRegister = useCallback(
    (input: NewServerInput) => {
      const result = addServer(input);

      if (!result.ok) {
        setRegisterError("이미 등록된 IP입니다.");
        return;
      }

      setPage(1);
    },
    [addServer],
  );

  return (
    <>
      <Head>
        <title>서버관리 | PingCheck</title>
      </Head>

      <div className="space-y-4 px-6 py-4">
        <PageHeader breadcrumb={["시스템", "서버관리"]} title="서버관리" />

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
            onRegisterClick={() => setRegisterOpen(true)}
          />
        )}

        <ServerRegisterModal
          open={registerOpen}
          onClose={() => setRegisterOpen(false)}
          onSubmit={handleRegister}
        />

        <ErrorModal
          open={registerError !== ""}
          title="등록 실패"
          message={registerError}
          onClose={() => setRegisterError("")}
        />
      </div>
    </>
  );
}
