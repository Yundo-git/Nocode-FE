
export const AUDIT_GROUPS = ["auth", "account", "server", "access"] as const;

export type AuditGroup = (typeof AUDIT_GROUPS)[number];

export const AUDIT_GROUP_LABEL: Record<AuditGroup, string> = {
  auth: "로그인",
  account: "계정",
  server: "장비",
  access: "거절된 시도",
};

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
