import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormRow } from "@/components/ui/FormRow";
import {
  ACCOUNT_ROLES,
  ROLE_LABEL,
  type Account,
  type AccountRole,
  type AdminAccountInput,
} from "@/lib/accounts/types";
import { validateAdminAccount } from "@/lib/accounts/validation";
import {
  BUSINESS_DIVISIONS,
  type BusinessDivisionId,
} from "@/lib/businessDivisions";

type AccountFormModalProps = {
  open: boolean;
  /** 고칠 계정입니다. null 이면 새로 만드는 창이 됩니다. */
  account: Account | null;
  onClose: () => void;
  onSubmit: (input: AdminAccountInput) => Promise<string>;
  /** 삭제를 누르면 부릅니다. 새로 만드는 중에는 버튼이 나오지 않습니다. */
  onDelete: (id: string) => Promise<string>;
};

// 채워지는 중에는 선택 항목이 비어 있을 수 있습니다.
type DraftValues = {
  loginId: string;
  name: string;
  email: string;
  phone: string;
  divisionId: BusinessDivisionId | "";
  role: AccountRole | "";
};

const EMPTY_DRAFT: DraftValues = {
  loginId: "",
  name: "",
  email: "",
  phone: "",
  divisionId: "",
  role: "viewer",
};

// 관리자가 계정을 만들거나 고치는 창입니다.
export function AccountFormModal({
  open,
  account,
  onClose,
  onSubmit,
  onDelete,
}: AccountFormModalProps) {
  const [draft, setDraft] = useState<DraftValues>(EMPTY_DRAFT);
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isEdit = account !== null;

  // 창이 열릴 때 값을 채우고, 닫히면 비웁니다.
  useEffect(() => {
    setError("");
    setConfirmingDelete(false);

    if (!open) {
      setDraft(EMPTY_DRAFT);
      return;
    }

    setDraft(
      account === null
        ? EMPTY_DRAFT
        : {
            loginId: account.loginId,
            name: account.name,
            email: account.email,
            phone: account.phone,
            divisionId: account.divisionId,
            role: account.role,
          },
    );
  }, [open, account]);

  const update = <K extends keyof DraftValues>(key: K, value: DraftValues[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = validateAdminAccount(draft);

    if (message) {
      setError(message);
      return;
    }

    // 검사를 통과했으므로 선택 항목이 비어 있지 않습니다.
    const failure = await onSubmit({
      loginId: draft.loginId.trim(),
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      divisionId: draft.divisionId as BusinessDivisionId,
      role: draft.role as AccountRole,
    });

    if (failure) {
      setError(failure);
      return;
    }

    onClose();
  };

  const handleDelete = async () => {
    if (account === null) return;

    const failure = await onDelete(account.id);

    if (failure) {
      setError(failure);
      return;
    }

    onClose();
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "계정 수정" : "계정 등록"}
      onClose={onClose}
      closeOnBackdrop={false}
    >
      <form onSubmit={handleSubmit} className="px-4 py-4">
        <div className="space-y-3">
          <FormRow required label="아이디" htmlFor="acc-login-id">
            <input
              id="acc-login-id"
              type="text"
              value={draft.loginId}
              onChange={(event) => update("loginId", event.currentTarget.value)}
              placeholder="admin.control"
              className="input w-full font-mono"
            />
          </FormRow>

          <FormRow required label="이름" htmlFor="acc-name">
            <input
              id="acc-name"
              type="text"
              value={draft.name}
              onChange={(event) => update("name", event.currentTarget.value)}
              className="input w-full"
            />
          </FormRow>

          <FormRow required label="이메일" htmlFor="acc-email">
            <input
              id="acc-email"
              type="email"
              value={draft.email}
              onChange={(event) => update("email", event.currentTarget.value)}
              placeholder="name@example.com"
              className="input w-full"
            />
          </FormRow>

          <FormRow required label="번호" htmlFor="acc-phone">
            <input
              id="acc-phone"
              type="tel"
              value={draft.phone}
              onChange={(event) => update("phone", event.currentTarget.value)}
              placeholder="010-1234-5678"
              className="input w-full"
            />
          </FormRow>

          <FormRow required label="업무파트" htmlFor="acc-division">
            <select
              id="acc-division"
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
          </FormRow>

          <FormRow required label="권한" htmlFor="acc-role">
            <select
              id="acc-role"
              value={draft.role}
              onChange={(event) =>
                update("role", event.currentTarget.value as AccountRole | "")
              }
              className="select w-full"
            >
              {ACCOUNT_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABEL[role]}
                </option>
              ))}
            </select>
          </FormRow>
        </div>

        {/* 비밀번호는 아직 저장할 곳이 없습니다. NOTES.md 4-8 참고. */}
        <p className="mt-3 rounded-[var(--radius-md)] border border-line bg-panel-2 px-3 py-2 text-bt-text-s text-muted">
          비밀번호는 아직 설정할 수 없습니다. 로그인에 비밀번호 확인이 붙은 뒤에
          추가됩니다.
        </p>

        {error ? (
          <p className="mt-3 text-bt-text-m font-medium text-down-500">{error}</p>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-4">
          {/* 삭제는 되돌릴 수 없어 한 번 더 묻습니다. */}
          <div>
            {isEdit ? (
              confirmingDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-bt-text-m text-down-500">지울까요?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn btn-primary btn-sm"
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="btn btn-ghost btn-sm"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="btn btn-ghost btn-sm"
                >
                  계정 삭제
                </button>
              )
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="btn btn-ghost btn-md">
              취소
            </button>
            <button type="submit" className="btn btn-primary btn-md">
              {isEdit ? "저장" : "등록"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// 라벨과 입력칸을 한 줄로 묶습니다. 모두 필수라 * 를 답니다.
