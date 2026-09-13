import Head from "next/head";
import { useCallback, useState } from "react";
import { useTableState } from "@/lib/useTableState";
import { useAuth } from "@/lib/auth";
import { canManageServers } from "@/lib/accounts/permissions";
import { ServerFilters } from "@/components/servers/ServerFilters";
import { ServerRegisterModal } from "@/components/servers/ServerRegisterModal";
import { ServerTable } from "@/components/servers/ServerTable";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ErrorModal } from "@/components/ui/ErrorModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchServerPage, useServerActions } from "@/lib/servers/useServers";
import {
  EMPTY_FILTERS,
  type NewServerInput,
  type Server,
  type ServerFilterValues,
} from "@/lib/servers/types";

// 서버관리 화면입니다.
//
// ★ 검색과 쪽 나누기를 **서버가** 합니다. (NOTES.md 4-11)
//   예전에는 전체를 받아 브라우저에서 걸렀습니다.
//   장비가 1,000대가 되면 목록 전체를 내려받는 것 자체가 부담이라 바꿨습니다.
export default function ServersPage() {
  const { account } = useAuth();
  const { addServer, updateServer, toggleEnabled, removeServers } =
    useServerActions();

  // 버튼을 숨기는 것은 화면 정리일 뿐입니다.
  // 실제 차단은 API 가 합니다. (pingcheck-be 의 requireServerManager)
  const canManage = account !== null && canManageServers(account);

  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const [registerOpen, setRegisterOpen] = useState(false);
  // null 이면 새로 등록하는 창, 값이 있으면 그 장비를 고치는 창입니다.
  const [editing, setEditing] = useState<Server | null>(null);
  // 실패했을 때 보여 줄 문구입니다. 비어 있으면 창이 닫힌 상태입니다.
  const [failMessage, setFailMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const table = useTableState<ServerFilterValues, Server>(
    EMPTY_FILTERS,
    fetchServerPage,
  );

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // 이번 쪽이 모두 선택돼 있으면 이번 쪽만 풀고, 아니면 이번 쪽을 모두 더합니다.
  //
  // ★ "전체 선택" 이 아니라 "이 쪽 선택" 입니다.
  //   쪽 나누기를 서버가 하므로 브라우저는 다른 쪽에 무엇이 있는지 모릅니다.
  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected =
        table.rows.length > 0 && table.rows.every((row) => next.has(row.id));

      for (const row of table.rows) {
        if (allSelected) next.delete(row.id);
        else next.add(row.id);
      }

      return next;
    });
  }, [table.rows]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleToggleEnabled = useCallback(
    async (id: string) => {
      const target = table.rows.find((row) => row.id === id);

      if (target === undefined) return;

      const message = await toggleEnabled(id, !target.enabled);

      if (message) {
        setFailMessage(message);
        return;
      }

      // 서버가 상태와 로그를 함께 바꿨으므로 지금 쪽을 다시 받습니다.
      table.reload();
    },
    [table, toggleEnabled],
  );

  const handleRegister = useCallback(
    async (input: NewServerInput) => {
      const result =
        editing === null
          ? await addServer(input)
          : await updateServer(editing.id, input);

      if (!result.ok) {
        setFailMessage(
          result.reason === "duplicate-ip"
            ? "이미 등록된 IP입니다."
            : editing === null
              ? "등록에 실패했습니다. 잠시 후 다시 시도해주세요."
              : "저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
        );
        return;
      }

      // 새로 등록한 것은 맨 위에 오므로 첫 쪽으로 돌아갑니다.
      if (editing === null) table.setPage(1);
      table.reload();
    },
    [addServer, updateServer, editing, table],
  );

  const handleDeleteSelected = useCallback(async () => {
    setBusy(true);

    try {
      const result = await removeServers([...selectedIds]);

      setSelectedIds(new Set());
      setConfirmDelete(false);
      table.reload();

      if (result.message) setFailMessage(result.message);
    } finally {
      setBusy(false);
    }
  }, [removeServers, selectedIds, table]);

  return (
    <>
      <Head>
        <title>서버관리 | PingCheck</title>
      </Head>

      <div className="space-y-4 px-6 py-4">
        <PageHeader breadcrumb={["시스템", "서버관리"]} title="서버관리" />

        {/* 검색 조건 */}
        <ServerFilters onSearch={table.search} />

        {/* 서버 목록 */}
        {table.status === "error" ? (
          <div className="panel px-4 py-10 text-center text-b2_body_r text-muted">
            서버 목록을 불러오지 못했습니다.
          </div>
        ) : (
          <ServerTable
            rows={table.rows}
            totalCount={table.totalCount}
            page={table.page}
            totalPages={table.totalPages}
            pageSize={table.pageSize}
            selectedIds={selectedIds}
            onPageChange={table.setPage}
            onPageSizeChange={table.changePageSize}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onClearSelection={handleClearSelection}
            onToggleEnabled={(id) => void handleToggleEnabled(id)}
            onRegisterClick={() => {
              setEditing(null);
              setRegisterOpen(true);
            }}
            onDeleteSelected={() => setConfirmDelete(true)}
            onRowClick={
              canManage
                ? (server) => {
                    setEditing(server);
                    setRegisterOpen(true);
                  }
                : undefined
            }
          />
        )}

        <ServerRegisterModal
          open={registerOpen}
          editing={editing}
          onClose={() => setRegisterOpen(false)}
          onSubmit={handleRegister}
        />

        <ConfirmModal
          open={confirmDelete}
          title="선택한 장비 삭제"
          message={`${selectedIds.size}대를 지웁니다. 되돌릴 수 없습니다.\n(지금까지 쌓인 로그는 남습니다)`}
          confirmLabel="삭제"
          busy={busy}
          onConfirm={() => void handleDeleteSelected()}
          onClose={() => setConfirmDelete(false)}
        />

        <ErrorModal
          open={failMessage !== ""}
          title="처리하지 못했습니다"
          message={failMessage}
          onClose={() => setFailMessage("")}
        />
      </div>
    </>
  );
}
