import type { FormEvent, ReactNode } from "react";

type FilterFormProps = {
  onSubmit: () => void;
  onReset: () => void;
  /** 조건 칸들입니다. FilterField 를 넣습니다. */
  children: ReactNode;
};

// 목록 화면의 검색 조건 영역입니다.
// 서버관리와 계정관리가 같은 모양을 쓰고 있어 여기로 모았습니다.
//
// 넓은 화면에서는 왼쪽에 조건, 오른쪽 끝에 버튼이 옵니다.
// items-end 라서 버튼이 조건의 마지막 줄과 같은 높이에 놓입니다.
export function FilterForm({ onSubmit, onReset, children }: FilterFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="panel px-4 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-6 gap-y-3 lg:grid-cols-2">
          {children}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <button type="button" onClick={onReset} className="btn btn-ghost btn-md">
            초기화
          </button>
          <button type="submit" className="btn btn-primary btn-md">
            검색
          </button>
        </div>
      </div>
    </form>
  );
}

type FilterFieldProps = {
  label: string;
  /** 라벨이 가리킬 입력칸의 id 입니다. 칸이 여러 개면 비워 둡니다. */
  htmlFor?: string;
  children: ReactNode;
};

// 라벨과 입력칸을 한 줄로 묶습니다.
export function FilterField({ label, htmlFor, children }: FilterFieldProps) {
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
