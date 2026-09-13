import { useEffect, useState } from "react";

type ToastProps = {
  /** 보여 줄 문구입니다. 빈 문자열이면 아무것도 그리지 않습니다. */
  message: string;
  /** 실패 알림이면 붉게 보여 줍니다. */
  tone?: "success" | "error";
  /** 몇 밀리초 뒤에 사라질지입니다. */
  duration?: number;
  onDone: () => void;
};

// 오른쪽 위에 잠깐 떴다 사라지는 알림입니다.
//
// 글자만 조용히 바뀌면 저장이 됐는지 안 됐는지 모르고 지나갑니다.
// 움직여서 들어오면 눈이 한 번 갑니다.
//
// 실패는 오래 띄웁니다. 사용자가 읽고 무언가 해야 하기 때문입니다.
export function Toast({
  message,
  tone = "success",
  duration,
  onDone,
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const ms = duration ?? (tone === "error" ? 6000 : 3000);
    const timer = setTimeout(() => {
      setVisible(false);
      onDone();
    }, ms);

    return () => clearTimeout(timer);
  }, [message, tone, duration, onDone]);

  if (!visible || !message) {
    return null;
  }

  return (
    <div
      // 읽기 도구가 화면을 옮기지 않고도 읽어 주도록 합니다.
      role="status"
      aria-live="polite"
      className="animate-toast-in panel fixed right-5 top-5 z-50 max-w-[320px] px-4 py-3 shadow-soft"
    >
      <p
        className={`text-b2_body_m font-medium ${
          tone === "error" ? "text-down-500" : "text-up-500"
        }`}
      >
        {message}
      </p>
    </div>
  );
}
