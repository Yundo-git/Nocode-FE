import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { downloadFile } from "@/lib/api/download";
import { EMPTY_AUDIT_QUERY, type AuditPage, type AuditQuery } from "@/lib/audit/types";

export type AuditStatus = "loading" | "ready" | "error";

// 조건을 주소 뒤에 붙일 문자열로 바꿉니다. 빈 값은 보내지 않습니다.
function toSearch(query: AuditQuery): string {
  const params = new URLSearchParams();

  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));

  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.group) params.set("group", query.group);
  if (query.keyword.trim()) params.set("keyword", query.keyword.trim());

  return params.toString();
}

export function useAudit() {
  const [query, setQuery] = useState<AuditQuery>(EMPTY_AUDIT_QUERY);
  const [page, setPage] = useState<AuditPage>({ rows: [], totalCount: 0 });
  const [status, setStatus] = useState<AuditStatus>("loading");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let alive = true;

    setStatus("loading");

    api
      .get<AuditPage>(`/audit?${toSearch(query)}`)
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
  }, [query]);

  const download = useCallback(async (): Promise<string> => {
    setDownloading(true);

    try {
      return await downloadFile(
        `/audit/export?${toSearch(query)}`,
        "너무 많아 최근 50,000건만 받았습니다. 기간을 좁혀 다시 받아 주세요.",
      );
    } finally {
      setDownloading(false);
    }
  }, [query]);

  // 조건이 바뀌면 첫 쪽부터 다시 봅니다.
  const search = useCallback((next: Omit<AuditQuery, "page" | "pageSize">) => {
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
