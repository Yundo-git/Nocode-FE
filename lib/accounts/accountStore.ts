import { createJsonStore, patchById } from "@/lib/storage/jsonStore";
import { SEED_ACCOUNTS } from "@/lib/accounts/seedAccounts";
import type {
  Account,
  AccountWriteResult,
  AdminAccountInput,
  MyProfileInput,
} from "@/lib/accounts/types";

// 이 파일은 API 라우트에서만 불러옵니다.
// 파일을 읽고 쓰는 공통 부분은 lib/storage/jsonStore.ts 에 있습니다.
const store = createJsonStore<Account>("accounts.json", SEED_ACCOUNTS);

export function listAccounts(): Promise<Account[]> {
  return store.read();
}

export function setAccountEnabled(
  id: string,
  enabled: boolean,
): Promise<Account | null> {
  return store.update((accounts) => patchById(accounts, id, { enabled }));
}

export function setAccountNotify(
  id: string,
  notifyEnabled: boolean,
): Promise<Account | null> {
  return store.update((accounts) => patchById(accounts, id, { notifyEnabled }));
}

// 본인 정보 수정입니다.
// 아이디 / 소속 파트 / 권한은 일부러 받지 않습니다. 본인이 바꾸면 안 되는 값입니다.
export function updateProfile(
  id: string,
  input: MyProfileInput,
): Promise<Account | null> {
  return store.update((accounts) =>
    patchById(accounts, id, {
      name: input.name,
      email: input.email,
      phone: input.phone,
    }),
  );
}

// 관리자가 계정을 새로 만듭니다.
// 로그인 아이디는 겹치면 안 됩니다. 브라우저에서만 막으면
// 두 사람이 동시에 같은 아이디를 넣을 때 통과합니다.
export function createAccount(
  input: AdminAccountInput,
): Promise<AccountWriteResult> {
  return store.update<AccountWriteResult>((accounts) => {
    if (accounts.some((account) => account.loginId === input.loginId)) {
      return { result: { ok: false, reason: "duplicate-login-id" } };
    }

    const created: Account = {
      id: `acc-${Date.now().toString(36)}`,
      ...input,
      enabled: true,
      notifyEnabled: true,
      createdAt: new Date().toISOString(),
    };

    return { next: [created, ...accounts], result: { ok: true, account: created } };
  });
}

// 관리자가 계정을 고칩니다. 아이디·소속 파트·권한까지 바꿀 수 있습니다.
export function updateAccountByAdmin(
  id: string,
  input: AdminAccountInput,
): Promise<AccountWriteResult> {
  return store.update<AccountWriteResult>((accounts) => {
    const index = accounts.findIndex((account) => account.id === id);

    if (index === -1) {
      return { result: { ok: false, reason: "not-found" } };
    }

    // 자기 자신은 빼고 같은 아이디가 있는지 봅니다.
    const taken = accounts.some(
      (account) => account.id !== id && account.loginId === input.loginId,
    );

    if (taken) {
      return { result: { ok: false, reason: "duplicate-login-id" } };
    }

    const updated: Account = { ...accounts[index]!, ...input };
    const next = [...accounts];
    next[index] = updated;

    return { next, result: { ok: true, account: updated } };
  });
}

// 계정을 지웁니다. 지운 경우에만 true 입니다.
export function deleteAccount(id: string): Promise<boolean> {
  return store.update<boolean>((accounts) => {
    const next = accounts.filter((account) => account.id !== id);

    if (next.length === accounts.length) {
      return { result: false };
    }

    return { next, result: true };
  });
}
