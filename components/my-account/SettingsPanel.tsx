import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Toggle } from "@/components/ui/Toggle";
import type { Account } from "@/lib/accounts/types";
import { useTheme } from "@/lib/theme";

export function SettingsPanel({
  account,
  onNotifyChange,
}: {
  account: Account;
  onNotifyChange: (next: boolean) => Promise<string>;
}) {
  const { theme, setTheme } = useTheme();
  const [error, setError] = useState("");

  const handleNotifyChange = async (next: boolean) => {
    const message = await onNotifyChange(next);
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
          description="감시 중인 서버의 핑이 끊기면 알려 줍니다"
          checked={account.notifyEnabled}
          onChange={handleNotifyChange}
          toggleLabel="알림 받기"
        />
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
