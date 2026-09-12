import { methodHandler } from "@/lib/api/handler";

// GET /api/time  서버의 현재 시각
//
// 시각을 글자로 내려 주면 받는 쪽에서 해석이 갈릴 수 있어
// 기준이 하나뿐인 epoch 밀리초로 보냅니다.
//
// timeZone 은 이 서버가 어느 시간대로 동작 중인지 알려 주는 값입니다.
// 리눅스 서버는 보통 UTC 로 맞춰져 있어서, 한국 시각으로 보이게 하려면
// 서비스를 띄울 때 TZ=Asia/Seoul 을 넣어 줘야 합니다. (NOTES.md 2-4)
export default methodHandler({
  GET: async (_req, res) => {
    // 시계는 캐시되면 안 됩니다.
    res.setHeader("Cache-Control", "no-store");

    res.status(200).json({
      epochMs: Date.now(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  },
});
