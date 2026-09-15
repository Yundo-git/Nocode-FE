import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { TvIcon } from "@/components/ui/icons";
import {
  ResponsiveGridLayout,
  useContainerWidth,
  type Breakpoints,
  type Layout,
  type ResponsiveLayouts,
} from "react-grid-layout";

export const DRAG_HANDLE_CLASS = "dashboard-drag-handle";

const BREAKPOINTS: Breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS: Breakpoints = { lg: 20, md: 20, sm: 20, xs: 1, xxs: 1 };

const MARGIN: readonly [number, number] = [16, 16];

const MIN_ROW_HEIGHT = 28;

const BOTTOM_GAP = 16;

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
  storageKey: string;
  defaultLayouts: ResponsiveLayouts;
  fitRows: number;
  onTvMode?: () => void;
  toolbarLeft?: ReactNode;
  children: ReactNode;
};

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

export function DashboardGrid({
  storageKey,
  defaultLayouts,
  fitRows,
  onTvMode,
  toolbarLeft,
  children,
}: DashboardGridProps) {
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: true,
  });

  const gridTopRef = useRef<HTMLDivElement | null>(null);
  const availableHeight = useAvailableHeight(gridTopRef);

  const rowHeight =
    availableHeight === null
      ? MIN_ROW_HEIGHT
      : Math.max(
          MIN_ROW_HEIGHT,
          (availableHeight - (fitRows - 1) * MARGIN[1]) / fitRows,
        );

  const [layouts, setLayouts] = useState<ResponsiveLayouts | null>(null);

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
      }
    },
    [storageKey],
  );

  const resetLayouts = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
    }

    setLayouts(defaultLayouts);
  }, [storageKey, defaultLayouts]);

  return (
    <div ref={containerRef}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">{toolbarLeft}</div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetLayouts}
            className="btn btn-ghost btn-sm"
          >
            기본 배치로 되돌리기
          </button>

          <button
            type="button"
            onClick={onTvMode}
            disabled={onTvMode === undefined}
            className="btn btn-ghost btn-sm"
          >
            <TvIcon width={16} height={16} />
            TV모드
          </button>
        </div>
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
