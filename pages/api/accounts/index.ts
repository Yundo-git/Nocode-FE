import { createAccount, listAccounts } from "@/lib/accounts/accountStore";
import { parseAdminAccount } from "@/lib/accounts/validation";
import { methodHandler } from "@/lib/api/handler";

// GET  /api/accounts  계정 목록
// POST /api/accounts  계정 등록 (관리자)
//
// 지금은 요청자가 관리자인지 확인하지 못합니다. 세션이 없기 때문입니다.
// 화면에서 버튼을 숨기고 있을 뿐이라, 인증이 붙으면 여기서도 막아야 합니다.
export default methodHandler({
  GET: async (_req, res) => {
    res.status(200).json(await listAccounts());
  },

  POST: async (req, res) => {
    const input = parseAdminAccount(req.body);

    if (input === null) {
      res.status(400).json({ message: "입력값이 올바르지 않습니다." });
      return;
    }

    const result = await createAccount(input);

    if (!result.ok) {
      res.status(409).json({ message: "이미 쓰고 있는 아이디입니다." });
      return;
    }

    res.status(201).json(result.account);
  },
});
