// 시스템 전체 설정입니다. 사람마다 다른 값이 아니라 하나뿐인 값입니다.
//
// 그래서 브라우저가 아니라 서버에 둡니다.
// 한 사람이 작업 모드를 켜면 다른 사람 화면에도 켜져 있어야 합니다.
export type SystemSettings = {
  /** jsonStore 가 id 로 줄을 찾으므로 고정값 하나를 씁니다. */
  readonly id: "system";
  /**
   * 작업 모드입니다.
   *
   * 켜면 알림을 울리지 않습니다. 계획된 점검 중에 알림이 쏟아지면
   * 사람들이 알림을 통째로 꺼 버리기 때문에 필요한 장치입니다.
   *
   * 주의: 알림만 멈춥니다. 핑은 계속 쏘고 상태와 로그도 그대로 쌓입니다.
   */
  readonly maintenanceMode: boolean;
  /** 누가 언제 켰는지입니다. 끄는 것을 잊었을 때 확인용입니다. */
  readonly maintenanceSince: string | null;
  readonly maintenanceBy: string | null;
};

export const DEFAULT_SETTINGS: SystemSettings = {
  id: "system",
  maintenanceMode: false,
  maintenanceSince: null,
  maintenanceBy: null,
};
