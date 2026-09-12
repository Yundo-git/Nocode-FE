import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import { AuthGate, isPublicRoute } from "@/components/auth/AuthGate";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";

const inter = Inter({ subsets: ["latin"] });

// 모든 화면에 공통으로 적용되는 설정입니다.
// - 전역 CSS 와 Inter 폰트
// - 화이트/블랙 모드 상태 (화면을 옮겨 다녀도 값이 유지됩니다)
// - 로그인 상태와 로그인 검사
// - 사이드바 + 본문 레이아웃 (로그인 화면은 제외)
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const page = <Component {...pageProps} />;

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className={inter.className}>
          <AuthGate>
            {isPublicRoute(router.pathname) ? (
              page
            ) : (
              <AppLayout>{page}</AppLayout>
            )}
          </AuthGate>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
