import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormRow } from "@/components/ui/FormRow";
import { DivisionField } from "@/components/ui/DivisionField";
import { Toggle } from "@/components/ui/Toggle";
import { type BusinessDivisionId } from "@/lib/businessDivisions";
import {
  SERVER_TYPES,
  type NewServerInput,
  type Server,
  type ServerType,
} from "@/lib/servers/types";
import { validateNewServerInput } from "@/lib/servers/validation";
import { useAuth } from "@/lib/auth";

type ServerRegisterModalProps = {
  open: boolean;
  editing: Server | null;
  onClose: () => void;
  onSubmit: (input: NewServerInput) => void;
};

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
  enabled: true,
};

function validate(draft: DraftValues): string {
  return validateNewServerInput({
    ip: draft.ip,
    type: draft.type,
    divisionId: draft.divisionId,
    nameEn: draft.nameEn,
    nameKo: draft.nameKo,
  });
}

export function ServerRegisterModal({
  open,
  editing,
  onClose,
  onSubmit,
}: ServerRegisterModalProps) {
  const [draft, setDraft] = useState<DraftValues>(EMPTY_DRAFT);
  const [error, setError] = useState("");
  const { account } = useAuth();
  const myDivision =
    account !== null && account.role !== "superadmin" ? account.divisionId : undefined;

  useEffect(() => {
    if (!open) return;

    setError("");
    setDraft(
      editing === null
        ? { ...EMPTY_DRAFT, divisionId: myDivision ?? "" }
        : {
            ip: editing.ip,
            type: editing.type,
            divisionId: editing.divisionId,
            nameEn: editing.nameEn,
            nameKo: editing.nameKo,
            enabled: editing.enabled,
          },
    );
  }, [open, editing, myDivision]);

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

  return (
    <Modal
      open={open}
      title={editing === null ? "서버 등록" : "서버 수정"}
      onClose={onClose}
      closeOnBackdrop={false}
    >
      <form onSubmit={handleSubmit} className="px-4 py-4">
        <div className="space-y-3">
          <FormRow required label="IP" htmlFor="new-ip">
            <input
              id="new-ip"
              type="text"
              inputMode="numeric"
              value={draft.ip}
              onChange={(event) => update("ip", event.currentTarget.value)}
              placeholder="1.1.1.1"
              className="input w-full font-mono"
            />
          </FormRow>

          <FormRow required label="타입" htmlFor="new-type">
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
          </FormRow>

          <DivisionField
            label="업무구분"
            id="new-division"
            value={draft.divisionId}
            onChange={(next) => update("divisionId", next)}
          />

          <FormRow required label="영문명" htmlFor="new-name-en">
            <input
              id="new-name-en"
              type="text"
              value={draft.nameEn}
              onChange={(event) => update("nameEn", event.currentTarget.value)}
              placeholder="test-server-01"
              className="input w-full font-mono"
            />
          </FormRow>

          <FormRow required label="한글명" htmlFor="new-name-ko">
            <input
              id="new-name-ko"
              type="text"
              value={draft.nameKo}
              onChange={(event) => update("nameKo", event.currentTarget.value)}
              placeholder="테스트 서버"
              className="input w-full"
            />
          </FormRow>

          {editing === null ? (
            <FormRow required label="사용여부">
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
            </FormRow>
          ) : null}
        </div>

        {error ? (
          <p className="mt-3 text-bt-text-m font-medium text-down-500">{error}</p>
        ) : null}

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-4">
          <button type="button" onClick={onClose} className="btn btn-ghost btn-md">
            취소
          </button>
          <button type="submit" className="btn btn-primary btn-md">
            {editing === null ? "등록" : "저장"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

