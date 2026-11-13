"use client";

import { useI18n } from "@/controllers/useI18n";
import styles from "./SearchBox.module.css";

/**
 * 검색: 스크립트 없이도 /products?q= 로 이동하는 기본 폼.
 * 헤더에서 가장 눈에 띄는 입력칸 — 밝은 면 + 브랜드색 윤곽 + 오른쪽 [검색] 버튼
 */
export default function SearchBox() {
  const { t } = useI18n();
  return (
    <form action="/products" className={styles.form} role="search">
      <span className={styles.icon} aria-hidden>
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.8" />
          <path d="m11 11 3.25 3.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <input type="search" name="q" placeholder={t.nav.searchPlaceholder} aria-label={t.nav.searchPlaceholder}
        className={styles.input} enterKeyHint="search" autoComplete="off" />
      <button type="submit" className={styles.submit}>{t.nav.search}</button>
    </form>
  );
}
