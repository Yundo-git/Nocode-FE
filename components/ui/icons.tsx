import type { ReactNode, SVGProps } from "react";

// public/icon/*.svg 를 그대로 옮긴 아이콘들입니다.
//
// <img> 로 불러오면 SVG 안에 박힌 색(#131927)을 CSS 로 바꿀 수 없어서
// 컴포넌트로 넣고 선 색을 currentColor 로 두었습니다.
// 이렇게 하면 감싸는 요소의 글자 색(text-muted 등)을 그대로 따라갑니다.
// 파일을 따로 받아오지 않으니 요청 수도 줄어듭니다.
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

// 아이콘들이 모두 같은 선 모양을 씁니다.
const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// 끝 모양 지정이 없는 선입니다. (원본 svg 를 그대로 따랐습니다)
const plainStroke = {
  stroke: "currentColor",
  strokeWidth: 1.5,
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
        {...plainStroke}
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
        {...plainStroke}
      />
      <path
        d="M8 3H6C3.79086 3 2 4.79086 2 7V17C2 19.2091 3.79086 21 6 21H8"
        {...stroke}
      />
      <path d="M14 12H6M9 15L6 12L9 9" {...stroke} />
    </IconBase>
  );
}

// 사이드바 메뉴 아이콘들입니다.
export function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M7 22L17 22" {...stroke} />
      <path
        d="M2 17V4C2 2.89543 2.89543 2 4 2H20C21.1046 2 22 2.89543 22 4V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17Z"
        {...plainStroke}
      />
      <path d="M9 10.5L11 12.5L15 8.5" {...stroke} />
    </IconBase>
  );
}

export function ServerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M5 12V18C5 18 5 21 12 21C19 21 19 18 19 18V12" {...plainStroke} />
      <path d="M5 6V12C5 12 5 15 12 15C19 15 19 12 19 12V6" {...plainStroke} />
      <path
        d="M12 3C19 3 19 6 19 6C19 6 19 9 12 9C5 9 5 6 5 6C5 6 5 3 12 3Z"
        {...plainStroke}
      />
    </IconBase>
  );
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        d="M5 20V19C5 15.134 8.13401 12 12 12C15.866 12 19 15.134 19 19V20"
        {...stroke}
      />
      <path
        d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
        {...stroke}
      />
    </IconBase>
  );
}

// 자물쇠만 원본 svg 가 없어 여기서 직접 그렸습니다. (로그인 화면 비밀번호 칸)
export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="4.75" y="10.25" width="14.5" height="9" rx="2" {...stroke} />
      <path
        d="M8.25 10.25V7.5C8.25 5.43 9.93 3.75 12 3.75C14.07 3.75 15.75 5.43 15.75 7.5V10.25"
        {...stroke}
      />
    </IconBase>
  );
}
