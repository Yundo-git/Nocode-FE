import { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  tone?: "success" | "error";
  duration?: number;
  onDone: () => void;
};

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
