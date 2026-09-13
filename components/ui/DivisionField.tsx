import { FormRow } from "@/components/ui/FormRow";
import { useAuth } from "@/lib/auth";
import {
  BUSINESS_DIVISIONS,
  BUSINESS_DIVISION_LABEL,
  type BusinessDivisionId,
} from "@/lib/businessDivisions";

// 업무구분을 고르는 칸입니다. 등록·수정 창에서 씁니다.
//
// ★ 총괄(개발자 계정)에게만 선택상자를 줍니다.
//   등기 관리자는 등기밖에 고를 수 없습니다. 고를 것이 하나뿐인데
//   선택상자를 두면, 열어 보고 남의 파트를 골랐다가 저장할 때서야
//   "다른 파트에는 등록할 수 없습니다" 를 듣습니다.
//   애초에 고를 수 없게 두는 편이 낫습니다.
//
// ★ 감추지는 않습니다. 어느 파트로 들어가는지는 보여야 합니다.
//   값이 안 보이면 "업무구분을 안 적었는데 등록이 되네?" 가 됩니다.
//
// ※ 이것은 화면 정리일 뿐입니다. 실제 차단은 API 가 합니다.
//   (pingcheck-be 의 canAccessDivision)
type DivisionFieldProps = {
  label: string;
  id: string;
  value: BusinessDivisionId | "";
  onChange: (next: BusinessDivisionId | "") => void;
};

export function DivisionField({ label, id, value, onChange }: DivisionFieldProps) {
  const { account } = useAuth();
  const canChoose = account?.role === "superadmin";

  if (!canChoose) {
    // 내 파트로 고정됩니다. 값은 부모가 들고 있으므로 보여 주기만 합니다.
    const mine = account?.divisionId;

    return (
      <FormRow required label={label} htmlFor={id}>
        <input
          id={id}
          type="text"
          readOnly
          value={mine === undefined ? "" : BUSINESS_DIVISION_LABEL[mine]}
          // 읽기 전용이라는 것이 눈에 보여야 합니다. 회색 바탕에 흐린 글자입니다.
          className="input w-full cursor-default bg-row-hover text-secondary"
          title="내 파트로 등록됩니다. 다른 파트는 그 파트 관리자가 맡습니다."
        />
      </FormRow>
    );
  }

  return (
    <FormRow required label={label} htmlFor={id}>
      <select
        id={id}
        value={value}
        onChange={(event) =>
          onChange(event.currentTarget.value as BusinessDivisionId | "")
        }
        className="select w-full"
      >
        <option value="">선택해주세요</option>
        {BUSINESS_DIVISIONS.map((division) => (
          <option key={division.id} value={division.id}>
            {division.label}
          </option>
        ))}
      </select>
    </FormRow>
  );
}
