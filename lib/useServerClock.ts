import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";

type TimeResponse = {
  epochMs: number;
  timeZone: string;
};

export type ClockStatus = "loading" | "ready" | "error";

// 얼마마다 서버와 시각을 다시 맞출지입니다.
// 매초 물어보면 요청이 너무 많아서, 한 번 맞춰 두고 브라우저가 세도록 합니다.
// 컴퓨터 시계는 조금씩 어긋나므로 가끔 다시 맞춥니다.
const RESYNC_MS = 60_000;

// 서버의 현재 시각을 보여 줍니다.
//
// 매초 서버에 묻지 않습니다. 대신 처음 한 번 "서버 시각 - 내 시각" 차이를 구해 두고,
// 매초 (내 시각 + 차이) 를 계산합니다. 요청은 1분에 한 번뿐입니다.
export function useServerClock() {
  const [status, setStatus] = useState<ClockStatus>("loading");
  const [timeZone, setTimeZone] = useState("");
  const [nowMs, setNowMs] = useState<number | null>(null);

  // 서버 시각과 내 시각의 차이입니다. 렌더를 다시 하지 않도록 ref 에 둡니다.
  const offsetRef = useRef(0);

  const sync = useCallback(async () => {
    const sentAt = Date.now();
    const res = await api.get<TimeResponse>("/time");
    const receivedAt = Date.now();

    if (!res.ok) {
      setStatus("error");
      return;
    }

    // 응답이 오는 동안에도 시간은 흘렀습니다.
    // 오가는 데 걸린 시간의 절반만큼 서버가 더 갔다고 봅니다.
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

    // 매초 화면을 갱신합니다.
    // 흐른 시간을 더하지 않고 매번 Date.now() 로 다시 계산합니다.
    // 그래야 탭이 잠깐 멈췄다 돌아와도 시각이 어긋난 채 남지 않습니다.
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

// 서버 시간대를 기준으로 "2026-09-12" 와 "22:13:05" 를 만듭니다.
//
// 자릿수를 직접 맞춥니다. toLocaleString 은 브라우저 언어 설정에 따라
// 모양이 달라져서, 사람마다 다르게 보일 수 있습니다.
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

  // 자정을 24 로 주는 브라우저가 있어 00 으로 맞춥니다.
  const hour = pick("hour") === "24" ? "00" : pick("hour");

  return {
    date: `${pick("year")}-${pick("month")}-${pick("day")}`,
    time: `${hour}:${pick("minute")}:${pick("second")}`,
  };
}
