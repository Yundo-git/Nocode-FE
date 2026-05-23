import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

// 버튼의 크기를 CSS 클래스 이름으로 바꾸기 위한 타입입니다.
type ButtonSize = "sm" | "md" | "lg";

// 버튼의 색이나 스타일 종류를 정하는 타입입니다.
type ButtonVariant = "primary" | "secondary" | "ghost";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

// href가 있으면 링크처럼 동작하는 버튼의 props입니다.
type AnchorButtonProps = BaseButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

// href가 없으면 일반 버튼으로 동작하는 props입니다.
type NativeButtonProps = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

export type ButtonProps = AnchorButtonProps | NativeButtonProps;

const sizeClasses: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

// 이 버튼 컴포넌트는 일반 버튼과 링크 버튼 둘 다 사용할 수 있습니다.
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  href,
  children,
  ...props
}: ButtonProps) {
  const classes = [`btn`, sizeClasses[size], variantClasses[variant], className]
    .filter(Boolean)
    .join(" ");

  // href가 있으면 링크 컴포넌트로 렌더링합니다.
  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  // 없으면 기본 버튼으로 렌더링합니다.
  return (
    <button
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
