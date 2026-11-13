/**
 * 로그인 뒤 돌아갈 주소. 외부 주소로 튕기는 오픈 리다이렉트를 막기 위해
 * 같은 사이트 안의 경로(/로 시작, // 나 /\ 아님)만 허용한다.
 */
export function safeNext(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.startsWith("/login") || value.startsWith("/signup") || value.startsWith("/auth/")) return fallback;
  return value;
}

const KEY = "auth:next";

/** SSO 는 다른 사이트를 다녀오므로, 출발 전에 돌아올 곳을 탭 저장소에 적어 둔다 */
export function rememberNext(next: string) {
  try {
    sessionStorage.setItem(KEY, safeNext(next));
  } catch {
    /* 저장소를 못 쓰면 홈으로 돌아간다 */
  }
}

export function takeNext(): string {
  try {
    const v = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return safeNext(v);
  } catch {
    return "/";
  }
}

export const loginHref = (next?: string) =>
  next && safeNext(next) !== "/" ? `/login?next=${encodeURIComponent(safeNext(next))}` : "/login";
