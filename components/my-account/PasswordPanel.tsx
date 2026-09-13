import { useState, type FormEvent } from "react";
import { FormRow } from "@/components/ui/FormRow";
import { Panel } from "@/components/ui/Panel";
import { validatePasswordChange } from "@/lib/accounts/validation";

export function PasswordPanel() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const error = validatePasswordChange(
      currentPassword,
      newPassword,
      confirmPassword,
    );

    setMessage(
      error || "지금은 개발 단계라 실제로 바뀌지는 않습니다. (형식은 올바릅니다)",
    );

    if (!error) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const isError = message !== "" && !message.startsWith("지금은");

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
        ) : null}

        <div className="flex justify-end border-t border-line pt-4">
          <button type="submit" className="btn btn-primary btn-md">
            비밀번호 변경
          </button>
        </div>
      </form>
    </Panel>
  );
}
