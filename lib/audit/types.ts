// 작업 이력(누가 무엇을 했는지)입니다.
//
// ★ 로그조회(logs)와 다른 것입니다.
//   logs 는 **장비가** 죽고 살아난 이력, 여기는 **사람이** 한 일입니다.
//   보관 기간도 다릅니다. logs 는 1일/60일, 여기는 1년입니다.

/** 걸러 보기용 묶음입니다. 행위 이름의 앞부분(server.import 의 server)입니다. */
export const AUDIT_GROUPS = ["auth", "account", "server", "access"] as const;

export type AuditGroup = (typeof AUDIT_GROUPS)[number];

export const AUDIT_GROUP_LABEL: Record<AuditGroup, string> = {
  auth: "로그인",
  account: "계정",
  server: "장비",
  access: "거절된 시도",
};

/**
 * 화면에 보여 줄 이름입니다. (백엔드 audit.types.ts 와 같아야 합니다)
 *
 * ★ 여기 없는 값이 와도 그대로 보여 줍니다.
 *   기록은 이미 남은 뒤라, 이름을 모른다고 감추면 무슨 일이 있었는지가 사라집니다.
 */
export const AUDIT_ACTION_LABEL: Record<string, string> = {
  "auth.login": "로그인",
  "auth.login.fail": "로그인 실패",
  "auth.logout": "로그아웃",
  "auth.password.setup": "첫 비밀번호 설정",
  "account.create": "계정 생성",
  "account.update": "계정 수정",
  "account.delete": "계정 삭제",
  "account.password.reset": "비밀번호 초기화",
  "account.enable": "계정 사용",
  "account.disable": "계정 사용중지",
  "server.create": "장비 등록",
  "server.update": "장비 수정",
  "server.delete": "장비 삭제",
  "server.watch.on": "감시 시작",
  "server.watch.off": "감시 중지",
  "server.import": "장비 일괄등록",
  "access.rejected": "처리 거절",
};

export type AuditEntry = {
  readonly id: string;
  readonly actorLoginId: string;
  readonly actorName: string;
  readonly actorIp: string | null;
  readonly action: string;
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly targetLabel: string;
  readonly divisionId: string | null;
  readonly detail: string;
  readonly occurredAt: string;
};

export type AuditPage = {
  readonly rows: readonly AuditEntry[];
  readonly totalCount: number;
};

export type AuditQuery = {
  readonly page: number;
  readonly pageSize: number;
  readonly from: string;
  readonly to: string;
  readonly group: string;
  readonly keyword: string;
};

export const EMPTY_AUDIT_QUERY: AuditQuery = {
  page: 1,
  pageSize: 50,
  from: "",
  to: "",
  group: "",
  keyword: "",
};
