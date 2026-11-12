"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { createI18n, type I18n } from "@/lib/i18n/i18n";

const I18nContext = createContext<I18n>(createI18n("ko"));

/** layout.tsx 에서 서버가 정한 언어를 내려받아 클라이언트 컴포넌트에 공유한다 */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(() => createI18n(locale), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** C — 화면 문구·가격 표기 */
export const useI18n = () => useContext(I18nContext);

/** C — 언어 바꾸기: 쿠키 저장 후 서버 컴포넌트까지 다시 그린다 */
export function useSwitchLocale() {
  const router = useRouter();
  return (next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    document.documentElement.lang = next;
    router.refresh();
  };
}
