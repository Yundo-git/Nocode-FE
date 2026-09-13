import { useState, type FormEvent } from "react";
import { FormRow } from "@/components/ui/FormRow";
import { Panel } from "@/components/ui/Panel";
import { validatePasswordChange } from "@/lib/accounts/validation";

type PasswordPanelProps = {
  /** 성공하면 빈 문자열, 실패하면 이유를 돌려줍니다. */
  onChange: (currentPassword: string, newPassword: string) => Promise<string>;
};

// 본인 비밀번호를 바꿉니다.
//
// ★ 성공하면 **모든 기기에서 로그아웃됩니다.** 지금 이 창까지 포함해서요.
//   비밀번호가 샜을까 봐 바꾸는 것인데, 훔쳐 간 사람의 창이 그대로 살아 있으면
//   바꾼 의미가 없기 때문입니다.
//   그래서 미리 알려 주고, 끝난 뒤에도 다시 알려 줍니다.
export function PasswordPanel({ onChange }: PasswordPanelProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 화면에서 먼저 거릅니다. 백엔드도 같은 규칙으로 다시 봅니다.
    const invalid = validatePasswordChange(
      currentPassword,
      newPassword,
      confirmPassword,
    );

    if (invalid) {
      setIsError(true);
      setMessage(invalid);
      return;
    }

    setSaving(true);

    try {
      const failure = await onChange(currentPassword, newPassword);

      setIsError(failure !== "");
      setMessage(
        failure ||
          "비밀번호를 바꿨습니다. 모든 기기에서 로그아웃되니 다시 로그인해 주세요.",
      );

      if (failure === "") {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel title="비밀번호 변경" description="8자 이상">
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormRow labelWidth="md" label="현재 비밀번호" htmlFor="pw-current">
          <input
            id="pw-current"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.currentTarget.value)}
            className="input w-full"
          />
        </FormRow>

        <FormRow labelWidth="md" label="새 비밀번호" htmlFor="pw-new">
          <input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.currentTarget.value)}
            className="input w-full"
          />
        </FormRow>

        <FormRow labelWidth="md" label="새 비밀번호 확인" htmlFor="pw-confirm">
          <input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.currentTarget.value)}
            className="input w-full"
          />
        </FormRow>

        {message ? (
          <p
            className={`text-bt-text-m font-medium ${
              isError ? "text-down-500" : "text-muted"
            }`}
          >
            {message}
          </p>
        ) : (
          <p className="text-bt-text-s text-muted">
            바꾸면 이 창을 포함한 모든 기기에서 로그아웃됩니다.
          </p>
        )}

        <div className="flex justify-end border-t border-line pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-md"
          >
            {saving ? "바꾸는 중…" : "비밀번호 변경"}
          </button>
        </div>
      </form>
    </Panel>
  );
}
