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
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
