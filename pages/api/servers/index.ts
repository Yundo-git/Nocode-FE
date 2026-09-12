import { methodHandler } from "@/lib/api/handler";
import { createServerRecord, listServers } from "@/lib/servers/serverStore";
import { parseNewServerInput } from "@/lib/servers/validation";

// GET  /api/servers  목록
// POST /api/servers  한 대 등록
export default methodHandler({
  GET: async (_req, res) => {
    res.status(200).json(await listServers());
  },

  POST: async (req, res) => {
    // 브라우저 검사는 통과해도 요청은 직접 만들 수 있으므로 여기서 다시 봅니다.
    const input = parseNewServerInput(req.body);

    if (input === null) {
      res.status(400).json({ message: "입력값이 올바르지 않습니다." });
      return;
    }

    const result = await createServerRecord(input);

    if (!result.ok) {
      // 409 Conflict: 이미 있는 값과 부딪혔다는 뜻입니다.
      res.status(409).json({ message: "이미 등록된 IP입니다." });
      return;
    }

    res.status(201).json(result.server);
  },
});
