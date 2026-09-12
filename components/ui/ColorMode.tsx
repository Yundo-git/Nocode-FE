import { useTheme, type Theme } from "@/lib/theme";

// 화이트 / 블랙 모드를 고르는 선택 상자입니다.
// 고른 값은 브라우저에 저장돼서 새로고침해도 유지됩니다.
export function ColorMode() {
  const { theme, setTheme } = useTheme();

  return (
    <select
      value={theme}
      onChange={(event) => setTheme(event.currentTarget.value as Theme)}
      aria-label="화면 모드"
      className="select w-full"
    >
      <option value="light">화이트 모드</option>
      <option value="dark">블랙 모드</option>
    </select>
  );
}
