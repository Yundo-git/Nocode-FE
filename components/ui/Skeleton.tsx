type SkeletonProps = {
  className?: string;
  circle?: boolean;
};

export function Skeleton({ className = "", circle = false }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={`animate-skeleton block bg-line ${
        circle ? "rounded-full" : "rounded-[var(--radius-sm)]"
      } ${className}`}
    />
  );
}
