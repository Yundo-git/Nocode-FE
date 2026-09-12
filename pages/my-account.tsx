import Head from "next/head";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Toggle } from "@/components/ui/Toggle";
import { ROLE_LABEL } from "@/lib/accounts/types";
import { useMyAccount } from "@/lib/accounts/useAccounts";
import { validatePasswordChange } from "@/lib/accounts/validation";
import { BUSINESS_DIVISION_LABEL } from "@/lib/businessDivisions";
import { useTheme } from "@/lib/theme";
import type { Account } from "@/lib/accounts/types";

// 내 계정 화면입니다.
// 본인이 고칠 수 있는 것(이름·이메일·번호·비밀번호)과
// 관리자만 바꿀 수 있는 것(아이디·소속 파트·권한)을 나눠서 보여 줍니다.
export default function MyAccountPage() {
  const { account, status, saving, saveProfile, setNotifyEnabled } =
    useMyAccount();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState(false);

  // 계정을 받아오면 입력칸을 채웁니다.
  useEffect(() => {
    if (account === null) return;

    setName(account.name);
    setEmail(account.email);
    setPhone(account.phone);
  }, [account]);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = await saveProfile({ name, email, phone });

    setProfileError(message !== "");
    setProfileMessage(message === "" ? "저장했습니다." : message);
  };

  if (status === "loading") {
    return <Shell />;
  }

  if (account === null) {
    return (
      <Shell>
        <Panel title="내 계정">
          <p className="text-b2_body_r text-muted">
            로그인한 아이디와 맞는 계정을 찾지 못했습니다.
          </p>
        </Panel>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* 관리자만 바꿀 수 있는 값입니다. 보기만 합니다. */}
      <Panel title="계정 정보" description="관리자에게 문의해 변경할 수 있습니다">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <ReadOnlyRow label="아이디" value={account.loginId} mono />
          <ReadOnlyRow
            label="소속 파트"
            value={BUSINESS_DIVISION_LABEL[account.divisionId]}
          />
          <ReadOnlyRow label="권한" value={ROLE_LABEL[account.role]} />
          <ReadOnlyRow
            label="사용여부"
            value={account.enabled ? "사용" : "중지"}
          />
        </dl>
      </Panel>

      {/* 본인이 고칠 수 있는 값입니다. */}
      <Panel title="내 정보">
        <form onSubmit={handleProfileSubmit} className="space-y-3">
          <FormRow label="이름" htmlFor="my-name">
            <input
              id="my-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              className="input w-full"
            />
          </FormRow>

          <FormRow label="이메일" htmlFor="my-email">
            <input
              id="my-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              placeholder="name@example.com"
              className="input w-full"
            />
          </FormRow>

          <FormRow label="번호" htmlFor="my-phone">
            <input
              id="my-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.currentTarget.value)}
              placeholder="010-1234-5678"
              className="input w-full"
            />
          </FormRow>

          {profileMessage ? (
            <p
              className={`text-bt-text-m font-medium ${
                profileError ? "text-down-500" : "text-up-500"
              }`}
            >
              {profileMessage}
            </p>
          ) : null}

          <div className="flex justify-end border-t border-line pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-md"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </Panel>

      <SettingsPanel account={account} onNotifyChange={setNotifyEnabled} />

      <PasswordPanel />
    </Shell>
  );
}

// 화면 껍데기입니다. 불러오는 중에도 제목은 그대로 보이게 합니다.
function Shell({ children }: { children?: ReactNode }) {
  return (
    <>
      <Head>
        <title>내 계정 | PingCheck</title>
      </Head>

      {/* 설정 화면이라 본문을 넓게 쓸 일이 없습니다.
          제목까지 한 덩어리로 묶어 가운데에 둡니다.
          (제목만 왼쪽 끝에 있으면 아래 상자들과 어긋나 보입니다) */}
      <div className="px-6 py-4">
        <div className="mx-auto max-w-[720px] space-y-4">
          <PageHeader breadcrumb={["내 계정"]} title="내 계정" />
          {children}
        </div>
      </div>
    </>
  );
}

// 화면 모드와 알림 설정입니다.
//
// 두 값의 저장 위치가 다릅니다.
// - 화면 모드: 브라우저(localStorage). 기기마다 다를 수 있는 값이고,
//              화면이 그려지기 전에 적용돼야 해서 서버에 둘 수 없습니다.
// - 알림     : 계정(서버). 사람 단위 설정이라 다른 PC 로 로그인해도 따라옵니다.
function SettingsPanel({
  account,
  onNotifyChange,
}: {
  account: Account;
  onNotifyChange: (next: boolean) => Promise<string>;
}) {
  const { theme, setTheme } = useTheme();
  const [error, setError] = useState("");

  const handleNotifyChange = async (next: boolean) => {
    const message = await onNotifyChange(next);
    setError(message);
  };

  return (
    <Panel title="설정">
      <div className="space-y-3">
        <SettingRow
          label="블랙 모드"
          description="이 브라우저에만 적용됩니다"
          checked={theme === "dark"}
          onChange={(next) => setTheme(next ? "dark" : "light")}
          toggleLabel="블랙 모드"
        />

        <SettingRow
          label="알림 받기"
          description="감시 중인 서버의 핑이 끊기면 알려 줍니다"
          checked={account.notifyEnabled}
          onChange={handleNotifyChange}
          toggleLabel="알림 받기"
        />
      </div>

      {error ? (
        <p className="mt-3 text-bt-text-m font-medium text-down-500">{error}</p>
      ) : null}
    </Panel>
  );
}

// 설명과 토글이 있는 한 줄입니다.
function SettingRow({
  label,
  description,
  checked,
  onChange,
  toggleLabel,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  toggleLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-b2_body_m font-medium text-body">{label}</p>
        <p className="mt-0.5 text-bt-text-s text-muted">{description}</p>
      </div>

      <Toggle checked={checked} onChange={onChange} label={toggleLabel} />
    </div>
  );
}

// 비밀번호 변경입니다.
//
// 지금은 로그인 자체가 흉내이므로 실제로 바뀌지 않습니다.
// 백엔드가 붙으면 이 안에서 PATCH /api/accounts/me/password 를 부르면 됩니다.
function PasswordPanel() {
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
        <FormRow label="현재 비밀번호" htmlFor="pw-current">
          <input
            id="pw-current"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.currentTarget.value)}
            className="input w-full"
          />
        </FormRow>

        <FormRow label="새 비밀번호" htmlFor="pw-new">
          <input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.currentTarget.value)}
            className="input w-full"
          />
        </FormRow>

        <FormRow label="새 비밀번호 확인" htmlFor="pw-confirm">
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

// 보기 전용 줄입니다.
function ReadOnlyRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <dt className="w-24 shrink-0 text-b2_body_m font-medium text-secondary">
        {label}
      </dt>
      <dd className={`min-w-0 truncate text-b2_body_r text-body ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

// 입력 줄입니다.
function FormRow({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <label
        htmlFor={htmlFor}
        className="w-32 shrink-0 text-b2_body_m font-medium text-secondary"
      >
        {label}
      </label>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
