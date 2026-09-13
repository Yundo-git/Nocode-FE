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
  /** 검색 버튼을 눌렀을 때만 위로 올려 보냅니다. */
  onSearch: (values: ServerFilterValues) => void;
};

const STATUS_OPTIONS: readonly ServerDisplayState[] = [
  "online",
  "offline",
  "disabled",
];

// 검색 조건 영역입니다.
// 입력 중인 값은 여기서만 들고 있다가 "검색"을 눌러야 위로 전달합니다.
// (글자 하나 칠 때마다 목록 전체가 다시 그려지지 않게 하려는 것입니다.)
export function ServerFilters({ onSearch }: ServerFiltersProps) {
  const [draft, setDraft] = useState<ServerFilterValues>(EMPTY_FILTERS);

  // 한 항목만 바꿔서 새 객체를 만듭니다.
  const update = <K extends keyof ServerFilterValues>(
    key: K,
    value: ServerFilterValues[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  // "초기화" 를 누를 때마다 올립니다. 기간 칸을 새로 만들어 "전체" 로 되돌립니다.
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
    setDraft(EMPTY_FILTERS);
    onSearch(EMPTY_FILTERS);
  };

  return (
    <FilterForm onSubmit={() => onSearch(draft)} onReset={handleReset}>
          {/* 등록일시. 로그조회와 같은 칸을 씁니다. */}
          <DateRangeField
            key={resetKey}
            label="등록일시"
            idPrefix="server"
            from={draft.from}
            to={draft.to}
            onChange={(next) => setDraft((prev) => ({ ...prev, ...next }))}
          />

          {/* 서버 ID / IP / 이름 검색 */}
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

          {/* 타입 */}
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

          {/* 상태 */}
          {/* 업무구분. 선택지는 lib/businessDivisions.ts 한 곳에서 옵니다.
              나중에 계정 권한 화면도 같은 배열을 씁니다. */}
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
