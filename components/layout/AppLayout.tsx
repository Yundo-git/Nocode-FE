import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";
import { Toast } from "@/components/ui/Toast";
import { DENIED_KEY } from "@/components/auth/RequirePermission";

// 앱 전체 골격입니다. 왼쪽에 사이드바, 오른쪽에 본문을 배치합니다.
// grid 의 minmax(0, 1fr) 덕분에 본문에 넓은 내용이 들어와도
// 본문이 사이드바를 밀어내거나 화면 밖으로 넘치지 않습니다.
//
// 사이드바를 접으면 첫 번째 칸이 12rem 에서 3rem 으로 줄어듭니다.
// 3rem 은 아이콘 하나와 좌우 여백이 들어가는 크기입니다.
export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 권한이 없어 되돌려 보내진 경우, 그 이유를 쪽지로 알려 줍니다.
  //
  // 옮겨 온 뒤에 띄웁니다. 옮기기 전 화면은 이미 사라졌기 때문입니다.
  // 브라우저 저장소는 화면이 뜬 뒤에 읽어야 합니다. (NOTES.md 5-4)
  const [notice, setNotice] = useState("");
  const { asPath } = useRouter();

  // ★ asPath 를 지켜봅니다. 이 컴포넌트는 화면을 옮겨도 **다시 만들어지지
  //   않기 때문**입니다. 처음 한 번만 확인하면, 앱 안에서 주소를 옮겨
  //   되돌려 보내진 경우에 쪽지가 뜨지 않습니다.
  useEffect(() => {
    try {
      const found = window.sessionStorage.getItem(DENIED_KEY);

      if (found) {
        setNotice(found);
        // 한 번만 띄웁니다. 새로고침할 때마다 또 뜨면 성가십니다.
        window.sessionStorage.removeItem(DENIED_KEY);
      }
    } catch {
      // 저장소를 막아 둔 브라우저입니다. 쪽지 없이 넘어갑니다.
    }
  }, [asPath]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div
        className={`bg-theme grid h-[100dvh] grid-cols-1 transition-[grid-template-columns] duration-200 ease-out ${
          sidebarOpen
            ? "md:grid-cols-[16rem_minmax(0,1fr)]"
            : "md:grid-cols-[4rem_minmax(0,1fr)]"
        }`}
      >
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
        />
        {/* 본문만 세로로 스크롤됩니다. */}
        <main className="min-w-0 overflow-y-auto">{children}</main>

        <Toast
          message={notice}
          tone="error"
          onDone={() => setNotice("")}
        />
      </div>
    </>
  );
}
