import type { ReactNode } from "react";

export type PanelProps = {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  padded?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  children: ReactNode;
};

export function Panel({
  title,
  description,
  actions,
  footer,
  padded = true,
  className,
  headerClassName,
  bodyClassName,
  children,
}: PanelProps) {
  const hasHeader =
    title !== undefined || description !== undefined || actions !== undefined;

  return (
    <section className={joinClasses("panel flex min-w-0 flex-col", className)}>
      {hasHeader ? (
        <div
          className={joinClasses(
            "flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3",
            headerClassName,
          )}
        >
          <div className="flex min-w-0 items-baseline gap-2">
            {title !== undefined ? (
              <h2 className="min-w-0 truncate text-s2 font-semibold text-body">
                {title}
              </h2>
            ) : null}

            {description !== undefined ? (
              <p className="min-w-0 truncate text-b2_body_r text-muted">
                {description}
              </p>
            ) : null}
          </div>

          {actions !== undefined ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}

      <div
        className={joinClasses(
          "min-w-0 flex-1",
          padded ? "p-4" : undefined,
          bodyClassName,
        )}
      >
        {children}
      </div>

      {footer !== undefined ? (
        <div className="border-t border-line px-4 py-3">{footer}</div>
      ) : null}
    </section>
  );
}

function joinClasses(...values: (string | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}
