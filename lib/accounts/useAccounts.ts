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

  const removeAccount = useCallback(async (id: string): Promise<string> => {
    const res = await api.remove<null>(`/accounts/${id}`);

    return res.ok ? "" : res.message;
  }, []);

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

export function useMyAccount() {
  const { account, status: authStatus, refresh } = useAuth();
  const [saving, setSaving] = useState(false);

  const status: "loading" | "ready" | "error" =
    authStatus === "loading" ? "loading" : account === null ? "error" : "ready";

  const setNotifyEnabled = useCallback(
    async (next: boolean): Promise<string> => {
      if (account === null) return "계정을 찾을 수 없습니다.";

      const before = account;
      refresh({ ...before, notifyEnabled: next });

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
