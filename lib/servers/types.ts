import type { BusinessDivisionId } from "@/lib/businessDivisions";

// 핑 결과입니다. 응답하면 up, 못 하면 down 입니다.
/**
 * 장비의 지금 상태입니다. (백엔드 server.types.ts 와 같습니다)
 *
 * pending 은 "아직 확정 못 함" 입니다. 감시를 막 켰거나, 실패가 임계값에
 * 못 미친 상태입니다. 3회를 채워야 down 이 됩니다.
 */
export type ServerStatus = "pending" | "up" | "down";

// 서버 구분입니다. 이 두 가지만 쓰기 때문에 문자열이 아니라 유니온으로 둡니다.
// 오타가 나면 화면을 열기 전에 타입 검사에서 걸립니다.
export type ServerType = "보안장비" | "서버";

// 검색의 선택지도 이 배열 하나에서 만들어 씁니다.
export const SERVER_TYPES: readonly ServerType[] = ["보안장비", "서버"];

// 목록에 보이는 서버 한 줄입니다.
// 백엔드가 붙으면 응답 모양에 맞춰 이 타입만 고치면
// 어디를 같이 고쳐야 하는지 타입 검사가 알려 줍니다.
export type Server = {
  readonly id: string;
  /** 영문명입니다. 예: test-server-01 */
  readonly nameEn: string;
  /** 한글명입니다. 예: 테스트 서버 */
  readonly nameKo: string;
  readonly ip: string;
  /** 보안장비 / 서버 구분입니다. */
  readonly type: ServerType;
  /** 업무구분입니다. 계정 권한도 같은 값을 씁니다. */
  readonly divisionId: BusinessDivisionId;
  readonly status: ServerStatus;
  /** 마지막 응답 시간(ms)입니다. 응답이 없으면 null 입니다. */
  readonly responseMs: number | null;
  /**
   * 마지막으로 확인한 시각입니다. ISO 문자열입니다.
   *
   * ★ 아직 한 번도 핑을 쏘지 않았으면 null 입니다.
   *   등록 직후가 그렇습니다. 예전 목 구현은 등록하자마자 "지금" 을 넣고
   *   상태를 up 으로 지어냈지만, 실제로는 핑을 쏴 봐야 알 수 있습니다.
   *   화면은 null 이면 "확인 기록 없음" 으로 보여 줍니다.
   */
  readonly checkedAt: string | null;
  /** 감시를 켜 둘지 여부입니다. 목록의 토글과 연결됩니다. */
  readonly enabled: boolean;
};

// 목록의 상태 점에 보이는 네 가지입니다.
// - online   : 초록. 감시 중이고 응답함
// - offline  : 빨강. 연속 실패가 임계값(기본 3회)을 넘김
// - pending  : 주황. 감시는 켜져 있는데 아직 확정 못 함
// - disabled : 회색. 토글이 꺼져 있어 아예 확인하지 않음
//
// ★ 주황이 따로 있는 이유
//   장비를 등록하거나 감시를 막 켠 순간에는 아직 아무것도 모릅니다.
//   그때 빨강이면 거짓말이고, 초록이면 더 나쁜 거짓말입니다.
//   회색으로 두면 "내가 꺼 둔 것" 과 구분이 안 됩니다.
//   실패 1~2회도 여기입니다. 3회를 채워야 빨강이 됩니다.
export type ServerDisplayState = "online" | "offline" | "pending" | "disabled";

// ★ DB 의 status_display 계산 칸과 **같은 규칙**입니다.
//   (db/init/01-schema.sql) 한쪽만 고치지 마세요.
export function getDisplayState(server: Server): ServerDisplayState {
  if (!server.enabled) return "disabled";
  if (server.status === "up") return "online";
  if (server.status === "down") return "offline";

  return "pending";
}

export const DISPLAY_STATE_LABEL: Record<ServerDisplayState, string> = {
  online: "정상",
  offline: "비정상",
  pending: "확인 중",
  disabled: "미연결",
};

// 서버를 한 대 등록할 때 사람이 채우는 값입니다.
//
// 표의 컬럼 중 상태 / 응답(ms) / 마지막 확인 은 핑을 쏴 봐야 나오는 값이라
// 여기에 없습니다. 등록 후 첫 확인에서 채워집니다.
export type NewServerInput = {
  readonly ip: string;
  readonly type: ServerType;
  readonly divisionId: BusinessDivisionId;
  readonly nameEn: string;
  readonly nameKo: string;
  /** 켜면 등록하자마자 핑을 쏘기 시작합니다. 끄면 목록에만 올라갑니다. */
  readonly enabled: boolean;
};

// 등록 결과입니다. 실패한 이유를 화면이 구분할 수 있게 담습니다.
export type AddServerResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "duplicate-ip" | "request-failed" };

// 검색 조건입니다. 빈 문자열은 "조건 없음"으로 봅니다.
export type ServerFilterValues = {
  readonly keyword: string;
  readonly type: ServerType | "";
  readonly divisionId: BusinessDivisionId | "";
  readonly status: ServerDisplayState | "";
  readonly from: string;
  readonly to: string;
};

export const EMPTY_FILTERS: ServerFilterValues = {
  keyword: "",
  type: "",
  divisionId: "",
  status: "",
  from: "",
  to: "",
};

/**
 * 일괄등록 결과입니다. (pingcheck-be 의 ImportResult 와 같은 모양입니다)
 *
 * 되는 줄만 들어가므로, 한 번에 "몇 대 들어갔고 몇 줄이 왜 안 됐는지" 가 옵니다.
 */
export type ImportResult = {
  readonly added: number;
  readonly failed: readonly { line: number; message: string }[];
};
