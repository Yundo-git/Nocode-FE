import {
  deleteAccount,
  setAccountEnabled,
  setAccountNotify,
  updateAccountByAdmin,
  updateProfile,
} from "@/lib/accounts/accountStore";
import { parseAdminAccount, validateMyProfile } from "@/lib/accounts/validation";
import { getIdParam, methodHandler } from "@/lib/api/handler";

// PATCH /api/accounts/:id
//   { enabled: boolean }        계정 사용여부 켜고 끄기
//   { notifyEnabled: boolean }  알림 받기 켜고 끄기
//   { name, email, phone }      본인 정보 수정
//
// PATCH 는 아이디 / 소속 파트 / 권한을 받지 않습니다.
// 본인이 바꿀 수 없어야 하는 값이라 일부러 뺐습니다.
//
// PUT    /api/accounts/:id   관리자 수정 (아이디·소속 파트·권한까지)
// DELETE /api/accounts/:id   계정 삭제
//
// 지금은 요청자가 관리자인지 확인하지 못합니다. 세션이 없기 때문입니다.
export default methodHandler({
  PATCH: async (req, res) => {
    const id = getIdParam(req);

    if (id === null) {
      res.status(400).json({ message: "잘못된 주소입니다." });
      return;
    }

    const body: unknown = req.body;

    if (typeof body !== "object" || body === null) {
      res.status(400).json({ message: "입력값이 올바르지 않습니다." });
      return;
    }

    const raw = body as Record<string, unknown>;

    // 참거짓 하나만 바꾸는 요청들입니다.
    const flag =
      typeof raw.notifyEnabled === "boolean"
        ? { patch: setAccountNotify, value: raw.notifyEnabled }
        : typeof raw.enabled === "boolean"
          ? { patch: setAccountEnabled, value: raw.enabled }
          : null;

    if (flag !== null) {
      const updated = await flag.patch(id, flag.value);

      if (updated === null) {
        res.status(404).json({ message: "계정을 찾을 수 없습니다." });
        return;
      }

      res.status(200).json(updated);
      return;
    }

    const input = {
      name: typeof raw.name === "string" ? raw.name.trim() : "",
      email: typeof raw.email === "string" ? raw.email.trim() : "",
      phone: typeof raw.phone === "string" ? raw.phone.trim() : "",
    };

    const message = validateMyProfile(input);

    if (message) {
      res.status(400).json({ message });
      return;
    }

    const updated = await updateProfile(id, input);

    if (updated === null) {
      res.status(404).json({ message: "계정을 찾을 수 없습니다." });
      return;
    }

    res.status(200).json(updated);
  },

  PUT: async (req, res) => {
    const id = getIdParam(req);

    if (id === null) {
      res.status(400).json({ message: "잘못된 주소입니다." });
      return;
    }

    const input = parseAdminAccount(req.body);

    if (input === null) {
      res.status(400).json({ message: "입력값이 올바르지 않습니다." });
      return;
    }

    const result = await updateAccountByAdmin(id, input);

    if (!result.ok) {
      if (result.reason === "not-found") {
        res.status(404).json({ message: "계정을 찾을 수 없습니다." });
        return;
      }

      res.status(409).json({ message: "이미 쓰고 있는 아이디입니다." });
      return;
    }

    res.status(200).json(result.account);
  },

  DELETE: async (req, res) => {
    const id = getIdParam(req);

    if (id === null) {
      res.status(400).json({ message: "잘못된 주소입니다." });
      return;
    }

    const removed = await deleteAccount(id);

    if (!removed) {
      res.status(404).json({ message: "계정을 찾을 수 없습니다." });
      return;
    }

    res.status(204).end();
  },
});
