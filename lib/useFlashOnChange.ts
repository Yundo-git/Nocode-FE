import { useEffect, useRef, useState } from "react";

export function useFlashOnChange(value: number | string, ms = 700): boolean {
  const [flashing, setFlashing] = useState(false);
  const previous = useRef(value);
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
