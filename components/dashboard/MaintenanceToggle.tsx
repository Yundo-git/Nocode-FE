import { useState } from "react";
import { useMyAccount } from "@/lib/accounts/useAccounts";

// 내 알림을 끄고 켜는 버튼입니다. (대시보드 도구 줄)
//
// ★ 한때 "작업 모드" 라는 이름으로 **시스템 전체**에 하나뿐인 스위치였습니다.
//   한 사람이 켜면 모두의 알림이 멎었습니다. 그건 과했습니다 —
//   내 소리를 끄자고 옆자리 관제 담당자까지 귀를 막을 이유가 없습니다.
//   이제 각자 자기 것만 끕니다. 그래서 관리자만 쓸 이유도 없어졌습니다.
//
// ★ 내 계정 설정의 "알림 받기" 와 **같은 스위치**입니다.
//   장애가 울릴 때 사람이 있는 자리는 대시보드라, 여기에도 둡니다.
//   한쪽을 바꾸면 다른 쪽도 같이 바뀝니다.
//
// ★ 꺼도 알림함에는 그대로 쌓입니다. 소리만 멎습니다.
//   나중에 "그때 뭐였지" 를 볼 수 있어야 합니다.
export function MaintenanceToggle() {
  const { account, setNotifyEnabled } = useMyAccount();
  const [error, setError] = useState("");

  if (account === null) return null;

  const on = account.notifyEnabled;

  const handleClick = async () => {
    setError(await setNotifyEnabled(!on));
  };

  return (
    <div className="flex items-center gap-2">
      {error ? (
        <span className="text-bt-text-s text-down-500">{error}</span>
      ) : null}

      <button
        type="button"
        onClick={() => void handleClick()}
        aria-pressed={!on}
        title={
          on
            ? "장애가 나면 소리로 알립니다. 누르면 내 소리만 멎습니다."
            : "내 소리가 꺼져 있습니다. 알림함에는 그대로 쌓입니다."
        }
        // 꺼져 있을 때 눈에 띄게 합니다.
        // 이 설정에서 가장 위험한 실수가 "꺼 둔 것을 잊는" 것이라,
        // 꺼져 있다는 사실이 계속 보여야 합니다.
        className={on ? "btn btn-ghost btn-sm" : "btn btn-primary btn-sm"}
      >
        알림 {on ? "켜짐" : "꺼짐"}
      </button>
    </div>
  );
}
