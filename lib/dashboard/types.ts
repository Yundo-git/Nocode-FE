import type { ServerType } from "@/lib/servers/types";

// 대시보드가 한 번에 받아 오는 요약입니다.
//
// 서버 목록과 로그를 각각 받아 브라우저에서 세지 않습니다.
// - 로그는 수만 건이 될 수 있어 전부 받을 수 없습니다.
// - 장비가 늘어도 요청 한 번, 응답 크기도 거의 그대로입니다.
export type ProblemState = "offline" | "disabled";

export type ProblemServer = {
  readonly id: string;
  readonly ip: string;
  readonly nameKo: string;
  readonly state: ProblemState;
  /**
   * 이 상태가 된 시각입니다. 로그에서 찾습니다.
   * 기록이 없으면 null 이고, 화면은 지속 시간을 보여 주지 않습니다.
   */
  readonly since: string | null;
};

export type StateCounts = {
  readonly online: number;
  readonly offline: number;
  readonly disabled: number;
  readonly total: number;
};

// 방화벽 / 서버처럼 장비 종류별 집계입니다.
//
// 업무구분(사법·등기…)이 아니라 종류로 나누는 이유:
// 계정은 자기 파트의 장비만 봅니다. 그래서 업무구분으로 나누면
// 한 사람 화면에는 한 칸만 차고 나머지는 늘 비어 있습니다.
// 종류는 어느 파트에나 섞여 있어 나눠 볼 값어치가 있습니다.
export type TypeSummary = {
  readonly type: ServerType;
  readonly counts: StateCounts;
};

export type DashboardSummary = {
  readonly counts: StateCounts;
  readonly byType: readonly TypeSummary[];
  /**
   * 감시 중인 장비를 마지막으로 확인한 시각입니다.
   *
   * 이 값이 오래되면 핑을 쏘는 쪽이 멈춘 것입니다.
   * 그때 화면은 마지막 상태를 그대로 보여 주기 때문에 전부 "정상" 으로 보입니다.
   * 모니터링에서 가장 위험한 상황이라 따로 내려보냅니다.
   */
  readonly lastCheckedAt: string | null;
  /** 오늘 0시부터 지금까지 비정상으로 바뀐 횟수입니다. */
  readonly todayDownCount: number;
  /** 손봐야 할 장비입니다. 비정상이 앞, 미연결이 뒤입니다. */
  readonly problems: readonly ProblemServer[];
};

// 백엔드가 핑을 얼마마다 쏘는지입니다.
//
// ★ 핑 주기를 정하면 이 값을 반드시 맞춰 주세요.
//   이 값이 실제보다 크면 감시가 멈춰도 한참 뒤에야 알아채고,
//   실제보다 작으면 멀쩡한데도 경고가 뜹니다.
export const EXPECTED_PING_INTERVAL_MS = 60_000;

// 대시보드가 요약을 다시 받아 오는 간격입니다.
// useDashboardSummary 가 이 값을 씁니다. (두 곳에 따로 적으면 어긋납니다)
export const SUMMARY_REFRESH_MS = 15_000;

// 마지막 확인이 이보다 오래됐으면 감시가 멈춘 것으로 봅니다.
//
// 화면에 보이는 "마지막 점검" 은 실제보다 최대
//   핑 주기 + 요약 갱신 간격
// 만큼 뒤처져 있습니다. 핑을 쏜 직후에 갱신이 막 지나갔을 수 있기 때문입니다.
// 그 지연에 더해, 한두 번 걸러진 것까지 경고하면 시끄러우므로 3회분을 봅니다.
//
// 예) 핑 15초 + 갱신 15초 -> 15*3 + 15 = 60초 뒤 경고
export const STALE_AFTER_MS =
  EXPECTED_PING_INTERVAL_MS * 3 + SUMMARY_REFRESH_MS;
