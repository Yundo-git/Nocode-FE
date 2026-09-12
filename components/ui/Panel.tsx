import type { ReactNode } from "react";

export type PanelProps = {
  /** 머리말 제목입니다. title/description/actions 가 모두 없으면 머리말 줄 자체가 나오지 않습니다. */
  title?: ReactNode;
  /** 제목 옆에 나란히 붙는 짧은 설명입니다. */
  description?: ReactNode;
  /** 머리말 오른쪽 자리입니다. 새로고침 버튼, 기간 선택 같은 것을 넣습니다. */
  actions?: ReactNode;
  /** 맨 아래 줄입니다. 더보기 링크, 합계 표시 등에 씁니다. */
  footer?: ReactNode;
  /**
   * 본문 안쪽 여백입니다. 기본값은 켜짐(p-4)입니다.
   * 표처럼 상자 가장자리까지 꽉 채워야 하는 내용을 넣을 때 false 로 둡니다.
   */
  padded?: boolean;
  /** 바깥 상자에 덧붙일 클래스입니다. 그리드에서 칸을 몇 개 차지할지 등을 지정합니다. */
  className?: string;
  /** 머리말 줄에 덧붙일 클래스입니다. 드래그 손잡이로 쓸 때 지정합니다. */
  headerClassName?: string;
  /** 본문에 덧붙일 클래스입니다. 높이가 정해진 칸에서 넘치는 내용을 처리할 때 씁니다. */
  bodyClassName?: string;
  children: ReactNode;
};

// 대시보드에서 쓰는 상자입니다.
//
// 테두리/배경/모서리는 globals.css 의 .panel 을 그대로 씁니다.
// 색을 바꿀 일이 생기면 이 파일이 아니라 globals.css 의 변수만 고치면 됩니다.
//
// 머리말과 바닥글은 넘긴 것이 있을 때만 그려집니다.
// 그래서 상자 하나짜리 단순한 용도와, 제목+버튼이 붙는 용도에 같이 쓸 수 있습니다.
//
// 사용 예)
//   <Panel title="서버 상태" description="1분마다 갱신됩니다">
//     ...
//   </Panel>
//
//   <Panel title="최근 장애" actions={<Button size="sm">전체 보기</Button>} padded={false}>
//     <table className="w-full">...</table>
//   </Panel>
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
          {/* 제목과 설명을 같은 줄에 나란히 둡니다.
              items-baseline 이라 글자 크기가 달라도 아랫선이 맞습니다.
              둘 다 min-w-0 이 있어야 자리가 좁을 때 truncate 가 동작합니다. */}
          <div className="flex min-w-0 items-baseline gap-2">
            {title !== undefined ? (
              // 대시보드 화면의 제목(h1) 아래 단계라 h2 로 두었습니다.
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

      {/* min-w-0 이 있어야 안에 넓은 표가 들어와도 상자가 늘어나지 않습니다. */}
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

// 빈 값을 걸러서 클래스 사이에 공백이 겹치지 않게 합니다.
function joinClasses(...values: (string | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}
