import { useEffect, useState } from "react";
import { AlertIcon } from "@/components/ui/icons";
import { formatElapsed } from "@/lib/dashboard/duration";
import type { ProblemServer } from "@/lib/dashboard/types";

type OutageAlertProps = {
  problems: readonly ProblemServer[];
  muted: boolean;
  now: number;
};

const ROTATE_MS = 2500;

export function OutageAlert({ problems, muted, now }: OutageAlertProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [index, setIndex] = useState(0);

  const signature = problems.map((problem) => problem.id).join(",");

  useEffect(() => {
    setAcknowledged(false);
    setIndex(0);
  }, [signature]);

  useEffect(() => {
    if (problems.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % problems.length);
    }, ROTATE_MS);

    return () => clearInterval(timer);
  }, [problems.length]);

  const current = problems[Math.min(index, problems.length - 1)];

  if (current === undefined) {
    return null;
  }

  const blinking = !acknowledged && !muted;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <AlertIcon
        width={34}
        height={34}
        className={`text-down-500 ${blinking ? "animate-pulse-slow" : ""}`}
      />

      <p className="text-s1 font-bold text-down-500">
        비정상 {problems.length}대
      </p>

      <p
        className={`font-mono text-h5 font-bold tabular-nums text-down-500 ${
          blinking ? "animate-pulse-slow" : ""
        }`}
      >
        {current.ip}
      </p>
      <p className="max-w-full truncate text-b2_body_r text-secondary">
        {current.nameKo}
      </p>

      {current.since !== null ? (
        <p className="text-b2_body_m font-semibold text-down-500">
          {formatElapsed(current.since, now)}
        </p>
      ) : null}

      {problems.length > 1 ? (
        <p className="text-bt-text-s text-muted">
          {index + 1} / {problems.length} · 번갈아 표시
        </p>
      ) : null}

      {muted ? (
        <p className="text-bt-text-s text-muted">내 알림 꺼짐</p>
      ) : acknowledged ? (
        <p className="text-bt-text-s text-muted">확인함</p>
      ) : (
        <button
          type="button"
          onClick={() => setAcknowledged(true)}
          className="btn btn-ghost btn-sm mt-1"
        >
          확인
        </button>
      )}
    </div>
  );
}
