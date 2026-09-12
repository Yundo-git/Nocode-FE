// 서버 한 대의 상태입니다.
export type ServerStatus = "up" | "warning" | "down" | "unknown";

// 목록에 보이는 서버 한 줄입니다.
// 백엔드가 붙으면 응답 모양에 맞춰 이 타입만 고치면
// 어디를 같이 고쳐야 하는지 타입 검사가 알려 줍니다.
export type Server = {
  readonly id: string;
  readonly name: string;
  readonly ip: string;
  /** 일반 / 사진 처럼 서버를 나누는 구분입니다. */
  readonly type: string;
  readonly status: ServerStatus;
  /** 마지막 응답 시간(ms)입니다. 응답이 없으면 null 입니다. */
  readonly responseMs: number | null;
  /** 마지막으로 확인한 시각입니다. ISO 문자열로 둡니다. */
  readonly checkedAt: string;
  /** 감시를 켜 둘지 여부입니다. 목록의 토글과 연결됩니다. */
  readonly enabled: boolean;
};

// 검색 조건입니다. 빈 문자열은 "조건 없음"으로 봅니다.
export type ServerFilterValues = {
  readonly keyword: string;
  readonly type: string;
  readonly status: ServerStatus | "";
  readonly from: string;
  readonly to: string;
};

export const EMPTY_FILTERS: ServerFilterValues = {
  keyword: "",
  type: "",
  status: "",
  from: "",
  to: "",
};

// 화면에 보여 줄 한글 이름입니다.
export const STATUS_LABEL: Record<ServerStatus, string> = {
  up: "정상",
  warning: "주의",
  down: "장애",
  unknown: "확인 안 됨",
};
