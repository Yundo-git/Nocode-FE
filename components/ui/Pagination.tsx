type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
};

function pageWindow(page: number, totalPages: number): number[] {
  const size = Math.min(5, totalPages);
  const start = Math.min(
    Math.max(1, page - Math.floor(size / 2)),
    Math.max(1, totalPages - size + 1),
  );

  return Array.from({ length: size }, (_, index) => start + index);
}

const ARROW_CLASS =
  "inline-flex h-7 min-w-7 items-center justify-center rounded-[var(--radius-sm)] px-1.5 text-bt-text-m text-secondary transition hover:bg-row-hover hover:text-body disabled:cursor-not-allowed disabled:opacity-30";

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 0) {
    return null;
  }

  const pages = pageWindow(page, totalPages);
  const first = pages[0] ?? 1;
  const last = pages[pages.length - 1] ?? 1;

  return (
    <nav aria-label="쪽 이동" className="flex items-center justify-center gap-1">
      <button type="button" className={ARROW_CLASS} onClick={() => onChange(1)} disabled={page === 1} aria-label="첫 쪽">
        &laquo;
      </button>
      <button type="button" className={ARROW_CLASS} onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="이전 쪽">
        &lsaquo;
      </button>

      {first > 1 ? <span className="px-1 text-bt-text-m text-muted">…</span> : null}

      {pages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          aria-current={item === page ? "page" : undefined}
          className={
            item === page
              ? "inline-flex h-7 min-w-7 items-center justify-center rounded-[var(--radius-sm)] bg-primary-600 px-1.5 text-bt-text-m font-semibold text-white"
              : ARROW_CLASS
          }
        >
          {item}
        </button>
      ))}

      {last < totalPages ? <span className="px-1 text-bt-text-m text-muted">…</span> : null}

      <button type="button" className={ARROW_CLASS} onClick={() => onChange(page + 1)} disabled={page === totalPages} aria-label="다음 쪽">
        &rsaquo;
      </button>
      <button type="button" className={ARROW_CLASS} onClick={() => onChange(totalPages)} disabled={page === totalPages} aria-label="마지막 쪽">
        &raquo;
      </button>
    </nav>
  );
}
