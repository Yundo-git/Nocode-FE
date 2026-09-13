export function ReadOnlyRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <dt className="w-24 shrink-0 text-b2_body_m font-medium text-secondary">
        {label}
      </dt>
      <dd className={`min-w-0 truncate text-b2_body_r text-body ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
