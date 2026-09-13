import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Toggle } from "@/components/ui/Toggle";
import type { Account } from "@/lib/accounts/types";
import { useTheme } from "@/lib/theme";

// 로그인을 유지할 시간입니다.
//
// ★ 사람마다 자리가 다릅니다.
//   관제는 화면을 계속 띄워 둬야 해서 "영구" 가 필요하고,
//   사무실 PC 는 짧게 끊는 편이 안전합니다.
//   그래서 시스템 설정이 아니라 **계정마다** 정합니다.
//
// ※ 백엔드의 SESSION_TTL_CHOICES 와 같은 값이어야 합니다.
//   (pingcheck-be/src/modules/accounts/account.types.ts)
const TTL_CHOICES: readonly { value: number | null; label: string }[] = [
  { value: 10, label: "10분" },
  { value: 15, label: "15분" },
  { value: 30, label: "30분" },
  { value: 60, label: "1시간" },
  { value: 240, label: "4시간" },
  { value: 480, label: "8시간" },
  { value: 720, label: "12시간" },
  { value: null, label: "영구" },
];

// select 는 값을 문자열로만 다룹니다. null 을 담을 수 없어 약속된 글자를 씁니다.
const FOREVER = "forever";

export function SettingsPanel({
  account,
  onNotifyChange,
  onSessionTtlChange,
}: {
  account: Account;
  onNotifyChange: (next: boolean) => Promise<string>;
  onSessionTtlChange: (next: number | null) => Promise<string>;
}) {
  const { theme, setTheme } = useTheme();
  const [error, setError] = useState("");

  const handleNotifyChange = async (next: boolean) => {
    const message = await onNotifyChange(next);
    setError(message);
  };

  const handleTtlChange = async (next: number | null) => {
    const message = await onSessionTtlChange(next);
    setError(message);
  };

  return (
    <Panel title="설정">
      <div className="space-y-3">
        <SettingRow
          label="블랙 모드"
          description="이 브라우저에만 적용됩니다"
          checked={theme === "dark"}
          onChange={(next) => setTheme(next ? "dark" : "light")}
          toggleLabel="블랙 모드"
        />

        <SettingRow
          label="알림 받기"
          description="감시 중인 서버의 핑이 끊기면 소리로 알립니다 (대시보드의 알림 버튼과 같은 설정입니다)"
          checked={account.notifyEnabled}
          onChange={handleNotifyChange}
          toggleLabel="알림 받기"
        />

        {/* ── 로그인 유지 시간 ──────────────────────────────────────────
            ★ 여기서 말하는 "아무것도 안 함" 은 사람이 누르지 않은 것입니다.
              대시보드가 15초마다 스스로 서버에 물어보는 것은 활동으로 치지
              않습니다. 그렇게 하지 않으면 화면을 띄워만 둬도 영원히
              로그인 상태가 되어 이 설정이 아무 뜻이 없어집니다. */}
        <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
          <div className="min-w-0">
            <p className="text-b2_body_m font-medium text-body">로그인 유지 시간</p>
            <p className="mt-0.5 text-bt-text-s text-muted">
              {account.sessionTtlMinutes === null
                ? "자동으로 로그아웃되지 않습니다. 자리를 비울 때 화면을 잠그세요."
                : "이 시간 동안 아무것도 누르지 않으면 자동으로 로그아웃됩니다"}
            </p>
          </div>

          <select
            aria-label="로그인 유지 시간"
            value={
              account.sessionTtlMinutes === null
                ? FOREVER
                : String(account.sessionTtlMinutes)
            }
            onChange={(event) => {
              const raw = event.currentTarget.value;
              void handleTtlChange(raw === FOREVER ? null : Number(raw));
            }}
            className="select shrink-0"
          >
            {TTL_CHOICES.map((choice) => (
              <option
                key={choice.label}
                value={choice.value === null ? FOREVER : String(choice.value)}
              >
                {choice.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-bt-text-m font-medium text-down-500">{error}</p>
      ) : null}
    </Panel>
  );
}

function SettingRow({
  label,
  description,
  checked,
  onChange,
  toggleLabel,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  toggleLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-b2_body_m font-medium text-body">{label}</p>
        <p className="mt-0.5 text-bt-text-s text-muted">{description}</p>
      </div>

      <Toggle checked={checked} onChange={onChange} label={toggleLabel} />
    </div>
  );
}
