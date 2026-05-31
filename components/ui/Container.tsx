import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

// 페이지 내용을 가운데로 정리하고 좌우 여백을 넣어주는 박스.
export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-6 ${className}`.trim()}>
      {children}
    </div>
  );
}
