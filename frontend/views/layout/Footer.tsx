"use client";

import Link from "next/link";
import { useI18n } from "@/controllers/useI18n";
import type { Brand } from "@/models/types";
import styles from "./Footer.module.css";

export default function Footer({ brand }: { brand: Brand }) {
  const { t } = useI18n();
  const support = t.footer.support(brand.phone, brand.email);
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <p className={styles.name} translate="no">{brand.name}</p>
          {brand.tagline && <p className={styles.tagline}>{brand.tagline}</p>}
        </div>
        <nav className={styles.links}>
          <Link href="/products">{t.list.allProducts}</Link>
          <Link href="/videos">{t.nav.videos}</Link>
          <Link href="/community">{t.nav.community}</Link>
          <Link href="/orders">{t.nav.orders}</Link>
        </nav>
        <div className={styles.meta}>
          {support && <p>{support}</p>}
          {brand.businessInfo && <p>{brand.businessInfo}</p>}
        </div>
      </div>
    </footer>
  );
}
