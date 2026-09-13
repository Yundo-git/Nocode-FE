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

// 작업 이력 조회 조건입니다.
// "언제 · 어떤 종류 · 누가/무엇에" 를 좁히는 것이 목적입니다.
export function AuditFilters({ onSearch }: { onSearch: (values: Draft) => void }) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  // "초기화" 를 누를 때마다 올립니다. 기간 칸을 새로 만들어 "전체" 로 되돌립니다.
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
    setDraft(EMPTY_DRAFT);
    onSearch(EMPTY_DRAFT);
  };

  return (
    <FilterForm onSubmit={() => onSearch(draft)} onReset={handleReset}>
      {/* 로그조회와 같은 칸입니다. 시각까지 고릅니다 —
          "그때 누가 들어왔나" 를 되짚을 때 분 단위가 필요합니다. */}
      <DateRangeField
        key={resetKey}
        label="조회 기간"
        idPrefix="audit"
        from={draft.from}
        to={draft.to}
        withTime
        onChange={(next) => setDraft((prev) => ({ ...prev, ...next }))}
      />

      {/* 무엇에 한 일인지로 찾습니다. 장비 IP 나 계정 아이디입니다.
          ★ 한 사람이 한 일을 몰아 보고 싶을 때도 같은 칸에 그 아이디를 치면
            됩니다. 대상으로도 사람으로도 함께 찾습니다 — 치는 사람은
            그게 어느 쪽인지 가릴 이유가 없습니다. */}
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
