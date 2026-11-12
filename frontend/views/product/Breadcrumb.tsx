"use client";

import Link from "next/link";
import { Fragment } from "react";
import { useI18n } from "@/controllers/useI18n";
import styles from "./Breadcrumb.module.css";

export default function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  const { t } = useI18n();
  return (
    <nav className={styles.crumbs} aria-label={t.product.breadcrumb}>
      {items.map((it, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <svg className={styles.sep} width="6" height="10" viewBox="0 0 6 10" fill="none" aria-hidden>
              <path d="m1 1 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {it.href ? <Link href={it.href}>{it.label}</Link> : <span>{it.label}</span>}
        </Fragment>
      ))}
    </nav>
  );
}
