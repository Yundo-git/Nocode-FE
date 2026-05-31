import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

// 로그인 화면을 보여주는 페이지 컴포넌트입니다.
export default function Login() {
  const router = useRouter();

  // 로그인 폼 제출 시 프로젝트 페이지로 이동합니다.
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
      {/* 로그인 페이지 전체 레이아웃 */}
      <main className="min-h-screen bg-primary-900 text-white">
        {/* 화면 가운데에 로그인 폼을 맞추는 컨테이너 */}
        <Container className="flex min-h-screen items-center justify-center py-16">
          <div className="card w-full max-w-2xl">
            {/* 로그인 폼 제목과 설명 */}
            <div className="mb-10 space-y-4">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-b2_body_m font-semibold text-primary">
                NoCode Tool
              </span>
              <h1 className="text-h1 font-semibold tracking-tight text-white">
                빠르게 앱을 시작하려면 로그인하세요
              </h1>
              <p className="max-w-2xl text-b1_body_r text-muted">
                간단한 로그인 후 프로젝트 목록으로 이동하여 노코드 앱을 관리할
                수 있습니다.
              </p>
            </div>
            {/* 로그인 입력 폼 */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-b2_body_m font-medium text-secondary">
                  이메일
                </span>
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  className="input"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-b2_body_m font-medium text-secondary">
                  비밀번호
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input"
                />
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
