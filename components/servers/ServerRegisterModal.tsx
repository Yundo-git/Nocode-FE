import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { Toggle } from "@/components/ui/Toggle";
import {
  BUSINESS_DIVISIONS,
  type BusinessDivisionId,
} from "@/lib/businessDivisions";
import {
  SERVER_TYPES,
  type NewServerInput,
  type ServerType,
} from "@/lib/servers/types";
import { validateNewServerInput } from "@/lib/servers/validation";

type ServerRegisterModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewServerInput) => void;
};

// 폼이 채워지는 중에는 아직 값이 비어 있을 수 있어
// NewServerInput 과 달리 선택 항목을 빈 문자열까지 허용합니다.
type DraftValues = {
  ip: string;
  type: ServerType | "";
  divisionId: BusinessDivisionId | "";
  nameEn: string;
  nameKo: string;
  enabled: boolean;
};

const EMPTY_DRAFT: DraftValues = {
  ip: "",
  type: "",
  divisionId: "",
  nameEn: "",
  nameKo: "",
  // 등록하면 바로 감시를 시작하는 쪽이 흔하므로 켜 둔 상태로 시작합니다.
  enabled: true,
};

// 폼 검사입니다. 규칙은 API 와 공유합니다. (lib/servers/validation.ts)
function validate(draft: DraftValues): string {
  return validateNewServerInput({
    ip: draft.ip,
    type: draft.type,
    divisionId: draft.divisionId,
    nameEn: draft.nameEn,
    nameKo: draft.nameKo,
  });
}

// 서버를 한 대 등록하는 창입니다.
// 표의 컬럼 중 사람이 정하는 값만 받고, 상태·응답·마지막 확인은
// 등록 후 핑 결과로 채워집니다.
export function ServerRegisterModal({
  open,
  onClose,
  onSubmit,
}: ServerRegisterModalProps) {
  const [draft, setDraft] = useState<DraftValues>(EMPTY_DRAFT);
  const [error, setError] = useState("");

  // 창을 닫았다 다시 열면 앞서 입력하던 값이 남지 않게 비웁니다.
  useEffect(() => {
    if (!open) {
      setDraft(EMPTY_DRAFT);
      setError("");
    }
  }, [open]);

  const update = <K extends keyof DraftValues>(key: K, value: DraftValues[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = validate(draft);

    if (message) {
      setError(message);
      return;
    }

    // validate 를 통과했으므로 선택 항목이 비어 있지 않습니다.
    onSubmit({
      ip: draft.ip.trim(),
      type: draft.type as ServerType,
      divisionId: draft.divisionId as BusinessDivisionId,
      nameEn: draft.nameEn.trim(),
      nameKo: draft.nameKo.trim(),
      enabled: draft.enabled,
    });
    onClose();
  };

  // closeOnBackdrop={false}: 입력하던 내용이 실수로 날아가지 않도록
  // 바깥(어두운 면)을 눌러도 닫히지 않게 합니다.
  return (
    <Modal open={open} title="서버 등록" onClose={onClose} closeOnBackdrop={false}>
      <form onSubmit={handleSubmit} className="px-4 py-4">
        <div className="space-y-3">
          <Row label="IP" htmlFor="new-ip">
            <input
              id="new-ip"
              type="text"
              inputMode="numeric"
              value={draft.ip}
              onChange={(event) => update("ip", event.currentTarget.value)}
              placeholder="1.1.1.1"
              className="input w-full font-mono"
            />
          </Row>

          <Row label="타입" htmlFor="new-type">
            <select
              id="new-type"
              value={draft.type}
              onChange={(event) =>
                update("type", event.currentTarget.value as ServerType | "")
              }
              className="select w-full"
            >
              <option value="">선택해주세요</option>
              {SERVER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Row>

          <Row label="업무구분" htmlFor="new-division">
            <select
              id="new-division"
              value={draft.divisionId}
              onChange={(event) =>
                update(
                  "divisionId",
                  event.currentTarget.value as BusinessDivisionId | "",
                )
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
          </Row>

          <Row label="영문명" htmlFor="new-name-en">
            <input
              id="new-name-en"
              type="text"
              value={draft.nameEn}
              onChange={(event) => update("nameEn", event.currentTarget.value)}
              placeholder="test-server-01"
              className="input w-full font-mono"
            />
          </Row>

          <Row label="한글명" htmlFor="new-name-ko">
            <input
              id="new-name-ko"
              type="text"
              value={draft.nameKo}
              onChange={(event) => update("nameKo", event.currentTarget.value)}
              placeholder="테스트 서버"
              className="input w-full"
            />
          </Row>

          <Row label="사용여부">
            <div className="flex items-center gap-2">
              <Toggle
                checked={draft.enabled}
                onChange={(next) => update("enabled", next)}
                label="등록 후 바로 핑 보내기"
              />
              <span className="text-b2_body_r text-muted">
                {draft.enabled
                  ? "등록하면 바로 핑을 보냅니다"
                  : "핑을 보내지 않고 목록에만 올립니다"}
              </span>
            </div>
          </Row>
        </div>

        {error ? (
          <p className="mt-3 text-bt-text-m font-medium text-down-500">{error}</p>
        ) : null}

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-4">
          <button type="button" onClick={onClose} className="btn btn-ghost btn-md">
            취소
          </button>
          <button type="submit" className="btn btn-primary btn-md">
            등록
          </button>
        </div>
      </form>
    </Modal>
  );
}

// 라벨과 입력칸을 한 줄로 묶습니다. 모두 필수라 라벨 옆에 * 를 답니다.
function Row({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <label
        htmlFor={htmlFor}
        className="shrink-0 text-b2_body_m font-medium text-secondary sm:w-20"
      >
        {label}
        <span className="ml-0.5 text-down-500">*</span>
      </label>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
