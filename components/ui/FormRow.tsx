import type { ReactNode } from "react";

type FormRowProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  labelWidth?: "sm" | "md";
  children: ReactNode;
};

export function FormRow({
  label,
  htmlFor,
  required = false,
  labelWidth = "sm",
  children,
}: FormRowProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <label
        htmlFor={htmlFor}
        className={`shrink-0 text-b2_body_m font-medium text-secondary ${
          labelWidth === "sm" ? "sm:w-20" : "sm:w-32"
        }`}
      >
        {label}
        {required ? <span className="ml-0.5 text-down-500">*</span> : null}
      </label>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
