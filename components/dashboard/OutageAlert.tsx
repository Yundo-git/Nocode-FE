import { useEffect, useState } from "react";
import { AlertIcon } from "@/components/ui/icons";
import { formatElapsed } from "@/lib/dashboard/duration";
import type { ProblemServer } from "@/lib/dashboard/types";

type OutageAlertProps = {
  /** 응답이 없는 서버들입니다. 비어 있지 않을 때만 이 화면이 뜹니다. */
  problems: readonly ProblemServer[];
  /** 내 알림을 꺼 뒀으면 깜빡임을 멈춥니다. (사람마다 다릅니다) */
  muted: boolean;
  now: number;
};

// 여러 대가 동시에 죽으면 IP 를 하나씩 돌아가며 보여 줍니다.
const ROTATE_MS = 2500;

// 장애 알림입니다. 평소에는 시계가 있던 자리를 대신 차지합니다.
//
// 깜빡임은 1.5초 주기입니다.
// 초당 3회 이상 깜빡이면 광과민성 발작 위험이 있어 느리게 두었고,
// 오래 봐도 덜 피곤합니다.
//
// "확인" 을 누르면 깜빡임만 멈춥니다. 장애 표시 자체는 남습니다.
// 계속 깜빡이면 사람이 적응해서 아예 안 보게 되기 때문입니다.
// 새로운 장애가 생기면 다시 깜빡입니다.
export function OutageAlert({ problems, muted, now }: OutageAlertProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [index, setIndex] = useState(0);

  // 장애 대상이 바뀌면 확인 상태를 풉니다. (새 장애는 다시 알려야 합니다)
  const signature = problems.map((problem) => problem.id).join(",");

  useEffect(() => {
    setAcknowledged(false);
    setIndex(0);
  }, [signature]);

  // 여러 대면 돌아가며 보여 줍니다.
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

      {/* 대상 IP 입니다. 깜빡이는 것은 이 줄입니다. */}
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

      {/* 방금인지 몇 시간째인지에 따라 대응이 달라집니다. */}
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
