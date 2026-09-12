# Server Monitoring Dashboard (Frontend)

약 1,000대의 서버 상태를 한눈에 확인하기 위한 모니터링 시스템의 프론트엔드입니다.

원래 노코드 툴 소개용으로 만들어진 프로젝트였으나, 서버 모니터링 시스템으로 방향이
바뀌면서 랜딩/소개 화면을 제거하고 대시보드 중심 구조로 전환했습니다.

## 현재 단계

이번 단계에서는 **화면 구조와 UI만** 만들었습니다. 데이터는 mock 값입니다.

- [x] 기본 진입 화면(`/`)이 대시보드
- [x] 사이드바 영역 + 본문(Main Content) 레이아웃
- [x] 전체 현황 카드 / 서버 상태 표 / 최근 장애 목록
- [ ] 백엔드(Node.js), Redis, PostgreSQL
- [ ] Ping Worker(Python), 실시간(WebSocket) 갱신
- [ ] 로그인 및 사용자 인증

사이드바의 메뉴 구성은 아직 정하지 않아 영역만 잡아 두었습니다.

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
  index.tsx               대시보드 화면

components/
  layout/                 AppLayout(사이드바 + 본문), Sidebar
  dashboard/              대시보드 UI (요약 카드, 서버 표, 장애 목록)
  ui/                     공통 UI (Button, Container, ColorMode)

lib/
  monitoring/
    types.ts              화면에서 쓰는 데이터 타입
    mockServers.ts        mock 서버 데이터 (항상 같은 값이 나오도록 생성)
    stats.ts              현황 집계, 심각도 정렬
    format.ts             화면 표시용 문자열 변환
    dataSource.ts         데이터 출처 (지금은 mock, 나중에 REST/WebSocket)
    useMonitoringSnapshot.ts  화면이 사용하는 상태 저장소
  theme.tsx               블랙/화이트 모드 상태

styles/globals.css        디자인 토큰과 공통 컴포넌트 클래스
```

## 데이터 연결 방법 (다음 단계)

화면 컴포넌트는 props 로만 데이터를 받고, 데이터 출처는 한 곳에 모여 있습니다.

```text
lib/monitoring/dataSource.ts     <- 여기만 바꾸면 됩니다
        ↓
lib/monitoring/useMonitoringSnapshot.ts
        ↓
pages/index.tsx  ->  components/dashboard/*
```

`fetchMonitoringSnapshot()` 안의 mock 반환을 REST 호출이나 WebSocket 구독으로
바꾸면 UI 코드를 고치지 않아도 실제 데이터가 표시됩니다.
