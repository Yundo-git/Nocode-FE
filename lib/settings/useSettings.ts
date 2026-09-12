import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { DEFAULT_SETTINGS, type SystemSettings } from "@/lib/settings/types";

// 시스템 설정을 읽고 바꿉니다.
//
// 다른 사람이 바꿨을 수도 있어서 가끔 다시 읽습니다.
// 작업 모드는 "끄는 것을 잊는" 것이 가장 위험해서, 화면이 늘 최신이어야 합니다.
const REFRESH_MS = 30_000;

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const res = await api.get<SystemSettings>("/settings");

      if (!alive || !res.ok) return;

      setSettings(res.data);
      setReady(true);
    };

    void load();
    const timer = setInterval(() => void load(), REFRESH_MS);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const setMaintenanceMode = useCallback(
    async (on: boolean): Promise<string> => {
      const before = settings;

      // 누른 즉시 화면을 바꾸고, 실패하면 되돌립니다.
      setSettings({ ...before, maintenanceMode: on });

      const res = await api.patch<SystemSettings>("/settings", {
        maintenanceMode: on,
        by: user?.username ?? null,
      });

      if (!res.ok) {
        setSettings(before);
        return res.message;
      }

      setSettings(res.data);
      return "";
    },
    [settings, user],
  );

  return { settings, ready, setMaintenanceMode };
}
