import { useState } from "react";
import { FilterField, FilterForm } from "@/components/ui/FilterForm";
import { DateRangeField } from "@/components/ui/DateRangeField";
import {
  BUSINESS_DIVISIONS,
  type BusinessDivisionId,
} from "@/lib/businessDivisions";
import {
  DISPLAY_STATE_LABEL,
  EMPTY_FILTERS,
  SERVER_TYPES,
  type ServerDisplayState,
  type ServerFilterValues,
  type ServerType,
} from "@/lib/servers/types";

type ServerFiltersProps = {
  onSearch: (values: ServerFilterValues) => void;
};

const STATUS_OPTIONS: readonly ServerDisplayState[] = [
  "online",
  "offline",
  "pending",
  "disabled",
];

export function ServerFilters({ onSearch }: ServerFiltersProps) {
  const [draft, setDraft] = useState<ServerFilterValues>(EMPTY_FILTERS);

  const update = <K extends keyof ServerFilterValues>(
    key: K,
    value: ServerFilterValues[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
    setDraft(EMPTY_FILTERS);
    onSearch(EMPTY_FILTERS);
  };

  return (
    <FilterForm onSubmit={() => onSearch(draft)} onReset={handleReset}>
          <DateRangeField
            key={resetKey}
            label="마지막 확인"
            idPrefix="server"
            from={draft.from}
            to={draft.to}
            onChange={(next) => setDraft((prev) => ({ ...prev, ...next }))}
          />

          <FilterField label="서버명 · IP" htmlFor="filter-keyword">
            <input
              id="filter-keyword"
              type="search"
              value={draft.keyword}
              onChange={(event) => update("keyword", event.currentTarget.value)}
              placeholder="서버명이나 IP를 입력해주세요"
              className="input w-full"
            />
          </FilterField>

          <FilterField label="타입" htmlFor="filter-type">
            <select
              id="filter-type"
              value={draft.type}
              onChange={(event) =>
              update("type", event.currentTarget.value as ServerType | "")
            }
              className="select w-full"
            >
              <option value="">전체</option>
              {SERVER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="업무구분" htmlFor="filter-division">
            <select
              id="filter-division"
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

          <FilterField label="상태" htmlFor="filter-status">
            <select
              id="filter-status"
              value={draft.status}
              onChange={(event) =>
                update("status", event.currentTarget.value as ServerDisplayState | "")
              }
              className="select w-full"
            >
              <option value="">전체</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {DISPLAY_STATE_LABEL[status]}
                </option>
              ))}
            </select>
          </FilterField>
    </FilterForm>
  );
}
