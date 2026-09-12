import type { ReactNode } from "react";

type PageHeaderProps = {
  /** 제목 위에 보이는 위치 표시입니다. 예: ["시스템", "서버관리"] */
  breadcrumb?: readonly string[];
  title: string;
  /** 오른쪽에 놓을 버튼들입니다. */
  actions?: ReactNode;
};

// 화면 맨 위의 제목 줄입니다. 모든 관리 화면이 같은 모양을 쓰도록 빼 두었습니다.
export function PageHeader({ breadcrumb, title, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      {/* 제목과 경로 표시를 한 줄에 둡니다.
          items-baseline 이라 글자 크기가 달라도 아랫선이 맞습니다. */}
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <h1 className="truncate text-h5 font-semibold text-body">{title}</h1>

        {breadcrumb !== undefined && breadcrumb.length > 0 ? (
          <nav aria-label="현재 위치" className="truncate text-bt-text-s text-muted">
            {breadcrumb.map((step, index) => (
              <span key={step}>
                {index > 0 ? <span className="px-1">&gt;</span> : null}
                {step}
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
