import Head from "next/head";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import Header from "@/components/Header";

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
          <h1 className="text-h1 text-main">ㅎㅇㅎㅇ</h1>{" "}
        </Container>
      </main>
    </>
  );
}
