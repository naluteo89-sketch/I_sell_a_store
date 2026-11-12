"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useI18n } from "@/controllers/useI18n";
import type { Category, Site } from "@/models/types";
import CartLink from "./CartLink";
import CategoryNav from "./CategoryNav";
import LanguageSwitcher from "./LanguageSwitcher";
import SearchBox from "./SearchBox";
import styles from "./Header.module.css";

/** 화면 위에 떠 있는 둥근 캡슐 헤더 */
export default function Header({ site, categories }: { site: Site; categories: Category[] }) {
  const { brand, features } = site;
  const { t } = useI18n();
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link href="/" className={styles.logo} translate="no">
          {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} className={styles.logoImage} /> : brand.name}
        </Link>
        <CategoryNav categories={categories} variant="desktop" />
        <SearchBox />
        <nav className={styles.links} aria-label={t.nav.main}>
          <Link href="/videos" className={styles.link}>
            {t.nav.videos}
          </Link>
          <Link href="/community" className={styles.link}>
            {t.nav.community}
          </Link>
          <Link href="/orders" className={styles.link}>
            {t.nav.orders}
          </Link>
        </nav>
        <LanguageSwitcher />
        {features.cart && <CartLink />}
      </div>
      <CategoryNav categories={categories} variant="mobile" />
    </header>
  );
}
