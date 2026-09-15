import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormRow } from "@/components/ui/FormRow";
import { DivisionField } from "@/components/ui/DivisionField";
import {
  ACCOUNT_ROLES,
  ROLE_LABEL,
  type Account,
  type AccountRole,
  type AdminAccountInput,
} from "@/lib/accounts/types";
import { validateAdminAccount } from "@/lib/accounts/validation";
import { type BusinessDivisionId } from "@/lib/businessDivisions";
import { useAuth } from "@/lib/auth";

type AccountFormModalProps = {
  open: boolean;
  account: Account | null;
  onClose: () => void;
  onSubmit: (input: AdminAccountInput) => Promise<string>;
  onResetPassword: (id: string) => Promise<string>;
  onDelete: (id: string) => Promise<string>;
};

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

export function AccountFormModal({
  open,
  account,
  onClose,
  onSubmit,
  onDelete,
  onResetPassword,
}: AccountFormModalProps) {
  const [draft, setDraft] = useState<DraftValues>(EMPTY_DRAFT);
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const isEdit = account !== null;

  const { account: me } = useAuth();
  const myDivision = me !== null && me.role !== "superadmin" ? me.divisionId : undefined;

  useEffect(() => {
    setError("");
    setConfirmingDelete(false);

    if (!open) {
      setDraft(EMPTY_DRAFT);
      return;
    }

    setDraft(
      account === null
        ? { ...EMPTY_DRAFT, divisionId: myDivision ?? "" }
        : {
            loginId: account.loginId,
            name: account.name,
            email: account.email,
            phone: account.phone,
            divisionId: account.divisionId,
            role: account.role,
          },
    );
    setResetMessage("");
  }, [open, account, myDivision]);

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

  const handleResetPassword = async () => {
    if (account === null) return;

    const failure = await onResetPassword(account.id);

    setResetMessage(
      failure ||
        "초기화했습니다. 이 계정의 로그인이 모두 끊겼고, 다음 로그인 때 본인이 새로 정합니다.",
    );
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
              placeholder="010-1234-5678 또는 내선 1234"
              className="input w-full"
            />
          </FormRow>

          <DivisionField
            label="업무파트"
            id="acc-division"
            value={draft.divisionId}
            onChange={(next) => update("divisionId", next)}
          />

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

        {isEdit ? (
          <div className="mt-4 border-t border-line pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-b2_body_m font-medium text-body">비밀번호</p>
                <p className="mt-0.5 text-bt-text-s text-muted">
                  {resetMessage ||
                    "잊어버렸다면 초기화하세요. 본인이 다시 정하게 됩니다."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleResetPassword()}
                className="btn btn-ghost btn-md shrink-0"
              >
                비밀번호 초기화
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-[var(--radius-md)] border border-line bg-panel-2 px-3 py-2 text-bt-text-s text-muted">
            비밀번호는 본인이 첫 로그인 때 직접 정합니다. 계정을 만든 뒤
            아이디를 알려 주세요.
          </p>
        )}

        {error ? (
          <p className="mt-3 text-bt-text-m font-medium text-down-500">{error}</p>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-4">
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

