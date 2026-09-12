// 업무구분입니다.
//
// 서버 목록을 거르는 데도 쓰지만, 앞으로 계정마다
// "어느 업무구분의 서버를 볼 수 있는지" 권한을 나눌 때도 같은 값을 씁니다.
// 그래서 서버 쪽(lib/servers)이 아니라 공용 자리에 둡니다.
//
// 화면에 보이는 이름(label)과 저장에 쓰는 값(id)을 나눠 둔 이유:
// 권한은 계정에 "judicial 을 볼 수 있음" 처럼 id 로 저장됩니다.
// 나중에 이름을 "사법" -> "사법업무" 로 바꿔도 저장된 권한이 깨지지 않습니다.
export type BusinessDivisionId = "judicial" | "registry" | "family" | "control";

export type BusinessDivision = {
  readonly id: BusinessDivisionId;
  readonly label: string;
};

// 실제 업무구분이 정해지면 이 배열만 고치면 됩니다.
// 검색 선택지도, 계정 권한 선택지도 여기서 만들어 씁니다.
export const BUSINESS_DIVISIONS: readonly BusinessDivision[] = [
  { id: "judicial", label: "사법" },
  { id: "registry", label: "등기" },
  { id: "family", label: "가족" },
  { id: "control", label: "관제" },
];

// id 로 이름을 찾을 때 씁니다. 목록을 매번 훑지 않아도 됩니다.
export const BUSINESS_DIVISION_LABEL: Record<BusinessDivisionId, string> =
  BUSINESS_DIVISIONS.reduce(
    (acc, division) => {
      acc[division.id] = division.label;
      return acc;
    },
    {} as Record<BusinessDivisionId, string>,
  );

// 권한을 붙일 때 쓸 검사입니다.
// 볼 수 있는 업무구분 목록이 비어 있으면 "제한 없음"으로 봅니다.
export function canViewDivision(
  allowed: readonly BusinessDivisionId[],
  target: BusinessDivisionId,
): boolean {
  return allowed.length === 0 || allowed.includes(target);
}
