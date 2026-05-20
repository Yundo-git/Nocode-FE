import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Geist, Geist_Mono } from "next/font/google";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Login() {
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/projects");
  };

  return (
    <>
      <Head>
        <title>로그인 | NoCode Tool</title>
        <meta name="description" content="NoCode Tool 로그인 페이지" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-bg text-text`}>
        <Container className="flex min-h-screen items-center justify-center py-16">
          <div className="card w-full max-w-2xl">
            <div className="mb-10 space-y-4">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                NoCode Tool
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                빠르게 앱을 시작하려면 로그인하세요
              </h1>
              <p className="max-w-2xl text-slate-400">
                간단한 로그인 후 프로젝트 목록으로 이동하여 노코드 앱을 관리할 수 있습니다.
              </p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">이메일</span>
                <input type="email" required placeholder="email@example.com" className="input" />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">비밀번호</span>
                <input type="password" required placeholder="••••••••" className="input" />
              </label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Button type="submit" size="lg">
                  로그인
                </Button>
                <Link href="/" className="btn btn-ghost btn-md text-left">
                  시작 페이지로 돌아가기
                </Link>
              </div>
            </form>
          </div>
        </Container>
      </main>
    </>
  );
}
