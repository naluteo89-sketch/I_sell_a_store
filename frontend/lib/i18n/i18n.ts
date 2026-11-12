import { HTML_LANG, type Locale } from "./config";
import { dictionaries, type Dict } from "./dictionaries";
import { formatDate, formatPrice, formatRelative, formatViews } from "./format";

/** 화면에서 쓰는 번역 묶음 (서버 getI18n · 클라이언트 useI18n 이 같은 모양을 돌려준다) */
export type I18n = {
  locale: Locale;
  htmlLang: string;
  t: Dict;
  price: (n: number) => string;
  views: (n: number) => string;
  date: (iso: string) => string;
  relative: (iso: string) => string;
  /** DB 카테고리 이름은 한국어라, 영어일 때는 slug 로 번역을 찾고 없으면 원래 이름 */
  category: (slug: string | null | undefined, fallback: string | null | undefined) => string;
};

export function createI18n(locale: Locale): I18n {
  const t = dictionaries[locale];
  return {
    locale,
    htmlLang: HTML_LANG[locale],
    t,
    price: (n) => formatPrice(locale, n),
    views: (n) => formatViews(locale, n),
    date: (iso) => formatDate(locale, iso),
    relative: (iso) => formatRelative(locale, iso),
    category: (slug, fallback) => (slug && t.categories[slug]) || fallback || "",
  };
}
