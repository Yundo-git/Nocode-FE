import type { Server } from "@/lib/servers/types";

// data/servers.json 이 아직 없을 때 처음 한 번 넣는 값입니다.
// 파일이 만들어진 뒤에는 이 값을 고쳐도 반영되지 않습니다.
// (다시 넣으려면 data/servers.json 을 지우면 됩니다.)
//
// 화면을 확인하려고 상태를 일부러 섞어 두었습니다.
// 전부 정상이면 도넛이 100% 라 확인할 것이 없습니다.
//
// checkedAt 은 파일을 처음 만드는 시점으로 둡니다.
// 고정 날짜로 두면 첫 화면부터 "감시 멈춤" 경고가 떠 버립니다.
const CHECKED_AT = new Date().toISOString();

export const SEED_SERVERS: readonly Server[] = [
  {
    id: "srv-test-001",
    nameEn: "test-server-01",
    nameKo: "테스트 서버",
    ip: "1.1.1.1",
    type: "서버",
    divisionId: "control",
    status: "up",
    responseMs: 12,
    checkedAt: CHECKED_AT,
    enabled: true,
  },
  {
    id: "srv-seed-002",
    nameEn: "ctl-fw-01",
    nameKo: "관제 방화벽",
    ip: "10.10.0.11",
    type: "방화벽",
    divisionId: "control",
    status: "down",
    responseMs: null,
    checkedAt: CHECKED_AT,
    enabled: true,
  },
  {
    id: "srv-seed-003",
    nameEn: "jud-web-01",
    nameKo: "사법 웹서버",
    ip: "10.10.1.21",
    type: "서버",
    divisionId: "judicial",
    status: "up",
    responseMs: 24,
    checkedAt: CHECKED_AT,
    enabled: true,
  },
  {
    id: "srv-seed-004",
    nameEn: "jud-fw-01",
    nameKo: "사법 방화벽",
    ip: "10.10.1.11",
    type: "방화벽",
    divisionId: "judicial",
    status: "up",
    responseMs: 8,
    checkedAt: CHECKED_AT,
    enabled: true,
  },
  {
    id: "srv-seed-005",
    nameEn: "reg-db-01",
    nameKo: "등기 DB",
    ip: "10.10.2.31",
    type: "서버",
    divisionId: "registry",
    status: "down",
    responseMs: null,
    // 감시를 꺼 둔 상태입니다. 화면에는 "미연결"(회색)로 보입니다.
    checkedAt: CHECKED_AT,
    enabled: false,
  },
  {
    id: "srv-seed-006",
    nameEn: "fam-fw-01",
    nameKo: "가족 방화벽",
    ip: "10.10.3.41",
    type: "방화벽",
    divisionId: "family",
    status: "up",
    responseMs: 31,
    checkedAt: CHECKED_AT,
    enabled: true,
  },
];
