import { useState } from "react";

const NEEDED = 5;
const SECRET = "사이버안전센터 윤대리가 만듬";

export function Signature() {
  const [hits, setHits] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const handleDoubleClick = () => {
    if (revealed) {
      setRevealed(false);
      setHits(0);
      return;
    }

    const next = hits + 1;

    if (next >= NEEDED) {
      setRevealed(true);
      setHits(0);
      return;
    }

    setHits(next);
  };

  return (
    <p className="mt-1 text-d-label uppercase text-muted">
      {revealed ? (
        <span
          onDoubleClick={handleDoubleClick}
          className="cursor-default select-none normal-case text-primary-500"
        >
          {SECRET}
        </span>
      ) : (
        <>
          Copyright © 2026{" "}
          <span
            onDoubleClick={handleDoubleClick}
            className="cursor-default select-none"
          >
            ydh
          </span>
          . All rights reserved.
        </>
      )}
    </p>
  );
}
