import type { Locale } from "./config";

/**
 * 원화 → 달러 환산 기준. 백엔드 수집 규칙(sourcing.usd-krw-rate, 기본 1400)과 같은 값을 쓴다.
 * 영미권 상품은 설명란의 달러 가격을 이 비율로 원화 저장했으므로, 같은 비율로 되돌리면 원래 가격과 거의 같다.
 */
export const USD_KRW_RATE = Number(process.env.NEXT_PUBLIC_USD_KRW_RATE) || 1400;

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/**
 * 가격은 백엔드 기준 통화(원화)로 저장·계산하고, 표시만 시장에 맞춘다.
 * 한국어(한국 시장) = 원, 영어(영미권 시장) = 달러.
 * 합계는 원화로 먼저 더한 뒤 한 번만 환산해서, 줄마다 반올림한 값을 더할 때 생기는 1센트 오차를 막는다.
 */
export function formatPrice(locale: Locale, n: number) {
  return locale === "ko" ? `${n.toLocaleString("ko-KR")}원` : usd.format(n / USD_KRW_RATE);
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
