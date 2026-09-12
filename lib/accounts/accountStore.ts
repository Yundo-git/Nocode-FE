import { createJsonStore, patchById } from "@/lib/storage/jsonStore";
import { SEED_ACCOUNTS } from "@/lib/accounts/seedAccounts";
import type { Account, MyProfileInput } from "@/lib/accounts/types";

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
