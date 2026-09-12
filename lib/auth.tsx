import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// loading  : 저장된 로그인 정보를 아직 확인하는 중입니다.
// authenticated : 로그인한 상태입니다.
// guest    : 로그인하지 않은 상태입니다.
export type AuthStatus = "loading" | "authenticated" | "guest";

export type User = {
  username: string;
};

const STORAGE_KEY = "nocode-auth";

type AuthValue = {
  status: AuthStatus;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthValue>({
  status: "loading",
  user: null,
  login: async () => {},
  logout: () => {},
});

// 아직 백엔드가 없어서 로그인 검사를 브라우저에서 흉내 냅니다.
// 지금은 아이디와 비밀번호가 비어 있지만 않으면 통과합니다.
// 실제 인증이 붙으면 이 함수 안만 API 호출로 바꾸면 됩니다.
async function requestLogin(username: string, password: string): Promise<User> {
  const id = username.trim();

  if (!id || !password) {
    throw new Error("아이디와 비밀번호를 모두 입력해 주세요.");
  }

  return { username: id };
}

// 앱 전체에서 같은 로그인 상태를 쓰도록 감싸 주는 컴포넌트입니다.
export function AuthProvider({ children }: { children: ReactNode }) {
  // 서버에서 그린 화면과 브라우저 첫 화면이 같아야 하므로
  // 저장된 값을 읽지 않고 항상 "확인 중"(loading) 으로 시작합니다.
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? (JSON.parse(saved) as Partial<User>) : null;

      if (parsed && typeof parsed.username === "string" && parsed.username) {
        setUser({ username: parsed.username });
        setStatus("authenticated");
        return;
      }
    } catch {
      // 저장된 값이 깨져 있으면 지우고 로그아웃 상태로 둡니다.
      window.localStorage.removeItem(STORAGE_KEY);
    }

    setStatus("guest");
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const next = await requestLogin(username, password);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setStatus("guest");
  }, []);

  const value = useMemo(
    () => ({ status, user, login, logout }),
    [status, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 로그인 상태와 로그인/로그아웃 함수를 꺼내 씁니다.
export function useAuth() {
  return useContext(AuthContext);
}
