import { useServerQuery } from "@/lib/useServerQuery";
import { EMPTY_AUDIT_QUERY, type AuditEntry, type AuditQuery } from "@/lib/audit/types";

export function useAudit() {
  return useServerQuery<AuditQuery, AuditEntry>(
    "/audit",
    EMPTY_AUDIT_QUERY,
    "너무 많아 최근 50,000건만 받았습니다. 기간을 좁혀 다시 받아 주세요.",
  );
}
