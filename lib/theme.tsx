import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "monitoring-theme";

// 기본값은 밝은 블루-화이트 테마입니다.
const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: "light",
  setTheme: () => {},
});

// 저장된 테마를 html 요소에 적용합니다.
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

// 앱 전체에서 같은 테마 값을 쓰도록 감싸 주는 컴포넌트입니다.
export function ThemeProvider({ children }: { children: ReactNode }) {
  // 서버에서 그린 화면과 브라우저 첫 화면이 같아야 하므로
  // 저장된 값을 읽지 않고 항상 기본값("light")으로 시작합니다.
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    // _document.tsx 의 시작 스크립트가 이미 html 요소에 테마를 적용해 두었습니다.
    // 여기서는 그 값을 읽어 화면 상태(선택 상자 표시 값)만 맞춰 줍니다.
    const applied = document.documentElement.dataset.theme;
    const next: Theme = applied === "dark" ? "dark" : "light";

    setThemeState(next);
    applyTheme(next);
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 테마 값과 변경 함수를 꺼내 씁니다.
export function useTheme() {
  return useContext(ThemeContext);
}
