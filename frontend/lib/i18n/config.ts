/** 지원 언어와 감지 규칙 (서버·클라이언트 공용, 순수 함수만) */
export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_COOKIE = "lang";

export const isLocale = (v: unknown): v is Locale => typeof v === "string" && (LOCALES as readonly string[]).includes(v);

/**
 * 1) 사용자가 고른 언어(쿠키) → 2) 브라우저 언어(Accept-Language) → 3) 기본값
 * 한국어 브라우저면 ko, 그 밖의 언어(영미권 등)는 en 으로 보여준다.
 */
export function resolveLocale(cookieValue: string | undefined, acceptLanguage: string | null): Locale {
  if (isLocale(cookieValue)) return cookieValue;
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const first = acceptLanguage.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("ko") ? "ko" : "en";
}

export const HTML_LANG: Record<Locale, string> = { ko: "ko", en: "en" };
