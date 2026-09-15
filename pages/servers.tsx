import Head from "next/head";
import { useCallback, useState } from "react";
import { useTableState } from "@/lib/useTableState";
import { useAuth } from "@/lib/auth";
import { canManageServers } from "@/lib/accounts/permissions";
import { RequirePermission } from "@/components/auth/RequirePermission";
import { ServerFilters } from "@/components/servers/ServerFilters";
import { ServerImportModal } from "@/components/servers/ServerImportModal";
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

export default function ServersPageRoute() {
  return (
    <RequirePermission allow={canManageServers}>
      <ServersPage />
    </RequirePermission>
  );
}

function ServersPage() {
  const { account } = useAuth();
  const {
    addServer,
    updateServer,
    toggleEnabled,
    removeServers,
    downloadServers,
    downloadTemplate,
    downloading,
    importServers,
  } = useServerActions();

  const canManage = account !== null && canManageServers(account);

  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editing, setEditing] = useState<Server | null>(null);
  const [failMessage, setFailMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
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

      if (editing === null) table.setPage(1);
      table.reload();
    },
    [addServer, updateServer, editing, table],
  );

  const handleDownload = useCallback(async () => {
    const message = await downloadServers(table.filters);

    if (message) setFailMessage(message);
  }, [downloadServers, table.filters]);

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

      <div className="flex h-full min-h-0 flex-col gap-4 px-6 py-4">
        <PageHeader breadcrumb={["시스템", "서버관리"]} title="서버관리" />

        <ServerFilters onSearch={table.search} />

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
            onDownload={() => void handleDownload()}
            downloading={downloading}
            onImportClick={() => setImportOpen(true)}
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

        <ServerImportModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          onDownloadTemplate={downloadTemplate}
          onSubmit={importServers}
          onDone={() => {
            table.setPage(1);
            table.reload();
          }}
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
