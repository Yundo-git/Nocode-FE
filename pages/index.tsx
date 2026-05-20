import Head from "next/head";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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

export default function Home() {
  return (
    <>
      <Head>
        <title>누구나 1주일 만에 만드는 어플리케이션 | NoCode Tool</title>
        <meta
          name="description"
          content="AI 프롬프트 기반 노코드 툴 소개 랜딩 페이지"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-bg text-text`}
      >
        <Container className="py-12 lg:py-16">
          <div className="grid gap-12 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <section className="space-y-8">
              <div className="max-w-xl space-y-3">
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  AI 프롬프트로 바로 시작
                </span>
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  누구나 쉽게 1주일 만에 만드는 어플리케이션
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  입문자용부터 고급자용까지, 원하는 앱을 AI 프롬프트로 빠르게
                  설계하고 배포할 수 있는 노코드 툴입니다.
                </p>
              </div>

              <div className="section-card border-white/10 bg-slate-950/85">
                <div className="mb-5 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-950/90 p-6 shadow-soft">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.3em] text-primary/90">
                        어떤 앱을 만들고 싶나요?
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        원하는 서비스를 한 줄로 작성해보세요. 예: 회원 관리 앱,
                        AI 커뮤니티, 예약 서비스.
                      </p>
                    </div>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                      Prompt
                    </span>
                  </div>

                  <textarea
                    className="input min-h-[170px] resize-none"
                    placeholder="예) 누구나 쉽게 사용할 수 있는 스터디 그룹 관리 앱을 만들고 싶어요..."
                  />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button size="lg" href="/login">
                    로그인 후 바로 시작하기
                  </Button>
                  <Link
                    href="#features"
                    className="btn btn-secondary btn-lg text-center"
                  >
                    소개 페이지 보기
                  </Link>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="section-card border-white/10 bg-slate-950/85">
                <h2 className="text-xl font-semibold text-white">
                  무엇을 만들 수 있나요?
                </h2>
                <p className="mt-3 text-slate-400">
                  AI 프롬프트와 디자인 시스템을 바탕으로 다양한 스타일의 앱을
                  빠르게 만들 수 있습니다.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/90 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-primary/90">
                      입문자용
                    </p>
                    <p className="mt-3 text-slate-300">
                      간단한 랜딩 페이지, 프로필 도구, 설문 조사 앱.
                    </p>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/90 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-accent/90">
                      고급자용
                    </p>
                    <p className="mt-3 text-slate-300">
                      AI 기반 대시보드, 프로젝트 관리 툴, 협업 플랫폼.
                    </p>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/90 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-primary/90">
                      재사용성
                    </p>
                    <p className="mt-3 text-slate-300">
                      컴포넌트 기반 버튼, 입력, 카드 디자인을 활용하세요.
                    </p>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/90 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-accent/90">
                      확장성
                    </p>
                    <p className="mt-3 text-slate-300">
                      Tailwind 설정으로 색상과 사이즈를 쉽게 조정할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              <div
                id="features"
                className="section-card border-white/10 bg-slate-950/85"
              >
                <h2 className="text-xl font-semibold text-white">
                  Tailwind 재사용성 세팅
                </h2>
                <ul className="mt-5 space-y-3 text-slate-400">
                  <li>• 버튼 크기별 컴포넌트 `Button`</li>
                  <li>• 공통 레이아웃 `Container`</li>
                  <li>• 카드형 컴포넌트 `ProjectCard`</li>
                  <li>• CSS 변수 기반 색상, Tailwind 유틸리티 확장</li>
                </ul>
              </div>
            </section>
          </div>
        </Container>
      </main>
    </>
  );
}
