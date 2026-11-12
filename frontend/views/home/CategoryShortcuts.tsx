"use client";

import Link from "next/link";
import { useI18n } from "@/controllers/useI18n";
import type { Category } from "@/models/types";
import styles from "./CategoryShortcuts.module.css";

/** 카테고리 바로가기: 둥근 큰 알약 */
export default function CategoryShortcuts({ categories }: { categories: Category[] }) {
  const { t, category } = useI18n();
  if (categories.length === 0) return null;
  return (
    <div className={styles.grid}>
      {categories.map((c) => (
        <Link key={c.slug} href={`/products?category=${c.slug}`} className={styles.tile}>
          <span className={styles.name}>{category(c.slug, c.name)}</span>
          <span className={styles.hint}>{t.home.shortcut}</span>
        </Link>
      ))}
    </div>
  );
}
