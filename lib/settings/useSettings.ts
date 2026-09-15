import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { DEFAULT_SETTINGS, type SystemSettings } from "@/lib/settings/types";

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
