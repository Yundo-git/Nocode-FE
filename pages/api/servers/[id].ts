import type { NextApiRequest, NextApiResponse } from "next";
import { setServerEnabled } from "@/lib/servers/serverStore";

// PATCH /api/servers/:id   사용여부(핑 발송) 켜고 끄기
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    res.status(405).json({ message: "지원하지 않는 방식입니다." });
    return;
  }

  const { id } = req.query;

  if (typeof id !== "string") {
    res.status(400).json({ message: "잘못된 주소입니다." });
    return;
  }

  const body: unknown = req.body;
  const enabled =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>).enabled
      : undefined;

  if (typeof enabled !== "boolean") {
    res.status(400).json({ message: "enabled 값이 필요합니다." });
    return;
  }

  const updated = await setServerEnabled(id, enabled);

  if (updated === null) {
    res.status(404).json({ message: "서버를 찾을 수 없습니다." });
    return;
  }

  res.status(200).json(updated);
}
