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

// 내 계정 화면입니다.
// 본인이 고칠 수 있는 것(이름·이메일·번호·비밀번호)과
// 관리자만 바꿀 수 있는 것(아이디·소속 파트·권한)을 나눠서 보여 줍니다.
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

  // 계정을 받아오면 입력칸을 채웁니다.
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
      {/* 저장 결과는 오른쪽 위 쪽지로 알립니다.
          본문 안에서 글자만 바뀌면 눈치채지 못하고 지나갑니다. */}
      <Toast
        message={profileMessage}
        tone={profileError ? "error" : "success"}
        onDone={() => setProfileMessage("")}
      />

      {/* 아이디·권한·사용여부는 관리자만 바꿀 수 있습니다.
          소속 파트는 관리자 본인이 직접 옮길 수 있습니다. (아래) */}
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

          {/* ★ 관리자는 자기 파트를 옮길 수 있습니다.
              옮기는 순간 보이는 서버와 계정이 통째로 바뀝니다.
              막는 벽이 아니라 "지금 보고 있는 창" 에 가깝습니다. */}
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

      {/* 본인이 고칠 수 있는 값입니다. */}
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

// 설명과 토글이 있는 한 줄입니다.

// 비밀번호 변경입니다.
//
// 지금은 로그인 자체가 흉내이므로 실제로 바뀌지 않습니다.
// 백엔드가 붙으면 이 안에서 PATCH /api/accounts/me/password 를 부르면 됩니다.

// 보기 전용 줄입니다.

// 입력 줄입니다.
