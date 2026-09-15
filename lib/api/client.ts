const API_BASE = "/api";

export type ApiResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly status: number; readonly message: string };

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

function isAuthProbe(path: string): boolean {
  return path.startsWith("/auth/");
}

const CSRF_COOKIE = "pingcheck_csrf";

function readCsrfToken(): string {
  if (typeof document === "undefined") return "";

  const found = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${CSRF_COOKIE}=`));

  return found === undefined ? "" : decodeURIComponent(found.slice(CSRF_COOKIE.length + 1));
}

export type RequestOptions = { readonly background?: boolean };

function contentTypeOf(body: unknown): string {
  return typeof body === "string" ? "text/csv; charset=utf-8" : "application/json";
}

function buildHeaders(body: unknown, options?: RequestOptions): HeadersInit {
  const headers: Record<string, string> = {};

  if (body !== undefined) headers["Content-Type"] = contentTypeOf(body);

  const token = readCsrfToken();
  if (token !== "") headers["X-CSRF-Token"] = token;

  if (options?.background === true) headers["X-Background"] = "1";

  return headers;
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: buildHeaders(body, options),
      body:
        body === undefined
          ? undefined
          : typeof body === "string"
            ? body
            : JSON.stringify(body),
      credentials: "include",
    });

    const data: unknown =
      res.status === 204 ? null : await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        typeof data === "object" && data !== null && "message" in data
          ? String((data as { message: unknown }).message)
          : "요청을 처리하지 못했습니다.";

      if (res.status === 401 && !isAuthProbe(path)) {
        onUnauthorized?.();
      }

      return { ok: false, status: res.status, message };
    }

    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, message: "서버에 연결하지 못했습니다." };
  }
}

export const api = {
  get: <T,>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),
  post: <T,>(path: string, body: unknown) => request<T>("POST", path, body),
  postCsv: <T,>(path: string, text: string) => request<T>("POST", path, text),
  put: <T,>(path: string, body: unknown) => request<T>("PUT", path, body),
  patch: <T,>(path: string, body: unknown) => request<T>("PATCH", path, body),
  remove: <T,>(path: string) => request<T>("DELETE", path),
};

export async function ensureCsrfToken(): Promise<void> {
  if (readCsrfToken() !== "") return;

  await request("GET", "/time", undefined, { background: true });
}
