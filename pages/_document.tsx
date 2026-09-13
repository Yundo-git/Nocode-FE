import { Head, Html, Main, NextScript } from "next/document";

// 화면이 그려지기 전에 저장된 테마를 먼저 적용합니다.
// 이 코드가 없으면 블랙 모드를 쓰는 사람이 새로고침할 때마다
// 밝은 화면이 잠깐 보였다가 바뀝니다.
const THEME_BOOTSTRAP = `try{var t=localStorage.getItem("monitoring-theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;}}catch(e){}`;

// 문서의 기본 뼈대입니다. 화면 문구가 한국어이므로 lang 을 ko 로 지정합니다.
export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* 파비콘.
            최신 브라우저는 svg 를 먼저 씁니다. 확대해도 흐려지지 않습니다.
            svg 를 모르는 브라우저는 아래 ico 로 넘어갑니다. */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
