import { methodHandler } from "@/lib/api/handler";
import { queryLogs } from "@/lib/logs/logStore";
import { LOG_TYPES, type LogQuery, type LogType } from "@/lib/logs/types";
import { BUSINESS_DIVISIONS, type BusinessDivisionId } from "@/lib/businessDivisions";

// 주소 뒤에 붙는 값은 배열로 올 수도 있어 한 개만 꺼냅니다.
function one(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function toPositiveInt(value: string, fallback: number, max: number): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.floor(parsed), max);
}

// GET /api/logs?page=1&pageSize=50&from=&to=&serverId=&type=&divisionId=
//
// 조건과 쪽 번호를 받아 그 쪽만 돌려줍니다.
// 전체를 내려보내지 않는 이유는 lib/logs/logStore.ts 주석 참고.
export default methodHandler({
  GET: async (req, res) => {
    const type = one(req.query.type);
    const divisionId = one(req.query.divisionId);

    const query: LogQuery = {
      page: toPositiveInt(one(req.query.page), 1, 100_000),
      // 한 번에 너무 많이 요청하지 못하게 막습니다.
      pageSize: toPositiveInt(one(req.query.pageSize), 50, 200),
      from: one(req.query.from),
      to: one(req.query.to),
      serverId: one(req.query.serverId),
      type: LOG_TYPES.includes(type as LogType) ? (type as LogType) : "",
      divisionId: BUSINESS_DIVISIONS.some((d) => d.id === divisionId)
        ? (divisionId as BusinessDivisionId)
        : "",
    };

    res.status(200).json(await queryLogs(query));
  },
});
