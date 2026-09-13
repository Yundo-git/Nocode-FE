import { useState } from "react";

// 만든 사람 표기입니다. 로그인 화면 맨 아래에 있습니다.
//
// ★ 이스터에그가 하나 숨어 있습니다.
//   "ydh" 를 **다섯 번 더블클릭**하면 글이 바뀝니다. 한 번 더 하면 돌아옵니다.
//   찾는 사람만 찾으라고 둔 것이라 아무 힌트도 두지 않습니다 —
//   손 모양도 바뀌지 않고, 밑줄도 없습니다.
//
// ★ 새로고침하면 원래대로입니다. 기억해 두지 않습니다.
//   어딘가에 저장해 두면 남의 화면에서 발견돼 "왜 이런 글이 떠 있냐" 가 됩니다.
const NEEDED = 5;
const SECRET = "사이버안전센터 윤대리가 만듬";

export function Signature() {
  const [hits, setHits] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const handleDoubleClick = () => {
    // 나와 있는 상태면 한 번으로 되돌립니다.
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
        // 한글이라 uppercase 는 아무 일도 하지 않지만, 자간은 그대로 둡니다.
        <span
          onDoubleClick={handleDoubleClick}
          // 글자가 잡혀 파랗게 되면 비밀스럽지 않습니다.
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
