export type BusinessDivisionId = "judicial" | "registry" | "family" | "control";

export type BusinessDivision = {
  readonly id: BusinessDivisionId;
  readonly label: string;
};

export const BUSINESS_DIVISIONS: readonly BusinessDivision[] = [
  { id: "judicial", label: "사법" },
  { id: "registry", label: "등기" },
  { id: "family", label: "가족" },
  { id: "control", label: "관제" },
];

export const BUSINESS_DIVISION_LABEL: Record<BusinessDivisionId, string> =
  BUSINESS_DIVISIONS.reduce(
    (acc, division) => {
      acc[division.id] = division.label;
      return acc;
    },
    {} as Record<BusinessDivisionId, string>,
  );

