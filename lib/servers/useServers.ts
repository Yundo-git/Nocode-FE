import { useCallback, useState } from "react";
import { api } from "@/lib/api/client";
import { downloadFile } from "@/lib/api/download";
import type { PageResult } from "@/lib/useTableState";
import type {
  AddServerResult,
  ImportResult,
  NewServerInput,
  Server,
  ServerFilterValues,
} from "@/lib/servers/types";

function toFilterParams(filters: ServerFilterValues): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) params.set("keyword", filters.keyword.trim());
  if (filters.type) params.set("type", filters.type);
  if (filters.divisionId) params.set("divisionId", filters.divisionId);
  if (filters.status) params.set("status", filters.status);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  return params;
}

function toQuery(
  filters: ServerFilterValues,
  page: number,
  pageSize: number,
): string {
  const params = toFilterParams(filters);

  params.set("page", String(page));
  params.set("pageSize", String(pageSize));

  return params.toString();
}

export async function fetchServerPage(
  filters: ServerFilterValues,
  page: number,
  pageSize: number,
): Promise<PageResult<Server>> {
  const res = await api.get<PageResult<Server>>(
    `/servers?${toQuery(filters, page, pageSize)}`,
  );

  if (!res.ok) throw new Error(res.message);

  return res.data;
}

export type ImportOutcome =
  | { readonly ok: true; readonly result: ImportResult }
  | { readonly ok: false; readonly message: string };

export function useServerActions() {
  const [downloading, setDownloading] = useState(false);

  const addServer = useCallback(
    async (input: NewServerInput): Promise<AddServerResult> => {
      const res = await api.post<Server>("/servers", input);

      if (!res.ok) {
        return {
          ok: false,
          reason: res.status === 409 ? "duplicate-ip" : "request-failed",
        };
      }

      return { ok: true };
    },
    [],
  );

  const updateServer = useCallback(
    async (id: string, input: NewServerInput): Promise<AddServerResult> => {
      const res = await api.put<Server>(`/servers/${id}`, input);

      if (!res.ok) {
        return {
          ok: false,
          reason: res.status === 409 ? "duplicate-ip" : "request-failed",
        };
      }

      return { ok: true };
    },
    [],
  );

  const toggleEnabled = useCallback(
    async (id: string, next: boolean): Promise<string> => {
      const res = await api.patch<Server>(`/servers/${id}`, { enabled: next });

      return res.ok ? "" : res.message;
    },
    [],
  );

  const removeServers = useCallback(
    async (ids: readonly string[]): Promise<{ removed: number; message: string }> => {
      const res = await api.post<{
        removed: string[];
        failed: { id: string; reason: string }[];
      }>("/servers/bulk-delete", { ids });

      if (!res.ok) return { removed: 0, message: res.message };

      const failed = res.data.failed;

      return {
        removed: res.data.removed.length,
        message:
          failed.length === 0
            ? ""
            : `${failed.length}대를 지우지 못했습니다. (${failed[0]?.reason ?? ""})`,
      };
    },
    [],
  );

  const downloadServers = useCallback(
    async (filters: ServerFilterValues): Promise<string> => {
      setDownloading(true);

      try {
        return await downloadFile(
          `/servers/export?${toFilterParams(filters).toString()}`,
          "너무 많아 5,000대만 받았습니다. 조건을 좁혀 다시 받아 주세요.",
        );
      } finally {
        setDownloading(false);
      }
    },
    [],
  );

  const downloadTemplate = useCallback(async (): Promise<string> => {
    return downloadFile("/servers/template");
  }, []);

  const importServers = useCallback(
    async (text: string): Promise<ImportOutcome> => {
      const res = await api.postCsv<ImportResult>("/servers/import", text);

      return res.ok ? { ok: true, result: res.data } : { ok: false, message: res.message };
    },
    [],
  );

  return {
    addServer,
    updateServer,
    toggleEnabled,
    removeServers,
    downloadServers,
    downloadTemplate,
    downloading,
    importServers,
  };
}
