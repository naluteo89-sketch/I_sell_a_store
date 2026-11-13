/** 지원 언어와 감지 규칙 (서버·클라이언트 공용, 순수 함수만) */
export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_COOKIE = "lang";

export const isLocale = (v: unknown): v is Locale => typeof v === "string" && (LOCALES as readonly string[]).includes(v);

/**
 * 접속한 사람이 한국권인지 영미권인지:
 * 1) 사용자가 직접 고른 언어(쿠키)
 * 2) 브라우저 언어(Accept-Language) — 한국어면 ko, 그 밖의 언어는 en
 * 3) 접속 국가 — 배포 환경이 알려 줄 때만 (Vercel: x-vercel-ip-country, Cloudflare: cf-ipcountry). KR 이면 ko
 * 4) 기본값 ko
 * 브라우저 언어를 국가보다 먼저 보는 이유: 해외에 있는 한국 사용자·한국에 있는 외국인을 각자 언어로 맞추기 위해
 */
export function resolveLocale(cookieValue: string | undefined, acceptLanguage: string | null, country?: string | null): Locale {
  if (isLocale(cookieValue)) return cookieValue;
  const first = acceptLanguage?.split(",")[0]?.trim().toLowerCase() ?? "";
  if (first) return first.startsWith("ko") ? "ko" : "en";
  if (country) return country.toUpperCase() === "KR" ? "ko" : "en";
  return DEFAULT_LOCALE;
}

export const HTML_LANG: Record<Locale, string> = { ko: "ko", en: "en" };
