import type { ReactNode, SVGProps } from "react";

// public/icon/*.svg 를 그대로 옮긴 아이콘들입니다.
//
// <img> 로 불러오면 SVG 안에 박힌 색(#131927)을 CSS 로 바꿀 수 없어서
// 컴포넌트로 넣고 선 색을 currentColor 로 두었습니다.
// 이렇게 하면 감싸는 요소의 글자 색(text-muted 등)을 그대로 따라갑니다.
function IconBase({
  children,
  ...props
}: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

// 세 아이콘이 모두 같은 선 모양을 씁니다.
const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 12H19M16 9L19 12L16 15" {...stroke} />
      <path
        d="M19 6V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V18"
        {...stroke}
      />
    </IconBase>
  );
}

// 사이드바를 여는 아이콘입니다. (화살표가 오른쪽 = 펼치기)
export function TabOpenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        d="M2 18V6C2 4.34315 3.34315 3 5 3H7C8.65685 3 10 4.34315 10 6V18C10 19.6569 8.65685 21 7 21H5C3.34315 21 2 19.6569 2 18Z"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path
        d="M16 3H18C20.2091 3 22 4.79086 22 7V17C22 19.2091 20.2091 21 18 21H16"
        {...stroke}
      />
      <path d="M10 12H18M15 15L18 12L15 9" {...stroke} />
    </IconBase>
  );
}

// 사이드바를 닫는 아이콘입니다. (화살표가 왼쪽 = 접기)
export function TabCloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        d="M22 18V6C22 4.34315 20.6569 3 19 3H17C15.3431 3 14 4.34315 14 6V18C14 19.6569 15.3431 21 17 21H19C20.6569 21 22 19.6569 22 18Z"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path
        d="M8 3H6C3.79086 3 2 4.79086 2 7V17C2 19.2091 3.79086 21 6 21H8"
        {...stroke}
      />
      <path d="M14 12H6M9 15L6 12L9 9" {...stroke} />
    </IconBase>
  );
}

// 로그인 화면 입력칸 앞에 붙는 아이콘들입니다.
// (위 아이콘들과 달리 public/icon 에 원본 파일은 없고 여기서 직접 그립니다.)
export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="3.25" {...stroke} />
      <path d="M5.5 19.5C5.5 16.3 8.4 14 12 14C15.6 14 18.5 16.3 18.5 19.5" {...stroke} />
    </IconBase>
  );
}

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="4.75" y="10.25" width="14.5" height="9" rx="2" {...stroke} />
      <path d="M8.25 10.25V7.5C8.25 5.43 9.93 3.75 12 3.75C14.07 3.75 15.75 5.43 15.75 7.5V10.25" {...stroke} />
    </IconBase>
  );
}
