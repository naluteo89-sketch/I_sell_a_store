"use client";

import Link from "next/link";
import { cartCount, useCart } from "@/controllers/useCart";
import { useI18n } from "@/controllers/useI18n";
import { useMounted } from "@/controllers/useMounted";
import styles from "./CartLink.module.css";

export default function CartLink() {
  const count = useCart((s) => cartCount(s.lines));
  const mounted = useMounted();
  const { t } = useI18n();
  return (
    <Link href="/cart" className={styles.link} aria-label={t.nav.cart}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M3 4.5h1.6c.5 0 .9.3 1 .8l1.5 7.2c.1.5.5.8 1 .8h6.6c.5 0 .9-.3 1-.8l1.1-5.1H6.2"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8.5" cy="16.5" r="1.2" fill="currentColor" />
        <circle cx="14.5" cy="16.5" r="1.2" fill="currentColor" />
      </svg>
      <span className={styles.label}>{t.nav.cart}</span>
      {mounted && count > 0 && <span className={styles.count}>{count}</span>}
    </Link>
  );
}
