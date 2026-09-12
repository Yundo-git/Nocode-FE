import { useState } from "react";
import { FilterField, FilterForm } from "@/components/ui/FilterForm";
import {
  ACCOUNT_ROLES,
  EMPTY_ACCOUNT_FILTERS,
  ROLE_LABEL,
  type AccountFilterValues,
  type AccountRole,
} from "@/lib/accounts/types";
import {
  BUSINESS_DIVISIONS,
  type BusinessDivisionId,
} from "@/lib/businessDivisions";

type AccountFiltersProps = {
  onSearch: (values: AccountFilterValues) => void;
};

// 검색 조건 영역입니다. 서버관리와 같은 모양을 씁니다.
// 입력 중인 값은 여기서만 들고 있다가 "검색" 을 눌러야 위로 전달합니다.
export function AccountFilters({ onSearch }: AccountFiltersProps) {
  const [draft, setDraft] = useState<AccountFilterValues>(EMPTY_ACCOUNT_FILTERS);

  const update = <K extends keyof AccountFilterValues>(
    key: K,
    value: AccountFilterValues[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setDraft(EMPTY_ACCOUNT_FILTERS);
    onSearch(EMPTY_ACCOUNT_FILTERS);
  };

  return (
    <FilterForm onSubmit={() => onSearch(draft)} onReset={handleReset}>
          <FilterField label="아이디 · 이름" htmlFor="account-keyword">
            <input
              id="account-keyword"
              type="search"
              value={draft.keyword}
              onChange={(event) => update("keyword", event.currentTarget.value)}
              placeholder="아이디, 이름, 이메일을 입력해주세요"
              className="input w-full"
            />
          </FilterField>

          <FilterField label="소속 파트" htmlFor="account-division">
            <select
              id="account-division"
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

          <FilterField label="권한" htmlFor="account-role">
            <select
              id="account-role"
              value={draft.role}
              onChange={(event) =>
                update("role", event.currentTarget.value as AccountRole | "")
              }
              className="select w-full"
            >
              <option value="">전체</option>
              {ACCOUNT_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABEL[role]}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="사용여부" htmlFor="account-enabled">
            <select
              id="account-enabled"
              value={draft.enabled}
              onChange={(event) =>
                update(
                  "enabled",
                  event.currentTarget.value as AccountFilterValues["enabled"],
                )
              }
              className="select w-full"
            >
              <option value="">전체</option>
              <option value="on">사용</option>
              <option value="off">중지</option>
            </select>
          </FilterField>
    </FilterForm>
  );
}
