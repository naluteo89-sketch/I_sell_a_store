import type { Locale } from "./config";

/** 가격은 백엔드 기준 통화(원화) 그대로, 표기만 언어에 맞춘다 */
export function formatPrice(locale: Locale, n: number) {
  return locale === "ko" ? `${n.toLocaleString("ko-KR")}원` : `₩${n.toLocaleString("en-US")}`;
}

export function formatViews(locale: Locale, n: number) {
  if (locale === "ko") {
    if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억회`;
    if (n >= 10_000) return `${Math.floor(n / 10_000).toLocaleString("ko-KR")}만회`;
    return `${n.toLocaleString("ko-KR")}회`;
  }
  return `${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)} views`;
}

export function formatDate(locale: Locale, iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", { year: "numeric", month: "short", day: "numeric" }).format(d);
}

/** "3분 전" / "3 min ago" — 커뮤니티 글 시간 */
export function formatRelative(locale: Locale, iso: string, now = Date.now()) {
  const diff = Math.round((new Date(iso).getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale === "ko" ? "ko" : "en", { numeric: "auto", style: "short" });
  const abs = Math.abs(diff);
  if (abs < 60) return rtf.format(diff, "second");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 7) return rtf.format(Math.round(diff / 86400), "day");
  return formatDate(locale, iso);
}
