"use client";

import { useState } from "react";
import { useI18n } from "@/controllers/useI18n";
import { THEME_COLOR, THEME_COOKIE, type ThemeMode } from "@/lib/themeMode";
import styles from "./ThemeToggle.module.css";

/**
 * 다크(고딕) ↔ 라이트(화이트 초콜릿) 전환.
 * 새로고침 없이 <html data-theme> 만 바꾸고, 쿠키에 1년 기억한다.
 */
export default function ThemeToggle({ initial }: { initial: ThemeMode }) {
  const { t } = useI18n();
  const [mode, setMode] = useState<ThemeMode>(initial);

  const toggle = () => {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    const html = document.documentElement;
    html.classList.add("theme-switching");
    html.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[next]);
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    window.setTimeout(() => html.classList.remove("theme-switching"), 400);
    setMode(next);
  };

  const dark = mode === "dark";
  return (
    <button type="button" className={styles.toggle} onClick={toggle} aria-pressed={!dark}
      aria-label={t.nav.lightMode} title={dark ? t.nav.toLight : t.nav.toDark}>
      {dark ? (
        /* 초승달 — 지금 다크 */
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M16.5 12.6A7 7 0 0 1 7.4 3.5a7 7 0 1 0 9.1 9.1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M14 3.2v2.2M12.9 4.3h2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ) : (
        /* 초콜릿 조각 — 지금 화이트 초콜릿 */
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      )}
    </button>
  );
}
