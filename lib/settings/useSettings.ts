import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { DEFAULT_SETTINGS, type SystemSettings } from "@/lib/settings/types";

// 시스템 설정을 읽습니다. 바꾸는 길은 없습니다.
//
// 핑 주기·임계값·보관 기간입니다. 운영 중에 화면으로 바꿀 값이 아니라
// DB 에서 직접 고칩니다. 그래도 가끔 다시 읽습니다 — 값이 바뀌면
// 화면의 판정 기준(감시 멈춤·박동 선)이 함께 따라와야 하기 때문입니다.
const REFRESH_MS = 30_000;

export function useSettings() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const res = await api.get<SystemSettings>("/settings", { background: true });

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

  return { settings, ready };
}
