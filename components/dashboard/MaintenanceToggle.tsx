import { useState } from "react";
import { useMyAccount } from "@/lib/accounts/useAccounts";

export function MaintenanceToggle() {
  const { account, setNotifyEnabled } = useMyAccount();
  const [error, setError] = useState("");

  if (account === null) return null;

  const on = account.notifyEnabled;

  const handleClick = async () => {
    setError(await setNotifyEnabled(!on));
  };

  return (
    <div className="flex items-center gap-2">
      {error ? (
        <span className="text-bt-text-s text-down-500">{error}</span>
      ) : null}

      <button
        type="button"
        onClick={() => void handleClick()}
        aria-pressed={!on}
        title={
          on
            ? "장애가 나면 소리로 알립니다. 누르면 내 소리만 멎습니다."
            : "내 소리가 꺼져 있습니다. 알림함에는 그대로 쌓입니다."
        }
        className={on ? "btn btn-ghost btn-sm" : "btn btn-primary btn-sm"}
      >
        알림 {on ? "켜짐" : "꺼짐"}
      </button>
    </div>
  );
}
