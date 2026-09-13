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

// loading       : 로그인 상태를 아직 확인하는 중입니다.
// authenticated : 로그인한 상태입니다.
// guest         : 로그인하지 않은 상태입니다.
export type AuthStatus = "loading" | "authenticated" | "guest";

type AuthValue = {
  status: AuthStatus;
  /** 로그인한 계정입니다. 백엔드가 세션을 보고 알려 준 값입니다. */
  account: Account | null;
  /**
   * 로그인합니다.
   *
   * 아직 비밀번호를 정하지 않은 계정이면 "needs-setup" 을 돌려줍니다.
   * 그때는 화면이 설정 창을 띄우고 setupPassword() 를 부릅니다.
   */
  login: (loginId: string, password: string) => Promise<"ok" | "needs-setup">;
  /** 첫 로그인에서 비밀번호를 정하고 바로 로그인합니다. */
  setupPassword: (loginId: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  /** 내 정보가 바뀌었을 때 화면 전체가 같은 값을 보도록 갱신합니다. */
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

// 로그인 상태를 다루는 곳입니다.
//
// ★ 예전에는 여기서 로그인을 흉내 냈습니다.
//   아이디·비밀번호가 비어 있지만 않으면 통과시키고 localStorage 에 적었습니다.
//   개발자 도구로 그 값을 직접 넣으면 로그인 화면을 건너뛸 수 있었습니다.
//
//   지금은 백엔드가 판단합니다.
//   - 비밀번호를 scrypt 해시로 대조합니다
//   - 세션은 httpOnly 쿠키라 스크립트가 읽거나 만들 수 없습니다
//   - 로그인 여부는 매번 서버에 물어봅니다 (GET /api/auth/me)
//
//   그래서 브라우저 쪽에 "로그인했다" 고 적어 두는 값이 아예 없습니다.
//   꾸며 낼 것이 없으니 꾸며 낼 수도 없습니다.
export function AuthProvider({ children }: { children: ReactNode }) {
  // 서버에서 그린 화면과 브라우저 첫 화면이 같아야 하므로
  // 항상 "확인 중"(loading) 으로 시작합니다.
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [account, setAccount] = useState<Account | null>(null);

  // 화면이 뜨면 "지금 누구인지" 를 서버에 물어봅니다.
  // 쿠키가 없거나 세션이 만료됐으면 401 이 오고 guest 가 됩니다.
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

      // 로그인 화면에서 바로 로그인할 수 있도록 CSRF 토큰을 받아 둡니다.
      await ensureCsrfToken();

      if (!alive) return;

      setAccount(null);
      setStatus("guest");
    })();

    return () => {
      alive = false;
    };
  }, []);

  // 어느 요청에서든 401 이 오면 로그인 상태를 내립니다.
  //
  // ★ 세션은 소리 없이 끊길 수 있습니다.
  //   - 기한이 지남 (유휴 12시간 / 절대 24시간)
  //   - 관리자가 계정을 정지시킴
  //   - 다른 기기에서 "다른 기기 모두 로그아웃" 을 누름
  //   - 비밀번호를 바꿈
  //   이때 화면이 그대로 있으면 사람은 왜 안 되는지 알 수 없습니다.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccount(null);
      setStatus("guest");
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(
    async (loginId: string, password: string): Promise<"ok" | "needs-setup"> => {
      // 로그인은 상태를 바꾸는 요청이라 CSRF 토큰이 있어야 합니다.
      await ensureCsrfToken();

      const res = await api.post<Account | { needsPasswordSetup: true }>(
        "/auth/login",
        { loginId, password },
      );

      if (!res.ok) {
        // 화면이 그대로 보여 줍니다. 백엔드는 아이디가 없는 것과
        // 비밀번호가 틀린 것을 구분해서 알려 주지 않습니다.
        throw new Error(res.message);
      }

      // 아직 비밀번호를 정하지 않은 계정입니다. 세션은 아직 없습니다.
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

      // 설정과 동시에 로그인됩니다.
      setAccount(res.data);
      setStatus("authenticated");
    },
    [],
  );

  const logout = useCallback(async () => {
    // 서버에서 세션을 지웁니다. 브라우저 값만 지우면 쿠키는 살아 있습니다.
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

// 로그인 상태와 로그인/로그아웃 함수를 꺼내 씁니다.
export function useAuth() {
  return useContext(AuthContext);
}
