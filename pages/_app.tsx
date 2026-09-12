import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/lib/theme";

const inter = Inter({ subsets: ["latin"] });

// 모든 화면에 공통으로 적용되는 설정입니다.
// - 전역 CSS 와 Inter 폰트
// - 화이트/블랙 모드 상태 (화면을 옮겨 다녀도 값이 유지됩니다)
// - 사이드바 + 본문 레이아웃
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <div className={inter.className}>
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      </div>
    </ThemeProvider>
  );
}
