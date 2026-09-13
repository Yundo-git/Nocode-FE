import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type {
  Account,
  AccountWriteResult,
  AdminAccountInput,
  MyProfileInput,
} from "@/lib/accounts/types";
import { useAuth } from "@/lib/auth";

export type LoadStatus = "loading" | "ready" | "error";

export async function fetchAccounts(): Promise<readonly Account[]> {
  const res = await api.get<Account[]>("/accounts");

  if (!res.ok) {
    throw new Error(res.message);
  }

  return res.data;
}

// 계정 목록 상태입니다. 구조는 useServers 와 같습니다.
export function useAccounts() {
  const [accounts, setAccounts] = useState<readonly Account[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    let alive = true;

    fetchAccounts()
      .then((next) => {
        if (!alive) return;
        setAccounts(next);
        setStatus("ready");
      })
      .catch(() => {
        if (!alive) return;
        setStatus("error");
      });

    return () => {
      alive = false;
    };
  }, []);

  // 누른 즉시 화면을 바꾸고, 저장이 실패하면 되돌립니다.
  const toggleEnabled = useCallback(
    async (id: string) => {
      const target = accounts.find((account) => account.id === id);

      if (target === undefined) return;

      const next = !target.enabled;

      setAccounts((prev) =>
        prev.map((account) =>
          account.id === id ? { ...account, enabled: next } : account,
        ),
      );

      const res = await api.patch<Account>(`/accounts/${id}`, { enabled: next });

      if (res.ok) {
        setAccounts((prev) =>
          prev.map((account) => (account.id === id ? res.data : account)),
        );
        return;
      }

      // 저장에 실패했으니 눌렀던 것을 되돌립니다.
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === id ? { ...account, enabled: !next } : account,
        ),
      );
    },
    [accounts],
  );

  // 관리자가 계정을 새로 만듭니다.
  const createAccount = useCallback(
    async (input: AdminAccountInput): Promise<AccountWriteResult> => {
      const res = await api.post<Account>("/accounts", input);

      if (!res.ok) {
        // 409 는 "이미 쓰는 아이디" 라는 뜻입니다.
        return {
          ok: false,
          reason: res.status === 409 ? "duplicate-login-id" : "not-found",
        };
      }

      setAccounts((prev) => [res.data, ...prev]);
      return { ok: true, account: res.data };
    },
    [],
  );

  // 관리자가 계정을 고칩니다.
  const updateAccount = useCallback(
    async (id: string, input: AdminAccountInput): Promise<AccountWriteResult> => {
      const res = await api.put<Account>(`/accounts/${id}`, input);

      if (!res.ok) {
        return {
          ok: false,
          reason: res.status === 409 ? "duplicate-login-id" : "not-found",
        };
      }

      setAccounts((prev) =>
        prev.map((account) => (account.id === id ? res.data : account)),
      );
      return { ok: true, account: res.data };
    },
    [],
  );

  // 계정을 지웁니다. 성공하면 빈 문자열, 실패하면 이유를 돌려줍니다.
  const removeAccount = useCallback(async (id: string): Promise<string> => {
    const res = await api.remove<null>(`/accounts/${id}`);

    if (!res.ok) {
      return res.message;
    }

    setAccounts((prev) => prev.filter((account) => account.id !== id));
    return "";
  }, []);

  return {
    accounts,
    status,
    toggleEnabled,
    createAccount,
    updateAccount,
    removeAccount,
  };
}

// 로그인한 본인의 계정입니다.
//
// ★ 예전에는 계정 목록을 통째로 받아 loginId 가 같은 줄을 찾아 썼습니다.
//   아이디만 알면 남의 정보를 볼 수 있는 방식이었습니다. (NOTES.md 4-6)
//
//   지금은 백엔드가 세션을 보고 "지금 누구인지" 를 알려 줍니다.
//   목록을 받을 필요도 없고, 남의 줄을 집어 올 수도 없습니다.
export function useMyAccount() {
  const { account, status: authStatus, refresh } = useAuth();
  const [saving, setSaving] = useState(false);

  const status: LoadStatus =
    authStatus === "loading" ? "loading" : account === null ? "error" : "ready";

  // 알림 받기를 켜고 끕니다.
  // 누른 즉시 화면을 바꾸고, 저장이 실패하면 되돌립니다.
  const setNotifyEnabled = useCallback(
    async (next: boolean): Promise<string> => {
      if (account === null) return "계정을 찾을 수 없습니다.";

      const before = account;
      refresh({ ...before, notifyEnabled: next });

      // ★ 주소에 id 를 넣지 않습니다. 본인 것만 바꿀 수 있는 주소입니다.
      const res = await api.patch<Account>("/accounts/me/notify", {
        notifyEnabled: next,
      });

      if (!res.ok) {
        refresh(before);
        return res.message;
      }

      refresh(res.data);
      return "";
    },
    [account, refresh],
  );

  const saveProfile = useCallback(
    async (input: MyProfileInput): Promise<string> => {
      if (account === null) return "계정을 찾을 수 없습니다.";

      setSaving(true);

      try {
        const res = await api.patch<Account>("/accounts/me", input);

        if (!res.ok) return res.message;

        refresh(res.data);
        return "";
      } finally {
        setSaving(false);
      }
    },
    [account, refresh],
  );

  /**
   * 비밀번호를 바꿉니다.
   *
   * ★ 성공하면 **모든 세션이 끊깁니다.** 다시 로그인해야 합니다.
   *   비밀번호가 샜을까 봐 바꾸는 것인데, 훔쳐 간 사람의 창이 살아 있으면
   *   바꾼 의미가 없기 때문입니다.
   */
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<string> => {
      const res = await api.put<null>("/accounts/me/password", {
        currentPassword,
        newPassword,
      });

      return res.ok ? "" : res.message;
    },
    [],
  );

  return { account, status, saving, saveProfile, setNotifyEnabled, changePassword };
}
