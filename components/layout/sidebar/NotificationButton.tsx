import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { BellIcon, TrashIcon } from "@/components/ui/icons";
import { formatDateTime } from "@/lib/datetime";
import { useAuth } from "@/lib/auth";
import { useNotifications, type AlertRow } from "@/lib/notifications/useNotifications";

type NotificationButtonProps = {
  /** 종 버튼에 입힐 클래스입니다. 사이드바가 접혔는지에 따라 달라집니다. */
  className: string;
};

// 알림 버튼과 알림 목록 창입니다.
//
// ★ 여기에 두는 이유: 사이드바는 모든 화면에 떠 있습니다.
//   대시보드에 두면 서버관리 화면을 보고 있는 동안 난 장애를 놓칩니다.
export function NotificationButton({ className }: NotificationButtonProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const { account } = useAuth();
  const { rows, muted, unreadCount, markSeen, clear } = useNotifications();

  // 창을 닫으면 눌렀던 버튼으로 초점을 돌려 줍니다.
  // Modal 의 useEffect 가 이 함수를 의존성으로 쓰기 때문에 useCallback 으로 고정합니다.
  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // 창이 열려 있는 동안은 계속 "여기까지 봤다" 고 적습니다.
  //
  // ★ 열 때 한 번만 적으면, 보고 있는 사이에 온 알림이 "안 읽음" 으로 남아
  //   눈앞에 띄워 둔 목록 위로 빨간 점이 다시 뜹니다.
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

        {/* 읽지 않은 것이 있을 때만 점을 찍습니다.
            숫자까지 적기에는 종 아이콘이 작아 오히려 안 읽힙니다. */}
        {unreadCount > 0 ? (
          <span
            aria-hidden
            className="absolute right-1 top-1 h-2 w-2 rounded-full bg-down-500 ring-2 ring-panel-2"
          />
        ) : null}
      </button>

      <Modal open={open} title="알림" onClose={close}>
        {/* 왜 조용한지 알려 줍니다. 모르면 "알림이 고장 났다" 고 여깁니다. */}
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
            {/* 한 줄씩 지우기 어려울 만큼 쌓였을 때를 위한 것입니다.
                장비 50대가 한꺼번에 죽으면 하나씩 누를 수 없습니다. */}
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

// 알림 한 줄입니다. 장비 하나의 **지금 상태**입니다.
//
// ★ 복구되면 같은 줄이 "정상 복구" 로 바뀝니다.
//   비정상 줄이 따로 남지 않습니다. 이미 살아난 장비를 보고 뛰어가지 않도록.
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

      {/* 지우면 **로그가 아니라 알림만** 사라집니다. 로그조회에는 그대로 남습니다.
          같은 파트 사람 모두의 알림함에서 함께 사라집니다. */}
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
