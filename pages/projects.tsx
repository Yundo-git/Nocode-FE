import Head from "next/head";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/ProjectCard";

// 화면에 보여줄 예시 프로젝트 데이터입니다.
const projects = [
  {
    title: "AI 챗봇 서비스",
    description:
      "사용자 질문에 맞춘 AI 답변 생성 및 대시보드 관리 기능을 포함한 챗봇 앱.",
    tags: ["AI", "챗봇", "데이터"],
    status: "Live",
    progress: 84,
  },
  {
    title: "회원 관리 툴",
    description:
      "간단한 회원 등록, 검색, 통계 시각화가 가능한 CRM 스타일 애플리케이션.",
    tags: ["관리", "회원", "대시보드"],
    status: "Draft",
    progress: 52,
  },
  {
    title: "커뮤니티 마켓플레이스",
    description:
      "상품 등록, 검색, 채팅 기반 거래 흐름을 지원하는 마켓플레이스 화면.",
    tags: ["커뮤니티", "마켓", "UX"],
    status: "Beta",
    progress: 69,
  },
  {
    title: "교육 콘텐츠 허브",
    description: "강의 목록, 추천 학습 경로, 피드백을 제공하는 학습 플랫폼 UI.",
    tags: ["교육", "콘텐츠", "플랫폼"],
    status: "Live",
    progress: 92,
  },
];

// 프로젝트 목록 페이지를 보여주는 컴포넌트입니다.
export default function Projects() {
  return (
    <>
      <Head>
        <title>프로젝트 대시보드 | NoCode Tool</title>
        <meta name="description" content="프로젝트 대시보드 화면" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-bg text-text">
        {/* 페이지 상단 설명 영역 */}
        <Container className="py-10">
          <div className="mb-10 flex flex-col gap-5 rounded-[32px] border border-white/10 bg-slate-950/90 p-8 shadow-soft md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-primary/80">
                NoCode Tool
              </p>
              <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                프로젝트 목록
              </h1>
              <p className="mt-4 max-w-2xl text-slate-400">
                피그마 스타일의 카드 형태로 구성된 프로젝트 항목을 한눈에 확인할
                수 있습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-ghost btn-sm">
                로그아웃
              </Link>
              <Button variant="secondary" size="sm" href="/">
                새 프로젝트 만들기
              </Button>
            </div>
          </div>

          {/* 프로젝트 카드 목록 */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>
        </Container>
      </main>
    </>
  );
}
