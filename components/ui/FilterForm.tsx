import type { FormEvent, ReactNode } from "react";

type FilterFormProps = {
  onSubmit: () => void;
  onReset: () => void;
  children: ReactNode;
};

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
  htmlFor?: string;
  children: ReactNode;
};

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
