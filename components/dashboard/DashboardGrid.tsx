import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ResponsiveGridLayout,
  useContainerWidth,
  type Breakpoints,
  type Layout,
  type ResponsiveLayouts,
} from "react-grid-layout";

// 머리말에 이 클래스가 붙은 곳을 잡아야만 상자가 끌립니다.
// 상자 안의 버튼을 눌렀을 때 같이 끌려가지 않게 하기 위함입니다.
export const DRAG_HANDLE_CLASS = "dashboard-drag-handle";

// 화면 폭 기준점과, 기준점마다 쓸 칸 수입니다.
// 768px 이상은 14칸(4:3 을 8:6 으로 정확히 나눌 수 있는 수),
// 그 아래는 1칸이라 상자들이 위에서 아래로 쌓입니다.
const BREAKPOINTS: Breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS: Breakpoints = { lg: 14, md: 14, sm: 14, xs: 1, xxs: 1 };

const ROW_HEIGHT = 40;
const MARGIN: readonly [number, number] = [16, 16];

type DashboardGridProps = {
  /** 배치를 저장해 둘 localStorage 키입니다. */
  storageKey: string;
  /** 사용자가 옮기기 전의 기본 배치입니다. */
  defaultLayouts: ResponsiveLayouts;
  /** 각 자식의 key 가 배치의 i 와 같아야 합니다. */
  children: ReactNode;
};

// 저장된 배치를 읽습니다.
// localStorage 값은 사람이 고칠 수도 있고 예전 버전이 남아 있을 수도 있으므로
// 모양을 확인하고, 이상하면 없는 셈 칩니다.
function readSavedLayouts(storageKey: string): ResponsiveLayouts | null {
  try {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }

    const isValid = Object.values(parsed).every(
      (items) =>
        Array.isArray(items) &&
        items.every(
          (item: unknown) =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as Layout[number]).i === "string",
        ),
    );

    return isValid ? (parsed as ResponsiveLayouts) : null;
  } catch {
    return null;
  }
}

// 상자를 끌어서 자리를 바꿀 수 있는 대시보드 격자입니다.
// 옮긴 자리는 브라우저에 저장돼 새로고침해도 유지됩니다.
export function DashboardGrid({
  storageKey,
  defaultLayouts,
  children,
}: DashboardGridProps) {
  // measureBeforeMount 를 켜면 폭을 잰 뒤에 그립니다.
  // 이게 없으면 기본값(1280px)으로 한 번 그렸다가 실제 폭으로 다시 그려서
  // 상자들이 눈에 띄게 한 번 튑니다.
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: true,
  });

  // 서버에서 그린 화면과 첫 화면이 같아야 하므로
  // 저장된 배치는 화면이 뜬 뒤에 읽어 옵니다. (테마/로그인과 같은 방식입니다)
  const [layouts, setLayouts] = useState<ResponsiveLayouts | null>(null);

  // 처음 불러오기가 끝나기 전에 저장이 일어나지 않게 막는 표시입니다.
  const loadedRef = useRef(false);

  useEffect(() => {
    setLayouts(readSavedLayouts(storageKey) ?? defaultLayouts);
    loadedRef.current = true;
  }, [storageKey, defaultLayouts]);

  const handleLayoutChange = useCallback(
    (_current: Layout, next: ResponsiveLayouts) => {
      if (!loadedRef.current) {
        return;
      }

      setLayouts(next);

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // 저장이 막혀 있어도(시크릿 창 등) 화면은 그대로 쓸 수 있게 둡니다.
      }
    },
    [storageKey],
  );

  const resetLayouts = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // 지우지 못해도 화면 배치는 되돌립니다.
    }

    setLayouts(defaultLayouts);
  }, [storageKey, defaultLayouts]);

  return (
    <div ref={containerRef}>
      <div className="mb-2 flex justify-end">
        {/* 끌어서 옮기는 것만으로는 키보드로 배치를 바꿀 수 없습니다.
            최소한 처음 상태로 돌아올 방법은 있어야 합니다. */}
        <button type="button" onClick={resetLayouts} className="btn btn-ghost btn-sm">
          기본 배치로 되돌리기
        </button>
      </div>

      {mounted && layouts !== null ? (
        <ResponsiveGridLayout
          width={width}
          layouts={layouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={ROW_HEIGHT}
          margin={MARGIN}
          containerPadding={[0, 0]}
          dragConfig={{ handle: `.${DRAG_HANDLE_CLASS}` }}
          onLayoutChange={handleLayoutChange}
        >
          {children}
        </ResponsiveGridLayout>
      ) : null}
    </div>
  );
}
