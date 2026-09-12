import { useRouter } from "next/router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";

// 로그인하지 않아도 볼 수 있는 화면입니다.
const PUBLIC_ROUTES = ["/login"];

export function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.includes(pathname);
}

// 로그인하지 않았으면 어느 화면으로 들어와도 로그인 화면으로 보냅니다.
// 반대로 이미 로그인한 사람이 로그인 화면에 오면 첫 화면으로 보냅니다.
export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const isPublic = isPublicRoute(router.pathname);

  const blocked = status === "guest" && !isPublic;
  const alreadyIn = status === "authenticated" && isPublic;

  useEffect(() => {
    if (blocked) {
      void router.replace("/login");
      return;
    }

    if (alreadyIn) {
      void router.replace("/");
    }
  }, [blocked, alreadyIn, router]);

  // 화면을 옮기는 중에는 잘못된 화면이 잠깐 보이지 않도록 아무것도 그리지 않습니다.
  if (blocked || alreadyIn) {
    return null;
  }

  // 로그인 상태를 확인하는 동안에는 보호된 화면을 미리 그리지 않습니다.
  // (로그인 화면은 누구나 볼 수 있으므로 기다리지 않고 바로 그립니다.)
  if (status === "loading" && !isPublic) {
    return null;
  }

  return <>{children}</>;
}
