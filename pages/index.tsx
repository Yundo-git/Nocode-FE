import Head from "next/head";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import Header from "@/components/Header/Header";

// 홈페이지 첫 화면을 보여주는 컴포넌트입니다.
export default function Home() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

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
      <main className="min-h-screen">
        <Header theme={theme} setTheme={setTheme} />
        {/* 화면 중앙에 내용을 배치하는 컨테이너 */}
        <Container>
          <h1 className="text-h1 text-main my-12 text-center text-shadow-soft">
            개발 지식 0%에서 완벽한 앱 런칭 까지
          </h1>
          <h2 className="text-h2 text-main my-6 text-center">
            AI가 설계하는 완전히 새로운 노코드 생태계
          </h2>
          <textarea
            className="input resize-none bg-primary-900/90 text-main placeholder-secondary/80 text-center min-w-[60vw] mx-auto block w-full max-w-3xl rounded-[2rem] border border-white/10 p-6 text-b1_body_r font-medium focus:ring-2 focus:ring-primary/50 shadow-soft focus:outline-none focus:ring-offset-0"
            placeholder="예) 우리 모임의 일정을 관리할 수 있는 앱을 만들고 싶어요."
          />
        </Container>
      </main>
    </>
  );
}
