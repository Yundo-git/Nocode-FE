import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

// API 라우트마다 반복되던 "지원하지 않는 방식" 처리를 한 곳에 모읍니다.
//
// 인증이 붙으면 여기서 요청자를 확인하고 막으면
// 모든 API 라우트에 한 번에 적용됩니다.
export function methodHandler(
  handlers: Partial<Record<Method, NextApiHandler>>,
): NextApiHandler {
  const allowed = Object.keys(handlers) as Method[];

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const handler = handlers[(req.method ?? "GET") as Method];

    if (handler === undefined) {
      res.setHeader("Allow", allowed);
      res.status(405).json({ message: "지원하지 않는 방식입니다." });
      return;
    }

    await handler(req, res);
  };
}

// 주소에서 id 를 꺼냅니다. 배열로 올 수도 있어 확인이 필요합니다.
export function getIdParam(req: NextApiRequest): string | null {
  const { id } = req.query;
  return typeof id === "string" ? id : null;
}
