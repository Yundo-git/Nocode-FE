import { useCallback, useEffect, useRef, useState } from "react";

// 표의 열 너비를 마우스로 끌어 조절합니다.
//
// ★ 왜 필요한가
//   "내용" 칸에 긴 글이 들어오면 잘려 보입니다. 반대로 "종류" 는 늘 짧아
//   자리가 남습니다. 사람마다, 그날 보는 것마다 넓히고 싶은 칸이 다릅니다.
//
// ★ 브라우저에 저장합니다.
//   기기마다 화면 크기가 다르고, 화면이 그려지기 전에 적용돼야 해서
//   서버에서 받아올 수 없습니다. 테마·대시보드 배치와 같은 이유입니다.
//   (NOTES.md 6-2)

/** 너무 좁히면 글자가 아예 안 보입니다. */
const MIN_WIDTH = 60;

export type ColumnWidths = Record<string, number>;

export function useColumnWidths(
  storageKey: string,
  defaults: ColumnWidths,
): {
  widths: ColumnWidths;
  startResize: (key: string, event: React.PointerEvent) => void;
  reset: () => void;
  changed: boolean;
} {
  // 서버에는 localStorage 가 없습니다. 항상 기본값으로 시작하고
  // 화면이 붙은 뒤에 읽습니다. (NOTES.md 5-4)
  const [widths, setWidths] = useState<ColumnWidths>(defaults);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);

      if (!raw) return;

      const parsed: unknown = JSON.parse(raw);

      if (typeof parsed !== "object" || parsed === null) return;

      // 저장된 값은 사람이 고칠 수도 있고 예전 버전이 남아 있을 수도 있습니다.
      // 아는 열만, 숫자인 것만 받아들입니다.
      const next: ColumnWidths = { ...defaults };
      let any = false;

      for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
        if (key in defaults && typeof value === "number" && value >= MIN_WIDTH) {
          next[key] = value;
          any = true;
        }
      }

      if (any) {
        setWidths(next);
        setChanged(true);
      }
    } catch {
      // 저장소를 막아 둔 브라우저이거나 값이 깨졌습니다. 기본값으로 둡니다.
    }
  }, [storageKey, defaults]);

  const save = useCallback(
    (next: ColumnWidths) => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // 저장만 실패합니다. 이번 화면에서는 그대로 적용됩니다.
      }
    },
    [storageKey],
  );

  // 끄는 동안의 값입니다. 매 움직임마다 상태를 바꾸면 표 전체가 다시 그려집니다.
  const dragRef = useRef<{ key: string; startX: number; startWidth: number } | null>(
    null,
  );

  const startResize = useCallback(
    (key: string, event: React.PointerEvent) => {
      // 글자 선택이 따라 잡히면 끄는 내내 파랗게 칠해집니다.
      event.preventDefault();

      dragRef.current = {
        key,
        startX: event.clientX,
        startWidth: widths[key] ?? defaults[key] ?? MIN_WIDTH,
      };

      const handleMove = (moveEvent: PointerEvent) => {
        const drag = dragRef.current;

        if (drag === null) return;

        const next = Math.max(
          MIN_WIDTH,
          drag.startWidth + (moveEvent.clientX - drag.startX),
        );

        setWidths((prev) => ({ ...prev, [drag.key]: next }));
        setChanged(true);
      };

      const handleUp = () => {
        dragRef.current = null;

        document.removeEventListener("pointermove", handleMove);
        document.removeEventListener("pointerup", handleUp);
        document.body.style.removeProperty("cursor");
        document.body.style.removeProperty("user-select");

        // 끝났을 때만 저장합니다. 끄는 내내 저장하면 쓸데없이 자주 씁니다.
        setWidths((prev) => {
          save(prev);
          return prev;
        });
      };

      // 손잡이를 벗어나도 계속 따라오도록 문서 전체에서 듣습니다.
      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
      // 끄는 동안 커서와 선택을 고정합니다.
      document.body.style.setProperty("cursor", "col-resize");
      document.body.style.setProperty("user-select", "none");
    },
    [widths, defaults, save],
  );

  const reset = useCallback(() => {
    setWidths(defaults);
    setChanged(false);

    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // 지우기만 실패합니다.
    }
  }, [defaults, storageKey]);

  return { widths, startResize, reset, changed };
}
