import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormRow } from "@/components/ui/FormRow";
import { validateNewPassword } from "@/lib/accounts/validation";

type PasswordSetupModalProps = {
  open: boolean;
  loginId: string;
  onSubmit: (newPassword: string) => Promise<string>;
  onClose: () => void;
};

export function PasswordSetupModal({
  open,
  loginId,
  onSubmit,
  onClose,
}: PasswordSetupModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = validateNewPassword(password);

    if (message) {
      setError(message);
      return;
    }

    if (password !== confirm) {
      setError("비밀번호가 서로 다릅니다.");
      return;
    }

    setSaving(true);

    try {
      const failure = await onSubmit(password);

      if (failure) {
        setError(failure);
        return;
      }

      setPassword("");
      setConfirm("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="비밀번호 설정"
      onClose={onClose}
      closeOnBackdrop={false}
    >
      <form onSubmit={handleSubmit} className="px-4 py-4">
        <p className="text-b2_body_r text-secondary">
          <span className="font-mono font-semibold text-body">{loginId}</span>
          {" 계정의 비밀번호를 정해 주세요."}
        </p>
        <p className="mt-1 text-bt-text-s text-muted">
          처음 로그인하는 계정입니다. 이 비밀번호는 본인만 알 수 있습니다.
        </p>

        <div className="mt-4 space-y-3">
          <FormRow required labelWidth="md" label="새 비밀번호" htmlFor="setup-pw">
            <input
              id="setup-pw"
              type="password"
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              className="input w-full"
            />
          </FormRow>

          <FormRow required labelWidth="md" label="한 번 더" htmlFor="setup-pw-confirm">
            <input
              id="setup-pw-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.currentTarget.value)}
              className="input w-full"
            />
          </FormRow>
        </div>

        <ul className="mt-3 space-y-0.5 rounded-[var(--radius-md)] border border-line bg-panel-2 px-3 py-2 text-bt-text-s text-muted">
          <li>· 6자 이상</li>
          <li>· 숫자 1자 이상 (0~9)</li>
          <li>· 특수문자 1자 이상 (! @ # $ 등)</li>
        </ul>

        {error ? (
          <p className="mt-3 text-bt-text-m font-medium text-down-500">{error}</p>
        ) : null}

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-4">
          <button type="button" onClick={onClose} className="btn btn-ghost btn-md">
            취소
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary btn-md">
            {saving ? "설정 중…" : "설정하고 로그인"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
