import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api/client";
import type { Account, MyProfileInput } from "@/lib/accounts/types";
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

  return { accounts, status, toggleEnabled };
}

// 로그인한 본인의 계정입니다.
//
// 지금은 로그인에 세션이 없어서, 목록에서 아이디가 같은 줄을 찾아 씁니다.
// 백엔드가 붙으면 GET /api/accounts/me 로 바꿔야 합니다.
// (지금 방식은 아이디만 알면 남의 정보도 볼 수 있습니다)
export function useMyAccount() {
  const { user } = useAuth();
  const { accounts, status } = useAccounts();

  const found = useMemo(() => {
    if (user === null) return null;
    return accounts.find((item) => item.loginId === user.username) ?? null;
  }, [accounts, user]);

  const [saving, setSaving] = useState(false);

  // 화면에 보이는 계정을 바로 바꿔 두기 위한 덮어쓰기 값입니다.
  // (useAccounts 의 목록은 이 훅에서 다시 불러오지 않습니다)
  const [override, setOverride] = useState<Account | null>(null);

  // 저장 결과가 있으면 그것을, 없으면 목록에서 찾은 값을 씁니다.
  const current = override ?? found;

  // 알림 받기를 켜고 끕니다.
  // 누른 즉시 화면을 바꾸고, 저장이 실패하면 되돌립니다.
  const setNotifyEnabled = useCallback(
    async (next: boolean): Promise<string> => {
      if (current === null) return "계정을 찾을 수 없습니다.";

      const before = current;
      setOverride({ ...before, notifyEnabled: next });

      const res = await api.patch<Account>(`/accounts/${before.id}`, {
        notifyEnabled: next,
      });

      if (!res.ok) {
        setOverride(before);
        return res.message;
      }

      setOverride(res.data);
      return "";
    },
    [current],
  );

  const saveProfile = useCallback(
    async (input: MyProfileInput): Promise<string> => {
      if (current === null) return "계정을 찾을 수 없습니다.";

      setSaving(true);

      try {
        const res = await api.patch<Account>(`/accounts/${current.id}`, input);

        if (!res.ok) {
          return res.message;
        }

        setOverride(res.data);
        return "";
      } finally {
        setSaving(false);
      }
    },
    [current],
  );

  return { account: current, status, saving, saveProfile, setNotifyEnabled };
}
