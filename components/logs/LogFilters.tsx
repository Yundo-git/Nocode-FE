import { useState } from "react";
import { FilterField, FilterForm } from "@/components/ui/FilterForm";
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
import type { Server } from "@/lib/servers/types";

type Draft = Omit<LogQuery, "page" | "pageSize">;

const EMPTY_DRAFT: Draft = {
  from: "",
  to: "",
  serverId: "",
  type: "",
  divisionId: "",
};

type LogFiltersProps = {
  /** 장비 선택칸을 채울 목록입니다. */
  servers: readonly Server[];
  onSearch: (values: Draft) => void;
};

// 로그 조회 조건입니다.
// "특정 시간 · 특정 장비 · 특정 종류" 를 고르는 것이 목적입니다.
export function LogFilters({ servers, onSearch }: LogFiltersProps) {
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
      {/* 날짜만이 아니라 시각까지 고릅니다.
          장애는 몇 시 몇 분에 일어났는지가 중요합니다. */}
      <FilterField label="조회 기간" htmlFor="log-from">
        <div className="flex min-w-0 items-center gap-2">
          <input
            id="log-from"
            type="datetime-local"
            value={draft.from}
            onChange={(event) => update("from", event.currentTarget.value)}
            className="input min-w-0 flex-1"
          />
          <span className="shrink-0 text-b2_body_r text-muted">~</span>
          <input
            type="datetime-local"
            aria-label="조회 기간 끝"
            value={draft.to}
            onChange={(event) => update("to", event.currentTarget.value)}
            className="input min-w-0 flex-1"
          />
        </div>
      </FilterField>

      <FilterField label="장비" htmlFor="log-server">
        <select
          id="log-server"
          value={draft.serverId}
          onChange={(event) => update("serverId", event.currentTarget.value)}
          className="select w-full"
        >
          <option value="">전체</option>
          {servers.map((server) => (
            <option key={server.id} value={server.id}>
              {server.nameKo} ({server.ip})
            </option>
          ))}
        </select>
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
