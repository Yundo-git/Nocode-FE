import type { ReactNode } from "react";

type FormRowProps = {
  label: string;
  /** 라벨이 가리킬 입력칸의 id 입니다. 칸이 여러 개면 비워 둡니다. */
  htmlFor?: string;
  /** 필수 항목이면 라벨 옆에 빨간 * 를 답니다. */
  required?: boolean;
  /** 라벨 칸 너비입니다. 화면마다 글자 길이가 달라 조절할 수 있게 둡니다. */
  labelWidth?: "sm" | "md";
  children: ReactNode;
};

// 라벨과 입력칸을 한 줄로 묶습니다.
//
// 등록 창마다 똑같은 것을 따로 만들고 있어서 여기로 모았습니다.
// 좁은 화면에서는 라벨이 위로 올라가고 입력칸이 아래로 갑니다.
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
