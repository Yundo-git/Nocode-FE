import Link from "next/link";
import type { ReactNode } from "react";

export type Crumb = string | { readonly label: string; readonly href: string };

type PageHeaderProps = {
  breadcrumb?: readonly Crumb[];
  title: string;
  actions?: ReactNode;
};

function labelOf(crumb: Crumb): string {
  return typeof crumb === "string" ? crumb : crumb.label;
}

export function PageHeader({ breadcrumb, title, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <h1 className="truncate text-h5 font-semibold text-body">{title}</h1>

        {breadcrumb !== undefined && breadcrumb.length > 0 ? (
          <nav
            aria-label="현재 위치"
            className="flex min-w-0 flex-wrap items-baseline text-bt-text-s text-muted"
          >
            {breadcrumb.map((crumb, index) => (
              <span key={`${labelOf(crumb)}-${index}`} className="flex min-w-0 items-baseline">
                {index > 0 ? <span className="px-1 text-muted/60">&gt;</span> : null}
                {typeof crumb === "string" ? (
                  <span className="max-w-[180px] truncate">{crumb}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="max-w-[180px] truncate rounded px-0.5 transition hover:bg-row-hover hover:text-body"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        ) : null}
      </div>

      {actions !== undefined ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
