import Head from "next/head";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { PasswordPanel } from "@/components/my-account/PasswordPanel";
import { SessionPanel } from "@/components/my-account/SessionPanel";
import { ReadOnlyRow } from "@/components/my-account/ReadOnlyRow";
import { SettingsPanel } from "@/components/my-account/SettingsPanel";
import { FormRow } from "@/components/ui/FormRow";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast } from "@/components/ui/Toast";
import { Panel } from "@/components/ui/Panel";
import { ROLE_LABEL } from "@/lib/accounts/types";
import { canChangeOwnDivision } from "@/lib/accounts/permissions";
import { BUSINESS_DIVISIONS } from "@/lib/businessDivisions";
import { useMyAccount } from "@/lib/accounts/useAccounts";
import { BUSINESS_DIVISION_LABEL } from "@/lib/businessDivisions";

export default function MyAccountPage() {
  const {
    account,
    status,
    saving,
    saveProfile,
    setNotifyEnabled,
    changePassword,
    setSessionTtl,
    setDivision,
  } = useMyAccount();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState(false);

  useEffect(() => {
    if (account === null) return;

    setName(account.name);
    setEmail(account.email);
    setPhone(account.phone);
  }, [account]);

  const canChangeDivision = account !== null && canChangeOwnDivision(account);

  const handleDivisionChange = async (next: string) => {
    const message = await setDivision(next);

    setProfileError(message !== "");
    setProfileMessage(message || "소속 파트를 옮겼습니다.");
  };

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
      <Toast
        message={profileMessage}
        tone={profileError ? "error" : "success"}
        onDone={() => setProfileMessage("")}
      />

      <Panel
        title="계정 정보"
        description={
          canChangeDivision
            ? "아이디·권한은 관리자에게 문의해 변경할 수 있습니다"
            : "관리자에게 문의해 변경할 수 있습니다"
        }
      >
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <ReadOnlyRow label="아이디" value={account.loginId} mono />

          {canChangeDivision ? (
            <div className="flex min-w-0 items-center gap-3">
              <label
                htmlFor="my-division"
                className="w-24 shrink-0 text-b2_body_m font-medium text-secondary"
              >
                소속 파트
              </label>
              <select
                id="my-division"
                value={account.divisionId}
                onChange={(event) => void handleDivisionChange(event.currentTarget.value)}
                className="select min-w-0 flex-1"
              >
                {BUSINESS_DIVISIONS.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <ReadOnlyRow
              label="소속 파트"
              value={BUSINESS_DIVISION_LABEL[account.divisionId]}
            />
          )}

          <ReadOnlyRow label="권한" value={ROLE_LABEL[account.role]} />
          <ReadOnlyRow
            label="사용여부"
            value={account.enabled ? "사용" : "중지"}
          />
        </dl>

        {canChangeDivision ? (
          <p className="mt-3 text-bt-text-s text-muted">
            파트를 옮기면 서버관리·계정관리·로그조회에 보이는 내용이 모두
            바뀝니다. 이전 파트의 장비와 계정은 더 이상 보이지 않습니다.
          </p>
        ) : null}
      </Panel>

      <Panel title="내 정보">
        <form onSubmit={handleProfileSubmit} className="space-y-3">
          <FormRow labelWidth="md" label="이름" htmlFor="my-name">
            <input
              id="my-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              className="input w-full"
            />
          </FormRow>

          <FormRow labelWidth="md" label="이메일" htmlFor="my-email">
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

          <FormRow labelWidth="md" label="번호" htmlFor="my-phone">
            <input
              id="my-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.currentTarget.value)}
              placeholder="010-1234-5678 또는 내선 1234"
              className="input w-full"
            />
          </FormRow>

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

      <SettingsPanel
        account={account}
        onNotifyChange={setNotifyEnabled}
        onSessionTtlChange={setSessionTtl}
      />

      <PasswordPanel onChange={changePassword} />

      <SessionPanel />
    </Shell>
  );
}

function Shell({ children }: { children?: ReactNode }) {
  return (
    <>
      <Head>
        <title>내 계정 | PingCheck</title>
      </Head>

      <div className="px-6 py-4">
        <div className="mx-auto max-w-[720px] space-y-4">
          <PageHeader breadcrumb={["내 계정"]} title="내 계정" />
          {children}
        </div>
      </div>
    </>
  );
}

