import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./config";
import { createI18n, type I18n } from "./i18n";

export async function getLocale(): Promise<Locale> {
  const [c, h] = await Promise.all([cookies(), headers()]);
  return resolveLocale(c.get(LOCALE_COOKIE)?.value, h.get("accept-language"));
}

/** 서버 컴포넌트(page.tsx, layout.tsx)용 */
export async function getI18n(): Promise<I18n> {
  return createI18n(await getLocale());
}
