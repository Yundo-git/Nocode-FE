# Nocode FE

사이드바 + 본문 레이아웃과 디자인 토큰만 남겨 둔 프론트엔드 골격입니다.
화면 내용은 앞으로 채웁니다.

> **문서**
> - [NOTES.md](NOTES.md) — 프론트 작업 시 주의사항 (배포 전 반드시)
> - [BACKEND.md](BACKEND.md) — 백엔드 작업지시서 (구조 · DB · API 계약)
> - [DEPLOY.md](DEPLOY.md) — 내부망 도커 배포
>
> **작업 전에 [NOTES.md](NOTES.md) 를 읽어 주세요.**
> 배포 전에 반드시 고쳐야 할 것(인증), 데이터 저장 위치, 자주 걸리는 함정을 모아 두었습니다.

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
- 아이콘은 직접 만든 SVG 컴포넌트 (`components/ui/icons.tsx`)

`lucide-react` 와 `@headlessui/react` 가 package.json 에 남아 있지만 지금은
쓰는 곳이 없습니다. 계속 안 쓸 거라면 지워도 됩니다.

## 폴더 구조

```text
pages/
  _app.tsx                여러 화면에 공통 적용 (테마, 로그인 검사, 레이아웃)
  _document.tsx           문서 기본 뼈대 + 테마 선적용 스크립트
  index.tsx               대시보드
  servers.tsx             서버관리
  accounts.tsx            계정관리 (전체 계정)
  my-account.tsx          내 계정 (본인 계정)
  login.tsx               로그인 (사이드바 없이 화면 전체를 씁니다)

components/
  auth/
    AuthGate.tsx          로그인 안 했으면 로그인 화면으로 보냅니다
  layout/
    AppLayout.tsx         사이드바 + 본문 골격, 사이드바 접힘 상태
    sidebar/
      Sidebar.tsx         아래 세 조각을 조립합니다
      SidebarHeader.tsx   서비스 이름 + 접기/펼치기
      SidebarNav.tsx      메뉴 목록
      SidebarFooter.tsx   아이디 + 로그아웃 + 화면 모드
      navItems.ts         메뉴 항목 데이터 (메뉴 추가는 여기만 고치면 됩니다)
  ui/
    Panel.tsx             대시보드 상자 (제목/설명/버튼/바닥글 선택)
    Modal.tsx             화면 가운데 뜨는 창
    ColorMode.tsx         화이트/블랙 모드 선택 상자
    icons.tsx             아이콘 (아래 "아이콘" 항목 참고)

lib/
  auth.tsx                로그인 상태
  theme.tsx               화이트/블랙 모드 상태

styles/globals.css        디자인 토큰과 공통 컴포넌트 클래스
tailwind.config.js        Tailwind 색상 / 텍스트 스타일 설정
public/icon/*.svg         아이콘 원본 파일 (실제 화면은 icons.tsx 를 씁니다)
```

## 아이콘

`public/icon/*.svg` 는 원본 보관용이고, 화면에서는 `components/ui/icons.tsx` 의
컴포넌트를 씁니다. `<img>` 로 불러오면 svg 안에 박힌 색을 CSS 로 바꿀 수 없어
블랙 모드에서 아이콘이 보이지 않기 때문입니다. 컴포넌트 쪽은 선 색이
`currentColor` 라서 글자 색을 그대로 따라가고, 파일 요청도 생기지 않습니다.

아이콘을 추가할 때는 `public/icon/` 에 원본을 넣고 `icons.tsx` 에 같은 path 를
옮겨 적으면 됩니다.

## 색상

강조색(primary)은 보라색 계열입니다. 실제 값은 `styles/globals.css` 의 CSS 변수에
있고, `tailwind.config.js` 가 그 변수를 `bg-primary-500` 같은 클래스로 연결합니다.
색을 바꿀 때는 `globals.css` 의 변수만 고치면 됩니다.
