import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";
import { Toast } from "@/components/ui/Toast";
import { DENIED_KEY } from "@/components/auth/RequirePermission";
import { NotesProvider } from "@/lib/notes/NotesProvider";

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [notice, setNotice] = useState("");
  const { asPath } = useRouter();

  useEffect(() => {
    try {
      const found = window.sessionStorage.getItem(DENIED_KEY);

      if (found) {
        setNotice(found);
        window.sessionStorage.removeItem(DENIED_KEY);
      }
    } catch {
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
        <NotesProvider>
          <Sidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen((prev) => !prev)}
            onRequestOpen={() => setSidebarOpen(true)}
            onNotice={setNotice}
          />
          <main className="min-w-0 overflow-y-auto">{children}</main>
        </NotesProvider>

        <Toast
          message={notice}
          tone="error"
          onDone={() => setNotice("")}
        />
      </div>
    </>
  );
}
