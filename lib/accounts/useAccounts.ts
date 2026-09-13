import { useCallback, useState } from "react";
import { api } from "@/lib/api/client";
import type { PageResult } from "@/lib/useTableState";
import type {
  Account,
  AccountFilterValues,
  AccountWriteResult,
  AdminAccountInput,
  MyProfileInput,
} from "@/lib/accounts/types";
import { useAuth } from "@/lib/auth";

/** 검색 조건과 쪽 번호를 주소 문자열로 만듭니다. */
function toQuery(
  filters: AccountFilterValues,
  page: number,
  pageSize: number,
): string {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (filters.keyword.trim()) params.set("keyword", filters.keyword.trim());
  if (filters.divisionId) params.set("divisionId", filters.divisionId);
  if (filters.role) params.set("role", filters.role);
  if (filters.enabled) params.set("enabled", filters.enabled);

  return params.toString();
}

/**
 * 한 쪽을 받아 옵니다. useTableState 에 넘깁니다.
 *
 * ★ 거르기·쪽 나누기를 서버가 합니다. 전체를 받지 않습니다.
 */
export async function fetchAccountPage(
  filters: AccountFilterValues,
  page: number,
  pageSize: number,
): Promise<PageResult<Account>> {
  const res = await api.get<PageResult<Account>>(
    `/accounts?${toQuery(filters, page, pageSize)}`,
  );

  if (!res.ok) throw new Error(res.message);

  return res.data;
}

/**
 * 계정을 만들고 고치고 지웁니다.
 *
 * 목록 상태는 useTableState 가 들고 있으므로 여기서는 요청만 보냅니다.
 * 끝나면 부르는 쪽이 reload() 로 지금 쪽을 다시 받습니다.
 */
export function useAccountActions() {
  const setEnabled = useCallback(
    async (id: string, next: boolean): Promise<string> => {
      const res = await api.patch<Account>(`/accounts/${id}`, { enabled: next });

      return res.ok ? "" : res.message;
    },
    [],
  );

  const createAccount = useCallback(
    async (input: AdminAccountInput): Promise<AccountWriteResult> => {
      // 비밀번호는 보내지 않습니다. 본인이 첫 로그인 때 정합니다.
      const res = await api.post<Account>("/accounts", input);

      if (!res.ok) {
        return {
          ok: false,
          reason: res.status === 409 ? "duplicate-login-id" : "not-found",
        };
      }

      return { ok: true, account: res.data };
    },
    [],
  );

  const updateAccount = useCallback(
    async (id: string, input: AdminAccountInput): Promise<AccountWriteResult> => {
      const res = await api.put<Account>(`/accounts/${id}`, input);

      if (!res.ok) {
        return {
          ok: false,
          reason: res.status === 409 ? "duplicate-login-id" : "not-found",
        };
      }

      return { ok: true, account: res.data };
    },
    [],
  );

  /** 지웁니다. 성공하면 빈 문자열, 실패하면 이유를 돌려줍니다. */
  const removeAccount = useCallback(async (id: string): Promise<string> => {
    const res = await api.remove<null>(`/accounts/${id}`);

    return res.ok ? "" : res.message;
  }, []);

  /**
   * 비밀번호를 초기화합니다. (새로 정해 주는 것이 아니라 지웁니다)
   *
   * 그 사람이 다음 로그인 때 직접 정합니다.
   * 기존 로그인은 백엔드가 모두 끊습니다.
   */
  const resetPassword = useCallback(async (id: string): Promise<string> => {
    const res = await api.remove<null>(`/accounts/${id}/password`);

    return res.ok ? "" : res.message;
  }, []);

  return {
    setEnabled,
    createAccount,
    updateAccount,
    removeAccount,
    resetPassword,
  };
}

// 로그인한 본인의 계정입니다.
//
// ★ 예전에는 계정 목록을 통째로 받아 loginId 가 같은 줄을 찾아 썼습니다.
//   아이디만 알면 남의 정보를 볼 수 있는 방식이었습니다.
//
//   지금은 백엔드가 세션을 보고 "지금 누구인지" 를 알려 줍니다.
//   목록을 받을 필요도 없고, 남의 줄을 집어 올 수도 없습니다.
export function useMyAccount() {
  const { account, status: authStatus, refresh } = useAuth();
  const [saving, setSaving] = useState(false);

  const status: "loading" | "ready" | "error" =
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

  /**
   * 소속 파트를 바꿉니다. 관리자만 할 수 있습니다.
   *
   * 바꾸는 즉시 보이는 범위가 달라지므로, 목록을 들고 있는 화면은
   * 다시 받아 와야 합니다. (여기서는 로그인 계정만 갱신합니다)
   */
  const setDivision = useCallback(
    async (next: string): Promise<string> => {
      if (account === null) return "계정을 찾을 수 없습니다.";

      const res = await api.patch<Account>("/accounts/me/division", {
        divisionId: next,
      });

      if (!res.ok) return res.message;

      refresh(res.data);
      return "";
    },
    [account, refresh],
  );

  /**
   * 로그인 유지 시간을 바꿉니다. null 이면 영구입니다.
   *
   * 바꾸는 즉시 지금 세션에도 적용됩니다. (백엔드가 기한을 다시 계산합니다)
   */
  const setSessionTtl = useCallback(
    async (next: number | null): Promise<string> => {
      if (account === null) return "계정을 찾을 수 없습니다.";

      const before = account;
      refresh({ ...before, sessionTtlMinutes: next });

      const res = await api.patch<Account>("/accounts/me/session-ttl", {
        sessionTtlMinutes: next,
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

  return {
    account,
    status,
    saving,
    saveProfile,
    setNotifyEnabled,
    changePassword,
    setSessionTtl,
    setDivision,
  };
}
