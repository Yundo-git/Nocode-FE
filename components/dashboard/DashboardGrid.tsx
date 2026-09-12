import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
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
// 768px 이상은 20칸, 그 아래는 1칸이라 상자들이 위에서 아래로 쌓입니다.
//
// 20 으로 둔 이유:
// - 8 : 2 배치를 16 : 4 로 정확히 나눌 수 있습니다.
// - 칸이 적으면(예: 10칸) 끌어서 크기를 바꿀 때 한 번에 10%씩 움직여 뚝뚝 끊깁니다.
//   20칸이면 5%씩이라 훨씬 부드럽습니다.
const BREAKPOINTS: Breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS: Breakpoints = { lg: 20, md: 20, sm: 20, xs: 1, xxs: 1 };

const MARGIN: readonly [number, number] = [16, 16];

// 행 높이가 이보다 작아지면 상자 안을 읽을 수 없어 더 줄이지 않습니다.
// (창을 아주 낮게 만들면 그때부터는 세로 스크롤이 생깁니다)
const MIN_ROW_HEIGHT = 28;

// 격자 아래에 남길 여백입니다. 페이지의 아래쪽 안쪽 여백과 맞춥니다.
const BOTTOM_GAP = 16;

// 격자가 화면 아래까지 닿도록 쓸 수 있는 높이를 잽니다.
//
// 격자 위에 무엇이 얼마나 있는지(제목, 버튼 줄 등) 미리 알 수 없으므로
// 격자가 시작되는 위치를 재서 창 높이에서 빼는 방식으로 구합니다.
function useAvailableHeight(ref: RefObject<HTMLElement | null>): number | null {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const measure = () => {
      const element = ref.current;

      if (element === null) return;

      const top = element.getBoundingClientRect().top;
      setHeight(Math.max(200, window.innerHeight - top - BOTTOM_GAP));
    };

    measure();
    window.addEventListener("resize", measure);

    return () => window.removeEventListener("resize", measure);
  }, [ref]);

  return height;
}

type DashboardGridProps = {
  /** 배치를 저장해 둘 localStorage 키입니다. */
  storageKey: string;
  /** 사용자가 옮기기 전의 기본 배치입니다. */
  defaultLayouts: ResponsiveLayouts;
  /**
   * 이만큼의 행이 화면 높이에 딱 맞도록 행 높이를 정합니다.
   * 기본 배치의 세로 칸 수 합을 넣습니다. (예: 위 6 + 아래 6 = 12)
   */
  fitRows: number;
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
  fitRows,
  children,
}: DashboardGridProps) {
  // measureBeforeMount 를 켜면 폭을 잰 뒤에 그립니다.
  // 이게 없으면 기본값(1280px)으로 한 번 그렸다가 실제 폭으로 다시 그려서
  // 상자들이 눈에 띄게 한 번 튑니다.
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: true,
  });

  // 격자가 실제로 시작되는 자리입니다. 여기부터 화면 아래까지가 쓸 수 있는 높이입니다.
  const gridTopRef = useRef<HTMLDivElement | null>(null);
  const availableHeight = useAvailableHeight(gridTopRef);

  // 행 사이 여백을 뺀 나머지를 행 수로 나눕니다.
  // 이렇게 하면 fitRows 만큼의 행이 화면을 정확히 채웁니다.
  const rowHeight =
    availableHeight === null
      ? MIN_ROW_HEIGHT
      : Math.max(
          MIN_ROW_HEIGHT,
          (availableHeight - (fitRows - 1) * MARGIN[1]) / fitRows,
        );

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

      <div ref={gridTopRef}>
        {mounted && layouts !== null && availableHeight !== null ? (
          <ResponsiveGridLayout
            width={width}
            layouts={layouts}
            breakpoints={BREAKPOINTS}
            cols={COLS}
            rowHeight={rowHeight}
            margin={MARGIN}
            containerPadding={[0, 0]}
            dragConfig={{ handle: `.${DRAG_HANDLE_CLASS}` }}
            onLayoutChange={handleLayoutChange}
          >
            {children}
          </ResponsiveGridLayout>
        ) : null}
      </div>
    </div>
  );
}
