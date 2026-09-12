import { methodHandler } from "@/lib/api/handler";
import { readSettings, setMaintenanceMode } from "@/lib/settings/settingsStore";

// GET   /api/settings                시스템 설정 읽기
// PATCH /api/settings                { maintenanceMode: boolean, by?: string }
//
// 지금은 요청자가 누구인지 확인하지 못합니다. 세션이 없기 때문입니다.
// by 는 화면이 알려 준 값을 그대로 적어 두는 것뿐이라 믿을 수 없습니다.
export default methodHandler({
  GET: async (_req, res) => {
    res.status(200).json(await readSettings());
  },

  PATCH: async (req, res) => {
    const body: unknown = req.body;

    if (typeof body !== "object" || body === null) {
      res.status(400).json({ message: "입력값이 올바르지 않습니다." });
      return;
    }

    const raw = body as Record<string, unknown>;

    if (typeof raw.maintenanceMode !== "boolean") {
      res.status(400).json({ message: "maintenanceMode 값이 필요합니다." });
      return;
    }

    const by = typeof raw.by === "string" ? raw.by : null;
    const updated = await setMaintenanceMode(raw.maintenanceMode, by);

    if (updated === null) {
      res.status(500).json({ message: "설정을 저장하지 못했습니다." });
      return;
    }

    res.status(200).json(updated);
  },
});
