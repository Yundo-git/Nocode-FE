import { useEffect, useRef, useState } from "react";

// 값이 바뀐 직후 잠깐 참이 됩니다.
//
// 상시 깜빡임과 정반대입니다.
// 바뀐 그 순간에만 한 번 알려 주고, 평소에는 가만히 있습니다.
// 잠깐 딴 데 보다 돌아왔을 때 무엇이 달라졌는지 찾게 해 줍니다.
export function useFlashOnChange(value: number | string, ms = 700): boolean {
  const [flashing, setFlashing] = useState(false);
  const previous = useRef(value);
  // 처음 그려질 때는 번쩍이지 않습니다. 바뀐 것이 아니니까요.
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      previous.current = value;
      return;
    }

    if (previous.current === value) {
      return;
    }

    previous.current = value;
    setFlashing(true);

    const timer = setTimeout(() => setFlashing(false), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);

  return flashing;
}
