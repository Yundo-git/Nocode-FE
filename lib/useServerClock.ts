import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";

type TimeResponse = {
  epochMs: number;
  timeZone: string;
};

export type ClockStatus = "loading" | "ready" | "error";

const RESYNC_MS = 60_000;

export function useServerClock() {
  const [status, setStatus] = useState<ClockStatus>("loading");
  const [timeZone, setTimeZone] = useState("");
  const [nowMs, setNowMs] = useState<number | null>(null);

  const offsetRef = useRef(0);

  const sync = useCallback(async () => {
    const sentAt = Date.now();
    const res = await api.get<TimeResponse>("/time", { background: true });
    const receivedAt = Date.now();

    if (!res.ok) {
      setStatus("error");
      return;
    }

    const travelMs = (receivedAt - sentAt) / 2;
    offsetRef.current = res.data.epochMs + travelMs - receivedAt;

    setTimeZone(res.data.timeZone);
    setNowMs(Date.now() + offsetRef.current);
    setStatus("ready");
  }, []);

  useEffect(() => {
    let alive = true;

    const runSync = () => {
      if (!alive) return;
      void sync();
    };

    runSync();

    const tick = setInterval(() => {
      if (!alive) return;
      setNowMs(Date.now() + offsetRef.current);
    }, 1000);

    const resync = setInterval(runSync, RESYNC_MS);

    return () => {
      alive = false;
      clearInterval(tick);
      clearInterval(resync);
    };
  }, [sync]);

  return { status, nowMs, timeZone };
}

export function formatInZone(
  epochMs: number,
  timeZone: string,
): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone || undefined,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date(epochMs));

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "--";

  const hour = pick("hour") === "24" ? "00" : pick("hour");

  return {
    date: `${pick("year")}-${pick("month")}-${pick("day")}`,
    time: `${hour}:${pick("minute")}:${pick("second")}`,
  };
}
