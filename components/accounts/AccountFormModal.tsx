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
import { validateAdminAccount, validateNewPassword } from "@/lib/accounts/validation";
import {
  BUSINESS_DIVISIONS,
  type BusinessDivisionId,
} from "@/lib/businessDivisions";

type AccountFormModalProps = {
  open: boolean;
  /** 고칠 계정입니다. null 이면 새로 만드는 창이 됩니다. */
  account: Account | null;
  onClose: () => void;
  onSubmit: (input: AdminAccountInput, password: string) => Promise<string>;
  /**
   * 이미 있는 계정의 비밀번호를 다시 정해 줍니다. (초기화)
   *
   * ★ 지금 비밀번호를 묻지 않습니다. 관리자는 그것을 모르기 때문입니다.
   *   비밀번호를 잊은 사람에게 새로 발급해 주는 길입니다.
   */
  onResetPassword: (id: string, password: string) => Promise<string>;
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
  /** 새로 만들 때의 비밀번호입니다. 비워 두면 "아직 정하지 않음" 이 됩니다. */
  password: string;
};

const EMPTY_DRAFT: DraftValues = {
  loginId: "",
  name: "",
  email: "",
  phone: "",
  divisionId: "",
  role: "viewer",
  password: "",
};

// 관리자가 계정을 만들거나 고치는 창입니다.
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
            password: "",
          },
    );
    setResetPassword("");
    setResetMessage("");
  }, [open, account]);

  // 비밀번호 초기화 칸의 값입니다. 수정 창에서만 씁니다.
  const [resetPassword, setResetPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");

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

    // 새로 만들 때만 비밀번호를 받습니다.
    // 비워 두면 "아직 정하지 않음" 이고, 그 계정은 로그인할 수 없습니다.
    if (!isEdit && draft.password !== "") {
      const passwordMessage = validateNewPassword(draft.password);

      if (passwordMessage) {
        setError(passwordMessage);
        return;
      }
    }

    // 검사를 통과했으므로 선택 항목이 비어 있지 않습니다.
    const failure = await onSubmit({
      loginId: draft.loginId.trim(),
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      divisionId: draft.divisionId as BusinessDivisionId,
      role: draft.role as AccountRole,
    }, isEdit ? "" : draft.password);

    if (failure) {
      setError(failure);
      return;
    }

    onClose();
  };

  const handleResetPassword = async () => {
    if (account === null) return;

    const message = validateNewPassword(resetPassword);

    if (message) {
      setResetMessage(message);
      return;
    }

    const failure = await onResetPassword(account.id, resetPassword);

    setResetPassword("");
    setResetMessage(
      failure ||
        "새 비밀번호를 저장했습니다. 이 계정의 기존 로그인은 모두 끊겼습니다.",
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

        {/* ── 비밀번호 ────────────────────────────────────────────────
            만들 때: 처음 비밀번호를 정합니다. 비워 두면 "아직 정하지 않음" 입니다.
            고칠 때: 관리자가 다시 정해 줍니다. (지금 비밀번호는 묻지 않습니다) */}
        {isEdit ? (
          <div className="mt-4 border-t border-line pt-4">
            <FormRow labelWidth="md" label="비밀번호 재발급" htmlFor="acc-reset-pw">
              <div className="flex items-center gap-2">
                <input
                  id="acc-reset-pw"
                  type="text"
                  autoComplete="off"
                  value={resetPassword}
                  onChange={(event) => setResetPassword(event.currentTarget.value)}
                  placeholder="8자 이상"
                  className="input w-full"
                />
                <button
                  type="button"
                  onClick={() => void handleResetPassword()}
                  disabled={resetPassword === ""}
                  className="btn btn-ghost btn-md shrink-0"
                >
                  재발급
                </button>
              </div>
            </FormRow>

            {/* ★ 가리지 않고 그대로 보여 줍니다.
                관리자가 본인에게 불러 줘야 하는 값이라, 점으로 가리면
                잘못 불러 주고도 모릅니다. 대신 저장해 두지 않습니다. */}
            {resetMessage ? (
              <p className="mt-2 text-bt-text-m text-muted">{resetMessage}</p>
            ) : (
              <p className="mt-2 text-bt-text-s text-muted">
                재발급하면 이 계정의 기존 로그인이 모두 끊깁니다.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4 border-t border-line pt-4">
            <FormRow labelWidth="md" label="비밀번호" htmlFor="acc-password">
              <input
                id="acc-password"
                type="text"
                autoComplete="off"
                value={draft.password}
                onChange={(event) => update("password", event.currentTarget.value)}
                placeholder="8자 이상 (비워 두면 나중에 발급)"
                className="input w-full"
              />
            </FormRow>
            <p className="mt-2 text-bt-text-s text-muted">
              비워 두면 이 계정은 로그인할 수 없습니다. 나중에 수정 창에서
              발급해 주세요.
            </p>
          </div>
        )}

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
