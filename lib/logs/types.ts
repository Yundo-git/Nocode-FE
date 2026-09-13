import type { BusinessDivisionId } from "@/lib/businessDivisions";

// 로그 종류입니다.
// 나중에 늘어날 수 있으므로 화면에서 직접 문자열을 비교하지 말고
// 아래 LOG_TYPE_LABEL 을 거쳐 쓰세요.
// ★ 감시 시작/중지는 여기 없습니다.
//   사람이 한 일이라 **작업이력** 화면에 남습니다. (/audit)
//   로그조회는 장비에 일어난 일만 봅니다.
export type LogType =
  | "down" // 정상 -> 비정상
  | "up" // 비정상 -> 정상
  | "registered"; // 서버 등록

export const LOG_TYPES: readonly LogType[] = [
  "down",
  "up",
  "registered",
];

export const LOG_TYPE_LABEL: Record<LogType, string> = {
  down: "비정상 전환",
  up: "정상 복구",
  registered: "서버 등록",
};

// 로그 한 줄입니다.
//
// 서버 정보를 id 만 담지 않고 IP·이름까지 함께 적어 둡니다.
// 나중에 그 서버를 지우거나 이름을 바꿔도 "그때 무슨 일이 있었는지" 가
// 그대로 남아야 하기 때문입니다. (이력은 바뀌면 안 됩니다)
export type LogEntry = {
  readonly id: string;
  readonly serverId: string;
  readonly serverIp: string;
  readonly serverNameKo: string;
  /** 영문명입니다. 그 시점의 값이 복사돼 있습니다. */
  readonly serverNameEn: string;
  /** 보안장비 / 서버 구분입니다. 그 시점의 값입니다. */
  readonly serverType: string;
  readonly divisionId: BusinessDivisionId;
  readonly type: LogType;
  /** 사람이 읽을 한 줄 설명입니다. 예: "응답 없음 (3회 연속)" */
  readonly detail: string;
  /** 일이 일어난 시각입니다. ISO 문자열로 둡니다. */
  readonly occurredAt: string;
};

// 로그 조회 조건입니다.
//
// 서버관리·계정관리와 달리 **조건과 쪽 번호를 서버로 넘깁니다.**
// 로그는 금방 수만 건이 되어 브라우저가 전부 받아서 거를 수 없습니다.
export type LogQuery = {
  readonly page: number;
  readonly pageSize: number;
  /** 조회 시작 시각입니다. datetime-local 형식(2026-09-12T00:00)입니다. */
  readonly from: string;
  readonly to: string;
  /** 특정 장비만 볼 때 씁니다. 빈 문자열이면 전체입니다. */
  readonly serverId: string;
  /**
   * 장비 이름이나 IP 로 찾습니다. (서버관리의 "서버명 · IP" 와 같은 방식)
   *
   * 로그에는 그 시점의 이름과 IP 가 적혀 있어, 장비 이름을 바꿔도
   * 예전 이름으로 과거 기록을 찾을 수 있습니다.
   */
  readonly keyword: string;
  readonly type: LogType | "";
  readonly divisionId: BusinessDivisionId | "";
};

export const EMPTY_LOG_QUERY: LogQuery = {
  page: 1,
  pageSize: 50,
  from: "",
  to: "",
  serverId: "",
  keyword: "",
  type: "",
  divisionId: "",
};

// 서버가 돌려주는 한 쪽 분량입니다.
export type LogPage = {
  readonly rows: readonly LogEntry[];
  /** 조건에 맞는 전체 건수입니다. 쪽 수를 계산하는 데 씁니다. */
  readonly totalCount: number;
};
