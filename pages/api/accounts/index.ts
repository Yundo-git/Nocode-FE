import { methodHandler } from "@/lib/api/handler";
import { listAccounts } from "@/lib/accounts/accountStore";

// GET /api/accounts  계정 목록
export default methodHandler({
  GET: async (_req, res) => {
    res.status(200).json(await listAccounts());
  },
});
