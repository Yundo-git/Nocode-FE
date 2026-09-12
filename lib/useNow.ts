import { useEffect, useState } from "react";

// 매초 바뀌는 "지금" 입니다.
//
// 지속 시간을 보여 주는 곳이 여러 군데라, 각자 타이머를 돌리면
// 줄마다 초가 제각각으로 넘어가 보입니다. 한 곳에서 세어 내려보냅니다.
//
// 서버에는 흐르는 시간이 없으므로 화면에 붙은 뒤부터 셉니다.
// (서버와 브라우저가 다른 값을 그리면 경고가 납니다)
export function useNow(): number {
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return now;
}
