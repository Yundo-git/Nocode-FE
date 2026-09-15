import { useTheme, type Theme } from "@/lib/theme";

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
