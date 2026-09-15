import { FormRow } from "@/components/ui/FormRow";
import { useAuth } from "@/lib/auth";
import {
  BUSINESS_DIVISIONS,
  BUSINESS_DIVISION_LABEL,
  type BusinessDivisionId,
} from "@/lib/businessDivisions";

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
    const mine = account?.divisionId;

    return (
      <FormRow required label={label} htmlFor={id}>
        <input
          id={id}
          type="text"
          readOnly
          value={mine === undefined ? "" : BUSINESS_DIVISION_LABEL[mine]}
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
