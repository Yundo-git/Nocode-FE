// 시스템 전체 설정입니다. 사람마다 다른 값이 아니라 하나뿐인 값입니다.
//
// 그래서 브라우저가 아니라 서버(DB)에 둡니다.
// 핑 주기처럼 모두에게 똑같이 적용되는 값입니다.
export type SystemSettings = {
  // ★ "작업 모드" 는 여기 없습니다.
  //   전에는 시스템 전체에 하나뿐인 스위치라 한 사람이 켜면 모두의 알림이
  //   멎었습니다. 내 소리를 끄자고 옆자리까지 귀를 막을 이유가 없어서,
  //   계정마다의 "알림 받기"(accounts.notifyEnabled)로 옮겼습니다.

  // ── 핑 설정 (DB 에 있고 화면은 읽기만 합니다) ──────────────────────────
  /**
   * 핑 주기입니다.
   *
   * ★ 대시보드의 "감시 멈춤" 판정과 박동 선이 **이 값을 그대로 씁니다.**
   *   화면에 따로 적어 두지 않으므로, 여기만 바꾸면 전부 따라옵니다.
   *   (전에는 화면에 60초라고 적혀 있어 실제 15초와 어긋나 있었습니다)
   */
  readonly pingIntervalSec: number;
  /** 연속 몇 번 실패해야 비정상으로 볼지입니다. */
  readonly failThreshold: number;
  /** 로그 보관 기간입니다. */
  readonly logRetentionDays: number;
};

// 아직 받아 오기 전에 쓰는 값입니다.
export const DEFAULT_SETTINGS: SystemSettings = {
  pingIntervalSec: 15,
  failThreshold: 3,
  logRetentionDays: 90,
};
