import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { BellIcon, TrashIcon } from "@/components/ui/icons";
import { formatDateTime } from "@/lib/datetime";
import { useAuth } from "@/lib/auth";
import { useNotifications, type AlertRow } from "@/lib/notifications/useNotifications";

type NotificationButtonProps = {
  className: string;
};

export function NotificationButton({ className }: NotificationButtonProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const { account } = useAuth();
  const { rows, muted, unreadCount, markSeen, clear } = useNotifications();

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (open) markSeen();
  }, [open, markSeen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={unreadCount > 0 ? `알림 ${unreadCount}건` : "알림"}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="알림"
        className={`relative ${className}`}
      >
        <BellIcon />

        {unreadCount > 0 ? (
          <span
            aria-hidden
            className="absolute right-1 top-1 h-2 w-2 rounded-full bg-down-500 ring-2 ring-panel-2"
          />
        ) : null}
      </button>

      <Modal open={open} title="알림" onClose={close}>
        {muted ? (
          <p className="border-b border-line bg-row-hover px-4 py-2 text-b2_body_r text-secondary">
            내 알림을 꺼 두어 소리가 나지 않습니다. 목록은 그대로 쌓입니다.
          </p>
        ) : null}

        {rows.length === 0 ? (
          <p className="px-4 py-12 text-center text-b2_body_r text-muted">
            표시할 알림이 없습니다.
          </p>
        ) : (
          <>
            <div className="flex justify-end border-b border-line px-4 py-2">
              <button
                type="button"
                onClick={() => void clear(null)}
                className="btn btn-ghost btn-sm"
              >
                <TrashIcon width={14} height={14} />
                모두 지우기
              </button>
            </div>

            <ul className="divide-y divide-line">
              {rows.map((row) => (
                <AlertItem
                  key={row.serverId}
                  row={row}
                  onClear={() => void clear([row.serverId])}
                />
              ))}
            </ul>
          </>
        )}
      </Modal>
    </>
  );
}

function AlertItem({ row, onClear }: { row: AlertRow; onClear: () => void }) {
  const down = row.type === "down";

  return (
    <li className="group flex items-start gap-3 px-4 py-3">
      <span
        aria-hidden
        className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${
          down ? "bg-down-500" : "bg-up-500"
        }`}
      />

      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-2">
          <span
            className={`text-b2_body_m font-semibold ${
              down ? "text-down-500" : "text-up-500"
            }`}
          >
            {down ? "비정상" : "정상 복구"}
          </span>
          <span className="truncate text-b2_body_m text-body">{row.serverNameKo}</span>
        </p>

        <p className="mt-0.5 truncate text-b2_body_r text-secondary">
          <span className="font-mono">{row.serverIp}</span> · {row.serverType} ·{" "}
          {row.detail}
        </p>

        <p className="mt-0.5 font-mono text-bt-text-s text-muted">
          {formatDateTime(row.occurredAt)}
        </p>
      </div>

      <button
        type="button"
        onClick={onClear}
        aria-label={`${row.serverNameKo} 알림 지우기`}
        title="알림 지우기 (로그는 남습니다)"
        className="shrink-0 rounded p-1 text-muted transition hover:bg-row-hover hover:text-down-500"
      >
        <TrashIcon width={16} height={16} />
      </button>
    </li>
  );
}
