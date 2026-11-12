/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Category, Site } from "@/models/types";
import CartLink from "./CartLink";
import CategoryNav from "./CategoryNav";
import SearchBox from "./SearchBox";
import styles from "./Header.module.css";

export default function Header({ site, categories }: { site: Site; categories: Category[] }) {
  const { brand, features } = site;
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link href="/" className={styles.logo}>
          {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} className={styles.logoImage} /> : brand.name}
        </Link>
        <CategoryNav categories={categories} variant="desktop" />
        <SearchBox />
        <Link href="/orders" className={styles.link}>
          주문조회
        </Link>
        {features.cart && <CartLink />}
      </div>
      <CategoryNav categories={categories} variant="mobile" />
    </header>
  );
}
