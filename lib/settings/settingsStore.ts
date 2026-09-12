import { DEFAULT_SETTINGS, type SystemSettings } from "@/lib/settings/types";
import { createJsonStore, patchById } from "@/lib/storage/jsonStore";

// 이 파일은 API 라우트에서만 불러옵니다.
//
// 값이 하나뿐이지만 저장 방식은 다른 것들과 같게 맞췄습니다.
// (줄이 하나뿐인 목록으로 둡니다)
const store = createJsonStore<SystemSettings>("settings.json", [
  DEFAULT_SETTINGS,
]);

export async function readSettings(): Promise<SystemSettings> {
  const rows = await store.read();
  return rows[0] ?? DEFAULT_SETTINGS;
}

export function setMaintenanceMode(
  on: boolean,
  by: string | null,
): Promise<SystemSettings | null> {
  return store.update((rows) =>
    patchById(rows, "system", {
      maintenanceMode: on,
      // 끌 때는 누가 언제 켰는지 기록을 지웁니다.
      maintenanceSince: on ? new Date().toISOString() : null,
      maintenanceBy: on ? by : null,
    }),
  );
}
