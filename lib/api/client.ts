// 브라우저에서 API 를 부르는 곳입니다.
//
// fetch 를 화면 곳곳에 흩어 두면 나중에 바꿀 때 빠뜨리기 쉽습니다.
// 여기 한 곳만 고치면 아래가 전부 따라옵니다.
//
// ★ API 는 별도 서비스(pingcheck-be)가 냅니다.
//   하지만 주소는 그대로 "/api" 입니다.
//   next.config.ts 의 rewrite 가 /api/* 를 백엔드로 넘겨 주기 때문입니다.
//
//   왜 직접 4000 번을 부르지 않는가:
//   주소가 다르면 브라우저가 "다른 출처" 로 보아 CORS 가 필요하고,
//   쿠키도 조건이 까다로워집니다. rewrite 를 쓰면 브라우저에게는
//   같은 주소라서 쿠키가 그냥 실립니다.
const API_BASE = "/api";

// 성공이면 값을, 실패면 상태 코드와 문구를 담습니다.
// 상태 코드를 남기는 이유는 부르는 쪽이 409(중복) 같은 것을 구분해야 하기 때문입니다.
export type ApiResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly status: number; readonly message: string };

// ── CSRF 토큰 ───────────────────────────────────────────────────────────
//
// 백엔드가 pingcheck_csrf 쿠키를 심어 줍니다.
// 그 값을 읽어 헤더에도 같이 실어 보내야 상태를 바꾸는 요청이 통과합니다.
//
// 나쁜 페이지는 남의 출처 쿠키를 읽지 못해 이 헤더를 채울 수 없습니다.
// 쿠키는 자동으로 붙지만 헤더는 못 붙이는 차이를 이용하는 방식입니다.
const CSRF_COOKIE = "pingcheck_csrf";

function readCsrfToken(): string {
  if (typeof document === "undefined") return "";

  const found = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${CSRF_COOKIE}=`));

  return found === undefined ? "" : decodeURIComponent(found.slice(CSRF_COOKIE.length + 1));
}

function buildHeaders(hasBody: boolean): HeadersInit {
  const headers: Record<string, string> = {};

  if (hasBody) headers["Content-Type"] = "application/json";

  const token = readCsrfToken();
  if (token !== "") headers["X-CSRF-Token"] = token;

  return headers;
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: buildHeaders(body !== undefined),
      body: body === undefined ? undefined : JSON.stringify(body),
      // 세션 쿠키를 실어 보냅니다. 없으면 로그인해도 매번 401 이 납니다.
      credentials: "include",
    });

    // 204(본문 없음)처럼 JSON 이 아닐 수도 있어 감싸 둡니다.
    const data: unknown =
      res.status === 204 ? null : await res.json().catch(() => null);

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
  put: <T,>(path: string, body: unknown) => request<T>("PUT", path, body),
  patch: <T,>(path: string, body: unknown) => request<T>("PATCH", path, body),
  remove: <T,>(path: string) => request<T>("DELETE", path),
};

/**
 * 백엔드가 CSRF 쿠키를 심도록 한 번 불러 둡니다.
 *
 * 로그인은 상태를 바꾸는 요청이라 CSRF 토큰이 필요한데,
 * 처음 방문한 사람은 아직 쿠키가 없습니다. 그래서 먼저 읽기 요청을 하나 보냅니다.
 */
export async function ensureCsrfToken(): Promise<void> {
  if (readCsrfToken() !== "") return;

  await request("GET", "/time");
}
