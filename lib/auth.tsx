import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, ensureCsrfToken, setUnauthorizedHandler } from "@/lib/api/client";
import type { Account } from "@/lib/accounts/types";

export type AuthStatus = "loading" | "authenticated" | "guest";

type AuthValue = {
  status: AuthStatus;
  account: Account | null;
  login: (loginId: string, password: string) => Promise<"ok" | "needs-setup">;
  setupPassword: (loginId: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: (next: Account) => void;
};

const AuthContext = createContext<AuthValue>({
  status: "loading",
  account: null,
  login: async () => "ok",
  setupPassword: async () => {},
  logout: async () => {},
  refresh: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    let alive = true;

    void (async () => {
      const res = await api.get<Account>("/auth/me");

      if (!alive) return;

      if (res.ok) {
        setAccount(res.data);
        setStatus("authenticated");
        return;
      }

      await ensureCsrfToken();

      if (!alive) return;

      setAccount(null);
      setStatus("guest");
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccount(null);
      setStatus("guest");
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(
    async (loginId: string, password: string): Promise<"ok" | "needs-setup"> => {
      await ensureCsrfToken();

      const res = await api.post<Account | { needsPasswordSetup: true }>(
        "/auth/login",
        { loginId, password },
      );

      if (!res.ok) {
        throw new Error(res.message);
      }

      if ("needsPasswordSetup" in res.data) return "needs-setup";

      setAccount(res.data);
      setStatus("authenticated");
      return "ok";
    },
    [],
  );

  const setupPassword = useCallback(
    async (loginId: string, newPassword: string) => {
      await ensureCsrfToken();

      const res = await api.post<Account>("/auth/setup-password", {
        loginId,
        newPassword,
      });

      if (!res.ok) throw new Error(res.message);

      setAccount(res.data);
      setStatus("authenticated");
    },
    [],
  );

  const logout = useCallback(async () => {
    await api.post<null>("/auth/logout", {});

    setAccount(null);
    setStatus("guest");
  }, []);

  const refresh = useCallback((next: Account) => {
    setAccount(next);
  }, []);

  const value = useMemo(
    () => ({ status, account, login, setupPassword, logout, refresh }),
    [status, account, login, setupPassword, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
