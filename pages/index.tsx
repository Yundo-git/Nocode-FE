import Head from "next/head";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

// 홈페이지 첫 화면을 보여주는 컴포넌트입니다.
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
      {/* 메인 전체 레이아웃 */}
      <main className="min-h-screen bg-bg text-text">
        {/* 화면 중앙에 내용을 배치하는 컨테이너 */}
        <Container className="py-12 lg:py-16">
          {/* 왼쪽 소개 영역 */}
          <section className="space-y-8">
            <div>
              <h1 className="text-sm font-medium  ">
                어떤 앱을 만들고 싶나요?
              </h1>

              {/* 설명영역 */}
              <p className="mt-2 text-sm text-slate-400">
                원하는 서비스를 한 줄로 작성해보세요. 예: 회원 관리 앱, AI
                커뮤니티, 예약 서비스.
              </p>

              <textarea
                className="input min-h-[170px] resize-none"
                placeholder="예) 누구나 쉽게 사용할 수 있는 스터디 그룹 관리 앱을 만들고 싶어요..."
              />
            </div>
          </section>
        </Container>
      </main>
    </>
  );
}
