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

// 장비 목록은 DB 에 있습니다.
//
// ★ 거르기·쪽 나누기를 서버가 합니다. 전체를 받지 않습니다.
//   장비가 1,000대여도 화면이 받는 양은 한 쪽 분량 그대로입니다.

/**
 * 검색 조건만 주소 문자열로 만듭니다.
 * 목록과 내려받기가 같이 씁니다. (내려받기는 쪽을 나누지 않습니다)
 */
function toFilterParams(filters: ServerFilterValues): URLSearchParams {
  const params = new URLSearchParams();

  // 빈 값은 보내지 않습니다. 서버에서 "조건 없음" 과 같지만 주소가 지저분해집니다.
  if (filters.keyword.trim()) params.set("keyword", filters.keyword.trim());
  if (filters.type) params.set("type", filters.type);
  if (filters.divisionId) params.set("divisionId", filters.divisionId);
  if (filters.status) params.set("status", filters.status);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  return params;
}

/** 검색 조건과 쪽 번호를 주소 문자열로 만듭니다. */
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

/** 한 쪽을 받아 옵니다. useTableState 에 넘깁니다. */
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

/** 일괄등록 결과입니다. 파일 자체가 잘못됐으면 ok 가 거짓입니다. */
export type ImportOutcome =
  | { readonly ok: true; readonly result: ImportResult }
  | { readonly ok: false; readonly message: string };

/**
 * 장비를 만들고 고치고 지웁니다.
 *
 * 목록 상태는 useTableState 가 들고 있으므로, 여기서는 **요청만** 보냅니다.
 * 끝나면 부르는 쪽이 reload() 로 지금 쪽을 다시 받습니다.
 *
 * ★ 화면에서 목록을 직접 고치지 않는 이유
 *   쪽 나누기를 서버가 하기 때문에, 한 대를 지우면 다음 쪽의 첫 줄이
 *   이 쪽으로 올라와야 합니다. 브라우저가 그것을 알 수 없습니다.
 */
export function useServerActions() {
  // 내려받는 동안 버튼을 잠그는 용도입니다.
  const [downloading, setDownloading] = useState(false);

  const addServer = useCallback(
    async (input: NewServerInput): Promise<AddServerResult> => {
      const res = await api.post<Server>("/servers", input);

      if (!res.ok) {
        // 409 는 "이미 있는 IP" 라는 뜻입니다.
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

  /** 사용여부(핑을 쏠지)를 켜고 끕니다. 성공하면 빈 문자열입니다. */
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

  /**
   * 지금 조건 그대로 목록을 내려받습니다.
   *
   * ★ 보고 있는 쪽이 아니라 **조건에 맞는 전체**입니다.
   *   10줄만 받으려고 내려받기를 누르지는 않습니다.
   */
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

  /** 일괄등록 양식을 내려받습니다. 조건이 없어 주소가 그대로입니다. */
  const downloadTemplate = useCallback(async (): Promise<string> => {
    return downloadFile("/servers/template");
  }, []);

  /**
   * 파일 내용을 올려 여러 대를 한 번에 등록합니다.
   *
   * 되는 줄만 들어갑니다. 안 된 줄은 줄 번호와 이유가 함께 옵니다.
   * (파일 자체가 잘못됐으면 ok:false 로 한 줄 문구만 옵니다)
   */
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
