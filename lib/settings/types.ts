// 시스템 전체 설정입니다. 사람마다 다른 값이 아니라 하나뿐인 값입니다.
//
// 그래서 브라우저가 아니라 서버(DB)에 둡니다.
// 한 사람이 작업 모드를 켜면 다른 사람 화면에도 켜져 있어야 합니다.
export type SystemSettings = {
  /**
   * 작업 모드입니다.
   *
   * 켜면 알림을 울리지 않습니다. 계획된 점검 중에 알림이 쏟아지면
   * 사람들이 알림을 통째로 꺼 버리기 때문에 필요한 장치입니다.
   *
   * 주의: 알림만 멈춥니다. 핑은 계속 쏘고 상태와 로그도 그대로 쌓입니다.
   */
  readonly maintenanceMode: boolean;
  /**
   * 누가 언제 켰는지입니다. 끄는 것을 잊었을 때 확인용입니다.
   *
   * ★ 이 값은 화면이 정하지 않습니다. 백엔드가 세션에서 가져옵니다.
   *   화면이 알려 준 이름을 믿으면 아무 이름이나 적어 보낼 수 있습니다.
   */
  readonly maintenanceSince: string | null;
  readonly maintenanceBy: string | null;

  // ── 핑 설정 (DB 에 있고 화면은 읽기만 합니다) ──────────────────────────
  /**
   * 핑 주기입니다.
   *
   * ★ 이 값을 바꾸면 lib/dashboard/types.ts 의 EXPECTED_PING_INTERVAL_MS 도
   *   같이 맞춰야 합니다. (NOTES.md 4-15)
   */
  readonly pingIntervalSec: number;
  /** 연속 몇 번 실패해야 비정상으로 볼지입니다. */
  readonly failThreshold: number;
  /** 로그 보관 기간입니다. */
  readonly logRetentionDays: number;
};

// 아직 받아 오기 전에 쓰는 값입니다.
// 작업 모드는 false 로 시작해야 합니다. true 로 시작하면
// 불러오는 잠깐 동안 "알림 꺼짐" 이 보였다 사라집니다.
export const DEFAULT_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  maintenanceSince: null,
  maintenanceBy: null,
  pingIntervalSec: 15,
  failThreshold: 3,
  logRetentionDays: 90,
};
