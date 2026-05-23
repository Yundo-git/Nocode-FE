import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// 모든 페이지에서 공통으로 쓰이는 글로벌 CSS를 불러옵니다.
// Inter 폰트를 전역으로 사용하기 위한 클래스도 함께 적용합니다.
export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  );
}
