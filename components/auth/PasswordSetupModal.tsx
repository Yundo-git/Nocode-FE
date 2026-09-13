import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormRow } from "@/components/ui/FormRow";
import { validateNewPassword } from "@/lib/accounts/validation";

type PasswordSetupModalProps = {
  open: boolean;
  /** 비밀번호를 정할 계정의 아이디입니다. 확인용으로 보여 줍니다. */
  loginId: string;
  /** 성공하면 빈 문자열, 실패하면 이유를 돌려줍니다. */
  onSubmit: (newPassword: string) => Promise<string>;
  onClose: () => void;
};

// 첫 로그인에서 비밀번호를 정하는 창입니다.
//
// ★ 계정을 만들 때는 비밀번호를 넣지 않습니다.
//   관리자가 정해서 알려 주면 관리자가 남의 비밀번호를 알게 되고,
//   전달하는 동안(메신저·쪽지·구두) 새어 나갑니다.
//   본인만 아는 값이 되도록 여기서 직접 정하게 합니다.
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

    // 화면에서 먼저 거릅니다. 백엔드도 같은 규칙으로 다시 봅니다.
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

      // 성공하면 바로 로그인됩니다. 창은 부르는 쪽이 닫습니다.
      setPassword("");
      setConfirm("");
    } finally {
      setSaving(false);
    }
  };

  return (
    // closeOnBackdrop={false}: 실수로 닫히면 처음부터 다시 해야 합니다.
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

        {/* 규칙을 미리 보여 줍니다.
            틀린 뒤에 알려 주면 몇 번이고 다시 치게 됩니다. */}
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
