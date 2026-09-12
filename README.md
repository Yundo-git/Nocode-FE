# Nocode FE

사이드바 + 본문 레이아웃과 디자인 토큰만 남겨 둔 프론트엔드 골격입니다.
화면 내용은 앞으로 채웁니다.

## 실행

```bash
npm install
npm run dev     # 개발 서버 (http://localhost:3000)
npm run build   # 프로덕션 빌드
npm start       # 빌드 결과 실행
```

## 기술 스택

- Next.js 16 (Pages Router)
- React 19
- TypeScript
- Tailwind CSS v3 + CSS 변수 기반 디자인 토큰 (블랙/화이트 모드)
- lucide-react (아이콘), @headlessui/react

## 폴더 구조

```text
pages/
  _app.tsx                여러 화면에 공통으로 적용되는 설정 (테마, 레이아웃)
  _document.tsx           문서 기본 뼈대
  index.tsx               기본 진입 화면 (비어 있음)

components/
  layout/                 AppLayout(사이드바 + 본문), Sidebar

lib/
  theme.tsx               블랙/화이트 모드 상태

styles/globals.css        디자인 토큰과 공통 컴포넌트 클래스
tailwind.config.js        Tailwind 색상 / 텍스트 스타일 설정
```

## 색상

강조색(primary)은 보라색 계열입니다. 실제 값은 `styles/globals.css` 의 CSS 변수에
있고, `tailwind.config.js` 가 그 변수를 `bg-primary-500` 같은 클래스로 연결합니다.
색을 바꿀 때는 `globals.css` 의 변수만 고치면 됩니다.
