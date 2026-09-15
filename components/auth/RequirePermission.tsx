import { useRouter } from "next/router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import type { Account } from "@/lib/accounts/types";

type RequirePermissionProps = {
  allow: (account: Account) => boolean;
  children: ReactNode;
};

export const DENIED_KEY = "pingcheck-denied-notice";

export function RequirePermission({ allow, children }: RequirePermissionProps) {
  const { account, status } = useAuth();
  const router = useRouter();

  const denied = status !== "loading" && account !== null && !allow(account);

  useEffect(() => {
    if (!denied) return;

    try {
      window.sessionStorage.setItem(
        DENIED_KEY,
        "접근 권한이 없어 대시보드로 이동했습니다.",
      );
    } catch {
    }

    void router.replace("/");
  }, [denied, router]);

  if (status === "loading" || account === null || denied) return null;

  return <>{children}</>;
}
