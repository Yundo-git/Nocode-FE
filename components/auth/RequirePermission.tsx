import { useRouter } from "next/router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import type { Account } from "@/lib/accounts/types";

type RequirePermissionProps = {
  /** 이 화면을 볼 수 있는지 판단합니다. (lib/accounts/permissions.ts) */
  allow: (account: Account) => boolean;
  children: ReactNode;
};

// 권한이 없으면 대시보드로 보냅니다.
//
// ★ 사이드바에서 메뉴를 감추는 것만으로는 부족합니다.
//   주소를 직접 치거나, 예전에 저장해 둔 즐겨찾기로 들어올 수 있습니다.
//
// ★ 막다른 화면을 띄우지 않고 **되돌려 보냅니다.**
//   "권한이 없습니다" 만 띄워 두면 거기서 할 수 있는 일이 없어,
//   사람이 뒤로가기를 찾아 누르게 됩니다.
//   로그인하지 않았을 때 로그인 화면으로 보내는 것과 같은 결입니다.
//
// ★ 다만 **말없이 옮기지는 않습니다.**
//   즐겨찾기를 눌렀는데 소리 없이 대시보드가 뜨면 고장으로 보입니다.
//   옮긴 이유를 쪽지로 알려 줍니다. (아래 DENIED_KEY)
//
// ★ 이것도 화면 정리입니다. 보안이 아닙니다.
//   실제 차단은 API 가 합니다.

/**
 * 옮긴 이유를 다음 화면에 전달하는 자리입니다.
 *
 * 주소를 옮기면 이 컴포넌트는 사라지므로 쪽지를 직접 띄울 수 없습니다.
 * sessionStorage 에 적어 두고, 어느 화면에나 있는 AppLayout 이 읽어서 띄웁니다.
 * (탭을 닫으면 지워지는 저장소라 다음에 열었을 때 남지 않습니다)
 */
export const DENIED_KEY = "pingcheck-denied-notice";

export function RequirePermission({ allow, children }: RequirePermissionProps) {
  const { account, status } = useAuth();
  const router = useRouter();

  const denied = status !== "loading" && account !== null && !allow(account);

  useEffect(() => {
    if (!denied) return;

    try {
      window.sessionStorage.setItem(
        DENIED_KEY,
        "접근 권한이 없어 대시보드로 이동했습니다.",
      );
    } catch {
      // 저장소를 막아 둔 브라우저입니다. 쪽지만 못 띄우고 이동은 그대로 합니다.
    }

    // replace 를 씁니다. push 를 쓰면 뒤로가기가 다시 막힌 화면으로 갑니다.
    void router.replace("/");
  }, [denied, router]);

  // 아직 누구인지 모르거나 옮기는 중이면 아무것도 그리지 않습니다.
  // 잠깐이라도 보호된 화면이 보이면 안 됩니다.
  if (status === "loading" || account === null || denied) return null;

  return <>{children}</>;
}
