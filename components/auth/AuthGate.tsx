import { useRouter } from "next/router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";

const PUBLIC_ROUTES = ["/login"];

export function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.includes(pathname);
}

const BARE_ROUTES = ["/tv"];

export function isBareRoute(pathname: string) {
  return BARE_ROUTES.includes(pathname);
}

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

  if (blocked || alreadyIn) {
    return null;
  }

  if (status === "loading" && !isPublic) {
    return null;
  }

  return <>{children}</>;
}
