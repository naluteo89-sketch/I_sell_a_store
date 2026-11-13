"use client";

import Link from "next/link";
import { useI18n } from "@/controllers/useI18n";
import styles from "./Pagination.module.css";

/**
 * 페이지 이동. 서버 컴포넌트에서는 함수를 넘길 수 없으므로 baseHref(문자열)도 받는다 → ?page=N 을 붙임
 */
export default function Pagination({ page, totalPages, hrefFor: hrefForProp, baseHref }: {
  page: number;
  totalPages: number;
  hrefFor?: (p: number) => string;
  baseHref?: string;
}) {
  const { t } = useI18n();
  const hrefFor = hrefForProp ?? ((p: number) => {
    const base = baseHref ?? "";
    return p <= 1 ? base || "?" : `${base}${base.includes("?") ? "&" : "?"}page=${p}`;
  });
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages);
  return (
    <nav className={styles.pager} aria-label={t.common.pagination}>
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className={styles.step} aria-label={t.community.prev}>
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden><path d="M6.5 1 1.5 6l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className={styles.group}>
          {i > 0 && p - pages[i - 1] > 1 && <span className={styles.gap}>…</span>}
          <Link href={hrefFor(p)} className={p === page ? styles.current : styles.page} aria-current={p === page ? "page" : undefined}>
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className={styles.step} aria-label={t.community.next}>
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden><path d="m1.5 1 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      )}
    </nav>
  );
}
