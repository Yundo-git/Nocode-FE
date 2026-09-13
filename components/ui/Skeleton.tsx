type SkeletonProps = {
  /** 추가로 줄 크기 클래스입니다. 예: "h-4 w-24" */
  className?: string;
  /** 동그란 모양으로 만듭니다. 도넛 자리 등에 씁니다. */
  circle?: boolean;
};

// 불러오는 동안 자리를 잡아 두는 회색 뼈대입니다.
//
// "불러오는 중입니다" 글자만 띄우면 내용이 채워질 때 배치가 크게 튑니다.
// 실제 내용과 비슷한 크기로 미리 자리를 잡아 두면 흔들림이 없습니다.
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
