"use client";

import { useI18n, useSwitchLocale } from "@/controllers/useI18n";
import { LOCALES } from "@/lib/i18n/config";
import styles from "./LanguageSwitcher.module.css";

const LABEL = { ko: "한", en: "EN" } as const;
const NAME = { ko: "한국어", en: "English" } as const;

/** 한 / EN 토글. 고른 언어는 쿠키에 저장되어 다음 방문에도 유지된다 */
export default function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const switchTo = useSwitchLocale();
  return (
    <div className={styles.switcher} role="group" aria-label={t.meta.languageLabel}>
      {LOCALES.map((l) => (
        <button key={l} type="button" lang={l} aria-label={NAME[l]} aria-pressed={l === locale}
          className={l === locale ? styles.active : styles.option} onClick={() => l !== locale && switchTo(l)}>
          {LABEL[l]}
        </button>
      ))}
    </div>
  );
}
