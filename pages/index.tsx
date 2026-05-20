import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Next.js + Tailwind Starter</title>
        <meta
          name="description"
          content="Tailwind 기반 Next.js 프로젝트 시작 템플릿"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-950 text-slate-100`}
      >
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16">
          <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/40 backdrop-blur">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Tailwind 기반 Next.js 프로젝트
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
              지금부터 Tailwind CSS로 스타일을 구성할 수 있는 최소 시작
              템플릿입니다.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-800 p-6">
                <h2 className="text-xl font-semibold text-white">
                  글로벌 스타일
                </h2>
                <p className="mt-2 text-slate-400">
                  `styles/globals.css`에서 Tailwind 기본 스타일을 로드합니다.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-800 p-6">
                <h2 className="text-xl font-semibold text-white">
                  Tailwind 설정
                </h2>
                <p className="mt-2 text-slate-400">
                  `tailwind.config.js`로 페이지 콘텐츠 위치를 지정했습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
