"use client";

import Link from "next/link";
import { useI18n } from "@/controllers/useI18n";
import { listHref, VIEW_COOKIE, type ListQuery, type ListView } from "@/lib/productList";
import styles from "./ViewToggle.module.css";

const VIEWS: ListView[] = ["products", "videos"];

/** 보기 방식 [상품별 | 영상별]. 고른 방식은 쿠키에 1년 기억 */
export default function ViewToggle({ query, view }: { query: ListQuery; view: ListView }) {
  const { t } = useI18n();
  const remember = (v: ListView) => {
    document.cookie = `${VIEW_COOKIE}=${v}; path=/; max-age=31536000; samesite=lax`;
  };
  return (
    <div className={styles.toggle} role="group" aria-label={t.list.viewLabel}>
      {VIEWS.map((v) => (
        <Link key={v} href={listHref(query, { view: v })} onClick={() => remember(v)}
          className={v === view ? styles.active : styles.option} aria-current={v === view ? "true" : undefined}>
          {v === "products" ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="9" width="5.5" height="5.5" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <rect x="1.5" y="2.5" width="13" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 5v3l2.4-1.5L7 5Z" fill="currentColor" />
              <circle cx="4" cy="13.5" r="1" fill="currentColor" />
              <circle cx="8" cy="13.5" r="1" fill="currentColor" />
              <circle cx="12" cy="13.5" r="1" fill="currentColor" />
            </svg>
          )}
          {t.list.views[v]}
        </Link>
      ))}
    </div>
  );
}
