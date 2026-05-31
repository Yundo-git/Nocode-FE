type ColorModeProps = {
  theme: string;
  setTheme?: (theme: string) => void;
};

export function ColorMode({ theme, setTheme }: ColorModeProps) {
  return (
    <select
      value={theme}
      onChange={(event) => setTheme?.(event.currentTarget.value)}
      className="select max-w-[220px]"
    >
      <option value="light">화이트 모드</option>
      <option value="dark">블랙 모드</option>
    </select>
  );
}
