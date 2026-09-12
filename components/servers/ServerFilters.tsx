import { useState, type FormEvent } from "react";
import {
  EMPTY_FILTERS,
  STATUS_LABEL,
  type ServerFilterValues,
  type ServerStatus,
} from "@/lib/servers/types";

type ServerFiltersProps = {
  /** 검색 버튼을 눌렀을 때만 위로 올려 보냅니다. */
  onSearch: (values: ServerFilterValues) => void;
};

const STATUS_OPTIONS: readonly ServerStatus[] = [
  "up",
  "warning",
  "down",
  "unknown",
];

const TYPE_OPTIONS = ["일반", "사진"] as const;

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(draft);
  };

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    onSearch(EMPTY_FILTERS);
  };

  return (
    <form onSubmit={handleSubmit} className="panel px-4 py-4">
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 lg:grid-cols-2">
        {/* 등록일시 */}
        <Field label="등록일시" htmlFor="filter-from">
          <div className="flex min-w-0 items-center gap-2">
            <input
              id="filter-from"
              type="date"
              value={draft.from}
              onChange={(event) => update("from", event.currentTarget.value)}
              className="input min-w-0 flex-1"
            />
            <span className="shrink-0 text-b2_body_r text-muted">~</span>
            <input
              type="date"
              aria-label="등록일시 끝"
              value={draft.to}
              onChange={(event) => update("to", event.currentTarget.value)}
              className="input min-w-0 flex-1"
            />
          </div>
        </Field>

        {/* 서버 ID / IP / 이름 검색 */}
        <Field label="서버명 · IP" htmlFor="filter-keyword">
          <input
            id="filter-keyword"
            type="search"
            value={draft.keyword}
            onChange={(event) => update("keyword", event.currentTarget.value)}
            placeholder="서버명이나 IP를 입력해주세요"
            className="input w-full"
          />
        </Field>

        {/* 타입 */}
        <Field label="타입" htmlFor="filter-type">
          <select
            id="filter-type"
            value={draft.type}
            onChange={(event) => update("type", event.currentTarget.value)}
            className="select w-full"
          >
            <option value="">전체</option>
            {TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        {/* 상태 */}
        <Field label="상태" htmlFor="filter-status">
          <select
            id="filter-status"
            value={draft.status}
            onChange={(event) =>
              update("status", event.currentTarget.value as ServerStatus | "")
            }
            className="select w-full"
          >
            <option value="">전체</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 border-t border-line pt-4">
        <button type="button" onClick={handleReset} className="btn btn-ghost btn-md">
          초기화
        </button>
        <button type="submit" className="btn btn-primary btn-md">
          검색
        </button>
      </div>
    </form>
  );
}

// 라벨과 입력칸을 한 줄로 묶습니다.
function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <label
        htmlFor={htmlFor}
        className="shrink-0 text-b2_body_m font-medium text-secondary sm:w-24"
      >
        {label}
      </label>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
