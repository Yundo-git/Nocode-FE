import { useState } from "react";
import { FilterField, FilterForm } from "@/components/ui/FilterForm";
import { DateRangeField } from "@/components/ui/DateRangeField";
import {
  BUSINESS_DIVISIONS,
  type BusinessDivisionId,
} from "@/lib/businessDivisions";
import {
  LOG_TYPES,
  LOG_TYPE_LABEL,
  type LogQuery,
  type LogType,
} from "@/lib/logs/types";

type Draft = Omit<LogQuery, "page" | "pageSize">;

const EMPTY_DRAFT: Draft = {
  from: "",
  to: "",
  serverId: "",
  keyword: "",
  type: "",
  divisionId: "",
};

type LogFiltersProps = {
  onSearch: (values: Draft) => void;
};

export function LogFilters({ onSearch }: LogFiltersProps) {
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
        idPrefix="log"
        from={draft.from}
        to={draft.to}
        withTime
        onChange={(next) => setDraft((prev) => ({ ...prev, ...next }))}
      />

      <FilterField label="장비명 · IP" htmlFor="log-keyword">
        <input
          id="log-keyword"
          type="search"
          value={draft.keyword}
          onChange={(event) => update("keyword", event.currentTarget.value)}
          placeholder="한글명·영문명·IP를 입력해주세요"
          className="input w-full"
        />
      </FilterField>

      <FilterField label="업무구분" htmlFor="log-division">
        <select
          id="log-division"
          value={draft.divisionId}
          onChange={(event) =>
            update(
              "divisionId",
              event.currentTarget.value as BusinessDivisionId | "",
            )
          }
          className="select w-full"
        >
          <option value="">전체</option>
          {BUSINESS_DIVISIONS.map((division) => (
            <option key={division.id} value={division.id}>
              {division.label}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label="로그 종류" htmlFor="log-type">
        <select
          id="log-type"
          value={draft.type}
          onChange={(event) =>
            update("type", event.currentTarget.value as LogType | "")
          }
          className="select w-full"
        >
          <option value="">전체</option>
          {LOG_TYPES.map((type) => (
            <option key={type} value={type}>
              {LOG_TYPE_LABEL[type]}
            </option>
          ))}
        </select>
      </FilterField>
    </FilterForm>
  );
}
