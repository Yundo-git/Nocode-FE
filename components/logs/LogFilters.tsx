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

// 로그 조회 조건입니다.
// "특정 시간 · 특정 장비 · 특정 종류" 를 고르는 것이 목적입니다.
export function LogFilters({ onSearch }: LogFiltersProps) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setDraft(EMPTY_DRAFT);
    onSearch(EMPTY_DRAFT);
  };

  return (
    <FilterForm onSubmit={() => onSearch(draft)} onReset={handleReset}>
      {/* 기간. 서버관리와 같은 칸을 씁니다.
          다만 여기는 시각까지 고릅니다 — 장애는 몇 시 몇 분인지가 중요합니다. */}
      <DateRangeField
        label="조회 기간"
        idPrefix="log"
        from={draft.from}
        to={draft.to}
        withTime
        onChange={(next) => setDraft((prev) => ({ ...prev, ...next }))}
      />

      {/* 장비를 검색어로 찾습니다. 서버관리의 "서버명 · IP" 와 같은 방식입니다.
          ★ 전에는 장비를 전부 담은 선택 상자였습니다.
            1,000대가 되면 상자에서 찾는 것도 어렵고, 목록을 받는 것만으로
            60KB 가 넘어갔습니다.
          ★ 로그에는 그 시점의 이름과 IP 가 적혀 있어, 장비 이름을 바꿔도
            **예전 이름으로 과거 기록을 찾을 수 있습니다.** */}
      <FilterField label="장비명 · IP" htmlFor="log-keyword">
        <input
          id="log-keyword"
          type="search"
          value={draft.keyword}
          onChange={(event) => update("keyword", event.currentTarget.value)}
          placeholder="장비명이나 IP를 입력해주세요"
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
