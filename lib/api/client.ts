// 브라우저에서 API 를 부르는 곳입니다.
//
// fetch 를 화면 곳곳에 흩어 두면 나중에 바꿀 때 빠뜨리기 쉽습니다.
// 여기 한 곳만 고치면 아래가 전부 따라옵니다.
// - 백엔드가 다른 주소로 분리될 때 (API_BASE)
// - 토큰 같은 인증 헤더를 붙일 때 (buildHeaders)
// - 실패했을 때의 공통 처리
const API_BASE = "/api";

// 성공이면 값을, 실패면 상태 코드와 문구를 담습니다.
// 상태 코드를 남기는 이유는 부르는 쪽이 409(중복) 같은 것을 구분해야 하기 때문입니다.
export type ApiResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly status: number; readonly message: string };

function buildHeaders(hasBody: boolean): HeadersInit {
  // 인증이 붙으면 여기에 Authorization 을 더하면 됩니다.
  return hasBody ? { "Content-Type": "application/json" } : {};
}

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: buildHeaders(body !== undefined),
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    // 본문이 없거나 JSON 이 아닐 수도 있어 감싸 둡니다.
    const data: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        typeof data === "object" && data !== null && "message" in data
          ? String((data as { message: unknown }).message)
          : "요청을 처리하지 못했습니다.";

      return { ok: false, status: res.status, message };
    }

    return { ok: true, data: data as T };
  } catch {
    // 네트워크가 끊겼거나 서버가 응답하지 않는 경우입니다.
    return { ok: false, status: 0, message: "서버에 연결하지 못했습니다." };
  }
}

export const api = {
  get: <T,>(path: string) => request<T>("GET", path),
  post: <T,>(path: string, body: unknown) => request<T>("POST", path, body),
  patch: <T,>(path: string, body: unknown) => request<T>("PATCH", path, body),
};
