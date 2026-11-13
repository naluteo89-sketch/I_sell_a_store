import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_PROVIDERS, isProviderId } from "@/lib/auth/providers";
import type { AuthProviderId, AuthUser, LoginForm, NicknameStatus, SignupForm } from "@/models/types";

/**
 * M — 로그인 API (규격: docs/auth-api.md)
 *
 * 다른 API 와 달리 백엔드 주소(8080)가 아니라 같은 출처(/api/auth/…)로 부른다.
 * next.config 의 rewrites 가 백엔드로 넘겨 주므로, 세션 쿠키(HttpOnly)가 프론트 주소에 붙고
 * CORS·서드파티 쿠키 문제가 생기지 않는다.
 */

export class AuthError extends Error {
  constructor(public status: number, public code?: string, message?: string) {
    super(message ?? code ?? `HTTP ${status}`);
  }
}

/** Spring Security CookieCsrfTokenRepository 가 내려주는 XSRF-TOKEN 쿠키 → X-XSRF-TOKEN 헤더 */
function readXsrf() {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : undefined;
}

async function ensureXsrf() {
  if (readXsrf()) return;
  await fetch("/api/auth/csrf", { credentials: "same-origin", cache: "no-store" }).catch(() => undefined);
}

async function call<T>(path: string, method: "GET" | "POST" | "PUT" | "DELETE" = "GET", body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") {
    await ensureXsrf();
    const token = readXsrf();
    if (token) headers["X-XSRF-TOKEN"] = token;
  }
  const res = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) {
    const b = await res.json().catch(() => null);
    throw new AuthError(res.status, b?.code, b?.message);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const authApi = {
  /** 지금 로그인한 사람. 비로그인이면 null (401) */
  async me(): Promise<AuthUser | null> {
    try {
      return await call<AuthUser>("/api/auth/me");
    } catch (e) {
      if (e instanceof AuthError && e.status === 401) return null;
      throw e;
    }
  },

  login: (form: LoginForm) =>
    call<AuthUser>("/api/auth/login", "POST", { email: form.email.trim(), password: form.password, remember: form.remember }),

  signup: (form: SignupForm, lang: Locale) =>
    call<AuthUser>("/api/auth/signup", "POST", {
      email: form.email.trim(),
      password: form.password,
      nickname: form.nickname.trim() || undefined,
      agreePrivacy: form.agreePrivacy,
      lang,
    }),

  logout: () => call<void>("/api/auth/logout", "POST"),

  /** 가입 화면에 미리 채울 추천 닉네임 */
  suggestNickname: (lang: Locale) =>
    call<{ nickname: string }>(`/api/auth/nickname/suggest?lang=${lang}`).then((r) => r.nickname),

  checkNickname: (nickname: string) =>
    call<{ status: NicknameStatus }>(`/api/auth/nickname/check?nickname=${encodeURIComponent(nickname.trim())}`).then((r) => r.status),

  changeNickname: (nickname: string) => call<AuthUser>("/api/auth/me/nickname", "PUT", { nickname: nickname.trim() }),

  /** 이 시장에서 켜 둔 소셜 로그인. 백엔드가 아직 없으면 언어별 기본값 */
  async providers(lang: Locale): Promise<AuthProviderId[]> {
    try {
      const res = await call<{ providers: string[] }>(`/api/auth/providers?lang=${lang}`);
      return res.providers.filter(isProviderId);
    } catch {
      return DEFAULT_PROVIDERS[lang];
    }
  },
};
