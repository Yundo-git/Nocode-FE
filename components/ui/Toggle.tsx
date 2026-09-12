type ToggleProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** 읽기 도구가 읽어 줄 이름입니다. 예: "테스트 서버 감시 사용" */
  label: string;
  disabled?: boolean;
};

// 켜고 끄는 스위치입니다.
// role="switch" 라서 키보드와 읽기 도구에서도 켜짐/꺼짐이 그대로 전달됩니다.
export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? "bg-primary-600" : "bg-line-strong"
      }`}
    >
      {/* 안쪽 동그라미가 좌우로 움직입니다. */}
      <span
        className={`h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
