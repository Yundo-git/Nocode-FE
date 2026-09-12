import { useState } from "react";
import { useSettings } from "@/lib/settings/useSettings";

// 작업 모드 버튼입니다.
//
// 켜면 알림을 울리지 않습니다. 계획된 점검 중에 알림이 쏟아지면
// 사람들이 알림을 통째로 꺼 버리기 때문에 필요합니다.
//
// 켜져 있을 때는 버튼을 눈에 띄게 만듭니다.
// 이 설정에서 가장 위험한 실수가 "끄는 것을 잊는" 것이라,
// 켜져 있다는 사실이 계속 보여야 합니다.
export function MaintenanceToggle() {
  const { settings, setMaintenanceMode } = useSettings();
  const [error, setError] = useState("");
  const on = settings.maintenanceMode;

  const handleClick = async () => {
    const message = await setMaintenanceMode(!on);
    setError(message);
  };

  return (
    <div className="flex items-center gap-2">
      {error ? (
        <span className="text-bt-text-s text-down-500">{error}</span>
      ) : null}

      {on && settings.maintenanceSince !== null ? (
        <span className="text-bt-text-s text-muted">
          {formatSince(settings.maintenanceSince)}부터
          {settings.maintenanceBy ? ` · ${settings.maintenanceBy}` : ""}
        </span>
      ) : null}

      <button
        type="button"
        onClick={handleClick}
        aria-pressed={on}
        title={
          on
            ? "알림이 꺼져 있습니다. 누르면 다시 울립니다."
            : "점검 중 알림을 멈춥니다."
        }
        className={on ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
      >
        작업 모드 {on ? "켜짐" : "꺼짐"}
      </button>
    </div>
  );
}

// 09-12 23:07 형태로 짧게 보여 줍니다.
function formatSince(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "-";

  const pad = (value: number) => String(value).padStart(2, "0");

  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
