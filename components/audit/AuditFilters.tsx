import { useState } from "react";
import { FilterField, FilterForm } from "@/components/ui/FilterForm";
import { DateRangeField } from "@/components/ui/DateRangeField";
import {
  AUDIT_GROUPS,
  AUDIT_GROUP_LABEL,
  type AuditGroup,
  type AuditQuery,
} from "@/lib/audit/types";

type Draft = Omit<AuditQuery, "page" | "pageSize">;

const EMPTY_DRAFT: Draft = { from: "", to: "", group: "", keyword: "" };

export function AuditFilters({ onSearch }: { onSearch: (values: Draft) => void }) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
    setDraft(EMPTY_DRAFT);
    onSearch(EMPTY_DRAFT);
  };

  return (
    <FilterForm onSubmit={() => onSearch(draft)} onReset={handleReset}>
      <DateRangeField
        key={resetKey}
        label="조회 기간"
        idPrefix="audit"
        from={draft.from}
        to={draft.to}
        withTime
        onChange={(next) => setDraft((prev) => ({ ...prev, ...next }))}
      />

      <FilterField label="대상" htmlFor="audit-keyword">
        <input
          id="audit-keyword"
          type="search"
          value={draft.keyword}
          onChange={(event) => update("keyword", event.currentTarget.value)}
          placeholder="장비 IP·계정 아이디를 입력해주세요"
          className="input w-full"
        />
      </FilterField>

      <FilterField label="종류" htmlFor="audit-group">
        <select
          id="audit-group"
          value={draft.group}
          onChange={(event) =>
            update("group", event.currentTarget.value as AuditGroup | "")
          }
          className="select w-full"
        >
          <option value="">전체</option>
          {AUDIT_GROUPS.map((group) => (
            <option key={group} value={group}>
              {AUDIT_GROUP_LABEL[group]}
            </option>
          ))}
        </select>
      </FilterField>
    </FilterForm>
  );
}
